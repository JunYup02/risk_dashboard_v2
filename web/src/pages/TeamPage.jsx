import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react"; 

// --- 1. SVG 파일 Import (Vite가 처리하도록 필수) ---
// 경로는 web/src/pages/TeamPage.jsx 기준입니다.
import junyupSvg from "../assets/junyup.svg";
import junghoonSvg from "../assets/junghoon.svg";
import jooyoungSvg from "../assets/jooyoung.svg";
import saejongSvg from "../assets/saejong.svg";

// --- 네비게이션 및 데이터 ---
const navigationItems = [
  { label: "지표산정기준", active: false, path: "/criteria" },
  { label: "업데이트 기록", active: false, path: "#" },
  { label: "개발 과정", active: false, path: "/development" },
  { label: "개발 팀", active: true, path: "/team" },
];

const teamMembers = [
  // 2. 이미지 변수를 직접 할당
  { name: "이준엽", role: "팀장", position: "백엔드 개발", department: "경영정보학과", image: junyupSvg },
  { name: "박정훈", role: "팀원", position: "백엔드 개발", department: "경영정보학과", image: junghoonSvg },
  { name: "이주영", role: "팀원", position: "프론트엔드 개발", department: "경영정보학과", image: jooyoungSvg },
  { name: "양세종", role: "팀원", position: "프론트엔드 개발", department: "경영정보학과", image: saejongSvg },
];

export const TeamPage = () => {
  const navigate = useNavigate();
  const [scale, setScale] = useState(1);

  // 스케일링 로직 (1500px 기준)
  useEffect(() => {
    const handleResize = () => {
      const scaleRatio = window.innerWidth / 1500;
      setScale(scaleRatio);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scaledHeight = 983 * scale;

  return (
    <div className="w-full h-screen bg-white overflow-y-auto overflow-x-hidden">
      <div style={{ width: '100%', minHeight: `${scaledHeight}px` }}>
        <div 
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'top left',
            width: '1500px', 
            minHeight: '1000px',
          }}
          className="relative bg-white"
        >
          
          {/* Header Area */}
          <header className="absolute top-[45px] left-[99px] right-[99px] w-[1302px] flex justify-between items-center h-[60px]">
            <h1 className="font-sans font-semibold text-black text-[34px] tracking-[-0.85px] leading-[normal]">
              Balance Sheet
            </h1>

            {/* Nav 정렬 수정 */}
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

          <main>
            {/* Title */}
            <h2 className="absolute top-[202px] left-[calc(50%_-_102px)] w-[233px] font-sans font-medium text-black text-[35px] tracking-[-0.88px] leading-[normal]">
              개발 팀 소개
            </h2>

            {/* Team Cards Area */}
            <section
              className="absolute top-[316px] left-0 right-0 flex justify-center gap-[31px] w-[1500px] mx-auto" 
              aria-label="Team members"
            >
              {teamMembers.map((member, index) => (
                <article
                  key={index}
                  className="w-[334px] h-[462px] bg-gray-100 border border-solid border-black relative rounded-xl shadow-lg flex flex-col p-6 items-center"
                >
                  {/* B.S.B Logo */}
                  <div className="w-full flex justify-start mb-2">
                    <div className="font-sans font-bold text-gray-800 text-[26px] tracking-[-0.65px] leading-[30px] whitespace-nowrap">
                      B.S.B
                    </div>
                  </div>

                  {/* Position */}
                  <div className="mt-2 w-full text-center">
                    <div className={`font-mono font-bold text-black text-[40px] leading-snug tracking-[-1.50px]`}>
                      {member.position}
                    </div>
                  </div>

                  {/* 2. Profile Image Box (SVG 렌더링) */}
                  <div className="w-[246px] h-[220px] border border-solid border-[#464646] bg-white my-4 flex items-center justify-center text-gray-400 rounded-lg overflow-hidden">
                    {/* member.image는 이제 import된 SVG 경로(문자열)입니다. */}
                    {member.image ? (
                        <img 
                            src={member.image} 
                            alt={`${member.name} Profile`} 
                            className="w-full h-full object-contain" 
                            onError={(e) => { 
                                e.target.onerror = null; 
                                e.target.src = 'placeholder'; // 이미지 로드 실패 시 대체
                            }}
                        />
                    ) : (
                        <User className="w-1/3 h-1/3 text-gray-400" />
                    )}
                  </div>

                  {/* Role: Name & Department */}
                  <div className="w-full text-center space-y-2 mt-auto">
                    <div className="font-mono font-medium text-black text-[25px] tracking-[-1.50px] leading-snug">
                      {member.role}: {member.name}
                    </div>
                    <div className="font-sans font-normal text-[#999] text-xs tracking-[0.4px] leading-snug">
                      {member.department}
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </main>
          
          {/* Footer Navigation */}
          <div className="absolute bottom-10 right-20 flex gap-4">
             <button onClick={() => navigate('/')} className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-md">
                <ArrowLeft className="w-4 h-4" /> 메인으로
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};