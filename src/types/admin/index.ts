// Types used by the admin dashboard (src/app/(admin)).
export * from './banner';
export * from './business-location';
export * from './category';
export * from './coupon';
export * from './coupons';
export * from './hero-section';
export * from './homepage';
export * from './inventory';
export * from './order';
export * from './permistion';
export * from './pos';
export * from './pos-sale';
export * from './product';
export * from './purchase';
export * from './return-policy';
export * from './sub-category';
export * from './supplier';
export * from './transaction';
export * from './user';
export * from './website-settings';

// order.ts and pos-sale.ts both define these; the barrel uses the order.ts ones.
// For the POS versions import from '@/types/admin/pos-sale'.
export { DiscountType, PaymentType } from './order';
export type { IVariantCombination } from './order';
