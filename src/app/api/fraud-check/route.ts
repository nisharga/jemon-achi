import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
        return NextResponse.json(
            { error: 'Phone number is required' },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(
            `https://efraudchecker.zephix.io/api/v1/fraud-checker/${phone}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch fraud data' },
            { status: 500 }
        );
    }
}
