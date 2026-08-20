export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md';

// Fonte única de verdade para Button e ButtonLink — nenhum dos dois duplica
// estas strings; ambos consomem exatamente estas constantes. Equivalente a
// `.btn`/`.btn-primary`/`.btn-secondary`/`.btn-danger` (index.css).
export const buttonBaseClasses =
  'inline-flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

export const buttonSizeClasses: Record<ButtonSize, string> = {
  md: 'min-h-10 px-4',
  sm: 'min-h-9 px-3',
};

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-50 text-red-700 hover:bg-red-100',
  success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700',
};
