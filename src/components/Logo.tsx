import { FileCheck2 } from 'lucide-react';

export function Logo({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3">
    <span className="grid size-10 place-items-center rounded-xl bg-coral text-white shadow-lg shadow-orange-200"><FileCheck2 size={21} /></span>
    {!compact && <span><strong className="block font-serif text-xl leading-none text-white">OrçaFlow</strong><small className="mt-1 block text-[10px] font-semibold uppercase tracking-[.18em] text-blue-200">propostas que avançam</small></span>}
  </div>;
}
