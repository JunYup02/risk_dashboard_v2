# loader.py
# 작성자: B.S.B 개발팀
# 설명: 전처리된 데이터(CSV)를 읽어와서 Supabase 데이터베이스에 적재하는 스크립트입니다.

import os
import pandas as pd  # 데이터 처리를 위한 판다스
import numpy as np   # 수학 연산 및 NaN(빈 값) 처리를 위한 넘파이
from supabase import create_client, Client # Supabase DB 연동 라이브러리
from dotenv import load_dotenv # .env 파일에서 환경변수(비밀키)를 불러오는 도구

# ---------------------------------------------------------
# 1. 설정 (Configuration)
# ---------------------------------------------------------
# .env 파일을 로드하여 비밀키 등을 환경변수로 등록합니다.
load_dotenv()

# 환경변수에서 Supabase 연결 정보를 가져옵니다.
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# 현재 파일(loader.py)의 위치를 기준으로 데이터 폴더 경로를 설정합니다.
# 이렇게 하면 어느 컴퓨터에서 실행하든 상대 경로가 깨지지 않습니다.
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PROCESSED_PATH = os.path.join(CURRENT_DIR, "..", "data", "processed")

def connect_supabase() -> Client:
    """
    Supabase 클라이언트 객체를 생성하여 반환합니다.
    URL이나 KEY가 없으면 에러를 발생시켜 실수를 방지합니다.
    """
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Error: .env 파일 확인 필요")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

# ---------------------------------------------------------
# 2. 로직 함수들 (데이터 가공 및 안전장치)
# ---------------------------------------------------------
def extract_region(address):
    """
    [주소 정제 함수]
    주소 문자열에서 '시/도' 정보를 추출하여 지역명으로 변환합니다.
    예: "경기도 수원시..." -> "경기도"
    """
    # 빈 값(NaN)이거나 빈 문자열이면 처리하지 않고 종료
    if pd.isna(address) or str(address).strip() == "":
        return None
    
    # 1. 우편번호 제거: 보통 주소 앞에 (12345) 형태가 있으므로 ')' 뒤의 글자만 가져옵니다.
    addr_clean = str(address).split(')')[-1].strip()
    
    # 2. 첫 단어 추출: 공백으로 자른 후 맨 앞 단어가 보통 지역명입니다.
    tokens = addr_clean.split()
    if tokens:
        region = tokens[0]
        # 데이터 통일성을 위해 주요 도시는 표준 명칭으로 변경합니다.
        if region == '서울': return '서울시'
        if region == '경기': return '경기도'
        if region == '인천': return '인천광역시'
        if region == '부산': return '부산광역시'
        return region
    return None

def calculate_risk_ratios(df):
    """
    [재무 비율 계산 함수]
    원천 데이터(자산, 부채 등)를 이용해 분석에 필요한 지표(비율, 점수)를 계산합니다.
    DB에 넣기 직전에 계산하여 최신 상태를 유지합니다.
    """
    # 주요 5대 지표 계산
    # *주의*: 분모가 0일 경우 무한대(inf)가 나올 수 있으므로, 후처리(sanitize_record)가 필수입니다.
    df['current_ratio'] = df['current_assets'] / df['current_liabilities'] * 100 # 유동비율
    df['debt_to_equity_ratio'] = df['total_liabilities'] / df['total_equity'] * 100 # 부채비율
    df['roe'] = df['net_income'] / df['total_equity'] * 100 # 자기자본이익률
    df['roa'] = df['operating_income'] / df['total_assets'] * 100 # 총자산이익률
    df['interest_coverage_ratio'] = df['operating_income'] / df['interest_expense'] # 이자보상배율
    
    # [Altman Z-Score 계산]
    # 기업의 부실 가능성을 예측하는 표준 공식입니다.
    A = (df['current_assets'] - df['current_liabilities']) / df['total_assets']
    B = df['retained_earnings'] / df['total_assets']
    C = df['operating_income'] / df['total_assets']
    D = df['total_equity'] / df['total_liabilities'] 
    E = df['revenue'] / df['total_assets']
    
    # Z-Score 공식 적용
    df['altman_z_score'] = (1.2 * A) + (1.4 * B) + (3.3 * C) + (0.6 * D) + (1.0 * E)
    return df

