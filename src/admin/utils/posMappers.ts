import { PosScanResponse, VariantItem } from '@/admin/types/pos';

export function mapScanToVariantItem(resp: PosScanResponse): VariantItem {
    if (!resp?.success || !resp?.data?.product) {
        throw new Error(resp?.message || 'Invalid scan response');
    }

    //== Gracefully handle variant ==
    const rawVariant = resp.data.variant;

    if (!rawVariant) {
        throw new Error('Variant missing in scan response.');
    }

    const product = resp.data.product;

    const item: VariantItem = {
        productId: product?._id,
        productName: product?.name,
        thumbnail: product?.thumbnail,
        variant: {
            _id: rawVariant?._id,
            attribute_values: rawVariant?.attribute_values,
            available_quantity: rawVariant?.available_quantity,
            barcode: rawVariant?.barcode,
            regular_price: rawVariant?.regular_price,
            sale_price: rawVariant?.sale_price,
            sku: rawVariant?.sku,
            total_sold: rawVariant?.total_sold
        }
    };

    return item;
}
