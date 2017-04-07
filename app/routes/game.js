import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, BackAndroid, AsyncStorage, Animated, ActivityIndicator, Easing, Alert, Platform, Linking, AppState, NetInfo } from 'react-native';
import moment from 'moment';
import Button from '../components/Button';
import DropdownMenu from '../components/DropdownMenu';
import configs from '../config/configs';
var Sound = require('react-native-sound');

function randomNum(low, high) {
    high++;
    return Math.floor((Math.random())*(high-low))+low;
}
function shadeColor(color, percent) {
        var R = parseInt(color.substring(1,3),16);
        var G = parseInt(color.substring(3,5),16);
        var B = parseInt(color.substring(5,7),16);

        R = parseInt(R * (100 + percent) / 100);
        G = parseInt(G * (100 + percent) / 100);
        B = parseInt(B * (100 + percent) / 100);

        R = (R<255)?R:255;
        G = (G<255)?G:255;
        B = (B<255)?B:255;

        var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
        var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
        var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

        return '#'+RR+GG+BB;
}
function shadeColor2(color, percent) {
    percent = percent/100;
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}
function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    r= (r.length < 2)?'0' + r:r;
    g= (g.length < 2)?'0' + g:g;
    b= (b.length < 2)?'0' + b:b;
    // pad each with zeros and return
    return "#" + (r) + (g) + (b);
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


var deepCopy = require('../data/deepCopy.js');
var fragData = require('../data/objPassed.js');
var styles = require('../styles/styles');
var {width, height} = require('Dimensions').get('window');
var SPRING_CONFIG = {bounciness: 0, speed: .5};//{tension: 2, friction: 3, velocity: 3};//velocity: .1};
var timeoutHandle;
var KEY_Puzzles = 'puzzlesKey';
var KEY_solvedTP = 'solvedTP';
var KEY_daily_solved_array = 'solved_array';
var KEY_Sound = 'soundKey';
var KEY_UseNumLetters = 'numLetters';
var KEY_ratedTheApp = 'ratedApp';
var dataBackup = {};
var puzzleData = {};
var dsArray = [];
var playedPlinkLast = false;
const click = new Sound('click.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    window.alert('Sound file not found');
  }
});
const plink1 = new Sound('plink.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    window.alert('Sound file not found');
  }
});
const plink2 = new Sound('plink.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    window.alert('Sound file not found');
  }
});
const slide = new Sound('slide.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    window.alert('Sound file not found');
  }
});
const blat = new Sound('blat.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    window.alert('Sound file not found');
  }
});
const fanfare = new Sound('fanfare.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    window.alert('Sound file not found');
  }
});

