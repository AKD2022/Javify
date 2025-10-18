import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  LayoutAnimation,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UnitItem from './UnitItem';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { loadScores, getScores } from '../utils/dataStore';
import { loadCalendar, getCalendarItems } from '../utils/calendarstore';
import colors from '../../assets/components/colors';
import { ProgressBar } from 'react-native-paper';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { parseISO, isAfter } from 'date-fns';
import { Text as RNText } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { FontAwesome } from "@expo/vector-icons";
import { onSnapshot } from 'firebase/firestore';
import { units } from '../utils/units';



const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [openUnits, setOpenUnits] = useState({});
  const [scoresState, setScoresState] = useState({});
  const [currentLesson, setCurrentLesson] = useState(null);
  const [calendarItems, setCalendarItems] = useState({});
  const navigation_ = useNavigation();
  const [profileIcon, setProfileIcon] = useState("person");
  const [streak, setStreak] = useState(0);


  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists() && snap.data().profileIcon) {
        setProfileIcon(snap.data().profileIcon);
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = yesterday.toISOString().split("T")[0];

        if (data.lastCompletedDate === today) {
          setStreak(data.streak || 0);
        } else {
          // Not today → reset
          setStreak(0);
        }

      }
    };

    fetchData();
  }, [user]);



  const Text = (props) => (
    <RNText {...props} style={[{ fontFamily: 'Poppins-Regular' }, props.style]} />
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchScores = async () => {
      await loadScores(user);
      setScoresState(getScores());
    };

    fetchScores();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const loadCalendarAndNextLesson = async () => {
      const scores = getScores();
      await loadCalendar(user, scores);
      const items = getCalendarItems();
      setCalendarItems(items);

      const todayStr = new Date().toISOString().split('T')[0];

      let nextLesson = null;

      if (Object.keys(items).length > 0) {
        const futureDates = Object.keys(items)
          .filter((date) => isAfter(parseISO(date), parseISO(todayStr)))
          .sort();

        const nextDate = futureDates.length > 0 ? futureDates[0] : todayStr;

        if (items[nextDate]?.length > 0) {
          const lessonId = items[nextDate][0].id;
          const lessonData = units
            .flatMap(u => u.lessons)
            .find(l => l.id === lessonId);

          if (lessonData) {
            const unitTitle = units.find(u => u.lessons.some(l => l.id === lessonId))?.title;
            nextLesson = { ...lessonData, unitTitle, date: nextDate };
          }
        }

      }

      if (!nextLesson) {
        for (let unit of units) {
          for (let lesson of unit.lessons) {
            if (!scores[lesson.id] || scores[lesson.id] < 4) {
              nextLesson = { ...lesson, unitTitle: unit.title };
              break;
            }
          }
          if (nextLesson) break;
        }
      }


      setCurrentLesson(nextLesson);
    };

    loadCalendarAndNextLesson();
  }, [user, scoresState]);

  const toggleUnit = (unitId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenUnits((prev) => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  };

  const isUnitLocked = (unitIndex, units, scoresState) => {
    if (unitIndex === 0) return false;
    const prevUnit = units[unitIndex - 1];
    const allPrevCompleted = prevUnit.lessons.every(
      (lesson) => scoresState[lesson.id] >= 4
    );
    return !allPrevCompleted;
  };


  const currentUnitId =
    Object.keys(openUnits).find((id) => openUnits[id]) || units[0].id;
  const currentUnit = units.find((unit) => unit.id === currentUnitId) || units[0];
  const totalLessons = currentUnit.lessons.length;
  const completedLessons = currentUnit.lessons.filter(
    (lesson) => scoresState[lesson.id] >= 4
  ).length;
  const unitProgress = totalLessons > 0 ? completedLessons / totalLessons : 0;
  const unitProgressPercentage = Math.round(unitProgress * 100);

  let fireColor = colors.gradientStreakStart;
  if (streak < 1) {
    fireColor = colors.white;
  }

  console.log("Streak: " + streak)

  return (
    <SafeAreaView style={styles.container}>
      {/* Welcome Header */}
      <View style={styles.welcomeTextContainer}>
        <View style={styles.welcomeTextSubcontainer}>
          <View style={styles.welcomeTextColumn}>
            <Text style={styles.welcomeTextHeader}>
              Welcome, {user?.displayName || user?.email || 'Guest'}!
            </Text>
            <Text style={styles.welcomeTextSubheader}>
              Let's continue our journey!
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons name='local-fire-department' size={16} color={fireColor} style={{ marginRight: 2 }} />
              <Text style={{ fontSize: 16, color: colors.white }}>{streak}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation_.navigate("Profile")}>
            <MaterialIcons
              name={profileIcon}
              color={colors.white}
              size={25}
              style={styles.profileIcon}
            />
          </TouchableOpacity>


        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarTextContainer}>
            <Text style={styles.progressBarText}>{currentUnit.title}: </Text>
            <Text style={styles.progressBarPercentage}>{unitProgressPercentage}%</Text>
          </View>
          <ProgressBar
            progress={unitProgress}
            color={colors.white}
            style={{ height: 8, borderRadius: 20 }}
            theme={{ colors: { surfaceVariant: colors.unfilledProgressBar } }}
          />
        </View>
      </View>

      {/* Unit List */}
      <FlatList
        data={units}
        keyExtractor={(item) => item.id}
        extraData={{ openUnits, scoresState }}
        renderItem={({ item, index, description }) => (
          <UnitItem
            unit={item}
            isOpen={!!openUnits[item.id]}
            toggleUnit={toggleUnit}
            user={user}
            scoresState={scoresState}
            locked={isUnitLocked(index, units, scoresState)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Continue Learning */}
      <Text style={{ fontSize: 18, fontFamily: 'Poppins-Bold', marginTop: 20 }}>
        Continue Learning
      </Text>

      <TouchableOpacity
        style={{ borderRadius: 10, overflow: 'hidden', marginTop: 10 }}
        disabled={!currentLesson}
        onPress={() => {
          if (currentLesson) {
            navigation.navigate('LessonScreen', {
              lessonId: currentLesson.id.replace('lesson', ''),
              lessonTitle: currentLesson.title,
            });
          }
        }}
      >
        <LinearGradient
          colors={[colors.gradientButtonStart, colors.gradientButtonEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.currentLesson}
        >
          {currentLesson ? (
            <View style={styles.row}>
              <View style={{ flexDirection: 'column' }}>
                <Text
                  style={{
                    fontSize: 16,
                    color: colors.white,
                    marginBottom: 4,
                    fontFamily: 'Poppins-Bold',
                    flexWrap: "wrap",
                    flexShrink: 1,
                  }}
                >
                  {currentLesson.unitTitle}
                </Text>
                <Text style={{ fontSize: 14, color: colors.white, flexShrink: 1, flexWrap: "wrap", maxWidth: "85%" }}>
                  {currentLesson.title}
                </Text>
              </View>

              {/* Right arrow */}
              <MaterialIcons
                name={currentLesson.locked ? 'lock' : 'arrow-forward'}
                size={22}
                color={colors.white}
                style={[styles.icon]}
              />
            </View>
          ) : (
            <Text>🎉 All lessons completed!</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, padding: 20 },
  welcomeTextContainer: {
    backgroundColor: colors.basicButton,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
  },

  welcomeTextSubcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  welcomeTextColumn: {
    flexDirection: 'column'
  },

  welcomeTextHeader: {
    fontSize: 20,
    color: colors.white,
    fontFamily: 'Poppins-Bold',
    paddingBottom: 2
  },

  welcomeTextSubheader: {
    fontSize: 16,
    color: colors.white,
    marginBottom: 15
  },

  profileIcon: {
    backgroundColor: colors.semiTransparentBackground,
    borderRadius: 50,
    padding: 10
  },

  progressBarContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.semiTransparentBackground,
    borderRadius: 10
  },

  progressBarTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },

  progressBarText: {
    color: colors.white
  },

  progressBarPercentage: {
    color: colors.white
  },

  currentLesson: {
    marginTop: 10,
    padding: 20,
    borderRadius: 10,
    width: '100%'
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  icon: {
    backgroundColor: colors.semiTransparentBackground,
    borderRadius: 50,
    padding: 10
  },

});

export default HomeScreen;
