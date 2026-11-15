import { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
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
  const remoteStates = useRef(new WeakSet<AppState>());

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      try {
        if (event.storageArea !== window.localStorage) return;
        const nextState = parseState(event.newValue);
        remoteStates.current.add(nextState);
        dispatch({ type: 'REPLACE_STATE', state: nextState });
        setStorageError(null);
      } catch {
        setStorageError('Não foi possível sincronizar os dados recebidos de outra aba. Os dados atuais foram mantidos.');
      }
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (remoteStates.current.has(state)) return;
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
