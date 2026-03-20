import { useState, useMemo, useCallback } from "react";
import {
  ConfigProvider, Layout, Menu, Table, Tag, Button, Space, Input, Select,
  Form, Modal, Drawer, Descriptions, Steps, Badge, Tooltip, Collapse,
  Typography, Divider, Row, Col, Card, InputNumber, Alert, Breadcrumb,
  Tabs, notification, Popconfirm, Empty, Switch, Radio, Segmented,
  List, Checkbox
} from "antd";
import {
  FileProtectOutlined, PlusOutlined, SearchOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ExclamationCircleOutlined, ArrowLeftOutlined,
  SendOutlined, EditOutlined, StopOutlined, BugOutlined, SettingOutlined,
  ThunderboltOutlined, ApartmentOutlined, HomeOutlined, WarningOutlined,
  SafetyCertificateOutlined, CalendarOutlined, InfoCircleOutlined,
  ReloadOutlined, DeleteOutlined, CheckOutlined, QuestionCircleOutlined,
  SwapOutlined, ControlOutlined, DatabaseOutlined, TeamOutlined,
  AuditOutlined
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

// ─── ТЕМА ────────────────────────────────────────────────────────────────────
const theme = {
  token: {
    colorPrimary: "#1a5fa8", colorBgContainer: "#ffffff",
    colorBgLayout: "#f0f2f5", borderRadius: 6,
    fontFamily: "'IBM Plex Sans','Segoe UI',sans-serif",
    fontSize: 13, colorTextBase: "#1a1a2e",
  },
  components: {
    Table: { headerBg: "#f0f4f8", borderColor: "#dde3ec", rowHoverBg: "#f5f8ff" },
    Menu: { itemBg: "#0f2744", itemColor: "#a8bdd4", itemHoverBg: "#1a3a5c",
            itemSelectedBg: "#1a5fa8", itemSelectedColor: "#ffffff", subMenuItemBg: "#0a1e35" },
  }
};

// ─── MOCK ДАННЫЕ ─────────────────────────────────────────────────────────────

// Типы ТМЦ
const EQUIP_TYPES = [
  { id: "et1", name: "Трансформатор тока" },
  { id: "et2", name: "Силовой трансформатор" },
  { id: "et3", name: "Вакуумный выключатель" },
  { id: "et4", name: "Опора ВЛ (деревянная)" },
];

// Номенклатуры
const NOMENCLATURES = [
  { id: "nm1", name: "ТФЗМ-110 кВ исп.У1", type_id: "et1", accepted: true },
  { id: "nm2", name: "ТФЗМ-35 кВ исп.У1",  type_id: "et1", accepted: false },
  { id: "nm3", name: "ТМН-6300/110",         type_id: "et2", accepted: true },
  { id: "nm4", name: "ТМ-400/10",             type_id: "et2", accepted: false },
  { id: "nm5", name: "BB/TEL-10-20/1000",    type_id: "et3", accepted: true },
  { id: "nm6", name: "ВЛ опора СВ110-3.5",   type_id: "et4", accepted: false },
];

// Параметры измерений
const PARAMS = [
  { id: "pr1", name: "Сопр. изоляции (основная)", unit: "МОм",  compare: "min" },
  { id: "pr2", name: "tgδ основной изоляции",     unit: "%",    compare: "max" },
  { id: "pr3", name: "Сопр. контура заземления",  unit: "Ом",   compare: "max" },
  { id: "pr4", name: "Ток утечки",                unit: "мА",   compare: "max" },
  { id: "pr5", name: "Напряжение испытания",       unit: "кВ",   compare: "exact" },
  { id: "pr6", name: "Сопр. обмотки пост. току",  unit: "мОм",  compare: "range" },
];

// Виды работ
const WORK_TYPES = [
  { id: "wt1", name: "Измерение сопр. изоляции и tgδ", type: "Эксплуатационные",
    norm_doc: "ПТЭЭП Прил.3, СТО 34.01-23.1-001-2017 п.10",
    params: [
      { param_id: "pr1", order: 1 },
      { param_id: "pr2", order: 2 },
    ]},
  { id: "wt2", name: "Испытание повышенным напряжением", type: "Эксплуатационные",
    norm_doc: "ПУЭ гл.1.8, СТО табл.9.1",
    params: [
      { param_id: "pr5", order: 1 },
      { param_id: "pr4", order: 2 },
    ]},
  { id: "wt3", name: "Измерение сопр. контура заземления", type: "Эксплуатационные",
    norm_doc: "ПУЭ п.1.7.101",
    params: [{ param_id: "pr3", order: 1 }]},
  { id: "wt4", name: "Приёмо-сдаточные испытания ТТ", type: "Приёмо-сдаточные",
    norm_doc: "ПТЭЭП Прил.3",
    params: [
      { param_id: "pr1", order: 1 },
      { param_id: "pr2", order: 2 },
      { param_id: "pr6", order: 3 },
    ]},
];

// Нормативные диапазоны (вкладка 2) — по типу ТМЦ + параметр
// zones: [{id, label, min, min_inc, max, max_inc, color}]
const initNormRanges = [
  {
    id: "nr1", type_id: "et1", param_id: "pr1", work_type_id: "wt1",
    source: "СТО 34.01-23.1-001-2017 табл.10.1.1",
    zones: [
      { id: "z1", label: "Норма",              min: 1000, min_inc: true,  max: null,  max_inc: false, color: "success" },
      { id: "z2", label: "Область риска",      min: 500,  min_inc: true,  max: 1000,  max_inc: false, color: "warning" },
      { id: "z3", label: "Предельное состояние", min: null, min_inc: false, max: 500, max_inc: false, color: "error" },
    ]
  },
  {
    id: "nr2", type_id: "et1", param_id: "pr2", work_type_id: "wt1",
    source: "СТО 34.01-23.1-001-2017 табл.10.1.2",
    zones: [
      { id: "z4", label: "Норма (ввод в экспл.)", min: null, min_inc: false, max: 2.5, max_inc: true, color: "success" },
      { id: "z5", label: "Допустимо (эксплуатация)", min: 2.5, min_inc: false, max: 8.0, max_inc: true, color: "warning" },
      { id: "z6", label: "Предельное состояние", min: 8.0, min_inc: false, max: null, max_inc: false, color: "error" },
    ]
  },
  {
    id: "nr3", type_id: "et4", param_id: "pr3", work_type_id: "wt3",
    source: "ПУЭ п.1.7.101",
    zones: [
      { id: "z7", label: "Норма",      min: null, min_inc: false, max: 4.0, max_inc: true,  color: "success" },
      { id: "z8", label: "Отклонение", min: 4.0,  min_inc: false, max: null, max_inc: false, color: "error" },
    ]
  },
];

// Паспортные нормативы (вкладка 3)
const initPassportNorms = [
  {
    id: "pn1", param_id: "pr1", source: "СТО табл.10.1.1 · заводской протокол",
    nomenclature_ids: ["nm1"],
    zones: [
      { id: "pz1", label: "Норма",              min: 3000, min_inc: true,  max: null, max_inc: false, color: "success" },
      { id: "pz2", label: "Область риска",      min: 1500, min_inc: true,  max: 3000, max_inc: false, color: "warning" },
      { id: "pz3", label: "Предельное состояние", min: null, min_inc: false, max: 1500, max_inc: false, color: "error" },
    ]
  },
];

// Переопределения (вкладка 4)
const initOverrides = [
  {
    id: "ov1", bind_type: "nomenclature", bind_id: "nm2",
    param_id: "pr1", action_type: "permanent", active: true,
    reason: "Партия ТФЗМ-35 кВ 2015 г.в. имеет пониженное качество изоляции. Норма ужесточена по распоряжению ГИ №47 от 12.01.2026.",
    author: "Соколов А.Н.", created: "2026-01-15",
    zones: [
      { id: "oz1", label: "Норма",      min: 2000, min_inc: true,  max: null, max_inc: false, color: "success" },
      { id: "oz2", label: "Риск",       min: 1000, min_inc: true,  max: 2000, max_inc: false, color: "warning" },
      { id: "oz3", label: "Недопустимо", min: null, min_inc: false, max: 1000, max_inc: false, color: "error" },
    ]
  },
];

const OBJECTS = [
  { id: "o1", name: "ПС 110/10 кВ «Северная»", type: "Подстанция" },
  { id: "o2", name: "ВЛ 10 кВ «Лесная» (фидер №3)", type: "Воздушная линия" },
  { id: "o3", name: "ТП-241 «Завод»", type: "ТП" },
];

const EQUIP_ON_OBJECTS = {
  o1: [
    { id: "eq1", name: "ТФЗМ-110 ячейка №1", serial: "Зав.№2019-4471", nm_id: "nm1", type_id: "et1" },
    { id: "eq2", name: "ТФЗМ-110 ячейка №2", serial: "Зав.№2019-4472", nm_id: "nm1", type_id: "et1" },
    { id: "eq3", name: "ТМН-6300/110 осн.",   serial: "Зав.№2015-0983", nm_id: "nm3", type_id: "et2" },
  ],
  o2: [],
  o3: [{ id: "eq4", name: "ТМ-400/10",        serial: "Зав.№2011-1122", nm_id: "nm4", type_id: "et2" }],
};

const TM_ON_OBJECTS = {
  o2: [
    { id: "tm1", name: "Опора №1 (анкерная)" },
    { id: "tm2", name: "Опора №2" },
    { id: "tm3", name: "Опора №3" },
    { id: "tm4", name: "Пролёт №1-2" },
  ],
  o1: [
    { id: "tm5", name: "Ячейка №1" },
    { id: "tm6", name: "Ячейка №2" },
  ],
  o3: [{ id: "tm7", name: "Основной трансформатор" }],
};

const LABS = [
  { id: "lab1", name: "ЭТЛ филиала АЭ",   type: "Собственная", cert: "№ЭТЛ-2024-0047", exp: "2026-12-31" },
  { id: "lab2", name: "ЭТЛ филиала АКЭ",  type: "Собственная", cert: "№ЭТЛ-2024-0051", exp: "2025-06-30" },
  { id: "lab3", name: 'ООО "ЭнергоТест"', type: "Подрядная",   cert: "№ЭТЛ-2023-0189", exp: "2027-03-15" },
];

const DEPTS = ["РЭС Северный", "РЭС Южный", "ПС Служба", "ЭТЛ"];

// ─── НАЧАЛЬНЫЕ ПРОТОКОЛЫ ─────────────────────────────────────────────────────
const mkRow = (id, param_id, zones_for_param, fact = null, note = "") => {
  const param = PARAMS.find(p => p.id === param_id);
  return { id, param_id, param_name: param.name, unit: param.unit,
    zones: zones_for_param, norm_source: "", fact, note,
    auto_status: fact !== null && zones_for_param?.length ? calcZoneStatus(fact, zones_for_param) : null,
    manual_status: null, manual_reason: "", is_overridden: false };
};

function calcZoneStatus(fact, zones) {
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

function getEffectiveStatus(row) {
  if (row.manual_status) return { label: row.manual_status, color: "processing", overridden: true };
  if (row.fact === null || row.fact === undefined || row.fact === "") return { label: "Не измерено", color: "default", system: true };
  if (!row.zones || row.zones.length === 0) return { label: "Не определено", color: "default", system: true, undefined: true };
  const z = calcZoneStatus(row.fact, row.zones);
  if (!z) return { label: "Не определено", color: "default", system: true, undefined: true };
  return { label: z.label, color: z.color, zoneId: z.id };
}

// Нормативы для протоколов — упрощённо встроены
const NR1_ZONES = [
  { id: "z1", label: "Норма",              min: 3000, min_inc: true,  max: null,  max_inc: false, color: "success" },
  { id: "z2", label: "Область риска",      min: 1500, min_inc: true,  max: 3000,  max_inc: false, color: "warning" },
  { id: "z3", label: "Предельное состояние", min: null, min_inc: false, max: 1500, max_inc: false, color: "error" },
];
const NR2_ZONES = [
  { id: "z4", label: "Норма (ввод в экспл.)", min: null, min_inc: false, max: 2.5, max_inc: true, color: "success" },
  { id: "z5", label: "Допустимо (эксплуатация)", min: 2.5, min_inc: false, max: 8.0, max_inc: true, color: "warning" },
  { id: "z6", label: "Предельное состояние", min: 8.0, min_inc: false, max: null, max_inc: false, color: "error" },
];

let _uid = 200;
const uid = () => `id_${++_uid}`;
const genNum = (prots) => {
  const y = 2026;
  const n = prots.filter(p => p.number.startsWith(`ПИМ-${y}`)).length;
  return `ПИМ-${y}-${String(n + 1).padStart(5, "0")}`;
};
const nowStr = () => new Date().toLocaleString("ru-RU",
  { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(",", "");

const initProtocols = [
  {
    id: "p1", number: "ПИМ-2026-00001", date_created: "2026-03-10", date_measured: "2026-03-10",
    object_id: "o1", work_type_id: "wt1", test_type: "Эксплуатационные",
    lab_id: "lab1", department: "РЭС Северный", executor: "Петров И.В.",
    mode: "equipment", equip_id: "eq1", temp: 12, humidity: 65, voltage_test: null,
    status: "Подписан", date_signed: "2026-03-12", signed_by: "Соколов А.Н.",
    conclusion_type: "Соответствует НТД", conclusion_text: "Изоляция в норме.",
    cancel_reason: null, defects: [],
    rows: [
      { ...mkRow("r1", "pr1", NR1_ZONES, 4800, ""), norm_source: "Паспортный норматив · ТФЗМ-110 кВ исп.У1" },
      { ...mkRow("r2", "pr2", NR2_ZONES, 1.8, ""),  norm_source: "Паспортный норматив · ТФЗМ-110 кВ исп.У1" },
    ],
    history: [
      { date: "2026-03-10 09:15", user: "Петров И.В.", action: "Создан (Черновик)" },
      { date: "2026-03-11 16:30", user: "Петров И.В.", action: "Отправлен на проверку" },
      { date: "2026-03-12 10:05", user: "Соколов А.Н.", action: "Подписан" },
    ]
  },
  {
    id: "p2", number: "ПИМ-2026-00002", date_created: "2026-03-15", date_measured: "2026-03-14",
    object_id: "o1", work_type_id: "wt1", test_type: "Эксплуатационные",
    lab_id: "lab1", department: "ПС Служба", executor: "Иванова М.С.",
    mode: "equipment", equip_id: "eq2", temp: 8, humidity: 78, voltage_test: null,
    status: "На проверке", date_signed: null, signed_by: null,
    conclusion_type: null, conclusion_text: "", cancel_reason: null, defects: [],
    rows: [
      { ...mkRow("r3", "pr1", NR1_ZONES, 1200, ""),
        norm_source: "Паспортный норматив · ТФЗМ-110 кВ исп.У1" },
      { ...mkRow("r4", "pr2", NR2_ZONES, 9.5, "Значение превысило допустимое."),
        norm_source: "Паспортный норматив · ТФЗМ-110 кВ исп.У1",
        manual_status: "Предельное состояние", manual_reason: "Подтверждено визуальным осмотром — следы перегрева.", is_overridden: true },
    ],
    history: [
      { date: "2026-03-15 08:00", user: "Иванова М.С.", action: "Создан (Черновик)" },
      { date: "2026-03-15 17:50", user: "Иванова М.С.", action: "Отправлен на проверку" },
    ]
  },
  {
    id: "p3", number: "ПИМ-2026-00003", date_created: "2026-03-18", date_measured: "2026-03-18",
    object_id: "o2", work_type_id: "wt3", test_type: "Эксплуатационные",
    lab_id: "lab1", department: "РЭС Северный", executor: "Сидоров В.П.",
    mode: "tm_list", equip_id: null, temp: 4, humidity: 55, voltage_test: null,
    status: "Черновик", date_signed: null, signed_by: null,
    conclusion_type: null, conclusion_text: "", cancel_reason: null, defects: [],
    tm_groups: [
      { tm_id: "tm1", tm_name: "Опора №1 (анкерная)",
        rows: [{ ...mkRow("r5", "pr3",
          [{ id:"z7",label:"Норма",min:null,min_inc:false,max:4.0,max_inc:true,color:"success"},
           { id:"z8",label:"Отклонение",min:4.0,min_inc:false,max:null,max_inc:false,color:"error"}],
          3.2, ""), norm_source: "Норм. диапазон · Опора ВЛ (деревянная)" }] },
      { tm_id: "tm2", tm_name: "Опора №2",
        rows: [{ ...mkRow("r6", "pr3", [], null, ""),
          norm_source: "" }] },
    ],
    history: [{ date: "2026-03-18 11:00", user: "Сидоров В.П.", action: "Создан (Черновик)" }]
  },
];

// ─── УТИЛИТЫ ─────────────────────────────────────────────────────────────────
const statusCfg = {
  "Черновик":    { color: "default",    step: 0 },
  "На проверке": { color: "processing", step: 1 },
  "Подписан":    { color: "success",    step: 2 },
  "Аннулирован": { color: "error",      step: 2 },
};
const conclusionCfg = {
  "Соответствует НТД":        { color: "success" },
  "Не соответствует НТД":     { color: "error" },
  "Частичное несоответствие": { color: "warning" },
};

function countBadRows(prot) {
  const allRows = prot.mode === "tm_list"
    ? (prot.tm_groups || []).flatMap(g => g.rows)
    : (prot.rows || []);
  return allRows.filter(r => {
    const s = getEffectiveStatus(r);
    return s.color === "error" || s.color === "warning";
  }).length;
}

function zoneLabel(zones) {
  if (!zones || zones.length === 0) return "—";
  return zones.map(z => {
    const lo = z.min !== null ? `${z.min_inc ? "≥" : ">"}${z.min}` : "";
    const hi = z.max !== null ? `${z.max_inc ? "≤" : "<"}${z.max}` : "";
    const range = [lo, hi].filter(Boolean).join(" и ");
    return `${z.label}: ${range || "любое"}`;
  }).join(" | ");
}

// ─── StatusTag ───────────────────────────────────────────────────────────────
function StatusTag({ status }) {
  const cfg = statusCfg[status] || { color: "default" };
  return <Tag color={cfg.color} style={{ fontWeight: 600, fontSize: 12 }}>{status}</Tag>;
}

// ─── RowStatusBadge ──────────────────────────────────────────────────────────
function RowStatusBadge({ row }) {
  const s = getEffectiveStatus(row);
  return (
    <Space size={4}>
      <Tag color={s.color} style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>{s.label}</Tag>
      {s.overridden && <Tooltip title={`Переопределено: ${row.manual_reason}`}><SwapOutlined style={{ color: "#fa8c16", fontSize: 12 }} /></Tooltip>}
      {s.undefined && <Tooltip title="Норматив не задан — укажите статус вручную"><QuestionCircleOutlined style={{ color: "#8c8c8c", fontSize: 12 }} /></Tooltip>}
    </Space>
  );
}

// ─── NormSourceBadge ─────────────────────────────────────────────────────────
function NormSourceBadge({ source }) {
  if (!source) return <Text type="secondary" style={{ fontSize: 11 }}>—</Text>;
  const [kind, ...rest] = source.split(" · ");
  const colors = {
    "Переопределение": "volcano",
    "Паспортный норматив": "geekblue",
    "Норм. диапазон": "cyan",
  };
  return (
    <Tooltip title={source}>
      <Tag color={colors[kind] || "default"} style={{ fontSize: 10, cursor: "help" }}>
        {kind}
      </Tag>
    </Tooltip>
  );
}

// ─── ZoneEditor — редактор диапазонов ────────────────────────────────────────
function ZoneEditor({ zones, onChange }) {
  const colorOpts = [
    { label: "Норма (зелёный)", value: "success" },
    { label: "Риск (жёлтый)",   value: "warning" },
    { label: "Критично (красный)", value: "error" },
    { label: "Инфо (синий)",    value: "processing" },
  ];

  const addZone = () => {
    onChange([...zones, { id: uid(), label: "Новый статус", min: null, min_inc: true, max: null, max_inc: true, color: "success" }]);
  };
  const del = (id) => onChange(zones.filter(z => z.id !== id));
  const upd = (id, field, val) => onChange(zones.map(z => z.id === id ? { ...z, [field]: val } : z));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {zones.map((z, i) => (
        <div key={z.id} style={{
          display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap",
          padding: "8px 10px", borderRadius: 6, background: "#fafafa",
          border: "1px solid #e8e8e8"
        }}>
          <Input value={z.label} onChange={e => upd(z.id, "label", e.target.value)}
            placeholder="Наименование статуса" style={{ width: 180, fontSize: 12 }} size="small"/>
          <Select value={z.color} onChange={v => upd(z.id, "color", v)} style={{ width: 150 }} size="small">
            {colorOpts.map(o => <Option key={o.value} value={o.value}><Tag color={o.color}>{o.label}</Tag></Option>)}
          </Select>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Select value={z.min_inc ? ">=" : ">"} onChange={v => upd(z.id, "min_inc", v === ">=")} style={{ width: 56 }} size="small">
              <Option value=">=">&ge;</Option><Option value=">">{">"}</Option>
            </Select>
            <InputNumber value={z.min} onChange={v => upd(z.id, "min", v)} placeholder="мин" style={{ width: 80 }} size="small"/>
            <Text style={{ fontSize: 11, color: "#888" }}>и</Text>
            <Select value={z.max_inc ? "<=" : "<"} onChange={v => upd(z.id, "max_inc", v === "<=")} style={{ width: 56 }} size="small">
              <Option value="<=">&le;</Option><Option value="<">{"<"}</Option>
            </Select>
            <InputNumber value={z.max} onChange={v => upd(z.id, "max", v)} placeholder="макс" style={{ width: 80 }} size="small"/>
          </div>
          <Button danger size="small" icon={<DeleteOutlined />} onClick={() => del(z.id)} />
        </div>
      ))}
      <Button size="small" icon={<PlusOutlined />} onClick={addZone} style={{ alignSelf: "flex-start" }}>
        Добавить диапазон
      </Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ЭКРАН: СПРАВОЧНИК НОРМАТИВОВ
// ═══════════════════════════════════════════════════════════════════
function NormativesScreen({ normRanges, setNormRanges, passportNorms, setPassportNorms, overrides, setOverrides, nomenclatures, setNomenclatures, workTypes, setWorkTypes, params, setParams }) {
  const [api, ctx] = notification.useNotification();
  const [tab, setTab] = useState("work_types");

  // helpers
  const compareLabels = { min: "Не менее (≥)", max: "Не более (≤)", exact: "Точное (=)", range: "Диапазон" };
  const testTypes = ["Эксплуатационные", "Приёмо-сдаточные", "Внеплановые", "Контрольные"];

  // ─── Вкладка 1а: Справочник параметров ─────────────────────────────
  const [editParam, setEditParam] = useState(null); // null | "new" | id
  const emptyParam = { name: "", unit: "", compare: "min", archived: false };
  const [paramForm, setParamForm] = useState(emptyParam);

  // ─── Вкладка 1б: Виды работ ─────────────────────────────────────────
  const [editWT, setEditWT] = useState(null); // null | "new" | id
  const emptyWT = { name: "", type: "Эксплуатационные", norm_doc: "", archived: false, params: [] };
  const [wtForm, setWtForm] = useState(emptyWT);

  const moveWtParam = (idx, dir) => {
    const arr = [...wtForm.params];
    const t = idx + dir;
    if (t < 0 || t >= arr.length) return;
    [arr[idx], arr[t]] = [arr[t], arr[idx]];
    setWtForm(f => ({ ...f, params: arr }));
  };

  // --- Вкладка 1: Виды работ и параметры — два подраздела ---
  const Tab1 = (
    <Tabs
      defaultActiveKey="wt"
      type="card"
      size="small"
      items={[
        {
          key: "wt",
          label: "Виды работ",
          children: (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Шаблоны протоколов — определяют набор параметров</Text>
                <Button size="small" type="primary" icon={<PlusOutlined />}
                  onClick={() => { setEditWT("new"); setWtForm({ ...emptyWT, params: [] }); }}>
                  Добавить вид работы
                </Button>
              </div>
              <Table
                dataSource={workTypes}
                rowKey="id"
                size="small"
                pagination={false}
                style={{ borderRadius: 8 }}
                rowClassName={r => r.archived ? "row-archived" : ""}
                expandable={{
                  expandedRowRender: r => (
                    <div style={{ paddingLeft: 24, paddingBottom: 8 }}>
                      {r.params.length === 0
                        ? <Text type="secondary" style={{ fontSize: 12 }}>Параметры не добавлены</Text>
                        : r.params.map((pt, i) => {
                            const pr = params.find(p => p.id === pt.param_id);
                            return (
                              <Tag key={pt.param_id} style={{ marginBottom: 4, fontSize: 11 }}>
                                {i + 1}. {pr?.name} ({pr?.unit})
                              </Tag>
                            );
                          })
                      }
                    </div>
                  ),
                }}
                columns={[
                  { title: "Вид работы", dataIndex: "name", key: "n",
                    render: (v, r) => (
                      <Space>
                        <Text strong style={{ fontSize: 12, color: r.archived ? "#aaa" : undefined }}>{v}</Text>
                        {r.archived && <Tag style={{ fontSize: 10 }}>архив</Tag>}
                      </Space>
                    )},
                  { title: "Тип испытаний", dataIndex: "type", key: "t",
                    render: (v, r) => <Tag color={r.archived ? "default" : "blue"} style={{ fontSize: 10 }}>{v}</Tag> },
                  { title: "НТД", dataIndex: "norm_doc", key: "nd",
                    render: v => <Text type="secondary" style={{ fontSize: 11 }}>{v || "—"}</Text> },
                  { title: "Параметров", key: "pc", width: 90,
                    render: (_, r) => <Badge count={r.params.length} color="#1a5fa8" showZero /> },
                  { title: "", key: "act", width: 80,
                    render: (_, r) => (
                      <Space size={0}>
                        <Tooltip title="Редактировать">
                          <Button size="small" type="text" icon={<EditOutlined />}
                            onClick={() => { setEditWT(r.id); setWtForm({ ...r, params: r.params.map(p => ({ ...p })) }); }} />
                        </Tooltip>
                        <Tooltip title={r.archived ? "Восстановить" : "Архивировать"}>
                          <Button size="small" type="text"
                            icon={r.archived
                              ? <CheckOutlined style={{ color: "#389e0d" }} />
                              : <StopOutlined style={{ color: "#aaa" }} />}
                            onClick={() => setWorkTypes(prev => prev.map(w => w.id === r.id ? { ...w, archived: !w.archived } : w))}
                          />
                        </Tooltip>
                      </Space>
                    )},
                ]}
              />

              {/* Модал создания/редактирования вида работы */}
              <Modal
                open={!!editWT}
                title={editWT === "new" ? "Новый вид работы" : "Редактировать вид работы"}
                width={640}
                onOk={() => {
                  if (!wtForm.name.trim()) { api.warning({ message: "Укажите наименование" }); return; }
                  if (editWT === "new") {
                    setWorkTypes(prev => [...prev, { ...wtForm, id: uid() }]);
                  } else {
                    setWorkTypes(prev => prev.map(w => w.id === editWT ? { ...w, ...wtForm } : w));
                  }
                  setEditWT(null);
                  api.success({ message: "Сохранено", duration: 2 });
                }}
                onCancel={() => setEditWT(null)}
                okText="Сохранить"
              >
                <Form layout="vertical" style={{ marginTop: 8 }}>
                  <Form.Item label="Наименование *">
                    <Input value={wtForm.name}
                      onChange={e => setWtForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="напр.: Измерение сопр. изоляции и tgδ" />
                  </Form.Item>
                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item label="Тип испытаний">
                        <Select value={wtForm.type} onChange={v => setWtForm(f => ({ ...f, type: v }))}>
                          {testTypes.map(t => <Option key={t}>{t}</Option>)}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Ссылка на НТД">
                        <Input value={wtForm.norm_doc}
                          onChange={e => setWtForm(f => ({ ...f, norm_doc: e.target.value }))}
                          placeholder="напр.: ПТЭЭП Прил.3, СТО 34.01 п.10" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label="Состав параметров">
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 8 }}>
                      {wtForm.params.length === 0 &&
                        <Text type="secondary" style={{ fontSize: 12 }}>Добавьте параметры из справочника</Text>}
                      {wtForm.params.map((pt, i) => {
                        const pr = params.find(p => p.id === pt.param_id);
                        return (
                          <div key={pt.param_id} style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "6px 10px", borderRadius: 6,
                            background: "#f5f8ff", border: "1px solid #dde3ec"
                          }}>
                            <Text style={{ fontSize: 11, color: "#888", minWidth: 18 }}>{i + 1}.</Text>
                            <Text style={{ flex: 1, fontSize: 12 }}>
                              {pr?.name} <Text type="secondary">({pr?.unit})</Text>
                            </Text>
                            <Space size={2}>
                              <Button size="small" type="text" disabled={i === 0}
                                onClick={() => moveWtParam(i, -1)}>↑</Button>
                              <Button size="small" type="text" disabled={i === wtForm.params.length - 1}
                                onClick={() => moveWtParam(i, 1)}>↓</Button>
                              <Button size="small" type="text" danger icon={<DeleteOutlined />}
                                onClick={() => setWtForm(f => ({ ...f, params: f.params.filter(p => p.param_id !== pt.param_id) }))} />
                            </Space>
                          </div>
                        );
                      })}
                    </div>
                    <Select
                      placeholder="Добавить параметр из справочника..."
                      style={{ width: "100%" }}
                      value={null}
                      onChange={v => {
                        if (wtForm.params.find(p => p.param_id === v)) {
                          api.warning({ message: "Параметр уже добавлен", duration: 2 }); return;
                        }
                        setWtForm(f => ({ ...f, params: [...f.params, { param_id: v, order: f.params.length + 1 }] }));
                      }}
                    >
                      {params
                        .filter(p => !p.archived && !wtForm.params.find(pt => pt.param_id === p.id))
                        .map(p => <Option key={p.id} value={p.id}>{p.name} ({p.unit})</Option>)}
                    </Select>
                  </Form.Item>
                </Form>
              </Modal>

              <style>{`.row-archived td { opacity: 0.45; }`}</style>
            </div>
          ),
        },
        {
          key: "params",
          label: "Измеряемые параметры",
          children: (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Справочник параметров — используются в видах работ</Text>
                <Button size="small" type="primary" icon={<PlusOutlined />}
                  onClick={() => { setEditParam("new"); setParamForm({ ...emptyParam }); }}>
                  Добавить параметр
                </Button>
              </div>
              <Table
                dataSource={params}
                rowKey="id"
                size="small"
                pagination={false}
                style={{ borderRadius: 8, maxWidth: 680 }}
                rowClassName={r => r.archived ? "row-archived" : ""}
                columns={[
                  { title: "Наименование", dataIndex: "name", key: "n",
                    render: (v, r) => (
                      <Space>
                        <Text style={{ fontSize: 12, color: r.archived ? "#aaa" : undefined }}>{v}</Text>
                        {r.archived && <Tag style={{ fontSize: 10 }}>архив</Tag>}
                      </Space>
                    )},
                  { title: "Ед. изм.", dataIndex: "unit", key: "u", width: 80,
                    render: v => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> },
                  { title: "Тип сравнения", dataIndex: "compare", key: "c", width: 160,
                    render: v => <Tag style={{ fontSize: 11 }}>{compareLabels[v]}</Tag> },
                  { title: "Используется в", key: "usage", width: 200,
                    render: (_, r) => {
                      const uses = workTypes.filter(w => w.params.find(p => p.param_id === r.id));
                      return uses.length === 0
                        ? <Text type="secondary" style={{ fontSize: 11 }}>—</Text>
                        : uses.map(w => <Tag key={w.id} style={{ fontSize: 10, marginBottom: 2 }}>{w.name}</Tag>);
                    }},
                  { title: "", key: "act", width: 80,
                    render: (_, r) => (
                      <Space size={0}>
                        <Tooltip title="Редактировать">
                          <Button size="small" type="text" icon={<EditOutlined />}
                            onClick={() => { setEditParam(r.id); setParamForm({ ...r }); }} />
                        </Tooltip>
                        <Tooltip title={r.archived ? "Восстановить" : "Архивировать"}>
                          <Button size="small" type="text"
                            icon={r.archived
                              ? <CheckOutlined style={{ color: "#389e0d" }} />
                              : <StopOutlined style={{ color: "#aaa" }} />}
                            onClick={() => setParams(prev => prev.map(p => p.id === r.id ? { ...p, archived: !p.archived } : p))}
                          />
                        </Tooltip>
                      </Space>
                    )},
                ]}
              />

              {/* Модал создания/редактирования параметра */}
              <Modal
                open={!!editParam}
                title={editParam === "new" ? "Новый параметр" : "Редактировать параметр"}
                onOk={() => {
                  if (!paramForm.name.trim() || !paramForm.unit.trim()) {
                    api.warning({ message: "Заполните наименование и единицу измерения" }); return;
                  }
                  if (editParam === "new") {
                    setParams(prev => [...prev, { ...paramForm, id: uid() }]);
                  } else {
                    setParams(prev => prev.map(p => p.id === editParam ? { ...p, ...paramForm } : p));
                  }
                  setEditParam(null);
                  api.success({ message: "Параметр сохранён", duration: 2 });
                }}
                onCancel={() => setEditParam(null)}
                okText="Сохранить"
              >
                <Form layout="vertical" style={{ marginTop: 8 }}>
                  <Form.Item label="Наименование *">
                    <Input value={paramForm.name}
                      onChange={e => setParamForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="напр.: Сопр. изоляции (основная)" />
                  </Form.Item>
                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item label="Единица измерения *">
                        <Input value={paramForm.unit}
                          onChange={e => setParamForm(f => ({ ...f, unit: e.target.value }))}
                          placeholder="напр.: МОм, %, Ом, кВ" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Тип сравнения с нормой">
                        <Select value={paramForm.compare}
                          onChange={v => setParamForm(f => ({ ...f, compare: v }))}>
                          {Object.entries(compareLabels).map(([k, v]) =>
                            <Option key={k} value={k}>{v}</Option>)}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  {editParam !== "new" && (() => {
                    const uses = workTypes.filter(w => w.params.find(p => p.param_id === editParam));
                    return uses.length > 0 ? (
                      <Alert type="info" showIcon style={{ marginTop: 4 }}
                        message={`Используется в ${uses.length} вид(ах) работ: ${uses.map(w => w.name).join(", ")}`} />
                    ) : null;
                  })()}
                </Form>
              </Modal>
            </div>
          ),
        },
      ]}
    />
  );

  // --- Вкладка 2: Нормативные диапазоны ---
  const [editNr, setEditNr] = useState(null);
  const [nrForm, setNrForm] = useState({ type_id: "", param_id: "", work_type_id: "", source: "", zones: [] });

  const Tab2 = (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>Диапазоны по типу ТМЦ · источник: ПУЭ, ПТЭЭП, СТО</Text>
        <Button size="small" type="primary" icon={<PlusOutlined />}
          onClick={() => { setEditNr("new"); setNrForm({ type_id: "", param_id: "", work_type_id: "", source: "", zones: [] }); }}>
          Добавить
        </Button>
      </div>
      <Table dataSource={normRanges} rowKey="id" size="small" pagination={false} style={{ borderRadius: 8 }}
        columns={[
          { title: "Тип ТМЦ", dataIndex: "type_id", key: "t", render: v => EQUIP_TYPES.find(x => x.id === v)?.name },
          { title: "Параметр", dataIndex: "param_id", key: "p", render: v => {
            const pr = params.find(x => x.id === v); return `${pr?.name} (${pr?.unit})`;
          }},
          { title: "Источник НТД", dataIndex: "source", key: "s", render: v => <Text type="secondary" style={{ fontSize: 11 }}>{v}</Text> },
          { title: "Диапазоны", key: "z", render: (_, r) =>
            r.zones.map(z => <Tag key={z.id} color={z.color} style={{ fontSize: 10, marginBottom: 2 }}>{z.label}</Tag>)
          },
          { title: "", key: "act", width: 60, render: (_, r) =>
            <Button size="small" icon={<EditOutlined />} type="text"
              onClick={() => { setEditNr(r.id); setNrForm({ ...r, zones: r.zones.map(z => ({...z})) }); }} />
          },
        ]}
      />
      <Modal open={!!editNr} title={editNr === "new" ? "Новый нормативный диапазон" : "Редактировать диапазон"}
        width={760}
        onOk={() => {
          if (editNr === "new") {
            setNormRanges(prev => [...prev, { ...nrForm, id: uid() }]);
          } else {
            setNormRanges(prev => prev.map(x => x.id === editNr ? { ...x, ...nrForm } : x));
          }
          setEditNr(null);
          api.success({ message: "Сохранено", duration: 2 });
        }}
        onCancel={() => setEditNr(null)} okText="Сохранить">
        <Form layout="vertical" style={{ marginTop: 8 }}>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item label="Тип ТМЦ *">
                <Select value={nrForm.type_id} onChange={v => setNrForm(f => ({...f, type_id: v}))}>
                  {EQUIP_TYPES.map(t => <Option key={t.id} value={t.id}>{t.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Параметр *">
                <Select value={nrForm.param_id} onChange={v => setNrForm(f => ({...f, param_id: v}))}>
                  {params.map(p => <Option key={p.id} value={p.id}>{p.name} ({p.unit})</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Источник НТД">
                <Input value={nrForm.source} onChange={e => setNrForm(f => ({...f, source: e.target.value}))} placeholder="напр.: СТО 34.01 табл.10.1.1"/>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Диапазоны зон *">
            <ZoneEditor zones={nrForm.zones} onChange={z => setNrForm(f => ({...f, zones: z}))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );

  // --- Вкладка 3: Паспортные нормативы + очередь ---
  const [editPn, setEditPn] = useState(null);
  const [pnForm, setPnForm] = useState({ param_id: "", source: "", nomenclature_ids: [], zones: [] });

  const newNoms = nomenclatures.filter(n => !n.accepted);

  const Tab3 = (
    <div>
      <Alert type="info" showIcon style={{ marginBottom: 12 }}
        message={newNoms.length > 0
          ? `${newNoms.length} номенклатур ожидают рассмотрения лабораторией`
          : "Все номенклатуры рассмотрены лабораторией"}
        description={newNoms.length > 0 ? "Прокрутите вниз — раздел «Очередь новых номенклатур»" : null}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>Нормативы по данным производителя · привязка к номенклатурам</Text>
        <Button size="small" type="primary" icon={<PlusOutlined />}
          onClick={() => { setEditPn("new"); setPnForm({ param_id: "", source: "", nomenclature_ids: [], zones: [] }); }}>
          Добавить
        </Button>
      </div>
      <Table dataSource={passportNorms} rowKey="id" size="small" pagination={false} style={{ borderRadius: 8 }}
        columns={[
          { title: "Параметр", dataIndex: "param_id", key: "p", render: v => {
            const pr = params.find(x => x.id === v); return `${pr?.name} (${pr?.unit})`;
          }},
          { title: "Источник", dataIndex: "source", key: "s", render: v => <Text type="secondary" style={{ fontSize: 11 }}>{v}</Text> },
          { title: "Номенклатуры", key: "nm", render: (_, r) =>
            r.nomenclature_ids.map(id => {
              const nm = NOMENCLATURES.find(x => x.id === id);
              return <Tag key={id} color="geekblue" style={{ fontSize: 11, marginBottom: 2 }}>{nm?.name}</Tag>;
            })
          },
          { title: "Диапазоны", key: "z", render: (_, r) =>
            r.zones.map(z => <Tag key={z.id} color={z.color} style={{ fontSize: 10, marginBottom: 2 }}>{z.label}</Tag>)
          },
          { title: "", key: "act", width: 60, render: (_, r) =>
            <Button size="small" icon={<EditOutlined />} type="text"
              onClick={() => { setEditPn(r.id); setPnForm({ ...r, zones: r.zones.map(z => ({...z})) }); }} />
          },
        ]}
      />
      <Modal open={!!editPn} title={editPn === "new" ? "Новый паспортный норматив" : "Редактировать"} width={760}
        onOk={() => {
          const save = editPn === "new"
            ? [...passportNorms, { ...pnForm, id: uid() }]
            : passportNorms.map(x => x.id === editPn ? { ...x, ...pnForm } : x);
          setPassportNorms(save);
          setNomenclatures(prev => prev.map(n =>
            pnForm.nomenclature_ids.includes(n.id) ? { ...n, accepted: true } : n));
          setEditPn(null);
          api.success({ message: "Сохранено. Флаг «принято лабораторией» установлен.", duration: 3 });
        }}
        onCancel={() => setEditPn(null)} okText="Сохранить">
        <Form layout="vertical" style={{ marginTop: 8 }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Параметр *">
                <Select value={pnForm.param_id} onChange={v => setPnForm(f => ({...f, param_id: v}))}>
                  {params.map(p => <Option key={p.id} value={p.id}>{p.name} ({p.unit})</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Источник (заводской документ, СТО)">
                <Input value={pnForm.source} onChange={e => setPnForm(f => ({...f, source: e.target.value}))}/>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Номенклатуры *">
            <Select mode="multiple" value={pnForm.nomenclature_ids}
              onChange={v => setPnForm(f => ({...f, nomenclature_ids: v}))}
              placeholder="Выберите одну или несколько номенклатур">
              {NOMENCLATURES.map(n => {
                const t = EQUIP_TYPES.find(x => x.id === n.type_id);
                return <Option key={n.id} value={n.id}>{n.name} <Text type="secondary" style={{ fontSize: 11 }}>({t?.name})</Text></Option>;
              })}
            </Select>
          </Form.Item>
          <Form.Item label="Диапазоны зон *">
            <ZoneEditor zones={pnForm.zones} onChange={z => setPnForm(f => ({...f, zones: z}))} />
          </Form.Item>
        </Form>
      </Modal>

      {newNoms.length > 0 && (
        <>
          <Divider orientation="left" style={{ fontSize: 13 }}>
            <WarningOutlined style={{ color: "#fa8c16", marginRight: 6 }} />
            Очередь новых номенклатур ({newNoms.length})
          </Divider>
          <Table dataSource={newNoms} rowKey="id" size="small" pagination={false} style={{ borderRadius: 8 }}
            columns={[
              { title: "Номенклатура", dataIndex: "name", key: "n", render: v => <Text strong>{v}</Text> },
              { title: "Тип ТМЦ", dataIndex: "type_id", key: "t", render: v => EQUIP_TYPES.find(x => x.id === v)?.name },
              { title: "", key: "act", render: (_, r) => (
                <Space>
                  <Button size="small" icon={<PlusOutlined />}
                    onClick={() => { setEditPn("new"); setPnForm({ param_id: "", source: "", nomenclature_ids: [r.id], zones: [] }); }}>
                    Назначить норматив
                  </Button>
                  <Popconfirm title="Подтвердить без норматива?" description="Номенклатура подчиняется общим нормам."
                    onConfirm={() => { setNomenclatures(prev => prev.map(n => n.id === r.id ? { ...n, accepted: true } : n)); api.success({ message: "Помечено", duration: 2 }); }}>
                    <Button size="small" icon={<CheckOutlined />}>Подчиняется общим нормам</Button>
                  </Popconfirm>
                </Space>
              )}
            ]}
          />
        </>
      )}
    </div>
  );

  // --- Вкладка 4: Переопределения ---
  const [editOv, setEditOv] = useState(null);
  const [ovForm, setOvForm] = useState({ bind_type: "nomenclature", bind_id: "", param_id: "", action_type: "permanent", reason: "", zones: [] });

  const bindOptions = (type) => {
    if (type === "equipment_type") return EQUIP_TYPES.map(x => ({ label: x.name, value: x.id }));
    if (type === "nomenclature") return NOMENCLATURES.map(x => ({ label: x.name, value: x.id }));
    return []; // ТМЦ — упрощённо
  };
  const bindLabel = (ov) => {
    const labels = { equipment_type: "Тип ТМЦ", nomenclature: "Номенклатура", tmcz: "ТМЦ" };
    const name = ov.bind_type === "equipment_type"
      ? EQUIP_TYPES.find(x => x.id === ov.bind_id)?.name
      : NOMENCLATURES.find(x => x.id === ov.bind_id)?.name || ov.bind_id;
    return `${labels[ov.bind_type]}: ${name}`;
  };

  const Tab4 = (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>Ручные изменения нормативов с обоснованием</Text>
        <Button size="small" type="primary" icon={<PlusOutlined />}
          onClick={() => { setEditOv("new"); setOvForm({ bind_type: "nomenclature", bind_id: "", param_id: "", action_type: "permanent", reason: "", zones: [] }); }}>
          Создать
        </Button>
      </div>
      <Table dataSource={overrides} rowKey="id" size="small" pagination={false} style={{ borderRadius: 8 }}
        columns={[
          { title: "Привязка", key: "b", render: (_, r) => <Text style={{ fontSize: 12 }}>{bindLabel(r)}</Text> },
          { title: "Параметр", dataIndex: "param_id", key: "p", render: v => {
            const pr = params.find(x => x.id === v); return `${pr?.name} (${pr?.unit})`;
          }},
          { title: "Тип", dataIndex: "action_type", key: "at", render: v =>
            <Tag color={v === "permanent" ? "volcano" : "gold"}>{v === "permanent" ? "Постоянное" : "Разовое"}</Tag> },
          { title: "Диапазоны", key: "z", render: (_, r) =>
            r.zones.map(z => <Tag key={z.id} color={z.color} style={{ fontSize: 10, marginBottom: 2 }}>{z.label}</Tag>) },
          { title: "Обоснование", dataIndex: "reason", key: "r", render: v =>
            <Tooltip title={v}><Text style={{ fontSize: 11 }}>{v.length > 40 ? v.slice(0, 40) + "…" : v}</Text></Tooltip> },
          { title: "Автор", dataIndex: "author", key: "a", render: v => <Text type="secondary" style={{ fontSize: 11 }}>{v}</Text> },
          { title: "Активно", dataIndex: "active", key: "ac", render: (v, r) =>
            <Switch checked={v} size="small" onChange={c => setOverrides(prev => prev.map(x => x.id === r.id ? {...x, active: c} : x))} /> },
        ]}
      />
      <Modal open={!!editOv} title="Новое переопределение нормы" width={760}
        onOk={() => {
          if (!ovForm.reason.trim()) { api.warning({ message: "Обоснование обязательно" }); return; }
          setOverrides(prev => [...prev, { ...ovForm, id: uid(), active: true, author: "Соколов А.Н.", created: new Date().toISOString().slice(0, 10) }]);
          setEditOv(null);
          api.success({ message: "Переопределение создано", duration: 2 });
        }}
        onCancel={() => setEditOv(null)} okText="Создать">
        <Form layout="vertical" style={{ marginTop: 8 }}>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item label="Уровень привязки *">
                <Select value={ovForm.bind_type} onChange={v => setOvForm(f => ({...f, bind_type: v, bind_id: ""}))}>
                  <Option value="equipment_type">Тип ТМЦ</Option>
                  <Option value="nomenclature">Номенклатура</Option>
                  <Option value="tmcz">Конкретный ТМЦ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Объект привязки *">
                <Select value={ovForm.bind_id} onChange={v => setOvForm(f => ({...f, bind_id: v}))}
                  options={bindOptions(ovForm.bind_type)} placeholder="Выберите" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Параметр *">
                <Select value={ovForm.param_id} onChange={v => setOvForm(f => ({...f, param_id: v}))}>
                  {params.map(p => <Option key={p.id} value={p.id}>{p.name} ({p.unit})</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Тип действия *">
                <Radio.Group value={ovForm.action_type} onChange={e => setOvForm(f => ({...f, action_type: e.target.value}))}>
                  <Radio value="permanent">Постоянное</Radio>
                  <Radio value="one_time">Разовое (для одного протокола)</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Обоснование *">
            <Input.TextArea rows={2} value={ovForm.reason} onChange={e => setOvForm(f => ({...f, reason: e.target.value}))}
              placeholder="Укажите причину: распоряжение, техническое состояние, и т.д." />
          </Form.Item>
          <Form.Item label="Диапазоны зон *">
            <ZoneEditor zones={ovForm.zones} onChange={z => setOvForm(f => ({...f, zones: z}))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      {ctx}
      <Title level={4} style={{ margin: "0 0 20px", color: "#0f2744" }}>
        <ControlOutlined style={{ marginRight: 10, color: "#1a5fa8" }} />Справочник нормативов
      </Title>
      <Tabs activeKey={tab} onChange={setTab} items={[
        { key: "work_types", label: "1. Виды работ и параметры", children: Tab1 },
        { key: "ranges",     label: "2. Нормативные диапазоны",  children: Tab2 },
        { key: "passport",   label: <span>3. Паспортные нормативы {newNoms.length > 0 && <Badge count={newNoms.length} style={{ marginLeft: 4 }} />}</span>, children: Tab3 },
        { key: "overrides",  label: "4. Переопределения",         children: Tab4 },
      ]} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ЭКРАН: СПИСОК ПРОТОКОЛОВ
// ═══════════════════════════════════════════════════════════════════
function ProtocolList({ protocols, workTypes, params, onOpen, onCreate }) {
  const [search, setSearch] = useState("");
  const [fStatus, setFStatus] = useState(null);
  const [fType, setFType] = useState(null);
  const [fObj, setFObj] = useState(null);

  const filtered = useMemo(() => protocols.filter(p => {
    const obj = OBJECTS.find(o => o.id === p.object_id);
    return (!search || p.number.includes(search) || obj?.name.toLowerCase().includes(search.toLowerCase()))
      && (!fStatus || p.status === fStatus)
      && (!fType || p.test_type === fType)
      && (!fObj || p.object_id === fObj);
  }), [protocols, search, fStatus, fType, fObj]);

  const stats = useMemo(() => ({
    total: protocols.length,
    drafts: protocols.filter(p => p.status === "Черновик").length,
    review: protocols.filter(p => p.status === "На проверке").length,
    signed: protocols.filter(p => p.status === "Подписан").length,
    bad:    protocols.filter(p => countBadRows(p) > 0 && p.status !== "Аннулирован").length,
  }), [protocols]);

  const cols = [
    { title: "Номер", dataIndex: "number", key: "n", width: 170,
      render: (v, r) => <a style={{ fontWeight: 600, color: "#1a5fa8" }} onClick={() => onOpen(r.id)}>{v}</a> },
    { title: "Дата", dataIndex: "date_measured", key: "d", width: 100,
      render: v => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> },
    { title: "Объект", key: "obj", render: (_, r) => {
      const o = OBJECTS.find(x => x.id === r.object_id);
      return <div><Text strong style={{ fontSize: 12 }}>{o?.name}</Text><br/><Text type="secondary" style={{ fontSize: 11 }}>{o?.type}</Text></div>;
    }},
    { title: "Вид работы / тип", key: "wt", render: (_, r) => {
      const wt = workTypes.find(x => x.id === r.work_type_id);
      return <div><Text style={{ fontSize: 12 }}>{wt?.name}</Text><br/><Tag color="blue" style={{ fontSize: 10 }}>{r.test_type}</Tag></div>;
    }},
    { title: "Статус", key: "s", width: 130, render: (_, r) => <StatusTag status={r.status} /> },
    { title: "Заключение / отклонения", key: "c", width: 200, render: (_, r) => {
      if (r.conclusion_type) {
        const cfg = conclusionCfg[r.conclusion_type] || {};
        return <Tag color={cfg.color} style={{ fontSize: 11, whiteSpace: "normal", lineHeight: 1.3 }}>{r.conclusion_type}</Tag>;
      }
      const bad = countBadRows(r);
      return bad > 0
        ? <Tag color="warning" icon={<WarningOutlined />}>{bad} строк с отклонениями</Tag>
        : <Text type="secondary" style={{ fontSize: 11 }}>—</Text>;
    }},
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: "#0f2744" }}>
            <FileProtectOutlined style={{ marginRight: 10, color: "#1a5fa8" }} />Протоколы испытаний и измерений
          </Title>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>Создать протокол</Button>
      </div>
      <Row gutter={12} style={{ marginBottom: 20 }}>
        {[
          { label: "Всего", value: stats.total, color: "#1a5fa8" },
          { label: "Черновики", value: stats.drafts, color: "#595959" },
          { label: "На проверке", value: stats.review, color: "#1890ff" },
          { label: "Подписаны", value: stats.signed, color: "#389e0d" },
          { label: "С отклонениями", value: stats.bad, color: "#cf1322" },
        ].map(s => (
          <Col key={s.label} flex="1">
            <Card size="small" style={{ borderTop: `3px solid ${s.color}`, borderRadius: 8 }} bodyStyle={{ padding: "10px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#8c8c8c" }}>{s.label}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <Card size="small" style={{ marginBottom: 12, background: "#f8fafc" }} bodyStyle={{ padding: "10px 14px" }}>
        <Space wrap>
          <Input prefix={<SearchOutlined style={{ color: "#aaa" }} />} placeholder="Поиск" value={search}
            onChange={e => setSearch(e.target.value)} style={{ width: 220 }} allowClear />
          <Select placeholder="Статус" value={fStatus} onChange={setFStatus} allowClear style={{ width: 140 }}>
            {["Черновик", "На проверке", "Подписан", "Аннулирован"].map(s => <Option key={s}>{s}</Option>)}
          </Select>
          <Select placeholder="Тип испытаний" value={fType} onChange={setFType} allowClear style={{ width: 180 }}>
            {["Эксплуатационные", "Приёмо-сдаточные", "Внеплановые", "Контрольные"].map(t => <Option key={t}>{t}</Option>)}
          </Select>
          <Select placeholder="Объект" value={fObj} onChange={setFObj} allowClear style={{ width: 220 }}>
            {OBJECTS.map(o => <Option key={o.id} value={o.id}>{o.name}</Option>)}
          </Select>
          {(search || fStatus || fType || fObj) &&
            <Button icon={<ReloadOutlined />} size="small" onClick={() => { setSearch(""); setFStatus(null); setFType(null); setFObj(null); }}>Сбросить</Button>}
          <Text type="secondary" style={{ fontSize: 12 }}>Найдено: {filtered.length}</Text>
        </Space>
      </Card>
      <Table dataSource={filtered} columns={cols} rowKey="id" size="small"
        scroll={{ x: 900 }} pagination={{ pageSize: 15, showTotal: t => `Всего ${t}` }}
        rowClassName={r => countBadRows(r) > 0 && r.status !== "Аннулирован" ? "row-warn" : ""}
        style={{ borderRadius: 8 }} />
      <style>{`.row-warn td { background: #fffbe6 !important; } .row-warn:hover td { background: #fff8d6 !important; } .row-warn > td:first-child { border-left: 3px solid #faad14 !important; }`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ЭКРАН: КАРТОЧКА ПРОТОКОЛА
// ═══════════════════════════════════════════════════════════════════
function ProtocolCard({ prot, workTypes, params, onBack, onUpdate }) {
  const [api, ctx] = notification.useNotification();
  const [conclusionModal, setConclusionModal] = useState(false);
  const [conclusionType, setConclusionType] = useState(null);
  const [conclusionText, setConclusionText] = useState("");
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [defectModal, setDefectModal] = useState(false);
  const [manualStatusModal, setManualStatusModal] = useState(null); // {rowId, tmIdx, currentStatus}
  const [manualStatusValue, setManualStatusValue] = useState("");
  const [manualStatusReason, setManualStatusReason] = useState("");

  const isEditable = ["Черновик"].includes(prot.status);
  const canOverride = prot.status === "На проверке";
  const obj = OBJECTS.find(o => o.id === prot.object_id);
  const wt = workTypes.find(w => w.id === prot.work_type_id);
  const lab = LABS.find(l => l.id === prot.lab_id);

  function getAllRows() {
    if (prot.mode === "tm_list") return (prot.tm_groups || []).flatMap(g => g.rows);
    return prot.rows || [];
  }

  function updateRowField(rowId, field, value, tmIdx = null) {
    const updated = { ...prot };
    const upd = row => {
      if (row.id !== rowId) return row;
      const newRow = { ...row, [field]: value };
      if (field === "fact") {
        const z = newRow.zones?.length ? calcZoneStatus(value, newRow.zones) : null;
        newRow.auto_status = z;
      }
      return newRow;
    };
    if (prot.mode === "equipment") {
      updated.rows = prot.rows.map(upd);
    } else {
      updated.tm_groups = prot.tm_groups.map((g, gi) =>
        gi !== tmIdx ? g : { ...g, rows: g.rows.map(upd) });
    }
    onUpdate(updated);
  }

  function applyManualStatus() {
    if (!manualStatusValue.trim()) { api.warning({ message: "Укажите статус" }); return; }
    if (!manualStatusReason.trim()) { api.warning({ message: "Укажите обоснование" }); return; }
    const { rowId, tmIdx } = manualStatusModal;
    const upd = row => row.id !== rowId ? row :
      { ...row, manual_status: manualStatusValue, manual_reason: manualStatusReason, is_overridden: true };
    const updated = { ...prot };
    if (prot.mode === "equipment") updated.rows = prot.rows.map(upd);
    else updated.tm_groups = prot.tm_groups.map((g, gi) => gi !== tmIdx ? g : { ...g, rows: g.rows.map(upd) });
    const now = nowStr();
    updated.history = [...prot.history, { date: now, user: canOverride ? "Соколов А.Н." : prot.executor, action: `Статус строки переопределён вручную: «${manualStatusValue}» — ${manualStatusReason}` }];
    onUpdate(updated);
    setManualStatusModal(null); setManualStatusValue(""); setManualStatusReason("");
    api.success({ message: "Статус строки обновлён", duration: 2 });
  }

  function transition(newStatus, extra = {}) {
    const actionLabels = {
      "На проверке": "Отправлен на проверку",
      "Черновик": "Возвращён в черновик",
      "Подписан": "Подписан",
      "Аннулирован": `Аннулирован. Причина: ${extra.cancel_reason}`,
    };
    onUpdate({ ...prot, status: newStatus, ...extra,
      history: [...prot.history, { date: nowStr(), user: "Соколов А.Н.", action: actionLabels[newStatus] }] });
    api.success({ message: `Статус: ${newStatus}`, placement: "topRight", duration: 2 });
  }

  function makeRowCols(tmIdx = null) {
    const canManual = isEditable || canOverride;
    return [
      { title: "Параметр", key: "par", render: (_, r) =>
        <Text style={{ fontSize: 12, fontWeight: 500 }}>{r.param_name}</Text> },
      { title: "Ед.", dataIndex: "unit", key: "u", width: 60,
        render: v => <Text type="secondary" style={{ fontSize: 11 }}>{v}</Text> },
      { title: "Норматив (источник)", key: "norm", width: 220, render: (_, r) => (
        <div>
          <NormSourceBadge source={r.norm_source} />
          {r.zones?.length > 0 &&
            <Tooltip title={zoneLabel(r.zones)}>
              <Text style={{ fontSize: 10, color: "#888", display: "block", cursor: "help", marginTop: 2 }}>
                {r.zones.length} диапазон{r.zones.length > 1 ? "а" : ""}
              </Text>
            </Tooltip>}
        </div>
      )},
      { title: "Факт. значение", key: "fact", width: 140, render: (_, r) =>
        isEditable
          ? <InputNumber value={r.fact} size="small" style={{ width: 110 }}
              onChange={v => updateRowField(r.id, "fact", v, tmIdx)} placeholder="Введите" />
          : <Text style={{ fontSize: 13, fontWeight: 600 }}>{r.fact ?? "—"}</Text>
      },
      { title: "Статус", key: "status", width: 200, render: (_, r) => {
        const s = getEffectiveStatus(r);
        return (
          <Space direction="vertical" size={2}>
            <RowStatusBadge row={r} />
            {canManual && (s.undefined || canOverride) && (
              <Button size="small" type="link" style={{ padding: 0, fontSize: 11, height: "auto" }}
                icon={<EditOutlined />}
                onClick={() => { setManualStatusModal({ rowId: r.id, tmIdx }); setManualStatusValue(r.manual_status || ""); setManualStatusReason(r.manual_reason || ""); }}>
                {s.undefined ? "Указать статус" : "Переопределить"}
              </Button>
            )}
          </Space>
        );
      }},
      { title: "Примечание", key: "note", render: (_, r) =>
        isEditable
          ? <Input size="small" value={r.note} onChange={e => updateRowField(r.id, "note", e.target.value, tmIdx)} placeholder="—" />
          : <Text type="secondary" style={{ fontSize: 11 }}>{r.note || "—"}</Text>
      },
    ];
  }

  const undefinedCount = getAllRows().filter(r => getEffectiveStatus(r).undefined).length;
  const badCount = countBadRows(prot);

  return (
    <div style={{ padding: 24 }}>
      {ctx}
      <Breadcrumb style={{ marginBottom: 16 }} items={[
        { title: <span style={{ cursor: "pointer", color: "#1a5fa8" }} onClick={onBack}><HomeOutlined /> Протоколы</span> },
        { title: prot.number },
      ]} />
      {/* Шапка */}
      <div style={{ background: "linear-gradient(135deg,#0f2744,#1a5fa8)", borderRadius: 10, padding: "18px 24px", marginBottom: 16, color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: "#a8c7e8", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Протокол испытаний</div>
            <Title level={3} style={{ margin: 0, color: "#fff" }}>{prot.number}</Title>
            <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Tag style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }}>{prot.test_type}</Tag>
              <Tag style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#cde" }}>
                {prot.mode === "equipment" ? "Единичное оборудование" : "Перечень ТМ"}
              </Tag>
              {badCount > 0 && <Tag color="warning" icon={<WarningOutlined />}>{badCount} строк с отклонениями</Tag>}
              {undefinedCount > 0 && <Tag color="default" icon={<QuestionCircleOutlined />}>{undefinedCount} без норматива</Tag>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <StatusTag status={prot.status} />
            {prot.conclusion_type && (
              <div style={{ marginTop: 6 }}>
                <Tag color={conclusionCfg[prot.conclusion_type]?.color} style={{ fontSize: 11 }}>{prot.conclusion_type}</Tag>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ЖЦ */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 8 }}
        title={<Text style={{ fontSize: 13, fontWeight: 600 }}>Жизненный цикл и действия</Text>}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Steps size="small" current={statusCfg[prot.status]?.step ?? 0}
            status={prot.status === "Аннулирован" ? "error" : "process"}
            style={{ flex: 1, minWidth: 280 }}
            items={[
              { title: "Черновик", icon: <EditOutlined /> },
              { title: "На проверке", icon: <SendOutlined /> },
              { title: prot.status === "Аннулирован" ? "Аннулирован" : "Подписан",
                icon: prot.status === "Аннулирован" ? <StopOutlined /> : <SafetyCertificateOutlined /> },
            ]} />
          <Space wrap>
            {prot.status === "Черновик" && (
              <Button type="primary" icon={<SendOutlined />} style={{ background: "#1890ff" }}
                onClick={() => transition("На проверке")}>
                Отправить на проверку
              </Button>
            )}
            {prot.status === "На проверке" && (<>
              <Button icon={<ArrowLeftOutlined />} onClick={() => transition("Черновик")}>В черновик</Button>
              <Button type="primary" icon={<SafetyCertificateOutlined />} style={{ background: "#389e0d" }}
                onClick={() => setConclusionModal(true)}>
                Подписать
              </Button>
            </>)}
            {prot.status === "Подписан" && (
              <Button danger icon={<StopOutlined />} onClick={() => setCancelModal(true)}>Аннулировать</Button>
            )}
            {prot.status !== "Аннулирован" && (
              <Button icon={<BugOutlined />} style={{ borderColor: "#cf1322", color: "#cf1322" }}
                onClick={() => setDefectModal(true)}>
                Создать дефект
              </Button>
            )}
          </Space>
        </div>
        {prot.status === "Аннулирован" && prot.cancel_reason &&
          <Alert type="error" showIcon message={`Причина аннулирования: ${prot.cancel_reason}`} style={{ marginTop: 10 }} />}
        {prot.conclusion_text && prot.status === "Подписан" &&
          <Alert type={badCount > 0 ? "warning" : "success"} showIcon message="Заключение" description={prot.conclusion_text} style={{ marginTop: 10 }} />}
      </Card>

      {/* Вкладки */}
      <Tabs defaultActiveKey="rows" items={[
        {
          key: "rows", label: "Результаты измерений",
          children: (
            <Card size="small" style={{ borderRadius: 8 }}
              title={<Space><ThunderboltOutlined style={{ color: "#1a5fa8" }} /><span>Строки измерений</span>{badCount > 0 && <Tag color="error">{badCount} отклонений</Tag>}{undefinedCount > 0 && <Tag>{undefinedCount} без норматива</Tag>}</Space>}>
              {prot.mode === "equipment"
                ? <Table dataSource={prot.rows} columns={makeRowCols()} rowKey="id" size="small" pagination={false}
                    rowClassName={r => { const s = getEffectiveStatus(r); return s.color === "error" ? "row-err" : s.color === "warning" ? "row-warn-row" : ""; }}
                  />
                : <Collapse defaultActiveKey={(prot.tm_groups || []).map((_, i) => String(i))} size="small" style={{ borderRadius: 8 }}>
                    {(prot.tm_groups || []).map((g, gi) => (
                      <Panel key={String(gi)} header={
                        <Space>
                          <ApartmentOutlined style={{ color: "#1a5fa8" }} />
                          <Text strong style={{ fontSize: 13 }}>{g.tm_name}</Text>
                          {g.rows.some(r => getEffectiveStatus(r).color === "error") && <Tag color="error" style={{ fontSize: 10 }}>Отклонение</Tag>}
                          {g.rows.some(r => getEffectiveStatus(r).undefined) && <Tag style={{ fontSize: 10 }}>Без норматива</Tag>}
                        </Space>}>
                        <Table dataSource={g.rows} columns={makeRowCols(gi)} rowKey="id" size="small" pagination={false} />
                      </Panel>
                    ))}
                  </Collapse>
              }
            </Card>
          )
        },
        {
          key: "info", label: "Реквизиты",
          children: (
            <Card size="small" style={{ borderRadius: 8 }}>
              <Descriptions size="small" column={2} bordered
                labelStyle={{ background: "#f0f4f8", fontWeight: 600, fontSize: 12, width: 180 }}
                contentStyle={{ fontSize: 12 }}
                items={[
                  { key: "n", label: "Номер", children: <Text strong>{prot.number}</Text> },
                  { key: "obj", label: "Объект", children: obj?.name },
                  { key: "wt", label: "Вид работы", children: wt?.name },
                  { key: "tt", label: "Тип испытаний", children: <Tag color="blue">{prot.test_type}</Tag> },
                  { key: "lab", label: "Лаборатория", children: lab?.name },
                  { key: "d", label: "Дата измерений", children: prot.date_measured },
                  { key: "t", label: "Температура", children: `${prot.temp} °C` },
                  { key: "h", label: "Влажность", children: prot.humidity ? `${prot.humidity} %` : "—" },
                  { key: "ex", label: "Исполнитель", children: prot.executor },
                  { key: "dept", label: "Подразделение", children: prot.department },
                ]}
              />
            </Card>
          )
        },
        {
          key: "hist", label: "История",
          children: (
            <Card size="small" style={{ borderRadius: 8 }}>
              {prot.history.map((h, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 12px", borderLeft: "3px solid #1a5fa8",
                  marginBottom: 6, background: "#f8fafc", borderRadius: "0 6px 6px 0" }}>
                  <CalendarOutlined style={{ color: "#aaa", marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <Text style={{ fontSize: 12, fontWeight: 600 }}>{h.action}</Text><br/>
                    <Text type="secondary" style={{ fontSize: 11 }}>{h.user} · {h.date}</Text>
                  </div>
                </div>
              ))}
            </Card>
          )
        },
        {
          key: "def", label: <span>Дефекты {prot.defects?.length > 0 && <Badge count={prot.defects.length} />}</span>,
          children: (
            <Card size="small" style={{ borderRadius: 8 }}
              extra={<Button size="small" icon={<BugOutlined />} onClick={() => setDefectModal(true)}>Создать</Button>}>
              {!prot.defects?.length
                ? <Empty description="Дефекты не зафиксированы" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                : prot.defects.map(d => (
                    <Alert key={d.id} type="warning" showIcon icon={<BugOutlined />}
                      message={<Text strong style={{ fontSize: 12 }}>{d.title}</Text>}
                      description={<Text type="secondary" style={{ fontSize: 11 }}>{d.description} · {d.created}</Text>}
                      style={{ marginBottom: 8 }} />
                  ))
              }
            </Card>
          )
        },
      ]} />

      {/* Модал подписания */}
      <Modal title="Подписание протокола" open={conclusionModal}
        onOk={() => {
          if (!conclusionType) { api.warning({ message: "Выберите заключение" }); return; }
          transition("Подписан", { conclusion_type: conclusionType, conclusion_text: conclusionText,
            date_signed: new Date().toISOString().slice(0, 10), signed_by: "Соколов А.Н." });
          setConclusionModal(false);
        }}
        onCancel={() => setConclusionModal(false)} okText="Подписать" okButtonProps={{ style: { background: "#389e0d" } }}>
        <Form layout="vertical" style={{ marginTop: 10 }}>
          <Form.Item label="Итоговое заключение *">
            <Select value={conclusionType} onChange={setConclusionType} placeholder="Выберите">
              {Object.keys(conclusionCfg).map(c => <Option key={c}>{c}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="Текст заключения">
            <Input.TextArea rows={3} value={conclusionText} onChange={e => setConclusionText(e.target.value)} />
          </Form.Item>
          {badCount > 0 && <Alert type="warning" showIcon message={`${badCount} строк с ненормативными значениями`} />}
          {undefinedCount > 0 && <Alert type="info" showIcon message={`${undefinedCount} строк без заданного норматива`} style={{ marginTop: 8 }} />}
        </Form>
      </Modal>

      {/* Модал аннулирования */}
      <Modal title={<span style={{ color: "#cf1322" }}><StopOutlined /> Аннулирование</span>}
        open={cancelModal}
        onOk={() => {
          if (!cancelReason.trim()) { api.warning({ message: "Укажите причину" }); return; }
          transition("Аннулирован", { cancel_reason: cancelReason });
          setCancelModal(false); setCancelReason("");
        }}
        onCancel={() => { setCancelModal(false); setCancelReason(""); }}
        okText="Аннулировать" okButtonProps={{ danger: true }}>
        <Alert type="warning" showIcon message="Действие нельзя отменить." style={{ marginBottom: 12 }} />
        <Input.TextArea rows={3} value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Причина..." />
      </Modal>

      {/* Модал ручного статуса строки */}
      <Modal title={canOverride ? "Переопределение статуса строки" : "Указать статус (норматив не задан)"}
        open={!!manualStatusModal}
        onOk={applyManualStatus}
        onCancel={() => { setManualStatusModal(null); setManualStatusValue(""); setManualStatusReason(""); }}
        okText="Применить">
        {canOverride && (
          <Alert type="info" showIcon style={{ marginBottom: 12 }}
            message="Начальник ЭТЛ может переопределить автоматически рассчитанный статус. Действие фиксируется в истории." />
        )}
        {!canOverride && (
          <Alert type="warning" showIcon style={{ marginBottom: 12 }}
            message="Норматив для этого параметра не задан в системе. Вы можете указать статус вручную." />
        )}
        <Form layout="vertical">
          <Form.Item label="Статус *">
            <Input value={manualStatusValue} onChange={e => setManualStatusValue(e.target.value)}
              placeholder="Например: Норма, Отклонение, Предельное состояние..." />
          </Form.Item>
          <Form.Item label="Обоснование *">
            <Input.TextArea rows={2} value={manualStatusReason} onChange={e => setManualStatusReason(e.target.value)}
              placeholder="Укажите причину: норматив не внесён, разовый случай, оценка специалиста..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Модал дефекта */}
      <Modal title={<span><BugOutlined style={{ color: "#cf1322", marginRight: 8 }} />Создание дефекта</span>}
        open={defectModal}
        onOk={() => {
          const d = { id: uid(), title: `Дефект из протокола ${prot.number}`,
            description: `Выявлено при испытаниях. Отклонений: ${badCount}. Без норматива: ${undefinedCount}.`,
            created: new Date().toISOString().slice(0, 10) };
          onUpdate({ ...prot, defects: [...(prot.defects || []), d] });
          setDefectModal(false);
          api.success({ message: "Дефект создан", duration: 2 });
        }}
        onCancel={() => setDefectModal(false)} okText="Создать дефект" okButtonProps={{ danger: true }}>
        <Alert type="info" showIcon style={{ marginBottom: 12 }}
          message="Дефект будет создан с привязкой к протоколу и объекту." />
        {badCount > 0 && <Alert type="warning" showIcon message={`${badCount} строк с отклонениями будут включены в описание`} style={{ marginBottom: 8 }} />}
        {undefinedCount > 0 && <Alert type="default" showIcon message={`${undefinedCount} строк без норматива`} style={{ marginBottom: 8 }} />}
        <Text type="secondary" style={{ fontSize: 12 }}>Объект: {obj?.name}</Text>
      </Modal>

      <style>{`.row-err td { background: #fff2f0 !important; } .row-err > td:first-child { border-left: 3px solid #cf1322 !important; } .row-warn-row td { background: #fffbe6 !important; } .row-warn-row > td:first-child { border-left: 3px solid #faad14 !important; }`}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ЭКРАН: СОЗДАНИЕ ПРОТОКОЛА
// ═══════════════════════════════════════════════════════════════════
function CreateProtocol({ protocols, normRanges, passportNorms, overrides, workTypes, params, onSave, onCancel }) {
  const [step, setStep] = useState(0);
  const [form] = Form.useForm();
  const [mode, setMode] = useState(null);
  const [objId, setObjId] = useState(null);
  const [wtId, setWtId] = useState(null);
  const [equipId, setEquipId] = useState(null);
  const [selTMs, setSelTMs] = useState([]);

  const wt = workTypes.find(w => w.id === wtId);
  const equipList = objId ? (EQUIP_ON_OBJECTS[objId] || []) : [];
  const tmList = objId ? (TM_ON_OBJECTS[objId] || []) : [];

  // Функция поиска норматива по цепочке приоритетов
  function findNorm(paramId, equipObj) {
    if (!equipObj) return { zones: [], source: "" };

    // 1. Переопределение на ТМЦ (упрощённо — по id оборудования)
    const ov_tmcz = overrides.find(o => o.active && o.bind_type === "tmcz" && o.bind_id === equipObj.id && o.param_id === paramId);
    if (ov_tmcz) return { zones: ov_tmcz.zones, source: `Переопределение · ТМЦ ${equipObj.name}` };

    // 2. Переопределение на номенклатуру
    const ov_nm = overrides.find(o => o.active && o.bind_type === "nomenclature" && o.bind_id === equipObj.nm_id && o.param_id === paramId);
    if (ov_nm) {
      const nm = NOMENCLATURES.find(x => x.id === equipObj.nm_id);
      return { zones: ov_nm.zones, source: `Переопределение · ${nm?.name}` };
    }

    // 3. Переопределение на тип ТМЦ
    const ov_type = overrides.find(o => o.active && o.bind_type === "equipment_type" && o.bind_id === equipObj.type_id && o.param_id === paramId);
    if (ov_type) {
      const t = EQUIP_TYPES.find(x => x.id === equipObj.type_id);
      return { zones: ov_type.zones, source: `Переопределение · Тип ТМЦ: ${t?.name}` };
    }

    // 4. Паспортный норматив по номенклатуре
    const pn = passportNorms.find(x => x.param_id === paramId && x.nomenclature_ids.includes(equipObj.nm_id));
    if (pn) {
      const nm = NOMENCLATURES.find(x => x.id === equipObj.nm_id);
      return { zones: pn.zones, source: `Паспортный норматив · ${nm?.name}` };
    }

    // 5. Нормативный диапазон по типу ТМЦ
    const nr = normRanges.find(x => x.param_id === paramId && x.type_id === equipObj.type_id);
    if (nr) {
      const t = EQUIP_TYPES.find(x => x.id === equipObj.type_id);
      return { zones: nr.zones, source: `Норм. диапазон · ${t?.name}` };
    }

    return { zones: [], source: "" };
  }

  function handleFinish() {
    const vals = form.getFieldsValue(true);
    const equip = equipList.find(e => e.id === equipId);
    const now = new Date().toISOString().slice(0, 10);
    let rows = [], tm_groups = [];

    if (mode === "equipment" && wt && equip) {
      rows = wt.params.map(pt => {
        const pr = params.find(p => p.id === pt.param_id);
        const { zones, source } = findNorm(pt.param_id, equip);
        return { id: uid(), param_id: pr.id, param_name: pr.name, unit: pr.unit,
          zones, norm_source: source, fact: null, note: "",
          auto_status: null, manual_status: null, manual_reason: "", is_overridden: false };
      });
    } else if (mode === "tm_list" && wt) {
      tm_groups = selTMs.map(tmId => {
        const tm = tmList.find(t => t.id === tmId);
        return {
          tm_id: tmId, tm_name: tm?.name || tmId,
          rows: wt.params.map(pt => {
            const pr = params.find(p => p.id === pt.param_id);
            return { id: uid(), param_id: pr.id, param_name: pr.name, unit: pr.unit,
              zones: [], norm_source: "", fact: null, note: "",
              auto_status: null, manual_status: null, manual_reason: "", is_overridden: false };
          })
        };
      });
    }

    const newProt = {
      id: uid(), number: genNum(protocols),
      date_created: now, date_measured: vals.date_measured || now,
      object_id: objId, work_type_id: wtId, test_type: wt?.type || "Эксплуатационные",
      lab_id: vals.lab_id, department: vals.department,
      executor: vals.executor || "Текущий пользователь",
      mode, equip_id: mode === "equipment" ? equipId : null,
      temp: vals.temp, humidity: vals.humidity || null, voltage_test: vals.voltage_test || null,
      status: "Черновик", date_signed: null, signed_by: null,
      conclusion_type: null, conclusion_text: "", cancel_reason: null, defects: [],
      rows, tm_groups,
      history: [{ date: now + " " + new Date().toTimeString().slice(0, 5), user: vals.executor || "Пользователь", action: "Создан (Черновик)" }]
    };
    onSave(newProt);
  }

  const can1 = objId && wtId && mode;
  const can2 = mode === "equipment" ? !!equipId : selTMs.length > 0;

  return (
    <div style={{ padding: 24, maxWidth: 760, margin: "0 auto" }}>
      <Breadcrumb style={{ marginBottom: 16 }} items={[
        { title: <span style={{ cursor: "pointer", color: "#1a5fa8" }} onClick={onCancel}><HomeOutlined /> Протоколы</span> },
        { title: "Создание" },
      ]} />
      <Title level={4} style={{ margin: "0 0 24px", color: "#0f2744" }}>
        <PlusOutlined style={{ marginRight: 10, color: "#1a5fa8" }} />Создание протокола
      </Title>
      <Steps current={step} size="small" style={{ marginBottom: 24 }}
        items={[{ title: "Тип и объект" }, { title: "Оборудование / ТМ" }, { title: "Условия" }]} />

      <Form form={form} layout="vertical" requiredMark="optional">
        {step === 0 && (
          <Card style={{ borderRadius: 8 }}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label={<b>Объект *</b>}>
                  <Select value={objId} onChange={v => { setObjId(v); setEquipId(null); setSelTMs([]); }} size="large">
                    {OBJECTS.map(o => <Option key={o.id} value={o.id}>{o.name}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label={<b>Вид работы *</b>}>
                  <Select value={wtId} onChange={setWtId} size="large">
                    {workTypes.map(w => <Option key={w.id} value={w.id}>
                      <div><div>{w.name}</div><div style={{ fontSize: 11, color: "#888" }}>{w.norm_doc}</div></div>
                    </Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label={<b>Режим протокола *</b>}>
                  <div style={{ display: "flex", gap: 12 }}>
                    {[
                      { v: "equipment", label: "Единичное оборудование", desc: "Один ТМЦ" },
                      { v: "tm_list", label: "Перечень ТМ объекта", desc: "Несколько ТМ" },
                    ].map(m => (
                      <div key={m.v} onClick={() => setMode(m.v)} style={{
                        flex: 1, padding: "12px 16px", borderRadius: 8, cursor: "pointer",
                        border: mode === m.v ? "2px solid #1a5fa8" : "1px solid #d9d9d9",
                        background: mode === m.v ? "#f0f6ff" : "#fff", transition: "all 0.2s"
                      }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{m.label}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>{m.desc}</div>
                      </div>
                    ))}
                  </div>
                </Form.Item>
              </Col>
            </Row>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Button onClick={onCancel}>Отмена</Button>
              <Button type="primary" disabled={!can1} onClick={() => setStep(1)}>Далее →</Button>
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card style={{ borderRadius: 8 }}>
            {mode === "equipment" ? (
              <Form.Item label={<b>Единица оборудования *</b>}>
                {equipList.length === 0
                  ? <Alert type="warning" message="На объекте нет зарегистрированного оборудования" />
                  : <Select value={equipId} onChange={setEquipId} size="large">
                      {equipList.map(e => <Option key={e.id} value={e.id}>
                        <div><div>{e.name}</div><div style={{ fontSize: 11, color: "#888" }}>{e.serial}</div></div>
                      </Option>)}
                    </Select>}
              </Form.Item>
            ) : (
              <Form.Item label={<b>Технические места *</b>}>
                <Select mode="multiple" value={selTMs} onChange={setSelTMs} size="large" style={{ width: "100%" }}>
                  {tmList.map(t => <Option key={t.id} value={t.id}>{t.name}</Option>)}
                </Select>
              </Form.Item>
            )}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Лаборатория *" name="lab_id" rules={[{ required: true }]}>
                  <Select>
                    {LABS.map(l => <Option key={l.id} value={l.id}>
                      {l.name} <Tag color={l.type === "Собственная" ? "green" : "orange"} style={{ fontSize: 10 }}>{l.type}</Tag>
                    </Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Подразделение *" name="department" rules={[{ required: true }]}>
                  <Select>{DEPTS.map(d => <Option key={d}>{d}</Option>)}</Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Исполнитель" name="executor">
                  <Input placeholder="ФИО" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Дата измерений" name="date_measured">
                  <Input type="date" />
                </Form.Item>
              </Col>
            </Row>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button onClick={() => setStep(0)}>← Назад</Button>
              <Space>
                <Button onClick={onCancel}>Отмена</Button>
                <Button type="primary" disabled={!can2} onClick={() => setStep(2)}>Далее →</Button>
              </Space>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card style={{ borderRadius: 8 }}>
            <Alert type="info" showIcon style={{ marginBottom: 16 }}
              message="Температура воздуха влияет на сопротивление изоляции — обязательный параметр." />
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label={<b>Температура, °C *</b>} name="temp" rules={[{ required: true }]}>
                  <InputNumber min={-50} max={60} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Влажность, %" name="humidity">
                  <InputNumber min={0} max={100} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Напряжение испытания, кВ" name="voltage_test">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            {wt && (
              <>
                <Divider />
                <Text strong style={{ fontSize: 13 }}>Параметры из шаблона + нормативы:</Text>
                <Table size="small" style={{ marginTop: 8 }} pagination={false}
                  dataSource={wt.params.map(pt => {
                    const pr = params.find(p => p.id === pt.param_id);
                    const eq = equipList.find(e => e.id === equipId);
                    const { zones, source } = eq ? findNorm(pt.param_id, eq) : { zones: [], source: "" };
                    return { key: pt.param_id, name: pr?.name, unit: pr?.unit, source, zones };
                  })}
                  columns={[
                    { title: "Параметр", dataIndex: "name" },
                    { title: "Ед.", dataIndex: "unit", width: 70 },
                    { title: "Источник норматива", dataIndex: "source", render: v => v ? <NormSourceBadge source={v} /> : <Tag>Не задан</Tag> },
                    { title: "Диапазоны", key: "z", render: (_, r) =>
                      r.zones.map(z => <Tag key={z.id} color={z.color} style={{ fontSize: 10, marginBottom: 2 }}>{z.label}</Tag>) },
                  ]}
                />
              </>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              <Button onClick={() => setStep(1)}>← Назад</Button>
              <Space>
                <Button onClick={onCancel}>Отмена</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleFinish}>Создать протокол</Button>
              </Space>
            </div>
          </Card>
        )}
      </Form>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// КОРНЕВОЙ КОМПОНЕНТ
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [protocols, setProtocols] = useState(initProtocols);
  const [normRanges, setNormRanges] = useState(initNormRanges);
  const [passportNorms, setPassportNorms] = useState(initPassportNorms);
  const [overrides, setOverrides] = useState(initOverrides);
  const [nomenclatures, setNomenclatures] = useState(NOMENCLATURES);
  const [workTypes, setWorkTypes] = useState(WORK_TYPES);
  const [params, setParams] = useState(PARAMS);
  const [screen, setScreen] = useState("list");
  const [activeProtId, setActiveProtId] = useState(null);
  const [menuKey, setMenuKey] = useState("protocols");

  const activeProt = protocols.find(p => p.id === activeProtId);
  const newNomCount = nomenclatures.filter(n => !n.accepted).length;

  function openProt(id) { setActiveProtId(id); setScreen("card"); setMenuKey("protocols"); }
  function saveProt(p) { setProtocols(prev => [p, ...prev]); setActiveProtId(p.id); setScreen("card"); }
  function updateProt(p) { setProtocols(prev => prev.map(x => x.id === p.id ? p : x)); }

  const menuItems = [
    { key: "protocols", icon: <FileProtectOutlined />, label: "Протоколы" },
    { key: "create",    icon: <PlusOutlined />,        label: "Создать протокол" },
    { type: "divider" },
    { key: "normatives", icon: <ControlOutlined />,
      label: <span>Нормативы {newNomCount > 0 && <Badge count={newNomCount} size="small" style={{ marginLeft: 4 }} />}</span> },
  ];

  function onMenu({ key }) {
    if (key === "create") { setScreen("create"); setMenuKey("create"); }
    else if (key === "protocols") { setScreen("list"); setMenuKey("protocols"); }
    else if (key === "normatives") { setScreen("normatives"); setMenuKey("normatives"); }
  }

  return (
    <ConfigProvider theme={theme}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        body { margin: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-thumb { background: #c1ccd9; border-radius: 3px; }
      `}</style>
      <Layout style={{ minHeight: "100vh" }}>
        <Sider width={220} style={{ position: "sticky", top: 0, height: "100vh", overflow: "auto" }}>
          <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#1a5fa8,#4d9de0)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>⚡</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 12, lineHeight: 1.2 }}>ЭТЛ Модуль</div>
              <div style={{ color: "#6b8fa8", fontSize: 10 }}>Испытания и измерения</div>
            </div>
          </div>
          <Menu mode="inline" selectedKeys={[menuKey]} items={menuItems} onClick={onMenu} style={{ borderRight: "none", paddingTop: 8 }} />
          <div style={{ padding: "14px 12px", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 8 }}>
            {[
              { l: "Черновики",    v: protocols.filter(p => p.status === "Черновик").length,    c: "#6b8fa8" },
              { l: "На проверке", v: protocols.filter(p => p.status === "На проверке").length,  c: "#4d9de0" },
              { l: "Без норматива", v: protocols.filter(p => {
                const rows = p.mode === "tm_list" ? (p.tm_groups||[]).flatMap(g=>g.rows) : (p.rows||[]);
                return rows.some(r => getEffectiveStatus(r).undefined);
              }).length, c: "#fa8c16" },
              { l: "Ожидают ЭТЛ",  v: newNomCount, c: "#eb2f96" },
            ].map(x => (
              <div key={x.l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ color: "#6b8fa8", fontSize: 11 }}>{x.l}</span>
                <span style={{ color: x.c, fontWeight: 700, fontSize: 12 }}>{x.v}</span>
              </div>
            ))}
          </div>
        </Sider>
        <Layout>
          <Content style={{ background: "#f0f2f5", minHeight: "100vh" }}>
            {screen === "list" && <ProtocolList protocols={protocols} workTypes={workTypes} params={params} onOpen={openProt} onCreate={() => { setScreen("create"); setMenuKey("create"); }} />}
            {screen === "card" && activeProt && <ProtocolCard prot={activeProt} workTypes={workTypes} params={params} onBack={() => { setScreen("list"); setMenuKey("protocols"); }} onUpdate={updateProt} />}
            {screen === "create" && <CreateProtocol protocols={protocols} normRanges={normRanges} passportNorms={passportNorms} overrides={overrides} workTypes={workTypes} params={params} onSave={saveProt} onCancel={() => { setScreen("list"); setMenuKey("protocols"); }} />}
            {screen === "normatives" && <NormativesScreen normRanges={normRanges} setNormRanges={setNormRanges} passportNorms={passportNorms} setPassportNorms={setPassportNorms} overrides={overrides} setOverrides={setOverrides} nomenclatures={nomenclatures} setNomenclatures={setNomenclatures} workTypes={workTypes} setWorkTypes={setWorkTypes} params={params} setParams={setParams} />}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}