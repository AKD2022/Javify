import { storageKeyForLesson, currentKeyFromStorage } from './content';
import { collection, getDocs, getDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { validateStudyPlan, diagnosticPriorityUnits } from './studyLogic';
import { units } from './units';
import { buildStudySchedule, parseLocalDate } from './studyLogic';

let calendarItems = {};
let owner = null;
const allLessons = () => units.flatMap(u => u.lessons);
export const getStudyPlan = async user => {
  if (!user) return null;
  const snap = await getDoc(doc(db, 'users', user.uid, 'settings', 'studyPlan'));
  if (!snap.exists()) return null;
  validateStudyPlan(snap.data());
  return snap.data();
};
export async function getCalendarSetup(user) {
  if (!user) throw new Error('Sign in to set up your calendar.');
  const [savedPlan, calendar] = await Promise.all([
    getDoc(doc(db, 'users', user.uid, 'settings', 'studyPlan')), getDocs(collection(db, 'users', user.uid, 'calendar')),
  ]);
  let plan = savedPlan.exists() ? savedPlan.data() : null;
  // An invalid existing plan must remain replaceable from Edit plan.
  if (plan) { try { validateStudyPlan(plan); } catch { plan = null; } }
  const hasPlan = savedPlan.exists() || !calendar.empty;
  if (hasPlan) return { plan, hasPlan, diagnostic: null };
  const diagnostic = await getDoc(doc(db, 'users', user.uid, 'diagnosticResults', 'latest'));
  const result = diagnostic.exists() ? diagnostic.data() : null;
  return { plan, hasPlan, diagnostic: result?.version === 2 && diagnosticPriorityUnits(result) ? result : null };
}
export async function saveStudyPlan(user, plan, scores = {}) {
  if (!user) throw new Error('Sign in to save your study plan.');
  const setup = await getCalendarSetup(user);
  if (!setup.hasPlan) {
    const priorityUnits = diagnosticPriorityUnits(setup.diagnostic);
    if (!priorityUnits) throw new Error('Complete the diagnostic from Calendar before creating your first plan.');
    plan = { ...plan, priorityUnits, includeCompleted: true, diagnosticAttemptId: setup.diagnostic.attemptId || 'initial' };
  }
  const items = buildStudySchedule(allLessons(), scores, plan);
  const old = await getDocs(collection(db, 'users', user.uid, 'calendar'));
  // The active course is below Firestore's 500-operation batch limit.
  const batch = writeBatch(db);
  const scheduledIds = new Set(Object.values(items).flat().map(lesson => storageKeyForLesson(lesson.id)));
  old.forEach(snap => { if (!scheduledIds.has(snap.id)) batch.delete(snap.ref); });
  let sequence = 0;
  Object.entries(items).forEach(([date, lessons]) => lessons.forEach(lesson => {
    batch.set(doc(db, 'users', user.uid, 'calendar', storageKeyForLesson(lesson.id)), { lessonId: storageKeyForLesson(lesson.id), date, order: sequence++ });
  }));
  batch.set(doc(db, 'users', user.uid, 'settings', 'studyPlan'), plan);
  await batch.commit();
  owner = user.uid;
  calendarItems = items;
  return items;
}
export async function loadCalendar(user, scores = {}) {
  if (owner !== user?.uid) calendarItems = {};
  owner = user?.uid ?? null;
  if (!user) return;
  const snapshot = await getDocs(collection(db, 'users', user.uid, 'calendar'));
  const catalog = new Map(allLessons().map(l => [l.id, l]));
  const storedOrder = new Map();
  const items = {};
  snapshot.forEach(snap => {
    const data = snap.data();
    const lesson = catalog.get(currentKeyFromStorage(data.lessonId));
    if (lesson && Number.isFinite(data.order)) storedOrder.set(lesson.id, data.order);
    if (!lesson || !data.date) return;
    try { parseLocalDate(data.date); } catch { return; }
    // Keep overdue dates visible; do not silently overload today's schedule.
    (items[data.date] ||= []).push({ id: lesson.id, name: lesson.title });
  });
  const order = new Map(allLessons().map((lesson, index) => [lesson.id, index]));
  Object.values(items).forEach(day => day.sort((a, b) => (storedOrder.get(a.id) ?? order.get(a.id)) - (storedOrder.get(b.id) ?? order.get(b.id))));
  if (owner === user.uid) calendarItems = items;
}
export const getCalendarItems = () => Object.fromEntries(Object.entries(calendarItems).map(([date, items]) => [date, items.map(item => ({ ...item }))]));
export const addOrUpdateCalendarItem = (lessonId, dateStr) => {
  parseLocalDate(dateStr);
  Object.keys(calendarItems).forEach(date => {
    calendarItems[date] = calendarItems[date].filter(item => item.id !== lessonId);
    if (!calendarItems[date].length) delete calendarItems[date];
  });
  (calendarItems[dateStr] ||= []).push({ id: lessonId, name: allLessons().find(l => l.id === lessonId)?.title || lessonId });
};
