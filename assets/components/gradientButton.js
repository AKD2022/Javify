import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from './colors';
import { FontAwesome } from '@expo/vector-icons';

const GradientButton = ({ title, onPress, style, textStyle, icon, disabled = false }) => {
  return (
    <TouchableOpacity accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.buttonContainer, disabled && { opacity: 0.5 }]}>
      <LinearGradient
        colors={[colors.gradientButtonStart, colors.gradientButtonEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, style]}
      >
        {icon ? <View style={styles.icon}>
          <FontAwesome name={icon} size={24} color={colors.white}/>
        </View> : null}
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    overflow: 'hidden',
    borderRadius: 16,
  },

  gradient: {
    borderRadius: 16,
    minHeight: 52,
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: "row"
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  icon: {
    alignItems: "center",
    display: "flex"
  }

});

export default GradientButton;
