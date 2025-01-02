import { Stack } from "expo-router";
import WelcomeScreen from ".";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout() {
  return (
<AuthProvider>
  <Stack screenOptions={{headerShown:false}}>
    <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
    <Stack.Screen name="login" />
    <Stack.Screen name="signup" />
    <Stack.Screen name="forgot-password" />
    {/* <Stack.Screen name="searchresults" /> */}
  </Stack>
</AuthProvider>
  )
}
