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
};

module.exports = withNextra(nextConfig);
