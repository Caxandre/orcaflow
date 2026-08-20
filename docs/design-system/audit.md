# Auditoria de Front-end — OrçaFlow

> Documento de leitura. Nenhum arquivo de código foi alterado para produzir esta auditoria.
> Escopo: aplicação inteira em `src/`, configs de build (`tailwind.config.ts`, `postcss.config.js`, `index.html`) e `package.json`.
> Data da auditoria: 2026-08-18.

## 0. Visão geral do projeto

"OrçaFlow" é um CRM de orçamentos/propostas comerciais (React 19 + TypeScript + Vite + React Router 7 + Tailwind CSS 3.4 + react-hook-form/zod + axios + sonner + lucide-react).

O projeto é **pequeno e denso**: 25 arquivos-fonte, sem `src/assets` (não existe pasta de assets — ícones vêm 100% de `lucide-react`, fontes vêm do Google Fonts via `<link>` no `index.html`). Não há Storybook, nenhuma pasta `ui/`, nenhum sistema de componentes primitivos (sem Radix, sem shadcn/ui) — tudo é HTML+Tailwind escrito à mão, página a página.

Estilo de código: JSX extremamente compacto, muitas vezes uma página inteira em uma única linha de `return`. Isso é uma decisão consciente de estilo, mas tem custo direto para a extração de um Design System (ver seção 9).

Estrutura atual:
```
src/
  components/   Logo, PageHeader, StatusBadge, Loading, EmptyState, ConfirmModal, Pagination
  layouts/      AdminLayout
  routes/       ProtectedRoute
  pages/        LoginPage, DashboardPage, ClientsPage, ProductsPage, QuotesPage, QuoteFormPage, QuoteDetailsPage, NotFoundPage
  contexts/     AuthContext
  hooks/        useAuth
  services/     api.ts (axios + interceptors + showApiError)
  utils/        format.ts (moeda, data, telefone, link do WhatsApp)
  types/        index.ts (todos os tipos de domínio)
  index.css     tokens @layer base/components do Tailwind
```

---

## 1. Padrões visuais existentes

### 1.1 Layout de página (todas as páginas autenticadas)
Todo conteúdo autenticado segue o mesmo esqueleto, montado manualmente em cada página em vez de um componente compartilhado além do `PageHeader`:

- `PageHeader` (eyebrow + título serifado + descrição + ação à direita) — usado em `DashboardPage`, `ClientsPage`, `ProductsPage`, `QuotesPage`, `QuoteFormPage`, `QuoteDetailsPage`.
- Um ou mais `<section className="card ...">` como contêiner de conteúdo.
- Barra de filtros/busca dentro do card, separada por `border-b border-slate-100`.
- Tabela responsiva (`overflow-x-auto` + `<table className="min-w-full text-left text-sm">`).
- Estado vazio (`EmptyState`) e estado de carregamento (`Loading`) intercalados por condicional ternária no lugar da tabela.
- `Pagination` no rodapé do card.

### 1.2 Casca da aplicação (`AdminLayout.tsx`)
Sidebar fixa azul-marinho (`bg-navy`) com `Logo`, navegação (`NavLink`) e rodapé com avatar/usuário/logout; conteúdo principal com header sticky translúcido (`backdrop-blur-xl`) e `<main className="mx-auto max-w-[1500px] p-4 sm:p-7 lg:p-9">`. Sidebar colapsa para drawer em telas `< lg` com overlay (`fixed inset-0 z-30 bg-slate-950/40`) — mesmo padrão de overlay reaproveitado nos modais.

### 1.3 Modais
Três instâncias de modal, todas reimplementando o mesmo shell (`fixed inset-0 z-50 ... bg-slate-950/40 backdrop-blur-sm` → `rounded-2xl bg-white p-6 shadow-2xl`):
- `ConfirmModal` (componente reutilizável, único modal genuinamente compartilhado).
- Modal de formulário de cliente, inline em `ClientsPage.tsx` (linha 43).
- Modal de visualização de cliente, inline em `ClientsPage.tsx` (linha 44).
- Modal de formulário de produto, inline em `ProductsPage.tsx` (linha 35).

Não existe componente `Modal`/`Dialog` genérico — cada tela reescreve o overlay, o container, o botão de fechar (`X`) e o cabeçalho.

### 1.4 Formulários
Todos os formulários usam `react-hook-form` + `zodResolver` + o mesmo vocabulário de classes (`label`, `input`, `field-error`, grid `sm:grid-cols-2`). Padrão de campo repetido de duas formas diferentes (ver seção 4 — duplicação):
- `Field` (helper local, só em `ClientsPage.tsx:49`).
- `<label>` inline com `<span className="label">` + `{errors...}` (em `ProductsPage`, `QuoteFormPage`).

