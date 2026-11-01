import { palette } from '../../assets/components/theme';
import React, { useMemo, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { filterLessons } from '../utils/content';
import colors from '../../assets/components/colors';
export default function LessonSearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => filterLessons(query), [query]);
  return <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: colors.defaultBackground, padding: 20 }}>
    <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 26, color: palette.ink, marginBottom: 20 }}>Find a lesson</Text>
    <TextInput autoFocus accessibilityLabel="Search lessons" placeholder="Topic, keyword, or AP number (e.g. 4.8)" value={query} onChangeText={setQuery} autoCorrect={false} style={{ backgroundColor: '#fff', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: palette.border, fontSize: 16 }} />
    <Text accessibilityLiveRegion="polite" style={{ paddingVertical: 12 }}>{results.length} matching lessons</Text>
    <FlatList keyboardShouldPersistTaps="handled" data={results} keyExtractor={item => item.id} ListEmptyComponent={<Text>No lessons match. Try a shorter term such as “String” or “array”.</Text>} renderItem={({ item }) => <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('LessonScreen', { lessonId: item.id.replace('lesson', '') })} style={{ paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: palette.border }}><Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: 16 }}>{`Lesson ${item.number}: ${item.title}`}</Text><Text style={{ color: palette.muted, marginTop: 6 }}>{item.unitTitle}</Text></TouchableOpacity>} />
  </SafeAreaView>;
}
