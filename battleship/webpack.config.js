import { resolve } from 'node:path';

const __dirname = import.meta.dirname;

const config = {
  mode: "production",
  target: "node",
  entry: resolve(__dirname, "index.ts"),
  output: {
    clean: true,
    filename: "index.cjs",
    path: resolve(__dirname, "dist"),
  },
  plugins: [],
  resolve: {
    extensions: [".js", ".ts"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
};

export default config;