### 1.5 Tabelas
Quatro tabelas de dados (Dashboard, Clients, Products, Quotes, QuoteDetails = 5), todas com o mesmo padrão: `thead` com `bg-slate-50` + `text-xs uppercase tracking-wider text-slate-400`, `tbody` com `divide-y divide-slate-100`, linhas com `hover:bg-slate-50/60` ou `/70`. Ações à direita como grupo de ícones (`rounded-lg p-2 text-slate-500 hover:bg-{cor}-50 hover:text-{cor}-600`).

### 1.6 Botões
Três variantes fixas via `@layer components` (`.btn-primary`, `.btn-secondary`, `.btn-danger`), todas reaproveitando `.btn`. Bem consolidado — é o token mais maduro do projeto. Exceções pontuais: botão de ícone "fechar" do modal, botão de ícone de ação em tabela e o botão "Enviar pelo WhatsApp" que sobrescreve a cor do `.btn-primary` com classes ad-hoc (`bg-emerald-600 hover:bg-emerald-700`, em `QuoteDetailsPage.tsx:24`) em vez de existir uma variante `.btn-success`.

### 1.7 Badges / status
`StatusBadge` cobre o enum `QuoteStatus` (draft/sent/approved/rejected) com cor + ícone + label em pt-BR. Mas o mesmo conceito é reimplementado sem componente em pelo menos dois lugares: badge de "Ativo/Inativo" em `ProductsPage.tsx:33` e badge de tipo produto/serviço (ícone colorido) na mesma tabela.

### 1.8 Cards de métricas (dashboard)
Padrão "ícone com fundo colorido em quadrado arredondado + número grande + label" repetido 4x no grid de KPIs (`DashboardPage.tsx:26`) e reaproveitado parcialmente nos cards de "Valor em oportunidades" e "Taxa de aprovação" (mesma seção, com variações: fundo escuro, barra de progresso).

---

## 2. Tokens visuais implícitos

Hoje os tokens vivem em três lugares diferentes e não são nomeados como tokens semânticos — são valores Tailwind reaproveitados por convenção de cópia-e-cola.

### 2.1 Cor (`tailwind.config.ts`)
| Token atual | Valor | Uso observado |
|---|---|---|
| `ink` | `#172033` | cor de texto padrão do `body` |
| `navy` | `#15284b` | sidebar, títulos serifados (`text-navy`), fundo de login, `theme-color` do `index.html` |
| `brand.50/100/500/600/700` | azul (`#eef5ff`→`#1a4fae`) | cor primária de ação, foco de inputs, links, ícones de destaque |
| `coral` | `#ff725e` | acento único (logo, avatar do usuário, indicador de "validade" no detalhe do orçamento) |

Cores **fora** da paleta nomeada, usadas diretamente como utilitário Tailwind cru (não tokenizadas, mas com significado semântico implícito e consistente):
- `slate-*` — texto secundário, bordas, fundos neutros (uso mais frequente do projeto).
- `emerald-*` — sucesso / aprovado / status ativo / receita aprovada.
- `red-*` — erro / recusado / exclusão / desconto.
- `blue-*` — enviado / links / ícones informativos (distinto de `brand`, mesma família visual — potencial inconsistência, ver seção 5).
- `violet-*` — "aguardando retorno" no dashboard e ícone de serviço em Produtos.
- `orange-*` — detalhes no hero do login e acentos sobre `bg-navy`.
- Cores literais fora da paleta Tailwind: `bg-[#f6f8fb]` (fundo da app, `index.css:7`), `bg-[#193561]` (painel do login, `LoginPage.tsx:26`) — ambas variações não nomeadas de `navy`/fundo neutro.

### 2.2 Tipografia
- `font-sans` = Inter (padrão do corpo).
- `font-serif` = Lora, peso 600 (carregado só nesse peso via Google Fonts) — usada exclusivamente para títulos de destaque (`h1`/`h2` de `PageHeader`, nome do cliente em modais, `quote_number`, título do login, "404").
- Escala de tamanho observada, sem nomeação: `text-8xl` (404), `text-5xl`/`text-3xl` (hero de login), `text-2xl`/`text-3xl` (PageHeader responsivo), `text-xl` (modais), `text-lg` (ConfirmModal), `text-sm` (padrão de corpo/tabela), `text-xs` (metadados, eyebrows, uppercase labels), `text-[10px]` (tagline do logo, badge "Este mês").
- Padrão "eyebrow": `text-xs font-bold uppercase tracking-[.16em]` (ou `.18em`, `.2em`, `.22em` — 4 valores de tracking diferentes para o mesmo padrão visual, ver seção 5).

