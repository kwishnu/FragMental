import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableHighlight, ListView, BackAndroid, AsyncStorage } from 'react-native';
//import Row from '../components/Row';
import Button from '../components/Button';
import configs from '../config/configs';
import { normalize, normalizeFont }  from '../config/pixelRatio';
var InAppBilling = require("react-native-billing");
const styles = require('../styles/styles');
const { width, height } = require('Dimensions').get('window');
const CELL_WIDTH = width;
const CELL_HEIGHT = CELL_WIDTH * .5;
const CELL_PADDING = Math.floor(CELL_WIDTH * .08);
const TILE_WIDTH = (CELL_WIDTH - CELL_PADDING * 2);
const TILE_HEIGHT = CELL_HEIGHT - CELL_PADDING * 2;
const BORDER_RADIUS = CELL_PADDING * .3;
const KEY_expandInfo = 'expandInfoKey';
function shadeColor2(color, percent) {
    percent = percent/100;
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

module.exports = class StoreListView extends Component {
    constructor(props) {
        super(props);
        this.dataSource = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
        })
        this.state = {
            id: 'store',
            dataSource: this.props.availableList,
            expand: this.props.expand,
            infoString: ''
        };
        this.handleHardwareBackButton = this.handleHardwareBackButton.bind(this);
    }
    componentDidMount(){
        AsyncStorage.getItem(KEY_expandInfo).then((strExpand) => {
            if(strExpand){
                let expandArr = strExpand.split('.');
                let tf = false;
                switch(this.props.dataIndex){
                    case '3':
                        tf = (expandArr[0] == '1')?true:false;
                        this.setState({expand: tf, infoString: '\'Easy\' puzzles have answers that always begin with the Key fragment'});
                        break;
                    case '4':
                        tf = (expandArr[1] == '1')?true:false;
                        this.setState({expand: tf, infoString: '\'Moderate\' puzzles always have the Key fragment somewhere in their answers'});
                        break;
                    case '5':
                        tf = (expandArr[2] == '1')?true:false;
                        this.setState({expand: tf, infoString: '\'Hard\' puzzles may or may not have the Key fragment in their answers'});
                        break;
                    case '6':
                        tf = (expandArr[3] == '1')?true:false;
                        this.setState({expand: tf, infoString: '\'Theme\' puzzles may or may not have the Key fragment in their answers'});
                        break;
                }
            }
        });
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
    toggleInfoBox(bool){
        this.setState({expand: !bool});
        AsyncStorage.getItem(KEY_expandInfo).then((strExpand) => {
            let expArr = strExpand.split('.');
            let ind = 0;
            switch(this.props.dataIndex){
                case '3':
                    ind = 0;
                    break;
                case '4':
                    ind = 1;
                    break;
                case '5':
                    ind = 2;
                    break;
                case '6':
                    ind = 3;
                    break;
            }
            if(expArr[ind] == '1'){
                expArr[ind] = '0';
                let reglue = expArr.join('.');
                try {
                    AsyncStorage.setItem(KEY_expandInfo, reglue);//
                } catch (error) {
                    window.alert('AsyncStorage error: ' + error.message);
                }
            }

        });
    }

    render() {
        const rows = this.dataSource.cloneWithRows(this.props.availableList);
       if(this.state.expand){
            return (
                <View style={store_styles.container}>
                    <View style={ store_styles.header }>
                        <Button style={{left: height*.02}} onPress={ () => this.handleHardwareBackButton() }>
                            <Image source={ require('../images/arrow_back.png') } style={ { width: normalize(height*.07), height: normalize(height*.07) } } />
                        </Button>
                        <Text style={styles.header_text} >{this.props.title}
                        </Text>
                        <Button style={{right: height*.02}}>
                            <Image source={ require('../images/no_image.png') } style={ { width: normalize(height*.07), height: normalize(height*.07) } } />
                        </Button>
                    </View>
                    <View style={store_styles.listview_container}>
                        <View style={[ store_styles.infoBox, {flex: 3} ]}>
                            <View style={ store_styles.text_container }>
                                <Text style={store_styles.info_text} >{this.state.infoString}</Text>
                            </View>
                            <View style={ store_styles.button_container }>
                                <Button style={ store_styles.button } onPress={ () => this.toggleInfoBox(this.state.expand) }>
                                        <Text style={[store_styles.button_text, {color: 'red'}]}> X   </Text>
                                        <Text style={[store_styles.button_text, {color: '#ffffff'}]} > Got it!</Text>
                                </Button>
                            </View>
                        </View>
                        <View style={{flex: 10}}>
                            <ListView  showsVerticalScrollIndicator ={false}
                                    contentContainerStyle={ store_styles.listview }
                                    dataSource={rows}
                                    renderRow={(data) => <Row props= {data} navigator= {this.props.navigator} /> }
                            />
                        </View>
                    </View>
                </View>
            );
        }else{
            return (
                <View style={store_styles.container}>
                    <View style={ store_styles.header }>
                        <Button style={{left: height*.02}} onPress={ () => this.handleHardwareBackButton() }>
                            <Image source={ require('../images/arrow_back.png') } style={ { width: normalize(height*0.07), height: normalize(height*0.07) } } />
                        </Button>
                        <Text style={styles.header_text} >{this.props.title}</Text>
                        <Button style={{right: height*.02}} onPress={ () => this.toggleInfoBox() }>
                            <Image source={ require('../images/info_question.png') } style={ { width: normalize(height*0.07), height: normalize(height*0.07) } } />
                        </Button>
                    </View>
                    <View style={store_styles.listview_container}>
                        <View style={{flex: 12}}>
                            <ListView  showsVerticalScrollIndicator ={false}
                                    contentContainerStyle={ store_styles.listview }
                                    dataSource={rows}
                                    renderRow={(data) => <Row props= {data} navigator= {this.props.navigator} /> }
                            />
                        </View>
                    </View>
                </View>
            );
        }
    }
};
startPurchase = (item_name, itemID, nav) => {
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
};
const Row = ({props, navigator}) => (
    <TouchableHighlight
        onPress={()=>startPurchase(props.name, props.product_id, navigator)}
        style={[store_styles.launcher, {backgroundColor: props.color}, this.lightBorder(props.color)]}
        underlayColor={ shadeColor2(props.color, -20) }
        >
        <View style={store_styles.row_view}>
            <Text style={[store_styles.text_small, this.getTextColor(props.color)]}>
              {`${props.num_puzzles}`}
            </Text>
            <Text style={[store_styles.launcher_text, this.getTextColor(props.color)]}>
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
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#666666',
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 8,
        paddingRight: 8,
    },
    button_text: {
        fontSize: configs.LETTER_SIZE * .6,
        fontWeight: 'bold',
    },
    listview_container: {
        flex: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: height * .02,
        paddingRight: height * .02,
    },
    infoBox: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 6,
        width: width * .8,
        backgroundColor: '#ffffff',
        borderWidth: 2,
        borderColor: '#333333',
        marginTop: 16
    },
    text_container: {
        flex: 3,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: width * 0.7,
        backgroundColor: 'transparent',
    },
    button_container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: width * 0.75,
        backgroundColor: 'transparent',
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
        fontSize: normalizeFont(configs.LETTER_SIZE * .07),
        marginLeft: height * .02,
        marginRight: height * .02
    },
    launcher_text: {
        fontSize: normalizeFont(configs.LETTER_SIZE * .1),
    },
    info_text: {
        fontSize: normalizeFont(configs.LETTER_SIZE * .085),
        color: '#333333'
    },
    launcher: {
        width: TILE_WIDTH,
        height: TILE_WIDTH * .25,
        borderRadius: BORDER_RADIUS,
        marginTop: 6,
        marginBottom: 1,
    },
});