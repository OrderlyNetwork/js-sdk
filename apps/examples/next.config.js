const { resolve } = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
    // experimental: {
    //     esmExternals: 'loose',
    // },
    // webpack: (config, { isServer }) => {
    //     console.log('@web3-onboard/react', require.resolve('@web3-onboard/react'))
    //     config.resolve.alias = {
    //         ...config.resolve.alias,
    //         '@web3-onboard/react':require.resolve('@web3-onboard/react'),
    //     }

    //     return config;
    // }
}

module.exports = nextConfig