### 2.3 Espaçamento e raio
- Raio: `rounded-xl` (inputs, botões, ícones em quadrado) e `rounded-2xl` (cards, modais) — consistente. `rounded-full` para badges/pills/avatar. `rounded-[28px]` único e literal no card de login (`LoginPage.tsx:25`).
- Padding de card: `p-5`/`p-6` alternam sem regra clara entre telas (ex.: `ClientsPage` modais usam `p-6`, `DashboardPage` cards usam `p-5`, `QuoteFormPage` seções usam `p-5 sm:p-6`).
- Alturas mínimas de controle: `min-h-10` (`.btn`), `min-h-11` (`.input`) — 4px de diferença intencional (botão vs. input), mas não documentada.

### 2.4 Sombra
- `shadow-card` (token custom: `0 10px 35px rgba(30,58,95,.07)`) — usada só via classe `.card`.
- `shadow-2xl` (Tailwind padrão) — modais e card de login.
- `shadow-lg`/`shadow-sm` avulsos — logo, nav ativo, botão primário.

### 2.5 Ícones
100% `lucide-react`, tamanhos usados inconsistentemente como número mágico por local: `13`, `14`, `15`, `16`, `17`, `18`, `19`, `20`, `21` px — nunca reaproveitando uma escala fixa (ver seção 5).

---

## 3. Componentes reutilizáveis (já extraídos)

| Componente | Arquivo | Reuso real | Qualidade para virar peça de DS |
|---|---|---|---|
| `Logo` | `components/Logo.tsx` | AdminLayout, LoginPage | Boa — já aceita prop `compact`. |
| `PageHeader` | `components/PageHeader.tsx` | 6 páginas | Muito boa — API limpa (`eyebrow/title/description/action`). |
| `StatusBadge` | `components/StatusBadge.tsx` | QuotesPage, QuoteDetailsPage, DashboardPage, ClientsPage (histórico) | Boa como padrão, mas acoplada ao enum `QuoteStatus` (é domínio, não é genérica — ver seção 8). |
| `Loading` | `components/Loading.tsx` | 5 páginas + ProtectedRoute | Boa — genérica, só depende de `label`. |
| `EmptyState` | `components/EmptyState.tsx` | 4 páginas | Boa — genérica. |
| `ConfirmModal` | `components/ConfirmModal.tsx` | ClientsPage, ProductsPage, QuotesPage | Boa base para um `Dialog`/`AlertDialog` de DS, mas hoje é só o caso "confirmar exclusão" (título/descrição fixos ao redor de um `AlertTriangle`, texto do botão hardcoded "Confirmar exclusão"). |
| `Pagination` | `components/Pagination.tsx` | ClientsPage, ProductsPage, QuotesPage | Boa, genérica, mas o texto "registros" está hardcoded em português — vale parametrizar. |

Nenhum desses componentes usa `clsx` (que está no `package.json:16` como dependência mas **não é referenciado em nenhum arquivo `src/`** — dependência morta) nem `class-variance-authority` ou padrão equivalente de variantes tipadas.

---

## 4. Componentes duplicados ou semelhantes (candidatos a consolidação)

1. **Shell de modal** — reimplementado 4x com o mesmo overlay/container/close-button:
   - `ConfirmModal.tsx` (componente).
   - Modal de form de cliente — `ClientsPage.tsx:43`.
   - Modal de detalhe de cliente — `ClientsPage.tsx:44`.
   - Modal de form de produto — `ProductsPage.tsx:35`.
   → Candidato natural a um `Modal`/`Dialog` de DS com slots de header/body/footer.

2. **Wrapper de campo de formulário** — dois padrões distintos para a mesma coisa (label + control + erro):
   - Helper `Field` local em `ClientsPage.tsx:49` (`<label><span className="label">...</span>{children}{error...}</label>`).
   - Inline repetido manualmente em `ProductsPage.tsx` e `QuoteFormPage.tsx` (mesma estrutura, sem componente).
   → Um único `FormField`/`Field` de DS eliminaria a duplicação e padronizaria o `htmlFor`/`id` (hoje só o formulário de login usa `id`+`htmlFor` corretamente; os demais formulários não amarram `label` a `input` via atributo, apenas aninhamento).

