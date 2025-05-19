
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MapPin, Download, Filter, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const RegionalComparison = () => {
  // Sample data for regional comparison
  const residentialData = [
    { district: 'Kampala Central', avgPrice: 550, growth: 5.2 },
    { district: 'Nakawa', avgPrice: 480, growth: 4.8 },
    { district: 'Kawempe', avgPrice: 320, growth: 3.5 },
    { district: 'Wakiso', avgPrice: 380, growth: 6.2 },
    { district: 'Mukono', avgPrice: 290, growth: 7.8 },
    { district: 'Entebbe', avgPrice: 420, growth: 4.5 },
    { district: 'Jinja', avgPrice: 260, growth: 3.2 },
  ];

  const commercialData = [
    { district: 'Kampala Central', avgPrice: 780, growth: 4.8 },
    { district: 'Nakawa', avgPrice: 650, growth: 3.9 },
    { district: 'Industrial Area', avgPrice: 580, growth: 2.8 },
    { district: 'Wakiso', avgPrice: 420, growth: 5.5 },
    { district: 'Mukono', avgPrice: 350, growth: 6.2 },
    { district: 'Entebbe', avgPrice: 490, growth: 3.7 },
    { district: 'Jinja', avgPrice: 310, growth: 4.1 },
  ];

  const agriculturalData = [
    { district: 'Wakiso', avgPrice: 180, growth: 8.5 },
    { district: 'Mukono', avgPrice: 150, growth: 7.2 },
    { district: 'Mpigi', avgPrice: 120, growth: 9.5 },
    { district: 'Luweero', avgPrice: 90, growth: 10.2 },
    { district: 'Kayunga', avgPrice: 85, growth: 8.8 },
    { district: 'Mityana', avgPrice: 95, growth: 7.5 },
    { district: 'Jinja', avgPrice: 140, growth: 6.8 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-800 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-xl">
              <MapPin className="mr-2" /> 
              Regional Price Comparison
            </CardTitle>
            <CardDescription className="text-blue-100">
              Compare property values across different regions of Uganda
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="residential">
              <div className="flex items-center justify-between mb-4">
                <TabsList>
                  <TabsTrigger value="residential">Residential</TabsTrigger>
                  <TabsTrigger value="commercial">Commercial</TabsTrigger>
                  <TabsTrigger value="agricultural">Agricultural</TabsTrigger>
                </TabsList>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" /> Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" /> Export
                  </Button>
                </div>
              </div>
              
              <TabsContent value="residential" className="pt-4">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={residentialData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
                      <XAxis 
                        dataKey="district" 
                        angle={-45} 
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        yAxisId="left"
                        orientation="left"
                        label={{ value: 'Average Price (millions UGX)', angle: -90, position: 'insideLeft' }}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        label={{ value: 'Growth Rate (%)', angle: 90, position: 'insideRight' }}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip formatter={(value, name) => {
                        if (name === 'avgPrice') return [`${value} million UGX`, 'Average Price'];
                        if (name === 'growth') return [`${value}%`, 'Annual Growth'];
                        return [value, name];
                      }} />
                      <Legend />
                      <Bar 
                        yAxisId="left"
                        dataKey="avgPrice" 
                        fill="#3B82F6" 
                        name="Average Price" 
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="growth" 
                        fill="#10B981" 
                        name="Annual Growth (%)" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Residential Market Insights</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Residential property prices in Kampala Central remain the highest, with an average of UGX 550 million. 
                    Mukono shows the strongest growth at 7.8%, making it an attractive area for investment.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="commercial" className="pt-4">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={commercialData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
                      <XAxis 
                        dataKey="district" 
                        angle={-45} 
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        yAxisId="left"
                        orientation="left"
                        label={{ value: 'Average Price (millions UGX)', angle: -90, position: 'insideLeft' }}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        label={{ value: 'Growth Rate (%)', angle: 90, position: 'insideRight' }}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip formatter={(value, name) => {
                        if (name === 'avgPrice') return [`${value} million UGX`, 'Average Price'];
                        if (name === 'growth') return [`${value}%`, 'Annual Growth'];
                        return [value, name];
                      }} />
                      <Legend />
                      <Bar 
                        yAxisId="left"
                        dataKey="avgPrice" 
                        fill="#8B5CF6" 
                        name="Average Price" 
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="growth" 
                        fill="#F59E0B" 
                        name="Annual Growth (%)" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Commercial Market Insights</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Commercial properties in Kampala Central command premium prices at UGX 780 million on average. 
                    Mukono shows the strongest growth at 6.2%, indicating increasing commercial development.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="agricultural" className="pt-4">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={agriculturalData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
                      <XAxis 
                        dataKey="district" 
                        angle={-45} 
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        yAxisId="left"
                        orientation="left"
                        label={{ value: 'Average Price (millions UGX)', angle: -90, position: 'insideLeft' }}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        label={{ value: 'Growth Rate (%)', angle: 90, position: 'insideRight' }}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip formatter={(value, name) => {
                        if (name === 'avgPrice') return [`${value} million UGX`, 'Average Price'];
                        if (name === 'growth') return [`${value}%`, 'Annual Growth'];
                        return [value, name];
                      }} />
                      <Legend />
                      <Bar 
                        yAxisId="left"
                        dataKey="avgPrice" 
                        fill="#059669" 
                        name="Average Price" 
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        yAxisId="right"
                        dataKey="growth" 
                        fill="#D97706" 
                        name="Annual Growth (%)" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Agricultural Land Insights</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Agricultural land in Wakiso has the highest average price at UGX 180 million per acre. 
                    Luweero shows exceptional growth of 10.2%, making it a prime area for agricultural investment.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-purple-700 to-purple-800 text-white rounded-t-lg">
            <CardTitle className="text-lg">Price Trends Analysis</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="font-medium">Fastest Growing Areas</h3>
                <ol className="mt-2 space-y-2 list-decimal list-inside text-sm">
                  <li>Luweero (Agricultural) - 10.2%</li>
                  <li>Mpigi (Agricultural) - 9.5%</li>
                  <li>Kayunga (Agricultural) - 8.8%</li>
                  <li>Wakiso (Agricultural) - 8.5%</li>
                  <li>Mukono (Residential) - 7.8%</li>
                </ol>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium">Premium Price Areas</h3>
                <ol className="mt-2 space-y-2 list-decimal list-inside text-sm">
                  <li>Kampala Central (Commercial) - UGX 780M</li>
                  <li>Nakawa (Commercial) - UGX 650M</li>
                  <li>Kampala Central (Residential) - UGX 550M</li>
                  <li>Industrial Area (Commercial) - UGX 580M</li>
                  <li>Nakawa (Residential) - UGX 480M</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-t-lg">
            <CardTitle className="text-lg">Investment Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                <div className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 p-2 rounded-full">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Emerging Markets</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mukono and Wakiso show strong growth across all property types, with excellent ROI potential.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <div className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 p-2 rounded-full">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Development Hotspots</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Agricultural land in Luweero shows exceptional growth, ideal for land banking and future development.
                  </p>
                </div>
              </div>
              
              <Button className="w-full bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800">
                Request Detailed Investment Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default RegionalComparison;
