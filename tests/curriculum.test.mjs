import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { parse } = require('@babel/parser');
const root = new URL('../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const units = JSON.parse(read('assets/Curriculum/units.json'));
test('all 53 current topics are mapped once with valid lessons and 16-question banks', () => {
  assert.deepEqual(units.map(u => u.lessons.length), [15, 12, 9, 17]);
  const ids = new Set();
  units.forEach((unit, ui) => unit.lessons.forEach((entry, ti) => {
    assert.equal(entry.topic, `${ui + 1}.${ti + 1}`);
    assert.ok(!ids.has(entry.id)); ids.add(entry.id);
    const n = entry.id.replace('lesson', '');
    const lesson = JSON.parse(read(`assets/Lessons/lesson${n}.json`));
    const quiz = JSON.parse(read(`assets/Questions/question${n}.json`));
    assert.ok(lesson.content.length > 0, entry.id);
    assert.equal(quiz.questions.length, 16, entry.id);
    assert.equal(new Set(quiz.questions.map(q => q.id)).size, 16, entry.id);
    for (const q of quiz.questions) {
      assert.ok(q.question && q.explanation, `${entry.id}/${q.id}`);
      assert.equal(q.options.length, 4);
      assert.equal(new Set(q.options.map(o => o.value)).size, 4, `${entry.id}/${q.id} ambiguous options`);
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4);
    }
    assert.ok(read('pages/utils/lessonRegistry.js').includes(`lesson${n}: item${n}`));
    assert.ok(read('pages/utils/quizRegistry.js').includes(`lesson${n}: item${n}`));
  }));
});
test('all app JavaScript parses and local imports resolve', () => {
  const files = [fileURLToPath(new URL('App.js', root))];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (file.endsWith('.js')) files.push(file);
    }
  }
  for (const folder of ['pages', 'login', 'assets/components']) walk(fileURLToPath(new URL(folder, root)));
  for (const file of files) {
    const ast = parse(fs.readFileSync(file, 'utf8'), { sourceType: 'module', plugins: ['jsx'] });
    for (const node of ast.program.body) {
      if (node.type === 'ImportDeclaration' && node.source.value.startsWith('.')) {
        const target = path.resolve(path.dirname(file), node.source.value);
        assert.ok(['', '.js', '.json', '/index.js'].some(ext => fs.existsSync(target + ext)), `${file}: ${node.source.value}`);
      }
    }
  }
});
