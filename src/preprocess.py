# preprocess.py
# 작성자: B.S.B 개발팀
# 설명: Raw Data(원본 엑셀/CSV)를 읽어와 정제하고, 분석 가능한 형태(CSV)로 저장하는 전처리 스크립트입니다.

import pandas as pd # 데이터 처리를 위한 판다스 라이브러리
import glob         # 파일 경로 패턴 매칭을 위한 라이브러리 (예: *.csv)
import os           # 파일 경로 조작 및 폴더 생성을 위한 라이브러리
import re           # 문자열 패턴 매칭(정규표현식)을 위한 라이브러리

# ---------------------------------------------------------
# 1. 설정 (Configuration)
# ---------------------------------------------------------
# 현재 파일(preprocess.py)의 위치를 기준으로 데이터 폴더 경로를 설정합니다.
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_RAW_PATH = os.path.normpath(os.path.join(CURRENT_DIR, "..", "data", "raw"))       # 원본 데이터 폴더
DATA_PROCESSED_PATH = os.path.normpath(os.path.join(CURRENT_DIR, "..", "data", "processed")) # 가공된 데이터 저장 폴더

# 저장 폴더가 없으면 자동으로 생성합니다.
os.makedirs(DATA_PROCESSED_PATH, exist_ok=True)

# [계정과목 매핑 사전]
# 원본 파일의 한글 컬럼명을 영문 DB 컬럼명으로 변환하기 위한 규칙입니다.
# *주의*: '유동자산'과 '비유동자산'처럼 글자가 겹치는 경우 오매칭을 막기 위해 긴 단어부터 검사해야 합니다.
ACCOUNT_MAPPING = {
    "유동성장기부채": "current_portion_of_lt_debt", 
    "기타이익잉여금": "other_comprehensive_income",
    "비유동자산": "non_current_assets",
    "현금및현금성자산의증가": "change_in_cash_equivalents",
    "영업활동으로인한현금흐름": "operating_cash_flow",
    "투자활동으로인한현금흐름": "investing_cash_flow",
    "재무활동으로인한현금흐름": "financing_cash_flow",
    "판매비와관리비": "sga_expenses",
    "매출채권": "accounts_receivable",
    "매입채무": "accounts_payable",
    "이익잉여금": "retained_earnings",
    "유동자산": "current_assets",
    "유동부채": "current_liabilities",
    "자산총계": "total_assets",
    "부채총계": "total_liabilities",
    "자본총계": "total_equity",
    "자본금": "capital_stock",
    "매출원가": "cost_of_goods_sold",
    "영업이익": "operating_income",
    "당기순이익": "net_income",
    "이자비용": "interest_expense",
    "법인세비용": "income_tax_expense",
    "재고자산": "inventory",
    "수익": "revenue"
}

# [중요] 매핑 키를 글자 길이 순으로 내림차순 정렬합니다.
# 이유: '비유동자산'을 찾을 때 '유동자산'이 먼저 매칭되어 버리는 문제를 방지하기 위함입니다.
SORTED_MAPPING_KEYS = sorted(ACCOUNT_MAPPING.keys(), key=len, reverse=True)

# ---------------------------------------------------------
# 2. 유틸리티 함수
# ---------------------------------------------------------
def get_files():
    """
    raw 폴더에서 'VALUESearch'로 시작하는 데이터 파일들을 자동으로 찾아 분류합니다.
    Returns:
        info_file: 기업 정보 파일 경로 (하나)
        finance_files: 재무 데이터 파일 경로 리스트 (여러 개일 수 있음)
    """
    all_files = glob.glob(os.path.join(DATA_RAW_PATH, "VALUESearch*"))
    # 엑셀 임시 파일(~$...)은 제외하고 csv, xlsx만 선택
    valid_files = [f for f in all_files if not os.path.basename(f).startswith("~$") 
                   and f.lower().endswith(('.csv', '.xlsx'))]
    
    if not valid_files:
        raise FileNotFoundError(f"'{DATA_RAW_PATH}' 폴더에 데이터 파일이 없습니다.")

    info_file = None
    finance_files = []

    for f in valid_files:
        # 파일명에 괄호 숫자(예: (1), (2))가 있으면 재무 데이터 파일로 간주
        if re.search(r'\(\d+\)', os.path.basename(f)):
            finance_files.append(f)
        else:
            # 없으면 기본 기업 정보 파일로 간주
            info_file = f
            
    return info_file, sorted(finance_files)

def read_data(path, header=1):
    """파일 확장자에 따라 적절한 판다스 함수로 읽어옵니다."""
    if path.lower().endswith('.csv'):
        return pd.read_csv(path, header=header) # 보통 2번째 줄(index 1)에 컬럼명이 있음
    return pd.read_excel(path, header=header)

