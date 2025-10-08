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
    }
};

export default nextConfig;
