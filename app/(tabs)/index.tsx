import { Text, View , StyleSheet } from "react-native";
import { Link } from "expo-router";
export default function Index() {
  return (
    <View
      style={styles.View}
    >
      <Text>Hi there</Text>
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