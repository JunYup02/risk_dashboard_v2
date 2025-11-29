/**
 * [TeamPage.jsx]
 * 프로젝트를 개발한 팀원들의 프로필을 카드 형태로 소개하는 페이지입니다.
 * * [주요 학습 포인트]
 * 1. 데이터 배열(Array)과 map 함수를 사용하여 반복되는 UI(팀원 카드)를 효율적으로 렌더링하는 방법.
 * 2. 이미지 파일(SVG)을 변수처럼 Import하여 사용하는 방법.
 * 3. 반응형 스케일링(Scale) 로직을 통해 해상도에 상관없이 디자인 비율을 유지하는 방법.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// 아이콘 라이브러리에서 뒤로가기 화살표와 유저(기본) 아이콘을 가져옵니다.
import { ArrowLeft, User } from "lucide-react"; 

/* --- [1. 이미지 에셋 Import] --- */
// React(Vite)에서는 이미지를 사용하기 위해 파일 경로를 변수처럼 import 해야 합니다.
// 이렇게 하면 빌드 시 이미지가 최적화되고 올바른 경로로 연결됩니다.
import junyupSvg from "../assets/junyup.svg";
import junghoonSvg from "../assets/junghoon.svg";
import jooyoungSvg from "../assets/jooyoung.svg";
import saejongSvg from "../assets/saejong.svg";

/* --- [2. 네비게이션 데이터] --- */
// 상단 메뉴바의 항목들입니다.
const navigationItems = [
  { label: "지표산정기준", active: false, path: "/criteria" },
  { label: "업데이트 기록", active: false, path: "/updates" },
  { label: "개발 과정", active: false, path: "/development" },
  { label: "개발 팀", active: true, path: "/team" }, // 현재 페이지 활성화
];

/* --- [3. 팀원 데이터] --- */
// 반복되는 카드 컴포넌트를 만들기 위해 팀원 정보를 배열로 관리합니다.
// 나중에 팀원이 추가되거나 정보가 바뀌면 이 배열만 수정하면 됩니다.
const teamMembers = [
  { 
    name: "이준엽", 
    role: "팀장", 
    position: "백엔드 개발", 
    department: "경영정보학과", 
    image: junyupSvg // 위에서 import한 이미지 변수 사용
  },
  { 
    name: "박정훈", 
    role: "팀원", 
    position: "백엔드 개발", 
    department: "경영정보학과", 
    image: junghoonSvg 
  },
  { 
    name: "이주영", 
    role: "팀원", 
    position: "프론트엔드 개발", 
    department: "경영정보학과", 
    image: jooyoungSvg 
  },
  { 
    name: "양세종", 
    role: "팀원", 
    position: "프론트엔드 개발", 
    department: "경영정보학과", 
    image: saejongSvg 
  },
];

