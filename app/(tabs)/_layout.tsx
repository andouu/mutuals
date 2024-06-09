import { Redirect, Tabs, usePathname, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { auth } from "@/firebase/init";
import { GLOBAL_COLORS } from "../globals";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firestore";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();
  const pathname = usePathname();

  const [shouldRedirect, setShouldRedirect] = useState<
    { href: string } | undefined
  >();

  useEffect(() => {
    if (!auth.currentUser) {
      setShouldRedirect({
        href: "/login",
      });
    }

    const checkOnboard = async () => {
      try {
        setLoading(true);

        const userInfo = await getDoc(
          doc(db, "users", auth.currentUser?.uid || "")
        );

        if (!userInfo.exists() || !userInfo.data().isDone) {
          setShouldRedirect({ href: "/indicate" });
        } else {
          setShouldRedirect(undefined);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    checkOnboard();
  }, []);

  if (shouldRedirect) {
    router.replace(shouldRedirect.href);
  }

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarBackground: () => (
          <View style={{ width: "100%", height: "100%", flexDirection: "row" }}>
            <View
              style={{
                flex: 1,
                backgroundColor: "white",
                ...(pathname === "/"
                  ? {
                      borderTopWidth: 2.5,
                      borderStyle: "solid",
                      borderTopColor: GLOBAL_COLORS.brandColor,
                    }
                  : undefined),
              }}
            >
              <LinearGradient
                style={{ flex: 1 }}
                colors={
                  pathname === "/" ? [GLOBAL_COLORS.greenShadow, "white"] : []
                }
              />
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: "white",
                ...(pathname === "/friends"
                  ? {
                      borderTopWidth: 2.5,
                      borderStyle: "solid",
                      borderTopColor: GLOBAL_COLORS.brandColor,
                    }
                  : undefined),
              }}
            >
              <LinearGradient
                style={{ flex: 1 }}
                colors={
                  pathname === "/friends"
                    ? [GLOBAL_COLORS.greenShadow, "white"]
                    : []
                }
              />
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: "white",
                ...(pathname === "/settings"
                  ? {
                      borderTopWidth: 2.5,
                      borderStyle: "solid",
                      borderTopColor: GLOBAL_COLORS.brandColor,
                    }
                  : undefined),
              }}
            >
              <LinearGradient
                style={{ flex: 1 }}
                colors={
                  pathname === "/settings"
                    ? [GLOBAL_COLORS.greenShadow, "white"]
                    : []
                }
              />
            </View>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Invites",
          tabBarIconStyle: { display: "none" },
          tabBarLabelStyle: { ...styles.label },
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          tabBarIconStyle: { display: "none" },
          tabBarLabelStyle: styles.label,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIconStyle: { display: "none" },
          tabBarLabelStyle: styles.label,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 5,
    color: "black",
    fontFamily: "NeueMontrealMedium",
    fontSize: 18,
  },
  loadingWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
