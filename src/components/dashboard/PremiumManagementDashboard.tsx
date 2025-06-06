
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRolePermissions } from '@/hooks/use-role-permissions';
import { useSharedExcelData } from '@/hooks/use-shared-excel-data';
import ExcelUploadCard from '@/components/excel/ExcelUploadCard';
import SharedExcelViewer from '@/components/excel/SharedExcelViewer';
import PremiumFinancialOverview from './PremiumFinancialOverview';
import EnhancedSmartDashboardMonitor from './EnhancedSmartDashboardMonitor';
import SecurityGuard from '@/components/security/SecurityGuard';
import { motion } from 'framer-motion';
import { 
  Crown, 
  TrendingUp, 
  FileSpreadsheet, 
  Shield,
  BarChart3,
  Users,
  DollarSign
} from 'lucide-react';

const PremiumManagementDashboard: React.FC = () => {
  const { userRole, isDirector, isCEO, isChairperson } = useRolePermissions();
  const { uploadHistory } = useSharedExcelData();

  const isExecutive = isDirector || isCEO || isChairperson;
  const recentUploads = uploadHistory?.slice(0, 3) || [];

  return (
    <div className="space-y-8 p-6">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center mb-2">
              <Crown className="h-8 w-8 mr-3 text-yellow-300" />
              <h1 className="text-3xl font-bold">Premium Management System</h1>
            </div>
            <p className="text-blue-100 text-lg">
              Advanced analytics and real-time data management platform
            </p>
            <div className="flex items-center mt-4">
              <Shield className="h-5 w-5 mr-2 text-green-300" />
              <span className="text-sm font-medium capitalize">
                Role: {userRole} {isExecutive && '(Executive Access)'}
              </span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-3xl font-bold">{uploadHistory?.length || 0}</div>
              <div className="text-blue-200 text-sm">Excel Files Uploaded</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Excel Management Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ExcelUploadCard />
          </div>
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center text-green-800">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Recent Upload Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentUploads.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent uploads available.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentUploads.map((upload) => (
                      <div
                        key={upload.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border"
                      >
                        <div className="flex items-center">
                          <FileSpreadsheet className="h-4 w-4 mr-3 text-green-600" />
                          <div>
                            <div className="font-medium text-sm">{upload.original_file_name}</div>
                            <div className="text-xs text-gray-500">
                              {upload.total_rows} rows • {upload.sheet_count} sheets
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            {new Date(upload.created_at).toLocaleDateString()}
                          </div>
                          <div className={`text-xs font-medium ${
                            upload.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {upload.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      {/* Financial Overview - Protected */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SecurityGuard action="canViewFinancials">
          <PremiumFinancialOverview />
        </SecurityGuard>
      </motion.div>

      {/* Shared Excel Data Viewer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <SharedExcelViewer />
      </motion.div>

      {/* Smart Dashboard Monitor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <EnhancedSmartDashboardMonitor />
      </motion.div>

      {/* System Status Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-400" />
            <div className="text-2xl font-bold">Live</div>
            <div className="text-gray-300 text-sm">Real-time Updates</div>
          </div>
          <div className="text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-green-400" />
            <div className="text-2xl font-bold">Secure</div>
            <div className="text-gray-300 text-sm">Role-based Access</div>
          </div>
          <div className="text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-400" />
            <div className="text-2xl font-bold">Premium</div>
            <div className="text-gray-300 text-sm">Advanced Analytics</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PremiumManagementDashboard;
