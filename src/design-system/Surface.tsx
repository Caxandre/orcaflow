import { clsx } from 'clsx';
import type { HTMLAttributes, Ref } from 'react';

// Equivalente à classe `.card` (index.css) — não existe classe `.surface` no
// CSS legado; "Surface" é só o nome deste componente do Design System (ver
// DESIGN_SYSTEM.md §7.1). `.card` não define padding: o consumidor continua
// responsável por ele via `className` (ex.: `<Surface className="p-5">`) —
// decisão fechada em 2026-08-20 (DESIGN_SYSTEM.md §14 item 46).
const baseClasses = 'rounded-2xl border border-slate-200/80 bg-white shadow-card';

// `as` restrito a 'div' | 'section' | 'article': os únicos elementos usados
// pelos 17 consumidores reais de `.card` auditados em 2026-08-20 (13 seções,
// 4 artigos, nenhuma div) — não é polimorfismo genérico (`React.ElementType`).
// Ver DESIGN_SYSTEM.md §7.1/§14 item 48.
interface SurfaceDivProps extends HTMLAttributes<HTMLDivElement> {
  as?: 'div';
  ref?: Ref<HTMLDivElement>;
}

interface SurfaceSectionProps extends HTMLAttributes<HTMLElement> {
  as: 'section';
  ref?: Ref<HTMLElement>;
}

interface SurfaceArticleProps extends HTMLAttributes<HTMLElement> {
  as: 'article';
  ref?: Ref<HTMLElement>;
}

export type SurfaceProps = SurfaceDivProps | SurfaceSectionProps | SurfaceArticleProps;

export function Surface(props: SurfaceProps) {
  if (props.as === 'section') {
    const { as, className, ref, ...rest } = props;
    void as;
    return <section {...rest} ref={ref} className={clsx(baseClasses, className)} />;
  }
  if (props.as === 'article') {
    const { as, className, ref, ...rest } = props;
    void as;
    return <article {...rest} ref={ref} className={clsx(baseClasses, className)} />;
  }
  const { as, className, ref, ...rest } = props;
  void as;
  return <div {...rest} ref={ref} className={clsx(baseClasses, className)} />;
}
