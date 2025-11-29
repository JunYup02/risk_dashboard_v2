/**
 * [DevelopmentPage.jsx]
 * 프로젝트의 개발 배경, 목적, 특징 등을 '채팅 인터페이스' 형식으로
 * 재미있게 풀어낸 스토리텔링 페이지입니다.
 * * [주요 기능]
 * 1. 채팅 UI: 카카오톡이나 ChatGPT 같은 대화형 인터페이스로 정보를 전달합니다.
 * 2. 가상 브라우저 창: 웹 브라우저 안에 또 다른 브라우저가 있는 듯한 연출을 합니다.
 * 3. 반응형 스케일링: 창 크기에 맞춰 전체 화면 비율을 자동으로 조절합니다.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// 화살표, 코드 아이콘 등 다양한 아이콘들을 라이브러리에서 가져옵니다.
import { ArrowLeft, ArrowUp, Code, Mic, Paperclip, RefreshCcw, Share2, X, Maximize2, Minimize2 } from "lucide-react"; 

/* --- [네비게이션 데이터] --- */
// 상단 메뉴바의 항목들입니다. 현재 페이지는 'active: true'로 설정되어 있습니다.
const navigationItems = [
  { id: 1, label: "지표산정기준", active: false, path: "/criteria" },
  { id: 2, label: "업데이트 기록", active: false, path: "/updates" },
  { id: 3, label: "개발 과정", active: true, path: "/development" }, // 현재 페이지
  { id: 4, label: "개발 팀", active: false, path: "/team" },
];

/* --- [대화 데이터 (Storytelling)] --- */
// 채팅창에 표시될 대화 내용입니다.
// isUser: true면 오른쪽(질문자), false면 왼쪽(답변자/개발자)에 말풍선이 위치합니다.
const conversationData = [
  { id: 1, text: "요즘 기업 재무 위험 분석 프로젝트 만든다던데, 그게 정확히 뭐야?", isUser: true },
  { id: 2, text: "코로나 이후로 공급망 문제, 금리 급등, 원자재 가격 상승 같은 이슈들 있잖아. 이런 영향 때문에 기업 재무 안정성 관리가 진짜 중요해졌어.", isUser: false },
  { id: 3, text: "근데 기업 재무제표 보면 되지 않아?", isUser: true },
  { id: 4, text: "그게 말처럼 쉬운 게 아냐 😅 재무제표는 항목도 많고, 수치도 복잡해서 기업이 실제로 얼마나 위험한지 종합적으로 파악하기가 어렵거든.\n\n기존에 쓰던 Altman Z-score 같은 전통적 지표도 있긴 한데,\n특정 산업이나 국가에만 잘 맞고\n최신 데이터를 빨리 반영하지 못하는 한계가 있어.", isUser: false },
  { id: 5, text: "아 그래서 새로운 방식이 필요하다는 거구나?", isUser: true },
  // [수정] 텍스트 가독성을 위해 불필요한 대괄호 제거
  { id: 6, text: "맞아! 그래서 우리가 만드는 게 바로 '오픈데이터 기반 기업 위험지수 분석 시스템'이야.", isUser: false },
  { id: 7, text: "그건 뭐하는 시스템인데?", isUser: true },
  { id: 8, text: "쉽게 말하면,\n💡 기업 재무 데이터를 자동으로 분석해서 위험 수준을 점수로 보여주는 도구!\n\n[작동 원리]\n1. 오픈데이터로 기업 재무제표 + 업종 평균 데이터 자동 수집\n2. 업종·규모·지역을 고려해서 상대적 위험지수를 계산\n3. 대시보드로 결과를 시각화\n\n→ 한눈에 위험 정도가 보이고, 필요하면 경고 알림도 확인 가능!", isUser: false },
  { id: 9, text: "누가 쓰면 좋아?", isUser: true },
  { id: 10, text: '딱 세 그룹에게 추천해!\n\n1️⃣ 투자자\n"이 기업 위험한지 빨리 알고 싶을 때" ➡ 상대적 위험 점수로 즉시 확인\n\n2️⃣ 교수 / 연구자\n"수업용 시각화 자료가 필요할 때" ➡ 데이터 기반 분석 툴로 활용\n\n3️⃣ 기업 담당자\n"우리 회사나 협력사가 안전한지 볼 때" ➡ 재무 건전성 비교·모니터링', isUser: false },
  { id: 11, text: "근데 기존 방식이랑 뭐가 다른 거야?", isUser: true },
  { id: 12, text: "√ 산업·국가별로 제한된 기존 지표의 한계 \n→ 상대 비교 지수로 해결!\n\n√ 수치 복잡하고 보기 어려운 문제 \n→ 점수화 + 대시보드로 직관적 전달!\n\n√ 위험을 사후에만 알던 문제 \n→ 경보 기능으로 사전 탐지 가능!", isUser: false },
  { id: 13, text: "오, 이거 실제 현장에서 바로 쓸 수 있겠는데?", isUser: true },
  { id: 14, text: '그치! 기업은 위험 관리, 투자자는 판단, 연구자는 분석까지\n👉 모두에게 유용한 "데이터 기반 의사결정 지원 도구"가 되는 거야.', isUser: false },
];

