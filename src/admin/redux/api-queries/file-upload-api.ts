import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import { createApi } from '@reduxjs/toolkit/query/react';
import apiSlice from './api-slice';
import { ENV } from '@/admin/constants/env';

// const imgbbFileUploadApi = createApi({
//  reducerPath: "fileUploadApi",
//  baseQuery: fetchBaseQuery({ baseUrl: "https://api.imgbb.com/1" }),
//  endpoints: (builder) => ({
//   // === upload a file ===
//   uploadFile: builder.mutation({
//    query: ({ file, apikey }) => ({
//     url: `/upload?key=${apikey}`,
//     method: "POST",
//     body: file,
//    }),
//   }),
//  }),
// });

const imgbbFileUploadApi = createApi({
    reducerPath: 'fileUploadApi',
    baseQuery: fetchBaseQuery({ baseUrl: ENV.NEXT_PUBLIC_BASE_SERVER_API }),
    endpoints: (builder) => ({
        // === upload a file ===
        uploadFile: builder.mutation({
            query: ({ file }) => ({
                url: `/upload/single`,
                method: 'POST',
                body: file
            })
        })
    })
});

const fileUploadApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        uploadFileToAWS: builder.mutation({
            query: (file: any) => {
                const formData = new FormData();
                formData.append('file', file);
                return {
                    url: `/upload/single`,
                    method: 'POST',
                    body: formData
                };
            }
        }),
        uploadMultipleFileToAWS: builder.mutation({
            query: (files: any) => {
                const formData = new FormData();
                for (const file of files) {
                    formData.append('files', file);
                }
                return {
                    url: `/upload/multiple`,
                    method: 'POST',
                    body: formData
                };
            }
        }),
        // === Video uploads (stored under the "videos/" prefix on AWS) ===
        uploadVideoToAWS: builder.mutation({
            query: (file: any) => {
                const formData = new FormData();
                formData.append('file', file);
                return {
                    url: `/upload/video/single`,
                    method: 'POST',
                    body: formData
                };
            }
        }),
        uploadMultipleVideosToAWS: builder.mutation({
            query: (files: any) => {
                const formData = new FormData();
                for (const file of files) {
                    formData.append('files', file);
                }
                return {
                    url: `/upload/video/multiple`,
                    method: 'POST',
                    body: formData
                };
            }
        })
    })
});

export const cloudinaryUploadApi = createApi({
    reducerPath: 'cloudinaryUploadApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://api.cloudinary.com/v1_1/dxqzawk38'
    }),
    endpoints: (builder) => ({
        uploadVideo: builder.mutation<any, { file: File }>({
            query: ({ file }) => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', 'video_unsigned_test');

                return {
                    url: '/video/upload',
                    method: 'POST',
                    body: formData
                };
            }
        })
    })
});

export const { useUploadVideoMutation } = cloudinaryUploadApi;

export const { useUploadFileMutation } = imgbbFileUploadApi;
export const {
    useUploadFileToAWSMutation,
    useUploadMultipleFileToAWSMutation,
    useUploadVideoToAWSMutation,
    useUploadMultipleVideosToAWSMutation
} = fileUploadApi;

export default imgbbFileUploadApi;