3. **Input com ícone à esquerda** — padrão `relative` + `<Icon className="absolute left-3.5 top-3(.5) text-slate-400" />` + `input.pl-10/pl-11` repetido em: busca de clientes, busca de produtos, busca de orçamentos, busca de cliente/produto no form de orçamento, campos de data do filtro de orçamentos, email/senha do login. Pequenas variações de `top-3` vs `top-3.5` e `pl-10` vs `pl-11` — não é um único componente, é convenção copiada.

4. **Botão de ação de ícone em tabela** (editar/excluir/visualizar/duplicar/pdf/whatsapp) — `rounded-lg p-2 text-slate-500 hover:bg-{cor}-50 hover:text-{cor}-600` repetido em `ClientsPage`, `ProductsPage`, `QuotesPage`. Nunca extraído como `IconButton`.

5. **Card de métrica com ícone colorido em quadrado arredondado** (`grid size-N place-items-center rounded-xl {bg} {text}`) — usado em: cards do dashboard, avatar do usuário na sidebar (`AdminLayout.tsx:25`, circular no lugar de quadrado), ícones de contato no modal de cliente, ícone de tipo produto/serviço, ícone de calculadora no resumo financeiro, `Info` (helper local de `QuoteDetailsPage.tsx:29`). É essencialmente o mesmo primitivo "icon tile" reaproveitado 7+ vezes com tamanhos (`size-9` a `size-12`) e paletas diferentes, nunca componentizado.

6. **Badge/pill de status textual** — `StatusBadge` (orçamento) vs. badge inline de "Ativo/Inativo" (`ProductsPage.tsx:33`) vs. badge "Este mês" no dashboard (`DashboardPage.tsx:26`). Visualmente são a mesma peça (`rounded-full px-2.5 py-1 text-xs font-semibold` + cor semântica), mas só uma tem componente.

7. **`Info`/par ícone-label-valor** — helper local só em `QuoteDetailsPage.tsx:29`, mas o mesmo padrão (ícone em tile + label pequeno + valor) é remontado manualmente no modal de detalhe do cliente (`ClientsPage.tsx:44`, usando `.map` sobre um array `[[Icon, text], ...]` tipado como `unknown` com cast `as typeof Mail` — solução frágil e não tipada de forma segura).

8. **Cabeçalho de card/section** (`<h2 className="font-semibold text-navy">` + `<p className="... text-slate-500">` opcional, dentro de `flex items-center justify-between`) — repetido em praticamente toda `section.card`, nunca virou subcomponente (`CardHeader`).

---

## 5. Inconsistências visuais

1. **Tracking de "eyebrow" text** varia sem motivo aparente: `.16em` (`PageHeader`), `.18em` (tagline do Logo, subtítulo do login), `.2em` (label "Navegação" da sidebar), `.22em` (hero do login). Mesma função visual, 4 valores diferentes.
2. **Tamanho de ícone (`lucide-react`)** não segue escala: valores de 13 a 21px espalhados sem relação com o tamanho do texto ao lado. Não há uma tabela `sm/md/lg` de ícone.
3. **Duas famílias de azul convivendo**: `brand-*` (paleta nomeada) e `blue-*` (Tailwind cru) são usadas lado a lado para papéis semelhantes — ex. `text-brand-600` para links de ação vs. `bg-blue-50 text-blue-700` para o status "Enviado" e para vários "icon tiles". Não fica claro se `blue` é um alias intencional de `brand` ou um desvio.
4. **Overlay de modal/drawer**: `bg-slate-950/40` é consistente, mas só alguns usam `backdrop-blur-sm` (modais) enquanto o overlay do drawer mobile da sidebar não usa blur (`AdminLayout.tsx:21`).
5. **Padding interno de card** inconsistente entre `p-5`, `p-6` e `p-5 sm:p-6` sem regra visível de quando usar qual.
6. **Botão de sucesso ad-hoc**: `QuoteDetailsPage.tsx:24` sobrescreve `.btn-primary` com `bg-emerald-600 hover:bg-emerald-700` diretamente na instância, em vez de existir `.btn-success`. É a única ocorrência desse padrão no projeto — sinal de que faltou um token.
7. **Label/`htmlFor` acessível inconsistente**: `LoginPage` usa `id`+`htmlFor` corretamente; `ClientsPage`, `ProductsPage` e `QuoteFormPage` usam `<label>` envolvendo o controle sem `id` explícito (funciona por aninhamento, mas quebra o padrão e dificulta testar/estilizar labels de forma consistente).
8. **Select "disfarçado"** em `QuotesPage.tsx:32` (`<select className="w-7 cursor-pointer bg-transparent text-transparent outline-none">` sobreposto ao `StatusBadge` para trocar status inline) — é um hack funcional, mas visualmente é um controle invisível sem foco visível próprio (o anel de foco global do projeto, definido em `index.css:9`, ainda dispara, porém sobre um elemento sem contraste, o que pode confundir usuários de teclado).
9. **Densidade de tabela** varia: padding de célula `px-5 py-4` (Clients/Products/Quotes) vs. `px-6 py-4` (Dashboard, QuoteDetails) — mesma função, dois valores.
10. **Uso de `hover:bg-slate-50/60` vs `/70` vs `/70` só no thead** — variação mínima e provavelmente não intencional entre tabelas.
11. **Dependência `clsx` instalada e não utilizada** — indica que em algum momento se cogitou compor classes condicionalmente e a prática não se firmou (hoje classes condicionais são feitas com template strings/ternário inline, ex. `StatusBadge`, `NavLink` className function, badge ativo/inativo).
12. **Cor de fundo da aplicação hardcoded** (`bg-[#f6f8fb]`) em vez de token Tailwind nomeado, enquanto cores próximas (`navy`, `ink`) são tokens — inconsistência de onde "vale a pena" nomear uma cor.

