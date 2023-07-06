import { Appbar, MD3Theme, withTheme } from "react-native-paper";

function BasicHeader({
    title,
    theme,
    onBack
} : {
    title: string,
    theme: MD3Theme
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