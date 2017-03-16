import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, BackAndroid, Platform, AsyncStorage, Linking, AppState } from 'react-native';
import Button from '../components/Button';
import configs from '../config/configs';
import moment from 'moment';

var styles = require('../styles/styles');
var {width, height} = require('Dimensions').get('window');
var year = moment().year();
var KEY_ratedTheApp = 'ratedApp';

module.exports = class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 'about',
            ratedApp: false
        };
        this.goSomewhere = this.goSomewhere.bind(this);
    }
    componentDidMount(){
        BackAndroid.addEventListener('hardwareBackPress', this.goSomewhere);
        AppState.addEventListener('change', this.handleAppStateChange);
    }
    componentWillUnmount () {
        BackAndroid.removeEventListener('hardwareBackPress', this.goSomewhere);
        AppState.removeEventListener('change', this.handleAppStateChange);
    }
    handleAppStateChange=(appState)=>{
        if(appState == 'active'){
            this.props.navigator.replace({
                id: 'splash screen',
                passProps: {
                    motive: 'initialize',
                    puzzleData: this.props.puzzleData,
                }
            });
        }
    }
    goSomewhere() {
        try {
            this.props.navigator.pop({
                passProps: {
                    puzzleData: this.props.puzzleData,
                }
            });
        }
        catch(err) {
            window.alert(err.message);
        }
        return true;
    }

    rateApp(){
		let storeUrl = Platform.OS === 'ios' ?
			'http://itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?id=' + _configs.appStoreID + '&pageNumber=0&sortOrdering=2&type=Purple+Software&mt=8' :
			'market://details?id=' + configs.appStoreID;
        try {
            AsyncStorage.setItem(KEY_ratedTheApp, 'true').then(()=>{
                this.setState({ratedApp: true});
                this.props.navigator.pop({});
            });
                Linking.openURL(storeUrl);
        } catch (error) {
            window.alert('AsyncStorage error: ' + error.message);
        }
    }
    render() {
        return (
            <View style={about_styles.container}>
                <View style={ about_styles.header }>
                    <Button style={{left: 10}} onPress={ () => this.goSomewhere() }>
                        <Image source={ require('../images/arrow_back.png') } style={ { width: 50, height: 50 } } />
                    </Button>
                    <Text style={about_styles.header_text} >About FragMental</Text>
                    <Button>
                        <Image source={ require('../images/no_image.png') } style={ { width: 50, height: 50 } } />
                    </Button>
                </View>
                <View style={ about_styles.about_container }>
                    <Image source={ require('../images/logo.png') } style={ { width: 180, height: 60 } } />
                    <View style={about_styles.parameter_container}>
                        <View style={about_styles.divider}>
                        </View>
                    </View>
                    <Text style={about_styles.text}>{'FragMental   v.' + configs.versionName}</Text>
                    <Text style={about_styles.finePrint}>All rights reserved</Text>
                    <Text style={about_styles.finePrint}>baked beans software</Text>
                    <Text style={about_styles.finePrint}>{'\u00A9' + ' ' + year}</Text>
                    <View style={about_styles.parameter_container}>
                        <View style={about_styles.divider}>
                        </View>
                    </View>
                    <Text style={about_styles.mediumPrint}>{'If you enjoy our app, please take a moment to rate us in the store via the button below...we\'ll thank you with 6 hints for every puzzle!'}</Text>
                    <Button style={about_styles.button} onPress={() => this.rateApp()}>
                        <Text style={about_styles.sure}>Sure!</Text>
                    </Button>
                </View>
            </View>
        );
    }
}



const about_styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#060e4c',
    },
    header: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 6,
        width: width,
        backgroundColor: '#486bdd',
    },
    about_container: {
        flex: 15,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header_text: {
        color: '#e3e004',
        fontSize: 18,
    },
    text: {
        color: 'white',
        fontSize: 18,
        marginBottom: 10
    },
    mediumPrint: {
        color: '#e3e004',
        fontSize: 16,
        marginLeft: 32,
        marginRight: 32,
        marginTop: 6,
        marginBottom:6,
        textAlign: 'center',
    },
    finePrint: {
        color: '#999999',
        fontSize: 14,
    },
    sure: {
        color: '#111111',
        fontSize: 14,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        width: width * 0.75,
        backgroundColor: '#333333',
        margin: 20,
    },
    button: {
        height: 40,
        width: width * 0.6,
        backgroundColor: '#4aeeb2',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
        borderWidth: 1,
        borderColor: 'yellow',
        borderRadius: 2
    }
});
