import { Appbar, MD3Theme, withTheme } from "react-native-paper";

/** A basic header with a title, back button and no top padding. */
function BasicHeader({
    title,
    theme,
    onBack
} : {
    /** The title of the header. */
    title: string,
    theme: MD3Theme
    /** A function to call when the back button is pressed. */
    onBack?: () => void
}) {
    return (
    <Appbar.Header
        mode='small'
        statusBarHeight={0}
        style={{backgroundColor: theme.colors.elevation.level0}}
    >
        {onBack && <Appbar.BackAction onPress={onBack} />}
        <Appbar.Content title={title} />
    </Appbar.Header>
    )
}

export default withTheme(BasicHeader)