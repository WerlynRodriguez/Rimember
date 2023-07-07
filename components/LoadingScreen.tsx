import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

/** Loading screen 
 * Display a loader, when a layout is loading something
 **/
export default function LoadingScreen() {
    return (
        <View style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingBottom: 50
        }}>
            <ActivityIndicator animating size='large' />
        </View>
    )
}