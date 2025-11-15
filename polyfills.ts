// Order matters - import these first
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

// Then import expo crypto
import { polyfillWebCrypto } from "expo-standard-web-crypto";

// Apply the polyfill
polyfillWebCrypto();

console.log("✅ Polyfills loaded successfully");
