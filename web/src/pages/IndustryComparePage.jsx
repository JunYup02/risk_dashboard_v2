import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Activity, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from "../lib/supabaseClient";

// --- [컴포넌트] 비교 분석 카드 ---
const CompareCard = ({ label, corpValue, industryValue, color, icon: Icon }) => {
    // 부채비율(안정성)은 낮을수록 우수, 나머지는 높을수록 우수
    const isDebt = label.includes('부채');
    const isPositive = isDebt ? corpValue < industryValue : corpValue > industryValue;
    const diff = corpValue - industryValue;
    const unit = label.includes('배') ? '배' : '%';

    return (
        <div className="bg-white rounded-xl p-5 shadow-lg border-b-4 border-r-4 h-full transition-shadow hover:shadow-2xl" style={{ borderColor: color }}>
            <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold uppercase text-gray-500">{label.split('(')[0].trim()}</div>
                <Icon className="w-5 h-5" style={{ color }} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-center mb-4">
                <div className={`p-2 rounded-lg border ${isPositive ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="text-xs text-gray-500 mb-1">내 기업</div>
                    <div className="text-xl font-extrabold text-gray-900">
                        {corpValue.toFixed(0)}{unit}
                    </div>
                </div>
                <div className="p-2 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="text-xs text-gray-500 mb-1">업종 평균</div>
                    <div className="text-xl font-bold text-gray-600">
                        {industryValue.toFixed(0)}{unit}
                    </div>
                </div>
            </div>

            <div className={`mt-3 py-2 px-3 rounded-lg text-xs font-bold text-center flex justify-between items-center ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <span>{isPositive ? '우수' : '부족'}</span>
                <span>{diff > 0 ? '+' : ''}{diff.toFixed(1)}{unit} 차이</span>
            </div>
        </div>
    );
};

export const IndustryComparePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // 기업 정보
    const selectedCompany = location.state?.selectedCompany || { company_name: "샘플전자", stock_code: "005930", industry: "IT 서비스" };
    const latestData = location.state?.latestData || { current_ratio: 180, debt_to_equity_ratio: 60, roe: 14, interest_coverage_ratio: 9, period: '2023-4Q' };
    
    const [industryData, setIndustryData] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [analysisMode] = useState('업종 비교');

    // 1. Supabase에서 업종 평균 데이터 조회 (DB 테이블 조회 로직)
    useEffect(() => {
        const fetchIndustryData = async () => {
            setLoading(true);
            try {
                // 1. 선택 기업의 업종 정보가 없을 경우, companies 테이블에서 업종을 가져옵니다.
                const { data: companyInfo } = await supabase
                    .from('companies')
                    .select('industry')
                    .eq('stock_code', selectedCompany.stock_code)
                    .single();

                const industryName = companyInfo?.industry || selectedCompany.industry || 'Unknown';

                // 2. 'industry_averages' 뷰에서 해당 업종의 평균값을 직접 조회합니다.
                const { data: avgData, error: avgError } = await supabase
                    .from('industry_averages') // DB에 이 뷰가 있어야 합니다!
                    .select('avg_current_ratio, avg_debt_to_equity_ratio, avg_roe, avg_interest_coverage_ratio')
                    .eq('industry', industryName)
                    .single();

                if (avgError || !avgData) throw avgError || new Error(`업종 평균 데이터 조회 실패: ${industryName} 업종 데이터 없음`);

                // 3. State 업데이트
                setIndustryData({
                    current_ratio: avgData.avg_current_ratio || 0,
                    debt_to_equity_ratio: avgData.avg_debt_to_equity_ratio || 0,
                    roe: avgData.avg_roe || 0,
                    interest_coverage_ratio: avgData.avg_interest_coverage_ratio || 0,
                    industryName: industryName
                });

            } catch (error) {
                console.error("업종 평균 데이터 로드 오류 (DB):", error);
                // DB 오류 시 고정된 데모 데이터 사용 (최소한의 신뢰성 유지)
                setIndustryData({
                    current_ratio: 170, debt_to_equity_ratio: 100, roe: 12, interest_coverage_ratio: 7,
                    industryName: selectedCompany.industry || '데모 업종'
                });
            }
            setLoading(false);
        };
        fetchIndustryData();
    }, [selectedCompany, latestData]);

    // 2. 규칙 기반 분석 텍스트 생성 로직
    const generateRuleBasedAnalysis = (corp, industry) => {
        if (!industry) return "업종 평균 데이터 로딩 중입니다.";

        const analysis = [];
        const isDebtBetter = corp.debt_to_equity_ratio < industry.debt_to_equity_ratio;
        const isLiqBetter = corp.current_ratio > industry.current_ratio;
        const isRoeBetter = corp.roe > industry.roe;
        const isIcrBetter = corp.interest_coverage_ratio > industry.interest_coverage_ratio;

        // 분석 결과를 배열에 담아 줄바꿈으로 반환
        analysis.push(`✅ **유동성:** 업종 평균(${industry.current_ratio.toFixed(0)}%) 대비 ${corp.current_ratio.toFixed(0)}%로 ${isLiqBetter ? '상당히 우수' : '낮은 편'}입니다. 단기 자금 운용에 ${isLiqBetter ? '안정적' : '주의 필요'}.`);
        analysis.push(`✅ **안정성:** 부채 비율이 업종 평균(${industry.debt_to_equity_ratio.toFixed(0)}%)보다 ${isDebtBetter ? '낮아' : '높아'} ${isDebtBetter ? '매우 건전' : '리스크 관리 필요'}.`);
        analysis.push(`✅ **수익성:** ROE가 업종 평균(${industry.roe.toFixed(1)}%)보다 ${isRoeBetter ? '높아' : '낮아'} 경영 효율성이 ${isRoeBetter ? '우수' : '개선 필요'}.`);
        analysis.push(`✅ **활동성:** 이자보상배율이 업종 평균(${industry.interest_coverage_ratio.toFixed(1)}배) 대비 ${isIcrBetter ? '높아' : '낮아'} 영업 건전성에 ${isIcrBetter ? '문제 없음' : '적신호'}.`);

        return analysis.join('\n\n');
    };

    const ruleBasedAnalysis = industryData ? generateRuleBasedAnalysis(latestData, industryData) : "업종 평균 데이터 로딩 중입니다.";

    const handleModeChange = (mode) => {
        if (mode === '단일 분석') {
            navigate('/dashboard', { state: location.state });
        } else if (mode === '지역 비교') {
            navigate('/region-compare', { state: location.state });
        }
    };

    // 4대 지표 데이터 준비
    const metricsToCompare = [
        { key: 'current_ratio', label: '유동성 (%)', icon: CheckCircle, color: '#0064ff' },
        { key: 'debt_to_equity_ratio', label: '안정성 (부채 %)', icon: AlertTriangle, color: '#ff0000' },
        { key: 'roe', label: '수익성 (%)', icon: TrendingUp, color: '#00cc66' },
        { key: 'interest_coverage_ratio', label: '활동성 (배)', icon: Activity, color: '#ec6a00' },
    ];
    
    // BarChart 데이터 생성
    const barChartData = metricsToCompare.map(metric => ({
        name: metric.label.split(' ')[0],
        '선택기업': latestData[metric.key] ? Number(latestData[metric.key].toFixed(1)) : 0,
        '업종평균': industryData?.[metric.key] ? Number(industryData[metric.key].toFixed(1)) : 0,
    }));


    if (loading) return <div className="w-full h-screen flex items-center justify-center bg-[#1a1a1a] text-white text-3xl">업종 평균 데이터 분석 중...</div>;

    return (
        <div className="w-full min-h-screen bg-[#1a1a1a] overflow-y-auto overflow-x-hidden">
            
            {/* Header (Dashboard와 통일) */}
            <header className="sticky top-0 w-full h-[100px] flex items-center justify-between px-10 z-30 bg-gray-900/90 shadow-lg backdrop-blur-sm border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <h1 className="text-3xl font-bold text-white">업종 비교 분석</h1>
                </div>
                <div className="text-xl font-semibold text-white">
                    {selectedCompany.company_name} ({selectedCompany.industry})
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
                                    mode === analysisMode
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 1. 4대 지표 Bar Chart */}
                <section className="mb-10 p-8 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-red-500" /> 기업 vs 업종 평균 지표 비교
                        </h3>
                        <div className="w-full h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />
                                    <XAxis dataKey="name" tick={{ fontSize: 14, fill: '#bbb' }} />
                                    <YAxis tick={{ fontSize: 14, fill: '#bbb' }} />
                                    <Tooltip 
                                        cursor={{fill: 'transparent'}}
                                        contentStyle={{ borderRadius: '8px', border: 'none', background: '#333', color: 'white' }}
                                    />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="선택기업" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={50} />
                                    <Bar dataKey="업종평균" fill="#9ca3af" radius={[6, 6, 0, 0]} barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>

                {/* 2. 상세 지표 카드 비교 (Grid) */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {metricsToCompare.map(metric => {
                        const corp = latestData[metric.key] || 0;
                        const industry = industryData?.[metric.key] || 0;
                        return (
                            <CompareCard
                                key={metric.key}
                                label={metric.label}
                                corpValue={corp}
                                industryValue={industry}
                                color={metric.color}
                                icon={metric.icon}
                            />
                        );
                    })}
                </section>

                {/* 3. 규칙 기반 비교 분석 요약 */}
                <section className="mt-10 p-8 bg-gray-800 border-l-4 border-blue-500 rounded-2xl shadow-xl">
                    <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                        <Zap className="w-6 h-6" /> 규칙 기반 심층 분석
                    </h3>
                    <div className="text-base text-gray-300 leading-relaxed whitespace-pre-line">
                        {ruleBasedAnalysis}
                    </div>
                </section>

            </div>
        </div>
    );
};