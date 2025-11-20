import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export const SearchPage = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const scaleRatio = window.innerWidth / 1500;
      setScale(scaleRatio);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchValue.trim().length > 0) {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('companies')
            .select('stock_code, company_name, industry')
            .or(`company_name.ilike.%${searchValue}%,stock_code.ilike.%${searchValue}%`)
            .limit(5);

          if (error) throw error;
          setSearchResults(data || []);
        } catch (error) {
          console.error("Error searching companies:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchValue]);

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleCompanySelect = (company) => {
    // 대시보드 대신 '로딩 페이지'로 이동!
    navigate("/loading", { state: { selectedCompany: company } });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // 엔터키 입력 시에도 로딩 페이지로 이동
    navigate("/loading", { state: { searchValue } });
  };

  const contentHeight = 983; 
  const scaledHeight = contentHeight * scale;

  return (
    <div className="w-full h-screen bg-white overflow-y-auto overflow-x-hidden">
      <div style={{ width: '100%', height: `${scaledHeight}px` }}>
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: '1500px',
            height: '983px',
          }}
          className="relative bg-white"
        >
          <header className="inline-flex items-center justify-center gap-[var(--size-space-200)] pt-[var(--size-space-200)] pr-[var(--size-space-300)] pb-[var(--size-space-200)] pl-[var(--size-space-300)] absolute top-[91px] left-[137px] rounded-[var(--size-radius-200)]">
            <button onClick={() => navigate('/start')} className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <ArrowLeft className="w-4 h-4 text-black" />
              <span className="font-sans font-normal text-black text-base">Prev</span>
            </button>
          </header>

          <h1 className="absolute top-[154px] left-[50%] -translate-x-1/2 w-auto font-sans font-bold text-black text-8xl tracking-[-2.40px] leading-[30px] text-center">B.S.B</h1>
          <p className="absolute top-[313px] left-[50%] -translate-x-1/2 w-[809px] font-sans font-normal text-black text-[32px] tracking-[-0.80px] leading-[1.4] text-center">
            <span className="tracking-[-0.26px]">정확한 </span><span className="font-bold tracking-[-0.26px]">IFRS 데이터 조회</span><span className="tracking-[-0.26px]">를 위해, </span>
            <span className="font-bold tracking-[-0.26px]">정식 법인명</span><span className="tracking-[-0.26px]">을 입력해주세요<br /><br /><span className="text-2xl text-gray-500">검색 과정의 작은 불편에 진심으로 죄송합니다.</span></span>
          </p>

          <div className="absolute top-[550px] left-[50%] -translate-x-1/2 w-[600px] z-50">
            <form onSubmit={handleSearchSubmit} className="w-full h-[84px] flex bg-[#c4c4c4] rounded-[42px] overflow-hidden items-center px-4 shadow-md relative z-20">
              <button type="submit" className="w-[60px] h-[60px] bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shrink-0 ml-2">
                <Search className="w-8 h-8 text-white" />
              </button>
              <input type="text" value={searchValue} onChange={handleSearchChange} placeholder="Search" className="flex-1 ml-6 font-sans font-semibold text-[#333333] text-[32px] tracking-[-0.80px] bg-transparent outline-none placeholder-gray-500" />
            </form>

            {(searchResults.length > 0 || loading) && (
              <div className="absolute top-[90px] left-0 w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-10 animate-fade-in">
                {loading ? <div className="p-6 text-center text-gray-500 font-sans text-xl">검색중...</div> : 
                  <ul>
                    {searchResults.map((company) => (
                      <li key={company.stock_code} onClick={() => handleCompanySelect(company)} className="px-8 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors flex justify-between items-center group">
                        <div>
                          <div className="font-sans font-bold text-2xl text-black group-hover:text-blue-600 transition-colors">{company.company_name}</div>
                          <div className="font-sans text-lg text-gray-400">{company.stock_code} | {company.industry}</div>
                        </div>
                        <ArrowLeft className="rotate-180 text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </li>
                    ))}
                  </ul>
                }
              </div>
            )}
          </div>

          {/* 예시 텍스트 (검색어 없을 때만 보임) */}
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