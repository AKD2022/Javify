import formStyles from '../assets/components/formStyles';
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View, Text as RNText, StyleSheet, TouchableOpacity, TextInput, Platform } from "react-native";
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import colors from "../assets/components/colors";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";

import GradientButton from "../assets/components/gradientButton";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAvoidingView } from "react-native";
import { TouchableWithoutFeedback, Keyboard, ScrollView } from "react-native";


WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const Text = (props) => (
    <RNText {...props} style={[{ fontFamily: "Poppins-Regular" }, props.style]} />
  );

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: "1008073691567-qab5c7kaf1so6fr5oc0hrvh83cgcfl80.apps.googleusercontent.com",
    iosClientId: "1008073691567-e5na91uc1tbt94apc3210f14qveu0rbt.apps.googleusercontent.com",
    androidClientId: "1008073691567-pdit4a0bjqkmr5niik5ccpeomvahpuk1.apps.googleusercontent.com",
    scopes: ["profile", "email"],
  });


  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.emailVerified) console.log("Email is verified");
        else console.log("Email is not verified");
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;

      const credential = GoogleAuthProvider.credential(
        null,
        authentication.accessToken
      );

      signInWithCredential(auth, credential)
        .then(() => console.log("Signed in with Google!"))
        .catch(err => setError(err.message));
    }
  }, [response]);


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            <View style={styles.loginContainer}>


              <View style={styles.headerBox}>
                <Text style={styles.headerText}>Welcome Back</Text>
                <Text style={styles.headerSubtext}>Sign in to your account</Text>
              </View>

              {/* Email Input */}
              <View style={styles.inputTitle}>
                <Text style={styles.inputTitleText}>Email</Text>
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

              {/* Password Input */}
              <View style={styles.inputTitle}>
                <Text style={styles.inputTitleText}>Password</Text>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.bookmark}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
                <Ionicons name="lock-closed" size={20} color="#888" />
              </View>

              {error ? <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text> : null}

              <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => navigation.navigate("ForgotPassword")}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <View style={{ width: "100%" }}>
                <GradientButton title={"Sign In"} style={styles.loginButton} onPress={handleLogin} />
              </View>

              <View style={styles.bottomLinks}>
                <Text style={styles.newPages}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                  <Text style={styles.signUpText}>Sign Up</Text>
                </TouchableOpacity>
              </View>

            </View>

          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create(formStyles);
