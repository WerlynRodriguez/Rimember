import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, View, ToastAndroid, TouchableWithoutFeedback, Animated } from 'react-native'
import {
    FAB,
    IconButton,
    Text,
    useTheme
} from 'react-native-paper'
import { useAlbumsStore, useMediaStore } from '../store'
import * as MediaLibrary from 'expo-media-library'
import * as Sharing from 'expo-sharing'
import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'react-native'
import { Randomizer } from '../classes'
import { AssetHistory } from '../interfaces'
import * as ScreenOrientation from 'expo-screen-orientation'
import CustomSlider from '../components/CustomSlider'
import { AVPlaybackStatusSuccess, ResizeMode, Video } from 'expo-av'
import { configOptions, defaultConfig, height, mediaStorage } from '../config'
import { HandlerStateChangeEvent, PanGestureHandler, PanGestureHandlerEventPayload, State } from 'react-native-gesture-handler'
import { tr, tKeys } from '../translate'
import LoadingScreen from '../components/LoadingScreen'

export default function Home() {
    const theme = useTheme()
    const [loadStatus, setLoadStatus] = useState(true)
    const albumsState = useAlbumsStore(state => state.albums)
    const [historyConfig, setHistoryConfig] = useState<typeof defaultConfig>(defaultConfig)

    const [showOptions, setShowOptions] = useState(false) // Show button FAB and options
    const [pauseOptions, setPauseOptions] = useState(false) // options in Video

    const [autoScroll, setAutoScroll] = useState(false)
    const [timeOut, setTimeOut] = useState<NodeJS.Timeout | null>(null)

    const [translateY] = useState(new Animated.Value(0))
    let offsetY = 0
    const offsetToScroll = Math.floor(height / 3)
    
    const videoRef: React.MutableRefObject<Video | null> = useRef(null)
    const [videoStatus, setVideoStatus] = useState<AVPlaybackStatusSuccess>()
    const [stringDuration, setStringDuration] = useState<string>('0:00')

    const [
        fullScreen,
        assets,
        leftAlbums,
        randomizer,
        indexAsset,
        swapFullScreen,
        addAsset,
        setLeftAlbums,
        setIndexAsset,
        setAll,
    ] = useMediaStore(state => [
        state.fullScreen, state.assets, state.leftAlbums, state.randomizers, state.indexAsset,
        state.swapFullScreen, state.addAsset, state.setLeftAlbums, state.setIndexAsset,
        state.setAll,
    ])

    /** In the first Render, add a listener in screen orientation 
     * When the screen is in landscape, swap to full screen 
     **/
    useEffect(() => {

        const onChangeOrientation = (listener: ScreenOrientation.OrientationChangeEvent) => {
            if (listener.orientationInfo.orientation == 
                ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
                listener.orientationInfo.orientation ==
                ScreenOrientation.Orientation.LANDSCAPE_RIGHT
            ) swapFullScreen(true)
        }
        ScreenOrientation.addOrientationChangeListener(onChangeOrientation)

        /** In the first render, get the config and reset the history if is true
         **/
        const startApp = async () => {
            const resetHistory = await mediaStorage.resetHistory()
            const config = await configOptions.config()
            setHistoryConfig(config)

            if (albumsState.length != 0) {
                if (resetHistory) {
                    await mediaStorage.resetHistory(false)
                    restart(true, config)
                } else if (assets.length == 0) restart(true, config)
                else setLoadStatus(false)
            } else setLoadStatus(false)
        }

        startApp()

        return () => { ScreenOrientation.removeOrientationChangeListeners() }
    }, [])

    /** When a video is loaded, get the duration and 
     * format it to show in the slider
     **/
    useEffect(() => {
        if (videoStatus?.isLoaded) 
            if (videoStatus.durationMillis) 
            setStringDuration(formatDuration(videoStatus.durationMillis))
    }, [videoStatus?.durationMillis])


    /** This check if the video is finished and if autoScroll is true
     * If is true, scroll up
     **/
    useEffect(() => {
        if (!videoStatus?.didJustFinish) return

        if (autoScroll) animate(height, scrollUp)
    }, [videoStatus?.didJustFinish])


    /** This is used to format the duration of the video
     * @param durationMillis The duration in milliseconds
     * @returns The duration in format 00:00:00
     * @example formatDuration(1000) // 00:01
     * @example formatDuration(100000) // 01:40
     **/
    function formatDuration(durationMillis: number) {
        const pad = (num: number) => num.toString().padStart(2, '0')
        const totalSeconds = Math.floor(durationMillis / 1000)
        const seconds = totalSeconds % 60
        const totalMinutes = Math.floor(totalSeconds / 60)
        const minutes = totalMinutes % 60
        const hours = Math.floor(totalMinutes / 60)
        return `${hours ? hours + ':' : ''}${pad(minutes)}:${pad(seconds)}`
    }

    /** This is used to play or pause the video 
     * If the video is playing, pause it and show the options (slider)
     **/
    const playPause = () => {
        if (videoRef.current == undefined) return

        if (videoStatus?.isPlaying) {
            setPauseOptions(true)
            videoRef.current.pauseAsync()
            return
        }
        
        videoRef.current.playAsync()
        setPauseOptions(false)
    }

    /** Show a toast with a message (ANDROID ONLY) */
    const showToast = (mess: string) => ToastAndroid.show(mess, ToastAndroid.SHORT)

    /** Restart the history
     * @param full If true, restart all the history, else get more assets from randomizers
     * @param config The config to use (in the first render cant use the state)
     **/
    const restart = async (full = false, config = historyConfig) => {
        setLoadStatus(true)

        const assts: AssetHistory[] = []
        let lftAlbums: number[] = full ? albumsState.map((_, index) => index) : leftAlbums
        const rndmzrs = full ? albumsState.map((album) => new Randomizer(album.assetCount)) : randomizer

        for (let i = 0; i < config.initialLoad; i++){
            if (lftAlbums.length == 0) break
            await setNewRandomAsset(
                lftAlbums, rndmzrs, albumsState, 
                (asset) => assts.push(asset),
                (albums) => lftAlbums = albums instanceof Function ? albums(lftAlbums) : albums,
            )
        }

        setAll({
            assets: assts,
            leftAlbums: lftAlbums,
            indexAsset: 0,
            randomizers: rndmzrs
        })
        setLoadStatus(false)
        animateToMiddle() // Fix the bug when the user scroll up and the history is restarted
    }


    /** Add a new asset to the history. All params are optional, but used in the first render (React trouble)
     * @param lftAlbums The albums that are left to get assets
     * @param rndmzrs The randomizers of the albums
     * @param albmState The albums state
     * @param addAsst The function to add the asset to the history
     * @param setLftAlbums The function to set the left albums
     **/
    async function setNewRandomAsset(
        lftAlbums = leftAlbums,
        rndmzrs = randomizer,
        albmState = albumsState,
        addAsst = (asset: AssetHistory) => addAsset(asset),
        setLftAlbums = setLeftAlbums,
    ) {
        // Random album from leftAlbums
        const indexAlbum = lftAlbums[Math.floor(Math.random() * lftAlbums.length)]

        const newAssetIndex = rndmzrs[indexAlbum].getRandomIndex()

        // If indexes is empty, delete album from leftAlbums
        if (newAssetIndex == undefined) {
            setLftAlbums((albums) => {
                // Delete album from leftAlbums
                const newAlbums = albums.filter((album) => album != indexAlbum)
                return newAlbums
            })
            return
        }

        // GET ASSET FROM ALBUM (This is the V2, maybe change in the future)
        await MediaLibrary.getAssetsAsync({
            first: 1,
            album: albmState[indexAlbum].id,
            mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
            after: newAssetIndex.toString(),
        }).then((res) => {
            if (res.assets.length == 0) {
                showToast(tr(tKeys.errAssets))
                return
            }

            addAsst({
                albumPos: indexAlbum,
                mediaType: res.assets[0].mediaType,
                name: res.assets[0].filename,
            })
        }).catch((error) => { showToast(`${tr(tKeys.errAssets) }${error.message}`) })
    }


    /** Scroll up in the history, checking multiple things
     **/
    const scrollUp = () => {
        const indexPlus1 = indexAsset + 1

        // Delete all the history, and load new assets
        if (indexPlus1 >= historyConfig.maxHistorySize) {
            restart()
            return
        }

        const finAssets: boolean = indexPlus1 >= assets.length,
            noAlbums: boolean = leftAlbums.length == 0

        if (finAssets) {
            if (noAlbums){
                showToast(tr(tKeys.seenAlbums))
                restart(true)
            } else showToast(tr(tKeys.loading))
            return
        }

        if (!noAlbums && // If there are albums left
            assets.length < historyConfig.maxHistorySize && // If the history is not full
            indexAsset >= assets.length - historyConfig.initialLoad // If the index is near offset of the end
        ) setNewRandomAsset()

        setIndexAsset(indexPlus1)
    }


    /** Share the actual asset video or image */
    const onShare = async () => {
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(getUri())
        } else showToast(tr(tKeys.actionNoAvailable))
    }
    

    /** Animate the actual asset to the Middle of screen*/
    const animateToMiddle = () =>
        Animated.spring(translateY, {
            toValue: 0,
            velocity: 100,
            useNativeDriver: true,
        }).start()


    /** animate the actual asset to the top or bottom of the screen, then simulate the scroll
     * @param onFinish The function to execute when the animation is finished
     * @param translationY The translation in Y axis
     **/
    const animate = (
        translationY: number,
        onFinish: () => void = () => {}
    ) => {
        Animated.timing(translateY, {
            toValue: -translationY,
            duration: 100,
            useNativeDriver: true,
        }).start(({ finished }) => {

            if (!finished) return
            onFinish()

            Animated.timing(translateY, {
                toValue: translationY,
                duration: 0,
                useNativeDriver: true,
            }).start(() => animateToMiddle())
        })
    }


    /** Function to use in the PanGestureHandler, for see the translation in Y axis */
    const onGestureEvent =  Animated.event(
        [{ nativeEvent: { translationY: translateY } }],
        { useNativeDriver: true }
    )


    /** When the user end to scroll or do a gesture, check if the user is scrolling up or down
     * If the user is scrolling up, check if the user is scrolling fast or the translation is big
     * @param event The event of the PanGestureHandler
     **/
    const onHandlerStateChange = (event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            
            offsetY += event.nativeEvent.translationY
            let { translationY, velocityY } = event.nativeEvent
            const goUp = translationY < 0

            if (goUp) { // Scrolling Up
                if (velocityY < -1000 || translationY < -offsetToScroll) { // If the velocity is high, scroll up
                    animate(height, scrollUp)
                } else animateToMiddle()

            } else { // Scrolling Down
                if (velocityY > 1000 || translationY > offsetToScroll) { // If the velocity is high, scroll down
                    if (indexAsset == 0) {
                        animateToMiddle()
                        return
                    }
            
                    animate(-height, () => {
                        setIndexAsset(indexAsset - 1)
                    })
                } else animateToMiddle()
            } 
        }
    }

    /** Get the actual album */
    const getAlbum = () => albumsState[assets[indexAsset].albumPos]

    /** Get the uri of the actual asset of the actual album */
    const getUri = () => `file:///storage/${getAlbum().folder}${getAlbum().title}/${assets[indexAsset].name}`


    /** Get the player (Video or Image) of the actual asset 
     * Contain the default options for both in this app
     **/
    const GetPlayer = () => assets[indexAsset].mediaType == MediaLibrary.MediaType.video ? 
        <Video
            ref={videoRef}
            source={{ uri: getUri() }}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={true}
            isLooping
            style={styles.fullSize}
            onPlaybackStatusUpdate={(status) => {
                if (status.isLoaded) setVideoStatus(status)
            }}
            usePoster
            posterSource={require('../assets/logo.png')}
            posterStyle={{
                resizeMode: 'contain',
                width: '100%',
                height: '100%',
                aspectRatio: 1
            }}
            onLoadStart={() => setPauseOptions(false)}
        />
        :
        <Image
            source={{ uri: getUri() }}
            defaultSource={require('../assets/logo.png')}
            style={[styles.fullSize, {
                resizeMode: 'contain'
            }]}
            onLoad={() => {
                if (!autoScroll) return
                
                setTimeOut(setTimeout(() => {
                    animate(height, scrollUp)
                }, historyConfig.timeAutoScroll))
            }}
        />
    

    if (loadStatus) return <LoadingScreen />

    if (albumsState.length == 0) return (
        <View style={[styles.bottomCenter, styles.fullSize]}>
            <Text> {tr(tKeys.noAlbums)} </Text>
        </View>
    )

    if (!assets || assets?.length == 0) return (
        <View style={[styles.bottomCenter, styles.fullSize]}>
            <Text> {tr(tKeys.noAssets)} </Text>
            <IconButton
                icon="refresh"
                onPress={() => restart(true)}
            />
        </View>
    )

    return (
    <>
    <PanGestureHandler
        {...autoScroll ? { enabled: false } : {}}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        maxPointers={1}
    >
            <Animated.View 
                style={[styles.fullSize, {
                    transform: [{ translateY: Animated.add(translateY, offsetY) }]
                }]}
            >
                <TouchableWithoutFeedback
                    onPress={() => playPause()}
                    onLongPress={() => setShowOptions(true)}
                >
                    {GetPlayer()}
                </TouchableWithoutFeedback>
            </Animated.View>
    </PanGestureHandler>
    
    {assets[indexAsset].mediaType == MediaLibrary.MediaType.video && pauseOptions &&
    <LinearGradient
        colors={['transparent', 'rgba(0,0,0,1)']}
        style={styles.videoOptions}
    >
        <IconButton
            icon={'play'}
            style={{
                borderRadius: 50,
            }}
            onPress={() => playPause()}
        />

        <CustomSlider
            theme={theme}
            minimumValue={0}
            maximumValue={videoStatus?.durationMillis ?? 0}
            value={videoStatus?.positionMillis ?? 0}
            onSlidingComplete={(value) => videoRef.current?.setPositionAsync(value)}
            indicator={ videoStatus?.isLoaded ? 
                `${formatDuration(videoStatus.positionMillis)} / ${stringDuration}` 
                : '0:00'
            }
        />
    </LinearGradient>}

    {false && <View style={styles.devInfo}>
        <Text>
            {`IndexAsset: ${indexAsset} | AssetCount: ${assets.length}`}
        </Text>
        <Text>
            {`ActualAlbum: ${getAlbum().title} | CountActualAlbum: ${getAlbum().assetCount}`}
        </Text>
        <Text>
            {`LeftAlbums: ${leftAlbums.length} | MaxHistorySize: ${historyConfig.maxHistorySize}`}
        </Text>
        <Text>
            {`offsetToScroll: ${offsetToScroll} | autoScroll: ${autoScroll ? 'true' : 'false'}`}
        </Text>
    </View>}

    <FAB.Group
        icon={showOptions ? 'close' : 'plus'}
        style={styles.normalOptions}
        variant='surface'
        visible={showOptions}
        open={showOptions}
        onStateChange={({ open }) => {
            if (!open) setShowOptions(false)
        }}
        actions={[
            // AutoScroll
            { icon: autoScroll ? 'pause' : 'chevron-double-down', onPress: () => {
                setAutoScroll(!autoScroll)
                if (autoScroll) {
                    clearTimeout(timeOut!)
                    setTimeOut(null)
                    return
                }

                if (assets[indexAsset].mediaType == MediaLibrary.MediaType.video) return

                setTimeOut(setTimeout(() => {
                    animate(height, scrollUp)
                }, historyConfig.timeAutoScroll))
            }},
            { icon: 'share', onPress: () => onShare() },
            { icon: fullScreen ? 'fullscreen-exit' : 'fullscreen', onPress: () => swapFullScreen() }
        ]}
    />
    </>
    )
}

const styles = StyleSheet.create({
    fullSize: {
        flex: 1,
        width: '100%',
        height: '100%',
        padding: 0
    },
    videoOptions: {
        position: 'absolute',
        bottom: 0, 
        left: 0,
        right: 0
    },
    normalOptions: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    devInfo: {
        width: '100%',
        position: 'absolute',
        top: 20,
        left: 0,
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottomCenter: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 50
    }
})