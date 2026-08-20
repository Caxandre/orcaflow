import { LoaderCircle } from 'lucide-react';

export interface LoadingProps {
  label?: string;
}

// Equivalente ao Loading existente em src/components/Loading.tsx. Sem
// size/tone/fullscreen/overlay/delay: nenhum dos 7 consumidores reais
// (ProtectedRoute, ClientsPage, DashboardPage, ProductsPage, QuoteFormPage,
// QuotesPage, QuoteDetailsPage) usa algo além de `label` (passado em 3 dos
// 7; os demais usam o default). Sem `className`/`ref`: nenhum consumidor
// real precisa de nenhum dos dois.
//
// `role="status"` + `aria-live="polite"` — DECIDIDO, novo em relação ao
// componente legado (que não tinha nenhum anúncio para leitor de tela):
// melhoria pequena, segura e universalmente aplicável, sem texto visível
// novo.
export function Loading({ label = 'Carregando...' }: LoadingProps) {
  return (
    <div role="status" aria-live="polite" className="grid min-h-56 place-items-center">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <LoaderCircle className="animate-spin text-brand-600" size={20} />
        {label}
      </div>
    </div>
  );
}
