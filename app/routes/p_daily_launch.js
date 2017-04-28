import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableHighlight, ListView, BackAndroid, Animated, AsyncStorage, AppState } from 'react-native';
import moment from 'moment';
import Button from '../components/Button';
import configs from '../config/configs';
import { normalize, normalizeFont }  from '../config/pixelRatio';
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
function randomNum(low, high) {
    high++;
    return Math.floor((Math.random())*(high-low))+low;
}
var puzzleData = {};
var deepCopy = require('../data/deepCopy.js');
var fragData = require('../data/objPassed.js');
const SideMenu = require('react-native-side-menu');
const Menu = require('../nav/menu');
const styles = require('../styles/styles');
const {width, height} = require('Dimensions').get('window');
const NUM_WIDE = 3;
const CELL_WIDTH = Math.floor(width/NUM_WIDE); // one tile's fraction of the screen width
const CELL_PADDING = Math.floor(CELL_WIDTH * .05); // 5% of the cell width...+
const TILE_WIDTH = (CELL_WIDTH - CELL_PADDING * 2) - 7;
const BORDER_RADIUS = CELL_PADDING * .2 + 3;
const KEY_Time = 'timeKey';


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
            dataSource: ds.cloneWithRows(Array.from(new Array(parseInt(this.props.puzzleData[this.props.dataElement].num_puzzles, 10)), (x,i) => i))//[0,1,2...]
        };
        this.handleHardwareBackButton = this.handleHardwareBackButton.bind(this);
    }
    componentDidMount() {
        puzzleData = this.state.puzzleData;
        AppState.addEventListener('change', this.handleAppStateChange);
        BackAndroid.addEventListener('hardwareBackPress', this.handleHardwareBackButton);
    }
    componentWillUnmount () {
        BackAndroid.removeEventListener('hardwareBackPress', this.handleHardwareBackButton);
        AppState.removeEventListener('change', this.handleAppStateChange);
    }
    handleAppStateChange=(appState)=>{
        if(appState == 'active'){
            var timeNow = moment().valueOf();
            AsyncStorage.getItem(KEY_Time).then((storedTime) => {
                var sT = JSON.parse(storedTime);
                var diff = (timeNow - sT)/1000;
                if(diff>7200){
                    try {
                        AsyncStorage.setItem(KEY_Time, JSON.stringify(timeNow));
                    } catch (error) {
                        window.alert('AsyncStorage error: ' + error.message);
                    }
                    this.props.navigator.replace({
                        id: 'splash screen',
                        passProps: {
                            motive: 'initialize'
                        }
                    });

                }
            });
        }
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
                for(var i=0; i<4; i++){
                    var titleIndex = -1;
                    var rnd = Array.from(new Array(parseInt(puzzleData[levels[i]].data.length, 10)), (x,i) => i);
                    rnd = shuffleArray(rnd);
                    for (var r=0; r<puzzleData[levels[i]].data.length; r++){
                        if (myPackArray.indexOf(puzzleData[levels[i]].data[rnd[r]].name) < 0){
                            titleIndex = rnd[r];
                            break;
                        }
                    }
                    if (titleIndex !== -1){
                        puzzleData[20 + i].title = '*' + puzzleData[levels[i]].data[titleIndex].name;
                        puzzleData[20 + i].product_id = puzzleData[levels[i]].data[titleIndex].product_id;
                        puzzleData[20 + i].num_puzzles = puzzleData[levels[i]].data[titleIndex].num_puzzles;
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
            var myPackArray = [];
            var keepInList = [];
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
                            isPremium: this.state.isPremium,
                            hasRated: this.props.hasRated
                        },
                    });
                    return;
                case 'daily launcher':
                    this.toggle();
                    break;
                case 'app_intro':
                    this.props.navigator.push({
                        id: 'start scene',
                        passProps: {
                            destination: 'daily launcher',
                            puzzleData: this.props.puzzleData,
                            introIndex: 1,
                            seenIntro: 'true'
                        }
                    });
                    break;
                case 'store':
                    for (var j=0; j<this.props.puzzleData.length; j++){
                        if (this.props.puzzleData[j].type == 'mypack'){
                            myPackArray.push(this.props.puzzleData[j].title);
                        }
                    }
                    for (var i=this.props.puzzleData[item.index].data.length - 1; i>=0; i--){
                        if(myPackArray.indexOf(this.props.puzzleData[item.index].data[i].name) < 0){
                            keepInList.push(this.props.puzzleData[item.index].data[i]);
                        }
                    }
                    keepInList = keepInList.reverse();
                    this.props.navigator.push({
                        id: 'store',
                        passProps: {
                            dataIndex: item.index,
                            title: item.title + ' Puzzle Packs',
                            availableList: keepInList,
                            puzzleData: this.props.puzzleData,
                        }
                    });
                    break;
                case 'store3':
                    if(this.props.puzzleData[item.index].data.length == 0){
                        Alert.alert('Coming soon...', 'Sorry, no combo packs available yet; please check back!');
                        return;
                    }
                    keepInList = this.props.puzzleData[item.index].data;
                    for (var j=0; j<this.props.puzzleData.length; j++){
                        if (this.props.puzzleData[j].type == 'mypack'){
                            myPackArray.push(this.props.puzzleData[j].title);
                        }
                    }
                    for (var i=this.props.puzzleData[item.index].data.length - 1; i>=0; i--){
                        if((myPackArray.indexOf(this.props.puzzleData[item.index].data[i].name[0]) > -1) && (myPackArray.indexOf(this.props.puzzleData[item.index].data[i].name[1]) > -1) && (myPackArray.indexOf(this.props.puzzleData[item.index].data[i].name[2]) > -1)){
                            keepInList.splice(i, 1);
                        }
                    }
                    this.props.navigator.push({
                        id: 'combo store',
                        passProps: {
                            dataIndex: item.index,
                            title: item.title + ' Value Packs',
                            availableList: keepInList,
                            puzzleData: this.props.puzzleData,
                        }
                    });
                    break;
                case 'facebook':
                    this.props.navigator.push({
                        id: 'social',
                        passProps: {
                            which: 'FB',
                            color: '#3b5998',
                            puzzleData: this.props.puzzleData,
                        }
                    });
                    break;
                case 'twitter'://#1da1f2
                    this.props.navigator.push({
                        id: 'social',
                        passProps: {
                            which: 'TW',
                            color: '#1da1f2',
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
         if (this.props.daily_solvedArray[num + 1]==0){
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
         if (this.props.daily_solvedArray[num + 1]==0){
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
         if (this.props.daily_solvedArray[num + 1]==0){
             strToReturn='#079707';//green
             }else{
             strToReturn='#999ba0';//grey
             }
         return strToReturn;
    }
    getBorder(num){
         var strToReturn='';
         if (this.props.daily_solvedArray[num + 1]==0){
             strToReturn='#00ff00';//green
             }else{
             strToReturn='#000000';//black
             }
         return {
         borderColor: strToReturn
         };
    }
    onSelect(index, date) {
        this.props.navigator.replace({
            id: 'game board',
            passProps: {
                puzzleData: this.state.puzzleData,
                title: date,
                index: index,
                fromWhere: 'daily launcher',
                daily_solvedArray: this.props.daily_solvedArray,
                dataElement: this.props.dataElement,
                isPremium: this.state.isPremium,
                hasRated: this.props.hasRated,
                bgColor: this.props.bgColor,
                myTitle: this.props.title
            },
       });
    }

    render() {
        const menu = <Menu onItemSelected={ this.onMenuItemSelected } data = {this.props.puzzleData} />;
        return (
            <SideMenu   menu={ menu }
                        isOpen={ this.state.isOpen }
                        onChange={ (isOpen) => this.updateMenuState(isOpen) }>
                <View style={ [container_styles.container, this.border('#070f4e')] }>
                    <View style={ container_styles.header }>
                        <Button style={{left: 10}} onPress={ () => this.handleHardwareBackButton() }>
                            <Image source={ require('../images/arrow_back.png') } style={ { width: normalize(height*0.07), height: normalize(height*0.07) } } />
                        </Button>
                        <Text style={styles.header_text} >{this.props.title}</Text>
                        <Button style={{right: 15}}>
                            <Image source={ require('../images/no_image.png') } style={ { width: normalize(height*0.07), height: normalize(height*0.07) } } />
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
                                                     underlayColor={this.getUnderlay(rowData)}
                                                     style={[container_styles.launcher, this.getBorder(rowData), this.bg(rowData)]} >
                                     <Text  style={[ styles.daily_launcher_text, this.getTextColor(rowData) ] }>{moment().subtract(rowData + 1, 'days').format('M/D/YYYY')}</Text>
                                 </TouchableHighlight>
                             </View>}
                         />
                    </View>
                    <View style={container_styles.center_text_view}>
                        <Text numberOfLines={5} style={container_styles.gripe_text}>{this.props.gripeText}</Text>
                    </View>
                </View>
            </SideMenu>
        );
    }
}


const container_styles = StyleSheet.create({
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
        padding: height/12,
        top: height/2,
    },
    gripe_text: {
        color: '#e3e004',
        fontSize: normalizeFont(configs.LETTER_SIZE * 0.09),
        textAlign: 'center',
    },
    listview: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    header: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: width,
        backgroundColor: '#09146d',
    },
    tiles_container: {
        flex: 11,
        backgroundColor: '#486bdd',
        paddingLeft: 6,
        paddingRight: 6,
        paddingTop: 15,
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
