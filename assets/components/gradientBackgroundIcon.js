import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "./colors";

const GradientIconBackground = ({ icon }) => {
  return (
    <LinearGradient
      colors={[colors.gradientButtonStart, colors.gradientButtonEnd]} // 👈 choose your gradient colors
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradientBackground}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    width: 60,   // 👈 adjust size
    height: 60,
    borderRadius: 30, // 👈 makes it circular
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default GradientIconBackground;
