import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="indicate" options={{ headerShown: false }} />
      <Stack.Screen name="details" options={{ headerShown: false }} />
      <Stack.Screen name="interests" options={{ headerShown: false }} />
      <Stack.Screen name="pfp" options={{ headerShown: false }} />
    </Stack>
  );
}
