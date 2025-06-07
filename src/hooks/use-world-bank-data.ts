
import { useState, useEffect } from 'react';

interface WorldBankData {
  year: string;
  value: number;
}

interface EconomicIndicators {
  population: { value: number; year: string } | null;
  inflation: WorldBankData[];
  gdpGrowth: WorldBankData[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string;
}

export const useWorldBankData = () => {
  const [data, setData] = useState<EconomicIndicators>({
    population: null,
    inflation: [],
    gdpGrowth: [],
    isLoading: true,
    error: null,
    lastUpdated: ''
  });

  const fetchWorldBankData = async (indicator: string, years: number = 5) => {
    const response = await fetch(`https://api.worldbank.org/v2/country/UG/indicator/${indicator}?format=json&per_page=${years}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${indicator}`);
    }
    const result = await response.json();
    return result[1]?.map((entry: any) => ({ 
      year: entry.date, 
      value: entry.value 
    })).filter((entry: any) => entry.value !== null).reverse() || [];
  };

  const loadData = async () => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const [populationData, inflationData, gdpData] = await Promise.all([
        fetchWorldBankData("SP.POP.TOTL", 1),
        fetchWorldBankData("FP.CPI.TOTL.ZG", 5),
        fetchWorldBankData("NY.GDP.MKTP.KD.ZG", 5)
      ]);

      setData({
        population: populationData[0] || null,
        inflation: inflationData,
        gdpGrowth: gdpData,
        isLoading: false,
        error: null,
        lastUpdated: new Date().toLocaleString()
      });
    } catch (error) {
      console.error('Error fetching World Bank data:', error);
      // Fallback to mock data
      setData({
        population: { value: 47249585, year: "2023" },
        inflation: [
          { year: "2019", value: 2.9 },
          { year: "2020", value: 5.7 },
          { year: "2021", value: 2.2 },
          { year: "2022", value: 7.2 },
          { year: "2023", value: 5.3 }
        ],
        gdpGrowth: [
          { year: "2019", value: 6.8 },
          { year: "2020", value: 3.5 },
          { year: "2021", value: 3.4 },
          { year: "2022", value: 4.6 },
          { year: "2023", value: 6.2 }
        ],
        isLoading: false,
        error: 'Using fallback data - API unavailable',
        lastUpdated: new Date().toLocaleString()
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { ...data, refreshData: loadData };
};
