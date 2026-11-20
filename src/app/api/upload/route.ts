import { API_BASE_URL } from '@/shop/config';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        // Assuming the frontend is sending the file under the key "image"
        const file = formData.get('image');

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // 1. Prepare the payload for your GriipBuddy API
        const internalFormData = new FormData();
        // Your RTK Query used formData.append("file", file)
        internalFormData.append('file', file);

        // 2. Call your internal AWS upload API
        const response = await fetch(`${API_BASE_URL}/upload/single`, {
            method: 'POST',
            body: internalFormData
            // Note: Do NOT set 'Content-Type' header manually;
            // fetch will automatically set it with the correct boundary for FormData.
        });

        const result = await response.json();

        // 3. Handle the response based on your API's structure
        // (Assuming your API returns a 'url' or 'data.url' on success)
        if (response.ok) {
            return NextResponse.json({
                url: result.url || result.data?.url || result.location
            });
        } else {
            return NextResponse.json(
                { error: result.message || 'Internal API upload failed' },
                { status: response.status }
            );
        }
    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}

// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("image");

//     if (!file) {
//       return NextResponse.json({ error: "No file provided" }, { status: 400 });
//     }

//     // Prepare ImgBB payload
//     const imgbbFormData = new FormData();
//     imgbbFormData.append("image", file);

//     const apiKey = process.env.NEXT_PUBLIC_FILE_UPLOAD_API_KEY;
//     const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
//       method: "POST",
//       body: imgbbFormData,
//     });

//     const result = await response.json();

//     if (result.success) {
//       return NextResponse.json({ url: result.data.url });
//     } else {
//       return NextResponse.json({ error: "ImgBB upload failed" }, { status: 500 });
//     }
//   } catch (error) {
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }
