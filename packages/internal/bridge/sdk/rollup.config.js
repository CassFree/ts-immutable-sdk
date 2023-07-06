import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
  input: './src/index.ts',
  output: {
    format: 'es',
    dir: 'dist',
  },
  plugins: [
    typescript({
      exclude: [],
    }),
    commonjs(),
    json(),
  ],
};
