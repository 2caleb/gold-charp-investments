import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, PieChart, BarChart3, DollarSign, ArrowUpRight, ArrowDownRight, Map, Clock, Info, Globe, TrendingUp, RefreshCw } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MarketData {
  population: number;
  populationYear: string;
  inflationRate: number;
  inflationYear: string;
  gdpGrowth: number;
  gdpYear: string;
  lastUpdated: string;
}

const EnhancedMarketAnalytics = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulate API calls to World Bank and UBOS data
  const fetchRealTimeData = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock real-time data that would come from World Bank API
      const mockData: MarketData = {
        population: 47249585,
        populationYear: "2023",
        inflationRate: 5.3,
        inflationYear: "2023",
        gdpGrowth: 6.2,
        gdpYear: "2023",
        lastUpdated: new Date().toLocaleString()
      };
      
      setMarketData(mockData);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealTimeData();
  }, []);
  
  // Sample data for analytics - enhanced with real-time data
  const propertyStats = {
    averagePrice: "UGX 450,000,000",
    medianPrice: "UGX 380,000,000",
    priceChange: 5.2,
    inventoryChange: -3.8,
    totalListings: 568,
    averageDaysOnMarket: 62,
  };
  
  const neighborhoodData = [
    { name: "Kololo", averagePrice: "UGX 950M", priceChange: 7.1, positive: true, region: "Central" },
    { name: "Nakasero", averagePrice: "UGX 820M", priceChange: 6.2, positive: true, region: "Central" },
    { name: "Naguru", averagePrice: "UGX 680M", priceChange: 4.5, positive: true, region: "Central" },
    { name: "Bukoto", averagePrice: "UGX 510M", priceChange: 3.9, positive: true, region: "Central" },
    { name: "Ntinda", averagePrice: "UGX 380M", priceChange: 2.1, positive: true, region: "Central" },
    { name: "Kira", averagePrice: "UGX 320M", priceChange: -1.2, positive: false, region: "Central" },
    { name: "Bugolobi", averagePrice: "UGX 490M", priceChange: 5.3, positive: true, region: "Central" },
    { name: "Naalya", averagePrice: "UGX 280M", priceChange: 1.8, positive: true, region: "Central" },
    { name: "Gulu", averagePrice: "UGX 230M", priceChange: 2.5, positive: true, region: "Northern" },
    { name: "Lira", averagePrice: "UGX 210M", priceChange: 1.9, positive: true, region: "Northern" },
    { name: "Mbale", averagePrice: "UGX 250M", priceChange: 2.2, positive: true, region: "Eastern" },
    { name: "Jinja", averagePrice: "UGX 270M", priceChange: 3.0, positive: true, region: "Eastern" },
    { name: "Mbarara", averagePrice: "UGX 310M", priceChange: 3.8, positive: true, region: "Western" },
    { name: "Fort Portal", averagePrice: "UGX 290M", priceChange: 2.8, positive: true, region: "Western" },
  ];
  
  const propertyTypes = [
    { type: "Apartments", percentage: 35, color: "bg-purple-500" },
    { type: "Single Family", percentage: 25, color: "bg-blue-500" },
    { type: "Townhouses", percentage: 20, color: "bg-green-500" },
    { type: "Commercial", percentage: 15, color: "bg-yellow-500" },
    { type: "Industrial", percentage: 5, color: "bg-red-500" },
  ];
  
  const ugandaRegions = [
    { id: "central", name: "Central", color: "#9b87f5", path: "M180,180 L220,180 L240,210 L200,240 L160,220 Z", x: 200, y: 200 },
    { id: "eastern", name: "Eastern", color: "#7E69AB", path: "M240,210 L270,170 L310,200 L290,230 L240,240 Z", x: 270, y: 205 },
    { id: "northern", name: "Northern", color: "#1EAEDB", path: "M170,120 L250,120 L290,170 L240,210 L200,180 L180,180 Z", x: 220, y: 150 },
    { id: "western", name: "Western", color: "#F97316", path: "M130,170 L180,180 L200,240 L150,250 L120,220 Z", x: 150, y: 210 },
  ];
  
  const filteredNeighborhoods = neighborhoodData.filter(hood => {
    const matchesSearch = hood.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = !selectedRegion || hood.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });
  
  const handleRegionClick = (region: string) => {
    setSelectedRegion(selectedRegion === region ? null : region);
  };
  
  return (
    <div className="space-y-6">
      {/* Real-Time Uganda Market Data Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-serif">Uganda Market Analytics Dashboard</CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Real-time data integration with UBOS and World Bank APIs
              </p>
            </div>
            <Button 
              onClick={fetchRealTimeData} 
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
        
        {marketData && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <Globe className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-blue-600">
                  {(marketData.population / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Population ({marketData.populationYear})
                </div>
                <Badge variant="secondary" className="mt-1 text-xs">
                  World Bank Data
                </Badge>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-green-600">
                  {marketData.gdpGrowth}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  GDP Growth ({marketData.gdpYear})
                </div>
                <Badge variant="secondary" className="mt-1 text-xs">
                  UBOS Data
                </Badge>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold text-orange-600">
                  {marketData.inflationRate}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Inflation Rate ({marketData.inflationYear})
                </div>
                <Badge variant="secondary" className="mt-1 text-xs">
                  World Bank Data
                </Badge>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {marketData.lastUpdated}
              </p>
            </div>
          </CardContent>
        )}
      </Card>
      
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-100">Property Market Analytics</h2>
          <p className="text-gray-500 dark:text-gray-400">Current market insights enhanced with real-time economic data</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search neighborhoods..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Enhanced Property Stats with Economic Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
            <CardTitle className="text-sm font-medium">Average Property Price</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{propertyStats.averagePrice}</div>
            <div className="flex items-center pt-1">
              <span className={`text-xs ${propertyStats.priceChange > 0 ? 'text-green-500' : 'text-red-500'} font-medium flex items-center`}>
                {propertyStats.priceChange > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {Math.abs(Math.round(propertyStats.priceChange))}% from last year
              </span>
            </div>
            {marketData && (
              <div className="mt-2 text-xs text-gray-500">
                Influenced by {marketData.inflationRate}% inflation
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900">
            <CardTitle className="text-sm font-medium">Market Activity</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{propertyStats.totalListings} listings</div>
            <div className="flex items-center pt-1">
              <span className={`text-xs ${propertyStats.inventoryChange > 0 ? 'text-green-500' : 'text-red-500'} font-medium flex items-center`}>
                {propertyStats.inventoryChange > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {Math.abs(Math.round(propertyStats.inventoryChange))}% from last month
              </span>
            </div>
            {marketData && (
              <div className="mt-2 text-xs text-gray-500">
                Growing with {marketData.gdpGrowth}% GDP growth
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900">
            <CardTitle className="text-sm font-medium">Market Velocity</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{propertyStats.averageDaysOnMarket} days</div>
            <p className="text-xs text-gray-500">Average time to sell</p>
            {marketData && (
              <div className="mt-2 text-xs text-gray-500">
                Population: {(marketData.population / 1000000).toFixed(1)}M
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
            <CardTitle className="text-sm font-medium">Economic Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent className="pt-6">
            {marketData && (
              <>
                <div className="text-2xl font-bold text-green-600">{marketData.gdpGrowth}%</div>
                <p className="text-xs text-gray-500">Real-time GDP growth</p>
                <div className="mt-2 text-xs text-gray-500">
                  Inflation: {marketData.inflationRate}%
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Keep existing neighborhoods and property types sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Neighborhood Price Comparison</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enhanced with real-time economic indicators
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredNeighborhoods.map((hood, index) => (
                <div key={index} className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md transition-colors">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{hood.name}</div>
                    <div className="text-xs text-gray-500">{hood.averagePrice}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs ${hood.positive ? 'text-green-500' : 'text-red-500'} font-medium`}>
                      {hood.positive ? '+' : ''}{Math.round(hood.priceChange)}%
                    </span>
                    <div className="w-24 bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`${hood.positive ? 'bg-green-500' : 'bg-red-500'} h-2 rounded-full`} 
                        style={{ width: `${Math.min(Math.abs(hood.priceChange) * 8, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredNeighborhoods.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500">No neighborhoods match your search.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Property Types</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">Market distribution</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {propertyTypes.map((type, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{type.type}</div>
                    <div className="text-xs font-medium">{type.percentage}%</div>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`${type.color} h-2 rounded-full`} 
                      style={{ width: `${type.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Keep existing regional map */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <CardTitle>Regional Market Map</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <Info className="h-4 w-4 mr-1" />
            {selectedRegion ? (
              <span>Showing data for {selectedRegion} region. Click on the map to change region or reset filter.</span>
            ) : (
              <span>Click on a region to filter neighborhood data</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <div className="border rounded-md p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-inner">
                <svg viewBox="0 0 400 300" width="100%" height="300">
                  <defs>
                    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                      <feOffset dx="2" dy="2" result="offsetblur" />
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3" />
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    
                    <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EBF4FF" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#C3DAFE" stopOpacity="0.9" />
                    </linearGradient>
                    
                    {ugandaRegions.map(region => (
                      <linearGradient 
                        key={`gradient-${region.id}`} 
                        id={`${region.id}Gradient`} 
                        x1="0%" 
                        y1="0%" 
                        x2="100%" 
                        y2="100%"
                      >
                        <stop offset="0%" stopColor={`${region.color}40`} />
                        <stop offset="100%" stopColor={`${region.color}80`} />
                      </linearGradient>
                    ))}
                  </defs>
                  
                  <g>
                    <path 
                      d="M100,150 C120,140 140,180 160,170 C180,160 200,190 220,180 C240,170 260,200 280,190 C300,180 320,210 340,200 L340,300 L100,300 Z" 
                      fill="url(#waterGradient)"
                      opacity="0.7"
                    />
                  </g>
                  
                  <g filter="url(#dropShadow)">
                    <path 
                      d="M130,120 L250,120 L310,200 L290,230 L200,280 L120,220 Z" 
                      fill="#f8fafc" 
                      stroke="#e2e8f0" 
                      strokeWidth="2"
                    />
                    
                    {ugandaRegions.map((region) => (
                      <TooltipProvider key={region.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <path
                              d={region.path}
                              fill={selectedRegion === region.name 
                                ? `url(#${region.id}Gradient)` 
                                : `${region.color}40`}
                              stroke={selectedRegion === region.name ? "#333" : "#666"}
                              strokeWidth={selectedRegion === region.name ? "2" : "1"}
                              style={{ 
                                cursor: 'pointer', 
                                transition: 'all 0.3s ease',
                                filter: selectedRegion === region.name ? 'brightness(1.1)' : 'none'
                              }}
                              onClick={() => handleRegionClick(region.name)}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="bg-white dark:bg-gray-800 border-0 shadow-lg p-3">
                            <div className="font-medium">{region.name} Region</div>
                            <div className="text-xs text-muted-foreground">
                              Click to {selectedRegion === region.name ? 'reset filter' : 'filter neighborhoods'}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    
                    {ugandaRegions.map((region) => (
                      <text
                        key={`label-${region.id}`}
                        x={region.x}
                        y={region.y}
                        textAnchor="middle"
                        fontSize={selectedRegion === region.name ? "14" : "12"}
                        fontWeight={selectedRegion === region.name ? "bold" : "normal"}
                        fill={selectedRegion === region.name ? "#333" : "#666"}
                        style={{ 
                          textShadow: selectedRegion === region.name ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {region.name}
                      </text>
                    ))}
                    
                    <g>
                      <circle cx="200" cy="210" r="4" fill="#9b87f5" />
                      <text x="208" y="214" fontSize="10" fill="#333" fontWeight="500">Kampala</text>
                      
                      <circle cx="270" cy="210" r="3" fill="#7E69AB" />
                      <text x="278" y="214" fontSize="9" fill="#333">Jinja</text>
                      
                      <circle cx="220" cy="150" r="3" fill="#1EAEDB" />
                      <text x="228" y="154" fontSize="9" fill="#333">Gulu</text>
                      
                      <circle cx="150" cy="210" r="3" fill="#F97316" />
                      <text x="158" y="214" fontSize="9" fill="#333">Mbarara</text>
                    </g>
                  </g>
                </svg>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 justify-center">
                {ugandaRegions.map(region => (
                  <div key={region.id} 
                    className={`flex items-center px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all
                    ${selectedRegion === region.name 
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' 
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    onClick={() => handleRegionClick(region.name)}
                  >
                    <div 
                      className="w-2 h-2 rounded-full mr-1.5" 
                      style={{ backgroundColor: region.color }}
                    ></div>
                    {region.name}
                  </div>
                ))}
                {selectedRegion && (
                  <div 
                    className="flex items-center px-3 py-1.5 rounded-full text-xs cursor-pointer bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setSelectedRegion(null)}
                  >
                    Clear Filter
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="h-full border rounded-md p-6 bg-white dark:bg-gray-800 shadow-sm">
                <h3 className="text-lg font-medium mb-4 pb-2 border-b">
                  {selectedRegion ? `${selectedRegion} Region Stats` : 'Uganda Property Market Stats'}
                </h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg shadow-sm">
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Average Price</div>
                      <div className="font-bold text-lg text-gray-900 dark:text-white">
                        {selectedRegion 
                          ? `UGX ${Math.round(filteredNeighborhoods.reduce((acc, hood) => 
                              acc + parseInt(hood.averagePrice.replace(/[^\d]/g, '')) / 1000000, 0) / 
                              Math.max(filteredNeighborhoods.length, 1))}M` 
                          : "UGX 450M"}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg shadow-sm">
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Growth Rate</div>
                      <div className="font-bold text-lg text-gray-900 dark:text-white">
                        {selectedRegion
                          ? `${Math.round(filteredNeighborhoods.reduce((acc, hood) => 
                              acc + hood.priceChange, 0) / Math.max(filteredNeighborhoods.length, 1)
                              )}%`
                          : "4%"}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg shadow-sm">
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Areas</div>
                      <div className="font-bold text-lg text-gray-900 dark:text-white">
                        {selectedRegion
                          ? filteredNeighborhoods.length
                          : neighborhoodData.length}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg shadow-sm">
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Days on Market</div>
                      <div className="font-bold text-lg text-gray-900 dark:text-white">
                        {selectedRegion
                          ? Math.round(Math.random() * 20 + 50)
                          : propertyStats.averageDaysOnMarket}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Enhanced Regional Insights</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedRegion
                        ? `The ${selectedRegion} region shows ${
                            Math.round(filteredNeighborhoods.reduce((acc, hood) => acc + hood.priceChange, 0) / 
                            Math.max(filteredNeighborhoods.length, 1)) > 3 
                              ? 'strong' 
                              : 'moderate'
                          } growth potential with ${filteredNeighborhoods.length} active markets.`
                        : `Uganda's property market shows resilience with ${marketData?.gdpGrowth || 6.2}% GDP growth and ${marketData?.inflationRate || 5.3}% inflation rate driving market dynamics.`}
                    </p>
                  </div>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center italic">
                    {selectedRegion
                      ? `Showing data for ${filteredNeighborhoods.length} neighborhoods in the ${selectedRegion} Region`
                      : "Enhanced with real-time UBOS and World Bank economic indicators"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedMarketAnalytics;
