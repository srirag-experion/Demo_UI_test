import React from 'react';
import { ChevronDown } from 'lucide-react';
import { FormField } from './FormField';

interface Option {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

interface SelectFieldProps {
  label?: string;
  description?: string;
  tooltip?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  description,
  tooltip,
  value,
  onChange,
  options,
  required,
  disabled,
  className = '',
}) => {
  const content = (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full appearance-none bg-white border border-slate-200 text-slate-800 text-xs rounded-lg px-3.5 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 transition-colors shadow-2xs disabled:bg-slate-50 disabled:text-slate-400 font-medium ${className}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label} {opt.sublabel ? `(${opt.sublabel})` : ''} {opt.badge ? `— [${opt.badge}]` : ''}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
        <ChevronDown size={14} />
      </div>
    </div>
  );

  if (label) {
    return (
      <FormField label={label} description={description} tooltip={tooltip} required={required}>
        {content}
      </FormField>
    );
  }

  return content;
};
