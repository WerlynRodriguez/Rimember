import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Button, Divider, List, MD3Theme, Text, useTheme, Appbar, FAB, Portal, Dialog } from 'react-native-paper'
import * as MediaLibrary from 'expo-media-library'
import { StyleSheet, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { ItemAlbum } from '../../interfaces'
import { useAlbumsStore, useMediaStore } from '../../store'
import { mediaStorage } from '../../config'

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

    const [playing, setPlaying] = useMediaStore(state => [
        state.playing,
        state.setPlaying
    ])

    const [count, setCount] = useState(albumsState.length)

    const [loadingStatus, setLoadingStatus] = useState({
        fetch: true,
        list: true
    })
    const [modal, setModal] = useState(false)

    const [albums, setAlbums] = useState<ItemAlbum[]>([])
    const [selected, setSelected] = useState<Set<string>>(getSetFromAlbums())

    const theme = useTheme()
    
    useEffect(() => {
        getAllAlbums()
    }, [])

    const setLoadStatus = (name: string, value: boolean) => setLoadingStatus(prev => ({ ...prev, [name]: value }))

    const getAllAlbums = async () => {
        setLoadStatus('fetch', true)
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync()
            if (status !== 'granted') {
                alert('Permission to access media library is required')
                return
            }

            // Getting albums from media library
            const MdAlbs = await MediaLibrary.getAlbumsAsync()
            MdAlbs.sort((a, b) => a.title.localeCompare(b.title))

            const albs: ItemAlbum[] = MdAlbs.map((alb) => ({
                id: alb.id,
                title: alb.title,
                assetCount: alb.assetCount,
                folder: ""
            }))


            setAlbums(albs)

        } catch (error) {
            alert('Error getting albums')
        } finally { setLoadStatus('fetch', false) }
    }

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

    const onSave = async () => {
        if (loadingStatus.fetch || loadingStatus.list) return
        setLoadStatus('fetch', true)

        try {
            const albs = albums.filter((alb) => selected.has(alb.id))

            for (const alb of albs) {
                await MediaLibrary.getAssetsAsync({
                    album: alb.id,
                    first: 1,
                    mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video]
                }).then((res) => {
                    /** Saving folder path
                     * @example Example of uri: file:///storage/emulated/0/DCIM/Camera/IMG_20210602_000000.jpg
                     * Example of filename: IMG_20210602_000000.jpg
                     * The folder path is the uri without the filename, "file:///storage/" and folder.title
                     **/
                    alb.folder = res.assets[0].uri
                    .replace(`${alb.title}/${res.assets[0].filename}`, '')
                    .replace('file:///storage/', '')
                })
            }

            setAlbumsState(albs)
            await mediaStorage.albums(albs)
            setPlaying(false)
        } catch (error) {
            alert('Error saving albums')
        } finally { 
            setLoadStatus('fetch', false) 
        }

        setModal(false)
    }

    return (
    <View style={{ 
        flex: 1,
        backgroundColor: theme.colors.background
    }}>
        <Appbar.Header 
            mode='small'
            style={{
                backgroundColor: theme.colors.elevation.level0,
            }}
        >
            <Appbar.Content title={`${count} Albums`} />
        </Appbar.Header>

        {loadingStatus.list || loadingStatus.fetch && (<ActivityIndicator size="large" animating style={styles.actInctr} />)}

        <FlashList
            data={albums}
            keyExtractor={item => item.id}
            numColumns={columAlbums}
            estimatedItemSize={100}
            renderItem={({ item }) => (
                <ListItem
                    item={item}
                    theme={theme}
                    defaultChecked={selected.has(item.id)}
                    onPress={onPressAlbum}
                />
            )}
            ItemSeparatorComponent={() => (
                <Divider bold/>
            )}
            ListEmptyComponent={() => (
                <Text>No hay albums</Text>
            )}
            onLoad={() => {
                setLoadStatus('list', false)
            }}
        />

        <FAB
            icon='content-save'
            style={styles.Fab}
            onPress={() => {
                if (playing)
                    setModal(true)
                else
                    onSave()
            }}
            loading={loadingStatus.fetch || loadingStatus.list}
        />
        <Portal>
            <Dialog visible={modal} onDismiss={() => setModal(false)}>
                <Dialog.Title>Alert</Dialog.Title>
                <Dialog.Content>
                    <Text>
                        Al guardar, se reiniciará la reproducción
                    </Text>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => setModal(false)}>Cancel</Button>
                    <Button onPress={onSave}>Save</Button>
                </Dialog.Actions>

            </Dialog>
        </Portal>

    </View>
    )
}

function ListItem({
    item,
    theme,
    defaultChecked,
    onPress
}: {
    item: ItemAlbum
    theme: MD3Theme
    defaultChecked: boolean
    onPress: (id: string, selected: boolean) => void
}) {
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
}

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