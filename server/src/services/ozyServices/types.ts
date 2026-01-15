export type ServicioRaw = {
  servicioCodigo?: string;
  centroCosto?: string;
};

export type ServicioItem = {
  servicioCodigo: string;
  centroCosto: string;
};

export type ContextResponse = {
  servicios?: ServicioRaw[];
};

export type ServicioInfoResult = ServicioItem & {
  data: unknown;
};

// Sources para la respuesta de Tickets Telefonico OzyPark
