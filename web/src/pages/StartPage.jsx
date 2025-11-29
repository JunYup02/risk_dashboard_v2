/**
 * [StartPage.jsx]
 * 서비스의 본격적인 시작을 알리는 인트로 페이지입니다.
 * 사용자가 'Start' 버튼을 누르면 기업 검색 화면(/search)으로 이동합니다.
 * * [주요 기능]
 * 1. 감성적인 문구로 서비스의 목적(안전한 경영 판단 지원)을 전달합니다.
 * 2. 'Start' 버튼을 통해 실제 분석 기능으로 진입하도록 유도합니다.
 * 3. 반응형 스케일링을 통해 모든 화면 크기에서 디자인 비율을 유지합니다.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// 화살표 아이콘 등을 가져옵니다.
import { ArrowLeft, ChevronDown } from "lucide-react";

export const StartPage = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 훅
  
  // [상태] scale: 화면 크기에 따른 확대/축소 비율
  const [scale, setScale] = useState(1);

  // [Effect] 반응형 스케일링 로직
  // 1500px 너비를 기준으로 화면 크기에 맞춰 비율을 자동 조절합니다.
  useEffect(() => {
    const handleResize = () => {
      const scaleRatio = window.innerWidth / 1500;
      setScale(scaleRatio);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 초기 실행
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 스케일링된 컨텐츠의 실제 높이 계산 (스크롤바 생성용)
  const contentHeight = 983; // 디자인 원본 높이
  const scaledHeight = contentHeight * scale;

  return (
    // 전체 배경: 검은색, 세로 스크롤 허용 (overflow-y-auto)
    <div className="w-full h-screen bg-black overflow-y-auto overflow-x-hidden">
      
      {/* 스케일링 래퍼: 내부 컨텐츠의 높이만큼 영역을 확보해줍니다. */}
      <div style={{ width: '100%', height: `${scaledHeight}px` }}>
        <div 
          style={{ 
            transform: `scale(${scale})`, // 계산된 비율 적용
            transformOrigin: 'top left',  // 좌상단 기준 확대/축소
            width: '1500px', 
            height: '983px',
          }}
          // [수정] 기존에 있던 'border-[20px] border-solid border-black' 클래스를 제거했습니다.
          className="bg-white relative flex flex-col"
        >
          {/* 1. 이전 페이지로 돌아가기 버튼 (Previous) */}
          <button
            onClick={() => navigate('/')} // 메인(LandingPage)으로 이동
            className="inline-flex ml-[137px] w-[113px] h-8 relative mt-[91px] items-center justify-center gap-[var(--size-space-200)] pt-[var(--size-space-200)] pr-[var(--size-space-300)] pb-[var(--size-space-200)] pl-[var(--size-space-300)] rounded-[var(--size-radius-200)] cursor-pointer hover:opacity-80 transition-opacity border border-gray-300 hover:bg-gray-100"
            aria-label="Go to previous page"
          >
            <ArrowLeft className="!relative !w-4 !h-4 text-black" />
            <span className="relative w-fit mt-[-1.00px] font-sans text-black text-[14px] whitespace-nowrap">
              Previous
            </span>
          </button>

          {/* 2. 메인 타이틀 (전문 지식 없이도...) */}
          <h1 className="ml-[50px] h-[60px] w-[670px] mt-[172px] font-sans font-semibold text-[#0c0000] text-[52px] tracking-[-1.30px] whitespace-nowrap self-center leading-[normal] text-center">
            전문 지식 없이도 괜찮습니다
          </h1>

          {/* 3. 서브 타이틀 (누구나 안전한...) */}
          <p className="ml-[50px] h-[50px] w-[876px] mt-[61px] font-sans font-normal text-[#0c0000] text-[40px] tracking-[-1.00px] self-center leading-[normal] text-center">
            누구나 안전한 경영 판단을 내릴 수 있도록 돕겠습니다
          </p>

          {/* 4. 강조 문구 ('성장'이라는 약속...) */}
          <p className="ml-[86px] h-[46px] w-[804px] mt-[116px] font-sans font-normal text-black text-[32px] tracking-[-0.80px] self-center leading-[normal] text-center">
            <span className="tracking-[-0.26px]">당신의 재무제표 속에서 </span>
            <span className="font-sans font-bold text-[38px] tracking-[-0.36px]">
              '성장'
            </span>
            <span className="tracking-[-0.26px]">이라는 약속을 읽어 드립니다</span>
          </p>

          {/* 장식용 화살표 아이콘 */}
          <ChevronDown 
            className="ml-[752px] w-[65px] h-[38px] mt-[57.1px] text-black opacity-50" 
            strokeWidth={1.5}
          />

          {/* 5. 시작하기 버튼 (Start) */}
          <button
            onClick={() => navigate('/search')} // 클릭 시 검색 페이지로 이동
            className="ml-[541px] w-[488px] h-[79px] relative mt-[21.0px] shadow-[0px_4px_7px_#00000066] cursor-pointer hover:opacity-90 transition-opacity group"
            aria-label="Start application"
          >
            {/* 버튼 배경 */}
            <div className="absolute top-0 left-0 w-full h-full bg-[#8e8e93] rounded-[13px]" />
            {/* 버튼 텍스트 */}
            <span className="absolute inset-0 flex justify-center items-center [-webkit-text-stroke:1px_#000000] font-sans font-semibold text-[#fffafa] text-[55px] tracking-[-1.38px] leading-none pb-2">
              Start
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};