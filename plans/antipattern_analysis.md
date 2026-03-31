# Анализ антипаттернов проекта "ЭТЛ Модуль"

## Введение

Данный анализ проведён в соответствии со спецификацией **First Principles Framework (FPF)** — фреймворком концептуального проектирования, основанным на принципах first principles thinking. Мы проверили проект на соответствие ключевым паттернам FPF и выявили антипаттерны — структурные решения, которые затрудняют эволюцию системы, нарушают разделение концептуальных сущностей или препятствуют аудируемости.

---

## Выявленные антипаттерны

### 1. Нарушение Strict Distinction (A.7) — смешение описания и экземпляра

**Локация:** [`src/data/mockData.js:20-27`](src/data/mockData.js:20)

**Описание:** Параметры измерений (PARAMS) содержат в одном объекте как метаданные (название, единица измерения), так и логику сравнения (`compare: "min|max|range"`). Это нарушает принцип **A.7 Strict Distinction** — фундаментальное разделение между **U.Type** (описанием типа) и его экземпляром.

```javascript
export const PARAMS = [
  { id: "pr1", name: "Сопр. изоляции (основная)", unit: "МОм", compare: "min" },
  //     ↑ описание типа              ↑ единица    ↑ поведение
];
```

**Проблема:** Логика сравнения — это поведение, которое должно быть отделено от описания характеристики. По FPF, **A.17 (CHR-NORM)** требует чёткого разделения между характеристикой и тем, как она оценивается.

**Рекомендация:** Ввести отдельную сущность `ParamKind` с полями:
- `id`, `name`, `unit` — описание
- `compareLogic` — ссылка на отдельный объект-правило сравнения

---

### 2. Отсутствие U.BoundedContext (A.1.1) — глобальные справочники без контекста

**Локация:** [`src/data/mockData.js:2-17`](src/data/mockData.js:2)

**Описание:** Справочники `EQUIP_TYPES`, `NOMENCLATURES` определены глобально без привязки к какому-либо **Bounded Context**. По FPF **A.1.1** требует, чтобы каждая сущность имела явный контекст использования.

**Антипаттерн:**

```javascript
export const EQUIP_TYPES = [  // ← глобальный, без контекста
  { id: "et1", name: "Трансформатор тока" },
];
export const NOMENCLATURES = [
  { id: "nm1", name: "ТФЗМ-110 кВ исп.У1", type_id: "et1", accepted: true },
];
```

**Проблемы:**
- Термин "accepted" не имеет явного владельца и критерия
- Номенклатура ссылается на тип, но неясно, в каком контексте эта связь валидна
- Нет механизма для кросс-контекстного маппинга (FPF **F.9** — Bridge)

**Рекомендация:** Обернуть справочники в контекстные структуры с явными инвариантами:
```javascript
export const EQUIP_TYPES_CONTEXT = {
  context: "ЭТЛ_Справочники",
  invariants: ["type_id уникален"],
  items: [...]
};
```

---

### 3. Неявная цепочка приоритетов норматива — нарушение Boundary Discipline (A.6)

**Локация:** [`src/screens/CreateProtocol.jsx:20-33`](src/screens/CreateProtocol.jsx:20)

**Описание:** Функция `findNorm()` реализует неявную цепочку приоритетов:

```javascript
function findNorm(paramId, equipObj, normRanges, passportNorms, overrides, params) {
  // Приоритет 1: Переопределение для ТМЦ
  const ov_tmcz = overrides.find(...);
  if (ov_tmcz) return { zones: ov_tmcz.zones, source: ... };
  
  // Приоритет 2: Переопределение для номенклатуры
  const ov_nm = overrides.find(...);
  // ... и так далее
}
```

**Проблемы по FPF:**
- **A.6.B** требует явной маршрутизации утверждений (L/A/D/E routing)
- Нет явного **Claim Register** — реестра требований
- Источник норматива (`source`) зашит в строку, а не в структурированную ссылку
- При изменении цепочки приоритетов нет механизма аудита (FPF **E.9** — DRR)

