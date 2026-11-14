// Shared infrastructure contract. Feature modules own their entity schemas.
export interface AppState {
  version: 1;
  data: Record<string, unknown>;
}

export type AppAction =
  | { type: 'SET_SLICE'; key: string; value: unknown }
  | { type: 'REMOVE_SLICE'; key: string };

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
  if (action.type === 'SET_SLICE') {
    return { ...state, data: { ...state.data, [action.key]: action.value } };
  }
  const data = { ...state.data };
  delete data[action.key];
  return { ...state, data };
}
