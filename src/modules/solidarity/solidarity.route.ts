import { Router } from "express";
import { getProducts, getCollections } from "./solidarity.controller";

const router = Router();

router.get("/shopify-products", getProducts);

router.get("/shopify-collections", getCollections);

export const solidarityRoute = router;
