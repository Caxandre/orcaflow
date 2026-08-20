import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';

export type IconButtonTone = 'neutral' | 'brand' | 'success' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: ReactNode;
  tone?: IconButtonTone;
  size?: IconButtonSize;
  'aria-label': string;
  ref?: Ref<HTMLButtonElement>;
}

// `rounded-lg p-2` é o único padrão observado em todo botão de ícone real da
// aplicação (ações de tabela em Clients/Products/Quotes, fechar modal, sair
// da sidebar) — 14+ ocorrências, 100% consistentes. Idle em `text-slate-500`
// (mais frequente nas ações de tabela; fechar modal usa `slate-400` — 1
// tom de diferença, absorvido aqui por simplicidade, sem virar variante).
// Foco: mesmo padrão forte já usado por Button/Checkbox (ring-brand-500 +
// offset), não o halo mais leve de Input/Select/Textarea.
const baseClasses =
  'inline-flex items-center justify-center rounded-lg text-slate-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

// `md` = p-2, o único valor com evidência direta (ver acima). `sm`/`lg`
// seguem o mesmo tipo de degrau já usado em Button.tsx (sm/md diferem em
// 4px de altura) aplicado a padding — sem um segundo valor real observado
// para botões de ícone; não inventados do zero, mas com evidência mais
// fraca que `md`.
const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
};

// tone→hover fiel aos pares reais observados:
// - `brand`: reproduz literalmente `hover:bg-blue-50 hover:text-brand-600`
//   (ver/editar/duplicar/baixar PDF em Clients/Products/Quotes) — a mistura
//   blue/brand já documentada em tokens.md §3.3, preservada aqui de propósito
//   (não redesenhar).
// - `success`: WhatsApp (QuotesPage).
// - `danger`: excluir (3 tabelas).
// - `neutral`: fechar modal (ConfirmModal/ClientsPage/ProductsPage).
// Sem tom `info`: não há, hoje, um hover de botão de ícone distinto de
// `brand` para esse papel — oferecer os dois produziria classes idênticas.
// Subconjunto deliberado (4 tons, não os 5 oficiais).
const toneClasses: Record<IconButtonTone, string> = {
  neutral: 'hover:bg-slate-100 hover:text-slate-600',
  brand: 'hover:bg-blue-50 hover:text-brand-600',
  success: 'hover:bg-emerald-50 hover:text-emerald-600',
  danger: 'hover:bg-red-50 hover:text-red-600',
};

export function IconButton({
  icon,
  tone = 'neutral',
  size = 'md',
  type = 'button',
  className,
  ref,
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      type={type}
      ref={ref}
      className={clsx(baseClasses, sizeClasses[size], toneClasses[tone], className)}
    >
      {icon}
    </button>
  );
}
