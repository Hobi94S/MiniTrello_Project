import { useCallback } from 'react';
import { useCards } from '../../contexts/CardContext';
import type { Card } from '../../types/cards';
import { Card as CardComponent } from './Card';

interface ColumnCardsProps {
  columnId: string;
  cards: Card[];
}

export function ColumnCards({ columnId, cards }: ColumnCardsProps) {
  const { moveCard, reorderCardsInColumn } = useCards();

  const sortedCards = [...cards].sort((a, b) => a.order - b.order);

  const handleDragStart = useCallback(
    (event: React.DragEvent, cardId: string) => {
      event.dataTransfer.setData('cardId', cardId);
      event.dataTransfer.setData('sourceColumnId', columnId);
      event.dataTransfer.effectAllowed = 'move';
    },
    [columnId]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    },
    []
  );

  const handleDrop = useCallback(
    (event: React.DragEvent, targetCardId: string, targetIndex: number) => {
      event.preventDefault();
      event.stopPropagation();
      const cardId = event.dataTransfer.getData('cardId');
      const sourceColumnId = event.dataTransfer.getData('sourceColumnId');
      if (!cardId) return;
      if (sourceColumnId === columnId) {
        const newOrder = [...sortedCards];
        const idx = newOrder.findIndex((c) => c.id === cardId);
        const targetIdx = newOrder.findIndex((c) => c.id === targetCardId);
        if (idx !== -1 && targetIdx !== -1 && idx !== targetIdx) {
          const [moved] = newOrder.splice(idx, 1);
          newOrder.splice(targetIdx, 0, moved);
          reorderCardsInColumn(columnId, newOrder.map((c) => c.id));
        }
      } else {
        moveCard(cardId, columnId, targetIndex);
      }
    },
    [columnId, sortedCards, moveCard, reorderCardsInColumn]
  );

  const handleColumnDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const cardId = event.dataTransfer.getData('cardId');
      const sourceColumnId = event.dataTransfer.getData('sourceColumnId');
      if (!cardId || sourceColumnId === columnId) return;
      moveCard(cardId, columnId, sortedCards.length);
    },
    [columnId, sortedCards.length, moveCard]
  );

  return (
    <div
      className="card-list"
      onDragOver={handleDragOver}
      onDrop={handleColumnDrop}
      style={{
        minHeight: '80px',
        padding: '8px',
        background: 'var(--soft)',
        borderRadius: '8px',
        marginBottom: '16px',
      }}
    >
      {sortedCards.length === 0 && <p className="card-list-empty">Solte um cartão aqui ou crie um novo.</p>}
      {sortedCards.map((card, index) => (
        <CardComponent
          key={card.id}
          card={card}
          onDragStart={(e) => handleDragStart(e, card.id)}
          onDrop={(e) => handleDrop(e, card.id, index)}
        />
      ))}
    </div>
  );
}