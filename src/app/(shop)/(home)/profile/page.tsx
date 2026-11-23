'use client';

import Link from 'next/link';
import { CalendarDays, Package, Phone, UserRoundPen } from 'lucide-react';
import { Skeleton } from '@/shop/components/ui/skeleton';
import { useUser } from '@/shop/hooks/use-user';
import { useGetMyOrdersQuery } from '@/shop/redux/api/customer-api';
import { formatDate, hasRealName } from './_lib/format';
import Panel from './_components/Panel';
import OrderRow from './_components/OrderRow';
import NoOrders from './_components/NoOrders';
import OrderListSkeleton from './_components/OrderListSkeleton';

const RECENT_ORDER_COUNT = 5;

/** Dashboard home: a greeting, a few numbers and the latest orders. */
export default function DashboardOverviewPage() {
    const { user, isLoading: isUserLoading } = useUser();
    const { data: orders, isLoading: isOrdersLoading } = useGetMyOrdersQuery({
        page: 1,
        limit: RECENT_ORDER_COUNT
    });

    const firstName = hasRealName(user?.full_name)
        ? user!.full_name.split(' ')[0]
        : 'there';
    const profileIsIncomplete =
        !isUserLoading && (!hasRealName(user?.full_name) || !user?.email);

    return (
        <div className='space-y-6'>
            <div>
                <h1 className='text-2xl font-semibold text-gray-900'>
                    Hi, {isUserLoading ? '…' : firstName} 👋
                </h1>
                <p className='text-sm text-gray-500'>
                    Here is what is happening with your account.
                </p>
            </div>

            {profileIsIncomplete && (
                <Link
                    href='/profile/settings'
                    className='flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm transition-colors hover:bg-primary/10'
                >
                    <UserRoundPen className='size-5 shrink-0 text-primary' />
                    <span className='text-gray-700'>
                        Add your name and email so we can reach you about your
                        orders.{' '}
                        <span className='font-medium text-primary'>
                            Complete profile →
                        </span>
                    </span>
                </Link>
            )}

            <div className='grid gap-4 sm:grid-cols-3'>
                <StatCard
                    icon={Package}
                    label='Total orders'
                    value={orders?.meta.total}
                    isLoading={isOrdersLoading}
                />
                <StatCard
                    icon={Phone}
                    label='Mobile number'
                    value={user?.phone_number}
                    isLoading={isUserLoading}
                />
                <StatCard
                    icon={CalendarDays}
                    label='Member since'
                    value={formatDate(user?.createdAt)}
                    isLoading={isUserLoading}
                />
            </div>

            <Panel
                title='Recent orders'
                action={
                    <Link
                        href='/profile/orders'
                        className='text-sm font-medium text-primary hover:underline'
                    >
                        View all
                    </Link>
                }
            >
                {isOrdersLoading ? (
                    <OrderListSkeleton rows={3} />
                ) : orders?.data.length ? (
                    <div className='divide-y divide-gray-100'>
                        {orders.data.map((order) => (
                            <OrderRow key={order._id} order={order} />
                        ))}
                    </div>
                ) : (
                    <NoOrders />
                )}
            </Panel>
        </div>
    );
}

type StatCardProps = {
    icon: typeof Package;
    label: string;
    value: string | number | undefined;
    isLoading: boolean;
};

function StatCard({ icon: Icon, label, value, isLoading }: StatCardProps) {
    return (
        <div className='flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm'>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
                <Icon className='size-5 text-primary' />
            </div>
            <div className='min-w-0'>
                <p className='text-xs text-gray-500'>{label}</p>
                {isLoading ? (
                    <Skeleton className='mt-1 h-5 w-20' />
                ) : (
                    <p className='truncate font-semibold text-gray-900'>
                        {value ?? '—'}
                    </p>
                )}
            </div>
        </div>
    );
}
