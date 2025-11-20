import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, X, RefreshCw, TrendingUp, Activity, AlertTriangle, CheckCircle, Zap, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from "../lib/supabaseClient";
import { getFinancialAnalysis } from "../lib/gemini";

// --- [컴포넌트] 개별 지표 카드 ---
const StatCard = ({ label, value, color, icon: Icon, description }) => (
  <div className="bg-white rounded-xl p-5 shadow-lg flex flex-col justify-between h-full border-b-4 border-l-4 hover:shadow-2xl transition-shadow" style={{ borderColor: color }}>
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm font-semibold uppercase text-gray-500">{label}</div>
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <div className="text-3xl font-extrabold text-gray-900 mb-1" style={{ color }}>
      {value}
    </div>
    <p className="text-xs text-gray-400">{description}</p>
  </div>
);

// --- 커스텀 정렬 함수 ---
const sortFinancialData = (a, b) => {
    const yearA = parseInt(a.period.slice(0, 4));
    const yearB = parseInt(b.period.slice(0, 4));
    if (yearA !== yearB) return yearA - yearB;

    const quarterOrder = { '1Q': 1, '2Q': 2, 'Semi': 2, '3Q': 3, '4Q': 4, 'Annual': 4 };
    
    const getQuarterString = (period) => {
        const parts = period.split('-');
        return parts.length > 1 ? parts[1] : period.slice(4);
    };
    
    const orderA = quarterOrder[getQuarterString(a.period)] || 5;
    const orderB = quarterOrder[getQuarterString(b.period)] || 5;

    return orderA - orderB;
};

