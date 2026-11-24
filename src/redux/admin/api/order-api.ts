import apiSlice from './api-slice';

const orderApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === get all orders  ===
        getAllOrders: builder.query({
            query: ({
                page,
                limit,
                searchQuery,
                filter,
                startDate,
                endDate,
                created_by,
                sku,
                business_location_id,
                is_assigned_to_business_location,
                is_repeat_customer,
                is_called
            }) => {
                const params = new URLSearchParams();

                if (page) params.append('page', page);
                if (limit) params.append('limit', limit);
                if (searchQuery) params.append('searchQuery', searchQuery);
                if (sku) params.append('sku', sku);
                if (filter) params.append('filter', filter);
                if (startDate) params.append('startDate', startDate.toString());
                if (endDate) params.append('endDate', endDate.toString());
                if (created_by) params.append('created_by', created_by);
                if (is_repeat_customer)
                    params.append('is_repeat_customer', is_repeat_customer);
                if (is_called) params.append('is_called', is_called);
                if (business_location_id)
                    params.append('business_location_id', business_location_id);
                if (is_assigned_to_business_location)
                    params.append(
                        'is_assigned_to_business_location',
                        is_assigned_to_business_location
                    );

                return {
                    url: `/order?${params.toString()}`,
                    method: 'GET'
                };
            },
            providesTags: ['ORDERS']
        }),
        // getAllOrderSummary
        getAllOrderSummary: builder.query({
            query: ({
                startDate,
                endDate,
                searchQuery,
                sku,
                filter,
                business_location_id,
                payment_type,
                is_assigned_to_business_location,
                is_repeat_customer,
                created_by
            }) => {
                const params = new URLSearchParams();

                if (startDate) params.append('startDate', startDate.toString());
                if (endDate) params.append('endDate', endDate.toString());
                if (searchQuery) params.append('searchQuery', searchQuery);
                if (filter) params.append('filter', filter);
                if (payment_type) params.append('payment_type', payment_type);
                if (sku) params.append('sku', sku);
                if (payment_type) params.append('payment_type', payment_type);
                if (is_repeat_customer)
                    params.append('is_repeat_customer', is_repeat_customer);
                if (business_location_id)
                    params.append('business_location_id', business_location_id);
                if (is_assigned_to_business_location)
                    params.append(
                        'is_assigned_to_business_location',
                        is_assigned_to_business_location
                    );
                if (created_by) params.append('created_by', created_by);

                return {
                    url: `/order/orders-summary?${params.toString()}`,
                    method: 'GET'
                };
            },
            providesTags: ['ORDERS']
        }),
        // getAllTodaysActivity
        getAllTodaysActivity: builder.query({
            query: ({
                page,
                limit,
                searchQuery,
                filter,
                startDate,
                endDate,
                sku,
                business_location_id,
                is_assigned_to_business_location,
                created_by,
                is_repeat_customer
            }) => {
                const params = new URLSearchParams();
                if (page) params.append('page', page.toString());
                if (limit) params.append('limit', limit.toString());
                if (searchQuery) params.append('searchQuery', searchQuery);
                if (sku) params.append('sku', sku);
                if (filter) params.append('filter', filter);
                if (startDate) params.append('startDate', startDate.toString());
                if (endDate) params.append('endDate', endDate.toString());
                if (business_location_id)
                    if (is_repeat_customer)
                        params.append('is_repeat_customer', is_repeat_customer);
                params.append('business_location_id', business_location_id);
                if (is_assigned_to_business_location)
                    params.append(
                        'is_assigned_to_business_location',
                        is_assigned_to_business_location
                    );
                if (created_by) params.append('created_by', created_by);

                return {
                    url: `/order/today-actives?${params.toString()}`,
                    method: 'GET'
                };
            },
            providesTags: ['ORDERS']
        }),
        // getAllTodaysActivityCount
        getAllTodaysActivityCount: builder.query({
            query: ({
                startDate,
                endDate,
                business_location_id,
                is_assigned_to_business_location
            }) => {
                const params = new URLSearchParams();

                if (startDate) params.append('startDate', startDate.toString());
                if (endDate) params.append('endDate', endDate.toString());
                if (business_location_id)
                    params.append('business_location_id', business_location_id);
                if (is_assigned_to_business_location)
                    params.append(
                        'is_assigned_to_business_location',
                        is_assigned_to_business_location
                    );

                return {
                    url: `/order/status/today-activity/count?${params.toString()}`,
                    method: 'GET'
                };
            },
            providesTags: ['ORDERS']
        }),

        // getAllOrderStatusCount
        getAllOrderStatusCount: builder.query({
            query: ({
                startDate,
                endDate,
                business_location_id,
                is_assigned_to_business_location,
                is_repeat_customer
            }) => {
                const params = new URLSearchParams();

                if (startDate) params.append('startDate', startDate.toString());
                if (endDate) params.append('endDate', endDate.toString());
                if (is_repeat_customer)
                    params.append(
                        'is_repeat_customer',
                        is_repeat_customer.toString()
                    );
                if (business_location_id)
                    params.append('business_location_id', business_location_id);
                if (is_assigned_to_business_location)
                    params.append(
                        'is_assigned_to_business_location',
                        is_assigned_to_business_location
                    );

                return {
                    url: `/order/status/count?${params.toString()}`,
                    method: 'GET'
                };
            },
            providesTags: ['ORDERS']
        }),
        // getAllAssignedOrderStatusCount
        getAllAssignedOrderStatusCount: builder.query({
            query: ({
                startDate,
                endDate,
                business_location_id,
                is_assigned_to_business_location
            }) => {
                const params = new URLSearchParams();

                if (startDate) params.append('startDate', startDate.toString());
                if (endDate) params.append('endDate', endDate.toString());
                if (business_location_id)
                    params.append('business_location_id', business_location_id);
                if (is_assigned_to_business_location)
                    params.append(
                        'is_assigned_to_business_location',
                        is_assigned_to_business_location
                    );

                return {
                    url: `/assigned-orders/status/count?${params.toString()}`,
                    method: 'GET'
                };
            },
            providesTags: ['ORDERS']
        }),

        // === get single order by id  ===
        getSingleOrderById: builder.query({
            query: ({ order_id }) => ({
                url: `/order/${order_id}`,
                method: 'GET'
            }),
            providesTags: (result, error, { order_id }) => [
                { type: 'ORDER', id: order_id }
            ]
        }),

        // === update order status ===
        updatOrderStatus: builder.mutation({
            query: ({ order_id, payload }) => ({
                url: `/order/${order_id}/status`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: (result, error, { order_id }) => [
                'ORDERS',
                'ASSIGNED_ORDERS',
                { type: 'ORDER', id: order_id },
                { type: 'ORDER_COURIER_STATUS', id: order_id }
            ]
        }),
        // === suggested products and outlets ===
        getSuggestedOutletProducts: builder.query({
            query: ({ order_id }) => ({
                url: `/order/suggested-products-from-business-location/${order_id}`
            })
        }),

        synchWithCourier: builder.query({
            query: () => ({
                url: `/order/sync/with/courier`
            }),
            providesTags: ['ORDERS']
        }),
        // === suggested products and outlets ===

        // === assign order to the outlet ===
        assignOrderToOutlet: builder.mutation({
            query: ({ payload }) => ({
                url: `/assigned-orders`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: (result, error, { payload }) => [
                'ORDERS',
                'ASSIGNED_ORDERS',
                { type: 'ORDER', id: payload.order },
                { type: 'ORDER_COURIER_STATUS', id: payload.order }
            ]
        }),
        // === delete order ===
        deleteOrder: builder.mutation({
            query: ({ order_id }) => ({
                url: `/order/${order_id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, { order_id }) => [
                'ORDERS',
                'ASSIGNED_ORDERS',
                { type: 'ORDER', id: order_id },
                { type: 'ORDER_COURIER_STATUS', id: order_id }
            ]
        }),

        // === get courier status ===
        getCourierStatusByOrderId: builder.query({
            query: ({ order_id }) => ({
                url: `/order/courier-status-by-order_id/${order_id}`
            }),
            providesTags: (result, error, { order_id }) => [
                { type: 'ORDER_COURIER_STATUS', id: order_id }
            ]
        }),

        // === edit order ===
        editOrder: builder.mutation({
            query: ({ order_id, payload }) => ({
                url: `/order/${order_id}`,
                method: 'PUT',
                body: payload
            }),
            invalidatesTags: (result, error, { order_id }) => [
                'ORDERS',
                'SEARCH_VARIANTS',
                { type: 'ORDER', id: order_id }
            ]
        }),

        // === order admin note ===
        orderAdminNote: builder.mutation({
            query: ({ order_id, payload }) => ({
                url: `/order/admin-note/${order_id}`,
                method: 'PUT',
                body: payload
            }),
            invalidatesTags: (result, error, { order_id }) => [
                'ORDERS',
                'SEARCH_VARIANTS',
                { type: 'ORDER', id: order_id }
            ]
        }),

        // === return order ===
        returnOrder: builder.mutation({
            query: ({ payload }) => ({
                url: `/order/return/order`,
                method: 'PUT',
                body: payload
            }),
            invalidatesTags: (result, error, { order_id }) => [
                'ORDERS',
                'SEARCH_VARIANTS',
                { type: 'ORDER', id: order_id }
            ]
        }),

        // === create order by admin ===
        createOrderByAdmin: builder.mutation({
            query: ({ payload }) => ({
                url: `/order/admin`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: (result, error, { order_id }) => [
                'ORDERS',
                'SEARCH_VARIANTS',
                { type: 'ORDER', id: order_id }
            ]
        }),

        // === mark as delivered ===
        markAsDelivered: builder.mutation({
            query: ({ order_id }) => ({
                url: `/order/${order_id}/mark-delivered`,
                method: 'PATCH'
            }),
            invalidatesTags: (result, error, { order_id }) => [
                'ORDERS',
                'ASSIGNED_ORDERS',
                { type: 'ORDER', id: order_id },
                { type: 'ORDER_COURIER_STATUS', id: order_id }
            ]
        }),

        // === mark as pending return ===
        markAsPendingReturn: builder.mutation({
            query: ({ order_id }) => ({
                url: `/order/${order_id}/mark-pending-return`,
                method: 'PATCH'
            }),
            invalidatesTags: (result, error, { order_id }) => [
                'ORDERS',
                'ASSIGNED_ORDERS',
                { type: 'ORDER', id: order_id },
                { type: 'ORDER_COURIER_STATUS', id: order_id }
            ]
        }),

        // === accept awaiting stock order ===
        acceptAwaitingStockOrder: builder.mutation({
            query: ({ order_id }) => ({
                url: `/order/${order_id}/accept-awaiting-stock`,
                method: 'PATCH'
            }),
            invalidatesTags: (result, error, { order_id }) => [
                'ORDERS',
                'ASSIGNED_ORDERS',
                { type: 'ORDER', id: order_id }
            ]
        }),

        // === mark order as called ("Have you called?" -> Yes) ===
        markOrderAsCalled: builder.mutation({
            query: ({ order_id }) => ({
                url: `/order/${order_id}/mark-called`,
                method: 'PATCH'
            }),
            invalidatesTags: (result, error, { order_id }) => [
                'ORDERS',
                'ASSIGNED_ORDERS',
                { type: 'ORDER', id: order_id }
            ]
        }),

        // === decline awaiting stock order ===
        declineAwaitingStockOrder: builder.mutation({
            query: ({ order_id, reason }) => ({
                url: `/order/${order_id}/decline-awaiting-stock`,
                method: 'PATCH',
                body: { reason }
            }),
            invalidatesTags: (result, error, { order_id }) => [
                'ORDERS',
                'ASSIGNED_ORDERS',
                { type: 'ORDER', id: order_id }
            ]
        })
    })
});

export const {
    useGetAllOrdersQuery,
    useGetSingleOrderByIdQuery,
    useUpdatOrderStatusMutation,
    useGetSuggestedOutletProductsQuery,
    useAssignOrderToOutletMutation,
    useDeleteOrderMutation,
    useGetCourierStatusByOrderIdQuery,
    useEditOrderMutation,
    useOrderAdminNoteMutation,
    useReturnOrderMutation,
    useCreateOrderByAdminMutation,
    useGetAllOrderStatusCountQuery,
    useGetAllTodaysActivityQuery,
    useGetAllTodaysActivityCountQuery,
    useGetAllAssignedOrderStatusCountQuery,
    useGetAllOrderSummaryQuery,
    useLazyGetAllOrdersQuery,
    useLazyGetAllTodaysActivityQuery,
    useLazySynchWithCourierQuery,
    useMarkAsDeliveredMutation,
    useMarkAsPendingReturnMutation,
    useAcceptAwaitingStockOrderMutation,
    useDeclineAwaitingStockOrderMutation,
    useMarkOrderAsCalledMutation
} = orderApi;
