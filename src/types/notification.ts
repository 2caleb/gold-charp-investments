
export interface Notification {
  id: string;
  user_id: string;
  message: string;
  related_to: string;
  entity_id: string;
  is_read: boolean;
  created_at: string;
}

export interface WorkflowData {
  id: string;
  loan_application_id: string;
  current_stage: string;
  field_officer_approved: boolean;
  manager_approved: boolean;
  director_approved: boolean;
  ceo_approved: boolean;
  chairperson_approved: boolean;
  field_officer_notes?: string;
  manager_notes?: string;
  director_notes?: string;
  ceo_notes?: string;
  chairperson_notes?: string;
  created_at: string;
  updated_at: string;
}
