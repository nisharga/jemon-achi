import { Badge } from '@/components/ui/admin-badge';
import { OrderStatus } from '@/types/admin/order';
import React from 'react';

export const OrderStatusBadge = ({ status }: { status: string }) => {
    const statusVariantMap: Record<OrderStatus, string> = {
        [OrderStatus.INCOMPLETE]: 'yellow-outline',
        [OrderStatus.PLACED]: 'orange-outline',
        [OrderStatus.IN_REVIEW]: 'teal-outline',
        [OrderStatus.HANDED_OVER_TO_COURIER]: 'violet-outline',
        [OrderStatus.IN_TRANSIT]: 'sky-outline',
        [OrderStatus.DELIVERED]: 'emerald-outline',
        [OrderStatus.RETURN_REQUESTED]: 'amber-outline',
        [OrderStatus.RETURNED]: 'purple-outline',
        [OrderStatus.CANCELLED]: 'red-outline',
        [OrderStatus.FAILED]: 'rose-outline',
        [OrderStatus.NO_RESPONSE]: 'slate-outline',
        [OrderStatus.PARTIAL]: 'cyan-outline',
        [OrderStatus.PENDING_RETURN]: 'indigo-outline',
        [OrderStatus.PRE_ORDER]: 'blue-outline',
        [OrderStatus.PROCESSING]: '',
        [OrderStatus.AWAITING_STOCK]: 'amber-outline',
        [OrderStatus.ACCEPTED]: 'green-outline'
    };

    const variant = statusVariantMap[status as OrderStatus];

    const finalVariant = variant || 'slate-outline';

    return (
        <Badge
            variant={finalVariant as any}
            className='capitalize print:hidden'
        >
            {status?.split('_').join(' ')}
        </Badge>
    );
};
