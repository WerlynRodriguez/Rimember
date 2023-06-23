import { useEffect, useRef, useState } from "react"
import { View, StyleSheet } from "react-native"
import { Appbar, Button, Divider, IconButton, Surface, Switch, Text, useTheme } from "react-native-paper"
import { useMediaStore } from "../../store"
import { ScrollView } from "react-native-gesture-handler"
import Slider from "@react-native-community/slider"
import CustomSlider from "../../components/CustomSlider"

/** Those values are used to prevent the user to set a value too high or too low */
const minHistorySize = 100
const maxHistorySize = 1000

export default function Settings() {
    const setPlaying = useMediaStore((state) => state.setPlaying)
    const theme = useTheme()

    const [repeatFiles, setRepeatFiles] = useState(false)
    const [noHistoryMode, setNoHistoryMode] = useState(false)
    const [historySize, setHistorySize] = useState(minHistorySize)

    const styles = StyleSheet.create({
        section: {
            padding: 15,
            borderRadius: theme.roundness,
            backgroundColor: theme.colors.background,
            marginBottom: 15
        },
        sectionPart: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
        }
    })

    const Section = ({
        title, children
    } : {
        title: string,
        children: React.ReactNode
    }
    ) => (
    <>
    <Text variant="titleLarge" style={{
        color: theme.colors.outline
    }}>
        {title}
    </Text>
    <View style={styles.section}>
        {children}
    </View>
    </>
    )

    const ItemSection = ({
        title, desc, right, children
    } : {
        title: string,
        desc?: string,
        right?: React.ReactNode,
        children?: React.ReactNode
    }) => (
        <>
        <View style={styles.sectionPart}>
            <View style={{flex: 0.8}}>
                <Text variant="titleMedium">
                    {title}
                </Text>

                {desc && 
                <Text 
                    variant="labelMedium"
                    style={{
                        textAlign: 'justify', 
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
    )

    return (<>
    <Appbar.Header 
        mode='small'
        style={{
            backgroundColor: theme.colors.elevation.level0,
        }}
    >
        <Appbar.Content title="Settings" />
    </Appbar.Header>
    <ScrollView style={{
        flex: 1,
        backgroundColor: theme.colors.elevation.level0,
        margin: 15,
        marginTop: 0,
    }}>
        <Section title="Albums">
            <View style={styles.sectionPart}>
                <Text variant="titleMedium">
                    History size
                </Text>
                <Text>
                    100
                </Text>
            </View>
        </Section>

        <Section title="History">

            <ItemSection
                title="Repeat files"
                desc="When you restart the app, repeat the files you already played."
                right={
                    <Switch
                        value={repeatFiles}
                        onValueChange={setRepeatFiles}
                    />
                }
            />

            <ItemSection
                title="No history mode"
                desc="Just play the next. This allow you to dont restart the history."
                right={
                    <Switch
                        value={noHistoryMode}
                        onValueChange={setNoHistoryMode}
                    />
                }
            />

            <ItemSection
                title="Max history size"
                desc="The maximum size of the history. If the history is full, it will remove oldest items."
                right={
                    <Text>
                        {historySize}
                    </Text>
                }
            >
                <CustomSlider
                    disabled={noHistoryMode}
                    value={historySize}
                    posIndicator
                    indicator={`${minHistorySize} - ${maxHistorySize}`}
                    onSlidingComplete={setHistorySize}
                    minimumValue={minHistorySize}
                    maximumValue={maxHistorySize}
                    step={100}
                    style={{
                        marginVertical: 15
                    }}
                    theme={theme}
                />
            </ItemSection>
        </Section>

        <Section title="Security">
            <ItemSection
                title="Fingerprint"
                desc="Use your fingerprint to unlock the app."
                right={
                    <Switch
                        value={false}
                        onValueChange={() => {}}
                    />
                }
            />
        </Section>

        <Button
            mode="contained"
            buttonColor={theme.colors.errorContainer}
            textColor={theme.colors.error}
            onPress={() => {
                setPlaying(false)
            }}
        >
            Reset
        </Button>

    </ScrollView>
    </>)
}