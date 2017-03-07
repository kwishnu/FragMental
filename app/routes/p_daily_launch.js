import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableHighlight, TouchableOpacity, ListView, BackAndroid, Animated, AsyncStorage  } from 'react-native';
import moment from 'moment';
import Button from '../components/Button';

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
function randomNum(low, high) {
    high++;
    return Math.floor((Math.random())*(high-low))+low;
}

var deepCopy = require('../data/deepCopy.js');
var fragData = require('../data/objPassed.js');
var SideMenu = require('react-native-side-menu');
var Menu = require('../nav/menu');
var styles = require('../styles/styles');
var {width, height} = require('Dimensions').get('window');
var NUM_WIDE = 3;
var CELL_WIDTH = Math.floor(width/NUM_WIDE); // one tile's fraction of the screen width
var CELL_PADDING = Math.floor(CELL_WIDTH * .05); // 5% of the cell width...+
var TILE_WIDTH = (CELL_WIDTH - CELL_PADDING * 2) - 7;
var BORDER_RADIUS = CELL_PADDING * .2 + 3;
var puzzleData = {};


class DailyLaunch extends Component{
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            daily_solvedArray: this.props.daily_solvedArray,
            id: 'daily launcher',
            puzzleData: this.props.puzzleData,
            dataElement: this.props.dataElement,
            title: this.props.title,
            isOpen: false,
            dataSource: ds.cloneWithRows(Array.from(new Array(parseInt(this.props.puzzleData[this.props.dataElement].num_puzzles, 10)), (x,i) => i)),
        };
        this.handleHardwareBackButton = this.handleHardwareBackButton.bind(this);
    }
    componentDidMount() {
        puzzleData = this.state.puzzleData;
        BackAndroid.addEventListener('hardwareBackPress', this.handleHardwareBackButton);
    }
    componentWillUnmount () {
        BackAndroid.removeEventListener('hardwareBackPress', this.handleHardwareBackButton);
    }
    handleHardwareBackButton() {
        if (this.state.isOpen) {
            this.toggle();
            return true;
        }else{
            try {
                var myPackArray = [];
                var str = '';
                for (var key in puzzleData){
                    if (puzzleData[key].type == 'mypack'){
                        myPackArray.push(puzzleData[key].title);
                    }
                }
                var levels = [3,4,5,6];//Easy, Moderate, Hard, Theme
                for(let i=0; i<4; i++){
                    var titleIndex = -1;
                    var rand0to9 = [0,1,2,3,4,5,6,7,8,9];
                    rand0to9 = shuffleArray(rand0to9);
                    for (var r=0; r<10; r++){
        //                var rand0to9 = randomNum(0, 9);
                        if (myPackArray.indexOf(puzzleData[levels[i]].data[rand0to9[r]].name) < 0){
                            titleIndex = rand0to9[r];
                            break;
                        }
                    }
                    if (titleIndex !== -1){
                        puzzleData[20 + i].title = '*' + puzzleData[levels[i]].data[titleIndex].name;
                        puzzleData[20 + i].product_id = '*' + puzzleData[levels[i]].data[titleIndex].product_id;
                        puzzleData[20 + i].bg_color = puzzleData[levels[i]].data[titleIndex].color;
                    }else{
                        puzzleData[20 + i].show = 'false';
                    }
                }
                this.props.navigator.replace({
                    id: 'puzzles contents',
                    passProps: {
                        puzzleData: puzzleData,
                    }
                });
                return true;
            } catch(err)  {
                return false;
            }
        }
    }
    toggle() {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }
    updateMenuState(isOpen) {
        this.setState({ isOpen: isOpen });

    }
    onMenuItemSelected = (item) => {
            switch (item.link){
                case 'puzzles contents':
                    this.props.navigator.replace({
                        id: 'puzzles contents',
                        passProps: {
                            puzzleData: this.props.puzzleData,
                        }
                    });
                    break;
                case 'game board':
                    this.props.navigator.replace({
                        id: 'game board',
                        passProps: {
                            puzzleData: this.props.puzzleData,
                            daily_solvedArray: this.props.sArray,
                            title: this.props.todayFull,
                            index: '0',
                            bgColor: '#09146d',
                            fromWhere: 'puzzles contents',
                            dataElement: '16',
                            isPremium: this.props.isPremium
                        },
                    });
                    return;
                case 'daily launcher':
                    this.toggle();
                    break;
                case 'store':
                    this.props.navigator.push({
                        id: 'store',
                        passProps: {
                            dataIndex: item.index,
                            title: item.title + ' Puzzle Packs',
                            puzzleData: this.props.puzzleData,
                        }
                    });
                    break;
                case 'store3':
                    this.props.navigator.push({
                        id: 'combo store',
                        passProps: {
                            dataIndex: item.index,
                            title: item.title + ' Value Packs',
                            puzzleData: this.props.puzzleData,
                        }
                    });
                    break;
                case 'facebook':
                    window.alert('Device not configured');
                    break;
                case 'twitter':
                    window.alert('Device not configured');
                    break;
                case 'app_intro':
                    this.props.navigator.push({
                        id: 'start scene',
                        passProps: {
                            destination: 'daily launcher',
                            puzzleData: this.props.puzzleData,
                        }
                    });
                    break;
                case 'settings':
                    this.props.navigator.push({
                        id: 'settings',
                        passProps: {
                            destination: 'daily launcher',
                            puzzleData: this.props.puzzleData,
                        }
                    });
                    break;
                case 'about':
                    this.props.navigator.push({
                        id: 'about',
                        passProps: {
                            destination: 'daily launcher',
                            puzzleData: this.props.puzzleData,
                        }
                    });
                    break;
            }
    }
    border(color) {
        return {
            borderColor: color,
            borderWidth: 2,
        };
    }
    bg(num){
         var strToReturn='';
         if (this.props.daily_solvedArray[num]==0){
             strToReturn='#079707';//green
             }else{
             strToReturn='#999ba0';//grey
             }
         return {
         backgroundColor: strToReturn
         };
     }
    getTextColor(num){
         var strToReturn='';
         if (this.props.daily_solvedArray[num]==0){
             strToReturn='#fff';
             }else{
             strToReturn='#000';
             }
         return {
         color: strToReturn
         };
    }

    getUnderlay(num){
         var strToReturn='';
         if (this.props.daily_solvedArray[num]==0){
             strToReturn='#079707';//green
             }else{
             strToReturn='#999ba0';//grey
             }
         return strToReturn;
    }
    getBorder(num){
         var strToReturn='';
         if (this.props.daily_solvedArray[num]==0){
             strToReturn='#00ff00';//green
             }else{
             strToReturn='#000000';//black
             }
         return {
         borderColor: strToReturn
         };
    }
    onSelect(index, date) {
            var levels = [3,4,5,6];//Easy, Moderate, Hard, Theme
            for(let i=0; i<4; i++){
                var rand0to9 = randomNum(0, 9);
                puzzleData[20 + i].title = '*' + puzzleData[levels[i]].data[rand0to9].name;
                puzzleData[20 + i].product_id = '*' + puzzleData[levels[i]].data[rand0to9].product_id;
                this.state.puzzleData[20 + i].bg_color = this.props.puzzleData[levels[i]].data[rand0to9].color;
            }
        this.props.navigator.replace({
            id: 'game board',
            passProps: {
                puzzleData: this.state.puzzleData,
                title: date,
                index: index,
                fromWhere: 'daily launcher',
                daily_solvedArray: this.props.daily_solvedArray,
                dataElement: this.props.dataElement,
                isPremium: this.props.isPremium,
                bgColor: this.props.bgColor,
                myTitle: this.props.title
            },
       });
    }

    render() {
        const menu = <Menu onItemSelected={ this.onMenuItemSelected } data = {this.props.puzzleData} />;
        return (
            <SideMenu
                menu={ menu }
                isOpen={ this.state.isOpen }
                onChange={ (isOpen) => this.updateMenuState(isOpen) }>

                <View style={ [container_styles.container, this.border('#070f4e')] }>
                    <View style={ container_styles.header }>
                        <Button style={{left: 10}} onPress={ () => this.handleHardwareBackButton() }>
                            <Image source={ require('../images/arrow_back.png') } style={ { width: 50, height: 50 } } />
                        </Button>
                        <Text style={styles.header_text} >{this.props.title}
                        </Text>
                        <Button style={{right: 15}}>
                            <Image source={ require('../images/no_image.png') } style={ { width: 50, height: 50 } } />
                        </Button>
                    </View>
                    <View style={ [container_styles.tiles_container, this.border('#070f4e')] }>
                         <ListView  showsVerticalScrollIndicator ={false}
                                    initialListSize ={50}
                                    contentContainerStyle={ container_styles.listview }
                                    dataSource={this.state.dataSource}
                                    renderRow={(rowData) =>
                                     <View>
                                         <TouchableHighlight onPress={() => this.onSelect(rowData, moment().subtract(rowData + 1, 'days').format('MMMM D, YYYY'))}
                                                             underlayColor={rowData.bg_color}
                                                             style={[container_styles.launcher, this.getBorder(rowData), this.bg(rowData)]} >
                                             <Text  style={[ styles.daily_launcher_text, this.getTextColor(rowData) ] }>{moment().subtract(rowData + 1, 'days').format('M/D/YYYY')}</Text>
                                         </TouchableHighlight>
                                     </View>}
                         />
                    </View>


                         <View style={container_styles.center_text_view}>
                             <Text numberOfLines={5} style={container_styles.gripe_text}>{this.props.gripeText}</Text>
                         </View>

                    <View style={ container_styles.footer }>
                        <Text style={ styles.copyright }>Some fine print...</Text>
                    </View>
                 </View>
            </SideMenu>
        );
    }
}


var container_styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#09146d',
    },
    center_text_view: {
        flex: 1,
        width: width,
        flexDirection: 'column',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'center',
        position: 'absolute',
        padding: 20,
        top: height/2,
    },
    gripe_text: {
        color: '#e3e004',
        fontSize: 18,
    },
    listview: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    header: {
        flex: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: width,
        backgroundColor: '#09146d',
    },
    tiles_container: {
        flex: 45,
        backgroundColor: '#486bdd',
        paddingLeft: 6,
        paddingRight: 6,
        paddingTop: 15,
    },
    footer: {
        flex: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#09146d',
    },
    launcher: {
        width: TILE_WIDTH,
        borderRadius: BORDER_RADIUS,
        borderWidth: 1,
        margin: CELL_PADDING * 1/2,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
});

module.exports = DailyLaunch;
