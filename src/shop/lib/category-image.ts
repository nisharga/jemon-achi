import type { CategoryMedia } from '@/shop/types/storefront';

/**
 * Picks the best picture of a category for a card: tall (VERTICAL) first,
 * then wide or square, then whatever exists.
 */
export const getCategoryImage = (media: CategoryMedia[] = []) =>
    media.find((item) => item.size === 'VERTICAL')?.image ??
    media.find((item) => item.size === 'HORIZONTAL' || item.size === 'SQUARE')
        ?.image ??
    media[0]?.image;
