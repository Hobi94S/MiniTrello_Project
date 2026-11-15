import { useEffect, useMemo, useRef, useState } from 'react';
import { useCards } from '../../contexts/CardContext';
import { useCardDetails } from '../../contexts/CardDetailsContext';
import { formatDateTime } from '../../types/details';
import type { Card, Column } from '../../types/cards';
import { CardForm } from '../cards/CardForm';
import { CommentSection } from './CommentSection';
import { ActivityLog } from './ActivityLog';

function findCard(boards: ReturnType<typeof useCards>['boards'], cardId: string): { card: Card; column: Column } | null {
  for (const board of Object.values(boards)) {
    for (const column of board.columns) {
      const card = column.cards.find((c) => c.id === cardId);
      if (card) return { card, column };
    }
  }
  return null;
}

export function CardDetailsModal() {
  const { boards, updateCard, deleteCard } = useCards();
  const { openCardId, closeCard } = useCardDetails();
  const [editing, setEditing] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  const found = useMemo(() => (openCardId ? findCard(boards, openCardId) : null), [boards, openCardId]);

  useEffect(() => {
    if (!openCardId) return;
    setEditing(false);
    panel.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') closeCard();
    }
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [openCardId, closeCard]);

  // O cartão pode ter sido removido em outra ação (ex.: coluna excluída).
  useEffect(() => {
    if (openCardId && !found) closeCard();
  }, [openCardId, found, closeCard]);

  if (!openCardId || !found) return null;
  const { card, column } = found;

  function handleSave(title: string, description: string) {
    updateCard(card.id, { title, description });
    setEditing(false);
  }

  function handleDelete() {
    if (window.confirm('Excluir este cartão?')) deleteCard(card.id);
  }

  return (
    <div className="details-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) closeCard(); }}>
      <div
        ref={panel}
        className="details-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-title"
        tabIndex={-1}
      >
        <header className="details-header">
          <div className="details-heading">
            <p className="eyebrow details-eyebrow">Na coluna {column.title}</p>
            {editing ? (
              <CardForm card={card} onSave={handleSave} onCancel={() => setEditing(false)} />
            ) : (
              <>
                <h2 id="details-title" className="details-title">{card.title}</h2>
                <p className="details-description">{card.description || 'Sem descrição.'}</p>
              </>
            )}
          </div>
          <div className="details-actions">
            {!editing && <button onClick={() => setEditing(true)} aria-label="Editar cartão">✎</button>}
            <button onClick={handleDelete} aria-label="Excluir cartão">🗑</button>
            <button onClick={closeCard} aria-label="Fechar detalhes">✕</button>
          </div>
        </header>
        <p className="details-dates">
          Criado em {formatDateTime(card.createdAt)} · Atualizado em {formatDateTime(card.updatedAt)}
        </p>
        <div className="details-body">
          <CommentSection cardId={card.id} />
          <ActivityLog cardId={card.id} />
        </div>
      </div>
    </div>
  );
}
