import { currentKeyFromStorage } from '../utils/content';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { quizzes } from '../utils/quizRegistry';
import { lesson } from '../utils/lessonRegistry';
import colors from '../../assets/components/colors';
import GradientButton from '../../assets/components/gradientButton';
export default function ReviewScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [retry, setRetry] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true); setError(''); setSelected(null); setChecked(false);
    (async () => {
      try {
        if (!auth.currentUser) throw new Error('Sign in to review questions.');
        const snap = await getDocs(collection(db, 'users', auth.currentUser.uid, 'reviewQueue'));
        const loaded = snap.docs.map(d => ({ ...d.data(), lessonId: currentKeyFromStorage(d.data().lessonId)?.replace('lesson', ''), id: d.id })).sort((a, b) => (a.updatedAt?.seconds || 0) - (b.updatedAt?.seconds || 0)).map(e => ({ ...e, question: quizzes[`lesson${e.lessonId}`]?.questions.find(q => q.id === e.questionId) })).filter(e => e.question);
        if (active) setEntries(loaded);
      } catch { if (active) setError('Could not load missed questions. Check your connection and retry.'); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [retry]));
  const current = entries[0];
  const check = async () => {
    if (selected == null || saving || checked) return;
    if (selected === current.question.answer) {
      setSaving(true);
      try {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'reviewQueue', current.id));
        setChecked(true);
      } catch { Alert.alert('Answer not saved', 'Please retry. The question is still in your review queue.'); }
      finally { setSaving(false); }
    } else setChecked(true);
  };
  const next = () => {
    setEntries(list => selected === current.question.answer ? list.slice(1) : [...list.slice(1), list[0]]);
    setSelected(null); setChecked(false);
  };
  return <SafeAreaView edges={['bottom']} style={styles.container}><ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>Review missed questions</Text>
    <Text style={styles.body}>Questions you miss in lesson quizzes appear here. Answer correctly to clear one. Review practice does not change your lesson score.</Text>
    {loading ? <ActivityIndicator /> : error ? <><Text>{error}</Text><GradientButton title="Retry" onPress={() => setRetry(r => r + 1)} /></> : !current ? <View style={styles.card}><Text style={styles.label}>You're caught up</Text><Text style={styles.body}>No missed questions are waiting. Keep practicing your lessons.</Text></View> : <>
      <Text style={styles.label}>{entries.length} {entries.length === 1 ? 'question' : 'questions'} in this session</Text>
      <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('LessonScreen', { lessonId: current.lessonId })}><Text style={styles.link}>{lesson[`lesson${current.lessonId}`]?.title || 'Open lesson'}</Text></TouchableOpacity>
      <View style={styles.card}><Text selectable style={styles.question}>{current.question.question}</Text>
        {current.question.options.map((option, index) => <TouchableOpacity key={index} accessibilityRole="radio" accessibilityState={{ checked: selected === index }} disabled={checked || saving} onPress={() => setSelected(index)} style={[styles.option, selected === index && styles.selected]}><Text style={styles.body}>{option.value}</Text></TouchableOpacity>)}
      </View>
      {checked && <View style={styles.card}><Text style={styles.label}>{selected === current.question.answer ? 'Correct — removed from review' : 'Not quite — try it again later'}</Text><Text style={styles.body}>Correct answer: {current.question.options[current.question.answer].value}</Text><Text style={styles.body}>{current.question.explanation}</Text></View>}
      <GradientButton title={saving ? 'Saving…' : checked ? 'Continue review' : 'Check answer'} disabled={saving || selected == null} onPress={checked ? next : check} />
    </>}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.defaultBackground }, content: { padding: 20, gap: 16 },
  title: { fontFamily: 'Poppins-Bold', fontSize: 23 }, label: { fontFamily: 'Poppins-SemiBold', fontSize: 16 },
  body: { fontFamily: 'Poppins-Regular', fontSize: 15, lineHeight: 23, color: '#343D50' },
  link: { fontFamily: 'Poppins-SemiBold', color: colors.basicButton, paddingVertical: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 12 }, question: { fontSize: 17, lineHeight: 26 },
  option: { padding: 14, borderWidth: 1, borderColor: '#B8C0D0', borderRadius: 10, minHeight: 48 },
  selected: { borderColor: colors.basicButton, borderWidth: 2, backgroundColor: '#EDF2FF' },
});
