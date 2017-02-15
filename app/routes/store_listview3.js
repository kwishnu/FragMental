import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableHighlight, ListView, BackAndroid, AsyncStorage } from 'react-native';
import Row3 from '../components/Row3';
import Button from '../components/Button';
var styles = require('../styles/styles');
function randomNum(low, high) {
    high++;
    return Math.floor((Math.random())*(high-low))+low;
}


module.exports = class ComboStore extends Component {
    constructor(props) {
        super(props);
        this.dataSource = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2
          })
//        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            id: 'combo store',
            dataSource: this.props.puzzleData[this.props.dataIndex].data
        };
        this.handleHardwareBackButton = this.handleHardwareBackButton.bind(this);
    }
    componentDidMount(){
    //window.alert(this.props.dataIndex);
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
                        <Button style={{right: 10}}>
                            <Image source={ require('../images/no_image.png') } style={ { width: 50, height: 50 } } />
                        </Button>
                    </View>
                    <View style={ store_styles.listview_container }>
                        <ListView  showsVerticalScrollIndicator ={false}
                                initialListSize ={100}
                                contentContainerStyle={ store_styles.listview }
                                dataSource={rows}
                                renderRow={(data) => <Row3 props= {data} navigator= {this.props.navigator} />}
                        />
                    </View>
                </View>
    );
  }
};


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
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 16,
        paddingBottom: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

