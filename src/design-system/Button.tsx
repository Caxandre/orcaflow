import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, Ref } from 'react';
import { buttonBaseClasses, buttonSizeClasses, buttonVariantClasses } from './buttonStyles';
import type { ButtonSize, ButtonVariant } from './buttonStyles';

export type { ButtonSize, ButtonVariant };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={clsx(buttonBaseClasses, buttonSizeClasses[size], buttonVariantClasses[variant], className)}
    />
  );
}
