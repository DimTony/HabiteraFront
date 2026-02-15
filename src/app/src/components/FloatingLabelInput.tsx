import React, { useState, forwardRef } from 'react';
import { Input } from './ui/input';
import { cn } from './ui/utils';

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ label, className, style, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value !== undefined && props.value !== '';

    // For datetime-local, date, and time inputs, always float the label to avoid collision with browser placeholder
    const isDateTimeInput = props.type === 'datetime-local' || props.type === 'date' || props.type === 'time';
    const shouldFloat = isFocused || hasValue || isDateTimeInput;

    return (
      <div className="relative">
        <Input
          ref={ref}
          {...props}
          className={cn('h-16 px-4 pt-6 pb-1', className)}
          style={style}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
        <label
          className={cn(
            'absolute left-4 transition-all duration-200 pointer-events-none text-gray-500 z-10',
            shouldFloat
              ? 'top-3 text-xs font-medium'
              : 'top-1/2 -translate-y-1/2 text-base'
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);

FloatingLabelInput.displayName = 'FloatingLabelInput';