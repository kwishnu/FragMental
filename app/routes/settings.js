import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, Picker, BackAndroid, AsyncStorage } from 'react-native';
import {Switch} from '../components/Switch';
import Button from '../components/Button';
var styles = require('../styles/styles');
var {width, height} = require('Dimensions').get('window');
var KEY_Sound = 'soundKey';
//var PushNotification = require('react-native-push-notification');

module.exports = class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 'settings',
            sounds_text: 'Game sounds off',
            sounds_switch_state: false,
            notif_time: '7:00 am'
        };
        this.handleHardwareBackButton = this.handleHardwareBackButton.bind(this);
    }
    componentDidMount(){
        BackAndroid.addEventListener('hardwareBackPress', this.handleHardwareBackButton);
        AsyncStorage.getItem(KEY_Sound).then((sounds) => {
            if (sounds !== null) {
                var textToUse = (sounds == 'true')?'Game sounds on':'Game sounds off';
                var stateToUse = (sounds == 'true')?true:false;

                this.setState({
                    sounds_text: textToUse,
                    sounds_switch_state: stateToUse
                });
            }else{
                try {
                    AsyncStorage.setItem(KEY_Sound, 'false');//
                } catch (error) {
                    window.alert('AsyncStorage error: ' + error.message);
                }
            }
        })
    }
    componentWillUnmount () {
        BackAndroid.removeEventListener('hardwareBackPress', this.handleHardwareBackButton);
    }
    handleHardwareBackButton() {
        try {
            this.props.navigator.pop({
                id: 'puzzles contents',
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
    border(color) {
        return {
            borderColor: color,
            borderWidth: 2,
        };
    }
    toggleGameSounds(state){
        var textToUse = (state)?'Game sounds on':'Game sounds off';
        this.setState({sounds_text:textToUse});
        try {
            AsyncStorage.setItem(KEY_Sound, state.toString());
        } catch (error) {
            window.alert('AsyncStorage error: ' + error.message);
        }
    }



    render() {
        return (
                <View style={settings_styles.container}>
                    <View style={ settings_styles.header }>
                        <Button style={{left: 10}} onPress={ () => this.handleHardwareBackButton() }>
                            <Image source={ require('../images/arrow_back.png') } style={ { width: 32, height: 32 } } />
                        </Button>
                        <Text style={styles.header_text} >Settings
                        </Text>
                        <Button>
                            <Image source={ require('../images/no_image.png') } style={ { width: 32, height: 32 } } />
                        </Button>
                    </View>
                    <View style={settings_styles.settings_container}>
                        <View style={settings_styles.parameter_container}>
                            <View style={[settings_styles.text_container, {alignItems: 'flex-end'}]}>
                                <Text style={settings_styles.text}>{this.state.sounds_text}</Text>
                            </View>
                            <View style={settings_styles.switch_container}>
                                <Switch value={this.state.sounds_switch_state} onValueChange={(state)=>{this.toggleGameSounds(state)}}/>
                            </View>
                        </View>
                        <View style={settings_styles.parameter_container}>
                            <View style={settings_styles.text_container}>
                                <Text style={[settings_styles.text, {paddingLeft: 15}]}>Use Puzzle Pack colors...</Text>
                            </View>
                        </View>

                        <View style={settings_styles.parameter_container}>
                            <View style={[settings_styles.text_container, {alignItems: 'flex-end'}]}>
                                <Text style={settings_styles.text}>in Launcher:</Text>
                            </View>

                            <View style={settings_styles.switch_container}>
                                <Switch value={this.state.sounds_switch_state} onValueChange={(state)=>{this.toggleGameSounds(state)}}/>
                            </View>
                        </View>
                        <View style={settings_styles.parameter_container}>
                            <View style={[settings_styles.text_container, {alignItems: 'flex-end'}]}>
                                <Text style={settings_styles.text}>in Game:</Text>
                            </View>
                            <View style={settings_styles.switch_container}>
                                <Switch value={this.state.sounds_switch_state} onValueChange={(state)=>{this.toggleGameSounds(state)}}/>
                            </View>
                        </View>
                        <View style={settings_styles.parameter_container}>
                            <Picker
                                style={settings_styles.picker}
                                selectedValue={this.state.notif_time}
                                onValueChange={(notif_time) => this.setState({ notif_time })}
                            >
                                <Picker.Item label='5:00 am' value={'5:00 am'} />
                                <Picker.Item label='6:00 am' value={'6:00 am'} />
                                <Picker.Item label='7:00 am' value={'7:00 am'} />
                                <Picker.Item label='8:00 am' value={'8:00 am'} />
                                <Picker.Item label='9:00 am' value={'9:00 am'} />

                            </Picker>

                        </View>

                    </View>
                </View>
    );
  }
//                    <View style={ settings_styles.listview_container }>
//                        <Switch onChangeState={(state)=>{alert(state)}}/>
//                    </View>
};


const settings_styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#486bdd',
    },
    header: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 6,
        width: width,
        backgroundColor: '#12046c',
    },
    settings_container: {
        flex: 13,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    parameter_container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        width: width,
    },
    text_container: {
        flex: 3,
        justifyContent: 'center',
        padding: 6,

    },
    switch_container: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: 6,
    },
    text: {
        color: 'white',
    },
    picker: {
        width: 100,

    },
});

