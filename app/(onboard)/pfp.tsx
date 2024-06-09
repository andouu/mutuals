import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GLOBAL_COLORS, GLOBAL_CONSTANTS } from "../globals";
import { useState } from "react";
import { Entypo } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { auth } from "@/firebase/init";
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "@/firebase/fireStorage";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { router, useRouter } from "expo-router";

export default function PFP() {
  const [pfp, setPfp] = useState<{ b64: string }>();
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const handleSelectPfp = async () => {
    if (!auth.currentUser) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const encoded = result.assets[0].base64;
      if (!encoded) {
        return;
      }

      setPfp({ b64: encoded });
    }
  };

  const handleSavePfp = async () => {
    if (!pfp || !auth.currentUser) {
      return;
    }

    try {
      if (!pfp.b64) {
        return;
      }

      setLoading(true);

      const pfpRef = ref(storage, auth.currentUser.uid + ".jpg");
      await uploadBytes(pfpRef, new Blob([pfp.b64], { type: "text/plain" }));

      const userInfo = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userInfo, {
        isDone: true,
      });

      router.replace("/");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ width: "100%", height: "100%", backgroundColor: "white" }}>
      <SafeAreaView style={{ height: "100%" }}>
        <View style={styles.wrapper}>
          <Text style={styles.title}>Profile Picture</Text>
          <Text style={styles.subtitle}>Step 3 of 3</Text>
          <Pressable style={styles.imagePicker} onPress={handleSelectPfp}>
            {pfp ? (
              <Image
                style={styles.image}
                source={{ uri: `data:image/jpeg;base64,${pfp.b64}` }}
              />
            ) : (
              <Entypo name="image" size={35} color={GLOBAL_COLORS.darkGray} />
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              pressed ? styles.pressed : undefined,
              !pfp || loading ? styles.disabled : undefined,
            ]}
            onPress={handleSavePfp}
            disabled={!pfp || loading}
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
  imagePicker: {
    overflow: "hidden",
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: "auto",
    borderRadius: 99,
    backgroundColor: GLOBAL_COLORS.lightGray,
  },
  image: {
    width: "100%",
    height: "100%",
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
