import os
from supabase import create_client
from dotenv import load_dotenv
import pandas as pd

# 설정 로드
load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)

def get_risk_score(stock_code, weights):
    """
    동적 가중치를 적용하여 위험 점수(0~100점)를 계산하는 함수
    * 점수가 높을수록 '위험'하다고 가정 (부실 가능성 높음)
    """
    # 1. DB에서 해당 기업의 최신 재무 비율 가져오기
    response = supabase.table("financial_reports")\
        .select("*")\
        .eq("stock_code", stock_code)\
        .order("period", desc=True)\
        .limit(1)\
        .execute()
    
    if not response.data:
        return "데이터 없음"
    
    data = response.data[0]
    print(f"📊 [{stock_code}] 최신 데이터: {data['period']}")
    print(f"   - 부채비율: {data['debt_to_equity_ratio']}%")
    print(f"   - 유동비율: {data['current_ratio']}%")
    print(f"   - Z-Score: {data['altman_z_score']}")

    # 2. 점수 정규화 (Scoring Logic) - 예시 로직
    # 각 지표를 0~100점 위험도로 환산 (나쁜 수치일수록 100점에 가깝게)
    
    # A. 부채비율 점수 (200% 넘으면 위험)
    debt = data['debt_to_equity_ratio'] or 0
    debt_score = min(debt / 200 * 100, 100) # 200% 이상이면 100점(최대 위험)
    
    # B. 유동비율 점수 (100% 미만이면 위험)
    curr = data['current_ratio'] or 0
    # 유동비율은 높을수록 안전하므로, (200 - 비율) 등으로 역산하거나 100 미만일 때 점수 부여
    if curr >= 200: current_score = 0      # 아주 안전
    elif curr >= 100: current_score = 20   # 보통
    else: current_score = 100 - curr       # 100% 미만이면 위험도 급증
    current_score = max(0, min(current_score, 100))

    # C. Altman Z-Score (1.8 미만이면 부실 위험)
    z = data['altman_z_score'] or 0
    # Z-Score가 낮을수록 위험. 1.8 미만이면 고위험(100점), 3.0 초과면 안전(0점)
    if z > 3.0: z_score = 0
    elif z < 1.8: z_score = 100
    else: z_score = (3.0 - z) / (3.0 - 1.8) * 100
    
    print(f"\n🧮 항목별 위험도(0~100): 부채({debt_score:.1f}), 유동({current_score:.1f}), Z점수({z_score:.1f})")

    # 3. 가중치 적용 (Weighted Average)
    # weights 딕셔너리: {'debt': 0.5, 'current': 0.3, 'z_score': 0.2}
    final_score = (
        (debt_score * weights['debt']) + 
        (current_score * weights['current']) + 
        (z_score * weights['z_score'])
    )
    
    return round(final_score, 2)

# --- 실행 ---
if __name__ == "__main__":
    # 예: 삼성전자(A005930) 같은 코드를 넣어서 테스트 (데이터에 있는 코드로)
    # DB에 있는 아무 종목코드나 하나 골라서 테스트
    target_stock = "A000020" # 동화약품 예시
    
    # 시나리오 1: 부채비율을 중요하게 보는 보수적 투자자
    w1 = {'debt': 0.7, 'current': 0.2, 'z_score': 0.1}
    score1 = get_risk_score(target_stock, w1)
    print(f"👉 시나리오1 위험 점수: {score1}점\n")
    
    # 시나리오 2: 당장 망할지(Z-Score)를 중요하게 보는 공격적 투자자
    w2 = {'debt': 0.1, 'current': 0.1, 'z_score': 0.8}
    score2 = get_risk_score(target_stock, w2)
    print(f"👉 시나리오2 위험 점수: {score2}점")