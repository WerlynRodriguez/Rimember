import { useRouter } from "expo-router"
import { Linking, ScrollView, View } from "react-native"
import { IconButton, MD3Theme, Surface, Text, withTheme } from "react-native-paper"
import BasicHeader from "../../components/BasicHeader"
import { tKeys, tr } from "../../translate"

export default function About() {
    const router = useRouter()

    /** Links to show in the about dev section */
    const links = [
        { icon: "github", url: "https://github.com/WerlynRodriguez" },
        { icon: "linkedin", url: "https://www.linkedin.com/in/werlyn-rodriguez-760007183/" },
        { icon: "youtube", url: "https://www.youtube.com/@WerlynDev/videos" },
        { icon: "gmail", url: "mailto:werlyndev@gmail.com" },
    ]

    /** Links to show in the support section */
    const supportLinks = [
        { icon: "parking", url: "https://paypal.me/WerlynR?country.x=NI&locale.x=es_XC" },
        { icon: "coffee", url: "https://bmc.link/WerlynDev" },
    ]

    /** Render the button icons in any section */
    const RenderIcons = (data: typeof links) => {
        return data.map(({ icon, url }) => (
            <IconButton 
                key={icon}
                icon={icon}
                onPress={() => Linking.openURL(url)}
            />
        ))
    }

    return (<>
    <BasicHeader 
        title={tr(tKeys.about)}
        onBack={() => router.replace("Settings")}
    />
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
            {RenderIcons(links)}
        </Section>

        <Section
            title={tr(tKeys.moreUpdates)}
            desc={tr(tKeys.descMoreUpdates)}
        />

        <Section
            title={tr(tKeys.wantSupport)}
            desc={tr(tKeys.descWantSupport)}
        >
            {RenderIcons(supportLinks)}
        </Section>
    </ScrollView>
    </>)
}

// This section is different from the settings section
const Section = withTheme(({
    title,
    desc,
    children,
    theme
} : {
    /** Section title */
    title: string
    /** Section description */
    desc?: string
    /** Something to render inside the section */
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
        {desc && <Text variant="bodyMedium" style={{
            color: theme.colors.outline,
            marginTop: 5,
        }}>
            {desc}.
        </Text>}
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 15
        }}>
            {children}
        </View>
    </Surface>
))