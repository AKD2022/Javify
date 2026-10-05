import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../assets/components/colors';
export default function AppHeader({ navigation, route, options }) {
  const insets = useSafeAreaInsets();
  const quiz = ['QuizScreen', 'DiagnosticScreen', 'LessonScreen', 'UnitScreen'].includes(route.name);
  return <View style={[s.container, { paddingTop: insets.top + 12, backgroundColor: quiz ? colors.quizLessonBackground : colors.defaultBackground }]}>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs')} style={s.back}><MaterialIcons name="arrow-back" size={25} color="#141720" /></TouchableOpacity>
    {!!options.title && <Text accessibilityRole="header" style={s.title}>{options.title}</Text>}
  </View>;
}
const s = StyleSheet.create({ container: { paddingHorizontal: 20, paddingBottom: 12, gap: 16 }, back: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', elevation: 4, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }, title: { fontFamily: 'Poppins-Bold', fontSize: 23, lineHeight: 31, color: '#191C2B' } });
