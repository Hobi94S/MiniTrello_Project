import { useId } from 'react';
import { useCardDetails } from '../../contexts/CardDetailsContext';
import { formatDateTime } from '../../types/details';
import type { ActivityType } from '../../types/details';

const ICONS: Record<ActivityType, string> = {
  created: '+',
  updated: '✎',
  moved: '→',
  deleted: '✕',
  commented: '💬',
};

export function ActivityLog({ cardId }: { cardId: string }) {
  const { activitiesOf } = useCardDetails();
  const headingId = useId();
  const activities = activitiesOf(cardId);

  return (
    <section className="details-section" aria-labelledby={headingId}>
      <h3 id={headingId} className="details-section-title">Histórico</h3>
      {activities.length === 0 ? (
        <p className="details-empty">Nenhuma atividade registrada.</p>
      ) : (
        <ol className="activity-list">
          {activities.map((a) => (
            <li key={a.id} className={`activity activity-${a.type}`}>
              <span className="activity-icon" aria-hidden="true">{ICONS[a.type] ?? '•'}</span>
              <div>
                <p className="activity-message">{a.message}</p>
                <small className="activity-meta">
                  {a.actorName} · <time dateTime={a.createdAt}>{formatDateTime(a.createdAt)}</time>
                </small>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
