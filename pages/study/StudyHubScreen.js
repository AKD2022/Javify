import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { palette, type } from '../../assets/components/theme';
const tools = [
  ['LessonSearch', 'search', 'Find a lesson', 'Search by Java concept or AP topic.'],
  ['Curriculum', 'checklist', 'Topic checklist', 'Check your progress across all four units.'],
  ['ReviewMissed', 'replay', 'Review missed questions', 'Work through questions from your quizzes.'],
  ['JavaReference', 'code', 'Java quick reference', 'Look up syntax and worked examples.'],
];
export default function StudyHubScreen({ navigation }) {
  return <SafeAreaView style={s.screen} edges={['top']}><ScrollView contentContainerStyle={s.content}>
    <View style={s.intro}><Text style={type.title}>Study</Text><Text style={[type.body, { color: palette.muted }]}>Find a topic, revisit a question, or check your Java syntax.</Text></View>
    <View>{tools.map(([screen, icon, title, description]) => <TouchableOpacity accessibilityRole="button" key={screen} onPress={() => navigation.navigate(screen)} style={s.row}><MaterialIcons name={icon} size={24} color={palette.accent} /><View style={{ flex: 1, gap: 4 }}><Text style={type.heading}>{title}</Text><Text style={type.meta}>{description}</Text></View><MaterialIcons name="chevron-right" size={22} color={palette.muted} /></TouchableOpacity>)}</View>
  </ScrollView></SafeAreaView>;
}
const s = StyleSheet.create({ screen: { flex: 1, backgroundColor: palette.canvas }, content: { padding: 20, paddingBottom: 32, gap: 24 }, intro: { gap: 8, paddingTop: 12 }, row: { paddingVertical: 24, flexDirection: 'row', alignItems: 'center', gap: 16, borderBottomWidth: 1, borderBottomColor: palette.border } });
