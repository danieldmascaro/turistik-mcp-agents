import { z } from "zod";

export const agentesProductosSchema = z.object({
    respuesta: z.string().describe("Escribe aquí tu respuesta"),    
    tickets: z.array(z.object({
  nombre: z.string().describe("Nombre del producto"),
  precio: z.number().describe("Precio del producto"),
  descripcion: z.string().describe("Descripción del producto"),
  horario: z.string().describe("Horario normal del producto"),
})).describe("Ingresa aquí todos los productos que vas a ofrecer").optional(), 
})