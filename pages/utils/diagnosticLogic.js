import { sampleQuestions } from './studyLogic';
export const DIAGNOSTIC_COUNTS = [6, 9, 4, 11];
export function selectDiagnosticQuestions(bank, random = Math.random) {
  const selected = DIAGNOSTIC_COUNTS.flatMap((count, index) => {
    const pool = bank.filter(q => q.unitId === `unit${index + 1}`);
    if (pool.length < count) throw new Error('The diagnostic question bank is incomplete.');
    return sampleQuestions(pool, count, random);
  });
  return sampleQuestions(selected, selected.length, random);
}
export function scoreDiagnostic(questions, answers) {
  if (questions.length !== 30 || questions.some(q => !Number.isInteger(answers[q.id]) || answers[q.id] < 0 || answers[q.id] >= q.options.length)) throw new Error('Answer all 30 questions before submitting.');
  const units = DIAGNOSTIC_COUNTS.map((_, i) => {
    const selected = questions.filter(q => q.unitId === `unit${i + 1}`);
    return { unitId: `unit${i + 1}`, score: selected.filter(q => q.answer === answers[q.id]).length, total: selected.length };
  });
  return { score: units.reduce((sum, unit) => sum + unit.score, 0), total: questions.length, units };
}
