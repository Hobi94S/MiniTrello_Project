import { useState } from 'react';
import { useCards } from '../contexts/CardContext';
import { useParams } from 'react-router-dom';
import { ColumnCards } from '../components/cards/ColumnCards';

export function BoardPage() {
  const { projectId } = useParams();
  const { addColumn, addCard, createDefaultBoardIfMissing } = useCards();
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');
  const [openColumnForm, setOpenColumnForm] = useState(false);
  const [openCardForm, setOpenCardForm] = useState<string | null>(null);

  const board = projectId ? createDefaultBoardIfMissing(projectId) : undefined;

  if (!board) {
    return (
      <div className="integration-content">
        <h1>Quadro do projeto</h1>
        <p>ID do projeto não informado.</p>
      </div>
    );
  }

  const handleAddColumn = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newColumnTitle.trim()) return;
    addColumn(board.id, newColumnTitle.trim());
    setNewColumnTitle('');
    setOpenColumnForm(false);
  };

  const handleAddCard = (columnId: string, event: React.FormEvent) => {
    event.preventDefault();
    if (!newCardTitle.trim()) return;
    addCard(columnId, board.id, newCardTitle.trim(), newCardDesc.trim());
    setNewCardTitle('');
    setNewCardDesc('');
    setOpenCardForm(null);
  };

  return (
    <div className="board-page">
      <header className="board-header">
        <h1>{board.title}</h1>
        <div className="board-actions">
          <button className="board-button" onClick={() => setOpenColumnForm(true)}>+ Coluna</button>
        </div>
      </header>

      {openColumnForm && (
        <form className="column-form" onSubmit={handleAddColumn} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
          <input
            className="column-form-input"
            type="text"
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            placeholder="Nome da coluna"
            autoFocus
            required
          />
          <button type="submit" className="column-form-button">Adicionar</button>
          <button type="button" className="column-form-cancel" onClick={() => setOpenColumnForm(false)}>Cancelar</button>
        </form>
      )}

      <div className="board-columns" style={{ display: 'flex', gap: 20, flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 40 }}>
        {board.columns.map((column) => (
          <div
            key={column.id}
            className="board-column"
            style={{
              minWidth: '280px',
              maxWidth: '340px',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--panel)',
              borderRadius: '12px',
              padding: 16,
            }}
          >
            <div className="column-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 className="column-title">{column.title}</h2>
              <span className="column-count" style={{ fontSize: 12, color: 'var(--muted)' }}>{column.cards.length}</span>
            </div>
            <ColumnCards columnId={column.id} cards={column.cards} />
            <form
              className="card-form-inline"
              onSubmit={(e) => handleAddCard(column.id, e)}
              style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}
            >
              <input
                className="card-form-input"
                type="text"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                placeholder="Título do cartão"
                disabled={openCardForm !== null}
              />
              <textarea
                className="card-form-textarea"
                value={newCardDesc}
                onChange={(e) => setNewCardDesc(e.target.value)}
                placeholder="Descrição (opcional)"
                rows={1}
                disabled={openCardForm !== null}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="card-form-add-button" disabled={!newCardTitle.trim() || openCardForm !== null}>
                  Adicionar cartão
                </button>
                {openCardForm === column.id ? (
                  <button type="button" className="card-form-cancel" onClick={() => setOpenCardForm(null)}>Cancelar</button>
                ) : null}
              </div>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}