const path = require('path');

module.exports = {
  mode: 'development', // You might want to change to 'production' when building for release

  entry: {
    index: './src/index.js', // Entry point for your JavaScript code
  },

  output: {
    path: path.join(__dirname, 'docs'), // Output directory
    filename: 'index.js', // Output the JavaScript to index.js
  },

  watchOptions: {
    ignored: ['/node_modules/'], // Prevent watching node_modules
  },

  devServer: {
    static: {
      directory: path.join(__dirname, 'docs'), // Serve content from docs folder
      watch: true, // Watch for changes in docs
    },
    open: true, // Automatically open the browser when the dev server starts
    hot: true, // Enable hot reloading (optional, depending on use case)
  },

  module: {
    rules: [
      {
        test: /\.scss$/, // Process SCSS files
        use: [
          'style-loader', // Inject styles into the DOM
          'css-loader', // Turn CSS into CommonJS
          'sass-loader', // Compile SCSS into CSS
        ],
      },
    ],
  },
};
