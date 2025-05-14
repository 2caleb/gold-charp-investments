
import React from 'react';
import { Notification } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Trash2, Eye } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface NotificationListProps {
  notifications: Notification[];
  isLoading: boolean;
  markAsRead: (id: string) => Promise<boolean>;
  deleteNotification: (id: string) => Promise<boolean>;
  onViewDetails?: (notification: Notification) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isLoading,
  markAsRead,
  deleteNotification,
  onViewDetails,
}) => {
  if (isLoading) {
    return <div className="py-4 text-center text-gray-500">Loading notifications...</div>;
  }

  if (notifications.length === 0) {
    return <div className="py-4 text-center text-gray-500">No notifications</div>;
  }

  const handleViewDetails = (notification: Notification) => {
    if (onViewDetails) {
      onViewDetails(notification);
    }
    
    // Mark as read when viewed
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  return (
    <div className="space-y-2 py-2">
      {notifications.map((notification) => (
        <div key={notification.id} className="relative">
          <div className={`p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className={`text-sm ${!notification.is_read ? 'font-medium' : ''}`}>
                  {notification.message}
                </p>
                <div className="flex items-center mt-1 space-x-2">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                  {!notification.is_read && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs">
                      New
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {notification.related_to}
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-1">
                {!notification.is_read && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => markAsRead(notification.id)} 
                    className="h-7 w-7"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                
                {onViewDetails && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleViewDetails(notification)} 
                    className="h-7 w-7"
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => deleteNotification(notification.id)}
                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          {notifications.indexOf(notification) < notifications.length - 1 && (
            <Separator className="my-1" />
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
