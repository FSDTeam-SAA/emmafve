import shopify from "../utils/shopifyClient";
import { Request, Response } from "express";
import {
  ShopifyCollection,
  ShopifyProduct,
} from "../modules/solidarity/solidarity.interface";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const response = await shopify.get<{ products: ShopifyProduct[] }>("products.json");
    res.status(200).json(response.data.products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCollections = async (req: Request, res: Response) => {
  try {
    const response = await shopify.get<{ custom_collections: ShopifyCollection[] }>(
      "custom_collections.json",
    );
    res.status(200).json(response.data.custom_collections);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
