import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { AxiosResponse } from 'axios';
import { DashboardPage } from './DashboardPage';
import { api } from '../services/api';
import type { ApiResponse, DashboardData } from '../types';

const dashboardData: DashboardData = {
  total_quotes: 3,
  sent_quotes: 1,
  approved_quotes: 1,
  rejected_quotes: 1,
  total_value: 1000,
  approved_value: 500,
  recent_quotes: [],
};

describe('DashboardPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('GET falho mostra erro; "Tentar novamente" refaz a chamada e mostra o conteúdo após sucesso', async () => {
    const user = userEvent.setup();
    const getSpy = vi
      .spyOn(api, 'get')
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({ data: { data: dashboardData } } as AxiosResponse<ApiResponse<DashboardData>>);

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Não foi possível carregar o dashboard.')).toBeInTheDocument();
    expect(screen.queryByText('Seu negócio, em movimento')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Seu negócio, em movimento')).toBeInTheDocument();
    expect(getSpy).toHaveBeenCalledTimes(2);
  });
});
