// Tipos de domínio para o módulo de cartões (Membro 4).
// Estrutura armazenada no AppContext sob a chave 'boards', garantindo
// consistência entre cartões, colunas e o quadro persistido em localStorage.

export interface Card {
  id: string;
  title: string;
  description: string;
  columnId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  order: number;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  projectId: string;
  columns: Column[];
}

export const EMPTY_BOARD: Board = {
  id: '',
  title: '',
  projectId: '',
  columns: [],
};

export function newCardId(): string {
  return `card_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function newColumnId(): string {
  return `column_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function newBoardId(): string {
  return `board_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function createCard({
  title,
  description = '',
  columnId,
  order = 0,
}: {
  title: string;
  description?: string;
  columnId: string;
  order?: number;
}): Card {
  const now = nowISO();
  return {
    id: newCardId(),
    title,
    description,
    columnId,
    order,
    createdAt: now,
    updatedAt: now,
  };
}