import shopify from "../../utils/shopifyClient";
import { Request, Response } from "express";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const response = await shopify.get("products.json");
    const products = response.data.products.map((product: any) => ({
      ...product,
      productUrl: `https://${process.env.SHOPIFY_STORE_URL}/products/${product.handle}`,
    }));
    res.status(200).json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCollections = async (req: Request, res: Response) => {
  try {
    const response = await shopify.get("custom_collections.json");
    res.status(200).json(response.data.custom_collections);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
