/**
 * Trust & Assurance по FPF (B.3)
 * F-G-R модель: Formality, Scope, Reliability
 */

// Assurance Levels
export const ASSURANCE_LEVELS = {
  L0: { level: 0, name: "Unsubstantiated", description: "Без подтверждения" },
  L1: { level: 1, name: "Partial", description: "Частичное" },
  L2: { level: 2, name: "Full", description: "Полное" },
};

// Formality Scale (F)
export const FORMALITY = {
  F0: { value: 0, name: "Intuition", description: "Интуитивный" },
  F1: { value: 1, name: "Described", description: "Описанный" },
  F2: { value: 2, name: "Specified", description: "Специфицированный" },
  F3: { value: 3, name: "Verified", description: "Верифицированный" },
  F4: { value: 4, name: "Proven", description: "Доказанный" },
};

// Scope (G) — ClaimScope
export function createClaimScope(context, bounds) {
  return {
    context,    // Bounded Context
    bounds,     // границы применимости
    validity: "current" // или "historical"
  };
}

// Reliability (R) — вычисляется по weakest-link
export function computeReliability(evidencePath) {
  if (!evidencePath || evidencePath.length === 0) {
    return { r: 0, level: ASSURANCE_LEVELS.L0 };
  }
  
  // Weakest-link принцип
  const minR = Math.min(...evidencePath.map(e => e.r || 1));
  
  return {
    r: minR,
    level: minR >= 0.8 ? ASSURANCE_LEVELS.L2 :
           minR >= 0.5 ? ASSURANCE_LEVELS.L1 :
           ASSURANCE_LEVELS.L0,
    path: evidencePath
  };
}

// Assurance tuple
export function createAssurance(f, g, r) {
  return {
    F: f,  // Formality (0-4)
    G: g,  // Scope (ClaimScope)
    R: r,  // Reliability (0-1, computed)
    computed_at: new Date().toISOString()
  };
}

// Assurance для измерения
export function createMeasurementAssurance(measurement) {
  const f = measurement.verified ? FORMALITY.F3.value : FORMALITY.F1.value;
  const g = createClaimScope("ETL_Протоколы", { param_id: measurement.param_id });
  const r = measurement.evidence_path ? 
    computeReliability(measurement.evidence_path).r : 0;
  
  return createAssurance(f, g, r);
}