---

## 6. Padrões de UX

- **Feedback de ação**: toda mutação (criar/editar/excluir/mudar status/gerar PDF) dispara `toast.success`/`showApiError` via `sonner`, nunca alerta nativo — padrão consistente e bom para o DS herdar como "padrão único de feedback assíncrono".
- **Confirmação destrutiva**: toda exclusão passa por `ConfirmModal` antes de chamar a API — padrão consistente em Clients/Products/Quotes.
- **Estado vazio vs. carregando vs. populado**: toda listagem segue a mesma máquina de estados ternária `loading ? <Loading/> : items.length === 0 ? <EmptyState/> : <table/>` — padrão de UX bem estabelecido, mas reimplementado por página em vez de um componente `DataState`/`AsyncSection` wrapper.
- **Busca com debounce ausente**: todos os campos de busca (`ClientsPage`, `ProductsPage`, `QuotesPage`) disparam requisição a cada tecla via `useEffect` reagindo a `search`/`filters` — não há debounce. É uma decisão técnica (não visual), mas afeta a percepção de performance/UX de forma transversal a todas as telas com filtro, então vale registrar para quando o DS ganhar um componente `SearchInput` padrão.
- **Reset de página ao filtrar**: toda mudança de filtro chama `setPage(1)` — padrão consistente.
- **Ações irreversíveis avisam do vínculo de domínio na própria mensagem de confirmação** (ex.: "Clientes com orçamentos vinculados não podem ser excluídos" em `ClientsPage.tsx:45`) — é uma boa prática de UX, mas é conteúdo de domínio dentro de um componente genérico (`ConfirmModal`) via prop `description`; certifique-se de que o DS mantenha esse componente "burro" (só renderiza o texto que recebe).
- **Navegação inline em vez de nova página** para "visualizar" (clientes) vs. rota própria para "ver detalhes" (orçamentos) — inconsistência de padrão de UX: `ClientsPage` abre modal para ver detalhe do cliente; `QuotesPage` navega para `QuoteDetailsPage`. Pode ser intencional (cliente é mais simples que orçamento), mas vale confirmar se é decisão de produto ou acidente de implementação antes de definir o padrão "ver detalhes" do DS.
- **Compartilhamento via WhatsApp** é um fluxo de UX transversal (`QuotesPage`, `QuoteDetailsPage`) com geração de link (`utils/format.ts:whatsAppUrl`) — específico de domínio, não deve virar componente de DS (ver seção 8), mas o *padrão* "ação primária + ação secundária de compartilhar" no card de detalhe pode inspirar um slot genérico de "ações de card".
- **Formulário sempre em modal para entidades simples (Cliente, Produto)** vs. **formulário em página inteira para entidade complexa (Orçamento)** — padrão de UX razoável (complexidade do formulário dita o container), vale documentar como regra do DS: "modais para formulários de até N campos; página dedicada para formulários com itens dinâmicos/`useFieldArray`".
- **Senha com toggle mostrar/ocultar** só existe no login — não há reuso porque não há outro campo de senha na aplicação; ainda assim, é um padrão de input candidato ao DS (`PasswordInput`).
- **Placeholder de credenciais de demonstração pré-preenchido** no login (`defaultValues` com email/senha reais, `LoginPage.tsx:18`) e exibido na tela (`LoginPage.tsx:39`) — é comportamento de ambiente de desenvolvimento vazando para o componente de produto; não é um padrão de UX a ser replicado no DS, é um ponto de atenção de produto/segurança fora do escopo desta auditoria visual.

---

