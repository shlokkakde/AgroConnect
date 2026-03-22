import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Produce from '@/models/Produce';

export async function GET(request) {
    try {
        await dbConnect();
        const url = new URL(request.url);
        const farmer = url.searchParams.get('farmer');

        let query = {};
        if (farmer) query.farmerName = farmer;

        // For consumer geo search we would use $near, but let's keep it simple for now and fetch all
        const produce = await Produce.find(query).sort({ createdAt: -1 });

        // --- LIVE MANDI ORACLE INTEGRATION ---
        // Simulated response from data.gov.in agriculture API
        const liveMandiRates = {
            'Tomato': 45, 'Onion': 60, 'Potato': 25, 'Wheat': 35, 'Rice': 55, 'Apple': 120, 'Mango': 80, 'Carrot': 40
        };

        const enrichedProduce = produce.map(item => {
            const cropObj = item.toObject();
            const normalizedCrop = cropObj.title.trim().charAt(0).toUpperCase() + cropObj.title.trim().slice(1).toLowerCase();

            // Try to fetch real API rate, otherwise calculate organic markup fallback
            const realMandiRate = liveMandiRates[normalizedCrop] || Math.round(cropObj.price * 1.35);

            return {
                ...cropObj,
                mandiRate: realMandiRate // Injected via Backend
            };
        });

        return NextResponse.json({ success: true, data: enrichedProduce });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();

        const produce = await Produce.create({
            title: body.title,
            farmerName: body.farmerName || 'Test Farmer',
            farmerPhone: body.farmerPhone || '0000000000',
            farmerEmail: body.farmerEmail || '',
            price: body.price,
            quantity: body.quantity,
            address: body.location || 'Local Farm',
            marketRateComparison: body.marketRateComparison || 0,
            image: body.image || 'https://images.unsplash.com/photo-1595856453669-e970a2fdfde1?q=80&w=600&auto=format&fit=crop'
        });

        return NextResponse.json({ success: true, data: produce }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(request) {
    try {
        await dbConnect();
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: 'Produce ID is required' }, { status: 400 });

        await Produce.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
