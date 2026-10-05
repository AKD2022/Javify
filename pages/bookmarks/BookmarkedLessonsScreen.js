import SavedCard from './SavedCard';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { getEntry, currentKeyFromStorage } from '../utils/content';
import { getScores, loadScores } from '../utils/dataStore';
import colors from '../../assets/components/colors';
export default function BookmarkedLessonsScreen({ navigation }) {
  const [items, setItems] = useState([]), [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true), [error, setError] = useState('');
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) { setLoading(false); return; }
    return onSnapshot(collection(db, 'users', user.uid, 'bookmarks_lessons'), snap => {
      setItems(snap.docs.map(d => ({ ...d.data(), id: d.id, entry: getEntry(currentKeyFromStorage(d.id)) })));
      setLoading(false); setError('');
    }, () => { setError('Unable to load bookmarks. Reopen this screen after reconnecting.'); setLoading(false); });
  }, []);
  useFocusEffect(useCallback(() => {
    let active = true;
    loadScores(auth.currentUser).then(() => { if (active) setScores(getScores()); }).catch(() => { if (active) setError('Unable to refresh progress. Bookmarks remain available.'); });
    return () => { active = false; };
  }, []));
  const remove = item => Alert.alert('Remove bookmark?', 'This does not delete your lesson progress.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Remove', onPress: async () => {
    try { await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'bookmarks_lessons', item.id)); }
    catch { Alert.alert('Not removed', 'Check your connection and try again.'); }
  } }]);
  if (loading) return <ActivityIndicator style={{ padding: 24 }} />;
  return <FlatList style={{ backgroundColor: '#F7F7FB' }} contentContainerStyle={{ padding: 16, gap: 12 }} data={items} keyExtractor={item => item.id}
    ListHeaderComponent={error ? <Text style={{ color: '#A32121' }}>{error}</Text> : null}
    ListEmptyComponent={<Text style={{ color: colors.black }}>No lessons bookmarked yet.</Text>}
    renderItem={({ item }) => <SavedCard topic={item.entry?.topic} title={item.entry?.title || 'This lesson was replaced'}
      detail={item.entry ? scores[item.entry.id] == null ? 'Ready to study' : `Best current score: ${scores[item.entry.id]}/4` : 'Open the current curriculum to choose its replacement.'}
      score={item.entry ? scores[item.entry.id] : null}
      onOpen={() => item.entry ? navigation.navigate('LessonScreen', { lessonId: item.entry.id.replace('lesson', '') }) : navigation.navigate('Curriculum')}
      onRemove={() => remove(item)} />} />;
}
