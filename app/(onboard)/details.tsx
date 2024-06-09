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
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const generateDiscriminator = () => {
    let discriminator = "";
    for (let i = 0; i < 4; i++) {
      discriminator += Math.floor(Math.random() * 8 + 1).toString();
    }

    return discriminator;
  };

  const saveName = async () => {
    try {
      if (name.length === 0 || name.length > 30 || !auth.currentUser) {
        return;
      }

      setLoading(true);

      const userInfo = doc(db, "users", auth.currentUser.uid);
      await setDoc(userInfo, {
        name,
        username,
        discriminator: generateDiscriminator(),
      });

      router.replace("/interests");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyFields = () => {
    const nameNoAlphabetical = name.replaceAll(/[a-zA-Z\s]/g, "");
    if (
      name.length === 0 ||
      name.length > 30 ||
      nameNoAlphabetical.length > 0
    ) {
      return false;
    }

    const usernameNoAlphanumeric = username.replaceAll(/[a-zA-Z0-9]/g, "");
    if (
      username.length === 0 ||
      username.length > 30 ||
      usernameNoAlphanumeric.length > 0
    ) {
      return false;
    }

    return true;
  };

  const canContinue = verifyFields();

  return (
    <View style={{ width: "100%", height: "100%", backgroundColor: "white" }}>
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
              value={name}
              onChangeText={(newName) => {
                setName(newName);
              }}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              maxLength={30}
              value={username}
              onChangeText={(newUsername) => {
                setUsername(newUsername);
              }}
              autoCapitalize="none"
            />
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              pressed ? styles.pressed : undefined,
              !canContinue || loading ? styles.disabled : undefined,
            ]}
            onPress={saveName}
            disabled={!canContinue || loading}
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
    backgroundColor: "white",
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