## 7. Componentes que deveriam fazer parte do Design System

Candidatos claros — genéricos, sem conhecimento de domínio (orçamento/cliente/produto), reaproveitáveis em qualquer produto:

- **Button** — formalizar `.btn`/`.btn-primary`/`.btn-secondary`/`.btn-danger` como componente `<Button variant="primary|secondary|danger|success|ghost">` (adicionando a variante "success" que hoje é ad-hoc) + variante `iconOnly` para os botões de ação em tabela.
- **Input / Textarea / Select** — formalizar a classe `.input` (já compartilhada por `input`, `select`, `textarea`) como componentes de fato, com suporte nativo a ícone à esquerda (elimina a duplicação da seção 4.3) e a estado de erro.
- **Field/FormField** — wrapper label + control + mensagem de erro (unifica `Field` de `ClientsPage` com os inlines de `ProductsPage`/`QuoteFormPage`), garantindo `htmlFor`/`id` consistentes.
- **Card** — já existe como classe `.card`; formalizar como componente com slots opcionais de header/footer para absorver o padrão "título + subtítulo + ação" repetido em toda `section.card`.
- **Modal/Dialog** — generalizar o shell hoje espalhado em `ConfirmModal` + 3 modais inline (seção 4.1) num componente único com header/body/footer/close configuráveis; `ConfirmModal`/`AlertDialog` vira um caso de uso construído sobre ele.
- **IconButton** — botão quadrado de ícone com estado hover colorido (usado nas tabelas e no close de modal).
- **Badge/Pill** — componente genérico de "pílula colorida com texto", parametrizado por tom semântico (`neutral/info/success/danger/warning`), do qual `StatusBadge` (domínio) e o badge Ativo/Inativo (domínio) passam a ser consumidores.
- **IconTile** — "ícone dentro de quadrado/círculo arredondado com fundo de cor semântica e tamanho parametrizável" (elimina a duplicação nº5 da seção 4).
- **EmptyState** — já existe, só precisa ser promovido como está.
- **Loading/Spinner** — já existe, só precisa ser promovido como está.
- **Pagination** — já existe; ao promover, extrair o texto "registros" como prop/i18n.
- **PageHeader** — já existe, é o componente mais maduro do projeto; promover como está.
- **Table primitives** — `Table`, `Thead`, `Tr`, `Th`, `Td` (ou wrapper único `DataTable`) para eliminar a repetição de `bg-slate-50 text-xs uppercase tracking-wider text-slate-400` / `divide-y divide-slate-100` / `hover:bg-slate-50/60` em cada página.
- **SearchInput** — input com ícone de lupa embutido, reaproveitado 6x.
- **Toast wiring** — o par `sonner` + `showApiError` já é, de fato, o "componente" de feedback do sistema; formalizar como parte do DS (tokens de cor de toast, posição, ícones) mesmo sem mudar a biblioteca.
- **Tokens de design** (cor, tipografia, espaçamento, raio, sombra, tamanhos de ícone) — o pré-requisito de tudo acima; hoje vivem implícitos em `tailwind.config.ts` + `index.css` + convenção copiada célula a célula (ver seção 2).

---

## 8. Componentes específicos de domínio (NÃO devem entrar no Design System)

- **`StatusBadge`** (na forma atual) — está acoplado ao enum `QuoteStatus` e a rótulos em pt-BR de negócio ("Rascunho/Enviado/Aprovado/Recusado"). Deve permanecer na camada de aplicação como consumidor do `Badge` genérico do DS (passando tom + label + ícone por fora), não migrar como está.
- **Toda a lógica e UI de `QuoteFormPage`** — seletor de cliente/produto do catálogo, cálculo de subtotal/desconto/total, `useFieldArray` de itens — é o núcleo do domínio "orçamento" e não tem equivalente genérico.
- **`utils/format.ts`** — `formatMoney` (BRL específico), `phoneDigits`/`whatsAppUrl` (regra de negócio de compartilhamento) são utilitários de domínio/localização, não peças visuais de DS (ainda que `formatDate`/`formatMoney` possam inspirar um pacote de formatação compartilhado, não são "componentes").
- **`AdminLayout` (conteúdo)** — a navegação (`Dashboard/Clientes/Produtos/Orçamentos`) é específica do produto; o *padrão estrutural* (sidebar + header + drawer mobile) pode virar um template de DS, mas o array `navigation` e os rótulos não.
- **`Logo`** — identidade de marca do produto "OrçaFlow" (nome, tagline, ícone `FileCheck2`, cor coral) não é um átomo de DS reaproveitável entre produtos; no máximo o *slot* "AppLogo" é do DS, o conteúdo é do produto.
- **`LoginPage`** (conteúdo do painel esquerdo: copy de marketing, lista de benefícios) — é conteúdo de marca/produto; a estrutura de split-screen de autenticação pode virar template, o texto não.
- **`AuthContext`/`useAuth`/`ProtectedRoute`/`services/api.ts`** — são infraestrutura de aplicação (autenticação, HTTP), não UI. Fora do escopo de um Design System visual.
- **Modais de formulário de Cliente e Produto** (conteúdo dos campos) — os *campos* (nome, e-mail, telefone, empresa, observações / nome, tipo, preço, descrição, ativo) são domínio; apenas o *shell* de modal e os *primitivos* de campo usados dentro deles pertencem ao DS.
- **`QuoteDetailsPage`, `DashboardPage` (conteúdo dos cards de KPI)** — os textos, ícones semânticos por métrica de negócio e a lógica de conversão (`Math.round((approved/total)*100)`) são de domínio; o *padrão visual* "KPI card" (ícone + número grande + label) é do DS, os dados não.

