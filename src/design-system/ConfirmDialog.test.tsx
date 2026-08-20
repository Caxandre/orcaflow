import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('botão "Cancelar" chama onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <ConfirmDialog open onClose={onClose} title="Excluir item?" description="Esta ação não pode ser desfeita." onConfirm={() => {}} />,
    );
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('botão "Confirmar exclusão" chama onConfirm exatamente uma vez', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog open onClose={() => {}} title="Excluir item?" description="Esta ação não pode ser desfeita." onConfirm={onConfirm} />,
    );
    await user.click(screen.getByRole('button', { name: 'Confirmar exclusão' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('busy=true desabilita o botão de confirmar e mostra "Excluindo..."', () => {
    render(
      <ConfirmDialog open onClose={() => {}} title="Excluir item?" description="Esta ação não pode ser desfeita." onConfirm={() => {}} busy />,
    );
    expect(screen.queryByRole('button', { name: 'Confirmar exclusão' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Excluindo...' })).toBeDisabled();
  });

  it('confirmLabel/cancelLabel customizados substituem o default e continuam funcionais', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open
        onClose={onClose}
        title="Remover produto?"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        cancelLabel="Manter"
        onConfirm={onConfirm}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Confirmar exclusão' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remover' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Manter' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