def sanitize_record(record):
    """
    [데이터 안전장치]
    Python의 'NaN'(Not a Number)이나 'Infinity'(무한대)는 
    데이터베이스(SQL)가 이해하지 못해 에러를 일으킵니다.
    이를 SQL의 'NULL'(=Python의 None)로 바꿔주는 함수입니다.
    """
    new_record = {}
    for k, v in record.items():
        if isinstance(v, float): # 값이 실수형(float)일 때만 검사
            if np.isinf(v) or np.isnan(v): # 무한대거나 숫자가 아니면
                new_record[k] = None # NULL로 변경
            else:
                new_record[k] = v
        else:
            new_record[k] = v
    return new_record

def upload_in_batches(supabase: Client, table_name: str, data: list, batch_size=1000):
    """
    [대용량 업로드 함수]
    데이터가 몇만 건일 경우 한 번에 보내면 타임아웃이나 용량 초과 에러가 납니다.
    따라서 데이터를 1000개씩(batch_size) 잘라서 나누어 보냅니다.
    """
    total = len(data)
    print(f"Uploading {total} rows to '{table_name}'...")
    
    # batch_size 간격으로 반복문 실행
    for i in range(0, total, batch_size):
        raw_batch = data[i : i + batch_size]
        
        # 각 행마다 안전장치(sanitize) 적용
        safe_batch = [sanitize_record(row) for row in raw_batch]
        
        try:
            # upsert: 데이터가 없으면 INSERT, 키가 겹치면 UPDATE (덮어쓰기)
            supabase.table(table_name).upsert(safe_batch).execute()
            print(f"  - Processed {i + len(safe_batch)} / {total}")
        except Exception as e:
            print(f"  [Error] Batch {i} failed: {e}")

# ---------------------------------------------------------
# 3. 메인 실행 (Main Execution)
# ---------------------------------------------------------
if __name__ == "__main__":
    try:
        print("Connecting to Supabase...")
        sb = connect_supabase()
        print("Success! DB Connection Established.")

        # --- [Step 1] 기업 정보(Companies) 적재 ---
        info_path = os.path.join(DATA_PROCESSED_PATH, "company_info.csv")
        
        if os.path.exists(info_path):
            print("\n[Processing Companies]")
            df_info = pd.read_csv(info_path)
            
            # 1. 지역 정보 추출 및 추가
            df_info['region'] = df_info['address'].apply(extract_region)
            
            # 2. Pandas의 NaN을 None으로 1차 변환
            df_info = df_info.where(pd.notnull(df_info), None)
            
            # 3. DB 업로드 실행
            upload_in_batches(sb, "companies", df_info.to_dict(orient='records'))
        else:
            print("Warning: company_info.csv not found.")

        # --- [Step 2] 재무 보고서(Financial Reports) 적재 ---
        finance_path = os.path.join(DATA_PROCESSED_PATH, "finance_data_final.csv")
        
        if os.path.exists(finance_path):
            print("\n[Processing Financial Reports]")
            df_finance = pd.read_csv(finance_path)
            
            # [중요 수정] DB 컬럼명과 CSV 컬럼명 불일치 해결
            # CSV의 'current_portion_of_lt_debt'를 DB의 'non_current_liabilities_current_portion'로 이름 변경
            if 'current_portion_of_lt_debt' in df_finance.columns:
                print("Renaming column 'current_portion_of_lt_debt' -> 'non_current_liabilities_current_portion'")
                df_finance.rename(columns={'current_portion_of_lt_debt': 'non_current_liabilities_current_portion'}, inplace=True)
            
            print("Calculating Risk Ratios...")
            # 1. 재무 비율 및 Z-Score 계산
            df_finance = calculate_risk_ratios(df_finance)
            
            # 2. Pandas 레벨 1차 정제
            df_finance = df_finance.where(pd.notnull(df_finance), None)
            
            # 3. DB 업로드 실행 (데이터가 많으므로 5000개씩)
            upload_in_batches(sb, "financial_reports", df_finance.to_dict(orient='records'), batch_size=5000)
        else:
            print("Warning: finance_data_final.csv not found.")

        print("\nAll Tasks Completed Successfully!")
        
    except Exception as e:
        print(f"\n[Critical Error] {e}")