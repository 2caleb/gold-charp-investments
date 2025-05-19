
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, PieChart, BarChart3, DollarSign, ArrowUpRight, ArrowDownRight, Map, Clock, Info } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PropertyAnalytics = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  
  // Sample data for analytics - in a real app, this would come from an API
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
  
  // Define Uganda regions with coordinates and color coding
  const ugandaRegions = [
    { id: "central", name: "Central", color: "#8884d8", path: "M180,180 L220,180 L240,210 L200,240 L160,220 Z", x: 200, y: 200 },
    { id: "eastern", name: "Eastern", color: "#82ca9d", path: "M240,210 L270,170 L310,200 L290,230 L240,240 Z", x: 270, y: 205 },
    { id: "northern", name: "Northern", color: "#ffc658", path: "M170,120 L250,120 L290,170 L240,210 L200,180 L180,180 Z", x: 220, y: 150 },
    { id: "western", name: "Western", color: "#ff8042", path: "M130,170 L180,180 L200,240 L150,250 L120,220 Z", x: 150, y: 210 },
  ];
  
  // Filter neighborhoods based on search term and selected region
  const filteredNeighborhoods = neighborhoodData.filter(hood => {
    const matchesSearch = hood.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = !selectedRegion || hood.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });
  
  // Handler for region selection on the map
  const handleRegionClick = (region: string) => {
    setSelectedRegion(selectedRegion === region ? null : region);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-100">Property Market Analytics</h2>
          <p className="text-gray-500 dark:text-gray-400">Current market insights for Uganda's real estate</p>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Property Price</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propertyStats.averagePrice}</div>
            <div className="flex items-center pt-1">
              <span className={`text-xs ${propertyStats.priceChange > 0 ? 'text-green-500' : 'text-red-500'} font-medium flex items-center`}>
                {propertyStats.priceChange > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {Math.abs(propertyStats.priceChange)}% from last year
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Property Inventory</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propertyStats.totalListings} listings</div>
            <div className="flex items-center pt-1">
              <span className={`text-xs ${propertyStats.inventoryChange > 0 ? 'text-green-500' : 'text-red-500'} font-medium flex items-center`}>
                {propertyStats.inventoryChange > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {Math.abs(propertyStats.inventoryChange)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Days on Market</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propertyStats.averageDaysOnMarket} days</div>
            <p className="text-xs text-gray-500">Average time to sell a property</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Neighborhood Price Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredNeighborhoods.map((hood, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{hood.name}</div>
                    <div className="text-xs text-gray-500">{hood.averagePrice}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs ${hood.positive ? 'text-green-500' : 'text-red-500'} font-medium`}>
                      {hood.positive ? '+' : ''}{hood.priceChange}%
                    </span>
                    <div className="w-24 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
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
        
        <Card>
          <CardHeader>
            <CardTitle>Property Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {propertyTypes.map((type, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{type.type}</div>
                    <div className="text-xs font-medium">{type.percentage}%</div>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
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
      
      <Card>
        <CardHeader>
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
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
                <svg viewBox="0 0 400 300" width="100%" height="300">
                  <g stroke="gray" strokeWidth="1">
                    {/* Background outline of Uganda */}
                    <path 
                      d="M130,120 L250,120 L310,200 L290,230 L200,280 L120,220 Z" 
                      fill="#f0f0f0" 
                      stroke="#ccc" 
                      strokeWidth="2"
                    />
                    
                    {/* Interactive regions */}
                    {ugandaRegions.map((region) => (
                      <TooltipProvider key={region.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <path
                              d={region.path}
                              fill={selectedRegion === region.name ? region.color : `${region.color}80`}
                              stroke={selectedRegion === region.name ? "#333" : "#666"}
                              strokeWidth={selectedRegion === region.name ? "2" : "1"}
                              style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                              onClick={() => handleRegionClick(region.name)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="font-medium">{region.name} Region</div>
                            <div className="text-xs text-muted-foreground">
                              Click to {selectedRegion === region.name ? 'reset filter' : 'filter neighborhoods'}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    
                    {/* Region labels */}
                    {ugandaRegions.map((region) => (
                      <text
                        key={`label-${region.id}`}
                        x={region.x}
                        y={region.y}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight={selectedRegion === region.name ? "bold" : "normal"}
                        fill={selectedRegion === region.name ? "#333" : "#666"}
                      >
                        {region.name}
                      </text>
                    ))}
                    
                    {/* Major cities */}
                    <g>
                      <circle cx="200" cy="210" r="4" fill="#333" />
                      <text x="208" y="214" fontSize="10" fill="#333">Kampala</text>
                      
                      <circle cx="270" cy="210" r="3" fill="#333" />
                      <text x="278" y="214" fontSize="9" fill="#333">Jinja</text>
                      
                      <circle cx="220" cy="150" r="3" fill="#333" />
                      <text x="228" y="154" fontSize="9" fill="#333">Gulu</text>
                      
                      <circle cx="150" cy="210" r="3" fill="#333" />
                      <text x="158" y="214" fontSize="9" fill="#333">Mbarara</text>
                    </g>
                  </g>
                </svg>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 justify-center">
                {ugandaRegions.map(region => (
                  <div key={region.id} 
                    className={`flex items-center px-3 py-1 rounded-full text-xs cursor-pointer 
                    ${selectedRegion === region.name ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
                    onClick={() => handleRegionClick(region.name)}
                  >
                    <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: region.color }}></div>
                    {region.name}
                  </div>
                ))}
                {selectedRegion && (
                  <div 
                    className="flex items-center px-3 py-1 rounded-full text-xs cursor-pointer bg-secondary hover:bg-secondary/80"
                    onClick={() => setSelectedRegion(null)}
                  >
                    Clear Filter
                  </div>
                )}
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="h-full border rounded-md p-4">
                <h3 className="text-lg font-medium mb-3">
                  {selectedRegion ? `${selectedRegion} Region Stats` : 'Uganda Property Market Stats'}
                </h3>
                
                <div className="space-y-4">
                  {/* Region-specific data */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-3 rounded-md">
                      <div className="text-sm text-muted-foreground">Avg. Price</div>
                      <div className="font-bold text-lg">
                        {selectedRegion 
                          ? `UGX ${Math.round(filteredNeighborhoods.reduce((acc, hood) => 
                              acc + parseInt(hood.averagePrice.replace(/[^\d]/g, '')) / 1000000, 0) / 
                              Math.max(filteredNeighborhoods.length, 1))}M` 
                          : "UGX 450M"}
                      </div>
                    </div>
                    
                    <div className="bg-muted p-3 rounded-md">
                      <div className="text-sm text-muted-foreground">Growth Rate</div>
                      <div className="font-bold text-lg">
                        {selectedRegion
                          ? `${filteredNeighborhoods.reduce((acc, hood) => 
                              acc + hood.priceChange, 0) / Math.max(filteredNeighborhoods.length, 1)
                              .toFixed(1)}%`
                          : "4.2%"}
                      </div>
                    </div>
                    
                    <div className="bg-muted p-3 rounded-md">
                      <div className="text-sm text-muted-foreground">Areas</div>
                      <div className="font-bold text-lg">
                        {selectedRegion
                          ? filteredNeighborhoods.length
                          : neighborhoodData.length}
                      </div>
                    </div>
                    
                    <div className="bg-muted p-3 rounded-md">
                      <div className="text-sm text-muted-foreground">Days on Market</div>
                      <div className="font-bold text-lg">
                        {selectedRegion
                          ? Math.round(Math.random() * 20 + 50)  // Mock data
                          : propertyStats.averageDaysOnMarket}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mt-4">
                    {selectedRegion
                      ? `Showing data for ${filteredNeighborhoods.length} neighborhoods in the ${selectedRegion} Region`
                      : "Showing nationwide data across all regions"}
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

export default PropertyAnalytics;
