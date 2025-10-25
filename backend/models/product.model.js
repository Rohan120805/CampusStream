import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Plumbing Equipment', 'Seeds', 'Fertilizers', 'Soil & Gardening Material', 'Others'],
        default: 'Others'
    },
}, {
    timestamps: true,
});

const Product = mongoose.model("Product", productSchema);
export default Product;