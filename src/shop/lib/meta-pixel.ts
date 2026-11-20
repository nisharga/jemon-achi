type PixelMode = 'track' | 'trackCustom';

type EcommerceItem = {
    item_id?: string | number;
    item_name?: string;
    quantity?: number;
    price?: number;
};

type EcommercePayload = {
    currency?: string;
    value?: number;
    transaction_id?: string;
    items?: EcommerceItem[];
};

declare global {
    interface Window {
        fbq?: (...args: unknown[]) => void;
    }
}

const hasFbq = (): boolean =>
    typeof window !== 'undefined' && typeof window.fbq === 'function';

const getItemIds = (items: EcommerceItem[] = []) =>
    items
        .map((item) => item.item_id)
        .filter(Boolean)
        .map((id) => String(id));

const getNumItems = (items: EcommerceItem[] = []) =>
    items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

const getValue = (ecommerce?: EcommercePayload) => {
    if (!ecommerce) return 0;
    const ecommerceValue = Number(ecommerce.value);
    if (!Number.isNaN(ecommerceValue) && ecommerceValue > 0)
        return ecommerceValue;

    return (ecommerce.items || []).reduce(
        (sum, item) =>
            sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0
    );
};

export const trackMetaPixel = (
    eventName: string,
    params?: Record<string, unknown>,
    mode: PixelMode = 'track'
) => {
    if (!hasFbq()) return;
    if (params) {
        window.fbq?.(mode, eventName, params);
        return;
    }
    window.fbq?.(mode, eventName);
};

export const trackMetaPageView = () => {
    trackMetaPixel('PageView');
};

export const trackMetaFromGtmEvent = (
    eventName: string,
    ecommerce?: EcommercePayload
) => {
    const items = ecommerce?.items || [];
    const contentIds = getItemIds(items);
    const value = getValue(ecommerce);
    const currency = ecommerce?.currency || 'BDT';

    if (eventName === 'view_item') {
        trackMetaPixel('ViewContent', {
            content_type: 'product',
            content_ids: contentIds,
            content_name: items?.[0]?.item_name || '',
            value,
            currency
        });
        return;
    }

    if (eventName === 'add_to_cart') {
        trackMetaPixel('AddToCart', {
            content_type: 'product',
            content_ids: contentIds,
            contents: items.map((item) => ({
                id: String(item.item_id || ''),
                quantity: Number(item.quantity) || 1,
                item_price: Number(item.price) || 0
            })),
            value,
            currency
        });
        return;
    }

    if (eventName === 'begin_checkout') {
        trackMetaPixel('InitiateCheckout', {
            content_type: 'product',
            content_ids: contentIds,
            num_items: getNumItems(items),
            value,
            currency
        });
        return;
    }

    if (eventName === 'purchase') {
        trackMetaPixel('Purchase', {
            content_type: 'product',
            content_ids: contentIds,
            contents: items.map((item) => ({
                id: String(item.item_id || ''),
                quantity: Number(item.quantity) || 1,
                item_price: Number(item.price) || 0
            })),
            num_items: getNumItems(items),
            value,
            currency,
            order_id: ecommerce?.transaction_id || ''
        });
        return;
    }

    trackMetaPixel(eventName, { ecommerce }, 'trackCustom');
};
