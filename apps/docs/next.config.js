/** @type {import('next').NextConfig} */

const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.jsx",
});

const nextConfig = {
  distDir: "dist",
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
    locales: ["en-US", "zh-CN"],
    defaultLocale: "en-US",
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
};

module.exports = withNextra(nextConfig);
