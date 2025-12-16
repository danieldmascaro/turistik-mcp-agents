import axios from "axios";
import type { WooListResponse, WooProduct, WooProductQuery } from "./types.js";

const baseURL = process.env.WC_BASE_URL;
const consumerKey = process.env.WC_CONSUMER_KEY;
const consumerSecret = process.env.WC_CONSUMER_SECRET;

if (!baseURL || !consumerKey || !consumerSecret) {
  throw new Error("Faltan variables de entorno: WC_BASE_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET");
}

/**
 * Nota:
 * Para REST API v3, WooCommerce acepta Basic Auth usando ck/cs.
 * En HTTPS suele funcionar sin problemas.
 */
export const wc = axios.create({
  baseURL: `${baseURL.replace(/\/$/, "")}/wp-json/wc/v3`,
  auth: {
    username: consumerKey,
    password: consumerSecret,
  },
  timeout: 15000,
});

type QueryPrimitive = string | number | boolean;

const serializeQueryValue = (value: QueryPrimitive | QueryPrimitive[]): string =>
  Array.isArray(value) ? value.map(String).join(",") : String(value);

const buildQueryParams = (query: WooProductQuery): Record<string, string> => {
  const params: Record<string, string> = {};

  const append = (key: string, value?: QueryPrimitive | QueryPrimitive[]) => {
    if (value === undefined) return;
    params[key] = serializeQueryValue(value);
  };

  append("search", query.search);
  append("category", query.category);
  append("tag", query.tag);
  append("include", query.include);
  append("exclude", query.exclude);
  append("min_price", query.min_price);
  append("max_price", query.max_price);
  append("status", query.status);
  append("featured", query.featured);
  append("on_sale", query.on_sale);
  append("order", query.order);
  append("orderby", query.orderby);
  append("page", query.page);
  append("per_page", query.per_page);

  return params;
};

export async function listarExcursionesWoo(
  query: WooProductQuery = {}
): Promise<WooListResponse<WooProduct[]>> {
  const params = buildQueryParams(query);
  const response = await wc.get<WooProduct[]>("/products", { params });

  const headers = response.headers;
  const total = Number(headers["x-wp-total"] ?? headers["X-WP-Total"] ?? 0);
  const totalPages = Number(headers["x-wp-totalpages"] ?? headers["X-WP-TotalPages"] ?? 0);

  return {
    data: response.data,
    pagination: {
      total,
      totalPages,
    },
  };
}
