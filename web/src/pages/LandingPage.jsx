/**
 * [LandingPage.jsx]
 * 웹사이트에 접속했을 때 가장 먼저 보여지는 '랜딩 페이지(대문)'입니다.
 * * [주요 기능]
 * 1. 서비스 소개: 헤드라인과 서브 텍스트로 서비스의 목적을 알립니다.
 * 2. 네비게이션: 상단 메뉴바를 통해 다른 페이지로 이동할 수 있습니다.
 * 3. 반응형 디자인: 화면 크기에 맞춰 전체 비율(Scale)을 자동으로 조절합니다.
 * 4. 시작 버튼: 'Next' 버튼을 눌러 실제 서비스(StartPage)로 진입합니다.
 */

import React, { useEffect, useState } from "react";
// 페이지 이동을 위한 훅
import { useNavigate } from "react-router-dom";
// 아이콘 컴포넌트 (현재 사용되지 않는 ArrowDownCircle은 제거됨)
import { ArrowRight } from "lucide-react"; 

/* --- [이미지 리소스 Import] --- */
// assets 폴더에 있는 이미지 파일들을 불러옵니다.
import arrow1 from "../assets/arrow-1.svg"; // 'Next' 버튼 화살표
import image from "../assets/image.svg";   // 장식용 벡터 이미지 (내부)
import vector2 from "../assets/vector-2.svg"; // 장식용 벡터 이미지 (외부)
import vector3 from "../assets/vector-3.svg"; // 장식용 벡터 이미지
import vector from "../assets/vector.svg";    // 장식용 벡터 이미지

/* --- [네비게이션 메뉴 데이터] --- */
// 상단 네비게이션 바에 들어갈 항목들을 배열로 정의하여 관리합니다.
// id: 고유 식별자
// label: 메뉴 이름
// marginLeft, marginTop: 디자인상의 미세한 위치 조정을 위한 클래스
// path: 클릭 시 이동할 경로 (App.jsx의 Route와 일치해야 함)
const navigationItems = [
  { id: 1, label: "지표산정기준", marginLeft: "ml-0", marginTop: "mt-[11px]", path: "/criteria" }, 
  { id: 2, label: "업데이트 기록", marginLeft: "ml-[67px]", marginTop: "mt-[26px]", path: "/updates" },
  { id: 3, label: "개발 과정", marginLeft: "ml-[37px]", marginTop: "mt-7", path: "/development" },
  { id: 4, label: "개발 팀", marginLeft: "ml-[55px]", marginTop: "mt-7", path: "/team" }, 
];

/* --- [장식용 아이콘 데이터] --- */
// 화면 좌측 하단 등에 배치될 장식용 벡터 아이콘들의 위치와 속성을 정의합니다.
// hasNested: 겹쳐진 이미지가 있는지 여부 (true면 div로 감싸서 두 개의 이미지를 렌더링)
const iconData = [
  { id: 1, src: vector, alt: "Vector", className: "absolute w-[9.00%] h-[13.73%] top-[75.48%] left-[9.87%]" },
  { id: 2, alt: "Vector Icon", className: "absolute w-[6.60%] h-[10.07%] top-[78.54%] left-[22.20%]", hasNested: true },
  { id: 3, src: vector3, alt: "Vector", className: "absolute w-[4.67%] h-[7.12%] top-[81.18%] left-[32.13%]" },
];

