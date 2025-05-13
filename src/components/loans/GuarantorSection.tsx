
import React from 'react';
import { FormItem, FormLabel, FormControl, FormDescription, FormField, FormFileUpload, FormCommitment, FormSection } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Control } from 'react-hook-form';

export interface GuarantorData {
  fullName: string;
  idNumber: string;
  phoneNumber: string;
  email: string;
  address: string;
  relationship: string;
  occupation: string;
  employer: string;
  monthlyIncome: string;
  yearsKnown: string;
  commitmentStatement: string;
  agreeToTerms: boolean;
  documents: {
    idDocument: FileList | null;
    proofOfIncome: FileList | null;
    proofOfAddress: FileList | null;
  };
}

interface GuarantorSectionProps {
  control: Control<any>;
  index: number;
  guarantorLabel: string;
}

const GuarantorSection = ({ control, index, guarantorLabel }: GuarantorSectionProps) => {
  return (
    <div className="space-y-6 pt-5 border-t border-gray-200 dark:border-gray-700">
      <FormSection title={guarantorLabel} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`guarantors.${index}.fullName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Enter guarantor's full name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={`guarantors.${index}.idNumber`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Number <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Enter national ID number" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={`guarantors.${index}.phoneNumber`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Enter phone number" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={`guarantors.${index}.email`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email address" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={`guarantors.${index}.address`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Physical Address <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Enter residential address" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={`guarantors.${index}.relationship`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relationship to Client <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g., Family member, Friend, Colleague" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={`guarantors.${index}.occupation`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Occupation <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Enter occupation" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={`guarantors.${index}.employer`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employer <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Enter employer name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={`guarantors.${index}.monthlyIncome`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Income <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter monthly income" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={`guarantors.${index}.yearsKnown`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Years Known Client <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter number of years" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      
      {/* Required Documents */}
      <div className="mt-6">
        <h4 className="text-md font-medium mb-4">Required Documentation</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name={`guarantors.${index}.documents.idDocument`}
            render={({ field: { onChange, value, ...rest } }) => (
              <FormFileUpload
                label="National ID / Passport"
                description="Upload a clear image of ID (PNG, JPG, PDF)"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={(files) => onChange(files)}
                {...rest}
              />
            )}
          />
          
          <FormField
            control={control}
            name={`guarantors.${index}.documents.proofOfIncome`}
            render={({ field: { onChange, value, ...rest } }) => (
              <FormFileUpload
                label="Proof of Income"
                description="Bank statement / payslip (PDF)"
                accept=".pdf"
                onChange={(files) => onChange(files)}
                {...rest}
              />
            )}
          />
          
          <FormField
            control={control}
            name={`guarantors.${index}.documents.proofOfAddress`}
            render={({ field: { onChange, value, ...rest } }) => (
              <FormFileUpload
                label="Proof of Address"
                description="Utility bill / rent agreement (PDF)"
                accept=".pdf"
                onChange={(files) => onChange(files)}
                {...rest}
              />
            )}
          />
        </div>
      </div>
      
      {/* Commitment Statement */}
      <div className="mt-6">
        <FormField
          control={control}
          name={`guarantors.${index}.commitmentStatement`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Commitment Statement <span className="text-destructive">*</span></FormLabel>
              <FormDescription>
                Please write a statement of commitment as the guarantor for this loan application.
              </FormDescription>
              <FormControl>
                <Textarea 
                  placeholder="I hereby declare that I understand my responsibilities as a guarantor..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
      
      {/* Terms Agreement */}
      <FormField
        control={control}
        name={`guarantors.${index}.agreeToTerms`}
        render={({ field }) => (
          <FormCommitment
            label="I confirm that I understand my responsibilities as a guarantor for this loan. In the event that the borrower defaults on their loan repayments, I agree to assume responsibility for the outstanding debt. I have provided accurate information and understand that any false information may result in legal consequences."
            checkboxId={`guarantor-${index}-terms`}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  );
};

export default GuarantorSection;
