// web/src/lib/gemini.js

/**
 * [gemini.js]
 * Google Gemini AI 모델과 통신하여 기업 재무 분석 텍스트를 받아오는 모듈입니다.
 * * [수정 사항]
 * 1. 데이터 입력 확대: 단순 비율(Ratio)뿐만 아니라 매출, 이익, 자산, 현금흐름 등 원천 데이터를 모두 AI에게 전달합니다.
 * 2. 프롬프트 강화: 보고서용 문체(평어체/경어체 통일, 명확한 단락 구분)와 글자 수 제한을 두어 가독성을 높였습니다.
 */

// 1. 환경 변수 가져오기
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025"; 

/**
 * 숫자를 '1조 2,300억' 또는 '1,230,000,000' 형태로 읽기 좋게 변환하는 헬퍼 함수
 * (AI가 숫자의 규모를 더 잘 이해하도록 돕습니다)
 */
const formatNumber = (num) => {
  if (!num && num !== 0) return "데이터 없음";
  // 억 단위 이상일 경우 한국식 단위 표기 고려 (AI는 숫자만 줘도 잘 이해하므로 여기선 3자리 콤마만 적용)
  return new Intl.NumberFormat('ko-KR').format(num);
};

/**
 * 기업 재무 데이터를 받아 AI에게 심층 분석을 요청하는 함수
 * @param {string} companyName - 기업 이름
 * @param {object} data - financial_reports 테이블의 전체 컬럼 데이터 (latestData)
 */
export const getFinancialAnalysis = async (companyName, data) => {
  
  // 1. 안전 장치
  if (!API_KEY) {
    return "API 키가 설정되지 않아 AI 분석을 사용할 수 없습니다.";
  }

  // 2. [핵심] 풍부한 데이터를 포함한 프롬프트 구성
  // 스키마에 있는 손익, 재무상태, 현금흐름 데이터를 모두 제공합니다.
  const userQuery = `
      당신은 20년 경력의 베테랑 기업 투자 분석가입니다. 
      아래 제공된 [${companyName}]의 상세 재무 데이터를 바탕으로 전문적인 심층 분석 보고서를 작성해 주세요.

      [1. 손익계산서 요약 (단위: 원)]
      - 매출액: ${formatNumber(data.revenue)}
      - 매출원가: ${formatNumber(data.cost_of_goods_sold)}
      - 영업이익: ${formatNumber(data.operating_income)}
      - 당기순이익: ${formatNumber(data.net_income)}
      - 이자비용: ${formatNumber(data.interest_expense)}

      [2. 재무상태표 요약 (단위: 원)]
      - 자산총계: ${formatNumber(data.total_assets)} (유동자산: ${formatNumber(data.current_assets)})
      - 부채총계: ${formatNumber(data.total_liabilities)} (유동부채: ${formatNumber(data.current_liabilities)})
      - 자본총계: ${formatNumber(data.total_equity)}
      - 이익잉여금: ${formatNumber(data.retained_earnings)}

      [3. 현금흐름표 요약 (단위: 원)]
      - 영업활동 현금흐름: ${formatNumber(data.operating_cash_flow)}
      - 투자활동 현금흐름: ${formatNumber(data.investing_cash_flow)}

      [4. 주요 재무 비율]
      - 유동비율: ${Number(data.current_ratio).toFixed(2)}% (200% 이상 우수)
      - 부채비율: ${Number(data.debt_to_equity_ratio).toFixed(2)}% (100% 이하 우수)
      - ROE (자기자본이익률): ${Number(data.roe).toFixed(2)}%
      - 이자보상배율: ${Number(data.interest_coverage_ratio).toFixed(2)}배 (1.5배 이상 안정)
      - Altman Z-Score: ${Number(data.altman_z_score).toFixed(2)} (1.8 미만 부실 위험)

      ---
      [작성 가이드라인]
      1. **결론부터 제시**: 첫 문장은 기업의 재무 상태를 '매우 우수', '양호', '주의', '위험' 중 하나로 명확히 정의하고 그 핵심 이유를 한 줄로 요약하세요.
      2. **입체적 분석**: 단순히 비율이 높다/낮다가 아니라, 원천 데이터간의 관계를 해석하세요.
         (예: "매출은 증가했으나 영업이익이 감소한 이유는 매출원가 부담 때문입니다.", "순이익은 흑자지만 영업현금흐름이 마이너스인 점은 질적으로 좋지 않습니다.")
      3. **보고서 스타일**: Word 문서에 바로 붙여넣을 수 있도록 깔끔한 문체(합니다 체)를 사용하세요. 이모지나 마크다운(#, *)을 과도하게 사용하지 마세요.
      4. **길이 제한**: 핵심만 추려서 400자 ~ 500자 내외로 작성하세요. 불필요한 서론은 생략합니다.
      
      [출력 형식]
      1. 종합 진단: [결론 및 핵심 이유]
      2. 수익성 및 성장성 분석: [매출, 이익, ROE 중심 해석]
      3. 재무 안정성 및 리스크: [부채, 유동성, 현금흐름, Z-Score 중심 해석]
      4. 투자자 조언: [향후 관전 포인트 1가지]
    `;

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        // AI의 페르소나를 더 구체적으로 설정
        systemInstruction: {
            parts: [{ text: "당신은 냉철하고 분석적인 금융 전문가입니다. 긍정적인 면과 부정적인 면을 균형 있게 다루고, 수치에 기반한 근거를 반드시 제시하세요." }]
        },
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API 요청 실패 (상태: ${response.status}, 메시지: ${errorData.error?.message || '알 수 없음'})`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("AI 응답 내용이 비어 있습니다.");

    return text;

  } catch (error) {
    console.error("Gemini Fetch Error:", error);
    return `AI 분석 서버 연결 실패. (에러: ${error.message})`;
  }
};