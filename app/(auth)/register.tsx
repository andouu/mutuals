import { ThemedView } from "@/components/ThemedView";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { GLOBAL_COLORS } from "../globals";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/init";
import { FirebaseError } from "firebase/app";

export default function Register() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const router = useRouter();

  const signup = async () => {
    try {
      setLoading(true);
      const user = await createUserWithEmailAndPassword(auth, email, password);
      if (user) {
        router.replace("/");
      }
    } catch (err: unknown) {
      const errFB = err as FirebaseError;
      console.error(errFB);
      if (errFB.code === "auth/invalid-email") {
        setError("Invalid email");
      } else if (
        errFB.code === "auth/missing-password" ||
        errFB.code === "auth/weak-password"
      ) {
        setError("Invalid password");
      } else if (errFB.code === "auth/email-already-in-use") {
        setError("Email already in use");
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={{ height: "100%" }}>
      <SafeAreaView>
        <View style={styles.wrapper}>
          <Text style={styles.title}>Sign Up</Text>
          <View style={styles.inputs}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(newEmail) => {
                  setError("");
                  setEmail(newEmail);
                }}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={(newPassword) => {
                  setError("");
                  setPassword(newPassword);
                }}
                secureTextEntry
              />
            </View>
          </View>
          {error && <Text style={styles.error}>{error}</Text>}
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed ? styles.pressed : undefined,
            ]}
            onPress={signup}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginText}>Sign Up</Text>
            )}
          </Pressable>
          <View style={styles.actionLinks}>
            <Link href="login" style={styles.link}>
              Already have an account?
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: "100%",
    justifyContent: "center",
    padding: 25,
  },
  title: {
    fontFamily: "NeueMontrealMedium",
    fontSize: 35,
  },
  inputs: {
    marginTop: 80,
    gap: 20,
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
  },
  error: {
    marginTop: 15,
    color: GLOBAL_COLORS.red,
    fontFamily: "NeueMontrealMedium",
  },
  loginButton: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    borderRadius: 5,
    backgroundColor: GLOBAL_COLORS.brandColor,
  },
  pressed: {
    opacity: 0.65,
  },
  loginText: {
    color: "white",
    fontFamily: "NeueMontrealMedium",
  },
  actionLinks: {
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "center",
  },
  link: {
    fontFamily: "NeueMontrealMedium",
    textDecorationLine: "underline",
    textDecorationColor: "black",
  },
});
