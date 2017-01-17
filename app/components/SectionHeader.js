import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
var {width, height} = require('Dimensions').get('window');

const styles = StyleSheet.create({
  container: {
    width: width,
    padding: 10,
    paddingLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#0000FF',
  },
  text: {
    fontSize: 20,
    color: '#FFF600',
  },
});

const SectionHeader = (props) => (
  <View style={styles.container}>
    <Text style={styles.text}>{props.sectionTitle}</Text>
  </View>
);

export default SectionHeader;