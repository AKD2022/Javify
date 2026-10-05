import { View, Text as RNText, TouchableOpacity, Alert, FlatList, ScrollView } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../assets/components/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signOut, deleteUser, getIdTokenResult } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { useNavigation } from '@react-navigation/native';
import { getDocs, deleteDoc, doc, collection, setDoc, getDoc } from 'firebase/firestore';

export default function Profile() {
    const navigation = useNavigation();
    const deleting = useRef(false);
    const savingIcon = useRef(false);
    const [selectedIcon, setSelectedIcon] = useState("person"); // default

    const Text = (props) => (
        <RNText {...props} style={[{ fontFamily: 'Poppins-Regular' }, props.style]} />
    );

    const logout = () => {
        const auth = getAuth();
        signOut(auth)
            .then(() => {
                console.log('User signed out!');
            })
            .catch(error => {
                console.error('Error signing out:', error);
                Alert.alert('Error signing out');
            });
    };

    const deleteSubcollection = async (uid, subcollectionName) => {
        const subColRef = collection(db, "users", uid, subcollectionName);
        const snapshot = await getDocs(subColRef);

        for (const docSnap of snapshot.docs) {
            await deleteDoc(docSnap.ref);
        }
    };

    const deleteUserFirestoreData = async (uid) => {
        for (const name of ['scores', 'bookmarks', 'bookmarks_lessons', 'lessons', 'calendar', 'settings', 'reviewQueue', 'attempts', 'diagnosticResults']) {
            await deleteSubcollection(uid, name);
        }
        await deleteDoc(doc(db, 'users', uid));
    };

    const deleteAccount = () => {
        const user = auth.currentUser;
        if (user) {
            Alert.alert(
                "Confirmation",
                "Are you sure you want to proceed? This cannot be undone",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Proceed",
                        onPress: async () => {
                            if (deleting.current) return;
                            deleting.current = true;
                            try {
                                // Check recent authentication before deleting any saved study data.
                                const token = await getIdTokenResult(user, true);
                                if (!Number.isFinite(Date.parse(token.authTime)) || Date.now() - Date.parse(token.authTime) > 120000) {
                                    Alert.alert('Sign in again first', 'For account deletion, sign out and sign back in, then retry within two minutes.');
                                    return;
                                }
                                await AsyncStorage.removeItem(`javify:question-issues:${user.uid}`);
                                await deleteUserFirestoreData(user.uid);
                                await deleteUser(user);
                            } catch (error) {
                                Alert.alert('Deletion did not finish', error.code === 'auth/requires-recent-login'
                                    ? 'Sign in again and retry account deletion.'
                                    : 'Some saved data may have been removed. Check your connection and retry to finish deleting the account.');
                            } finally {
                                deleting.current = false;
                            }
                        },
                    },
                ]
            );
        }
    };

    // Preloaded Material icons
    const profileIcons = [
        { id: "1", name: "person" },
        { id: "2", name: "face" },
        { id: "3", name: "star" },
        { id: "4", name: "school" },
        { id: "5", name: "emoji-emotions" },
        { id: "6", name: "sports-esports" },
        { id: "7", name: "pets" },
        { id: "8", name: "eco" },
    ];

    // Load user's saved icon
    useEffect(() => {
        const fetchIcon = async () => {
            if (!auth.currentUser) return;
            const ref = doc(db, "users", auth.currentUser.uid);
            const snap = await getDoc(ref);
            if (snap.exists() && snap.data().profileIcon) {
                setSelectedIcon(snap.data().profileIcon);
            }
        };
        fetchIcon().catch(() => Alert.alert('Profile unavailable', 'Unable to load your profile icon. Please reopen this screen after reconnecting.'));
    }, []);

    // Save icon to Firestore when selected
    const handleSelectIcon = async (iconName) => {
        if (!auth.currentUser || savingIcon.current) return;
        savingIcon.current = true;
        try {
            const ref = doc(db, 'users', auth.currentUser.uid);
            await setDoc(ref, { profileIcon: iconName }, { merge: true });
            setSelectedIcon(iconName);
        } catch {
            Alert.alert('Icon not saved', 'Check your connection and retry.');
        } finally { savingIcon.current = false; }
    };

    const renderIcon = ({ item }) => {
        const isSelected = selectedIcon === item.name;
        return (
            <TouchableOpacity
                style={[styles.iconOption, isSelected && styles.iconSelected]}
                onPress={() => handleSelectIcon(item.name)}
            >
                <MaterialIcons
                    name={item.name}
                    size={32}
                    color={isSelected ? colors.white : colors.black}
                />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView edges={['right', 'left', 'bottom']} style={styles.container}>

            {/* Profile Picture Section */}
            <View style={styles.profileSection}>
                <Text style={{ fontFamily: "Poppins-SemiBold", marginVertical: 10, fontSize: 16, textAlign: "center" }}>
                    Profile Icon
                </Text>
                <FlatList
                    data={profileIcons}
                    renderItem={renderIcon}
                    keyExtractor={(item) => item.id}
                    horizontal
                    contentContainerStyle={{ justifyContent: "center", flexGrow: 1, gap: 15 }}
                    showsHorizontalScrollIndicator={false}
                />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Account Section */}
                <View style={styles.accountSection}>
                    <Text style={{ fontFamily: "Poppins-SemiBold", marginVertical: 10, fontSize: 14, }}>Account</Text>
                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("ChangeUsername")}>
                        <View style={styles.groupLeftCard}>
                            <MaterialIcons name="person" size={20} color={colors.linkColor} />
                            <Text style={{ fontFamily: "Poppins-Medium", fontSize: 16 }}>Change Username</Text>
                        </View>
                        <MaterialIcons name="keyboard-arrow-right" size={25} color={colors.bookmark} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("ChangePassword")}>
                        <View style={styles.groupLeftCard}>
                            <MaterialIcons name="lock" size={20} color={colors.linkColor} />
                            <Text style={{ fontFamily: "Poppins-Medium", fontSize: 16 }}>Change Password</Text>
                        </View>
                        <MaterialIcons name="keyboard-arrow-right" size={25} color={colors.bookmark} />
                    </TouchableOpacity>
                </View>

                {/* Learning Section */}
                <View style={styles.learningSection}>
                    <Text style={{ fontFamily: "Poppins-SemiBold", marginVertical: 10, fontSize: 14, }}>Learning</Text>
                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('QuestionIssue')}>
                      <View style={styles.groupLeftCard}><MaterialIcons name="outlined-flag" size={20} color={colors.purpleIcon} /><Text style={{ fontFamily: 'Poppins-Medium', fontSize: 16 }}>Question reports</Text></View>
                      <MaterialIcons name="keyboard-arrow-right" size={25} color={colors.bookmark} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("ProgressReport")}>
                        <View style={styles.groupLeftCard}>
                            <MaterialIcons name="bar-chart" size={20} color={colors.goldIcon} />
                            <Text style={{ fontFamily: "Poppins-Medium", fontSize: 16 }}>Progress Report</Text>
                        </View>
                        <MaterialIcons name="keyboard-arrow-right" size={25} color={colors.bookmark} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate("MainTabs", { screen: "Bookmarks" })}
                    >
                    <View style={styles.groupLeftCard}>
                        <MaterialIcons name="bookmark" size={20} color={colors.goldIcon} />
                        <Text style={{ fontFamily: "Poppins-Medium", fontSize: 16 }}>Saved Lessons</Text>
                    </View>
                    <MaterialIcons name="keyboard-arrow-right" size={25} color={colors.bookmark} />
                </TouchableOpacity>
            </View>

            {/* Preferences Section */}
            <View style={styles.learningSection}>
                <Text style={{ fontFamily: "Poppins-SemiBold", marginVertical: 10, fontSize: 14, }}>Preferences</Text>
                <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("NotificationPreferences")}>
                    <View style={styles.groupLeftCard}>
                        <MaterialIcons name="notifications" size={20} color={colors.purpleIcon} />
                        <Text style={{ fontFamily: "Poppins-Medium", fontSize: 16 }}>Notifications</Text>
                    </View>
                    <MaterialIcons name="keyboard-arrow-right" size={25} color={colors.bookmark} />
                </TouchableOpacity>
            </View>


            {/* Button Container */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                    <MaterialIcons name="logout" size={20} color={colors.white} />
                    <Text style={{ color: colors.white, fontFamily: "Poppins-Medium", fontSize: 16 }}>Sign Out</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.trashButton} onPress={deleteAccount}>
                    <MaterialIcons name="delete" size={20} color={colors.redCircle} />
                    <Text style={{ color: colors.redCircle, fontFamily: "Poppins-Medium", fontSize: 16 }}>Delete Account</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
        </SafeAreaView >
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: colors.white,
        flex: 1,
    },

    profileSection: {
        marginBottom: 20,
        alignItems: "center",
    },

    iconOption: {
        padding: 10,
        borderRadius: 10,
        backgroundColor: colors.defaultBackground,
    },

    iconSelected: {
        backgroundColor: colors.black,
    },

    card: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 5,
        borderRadius: 10,
        alignItems: "center",
        padding: 10,
        backgroundColor: colors.defaultBackground,
    },

    groupLeftCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
    },

    buttonContainer: {
        marginTop: "auto",
        paddingBottom: 20,
        paddingTop: 50,
    },

    trashButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
        gap: 15,
        backgroundColor: colors.redTrashButtonBackground,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.redCircle,
        margin: 10,
    },

    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
        gap: 10,
        backgroundColor: colors.black,
        borderRadius: 10,
        margin: 10,
    },
});
