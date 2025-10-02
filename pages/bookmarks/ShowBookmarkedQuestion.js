import React, { useState, useLayoutEffect } from 'react';
import { View, Text as RNText, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import colors from '../../assets/components/colors';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function ShowBookmarkedQuestionScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const question = route.params?.question;

  const [selectedAnswer, setSelectedAnswer] = useState(question.selectedAnswer ?? null);
  const [submitted, setSubmitted] = useState(question.selectedAnswer != null);

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
        Alert.alert('Error', 'User not logged in');
        return;
      }

      // Use the lesson ID and question key from the original bookmark
      const safeLessonId = question.lessonId != null ? String(question.lessonId).trim() : '1';
      
      // Use the original questionKey that was stored when we loaded the bookmarks
      // If questionKey doesn't exist, fall back to originalId or id
      const questionKey = question.questionKey || question.originalId || question.id;

      const bookmarkRef = doc(db, 'users', user.uid, 'bookmarks', `lesson${safeLessonId}`);

      // Fetch existing bookmarks
      const docSnap = await getDoc(bookmarkRef);
      let bookmarksData = {};
      if (docSnap.exists()) {
        bookmarksData = docSnap.data();
      }

      // Update the EXISTING question instead of creating a new one
      if (bookmarksData[questionKey]) {
        // Update the existing bookmark
        bookmarksData[questionKey] = {
          ...bookmarksData[questionKey],
          selectedAnswer, // Add the selected answer
        };
      } else {
        // Fallback: if for some reason the key doesn't exist, find by question text
        const existingKey = Object.keys(bookmarksData).find(key => 
          bookmarksData[key].question === question.question
        );
        
        if (existingKey) {
          bookmarksData[existingKey] = {
            ...bookmarksData[existingKey],
            selectedAnswer,
          };
        } else {
          // Last resort: create new entry (this shouldn't happen in normal flow)
          bookmarksData[questionKey] = {
            ...question,
            selectedAnswer,
            id: question.originalId || questionKey, // Use original ID
          };
        }
      }

      await setDoc(bookmarkRef, bookmarksData, { merge: true });

    } catch (error) {
      console.error('Error saving answer:', error);
      Alert.alert('Error', 'Failed to save your answer.');
      setSubmitted(false); // Reset submitted state on error
    }
  };

  const isCorrect = selectedAnswer === question.answer;

  return (
    <SafeAreaView style={styles.container}>
      {/* Question Card */}
      <View style={styles.questionContainer}>
        <View style={styles.questionContainer}>
          {/* Question */}
          <View style={styles.questionHeader}>
            <Text style={styles.questionText}>{displayValue(question.question)}</Text>
          </View>

          {/* Options (formatted properly) */}
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            return (
              <TouchableOpacity
                key={idx}
                style={styles.optionButton}
                onPress={() => handleSelectOption(idx)}
                disabled={submitted}
              >
                <View style={[styles.circle, isSelected && styles.circleSelected]} />
                <Text style={styles.optionText}>{displayValue(option)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback */}
        {submitted && (
          <View style={styles.feedbackContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <MaterialIcons
                name={isCorrect ? "check" : "cancel"}
                size={24}
                color={isCorrect ? colors.completedCheckmark : colors.redCircle}
                style={{
                  marginRight: 8,
                  backgroundColor: isCorrect ? colors.completedCheckmarkBackground : colors.redCheckmarkBackground,
                  padding: 5,
                  borderRadius: 20,
                }}
              />
              <Text style={[styles.feedbackText, isCorrect ? styles.correctText : styles.incorrectText]}>
                {isCorrect ? "Correct!" : "Incorrect"}
              </Text>
            </View>

            <Text style={styles.explanationTitle}>Explanation:</Text>
            <Text style={styles.explanationText}>{question.explanation || "No explanation provided."}</Text>
          </View>
        )}
      </View>

      {/* Submit Button */}
      {!submitted && (
        <TouchableOpacity
          style={[styles.submitButton, selectedAnswer == null && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={selectedAnswer == null}
        >
          <Text style={styles.submitButtonText}>Submit Answer</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.quizLessonBackground,
    paddingBottom: 50,
    justifyContent: "center",
  },

  centered: {
    flex: 1,
    backgroundColor: colors.quizLessonBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  },

  questionContainer: {
    display: "flex",
    backgroundColor: colors.white,
    borderRadius: 10,
    margin: 20,
    padding: 5,
    marginBottom: 20,
    justifyContent: "center"
  },

  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingRight: 10,
  },

  questionText: {
    fontSize: 20,
    color: colors.black,
    fontFamily: 'Poppins-Bold',
    flex: 1,
    flexWrap: 'wrap',
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

  optionText: {
    fontSize: 16,
    color: colors.black,
    flex: 1,
    flexWrap: 'wrap',
  },

  submitButton: {
    backgroundColor: colors.startQuizBackground,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
  },

  submitButtonDisabled: {
    backgroundColor: 'gray',
  },

  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  feedbackContainer: {
    marginTop: 30,
    backgroundColor: colors.lessonIconBackground,
    padding: 20,
    borderRadius: 12,
  },

  feedbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  correctText: {
    color: colors.completedCheckmark,
  },

  incorrectText: {
    color: colors.redCircle,
  },

  explanationTitle: {
    fontSize: 16,
    fontWeight: "Poppins-Bold",
    marginBottom: 5,
    color: colors.lessonIcon,
  },

  explanationText: {
    fontSize: 14,
    color: colors.lessonIcon,
    textAlign: 'left',
    marginTop: 5,
  }
});