import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();
        const users = await User.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        // Explicit Admin User/Pass requirement
        if (body.action === 'login' && body.phone === 'admin' && body.password === 'admin123') {
            return NextResponse.json({
                success: true,
                data: { _id: 'admin_id_001', name: 'Super Admin', role: 'ADMIN', phone: 'admin', isVerified: true }
            }, { status: 200 });
        }

        await dbConnect();

        if (body.action === 'verify') {
            const user = await User.findById(body.userId);
            if (!user) return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
            if (body.otp !== '1234') return NextResponse.json({ success: false, error: 'Invalid verification code.' }, { status: 400 });

            user.isVerified = true;
            await user.save();
            return NextResponse.json({ success: true, data: user }, { status: 200 });
        }

        if (body.action === 'login') {
            const user = await User.findOne({ phone: body.phone, password: body.password });
            if (!user) {
                return NextResponse.json({ success: false, error: 'Invalid phone or password.' }, { status: 401 });
            }
            return NextResponse.json({ success: true, data: user }, { status: 200 });
        } else if (body.action === 'register') {
            const exists = await User.findOne({ phone: body.phone });
            if (exists) {
                return NextResponse.json({ success: false, error: 'Phone number already registered.' }, { status: 400 });
            }

            const user = await User.create({
                name: body.name,
                role: body.role,
                phone: body.phone,
                email: body.email,
                password: body.password,
                isVerified: false,
                location: {
                    type: 'Point',
                    coordinates: [77.2090, 28.6139]
                }
            });
            return NextResponse.json({ success: true, data: user }, { status: 201 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(request) {
    try {
        await dbConnect();
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });

        await User.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
