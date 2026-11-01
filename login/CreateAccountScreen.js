import formStyles from '../assets/components/formStyles';
import React, { useState } from "react";
import {
  View,
  Text as RNText,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { auth } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import colors from "../assets/components/colors";
import GradientButton from "../assets/components/gradientButton";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { SafeAreaView } from "react-native-safe-area-context";


export default function CreateAccountScreen() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigation = useNavigation();

  const Text = (props) => (
    <RNText {...props} style={[{ fontFamily: "Poppins-Regular" }, props.style]} />
  );

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });
      await sendEmailVerification(user);

      Alert.alert(
        "Verify Email",
        "A verification link has been sent to your email address."
      );
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
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={[styles.inner, { paddingBottom: 40 }]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.headerBox}>
              <Text style={styles.headerText}>Create Account</Text>
              <Text style={styles.headerSubtext}>
                Study Java, save your progress, and plan your AP CSA practice.
              </Text>
            </View>

            <View style={styles.inputTitle}>
              <Text style={styles.inputTitleText}>Email Address</Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Enter your email"
                placeholderTextColor={colors.signUpInputColor}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <MaterialIcons name="email" size={20} color="#888" />
            </View>



            <View style={styles.inputTitle}>
              <Text style={styles.inputTitleText}>Full Name / Username</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Enter your username"
                placeholderTextColor={colors.signUpInputColor}
                value={username}
                onChangeText={setUsername}
              />
              <Ionicons name="person" size={20} color="#888" />
            </View>

            <View style={styles.inputTitle}>
              <Text style={styles.inputTitleText}>Password</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Enter your password"
                placeholderTextColor={colors.signUpInputColor}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <Ionicons name="lock-closed" size={20} color="#888" />
            </View>

            <View style={styles.inputTitle}>
              <Text style={styles.inputTitleText}>Confirm Password</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputWithIcon}
                placeholder="Confirm your password"
                placeholderTextColor={colors.signUpInputColor}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              <Ionicons name="lock-closed" size={20} color="#888" />
            </View>


            {error ? <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text> : null}

            <View style={{ width: "100%" }}>
              <GradientButton
                title={"Sign Up"}
                style={styles.signUpButton}
                onPress={handleSignUp}
              />
            </View>

            <View style={styles.bottomLinks}>
              <Text style={styles.newPages}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.signUpText}>Sign In</Text>
              </TouchableOpacity>
            </View>
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
