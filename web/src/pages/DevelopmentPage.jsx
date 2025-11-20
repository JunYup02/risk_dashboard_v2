import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUp, Code, Mic, Paperclip, RefreshCcw, Share2, X, Maximize2, Minimize2 } from "lucide-react"; 

const navigationItems = [
  { id: 1, label: "지표산정기준", active: false, path: "/criteria" },
  { id: 2, label: "업데이트 기록", active: false, path: "#" },
  { id: 3, label: "개발 과정", active: true, path: "/development" },
  { id: 4, label: "개발 팀", active: false, path: "/team" },
];

const conversationData = [
  { id: 1, text: "요즘 기업 재무 위험 분석 프로젝트 만든다던데, 그게 정확히 뭐야?", isUser: true },
  { id: 2, text: "코로나 이후로 공급망 문제, 금리 급등, 원자재 가격 상승 같은 이슈들 있잖아. 이런 영향 때문에 기업 재무 안정성 관리가 진짜 중요해졌어.", isUser: false },
  { id: 3, text: "근데 기업 재무제표 보면 되지 않아?", isUser: true },
  { id: 4, text: "그게 말처럼 쉬운 게 아냐 😅 재무제표는 항목도 많고, 수치도 복잡해서 기업이 실제로 얼마나 위험한지 종합적으로 파악하기가 어렵거든.\n\n기존에 쓰던 Altman Z-score 같은 전통적 지표도 있긴 한데,\n특정 산업이나 국가에만 잘 맞고\n최신 데이터를 빨리 반영하지 못하고 이런 한계가 있어.", isUser: false },
  { id: 5, text: "아 그래서 새로운 방식이 필요하다는 거구나?", isUser: true },
  { id: 6, text: "맞아! 그래서 우리가 만드는 게 바로 ['오픈데이터 기반 기업 위험지수 분석 시스템' ]이야.", isUser: false },
  { id: 7, text: "그건 뭐하는 시스템인데?", isUser: true },
  { id: 8, text: "쉽게 말하면,\n💡 기업 재무 데이터를 자동으로 분석해서 위험 수준을 점수로 보여주는 도구!\n설명하자면 세 단계로 움직여\n\n1 오픈데이터로 기업 재무제표 + 업종 평균 데이터 자동 수집\n2 업종·규모·지역을 고려해서 상대적 위험지수를 계산\n3 대시보드로 결과를 시각화\n→ 한눈에 위험 정도가 보이고, 필요하면 경고 알림도 확인 가능!", isUser: false },
  { id: 9, text: "누가 쓰면 좋아?", isUser: true },
  { id: 10, text: '딱 세 그룹!\n\n1) 투자자\n"이 기업 위험한지 빨리 알고 싶은데…?" ➡ 상대적 위험 점수로 즉시 확인 가능\n\n2) 교수 / 연구자\n"재무 분석 연구·수업용 시각화 자료 필요!" ➡ 데이터 기반 분석 툴로 활용 가능\n\n3) 기업(협력사·경쟁사·자사)\n"협력사 위험하면 공급망도 위험해지는데…" ➡ 재무 건전성 비교·모니터링 가능', isUser: false },
  { id: 11, text: "근데 기존 방식이랑 뭐가 다른 거야?", isUser: true },
  { id: 12, text: "√ 산업·국가별로 제한된 기존 지표의 한계 \n→ 상대 비교 지수로 해결!\n\n√ 수치 복잡하고 보기 어려운 문제 \n→ 점수화 + 대시보드로 직관적 전달!\n\n√ 위험을 사후에만 알던 문제 \n→ 경보 기능으로 사전 탐지 가능!", isUser: false },
  { id: 13, text: "오, 이거 실제 현장에서 바로 쓸 수 있겠는데?", isUser: true },
  { id: 14, text: '그치! 기업은 위험 관리, 투자자는 판단, 연구자는 분석까지\n👉 모두에게 유용한 "데이터 기반 의사결정 지원 도구"가 되는 거야.', isUser: false },
];


