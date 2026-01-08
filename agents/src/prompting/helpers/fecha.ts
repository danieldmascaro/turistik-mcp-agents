// fechaBotPrompt.ts

const TZ = "America/Santiago";

// Cache de formateadores (más rápido si se llama muchas veces)
const DATE_FMT = new Intl.DateTimeFormat("es-CL", {
  timeZone: TZ,
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const TIME_FMT = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const YMD_FMT = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const get = (
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPart["type"]
): string => parts.find((p) => p.type === type)?.value ?? "";

const cap1 = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const ymdFromTz = (d: Date): string => {
  const parts = YMD_FMT.formatToParts(d);
  const val = (t: Intl.DateTimeFormatPart["type"]) => parts.find((x) => x.type === t)?.value ?? "";
  return `${val("year")}-${val("month")}-${val("day")}`;
};

/**
 * String fijo para prompt:
 * - Siempre usa la hora/fecha actual (runtime)
 * - Siempre usa zona horaria Santiago de Chile (America/Santiago)
 * - Formato estable (AM/PM, capitalización)
 */
export function buildFechaBotPrompt(): string {
  const now = new Date();

  const annio_actual = now.getFullYear();

  const dateParts = DATE_FMT.formatToParts(now);
  const timeParts = TIME_FMT.formatToParts(now);

  const dia_semana = cap1(get(dateParts, "weekday"));
  const mes = cap1(get(dateParts, "month"));

  const dd = get(dateParts, "day");
  const yyyy = get(dateParts, "year");

  const hh = get(timeParts, "hour");
  const mm = get(timeParts, "minute");
  const ampm = get(timeParts, "dayPeriod"); // AM/PM
  const hora_formateada = `${hh}:${mm} ${ampm}`;

  const fecha_formateada = `${dd} de ${mes} de ${yyyy}`;

  const hoy = ymdFromTz(now);
  const dos_semanas = ymdFromTz(new Date(now.getTime() + 14 * 86_400_000));

  return (
    `Hoy es ${dia_semana}, ${fecha_formateada} y son las ${hora_formateada}. ` +
    `Si te preguntan por una fecha y no te especifican el año, asume que se refieren ` +
    `al año ${annio_actual} o al siguiente, si es que la fecha ya pasó. ` +
    `(Referencia interna: hoy=${hoy}, +14d=${dos_semanas})`
  );
}
