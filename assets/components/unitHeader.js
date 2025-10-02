import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from './colors';

const UnitHeader = ({ title, subTitle }) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>{title}</Text>
      {subTitle && <Text style={styles.subTitle}>{subTitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'column', 
  },

  title: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: colors.black, 
  },

  subTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: colors.black,
    marginTop: 2,
    paddingBottom: 10, 
  },
});

export default UnitHeader;
