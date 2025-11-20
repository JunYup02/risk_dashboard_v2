import os
import pandas as pd
import numpy as np
from supabase import create_client, Client
from dotenv import load_dotenv

# ---------------------------------------------------------
# 1. 설정 (Configuration)
# ---------------------------------------------------------
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PROCESSED_PATH = os.path.join(CURRENT_DIR, "..", "data", "processed")

def connect_supabase() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError("Error: .env 파일 확인 필요")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

# ---------------------------------------------------------
# 2. 로직 함수들
# ---------------------------------------------------------
def extract_region(address):
    """
    [심플 버전] 주소에서 지역명(서울시, 경기도 등)을 추출합니다.
    전국구 표준화 기능은 제외되었습니다.
    """
    if pd.isna(address) or str(address).strip() == "":
        return None
    
    # 1. 우편번호 제거
    addr_clean = str(address).split(')')[-1].strip()
    
    # 2. 첫 단어 추출
    tokens = addr_clean.split()
    if tokens:
        region = tokens[0]
        # 최소한의 정규화만 수행
        if region == '서울': return '서울시'
        if region == '경기': return '경기도'
        if region == '인천': return '인천광역시'
        if region == '부산': return '부산광역시'
        return region
    return None

def calculate_risk_ratios(df):
    # 0으로 나누기 등으로 인해 inf가 생성될 수 있음
    df['current_ratio'] = df['current_assets'] / df['current_liabilities'] * 100
    df['debt_to_equity_ratio'] = df['total_liabilities'] / df['total_equity'] * 100
    df['roe'] = df['net_income'] / df['total_equity'] * 100
    df['roa'] = df['operating_income'] / df['total_assets'] * 100
    df['interest_coverage_ratio'] = df['operating_income'] / df['interest_expense']
    
    A = (df['current_assets'] - df['current_liabilities']) / df['total_assets']
    B = df['retained_earnings'] / df['total_assets']
    C = df['operating_income'] / df['total_assets']
    D = df['total_equity'] / df['total_liabilities'] 
    E = df['revenue'] / df['total_assets']
    
    df['altman_z_score'] = (1.2 * A) + (1.4 * B) + (3.3 * C) + (0.6 * D) + (1.0 * E)
    return df

def sanitize_record(record):
    """
    [최종 안전장치]
    딕셔너리 내의 무한대(inf)와 NaN을 강제로 None으로 변환
    """
    new_record = {}
    for k, v in record.items():
        if isinstance(v, float):
            if np.isinf(v) or np.isnan(v):
                new_record[k] = None
            else:
                new_record[k] = v
        else:
            new_record[k] = v
    return new_record

def upload_in_batches(supabase: Client, table_name: str, data: list, batch_size=1000):
    total = len(data)
    print(f"Uploading {total} rows to '{table_name}'...")
    
    for i in range(0, total, batch_size):
        raw_batch = data[i : i + batch_size]
        safe_batch = [sanitize_record(row) for row in raw_batch]
        
        try:
            supabase.table(table_name).upsert(safe_batch).execute()
            print(f"  - Processed {i + len(safe_batch)} / {total}")
        except Exception as e:
            print(f"  [Error] Batch {i} failed: {e}")

# ---------------------------------------------------------
# 3. 메인 실행
# ---------------------------------------------------------
if __name__ == "__main__":
    try:
        print("Connecting to Supabase...")
        sb = connect_supabase()
        print("Success!")

        # 1. Companies 적재
        info_path = os.path.join(DATA_PROCESSED_PATH, "company_info.csv")
        if os.path.exists(info_path):
            print("\n[Processing Companies]")
            df_info = pd.read_csv(info_path)
            
            # 지역 추출 (심플 버전)
            df_info['region'] = df_info['address'].apply(extract_region)
            df_info = df_info.where(pd.notnull(df_info), None)
            
            upload_in_batches(sb, "companies", df_info.to_dict(orient='records'))
        else:
            print("Warning: company_info.csv not found.")

        # 2. Financial Reports 적재
        finance_path = os.path.join(DATA_PROCESSED_PATH, "finance_data_final.csv")
        if os.path.exists(finance_path):
            print("\n[Processing Financial Reports]")
            df_finance = pd.read_csv(finance_path)
            
            # [핵심 수정] 컬럼명 불일치 해결 (preprocess vs DB Schema)
            # 유동성장기부채 컬럼명이 다르면 DB에 맞게 변경
            if 'current_portion_of_lt_debt' in df_finance.columns:
                print("Renaming column 'current_portion_of_lt_debt' -> 'non_current_liabilities_current_portion'")
                df_finance.rename(columns={'current_portion_of_lt_debt': 'non_current_liabilities_current_portion'}, inplace=True)
            
            print("Calculating Risk Ratios...")
            df_finance = calculate_risk_ratios(df_finance)
            
            # Pandas 레벨 1차 정제
            df_finance = df_finance.where(pd.notnull(df_finance), None)
            
            upload_in_batches(sb, "financial_reports", df_finance.to_dict(orient='records'), batch_size=5000)
        else:
            print("Warning: finance_data_final.csv not found.")

        print("\nAll Tasks Completed Successfully!")
        
    except Exception as e:
        print(f"\n[Critical Error] {e}")