Regra geral para orientar futuras decisões: **se o componente conhece um tipo do domínio (`Quote`, `Client`, `Product`, `QuoteStatus`) ou contém copy/regra de negócio em português específica do produto, ele fica na aplicação; se ele só recebe primitivos (string/number/bool/ReactNode/enum genérico de "tom") e não importa nada de `src/types`, ele é candidato ao DS.**

---

## 9. Dependências e decisões técnicas relevantes

- **Tailwind CSS 3.4** (não v4) com config em TypeScript (`tailwind.config.ts`) — tokens hoje vivem só em `theme.extend`; qualquer DS baseado em tokens deve decidir se continua estendendo esse arquivo ou migra para CSS variables (necessário se o DS precisar de theming em runtime/dark mode, que **não existe hoje** — não há nenhuma variante `dark:` em todo o código-fonte).
- **`@layer components` em `index.css`** já funciona como um mini design system utilitário (`.card`, `.btn*`, `.input`, `.label`, `.field-error`) — é o ponto de partida natural para extrair tokens/classes-base antes de criar componentes React equivalentes.
- **`react-hook-form` + `zod` + `@hookform/resolvers`** — padrão de formulário fixado no projeto todo; qualquer componente de formulário do DS deve ser compatível com `register`/`Controller` (via `forwardRef`) para não forçar reescrita das páginas.
- **`sonner`** é a única biblioteca de feedback (toast); não há biblioteca de modal/overlay (Radix, Headless UI) — os modais são HTML puro. Ao criar um `Dialog` de DS, decidir entre continuar sem dependência (replicar acessibilidade manualmente — hoje o `role="dialog"`/`aria-modal` só existe em `ConfirmModal.tsx:5`, os outros 3 modais **não têm** esses atributos) ou adotar uma lib headless para focus-trap/`Esc`/`aria-*` corretos.
- **`lucide-react`** é a única fonte de ícones — bom sinal para o DS (não há mistura de bibliotecas de ícone), mas os tamanhos não são padronizados (seção 5.2) e nenhum ícone é re-exportado/abstraído — cada tela importa direto de `lucide-react`.
- **`clsx` está no `package.json` mas não é usado em nenhum arquivo `src/`** — dependência morta; se o DS adotar composição condicional de classes (recomendado para variantes de `Button`/`Badge`), reaproveitar essa dependência já instalada em vez de adicionar nova.
- **Sem `class-variance-authority`/`tailwind-variants`** — variantes hoje são se/então manual (ex. `StatusBadge`, `NavLink`). Para um DS com várias variantes por componente (Button, Badge, Input), vale avaliar adicionar uma lib de variantes tipada, dado que o projeto já usa TypeScript de ponta a ponta.
- **JSX extremamente compacto (uma linha por componente/página)** é a decisão de estilo mais impactante para a migração: o CSS Tailwind está totalmente entrelaçado com o markup e a lógica, sem nenhuma indireção. Extrair componentes de DS exigirá reescrever/quebrar essas páginas, não apenas "puxar para fora" — não há atalho de refactor puramente mecânico.
- **Sem testes** (não há `*.test.*`/`*.spec.*` nem framework de teste no `package.json`) e **sem Storybook/Chromatic** — não existe hoje nenhuma superfície de documentação viva ou de regressão visual; qualquer DS novo precisará trazer sua própria (Storybook, Ladle, ou os próprios artifacts) do zero.
- **Fontes**: carregadas via `<link>` do Google Fonts no `index.html` (Inter 400/500/600/700, Lora 600 apenas) — não são self-hosted. Se o DS for extraído como pacote consumido por outro app, essa dependência de rede/CDN precisa ser decidida (embutir fontes vs. manter link externo).
- **Sem `src/assets`** — não há SVGs, imagens ou fontes locais no repositório; todo o visual é CSS + ícones de componente. Isso simplifica a extração de um DS (não há assets binários para migrar), mas também significa que não há hoje nenhuma ilustração/imagem de marca a preservar além do favicon (não verificado nesta auditoria — fora do escopo de `src/`).
- **Variáveis de ambiente**: `VITE_API_URL` (`.env.example`) — decisão de infraestrutura, não visual; mencionado aqui só porque `services/api.ts` é o único ponto de configuração externa do frontend.

