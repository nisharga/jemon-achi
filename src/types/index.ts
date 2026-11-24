// Shared types (login session, roles).
export * from './user';

// The admin dashboard and the storefront describe some of the same things
// differently (e.g. TProduct), so each side has its own group:
//   import type { TOrder } from '@/types/admin';
//   import type { PublicTypes } from '@/types';  →  PublicTypes.TProduct
export * as AdminTypes from './admin';
export * as PublicTypes from './public';
