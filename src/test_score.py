# test_score.py
# 작성자: B.S.B 개발팀
# 설명: 사용자가 설정한 가중치에 따라 기업의 위험 점수(Risk Score)가 어떻게 변하는지 테스트하는 스크립트입니다.
#       실제 웹 서비스의 대시보드 계산 로직을 검증하는 용도로 사용됩니다.

import os
import pandas as pd
from supabase import create_client  # Supabase DB 연결 도구
from dotenv import load_dotenv      # 환경변수(.env) 로드 도구

# ---------------------------------------------------------
# 1. DB 연결 설정
# ---------------------------------------------------------
# .env 파일에 저장된 비밀 키(API Key)를 불러옵니다.
load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

# Supabase 클라이언트 객체 생성 (이 객체로 DB와 대화합니다)
supabase = create_client(url, key)

def get_risk_score(stock_code, weights):
    """
    [위험 점수 계산 함수]
    사용자가 입력한 가중치(weights)를 반영하여 최종 위험 점수(0~100점)를 계산합니다.
    * 점수가 높을수록(100에 가까울수록) '위험'한 상태입니다.
    """
    
    # --- [Step 1] 데이터 조회 (Fetch) ---
    # Supabase DB의 'financial_reports' 테이블에서 해당 기업의 데이터를 가져옵니다.
    response = supabase.table("financial_reports")\
        .select("*")\
        .eq("stock_code", stock_code)\
        .order("period", desc=True)\
        .limit(1)\
        .execute() # 쿼리 실행
        # 해석: stock_code가 일치하는 행 중, period(기간)가 가장 최신인 것 1개만 가져오라.
    
    # 데이터가 없으면 함수 종료
    if not response.data:
        return "데이터 없음"
    
    # 리스트의 첫 번째 요소(가장 최신 데이터)를 꺼냅니다.
    data = response.data[0]
    
    print(f"📊 [{stock_code}] 최신 데이터 기준일: {data['period']}")
    print(f"   - 부채비율: {data['debt_to_equity_ratio']}%")
    print(f"   - 유동비율: {data['current_ratio']}%")
    print(f"   - Z-Score: {data['altman_z_score']}")

    # --- [Step 2] 점수 정규화 (Normalization) ---
    # 서로 다른 단위(%, 배수, 점수)를 가진 지표들을 모두 '0~100점 사이의 위험도'로 변환합니다.
    # 0점 = 매우 안전 / 100점 = 매우 위험
    
    # A. 부채비율 점수 계산 (Debt Ratio)
    # 부채비율은 낮을수록 좋습니다. 200%를 넘어가면 위험하다고 판단하여 100점(만점)을 줍니다.
    debt = data['debt_to_equity_ratio'] or 0
    debt_score = min(debt / 200 * 100, 100) 
    
    # B. 유동비율 점수 계산 (Current Ratio)
    # 유동비율은 높을수록(200% 이상) 안전합니다. 100% 미만이면 위험도가 급격히 올라갑니다.
    curr = data['current_ratio'] or 0
    
    if curr >= 200: current_score = 0      # 200% 이상이면 위험도 0 (아주 안전)
    elif curr >= 100: current_score = 20   # 100~200% 사이면 위험도 20 (보통)
    else: current_score = 100 - curr       # 100% 미만이면 (100 - 비율)만큼 위험 점수 부여
    
    # 점수가 0~100 범위를 벗어나지 않도록 조정 (Clamping)
    current_score = max(0, min(current_score, 100))

    # C. Altman Z-Score 점수 계산
    # Z-Score는 높을수록 안전합니다. (3.0 이상 안전, 1.8 미만 부실 위험)
    z = data['altman_z_score'] or 0
    
    if z > 3.0: z_score = 0       # 3.0 이상이면 위험도 0
    elif z < 1.8: z_score = 100   # 1.8 미만이면 위험도 100 (부실 위험)
    else: 
        # 1.8 ~ 3.0 사이 구간을 0~100점으로 환산 (선형 보간)
        z_score = (3.0 - z) / (3.0 - 1.8) * 100
    
    print(f"\n🧮 항목별 환산 위험도(0~100): 부채({debt_score:.1f}), 유동({current_score:.1f}), Z점수({z_score:.1f})")

    # --- [Step 3] 가중치 적용 (Weighted Average) ---
    # 사용자가 중요하게 생각하는 지표에 더 많은 비중을 둡니다.
    # weights 예시: {'debt': 0.5, 'current': 0.3, 'z_score': 0.2} -> 합은 1.0(100%)이어야 함
    final_score = (
        (debt_score * weights['debt']) + 
        (current_score * weights['current']) + 
        (z_score * weights['z_score'])
    )
    
    # 최종 점수를 소수점 2자리까지 반올림하여 반환
    return round(final_score, 2)

# ---------------------------------------------------------
# 4. 메인 실행 (테스트)
# ---------------------------------------------------------
if __name__ == "__main__":
    # 테스트할 종목 코드 설정 (DB에 존재하는 코드를 입력해야 함)
    # 예: A000020 (동화약품), 005930 (삼성전자) 등
    target_stock = "A000020" 
    
    print(f"--- [{target_stock}] 위험 점수 시뮬레이션 ---")

    # [시나리오 1] 보수적 투자자
    # 부채비율(안정성)을 가장 중요하게(70%) 생각하는 경우
    w1 = {'debt': 0.7, 'current': 0.2, 'z_score': 0.1}
    score1 = get_risk_score(target_stock, w1)
    print(f"👉 시나리오1 (부채 중시) 결과: {score1}점\n")
    
    # [시나리오 2] 공격적/단기 투자자
    # 당장의 부실 위험(Z-Score)을 가장 중요하게(80%) 생각하는 경우
    w2 = {'debt': 0.1, 'current': 0.1, 'z_score': 0.8}
    score2 = get_risk_score(target_stock, w2)
    print(f"👉 시나리오2 (Z-Score 중시) 결과: {score2}점")