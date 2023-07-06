import { useRouter } from "expo-router"
import { Linking, ScrollView, View } from "react-native"
import { IconButton, MD3Theme, Surface, Text, withTheme } from "react-native-paper"
import BasicHeader from "../../components/BasicHeader"
import { tKeys, tr } from "../../translate"

export default function About() {
    const router = useRouter()

    return (<>
    <BasicHeader title={tr(tKeys.about)}
    onBack={() => router.replace("Settings")} />
    <ScrollView style={{
        flex: 1,
        margin: 15,
        marginTop: 0,
    }}>
        <Section
            title={tr(tKeys.whatIsApp)}
            desc={tr(tKeys.descWhatIsApp)}
        />

        <Section
            title={tr(tKeys.howToUse)}
            desc={tr(tKeys.descHowToUse)}
        />

        <Section
            title={tr(tKeys.whatHappens)}
            desc={tr(tKeys.descWhatHappens)}
            />

        <Section
            title={tr(tKeys.aboutDev)}
            desc={tr(tKeys.descAboutDev)}
        >
            <IconButton
                icon="github"
                onPress={() => Linking.openURL("https://github.com/WerlynRodriguez")}
            />
            <IconButton
                icon="linkedin"
                onPress={() => Linking.openURL("https://www.linkedin.com/in/werlyn-rodriguez-760007183/")}
            />
            <IconButton
                icon="youtube"
                onPress={() => Linking.openURL("https://www.youtube.com/@WerlynDev/videos")}
            />
            <IconButton
                icon="gmail"
                onPress={() => Linking.openURL("mailto:werlyndev@gmail.com")}
            />
        </Section>

        <Section
            title={tr(tKeys.moreUpdates)}
            desc={tr(tKeys.descMoreUpdates)}
        />

        <Section
            title={tr(tKeys.wantSupport)}
            desc={tr(tKeys.descWantSupport)}
        >
            <IconButton
                icon="parking" // No found paypal icon XD
                onPress={() => Linking.openURL("https://paypal.me/WerlynR?country.x=NI&locale.x=es_XC")}
            />
            <IconButton
                icon="coffee"
                onPress={() => Linking.openURL("https://bmc.link/WerlynDev")}
            />
        </Section>
    </ScrollView>
    </>)
}

const Section = withTheme(({
    title,
    desc,
    children,
    theme
} : {
    title: string
    desc?: string
    children?: React.ReactNode
    theme: MD3Theme
}
) => (
    <Surface
        style={{
            borderRadius: theme.roundness,
            backgroundColor: theme.colors.background,
            marginBottom: 15,
            padding: 15,
        }}
    >
        <Text variant="titleLarge">
            {title}
        </Text>
        <Text variant="bodyMedium" style={{
            color: theme.colors.outline,
            marginTop: 5,
        }}>
            {desc}.
        </Text>
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 15
        }}>
            {children}
        </View>
    </Surface>
))