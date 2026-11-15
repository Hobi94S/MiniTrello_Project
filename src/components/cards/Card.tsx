import { useState } from 'react';
import { useCards } from '../../contexts/CardContext';
import { useCardDetails } from '../../contexts/CardDetailsContext';
import type { Card } from '../../types/cards';
import { CardForm } from './CardForm';

interface CardProps {
  card: Card;
  onDragStart?: (event: React.DragEvent) => void;
  onDrop?: (event: React.DragEvent) => void;
}

export function Card({ card, onDragStart, onDrop }: CardProps) {
  const [editing, setEditing] = useState(false);
  const { updateCard, deleteCard } = useCards();
  const { openCard, commentsOf } = useCardDetails();
  const commentCount = commentsOf(card.id).length;

  const handleSave = (title: string, description: string) => {
    updateCard(card.id, { title, description });
    setEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Excluir este cartão?')) {
      deleteCard(card.id);
    }
  };

  return (
    <div
      className="card"
      draggable={true}
      data-card-id={card.id}
      onDragStart={onDragStart}
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
    >
      <div className="card-actions" style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginBottom: 8 }}>
        <button className="card-edit-button" onClick={() => openCard(card.id)} title="Abrir detalhes" aria-label={`Abrir detalhes de ${card.title}`}>⋯</button>
        <button className="card-edit-button" onClick={() => setEditing(true)} title="Editar cartão">✎</button>
        <button className="card-delete-button" onClick={handleDelete} title="Excluir cartão">×</button>
      </div>
      {editing ? (
        <CardForm
          card={card}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <h3 className="card-title">
            <button className="card-open-button" onClick={() => openCard(card.id)}>{card.title}</button>
          </h3>
          {card.description && <p className="card-description">{card.description}</p>}
          {commentCount > 0 && (
            <span className="card-badge" aria-label={`${commentCount} comentário${commentCount > 1 ? 's' : ''}`}>💬 {commentCount}</span>
          )}
        </>
      )}
    </div>
  );
}