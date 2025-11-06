import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            {label}
            {props.required && <span className="text-pink-500 ml-1">*</span>}
          </label>
        )}
        <input
          className={cn(
            'w-full px-5 py-4 rounded-2xl border-2 border-neutral-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all duration-300 outline-none disabled:bg-neutral-50 disabled:cursor-not-allowed placeholder:text-neutral-400',
            error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
