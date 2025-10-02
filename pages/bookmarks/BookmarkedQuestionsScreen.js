import React, { useState, useEffect } from "react";
import { View, Text as RNText, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { auth, db } from "../../config/firebase";
import { collection, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import colors from "../../assets/components/colors";

export default function BookmarkedQuestionsScreen() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const Text = (props) => (
    <RNText {...props} style={[{ fontFamily: "Poppins-Regular" }, props.style]} />
  );

  // Remove a question from bookmarks
  const handleRemoveBookmark = async (item) => {
    Alert.alert(
      "Remove Bookmark",
      "Are you sure you want to remove this bookmark?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (!user) return;

              const lessonId = item.lessonId != null ? String(item.lessonId) : "1";
              const bookmarkRef = doc(db, "users", user.uid, "bookmarks", `lesson${lessonId}`);
              const docSnap = await getDoc(bookmarkRef);

              if (!docSnap.exists()) return;

              const data = docSnap.data();

              // Find the exact key in Firestore
              const keyToDelete = Object.keys(data).find(
                key => key === item.questionKey || key === item.originalId
              );

              if (keyToDelete) {
                // Delete only that key
                const updatedData = { ...data };
                delete updatedData[keyToDelete];

                await setDoc(bookmarkRef, updatedData); // no merge needed

                // Update local state
                setBookmarks(prev => prev.filter(q => q.uniqueKey !== item.uniqueKey));
              } else {
                console.log("Could not find question in Firestore to delete:", item);
              }
            } catch (error) {
              console.error("Error removing bookmark:", error);
              Alert.alert("Error", "Failed to remove bookmark. Please try again.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };


  // Load all bookmarked questions
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    const bookmarksCollectionRef = collection(db, "users", user.uid, "bookmarks");

    const unsubscribe = onSnapshot(
      bookmarksCollectionRef,
      (querySnapshot) => {
        const allQuestions = [];
        let counter = 0;

        querySnapshot.forEach((docSnap) => {
          const lessonQuestions = docSnap.data();
          const lessonId = docSnap.id.replace("lesson", "");

          Object.entries(lessonQuestions).forEach(([questionKey, q]) => {
            const originalId = q.id || questionKey;
            const uniqueId = `q_${lessonId}_${counter++}_${Date.now()}`;

            allQuestions.push({
              ...q,
              id: uniqueId,
              originalId,
              questionKey,
              lessonId: q.lessonId || lessonId,
              uniqueKey: `${lessonId}_${uniqueId}_${counter}`,
            });
          });
        });

        setBookmarks(allQuestions);
        setLoading(false);
      },
      (error) => {
        console.error("Error getting bookmarks:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#fff" }}>Loading bookmarks...</Text>
      </View>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#fff" }}>No bookmarked questions yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ padding: 20 }}
      data={bookmarks}
      keyExtractor={(item, index) => item.uniqueKey || `bookmark_${item.lessonId}_${item.id}_${index}`}
      renderItem={({ item }) => {
        const answered = item.selectedAnswer != null;
        const statusText = answered ? "Answered" : "Not Answered";
        const statusColor = answered ? "#4CAF50" : "#FFA500";

        return (
          <TouchableOpacity
            onPress={() => navigation.navigate("ShowBookmarkedQuestion", { question: item })}
            style={styles.box}
          >
            <View style={styles.questionRow}>
              <Text style={styles.questionText}>{item.question}</Text>

              <TouchableOpacity onPress={() => handleRemoveBookmark(item)}>
                <MaterialIcons
                  name="close"
                  size={18}
                  color={colors.bookmark}
                  style={styles.xIcon}
                />
              </TouchableOpacity>
            </View>

            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </TouchableOpacity>
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

  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  questionText: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: colors.black,
    flex: 1,
    flexWrap: 'wrap',
    paddingRight: 8,
  },

  statusText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.defaultBackground,
  },

  xIcon: {
    backgroundColor: colors.bookmarkBackground,
    padding: 4,
    borderRadius: 12,
  },
});
