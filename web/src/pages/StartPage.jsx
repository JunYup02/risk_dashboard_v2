import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown } from "lucide-react";

export const StartPage = () => {
  const navigate = useNavigate();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      // 화면 너비에 맞춰 비율 계산 (1500px 기준)
      const scaleRatio = window.innerWidth / 1500;
      setScale(scaleRatio);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 스케일링된 실제 높이 계산 (원본 높이 983px * 비율)
  // 이 높이를 지정해줘야 스크롤바가 생깁니다.
  const contentHeight = 983;
  const scaledHeight = contentHeight * scale;

  return (
    // overflow-y-auto 추가하여 세로 스크롤 허용
    <div className="w-full h-screen bg-black overflow-y-auto overflow-x-hidden">
      {/* 스케일링된 높이만큼 영역을 확보해주는 래퍼 */}
      <div style={{ width: '100%', height: `${scaledHeight}px` }}>
        <div 
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'top left',
            width: '1500px', 
            height: '983px',
          }}
          className="bg-white border-[20px] border-solid border-black relative flex flex-col"
        >
          {/* Previous Button */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex ml-[137px] w-[113px] h-8 relative mt-[91px] items-center justify-center gap-[var(--size-space-200)] pt-[var(--size-space-200)] pr-[var(--size-space-300)] pb-[var(--size-space-200)] pl-[var(--size-space-300)] rounded-[var(--size-radius-200)] cursor-pointer hover:opacity-80 transition-opacity border border-gray-300 hover:bg-gray-100"
            aria-label="Go to previous page"
          >
            <ArrowLeft className="!relative !w-4 !h-4 text-black" />
            <span className="relative w-fit mt-[-1.00px] font-single-line-body-base font-[number:var(--single-line-body-base-font-weight)] text-color-text-default-default text-[length:var(--single-line-body-base-font-size)] tracking-[var(--single-line-body-base-letter-spacing)] leading-[var(--single-line-body-base-line-height)] whitespace-nowrap [font-style:var(--single-line-body-base-font-style)]">
              Previous
            </span>
          </button>

          <h1 className="ml-[50px] h-[60px] w-[670px] mt-[172px] font-sans font-semibold text-[#0c0000] text-[52px] tracking-[-1.30px] whitespace-nowrap self-center leading-[normal] text-center">
            전문 지식 없이도 괜찮습니다
          </h1>

          <p className="ml-[50px] h-[50px] w-[876px] mt-[61px] font-sans font-normal text-[#0c0000] text-[40px] tracking-[-1.00px] self-center leading-[normal] text-center">
            누구나 안전한 경영 판단을 내릴 수 있도록 돕겠습니다
          </p>

          <p className="ml-[86px] h-[46px] w-[804px] mt-[116px] font-sans font-normal text-black text-[32px] tracking-[-0.80px] self-center leading-[normal] text-center">
            <span className="tracking-[-0.26px]">당신의 재무제표 속에서 </span>
            <span className="font-sans font-bold text-[38px] tracking-[-0.36px]">
              '성장'
            </span>
            <span className="tracking-[-0.26px]">이라는 약속을 읽어 드립니다</span>
          </p>

          <ChevronDown 
            className="ml-[752px] w-[65px] h-[38px] mt-[57.1px] text-black opacity-50" 
            strokeWidth={1.5}
          />

          {/* Start Button */}
          <button
            onClick={() => navigate('/search')}
            className="ml-[541px] w-[488px] h-[79px] relative mt-[21.0px] shadow-[0px_4px_7px_#00000066] cursor-pointer hover:opacity-90 transition-opacity group"
            aria-label="Start application"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[#8e8e93] rounded-[13px]" />
            <span className="absolute inset-0 flex justify-center items-center [-webkit-text-stroke:1px_#000000] font-sans font-semibold text-[#fffafa] text-[55px] tracking-[-1.38px] leading-none pb-2">
              Start
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};