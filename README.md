# Mini Trello — Membro 1 (Gutemberg)

Base da aplicação em Vite, React e TypeScript. Esta entrega cobre somente infraestrutura, estado global, roteamento, Navbar, Sidebar responsiva e temas claro/escuro.

## Executar

Requer Node.js 20.19+ ou 22.12+ compatível com Vite 7.

```sh
npm install
npm run dev
```

```sh
npm run build
npm test
npm run preview
```

## Estrutura e rotas

- `src/components/AppShell.tsx`: layout compartilhado, menu responsivo e alternância de tema.
- `src/contexts/ThemeContext.tsx`: tema global, persistido em `mini-trello:theme`. A primeira visita respeita o tema do sistema.
- `src/contexts/AppContext.tsx`: leitura inicial e escrita do estado em `mini-trello:state`.
- `src/types/state.ts`: contrato versionado e reducer do estado global.
- `src/App.tsx`: `/` redireciona para `/inicio`; `/projetos`, `/projetos/:projectId` e `/usuarios` são pontos de integração. Há uma página 404 para endereços desconhecidos.
- `src/pages/Pages.tsx`: apresentação da base e placeholders explícitos, sem dados de projetos fictícios.

Em hospedagem estática, configure fallback de todas as rotas para `index.html` para permitir acesso direto às rotas do BrowserRouter.

## Integração dos módulos

O estado usa `{ version: 1, data: Record<string, unknown> }`. Cada responsável define e valida os tipos de seu módulo. Valores devem ser serializáveis em JSON. Use chaves distintas por módulo para preservar os demais dados:

```tsx
import { useApp } from './contexts/AppContext';

const { state, dispatch, storageError } = useApp();
// Dentro de um handler do módulo, após validar os próprios dados:
dispatch({ type: 'SET_SLICE', key: 'projects', value: projects });
// Remover apenas os dados de um módulo:
dispatch({ type: 'REMOVE_SLICE', key: 'projects' });
```

Leia `state.data.projects` como `unknown` e valide o formato no módulo antes de usá-lo. O reducer atualiza o estado de forma imutável. A gravação acontece após as atualizações do React. A interface exibe erros de leitura/gravação e mantém as alterações em memória quando o armazenamento falha. Dados ilegíveis não são sobrescritos na inicialização; uma alteração explícita de estado passa a salvar o novo estado. A persistência depende da origem e do navegador, sem backend.

`useTheme()` expõe `theme`, `toggleTheme` e `themeError`. Novos componentes devem usar as variáveis CSS de `src/styles.css` (`--bg`, `--panel`, `--text`, `--muted`, `--line`, `--accent`, `--soft`) para acompanhar o tema.

## Membro 5 (Pedro): detalhes, comentários e histórico

- `src/types/details.ts`: tipos `Comment` e `Activity`, validadores (`readComments`, `readActivities`) e funções puras do módulo. As slices usadas são `comments` e `activities`, relacionadas ao cartão por `cardId`.
- `src/contexts/CardDetailsContext.tsx`: `useCardDetails()` expõe `currentUser`, `openCard`/`closeCard`, `addComment`, `updateComment`, `deleteComment`, `logActivity` e `clearCardHistory`. O `CardProvider` registra automaticamente as ações de cartão (criado, alterado, movido) e limpa o histórico ao excluir.
- `src/components/details/`: `CardDetailsModal` (drawer lateral aberto ao clicar no título do cartão ou em "⋯"), `CommentSection` e `ActivityLog`.
- O autor dos comentários vem de `readCurrentUser`, que lê `state.data.session` (`userId`/`currentUserId`/`id` ou uma string) e `state.data.users` (`id` + `name`/`nome`/`username`). Sem sessão registrada pelo Membro 2, usa o usuário local anônimo.

## Limites desta entrega

- Membro 2: usuários mockados, sessão, dashboard e CRUD de projetos.
- Membro 3: quadro Kanban, colunas e drag and drop horizontal.
- Membro 4: cartões, drag and drop de cartões e integridade dos relacionamentos.
- Membro 5: detalhes, comentários e histórico.
- Membro 6: anexos, listener de `StorageEvent` para sincronização entre abas, animações e polimento geral.

O Membro 6 permite anexos de até 1 MB por arquivo nos cartões, serializados como Data URL/Base64 dentro do estado salvo no navegador. A sincronização escuta alterações da chave `mini-trello:state` em outras abas da mesma origem; o navegador e a disponibilidade/cota do `localStorage` continuam sendo limites da persistência. A interface também sinaliza colunas vazias e respeita a preferência por movimento reduzido.
