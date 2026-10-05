import AppHeader from './pages/components/AppHeader';
import StudyHubScreen from './pages/study/StudyHubScreen';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { registerTranslation } from 'react-native-paper-dates';
import { enGB } from 'react-native-paper-dates';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator } from 'react-native';
import { useFonts } from 'expo-font';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { auth } from './config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { units } from './pages/utils/units';
import LessonSearchScreen from './pages/study/LessonSearchScreen';
import JavaReferenceScreen from './pages/study/JavaReferenceScreen';
import QuestionIssueScreen from './pages/study/QuestionIssueScreen';
import DiagnosticResultsScreen from './pages/diagnostic/DiagnosticResultsScreen';
import StudyPlanScreen from './pages/study/StudyPlanScreen';
import ReviewScreen from './pages/study/ReviewScreen';
import CurriculumScreen from './pages/study/CurriculumScreen';
import HomeScreen from './pages/home/HomeScreen';
import QuizScreen from './pages/lesson/QuizScreen';
import LessonScreen from './pages/lesson/LessonScreen';
import Login from './login/LoginScreen';
import SignUp from './login/CreateAccountScreen';
import ForgotPassword from './login/ForgotPasswordScreen';
import ViewScoreScreen from './pages/lesson/ViewScoreScreen';
import CalendarScreen from './pages/calendar/CalendarScreen';
import BookmarkedQuestionsScreen from './pages/bookmarks/BookmarkedQuestionsScreen';
import ShowBookmarkedQuestion from './pages/bookmarks/ShowBookmarkedQuestion';
import DiagnosticScreen from './pages/diagnostic/DiagnosticScreen';
import DateSelectionScreen from './pages/diagnostic/DateSelectionScreen';
import ExplanationScreen from './pages/lesson/ExplanationScreen';
import UnitScreen from './pages/home/UnitScreen';
import BookmarkedLessonsScreen from './pages/bookmarks/BookmarkedLessonsScreen';
import BookmarksScreen from './pages/bookmarks/BookmarksScreen';
import Profile from './pages/profile/Profile';
import ProgressReport from './pages/profile/ProgressReport';
// Temporarily avoid loading expo-notifications in Expo Go. Restore the original
// NotificationPreferences import when notification support is re-enabled.
import NotificationPreferences from './pages/profile/NotificationsPaused';
import ChangeUsername from './pages/profile/ChangeUsername';
import ChangePassword from './pages/profile/ChangePassword';
import UnitHeader from './assets/components/unitHeader';
import colors from './assets/components/colors';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tabs
function MainTabs() {
  registerTranslation('en', enGB);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.white },
        tabBarActiveTintColor: colors.basicButton,
        tabBarInactiveTintColor: '#bbb',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Study') iconName = focused ? 'school' : 'school-outline';
          else if (route.name === 'Bookmarks') iconName = focused ? 'bookmark' : 'bookmark-outline';
          else if (route.name === 'Calendar') iconName = focused ? 'calendar' : 'calendar-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Study" component={StudyHubScreen} />
      <Tab.Screen name="Bookmarks" component={BookmarksScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
    </Tab.Navigator>
  );
}

// Splash Screen Component
const SplashScreen = () => (
  <View style={{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.basicButton
  }}>
    <ActivityIndicator size="large" color="#fff" />
    <Text style={{ color: '#fff', marginTop: 10, fontSize: 16 }}>Loading...</Text>
  </View>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    "Poppins-Regular": require("./assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("./assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Medium": require("./assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("./assets/fonts/Poppins-SemiBold.ttf")
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if ((!fontsLoaded && !fontError) || loading) return <SplashScreen />;

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ header: props => <AppHeader {...props} />, contentStyle: { backgroundColor: colors.defaultBackground } }}>
              {user ? <>
                <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
                <Stack.Screen name="UnitScreen" component={UnitScreen} options={({ route }) => ({ title: route.params.unit.title })} />
                <Stack.Screen name="LessonScreen" component={LessonScreen} options={{ title: '' }} />
                <Stack.Screen name="QuizScreen" component={QuizScreen} options={({ route }) => ({ title: (units.flatMap(u => u.lessons).find(l => l.id === `lesson${route.params?.lessonId}`)?.title || 'Lesson quiz').replace(/^\d+\.\d+\s+/, '') })} />
                <Stack.Screen name="ViewScore" component={ViewScoreScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ExplanationScreen" component={ExplanationScreen} options={{ title: 'Review your answers' }} />
                <Stack.Screen name="LessonSearch" component={LessonSearchScreen} options={{ title: '' }} />
                <Stack.Screen name="JavaReference" component={JavaReferenceScreen} options={{ title: '' }} />
                <Stack.Screen name="QuestionIssue" component={QuestionIssueScreen} options={{ title: '' }} />
                <Stack.Screen name="DiagnosticScreen" component={DiagnosticScreen} options={{ title: 'Your starting point' }} />
                <Stack.Screen name="DiagnosticResults" component={DiagnosticResultsScreen} options={{ title: 'Diagnostic results' }} />
                <Stack.Screen name="StudyPlan" component={StudyPlanScreen} options={{ title: '' }} />
                <Stack.Screen name="DateSelectionScreen" component={DateSelectionScreen} options={{ title: '' }} />
                <Stack.Screen name="ReviewMissed" component={ReviewScreen} options={{ title: 'Review missed questions' }} />
                <Stack.Screen name="Curriculum" component={CurriculumScreen} options={{ title: '' }} />
                <Stack.Screen name="CalendarScreen" component={CalendarScreen} options={{ title: '' }} />
                <Stack.Screen name="BookmarkedQuestionsScreen" component={BookmarkedQuestionsScreen} options={{ title: 'Saved questions' }} />
                <Stack.Screen name="BookmarkedLessonsScreen" component={BookmarkedLessonsScreen} options={{ title: 'Saved lessons' }} />
                <Stack.Screen name="ShowBookmarkedQuestion" component={ShowBookmarkedQuestion} options={{ title: 'Saved question' }} />
                <Stack.Screen name="BookmarksScreen" component={BookmarksScreen} options={{ title: 'Bookmarks' }} />
                <Stack.Screen name="Profile" component={Profile} options={{ title: 'Profile' }} />
                <Stack.Screen name="ProgressReport" component={ProgressReport} options={{ title: 'Your progress' }} />
                <Stack.Screen name="NotificationPreferences" component={NotificationPreferences} options={{ title: 'Notifications' }} />
                <Stack.Screen name="ChangeUsername" component={ChangeUsername} options={{ headerShown: false }} />
                <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ headerShown: false }} />
              </> : <>
                <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
                <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
                <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
              </>}
            </Stack.Navigator>
          </NavigationContainer>
        </GestureHandlerRootView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}