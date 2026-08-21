import { ArrowRight, BadgeCheck, Banknote, FilePlus2, FileText, Send, TrendingUp, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../design-system/Button';
import { ButtonLink } from '../design-system/ButtonLink';
import { EmptyState } from '../design-system/EmptyState';
import { Loading } from '../design-system/Loading';
import { PageHeader } from '../design-system/PageHeader';
import { Progress } from '../design-system/Progress';
import { Surface } from '../design-system/Surface';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../design-system/Table';
import { api, showApiError } from '../services/api';
import type { ApiResponse, DashboardData } from '../types';
import { formatDate, formatMoney } from '../utils/format';

const cards = [
  { key: 'total_quotes', label: 'Total de orçamentos', Icon: FileText, style: 'bg-blue-50 text-blue-700' },
  { key: 'sent_quotes', label: 'Aguardando retorno', Icon: Send, style: 'bg-violet-50 text-violet-700' },
  { key: 'approved_quotes', label: 'Aprovados', Icon: BadgeCheck, style: 'bg-emerald-50 text-emerald-700' },
  { key: 'rejected_quotes', label: 'Recusados', Icon: XCircle, style: 'bg-red-50 text-red-700' },
] as const;

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const load = useCallback(() => {
    setStatus('loading');
    api.get<ApiResponse<DashboardData>>('/dashboard')
      .then((r) => { setData(r.data.data); setStatus('success'); })
      .catch((e) => { showApiError(e); setStatus('error'); });
  }, []);
  useEffect(() => { load(); }, [load]);
  if (status === 'loading') return <Loading />;
  if (status === 'error') return <div className="grid min-h-64 place-items-center px-6 text-center"><div><h3 className="font-semibold text-slate-800">Não foi possível carregar o dashboard.</h3><p className="mt-1 text-sm text-slate-500">Tente novamente em alguns instantes.</p><div className="mt-4"><Button variant="primary" onClick={load}>Tentar novamente</Button></div></div></div>;
  if (!data) return null;
  const conversion = data.total_quotes ? Math.round((data.approved_quotes / data.total_quotes) * 100) : 0;
  return <>
    <PageHeader eyebrow="Visão geral" title="Seu negócio, em movimento" description="Acompanhe os números que importam e mantenha cada proposta avançando." action={<ButtonLink to="/orcamentos/novo" variant="primary"><FilePlus2 size={18} />Novo orçamento</ButtonLink>} />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ key, label, Icon, style }) => <Surface as="article" className="p-5" key={key}><div className="flex items-start justify-between"><span className={`grid size-11 place-items-center rounded-xl ${style}`}><Icon size={21} /></span><span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Este mês</span></div><p className="mt-5 text-3xl font-bold tracking-tight text-navy">{data[key]}</p><p className="mt-1 text-sm text-slate-500">{label}</p></Surface>)}</section>
    <section className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
      <Surface as="article" className="overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6"><div><h2 className="font-semibold text-navy">Orçamentos recentes</h2><p className="mt-1 text-xs text-slate-400">Últimas oportunidades criadas</p></div><Link to="/orcamentos" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">Ver todos <ArrowRight size={15} /></Link></div>
        {data.recent_quotes.length ? (
          <Table className="min-w-full">
            <TableHeader className="bg-slate-50/70">
              <TableRow>
                <TableHead className="px-6">Orçamento</TableHead>
                <TableHead className="px-6">Cliente</TableHead>
                <TableHead className="px-6">Validade</TableHead>
                <TableHead className="px-6">Valor</TableHead>
                <TableHead className="px-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recent_quotes.map((quote) => (
                <TableRow className="hover:bg-slate-50/70" key={quote.id}>
                  <TableCell className="px-6"><Link className="font-semibold text-brand-700" to={`/orcamentos/${quote.id}`}>{quote.quote_number}</Link></TableCell>
                  <TableCell className="px-6 font-medium text-slate-700">{quote.client_name}</TableCell>
                  <TableCell className="px-6 text-slate-500">{formatDate(quote.valid_until)}</TableCell>
                  <TableCell className="px-6 font-semibold text-slate-800">{formatMoney(quote.total)}</TableCell>
                  <TableCell className="px-6"><StatusBadge status={quote.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : <EmptyState title="Nenhum orçamento ainda" description="Crie sua primeira proposta comercial." />}
      </Surface>
      <div className="space-y-5"><Surface as="article" className="overflow-hidden bg-navy p-6 text-white"><div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-xl bg-white/10 text-orange-300"><Banknote /></span><TrendingUp className="text-emerald-300" size={20} /></div><p className="mt-7 text-sm text-blue-200">Valor em oportunidades</p><p className="mt-1 text-3xl font-bold">{formatMoney(data.total_value)}</p><div className="mt-6 border-t border-white/10 pt-5"><p className="text-xs text-blue-200">Receita aprovada</p><p className="mt-1 text-lg font-semibold text-emerald-300">{formatMoney(data.approved_value)}</p></div></Surface>
        <Surface as="article" className="p-6"><div className="flex items-end justify-between"><div><p className="text-sm text-slate-500">Taxa de aprovação</p><p className="mt-1 text-3xl font-bold text-navy">{conversion}%</p></div><span className="text-xs font-semibold text-slate-400">{data.approved_quotes} de {data.total_quotes}</span></div><Progress value={conversion} tone="success" className="mt-5" /></Surface></div>
    </section>
  </>;
}
