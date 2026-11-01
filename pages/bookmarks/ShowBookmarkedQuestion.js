import { palette } from '../../assets/components/theme';
import { storageKeyForLesson } from '../utils/content';
import React, { useState, useLayoutEffect } from 'react';
import { View, Text as RNText, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import colors from '../../assets/components/colors';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ShowBookmarkedQuestionScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const question = route.params?.question;

  const [selectedAnswer, setSelectedAnswer] = useState(question?.selectedAnswer ?? null);
  const [submitted, setSubmitted] = useState(question?.selectedAnswer != null);

  const Text = (props) => (
    <RNText {...props} style={[{ fontFamily: "Poppins-Regular" }, props.style]} />
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Bookmarked Question',
    });
  }, [navigation]);

  const displayValue = (field) =>
    typeof field === "string" ? field : field?.value || "";

  if (!question) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>No question data provided.</Text>
      </SafeAreaView>
    );
  }

  const handleSelectOption = (index) => {
    if (!submitted) setSelectedAnswer(index);
  };

  const handleSubmit = async () => {
    if (selectedAnswer == null) return;

    setSubmitted(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Sign in to save this answer.');
      }

      // Use the lesson ID and question key from the original bookmark
      const safeLessonId = question.lessonId != null ? String(question.lessonId).trim() : '1';
      
      // Use the original questionKey that was stored when we loaded the bookmarks
      // If questionKey doesn't exist, fall back to originalId or id
      const questionKey = question.questionKey || question.originalId || question.id;

      const bookmarkRef = doc(db, 'users', user.uid, 'bookmarks', storageKeyForLesson(safeLessonId));

      const docSnap = await getDoc(bookmarkRef);
      if (!docSnap.exists() || !docSnap.data()[questionKey]) throw new Error('This bookmark was removed.');
      await setDoc(bookmarkRef, { [questionKey]: { selectedAnswer } }, { merge: true });

    } catch (error) {
      console.error('Error saving answer:', error);
      Alert.alert('Error', 'Failed to save your answer.');
      setSubmitted(false); // Reset submitted state on error
    }
  };

  const isCorrect = selectedAnswer === question.answer;

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.questionContainer}>
          <View style={styles.savedLabel}><MaterialIcons name="bookmark" size={18} color={palette.accent} /><Text style={styles.savedText}>Saved question</Text></View>
          <Text selectable style={styles.questionText}>{displayValue(question.question)}</Text>
          <View style={{ gap: 10 }}>
            {question.options.map((option, idx) => {
              const selected = selectedAnswer === idx;
              const correct = submitted && idx === question.answer;
              const incorrect = submitted && selected && !correct;
              const tint = correct ? palette.success : incorrect ? palette.danger : selected ? palette.accent : palette.muted;
              return <TouchableOpacity key={idx} accessibilityRole="radio" accessibilityState={{ checked: selected, disabled: submitted }} disabled={submitted} onPress={() => handleSelectOption(idx)} style={[styles.optionButton, (selected || correct) && { borderColor: tint, backgroundColor: correct ? palette.successSoft : incorrect ? palette.dangerSoft : palette.accentSoft }]}>
                <MaterialIcons name={correct ? 'check-circle' : incorrect ? 'cancel' : selected ? 'radio-button-checked' : 'radio-button-unchecked'} size={22} color={tint} />
                <View style={{ flex: 1, gap: 3 }}><Text style={styles.optionText}>{displayValue(option)}</Text>{submitted && (correct || selected) && <Text style={[styles.answerLabel, { color: tint }]}>{correct ? selected ? 'Your answer · Correct' : 'Correct answer' : 'Your answer'}</Text>}</View>
              </TouchableOpacity>;
            })}
          </View>
        </View>
        {submitted && <View style={styles.feedbackContainer}>
          <View style={styles.feedbackHeader}><MaterialIcons name={isCorrect ? 'check-circle' : 'lightbulb-outline'} size={24} color={palette.accent} /><Text style={styles.feedbackTitle}>{isCorrect ? 'Nicely done!' : 'Let’s break it down'}</Text></View>
          <Text style={styles.explanationTitle}>Why this answer works</Text>
          <Text selectable style={styles.explanationText}>{question.explanation || 'No explanation provided.'}</Text>
        </View>}
        {!submitted && <TouchableOpacity accessibilityRole="button" style={[styles.submitButton, selectedAnswer == null && { opacity: 0.45 }]} onPress={handleSubmit} disabled={selectedAnswer == null}><Text style={styles.submitButtonText}>Check answer</Text></TouchableOpacity>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.defaultBackground },
  content: { padding: 20, paddingBottom: 32, gap: 16 },
  centered: { flex: 1, backgroundColor: colors.defaultBackground, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: palette.muted, fontSize: 16, textAlign: 'center', marginHorizontal: 20 },
  questionContainer: { backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 20, borderWidth: 1, borderColor: palette.border },
  savedLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  savedText: { fontFamily: 'Poppins-SemiBold', fontSize: 13, color: palette.accent },
  questionText: { fontSize: 19, lineHeight: 29, color: palette.ink, fontFamily: 'Poppins-SemiBold' },
  optionButton: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, minHeight: 58, borderRadius: 14, borderWidth: 1.5, borderColor: palette.border },
  optionText: { fontSize: 15, lineHeight: 23, color: palette.ink },
  answerLabel: { fontSize: 11, fontFamily: 'Poppins-Medium' },
  feedbackContainer: { backgroundColor: palette.subtle, padding: 20, borderRadius: 16, gap: 10 },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  feedbackTitle: { flex: 1, color: '#443B77', fontFamily: 'Poppins-SemiBold', fontSize: 18 },
  explanationTitle: { color: '#443B77', fontFamily: 'Poppins-SemiBold', fontSize: 13 },
  explanationText: { color: palette.muted, fontSize: 14, lineHeight: 23 },
  submitButton: { backgroundColor: palette.accent, padding: 16, borderRadius: 16, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontFamily: 'Poppins-SemiBold', fontSize: 15 },
});
