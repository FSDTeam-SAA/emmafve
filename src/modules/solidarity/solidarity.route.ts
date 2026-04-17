import express from "express";
import { getProducts, getCollections } from "./solidarity.controller";

const router = express.Router();

// Route to fetch all products
router.get("/shopify/products", getProducts);

// Route to fetch all collections
router.get("/shopify/collections", getCollections);

export default router;
