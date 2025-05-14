
export interface Notification {
  id: string;
  user_id: string;
  message: string;
  related_to: string;
  entity_id: string;
  is_read: boolean;
  created_at: string;
}
