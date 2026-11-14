import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // Static shell first, dynamic parts stream in (PPR / "use cache").
    cacheComponents: true,
    partialPrefetching: true,
    // Automatic memoisation; no hand-written useMemo/useCallback needed.
    reactCompiler: true,
    images: {
        // next/image serves AVIF where supported, WebP otherwise.
        formats: ['image/avif', 'image/webp']
    },
    experimental: {
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
