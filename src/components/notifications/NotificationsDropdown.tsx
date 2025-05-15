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
import { useUser } from '@/hooks/use-user';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  created_at: string;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  link: string | null;
}

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const dropdownRef = useRef(null);
  const { user } = useUser();
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
          setNotifications(data);
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
        }
      )
      .subscribe()

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

    // Inside the component where the error occurs:
    if (unreadIds.length > 0) {
      supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds)
        .then(() => {
          console.log('Notifications marked as read');
          // Additional success handling if needed
        })
        .catch(error => {
          console.error('Error marking notifications as read:', error);
        });
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds);

      if (error) {
        console.error('Error marking all as read:', error);
        toast({
          title: 'Error',
          description: 'Failed to mark notifications as read.',
          variant: 'destructive',
        });
      } else {
        // Optimistically update the state
        setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));
      }
    } finally {
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
                  <Link to={notification.link || '#'} onClick={() => {
                    if (!notification.is_read) {
                      supabase
                        .from('notifications')
                        .update({ is_read: true })
                        .eq('id', notification.id)
                        .then(() => {
                          setNotifications(notifications.map(n =>
                            n.id === notification.id ? { ...n, is_read: true } : n
                          ));
                        });
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
