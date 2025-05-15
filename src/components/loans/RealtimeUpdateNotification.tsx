
import React from 'react';

interface RealtimeUpdateNotificationProps {
  update: string | null;
}

export const RealtimeUpdateNotification: React.FC<RealtimeUpdateNotificationProps> = ({ update }) => {
  if (!update) return null;
  
  return (
    <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
      {update}
    </div>
  );
};
