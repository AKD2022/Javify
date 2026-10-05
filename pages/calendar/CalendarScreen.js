import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { auth } from '../../config/firebase';
import { getScores, loadScores } from '../utils/dataStore';
import { getCalendarItems, loadCalendar, getStudyPlan, getCalendarSetup } from '../utils/calendarstore';
import { localDateKey, parseLocalDate } from '../utils/studyLogic';
import colors from '../../assets/components/colors';
import GradientButton from '../../assets/components/gradientButton';
export default function CalendarScreen({ navigation }) {
  const [items, setItems] = useState({});
  const [scores, setScores] = useState({});
  const [selectedDate, setSelectedDate] = useState(localDateKey());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [plan, setPlan] = useState(null);
  const [diagnostic, setDiagnostic] = useState(null);
  const [retry, setRetry] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError('');
      try {
        await loadScores(auth.currentUser);
        const loadedScores = getScores();
        const [setup] = await Promise.all([getCalendarSetup(auth.currentUser), loadCalendar(auth.currentUser, loadedScores)]);
        if (active) { setScores(loadedScores); setItems(getCalendarItems()); setPlan(setup.hasPlan ? setup.plan || { legacy: true } : null); setDiagnostic(setup.diagnostic); }
      } catch { if (active) setError('Could not load your calendar. Check your connection and retry.'); }
      finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, [retry]));
  const today = localDateKey();
  const overdue = Object.entries(items).filter(([date]) => date < today).flatMap(([, lessons]) => lessons).filter(l => scores[l.id] !== 4);
  const markedDates = Object.fromEntries(Object.entries(items).map(([date, lessons]) => [date, { marked: true, dotColor: lessons.every(l => scores[l.id] === 4) ? '#287A45' : colors.basicButton }]));
  markedDates[selectedDate] = { ...markedDates[selectedDate], selected: true, selectedColor: colors.basicButton };
  const renderLesson = (lesson, prefix = '') => <TouchableOpacity key={prefix + lesson.id} accessibilityRole="button" style={styles.card} onPress={() => navigation.navigate('LessonScreen', { lessonId: lesson.id.replace('lesson', '') })}>
    <View style={{ flex: 1 }}><Text style={styles.label}>{lesson.name}</Text><Text style={styles.body}>{scores[lesson.id] === 4 ? 'Completed' : scores[lesson.id] != null ? 'In progress' : 'Not started'}</Text></View>
    <MaterialIcons name="chevron-right" size={26} color={colors.basicButton} />
  </TouchableOpacity>;
  if (!loading && !error && !plan) return <SafeAreaView style={styles.container} edges={['top']}><ScrollView contentContainerStyle={{ padding: 24, gap: 24 }}>
    <Text style={styles.title}>Your study calendar</Text>
    <View style={{ backgroundColor: '#EFEDFF', padding: 28, borderRadius: 26, gap: 16 }}><MaterialIcons name="event-note" size={52} color={colors.basicButton} /><Text style={styles.title}>{diagnostic ? 'Ready to build your plan' : 'A plan that starts with you'}</Text><Text style={styles.body}>{diagnostic ? 'Your diagnostic is saved. Choose your study days to turn your results into a calendar.' : 'Take a 30-question diagnostic to find your starting point, then choose your study days and pace.'}</Text></View>
    <View style={styles.cardColumn}><Text style={styles.label}>All lessons. Your priorities.</Text><Text style={styles.body}>Weaker units come first, with lessons in order within each unit. Every lesson stays in your plan—even topics you answered correctly.</Text></View>
    <GradientButton title={diagnostic ? 'Continue calendar setup' : 'Take the diagnostic'} onPress={() => navigation.navigate(diagnostic ? 'StudyPlan' : 'DiagnosticScreen')} />
  </ScrollView></SafeAreaView>;
  return <SafeAreaView style={styles.container} edges={['top']}><ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
    <View style={styles.row}><Text style={styles.title}>Study calendar</Text><TouchableOpacity accessibilityRole="button" disabled={loading || !!error || !plan} onPress={() => navigation.navigate('StudyPlan')} style={styles.edit}><Text style={{ color: colors.basicButton }}>Edit plan</Text></TouchableOpacity></View>
    <Calendar current={selectedDate} onDayPress={({ dateString }) => setSelectedDate(dateString)} markedDates={markedDates} style={styles.calendar} theme={{ todayTextColor: colors.basicButton, arrowColor: colors.basicButton }} />
    {loading ? <ActivityIndicator accessibilityLabel="Loading calendar" /> : error ? <View><Text style={styles.body}>{error}</Text><GradientButton title="Retry" onPress={() => setRetry(r => r + 1)} /></View> : <>
      {!!overdue.length && <View style={styles.cardColumn}><Text style={styles.label}>{overdue.length} overdue {overdue.length === 1 ? 'lesson' : 'lessons'}</Text><Text style={styles.body}>Continue below, or edit your plan to spread unfinished lessons across your available study days.</Text>{overdue.map(l => renderLesson(l, 'overdue-'))}</View>}
      <View style={styles.row}><Text style={styles.label}>{parseLocalDate(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</Text><TouchableOpacity style={styles.edit} onPress={() => setSelectedDate(today)} accessibilityRole="button"><Text style={{ color: colors.basicButton }}>Today</Text></TouchableOpacity></View>
      {items[selectedDate]?.length ? items[selectedDate].map(l => renderLesson(l)) : <Text style={styles.body}>No lessons scheduled for this date.</Text>}
    </>}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.defaultBackground },
  title: { fontFamily: 'Poppins-Bold', fontSize: 22, color: colors.black },
  label: { fontFamily: 'Poppins-SemiBold', fontSize: 16, color: colors.black, flexShrink: 1 },
  body: { fontFamily: 'Poppins-Regular', color: '#50586B', fontSize: 14, lineHeight: 22 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  edit: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  calendar: { borderRadius: 16, overflow: 'hidden', paddingTop: 8, paddingBottom: 18 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#D7DBE5' },
  cardColumn: { backgroundColor: '#fff', padding: 16, gap: 12, borderRadius: 12 },
});
