
export interface LoanWorkflow {
  id: string;
  loan_application_id: string;
  current_stage: WorkflowStage;
  field_officer_approved: boolean | null;
  manager_approved: boolean | null;
  director_approved: boolean | null;
  ceo_approved: boolean | null;
  chairperson_approved: boolean | null;
  field_officer_notes: string | null;
  manager_notes: string | null;
  director_notes: string | null;
  ceo_notes: string | null;
  chairperson_notes: string | null;
  field_officer_name?: string | null;
  manager_name?: string | null;
  director_name?: string | null;
  ceo_name?: string | null;
  chairperson_name?: string | null;
  created_at: string;
  updated_at: string;
}

export type WorkflowStage = 'field_officer' | 'manager' | 'director' | 'ceo' | 'chairperson';

// Updated workflow stages
export const WORKFLOW_STAGES: WorkflowStage[] = [
  'field_officer',
  'manager',
  'director',
  'ceo',
  'chairperson'
];

export const workflowStageNames: Record<WorkflowStage, string> = {
  'field_officer': 'Field Officer Review',
  'manager': 'Manager Review',
  'director': 'Director Risk Assessment',
  'ceo': 'CEO Review',
  'chairperson': 'Chairperson Final Approval'
};

export const getNextStage = (currentStage: WorkflowStage): WorkflowStage | null => {
  const currentIndex = WORKFLOW_STAGES.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex === WORKFLOW_STAGES.length - 1) {
    return null;
  }
  return WORKFLOW_STAGES[currentIndex + 1];
};
