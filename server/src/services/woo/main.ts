import axios from "axios";
import type { WooListResponse, WooProduct, WooProductQuery } from "./types.js";

const baseURL = process.env.WC_BASE_URL;
const consumerKey = process.env.WC_CONSUMER_KEY;
const consumerSecret = process.env.WC_CONSUMER_SECRET;

if (!baseURL || !consumerKey || !consumerSecret) {
  throw new Error(
    "Faltan variables de entorno: WC_BASE_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET"
  );
}

export const wc = axios.create({
  baseURL: `${baseURL.replace(/\/$/, "")}/wp-json/wc/v3`,
  auth: { username: consumerKey, password: consumerSecret },
  timeout: 15000,
});

type QueryPrimitive = string | number | boolean;
type QueryValue = QueryPrimitive | QueryPrimitive[];

// 👇 DTO liviano (lo que verá tu agente)
export type WooProductSummary = {
  id: number;
  name: string;
  slug: string;
  permalink: string;

  // 👇 vienen desde meta_data
  video: string | null;
  horario: any | null; // cámbialo a string|null si sabes que siempre es string

  prices: {
    price: string; // Woo suele devolver string
    regular_price: string;
    sale_price: string | null;
    on_sale: boolean;
  };
  main_image: { src: string; thumbnail?: string; alt?: string } | null;
};

// 👇 Extiende tu query para soportar _fields (opcional pero recomendado)
export type WooProductQueryLite = WooProductQuery & {
  fields?: string[]; // se serializa a _fields=...
};

const serializeQueryValue = (value: QueryValue): string =>
  Array.isArray(value) ? value.map(String).join(",") : String(value);

const buildQueryParams = (query: WooProductQueryLite): Record<string, string> => {
  const params: Record<string, string> = {};
  const append = (key: string, value?: QueryValue) => {
    if (value === undefined) return;
    params[key] = serializeQueryValue(value);
  };

  append("search", query.search);
  append("tag", query.tag);
  append("include", query.include);
  append("exclude", query.exclude);
  append("min_price", query.min_price);
  append("max_price", query.max_price);

  // 👇 fuerza status publish a nivel API
  append("status", query.status);

  append("featured", query.featured);
  append("on_sale", query.on_sale);
  append("order", query.order);
  append("orderby", query.orderby);
  append("page", query.page);
  append("per_page", query.per_page);

  // 👇 WP REST global param: limita campos del response
  append("_fields", query.fields);

  return params;
};

const getMeta = (meta: any[], key: string): any =>
  meta?.find((m) => m?.key === key)?.value ?? null;

const toSummary = (p: Partial<WooProduct>): WooProductSummary => {
  const images = Array.isArray((p as any).images) ? ((p as any).images as any[]) : [];
  const main =
    images.slice().sort((a, b) => (a?.position ?? 9999) - (b?.position ?? 9999))[0] ?? null;

  const meta = Array.isArray((p as any).meta_data) ? (p as any).meta_data : [];

  const videoVal = getMeta(meta, "video");
  const horarioVal = getMeta(meta, "horario");

  return {
    id: Number((p as any).id),
    name: String((p as any).name ?? ""),
    slug: String((p as any).slug ?? ""),
    permalink: String((p as any).permalink ?? ""),

    video: videoVal != null && videoVal !== "" ? String(videoVal) : null,
    horario: horarioVal === "" ? null : horarioVal,

    prices: {
      price: String((p as any).price ?? ""),
      regular_price: String((p as any).regular_price ?? ""),
      sale_price: ((p as any).sale_price ?? null) === "" ? null : ((p as any).sale_price ?? null),
      on_sale: Boolean((p as any).on_sale),
    },

    main_image: main
      ? {
          src: String(main.src ?? ""),
          thumbnail: main.thumbnail ? String(main.thumbnail) : undefined,
          alt: main.alt ? String(main.alt) : undefined,
        }
      : null,
  };
};

export async function listarExcursionesWoo(
  query: WooProductQueryLite = {}
): Promise<WooListResponse<WooProductSummary[]>> {
  const enforcedQuery: WooProductQueryLite = {
    ...query,
    status: "publish",
    fields:
      query.fields ??
      [
        "id",
        "name",
        "slug",
        "permalink",
        "price",
        "regular_price",
        "sale_price",
        "on_sale",
        "images",
        "meta_data", // 👈 necesario para extraer video/horario
      ],
  };

  const params = buildQueryParams(enforcedQuery);

  // No paginar: recorrer todas las páginas y devolver todo
  const perPage = Number(params.per_page ?? 100) || 100;
  delete params.page;
  params.per_page = String(Math.min(perPage, 100));

  const all: Partial<WooProduct>[] = [];
  let page = 1;
  let total = 0;
  let totalPages = 0;

  while (true) {
    const response = await wc.get<Partial<WooProduct>[]>("/products", {
      params: { ...params, page: String(page) },
    });

    if (page === 1) {
      const headers = response.headers;
      total = Number(headers["x-wp-total"] ?? headers["X-WP-Total"] ?? 0);
      totalPages = Number(headers["x-wp-totalpages"] ?? headers["X-WP-TotalPages"] ?? 0);
    }

    all.push(...response.data);

    if (response.data.length < Number(params.per_page)) {
      break;
    }

    if (totalPages && page >= totalPages) {
      break;
    }

    page += 1;
  }

  return {
    data: all.map(toSummary),
    pagination: { total, totalPages },
  };
}
