import { clsx } from 'clsx';
import { Search } from 'lucide-react';
import type { Ref } from 'react';
import { Input } from './Input';
import type { InputProps } from './Input';

export interface SearchInputProps extends Omit<InputProps, 'type'> {
  ref?: Ref<HTMLInputElement>;
}

// Composição sobre Input (não duplica a string de classes base de `.input`).
// Ícone Search fixo internamente — não é um Input genérico com slot
// arbitrário (coerente com a decisão de não ter prop `icon` em Input.tsx).
//
// `type="search"` fixado internamente, não é prop pública: nenhum campo de
// busca/filtro real da aplicação define `type` hoje (todos usam o padrão
// implícito `text`) — `search` é semanticamente mais correto para o que
// esses campos fazem; pequena melhoria deliberada, não uma extração literal.
//
// Posição/tamanho do ícone e padding do campo — NORMALIZADOS, DECIDIDO: o
// padrão dominante e 100% consistente entre os campos de busca/filtro reais
// (ClientsPage, ProductsPage, QuotesPage, QuoteFormPage — 5 ocorrências) é
// `left-3.5 top-3`, ícone `size=18`, input `pl-10`. O par `top-3.5`/`pl-11`
// do LoginPage (e-mail/senha) não pertence a este padrão — é um Input
// decorado com ícone para um caso de composição diferente, fora do escopo
// de SearchInput.
export function SearchInput({ className, ref, ...props }: SearchInputProps) {
  return (
    <div className={clsx('relative', className)}>
      <Search
        aria-hidden="true"
        size={18}
        className="pointer-events-none absolute left-3.5 top-3 text-slate-400"
      />
      <Input {...props} ref={ref} type="search" className="pl-10" />
    </div>
  );
}
