import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text_original, category, comment } = body;

        // 1. Validation
        if (!text_original || typeof text_original !== 'string') {
            return NextResponse.json({ ok: false, error: 'O que está faltando é obrigatório.' }, { status: 400 });
        }

        if (text_original.trim().length < 10) {
            return NextResponse.json({ ok: false, error: 'Por favor, detalhe um pouco mais (mínimo 10 caracteres).' }, { status: 400 });
        }

        const allowedCategories = ['Alimentação', 'Saúde', 'Serviços', 'Mobilidade', 'Lazer'];
        if (category && !allowedCategories.includes(category)) {
            return NextResponse.json({ ok: false, error: 'Categoria inválida.' }, { status: 400 });
        }

        // 2. IP & Rate Limiting
        const forwardedFor = request.headers.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';

        const ipHash = crypto.createHash('sha256').update(ip).digest('hex');

        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        const recentCount = await prisma.missingItem.count({
            where: {
                ip_hash: ipHash,
                created_at: {
                    gte: oneMinuteAgo,
                },
            },
        });

        if (recentCount >= 10) {
            return NextResponse.json({ ok: false, error: 'Muitas tentativas. Tente novamente em um minuto.' }, { status: 429 });
        }

        // 3. Persistence
        const newItem = await prisma.missingItem.create({
            data: {
                city: 'Osasco',
                text_original: text_original.trim(),
                category: category || null,
                comment: comment ? String(comment).trim() : null,
                ip_hash: ipHash,
            },
        });

        return NextResponse.json({ ok: true, id: newItem.id }, { status: 201 });

    } catch (error) {
        console.error('Error creating missing item:', error);
        return NextResponse.json({ ok: false, error: 'Erro interno ao salvar.' }, { status: 500 });
    }
}
