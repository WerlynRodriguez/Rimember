import { MediaTypeValue } from 'expo-media-library'

export interface ItemAlbum {
    id: string
    title: string
    assetCount: number
    folder: string
}

export interface AssetHistory {
    albumPos: number
    mediaType: MediaTypeValue
    name: string
}

export interface Route {
    key: string;
    title: string;
    focusedIcon: string;
    unfocusedIcon: string;
}