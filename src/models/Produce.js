import mongoose from 'mongoose';

const ProduceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title for the produce.'],
        maxlength: [60, 'Title cannot be more than 60 characters'],
    },
    farmerName: {
        type: String,
        required: [true, 'Please provide the farmer name.'],
    },
    farmerPhone: {
        type: String,
        required: [true, 'Please provide the farmer phone number for contact routing.'],
    },
    farmerEmail: {
        type: String,
        required: false,
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price per kg.'],
    },
    quantity: {
        type: Number,
        required: [true, 'Please provide the quantity in kg.'],
    },
    image: {
        type: String,
        required: false,
        default: 'https://images.unsplash.com/photo-1595856453669-e970a2fdfde1?q=80&w=600&auto=format&fit=crop', // default fresh vegetables image
    },
    address: {
        type: String,
        required: [true, 'Please provide the location (city or market).']
    },
    marketRateComparison: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });



export default mongoose.models.Produce || mongoose.model('Produce', ProduceSchema);
