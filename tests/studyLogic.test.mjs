import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source = fs.readFileSync(new URL('../pages/utils/studyLogic.js', import.meta.url), 'utf8');
const { sampleQuestions, buildStudySchedule, localDateKey, parseLocalDate, nextStreak } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const lessons = Array.from({ length: 53 }, (_, i) => ({ id: `lesson${i}`, title: `Topic ${i}` }));
const plan = { startDate: '2026-10-05', endDate: '2026-12-31', weekdays: [1, 3, 5], dailyLimit: 2 };
test('sampling is uniform across all 24 permutations of four questions', () => {
  const results = new Set();
  for (let a = 0; a < 4; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 2; c++) {
    const random = [a / 4, b / 3, c / 2];
    results.add(sampleQuestions([0, 1, 2, 3], 4, () => random.shift()).join(','));
  }
  assert.equal(results.size, 24);
});
test('selects four distinct questions without modifying the source bank', () => {
  const bank = Array.from({ length: 16 }, (_, id) => ({ id }));
  const before = JSON.stringify(bank);
  for (let i = 0; i < 100; i++) {
    const selected = sampleQuestions(bank);
    assert.equal(selected.length, 4);
    assert.equal(new Set(selected.map(q => q.id)).size, 4);
  }
  assert.equal(JSON.stringify(bank), before);
});
test('schedules every remaining topic once on preferred days within the cap', () => {
  const result = buildStudySchedule(lessons, { lesson0: 4, lesson1: 2 }, plan, '2026-10-03');
  assert.equal(Object.values(result).flat().length, 52);
  assert.equal(new Set(Object.values(result).flat().map(l => l.id)).size, 52);
  for (const [date, items] of Object.entries(result)) {
    assert.ok(date >= plan.startDate && date <= plan.endDate);
    assert.ok(plan.weekdays.includes(parseLocalDate(date).getDay()));
    assert.ok(items.length <= plan.dailyLimit);
    assert.ok(items.every(l => l.id !== 'lesson0'));
  }
});
test('includes both endpoints and supports a one-day plan', () => {
  const result = buildStudySchedule(lessons.slice(0, 2), {}, { ...plan, endDate: plan.startDate }, plan.startDate);
  assert.equal(result[plan.startDate].length, 2);
});
test('overdue replanning never schedules into the past', () => {
  const result = buildStudySchedule(lessons, { lesson0: 4 }, plan, '2026-11-01');
  assert.ok(Object.keys(result).every(d => d >= '2026-11-01'));
});
test('rejects insufficient capacity instead of silently overflowing', () => {
  assert.throws(() => buildStudySchedule(lessons, {}, { ...plan, endDate: plan.startDate }, '2026-10-03'), /53 lessons remain.*allow 2/);
});
test('rejects invalid dates, reversed ranges, empty weekdays, and invalid caps', () => {
  for (const change of [{ endDate: '2026-10-04' }, { startDate: '2026-02-30' }, { weekdays: [] }, { weekdays: [7] }, { dailyLimit: 0 }, { dailyLimit: 1.5 }]) {
    assert.throws(() => buildStudySchedule(lessons, {}, { ...plan, ...change }, '2026-10-03'));
  }
});
test('completed course has an empty schedule even if all dates have passed', () => {
  const scores = Object.fromEntries(lessons.map(l => [l.id, 4]));
  assert.deepEqual(buildStudySchedule(lessons, scores, plan, '2027-01-01'), {});
});
test('calendar arithmetic survives daylight saving transitions', () => {
  const result = buildStudySchedule(lessons.slice(0, 3), {}, { startDate: '2026-10-31', endDate: '2026-11-02', weekdays: [0, 1, 6], dailyLimit: 1 }, '2026-10-31');
  assert.deepEqual(Object.keys(result), ['2026-10-31', '2026-11-01', '2026-11-02']);
});
test('local date keys use the local calendar day rather than UTC', () => {
  const d = new Date(2026, 9, 3, 23, 45);
  assert.equal(localDateKey(d), '2026-10-03');
  assert.equal(localDateKey(parseLocalDate('2026-10-03')), '2026-10-03');
});
test('streak counts each local date once and resets after a missed day', () => {
  assert.equal(nextStreak({ streak: 5, lastCompletedDate: '2026-10-03' }, '2026-10-03'), 5);
  assert.equal(nextStreak({ streak: 5, lastCompletedDate: '2026-10-02' }, '2026-10-03'), 6);
  assert.equal(nextStreak({ streak: 5, lastCompletedDate: '2026-10-01' }, '2026-10-03'), 1);
});
