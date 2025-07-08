import React from 'react';
import { Package, DollarSign, TrendingUp, Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/currencyUtils';
import type { DeliveryStats } from '@/types/delivery';

interface DeliveryDashboardProps {
  stats: DeliveryStats;
  isLoading: boolean;
}

const DeliveryDashboard: React.FC<DeliveryDashboardProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Deliveries',
      value: stats.total_deliveries.toLocaleString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Trays',
      value: stats.total_trays.toLocaleString(),
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.total_revenue),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Unique Suppliers',
      value: stats.unique_suppliers.toString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Paid Deliveries',
      value: stats.paid_deliveries.toString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      badge: `${stats.total_deliveries > 0 ? ((stats.paid_deliveries / stats.total_deliveries) * 100).toFixed(1) : 0}%`,
    },
    {
      title: 'Pending Deliveries',
      value: stats.pending_deliveries.toString(),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      badge: `${stats.total_deliveries > 0 ? ((stats.pending_deliveries / stats.total_deliveries) * 100).toFixed(1) : 0}%`,
    },
    {
      title: 'Overdue Deliveries',
      value: stats.overdue_deliveries.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      badge: `${stats.total_deliveries > 0 ? ((stats.overdue_deliveries / stats.total_deliveries) * 100).toFixed(1) : 0}%`,
    },
    {
      title: 'Collection Rate',
      value: `${stats.total_deliveries > 0 ? ((stats.paid_deliveries / stats.total_deliveries) * 100).toFixed(1) : 0}%`,
      icon: TrendingUp,
      color: stats.paid_deliveries / Math.max(stats.total_deliveries, 1) >= 0.8 ? 'text-green-600' : 
            stats.paid_deliveries / Math.max(stats.total_deliveries, 1) >= 0.6 ? 'text-yellow-600' : 'text-red-600',
      bgColor: stats.paid_deliveries / Math.max(stats.total_deliveries, 1) >= 0.8 ? 'bg-green-50' : 
               stats.paid_deliveries / Math.max(stats.total_deliveries, 1) >= 0.6 ? 'bg-yellow-50' : 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Delivery Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of egg delivery operations and supplier performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {stat.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Payment Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Paid */}
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Paid</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                {stats.paid_deliveries}
              </div>
              <div className="text-sm text-green-700">
                {formatCurrency(stats.total_revenue)} revenue
              </div>
            </div>

            {/* Pending */}
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">Pending</span>
              </div>
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {stats.pending_deliveries}
              </div>
              <div className="text-sm text-yellow-700">
                Awaiting payment
              </div>
            </div>

            {/* Overdue */}
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-red-800">Overdue</span>
              </div>
              <div className="text-2xl font-bold text-red-600 mb-1">
                {stats.overdue_deliveries}
              </div>
              <div className="text-sm text-red-700">
                Requires attention
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryDashboard;