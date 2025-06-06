
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface SecureInputProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'password';
  value: string;
  onChange: (value: string) => void;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    customValidator?: (value: string) => string | null;
  };
  placeholder?: string;
  disabled?: boolean;
}

const SecureInput: React.FC<SecureInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  validation,
  placeholder,
  disabled = false,
}) => {
  const [error, setError] = React.useState<string | null>(null);

  const sanitizeInput = (input: string): string => {
    // Remove potential XSS characters
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/[<>]/g, '')
      .trim();
  };

  const validateInput = (input: string): string | null => {
    if (!validation) return null;

    if (validation.required && !input) {
      return `${label} is required`;
    }

    if (validation.minLength && input.length < validation.minLength) {
      return `${label} must be at least ${validation.minLength} characters`;
    }

    if (validation.maxLength && input.length > validation.maxLength) {
      return `${label} must not exceed ${validation.maxLength} characters`;
    }

    if (validation.pattern && !validation.pattern.test(input)) {
      if (type === 'email') {
        return 'Please enter a valid email address';
      }
      if (type === 'tel') {
        return 'Please enter a valid phone number';
      }
      return `${label} format is invalid`;
    }

    if (validation.customValidator) {
      return validation.customValidator(input);
    }

    return null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    const validationError = validateInput(sanitizedValue);
    
    setError(validationError);
    onChange(sanitizedValue);
  };

  const getInputType = () => {
    if (type === 'number') return 'text'; // Use text to control input better
    return type;
  };

  const formatValue = (val: string) => {
    if (type === 'number') {
      // Allow only numbers and decimal points
      return val.replace(/[^0-9.]/g, '');
    }
    if (type === 'tel') {
      // Format phone numbers
      return val.replace(/[^0-9+\-\s()]/g, '');
    }
    return val;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {validation?.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type={getInputType()}
        value={formatValue(value)}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`${error ? 'border-red-500 focus:border-red-500' : ''}`}
        autoComplete="off"
        spellCheck="false"
      />
      {error && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
};

export default SecureInput;
