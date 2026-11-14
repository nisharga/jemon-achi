import { SITE_DOMAIN } from '@/configs/env';
import { routes } from '@/routes';
import type { MetadataRoute } from 'next';

const robots = (): MetadataRoute.Robots => ({
    rules: {
        userAgent: '*',
        allow: '/',
        // Private areas and login pages have nothing to index.
        disallow: [
            routes.admin.base,
            routes.adminLogin,
            routes.profile,
            routes.login
        ]
    },
    sitemap: `${SITE_DOMAIN}/sitemap.xml`
});

export default robots;
