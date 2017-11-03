const path = require("path");
const webpack = require('webpack');

let PLUGINS = [];
if (process.env.NODE_ENV === 'production') {
  PLUGINS.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = {
  entry: './index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'aframe-xr.js'
  },
  module: {
    rules: [
      { test: /\.js/, exclude: /node_modules/, use: ["babel-loader"] },
    ]
  },
  plugins: PLUGINS,
  devServer: {
    disableHostCheck: true
  }
};
