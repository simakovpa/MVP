// ─── RoleAssignment модель (FPF A.2, A.2.1) ─────────────────────────────────────────────
//
// Модель явного назначения ролей с контекстом и проверкой SoD
//

// Константы ролей (FPF A.2 Role Taxonomy)
export const ROLES = {
  EXECUTOR: "executor",      // Исполнитель измерений
  REVIEWER: "reviewer",      // Рецензент/проверяющий
  ADMIN: "admin",          // Администратор системы
};

// Создать RoleAssignment (FPF A.2.1 U.RoleAssignment)
export function createRoleAssignment(role, holder, context) {
  return {
    type: "U.RoleAssignment",
    role,
    holder,  // employee ID
    context, // protocol ID или null для системного контекста
    timestamp: new Date().toISOString(),
  };
}

// Проверить SoD (Separation of Duties) — исполнитель не может быть рецензентом
export function checkSoD(executorIds, reviewerId) {
  if (!reviewerId) return { valid: true };
  if (executorIds.includes(reviewerId)) {
    return {
      valid: false,
      error: "SoD violation: Исполнитель не может быть рецензентом",
    };
  }
  return { valid: true };
}

// Получить роль по умолчанию для prototype (для обратной совместимости)
export function getDefaultSigner() {
  // В production здесь должен быть currentUser из auth
  return "em1"; //first employee as default
}