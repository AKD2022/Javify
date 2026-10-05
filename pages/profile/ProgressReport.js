import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { units } from '../utils/units';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, Text as RNText, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { getScores, loadScores } from '../utils/dataStore';
import { getEntry, lessonEntries, currentKeyFromStorage } from '../utils/content';
import { localDateKey, parseLocalDate } from '../utils/studyLogic';
import colors from '../../assets/components/colors';
const Text = ({ style, ...props }) => <RNText {...props} style={[{ fontFamily: 'Poppins-Regular', color: '#30364A' }, style]} />;
export default function ProgressReport() {
  const [profile, setProfile] = useState({}), [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true), [error, setError] = useState(''), [retry, setRetry] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true; setLoading(true); setError('');
    (async () => {
      try {
        if (!auth.currentUser) throw new Error('Sign in to view progress.');
        const [snap] = await Promise.all([getDoc(doc(db, 'users', auth.currentUser.uid)), loadScores(auth.currentUser)]);
        if (active) { setProfile(snap.data() || {}); setScores(getScores()); }
      } catch { if (active) setError('Unable to load your progress. Please retry.'); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [retry]));
  const today = localDateKey(), yesterday = parseLocalDate(today); yesterday.setDate(yesterday.getDate() - 1);
  const streak = [today, localDateKey(yesterday)].includes(profile.lastCompletedDate) ? profile.streak || 0 : 0;
  const legacy = (Array.isArray(profile.allScores) ? profile.allScores : []).filter(s => Number.isFinite(s.score) && s.total > 0);
  const stats = profile.scoreStats || { count: legacy.length, percentageSum: legacy.reduce((sum, s) => sum + s.score / s.total * 100, 0) };
  const mastered = lessonEntries.filter(l => scores[l.id] === 4).length;
  const percent = Math.round(mastered / lessonEntries.length * 100);
  const days = Array.from({ length: 7 }, (_, i) => { const d = parseLocalDate(today); d.setDate(d.getDate() - 6 + i); return { label: d.toLocaleDateString(undefined, { weekday: 'short' }), count: profile.weeklyActivity?.[localDateKey(d)] || 0 }; });
  const max = Math.max(1, ...days.map(d => d.count));
  const card = { backgroundColor: '#fff', padding: 20, borderRadius: 22, gap: 14, borderWidth: 1, borderColor: '#EBEAF5' };
  const heading = { fontFamily: 'Poppins-SemiBold', fontSize: 18, color: '#252B43' };
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.defaultBackground }} edges={['bottom']}><ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
    {loading ? <ActivityIndicator color={colors.basicButton} /> : error ? <TouchableOpacity onPress={() => setRetry(n => n + 1)} style={card}><Text>{error}</Text><Text style={{ color: colors.basicButton }}>Retry</Text></TouchableOpacity> : <>
      <LinearGradient colors={[colors.gradientButtonStart, colors.gradientButtonEnd]} style={{ padding: 24, borderRadius: 26, gap: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View accessible accessibilityLabel={`${percent} percent of topics mastered`} style={{ width: 106, height: 106, justifyContent: 'center', alignItems: 'center' }}>
            <Svg width={106} height={106} style={{ position: 'absolute' }}><Circle cx={53} cy={53} r={46} stroke="#FFFFFF45" strokeWidth={9} fill="none" /><Circle cx={53} cy={53} r={46} stroke="#fff" strokeWidth={9} fill="none" strokeDasharray={`${2 * Math.PI * 46}`} strokeDashoffset={2 * Math.PI * 46 * (1 - percent / 100)} rotation={-90} origin="53,53" strokeLinecap="round" /></Svg>
            <Text style={{ color: '#fff', fontFamily: 'Poppins-Bold', fontSize: 25 }}>{percent}%</Text>
          </View>
          <View style={{ flex: 1 }}><Text style={{ color: '#fff', fontFamily: 'Poppins-Bold', fontSize: 21 }}>Making progress</Text><Text style={{ color: '#F0EDFF', marginTop: 6 }}>{mastered} of 53 topics mastered</Text></View>
        </View>
        <Text style={{ color: '#F0EDFF', lineHeight: 22 }}>Every practice session builds confidence. A 4/4 lesson quiz marks a topic mastered here.</Text>
      </LinearGradient>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={[card, { flex: 1, backgroundColor: '#FFF3E8' }]}><MaterialIcons name="local-fire-department" size={30} color="#F28A32" /><Text style={{ fontFamily: 'Poppins-Bold', fontSize: 26 }}>{streak}</Text><Text>day study streak</Text></View>
        <View style={[card, { flex: 1, backgroundColor: '#EFEDFF' }]}><MaterialIcons name="insights" size={30} color={colors.basicButton} /><Text style={{ fontFamily: 'Poppins-Bold', fontSize: 26 }}>{stats.count ? `${Math.round(stats.percentageSum / stats.count)}%` : '—'}</Text><Text>lifetime quiz average</Text></View>
      </View>
      <View style={card}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><MaterialIcons name="bar-chart" size={23} color={colors.basicButton} /><Text style={heading}>This week</Text></View><Text style={{ color: '#70778A' }}>{days.reduce((sum, d) => sum + d.count, 0)} quizzes in the last seven days</Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>{days.map((day, i) => <View key={i} accessible accessibilityLabel={`${day.label}: ${day.count} quizzes`} style={{ flex: 1, alignItems: 'center', gap: 8 }}><Text style={{ fontSize: 12 }}>{day.count}</Text><View style={{ height: 100, width: '100%', justifyContent: 'flex-end', backgroundColor: '#F4F3FA', borderRadius: 9 }}><View style={{ height: Math.max(4, day.count / max * 100), borderRadius: 9, backgroundColor: day.count ? colors.basicButton : '#DEDBF0' }} /></View><Text style={{ fontSize: 11 }}>{day.label}</Text></View>)}</View>
      </View>
      <View style={card}><Text style={heading}>Unit progress</Text>{units.map(unit => { const done = unit.lessons.filter(l => scores[l.id] === 4).length; return <View key={unit.id} style={{ gap: 8 }}><Text style={{ fontFamily: 'Poppins-Medium' }}>{unit.title}</Text><View style={{ height: 8, borderRadius: 8, backgroundColor: '#EEEDF7', overflow: 'hidden' }}><View style={{ width: `${done / unit.lessons.length * 100}%`, height: 8, backgroundColor: colors.basicButton }} /></View><Text style={{ color: '#747C91', fontSize: 12 }}>{done}/{unit.lessons.length} mastered</Text></View>; })}</View>
      <View style={card}><Text style={heading}>Recent attempts</Text>{(profile.last5Scores || []).slice().reverse().map((attempt, i) => <View key={i} style={{ paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#F0EFF6' }}><View style={{ backgroundColor: '#EFEDFF', padding: 10, borderRadius: 12 }}><MaterialIcons name="history" size={21} color={colors.basicButton} /></View><Text style={{ flex: 1, fontSize: 13 }}>{getEntry(currentKeyFromStorage(attempt.lessonId))?.title || 'Previous curriculum lesson'}</Text><Text style={{ color: colors.basicButton, fontFamily: 'Poppins-Bold' }}>{attempt.score}/{attempt.total}</Text></View>)}{!profile.last5Scores?.length && <Text>Your first quiz result will appear here.</Text>}<Text style={{ color: '#747C91', fontSize: 12 }}>{stats.count} total quiz attempts. Earlier attempts stay in history; rewritten lessons need a new attempt.</Text></View>
    </>}
  </ScrollView></SafeAreaView>;
}
