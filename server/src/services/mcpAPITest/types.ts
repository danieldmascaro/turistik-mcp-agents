import { z } from "zod";

const categoriaValues = [
  "Ciudad",
  "Cultura",
  "Historia",
  "Naturaleza",
  "Aventura",
  "Nieve",
  "Vino",
  "Gastronomía",
  "Litoral",
  "Familia",
  "Niños",
  "Diversión",
  "Bienestar",
  "Romántico",
  "Paisajes",
  "Neruda",
  "Poesía",
  "Montaña",
  "Ecología",
  "Educativo",
  "Experiencial",
  "Cerro San Cristóbal",
  "Teleférico",
  "Funicular",
  "Plaza de Armas",
] as const;

export const CategoriaSchema = z.enum(categoriaValues);
export type Categoria = z.infer<typeof CategoriaSchema>;

/**
 * ✅ Ahora TODO opcional para permitir {}
 * (mantengo min(1) solo si viene el valor)
 */
export const ConsultaToursSchema = z
  .object({
    nombre: z.string().min(1).optional(),
    precio_min: z.number().nonnegative().optional(),
    precio_max: z.number().nonnegative().optional(),
    palabras_clave: z.array(CategoriaSchema).min(1).optional(),
  })
  .superRefine((v, ctx) => {
    // valida relación solo si ambos vienen
    if (
      typeof v.precio_min === "number" &&
      typeof v.precio_max === "number" &&
      v.precio_max < v.precio_min
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["precio_max"],
        message: "precio_max debe ser mayor o igual a precio_min",
      });
    }
  });

export type ConsultaTours = z.infer<typeof ConsultaToursSchema>;

export type ApiErrorPayload = unknown;

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(message: string, status: number, payload?: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}
