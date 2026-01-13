import { motion } from "framer-motion";

export default function TarjetaSkeleton() {
  const descriptionWidths = ["w-full", "w-11/12", "w-10/12", "w-3/4", "w-2/3"];

  return (
    <motion.div
      className="w-full h-full flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 relative"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Placeholder del boton flotante */}
      <div className="absolute top-2 right-2 z-10 bg-white/70 border border-gray-200 shadow-md rounded-full h-9 w-9 animate-pulse" />

      {/* Imagen */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="absolute bottom-3 left-3 h-6 w-20 rounded bg-white/80 animate-pulse" />
      </div>

      {/* Texto */}
      <div className="flex-1 flex flex-col justify-between p-5 font-light gap-3">
        <div className="space-y-2">
          <div className="h-4 w-5/6 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="space-y-2">
          {descriptionWidths.map((width) => (
            <div key={width} className={`h-4 rounded bg-gray-100 animate-pulse ${width}`} />
          ))}
        </div>
      </div>

      {/* Precio y boton */}
      <div className="border-t border-gray-100 p-3 flex flex-col gap-2 mt-auto">
        <div className="space-y-1">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-10 rounded-full bg-gray-200 animate-pulse" />
      </div>
    </motion.div>
  );
}
