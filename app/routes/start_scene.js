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
import AppIntro from 'react-native-app-intro';
var KEY_UseNumLetters = 'numLetters';
var {width, height} = require('Dimensions').get('window');


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

    render() {
        return (
            <AppIntro onDoneBtnClick={this.doneBtnHandle} onSkipBtnClick={this.onSkipBtnHandle}>
                <View style={[styles.slide,{ backgroundColor: '#081262' }]}>
                    <View style={styles.header}>
                        <View style={[styles.pic, {top: -10, left: width*.05,}]} level={-15}>
                            <Image style={{ width: width*.7, height: width*.7 }} source={require('../images/intro1/gradient2.png')} />
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
                        <View level={15}><Text style={styles.description}>Welcome to</Text></View>
                        <View level={10}><Text style={styles.title}>FragMental!</Text></View>
                        <View style={styles.center_text_view}>
                            <View level={0}><Text style={styles.description}>Swipe through for a quick tutorial...</Text></View>
                        </View>
                    </View>
                </View>
                <View style={[styles.slide, { backgroundColor: '#486bdd' }]}>
                    <View style={styles.header}>
                        <View>
                            <Image style={{ width: 75 * 2.5, height: 63 * 2.5 }} source={require('../images/2/1.png')} />
                        </View>
                        <View style={[styles.pic, {
                        top: 30,
                        left: 40,
                        }]} level={20}
                        >
                            <Image style={{ width: 101 * 2.5, height: 71 * 2.5 }} source={require('../images/2/2.png')} />
                        </View>
                        <View style={[styles.pic, {
                        top: 10,
                        left: 50,
                        }]} level={-20}
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
                    <View style={styles.header}>
                    <View style={[styles.pic, {
                    top: 20,
                    left: 20,
                    }]}
                    >
                    <Image style={{ width: 138 * 2.5, height: 83 * 2.5 }} source={require('../images/3/3.png')} />
                    </View>
                    <View style={[styles.pic, {
                    top: 25,
                    left: 40,
                    }]} level={-15}
                    >
                    <Image style={{ width: 103 * 2.5, height: 42 * 2.5 }} source={require('../images/3/4.png')} />
                    </View>
                    <View level={10}>
                    <Image style={{ width: 95 * 2.5, height: 55 * 2.5 }} source={require('../images/3/1.png')} />
                    </View>
                    <View style={[styles.pic, {
                    top: 65,
                    left: 120,
                    }]} level={25}
                    >
                    <Image style={{ width: 47 * 2.5, height: 43 * 2.5 }} source={require('../images/3/2.png')} />
                    </View>
                    </View>
                    <View style={styles.info}>
                    <View level={10}><Text style={styles.title}>Title!</Text></View>
                    <View level={15}><Text style={styles.description}>description!</Text></View>
                    </View>
                </View>
                <View style={[styles.slide, { backgroundColor: '#081262' }]}>
                    <View style={styles.header}>
                        <View>
                            <Image style={{ width: 75 * 2.5, height: 63 * 2.5 }} source={require('../images/2/1.png')} />
                        </View>
                        <View style={[styles.pic, {
                        top: 30,
                        left: 40,
                        }]} level={20}
                        >
                            <Image style={{ width: 101 * 2.5, height: 71 * 2.5 }} source={require('../images/2/2.png')} />
                        </View>
                        <View style={[styles.pic, {
                        top: 10,
                        left: 50,
                        }]} level={-20}
                        >
                            <Image style={{ width: 85 * 2.5, height: 73 * 2.5 }} source={require('../images/2/3.png')} />
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
    flex: 1,
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingBottom: 20,
  },
  description: {
    color: '#fff',
    fontSize: 20,
    textAlign: 'center',
  },
  center_text_view: {
    flex: 1,
    width: width*.7,
    flexDirection: 'column',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginBottom: 40
  },
});

module.exports = StartScene;