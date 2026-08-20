import * as Dialog from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { useRef } from 'react';

// Auditados os 4 modais reais (ConfirmModal, formulário de ClientsPage,
// formulário de ProductsPage, detalhe de cliente em ClientsPage) antes de
// definir esta API. Estrutura 100% recorrente (base): `fixed inset-0 z-50` +
// `bg-slate-950/40 backdrop-blur-sm` no overlay; `rounded-2xl bg-white p-6
// shadow-2xl` no container; botão de fechar `rounded-lg p-2 text-slate-400
// hover:bg-slate-100` no canto superior direito do cabeçalho.
//
// O que varia (largura, presença de description, footer) fica em `maxWidth`/
// `description?`/`footer?` — ver comentários de cada um abaixo.
export type ModalMaxWidth = 'md' | '2xl' | '3xl';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  // Obrigatório, não `title?`: nos 4 modais reais, todo uso sempre tem um
  // título visível — não há precedente de modal sem nome acessível. Exigir
  // `title` evita que seja fácil criar um `Modal` sem `Dialog.Title`, sem
  // precisar inventar um fallback visualmente oculto sem caso de uso real.
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: ModalMaxWidth;
  className?: string;
}

// Mapeia 1:1 os 3 únicos valores de largura com precedente real nos 4
// modais auditados — nomeados pelo próprio sufixo do Tailwind (não por uma
// escala semântica sm/md/lg/xl sem lastro nos dados):
// `max-w-md` (ex-`ConfirmModal`, hoje `ConfirmDialog`), `max-w-2xl`
// (formulário de ClientsPage/ProductsPage — 2/4, maioria, default aqui),
// `max-w-3xl` (detalhe de cliente). Todos os 4 casos reais estão migrados.
// Nenhum `sm`/`lg`/`xl` — sem nenhum uso real com essas larguras.
const maxWidthClasses: Record<ModalMaxWidth, string> = {
  md: 'max-w-md',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
};

export function Modal({ open, onClose, title, description, children, footer, maxWidth = '2xl', className }: ModalProps) {
  // Retorno de foco sem `Dialog.Trigger`: o Radix só restaura foco
  // automaticamente para `context.triggerRef`, que só existe quando o
  // consumidor usa `<Dialog.Trigger>` — inviável aqui, já que os 4 modais
  // reais abrem a partir de múltiplos botões diferentes (ex.: "Novo
  // cliente" + "Editar" por linha em `ClientsPage`), sem um gatilho único.
  // Verificado no código-fonte instalado: o `onCloseAutoFocus` interno do
  // `Dialog` sempre chama `preventDefault()` (mesmo sem trigger), o que
  // também cancela o fallback nativo do `FocusScope` — por isso a captura e
  // a restauração precisam ser feitas aqui, manualmente, mas só dentro do
  // fluxo já previsto pelo Radix para isso (`onCloseAutoFocus`), nunca por
  // fora dele.
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  // Captura em fase de render (não em `useEffect`), de propósito: o
  // `useEffect` de foco automático do `FocusScope` (dentro de
  // `Dialog.Content`, um descendente) roda ANTES do `useEffect` deste
  // componente (ancestral) — React dispara efeitos de filhos antes dos de
  // pais — então, se a captura fosse feita em `useEffect`, o foco já
  // teria sido movido para dentro do próprio Modal (tipicamente o botão de
  // fechar) antes da captura rodar, capturando o conteúdo do Modal em vez
  // do elemento de origem. Capturar em render, na transição
  // `closed → open`, acontece antes de qualquer commit/efeito, quando
  // `document.activeElement` ainda é, garantidamente, o elemento que abriu
  // o modal. Mutar um ref durante o render (sem afetar o JSX retornado) é
  // seguro e não dispara re-render; guardado por `wasOpenRef` para não
  // recapturar a cada render enquanto `open` permanecer `true`.
  if (open && !wasOpenRef.current && typeof document !== 'undefined') {
    const activeElement = document.activeElement;
    previouslyFocusedElementRef.current = activeElement instanceof HTMLElement ? activeElement : null;
  }
  wasOpenRef.current = open;

  // Único ponto de restauração — roda no fluxo padrão do Radix para foco
  // ao fechar (`onCloseAutoFocus`), disparado igualmente por X, Escape,
  // clique no overlay, ou fechamento programático via `onClose`/`open`, já
  // que todos eles só diferem em COMO `open` vira `false`, nunca no que
  // acontece depois. `event.preventDefault()` só é chamado quando há um
  // elemento válido para restaurar — caso contrário, o comportamento
  // padrão do Radix segue (no-op sem trigger, inofensivo).
  const restoreFocus = (event: Event) => {
    const element = previouslyFocusedElementRef.current;
    previouslyFocusedElementRef.current = null;
    if (element?.isConnected) {
      event.preventDefault();
      element.focus();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <Dialog.Portal>
        {/* Overlay é quem centraliza e rola — reproduz literalmente o wrapper
            dos 2 modais de formulário auditados (`grid place-items-center
            overflow-y-auto`), o padrão mais recorrente (2/4) e o único que já
            resolvia corretamente conteúdo maior que a viewport. Aninhar
            `Dialog.Content` dentro de `Dialog.Overlay` foi verificado no
            código-fonte instalado (`@radix-ui/react-dialog` 1.1.23) como
            padrão explicitamente suportado (comentário "ie. when Overlay and
            Content are siblings" no `DialogOverlayImpl` indica que o próprio
            pacote prevê os dois casos) e preserva a detecção nativa de clique
            fora do Radix: o clique no overlay tem como alvo um nó que não é
            descendente de `Content`, então continua sendo tratado como
            "fora" e fecha o diálogo — verificado lendo
            `@radix-ui/react-dismissable-layer`, não assumido. */}
        <Dialog.Overlay className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm">
          <Dialog.Content
            className={clsx('my-6 w-full rounded-2xl bg-white p-6 shadow-2xl', maxWidthClasses[maxWidth], className)}
            onCloseAutoFocus={restoreFocus}
          >
            <div className="flex items-center justify-between">
              <div>
                <Dialog.Title className="text-xl font-bold text-navy">{title}</Dialog.Title>
                {description && (
                  <Dialog.Description className="mt-1 text-sm text-slate-500">{description}</Dialog.Description>
                )}
              </div>
              <Dialog.Close className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Fechar">
                <X />
              </Dialog.Close>
            </div>
            {children}
            {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
