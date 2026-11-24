import { useMemo } from 'react';
import { useGetAllStaffsQuery } from '@/redux/admin/api/staff-api';
import { useGetAllRolesQuery } from '@/redux/admin/api/roles-api';
import { useGetAllCustomersQuery } from '@/redux/admin/api/customer-api';

export const useStaffByRoles = (limit = 1000) => {
    // 1. Fetch Dynamic Roles from Database
    const {
        data: roleData,
        isLoading: isLoadingRole,
        isFetching: isFetchingRole
    } = useGetAllRolesQuery({});

    // 2. Extract role names and merge with your existing hardcoded list
    const combinedRoles = useMemo(() => {
        const dynamicRoleNames =
            roleData?.data?.roles?.map((r: any) => r.role_name) || [];

        const staticRoles = [
            'FOUNDER',
            'SUPER_ADMIN',
            'ADMIN',
            'MODERATOR',
            'SALES_EXECUTIVE',
            'SUPPORT_ADMIN',
            'CUSTOMER_SUPPORT',
            'CUSTOMER_EXECUTIVE',
            'OUTLET_MANAGER',
            'WAREHOUSE_MANAGER',
            'INVENTORY_MANAGER',
            'ACCOUNT_MANAGER',
            'Editor'
        ];

        // Remove duplicates using Set
        return Array.from(new Set([...staticRoles, ...dynamicRoleNames]));
    }, [roleData]);

    // 1. Fetch Dynamic Roles from Database
    const {
        data: allRole,
        isLoading: isLoadingAllRole,
        isFetching: isFetchingAllRole
    } = useGetAllCustomersQuery({
        page: 1,
        limit,
        role: combinedRoles,
        searchQuery: ''
    });

    // 3. Fetch Staff using the combined array
    const {
        data: staffData,
        isLoading: isLoadingStaff,
        isFetching: isFetchingStaff
    } = useGetAllStaffsQuery(
        {
            page: 1,
            limit: limit,
            role: combinedRoles
        },
        {
            // Skip fetching staff until we at least have the role data response
            skip: !roleData
        }
    );

    return {
        staffs: staffData?.data?.data || [],
        roles: roleData?.data?.roles || [],
        allRoles: allRole?.data?.data || [],
        // Combine loading states for easy UI management
        isLoading: isLoadingRole || isLoadingStaff || isLoadingAllRole,
        isFetching: isFetchingRole || isFetchingStaff || isFetchingAllRole
    };
};
