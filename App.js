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
import NotificationPreferences from './pages/profile/NotificationPreferences';
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
          else if (route.name === 'Bookmarks') iconName = focused ? 'bookmark' : 'bookmark-outline';
          else if (route.name === 'Calendar') iconName = focused ? 'calendar' : 'calendar-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
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

  const [fontsLoaded] = useFonts({
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

  if (!fontsLoaded || loading) return <SplashScreen />;

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerStyle: { backgroundColor: '#0F2577' },
                headerTintColor: '#fff',
                headerTitleAlign: 'center',
              }}
            >
              {user ? (
                <>
                  <Stack.Screen
                    name="MainTabs"
                    component={MainTabs}
                    options={{ headerShown: false }}
                  />

                  <Stack.Screen
                    name="UnitScreen"
                    component={UnitScreen}
                    options={({ route }) => ({
                      headerStyle: {
                        backgroundColor: colors.white,
                        height: 200,
                      },
                      headerTitle: () => (
                        <UnitHeader
                          title={route.params.unit.title}
                          subTitle={`${route.params.unit.lessons.length} Lessons`}
                        />
                      ),
                      headerTitleAlign: 'center',
                      headerTintColor: colors.black,
                      headerBackTitleVisible: false,
                      headerBackButtonDisplayMode: "minimal",
                      headerTitleContainerStyle: {
                        height: 200,
                        justifyContent: 'center',
                      },
                    })}
                  />

                  <Stack.Screen
                    name="LessonScreen"
                    component={LessonScreen}
                    options={({ route }) => ({
                      headerTitle: `Lesson ${route.params.lessonId}`,
                      headerStyle: { backgroundColor: colors.defaultBackground },
                      headerTitleAlign: 'center',
                      headerTintColor: colors.black,
                      headerBackTitleVisible: false,
                      headerBackButtonDisplayMode: "minimal",
                      headerTitleContainerStyle: {
                        justifyContent: 'center',
                      },
                    })}
                  />

                  <Stack.Screen
                    name="QuizScreen"
                    component={QuizScreen}
                    options={({ route }) => ({
                      headerTitle: `Quiz for Lesson ${route.params.lessonId}`,
                      headerStyle: { backgroundColor: colors.defaultBackground },
                      headerTitleAlign: 'center',
                      headerTintColor: colors.black,
                      headerBackTitleVisible: false,
                      headerBackButtonDisplayMode: "minimal",
                    })}
                  />

                  <Stack.Screen
                    name="ViewScore"
                    component={ViewScoreScreen}
                    options={{ headerShown: false }}
                  />

                  <Stack.Screen
                    name="CalendarScreen"
                    component={CalendarScreen}
                    options={{ title: 'Calendar' }}
                  />

                  <Stack.Screen
                    name="BookmarkedQuestionsScreen"
                    component={BookmarkedQuestionsScreen}
                    options={{ title: 'Bookmarks' }}
                  />

                  <Stack.Screen
                    name="BookmarkedLessonsScreen"
                    component={BookmarkedLessonsScreen}
                    options={{ title: 'Bookmarks' }}
                  />

                  <Stack.Screen
                    name="ShowBookmarkedQuestion"
                    component={ShowBookmarkedQuestion}
                    options={{
                      headerShown: true,
                      headerTitle: "Bookmarked Question",
                      headerStyle: {
                        backgroundColor: colors.white,
                      },
                      headerTintColor: colors.black,
                      headerTitleAlign: "center",
                      headerBackButtonDisplayMode: "minimal",
                    }}
                  />

                  <Stack.Screen
                    name="BookmarksScreen"
                    component={BookmarksScreen}
                    options={{ headerShown: false }}
                  />

                  <Stack.Screen
                    name="DiagnosticScreen"
                    component={DiagnosticScreen}
                    options={({ route }) => ({
                      headerTitle: `Diagnostic`,
                      headerStyle: { backgroundColor: colors.defaultBackground },
                      headerTitleAlign: 'center',
                      headerTintColor: colors.black,
                      headerBackTitleVisible: false,
                      headerBackButtonDisplayMode: "minimal",
                    })}
                  />

                  <Stack.Screen
                    name="DateSelectionScreen"
                    component={DateSelectionScreen}
                    options={({ route }) => ({
                      headerTitle: `Select Dates`,
                      headerStyle: { backgroundColor: colors.defaultBackground },
                      headerTitleAlign: 'center',
                      headerTintColor: colors.black,
                      headerBackTitleVisible: false,
                      headerBackButtonDisplayMode: "minimal",
                      headerBackVisible: false,
                    })}
                  />

                  <Stack.Screen
                    name="ExplanationScreen"
                    component={ExplanationScreen}
                    options={{
                      headerShown: true,
                      headerTitle: "Explanations",
                      headerStyle: {
                        backgroundColor: colors.white,
                      },
                      headerTintColor: colors.black,
                      headerTitleAlign: "center",
                    }}
                  />

                  <Stack.Screen
                    name="Profile"
                    component={Profile}
                    options={({ route }) => ({
                      headerTitle: `Profile`,
                      headerStyle: { backgroundColor: colors.defaultBackground },
                      headerTitleAlign: 'center',
                      headerTintColor: colors.black,
                      headerBackTitleVisible: false,
                      headerBackButtonDisplayMode: "minimal",
                    })}
                  />

                  <Stack.Screen
                    name="ProgressReport"
                    component={ProgressReport}
                    options={({ route }) => ({
                      headerTitle: `Progress Report`,
                      headerStyle: { backgroundColor: colors.defaultBackground },
                      headerTitleAlign: 'center',
                      headerTintColor: colors.black,
                      headerBackTitleVisible: false,
                      headerBackButtonDisplayMode: "minimal",
                    })}
                  />

                  <Stack.Screen
                    name="NotificationPreferences"
                    component={NotificationPreferences}
                    options={({ route }) => ({
                      headerTitle: `Notification Preferences`,
                      headerStyle: { backgroundColor: colors.defaultBackground },
                      headerTitleAlign: 'center',
                      headerTintColor: colors.black,
                      headerBackTitleVisible: false,
                      headerBackButtonDisplayMode: "minimal",
                    })}
                  />

                  <Stack.Screen
                    name="ChangeUsername"
                    component={ChangeUsername}
                    options={{ headerShown: false }}
                  />

                  <Stack.Screen
                    name="ChangePassword"
                    component={ChangePassword}
                    options={{ headerShown: false }}
                  />
                </>
              ) : (
                <>
                  <Stack.Screen
                    name="Login"
                    component={Login}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="SignUp"
                    component={SignUp}
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="ForgotPassword"
                    component={ForgotPassword}
                    options={{ headerShown: false }}
                  />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </GestureHandlerRootView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}