import { clsx } from 'clsx';
import type { HTMLAttributes, Ref, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

// Primitives estruturais de tabela — baseados nos elementos HTML nativos,
// derivados da auditoria das 5 tabelas reais da aplicação (ClientsPage,
// ProductsPage, QuotesPage, DashboardPage, QuoteDetailsPage). Sem API
// orientada a dados (columns/rows/renderRow/accessor/sorting/filters) — essa
// é uma decisão explícita, não uma etapa intermediária: ver DESIGN_SYSTEM.md.
//
// O que é 100% recorrente nas 5 tabelas (zero exceção) virou classe base:
// `overflow-x-auto` no wrapper, `text-left text-sm` na `<table>`,
// `text-xs uppercase tracking-wider text-slate-400` + `bg-slate-50` no
// `<thead>`, `divide-y divide-slate-100` no `<tbody>`.
//
// O que varia entre tabelas fica de fora da base, sempre via `className`:
// - largura mínima da tabela (`min-w-full` em 3/5; `min-w-[1050px]` em
//   QuotesPage; `min-w-[700px]` em QuoteDetailsPage) — PENDENTE
//   (tokens.md §5 item 2), não resolvida aqui.
// - opacidade do fundo do `<thead>` (`bg-slate-50` em 4/5; `bg-slate-50/70`
//   só em DashboardPage) — default é o padrão majoritário.
// - opacidade do hover de linha (`hover:bg-slate-50/60` em 3/5;
//   `hover:bg-slate-50/70` em DashboardPage; **nenhum hover** em
//   QuoteDetailsPage) — por isso `TableRow` não tem hover na base (ver
//   `TableRow` abaixo).
// - padding de célula (`px-5` em 3/5: Clients/Products/Quotes; `px-6` em
//   2/5: Dashboard/QuoteDetails) — default é o padrão majoritário
//   (`px-5 py-3` em `TableHead`, `px-5 py-4` em `TableCell`).
// - alinhamento de coluna numérica — PENDENTE (tokens.md §5 item 8), nunca
//   inferido; `TableCell`/`TableHead` não assumem `text-align` algum.

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  ref?: Ref<HTMLTableElement>;
}

// Renderiza o wrapper `overflow-x-auto` internamente: as 5 tabelas reais
// sempre o usam, sem exceção, e nenhuma delas compõe outra coisa dentro dele
// além da própria `<table>` — não há justificativa real para separar um
// `TableContainer` à parte. `className` (ex.: `min-w-full`,
// `min-w-[1050px]`) é aplicado à `<table>`, no mesmo elemento em que os 5
// usos reais já o aplicam.
export function Table({ className, ref, children, ...props }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table {...props} ref={ref} className={clsx('text-left text-sm', className)}>
        {children}
      </table>
    </div>
  );
}

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  ref?: Ref<HTMLTableSectionElement>;
}

export function TableHeader({ className, ref, ...props }: TableHeaderProps) {
  return (
    <thead
      {...props}
      ref={ref}
      className={clsx('bg-slate-50 text-xs uppercase tracking-wider text-slate-400', className)}
    />
  );
}

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  ref?: Ref<HTMLTableSectionElement>;
}

// Sem suposição de loading/empty: essas telas continuam fora da tabela (ver
// `Loading`/`EmptyState`), o consumidor decide o que renderizar como filho.
export function TableBody({ className, ref, ...props }: TableBodyProps) {
  return <tbody {...props} ref={ref} className={clsx('divide-y divide-slate-100', className)} />;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  ref?: Ref<HTMLTableRowElement>;
}

// Sem classes base — nem hover, nem nenhuma outra. Nas 5 tabelas reais, o
// hover nunca aparece na linha de cabeçalho, só (às vezes) na de corpo, e
// varia mesmo entre corpos (`/60`, `/70`, ou nenhum em QuoteDetailsPage).
// Em vez de inferir contexto (header vs. body) — o que exigiria Context ou
// heurística — `TableRow` fica neutro e o consumidor aplica hover via
// `className` só nas linhas de corpo que precisarem dele.
export function TableRow({ className, ref, ...props }: TableRowProps) {
  return <tr {...props} ref={ref} className={className} />;
}

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  ref?: Ref<HTMLTableCellElement>;
}

// `scope="col"` como default — DECIDIDO, nova melhoria de acessibilidade em
// relação às 5 tabelas reais (nenhuma usa `scope` hoje). Seguro porque, nas
// 5 tabelas auditadas, `TableHead`/`<th>` representa exclusivamente
// cabeçalho de coluna — nenhum uso real como cabeçalho de linha. O
// consumidor pode sobrescrever passando `scope` explicitamente se um caso
// futuro precisar de `scope="row"`. Sem `<caption>` automático.
export function TableHead({ scope = 'col', className, ref, ...props }: TableHeadProps) {
  return <th {...props} ref={ref} scope={scope} className={clsx('px-5 py-3', className)} />;
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  ref?: Ref<HTMLTableCellElement>;
}

// Sem inferência de valor monetário/numérico/alinhamento/truncamento/status/
// ação — tudo isso permanece decisão do consumidor via `className`/filhos.
export function TableCell({ className, ref, ...props }: TableCellProps) {
  return <td {...props} ref={ref} className={clsx('px-5 py-4', className)} />;
}
