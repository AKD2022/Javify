// Pure domain helpers shared by the app and regression tests.
export const localDateKey = (value = new Date()) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('Invalid date');
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
export const parseLocalDate = key => {
  if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) throw new Error('Choose valid dates.');
  const [y, m, d] = key.split('-').map(Number);
  const result = new Date(y, m - 1, d, 12);
  if (localDateKey(result) !== key) throw new Error('Choose valid dates.');
  return result;
};
export function sampleQuestions(questions, count = 4, random = Math.random) {
  const copy = [...questions];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}
export function validateStudyPlan(plan) {
  if (!plan || typeof plan !== 'object') throw new Error('Your saved plan is invalid. Create a new plan.');
  const start = parseLocalDate(plan.startDate);
  const end = parseLocalDate(plan.endDate);
  if (end < start) throw new Error('End date must be on or after the start date.');
  if (end - start > 3660 * 86400000) throw new Error('Choose a study period shorter than ten years.');
  const weekdays = plan.weekdays;
  if (!Array.isArray(weekdays) || !weekdays.length || weekdays.some(d => !Number.isInteger(d) || d < 0 || d > 6)) throw new Error('Select at least one study day.');
  if (!Number.isInteger(plan.dailyLimit) || plan.dailyLimit < 1 || plan.dailyLimit > 20) throw new Error('Choose a daily limit from 1 to 20.');
  if (plan.priorityUnits != null && (!Array.isArray(plan.priorityUnits) || plan.priorityUnits.length !== 4 || new Set(plan.priorityUnits).size !== 4 || plan.priorityUnits.some(id => !/^unit[1-4]$/.test(id)))) throw new Error('The saved topic priorities are invalid. Create a replacement plan.');
  return { start, end, weekdays };
}
export function buildStudySchedule(lessons, scores, plan, today = localDateKey()) {
  const { start, end, weekdays } = validateStudyPlan(plan);
  const first = parseLocalDate(today);
  if (start > first) first.setTime(start.getTime());
  const days = [];
  // A generous bound protects against accidentally scheduling centuries.
  for (let d = new Date(first); d <= end; d.setDate(d.getDate() + 1)) {
    if (days.length > 3660) throw new Error('Choose a study period shorter than ten years.');
    if (weekdays.includes(d.getDay())) days.push(localDateKey(d));
  }
  const remaining = prioritizeLessons(lessons, plan.priorityUnits).filter(l => plan.includeCompleted || (scores[l.id] ?? 0) < 4);
  const capacity = days.length * plan.dailyLimit;
  if (remaining.length > capacity) throw new Error(`${remaining.length} lessons remain, but these dates and study days allow ${capacity}. Extend the end date, add study days, or increase the daily limit.`);
  const items = {};
  remaining.forEach((lesson, index) => {
    // Spread lessons over the whole available period while respecting the cap.
    const day = days[Math.floor(index * days.length / remaining.length)];
    (items[day] ||= []).push({ id: lesson.id, name: lesson.title });
  });
  return items;
}
export function nextStreak(data, today = localDateKey()) {
  if (data.lastCompletedDate === today) return data.streak || 1;
  const yesterday = parseLocalDate(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return data.lastCompletedDate === localDateKey(yesterday) ? (data.streak || 0) + 1 : 1;
}

// Lower unit accuracy gets earlier study time. Ties retain course order.
export function diagnosticPriorityUnits(result) {
  const rows = result?.units;
  if (!Array.isArray(rows) || rows.length !== 4 || new Set(rows.map(u => u.unitId)).size !== 4 ||
      rows.some(u => !/^unit[1-4]$/.test(u.unitId) || !Number.isInteger(u.score) || !Number.isInteger(u.total) || u.total <= 0 || u.score < 0 || u.score > u.total)) return null;
  return [...rows].sort((a, b) => a.score / a.total - b.score / b.total || a.unitId.localeCompare(b.unitId)).map(u => u.unitId);
}
export function prioritizeLessons(lessons, priorityUnits = []) {
  if (!Array.isArray(priorityUnits)) return [...lessons];
  const rank = id => { const index = priorityUnits.indexOf(id); return index < 0 ? 4 : index; };
  return lessons.map((lesson, index) => ({ lesson, index })).sort((a, b) =>
    rank(a.lesson.unitId || `unit${a.lesson.topic?.split('.')[0]}`) - rank(b.lesson.unitId || `unit${b.lesson.topic?.split('.')[0]}`) || a.index - b.index
  ).map(item => item.lesson);
}
