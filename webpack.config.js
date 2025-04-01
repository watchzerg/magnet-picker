const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    'content/content': './src/content/content.ts',
    'background/background': './src/background/background.ts',
    'popup/popup': './src/popup/popup.ts',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
}; 