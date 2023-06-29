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
import { useAlbumsStore, useMediaStore } from '../store'
import { mediaStorage } from '../config';
import { SafeAreaView } from 'react-native-safe-area-context';

// Amoled Dark with puprle accent
const myTheme : MD3Theme = {
    ...DefaultTheme,
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

interface Route {
    key: string;
    title: string;
    focusedIcon: string;
    unfocusedIcon: string;
}

const routes : Route[] = [
    { key: '/', title: 'Home', focusedIcon: 'home', unfocusedIcon: 'home-outline' },
    { key: 'Albums', title: 'Folders', focusedIcon: 'folder', unfocusedIcon: 'folder-outline' },
    { key: 'Settings', title: 'Settings', focusedIcon: 'cog', unfocusedIcon: 'cog-outline' }
]

SplashScreen.preventAutoHideAsync()

export default function AppLayout() {
    const router = useRouter()
    const [indexNav, setIndexNav] = useState(0)
    const [routeNav, setRouteNav] = useState(routes[indexNav].key)
    const [isReady, setIsReady] = useState(false)

    const fullScreen = useMediaStore(state => state.fullScreen)
    const setAlbumsState = useAlbumsStore(state => state.setAlbums)

    useEffect(() => {
        async function load() {
            if (isReady) return

            await NavigationBar.setBackgroundColorAsync(myTheme.colors.elevation.level0)
            await NavigationBar.setButtonStyleAsync("light")
            await mediaStorage.albums().then(setAlbumsState)

            // await 2s to prevent the splash screen to be hidden too early
            await new Promise(resolve => setTimeout(resolve, 2000))

            setIsReady(true)
        }

        load()
    }, [])

    useEffect(() => {

        if (fullScreen) NavigationBar.setVisibilityAsync("hidden")
        else NavigationBar.setVisibilityAsync("visible")
        
    }, [fullScreen])

    const onlayout = useCallback(() => {
        if (isReady) SplashScreen.hideAsync()
    }, [isReady])

    if (!isReady) return null

    return (
    <PaperProvider theme={myTheme}>
        <View 
            style={[styles.container, {
                backgroundColor: myTheme.colors.elevation.level0
            }]}
            onLayout={onlayout}
        >
            <SafeAreaView style={styles.container}>
                <Slot/>
            </SafeAreaView>

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
                    backgroundColor: myTheme.colors.elevation.level0,
                    borderTopColor: myTheme.colors.surfaceVariant,
                    borderTopWidth: 1
                }}
            />}

        </View>
        <StatusBar style="light" hidden={fullScreen} />
    </PaperProvider>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
})
