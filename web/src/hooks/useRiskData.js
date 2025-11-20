import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useRiskData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Supabase 쿼리: financial_reports 테이블과 companies 테이블을 조인합니다.
        const { data: result, error } = await supabase
          .from('financial_reports')
          .select(`
            stock_code,
            period,
            current_ratio,
            debt_to_equity_ratio,
            altman_z_score,
            companies (
              company_name,
              industry,
              market_cap_recent
            )
          `)
          // 부채비율이 있는 데이터만 가져오거나, 정렬 조건을 추가할 수 있습니다.
          .not('debt_to_equity_ratio', 'is', null)
          .order('debt_to_equity_ratio', { ascending: true }) // 부채비율 낮은 순 정렬
          .limit(20); // 일단 20개만 가져오기

        if (error) throw error;
        
        setData(result || []);
      } catch (err) {
        console.error('Error fetching risk data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};