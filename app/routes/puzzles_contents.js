import React, { Component, PropTypes } from 'react';
import { StyleSheet, Text, View, Image, TouchableHighlight, TouchableOpacity, ListView, BackAndroid, AsyncStorage, ActivityIndicator, Alert, Vibration, AppState } from 'react-native';
import moment from 'moment';
import SectionHeader from '../components/SectionHeader';
import Button from '../components/Button';
import ContentsDialog from '../components/ContentsDialog';
import Meteor from 'react-native-meteor';
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
function invertColor(hex, bw) {
    if (hex.indexOf('#') == 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length == 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length != 6) {
        throw new Error('Invalid HEX color.');
    }
    let r = parseInt(hex.slice(0, 2), 16),
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
        let R = parseInt(color.substring(1,3),16);
        let G = parseInt(color.substring(3,5),16);
        let B = parseInt(color.substring(5,7),16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R<255)?R:255;
        G = (G<255)?G:255;
        B = (B<255)?B:255;

        let RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
        let GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
        let BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

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
let InAppBilling = require("react-native-billing");
let Orientation = require('react-native-orientation');
let SideMenu = require('react-native-side-menu');
let Menu = require('../nav/menu');
let deepCopy = require('../data/deepCopy.js');
let fragData = require('../data/objPassed.js');
let styles = require('../styles/styles');
const {width, height} = require('Dimensions').get('window');
const CELL_WIDTH = Math.floor(width); // one tile's fraction of the screen width
const CELL_PADDING = Math.floor(CELL_WIDTH * .08); // 5% of the cell width...+
const TILE_WIDTH = (CELL_WIDTH - CELL_PADDING * 2);
const BORDER_RADIUS = CELL_PADDING * .3;
const KEY_daily_solved_array = 'solved_array';
const KEY_show_score = 'showScoreKey';
const KEY_Score = 'scoreKey';
const KEY_NextBonus = 'bonusKey';
const KEY_Color = 'colorKey';
const KEY_midnight = 'midnight';
const KEY_Premium = 'premiumOrNot';
const KEY_Puzzles = 'puzzlesKey';
const KEY_Time = 'timeKey';
const KEY_solvedTP = 'solvedTP';
const KEY_ratedTheApp = 'ratedApp';
var puzzleData = [];
var sArray = [];
var solvedTodayOrNot = false;


class PuzzleContents extends Component{
    constructor(props) {
        super(props);
        var getSectionData = (dataBlob, sectionId) => dataBlob[sectionId];
        var getRowData = (dataBlob, sectionId, rowId) => dataBlob[`${rowId}`];
        var ds = new ListView.DataSource({
          rowHasChanged: (r1, r2) => r1 !== r2,
          sectionHeaderHasChanged : (s1, s2) => s1 !== s2,
          getSectionData,
          getRowData
        });
        var { dataBlob, sectionIds, rowIds } = formatData(this.props.puzzleData);
        this.state = {
            id: 'puzzles contents',
            isLoading: true,
            isOpen: false,
            shouldShowDialog: false,
            showFullDialog: true,
            moveToCompleted: 'true',
            strWhereToSend: '',
            strOpenPuzzles: '',
            openClose: true,
            indexSelected: 0,
            todayFull: null,
            isPremium: this.props.isPremium,
            hasRated: 'false',
            menuImage: require('../images/menu.png'),
            total_score: 0,
            total_opacity: 1,
            nextBonus: 0,
            puzzleData: this.props.puzzleData,
            dataSource: ds.cloneWithRowsAndSections(dataBlob, sectionIds, rowIds)
        };
        this.handleHardwareBackButton = this.handleHardwareBackButton.bind(this);
    }
    componentDidMount() {
        Orientation.lockToPortrait();
        AsyncStorage.getItem(KEY_NextBonus).then((nb) => {//get next bonus level, compare to current total score, send to Splash if needs to update
            this.setState({nextBonus: parseInt(nb, 10)});
            return AsyncStorage.getItem(KEY_Score);
        }).then((ts) => {//total score
            let myTotal = parseInt(ts, 10);
            this.setState({total_score: myTotal});
            if (myTotal > this.state.nextBonus){
                this.props.navigator.replace({
                    id: 'splash screen',
                    passProps: {motive: 'initialize'}
                });
            }
        });
        AppState.addEventListener('change', this.handleAppStateChange);
        var nowISO = moment().valueOf();
        var tonightMidnight = moment().endOf('day').valueOf();
        try {
            AsyncStorage.setItem(KEY_Puzzles, JSON.stringify(this.props.puzzleData));
            AsyncStorage.setItem(KEY_Time, JSON.stringify(nowISO));
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
                    AsyncStorage.setItem(KEY_solvedTP, 'false');
                } catch (error) {
                    window.alert('AsyncStorage error: ' + error.message);
                }
            }
            return AsyncStorage.getItem(KEY_ratedTheApp);
        }).then((rated) => {
            if(rated == 'true')this.setState({hasRated: rated});
            return AsyncStorage.getItem(KEY_show_score);
        }).then((showScore) => {
            if (showScore !== null) {
                this.setState({total_opacity: parseInt(showScore, 10)});
            }else{
                try {
                    AsyncStorage.setItem(KEY_show_score, '1');
                } catch (error) {
                    window.alert('AsyncStorage error: ' + error.message);
                }
            }
            return AsyncStorage.getItem(KEY_daily_solved_array);
        }).then((theArray) => {
            if (theArray !== null) {
              sArray = JSON.parse(theArray);
            } else {
                var solvedArray = new Array(31).fill('0');
                sArray = solvedArray;
                try {
                   AsyncStorage.setItem(KEY_daily_solved_array, JSON.stringify(solvedArray));
                } catch (error) {
                   window.alert('AsyncStorage error: ' + error.message);
                }
            }
            return AsyncStorage.getItem(KEY_midnight);
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
                return true;
            } else {
                try {
                    AsyncStorage.setItem(KEY_midnight, JSON.stringify(tonightMidnight));
                } catch (error) {
                    window.alert('AsyncStorage error: ' + error.message);
                }
                return true;
            }
        }).then((ready)=>{
            this.setState({isLoading: false});
        }).catch(function(error) {
            window.alert('p_c: ' + error.message);
        });
        if (this.props.connectionBool == false){
            Alert.alert('No Connection', 'Sorry, an internet connection is required to load Daily Puzzles');
        }
    }
    componentWillUnmount(){
        BackAndroid.removeEventListener('hardwareBackPress', this.handleHardwareBackButton);
        AppState.removeEventListener('change', this.handleAppStateChange);
    }
    handleHardwareBackButton() {
        if (this.state.isOpen) {
            this.toggle();
            return true;
        }
        if(this.state.shouldShowDialog){
            this.setState({ shouldShowDialog: false });
            return true;
        }
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
                        passProps: {motive: 'initialize'}
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
            this.setState({menuImage: require('../images/arrow_back.png')});
            BackAndroid.addEventListener('hardwareBackPress', this.handleHardwareBackButton);
        } else {
            AsyncStorage.getItem(KEY_show_score).then((showScore) => {
                this.setState({total_opacity: parseInt(showScore, 10)});
            });
            this.setState({menuImage: require('../images/menu.png')});
            BackAndroid.removeEventListener('hardwareBackPress', this.handleHardwareBackButton);
        }
    }
    onMenuItemSelected = (item) => {
            var myPackArray = [];
            var keepInList = [];
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
                            puzzleData: puzzleData,
                            introIndex: 1,
                            seenIntro: 'true'
                        }
                    });
                    break;
                case 'store':
                    for (var j=0; j<puzzleData.length; j++){
                        if (puzzleData[j].type == 'mypack'){
                            myPackArray.push(puzzleData[j].title);
                        }
                    }
                    for (var i=puzzleData[item.index].data.length - 1; i>=0; i--){
                        if(myPackArray.indexOf(puzzleData[item.index].data[i].name) < 0){
                            keepInList.push(puzzleData[item.index].data[i]);
                        }
                    }
                    keepInList = shuffleArray(keepInList);
                    this.props.navigator.push({
                        id: 'store',
                        passProps: {
                            dataIndex: item.index,
                            title: item.title + ' Puzzle Packs',
                            availableList: keepInList,
                            puzzleData: puzzleData,
                        }
                    });
                    break;
                case 'store3':
                    if(puzzleData[item.index].data.length == 0){
                        Alert.alert('Coming soon...', 'Sorry, no combo packs available yet; please check back!');
                        return;
                    }
                    keepInList = puzzleData[item.index].data;
                    for (var j=0; j<puzzleData.length; j++){
                        if (puzzleData[j].type == 'mypack'){
                            myPackArray.push(puzzleData[j].title);
                        }
                    }
                    for (var i=puzzleData[item.index].data.length - 1; i>=0; i--){
                        if((myPackArray.indexOf(puzzleData[item.index].data[i].name[0]) > -1) && (myPackArray.indexOf(puzzleData[item.index].data[i].name[1]) > -1) && (myPackArray.indexOf(puzzleData[item.index].data[i].name[2]) > -1)){
                            keepInList.splice(i, 1);
                        }
                    }
                    this.props.navigator.push({
                        id: 'combo store',
                        passProps: {
                            dataIndex: item.index,
                            title: item.title + ' Value Packs',
                            availableList: keepInList,
                            puzzleData: puzzleData,
                        }
                    });
                    break;
                case 'facebook':
                    this.props.navigator.push({
                        id: 'social',
                        passProps: {
                            which: 'FB',
                            color: '#3b5998',
                            puzzleData: puzzleData,
                        }
                    });
                    break;
                case 'twitter'://#1da1f2
                    this.props.navigator.push({
                        id: 'social',
                        passProps: {
                            which: 'TW',
                            color: '#1da1f2',
                            puzzleData: puzzleData,
                        }
                    });
                    break;
                case 'settings':
                    this.props.navigator.push({
                        id: 'settings',
                        passProps: {
                            puzzleData: puzzleData,
                        }
                    });
                    break;
                case 'about':
                    this.props.navigator.push({
                        id: 'about',
                        passProps: {
                            puzzleData: puzzleData,
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
        var bordWidth = (type == 'daily')? 1:2;
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
    getTitle(title, numPuzzles, index){
        var appendNum = (parseInt(index, 10) > 19)?'  ' + numPuzzles:'';
        var titleToReturn = (title.indexOf('*') > -1)?title.substring(1):title;
        titleToReturn = titleToReturn + appendNum;
        return titleToReturn;
    }
    onSelect(index, title, bg, productID) {
        if (title.indexOf('*') > -1){
            var theName = title.substring(1);
            var myPackArray = [];
            var keepInList = [];
            var theIndex = '';
            var titlePrefix = '';
            var gotIt = false;
            var itemIndex = 0;
            for (var j=0; j<puzzleData.length; j++){
                if (puzzleData[j].type == 'mypack'){
                    myPackArray.push(puzzleData[j].title);
                }
                if (!gotIt && puzzleData[j].link == 'store'){
                    for (var k=0; k<puzzleData[j].data.length; k++){
                        if(puzzleData[j].data[k].name == theName){
                            theIndex = puzzleData[j].index;
                            gotIt = true;
                            continue;
                        }
                    }
                }
            }
            switch(theIndex){
                case '3':
                    titlePrefix = 'Easy';
                    break;
                case '4':
                    titlePrefix = 'Moderate';
                    break;
                case '5':
                    titlePrefix = 'Hard';
                    break;
                case '6':
                    titlePrefix = 'Theme';
                    break;
            }
            for (var i=puzzleData[parseInt(theIndex, 10)].data.length - 1; i>=0; i--){
                if(myPackArray.indexOf(puzzleData[parseInt(theIndex, 10)].data[i].name) < 0){
                    keepInList.push(puzzleData[parseInt(theIndex, 10)].data[i]);
                }
            }
            var putMeBack = null;
            for(var whatsLeft = 0; whatsLeft<keepInList.length; whatsLeft++){
                if(keepInList[whatsLeft].name == theName){
                    putMeBack = keepInList.splice(whatsLeft, 1);
                    continue;
                }
            }
            keepInList = shuffleArray(keepInList);
            keepInList.unshift(putMeBack[0]);
            this.props.navigator.push({
                id: 'store',
                passProps: {
                    dataIndex: theIndex,
                    title: titlePrefix + ' Puzzle Packs',
                    availableList: keepInList,
                    puzzleData: puzzleData,
                }
            });
            this.toggle();
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
                        puzzleData: puzzleData,
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
                        puzzleData: puzzleData,
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
        }
        AsyncStorage.getItem(KEY_Color).then((colors) => {//a puzzle pack launcher:
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
                    puzzleData: puzzleData,
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
    showDialog(index, type){
        if(index < 19)return;
        Vibration.vibrate(25);
        BackAndroid.addEventListener('hardwareBackPress', this.handleHardwareBackButton);
        if(type == 'mypack' || type == 'solved'){
            let strSolvedOrNot = (type == 'solved')?'Move to My Puzzles':'Move to Completed';
            let sendToCompleted = (type == 'solved')?'false':'true';
            let strOpenOrClose = (parseInt(puzzleData[index].num_solved, 10) < parseInt(puzzleData[index].num_puzzles, 10))?'Open all puzzles':'Open first only';
            let openOrClose = (strOpenOrClose == 'Open all puzzles')? true:false;

            this.setState({ shouldShowDialog: true,
                            showFullDialog: true,
                            strWhereToSend: strSolvedOrNot,
                            moveToCompleted: sendToCompleted,
                            indexSelected: index,
                            strOpenPuzzles: strOpenOrClose,
                            openClose: openOrClose
            });
        }else{
            this.setState({ shouldShowDialog: true,
                            showFullDialog: false
            });
        }
    }
    onDialogSelect(which){
        this.setState({ shouldShowDialog: false });
        var getSectionData = (dataBlob, sectionId) => dataBlob[sectionId];
        var getRowData = (dataBlob, sectionId, rowId) => dataBlob[`${rowId}`];
        var ds = new ListView.DataSource({
          rowHasChanged: (r1, r2) => r1 !== r2,
          sectionHeaderHasChanged : (s1, s2) => s1 !== s2,
          getSectionData,
          getRowData
        });
        switch(which){
            case 0://touch outside of dropdown, just close
                return;
            case 1:
                let whatToCallIt = (this.state.moveToCompleted == 'true')?'solved':'mypack';
                puzzleData[this.state.indexSelected].type = whatToCallIt;
                break;
            case 2:
                if(this.state.openClose){
                    puzzleData[this.state.indexSelected].num_solved = puzzleData[this.state.indexSelected].num_puzzles;
                }else{
                    puzzleData[this.state.indexSelected].num_solved = '0';
                }
                break;
            case 3:
                puzzleData[this.state.indexSelected].show = 'false';
                break;
            case 4:
                for (let showPuzzles=19; showPuzzles<puzzleData.length; showPuzzles++){
                    puzzleData[showPuzzles].show = 'true';
                }
                break;
           }
            try {
                AsyncStorage.setItem(KEY_Puzzles, JSON.stringify(puzzleData));
            } catch (error) {
                window.alert('AsyncStorage error: ' + error.message);
            }
            var { dataBlob, sectionIds, rowIds } = formatData(puzzleData);
            this.setState({ puzzleData: puzzleData,
                            dataSource: ds.cloneWithRowsAndSections(dataBlob, sectionIds, rowIds)
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
                <SideMenu menu={ menu } isOpen={ this.state.isOpen } onChange={ (isOpen) => this.updateMenuState(isOpen) }>
                    <View style={ [container_styles.container, this.border('#070f4e')] }>
                        <View style={ container_styles.header }>
                            <Button style={{left: height*.02}} onPress={ () => this.toggle() }>
                                <Image source={this.state.menuImage} style={ { width: normalize(height/15), height: normalize(height/15) } } />
                            </Button>
                            <Image source={ require('../images/logo2.png') } style={ { width: normalize(height * .25), height: normalize(height * .06) } } />
                            <Button style={{right: height*.02}}>
                                <Image source={ require('../images/no_image.png') } style={ { width: normalize(height/15), height: normalize(height/15) } } />
                            </Button>
                            <View style={ container_styles.total_score }>
                                <Text style={[container_styles.total_text, {opacity: this.state.total_opacity}]}>Score:</Text>
                                <Text style={[container_styles.total_text, {opacity: this.state.total_opacity}]}>{this.state.total_score.toLocaleString()}</Text>
                            </View>
                        </View>
                        <View style={ container_styles.puzzles_container }>
                             <ListView  showsVerticalScrollIndicator ={false}
                                        contentContainerStyle={ container_styles.listview }
                                        dataSource={this.state.dataSource}
                                        renderRow={(rowData) =>
                                             <View>
                                                 <TouchableHighlight onPress={() => this.onSelect(rowData.index, rowData.title, rowData.bg_color, rowData.product_id)}
                                                                     onLongPress={()=> this.showDialog(rowData.index, rowData.type)}
                                                                     style={[container_styles.launcher, this.bg(rowData.bg_color), this.lightBorder(rowData.bg_color, rowData.type)]}
                                                                     underlayColor={rowData.bg_color} >
                                                     <Text style={[container_styles.launcher_text, this.getTextColor(rowData.bg_color, rowData.index)]}>{this.getTitle(rowData.title, rowData.num_puzzles, rowData.index)}</Text>
                                                 </TouchableHighlight>
                                             </View>
                                         }
                                         renderSectionHeader={(sectionData) => <SectionHeader {...sectionData} />}
                             />
                        </View>
                        {this.state.shouldShowDialog &&
                                <ContentsDialog showFull={this.state.showFullDialog} onPress={(num)=>{ this.onDialogSelect(num); }} item1={this.state.strWhereToSend} item2={this.state.strOpenPuzzles} item3={'Hide from Contents'} item4={'Show hidden packs'} />
                        }
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
    total_score: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'flex-end',
        right: 10,
        top: 10,
        width: width/3,
        height: configs.LETTER_SIZE
    },
    total_text: {
        fontSize: normalizeFont(configs.LETTER_SIZE * 0.054),
        color: '#ffffff'
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
        fontSize: normalizeFont(configs.LETTER_SIZE * 0.1),
    }
});

module.exports = PuzzleContents;
