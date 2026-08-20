import { clsx } from 'clsx';
import type { HTMLAttributes, Ref } from 'react';

export interface FieldErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  ref?: Ref<HTMLParagraphElement>;
}

// Equivalente a `.field-error` (index.css). Renderiza `<p>`: o uso real hoje
// mistura `<p className="field-error">` (LoginPage.tsx, junto de `htmlFor`/
// `id` corretos) e `<span className="field-error">` (helper `Field` de
// ClientsPage.tsx e uso direto em ProductsPage/QuoteFormPage, dentro de um
// `<label>` sem `htmlFor`). `<p>` é o elemento semanticamente mais adequado
// para uma mensagem autônoma (não é texto inline dentro de uma frase) e é o
// padrão já usado no exemplo mais rigoroso da base (LoginPage).
//
// Sem `id` gerado automaticamente e sem `role="alert"`: não há evidência hoje
// de que toda mensagem precise ser anunciada imediatamente (nenhum uso atual
// tem `role="alert"`/`aria-live`), e a associação via `aria-describedby`
// depende de um `id` que só o consumidor (ou futuramente `FormField`) deve
// decidir.
const baseClasses = 'mt-1 text-xs text-red-600';

export function FieldError({ className, ref, ...props }: FieldErrorProps) {
  return <p {...props} ref={ref} className={clsx(baseClasses, className)} />;
}
