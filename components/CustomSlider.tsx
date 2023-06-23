import Slider from "@react-native-community/slider";
import { SliderProps, StyleProp, View, ViewStyle } from "react-native";
import { MD3Theme, Text } from "react-native-paper";

interface CustomSliderProps extends SliderProps {
    theme: MD3Theme
    leftValue?: string
    rightValue?: string
    /** Determinate the position of the string indicator
     * - `'false'` - The string indicator is on top of the slider
     * - `'true'` - The string indicator is on bottom of the slider
     * @default false
    */
    posIndicator?: boolean
    /** The string indicator */
    indicator?: string
    containerStyle?: StyleProp<ViewStyle>
}

export default function CustomSlider(props: CustomSliderProps) {
    return (
    <View style={[props.containerStyle, {
        flexDirection: props?.posIndicator ? 'column-reverse' : 'column',
        alignItems: 'center'
    }]}>
    {props.indicator && <Text variant="titleSmall">
        {props.indicator}
    </Text>}
    <Slider
        {...props}
        style={[props.style, {
            flex: 1,
            width: '100%',
            height: 20
        }]}
        minimumTrackTintColor={props.theme.colors.primary}
        maximumTrackTintColor={props.theme.colors.secondary}
        thumbTintColor={props.theme.colors.primary}
    />
    </View>
    )
}