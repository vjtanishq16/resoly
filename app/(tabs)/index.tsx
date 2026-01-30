import { Text, View , StyleSheet } from "react-native";
import { Link } from "expo-router";
import { Button } from "react-native-paper";
import { useAuth } from "@/lib/auth-context";
export default function Index() {
  const { signOut } = useAuth();
  return (
    <View style={styles.View}>
      <Text>Hi there</Text>
      <Button mode="text" icon={"logout"} onPress={signOut}>Sign Out</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  View : {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  Link : {
    width: 100, 
    height: 40,
    backgroundColor: "lightgrey", 
    textAlign: "center", 
    lineHeight: 40 , 
    borderRadius: 20 
  }
});