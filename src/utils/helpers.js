// ─── ID генератор ─────────────────────────────────────────────────────────────
let _uid = 200;
export const uid = () => `id_${++_uid}`;

export const genNum = (prots) => {
  const y = 2026;
  const n = prots.filter(p => p.number.startsWith(`ПИМ-${y}`)).length;
  return `ПИМ-${y}-${String(n + 1).padStart(5, "0")}`;
};

export const nowStr = () =>
  new Date().toLocaleString("ru-RU",
    { year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit" }
  ).replace(",","");

// ─── Явные состояния измерения (FPF C.2.2a Language-State) ─────────────────────────
export const MEASUREMENT_STATE = {
  NOT_MEASURED: "NOT_MEASURED",     // факт ещё не введён
  MEASURED: "MEASURED",         // значение введено
  NORM_UNDEFINED: "NORM_UNDEFINED", // зоны норматива не заданы
  INVALID_VALUE: "INVALID_VALUE", // введено нечисловое значение
  ERROR: "ERROR"               // ошибка при вычислении
};

// ─── Статус строки измерения ──────────────────────────────────────────────────
export function calcZoneStatus(fact, zones) {
  if (fact === null || fact === undefined) return null;
  const f = parseFloat(fact);
  if (isNaN(f)) return null;
  for (const z of zones) {
    const okMin = z.min === null || (z.min_inc ? f >= z.min : f > z.min);
    const okMax = z.max === null || (z.max_inc ? f <= z.max : f < z.max);
    if (okMin && okMax) return z;
  }
  return null;
}

export function getEffectiveStatus(row) {
  if (row.manual_status) return { label: row.manual_status, color:"processing", overridden:true, state:row.manual_status };
  if (row.fact === null || row.fact === undefined || row.fact === "")
    return { label:"Не измерено", color:"default", system:true, state:MEASUREMENT_STATE.NOT_MEASURED };
  if (!row.zones || row.zones.length === 0)
    return { label:"Не определено", color:"default", system:true, undefined:true, state:MEASUREMENT_STATE.NORM_UNDEFINED };
  const z = calcZoneStatus(row.fact, row.zones);
  if (!z) return { label:"Не определено", color:"default", system:true, undefined:true, state:MEASUREMENT_STATE.ERROR };
  return { label:z.label, color:z.color, zoneId:z.id, state:MEASUREMENT_STATE.MEASURED };
}

export function countBadRows(prot) {
  const rows = prot.mode === "tm_list"
    ? (prot.tm_groups || []).flatMap(g => g.rows)
    : (prot.rows || []);
  return rows.filter(r => {
    const s = getEffectiveStatus(r);
    return s.color === "error" || s.color === "warning";
  }).length;
}

export function zoneLabel(zones) {
  if (!zones || zones.length === 0) return "—";
  return zones.map(z => {
    const lo = z.min !== null ? `${z.min_inc?"≥":">"}${z.min}` : "";
    const hi = z.max !== null ? `${z.max_inc?"≤":"<"}${z.max}` : "";
    return `${z.label}: ${[lo,hi].filter(Boolean).join(" и ") || "любое"}`;
  }).join(" | ");
}

// ─── Константы механизмов (FPF A.6.1) ───────────────────────────────────────
/**
 * Пороги для механизма определения состояния поверки.
 * WARNING_DAYS: количество дней до истечения срока, после которых прибор считается "истекающим"
 */
export const CALIBRATION_THRESHOLDS = {
  WARNING_DAYS: 30  // дней до предупреждения об истечении
};

// ─── Состояние поверки прибора ────────────────────────────────────────────────
/**
 * Определяет состояние поверки прибора на основе даты следующей поверки.
 * @param {Object} ins - прибор с полями date_next_cal
 * @returns {string} "none" | "expired" | "expiring" | "ok"
 */
export function calStatus(ins) {
  if (!ins.date_next_cal) return "none";
  const next = new Date(ins.date_next_cal), now = new Date();
  const warn = new Date(); warn.setDate(warn.getDate() + CALIBRATION_THRESHOLDS.WARNING_DAYS);
  if (next <= now) return "expired";
  if (next <= warn) return "expiring";
  return "ok";
}

// Проверяет, есть ли в протоколе просроченные приборы
export function hasExpiredInstruments(prot, instruments) {
  return (prot.instrument_ids || []).some(id => {
    const ins = instruments.find(x => x.id === id);
    return ins && calStatus(ins) === "expired";
  });
}
