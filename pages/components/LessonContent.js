import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { splitJavaTerms } from '../utils/lessonFormatting';
const mono = Platform.OS === 'ios' ? 'Menlo' : 'monospace';
function RichText({ value }) {
  // Native inline Views align to Android's text attachment box, not its baseline.
  // Use wrapping word/pill views with a shared line height instead of attachments.
  return <View accessible accessibilityLabel={value.replace(/`/g, '')} style={{ gap: 12 }}>
    {value.split('\n').map((line, lineIndex) => <View key={lineIndex} style={styles.paragraphRow}>
      {splitJavaTerms(line).flatMap((part, i) => part.code
        ? [<View key={`c${i}`} style={styles.pill}><Text style={styles.pillText}>{part.value}</Text></View>]
        : part.value.split(/(\s+)/).filter(Boolean).map((word, j) => <Text key={`${i}-${j}`} style={styles.paragraph}>{word}</Text>))}
    </View>)}
  </View>;
}
export default function LessonContent({ blocks = [] }) {
  const groups = [];
  blocks.forEach((block, index) => {
    if (block.type === 'heading') groups.push({ type: 'heading', value: block.value, key: index });
    else if (block.type === 'code' && !block.value.includes('\n') && block.value.length < 36) {
      const previous = groups[groups.length - 1];
      if (previous?.type === 'text') previous.value += ` \`${block.value}\` `;
      else groups.push({ type: 'text', value: `\`${block.value}\``, key: index });
    } else if (block.type === 'text') {
      const previous = groups[groups.length - 1];
      if (previous?.type === 'text' && previous.value.endsWith('` ')) previous.value += block.value;
      else groups.push({ type: 'text', value: block.value, key: index });
    } else if (block.type === 'code') groups.push({ ...block, key: index });
  });
  return <View style={{ gap: 14 }}>{groups.map(block => block.type === 'heading' ? <Text accessibilityRole="header" key={block.key} style={styles.heading}>{block.value}</Text> : block.type === 'code' ? <ScrollView key={block.key} horizontal style={styles.codeBlock} contentContainerStyle={{ padding: 16 }}><Text selectable style={styles.code}>{block.value}</Text></ScrollView> : <RichText key={block.key} value={block.value} />)}</View>;
}
const styles = StyleSheet.create({
  paragraphRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline' },
  paragraph: { fontFamily: 'Poppins-Regular', fontSize: 15, lineHeight: 28, color: '#25324A' },
  heading: { fontFamily: 'Poppins-SemiBold', fontSize: 18, lineHeight: 26, marginTop: 10, color: '#172747' },
  pill: { borderRadius: 999, overflow: 'hidden', backgroundColor: '#E7EDFF', borderWidth: 1, borderColor: '#CDD8F6', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 7, paddingVertical: 1, marginHorizontal: 2, maxWidth: '100%' },
  pillText: { fontFamily: mono, fontSize: 14, lineHeight: 24, color: '#203E7B', includeFontPadding: false, textAlign: 'center' },
  codeBlock: { backgroundColor: '#F1F4FA', borderRadius: 14, borderColor: '#D7DFED', borderWidth: 1 },
  code: { fontFamily: mono, fontSize: 14, lineHeight: 23, color: '#20324F' },
});
