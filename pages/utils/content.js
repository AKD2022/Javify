import { units } from './units';
export const lessonEntries = units.flatMap(unit => unit.lessons.map(lesson => ({ ...lesson, unitId: unit.id, unitTitle: unit.title })));
export const lessonKey = id => `lesson${String(id ?? '').replace(/^lesson/, '')}`;
export const getEntry = id => lessonEntries.find(entry => entry.id === lessonKey(id));
// Persisted keys stay stable across renumbering; all UI/routes/assets use sequential IDs.
export const storageKeyForLesson = id => getEntry(id)?.storageKey ?? null;
export const currentKeyFromStorage = id => lessonEntries.find(entry => entry.storageKey === lessonKey(id))?.id ?? null;
export const getContentVersion = id => getEntry(id)?.contentVersion ?? null;
export const scoreForCurrentContent = (id, data) => {
  const version = getContentVersion(id);
  if (version == null || (data?.contentVersion ?? 1) !== version) return null;
  const score = data.bestScore ?? data.score;
  return Number.isInteger(score) && score >= 0 && score <= 4 ? score : null;
};
export function filterLessons(query) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return lessonEntries.filter(entry => {
    const text = `${entry.topic} ${entry.title} ${entry.description} ${entry.unitTitle}`.toLowerCase();
    return words.every(word => text.includes(word));
  });
}
