import resolve from '@rollup/plugin-node-resolve'
import babel from 'rollup-plugin-babel'

export default [
  {
  input: 'src/main.js',
  output: {
    file: 'build/bundle.min.js',
    format: 'iife'
  },
  plugins: [ resolve(),
    babel({
      exclude: 'node_modules/**'
    })
  ]
  },
  {
    input: 'src/engine.js',
    output: {
      file: 'build/engine.bundle.js',
      format: 'cjs'
    },
    plugins: [ resolve(),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  }
]