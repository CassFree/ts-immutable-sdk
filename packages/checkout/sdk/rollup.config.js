import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import nodePolyfills from 'rollup-plugin-polyfill-node';

const defaultPlugin = [
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    'process.env.CHECKOUT_DEV_MODE': JSON.stringify(process.env.CHECKOUT_DEV_MODE || 'false'),
    'process.env.CHECKOUT_LOCAL_MODE': JSON.stringify(process.env.CHECKOUT_LOCAL_MODE || 'false'),
    'process.versions': JSON.stringify(process.versions || {})
  }),
  typescript()
]

export default [{
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'es'
  },
  watch: true, // watch for changes on the es module for sample app dev
  plugins: [ ...defaultPlugin ]
},
{
  input: 'src/index.ts',
  output: {
    file: 'dist/browser.js',
    format: 'umd',
    name: 'ImmutableCheckout'
  },
  context: 'window',
  watch: false, // don't watch for changes on minified browser bundle
  plugins: [
    json(),
    nodeResolve({ browser: true }),
    commonjs(),
    nodePolyfills(),
    terser(),
    ...defaultPlugin,
  ],
}
]