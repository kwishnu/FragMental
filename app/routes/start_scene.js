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
  BackAndroid
} from 'react-native';
//import Meteor from 'react-native-meteor';
const windowsWidth = Dimensions.get('window').width;
const windowsHeight = Dimensions.get('window').height;
import AppIntro from 'react-native-app-intro';
var KEY_UseNumLetters = 'numLetters';


class StartScene extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 'start scene',
        };
        this.handleHardwareBackButton = this.handleHardwareBackButton.bind(this);
    }
    componentDidMount() {
        BackAndroid.addEventListener('hardwareBackPress', this.handleHardwareBackButton);
        AsyncStorage.getItem(KEY_UseNumLetters).then((result) => {
            if (result !== null) {
                //do nothing
            }else{
                try {
                    AsyncStorage.setItem(KEY_UseNumLetters, 'true');//
                } catch (error) {
                    window.alert('AsyncStorage error: ' + error.message);
                }
            }
        });

    }
    componentWillUnmount () {
        BackAndroid.removeEventListener('hardwareBackPress', this.handleHardwareBackButton);
    }
    handleHardwareBackButton=() => {
        this.goSomewhere();
    }
    goSomewhere(){
        var goToHere = this.props.destination;
        if (goToHere == 'puzzles contents'){
            this.props.navigator.replace({
                id: goToHere,
                passProps: {
                    puzzleData: this.props.puzzleData,
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
    nextBtnHandle = () => {
        //Alert.alert('Next');
        //console.log(index);
    }
    onSlideChangeHandle = () => {
        //console.log(index, total);

    }

    render() {

//#fa931d
    return (
      <AppIntro
        onNextBtnClick={this.nextBtnHandle}
        onDoneBtnClick={this.doneBtnHandle}
        onSkipBtnClick={this.onSkipBtnHandle}
        onSlideChange={this.onSlideChangeHandle}
      >
      <View style={[styles.slide,{ backgroundColor: '#486bdd' }]}>
        <View style={[styles.header, {width: windowsWidth}]}>
          <View>
            <Image style={{ width: 75 * 2.5, height: 63 * 2.5 }} source={require('../images/1/c1.png')} />
          </View>
          <View style={{
            position: 'absolute',
            top: 80,
            left: 30,
            width: windowsWidth,
            height: windowsHeight,
          }} level={20}
          >
            <Image style={{ width: 46 * 2.5, height: 28 * 2.5 }} source={require('../images/1/c2.png')} />
          </View>
          <View style={{
            position: 'absolute',
            top: 23,
            left: 25,
            width: windowsWidth,
            height: windowsHeight,
          }} level={20}
          >
            <Image style={{ width: 109 * 2.5, height: 68 * 2.5 }} source={require('../images/1/c5.png')} />
          </View>
          <View style={{
            position: 'absolute',
            top: 65,
            left: 35,
            width: windowsWidth,
            height: windowsHeight,
          }} level={5}
          >
            <Image style={{ width: 23 * 2.5, height: 17 * 2.5 }} source={require('../images/1/c3.png')} />
          </View>
        </View>
        <View style={styles.info}>
          <View level={15}><Text style={styles.description}>Welcome to</Text></View>
          <View level={10}><Text style={styles.title}>FragMental!</Text></View>
          <View level={15}><Text style={styles.description}>Swipe through for a quick tutorial...</Text></View>
        </View>
      </View>
      <View style={[styles.slide, { backgroundColor: '#a4b602' }]}>
        <View style={[styles.header, {width: windowsWidth}]}>
          <View>
            <Image style={{ width: 75 * 2.5, height: 63 * 2.5 }} source={require('../images/2/1.png')} />
          </View>
          <View style={{
            position: 'absolute',
            top: 30,
            left: 40,
            width: windowsWidth,
            height: windowsHeight,
          }} level={20}
          >
            <Image style={{ width: 101 * 2.5, height: 71 * 2.5 }} source={require('../images/2/2.png')} />
          </View>
          <View style={{
            position: 'absolute',
            top: 10,
            left: 50,
            width: windowsWidth,
            height: windowsHeight,
          }} level={-20}
          >
            <Image style={{ width: 85 * 2.5, height: 73 * 2.5 }} source={require('../images/2/3.png')} />
          </View>
        </View>
        <View style={styles.info}>
          <View level={10}><Text style={styles.title}>Title!</Text></View>
          <View level={15}><Text style={styles.description}>description!</Text></View>
        </View>
      </View>
      <View style={[styles.slide, { backgroundColor: '#406E9F' }]}>
        <View style={[styles.header, {width: windowsWidth}]}>
          <View style={{
            position: 'absolute',
            top: 20,
            left: 20,
            width: windowsWidth,
            height: windowsHeight,
          }}
          >
            <Image style={{ width: 138 * 2.5, height: 83 * 2.5 }} source={require('../images/3/3.png')} />
          </View>
          <View style={{
            position: 'absolute',
            top: 25,
            left: 40,
            width: windowsWidth,
            height: windowsHeight,
          }} level={-15}
          >
            <Image style={{ width: 103 * 2.5, height: 42 * 2.5 }} source={require('../images/3/4.png')} />
          </View>
          <View level={10}>
            <Image style={{ width: 95 * 2.5, height: 55 * 2.5 }} source={require('../images/3/1.png')} />
          </View>
          <View style={{
            position: 'absolute',
            top: 65,
            left: 120,
            width: windowsWidth,
            height: windowsHeight,
          }} level={25}
          >
            <Image style={{ width: 47 * 2.5, height: 43 * 2.5 }} source={require('../images/3/2.png')} />
          </View>
        </View>
        <View style={styles.info}>
          <View level={10}><Text style={styles.title}>Title!</Text></View>
          <View level={15}><Text style={styles.description}>description!</Text></View>
        </View>
      </View>
      <View style={[styles.slide, { backgroundColor: '#DB4302' }]}>
        <View style={[styles.header, {width: windowsWidth}]}>
          <View style={{
            position: 'absolute',
            top: 25,
            left: 55,
            width: windowsWidth,
            height: windowsHeight,
          }} level={15}
          >
            <Image style={{ width: 96 * 2.5, height: 69 * 2.5 }} source={require('../images/4/4.png')} />
          </View>
          <View>
            <Image style={{ width: 50 * 2.5, height: 63 * 2.5 }} source={require('../images/4/1.png')} />
          </View>
          <View style={{
            position: 'absolute',
            top: 20,
            left: 70,
            width: windowsWidth,
            height: windowsHeight,
          }} level={20}
          >
            <Image style={{ width: 46 * 2.5, height: 98 * 2.5 }} source={require('../images/4/3.png')} />
          </View>
        </View>
        <View style={styles.info}>
          <View level={10}><Text style={styles.title}>Title!</Text></View>
          <View level={15}><Text style={styles.description}>description!</Text></View>
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
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
    padding: 15,
  },
  header: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pic: {
    width: 75 * 2,
    height: 63 * 2,
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  info: {
    flex: 0.5,
    alignItems: 'center',
    padding: 40
  },
  title: {
    color: '#fff',
    fontSize: 30,
    paddingBottom: 20,
  },
  description: {
    color: '#fff',
    fontSize: 20,
  },
  separator: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: '#8E8E8E',
  },
});

module.exports = StartScene;