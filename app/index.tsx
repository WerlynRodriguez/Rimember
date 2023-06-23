import React, { useEffect, useState } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native';
import { ActivityIndicator, IconButton, Text, useTheme } from 'react-native-paper'
import { useAlbumsStore, useMediaStore } from '../store'
import * as MediaLibrary from 'expo-media-library'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Animated } from 'react-native'
import { HandlerStateChangeEvent, PanGestureHandler, PanGestureHandlerEventPayload, State } from 'react-native-gesture-handler'
import { Image } from 'expo-image'
import { Randomizer } from '../classes'
import { AssetHistory } from '../interfaces';
import VideoPlayer from '../components/VideoPlayer'
import * as ScreenOrientation from 'expo-screen-orientation'

const loadNames = Object.freeze({
    firstLoad: 'firstLoad',
})

// const maxAssetsPagination = 100
const maxSizeHistory = 26
const initialHistorySize = 10

export default function Home() {
    const theme = useTheme()
    const [loadStatus, setLoadStatus] = useState({
        [loadNames.firstLoad]: true,
    })
    const setLoadStatusIn = (name: string, value: boolean) => setLoadStatus(prev => ({ ...prev, [name]: value }))

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
        startApp()

        const onChangeOrientation = (listener: ScreenOrientation.OrientationChangeEvent) => {
            if (listener.orientationInfo.orientation == 
                ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
                listener.orientationInfo.orientation ==
                ScreenOrientation.Orientation.LANDSCAPE_RIGHT
            ) {swapFullScreen(true)}
            
        }

        ScreenOrientation.addOrientationChangeListener(onChangeOrientation)

        return () => {
            ScreenOrientation.removeOrientationChangeListeners()
        }
    }, [])

    const startApp = () => {
        if (albumsState.length == 0) return

        // Full reset
        if (!playing) restart(true)
        else setLoadStatusIn(loadNames.firstLoad, false)
    }

    const restart = async (full = false) => {
        setLoadStatusIn(loadNames.firstLoad, true)

        const assts: AssetHistory[] = []
        let lftAlbums: number[] = full ? albumsState.map((_, index) => index) : leftAlbums
        let fetchAsstsCount = 0
        const rndmzrs = full ? albumsState.map((album) => new Randomizer(album.assetCount)) : randomizer

        for (let i = 1; i < initialHistorySize; i++) {
            if (leftAlbums.length == 0) break
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

        setLoadStatusIn(loadNames.firstLoad, false)
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
        if (assts.length + fecAsstsCount >= maxSizeHistory) return false

        // Random album from leftAlbums
        const rndAlbum = Math.floor(Math.random() * lftAlbums.length)
        const indexAlbum = lftAlbums[rndAlbum]

        setFtchCount((count) => count + 1)
        const newAssetIndex = rndmzrs[indexAlbum].getRandomIndex() ?? 0

        // If indexes is empty, delete album from leftAlbums
        if (rndmzrs[indexAlbum].indexes.length == 0) {
            setLftAlbums((albums) => {
                // Delete album from leftAlbums
                const newAlbums = albums.filter((album) => album != indexAlbum)
                return newAlbums
            })
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
                alert('Error assets in await addNewAssetToHistory')
                setFtchCount((count) => count - 1)
                return false
            }

            addAsst({
                albumPos: indexAlbum,
                mediaType: res.assets[0].mediaType,
                name: res.assets[0].filename,
            })
        }).finally(() => { 
            setFtchCount((count) => count - 1)
            return true
        })
    }

    const animateToMiddle = (onFinish: () => void = () => {}) =>
        Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
        }).start(onFinish)
    
    
    // const onGestureEvent = Animated.event(
    //     [{ nativeEvent: { 
    //         translationY: translateY
    //     } }],
    //     { useNativeDriver: true }
    // )

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
            let { translationY, translationX } = event.nativeEvent

            if (translationY < -120) { // Scrolling Up
                if (indexAsset + 1 >= maxSizeHistory) {
                    restart()
                    return
                }

                const finAssets: boolean = indexAsset + 1 >= assets.length
                const noAlbums: boolean = leftAlbums.length == 0

                if (finAssets) {
                    animateToMiddle()
                    alert('Cargando assets, espera un momento')
                    return
                }

                if (noAlbums && 
                    fetchingAssetsCount == 0 &&
                    finAssets) 
                { 
                    alert('Has llegado al final de todos los albums')
                    restart(true)
                    return
                }

                if (assets.length - indexAsset <= initialHistorySize && !noAlbums)
                    getNewRandomAsset()

                translationY = Math.max(translationY, -100)
                animate(event, translationY)
                setIndexAsset(indexAsset + 1)
            }
            else if (translationY > 120) { // Scrolling Down
                if (indexAsset - 1 < 0) {
                    animateToMiddle()
                    alert('Has llegado al inicio de la lista')
                    return
                }

                translationY = Math.min(translationY, 100)
                animate(event, translationY)
                setIndexAsset(indexAsset - 1)

            } else animateToMiddle()
            
        }
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

    const rotateScreen = () => {
        if (Dimensions.get('window').height > Dimensions.get('window').width) {
            swapFullScreen(true)
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
        }
        else 
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT)
    }

    const getAlbum = () => albumsState[assets[indexAsset].albumPos]

    const getUri = () => `file:///storage/${getAlbum().folder}${getAlbum().title}/${assets[indexAsset].name}`

    if (albumsState.length == 0) return (
        <View style={[styles.center, styles.fullSize]}>
            <Text>
                Aun no has seleccionado ningun album
            </Text>
        </View>
    )

    if (loadStatus[loadNames.firstLoad]) return (
        <View style={[styles.center, styles.fullSize]}>
            <ActivityIndicator animating size='large' />
        </View>
    )

    if (!assets || assets?.length == 0) return (
        <View style={[styles.center, styles.fullSize]}>
            <Text variant='displayMedium'>No hay assets</Text>
        </View>
    )

    return (
    <View style={[styles.fullSize, styles.center]}>

        <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
        >
            <Animated.View style={[styles.fullSize, {
                transform: [{ translateY: Animated.add(translateY, offsetY) }]
            }]}>
                {assets[indexAsset].mediaType == MediaLibrary.MediaType.video ?
                    <VideoPlayer 
                        uri={getUri()} 
                        theme={theme}
                        btnPauseStyle={[styles.fab, styles.btmLeft]}
                        sliderStyle={[styles.fab, styles.videoSlider]}
                    />
                    :
                    <Image
                        source={{ uri: getUri() }}
                        style={{
                            flex: 1,
                            width: '100%',
                            height: '100%',
                            padding: 0,
                            margin: 0,
                        }}
                        contentFit="contain"
                        transition={0}                       
                        placeholder={require('../assets/logo.png')}
                    />
                }
            </Animated.View>
        </PanGestureHandler>

        <View
            style={[styles.fab, styles.btmRight]}
        >            
            <IconButton
                icon={fullScreen ? 'fullscreen-exit' : 'fullscreen'}
                onPress={() => {swapFullScreen()}}
            />
        </View>

        {false && <Text style={[styles.fab, styles.tpLeft]}>
            {`
            IndexAsset: ${indexAsset} | ActualAlbum: ${getAlbum().title}
            AssetCount: ${assets.length} | FetchingAssetsCount: ${fetchingAssetsCount}
            LeftAlbums: ${leftAlbums.length}`
            }
        </Text>}

    </View>
    )
}

