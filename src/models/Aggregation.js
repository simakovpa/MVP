/**
 * Γ-агрегация по FPF (B.1)
 * Универсальный механизм агрегации
 */

// Γ-операторы
export const AGG_OP = {
  SUM: "Σ",      // сумма
  SET: "⋃",      // объединение
  SLICE: "⊓",   // пересечение
  WLNK: "⨂",    // взвешенная связь
};

// Агрегация протоколов
export function aggregateProtocols(protocols, op = AGG_OP.SET) {
  if (op === AGG_OP.SET) {
    return protocols.reduce((acc, p) => {
      acc.push(...p.rows);
      return acc;
    }, []);
  }
  return [];
}

// Агрегация результатов измерений
export function aggregateResults(rows, paramId, op = AGG_OP.SUM) {
  const filtered = rows.filter(r => r.param_id === paramId);
  
  if (op === AGG_OP.SUM) {
    return filtered.reduce((sum, r) => sum + (parseFloat(r.fact) || 0), 0);
  }
  if (op === AGG_OP.WLNK) {
    // Взвешенная связь — среднее с весами
    const total = filtered.reduce((acc, r) => {
      const weight = r.is_valid ? 1 : 0;
      return { sum: acc.sum + (parseFloat(r.fact) || 0) * weight, weight: acc.weight + weight };
    }, { sum: 0, weight: 0 });
    return total.weight > 0 ? total.sum / total.weight : null;
  }
  return filtered.map(r => r.fact);
}

// Γ-fold политики
export const GAMMA_POLICIES = {
  IDEM: "idential",      // идемпотентность
  COMM: "commutative",   // коммутативность
  LOC: "local",          // локальность
  WLNK: "weighted",      // взвешенность
  MONO: "monotonic",     // монотонность
};

// Γ-fold聚合 с политикой
export function gammaFold(rows, policy = GAMMA_POLICIES.LOC) {
  switch (policy) {
    case GAMMA_POLICIES.LOC:
      return rows.map(r => r.fact).filter(f => f != null);
    case GAMMA_POLICIES.WLNK:
      return aggregateResults(rows, null, AGG_OP.WLNK);
    default:
      return rows.map(r => r.fact);
  }
}