/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "randomuser.me"
            },
            {
                protocol: "https",
                hostname: "iili.io"
            }
        ]
    },
    experimental: {
        serverComponentsExternalPackages: ['puppeteer']
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals.push({
                'puppeteer': 'commonjs puppeteer'
            });
        }
        return config;
    }
};

export default nextConfig;
