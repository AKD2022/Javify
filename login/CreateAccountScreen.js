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
import GradientIconBackground from "../assets/components/gradientBackgroundIcon";
import { SafeAreaView } from "react-native-safe-area-context";
import { FloatingAction } from "react-native-floating-action";

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
              <GradientIconBackground
                icon={<Ionicons name="person-add" size={21} color={colors.white} />}
              />
              <Text style={styles.headerText}>Create Account</Text>
              <Text style={styles.headerSubtext}>
                Join others in the path to passing the AP Computer Science A Test
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.defaultBackground,
    flex: 1,
    padding: 5,
  },

  inner: {
    flexGrow: 1,
    alignItems: "center",
    marginHorizontal: 20,
    justifyContent: "center",
  },

  inputContainer: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: colors.signUpInputBackgroundColor,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },

  inputWithIcon: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
    fontSize: 16,
  },


  input: {
    backgroundColor: colors.signUpInputBackgroundColor,
    padding: 20,
    borderRadius: 10,
    width: "100%",
    fontSize: 16,
    marginTop: 5,
    marginBottom: 20,
  },

  signUpButton: {
    marginTop: 10,
    borderRadius: 8,
    width: "100%",
    overflow: "hidden",
  },

  inputTitle: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignSelf: "flex-start",
    marginBottom: 2,
  },

  inputTitleText: {
    fontSize: 15,
    marginLeft: 2
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
    fontSize: 16,
  },

  headerBox: {
    marginBottom: 50,
    alignItems: "center",
  },

  bottomLinks: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  signUpText: {
    color: colors.linkColor,
    marginLeft: 5,
    lineHeight: 20,
    fontSize: 16,
  },

  newPages: {
    fontSize: 16,
    lineHeight: 20,
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
