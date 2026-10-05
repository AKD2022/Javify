import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read = p => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const units = JSON.parse(read('assets/Curriculum/units.json'));
const logic = await import(`data:text/javascript;base64,${Buffer.from(read('pages/utils/studyLogic.js')).toString('base64')}`);
const content = await import(`data:text/javascript;base64,${Buffer.from(`const units = ${JSON.stringify(units)};\n` + read('pages/utils/content.js').replace(/^import .*;\n/gm, '')).toString('base64')}`);
const diagnostic = { version: 2, attemptId: 'diagnostic-a', units: [
  { unitId: 'unit1', score: 3, total: 6 }, { unitId: 'unit2', score: 3, total: 9 },
  { unitId: 'unit3', score: 0, total: 4 }, { unitId: 'unit4', score: 11, total: 11 },
] };
const plan = { startDate: '2090-01-01', endDate: '2090-03-31', weekdays: [0, 1, 2, 3, 4, 5, 6], dailyLimit: 2 };
const base = 'db/users/student';
function harness() {
  const store = new Map(); let commits = 0; const reads = [];
  const context = vm.createContext({ ...logic, ...content, units, db: 'db',
    collection: (...p) => p.join('/'), doc: (...p) => p.join('/'),
    getDoc: async ref => { reads.push(ref); return { exists: () => store.has(ref), data: () => store.get(ref) }; },
    getDocs: async ref => { const docs = [...store.entries()].filter(([key]) => key.startsWith(ref + '/')).map(([key, value]) => ({ id: key.slice(ref.length + 1), ref: key, data: () => value })); return { empty: docs.length === 0, docs, forEach: fn => docs.forEach(fn) }; },
    writeBatch: () => { const pending = []; return { set: (ref, value) => pending.push(() => store.set(ref, structuredClone(value))), delete: ref => pending.push(() => store.delete(ref)), commit: async () => { pending.forEach(fn => fn()); commits++; } }; },
  });
  vm.runInContext(read('pages/utils/calendarstore.js').replace(/^import .*;\n/gm, '').replaceAll('export ', ''), context);
  const api = vm.runInContext('({ getCalendarSetup, saveStudyPlan, loadCalendar, getCalendarItems })', context);
  return { ...api, store, reads, commits: () => commits };
}
test('unit priorities use accuracy rather than raw correct count, with stable course-order ties', () => {
  assert.deepEqual(logic.diagnosticPriorityUnits(diagnostic), ['unit3', 'unit2', 'unit1', 'unit4']);
  const tie = { units: diagnostic.units.map(u => ({ ...u, score: 0 })) };
  assert.deepEqual(logic.diagnosticPriorityUnits(tie), ['unit1', 'unit2', 'unit3', 'unit4']);
  assert.equal(logic.diagnosticPriorityUnits({ units: [{ unitId: 'unit1', score: 0, total: 0 }] }), null);
});
test('adaptive schedules keep all 53 lessons, preserve within-unit order, and respect study-day capacity', () => {
  const lessons = units.flatMap(u => u.lessons);
  const order = logic.diagnosticPriorityUnits(diagnostic);
  const dates = logic.buildStudySchedule(lessons, { lesson1: 4 }, { ...plan, priorityUnits: order, includeCompleted: true }, plan.startDate);
  const scheduled = Object.values(dates).flat();
  assert.equal(scheduled.length, 53); assert.equal(new Set(scheduled.map(l => l.id)).size, 53);
  assert.deepEqual(scheduled.map(l => l.id), order.flatMap(id => units.find(u => u.id === id).lessons.map(l => l.id)));
  assert.ok(Object.values(dates).every(day => day.length <= 2));
});
test('first calendar save requires a persisted diagnostic and writes nothing when missing', async () => {
  const h = harness();
  assert.equal((await h.getCalendarSetup({ uid: 'student' })).hasPlan, false);
  await assert.rejects(h.saveStudyPlan({ uid: 'student' }, plan), /Complete the diagnostic/);
  assert.equal(h.commits(), 0); assert.equal(h.store.size, 0);
});
test('saved diagnostic resumes setup, and completed calendar hides the diagnostic without rereading it', async () => {
  const h = harness(); h.store.set(`${base}/diagnosticResults/latest`, diagnostic);
  assert.equal((await h.getCalendarSetup({ uid: 'student' })).diagnostic.attemptId, 'diagnostic-a');
  await h.saveStudyPlan({ uid: 'student' }, plan, { lesson1: 4 });
  const stored = h.store.get(`${base}/settings/studyPlan`);
  assert.equal(stored.includeCompleted, true);
  assert.deepEqual(Array.from(stored.priorityUnits), ['unit3', 'unit2', 'unit1', 'unit4']);
  const count = h.reads.filter(p => p.endsWith('diagnosticResults/latest')).length;
  assert.equal((await h.getCalendarSetup({ uid: 'student' })).hasPlan, true);
  assert.equal(h.reads.filter(p => p.endsWith('diagnosticResults/latest')).length, count);
  await h.loadCalendar({ uid: 'student' });
  assert.equal(Object.values(h.getCalendarItems()).flat().length, 53);
});
test('legacy calendars are treated as already set up', async () => {
  const h = harness(); h.store.set(`${base}/calendar/lesson3`, { lessonId: 'lesson3', date: '2090-01-01' });
  assert.equal((await h.getCalendarSetup({ uid: 'student' })).hasPlan, true);
  assert.ok(!h.reads.some(p => p.endsWith('diagnosticResults/latest')));
});
test('plain English this stays prose; intentionally marked Java this is highlighted', async () => {
  const formatting = await import(`data:text/javascript;base64,${Buffer.from(read('pages/utils/lessonFormatting.js')).toString('base64')}`);
  assert.ok(formatting.splitJavaTerms('Explain why this boundary case is useful.').every(p => !p.code));
  assert.deepEqual(formatting.splitJavaTerms('Use `this.value` for the field.').filter(p => p.code).map(p => p.value), ['this.value']);
});
test('malformed existing plans can be replaced without trapping users in diagnostic setup', async () => {
  const h = harness(); h.store.set(`${base}/settings/studyPlan`, { startDate: 'bad' });
  const setup = await h.getCalendarSetup({ uid: 'student' });
  assert.equal(setup.hasPlan, true); assert.equal(setup.plan, null);
  await h.saveStudyPlan({ uid: 'student' }, plan);
  assert.equal(h.store.get(`${base}/settings/studyPlan`).startDate, plan.startDate);
});
