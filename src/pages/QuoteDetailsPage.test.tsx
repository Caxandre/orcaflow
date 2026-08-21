import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { AxiosResponse } from 'axios';
import { QuoteDetailsPage } from './QuoteDetailsPage';
import { api } from '../services/api';
import type { ApiResponse, Quote } from '../types';

const quote: Quote = {
  id: 42,
  quote_number: 'ORC-0042',
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
  items: [],
  history: [],
};

describe('QuoteDetailsPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('GET falho mostra erro; "Tentar novamente" refaz a chamada e mostra o orçamento após sucesso', async () => {
    const user = userEvent.setup();
    const getSpy = vi
      .spyOn(api, 'get')
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({ data: { data: quote } } as AxiosResponse<ApiResponse<Quote>>);

    render(
      <MemoryRouter initialEntries={['/orcamentos/42']}>
        <Routes>
          <Route path="/orcamentos/:id" element={<QuoteDetailsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText('Não foi possível carregar o orçamento.')).toBeInTheDocument();
    expect(screen.queryByText('ORC-0042')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('ORC-0042')).toBeInTheDocument();
    expect(getSpy).toHaveBeenCalledTimes(2);
  });

  it('cliente sem telefone: ação de WhatsApp fica desabilitada e não chama a API', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { data: quote } } as AxiosResponse<ApiResponse<Quote>>);
    const postSpy = vi.spyOn(api, 'post');

    render(
      <MemoryRouter initialEntries={['/orcamentos/42']}>
        <Routes>
          <Route path="/orcamentos/:id" element={<QuoteDetailsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const button = await screen.findByRole('button', { name: 'Enviar pelo WhatsApp' });
    expect(button).toBeDisabled();

    await user.click(button);

    expect(postSpy).not.toHaveBeenCalled();
  });

  it('cliente com telefone: ação de WhatsApp fica disponível e aciona o mesmo fluxo existente', async () => {
    const user = userEvent.setup();
    const quoteWithPhone: Quote = { ...quote, client_phone: '11999999999' };
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { data: quoteWithPhone } } as AxiosResponse<ApiResponse<Quote>>);
    const postSpy = vi
      .spyOn(api, 'post')
      .mockResolvedValueOnce({ data: { data: { url: 'https://example.com/quote.pdf' } } } as AxiosResponse<ApiResponse<{ url: string }>>);
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <MemoryRouter initialEntries={['/orcamentos/42']}>
        <Routes>
          <Route path="/orcamentos/:id" element={<QuoteDetailsPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const button = await screen.findByRole('button', { name: 'Enviar pelo WhatsApp' });
    expect(button).toBeEnabled();

    await user.click(button);

    await waitFor(() => expect(postSpy).toHaveBeenCalledWith('/quotes/42/pdf'));
    expect(openSpy).toHaveBeenCalledWith(expect.stringContaining('wa.me'), '_blank', 'noopener,noreferrer');
  });
});
