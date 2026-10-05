import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
export default function UnitOrder({ units = [] }) {
  return <View accessible accessibilityLabel={`Unit order: ${units.map(id => id.replace('unit', '')).join(', then ')}`} style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginVertical: 12 }}>
    {units.map((id, i) => <View key={id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ minWidth: 42, minHeight: 42, padding: 8, borderRadius: 14, backgroundColor: '#675CFF', justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#fff', fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>{id.replace('unit', '')}</Text></View>{i < units.length - 1 && <MaterialIcons name="arrow-forward" size={18} color="#756F9A" />}</View>)}
  </View>;
}
