
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Map, Calculator, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BASE_PRICES_2022, getInflatedPrice, CURRENT_YEAR, UGANDA_DISTRICTS } from '@/utils/propertyEvaluation';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const EnhancedPropertyAnalytics = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<string>('12months');

  // Generate market trend data with inflation adjustments
  const marketTrendData = useMemo(() => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      months.push({
        month: monthName,
        kampala_residential: Math.round(getInflatedPrice(BASE_PRICES_2022.kampala.residential, 2022) * (1 + Math.random() * 0.1 - 0.05)),
        kampala_commercial: Math.round(getInflatedPrice(BASE_PRICES_2022.kampala.commercial, 2022) * (1 + Math.random() * 0.1 - 0.05)),
        wakiso_residential: Math.round(getInflatedPrice(BASE_PRICES_2022.wakiso.residential, 2022) * (1 + Math.random() * 0.1 - 0.05)),
        wakiso_commercial: Math.round(getInflatedPrice(BASE_PRICES_2022.wakiso.commercial, 2022) * (1 + Math.random() * 0.1 - 0.05)),
        mbarara_residential: Math.round(getInflatedPrice(BASE_PRICES_2022.mbarara.residential, 2022) * (1 + Math.random() * 0.1 - 0.05)),
        gulu_residential: Math.round(getInflatedPrice(BASE_PRICES_2022.gulu.residential, 2022) * (1 + Math.random() * 0.1 - 0.05)),
      });
    }
    return months;
  }, []);

  // Generate district comparison data
  const districtComparisonData = useMemo(() => {
    return Object.entries(BASE_PRICES_2022).map(([district, prices]) => {
      const currentPrices = {
        land: getInflatedPrice(prices.land, 2022),
        residential: getInflatedPrice(prices.residential, 2022),
        commercial: getInflatedPrice(prices.commercial, 2022),
        industrial: getInflatedPrice(prices.industrial, 2022),
      };
      
      return {
        district: district.charAt(0).toUpperCase() + district.slice(1),
        avgPrice: Math.round((currentPrices.residential + currentPrices.commercial) / 2),
        residential: Math.round(currentPrices.residential),
        commercial: Math.round(currentPrices.commercial),
        industrial: Math.round(currentPrices.industrial),
        land: Math.round(currentPrices.land),
        growth: Math.round((Math.random() * 10 + 2) * 100) / 100, // Mock growth rate
        investment_score: Math.round((Math.random() * 40 + 60) * 10) / 10, // Mock investment score
      };
    });
  }, []);

  // Property type distribution data
  const propertyTypeData = [
    { name: 'Residential', value: 45, color: '#8b5cf6', growth: 5.2 },
    { name: 'Commercial', value: 25, color: '#06b6d4', growth: 7.8 },
    { name: 'Industrial', value: 15, color: '#10b981', growth: 3.4 },
    { name: 'Land Only', value: 15, color: '#f59e0b', growth: 8.1 },
  ];

  // Investment opportunity data
  const investmentOpportunityData = useMemo(() => {
    return districtComparisonData.map(district => ({
      district: district.district,
      roi_potential: Math.round((Math.random() * 15 + 8) * 10) / 10,
      price_per_sqm: district.residential,
      market_liquidity: Math.round((Math.random() * 40 + 50) * 10) / 10,
      risk_score: Math.round((Math.random() * 30 + 20) * 10) / 10,
    }));
  }, [districtComparisonData]);

  const chartConfig = {
    kampala_residential: { label: "Kampala Residential", color: "#8b5cf6" },
    kampala_commercial: { label: "Kampala Commercial", color: "#06b6d4" },
    wakiso_residential: { label: "Wakiso Residential", color: "#10b981" },
    wakiso_commercial: { label: "Wakiso Commercial", color: "#f59e0b" },
    mbarara_residential: { label: "Mbarara Residential", color: "#ef4444" },
    gulu_residential: { label: "Gulu Residential", color: "#8b5cf6" },
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-gray-100">
            Enhanced Property Market Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive market analysis powered by real estate evaluation engine
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {Object.keys(BASE_PRICES_2022).map(district => (
                <SelectItem key={district} value={district}>
                  {district.charAt(0).toUpperCase() + district.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="industrial">Industrial</SelectItem>
              <SelectItem value="land">Land Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Avg. Market Price</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  UGX {formatCurrency(districtComparisonData.reduce((acc, d) => acc + d.avgPrice, 0) / districtComparisonData.length)}
                </p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600 font-medium">+5.2% vs last month</span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Market Growth</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {(districtComparisonData.reduce((acc, d) => acc + d.growth, 0) / districtComparisonData.length).toFixed(1)}%
                </p>
                <p className="text-xs text-blue-600 mt-1">Annual average</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Best ROI District</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {investmentOpportunityData.reduce((max, d) => d.roi_potential > max.roi_potential ? d : max).district}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {Math.max(...investmentOpportunityData.map(d => d.roi_potential))}% potential ROI
                </p>
              </div>
              <Calculator className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Active Markets</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {Object.keys(BASE_PRICES_2022).length}
                </p>
                <p className="text-xs text-amber-600 mt-1">Districts tracked</p>
              </div>
              <Map className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="comparison">District Analysis</TabsTrigger>
          <TabsTrigger value="investment">Investment Opportunities</TabsTrigger>
          <TabsTrigger value="types">Property Types</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Market Price Trends (Last 12 Months)
              </CardTitle>
              <CardDescription>
                Price per square meter trends across major Uganda districts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={marketTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis 
                      tickFormatter={formatCurrency}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value: number) => [`UGX ${formatCurrency(value)}`, '']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="kampala_residential" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Kampala Residential"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="kampala_commercial" 
                      stroke="#06b6d4" 
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Kampala Commercial"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="wakiso_residential" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Wakiso Residential"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mbarara_residential" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Mbarara Residential"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Price Per Sqm by District
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={districtComparisonData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
                      <YAxis dataKey="district" type="category" tick={{ fontSize: 12 }} width={80} />
                      <ChartTooltip 
                        formatter={(value: number) => [`UGX ${formatCurrency(value)}`, '']}
                      />
                      <Bar dataKey="residential" fill="#8b5cf6" name="Residential" />
                      <Bar dataKey="commercial" fill="#06b6d4" name="Commercial" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>District Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {districtComparisonData.map((district, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <h3 className="font-medium">{district.district}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Avg: UGX {formatCurrency(district.avgPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={district.growth > 5 ? "default" : "secondary"}>
                          {district.growth > 0 ? '+' : ''}{district.growth}%
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Score: {district.investment_score}/100
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="investment" className="space-y-4">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-purple-600" />
                Investment Opportunity Analysis
              </CardTitle>
              <CardDescription>
                ROI potential vs market risk across Uganda districts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={investmentOpportunityData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="risk_score" 
                      name="Risk Score"
                      tick={{ fontSize: 12 }}
                      label={{ value: 'Risk Score (%)', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      dataKey="roi_potential" 
                      name="ROI Potential"
                      tick={{ fontSize: 12 }}
                      label={{ value: 'ROI Potential (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <ChartTooltip 
                      formatter={(value, name) => [
                        name === 'roi_potential' ? `${value}% ROI` : `${value}% Risk`,
                        name === 'roi_potential' ? 'Expected ROI' : 'Risk Level'
                      ]}
                      labelFormatter={(label, payload) => 
                        payload?.[0]?.payload?.district || 'District'
                      }
                    />
                    <Scatter 
                      dataKey="roi_potential" 
                      fill="#8b5cf6"
                      size={100}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartContainer>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {investmentOpportunityData
                  .sort((a, b) => b.roi_potential - a.roi_potential)
                  .slice(0, 3)
                  .map((opportunity, index) => (
                    <div key={index} className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                          {opportunity.district}
                        </h3>
                        <Badge className="bg-purple-100 text-purple-800">
                          #{index + 1}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">ROI Potential:</span>
                          <span className="font-medium text-green-600">{opportunity.roi_potential}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Risk Score:</span>
                          <span className="font-medium">{opportunity.risk_score}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Liquidity:</span>
                          <span className="font-medium">{opportunity.market_liquidity}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-orange-600" />
                  Property Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={propertyTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {propertyTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip formatter={(value) => [`${value}%`, 'Market Share']} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Property Type Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {propertyTypeData.map((type, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: type.color }}
                        />
                        <div>
                          <h3 className="font-medium">{type.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {type.value}% market share
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          {type.growth > 0 ? (
                            <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                          )}
                          <span className={`text-sm font-medium ${
                            type.growth > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {type.growth > 0 ? '+' : ''}{type.growth}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">YoY Growth</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedPropertyAnalytics;
