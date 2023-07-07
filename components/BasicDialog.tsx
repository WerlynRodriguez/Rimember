import { Button, Dialog, MD3Theme, Portal, Text, withTheme } from "react-native-paper"
import { tKeys, tr } from "../translate"

/** A basic dialog with a title, description, and two buttons. */
function BasicDialog({
    show,
    setShow,
    title = "Warning",
    description = "Are you sure you want to do this?",
    confirmAction,
    onConfirmClose = true,
    loading = false,
    theme
} : {
    /** Whether the dialog is visible. */
    show: boolean
    /** A function to set the visibility of the dialog. */
    setShow: (show: boolean) => void
    /** The title of the dialog. */
    title?: string
    /** The description of the dialog. */
    description?: string
    /** The function to call when the confirm button is pressed. */
    confirmAction: () => void
    /** Whether the dialog should close when the confirm button is pressed. */
    onConfirmClose?: boolean
    /** Whether the buttons should be disabled. */
    loading?: boolean
    theme: MD3Theme
}
){
    return (
    <Portal>
        <Dialog visible={show} onDismiss={() => setShow(false)} style={{borderRadius: 10}}>
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Content>
                <Text>
                    {description}
                </Text>
            </Dialog.Content>
            <Dialog.Actions>
                <Button onPress={() => { if (!loading) setShow(false)}}>
                    {tr(tKeys.actionno)}
                </Button>
                <Button
                    textColor={theme.colors.error}
                    onPress={() => { 
                        if (loading) return
                        confirmAction()
                        if (onConfirmClose) setShow(false)
                    }}
                >
                    {tr(tKeys.actionyes)}
                </Button>
            </Dialog.Actions>

        </Dialog>
    </Portal>
    )
}

export default withTheme(BasicDialog)