export const LandingPage = () => {
  const navigate = useNavigate(); // 페이지 이동 함수 생성
  
  // [상태] scale: 현재 브라우저 창 크기에 따른 화면 배율 (기본값 1)
  const [scale, setScale] = useState(1);

  // [Effect] 화면 크기 변경 감지 및 스케일 조정 로직
  // 창 크기가 변할 때마다(handleResize) 1500px 기준으로 비율을 계산해 화면을 축소/확대합니다.
  // 이를 통해 디자인이 깨지지 않고 비율을 유지하며 줄어듭니다.
  useEffect(() => {
    const handleResize = () => {
      // 1500px 너비를 기준으로 현재 창 너비의 비율을 계산
      const scaleRatio = window.innerWidth / 1500;
      setScale(scaleRatio);
    };

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);
    // 초기 로딩 시 한 번 실행
    handleResize();
    
    // 컴포넌트가 사라질 때 이벤트 리스너 제거 (메모리 누수 방지)
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 'Next' 버튼 클릭 핸들러: '/start' 페이지로 이동
  const handleNext = () => navigate("/start");

  // 스케일이 적용된 컨테이너의 실제 높이 계산 (스크롤 영역 확보용)
  const scaledHeight = 983 * scale;

  return (
    // 전체 배경: 검은색, 스크롤 가능
    <div className="w-full h-screen bg-black overflow-y-auto overflow-x-hidden">
      
      {/* 스케일링을 위한 래퍼(Wrapper) div */}
      <div style={{ width: '100%', height: `${scaledHeight}px` }}>
        
        {/* 실제 컨텐츠가 들어가는 메인 컨테이너 */}
        {/* transform: scale()을 사용하여 전체 내용을 비율대로 조절합니다. */}
        <div 
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'top left', // 좌상단을 기준으로 스케일링
            width: '1500px', // 기준 너비
            height: '983px', // 기준 높이
          }}
          className="relative bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(180deg,rgba(170,170,170,1)_24%,rgba(68,68,68,1)_100%)]"
        >
          {/* 1. 헤더 배경 (그라데이션) */}
          <header className="absolute top-0 left-[-30px] w-[1961px] h-[126px] bg-[linear-gradient(0deg,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(0deg,rgba(170,170,170,1)_0%,rgba(170,170,170,1)_100%)]" />

          {/* 2. 로고 텍스트 (Balance Sheet) */}
          <h1 className="absolute top-[59px] left-[99px] w-[233px] font-sans font-semibold text-white text-[34px] tracking-[-0.85px] leading-[normal]">
            Balance Sheet
          </h1>

          {/* 3. 상단 네비게이션 메뉴 */}
          <nav className="absolute top-[45px] left-[750px] w-[611px] h-[65px] flex" role="navigation">
            {navigationItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => item.path && navigate(item.path)} // 클릭 시 해당 경로로 이동
                // Tailwind CSS 클래스로 스타일 및 위치 지정 (hover 시 색상 변경 등)
                className={`${item.marginTop} ${item.id === 1 ? "h-5 w-[117px]" : item.id === 2 ? "w-[145px] h-[22px]" : item.id === 3 ? "w-[85px] h-5" : "w-[72px] h-5"} ${item.marginLeft} ${item.id === 1 ? "self-center" : ""} font-medium text-white text-[21px] tracking-[-0.53px] leading-[normal] whitespace-nowrap cursor-pointer hover:text-gray-300 transition-colors`}
              >
                {item.label}
              </div>
            ))}
          </nav>

          {/* 4. 메인 카피 (큰 제목) */}
          <h2 className="absolute top-[280px] left-[174px] w-[722px] font-sans font-semibold text-white text-[64px] tracking-[-1.60px] leading-[normal]">
            재무정보를 활용한<br />기업 위험 지수 확인 시스템
          </h2>
          
          {/* 5. 서브 카피 (설명글) */}
          <p className="absolute top-[544px] left-[174px] w-[662px] font-sans font-medium text-white text-[32px] tracking-[-0.80px] leading-[normal]">
            우리 기업의 재무 위험 지수를 한눈에 확인하고, <br />안전 경영을 위한 최적의 전략을 세우세요.
          </p>

          {/* 6. 장식용 아이콘 렌더링 */}
          {iconData.map((icon) =>
            icon.hasNested ? (
              // 중첩된 이미지가 있는 경우 (vector2 + image)
              <div key={icon.id} className={icon.className}>
                <img className="absolute w-[55.56%] h-[55.56%] top-[22.22%] left-[22.22%]" alt="Vector Inner" src={image} />
                <img className="absolute w-full h-full top-0 left-0" alt="Vector Outer" src={vector2} />
              </div>
            ) : (
              // 단일 이미지인 경우
              <img key={icon.id} className={icon.className} alt={icon.alt} src={icon.src} />
            )
          )}

          {/* (참고) 데이터 다운로드 버튼은 제거되었습니다. */}

          {/* 7. Next 버튼 (StartPage로 이동) */}
          <button 
            onClick={handleNext} 
            className="absolute top-[772px] left-[1265px] w-[166px] h-[68px] flex bg-neutral-100 rounded-xl hover:bg-white transition-colors cursor-pointer items-center justify-center shadow-lg"
          >
            <div className="flex gap-[13.5px] items-center">
              <span className="font-medium text-[#050505] text-2xl tracking-[-0.60px]">Next</span>
              <img className="w-[27.5px] h-[17.32px]" alt="Arrow" src={arrow1} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};