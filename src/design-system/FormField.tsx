import { cloneElement, useId } from 'react';
import type { AriaAttributes, ReactElement, ReactNode } from 'react';
import { FieldError } from './FieldError';
import { Label } from './Label';

// Forma mínima de props que o filho precisa aceitar para ser clonado com
// segurança: id (associação com Label) + aria-invalid/aria-describedby
// (associação com FieldError). Input/Select/Textarea satisfazem isso
// estruturalmente (herdam de *HTMLAttributes, que inclui AriaAttributes).
type FormFieldChildProps = Pick<AriaAttributes, 'aria-invalid' | 'aria-describedby'> & {
  id?: string;
};

export interface FormFieldProps {
  label: ReactNode;
  error?: ReactNode;
  children: ReactElement<FormFieldChildProps>;
  id?: string;
  className?: string;
}

// Formaliza o padrão hoje repetido manualmente (helper `Field` em
// ClientsPage.tsx:49 + inline em ProductsPage.tsx/QuoteFormPage.tsx): Label +
// campo + FieldError. Diferente do padrão legado (label envolve o campo por
// aninhamento, sem `htmlFor`, exceto em LoginPage), aqui a associação é
// sempre por `htmlFor`/`id` explícitos.
//
// Estratégia de id: 1) `id` da prop, se fornecido; 2) `id` já presente no
// child, se houver; 3) `useId()` do React — API nativa recomendada para
// gerar ids estáveis e seguros para SSR, exatamente para este caso de uso.
//
// `children` precisa ser um único elemento cujas props aceitem `id`/
// `aria-invalid`/`aria-describedby` — cobre `Input`, `Select` e `Textarea`.
// `Checkbox` não é suportado nesta primeira versão: seu padrão real de
// layout (checkbox + rótulo ao lado, não rótulo acima) é diferente do
// vertical que este componente assume — tratar quando houver um segundo
// caso de uso real que o justifique.
export function FormField({ label, error, children, id, className }: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? children.props.id ?? generatedId;
  const hasError = Boolean(error);
  const errorId = `${fieldId}-error`;

  // Nunca sobrescreve um `aria-describedby` já presente no child: quando há
  // erro, compõe (descrição existente + id do erro); quando não há erro, a
  // chave nem é incluída no clone, então o valor original do child permanece
  // intocado.
  const describedBy = [children.props['aria-describedby'], errorId].filter(Boolean).join(' ');

  const field = cloneElement(
    children,
    hasError ? { id: fieldId, 'aria-invalid': true, 'aria-describedby': describedBy } : { id: fieldId },
  );

  return (
    <div className={className}>
      <Label htmlFor={fieldId}>{label}</Label>
      {field}
      {hasError && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}
