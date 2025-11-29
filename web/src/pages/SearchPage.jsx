/**
 * [SearchPage.jsx]
 * 사용자가 분석하고자 하는 기업을 검색하는 페이지입니다.
 * * [주요 기능]
 * 1. 실시간 검색: 사용자가 입력할 때마다 Supabase DB에서 기업 정보를 조회합니다.
 * 2. 디바운싱(Debouncing): 검색 요청이 너무 자주 일어나지 않도록 일정 시간(300ms) 대기 후 요청합니다.
 * 3. 자동 완성: 검색된 기업 목록을 보여주고, 클릭 시 분석 로딩 화면(/loading)으로 이동합니다.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// 검색 돋보기 아이콘과 뒤로가기 화살표 아이콘 사용
import { ArrowLeft, Search } from "lucide-react";
// Supabase 클라이언트 (데이터베이스 연동용)
import { supabase } from "../lib/supabaseClient";

export const SearchPage = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 훅

  // [상태 관리]
  const [searchValue, setSearchValue] = useState("");   // 검색어 입력값
  const [searchResults, setSearchResults] = useState([]); // 검색 결과 리스트
  const [scale, setScale] = useState(1);                // 화면 스케일 비율
  const [loading, setLoading] = useState(false);        // 검색 중 로딩 상태 표시

  // [Effect 1] 반응형 스케일링 로직
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

  // [Effect 2] 실시간 검색 및 디바운싱(Debouncing) 로직
  // 사용자가 검색어를 입력할 때마다 실행되지만, 300ms 동안 추가 입력이 없을 때만 실제 DB 요청을 보냅니다.
  useEffect(() => {
    // setTimeout을 사용하여 0.3초 딜레이를 줍니다.
    const delayDebounce = setTimeout(async () => {
      // 검색어가 비어있지 않을 때만 실행
      if (searchValue.trim().length > 0) {
        setLoading(true); // 로딩 시작
        try {
          // Supabase DB의 'companies' 테이블에서 데이터 조회
          const { data, error } = await supabase
            .from('companies') // 테이블 선택
            .select('stock_code, company_name, industry') // 가져올 컬럼 선택
            // 회사명(company_name) 또는 종목코드(stock_code)에 검색어가 포함(ilike)된 데이터 찾기
            .or(`company_name.ilike.%${searchValue}%,stock_code.ilike.%${searchValue}%`)
            .limit(5); // 결과는 최대 5개까지만 가져옴

          if (error) throw error;
          setSearchResults(data || []); // 결과 저장
        } catch (error) {
          console.error("Error searching companies:", error);
        } finally {
          setLoading(false); // 로딩 종료 (성공하든 실패하든 무조건 실행)
        }
      } else {
        setSearchResults([]); // 검색어가 없으면 결과 초기화
      }
    }, 300); // 300ms 대기 시간

    // Cleanup 함수: 새로운 입력이 들어오면 이전 타이머를 취소하여 중복 요청 방지
    return () => clearTimeout(delayDebounce);
  }, [searchValue]); // searchValue가 변할 때마다 이 Effect가 재실행됨

  // 입력창 값 변경 핸들러
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  // 기업 선택 시 핸들러
  const handleCompanySelect = (company) => {
    // 선택된 기업 정보를 가지고 '로딩 페이지'로 이동합니다.
    // state로 데이터를 넘겨주어 다음 페이지에서 사용할 수 있게 합니다.
    navigate("/loading", { state: { selectedCompany: company } });
  };

  // 검색 폼 제출(엔터키 등) 핸들러
  const handleSearchSubmit = (e) => {
    e.preventDefault(); // 기본 폼 제출 동작(새로고침) 방지
    // 검색어만 가지고 로딩 페이지로 이동 (로딩 페이지에서 다시 정확한 검색 수행 가능)
    navigate("/loading", { state: { searchValue } });
  };

  // 스케일링된 컨텐츠의 높이 계산
  const contentHeight = 983; 
  const scaledHeight = contentHeight * scale;

  return (
    // 전체 배경: 흰색, 스크롤 가능
    <div className="w-full h-screen bg-white overflow-y-auto overflow-x-hidden">
      
      {/* 스케일링 래퍼 */}
      <div style={{ width: '100%', height: `${scaledHeight}px` }}>
        <div
          style={{
            transform: `scale(${scale})`, // 계산된 비율 적용
            transformOrigin: 'top left',
            width: '1500px',
            height: '983px',
          }}
          className="relative bg-white"
        >
          
          {/* 1. 뒤로가기 버튼 (Prev) */}
          <header className="inline-flex items-center justify-center gap-[var(--size-space-200)] pt-[var(--size-space-200)] pr-[var(--size-space-300)] pb-[var(--size-space-200)] pl-[var(--size-space-300)] absolute top-[91px] left-[137px] rounded-[var(--size-radius-200)]">
            <button onClick={() => navigate('/start')} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <ArrowLeft className="w-4 h-4 text-black" />
              <span className="font-sans font-normal text-black text-base">Prev</span>
            </button>
          </header>

          {/* 2. 메인 타이틀 (B.S.B) */}
          <h1 className="absolute top-[154px] left-[50%] -translate-x-1/2 w-auto font-sans font-bold text-black text-8xl tracking-[-2.40px] leading-[30px] text-center">
            B.S.B
          </h1>
          
          {/* 3. 안내 문구 */}
          <p className="absolute top-[313px] left-[50%] -translate-x-1/2 w-[809px] font-sans font-normal text-black text-[32px] tracking-[-0.80px] leading-[1.4] text-center">
            <span className="tracking-[-0.26px]">정확한 </span>
            <span className="font-bold tracking-[-0.26px]">IFRS 데이터 조회</span>
            <span className="tracking-[-0.26px]">를 위해, </span>
            <span className="font-bold tracking-[-0.26px]">정식 법인명</span>
            <span className="tracking-[-0.26px]">을 입력해주세요<br /><br />
            <span className="text-2xl text-gray-500">검색 과정의 작은 불편에 진심으로 죄송합니다.</span></span>
          </p>

          {/* 4. 검색창 영역 (중앙 배치) */}
          <div className="absolute top-[550px] left-[50%] -translate-x-1/2 w-[600px] z-50">
            {/* 검색 입력 폼 */}
            <form onSubmit={handleSearchSubmit} className="w-full h-[84px] flex bg-[#c4c4c4] rounded-[42px] overflow-hidden items-center px-4 shadow-md relative z-20">
              <button type="submit" className="w-[60px] h-[60px] bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shrink-0 ml-2">
                <Search className="w-8 h-8 text-white" />
              </button>
              <input 
                type="text" 
                value={searchValue} 
                onChange={handleSearchChange} 
                placeholder="Search" 
                className="flex-1 ml-6 font-sans font-semibold text-[#333333] text-[32px] tracking-[-0.80px] bg-transparent outline-none placeholder-gray-500" 
              />
            </form>

            {/* 5. 검색 결과 리스트 (자동완성 팝업) */}
            {/* 검색 결과가 있거나 로딩 중일 때만 표시 */}
            {(searchResults.length > 0 || loading) && (
              <div className="absolute top-[90px] left-0 w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-10 animate-fade-in">
                {loading ? (
                  // 로딩 중 표시
                  <div className="p-6 text-center text-gray-500 font-sans text-xl">검색중...</div>
                ) : (
                  // 결과 리스트 표시
                  <ul>
                    {searchResults.map((company) => (
                      <li 
                        key={company.stock_code} 
                        onClick={() => handleCompanySelect(company)} 
                        className="px-8 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors flex justify-between items-center group"
                      >
                        <div>
                          <div className="font-sans font-bold text-2xl text-black group-hover:text-blue-600 transition-colors">
                            {company.company_name}
                          </div>
                          <div className="font-sans text-lg text-gray-400">
                            {company.stock_code} | {company.industry}
                          </div>
                        </div>
                        <ArrowLeft className="rotate-180 text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* 6. 예시 텍스트 (검색어가 없을 때만 표시) */}
          {searchValue === "" && (
            <div className="absolute top-[660px] left-[50%] -translate-x-1/2 w-auto font-sans font-normal text-[#707070] text-[32px] tracking-[-0.80px]">
              예) 삼성전자, 현대자동차
            </div>
          )}
        </div>
      </div>
    </div>
  );
};