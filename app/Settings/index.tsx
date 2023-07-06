import { useEffect, useState } from "react"
import { View } from "react-native"
import { ActivityIndicator, Button, Divider, MD3Theme, Text, useTheme, withTheme } from "react-native-paper"
import { useAlbumsStore } from "../../store"
import { ScrollView } from "react-native-gesture-handler"
import CustomSlider from "../../components/CustomSlider"
import BasicDialog from "../../components/BasicDialog"
import BasicHeader from "../../components/BasicHeader"
import { configOptions, defaultConfig, mediaStorage, useStorage } from "../../config"
import { useRouter } from "expo-router"
import { tKeys, tr } from "../../translate"

const Section = withTheme(({
    title, 
    children, 
    theme
} : {
    title: string
    children: React.ReactNode
    theme: MD3Theme
}
) => (
<>
    <Text variant="titleLarge" style={{
        color: theme.colors.outline,
        backgroundColor: theme.colors.backdrop,
        padding: 15,
        paddingBottom: 25,
        borderRadius: theme.roundness,
        top: 15,
    }}>
        {title}
    </Text>
    <View 
        style={{
            padding: 15,
            borderRadius: theme.roundness,
            backgroundColor: theme.colors.background,
            marginBottom: 15
        }}
    >
        {children}
    </View>
</>
))

const ItemSection = withTheme(({
    title, desc, right, children, theme
} : {
    title: string,
    desc?: string,
    right?: React.ReactNode,
    children?: React.ReactNode
    theme: MD3Theme
}) => (
    <>
    <View 
        style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}
    >
        <View style={{ flex: 0.9 }}>
            <Text variant="titleMedium">
                {title}
            </Text>

            {desc && 
            <Text 
                variant="bodyMedium"
                style={{
                    color: theme.colors.outline
                }}
            >
                {desc}
            </Text>}
        </View>

        {right}
    </View>
    {children}
    <Divider style={{marginVertical: 15}} bold/>
    </>
))

export default function Settings() {
    const router = useRouter()
    const setAlbumsState = useAlbumsStore(state => state.setAlbums)

    const theme = useTheme()

    const [config, setConfig] = useState<typeof defaultConfig>(defaultConfig)

    const [load, setLoad] = useState(true)
    const [modal, setModal] = useState(false)
    const [action, setAction] = useState(0)

    useEffect(() => {
        async function Start() {
            setConfig(await configOptions.config())
            setLoad(false)
        }

        Start()
    }, [])

    const ModalAction = [
        {
            hint: tr(tKeys.warResetHistory),
            action: () => { mediaStorage.resetHistory(true) }
        },
        {
            hint: tr(tKeys.warResetAll),
            action: () => {
                mediaStorage.resetHistory(true)
                useStorage.clear()
                setAlbumsState([])
                setConfig(defaultConfig)
            }
        }
    ]

    if (load) return <ActivityIndicator animating size='large' />

    return (<>
    <BasicHeader title={tr(tKeys.settings)} />
    <ScrollView style={{
        flex: 1,
        margin: 15,
        marginTop: 0,
    }}>

        <Section title={tr(tKeys.settings)}>

            <ItemSection
                title={tr(tKeys.intLoad)}
                desc={tr(tKeys.descIntLoad)}
                right={
                    <Text>
                        {config.initialLoad}
                    </Text>
                }
            >
                <CustomSlider
                    value={config.initialLoad}
                    posIndicator
                    indicator={`${defaultConfig.initialLoad} - ${10}`}
                    onSlidingComplete={(value) => {
                        setConfig({...config, initialLoad: value})
                        configOptions.config({...config, initialLoad: value})
                    }}
                    minimumValue={defaultConfig.initialLoad}
                    maximumValue={10}
                    step={1}
                    style={{ marginVertical: 15 }}
                />
            </ItemSection>

            <ItemSection
                title={tr(tKeys.maxSizHist)}
                desc={tr(tKeys.descMaxSizHist)}
                right={
                    <Text>
                        {config.maxHistorySize}
                    </Text>
                }
            >
                <CustomSlider
                    value={config.maxHistorySize}
                    posIndicator
                    indicator={`${defaultConfig.maxHistorySize} - ${100}`}
                    onSlidingComplete={(value) => {
                        setConfig({...config, maxHistorySize: value})
                        configOptions.config({...config, maxHistorySize: value})
                    }}
                    minimumValue={defaultConfig.maxHistorySize}
                    maximumValue={100}
                    step={10}
                    style={{ marginVertical: 15 }}
                />
            </ItemSection>

            <ItemSection
                title={tr(tKeys.timeAutoScrl)}
                desc={tr(tKeys.descTimeAutoScrl)}
                right={
                    <Text>
                        {config.timeAutoScroll / 1000} s
                    </Text>
                }
            >
                <CustomSlider
                    value={config.timeAutoScroll}
                    posIndicator
                    indicator={`${defaultConfig.timeAutoScroll / 1000} s - ${10} s`}
                    onSlidingComplete={(value) => {
                        setConfig({...config, timeAutoScroll: value})
                        configOptions.config({...config, timeAutoScroll: value})
                    }}
                    minimumValue={defaultConfig.timeAutoScroll}
                    maximumValue={10000}
                    step={1000}
                    style={{ marginVertical: 15 }}
                />
            </ItemSection>
        </Section>

        <Section title={tr(tKeys.about)}>
            <ItemSection title={tr(tKeys.about)}>
                <Button
                    mode="outlined"
                    style={{ borderColor: theme.colors.outline, borderWidth: 1 }}
                    textColor={theme.colors.outline}
                    onPress={() => {
                        router.replace('Settings/About')
                    }}
                    icon="information"
                >
                    {tr(tKeys.about)}
                </Button>
            </ItemSection>
        </Section>

        <Button
            mode="outlined"
            style={{ marginBottom: 15, borderColor: theme.colors.errorContainer, borderWidth: 1 }}
            textColor={theme.colors.error}
            onPress={() => {
                setAction(0)
                setModal(true)
            }}
            icon="restart"
        >
            {tr(tKeys.resetHistory)}
        </Button>

        <Button
            mode="contained"
            buttonColor={theme.colors.errorContainer}
            textColor={theme.colors.error}
            icon="delete"
            onPress={() => {
                setAction(1)
                setModal(true)
            }
        }>
            {tr(tKeys.resetAll)}
        </Button>

    </ScrollView>
    <BasicDialog
        show={modal}
        setShow={setModal}
        description={ModalAction[action].hint}
        confirmAction={() => ModalAction[action].action()}
    />
    </>)
}