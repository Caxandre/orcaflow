import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import type { AxiosResponse } from 'axios';
import { ClientsPage } from './ClientsPage';
import { api } from '../services/api';
import type { ApiResponse, Client, Paginated } from '../types';

const emptyClients: Paginated<Client> = { items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };

function mockList() {
  return vi.spyOn(api, 'get').mockResolvedValue({ data: { data: emptyClients } } as AxiosResponse<ApiResponse<Paginated<Client>>>);
}

function axiosErrorRejection(errors: { field: string; message: string }[]) {
  return {
    isAxiosError: true,
    response: { status: 422, data: { success: false, message: 'Verifique os dados informados.', errors } },
  };
}

async function openAndFillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: 'Novo cliente' }));
  await user.type(screen.getByLabelText('Nome'), 'Cliente Teste');
  await user.type(screen.getByLabelText('E-mail'), 'cliente@teste.com');
  await user.type(screen.getByLabelText('Telefone / WhatsApp'), '11999999999');
}

describe('ClientsPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('erro de campo do backend aparece no FormField correspondente, sem toast global', async () => {
    const user = userEvent.setup();
    mockList();
    const postSpy = vi
      .spyOn(api, 'post')
      .mockRejectedValueOnce(axiosErrorRejection([{ field: 'email', message: 'E-mail rejeitado pelo servidor.' }]));
    const toastErrorSpy = vi.spyOn(toast, 'error');

    render(<ClientsPage />);
    await openAndFillForm(user);
    await user.click(screen.getByRole('button', { name: 'Salvar cliente' }));

    expect(await screen.findByText('E-mail rejeitado pelo servidor.')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'true');
    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(toastErrorSpy).not.toHaveBeenCalled();
  });

  it('erro global (errors vazio) preserva o tratamento existente via showApiError', async () => {
    const user = userEvent.setup();
    mockList();
    vi.spyOn(api, 'post').mockRejectedValueOnce(axiosErrorRejection([]));
    const toastErrorSpy = vi.spyOn(toast, 'error');

    render(<ClientsPage />);
    await openAndFillForm(user);
    await user.click(screen.getByRole('button', { name: 'Salvar cliente' }));

    await waitFor(() => expect(toastErrorSpy).toHaveBeenCalledWith('Verifique os dados informados.'));
  });

  it('field desconhecido não cria erro em campo arbitrário; usuário ainda recebe feedback global', async () => {
    const user = userEvent.setup();
    mockList();
    vi.spyOn(api, 'post').mockRejectedValueOnce(
      axiosErrorRejection([{ field: 'unknown_field', message: 'Campo inesperado.' }]),
    );
    const toastErrorSpy = vi.spyOn(toast, 'error');

    render(<ClientsPage />);
    await openAndFillForm(user);
    await user.click(screen.getByRole('button', { name: 'Salvar cliente' }));

    await waitFor(() => expect(toastErrorSpy).toHaveBeenCalledWith('Verifique os dados informados.'));
    expect(screen.queryByText('Campo inesperado.')).not.toBeInTheDocument();
  });
});
