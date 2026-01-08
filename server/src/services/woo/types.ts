import { z } from "zod";

export const ListarExcursionesWooInputSchema = z.object({
  consulta: z.object({
    nombre: z.string().describe("Nombre del tour/excursión (texto libre).").default(""),
    precio_min: z.number().describe("Precio mínimo, en pesos chilenos CLP").default(0),
    precio_max: z.number().describe("Precio máximo, en pesos chilenos CLP.").default(999999),
  }),
});

export type ListarExcursionesWooInput = z.infer<typeof ListarExcursionesWooInputSchema>;

type IdOrSlug = number | string;

export interface WooProductCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface WooProductTag {
  id: number;
  name: string;
  slug: string;
}

export interface WooProductImage {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  src: string;
  name: string;
  alt: string;
  position: number;
}

export interface WooProductAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface WooProductMeta {
  id: number;
  key: string;
  value: unknown;
}

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_quantity: number | null;
  stock_status: "instock" | "outofstock" | "onbackorder";
  description: string;
  short_description: string;
  status: string;
  type: string;
  total_sales: number;
  categories: WooProductCategory[];
  tags: WooProductTag[];
  images: WooProductImage[];
  attributes: WooProductAttribute[];
  meta_data: WooProductMeta[];
  [key: string]: unknown;
}

export interface WooProductQuery {
  page?: number;
  per_page?: number;
  search?: string;
  tag?: IdOrSlug | IdOrSlug[];
  include?: number[];
  exclude?: number[];
  min_price?: number;
  max_price?: number;
  status?: "any" | "draft" | "pending" | "private" | "publish";
  featured?: boolean;
  on_sale?: boolean;
  order?: "asc" | "desc";
  orderby?: "date" | "id" | "include" | "title" | "slug" | "price" | "popularity" | "rating" | "menu_order";
}

export interface WooPagination {
  total: number;
  totalPages: number;
}

export interface WooListResponse<T> {
  data: T;
  pagination: WooPagination;
}
