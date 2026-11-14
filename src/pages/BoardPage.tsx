import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext, horizontalListSortingStrategy, sortableKeyboardCoordinates, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useApp } from '../contexts/AppContext';
import {
  COLUMNS_KEY, DEFAULT_COLUMN_TITLES, addColumn, columnsOf, readColumns, removeColumn, renameColumn, reorderColumns,
} from '../types/board';
import type { Column } from '../types/board';

function useProjectName(projectId: string) {
  const { state } = useApp();
  const projects = state.data.projects;
  if (!Array.isArray(projects)) return 'Quadro';
  const p = projects.find((x) => x && typeof x === 'object' && x.id === projectId);
  return (p && (p.name ?? p.title ?? p.nome ?? p.titulo)) || 'Quadro';
}

function ColumnCard({ column, onRename, onRemove }: {
  column: Column;
  onRename: (id: string, title: string) => void;
  onRemove: (column: Column) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(column.title);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: column.id });

  function save(e: FormEvent) {
    e.preventDefault();
    if (draft.trim()) onRename(column.id, draft);
    setEditing(false);
  }

  return (
    <section
      ref={setNodeRef}
      className={`column ${isDragging ? 'is-dragging' : ''}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      aria-label={`Coluna ${column.title}`}
    >
      <header className="column-header">
        <button className="drag-handle" aria-label={`Arrastar coluna ${column.title}`} {...attributes} {...listeners}>⠿</button>
        {editing ? (
          <form className="column-edit" onSubmit={save}>
            <input
              autoFocus
              value={draft}
              maxLength={40}
              aria-label="Novo nome da coluna"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') setEditing(false); }}
              onBlur={() => setEditing(false)}
            />
          </form>
        ) : (
          <h2 className="column-title">{column.title}</h2>
        )}
        <div className="column-actions">
          <button onClick={() => { setDraft(column.title); setEditing(true); }} aria-label={`Renomear coluna ${column.title}`}>✎</button>
          <button onClick={() => onRemove(column)} aria-label={`Remover coluna ${column.title}`}>✕</button>
        </div>
      </header>
      <div className="column-body">
        {/* Membro 4 (Caio): cartões desta coluna entram aqui */}
        <p className="column-empty">Sem cartões ainda.</p>
      </div>
    </section>
  );
}

export function BoardPage() {
  const { projectId = '' } = useParams();
  const { state, dispatch } = useApp();
  const projectName = useProjectName(projectId);
  const [newTitle, setNewTitle] = useState('');

  const all = readColumns(state.data[COLUMNS_KEY]);
  const columns = columnsOf(all, projectId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function save(next: Column[]) {
    dispatch({ type: 'SET_SLICE', key: COLUMNS_KEY, value: next });
  }

  function onAdd(e: FormEvent) {
    e.preventDefault();
    save(addColumn(all, projectId, newTitle));
    setNewTitle('');
  }

  function onRemove(column: Column) {
    if (window.confirm(`Remover a coluna "${column.title}"?`)) save(removeColumn(all, column.id));
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) save(reorderColumns(all, projectId, String(active.id), String(over.id)));
  }

  function createDefaults() {
    save(DEFAULT_COLUMN_TITLES.reduce((acc, title) => addColumn(acc, projectId, title), all));
  }

  return (
    <div className="board-page">
      <header className="board-heading">
        <Link className="text-link" to="/projetos"><span aria-hidden="true">←</span> Projetos</Link>
        <h1>{projectName}</h1>
      </header>

      <form className="add-column" onSubmit={onAdd}>
        <input
          value={newTitle}
          maxLength={40}
          placeholder="Nome da nova coluna"
          aria-label="Nome da nova coluna"
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit" disabled={!newTitle.trim()}>+ Adicionar coluna</button>
      </form>

      {columns.length === 0 ? (
        <div className="board-empty">
          <p>Este quadro ainda não tem colunas.</p>
          <button onClick={createDefaults}>Criar colunas padrão</button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
            <div className="board">
              {columns.map((c) => (
                <ColumnCard key={c.id} column={c} onRename={(id, t) => save(renameColumn(all, id, t))} onRemove={onRemove} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}