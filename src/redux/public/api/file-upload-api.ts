import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import { createApi } from '@reduxjs/toolkit/query/react';
import apiSlice from './api-slice';
import { API_BASE_URL } from '@/configs/storefront';

const imgbbFileUploadApi = createApi({
    reducerPath: 'fileUploadApi',
    baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
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
export const { useUploadFileToAWSMutation } = fileUploadApi;

export default imgbbFileUploadApi;
