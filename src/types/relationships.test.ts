import { describe, expect, it } from 'vitest';
import { appReducer, parseState } from './state';
import type { AppState } from './state';
import { createCard } from './cards';
import { addComment, appendActivity } from './details';
import { addProject, updateProject } from './projects';
import { addColumn, renameColumn, reorderColumns } from './board';

function fixture(): AppState {
  const actor = { id: 'u1', name: 'Usuário 1' };
  const card = createCard({ title: 'Tarefa', columnId: 'c1' });
  const other = createCard({ title: 'Outra tarefa', columnId: 'c2' });
  return { version: 1, data: {
    projects: [{ id: 'p1', name: 'Um', description: '', createdAt: '' }, { id: 'p2', name: 'Dois', description: '', createdAt: '' }],
    columns: [{ id: 'c1', projectId: 'p1', title: 'Uma' }, { id: 'c2', projectId: 'p2', title: 'Outra' }],
    boards: {
      b1: { id: 'b1', projectId: 'p1', title: 'Um', columns: [{ id: 'c1', title: 'Uma', order: 0, cards: [card] }] },
      b2: { id: 'b2', projectId: 'p2', title: 'Dois', columns: [{ id: 'c2', title: 'Outra', order: 0, cards: [other] }] },
    },
    comments: addComment(addComment([], card.id, actor, 'Um'), other.id, actor, 'Dois'),
    activities: appendActivity(appendActivity([], card.id, 'created', 'Um', actor), other.id, 'created', 'Dois', actor),
    session: { userId: actor.id },
  } };
}

describe('project and column relationships', () => {
  it('removes all project descendants while preserving another project and the session', () => {
    const state = fixture();
    const before = JSON.stringify(state);
    const next = appReducer(state, { type: 'DELETE_PROJECT', projectId: 'p1' });
    expect(next.data.projects).toEqual([expect.objectContaining({ id: 'p2' })]);
    expect(Object.keys(next.data.boards as object)).toEqual(['b2']);
    expect(next.data.columns).toEqual([expect.objectContaining({ id: 'c2' })]);
    expect(next.data.comments).toEqual([expect.objectContaining({ text: 'Dois' })]);
    expect(next.data.activities).toEqual([expect.objectContaining({ message: 'Dois' })]);
    expect(next.data.session).toEqual(state.data.session);
    expect(JSON.stringify(state)).toBe(before);
    expect(parseState(JSON.stringify(next))).toEqual(next);
  });

  it('removes a column with its cards and interactions without deleting its project', () => {
    const state = fixture();
    const next = appReducer(state, { type: 'DELETE_COLUMN', columnId: 'c1' });
    expect(next.data.boards).toMatchObject({ b1: { columns: [] }, b2: (state.data.boards as Record<string, unknown>).b2 });
    expect(next.data.projects).toEqual(state.data.projects);
    expect(next.data.comments).toEqual([expect.objectContaining({ text: 'Dois' })]);
    expect(next.data.activities).toEqual([expect.objectContaining({ message: 'Dois' })]);
    expect(next.data.columns).toEqual([expect.objectContaining({ id: 'c2' })]);
  });

  it('creates and edits projects and reorders columns without losing their relationships', () => {
    const projects = addProject([], ' Projeto ', ' Descrição ');
    const id = projects[0].id;
    expect(updateProject(projects, id, ' Novo ', ' Outra ')[0]).toMatchObject({ id, name: 'Novo', description: 'Outra' });
    expect(addProject(projects, '  ', '')).toBe(projects);
    const columns = addColumn(addColumn([], id, 'A'), id, 'B');
    const renamed = renameColumn(columns, columns[0].id, 'Renomeada');
    const reordered = reorderColumns(renamed, id, columns[0].id, columns[1].id);
    expect(reordered.map((column) => column.title)).toEqual(['B', 'Renomeada']);
    expect(reordered.every((column) => column.projectId === id)).toBe(true);
  });
});
