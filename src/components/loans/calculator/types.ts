
export interface InstallmentCalculatorProps {
  // Support both old and new prop names for backward compatibility
  amount?: number;
  term?: number;
  unit?: 'days' | 'weeks' | 'months' | 'years';
  loanAmount?: number;
  duration?: number;
  termUnit?: 'days' | 'weeks' | 'months' | 'years';
  interestRate: number;
  className?: string;
}

export type InstallmentScheduleItem = {
  date: string;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export type InstallmentSchedule = InstallmentScheduleItem[];
