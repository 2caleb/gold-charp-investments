
import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface ActivityData {
  date: string;
  visits: number;
  applications: number;
  approvals: number;
}

interface OfficerPerformance {
  id: string;
  name: string;
  visits: number;
  applications: number;
  approvals: number;
  region: string;
}

interface RecentActivity {
  id: string;
  officer: string;
  activity: string;
  client: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export const FieldOfficerActivity = () => {
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [officerData, setOfficerData] = useState<OfficerPerformance[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch data from Supabase
        // For now, we'll use mock data
        
        // Mock activity trends
        const mockActivityData: ActivityData[] = [
          { date: '05/01', visits: 12, applications: 8, approvals: 4 },
          { date: '05/02', visits: 15, applications: 10, approvals: 7 },
          { date: '05/03', visits: 18, applications: 12, approvals: 9 },
          { date: '05/04', visits: 14, applications: 9, approvals: 6 },
          { date: '05/05', visits: 21, applications: 15, approvals: 11 },
          { date: '05/06', visits: 16, applications: 11, approvals: 8 },
          { date: '05/07', visits: 24, applications: 18, approvals: 13 },
        ];
        
        // Mock officer performance
        const mockOfficerData: OfficerPerformance[] = [
          { id: '1', name: 'John Mukasa', visits: 87, applications: 62, approvals: 48, region: 'Central' },
          { id: '2', name: 'Mary Achieng', visits: 95, applications: 71, approvals: 56, region: 'Eastern' },
          { id: '3', name: 'David Opio', visits: 78, applications: 54, approvals: 41, region: 'Northern' },
          { id: '4', name: 'Sarah Nambi', visits: 92, applications: 68, approvals: 52, region: 'Western' },
          { id: '5', name: 'Michael Okello', visits: 83, applications: 59, approvals: 45, region: 'Central' },
        ];
        
        // Mock recent activities
        const mockRecentActivities: RecentActivity[] = [
          { id: '1', officer: 'John Mukasa', activity: 'Client Visit', client: 'Kampala Traders Ltd', timestamp: '2025-05-14T10:30:00', status: 'completed' },
          { id: '2', officer: 'Mary Achieng', activity: 'Loan Application', client: 'Eastern Farmers Co-op', timestamp: '2025-05-14T09:15:00', status: 'completed' },
          { id: '3', officer: 'David Opio', activity: 'Document Collection', client: 'Northern Textiles', timestamp: '2025-05-14T11:45:00', status: 'pending' },
          { id: '4', officer: 'Sarah Nambi', activity: 'Property Appraisal', client: 'Mbarara Holdings', timestamp: '2025-05-14T08:20:00', status: 'completed' },
          { id: '5', officer: 'Michael Okello', activity: 'Loan Approval', client: 'Entebbe Tours', timestamp: '2025-05-14T12:10:00', status: 'cancelled' },
          { id: '6', officer: 'John Mukasa', activity: 'Follow-up Meeting', client: 'Central Electronics', timestamp: '2025-05-14T13:30:00', status: 'pending' },
        ];
        
        setActivityData(mockActivityData);
        setOfficerData(mockOfficerData);
        setRecentActivities(mockRecentActivities);
      } catch (err) {
        console.error('Error fetching field officer activity data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivityData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity Trends</CardTitle>
          <CardDescription>Field officer activities over the last week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={activityData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="visits" name="Client Visits" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                <Area type="monotone" dataKey="applications" name="Loan Applications" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                <Area type="monotone" dataKey="approvals" name="Approvals" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Officers</CardTitle>
            <CardDescription>Based on monthly application conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={officerData}
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="approvals" name="Approvals" fill="#82ca9d" />
                  <Bar dataKey="applications" name="Applications" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest field officer activities</CardDescription>
          </CardHeader>
          <CardContent className="max-h-64 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Officer</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.officer}</TableCell>
                    <TableCell>{activity.activity}</TableCell>
                    <TableCell>{activity.client}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          activity.status === 'completed' ? 'default' :
                          activity.status === 'pending' ? 'secondary' : 'destructive'
                        }
                      >
                        {activity.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
