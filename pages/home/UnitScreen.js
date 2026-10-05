import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { loadScores, getScores } from '../utils/dataStore';
import { auth } from '../../config/firebase';
import { Alert } from 'react-native';
import { View, FlatList, StyleSheet, Platform, StatusBar } from 'react-native';
import LessonCard from '../home/LessonCard';
import colors from '../../assets/components/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text as RNText } from 'react-native-paper';

const UnitScreen = ({ route }) => {
    const { unit } = route.params;
    const [scoresState, setScoresState] = useState(route.params.scoresState || getScores());
    useFocusEffect(useCallback(() => {
      let active = true;
      setScoresState(getScores());
      loadScores(auth.currentUser).then(() => { if (active) setScoresState(getScores()); }).catch(() => { if (active) Alert.alert('Progress unavailable', 'Showing cached progress. Please check your connection.'); });
      return () => { active = false; };
    }, []));

    const Text = (props) => (
        <RNText {...props} style={[{ fontFamily: "Poppins-Regular" }, props.style]} />
    );

    return (
        <View style={styles.container}>
            <FlatList
                showsVerticalScrollIndicator={false}
                data={unit.lessons}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => {
                    return (
                        <LessonCard
                            lesson={item}
                            score={scoresState[item.id] ?? null}
                            locked={false}
                        />
                    );
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.defaultBackground,
        paddingTop: 8,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
});

export default UnitScreen;