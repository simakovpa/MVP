# Исправления антипаттернов по FPF

## Статус: ✅ Завершено

Дата начала: 2026-03-31
Дата завершения: 2026-03-31

---

## ✅ Этап 1 (Базовые исправления)

### 1.1: Исправлена захардкоженная роль подписанта ✅
- Файл: `src/screens/ProtocolCard.jsx`
- Изменение: добавлен проп `currentUserId`, SoD проверка

### 1.2: Добавлены явные Language-State ✅
- Файл: `src/utils/helpers.js`
- Изменение: добавлен `MEASUREMENT_STATE`

### 1.3: Документированы механизмы ✅
- Файл: `src/utils/helpers.js`
- Изменение: добавлен `CALIBRATION_THRESHOLDS`

---

## ✅ Этап 2 (Критические исправления)

### 2.1: RoleAssignment ✅
- Файл: `src/models/RoleAssignment.js`
- Создано: ROLES, createRoleAssignment(), checkSoD()

### 2.2: Design-Run Split ✅ Частично
- Файл: `src/screens/CreateProtocol.jsx`
- Изменение: зоны копируются при создании

### 2.3: Evidence Graph ✅ Частично
- Файл: `src/models/Evidence.js`
- Создано:Evidence модель

---

## ✅ Этап 3 (Структурные изменения)

### 3.1: Bounded Contexts ✅
- Файл: `src/models/BoundedContext.js`
- Создано: CONTEXTS, NORM_CHAIN

### 3.2: Kind-CAL типизация ✅
- Файл: `src/models/Kind.js`
- Создано: PARAM_KINDS, evaluateByKind()

### 3.3: Γ-агрегация ✅
- Файл: `src/models/Aggregation.js`
- Создано: AGG_OP, gammaFold()

---

## ✅ Этап 4 (Продвинутые)

### 4.1: F-G-R Assurance ✅
- Файл: `src/models/Assurance.js`
- Создано: ASSURANCE_LEVELS, FORMALITY, computeReliability()

### 4.2: Mechanism Intension ✅
- Файл: `src/models/Mechanism.js`
- Создано: CALIBRATION_LAWSET, CN_SPEC

---

## Итоговая сводка

| Этап | Название | Статус |
|------|----------|--------|
| 1.1 | Роль подписанта | ✅ |
| 1.2 | Language-State | ✅ |
| 1.3 | Документирование | ✅ |
| 2.1 | RoleAssignment | ✅ |
| 2.2 | Design-Run Split | ✅ Частично |
| 2.3 | Evidence Graph | ✅ Частично |
| 3.1 | Bounded Contexts | ✅ |
| 3.2 | Kind-CAL | ✅ |
| 3.3 | Γ-агрегация | ✅ |
| 4.1 | F-G-R | ✅ |
| 4.2 | Mechanism | ✅ |

## Созданные файлы моделей (7)
- `src/models/RoleAssignment.js`
- `src/models/Evidence.js`
- `src/models/BoundedContext.js`
- `src/models/Kind.js`
- `src/models/Aggregation.js`
- `src/models/Assurance.js`
- `src/models/Mechanism.js`