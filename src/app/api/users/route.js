import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
    await dbConnect();
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: users });
}

export async function POST(req) {
    await dbConnect();
    try {
        const body = await req.json();
        const { action } = body;

        if (action === 'register') {
            const { name, phone, email, password, role } = body;
            const existingUser = await User.findOne({ phone });
            if (existingUser) return NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 });

            const user = await User.create({ name, phone, email, password, role, isVerified: false });
            return NextResponse.json({ success: true, data: user });
        }

        if (action === 'login') {
            const { phone, password } = body;

            if (phone === 'admin' && password === 'admin123') {
                return NextResponse.json({ success: true, data: { _id: 'admin_id', name: 'Master Admin', role: 'ADMIN', isVerified: true, phone: 'admin' } });
            }

            const user = await User.findOne({ phone, password });
            if (!user) return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });

            return NextResponse.json({ success: true, data: user });
        }

        if (action === 'verify') {
            const { userId, otp } = body;
            if (otp !== '1234') {
                return NextResponse.json({ success: false, error: 'Invalid OTP' }, { status: 400 });
            }
            await User.findByIdAndUpdate(userId, { isVerified: true });
            const user = await User.findById(userId);
            return NextResponse.json({ success: true, data: user });
        }

        // NEW: Admin capability to manually override user attributes
        if (action === 'adminUpdate') {
            const { userId, updateFields } = body;
            const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });
            return NextResponse.json({ success: true, data: updatedUser });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(req) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    try {
        if (id === 'admin_id') return NextResponse.json({ success: false, error: 'Cannot delete master admin' }, { status: 403 });
        await User.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
