import { Slot, useRouter, SplashScreen } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as NavigationBar from 'expo-navigation-bar';
import React, { useCallback, useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { 
    BottomNavigation,
    PaperProvider,
    MD3DarkTheme as DefaultTheme,
    MD3Theme
} from 'react-native-paper'
import { Route } from '../interfaces'
import { useAlbumsStore, useMediaStore } from '../store'
import { mediaStorage } from '../config'
import { tKeys, tr } from '../translate';

// Deep Dark with purple accent
const myTheme : MD3Theme = {
    ...DefaultTheme,
    roundness: 10,
    colors: {
        ...DefaultTheme.colors,
        primary: '#cfbcff',
        onPrimary: '#381e72',
        primaryContainer: '#4f378a',
        onPrimaryContainer: '#e9ddff',
        secondary: '#cbc2db',
        onSecondary: '#332d41',
        secondaryContainer: '#4a4458', // gota
        onSecondaryContainer: '#e8def8', // icono relleno
        tertiary: '#efb8c8',
        onTertiary: '#4a2532',
        tertiaryContainer: '#633b48',
        onTertiaryContainer: '#ffd9e3',
        error: '#ffb4ab',
        onError: '#690005',
        errorContainer: '#93000a',
        onErrorContainer: '#ffdad6',
        background: '#1c1b1e',
        onBackground: '#e6e1e6',
        surface: '#1c1b1e',
        onSurface: '#e6e1e6',
        surfaceVariant: '#49454e',
        onSurfaceVariant: '#cac4cf',
        outline: '#948f99',
        elevation: {
            level0: '#000',
            level1: '#010101',
            level2: '#020202',
            level3: '#030303',
            level4: '#040404',
            level5: '#050505'
        }
    }
}

/** All routes for the bottom navigation bar */
const routes : Route[] = [
    { 
        key: '/', title: tr(tKeys.home), 
        focusedIcon: 'home', unfocusedIcon: 'home-outline' 
    },
    { 
        key: 'Albums', title: tr(tKeys.albums), 
        focusedIcon: 'folder', unfocusedIcon: 'folder-outline' 
    },
    { 
        key: 'Settings', title: tr(tKeys.settings), 
        focusedIcon: 'cog', unfocusedIcon: 'cog-outline' 
    }
]

SplashScreen.preventAutoHideAsync()

export default function AppLayout() {
    const router = useRouter()
    const [indexNav, setIndexNav] = useState(0)
    const [routeNav, setRouteNav] = useState(routes[indexNav].key)

    // Load all needed data before showing the app
    const [isReady, setIsReady] = useState(false)

    const fullScreen = useMediaStore(state => state.fullScreen)
    const setAlbumsState = useAlbumsStore(state => state.setAlbums)

    // Load necesary data in the first render
    useEffect(() => {
        async function load() {
            if (isReady) return

            await NavigationBar.setBackgroundColorAsync(myTheme.colors.elevation.level0)
            await NavigationBar.setButtonStyleAsync("light")
            await mediaStorage.albums().then(setAlbumsState)

            setIsReady(true)
        }

        load()
    }, [])


    // Hide the navigation bar when the full screen mode is enabled
    useEffect(() => {

        if (fullScreen) NavigationBar.setVisibilityAsync("hidden")
        else NavigationBar.setVisibilityAsync("visible")
        
    }, [fullScreen])


    /** Hide the splash screen when the View is ready */
    const onlayout = useCallback(() => {
        if (isReady) SplashScreen.hideAsync()
    }, [isReady])

    // When return null, the splash screen is shown
    if (!isReady) return null

    return (
    <PaperProvider theme={myTheme}>
        <View 
            style={[styles.container, {
                backgroundColor: myTheme.colors.elevation.level0
            }]}
            onLayout={onlayout}
        >
            <View style={styles.container}>
                <Slot/>
            </View>

            {!fullScreen && <BottomNavigation.Bar
                navigationState={{ index: indexNav, routes }}
                shifting
                onTabPress={({ route }) => {
                    if (route.key === routeNav) return

                    setIndexNav(routes.findIndex(r => r.key === route.key))
                    setRouteNav(route.key)
                    router.replace(route.key)
                }}
                style={{
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    borderTopColor: myTheme.colors.surfaceVariant,
                    borderTopWidth: 1
                }}
            />}

        </View>
        <StatusBar 
            style="light"
            hidden={fullScreen}
            translucent={false}
            backgroundColor='black'
        />
    </PaperProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})
