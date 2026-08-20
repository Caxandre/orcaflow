import { clsx } from 'clsx';
import type { HTMLAttributes, ReactNode, Ref } from 'react';

export type BadgeTone = 'neutral' | 'brand' | 'info' | 'success' | 'danger';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  icon?: ReactNode;
  ref?: Ref<HTMLSpanElement>;
}

// Geometria idêntica à já auditada em StatusBadge/badge Ativo-Inativo/badge
// "Este mês": rounded-full + px-2.5/py-1 + text-xs/font-semibold.
const baseClasses = 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold';

// Mesmo mapeamento de StatusBadge (draft/sent/approved/rejected =
// neutral/info/success/danger) — DESIGN_SYSTEM.md §6.1. `brand`
// (bg-brand-50/text-brand-600) não tem badge real equivalente hoje, mas seu
// pertencimento à API é decidido pelo vocabulário de tons já oficial, não
// inventado agora.
const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-600',
  brand: 'bg-brand-50 text-brand-600',
  info: 'bg-blue-50 text-blue-700',
  success: 'bg-emerald-50 text-emerald-700',
  danger: 'bg-red-50 text-red-700',
};

// `children` como conteúdo (não `label` obrigatório) — corresponde
// diretamente ao uso real (`<StatusBadge>{label}</StatusBadge>`-like, sempre
// texto simples). `icon?` opcional, marcado `aria-hidden`: o texto do badge
// já carrega o significado, o ícone é reforço visual.
export function Badge({ tone = 'neutral', icon, className, children, ref, ...props }: BadgeProps) {
  return (
    <span {...props} ref={ref} className={clsx(baseClasses, toneClasses[tone], className)}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
