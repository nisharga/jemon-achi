// Types used by the storefront (src/app/(public)).
export * from './category';
export * from './customer';
export * from './product';
export * from './product-detail';
export * from './stock';
export * from './storefront';
export * from './subcategory';

// stock.ts has its own smaller IProduct; the barrel uses the product.ts one.
export type { IProduct } from './product';
