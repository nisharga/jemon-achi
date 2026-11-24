// ===== Helpers =====
export const computeAvailableFromStockPayload = (payload?: any): number => {
    const data = payload?.data;
    if (!data) return 0;
    if (typeof data.totalAvailableQuantity === 'number')
        return Math.max(0, data.totalAvailableQuantity);
    if (Array.isArray(data.stocks) && data.stocks.length) {
        const hasAvailable = data.stocks?.some(
            (s: any) => typeof s?.available_quantity === 'number'
        );
        if (hasAvailable)
            return data.stocks?.reduce(
                (sum: any, s: any) =>
                    sum + Math.max(0, s?.available_quantity ?? 0),
                0
            );
    }
    if (
        typeof data.totalQuantity === 'number' ||
        typeof data.totalReserved === 'number'
    ) {
        const totalQ = data.totalQuantity ?? 0;
        const reserved = data.totalReserved ?? 0;
        return Math.max(0, totalQ - reserved);
    }
    return 0;
};
