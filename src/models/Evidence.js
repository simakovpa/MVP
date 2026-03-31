// ─── Evidence модель (FPF A.10, G.6) ─────────────────────────────────────────────
//
// Модель для привязки измерений к источникам (приборы, норматива)
//

/**
 * Создать Evidence для измерения
 * @param {string} claim - что подтверждается (параметр)
 * @param {Object} source - источник доказательства
 * @param {string} source.type - 'instrument' | 'norm_doc' | 'method'
 * @param {string} source.ref - ссылка на источник
 */
export function createEvidence(claim, source) {
  return {
    type: "U.Evidence",
    claim,        // что подтверждается (param_id)
    source,      // { type, ref }
    path_id: generatePathId(claim, source),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Сгенерировать PathId для трассировки (FPF G.6)
 */
function generatePathId(claim, source) {
  return `path_${claim}_${source.type}_${Date.now()}`;
}

/**
 * Создать Evidence для измерения с прибором
 */
export function createMeasurementEvidence(paramId, instrumentId, instrumentName) {
  return createEvidence(paramId, {
    type: "instrument",
    ref: instrumentId,
    name: instrumentName,  // для отображения
  });
}

/**
 * Создать Evidence для норматива
 */
export function createNormEvidence(paramId, normSource) {
  return createEvidence(paramId, {
    type: "norm_doc",
    ref: normSource,  // source string like "СТО 34.01-23.1-001-2017 п.10"
  });
}