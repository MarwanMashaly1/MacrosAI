// Order matters - import these first
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

// Then import expo crypto
import { polyfillWebCrypto } from "expo-standard-web-crypto";

// Apply the polyfill
polyfillWebCrypto();

// Ensure global fetch is available for @google/generative-ai
// React Native has fetch built-in, but the SDK needs it on global
if (typeof global.fetch === "undefined") {
  global.fetch = fetch;
}

console.log("✅ Polyfills loaded successfully");
