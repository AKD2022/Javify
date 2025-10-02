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


export const units = [
  {
    id: 'unit1',
    title: 'Unit 1: Introduction to APCSA',
    lessons: [
      {
        id: "lesson1",
        title: "Lesson 1: Introduction to APCSA & Java",
        description: "Discover the foundations of AP Computer Science A and Java programming, including classes, objects, and essential language features."
      },
      {
        id: "lesson2",
        title: "Lesson 2: Setting Up Development Environment & Hello World",
        description: "Learn to set up your Java development environment and write your first Java program with proper syntax and structure."
      },
      {
        id: "lesson3",
        title: "Lesson 3: Variables and Data Types Overview",
        description: "Master the fundamentals of variables and Java's data type system, including primitive types and proper variable declaration."
      },
      {
        id: "lesson4",
        title: "Lesson 4: int Data Type and Integer Operations",
        description: "Explore the int data type in depth, learn integer arithmetic operations, and understand how Java handles whole number calculations."
      },
      {
        id: "lesson5",
        title: "Lesson 5: double Data Type and Floating-Point Operations",
        description: "Learn the double data type for decimal numbers, understand floating-point arithmetic, and master precision considerations in calculations."
      },
      {
        id: "lesson6",
        title: "Lesson 6: boolean Data Type and Logical Values",
        description: "Master the boolean data type for true/false values, understand logical operations, and learn how booleans control program flow."
      },
      {
        id: "lesson7",
        title: "Lesson 7: char Data Type and Characters in Java",
        description: "Learn the char data type for storing single characters, understand character literals, and explore character operations in Java."
      },
      {
        id: "lesson8",
        title: "Lesson 8: Type Casting and Conversion",
        description: "Master type casting and conversion between primitive data types, understand automatic promotion and explicit casting requirements."
      },
      {
        id: "lesson9",
        title: "Lesson 9: Arithmetic Operators and Expressions",
        description: "Master arithmetic operators, operator precedence, and complex mathematical expressions in Java programming."
      },
      {
        id: "lesson10",
        title: "Lesson 10: Operator Precedence and Parentheses",
        description: "Understand operator precedence rules, learn to use parentheses effectively, and master complex expression evaluation in Java."
      },
      {
        id: "lesson11",
        title: "Lesson 11: Using Constants (final keyword)",
        description: "Learn to create unchangeable values with the final keyword, understand constant naming conventions, and master immutable data in Java."
      },
      {
        id: "lesson12",
        title: "Lesson 12: Input and Output Basics (System.out, Scanner intro)",
        description: "Master console output with System.out methods and learn basic input handling with Scanner for interactive Java programs."
      },
      {
        id: "lesson13",
        title: "Lesson 13: String Basics and String Concatenation",
        description: "Learn String fundamentals, master string concatenation techniques, and understand how Java handles text manipulation and formatting."
      },
      {
        id: "lesson14",
        title: "Lesson 14: Common Syntax Errors and Debugging",
        description: "Learn to identify, understand, and fix common Java syntax errors while developing effective debugging strategies and problem-solving skills."
      },
      {
        id: "lesson15",
        title: "Lesson 15: Comments and Code Style",
        description: "Learn to write effective comments, follow Java coding conventions, and develop professional code style practices for readable programs."
      },
      {
        id: "lesson16",
        title: "Lesson 16: Naming Conventions and Reserved Keywords",
        description: "Master Java naming conventions, understand reserved keywords, and learn to create meaningful identifiers for professional code."
      },
      {
        id: "lesson17",
        title: "Lesson 17: Using the Math Class (Math.sqrt, Math.pow)",
        description: "Explore Java's Math class and its powerful mathematical functions including square roots, exponents, and other essential calculations."
      },
      {
        id: "lesson18",
        title: "Lesson 18: Introduction to Methods: Definition and Calling",
        description: "Learn to create and use methods in Java, understand method structure, parameters, and how methods organize code into reusable blocks."
      },
      {
        id: "lesson19",
        title: "Lesson 19: Return Types and Parameters",
        description: "Master method return types, parameter passing, and how methods communicate data with the rest of your Java program."
      },
      {
        id: "lesson20",
        title: "Lesson 20: Recap and Mini Quiz on Unit 1 Concepts",
        description: "Review and consolidate all Unit 1 topics including Java basics, primitive types, operators, methods, and programming fundamentals."
      }
    ],
  },
  {
    id: 'unit2',
    title: 'Using Objects & Methods',
    lessons: [
      {
        id: "lesson21",
        title: "Lesson 21: What are Objects?",
        description: "Discover the fundamental concept of objects in Java, understand the relationship between classes and objects, and learn object-oriented programming basics."
      },
      {
        id: "lesson22",
        title: "Lesson 22: Using the String Class and Common Methods",
        description: "Master the String class, explore essential String methods, and learn to manipulate text effectively in Java programs."
      },
      {
        id: "lesson23",
        title: "Lesson 23: String Immutability and Methods like substring(), length()",
        description: "Understand String immutability, explore advanced String methods, and learn how Java handles String operations efficiently."
      },
      {
        id: "lesson24",
        title: "Lesson 24: Calling Methods and Method Signatures",
        description: "Master method calling syntax, understand method signatures, explore parameter passing, and learn to work with method overloading."
      },
      {
        id: "lesson25",
        title: "Lesson 25: Passing Parameters to Methods",
        description: "Master parameter passing mechanisms, understand pass-by-value behavior, and learn effective techniques for method communication."
      },
      {
        id: "lesson26",
        title: "Lesson 26: Return Values and void Methods",
        description: "Learn the difference between methods that return values and void methods, and understand how to use return statements effectively."
      },
      {
        id: "lesson27",
        title: "Lesson 27: Method Overloading Intro",
        description: "Learn how to create multiple methods with the same name but different parameters through method overloading."
      },
      {
        id: "lesson28",
        title: "Lesson 28: Introduction to the Java Standard Library",
        description: "Discover the Java Standard Library and learn how to use pre-built classes and methods to enhance your programs."
      },
      {
        id: "lesson29",
        title: "Lesson 29: Using the Math Class in Depth",
        description: "Master the Math class and its powerful methods for mathematical operations, from basic calculations to advanced functions."
      },
      {
        id: "lesson30",
        title: "Lesson 30: Wrapper Classes (Integer, Double, Boolean) Intro",
        description: "Learn about wrapper classes that provide object versions of primitive types with powerful utility methods."
      },
      {
        id: "lesson31",
        title: "Lesson 31: Creating Simple Objects and Constructors",
        description: "Learn how to create objects from classes and understand constructors that initialize object properties."
      },
      {
        id: "lesson32",
        title: "Lesson 32: Object References and Memory",
        description: "Understand how object references work in memory and learn the difference between reference types and primitive types."
      },
      {
        id: "lesson33",
        title: "Lesson 33: The this Keyword and Instance Variables",
        description: "Master the this keyword to reference instance variables and understand how to resolve naming conflicts in constructors and methods."
      },
      {
        id: "lesson34",
        title: "Lesson 34: Static vs Instance Methods and Variables",
        description: "Learn the crucial differences between static and instance members, and understand when to use each in your classes."
      },
      {
        id: "lesson35",
        title: "Lesson 35: Recap and Mini Quiz on Unit 2 Concepts",
        description: "Review and consolidate your understanding of objects, methods, constructors, and key concepts from Unit 2."
      },
    ]
  },
  {
    id: 'unit3',
    title: 'Control Structures',
    lessons: [
      {
        id: "lesson36",
        title: "Lesson 36: Introduction to Boolean Expressions",
        description: "Learn about boolean expressions, true and false values, and how they form the foundation of decision-making in programs."
      },
      {
        id: "lesson37",
        title: "Lesson 37: Relational Operators (==, !=, >, <, >=, <=)",
        description: "Master relational operators that compare values and create boolean expressions for decision-making in your programs."
      },
      {
        id: "lesson38",
        title: "Lesson 38: Logical Operators (&&, ||, !)",
        description: "Learn how to combine boolean expressions using logical operators to create complex conditional logic in your programs."
      },
      {
        id: "lesson39",
        title: "Lesson 39: Combining Boolean Expressions",
        description: "Master the art of combining relational and logical operators to create sophisticated conditional logic for complex decision-making."
      },
    ]
  }
];

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [openUnits, setOpenUnits] = useState({});
  const [scoresState, setScoresState] = useState({});
  const [currentLesson, setCurrentLesson] = useState(null);
  const [calendarItems, setCalendarItems] = useState({});
  const navigation_ = useNavigation();
  const [profileIcon, setProfileIcon] = useState("user");
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
