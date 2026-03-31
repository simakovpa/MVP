/**
 * Mechanism Intension по FPF (A.6.1)
 * Явные механизмы с LawSet и AdmissibilityConditions
 */

// LawSet для калибровки
export const CALIBRATION_LAWSET = [
  { condition: "date_next_cal = null", result: "none" },
  { condition: "date_next_cal <= now", result: "expired" },
  { condition: "date_next_cal <= now + WARNING_DAYS", result: "expiring" },
  { condition: "otherwise", result: "ok" }
];

// CN-Spec для Comparability Governance
export const CN_SPEC = {
  id: "cal_status_cn",
  comparability_mode: "ordinal",  // Ordinal: только порядок
  normalization: null,           // без нормализации
  threshold_window: 30          // дней
};

// Calibration Mechanism
export const CalibrationMechanism = {
  id: "cal_status",
  lawset: CALIBRATION_LAWSET,
  cn_spec: CN_SPEC,
  admissibility: {
    pass: ["ok"],
    degrade: ["expiring"],
    fail: ["expired", "none"]
  }
};

// Вычислить статус калибровки
export function computeCalibration(ins) {
  if (!ins.date_next_cal) return "none";
  
  const now = new Date();
  const next = new Date(ins.date_next_cal);
  const warn = new Date();
  warn.setDate(warn.getDate() + CN_SPEC.threshold_window);
  
  if (next <= now) return "expired";
  if (next <= warn) return "expiring";
  return "ok";
}

// Admissibility check
export function checkAdmissibility(status) {
  const { admissibility } = CalibrationMechanism;
  
  if (admissibility.pass.includes(status)) return "pass";
  if (admissibility.degrade.includes(status)) return "degrade";
  if (admissibility.fail.includes(status)) return "fail";
  return "unknown";
}

// Mechanism для статуса измерения
export const MeasurementMechanism = {
  id: "zone_status",
  cn_spec: {
    id: "zone_status_cn",
    comparability_mode: "ordinal",
  },
  lawset: [
    { condition: "zones = null", result: "NORM_UNDEFINED" },
    { condition: "fact = null", result: "NOT_MEASURED" },
    { condition: "isNaN(fact)", result: "INVALID_VALUE" },
    { condition: "in_range", result: "OK" },
    { condition: "out_of_range", result: "FAIL" }
  ]
};