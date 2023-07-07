import React, { useEffect, useState } from 'react'
import { 
    ActivityIndicator, 
    Divider, 
    List, 
    MD3Theme, 
    Text, 
    FAB, 
    withTheme 
} from 'react-native-paper'
import * as MediaLibrary from 'expo-media-library'
import { StyleSheet } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { ItemAlbum } from '../../interfaces'
import { useAlbumsStore } from '../../store'
import { mediaStorage } from '../../config'
import BasicDialog from '../../components/BasicDialog'
import BasicHeader from '../../components/BasicHeader'
import { tKeys, tr } from '../../translate'

const columAlbums = 2

export default function Albums() {

    const [
        albumsState,
        getSetFromAlbums,
        setAlbumsState
    ] = useAlbumsStore(state => [
        state.albums,
        state.getSetFromAlbums,
        state.setAlbums
    ])

    const [count, setCount] = useState(albumsState.length)

    const [loadingStatus, setLoadingStatus] = useState({
        fetch: true, // Getting albums
        list: true // Loading flash list
    })
    const [modal, setModal] = useState(false)

    const [albums, setAlbums] = useState<ItemAlbum[]>([])
    const [selected, setSelected] = useState<Set<string>>(getSetFromAlbums())
    
    useEffect(() => {
        getAllAlbums()
    }, [])

    const setLoadStatus = (name: string, value: boolean) => setLoadingStatus(prev => ({ ...prev, [name]: value }))

    /** Getting all albums from media library (used in the first render)
     **/
    const getAllAlbums = async () => {
        setLoadStatus('fetch', true)
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync()
            if (status !== 'granted') {
                alert(tr(tKeys.reqPermission))
                return
            }

            // Getting albums from media library
            const MdAlbs = await MediaLibrary.getAlbumsAsync()
            MdAlbs.sort((a, b) => a.title.localeCompare(b.title)) // Sort by title

            // Converting to ItemAlbum
            setAlbums(
                MdAlbs.map((alb) => ({
                    id: alb.id,
                    title: alb.title,
                    assetCount: alb.assetCount,
                    folder: ""
                }))
            )

        } finally { setLoadStatus('fetch', false) }
    }

    /** Selecting or unselecting album
     * @param id Album id
     * @param selected If album is selected
     **/
    const onPressAlbum = (id: string, selected: boolean) => {
        if (selected) {
            setCount(prev => prev - 1)
            setSelected(prev => {
                prev.delete(id)
                return prev
            })
        } else {
            setCount(prev => prev + 1)
            setSelected(prev => {
                prev.add(id)
                return prev
            })
        }
    }

    /** Saving new albums
     **/
    const onSave = async () => {
        if (loadingStatus.fetch || loadingStatus.list) return

        setLoadStatus('fetch', true)
        let errorString = ''

        const albs = albums.filter((alb) => selected.has(alb.id))

        for (const alb of albs) {

            await MediaLibrary.getAssetsAsync({
                album: alb.id,
                first: 1,
                mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video]
            }).then((res) => {
                /** Saving folder path
                 * @example 
                 * Example of uri: file:///storage/emulated/0/DCIM/Camera/IMG_20210602_000000.jpg
                 * Example of filename: IMG_20210602_000000.jpg
                 * The folder path is the uri without the filename, "file:///storage/" and folder.title
                 **/
                alb.folder = res.assets[0].uri
                .replace(`${alb.title}/${res.assets[0].filename}`, '')
                .replace('file:///storage/', '')
            }).catch((err) => {
                errorString += `${alb.title}\n`
            })
        }

        if (errorString !== '')
            alert(`${tr(tKeys.errSetAlbums)}\n\n${errorString}`)
        else {
            setAlbumsState(albs)
            await mediaStorage.albums(albs)
            await mediaStorage.resetHistory(true)
        }

        setModal(false)
        setLoadStatus('fetch', false)
    }

    return (
    <>
    <BasicHeader title={`${tr(tKeys.albums)} ${count}`} />

    {loadingStatus.list || loadingStatus.fetch && 
    (<ActivityIndicator size="large" animating style={styles.actInctr} />)}

    <FlashList
        data={albums}
        keyExtractor={item => item.id}
        numColumns={columAlbums}
        estimatedItemSize={73}
        renderItem={({ item }) => (
            <ListItem
                item={item}
                defaultChecked={selected.has(item.id)}
                onPress={onPressAlbum}
            />
        )}
        ItemSeparatorComponent={() => (
            <Divider bold/>
        )}
        ListEmptyComponent={() => (
            <Text>No albums</Text>
        )}
        onLoad={() => {
            setLoadStatus('list', false)
        }}
    />

    <FAB
        icon='content-save'
        style={styles.Fab}
        onPress={() => { setModal(true) }}
        loading={loadingStatus.fetch || loadingStatus.list}
    />
    <BasicDialog
        show={modal}
        setShow={setModal}
        description={tr(tKeys.warResetHistory)}
        confirmAction={onSave}
        onConfirmClose={false}
        loading={loadingStatus.fetch}
    />
    </>
    )
}

const ListItem = withTheme(({
    item,
    theme,
    defaultChecked,
    onPress
}: {
    /** Album item */
    item: ItemAlbum
    theme: MD3Theme
    /** If album should be selected */
    defaultChecked: boolean
    /** Function to call when album is selected or unselected */
    onPress: (id: string, selected: boolean) => void
}) => {
    const [sel, setSel] = useState(defaultChecked)
    return (
        <List.Item
            title={item.title}
            description={item.assetCount.toString()}
            accessibilityLabel={item.title}
            left={props => (
                <List.Icon {...props} icon='folder' />
            )}
            right={props => <List.Icon {...props} icon={sel ? 'checkbox-marked-circle' : ''} />}
            onPress={() => {
                setSel((prev) => {
                    onPress(item.id, prev)
                    return !prev
                })
            }}
            style={{
                flex: 1,
                backgroundColor: sel ? 
                    theme.colors.secondaryContainer : 
                    theme.colors.background
            }}
        />
    )
})

const styles = StyleSheet.create({
    actInctr : {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    Fab : {
        position: 'absolute',
        right: 0,
        bottom: 0,
        margin: 16,
    }
})