**Рекомендация:** Выделить цепочку приоритетов в отдельный механизм:
```javascript
const NORM_CHAIN = [
  { priority: 1, type: "override_tmcz", source: "bind_type=tmcz" },
  { priority: 2, type: "override_nomenclature", source: "bind_type=nomenclature" },
  { priority: 3, type: "passport", source: "nomenclature_ids[]" },
  { priority: 4, type: "norm_range", source: "type_id" },
];
```

---

### 4. Отсутствие RoleAssignment (A.2.1) — жёсткое кодирование ролей

**Локация:** [`src/screens/ProtocolCard.jsx:796`](src/screens/ProtocolCard.jsx:796)

**Описание:** При подписании протокола подписант захардкожен:

```javascript
transition("Подписан", { 
  conclusion_type: conclusionType, 
  conclusion_text: conclusionText,
  date_signed: new Date().toISOString().slice(0,10), 
  signed_by: "em1"  // ← захардкожено!
});
```

**Проблемы по FPF:**
- **A.2.1 (U.RoleAssignment)** требует явного назначения роли с указанием holder, role, context
- Нет Separation of Duties (SoD) — исполнитель не может быть подписантом
- Личность подписанта не верифицируется

**Рекомендация:** Ввести RoleAssignment:
```javascript
const signAction = {
  type: "U.RoleAssignment",
  role: "reviewer",
  holder: currentUser.id,
  context: protocol.id,
  timestamp: now(),
  evidence: { signature: "..." }
};
```

---

### 5. Нарушение Design-Run Split (A.4) — мутация данных в work

**Локация:** [`src/screens/ProtocolCard.jsx:266-267`](src/screens/ProtocolCard.jsx:266)

**Описание:** Статус строки пересчитывается при каждом изменении `fact`:

```javascript
const newRow = {...row, [field]: value};
if (field === "fact") 
  newRow.auto_status = newRow.zones?.length ? calcZoneStatus(value, newRow.zones) : null;
return newRow;
```

**Проблемы:**
- **A.4** требует разделения Design-Time (specification) и Run-Time (actuals)
- Здесь спецификация (нормативные зоны) смешивается с актуальными данными (fact)
- При изменении норматива прошлые измерения могут некорректно пересчитываться

**Рекомендация:** Разделить зоны и фактические значения:
```javascript
// Design-time (неизменяемо после создания протокола)
const measurementRow = {
  param_id: "pr1",
  norm_zones_id: "z1",  // ссылка на зону
  fact: 1500,           // значение
  measured_at: "2026-03-31"
};

// Run-time (вычисляется при отображении)
function calcStatus(row, zones) { ... }
```

---

### 6. Отсутствие Evidence Graph (A.10, G.6) — нет трассировки

**Локация:** [`src/components/shared.jsx:18-32`](src/components/shared.jsx:18)

**Описание:** `RowStatusBadge` показывает статус, но не связывает его с источником:

```javascript
export function RowStatusBadge({ row }) {
  const s = getEffectiveStatus(row);
  return (
    <Space size={4}>
      <Tag color={s.color}>{s.label}</Tag>
      {s.overridden && <Tooltip title={`Переопределено: ${row.manual_reason}`}>...</Tooltip>}
    </Space>
  );
}
```

**Проблемы:**
- **A.10** требует связи claims с evidence
- Нет ссылки на то, какой нормативный документ подтверждает зону
- Нет PathId/PathSliceId для аудита (FPF **G.6**)

**Рекомендация:**
```javascript
const row = {
  param_id: "pr1",
  fact: 1500,
  status_evidence: {
    zone_id: "z1",
    norm_doc_ref: "СТО 34.01-23.1-001-2017 п.10.1.1",
    path_id: "path_001",
    computed_by: "calcZoneStatus"
  }
};
```

---

### 7. Нарушение Kind-CAL (C.3) — слабая типизация

**Локация:** [`src/data/mockData.js:31-48`](src/data/mockData.js:31)

