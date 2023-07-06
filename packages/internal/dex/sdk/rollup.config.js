import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

export default {
  input: './src/index.ts',
  output: {
    format: 'es',
    dir: 'dist',
  },
  plugins: [
    json(),
    typescript({
      exclude: ['**/ABIs/*', '**/*.test.*', '**/utils/testUtils.ts'],
    }),
  ],
};
