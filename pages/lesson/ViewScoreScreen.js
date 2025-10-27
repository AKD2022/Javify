import React, { useEffect, useState } from "react";
import { View, Text as RNText, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { auth, db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { lesson } from '../utils/lessonRegistry';
import colors from "../../assets/components/colors";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";



export default function ViewScoreScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute();

  const { lessonId, questionId1, questionId2, questionId3, questionId4, selectedAnswer1,
    selectedAnswer2, selectedAnswer3, selectedAnswer4, time } = route.params;

  const lessonData = lesson[`lesson${lessonId}`];

  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const Text = (props) => (
    <RNText {...props} style={[{ fontFamily: "Poppins-Regular" }, props.style]} />
  );

  console.log("Question Id's in ViewScoreScreen: " + questionId1, questionId2, questionId3, questionId4);
  console.log("Selected Answer Id's in ViewScoreScreen: " + selectedAnswer1, selectedAnswer2, selectedAnswer3, selectedAnswer4);


  useEffect(() => {
    const fetchScore = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.warn("No user is signed in.");
          setLoading(false);
          return;
        }

        // Use same doc ID as when saving
        const scoreRef = doc(db, "users", user.uid, "scores", `lesson${lessonId}`);
        const scoreSnap = await getDoc(scoreRef);

        if (scoreSnap.exists()) {
          setScoreData(scoreSnap.data());
        } else {
          setScoreData(null); // No score found
        }
      } catch (error) {
        console.error("Error fetching score:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, [lessonId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </SafeAreaView>
    );
  }

  let backgroundColor = colors.greenCircle;

  if (scoreData.score == 4) {
    backgroundColor = colors.greenCircle;
  } else if (scoreData.score == 3) {
    backgroundColor = colors.yellowCircle;
  } else if (scoreData.score < 3) {
    backgroundColor = colors.redCircle;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <TouchableOpacity
        style={[styles.floatingActionButton, { top: insets.top + 30}]}
        onPress={() => navigation.navigate("MainTabs")}
      >
        <MaterialIcons name="home" size={25} color={colors.bookmark} />
      </TouchableOpacity>



      <View style={[styles.percentage, { backgroundColor }]}>
        <Text style={styles.percentageText}>
          {Math.round((scoreData.score / 4) * 100)}%
        </Text>
      </View>


      <View style={styles.message}>
        <Text style={
          {
            textAlign: "center",
            fontFamily: "Poppins-Bold",
            fontSize: 24,
            marginVertical: 5,
          }
        }>Great Job!
        </Text>
        <Text style={{ fontSize: 14, textAlign: "center" }}>You answered {scoreData.score} out of 4 questions correctly!</Text>
      </View>

      <View style={styles.performanceBreakdown}>
        <Text style={{ fontFamily: "Poppins-Bold", fontSize: 18, }}>Performance Breakdown</Text>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <MaterialIcons name="check" style={styles.iconCheck} size={24} />
            <Text style={styles.title}>Correct Answers</Text>
          </View>
          <Text style={{ color: colors.greenCircle, fontFamily: "Poppins-Bold", fontSize: 16, }}>{scoreData.score}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <MaterialIcons name="close" style={styles.iconX} size={24} />
            <Text style={styles.title}>Incorrect Answers</Text>
          </View>
          <Text style={{ color: colors.redCircle, fontFamily: "Poppins-Bold", fontSize: 16, }}>{4 - scoreData.score}</Text>
        </View>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <MaterialIcons name="timer" style={styles.iconTimer} size={24} />
            <Text style={styles.title}>Time Taken</Text>
          </View>
          <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16, }}>{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, "0")}</Text>
        </View>


      </View>


      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.basicButton, elevation: 4 }]}
          onPress={() => navigation.navigate('ExplanationScreen', {
            lessonId: lessonId,
            questionId1: questionId1,
            questionId2: questionId2,
            questionId3: questionId3,
            questionId4: questionId4,
            selectedAnswer1: selectedAnswer1,
            selectedAnswer2: selectedAnswer2,
            selectedAnswer3: selectedAnswer3,
            selectedAnswer4: selectedAnswer4,
            score: scoreData.score,
          })}>
          <Text style={styles.buttonText}>Review Answers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.gray }]}
          onPress={() => navigation.replace('QuizScreen', {
            lessonId: lessonId,
            lessonTitle: lessonData.title,
          })}>
          <Text style={styles.buttonText}>Take Quiz Again</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 100,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  percentage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  performanceBreakdown: {
    marginHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.gray,
    padding: 20,
    width: "100%",
  },

  percentageText: {
    fontSize: 30,
    color: colors.white,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
  },

  percentageContainer: {
    display: "flex",
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconCheck: {
    color: colors.completedCheckmark,
    backgroundColor: colors.completedCheckmarkBackground,
    padding: 10,
    borderRadius: 50,
    marginRight: 10
  },

  iconX: {
    color: colors.redCircle,
    backgroundColor: colors.redCheckmarkBackground,
    padding: 10,
    borderRadius: 50,
    marginRight: 10
  },

  iconTimer: {
    color: colors.yellowCircle,
    backgroundColor: colors.timerIconBackground,
    padding: 10,
    borderRadius: 50,
    marginRight: 10
  },

  performanceBreakdown: {
    marginTop: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.gray,
    padding: 20,
    width: "100%"
  },

  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    textAlign: "left",
  },

  buttonContainer: {
    position: "absolute",
    borderWidth: 1,
    borderColor: colors.gray,
    bottom: 0,
    paddingVertical: 25,
    paddingBottom: 45,
    width: "200%",
    gap: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 200,
  },

  button: {
    padding: 15,
    borderRadius: 10,
  },

  buttonText: {
    textAlign: "center",
    color: colors.white,
    fontFamily: "Poppins-Bold"
  },

  floatingActionButton: {
    position: "absolute",
    right: 20,              
    backgroundColor: colors.bookmarkBackground,
    padding: 18,
    borderRadius: 50,
    elevation: 6,
    zIndex: 999,           
  },


});
