import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Text as RNText } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from "react-native";
import { Platform } from "react-native";
import { auth } from "../config/firebase";
import { sendPasswordResetEmail } from "firebase/auth"
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAvoidingView } from "react-native";
import { TouchableWithoutFeedback } from "react-native";
import { Keyboard } from "react-native";
import colors from "../assets/components/colors";
import { MaterialIcons } from "@expo/vector-icons";
import GradientButton from "../assets/components/gradientButton";
import GradientIconBackground from "../assets/components/gradientBackgroundIcon";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "react-native";



export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const navigation = useNavigation();

    const Text = (props) => (
        <RNText {...props} style={[{ fontFamily: "Poppins-Regular" }, props.style]} />
    );

    const handleResetPassword = async () => {
        try {
            await sendPasswordResetEmail(auth, email);
            Alert.alert("Success", "Password reset email sent.");
            navigation.navigate("Login");
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
                            <GradientIconBackground icon={<MaterialIcons name="lock-person" size={21} color={colors.white} />} />
                            <Text style={styles.headerText}>Forgot Password?</Text>
                            <Text style={styles.headerSubtext}>Don't worry! It happens. Please enter the email address associated with your account </Text>
                        </View>

                        <View style={styles.inputTitle}>
                            <Text style={styles.inputTitleText}>Email Address</Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.inputWithIcon}
                                placeholder="Enter your email"
                                placeholderTextColor={"#ADAEBC"}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <MaterialIcons name="email" size={20} color="#888" />
                        </View>




                        {error ? <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text> : null}

                        <View style={{ width: "100%" }}>
                            <GradientButton title={"Send Reset Link"} style={styles.sendResetButton} onPress={handleResetPassword} />
                        </View>

                        <Text style={styles.message}>Remember your password?</Text>
                        <TouchableOpacity onPress={() => navigation.replace("Login")}>
                            <Text style={styles.link}>Back to Sign In</Text>
                        </TouchableOpacity>
                    </View>


                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() =>
                    navigation.replace("Login")
                }
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
