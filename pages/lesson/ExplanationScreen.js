import React from 'react';
import { View, Text as RNText, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { quizzes } from '../utils/quizRegistry';
import colors from '../../assets/components/colors';
import { ProgressBar } from 'react-native-paper';
import { TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function ExplanationScreen() {
    const route = useRoute();
    const { lessonId, questionId1, questionId2, questionId3, questionId4, selectedAnswer1,
        selectedAnswer2, selectedAnswer3, selectedAnswer4, score } = route.params;

    const navigation = useNavigation();

    const Text = (props) => (
        <RNText {...props} style={[{ fontFamily: "Poppins-Regular" }, props.style]} />
    );

    const quizKey = `lesson${lessonId}`;
    const quizData = quizzes[quizKey];

    // Helper function to render either text or code with optional style
    const renderOptionValue = (option, style) => {
        if (!option) return '';
        return option.type === 'code' ? (
            <Text style={[styles.codeText, style]}>{option.value}</Text>
        ) : (
            <Text style={style}>{option.value}</Text>
        );
    };

    // Build an array of question data
    const questionsData = [
        { id: questionId1, selectedAnswer: selectedAnswer1 },
        { id: questionId2, selectedAnswer: selectedAnswer2 },
        { id: questionId3, selectedAnswer: selectedAnswer3 },
        { id: questionId4, selectedAnswer: selectedAnswer4 },
    ].map((q) => {
        const questionObj = quizData?.questions.find(x => x.id === q.id);
        if (!questionObj) return null;

        const correctAnswerIndex = questionObj.answer;
        const correctAnswer = questionObj.options[correctAnswerIndex];
        const chosenAnswer = questionObj.options[q.selectedAnswer];

        const isCorrect = chosenAnswer === correctAnswer;

        return {
            ...questionObj,
            chosenAnswer,
            correctAnswer,
            isCorrect,
        };
    }).filter(q => q !== null);

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Score Box */}
                <View style={styles.scoreBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="bar-chart" size={24} style={styles.icon} />

                        <View style={{ flex: 1, flexDirection: 'column', marginLeft: 10 }}>
                            <Text style={styles.scoreBoxTitle}>Your results</Text>
                            <Text style={styles.scoreBoxSubtitle}>{score} out of 4 questions</Text>
                        </View>

                        <Text style={[styles.scoreBoxSubtitle, { color: colors.lessonIcon, fontSize: 24, fontFamily: "Poppins-Bold" }]}>
                            {Math.round((score / 4) * 100)}%
                        </Text>
                    </View>

                    <View style={styles.progressContainer}>
                        <ProgressBar
                            progress={score / 4}
                            theme={{ colors: { surfaceVariant: colors.unfilledProgressBar } }}
                            color={colors.lessonIcon}
                            style={styles.progressBar}
                        />
                    </View>
                </View>

                {/* Questions */}
                {questionsData.map((q, index) => (
                    <View key={q.id} style={styles.explanationBox}>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
                            <Text style={styles.questionNumber}>Question {index + 1}</Text>
                            <MaterialIcons
                                name={q.isCorrect ? "check" : "close"}
                                style={[styles.icon, {
                                    backgroundColor: q.isCorrect ? colors.completedCheckmarkBackground : colors.redCheckmarkBackground,
                                    color: q.isCorrect ? colors.completedCheckmark : colors.redCircle,
                                    padding: 5,
                                    marginLeft: 5
                                }]}
                            />
                        </View>

                        <Text style={styles.question}>{q.question}</Text>

                        {/* Your Answer */}
                        <View style={[styles.answerBox, {
                            backgroundColor: q.isCorrect ? colors.completedCheckmarkBackground : colors.redCheckmarkBackground,
                            borderColor: q.isCorrect ? colors.completedCheckmark : colors.redCircle
                        }]}>
                            <Text style={{ color: q.isCorrect ? colors.completedCheckmark : colors.redCircle, marginBottom: 5 }}>
                                <MaterialIcons name="person" size={16} /> Your Answer
                            </Text>
                            {renderOptionValue(q.chosenAnswer, styles.codeAnswer)}
                        </View>

                        {/* Correct Answer */}
                        <View style={[styles.answerBox, {
                            backgroundColor: colors.completedCheckmarkBackground,
                            borderColor: colors.completedCheckmark,
                            marginBottom: 5
                        }]}>
                            <Text style={{ color: colors.completedCheckmark, marginBottom: 5 }}>
                                <MaterialIcons name="check" size={16} color={colors.completedCheckmark} /> Correct Answer
                            </Text>
                            {renderOptionValue(q.correctAnswer, styles.codeAnswer)}
                        </View>

                        {/* Explanation */}
                        <View style={styles.explanation}>
                            <Text style={{ color: colors.lessonIcon, marginBottom: 5 }}>
                                <MaterialIcons name="lightbulb" size={16} color={colors.lessonIcon} /> Explanation
                            </Text>
                            <Text style={{ color: colors.lessonIcon }}>{q.explanation}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 15,
        paddingBottom: 50,
    },
    scoreBox: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.gray,
        padding: 20,
        backgroundColor: colors.white,
        marginBottom: 20,
    },
    scoreBoxTitle: {
        color: colors.black,
        fontFamily: "Poppins-Bold",
        fontSize: 18,
    },
    scoreBoxSubtitle: {
        fontSize: 14,
    },
    icon: {
        color: colors.lessonIcon,
        backgroundColor: colors.lessonIconBackground,
        padding: 10,
        borderRadius: 50,
        marginRight: 10,
    },
    progressBar: {
        height: 8,
        borderRadius: 10,
    },
    progressContainer: {
        marginTop: 15,
    },
    explanationBox: {
        gap: 10,
        backgroundColor: colors.white,
        padding: 20,
        marginTop: 10,
        borderWidth: 1,
        borderColor: colors.gray,
        borderRadius: 15,
    },
    questionNumber: {
        fontFamily: "Poppins-Bold",
        fontSize: 16,
        marginRight: 5,
    },
    question: {
        fontSize: 16,
        marginBottom: 10,
    },
    answerBox: {
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 10,
    },
    codeAnswer: {
        padding: 10,
        borderRadius: 6,
        backgroundColor: 'rgba(54, 54, 54, 0.05)',
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        marginTop: 2,
        marginBottom: 2,
        flexWrap: 'wrap',
    },
    explanation: {
        backgroundColor: colors.lessonIconBackground,
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.lessonIcon,
    },
    codeText: {
        fontSize: 14,
        backgroundColor: 'rgba(54, 54, 54, 0.1)',
        color: '#333',
        padding: 10,
        borderRadius: 8,
        flexWrap: 'wrap',
        textAlign: 'left',
        marginVertical: 5,
    },
});
