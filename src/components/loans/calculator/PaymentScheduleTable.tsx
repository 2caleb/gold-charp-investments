
import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InstallmentSchedule } from './types';

interface PaymentScheduleTableProps {
  schedule: InstallmentSchedule;
  term: number;
  unit: string;
}

const PaymentScheduleTable: React.FC<PaymentScheduleTableProps> = ({ 
  schedule, 
  term, 
  unit 
}) => {
  return (
    <Table>
      <TableCaption>Payment schedule for {term} {unit}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Payment Date</TableHead>
          <TableHead>Payment Amount</TableHead>
          <TableHead>Principal</TableHead>
          <TableHead>Interest</TableHead>
          <TableHead>Remaining Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedule.slice(0, 6).map((payment, index) => (
          <TableRow key={index}>
            <TableCell>{payment.date}</TableCell>
            <TableCell>{payment.payment.toLocaleString()}</TableCell>
            <TableCell>{payment.principal.toLocaleString()}</TableCell>
            <TableCell>{payment.interest.toLocaleString()}</TableCell>
            <TableCell>{payment.balance.toLocaleString()}</TableCell>
          </TableRow>
        ))}
        {schedule.length > 6 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center italic text-muted-foreground">
              ... {schedule.length - 6} more payments
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default PaymentScheduleTable;
