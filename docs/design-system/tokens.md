# Tokens Visuais — OrçaFlow

> Documento de leitura, complementar a [`audit.md`](./audit.md). Nenhum arquivo de código foi alterado.
> **Atualização (2026-08-19):** após uma revisão crítica da especificação, algumas das decisões pendentes abaixo foram resolvidas em [`../../DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md) — cada item da seção 5 agora indica se está **DECIDIDO** (resolvido, com a decisão registrada) ou **PENDENTE** (continua em aberto). Nada foi resolvido por dedução nova a partir do código — só o que já constava como decisão explícita em `DESIGN_SYSTEM.md`.
> Metodologia: todo valor listado abaixo foi extraído por busca literal (`grep`) em `src/**/*.tsx`, `src/index.css` e `tailwind.config.ts`. Nenhum valor foi adicionado por ser "boa prática" — apenas o que já existe no código está documentado. Onde o Tailwind aplica um valor padrão do framework (não customizado em `tailwind.config.ts`), isso é indicado explicitamente como "escala padrão do Tailwind", para diferenciar do que o projeto de fato configurou.
> Data: 2026-08-18.

---

## 1. Tokens existentes

### 1.1 Cor — configurada em `tailwind.config.ts`

```ts
colors: {
  ink: '#172033',
  navy: '#15284b',
  brand: { 50: '#eef5ff', 100: '#d9e9ff', 500: '#3478f6', 600: '#2164db', 700: '#1a4fae' },
  coral: '#ff725e',
}
```

| Token | Valor | Papel observado no uso |
|---|---|---|
| `ink` | `#172033` | Cor de texto padrão do `<body>` (`index.css:7`, via `text-ink`). Não é usada diretamente em nenhum componente — só no reset base. |
| `navy` | `#15284b` | Cor de marca "escura": fundo da sidebar, fundo do painel de login, títulos serifados (`text-navy`), avatar/ícones sobre fundo claro. |
| `brand.50` | `#eef5ff` | Fundo de ícone/hover claro (`bg-brand-50`? — não encontrado em uso direto; presente só como parte da escala). |
| `brand.100` | `#d9e9ff` | Anel de foco de `.input` (`ring-brand-100`, `index.css:18`). |
| `brand.500` | `#3478f6` | Borda de foco (`focus:border-brand-500`, `.input`) e anel de foco global (`ring-brand-500`, `index.css:9`). |
| `brand.600` | `#2164db` | Cor de ação primária: `.btn-primary` (`bg-brand-600`), links (`text-brand-600`/`text-brand-700`), eyebrows, ícones de destaque. |
| `brand.700` | `#1a4fae` | Hover de `.btn-primary` (`hover:bg-brand-700`), texto de valores monetários/links em estado de destaque forte. |
| `coral` | `#ff725e` | Único acento fora da família azul/navy: ícone do `Logo`, avatar do usuário na sidebar, indicador "Válido até" no detalhe do orçamento. |

### 1.2 Cor — paletas cruas do Tailwind usadas diretamente (não tokenizadas)

Estas famílias **não existem** em `tailwind.config.ts`; são a paleta padrão do Tailwind, usada por convenção copiada célula a célula.

| Família | Tons observados em uso | Papel observado |
|---|---|---|
| `slate` | 50, 100, 200, 300, 400, 500, 600, 700, 800, 950 | Neutro dominante do projeto: texto secundário (`slate-500`/`600`), texto esmaecido (`slate-400`), bordas (`slate-100`/`200`/`300`), fundos de superfície neutra (`slate-50`/`100`), overlay de modal/drawer (`slate-950/40`). `slate-900` **não aparece mais em nenhum uso real** (2026-08-19): era um outlier isolado só no título do `ConfirmModal` legado (`text-slate-900`); com `ConfirmModal` removido e substituído por `ConfirmDialog` (que herda `text-xl font-bold text-navy` de `Modal`), o título consolida em `navy` — não uma perda, uma correção de inconsistência já registrada aqui. |
| `red` | 50, 600, 700 | Erro, exclusão, recusado: `.btn-danger`, `.field-error`, `StatusBadge` (rejected), ícone de alerta do `ConfirmModal`. |
| `emerald` | 50, 300, 500, 600, 700 | Sucesso, aprovado, ativo, WhatsApp: `StatusBadge` (approved), badge "Ativo" em Produtos, barra de conversão do dashboard, botão "Enviar pelo WhatsApp" (override manual do `.btn-primary`). |
| `blue` | 50, 100, 200, 300, 700 | Duplo papel: (a) alias informal de `brand` em vários "icon tiles" e no status "Enviado" do `StatusBadge`; (b) texto sobre fundo escuro (`text-blue-100/200/300` na sidebar e no hero do login). |
| `violet` | 50, 600, 700 | Único uso: KPI "Aguardando retorno" (dashboard) e ícone de "Serviço" (Produtos). |
| `orange` | 200, 300 | `shadow-orange-200` (sombra do ícone do `Logo`) e `text-orange-300` (acentos sobre `bg-navy`/hero do login). Nenhuma cor `bg-orange-*`/`text-orange-*` para superfícies — só sombra e texto de destaque. |
| `white` / `black` / `transparent` | — | `bg-white`/`text-white` (padrão), opacidades (`bg-white/8`, `/10`, `/90`, `border-white/5`), `bg-slate-950/40` (overlay, efetivamente "preto" translúcido), `bg-transparent`/`text-transparent` (hack de select invisível em `QuotesPage.tsx:32`). |

### 1.3 Cor — valores hexadecimais literais fora do `tailwind.config.ts`

| Valor | Onde | Observação |
|---|---|---|
| `#f6f8fb` | `index.css:7` (`bg-[#f6f8fb]`, fundo do `<body>`) | Não tem token nomeado; é o "fundo de app" efetivo, distinto de `white` (cards) e `navy` (sidebar). |
| `#193561` | `LoginPage.tsx:26` (`bg-[#193561]`, painel esquerdo do login) | Tom de azul-marinho próximo mas **diferente** de `navy` (`#15284b`) — não é o mesmo token reaproveitado. |
| `#15284b` | `index.html:6` (`<meta name="theme-color" content="#15284b">`) | Duplicata literal do valor de `navy`, mas escrita à mão no HTML em vez de referenciar o token — se `navy` mudar no futuro, este valor não acompanha automaticamente. |

### 1.4 Background

Nenhum papel de "background" é nomeado como token — são combinações observadas por convenção:

| Papel observado | Classe usada | Onde |
|---|---|---|
| Fundo da aplicação | `bg-[#f6f8fb]` | `index.css` (`body`) |
| Fundo de superfície/card | `bg-white` (via `.card`) | Todos os `section.card` |
| Fundo de marca escura (sidebar, hero) | `bg-navy` | `AdminLayout`, `DashboardPage` (card de valor), `QuoteFormPage` (header do resumo financeiro), `LoginPage` |
| Fundo de marca escura alternativo | `bg-[#193561]` | `LoginPage` (painel esquerdo) — ver 1.3 |
| Overlay de modal/drawer | `bg-slate-950/40` (+ `backdrop-blur-sm` só nos modais, não no drawer) | `ConfirmModal`, modais inline de Clients/Products, overlay do drawer mobile em `AdminLayout` |
| Fundo neutro "chip"/hover sutil | `bg-slate-50`, `bg-slate-100` | Cabeçalho de tabela, campo de credenciais demo no login, fundo de ícone neutro |
| Fundo translúcido sobre navy | `bg-white/8`, `bg-white/10` | Cartão de usuário na sidebar, ícone de calculadora |
| Fundo translúcido sobre branco (header sticky) | `bg-white/90` + `backdrop-blur-xl` | Header do `AdminLayout` |
| Gradiente de destaque | `bg-gradient-to-r from-blue-50 to-white` | Cabeçalho do card "Proposta para" em `QuoteDetailsPage` (único gradiente do projeto) |

### 1.5 Foreground / Texto

| Papel observado | Classe usada | Onde |
|---|---|---|
| Texto padrão do corpo | `text-ink` (`#172033`) | `body` (`index.css`) — não sobrescrito na maioria do conteúdo |
| Título de destaque | `text-navy` + `font-serif` | `PageHeader`, nomes próprios em modais, `quote_number`, "404" |
| Texto secundário | `text-slate-500` / `text-slate-600` | Descrições, valores de tabela, parágrafos de apoio |
| Texto esmaecido / metadado | `text-slate-400` | Labels de ícone, timestamps, placeholders visuais, eyebrows de card |
| Texto forte sobre superfície clara | `text-slate-700` / `text-slate-800` | Nomes em negrito, valores monetários em tabela |
| Texto sobre fundo escuro (primário) | `text-white` | Sidebar, botões primários, headers escuros |
| Texto sobre fundo escuro (secundário) | `text-blue-100` / `text-blue-200` / `text-blue-300` | Sidebar (labels, subtítulos), hero do login |
| Texto de ação/link | `text-brand-600` / `text-brand-700` | Links, "Ver todos", número do orçamento na tabela |
| Texto de erro | `text-red-600` | `.field-error` |
| Placeholder de input | `placeholder:text-slate-400` | `.input` (`index.css:18`) |

### 1.6 Border

| Papel observado | Classe usada | Onde |
|---|---|---|
| Borda padrão global | `border-slate-200` | Reset base (`* { @apply border-slate-200; }`, `index.css:6`) — define a cor default de qualquer `border` sem cor explícita |
| Borda de card | `border border-slate-200/80` | `.card` |
| Borda de divisão interna (header de seção/tabela) | `border-slate-100` | Divisórias entre cabeçalho de card e conteúdo, entre linhas de tabela via `divide-slate-100` |
| Borda de input | `border border-slate-200` | `.input` |
| Borda de input em foco | `focus:border-brand-500` | `.input` |
| Borda de item de proposta (form) | `border border-slate-200` | Card de item em `QuoteFormPage` |
| Borda tracejada (estado vazio de lista de itens) | `border border-dashed border-slate-300` | `QuoteFormPage` (nenhum item adicionado) |
| Borda translúcida sobre navy | `border-white/5`, `border-white/10` | Decoração do hero do login, divisor no card "Valor em oportunidades" |
| Borda de timeline (histórico de status) | `border-4 border-blue-100` | Ponto da linha do tempo em `QuoteDetailsPage` |
| Borda de header sticky | `border-b border-slate-200/70` | `AdminLayout` header |

### 1.7 Estados semânticos (erro / sucesso / alerta / info)

Não há tokens nomeados (`success`, `danger`, `warning`, `info`) em `tailwind.config.ts` — o mapeamento semântico existia, na auditoria original, só por convenção de uso repetida. **Atualização (DECIDIDO em `DESIGN_SYSTEM.md` §6.1):** o vocabulário de `tone` do Design System é oficialmente `neutral`/`brand`/`info`/`success`/`danger`, sem `warning` por ora. A tabela abaixo mantém os dados OBSERVADOS originais, com a resolução DECIDIDA anotada:

| Estado | Cor base | Onde é aplicado | Status |
|---|---|---|---|
| **Erro / destrutivo** (`tone="danger"`) | `red-50/600/700` | `.btn-danger`, `.field-error`, `StatusBadge` (rejected), ícone do `ConfirmModal`, hover de excluir em tabelas, desconto (`text-red-600` em resumos financeiros) | DECIDIDO — mapeado a `tone="danger"` |
| **Sucesso / positivo** (`tone="success"`) | `emerald-50/500/600/700` | `StatusBadge` (approved), badge "Ativo", barra de conversão, `toast.success` (via `sonner`, cor gerida pela lib, não pelo Tailwind do projeto), botão WhatsApp | DECIDIDO — mapeado a `tone="success"` |
| **Alerta** | `red` (reaproveitado do erro) via `AlertTriangle` no `ConfirmModal` | Não existe um tom "amber/yellow" de alerta distinto de erro | DECIDIDO — sem `tone="warning"` nesta etapa; alerta continua usando a cor de erro |
| **Info / neutro-informativo** (`tone="info"`) | `blue-50/700` (StatusBadge "sent") | Ver `DESIGN_SYSTEM.md` §6.1 | DECIDIDO — `info` mapeado à família `blue`, mantido separado de `brand` (não é substituição indiscriminada) |
| **Ação primária / identidade** (`tone="brand"`) | `brand-500/600/700` | `.btn-primary`, links, ícones de destaque | DECIDIDO — mapeado a `tone="brand"`, distinto de `info` |
| **Rascunho / neutro/pendente** (`tone="neutral"`) | `slate-100/600` | `StatusBadge` (draft) | DECIDIDO — mapeado a `tone="neutral"` |

Os toasts (`sonner`, via `toast.success`/`toast.error` em `showApiError`) são o único canal de feedback de erro/sucesso em tempo real; suas cores vêm do tema padrão da biblioteca (`richColors`), não da paleta Tailwind do projeto — ou seja, existe uma segunda fonte de cor semântica (a do `sonner`) que **não está** necessariamente alinhada a `red-600`/`emerald-600` do restante da aplicação.

### 1.8 Tamanhos de fonte (font-size)

Nenhuma escala de `fontSize` foi customizada em `tailwind.config.ts` — todos os valores abaixo são a **escala padrão do Tailwind**, mais 2 valores arbitrários.

| Classe usada | Valor padrão Tailwind | Onde (exemplos) |
|---|---|---|
| `text-[10px]` | arbitrário (fora da escala) | Tagline do `Logo`, badge "Este mês" no dashboard |
| `text-xs` | 12px / leading 16px | Eyebrows, metadados, labels uppercase, `.field-error` |
| `text-sm` | 14px / leading 20px | Corpo de texto padrão da aplicação (tabelas, formulários, descrições) |
| `text-base` | 16px / leading 24px | Único uso: parágrafo do hero de login (`LoginPage.tsx:29`) |
| `text-lg` | 18px / leading 28px | Título do `ConfirmModal`, "Receita aprovada" no dashboard |
| `text-xl` | 20px / leading 28px | Título de modal (Clients/Products), tagline do `Logo` |
| `text-2xl` | 24px / leading 32px | `PageHeader` (mobile), título de modal de detalhe do cliente, resumo financeiro (total) |
| `text-3xl` | 30px / leading 36px | `PageHeader` (desktop), números de KPI do dashboard, título do login |
| `text-5xl` | 48px / leading 1 | Título hero do login |
| `text-8xl` | 96px / leading 1 | "404" |

### 1.9 Pesos de fonte (font-weight)

Nenhuma escala de `fontWeight` customizada. Pesos efetivamente usados no projeto (dos 9 possíveis no Tailwind):

| Classe | Valor | Uso |
|---|---|---|
| `font-medium` | 500 | Itens de navegação, texto de apoio com leve ênfase |
| `font-semibold` | 600 | Peso dominante da aplicação: títulos de card, labels, botões, valores em tabela |
| `font-bold` | 700 | Eyebrows uppercase, números de KPI, títulos de modal, "404" |

`font-normal` (400) nunca é aplicado explicitamente — é o peso herdado do body/Inter por padrão. Pesos 100–300 e 800–900 não são usados em nenhum lugar do projeto (Inter é carregado só nos pesos 400/500/600/700 no `index.html`, então pesos fora disso nem estariam disponíveis).

### 1.10 Line-height

Nenhuma escala de `lineHeight` customizada. Valores encontrados em uso explícito (fora do padrão implícito de cada `text-*`):

| Classe | Valor padrão Tailwind | Onde |
|---|---|---|
| `leading-none` | 1 | `Logo` (nome da marca) |
| `leading-5` | 1.25rem | Nota de credenciais do login, rodapé do resumo financeiro |
| `leading-6` | 1.5rem | Descrição do `ConfirmModal`, observações no detalhe do orçamento e botão WhatsApp |
| `leading-7` | 1.75rem | Parágrafo do hero de login |
| `leading-[1.1]` | arbitrário | Título hero do login (`text-5xl leading-[1.1]`) — único line-height customizado fora da escala padrão |

### 1.11 Letter-spacing / tracking (complementar à tipografia)

Não solicitado explicitamente na lista, mas é parte do mesmo sistema tipográfico e concentra uma das inconsistências mais visíveis do projeto — por isso documentado aqui.

| Classe | Valor | Onde |
|---|---|---|
| `tracking-tight` | -0.025em (padrão Tailwind) | Títulos (`PageHeader`, números de KPI) |
| `tracking-wider` | 0.05em (padrão Tailwind) | Cabeçalhos de tabela (`uppercase`), a maioria dos eyebrows de seção |
| `tracking-[.16em]` | arbitrário | `PageHeader` (eyebrow principal) |
| `tracking-[.18em]` | arbitrário | Tagline do `Logo`, subtítulo "Área segura" do login |
| `tracking-[.2em]` | arbitrário | Label "Navegação" da sidebar |
| `tracking-[.22em]` | arbitrário | Eyebrow do hero do login ("Venda com clareza") |

### 1.12 Espaçamento (padding / margin / gap)

Nenhuma escala de `spacing` customizada em `tailwind.config.ts` — o projeto usa a escala padrão do Tailwind (`0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18(*), 20, 24, 28...`) de forma oportunista, sem um subconjunto reduzido/oficializado. Valores efetivamente observados em uso:

- **Padding/margin unitário:** `0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 9, 10, 12, 14, 16, 28` (ex.: `p-2`, `p-2.5`, `px-3.5`, `py-2.5`, `mt-0.5`, `mt-9`, `px-16`).
- **Gap:** `0.5, 1, 1.5, 2, 3, 4, 5` (`gap-0.5` a `gap-5`).
- **Space between (`space-y-*`):** `0, 1.5, 3, 4, 5`.
- Nenhum valor arbitrário de espaçamento (`p-[Npx]`) foi encontrado — diferente de cor/tamanho, o espaçamento usa exclusivamente a escala padrão do framework.

Alturas mínimas de controle (tratadas como espaçamento/componente):
- `min-h-9` (botão de paginação), `min-h-10` (`.btn` base), `min-h-11` (`.input` base), `min-h-28`/`min-h-32` (textarea).

### 1.13 Border-radius

Nenhuma escala de `borderRadius` customizada. Valores usados (subconjunto pequeno e consistente da escala padrão):

| Classe | Valor padrão Tailwind | Uso |
|---|---|---|
| `rounded-lg` | 0.5rem | Botões de ícone, itens de navegação secundários |
| `rounded-xl` | 0.75rem | Botões (`.btn`), inputs (`.input`), icon tiles (**inclui o avatar de usuário na sidebar** — corrigido: `AdminLayout.tsx:25` usa `rounded-xl`, não `rounded-full`; verificado em código ao implementar `IconTile`, ver `DESIGN_SYSTEM.md` §7.2), itens de navegação ativos |
| `rounded-2xl` | 1rem | Cards (`.card`), modais, `EmptyState` icon tile |
| `rounded-full` | 9999px | Badges/pills, indicador de progresso, ponto da timeline. **Nenhum tile de ícone real é circular** — todos os `rounded-full` da base são pills/badges ou formas decorativas. |
| `rounded-[28px]` | arbitrário | Único caso: card principal do login (`LoginPage.tsx:25`) — não reaproveita `rounded-2xl` nem introduz um novo token nomeado |

### 1.14 Sombras

| Token/classe | Valor | Onde |
|---|---|---|
| `shadow-card` (customizado) | `0 10px 35px rgba(30,58,95,.07)` (`tailwind.config.ts`) | `.card` — único token de sombra nomeado do projeto |
| `shadow-2xl` | padrão Tailwind | Modais, card de login |
| `shadow-lg` | padrão Tailwind | `Logo` (ícone), item de navegação ativo, dropdown de busca de produto |
| `shadow-sm` | padrão Tailwind | `.btn-primary` (`index.css:15`) |
| `shadow-orange-200` | padrão Tailwind (sombra colorida) | `Logo` — único uso de sombra colorida; usa `orange`, não `coral`, apesar do elemento ser `bg-coral` |

### 1.15 Tamanhos de componente

| Componente/elemento | Altura/tamanho | Fonte |
|---|---|---|
| Botão (`.btn`) | `min-h-10` (2.5rem / 40px) | `index.css:14` |
| Input/select/textarea (`.input`) | `min-h-11` (2.75rem / 44px) | `index.css:18` |
| Botão de paginação | `min-h-9` (2.25rem / 36px), `px-3` | `Pagination.tsx:7` |
| Icon tile pequeno | `size-9` (2.25rem) | `Info` helper (`QuoteDetailsPage.tsx:29`) — **DECIDIDO em 2026-08-19**: vira `IconTile size="sm"` |
| Icon tile padrão | `size-10` (2.5rem) | `Logo`, avatar da sidebar, item de proposta, ícone do resumo financeiro, ícone de tipo de produto — **DECIDIDO em 2026-08-19**: vira `IconTile size="md"` (default), o mais frequente (4 ocorrências) |
| Icon tile grande | `size-11` (2.75rem) | KPI cards do dashboard, ícone do `ConfirmModal` — **DECIDIDO em 2026-08-19**: vira `IconTile size="lg"` (3 ocorrências) |
| Icon tile extra grande | `size-12` (3rem) | `EmptyState` — **fora da escala de `IconTile`** (1 ocorrência isolada, radius também diverge: `rounded-2xl`, não `rounded-xl`); sem evidência para uma 4ª faixa |
| Checkbox nativo | `size-4` | Checkbox "Disponível para novos orçamentos" (`ProductsPage.tsx:35`) |
| Ponto da timeline de status | `size-[15px]` (arbitrário) | `QuoteDetailsPage.tsx:24` |
| Formas decorativas (login) | `size-72`, `size-80` | Círculos de fundo do hero — não são componentes de UI, são decoração |
| Header da aplicação | `h-18` **(⚠ ver seção 3.6 — valor fora da escala, não configurado)** | `AdminLayout.tsx:28` |
| Sidebar | `w-[276px]` (arbitrário) | `AdminLayout.tsx:22` |
| Conteúdo principal | `max-w-[1500px]` (arbitrário) | `AdminLayout.tsx:29` |
| Card de login | `max-w-6xl` (padrão) | `LoginPage.tsx:25` |
| Modal padrão | `max-w-md` (`ConfirmModal`), `max-w-2xl` (formulários), `max-w-3xl` (detalhe de cliente) | **DECIDIDO em 2026-08-19** ao implementar `Modal` (`src/design-system/Modal.tsx`): os 3 valores viram a prop `maxWidth?: "md" \| "2xl" \| "3xl"` (nomeada pelo próprio sufixo do Tailwind), default `"2xl"` (maioria, 2/4 modais reais). Ver `DESIGN_SYSTEM.md` §7.2/§14 item 34. |
| Tabela — largura mínima para scroll horizontal | `min-w-[1050px]` (Orçamentos), `min-w-[700px]` (Itens do orçamento), `min-w-full` (Clientes/Produtos/Dashboard) | Inconsistente — só as duas tabelas mais largas fixam um `min-w` em pixels; as demais dependem só de `min-w-full` |

### 1.16 Breakpoints

Nenhum breakpoint customizado em `tailwind.config.ts` — usa a escala padrão do Tailwind:

| Prefixo | Valor padrão | Uso no projeto |
|---|---|---|
| `sm:` | 640px | O mais usado — ajustes de padding, grid de 1→2 colunas, layout de `PageHeader` |
| `md:` | 768px | Único uso: grid de filtros de `QuotesPage` (`md:grid-cols-3`) |
| `lg:` | 1024px | Ponto em que a sidebar deixa de ser drawer e passa a ser fixa (`lg:translate-x-0`, `lg:pl-[276px]`); layout do login (split-screen) |
| `xl:` | 1280px | Grids de dashboard/formulário de orçamento que passam a 2 colunas assimétricas (`xl:grid-cols-[1fr_340px]` etc.) |
| `2xl:` | 1536px | **Não utilizado em nenhum lugar do projeto.** |

### 1.17 Z-index

Nenhuma escala de `zIndex` customizada. Valores usados, em ordem crescente e consistente (sem sobreposição observada):

| Valor | Elemento |
|---|---|
| `z-20` | Header sticky (`AdminLayout`) |
| `z-30` | Overlay do drawer mobile da sidebar (`AdminLayout`) |
| `z-40` | Sidebar/drawer em si (`AdminLayout`) |
| `z-50` | Todos os modais (`ConfirmModal`, modal de cliente, modal de produto) |

A hierarquia é coerente (header < overlay do drawer < drawer < modal), mas existe só por convenção — não há tokens nomeados (`z-header`, `z-drawer`, `z-modal`).

### 1.18 Transições

Nenhuma customização de `transitionDuration`/`transitionTimingFunction`. Apenas a classe utilitária padrão é usada, sempre com a duração/easing default do Tailwind (150ms, `ease` padrão) — nenhum `duration-*` ou `ease-*` explícito foi encontrado em todo o projeto:

| Classe | Onde |
|---|---|
| `transition` (bare) | `.btn` (`index.css:14`), item de navegação (`NavLink`, `AdminLayout.tsx:24`) |
| `transition-transform` | Sidebar/drawer mobile (`AdminLayout.tsx:22`), anima `translate-x-full ↔ translate-x-0` |
| `animate-spin` | Ícone de carregamento (`Loading.tsx:4`) |

Não há transições de `opacity`, `color` ou `background-color` declaradas explicitamente para hover/focus (o navegador aplica a mudança de cor instantaneamente nesses casos, exceto onde `transition` bare já cobre "todas as propriedades animáveis" — caso do `.btn` e do item de navegação).

### 1.19 Estados hover / focus / active / disabled

**Hover** — extensivamente usado, sempre como par `bg-{cor}-50 hover:bg-{cor}-50` mais escuro ou `hover:text-{cor}-600/700`. Não há `duration`/`ease` dedicado (herda de `transition` quando presente, ou é instantâneo).

**Focus** — dois tratamentos **diferentes e não reconciliados** coexistiam no código-fonte original (ver também seção 3.2):
1. Global (`index.css:9`): `button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { @apply outline-none ring-2 ring-brand-500 ring-offset-2; }` — anel de 2px na cor `brand-500`, com offset.
2. `.input` (`index.css:18`): `focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100` — usa o pseudo-seletor `focus:` (não `focus-visible:`), anel na cor `brand-100` (mais claro) e **sem** `ring-offset`.

Como `.input` é aplicado a `input`/`select`/`textarea`, esses elementos recebem *ambas* as regras simultaneamente; qual prevalece depende da especificidade/ordem de cascata do Tailwind (a última classe gerada na folha de estilo "ganha" em empate de especificidade), o que torna o comportamento de foco dos campos de formulário difícil de prever só lendo o JSX. `.btn*`/`<button>`, por não ter uma segunda regra concorrente, sempre recebeu só o tratamento 1 — por isso a implementação de `Button` (abaixo) pôde adotar esse modelo sem mudança de aparência.

**DECIDIDO (2026-08-19, registrado ao implementar `src/design-system/Button.tsx`; revisado na consolidação seguinte):** `:focus-visible` é o **gatilho** oficial do Design System — resolve o item 4 da seção 5, substituindo `:focus` em qualquer controle que hoje o use (ex.: `.input`). Isso **não** significa que a aparência do ring (cor/espessura/offset) precise ser idêntica em todo componente: é uma decisão por categoria.
- `Button` usa a aparência do modelo 1 (`ring-brand-500`, `ring-offset-2`) — já aplicada explicitamente em suas próprias classes, não depende só do seletor global `button:focus-visible`.
- `Input`/`Select`/`Textarea` (**implementados** em `src/design-system/`) usam `focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-100`, sem offset — a mesma aparência que `.input` já tinha sob `:focus`, só com o gatilho migrado.
- `Checkbox` (**implementado**) usa `ring-2 ring-brand-500 ring-offset-2` — a aparência do `Button`, não a de `Input`/`Select`/`Textarea`. Diferente de `.input`, o checkbox nunca teve uma segunda regra de foco própria para reconciliar: só herdava a regra global (`index.css:9`), então essa aparência foi tornada explícita, não escolhida por comparação entre dois modelos concorrentes.

`.input`/`index.css` **não foram alterados** — os consumidores atuais (não migrados) continuam usando `:focus` via `.input`; só os componentes novos (`Input`, `Select`, `Textarea`, `Checkbox`) usam `:focus-visible`.

**Active** — nenhuma classe `active:` foi encontrada em todo o projeto. Não há feedback visual dedicado de "pressionado" além do que o navegador aplica nativamente.

**Disabled** — um único ponto de definição: `.btn { ... disabled:pointer-events-none disabled:opacity-50; }` (`index.css:14`). Usado via atributo `disabled={isSubmitting}`/`disabled={busy}`/`disabled={value.page <= 1}` em botões de submit, paginação e ações assíncronas. Inputs/selects não têm nenhum estilo `disabled:` próprio (não há campo desabilitado em uso no projeto hoje).

**Caso especial sem estado de foco visível próprio**: o `<select>` transparente sobreposto ao `StatusBadge` em `QuotesPage.tsx:32` (`className="w-7 cursor-pointer bg-transparent text-transparent outline-none"`) remove o outline nativo (`outline-none`) sem o substituir — o anel de foco global (`focus-visible`) ainda deveria disparar por herança do seletor de tag, mas fica visualmente confuso sobre um elemento sem texto/contraste próprio.

### 1.20 Padrões de responsividade

Não há um sistema formal "mobile-first com N pontos de parada" documentado — o padrão observado é:

- **Sidebar**: `fixed` fora da tela (`-translate-x-full`) por padrão, drawer controlado por estado React abaixo de `lg:`; fixa e sempre visível (`lg:translate-x-0`) a partir de `lg:` (1024px). Conteúdo principal ganha `lg:pl-[276px]` no mesmo breakpoint.
- **Grids de página** (KPIs, formulário de orçamento, filtros): 1 coluna por padrão → `sm:grid-cols-2` (a maioria) → `xl:grid-cols-4` ou `xl:grid-cols-[...]` assimétrico (dashboard, `QuoteFormPage`, `QuoteDetailsPage`). `QuotesPage` é a exceção que usa `md:grid-cols-3 xl:grid-cols-6` para a barra de filtros (6 colunas, mais granular que o resto do projeto).
- **Tabelas**: nunca colapsam para "cards" em mobile — permanecem como `<table>` dentro de `overflow-x-auto`, exigindo scroll horizontal em telas pequenas. Duas tabelas (Orçamentos, Itens do orçamento) fixam `min-w` em pixel para forçar o scroll cedo; as demais dependem do conteúdo.
- **Tipografia responsiva**: só o par `text-2xl sm:text-3xl` do `PageHeader` muda de tamanho por breakpoint; todo o resto do texto é fixo entre tamanhos de tela.
- **Padding de layout**: `p-4 sm:p-7 lg:p-9` (conteúdo principal) e `px-4 sm:px-7` (header) — os únicos lugares com 3 níveis de responsividade; a maioria dos outros componentes usa no máximo `p-X sm:p-Y` (2 níveis).

---

## 2. Tokens duplicados

Casos em que **mais de um valor literal** cobre o mesmo papel semântico:

| Papel semântico | Valores concorrentes | Onde |
|---|---|---|
| Tracking de "eyebrow"/label uppercase | `.16em`, `.18em`, `.2em`, `.22em` (+ `tracking-wider` = `.05em` como base de cabeçalho de tabela) | `PageHeader`, `Logo`, `AdminLayout`, `LoginPage` (×2) |
| Azul-marinho de marca | `navy` (`#15284b`, token) vs. `#193561` (literal, só no login) vs. `#15284b` repetido literalmente no `index.html` (`theme-color`) | `tailwind.config.ts`, `LoginPage.tsx:26`, `index.html:6` |
| "Ação primária" azul | `brand-600/700` (token) vs. `blue-*` cru usado com o mesmo papel visual em vários icon tiles e no status "Enviado" | Em quase toda página com tabela |
| Sombra do ícone de marca | `shadow-card` (token, para cards) vs. `shadow-lg` vs. `shadow-orange-200` (cor da sombra não corresponde à cor do elemento, que é `coral`) | `.card`, `Logo`, itens de navegação |
| Botão de sucesso | `.btn-primary` sobrescrito manualmente com `bg-emerald-600 hover:bg-emerald-700` em vez de existir uma variante própria | `QuoteDetailsPage.tsx:24` |
| Padding de card | `p-5`, `p-6`, `p-5 sm:p-6` para o mesmo papel ("padding interno de `.card`") | **Auditoria completa em 2026-08-20** (17 ocorrências reais de `.card`, `DESIGN_SYSTEM.md` §7.1/§14 item 46): `p-5` em `DashboardPage` (KPIs) e 3 seções da aside de `QuoteDetailsPage`; `p-6` em `DashboardPage` (revenue/conversion) e `QuoteDetailsPage` (Observações); `p-5 sm:p-6` em 3 seções de `QuoteFormPage` — sem maioria entre os três. **7 dos 17 casos (41%) não têm padding algum no elemento `.card`** (`ClientsPage`/`ProductsPage`/`QuotesPage`, `DashboardPage` "Orçamentos recentes", `QuoteDetailsPage` ×2, `QuoteFormPage` "Resumo financeiro") — padding fica só em cabeçalho/corpo/rodapé internos. **DECIDIDO: não resolvido "para um valor vencer" — `Surface` fica sem padding estrutural, ver item 7 abaixo.** |
| Padding de célula de tabela | `px-5 py-3/4` (Clients/Products/Quotes) vs. `px-6 py-3/4` (Dashboard, QuoteDetails) | Mesma função, dois valores — **não resolvido globalmente**; `px-5 py-3`/`px-5 py-4` é o default de `TableHead`/`TableCell` (`src/design-system/Table.tsx`, 2026-08-19) por ser o padrão majoritário (3 de 5 tabelas), não uma decisão final sobre qual valor é "correto" — `Dashboard`/`QuoteDetails` (migradas em 2026-08-19) aplicam `px-6` via `className`, override confirmado determinístico (`DESIGN_SYSTEM.md` §14 itens 32/33) |
| Hover de linha de tabela | `hover:bg-slate-50/60` vs. `hover:bg-slate-50/70` vs. nenhum | `ClientsPage`/`ProductsPage`/`QuotesPage` usam `/60`; `DashboardPage` usa `/70`; **`QuoteDetailsPage` não tem hover algum**, confirmado na migração real de 2026-08-19. `TableRow` (`src/design-system/Table.tsx`) não tem classe de hover própria — cada consumidor aplica via `className`; com os 5 casos reais migrados, isso é **DECIDIDO** como comportamento definitivo (não uma pendência a resolver depois), ver `DESIGN_SYSTEM.md` §14 item 33 |
| Top do ícone dentro de input com busca | `top-3` vs. `top-3.5` | Comparado entre campos de busca de páginas diferentes — **DECIDIDO em 2026-08-19**: `top-3` (5 de 5 usos reais de busca/filtro: `ClientsPage`, `ProductsPage`, `QuotesPage`, `QuoteFormPage`) é o padrão de `SearchInput`; `top-3.5` era exclusivo do `LoginPage` (e-mail/senha), um caso de composição diferente, fora do escopo de `SearchInput` |
| Padding-left de input com ícone | `pl-10` vs. `pl-11` | Idem — **DECIDIDO em 2026-08-19**: `pl-10` é o padrão de `SearchInput`, pelo mesmo levantamento; `pl-11` continua exclusivo do `LoginPage`, não normalizado por esta implementação |
| Foco de campo de formulário | Regra global (`focus-visible`, `ring-brand-500`, com offset) **e** regra de `.input` (`focus`, `ring-brand-100`, sem offset) aplicadas ao mesmo elemento | `index.css:9` vs. `index.css:18` — **DECIDIDO em 2026-08-19**: o gatilho `focus-visible` vence (a aparência de `.input` pode ser mantida, só trocando o gatilho); migração ainda não feita (ver §5, item 4) |

---

## 3. Tokens inconsistentes

Diferente da seção 2 (mesmo papel, valores diferentes), aqui estão casos em que o valor usado **quebra uma convenção que o próprio projeto estabelece em outro lugar**, ou é logicamente contraditório.

### 3.1 `h-18` não corresponde a nenhum token válido
`AdminLayout.tsx:28` define o header como `h-18`. A escala de espaçamento padrão do Tailwind **não inclui `18`** (ela pula de `16` para `20`), e `tailwind.config.ts` não estende `theme.spacing`/`theme.height`. Isso significa que, com a configuração atual, `h-18` **não gera nenhuma regra CSS** — a altura do header fica indefinida por essa classe (depende só do conteúdo interno). Se o efeito visual observado hoje é uma altura consistente, ela vem do padding/conteúdo interno do header, não da classe `h-18`. Isso é uma inconsistência entre intenção (nome da classe sugere altura fixa de 18 = 4.5rem/72px) e efeito real.

### 3.2 Dois modelos de foco coexistindo no mesmo elemento
Ver seção 1.19 — `focus-visible` global (`ring-brand-500`, com `ring-offset-2`) e `focus` de `.input` (`ring-brand-100`, sem offset) se sobrepõem em todo `input`/`select`/`textarea`. Não é um problema de "dois valores para o mesmo papel" (seção 2) — é uma contradição de *modelo* (`:focus` vs. `:focus-visible` têm gatilhos diferentes: `:focus` dispara em clique do mouse, `:focus-visible` normalmente não). O comportamento visual de foco de um `<input>` pode variar dependendo de como o usuário chegou até ele (teclado vs. mouse).

**DECIDIDO (2026-08-19):** o gatilho `:focus-visible` é o oficial, substituindo `:focus` (ver §1.19/§5 item 4). A aparência exata (`ring-brand-500`+offset como em `Button`, ou `border-brand-500`+halo mais leve como hoje em `.input`) é decidida por categoria de componente, não precisa ser a mesma em todo lugar. `input`/`select`/`textarea` continuam com a contradição de gatilho descrita acima até que `Input`/`Select`/`Textarea`/`Checkbox` sejam implementados no Design System — essa seção permanece como registro histórico do problema em `.input`, que ainda não foi tocado.

### 3.3 `blue` vs. `brand` sem regra declarada
Não fica claro, ao ler o código, se `blue-*` é um alias intencional e estável de `brand-*` para um subconjunto de usos, ou um desvio acidental de quem escreveu cada tela. Evidência de que pode ser acidental: o mesmo padrão "icon tile de ação" usa `bg-blue-50 text-brand-600` (mistura as duas famílias no mesmo elemento) em `ClientsPage`, `ProductsPage` e `QuotesPage` — ou seja, fundo de uma paleta e texto/ícone de outra, na mesma peça, repetidas vezes.

### 3.4 Sombra colorida não corresponde à cor do elemento
`Logo.tsx:5`: `bg-coral ... shadow-lg shadow-orange-200`. O elemento é `coral` (`#ff725e`), mas a sombra colorida usa a paleta `orange` do Tailwind, não uma sombra derivada de `coral`. Não é tecnicamente "errado" (as cores são próximas), mas indica que não existe um token de sombra semântica para o acento de marca.

### 3.5 `outline-none` sem substituto em elemento interativo
`QuotesPage.tsx:32` remove o outline nativo do `<select>` de troca rápida de status (`outline-none`) sem redefinir um estado de foco próprio; o elemento já é `text-transparent`/`bg-transparent` por design (sobreposto ao badge), então o anel de foco global, mesmo se disparar, tem pouquíssimo contraste ali.

### 3.6 Densidade de espaçamento sem regra de quando usar cada nível
Como listado na seção 2, `p-5` vs `p-6`, `px-5` vs `px-6` não seguem um critério visível (não é "modal usa X, página usa Y" de forma estável — `ClientsPage` usa os dois padrões em telas diferentes da mesma página).

### 3.7 Cor de fundo do corpo fora da paleta nomeada, mas cores próximas são nomeadas
`ink` e `navy` são tokens nomeados no config; o fundo geral da aplicação (`#f6f8fb`), que é tão estrutural quanto os dois, é um valor arbitrário solto em `index.css`. Não há critério aparente de "o que vira token nomeado" vs. "o que fica solto".

---

## 4. Tokens candidatos a serem oficializados

Baseado exclusivamente em uso já consistente e repetido (sem introduzir valores novos). **Atualização:** o vocabulário de tons semânticos (`neutral`/`brand`/`info`/`success`/`danger`) já não é mais "candidato" — está DECIDIDO em `DESIGN_SYSTEM.md` §6.1, com o mapeamento de cor de cada um detalhado em §1.7 acima.

| Candidato a token | Valor a oficializar (já em uso) | Evidência de maturidade |
|---|---|---|
| `shadow.card` | `0 10px 35px rgba(30,58,95,.07)` | Já é token nomeado (`tailwind.config.ts`), único e usado sem concorrência. |
| `radius.md` / `.lg` / `.full` | `rounded-xl` (0.75rem), `rounded-2xl` (1rem), `rounded-full` | Escala pequena, usada de forma consistente em toda a aplicação (só 1 exceção arbitrária: `rounded-[28px]` no login). |
| `color.surface` | `white` (cards/modais) | Uso 100% consistente. |
| `color.surface-muted` | `slate-50`/`slate-100` | Papel consistente de "fundo neutro secundário" (cabeçalho de tabela, chips). |
| `color.border-default` | `slate-200` | Já é o default global via reset (`index.css:6`). |
| `color.border-subtle` | `slate-100` | Uso consistente para divisórias internas. |
| `color.text-muted` | `slate-400` | Papel muito consistente ("metadado/apoio"). |
| `color.text-secondary` | `slate-500`/`slate-600` | Consistente, ainda que dividido em dois tons (candidato a decidir qual dos dois vira o token — ver seção 5). |
| `color.brand-*` (50/100/500/600/700) | já configurado | Manter como está; é o token mais maduro da paleta. |
| `color.accent` (coral) | `#ff725e` | Já configurado e usado de forma restrita/intencional (destaque único). |
| `spacing.control-height-sm/md` | `min-h-9` (36px), `min-h-10` (40px), `min-h-11` (44px) | Escala pequena e já coerente entre paginação/botão/input. |
| `z.header` / `z.drawer-overlay` / `z.drawer` / `z.modal` | `20 / 30 / 40 / 50` | Hierarquia já consistente, só falta nomear. |
| `font.heading` (serif) / `font.body` (sans) | Lora / Inter | Papéis bem definidos e nunca invertidos. |
| `fontWeight.emphasis` | `semibold` (600) | Peso dominante de toda ênfase textual do projeto (título de card, valor, label). |
| `tracking.eyebrow` | **precisa de decisão de qual dos 4 valores vira o oficial** — ver seção 5 | Papel claríssimo (eyebrow/uppercase label), valor não. |
| `breakpoint.*` | `sm/md/lg/xl` padrão do Tailwind (640/768/1024/1280) | Nenhuma customização necessária — os breakpoints padrão já cobrem todos os usos reais do projeto. |
| Componente `Badge`/`Pill` — geometria | `rounded-full px-2.5 py-1 text-xs font-semibold` | Repetido de forma idêntica em `StatusBadge`, badge Ativo/Inativo e badge "Este mês"; só a cor muda. |
| Componente `IconTile` — geometria | `grid place-items-center rounded-xl` + tamanho (`size-9/10/11/12`) | Padrão estrutural idêntico em 7+ lugares (ver `audit.md` seção 4.5). |

---

## 5. Tokens que precisam de decisão antes da implementação

Casos em que os dados encontrados **não indicam sozinhos** qual valor deve virar o token oficial — exigem uma escolha de produto/design antes de qualquer implementação:

1. **PENDENTE — `h-18` no header (`AdminLayout.tsx:28`)** — precisa decisão: a altura pretendida do header é 4.5rem/72px (mais próximo de `h-16`=64px ou `h-20`=80px na escala padrão), ou o valor deve virar um `theme.height` customizado de `4.5rem`? Hoje a classe não faz efeito algum; qualquer padronização do DS precisa primeiro decidir a altura real desejada. Reintroduzido explicitamente em `DESIGN_SYSTEM.md` §15 após ter sido descartado por engano numa consolidação anterior.
2. **DECIDIDO — `blue-*` e `brand-*` permanecem separados** (`DESIGN_SYSTEM.md` §6.1). `brand` representa ação/identidade primária; `blue` passa a ser o token semântico `color.info` (informação/estado neutro-informativo), sem substituição indiscriminada de um pelo outro. Fica ressalvado que `text-blue-100/200/300` como texto sobre fundo escuro (sidebar, hero do login) é um uso à parte, não é `tone="info"`.
3. **PENDENTE — Qual tracking vira `eyebrow`?** — `.16em`, `.18em`, `.2em` ou `.22em`. Nenhum dos quatro é objetivamente "mais usado" (cada um aparece 1–2 vezes); é uma escolha de design, não uma extração.
4. **DECIDIDO E IMPLEMENTADO (`Button` em 2026-08-19; `Input`/`Select`/`Textarea`/`Checkbox` em 2026-08-19) — Gatilho de foco unificado, aparência por categoria.** `:focus-visible` é o gatilho oficial do Design System (era o modelo 1 de §1.19; o gatilho `:focus` do modelo 2, de `.input`, é descartado nos componentes novos). A **aparência** do foco não é forçada a ser idêntica em todo componente: `Button` e `Checkbox` usam `ring-2 ring-brand-500 ring-offset-2`; `Input`/`Select`/`Textarea` usam `border-brand-500` + halo mais leve (`ring-2 ring-brand-100`, sem offset) — mesma aparência que `.input` já tinha sob `:focus`, só com o gatilho migrado. Todos os cinco componentes primitivos hoje implementados (`Button`, `Input`, `Select`, `Textarea`, `Checkbox`) já aplicam esse modelo. `.input` em `index.css` **não foi alterado** — os consumidores existentes (não migrados) continuam com o gatilho `:focus` antigo até serem migrados para os novos componentes.
5. **PENDENTE — `navy` (#15284b) vs. `#193561` do login** — decidir se o painel de login deve migrar para `navy` (consolidando 1 token) ou se o produto realmente quer dois tons de azul-marinho distintos. Ambos os casos são legítimos, mas exigem decisão explícita, não dedução do código.
6. **PENDENTE — `slate-500` vs. `slate-600` como "texto secundário" oficial** — os dois convivem para o mesmo papel; a escolha de qual vira `color.text-secondary` precisa ser decidida.
7. ~~**PENDENTE — Padding padrão de `Card`/`Surface`**~~ — **RESOLVIDO em 2026-08-20** (auditoria completa, `DESIGN_SYSTEM.md` §7.1/§14 item 46, §2 acima). **DECIDIDO: `Surface` não tem padding estrutural** — nenhum dos três valores (`p-5`/`p-6`/`p-5 sm:p-6`) tem maioria real entre os 10/17 casos onde padding está no elemento `.card`, e 7/17 casos (41%) não têm padding algum ali (fica em cabeçalho/corpo/rodapé internos, onde um default seria ativamente contraproducente, não neutro). Padding continua responsabilidade do consumidor via `className`, sem exceção a justificar — não é mais uma decisão do componente.
8. **DECIDIDO — sem tom de "alerta" (`warning`) por ora** (`DESIGN_SYSTEM.md` §6.1). Não há identidade visual distinta observada para esse estado hoje — `ConfirmModal` usa vermelho tanto para o ícone de aviso quanto para a ação destrutiva, e isso não muda nesta rodada. Reavaliar se/quando o produto precisar distinguir "atenção" de "destrutivo" visualmente.
9. **DECIDIDO — sem dark mode nesta etapa** (`DESIGN_SYSTEM.md` §12). Tokens de cor continuam como valores fixos do `tailwind.config.ts`, não CSS custom properties. Decisão explícita, não omissão — revisitar a modelagem de tokens se dark mode for necessário no futuro.
10. **PENDENTE — `shadow-orange-200` vs. uma sombra derivada de `coral`** — decidir se o token de sombra do acento de marca deve ser recalculado a partir de `coral` ou se `orange-200` deve virar o valor oficial mesmo não correspondendo exatamente à cor do elemento.
11. **PENDENTE — Uso de `2xl:` (1536px)** — o projeto nunca usa esse breakpoint. Decidir se deve ser formalmente removido da escala do DS ou mantido "reservado" para telas muito largas (ex.: `max-w-[1500px]` do conteúdo principal).
12. **DECIDIDO em 2026-08-19 — sem largura mínima padrão no componente `Table` do DS.** `min-w` fixo em pixel (`min-w-[1050px] w-full` em `QuotesPage`, `min-w-[700px] w-full` em `QuoteDetailsPage`) vs. `min-w-full` (`ClientsPage`/`ProductsPage`/`DashboardPage`) — com os 5 casos reais migrados para `Table` (`src/design-system/Table.tsx`), confirma-se que não há um valor dominante o bastante para virar default: cada consumidor continua declarando a largura via `className` na `<table>`. Ver `DESIGN_SYSTEM.md` §7.2/§14 item 33.
13. **DECIDIDO em 2026-08-19 — alinhamento de colunas numéricas permanece responsabilidade do consumidor, sem prop dedicada em `Table`.** Confirmado no código migrado: `ProductsPage.tsx` não usa `text-right` na coluna de preço (preservado assim de propósito); `QuoteDetailsPage.tsx` usa `className="text-right"` em `TableHead`/`TableCell` de quantidade/unitário/total; `ClientsPage`/`ProductsPage`/`QuotesPage` também usam `text-right`, mas na coluna "Ações" (alinhamento de botões, não de valor numérico). Os dois propósitos distintos do mesmo utilitário são, por si só, evidência contra uma prop `numeric`/`align`/`isNumeric` — inferiria semântica errada em pelo menos um caso real. Ver `DESIGN_SYSTEM.md` §7.2/§14 item 33.
