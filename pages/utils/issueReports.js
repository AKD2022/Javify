import AsyncStorage from '@react-native-async-storage/async-storage';
let pending = Promise.resolve();
const keyFor = uid => `javify:question-issues:${uid}`;
export async function loadIssueReports(uid) {
  if (!uid) throw new Error('Sign in to view reports.');
  const raw = await AsyncStorage.getItem(keyFor(uid));
  const reports = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(reports)) throw new Error('The local reports could not be read.');
  return reports;
}
export function saveIssueReport(uid, report) {
  const save = pending.catch(() => {}).then(async () => {
    const reports = await loadIssueReports(uid);
    const entry = { ...report, notes: String(report.notes || '').slice(0, 1000), savedAt: new Date().toISOString(), id: `${Date.now()}-${Math.random().toString(36).slice(2)}` };
    await AsyncStorage.setItem(keyFor(uid), JSON.stringify([...reports, entry]));
    return entry;
  });
  pending = save;
  return save;
}
