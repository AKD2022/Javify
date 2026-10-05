import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { storageKeyForLesson } from '../utils/content';
import LessonContent from '../components/LessonContent';
import React, { useState, useEffect } from 'react';
import { View, Text as RNText, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { lesson } from '../utils/lessonRegistry';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../assets/components/colors';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

export default function LessonScreen() {
    const insets = useSafeAreaInsets();
    const route = useRoute();
    const lessonId = route.params?.lessonId;
    const lessonData = lesson[`lesson${lessonId}`];
    const user = auth.currentUser;
    const navigation = useNavigation();

    const [isBookmarked, setIsBookmarked] = useState(false);

    const Text = (props) => (
        <RNText {...props} style={[{ fontFamily: "Poppins-Regular" }, props.style]} />
    );

    // Load bookmark status
    useEffect(() => {
        const fetchBookmark = async () => {
            if (!user) return;
            try {
                const lessonDocRef = doc(db, 'users', user.uid, 'bookmarks_lessons', storageKeyForLesson(lessonId));
                const docSnap = await getDoc(lessonDocRef);
                setIsBookmarked(docSnap.exists());
            } catch (e) {
                console.error('Failed to load lesson bookmark:', e);
            }
        };
        fetchBookmark();
    }, [user, lessonId]);

    const handleBookmark = async () => {
        if (!user || !lessonData) return;

        try {
            const lessonDocRef = doc(db, 'users', user.uid, 'bookmarks_lessons', storageKeyForLesson(lessonId));
            if (isBookmarked) {
                await deleteDoc(lessonDocRef);
                setIsBookmarked(false);
                Alert.alert('Removed', 'Lesson removed from bookmarks');
            } else {
                await setDoc(lessonDocRef, { lessonId: storageKeyForLesson(lessonId).replace('lesson', ''), title: lessonData.title });
                setIsBookmarked(true);
                Alert.alert('Bookmarked', 'Lesson bookmarked successfully!');
            }
        } catch (e) {
            console.error('Error updating lesson bookmark:', e);
            Alert.alert('Error', 'Failed to update bookmark.');
        }
    };

    if (!lessonData) {
        return (
            <View style={styles.center}>
                <Text>This lesson was replaced in the curriculum update.</Text><TouchableOpacity onPress={() => navigation.navigate('Curriculum')}><Text>Open current curriculum</Text></TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
                <View style={styles.lessonContentContainer}>
                <View style={styles.lessonHeader}>
                    <MaterialIcons
                        name="menu-book"
                        style={styles.icon}
                        size={24}
                        color={colors.lessonIcon}
                    />
                    <Text style={styles.lessonTitle}>{lessonData.title}</Text>
                </View>

                <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('JavaReference')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, marginBottom: 18, borderRadius: 12, backgroundColor: '#EFEDFF' }}><MaterialIcons name="code" size={21} color={colors.basicButton} /><Text style={{ color: colors.basicButton, flexShrink: 1 }}>Java quick reference</Text></TouchableOpacity>
                <LessonContent blocks={lessonData.content} />
                </View>

            </ScrollView>

            <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
                <TouchableOpacity style={styles.bookmarkButton} onPress={handleBookmark}>
                    <MaterialIcons
                        name={isBookmarked ? "bookmark" : "bookmark-border"}
                        style={styles.buttonIcon}
                        size={22}
                    />
                    <Text style={{ color: colors.black, fontSize: 15, flexShrink: 1, textAlign: 'center' }}>
                        {isBookmarked ? "Bookmarked" : "Bookmark Lesson"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quizButton}
                    onPress={() => navigation.navigate('QuizScreen', { lessonId })}
                >
                    <MaterialIcons name="play-arrow" style={styles.buttonIcon} size={25} color={colors.white} />
                    <Text style={{ color: colors.white, fontSize: 15, flexShrink: 1, textAlign: 'center' }}>Take Quiz</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.quizLessonBackground,

    },

    lessonContentContainer: {
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: 20,
        paddingBottom: 24,
    },

    lessonHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 15,
    },

    icon: {
        backgroundColor: colors.lessonIconBackground,
        borderRadius: 10,
        padding: 10,
        marginRight: 15,
    },

    lessonTitle: {
        fontSize: 20,
        fontFamily: "Poppins-Bold",
        color: colors.black,
        flexShrink: 1,
    },

    lessonText: {
        fontSize: 15,
        color: colors.black,
        marginBottom: 15,
        flexWrap: "wrap",
        flexDirection: 'row',
        alignItems: 'center',
    },

    lessonText: {
        fontSize: 15,
        color: colors.black,
        marginBottom: 15,
        lineHeight: 26,
    },

    inlineCode: {
        fontSize: 15,
        color: '#c7254e',
        fontFamily: 'monospace',
    },

    codeText: {
        fontSize: 14,
        backgroundColor: 'rgba(54, 54, 54, 0.1)',
        color: '#333',
        padding: 10,
        borderRadius: 8,
        marginVertical: 10,
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        paddingVertical: 12,
        paddingHorizontal: 20,
        gap: 10,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
    },

    bookmarkButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: colors.bookmarkBackground,
        flex: 1.3,
        minHeight: 54,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },

    quizButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: colors.startQuizBackground,
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },

    buttonIcon: {
        marginRight: 6,
        flexShrink: 0,
    },
});
