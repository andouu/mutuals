import { ThemedView } from "@/components/ThemedView";
import { SafeAreaView, StyleSheet, Text } from "react-native";

export default function Invites() {
  return (
    <ThemedView style={{ height: "100%" }}>
      <SafeAreaView>
        <Text>Hello World</Text>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loadingWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
