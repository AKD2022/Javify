import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View, Text as RNText, StyleSheet, TouchableOpacity, TextInput, Platform } from "react-native";
import { auth } from "../config/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import colors from "../assets/components/colors";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import GradientIconBackground from "../assets/components/gradientBackgroundIcon";
import GradientButton from "../assets/components/gradientButton";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from "react-native-paper";


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
      <View style={styles.loginContainer}>

        <View style={styles.headerBox}>
          <GradientIconBackground icon={<Ionicons name="person" size={21} color={colors.white} />} />
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
            placeholderTextColor={"#ADAEBC"}
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
            placeholderTextColor={"#ADAEBC"}
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


        {/* 
        <View>
          <GradientButton
            icon={"google"}
            onPress={async () => await promptAsync()}
            style={styles.signInWithGoogle}
          />
        </View>
        */}


      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.loginBackground,
    flex: 1,
  },

  loginContainer: {
    backgroundColor: colors.white,
    flex: 1,
    margin: 25,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    borderRadius: 25,
    elevation: 10,
    padding: 25,
    ...Platform.select({
      ios: {
        marginTop: 50,
        marginBottom: 75,
        shadowColor: colors.black,
        shadowOffset: { height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
      android: {
        marginTop: 125,
        marginBottom: 100,
      }
    })
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

  loginButton: {
    marginTop: 10,
    borderRadius: 8,
    width: "100%",
    overflow: "hidden",
    fontSize: 16,
  },

  forgotPasswordText: {
    textAlign: "right",
    fontSize: 14,
    color: colors.linkColor,
  },

  forgotPasswordContainer: {
    width: "100%",
    padding: 5,
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

  signInWithGoogle: {
    marginTop: 15,
    borderRadius: 50,
  },

});
