import apiSlice from './api-slice';

const metadataApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === get admin report metrics ===
        getAdminReportMetrics: builder.query({
            query: ({
                metric,
                startDate,
                endDate,
                business_location_id,
                status
            }) => {
                const params = new URLSearchParams();
                if (metric) params.append('metric', metric.toString());
                if (startDate) params.append('startDate', startDate.toString());
                if (endDate) params.append('endDate', endDate.toString());
                if (business_location_id)
                    params.append('business_location_id', business_location_id);
                if (status) params.append('status', status);

                return {
                    url: `/pos/admin/report-metric?${params.toString()}`,
                    method: 'GET'
                };
            }
        }),
        // === get orders report metrics ===
        getOrdersReportMetrics: builder.query({
            query: ({ metric, startDate, endDate, business_location_id }) => {
                const params = new URLSearchParams();
                if (metric) params.append('metric', metric.toString());
                if (startDate) params.append('startDate', startDate.toString());
                if (endDate) params.append('endDate', endDate.toString());
                if (business_location_id)
                    params.append('business_location_id', business_location_id);

                return {
                    url: `/order/report/monthly?${params.toString()}`,
                    method: 'GET'
                };
            }
        }),
        // === get orders report each overview ===
        getReportEachOverview: builder.query({
            query: ({ startDate, endDate, business_location_id }) => {
                const params = new URLSearchParams();
                if (startDate) params.append('startDate', startDate.toString());
                if (endDate) params.append('endDate', endDate.toString());
                if (business_location_id)
                    params.append('business_location_id', business_location_id);

                return {
                    url: `/order/report/date-range?${params.toString()}`,
                    method: 'GET'
                };
            }
        })
    })
});

export const {
    useGetAdminReportMetricsQuery,
    useGetOrdersReportMetricsQuery,
    useGetReportEachOverviewQuery
} = metadataApi;
