import { clsx } from 'clsx';
import type { Ref, TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: Ref<HTMLTextAreaElement>;
}

// Mesmo vocabulário visual de `.input` (index.css) — ver Input.tsx. Sem altura
// própria além de `min-h-11`: hoje `ClientsPage`/`ProductsPage`/`QuoteFormPage`
// aplicam `min-h-28`/`min-h-32` e `py-3` por instância via className junto com
// `.input` — o mesmo continua funcionando aqui via `className`, sem virar
// prop/variante (ex.: nenhum `minHeight`).
const baseClasses =
  'min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-50';

export function Textarea({ className, ref, ...props }: TextareaProps) {
  return <textarea {...props} ref={ref} className={clsx(baseClasses, className)} />;
}
