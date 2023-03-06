import menu_img from "../images/list.png";
import DefaultImageSong from "../images/DefaultImageSong.png";
import music_img from "../images/music.png";
import arrow_img from "../images/arrow.png";
import lyrics_img from "../images/lyrics.png";
import play_img from "../images/play.png";
import pause_img from "../images/pause.png";
import back_img from "../images/back.png";
import next_img from "../images/next.png";
import { ActivityIndicator, Alert, PermissionsAndroid, FlatList, StyleSheet, Text, View, Image, Button, ScrollView, RefreshControl, DrawerLayoutAndroid, TouchableOpacity, Dimensions, TextInput } from "react-native";
import TrackPlayer, { Capability, State } from 'react-native-track-player';
import RNFS from 'react-native-fs';
import Status from './Status'
import axios from 'axios';
import cheerio from 'cheerio';
import { useEffect, useState, useRef } from "react";

export default function Home({ navigation }) {

    const [refreshing, setRefreshing] = useState(false);
    const [PlayImageSource, setPlayImageSource] = useState(play_img);
    const drawerLeft = useRef(null);
    const [PhoneTracks, setPhoneTracks] = useState([]);
    const [showFirstView, setShowFirstView] = useState(true)
    const [CurrentSongName, setCurrentSongName] = useState(true)
    const [InputText, setInputText] = useState(''); IsSearching
    const [SearchedSongs, setSearchedSongs] = useState([]);
    const [IsSearching, SetIsSearching] = useState(false);
    const [ShowLyricsResult, SetShowLyrics] = useState(false);

    if (!global.OneTime1) {
        TrackPlayer.setupPlayer();
        global.OneTime1 = true;
    }

    let Tracks
    let PhoneSongs = []
    let counter = 0

    const searchForSongs = async () => {
        const rootPath = RNFS.ExternalStorageDirectoryPath;
        const fileExtension = '.mp3';
        const songs = [];
        const check_repeated = [];

        const traverseFolder = async (folderPath) => {
            const items = await RNFS.readDir(folderPath);
            for (const item of items) {
                if (item.isFile() && item.name.endsWith(fileExtension)) {

                    if (!check_repeated.includes(item.name)) {
                        check_repeated.push(item.name);

                        PhoneSongs.push({
                            path: item.path,
                            name: item.name.substring(0, item.name.length - 4),
                            id: counter
                        })
                        songs.push(item.path);
                        Tracks = {
                            url: item.path,
                            name: item.name.substring(0, item.name.length - 4),
                            id: counter
                        }
                        TrackPlayer.add(Tracks)
                        counter++
                    }

                } else if (item.isDirectory()) {
                    await traverseFolder(item.path);
                }
            }
        };

        await traverseFolder(rootPath);
        setPhoneTracks(PhoneSongs)
        GetPlayerData()
        // console.log(PhoneSongs)
        // console.log(await TrackPlayer.getQueue());
    };

    const CheckPermissions = async () => {
        // const state = await TrackPlayer.getState();
        // // Check if the player is playing
        // if (global.osne) {
        //     if (state === State.Playing) {
        //         setPlayImageSource(pause_img)
        //         global.osne = false
        //     } else {
        //         setPlayImageSource(play_img)
        //         global.osne = false
        //     }
        // }

        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('External storage permission granted')
            if (!global.OneTime2) {
                searchForSongs()
                global.OneTime2 = true
            }
        } else {
            console.log('External storage permission denied')
            Alert.alert(
                'Storage Permission Required',
                'The app requires access to your external storage to function properly.',
                [
                    {
                        text: 'OK',
                        onPress: () => CheckPermissions()
                    },
                ]
            );
        }
    }

    CheckPermissions()

    const sleep = (milliseconds) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    const PlayOneSong = (item) => {

        TrackPlayer.skip(item.id)
        TrackPlayer.play()
        updateOptions()
        setPlayImageSource(pause_img)
        GetPlayerData()
        drawerLeft.current.closeDrawer()
    }

    const onRefresh = () => {
        setRefreshing(true);

        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    };

    const renderItem = ({ item }) => {
        return (
            <View style={styles.item}>
                <TouchableOpacity
                    style={styles.ListView}
                    onPress={() => { PlayOneSong(item) }}
                >
                    <Image
                        source={DefaultImageSong}
                        style={styles.lyricsStyle}
                    />
                    <Text style={styles.ItemText}>
                        {item.name}
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }

    const renderSearchedItem = ({ item }) => {
        return (
            <ScrollView>
                <View style={styles.SearchItem}>
                    <TouchableOpacity
                        style={styles.ListView}
                        onPress={() => { ShowLyrics(item.link) }}
                    >
                        <Image
                            source={lyrics_img}
                            style={styles.lyricsStyle}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.ItemText}>
                                {item.name}
                            </Text>
                            <Text style={styles.ItemText}>
                                {item.subtitle}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        )
    }

    const [lyrics, setlyrics] = useState({})
    const [ShowedLyrics, setShowedLyrics] = useState(false)

    const ShowLyrics = async (link) => {
        console.log("Getting lyrics ...")
        SetShowLyrics(true)
        let lyrics = "";
        let data = {}
        await axios.get(link).then(async (res) => {
            const $ = await cheerio.load(res.data);

            $(".mxm-lyrics__content").each(async (index, item) => {
                const lyricsItem = $(item).children("span").text();
                lyrics += lyricsItem;
                lyrics += "/n";
            });
        });
        data = {
            lyrics: lyrics
        }
        console.log(data.lyrics)
        if (data.lyrics == '') {
            SetShowLyrics(false)
            Alert.alert(
                'No data',
                'Cannot get lyrics. Something wont wrong.',
                [
                    {
                        text: 'OK',
                        onPress: () => { }
                    },
                ]
            );
            return
        }
        setShowedLyrics(true)
        setlyrics(data)
        // console.log(test)
    }

    const navigationViewLeft = () => (
        <View style={[styles.container]}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.Home_button}
                    onPress={() => drawerLeft.current.closeDrawer()}
                >
                    <Image source={arrow_img} style={styles.arrow_img} />
                </TouchableOpacity>
                <Text style={styles.Home_text}>Phone's Tracks</Text>
                <Text></Text>
            </View>
            <FlatList
                data={PhoneTracks}
                renderItem={renderItem}
            />
        </View>
    );

    const left_drawer = () => {
        drawerLeft.current.openDrawer();
    };

    const updateOptions = () => {
        TrackPlayer.updateOptions({
            stopWithApp: false,
            capabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.Stop,
            ]
        })
    }

    const Play_Pause = () => {
        if (PlayImageSource == pause_img) {
            TrackPlayer.pause();
            setPlayImageSource(play_img)
        }
        else {
            TrackPlayer.play()
            updateOptions()
            setPlayImageSource(pause_img)
            GetPlayerData()
        }
    }

    const GetPlayerData = async () => {
        const trackId = await TrackPlayer.getCurrentTrack();
        const trackObject = await TrackPlayer.getTrack(trackId);
        setCurrentSongName(trackObject.name)
    }

    const ChangeView = () => {
        if (showFirstView) {
            setShowFirstView(false)
        }
        else {
            setShowFirstView(true)
        }
    }

    const GetLyrics = async () => {
        const BASE_URL = 'https://api.musixmatch.com/ws/1.1';

        async function fetchLyrics(name) {
            let URL = "https://www.musixmatch.com";
            let links = []
            await axios.get(`${URL}/search/${name}`).then(async (res) => {
                const $ = await cheerio.load(res.data)

                $(".media-card-text").each(async (index, item) => {
                    const rawLink = $(item)
                        .children(".media-card-title")
                        .children("a")
                        .attr("href")
                    const link = `${URL}${rawLink}`
                    const title = $(item).children("h2").text()
                    const subtitle = $(item).children("h3").text()
                    links[index] = { title, subtitle, link }
                })
            })
            console.log('\x1b[36m%s\x1b[0m', 'search _________________________________')
            // console.table(links)
            let data = []
            for (link in links) {
                console.log(links[link]['title'])
                data.push(links)
            }
            console.log()
            console.log("")
            console.log('\x1b[36m%s\x1b[0m', 'Lyrics _________________________________')
            // console.log(data[0][0]['link'])
            // console.log(data[0][1]['link'])
            // console.log(data[0][2]['link'])
            // console.log(data[0][3]['link'])
            getLyrics(data[0][1]['link'])
        }

        const getLyrics = async (link) => {
            let lyrics = "";
            await axios.get(link).then(async (res) => {
                const $ = await cheerio.load(res.data);

                $(".mxm-lyrics__content").each(async (index, item) => {
                    const lyricsItem = $(item).children("span").text();
                    lyrics += lyricsItem;
                    lyrics += "/n";
                });
            });

            console.log(lyrics)
        };
        fetchLyrics("see you again")
    }


    const SearchForSongs = async (SongName) => {
        console.log('Searching ...')
        let URL = "https://www.musixmatch.com";
        let links = []
        await axios.get(`${URL}/search/${SongName}`).then(async (res) => {
            const $ = await cheerio.load(res.data)

            $(".media-card-text").each(async (index, item) => {
                const rawLink = $(item)
                    .children(".media-card-title")
                    .children("a")
                    .attr("href")
                const link = `${URL}${rawLink}`
                const title = $(item).children("h2").text()
                const subtitle = $(item).children("h3").text()
                links[index] = { title, subtitle, link }
            })
        })
        console.log('\x1b[36m%s\x1b[0m', 'search _________________________________')
        for (link in links) {
            console.log(links[link]['title'])
            SearchSongsResult.push({
                name: links[link]['title'],
                subtitle: links[link]['subtitle'],
                link: links[link]['link']
            })
        }
        console.log("")
        console.log('\x1b[36m%s\x1b[0m', 'Lyrics _________________________________')
        SetIsSearching(true)
        setSearchedSongs(SearchSongsResult)
    }

    const SearchSongsResult = []

    let typingTimeout = null;

    const setLol = (dd) => {
        setInputText(dd)
    }

    const InputTextOnChange = (Value) => {
        SetShowLyrics(false)
        setShowedLyrics(false)
        if (Value === '') {
            setShowFirstView(true)
            setSearchedSongs(null)
            return
        }
        else {
            SetIsSearching(false)
            setShowFirstView(false)
        }
        clearTimeout(typingTimeout)
        typingTimeout = setTimeout(() => {
            console.log(Value)
            SearchForSongs(Value)
        }, 2000)
    }

    return (
        <>
            <DrawerLayoutAndroid
                style={styles.drawer}
                drawerPosition={"left"}
                ref={drawerLeft}
                drawerWidth={Dimensions.get('window').width}
                renderNavigationView={navigationViewLeft}
            >
                <View style={styles.color}>
                    <ScrollView
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        style={styles.reload}
                    >
                        <View style={styles.header}>
                            <TouchableOpacity
                                style={styles.Home_button}
                                onPress={left_drawer}
                            >
                                <Image source={menu_img} style={styles.menu_img} />
                            </TouchableOpacity>
                            <Text style={styles.Home_text}>Music Player</Text>
                            <TouchableOpacity
                                style={styles.Home_button}
                            >
                                <Image source={DefaultImageSong} style={styles.DefaultImageSong} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Search for lyrics"
                            onChangeText={InputTextOnChange}
                        />
                    </ScrollView>
                </View>
                <View>
                    {showFirstView ? (
                        <View style={styles.MusicImageView}>
                            <Image
                                source={music_img}
                                style={styles.MusicImage}
                            />
                            <Text style={styles.CurrentSongNameText}>
                                {CurrentSongName}
                            </Text>
                        </View>
                    ) : (
                        <View>
                            {IsSearching ? (
                                ShowLyricsResult ? (
                                    ShowedLyrics ? (
                                        <ScrollView style={{flexDirection: 'column'}}>
                                            <Text style={styles.LyricsResultStyle}>
                                                {lyrics.lyrics}
                                                <Text>
                                                    AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                                                </Text>
                                            </Text>
                                        </ScrollView>
                                    ) : (
                                        <View style={styles.SearchLoading}>
                                            <ActivityIndicator size="large" color="black" />
                                        </View>
                                    )
                                ) : (
                                    <FlatList
                                        data={SearchedSongs}
                                        renderItem={renderSearchedItem}
                                    />
                                )

                            ) : (
                                <View style={styles.SearchLoading}>
                                    <ActivityIndicator size="large" color="black" />
                                </View>
                            )}
                        </View>
                    )}
                </View>
                <View style={styles.footer}>
                    <Status />
                    <View style={styles.Controller}>
                        <TouchableOpacity
                            onPress={() => { TrackPlayer.skipToPrevious() }}>
                            <Image source={back_img} style={styles.next_img} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => { Play_Pause() }}
                        >
                            <Image source={PlayImageSource} style={styles.play_img} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => { TrackPlayer.skipToNext() }}>
                            <Image source={next_img} style={styles.next_img} />
                        </TouchableOpacity>
                    </View>
                </View>
            </DrawerLayoutAndroid>
        </>
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
        marginTop: 0,
        margin: 27,
        height: 45,
        borderWidth: 1,
        borderRadius: 34,
        padding: 10,
        paddingLeft: 18,
        fontSize: 18,
    },
    header: {
        padding: 18,
        flexDirection: "row",
        justifyContent: "space-between",
        width: Dimensions.get('window').width,
    },
    menu_img: {
        height: 26,
        width: 26,
    },
    arrow_img: {
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
        backgroundColor: 'white',
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
    },
    MusicImage: {
        width: 200,
        height: 200,
        margin: 46
    },
    MusicImageView: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    CurrentSongNameText: {
        marginLeft: 16,
        marginRight: 16,
    },
    DefaultImageSong: {
        width: 30,
        height: 30,
        borderRadius: 8
    },
    item: {
        backgroundColor: '#E5E4E2',
        justifyContent: 'center',
        width: Dimensions.get('window').width - 19,
        padding: 10,
        paddingTop: 12,
        paddingBottom: 12,
        borderRadius: 8,
        marginTop: 4,
        margin: 3
    },
    SearchItem: {
        backgroundColor: '#E5E4E2',
        justifyContent: 'center',
        width: Dimensions.get('window').width - 7,
        padding: 10,
        paddingTop: 12,
        paddingBottom: 12,
        borderRadius: 8,
        marginTop: 4,
        margin: 3,
    },
    ListView: {
        flexDirection: "row",
    },
    ItemText: {
        marginRight: 50,
        marginLeft: 7,
        fontWeight: 'bold',
    },
    SearchLoading: {
        padding: 180
    },
    lyricsStyle: {
        width: 40,
        height: 40,
        borderRadius: 6
    },
    LyricsResultStyle: {
        justifyContent: 'center',
    }
})