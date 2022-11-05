const CopyPlugin = require('copy-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const path = require('path');
const { version } = require('./package.json');

const config = {
  mode: process.env.NODE_ENV,
  context: path.join(__dirname, 'src'),

  entry: {
    "background/main": './background/main.js',
    "browser_action/index": './browser_action/index.js',
    "browser_action/editFilter": './browser_action/editFilter.js',
    "browser_action/debug/index": './browser_action/debug/index.js',
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: [
            'vue-style-loader',
            {
                loader: 'css-loader',
                options: {
                  esModule: false
                }
            }
        ]
      }
    ]
  },

  plugins: [
    new VueLoaderPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'static', to: './' },
        { from: 'res', to: './res/' },
        {
          from: 'manifest.json',
          to: 'manifest.json',
          transform: (content) => {
            const jsonContent = JSON.parse(content);
            jsonContent.version = version;

            if (config.mode === 'development') {
              //jsonContent['content_security_policy'] = { "extension_pages": "script-src 'self' 'unsafe-eval'; object-src 'self'" };
            }

            return JSON.stringify(jsonContent, null, 2);
          },
        },
      ]
    })
  ],

  resolve: {
    extensions: [".vue", ".js"]
  },

  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js"
  }
};

if (config.mode === 'development') {
  config.devtool = 'inline-source-map';
}

if (process.env.HMR === 'true') {
  config.plugins = (config.plugins || []).concat([
    new ExtensionReloader({
      manifest: path.join(__dirname, 'dist/manifest.json'),
    }),
  ]);
}

module.exports = config;
