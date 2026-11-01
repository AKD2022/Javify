import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { palette, radius, type } from './theme';
// Keep the existing public API so forms and navigation retain their behavior.
export default function GradientButton({ title, onPress, style, textStyle, icon, disabled = false }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} activeOpacity={0.75} onPress={onPress} style={[s.button, style, disabled && s.disabled]}>
    {icon ? <View><FontAwesome name={icon} size={20} color={palette.surface} /></View> : null}
    <Text style={[s.label, textStyle]}>{title}</Text>
  </TouchableOpacity>;
}
const s = StyleSheet.create({
  button: { borderRadius: radius.control, minHeight: 52, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, backgroundColor: palette.accent },
  label: { ...type.action, color: palette.surface, textAlign: 'center', flexShrink: 1 },
  disabled: { opacity: 0.45 },
});
