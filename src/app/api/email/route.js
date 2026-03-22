import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        const { farmerEmail, consumerPhone, produceTitle } = await req.json();

        // Nodemailer requires explicit server credentials
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('Email credentials omitted from server environment (.env.local missing EMAIL_USER/PASS)');
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // HTML Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: farmerEmail,
            subject: `AgroConnect Alert: Buyer interested in your ${produceTitle}!`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border-radius: 8px; background-color: #f4fce3; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2ea169; border-bottom: 2px solid #2ea169; padding-bottom: 10px;">agroConnect Alert! 🌱</h2>
                    <p style="font-size: 16px; color: #333;">Hello Farmer,</p>
                    <p style="font-size: 16px; color: #333;">Great news! A local consumer is highly interested in purchasing your listed <strong>${produceTitle}</strong>.</p>
                    
                    <div style="padding: 15px; margin: 25px 0; background-color: white; border-left: 5px solid #2ea169; border-radius: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                        <p style="margin: 0; font-size: 15px; color: #555;">Buyer Direct Mobile Number:</p>
                        <h3 style="margin: 5px 0 0 0; color: #111; font-size: 24px;">${consumerPhone}</h3>
                    </div>

                    <p style="font-size: 16px; color: #333;">Please give them a quick call or send a WhatsApp message to this number to answer any questions, finalize the price, and arrange pickup/delivery.</p>
                    <p style="font-size: 14px; color: #777; margin-top: 30px;">Happy selling!<br>— The agroConnect Platform Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: 'Email alert dispatched successfully via Nodemailer!' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
