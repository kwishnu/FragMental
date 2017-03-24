import React, {Component} from 'react';
import { View, Image, StyleSheet, NetInfo, AsyncStorage, ActivityIndicator } from 'react-native';
import Meteor from 'react-native-meteor';
import moment from 'moment';
import PushNotification from 'react-native-push-notification';

var InAppBilling = require('react-native-billing');
var seedPuzzleData = require('../data/data.js');
var KEY_Premium = 'premiumOrNot';
var KEY_Puzzles = 'puzzlesKey';
var KEY_SeenStart = 'seenStartKey';
var KEY_Notifs = 'notifsKey';
var KEY_NotifTime = 'notifTimeKey';
var seenStart = false;
var ready = false;
var nowISO = moment().valueOf();
var launchDay = moment('2017 02', 'YYYY-MM');//Feb 1, 2017
var dayDiff = -launchDay.diff(nowISO, 'days');//# of days since 1/1/2017
var startNum = parseInt(dayDiff, 10) - 28;
var tonightMidnight = moment().endOf('day').valueOf();
let ownedPacks = [];

function randomNum(low, high) {
    high++;
    return Math.floor((Math.random())*(high-low))+low;
}
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
function toObject(arr) {
  var rv = {};
  for (var i = 0; i < arr.length; ++i)
    rv[i] = arr[i];
  return rv;
}
//'ws://52.52.199.138:80/websocket'; <= bbg3...publication AllData, collections data, data1, data2, details, puzzles, text, users
//'ws://52.52.205.96:80/websocket'; <= Publications...publication AllData, collections dataA...dataZ
//'ws://10.0.0.207:3000/websocket'; <= localhost
let METEOR_URL = 'ws://52.52.205.96:80/websocket';//'ws://10.0.0.207:3000/websocket';//'ws://52.52.205.96:80/websocket';
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
            isLoading: true
        };
    }
    componentDidMount() {
        let puzzleData = {};
        if(this.props.motive == 'initialize'){
            puzzleData = seedPuzzleData;
                    InAppBilling.open()
                    .then(() => InAppBilling.listOwnedProducts())
                    .then((details) => {
                        ownedPacks = details;
                    return InAppBilling.close();
            }).then(()=> {
                return AsyncStorage.getItem(KEY_Puzzles);
            }).then((puzzles) => {
                if (puzzles !== null) {//get current Puzzle data:
                    puzzleData = JSON.parse(puzzles)
                }else{//store seed Puzzle data:
                    puzzleData = seedPuzzleData;
                    try {
                        AsyncStorage.setItem(KEY_Puzzles, JSON.stringify(seedPuzzleData));//return NetInfo.isConnected.fetch();
                    } catch (error) {
                        window.alert('AsyncStorage error: ' + error.message);
                    }
                }
                let premiumBool = (puzzleData[18].show == 'true')?'true':'false';
                this.setState({hasPremium: premiumBool});
                return AsyncStorage.getItem(KEY_Notifs);
            }).then((notifHour) => {//notification hour, zero if no notifications
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
            }).then((isConnected) => {
                if(isConnected){
                    const handle = Meteor.subscribe('AllData', {
                        onReady: function () {
                            const d_puzzles = Meteor.collection('dataD').find();//dataD => daily puzzles
                            var flag = 'skip';
                            var i = 30;
                            var puzzStringArray = [];
                            for (var key in d_puzzles) {
                                if (!d_puzzles.hasOwnProperty(key)) continue;
                                var obj = d_puzzles[key];
                                for (var prop in obj) {
                                    if(!obj.hasOwnProperty(prop)) continue;
                                    if(prop=='pnum' && (obj[prop] >= startNum) && (obj[prop] < (startNum + 31))){
                                        flag = 'load'
                                    }
                                    if(prop=='puzz' && flag == 'load'){
                                        puzzStringArray.unshift(obj[prop]);
                                        flag = 'skip';
                                    }
                                }
                            }
                            puzzleData[16].puzzles[0] = puzzStringArray[0];//load today's puzzle
                            puzzStringArray.shift();
                            for(var j=0; j<puzzStringArray.length; j++){
                                if(j < 3){puzzleData[17].puzzles[j] = puzzStringArray[j];}//load last 3 days
                                puzzleData[18].puzzles[j] = puzzStringArray[j];//load last 30 days
                            }
                        },
                        onStop: function () {
                            window.alert('Sorry, can\'t connect to our server right now');
                        }
                    });
                }else{
                    this.setState({connectionBool: false})
                }
                return isConnected;
            }).then((isConnected) => {
                let promises = [];
                if(isConnected){
                    let packNames = [];
                    let packsOnDevice = [];
                    for (var key in puzzleData){
                        if (puzzleData[key].type == 'mypack'){
                            if(puzzleData[key].product_id != ''){
                                packsOnDevice.push(puzzleData[key].product_id);
                            }
                        }
                    }
                    console.log(packsOnDevice);
                    for (let k=0; k<ownedPacks.length; k++){
                        if (packsOnDevice.indexOf(ownedPacks[k]) < 0){
                            let idArray = ownedPacks[k].split('.');
                            if (idArray.length < 4){//e.g. android.test.product
                                console.log('Skipped: ', ownedPacks[k]);
                                continue;
                            }else if (idArray.length == 4){//single pack
                                let packTitle = '';
                                let packNameArray = idArray[2].split('_');
                                switch (packNameArray.length){
                                    case 1:
                                        packTitle = packNameArray[0].charAt(0).toUpperCase() + packNameArray[0].slice(1);
                                        break;
                                    case 2:
                                        packTitle = packNameArray[0].charAt(0).toUpperCase() + packNameArray[0].slice(1) + ' ' + packNameArray[1].charAt(0).toUpperCase() + packNameArray[1].slice(1);
                                        break;
                                    case 3:
                                        packTitle = packNameArray[0].charAt(0).toUpperCase() + packNameArray[0].slice(1) + ' and ' + packNameArray[2].charAt(0).toUpperCase() + packNameArray[2].slice(1);
                                        break;
                                    default:
                                }
                                promises.push(this.getPuzzlePack(packTitle));
                            }else if (idArray.length == 5){//combo pack
                                let packTitleArray = [];
                                for (let m=0; m<3; m++){
                                    let idTitle = idArray[m + 2];
                                    let packTitle = '';
                                    let packNameArray = idTitle.split('_');
                                    switch (packNameArray.length){
                                        case 1:
                                            packTitle = packNameArray[0].charAt(0).toUpperCase() + packNameArray[0].slice(1);
                                            break;
                                        case 2:
                                            packTitle = packNameArray[0].charAt(0).toUpperCase() + packNameArray[0].slice(1) + ' ' + packNameArray[1].charAt(0).toUpperCase() + packNameArray[1].slice(1);
                                            break;
                                        case 3:
                                            packTitle = packNameArray[0].charAt(0).toUpperCase() + packNameArray[0].slice(1) + ' and ' + packNameArray[2].charAt(0).toUpperCase() + packNameArray[2].slice(1);
                                            break;
                                        default:
                                    }
                                    packTitleArray.push(packTitle)
                                }
                                promises.push(this.getPuzzlePack(packTitleArray));
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
                this.gotoScene(whereToGo, puzzleData);
            })
            .catch(function(error) {
                window.alert(error.message);
                throw error;
            });
        }else{//purchased puzzle pack...
            this.setState({hasPremium: 'true'});
            AsyncStorage.getItem(KEY_Puzzles).then((puzzles) => {
                puzzleData = JSON.parse(puzzles);
                puzzleData[17].show = 'false';
                puzzleData[18].show = 'true';
                return puzzleData;
            }).then((theData) => {
                let pushPack = this.getPuzzlePack(this.props.packName, theData);
                return pushPack;
            }).then((data) => {
                this.gotoScene('puzzles contents', data);
            }).catch(function(error) {
                window.alert(error.message);
                throw error;
            });
        }
    }
    getPuzzlePack(name, puzzleData){
        return new Promise(
            function (resolve, reject) {
                if (Array.isArray(name)){//combo pack
                    let title = [];
                    let index = [];
                    let num_puzzles = [];
                    let bg_color = [];
                    let puzzles = [[],[],[]];
                    let combinedName = name[0] + ' ' + name[1] + ' ' + name[2];

                    for (let k = 0; k < 3; k++){
                        Object.keys(puzzleData).forEach((key)=>{
                            var obj = puzzleData[key];
                            for (var el in obj) {
                                if (el == 'data'){
                                    for(let j=0; j<obj[el].length; j++){
                                        if(puzzleData[key].data[j].name == name[k]){
                                            title[k] = puzzleData[key].data[j].name;
                                            index[k] = (puzzleData.length + k).toString();
                                            num_puzzles[k] = puzzleData[key].data[j].num_puzzles;
                                            bg_color[k] = puzzleData[key].data[j].color;
                                            continue;
                                        }
                                    }
                                }
                            }
                        });
                    }

                    const subs = Meteor.subscribe('AllData', {
                        onReady: function () {
                                const d_puzzles = Meteor.collection('dataC').find({pack: combinedName});
                                let puzzleCount = 0;
                                let whichOfThe3 = 0;
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
                                for (let push = 0; push < 3; push++){
                                    puzzleData.push({
                                        title: title[push],
                                        index: index[push],
                                        type: 'mypack',
                                        show: 'true',
                                        num_puzzles: num_puzzles[push],
                                        num_solved: '0',
                                        solved: 'false',
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
                    let title = '';
                    let index = '';
                    let num_puzzles = '';
                    let bg_color = '';
                    let puzzles = [];

                    Object.keys(puzzleData).forEach((key)=>{
                        var obj = puzzleData[key];
                        for (var el in obj) {
                            if (el == 'data'){
                                for(let j=0; j<obj[el].length; j++){
                                    if(puzzleData[key].data[j].name == name){
                                        title = puzzleData[key].data[j].name;
                                        index = puzzleData.length.toString();
                                        num_puzzles = puzzleData[key].data[j].num_puzzles;
                                        bg_color = puzzleData[key].data[j].color;
                                        continue;
                                    }
                                }
                            }
                        }
                    });

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
        for(let i=0; i<4; i++){
            var titleIndex = -1;
            var rand0to9 = [0,1,2,3,4,5,6,7,8,9];
            rand0to9 = shuffleArray(rand0to9);
            for (var r=0; r<puzzleData[levels[i]].data.length; r++){
//                var rand0to9 = randomNum(0, 9);
                if (myPackArray.indexOf(puzzleData[levels[i]].data[rand0to9[r]].name) < 0){
                    titleIndex = rand0to9[r];
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
        let connected = this.state.connectionBool;
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
        //let date = new Date(Date.now() + (parseInt(time, 10) * 1000));
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
                    <Image style={{ width: 200, height: 200 }} source={require('../images/icon.png')} />
                    <ActivityIndicator style={splash_styles.spinner} animating={true} size={'large'}/>
                </View>
            )
        }else{
            return (
                <View style={ splash_styles.container }>
                    <Image style={{ width: 200, height: 200 }} source={require('../images/icon.png')} />
                </View>
            );
        }
    }
}

var splash_styles = StyleSheet.create({
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
    },
});


module.exports = SplashScreen;