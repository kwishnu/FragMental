import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableHighlight, ListView, BackAndroid, AsyncStorage, ActivityIndicator, AppState } from 'react-native';
import moment from 'moment';
import Button from '../components/Button';
import configs from '../config/configs';
import { normalize }  from '../config/pixelRatio';
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
function shadeColor(color, percent) {
    percent = percent/100;
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}
function invertColor(hex, bw) {
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
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}
var deepCopy = require('../data/deepCopy.js');
var fragData = require('../data/objPassed.js');
var SideMenu = require('react-native-side-menu');
var Menu = require('../nav/menu');
var puzzleData = {};
const styles = require('../styles/styles');
const {width, height} = require('Dimensions').get('window');
const NUM_WIDE = 5;
const CELL_WIDTH = Math.floor(width/NUM_WIDE); // one tile's fraction of the screen width
const CELL_PADDING = Math.floor(CELL_WIDTH * .05) + 5; // 5% of the cell width...+
const TILE_WIDTH = (CELL_WIDTH - CELL_PADDING * 2) - 7;
const BORDER_RADIUS = CELL_PADDING * .2 + 3;
const KEY_daily_solved_array = 'solved_array';
const KEY_Time = 'timeKey';

class PuzzleLaunch extends Component{
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            id: 'puzzle launcher',
            puzzleData: this.props.puzzleData,
            dataElement: this.props.dataElement,
            title: this.props.title,
            isOpen: false,
            dataSource: ds.cloneWithRows(Array.from(new Array(parseInt(this.props.puzzleData[this.props.dataElement].num_puzzles, 10)), (x,i) => i)),
            bgColor: this.props.bgColor,
            headerColor: '',
            titleColor: '',
            isLoading: true,
        };
        this.handleHardwareBackButton = this.handleHardwareBackButton.bind(this);
    }
    componentDidMount() {
        puzzleData = this.state.puzzleData;
        this.setColors();
        AppState.addEventListener('change', this.handleAppStateChange);
        BackAndroid.addEventListener('hardwareBackPress', this.handleHardwareBackButton);
        setTimeout(() => {this.stopSpinner()}, 10);
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
                }else{
                    try {
                        AsyncStorage.setItem(KEY_Time, JSON.stringify(timeNow));
                    } catch (error) {
                        window.alert('AsyncStorage error: ' + error.message);
                    }
                }
            });
        }
    }
    stopSpinner(){
        this.setState({isLoading: false});
    }
    setColors(){
        var bgC = this.props.bgColor;//
        var fieldColor = shadeColor(bgC, 10);
        var headColor =  shadeColor(bgC, -20);
        var titletextColor = invertColor(headColor, true);
        titletextColor = (bgC == '#09146d')?'#e3e004':titletextColor;

        this.setState({
            bgColor: fieldColor,
            headerColor: headColor,
            titleColor: titletextColor,
        });
    }
    handleHardwareBackButton() {
        if (this.state.isOpen) {
            this.toggle();
            return true;
        }else{
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
                var rnd = Array.from(new Array(puzzleData[levels[i]].data.length), (x,i) => i);
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
            try {
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
                            isPremium: this.props.isPremium
                        },
                    });
                    return;
                case 'daily launcher':
                    if(this.props.isPremium == 'true'){
                        this.goToDaily('18');
                    }else{
                        this.goToDaily('17');
                    }
                    break;
                case 'app_intro':
                    this.props.navigator.push({
                        id: 'start scene',
                        passProps: {
                            destination: 'puzzle launcher',
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
                            destination: 'puzzle launcher',
                            puzzleData: this.props.puzzleData,
                        }
                    });
                    break;
                case 'about':
                    this.props.navigator.push({
                        id: 'about',
                        passProps: {
                            destination: 'puzzle launcher',
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
    darkBorder(color) {
        var darkerColor = shadeColor(color, -60);
            return {borderColor: darkerColor};
    }
    bg(num){
         var strToReturn='';
         var onThis = parseInt(this.props.puzzleData[this.props.dataElement].num_solved, 10);
         var numPuzzles = parseInt(this.props.puzzleData[this.props.dataElement].num_solved, 10);
         if (onThis = numPuzzles){
            strToReturn = (this.props.puzzleData[this.props.dataElement].solved[num] == 0)?'#00FF00':'#079707';
            return {
                backgroundColor: strToReturn
            };
         }
         if(num==onThis){
             strToReturn='#00FF00';
             }else if(num<onThis){
             strToReturn='#079707';
             }else{
             strToReturn='#999ba0';
         }
         return {
             backgroundColor: strToReturn
         };
    }
    getUnderlay(num){
         var strToReturn='';
         var onThis = parseInt(this.props.puzzleData[this.props.dataElement].num_solved, 10);
         var numPuzzles = parseInt(this.props.puzzleData[this.props.dataElement].num_solved, 10);
         if (onThis = numPuzzles){
            strToReturn = (this.props.puzzleData[this.props.dataElement].solved[num] == 0)?'#00FF00':'#079707';
            return {
                backgroundColor: strToReturn
            };
         }
         if(num==onThis){
             strToReturn='#00FF00';
             }else if(num<onThis){
             strToReturn='#079707';
             }else{
             strToReturn='#999ba0';
             }

         return strToReturn;
    }
    getBorder(num){
         var strToReturn='';
         var onThis = parseInt(this.props.puzzleData[this.props.dataElement].num_solved, 10);
         var numPuzzles = parseInt(this.props.puzzleData[this.props.dataElement].num_solved, 10);
         if (onThis = numPuzzles){
            strToReturn = (this.props.puzzleData[this.props.dataElement].solved[num] == 0)?'#00FF00':'#00a700';
            return {
                backgroundColor: strToReturn
            };
         }
         if(num==onThis){
             strToReturn='#0F0';
             }else if(num<onThis){
                 strToReturn='#00a700';
             }else{
                 strToReturn='#7e867e';
             }
         return {borderColor: strToReturn};
    }
    goToDaily(index){
        var sArray = [];
        var gripeText = (this.props.isPremium == 'true')?'':'Purchase any puzzle pack and always have access here to the last 30 days of FragMental puzzles!';

        AsyncStorage.getItem(KEY_daily_solved_array).then((theArray) => {
            if (theArray !== null) {
              sArray = JSON.parse(theArray);
            }
            this.props.navigator.replace({
                id: 'daily launcher',
                passProps: {
                    puzzleData: this.props.puzzleData,
                    daily_solvedArray: sArray,
                    title: 'Daily Puzzles',
                    todayFull: this.props.todayFull,
                    gripeText: gripeText,
                    dataElement: index,
                    isPremium: this.state.isPremium,
                    bgColor: '#09146d'
                },
            });
        });
    }
    onSelect(index) {
        if(index>parseInt(this.props.puzzleData[this.props.dataElement].num_solved, 10))return;
        this.props.navigator.replace({
            id: 'game board',
            passProps: {
                puzzleData: this.state.puzzleData,
                title: index + 1,
                index: index,
                fromWhere: 'puzzle launcher',
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
        if(this.state.isLoading == true){
            return(
                <View style={[container_styles.loading, {backgroundColor: this.props.bgColor}]}>
                    <ActivityIndicator animating={true} size={'large'}/>
                </View>
            )
        }else{
            return (
                <SideMenu
                    menu={ menu }
                    isOpen={ this.state.isOpen }
                    onChange={ (isOpen) => this.updateMenuState(isOpen) }>

                    <View style={ [container_styles.container, {backgroundColor: this.state.bgColor}, this.darkBorder(this.state.bgColor)] }>
                        <View style={ [container_styles.header, {backgroundColor: this.state.headerColor}]}>
                            <Button style={{left: height*.02}} onPress={ () => this.handleHardwareBackButton() }>
                                <Image source={ require('../images/arrow_back.png') } style={ { width: normalize(height*0.07), height: normalize(height*0.07) } } />
                            </Button>
                            <Text style={{fontSize: configs.LETTER_SIZE * 0.7, color: this.state.titleColor}} >{this.props.title}</Text>
                            <Button style={{right: height*.02}}>
                                <Image source={ require('../images/no_image.png') } style={ { width: normalize(height*0.07), height: normalize(height*0.07) } } />
                            </Button>
                        </View>
                        <View style={ [container_styles.tiles_container, {backgroundColor: this.state.bgColor}, this.darkBorder(this.state.bgColor)] }>
                             <ListView  showsVerticalScrollIndicator ={false}
                                        initialListSize ={100}
                                        contentContainerStyle={ container_styles.listview }
                                        dataSource={this.state.dataSource}
                                        renderRow={(rowData) =>
                                         <View>
                                             <TouchableHighlight onPress={() => this.onSelect(rowData)}
                                                                 underlayColor={() => this.getUnderlay(rowData)}
                                                                 style={[container_styles.launcher, this.getBorder(rowData), this.bg(rowData)]} >
                                                 <Text style={ styles.puzzle_text_large }>{rowData + 1}</Text>
                                             </TouchableHighlight>
                                         </View>}
                             />
                        </View>
                     </View>
                </SideMenu>
            );
        }
    }
}


const container_styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listview: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
    },
    tiles_container: {
        flex: 11,
        paddingLeft: 6,
        paddingRight: 6,
    },
    header: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: window.width,
    },
    launcher: {
        width: TILE_WIDTH,
        height: TILE_WIDTH,
        borderRadius: BORDER_RADIUS,
        borderWidth: 1,
        margin: CELL_PADDING,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

module.exports = PuzzleLaunch;
