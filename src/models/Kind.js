/**
 * Kind-CAL типизация по FPF (C.3)
 * Разделение характеристики и логики оценки
 */

// Kind definitions - только описание
export const PARAM_KINDS = [
  { id: "pr1", name: "Сопр. изоляции (основная)", unit: "МОм" },
  { id: "pr2", name: "Сопр. изоляции (дополнительная)", unit: "МОм" },
  { id: "pr3", name: "Коэффициент абсорбции", unit: "" },
  { id: "pr4", name: "tgδ", unit: "%" },
];

// KindSignature - сигнатура с явной типизацией
export function createKindSignature(kindId, comparability) {
  return {
    kind_id: kindId,
    comparability: comparability,  // "min" | "max" | "range" | "exact"
  };
}

/**
 * Оценить значение по Kind
 * @param {number} value - измеренное значение
 * @param {object} zones - нормативные зоны
 * @param {object} signature - KindSignature
 */
export function evaluateByKind(value, zones, signature) {
  if (!zones || zones.length === 0) return "NORM_UNDEFINED";
  
  const { comparability } = signature;
  
  if (comparability === "min") {
    return value >= zones[0].min ? "OK" : "FAIL";
  }
  if (comparability === "max") {
    return value <= zones[0].max ? "OK" : "FAIL";
  }
  if (comparability === "range") {
    return value >= zones[0].min && value <= zones[0].max ? "OK" : "FAIL";
  }
  return "UNKNOWN";
}

// Subkind - уточнённый вид
export const SUBKINDS = {
  "pr1.main": { parent: "pr1", scope: "основная обмотка" },
  "pr1.add": { parent: "pr1", scope: "дополнительная обмотка" },
};

// KindBridge - маппинг между контекстами
export function createKindBridge(sourceKind, targetKind, mapping) {
  return {
    source: sourceKind,
    target: targetKind,
    mapping,  // функция маппинга
  };
}