import { View, Text as RNText, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../config/firebase";
import { collection, onSnapshot, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import colors from "../../assets/components/colors";
import { ProgressBar } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

export default function BookmarkedLessonsScreen() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lessonScores, setLessonScores] = useState({});
  const navigation = useNavigation();

  const Text = (props) => (
    <RNText {...props} style={[{ fontFamily: "Poppins-Regular" }, props.style]} />
  );

  const handleRemoveLesson = async (item) => {
    console.log('Attempting to remove lesson:', {
      id: item.id,
      lessonId: item.lessonId,
      title: item.title
    });

    Alert.alert(
      "Remove Bookmark",
      "Are you sure you want to remove this lesson from bookmarks?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (!user) {
                Alert.alert("Error", "User not logged in");
                return;
              }

              const lessonRef = doc(db, "users", user.uid, "bookmarks_lessons", item.id);
              
              // Check if document exists before trying to delete
              const docSnap = await getDoc(lessonRef);
              if (docSnap.exists()) {
                // Use deleteDoc to completely remove the document
                await deleteDoc(lessonRef);
                console.log('Successfully removed lesson bookmark:', item.id);
              } else {
                console.log("Lesson bookmark not found:", item.id);
                Alert.alert("Error", "Lesson bookmark not found. It may have already been removed.");
              }
            } catch (error) {
              console.error("Error removing lesson bookmark:", error);
              Alert.alert("Error", "Failed to remove lesson bookmark. Please try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLessons([]);
      setLoading(false);
      return;
    }

    const lessonsRef = collection(db, "users", user.uid, "bookmarks_lessons");

    const unsubscribe = onSnapshot(
      lessonsRef, 
      (snapshot) => {
        const lessonsData = snapshot.docs.map((doc) => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        console.log('Loaded bookmarked lessons:', lessonsData.length);
        setLessons(lessonsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading bookmarked lessons:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchScores = async () => {
      const user = auth.currentUser;
      if (!user) return;

      let scoresObj = {};
      for (const lesson of lessons) {
        const scoreDocRef = doc(db, "users", user.uid, "scores", `lesson${lesson.lessonId}`);
        const scoreSnap = await getDoc(scoreDocRef);
        if (scoreSnap.exists()) {
          scoresObj[lesson.lessonId] = scoreSnap.data().score;
        }
      }
      setLessonScores(scoresObj);
    };

    if (lessons.length > 0) {
      fetchScores();
    }
  }, [lessons]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: "#fff" }}>Loading lessons...</Text>
      </View>
    );
  }

  if (lessons.length === 0) {
    return (
      <View style={styles.noLessons}>
        <Text style={{ color: "#fff" }}>No lessons bookmarked yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ padding: 20 }}
      data={lessons}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const score = lessonScores[item.lessonId];
        let statusText = "Not Started";
        let statusColor = "#aaa";
        let progressBarColor = colors.completedCheckmark;

        if (score !== undefined) {
          if (score === 4) {
            statusText = "Completed";
            statusColor = colors.completedCheckmark;
            progressBarColor = colors.completedCheckmark;
          } else {
            statusText = "In Progress";
            statusColor = colors.yellowCircle;
            progressBarColor = colors.incompleteUnitProgressBar;
          }
        }

        return (
          <View style={styles.box}>
            <View style={styles.lessonRow}>
              <TouchableOpacity
                onPress={() => navigation.navigate("LessonScreen", { lessonId: item.lessonId })}
                style={{ flex: 1 }}
              >
                <Text style={styles.lessonText}>{item.title || `Lesson ${item.id}`}</Text>

                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                  <View style={{ flex: 1, marginRight: 10, marginTop: 5 }}>
                    <ProgressBar
                      color={progressBarColor}
                      progress={(lessonScores[item.lessonId] ?? 0) / 4}
                      style={styles.progressBar}
                      theme={{ colors: { surfaceVariant: colors.unfilledProgressBar } }}
                    />
                  </View>
                  <Text style={[styles.indicator, { color: statusColor }]}>{statusText}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleRemoveLesson(item)} style={styles.xIconTouchable}>
                <MaterialIcons
                  name="close"
                  size={20}
                  color={colors.bookmark}
                  style={styles.xIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  box: {
    marginBottom: 10,
    padding: 20,
    borderColor: colors.gray,
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: colors.white,
  },

  lessonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  lessonText: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    flexWrap: "wrap",
  },

  indicator: {
    textAlign: "right",
    marginTop: 5,
  },

  progressBar: {
    height: 8,
    borderRadius: 10,
    width: "100%",
  },

  xIconTouchable: {
    marginLeft: 10,
    alignSelf: "flex-start",
  },

  xIcon: {
    backgroundColor: colors.bookmarkBackground,
    padding: 4,
    borderRadius: 12,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.defaultBackground,
  },

  noLessons: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.defaultBackground,
  },
});