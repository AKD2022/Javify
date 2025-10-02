import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db } from '../../config/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../assets/components/colors';
import { ScrollView } from 'react-native-gesture-handler';
import { Text as RNText } from 'react-native'
import { ProgressBar } from 'react-native-paper';

const LessonCard = ({ lesson, score, locked, description }) => {
  const navigation = useNavigation();

  let status = 'Not Started';
  let statusColor = '#36C0EA';
  let visibility = true;
  let iconVisibilty = false;
  let iconColor = colors.notStartedIcon;

  const Text = (props) => (
    <RNText {...props} style={[{ fontFamily: "Poppins-Regular" }, props.style]} />
  );

  if (score === 4) {
    status = 'Completed';
    statusColor = colors.completedLessonIndicator;
    visibility = false;
    iconVisibilty = false;
  } else if (score !== null && score < 4) {
    status = 'In Progress';
    statusColor = colors.incompleteLessonIndicator;
    visibility = true;
    iconVisibilty = false;
  } else if (status === "Not Started") {
    statusColor = colors.notStartedLessonIndicator;
    visibility = false;
    iconVisibilty = true;
  }

  const handlePress = () => {
    if (locked) {
      Alert.alert(
        "Lesson Locked",
        "Please complete the previous lesson to unlock this lesson",
        [
          {
            text: "Cancel",
            cancelable: true,
            style: 'cancel',
          },
        ]
      );
      return;
    }

    if (score === 4) {
      Alert.alert(
        "Are you sure you want to continue?",
        "You have already completed this lesson, do you wish to continue?",
        [
          {
            text: "Cancel",
            cancelable: true,
            style: 'cancel',
          },
          {
            text: "Continue",
            onPress: () => navigation.navigate('LessonScreen', {
              lessonId: lesson.id.replace('lesson', ''),
              lessonTitle: lesson.title,
            }),
          },
        ]
      );
    } else {
      navigation.navigate('LessonScreen', {
        lessonId: lesson.id.replace('lesson', ''),
        lessonTitle: lesson.title,
      });
    }
  };


  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={locked ? 1 : 0.7}
      style={locked ? { opacity: 0.5 } : {}}
    >
      <View style={styles.card}>
        <View style={styles.row}>
          {locked ? (
            <View style={[styles.iconContainer, { backgroundColor: colors.notStartedIconBackground}]}>
              <MaterialIcons name="lock" size={24} color={colors.notStartedIcon} />
            </View>
          ) : score === 4 ? (
            <View style={[styles.iconContainer, { backgroundColor: colors.completedCheckmarkBackground }]}>
              <MaterialIcons name="check" size={24} color={colors.completedCheckmark} />
            </View>
          ) : (
            <View style={[styles.iconContainer, { backgroundColor: colors.notStartedIconBackground }]}>
              <MaterialIcons name="menu-book" size={24} color={colors.notStartedIcon} />
            </View>
          )}

          <View style={styles.cardContent}>
            <View>
              <Text style={styles.title}>{lesson.title}</Text>
              <Text style={styles.description}>{lesson.description}</Text>
            </View>
            <Text style={[styles.indicator, { color: statusColor }]}>{status}</Text>

            <ProgressBar
              progress={score / 4}
              color={colors.incompleteLessonProgressBar}
              style={{ height: 8, borderRadius: 20, marginTop: 5 }}
              theme={{ colors: { surfaceVariant: colors.unfilledProgressBar } }}
              visible={visibility}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    padding: 20,
    borderColor: colors.gray,
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: colors.white,
    flexDirection: 'row',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  cardContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  column: {
    flexDirection: 'column',
  },

  indicator: {
    fontSize: 12,
    marginTop: 5,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  card: {
    marginBottom: 10,
    padding: 20,
    borderColor: colors.gray,
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: colors.white,
  },

  title: {
    fontSize: 16,
    color: colors.black,
    fontFamily: "Poppins-Bold",
  },

  description: {
    fontSize: 14,
    marginTop: 5,
  },

  buttonRow: {
    alignItems: 'flex-start',
  },

  notStartedIconBackground: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: colors.notStartedIconBackground
  },

});

export default LessonCard;
