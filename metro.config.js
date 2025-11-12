const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add web platform support
config.resolver.platforms = ["ios", "android", "native", "web"];

// Configure reanimated for web
config.resolver.alias = {
  ...config.resolver.alias,
  "react-native-reanimated/lib/module/reanimated2/core":
    "react-native-reanimated/lib/module/reanimated2/core/index.web.js",
};

module.exports = config;
