import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-3 rounded-2xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed antialiased',
  {
    variants: {
      variant: {
        primary: 'bg-pink-500 text-white hover:bg-pink-550 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-pink-500/25',
        secondary: 'bg-white text-pink-500 border-2 border-pink-200 hover:bg-pink-50 hover:border-pink-300',
        ghost: 'text-pink-500 hover:bg-pink-50 hover:text-pink-600',
        danger: 'bg-red-400 text-white hover:bg-red-500 hover:scale-[1.02] active:scale-[0.98]',
        outline: 'border-2 border-neutral-200 hover:border-pink-300 hover:text-pink-500 hover:bg-pink-25',
        minimal: 'text-neutral-600 hover:text-pink-500 hover:bg-neutral-50',
      },
      size: {
        sm: 'px-6 py-3 text-sm',
        md: 'px-8 py-4 text-base',
        lg: 'px-10 py-5 text-lg',
        xl: 'px-12 py-6 text-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
