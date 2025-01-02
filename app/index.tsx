import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthProvider } from "@/context/AuthContext";

type Props = {};

const WelcomeScreen = (props: Props) => {

  return (
    <SafeAreaView>
    <View style={styles.container} >
      <Text>Welcome Screen</Text>
      <Link href="/home" asChild>
        <TouchableOpacity>
          <Text>Go to Home Screen</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/signup" asChild>
        <TouchableOpacity>
          <Text>Go to SignUp Screen</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/login" asChild>
        <TouchableOpacity>
          <Text>Go to login Screen</Text>
        </TouchableOpacity>
      </Link>
    </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});