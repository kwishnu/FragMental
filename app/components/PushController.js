//this module doesn't appear to be necessary, probably delete...


import React, { Component } from 'react';
import PushNotification from 'react-native-push-notification';
export default class PushController extends Component {
  componentDidMount() {
    PushNotification.configure({
        message: "A new Daily Puzzle is in!",
        vibrate: true,
        soundName: 'plink.mp3',
        repeatType: 'time',
        repeatTime: 10000,
        date: date,
        id: '777',
        onNotification: function(notification) {
            console.log('notif');
        },
    });
  }

  render() {
    return null;
  }
}