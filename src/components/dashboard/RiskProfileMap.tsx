
import React, { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface RiskData {
  region: string;
  district: string;
  riskScore: number;
  totalLoans: number;
  defaultRate: number;
  averageLoanSize: number;
}

export const RiskProfileMap = () => {
  const [riskData, setRiskData] = useState<RiskData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('map');

  useEffect(() => {
    const fetchRiskData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch data from Supabase
        // For now, we'll use mock data
        const mockRiskData: RiskData[] = [
          { region: 'Central', district: 'Kampala', riskScore: 3.2, totalLoans: 456, defaultRate: 4.2, averageLoanSize: 12500000 },
          { region: 'Central', district: 'Wakiso', riskScore: 2.8, totalLoans: 321, defaultRate: 3.8, averageLoanSize: 9800000 },
          { region: 'Eastern', district: 'Jinja', riskScore: 4.5, totalLoans: 287, defaultRate: 7.6, averageLoanSize: 7600000 },
          { region: 'Eastern', district: 'Mbale', riskScore: 5.1, totalLoans: 245, defaultRate: 8.3, averageLoanSize: 6900000 },
          { region: 'Northern', district: 'Gulu', riskScore: 4.8, totalLoans: 187, defaultRate: 7.9, averageLoanSize: 5800000 },
          { region: 'Northern', district: 'Lira', riskScore: 5.3, totalLoans: 154, defaultRate: 8.7, averageLoanSize: 5400000 },
          { region: 'Western', district: 'Mbarara', riskScore: 3.6, totalLoans: 276, defaultRate: 5.4, averageLoanSize: 8200000 },
          { region: 'Western', district: 'Fort Portal', riskScore: 3.9, totalLoans: 198, defaultRate: 6.1, averageLoanSize: 7100000 },
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

  // Function to determine risk level color
  const getRiskColor = (score: number): string => {
    if (score < 3) return 'bg-green-500';
    if (score < 4) return 'bg-yellow-500';
    if (score < 5) return 'bg-orange-500';
    return 'bg-red-500';
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
                <AspectRatio ratio={16/9} className="bg-muted">
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 relative">
                    {/* In a real app, this would be an actual map with markers */}
                    {/* For now, we'll use a placeholder */}
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <p className="font-medium">Interactive Risk Map</p>
                      <p className="text-sm mt-1">Map visualization would be integrated here</p>
                      <p className="text-xs mt-3">Consider integrating with Google Maps, Mapbox, or OpenStreetMap</p>
                    </div>
                    
                    {/* Sample region indicators */}
                    <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-orange-500" title="Eastern Region"></div>
                    <div className="absolute top-1/3 left-1/2 w-4 h-4 rounded-full bg-yellow-500" title="Central Region"></div>
                    <div className="absolute top-1/2 right-1/4 w-4 h-4 rounded-full bg-green-500" title="Western Region"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-4 h-4 rounded-full bg-red-500" title="Northern Region"></div>
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
                  {riskData.sort((a, b) => b.riskScore - a.riskScore).map((district, index) => (
                    <TableRow key={index}>
                      <TableCell>{district.region}</TableCell>
                      <TableCell>{district.district}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${getRiskColor(district.riskScore)} mr-2`}></div>
                          {district.riskScore.toFixed(1)}
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
