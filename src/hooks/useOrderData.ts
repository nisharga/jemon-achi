// hooks/useOrderData.ts
import { useMemo } from 'react';
import {
    useGetAllOrdersQuery,
    useGetAllTodaysActivityQuery,
    useGetAllOrderStatusCountQuery,
    useGetAllTodaysActivityCountQuery,
    useGetAllAssignedOrderStatusCountQuery // Add this import
} from '@/redux/api-queries/order-api';
import { useGetAllBusinessLocationsQuery } from '@/redux/api-queries/business-location-api';
import { IBusiness_location } from '@/types/business-location';
// hooks/useOrderSummary.ts
import { useGetAllOrderSummaryQuery } from '@/redux/api-queries/order-api';

interface UseOrderDataParams {
    page: number;
    limit: number | string;
    searchQuery: string | null;
    businessLocation: string;
    created_by: string;
    sku: string | null;
    orderStatus: string | null;
    from: Date | null;
    to: Date | null;
    assignedBusinessLocation: string;
    isAllOrdersRoute: boolean;
    isAssignedOrders?: boolean;
    is_called?: string;
}

export const useOrderSummary = (filters: {
    searchQuery?: string;
    business_location_id?: string;
    sku?: string;
    filter?: string;
    startDate?: string;
    endDate?: string;
    created_by?: string;
    is_assigned_to_business_location?: string;
}) => {
    return useGetAllOrderSummaryQuery(filters);
};

