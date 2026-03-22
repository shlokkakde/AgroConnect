import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, enum: ['FARMER', 'CONSUMER', 'ADMIN'], required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: false },
    password: { type: String, required: false }, // Optional for legacy support
    isVerified: { type: Boolean, default: false }, // OTP verification flag
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }
    }
}, { timestamps: true });

UserSchema.index({ location: '2dsphere' });

export default mongoose.models.User || mongoose.model('User', UserSchema);
