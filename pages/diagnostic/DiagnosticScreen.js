import { getCalendarSetup } from '../utils/calendarstore';
import QuizLayout from '../components/QuizLayout';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, usePreventRemove } from '@react-navigation/native';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { selectDiagnosticQuestions, scoreDiagnostic } from '../utils/diagnosticLogic';
import bank from '../../assets/Diagnostic/diagnostic-v2.json';
import colors from '../../assets/components/colors';
import GradientButton from '../../assets/components/gradientButton';
export default function DiagnosticScreen({ navigation }) {
  const [checking, setChecking] = useState(true), [setupError, setSetupError] = useState('');
  useEffect(() => {
    let active = true;
    getCalendarSetup(auth.currentUser).then(setup => {
      if (!active) return;
      if (setup.hasPlan) { navigation.replace('MainTabs', { screen: 'Calendar' }); return; }
      if (setup.diagnostic) { navigation.replace('StudyPlan'); return; }
      setChecking(false);
    }).catch(() => { if (active) { setSetupError('Unable to check calendar setup. Return to Calendar and retry.'); setChecking(false); } });
    return () => { active = false; };
  }, [navigation]);
  const [questions] = useState(() => selectDiagnosticQuestions(bank.questions));
  const [started, setStarted] = useState(false), [index, setIndex] = useState(0), [answers, setAnswers] = useState({});
  const [elapsed, setElapsed] = useState(0), [saving, setSaving] = useState(false), [frozen, setFrozen] = useState(false);
  const focused = useIsFocused();
  const finished = useRef(false);
  const lock = useRef(false), savedTime = useRef(null), scroll = useRef(null);
  const attemptId = useRef(doc(collection(db, '_ids')).id);
  useEffect(() => {
    if (!started || frozen || !focused) return;
    const timer = setInterval(() => setElapsed(n => n + 1), 1000);
    return () => clearInterval(timer);
  }, [started, frozen, focused]);
  useEffect(() => { scroll.current?.scrollTo({ y: 0, animated: false }); }, [index]);
  usePreventRemove(started && Object.keys(answers).length > 0, ({ data }) => {
    if (finished.current) { navigation.dispatch(data.action); return; }
    Alert.alert('Leave diagnostic?', 'Unsubmitted answers will be lost.', [{ text: 'Keep working', style: 'cancel' }, { text: 'Leave', style: 'destructive', onPress: () => navigation.dispatch(data.action) }]);
  });
  const submit = async () => {
    if (lock.current) return;
    let result;
    try { result = scoreDiagnostic(questions, answers); }
    catch (e) { Alert.alert('Incomplete diagnostic', e.message); return; }
    lock.current = true; setSaving(true); setFrozen(true);
    if (savedTime.current == null) savedTime.current = elapsed;
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Sign in to save your diagnostic.');
      const batch = writeBatch(db);
      for (const unit of result.units) {
        const selected = questions.filter(q => q.unitId === unit.unitId);
        batch.set(doc(db, 'users', user.uid, 'diagnosticResults', unit.unitId), { ...unit, version: bank.version, attemptId: attemptId.current, answers: Object.fromEntries(selected.map(q => [q.id, answers[q.id]])) });
      }
      batch.set(doc(db, 'users', user.uid, 'diagnosticResults', 'latest'), { ...result, version: bank.version, questionIds: questions.map(q => q.id), answers, timeTaken: savedTime.current, attemptId: attemptId.current });
      await batch.commit();
      finished.current = true;
      navigation.replace('DiagnosticResults', { questions, answers, result, timeTaken: savedTime.current });
    } catch (e) { Alert.alert('Diagnostic not saved', 'Your answers are still here. Check your connection and tap Submit to retry.'); }
    finally { lock.current = false; setSaving(false); }
  };
  if (checking) return <View style={{ flex: 1, padding: 24 }}><ActivityIndicator color={colors.basicButton} /></View>;
  if (setupError) return <View style={{ padding: 24 }}><Text>{setupError}</Text><GradientButton title="Return to Calendar" onPress={() => navigation.navigate('MainTabs', { screen: 'Calendar' })} /></View>;
  const q = questions[index];
  if (!started) return <SafeAreaView style={styles.container} edges={['bottom']}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>Find your starting point</Text><Text style={styles.body}>Answer 30 questions across all four AP CSA units. You can move back to revise answers before submitting.</Text>
    <Text style={styles.body}>The diagnostic samples 6 questions from Unit 1, 9 from Unit 2, 4 from Unit 3, and 11 from Unit 4. These proportions fall within College Board's multiple-choice weighting ranges.</Text>
    <Text style={styles.body}>This is a study check, not an AP score prediction. It prioritizes weaker units in your study calendar while keeping every lesson. It does not change your lesson scores. Allow about 30–45 minutes. Answers are held in this session until submitted.</Text>
    <GradientButton title="Start diagnostic" onPress={() => setStarted(true)} />
  </ScrollView></SafeAreaView>;
  return <QuizLayout question={q} index={index} total={questions.length} elapsed={elapsed}
    selected={answers[q.id]} onSelect={i => setAnswers(a => ({ ...a, [q.id]: i }))}
    onBack={() => setIndex(n => n - 1)} onNext={index === questions.length - 1 ? submit : () => setIndex(n => n + 1)}
    saving={saving} frozen={frozen} onReport={() => navigation.navigate('QuestionIssue', { source: 'diagnostic', lessonId: q.lessonId, question: q })} />;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#F5F7FB' }, content: { padding: 20, gap: 16 }, title: { fontFamily: 'Poppins-Bold', fontSize: 24 }, heading: { fontFamily: 'Poppins-SemiBold', fontSize: 18 }, body: { fontFamily: 'Poppins-Regular', fontSize: 16, lineHeight: 25, color: '#26334A' }, question: { fontFamily: 'Poppins-Medium', fontSize: 17, lineHeight: 27 }, option: { padding: 16, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#B7C3D8', minHeight: 48 } });
