import { Button, Dialog, MD3Theme, Portal, Text, withTheme } from "react-native-paper"

function BasicDialog({
    show,
    setShow,
    title = "Warning",
    description = "Are you sure you want to do this?",
    confirmAction,
    theme
} : {
    show: boolean
    setShow: (show: boolean) => void
    title?: string
    description?: string
    confirmAction: () => void
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
                <Button onPress={() => setShow(false)}>Cancel</Button>
                <Button
                    textColor={theme.colors.error}
                    onPress={() => { 
                        confirmAction()
                        setShow(false)
                    }}
                >
                    Yes, I'm sure
                </Button>
            </Dialog.Actions>

        </Dialog>
    </Portal>
    )
}

export default withTheme(BasicDialog)