import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import type { AxiosResponse } from 'axios';
import { ProductsPage } from './ProductsPage';
import { api } from '../services/api';
import type { ApiResponse, Paginated, Pagination, Product } from '../types';

const emptyProducts: Paginated<Product> = { items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } as Pagination };

function mockList() {
  return vi.spyOn(api, 'get').mockResolvedValue({ data: { data: emptyProducts } } as AxiosResponse<ApiResponse<Paginated<Product>>>);
}

function axiosErrorRejection(errors: { field: string; message: string }[]) {
  return {
    isAxiosError: true,
    response: { status: 422, data: { success: false, message: 'Verifique os dados informados.', errors } },
  };
}

async function openAndFillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: 'Novo item' }));
  await user.type(screen.getByLabelText('Nome'), 'Produto Teste');
}

describe('ProductsPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('erro conhecido em name aparece no campo, com aria-invalid, sem toast global', async () => {
    const user = userEvent.setup();
    mockList();
    const postSpy = vi
      .spyOn(api, 'post')
      .mockRejectedValueOnce(axiosErrorRejection([{ field: 'name', message: 'Nome já cadastrado.' }]));
    const toastErrorSpy = vi.spyOn(toast, 'error');

    render(<ProductsPage />);
    await openAndFillForm(user);
    await user.click(screen.getByRole('button', { name: 'Salvar item' }));

    expect(await screen.findByText('Nome já cadastrado.')).toBeInTheDocument();
    expect(screen.getByLabelText('Nome')).toHaveAttribute('aria-invalid', 'true');
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(toastErrorSpy).not.toHaveBeenCalled();
  });

  it('erro conhecido em unit_price aparece no campo (protege o split FormInput/FormOutput)', async () => {
    const user = userEvent.setup();
    mockList();
    vi.spyOn(api, 'post').mockRejectedValueOnce(
      axiosErrorRejection([{ field: 'unit_price', message: 'Preço acima do limite permitido.' }]),
    );
    const toastErrorSpy = vi.spyOn(toast, 'error');

    render(<ProductsPage />);
    await openAndFillForm(user);
    await user.click(screen.getByRole('button', { name: 'Salvar item' }));

    expect(await screen.findByText('Preço acima do limite permitido.')).toBeInTheDocument();
    expect(screen.getByLabelText('Preço unitário')).toHaveAttribute('aria-invalid', 'true');
    expect(toastErrorSpy).not.toHaveBeenCalled();
  });

  it('erro global (errors vazio) preserva o tratamento existente via showApiError', async () => {
    const user = userEvent.setup();
    mockList();
    vi.spyOn(api, 'post').mockRejectedValueOnce(axiosErrorRejection([]));
    const toastErrorSpy = vi.spyOn(toast, 'error');

    render(<ProductsPage />);
    await openAndFillForm(user);
    await user.click(screen.getByRole('button', { name: 'Salvar item' }));

    await waitFor(() => expect(toastErrorSpy).toHaveBeenCalledWith('Verifique os dados informados.'));
  });

  it('field desconhecido não cria erro em campo arbitrário; usuário ainda recebe feedback global', async () => {
    const user = userEvent.setup();
    mockList();
    vi.spyOn(api, 'post').mockRejectedValueOnce(
      axiosErrorRejection([{ field: 'unknown_field', message: 'Campo inesperado.' }]),
    );
    const toastErrorSpy = vi.spyOn(toast, 'error');

    render(<ProductsPage />);
    await openAndFillForm(user);
    await user.click(screen.getByRole('button', { name: 'Salvar item' }));

    await waitFor(() => expect(toastErrorSpy).toHaveBeenCalledWith('Verifique os dados informados.'));
    expect(screen.queryByText('Campo inesperado.')).not.toBeInTheDocument();
  });

  it('exclusão: botão fica desabilitado e mostra "Excluindo..." enquanto o DELETE está pendente; conclui normalmente ao resolver', async () => {
    const user = userEvent.setup();
    const product: Product = {
      id: 1,
      name: 'Produto Teste',
      description: null,
      unit_price: 100,
      type: 'product',
      is_active: true,
      created_at: '2026-08-01T12:00:00Z',
      updated_at: '2026-08-01T12:00:00Z',
    };
    vi.spyOn(api, 'get').mockResolvedValue({
      data: { data: { items: [product], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } as Pagination } },
    } as AxiosResponse<ApiResponse<Paginated<Product>>>);
    let resolveDelete: (() => void) | undefined;
    const deleteSpy = vi.spyOn(api, 'delete').mockReturnValue(
      new Promise<AxiosResponse>((resolve) => { resolveDelete = () => resolve({} as AxiosResponse); }),
    );

    render(<ProductsPage />);
    await user.click(await screen.findByRole('button', { name: 'Excluir' }));
    await user.click(await screen.findByRole('button', { name: 'Confirmar exclusão' }));

    expect(await screen.findByRole('button', { name: 'Excluindo...' })).toBeDisabled();
    expect(deleteSpy).toHaveBeenCalledTimes(1);

    resolveDelete?.();

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
