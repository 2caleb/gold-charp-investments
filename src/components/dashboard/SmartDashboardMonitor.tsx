
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface DashboardAlert {
  id: string;
  type: 'new_application' | 'status_change' | 'workflow_update';
  message: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
}

const SmartDashboardMonitor: React.FC = () => {
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  useEffect(() => {
    // Set up real-time monitoring for loan applications
    const loanApplicationsChannel = supabase
      .channel('smart_dashboard_loan_monitor')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loan_applications'
        },
        (payload) => {
          handleLoanApplicationChange(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
          console.log('Smart dashboard loan monitoring active');
        } else if (status === 'CHANNEL_ERROR') {
          setConnectionStatus('disconnected');
          console.error('Loan applications channel subscription error');
        }
      });

    // Set up real-time monitoring for workflow changes
    const workflowChannel = supabase
      .channel('smart_dashboard_workflow_monitor')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loan_appliations_workflow'
        },
        (payload) => {
          handleWorkflowChange(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Smart dashboard workflow monitoring active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Workflow channel subscription error');
        }
      });

    return () => {
      supabase.removeChannel(loanApplicationsChannel);
      supabase.removeChannel(workflowChannel);
    };
  }, []);

  const handleLoanApplicationChange = (payload: any) => {
    const newAlert: DashboardAlert = {
      id: Date.now().toString(),
      type: payload.eventType === 'INSERT' ? 'new_application' : 'status_change',
      message: generateAlertMessage(payload),
      timestamp: new Date(),
      priority: determineAlertPriority(payload)
    };

    setAlerts(prev => [newAlert, ...prev].slice(0, 5)); // Keep only last 5 alerts

    // Show toast notification
    toast({
      title: getAlertTitle(newAlert.type),
      description: newAlert.message,
      duration: 5000,
    });
  };

  const handleWorkflowChange = (payload: any) => {
    const newAlert: DashboardAlert = {
      id: Date.now().toString() + '_workflow',
      type: 'workflow_update',
      message: `Workflow action: ${payload.new?.action || 'Unknown action'} by ${payload.new?.performed_by || 'Unknown user'}`,
      timestamp: new Date(),
      priority: 'medium'
    };

    setAlerts(prev => [newAlert, ...prev].slice(0, 5));

    toast({
      title: 'Workflow Update',
      description: newAlert.message,
      duration: 3000,
    });
  };

  const generateAlertMessage = (payload: any): string => {
    if (payload.eventType === 'INSERT') {
      return `New loan application from ${payload.new.client_name} for UGX ${parseInt(payload.new.loan_amount).toLocaleString()}`;
    } else if (payload.eventType === 'UPDATE') {
      const oldStatus = payload.old?.status || 'unknown';
      const newStatus = payload.new?.status || 'unknown';
      return `Application status changed from ${oldStatus} to ${newStatus} for ${payload.new.client_name}`;
    }
    return 'Loan application updated';
  };

  const determineAlertPriority = (payload: any): 'low' | 'medium' | 'high' => {
    if (payload.eventType === 'INSERT') {
      const amount = parseInt(payload.new.loan_amount.replace(/,/g, ''));
      if (amount > 50000000) return 'high'; // High value loans
      if (amount > 10000000) return 'medium';
      return 'low';
    }
    
    if (payload.new?.status === 'approved' || payload.new?.status === 'rejected') {
      return 'high';
    }
    
    return 'medium';
  };

  const getAlertTitle = (type: string): string => {
    switch (type) {
      case 'new_application': return 'New Application';
      case 'status_change': return 'Status Update';
      case 'workflow_update': return 'Workflow Update';
      default: return 'Dashboard Alert';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'new_application': return <Bell className="h-4 w-4" />;
      case 'status_change': return <TrendingUp className="h-4 w-4" />;
      case 'workflow_update': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="premium-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
              connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></div>
            Smart Monitor
          </h3>
          <Badge variant="outline" className="text-xs">
            {connectionStatus === 'connected' && <CheckCircle className="h-3 w-3 mr-1" />}
            {connectionStatus.toUpperCase()}
          </Badge>
        </div>

        {alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className={`p-1 rounded-full ${getPriorityColor(alert.priority)}`}>
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <Badge className={`${getPriorityColor(alert.priority)} text-xs border`}>
                  {alert.priority}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              {connectionStatus === 'connected' ? 'Monitoring for changes...' : 'Waiting for connection...'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartDashboardMonitor;
