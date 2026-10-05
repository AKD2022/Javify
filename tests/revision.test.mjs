import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = new URL('../', import.meta.url);
const read = p => fs.readFileSync(new URL(p, root), 'utf8');
const units = JSON.parse(read('assets/Curriculum/units.json'));
const content = await import(`data:text/javascript;base64,${Buffer.from('const units = ' + JSON.stringify(units) + ';\n' + read('pages/utils/content.js').replace(/^import .*;\n/gm, '')).toString('base64')}`);
const logicUrl = `data:text/javascript;base64,${Buffer.from(read('pages/utils/studyLogic.js')).toString('base64')}`;
const diagnostic = await import(`data:text/javascript;base64,${Buffer.from(read('pages/utils/diagnosticLogic.js').replace("'./studyLogic'", JSON.stringify(logicUrl))).toString('base64')}`);
const formatting = await import(`data:text/javascript;base64,${Buffer.from(read('pages/utils/lessonFormatting.js')).toString('base64')}`);
const bank = JSON.parse(read('assets/Diagnostic/diagnostic-v2.json')).questions;
test('only 53 active lesson files and 53 question banks remain', () => {
  const ids = new Set(units.flatMap(u => u.lessons).map(l => Number(l.id.replace('lesson', ''))));
  for (const [folder, prefix] of [['Lessons', 'lesson'], ['Questions', 'question']]) {
    const files = fs.readdirSync(new URL(`assets/${folder}`, root)).filter(f => f.endsWith('.json'));
    assert.equal(files.length, 53);
    files.forEach(f => assert.ok(ids.has(Number(f.replace(prefix, '').replace('.json', '')))));
  }
});
test('every maintained project JSON is nonblank and parses', () => {
  let count = 0;
  const skip = new Set(['node_modules', '.git', '.expo', 'dist', 'build', 'Pods', '.gradle']);
  function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(e.name)) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.json')) { const data = fs.readFileSync(p, 'utf8'); assert.ok(data.trim(), p); assert.doesNotThrow(() => JSON.parse(data), p); count++; }
    }
  }
  walk(fileURLToPath(root)); assert.ok(count > 100);
});
test('all inherited active lessons are rewritten and have new question identities', () => {
  for (const entry of content.lessonEntries.filter(e => e.contentVersion === 2)) {
    const n = entry.id.replace('lesson', '');
    const lesson = JSON.parse(read(`assets/Lessons/lesson${n}.json`));
    const quiz = JSON.parse(read(`assets/Questions/question${n}.json`));
    assert.equal(lesson.contentVersion, 2); assert.equal(quiz.contentVersion, 2);
    assert.equal(lesson.content.filter(b => b.type === 'heading').length, 6);
    assert.ok(quiz.questions.every(q => q.id.startsWith('v2-')));
  }
});
test('diagnostic pool covers all topics and selects a balanced 30 without repetition', () => {
  assert.equal(new Set(bank.map(q => q.topic)).size, 53);
  for (let i = 0; i < 20; i++) {
    const selected = diagnostic.selectDiagnosticQuestions(bank);
    assert.equal(selected.length, 30); assert.equal(new Set(selected.map(q => q.id)).size, 30);
    assert.deepEqual([1, 2, 3, 4].map(u => selected.filter(q => q.unitId === `unit${u}`).length), [6, 9, 4, 11]);
  }
});
test('diagnostic scores and unit breakdowns agree; unanswered items cannot be submitted', () => {
  const selected = diagnostic.selectDiagnosticQuestions(bank);
  const answers = Object.fromEntries(selected.map(q => [q.id, q.answer]));
  assert.equal(diagnostic.scoreDiagnostic(selected, answers).score, 30);
  answers[selected[0].id] = (selected[0].answer + 1) % 4;
  const result = diagnostic.scoreDiagnostic(selected, answers);
  assert.equal(result.score, 29); assert.equal(result.units.reduce((sum, u) => sum + u.score, 0), 29);
  delete answers[selected[1].id]; assert.throws(() => diagnostic.scoreDiagnostic(selected, answers), /Answer all 30/);
});
test('search handles topic numbers, case, whitespace, and multiple terms', () => {
  assert.ok(content.filterLessons('  ARRAYLIST  ').length >= 3);
  assert.equal(content.filterLessons('4.8')[0].topic, '4.8');
  assert.ok(content.filterLessons('class methods').length >= 1);
  assert.equal(content.filterLessons('no-such-topic-xyz').length, 0);
  assert.equal(content.filterLessons('').length, 53);
});
test('old scores cannot unlock rewritten content; unchanged added lessons retain scores', () => {
  assert.equal(content.scoreForCurrentContent('1', { score: 4 }), null);
  assert.equal(content.scoreForCurrentContent('1', { score: 4, contentVersion: 2 }), 4);
  assert.equal(content.scoreForCurrentContent('39', { score: 4 }), 4);
  assert.equal(content.scoreForCurrentContent('54', { score: 4 }), null);
});
test('inline formatting detects complete Java terms without splitting English words', () => {
  const pieces = formatting.splitJavaTerms('String uses integer positions and int values.');
  assert.deepEqual(pieces.filter(p => p.code).map(p => p.value), ['String', 'int']);
  assert.equal(pieces.map(p => p.value).join(''), 'String uses integer positions and int values.');
  assert.equal(formatting.splitJavaTerms('`count` increases.')[0].code, true);
  assert.equal(formatting.splitJavaTerms('Math.random()')[0].value, 'Math.random()');
});
test('lesson IDs, visible numbers, files, and diagnostic links follow the consecutive course order', () => {
  assert.deepEqual(content.lessonEntries.map(e => e.id), Array.from({ length: 53 }, (_, i) => `lesson${i + 1}`));
  assert.deepEqual(content.lessonEntries.map(e => e.number), Array.from({ length: 53 }, (_, i) => i + 1));
  for (const entry of content.lessonEntries) {
    for (const [folder, prefix] of [['Lessons', 'lesson'], ['Questions', 'question']]) {
      const payload = JSON.parse(read(`assets/${folder}/${prefix}${entry.number}.json`));
      assert.equal(payload.lessonId, entry.number);
      if (payload.topic) assert.equal(payload.topic, entry.topic);
      assert.equal(payload.title, JSON.parse(read(`assets/Lessons/lesson${entry.number}.json`)).title);
    }
  }
  for (const q of bank) assert.equal(content.getEntry(q.lessonId).topic, q.topic);
});
test('renumbering resolves overlapping historical IDs without attaching progress to the wrong topic', () => {
  assert.equal(content.currentKeyFromStorage('lesson3'), 'lesson2');
  assert.equal(content.storageKeyForLesson('lesson3'), 'lesson9');
  assert.equal(content.currentKeyFromStorage('lesson2'), null); // retired legacy lesson, not current lesson 2
  assert.equal(new Set(content.lessonEntries.map(e => e.storageKey)).size, 53);
  for (const e of content.lessonEntries) {
    assert.equal(content.currentKeyFromStorage(content.storageKeyForLesson(e.id)), e.id);
  }
});
test('diagnostic prompts and answer keys match their current source lessons', () => {
  for (const question of bank) {
    const source = JSON.parse(read(`assets/Questions/question${question.lessonId}.json`)).questions.find(q => q.question === question.question);
    assert.ok(source, question.id);
    assert.deepEqual(source.options, question.options, question.id);
    assert.equal(source.answer, question.answer, question.id);
    assert.equal(source.explanation, question.explanation, question.id);
  }
});
