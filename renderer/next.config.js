const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: '../dist/renderer/out',
  images: { unoptimized: true },
  webpack: (config) => {
    // Allow importing TypeScript files from electron/core
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
                path.resolve(__dirname, '../electron/core')
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
