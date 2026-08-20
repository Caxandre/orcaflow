import { clsx } from 'clsx';
import type { InputHTMLAttributes, Ref } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  ref?: Ref<HTMLInputElement>;
}

// Reproduz o checkbox real da aplicação (ProductsPage.tsx:35 — "Disponível
// para novos orçamentos"): `size-4 accent-blue-600`, sem border/radius
// próprios — é renderização 100% nativa do navegador, só tingida via
// `accent-color`. Não há hoje nenhum outro checkbox na base para comparar.
//
// Foco: o checkbox nunca teve `.input` nem regra própria — herda só a regra
// global `input:focus-visible` (ring-brand-500 + ring-offset-2, index.css:9),
// reproduzida aqui de forma explícita. Diferente de Input/Select/Textarea,
// não havia um segundo modelo (`:focus`) concorrente para reconciliar aqui.
//
// `disabled` formalizado com o mesmo padrão de Input/Select/Textarea (novo —
// não existia tratamento).
const baseClasses =
  'size-4 accent-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export function Checkbox({ className, ref, ...props }: CheckboxProps) {
  return <input {...props} type="checkbox" ref={ref} className={clsx(baseClasses, className)} />;
}
