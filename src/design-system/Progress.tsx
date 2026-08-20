import { clsx } from 'clsx';

export type ProgressTone = 'brand' | 'info' | 'success' | 'danger';

export interface ProgressProps {
  value: number;
  tone?: ProgressTone;
  className?: string;
}

// Sem tom `neutral`: a trilha já é neutra (slate-100) em todo tom; um
// preenchimento "neutro" ficaria invisível sobre ela. Os outros 4 tons
// seguem o mapeamento já oficial (DESIGN_SYSTEM.md §6.1), na variante -500
// (só `success`/emerald-500 tem uso real hoje — DashboardPage.tsx:32).
const toneClasses: Record<ProgressTone, string> = {
  brand: 'bg-brand-500',
  info: 'bg-blue-500',
  success: 'bg-emerald-500',
  danger: 'bg-red-500',
};

// Reproduz a barra de conversão do dashboard (DashboardPage.tsx:32): trilha
// `h-2 rounded-full bg-slate-100`, preenchimento `h-full rounded-full` +
// largura em `%`. Sem `<progress>` nativo: estilizar sua aparência real
// (trilha/preenchimento arredondados, cor por tom) exigiria `appearance-none`
// e reset de pseudo-elementos específicos de navegador — optou-se por
// div + ARIA (`role="progressbar"`), preservando a aparência exata existente
// sem hacks. Sem texto percentual embutido — quem usa decide se mostra.
export function Progress({ value, tone = 'success', className }: ProgressProps) {
  const normalized = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalized}
      className={clsx('h-2 overflow-hidden rounded-full bg-slate-100', className)}
    >
      <div className={clsx('h-full rounded-full', toneClasses[tone])} style={{ width: `${normalized}%` }} />
    </div>
  );
}
