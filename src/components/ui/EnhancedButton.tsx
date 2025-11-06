import React, { ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface EnhancedButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  download?: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  children?: React.ReactNode;
}

const EnhancedButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  EnhancedButtonProps
>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, icon, iconPosition = 'left', fullWidth = false, children, href, target, rel, download, type, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-pink-500 text-white hover:bg-pink-600 focus:ring-pink-500 focus:ring-offset-pink-500',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 focus:ring-offset-gray-500',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-pink-500 focus:ring-offset-pink-500',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-pink-500 focus:ring-offset-pink-500',
      destructive: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 focus:ring-offset-red-500',
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
    };
    
    const iconPositionClasses = {
      left: 'flex-row',
      right: 'flex-row-reverse',
    };

    const widthClasses = fullWidth ? 'w-full' : '';

    const classes = cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      iconPositionClasses[iconPosition],
      widthClasses,
      className
    );

    const renderContent = () => {
      if (loading) {
        return (
          <>
            <Loader2 className="animate-spin -ml-1 h-4 w-4" />
            <span>{children}</span>
          </>
        );
      }
      
      return (
        <>
          {icon && iconPosition === 'left' && (
            <span className="mr-2">{icon}</span>
          )}
          <span>{children}</span>
          {icon && iconPosition === 'right' && (
            <span className="ml-2">{icon}</span>
          )}
        </>
      );
    };

    if (href) {
      return (
        <a
          href={href}
          target={target}
          rel={rel}
          download={download}
          className={cn(classes, 'block')}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {renderContent()}
        </a>
      );
    }

    return (
      <button
        type={type || 'button'}
        className={classes}
        disabled={disabled || loading}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {renderContent()}
      </button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

export { EnhancedButton };