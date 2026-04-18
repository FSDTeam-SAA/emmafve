export type ShopifyProduct = Record<string, unknown> & {
  handle: string;
};

export type SolidarityProduct = ShopifyProduct & {
  productUrl: string;
};

export type ShopifyCollection = Record<string, unknown>;
