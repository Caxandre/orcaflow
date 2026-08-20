import { CalendarDays, Copy, Download, Eye, FilePlus2, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../design-system/Button';
import { ButtonLink } from '../design-system/ButtonLink';
import { ConfirmDialog } from '../design-system/ConfirmDialog';
import { EmptyState } from '../design-system/EmptyState';
import { IconButton } from '../design-system/IconButton';
import { Input } from '../design-system/Input';
import { Loading } from '../design-system/Loading';
import { PageHeader } from '../design-system/PageHeader';
import { Pagination } from '../design-system/Pagination';
import { SearchInput } from '../design-system/SearchInput';
import { Select } from '../design-system/Select';
import { Surface } from '../design-system/Surface';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../design-system/Table';
import { api, showApiError } from '../services/api';
import type { ApiResponse, Client, Paginated, Pagination as PaginationType, Quote, QuoteStatus } from '../types';
import { formatDate, formatMoney, whatsAppUrl } from '../utils/format';

interface Filters { search: string; client_id: string; status: string; date_from: string; date_to: string; min_value: string; max_value: string; sort: string; order: string }
const initialFilters: Filters = { search: '', client_id: '', status: '', date_from: '', date_to: '', min_value: '', max_value: '', sort: 'created_at', order: 'desc' };

export function QuotesPage() {
  const navigate = useNavigate(); const [items, setItems] = useState<Quote[]>([]); const [clients, setClients] = useState<Client[]>([]); const [page, setPage] = useState(1); const [filters, setFilters] = useState(initialFilters); const [loading, setLoading] = useState(true); const [deleting, setDeleting] = useState<Quote | null>(null);
  const [pagination, setPagination] = useState<PaginationType>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const load = useCallback(async () => { setLoading(true); try { const r = await api.get<ApiResponse<Paginated<Quote>>>('/quotes', { params: { page, ...filters } }); setItems(r.data.data.items); setPagination(r.data.data.pagination); } catch (e) { showApiError(e); } finally { setLoading(false); } }, [page, filters]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { api.get<ApiResponse<Paginated<Client>>>('/clients', { params: { limit: 100 } }).then((r) => setClients(r.data.data.items)).catch(() => undefined); }, []);
  const filter = (key: keyof Filters, value: string) => { setFilters((current) => ({ ...current, [key]: value })); setPage(1); };
  const duplicate = async (quote: Quote) => { try { const r = await api.post<ApiResponse<Quote>>(`/quotes/${quote.id}/duplicate`); toast.success('Cópia criada como rascunho.'); navigate(`/orcamentos/${r.data.data.id}/editar`); } catch (e) { showApiError(e); } };
  const status = async (quote: Quote, value: QuoteStatus) => { try { await api.patch(`/quotes/${quote.id}/status`, { status: value }); toast.success('Status atualizado.'); await load(); } catch (e) { showApiError(e); } };
  const pdf = async (quote: Quote, share = false) => { try { const r = await api.post<ApiResponse<{ url: string }>>(`/quotes/${quote.id}/pdf`); if (share) window.open(whatsAppUrl(quote, r.data.data.url), '_blank', 'noopener,noreferrer'); else window.open(r.data.data.url, '_blank', 'noopener,noreferrer'); toast.success('PDF pronto.'); } catch (e) { showApiError(e); } };
  const remove = async () => { if (!deleting) return; try { await api.delete(`/quotes/${deleting.id}`); toast.success('Orçamento excluído.'); setDeleting(null); await load(); } catch (e) { showApiError(e); } };
  return <>
    <PageHeader eyebrow="Pipeline comercial" title="Orçamentos" description="Encontre, acompanhe e compartilhe cada proposta sem perder o ritmo." action={<ButtonLink to="/orcamentos/novo" variant="primary"><FilePlus2 size={18} />Novo orçamento</ButtonLink>} />
    <Surface as="section" className="overflow-hidden"><div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-3 xl:grid-cols-6 sm:p-5"><SearchInput className="md:col-span-2 xl:col-span-2" placeholder="Número do orçamento" value={filters.search} onChange={(e) => filter('search', e.target.value)} /><Select value={filters.client_id} onChange={(e) => filter('client_id', e.target.value)}><option value="">Todos os clientes</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select><Select value={filters.status} onChange={(e) => filter('status', e.target.value)}><option value="">Todos os status</option><option value="draft">Rascunho</option><option value="sent">Enviado</option><option value="approved">Aprovado</option><option value="rejected">Recusado</option></Select><label className="relative"><CalendarDays className="absolute left-3.5 top-3 text-slate-400" size={17} /><Input className="pl-10" type="date" value={filters.date_from} onChange={(e) => filter('date_from', e.target.value)} aria-label="Data inicial" /></label><label className="relative"><CalendarDays className="absolute left-3.5 top-3 text-slate-400" size={17} /><Input className="pl-10" type="date" value={filters.date_to} onChange={(e) => filter('date_to', e.target.value)} aria-label="Data final" /></label><Input type="number" min="0" placeholder="Valor mínimo" value={filters.min_value} onChange={(e) => filter('min_value', e.target.value)} /><Input type="number" min="0" placeholder="Valor máximo" value={filters.max_value} onChange={(e) => filter('max_value', e.target.value)} /><Select value={`${filters.sort}:${filters.order}`} onChange={(e) => { const [sort, order] = e.target.value.split(':'); setFilters((f) => ({ ...f, sort: sort ?? 'created_at', order: order ?? 'desc' })); }}><option value="created_at:desc">Mais recentes</option><option value="created_at:asc">Mais antigos</option><option value="total:desc">Maior valor</option><option value="total:asc">Menor valor</option><option value="valid_until:asc">Validade próxima</option></Select><Button variant="secondary" onClick={() => { setFilters(initialFilters); setPage(1); }}>Limpar filtros</Button></div>
      {loading ? <Loading /> : items.length === 0 ? <EmptyState title="Nenhum orçamento encontrado" description="Ajuste os filtros ou crie uma nova proposta." action={<ButtonLink to="/orcamentos/novo" variant="primary">Criar orçamento</ButtonLink>} /> : (
        <Table className="min-w-[1050px] w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Emissão</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((quote) => (
              <TableRow className="hover:bg-slate-50/60" key={quote.id}>
                <TableCell><Link className="font-semibold text-brand-700" to={`/orcamentos/${quote.id}`}>{quote.quote_number}</Link></TableCell>
                <TableCell className="font-medium text-slate-700">{quote.client_name}</TableCell>
                <TableCell className="text-slate-500">{formatDate(quote.created_at)}</TableCell>
                <TableCell className="text-slate-500">{formatDate(quote.valid_until)}</TableCell>
                <TableCell className="font-semibold text-slate-800">{formatMoney(quote.total)}</TableCell>
                <TableCell><div className="flex items-center gap-2"><StatusBadge status={quote.status} /><select className="w-7 cursor-pointer bg-transparent text-transparent outline-none" value={quote.status} onChange={(e) => void status(quote, e.target.value as QuoteStatus)} aria-label="Alterar status"><option value="draft">Rascunho</option><option value="sent">Enviado</option><option value="approved">Aprovado</option><option value="rejected">Recusado</option></select></div></TableCell>
                <TableCell><div className="flex justify-end gap-0.5"><Link className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-brand-600" to={`/orcamentos/${quote.id}`} aria-label="Visualizar"><Eye size={16} /></Link><Link className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-brand-600" to={`/orcamentos/${quote.id}/editar`} aria-label="Editar"><Pencil size={16} /></Link><IconButton icon={<Copy size={16} />} tone="brand" aria-label="Duplicar" onClick={() => void duplicate(quote)} /><IconButton icon={<Download size={16} />} tone="brand" aria-label="Gerar PDF" onClick={() => void pdf(quote)} /><IconButton icon={<MessageCircle size={16} />} tone="success" aria-label="WhatsApp" onClick={() => void pdf(quote, true)} /><IconButton icon={<Trash2 size={16} />} tone="danger" aria-label="Excluir" onClick={() => setDeleting(quote)} /></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Pagination value={pagination} onChange={setPage} /></Surface>
    <ConfirmDialog open={Boolean(deleting)} title="Excluir orçamento?" description={`O orçamento ${deleting?.quote_number ?? ''} e todo o seu histórico serão removidos permanentemente.`} onClose={() => setDeleting(null)} onConfirm={() => void remove()} />
  </>;
}
