
import React, { useState } from 'react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import NotificationList from './NotificationList';
import { useNavigate } from 'react-router-dom';
import { Notification } from '@/types/notification';

const NotificationsPopover: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead,
    deleteNotification 
  } = useNotifications();
  const navigate = useNavigate();

  const handleViewDetails = (notification: Notification) => {
    // Close the popover
    setOpen(false);
    
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 mr-4" 
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          <NotificationList 
            notifications={notifications}
            isLoading={isLoading}
            markAsRead={markAsRead}
            deleteNotification={deleteNotification}
            onViewDetails={handleViewDetails}
          />
        </div>

        <div className="p-2 border-t text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs w-full"
            onClick={() => {
              setOpen(false);
              navigate('/notifications');
            }}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
