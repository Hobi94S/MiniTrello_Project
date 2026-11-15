import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useApp } from './AppContext';
import {
  ACTIVITIES_KEY, COMMENTS_KEY, activitiesOf, addComment, appendActivity, commentsOf, editComment,
  pruneByCard, readActivities, readComments, readCurrentUser, removeComment,
} from '../types/details';
import type { Activity, ActivityType, Comment, SessionUser } from '../types/details';

interface CardDetailsContextValue {
  currentUser: SessionUser;
  comments: Comment[];
  activities: Activity[];
  openCardId: string | null;
  openCard: (cardId: string) => void;
  closeCard: () => void;
  commentsOf: (cardId: string) => Comment[];
  activitiesOf: (cardId: string) => Activity[];
  addComment: (cardId: string, text: string) => void;
  updateComment: (commentId: string, text: string) => void;
  deleteComment: (commentId: string) => void;
  logActivity: (cardId: string, type: ActivityType, message: string) => void;
  clearCardHistory: (cardId: string) => void;
}

const CardDetailsContext = createContext<CardDetailsContextValue | null>(null);

export function CardDetailsProvider({ children }: { children: ReactNode }) {
  const { state, dispatch } = useApp();
  const [openCardId, setOpenCardId] = useState<string | null>(null);

  const currentUser = useMemo(() => readCurrentUser(state.data), [state.data]);
  const comments = useMemo(() => readComments(state.data[COMMENTS_KEY]), [state.data]);
  const activities = useMemo(() => readActivities(state.data[ACTIVITIES_KEY]), [state.data]);

  const saveComments = useCallback((next: Comment[]) => {
    dispatch({ type: 'SET_SLICE', key: COMMENTS_KEY, value: next });
  }, [dispatch]);

  const saveActivities = useCallback((next: Activity[]) => {
    dispatch({ type: 'SET_SLICE', key: ACTIVITIES_KEY, value: next });
  }, [dispatch]);

  const openCard = useCallback((cardId: string) => setOpenCardId(cardId), []);
  const closeCard = useCallback(() => setOpenCardId(null), []);

  const logActivity = useCallback((cardId: string, type: ActivityType, message: string) => {
    saveActivities(appendActivity(activities, cardId, type, message, currentUser));
  }, [activities, currentUser, saveActivities]);

  const handleAddComment = useCallback((cardId: string, text: string) => {
    const next = addComment(comments, cardId, currentUser, text);
    if (next === comments) return;
    saveComments(next);
    saveActivities(appendActivity(activities, cardId, 'commented', 'Comentário adicionado', currentUser));
  }, [comments, activities, currentUser, saveComments, saveActivities]);

  const handleUpdateComment = useCallback((commentId: string, text: string) => {
    const next = editComment(comments, commentId, text);
    if (next !== comments) saveComments(next);
  }, [comments, saveComments]);

  const handleDeleteComment = useCallback((commentId: string) => {
    saveComments(removeComment(comments, commentId));
  }, [comments, saveComments]);

  const clearCardHistory = useCallback((cardId: string) => {
    saveComments(pruneByCard(comments, cardId));
    saveActivities(pruneByCard(activities, cardId));
    setOpenCardId((current) => (current === cardId ? null : current));
  }, [comments, activities, saveComments, saveActivities]);

  const value: CardDetailsContextValue = useMemo(() => ({
    currentUser,
    comments,
    activities,
    openCardId,
    openCard,
    closeCard,
    commentsOf: (cardId) => commentsOf(comments, cardId),
    activitiesOf: (cardId) => activitiesOf(activities, cardId),
    addComment: handleAddComment,
    updateComment: handleUpdateComment,
    deleteComment: handleDeleteComment,
    logActivity,
    clearCardHistory,
  }), [
    currentUser, comments, activities, openCardId, openCard, closeCard,
    handleAddComment, handleUpdateComment, handleDeleteComment, logActivity, clearCardHistory,
  ]);

  return <CardDetailsContext.Provider value={value}>{children}</CardDetailsContext.Provider>;
}

export function useCardDetails() {
  const context = useContext(CardDetailsContext);
  if (!context) throw new Error('useCardDetails deve ser usado dentro de CardDetailsProvider.');
  return context;
}
