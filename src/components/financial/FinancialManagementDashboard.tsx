
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Plus,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useFinancialManagement } from '@/hooks/use-financial-management';
import { useFinancialAdjustments } from '@/hooks/use-financial-adjustments';
import FinancialEntryForm from './FinancialEntryForm';
import FinancialAdjustmentForm from './FinancialAdjustmentForm';
import SecurityGuard from '@/components/security/SecurityGuard';

const FinancialManagementDashboard: React.FC = () => {
  const { entries, isLoading: entriesLoading } = useFinancialManagement();
  const { adjustments, isLoading: adjustmentsLoading } = useFinancialAdjustments();
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manual_income':
        return 'bg-green-100 text-green-800';
      case 'manual_expense':
        return 'bg-red-100 text-red-800';
      case 'budget_target':
        return 'bg-blue-100 text-blue-800';
      case 'financial_goal':
        return 'bg-purple-100 text-purple-800';
      case 'adjustment':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate summary statistics
  const totalManualIncome = entries
    .filter(e => e.entry_type === 'manual_income' && e.approval_status === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalManualExpenses = entries
    .filter(e => e.entry_type === 'manual_expense' && e.approval_status === 'approved')
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingApprovals = entries.filter(e => e.approval_status === 'pending').length;
  const activeAdjustments = adjustments.filter(a => a.status === 'active').length;

  return (
    <SecurityGuard action="canModifyExpenses">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
            <p className="text-gray-600">Manage manual entries, adjustments, and financial targets</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowEntryForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Entry
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowAdjustmentForm(true)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              New Adjustment
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Manual Income</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalManualIncome)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Manual Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(totalManualExpenses)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingApprovals}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Adjustments</p>
                  <p className="text-2xl font-bold text-blue-600">{activeAdjustments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="entries" className="space-y-4">
          <TabsList>
            <TabsTrigger value="entries">Financial Entries</TabsTrigger>
            <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
            <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Entries</CardTitle>
              </CardHeader>
              <CardContent>
                {entriesLoading ? (
                  <div className="text-center py-8">Loading entries...</div>
                ) : entries.length === 0 ? (
                  <div className="text-center py-8">No financial entries found</div>
                ) : (
                  <div className="space-y-4">
                    {entries.map((entry) => (
                      <div key={entry.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getTypeColor(entry.entry_type)}>
                                {entry.entry_type.replace('_', ' ')}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                {getStatusIcon(entry.approval_status)}
                                {entry.approval_status}
                              </Badge>
                            </div>
                            <h3 className="font-semibold">{entry.description}</h3>
                            <p className="text-sm text-gray-600">Category: {entry.category}</p>
                            <p className="text-lg font-bold text-blue-600">
                              {formatCurrency(entry.amount)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {new Date(entry.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="adjustments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Adjustments</CardTitle>
              </CardHeader>
              <CardContent>
                {adjustmentsLoading ? (
                  <div className="text-center py-8">Loading adjustments...</div>
                ) : adjustments.length === 0 ? (
                  <div className="text-center py-8">No adjustments found</div>
                ) : (
                  <div className="space-y-4">
                    {adjustments.map((adjustment) => (
                      <div key={adjustment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{adjustment.adjustment_type.replace('_', ' ')}</Badge>
                              <Badge variant={adjustment.status === 'active' ? 'default' : 'secondary'}>
                                {adjustment.status}
                              </Badge>
                            </div>
                            <h3 className="font-semibold">{adjustment.reason}</h3>
                            <div className="flex gap-4 mt-2">
                              <span className="text-sm">
                                Original: {formatCurrency(adjustment.original_value)}
                              </span>
                              <span className="text-sm">
                                Adjusted: {formatCurrency(adjustment.adjusted_value)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {new Date(adjustment.effective_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Pending approvals content will be handled by the approval interface */}
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Approval interface coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Forms */}
        {showEntryForm && (
          <FinancialEntryForm 
            onClose={() => setShowEntryForm(false)}
            onSuccess={() => setShowEntryForm(false)}
          />
        )}

        {showAdjustmentForm && (
          <FinancialAdjustmentForm 
            onClose={() => setShowAdjustmentForm(false)}
            onSuccess={() => setShowAdjustmentForm(false)}
          />
        )}
      </div>
    </SecurityGuard>
  );
};

export default FinancialManagementDashboard;
