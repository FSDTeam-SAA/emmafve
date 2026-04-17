import express from 'express';
import { getProducts, getCollections } from '../controllers/shopify.controller';

const router = express.Router();

// Route to fetch all products
router.get('/products', getProducts);

// Route to fetch all collections
router.get('/collections', getCollections);

export const shopifyRouter = router;