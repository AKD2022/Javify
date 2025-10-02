import React, { useEffect, useState } from 'react';
import { View, Text as RNText, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import colors from '../../assets/components/colors';
import { quizzes } from '../utils/quizRegistry';
import { MaterialIcons } from '@expo/vector-icons';
import { ProgressBar } from 'react-native-paper';
import GradientProgressBar from '../../assets/components/GradientProgressBar';
import GradientStreakBackground from '../../assets/components/gradientStreakBackground'
import { BarChart } from 'react-native-gifted-charts';


export default function ProgressReport() {
    const Text = (props) => (
        <RNText {...props} style={[{ fontFamily: "Poppins-Regular" }, props.style]} />
    );
    const [streak, setStreak] = useState(0);
    const [last5Lessons, setLast5Lessons] = useState([]);
    const [totalCompletedLessons, setTotalCompletedLessons] = useState(0);
    const [averageScore, setAverageScore] = useState(0);
    const [weeklyActivity, setWeeklyActivity] = useState({});
    const user = auth.currentUser;
    const [animateChart, setAnimateChart] = useState(false);

    const totalLessons = Object.keys(quizzes).length;

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const data = userSnap.data();

                    const sortedLast5 = (data.last5Scores || [])
                        .sort((a, b) => {
                            const aTime = a.timestamp?.seconds || new Date(a.timestamp).getTime() / 1000 || 0;
                            const bTime = b.timestamp?.seconds || new Date(b.timestamp).getTime() / 1000 || 0;
                            return bTime - aTime;
                        })
                        .slice(0, 5);

                    setLast5Lessons(sortedLast5);

                    const completed = data.completedLessons || [];
                    setTotalCompletedLessons(completed.length);

                    const allScores = data.allScores || [];
                    if (allScores.length > 0) {
                        const total = allScores.reduce((sum, s) => sum + (s.score / s.total) * 100, 0);
                        setAverageScore((total / allScores.length).toFixed(2));
                    }

                }
            } catch (e) {
                console.error("Error getting progress report data: " + e);
            }
        };

        fetchData();
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data();

                setStreak(data.streak || 0);
                const today = new Date().toISOString().split("T")[0];
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yStr = yesterday.toISOString().split("T")[0];

                if (data.lastCompletedDate === today) {
                    setStreak(data.streak || 0);
                } else if (data.lastCompletedDate === yStr) {
                    setStreak(data.streak || 0);
                } else {
                    // missed a day → reset streak
                    setStreak(0);
                }
            }
        };
        fetchData();
    }, [user]);



    const timeAgo = (timestamp) => {
        if (!timestamp) return "";
        let time;
        if (timestamp.seconds) {
            time = new Date(timestamp.seconds * 1000);
        } else {
            time = new Date(timestamp);
        }

        const now = new Date();
        const diffMs = now - time;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHr = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHr / 24);

        if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
        if (diffHr > 0) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
        if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
        return "Just now";
    };


    useEffect(() => {
        const fetchWeeklyActivity = async () => {
            if (!user) return;
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const data = userSnap.data();
                setWeeklyActivity(data.weeklyActivity || {});
            }
        };
        fetchWeeklyActivity();
    }, [user]);

    const barData = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const key = date.toISOString().split("T")[0];
        const count = Number(weeklyActivity[key] || 0); // <--- force number

        return {
            value: count,
            label: date.toLocaleDateString("en-US", { weekday: "short" }),
            frontColor: count > 0 ? "#177AD5" : "#E5E7EB",
        };
    });




    let days = "days";
    let message = "Keep it up!";

    if (streak == 1) {
        days = "day";
    } else if (streak == 0) {
        message = "Lets get started!"
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <ScrollView showsVerticalScrollIndicator={false}>

                <View style={styles.overallProgress}>
                    <Text style={{ padding: 5, fontFamily: "Poppins-Bold", fontSize: 16 }}>Overall Progress</Text>

                    <View style={[styles.row, styles.progressPercentageHeader]}>
                        <Text style={{ fontSize: 16 }}>Course Completion</Text>
                        <Text style={{ fontSize: 16, fontFamily: "Poppins-SemiBold", color: colors.linkColor }}>{Math.round((totalCompletedLessons / totalLessons) * 100)}%</Text>
                    </View>

                    <GradientProgressBar progress={totalCompletedLessons / totalLessons} style={styles.progressBar} theme={{ colors: { surfaceVariant: colors.unfilledProgressBar } }} />

                    <View style={[styles.row, styles.detailedProgressContainer]}>
                        <View style={[styles.column, styles.overallProgressDetails]}>
                            <Text style={{ color: colors.progressReportGreen, fontFamily: "Poppins-Bold", fontSize: 24 }}>{totalCompletedLessons}</Text>
                            <Text style={styles.subHeader}>Lessons Done</Text>
                        </View>

                        <View style={[styles.column, styles.overallProgressDetails]}>
                            <Text style={{ color: colors.progressReportYellow, fontFamily: "Poppins-Bold", fontSize: 24 }}>{Math.round((totalLessons - totalCompletedLessons))}</Text>
                            <Text style={styles.subHeader}>Remaining</Text>
                        </View>

                        <View style={[styles.column, styles.overallProgressDetails]}>
                            <Text style={{ color: colors.linkColor, fontFamily: "Poppins-Bold", fontSize: 24 }}>{averageScore}%</Text>
                            <Text style={styles.subHeader}>Average Score</Text>
                        </View>
                    </View>

                </View>


                {/* Gradient Streak Card */}
                <GradientStreakBackground title={streak + " " + days} message={message} />


                <View style={styles.recentLessonsContainer}>
                    <Text style={styles.header}>Recent Lesson Scores</Text>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {last5Lessons.length === 0 ? (
                            <Text>No lessons completed yet.</Text>
                        ) : (
                            last5Lessons.map((lesson, idx) => {
                                if (!lesson || !lesson.lessonId) return null;

                                const lessonData = quizzes[`lesson${lesson.lessonId}`] || {};
                                const title = lessonData.title || `Lesson ${lesson.lessonId}`;
                                const lessonNumber = lessonData.lessonId || lesson.lessonId;


                                let scoreColor = "#10B981"; // green
                                if (lesson.score >= 4) scoreColor = "#10B981";
                                else if (lesson.score > 2) scoreColor = "#3B82F6";
                                else scoreColor = "#F59E0B";

                                return (
                                    <View key={`${lesson.lessonId}-${idx}`} style={styles.card}>
                                        <View style={styles.leftColumn}>
                                            <View style={styles.row}>
                                                <MaterialIcons name="menu-book" color={colors.lessonIcon} style={styles.icon} size={24} />
                                                <View style={styles.column}>
                                                    <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">{title}</Text>
                                                    <Text style={{ color: "#6B7280" }}>Lesson {lessonNumber}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        <View style={styles.rightColumn}>
                                            <Text style={{ color: scoreColor, fontSize: 16, fontFamily: "Poppins-SemiBold" }}>
                                                {Math.round((lesson.score / lesson.total) * 100)}%
                                            </Text>
                                            {lesson.timestamp && <Text style={styles.time}>{timeAgo(lesson.timestamp)}</Text>}
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </ScrollView>
                </View>

                {/* Bar Chart */}

                <View style={styles.weeklyActivityContainer}>
                    <Text style={{ fontSize: 16, fontFamily: "Poppins-SemiBold", marginBottom: 10 }}>
                        Weekly Activity
                    </Text>
                    <View style={{ width: '100%', paddingHorizontal: 20, marginBottom: 20, alignItems: "center" }}>
                        <BarChart
                            data={barData}
                            barWidth={22}
                            yAxisThickness={0}
                            hideRules={true}
                            spacing={12}
                            barBorderRadius={4}
                            noOfSections={3}
                            style={{ width: '100%', height: 200 }}
                            isAnimated={animateChart}
                            animationDuration={800}
                        />
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
        padding: 20,
    },

    headerContainer: {
        marginBottom: 10,
    },

    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    card: {
        backgroundColor: colors.progressReportCard,
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    leftColumn: {
        flex: 1,
        flexDirection: "column",
        marginRight: 10,
    },

    rightColumn: {
        flexShrink: 0,
        flexDirection: "column",
        alignItems: "flex-end",
        justifyContent: "center",
        minWidth: 70,
    },

    title: {
        fontFamily: "Poppins-Medium",
        fontSize: 16,
        flexShrink: 1,
        flexWrap: "wrap",
        maxWidth: "90%",
    },

    time: {
        marginTop: 4,
        fontSize: 12,
        color: '#6B7280',
        fontStyle: 'italic',
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
        padding: 5,
    },

    column: {
        flexDirection: "column"
    },

    icon: {
        backgroundColor: colors.lessonIconBackground,
        padding: 10,
        borderRadius: 10,
    },

    recentLessonsContainer: {
        height: 310,
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: colors.gray,
        padding: 20,
    },

    progressPercentageHeader: {
        justifyContent: "space-between"
    },

    detailedProgressContainer: {
        justifyContent: "space-evenly",
        marginTop: 10,
        padding: 10,
    },

    overallProgressDetails: {
        alignItems: "center",
    },

    subHeader: {
        color: colors.progressReportSubheader,
        fontSize: 12,
    },

    progressBar: {
        height: 12,
        color: colors.incompleteUnitProgressBar,
        borderRadius: 20,
        margin: 5,
        marginTop: 15,
    },

    overallProgress: {
        borderRadius: 10,
        padding: 10,
        borderWidth: 0.75,
        borderColor: colors.gray,
    },

    weeklyActivityContainer: {
        marginTop: 20,
        borderRadius: 10,
        borderWidth: 0.75,
        borderColor: colors.gray,
        padding: 15,
        marginBottom: 20,
    },
});
