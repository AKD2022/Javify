import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text as RNText, TouchableOpacity, StyleSheet, SafeAreaView, Alert, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { quizzes } from '../utils/quizRegistry';
import { auth, db } from '../../config/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import colors from '../../assets/components/colors';
import { ProgressBar } from 'react-native-paper';
import { updateDoc } from 'firebase/firestore';
import { increment } from 'firebase/firestore';

export default function QuizScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const lessonId = route.params?.lessonId;
  const [lessonData, setLessonData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(null);
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

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setTimeTaken(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch bookmarks
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user || !lessonId) return;
      try {
        const docRef = doc(db, 'users', user.uid, 'bookmarks', `lesson${lessonId}`);
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
      console.warn(`No quiz found for lessonId ${lessonId}`);
      return;
    }
    const shuffled = [...lesson.questions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 4);
    setLessonData({ ...lesson, questions: selected });

    const [q1, q2, q3, q4] = selected.map(q => q.id);
    setQuestionId1(q1);
    setQuestionId2(q2);
    setQuestionId3(q3);
    setQuestionId4(q4);

    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setScore(null);
  }, [lessonId]);

  // Header bookmark icon
  useLayoutEffect(() => {
    if (!currentQuestion) return;
    const isBookmarked = !!bookmarkedQuestions[currentQuestion.id];
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleBookmark}>
          <MaterialIcons
            name={isBookmarked ? 'bookmark' : 'bookmark-border'}
            size={24}
            color="#fff"
            style={{ marginRight: 15 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, currentQuestion, bookmarkedQuestions]);

  // Handle bookmark toggle
  const handleBookmark = async () => {
    if (!user || !lessonId || !currentQuestion) return;
    try {
      const bookmarkRef = doc(db, 'users', user.uid, 'bookmarks', `lesson${lessonId}`);
      const updatedBookmarks = { ...bookmarkedQuestions };
      const isBookmarked = !!bookmarkedQuestions[currentQuestion.id];
      if (isBookmarked) {
        delete updatedBookmarks[currentQuestion.id];
        Alert.alert('Removed', 'Question removed from bookmarks');
      } else {
        updatedBookmarks[currentQuestion.id] = currentQuestion;
        Alert.alert('Bookmarked', 'Question bookmarked successfully!');
      }
      await setDoc(bookmarkRef, updatedBookmarks);
      setBookmarkedQuestions(updatedBookmarks);
    } catch (error) {
      console.error('Error bookmarking question:', error);
      Alert.alert('Error', 'Failed to update bookmark.');
    }
  };

  // Save last 5 scores AND all scores
  const saveLessonScore = async (userId, lessonId, score, totalQuestions) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      let last5Scores = [];
      let allScores = [];

      if (userSnap.exists()) {
        const data = userSnap.data();
        last5Scores = data.last5Scores || [];
        allScores = data.allScores || [];
      }

      const newEntry = {
        lessonId,
        score,
        total: totalQuestions,
        timestamp: new Date()
      };

      last5Scores.push(newEntry);
      if (last5Scores.length > 5) last5Scores = last5Scores.slice(-5);

      allScores.push(newEntry);

      await setDoc(userRef, { last5Scores, allScores }, { merge: true });
      console.log("Scores updated! Last5 + AllScores");
    } catch (error) {
      console.error("Error saving scores:", error);
    }
  };

  const updateCompletedLessons = async (userId, lessonId, score, totalQuestions) => {
    if (score !== totalQuestions) return;

    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      let completedLessons = [];
      if (userSnap.exists()) {
        const data = userSnap.data();
        // force into array
        if (Array.isArray(data.completedLessons)) {
          completedLessons = data.completedLessons;
        } else {
          completedLessons = [];
        }
      }

      if (!completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
        await setDoc(userRef, { completedLessons }, { merge: true });
        console.log("Completed lessons updated:", completedLessons.length);
      }
    } catch (error) {
      console.error("Error updating completed lessons:", error);
    }
  };


  async function updateStreak(userId) {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    let streak = 1;

    if (snap.exists()) {
      const data = snap.data();
      const lastDate = data.lastCompletedDate;

      if (lastDate === today) {
        // Already did a lesson today → don’t increment
        streak = data.streak || 1;
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split("T")[0];

        if (lastDate === yStr) {
          // Yesterday → continue streak
          streak = (data.streak || 0) + 1;
        } else {
          // Missed at least one day → reset to 1
          streak = 1;
        }
      }
    }

    await updateDoc(userRef, {
      streak,
      lastCompletedDate: today,
    });
  }


  const updateWeeklyActivity = async (userId) => {
    if (!userId) return;
    const userRef = doc(db, "users", userId);
    const today = new Date().toISOString().split("T")[0];

    await updateDoc(userRef, {
      [`weeklyActivity.${today}`]: increment(1),
    });
  };

  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: optionIndex }));
    if (currentQuestionIndex === 0) setSelectedAnswer1(optionIndex);
    else if (currentQuestionIndex === 1) setSelectedAnswer2(optionIndex);
    else if (currentQuestionIndex === 2) setSelectedAnswer3(optionIndex);
    else if (currentQuestionIndex === 3) setSelectedAnswer4(optionIndex);
  };

  const calculateScore = () => lessonData.questions.reduce((total, q) => total + (selectedAnswers[q.id] === q.answer ? 1 : 0), 0);

  const handleNext = async () => {
    if (currentQuestionIndex < lessonData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      return;
    }

    const calculatedScore = calculateScore();
    setScore(calculatedScore);
    setIsSubmitting(true);

    try {
      if (!user) return setIsSubmitting(false);

      const scoreDocRef = doc(db, 'users', user.uid, 'scores', `lesson${lessonId}`);
      await setDoc(scoreDocRef, {
        lessonId,
        score: calculatedScore,
        total: lessonData.questions.length,
        timeTaken,
        timestamp: serverTimestamp(),
      });

      await saveLessonScore(user.uid, lessonId, calculatedScore, lessonData.questions.length);
      await updateCompletedLessons(user.uid, lessonId, calculatedScore, lessonData.questions.length);
      await updateStreak(user.uid);

      await updateWeeklyActivity(user.uid);

      setIsSubmitting(false);
      navigation.replace('ViewScore', {
        lessonId,
        questionId1, questionId2, questionId3, questionId4,
        selectedAnswer1, selectedAnswer2, selectedAnswer3, selectedAnswer4,
        time: timeTaken,
      });

    } catch (error) {
      console.error('Error saving score:', error);
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
    <SafeAreaView style={styles.centered}><Text>Loading quiz...</Text></SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progress}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons name="timer" size={15} /> {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, "0")}
          </Text>
          <Text>{currentQuestionIndex}/4</Text>
        </View>
        <ProgressBar progress={currentQuestionIndex / 4} style={styles.progressBar} theme={{ colors: { surfaceVariant: colors.unfilledProgressBar } }} />
      </View>

      <View style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          {currentQuestion.type === "code" ? (
            <Text style={styles.codeText}>{currentQuestion.question}</Text>
          ) : (
            <Text style={styles.questionText}>{currentQuestion.question}</Text>
          )}

          <TouchableOpacity onPress={handleBookmark} style={styles.inlineBookmarkButton}>
            <MaterialIcons name={bookmarkedQuestions[currentQuestion.id] ? "bookmark" : "bookmark-border"} size={24} color={colors.bookmark} />
          </TouchableOpacity>
        </View>

        {currentQuestion.options.map((option, idx) => {
          const isSelected = selectedAnswers[currentQuestion.id] === idx;
          return (
            <TouchableOpacity
              key={idx}
              style={styles.optionButton}
              onPress={() => handleSelectOption(idx)}
              activeOpacity={0.8}
            >
              <View style={[styles.circle, isSelected && styles.circleSelected]} />
              <View style={styles.optionContent}>
                {option.type === "code" ? (
                  <Text style={styles.codeText}>{option.value}</Text>
                ) : (
                  <Text style={styles.optionText}>{option.value}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}



      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} disabled={currentQuestionIndex === 0}>
          <MaterialIcons name={"keyboard-arrow-left"} style={styles.buttonIcon} size={24} color={currentQuestionIndex === 0 ? '#aaa' : colors.black} />
          <Text style={{ color: currentQuestionIndex === 0 ? '#aaa' : colors.black, fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={selectedAnswers[currentQuestion.id] == null || isSubmitting}>
          <Text style={{ color: colors.white, fontSize: 16, marginRight: 6 }}>{currentQuestionIndex === lessonData.questions.length - 1 ? "Submit" : "Next"}</Text>
          <MaterialIcons name="keyboard-arrow-right" style={styles.buttonIcon} size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.quizLessonBackground,
    padding: 20,
    paddingBottom: 50,
  },

  questionContainer: {
    display: "flex",
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        margin: 20,
      }
    })
  },

  questionText: {
    fontSize: 20,
    color: colors.black,
    marginBottom: 12,
    padding: 20,
    fontFamily: "Poppins-Bold"
  },

  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    flexWrap: 'wrap',
  },

  optionContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },

  optionText: {
    fontSize: 16,
    color: colors.black,
    flexWrap: 'wrap',
    textAlign: 'left',
  },

  codeText: {
    fontSize: 14,
    backgroundColor: 'rgba(54, 54, 54, 0.1)',
    color: '#333',
    padding: 10,
    borderRadius: 8,
    flexWrap: 'wrap',
    textAlign: 'left',
    marginHorizontal: 10,
  },


  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    padding: 40,
  },

  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.selectedOptionButton,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  circleSelected: {
    backgroundColor: colors.selectedOptionButton,
  },

  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 50,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.bookmarkBackground,
    width: "30%",
  },

  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.startQuizBackground,
    width: "70%",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  buttonIcon: {
    marginRight: 6,
  },

  progress: {
    display: "flex",
    marginBottom: 10,
    marginTop: 20,
    alignItems: "right",
    ...Platform.select({
      ios: {
        margin: 20,
      }
    })
  },

  progressBar: {
    height: 8,
    borderRadius: 10,
  },

  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 10,
    paddingRight: 10,
  },

  inlineBookmarkButton: {
    padding: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: colors.gray,
  },
});
