import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MapPin, Download, Filter, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const RegionalComparison = () => {
  // Updated 2024 Uganda real estate data
  const residentialData = [
    { district: 'Kampala Central', avgPrice: 650, growth: 8.2 },
    { district: 'Nakawa', avgPrice: 520, growth: 7.1 },
    { district: 'Kawempe', avgPrice: 380, growth: 6.5 },
    { district: 'Wakiso', avgPrice: 420, growth: 9.8 },
    { district: 'Mukono', avgPrice: 340, growth: 11.2 },
    { district: 'Entebbe', avgPrice: 480, growth: 6.8 },
    { district: 'Jinja', avgPrice: 290, growth: 5.5 },
    { district: 'Masaka', avgPrice: 220, growth: 7.2 },
    { district: 'Mbarara', avgPrice: 240, growth: 8.5 },
  ];

  const commercialData = [
    { district: 'Kampala Central', avgPrice: 950, growth: 7.2 },
    { district: 'Nakawa', avgPrice: 720, growth: 6.8 },
    { district: 'Industrial Area', avgPrice: 680, growth: 5.9 },
    { district: 'Wakiso', avgPrice: 480, growth: 8.7 },
    { district: 'Mukono', avgPrice: 390, growth: 9.5 },
    { district: 'Entebbe', avgPrice: 560, growth: 5.8 },
    { district: 'Jinja', avgPrice: 350, growth: 6.2 },
    { district: 'Masaka', avgPrice: 280, growth: 7.8 },
    { district: 'Mbarara', avgPrice: 320, growth: 8.9 },
  ];

  const agriculturalData = [
    { district: 'Wakiso', avgPrice: 220, growth: 12.5 },
    { district: 'Mukono', avgPrice: 180, growth: 10.8 },
    { district: 'Mpigi', avgPrice: 150, growth: 13.2 },
    { district: 'Luweero', avgPrice: 110, growth: 14.5 },
    { district: 'Kayunga', avgPrice: 105, growth: 12.8 },
    { district: 'Mityana', avgPrice: 115, growth: 11.2 },
    { district: 'Masaka', avgPrice: 130, growth: 9.8 },
    { district: 'Mbarara', avgPrice: 140, growth: 10.5 },
    { district: 'Jinja', avgPrice: 160, growth: 8.9 },
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
              Uganda Regional Property Comparison (2024)
            </CardTitle>
            <CardDescription className="text-blue-100">
              Compare property values across different regions of Uganda - Updated market data
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
                  <h3 className="text-lg font-medium mb-2">2024 Residential Market Insights</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Residential property prices in Kampala Central have risen to UGX 650 million average. 
                    Mukono shows exceptional growth at 11.2%, driven by industrial development and improved infrastructure connectivity to Kampala.
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
                  <h3 className="text-lg font-medium mb-2">2024 Commercial Market Insights</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Commercial properties in Kampala Central command premium prices at UGX 950 million on average. 
                    Mukono shows the strongest growth at 9.5%, indicating increasing commercial development.
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
                  <h3 className="text-lg font-medium mb-2">2024 Agricultural Land Insights</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Agricultural land in Wakiso has the highest average price at UGX 220 million per acre. 
                    Luweero shows exceptional growth of 14.5%, making it a prime area for agricultural investment.
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
            <CardTitle className="text-lg">2024 Price Trends Analysis</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="font-medium">Fastest Growing Areas</h3>
                <ol className="mt-2 space-y-2 list-decimal list-inside text-sm">
                  <li>Luweero (Agricultural) - 14.5%</li>
                  <li>Mpigi (Agricultural) - 13.2%</li>
                  <li>Kayunga (Agricultural) - 12.8%</li>
                  <li>Wakiso (Agricultural) - 12.5%</li>
                  <li>Mukono (Residential) - 11.2%</li>
                </ol>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="font-medium">Premium Price Areas (2024)</h3>
                <ol className="mt-2 space-y-2 list-decimal list-inside text-sm">
                  <li>Kampala Central (Commercial) - UGX 950M</li>
                  <li>Nakawa (Commercial) - UGX 720M</li>
                  <li>Industrial Area (Commercial) - UGX 680M</li>
                  <li>Kampala Central (Residential) - UGX 650M</li>
                  <li>Entebbe (Commercial) - UGX 560M</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-t-lg">
            <CardTitle className="text-lg">2024 Investment Opportunities</CardTitle>
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
                    Mukono and Wakiso lead with double-digit growth. Infrastructure projects and industrial development driving demand.
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
                    Agricultural land in Luweero and Mpigi shows exceptional growth over 13%, driven by modern farming and land banking.
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
