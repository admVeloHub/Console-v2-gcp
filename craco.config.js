const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Use NodePolyfillPlugin to automatically handle Node.js core module polyfills.
      // This is more reliable than managing individual fallbacks.
      webpackConfig.plugins.push(new NodePolyfillPlugin());

      // The ProvidePlugin makes Buffer and process available globally without explicit imports.
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );

      // Remove any manual fallbacks to let the plugin manage them.
      webpackConfig.resolve.fallback = {};

      // Ignore noisy warnings.
      webpackConfig.ignoreWarnings = [
        ...(webpackConfig.ignoreWarnings || []),
        /Failed to parse source map/,
        /Critical dependency: the request of a dependency is an expression/,
      ];

      // Add a specific alias for 'process' to ensure it resolves correctly.
      webpackConfig.resolve.alias = {
        ...(webpackConfig.resolve.alias || {}),
        process: require.resolve('process/browser'),
      };

      return webpackConfig;
    },
  },
};
