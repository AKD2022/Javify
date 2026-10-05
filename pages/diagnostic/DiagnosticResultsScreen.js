import { LinearGradient } from 'expo-linear-gradient';
import ScoreRing from '../components/ScoreRing';
import UnitOrder from '../components/UnitOrder';
import { diagnosticPriorityUnits } from '../utils/studyLogic';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { units } from '../utils/units';
import GradientButton from '../../assets/components/gradientButton';
import colors from '../../assets/components/colors';
export default function DiagnosticResultsScreen({ route, navigation }) {
  const { questions = [], answers = {}, result, timeTaken = 0 } = route.params || {};
  if (!result) return <SafeAreaView><Text>No diagnostic result is available.</Text><GradientButton title="Return to Calendar" onPress={() => navigation.navigate('MainTabs', { screen: 'Calendar' })} /></SafeAreaView>;
  const priority = diagnosticPriorityUnits(result) || [];
  return <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: '#F5F7FB' }}><ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
    <LinearGradient colors={['#655CFF', '#9360FF']} style={{ borderRadius: 24, padding: 22, alignItems: 'center', gap: 10 }}>
      <Text style={{ fontFamily: 'Poppins-SemiBold', color: '#fff', letterSpacing: 1 }}>YOUR STARTING POINT</Text>
      <ScoreRing score={result.score} total={result.total} light />
      <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 22, color: '#fff' }}>{result.score} / {result.total} correct</Text>
      <Text style={{ color: '#fff', backgroundColor: '#FFFFFF25', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8 }}>Time taken · {Math.floor(timeTaken / 60)}:{String(timeTaken % 60).padStart(2, '0')}</Text>
    </LinearGradient>
    <Text style={{ lineHeight: 23, color: '#625C74', fontFamily: 'Poppins-Regular' }}>A starting point for your study plan. This sample helps prioritize review; it does not establish full mastery or predict an AP score.</Text>
    <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 21, color: '#29263D' }}>Your unit snapshot</Text>
    {result.units.map(unit => <View key={unit.unitId} style={{ backgroundColor: '#fff', padding: 18, borderRadius: 20, gap: 12, borderWidth: 1, borderColor: '#EAE8F5' }}>
      <Text style={{ fontFamily: 'Poppins-SemiBold', color: '#29263D' }}>{units.find(u => u.id === unit.unitId)?.title}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}><Text style={{ color: '#625C74' }}>{unit.score}/{unit.total} correct</Text><Text style={{ color: '#675CFF', fontFamily: 'Poppins-Medium', fontSize: 12 }}>Review order · {priority.indexOf(unit.unitId) + 1}</Text></View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: '#EFEDFF', overflow: 'hidden' }}><View style={{ height: 8, borderRadius: 4, backgroundColor: '#7568FF', width: `${unit.total ? unit.score / unit.total * 100 : 0}%` }} /></View>
    </View>)}
    <View style={{ padding: 20, borderRadius: 20, backgroundColor: '#EFEDFF' }}><Text style={{ fontFamily: 'Poppins-Bold', fontSize: 18, color: '#29263D' }}>Your study order</Text><UnitOrder units={priority} /><Text style={{ fontFamily: 'Poppins-Regular', lineHeight: 22, color: '#625C74' }}>Weaker units come first. Your calendar keeps every lesson, in order within each unit.</Text></View>
    <GradientButton title="Build my study calendar" onPress={() => navigation.replace('StudyPlan')} />
    <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 21 }}>Review every answer</Text>
    {questions.map((q, index) => <View key={q.id} style={{ backgroundColor: '#fff', padding: 16, borderRadius: 14, gap: 12 }}><Text style={{ fontFamily: 'Poppins-SemiBold', color: answers[q.id] === q.answer ? '#216E41' : '#A32121' }}>Question {index + 1} · {answers[q.id] === q.answer ? 'Correct' : 'Needs review'} · Topic {q.topic}</Text><Text selectable style={{ lineHeight: 25 }}>{q.question}</Text><Text>Your answer: {q.options[answers[q.id]]?.value || 'No answer'}</Text><Text>Correct answer: {q.options[q.answer].value}</Text><Text style={{ lineHeight: 23 }}>{q.explanation}</Text><TouchableOpacity accessibilityRole="button" style={{ paddingVertical: 12 }} onPress={() => navigation.navigate('LessonScreen', { lessonId: q.lessonId })}><Text style={{ color: colors.basicButton }}>Study this topic</Text></TouchableOpacity></View>)}
    <GradientButton title="Return home" onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })} />
  </ScrollView></SafeAreaView>;
}
