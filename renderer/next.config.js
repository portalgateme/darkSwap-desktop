const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: '../dist/renderer/out',
  images: { unoptimized: true },
  webpack: (config) => {
    // Allow importing TypeScript files from darkSwap-client-core/src
    config.module.rules.forEach((rule) => {
      if (rule.oneOf) {
        rule.oneOf.forEach((oneOfRule) => {
          if (
            oneOfRule.test &&
            oneOfRule.test.toString().includes('tsx|ts')
          ) {
            if (oneOfRule.include) {
              oneOfRule.include = [
                ...(Array.isArray(oneOfRule.include)
                  ? oneOfRule.include
                  : [oneOfRule.include]),
                path.resolve(__dirname, '../darkSwap-client-core/src')
              ]
            }
          }
        })
      }
    })
    return config
  }
}

module.exports = nextConfig
