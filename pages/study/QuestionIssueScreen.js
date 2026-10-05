import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text as RNText, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { auth } from '../../config/firebase';
import { loadIssueReports, saveIssueReport } from '../utils/issueReports';
import GradientButton from '../../assets/components/gradientButton';
import colors from '../../assets/components/colors';
const Text = ({ style, ...props }) => <RNText {...props} style={[{ fontFamily: 'Poppins-Regular', color: '#30364A', lineHeight: 23 }, style]} />;
export default function QuestionIssueScreen({ route, navigation }) {
  const question = route.params?.question;
  const [reason, setReason] = useState('Answer or explanation'), [notes, setNotes] = useState('');
  const [reports, setReports] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState(''), [saving, setSaving] = useState(false);
  const saveLock = useRef(false);
  useFocusEffect(useCallback(() => {
    let active = true;
    loadIssueReports(auth.currentUser?.uid).then(list => { if (active) setReports(list); }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));
  const save = async () => {
    if (!question || saveLock.current) return;
    saveLock.current = true; setSaving(true);
    try {
      await saveIssueReport(auth.currentUser?.uid, { source: route.params?.source || 'lesson', lessonId: String(route.params?.lessonId || ''), questionId: String(question.id), question: question.question, reason, notes: notes.trim() });
      Alert.alert('Saved on this device', 'This report has not been sent to anyone. Find it under “Question reports” in Profile.');
      navigation.goBack();
    } catch (e) { Alert.alert('Report not saved', e.message); }
    finally { saveLock.current = false; setSaving(false); }
  };
  const card = { padding: 16, backgroundColor: '#fff', borderRadius: 18, gap: 10 };
  return <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.defaultBackground }}><ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
    <LinearGradient colors={[colors.gradientButtonStart, colors.gradientButtonEnd]} style={{ padding: 24, borderRadius: 24, gap: 12 }}><MaterialIcons name="outlined-flag" size={34} color="#fff" /><Text style={{ fontFamily: 'Poppins-Bold', fontSize: 23, lineHeight: 31, color: '#fff' }}>{question ? 'Help improve this question' : 'Your question reports'}</Text><Text style={{ color: '#F0EDFF' }}>Keep track of anything that needs a closer look.</Text></LinearGradient>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, backgroundColor: '#EFEDFF' }}><MaterialIcons name="lock-outline" size={24} color={colors.basicButton} /><Text style={{ flex: 1, fontSize: 13 }}>Private to this account on this device. Reports are not sent or synced.</Text></View>
    {question && <><View style={[card, { borderLeftWidth: 4, borderLeftColor: colors.basicButton }]}><Text style={{ color: colors.basicButton, fontSize: 12, fontFamily: 'Poppins-SemiBold' }}>QUESTION</Text><Text selectable>{question.question}</Text></View><Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 18 }}>What needs attention?</Text>{['Answer or explanation', 'Unclear wording', 'Formatting', 'Other'].map(option => <TouchableOpacity key={option} accessibilityRole="radio" accessibilityState={{ checked: reason === option }} onPress={() => setReason(option)} disabled={saving} style={[card, { borderWidth: 1, borderColor: reason === option ? colors.basicButton : '#E1E0ED', backgroundColor: reason === option ? '#EFEDFF' : '#fff' }]}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><MaterialIcons name={reason === option ? 'radio-button-checked' : 'radio-button-unchecked'} size={22} color={reason === option ? colors.basicButton : '#9CA3B5'} /><Text style={{ flex: 1 }}>{option}</Text></View></TouchableOpacity>)}
      <TextInput accessibilityLabel="Report details" value={notes} onChangeText={setNotes} editable={!saving} multiline maxLength={1000} placeholder="Optional details: what seems wrong?" style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#CCD3E0', borderRadius: 12, padding: 14, minHeight: 100, textAlignVertical: 'top', fontFamily: 'Poppins-Regular' }} />
      <GradientButton title={saving ? 'Saving…' : 'Save private report'} disabled={saving || loading || !!error} onPress={save} />
    </>}
    {loading ? <ActivityIndicator /> : error ? <Text>{error}</Text> : !question && (reports.length ? reports.slice().reverse().map(report => <View key={report.id} style={card}><Text style={{ fontFamily: 'Poppins-SemiBold' }}>{report.reason}</Text><Text selectable>{report.question}</Text><Text selectable>{report.notes || 'No additional details.'}</Text><Text>{new Date(report.savedAt).toLocaleDateString()}</Text></View>) : <Text>No reports saved yet.</Text>)}
  </ScrollView></SafeAreaView>;
}
