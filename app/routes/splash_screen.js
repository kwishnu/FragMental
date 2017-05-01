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
const KEY_Premium = 'premiumOrNot';
const KEY_Puzzles = 'puzzlesKey';
const KEY_SeenStart = 'seenStartKey';
const KEY_Notifs = 'notifsKey';
const KEY_NotifTime = 'notifTimeKey';
const {width, height} = require('Dimensions').get('window');
import { normalize }  from '../config/pixelRatio';
//'ws://52.52.199.138:80/websocket'; <= bbg3...publication AllData, collections data, data1, data2, details, puzzles, text, users
//'ws://52.52.205.96:80/websocket'; <= Publications...publication AllData, collections dataA...dataZ
//'ws://10.0.0.207:3000/websocket'; <= localhost
var METEOR_URL = 'ws://52.52.205.96:80/websocket';//'ws://10.0.0.207:3000/websocket';//'ws://52.52.205.96:80/websocket';
Meteor.connect(METEOR_URL);

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
            pData: []
        };
    }
    componentDidMount() {
        StatusBar.setHidden(true);
        var puzzleData = [];
        nowISO = moment().valueOf();
        tonightMidnight = moment().endOf('day').valueOf();
        var launchDay = moment('2017 04', 'YYYY-MM');//April 1, 2017
        var dayDiff = -launchDay.diff(nowISO, 'days');//# of days since 4/1/2017
        var startNum = dayDiff - 28;
        if(this.props.motive == 'initialize'){
            var ownedPacks = [];
            var premiumBool = 'false';
            InAppBilling.close()
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
                var getPurchasedBool = (puzzleData.length < 25)?true:false;
                if(ownedPacks.length > 0){//purchased something, gets access to last 30 daily puzzles rather than last 3 days
                    puzzleData[17].show = 'false';
                    puzzleData[18].show = 'true';
                    premiumBool = 'true';
                }
                this.setState({ hasPremium: premiumBool,
                                getPurchased: getPurchasedBool,
                                pData: puzzleData
                });
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
                if (seenIntro !== null) {  //has already seen app intro
                    this.setState({seenStart: seenIntro});
                }else{    //hasn't seen app intro...
                    this.setState({seenStart: 'false'});
                    try {
                        AsyncStorage.setItem(KEY_SeenStart, 'true');//
                    } catch (error) {
                        window.alert('AsyncStorage error: ' + error.message);
                    }
                }
                return NetInfo.isConnected.fetch();
            }).then((isConnected) => {//if has internet connection, get daily puzzles and current app object
                if(isConnected){
                    var puzzObject = this.getData(startNum);
                    return puzzObject;
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
            }).then((puzzObject) => {
                if(puzzObject){
                    puzzObject[19].num_solved = puzzleData[19].num_solved;//set 'Eggplant' to its current state
                    puzzObject[19].solved = puzzleData[19].solved;
                    this.setState({ pData: puzzObject })
                }
                return NetInfo.isConnected.fetch();
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
                    for (var kk=0; kk<ownedPacks.length; kk++){
                        if (packsOnDevice.indexOf(ownedPacks[kk]) < 0){
                            var idArray = ownedPacks[kk].split('.');
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
                                    case 3://_and_ in product ID, '&' in title
                                        packTitle = packNameArray[0].charAt(0).toUpperCase() + packNameArray[0].slice(1) + ' & ' + packNameArray[2].charAt(0).toUpperCase() + packNameArray[2].slice(1);
                                        break;
                                    default:
                                }
                                promises.push(this.getPuzzlePack(packTitle, ownedPacks[kk], this.state.pData));
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
                                        case 3://_and_ in product ID, '&' in title
                                            packTitle = packNameArray[0].charAt(0).toUpperCase() + packNameArray[0].slice(1) + ' & ' + packNameArray[2].charAt(0).toUpperCase() + packNameArray[2].slice(1);
                                            break;
                                        default:
                                    }
                                    packTitleArray.push(packTitle)
                                }
                                promises.push(this.getPuzzlePack(packTitleArray, ownedPacks[kk], this.state.pData));
                            }else{
                                console.log('Unknown Product: ', ownedPacks[k]);
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
                window.alert('195: ' + error.message);
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
                var pushPack = this.getPuzzlePack(this.props.packName, this.props.productID, theData);
                return pushPack;
            }).then((data) => {
                this.gotoScene('puzzles contents', data);
            }).catch(function(error) {
                window.alert('214: ' + error.message);
            });
        }
    }
    getData(sNum){//retrieve server data here, sNum is offset number for daily puzzles;
        return new Promise(
            function (resolve, reject) {
                var pd = [];
                const handle = Meteor.subscribe('AllData', {
                    onReady: function () {
                        const d_puzzles = Meteor.collection('dataD').find();//dataD => daily puzzles and puzzleData object
                        var puzzStringArray = [];
                        d_puzzles.forEach(function (row) {
                            if(parseInt(row.pnum, 10) == 0){//get puzzleData object here
                                pd = row.data;
                            }
                            if((parseInt(row.pnum, 10) >= sNum) && (parseInt(row.pnum, 10) < (sNum + 31))){//daily puzzles here
                                puzzStringArray.unshift(row.puzz);
                            }
                         });
                        pd[16].puzzles[0] = puzzStringArray[0];//load today's puzzle
                        puzzStringArray.shift();
                        for(var jj=0; jj<puzzStringArray.length; jj++){
                            pd[18].puzzles[jj] = puzzStringArray[jj];//load last 30 days
                            if(jj < 3){pd[17].puzzles[jj] = puzzStringArray[jj];}//load last 3 days
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
    getPuzzlePack(name, ID, puzzleData){
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
                    var title = '';
                    var index = '';
                    var num_puzzles = '';
                    var bg_color = '';
                    var puzzles = [];

                    for (var k = 0; k < puzzleData.length; k++){
                    var obj = puzzleData[k];
                        for (var el in obj) {
                            if (el == 'data'){
                                for(var j=0; j<obj[el].length; j++){
                                    if(puzzleData[k].data[j].name == name){
                                        title = puzzleData[k].data[j].name;
                                        index = puzzleData.length.toString();
                                        num_puzzles = puzzleData[k].data[j].num_puzzles;
                                        bg_color = puzzleData[k].data[j].color;
                                        continue;
                                    }
                                }
                            }
                        }
                    }
                    const subs = Meteor.subscribe('AllData', {
                        onReady: function () {
                            const d_puzzles = Meteor.collection('dataP').find({pack: name});
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
                                index: puzzleData.length,
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