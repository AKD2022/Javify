import QuizLayout from '../components/QuizLayout';
import { storageKeyForLesson } from '../utils/content';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text as RNText, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { useRoute, useNavigation, useIsFocused, usePreventRemove } from '@react-navigation/native';
import { sampleQuestions } from '../utils/studyLogic';
import { saveQuizAttempt } from '../utils/quizStore';
import { collection } from 'firebase/firestore';
import { quizzes } from '../utils/quizRegistry';
import { auth, db } from '../../config/firebase';
import { doc, setDoc, deleteField, getDoc } from 'firebase/firestore';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import colors from '../../assets/components/colors';
import { ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function QuizScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const lessonId = route.params?.lessonId;
  const submitLock = useRef(false);
  const finished = useRef(false);
  const focused = useIsFocused();
  const attemptId = useRef(doc(collection(db, '_attemptIds')).id);
  const [loadError, setLoadError] = useState('');
  const [lessonData, setLessonData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptStarted, setAttemptStarted] = useState(false);
  const attemptTime = useRef(null);
  const bookmarkLock = useRef(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState({});
  const [timeTaken, setTimeTaken] = useState(0);

  const user = auth.currentUser;

  const Text = (props) => (
    <RNText {...props} style={[{ fontFamily: "Poppins-Regular" }, props.style]} />
  );

  const [questionId1, setQuestionId1] = useState(null);
  const [questionId2, setQuestionId2] = useState(null);
  const [questionId3, setQuestionId3] = useState(null);
  const [questionId4, setQuestionId4] = useState(null);

  const [selectedAnswer1, setSelectedAnswer1] = useState(null);
  const [selectedAnswer2, setSelectedAnswer2] = useState(null);
  const [selectedAnswer3, setSelectedAnswer3] = useState(null);
  const [selectedAnswer4, setSelectedAnswer4] = useState(null);

  const currentQuestion = lessonData?.questions[currentQuestionIndex];

  usePreventRemove(Object.keys(selectedAnswers).length > 0, ({ data }) => {
    if (finished.current) { navigation.dispatch(data.action); return; }
    Alert.alert('Leave quiz?', 'Unsubmitted answers will be lost.', [{ text: 'Keep working', style: 'cancel' }, { text: 'Leave', style: 'destructive', onPress: () => navigation.dispatch(data.action) }]);
  });

  // Timer
  useEffect(() => {
    if (attemptStarted || !focused) return;
    const interval = setInterval(() => setTimeTaken(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [attemptStarted, focused]);

  // Fetch bookmarks
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user || !lessonId) return;
      try {
        const docRef = doc(db, 'users', user.uid, 'bookmarks', storageKeyForLesson(lessonId));
        const docSnap = await getDoc(docRef);
        setBookmarkedQuestions(docSnap.exists() ? docSnap.data() : {});
      } catch (e) {
        console.error('Failed to load bookmarks:', e);
      }
    };
    fetchBookmarks();
  }, [user, lessonId]);

  // Load quiz and select 4 random questions
  useEffect(() => {
    if (!lessonId) return;
    const lesson = quizzes[`lesson${lessonId}`];
    if (!lesson) {
      setLoadError("This quiz is not available. Return to the lesson list.");
      return;
    }
    const selected = sampleQuestions(lesson.questions);
    setTimeTaken(0);
    setLoadError('');
    attemptId.current = doc(collection(db, '_attemptIds')).id;
    setLessonData({ ...lesson, questions: selected });

    const [q1, q2, q3, q4] = selected.map(q => q.id);
    setQuestionId1(q1);
    setQuestionId2(q2);
    setQuestionId3(q3);
    setQuestionId4(q4);

    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setAttemptStarted(false);
    attemptTime.current = null;
  }, [lessonId]);

  // Handle bookmark toggle
  const handleBookmark = async () => {
    if (!user || !lessonId || !currentQuestion || bookmarkLock.current) return;
    bookmarkLock.current = true;
    const question = currentQuestion;
    const wasBookmarked = !!bookmarkedQuestions[question.id];
    try {
      const bookmarkRef = doc(db, 'users', user.uid, 'bookmarks', storageKeyForLesson(lessonId));
      await setDoc(bookmarkRef, { [question.id]: wasBookmarked ? deleteField() : question }, { merge: true });
      setBookmarkedQuestions(previous => {
        const updated = { ...previous };
        if (wasBookmarked) delete updated[question.id];
        else updated[question.id] = question;
        return updated;
      });
    } catch (error) {
      Alert.alert('Bookmark not saved', 'Check your connection and try again.');
    } finally { bookmarkLock.current = false; }
  };

  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: optionIndex }));
    if (currentQuestionIndex === 0) setSelectedAnswer1(optionIndex);
    else if (currentQuestionIndex === 1) setSelectedAnswer2(optionIndex);
    else if (currentQuestionIndex === 2) setSelectedAnswer3(optionIndex);
    else if (currentQuestionIndex === 3) setSelectedAnswer4(optionIndex);
  };

  const handleNext = async () => {
    if (currentQuestionIndex < lessonData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      return;
    }

    if (submitLock.current || lessonData.questions.some(q => selectedAnswers[q.id] == null)) return;
    submitLock.current = true;
    setIsSubmitting(true);
    setAttemptStarted(true);
    if (attemptTime.current == null) attemptTime.current = timeTaken;
    try {
      const result = await saveQuizAttempt(user, lessonId, lessonData.questions, selectedAnswers, attemptTime.current, attemptId.current);
      finished.current = true;
      navigation.replace('ViewScore', {
        lessonId,
        result,
        questionId1, questionId2, questionId3, questionId4,
        selectedAnswer1, selectedAnswer2, selectedAnswer3, selectedAnswer4,
        time: result.timeTaken,
      });

    } catch (error) {
      console.error('Error saving score:', error);
      Alert.alert('Could not save quiz', 'Your answers are still here. Check your connection and tap Submit to retry.');
    } finally {
      submitLock.current = false;
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  if (!lessonId) return (
    <SafeAreaView style={styles.centered}><Text>No lesson ID provided.</Text></SafeAreaView>
  );
  if (!lessonData) return (
    <SafeAreaView style={styles.centered}><Text>{loadError || 'Loading quiz...'}</Text></SafeAreaView>
  );

  return <QuizLayout question={currentQuestion} index={currentQuestionIndex} total={lessonData.questions.length}
    elapsed={timeTaken} selected={selectedAnswers[currentQuestion.id]} onSelect={handleSelectOption}
    onBack={handleBack} onNext={handleNext} saving={isSubmitting} frozen={attemptStarted}
    onBookmark={handleBookmark} bookmarked={!!bookmarkedQuestions[currentQuestion.id]}
    onReport={() => navigation.navigate('QuestionIssue', { lessonId, question: currentQuestion })} />;
}
const styles = StyleSheet.create({ centered: { flex: 1, justifyContent: 'center', alignItems: 'center' } });
