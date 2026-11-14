import { SITE_DOMAIN } from '@/configs/env';
import { routes } from '@/routes';
import type { MetadataRoute } from 'next';

// Public, indexable pages only.
const PUBLIC_PAGES = [routes.base, routes.contactUs, routes.blogs];

const sitemap = (): MetadataRoute.Sitemap =>
    PUBLIC_PAGES.map((path) => ({
        url: new URL(path, SITE_DOMAIN).toString()
    }));

export default sitemap;
