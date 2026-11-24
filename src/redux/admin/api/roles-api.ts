import apiSlice from './api-slice';

const roleApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // === Get All Roles ===
        getAllRoles: builder.query({
            query: () => ({
                url: `/roles`,
                method: 'GET'
            }),
            providesTags: ['ROLES']
        }),

        // === Get Single Role by ID ===
        getRoleById: builder.query({
            query: (slug) => ({
                url: `/roles/${slug}`,
                method: 'GET'
            }),
            providesTags: (result, error, slug) => [
                'ROLES',
                { type: 'ROLE', slug }
            ]
        }),

        // === Create New Role ===
        createRole: builder.mutation({
            query: (payload) => ({
                url: `/roles`,
                method: 'POST',
                body: payload
            }),
            invalidatesTags: ['ROLES']
        }),

        // === Update Role ===
        updateRole: builder.mutation({
            query: ({ id, payload }) => ({
                url: `/roles/${id}`,
                method: 'PUT',
                body: payload
            }),
            invalidatesTags: (result, error, { id }) => [
                'ROLES',
                { type: 'ROLE', id }
            ]
        }),

        // === Delete Role ===
        deleteRole: builder.mutation({
            query: (id) => ({
                url: `/roles/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['ROLES']
        })
    })
});

export const {
    useGetAllRolesQuery,
    useGetRoleByIdQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useDeleteRoleMutation
} = roleApi;
