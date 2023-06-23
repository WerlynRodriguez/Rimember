import Slider from '@react-native-community/slider'
import { Video, ResizeMode, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av'
import { useEffect, useRef, useState } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { IconButton, MD3Theme } from 'react-native-paper'
import CustomSlider from './CustomSlider'

/** A video player used in the home screen. */
export default function VideoPlayer({
    uri,
    style = {},
    theme,
    btnPauseStyle,
    sliderStyle,
}: {
    uri: string
    style?: StyleProp<ViewStyle>
    theme: MD3Theme
    btnPauseStyle?: StyleProp<ViewStyle>
    sliderStyle?: StyleProp<ViewStyle>
}) {
    const ref: React.MutableRefObject<Video | null> = useRef(null)
    const [status, setStatus] = useState<AVPlaybackStatusSuccess>()
    const [stringDuration, setStringDuration] = useState<string>('0:00')

    useEffect(() => {
        if (status?.isLoaded) 
            if (status.durationMillis) setStringDuration(formatDuration(status.durationMillis))
    }, [status])

    const playPause = () => {
        if (ref.current == undefined) return

        if (status?.isPlaying) ref.current.pauseAsync()
        else ref.current.playAsync()
    }

    function formatDuration(durationMillis: number) {
        const pad = (num: number) => num.toString().padStart(2, '0')
        const totalSeconds = Math.floor(durationMillis / 1000)
        const seconds = totalSeconds % 60
        const totalMinutes = Math.floor(totalSeconds / 60)
        const minutes = totalMinutes % 60
        const hours = Math.floor(totalMinutes / 60)
        return `${hours ? hours + ':' : ''}${pad(minutes)}:${pad(seconds)}`
    }

    const getIndicator = () => {
        return status?.isLoaded ? `${formatDuration(status.positionMillis)} / ${stringDuration}` : '0:00'
    }


    return (
    <>
        <Video
            ref={ref}
            source={{ uri: uri }}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping
            style={[{ 
                padding: 0, 
                flex:1,
            }, style]}
            onStartShouldSetResponder={() => true}
            onResponderRelease={playPause}
            onPlaybackStatusUpdate={(status) => {
                if (status.isLoaded) setStatus(status)
            }}
            usePoster
            posterSource={require('../assets/logo.png')}
        />
        <IconButton
            icon={status?.isPlaying ? 'pause' : 'play'}
            style={btnPauseStyle}
            onPress={playPause}
        />

        <CustomSlider
            containerStyle={sliderStyle}
            theme={theme}
            minimumValue={0}
            maximumValue={status?.durationMillis ?? 0}
            value={status?.positionMillis ?? 0}
            onValueChange={(value) => ref.current?.setPositionAsync(value)}
            indicator={getIndicator()}
        />
    </>
    )
}