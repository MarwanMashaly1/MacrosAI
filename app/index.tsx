import { Stack, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "./AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();

  console.log('HomePage: user state:', user);
  console.log('HomePage: isLoading:', isLoading);

  const handleSignOut = async () => {
    await signOut();
    // No need to redirect, the auth context will handle the state update
  };

  if (isLoading) {
    return (
      <Stack.Screen options={{ title: "Home" }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Loading...</Text>
        </View>
      </Stack.Screen>
    );
  }

  return (
    <Stack.Screen
      options={{
        title: "Home",
        headerBackVisible: false, // Hide the back button
        headerRight: () => (
          <View style={{ flexDirection: "row", paddingRight: 10 }}>
            {user ? (
              <>
                <Text style={{ marginRight: 16, fontWeight: "bold" }}>
                  {user.username}
                </Text>
                <TouchableOpacity onPress={handleSignOut}>
                  <Text style={{ color: "red" }}>Sign Out</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text
                  onPress={() => router.push("/signup")}
                  style={{ marginRight: 16, color: "blue" }}
                >
                  Sign Up
                </Text>
                <Text
                  onPress={() => router.push("/login")}
                  style={{ color: "blue" }}
                >
                  Login
                </Text>
              </>
            )}
          </View>
        ),
      }}
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>
          {user ? `Hello ${user.username}!` : "Hello Guest!"}
        </Text>
        
        {!user && (
          <View style={{ alignItems: "center" }}>
            <Text style={{ marginBottom: 16, textAlign: "center", color: "#666" }}>
              Sign up or log in to get started
            </Text>
            <View style={{ flexDirection: "row", gap: 16 }}>
              <TouchableOpacity
                onPress={() => router.push("/signup")}
                style={{ 
                  backgroundColor: "blue", 
                  paddingHorizontal: 20, 
                  paddingVertical: 10, 
                  borderRadius: 5 
                }}
              >
                <Text style={{ color: "white" }}>Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/login")}
                style={{ 
                  backgroundColor: "green", 
                  paddingHorizontal: 20, 
                  paddingVertical: 10, 
                  borderRadius: 5 
                }}
              >
                <Text style={{ color: "white" }}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Stack.Screen>
  );
}
