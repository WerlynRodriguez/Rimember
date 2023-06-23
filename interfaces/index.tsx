import * as MediaLibrary from 'expo-media-library'

export interface ItemAlbum {
    id: string
    title: string
    assetCount: number
    folder: string
}

export interface AssetHistory {
    albumPos: number
    mediaType: MediaLibrary.MediaTypeValue
    name: string
}