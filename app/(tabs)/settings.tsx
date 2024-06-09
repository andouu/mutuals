import { ThemedView } from "@/components/ThemedView";
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
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { auth } from "@/firebase/init";
import { storage } from "@/firebase/fireStorage";
import { getBlob, getDownloadURL, ref } from "firebase/storage";
import { INTERESTS } from "../(onboard)/interests";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";

type UserInfo = {
  name: string;
  username: string;
  discriminator: string;
  pfp: string;
  interests: { id: string; name: string }[];
};

export default function Settings() {
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [pfp, setPfp] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  const router = useRouter();

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await signOut(auth);
      router.replace("/login");
    } catch (err) {
      console.error(err);
    } finally {
      setLoggingOut(false);
    }
  };

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        if (!auth.currentUser) {
          return;
        }

        setLoading(true);

        const userInfo = await getDoc(doc(db, "users", auth.currentUser.uid));

        if (!userInfo.exists()) {
          return;
        }

        setUserInfo(userInfo.data() as UserInfo);

        // get pfp
        const pfpRef = ref(storage, auth.currentUser.uid + ".jpg");
        const pfpUrl = await getDownloadURL(pfpRef);

        const pfpRes = await fetch(pfpUrl);
        const pfpB64 = await pfpRes.text();

        setPfp(pfpB64);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getUserInfo();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ThemedView
      style={{ width: "100%", height: "100%", backgroundColor: "white" }}
    >
      <SafeAreaView>
        <View style={styles.wrapper}>
          <View style={styles.userInfo}>
            <View style={styles.pfp}>
              <Image
                style={styles.pfpImage}
                source={{ uri: `data:image/jpeg;base64,${pfp}` }}
              />
            </View>
            <Text style={styles.name}>{userInfo?.name}</Text>
            <Text style={styles.username}>
              {userInfo?.username + "#" + userInfo?.discriminator}
            </Text>
          </View>
          <Text style={styles.heading}>Interests</Text>
          <View style={styles.interests}>
            {userInfo?.interests.map((interest) => (
              <View key={interest.id} style={styles.interest}>
                <Text style={styles.interestText}>{interest.name}</Text>
              </View>
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed ? styles.logoutButtonPressed : undefined,
            ]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loadingWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  wrapper: {
    width: "100%",
    height: "100%",
    paddingHorizontal: GLOBAL_CONSTANTS.px,
    backgroundColor: "white",
  },
  userInfo: {
    width: "100%",
    alignItems: "center",
    marginTop: 75,
  },
  pfp: {
    width: 150,
    height: 150,
    overflow: "hidden",
    borderRadius: 99,
    backgroundColor: GLOBAL_COLORS.lightGray,
  },
  pfpImage: {
    width: "100%",
    height: "100%",
  },
  name: {
    marginTop: 15,
    marginBottom: 5,
    fontFamily: "NeueMontrealMedium",
    fontSize: 25,
  },
  username: {
    marginBottom: 35,
    color: GLOBAL_COLORS.darkGray,
    fontFamily: "NeueMontrealBook",
  },
  heading: {
    marginBottom: 10,
    fontFamily: "NeueMontrealMedium",
    fontSize: 20,
  },
  interests: {
    flexDirection: "row",
    gap: 10,
  },
  interest: {
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: GLOBAL_COLORS.lightGray,
    borderRadius: 99,
  },
  interestText: {
    color: GLOBAL_COLORS.darkGray,
    fontFamily: "NeueMontrealMedium",
  },
  logoutButton: {
    width: "100%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
    borderRadius: 5,
    backgroundColor: GLOBAL_COLORS.red,
  },
  logoutButtonPressed: {
    opacity: 0.65,
  },
  logoutButtonText: {
    color: "white",
    fontFamily: "NeueMontrealMedium",
  },
});
