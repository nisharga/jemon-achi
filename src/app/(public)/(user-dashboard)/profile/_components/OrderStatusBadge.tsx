import { cn } from '@/shop/lib/utils';
import { formatStatus } from '../_lib/format';

// Green = done, red = stopped, blue = on its way, amber = everything else (waiting).
const DONE = ['DELIVERED'];
const STOPPED = ['CANCELLED', 'FAILED', 'RETURNED', 'NO_RESPONSE'];
const MOVING = ['HANDED_OVER_TO_COURIER', 'IN_TRANSIT'];

const getColor = (status: string) => {
    if (DONE.includes(status)) return 'bg-green-50 text-green-700';
    if (STOPPED.includes(status)) return 'bg-red-50 text-red-700';
    if (MOVING.includes(status)) return 'bg-blue-50 text-blue-700';
    return 'bg-amber-50 text-amber-700';
};

export default function OrderStatusBadge({ status }: { status: string }) {
    return (
        <span
            className={cn(
                'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
                getColor(status)
            )}
        >
            {formatStatus(status)}
        </span>
    );
}
