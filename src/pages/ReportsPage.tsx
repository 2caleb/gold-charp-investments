
import React from 'react';
import Layout from '@/components/layout/Layout';
import WeeklyReportsViewer from '@/components/reports/WeeklyReportsViewer';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const { userRole, isLoading } = useRolePermissions();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!userRole || !['manager', 'director', 'chairperson', 'ceo'].includes(userRole)) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Access Restricted</h3>
              <p className="text-gray-500">
                Weekly reports are only available to Manager, Director, Chairperson, and CEO roles.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <WeeklyReportsViewer />
      </div>
    </Layout>
  );
};

export default ReportsPage;
