import React from 'react';
import { View, FlatList, StyleSheet, Platform, StatusBar } from 'react-native';
import LessonCard from '../home/LessonCard';
import colors from '../../assets/components/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text as RNText } from 'react-native-paper';

const UnitScreen = ({ route }) => {
    const { unit, scoresState } = route.params;

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
                    const prevLesson = unit.lessons[index - 1];
                    const isLocked =
                        index > 0 && (scoresState[prevLesson?.id] || 0) < 4;

                    return (
                        <LessonCard
                            lesson={item}
                            score={scoresState[item.id] ?? null}
                            locked={isLocked}
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
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 50,
    },
});

export default UnitScreen;