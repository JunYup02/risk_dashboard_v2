// GoogleGenerativeAI 라이브러리 사용을 제거하고 표준 fetch API를 사용합니다.

// VITE 환경 변수를 직접 가져옵니다.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 

// 호환성 문제 해결을 위해 지원되는 모델명으로 변경합니다.
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025"; 

export const getFinancialAnalysis = async (companyName, metrics) => {
  // 1. API 키 존재 여부 확인
  if (!API_KEY) {
    return "API 키가 설정되지 않아 AI 분석을 사용할 수 없습니다. (.env 파일에 VITE_GEMINI_API_KEY를 설정했는지 확인 후 서버를 재시작하세요.)";
  }

  // 쿼리 데이터 준비
  const userQuery = `
      ${companyName} 기업의 재무 지표는 다음과 같습니다:
      - 유동비율: ${metrics.currentRatio}%
      - 부채비율: ${metrics.debtRatio}%
      - ROE: ${metrics.roe}%
      - 이자보상배율: ${metrics.activity}배
      - Z-Score: ${metrics.zScore}
      
      이 데이터를 바탕으로 이 기업의 재무 건전성을 '매우 위험', '주의', '안전' 중 하나로 명확히 진단하고,
      투자자가 유의해야 할 리스크 요인과 긍정적인 요인을 3줄 요약으로 전문적이면서도 이해하기 쉽게 설명해주세요.
    `;

  try {
    // 모델명을 포함한 API URL로 변경
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: {
            parts: [{ text: "당신은 전문 투자 분석가입니다. 말투는 정중하고 전문적인 보고서 톤으로 작성해 주세요." }]
        },
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json();
        // 404가 아닌 다른 에러 상태코드일 경우 메시지 반환
        throw new Error(`API 요청 실패 (상태: ${response.status}, 메시지: ${errorData.error?.message || '알 수 없음'})`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("AI 응답 내용이 비어 있습니다.");

    return text;

  } catch (error) {
    console.error("Gemini Fetch Error:", error);
    // 에러 메시지를 사용자에게 명확히 전달
    return `AI 분석 서버 연결 실패. (에러: ${error.message})`;
  }
};