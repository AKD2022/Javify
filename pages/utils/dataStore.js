import { collection, getDocs } from 'firebase/firestore';
import { scoreForCurrentContent, currentKeyFromStorage } from './content';
import { db } from '../../config/firebase';
let scores = {};
let owner = null;
export const loadScores = async user => {
  if (owner !== user?.uid) scores = {};
  owner = user?.uid ?? null;
  if (!user) return;
  const snapshot = await getDocs(collection(db, 'users', user.uid, 'scores'));
  const loaded = {};
  snapshot.forEach(doc => { const key = currentKeyFromStorage(doc.id); const score = scoreForCurrentContent(key, doc.data()); if (score != null) loaded[key] = score; });
  if (owner === user.uid) scores = loaded;
};
export const getScoreForLesson = id => scores[id] ?? null;
export const updateScore = (id, score) => { scores[id] = Math.max(scores[id] ?? 0, score); };
export const getScores = () => ({ ...scores });
