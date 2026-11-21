import { IRoles } from '@/types/admin-user';

export const getRoleBadgeVariant = (
    role: IRoles
): 'red' | 'purple' | 'blue' | 'gray' | 'green' | 'default' => {
    switch (role) {
        // === Platform roles ===
        case 'FOUNDER':
            return 'red';
        case 'SUPER_ADMIN':
            return 'red';
        case 'ADMIN':
            return 'purple';
        case 'MODERATOR':
            return 'gray';

        // === Sales & Support roles ===
        case 'SALES_EXECUTIVE':
            return 'blue';
        case 'SUPPORT_ADMIN':
            return 'green';
        case 'CUSTOMER_SUPPORT':
            return 'blue';
        case 'CUSTOMER_EXECUTIVE':
            return 'blue';

        // === Management roles ===
        case 'OUTLET_MANAGER':
            return 'purple';
        case 'WAREHOUSE_MANAGER':
            return 'green';
        case 'INVENTORY_MANAGER':
            return 'green';
        case 'ACCOUNT_MANAGER':
            return 'gray';

        // === Default fallback ===
        default:
            return 'default';
    }
};
