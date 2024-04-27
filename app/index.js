import { PaperProvider } from "react-native-paper";
import { View,Text} from "react-native";

export default function Index() {
  return (
    <PaperProvider>
        <View>
            <Text style={{color: 'black'}}>Hello, world!</Text>
        </View>
    </PaperProvider>
  );
}
