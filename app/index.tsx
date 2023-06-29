import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, View, ToastAndroid } from 'react-native';
import { 
    ActivityIndicator,
    Button,
    FAB,
    IconButton,
    Text,
    useTheme
} from 'react-native-paper'
import { useAlbumsStore, useMediaStore } from '../store'
import * as MediaLibrary from 'expo-media-library'
import * as Sharing from 'expo-sharing'
import { LinearGradient } from 'expo-linear-gradient'

import { Animated, Image } from 'react-native'
import { HandlerStateChangeEvent, PanGestureHandler, PanGestureHandlerEventPayload, State } from 'react-native-gesture-handler'
import { Randomizer } from '../classes'
import { AssetHistory } from '../interfaces';
import * as ScreenOrientation from 'expo-screen-orientation'
import CustomSlider from '../components/CustomSlider';
import { AVPlaybackStatusSuccess, ResizeMode, Video } from 'expo-av';

// const maxAssetsPagination = 100
const maxSizeHistory = 26
const initialHistorySize = 10
const timerInterval = 5500

export default function Home() {
    const theme = useTheme()
    const [loadStatus, setLoadStatus] = useState(true)

    const [openMore, setOpenMore] = useState(false)
    const [showOptions, setShowOptions] = useState(false)
    // Timer 
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
    
    const ref: React.MutableRefObject<Video | null> = useRef(null)
    const [status, setStatus] = useState<AVPlaybackStatusSuccess>()
    const [stringDuration, setStringDuration] = useState<string>('0:00')

    const albumsState = useAlbumsStore(state => state.albums)

    const [
        playing,
        fullScreen,
        assets,
        leftAlbums,
        randomizer,
        indexAsset,
        fetchingAssetsCount,
        swapFullScreen,
        addAsset,
        setLeftAlbums,
        setIndexAsset,
        setFetchingCount,
        setAll,
    ] = useMediaStore(state => [
        state.playing, state.fullScreen, state.assets, state.leftAlbums, state.randomizers, state.indexAsset,
        state.fetchingAssetsCount, state.swapFullScreen, state.addAsset, state.setLeftAlbums, state.setIndexAsset,
        state.setFetchingCount, state.setAll,
    ])

    const [translateY] = useState(new Animated.Value(0))
    let offsetY = 0

    useEffect(() => {

        const onChangeOrientation = (listener: ScreenOrientation.OrientationChangeEvent) => {
            if (listener.orientationInfo.orientation == 
                ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
                listener.orientationInfo.orientation ==
                ScreenOrientation.Orientation.LANDSCAPE_RIGHT
            ) {swapFullScreen(true)}
        }
        ScreenOrientation.addOrientationChangeListener(onChangeOrientation)

        startApp()

        return () => {
            ScreenOrientation.removeOrientationChangeListeners()
        }
    }, [])

    useEffect(() => {
        if (status?.isLoaded) 
            if (status.durationMillis) setStringDuration(formatDuration(status.durationMillis))
    }, [status?.isLoaded])

    function formatDuration(durationMillis: number) {
        const pad = (num: number) => num.toString().padStart(2, '0')
        const totalSeconds = Math.floor(durationMillis / 1000)
        const seconds = totalSeconds % 60
        const totalMinutes = Math.floor(totalSeconds / 60)
        const minutes = totalMinutes % 60
        const hours = Math.floor(totalMinutes / 60)
        return `${hours ? hours + ':' : ''}${pad(minutes)}:${pad(seconds)}`
    }

    const getIndicator = () => {
        return status?.isLoaded ? `${formatDuration(status.positionMillis)} / ${stringDuration}` : '0:00'
    }

    const playPause = () => {
        if (ref.current == undefined) return

        if (status?.isPlaying) ref.current.pauseAsync()
        else ref.current.playAsync()
    }

    const startApp = () => {
        if (albumsState.length != 0) {
            if (!playing) restart(true)
            else setLoadStatus(false)
        } else
            setLoadStatus(false)
    }

    const showToast = (mess: string) => ToastAndroid.show(mess, ToastAndroid.SHORT)

    const restart = async (full = false) => {
        setLoadStatus(true)

        const assts: AssetHistory[] = []
        let lftAlbums: number[] = full ? albumsState.map((_, index) => index) : leftAlbums
        let fetchAsstsCount = 0
        const rndmzrs = full ? albumsState.map((album) => new Randomizer(album.assetCount)) : randomizer

        for (let i = 0; i < initialHistorySize; i++){
            await getNewRandomAsset(
                assts, fetchAsstsCount, lftAlbums, rndmzrs, albumsState, 
                (asset) => assts.push(asset),
                (albums) => lftAlbums = albums instanceof Function ? albums(lftAlbums) : albums,
                (count) => fetchAsstsCount = count instanceof Function ? count(fetchAsstsCount) : count,
            )
        }

        setAll({
            assets: assts,
            leftAlbums: lftAlbums,
            indexAsset: 0,
            fetchingAssetsCount: fetchAsstsCount,
            randomizers: rndmzrs,
            playing: true,
        })

        setLoadStatus(false)
        animateToMiddle()
    }

    async function getNewRandomAsset(
        assts = assets,
        fecAsstsCount = fetchingAssetsCount,
        lftAlbums = leftAlbums,
        rndmzrs = randomizer,
        albmState = albumsState,
        addAsst = (asset: AssetHistory) => addAsset(asset),
        setLftAlbums = setLeftAlbums,
        setFtchCount = setFetchingCount,
    ) {
        if (lftAlbums.length == 0) return
        if (assts.length + fecAsstsCount >= maxSizeHistory) return

        // Random album from leftAlbums
        const rndAlbum = Math.floor(Math.random() * lftAlbums.length)
        const indexAlbum = lftAlbums[rndAlbum]

        setFtchCount((count) => count + 1)
        const newAssetIndex = rndmzrs[indexAlbum].getRandomIndex()

        // If indexes is empty, delete album from leftAlbums
        if (newAssetIndex == undefined) {
            setLftAlbums((albums) => {
                // Delete album from leftAlbums
                const newAlbums = albums.filter((album) => album != indexAlbum)
                return newAlbums
            })
            setFtchCount((count) => count - 1)
            return
        }

        // GET ASSET FROM ALBUM (This is the V2, maybe change in the future)

        // Then get the asset and always get from newAssetIndex - (iterations * maxAssetsPagination)
        await MediaLibrary.getAssetsAsync({
            first: 1,
            album: albmState[indexAlbum].id,
            mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
            after: newAssetIndex.toString(),
        }).then((res) => {
            if (res.assets.length == 0) {
                showToast('Error getting files')
                setFtchCount((count) => count - 1)
                return
            }

            addAsst({
                albumPos: indexAlbum,
                mediaType: res.assets[0].mediaType,
                name: res.assets[0].filename,
            })
        }).catch((error) => { showToast('Error getting files ' + error)})
        .finally(() => { 
            setFtchCount((count) => count - 1)
        })
    }

    const animateToMiddle = (onFinish: () => void = () => {}) =>
        Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
        }).start(onFinish)

    const onGestureEvent = 
        Animated.event(
            [{ nativeEvent: {
                translationY: translateY,
            } }],
            { useNativeDriver: true }
        )

    const onHandlerStateChange = (event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            
            offsetY += event.nativeEvent.translationY
            let { translationY } = event.nativeEvent

            if (translationY < -120) { // Scrolling Up
                if (indexAsset + 2 >= maxSizeHistory) {
                    restart()
                    return
                }

                const finAssets: boolean = indexAsset + 1 >= assets.length,
                    noAlbums: boolean = leftAlbums.length == 0

                if (noAlbums && 
                    fetchingAssetsCount == 0 &&
                    finAssets) 
                { 
                    showToast('You have seen all the albums')
                    restart(true)
                    return
                }

                if (finAssets) {
                    animateToMiddle()
                    showToast('Loading more files...')
                    return
                }

                if (!noAlbums)
                    getNewRandomAsset()

                translationY = Math.max(translationY, -100)
                animate(event, translationY)
                setIndexAsset(indexAsset + 1)
            }
            else if (translationY > 120) { // Scrolling Down
                if (indexAsset - 1 < 0) {
                    animateToMiddle()
                    showToast('You are at the beginning')
                    return
                }

                translationY = Math.min(translationY, 100)
                animate(event, translationY)
                setIndexAsset(indexAsset - 1)

            } else animateToMiddle()
            
        }
    }

    const onShare = async () => {
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(getUri())
        } else showToast(`Sharing is not available on your platform`)
    }

    const animate = (
        event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>, 
        translationY: number
    ) => {
        Animated.decay(translateY, {
            velocity: event.nativeEvent.velocityY,
            deceleration: 0.5,
            useNativeDriver: true,
        }).start(() => {
            Animated.timing(translateY, {
                toValue: translationY < 0 ? 1000 : -1000,
                duration: 0,
                useNativeDriver: true,
            }).start(() => { animateToMiddle() })
        })
    }

    const getAlbum = () => albumsState[assets[indexAsset].albumPos]

    const getUri = () => `file:///storage/${getAlbum().folder}${getAlbum().title}/${assets[indexAsset].name}`

    if (loadStatus) return (
        <View style={[styles.bottomCenter, styles.fullSize]}>
            <ActivityIndicator animating size='large' />
        </View>
    )

    if (albumsState.length == 0) return (
        <View style={[styles.bottomCenter, styles.fullSize]}>
            <Text> No albums selected </Text>
            <Button
                icon="refresh"
                onPress={() => restart(true)}
            >
                Retry
            </Button>
        </View>
    )

    if (!assets || assets?.length == 0) return (
        <View style={[styles.bottomCenter, styles.fullSize]}>
            <Text>No videos or images found</Text>
            <Button
                icon="refresh"
                onPress={() => restart(true)}
            >
                Retry
            </Button>
        </View>
    )

    return (
    <>

    <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        maxPointers={1}
    >
        <Animated.View 
            style={[styles.fullSize, {
                transform: [{ translateY: Animated.add(translateY, offsetY) }]
            }]}
            onStartShouldSetResponder={() => true}
            onResponderRelease={() => {
                // Clear timer
                clearTimeout(timer!)
                setShowOptions(true)

                setTimer(setTimeout(() => {
                    setShowOptions(false)
                }, timerInterval))

                if (assets[indexAsset].mediaType == MediaLibrary.MediaType.video)
                    playPause()
            }}
        >
            {assets[indexAsset].mediaType == MediaLibrary.MediaType.video ?
                <Video
                    ref={ref}
                    source={{ uri: getUri() }}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay
                    isLooping
                    style={{ 
                        padding: 0, 
                        flex:1,
                    }}
                    onPlaybackStatusUpdate={(status) => {
                        if (status.isLoaded) setStatus(status)
                    }}
                    usePoster
                    posterSource={require('../assets/logo.png')}
                />
                :
                <Image
                    source={{ uri: getUri() }}
                    defaultSource={require('../assets/logo.png')}
                    style={{
                        flex: 1,
                        borderColor: 'red',
                        borderWidth: 1,
                        resizeMode: 'contain'
                    }}
                />
            }
        </Animated.View>
    </PanGestureHandler>
    
    {assets[indexAsset].mediaType == MediaLibrary.MediaType.video && showOptions &&
    <LinearGradient
        colors={['transparent', 'rgba(0,0,0,1)']}
        style={styles.videoOptions}
    >
        <IconButton
            icon={status?.isPlaying ? 'pause' : 'play'}
            style={{
                borderRadius: 50,
            }}
            onPress={() => playPause()}
        />

        <CustomSlider
            theme={theme}
            minimumValue={0}
            maximumValue={status?.durationMillis ?? 0}
            value={status?.positionMillis ?? 0}
            onSlidingComplete={(value) => ref.current?.setPositionAsync(value)}
            indicator={getIndicator()}
        />
    </LinearGradient>}

    <FAB.Group
        icon={openMore ? 'close' : 'plus'}
        style={styles.normalOptions}
        fabStyle={{ 
            borderRadius: 50, 
        }}
        variant='surface'
        visible={showOptions}
        open={openMore}
        onStateChange={({ open }) => {
            if (open) clearTimeout(timer!)
            else 
            setTimer(setTimeout(() => {
                setShowOptions(false)
            }, timerInterval))

            setOpenMore(open)
        }}
        actions={[
            { icon: 'share', onPress: () => onShare() },
            { icon: fullScreen ? 'fullscreen-exit' : 'fullscreen', onPress: () => swapFullScreen() },
        ]}
    />

    {false && <View style={styles.devInfo}>
        <Text>
            {`IndexAsset: ${indexAsset} | ActualAlbum: ${getAlbum().title}`}
        </Text>
        <Text>
            {`AssetCount: ${assets.length} | FetchingAssetsCount: ${fetchingAssetsCount}`}
        </Text>
        <Text>
            {`LeftAlbums: ${leftAlbums.length} | CountActualAlbum: ${getAlbum().assetCount}`}
        </Text>
    </View>}
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
        bottom: 30,
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