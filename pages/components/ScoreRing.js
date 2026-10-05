import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
export default function ScoreRing({ score, total, light = false }) {
  const percent = total > 0 ? Math.round(score / total * 100) : 0;
  const circumference = 2 * Math.PI * 56;
  return <View accessible accessibilityLabel={`${percent} percent correct`} style={{ width: 136, height: 136, alignItems: 'center', justifyContent: 'center' }}>
    <Svg width={136} height={136} style={{ position: 'absolute' }}><Circle cx={68} cy={68} r={56} fill="none" stroke={light ? '#FFFFFF40' : '#EAE8FF'} strokeWidth={10} /><Circle cx={68} cy={68} r={56} fill="none" stroke={light ? '#FFFFFF' : '#675CFF'} strokeWidth={10} strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference * (1 - percent / 100)} rotation={-90} origin="68, 68" strokeLinecap={percent ? 'round' : 'butt'} /></Svg>
    <Text style={{ fontFamily: 'Poppins-Bold', fontSize: 30, color: light ? '#fff' : '#34304F' }}>{percent}%</Text>
    <Text style={{ fontFamily: 'Poppins-Regular', fontSize: 12, color: light ? '#fff' : '#656079' }}>correct</Text>
  </View>;
}
