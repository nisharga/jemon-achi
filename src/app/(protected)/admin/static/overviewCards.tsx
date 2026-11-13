import { Package, ShoppingCart, TrendingUp, Users } from 'lucide-react';

// Placeholder metrics until the report API is wired up.
export const OVERVIEW_CARDS = [
    {
        id: 'orders',
        label: 'Orders',
        value: '—',
        hint: 'Today',
        icon: <ShoppingCart className='size-6' />,
        colorClass:
            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    },
    {
        id: 'sales',
        label: 'Sales',
        value: '—',
        hint: 'Today',
        icon: <TrendingUp className='size-6' />,
        colorClass:
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
    },
    {
        id: 'products',
        label: 'Products',
        value: '—',
        hint: 'Published',
        icon: <Package className='size-6' />,
        colorClass:
            'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    },
    {
        id: 'customers',
        label: 'Customers',
        value: '—',
        hint: 'Total',
        icon: <Users className='size-6' />,
        colorClass:
            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
    }
];
