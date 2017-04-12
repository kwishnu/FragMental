import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import configs from '../config/configs';
import normalize from '../config/pixelRatio';
var { width, height } = require('Dimensions').get('window');

module.exports = StyleSheet.create({
    cell: {
        position: 'absolute',
        width: configs.CELL_WIDTH,
        height: configs.CELL_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    tile: {
        width: configs.TILE_WIDTH,
        height: configs.TILE_HEIGHT,
        borderRadius: configs.BORDER_RADIUS,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    puzzle_text_large: {
        color: '#000',
        fontSize: normalize(configs.LETTER_SIZE * 0.75),
    },
    contents_text: {
        color: '#fff',
        fontSize: normalize(configs.LETTER_SIZE),
    },
    answer_text: {
        fontSize: normalize(configs.LETTER_SIZE * 1.1),
        fontWeight: 'bold',
    },
    answer_column_text: {
        color: 'white',
        fontSize: normalize(configs.LETTER_SIZE * 0.55),
    },
    clue_text_bold: {
        fontSize: normalize(configs.LETTER_SIZE * 0.55),
        fontWeight: 'bold',
        textAlign: 'center',
    },
    clue_text: {
        fontSize: normalize(configs.LETTER_SIZE * 0.4),
    },
    clue_text_small: {
        fontSize: normalize(configs.LETTER_SIZE * 0.35),
    },
    score_text: {
        fontSize: normalize(configs.LETTER_SIZE * 1.4),
        fontWeight: 'bold',
    },
    header_text: {
        color: '#e3e004',
        fontSize: normalize(configs.LETTER_SIZE * 0.6),
    },
    daily_launcher_text: {
        fontSize: normalize(configs.LETTER_SIZE * 0.5),
    },
    menu: {
        flex: 1,
        width: width,
        height: height,
        backgroundColor: 'blue',
        padding: 20,
    },
    copyright: {
        fontSize: 10,
        color: '#fff',
        marginBottom:10,
    },
});
