module.exports = function (api) {
  api.cache(true);

  const plugins = [];

  // Add reanimated plugin for all platforms (Reanimated 4 has better web support)
  plugins.push("react-native-reanimated/plugin");

  return {
    presets: ["babel-preset-expo"],
    plugins,
  };
};
