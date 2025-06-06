
import React from 'react';
import { Button } from "@/components/ui/button";
import { RotateCw, Printer } from 'lucide-react';

interface DataCollectionDialogHeaderProps {
  generatedLoanId: string;
  onRegenerateLoanId: () => void;
  applicationId: string | null;
  formReady: boolean;
}

export const DataCollectionDialogHeader: React.FC<DataCollectionDialogHeaderProps> = ({
  generatedLoanId,
  onRegenerateLoanId,
  applicationId,
  formReady
}) => {
  return (
    <>
      <div className="flex items-center gap-2">
        <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
        <span className="text-2xl font-serif">Client Onboarding</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-gray-500">Reference ID:</span>
          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-blue-700">
            {generatedLoanId}
          </code>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRegenerateLoanId} 
          className="ml-2 transition-all duration-200 hover:bg-blue-50"
          title="Generate new reference ID"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        
        {applicationId && formReady && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="ml-2 border-blue-300 transition-all duration-200 hover:bg-blue-50"
            title="Print client data"
          >
            <Printer className="h-4 w-4" />
          </Button>
        )}
        {(!applicationId || !formReady) && (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="ml-2 opacity-30"
            title="Complete form to enable printing"
          >
            <Printer className="h-4 w-4" />
          </Button>
        )}
      </div>
    </>
  );
};