export const TeamPage = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 훅(Hook)
  
  // [상태] scale: 화면 크기에 따라 디자인을 확대/축소할 비율 (기본값 1)
  const [scale, setScale] = useState(1);

  // [Effect] 반응형 스케일링 로직
  // 컴포넌트가 처음 나타날 때(Mount) 실행되어 윈도우 크기 변화를 감지합니다.
  useEffect(() => {
    const handleResize = () => {
      // 디자인 기준 너비인 1500px을 기준으로 현재 창 크기의 비율을 계산합니다.
      const scaleRatio = window.innerWidth / 1500;
      setScale(scaleRatio);
    };

    // 창 크기가 변할 때마다 handleResize 함수 실행
    window.addEventListener('resize', handleResize);
    handleResize(); // 초기 로딩 시 한 번 즉시 실행

    // 뒷정리(Cleanup): 컴포넌트가 사라질 때 이벤트 리스너를 제거하여 메모리 누수 방지
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 스케일링된 컨텐츠의 높이를 계산 (스크롤 영역 확보용)
  const scaledHeight = 983 * scale;

  return (
    // 전체 페이지 컨테이너: 흰색 배경, 스크롤 가능
    <div className="w-full h-screen bg-white overflow-y-auto overflow-x-hidden">
      
      {/* 스케일링 래퍼: 실제 컨텐츠 영역의 크기를 조절하는 부분 */}
      <div style={{ width: '100%', minHeight: `${scaledHeight}px` }}>
        <div 
          style={{ 
            transform: `scale(${scale})`, // 계산된 비율만큼 확대/축소
            transformOrigin: 'top left',  // 좌상단을 기준으로 변환
            width: '1500px',              // 디자인 원본 너비 고정
            minHeight: '1000px',
          }}
          className="relative bg-white"
        >
          
          {/* --- [헤더 영역] --- */}
          <header className="absolute top-[45px] left-[99px] right-[99px] w-[1302px] flex justify-between items-center h-[60px]">
            {/* 로고: 클릭 시 메인으로 이동 */}
            <h1 
                className="font-sans font-semibold text-black text-[34px] tracking-[-0.85px] leading-[normal] cursor-pointer hover:opacity-70 transition-opacity"
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
                  // active 상태면 검은색 + 밑줄, 아니면 회색 텍스트
                  className={`flex items-center cursor-pointer font-medium text-[21px] tracking-[-0.53px] leading-[normal] whitespace-nowrap hover:text-gray-700 transition-colors
                    ${item.active ? "text-black border-b-2 border-black" : "text-[#828282]"} `}
                >
                  {item.label}
                </div>
              ))}
            </nav>
          </header>

          {/* --- [메인 콘텐츠] --- */}
          <main>
            {/* 페이지 제목 */}
            <h2 className="absolute top-[202px] left-[calc(50%_-_102px)] w-[233px] font-sans font-medium text-black text-[35px] tracking-[-0.88px] leading-[normal]">
              개발 팀 소개
            </h2>

            {/* 팀원 카드 리스트 섹션 */}
            <section
              className="absolute top-[316px] left-0 right-0 flex justify-center gap-[31px] w-[1500px] mx-auto" 
              aria-label="Team members"
            >
              {/* map 함수를 사용하여 teamMembers 배열의 데이터를 하나씩 카드 형태로 변환 */}
              {teamMembers.map((member, index) => (
                <article
                  key={index}
                  className="w-[334px] h-[462px] bg-gray-100 border border-solid border-black relative rounded-xl shadow-lg flex flex-col p-6 items-center hover:-translate-y-2 transition-transform duration-300" // 마우스 올렸을 때 살짝 떠오르는 효과 추가
                >
                  {/* 카드 내부 로고 (B.S.B) */}
                  <div className="w-full flex justify-start mb-2">
                    <div className="font-sans font-bold text-gray-800 text-[26px] tracking-[-0.65px] leading-[30px] whitespace-nowrap">
                      B.S.B
                    </div>
                  </div>

                  {/* 포지션 (예: 백엔드 개발) */}
                  <div className="mt-2 w-full text-center">
                    <div className={`font-mono font-bold text-black text-[40px] leading-snug tracking-[-1.50px]`}>
                      {member.position}
                    </div>
                  </div>

                  {/* 프로필 이미지 영역 */}
                  <div className="w-[246px] h-[220px] border border-solid border-[#464646] bg-white my-4 flex items-center justify-center text-gray-400 rounded-lg overflow-hidden">
                    {/* 이미지가 있으면 img 태그 렌더링, 없으면 기본 아이콘(User) 렌더링 */}
                    {member.image ? (
                        <img 
                            src={member.image} 
                            alt={`${member.name} Profile`} 
                            className="w-full h-full object-contain" 
                            onError={(e) => { 
                                // 이미지 로드 실패 시 처리 로직 (선택 사항)
                                e.target.style.display = 'none'; 
                            }}
                        />
                    ) : (
                        <User className="w-1/3 h-1/3 text-gray-400" />
                    )}
                  </div>

                  {/* 이름 및 소속 정보 */}
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
          
          {/* 하단 네비게이션 버튼 (메인으로 이동) */}
          <div className="absolute bottom-10 right-20 flex gap-4">
             <button 
                onClick={() => navigate('/')} 
                className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-md"
             >
                <ArrowLeft className="w-4 h-4" /> 메인으로
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};