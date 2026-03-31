'use client';

import { forwardRef, useId, type SelectHTMLAttributes, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  leftIcon?: ReactNode;
  showErrorIcon?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder,
      leftIcon,
      showErrorIcon = true,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const hasError = !!error;

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={`${styles.selectWrapper} ${hasError ? styles.hasError : ''}`}>
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
          <select
            ref={ref}
            id={selectId}
            className={`${styles.select} ${leftIcon ? styles.hasLeftIcon : ''} ${className}`}
            aria-invalid={hasError}
            aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <span className={styles.chevron}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        {error && (
          <span id={`${selectId}-error`} className={styles.error} role="alert">
            {showErrorIcon && <AlertCircle size={16} className={styles.errorIcon} />}
            {error}
          </span>
        )}
        {hint && !error && (
          <span id={`${selectId}-hint`} className={styles.hint}>
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
