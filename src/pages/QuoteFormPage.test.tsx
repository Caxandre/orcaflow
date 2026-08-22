import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { AxiosResponse } from 'axios';
import { QuoteFormPage } from './QuoteFormPage';
import { api } from '../services/api';
import type { ApiResponse, Client, Paginated, Quote } from '../types';

const client: Client = {
  id: 1,
  name: 'Cliente Teste',
  email: 'cliente@teste.com',
  phone: '11999999999',
  company: null,
  notes: null,
  created_at: '2026-08-01T12:00:00Z',
  updated_at: '2026-08-01T12:00:00Z',
};

function axiosErrorRejection(errors: { field: string; message: string }[]) {
  return {
    isAxiosError: true,
    response: { status: 422, data: { success: false, message: 'Verifique os dados informados.', errors } },
  };
}

function mockAuxiliaryLists() {
  return vi.spyOn(api, 'get').mockImplementation(((url: string) => {
    if (url === '/clients') {
      return Promise.resolve({
        data: { data: { items: [client], pagination: { page: 1, limit: 100, total: 1, totalPages: 1 } } },
      } as AxiosResponse<ApiResponse<Paginated<Client>>>);
    }
    // /products: catálogo, não usado nestes testes (item é criado via "Item personalizado"),
    // mas precisa resolver (não rejeitar) - o efeito usa Promise.all, e uma
    // rejeição aqui derrubaria o .then() que também popula `clients`.
    return Promise.resolve({
      data: { data: { items: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 0 } } },
    } as AxiosResponse<unknown>);
  }) as typeof api.get);
}

async function renderAndFillMinimalForm(user: ReturnType<typeof userEvent.setup>) {
  render(
    <MemoryRouter initialEntries={['/orcamentos/novo']}>
      <Routes>
        <Route path="/orcamentos/novo" element={<QuoteFormPage />} />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByRole('option', { name: 'Cliente Teste' });
  await user.selectOptions(screen.getByLabelText('Cliente'), '1');
  await user.click(screen.getByRole('button', { name: 'Item personalizado' }));
  await user.type(screen.getByLabelText('Item'), 'Item Teste');
}

const quote: Quote = {
  id: 42,
  quote_number: 'ORC-0042',
  client_id: 1,
  status: 'draft',
  subtotal: 100,
  discount_type: 'fixed',
  discount_value: 0,
  discount_amount: 0,
  total: 100,
  notes: null,
  valid_until: '2026-09-01',
  pdf_path: null,
  created_at: '2026-08-01T12:00:00Z',
  updated_at: '2026-08-01T12:00:00Z',
  items: [],
  history: [],
};

describe('QuoteFormPage (edição)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('GET falho no orçamento mostra erro; "Tentar novamente" refaz só essa chamada e mostra o formulário após sucesso', async () => {
    const user = userEvent.setup();
    let quoteCalls = 0;
    const getSpy = vi.spyOn(api, 'get').mockImplementation(((url: string) => {
      if (url === '/quotes/42') {
        quoteCalls += 1;
        if (quoteCalls === 1) return Promise.reject(new Error('network error'));
        return Promise.resolve({ data: { data: quote } } as AxiosResponse<ApiResponse<Quote>>);
      }
      // /clients e /products: carga auxiliar, fora do escopo desta correção.
      return Promise.reject(new Error('unrelated endpoint'));
    }) as typeof api.get);

    render(
      <MemoryRouter initialEntries={['/orcamentos/42/editar']}>
        <Routes>
          <Route path="/orcamentos/:id/editar" element={<QuoteFormPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Não foi possível carregar o orçamento para edição.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Editar orçamento' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByRole('heading', { name: 'Editar orçamento' })).toBeInTheDocument();
    expect(quoteCalls).toBe(2);
    expect(getSpy).toHaveBeenCalled();
  });
});

describe('QuoteFormPage (erros de validação do backend, criação)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('erro conhecido em campo simples (discount_value) aparece no campo, sem toast global', async () => {
    const user = userEvent.setup();
    mockAuxiliaryLists();
    vi.spyOn(api, 'post').mockRejectedValueOnce(
      axiosErrorRejection([{ field: 'discount_value', message: 'Desconto informado é inválido.' }]),
    );
    const toastErrorSpy = vi.spyOn(toast, 'error');

    await renderAndFillMinimalForm(user);
    await user.click(screen.getByRole('button', { name: 'Criar orçamento' }));

    expect(await screen.findByText('Desconto informado é inválido.')).toBeInTheDocument();
    expect(screen.getByLabelText('Valor')).toHaveAttribute('aria-invalid', 'true');
    expect(toastErrorSpy).not.toHaveBeenCalled();
  });

  it('erro em item (items.0.item_name) aparece na linha correta, sem toast global', async () => {
    const user = userEvent.setup();
    mockAuxiliaryLists();
    vi.spyOn(api, 'post').mockRejectedValueOnce(
      axiosErrorRejection([{ field: 'items.0.item_name', message: 'Nome do item inválido.' }]),
    );
    const toastErrorSpy = vi.spyOn(toast, 'error');

    await renderAndFillMinimalForm(user);
    await user.click(screen.getByRole('button', { name: 'Criar orçamento' }));

    expect(await screen.findByText('Nome do item inválido.')).toBeInTheDocument();
    expect(screen.getByLabelText('Item')).toHaveAttribute('aria-invalid', 'true');
    expect(toastErrorSpy).not.toHaveBeenCalled();
  });

  it('erro raiz de items (field "items") aparece na mesma superfície usada pelo erro local de array vazio', async () => {
    const user = userEvent.setup();
    mockAuxiliaryLists();
    vi.spyOn(api, 'post').mockRejectedValueOnce(
      axiosErrorRejection([{ field: 'items', message: 'Não é possível processar os itens informados.' }]),
    );
    const toastErrorSpy = vi.spyOn(toast, 'error');

    await renderAndFillMinimalForm(user);
    await user.click(screen.getByRole('button', { name: 'Criar orçamento' }));

    expect(await screen.findByText('Não é possível processar os itens informados.')).toBeInTheDocument();
    expect(toastErrorSpy).not.toHaveBeenCalled();
  });

  it('field não apresentável (status) não cria erro em campo arbitrário; feedback global permanece', async () => {
    const user = userEvent.setup();
    mockAuxiliaryLists();
    vi.spyOn(api, 'post').mockRejectedValueOnce(axiosErrorRejection([{ field: 'status', message: 'Status inválido.' }]));
    const toastErrorSpy = vi.spyOn(toast, 'error');

    await renderAndFillMinimalForm(user);
    await user.click(screen.getByRole('button', { name: 'Criar orçamento' }));

    await waitFor(() => expect(toastErrorSpy).toHaveBeenCalledWith('Verifique os dados informados.'));
    expect(screen.queryByText('Status inválido.')).not.toBeInTheDocument();
  });

  it('erro global (errors vazio) preserva o tratamento existente via showApiError', async () => {
    const user = userEvent.setup();
    mockAuxiliaryLists();
    vi.spyOn(api, 'post').mockRejectedValueOnce(axiosErrorRejection([]));
    const toastErrorSpy = vi.spyOn(toast, 'error');

    await renderAndFillMinimalForm(user);
    await user.click(screen.getByRole('button', { name: 'Criar orçamento' }));

    await waitFor(() => expect(toastErrorSpy).toHaveBeenCalledWith('Verifique os dados informados.'));
  });
});
