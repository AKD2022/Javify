import React, { useState, useEffect } from 'react';
import { View, Text as RNText, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { db, auth } from '../../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import colors from '../../assets/components/colors';
import { ProgressBar } from 'react-native-paper';

const diagnosticData = require('../../assets/Diagnostic/Diagnostic.json');

export default function DiagnosticScreen() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [timeTaken, setTimeTaken] = useState(0);
    const [questions, setQuestions] = useState([]);

    const navigation = useNavigation();
    const user = auth.currentUser;

    const Text = (props) => (
        <RNText {...props} style={[{ fontFamily: 'Poppins-Regular' }, props.style]} />
    );

    // Timer
    useEffect(() => {
        const interval = setInterval(() => setTimeTaken(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, []);

    // Load and shuffle questions
    useEffect(() => {
        // Flatten all questions across units
        let allQuestions = [];
        diagnosticData.forEach(unit => {
            unit.questions.forEach(q => {
                // ensure 4 options
                if (q.options.length < 4) {
                    while (q.options.length < 4) q.options.push({ type: 'text', value: 'N/A' });
                }
                allQuestions.push({ ...q, unitId: unit.unitId });
            });
        });

        // Shuffle the questions
        allQuestions.sort(() => Math.random() - 0.5);

        // Take the first 30 questions
        setQuestions(allQuestions.slice(0, 30));
    }, []);

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    const handleSelectOption = (optionIndex) => {
        setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: optionIndex }));
    };

    const handleNext = async () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // Save results
            if (user) {
                for (const q of questions) {
                    const unitResultRef = doc(db, 'users', user.uid, 'diagnosticResults', q.unitId);
                    await setDoc(unitResultRef, {
                        [q.id]: selectedAnswers[q.id] ?? null
                    }, { merge: true });
                }
            }
            alert('Diagnostic complete!');
            navigation.navigate('DateSelectionScreen');
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
    };

    if (!questions.length) {
        return (
            <SafeAreaView style={styles.centered}>
                <Text style={styles.loadingText}>Loading...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.progressContainer}>
                <Text style={styles.timerText}>
                    <MaterialIcons name="timer" size={12} /> {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}
                </Text>
                <ProgressBar
                    progress={currentQuestionIndex / totalQuestions}
                    color={colors.basicButton}
                    style={styles.progressBar}
                    theme={{ colors: { surfaceVariant: colors.unfilledProgressBar } }}
                />
            </View>

            <View style={styles.questionContainer}>
                <Text style={currentQuestion.type === 'code' ? styles.codeText : styles.questionText}>
                    {currentQuestion.question}
                </Text>

                {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswers[currentQuestion.id] === idx;
                    return (
                        <TouchableOpacity
                            key={idx}
                            style={styles.optionButton}
                            onPress={() => handleSelectOption(idx)}
                        >
                            <View style={[styles.circle, isSelected && styles.circleSelected]} />
                            <Text style={option.type === 'code' ? styles.codeText : styles.optionText}>
                                {option.value}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack} disabled={currentQuestionIndex === 0}>
                    <MaterialIcons name="keyboard-arrow-left" size={24} color={currentQuestionIndex === 0 ? '#aaa' : colors.black} />
                    <Text style={{ color: currentQuestionIndex === 0 ? '#aaa' : colors.black }}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={selectedAnswers[currentQuestion.id] == null}>
                    <Text style={{ color: colors.white }}>
                        {currentQuestionIndex === totalQuestions - 1 ? 'Submit' : 'Next'}
                    </Text>
                    <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.white} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 50,
        justifyContent: "center",
        ...Platform.select({
            ios: { margin: 20 },
            android: { padding: 20 },
        }),
    },


    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.quizLessonBackground,
    },

    loadingText: {
        color: colors.white,
        fontSize: 18,
    },

    questionContainer: {
        justifyContent: 'left',
        alignItems: 'left',
        backgroundColor: colors.white,
        padding: 20,
        borderRadius: 10,
    },

    questionText: {
        fontSize: 20,
        color: colors.black,
        marginBottom: 12,
        paddingVertical: 10, 
        textAlign: 'left',
        fontFamily: 'Poppins-Bold',
    },

    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
        flexWrap: 'wrap',
        width: '100%',
    },

    circle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.selectedOptionButton,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    circleSelected: {
        backgroundColor: colors.selectedOptionButton,
    },

    optionText: {
        fontSize: 16,
        color: colors.black,
        flex: 1,
        flexWrap: 'wrap',
    },

    progressContainer: {
        marginBottom: 20,
    },

    progressBar: {
        height: 10,
        borderRadius: 10,
        width: '100%',
    },

    progressText: {
        marginTop: 5,
        fontSize: 14,
        color: colors.black,
        fontFamily: 'Poppins-Bold',
    },

    progressTopRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 5,
        width: '100%',
    },

    timerText: {
        fontSize: 14,
        fontFamily: 'Poppins-Bold',
        color: colors.black,
    },


    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        width: '100%',
    },

    backButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: colors.bookmarkBackground,
        flex: 1,
        marginRight: 10,
        paddingVertical: 12,
    },

    nextButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: colors.startQuizBackground,
        flex: 2,
        paddingVertical: 12,
    },

    buttonIcon: { marginRight: 6 },

    codeText: {
        fontSize: 14,
        backgroundColor: 'rgba(54, 54, 54, 0.1)',
        color: '#333',
        padding: 10,
        borderRadius: 10,
        flexWrap: 'wrap',
        textAlign: 'left',
        marginVertical: 5,
        fontFamily: 'Poppins-Medium',
    },

});
