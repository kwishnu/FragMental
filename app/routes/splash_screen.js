import React, {Component} from 'react';
import { View, Image, StyleSheet, NetInfo, AsyncStorage, ActivityIndicator, StatusBar } from 'react-native';
import Meteor from 'react-native-meteor';
import moment from 'moment';
import PushNotification from 'react-native-push-notification';
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
var InAppBilling = require('react-native-billing');
var seedPuzzleData = require('../data/data.js');
var seenStart = false;
var ready = false;
var nowISO = 0;
var tonightMidnight = 0;
const bonuses = [['500', 'Welcome +500', '3', '#620887'], ['1500', 'Achiever +1500', '5', '#f4ce57'], ['2500', 'Talented +2500', '10', '#f2404c'], ['5000', 'Skilled +5000', '10', '#0817a2'], ['7500', 'Seasoned +7500', '10', '#6e097d'], ['10000', 'Expert +10,000', '10', '#f5eaf6'], ['100000000000', 'TooMuch', '1', '#000000']];
const KEY_Premium = 'premiumOrNot';
const KEY_Puzzles = 'puzzlesKey';
const KEY_SeenStart = 'seenStartKey';
const KEY_Notifs = 'notifsKey';
const KEY_NotifTime = 'notifTimeKey';
const KEY_Score = 'scoreKey';
const KEY_NextBonus = 'bonusKey';
const {width, height} = require('Dimensions').get('window');
import { normalize }  from '../config/pixelRatio';
//'ws://52.52.199.138:80/websocket'; <= bbg3...publication AllData, collections data, data1, data2, details, puzzles, text, users; PuzzApp
//'ws://52.52.205.96:80/websocket'; <= Publications...publication AllData, collections dataA...dataZ; MeteorApp
//'ws://10.0.0.207:3000/websocket'; <= localhost
var METEOR_URL = 'ws://52.52.205.96:80/websocket';

class SplashScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 'splash screen',
            seenStart: 'false',
            notif_time: '',
            hasPremium: 'false',
            connectionBool: true,
            isLoading: true,
            getPurchased: false,
            nextBonus: '0',
            totalScore: '0',
            pData: []
        };
    }
    componentDidMount() {
        Meteor.connect(METEOR_URL);
        StatusBar.setHidden(true);
        var puzzleData = [];
        nowISO = moment().valueOf();//determine offset # of days for daily puzzles...
        tonightMidnight = moment().endOf('day').valueOf();
        var launchDay = moment('2017 04', 'YYYY-MM');//April 1, 2017
        var dayDiff = -launchDay.diff(nowISO, 'days');//# of days since 4/1/2017
        var startNum = dayDiff - 28;
        if(this.props.motive == 'initialize'){
            var ownedPacks = [];
            var getPurchasedBool = true;
            var premiumBool = 'false';
            InAppBilling.close()//docs recommend making sure IAB is closed first
            .then(() => InAppBilling.open())
            .then(() => InAppBilling.listOwnedProducts())//get array of purchased items from the store
            .then((details) => {
                ownedPacks = details;
                return InAppBilling.close();
            }).then(()=> {
                return AsyncStorage.getItem(KEY_Puzzles);
            }).then((puzzles) => {
                if (puzzles !== null) {//get current Puzzle data:
                    puzzleData = JSON.parse(puzzles);
                }else{//store seed Puzzle data, as this is the first time using the app:
                    puzzleData = seedPuzzleData;
                    try {
                        AsyncStorage.setItem(KEY_Puzzles, JSON.stringify(seedPuzzleData));
                    } catch (error) {
                        window.alert('AsyncStorage error: ' + error.message);
                    }
                }
                if (puzzleData.length > 24){//screen for bonus packs vs. purchased packs
                    for (let chk=24; chk<puzzleData.length; chk++){
                        if (puzzleData[chk].product_id.indexOf('bonus') < 0){
                            puzzleData[17].show = 'false';//purchased something, gets access to last 30 daily puzzles rather than last 3 days
                            puzzleData[18].show = 'true';
                            premiumBool = 'true';
                            getPurchasedBool = false;//a purchased pack is here, we don't need to retrieve them which would erase progress stats
                            continue;
                        }
                    }
                }
                this.setState({ hasPremium: premiumBool,
                                getPurchased: getPurchasedBool,
                                pData: puzzleData
                });
                return AsyncStorage.getItem(KEY_NextBonus);
            }).then((nb) => {//get next bonus level, compare to current total score, download bonus pack accordingly...
                if (nb !== null){
                    this.setState({nextBonus: nb});
                }else{
                    this.setState({nextBonus: '500'});
                    try {
                        AsyncStorage.setItem(KEY_NextBonus, '500');
                    } catch (error) {
                        window.alert('AsyncStorage error: ' + error.message);
                    }
                }
                return AsyncStorage.getItem(KEY_Score);
            }).then((ts) => {//total score
                var myScore = 0;
                var strNextBonus = this.state.nextBonus;
                var bonusScore = parseInt(strNextBonus);//send number so getPuzzlePack() knows this is a bonus pack
                if (ts !== null){
                    myScore =  parseInt(ts, 10);
                }else{
                    try {
                        AsyncStorage.setItem(KEY_Score, '0');
                    } catch (error) {
                        window.alert('AsyncStorage error: ' + error.message);
                    }
                }
                if (myScore >= bonusScore){
                    const bID = 'bonus.' + strNextBonus;
                    for (let getNext=0; getNext<bonuses.length; getNext++){
                        if (bonuses[getNext][0] == strNextBonus){
                            const nextToSet = bonuses[getNext + 1][0];//ignoring index-out-of-bounds possibility as top bonus is set at 100,000,000,000...
                            try {
                                AsyncStorage.setItem(KEY_NextBonus, nextToSet);
                            } catch (error) {
                                window.alert('AsyncStorage error: ' + error.message);
                            }
                        }
                    }
                    return this.getPuzzlePack(bonusScore, bID, this.state.pData);
                }else{
                    return false;
                }
            }).then((pArray) => {
                if (pArray)this.setState({pData: pArray});
                return AsyncStorage.getItem(KEY_Notifs);
            }).then((notifHour) => {//notification hour, zero if no notifications (from Settings)
                if (notifHour !== null) {
                    this.setState({notif_time: notifHour});
                }else{
                    this.setState({notif_time: '7'});
                    try {
                        AsyncStorage.setItem(KEY_Notifs, '7');
                    } catch (error) {
                        window.alert('AsyncStorage error: ' + error.message);
                    }
                }
                return AsyncStorage.getItem(KEY_SeenStart);
            }).then((seenIntro) => {
                if (seenIntro !== null) {//has already seen app intro
                    this.setState({seenStart: seenIntro});
                }else{    //hasn't seen app intro...
                    this.setState({seenStart: 'false'});
                    try {
                        AsyncStorage.setItem(KEY_SeenStart, 'true');
                    } catch (error) {
                        window.alert('AsyncStorage error: ' + error.message);
                    }
                }
                return NetInfo.isConnected.fetch();
            }).then((isConnected) => {//if has internet connection, get daily puzzles and current app object
                if(isConnected){
                    return this.getData(this.state.pData, startNum);//load daily puzzles
                }else{//still let have access to 30 days already on device even if no internet connection
                    AsyncStorage.getItem(KEY_hasPremium).then((prem) => {
                        premiumBool = 'false';
                        if(prem == 'true'){
                            puzzleData[17].show = 'false';
                            puzzleData[18].show = 'true';
                            premiumBool = 'true';
                        }
                        this.setState({ connectionBool: false,
                                        hasPremium: premiumBool
                        })
                        return false;
                    });
                }
            }).then((puzzleArray) => {
                if(puzzleArray){
                    puzzleArray[19].num_solved = puzzleData[19].num_solved;//set 'Eggplant' to its current state
                    puzzleArray[19].solved = puzzleData[19].solved;
                    puzzleArray[19].type = puzzleData[19].type;
                    puzzleArray[19].show = puzzleData[19].show;
                    this.setState({ pData: puzzleArray });
                    return true;
                }else{
                    return false;
                }
            }).then((isConnected) => {//retrieve purchased packs here
                var promises = [];
                if(isConnected && this.state.getPurchased){
                    var packNames = [];
                    var packsOnDevice = [];
                    for (var k=0; k<this.state.pData.length; k++){
                        if (this.state.pData[k].type == 'mypack'){
                            if(this.state.pData[k].product_id != ''){
                                packsOnDevice.push(this.state.pData[k].product_id);
                            }
                        }
                    }
                    for (var goThroughOwned=0; goThroughOwned<ownedPacks.length; goThroughOwned++){
                        if (packsOnDevice.indexOf(ownedPacks[goThroughOwned]) < 0){
                            var idArray = ownedPacks[goThroughOwned].split('.');
                            if (idArray && idArray.length < 4){//e.g. android.test.purchased
                                continue;
                            }else if (idArray && idArray.length == 4){//single pack
                                var packTitle = '';
                                var packNameArray = idArray[2].split('_');
                                switch (packNameArray.length){
                                    case 1:
                                        packTitle = packNameArray[0].charAt(0).toUpperCase() + packNameArray[0].slice(1);
                                        break;
                                    case 2:
                                        packTitle = packNameArray[0].charAt(0).toUpperCase() + packNameArray[0].slice(1) + ' ' + packNameArray[1].charAt(0).toUpperCase() + packNameArray[1].slice(1);
                                        break;
                                    case 3://_and_ in product ID, ' & ' in title
                                        packTitle = packNameArray[0].charAt(0).toUpperCase() + packNameArray[0].slice(1) + ' & ' + packNameArray[2].charAt(0).toUpperCase() + packNameArray[2].slice(1);
                                        break;
                                    default:
                                }
                                promises.push(this.getPuzzlePack(packTitle, ownedPacks[goThroughOwned], this.state.pData));
                            }else if (idArray && idArray.length == 5){//combo pack
                                var packTitleArray = [];
                                for (var m=0; m<3; m++){
                                    var idTitle = idArray[m + 2];
                                    var packTitle = '';
                                    var packNameArray = idTitle.split('_');
                                    switch (packNameArray.length){
                                        case 1:
                                            packTitle = packNameArray[0].charAt(0).toUpperCase() + packNameArray[0].slice(1);
                                            break;
                                        case 2:
                                            packTitle = packNameArray[0].charAt(0).toUpperCase() + packNameArray[0].slice(1) + ' ' + packNameArray[1].charAt(0).toUpperCase() + packNameArray[1].slice(1);
                                            break;
                                        case 3://_and_ in product ID, ' & ' in title
                                            packTitle = packNameArray[0].charAt(0).toUpperCase() + packNameArray[0].slice(1) + ' & ' + packNameArray[2].charAt(0).toUpperCase() + packNameArray[2].slice(1);
                                            break;
                                        default:
                                    }
                                    packTitleArray.push(packTitle)
                                }
                                promises.push(this.getPuzzlePack(packTitleArray, ownedPacks[goThroughOwned], this.state.pData));
                            }else{
                                console.log('Unknown Product: ', ownedPacks[goThroughOwned]);
                            }
                        }
                    }
                }
                return Promise.all(promises);
            }).then(() => {
                var whereToGo = (this.state.seenStart == 'true')?'puzzles contents':'start scene';
                this.setNotifications();
                this.setState({isLoading: false});
                this.gotoScene(whereToGo, this.state.pData);
            }).catch(function(error) {
                window.alert('263: ' + error.message);
            });
        }else{//purchased puzzle pack...
            this.setState({hasPremium: 'true'});
            try {
                AsyncStorage.setItem(KEY_Premium, 'true');//
            } catch (error) {
                window.alert('AsyncStorage error: ' + error.message);
            }
            AsyncStorage.getItem(KEY_Puzzles).then((puzzles) => {
                puzzleData = JSON.parse(puzzles);
                puzzleData[17].show = 'false';
                puzzleData[18].show = 'true';
                return puzzleData;
            }).then((theData) => {
                return this.getPuzzlePack(this.props.packName, this.props.productID, theData);
            }).then((data) => {
                this.gotoScene('puzzles contents', data);
            }).catch(function(error) {
                window.alert('282: ' + error.message);
            });
        }
    }
    getData(dataArray, sNum){//retrieve server data here, sNum is offset number for daily puzzles;
        return new Promise(
            function (resolve, reject) {
                const handle = Meteor.subscribe('AllData', {
                    onReady: function () {
                        const d_puzzles = Meteor.collection('dataD').find();//dataD => daily puzzles and puzzleData object
                        var pd = [];
                        var puzzStringArray = [];
                        d_puzzles.forEach(function (row) {
                            if(parseInt(row.pnum, 10) == 0){//get puzzleData object here
                                pd = row.data;
                            }
                            if((parseInt(row.pnum, 10) >= sNum) && (parseInt(row.pnum, 10) < (sNum + 31))){//daily puzzles here
                                puzzStringArray.unshift(row.puzz);
                            }
                        });
                        pd.length = 24;//truncate extra elements, which shouldn't be necessary but is...
                        pd[16].puzzles[0] = puzzStringArray[0];//load today's puzzle
                        puzzStringArray.shift();
                        for(var jj=0; jj<puzzStringArray.length; jj++){
                            pd[18].puzzles[jj] = puzzStringArray[jj];//load last 30 days
                            if(jj < 3){pd[17].puzzles[jj] = puzzStringArray[jj];}//load last 3 days
                        }
                        for (let addExtra=24; addExtra<dataArray.length; addExtra++){//add any extra packs onto data array
                            pd.push(dataArray[addExtra]);
                        }
                        resolve(pd);
                    },
                    onStop: function () {
                        window.alert('Sorry, can\'t connect to our server right now');
                        reject(error.reason);
                    }
                });
        });
    }
    getPuzzlePack(name, ID, puzzleData){//retrieve from server set(s) of puzzles...combo pack if name is string array, single if string, bonus if number
        return new Promise(
            function (resolve, reject) {
                if (Array.isArray(name)){//combo pack
                    var title = [];
                    var index = [];
                    var num_puzzles = [];
                    var product_id = '';
                    var bg_color = [];
                    var puzzles = [[],[],[]];
                    var combinedName = name[0] + ' ' + name[1] + ' ' + name[2];
                    for (var k = 0; k < 3; k++){
                        for (var b = 0; b < puzzleData.length; b++){
                            var obj = puzzleData[b];
                            for (var el in obj) {
                                if (el == 'data'){
                                    for(var j=0; j<obj[el].length; j++){
                                        if(puzzleData[b].data[j].name == name[k]){
                                            title[k] = puzzleData[b].data[j].name;
                                            index[k] = (puzzleData.length + k).toString();
                                            num_puzzles[k] = puzzleData[b].data[j].num_puzzles;
                                            bg_color[k] = puzzleData[b].data[j].color;
                                            continue;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    const subs = Meteor.subscribe('AllData', {
                        onReady: function () {
                                const d_puzzles = Meteor.collection('dataC').find({pack: combinedName});
                                var puzzleCount = 0;
                                var whichOfThe3 = 0;
                                for (var key in d_puzzles) {
                                    var obj = d_puzzles[key];
                                    for (var prop in obj) {
                                        if(prop=='puzz'){
                                            puzzles[whichOfThe3].push(obj[prop]);
                                            puzzleCount++;
                                        }
                                        if (puzzleCount == num_puzzles[whichOfThe3]){
                                            whichOfThe3++;
                                            puzzleCount = 0;
                                        }
                                    }
                                }
                                for (var push = 0; push < 3; push++){
                                    puzzleData.push({
                                        title: title[push],
                                        index: index[push],
                                        type: 'mypack',
                                        show: 'true',
                                        num_puzzles: num_puzzles[push],
                                        num_solved: '0',
                                        solved: 'false',
                                        product_id: ID,
                                        bg_color: bg_color[push],
                                        puzzles: puzzles[push]
                                    });
                                }
                                resolve(puzzleData);
                            },
                        onStop: function () {
                            window.alert('Sorry, can\'t connect to our server right now');
                            reject(error.reason);
                        }
                    });
                }else{
                    var strName = '';
                    var title = '';
                    var index = '';
                    var num_puzzles = '';
                    var bg_color = '';
                    var puzzles = [];
                    if(typeof name == 'string'){//regular pack
                        strName = name;
                        for (var k = 0; k < puzzleData.length; k++){
                        var obj = puzzleData[k];
                            for (var el in obj) {
                                if (el == 'data'){
                                    for(var j=0; j<obj[el].length; j++){
                                        if(puzzleData[k].data[j].name == name){
                                            title = puzzleData[k].data[j].name;
                                            num_puzzles = puzzleData[k].data[j].num_puzzles;
                                            bg_color = puzzleData[k].data[j].color;
                                            continue;
                                        }
                                    }
                                }
                            }
                        }
                    }else{//bonus pack for score level
                        strName = name.toString();
                        for(var bb=0; bb<bonuses.length; bb++){
                            if (bonuses[bb][0] == strName){
                                title = bonuses[bb][1];
                                num_puzzles = bonuses[bb][2];
                                bg_color = bonuses[bb][3];
                                continue;
                            }
                        }
                    }
                    const subs = Meteor.subscribe('AllData', {
                        onReady: function () {
                            const d_puzzles = Meteor.collection('dataP').find({pack: strName});
                            for (var key in d_puzzles) {
                                var obj = d_puzzles[key];
                                for (var prop in obj) {
                                    if(prop=='puzz'){
                                        puzzles.push(obj[prop]);
                                    }
                                }
                            }
                            puzzleData.push({
                                title: title,
                                index: puzzleData.length.toString(),
                                type: 'mypack',
                                show: 'true',
                                num_puzzles: num_puzzles,
                                num_solved: '0',
                                solved: 'false',
                                product_id: ID,
                                bg_color: bg_color,
                                puzzles: puzzles
                            });
                            resolve(puzzleData);
                        },
                        onStop: function () {
                            window.alert('Sorry, can\'t connect to our server right now');
                            reject(error.reason);
                        }
                    });
                }
        });
    }
    gotoScene(whichScene, puzzleData){
        var myPackArray = [];
        var str = '';
        for (var key in puzzleData){
            if (puzzleData[key].type == 'mypack'){
                myPackArray.push(puzzleData[key].title);
            }
        }
        var levels = [3,4,5,6];//Easy, Moderate, Hard, Theme--find one of each in the store that I don't already own...
        for(var i=0; i<4; i++){
            var titleIndex = -1;
            var rnd = Array.from(new Array(puzzleData[levels[i]].data.length), (x,i) => i);//[0,1,2, ...for number of packs available]
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
        var connected = this.state.connectionBool;
        this.setState({isLoading: false});
        this.props.navigator.replace({
            id: whichScene,
            passProps: {
                puzzleData: puzzleData,
                isPremium: this.state.hasPremium,
                seenIntro: this.state.seenStart,
                introIndex: 0,
                connectionBool: connected,
                destination: 'puzzles contents'
                },
       });
    }
    setNotifications(){
        var time = this.state.notif_time;
        if (time == '0'){return}
        //var date = new Date(Date.now() + (parseInt(time, 10) * 1000));
        var tomorrowAM = new Date(Date.now() + (moment(tonightMidnight).add(parseInt(time, 10), 'hours').valueOf()) - nowISO);

        PushNotification.localNotificationSchedule({
            message: 'A new Daily Puzzle is in!',
            vibrate: true,
            soundName: 'plink.mp3',
            //repeatType: 'day',//can be 'time', if so use following:
            repeatTime: 86400000,//daily
            date: tomorrowAM,
            id: '777',
        });
    }


    render() {
        if(this.state.isLoading == true){
            return(
                <View style={ splash_styles.container }>
                    <Image style={{ width: normalize(height/4), height: normalize(height/4) }} source={require('../images/icon_round.png')} />
                    <ActivityIndicator style={splash_styles.spinner} animating={true} size={'large'}/>
                </View>
            )
        }else{
            return (
                <View style={ splash_styles.container }>
                    <Image style={{ width: normalize(height/4), height: normalize(height/4) }} source={require('../images/icon_round.png')} />
                </View>
            );
        }
    }
}

const splash_styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#486bdd',
    },
    spinner: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    }
});

module.exports = SplashScreen;