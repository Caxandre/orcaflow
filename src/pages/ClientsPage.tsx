import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Eye, Mail, Pencil, Phone, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../design-system/Button';
import { ConfirmDialog } from '../design-system/ConfirmDialog';
import { EmptyState } from '../design-system/EmptyState';
import { FormField } from '../design-system/FormField';
import { IconButton } from '../design-system/IconButton';
import { Input } from '../design-system/Input';
import { Loading } from '../design-system/Loading';
import { Modal } from '../design-system/Modal';
import { PageHeader } from '../design-system/PageHeader';
import { Pagination } from '../design-system/Pagination';
import { SearchInput } from '../design-system/SearchInput';
import { Surface } from '../design-system/Surface';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../design-system/Table';
import { Textarea } from '../design-system/Textarea';
import { api, applyApiFieldErrors, showApiError } from '../services/api';
import type { ApiResponse, Client, Paginated, Pagination as PaginationType, Quote } from '../types';
import { formatDate, formatMoney, phoneDigits } from '../utils/format';

const schema = z.object({
  name: z.string().min(2, 'Informe o nome.'), email: z.email('Informe um e-mail válido.'), phone: z.string().min(8, 'Informe o telefone.'),
  company: z.string(), notes: z.string(),
});
type FormData = z.infer<typeof schema>;
const emptyPagination = { page: 1, limit: 10, total: 0, totalPages: 0 };

const knownFields = ['name', 'email', 'phone', 'company', 'notes'] as const;
type KnownField = (typeof knownFields)[number];
const isKnownField = (field: string): field is KnownField => (knownFields as readonly string[]).includes(field);

