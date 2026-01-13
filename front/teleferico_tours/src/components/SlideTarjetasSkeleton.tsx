import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TarjetaSkeleton from "./TarjetaSkeleton";

export default function SlideTarjetasSkeleton() {
  const skeletonDots = [0, 1, 2, 3];

  return (
    <motion.div
      className="relative w-full max-w-7xl mx-auto py-6 px-6"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="overflow-hidden">
        <div className="flex gap-6 px-2 p-4">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="
                flex-[0_0_50%]
                sm:flex-[0_0_32%]
                md:flex-[0_0_31.3333%]
                max-w-[33.3333%]
                min-w-[0_0_31.3333%]
              "
            >
              <TarjetaSkeleton />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Anterior"
            disabled
            className="flex items-center justify-center rounded-full border border-gray-200 bg-white/80 p-2 text-gray-300 shadow-md"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            type="button"
            aria-label="Siguiente"
            disabled
            className="flex items-center justify-center rounded-full border border-gray-200 bg-white/80 p-2 text-gray-300 shadow-md"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {skeletonDots.map((dot) => (
            <span
              key={`skeleton-dot-${dot}`}
              className="h-2.5 w-2.5 rounded-full bg-gray-200"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
