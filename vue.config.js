const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({


  publicPath: process.env.NODE_ENV === 'production'    
  ? '/'    
  : '/',

  devServer: {
    headers: { 
      "Access-Control-Allow-Origin": "*",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cache-Control": "no-cache, no-store, must-revalidate" 
    }
  },

  chainWebpack: webpackConfig => {
    webpackConfig.module
    .rule('wasm')
       .test(/.wasm$/)
       .use('wasm-loader')
       .loader('wasm-loader')
    webpackConfig.module
    .rule('worker')
       .test(/\.worker\.js$/)
       .use('worker-loader')
       .loader('worker-loader')
       
  },
  transpileDependencies: true
})
