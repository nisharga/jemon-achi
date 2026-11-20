// Helper to handle all media uploads
export const uploadProductMedia = async (
    uploadFile: any,
    thumbnail: File | null,
    sliderImages: File[]
) => {
    let thumbnailUrl = '';
    const sliderUrls: string[] = [];

    // 1. Upload Thumbnail if exists
    if (thumbnail) {
        const thumbData = new FormData();
        thumbData.append('file', thumbnail);
        const res = await uploadFile(thumbData).unwrap();
        if (res?.success) thumbnailUrl = res.data.url;
    }

    // 2. Upload Slider Images (Sequential to avoid server overwhelm, or use Promise.all)
    if (sliderImages.length > 0) {
        for (const file of sliderImages) {
            const sliderData = new FormData();
            sliderData.append('file', file);
            const res = await uploadFile(sliderData).unwrap();
            if (res?.success) sliderUrls.push(res.data.url);
        }
    }

    return { thumbnailUrl, sliderUrls };
};
