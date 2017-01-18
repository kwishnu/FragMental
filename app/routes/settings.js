import React, { Component } from 'react';
import { ScrollView, StyleSheet, Text, View, Image, Picker, BackAndroid, AsyncStorage } from 'react-native';
import {Switch} from '../components/Switch';
import Button from '../components/Button';
var styles = require('../styles/styles');
var {width, height} = require('Dimensions').get('window');
var KEY_Sound = 'soundKey';
var KEY_Color_L = 'lColorKey';
var KEY_Color_G = 'gColorKey';
var KEY_Notifs = 'notifsKey';
var KEY_NotifTime = 'notifTimeKey';
//var PushNotification = require('react-native-push-notification');

module.exports = class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 'settings',
            sounds_text: 'Game sounds on',
            sounds_state: true,
            color_L_state: true,
            color_G_state: true,
            notifs_state: true,
            picker_enabled: true,
            notif_time: '7:00 am',
            notifOnOrOff: 'Yes, at',
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
                    sounds_state: stateToUse
                });
            }else{
                try {
                    AsyncStorage.setItem(KEY_Sound, 'true');//
                } catch (error) {
                    window.alert('AsyncStorage error: ' + error.message);
                }
            }
        });
        AsyncStorage.getItem(KEY_Color_L).then((colorsL) => {
            if (colorsL !== null) {
                var stateToUse = (colorsL == 'true')?true:false;
                this.setState({
                    color_L_state: stateToUse
                });
            }else{
                try {
                    AsyncStorage.setItem(KEY_Color_L, 'true');//
                } catch (error) {
                    window.alert('AsyncStorage error: ' + error.message);
                }
            }
        });
        AsyncStorage.getItem(KEY_Color_G).then((colorsG) => {
            if (colorsG !== null) {
                var stateToUse = (colorsG == 'true')?true:false;
                this.setState({
                    color_G_state: stateToUse
                });
            }else{
                try {
                    AsyncStorage.setItem(KEY_Color_G, 'true');//
                } catch (error) {
                    window.alert('AsyncStorage error: ' + error.message);
                }
            }
        });
        AsyncStorage.getItem(KEY_Notifs).then((notifs) => {
            if (notifs !== null) {
                var stateToUse = (notifs == 'true')?true:false;
                this.setState({
                    notifs_state: stateToUse
                });
            }else{
                try {
                    AsyncStorage.setItem(KEY_Notifs, 'true');//
                } catch (error) {
                    window.alert('AsyncStorage error: ' + error.message);
                }
            }
        });
        AsyncStorage.getItem(KEY_NotifTime).then((notifTime) => {
            if (notifTime !== null) {
                this.setState({
                    notif_time: notifTime
                });
            }else{
                try {
                    AsyncStorage.setItem(KEY_NotifTime, '7:00 am');//
                } catch (error) {
                    window.alert('AsyncStorage error: ' + error.message);
                }
            }
        });


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
    toggleColorL(state){
        try {
            AsyncStorage.setItem(KEY_Color_L, state.toString());
        } catch (error) {
            window.alert('AsyncStorage error: ' + error.message);
        }
    }
    toggleColorG(state){
        try {
            AsyncStorage.setItem(KEY_Color_G, state.toString());
        } catch (error) {
            window.alert('AsyncStorage error: ' + error.message);
        }
    }
    toggleUseNotifs(state){
        var yesOrNo = (state)?'Yes, at':'No'
        this.setState({ picker_enabled: state, notifOnOrOff: yesOrNo });
        try {
            AsyncStorage.setItem(KEY_Notifs, state.toString());
        } catch (error) {
            window.alert('AsyncStorage error: ' + error.message);
        }
    }
    setNotifTime(key: value){
        this.setState({ notif_time: key.selectedValue });
        try {
            AsyncStorage.setItem(KEY_NotifTime, key.selectedValue);
        } catch (error) {
            window.alert('AsyncStorage error: ' + error.message);
        }
    }

    render() {
        return (
                <View style={settings_styles.container}>
                    <View style={ settings_styles.header }>
                        <Button style={{left: 10}} onPress={ () => this.handleHardwareBackButton() }>
                            <Image source={ require('../images/arrow_back.png') } style={ { width: 50, height: 50 } } />
                        </Button>
                        <Text style={styles.header_text} >Settings
                        </Text>
                        <Button>
                            <Image source={ require('../images/no_image.png') } style={ { width: 50, height: 50 } } />
                        </Button>
                    </View>

                <View style={ settings_styles.settings_container }>
                <ScrollView>
                    <View>
                        <View style={[settings_styles.parameter_container, {marginTop: 40}]}>
                            <View style={[settings_styles.text_container, {alignItems: 'flex-end'}]}>
                                <Text style={settings_styles.text}>{this.state.sounds_text}</Text>
                            </View>
                            <View style={settings_styles.switch_container}>
                                <Switch value={this.state.sounds_state} onValueChange={(state)=>{this.toggleGameSounds(state)}}/>
                            </View>
                        </View>

                        <View style={settings_styles.parameter_container}>
                            <View style={settings_styles.divider}>
                            </View>
                        </View>

                        <View style={[settings_styles.parameter_container, {marginTop: 20}]}>
                            <View style={settings_styles.text_container}>
                                <Text style={[settings_styles.text, {paddingLeft: 15}]}>Use Puzzle Pack colors...</Text>
                            </View>
                        </View>

                        <View style={[settings_styles.parameter_container, {marginTop: 8}]}>
                            <View style={[settings_styles.text_container, {alignItems: 'flex-end'}]}>
                                <Text style={settings_styles.text}>in Launcher:</Text>
                            </View>

                            <View style={settings_styles.switch_container}>
                                <Switch value={this.state.color_L_state} onValueChange={(state)=>{this.toggleColorL(state)}}/>
                            </View>
                        </View>
                        <View style={[settings_styles.parameter_container, {marginTop: 20}]}>
                            <View style={[settings_styles.text_container, {alignItems: 'flex-end'}]}>
                                <Text style={settings_styles.text}>in Game:</Text>
                            </View>
                            <View style={settings_styles.switch_container}>
                                <Switch value={this.state.color_G_state} onValueChange={(state)=>{this.toggleColorG(state)}}/>
                            </View>
                        </View>
                        <View style={settings_styles.parameter_container}>
                            <View style={settings_styles.divider}>
                            </View>
                        </View>

                        <View style={[settings_styles.parameter_container, {marginTop: 20}]}>
                            <View style={settings_styles.text_container}>
                                <Text style={[settings_styles.text, {paddingLeft: 15}]}>Receive new puzzle notifications...</Text>
                            </View>
                        </View>
                        <View style={[settings_styles.parameter_container, {marginTop: 8}]}>
                            <View style={[settings_styles.text_container, {alignItems: 'flex-end'}]}>
                                <Text style={settings_styles.text}>{this.state.notifOnOrOff}</Text>
                            </View>
                            <View style={settings_styles.switch_container}>
                                <Switch value={this.state.notifs_state} onValueChange={(state)=>{this.toggleUseNotifs(state)}}/>
                            </View>
                        </View>



                        <View style={[settings_styles.parameter_container, {marginTop: 20}]}>
                            <Picker
                                enabled={this.state.picker_enabled}
                                style={settings_styles.picker}
                                selectedValue={this.state.notif_time}
                                onValueChange={(selectedValue ) => this.setNotifTime({ selectedValue  })}
                            >
                                <Picker.Item label='5:00 am' value={'5:00 am'} />
                                <Picker.Item label='6:00 am' value={'6:00 am'} />
                                <Picker.Item label='7:00 am' value={'7:00 am'} />
                                <Picker.Item label='8:00 am' value={'8:00 am'} />
                                <Picker.Item label='9:00 am' value={'9:00 am'} />

                            </Picker>

                        </View>

                    </View>
                </ScrollView>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    parameter_container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
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
        color: 'white',
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        width: width * 0.9,
        backgroundColor: '#333333',
        marginTop: 20,
    },
});

