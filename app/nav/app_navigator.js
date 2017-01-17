'use strict';
import React, {Component} from 'react';
import { Navigator } from 'react-native';

const SplashScreen = require('../routes/splash_screen');
const StartScene = require('../routes/start_scene');
const PuzzlesContents = require('../routes/puzzles_contents');
const DailyLaunch = require('../routes/p_daily_launch');
const PuzzlesLaunch = require('../routes/puzzles_launch');
const Game = require('../routes/game');
const StoreListView = require('../routes/store_listview');
const ComboStore = require('../routes/store_listview3');
const Settings = require('../routes/settings');

class AppNavigator extends React.Component {
    constructor(props) {
        super(props);
    }
    navigatorRenderScene(routeID) {
        switch (routeID) {
            case 'splash screen':
                return SplashScreen;
            case 'start scene':
                return StartScene;
            case 'puzzles contents':
                return PuzzlesContents;
            case 'daily launcher':
                return DailyLaunch;
            case 'puzzle launcher':
                return PuzzlesLaunch;
            case 'game board':
                return Game;
            case 'store':
                return StoreListView;
            case 'combo store':
                return ComboStore;
            case 'settings':
                return Settings;

            // Add more ids here
        }
    }

    render() {
        return (
            <Navigator
              initialRoute={ { id: 'splash screen' } }
              renderScene={(route, navigator) => {
                return React.createElement(this.navigatorRenderScene(route.id), { ...this.props, ...route.passProps, navigator, route } );
              }} />
        );
    }
}

module.exports = AppNavigator;
