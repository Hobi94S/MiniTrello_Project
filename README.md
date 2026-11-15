# Mini Trello — Entrega 1

Projeto da disciplina **Criar Serviços com Web REST**, do curso de **Sistemas da Informação da Unifacisa**.

O Mini Trello é uma aplicação para organizar projetos e tarefas em quadros Kanban. Nesta entrega, tudo funciona no navegador: a sessão é simulada e os dados são salvos no `localStorage`, sem backend.

## Como executar

Use Node.js 20.19+ ou 22.12+.

```sh
npm install
npm run dev
```

Abra o endereço indicado pelo Vite no terminal.

Para verificar o projeto e gerar a versão de produção:

```sh
npm test
npm run build
npm run preview
```

## Funcionalidades

- Seleção e alternância entre três usuários de demonstração, com opção de sair da sessão.
- Dashboard com criação, edição e exclusão de projetos.
- Quadro Kanban com criação, renomeação, exclusão e reordenação de colunas.
- Cartões com edição rápida, exclusão e arrastar e soltar entre colunas ou na mesma coluna.
- Painel de detalhes com comentários e histórico de atividades.
- Autoria vinculada ao usuário selecionado, com edição e exclusão dos próprios comentários.
- Upload, download e remoção de anexos de até 1 MB por arquivo.
- Temas claro e escuro, menu responsivo e sincronização entre abas.

As alterações ficam salvas ao recarregar a página. Ao excluir um projeto ou uma coluna, seus cartões, anexos, comentários e atividades também são removidos.

## Como usar

1. Acesse **Usuários** e escolha uma sessão de demonstração.
2. Em **Projetos**, crie um projeto e clique em **Abrir quadro**.
3. Crie suas colunas ou use **Criar colunas padrão**.
4. Adicione cartões. Use o ícone de arrastar no cabeçalho para reorganizar colunas e arraste os cartões para organizar as tarefas.
5. Clique no título de um cartão ou em **⋯** para abrir seus detalhes, comentários e histórico.

## Tecnologias e organização

O projeto usa React, TypeScript, Vite, React Router e dnd-kit. Os testes são executados com Vitest.

- `src/pages`: dashboard, usuários e quadro Kanban.
- `src/components`: layout, cartões e painel de detalhes.
- `src/contexts`: estado global, tema, cartões e interações.
- `src/types`: modelos, regras de manipulação dos dados e testes.
- `src/styles.css`: estilos, temas e responsividade.

As rotas principais são `/inicio`, `/projetos`, `/projetos/:projectId` e `/usuarios`. Em hospedagem estática, configure o redirecionamento das rotas para `index.html`.

## Persistência e limites

Os dados são armazenados na chave `mini-trello:state`, e o tema em `mini-trello:theme`. Os anexos são convertidos para Data URL/Base64 e fazem parte do estado salvo.

O armazenamento pertence ao navegador e à origem utilizada. Limpar os dados do site remove os registros; abrir em outro navegador não os transfere. A sincronização ocorre entre abas da mesma origem, sem comunicação entre dispositivos. Alterações simultâneas seguem o último estado salvo.

A sessão de demonstração não oferece autenticação real. O tamanho total dos dados depende da cota de `localStorage` do navegador. Se a gravação falhar, a aplicação avisa e mantém as alterações em memória enquanto a página estiver aberta.
