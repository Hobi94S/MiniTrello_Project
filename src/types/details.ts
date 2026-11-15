// Tipos de domínio para o módulo de detalhes do cartão (Membro 5).
// Comentários e histórico ficam em slices próprias do AppContext
// ('comments' e 'activities'), relacionadas ao cartão pelo campo cardId.

export interface SessionUser {
  id: string;
  name: string;
}

export interface Comment {
  id: string;
  cardId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 'created' | 'updated' | 'moved' | 'deleted' | 'commented';

export interface Activity {
  sequence?: number;
  id: string;
  cardId: string;
  type: ActivityType;
  message: string;
  actorId: string;
  actorName: string;
  createdAt: string;
}

export const COMMENTS_KEY = 'comments';
export const ACTIVITIES_KEY = 'activities';
export const SESSION_KEY = 'session';
export const USERS_KEY = 'users';

// Permite usar o quadro sem uma sessão selecionada.
export const ANONYMOUS_USER: SessionUser = { id: 'anonimo', name: 'Usuário local' };

function newId(prefix: string) {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function readComments(value: unknown): Comment[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (c): c is Comment =>
      isRecord(c) &&
      typeof c.id === 'string' &&
      typeof c.cardId === 'string' &&
      typeof c.authorId === 'string' &&
      typeof c.authorName === 'string' &&
      typeof c.text === 'string' &&
      typeof c.createdAt === 'string' &&
      typeof c.updatedAt === 'string',
  );
}

export function readActivities(value: unknown): Activity[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (a): a is Activity =>
      isRecord(a) &&
      typeof a.id === 'string' &&
      typeof a.cardId === 'string' &&
      typeof a.type === 'string' &&
      typeof a.message === 'string' &&
      typeof a.actorId === 'string' &&
      typeof a.actorName === 'string' &&
      typeof a.createdAt === 'string',
  );
}

// Resolve o usuário atual a partir das slices 'session' e 'users' (Membro 2).
// Aceita variações de nome de campo para não depender do formato final da sessão.
export function readCurrentUser(data: Record<string, unknown>): SessionUser {
  const session = data[SESSION_KEY];
  const userId = isRecord(session)
    ? [session.userId, session.currentUserId, session.id].find((v) => typeof v === 'string')
    : typeof session === 'string' ? session : undefined;
  if (typeof userId !== 'string') return ANONYMOUS_USER;

  const users = data[USERS_KEY];
  const user = Array.isArray(users) ? users.find((u) => isRecord(u) && u.id === userId) : undefined;
  const name = isRecord(user) ? [user.name, user.nome, user.username].find((v) => typeof v === 'string') : undefined;
  return { id: userId, name: typeof name === 'string' ? name : userId };
}

export function commentsOf(all: Comment[], cardId: string): Comment[] {
  return all
    .filter((c) => c.cardId === cardId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function activitiesOf(all: Activity[], cardId: string): Activity[] {
  return all
    .filter((a) => a.cardId === cardId)
    .reverse()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || (b.sequence ?? 0) - (a.sequence ?? 0));
}

export function addComment(all: Comment[], cardId: string, author: SessionUser, text: string): Comment[] {
  const clean = text.trim();
  if (!clean) return all;
  const now = new Date().toISOString();
  return [...all, {
    id: newId('comment'), cardId, authorId: author.id, authorName: author.name, text: clean, createdAt: now, updatedAt: now,
  }];
}

export function editComment(all: Comment[], id: string, text: string): Comment[] {
  const clean = text.trim();
  if (!clean) return all;
  return all.map((c) => (c.id === id ? { ...c, text: clean, updatedAt: new Date().toISOString() } : c));
}

export function removeComment(all: Comment[], id: string): Comment[] {
  return all.filter((c) => c.id !== id);
}

export function appendActivity(
  all: Activity[], cardId: string, type: ActivityType, message: string, actor: SessionUser,
): Activity[] {
  return [...all, {
    sequence: all.reduce((max, item) => Math.max(max, item.sequence ?? 0), 0) + 1,
    id: newId('activity'), cardId, type, message, actorId: actor.id, actorName: actor.name, createdAt: new Date().toISOString(),
  }];
}

// Remove comentários e histórico de cartões que deixaram de existir.
export function pruneByCard<T extends { cardId: string }>(all: T[], cardId: string): T[] {
  return all.filter((item) => item.cardId !== cardId);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
