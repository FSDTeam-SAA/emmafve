import shopify from "../../utils/shopifyClient";
import {
  ShopifyCollection,
  ShopifyProduct,
  SolidarityProduct,
} from "./solidarity.interface";

export const solidarityService = {
  async getProducts(): Promise<SolidarityProduct[]> {
    const response = await shopify.get<{ products: ShopifyProduct[] }>("products.json");

    return response.data.products.map((product) => ({
      ...product,
      productUrl: `https://${process.env.SHOPIFY_STORE_URL}/products/${product.handle}`,
    }));
  },

  async getCollections(): Promise<ShopifyCollection[]> {
    const response = await shopify.get<{ custom_collections: ShopifyCollection[] }>(
      "custom_collections.json",
    );

    return response.data.custom_collections;
  },
};
