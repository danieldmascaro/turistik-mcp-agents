import type { TourData } from "../types";
import Button from "./Button";

export default function TarjetaTour({ item }: { item: TourData }) {
  const formatPrice = (price: number | undefined) => {
    if (!price) return null;
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // ✅ Decodifica correctamente las entidades HTML
  const sanitizeText = (text?: string) => {
    if (!text) return "";
    const parser = new DOMParser();
    const decoded = parser.parseFromString(text, "text/html").documentElement.textContent;
    return decoded || "";
  };

  const precioFinal = formatPrice(item.precio);
  const precioOriginal = formatPrice(item.precio2);

  const handleCardClick = () => {
    if (
      !window.openai?.toolOutput?.data?.wooData ||
      typeof window.openai.sendFollowUpMessage !== "function"
    ) {
      return;
    }

    const promptParts = [
      `El cliente se interesó en el tour "${item.nombre}".`,
      precioFinal ? `Precio actual: ${precioFinal}.` : null,
      item.descripcion ? `Descripción: ${sanitizeText(item.descripcion)}` : null,
      "Busca más información relevante sobre este tour e informa al cliente. Arma actividades e intenta enriquecer la información con links de atracciones relacionadas al tour. Para esta respuesta no vuelvas a llamar a la herramienta buscar_tours, solo da respuesta en texto. No agregues opciones ni mejoras, ni información que no aparezca en los medios oficiales de Turistik.",
    ];

    window.openai.sendFollowUpMessage({
      prompt: promptParts.filter(Boolean).join(" "),
    });
  };

  return (
    <div className="h-full min-h-[460px] flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group relative">
      {/* Logo OpenAI */}
      <button
        onClick={handleCardClick}
        className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white rounded-full p-1 shadow-md transition-all"
        title="Enviar información al cliente vía OpenAI"
      >
        <img
          src="https://assets.streamlinehq.com/image/private/w_240,h_240,ar_1/f_auto/v1/icons/technology/openai-1-52byx68uubjcpomdj4pmhq.png/openai-1-5u0onpsnpplsd0el4s93im.png?_a=DATAg1AAZAA0"
          alt="OpenAI Logo"
          className="w-6 h-6 sm:w-7 sm:h-7"
        />
      </button>

      {/* Imagen */}
      <div className="relative overflow-hidden h-48">
        <img
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          src={item.img_url}
          alt={`Imagen del tour ${item.nombre}`}
        />
        {item.sub_area && (
          <div className="absolute bottom-2 left-2 bg-white/90 text-red-600 text-xs font-semibold px-2 py-1 rounded">
            {item.sub_area}
          </div>
        )}
      </div>

      {/* Texto */}
      <div className="flex-1 flex flex-col justify-between p-5 font-light">
        <h3 className="md:text-base sm:text-sm font-bold mb-2 line-clamp-2">
          {item.nombre}
        </h3>
        <p className="text-gray-600 text-xs line-clamp-5">
          {sanitizeText(sanitizeText(item.descripcion))}
        </p>
      </div>

      {/* Precio y botón */}
      <div className="border-t border-gray-100 p-3 flex flex-col justify-between gap-2 mt-auto">
        <div className="flex flex-col items-start text-left">
          <p className="text-gray-600 sm:text-sm md:text-2xl">Desde</p>
          {precioOriginal && (
            <span className="text-gray-400 line-through text-sm">{precioOriginal}</span>
          )}
          {precioFinal && (
            <span className="sm:text-sm md:text-2xl text-gray-800">{precioFinal}</span>
          )}
        </div>

        {item.link && (
          <Button
            as="a"
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            variant="danger"
            size="sm"
            className="mt-2 w-full"
          >
            Comprar en Turistik.com
          </Button>
        )}
      </div>
    </div>
  );
}
