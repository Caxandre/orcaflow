import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button';
import { IconTile } from './IconTile';
import { Modal } from './Modal';

// Auditado o `ConfirmModal` legado (src/components/ConfirmModal.tsx) e seus
// 3 consumidores reais (ClientsPage, ProductsPage, QuotesPage) antes de
// definir esta API. Nenhum dos 3 varia `maxWidth` (sempre `max-w-md`) nem o
// texto de "Cancelar"/"Confirmar exclusão"/"Excluindo..." (sempre idêntico
// nos 3 pontos de uso) — por isso `maxWidth` não é exposto como prop (fica
// fixo em "md" dentro do componente) e `confirmLabel`/`cancelLabel` viram
// props com default igual ao texto atual: reduz o acoplamento a "exclusão"
// sem aumentar complexidade, já que nenhum consumidor real precisa passar
// nada hoje. `busy` é preservado (parte da API legada), mas nenhum dos 3
// consumidores reais chama com `busy=true` hoje — o texto de estado
// ("Excluindo...") continua fixo, sem prop dedicada (`loadingText`), porque
// não varia em nenhum uso real; se um caso não-exclusão real aparecer no
// futuro, essa decisão pode ser revisitada com evidência.
export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void | Promise<void>;
}

// Estrutura do legado não mapeia 1:1 para os slots de `Modal`: o ícone de
// alerta ficava numa linha própria ao lado do botão de fechar, com
// título/descrição como parágrafos de largura total *fora* dessa linha —
// mas `Modal` só tem uma linha de cabeçalho (título+descrição de um lado,
// `X` do outro) e não tem slot para um terceiro elemento nela. `title`/
// `description` usam os slots nativos de `Modal` (primeira validação real
// de `description` combinada com um `IconTile` no corpo); o `IconTile`
// (equivalência exata com o tile do legado: `size-11`/`rounded-xl`/
// `bg-red-50 text-red-600`, ver `IconTile.tsx`) vai para o início de
// `children`, a única posição possível sem alterar `Modal.tsx` — divergência
// estrutural real e documentada, não uma tentativa de reproduzir a posição
// exata do legado. Ver `DESIGN_SYSTEM.md` §7.2 para o detalhe completo.
export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = 'Confirmar exclusão',
  cancelLabel = 'Cancelar',
  busy = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{cancelLabel}</Button>
          <Button variant="danger" disabled={busy} onClick={onConfirm}>{busy ? 'Excluindo...' : confirmLabel}</Button>
        </>
      }
    >
      <IconTile tone="danger" size="lg" icon={<AlertTriangle />} className="mt-6" />
    </Modal>
  );
}
