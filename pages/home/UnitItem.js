import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { palette, type } from '../../assets/components/theme';
export default function UnitItem({ unit, scoresState, unitIndex, units }) {
  const navigation = useNavigation();
  const totalLessons = unit.lessons?.length || 0;
  const completedLessons = unit.lessons?.filter(l => (scoresState[l.id] || 0) >= 4).length || 0;
  const nextLesson = unit.lessons?.find(l => !scoresState[l.id] || scoresState[l.id] < 4) || unit.lessons?.[0];
  return <TouchableOpacity accessibilityRole="button" style={s.row} onPress={() => navigation.navigate('UnitScreen', { unit, scoresState, unitIndex, units, totalLessons, lesson: nextLesson })}>
    <Text style={s.number}>{unit.id.replace('unit', '').padStart(2, '0')}</Text>
    <View style={{ flex: 1, gap: 8 }}><Text style={type.heading}>{unit.title.replace(/^Unit \d+:\s*/, '')}</Text><Text style={type.meta}>{completedLessons} of {totalLessons} lessons completed</Text><View style={s.track}><View style={{ height: 3, backgroundColor: palette.accent, width: `${totalLessons ? completedLessons / totalLessons * 100 : 0}%` }} /></View></View>
    <MaterialIcons name="chevron-right" size={22} color={palette.muted} />
  </TouchableOpacity>;
}
const s = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 24, borderBottomWidth: 1, borderColor: palette.border }, number: { fontFamily: 'Poppins-Medium', color: palette.muted, fontSize: 16, width: 28 }, track: { height: 3, backgroundColor: palette.border, overflow: 'hidden' } });
