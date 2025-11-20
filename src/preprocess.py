import pandas as pd
import glob
import os
import re

# ---------------------------------------------------------
# 1. 설정 (Configuration)
# ---------------------------------------------------------
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_RAW_PATH = os.path.normpath(os.path.join(CURRENT_DIR, "..", "data", "raw"))
DATA_PROCESSED_PATH = os.path.normpath(os.path.join(CURRENT_DIR, "..", "data", "processed"))

os.makedirs(DATA_PROCESSED_PATH, exist_ok=True)

# 계정과목 매핑
# [중요] 키워드가 긴 순서대로 정렬하여 부분 일치 오류 방지 (예: '비유동자산'이 '유동자산'으로 인식되는 것 방지)
ACCOUNT_MAPPING = {
    "유동성장기부채": "current_portion_of_lt_debt", # 명칭 구체화
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
    # "시가총액": "market_cap", # 시가총액은 재무파일에 없으므로 제외
    "수익": "revenue"
}

# 매핑 키를 길이의 내림차순으로 정렬 (긴 단어 우선 매칭)
SORTED_MAPPING_KEYS = sorted(ACCOUNT_MAPPING.keys(), key=len, reverse=True)

# ---------------------------------------------------------
# 2. 유틸리티 함수
# ---------------------------------------------------------
def get_files():
    """스마트 파일 탐색기"""
    all_files = glob.glob(os.path.join(DATA_RAW_PATH, "VALUESearch*"))
    valid_files = [f for f in all_files if not os.path.basename(f).startswith("~$") 
                   and f.lower().endswith(('.csv', '.xlsx'))]
    
    if not valid_files:
        raise FileNotFoundError(f"'{DATA_RAW_PATH}' 폴더에 데이터 파일이 없습니다.")

    info_file = None
    finance_files = []

    for f in valid_files:
        if re.search(r'\(\d+\)', os.path.basename(f)):
            finance_files.append(f)
        else:
            info_file = f
            
    return info_file, sorted(finance_files)

def read_data(path, header=1):
    if path.lower().endswith('.csv'):
        return pd.read_csv(path, header=header)
    return pd.read_excel(path, header=header)

def clean_column_name(col_name):
    """긴 키워드 우선 매칭으로 정확한 계정과목 추출"""
    for kor_key in SORTED_MAPPING_KEYS:
        if kor_key in col_name:
            date_match = re.search(r'(\d{4}/[a-zA-Z0-9]+)', col_name)
            period = date_match.group(1) if date_match else "Unknown"
            return period, ACCOUNT_MAPPING[kor_key]
    return None, None

# ---------------------------------------------------------
# 3. 메인 로직
# ---------------------------------------------------------
def process_company_info(path):
    print(f"Processing Info: {os.path.basename(path)}")
    df = read_data(path, header=1)
    
    # 시가총액 컬럼 찾기 (날짜가 붙어있을 수 있음)
    market_cap_col = next((c for c in df.columns if "시가총액" in c), None)
    
    cols_renamed = {
        '종목코드': 'stock_code',
        '종목명': 'company_name',
        '691300.NICS 산업분류': 'industry',
        '691090.본사주소': 'address',
        '691035.시장구분': 'market_type'
    }
    
    if market_cap_col:
        cols_renamed[market_cap_col] = 'market_cap_recent' # 최근 시가총액 별도 저장

    # 존재하는 컬럼만 선택
    available_cols = [c for c in cols_renamed.keys() if c in df.columns]
    df = df[available_cols].rename(columns=cols_renamed)
    
    return df

def process_finance_data(file_paths):
    combined_dfs = []
    
    for path in file_paths:
        print(f"Processing Finance: {os.path.basename(path)}")
        df = read_data(path, header=1)
        
        # 식별자 컬럼
        id_vars = ['종목코드', '종목명']
        
        # 처리할 수치 컬럼 식별
        value_vars = []
        for col in df.columns:
            if col in id_vars: continue
            # 매핑 키워드가 포함된 컬럼만 선택
            if any(k in col for k in SORTED_MAPPING_KEYS):
                value_vars.append(col)
        
        if not value_vars:
            continue

        # 1. 데이터가 하나도 없는 기업 제거
        # numeric으로 변환 후 모두 NaN인 행 제거
        temp_vals = df[value_vars].apply(pd.to_numeric, errors='coerce')
        df = df.loc[temp_vals.notna().any(axis=1)]
        
        # 2. Melt
        melted = df.melt(id_vars=id_vars, value_vars=value_vars, var_name='original_col', value_name='value')
        
        # 3. 컬럼 파싱 (Apply 최적화 가능하지만 가독성 위해 유지)
        # clean_column_name이 이제 우선순위가 적용된 SORTED_MAPPING_KEYS를 사용함
        parsed = melted['original_col'].apply(lambda x: pd.Series(clean_column_name(x)))
        melted[['period', 'account']] = parsed
        
        # 매핑 실패하거나 값 없는 행 제거
        melted = melted.dropna(subset=['account', 'value'])
        
        combined_dfs.append(melted[['종목코드', 'period', 'account', 'value']])

    if not combined_dfs:
        return pd.DataFrame()
        
    final_df = pd.concat(combined_dfs, ignore_index=True)
    return final_df.rename(columns={'종목코드': 'stock_code'})

if __name__ == "__main__":
    try:
        info_path, finance_paths = get_files()
        
        # 1. Info 처리
        df_info = process_company_info(info_path)
        df_info.to_csv(os.path.join(DATA_PROCESSED_PATH, "company_info.csv"), index=False)
        print(f"Info Saved: {len(df_info)} rows (Added Market Cap)")
        
        # 2. Finance 처리
        df_finance = process_finance_data(finance_paths)
        
        # Pivot
        df_pivot = df_finance.pivot_table(
            index=['stock_code', 'period'], 
            columns='account', 
            values='value'
        ).reset_index()
        
        output_path = os.path.join(DATA_PROCESSED_PATH, "finance_data_final.csv")
        df_pivot.to_csv(output_path, index=False)
        
        print(f"Finance Saved: {len(df_pivot)} rows, {len(df_pivot.columns)} columns")
        print("Columns:", df_pivot.columns.tolist())
        
    except Exception as e:
        print(f"Error: {e}")