
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationsPopover from './NotificationsPopover';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Notification } from '@/types/notification';

const NotificationsDropdown = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch notifications on load
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        
        if (data) {
          setNotifications(data as Notification[]);
          setUnreadCount(data.filter(n => !n.is_read).length);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    fetchNotifications();
    
    // Set up real-time subscription for new notifications
    if (user) {
      const notificationsChannel = supabase
        .channel('notifications_changes')
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            // Add the new notification to the list
            const newNotification = payload.new as Notification;
            setNotifications(prev => [newNotification, ...prev].slice(0, 10));
            setUnreadCount(prev => prev + 1);
            
            // Show a toast notification
            toast({
              title: 'New Notification',
              description: newNotification.message,
              duration: 5000,
            });
          }
        )
        .subscribe();
        
      // Cleanup subscription on unmount
      return () => {
        supabase.removeChannel(notificationsChannel);
      };
    }
  }, [user, toast]);

  // Mark notifications as read when opening the dropdown
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    
    if (open && unreadCount > 0 && user) {
      // Mark all as read in the database
      const unreadIds = notifications
        .filter(n => !n.is_read)
        .map(n => n.id);
        
      if (unreadIds.length > 0) {
        supabase
          .from('notifications')
          .update({ is_read: true })
          .in('id', unreadIds)
          .then(() => {
            // Update local state
            setNotifications(prev => 
              prev.map(n => unreadIds.includes(n.id) ? {...n, is_read: true} : n)
            );
            setUnreadCount(0);
          })
          .catch(error => {
            console.error('Error marking notifications as read:', error);
          });
      }
    }
  };

  return (
    <div className="relative">
      <NotificationsPopover 
        open={open} 
        onOpenChange={handleOpenChange}
        trigger={
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        }
        notifications={notifications}
      />
    </div>
  );
};

export default NotificationsDropdown;
