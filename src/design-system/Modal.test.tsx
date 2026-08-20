import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

// Harness com um elemento externo real, controlando `open`/`onClose` como um
// consumidor real faria — necessário para os cenários de retorno de foco, que
// dependem de um ciclo completo abrir→fechar, não só das props isoladas.
function SingleTriggerHarness() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Título do modal">
        <button>Dentro do modal</button>
      </Modal>
    </div>
  );
}

function MultiTriggerHarness() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Abrir A</button>
      <button onClick={() => setOpen(true)}>Abrir B</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Título do modal">
        Conteúdo
      </Modal>
    </div>
  );
}

// O trigger some do DOM como consequência do mesmo clique que abre o modal —
// evita um segundo clique fora do Dialog.Content, que o Radix trataria como
// interação externa e fecharia o modal, confundindo o cenário.
function RemovedTriggerHarness() {
  const [open, setOpen] = useState(false);
  const [showTrigger, setShowTrigger] = useState(true);
  return (
    <div>
      {showTrigger && (
        <button
          onClick={() => {
            setOpen(true);
            setShowTrigger(false);
          }}
        >
          Abrir e remover
        </button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Título do modal">
        Conteúdo
      </Modal>
    </div>
  );
}

describe('Modal', () => {
  it('não renderiza o dialog quando open=false', () => {
    render(
      <Modal open={false} onClose={() => {}} title="Título">
        Conteúdo do modal
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Conteúdo do modal')).not.toBeInTheDocument();
  });

  it('renderiza título, description, children e footer quando aberto', () => {
    render(
      <Modal
        open
        onClose={() => {}}
        title="Título do modal"
        description="Descrição do modal"
        footer={<button>Ação do footer</button>}
      >
        Conteúdo do modal
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Título do modal')).toBeInTheDocument();
    expect(screen.getByText('Descrição do modal')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo do modal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ação do footer' })).toBeInTheDocument();
  });

  it('funciona sem description, sem criar elemento vazio', () => {
    render(
      <Modal open onClose={() => {}} title="Título sem descrição">
        Conteúdo do modal
      </Modal>,
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Título sem descrição')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo do modal')).toBeInTheDocument();
  });

  it('botão "Fechar" chama onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Título">
        Conteúdo
      </Modal>,
    );
    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Escape chama onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Título">
        Conteúdo
      </Modal>,
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('devolve o foco ao elemento que abriu o modal, ao fechar', async () => {
    const user = userEvent.setup();
    render(<SingleTriggerHarness />);
    const trigger = screen.getByRole('button', { name: 'Abrir' });

    trigger.focus();
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await waitFor(() => expect(trigger).not.toHaveFocus());

    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('fecha sem lançar erro quando o elemento de origem foi removido do DOM', async () => {
    const user = userEvent.setup();
    render(<RemovedTriggerHarness />);

    await user.click(screen.getByRole('button', { name: 'Abrir e remover' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Abrir e remover' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('devolve o foco ao trigger correto entre ciclos de abertura por elementos diferentes', async () => {
    const user = userEvent.setup();
    render(<MultiTriggerHarness />);
    const buttonA = screen.getByRole('button', { name: 'Abrir A' });
    const buttonB = screen.getByRole('button', { name: 'Abrir B' });

    await user.click(buttonA);
    await waitFor(() => expect(buttonA).not.toHaveFocus());
    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(buttonA).toHaveFocus());

    await user.click(buttonB);
    await waitFor(() => expect(buttonB).not.toHaveFocus());
    await user.click(screen.getByRole('button', { name: 'Fechar' }));
    await waitFor(() => expect(buttonB).toHaveFocus());
  });
});
