import { zodResolver } from '@hookform/resolvers/zod';
import { BriefcaseBusiness, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Badge } from '../design-system/Badge';
import { Button } from '../design-system/Button';
import { Checkbox } from '../design-system/Checkbox';
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
import { Select } from '../design-system/Select';
import { Surface } from '../design-system/Surface';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../design-system/Table';
import { Textarea } from '../design-system/Textarea';
import { api, showApiError } from '../services/api';
import type { ApiResponse, Paginated, Pagination as PaginationType, Product } from '../types';
import { formatMoney } from '../utils/format';

const schema = z.object({ name: z.string().min(2, 'Informe o nome.'), description: z.string(), unit_price: z.coerce.number().min(0, 'O preço não pode ser negativo.'), type: z.enum(['product', 'service']), is_active: z.boolean() });
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;
const blank: FormInput = { name: '', description: '', unit_price: 0, type: 'service', is_active: true };

export function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]); const [pagination, setPagination] = useState<PaginationType>({ page: 1, limit: 10, total: 0, totalPages: 0 }); const [page, setPage] = useState(1);
  const [search, setSearch] = useState(''); const [type, setType] = useState(''); const [status, setStatus] = useState(''); const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null | undefined>(undefined); const [deleting, setDeleting] = useState<Product | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema), defaultValues: blank });
  const load = useCallback(async () => { setLoading(true); try { const r = await api.get<ApiResponse<Paginated<Product>>>('/products', { params: { page, search, type, status } }); setItems(r.data.data.items); setPagination(r.data.data.pagination); } catch (e) { showApiError(e); } finally { setLoading(false); } }, [page, search, type, status]);
  useEffect(() => { void load(); }, [load]);
  const openForm = (item: Product | null) => { setEditing(item); reset(item ? { name: item.name, description: item.description ?? '', unit_price: item.unit_price, type: item.type, is_active: Boolean(item.is_active) } : blank); };
  const submit = async (data: FormOutput) => { try { if (editing) await api.put(`/products/${editing.id}`, data); else await api.post('/products', data); toast.success(editing ? 'Cadastro atualizado.' : 'Item cadastrado.'); setEditing(undefined); await load(); } catch (e) { showApiError(e); } };
  const remove = async () => { if (!deleting) return; try { await api.delete(`/products/${deleting.id}`); toast.success('Item excluído.'); setDeleting(null); await load(); } catch (e) { showApiError(e); } };
  return <>
    <PageHeader eyebrow="Catálogo" title="Produtos e serviços" description="Mantenha preços organizados e monte propostas em poucos cliques." action={<Button variant="primary" onClick={() => openForm(null)}><Plus size={18} />Novo item</Button>} />
    <Surface as="section" className="overflow-hidden"><div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-[1fr_180px_180px] sm:p-5"><SearchInput value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por nome" /><Select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}><option value="">Todos os tipos</option><option value="product">Produtos</option><option value="service">Serviços</option></Select><Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">Todos os status</option><option value="active">Ativos</option><option value="inactive">Inativos</option></Select></div>
      {loading ? <Loading /> : items.length === 0 ? <EmptyState title="Nenhum item encontrado" description="Cadastre produtos ou serviços para usar nos orçamentos." /> : (
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Preço unitário</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow className="hover:bg-slate-50/60" key={item.id}>
                <TableCell><div className="flex items-center gap-3"><span className={`grid size-10 place-items-center rounded-xl ${item.type === 'service' ? 'bg-violet-50 text-violet-600' : 'bg-blue-50 text-blue-600'}`}>{item.type === 'service' ? <BriefcaseBusiness size={18} /> : <Package size={18} />}</span><div><p className="font-semibold text-slate-800">{item.name}</p><p className="mt-1 max-w-sm truncate text-xs text-slate-400">{item.description || 'Sem descrição'}</p></div></div></TableCell>
                <TableCell className="text-slate-600">{item.type === 'service' ? 'Serviço' : 'Produto'}</TableCell>
                <TableCell className="font-semibold text-slate-800">{formatMoney(item.unit_price)}</TableCell>
                <TableCell><Badge tone={item.is_active ? 'success' : 'neutral'}>{item.is_active ? 'Ativo' : 'Inativo'}</Badge></TableCell>
                <TableCell><div className="flex justify-end gap-1"><IconButton icon={<Pencil size={17} />} tone="brand" aria-label="Editar" onClick={() => openForm(item)} /><IconButton icon={<Trash2 size={17} />} tone="danger" aria-label="Excluir" onClick={() => setDeleting(item)} /></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Pagination value={pagination} onChange={setPage} /></Surface>
    <Modal open={editing !== undefined} onClose={() => setEditing(undefined)} title={editing ? 'Editar item' : 'Novo produto ou serviço'} description="Este preço poderá ser ajustado em cada proposta." maxWidth="2xl">
      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(submit)}>
        <FormField className="sm:col-span-2" label="Nome" error={errors.name?.message}>
          <Input {...register('name')} />
        </FormField>
        <FormField label="Tipo">
          <Select {...register('type')}>
            <option value="service">Serviço</option>
            <option value="product">Produto</option>
          </Select>
        </FormField>
        <FormField label="Preço unitário" error={errors.unit_price?.message}>
          <Input type="number" step="0.01" min="0" {...register('unit_price')} />
        </FormField>
        <FormField className="sm:col-span-2" label="Descrição">
          <Textarea className="min-h-28 py-3" {...register('description')} />
        </FormField>
        <label className="sm:col-span-2 flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-700">
          <Checkbox {...register('is_active')} />
          Disponível para novos orçamentos
        </label>
        <div className="sm:col-span-2 mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => setEditing(undefined)}>Cancelar</Button>
          <Button variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar item'}</Button>
        </div>
      </form>
    </Modal>
    <ConfirmDialog open={Boolean(deleting)} title="Excluir item?" description={`O item “${deleting?.name ?? ''}” será removido. Se ele já tiver sido usado, desative-o para preservar o histórico.`} onClose={() => setDeleting(null)} onConfirm={() => void remove()} />
  </>;
}
