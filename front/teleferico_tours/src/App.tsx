import { useEffect, useState } from "react";
import type { WooData, Consulta } from "./types";
import SlideTarjetas from "./components/SlideTarjetas";
import Navbar from "./components/Navbar";
import SlideTarjetasSkeleton from "./components/SlideTarjetasSkeleton";

function App() {
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [wooData, setWooData] = useState<WooData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialConsulta = window.openai?.toolOutput?.data?.consulta as Consulta | undefined;
    if (initialConsulta) {
      setConsulta(initialConsulta);
    }

    const handleSetGlobals = (event: CustomEvent<any>) => {
      const incomingConsulta = (event.detail?.globals as any)?.toolOutput?.data?.consulta as
        | Consulta
        | undefined;

      if (incomingConsulta) {
        setConsulta(incomingConsulta);
      }
    };

    window.addEventListener("openai:set_globals", handleSetGlobals as EventListener);

    return () => {
      window.removeEventListener("openai:set_globals", handleSetGlobals as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!consulta) {
      return;
    }

    let isCancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setWooData([]);

      try {
        const response = await fetch(
          "https://kaiv2.azurewebsites.net/api/MCP_API?code=Vp7m4IvYcIwl6QOK3GE5O7vtqrQsQTIBLVzeCVkIZww-AzFu_Q-alA==",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "cors",
            body: JSON.stringify(consulta),
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        const nextWooData: WooData[] = Array.isArray(data)
          ? data
          : data?.wooData ?? data?.data ?? [];
        if (!isCancelled) {
          setWooData(nextWooData);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Error al obtener datos:", error);
          setWooData([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [consulta]);

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
