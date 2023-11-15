/** @type {import('next').NextConfig} */

const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.jsx",
});

const nextConfig = {
  transpilePackages: [
    "@douyinfe/semi-ui",
    // "@douyinfe/semi-icons",
    // "@douyinfe/semi-illustration",
  ],
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.example\.(ts|tsx)$/i,
      loader: "raw-loader",
    });

    // Important: return the modified config
    return config;
  },
  i18n: {
    locales: ['en-US', 'zh-CN'],
    defaultLocale: 'en-US'
  }
};

module.exports = withNextra(nextConfig);
