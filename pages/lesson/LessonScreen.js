import React, { useState, useEffect } from 'react';
import { View, Text as RNText, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { lesson } from '../utils/lessonRegistry';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../assets/components/colors';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

export default function LessonScreen() {
    const route = useRoute();
    const { lessonId } = route.params;
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
                const lessonDocRef = doc(db, 'users', user.uid, 'bookmarks_lessons', `lesson${lessonId}`);
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
            const lessonDocRef = doc(db, 'users', user.uid, 'bookmarks_lessons', `lesson${lessonId}`);
            if (isBookmarked) {
                await deleteDoc(lessonDocRef);
                setIsBookmarked(false);
                Alert.alert('Removed', 'Lesson removed from bookmarks');
            } else {
                await setDoc(lessonDocRef, { lessonId, title: lessonData.title });
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
                <Text>Lesson not found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.lessonContentContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.lessonHeader}>
                    <MaterialIcons
                        name="menu-book"
                        style={styles.icon}
                        size={24}
                        color={colors.lessonIcon}
                    />
                    <Text style={styles.lessonTitle}>{lessonData.title}</Text>
                </View>

                {Array.isArray(lessonData.content) && lessonData.content.length > 0 ? (
                    <View>
                        {lessonData.content.reduce((acc, block, idx) => {
                            const isInlineCode = block.type === "code" && !block.value.includes("\n");

                            if (block.type === "text" || isInlineCode) {
                                if (acc.length && acc[acc.length - 1].type === "paragraph") {
                                    acc[acc.length - 1].children.push({ ...block, uid: `${idx}-${Math.random()}` });
                                } else {
                                    acc.push({ type: "paragraph", children: [{ ...block, uid: `${idx}-${Math.random()}` }] });
                                }
                            } else if (block.type === "code") {
                                acc.push({ type: "blockCode", value: block.value, uid: `${idx}-${Math.random()}` });
                            }

                            return acc;
                        }, []).map((item, idx) => {
                            if (item.type === "paragraph") {
                                return (
                                    <RNText key={`p-${idx}`} style={styles.lessonText}>
                                        {item.children.map((child) => {
                                            if (child.type === "text") {
                                                return <Text key={child.uid}>{child.value}</Text>;
                                            }
                                            if (child.type === "code") {
                                                return (
                                                    <Text key={child.uid} style={styles.inlineCode}>
                                                        {'\u00A0'}
                                                        {child.value}
                                                        {'\u00A0'}
                                                    </Text>
                                                );
                                            }
                                            return null;
                                        })}

                                    </RNText>
                                );
                            }

                            if (item.type === "blockCode") {
                                return (
                                    <Text key={item.uid} style={styles.codeText}>
                                        {item.value}
                                    </Text>
                                );
                            }

                            return null;
                        })}
                    </View>
                ) : (
                    <Text style={styles.lessonText}>No content for this lesson yet.</Text>
                )}
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.bookmarkButton} onPress={handleBookmark}>
                    <MaterialIcons
                        name={isBookmarked ? "bookmark" : "bookmark-border"}
                        style={styles.buttonIcon}
                        size={22}
                    />
                    <Text style={{ color: colors.black, fontSize: 16 }}>
                        {isBookmarked ? "Bookmarked" : "Bookmark Lesson"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.quizButton}
                    onPress={() => navigation.navigate('QuizScreen', { lessonId })}
                >
                    <MaterialIcons name="play-arrow" style={styles.buttonIcon} size={25} color={colors.white} />
                    <Text style={{ color: colors.white, fontSize: 16 }}>Take Quiz</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.quizLessonBackground,
        padding: 20,
        paddingBottom: 20,
    },

    lessonContentContainer: {
        backgroundColor: colors.white,
        borderRadius: 10,
        padding: 20,
        paddingBottom: 100,
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
        display: 'flex',
        flexDirection: 'row',
        lineHeight: 25,
    },

    codeText: {
        fontSize: 14,
        backgroundColor: 'rgba(54, 54, 54, 0.1)',
        color: '#333',
        padding: 10,
        borderRadius: 8,
        marginVertical: 10,
    },

    inlineCode: {
        fontSize: 14,
        color: '#333',
        backgroundColor: 'rgba(54, 54, 54, 0.1)',
        borderRadius: 20,
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        paddingVertical: 12,
        paddingHorizontal: 20,
        gap: 10,
        paddingBottom: 50,
    },

    bookmarkButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: colors.bookmarkBackground,
        width: "60%",
    },

    quizButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: colors.startQuizBackground,
        width: "40%",
        paddingVertical: 10,
        paddingHorizontal: 12,
    },

    buttonIcon: {
        marginRight: 6,
    },
});
