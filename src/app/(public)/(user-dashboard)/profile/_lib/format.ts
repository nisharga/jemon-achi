// Small helpers that turn API values into text for the dashboard.

/** 1250 → "৳1,250" */
export const formatPrice = (amount: number | undefined | null) =>
    `৳${(amount ?? 0).toLocaleString('en-US')}`;

/** "2026-11-23T17:43:07.871Z" → "23 Nov 2026" */
export const formatDate = (isoDate: string | undefined | null) => {
    if (!isoDate) return '—';
    return new Date(isoDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

/** "HANDED_OVER_TO_COURIER" → "Handed over to courier" */
export const formatStatus = (status: string) => {
    const words = status.toLowerCase().replaceAll('_', ' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
};

/** "Rahim Uddin" → "RU", used in the round avatar. */
export const getInitials = (name: string) =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('');

/** The backend names new accounts "Customer" until they set a real name. */
export const hasRealName = (name: string | undefined) =>
    Boolean(name) && name !== 'Customer';
