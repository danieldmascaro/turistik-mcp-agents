import "dotenv/config";
import axios from "axios";
import { writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const baseURL = process.env.WC_BASE_URL;
const consumerKey = process.env.WC_CONSUMER_KEY;
const consumerSecret = process.env.WC_CONSUMER_SECRET;

if (!baseURL || !consumerKey || !consumerSecret) {
  throw new Error(
    "Missing env vars: WC_BASE_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET"
  );
}

const wc = axios.create({
  baseURL: `${baseURL.replace(/\/$/, "")}/wp-json/wc/v3`,
  auth: { username: consumerKey, password: consumerSecret },
  timeout: 15000,
});

async function fetchAllProducts() {
  const perPage = 100;
  const all = [] as unknown[];
  let page = 1;
  let total = 0;
  let totalPages = 0;

  while (true) {
    const response = await wc.get("/products", {
      params: { per_page: perPage, page },
    });

    if (page == 1) {
      const headers = response.headers as Record<string, string | undefined>;
      total = Number(headers["x-wp-total"] ?? headers["X-WP-Total"] ?? 0);
      totalPages = Number(
        headers["x-wp-totalpages"] ?? headers["X-WP-TotalPages"] ?? 0
      );
    }

    all.push(...response.data);

    if (response.data.length < perPage) {
      break;
    }

    if (totalPages && page >= totalPages) {
      break;
    }

    page += 1;
  }

  return { data: all, pagination: { total, totalPages } };
}

async function dumpWooResponse() {
  try {
    const response = await fetchAllProducts();
    const outputUrl = new URL("./woo_response_full.json", import.meta.url);
    const outputPath = fileURLToPath(outputUrl);
    await writeFile(outputUrl, JSON.stringify(response, null, 2), "utf-8");
    console.log("Full JSON saved:", outputPath);
  } catch (error) {
    console.error("Failed to fetch WooCommerce products:", error);
    process.exitCode = 1;
  }
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  pathToFileURL(process.argv[1]).href === import.meta.url;

if (invokedDirectly) {
  dumpWooResponse();
}
