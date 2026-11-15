import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { useCardDetails } from '../../contexts/CardDetailsContext';
import { formatDateTime } from '../../types/details';
import type { Comment } from '../../types/details';

function CommentItem({ comment }: { comment: Comment }) {
  const { currentUser, updateComment, deleteComment } = useCardDetails();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.text);
  const isAuthor = comment.authorId === currentUser.id;
  const edited = comment.updatedAt !== comment.createdAt;

  function save(e: FormEvent) {
    e.preventDefault();
    if (draft.trim()) updateComment(comment.id, draft);
    setEditing(false);
  }

  function handleDelete() {
    if (window.confirm('Excluir este comentário?')) deleteComment(comment.id);
  }

  return (
    <li className="comment">
      <div className="comment-meta">
        <span className="comment-author">{comment.authorName}</span>
        <time className="comment-time" dateTime={comment.createdAt}>
          {formatDateTime(comment.createdAt)}{edited && ' (editado)'}
        </time>
        {isAuthor && !editing && (
          <div className="comment-actions">
            <button onClick={() => { setDraft(comment.text); setEditing(true); }} aria-label="Editar comentário">✎</button>
            <button onClick={handleDelete} aria-label="Excluir comentário">✕</button>
          </div>
        )}
      </div>
      {editing ? (
        <form className="comment-form" onSubmit={save}>
          <textarea
            className="form-textarea"
            autoFocus
            value={draft}
            rows={2}
            aria-label="Editar comentário"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') setEditing(false); }}
          />
          <div className="form-actions">
            <button type="button" className="form-cancel-button" onClick={() => setEditing(false)}>Cancelar</button>
            <button type="submit" className="form-save-button" disabled={!draft.trim()}>Salvar</button>
          </div>
        </form>
      ) : (
        <p className="comment-text">{comment.text}</p>
      )}
    </li>
  );
}

export function CommentSection({ cardId }: { cardId: string }) {
  const { currentUser, commentsOf, addComment } = useCardDetails();
  const textId = useId();
  const [text, setText] = useState('');
  const comments = commentsOf(cardId);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    addComment(cardId, text);
    setText('');
  }

  return (
    <section className="details-section" aria-labelledby={`${textId}-heading`}>
      <h3 id={`${textId}-heading`} className="details-section-title">Comentários ({comments.length})</h3>
      {comments.length === 0 ? (
        <p className="details-empty">Nenhum comentário ainda.</p>
      ) : (
        <ul className="comment-list">
          {comments.map((c) => <CommentItem key={c.id} comment={c} />)}
        </ul>
      )}
      <form className="comment-form" onSubmit={onSubmit}>
        <label className="form-label" htmlFor={textId}>Comentar como {currentUser.name}</label>
        <textarea
          id={textId}
          className="form-textarea"
          value={text}
          rows={2}
          placeholder="Escreva um comentário"
          onChange={(e) => setText(e.target.value)}
        />
        <div className="form-actions">
          <button type="submit" className="form-save-button" disabled={!text.trim()}>Comentar</button>
        </div>
      </form>
    </section>
  );
}
