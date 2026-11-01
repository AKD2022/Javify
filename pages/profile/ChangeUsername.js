import { ScrollView } from 'react-native';
import formStyles from '../../assets/components/formStyles';
import React, { useState } from "react";
import { View, Text as RNText, StyleSheet, TouchableOpacity, TextInput, Platform, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { auth } from "../../config/firebase";
import { updateProfile } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import colors from "../../assets/components/colors";
import { MaterialIcons } from "@expo/vector-icons";
import GradientButton from "../../assets/components/gradientButton";

import { Ionicons } from "@expo/vector-icons";

import { SafeAreaView } from "react-native-safe-area-context";

export default function ChangeUsername() {
    const [newUsername, setNewUsername] = useState("");
    const [confirmUsername, setConfirmUsername] = useState("");
    const [error, setError] = useState("");
    const navigation = useNavigation();

    const Text = (props) => (
        <RNText {...props} style={[{ fontFamily: "Poppins-Regular" }, props.style]} />
    );

    const handleChangeUsername = async () => {
        if (!newUsername.trim()) {
            setError("Please enter a new username.");
            return;
        }
        if (newUsername !== confirmUsername) {
            setError("New username and confirmation do not match.");
            return;
        }

        try {
            await updateProfile(auth.currentUser, { displayName: newUsername });
            Alert.alert("Success", "Username successfully changed.");
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });


        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1, width: "100%" }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

                        <View style={styles.headerBox}>
                            <Text style={styles.headerText}>Change Username</Text>
                            <Text style={styles.headerSubtext}>
                                Choose a new username and then confirm it
                            </Text>
                        </View>

                        {/* New Username */}
                        <View style={styles.inputTitle}>
                            <Text style={styles.inputTitleText}>New Username</Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.inputWithIcon}
                                placeholder="Enter new username"
                                placeholderTextColor={colors.bookmark}
                                value={newUsername}
                                onChangeText={setNewUsername}
                                autoCapitalize="none"
                            />
                            <MaterialIcons name="person-add" size={20} color="#888" />
                        </View>

                        {/* Confirm Username */}
                        <View style={styles.inputTitle}>
                            <Text style={styles.inputTitleText}>Confirm New Username</Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.inputWithIcon}
                                placeholder="Confirm new username"
                                placeholderTextColor={colors.bookmark}
                                value={confirmUsername}
                                onChangeText={setConfirmUsername}
                                autoCapitalize="none"
                            />
                            <MaterialIcons name="check-circle" size={20} color="#888" />
                        </View>

                        {error ? <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text> : null}

                        <View style={{ width: "100%" }}>
                            <GradientButton title={"Change Username"} style={styles.sendResetButton} onPress={handleChangeUsername} />
                        </View>

                        <Text style={styles.message}>Don't want to change your username?</Text>
                        <TouchableOpacity onPress={() => navigation.replace("Profile")}>
                            <Text style={styles.link}>Back to Profile</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => navigation.replace("Profile")}
            >
                <Ionicons name="arrow-back-outline" size={24} color={colors.black} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create(formStyles);
