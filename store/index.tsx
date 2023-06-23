import { create } from 'zustand'
import { AssetHistory, ItemAlbum } from '../interfaces'
import { Randomizer } from '../classes'

interface AlbumsStore {
    /** The albums list */
    albums: ItemAlbum[]
    /** Set the albums list */
    setAlbums: (albums: ItemAlbum[]) => void
    /** Get a new Set() of albums ids (used in selection) */
    getSetFromAlbums: () => Set<string>
}

export const useAlbumsStore = create<AlbumsStore>((set) => ({
    albums: [],
    setAlbums: (albums) => set({ albums: albums }),
    getSetFromAlbums: () => {
        const albums: ItemAlbum[] = useAlbumsStore.getState().albums
        return new Set(albums.map((album) => album.id))
    }
}))

interface MediaStore {
    playing: boolean
    fullScreen: boolean
    assets: AssetHistory[]
    leftAlbums: number[]
    randomizers: Randomizer[]
    indexAsset: number
    indexAlbum: number
    fetchingAssetsCount: number

    /** Set the playing state, if true the player will restart */
    setPlaying: (playing: boolean) => void
    /** Swap the full screen state */
    swapFullScreen: (full?: boolean) => void
    /** Add a new asset to the history */
    addAsset: (asset: AssetHistory) => void
    /** Set the left albums 
     * @param albums The new albums or a function that returns the new albums
     * @example setLeftAlbums((albums) => albums.add(1))
     **/
    setLeftAlbums: ((albums: number[]) => void) & ((albums: (albums: number[]) => number[]) => void)
    /** Set the index of the actual asset */
    setIndexAsset: (index: number) => void
    /** Set the index of the actual album 
     * @param index The new index or a function that returns the new index
     **/
    setIndexAlbum: (index: number) => void
    /** Set the fetching assets count 
     * @param count The new count or a function that returns the new count
     * @example setFetchingCount((count) => count + 1)
     **/
    setFetchingCount: ((count: number) => void) & ((count: (count: number) => number) => void)
    /** Set all the store */
    setAll: (newPartialState: Partial<MediaStore>) => void
}

export const useMediaStore = create<MediaStore>((set) => ({
    playing: false,
    fullScreen: false,
    assets: [],
    leftAlbums: [],
    randomizers: [],
    indexAsset: 0,
    indexAlbum: 0,
    fetchingAssetsCount: 0,

    setPlaying: (playing) => 
        set({ playing: playing }),
    swapFullScreen: (full = undefined) => 
        set((state) => ({ fullScreen: full === undefined ? !state.fullScreen : full })),
    addAsset: (asset) => 
        set((state) => ({ assets: [...state.assets, asset] })),
    // setLeftAlbums will be a function like a UseState of React. example: setLeftAlbums((albums) => albums.add(1))
    setLeftAlbums: (albums) => 
        set((state) => ({ leftAlbums: albums instanceof Function ? albums(state.leftAlbums) : albums })),
    setIndexAsset: (index) => 
        set({ indexAsset: index }),
    setIndexAlbum: (index) => 
        set({ indexAlbum: index }),
    setFetchingCount: (count) => 
        set((state) => ({ fetchingAssetsCount: count instanceof Function ? count(state.fetchingAssetsCount) : count })),
    setAll: (newPartialState) => 
        set((state) => ({ ...state, ...newPartialState }))
}))