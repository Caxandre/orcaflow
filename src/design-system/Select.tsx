import { clsx } from 'clsx';
import type { Ref, SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  ref?: Ref<HTMLSelectElement>;
}

// Mesmo vocabulário visual de `.input` (index.css) — ver Input.tsx para o
// racional do gatilho de foco e do estado disabled. `placeholder:` não se
// aplica a `<select>`, por isso não está aqui. Seta nativa do navegador
// mantida nesta etapa — aparência customizada continua PENDENTE
// (DESIGN_SYSTEM.md §15, item 12).
const baseClasses =
  'min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 focus-visible:outline-none focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-50';

export function Select({ className, ref, ...props }: SelectProps) {
  return <select {...props} ref={ref} className={clsx(baseClasses, className)} />;
}
