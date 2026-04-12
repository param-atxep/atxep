/** @type {import('next').NextConfig} */
const nextConfig = {
    swcMinify: true,
    productionBrowserSourceMaps: false,
    compress: true,
    onDemandEntries: {
        maxInactiveAge: 60 * 60 * 1000,
        pagesBufferLength: 5,
    },
    webpack: (config, { isServer }) => {
        config.optimization.minimize = true;
        return config;
    },
    images: {
        domains: ['lh3.googleusercontent.com'],
        formats: ['image/avif', 'image/webp'],
    },
    headers: async () => {
        return [
            // Static assets: cache for 1 year (immutable)
            {
                source: '/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable'
                    }
                ]
            },
            // Public assets: cache for 1 week
            {
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=604800, immutable'
                    }
                ]
            },
            // API routes: no cache, always fetch fresh
            {
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'private, no-cache, no-store, must-revalidate'
                    }
                ]
            },
            // Default for HTML pages: no-cache, always validate with server
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'private, no-cache, must-revalidate'
                    }
                ]
            }
        ]
    }
}

module.exports = nextConfig
