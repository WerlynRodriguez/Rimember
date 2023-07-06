import AsyncStorage from "@react-native-async-storage/async-storage"
import { ItemAlbum } from "../interfaces"
import { Dimensions } from "react-native"

export const height = Dimensions.get('window').height

/** Default history config
 **/
export const defaultConfig = {
    maxHistorySize: 20,
    initialLoad: 5,
    timeAutoScroll: 6000,
}

export const configOptions: {
    config: (newConfig?: typeof defaultConfig) => Promise<typeof defaultConfig>
    resetConfig: () => Promise<void>
} = {
    config: async (newConfig?: typeof defaultConfig) => newConfig ?
        useStorage.setItem('config', newConfig) :
        useStorage.getItem('config').then((value) => value ? value : defaultConfig),
    resetConfig: () => useStorage.removeItem('config')
}

const mdStKeys = {
    albums: 'albums',
    resetHistory: 'resetHistory',
}

export const mediaStorage: {
    albums: (newAlbums?: ItemAlbum[]) => Promise<ItemAlbum[]>
    resetHistory: (newPlaying?: boolean) => Promise<boolean>
    resetStorage: () => void
} = {
    albums: async (newAlbums?: ItemAlbum[]) => newAlbums ? 
        useStorage.setItem(mdStKeys.albums, newAlbums) : 
        useStorage.getItem(mdStKeys.albums).then((value) => value ? value : []),
    resetHistory: async (newPlaying?: boolean) => newPlaying !== undefined ?
        useStorage.setItem(mdStKeys.resetHistory, newPlaying) :
        useStorage.getItem(mdStKeys.resetHistory).then((value) => value),
    resetStorage: () => {
        for (const key in mdStKeys) useStorage.removeItem(key)
    }
}

export const useStorage = {
    /** Save a value in AsyncStorage 
     * @param key The key to save the value
     * @param value The value to be saved
     **/
    setItem: async (key: string, value: any) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value))
        } catch (e) { console.error(e) }
    },
    /** Get a value from AsyncStorage
     * @param key The key to get the value
     * @returns The value saved in the key
     **/
    getItem: async (key: string) => {
        try {
            const value = await AsyncStorage.getItem(key)
            if (value !== null) return JSON.parse(value)
        } catch (e) { console.error(e) }
    },
    /** Remove a value from AsyncStorage
     * @param key The key to remove the value
     **/
    removeItem: async (key: string) => { 
        try {
            await AsyncStorage.removeItem(key)
        } catch (e) { console.error(e) }
    },
    /** Remove all the values from AsyncStorage */
    clear: async () => {
        try {
            await AsyncStorage.clear()
        } catch (e) { console.error(e) }
    }
}