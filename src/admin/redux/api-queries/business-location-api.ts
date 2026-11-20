import apiSlice from './api-slice';

const businessLocationApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === create business location ===
        createBusinessLocation: builder.mutation({
            query: ({ payload }) => ({
                url: `/business-location`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['BUSINESS_LOCATIONS']
        }),

        // === update business location ===
        updateBusinessLocation: builder.mutation({
            query: ({ payload, business_location_id }) => ({
                url: `/business-location/${business_location_id}`,
                method: 'PUT',
                body: payload
            }),
            invalidatesTags: ['BUSINESS_LOCATIONS']
        }),

        // === get all business locations  ===
        getAllBusinessLocations: builder.query({
            query: ({ page, limit }) => {
                const params = new URLSearchParams();
                if (page) params.append('page', page.toString());
                if (limit) params.append('limit', limit.toString());

                return {
                    url: `/business-location?${params.toString()}`,
                    method: 'GET'
                };
            },
            providesTags: ['BUSINESS_LOCATIONS']
        }),

        // === get single business location by id  ===
        getBusinessLocationById: builder.query({
            query: ({ id }) => ({
                url: `/business-location/${id}`,
                method: 'GET'
            })
        }),

        // === delete product  ===
        deleteBusinessLocation: builder.mutation({
            query: ({ id }) => ({
                url: `/business-location/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['BUSINESS_LOCATIONS']
        })
    })
});

export const {
    useCreateBusinessLocationMutation,
    useUpdateBusinessLocationMutation,
    useGetAllBusinessLocationsQuery,
    useGetBusinessLocationByIdQuery,
    useDeleteBusinessLocationMutation
} = businessLocationApi;
