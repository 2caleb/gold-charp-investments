
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Globe, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import { useWorldBankData } from '@/hooks/use-world-bank-data';

const RealTimeEconomicIndicators = () => {
  const { 
    population, 
    inflation, 
    gdpGrowth, 
    isLoading, 
    error, 
    lastUpdated, 
    refreshData 
  } = useWorldBankData();

  const getLatestValue = (data: Array<{ year: string; value: number }>) => {
    return data.length > 0 ? data[data.length - 1] : null;
  };

  const latestInflation = getLatestValue(inflation);
  const latestGDP = getLatestValue(gdpGrowth);

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-serif">Real-Time Uganda Economic Dashboard</CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Live data integration with World Bank APIs
            </p>
          </div>
          <Button 
            onClick={refreshData} 
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Updating...' : 'Refresh Data'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800 dark:text-yellow-200">{error}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Population Data */}
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <Globe className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold text-blue-600">
              {population ? (population.value / 1000000).toFixed(1) : '47.2'}M
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Population ({population?.year || '2023'})
            </div>
            <Badge variant="secondary" className="mt-1 text-xs">
              World Bank Data
            </Badge>
          </div>
          
          {/* GDP Growth Data */}
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold text-green-600">
              {latestGDP ? latestGDP.value.toFixed(1) : '6.2'}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              GDP Growth ({latestGDP?.year || '2023'})
            </div>
            <Badge variant="secondary" className="mt-1 text-xs">
              World Bank Data
            </Badge>
          </div>
          
          {/* Inflation Data */}
          <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold text-orange-600">
              {latestInflation ? latestInflation.value.toFixed(1) : '5.3'}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Inflation Rate ({latestInflation?.year || '2023'})
            </div>
            <Badge variant="secondary" className="mt-1 text-xs">
              World Bank Data
            </Badge>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated || 'Loading...'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeEconomicIndicators;