export function ClientsPage() {
  const [items, setItems] = useState<Client[]>([]);
  const [pageInfo, setPageInfo] = useState<PaginationType>(emptyPagination);
  const [page, setPage] = useState(1); const [search, setSearch] = useState(''); const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Client | null | undefined>(undefined); const [viewing, setViewing] = useState<Client | null>(null);
  const [history, setHistory] = useState<Quote[]>([]); const [deleting, setDeleting] = useState<Client | null>(null); const [deletingBusy, setDeletingBusy] = useState(false);
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const load = useCallback(async () => { setLoading(true); try { const r = await api.get<ApiResponse<Paginated<Client>>>('/clients', { params: { page, search } }); setItems(r.data.data.items); setPageInfo(r.data.data.pagination); } catch (e) { showApiError(e); } finally { setLoading(false); } }, [page, search]);
  useEffect(() => { void load(); }, [load]);
  const openForm = (client: Client | null) => { setEditing(client); reset(client ? { name: client.name, email: client.email, phone: client.phone, company: client.company ?? '', notes: client.notes ?? '' } : { name: '', email: '', phone: '', company: '', notes: '' }); };
  const submit = async (data: FormData) => {
    try {
      if (editing) await api.put(`/clients/${editing.id}`, data);
      else await api.post('/clients', data);
      toast.success(editing ? 'Cliente atualizado.' : 'Cliente cadastrado.');
      setEditing(undefined);
      await load();
    } catch (e) {
      const handled = applyApiFieldErrors(e, (fieldError) => {
        if (!isKnownField(fieldError.field)) return false;
        setError(fieldError.field, { type: 'server', message: fieldError.message });
        return true;
      });
      if (!handled) showApiError(e);
    }
  };
  const showDetails = async (client: Client) => { setViewing(client); setHistory([]); try { const r = await api.get<ApiResponse<Quote[]>>(`/clients/${client.id}/quotes`); setHistory(r.data.data); } catch (e) { showApiError(e); } };
  const remove = async () => { if (!deleting) return; setDeletingBusy(true); try { await api.delete(`/clients/${deleting.id}`); toast.success('Cliente excluído.'); setDeleting(null); await load(); } catch (e) { showApiError(e); } finally { setDeletingBusy(false); } };
  return <>
    <PageHeader eyebrow="Relacionamentos" title="Clientes" description="Centralize contatos e acompanhe todas as propostas de cada cliente." action={<Button variant="primary" onClick={() => openForm(null)}><Plus size={18} />Novo cliente</Button>} />
    <Surface as="section" className="overflow-hidden"><div className="border-b border-slate-100 p-4 sm:p-5"><SearchInput className="max-w-md" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por nome, e-mail, telefone ou empresa" /></div>
      {loading ? <Loading /> : items.length === 0 ? <EmptyState title="Nenhum cliente encontrado" description="Ajuste a busca ou cadastre um novo cliente." /> : (
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Desde</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((client) => (
              <TableRow className="hover:bg-slate-50/60" key={client.id}>
                <TableCell><p className="font-semibold text-slate-800">{client.name}</p><p className="mt-1 text-xs text-slate-400">#{client.id}</p></TableCell>
                <TableCell><p className="flex items-center gap-2 text-slate-600"><Mail size={14} />{client.email}</p><a className="mt-1.5 flex items-center gap-2 text-slate-500 hover:text-emerald-600" target="_blank" rel="noreferrer" href={`https://wa.me/${phoneDigits(client.phone)}`}><Phone size={14} />{client.phone}</a></TableCell>
                <TableCell className="text-slate-600">{client.company ?? '—'}</TableCell>
                <TableCell className="text-slate-500">{formatDate(client.created_at)}</TableCell>
                <TableCell><div className="flex justify-end gap-1"><IconButton icon={<Eye size={17} />} tone="brand" aria-label="Visualizar" onClick={() => void showDetails(client)} /><IconButton icon={<Pencil size={17} />} tone="brand" aria-label="Editar" onClick={() => openForm(client)} /><IconButton icon={<Trash2 size={17} />} tone="danger" aria-label="Excluir" onClick={() => setDeleting(client)} /></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Pagination value={pageInfo} onChange={setPage} />
    </Surface>
    <Modal open={editing !== undefined} onClose={() => setEditing(undefined)} title={editing ? 'Editar cliente' : 'Novo cliente'} description="Informações para contato e propostas." maxWidth="2xl">
      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(submit)}>
        <FormField label="Nome" error={errors.name?.message}><Input {...register('name')} /></FormField>
        <FormField label="E-mail" error={errors.email?.message}><Input type="email" {...register('email')} /></FormField>
        <FormField label="Telefone / WhatsApp" error={errors.phone?.message}><Input placeholder="(11) 99999-9999" {...register('phone')} /></FormField>
        <FormField label="Empresa" error={errors.company?.message}><Input {...register('company')} /></FormField>
        <FormField className="sm:col-span-2" label="Observações" error={errors.notes?.message}><Textarea className="min-h-28 py-3" {...register('notes')} /></FormField>
        <div className="sm:col-span-2 mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => setEditing(undefined)}>Cancelar</Button>
          <Button variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar cliente'}</Button>
        </div>
      </form>
    </Modal>
    <Modal
      open={viewing !== null}
      onClose={() => setViewing(null)}
      maxWidth="3xl"
      title={viewing && (
        <>
          <span className="block text-xs font-bold uppercase tracking-wider text-brand-600">Cliente #{viewing.id}</span>
          <span className="mt-1 block font-serif text-2xl font-normal text-navy">{viewing.name}</span>
        </>
      )}
    >
      {viewing && (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[[Mail, viewing.email], [Phone, viewing.phone], [Building2, viewing.company ?? 'Sem empresa']].map(([Icon, text], index) => {
              const C = Icon as typeof Mail;
              return <div className="rounded-xl bg-slate-50 p-4" key={index}><C size={17} className="mb-2 text-brand-600" /><p className="break-words text-sm text-slate-600">{String(text)}</p></div>;
            })}
          </div>
          {viewing.notes && (
            <div className="mt-5 rounded-xl border border-slate-100 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Observações</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{viewing.notes}</p>
            </div>
          )}
          <h3 className="mb-3 mt-7 font-semibold text-navy">Histórico de orçamentos</h3>
          {history.length ? (
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
              {history.map((quote) => (
                <div className="flex flex-wrap items-center justify-between gap-3 p-4" key={quote.id}>
                  <div><p className="font-semibold text-brand-700">{quote.quote_number}</p><p className="mt-1 text-xs text-slate-400">{formatDate(quote.created_at)}</p></div>
                  <p className="font-semibold">{formatMoney(quote.total)}</p>
                  <StatusBadge status={quote.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Este cliente ainda não possui orçamentos.</p>
          )}
        </>
      )}
    </Modal>
    <ConfirmDialog open={Boolean(deleting)} title="Excluir cliente?" description={`Essa ação remove ${deleting?.name ?? 'o cliente'} permanentemente. Clientes com orçamentos vinculados não podem ser excluídos.`} onClose={() => setDeleting(null)} onConfirm={() => void remove()} busy={deletingBusy} />
  </>;
}
