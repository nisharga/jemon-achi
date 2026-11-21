import apiSlice from './api-slice';

const staffApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === create staff  ===
        createStaff: builder.mutation({
            query: ({ payload }) => ({
                url: `/user/recruit/staff`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['STAFFS']
        }),

        // === get all staffs ===
        getAllStaffs: builder.query({
            query: ({ page, limit, role }) => ({
                url: `/user/admin/all/roles?limit=${limit}&page=${page}&role=${role}`,
                method: 'GET'
            }),
            providesTags: ['STAFFS']
        }),

        // === get staff by id ===
        getStaffById: builder.query({
            query: ({ user_id }) => ({
                url: `/user/${user_id}`,
                method: 'GET'
            }),
            providesTags: (result, error, { user_id }) => [
                { type: 'STAFF', id: user_id }
            ]
        }),

        // === update staff ===
        updateStaff: builder.mutation({
            query: ({ staff_id, payload }) => ({
                url: `/user/update/staff/${staff_id}`,
                method: 'PUT',
                body: payload
            }),
            invalidatesTags: (result, error, { staff_id }) => [
                'STAFFS',
                { type: 'STAFF', id: staff_id }
            ]
        }),
        // === manage permissions ===
        managePermissions: builder.mutation({
            query: ({ payload }) => ({
                url: `/permissions`,
                method: 'PATCH',
                body: payload
            }),
            invalidatesTags: (result, error, { staff_id }) => [
                'STAFFS',
                { type: 'STAFF', id: staff_id }
            ]
        }),

        // === delete staff ===
        deleteStaff: builder.mutation({
            query: ({ staff_id }) => ({
                url: `/user/${staff_id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, { staff_id }) => [
                'STAFFS',
                { type: 'STAFF', id: staff_id }
            ]
        })
    })
});

export const {
    useCreateStaffMutation,
    useGetAllStaffsQuery,
    useGetStaffByIdQuery,
    useUpdateStaffMutation,
    useManagePermissionsMutation,
    useDeleteStaffMutation
} = staffApi;
