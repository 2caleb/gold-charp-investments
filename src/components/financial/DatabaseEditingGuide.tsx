
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Edit, Eye } from 'lucide-react';

const DatabaseEditingGuide: React.FC = () => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Direct Database Editing Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">How to Edit Financial Figures</h3>
          <p className="text-blue-800 text-sm">
            You can now edit financial figures directly in your Supabase database. Changes will automatically reflect in your dashboard.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Key Database Tables:</h4>
          
          <div className="grid gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">financial_management</Badge>
                <Edit className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Use this table to add manual income/expense entries that will appear in your dashboard.
              </p>
              <div className="space-y-2 text-sm">
                <div><strong>entry_type:</strong> 'manual_income' | 'manual_expense' | 'budget_target' | 'financial_goal'</div>
                <div><strong>category:</strong> Text description (e.g., 'consultation_fees', 'software_licenses')</div>
                <div><strong>description:</strong> Detailed description</div>
                <div><strong>amount:</strong> Numeric amount in UGX</div>
                <div><strong>approval_status:</strong> 'approved' (must be approved to show in dashboard)</div>
                <div><strong>status:</strong> 'active' (must be active to show in dashboard)</div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">financial_adjustments</Badge>
                <Edit className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Use this table to override/adjust specific financial metrics.
              </p>
              <div className="space-y-2 text-sm">
                <div><strong>adjustment_type:</strong> 'income_adjustment' | 'expense_adjustment' | 'portfolio_adjustment' | 'collection_rate_override'</div>
                <div><strong>original_value:</strong> The original value being adjusted</div>
                <div><strong>adjusted_value:</strong> The new value to use</div>
                <div><strong>reason:</strong> Why this adjustment is needed</div>
                <div><strong>status:</strong> 'active' (adjustments only apply when active)</div>
                <div><strong>effective_date:</strong> When the adjustment starts (today or earlier)</div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">financial_summary</Badge>
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600 mb-3">
                This table is automatically calculated, but you can view/edit the base financial metrics here.
              </p>
              <div className="space-y-2 text-sm">
                <div><strong>total_income:</strong> Total income amount</div>
                <div><strong>total_expenses:</strong> Total expenses amount</div>
                <div><strong>total_loan_portfolio:</strong> Total loan amount</div>
                <div><strong>collection_rate:</strong> Collection rate percentage</div>
                <div><strong>net_income:</strong> Income minus expenses</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-900 mb-2">Quick Steps:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-green-800">
            <li>Go to your Supabase dashboard → Table Editor</li>
            <li>Select the table you want to edit</li>
            <li>Insert/Update rows with your financial data</li>
            <li>Make sure approval_status='approved' and status='active' for entries to show</li>
            <li>Refresh your dashboard to see changes</li>
          </ol>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-900 mb-2">Important Notes:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
            <li>Manual entries require approval_status='approved' to appear in totals</li>
            <li>Adjustments override calculated values when active</li>
            <li>Changes reflect immediately in your main dashboard</li>
            <li>Use the created_by field to track who made changes (use user UUID)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseEditingGuide;
