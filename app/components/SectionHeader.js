//section header for Contents:

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import configs from '../config/configs';
var {width, height} = require('Dimensions').get('window');

const styles = StyleSheet.create({
  container: {
    width: width,
    padding: height/90,
    paddingLeft: height/30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#0000FF',
    borderBottomWidth: 2,
    borderBottomColor: '#222222'
  },
  text: {
    fontSize: configs.LETTER_SIZE * 0.7,
    color: '#FFF600',
  },
});

const SectionHeader = (props) => (
  <View style={styles.container}>
    <Text style={styles.text}>{props.sectionTitle}</Text>
  </View>
);

export default SectionHeader;