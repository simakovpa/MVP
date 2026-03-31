/**
 * Bounded Contexts по FPF (A.1.1)
 * Контекстуальное разделение справочников
 */

// Контексты
export const CONTEXTS = {
  ETL_REFERENCES: "ЭТЛ_Справочники",  // оборудование, номенклатуры
  ETL_PROTOCOLS: "ЭТЛ_Протоколы",      // протоколы измерений
  ETL_NORMS: "ЭТЛ_Нормативы",         // нормативные зоны
};

/**
 * Создать BoundedContext обёртку
 * @param {string} name - имя контекста
 * @param {Array} items - элементы
 * @param {Array} invariants - инварианты
 */
export function createBoundedContext(name, items, invariants = []) {
  return {
    context: name,
    items,
    invariants,
    created_at: new Date().toISOString(),
  };
}

// Оборудование - контекст ETL_REFERENCES
export const EQUIP_TYPES_CTX = createBoundedContext(
  CONTEXTS.ETL_REFERENCES,
  [
    { id: "et1", name: "Трансформатор тока" },
    { id: "et2", name: "Трансформатор напряжения" },
    { id: "et3", name: "Трансформатор силовой" },
  ],
  ["type_id уникален"]
);

// Номенклатуры - контекст ETL_REFERENCES
export const NOMENCLATURES_CTX = createBoundedContext(
  CONTEXTS.ETL_REFERENCES,
  [
    { id: "nm1", name: "ТФЗМ-110 кВ исп.У1", type_id: "et1", accepted: true },
    { id: "nm2", name: "НТМИ-110 кВ", type_id: "et2", accepted: true },
  ],
  ["nomenclature_id уникален", "type_id ссылается на EQUIP_TYPES"]
);

// Параметры - контекст ETL_NORMS
export const PARAMS_CTX = createBoundedContext(
  CONTEXTS.ETL_NORMS,
  [
    { id: "pr1", name: "Сопр. изоляции (основная)", unit: "МОм" },
    { id: "pr2", name: "Сопр. изоляции (дополнительная)", unit: "МОм" },
    { id: "pr3", name: "Коэффициент абсорбции", unit: "" },
    { id: "pr4", name: "tgδ", unit: "%" },
  ],
  ["param_id уникален"]
);

// Типы норм - контекст ETL_NORMS
export const NORM_TYPES = [
  { id: "nt1", name: "override_tmcz" },     // переопределение для ТМЦ
  { id: "nt2", name: "override_nomenclature" }, // переопределение для номенклатуры
  { id: "nt3", name: "passport" },            // паспортная норма
  { id: "nt4", name: "norm_range" },         // диапазон из справочника
];

export const NORM_CHAIN = [
  { priority: 1, type: "override_tmcz", source: "bind_type=tmcz" },
  { priority: 2, type: "override_nomenclature", source: "bind_type=nomenclature" },
  { priority: 3, type: "passport", source: "nomenclature_ids[]" },
  { priority: 4, type: "norm_range", source: "type_id" },
];