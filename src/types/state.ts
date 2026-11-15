import type { Board } from './cards';
import { readColumns } from './board';
import { readComments, readActivities } from './details';
import { readProjects } from './projects';
// Shared infrastructure contract. Feature modules own their entity schemas.
export interface AppState {
  version: 1;
  data: Record<string, unknown>;
}

export type AppAction =
  | { type: 'DELETE_PROJECT'; projectId: string }
  | { type: 'DELETE_COLUMN'; columnId: string }
  | { type: 'SET_SLICE'; key: string; value: unknown }
  | { type: 'REMOVE_SLICE'; key: string }
  | { type: 'REPLACE_STATE'; state: AppState };

export const STORAGE_KEY = 'mini-trello:state';
export const initialState: AppState = { version: 1, data: {} };

export function parseState(raw: string | null): AppState {
  if (!raw) return initialState;
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null ||
    !('version' in parsed) || parsed.version !== 1 ||
    !('data' in parsed) || typeof parsed.data !== 'object' ||
    parsed.data === null || Array.isArray(parsed.data)) {
    throw new Error('Formato de dados incompatível.');
  }
  return { version: 1, data: parsed.data as Record<string, unknown> };
}

export function appReducer(state: AppState, action: AppAction): AppState {
  if (action.type === 'DELETE_PROJECT' || action.type === 'DELETE_COLUMN') {
    const raw = state.data.boards;
    const boards = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as Record<string, Board> : {};
    const removed = new Set<string>();
    const nextBoards: Record<string, Board> = {};
    for (const [id, board] of Object.entries(boards)) {
      const removeBoard = action.type === 'DELETE_PROJECT' && board.projectId === action.projectId;
      const columns = board.columns.filter((column) => {
        const remove = removeBoard || (action.type === 'DELETE_COLUMN' && column.id === action.columnId);
        if (remove) column.cards.forEach((card) => removed.add(card.id));
        return !remove;
      }).map((column, order) => ({ ...column, order }));
      if (!removeBoard) nextBoards[id] = { ...board, columns };
    }
    return { ...state, data: {
      ...state.data,
      ...(action.type === 'DELETE_PROJECT' ? { projects: readProjects(state.data.projects).filter((p) => p.id !== action.projectId) } : {}),
      boards: nextBoards,
      columns: readColumns(state.data.columns).filter((column) => action.type === 'DELETE_PROJECT' ? column.projectId !== action.projectId : column.id !== action.columnId),
      comments: readComments(state.data.comments).filter((item) => !removed.has(item.cardId)),
      activities: readActivities(state.data.activities).filter((item) => !removed.has(item.cardId)),
    } };
  }
  if (action.type === 'REPLACE_STATE') return action.state;
  if (action.type === 'SET_SLICE') {
    return { ...state, data: { ...state.data, [action.key]: action.value } };
  }
  const data = { ...state.data };
  delete data[action.key];
  return { ...state, data };
}
