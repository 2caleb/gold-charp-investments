
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useNotifications } from '@/hooks/use-notifications';
import NotificationList from '@/components/notifications/NotificationList';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft } from 'lucide-react';
import { Notification } from '@/types/notification';
import { useNavigate } from 'react-router-dom';

const Notifications: React.FC = () => {
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    markAllAsRead,
    deleteNotification 
  } = useNotifications();
  const navigate = useNavigate();

  const handleViewDetails = (notification: Notification) => {
    // Navigate based on notification type
    switch (notification.related_to) {
      case 'loan_application':
        navigate(`/loan-applications/${notification.entity_id}`);
        break;
      case 'client':
        navigate(`/clients/${notification.entity_id}`);
        break;
      case 'loan':
        navigate(`/loans/${notification.entity_id}`);
        break;
      default:
        console.log('No route defined for this notification type');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <Layout>
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <span className="text-lg font-medium">All Notifications</span>
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={markAllAsRead}
                className="flex items-center"
              >
                <Check className="mr-1 h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>
          
          <div className="p-4">
            <NotificationList 
              notifications={notifications}
              isLoading={isLoading}
              markAsRead={markAsRead}
              deleteNotification={deleteNotification}
              onViewDetails={handleViewDetails}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Notifications;
