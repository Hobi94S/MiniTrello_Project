import { createContext, useContext, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { useApp } from "../contexts/AppContext";
import { createCard, newBoardId, newColumnId, nowISO } from "../types/cards";
import type { Board, Card, Column } from "../types/cards";

const BOARDS_KEY = "boards";

interface CardContextValue {
  boards: Record<string, Board>;
  getBoard: (projectId: string) => Board | undefined;
  createBoard: (projectId: string, title: string) => string;
  addColumn: (boardId: string, title: string) => string;
  addCard: (columnId: string, boardId: string, title: string, description?: string) => void;
  updateCard: (cardId: string, updates: Partial<Pick<Card, "title" | "description">>) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (cardId: string, targetColumnId: string, targetOrder: number) => void;
  reorderCardsInColumn: (columnId: string, cardIds: string[]) => void;
  createDefaultBoardIfMissing: (projectId: string) => Board;
}

const CardContext = createContext<CardContextValue | null>(null);

export function CardProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useApp();

  const boards = useMemo(() => {
    const raw = state.data[BOARDS_KEY];
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    return raw as Record<string, Board>;
  }, [state.data]);

  const save = useCallback(
    (nextBoards: Record<string, Board>) => {
      dispatch({ type: "SET_SLICE", key: BOARDS_KEY, value: nextBoards });
    },
    [dispatch]
  );

  const getBoard = useCallback((projectId: string): Board | undefined => {
    return Object.values(boards).find((b) => b.projectId === projectId);
  }, [boards]);

  const createBoard = useCallback((projectId: string, title: string): string => {
    const id = newBoardId();
    const board: Board = {
      id,
      title,
      projectId,
      columns: [],
    };
    save({ ...boards, [id]: board });
    return id;
  }, [boards, save]);

  const addColumn = useCallback((boardId: string, title: string): string => {
    const board = boards[boardId];
    if (!board) return "";
    const id = newColumnId();
    const column: Column = { id, title, order: board.columns.length, cards: [] };
    const next = { ...boards, [boardId]: { ...board, columns: [...board.columns, column] } };
    save(next);
    return id;
  }, [boards, save]);

  const addCard = useCallback(
    (columnId: string, boardId: string, title: string, description?: string): void => {
      const board = boards[boardId];
      if (!board) return;
      const columnIndex = board.columns.findIndex((c) => c.id === columnId);
      if (columnIndex === -1) return;
      const column = board.columns[columnIndex];
      const card = createCard({ title, description, columnId, order: column.cards.length });
      const nextColumns = board.columns.map((c, i) => {
        if (i === columnIndex) {
          return { ...c, cards: [...c.cards, card] };
        }
        return c;
      });
      const next = { ...boards, [boardId]: { ...board, columns: nextColumns } };
      save(next);
    },
    [boards, save]
  );

  const updateCard = useCallback(
    (cardId: string, updates: Partial<Pick<Card, "title" | "description">>): void => {
      const next = { ...boards };
      let changed = false;
      for (const boardId of Object.keys(next)) {
        const board = next[boardId];
        const newColumns = board.columns.map((col) => {
          const cardIdx = col.cards.findIndex((c) => c.id === cardId);
          if (cardIdx === -1) return col;
          changed = true;
          const card = col.cards[cardIdx];
          const updatedCard: Card = {
            ...card,
            ...updates,
            updatedAt: nowISO(),
          };
          return {
            ...col,
            cards: col.cards.map((c, i) => (i === cardIdx ? updatedCard : c)),
          };
        });
        if (changed) {
          next[boardId] = { ...board, columns: newColumns };
          break;
        }
      }
      if (changed) save(next);
    },
    [boards, save]
  );

  const deleteCard = useCallback((cardId: string): void => {
    const next = { ...boards };
    let changed = false;
    for (const boardId of Object.keys(next)) {
      const board = next[boardId];
      const newColumns = board.columns.map((col) => {
        const idx = col.cards.findIndex((c) => c.id === cardId);
        if (idx === -1) return col;
        changed = true;
        return {
          ...col,
          cards: col.cards.filter((c) => c.id !== cardId),
        };
      });
      if (changed) {
        next[boardId] = { ...board, columns: newColumns };
        break;
      }
    }
    if (changed) save(next);
  }, [boards, save]);

  const moveCard = useCallback(
    (cardId: string, targetColumnId: string, targetOrder: number): void => {
      const next = { ...boards };
      let sourceColumnId: string | null = null;
      let sourceBoardId: string | null = null;
      let card: Card | null = null;

      // Encontrar o cartão
      for (const boardId of Object.keys(next)) {
        const board = next[boardId];
        for (const col of board.columns) {
          const idx = col.cards.findIndex((c) => c.id === cardId);
          if (idx !== -1) {
            sourceColumnId = col.id;
            sourceBoardId = boardId;
            card = col.cards[idx];
            break;
          }
        }
        if (sourceBoardId) break;
      }

      if (!sourceBoardId || !card || !sourceColumnId) return;

      // Remover da coluna de origem
      const sourceBoard = next[sourceBoardId];
      sourceBoard.columns = sourceBoard.columns.map((col) => {
        if (col.id === sourceColumnId) {
          return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
        }
        return col;
      });

      // Ajustar ordens na coluna de origem
      sourceBoard.columns = sourceBoard.columns.map((col) => {
        if (col.id === sourceColumnId) {
          return {
            ...col,
            cards: col.cards.map((c, i) => ({ ...c, order: i })),
          };
        }
        return col;
      });

      // Adicionar na coluna de destino
      const targetBoard = next[sourceBoardId];
      const targetColIdx = targetBoard.columns.findIndex((c) => c.id === targetColumnId);
      if (targetColIdx === -1) return;

      const targetColumn = targetBoard.columns[targetColIdx];
      const cardToMove: Card = { ...card, columnId: targetColumnId, order: targetOrder, updatedAt: nowISO() };

      // Ajustar ordens na coluna de destino (deslocar cartões a partir da posição alvo)
      const updatedTargetCards = [...targetColumn.cards];
      updatedTargetCards.splice(targetOrder, 0, cardToMove);
      updatedTargetCards.forEach((c, i) => {
        c.order = i;
        c.columnId = targetColumnId;
        c.updatedAt = nowISO();
      });

      targetBoard.columns[targetColIdx] = {
        ...targetColumn,
        cards: updatedTargetCards,
      };

      save(next);
    },
    [boards, save]
  );

  const reorderCardsInColumn = useCallback(
    (columnId: string, cardIds: string[]): void => {
      const next = { ...boards };
      let changed = false;
      for (const boardId of Object.keys(next)) {
        const board = next[boardId];
        const colIdx = board.columns.findIndex((c) => c.id === columnId);
        if (colIdx === -1) continue;
        changed = true;
        const column = board.columns[colIdx];
        const cardMap = new Map(column.cards.map((c) => [c.id, c]));
        const newCards = cardIds.map((cid, i) => {
          const c = cardMap.get(cid);
          if (!c) return null;
          return { ...c, order: i, updatedAt: nowISO() };
        }).filter(Boolean) as Card[];
        next[boardId] = {
          ...board,
          columns: board.columns.map((c, i) =>
            i === colIdx ? { ...c, cards: newCards } : c
          ),
        };
        break;
      }
      if (changed) save(next);
    },
    [boards, save]
  );

  const createDefaultBoardIfMissing = useCallback((projectId: string): Board => {
    let board = getBoard(projectId);
    if (board) return board;
    createBoard(projectId, `Quadro do projeto ${projectId}`);
    board = getBoard(projectId);
    if (!board) throw new Error("Não foi possível criar o quadro.");
    return board;
  }, [getBoard, createBoard]);

  const value: CardContextValue = useMemo(
    () => ({
      boards,
      getBoard,
      createBoard,
      addColumn,
      addCard,
      updateCard,
      deleteCard,
      moveCard,
      reorderCardsInColumn,
      createDefaultBoardIfMissing,
    }),
    [boards, getBoard, createBoard, addColumn, addCard, updateCard, deleteCard, moveCard, reorderCardsInColumn, createDefaultBoardIfMissing]
  );

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
}

export function useCards() {
  const context = useContext(CardContext);
  if (!context) throw new Error("useCards deve ser usado dentro de CardProvider.");
  return context;
}