import { resolve } from 'node:path';

const config = {
  mode: 'production',
  target: 'node',
  entry: resolve(__dirname, 'src', 'index.ts'),
  output: {
    clean: true,
    filename: 'index.js',
    path: resolve(__dirname, 'dist'),
  },
  plugins: [],
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
    ],
  },
};

export default config;