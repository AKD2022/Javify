import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import colors from '../../assets/components/colors';
import { ProgressBar } from 'react-native-paper';
import { Text as RNText } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const UnitItem = ({ unit, scoresState, unitIndex, units }) => {
  const navigation = useNavigation();
  const nextLesson = unit.lessons.find((lesson) => !scoresState[lesson.id] || scoresState[lesson.id] < 4) 
  || unit.lessons[0];


  const Text = (props) => (
    <RNText {...props} style={[{ fontFamily: "Poppins-Regular" }, props.style]} />
  );

  // Calculate progress
  const totalLessons = unit.lessons.length;
  const completedLessons = unit.lessons.filter(
    (lesson) => scoresState[lesson.id] >= 4
  ).length;
  const progress = totalLessons > 0 ? completedLessons / totalLessons : 0;

  // Lock logic: previous unit must be complete
  const isLocked = unitIndex > 0
    ? !units[unitIndex - 1].lessons.every((lesson) => scoresState[lesson.id] >= 4)
    : false;

  // Icon setup
  let iconName = 'menu-book';
  let iconColor = colors.notStartedIcon;
  let backgroundColor = colors.notStartedIconBackground;

  if (isLocked) {
    iconName = 'lock';
    iconColor = colors.gray;
    backgroundColor = colors.lessonIconBackground;
  } else if (completedLessons === totalLessons && totalLessons > 0) {
    iconName = 'check';
    iconColor = colors.completedCheckmark;
    backgroundColor = colors.completedCheckmarkBackground;
  } else if (completedLessons > 0) {
    iconName = 'menu-book';
    iconColor = colors.incompleteUnitIcon;
    backgroundColor = colors.incompleteUnitIconBackground;
  }

  return (
    <TouchableOpacity
      style={styles.box}
      onPress={() => {
        if (!isLocked) {
          navigation.navigate('UnitScreen', { unit, scoresState, unitIndex, units, totalLessons: unit.lessons.length,  lesson: nextLesson });
        }
      }}
      disabled={isLocked}
    >
      <View style={styles.rowItems}>
        <View style={[styles.iconContainer, { backgroundColor }]}>
          <MaterialIcons name={iconName} size={24} color={iconColor} />
        </View>

        <Text style={styles.unitTitle}>
          {unit.title || 'Untitled'}
          {'\n'}
          <Text style={styles.lessonProgressIndicator}>
            {completedLessons}/{totalLessons} Completed
          </Text>
        </Text>


        <MaterialIcons name={'keyboard-arrow-right'} style={styles.arrow} />
      </View>

      <ProgressBar
        color={colors.incompleteUnitProgressBar}
        progress={progress}
        style={styles.progressBar}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rowItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  box: {
    marginBottom: 10,
    padding: 20,
    borderColor: colors.gray,
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: colors.white,
  },

  progressBar: {
    marginTop: 10,
    height: 8,
    borderRadius: 20,
  },

  unitTitle: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: colors.black,
    flex: 1,
    marginLeft: 10,
  },

  arrow: {
    fontSize: 30,
    color: colors.gray,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  lessonProgressIndicator: {
    color: colors.lessonProgressIndicator
  },
});

export default UnitItem;
