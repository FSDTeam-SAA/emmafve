import axios from "axios";

const shopifyClient = axios.create({
  baseURL: `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2023-01/`,
  headers: {
    "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
    "Content-Type": "application/json",
  },
});

export default shopifyClient;