export const useOrderData = (params: UseOrderDataParams) => {
    const {
        page,
        limit,
        searchQuery,
        businessLocation,
        sku,
        created_by,
        orderStatus,
        from,
        to,
        assignedBusinessLocation,
        isAllOrdersRoute,
        isAssignedOrders = false,
        is_called
    } = params;

    // Format dates once using useMemo
    const formattedDates = useMemo(() => {
        const formatDate = (date: Date | null) =>
            date?.toLocaleDateString('en-CA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });

        return {
            startDate: formatDate(from),
            endDate: formatDate(to)
        };
    }, [from, to]);

    // Common query parameters for orders and todays activity
    const commonParams = useMemo(
        () => ({
            page: Number(page),
            limit: Number(limit),
            searchQuery: searchQuery || '',
            business_location_id: businessLocation,
            sku: sku || '',
            filter: orderStatus || '',
            startDate: formattedDates.startDate,
            endDate: formattedDates.endDate,
            created_by: created_by,
            ...(isAssignedOrders && { is_assigned_to_business_location: true }),
            ...(is_called && { is_called })
        }),
        [
            page,
            limit,
            searchQuery,
            businessLocation,
            sku,
            orderStatus,
            formattedDates,
            created_by,
            isAssignedOrders,
            is_called
        ]
    );

    // Common parameters for count queries
    const countParams = useMemo(
        () => ({
            business_location_id: businessLocation,
            is_assigned_to_business_location: assignedBusinessLocation,
            startDate: formattedDates.startDate,
            endDate: formattedDates.endDate,
            created_by: created_by,
            ...(isAssignedOrders && { is_assigned_to_business_location: true })
        }),
        [
            businessLocation,
            assignedBusinessLocation,
            formattedDates,
            created_by,
            isAssignedOrders
        ]
    );

    // All API calls
    const ordersQuery = useGetAllOrdersQuery(commonParams, {
        skip: !isAllOrdersRoute && !isAssignedOrders
    });

    const todaysActivityQuery = useGetAllTodaysActivityQuery(commonParams, {
        skip: isAllOrdersRoute || isAssignedOrders
    });

    const orderStatusCountQuery = useGetAllOrderStatusCountQuery(countParams, {
        skip: !isAllOrdersRoute && !isAssignedOrders
    });

    const todaysActivityCountQuery = useGetAllTodaysActivityCountQuery(
        countParams,
        {
            skip: isAllOrdersRoute || isAssignedOrders
        }
    );

    // NEW: Assigned orders status count query
    const assignedOrderStatusCountQuery =
        useGetAllAssignedOrderStatusCountQuery(countParams, {
            skip: !isAssignedOrders // Only run for assigned orders
        });

    const businessLocationsQuery = useGetAllBusinessLocationsQuery({});

    // Derived data
    const orders = ordersQuery.data?.data?.data;
    const todayActives = todaysActivityQuery.data?.data?.data;
    const ordersMeta = ordersQuery.data?.data?.meta;
    const todaysActivityMeta = todaysActivityQuery.data?.data?.meta;
    const statusCount = ordersQuery.data?.data?.meta?.status_total;

    const processingOrderStatusCounts = orderStatusCountQuery.data?.data;
    const processingTodaysActivityCounts = todaysActivityCountQuery.data?.data;

    // NEW: Assigned orders status counts
    const processingAssignedOrderStatusCounts =
        assignedOrderStatusCountQuery.data?.data;

    const businessLocationOptions = useMemo(
        () =>
            businessLocationsQuery.data?.data?.businessLocations?.map(
                (businessLocation: IBusiness_location) => ({
                    label: businessLocation?.name,
                    value: businessLocation?._id
                })
            ) || [],
        [businessLocationsQuery.data]
    );

    // Current data based on route
    const currentData = isAssignedOrders
        ? orders
        : isAllOrdersRoute
          ? orders
          : todayActives;
    const currentMeta = isAssignedOrders
        ? ordersMeta
        : isAllOrdersRoute
          ? ordersMeta
          : todaysActivityMeta;

    // Current status counts based on route - UPDATED to include assigned orders
    const currentStatusCounts = isAssignedOrders
        ? processingAssignedOrderStatusCounts // Use assigned orders status counts for assigned orders
        : isAllOrdersRoute
          ? processingOrderStatusCounts
          : processingTodaysActivityCounts;

    // Combined loading states - UPDATED to include assignedOrderStatusCountQuery
    const isLoading = useMemo(
        () =>
            ordersQuery.isLoading ||
            todaysActivityQuery.isLoading ||
            orderStatusCountQuery.isLoading ||
            todaysActivityCountQuery.isLoading ||
            assignedOrderStatusCountQuery.isLoading || // NEW
            businessLocationsQuery.isLoading,
        [
            ordersQuery.isLoading,
            todaysActivityQuery.isLoading,
            orderStatusCountQuery.isLoading,
            todaysActivityCountQuery.isLoading,
            assignedOrderStatusCountQuery.isLoading, // NEW
            businessLocationsQuery.isLoading
        ]
    );

    const isFetching = useMemo(
        () =>
            ordersQuery.isFetching ||
            todaysActivityQuery.isFetching ||
            orderStatusCountQuery.isFetching ||
            todaysActivityCountQuery.isFetching ||
            assignedOrderStatusCountQuery.isFetching, // NEW
        [
            ordersQuery.isFetching,
            todaysActivityQuery.isFetching,
            orderStatusCountQuery.isFetching,
            todaysActivityCountQuery.isFetching,
            assignedOrderStatusCountQuery.isFetching // NEW
        ]
    );

    return {
        // Data
        orders,
        todayActives,
        currentData,
        currentMeta,
        statusCount,
        processingOrderStatusCounts,
        processingTodaysActivityCounts,
        processingAssignedOrderStatusCounts, // NEW
        currentStatusCounts,
        totalCount: currentMeta?.total || 0,
        businessLocationOptions,

        // Loading states
        isLoading,
        isFetching,

        // Individual query states (if needed)
        queries: {
            orders: ordersQuery,
            todaysActivity: todaysActivityQuery,
            orderStatusCount: orderStatusCountQuery,
            todaysActivityCount: todaysActivityCountQuery,
            assignedOrderStatusCount: assignedOrderStatusCountQuery, // NEW
            businessLocations: businessLocationsQuery
        },

        // Individual loading states
        loadingStates: {
            orders: ordersQuery.isLoading,
            todaysActivity: todaysActivityQuery.isLoading,
            orderStatusCount: orderStatusCountQuery.isLoading,
            todaysActivityCount: todaysActivityCountQuery.isLoading,
            assignedOrderStatusCount: assignedOrderStatusCountQuery.isLoading, // NEW
            businessLocations: businessLocationsQuery.isLoading
        },

        // Errors
        errors: {
            orders: ordersQuery.error,
            todaysActivity: todaysActivityQuery.error,
            orderStatusCount: orderStatusCountQuery.error,
            todaysActivityCount: todaysActivityCountQuery.error,
            assignedOrderStatusCount: assignedOrderStatusCountQuery.error, // NEW
            businessLocations: businessLocationsQuery.error
        },

        // Refetch functions
        refetchAll: () => {
            ordersQuery.refetch();
            todaysActivityQuery.refetch();
            orderStatusCountQuery.refetch();
            todaysActivityCountQuery.refetch();
            assignedOrderStatusCountQuery.refetch(); // NEW
            businessLocationsQuery.refetch();
        }
    };
};
