import mongoose from 'mongoose';

const MarketRateSchema = new mongoose.Schema({
    cropName: { type: String, required: true },
    state: { type: String, required: true },
    market: { type: String, required: true },
    minPrice: { type: Number, required: true },
    maxPrice: { type: Number, required: true },
    modalPrice: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

// Compound index for efficient queries
MarketRateSchema.index({ state: 1, cropName: 1 });

export default mongoose.models.MarketRate || mongoose.model('MarketRate', MarketRateSchema);
