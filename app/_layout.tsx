// app/_layout.tsx
import { Amplify } from "aws-amplify";
import { Stack } from "expo-router";
import config from "../src/amplifyconfiguration.json"; // make sure path is correct
import { AuthProvider } from "./AuthContext";

console.log("Amplify config loaded:", config); // confirm this logs in your console
Amplify.configure(config);

export default function RootLayout() {
  console.log("Using Cognito Pool ID:", config.aws_user_pools_id);
  
  return (
    <AuthProvider>
      <Stack />
    </AuthProvider>
  );
}