**Описание:** `WORK_TYPES` смешивает описание с привязками:

```javascript
export const WORK_TYPES = [
  { id: "wt1", name: "Измерение сопр. изоляции и tgδ", type: "Эксплуатационные",
    norm_doc: "ПТЭЭП Прил.3, СТО 34.01-23.1-001-2017 п.10",
    env_fields: { temp: true, humidity: true, pressure: false },
    params: [ { param_id: "pr1", order: 1 }, { param_id: "pr2", order: 2 } ] },
];
```

**Проблемы по FPF:**
- **C.3.1 (U.Kind)** требует явного определения Kind с intension и extension
- `params` — это массив ссылок без типизации (нарушение **C.3.2**)
- Нет KindBridge для кросс-контекстного маппинга

**Рекомендация:**
```javascript
const WorkTypeKind = {
  id: "wt1",
  name: "Измерение сопр. изоляции и tgδ",
  signature: {
    env_fields: "U.EnvFieldSet",
    params: "U.ParamRef[]"
  }
};
```

---

### 8. Отсутствие Language-State Discipline (C.2.2a)

**Локация:** [`src/utils/helpers.js:17-27`](src/utils/helpers.js:17)

**Описание:** Функция `calcZoneStatus` возвращает `null` для неопределённых состояний:

```javascript
export function calcZoneStatus(fact, zones) {
  if (fact === null || fact === undefined) return null;
  const f = parseFloat(fact);
  if (isNaN(f)) return null;
  // ...
  return null;  // ← неясно: это "ещё не измерено" или "невозможно определить"?
}
```

**Проблемы:**
- **C.2.2a** требует явной Language-State для каждого утверждения
- Нет разграничения между "не измерено", "измерено с ошибкой", "норматив не задан"
- Нет явного состояния зоны (открыто/закрыто)

**Рекомендация:** Ввести явные состояния:
```javascript
const LanguageState = {
  NOT_MEASURED: "не измерено",
  MEASURED: "измерено",
  NORM_UNDEFINED: "норматив не задан",
  ERROR: "ошибка измерения"
};
```

---

### 9. Нарушение агрегации (B.1) — нет универсального Γ

**Локация:** [`src/screens/HistoryScreen.jsx:77`](src/screens/HistoryScreen.jsx:77)

**Описание:** История собирается вручную, без формального механизма агрегации:

```javascript
function buildAllHistory(protocols) {
  const history = [];
  prot.rows.forEach(row => { ... });
  // ручная агрегация без правил
}
```

**Проблемы по FPF:**
- **B.1** требует формализованных правил агрегации (Γ-оператор)
- Нет учёта временного контекста (FPF **B.1.4** — Γ_time)
- Нет явных правил композиции для разных типов сущностей

**Рекомендация:** Определить Γ-правила:
```javascript
const GammaRules = {
  history: {
    compose: "append",
    order_matters: true,
    time_field: "date"
  }
};
```

---

### 10. Нарушение Trust & Assurance (B.3) — нет F-G-R

**Локация:** [`src/screens/ProtocolCard.jsx:264-267`](src/screens/ProtocolCard.jsx:264)

**Описание:** Статус вычисляется локально без оценки достоверности:

```javascript
const updateRow = (field, value) => {
  const newRow = {...row, [field]: value};
  if (field === "fact") 
    newRow.auto_status = calcZoneStatus(value, newRow.zones);
};
```

**Проблемы по FPF:**
- **B.3** требует оценки Formality (F), Scope (G), Reliability (R)
- Нет привязки к Evidence
- Нет механизма атрибуции (кто измерил, когда, каким прибором)

**Рекомендация:**
```javascript
const measuredRow = {
  fact: 1500,
  assurance: {
    F: "instrument_reading",     // уровень формальности
    G: "param_id:pr1",           // область применения
    R: {                         // достоверность
      instrument_id: "ins1",
      calibration_valid: true,
      method_id: "wt1"
    }
  }
};
```

