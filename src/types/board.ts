import { arrayMove } from '@dnd-kit/sortable';

export interface Column {
  id: string;
  projectId: string;
  title: string;
}

export const COLUMNS_KEY = 'columns';
export const DEFAULT_COLUMN_TITLES = ['A Fazer', 'Em Andamento', 'Concluído'];

function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `col-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function readColumns(value: unknown): Column[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (c): c is Column =>
      typeof c === 'object' && c !== null &&
      typeof c.id === 'string' &&
      typeof c.projectId === 'string' &&
      typeof c.title === 'string',
  );
}

export function columnsOf(all: Column[], projectId: string): Column[] {
  return all.filter((c) => c.projectId === projectId);
}

export function addColumn(all: Column[], projectId: string, title: string): Column[] {
  const clean = title.trim();
  if (!clean) return all;
  return [...all, { id: newId(), projectId, title: clean }];
}

export function renameColumn(all: Column[], id: string, title: string): Column[] {
  const clean = title.trim();
  if (!clean) return all;
  return all.map((c) => (c.id === id ? { ...c, title: clean } : c));
}

export function removeColumn(all: Column[], id: string): Column[] {
  return all.filter((c) => c.id !== id);
}

export function reorderColumns(all: Column[], projectId: string, activeId: string, overId: string): Column[] {
  const mine = columnsOf(all, projectId);
  const from = mine.findIndex((c) => c.id === activeId);
  const to = mine.findIndex((c) => c.id === overId);
  if (from < 0 || to < 0 || from === to) return all;
  const others = all.filter((c) => c.projectId !== projectId);
  return [...others, ...arrayMove(mine, from, to)];
}