const styles = StyleSheet.create({
    fullSize: {
        flex: 1,
        width: '100%',
        height: '100%',
        padding: 0
    },
    fab: {
        position: 'absolute',
        margin: 10,
    },
    videoSlider: { 
        bottom: 0, 
        left: 44,
        right: 44
    },
    btmLeft: { bottom: 0, left: 0 },
    btmRight: { bottom: 0, right: 0 },
    tpLeft: { top: 0, left: 0 },
    center: {
        justifyContent: 'center',
        alignItems: 'center'
    }
})

/*
async function addNewAssetToHistory() {
        if (assets.length + fetchingAssetsCount >= maxSizeHistory) return false
        if (assets.length + fetchingAssetsCount >= albumsState[indexAlbum].assetCount) return false
        addFetchingCount()

        const newAssetIndex = randomizer.getRandomIndex()
        // No more indexes
        if (newAssetIndex == undefined) {
            remFetchingCount()
            return false
        }

        // GET ASSET FROM ALBUM (This is V1)
        let iterations = 0
        let after = undefined

        // Make x páginations (if newAssetIndex > maxAssetsPagination)
        // Example: newAssetIndex = 150, maxAssetsPagination = 100
        // iterations = 1
        if (newAssetIndex > maxAssetsPagination)
            iterations = Math.floor(newAssetIndex / maxAssetsPagination)

        try {
            let i = 0
            while (i < iterations) {
                await MediaLibrary.getAssetsAsync({
                    first: maxAssetsPagination,
                    album: albumsState[indexAlbum].id,
                    mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
                    after: after,
                }). then((res) => { 
                    after = res.endCursor
                }).finally(() => { i++ })
            }

            const relatIndex = newAssetIndex - (iterations * maxAssetsPagination)
            // Then get the asset and always get from newAssetIndex - (iterations * maxAssetsPagination)
            await MediaLibrary.getAssetsAsync({
                first: relatIndex + 1,
                album: albumsState[indexAlbum].id,
                mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
                after: after,
            }).then((res) => { 
                addAsset({
                    mediaType: res.assets[relatIndex].mediaType,
                    name: res.assets[relatIndex].filename,
                })
            })

        } catch (error) {
            console.log(error)
            alert('Error al cargar assets from addNewAssetToHistory')
        } finally {
            remFetchingCount()
            return true
        }
    }
 */