// Storefront building blocks (src/app/(public)).
//
// Import from '@/components' in pages, layouts and other SERVER components:
//   import { StorefrontFrame, ProductTile } from '@/components';
// In a 'use client' file, import the file directly instead
// (e.g. '@/components/public/common/ProductTile'): this list includes
// StorefrontFrame, which fetches data on the server and cannot go to the browser.

// Page frame
export { default as StorefrontFrame } from './shared/StorefrontFrame';
export { Navbar } from './shared/navbar';
export { Footer } from './shared/footer';
export { default as ThirdPartyScripts } from './shared/ThirdPartyScripts';
export { default as MetaPixelPageViewTracker } from './shared/MetaPixelPageViewTracker';

// Layout helpers
export { Container } from './common/container';
export { default as PageSkeleton } from './common/PageSkeleton';
export { default as SectionTitle } from './global/SectionTitle';
export { default as SectionLink } from './global/SectionLink';

// Products
export { default as ProductTile } from './common/ProductTile';
export { default as ProductRail } from './common/ProductRail';
export { default as PriceContainer } from './common/PriceContainer';