def clean_column_name(col_name):
    """
    컬럼명(예: '2023/12/Annual (수익)')을 분석하여
    1. 기간(Period): '2023/Annual'
    2. 계정(Account): 'revenue'
    두 가지 정보를 추출합니다.
    """
    # 미리 정렬해둔 키워드 리스트를 순회하며 매칭 시도
    for kor_key in SORTED_MAPPING_KEYS:
        if kor_key in col_name:
            # 정규표현식으로 날짜/분기 정보 추출 (예: 2023/12)
            date_match = re.search(r'(\d{4}/[a-zA-Z0-9]+)', col_name)
            period = date_match.group(1) if date_match else "Unknown"
            return period, ACCOUNT_MAPPING[kor_key]
    return None, None

# ---------------------------------------------------------
# 3. 메인 로직
# ---------------------------------------------------------
def process_company_info(path):
    """기업 기본 정보 파일을 처리합니다."""
    print(f"Processing Info: {os.path.basename(path)}")
    df = read_data(path, header=1)
    
    # 시가총액 컬럼 찾기 (파일명에 날짜가 붙어있어 동적으로 찾아야 함)
    market_cap_col = next((c for c in df.columns if "시가총액" in c), None)
    
    # 원본 컬럼명을 DB 컬럼명으로 변경
    cols_renamed = {
        '종목코드': 'stock_code',
        '종목명': 'company_name',
        '691300.NICS 산업분류': 'industry',
        '691090.본사주소': 'address',
        '691035.시장구분': 'market_type'
    }
    
    if market_cap_col:
        cols_renamed[market_cap_col] = 'market_cap_recent' 

    # 실제로 존재하는 컬럼만 선택하여 이름 변경
    available_cols = [c for c in cols_renamed.keys() if c in df.columns]
    df = df[available_cols].rename(columns=cols_renamed)
    
    return df

def process_finance_data(file_paths):
    """재무 데이터 파일들을 처리합니다. (가장 복잡한 부분)"""
    combined_dfs = []
    
    for path in file_paths:
        print(f"Processing Finance: {os.path.basename(path)}")
        df = read_data(path, header=1)
        
        # 식별자 컬럼 (변하지 않는 기준)
        id_vars = ['종목코드', '종목명']
        
        # 처리할 수치 컬럼 식별 (우리가 정의한 매핑 키워드가 포함된 것만)
        value_vars = []
        for col in df.columns:
            if col in id_vars: continue
            if any(k in col for k in SORTED_MAPPING_KEYS):
                value_vars.append(col)
        
        if not value_vars: continue

        # 1. 데이터 클렌징: 모든 값이 없는(NaN) 껍데기 기업 행 제거
        temp_vals = df[value_vars].apply(pd.to_numeric, errors='coerce')
        df = df.loc[temp_vals.notna().any(axis=1)]
        
        # 2. Melt (Wide Format -> Long Format 변환)
        # 가로로 길게 늘어진 날짜별 컬럼들을 세로로 차곡차곡 쌓습니다.
        melted = df.melt(id_vars=id_vars, value_vars=value_vars, var_name='original_col', value_name='value')
        
        # 3. 컬럼명 파싱 (날짜와 계정과목 분리)
        parsed = melted['original_col'].apply(lambda x: pd.Series(clean_column_name(x)))
        melted[['period', 'account']] = parsed
        
        # 파싱 실패했거나 값이 없는 행 제거
        melted = melted.dropna(subset=['account', 'value'])
        
        combined_dfs.append(melted[['종목코드', 'period', 'account', 'value']])

    if not combined_dfs:
        return pd.DataFrame()
        
    # 여러 파일에서 읽은 데이터를 하나로 합침
    final_df = pd.concat(combined_dfs, ignore_index=True)
    return final_df.rename(columns={'종목코드': 'stock_code'})

if __name__ == "__main__":
    try:
        # 1. 파일 목록 가져오기
        info_path, finance_paths = get_files()
        
        # 2. 기업 정보 처리 및 저장
        df_info = process_company_info(info_path)
        df_info.to_csv(os.path.join(DATA_PROCESSED_PATH, "company_info.csv"), index=False)
        print(f"Info Saved: {len(df_info)} rows (Added Market Cap)")
        
        # 3. 재무 데이터 처리
        df_finance = process_finance_data(finance_paths)
        
        # 4. Pivot (Long Format -> Wide Format 재변환)
        # DB에 넣기 좋게 'period'와 'stock_code'를 기준으로 각 계정과목을 컬럼으로 만듭니다.
        df_pivot = df_finance.pivot_table(
            index=['stock_code', 'period'], 
            columns='account', 
            values='value'
        ).reset_index()
        
        # 5. 최종 파일 저장
        output_path = os.path.join(DATA_PROCESSED_PATH, "finance_data_final.csv")
        df_pivot.to_csv(output_path, index=False)
        
        print(f"Finance Saved: {len(df_pivot)} rows, {len(df_pivot.columns)} columns")
        print("Columns:", df_pivot.columns.tolist())
        
    except Exception as e:
        print(f"Error: {e}")