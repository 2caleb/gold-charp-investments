
import React from 'react';
import { Input } from '@/components/ui/input';

type PropertyInputFieldProps = {
  placeholder: string;
  className?: string;
  startIcon?: React.ReactNode;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  type?: string;
  required?: boolean;
};

const PropertyInputField = ({
  placeholder,
  className,
  startIcon,
  value,
  onChange,
  name,
  type = 'text',
  required = false
}: PropertyInputFieldProps) => {
  return (
    <div className={`relative ${className}`}>
      {startIcon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
          {startIcon}
        </div>
      )}
      <Input
        type={type}
        placeholder={placeholder}
        className={`${startIcon ? 'pl-10' : ''}`}
        value={value}
        onChange={onChange}
        name={name}
        required={required}
      />
    </div>
  );
};

export default PropertyInputField;
