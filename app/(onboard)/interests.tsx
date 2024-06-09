import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GLOBAL_COLORS, GLOBAL_CONSTANTS } from "../globals";
import { useRouter } from "expo-router";
import { useState } from "react";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";
import { auth } from "@/firebase/init";

type Interest = {
  id: string;
  name: string;
};

export const INTERESTS: Interest[] = [
  {
    id: "poker",
    name: "Poker",
  },
  {
    id: "sports",
    name: "Sports",
  },
  {
    id: "boba_runs",
    name: "Boba Runs",
  },
  {
    id: "food",
    name: "Food",
  },
];

export default function Interests() {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const handleSelectInterest = (interest: Interest) => {
    if (!INTERESTS.includes(interest)) {
      return;
    }

    const interestIndex = interests.findIndex(
      (_interest) => _interest.id === interest.id
    );
    if (interestIndex !== -1) {
      const copy = interests.slice();
      copy.splice(interestIndex, 1);
      setInterests(copy);
    } else {
      setInterests((prev) => [...prev, interest]);
    }
  };

  const saveInterests = async () => {
    try {
      if (interests.length === 0 || !auth.currentUser) {
        return;
      }

      setLoading(true);

      const userInfo = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userInfo, {
        interests,
      });

      router.replace("/pfp");
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
          <Text style={styles.title}>Interests</Text>
          <Text style={styles.subtitle}>Step 2 of 3</Text>
          <Text style={styles.description}>What are you interested in?</Text>
          <View style={styles.interestContainer}>
            {INTERESTS.map((interest) => (
              <Text key={interest.id}>
                <Pressable
                  style={[
                    styles.interestWrapper,
                    interests.includes(interest) ? styles.selected : undefined,
                  ]}
                  onPress={() => handleSelectInterest(interest)}
                >
                  <Text
                    style={[
                      styles.interest,
                      {
                        color: interests.includes(interest)
                          ? GLOBAL_COLORS.brandColor
                          : GLOBAL_COLORS.darkGray,
                      },
                    ]}
                  >
                    {interest.name}
                  </Text>
                </Pressable>
              </Text>
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.continueButton,
              pressed ? styles.pressed : undefined,
              interests.length === 0 || loading ? styles.disabled : undefined,
            ]}
            onPress={saveInterests}
            disabled={interests.length === 0 || loading}
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
  interestContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  interestWrapper: {
    borderWidth: 1.5,
    borderStyle: "solid",
    borderColor: GLOBAL_COLORS.lightGray,
    borderRadius: 99,
  },
  interest: {
    paddingHorizontal: 17.5,
    paddingVertical: 7.5,
    color: GLOBAL_COLORS.darkGray,
    fontFamily: "NeueMontrealMedium",
  },
  selected: {
    borderColor: GLOBAL_COLORS.brandColor,
    color: GLOBAL_COLORS.brandColor,
    backgroundColor: GLOBAL_COLORS.greenShadow,
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
