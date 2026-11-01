import { palette } from '../../assets/components/theme';
import React, { useEffect, useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import BookmarkedLessonsScreen from './BookmarkedLessonsScreen';
import BookmarkedQuestionsScreen from './BookmarkedQuestionsScreen';
const Tab = createMaterialTopTabNavigator();
function SavedTabs({ state, descriptors, navigation }) {
  return <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 4, backgroundColor: palette.border, borderRadius: 16, padding: 4 }}>
    {state.routes.map((route, index) => <TouchableOpacity key={route.key} accessibilityRole="tab" accessibilityState={{ selected: state.index === index }} onPress={() => { const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true }); if (state.index !== index && !event.defaultPrevented) navigation.navigate(route.name); }} style={{ flex: 1, minHeight: 48, borderRadius: 12, backgroundColor: state.index === index ? '#fff' : 'transparent', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: 'Poppins-SemiBold', color: state.index === index ? palette.accent : palette.muted }}>{descriptors[route.key].options.title || route.name}</Text></TouchableOpacity>)}
  </View>;
}
export default function BookmarksScreen() {
  const [counts, setCounts] = useState({ lessons: null, questions: null });
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const lessons = onSnapshot(collection(db, 'users', user.uid, 'bookmarks_lessons'), snap => setCounts(c => ({ ...c, lessons: snap.size })), () => setCounts(c => ({ ...c, lessons: null })));
    const questions = onSnapshot(collection(db, 'users', user.uid, 'bookmarks'), snap => setCounts(c => ({ ...c, questions: snap.docs.reduce((sum, d) => sum + Object.keys(d.data()).length, 0) })), () => setCounts(c => ({ ...c, questions: null })));
    return () => { lessons(); questions(); };
  }, []);
  return <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: palette.canvas }}>
    <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, gap: 8 }}>
      <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 25, color: palette.ink }}>Bookmarks</Text>
      <Text style={{ fontFamily: 'Poppins-Regular', color: palette.muted }}>{counts.lessons ?? '—'} lessons · {counts.questions ?? '—'} questions</Text>
    </View>
    <Tab.Navigator tabBar={props => <SavedTabs {...props} />} screenOptions={{ sceneStyle: { backgroundColor: palette.canvas } }}><Tab.Screen name="Lessons" component={BookmarkedLessonsScreen} /><Tab.Screen name="Questions" component={BookmarkedQuestionsScreen} /></Tab.Navigator>
  </SafeAreaView>;
}
