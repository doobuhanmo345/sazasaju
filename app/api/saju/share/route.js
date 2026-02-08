import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Create shortened share ID (stores data for 7 days)
export async function POST(request) {
    try {
        const body = await request.json();

        // Generate 8-char random ID
        const id = Math.random().toString(36).substring(2, 10);

        // Store in KV with 7-day expiration (604800s)
        await kv.set(`saju:${id}`, body, { ex: 604800 });

        return NextResponse.json({
            success: true,
            id,
            shareUrlId: id // Frontend constructs full URL
        });
    } catch (error) {
        console.error('Share Create Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create share link' },
            { status: 500 }
        );
    }
}

// Retrieve share data
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const data = await kv.get(`saju:${id}`);

        if (!data) return NextResponse.json({ error: 'Data not found' }, { status: 404 });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Share Fetch Error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
