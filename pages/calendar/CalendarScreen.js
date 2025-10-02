import React, { useState, useEffect } from 'react';
import { View, Text as RNText, ScrollView, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarProvider, ExpandableCalendar } from 'react-native-calendars';
import { auth } from '../../config/firebase';
import { parseISO, format } from 'date-fns';
import { getScores } from '../utils/dataStore';
import { loadCalendar, getCalendarItems } from '../utils/calendarstore';
import { getStartDate, getEndDate } from '../diagnostic/datestore';
import { useNavigation } from '@react-navigation/native';
import colors from '../../assets/components/colors';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import GradientButton from '../../assets/components/gradientButton';

export default function CalendarScreen() {
  const user = auth.currentUser;
  const navigation = useNavigation();
  const [items, setItems] = useState({});
  const [diagnosticStatus, setDiagnosticStatus] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const Text = (props) => (
    <RNText {...props} style={[{ fontFamily: "Poppins-Regular" }, props.style]} />
  );


  // Preload calendar
  useEffect(() => {
    const preloadCalendar = async () => {
      if (!user) return;

      const scores = getScores(); // cached scores
      console.log('Scores loaded:', scores);

      await loadCalendar(user, scores); // load/build calendar in datastore
      const calendarData = getCalendarItems(); // get cached items after load
      console.log('Calendar items loaded/rescheduled:', calendarData);

      setItems(calendarData);

      // Diagnostic check
      setDiagnosticStatus(
        Object.keys(calendarData).length === 0
          ? "Take Diagnostic to create personalized calendar"
          : ""
      );
    };

    preloadCalendar();
  }, [user]);

  // Marked dates for calendar
  const markedDates = Object.keys(items).reduce((acc, date) => {
    acc[date] = {
      marked: true,
      dotColor: '#36C0EA',
      selected: selectedDate === date,
      selectedColor: colors.basicButton,
    };
    return acc;
  }, {});

  const handleDayPress = (day) => setSelectedDate(day.dateString);

  const selectedDateText = selectedDate
    ? format(parseISO(selectedDate), "EEEE, MMMM do")
    : null;

  const getLessonStatus = (lessonId) => {
    const score = getScores()[lessonId];
    if (score === 4) return 'Lesson Completed';
    if (score !== null && score <= 3) return 'In Progress';
    return 'Not Started';
  };


  return (
    <CalendarProvider
      date={selectedDate}
      onDateChanged={handleDayPress}
      style={styles.container}
    >

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.calendarBox}>
          <View style={styles.calendarScaler}>
            <ExpandableCalendar
              onDayPress={handleDayPress}
              markedDates={markedDates}
              initialPosition="open"
              hideKnob={false}
              allowShadow
              closeOnDayPress={false}
              renderArrow={(direction) => {
                return (
                  <MaterialIcons
                    name={direction === 'left' ? 'keyboard-arrow-left' : 'keyboard-arrow-right'}
                    size={28}
                    color={colors.gray}
                  />
                );
              }}
              theme={{
                calendarBackground: colors.white,
                todayTextColor: colors.basicButton,
                dayTextColor: colors.black,
                monthTextColor: colors.black,
                textSectionTitleColor: colors.black,
                selectedDayBackgroundColor: colors.basicButton,
                selectedDotColor: colors.basicButton,
                dotColor: colors.redCircle,
              }}
            />

          </View>
        </View>




        <ScrollView style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateText}>
            {selectedDateText ? `${selectedDateText}` : "Select a date"}
          </Text>

          {diagnosticStatus ? (
            <View style={styles.diagnosticContainer}>
              <GradientButton title={diagnosticStatus} onPress={() => navigation.navigate('DiagnosticScreen')} />
            </View>
          ) : null}

          {items[selectedDate] ? (
            items[selectedDate].map((lesson, index) => (
              <TouchableOpacity
                key={index}
                style={styles.lessonItem}
                onPress={() => navigation.navigate('LessonScreen', { lessonId: lesson.id.replace('lesson', '') })}
              >
                <View style={styles.lessonContent}>
                  <Text style={styles.lessonText}>{lesson.name}</Text>
                  <Text style={styles.lessonStatusText}>{getLessonStatus(lesson.id)}</Text>
                </View>
                <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.bookmark} style={{ backgroundColor: colors.bookmarkBackground, padding: 5, borderRadius: 50, }} />
              </TouchableOpacity>

            ))
          ) : (
            <Text style={styles.noLessonText}>No lessons scheduled for today!</Text>
          )}
        </ScrollView>
      </SafeAreaView>
    </CalendarProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.defaultBackground,
  },

  calendarBox: {
    alignItems: 'center',      // centers the scaled calendar
    marginTop: 10,
  },

  calendarScaler: {
    transform: [{ scale: 0.94 }],
    borderRadius: 20,
    borderWidth: 0.75,
    borderColor: colors.gray,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },

  selectedDateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 10,
  },

  selectedDateContainer: {
    flex: 1,
    padding: 20,
  },

  lessonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 15,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 0.75,
    borderColor: colors.gray,
  },

  lessonContent: {
    flex: 1,
  },

  lessonText: {
    color: colors.black,
    fontFamily: "Poppins-SemiBold",
    fontSize: 16
  },

  lessonStatusText: { color: '#bbb', fontSize: 14, marginTop: 4 },

  noLessonText: { color: colors.black },

  diagnosticContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    alignItems: 'center',
  },

  diagnosticText: { color: '#fff', fontWeight: 'bold' },
});
