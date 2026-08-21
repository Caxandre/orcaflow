import { ArrowLeft, CalendarDays, Download, Mail, MessageCircle, Pencil, Phone, UserRound } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../design-system/Button';
import { ButtonLink } from '../design-system/ButtonLink';
import { Loading } from '../design-system/Loading';
import { PageHeader } from '../design-system/PageHeader';
import { Surface } from '../design-system/Surface';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../design-system/Table';
import { api, showApiError } from '../services/api';
import type { ApiResponse, Quote } from '../types';
import { formatDate, formatMoney, whatsAppUrl } from '../utils/format';

const statusLabel = { draft: 'Rascunho', sent: 'Enviado', approved: 'Aprovado', rejected: 'Recusado' };

export function QuoteDetailsPage() {
  const { id } = useParams(); const [quote, setQuote] = useState<Quote | null>(null); const [pdfBusy, setPdfBusy] = useState(false);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const load = useCallback(() => {
    setStatus('loading');
    api.get<ApiResponse<Quote>>(`/quotes/${id}`)
      .then((r) => { setQuote(r.data.data); setStatus('success'); })
      .catch((e) => { showApiError(e); setStatus('error'); });
  }, [id]);
  useEffect(() => { load(); }, [load]);
  const pdf = async (share = false) => { if (!quote) return; if (share && !quote.client_phone) return; setPdfBusy(true); try { const r = await api.post<ApiResponse<{ url: string }>>(`/quotes/${quote.id}/pdf`); if (share) window.open(whatsAppUrl(quote, r.data.data.url), '_blank', 'noopener,noreferrer'); else window.open(r.data.data.url, '_blank', 'noopener,noreferrer'); toast.success('PDF gerado com sucesso.'); } catch (e) { showApiError(e); } finally { setPdfBusy(false); } };
  if (status === 'loading') return <Loading label="Carregando proposta..." />;
  if (status === 'error') return <div className="grid min-h-64 place-items-center px-6 text-center"><div><h3 className="font-semibold text-slate-800">Não foi possível carregar o orçamento.</h3><p className="mt-1 text-sm text-slate-500">Tente novamente em alguns instantes.</p><div className="mt-4"><Button variant="primary" onClick={load}>Tentar novamente</Button></div></div></div>;
  if (!quote) return null;
  const hasPhone = Boolean(quote.client_phone);
  return <>
    <PageHeader eyebrow="Detalhes da proposta" title={quote.quote_number} description={`Criado em ${formatDate(quote.created_at)} · Atualizado em ${formatDate(quote.updated_at)}`} action={<div className="flex flex-wrap gap-2"><ButtonLink to="/orcamentos" variant="secondary"><ArrowLeft size={17} />Voltar</ButtonLink><ButtonLink to={`/orcamentos/${quote.id}/editar`} variant="secondary"><Pencil size={17} />Editar</ButtonLink><Button variant="primary" onClick={() => void pdf()} disabled={pdfBusy}><Download size={17} />PDF</Button></div>} />
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]"><div className="space-y-5"><Surface as="section" className="overflow-hidden"><div className="flex flex-col gap-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-brand-600">Proposta para</p><h2 className="mt-1 font-serif text-2xl text-navy">{quote.client_name}</h2>{quote.client_company && <p className="mt-1 text-sm text-slate-500">{quote.client_company}</p>}</div><StatusBadge status={quote.status} /></div><div className="grid gap-4 p-6 sm:grid-cols-3"><Info Icon={UserRound} label="Cliente" value={quote.client_name ?? ''} /><Info Icon={Mail} label="E-mail" value={quote.client_email ?? '—'} /><Info Icon={Phone} label="Telefone" value={quote.client_phone ?? '—'} /></div></Surface>
      <Surface as="section" className="overflow-hidden"><div className="border-b border-slate-100 px-6 py-5"><h2 className="font-semibold text-navy">Itens do orçamento</h2></div><Table className="min-w-[700px] w-full"><TableHeader><TableRow><TableHead className="px-6">Descrição</TableHead><TableHead className="px-6 text-right">Quantidade</TableHead><TableHead className="px-6 text-right">Unitário</TableHead><TableHead className="px-6 text-right">Total</TableHead></TableRow></TableHeader><TableBody>{quote.items?.map((item, index) => <TableRow key={item.id ?? index}><TableCell className="px-6"><p className="font-semibold text-slate-800">{item.item_name}</p>{item.item_description && <p className="mt-1 text-xs text-slate-400">{item.item_description}</p>}</TableCell><TableCell className="px-6 text-right text-slate-600">{item.quantity}</TableCell><TableCell className="px-6 text-right text-slate-600">{formatMoney(item.unit_price)}</TableCell><TableCell className="px-6 text-right font-semibold text-slate-800">{formatMoney(item.total ?? item.quantity * item.unit_price)}</TableCell></TableRow>)}</TableBody></Table><div className="ml-auto w-full max-w-sm space-y-3 border-t border-slate-100 p-6"><div className="flex justify-between text-sm text-slate-500"><span>Subtotal</span><strong className="text-slate-800">{formatMoney(quote.subtotal)}</strong></div><div className="flex justify-between text-sm text-slate-500"><span>Desconto {quote.discount_type === 'percentage' ? `(${quote.discount_value}%)` : ''}</span><strong className="text-red-600">- {formatMoney(quote.discount_amount)}</strong></div><div className="flex justify-between border-t border-slate-100 pt-4 text-lg"><span className="font-semibold text-navy">Total</span><strong className="text-brand-700">{formatMoney(quote.total)}</strong></div></div></Surface>
      {quote.notes && <Surface as="section" className="p-6"><h2 className="font-semibold text-navy">Observações e condições</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{quote.notes}</p></Surface>}</div>
      <aside className="space-y-5"><Surface as="section" className="p-5"><h2 className="font-semibold text-navy">Próximos passos</h2><p className="mt-2 text-sm leading-6 text-slate-500">Compartilhe uma versão atualizada desta proposta com o cliente.</p><Button variant="success" className="mt-5 w-full" onClick={() => void pdf(true)} disabled={pdfBusy || !hasPhone}><MessageCircle size={18} />Enviar pelo WhatsApp</Button><Button variant="secondary" className="mt-2 w-full" onClick={() => void pdf()} disabled={pdfBusy}><Download size={18} />Baixar PDF</Button></Surface><Surface as="section" className="p-5"><h2 className="font-semibold text-navy">Datas</h2><div className="mt-4 space-y-4"><div className="flex gap-3"><CalendarDays className="mt-0.5 text-brand-600" size={18} /><div><p className="text-xs text-slate-400">Emissão</p><p className="text-sm font-semibold text-slate-700">{formatDate(quote.created_at)}</p></div></div><div className="flex gap-3"><CalendarDays className="mt-0.5 text-coral" size={18} /><div><p className="text-xs text-slate-400">Válido até</p><p className="text-sm font-semibold text-slate-700">{formatDate(quote.valid_until)}</p></div></div></div></Surface><Surface as="section" className="p-5"><h2 className="font-semibold text-navy">Histórico de status</h2><div className="mt-5 space-y-0">{quote.history?.map((event, index) => <div className="relative flex gap-3 pb-5" key={event.id}>{index < (quote.history?.length ?? 0) - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-slate-200" />}<span className="relative mt-1 size-[15px] rounded-full border-4 border-blue-100 bg-brand-600" /><div><p className="text-sm font-semibold text-slate-700">{statusLabel[event.new_status]}</p><p className="mt-0.5 text-xs text-slate-400">{formatDate(event.created_at)} · {event.changed_by_name ?? 'Usuário'}</p></div></div>)}</div></Surface></aside>
    </div>
  </>;
}

function Info({ Icon, label, value }: { Icon: typeof Mail; label: string; value: string }) { return <div className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-brand-600"><Icon size={17} /></span><div className="min-w-0"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-medium text-slate-700">{value}</p></div></div>; }
