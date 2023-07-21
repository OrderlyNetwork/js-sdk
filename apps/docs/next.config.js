// module.exports = {
//   reactStrictMode: true,
//   transpilePackages: ["ui"],
// };

const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

module.exports = withNextra({
  reactStrictMode: true,
  transpilePackages: ["ui"]
})