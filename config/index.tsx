import AsyncStorage from "@react-native-async-storage/async-storage"
import { ItemAlbum } from "../interfaces"

export const configOptions = {

}

interface mediaStorage {
    albums: (newAlbums?: ItemAlbum[]) => Promise<ItemAlbum[]>
}

export const mediaStorage: mediaStorage = {
    albums: async (newAlbums?: ItemAlbum[]) => newAlbums ? 
        AsyncStorage.setItem('albums', JSON.stringify(newAlbums)) : 
        AsyncStorage.getItem('albums').then((value) => value ? JSON.parse(value) : [])
}

export const useStorage = {
    /** Save a value in AsyncStorage 
     * @param key The key to save the value
     * @param value The value to be saved
     **/
    setItem: async (key: string, value: string) => {
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
    }
}