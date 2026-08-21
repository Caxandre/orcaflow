import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { AxiosResponse } from 'axios';
import { QuoteFormPage } from './QuoteFormPage';
import { api } from '../services/api';
import type { ApiResponse, Quote } from '../types';

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
