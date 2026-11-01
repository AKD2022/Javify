import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';


import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../assets/components/colors';

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
          <Text style={styles.number}>{String(lesson.number).padStart(2, '0')}</Text>
          <View style={styles.cardContent}>
            <Text style={styles.title}>{lesson.title}</Text>
            <Text style={styles.description}>{lesson.description}</Text>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 }}><MaterialIcons name={locked ? 'lock' : score === 4 ? 'check-circle' : 'radio-button-unchecked'} size={16} color={statusColor} /><Text style={[styles.indicator, { color: statusColor }]}>{status}</Text></View>
            {visibility && <ProgressBar progress={Math.max(0, Math.min(1, (score ?? 0) / 4))} color={colors.incompleteLessonProgressBar} style={{ height: 3, marginTop: 12 }} theme={{ colors: { surfaceVariant: colors.gray } }} />}
          </View>
          <MaterialIcons name="chevron-right" size={22} color={colors.bookmark} />
        </View>
      </View>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  card: { paddingVertical: 24, borderBottomWidth: 1, borderColor: colors.gray },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  number: { fontFamily: 'Poppins-Medium', color: colors.bookmark, fontSize: 14, width: 26, paddingTop: 2 },
  cardContent: { flex: 1, gap: 4 },
  title: { fontFamily: 'Poppins-SemiBold', fontSize: 17, lineHeight: 26, color: colors.black },
  description: { fontFamily: 'Poppins-Regular', fontSize: 14, lineHeight: 22, color: colors.bookmark },
  indicator: { fontFamily: 'Poppins-Medium', fontSize: 12 },
});
export default LessonCard;