---

### 11. Отсутствие Mechanism Intension (A.6.1) — неявная логика

**Локация:** [`src/utils/helpers.js:60-67`](src/utils/helpers.js:60)

**Описание:** `calStatus` вычисляет статус поверки прибора неявно:

```javascript
export function calStatus(ins) {
  if (!ins.date_next_cal) return "none";
  const next = new Date(ins.date_next_cal), now = new Date();
  const warn = new Date(); warn.setDate(warn.getDate() + 30);
  if (next <= now) return "expired";
  if (next <= warn) return "expiring";
  return "ok";
}
```

**Проблемы по FPF:**
- **A.6.1** требует явного Mechanism с LawSet и AdmissibilityConditions
- Порог "30 дней" захардкожен без документации
- Нет явного CN-Spec для Comparability Governance

**Рекомендация:**
```javascript
const CalibrationMechanism = {
  id: "cal_status",
  lawset: [
    { condition: "date_next_cal = null", result: "none" },
    { condition: "date_next_cal <= now", result: "expired" },
    { condition: "date_next_cal <= now + 30d", result: "expiring" },
    { condition: "otherwise", result: "ok" }
  ],
  threshold_window: 30  // дней
};
```

---

## Сводная таблица антипаттернов

| # | Антипаттерн | FPF Паттерн | Критичность | Трудоёмкость |
|---|-------------|-------------|-------------|--------------|
| 1 | Смешение описания и поведения | A.7, A.17 | Высокая | Средняя |
| 2 | Глобальные справочники без контекста | A.1.1 | Высокая | Высокая |
| 3 | Неявная цепочка приоритетов | A.6.B | Средняя | Низкая |
| 4 | Жёсткое кодирование ролей | A.2, A.2.1 | Высокая | Средняя |
| 5 | Мутация design-time данных | A.4 | Высокая | Высокая |
| 6 | Отсутствие Evidence Graph | A.10, G.6 | Средняя | Средняя |
| 7 | Слабая типизация | C.3 | Средняя | Высокая |
| 8 | Неявные Language-State | C.2.2a | Средняя | Низкая |
| 9 | Ручная агрегация | B.1 | Средняя | Высокая |
| 10 | Отсутствие F-G-R | B.3 | Высокая | Высокая |
| 11 | Неявная логика механизмов | A.6.1 | Низкая | Средняя |

---

## Рекомендации по приоритетам

### Приоритет 1 (критические — влияют на аудируемость и безопасность)

1. **Ввести RoleAssignment (A.2.1)** — убрать захардкоженного подписанта
2. **Разделить Design-Time и Run-Time (A.4)** — заморозить зоны при создании протокола
3. **Добавить Evidence Graph (A.10, G.6)** — связать измерения с приборами и нормативами

### Приоритет 2 (важные — влияют на эволюцию системы)

4. **Обернуть справочники в Bounded Contexts (A.1.1)**
5. **Типизировать сущности по Kind-CAL (C.3)**
6. **Вынести цепочку приоритетов в явный механизм (A.6)**

### Приоритет 3 (улучшения — повышают качество)

7. **Добавить Language-State для статусов (C.2.2a)**
8. **Формализовать агрегацию через Γ-правила (B.1)**
9. **Документировать механизмы через A.6.1**

---

## Заключение

Проект "ЭТЛ Модуль" демонстрирует типичные антипаттерны React-приложений, возникшие при быстрой разработке: глобальные справочники без контекста, неявная бизнес-логика, смешение слоёв данных. 

С точки зрения FPF, ключевые проблемы:
- **Нет явной онтологии** — сущности не типизированы по Kind-CAL
- **Нет аудируемости** — большая часть решений не имеет Evidence Graph
- **Нет эволюционной устойчивости** — изменения в одном месте могут сломать другое

Рекомендуется поэтапное внедрение улучшений, начиная с Приоритета 1, так как эти изменения обеспечивают базовую аудируемость, требуемую для нормативных систем.
