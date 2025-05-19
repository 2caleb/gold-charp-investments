
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Database, Search, Download, Calendar, Filter, 
  ArrowUpRight, TrendingUp, LineChart as LineChartIcon 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';

const PropertyAnalytics = () => {
  // Property type distribution data
  const propertyTypeData = [
    { name: 'Residential', value: 55, color: '#3B82F6' },
    { name: 'Commercial', value: 25, color: '#8B5CF6' },
    { name: 'Agricultural', value: 15, color: '#059669' },
    { name: 'Industrial', value: 5, color: '#F59E0B' },
  ];
  
  // Price trend data
  const priceTrendData = [
    { month: 'Jan', residential: 100, commercial: 120, agricultural: 95 },
    { month: 'Feb', residential: 102, commercial: 118, agricultural: 97 },
    { month: 'Mar', residential: 105, commercial: 122, agricultural: 99 },
    { month: 'Apr', residential: 107, commercial: 125, agricultural: 98 },
    { month: 'May', residential: 109, commercial: 130, agricultural: 100 },
    { month: 'Jun', residential: 112, commercial: 132, agricultural: 103 },
    { month: 'Jul', residential: 115, commercial: 135, agricultural: 105 },
    { month: 'Aug', residential: 118, commercial: 138, agricultural: 108 },
    { month: 'Sep', residential: 120, commercial: 142, agricultural: 110 },
    { month: 'Oct', residential: 123, commercial: 145, agricultural: 112 },
    { month: 'Nov', residential: 125, commercial: 148, agricultural: 115 },
    { month: 'Dec', residential: 128, commercial: 152, agricultural: 118 },
  ];
  
  // Recent valuations data
  const recentValuationsData = [
    { id: 'VAL-2305', location: 'Muyenga, Kampala', type: 'Residential', fairValue: '750M', date: '2025-05-14' },
    { id: 'VAL-2304', location: 'Industrial Area, Kampala', type: 'Commercial', fairValue: '1.2B', date: '2025-05-12' },
    { id: 'VAL-2303', location: 'Bugolobi, Kampala', type: 'Residential', fairValue: '680M', date: '2025-05-10' },
    { id: 'VAL-2302', location: 'Wakiso', type: 'Agricultural', fairValue: '450M', date: '2025-05-09' },
    { id: 'VAL-2301', location: 'Entebbe Road', type: 'Commercial', fairValue: '920M', date: '2025-05-07' },
  ];
  
  // Loan approval rate data
  const loanApprovalData = [
    { month: 'Jan', rate: 78 },
    { month: 'Feb', rate: 75 },
    { month: 'Mar', rate: 80 },
    { month: 'Apr', rate: 82 },
    { month: 'May', rate: 85 },
    { month: 'Jun', rate: 83 },
    { month: 'Jul', rate: 87 },
    { month: 'Aug', rate: 88 },
    { month: 'Sep', rate: 86 },
    { month: 'Oct', rate: 89 },
    { month: 'Nov', rate: 90 },
    { month: 'Dec', rate: 92 },
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
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Properties</p>
                <h3 className="text-2xl font-bold mt-1">1,234</h3>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> 
                  <span>+5.2% from last month</span>
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg">
                <Database className="h-5 w-5 text-blue-700 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg. Value</p>
                <h3 className="text-2xl font-bold mt-1">UGX 450M</h3>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> 
                  <span>+3.8% from last month</span>
                </p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-lg">
                <LineChartIcon className="h-5 w-5 text-purple-700 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Growth Rate</p>
                <h3 className="text-2xl font-bold mt-1">7.2% YoY</h3>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> 
                  <span>+0.5% from Q1</span>
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-700 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loan Approval</p>
                <h3 className="text-2xl font-bold mt-1">87.5%</h3>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> 
                  <span>+2.1% from last month</span>
                </p>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900/50 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-amber-700 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-md lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Property Price Trends</CardTitle>
                <CardDescription>Year-to-date price changes by property type</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" /> Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" /> Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={priceTrendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
                  <XAxis dataKey="month" />
                  <YAxis 
                    tickFormatter={(value) => `${value}`}
                    label={{ value: 'Price Index (Jan = 100)', angle: -90, position: 'insideLeft' }} 
                  />
                  <Tooltip
                    formatter={(value) => [`${value}`, 'Price Index']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="residential" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    name="Residential"
                    activeDot={{ r: 8 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="commercial" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    name="Commercial" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="agricultural" 
                    stroke="#059669" 
                    strokeWidth={2}
                    name="Agricultural" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle>Property Distribution</CardTitle>
            <CardDescription>By property type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={propertyTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {propertyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, 'Percentage']}
                    labelFormatter={(label) => `Type: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {propertyTypeData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="text-sm">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Recent Property Valuations</CardTitle>
                <CardDescription>Latest property evaluations across Uganda</CardDescription>
              </div>
              <div className="flex w-full sm:w-auto">
                <Input 
                  placeholder="Search valuations..." 
                  className="mr-2"
                  startIcon={<Search className="h-4 w-4" />}
                />
                <Button>
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Fair Value</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentValuationsData.map((valuation) => (
                    <TableRow key={valuation.id}>
                      <TableCell className="font-medium">{valuation.id}</TableCell>
                      <TableCell>{valuation.location}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`
                            ${valuation.type === 'Residential' 
                              ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800' 
                              : valuation.type === 'Commercial' 
                                ? 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
                                : 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                            }
                          `}
                        >
                          {valuation.type}
                        </Badge>
                      </TableCell>
                      <TableCell>UGX {valuation.fairValue}</TableCell>
                      <TableCell>{new Date(valuation.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="loan-performance">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="loan-performance">Loan Performance</TabsTrigger>
              <TabsTrigger value="market-overview">Market Overview</TabsTrigger>
              <TabsTrigger value="regional-hotspots">Regional Hotspots</TabsTrigger>
            </TabsList>
            
            <div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export Report
              </Button>
            </div>
          </div>
          
          <TabsContent value="loan-performance">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Loan Approval Rate</CardTitle>
                <CardDescription>Monthly approval rate based on property evaluations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={loanApprovalData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.6} />
                      <XAxis dataKey="month" />
                      <YAxis 
                        domain={[70, 100]} 
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip formatter={(value) => [`${value}%`, 'Approval Rate']} />
                      <Area 
                        type="monotone" 
                        dataKey="rate" 
                        stroke="#1E3A8A" 
                        fillOpacity={1} 
                        fill="url(#colorRate)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Performance Overview</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Loan approval rates have steadily increased throughout the year, reaching 92% in December. 
                    This indicates improved property valuations and better alignment with lending criteria.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="market-overview">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Real Estate Market Overview</CardTitle>
                <CardDescription>Current market status and projections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Market Summary</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      The Ugandan real estate market continues to show strong growth in 2025, with an average appreciation of 7.2% year-over-year. 
                      Urban centers like Kampala and emerging areas like Mukono are leading the growth.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h3 className="font-medium mb-1">Residential</h3>
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-1">+6.5% YoY</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Steady growth in suburban areas, with increased demand for gated communities
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <h3 className="font-medium mb-1">Commercial</h3>
                      <div className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-1">+8.3% YoY</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Strong recovery in office space and retail locations post-pandemic
                      </p>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h3 className="font-medium mb-1">Agricultural</h3>
                      <div className="text-2xl font-bold text-green-700 dark:text-green-400 mb-1">+9.1% YoY</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Highest growth sector, driven by increased investment in food security
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="regional-hotspots">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Regional Investment Hotspots</CardTitle>
                <CardDescription>Areas with highest growth potential</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 rounded-lg">
                      <h3 className="font-medium">Top Growth Areas</h3>
                      <ol className="mt-2 space-y-2">
                        <li className="flex items-center justify-between">
                          <span>1. Mukono (East of Kampala)</span>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">+12.5%</Badge>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>2. Entebbe Road Corridor</span>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">+10.8%</Badge>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>3. Wakiso (Northwestern)</span>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">+9.7%</Badge>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>4. Jinja Road Industrial Area</span>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">+8.9%</Badge>
                        </li>
                        <li className="flex items-center justify-between">
                          <span>5. Kampala's Northern Bypass</span>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">+8.2%</Badge>
                        </li>
                      </ol>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-4 rounded-lg">
                      <h3 className="font-medium">Investment Recommendations</h3>
                      <ul className="mt-2 space-y-3">
                        <li className="flex items-start">
                          <div className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 p-1 rounded-full mr-2 mt-0.5">
                            <ArrowUpRight className="h-3 w-3" />
                          </div>
                          <span className="text-sm">
                            <span className="font-medium">Residential Development:</span> Focus on Mukono and Wakiso for middle-income housing projects
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 p-1 rounded-full mr-2 mt-0.5">
                            <ArrowUpRight className="h-3 w-3" />
                          </div>
                          <span className="text-sm">
                            <span className="font-medium">Commercial Investment:</span> Jinja Road Industrial Area shows strong growth in commercial properties
                          </span>
                        </li>
                        <li className="flex items-start">
                          <div className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 p-1 rounded-full mr-2 mt-0.5">
                            <ArrowUpRight className="h-3 w-3" />
                          </div>
                          <span className="text-sm">
                            <span className="font-medium">Agricultural Land Banking:</span> Secure agricultural land in Mpigi and Luweero for future conversion
                          </span>
                        </li>
                      </ul>
                    </div>
                    
                    <Button className="w-full bg-gradient-to-r from-blue-700 to-green-700 hover:from-blue-800 hover:to-green-800">
                      Request Custom Investment Analysis
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default PropertyAnalytics;
