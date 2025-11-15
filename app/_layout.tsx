// app/_layout.tsx
import { Amplify } from "aws-amplify";
import { Stack } from "expo-router";
// @ts-ignore
import awsExports from "../src/aws-exports";
import { AuthProvider } from "./AuthContext";

console.log("Amplify config loaded:", awsExports); // confirm this logs in your console
Amplify.configure(awsExports);

export default function RootLayout() {
  console.log("Using Cognito Pool ID:", awsExports.aws_user_pools_id);
  
  return (
    <AuthProvider>
      <Stack />
    </AuthProvider>
  );
}
