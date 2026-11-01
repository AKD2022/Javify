import { palette } from '../../assets/components/theme';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
export default function SavedCard({ topic, title, detail, score, onOpen, onRemove }) {
  return <View style={{ paddingVertical: 16, gap: 8, borderBottomWidth: 1, borderColor: palette.border }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={{ color: palette.accent, fontFamily: 'Poppins-Medium', fontSize: 12 }}>{topic ? `Topic ${topic}` : 'Previous curriculum'}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Remove bookmark: ${title}`} onPress={onRemove} style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}><MaterialIcons name="bookmark-remove" size={23} color={palette.accent} /></TouchableOpacity></View>
    <TouchableOpacity accessibilityRole="button" onPress={onOpen} style={{ gap: 10 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Text style={{ flex: 1, fontFamily: 'Poppins-SemiBold', fontSize: 16, color: palette.ink }}>{title}</Text><MaterialIcons name="chevron-right" size={24} color={palette.muted} /></View><Text numberOfLines={3} style={{ fontFamily: 'Poppins-Regular', color: palette.muted, fontSize: 13, lineHeight: 21 }}>{detail}</Text>
    {score != null && <View style={{ height: 6, backgroundColor: palette.accentSoft, borderRadius: 3, overflow: 'hidden' }}><View style={{ height: 6, borderRadius: 3, backgroundColor: palette.accent, width: `${Math.max(0, Math.min(4, score)) / 4 * 100}%` }} /></View>}
    </TouchableOpacity>
  </View>;
}
