import React from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
var { width, height } = require('Dimensions').get('window');
var CELL_WIDTH = Math.floor(width); // one tile's fraction of the screen width
var CELL_HEIGHT = CELL_WIDTH * .5;
var CELL_PADDING = Math.floor(CELL_WIDTH * .08); // 5% of the cell width...+
var TILE_WIDTH = (CELL_WIDTH - CELL_PADDING * 2);
var TILE_HEIGHT = CELL_HEIGHT - CELL_PADDING * 2;
var BORDER_RADIUS = CELL_PADDING * .3;

invertColor=(hex, bw)=> {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    r = (r.length == 1)?(r + '0'):r;
    g = (255 - g).toString(16);
    g = (g.length == 1)?(g + '0'):g;
    b = (255 - b).toString(16);
    b = (b.length == 1)?(b + '0'):b;

    // pad each with zeros and return
    return  "#" + r + g + b;
//     padZero(r) + padZero(g) + padZero(b);
}
shadeColor=(color, percent)=> {
    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;
    G = (G<255)?G:255;
    B = (B<255)?B:255;

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return '#'+RR+GG+BB;
}
lightBorder=(color)=> {
    var lighterColor = this.shadeColor(color, 60);
        return {
            borderColor: lighterColor
        };
}
getTextColor=(bg)=>{
var strToReturn = this.invertColor(bg, true);
    return {
        color: strToReturn,
        borderWidth: 20,
        borderStyle: 'solid'
    };
}
startPurchase=(item_name)=>{
    window.alert(item_name);
}
const Row = (props) => (
    <TouchableHighlight onPress={()=>this.startPurchase(props.name)} style={[styles.launcher, {backgroundColor: props.color}, this.lightBorder(props.color)]}>
        <View style={styles.row_view}>
            <Text style={[styles.text_small, this.getTextColor(props.color)]}>
              {`${props.num_puzzles}`}
            </Text>
            <Text style={[{fontSize: 20}, this.getTextColor(props.color)]}>
              {`${props.name}`}
            </Text>
            <Text style={[styles.text_small, {color: props.color}]}>
              {`${props.difficulty}`}
            </Text>
        </View>
    </TouchableHighlight>
);

const styles = StyleSheet.create({
    row_view: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    text_small: {
        fontSize: 10,
        marginLeft: 10
    },
    launcher: {
        width: TILE_WIDTH,
        height: TILE_WIDTH * .25,
        borderRadius: BORDER_RADIUS,
        marginTop: 6,
        marginBottom: 1,
    },
});

export default Row;