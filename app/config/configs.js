import React, { Component } from 'react';

var {width, height} = require('Dimensions').get('window');
var CELL_WIDTH = Math.floor(height/1.84)/4;
var CELL_HEIGHT = CELL_WIDTH * .55;
var CELL_PADDING = Math.floor(CELL_WIDTH * .06);
var BORDER_RADIUS = CELL_PADDING * .2;
var TILE_WIDTH = CELL_WIDTH - CELL_PADDING * 2;
var TILE_HEIGHT = CELL_HEIGHT - CELL_PADDING * 2;
var LETTER_SIZE = Math.floor(TILE_HEIGHT * .7);


export const configs = {
    versionCode: 5,
    versionName: '1.0.5',
    appStoreID: 'com.fragmental',
    NUM_WIDE: 4,
    CELL_WIDTH: CELL_WIDTH,
    CELL_HEIGHT: CELL_HEIGHT,
    CELL_PADDING: CELL_PADDING, // 8% of the cell width
    BORDER_RADIUS: BORDER_RADIUS,
    TILE_WIDTH: TILE_WIDTH,
    TILE_HEIGHT: TILE_HEIGHT,
    LETTER_SIZE: LETTER_SIZE

};

export default configs;