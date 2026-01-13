import TarjetaTour from "./TarjetaTour";
import type { WooProductSummary } from "../types";
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback } from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SlideTarjetasProps {
  wooData: WooProductSummary[];
}

export default function SlideTarjetas({ wooData }: SlideTarjetasProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    loop: true,
    dragFree: false,
  });

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const allTours = wooData;

  // ✅ Definir ancho dinámico según cantidad de tarjetas
  const getCardWidthClass = () => {
    if (allTours.length === 1) {
      return "flex-[0_0_100%] max-w-full min-w-full";
    } else if (allTours.length === 2) {
      return "flex-[0_0_calc(50%-0.75rem)] max-w-[calc(50%-0.75rem)] min-w-[calc(50%-0.75rem)]";
    } else {
      return "flex-[0_0_calc(33.3333%-1rem)] max-w-[calc(33.3333%-1rem)] min-w-[calc(33.3333%-1rem)]";
    }
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto py-6 px-6">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-6 px-2 p-4">
          {allTours.map((tour, index: number) => (
            <div key={tour.id ?? tour.name ?? index} className={getCardWidthClass()}>
              <TarjetaTour item={tour} />
            </div>
          ))}
        </div>
      </div>

      {/* Botones de navegación */}
      {allTours.length > 4 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={scrollPrev}
            aria-label="Anterior"
            className="
              flex items-center justify-center
              bg-white/90 rounded-full p-2 shadow-md border border-gray-200
              hover:bg-gray-100 transition-all duration-200
            "
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <button
            onClick={scrollNext}
            aria-label="Siguiente"
            className="
              flex items-center justify-center
              bg-white/90 rounded-full p-2 shadow-md border border-gray-200
              hover:bg-gray-100 transition-all duration-200
            "
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      )}
    </div>
  );
}
