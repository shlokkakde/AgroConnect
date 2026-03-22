import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const { farmerPhone, consumerPhone, produceTitle } = await req.json();

        // Format to international code (Assumes Indian +91 if 10 digits provided)
        let formattedPhone = farmerPhone;
        if (formattedPhone.length === 10) {
            formattedPhone = '+91' + formattedPhone;
        }

        const messageText = `AgroConnect: Buyer (${consumerPhone}) is interested in your ${produceTitle}. Please contact them.`;

        // Use Textbelt Free API (1 SMS per day limit)
        const response = await fetch('https://textbelt.com/text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: formattedPhone,
                message: messageText,
                key: 'textbelt',
            }),
        });

        const data = await response.json();

        if (data.success) {
            return NextResponse.json({ success: true, message: 'SMS sent successfully via Textbelt!' });
        } else {
            // Textbelt typically hits quota limits quickly on the free key
            console.error('Textbelt error:', data.error);
            return NextResponse.json({ 
                success: false, 
                error: `Free API Limit Reached: ${data.error}` 
            }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
