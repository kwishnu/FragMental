import React, { Component } from 'react';
import { ListView, StyleSheet, Text, View, TouchableHighlight, Image, TouchableOpacity } from 'react-native';
import MenuSectionHeader  from '../components/MenuSectionHeader';
import configs from '../config/configs';
import normalize from '../config/pixelRatio';

var {width, height} = require('Dimensions').get('window');

const styles = require('../styles/styles');

module.exports = class Menu extends Component {
    constructor(props) {
        super(props);
        const getSectionData = (dataBlob, sectionId) => dataBlob[sectionId];
        const getRowData = (dataBlob, sectionId, rowId) => dataBlob[`${rowId}`];
        const ds = new ListView.DataSource({
          rowHasChanged: (r1, r2) => r1 !== r2,
          sectionHeaderHasChanged : (s1, s2) => s1 !== s2,
          getSectionData,
          getRowData,
        });
        const { dataBlob, sectionIds, rowIds } = this.formatData(this.props.data);

        this.state = {
            dataSource: ds.cloneWithRowsAndSections(dataBlob, sectionIds, rowIds),
        };
    }
    formatData(data) {
        const headings = 'FragMental*Puzzle Store*Discount Combo Packs*Social Media*About FragMental'.split('*');
        const keys = 'toPuzzles*store*combos*social*about'.split('*');
        const dataBlob = {};
        const sectionIds = [];
        const rowIds = [];
        for (let sectionId = 0; sectionId < headings.length; sectionId++) {
            const currentHead = headings[sectionId];
            const currentKey = keys[sectionId];
            const packs = data.filter((theData) => theData.type == currentKey);
            if (packs.length > 0) {
                sectionIds.push(sectionId);
                dataBlob[sectionId] = { sectionTitle: currentHead };
                rowIds.push([]);
                for (let i = 0; i < packs.length; i++) {
                    const rowId = `${sectionId}:${i}`;
                    rowIds[rowIds.length - 1].push(rowId);
                    dataBlob[rowId] = packs[i];
                }
            }
        }
        return { dataBlob, sectionIds, rowIds };
    }
    static propTypes = {
        onItemSelected: React.PropTypes.func.isRequired,
    }

    render() {
        return (<View style=  {menu_styles.container} >
                     <ListView  showsVerticalScrollIndicator ={false}
                                contentContainerStyle={ menu_styles.listview }
                                dataSource={this.state.dataSource}
                                renderRow={(rowData) =>
                                    <View>
                                        <TouchableHighlight onPress={() => this.props.onItemSelected(rowData)}
                                                            style={[menu_styles.launcher]}>
                                            <Text style={ menu_styles.launcher_text }>{rowData.title}</Text>
                                        </TouchableHighlight>
                                    </View>
                                }
                                renderSeparator={(sectionId, rowId) => <View key={rowId} style={menu_styles.separator} />}
                                renderSectionHeader={(sectionData) => <MenuSectionHeader {...sectionData}
                                 />}
                     />
                </View>
                );
    }
}

var menu_styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        height: height,
        backgroundColor: '#486bdd',
    },
    listview: {
        paddingBottom: 50
    },
    launcher: {
        flex: 1,
        width: width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: height/36,
        paddingTop: height/70,
        paddingBottom: height/70,
        backgroundColor: '#e1fed2',
    },
    launcher_text: {
        color: '#464646',
        fontSize: normalize(configs.LETTER_SIZE * 0.5),
        fontWeight: 'bold'
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#707070',
    }

});
