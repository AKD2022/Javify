import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "./colors";

export default function GradientProgressBar({ progress }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientButtonStart, colors.gradientButtonEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.progress, { width: `${progress * 100}%` }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
    margin: 5, 
  },

  progress: {
    height: "100%",
    borderRadius: 6,
  },
});
