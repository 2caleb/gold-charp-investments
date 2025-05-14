
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import RealTimeUpdates from '@/components/loans/RealTimeUpdates';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const DataCollectionDashboard = () => {
  const { user } = useAuth();
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentApplications = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('loan_applications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        setRecentApplications(data || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentApplications();
  }, [user]);

  const handleLoanUpdate = (payload: any) => {
    // Handle real-time updates for loan applications
    if (payload.eventType === 'INSERT') {
      const newApp = payload.new;
      setRecentApplications(prev => [newApp, ...prev].slice(0, 5));
      toast({
        title: 'New Application',
        description: `New loan application received from ${newApp.client_name}`,
      });
    } else if (payload.eventType === 'UPDATE') {
      setRecentApplications(prev => 
        prev.map(app => app.id === payload.new.id ? payload.new : app)
      );
    }
  };

  return (
    <Layout>
      <RealTimeUpdates onLoanUpdate={handleLoanUpdate} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Data Collection Dashboard</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Loan Applications</h2>
          
          {loading ? (
            <p>Loading applications...</p>
          ) : recentApplications.length > 0 ? (
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div key={app.id} className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{app.client_name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(app.created_at).toLocaleDateString()} - {app.loan_type} - UGX {app.loan_amount}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      app.status === 'approved' ? 'bg-green-100 text-green-800' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      app.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No recent applications found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DataCollectionDashboard;
