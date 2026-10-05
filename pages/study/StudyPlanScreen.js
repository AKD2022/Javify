import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DatePickerModal, registerTranslation, enGB } from 'react-native-paper-dates';
import { auth } from '../../config/firebase';
import { getStudyPlan, getCalendarSetup, saveStudyPlan } from '../utils/calendarstore';
import { getScores, loadScores } from '../utils/dataStore';
import { buildStudySchedule, localDateKey, parseLocalDate, diagnosticPriorityUnits } from '../utils/studyLogic';
import { units } from '../utils/units';
import colors from '../../assets/components/colors';
import GradientButton from '../../assets/components/gradientButton';
import UnitOrder from '../components/UnitOrder';
registerTranslation('en', enGB);
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export default function StudyPlanScreen({ navigation }) {
  const today = localDateKey();
  const later = new Date(); later.setDate(later.getDate() + 90);
  const [plan, setPlan] = useState({ startDate: today, endDate: localDateKey(later), weekdays: [1, 2, 3, 4, 5], dailyLimit: 2 });
  const [limitText, setLimitText] = useState('2');
  const [picker, setPicker] = useState(null);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [needsDiagnostic, setNeedsDiagnostic] = useState(false);
  const load = async () => {
    setLoading(true); setError('');
    try {
      const [setup] = await Promise.all([getCalendarSetup(auth.currentUser), loadScores(auth.currentUser)]);
      const saved = setup.plan;
      setNeedsDiagnostic(!setup.hasPlan && !setup.diagnostic);
      if (!saved && setup.diagnostic) setPlan(p => ({ ...p, priorityUnits: diagnosticPriorityUnits(setup.diagnostic), includeCompleted: true }));
      if (saved) { setPlan(saved); setLimitText(String(saved.dailyLimit)); }
      setScores(getScores());
    } catch { setError('Could not load your plan. Please retry before editing.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const preview = useMemo(() => {
    try {
      const items = buildStudySchedule(units.flatMap(u => u.lessons), scores, plan);
      const dates = Object.keys(items);
      return { text: `${Object.values(items).flat().length} lessons across ${dates.length} study days${dates.length ? `, finishing ${dates[dates.length - 1]}` : ''}.` };
    } catch (e) { return { error: e.message }; }
  }, [plan, scores]);
  const save = async () => {
    if (saving || preview.error) return;
    setSaving(true);
    try {
      // Refresh progress so a completed lesson isn't scheduled from stale state.
      await loadScores(auth.currentUser);
      await saveStudyPlan(auth.currentUser, plan, getScores());
      navigation.navigate('MainTabs', { screen: 'Calendar' });
    } catch (e) { Alert.alert('Plan not saved', e.message); }
    finally { setSaving(false); }
  };
  if (loading) return <SafeAreaView style={styles.container}><ActivityIndicator accessibilityLabel="Loading study plan" /></SafeAreaView>;
  if (needsDiagnostic) return <SafeAreaView style={styles.container}><Text style={{ padding: 20 }}>Start with the diagnostic in Calendar to personalize your first study plan.</Text><GradientButton title="Go to Calendar" onPress={() => navigation.navigate('MainTabs', { screen: 'Calendar' })} /></SafeAreaView>;
  if (error) return <SafeAreaView style={styles.container}><Text>{error}</Text><GradientButton title="Retry" onPress={load} /><GradientButton title="Create a replacement plan" onPress={() => setError('')} /></SafeAreaView>;
  return <SafeAreaView edges={['bottom']} style={styles.container}>
    <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Your study plan</Text>
      <Text style={styles.body}>Choose a pace you can keep. Saving updates your schedule; completed lesson progress stays saved.</Text>
      {!!plan.priorityUnits?.length && <View style={[styles.card, { backgroundColor: '#EFEDFF' }]}><Text style={styles.label}>Based on your diagnostic</Text><UnitOrder units={plan.priorityUnits} /><Text style={styles.body}>Weaker units come first; all lessons are included, in order within each unit.</Text></View>}
      {['startDate', 'endDate'].map(field => <TouchableOpacity key={field} accessibilityRole="button" style={styles.card} onPress={() => setPicker(field)} disabled={saving}>
        <Text style={styles.label}>{field === 'startDate' ? 'Start date' : 'Finish by'}</Text><Text style={styles.body}>{plan[field]}</Text>
      </TouchableOpacity>)}
      <Text style={styles.label}>Preferred study days</Text>
      <View style={styles.dayRow}>{days.map((day, index) => <TouchableOpacity key={day} accessibilityRole="checkbox" accessibilityLabel={day} accessibilityState={{ checked: plan.weekdays.includes(index) }} disabled={saving} onPress={() => setPlan(p => ({ ...p, weekdays: p.weekdays.includes(index) ? p.weekdays.filter(d => d !== index) : [...p.weekdays, index] }))} style={[styles.day, plan.weekdays.includes(index) && styles.selected]}><Text style={{ color: plan.weekdays.includes(index) ? '#fff' : colors.black }}>{day}</Text></TouchableOpacity>)}</View>
      <Text style={styles.label}>Maximum lessons per study day (1–20)</Text>
      <TextInput accessibilityLabel="Maximum lessons per day" style={styles.input} keyboardType="number-pad" value={limitText} editable={!saving} onChangeText={text => { setLimitText(text); setPlan(p => ({ ...p, dailyLimit: /^\d+$/.test(text) ? Number(text) : 0 })); }} />
      <Text accessibilityLiveRegion="polite" style={[styles.body, preview.error && { color: '#A32121' }]}>{preview.error || preview.text}</Text>
      <GradientButton title={saving ? 'Saving…' : 'Save study plan'} onPress={save} disabled={saving || !!preview.error} />
      <Text style={styles.body}>Overdue lessons are included when you save a revised plan. If your chosen days cannot fit the remaining lessons, extend the period or increase the limit.</Text>
    </ScrollView>
    <DatePickerModal locale="en" mode="single" visible={!!picker} date={parseLocalDate(plan[picker || 'startDate'])} onDismiss={() => setPicker(null)} onConfirm={({ date }) => { if (date && picker) setPlan(p => ({ ...p, [picker]: localDateKey(date) })); setPicker(null); }} />
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.defaultBackground },
  title: { fontFamily: 'Poppins-Bold', fontSize: 24, color: colors.black },
  body: { fontFamily: 'Poppins-Regular', fontSize: 15, color: '#3F4656', lineHeight: 23 },
  label: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: colors.black },
  card: { padding: 16, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#D7DBE5' },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  day: { minWidth: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#9AA3B8' },
  selected: { backgroundColor: colors.basicButton, borderColor: colors.basicButton },
  input: { minHeight: 48, padding: 12, backgroundColor: '#fff', borderRadius: 10, borderColor: '#9AA3B8', borderWidth: 1, fontSize: 18 },
});
