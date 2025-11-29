/**
 * [CriteriaPage.jsx]
 * 기업 분석에 사용되는 4대 핵심 재무 지표(유동성, 안정성, 수익성, 활동성)의
 * 산정 기준, 계산 공식, 평가 기준을 사용자에게 설명하는 정보 제공 페이지입니다.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// 페이지 뒤로가기 버튼 등에 사용될 화살표 아이콘
import { ArrowLeft } from "lucide-react";

/* --- [네비게이션 메뉴 설정] --- */
const navigationItems = [
  { id: 1, label: "지표산정기준", path: "/criteria" }, // 현재 활성화될 메뉴
  { id: 2, label: "업데이트 기록", path: "/updates" },
  { id: 3, label: "개발 과정", path: "/development" },
  { id: 4, label: "개발 팀", path: "/team" }, 
];

export const CriteriaPage = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 훅
  
  // [상태] scale: 반응형 디자인을 위한 화면 배율
  const [scale, setScale] = useState(1);

  // [Effect] 윈도우 크기에 따른 스케일링 로직
  useEffect(() => {
    const handleResize = () => {
      const scaleRatio = window.innerWidth / 1500;
      setScale(scaleRatio);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // 초기 실행
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* --- [핵심 콘텐츠 데이터] --- */
  const criteriaContent = [
    { 
      title: "1. 유동성 (단기 상환 능력)", 
      definition: "유동자산이 유동부채를 얼마나 초과하는지 나타내는 지표로, 기업의 단기 지급 능력을 나타냅니다.",
      metric: "유동 비율 (Current Ratio)",
      formula: "유동자산 / 유동부채",
      standard: "200% 이상을 우수한 기준으로 간주하며, 높을수록 안전합니다."
    },
    { 
      title: "2. 안정성 (장기 부채 리스크)", 
      definition: "타인자본(부채) 대비 자기자본(자본)의 비율을 나타내, 기업의 장기적인 재무 구조 안정성을 평가합니다.",
      metric: "부채 비율 (Debt to Equity Ratio)",
      formula: "총 부채 / 자기자본",
      standard: "100% 이하를 이상적인 수준으로 보며, 낮을수록 재무구조가 건전합니다."
    },
    { 
      title: "3. 수익성 (이익 창출 능력)", 
      definition: "자기자본 대비 순이익이 얼마나 발생하는지 나타내, 주주가 투자한 자본을 얼마나 효율적으로 운용했는지 보여줍니다.",
      metric: "자기자본 이익률 (ROE - Return on Equity)",
      formula: "당기순이익 / 자기자본",
      standard: "동종 업계 평균 대비 높거나, 15% 이상일 경우 우수하다고 평가합니다."
    },
    { 
      title: "4. 활동성 (이자 지급 건전성)", 
      definition: "영업활동으로 벌어들인 이익이 이자 비용을 얼마나 감당할 수 있는지 측정하는 지표입니다.",
      metric: "이자보상배율 (Interest Coverage Ratio)",
      formula: "영업이익 / 이자 비용",
      standard: "1.5배 이상을 안정적인 기준으로 보며, 3배 이상일 경우 매우 건전하다고 평가합니다."
    },
  ];

  return (
    // 전체 배경: 검은색
    <div className="w-full h-screen bg-black overflow-y-auto overflow-x-hidden">
      
      {/* 스케일링을 위한 중앙 정렬 래퍼 */}
      <div style={{ width: '100%', minHeight: '100vh', paddingBottom: '50px' }} className="flex justify-center"> 
        
        {/* 실제 컨텐츠 영역 */}
        <div 
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'top center', 
            width: '1500px', 
            minHeight: '100vh',
          }}
          className="relative mx-auto bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(180deg,rgba(170,170,170,1)_24%,rgba(68,68,68,1)_100%)]"
        >
          
          {/* --- [헤더 영역] --- */}
          <header className="w-full h-[126px] relative flex items-center justify-between px-[100px] z-20"> 
             
             {/* 1. 헤더 배경 */}
             <div className="absolute top-0 left-[-30px] w-[1961px] h-[126px] bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(0deg,rgba(170,170,170,1)_0%,rgba(170,170,170,1)_100%)]" />

             {/* 2. 로고 텍스트 */}
             <h1 
               onClick={() => navigate('/')} 
               className="w-[233px] font-sans font-semibold text-white text-[34px] tracking-[-0.85px] leading-[normal] z-10 ml-[0px] cursor-pointer hover:opacity-80 transition-opacity" 
             >
                Balance Sheet
             </h1>

             {/* 3. 네비게이션 메뉴 */}
             <nav className="h-[65px] flex items-center justify-end gap-8 z-10" role="navigation">
                {navigationItems.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => navigate(item.path)} 
                    // [수정] relative 클래스 추가 및 border 제거
                    className="font-medium text-white text-[21px] tracking-[-0.53px] leading-[normal] whitespace-nowrap cursor-pointer hover:text-gray-300 transition-colors relative"
                  >
                    {item.label}
                    {/* [수정] 활성화된 아이템에만 '절대 위치(absolute)'로 밑줄 표시. 레이아웃에 영향을 주지 않음 */}
                    {item.id === 1 && (
                      <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-white pointer-events-none" />
                    )}
                  </div>
                ))}
             </nav>
          </header>
          
          {/* --- [메인 콘텐츠 영역] --- */}
          <div className="mt-[54px] mx-auto w-[1300px] relative">
            
            <div className="bg-white/95 backdrop-blur-sm p-12 rounded-xl shadow-2xl mb-10">
              
              <h2 className="text-4xl font-bold text-gray-800 mb-8 border-b-4 border-blue-600 pb-2">
                <span className="text-blue-600">핵심 지표</span> 산정 기준 및 분석 가이드
              </h2>

              <p className="text-xl text-gray-600 mb-10">
                저희 시스템은 Altman Z-Score와 Piotroski F-Score의 기반이 되는 네 가지 핵심 재무 영역을 선정하여 위험 지수를 산출합니다.
              </p>

              <div className="space-y-12">
                {criteriaContent.map((item, index) => (
                  <div key={index} className="border-l-4 border-gray-400 pl-6">
                    <h3 className="text-3xl font-extrabold text-black mb-3">{item.title}</h3>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                        <p className="text-lg font-medium text-gray-700"><strong>지표:</strong> {item.metric}</p>
                        <p className="text-lg font-medium text-gray-700"><strong>공식:</strong> {item.formula}</p>
                    </div>
                    
                    <p className="text-lg text-gray-800 mb-2">
                      {item.definition}
                    </p>
                    <p className="text-lg font-semibold text-blue-600">
                      <strong className="text-black">평가 기준:</strong> {item.standard}
                    </p>
                  </div>
                ))}
              </div>

              <button onClick={() => navigate('/')} className="mt-12 flex items-center gap-3 px-6 py-3 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors">
                <ArrowLeft /> 메인 화면으로 돌아가기
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};