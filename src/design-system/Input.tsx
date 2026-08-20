import { clsx } from 'clsx';
import type { InputHTMLAttributes, Ref } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>;
}

// Equivalente a `.input` (index.css), com duas mudanças deliberadas:
// - gatilho de foco migrado de `:focus` para `:focus-visible` (ring-brand-100
//   + border-brand-500, halo mais leve que o do Button — ver DESIGN_SYSTEM.md);
// - estado `disabled` formalizado (`.input` não tinha nenhum tratamento).
// Sem prop `icon`: ver decisão registrada em DESIGN_SYSTEM.md §7.1/§12.
const baseClasses =
  'min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-50';

export function Input({ className, ref, ...props }: InputProps) {
  return <input {...props} ref={ref} className={clsx(baseClasses, className)} />;
}
