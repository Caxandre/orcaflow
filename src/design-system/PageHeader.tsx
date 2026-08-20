import type { ReactNode } from 'react';

export interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

// Promovido de src/components/PageHeader.tsx, praticamente como estava — os
// 6 consumidores reais (ClientsPage, DashboardPage, ProductsPage,
// QuoteDetailsPage, QuoteFormPage, QuotesPage) já usam exatamente esta API
// (`eyebrow?`, `title`, `description?`, `action?`), sem exceção. `action`
// continua composição externa — PageHeader não importa `Button` nem decide
// o que é renderizado ali, só posiciona o `ReactNode` recebido.
//
// `tracking-[.16em]` do eyebrow preservado literalmente: é um dos 4 valores
// de tracking concorrentes na aplicação (ver tokens.md §5, item 4) — decidir
// qual vira o oficial não é objetivo desta tarefa, só a promoção do
// componente como já existia.
//
// Sem `ref`: PageHeader é composição estrutural (um `<div>` de layout, não
// um controle), sem nenhum uso real que precise encaminhar uma ref para ele.
export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[.16em] text-brand-600">{eyebrow}</p>}
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-navy sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
