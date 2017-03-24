import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableHighlight, ListView, BackAndroid, AsyncStorage } from 'react-native';
//import Row from '../components/Row';
import Button from '../components/Button';
import configs from '../config/configs';

var styles = require('../styles/styles');
var InAppBilling = require("react-native-billing");
var { width, height } = require('Dimensions').get('window');
var CELL_WIDTH = Math.floor(width); // one tile's fraction of the screen width
var CELL_HEIGHT = CELL_WIDTH * .5;
var CELL_PADDING = Math.floor(CELL_WIDTH * .08); // 5% of the cell width...+
var TILE_WIDTH = (CELL_WIDTH - CELL_PADDING * 2);
var TILE_HEIGHT = CELL_HEIGHT - CELL_PADDING * 2;
var BORDER_RADIUS = CELL_PADDING * .3;
function randomNum(low, high) {
    high++;
    return Math.floor((Math.random())*(high-low))+low;
}

module.exports = class StoreListView extends Component {
    constructor(props) {
        super(props);
        this.dataSource = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        })
        this.state = {
            id: 'store',
            dataSource: this.props.availableList
        };
        this.handleHardwareBackButton = this.handleHardwareBackButton.bind(this);
    }
    componentDidMount(){
        BackAndroid.addEventListener('hardwareBackPress', this.handleHardwareBackButton);
    }
    componentWillUnmount () {
        BackAndroid.removeEventListener('hardwareBackPress', this.handleHardwareBackButton);
    }
    handleHardwareBackButton() {
        try {
            this.props.navigator.pop({
                id: 'puzzles contents',
                passProps: {
                    puzzleData: this.props.puzzleData,
                }
            });
        }
        catch(err) {
            window.alert(err.message);
        }
        return true;
    }


    render() {
        const rows = this.dataSource.cloneWithRows(this.props.availableList); //(this.props.puzzleData[this.props.dataIndex].data);
        return (
                <View style={store_styles.container}>
                    <View style={ store_styles.header }>
                        <Button style={{left: height*.02}} onPress={ () => this.handleHardwareBackButton() }>
                            <Image source={ require('../images/arrow_back.png') } style={ { width: height*.08, height: height*.08 } } />
                        </Button>
                        <Text style={styles.header_text} >{this.props.title}
                        </Text>
                        <Button style={{right: height*.02}}>
                            <Image source={ require('../images/no_image.png') } style={ { width: height*.08, height: height*.08 } } />
                        </Button>
                    </View>
                    <View style={ store_styles.listview_container }>
                        <ListView  showsVerticalScrollIndicator ={false}
                                contentContainerStyle={ store_styles.listview }
                                dataSource={rows}
                                renderRow={(data) => <Row props= {data} navigator= {this.props.navigator} /> }
                        />
                    </View>
                </View>
    );
  }
};
startPurchase=(item_name, itemID, nav)=>{
    InAppBilling.open()
    .then(() => InAppBilling.purchase(itemID))
    .then((details) => {
        nav.pop({});
        nav.replace({
            id: 'splash screen',
            passProps: {
                motive: 'purchase',
                packName: item_name
            }
        });
        console.log("You purchased: ", details)
        return InAppBilling.close()
    }).catch((err) => {
        console.log(err);
        return InAppBilling.close()
    });
}

const Row = ({props, navigator}) => (
    <TouchableHighlight onPress={()=>startPurchase(props.name, props.product_id, navigator)} style={[store_styles.launcher, {backgroundColor: props.color}, this.lightBorder(props.color)]}>
        <View style={store_styles.row_view}>
            <Text style={[store_styles.text_small, this.getTextColor(props.color)]}>
              {`${props.num_puzzles}`}
            </Text>
            <Text style={[{fontSize: configs.LETTER_SIZE * .65}, this.getTextColor(props.color)]}>
              {`${props.name}`}
            </Text>
            <Text style={[store_styles.text_small, {color: props.color}]}>
              {`${props.difficulty}`}
            </Text>
        </View>
    </TouchableHighlight>
);


const store_styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#486bdd',
    },
    header: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 6,
        width: window.width,
        backgroundColor: '#12046c',
    },
    listview_container: {
        flex: 13,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: height * .02,
        paddingRight: height * .02,
    },
    listview: {
        marginTop: height * .02,
        paddingBottom: height * .04,
        justifyContent: 'center',
        alignItems: 'center',
    },
    row_view: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    text_small: {
        fontSize: configs.LETTER_SIZE * .4,
        marginLeft: height * .02
    },
    launcher: {
        width: TILE_WIDTH,
        height: TILE_WIDTH * .25,
        borderRadius: BORDER_RADIUS,
        marginTop: 6,
        marginBottom: 1,
    },
});

