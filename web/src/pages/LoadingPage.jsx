/**
 * [LoadingPage.jsx]
 * 기업 분석 데이터를 불러오는 동안 사용자에게 보여주는 로딩 화면입니다.
 * * [주요 기능]
 * 1. 데이터 전달: 이전 페이지(SearchPage)에서 받은 기업 정보를 대시보드로 넘겨주는 '중간 다리' 역할을 합니다.
 * 2. UX 향상: 즉시 화면이 전환되는 것보다, "분석 중"이라는 연출을 통해 사용자의 기대감을 높입니다.
 * 3. 자동 전환: 3초 후 자동으로 분석 결과 페이지(/dashboard)로 이동합니다.
 */

import React, { useEffect, useState } from "react";
// 페이지 이동(useNavigate)과 전달된 데이터 접근(useLocation)을 위한 훅
import { useNavigate, useLocation } from "react-router-dom";
// 회전하는 로딩 아이콘 (스피너)
import { Loader2 } from "lucide-react";

export const LoadingPage = () => {
  const navigate = useNavigate(); // 페이지 이동 함수
  const location = useLocation(); // 현재 경로 및 이전 페이지에서 넘겨준 상태(state) 데이터 접근
  
  const [scale, setScale] = useState(1); // 반응형 스케일 비율
  
  /* --- [데이터 수신] --- */
  // SearchPage에서 navigate 함수를 통해 전달한 { selectedCompany, searchValue } 데이터를 받습니다.
  // 이 데이터는 잠시 후 Dashboard로 그대로 전달되어야 분석이 가능합니다.
  const searchData = location.state || {};

  /* --- [Effect 1] 반응형 스케일링 로직 --- */
  // 1500px 기준 비율 유지 (다른 페이지들과 동일한 로직)
  useEffect(() => {
    const handleResize = () => {
      const scaleRatio = window.innerWidth / 1500;
      setScale(scaleRatio);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // 초기 실행
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* --- [Effect 2] 자동 페이지 전환 타이머 --- */
  // 컴포넌트가 마운트(화면에 나타남)되면 3초 카운트다운을 시작합니다.
  useEffect(() => {
    const timer = setTimeout(() => {
      // 3초 뒤, 받아왔던 searchData를 그대로 들고 '/dashboard'로 이동합니다.
      // state에 데이터를 실어 보내야 대시보드에서 어떤 기업을 분석할지 알 수 있습니다.
      navigate("/dashboard", { state: searchData });
    }, 3000); // 3000ms = 3초 딜레이

    // 컴포넌트가 언마운트(화면에서 사라짐)되면 타이머를 취소하여 
    // 불필요한 메모리 누수나 에러를 방지합니다.
    return () => clearTimeout(timer);
  }, [navigate, searchData]);

  return (
    // 전체 화면 채우기, 스크롤 방지(overflow-hidden)로 깔끔한 로딩 화면 유지
    <div className="w-full h-screen bg-white overflow-hidden flex items-center justify-center">
      
      {/* 스케일링 컨테이너 */}
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center center', // 화면 중앙을 기준으로 확대/축소
          width: '1500px',
          height: '983px',
        }}
        className="relative bg-white shrink-0"
      >
        {/* 1. 메인 텍스트 (재무제표를 검토 중...) */}
        {/* animate-pulse: 텍스트가 심장 박동처럼 은은하게 깜빡이는 애니메이션 효과 */}
        <h1 className="absolute top-[calc(50%_-_100px)] left-1/2 -translate-x-1/2 w-full font-sans font-semibold text-[#0c0000] text-5xl text-center tracking-[-1.20px] leading-[normal] animate-pulse">
          재무제표를 검토 중 . . .
        </h1>

        {/* 2. 로딩 스피너 아이콘 */}
        <div className="absolute top-[calc(50%_+_50px)] left-1/2 -translate-x-1/2 flex items-center justify-center">
             {/* Loader2 아이콘에 animate-spin-custom 클래스를 적용하여 회전 애니메이션 구현 */}
             {/* 색상은 브랜드 컬러인 보라색(#8a38f5)으로 지정 */}
            <Loader2 className="w-[100px] h-[100px] text-[#8a38f5] animate-spin-custom" />
        </div>

        {/* 3. 하단 안내 문구 */}
        <p className="absolute top-[calc(50%_+_180px)] left-0 w-full text-center text-gray-400 text-2xl font-sans">
          잠시만 기다려 주세요
        </p>

        {/* (참고) 기존 디자인에 있던 우측 장식 요소(<aside>)는 
            심플한 화면 구성을 위해 제거된 상태입니다. */}
      </div>
    </div>
  );
};