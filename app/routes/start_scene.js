import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Alert,
  Image,
  Dimensions,
  AsyncStorage,
  Animated,
  Easing,
  BackAndroid
} from 'react-native';
import AppIntro from 'react-native-app-intro';
const KEY_UseNumLetters = 'numLetters';
const KEY_ratedTheApp = 'ratedApp';
const KEY_expandInfo = 'expandInfoKey';
const KEY_Premium = 'premiumOrNot';
const KEY_HighScore = 'highScoreKey';
const KEY_show_score = 'showScoreKey';
const {width, height} = require('Dimensions').get('window');

class StartScene extends Component {
    constructor(props) {
        super(props);
        this.offsetX = new Animated.Value(0);
        this.spinValue = new Animated.Value(0)
        this.state = {
            id: 'start scene'
        };
        this.handleHardwareBackButton = this.handleHardwareBackButton.bind(this);
    }
    componentDidMount() {
        this.animate_hand_delay();
        this.spin();
        BackAndroid.addEventListener('hardwareBackPress', this.handleHardwareBackButton);
        if (this.props.seenIntro != 'true'){
            var initArray = [
                [KEY_UseNumLetters, 'true'],
                [KEY_Premium, 'false'],
                [KEY_ratedTheApp, 'false'],
                [KEY_expandInfo, '1.1.1.1'],
                [KEY_HighScore, '0'],
                [KEY_show_score, '1']
            ];
            try {
                AsyncStorage.multiSet(initArray);
            } catch (error) {
                window.alert('AsyncStorage error: ' + error.message);
            }
        }
    }
    componentWillUnmount () {
        BackAndroid.removeEventListener('hardwareBackPress', this.handleHardwareBackButton);
    }
    handleHardwareBackButton=() => {
        this.goSomewhere();
    }
    goSomewhere(){
        let goToHere = this.props.destination;
        if (goToHere == 'puzzles contents'){
            this.props.navigator.replace({
                id: goToHere,
                passProps: {
                    puzzleData: this.props.puzzleData,
                    connectionBool: this.props.connectionBool
                },
           });
        }else{
            this.props.navigator.pop({
                id: goToHere,
                passProps: {
                    puzzleData: this.props.puzzleData,
                },
           });
        }
    }
    onSkipBtnHandle = () => {
        this.goSomewhere();
    }
    doneBtnHandle = () => {
        this.goSomewhere();
    }
    spin () {
        this.spinValue.setValue(0);
        Animated.timing(
            this.spinValue,
            {
                toValue: 1,
                duration: 23000,
                easing: Easing.linear
            }
        ).start(() => this.spin())
    }
    animate_hand_delay(){
        this.offsetX.setValue(0);
        Animated.sequence([
            Animated.delay(3000),
            Animated.timing(
            this.offsetX,
                {
                    toValue: 1,
                    duration: 1000,
                }
            )
        ]).start(() => this.animate_hand())
    }
    animate_hand(){
        this.offsetX.setValue(0);
        Animated.timing(
        this.offsetX,
        {
          toValue: 1,
          duration: 1000,
        }
        ).start(() => this.animate_hand())
    }
    render() {
        const spin = this.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        })
        const rotate = this.offsetX.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ['0deg', '10deg', '0deg']
        })
        const oscillate = this.offsetX.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [40, 0, 40]
        })
        return (
            <AppIntro defaultIndex= {this.props.introIndex} onDoneBtnClick={this.doneBtnHandle} onSkipBtnClick={this.onSkipBtnHandle}>

                <View style={[styles.slide,{ backgroundColor: '#081262' }]}>
                    <View style={[styles.header, {marginTop:20}]}>
                        <View style={[styles.pic, {top: -10, left: width*.05,}]} level={-15}>
                            <Animated.Image style={{ width: width*.7, height: width*.7, transform: [{rotate: spin}] }} source={require('../images/intro1/gradient2.png')} />
                        </View>
                        <View style={[styles.pic, {top: width*.05, left: width*.05,}]} level={20}>
                            <Image style={{ width: width*.33, height: width*.33 }} source={require('../images/intro1/frag2.png')} />
                        </View>
                        <View style={[styles.pic, {top: width*.05, left: width*.25,}]} level={-30}>
                            <Image style={{ width: width*.33, height: width*.33 }} source={require('../images/intro1/frag3.png')} />
                        </View>
                        <View style={[styles.pic, {top: width*.11, left: width*.08,}]} level={5}>
                            <Image style={{ width: width*.33, height: width*.33 }} source={require('../images/intro1/frag4.png')} />
                        </View>
                        <View style={[styles.pic, {top: width*.19, left: width*.26,}]} level={-10}>
                            <Image style={{ width: width*.33, height: width*.33 }} source={require('../images/intro1/frag5.png')} />
                        </View>
                        <View style={[styles.pic, {top: width*.02, left: width*.16,}]} level={5}>
                            <Image style={{ width: width*.33, height: width*.33 }} source={require('../images/intro1/frag6.png')} />
                        </View>
                        <View style={[styles.pic, {top: width*.13, left: width*.2,}]} level={10}>
                            <Image style={{ width: width*.33, height: width*.33 }} source={require('../images/intro1/frag7.png')} />
                        </View>
                        <View>
                            <Image style={{ width: width*.33, height: width*.33 }} source={require('../images/intro1/frag1.png')} />
                        </View>
                    </View>
                    <View style={styles.info}>
                        <View level={15}><Text style={styles.swipeText}>Welcome to</Text></View>
                        <View level={10}><Text style={styles.title}>FragMental!</Text></View>
                        <View style={styles.center_text_view}>
                            <View level={0}><Text style={styles.swipeText}>Swipe through for a quick tutorial...</Text></View>
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'flex-end', width: width, height: width*.2, marginTop: 20}} level={-15}>
                            <Animated.Image style={{ width: width*.2, height: width*.1, marginRight: 40, transform: [{translateX: oscillate}, { rotate: rotate}] }} source={require('../images/intro1/hand.png')} />
                        </View>
                    </View>
                </View>

                <View style={[styles.slide, { backgroundColor: '#486bdd' }]}>
                    <View style={[styles.header, {marginTop:-35}]}>
                        <Image style={{ width: width, height: height, resizeMode: 'contain' }} source={require('../images/intro2/bg.png')} />
                    </View>
                    <View style={[styles.pic, {top: 0, left: 0, marginTop:-30, marginLeft: 5}]} level={-20}>
                        <Image style={{ width: width, height: height, resizeMode: 'contain' }} source={require('../images/intro2/top.png')} />
                    </View>
                    <View style={[styles.pic, {top: 0, left: 0, marginTop:-35, marginLeft: 20}]} level={30}>
                        <Image style={{ width: width, height: height, resizeMode: 'contain' }} source={require('../images/intro2/bottom.png')} />
                    </View>
                    <View style={{position: 'absolute', top: 0, left: 0, flexDirection: 'row', justifyContent: 'flex-end', width: width, height: width*.2, marginTop: 10}} level={-15}>
                        <Animated.Image style={{ width: width*.2, height: width*.1, marginRight: 40, transform: [{translateX: oscillate}, { rotate: rotate}] }} source={require('../images/intro1/hand.png')} />
                    </View>
                </View>

                <View style={[styles.slide, { backgroundColor: '#3ff14c' }]}>
                    <View style={[styles.header, {marginTop:-35}]}>
                        <View>
                            <Image style={{ width: width, height: height, resizeMode: 'contain' }} source={require('../images/intro3/bg.png')} />
                        </View>
                    </View>
                    <View style={[styles.pic, {top: 0, left: 0, marginTop:-20}]} level={-10}>
                        <Image style={{ width: width, height: height, resizeMode: 'contain' }} source={require('../images/intro3/re.png')} />
                    </View>
                    <View style={[styles.pic, {top: 0, left: 0, marginTop:-20}]} level={-15}>
                        <Image style={{ width: width, height: height, resizeMode: 'contain' }} source={require('../images/intro3/ce.png')} />
                    </View>
                    <View style={[styles.pic, {top: 0, left: 0, marginTop:-20}]} level={-20}>
                        <Image style={{ width: width, height: height, resizeMode: 'contain' }} source={require('../images/intro3/des.png')} />
                    </View>
                    <View style={{position: 'absolute', top: 0, left: 0, flexDirection: 'row', justifyContent: 'flex-end', width: width, height: width*.2, marginTop: 10}} level={-15}>
                        <Animated.Image style={{ width: width*.2, height: width*.1, marginRight: 40, transform: [{translateX: oscillate}, { rotate: rotate}] }} source={require('../images/intro1/hand.png')} />
                    </View>
                </View>

               <View style={[styles.slide, { backgroundColor: '#081262' }]}>
                    <View style={styles.header}>
                        <View>
                            <Image style={{ width: width, height: height, resizeMode: 'contain' }} source={require('../images/intro4/bg.png')} />
                        </View>
                    </View>
                    <View style={[styles.pic, {top: 0, left: 0}]} level={-10}>
                        <Image style={{ width: width, height: height, resizeMode: 'contain' }} source={require('../images/intro4/key.png')} />
                    </View>
                    <View style={[styles.pic, {top: 0, left: 0}]} level={-20}>
                        <Image style={{ width: width, height: height, resizeMode: 'contain' }} source={require('../images/intro4/skip.png')} />
                    </View>
                    <View style={[styles.pic, {top: 0, left: 10}]} level={-30}>
                        <Image style={{ width: width, height: height, resizeMode: 'contain' }} source={require('../images/intro4/hint.png')} />
                    </View>
                    <View style={{position: 'absolute', top: 0, left: 0, flexDirection: 'row', justifyContent: 'flex-end', width: width, height: width*.2, marginTop: 10}} level={-15}>
                        <Animated.Image style={{ width: width*.2, height: width*.1, marginRight: 40, transform: [{translateX: oscillate}, { rotate: rotate}] }} source={require('../images/intro1/hand.png')} />
                    </View>
                </View>
               <View style={[styles.slide, { backgroundColor: '#081262' }]}>
                    <View style={styles.header}>
                        <View>
                            <Image style={{ width: width, height: height, resizeMode: 'contain' }} source={require('../images/intro5/bg.png')} />
                        </View>
                    </View>
                    <View style={[styles.pic, {top: 0, left: 0}]} level={-10}>
                        <Image style={{ width: width, height: height, resizeMode: 'contain' }} source={require('../images/intro5/score.png')} />
                    </View>
                    <View style={[styles.pic, {top: 0, left: 0}]} level={-20}>
                        <Image style={{ width: width, height: height, resizeMode: 'contain' }} source={require('../images/intro5/replay.png')} />
                    </View>
                </View>
            </AppIntro>
        );
    }
}


const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  header: {
    flex: 1,
    width: width,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  hand: {
    position: 'absolute',
    top: height * .6,
    height: 30,
    width: 40
  },
  pic: {
    position: 'absolute',
    width: width,
    height: height,
  },
  info: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 30,
    paddingBottom: 6,
  },
  swipeText: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
  },
  center_text_view: {
    width: width*.7,
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

module.exports = StartScene;