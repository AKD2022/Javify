import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
export default function SavedCard({ topic, title, detail, score, onOpen, onRemove }) {
  return <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 16, gap: 12, borderWidth: 1, borderColor: '#EAE8F5' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={{ color: '#675CFF', backgroundColor: '#EFEDFF', borderRadius: 9, paddingVertical: 5, paddingHorizontal: 10, fontFamily: 'Poppins-Medium', fontSize: 12 }}>{topic ? `Topic ${topic}` : 'Previous curriculum'}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Remove bookmark: ${title}`} onPress={onRemove} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><MaterialIcons name="bookmark-remove" size={23} color="#675CFF" /></TouchableOpacity></View>
    <TouchableOpacity accessibilityRole="button" onPress={onOpen} style={{ gap: 10 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Text style={{ flex: 1, fontFamily: 'Poppins-SemiBold', fontSize: 16, color: '#29263D' }}>{title}</Text><MaterialIcons name="chevron-right" size={24} color="#8D85BA" /></View><Text numberOfLines={3} style={{ fontFamily: 'Poppins-Regular', color: '#625C74', fontSize: 13, lineHeight: 21 }}>{detail}</Text>
    {score != null && <View style={{ height: 6, backgroundColor: '#EFEDFF', borderRadius: 3, overflow: 'hidden' }}><View style={{ height: 6, borderRadius: 3, backgroundColor: '#7568FF', width: `${Math.max(0, Math.min(4, score)) / 4 * 100}%` }} /></View>}
    </TouchableOpacity>
  </View>;
}
