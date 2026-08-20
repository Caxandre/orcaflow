import { clsx } from 'clsx';
import type { LabelHTMLAttributes, Ref } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  ref?: Ref<HTMLLabelElement>;
}

// Equivalente a `.label` (index.css). Sempre renderiza um `<label>` nativo.
// Hoje a classe `.label` é aplicada de duas formas na aplicação: em
// `LoginPage.tsx` num `<label htmlFor="...">` de verdade (associação
// correta); em `ClientsPage`/`ProductsPage`/`QuoteFormPage`, num `<span>`
// dentro de um `<label>` sem `htmlFor` (associação só por aninhamento). Este
// componente segue o padrão de `LoginPage` — a associação `htmlFor`/`id`
// continua responsabilidade explícita do consumidor até `FormField` existir.
const baseClasses = 'mb-1.5 block text-sm font-semibold text-slate-700';

export function Label({ className, ref, ...props }: LabelProps) {
  return <label {...props} ref={ref} className={clsx(baseClasses, className)} />;
}
