
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin, Info, AlertCircle } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface RiskData {
  region: string;
  district: string;
  riskScore: number;
  totalLoans: number;
  defaultRate: number;
  averageLoanSize: number;
  coordinates: {
    lat: number;
    lng: number;
  }
}

export const RiskProfileMap = () => {
  const [riskData, setRiskData] = useState<RiskData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('map');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  // Uganda regions data with district coordinates
  const ugandaDistrictCoordinates = {
    'Kampala': { lat: 0.3136, lng: 32.5811 },
    'Wakiso': { lat: 0.4033, lng: 32.4633 },
    'Jinja': { lat: 0.4409, lng: 33.2050 },
    'Mbale': { lat: 1.0756, lng: 34.1808 },
    'Gulu': { lat: 2.7746, lng: 32.2990 },
    'Lira': { lat: 2.2499, lng: 32.8999 },
    'Mbarara': { lat: -0.6166, lng: 30.6544 },
    'Fort Portal': { lat: 0.6710, lng: 30.2750 },
    'Masaka': { lat: -0.3333, lng: 31.7333 },
    'Arua': { lat: 3.0177, lng: 30.9100 },
    'Kabale': { lat: -1.2488, lng: 29.9889 },
    'Soroti': { lat: 1.7150, lng: 33.6133 },
    'Tororo': { lat: 0.7026, lng: 34.1784 },
    'Hoima': { lat: 1.4308, lng: 31.3525 },
    'Masindi': { lat: 1.6746, lng: 31.7150 }
  };

  useEffect(() => {
    const fetchRiskData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch data from Supabase
        // For now, we'll use expanded mock data
        const mockRiskData: RiskData[] = [
          { region: 'Central', district: 'Kampala', riskScore: 3.2, totalLoans: 456, defaultRate: 4.2, averageLoanSize: 12500000, coordinates: ugandaDistrictCoordinates['Kampala'] },
          { region: 'Central', district: 'Wakiso', riskScore: 2.8, totalLoans: 321, defaultRate: 3.8, averageLoanSize: 9800000, coordinates: ugandaDistrictCoordinates['Wakiso'] },
          { region: 'Eastern', district: 'Jinja', riskScore: 4.5, totalLoans: 287, defaultRate: 7.6, averageLoanSize: 7600000, coordinates: ugandaDistrictCoordinates['Jinja'] },
          { region: 'Eastern', district: 'Mbale', riskScore: 5.1, totalLoans: 245, defaultRate: 8.3, averageLoanSize: 6900000, coordinates: ugandaDistrictCoordinates['Mbale'] },
          { region: 'Northern', district: 'Gulu', riskScore: 4.8, totalLoans: 187, defaultRate: 7.9, averageLoanSize: 5800000, coordinates: ugandaDistrictCoordinates['Gulu'] },
          { region: 'Northern', district: 'Lira', riskScore: 5.3, totalLoans: 154, defaultRate: 8.7, averageLoanSize: 5400000, coordinates: ugandaDistrictCoordinates['Lira'] },
          { region: 'Western', district: 'Mbarara', riskScore: 3.6, totalLoans: 276, defaultRate: 5.4, averageLoanSize: 8200000, coordinates: ugandaDistrictCoordinates['Mbarara'] },
          { region: 'Western', district: 'Fort Portal', riskScore: 3.9, totalLoans: 198, defaultRate: 6.1, averageLoanSize: 7100000, coordinates: ugandaDistrictCoordinates['Fort Portal'] },
          { region: 'Central', district: 'Masaka', riskScore: 3.0, totalLoans: 210, defaultRate: 4.0, averageLoanSize: 8900000, coordinates: ugandaDistrictCoordinates['Masaka'] },
          { region: 'Northern', district: 'Arua', riskScore: 5.0, totalLoans: 145, defaultRate: 8.1, averageLoanSize: 5100000, coordinates: ugandaDistrictCoordinates['Arua'] },
          { region: 'Western', district: 'Kabale', riskScore: 2.9, totalLoans: 180, defaultRate: 3.9, averageLoanSize: 7500000, coordinates: ugandaDistrictCoordinates['Kabale'] },
          { region: 'Eastern', district: 'Soroti', riskScore: 4.7, totalLoans: 165, defaultRate: 7.8, averageLoanSize: 6100000, coordinates: ugandaDistrictCoordinates['Soroti'] },
          { region: 'Eastern', district: 'Tororo', riskScore: 4.3, totalLoans: 178, defaultRate: 7.2, averageLoanSize: 6500000, coordinates: ugandaDistrictCoordinates['Tororo'] },
          { region: 'Western', district: 'Hoima', riskScore: 3.7, totalLoans: 192, defaultRate: 5.7, averageLoanSize: 7800000, coordinates: ugandaDistrictCoordinates['Hoima'] },
          { region: 'Western', district: 'Masindi', riskScore: 4.0, totalLoans: 170, defaultRate: 6.5, averageLoanSize: 7200000, coordinates: ugandaDistrictCoordinates['Masindi'] }
        ];
        
        setRiskData(mockRiskData);
      } catch (err) {
        console.error('Error fetching risk profile data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRiskData();
  }, []);

  // Get unique regions for filtering
  const regions = useMemo(() => {
    const uniqueRegions = Array.from(new Set(riskData.map(item => item.region)));
    return uniqueRegions.sort();
  }, [riskData]);

  // Filter districts based on selected region
  const filteredDistricts = useMemo(() => {
    if (!selectedRegion) return riskData;
    return riskData.filter(item => item.region === selectedRegion);
  }, [riskData, selectedRegion]);

  // Get district details for hover/click
  const getDistrictDetails = (district: string) => {
    return riskData.find(item => item.district === district);
  };

  // Function to determine risk level color
  const getRiskColor = (score: number): string => {
    if (score < 3) return 'bg-green-500';
    if (score < 4) return 'bg-yellow-500';
    if (score < 5) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getRiskLabel = (score: number): string => {
    if (score < 3) return 'Low Risk';
    if (score < 4) return 'Medium Risk';
    if (score < 5) return 'High Risk';
    return 'Critical Risk';
  };

  // Handle region selection
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedDistrict(null);
  };

  // Handle district selection
  const handleDistrictClick = (district: string) => {
    setSelectedDistrict(district);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSelectedRegion(null);
    setSelectedDistrict(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold">Uganda Risk Profile</h2>
          <p className="text-gray-500">Geographical loan risk assessment across Uganda</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={selectedRegion || ""} onValueChange={handleRegionChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map(region => (
                <SelectItem key={region} value={region}>
                  {region} Region
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={handleResetFilters}
            disabled={!selectedRegion && !selectedDistrict}
          >
            Reset Filters
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="map">Risk Map</TabsTrigger>
          <TabsTrigger value="list">District List</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Geographical Risk Distribution</CardTitle>
              <CardDescription>Risk levels across different regions in Uganda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <AspectRatio ratio={16/9} className="bg-muted relative">
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 relative">
                    {/* Uganda Map Visualization */}
                    <div className="relative w-full h-full">
                      {/* Base map image of Uganda */}
                      <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Uganda_regions_blank.svg/800px-Uganda_regions_blank.svg.png')] bg-contain bg-center bg-no-repeat opacity-30"></div>
                      
                      {/* Interactive risk markers */}
                      <div className="absolute inset-0">
                        {filteredDistricts.map((district, index) => (
                          <TooltipProvider key={index}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full p-1 border-2 border-white shadow-md transition-all ${
                                    selectedDistrict === district.district ? 'scale-150 z-50' : 
                                    hoveredDistrict === district.district ? 'scale-125 z-40' : 'z-30'
                                  } ${getRiskColor(district.riskScore)}`}
                                  style={{
                                    left: `${30 + (district.coordinates.lng + 3) * 12}%`,
                                    top: `${10 + (4 - district.coordinates.lat) * 15}%`,
                                    width: '16px',
                                    height: '16px'
                                  }}
                                  onClick={() => handleDistrictClick(district.district)}
                                  onMouseEnter={() => setHoveredDistrict(district.district)}
                                  onMouseLeave={() => setHoveredDistrict(null)}
                                >
                                  <span className="sr-only">{district.district}</span>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="w-64 p-0 overflow-hidden rounded-md">
                                <div className={`${getRiskColor(district.riskScore)} py-1 px-3`}>
                                  <p className="font-bold text-white">{district.district}, {district.region} Region</p>
                                </div>
                                <div className="p-3 bg-white dark:bg-gray-800">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <p className="text-gray-500">Risk Score</p>
                                      <p className="font-medium">{district.riskScore.toFixed(1)} - {getRiskLabel(district.riskScore)}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Default Rate</p>
                                      <p className="font-medium">{district.defaultRate}%</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Total Loans</p>
                                      <p className="font-medium">{district.totalLoans}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">Avg. Loan Size</p>
                                      <p className="font-medium">UGX {district.averageLoanSize.toLocaleString()}</p>
                                    </div>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                      
                      {/* Selected district overlay */}
                      {selectedDistrict && (
                        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t p-4 shadow-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-bold text-lg">
                                {getDistrictDetails(selectedDistrict)?.district}, {getDistrictDetails(selectedDistrict)?.region} Region
                              </h3>
                              <div className="flex items-center mt-1">
                                <span className={`inline-block w-3 h-3 rounded-full ${getRiskColor(getDistrictDetails(selectedDistrict)?.riskScore || 0)} mr-2`}></span>
                                <span>Risk Score: {getDistrictDetails(selectedDistrict)?.riskScore.toFixed(1)} ({getRiskLabel(getDistrictDetails(selectedDistrict)?.riskScore || 0)})</span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setSelectedDistrict(null)}>
                              Close
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-4 mt-3">
                            <div>
                              <p className="text-sm text-gray-500">Default Rate</p>
                              <p className="font-medium">{getDistrictDetails(selectedDistrict)?.defaultRate}%</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Total Loans</p>
                              <p className="font-medium">{getDistrictDetails(selectedDistrict)?.totalLoans}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Avg. Loan Size</p>
                              <p className="font-medium">UGX {getDistrictDetails(selectedDistrict)?.averageLoanSize.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </AspectRatio>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-4 justify-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Low Risk (1-3)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-sm">Medium Risk (3-4)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                  <span className="text-sm">High Risk (4-5)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-sm">Critical Risk (5+)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="list" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>District Risk Analysis</CardTitle>
              <CardDescription>Detailed risk metrics by district</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Region</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Total Loans</TableHead>
                    <TableHead>Default Rate</TableHead>
                    <TableHead>Avg. Loan Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDistricts.sort((a, b) => b.riskScore - a.riskScore).map((district, index) => (
                    <TableRow key={index} className={selectedDistrict === district.district ? 'bg-slate-100 dark:bg-slate-800' : ''}>
                      <TableCell>{district.region}</TableCell>
                      <TableCell>{district.district}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${getRiskColor(district.riskScore)} mr-2`}></div>
                          <Badge variant={district.riskScore >= 5 ? 'destructive' : district.riskScore >= 4 ? 'default' : district.riskScore >= 3 ? 'secondary' : 'outline'}>
                            {district.riskScore.toFixed(1)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{district.totalLoans}</TableCell>
                      <TableCell>{district.defaultRate}%</TableCell>
                      <TableCell>UGX {district.averageLoanSize.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Highest Risk Area</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const highestRisk = [...riskData].sort((a, b) => b.riskScore - a.riskScore)[0];
              return (
                <div>
                  <p className="text-xl font-semibold">{highestRisk.district}</p>
                  <p className="text-sm text-gray-500">{highestRisk.region} Region</p>
                  <p className="text-lg font-bold text-red-600 mt-1">Score: {highestRisk.riskScore.toFixed(1)}</p>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Lowest Risk Area</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const lowestRisk = [...riskData].sort((a, b) => a.riskScore - b.riskScore)[0];
              return (
                <div>
                  <p className="text-xl font-semibold">{lowestRisk.district}</p>
                  <p className="text-sm text-gray-500">{lowestRisk.region} Region</p>
                  <p className="text-lg font-bold text-green-600 mt-1">Score: {lowestRisk.riskScore.toFixed(1)}</p>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const avgScore = riskData.reduce((sum, item) => sum + item.riskScore, 0) / riskData.length;
              return (
                <p className="text-3xl font-bold text-purple-700">
                  {avgScore.toFixed(1)}
                </p>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Districts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-700">
              {riskData.length}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
