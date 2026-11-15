import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useCards } from '../../contexts/CardContext';
import { readAttachmentFile } from '../../types/attachments';
import type { Attachment } from '../../types/attachments';
import type { Card } from '../../types/cards';

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  return `${(size / 1024).toFixed(0)} KB`;
}

export function CardAttachments({ card }: { card: Card }) {
  const { updateCard } = useCards();
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef(card);
  const updateCardRef = useRef(updateCard);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  cardRef.current = card;
  updateCardRef.current = updateCard;

  async function onFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    setUploading(true);
    setError(null);
    const accepted: Attachment[] = [];
    const errors: string[] = [];
    for (const file of files) {
      try {
        accepted.push(await readAttachmentFile(file));
      } catch (reason) {
        errors.push(reason instanceof Error ? reason.message : `Não foi possível ler "${file.name}".`);
      }
    }

    if (accepted.length) {
      const currentAttachments = cardRef.current.attachments ?? [];
      updateCardRef.current(cardRef.current.id, { attachments: [...currentAttachments, ...accepted] });
    }
    setError(errors.length ? errors.join(' ') : null);
    setUploading(false);
    input.value = '';
  }

  function removeAttachment(attachmentId: string) {
    const current = cardRef.current;
    updateCardRef.current(current.id, {
      attachments: (current.attachments ?? []).filter((attachment) => attachment.id !== attachmentId),
    });
  }

  const attachments = card.attachments ?? [];

  return (
    <section className="card-attachments" aria-label={`Anexos do cartão ${card.title}`}>
      <div className="attachments-heading">
        <h4>Anexos <span>{attachments.length}</span></h4>
        <button
          type="button"
          className="attachment-add"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Lendo…' : '+ Anexar'}
        </button>
        <input
          ref={inputRef}
          className="attachment-input"
          type="file"
          multiple
          onChange={onFilesSelected}
          aria-label="Selecionar arquivos para anexar"
        />
      </div>
      {attachments.length === 0 && <p className="attachments-empty">Nenhum arquivo anexado.</p>}
      {attachments.length > 0 && (
        <ul className="attachment-list">
          {attachments.map((attachment) => (
            <li key={attachment.id}>
              <a href={attachment.dataUrl} download={attachment.name} title={`Baixar ${attachment.name}`}>
                <span className="attachment-name">{attachment.name}</span>
                <small>{formatFileSize(attachment.size)}</small>
              </a>
              <button
                type="button"
                className="attachment-remove"
                onClick={() => removeAttachment(attachment.id)}
                aria-label={`Remover anexo ${attachment.name}`}
                title={`Remover ${attachment.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="attachment-hint">Até 1 MB por arquivo; armazenado neste navegador.</p>
      {error && <p className="attachment-error" role="alert">{error}</p>}
    </section>
  );
}
