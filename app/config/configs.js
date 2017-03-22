import React, { Component } from 'react';

const {width, height} = require('Dimensions').get('window');
const CELL_WIDTH = Math.floor(height/1.84)/4;
const CELL_HEIGHT = CELL_WIDTH * .55;
const CELL_PADDING = Math.floor(CELL_WIDTH * .06);
const BORDER_RADIUS = CELL_PADDING * .2;
const TILE_WIDTH = CELL_WIDTH - CELL_PADDING * 2;
const TILE_HEIGHT = CELL_HEIGHT - CELL_PADDING * 2;
const LETTER_SIZE = Math.floor(TILE_HEIGHT * .7);

export const configs = {
    versionCode: 5,
    versionName: '1.0.5',
    appStoreID: 'com.fragmental',
    NUM_WIDE: 4,
    CELL_WIDTH: CELL_WIDTH,
    CELL_HEIGHT: CELL_HEIGHT,
    CELL_PADDING: CELL_PADDING,
    BORDER_RADIUS: BORDER_RADIUS,
    TILE_WIDTH: TILE_WIDTH,
    TILE_HEIGHT: TILE_HEIGHT,
    LETTER_SIZE: LETTER_SIZE,
    FB_URL_APP: 'fb://profile/FragMental-1534171629956651',
    FB_URL_BROWSER: 'https://www.facebook.com/FragMental-1534171629956651/',
    TWITTER_URL_APP: 'twitter://user?id=844683961427120129',
    TWITTER_URL_BROWSER: 'https://twitter.com/FragMentalApp'

};

export default configs;