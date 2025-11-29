/**
 * [UpdateHistoryPage.jsx]
 * Balance Sheet 서비스의 업데이트 내역과 제공되는 재무 데이터(계정 과목) 목록을
 * 사용자에게 보여주는 페이지입니다.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// 뒤로가기 버튼 등에 사용되는 아이콘 이미지
import group69 from "../assets/group-69.svg";

export const UpdateHistoryPage = () => {
  const navigate = useNavigate(); // 페이지 이동 훅

  // [상태] scale: 현재 브라우저 너비에 맞춰 화면을 확대/축소할 비율
  const [scale, setScale] = useState(1);

  // [Effect] 반응형 스케일링 로직
  useEffect(() => {
    const handleResize = () => {
      const scaleRatio = window.innerWidth / 1500;
      setScale(scaleRatio);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 컴포넌트 마운트 시 초기 실행
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  /* --- [네비게이션 메뉴 데이터] --- */
  const navigationItems = [
    { text: "지표산정기준", path: "/criteria", active: false },
    { text: "업데이트 기록", path: "/updates", active: true }, // 현재 페이지 활성화
    { text: "개발 과정", path: "/development", active: false },
    { text: "개발 팀", path: "/team", active: false },
  ];

  /* --- [재무 계정 과목 데이터] --- */
  const financialTermsColumn1 = [
    "현금및현금성자산", "매출채권", "단기투자자산", "재고자산(계)", "유동자산(계)",
    "유형자산(계)", "무형자산(계)", "비유동자산(계)", "자산총계", "매입채무",
    "유동부채(계)", "장기차입금(계)", "비유동부채(계)", "부채총계", "지배기업소유주지분",
    "자본금", "1주의금액", "보통주발행주식수", "우선주발생주식수", "보통주자기주식수",
    "우선주자기주식수", "유동부채비율", "비유동부채비율", "차입금의존도", "매입채무/재고자산비율",
  ];

  const financialTermsColumn2 = [
    "자본총계", "부채와자본총계", "평균발행주식수", "총차입금", "부채비율",
    "수익", "총수익", "국내", "수출", "매출원가",
    "매출총이익(손실)", "판매비와관리비", "영업이익(손실)", "이자수익", "이자비용",
    "인건비(종업원1인당)", "비유동자산회전율", "유형자산회전율", "재고자산회전율", "매출채권회전율",
    "매입채무회전율", "부가가치(종업원1인당)", "매출액(종업원1인당)", "자본집약도(종업원1인당)", "자기자본회전율",
  ];

  const financialTermsColumn3 = [
    "계속영업이익(손실)", "총강기순이익", "기본주당순손익", "희석주당순손익", "기타포괄손익",
    "포괄손익", "당기순이익지배기업지분", "포괄손익지배기업지분", "영업활동으로인한현금흐름", "유형자산,투자부동산감가상각비",
    "무형자산상각비", "투자활동으로인한현금유출", "유,무형,리스자산의증가", "총자산증가율", "유형자산증가율",
    "자기자본증가율", "매출액증가율", "매출원가율", "영업이익이자보상비율", "자기자본비율",
    "유동비율", "당좌비율", "비유동자산장기적합율", "법인세비용차감전계속영업이익(손실)", "법인세비용차감전순이익(종업원1인당)",
  ];

  return (
    <div className="bg-white w-full h-screen overflow-y-auto overflow-x-hidden">
      
      <div className="flex justify-center w-full">
        <div 
            style={{ 
                transform: `scale(${scale})`, 
                transformOrigin: 'top center', 
                width: '1500px', 
                height: '1662px', 
            }}
            className="relative bg-white shadow-sm"
        >
            
            {/* --- [헤더 영역] --- */}
            <header className="absolute top-[45px] left-[99px] right-[99px]">
                {/* 로고: 클릭 시 메인으로 이동 */}
                <h1 
                    className="absolute top-[14px] left-0 w-[233px] font-sans font-semibold text-black text-[34px] tracking-[-0.85px] leading-[normal] cursor-pointer hover:opacity-70 transition-opacity"
                    onClick={() => navigate('/')}
                >
                Balance Sheet
                </h1>

                {/* 네비게이션 메뉴 */}
                <nav
                    className="absolute top-0 left-[651px] w-[611px] h-[65px] flex"
                    role="navigation"
                    aria-label="Main navigation"
                >
                {navigationItems.map((item, index) => (
                    <div
                    key={index}
                    onClick={() => item.path && navigate(item.path)}
                    // 부모 div는 위치 잡는 역할만 수행
                    className={`
                        mt-[26px] h-5 
                        ${index === 0 ? "w-[117px]" : index === 1 ? "w-[145px]" : index === 2 ? "w-[85px]" : "w-[72px]"} 
                        ${index > 0 ? `ml-[${index === 1 ? "67" : index === 2 ? "37" : "55"}px]` : ""} 
                        self-center font-medium 
                        ${item.active ? "text-black" : "text-[#828282]"} 
                        text-[21px] tracking-[-0.53px] leading-[normal] whitespace-nowrap cursor-pointer hover:text-black transition-colors
                    `}
                    >
                        {/* [수정] 텍스트를 span으로 감싸고, 밑줄을 span 내부에 배치하여 글자 너비에 딱 맞게 설정 */}
                        <span className="relative inline-block">
                            {item.text}
                            {item.active && (
                                <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-black pointer-events-none" />
                            )}
                        </span>
                    </div>
                ))}
                </nav>
            </header>

            {/* --- [정보 섹션] --- */}
            <section
                className="absolute top-[232px] left-[407px] w-[688px] h-28"
                aria-label="Data period information"
            >
                <div className="w-[688px] h-28 bg-[#f3f3f3] shadow-[4px_4px_4px_#00000040] absolute rounded-[20px]" />

                <div className="absolute top-[31px] left-[calc(50%_-_287.5px)] w-[577px] h-[50px] flex justify-center">
                    <p className="w-[575px] h-[50px] -ml-0.5 font-bold text-black text-[28px] tracking-[-0.70px] leading-[42px] whitespace-nowrap text-center">
                        <span className="tracking-[-0.20px]">데이터는</span>
                        <span className="text-[34px] tracking-[-0.29px]"> 2020 ~ 2025</span>
                        <span className="tracking-[-0.20px]"> 결산한 계정 정보 입니다</span>
                    </p>
                </div>
            </section>

            {/* --- [메인 콘텐츠] --- */}
            <main
                className="absolute top-[418px] left-[189px] w-[1178px] h-[1099px]"
                role="main"
                aria-label="Financial terms list"
            >
                {/* 1열 */}
                <div className="absolute top-px left-0 w-[469px]">
                    <p className="font-bold text-black text-[28px] tracking-[-0.70px] leading-[42px]">
                        {financialTermsColumn1.map((term, index) => (
                        <React.Fragment key={index}>
                            {term}
                            {index < financialTermsColumn1.length - 1 && <br />}
                        </React.Fragment>
                        ))}
                    </p>
                </div>

                {/* 2열 */}
                <div className="absolute top-0 left-[363px] w-[469px]">
                    <p className="font-bold text-black text-[28px] tracking-[-0.70px] leading-[42px]">
                        {financialTermsColumn2.map((term, index) => (
                        <React.Fragment key={index}>
                            {term}
                            {index < financialTermsColumn2.length - 1 && <br />}
                        </React.Fragment>
                        ))}
                    </p>
                </div>

                {/* 3열 */}
                <div className="absolute top-0 left-[706px] w-[466px]">
                    <p className="font-bold text-black text-[28px] tracking-[-0.70px] leading-[42px]">
                        {financialTermsColumn3.map((term, index) => (
                        <React.Fragment key={index}>
                            {term}
                            {index < financialTermsColumn3.length - 1 && <br />}
                        </React.Fragment>
                        ))}
                    </p>
                </div>
            </main>

            {/* --- [푸터 영역] --- */}
            <footer className="absolute w-[282px] h-[61px] top-[1551px] left-[609px]">
                <button
                className="absolute top-0 left-0 w-[284px] h-[61px] cursor-pointer hover:opacity-90 transition-opacity"
                aria-label="메인 화면으로 돌아가기"
                onClick={() => navigate("/")}
                >
                <div className="top-0 left-0 w-[282px] h-[61px] bg-[#f0f0f0] shadow-[0px_8px_4px_#00000040] absolute rounded-[20px]" />
                <div className="absolute top-5 left-[63px] w-[186px] font-medium text-[#050505] text-[19px] tracking-[-0.47px] leading-[normal] whitespace-nowrap">
                    메인 화면으로 돌아가기
                </div>
                <img
                    className="absolute top-[11px] left-4 w-9 h-[38px]"
                    alt="돌아가기 아이콘"
                    src={group69}
                />
                </button>
            </footer>
        </div>
      </div>
    </div>
  );
};