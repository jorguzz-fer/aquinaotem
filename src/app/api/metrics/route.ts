
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate required fields (basic check)
        if (!body.session_id || body.ttfc_ms === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await prisma.uxMetric.create({
            data: {
                session_id: body.session_id,
                page: body.page || '/',
                ttfc_ms: body.ttfc_ms,
                first_focus_ms: body.first_focus_ms,
                device_type: body.device_type || 'unknown',
                referrer: body.referrer || null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving metric:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
