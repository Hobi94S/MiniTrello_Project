import { useId, useState } from 'react';
import type { Card } from '../../types/cards';

interface CardFormProps {
  card?: Card;
  onSave: (title: string, description: string) => void;
  onCancel: () => void;
}

export function CardForm({ card, onSave, onCancel }: CardFormProps) {
  const titleId = useId();
  const descriptionId = useId();
  const [title, setTitle] = useState(card?.title ?? '');
  const [description, setDescription] = useState(card?.description ?? '');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (title.trim()) onSave(title.trim(), description.trim());
  };

  return (
    <form className="card-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="form-field">
        <label className="form-label" htmlFor={titleId}>Título</label>
        <input
          id={titleId}
          className="form-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          required
        />
      </div>
      <div className="form-field">
        <label className="form-label" htmlFor={descriptionId}>Descrição</label>
        <textarea
          id={descriptionId}
          className="form-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>
      <div className="form-actions" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" className="form-cancel-button" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="form-save-button">Salvar</button>
      </div>
    </form>
  );
}
