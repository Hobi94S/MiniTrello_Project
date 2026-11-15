import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CardProvider, useCards } from './CardContext';
import { appReducer, initialState } from '../types/state';
import type { AppAction, AppState } from '../types/state';

let state: AppState;
vi.mock('./AppContext', () => ({
  useApp: () => ({ state, dispatch: (action: AppAction) => { state = appReducer(state, action); } }),
}));

function readCards() {
  let value!: ReturnType<typeof useCards>;
  function Probe() { value = useCards(); return null; }
  renderToString(<CardProvider><Probe /></CardProvider>);
  return value;
}

beforeEach(() => {
  state = { ...initialState, data: { columns: [
    { id: 'todo', projectId: 'p1', title: 'Todo' },
    { id: 'done', projectId: 'p1', title: 'Done' },
  ], projects: [{ id: 'p1', name: 'Project' }] } };
});

describe('merged board and card persistence', () => {
  it('preserves legacy columns through card CRUD and moving cards', () => {
    const board = readCards().getBoard('p1')!;
    expect(board.columns.map((column) => column.id)).toEqual(['todo', 'done']);
    readCards().addCard('todo', board.id, 'Task', 'Details');
    const card = readCards().getBoard('p1')!.columns[0].cards[0];
    readCards().updateCard(card.id, { title: 'Updated' });
    const beforeMove = JSON.stringify(state);
    readCards().moveCard(card.id, 'missing', 0);
    expect(JSON.stringify(state)).toBe(beforeMove);
    readCards().moveCard(card.id, 'done', 0);
    expect(JSON.parse(beforeMove).data.boards[board.id].columns[0].cards).toHaveLength(1);
    const moved = readCards().getBoard('p1')!;
    expect(moved.columns[0].cards).toEqual([]);
    expect(moved.columns[1].cards[0]).toMatchObject({ title: 'Updated', columnId: 'done', order: 0 });
    readCards().deleteCard(card.id);
    expect(readCards().getBoard('p1')!.columns[1].cards).toEqual([]);
    expect(state.data.projects).toEqual([{ id: 'p1', name: 'Project' }]);
  });

  it('does not restore deleted columns from legacy storage', () => {
    const board = readCards().getBoard('p1')!;
    state = appReducer(state, { type: 'SET_SLICE', key: 'boards', value: {
      [board.id]: { ...board, columns: [] },
    } });
    expect(readCards().getBoard('p1')!.columns).toEqual([]);
  });
});
