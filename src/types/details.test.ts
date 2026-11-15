import { describe, expect, it, vi } from 'vitest';
import {
  ANONYMOUS_USER, activitiesOf, addComment, appendActivity, commentsOf, editComment, pruneByCard,
  readActivities, readComments, readCurrentUser, removeComment,
} from './details';

const user = { id: 'u1', name: 'Pedro' };

describe('comments and activities contract', () => {
  it('adds, edits and removes comments bound to the author and the card', () => {
    const empty = addComment([], 'c1', user, '   ');
    expect(empty).toEqual([]);
    const all = addComment(addComment([], 'c1', user, ' Olá '), 'c2', user, 'Outro');
    expect(all[0]).toMatchObject({ cardId: 'c1', authorId: 'u1', authorName: 'Pedro', text: 'Olá' });
    expect(commentsOf(all, 'c1')).toHaveLength(1);
    const edited = editComment(all, all[0].id, 'Editado');
    expect(edited[0].text).toBe('Editado');
    expect(editComment(all, all[0].id, '  ')).toBe(all);
    expect(removeComment(all, all[0].id).map((c) => c.cardId)).toEqual(['c2']);
    expect(pruneByCard(all, 'c1').map((c) => c.cardId)).toEqual(['c2']);
    expect(readComments(JSON.parse(JSON.stringify(all)))).toEqual(all);
    expect(readComments([{ id: 'x' }, null, 'bad'])).toEqual([]);
  });

  it('records activities newest first and validates stored data', () => {
    const log = appendActivity(appendActivity([], 'c1', 'created', 'Cartão criado', user), 'c1', 'moved', 'Movido', user);
    expect(log.map((a) => a.type)).toEqual(['created', 'moved']);
    expect(activitiesOf([...log].reverse(), 'c1')[0].type).toBe('moved');
    expect(readActivities(JSON.parse(JSON.stringify(log)))).toEqual(log);
    expect(readActivities({})).toEqual([]);
  });

  it('resolves the current user from the mocked session or falls back', () => {
    expect(readCurrentUser({})).toEqual(ANONYMOUS_USER);
    expect(readCurrentUser({ session: { userId: 'u2' } })).toEqual({ id: 'u2', name: 'u2' });
    expect(readCurrentUser({ session: { currentUserId: 'u2' }, users: [{ id: 'u2', name: 'Rebecca' }] }))
      .toEqual({ id: 'u2', name: 'Rebecca' });
    expect(readCurrentUser({ session: 'u3', users: [{ id: 'u3', nome: 'Jr' }] })).toEqual({ id: 'u3', name: 'Jr' });
  });

  it('orders actions deterministically when they share the same millisecond', () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
      const created = appendActivity([], 'c1', 'created', 'Criado', user);
      const log = appendActivity(created, 'c1', 'moved', 'Movido', user);
      expect(activitiesOf(log, 'c1').map((item) => item.type)).toEqual(['moved', 'created']);
      expect(activitiesOf([...log].reverse(), 'c1').map((item) => item.type)).toEqual(['moved', 'created']);
    } finally { vi.useRealTimers(); }
  });
});
