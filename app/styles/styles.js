import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import configs from '../config/configs';
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
    skip_button: {
        flex:1,
        height: height * 0.075,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#64aefa',
        borderWidth: 1,
        borderRadius: 12,
        marginRight: 3,
        padding: 12,
    },
    hint_button: {
        flex:1,
        height: height * 0.075,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4aeeb2',
        borderWidth: 1,
        borderRadius: 12,
        marginLeft: 3,
        padding: 12,
    },
    puzzle_text_large: {
        color: '#000',
        fontSize: configs.LETTER_SIZE * 0.9,
    },
    contents_text: {
        color: '#fff',
        fontSize: configs.LETTER_SIZE,
    },
    answer_text: {
        fontSize: configs.LETTER_SIZE * 1.5,
        fontWeight: 'bold',
    },
    answer_column_text: {
        color: 'white',
        fontSize: configs.LETTER_SIZE * 0.7,
    },
    clue_text_bold: {
        fontSize: configs.LETTER_SIZE * 0.6,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    clue_text: {
        fontSize: configs.LETTER_SIZE * 0.5,
    },
    keyfrag_text: {
        color: '#038c30',
        fontSize: configs.LETTER_SIZE * 4/3,
        fontWeight: 'bold',
    },
    score_text: {
        fontSize: configs.LETTER_SIZE * 5/3,
        fontWeight: 'bold',
    },
    input_box: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 5,
        backgroundColor: '#ccd5ee',
    },
    input_button: {
        flex: 1,
        borderWidth: 4,
        borderColor: '#087e2f',
        borderRadius: 0,
        backgroundColor: '#087e2f',
        margin: 6,
    },
    header_text: {
        color: '#e3e004',
        fontSize: configs.LETTER_SIZE * 0.6,
    },
    daily_launcher_text: {
        fontSize: configs.LETTER_SIZE * 0.5,
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
