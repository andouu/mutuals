import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { GLOBAL_COLORS, GLOBAL_CONSTANTS } from "../globals";
import { useRouter } from "expo-router";

export default function Indicate() {
  const router = useRouter();

  const goNext = () => router.replace("/details");

  return (
    <View style={{ width: "100%", height: "100%", backgroundColor: "white" }}>
      <SafeAreaView style={{ height: "100%" }}>
        <View style={styles.wrapper}>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.description}>We're super glad to have you!</Text>
          <Text style={styles.description}>
            Before you start connecting with mutuals, let’s make your profile.{" "}
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              pressed ? styles.pressed : undefined,
            ]}
            onPress={goNext}
          >
            <Text style={styles.continueText}>Get Started!</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: GLOBAL_CONSTANTS.px,
    backgroundColor: "white",
  },
  title: {
    marginBottom: 15,
    fontFamily: "NeueMontrealMedium",
    fontSize: 35,
  },
  description: {
    fontFamily: "NeueMontrealBook",
    fontSize: 16,
  },
  continueButton: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    borderRadius: 5,
    backgroundColor: GLOBAL_COLORS.brandColor,
  },
  pressed: {
    opacity: 0.65,
  },
  continueText: {
    color: "white",
    fontFamily: "NeueMontrealMedium",
  },
});
