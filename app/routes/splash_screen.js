import React, {Component} from 'react';
import { View, Image, StyleSheet, NetInfo, AsyncStorage } from 'react-native';
import Meteor from 'react-native-meteor';
import moment from 'moment';
import PushNotification from 'react-native-push-notification';

var seedPuzzleData = require('../data/data.js');
var KEY_Puzzles = 'puzzlesKey';
var KEY_SeenStart = 'seenStartKey';
var KEY_Notifs = 'notifsKey';
var KEY_NotifTime = 'notifTimeKey';
var seenStart = false;
var puzzleData = {};
var ready = false;
var nowISO = moment().valueOf();
var tonightMidnight = moment().endOf('day').valueOf();
function randomNum(low, high) {
    high++;
    return Math.floor((Math.random())*(high-low))+low;
}

class SplashScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 'splash screen',
            seenStart: 'false',
            notif_time: ''
        };
    }
    componentDidMount() {
        AsyncStorage.getItem(KEY_Puzzles).then((puzzles) => {
            if (puzzles !== null) {//get current Puzzle data:
                puzzleData = JSON.parse(puzzles)
            }else{//store seed Puzzle data:
                puzzleData = seedPuzzleData;
                try {
                    AsyncStorage.setItem(KEY_Puzzles, JSON.stringify(seedPuzzleData));//
                } catch (error) {
                    window.alert('AsyncStorage error: ' + error.message);
                }
            }
            return AsyncStorage.getItem(KEY_Notifs)
        }).then((notifDetails) => {
            if (notifDetails !== null) {
                this.setState({notif_time: notifDetails});
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
//'ws://52.9.147.169:80/websocket'; <= bbg2...publication PuzzlesList, collection puzzles (field "name")
//'ws://52.52.199.138:80/websocket'; <= bbg3...publication AllData, collections data, data1, data2, details, puzzles, text, users
//'ws://52.52.205.96:80/websocket'; <= Publications...publication AllData, collections dataA...dataZ
//'ws://10.0.0.207:3000/websocket'; <= localhost
                let METEOR_URL = 'ws://52.52.205.96:80/websocket';////'ws://52.9.147.169:80/websocket';//'ws://52.8.88.93:80/websocket';'ws://10.0.0.207:3000/websocket';//'ws://52.52.205.96:80/websocket';
                Meteor.connect(METEOR_URL);
                const handle = Meteor.subscribe('AllData', {
                    onReady: function () {
                        const messages = Meteor.collection('dataJ').find();
                        for (var key in messages) {
                            if (!messages.hasOwnProperty(key)) continue;
                            var obj = messages[key];
                            for (var prop in obj) {
                                if(!obj.hasOwnProperty(prop)) continue;//Modify daily puzzle info here...todo
                                if(prop=='text'){;}
                                //window.alert(prop + " = " + obj[prop]);
                                //window.alert(obj[prop]);
                            }
                        }
                    },
                    onStop: function () {
                        window.alert('Sorry, can\'t connect to our server right now');
                    }
                });
                return {
                    ready: handle.ready(),
                };
            }
        }).then((disregard) => {
            var whereToGo = (this.state.seenStart == 'true')?'puzzles contents':'start scene';
            this.setNotifications();
            this.gotoScene(whereToGo);
        })
        .catch(function(error) {
            window.alert(error.message);
            throw error;
        });
    }
    gotoScene(whichScene){
        var levels = [3,4,5,6];//Easy, Moderate, Hard, Theme
        for(let i=0; i<4; i++){
            var rand0to9 = randomNum(0, 9);
            puzzleData[20 + i].title = '*' + puzzleData[levels[i]].data[rand0to9].name;
            puzzleData[20 + i].bg_color = puzzleData[levels[i]].data[rand0to9].color;
        }
        this.props.navigator.replace({
            id: whichScene,
            passProps: {
                puzzleData: puzzleData,
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
            message: "A new Daily Puzzle is in!",
            vibrate: true,
            soundName: 'plink.mp3',
            repeatType: 'day',//can be 'time', if so use following:
            //repeatTime: 86400000,//daily
            date: tomorrowAM,
            id: '777',
        });
    }


    render() {
        return (
            <View style={ splash_styles.container }>
                <Image style={{ width: 200, height: 200 }} source={require('../images/icon.png')} />
            </View>
        );
    }
}

var splash_styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#486bdd',
    },
});


module.exports = SplashScreen;