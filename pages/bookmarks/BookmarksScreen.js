import React, { useEffect, useState } from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import BookmarkedLessonsScreen from './BookmarkedLessonsScreen';
import BookmarkedQuestionsScreen from './BookmarkedQuestionsScreen';
const Tab = createMaterialTopTabNavigator();
function SavedTabs({ state, descriptors, navigation }) {
  return <View style={{ flexDirection: 'row', marginHorizontal: 16, marginBottom: 4, backgroundColor: '#EAE8F5', borderRadius: 16, padding: 4 }}>
    {state.routes.map((route, index) => <TouchableOpacity key={route.key} accessibilityRole="tab" accessibilityState={{ selected: state.index === index }} onPress={() => { const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true }); if (state.index !== index && !event.defaultPrevented) navigation.navigate(route.name); }} style={{ flex: 1, minHeight: 46, borderRadius: 12, backgroundColor: state.index === index ? '#fff' : 'transparent', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: 'Poppins-SemiBold', color: state.index === index ? '#675CFF' : '#706B82' }}>{descriptors[route.key].options.title || route.name}</Text></TouchableOpacity>)}
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
  return <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#F7F7FB' }}>
    <View style={{ margin: 16, padding: 20, backgroundColor: '#EFEDFF', borderRadius: 24, gap: 8 }}>
      <MaterialIcons name="bookmarks" size={26} color="#675CFF" />
      <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 25, color: '#29263D' }}>Saved for later</Text>
      <Text style={{ fontFamily: 'Poppins-Regular', color: '#625C74' }}>{counts.lessons ?? '—'} lessons · {counts.questions ?? '—'} questions</Text>
    </View>
    <Tab.Navigator tabBar={props => <SavedTabs {...props} />} screenOptions={{ sceneStyle: { backgroundColor: '#F7F7FB' } }}><Tab.Screen name="Lessons" component={BookmarkedLessonsScreen} /><Tab.Screen name="Questions" component={BookmarkedQuestionsScreen} /></Tab.Navigator>
  </SafeAreaView>;
}
