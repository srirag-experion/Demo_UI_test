import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { FormField } from './FormField';

interface SecretFieldProps {
  label: string;
  description?: string;
  tooltip?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const SecretField: React.FC<SecretFieldProps> = ({
  label,
  description,
  tooltip,
  value,
  onChange,
  placeholder = '••••••••••••••••••••••••',
  required,
  disabled,
}) => {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <FormField label={label} description={description} tooltip={tooltip} required={required}>
      <div className="relative flex items-center">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-lg pl-3.5 pr-20 py-2.5 focus:outline-none focus:ring-2 focus:ring-lime-400/40 focus:border-lime-500 transition-colors shadow-2xs disabled:bg-slate-50 placeholder:font-sans placeholder:text-slate-400"
        />
        <div className="absolute right-1.5 flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
            title={show ? 'Hide value' : 'Reveal value'}
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!value}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors disabled:opacity-40"
            title="Copy value"
          >
            {copied ? <Check size={14} className="text-[#84cc16]" /> : <Copy size={14} />}
          </button>
        </div>
      </div>
    </FormField>
  );
};
