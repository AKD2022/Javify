import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read = name => fs.readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
const units = JSON.parse(read('assets/Curriculum/units.json'));
const content = await import(`data:text/javascript;base64,${Buffer.from(`const units = ${JSON.stringify(units)};\n` + read('pages/utils/content.js').replace(/^import .*;\n/gm, '')).toString('base64')}`);
test('stored scores load under consecutive current IDs and cannot leak between accounts', async () => {
  let fail = false;
  const rows = [
    ['lesson3', { score: 3, contentVersion: 2 }],
    ['lesson9', { score: 2, contentVersion: 2 }],
    ['lesson2', { score: 4 }], // retired legacy ID overlaps a different current lesson
    ['lesson101', { score: 4 }],
    ['lesson1', { score: 4 }], // old version of rewritten content
  ];
  const context = vm.createContext({ ...content, db: {}, collection: () => 'scores', getDocs: async () => {
    if (fail) throw new Error('offline');
    return { forEach: callback => rows.forEach(([id, data]) => callback({ id, data: () => data })) };
  } });
  vm.runInContext(read('pages/utils/dataStore.js').replace(/^import .*;\n/gm, '').replaceAll('export ', ''), context);
  const api = vm.runInContext('({ loadScores, getScores })', context);
  await api.loadScores({ uid: 'first' });
  const scores = api.getScores();
  assert.equal(scores.lesson2, 3); assert.equal(scores.lesson3, 2);
  assert.equal(scores.lesson6, 4); assert.equal(scores.lesson1, undefined);
  assert.equal(Object.keys(scores).length, 3);
  fail = true;
  await assert.rejects(api.loadScores({ uid: 'second' }), /offline/);
  assert.equal(Object.keys(api.getScores()).length, 0);
});
test('private issue reports serialize concurrent saves and remain isolated by account', async () => {
  const store = new Map(); let fail = false;
  const context = vm.createContext({ AsyncStorage: {
    getItem: async key => store.get(key) ?? null,
    setItem: async (key, value) => { if (fail) throw new Error('storage unavailable'); store.set(key, value); },
  } });
  vm.runInContext(read('pages/utils/issueReports.js').replace(/^import .*;\n/gm, '').replaceAll('export ', ''), context);
  const api = vm.runInContext('({ loadIssueReports, saveIssueReport })', context);
  await Promise.all([api.saveIssueReport('a', { question: 'first' }), api.saveIssueReport('a', { question: 'second' }), api.saveIssueReport('b', { question: 'private' })]);
  assert.equal((await api.loadIssueReports('a')).length, 2);
  assert.equal((await api.loadIssueReports('b'))[0].question, 'private');
  fail = true; await assert.rejects(api.saveIssueReport('a', { question: 'failed' }), /storage unavailable/);
  fail = false; await api.saveIssueReport('a', { question: 'retry' });
  assert.equal((await api.loadIssueReports('a')).length, 3);
  await assert.rejects(api.loadIssueReports(null), /Sign in/);
});