export const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analysisMode, setAnalysisMode] = useState('단일 분석'); 
  
  // 기업 정보
  const selectedCompany = location.state?.selectedCompany || { company_name: "샘플전자", stock_code: "005930" };
  
  const [financeHistory, setFinanceHistory] = useState([]); 
  const [latestData, setLatestData] = useState(null);     
  const [aiAnalysis, setAiAnalysis] = useState("AI가 재무제표를 분석하고 있습니다...");
  const [riskScore, setRiskScore] = useState(0);
  const [weights, setWeights] = useState({ liquidity: 25, stability: 25, profitability: 25, activity: 25 });
  const [loading, setLoading] = useState(true);

  // 1. Supabase 데이터 전체 조회
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('financial_reports')
          .select('*')
          .eq('stock_code', selectedCompany.stock_code)
          .order('period', { ascending: true });

        if (data && data.length > 0) {
          let sortedData = data;
          sortedData.sort(sortFinancialData); 
          setFinanceHistory(sortedData);
          setLatestData(sortedData[sortedData.length - 1]);
        } else {
          // 데이터가 없을 경우 더미 데이터 생성
          const dummyHistory = [
            { period: '2020-1Q', current_ratio: 100, debt_to_equity_ratio: 150, roe: 5, interest_coverage_ratio: 2, altman_z_score: 1.2, piotroski_f_score: 5, total_assets: 100000000, total_liabilities: 45000000, total_equity: 55000000 },
            { period: '2021-1Q', current_ratio: 120, debt_to_equity_ratio: 130, roe: 8, interest_coverage_ratio: 4, altman_z_score: 1.5, piotroski_f_score: 6, total_assets: 110000000, total_liabilities: 47826087, total_equity: 62173913 },
            { period: '2022-1Q', current_ratio: 150, debt_to_equity_ratio: 100, roe: 12, interest_coverage_ratio: 8, altman_z_score: 2.0, piotroski_f_score: 7, total_assets: 120000000, total_liabilities: 54545455, total_equity: 65454545 },
            { period: '2023-1Q', current_ratio: 180, debt_to_equity_ratio: 60, roe: 14, interest_coverage_ratio: 9, altman_z_score: 3.0, piotroski_f_score: 8, total_assets: 130000000, total_liabilities: 48750000, total_equity: 81250000 },
          ];
          setFinanceHistory(dummyHistory);
          setLatestData(dummyHistory[dummyHistory.length - 1]);
        }
      } catch (err) { console.error("데이터 로딩 실패:", err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [selectedCompany]);

  // 2. AI 분석 및 위험 점수 계산
  useEffect(() => {
    if (!latestData) return;

    const metrics = {
      currentRatio: Number(latestData.current_ratio || 0),
      debtRatio: Number(latestData.debt_to_equity_ratio || 0),
      roe: Number(latestData.roe || 0),
      activity: Number(latestData.interest_coverage_ratio || 0),
      zScore: Number(latestData.altman_z_score || 0)
    };

    if (aiAnalysis.includes("분석하고 있습니다")) {
        getFinancialAnalysis(selectedCompany.company_name, metrics)
            .then(setAiAnalysis)
            .catch(() => setAiAnalysis("AI 분석 서버 연결 실패. .env 파일의 API 키를 확인해주세요."));
    }

    const calcScore = () => {
      const liqScore = Math.min(metrics.currentRatio / 200 * 100, 100);
      const stabScore = Math.max(0, 100 - (Math.max(0, metrics.debtRatio - 100) / 3));
      const profScore = Math.min(metrics.roe * 5, 100);
      const actScore = Math.min(metrics.activity * 10, 100);

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

  const handleWeightChange = (e) => {
    setWeights({ ...weights, [e.target.name]: Number(e.target.value) });
  };
  
  const handleModeChange = (mode) => {
      setAnalysisMode(mode);
      if (mode === '업종 비교') {
          navigate('/industry-compare', { state: { selectedCompany: selectedCompany, latestData: latestData }});
      } else if (mode === '지역 비교') {
          navigate('/region-compare', { state: { selectedCompany: selectedCompany, latestData: latestData }});
      }
  };

  // --- [핵심 기능] 종합 보고서 (Markdown) 다운로드 함수 ---
  const handleDownloadReport = async () => {
    if (!latestData) {
        alert("최신 재무 데이터가 준비되지 않아 보고서를 생성할 수 없습니다.");
        return;
    }
    
    try {
        const { data: fullReportData, error } = await supabase
            .from('financial_reports')
            .select('*')
            .eq('stock_code', selectedCompany.stock_code)
            .order('period', { ascending: false })
            .limit(1)
            .single(); 

        if (error || !fullReportData) throw error || new Error("상세 재무 데이터 조회 실패");

        const formatValue = (key, value) => {
            if (value === null || value === undefined) return 'N/A';
            if (key.includes('assets') || key.includes('liabilities') || key.includes('equity')) {
                 return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(value);
            }
            if (key.includes('ratio') || key.includes('roe')) return `${Number(value).toFixed(2)} %`;
            if (key.includes('score')) return Number(value).toFixed(2);
            if (key.includes('coverage')) return `${Number(value).toFixed(2)} 배`;
            return value;
        };
        
        let reportContent = `# ${selectedCompany.company_name} - 종합 재무 분석 보고서\n`;
        reportContent += `\n**기준 보고서 기간:** ${fullReportData.period}\n`;
        reportContent += `**생성 일자:** ${new Date().toLocaleDateString('ko-KR')}\n\n`;
        reportContent += `--- \n\n`;

        reportContent += `## 1. Gemini AI 심층 분석 결과\n`;
        reportContent += `\n**종합 위험 점수:** ${riskScore}점\n`;
        reportContent += `\n${aiAnalysis.replace(/\*\*/g, '').replace(/✅/g, '-')}\n`;
        reportContent += `\n--- \n\n`;

        reportContent += `## 2. 핵심 성과 지표 (Key Performance Indicators)\n`;
        reportContent += `\n| 지표명 | 값 | 평가 기준 |\n`;
        reportContent += `| :--- | :--- | :--- |\n`;
        reportContent += `| 유동 비율 (Current Ratio) | ${formatValue('current_ratio', fullReportData.current_ratio)} | 단기 지불 능력 (200% 이상 우수) |\n`;
        reportContent += `| 부채 비율 (Debt/Equity Ratio) | ${formatValue('debt_to_equity_ratio', fullReportData.debt_to_equity_ratio)} | 재무 안정성 (100% 이하 우수) |\n`;
        reportContent += `| 자기자본이익률 (ROE) | ${formatValue('roe', fullReportData.roe)} | 자본 활용 수익성 (높을수록 우수) |\n`;
        reportContent += `| 이자보상 배율 (Interest Coverage Ratio) | ${formatValue('interest_coverage_ratio', fullReportData.interest_coverage_ratio)} | 이자 부담 능력 (1.5배 이상 안전) |\n`;
        reportContent += `\n--- \n\n`;

        reportContent += `## 3. 종합 재무 건전성 및 효율 지표 (Raw Data)\n`;
        reportContent += `\n| 지표명 | 값 |\n`;
        reportContent += `| :--- | :--- |\n`;
        reportContent += `| Altman Z-Score | ${formatValue('altman_z_score', fullReportData.altman_z_score)} |\n`;
        reportContent += `| Piotroski F-Score | ${formatValue('piotroski_f_score', fullReportData.piotroski_f_score)} |\n`;
        reportContent += `| 총자산 (Total Assets) | ${formatValue('total_assets', fullReportData.total_assets)} |\n`;
        reportContent += `| 총부채 (Total Liabilities) | ${formatValue('total_liabilities', fullReportData.total_liabilities)} |\n`;
        reportContent += `| 총자본 (Total Equity) | ${formatValue('total_equity', fullReportData.total_equity)} |\n`;
        reportContent += `| 영업현금흐름 (Operating Cash Flow) | ${formatValue('operating_cash_flow', fullReportData.operating_cash_flow)} |\n`;
        reportContent += `| 매출액 (Revenue) | ${formatValue('revenue', fullReportData.revenue)} |\n`;
        reportContent += `\n--- \n\n`;
        reportContent += `\n*본 보고서는 재무 데이터와 AI 분석을 기반으로 작성되었으며, 투자 결정의 참고 자료로만 활용해야 합니다.*\n`;


        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), reportContent], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${selectedCompany.company_name}_종합분석보고서_${fullReportData.period}.md`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error("보고서 다운로드 실패:", error);
        alert(`보고서 다운로드 중 오류가 발생했습니다. DB 연결 및 데이터 존재 여부를 확인해주세요: ${error.message}`);
    }
  };

  // 4대 지표 차트 데이터 매핑
  const chartData = financeHistory.map(item => ({
    name: item.period.slice(0, 4) + '.' + item.period.slice(-2),
    유동성: Number(Number(item.current_ratio || 0).toFixed(1)),
    안정성: Number(Number(item.debt_to_equity_ratio || 0).toFixed(1)),
    수익성: Number(Number(item.roe || 0).toFixed(1)),
    활동성: Number(Number(item.interest_coverage_ratio || 0).toFixed(1)),
  }));

  const latestMetrics = {
    유동성: { value: `${Number(latestData?.current_ratio || 0).toFixed(0)}%`, color: '#0064ff', icon: CheckCircle, desc: "유동 비율 (200% 우수)" },
    안정성: { value: `${Number(latestData?.debt_to_equity_ratio || 0).toFixed(0)}%`, color: '#ff0000', icon: AlertTriangle, desc: "부채 비율 (100% 이하 우수)" },
    수익성: { value: `${Number(latestData?.roe || 0).toFixed(1)}%`, color: '#00cc66', icon: TrendingUp, desc: "ROE (15% 이상 우수)" },
    활동성: { value: `${Number(latestData?.interest_coverage_ratio || 0).toFixed(1)}배`, color: '#ec6a00', icon: Activity, desc: "이자보상배율 (3배 이상 안정)" },
  };


  if (loading) return <div className="w-full h-screen flex items-center justify-center bg-black text-white text-3xl">데이터 로딩 중...</div>;

  return (
    <div className="w-full min-h-screen bg-[#1a1a1a] overflow-y-auto overflow-x-hidden">
      
      {/* --- Header (Sticky & Dark Tone) --- */}
      <header className="sticky top-0 bg-gray-900/90 shadow-lg p-4 flex justify-between items-center z-30 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/search')} className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl font-bold text-white">
            {selectedCompany.company_name} <span className="text-base text-gray-400">({latestData?.period || '최신'})</span>
          </h1>
        </div>
        
        {/* 보고서 다운로드 및 사이드바 버튼 그룹 */}
        <div className="flex items-center gap-4">
            <button 
              onClick={handleDownloadReport} // 종합 보고서 다운로드 함수 연결
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 shadow-md cursor-pointer transition-colors"
            >
                <Download className="w-5 h-5" />
                <span className="font-bold">종합 보고서 다운로드 (.md)</span>
            </button>

            <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md transition-colors">
              <Menu /> <span className="font-bold">가중치 설정</span>
            </button>
        </div>

      </header>

      {/* --- Main Content Area --- */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* 0. 분석 모드 탭 */}
        <div className="flex justify-center mb-8">
            <div className="flex bg-gray-700 rounded-full shadow-inner border border-gray-600">
                {['단일 분석', '업종 비교', '지역 비교'].map(mode => (
                    <button
                        key={mode}
                        onClick={() => handleModeChange(mode)}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${
                            analysisMode === mode
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        {mode}
                    </button>
                ))}
            </div>
        </div>

        {/* 1. 종합 위험 지수 및 AI 분석 (Grid Layout) */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          
          {/* A. 종합 점수 카드 (2/5 너비) */}
          <div className="lg:col-span-2 bg-gray-800 rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center border-t-8 border-r-8" style={{ borderColor: riskScore < 50 ? '#ff0000' : riskScore < 70 ? '#ffc107' : '#00cc66' }}>
            <h2 className="text-xl font-bold text-gray-400 uppercase mb-4">종합 위험 지수</h2>
            <div className={`text-7xl font-extrabold mb-2 ${riskScore < 50 ? 'text-red-500' : riskScore < 70 ? 'text-yellow-400' : 'text-green-500'}`}>
              {riskScore}점
            </div>
            <p className="text-lg font-semibold text-white mt-2">
              {riskScore >= 80 ? '매우 안전한 상태입니다.' : riskScore >= 50 ? '주의가 필요합니다.' : '위험 수준입니다.'}
            </p>
          </div>
          
          {/* B. AI 분석 리포트 (3/5 너비) */}
          <div className="lg:col-span-3 bg-gray-800 rounded-2xl shadow-xl p-8 border-l-4 border-blue-500">
            <h3 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6" /> Gemini AI 정밀 진단
            </h3>
            <div className="text-base leading-relaxed text-gray-200 whitespace-pre-line max-h-[250px] overflow-y-auto">
              {aiAnalysis}
            </div>
          </div>
        </section>

        {/* 2. 4대 지표 카드 */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10 h-[150px]">
          {Object.keys(latestMetrics).map(key => {
            const metric = latestMetrics[key];
            return (
              <StatCard 
                key={key}
                label={key.toUpperCase()}
                value={metric.value}
                color={metric.color}
                icon={metric.icon}
                description={metric.desc}
              />
            );
          })}
        </section>

        {/* 3. 4대 지표 추이 그래프 */}
        <section className="bg-gray-800 rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" /> 4대 지표 추이 분석 ({chartData[0]?.name} ~ {chartData[chartData.length - 1]?.name})
          </h3>
          <div className="w-full h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />
                
                {/* X축: 기간 표시 */}
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#bbb'}} interval={chartData.length > 20 ? 4 : 0} angle={-30} textAnchor="end" height={50} />
                
                {/* 왼쪽 Y축: 유동성, 안정성 (단위가 큼) */}
                <YAxis yAxisId="left" tick={{fontSize: 12, fill: '#fcd34d'}} orientation="left" stroke="#fcd34d" label={{ value: '비율 (%)', angle: -90, position: 'insideLeft', fill: '#fcd34d' }} />
                
                {/* 오른쪽 Y축: 수익성, 활동성 (단위가 작음) */}
                <YAxis yAxisId="right" tick={{fontSize: 12, fill: '#818cf8'}} orientation="right" stroke="#818cf8" label={{ value: '수익성 (%) / 활동성 (배)', angle: 90, position: 'insideRight', fill: '#818cf8' }} />
                
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', background: '#333', color: 'white' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ paddingBottom: '10px' }} />
                
                {/* 4대 지표 라인 그리기 */}
                <Line yAxisId="left" name="유동성(%)" type="monotone" dataKey="유동성" stroke="#00b0ff" strokeWidth={2} dot={false} />
                <Line yAxisId="left" name="안정성(부채비율 %)" type="monotone" dataKey="안정성" stroke="#ff4d4d" strokeWidth={2} dot={false} />
                <Line yAxisId="right" name="수익성(ROE %)" type="monotone" dataKey="수익성" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line yAxisId="right" name="활동성(이자보상배율 배)" type="monotone" dataKey="활동성" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* --- Right Sidebar (가중치 설정) --- */}
      <div className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl transform transition-transform duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 flex flex-col h-full bg-gray-50">
          <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Zap className="text-blue-600" /> 위험 지표 설정
            </h2>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
          </div>
          
          <div className="space-y-6 flex-1 overflow-y-auto">
            {['liquidity', 'stability', 'profitability', 'activity'].map(key => (
              <div key={key} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between mb-2 items-center">
                  <label className="font-bold capitalize text-gray-700">{key}</label>
                  <span className="font-bold text-lg text-blue-600">{weights[key]}%</span>
                </div>
                <input 
                  type="range" name={key} min="0" max="100" step="5" value={weights[key]} 
                  onChange={handleWeightChange} 
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            ))}
            <div className="p-4 bg-yellow-50 rounded-lg text-sm text-yellow-800 border border-yellow-200 mt-6">
              가중치를 변경하면, 메인 화면의 종합 위험 지수(점수)가 실시간으로 재계산됩니다.
            </div>
          </div>
          
          <button onClick={() => setWeights({ liquidity: 25, stability: 25, profitability: 25, activity: 25 })} className="mt-auto py-3 bg-red-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors">
            <RefreshCw /> 가중치 초기화
          </button>
        </div>
      </div>
      
      {/* 사이드바 오버레이 */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
};