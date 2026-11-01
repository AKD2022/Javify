import { ScrollView } from 'react-native';
import formStyles from '../assets/components/formStyles';
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

                    <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

                        <View style={styles.headerBox}>
                            <Text style={styles.headerText}>Forgot Password?</Text>
                            <Text style={styles.headerSubtext}>Enter your account email to receive a password reset link. </Text>
                        </View>

                        <View style={styles.inputTitle}>
                            <Text style={styles.inputTitleText}>Email Address</Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.inputWithIcon}
                                placeholder="Enter your email"
                                placeholderTextColor={colors.bookmark}
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
                    </ScrollView>


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

const styles = StyleSheet.create(formStyles);
