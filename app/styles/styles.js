import React, { Component } from 'react';
import { StyleSheet } from 'react-native';

//const window = Dimensions.get('window');

var { width, height } = require('Dimensions').get('window');
var NUM_WIDE = 4;
var NUM_HIGH = 5;
var CELL_WIDTH = Math.floor(width * .24); // 24% of the screen width
var CELL_HEIGHT = CELL_WIDTH * .55;
var CELL_PADDING = Math.floor(CELL_WIDTH * .08); // 8% of the cell width
var BORDER_RADIUS = CELL_PADDING * .2;
var TILE_WIDTH = CELL_WIDTH - CELL_PADDING * 2;
var TILE_HEIGHT = CELL_HEIGHT - CELL_PADDING * 2;
var LETTER_SIZE = Math.floor(TILE_HEIGHT * .7);


module.exports = StyleSheet.create({
    tile: {
        position: 'absolute',
        width: TILE_WIDTH,
        height: TILE_HEIGHT,
        borderRadius: BORDER_RADIUS,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#dedffa',
        padding: 8,
    },
    skip_button: {
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#64aefa',
        borderRadius: 12,
        marginRight: 3,
        padding: 2,
    },
    hint_button: {
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4aeeb2',
        borderRadius: 12,
        marginLeft: 3,
        padding: 2,
    },
    puzzle_text_large: {
        color: '#000',
        fontSize: LETTER_SIZE,
    },
    contents_text: {
        color: '#fff',
        fontSize: LETTER_SIZE,
    },
    answer_text: {
        color: 'white',
        fontSize: LETTER_SIZE * 5/3,
        fontWeight: 'bold',
    },
    answer_column_text: {
        color: 'white',
        fontSize: LETTER_SIZE * 2/3,
    },
    clue_text: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    keyfrag_text: {
        color: '#038c30',
        fontSize: LETTER_SIZE * 4/3,
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
        fontSize: 18,
    },
    daily_launcher_text: {
        fontSize: 14,
    },
    menu: {
        flex: 1,
        width: width,
        height: height,
        backgroundColor: 'blue',
        padding: 20,
    },
    menu_font: {
        color: '#fff',
        fontSize: 40,
    },
    caption: {
        fontSize: 20,
        fontWeight: 'bold',
        alignItems: 'center',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    avatarContainer: {
        marginBottom: 20,
        marginTop: 20,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        flex: 1,
    },
    name: {
        color: '#fff',
        fontSize: 20,
    },
    menu_item: {
        fontSize: 20,
        color: '#fff',
    },
    copyright: {
        fontSize: 10,
        color: '#fff',
        marginBottom:10,
    },
});
