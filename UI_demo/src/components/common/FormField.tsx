import React from 'react';
import { HelpCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  description?: string;
  tooltip?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  description,
  tooltip,
  error,
  required,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 tracking-normal flex items-center gap-1.5">
          {label}
          {required && <span className="text-rose-500 font-bold">*</span>}
          {tooltip && (
            <span className="group relative cursor-pointer text-slate-400 hover:text-slate-600 inline-flex items-center">
              <HelpCircle size={13} />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 text-white text-[11px] font-normal py-1 px-2 rounded-md shadow-lg whitespace-nowrap z-30 max-w-xs text-center">
                {tooltip}
              </span>
            </span>
          )}
        </label>
      </div>

      {children}

      {description && <p className="text-[11px] text-slate-400 leading-normal">{description}</p>}
      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  );
};
