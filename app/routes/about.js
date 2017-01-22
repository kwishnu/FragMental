import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, BackAndroid } from 'react-native';
import Button from '../components/Button';
var styles = require('../styles/styles');
var {width, height} = require('Dimensions').get('window');


module.exports = class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 'about',
        };
       this.goSomewhere = this.goSomewhere.bind(this);
    }
    componentDidMount(){
        BackAndroid.addEventListener('hardwareBackPress', this.goSomewhere);
    }
    componentWillUnmount () {
        BackAndroid.removeEventListener('hardwareBackPress', this.goSomewhere);
    }
    goSomewhere() {
        try {
            var goToHere = this.props.destination;
            this.props.navigator.pop({
                id: goToHere,
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

    render() {
        return (
            <View style={about_styles.container}>
                <View style={ about_styles.header }>
                    <Button style={{left: 10}} onPress={ () => this.goSomewhere() }>
                        <Image source={ require('../images/arrow_back.png') } style={ { width: 50, height: 50 } } />
                    </Button>
                    <Text style={styles.header_text} >About FragMental
                    </Text>
                    <Button>
                        <Image source={ require('../images/no_image.png') } style={ { width: 50, height: 50 } } />
                    </Button>
                </View>
                <View style={ about_styles.about_container }>



                </View>
            </View>
        );
    }
}



const about_styles = StyleSheet.create({
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
    about_container: {
        flex: 13,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text_container: {
        flex: 3,
        justifyContent: 'center',
        padding: 6,

    },
    text: {
        color: 'white',
        fontSize: 15,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        width: width * 0.9,
        backgroundColor: '#333333',
        marginTop: 20,
    },
});
