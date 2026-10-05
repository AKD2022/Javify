import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const units = JSON.parse(fs.readFileSync(new URL('../assets/Curriculum/units.json', import.meta.url), 'utf8'));
const contentSource = fs.readFileSync(new URL('../pages/utils/content.js', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '');
const content = await import(`data:text/javascript;base64,${Buffer.from('const units = ' + JSON.stringify(units) + ';\n' + contentSource).toString('base64')}`);
const source = fs.readFileSync(new URL('../pages/utils/quizStore.js', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '').replace('export async function', 'async function');
function harness({ fail = false } = {}) {
  const store = new Map(); let updates = 0;
  const context = {
    getContentVersion: content.getContentVersion, scoreForCurrentContent: content.scoreForCurrentContent, storageKeyForLesson: content.storageKeyForLesson, lessonKey: content.lessonKey,
    db: 'db', doc: (...parts) => parts.join('/'), serverTimestamp: () => 'SERVER_TIMESTAMP',
    localDateKey: () => '2026-10-03', nextStreak: () => 2, updateScore: () => updates++,
    runTransaction: async (_, run) => {
      const pending = [];
      const result = await run({ get: async ref => ({ exists: () => store.has(ref), data: () => store.get(ref) }), set: (ref, value, options) => pending.push(() => store.set(ref, options?.merge ? { ...store.get(ref), ...value } : value)), delete: ref => pending.push(() => store.delete(ref)) });
      if (fail) throw new Error('offline');
      pending.forEach(write => write());
      return result;
    },
  };
  vm.createContext(context); vm.runInContext(source, context);
  return { save: context.saveQuizAttempt, store, updates: () => updates };
}
const questions = [1, 2, 3, 4].map(id => ({ id, answer: 0, options: [{value: "A"}, {value: "B"}, {value: "C"}, {value: "D"}] }));
test('one attempt saves score, best score, activity, and missed-question queue atomically', async () => {
  const h = harness();
  const result = await h.save({ uid: 'u' }, '39', questions, { 1: 0, 2: 1, 3: 0, 4: 1 }, 30, 'attempt-a');
  assert.equal(result.score, 2);
  assert.equal(h.store.get('db/users/u/scores/lesson108').bestScore, 2);
  assert.equal(h.store.get('db/users/u').weeklyActivity['2026-10-03'], 1);
  assert.ok(h.store.has('db/users/u/reviewQueue/lesson108_2'));
  assert.ok(!h.store.has('db/users/u/reviewQueue/lesson108_1'));
});
test('retrying the same attempt does not double-count history or activity', async () => {
  const h = harness();
  for (let i = 0; i < 2; i++) await h.save({ uid: 'u' }, '39', questions, { 1: 0, 2: 0, 3: 0, 4: 0 }, 30, 'same-attempt');
  assert.equal(h.store.get('db/users/u').scoreStats.count, 1);
  assert.equal(h.store.get('db/users/u').weeklyActivity['2026-10-03'], 1);
});
test('a lower retake preserves mastery; later correct answers clear missed questions', async () => {
  const h = harness();
  await h.save({ uid: 'u' }, '39', questions, { 1: 0, 2: 0, 3: 0, 4: 0 }, 30, 'a');
  await h.save({ uid: 'u' }, '39', questions, { 1: 1, 2: 0, 3: 0, 4: 0 }, 30, 'b');
  assert.equal(h.store.get('db/users/u/scores/lesson108').score, 3);
  assert.equal(h.store.get('db/users/u/scores/lesson108').bestScore, 4);
  assert.ok(h.store.has('db/users/u/reviewQueue/lesson108_1'));
  await h.save({ uid: 'u' }, '39', questions, { 1: 0, 2: 0, 3: 0, 4: 0 }, 30, 'c');
  assert.ok(!h.store.has('db/users/u/reviewQueue/lesson108_1'));
});
test('a failed transaction leaves no partial writes or local score update', async () => {
  const h = harness({ fail: true });
  await assert.rejects(h.save({ uid: 'u' }, '39', questions, { 1: 0, 2: 0, 3: 0, 4: 0 }, 30, 'a'), /offline/);
  assert.equal(h.store.size, 0); assert.equal(h.updates(), 0);
});

test('idempotent retry returns the saved result even if the caller payload changes', async () => {
  const h = harness();
  await h.save({ uid: 'u' }, '39', questions, { 1: 0, 2: 0, 3: 0, 4: 0 }, 30, 'same');
  const retry = await h.save({ uid: 'u' }, '39', questions, { 1: 1, 2: 1, 3: 1, 4: 1 }, 90, 'same');
  assert.equal(retry.score, 4); assert.equal(retry.timeTaken, 30);
});

test('rewritten content does not inherit the old question bank best score', async () => {
  const h = harness();
  h.store.set('db/users/u/scores/lesson1', { score: 4, bestScore: 4 });
  const result = await h.save({ uid: 'u' }, '1', questions, { 1: 0, 2: 1, 3: 1, 4: 1 }, 30, 'new-version');
  assert.equal(result.score, 1);
  assert.equal(h.store.get('db/users/u/scores/lesson1').bestScore, 1);
  assert.equal(h.store.get('db/users/u/scores/lesson1').contentVersion, 2);
});
test('legacy quiz history seeds aggregates without growing the old array', async () => {
  const h = harness();
  h.store.set('db/users/u', { allScores: [{ score: 2, total: 4 }] });
  await h.save({ uid: 'u' }, '39', questions, { 1: 0, 2: 0, 3: 0, 4: 0 }, 30, 'new');
  assert.equal(h.store.get('db/users/u').allScores.length, 1);
  assert.equal(h.store.get('db/users/u').scoreStats.count, 2);
  assert.equal(h.store.get('db/users/u').scoreStats.percentageSum, 150);
});
test('incomplete or out-of-range quiz answers do not write results', async () => {
  const h = harness();
  await assert.rejects(h.save({ uid: 'u' }, '39', questions, { 1: 0 }, 30, 'missing'), /Complete all four/);
  await assert.rejects(h.save({ uid: 'u' }, '39', questions, { 1: 0, 2: 0, 3: 0, 4: 8 }, 30, 'invalid'), /Complete all four/);
  assert.equal(h.store.size, 0);
});
