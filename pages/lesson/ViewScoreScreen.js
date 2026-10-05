import ScoreRing from '../components/ScoreRing';
import { storageKeyForLesson } from '../utils/content';
import React, { useEffect, useState } from "react";
import { View, Text as RNText, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { auth, db } from "../../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { lesson } from '../utils/lessonRegistry';
import colors from "../../assets/components/colors";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";



export default function ViewScoreScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute();

  const { lessonId, questionId1, questionId2, questionId3, questionId4, selectedAnswer1,
    selectedAnswer2, selectedAnswer3, selectedAnswer4, time } = route.params;

  const lessonData = lesson[`lesson${lessonId}`];

  const [scoreData, setScoreData] = useState(route.params?.result || null);
  const [loading, setLoading] = useState(!route.params?.result);
  const navigation = useNavigation();

  const Text = (props) => (
    <RNText {...props} style={[{ fontFamily: "Poppins-Regular" }, props.style]} />
  );



  useEffect(() => {
    if (route.params?.result) return;
    const fetchScore = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.warn("No user is signed in.");
          setLoading(false);
          return;
        }

        // Use same doc ID as when saving
        const scoreRef = doc(db, "users", user.uid, "scores", storageKeyForLesson(lessonId));
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

  if (!scoreData) return <SafeAreaView style={styles.container}><Text>Unable to load this result.</Text><TouchableOpacity onPress={() => navigation.navigate('MainTabs')}><Text>Return home</Text></TouchableOpacity></SafeAreaView>;

  const elapsed = Math.max(0, Math.floor(time ?? scoreData.timeTaken ?? 0));
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.toolbar}>
        <Text style={styles.toolbarTitle}>Your results</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Return home" style={styles.homeButton} onPress={() => navigation.navigate('MainTabs')}>
          <MaterialIcons name="home" size={24} color="#675CFF" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} style={{ flex: 1, width: '100%' }}>
      <View style={styles.summaryCard}>
        <Text style={styles.eyebrow}>QUIZ COMPLETE</Text>
        <Text style={styles.lessonName}>{lessonData?.title}</Text>
        <ScoreRing score={scoreData.score} total={4} />
        <Text style={styles.resultTitle}>{scoreData.score === 4 ? 'Excellent work!' : scoreData.score === 3 ? 'Almost there!' : 'Keep practicing'}</Text>
        <Text style={styles.supporting}>{scoreData.score} of 4 correct · Every attempt builds understanding.</Text>
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
          <Text style={{ fontFamily: "Poppins-Bold", fontSize: 16, }}>{Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, "0")}</Text>
        </View>


      </View>


      </ScrollView>
      <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) + 10 }]}>
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
          style={[styles.button, { backgroundColor: "#EAE8FF" }]}
          onPress={() => navigation.replace('QuizScreen', {
            lessonId: lessonId,
            lessonTitle: lessonData?.title,
          })}>
          <Text style={[styles.buttonText, { color: colors.basicButton }]}>Take Quiz Again</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.defaultBackground },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, gap: 12 },
  toolbarTitle: { flex: 1, fontFamily: 'Poppins-Bold', fontSize: 23, color: '#29263D' },
  homeButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#31304B', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  content: { paddingHorizontal: 20, paddingBottom: 32, gap: 20 },
  summaryCard: { alignItems: 'center', backgroundColor: '#EFEDFF', borderRadius: 26, paddingHorizontal: 22, paddingVertical: 24, gap: 12 },
  eyebrow: { color: '#675CFF', fontFamily: 'Poppins-SemiBold', fontSize: 11, letterSpacing: 1.5 },
  lessonName: { color: '#59516F', fontFamily: 'Poppins-Medium', fontSize: 14, lineHeight: 22, textAlign: 'center' },
  resultTitle: { fontFamily: 'Poppins-Bold', fontSize: 24, lineHeight: 32, color: '#29263D', textAlign: 'center' },
  supporting: { fontSize: 13, color: '#625C74', textAlign: 'center', lineHeight: 21 },
  performanceBreakdown: { backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#EAE8F5', padding: 20, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, minHeight: 44 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconCheck: { color: '#218357', backgroundColor: '#E4F7EC', padding: 10, borderRadius: 22, overflow: 'hidden' },
  iconX: { color: '#B83A4B', backgroundColor: '#FCECEF', padding: 10, borderRadius: 22, overflow: 'hidden' },
  iconTimer: { color: '#675CFF', backgroundColor: '#EFEDFF', padding: 10, borderRadius: 22, overflow: 'hidden' },
  title: { fontFamily: 'Poppins-Medium', fontSize: 14, lineHeight: 21, color: '#494358', flexShrink: 1 },
  buttonContainer: { borderTopLeftRadius: 28, borderTopRightRadius: 28, elevation: 8, shadowColor: '#31304B', shadowOpacity: 0.1, shadowRadius: 12, paddingTop: 24, width: '100%', gap: 12, backgroundColor: '#fff', paddingHorizontal: 20 },
  button: { paddingVertical: 16, paddingHorizontal: 18, minHeight: 54, justifyContent: 'center', borderRadius: 10 },
  buttonText: { textAlign: 'center', color: '#fff', fontFamily: 'Poppins-Bold' },
});
