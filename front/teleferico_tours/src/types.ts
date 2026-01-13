import { z } from "zod";

export type OpenAiGlobals<
  ToolInput = UnknownObject,
  ToolOutput = UnknownObject,
  ToolResponseMetadata = UnknownObject,
  WidgetState = UnknownObject
> = {
  // visuals
  theme: Theme;

  userAgent: UserAgent;
  locale: string;

  // layout
  maxHeight: number;
  displayMode: DisplayMode;
  safeArea: SafeArea;

  // state
  toolInput: ToolInput;
  toolOutput: ToolOutput | null;
  toolResponseMetadata: ToolResponseMetadata | null;
  widgetState: WidgetState | null;
  setWidgetState: (state: WidgetState) => Promise<void>;
};

// currently copied from types.ts in chatgpt/web-sandbox.
// Will eventually use a public package.
type API = {
  callTool: CallTool;
  sendFollowUpMessage: (args: { prompt: string }) => Promise<void>;
  openExternal(payload: { href: string }): void;

  // Layout controls
  requestDisplayMode: RequestDisplayMode;
};

export type UnknownObject = Record<string, unknown>;

export type Theme = "light" | "dark";

export type SafeAreaInsets = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type SafeArea = {
  insets: SafeAreaInsets;
};

export type Categoria =
  | "Ciudad"
  | "Cultura"
  | "Historia"
  | "Naturaleza"
  | "Aventura"
  | "Nieve"
  | "Vino"
  | "Gastronomía"
  | "Litoral"
  | "Familia"
  | "Niños"
  | "Diversión"
  | "Bienestar"
  | "Romántico"
  | "Paisajes"
  | "Neruda"
  | "Poesía"
  | "Montaña"
  | "Ecología"
  | "Educativo"
  | "Experiencial"
  | "Cerro San Cristóbal"
  | "Teleférico"
  | "Funicular"
  | "Plaza de Armas";

export type TourData = {
  nombre: string;
  precio: number;
  precio2: number;
  descripcion: string;
  img_url: string;
  link: string;
  sub_area: string;
  categorias: [];
}

export type WooData = {
    tours: TourData[];
};

export const CategoriaSchema = z.object({
  nombre: z.enum([
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
  ]).describe(
    "Nombre de la categoría, por ejemplo: aventura, cultura, gastronomía, etc."
  ),
});

export type Consulta = {
  nombre: string;
  precio_min: number;
  precio_max: number;
  palabras_clave: Categoria[];
};

export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";

export type UserAgent = {
  device: { type: DeviceType };
  capabilities: {
    hover: boolean;
    touch: boolean;
  };
};

/** Display mode */
export type DisplayMode = "pip" | "inline" | "fullscreen";
export type RequestDisplayMode = (args: { mode: DisplayMode }) => Promise<{
  /**
   * The granted display mode. The host may reject the request.
   * For mobile, PiP is always coerced to fullscreen.
   */
  mode: DisplayMode;
}>;

export type CallToolResponse = {
  result: string;
};

/** Calling APIs */
export type CallTool = (
  name: string,
  args: Record<string, unknown>
) => Promise<CallToolResponse>;

/** Extra events */
export const SET_GLOBALS_EVENT_TYPE = "openai:set_globals";
export class SetGlobalsEvent extends CustomEvent<{
  globals: Partial<OpenAiGlobals>;
}> {
  readonly type = SET_GLOBALS_EVENT_TYPE;
}

/**
 * Global oai object injected by the web sandbox for communicating with chatgpt host page.
 */
declare global {
  interface Window {
    openai: (API & OpenAiGlobals) & {
      toolOutput?: {
        data?: {
          consulta?: { nombre: string; precio: number; palabras_clave: number[] };
          wooData?: Array<{
            nombre: string;
            precio: number;
            precio2: number;
            descripcion: string;
            categorias: Categoria[];
            imagen: string;
            link: string;
          }>;
        };
      };
    };
  }

  interface WindowEventMap {
    [SET_GLOBALS_EVENT_TYPE]: SetGlobalsEvent;
  }
}