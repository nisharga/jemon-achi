import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Static shell first, dynamic parts stream in (PPR / "use cache").
    cacheComponents: true,
    partialPrefetching: true,
    // Automatic memoisation; no hand-written useMemo/useCallback needed.
    reactCompiler: true,
    // The dashboard home is the overview page. Done here (not in a page that
    // calls redirect()) so prerendering never renders a redirect-only segment.
    async redirects() {
        return [
            {
                source: '/admin',
                destination: '/admin/overview',
                permanent: false
            },
            // Phone login also creates new accounts, so there is no separate sign-up.
            { source: '/register', destination: '/login', permanent: false },
            { source: '/verify-otp', destination: '/login', permanent: false }
        ];
    },
    images: {
        // next/image serves AVIF where supported, WebP otherwise.
        formats: ['image/avif', 'image/webp'],
        // Lets next/image load from a local backend (localhost:5007). Next 16
        // blocks local addresses by default (SSRF protection), so this is only
        // on while the API itself is local; production images come from CloudFront.
        dangerouslyAllowLocalIP: /localhost|127\.0\.0\.1/.test(
            process.env.NEXT_PUBLIC_API_BASE_URL ?? ''
        ),
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
        // One 404 page for the whole app (we have two root layouts: (site) and (public)).
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
