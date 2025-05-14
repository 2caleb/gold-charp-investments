
import React from 'react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface NotificationToastProps {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const showNotificationToast = ({
  title,
  description,
  variant = 'default',
  action
}: NotificationToastProps) => {
  toast({
    title,
    description,
    variant,
    action: action ? (
      <Button variant="outline" size="sm" onClick={action.onClick}>
        {action.label}
      </Button>
    ) : undefined,
  });
};

export const showDatabaseNotAvailableToast = () => {
  showNotificationToast({
    title: 'Database Tables Not Available',
    description: 'Using sample data until tables are created in Supabase.',
    variant: 'destructive',
    action: {
      label: 'Learn More',
      onClick: () => {
        window.open('https://supabase.com/dashboard', '_blank');
      }
    }
  });
};

export const showDataFetchErrorToast = (entityName: string) => {
  showNotificationToast({
    title: `${entityName} Data Error`,
    description: 'Using sample data while we resolve the issue.',
    variant: 'destructive',
  });
};
