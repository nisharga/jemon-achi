import apiSlice from './api-slice';

const repeatCustomerApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === get single order by id  ===
        getSingleRepeatCustomerByPhoneNumber: builder.query({
            query: ({ phone_number }) => ({
                url: `/repeat-customer/${phone_number}`,
                method: 'GET'
            }),
            providesTags: (result, error, { phone_number }) => [
                { type: 'REPEAT_CUSTOMER', id: phone_number }
            ]
        })
    })
});

export const { useGetSingleRepeatCustomerByPhoneNumberQuery } =
    repeatCustomerApi;
