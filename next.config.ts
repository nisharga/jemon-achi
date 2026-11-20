import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Static shell first, dynamic parts stream in (PPR / "use cache").
    cacheComponents: true,
    partialPrefetching: true,
    // Automatic memoisation; no hand-written useMemo/useCallback needed.
    reactCompiler: true,
    images: {
        // next/image serves AVIF where supported, WebP otherwise.
        formats: ['image/avif', 'image/webp'],
        // Dev only: lets next/image load from the local backend (localhost:5007).
        // Next 16 blocks local addresses by default (SSRF protection); production
        // images come from CloudFront, so this stays off there.
        dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
        // Storefront product images.
        remotePatterns: [
            // Local backend uploads (dev).
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5007',
                pathname: '/uploads/**'
            },
            { hostname: 'd11ml80zmgyrxk.cloudfront.net' },
            { hostname: 'd38ry6e5iuvq8e.cloudfront.net' },
            { hostname: 'images.unsplash.com' },
            { hostname: 'ggbook.s3.us-east-1.amazonaws.com' },
            { hostname: 'res.cloudinary.com' },
            { hostname: 'images.pexels.com' },
            { hostname: 'i.ibb.co' },
            { hostname: 'placehold.co' },
            { hostname: 'i.ibb.co.com' },
            { hostname: 'images.dailyobjects.com' },
            { hostname: 'cdn.shopify.com' }
        ]
    },
    experimental: {
        // One 404 page for the whole app (we have two root layouts: (site) and (shop)).
        globalNotFound: true,
        // Import only what is used from these barrel-heavy packages
        // (lucide-react is optimised by Next by default).
        optimizePackageImports: ['radix-ui', 'motion', 'react-slick']
    },
    turbopack: {
        rules: {
            '*.css': {
                loaders: ['@tailwindcss/turbopack'],
                as: '*.css'
            }
        }
    }
};

export default nextConfig;
