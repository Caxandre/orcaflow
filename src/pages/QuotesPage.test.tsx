import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { AxiosResponse } from 'axios';
import { QuotesPage } from './QuotesPage';
import { api } from '../services/api';
import type { ApiResponse, Client, Paginated, Quote } from '../types';

const pagination = { page: 1, limit: 10, total: 1, totalPages: 1 };

const quote: Quote = {
  id: 7,
  quote_number: 'ORC-0007',
  client_id: 1,
  client_name: 'Cliente Teste',
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
};

function mockGet(quoteFixture: Quote) {
  return vi.spyOn(api, 'get').mockImplementation(((url: string) => {
    if (url === '/quotes') {
      return Promise.resolve({ data: { data: { items: [quoteFixture], pagination } } } as AxiosResponse<
        ApiResponse<Paginated<Quote>>
      >);
    }
    if (url === '/clients') {
      return Promise.resolve({ data: { data: { items: [] as Client[], pagination } } } as AxiosResponse<ApiResponse<Paginated<Client>>>);
    }
    return Promise.reject(new Error('unexpected url'));
  }) as typeof api.get);
}

describe('QuotesPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('cliente sem telefone: ação de WhatsApp fica desabilitada e não chama a API', async () => {
    const user = userEvent.setup();
    mockGet(quote);
    const postSpy = vi.spyOn(api, 'post');
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <MemoryRouter>
        <QuotesPage />
      </MemoryRouter>,
    );

    const button = await screen.findByRole('button', { name: 'WhatsApp' });
    expect(button).toBeDisabled();

    await user.click(button);

    expect(postSpy).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it('cliente com telefone: ação de WhatsApp fica disponível e aciona o mesmo fluxo existente', async () => {
    const user = userEvent.setup();
    const quoteWithPhone: Quote = { ...quote, client_phone: '11999999999' };
    mockGet(quoteWithPhone);
    const postSpy = vi
      .spyOn(api, 'post')
      .mockResolvedValueOnce({ data: { data: { url: 'https://example.com/quote.pdf' } } } as AxiosResponse<ApiResponse<{ url: string }>>);
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <MemoryRouter>
        <QuotesPage />
      </MemoryRouter>,
    );

    const button = await screen.findByRole('button', { name: 'WhatsApp' });
    expect(button).toBeEnabled();

    await user.click(button);

    await waitFor(() => expect(postSpy).toHaveBeenCalledWith('/quotes/7/pdf'));
    expect(openSpy).toHaveBeenCalledWith(expect.stringContaining('wa.me'), '_blank', 'noopener,noreferrer');
  });

  it('exclusão: botão fica desabilitado e mostra "Excluindo..." enquanto o DELETE está pendente; conclui normalmente ao resolver', async () => {
    const user = userEvent.setup();
    mockGet(quote);
    let resolveDelete: (() => void) | undefined;
    const deleteSpy = vi.spyOn(api, 'delete').mockReturnValue(
      new Promise<AxiosResponse>((resolve) => { resolveDelete = () => resolve({} as AxiosResponse); }),
    );

    render(
      <MemoryRouter>
        <QuotesPage />
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole('button', { name: 'Excluir' }));
    await user.click(await screen.findByRole('button', { name: 'Confirmar exclusão' }));

    expect(await screen.findByRole('button', { name: 'Excluindo...' })).toBeDisabled();
    expect(deleteSpy).toHaveBeenCalledTimes(1);

    resolveDelete?.();

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
