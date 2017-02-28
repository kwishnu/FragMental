import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableHighlight, ListView, BackAndroid, AsyncStorage } from 'react-native';
//import Row from '../components/Row';
import Button from '../components/Button';
var styles = require('../styles/styles');
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
            dataSource: this.props.puzzleData[this.props.dataIndex].data
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
        const rows = this.dataSource.cloneWithRows(this.props.puzzleData[this.props.dataIndex].data);
        return (
                <View style={store_styles.container}>
                    <View style={ store_styles.header }>
                        <Button style={{left: 10}} onPress={ () => this.handleHardwareBackButton() }>
                            <Image source={ require('../images/arrow_back.png') } style={ { width: 50, height: 50 } } />
                        </Button>
                        <Text style={styles.header_text} >{this.props.title}
                        </Text>
                        <Button>
                            <Image source={ require('../images/no_image.png') } style={ { width: 50, height: 50 } } />
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

startPurchase=(name, nav)=>{
    nav.pop({});
    nav.replace({
        id: 'splash screen',
        passProps: {
            motive: 'purchase',
            packName: name
        }
    });

}

const Row = ({props, navigator}) => (
    <TouchableHighlight onPress={()=>startPurchase(props.name, navigator)} style={[store_styles.launcher, {backgroundColor: props.color}, this.lightBorder(props.color)]}>
        <View style={store_styles.row_view}>
            <Text style={[store_styles.text_small, this.getTextColor(props.color)]}>
              {`${props.num_puzzles}`}
            </Text>
            <Text style={[{fontSize: 20}, this.getTextColor(props.color)]}>
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
        paddingLeft: 16,
        paddingRight: 16,
    },
    listview: {
        marginTop: 16,
        paddingBottom: 40,
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

