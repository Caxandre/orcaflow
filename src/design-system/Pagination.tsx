import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Pagination as PaginationType } from '../types';
import { Button } from './Button';

export interface PaginationProps {
  value: PaginationType;
  onChange: (page: number) => void;
}

// Equivalente ao Pagination existente em src/components/Pagination.tsx. API
// preservada exatamente (`value`/`onChange`) — os 3 consumidores reais
// (ClientsPage, ProductsPage, QuotesPage) já usam essa forma de maneira
// idêntica e coerente; não renomeada para page/pageCount/total/pageSize/
// onNext/onPrevious. Texto "registros" mantido fixo — nenhum dos 3
// consumidores precisa de um rótulo diferente (reverte uma nota especulativa
// anterior do catálogo que sugeria extrair `itemLabel?` sem evidência real).
//
// Botões internos: usam o primitive `Button` (variant="secondary" size="sm")
// em vez de `<button>` cru — confirmado que `Button` com essas props gera
// exatamente as mesmas classes que `btn-secondary min-h-9 px-3` (o par
// sm/secondary de Button.tsx foi originalmente derivado desta própria tela,
// ver Button.tsx). Não é uma dependência forçada: é a mesma aparência já
// comprovada, não uma composição nova. `IconButton` não se encaixa aqui —
// `rounded-lg`/`p-2`/hover colorido são visualmente diferentes de
// `btn-secondary` e mudariam a aparência.
export function Pagination({ value, onChange }: PaginationProps) {
  if (value.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-4 text-sm text-slate-500">
      <span>{value.total} registros</span>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={value.page <= 1}
          onClick={() => onChange(value.page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </Button>
        <span className="px-2">{value.page} de {value.totalPages}</span>
        <Button
          variant="secondary"
          size="sm"
          disabled={value.page >= value.totalPages}
          onClick={() => onChange(value.page + 1)}
          aria-label="Próxima página"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
