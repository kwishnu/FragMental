import React, { Component, PropTypes } from 'react';
import { StyleSheet, Text, View, Image, TouchableHighlight, TouchableOpacity, ListView, BackAndroid, AsyncStorage, ActivityIndicator, Alert } from 'react-native';
import moment from 'moment';
import SectionHeader from '../components/SectionHeader';
import Button from '../components/Button';
import Meteor from 'react-native-meteor';
import configs from '../config/configs';

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
function shadeColor(color, percent) {
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
function formatData(data) {
        const headings = 'Daily Puzzles*My Puzzles*Available Puzzle Packs*Completed Puzzle Packs'.split('*');
        const keys = 'daily*mypack*forsale*solved'.split('*');
        const dataBlob = {};
        const sectionIds = [];
        const rowIds = [];
        for (let sectionId = 0; sectionId < headings.length; sectionId++) {
            const currentHead = headings[sectionId];
            const currentKey = keys[sectionId];
            const packs = data.filter((theData) => theData.type == currentKey && theData.show == 'true');
            if (packs.length > 0) {
                sectionIds.push(sectionId);
                dataBlob[sectionId] = { sectionTitle: currentHead };
                rowIds.push([]);
                for (let i = 0; i < packs.length; i++) {
                    const rowId = `${sectionId}:${i}`;
                    rowIds[rowIds.length - 1].push(rowId);
                    dataBlob[rowId] = packs[i];
                }
            }
        }
        return { dataBlob, sectionIds, rowIds };
    }
var InAppBilling = require("react-native-billing");
var Orientation = require('react-native-orientation');
var SideMenu = require('react-native-side-menu');
var Menu = require('../nav/menu');
var deepCopy = require('../data/deepCopy.js');
var fragData = require('../data/objPassed.js');
var styles = require('../styles/styles');
var {width, height} = require('Dimensions').get('window');
var CELL_WIDTH = Math.floor(width); // one tile's fraction of the screen width
var CELL_PADDING = Math.floor(CELL_WIDTH * .08); // 5% of the cell width...+
var TILE_WIDTH = (CELL_WIDTH - CELL_PADDING * 2);
var BORDER_RADIUS = CELL_PADDING * .3;
var KEY_daily_solved_array = 'solved_array';
var KEY_Color = 'colorKey';
var KEY_midnight = 'midnight';
var KEY_Premium = 'premiumOrNot';
var KEY_Puzzles = 'puzzlesKey';
var KEY_solvedTP = 'solvedTP';
var KEY_ratedTheApp = 'ratedApp';
var nowISO = moment().valueOf();
var launchDay = moment('2016 11', 'YYYY-MM');//December 1, 2016 (zero-based months)
var dayDiff = launchDay.diff(nowISO, 'days');//# of days since 12/1/2016
var daysToSkip = parseInt(dayDiff, 10) - 31;
var tonightMidnight = moment().endOf('day').valueOf();
var puzzleData = {};
var sArray = [];
var solvedTodayOrNot = false;


class PuzzleContents extends Component{
    constructor(props) {
        super(props);
        const getSectionData = (dataBlob, sectionId) => dataBlob[sectionId];
        const getRowData = (dataBlob, sectionId, rowId) => dataBlob[`${rowId}`];
        const ds = new ListView.DataSource({
          rowHasChanged: (r1, r2) => r1 !== r2,
          sectionHeaderHasChanged : (s1, s2) => s1 !== s2,
          getSectionData,
          getRowData,
        });
        const { dataBlob, sectionIds, rowIds } = formatData(this.props.puzzleData);

        this.state = {
            id: 'puzzles contents',
            isLoading: true,
            isOpen: false,
            todayFull: null,
            isPremium: this.props.isPremium,
            hasRated: 'false',
            puzzleData: this.props.puzzleData,
            dataSource: ds.cloneWithRowsAndSections(dataBlob, sectionIds, rowIds),
        };
        this.handleHardwareBackButton = this.handleHardwareBackButton.bind(this);
    }
    handleHardwareBackButton() {
        if (this.state.isOpen) {
            this.toggle();
            return true;
        }
    }
    componentDidMount() {
        Orientation.lockToPortrait();
        try {
            AsyncStorage.setItem(KEY_Puzzles, JSON.stringify(this.props.puzzleData));
        } catch (error) {
            window.alert('AsyncStorage error: ' + error.message);
        }
        puzzleData = this.state.puzzleData;
        var todayfull = moment().format('MMMM D, YYYY');
        this.setState({todayFull: todayfull});
        AsyncStorage.getItem(KEY_solvedTP).then((solvedTodays) => {
            if (solvedTodays !== null) {
                solvedTodayOrNot = (solvedTodays == 'true')?true:false;
            }else{
                solvedTodayOrNot = false;
                try {
                    AsyncStorage.setItem(KEY_solvedTP, 'false');//
                } catch (error) {
                    window.alert('AsyncStorage error: ' + error.message);
                }
            }
        });
        AsyncStorage.getItem(KEY_ratedTheApp).then((rated) => {
            if(rated == 'true'){this.setState({hasRated: rated})}
        });
        AsyncStorage.getItem(KEY_daily_solved_array).then((theArray) => {
            if (theArray !== null) {
              sArray = JSON.parse(theArray);
            } else {
                var solvedArray = new Array(30).fill('0');
                sArray = solvedArray;
                try {
                   AsyncStorage.setItem(KEY_daily_solved_array, JSON.stringify(solvedArray));
                } catch (error) {
                   window.alert('AsyncStorage error: ' + error.message);
                }
            }
            return AsyncStorage.getItem(KEY_midnight)
            }).then( (value) => {
            if (value !== null) {
                var storedMidnight = parseInt(JSON.parse(value), 10);
                var milliSecsOver = nowISO - storedMidnight;

                if(milliSecsOver > 0){//at least the next day, update daily solved array
                    solvedTodayOrNot = false;
                    var numDays = Math.ceil(milliSecsOver/86400000);
                    numDays=(numDays>30)?30:numDays;
                    for (var shiftArray=0; shiftArray<numDays; shiftArray++){
                        sArray.unshift('0');
                        sArray.pop();
                    }
                    try {
                        AsyncStorage.setItem(KEY_daily_solved_array, JSON.stringify(sArray));
                        AsyncStorage.setItem(KEY_midnight, JSON.stringify(tonightMidnight));
                        AsyncStorage.setItem(KEY_solvedTP, 'false');
                    } catch (error) {
                        window.alert('AsyncStorage error: ' + error.message);
                    }
                }
            } else {
                try {
                    AsyncStorage.setItem(KEY_midnight, JSON.stringify(tonightMidnight));
                } catch (error) {
                    window.alert('AsyncStorage error: ' + error.message);
                }
            }
            var ready = 'loaded';
            return ready;
        }).then((ready)=>{
            this.setState({isLoading: false});
        });
        if (this.props.connectionBool == false){
            Alert.alert('No Connection...', 'Sorry, an internet connection is required to load Daily Puzzles');
        }
    }
    componentWillUnmount(){
        BackAndroid.removeEventListener('hardwareBackPress', this.handleHardwareBackButton);
    }
    toggle() {
        this.setState({ isOpen: !this.state.isOpen });
        if (this.state.isOpen) {
            BackAndroid.addEventListener('hardwareBackPress', this.handleHardwareBackButton);
        } else {
            BackAndroid.removeEventListener('hardwareBackPress', this.handleHardwareBackButton);
        }
    }
    updateMenuState(isOpen) {
        this.setState({ isOpen: isOpen });
        if (isOpen) {
            BackAndroid.addEventListener('hardwareBackPress', this.handleHardwareBackButton);
        } else {
            BackAndroid.removeEventListener('hardwareBackPress', this.handleHardwareBackButton);
        }
    }
    onMenuItemSelected = (item) => {
            switch (item.link){
                case 'puzzles contents':
                    this.toggle();
                    break;
                case 'game board':
                    this.onSelect('16','Today\'s Puzzle', null);
                    break;
                case 'daily launcher':
                    if(this.props.isPremium == 'true'){
                        this.onSelect('18','Last Thirty Days', null);
                    }else{
                        this.onSelect('17','Last Three Days', null);
                    }
                    break;
                case 'app_intro':
                    this.props.navigator.push({
                        id: 'start scene',
                        passProps: {
                            destination: 'menu',
                            puzzleData: this.props.puzzleData,
                            introIndex: 1,
                            seenIntro: 'true'
                        }
                    });
                    break;
                case 'store':
                    var myPackArray = [];
                    var keepInList = [];

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
                    var myPackArray = [];
                    var keepInList = this.props.puzzleData[item.index].data;

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
                            puzzleData: this.props.puzzleData,
                        }
                    });
                    break;
                case 'about':
                    this.props.navigator.push({
                        id: 'about',
                        passProps: {
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
    lightBorder(color, type) {
        var lighterColor = shadeColor(color, 60);
        var bordWidth = (type == 'daily')? 1:6;
            return {
                borderColor: lighterColor,
                borderWidth: bordWidth,
            };
    }
    bg(colorSent) {
        var strToReturn=colorSent.replace(/\"/g, "");
        return {
            backgroundColor: strToReturn
        };

    }
    getTextColor(bg, index){
        var strToReturn = invertColor(bg, true);
        if(index == '16' && solvedTodayOrNot){
            strToReturn = '#555';
            return {
                color: strToReturn,
                fontWeight: 'bold'
            };
        }
        return {
            color: strToReturn,
        };
    }
    getTitle(title, numPuzzles){
        var appendNum = (parseInt(numPuzzles, 10) > 30)?' - ' + numPuzzles:'';
        var titleToReturn = (title.indexOf('*') > -1)?title.substring(1):title;
        titleToReturn = titleToReturn + appendNum;
        return titleToReturn;
    }
    startPurchase(itemName, itemID){
        InAppBilling.open()
        .then(() => InAppBilling.purchase(itemID))
        .then((details) => {
            this.props.navigator.replace({
                id: 'splash screen',
                passProps: {
                    motive: 'purchase',
                    packName: itemName
                }
            });
            console.log("You purchased: ", details)
            return InAppBilling.close()
        }).catch((err) => {
            console.log(err);
            return InAppBilling.close()
        });
    }
    onSelect(index, title, bg, productID) {
        if (title.indexOf('*') > -1){
            let theName = title.substring(1);
            this.startPurchase(theName, productID);
            return;
        }
        var theDestination = 'puzzle launcher';
        var theTitle = title;
        var gripeText = '';
        var useColors = '';
        var bgColorToSend = '';

        switch(title){
            case 'Today\'s Puzzle':
                theDestination = 'game board';
                this.props.navigator.replace({
                    id: 'game board',
                    passProps: {
                        puzzleData: this.props.puzzleData,
                        daily_solvedArray: sArray,
                        title: this.state.todayFull,
                        index: '0',
                        bgColor: '#09146d',
                        fromWhere: 'puzzles contents',
                        dataElement: index,
                        isPremium: this.state.isPremium,
                        hasRated: this.state.hasRated
                    },
                });
                return;
            case 'Last Three Days':
                gripeText = 'Purchase any puzzle pack and always have access here to the previous 30 days of FragMental puzzles!';
            case 'Last Thirty Days':  //fallthrough
                theDestination = 'daily launcher';
                theTitle = 'Daily Puzzles';
                this.props.navigator.replace({
                    id: theDestination,
                    passProps: {
                        puzzleData: this.props.puzzleData,
                        daily_solvedArray: sArray,
                        title: theTitle,
                        todayFull: this.state.todayFull,
                        gripeText: gripeText,
                        dataElement: index,
                        isPremium: this.state.isPremium,
                        hasRated: this.state.hasRated,
                        bgColor: '#09146d'
                    },
                });
                return;
            default://a puzzle pack launcher:
        }
        AsyncStorage.getItem(KEY_Color).then((colors) => {
            if (colors !== null) {
                useColors = colors;
            }else{
                useColors = 'true';
                try {
                    AsyncStorage.setItem(KEY_Color, useColors);//
                } catch (error) {
                    window.alert('AsyncStorage error: ' + error.message);
                }
            }
            bgColorToSend = (useColors == 'true')?bg:'#09146d';//#09146d default color
            this.props.navigator.replace({
                id: theDestination,
                passProps: {
                    puzzleData: this.props.puzzleData,
                    daily_solvedArray: sArray,
                    title: theTitle,
                    todayFull: this.state.todayFull,
                    gripeText: gripeText,
                    dataElement: index,
                    isPremium: this.state.isPremium,
                    hasRated: this.state.hasRated,
                    bgColor: bgColorToSend
                },
            });
        });
    }
    render() {
        const menu = <Menu onItemSelected={this.onMenuItemSelected} data = {this.props.puzzleData} />;
        if(this.state.isLoading == true){
            return(
                <View style={container_styles.loading}>
                    <ActivityIndicator style={container_styles.spinner} animating={true} size={'large'}/>
                </View>
            )
        }else{
            return (
                <SideMenu
                    menu={ menu }
                    isOpen={ this.state.isOpen }
                    onChange={ (isOpen) => this.updateMenuState(isOpen) }>

                    <View style={ [container_styles.container, this.border('#070f4e')] }>
                        <View style={ container_styles.header }>
                            <Button style={{left: height*.02}} onPress={ () => this.toggle() }>
                                <Image source={ require('../images/menu.png') } style={ { width: height*.08, height: height*.08 } } />
                            </Button>
                            <Image source={ require('../images/logo.png') } style={ { width: height/5, height: height/15 } } />
                            <Button style={{right: height*.02}}>
                                <Image source={ require('../images/no_image.png') } style={ { width: height*.08, height: height*.08 } } />
                            </Button>
                        </View>
                        <View style={ container_styles.puzzles_container }>
                             <ListView  showsVerticalScrollIndicator ={false}
                                        contentContainerStyle={ container_styles.listview }
                                        dataSource={this.state.dataSource}
                                        renderRow={(rowData) =>
                                             <View>
                                                 <TouchableHighlight onPress={() => this.onSelect(rowData.index, rowData.title, rowData.bg_color, rowData.product_id)}
                                                                     style={[container_styles.launcher, this.bg(rowData.bg_color), this.lightBorder(rowData.bg_color, rowData.type)]}
                                                                     underlayColor={rowData.bg_color} >
                                                     <Text style={[container_styles.launcher_text, this.getTextColor(rowData.bg_color, rowData.index)]}>{this.getTitle(rowData.title, rowData.num_puzzles)}</Text>
                                                 </TouchableHighlight>
                                             </View>
                                         }
                                         renderSectionHeader={(sectionData) => <SectionHeader {...sectionData} />}
                             />
                        </View>
                     </View>
                </SideMenu>
            );
        }
    }
}


var container_styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    spinner: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#486bdd'
    },
    listview: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 40
    },
    header: {
        flex: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: window.width,
        backgroundColor: '#060e4c',
    },
    puzzles_container: {
        flex: 48,
        backgroundColor: '#486bdd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    launcher: {
        width: TILE_WIDTH,
        height: TILE_WIDTH * .25,
        borderRadius: BORDER_RADIUS,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 6,
        marginBottom: 1,
    },
    launcher_text: {
        fontSize: configs.LETTER_SIZE * 0.75,
    },
});
module.exports = PuzzleContents;
