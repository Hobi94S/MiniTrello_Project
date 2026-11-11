import { createContext, useContext, useEffect, useReducer, useState } from 'react';
import type { Dispatch, ReactNode } from 'react';
import { appReducer, initialState, parseState, STORAGE_KEY } from '../types/state';
import type { AppAction, AppState } from '../types/state';

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  storageError: string | null;
}

const AppContext = createContext<AppContextValue | null>(null);

function loadState() {
  try {
    return { state: parseState(localStorage.getItem(STORAGE_KEY)), error: null };
  } catch {
    return { state: initialState, error: 'Não foi possível ler os dados locais. Os dados salvos foram preservados.' };
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(loadState);
  const [state, dispatch] = useReducer(appReducer, loaded.state);
  const [storageError, setStorageError] = useState<string | null>(loaded.error);

  useEffect(() => {
    // Preserve unreadable stored data until a feature explicitly changes state.
    if (loaded.error && state === loaded.state) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStorageError(null);
    } catch {
      setStorageError('Não foi possível salvar no navegador. As alterações estão apenas nesta sessão.');
    }
  }, [state, loaded]);

  return <AppContext.Provider value={{ state, dispatch, storageError }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp deve ser usado dentro de AppProvider.');
  return context;
}
