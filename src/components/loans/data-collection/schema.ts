
import { z } from "zod";

export const dataCollectionFormSchema = z.object({
  full_name: z.string().min(2, { message: "Full name is required" }),
  phone_number: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
  address: z.string().min(5, { message: "Address is required" }),
  id_number: z.string().min(1, { message: "ID number is required" }),
  employment_status: z.string(),
  monthly_income: z.string(),
  loan_amount: z.string().min(1, { message: "Loan amount is required" }),
  loan_type: z.string(),
  loan_term: z.string(),
  term_unit: z.enum(["daily", "weekly", "monthly"]),
  guarantor1_name: z.string().min(2, { message: "Guarantor name is required" }),
  guarantor1_phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
  guarantor1_id_number: z.string().min(1, { message: "ID number is required" }),
  guarantor1_consent: z.boolean().refine((val) => val === true, {
    message: "Guarantor 1 must consent to be a guarantor",
  }),
  guarantor2_name: z.string().optional(),
  guarantor2_phone: z.string().optional(),
  guarantor2_id_number: z.string().optional(),
  guarantor2_consent: z.boolean().optional(),
  purpose_of_loan: z.string().min(1, { message: "Purpose of loan is required" }),
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
  email: z.string().email().optional().or(z.literal("")),
});

export type DataCollectionFormValues = z.infer<typeof dataCollectionFormSchema>;
