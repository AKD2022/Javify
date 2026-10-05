import SavedCard from './SavedCard';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { collection, deleteField, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { quizzes } from '../utils/quizRegistry';
import { getEntry, currentKeyFromStorage } from '../utils/content';
import colors from '../../assets/components/colors';
export default function BookmarkedQuestionsScreen({ navigation }) {
  const [items, setItems] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState('');
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) { setLoading(false); return; }
    return onSnapshot(collection(db, 'users', user.uid, 'bookmarks'), snap => {
      const rows = [];
      snap.forEach(d => Object.entries(d.data()).forEach(([key, saved]) => {
        const currentKey = currentKeyFromStorage(d.id);
        const current = quizzes[currentKey]?.questions.find(q => String(q.id) === key);
        rows.push({ id: `${d.id}_${key}`, lessonKey: d.id, questionKey: key, entry: getEntry(currentKey), question: current ? { ...current, selectedAnswer: saved?.selectedAnswer, questionKey: key, originalId: current.id, lessonId: currentKey.replace('lesson', '') } : null });
      }));
      setItems(rows); setLoading(false); setError('');
    }, () => { setError('Unable to load bookmarked questions. Reopen this screen after reconnecting.'); setLoading(false); });
  }, []);
  const remove = async item => {
    try { await setDoc(doc(db, 'users', auth.currentUser.uid, 'bookmarks', item.lessonKey), { [item.questionKey]: deleteField() }, { merge: true }); }
    catch { Alert.alert('Not removed', 'Check your connection and retry.'); }
  };
  if (loading) return <ActivityIndicator style={{ padding: 24 }} />;
  return <FlatList style={{ backgroundColor: '#F7F7FB' }} contentContainerStyle={{ padding: 16, gap: 12 }} data={items} keyExtractor={item => item.id}
    ListHeaderComponent={error ? <Text>{error}</Text> : null} ListEmptyComponent={<Text style={{ color: colors.black }}>No questions bookmarked yet.</Text>}
    renderItem={({ item }) => <SavedCard topic={item.entry?.topic} title={item.entry?.title || 'Retired lesson'}
      detail={item.question?.question || 'This question was replaced. Browse the current lessons for new practice.'}
      onOpen={() => item.question ? navigation.navigate('ShowBookmarkedQuestion', { question: item.question }) : navigation.navigate('Curriculum')}
      onRemove={() => Alert.alert('Remove bookmark?', 'You can save this question again from its quiz.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', onPress: () => remove(item) }])} />} />;
}
