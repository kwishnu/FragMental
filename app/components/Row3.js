import React from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import configs from '../config/configs';
import { normalize, normalizeFont }  from '../config/pixelRatio';
var InAppBilling = require('react-native-billing');
const { width, height } = require('Dimensions').get('window');
const CELL_WIDTH = Math.floor(width); // one tile's fraction of the screen width
const CELL_HEIGHT = CELL_WIDTH * .5;
const CELL_PADDING = Math.floor(CELL_WIDTH * .08); // 5% of the cell width...+
const TILE_WIDTH = (CELL_WIDTH - CELL_PADDING * 2);
const TILE_HEIGHT = CELL_HEIGHT - CELL_PADDING * 2;
const BORDER_RADIUS = CELL_PADDING * .3;

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
        borderColor: lighterColor,
        borderWidth: 3
    };
}
getTextColor=(bg)=>{
    var strToReturn = this.invertColor(bg, true);
    return {
        color: strToReturn
    };
}
getBgColor=(color)=>{
    var strToReturn = color;
    return {
        backgroundColor: strToReturn
    };
}
buyCombo=(item_name, itemID, nav)=>{
    InAppBilling.open()
    .then(() => InAppBilling.purchase(itemID))
    .then((details) => {
        nav.pop({});
        nav.replace({
            id: 'splash screen',
            passProps: {
                motive: 'purchase',
                packName: item_name,
                productID: itemID
            }
        });
        console.log("You purchased: ", details)
        return InAppBilling.close()
    }).catch((err) => {
        console.log(err);
        return InAppBilling.close()
    });
}

const Row3 = ({props, navigator}) => (
    <TouchableHighlight onPress={()=>this.buyCombo( props.name, props.product_id, navigator)} style={[styles.launcher, this.lightBorder(props.color[1])]}>
        <View style={styles.column_view}>
            <View style={[styles.top_section, this.getBgColor(props.color[0])]}>
                <Text style={[styles.text_small, this.getTextColor(props.color[0])]}>
                  {`${props.num_puzzles[0]}`}
                </Text>
                <Text style={[styles.launcher_text, this.getTextColor(props.color[0])]}>
                  {`${props.name[0]}`}
                </Text>
                <Text style={[styles.text_small, this.getTextColor(props.color[0])]}>
                  {`${props.difficulty[0]}`}
                </Text>
            </View>
            <View style={[styles.mid_section, this.getBgColor(props.color[1])]}>
                <Text style={[styles.text_small, this.getTextColor(props.color[1])]}>
                  {`${props.num_puzzles[1]}`}
                </Text>
                <Text style={[styles.launcher_text, this.getTextColor(props.color[1])]}>
                  {`${props.name[1]}`}
                </Text>
                <Text style={[styles.text_small, this.getTextColor(props.color[1])]}>
                  {`${props.difficulty[1]}`}
                </Text>
            </View>
            <View style={[styles.bottom_section, this.getBgColor(props.color[2])]}>
                <Text style={[styles.text_small, this.getTextColor(props.color[2])]}>
                  {`${props.num_puzzles[2]}`}
                </Text>
                <Text style={[styles.launcher_text, this.getTextColor(props.color[2])]}>
                  {`${props.name[2]}`}
                </Text>
                <Text style={[styles.text_small, this.getTextColor(props.color[2])]}>
                  {`${props.difficulty[2]}`}
                </Text>
            </View>
        </View>
    </TouchableHighlight>
);

const styles = StyleSheet.create({
    column_view: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch',
    },
    top_section: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopLeftRadius: BORDER_RADIUS,
        borderTopRightRadius: BORDER_RADIUS,
        paddingLeft: height * .02,
        paddingRight: height * .02
    },
    mid_section: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: height * .02,
        paddingRight: height * .02
    },
    bottom_section: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: BORDER_RADIUS,
        borderBottomRightRadius: BORDER_RADIUS,
        paddingLeft: height * .02,
        paddingRight: height * .02
    },
    text_small: {
        fontSize: normalizeFont(configs.LETTER_SIZE * .07),
    },
    launcher_text: {
        fontSize: normalizeFont(configs.LETTER_SIZE * .1),
    },
    launcher: {
        width: TILE_WIDTH,
        height: TILE_WIDTH * .4,
        borderRadius: BORDER_RADIUS,
        marginTop: 10,
        marginBottom: 1,
    }
});

export default Row3;