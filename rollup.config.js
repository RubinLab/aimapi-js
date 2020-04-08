import json from '@rollup/plugin-json';
import babel from 'rollup-plugin-babel';
import {terser} from 'rollup-plugin-terser';

export default {
  input: 'src/aimHelper.js',
  output: [{
    file: 'build/aimapi.js',
    format: 'umd',
    name: 'aimapi',
    sourcemap: true
  },
  {
    file: 'build/aimapi.min.js',
    format: 'umd',
    name: 'aimapi',
    plugins: [terser()],
    sourcemap: true
  }],
  plugins: [ json() , babel({
    plugins: ['@babel/plugin-proposal-class-properties'],
    exclude: 'node_modules/**'
  })]
};