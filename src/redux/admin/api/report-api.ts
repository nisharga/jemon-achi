import apiSlice from './api-slice';

const reportApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === get business report ===
        getBusinessReport: builder.query({
            query: ({ startDate, endDate, businessLocationId }) => {
                const params = new URLSearchParams();
                if (startDate) params.append('startDate', startDate.toString());
                if (endDate) params.append('endDate', endDate.toString());
                if (businessLocationId)
                    params.append('businessLocationId', businessLocationId);

                return {
                    url: `/report/business-report?${params.toString()}`,
                    method: 'GET'
                };
            }
        })
    })
});

export const { useGetBusinessReportQuery } = reportApi;
