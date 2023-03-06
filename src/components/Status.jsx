import { StyleSheet, Text, View, Image, Button, ScrollView, RefreshControl, DrawerLayoutAndroid, TouchableOpacity, Dimensions, TextInput } from "react-native"
import Slider from '@react-native-community/slider';
import TrackPlayer, { Capability, useProgress } from 'react-native-track-player';

export default function Status() {
    const progress = useProgress();

    const JumpIntoDurationUsingSlider = (Value) => {
        TrackPlayer.seekTo(Value)
    }

    return (
        <View>
            <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={progress.duration}
                value={progress.position}
                onValueChange={JumpIntoDurationUsingSlider}
            />
            <View style={styles.music_timer}>
                <Text>
                    {new Date(progress.position * 1000)
                        .toLocaleTimeString()
                        .slice(4, -3)}
                </Text>
                <Text>
                    {new Date(progress.duration * 1000)
                        .toLocaleTimeString()
                        .slice(4, -3)}
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    input: {
        marginTop: 10,
        margin: 27,
        height: 48,
        borderWidth: 1,
        borderRadius: 34,
        padding: 10,
        paddingLeft: 18,
        fontSize: 18,
    },
    header: {
        margin: 18,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    menu_img: {
        height: 30,
        width: 30,
    },
    Home_button: {
        flexDirection: "row",
    },
    Home_text: {
        fontSize: 21,
        fontWeight: "bold",
        marginLeft: 4,
    },
    TextButton: {
        fontWeight: "bold",
    },
    color: {
        backgroundColor: "white",
    },
    focused: {
        color: "#87E1C7",
    },
    footer: {
        backgroundColor: 'red',
        position: 'absolute',
        bottom: 0,
        paddingBottom: 18,
        width: Dimensions.get('window').width,
    },
    slider: {
        marginRight: 8,
        marginLeft: 8,
        marginTop: 12
    },
    music_timer: {
        flexDirection: "row",
        justifyContent: 'space-between',
        marginRight: 23,
        marginLeft: 23,
    },
    Controller: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: "row",
        backgroundColor: 'white',
    },
    play_img: {
        width: 60,
        height: 60,
        margin: 10
    },
    next_img: {
        width: 30,
        height: 30,
        margin: 18
    }
});