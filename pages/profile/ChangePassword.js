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
import GradientIconBackground from "../../assets/components/gradientBackgroundIcon";
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
                    <View style={styles.inner}>
                        <View style={styles.headerBox}>
                            <GradientIconBackground icon={<MaterialIcons name="lock" size={21} color={colors.white} />} />
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
                                placeholderTextColor={"#ADAEBC"}
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
                                placeholderTextColor={"#ADAEBC"}
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
                                placeholderTextColor={"#ADAEBC"}
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
                    </View>
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

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.forgotPasswordBackground,
        flex: 1,
    },

    inner: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    inputContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: colors.gray,
        paddingHorizontal: 15,
        margin: 10,
        marginHorizontal: 20,
    },

    inputWithIcon: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
    },

    inputTitle: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignSelf: "flex-start",
    },

    inputTitleText: {
        fontSize: 15,
        marginLeft: 2
    },

    sendResetButton: {
        marginTop: 10,
        borderRadius: 8,
        width: "100%",
        overflow: "hidden",
        fontSize: 16,
    },

    headerText: {
        paddingTop: 10,
        paddingBottom: 2,
        fontSize: 24,
        fontFamily: "Poppins-Bold",
        textAlign: "center",
    },

    headerSubtext: {
        textAlign: "center",
        fontSize: 14,
    },

    headerBox: {
        marginBottom: 50,
        alignItems: "center",
    },

    link: {
        color: colors.linkColor,
        marginTop: 10,
    },

    message: {
        marginTop: 20,
    },

    floatingButton: {
        position: "absolute",
        top: 60,
        left: 20,
        backgroundColor: colors.white,
        borderRadius: 30,
        padding: 12,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
});