export const DevelopmentPage = () => {
  const navigate = useNavigate();
  const [scale, setScale] = useState(1);
  const [inputValue, setInputValue] = useState("");

  // 화면 스케일링 (1500px 기준)
  useEffect(() => {
    const handleResize = () => {
      const scaleRatio = window.innerWidth / 1500;
      setScale(scaleRatio);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const conversationMaxHeight = 2700; // 대략적인 내용 높이 재조정
  const scaledHeight = conversationMaxHeight * scale;
  
  return (
    <div className="w-full min-h-screen bg-gray-100 overflow-y-auto overflow-x-hidden">
      <div className="flex justify-center w-full">
        <div 
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'top center',
            width: '1500px', 
            minHeight: `${conversationMaxHeight + 100}px`, // 버튼 공간 확보
            paddingBottom: '100px'
          }}
          className="relative bg-white shadow-2xl"
        >
          
          {/* --- Header (LandingPage 디자인 복제) --- */}
          <header className="absolute top-[45px] left-[99px] right-[99px] w-[1302px] flex justify-between items-center h-[60px] z-10">
            <h1 className="font-sans font-semibold text-black text-[34px] tracking-[-0.85px] leading-[normal]">
              Balance Sheet
            </h1>

            <nav className="w-[611px] h-[65px] flex items-center justify-end gap-8" role="navigation">
              {navigationItems.map((item, index) => (
                <a
                  key={index}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center cursor-pointer font-medium text-[21px] tracking-[-0.53px] leading-[normal] whitespace-nowrap hover:text-gray-700
                    ${item.active ? "text-black border-b-2 border-black" : "text-[#828282]"} `}
                  aria-current={item.active ? "page" : undefined}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </header>

          <main className="pt-[160px] px-[63px] w-full">
            
            {/* --- Section Title --- */}
            <section className="w-full mx-auto mb-10 text-center">
              <h2 className="font-sans font-medium text-black text-[35px] tracking-[-0.88px] leading-[normal]">
                이 프로젝트를 시작하게 된 과정
              </h2>
              <p className="mt-[10px] font-sans font-normal text-gray-700 text-xl tracking-[-0.75px] leading-normal">
                딱딱한 기획서 대신, 프로젝트의 진솔한 시작을 담은 대화를 즐겁게 확인해주세요 :)
              </p>
            </section>

            {/* --- Browser Window Chat Interface --- */}
            <div className="w-[1374px] mx-auto flex flex-col gap-px bg-white rounded-[5px] overflow-hidden border-[0.5px] border-solid border-[#060606] shadow-2xl relative">
              
              {/* Browser Header (Gray Bar) */}
              <div className="flex-none h-[37px] flex items-center justify-between px-2 bg-gray-700 relative">
                
                {/* Traffic Lights (Placeholder) */}
                <div className="flex items-center gap-1.5 ml-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>

                {/* URL/Controls */}
                <div className="flex-1 max-w-[500px] h-[22px] rounded shadow-md bg-gray-600 flex items-center justify-between px-3 text-xs text-white">
                  <RefreshCcw size={14} className="text-white opacity-80 cursor-pointer" />
                  <span>project-dev-log.com</span>
                  <Share2 size={12} className="text-white opacity-80 cursor-pointer" />
                </div>
                
                {/* Window Controls */}
                <div className="flex items-center gap-2 mr-2">
                    <Minimize2 size={14} className="text-white opacity-80 cursor-pointer" />
                    <Maximize2 size={14} className="text-white opacity-80 cursor-pointer" />
                    <X size={14} className="text-white opacity-80 cursor-pointer" />
                </div>
              </div>

              {/* Chat Body (스크롤 가능한 대화 영역) */}
              <div className="flex-1 bg-white p-10 space-y-8">
                 {/* Conversation Flow */}
                 {conversationData.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex w-full ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[65%] p-4 rounded-xl shadow-md leading-relaxed text-lg whitespace-pre-line ${
                            msg.isUser 
                            ? 'bg-blue-100 text-gray-800 rounded-br-3xl border border-blue-200' 
                            : 'bg-gray-100 text-gray-800 rounded-tl-3xl border border-gray-200'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                 ))}
              </div>

              {/* Chat Input Bar */}
              <div className="w-full p-4 bg-white border-t border-gray-200 flex items-center justify-center sticky bottom-0">
                  <div className="w-[600px] flex items-center p-3 border border-gray-300 rounded-2xl bg-gray-50">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="What would you like to know?"
                      className="flex-1 bg-transparent text-gray-700 text-lg outline-none px-2"
                    />
                    <div className="flex items-center gap-2 ml-4">
                        <Paperclip size={20} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                        <Code size={20} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                        <Mic size={20} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                        <button 
                            className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 disabled:bg-gray-300"
                            aria-label="Send message"
                            disabled={inputValue.trim() === ""}
                        >
                            <ArrowUp size={20} className="text-white" />
                        </button>
                    </div>
                  </div>
              </div>

            </div>
            
            {/* --- 메인 화면으로 돌아가기 버튼 추가 --- */}
            <div className="w-full flex justify-center mt-10">
                <button onClick={() => navigate('/')} className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-md">
                    <ArrowLeft className="w-4 h-4" /> 메인 화면으로 돌아가기
                </button>
            </div>

          </main>
          
        </div>
      </div>
    </div>
  );
};