import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../assets/components/colors';

// Shared presentation keeps diagnostic and lesson quizzes visually identical.
export default function QuizLayout({ question, index, total, elapsed, selected, onSelect, onBack, onNext, saving, frozen, onReport, onBookmark, bookmarked }) {
  const insets = useSafeAreaInsets();
  const scroll = useRef(null);
  useEffect(() => { scroll.current?.scrollTo({ y: 0, animated: false }); }, [index]);
  const nextDisabled = selected == null || saving;
  return <View style={s.screen}>
    <View style={s.progress}>
      <View style={s.between}><View style={s.timer}><MaterialIcons name="timer" size={19} /><Text style={s.body}>{Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}</Text></View><Text style={s.body}>{index + 1}/{total}</Text></View>
      <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: index + 1 }} style={s.track}><View style={[s.fill, { width: `${(index + 1) / total * 100}%` }]} /></View>
    </View>
    <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={s.scroll}>
      <View style={s.card}>
        <View style={s.questionRow}>
          <View style={s.questionContent}>{question.type === 'code' ? <View style={s.codeBox}><Text selectable style={s.code}>{question.question}</Text></View> : <Text selectable style={s.question}>{question.question}</Text>}</View>
          {onBookmark && <TouchableOpacity accessibilityRole="button" accessibilityLabel={bookmarked ? 'Remove question bookmark' : 'Bookmark question'} accessibilityState={{ selected: !!bookmarked }} onPress={onBookmark} style={s.bookmark}><MaterialIcons name={bookmarked ? 'bookmark' : 'bookmark-border'} size={24} color={bookmarked ? colors.basicButton : colors.bookmark} /></TouchableOpacity>}
        </View>
        {question.options.map((option, i) => <TouchableOpacity key={i} accessibilityRole="radio" accessibilityState={{ checked: selected === i }} disabled={saving || frozen} onPress={() => onSelect(i)} style={[s.option, selected === i && s.selected]}>
          <View style={[s.radio, selected === i && { borderColor: colors.basicButton }]}>{selected === i && <View style={s.radioDot} />}</View>
          <Text style={[s.answer, option.type === 'code' && s.code]}>{option.value}</Text>
        </TouchableOpacity>)}
        <TouchableOpacity accessibilityRole="button" onPress={onReport} style={s.report}><MaterialIcons name="outlined-flag" size={18} color={colors.basicButton} /><Text style={s.reportText}>Report an issue</Text></TouchableOpacity>
        {frozen && !saving && <Text style={s.body}>Answers are saved for this attempt. Tap Submit to retry after reconnecting.</Text>}
      </View>
    </ScrollView>
    <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
      <TouchableOpacity accessibilityRole="button" disabled={index === 0 || saving || frozen} onPress={onBack} style={[s.back, (index === 0 || saving || frozen) && s.disabled]}><MaterialIcons name="chevron-left" size={25} /><Text style={s.body}>Back</Text></TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" disabled={nextDisabled} onPress={onNext} style={[s.next, nextDisabled && s.disabled]}><Text style={[s.body, { color: '#fff' }]}>{saving ? 'Saving…' : index === total - 1 ? 'Submit' : 'Next'}</Text><MaterialIcons name="chevron-right" size={25} color="#fff" /></TouchableOpacity>
    </View>
  </View>;
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.quizLessonBackground },
  progress: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, gap: 8 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  body: { fontFamily: 'Poppins-Regular', fontSize: 16, color: '#161923' },
  track: { height: 8, borderRadius: 8, overflow: 'hidden', backgroundColor: '#D5D7DF' },
  fill: { height: 8, borderRadius: 8, backgroundColor: '#7353AC' },
  scroll: { paddingHorizontal: 20, paddingBottom: 28 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, gap: 12 },
  questionRow: { flexDirection: 'row', width: '100%', alignItems: 'center', gap: 8, marginBottom: 8 },
  questionContent: { flex: 1, minWidth: 0 },
  question: { fontFamily: 'Poppins-Bold', fontSize: 18, lineHeight: 27, textAlign: 'left' },
  bookmark: { width: 44, height: 44, flexShrink: 0, borderRadius: 22, borderWidth: 1, borderColor: '#D8DAE0', alignItems: 'center', justifyContent: 'center' },
  codeBox: { padding: 10, backgroundColor: '#F0F1F5', borderRadius: 12 },
  code: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 14, lineHeight: 22, textAlign: 'left', color: '#29334A' },
  option: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderWidth: 2, borderColor: '#D5D7DF', borderRadius: 12, minHeight: 58 },
  selected: { borderColor: colors.basicButton, backgroundColor: '#F6F5FF' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#CFD4DE', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.basicButton },
  answer: { flex: 1, minWidth: 0, fontFamily: 'Poppins-Regular', fontSize: 16, lineHeight: 24 },
  report: { alignSelf: 'flex-end', flexDirection: 'row', gap: 6, alignItems: 'center', minHeight: 44 },
  reportText: { color: colors.basicButton, fontFamily: 'Poppins-Medium', fontSize: 13 },
  footer: { flexDirection: 'row', padding: 16, paddingHorizontal: 20, gap: 10, backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  back: { flex: 1, flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'center', minHeight: 50, padding: 10, borderRadius: 12, backgroundColor: colors.bookmarkBackground },
  next: { flex: 2, flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'center', minHeight: 50, padding: 10, borderRadius: 12, backgroundColor: colors.basicButton },
  disabled: { opacity: 0.45 },
});
