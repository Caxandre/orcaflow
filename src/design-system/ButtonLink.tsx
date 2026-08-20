import { clsx } from 'clsx';
import { Link } from 'react-router-dom';
import type { LinkProps } from 'react-router-dom';
import { buttonBaseClasses, buttonSizeClasses, buttonVariantClasses } from './buttonStyles';

export interface ButtonLinkProps extends LinkProps {
  variant?: 'primary' | 'secondary';
}

// Equivalente visual a `Button size="md"`, mas para navegação (`<a>` via
// `Link` do react-router-dom) — não `<button>`. `Button` continua sem `as`;
// este é um componente separado, reaproveitando as mesmas constantes de
// `buttonStyles.ts` (nenhuma string de classe duplicada).
//
// Sem `size`: os 7 consumidores reais auditados (2026-08-20) usam todos a
// mesma geometria (equivalente a `size="md"`) — sem evidência para variar.
// Só `primary`/`secondary`: nenhum `<Link>` real usa `danger`/`success`.
//
// `focus-visible` aplicado explicitamente via `buttonBaseClasses` (mesma
// classe que `Button` usa) em vez de depender só da regra global
// `a:focus-visible` do index.css — resultado computado idêntico (mesmas
// utilities, já presentes no CSS compilado), mas a aparência do componente
// não fica implícita numa regra global que outros `<a>` também usam.
export function ButtonLink({ variant = 'primary', className, ...props }: ButtonLinkProps) {
  return <Link {...props} className={clsx(buttonBaseClasses, buttonSizeClasses.md, buttonVariantClasses[variant], className)} />;
}