// {/* ... */} for JSX commenting
class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 'game board',
 //*********** sender info: **********//
            fromWhere: this.props.fromWhere,
            myTitle: this.props.myTitle,
            daily_solvedArray: this.props.daily_solvedArray,
 //***********************************//
            puzzleData: this.props.puzzleData,
            puzzleArray: [],//this.props.puzzleArray,
            dataElement: this.props.dataElement,
            title: this.props.title,
            index: this.props.index,
            keyFrag: '',//this.props.keyFrag,
            theData: {},//this.props.theData,
            theCluesArray: [],//this.props.theCluesArray,
            solvedArray: [],//new Array(this.props.theCluesArray.length),
            currentClue: '',//this.props.theCluesArray[0],
            currentFrags: '',//this.props.theCluesArray[0].substring(0, this.props.theCluesArray[0].indexOf(':')),
            numFrags: 0,//(this.props.theCluesArray[0].substring(0, this.props.theCluesArray[0].indexOf(':')).split('|')).length,
            answerText: '',
            score: 10,
            onThisClue: 0,
            onThisFrag: 0,
            fragOpacity: 1,
            forwardBackOpacity: 0,
            pan: new Animated.ValueXY(),
            fadeAnim: new Animated.Value(1),
            goLeft: 250,
            columnSort: -1,
            answer0: '',
            answer1: '',
            answer2: '',
            answer3: '',
            answer4: '',
            answer5: '',
            answer6: '',
            answer7: '',
            answer8: '',
            answer9: '',
            answer10: '',
            answer11: '',
            answer12: '',
            answer13: '',
            answer14: '',
            isLoading: true,
            puzzleSolved: false,
            wentBust: false,
            scoreColor: '#ffffff',
            hint1Color: '#ffffff',
            hint2Color: '#ffffff',
            hint3Color: '#ffffff',
            hint4Color: '#ffffff',
            hint5Color: '#ffffff',
            hint6Color: '#ffffff',
            hintOpacity: 0,
            numHints: 0,
            useNumLetters: true,
            bgColor: this.props.bgColor,
            headerColor: '',
            cluesBgColor: '',
            clueTextColor: '',
            titleColor: '',
            textColor: '',
            arrowImage: require('../images/arrow_forward.png'),
            replayImage: require('../images/replay.png'),
            ellipsisImage: require('../images/dropdown.png'),
            hasRated: this.props.hasRated,
            shouldShowDropdown: false,
            dropdownImage: require('../images/dropdown.png'),
            soundString: 'Mute Sounds',
            useSounds: true,
            wentToRate: false
        };
        this.handleHardwareBackButton = this.handleHardwareBackButton.bind(this);
    }
    componentDidMount() {
        BackAndroid.addEventListener('hardwareBackPress', this.handleHardwareBackButton);
        AppState.addEventListener('change', this.handleAppStateChange);
        puzzleData = this.state.puzzleData;
        this.setColors();
        this.setRated();
        AsyncStorage.getItem(KEY_UseNumLetters).then((value) => {
            var valueToBool = (value == 'true')?true:false;
            this.setState({useNumLetters: valueToBool});
            this.storeGameVariables(this.state.index);
            this.setState({isLoading: false});
        });
        AsyncStorage.getItem(KEY_Sound).then((sounds) => {
            if (sounds !== null) {
                var soundStr = (sounds == 'true')?'Mute Sounds':'Use Sounds';
                var soundBool = (sounds == 'true')?true:false;
                this.setState({soundString: soundStr,
                                useSounds: soundBool
                });
            }else{
                try {
                    AsyncStorage.setItem(KEY_Sound, 'true');//
                } catch (error) {
                    window.alert('AsyncStorage error: ' + error.message);
                }
            }
        })
    }
    componentWillUnmount () {
        BackAndroid.removeEventListener('hardwareBackPress', this.handleHardwareBackButton);
        AppState.removeEventListener('change', this.handleAppStateChange);
    }
    handleHardwareBackButton() {
        if(this.state.shouldShowDropdown){
            this.setState({ shouldShowDropdown: false });
        }else{
            this.closeGame();
        }
        return true;
    }
    handleAppStateChange=(appState)=>{
        if(appState == 'active' && this.state.wentToRate == true){
            this.reset_scene();
        }
     }
    setRated(){
        var numToUse = (this.state.hasRated == 'true')?6:2;
        var opacityToUse = (this.state.hasRated == 'true')?1:0;
        this.setState({
            hintOpacity: opacityToUse,
            numHints: numToUse
        });
    }
    setColors(){
        var bgC = this.props.bgColor;
        var fieldColor = shadeColor2(bgC, -10);;//(bgC, 50);
        var headColor =  shadeColor2(bgC, -30);
        var cluebgColor = shadeColor2(bgC, 30);
        var txtColor = invertColor(fieldColor, true);
        var titletextColor = invertColor(headColor, true);
        var cluetextColor = invertColor(cluebgColor, true);
        titletextColor = (bgC == '#09146d')?'#e3e004':titletextColor;
        cluebgColor = (bgC == '#09146d')?'blue':cluebgColor;
        this.setState({
            bgColor: fieldColor,
            headerColor: headColor,
            cluesBgColor: cluebgColor,
            clueTextColor: cluetextColor,
            titleColor: titletextColor,
            textColor: txtColor
        });
    }
    getStyle() {
    return [
              game_styles.word_container,
              {opacity: this.state.fadeAnim},
              {transform: this.state.pan.getTranslateTransform()}
            ];
    }
    darkBorder(color) {
        var darkerColor = shadeColor2(color, -30);
            return {borderColor: darkerColor};
    }
    border(color) {
        return {
            borderColor: color,
            borderWidth: 2,
        }
    }
    storeGameVariables(index){
        dsArray = this.state.daily_solvedArray;
        var fragObject = owl.deepCopy(fragData);
        var puzzString = this.state.puzzleData[this.props.dataElement].puzzles[index];
        var puzzArray = puzzString.split('~');
        var fragsArray = [];
        var fragsPlusClueArr =  puzzArray[1].split('**');

        for(var i=0; i<fragsPlusClueArr.length; i++){
            var splits = fragsPlusClueArr[i].split(':');
            var frags = splits[0].split('|');
            for(var j=0; j<frags.length; j++){
                fragsArray.push(frags[j]);
            }
        }
        fragsArrayShuffled = shuffleArray(fragsArray);
        var countTo20 = 0;
        for(var k=0; k<fragsArrayShuffled.length; k++){
            if(fragsArrayShuffled[k]!='^'){
            fragObject[countTo20].frag= fragsArrayShuffled[k];
            countTo20++;
            }
        }
        var arr = new Array(fragsPlusClueArr.length).fill('');
        dataBackup = owl.deepCopy(fragObject);
        this.setState({
            solvedArray: arr,
            keyFrag: puzzArray[0],
            theData: fragObject,
            theCluesArray: fragsPlusClueArr,
            currentClue: fragsPlusClueArr[0],
            currentFrags: fragsPlusClueArr[0].substring(0, fragsPlusClueArr[0].indexOf(':')),
            numFrags: (fragsPlusClueArr[0].substring(0, fragsPlusClueArr[0].indexOf(':')).split('|')).length,
        });
    }
    reset_scene(){
        this.setRated();
        var data =  this.state.theData;
            for(var i=0; i<data.length; i++){
                data[i].frag = dataBackup[i].frag;
                data[i].opacity = dataBackup[i].opacity;
            }
        var arr = Array(this.state.solvedArray.length).fill('');
        var resetOpacity = new Animated.Value(1);
        this.setState({ theData: data,
                        answerText: '',
                        fadeAnim: resetOpacity,
                        dropdownImage: require('../images/dropdown.png'),
                        shouldShowDropdown: false,
                        fragOpacity: 1,
                        forwardBackOpacity: 0,
                        goLeft: 250,
                        columnSort: -1,
                        onThisClue: 0,
                        onThisFrag: 0,
                        currentClue: this.state.theCluesArray[0],
                        currentFrags: this.state.theCluesArray[0].substring(0, this.state.theCluesArray[0].indexOf(':')),
                        numFrags:  (this.state.theCluesArray[0].substring(0, this.state.theCluesArray[0].indexOf(':')).split('|')).length,
                        solvedArray: arr,
                        score: 10,
                        scoreColor: '#ffffff',
                        hint1Color: '#ffffff',
                        hint2Color: '#ffffff',
                        hint3Color: '#ffffff',
                        hint4Color: '#ffffff',
                        hint5Color: '#ffffff',
                        hint6Color: '#ffffff',
                        hintOpacity: this.state.hintOpacity,
                        numHints: this.state.numHints,
                        answer0: '',
                        answer1: '',
                        answer2: '',
                        answer3: '',
                        answer4: '',
                        answer5: '',
                        answer6: '',
                        answer7: '',
                        answer8: '',
                        answer9: '',
                        answer10: '',
                        answer11: '',
                        answer12: '',
                        answer13: '',
                        answer14: '',
                        puzzleSolved: false,
                        wentBust: false,
                        isLoading: false,
                        bgColor: this.props.bgColor,
                    });
    }
    closeGame() {
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
            for (var r=0; r<10; r++){
//                var rand0to9 = randomNum(0, 9);
                if (myPackArray.indexOf(puzzleData[levels[i]].data[rand0to9[r]].name) < 0){
                    titleIndex = rand0to9[r];
                    break;
                }
            }
            if (titleIndex !== -1){
                puzzleData[20 + i].title = '*' + puzzleData[levels[i]].data[titleIndex].name;
                puzzleData[20 + i].product_id = '*' + puzzleData[levels[i]].data[titleIndex].product_id;
                puzzleData[20 + i].bg_color = puzzleData[levels[i]].data[titleIndex].color;
            }else{
                puzzleData[20 + i].show = 'false';
            }
        }
        try {
            this.props.navigator.replace({
                id: this.props.fromWhere,
                passProps: {
                    puzzleData: puzzleData,
                    daily_solvedArray: this.state.daily_solvedArray,
                    dataElement: this.props.dataElement,
                    hasRated: this.state.hasRated,
                    puzzleArray: this.props.puzzleArray,
                    textColor: this.props.textColor,
                    bgColor: this.props.bgColor,
                    title: this.props.myTitle,
                },
            });
            return true;
        } catch(err)  {
            window.alert(err.message)
            return true;
        }
    }
    nextGame(){
        if(!this.state.forwardBackOpacity)return;//keep transparent arrow from responding to touches
        if(this.props.fromWhere == 'puzzles contents'){this.closeGame();return;}
        var newIndex = (parseInt(this.state.index, 10) + 1).toString();
        this.setState({daily_solvedArray: dsArray,
                        isLoading: true,
                        index: newIndex,
                        });
        var onLastGameInPack = (this.props.fromWhere == 'puzzles contents' || parseInt(this.state.index, 10) + 1 == parseInt(this.props.puzzleData[this.props.dataElement].num_puzzles, 10))?true:false;
        if (onLastGameInPack){
            this.closeGame();
        }else{
            this.storeGameVariables(newIndex);
            var nextTitle = '';
            if(this.props.fromWhere == 'daily launcher'){
                var today = moment(this.state.title, 'MMMM D, YYYY');
                nextTitle = today.subtract(1, 'days').format('MMMM D, YYYY');
            }else{
                nextTitle = (parseInt(this.state.title, 10) + 1).toString();
            }
            this.setState({ title: nextTitle, forwardBackOpacity: 0 });
            setTimeout(() => {this.reset_scene()}, 500);
        }
    }
    guess(which, howMuchToScore) {
        if(this.state.puzzleSolved == true){this.nextGame();}
        var solved = this.state.puzzleSolved;
        var bust = this.state.wentBust;
            if(solved || bust){return}

        var entire_puzzleSolved = false;
        var theFrag = '';
        var scoreToAdd = 1;
        var data =  this.state.theData;
        var onClue = this.state.onThisClue;
        var currClue = this.state.currentClue;
        var gl = this.state.goLeft;
        var colSort = this.state.columnSort;

        if(which==100){
            theFrag = this.state.keyFrag;
        }else{
            var theFrag = data[which].frag;
            if(data[which].opacity==0)return;
        }
        var guessFragsArray = this.state.currentFrags.split('|');
        var onFrag = this.state.onThisFrag;
        if(theFrag == guessFragsArray[onFrag] || (theFrag == this.state.keyFrag && guessFragsArray[onFrag] == '^')){
            if(which<100){
                //data[which].frag = '';
                data[which].opacity = 0;
            }
            var theWord = this.state.answerText;
            theWord += theFrag;
            onFrag++;
            var newCurrentFrags = currClue.substring(0, currClue.indexOf(':'));
            var newNumFrags = (currClue.substring(0, currClue.indexOf(':')).split('|')).length;
            var sArray = this.state.solvedArray;
            solved = (onFrag ==  this.state.numFrags)?true:false;

            if(!solved){
                if(this.state.useSounds == true){
                    if (playedPlinkLast){
                        plink2.play();
                        playedPlinkLast = false;
                    }else{
                        plink1.play();
                        playedPlinkLast = true;
                    }
                }
            }else{
                onFrag  = 0;
                scoreToAdd = 3;
                sArray[onClue]='solved';
                entire_puzzleSolved = true;
                colSort++;
                switch(gl){
                    case 250:
                        gl = -100;
                        break;
                    case -100:
                        gl = 20;
                        break;
                    case 20:
                        gl = 250;
                        break;
                    default: gl = -100;
                }

                for(goThru_sArray=onClue + 1;goThru_sArray<onClue + sArray.length;goThru_sArray++){
                    if(sArray[goThru_sArray % sArray.length]==''){
                        onClue = goThru_sArray % sArray.length;
                        currClue =  this.state.theCluesArray[onClue]
                        entire_puzzleSolved = false;
                        newCurrentFrags = currClue.substring(0, currClue.indexOf(':'));
                        newNumFrags = (currClue.substring(0, currClue.indexOf(':')).split('|')).length;

                        break;
                    }
                }
                if (entire_puzzleSolved){
                    if(this.state.useSounds == true){fanfare.play();}
                    if(this.props.fromWhere == 'daily launcher'){
                        dsArray[this.state.index] = '1';
                    }
                    if(this.props.fromWhere == 'puzzle launcher'){
                        var newNumSolved = (parseInt(this.props.puzzleData[this.props.dataElement].num_solved, 10) + 1).toString();
                        this.props.puzzleData[this.props.dataElement].num_solved = newNumSolved;
                        var onLastGameInPack=(parseInt(this.state.index, 10) + 1 == parseInt(this.props.puzzleData[this.props.dataElement].num_puzzles, 10))?true:false;
                        if(onLastGameInPack){this.props.puzzleData[this.props.dataElement].type = 'solved';}
                        try {
                            AsyncStorage.setItem(KEY_Puzzles, JSON.stringify(this.props.puzzleData));
                        } catch (error) {
                            window.alert('AsyncStorage error: ' + error.message);
                        }
                    }
                    try {
                        AsyncStorage.setItem(KEY_daily_solved_array, JSON.stringify(dsArray));
                    } catch (error) {
                        window.alert('AsyncStorage error: ' + error.message);
                    }
                    if(this.props.fromWhere == 'puzzles contents'){
                        try {
                            AsyncStorage.setItem(KEY_solvedTP, 'true');
                        } catch (error) {
                            window.alert('AsyncStorage error: ' + error.message);
                        }
                    }
                    var accolades = 'Right on!*You\'re so smart!*Nice going!*Way to go!*Good work!*Good job!*That\'s it!*Congratulations!*Now you have it!*Good for you!*Couldn\'t have done it better myself!*That\'s the right way to do it!*You did it that time!*That\'s not half bad!*Nice going!*That\'s the way!*That\'s the way to do it!*You\'ve got your brain in gear today!*Excellent!*Wonderful!*That\'s great!*You\'ve got that down!*That\'s it!*Good going!*Good for you!*I think you\'ve got it now!*Way to go!'.split('*');
                    var accolade = accolades[Math.floor(Math.random()*accolades.length)];


                    if(this.state.score < 40){
                        currClue = accolade;
                    }else{
                        var toAdd = this.state.score;
                        if(howMuchToScore>0)toAdd = toAdd + scoreToAdd;
                        currClue = accolade.replace('!', '...' + toAdd + ' points!');
                    }
                }
            }
            this.setState({ theData: data,
                            daily_solvedArray: dsArray,
                            answerText: theWord,
                            onThisClue: onClue,
                            onThisFrag: onFrag,
                            currentFrags: newCurrentFrags,
                            numFrags: newNumFrags,
                            puzzleSolved: entire_puzzleSolved,
                            solvedArray: sArray,
                            goLeft: gl,
                            columnSort: colSort,
                            currentClue: currClue
                        });
            if(howMuchToScore>0) {
                this.score_increment(scoreToAdd);
            }else{
                if(this.state.useSounds == true){blat.play();}
                this.score_decrement(1);
            }
        }else{
            if(this.state.useSounds == true){blat.play();}
            this.score_decrement(1);
        }
        if (solved){//at least one clue is solved
            if(this.state.useSounds == true && !entire_puzzleSolved)slide.play();//only a word, not the entire puzzle
            this.animate_word(currClue, theWord, colSort, gl, entire_puzzleSolved);
        };
    }
    animate_word(newClue, ansWord, whichCol, direction, endOfGame){
        this.set_column_word(newClue, ansWord, whichCol)
        Animated.parallel([
            Animated.spring(
                this.state.pan, {
                    ...SPRING_CONFIG,
                    overshootClamping: true,
                    easing: Easing.linear,
                    toValue: {x: direction, y: -200}
                }),
            Animated.timing(
                this.state.fadeAnim, {
                    toValue: 0,
                    easing: Easing.linear,
                    duration: 250,
                }),
        ]).start(() => this.restore_word(newClue, ansWord, whichCol, endOfGame));
    }
    restore_word(newClue, ansWord, whichCol, endOfGame){
        this.setState({ answerText:''});
        Animated.sequence([
            Animated.spring(
                this.state.pan, {
                    ...SPRING_CONFIG,
                    overshootClamping: true,
                    easing: Easing.linear,
                    toValue: {x: 0, y: 0}
                }),
            Animated.timing(
                this.state.fadeAnim, {
                    toValue: 1,
                    easing: Easing.linear,
                    duration: 0,
                }),
        ]).start(()=>this.endOfGame(endOfGame));
    }
    set_column_word(newClue, ansWord, whichCol){
        switch(whichCol){
            case 0:
                this.setState({ answer0: ansWord, currentClue: newClue});
                break;
            case 1:
                this.setState({ answer1: ansWord, currentClue: newClue});
                break;
            case 2:
                this.setState({ answer2: ansWord, currentClue: newClue});
                break;
            case 3:
                this.setState({ answer3: ansWord, currentClue: newClue});
                break;
            case 4:
                this.setState({ answer4: ansWord, currentClue: newClue});
                break;
            case 5:
                this.setState({ answer5: ansWord, currentClue: newClue});
                break;
            case 6:
                this.setState({ answer6: ansWord, currentClue: newClue});
                break;
            case 7:
                this.setState({ answer7: ansWord, currentClue: newClue});
                break;
            case 8:
                this.setState({ answer8: ansWord, currentClue: newClue});
                break;
            case 9:
                this.setState({ answer9: ansWord, currentClue: newClue});
                break;
            case 10:
                this.setState({ answer10: ansWord, currentClue: newClue});
                break;
            case 11:
                this.setState({ answer11: ansWord, currentClue: newClue});
                break;
            case 12:
                this.setState({ answer12: ansWord, currentClue: newClue});
                break;
            case 13:
                this.setState({ answer13: ansWord, currentClue: newClue});
                break;
            case 14:
                this.setState({ answer14: ansWord, currentClue: newClue});
                break;
            default:
        }
    }
    score_increment(howMuch){
        var score = parseInt(this.state.score, 10);
        score += howMuch;
        this.setState({score: score,
                       scoreColor: 'green',
                      });
    }
    score_decrement(howMuch){
        var score = parseInt(this.state.score, 10);
        score -= howMuch;
        score = (score < 0)?0:score;
        var bgc = (score < 1)?'#cd0404':this.state.bgColor;
        var bustOrNot = (score < 1)?true:false;
        if(bustOrNot){this.setState({dropdownImage: require('../images/replay.png')})}
        this.setState({score: score,
                       scoreColor: 'red',
                       bgColor: bgc,
                       wentBust: bustOrNot,
                      });
    }
    skip_to_next(){
        if(this.state.useSounds == true){click.play();}
        var solved = this.state.puzzleSolved;
        var bust = this.state.wentBust;
            if(solved || bust){return}
        var data =  this.state.theData;
        var onFrag = this.state.onThisFrag;
        var onClue = this.state.onThisClue;
        var currClue = this.state.currentClue;
        var sArray = this.state.solvedArray;
        var newCurrentFrags = currClue.substring(0, currClue.indexOf(':'));
        var newNumFrags = (currClue.substring(0, currClue.indexOf(':')).split('|')).length;
        var guessFragsArray = this.state.currentFrags.split('|');
        var theScore = this.state.score;
        var theScoreColor = this.state.scoreColor;
            for(goThru_sArray=this.state.onThisClue + 1;goThru_sArray<this.state.onThisClue + sArray.length;goThru_sArray++){
                if(sArray[goThru_sArray % sArray.length]==''){
                    onClue = goThru_sArray % sArray.length;
                    currClue =  this.state.theCluesArray[onClue]
                    newCurrentFrags = currClue.substring(0, currClue.indexOf(':'));
                    newNumFrags = (currClue.substring(0, currClue.indexOf(':')).split('|')).length;
                    break;
                }
            }
        if(onFrag > 0){
            for (restoreFrags=0; restoreFrags<onFrag; restoreFrags++){
                for (checkFrags=0; checkFrags<data.length; checkFrags++){
                    if (guessFragsArray[restoreFrags] == data[checkFrags].frag){
                        data[checkFrags].opacity = 1;
                        continue;
                    }
                }
            }
            theScoreColor = '#ffffff';
            theScore = theScore - onFrag;
            onFrag = 0;
        }
        this.setState({ currentClue: currClue,
                        onThisClue: onClue,
                        onThisFrag: onFrag,
                        currentFrags: newCurrentFrags,
                        numFrags: newNumFrags,
                        score: theScore,
                        scoreColor: theScoreColor,
                        answerText: ''
        });
    }
    give_hint(fromHintButton){
        if(this.state.numHints > 0 || !fromHintButton){
            var remainingHints = this.state.numHints - 1;
            if(fromHintButton){
                if(this.state.hasRated == 'true'){
                    switch(remainingHints){
                        case 5:
                            this.setState({
                                hint6Color: '#000',
                                numHints: remainingHints
                            });
                            break;
                        case 4:
                            this.setState({
                                hint5Color: '#000',
                                numHints: remainingHints
                            });
                            break;
                        case 3:
                            this.setState({
                                hint4Color: '#000',
                                numHints: remainingHints
                            });
                            break;
                        case 2:
                            this.setState({
                                hint3Color: '#000',
                                numHints: remainingHints
                            });
                            break;
                        case 1:
                            this.setState({
                                hint2Color: '#000',
                                numHints: remainingHints
                            });
                            break;
                        case 0:
                            this.setState({
                                hint1Color: '#000',
                                numHints: remainingHints
                            });
                            break;
                        default:
                            return;
                    }
                }else{
                    switch(remainingHints){
                        case 1:
                            this.setState({
                                hint2Color: '#000',
                                numHints: remainingHints
                            });
                            break;
                        case 0:
                            this.setState({
                                hint1Color: '#000',
                                numHints: remainingHints
                            });
                            break;
                        default:
                            return;
                    }
                }
            }
            var solved = this.state.puzzleSolved;
            var bust = this.state.wentBust;
                if(solved || bust)return;
            var data =  this.state.theData;
            var guessFragsArray = this.state.currentFrags.split('|');
            var onFrag = this.state.onThisFrag;

            if(guessFragsArray[onFrag] == '^'){
                this.guess(100, -1);
                return;
            }
            for(var goThruData = 0; goThruData<data.length; goThruData++){
                if(data[goThruData].frag == guessFragsArray[onFrag]){
                this.guess(goThruData, -1);
                return;
                }
            }
        }else if(this.state.hasRated != 'true'){
            this.showRatingDialog();
        }
    }
	showRatingDialog() {
		Alert.alert(
			'More hints?',
			'Always get 6 hints if you take just a moment to give our app a kind rating!',
			[
				{ text: 'Maybe next time', style: 'cancel' },
				{ text: 'Sure!', onPress: () => {
                    NetInfo.isConnected.fetch().then(isConnected => {
                        if (isConnected){
                            let storeUrl = Platform.OS === 'ios' ?
                                'http://itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?id=' + configs.appStoreID + '&pageNumber=0&sortOrdering=2&type=Purple+Software&mt=8' :
                                'market://details?id=' + configs.appStoreID;
                            this.setState({hasRated: 'true',
                                            wentToRate: true
                            });
                            try {
                                AsyncStorage.setItem(KEY_ratedTheApp, 'true').then(()=>{

                                    Linking.openURL(storeUrl);
                                });
                            } catch (error) {
                                window.alert('AsyncStorage error: ' + error.message);
                            }
                        }else{
                            Alert.alert('No Connection', 'Sorry, no internet available right now. Please try again later!');
                        }
                    });
				}},
			],
			{ cancelable: false }
		);
    }
    getClueText(which){
        var textToReturn = '';
        var currClue = this.state.currentClue;
        var solved = this.state.puzzleSolved;
        var counter = 0;
        for (var letter = 0; letter < this.state.currentFrags.length; letter++){
            if (currClue[letter] == '|')continue;
            if (currClue[letter] == '^'){counter = counter + this.state.keyFrag.length; continue;}
            counter++;
        }
        var nl_text = (this.state.useNumLetters == true)?(counter.toString() + '  letters'):'';
        var prefix = (this.state.useNumLetters == true)?'':(parseInt(this.state.onThisClue + 1, 10) + ':  ');
        textToReturn = prefix + currClue.substring(currClue.indexOf(':') + 1);
        textToReturn = (this.state.wentBust == true)?'Oops, try again!':textToReturn;
        solved = (solved == true || this.state.wentBust == true)?true:false;
        switch (which){
            case 'clue':
                return textToReturn;
            case 'num':
                if(!solved){
                    return nl_text;
                }else{
                    return '';
                }
            default:
        }
    }
    endOfGame(endOfGame){
        if(!endOfGame)return;
        var onLastGameInPack=(this.props.fromWhere == 'puzzles contents' || parseInt(this.state.index, 10) + 1 == parseInt(this.props.puzzleData[this.props.dataElement].num_puzzles, 10))?true:false;
        if (onLastGameInPack){
            this.setState({
                fragOpacity: 0,
                arrowImage: require('../images/arrow_backward.png'),
                forwardBackOpacity: 1,
                });
        }else{
            this.setState({
                fragOpacity: 0,
                arrowImage: require('../images/arrow_forward.png'),
                forwardBackOpacity: 1,
                });
        }
    }
    drawTiles() {
        var result = [];
        var data = this.state.theData;
        for (var index = 0; index < data.length; ++index) {
            var style = {
                left: (parseInt(data[index].col, 10) * configs.CELL_WIDTH),
                top: (parseInt(data[index].row, 10) * configs.CELL_HEIGHT),
                opacity: parseInt(data[index].opacity, 10)
            }
            var text = data[index].frag;
        result.push(this.drawTile(index, style, text));
        }
        return result;
    }
    drawTile(key, style, frag ) {
        return (
            <View key={ key } style={[styles.cell, style]}>
                <View  key={ key } style={ styles.tile } onStartShouldSetResponder={() => this.guess(key, 1)} >
                    <Text style={ styles.puzzle_text_large }>{ frag }</Text>
                </View>
            </View>
        );
    }
    showDropdown(){
        if(this.state.wentBust == false){
            this.setState({ shouldShowDropdown: true,});
        }else{
            this.reset_scene();
        }
    }
    onDropdownSelect(which){
        this.setState({ shouldShowDropdown: false });
        switch(which){
            case 0://touch outside of dropdown, just close
                break;
            case 1://toggle sounds:
                if(this.state.useSounds == true){
                    this.setState({soundString: 'Use Sounds',
                                    useSounds: false
                    });
                    try {
                        AsyncStorage.setItem(KEY_Sound, 'false');//
                    } catch (error) {
                        window.alert('AsyncStorage error: ' + error.message);
                    }
                }else{
                    plink1.play();
                    this.setState({soundString: 'Mute Sounds',
                                    useSounds: true
                    });
                    try {
                        AsyncStorage.setItem(KEY_Sound, 'true');//
                    } catch (error) {
                        window.alert('AsyncStorage error: ' + error.message);
                    }
                }
                break;
            case 2://reset scene:
                this.reset_scene();
                break;
            case 3://go to app intro 2nd page:
        try {
            this.props.navigator.push({
                id: 'start scene',
                passProps: {
                    destination: 'game board',
                    introIndex: 1,
                    }
            });
        } catch(err)  {
            window.alert(err.message)
            return true;
        }
                break;
            default:
        }
    }

    render() {
        if(this.state.isLoading == true){
            return(
                <View style={[game_styles.loading, {backgroundColor: this.state.bgColor}]}>
                    <ActivityIndicator animating={true} size={'large'}/>
                </View>
            )
        }else{
            return (
                <View style={{flex: 1}}>
                    <View style={ [game_styles.container, {backgroundColor: this.state.bgColor}, this.darkBorder(this.state.bgColor)] }>
                        <View style={ [game_styles.game_header, {backgroundColor: this.state.headerColor}]}>
                            <Button style={{left: 15}} onPress={ () => this.closeGame() }>
                                <Image source={ require('../images/close.png') } style={{ width: 50, height: 50 }} />
                            </Button>
                            <Text style={[styles.header_text, {color: this.state.titleColor}]}>{this.state.title}
                            </Text>
                            <Button style={{right: 15}} onPress={ () => this.showDropdown() }>
                                <Image source={this.state.dropdownImage} style={{ width: 50, height: 50 }} />
                            </Button>
                        </View>

                        <View style={ [game_styles.display_area, this.darkBorder(this.state.bgColor)] }>
                            <View style={ game_styles.answers_container }>
                                <View style={ game_styles.answers_column }>
                                    <Text style={[styles.answer_column_text, {color: this.state.textColor}]}>{this.state.answer0}</Text>
                                    <Text style={[styles.answer_column_text, {color: this.state.textColor}]}>{this.state.answer3}</Text>
                                    <Text style={[styles.answer_column_text, {color: this.state.textColor}]}>{this.state.answer6}</Text>
                                    <Text style={[styles.answer_column_text, {color: this.state.textColor}]}>{this.state.answer9}</Text>
                                    <Text style={[styles.answer_column_text, {color: this.state.textColor}]}>{this.state.answer12}</Text>
                                </View>
                                <View style={ game_styles.answers_column }>
                                    <Text style={[styles.answer_column_text, {color: this.state.textColor}]}>{this.state.answer1}</Text>
                                    <Text style={[styles.answer_column_text, {color: this.state.textColor}]}>{this.state.answer4}</Text>
                                    <Text style={[styles.answer_column_text, {color: this.state.textColor}]}>{this.state.answer7}</Text>
                                    <Text style={[styles.answer_column_text, {color: this.state.textColor}]}>{this.state.answer10}</Text>
                                    <Text style={[styles.answer_column_text, {color: this.state.textColor}]}>{this.state.answer13}</Text>
                                </View>
                                <View style={ game_styles.answers_column }>
                                    <Text style={[styles.answer_column_text, {color: this.state.textColor}]}>{this.state.answer2}</Text>
                                    <Text style={[styles.answer_column_text, {color: this.state.textColor}]}>{this.state.answer5}</Text>
                                    <Text style={[styles.answer_column_text, {color: this.state.textColor}]}>{this.state.answer8}</Text>
                                    <Text style={[styles.answer_column_text, {color: this.state.textColor}]}>{this.state.answer11}</Text>
                                    <Text style={[styles.answer_column_text, {color: this.state.textColor}]}>{this.state.answer14}</Text>
                                </View>
                            </View>

                            <View style={[game_styles.clue_container, {backgroundColor: this.state.cluesBgColor}]}>
                                <View style = {game_styles.top_part_clue}>
                                    <Text style={[styles.clue_text_small, {color: this.state.clueTextColor}]} >{(this.state.onThisClue + 1).toString() + '/' + this.state.theCluesArray.length.toString()}</Text>
                                </View>
                                <View style = {game_styles.middle_part_clue}>
                                    <Text style={[styles.clue_text_bold, {color: this.state.clueTextColor}]} >{this.getClueText('clue')}</Text>
                                </View>
                                <View style = {game_styles.bottom_part_clue}>
                                    <Text style={[styles.clue_text, {color: this.state.clueTextColor}]} >{this.getClueText('num')}</Text>
                                </View>
                            </View>

                            <View style={ game_styles.word_and_frag }>
                                <View style={ [game_styles.frag_container, {opacity: this.state.fragOpacity}, this.darkBorder(this.state.bgColor)] } onStartShouldSetResponder={() => this.guess(100, 1)}>
                                    <Text style={game_styles.keyfrag_text} >{this.state.keyFrag}</Text>
                                </View>
                                <Animated.View style={this.getStyle()}>
                                    <Text style={[styles.answer_text, {color: this.state.textColor}]} >{this.state.answerText}</Text>
                                </Animated.View>
                            </View>
                        </View>

                        <View style={ game_styles.tiles_container }>
                                <View style={{width: 80, height: 80}} onStartShouldSetResponder={ () => this.nextGame() }>
                                    <Image style={{ width: 80, height: 80, opacity: this.state.forwardBackOpacity, marginBottom: 30 }} source={this.state.arrowImage} />
                                </View>
                            { this.drawTiles() }
                        </View>

                        <View style={ game_styles.footer }>
                            <View style={ game_styles.score_container }>
                                <View style={ [game_styles.score_box, {backgroundColor: this.state.headerColor}] }>
                                    <Text style={[styles.score_text, {color: this.state.scoreColor}]} >{this.state.score}</Text>
                                </View>
                            </View>
                            <View style={ game_styles.buttons_container }>
                                <Button style={[game_styles.skip_button, this.darkBorder('#64aefa')]} onPress={ () => this.skip_to_next() }>
                                    <Image source={ require('../images/skip.png')} style={{ width: 60, height: 60 }} />
                                </Button>
                                <Button style={[game_styles.hint_button, this.darkBorder('#4aeeb2')]} onPress={ () => this.give_hint(true) }>
                                    <Image source={ require('../images/question.png')} style={{ width: 60, height: 60 }} />
                                </Button>
                            </View>
                            <View style={ game_styles.hints_container }>
                                <View style={ game_styles.hint_row }>
                                        <Text style={[game_styles.hint, {color: this.state.hint5Color, opacity: this.state.hintOpacity}]}>*</Text>
                                        <Text style={[game_styles.hint, {color: this.state.hint6Color, opacity: this.state.hintOpacity}]}>*</Text>
                                </View>
                                <View style={ game_styles.hint_row }>
                                        <Text style={[game_styles.hint, {color: this.state.hint3Color, opacity: this.state.hintOpacity}]}>*</Text>
                                        <Text style={[game_styles.hint, {color: this.state.hint4Color, opacity: this.state.hintOpacity}]}>*</Text>
                                </View>
                                <View style={ game_styles.hint_row }>
                                        <Text style={[game_styles.hint, {color: this.state.hint1Color}]}>*</Text>
                                        <Text style={[game_styles.hint, {color: this.state.hint2Color}]}>*</Text>
                                </View>
                                <View style={ [game_styles.hint_row, {marginTop: 6}]}>
                                        <Text style={ game_styles.hint_text }>hints</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    {this.state.shouldShowDropdown &&
                            <DropdownMenu onPress={(num)=>{ this.onDropdownSelect(num); }} item1={this.state.soundString} item2={'Reset Game'} item3={'How to Play'}/>
                    }
                </View>
            );
        }
    }
}


