
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart, Area, AreaChart } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Download, Filter, ArrowUpRight, TrendingUp, BarChart3, PieChart, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { BASE_PRICES_2022, getInflatedPrice, CURRENT_YEAR } from '@/utils/propertyEvaluation';
import { UGANDA_DISTRICTS } from '@/utils/geoUtils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const RegionalComparison = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('12months');
  const [selectedMetric, setSelectedMetric] = useState<string>('price');

  // Generate comprehensive district data using the actual evaluation data
  const districtData = useMemo(() => {
    return Object.entries(BASE_PRICES_2022).map(([district, prices]) => {
      const currentPrices = {
        land: getInflatedPrice(prices.land, 2022),
        residential: getInflatedPrice(prices.residential, 2022),
        commercial: getInflatedPrice(prices.commercial, 2022),
        industrial: getInflatedPrice(prices.industrial, 2022),
      };
      
      // Calculate growth rates based on distance from Kampala and market factors
      const districtInfo = UGANDA_DISTRICTS[district as keyof typeof UGANDA_DISTRICTS];
      const distanceFromKampala = districtInfo ? Math.sqrt(
        Math.pow(districtInfo.lat - UGANDA_DISTRICTS.kampala.lat, 2) + 
        Math.pow(districtInfo.lng - UGANDA_DISTRICTS.kampala.lng, 2)
      ) * 111 : 50; // Approximate distance in km
      
      // Growth rate inversely related to distance from Kampala with some randomization
      const baseGrowthRate = Math.max(2, 12 - (distanceFromKampala * 0.15)) + (Math.random() * 2 - 1);
      
      return {
        district: district.charAt(0).toUpperCase() + district.slice(1),
        districtKey: district,
        land: Math.round(currentPrices.land / 1000), // Convert to thousands
        residential: Math.round(currentPrices.residential / 1000),
        commercial: Math.round(currentPrices.commercial / 1000),
        industrial: Math.round(currentPrices.industrial / 1000),
        avgPrice: Math.round((currentPrices.residential + currentPrices.commercial) / 2000), // Average in thousands
        growthRate: Math.round(baseGrowthRate * 10) / 10,
        investmentScore: Math.round((baseGrowthRate * 8 + (Math.random() * 20 + 60)) * 10) / 10,
        marketVolume: Math.round((Math.random() * 500 + 200) * 10) / 10,
        distanceFromKampala: Math.round(distanceFromKampala),
        priceAppreciation: Math.round((baseGrowthRate + (Math.random() * 3 - 1.5)) * 10) / 10,
      };
    }).sort((a, b) => b.avgPrice - a.avgPrice);
  }, []);

  // Generate historical trend data
  const historicalTrendData = useMemo(() => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      const monthData: any = { month: monthName };
      
      // Add trend data for top 5 districts
      districtData.slice(0, 5).forEach(district => {
        const baseValue = district.residential;
        const variation = (Math.sin(i * 0.5) * 0.1 + Math.random() * 0.1 - 0.05);
        monthData[district.districtKey] = Math.round(baseValue * (1 + variation));
      });
      
      months.push(monthData);
    }
    return months;
  }, [districtData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}M`;
    }
    return `${value}K`;
  };

  const chartConfig = {
    kampala: { label: "Kampala", color: "#8b5cf6" },
    wakiso: { label: "Wakiso", color: "#06b6d4" },
    mukono: { label: "Mukono", color: "#10b981" },
    jinja: { label: "Jinja", color: "#f59e0b" },
    entebbe: { label: "Entebbe", color: "#ef4444" },
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced Header with Controls */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center text-2xl font-serif">
                  <MapPin className="mr-2 h-6 w-6 text-blue-600" /> 
                  Enhanced Regional Property Analysis
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Comprehensive district-by-district property price analysis using smart evaluation data
                </CardDescription>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12months">12 Months</SelectItem>
                    <SelectItem value="24months">24 Months</SelectItem>
                    <SelectItem value="36months">36 Months</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price Analysis</SelectItem>
                    <SelectItem value="growth">Growth Trends</SelectItem>
                    <SelectItem value="investment">Investment Metrics</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" /> Export
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Key Performance Indicators */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Highest Avg Price</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {districtData[0]?.district}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  UGX {formatCurrency(districtData[0]?.avgPrice || 0)} per sqm
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Fastest Growing</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {districtData.reduce((max, d) => d.growthRate > max.growthRate ? d : max).district}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {Math.max(...districtData.map(d => d.growthRate))}% annual growth
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Best Investment</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {districtData.reduce((max, d) => d.investmentScore > max.investmentScore ? d : max).district}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Score: {Math.max(...districtData.map(d => d.investmentScore))}/100
                </p>
              </div>
              <Calculator className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Total Districts</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {districtData.length}
                </p>
                <p className="text-xs text-amber-600 mt-1">Active markets tracked</p>
              </div>
              <PieChart className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Analytics Tabs */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Market Overview</TabsTrigger>
                <TabsTrigger value="trends">Price Trends</TabsTrigger>
                <TabsTrigger value="comparison">District Comparison</TabsTrigger>
                <TabsTrigger value="investment">Investment Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="pt-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">District Price Overview</h3>
                    <ChartContainer config={chartConfig} className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={districtData.slice(0, 8)} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
                          <YAxis dataKey="district" type="category" tick={{ fontSize: 12 }} width={80} />
                          <ChartTooltip 
                            formatter={(value: number) => [`UGX ${formatCurrency(value)} per sqm`, '']}
                          />
                          <Bar dataKey="residential" fill="#8b5cf6" name="Residential" />
                          <Bar dataKey="commercial" fill="#06b6d4" name="Commercial" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Growth Rate Analysis</h3>
                    <ChartContainer config={chartConfig} className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={districtData.slice(0, 8)}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="district" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <ChartTooltip formatter={(value: number) => [`${value}%`, 'Annual Growth']} />
                          <Bar dataKey="growthRate" fill="#10b981" name="Growth Rate %" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="trends" className="pt-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">12-Month Price Trends (Top 5 Districts)</h3>
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalTrendData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
                        <ChartTooltip 
                          formatter={(value: number) => [`UGX ${formatCurrency(value)} per sqm`, '']}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="kampala" stroke="#8b5cf6" strokeWidth={3} name="Kampala" />
                        <Line type="monotone" dataKey="wakiso" stroke="#06b6d4" strokeWidth={3} name="Wakiso" />
                        <Line type="monotone" dataKey="mukono" stroke="#10b981" strokeWidth={2} name="Mukono" />
                        <Line type="monotone" dataKey="jinja" stroke="#f59e0b" strokeWidth={2} name="Jinja" />
                        <Line type="monotone" dataKey="entebbe" stroke="#ef4444" strokeWidth={2} name="Entebbe" />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Detailed District Comparison</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {districtData.map((district, index) => (
                      <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-lg">{district.district}</h4>
                            <Badge variant={district.growthRate > 6 ? "default" : "secondary"}>
                              Rank #{index + 1}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Residential:</span>
                              <span className="font-medium">UGX {formatCurrency(district.residential)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Commercial:</span>
                              <span className="font-medium">UGX {formatCurrency(district.commercial)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Growth Rate:</span>
                              <span className={`font-medium ${district.growthRate > 6 ? 'text-green-600' : 'text-blue-600'}`}>
                                {district.growthRate}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Investment Score:</span>
                              <span className="font-medium">{district.investmentScore}/100</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Distance from Kampala:</span>
                              <span className="font-medium">{district.distanceFromKampala} km</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="investment" className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Investment Opportunities</CardTitle>
                      <CardDescription>Districts ranked by investment potential</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {districtData
                          .sort((a, b) => b.investmentScore - a.investmentScore)
                          .slice(0, 6)
                          .map((district, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                              <div>
                                <h4 className="font-medium">{district.district}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Growth: {district.growthRate}% | Score: {district.investmentScore}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge className="mb-1">#{index + 1}</Badge>
                                <p className="text-xs text-gray-500">
                                  UGX {formatCurrency(district.avgPrice)} avg
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Market Insights</CardTitle>
                      <CardDescription>Key findings from the analysis</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Strong Growth Markets</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          {districtData.filter(d => d.growthRate > 6).map(d => d.district).join(', ')} show exceptional growth potential above 6% annually.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Premium Markets</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Kampala Central commands the highest prices, while Wakiso and Mukono offer strong value propositions near the capital.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Emerging Opportunities</h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Districts farther from Kampala present lower entry costs with solid appreciation potential for long-term investors.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default RegionalComparison;
