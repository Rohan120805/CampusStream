import express from "express";
import mongoose, { get } from "mongoose";
import { getProducts, createProduct, updateProduct, deleteProduct, getProductById } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.get("/:id", getProductById);


export default router;