var game_styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    game_header: {
        flex: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: width,
    },
    display_area: {
        flex: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderTopWidth: 2,
    },
    answers_container: {
        flex: 14,
        flexDirection: 'row',
        backgroundColor: 'transparent',
    },
    answers_column: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    clue_container: {
        flex: 9,
        width: width *0.9,
        padding: 10,
        borderRadius: 10,
        margin: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    top_part_clue: {
        flex: 1,
        flexDirection: 'row',
        width: width - 30,
        paddingLeft: 10,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    middle_part_clue: {
        flex: 8,
        width: width - 30,
        paddingTop: 4,
        paddingBottom: 2,
        paddingTop: 2,
        paddingLeft: 8,
        paddingRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottom_part_clue: {
        flex: 2,
        width: width - 30,
        paddingTop: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    word_and_frag: {
        flex: 5,
        flexDirection: 'row',
        marginBottom: 3,
        paddingLeft: height/35,
    },
    frag_container: {
        flex: 6,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: configs.BORDER_RADIUS,
    },
    keyfrag_text: {
        color: '#038c30',
        fontSize: configs.LETTER_SIZE,
        fontWeight: 'bold',
    },
    word_container: {
        flex: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'transparent',
        paddingLeft: height/30,
        paddingBottom: height/90,
    },
    tiles_container: {
        flex: 21,
        left: (width - (height/1.84))/2,
        width: height/1.75,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    footer: {
        flex: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    skip_button: {
        flex:1,
        height: height * 0.075,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#64aefa',
        borderWidth: 1,
        borderRadius: 10,
        marginRight: 3,
        padding: 10,
    },
    hint_button: {
        flex:1,
        height: height * 0.075,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4aeeb2',
        borderWidth: 1,
        borderRadius: 12,
        marginLeft: 3,
        padding: 12,
    },
    buttons_container: {
        flexDirection: 'row',
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        padding: 12,
    },
    hints_container: {
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    hint_row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: height/18,
        height: height/65,
        backgroundColor: 'transparent',
    },
    hint: {
        fontSize: configs.LETTER_SIZE * 0.5,
        marginBottom: 2,
        marginLeft: 6,
        marginRight: 6,
    },
    hint_text: {
        fontSize: configs.LETTER_SIZE * 0.5,
        color: '#ffffff',
        textAlign: 'center'
    },
    score_box: {
        width: configs.LETTER_SIZE * 2.5,
        height: height * 0.075,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 5,
        borderColor: "#ffffff",
        paddingBottom: 3
    },
    score_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
});

module.exports = Game;