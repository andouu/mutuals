import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { GLOBAL_COLORS, GLOBAL_CONSTANTS } from "../globals";
import { useRouter } from "expo-router";
import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { auth } from "@/firebase/init";

export default function Details() {
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const saveName = async () => {
    try {
      if (name.length === 0 || name.length > 30 || !auth.currentUser) {
        return;
      }

      setLoading(true);

      const userInfo = doc(db, "users", auth.currentUser.uid);
      await setDoc(userInfo, {
        name,
      });

      router.replace("/interests");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ height: "100%" }}>
      <SafeAreaView style={{ height: "100%" }}>
        <View style={styles.wrapper}>
          <Text style={styles.title}>Details</Text>
          <Text style={styles.subtitle}>Step 1 of 3</Text>
          <Text style={styles.description}>What's your name?</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              maxLength={30}
              onChangeText={(newName) => {
                setName(newName);
              }}
            />
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              pressed ? styles.pressed : undefined,
              name.length === 0 || name.length > 30 || loading
                ? styles.disabled
                : undefined,
            ]}
            onPress={saveName}
            disabled={name.length === 0 || name.length > 30 || loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.continueText}>Continue →</Text>
            )}
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
  },
  title: {
    marginBottom: -5,
    fontFamily: "NeueMontrealMedium",
    fontSize: 35,
  },
  subtitle: {
    marginBottom: 15,
    color: GLOBAL_COLORS.darkGray,
    fontFamily: "NeueMontrealBook",
  },
  description: {
    marginBottom: 5,
    fontFamily: "NeueMontrealBook",
    fontSize: 16,
  },
  inputWrapper: {
    gap: 5,
  },
  inputLabel: {
    color: GLOBAL_COLORS.darkGray,
    fontFamily: "NeueMontrealMedium",
    fontSize: 14,
  },
  input: {
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderColor: GLOBAL_COLORS.lightGray,
    borderWidth: StyleSheet.hairlineWidth,
    fontFamily: "NeueMontrealMedium",
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
  disabled: {
    opacity: 0.5,
  },
  continueText: {
    color: "white",
    fontFamily: "NeueMontrealMedium",
  },
});
