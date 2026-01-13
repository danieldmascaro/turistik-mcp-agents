import { useEffect, useState } from "react";
import type { ToolOutput, WooProductSummary } from "./types";
import SlideTarjetas from "./components/SlideTarjetas";
import Navbar from "./components/Navbar";
import SlideTarjetasSkeleton from "./components/SlideTarjetasSkeleton";

function App() {
  const [wooData, setWooData] = useState<WooProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const extractWooData = (toolOutput?: ToolOutput | null): WooProductSummary[] => {
      if (!toolOutput) return [];
      const payload = toolOutput.data ?? (toolOutput as unknown);
      const list = (payload as any)?.data ?? (payload as any)?.wooData ?? payload;
      return Array.isArray(list) ? (list as WooProductSummary[]) : [];
    };

    const applyToolOutput = (toolOutput?: ToolOutput | null) => {
      if (!toolOutput) {
        setLoading(true);
        setWooData([]);
        return;
      }
      setWooData(extractWooData(toolOutput));
      setLoading(false);
    };

    applyToolOutput(window.openai?.toolOutput ?? null);

    const handleSetGlobals = (event: CustomEvent<any>) => {
      const globals = event.detail?.globals as { toolOutput?: ToolOutput } | undefined;
      applyToolOutput(globals?.toolOutput ?? null);
    };

    window.addEventListener("openai:set_globals", handleSetGlobals as EventListener);

    return () => {
      window.removeEventListener("openai:set_globals", handleSetGlobals as EventListener);
    };
  }, []);

  const hasData = !loading && wooData.length > 0;
  const showEmptyState = !loading && wooData.length === 0;

  return (
    <div
      className="antialiased max-w-full max-h-full text-black py-5 bg-white"
      
    >
      <Navbar />
      <div className="flex-1">
        <div className="w-full max-w-7xl mx-auto">
          {loading && <SlideTarjetasSkeleton />}

          {hasData && <SlideTarjetas wooData={wooData} />}

          {showEmptyState && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300 select-none">
              <span className="text-8xl font-extrabold">404</span>
              <span className="mt-4 text-4xl">:(</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
