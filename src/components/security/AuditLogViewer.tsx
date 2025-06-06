
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Search, Download, AlertCircle } from 'lucide-react';
import EnhancedSecurityGuard from './EnhancedSecurityGuard';

const AuditLogViewer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const { data: auditLogs, isLoading, error } = useQuery({
    queryKey: ['audit-logs', searchTerm, dateFilter],
    queryFn: async () => {
      let query = supabase
        .from('transaction_audit_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (searchTerm) {
        query = query.or(`action.ilike.%${searchTerm}%,old_status.ilike.%${searchTerm}%,new_status.ilike.%${searchTerm}%`);
      }

      if (dateFilter) {
        const startDate = new Date(dateFilter);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        query = query.gte('timestamp', startDate.toISOString()).lt('timestamp', endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionBadgeColor = (action: string) => {
    const criticalActions = ['role_change', 'unauthorized_access_attempt', 'permission_denied'];
    const warningActions = ['security_context_updated', 'permission_check'];
    
    if (criticalActions.includes(action)) return 'destructive';
    if (warningActions.includes(action)) return 'default';
    return 'secondary';
  };

  return (
    <EnhancedSecurityGuard action="canViewAuditLogs">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Audit Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search audit logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-48"
            />
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-gray-500">Loading audit logs...</div>
            </div>
          ) : error ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load audit logs. Please try again.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Old Status</TableHead>
                    <TableHead>New Status</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeColor(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.user_id ? log.user_id.substring(0, 8) + '...' : 'System'}
                      </TableCell>
                      <TableCell>{log.old_status || '-'}</TableCell>
                      <TableCell>{log.new_status || '-'}</TableCell>
                      <TableCell className="text-xs">{log.ip_address || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate text-xs">
                        {log.details ? JSON.stringify(log.details).substring(0, 50) + '...' : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {auditLogs?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No audit logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </EnhancedSecurityGuard>
  );
};

export default AuditLogViewer;
