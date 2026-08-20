import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

// Equivalente ao EmptyState existente em src/components/EmptyState.tsx.
// Ícone `Inbox` continua fixo internamente — o componente legado nunca
// aceitou uma prop `icon`, e nenhum dos 4 consumidores reais (ClientsPage,
// DashboardPage, ProductsPage, QuotesPage) precisa de um ícone diferente;
// não foi adicionada uma prop especulativa sem evidência. `action` só é
// usada em 1 dos 4 consumidores (QuotesPage).
//
// Sem IconTile: a caixa do ícone usa `size-12 rounded-2xl`, fora da escala
// de IconTile (sm/md/lg = size-9/10/11, sempre rounded-xl) — usar IconTile
// aqui exigiria sobrescrever tamanho e raio, uma correspondência forçada,
// não uma composição real. Mantido como markup local.
//
// Sem `className`/`ref`: nenhum consumidor real precisa de nenhum dos dois.
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="grid min-h-64 place-items-center px-6 text-center">
      <div>
        <span className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
          <Inbox />
        </span>
        <h3 className="font-semibold text-slate-800">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
