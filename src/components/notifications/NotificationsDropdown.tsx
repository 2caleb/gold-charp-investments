
import React, { useState, useEffect, useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Loader2, CheckCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/types/notification';

interface DatabaseNotification {
  id: string;
  created_at: string;
  user_id: string;
  message: string;
  is_read: boolean;
  related_to: string;
  entity_id: string;
}

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  // Add a ref to track if we already showed toast notifications
  const notificationsToastShown = useRef(true); // Setting to true prevents initial toasts
  const dropdownRef = useRef(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          toast({
            title: 'Error',
            description: 'Failed to load notifications.',
            variant: 'destructive',
          });
        }

        if (data) {
          // Transform database notifications to match our Notification type
          const typedNotifications: Notification[] = data.map((item: DatabaseNotification) => ({
            id: item.id,
            user_id: item.user_id,
            message: item.message,
            related_to: item.related_to,
            entity_id: item.entity_id,
            is_read: item.is_read,
            created_at: item.created_at,
          }));
          setNotifications(typedNotifications);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Setup real-time subscription
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('Change received!', payload)
          fetchNotifications(); // Refresh notifications on changes
          
          // Only show toast notifications if they're not part of the initial load
          if (notificationsToastShown.current && payload.eventType === 'INSERT') {
            // No toast here - we've disabled them to prevent spamming
          }
        }
      )
      .subscribe()

    // After a second mark that initial loading is complete
    setTimeout(() => {
      notificationsToastShown.current = false;
    }, 1000);

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, toast]);

  const unreadNotifications = notifications.filter(notification => !notification.is_read);
  const unreadCount = unreadNotifications.length;

  const markAllAsRead = async () => {
    if (!user) return;

    setIsMarkingAsRead(true);
    const unreadIds = unreadNotifications.map(notification => notification.id);

    if (unreadIds.length > 0) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .in('id', unreadIds);
        
        // Optimistically update the state
        setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));
        
      } catch (error) {
        console.error('Error marking all as read:', error);
        toast({
          title: 'Error',
          description: 'Failed to mark notifications as read.',
          variant: 'destructive',
        });
      } finally {
        setIsMarkingAsRead(false);
      }
    } else {
      setIsMarkingAsRead(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          {unreadCount > 0 && (
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 md:w-96" align="end">
        <div className="px-4 py-2 flex justify-between items-center">
          <p className="text-sm font-bold">Notifications</p>
          {unreadCount > 0 ? (
            <button
              className="text-xs text-blue-500 hover:text-blue-700 focus:outline-none"
              onClick={markAllAsRead}
              disabled={isMarkingAsRead}
            >
              {isMarkingAsRead ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Marking...
                </>
              ) : (
                <>
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all as read
                </>
              )}
            </button>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="px-4 py-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-2 text-sm text-gray-500">No notifications</div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem key={notification.id} className="px-4 py-2 text-sm">
              <div className="flex items-start space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={`https://avatar.vercel.sh/${notification.user_id}.png`} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-gray-800 dark:text-gray-100">{notification.message}</p>
                  <Link to={`/notifications/${notification.id}`} onClick={() => {
                    if (!notification.is_read) {
                      // Fix promise handling with async/await in an IIFE
                      (async () => {
                        try {
                          await supabase
                            .from('notifications')
                            .update({ is_read: true })
                            .eq('id', notification.id);
                          
                          setNotifications(notifications.map(n =>
                            n.id === notification.id ? { ...n, is_read: true } : n
                          ));
                        } catch (error) {
                          console.error('Error marking notification as read:', error);
                        }
                      })();
                    }
                  }}
                  >
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </Link>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700">
          <Link to="/notifications">View All</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
