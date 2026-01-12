// fechaBotPrompt.ts

const TZ = "America/Santiago";

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

// ✅ Capitaliza cada palabra (Enero, Febrero, etc.)
const titleCase = (s: string): string =>
  s
    .split(" ")
    .filter(Boolean)
    .map((w) => cap1(w))
    .join(" ");

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
  const ampm = get(timeParts, "dayPeriod");
  const hora_formateada = `${hh}:${mm} ${ampm}`;

  const fecha_formateada = `${dd} de ${mes} de ${yyyy}`;

  return (
    `Hoy es ${dia_semana}, ${fecha_formateada} y son las ${hora_formateada}. ` +
    `Si te preguntan por una fecha y no te especifican el año, asume que se refieren ` +
    `al año ${annio_actual} o al siguiente, si es que la fecha ya pasó.`
  );
}


export function buildFechaBotSimple(): string {
  const now = new Date();

  const dateParts = DATE_FMT.formatToParts(now);
  const timeParts = TIME_FMT.formatToParts(now);

  const dd = get(dateParts, "day");
  const mes = titleCase(get(dateParts, "month")); 
  const yyyy = get(dateParts, "year");

  const hh = get(timeParts, "hour");
  const mm = get(timeParts, "minute");
  const ampm = get(timeParts, "dayPeriod");

  return `${dd} de ${mes} de ${yyyy}. ${hh}:${mm} ${ampm}`;
}

export const fecha = buildFechaBotPrompt();