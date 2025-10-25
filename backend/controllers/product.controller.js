import mongoose from "mongoose";
import Product from "../models/product.model.js";

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const createProduct = async (req, res) => {
    const product = req.body;
    if (!product.name || !product.price) {
        return res.status(400).json({ message: 'Name and price are required' });
    }

    const newProduct = new Product(product);

    try {
        await newProduct.save();
        res.status(200).json({ success: true, data: newProduct });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const product = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: 'Invalid product ID' });
    }

    try{
        const updatedProduct=await Product.findByIdAndUpdate(id, product, { new: true });
        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Invalid product ID' });
    }
    try {
        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const getProductById = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Invalid product ID' });
    }
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}