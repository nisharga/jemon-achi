import { SITE_DOMAIN } from '@/configs/env';
import { routes } from '@/routes';
import type { MetadataRoute } from 'next';

const robots = (): MetadataRoute.Robots => ({
    rules: {
        userAgent: '*',
        allow: '/',
        // Private areas have nothing to index. The shop /login page stays
        // crawlable: it is public, and blocking it fails Lighthouse SEO.
        disallow: [routes.admin.base, routes.adminLogin, routes.profile]
    },
    sitemap: `${SITE_DOMAIN}/sitemap.xml`
});

export default robots;