---

## 10. Oportunidades de consolidação (resumo acionável)

Ordenado por impacto estimado (nº de ocorrências eliminadas) × risco de mudança:

1. **Extrair `Modal`/`Dialog` genérico** — remove 4 implementações divergentes de shell de modal (seção 4.1), corrige a falta de `role="dialog"`/`aria-modal` em 3 delas.
2. **Extrair `FormField`** — unifica `Field` (Clients) com os inlines de Products/QuoteForm (seção 4.2), corrige a falta de `id`/`htmlFor` consistente.
3. **Extrair `IconTile`** — resolve a duplicação mais frequente do projeto (7+ ocorrências, seção 4.5).
4. **Extrair `IconButton`** de ação de tabela — 3 páginas, mesmo padrão exato.
5. **Formalizar `Badge`/`Pill` genérico** e reescrever `StatusBadge` + badge Ativo/Inativo como consumidores dele.
6. **Extrair `SearchInput`** (input com ícone) — 6 ocorrências, padroniza `top-3` vs `top-3.5` / `pl-10` vs `pl-11`.
7. **Extrair primitivos de `Table`** (ou `DataTable`) — 5 tabelas com o mesmo `thead`/`tbody`/hover, elimina drift de `px-5` vs `px-6` e `/60` vs `/70`.
8. **Nomear tokens que hoje são "quase-tokens"**: unificar `tracking-[.16/.18/.2/.22em]` em um único token `eyebrow`/`tracking-wide-label`; decidir se `blue-*` deve ser substituído por `brand-*` nos usos "de ação" (mantendo `blue` só para o papel semântico "informativo/enviado", se essa for a intenção); nomear `#f6f8fb` e `#193561` como tokens (`bg-app`, `navy-deep`, por exemplo) em vez de valores arbitrários.
9. **Adicionar variante `success` ao `Button`** para eliminar o `.btn-primary` sobrescrito manualmente em `QuoteDetailsPage.tsx:24`.
10. **Padronizar escala de tamanho de ícone** (ex.: `sm=14 md=16/17 lg=20/21`) e migrar os usos hoje "soltos" (13–21px) para a escala.
11. **Remover dependência morta `clsx`** do `package.json` — ou passar a usá-la como utilitário oficial de composição de classes do novo DS (recomendado, dado que já está instalada).
12. **Padronizar padding de card** (`p-5` vs `p-6` vs `p-5 sm:p-6`) em um único valor responsivo default, com override explícito só onde houver justificativa.

---

## Anexo — inventário de arquivos por camada

| Camada | Arquivos | Observação |
|---|---|---|
| Config/build | `tailwind.config.ts`, `postcss.config.js`, `index.html`, `package.json` | Sem `dark:`, sem plugins Tailwind além do padrão. |
| Estilos globais | `src/index.css` | Único lugar com `@layer base`/`@layer components`; é o "design system 0" atual. |
| Componentes reutilizáveis | `src/components/*.tsx` (7 arquivos) | Ver seção 3. |
| Layout | `src/layouts/AdminLayout.tsx` | Único layout da aplicação. |
| Rotas | `src/routes/ProtectedRoute.tsx`, `src/App.tsx` | Roteamento simples, sem lazy loading, sem layouts aninhados além de Admin. |
| Páginas | `src/pages/*.tsx` (8 arquivos) | Concentram ~80% do CSS/markup do projeto; nenhuma quebra em subcomponentes de arquivo próprio (exceção: helpers locais `Field`/`Info` no fim de `ClientsPage.tsx`/`QuoteDetailsPage.tsx`). |
| Domínio/infra | `src/types`, `src/services`, `src/utils`, `src/contexts`, `src/hooks` | Fora do escopo visual, mas mapeado para orientar a separação DS vs. domínio (seção 8). |
| Assets | — | Pasta inexistente; não há imagens/SVGs versionados. |
