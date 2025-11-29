/**
 * [DashboardPage.jsx]
 * 기업 분석의 핵심 결과를 보여주는 메인 대시보드 화면입니다.
 * * [주요 기능]
 * 1. 데이터 시각화: Recharts 라이브러리를 사용하여 재무 지표 추이를 그래프로 보여줍니다.
 * 2. 동적 계산: 사용자가 조절하는 가중치(Slider)에 따라 위험 점수가 실시간으로 바뀝니다.
 * 3. [기능 강화] 심층 보고서 생성: 스키마의 상세 데이터(손익, 재무상태, 현금흐름)를 모두 포함한 Word 보고서를 생성합니다.
 * 4. AI 분석 연동: Gemini AI API를 통해 생성된 텍스트 분석 결과를 화면에 표시합니다.
 */

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// 아이콘 라이브러리 (FileText 아이콘 추가)
import { ArrowLeft, X, Download, SlidersHorizontal, RefreshCw, Play, FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from "../lib/supabaseClient";
import { getFinancialAnalysis } from "../lib/gemini";

/* --- [스타일 컴포넌트] Window Card --- */
const WindowCard = ({ color, className, children }) => (
  <div className={`relative rounded-[10px] ${className}`}>
    <div className="absolute top-0 left-0 w-full h-full rounded-[10px] opacity-60" style={{ backgroundColor: color }} />
    <div className="absolute top-[2px] left-0 w-[99%] h-[99%] bg-white/95 rounded-[10px] z-10 shadow-sm flex flex-col justify-center items-center p-4 ml-[0.5%]">
       {children}
    </div>
  </div>
);

/* --- [스타일 컴포넌트] 커스텀 슬라이더 --- */
const CustomSlider = ({ label, value, onChange, color = "#6055ff" }) => (
    <div className="relative w-full h-[141px] bg-[#f6f2f2] rounded-[20px] shadow-[2px_4px_5px_rgba(0,0,0,0.25)] mb-6 overflow-hidden flex-shrink-0">
        <div className="absolute top-[25px] left-[33px] text-black text-[25px] font-medium tracking-tight font-sans">{label}</div>
        <div className="absolute top-[25px] right-[40px] font-semibold text-3xl tracking-tight" style={{ color }}>{value} %</div>
        <div className="absolute top-[89px] left-[39px] right-[39px] h-8">
             <div className="absolute top-[13px] left-0 w-full h-1.5 bg-gray-300 rounded-full" />
             <div className="absolute top-[13px] left-0 h-1.5 rounded-full opacity-50" style={{ width: `${value}%`, backgroundColor: color }} />
             <input type="range" min="0" max="100" value={value} onChange={onChange} className="absolute top-0 left-0 w-full h-8 opacity-0 cursor-pointer z-20" />
             <div className="absolute top-0 w-8 h-8 rounded-full shadow-md z-10 pointer-events-none flex items-center justify-center" style={{ left: `calc(${value}% - 16px)`, backgroundColor: color }}>
                <div className="w-2 h-2 bg-white rounded-full opacity-50" />
             </div>
        </div>
    </div>
);

/* --- [헬퍼 함수] 숫자 포맷팅 --- */
const formatCurrency = (value) => {
    if (!value && value !== 0) return "-";
    // 억 단위 등으로 줄이지 않고, 정확한 회계 수치를 위해 전체 자릿수 표기 (원화 기준)
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
};

/* --- [헬퍼 함수] 데이터 정렬 로직 --- */
const sortFinancialData = (a, b) => {
    const yearA = parseInt(a.period.slice(0, 4));
    const yearB = parseInt(b.period.slice(0, 4));
    if (yearA !== yearB) return yearA - yearB;
    
    const quarterOrder = { '1Q': 1, '2Q': 2, 'Semi': 2, '3Q': 3, '4Q': 4, 'Annual': 5 };
    
    const getQuarterString = (p) => { 
        const parts = p.split('-'); 
        return parts.length > 1 ? parts[1] : p.slice(4).replace('.', ''); 
    };
    
    const orderA = quarterOrder[getQuarterString(a.period)] || 0;
    const orderB = quarterOrder[getQuarterString(b.period)] || 0;
    
    return orderA - orderB;
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);  
  const [analysisMode, setAnalysisMode] = useState('일반 분석'); 
  
  const selectedCompany = location.state?.selectedCompany || { company_name: "샘플전자", stock_code: "005930" };
  
  const [financeHistory, setFinanceHistory] = useState([]); 
  const [latestData, setLatestData] = useState(null);       
  const [aiAnalysis, setAiAnalysis] = useState("AI가 재무제표를 분석하고 있습니다..."); 
  const [riskScore, setRiskScore] = useState(0);            
  const [weights, setWeights] = useState({ liquidity: 25, stability: 25, profitability: 25, activity: 25 }); 
  const [loading, setLoading] = useState(true);             

  // 1. [Effect] Supabase 데이터 조회
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('financial_reports')
          .select('*') // 모든 컬럼(상세 데이터 포함)을 가져옵니다.
          .eq('stock_code', selectedCompany.stock_code)
          .order('period', { ascending: true }); 

        if (error) throw error;

        if (data && data.length > 0) {
          let sortedData = [...data]; 
          sortedData.sort(sortFinancialData); 
          
          const latest = sortedData[sortedData.length - 1]; 
          
          setFinanceHistory(sortedData);
          setLatestData(latest);
        } else {
            setFinanceHistory([]);
            setLatestData(null);
        }
      } catch (err) { console.error("Data Fetch Error:", err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [selectedCompany.stock_code]); 

  // 2. [Effect] 점수 계산 및 AI 분석 호출
  useEffect(() => {
    if (!latestData) return;
    
    // (1) AI 분석 요청: [중요] latestData 전체를 넘겨야 심층 분석이 가능합니다.
    if (aiAnalysis.includes("분석하고 있습니다")) {
        getFinancialAnalysis(selectedCompany.company_name, latestData)
            .then(setAiAnalysis)
            .catch(() => setAiAnalysis("AI 분석 연결 실패"));
    }

    const calcScore = () => {
      const liqScore = Math.min((Number(latestData.current_ratio) || 0) / 200 * 100, 100);
      const stabScore = Math.max(0, 100 - (Math.max(0, (Number(latestData.debt_to_equity_ratio) || 0) - 100) / 3));
      const profScore = Math.min((Number(latestData.roe) || 0) * 5, 100);
      const actScore = Math.min((Number(latestData.interest_coverage_ratio) || 0) * 10, 100);

      const totalScore = (
        (liqScore * weights.liquidity) +
        (stabScore * weights.stability) +
        (profScore * weights.profitability) +
        (actScore * weights.activity)
      ) / 100;
      setRiskScore(Math.round(totalScore));
    };
    calcScore();
  }, [latestData, weights, selectedCompany.company_name]);

  const getRiskStatus = (score) => {
    if (score >= 80) return { color: "#24992e", text: "매우 안전한 상태입니다." }; 
    if (score >= 50) return { color: "#fcb124", text: "주의가 필요합니다." }; 
    return { color: "#ff2912", text: "위험 수준입니다." }; 
  };
  const riskStatus = getRiskStatus(riskScore);

  // --- [강화된 기능] 심층 보고서 다운로드 (Word) ---
  const handleDownloadReport = () => {
    if (!latestData) return alert("데이터가 없어 보고서를 생성할 수 없습니다.");

    // Word 문서 스타일 정의
    const tableStyle = "width: 100%; border-collapse: collapse; text-align: center; font-size: 12px; margin-bottom: 20px;";
    const thStyle = "padding: 8px; background-color: #f2f2f2; border: 1px solid #ddd; font-weight: bold;";
    const tdStyle = "padding: 8px; border: 1px solid #ddd;";
    const sectionTitleStyle = "color: #333; font-size: 16px; margin-top: 30px; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 5px;";

    // HTML 내용 구성 (모든 상세 데이터를 포함)
    const reportHTML = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>재무 분석 보고서</title></head>
        <body style="font-family: 'Malgun Gothic', sans-serif; line-height: 1.6;">
            <div style="padding: 30px;">
                
                <h1 style="text-align: center; font-size: 24px;">B.S.B 기업 위험지수 상세 분석 보고서</h1>
                <p style="text-align: center; color: #666;">
                    <strong>기업명:</strong> ${selectedCompany.company_name} (${selectedCompany.stock_code}) | 
                    <strong>분석 시점:</strong> ${latestData.period} | 
                    <strong>발급일:</strong> ${new Date().toLocaleDateString()}
                </p>
                <hr />

                <h2 style="${sectionTitleStyle}">1. 종합 진단 결과</h2>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
                    <p style="font-size: 18px;"><strong>종합 위험 점수:</strong> <span style="color: ${riskStatus.color}; font-size: 24px;">${riskScore}점</span> / 100점</p>
                    <p><strong>진단 요약:</strong> ${riskStatus.text}</p>
                    <p style="margin-top: 10px;"><strong>AI 분석 코멘트:</strong><br/>${aiAnalysis.replace(/\n/g, '<br/>')}</p>
                </div>

                <h2 style="${sectionTitleStyle}">2. 핵심 재무 비율 (Key Ratios)</h2>
                <table style="${tableStyle}">
                    <tr><th style="${thStyle}">지표명</th><th style="${thStyle}">값</th><th style="${thStyle}">평가 기준</th></tr>
                    <tr><td style="${tdStyle}">유동비율 (Liquidity)</td><td style="${tdStyle}">${Number(latestData.current_ratio).toFixed(2)}%</td><td style="${tdStyle}">200% 이상 우수</td></tr>
                    <tr><td style="${tdStyle}">부채비율 (Stability)</td><td style="${tdStyle}">${Number(latestData.debt_to_equity_ratio).toFixed(2)}%</td><td style="${tdStyle}">100% 이하 우수</td></tr>
                    <tr><td style="${tdStyle}">자기자본이익률 (ROE)</td><td style="${tdStyle}">${Number(latestData.roe).toFixed(2)}%</td><td style="${tdStyle}">높을수록 우수</td></tr>
                    <tr><td style="${tdStyle}">총자산이익률 (ROA)</td><td style="${tdStyle}">${Number(latestData.roa || 0).toFixed(2)}%</td><td style="${tdStyle}">자산 효율성 측정</td></tr>
                    <tr><td style="${tdStyle}">이자보상배율 (Activity)</td><td style="${tdStyle}">${Number(latestData.interest_coverage_ratio).toFixed(2)}배</td><td style="${tdStyle}">1.5배 이상 안정</td></tr>
                    <tr><td style="${tdStyle}"><strong>Altman Z-Score</strong></td><td style="${tdStyle}"><strong>${Number(latestData.altman_z_score || 0).toFixed(2)}</strong></td><td style="${tdStyle}">1.8 미만 부실 위험</td></tr>
                    <tr><td style="${tdStyle}">Piotroski F-Score</td><td style="${tdStyle}">${latestData.piotroski_f_score || 0}점</td><td style="${tdStyle}">9점 만점 (높을수록 우수)</td></tr>
                </table>

                <h2 style="${sectionTitleStyle}">3. 손익계산서 요약 (Income Statement)</h2>
                <table style="${tableStyle}">
                    <tr><th style="${thStyle}">구분</th><th style="${thStyle}">금액 (KRW)</th></tr>
                    <tr><td style="${tdStyle}">매출액 (Revenue)</td><td style="${tdStyle}; text-align: right;">${formatCurrency(latestData.revenue)}</td></tr>
                    <tr><td style="${tdStyle}">매출원가 (COGS)</td><td style="${tdStyle}; text-align: right;">${formatCurrency(latestData.cost_of_goods_sold)}</td></tr>
                    <tr><td style="${tdStyle}"><strong>영업이익 (Operating Income)</strong></td><td style="${tdStyle}; text-align: right; font-weight: bold;">${formatCurrency(latestData.operating_income)}</td></tr>
                    <tr><td style="${tdStyle}">이자비용 (Interest Expense)</td><td style="${tdStyle}; text-align: right;">${formatCurrency(latestData.interest_expense)}</td></tr>
                    <tr><td style="${tdStyle}"><strong>당기순이익 (Net Income)</strong></td><td style="${tdStyle}; text-align: right; font-weight: bold;">${formatCurrency(latestData.net_income)}</td></tr>
                </table>

                <h2 style="${sectionTitleStyle}">4. 재무상태표 요약 (Balance Sheet)</h2>
                <table style="${tableStyle}">
                    <tr><th style="${thStyle}">구분</th><th style="${thStyle}">금액 (KRW)</th></tr>
                    <tr style="background-color: #f0f8ff;"><td style="${tdStyle}"><strong>자산총계 (Total Assets)</strong></td><td style="${tdStyle}; text-align: right;"><strong>${formatCurrency(latestData.total_assets)}</strong></td></tr>
                    <tr><td style="${tdStyle}">- 유동자산 (Current Assets)</td><td style="${tdStyle}; text-align: right;">${formatCurrency(latestData.current_assets)}</td></tr>
                    <tr><td style="${tdStyle}">- 비유동자산 (Non-Current Assets)</td><td style="${tdStyle}; text-align: right;">${formatCurrency(latestData.non_current_assets)}</td></tr>
                    
                    <tr style="background-color: #fff0f0;"><td style="${tdStyle}"><strong>부채총계 (Total Liabilities)</strong></td><td style="${tdStyle}; text-align: right;"><strong>${formatCurrency(latestData.total_liabilities)}</strong></td></tr>
                    <tr><td style="${tdStyle}">- 유동부채 (Current Liabilities)</td><td style="${tdStyle}; text-align: right;">${formatCurrency(latestData.current_liabilities)}</td></tr>
                    
                    <tr style="background-color: #f0fff0;"><td style="${tdStyle}"><strong>자본총계 (Total Equity)</strong></td><td style="${tdStyle}; text-align: right;"><strong>${formatCurrency(latestData.total_equity)}</strong></td></tr>
                    <tr><td style="${tdStyle}">- 자본금 (Capital Stock)</td><td style="${tdStyle}; text-align: right;">${formatCurrency(latestData.capital_stock)}</td></tr>
                    <tr><td style="${tdStyle}">- 이익잉여금 (Retained Earnings)</td><td style="${tdStyle}; text-align: right;">${formatCurrency(latestData.retained_earnings)}</td></tr>
                </table>

                <h2 style="${sectionTitleStyle}">5. 현금흐름표 요약 (Cash Flow)</h2>
                <table style="${tableStyle}">
                    <tr><th style="${thStyle}">구분</th><th style="${thStyle}">금액 (KRW)</th></tr>
                    <tr><td style="${tdStyle}">영업활동 현금흐름</td><td style="${tdStyle}; text-align: right;">${formatCurrency(latestData.operating_cash_flow)}</td></tr>
                    <tr><td style="${tdStyle}">투자활동 현금흐름</td><td style="${tdStyle}; text-align: right;">${formatCurrency(latestData.investing_cash_flow)}</td></tr>
                    <tr><td style="${tdStyle}">현금 및 현금성자산의 증가</td><td style="${tdStyle}; text-align: right;">${formatCurrency(latestData.change_in_cash_equivalents)}</td></tr>
                </table>

                <br/>
                <p style="text-align: center; color: #888; font-size: 11px;">
                    본 보고서는 B.S.B 시스템에 의해 자동 생성되었으며, 투자 참고용으로만 활용하시기 바랍니다.<br/>
                    Generated by Balance Sheet System
                </p>
            </div>
        </body>
        </html>
    `;

    // Word 파일 생성 및 다운로드 트리거
    const blob = new Blob(['\ufeff', reportHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedCompany.company_name}_종합보고서_${latestData.period}.doc`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 차트 데이터 포맷팅
  const chartData = financeHistory.map(item => ({
    name: item.period,
    유동성: Number(Number(item.current_ratio || 0).toFixed(1)),
    안정성: Number(Number(item.debt_to_equity_ratio || 0).toFixed(1)),
    수익성: Number(Number(item.roe || 0).toFixed(1)),
    활동성: Number(Number(item.interest_coverage_ratio || 0).toFixed(1)),
  }));

  if (loading) return <div className="min-h-screen bg-[#2c2c2c] flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="bg-[linear-gradient(180deg,rgba(44,44,44,1)_3%,rgba(69,69,69,1)_17%,rgba(102,102,102,1)_69%,rgba(166,166,166,1)_100%)] w-full min-h-screen relative overflow-x-hidden pb-20 font-sans">
      
      {/* 상단 헤더 */}
      <div className="pt-20 text-center relative z-10 px-4">
        <h1 className="font-normal text-white text-6xl md:text-8xl tracking-[-2.40px] leading-[1.2] mb-4 font-serif">B.S.B</h1>
        <p className="font-normal text-white text-4xl md:text-6xl tracking-[-1.50px] leading-[1.2]">
          <span className="tracking-[-0.90px] font-bold">{selectedCompany.company_name} </span>
          <span className="text-2xl md:text-[40px] tracking-[-0.40px] opacity-80 block md:inline mt-2 md:mt-0">
            (기준: {latestData?.period || '데이터 없음'})
          </span>
        </p>
        <button onClick={() => navigate('/search')} className="absolute top-10 right-4 md:right-10 flex items-center gap-2 text-white text-lg md:text-[25px] hover:text-gray-300 transition-colors">
            <ArrowLeft /> Back
        </button>
      </div>

      {/* 메인 레이아웃 */}
      <div className="max-w-[1600px] mx-auto px-6 mt-16 flex flex-col xl:flex-row gap-12 items-start relative z-10">
        
        {/* 좌측 사이드바 */}
        <div className="w-full xl:w-[280px] flex flex-col gap-6 xl:sticky xl:top-24 flex-none order-2 xl:order-1">
            <button onClick={handleDownloadReport} className="w-full h-[61px] relative group cursor-pointer">
               <div className="absolute top-0 left-0 w-full h-full bg-[#f0f0f0] rounded-[20px] shadow-lg group-hover:bg-white transition-colors" />
               <div className="absolute top-3 left-4 w-[40px] h-[40px] bg-gray-200 rounded-full flex items-center justify-center">
                 <FileText className="w-5 h-5 text-gray-700" />
               </div>
               <span className="absolute top-4 left-16 text-[#050505] text-[18px] font-bold tracking-tight">종합 보고서 다운로드</span>
            </button>

            <button onClick={() => setSidebarOpen(true)} className="w-full h-[61px] relative group cursor-pointer">
               <div className="absolute top-0 left-0 w-full h-full bg-[#f0f0f0] rounded-[20px] shadow-lg group-hover:bg-white transition-colors" />
               <span className="absolute top-4 left-6 text-[#050505] text-[18px] font-bold tracking-tight">가중치 설정하기</span>
               <div className="absolute top-3 right-4 w-[38px] h-[38px] bg-black rounded-full flex items-center justify-center">
                 <SlidersHorizontal className="w-5 h-5 text-white" />
               </div>
            </button>
        </div>

        {/* 우측 메인 콘텐츠 */}
        <div className="flex-1 w-full order-1 xl:order-2">
            <div className="flex justify-center mb-12">
                <div className="bg-white/10 backdrop-blur-md p-1 rounded-full flex gap-2 border border-white/20">
                    {['일반 분석', '업종대비 비교', '지역대비 비교'].map(mode => (
                        <button key={mode} 
                            onClick={() => { 
                                setAnalysisMode(mode); 
                                if(mode === '업종대비 비교') navigate('/industry-compare', { state: { selectedCompany, latestData }}); 
                                if(mode === '지역대비 비교') navigate('/region-compare', { state: { selectedCompany, latestData }});
                            }}
                            className={`px-6 py-2 rounded-full text-lg font-bold transition-all ${analysisMode === mode ? 'bg-white text-black shadow-md' : 'text-gray-300 hover:bg-white/20'}`}>
                            {mode}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto">
                {/* 위험 점수 & AI 분석 */}
                <div className="flex flex-col lg:flex-row gap-6 mb-12 min-h-[240px]">
                   <div className="w-full lg:w-[350px] h-[240px] relative">
                      <WindowCard color={riskStatus.color} className="w-full h-full">
                          <div className="text-xl font-semibold text-gray-600 mb-2">종합 위험 지수</div>
                          <div className="text-7xl font-bold mb-2" style={{ color: riskStatus.color }}>{riskScore}점</div>
                          <div className="text-xl font-medium text-gray-800">{riskStatus.text}</div>
                      </WindowCard>
                   </div>
                   <div className="w-full lg:flex-1 h-[240px] relative">
                      <WindowCard color="#919191" className="w-full h-full">
                          <div className="w-full h-full p-6 flex flex-col">
                              <span className="text-xl font-bold text-gray-800 mb-4">Gemini AI 정밀 진단</span>
                              <div className="flex-1 overflow-y-auto pr-2 text-[15px] leading-relaxed text-gray-700 whitespace-pre-line custom-scrollbar">
                                  {aiAnalysis}
                              </div>
                          </div>
                      </WindowCard>
                   </div>
                </div>

                {/* 4대 지표 카드 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    <WindowCard color="#5252ff" className="h-[140px]">
                        <div className="text-[#5252ff] text-4xl font-bold mb-1">{Number(latestData?.current_ratio || 0).toFixed(0)}%</div>
                        <div className="text-gray-500 font-bold text-lg">유동성</div>
                        <div className="text-xs text-gray-400 mt-2">유동 비율 (200% 우수)</div>
                    </WindowCard>
                    <WindowCard color="#ff2912" className="h-[140px]">
                        <div className="text-[#ff2912] text-4xl font-bold mb-1">{Number(latestData?.debt_to_equity_ratio || 0).toFixed(0)}%</div>
                        <div className="text-gray-500 font-bold text-lg">안정성</div>
                        <div className="text-xs text-gray-400 mt-2">부채 비율 (100% 이하 우수)</div>
                    </WindowCard>
                    <WindowCard color="#24992e" className="h-[140px]">
                        <div className="text-[#24992e] text-4xl font-bold mb-1">{Number(latestData?.roe || 0).toFixed(1)}%</div>
                        <div className="text-gray-500 font-bold text-lg">수익성</div>
                        <div className="text-xs text-gray-400 mt-2">ROE (15% 이상 우수)</div>
                    </WindowCard>
                    <WindowCard color="#fcb124" className="h-[140px]">
                        <div className="text-[#fcb124] text-4xl font-bold mb-1">{Number(latestData?.interest_coverage_ratio || 0).toFixed(1)}배</div>
                        <div className="text-gray-500 font-bold text-lg">활동성</div>
                        <div className="text-xs text-gray-400 mt-2">이자보상배율 (3배 이상 안정)</div>
                    </WindowCard>
                </div>

                {/* 차트 영역 */}
                <div className="bg-white rounded-[10px] p-6 shadow-lg relative h-[470px]">
                    <h3 className="text-2xl font-bold text-black mb-6 absolute top-8 left-8">4대 지표 추이 분석</h3>
                    <div className="w-full h-full pt-12">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis dataKey="name" tick={{fontSize: 12}} />
                                <YAxis yAxisId="left" orientation="left" stroke="#888" />
                                <YAxis yAxisId="right" orientation="right" stroke="#888" />
                                <Tooltip />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Line yAxisId="left" name="유동성" type="monotone" dataKey="유동성" stroke="#5252ff" strokeWidth={3} dot={{r:4}} />
                                <Line yAxisId="left" name="안정성" type="monotone" dataKey="안정성" stroke="#ff2912" strokeWidth={3} dot={{r:4}} />
                                <Line yAxisId="right" name="수익성" type="monotone" dataKey="수익성" stroke="#24992e" strokeWidth={3} dot={{r:4}} />
                                <Line yAxisId="right" name="활동성" type="monotone" dataKey="활동성" stroke="#fcb124" strokeWidth={3} dot={{r:4}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 가중치 사이드바 */}
      <div className={`fixed top-0 left-0 h-full w-full max-w-[500px] bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-y-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <div className="relative w-full h-full min-h-[900px] p-8 flex flex-col">
            <div className="flex justify-between items-start mb-8">
                <button onClick={() => setSidebarOpen(false)} className="text-black text-[25px] font-medium tracking-tight hover:text-[#6055ff] transition-colors flex items-center gap-2">← Back</button>
            </div>
            <h1 className="text-black text-[35px] font-medium tracking-[-0.88px] mb-4 font-sans">위험 지표 가중치 조절</h1>
            <div className="w-[357px] h-[3px] bg-black mb-12" />

            <div className="flex flex-col gap-2">
                <CustomSlider label="안정성" value={weights.stability} onChange={(e) => setWeights({...weights, stability: Number(e.target.value)})} />
                <CustomSlider label="유동성" value={weights.liquidity} onChange={(e) => setWeights({...weights, liquidity: Number(e.target.value)})} />
                <CustomSlider label="수익성" value={weights.profitability} onChange={(e) => setWeights({...weights, profitability: Number(e.target.value)})} />
                <CustomSlider label="활동성" value={weights.activity} onChange={(e) => setWeights({...weights, activity: Number(e.target.value)})} />
            </div>

            <div className="mt-8 bg-[#deedff] rounded-[20px] p-6 shadow-md mb-8">
                <p className="text-xl leading-[30px] font-normal font-sans">
                    가중치를 변경하면,<br/>메인 화면의 종합 위험 지수(점수)가<br/>실시간으로 <span className="text-[#ff0000] font-bold">재계산</span>됩니다.
                </p>
            </div>

            <div className="mt-auto pb-8 flex justify-center w-full">
                <button onClick={() => setWeights({ liquidity: 25, stability: 25, profitability: 25, activity: 25 })} className="w-[333px] h-[62px] bg-[#ff4444] rounded-[20px] relative overflow-hidden shadow-[2px_4px_5px_rgba(0,0,0,0.25)] hover:bg-[#e63939] transition-colors group">
                    <div className="absolute top-[11px] left-[52px] w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <div className="w-7 h-7 bg-[#ff4444] rounded-full flex items-center justify-center shadow-inner">
                            <Play className="w-3 h-3 text-white fill-current ml-0.5" />
                        </div>
                    </div>
                    <span className="text-white text-[22px] font-bold tracking-tight absolute top-[15px] left-0 w-full text-center pl-8">가중치 초기화</span>
                </button>
            </div>
         </div>
      </div>
      
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
};