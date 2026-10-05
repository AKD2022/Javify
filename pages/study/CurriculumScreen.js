import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { units } from '../utils/units';
import { getScores, loadScores } from '../utils/dataStore';
import { auth } from '../../config/firebase';
import colors from '../../assets/components/colors';
export default function CurriculumScreen({ navigation }) {
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true); setError('');
    loadScores(auth.currentUser).then(() => { if (active) setScores(getScores()); }).catch(() => { if (active) setError('Could not load progress. Tap to retry.'); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]));
  const all = units.flatMap(u => u.lessons);
  return <SafeAreaView style={styles.container} edges={['bottom']}><ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
    <Text style={styles.title}>AP CSA topic checklist</Text>
    <Text style={styles.body}>Aligned with the current four-unit framework (effective fall 2025). “Mastered” means you have earned 4/4 on a lesson quiz; it is a practice milestone, not an AP score prediction.</Text>
    {loading ? <ActivityIndicator /> : error ? <TouchableOpacity onPress={() => setRetry(r => r + 1)}><Text>{error}</Text></TouchableOpacity> : <>
      <Text style={styles.heading}>{all.filter(l => scores[l.id] === 4).length} of {all.length} topics mastered</Text>
      {units.map(unit => <View key={unit.id} style={styles.card}><Text style={styles.heading}>{unit.title}</Text>{unit.lessons.map(l => <TouchableOpacity key={l.id} accessibilityRole="button" style={styles.row} onPress={() => navigation.navigate('LessonScreen', { lessonId: l.id.replace('lesson', '') })}>
        <MaterialIcons name={scores[l.id] === 4 ? 'check-circle' : 'radio-button-unchecked'} size={24} color={scores[l.id] === 4 ? '#287A45' : '#647089'} />
        <View style={{ flex: 1 }}><Text style={styles.label}>{l.title}</Text><Text style={styles.body}>{scores[l.id] === 4 ? 'Mastered · best score 4/4' : scores[l.id] != null ? `Practicing · best score ${scores[l.id]}/4` : 'Not started'}</Text></View>
      </TouchableOpacity>)}</View>)}
    </>}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.defaultBackground }, title: { fontFamily: 'Poppins-Bold', fontSize: 23 }, heading: { fontFamily: 'Poppins-SemiBold', fontSize: 18 }, body: { fontFamily: 'Poppins-Regular', fontSize: 14, lineHeight: 22, color: '#50586B' }, label: { fontFamily: 'Poppins-Medium', fontSize: 15 }, card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, gap: 10 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#D7DBE5' } });
