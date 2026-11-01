import { ScrollView } from 'react-native';
import formStyles from '../../assets/components/formStyles';
import React, { useState } from "react";
import {
    View,
    Text as RNText,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Platform,
    Alert,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard
} from "react-native";
import { auth } from "../../config/firebase";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import colors from "../../assets/components/colors";
import { MaterialIcons } from "@expo/vector-icons";
import GradientButton from "../../assets/components/gradientButton";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const navigation = useNavigation();

    const Text = (props) => (
        <RNText {...props} style={[{ fontFamily: "Poppins-Regular" }, props.style]} />
    );

    const handleChangePassword = async () => {
        if (!currentPassword.trim()) {
            setError("Please enter your current password.");
            return;
        }
        if (!newPassword.trim()) {
            setError("Please enter a new password.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("New password and confirmation do not match.");
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updatePassword(auth.currentUser, newPassword);
            Alert.alert("Success", "Password successfully changed!");

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
                            <Text style={styles.headerText}>Change Password</Text>
                            <Text style={styles.headerSubtext}>
                                Enter your current password and choose a new one
                            </Text>
                        </View>

                        {/* Current Password */}
                        <View style={styles.inputTitle}>
                            <Text style={styles.inputTitleText}>Current Password</Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.inputWithIcon}
                                placeholder="Enter current password"
                                placeholderTextColor={colors.bookmark}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry
                                autoCapitalize="none"
                            />
                            <MaterialIcons name="lock" size={20} color="#888" />
                        </View>

                        {/* New Password */}
                        <View style={styles.inputTitle}>
                            <Text style={styles.inputTitleText}>New Password</Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.inputWithIcon}
                                placeholder="Enter new password"
                                placeholderTextColor={colors.bookmark}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                                autoCapitalize="none"
                            />
                            <MaterialIcons name="lock" size={20} color="#888" />
                        </View>

                        {/* Confirm New Password */}
                        <View style={styles.inputTitle}>
                            <Text style={styles.inputTitleText}>Confirm New Password</Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.inputWithIcon}
                                placeholder="Confirm new password"
                                placeholderTextColor={colors.bookmark}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                autoCapitalize="none"
                            />
                            <MaterialIcons name="check-circle" size={20} color="#888" />
                        </View>

                        {error ? <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text> : null}

                        <View style={{ width: "100%" }}>
                            <GradientButton title={"Change Password"} style={styles.sendResetButton} onPress={handleChangePassword} />
                        </View>

                        <Text style={styles.message}>Don't want to change your password?</Text>
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
