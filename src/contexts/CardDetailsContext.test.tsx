import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { CardProvider, useCards } from './CardContext';
import { CardDetailsProvider, useCardDetails } from './CardDetailsContext';
import { appReducer, initialState } from '../types/state';
import type { AppAction, AppState } from '../types/state';

let state: AppState;
vi.mock('./AppContext', () => ({
  useApp: () => ({ state, dispatch: (action: AppAction) => { state = appReducer(state, action); } }),
}));

function read() {
  let cards!: ReturnType<typeof useCards>;
  let details!: ReturnType<typeof useCardDetails>;
  function Probe() { cards = useCards(); details = useCardDetails(); return null; }
  renderToString(<CardDetailsProvider><CardProvider><Probe /></CardProvider></CardDetailsProvider>);
  return { cards, details };
}

beforeEach(() => {
  state = { ...initialState, data: {
    columns: [{ id: 'todo', projectId: 'p1', title: 'A Fazer' }, { id: 'doing', projectId: 'p1', title: 'Em Andamento' }],
    session: { userId: 'u1' },
    users: [{ id: 'u1', name: 'Pedro' }],
  } };
});

describe('card details, comments and audit trail', () => {
  it('logs card lifecycle actions with the session user as actor', () => {
    const board = read().cards.getBoard('p1')!;
    read().cards.addCard('todo', board.id, 'Tarefa');
    const card = read().cards.getBoard('p1')!.columns[0].cards[0];
    read().cards.updateCard(card.id, { title: 'Tarefa 2', description: 'desc' });
    read().cards.updateCard(card.id, { title: 'Tarefa 2' });
    read().cards.reorderCardsInColumn('todo', [card.id]);
    read().cards.moveCard(card.id, 'doing', 0);
    const log = read().details.activitiesOf(card.id);
    expect(log.map((a) => a.message)).toEqual([
      'Cartão movido para "Em Andamento"',
      'Título alterado para "Tarefa 2"; Descrição atualizada',
      'Cartão criado na coluna "A Fazer"',
    ]);
    expect(log.every((a) => a.actorId === 'u1' && a.actorName === 'Pedro')).toBe(true);
  });

  it('binds comments to the current user and prunes everything when the card is deleted', () => {
    const board = read().cards.getBoard('p1')!;
    read().cards.addCard('todo', board.id, 'Tarefa');
    const card = read().cards.getBoard('p1')!.columns[0].cards[0];
    read().details.addComment(card.id, 'Primeiro comentário');
    read().details.addComment(card.id, '   ');
    const [comment] = read().details.commentsOf(card.id);
    expect(read().details.commentsOf(card.id)).toHaveLength(1);
    expect(comment).toMatchObject({ authorId: 'u1', authorName: 'Pedro', text: 'Primeiro comentário' });
    expect(read().details.activitiesOf(card.id)[0].type).toBe('commented');
    read().details.updateComment(comment.id, 'Editado');
    expect(read().details.commentsOf(card.id)[0].text).toBe('Editado');
    read().cards.deleteCard(card.id);
    expect(read().details.commentsOf(card.id)).toEqual([]);
    expect(read().details.activitiesOf(card.id)).toEqual([]);
    expect(state.data.columns).toHaveLength(2);
  });

  it('falls back to a local user without a mocked session', () => {
    state = { ...initialState, data: {} };
    expect(read().details.currentUser).toEqual({ id: 'anonimo', name: 'Usuário local' });
  });
});