export const DevelopmentPage = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 훅
  
  // [상태] scale: 화면 크기에 따른 확대/축소 비율
  // [상태] inputValue: 채팅 입력창의 텍스트 (실제 기능은 없지만 UI용)
  const [scale, setScale] = useState(1);
  const [inputValue, setInputValue] = useState("");

  // [Effect] 윈도우 크기 변경 시 스케일 비율 재계산 (1500px 기준)
  useEffect(() => {
    const handleResize = () => {
      const scaleRatio = window.innerWidth / 1500;
      setScale(scaleRatio);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // 초기 실행
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 채팅 내용이 길기 때문에 컨테이너 높이를 넉넉하게 잡습니다.
  const conversationMaxHeight = 2700; 

  return (
    // 전체 배경: 연한 회색(gray-100), 스크롤 가능
    <div className="w-full min-h-screen bg-gray-100 overflow-y-auto overflow-x-hidden">
      
      {/* 중앙 정렬 및 스케일링 래퍼 */}
      <div className="flex justify-center w-full">
        <div 
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'top center',
            width: '1500px', 
            minHeight: `${conversationMaxHeight + 100}px`,
            paddingBottom: '100px'
          }}
          className="relative bg-white shadow-2xl"
        >
          
          {/* --- [헤더 영역] --- */}
          {/* LandingPage 등 다른 페이지와 디자인 통일성을 위해 absolute 배치 */}
          <header className="absolute top-[45px] left-[99px] right-[99px] w-[1302px] flex justify-between items-center h-[60px] z-10">
            {/* 로고: 클릭 시 메인으로 이동 */}
            <h1 
                className="font-sans font-semibold text-black text-[34px] tracking-[-0.85px] leading-[normal] cursor-pointer"
                onClick={() => navigate('/')}
            >
              Balance Sheet
            </h1>

            {/* 네비게이션 메뉴 */}
            <nav className="w-[611px] h-[65px] flex items-center justify-end gap-8" role="navigation">
              {navigationItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => navigate(item.path)}
                  // active 상태일 때 검은색 + 밑줄, 아닐 때 회색
                  className={`flex items-center cursor-pointer font-medium text-[21px] tracking-[-0.53px] leading-[normal] whitespace-nowrap hover:text-gray-700 transition-colors
                    ${item.active ? "text-black border-b-2 border-black" : "text-[#828282]"} `}
                >
                  {item.label}
                </div>
              ))}
            </nav>
          </header>

          {/* --- [메인 콘텐츠] --- */}
          <main className="pt-[160px] px-[63px] w-full">
            
            {/* 1. 섹션 타이틀 */}
            <section className="w-full mx-auto mb-10 text-center">
              <h2 className="font-sans font-medium text-black text-[35px] tracking-[-0.88px] leading-[normal]">
                이 프로젝트를 시작하게 된 과정
              </h2>
              <p className="mt-[10px] font-sans font-normal text-gray-700 text-xl tracking-[-0.75px] leading-normal">
                딱딱한 기획서 대신, 프로젝트의 진솔한 시작을 담은 대화를 즐겁게 확인해주세요 :)
              </p>
            </section>

            {/* 2. 가상 브라우저 창 (Browser Window Chat Interface) */}
            <div className="w-[1374px] mx-auto flex flex-col gap-px bg-white rounded-[5px] overflow-hidden border-[0.5px] border-solid border-[#060606] shadow-2xl relative">
              
              {/* 2-1. 브라우저 상단 바 (주소창 등) */}
              <div className="flex-none h-[37px] flex items-center justify-between px-2 bg-gray-700 relative">
                
                {/* 윈도우 제어 버튼 (맥 스타일 신호등) */}
                <div className="flex items-center gap-1.5 ml-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>

                {/* 주소창 영역 */}
                <div className="flex-1 max-w-[500px] h-[22px] rounded shadow-md bg-gray-600 flex items-center justify-between px-3 text-xs text-white">
                  <RefreshCcw size={14} className="text-white opacity-80 cursor-pointer" />
                  {/* [수정] URL을 프로젝트명에 맞게 변경 */}
                  <span className="select-none">https://balance-sheet-story.com</span>
                  <Share2 size={12} className="text-white opacity-80 cursor-pointer" />
                </div>
                
                {/* 우측 아이콘 */}
                <div className="flex items-center gap-2 mr-2">
                    <Minimize2 size={14} className="text-white opacity-80" />
                    <Maximize2 size={14} className="text-white opacity-80" />
                    <X size={14} className="text-white opacity-80" />
                </div>
              </div>

              {/* 2-2. 채팅 내용 영역 (Chat Body) */}
              <div className="flex-1 bg-white p-10 space-y-8">
                 {/* conversationData 배열을 순회하며 말풍선 렌더링 */}
                 {conversationData.map((msg) => (
                    <div 
                        key={msg.id} 
                        // isUser에 따라 왼쪽 정렬(질문) 또는 오른쪽 정렬(답변)
                        className={`flex w-full ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                        {/* 말풍선 스타일 */}
                        <div className={`max-w-[65%] p-6 rounded-2xl shadow-sm leading-relaxed text-xl whitespace-pre-line ${
                            msg.isUser 
                            ? 'bg-[#E3F2FD] text-gray-800 rounded-br-none border border-blue-100' // 질문자 (파란색 톤)
                            : 'bg-[#F5F5F5] text-gray-800 rounded-tl-none border border-gray-200'  // 답변자 (회색 톤)
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                 ))}
              </div>

              {/* 2-3. 하단 입력창 (Chat Input Bar) - 데코레이션용 */}
              <div className="w-full p-4 bg-white border-t border-gray-200 flex items-center justify-center sticky bottom-0 z-10">
                  <div className="w-[800px] flex items-center p-3 border border-gray-300 rounded-2xl bg-gray-50 shadow-inner">
                    {/* [수정] 실제 채팅이 아님을 알리기 위해 readonly 처리 및 placeholder 변경 */}
                    <input
                      type="text"
                      disabled
                      placeholder="이 채팅은 개발 과정 인터뷰를 재구성한 화면입니다."
                      className="flex-1 bg-transparent text-gray-500 text-lg outline-none px-2 cursor-not-allowed"
                    />
                    
                    {/* 장식용 아이콘들 */}
                    <div className="flex items-center gap-3 ml-4">
                        <Paperclip size={24} className="text-gray-400" />
                        <Code size={24} className="text-gray-400" />
                        <Mic size={24} className="text-gray-400" />
                        <button 
                            className="p-2 bg-blue-500 rounded-full cursor-default opacity-50"
                            aria-label="Send message"
                        >
                            <ArrowUp size={20} className="text-white" />
                        </button>
                    </div>
                  </div>
              </div>

            </div>
            
            {/* 3. 하단 네비게이션 버튼 */}
            <div className="w-full flex justify-center mt-10">
                <button 
                    onClick={() => navigate('/')} 
                    className="px-8 py-4 bg-gray-800 text-white text-lg font-medium rounded-full hover:bg-gray-700 transition-colors flex items-center gap-3 shadow-lg"
                >
                    <ArrowLeft className="w-5 h-5" /> 메인 화면으로 돌아가기
                </button>
            </div>

          </main>
          
        </div>
      </div>
    </div>
  );
};