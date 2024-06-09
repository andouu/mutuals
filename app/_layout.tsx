import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    NeueMontrealThin: require("../assets/fonts/PPNeueMontreal-Thin.otf"),
    NeueMontrealBook: require("../assets/fonts/PPNeueMontreal-Book.otf"),
    NeueMontrealMedium: require("../assets/fonts/PPNeueMontreal-Medium.otf"),
    NeueMontrealBold: require("../assets/fonts/PPNeueMontreal-Bold.otf"),
    NeueMontrealItalic: require("../assets/fonts/PPNeueMontreal-Italic.otf"),
    NeueMontrealSemiBoldItalic: require("../assets/fonts/PPNeueMontreal-SemiBolditalic.otf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(onboard)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
