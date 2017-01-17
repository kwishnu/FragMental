import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableHighlight, TouchableOpacity, ListView, BackAndroid, Animated, AsyncStorage  } from 'react-native';
import Button from '../components/Button';

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
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
function randomNum(low, high) {
    high++;
    return Math.floor((Math.random())*(high-low))+low;
}

var deepCopy = require('../data/deepCopy.js');
var fragData = require('../data/objPassed.js');
var SideMenu = require('react-native-side-menu');
var Menu = require('./menu');
var styles = require('../styles/styles');
var {width, height} = require('Dimensions').get('window');
var NUM_WIDE = 5;
var CELL_WIDTH = Math.floor(width/NUM_WIDE); // one tile's fraction of the screen width
var CELL_PADDING = Math.floor(CELL_WIDTH * .05) + 5; // 5% of the cell width...+
var TILE_WIDTH = (CELL_WIDTH - CELL_PADDING * 2) - 7;
var BORDER_RADIUS = CELL_PADDING * .2 + 3;


class PuzzleLaunch extends Component{
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            id: 'puzzle launcher',
            puzzleData: this.props.puzzleData,
            dataElement: this.props.dataElement,
            title: this.props.title,
            isOpen: false,
            dataSource: ds.cloneWithRows(Array.from(new Array(parseInt(this.props.puzzleData[this.props.dataElement].num_puzzles, 10)), (x,i) => i)),
            scrollPosition: 0,
            onPuzzle: 0,
            bgColor: this.props.bgColor,
            textColor: this.props.textColor,
        };
        this.handleHardwareBackButton = this.handleHardwareBackButton.bind(this);
    }
    componentDidMount() {
//    window.alert(this.props.arraySize);
        BackAndroid.addEventListener('hardwareBackPress', this.handleHardwareBackButton);
//         AsyncStorage.getItem(KEY_onPuzzle).then((value) => {
//                 this.setState({onPuzzle: parseInt(value, 10)});
//        });
    }
    componentWillUnmount () {
        BackAndroid.removeEventListener('hardwareBackPress', this.handleHardwareBackButton);
    }
    handleHardwareBackButton() {
        if (this.state.isOpen) {
            this.toggle();
            return true;
        }else{
            var levels = [3,4,5,6];//Easy, Moderate, Hard, Theme
            for(let i=0; i<4; i++){
                var rand0to9 = randomNum(0, 9);
                this.state.puzzleData[20 + i].title = '*' + this.props.puzzleData[levels[i]].data[rand0to9].name;
                this.state.puzzleData[20 + i].bg_color = this.props.puzzleData[levels[i]].data[rand0to9].color;
            }
            try {
                this.props.navigator.replace({
                    id: 'puzzles contents',
                    passProps: {
                        puzzleData: this.state.puzzleData,
                    }
                });
                return true;
            } catch(err)  {
                return false;
            }
        }
    }
    toggle() {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }
    updateMenuState(isOpen) {
        this.setState({ isOpen: isOpen });

    }
    onMenuItemSelected(item) {
        this.setState({
            isOpen: false,
            selectedItem: item,
        });
        window.alert(item);
}
    border(color) {
        return {
            borderColor: color,
            borderWidth: 2,
        };
    }
    bg(num){
         var strToReturn='';
         var onThis = parseInt(this.props.puzzleData[this.props.dataElement].num_solved, 10);
         if(num==onThis){
             strToReturn='#0F0';
             }else if(num<onThis){
             strToReturn='#079707';
             }else{
             strToReturn='#999ba0';
             }

         return {
         backgroundColor: strToReturn
         };
    }
    getUnderlay(num){
         var strToReturn='';
         var onThis = parseInt(this.props.puzzleData[this.props.dataElement].num_solved, 10);
         if(num==onThis){
             strToReturn='#01ff01';
             }else if(num<onThis){
             strToReturn='#079707';
             }else{
             strToReturn='#999ba0';
             }

         return {strToReturn};
    }
    getBorder(num){
         var strToReturn='';
         var onThis = parseInt(this.props.puzzleData[this.props.dataElement].num_solved, 10);
         if(num==onThis){
             strToReturn='#0F0';
             }else if(num<onThis){
             strToReturn='#00a700';
             }else{
             strToReturn='#7e867e';
             }

         return {borderColor: strToReturn};
    }
    headerFooter(color){
         var strToReturn = shadeColor(color, -10);
         return {backgroundColor: strToReturn};
    }
    containerBg(color){
         var strToReturn = shadeColor(color, 60);
         return {backgroundColor: strToReturn};
    }
    darkBorder(color) {
        var darkerColor = shadeColor(color, -60);
            return {borderColor: darkerColor};
    }
    onSelect(index) {
        if(index>parseInt(this.props.puzzleData[this.props.dataElement].num_solved, 10))return;
            var levels = [3,4,5,6];//Easy, Moderate, Hard, Theme
            for(let i=0; i<4; i++){
                var rand0to9 = randomNum(0, 9);
                this.state.puzzleData[20 + i].title = '*' + this.props.puzzleData[levels[i]].data[rand0to9].name;
                this.state.puzzleData[20 + i].bg_color = this.props.puzzleData[levels[i]].data[rand0to9].color;
            }
        this.props.navigator.replace({
            id: 'game board',
            passProps: {
                puzzleData: this.state.puzzleData,
                title: index + 1,
                index: index,
                fromWhere: 'puzzle launcher',
                daily_solvedArray: this.props.daily_solvedArray,
                dataElement: this.props.dataElement,
                myBg: this.props.bgColor,
                myTitle: this.props.title,
                myTextColor: this.props.textColor,
                },
       });
    }

    render() {
        const menu = <Menu onItemSelected={ this.onMenuItemSelected } data = {this.props.puzzleData} />;
        return (
            <SideMenu
                menu={ menu }
                isOpen={ this.state.isOpen }
                onChange={ (isOpen) => this.updateMenuState(isOpen) }>

                <View style={ [container_styles.container, this.darkBorder(this.props.bgColor)] }>
                    <View style={ [container_styles.header, this.headerFooter(this.props.bgColor)] }>
                        <Button style={{left: 15}} onPress={ () => this.toggle() }>
                            <Image source={ require('../images/menu.png') } style={ { width: 50, height: 50 } } />
                        </Button>
                        <Text style={{fontSize: 18, color: '#fff'}} >{this.props.title}
                        </Text>
                        <Button style={{right: 15}}>
                            <Image source={ require('../images/no_image.png') } style={ { width: 50, height: 50 } } />
                        </Button>
                    </View>
                    <View style={ [container_styles.tiles_container, this.containerBg(this.props.bgColor), this.darkBorder(this.props.bgColor)] }>
                         <ListView  showsVerticalScrollIndicator ={false}
                                    initialListSize ={100}
                                    contentContainerStyle={ container_styles.listview }
                                    dataSource={this.state.dataSource}
                                    renderRow={(rowData) =>
                                     <View>
                                         <TouchableHighlight onPress={() => this.onSelect(rowData)}
                                                             underlayColor={() => this.bg(rowData)}
                                                             style={[container_styles.launcher, this.getBorder(rowData), this.bg(rowData)]} >
                                             <Text style={ styles.puzzle_text_large }>{rowData + 1}</Text>
                                         </TouchableHighlight>
                                     </View>}
                         />
                    </View>
                    <View style={[container_styles.footer, this.headerFooter(this.props.bgColor)]}>
                        <Text style={{fontSize: 11, color: '#fff'}}>Some fine print...</Text>
                    </View>
                 </View>
            </SideMenu>
        );
    }
}


var container_styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listview: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
    },
    tiles_container: {
        flex: 45,
        paddingLeft: 6,
        paddingRight: 6,
    },
    header: {
        flex: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: window.width,
    },
    footer: {
        flex: 4,
        justifyContent: 'center',
        alignItems: 'center',
        width: window.width,
    },
    launcher: {
        width: TILE_WIDTH,
        height: TILE_WIDTH,
        borderRadius: BORDER_RADIUS,
        borderWidth: 1,
        margin: CELL_PADDING,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

module.exports = PuzzleLaunch;
