import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../assets/components/colors';
const tools = [
  ['LessonSearch', 'search', 'Find a lesson', 'Search Java concepts and AP topics.'],
  ['Curriculum', 'checklist', 'Topic checklist', 'See your progress across the course.'],
  ['ReviewMissed', 'replay', 'Review missed questions', 'Give tricky questions another try.'],
  ['JavaReference', 'code', 'Java quick reference', 'Keep syntax and examples close by.'],
];
export default function StudyHubScreen({ navigation }) {
  return <SafeAreaView style={s.screen} edges={['top']}><ScrollView contentContainerStyle={s.content}>
    <LinearGradient colors={[colors.gradientButtonStart, colors.gradientButtonEnd]} style={s.hero}><MaterialIcons name="auto-stories" size={36} color="#fff" /><Text style={s.title}>Your study space</Text><Text style={s.subtitle}>Explore, practice, and build your confidence in Java.</Text></LinearGradient>
    <Text style={s.heading}>Study tools</Text>
    {tools.map(([screen, icon, title, description]) => <TouchableOpacity accessibilityRole="button" key={screen} onPress={() => navigation.navigate(screen)} style={s.card}><View style={s.icon}><MaterialIcons name={icon} size={27} color={colors.basicButton} /></View><View style={{ flex: 1 }}><Text style={s.label}>{title}</Text><Text style={s.description}>{description}</Text></View><MaterialIcons name="chevron-right" size={24} color={colors.basicButton} /></TouchableOpacity>)}
  </ScrollView></SafeAreaView>;
}
const s = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.defaultBackground }, content: { padding: 20, gap: 16 }, hero: { padding: 24, borderRadius: 24, gap: 10 }, title: { color: '#fff', fontFamily: 'Poppins-Bold', fontSize: 26 }, subtitle: { color: '#F1EDFF', fontFamily: 'Poppins-Regular', fontSize: 15, lineHeight: 24 }, heading: { fontFamily: 'Poppins-Bold', fontSize: 20, marginTop: 8 }, card: { backgroundColor: '#fff', borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#ECEAF7' }, icon: { padding: 12, borderRadius: 14, backgroundColor: '#EFEDFF' }, label: { fontFamily: 'Poppins-SemiBold', fontSize: 16 }, description: { color: '#687085', fontFamily: 'Poppins-Regular', fontSize: 13, lineHeight: 20, marginTop: 4 } });
