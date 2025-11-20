import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

export const LoadingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scale, setScale] = useState(1);
  
  // 이전 페이지(SearchPage)에서 전달받은 검색 데이터
  const searchData = location.state || {};

  // 화면 크기에 맞춰 자동 스케일링
  useEffect(() => {
    const handleResize = () => {
      const scaleRatio = window.innerWidth / 1500;
      setScale(scaleRatio);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3초 후 대시보드로 자동 이동
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard", { state: searchData });
    }, 3000); // 3초 딜레이

    return () => clearTimeout(timer);
  }, [navigate, searchData]);

  return (
    // overflow-hidden으로 화면 밖 요소가 있어도 스크롤바가 생기지 않게 차단
    <div className="w-full h-screen bg-white overflow-hidden flex items-center justify-center">
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center', // 중앙 기준 스케일링
          width: '1500px',
          height: '983px',
        }}
        className="relative bg-white shrink-0"
      >
        {/* 메인 텍스트 (중앙 정렬) */}
        <h1 className="absolute top-[calc(50%_-_100px)] left-1/2 -translate-x-1/2 w-full font-sans font-semibold text-[#0c0000] text-5xl text-center tracking-[-1.20px] leading-[normal] animate-pulse">
          재무제표를 검토 중 . . .
        </h1>

        {/* 로딩 스피너 (텍스트 아래 배치) */}
        <div className="absolute top-[calc(50%_+_50px)] left-1/2 -translate-x-1/2 flex items-center justify-center">
             {/* 보라색 스피너 (#8a38f5) */}
            <Loader2 className="w-[100px] h-[100px] text-[#8a38f5] animate-spin-custom" />
        </div>

        {/* 하단 안내 문구 */}
        <p className="absolute top-[calc(50%_+_180px)] left-0 w-full text-center text-gray-400 text-2xl font-sans">
          잠시만 기다려 주세요
        </p>

        {/* 참고: 오른쪽에 있던 장식 요소(<aside>)는 
          '안 보이도록 수정해달라'는 요청에 따라 제거했습니다.
        */}
      </div>
    </div>
  );
};