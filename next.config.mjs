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
            },
            {
                protocol: "https",
                hostname: "*.vercel.app"
            }
        ],
        // Optimize for Vercel
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    experimental: {
        serverComponentsExternalPackages: ['puppeteer'],
        // Optimize for Vercel serverless functions
        outputFileTracingIncludes: {
            '/api/**/*': ['./node_modules/**/*.wasm', './node_modules/**/*.node'],
        },
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals.push({
                'puppeteer': 'commonjs puppeteer'
            });
        }
        
        // Optimize bundle size for Vercel
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
        };
        
        return config;
    },
    // Vercel optimizations
    poweredByHeader: false,
    generateEtags: false,
    compress: true,
    
    // Ensure environment variables are available
    env: {
        NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
        NEXT_PUBLIC_APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    },
    
    // Better error handling for production
    onDemandEntries: {
        maxInactiveAge: 25 * 1000,
        pagesBufferLength: 2,
    },
};

export default nextConfig;
