import { clsx } from 'clsx';
import type { HTMLAttributes, ReactNode, Ref } from 'react';

export type IconTileTone = 'neutral' | 'brand' | 'info' | 'success' | 'danger';
export type IconTileSize = 'sm' | 'md' | 'lg';

export interface IconTileProps extends HTMLAttributes<HTMLDivElement> {
  icon: ReactNode;
  tone?: IconTileTone;
  size?: IconTileSize;
  ref?: Ref<HTMLDivElement>;
}

const baseClasses = 'grid shrink-0 place-items-center rounded-xl';

// Tamanhos por contagem real de ocorrências de tile-com-ícone na aplicação:
// size-9 (QuoteDetailsPage, helper Info — 1), size-10 (Logo, avatar da
// sidebar, ícone de tipo em ProductsPage, calculadora em QuoteFormPage — 4,
// o mais frequente), size-11 (ConfirmModal, KPIs e card de receita do
// DashboardPage — 3). `size-12` (EmptyState, 1 ocorrência isolada, com
// `rounded-2xl` em vez de `rounded-xl`) fica fora da escala — não há
// evidência para uma 4ª faixa; sobrepor via `className` se necessário.
const sizeClasses: Record<IconTileSize, string> = {
  sm: 'size-9',
  md: 'size-10',
  lg: 'size-11',
};

// Mesmo mapeamento tone→cor já decidido em DESIGN_SYSTEM.md §6.1 (StatusBadge
// draft/sent/approved/rejected = neutral/info/success/danger). `brand`
// (bg-brand-50/text-brand-600) segue o mesmo padrão claro-fundo/tom-forte-
// texto dos demais tons, mas não tem um tile real equivalente hoje
// (`bg-brand-50` nunca é usado na aplicação) — construído por consistência
// com o sistema de tons já oficial, não copiado de um uso existente.
const toneClasses: Record<IconTileTone, string> = {
  neutral: 'bg-slate-100 text-slate-600',
  brand: 'bg-brand-50 text-brand-600',
  info: 'bg-blue-50 text-blue-600',
  success: 'bg-emerald-50 text-emerald-700',
  danger: 'bg-red-50 text-red-600',
};

// Decorativo/estrutural: nunca recebe aria-label próprio — se o ícone
// carregar semântica, isso é responsabilidade do consumidor no próprio
// elemento de ícone. Sem prop `shape`: nenhum tile de ícone real da
// aplicação é circular — o avatar da sidebar usa `rounded-xl` (quadrado
// arredondado), não `rounded-full`; os únicos `rounded-full` da base são
// badges/pills e formas decorativas, não tiles de ícone.
export function IconTile({ icon, tone = 'neutral', size = 'md', className, ref, ...props }: IconTileProps) {
  return (
    <div {...props} ref={ref} className={clsx(baseClasses, sizeClasses[size], toneClasses[tone], className)}>
      {icon}
    </div>
  );
}
