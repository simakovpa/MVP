import { useState, useMemo } from "react";
import {
  ConfigProvider, Layout, Menu, Table, Tag, Button, Space, Input, Select,
  DatePicker, Form, Modal, Drawer, Descriptions, Steps, Badge, Tooltip,
  Collapse, Popconfirm, Typography, Divider, Row, Col, Statistic, Card,
  InputNumber, Alert, Empty, Breadcrumb, Avatar, Tabs, notification,
  Result
} from "antd";
import {
  FileTextOutlined, PlusOutlined, SearchOutlined, FilterOutlined,
  CheckCircleOutlined, CloseCircleOutlined, MinusCircleOutlined,
  ExclamationCircleOutlined, ArrowLeftOutlined, SendOutlined,
  EditOutlined, StopOutlined, BugOutlined, SettingOutlined,
  ThunderboltOutlined, ApartmentOutlined, HomeOutlined,
  WarningOutlined, InfoCircleOutlined, ReloadOutlined,
  CalendarOutlined, TeamOutlined, EnvironmentOutlined,
  FileProtectOutlined, SafetyCertificateOutlined
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

// ─── ANT DESIGN ТОКЕН ──────────────────────────────────────────────────────
const theme = {
  token: {
    colorPrimary: "#1a5fa8",
    colorBgContainer: "#ffffff",
    colorBgLayout: "#f0f2f5",
    borderRadius: 6,
    fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
    fontSize: 13,
    colorLink: "#1a5fa8",
    colorSuccess: "#389e0d",
    colorWarning: "#d46b08",
    colorError: "#cf1322",
    colorTextBase: "#1a1a2e",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
  },
  components: {
    Table: { headerBg: "#f0f4f8", borderColor: "#dde3ec", rowHoverBg: "#f5f8ff" },
    Menu: { itemBg: "#0f2744", itemColor: "#a8bdd4", itemHoverBg: "#1a3a5c", itemSelectedBg: "#1a5fa8", itemSelectedColor: "#ffffff", subMenuItemBg: "#0a1e35" },
    Card: { headerBg: "#f8fafc" },
    Steps: { iconSize: 28 },
  }
};

// ─── MOCK ДАННЫЕ ────────────────────────────────────────────────────────────
const WORK_TYPES = [
  { id: "wt1", name: "Измерение сопротивления изоляции", type: "Эксплуатационные", norm_doc: "ПТЭЭП Прил.3, п.3.6", params: [
    { id: "p1", name: "Сопр. изоляции фаза A-земля", unit: "МОм", compare: "min", norm_default: 1.0 },
    { id: "p2", name: "Сопр. изоляции фаза B-земля", unit: "МОм", compare: "min", norm_default: 1.0 },
    { id: "p3", name: "Сопр. изоляции фаза C-земля", unit: "МОм", compare: "min", norm_default: 1.0 },
  ]},
  { id: "wt2", name: "Испытание повышенным напряжением", type: "Эксплуатационные", norm_doc: "ПУЭ табл. 1.8.34", params: [
    { id: "p4", name: "Напряжение испытания", unit: "кВ", compare: "exact", norm_default: 10.5 },
    { id: "p5", name: "Ток утечки", unit: "мА", compare: "max", norm_default: 0.5 },
    { id: "p6", name: "Длительность испытания", unit: "мин", compare: "min", norm_default: 1.0 },
  ]},
  { id: "wt3", name: "Измерение сопр. контура заземления", type: "Эксплуатационные", norm_doc: "ПУЭ п. 1.7.101", params: [
    { id: "p7", name: "Сопротивление контура заземления", unit: "Ом", compare: "max", norm_default: 4.0 },
  ]},
  { id: "wt4", name: "Приёмо-сдаточные испытания (ТМ)", type: "Приёмо-сдаточные", norm_doc: "ПТЭЭП Прил.3", params: [
    { id: "p1", name: "Сопр. изоляции фаза A-земля", unit: "МОм", compare: "min", norm_default: 10.0 },
    { id: "p2", name: "Сопр. изоляции фаза B-земля", unit: "МОм", compare: "min", norm_default: 10.0 },
    { id: "p8", name: "Переходное сопротивление контакта", unit: "мкОм", compare: "max", norm_default: 150 },
  ]},
];

const OBJECTS = [
  { id: "o1", name: "ПС 110/10 кВ «Северная»", type: "Подстанция" },
  { id: "o2", name: "ВЛ 10 кВ «Лесная» (фидер №3)", type: "Воздушная линия" },
  { id: "o3", name: "ТП-241 «Завод»", type: "Трансформаторная подстанция" },
];

const EQUIPMENT = {
  o1: [
    { id: "eq1", name: "Трансформатор ТМН-6300/110", serial: "Зав. №2019-4471", tm_id: "tm1" },
    { id: "eq2", name: "Выключатель ВГУ-110 яч.1", serial: "Зав. №2017-0983", tm_id: "tm2" },
    { id: "eq3", name: "Выключатель ВГУ-110 яч.2", serial: "Зав. №2017-0984", tm_id: "tm3" },
  ],
  o2: [],
  o3: [
    { id: "eq4", name: "Трансформатор ТМ-400/10", serial: "Зав. №2015-1122", tm_id: "tm4" },
  ],
};

const TECH_PLACES = {
  o2: [
    { id: "tm10", name: "Опора №1 (анкерная)" },
    { id: "tm11", name: "Опора №2" },
    { id: "tm12", name: "Опора №3" },
    { id: "tm13", name: "Пролёт №1-2" },
    { id: "tm14", name: "Пролёт №2-3" },
  ],
  o1: [
    { id: "tm1", name: "Ячейка №1 (Т-1)" },
    { id: "tm2", name: "Ячейка №2 (В-1)" },
    { id: "tm3", name: "Ячейка №3 (В-2)" },
  ],
  o3: [
    { id: "tm4", name: "Основной трансформатор" },
  ],
};

const LABS = [
  { id: "lab1", name: "ЭТЛ филиала АЭ", type: "Собственная", cert: "№ЭТЛ-2024-0047", cert_exp: "2026-12-31" },
  { id: "lab2", name: "ЭТЛ филиала АКЭ", type: "Собственная", cert: "№ЭТЛ-2024-0051", cert_exp: "2025-06-30" },
  { id: "lab3", name: 'ООО "ЭнергоТест"', type: "Подрядная", cert: "№ЭТЛ-2023-0189", cert_exp: "2027-03-15" },
];

const DEPARTMENTS = ["РЭС Северный", "РЭС Южный", "ПС Служба", "ЭТЛ"];

// ─── НАЧАЛЬНЫЕ ПРОТОКОЛЫ ────────────────────────────────────────────────────
const initProtocols = [
  {
    id: "prot1", number: "ПИМ-2026-00001", date_created: "2026-03-10",
    date_measured: "2026-03-10", object_id: "o1",
    work_type_id: "wt1", test_type: "Эксплуатационные",
    lab_id: "lab1", department: "РЭС Северный",
    executor: "Петров И.В.", mode: "equipment", equipment_id: "eq1",
    temp: 12, humidity: 68, voltage_test: null,
    status: "Подписан", date_signed: "2026-03-12", signed_by: "Соколов А.Н.",
    conclusion_type: "Соответствует НТД",
    conclusion_text: "Сопротивление изоляции соответствует нормам ПТЭЭП.",
    cancel_reason: null, defects: [],
    rows: [
      { id: "r1", param_id: "p1", param_name: "Сопр. изоляции фаза A-земля", unit: "МОм", norm: 1.0, norm_src: "ПТЭЭП Прил.3", fact: 480, status: "Норма", note: "" },
      { id: "r2", param_id: "p2", param_name: "Сопр. изоляции фаза B-земля", unit: "МОм", norm: 1.0, norm_src: "ПТЭЭП Прил.3", fact: 510, status: "Норма", note: "" },
      { id: "r3", param_id: "p3", param_name: "Сопр. изоляции фаза C-земля", unit: "МОм", norm: 1.0, norm_src: "ПТЭЭП Прил.3", fact: 495, status: "Норма", note: "" },
    ],
    history: [
      { date: "2026-03-10 09:15", user: "Петров И.В.", action: "Создан (Черновик)" },
      { date: "2026-03-11 16:30", user: "Петров И.В.", action: "Отправлен на проверку" },
      { date: "2026-03-12 10:05", user: "Соколов А.Н.", action: "Подписан" },
    ]
  },
  {
    id: "prot2", number: "ПИМ-2026-00002", date_created: "2026-03-14",
    date_measured: "2026-03-13", object_id: "o1",
    work_type_id: "wt2", test_type: "Эксплуатационные",
    lab_id: "lab1", department: "ПС Служба",
    executor: "Иванова М.С.", mode: "equipment", equipment_id: "eq2",
    temp: 8, humidity: 75, voltage_test: 10.5,
    status: "На проверке", date_signed: null, signed_by: null,
    conclusion_type: null, conclusion_text: "",
    cancel_reason: null, defects: [],
    rows: [
      { id: "r4", param_id: "p4", param_name: "Напряжение испытания", unit: "кВ", norm: 10.5, norm_src: "ПУЭ табл.1.8.34", fact: 10.5, status: "Норма", note: "" },
      { id: "r5", param_id: "p5", param_name: "Ток утечки", unit: "мА", norm: 0.5, norm_src: "ПУЭ табл.1.8.34", fact: 0.8, status: "Отклонение", note: "Превышение нормы. Рекомендуется дополнительная диагностика." },
      { id: "r6", param_id: "p6", param_name: "Длительность испытания", unit: "мин", norm: 1.0, norm_src: "ПУЭ табл.1.8.34", fact: 1.0, status: "Норма", note: "" },
    ],
    history: [
      { date: "2026-03-14 08:00", user: "Иванова М.С.", action: "Создан (Черновик)" },
      { date: "2026-03-14 17:45", user: "Иванова М.С.", action: "Отправлен на проверку" },
    ]
  },
  {
    id: "prot3", number: "ПИМ-2026-00003", date_created: "2026-03-17",
    date_measured: "2026-03-17", object_id: "o2",
    work_type_id: "wt3", test_type: "Эксплуатационные",
    lab_id: "lab1", department: "РЭС Северный",
    executor: "Сидоров В.П.", mode: "tm_list", equipment_id: null,
    temp: 5, humidity: 60, voltage_test: null,
    status: "Черновик", date_signed: null, signed_by: null,
    conclusion_type: null, conclusion_text: "",
    cancel_reason: null, defects: [],
    tm_groups: [
      { tm_id: "tm10", tm_name: "Опора №1 (анкерная)", rows: [
        { id: "r7", param_id: "p7", param_name: "Сопротивление контура заземления", unit: "Ом", norm: 4.0, norm_src: "ПУЭ п.1.7.101", fact: 3.2, status: "Норма", note: "" },
      ]},
      { tm_id: "tm11", tm_name: "Опора №2", rows: [
        { id: "r8", param_id: "p7", param_name: "Сопротивление контура заземления", unit: "Ом", norm: 4.0, norm_src: "ПУЭ п.1.7.101", fact: null, status: "Не измерено", note: "" },
      ]},
    ],
    history: [
      { date: "2026-03-17 11:00", user: "Сидоров В.П.", action: "Создан (Черновик)" },
    ]
  },
];

// ─── УТИЛИТЫ ────────────────────────────────────────────────────────────────
const statusConfig = {
  "Черновик":      { color: "default",   label: "Черновик" },
  "На проверке":   { color: "processing", label: "На проверке" },
  "Подписан":      { color: "success",   label: "Подписан" },
  "Аннулирован":   { color: "error",     label: "Аннулирован" },
};

const conclusionConfig = {
  "Соответствует НТД":         { color: "success", icon: <CheckCircleOutlined /> },
  "Не соответствует НТД":      { color: "error",   icon: <CloseCircleOutlined /> },
  "Частичное несоответствие":  { color: "warning", icon: <WarningOutlined /> },
};

const rowStatusConfig = {
  "Норма":       { color: "#389e0d", bg: "#f6ffed", icon: "✓" },
  "Отклонение":  { color: "#cf1322", bg: "#fff2f0", icon: "✗" },
  "Не измерено": { color: "#8c8c8c", bg: "#fafafa", icon: "—" },
};

function calcRowStatus(fact, norm, compare) {
  if (fact === null || fact === undefined || fact === "") return "Не измерено";
  const f = parseFloat(fact), n = parseFloat(norm);
  if (isNaN(f) || isNaN(n)) return "Не измерено";
  if (compare === "min") return f >= n ? "Норма" : "Отклонение";
  if (compare === "max") return f <= n ? "Норма" : "Отклонение";
  if (compare === "exact") return Math.abs(f - n) < 0.001 ? "Норма" : "Отклонение";
  return "Норма";
}

function getParamCompare(wt_id, param_id) {
  const wt = WORK_TYPES.find(w => w.id === wt_id);
  if (!wt) return "min";
  const p = wt.params.find(p => p.id === param_id);
  return p ? p.compare : "min";
}

function countDeviations(prot) {
  if (prot.mode === "tm_list") {
    return (prot.tm_groups || []).flatMap(g => g.rows).filter(r => r.status === "Отклонение").length;
  }
  return (prot.rows || []).filter(r => r.status === "Отклонение").length;
}

let nextId = 100;
function genId() { return `id_${++nextId}`; }
function genProtNum(protocols) {
  const year = new Date().getFullYear();
  const max = protocols.filter(p => p.number?.startsWith(`ПИМ-${year}`)).length;
  return `ПИМ-${year}-${String(max + 1).padStart(5, "0")}`;
}

// ─── КОМПОНЕНТ: СТАТУС TAG ──────────────────────────────────────────────────
function StatusTag({ status }) {
  const cfg = statusConfig[status] || { color: "default", label: status };
  return <Tag color={cfg.color} style={{ fontWeight: 600, fontSize: 12 }}>{cfg.label}</Tag>;
}

// ─── КОМПОНЕНТ: СТАТУС СТРОКИ ────────────────────────────────────────────────
function RowStatusBadge({ status }) {
  const cfg = rowStatusConfig[status] || rowStatusConfig["Не измерено"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}33`
    }}>
      {cfg.icon} {status}
    </span>
  );
}

// ─── ЭКРАН: СПИСОК ПРОТОКОЛОВ ────────────────────────────────────────────────
function ProtocolList({ protocols, onOpen, onCreate }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [filterObject, setFilterObject] = useState(null);

  const filtered = useMemo(() => protocols.filter(p => {
    const obj = OBJECTS.find(o => o.id === p.object_id);
    const matchSearch = !search || p.number.includes(search) || obj?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || p.status === filterStatus;
    const matchType = !filterType || p.test_type === filterType;
    const matchObj = !filterObject || p.object_id === filterObject;
    return matchSearch && matchStatus && matchType && matchObj;
  }), [protocols, search, filterStatus, filterType, filterObject]);

  const stats = useMemo(() => ({
    total: protocols.length,
    drafts: protocols.filter(p => p.status === "Черновик").length,
    review: protocols.filter(p => p.status === "На проверке").length,
    signed: protocols.filter(p => p.status === "Подписан").length,
    withDev: protocols.filter(p => countDeviations(p) > 0).length,
  }), [protocols]);

  const columns = [
    { title: "Номер", dataIndex: "number", key: "number", width: 170,
      render: (v, r) => <a style={{ fontWeight: 600, color: "#1a5fa8" }} onClick={() => onOpen(r.id)}>{v}</a> },
    { title: "Дата", dataIndex: "date_measured", key: "date", width: 110,
      render: v => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> },
    { title: "Объект", key: "object", render: (_, r) => {
      const obj = OBJECTS.find(o => o.id === r.object_id);
      return <div><Text strong style={{ fontSize: 13 }}>{obj?.name}</Text><br/><Text type="secondary" style={{ fontSize: 11 }}>{obj?.type}</Text></div>;
    }},
    { title: "Вид работы", key: "work_type", render: (_, r) => {
      const wt = WORK_TYPES.find(w => w.id === r.work_type_id);
      return <div><Text style={{ fontSize: 12 }}>{wt?.name}</Text><br/><Text type="secondary" style={{ fontSize: 11 }}>{r.test_type}</Text></div>;
    }},
    { title: "Лаборатория", key: "lab", width: 160, render: (_, r) => {
      const lab = LABS.find(l => l.id === r.lab_id);
      return <Text style={{ fontSize: 12 }}>{lab?.name}</Text>;
    }},
    { title: "Статус", key: "status", width: 130,
      render: (_, r) => <StatusTag status={r.status} /> },
    { title: "Заключение", key: "conclusion", width: 200,
      render: (_, r) => {
        if (!r.conclusion_type) {
          const devs = countDeviations(r);
          return devs > 0
            ? <Tag color="warning" icon={<WarningOutlined />}>Есть отклонения ({devs})</Tag>
            : <Text type="secondary" style={{ fontSize: 11 }}>—</Text>;
        }
        const cfg = conclusionConfig[r.conclusion_type] || {};
        return <Tag color={cfg.color} icon={cfg.icon} style={{ fontSize: 11, whiteSpace: "normal", lineHeight: "1.3" }}>{r.conclusion_type}</Tag>;
      }
    },
    { title: "", key: "actions", width: 40,
      render: (_, r) => <Button type="text" icon={<EditOutlined />} size="small" onClick={() => onOpen(r.id)} />
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Шапка */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0, color: "#0f2744" }}>
            <FileProtectOutlined style={{ marginRight: 10, color: "#1a5fa8" }} />
            Протоколы испытаний и измерений
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>Модуль ведения электрических испытаний</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="middle" onClick={onCreate}
          style={{ background: "#1a5fa8", boxShadow: "0 2px 6px rgba(26,95,168,0.3)" }}>
          Создать протокол
        </Button>
      </div>

      {/* Статистика */}
      <Row gutter={12} style={{ marginBottom: 20 }}>
        {[
          { label: "Всего", value: stats.total, color: "#1a5fa8", icon: <FileTextOutlined /> },
          { label: "Черновики", value: stats.drafts, color: "#595959", icon: <EditOutlined /> },
          { label: "На проверке", value: stats.review, color: "#1890ff", icon: <SendOutlined /> },
          { label: "Подписаны", value: stats.signed, color: "#389e0d", icon: <SafetyCertificateOutlined /> },
          { label: "С отклонениями", value: stats.withDev, color: "#cf1322", icon: <WarningOutlined /> },
        ].map(s => (
          <Col key={s.label} flex="1">
            <Card size="small" style={{ borderTop: `3px solid ${s.color}`, borderRadius: 8 }}
              bodyStyle={{ padding: "12px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20, color: s.color }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#8c8c8c" }}>{s.label}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Фильтры */}
      <Card size="small" style={{ marginBottom: 16, background: "#f8fafc" }} bodyStyle={{ padding: "12px 16px" }}>
        <Space wrap size={12}>
          <Input prefix={<SearchOutlined style={{ color: "#aaa" }} />} placeholder="Поиск по номеру или объекту"
            value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} allowClear />
          <Select placeholder="Статус" value={filterStatus} onChange={setFilterStatus} allowClear style={{ width: 150 }}>
            {Object.keys(statusConfig).map(s => <Option key={s} value={s}>{s}</Option>)}
          </Select>
          <Select placeholder="Тип испытаний" value={filterType} onChange={setFilterType} allowClear style={{ width: 180 }}>
            {["Эксплуатационные", "Приёмо-сдаточные", "Внеплановые", "Контрольные"].map(t =>
              <Option key={t} value={t}>{t}</Option>)}
          </Select>
          <Select placeholder="Объект" value={filterObject} onChange={setFilterObject} allowClear style={{ width: 240 }}>
            {OBJECTS.map(o => <Option key={o.id} value={o.id}>{o.name}</Option>)}
          </Select>
          {(search || filterStatus || filterType || filterObject) &&
            <Button icon={<ReloadOutlined />} size="small" onClick={() => { setSearch(""); setFilterStatus(null); setFilterType(null); setFilterObject(null); }}>
              Сбросить
            </Button>}
          <Text type="secondary" style={{ fontSize: 12 }}>Найдено: {filtered.length}</Text>
        </Space>
      </Card>

      {/* Таблица */}
      <Table
        dataSource={filtered} columns={columns} rowKey="id" size="small"
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 15, showSizeChanger: false, showTotal: t => `Всего ${t} записей` }}
        rowClassName={r => countDeviations(r) > 0 && r.status !== "Аннулирован" ? "row-deviation" : ""}
        style={{ borderRadius: 8, overflow: "hidden" }}
      />

      <style>{`
        .row-deviation td:first-child { border-left: 3px solid #cf1322 !important; }
        .ant-table-row.row-deviation { background: #fff9f9 !important; }
        .ant-table-row.row-deviation:hover td { background: #fff2f0 !important; }
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
}

// ─── ЭКРАН: КАРТОЧКА ПРОТОКОЛА ───────────────────────────────────────────────
function ProtocolCard({ prot, onBack, onUpdate }) {
  const [showDefectModal, setShowDefectModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [conclusionModal, setConclusionModal] = useState(false);
  const [conclusionType, setConclusionType] = useState(null);
  const [conclusionText, setConclusionText] = useState("");
  const [editingRow, setEditingRow] = useState({});
  const [api, contextHolder] = notification.useNotification();

  const obj = OBJECTS.find(o => o.id === prot.object_id);
  const wt = WORK_TYPES.find(w => w.id === prot.work_type_id);
  const lab = LABS.find(l => l.id === prot.lab_id);
  const devCount = countDeviations(prot);
  const isEditable = ["Черновик", "На проверке"].includes(prot.status);

  const stepMap = { "Черновик": 0, "На проверке": 1, "Подписан": 2, "Аннулирован": 2 };

  function updateRow(rowId, field, value, tmIdx = null) {
    const updated = { ...prot };
    if (prot.mode === "equipment") {
      updated.rows = prot.rows.map(r => {
        if (r.id !== rowId) return r;
        const newRow = { ...r, [field]: value };
        if (field === "fact") {
          const compare = getParamCompare(prot.work_type_id, r.param_id);
          newRow.status = calcRowStatus(value, r.norm, compare);
        }
        return newRow;
      });
    } else {
      updated.tm_groups = prot.tm_groups.map((g, gi) => {
        if (gi !== tmIdx) return g;
        return {
          ...g, rows: g.rows.map(r => {
            if (r.id !== rowId) return r;
            const newRow = { ...r, [field]: value };
            if (field === "fact") {
              const compare = getParamCompare(prot.work_type_id, r.param_id);
              newRow.status = calcRowStatus(value, r.norm, compare);
            }
            return newRow;
          })
        };
      });
    }
    onUpdate(updated);
  }

  function handleTransition(newStatus, extra = {}) {
    const now = new Date().toLocaleString("ru-RU", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
    const histEntry = {
      "На проверке": { user: prot.executor, action: "Отправлен на проверку" },
      "Черновик":    { user: "Соколов А.Н.", action: "Возвращён в черновик" },
      "Подписан":    { user: "Соколов А.Н.", action: "Подписан" },
      "Аннулирован": { user: "Соколов А.Н.", action: `Аннулирован. Причина: ${extra.reason}` },
    }[newStatus];
    onUpdate({
      ...prot, status: newStatus, ...extra,
      history: [...prot.history, { date: now.replace(",", ""), ...histEntry }]
    });
    api.success({ message: `Статус изменён: ${newStatus}`, placement: "topRight", duration: 3 });
  }

  function rowCols(tmIdx = null) {
    return [
      { title: "Измеряемый параметр", dataIndex: "param_name", key: "param", width: 240,
        render: v => <Text style={{ fontSize: 12, fontWeight: 500 }}>{v}</Text> },
      { title: "Ед.изм.", dataIndex: "unit", key: "unit", width: 70,
        render: v => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> },
      { title: "Норматив", key: "norm", width: 130,
        render: (_, r) => (
          <div>
            <Text style={{ fontSize: 12, fontWeight: 600 }}>{r.norm}</Text>
            <br />
            <Tooltip title={r.norm_src}>
              <Text type="secondary" style={{ fontSize: 10, cursor: "help", borderBottom: "1px dashed #ccc" }}>
                {r.norm_src?.length > 18 ? r.norm_src.slice(0, 18) + "…" : r.norm_src}
              </Text>
            </Tooltip>
          </div>
        )
      },
      { title: "Факт. значение", key: "fact", width: 140,
        render: (_, r) => isEditable
          ? <InputNumber
              value={r.fact} size="small"
              style={{ width: 110, borderColor: r.status === "Отклонение" ? "#cf1322" : undefined }}
              onChange={v => updateRow(r.id, "fact", v, tmIdx)}
              placeholder="Введите"
            />
          : <Text style={{ fontSize: 13, fontWeight: 600 }}>{r.fact ?? "—"}</Text>
      },
      { title: "Статус", key: "status", width: 140,
        render: (_, r) => <RowStatusBadge status={r.status} /> },
      { title: "Примечание", key: "note", render: (_, r) =>
        isEditable
          ? <Input size="small" value={r.note} placeholder="—"
              onChange={e => updateRow(r.id, "note", e.target.value, tmIdx)}
              style={{ fontSize: 12 }} />
          : <Text type="secondary" style={{ fontSize: 12 }}>{r.note || "—"}</Text>
      },
    ];
  }

  const descItems = [
    { key: "n", label: "Номер", children: <Text strong>{prot.number}</Text> },
    { key: "obj", label: "Объект", children: obj?.name },
    { key: "wt", label: "Вид работы", children: wt?.name },
    { key: "tt", label: "Тип испытаний", children: <Tag color="blue">{prot.test_type}</Tag> },
    { key: "lab", label: "Лаборатория", children: <span>{lab?.name} <Tag color={lab?.type === "Собственная" ? "green" : "orange"} style={{ fontSize: 10 }}>{lab?.type}</Tag></span> },
    { key: "dept", label: "Подразделение", children: prot.department },
    { key: "exec", label: "Исполнитель", children: prot.executor },
    { key: "dm", label: "Дата измерений", children: prot.date_measured },
    { key: "temp", label: "Температура воздуха", children: `${prot.temp} °C` },
    { key: "hum", label: "Влажность", children: prot.humidity ? `${prot.humidity} %` : "—" },
    prot.voltage_test ? { key: "vt", label: "Напряжение испытания", children: `${prot.voltage_test} кВ` } : null,
  ].filter(Boolean);

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}
      {/* Хлебные крошки */}
      <Breadcrumb style={{ marginBottom: 16 }} items={[
        { title: <span style={{ cursor: "pointer", color: "#1a5fa8" }} onClick={onBack}><HomeOutlined /> Протоколы</span> },
        { title: prot.number },
      ]} />

      {/* Шапка карточки */}
      <div style={{
        background: "linear-gradient(135deg, #0f2744 0%, #1a5fa8 100%)",
        borderRadius: 10, padding: "20px 24px", marginBottom: 20, color: "#fff"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: "#a8c7e8", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
              ПРОТОКОЛ ИСПЫТАНИЙ
            </div>
            <Title level={3} style={{ margin: 0, color: "#fff" }}>{prot.number}</Title>
            <div style={{ marginTop: 6, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Tag color="blue" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }}>
                {prot.test_type}
              </Tag>
              {prot.mode === "equipment"
                ? <Tag style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#cde" }}>Единичное оборудование</Tag>
                : <Tag style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#cde" }}>Перечень ТМ</Tag>}
              {devCount > 0 && <Tag color="error" icon={<WarningOutlined />}>{devCount} отклонений</Tag>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <StatusTag status={prot.status} />
            {prot.conclusion_type && (
              <div style={{ marginTop: 8 }}>
                <Tag color={conclusionConfig[prot.conclusion_type]?.color}
                  icon={conclusionConfig[prot.conclusion_type]?.icon}
                  style={{ fontSize: 11 }}>
                  {prot.conclusion_type}
                </Tag>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ЖЦ + Действия */}
      <Card size="small" style={{ marginBottom: 20, borderRadius: 8 }}
        title={<span style={{ fontSize: 13, fontWeight: 600 }}>Статус и переходы</span>}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Steps size="small" current={stepMap[prot.status]} status={prot.status === "Аннулирован" ? "error" : "process"}
            style={{ flex: 1, minWidth: 300 }} items={[
              { title: "Черновик", icon: <EditOutlined /> },
              { title: "На проверке", icon: <SendOutlined /> },
              { title: prot.status === "Аннулирован" ? "Аннулирован" : "Подписан",
                icon: prot.status === "Аннулирован" ? <StopOutlined /> : <SafetyCertificateOutlined /> },
            ]} />
          <Space wrap>
            {prot.status === "Черновик" && (
              <Button type="primary" icon={<SendOutlined />}
                onClick={() => handleTransition("На проверке")} style={{ background: "#1890ff" }}>
                Отправить на проверку
              </Button>
            )}
            {prot.status === "На проверке" && (<>
              <Button icon={<ArrowLeftOutlined />}
                onClick={() => handleTransition("Черновик")}>
                Вернуть в черновик
              </Button>
              <Button type="primary" icon={<SafetyCertificateOutlined />}
                onClick={() => setConclusionModal(true)} style={{ background: "#389e0d" }}>
                Подписать
              </Button>
            </>)}
            {prot.status === "Подписан" && (
              <Button danger icon={<StopOutlined />} onClick={() => setShowCancelModal(true)}>
                Аннулировать
              </Button>
            )}
            {prot.status !== "Аннулирован" && (
              <Button icon={<BugOutlined />} onClick={() => setShowDefectModal(true)}
                style={{ borderColor: "#cf1322", color: "#cf1322" }}>
                Создать дефект
              </Button>
            )}
          </Space>
        </div>
        {prot.status === "Аннулирован" && prot.cancel_reason && (
          <Alert type="error" showIcon message={`Причина аннулирования: ${prot.cancel_reason}`}
            style={{ marginTop: 12 }} />
        )}
        {prot.conclusion_text && prot.status === "Подписан" && (
          <Alert type={devCount > 0 ? "warning" : "success"} showIcon
            message="Заключение" description={prot.conclusion_text}
            style={{ marginTop: 12 }} />
        )}
      </Card>

      <Tabs defaultActiveKey="measurements" items={[
        {
          key: "measurements", label: "Результаты измерений",
          children: (
            <Card size="small" style={{ borderRadius: 8 }}
              title={
                <Space>
                  <ThunderboltOutlined style={{ color: "#1a5fa8" }} />
                  <span>Строки измерений</span>
                  {devCount > 0 && <Tag color="error">{devCount} отклонений</Tag>}
                </Space>
              }>
              {prot.mode === "equipment"
                ? <Table dataSource={prot.rows} columns={rowCols()} rowKey="id" size="small" pagination={false}
                    rowClassName={r => r.status === "Отклонение" ? "row-deviation" : ""}
                    style={{ borderRadius: 6 }} />
                : (prot.tm_groups || []).length === 0
                  ? <Empty description="Нет технических мест" />
                  : <Collapse defaultActiveKey={prot.tm_groups.map((_, i) => String(i))} size="small"
                      style={{ borderRadius: 8 }}>
                      {(prot.tm_groups || []).map((g, gi) => (
                        <Panel key={String(gi)}
                          header={
                            <Space>
                              <ApartmentOutlined style={{ color: "#1a5fa8" }} />
                              <Text strong style={{ fontSize: 13 }}>{g.tm_name}</Text>
                              {g.rows.some(r => r.status === "Отклонение") &&
                                <Tag color="error" style={{ fontSize: 10 }}>Есть отклонения</Tag>}
                            </Space>
                          }>
                          <Table dataSource={g.rows} columns={rowCols(gi)} rowKey="id" size="small"
                            pagination={false} rowClassName={r => r.status === "Отклонение" ? "row-deviation" : ""} />
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
              <Descriptions items={descItems} size="small" column={2} bordered
                labelStyle={{ background: "#f0f4f8", fontWeight: 600, fontSize: 12, width: 180 }}
                contentStyle={{ fontSize: 12 }} />
            </Card>
          )
        },
        {
          key: "history", label: "История",
          children: (
            <Card size="small" style={{ borderRadius: 8 }}>
              {prot.history.length === 0
                ? <Empty description="История пуста" />
                : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {prot.history.map((h, i) => (
                      <div key={i} style={{
                        display: "flex", gap: 12, alignItems: "flex-start",
                        padding: "8px 12px", borderRadius: 6, background: "#f8fafc",
                        borderLeft: "3px solid #1a5fa8"
                      }}>
                        <CalendarOutlined style={{ color: "#aaa", marginTop: 2, flexShrink: 0 }} />
                        <div>
                          <Text style={{ fontSize: 12, fontWeight: 600 }}>{h.action}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 11 }}>{h.user} · {h.date}</Text>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </Card>
          )
        },
        {
          key: "defects", label: <span>Дефекты {prot.defects?.length > 0 && <Badge count={prot.defects.length} />}</span>,
          children: (
            <Card size="small" style={{ borderRadius: 8 }}
              extra={<Button size="small" icon={<BugOutlined />} onClick={() => setShowDefectModal(true)}>Создать дефект</Button>}>
              {!prot.defects || prot.defects.length === 0
                ? <Empty description="Дефекты не зафиксированы" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                : prot.defects.map(d => (
                    <Alert key={d.id} type="warning" showIcon icon={<BugOutlined />}
                      message={<Text strong style={{ fontSize: 12 }}>{d.title}</Text>}
                      description={<Text type="secondary" style={{ fontSize: 11 }}>{d.description} · Создан: {d.created}</Text>}
                      style={{ marginBottom: 8 }} />
                  ))
              }
            </Card>
          )
        },
      ]} />

      {/* Модал: подписание */}
      <Modal title="Подписание протокола" open={conclusionModal}
        onOk={() => {
          if (!conclusionType) { api.warning({ message: "Выберите тип заключения" }); return; }
          handleTransition("Подписан", {
            conclusion_type: conclusionType, conclusion_text: conclusionText,
            date_signed: new Date().toISOString().slice(0, 10), signed_by: "Соколов А.Н."
          });
          setConclusionModal(false);
        }}
        onCancel={() => setConclusionModal(false)}
        okText="Подписать" okButtonProps={{ style: { background: "#389e0d" } }}>
        <Form layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item label="Итоговое заключение *">
            <Select value={conclusionType} onChange={setConclusionType} placeholder="Выберите заключение">
              {Object.keys(conclusionConfig).map(c => <Option key={c} value={c}>{c}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item label="Текст заключения">
            <Input.TextArea rows={3} value={conclusionText} onChange={e => setConclusionText(e.target.value)}
              placeholder="Введите текст заключения или рекомендации..." />
          </Form.Item>
          {devCount > 0 && <Alert type="warning" showIcon
            message={`В протоколе ${devCount} строк с отклонениями от нормы`} />}
        </Form>
      </Modal>

      {/* Модал: аннулирование */}
      <Modal title={<span style={{ color: "#cf1322" }}><StopOutlined /> Аннулирование протокола</span>}
        open={showCancelModal}
        onOk={() => {
          if (!cancelReason.trim()) { api.warning({ message: "Укажите причину аннулирования" }); return; }
          handleTransition("Аннулирован", { cancel_reason: cancelReason });
          setShowCancelModal(false); setCancelReason("");
        }}
        onCancel={() => { setShowCancelModal(false); setCancelReason(""); }}
        okText="Аннулировать" okButtonProps={{ danger: true }}>
        <Alert type="warning" showIcon message="Это действие нельзя отменить. Протокол будет помечен как аннулированный." style={{ marginBottom: 16 }} />
        <Form.Item label="Причина аннулирования *">
          <Input.TextArea rows={3} value={cancelReason} onChange={e => setCancelReason(e.target.value)}
            placeholder="Укажите причину..." />
        </Form.Item>
      </Modal>

      {/* Модал: создание дефекта */}
      <Modal title={<span><BugOutlined style={{ color: "#cf1322", marginRight: 8 }} />Создание дефекта</span>}
        open={showDefectModal}
        onOk={() => {
          const now = new Date().toISOString().slice(0, 10);
          const defect = {
            id: genId(),
            title: `Дефект по протоколу ${prot.number}`,
            description: devCount > 0
              ? `Выявлены отклонения (${devCount} параметра). Источник: протокол ${prot.number}.`
              : `Зафиксировано при проведении испытаний. Источник: протокол ${prot.number}.`,
            created: now, status: "Открыт"
          };
          onUpdate({ ...prot, defects: [...(prot.defects || []), defect] });
          setShowDefectModal(false);
          api.success({ message: "Дефект создан и добавлен в журнал дефектов", duration: 3 });
        }}
        onCancel={() => setShowDefectModal(false)}
        okText="Создать дефект" okButtonProps={{ danger: true }}>
        <Alert type="info" showIcon
          message="Дефект будет создан с привязкой к данному протоколу и объекту."
          style={{ marginBottom: 16 }} />
        {devCount > 0 && (
          <Alert type="warning" showIcon
            message={`В протоколе ${devCount} параметров с отклонениями — они будут включены в описание дефекта.`}
            style={{ marginBottom: 16 }} />
        )}
        <Text type="secondary" style={{ fontSize: 12 }}>
          После создания дефект появится в журнале дефектов объекта «{obj?.name}».
        </Text>
      </Modal>
    </div>
  );
}

// ─── ЭКРАН: ФОРМА СОЗДАНИЯ ───────────────────────────────────────────────────
function CreateProtocolForm({ protocols, onSave, onCancel }) {
  const [step, setStep] = useState(0);
  const [form] = Form.useForm();
  const [mode, setMode] = useState(null);
  const [selectedWt, setSelectedWt] = useState(null);
  const [selectedObj, setSelectedObj] = useState(null);
  const [selectedEquip, setSelectedEquip] = useState(null);
  const [selectedTMs, setSelectedTMs] = useState([]);

  const wt = WORK_TYPES.find(w => w.id === selectedWt);
  const equipList = selectedObj ? (EQUIPMENT[selectedObj] || []) : [];
  const tmList = selectedObj ? (TECH_PLACES[selectedObj] || []) : [];

  function handleFinish() {
    const vals = form.getFieldsValue(true);
    const equipment = equipList.find(e => e.id === selectedEquip);
    const now = new Date().toISOString().slice(0, 10);

    let rows = [], tm_groups = [];
    if (mode === "equipment" && wt) {
      rows = wt.params.map(p => ({
        id: genId(), param_id: p.id, param_name: p.name, unit: p.unit,
        norm: p.norm_default, norm_src: wt.norm_doc,
        fact: null, status: "Не измерено", note: ""
      }));
    } else if (mode === "tm_list" && wt) {
      tm_groups = selectedTMs.map(tmId => {
        const tm = tmList.find(t => t.id === tmId);
        return {
          tm_id: tmId, tm_name: tm?.name || tmId,
          rows: wt.params.map(p => ({
            id: genId(), param_id: p.id, param_name: p.name, unit: p.unit,
            norm: p.norm_default, norm_src: wt.norm_doc,
            fact: null, status: "Не измерено", note: ""
          }))
        };
      });
    }

    const newProt = {
      id: genId(),
      number: genProtNum(protocols),
      date_created: now,
      date_measured: vals.date_measured || now,
      object_id: selectedObj,
      work_type_id: selectedWt,
      test_type: wt?.type || vals.test_type,
      lab_id: vals.lab_id,
      department: vals.department,
      executor: vals.executor || "Текущий пользователь",
      mode,
      equipment_id: mode === "equipment" ? selectedEquip : null,
      temp: vals.temp, humidity: vals.humidity || null,
      voltage_test: vals.voltage_test || null,
      status: "Черновик",
      date_signed: null, signed_by: null,
      conclusion_type: null, conclusion_text: "",
      cancel_reason: null, defects: [],
      rows, tm_groups,
      history: [{ date: now + " " + new Date().toTimeString().slice(0,5), user: vals.executor || "Пользователь", action: "Создан (Черновик)" }]
    };
    onSave(newProt);
  }

  const steps = [
    { title: "Тип и объект" },
    { title: "Оборудование / ТМ" },
    { title: "Условия" },
  ];

  const canNextStep1 = selectedObj && selectedWt && mode;
  const canNextStep2 = mode === "equipment" ? !!selectedEquip : selectedTMs.length > 0;

  return (
    <div style={{ padding: 24, maxWidth: 760, margin: "0 auto" }}>
      <Breadcrumb style={{ marginBottom: 16 }} items={[
        { title: <span style={{ cursor: "pointer", color: "#1a5fa8" }} onClick={onCancel}><HomeOutlined /> Протоколы</span> },
        { title: "Создание протокола" },
      ]} />
      <Title level={4} style={{ margin: "0 0 24px", color: "#0f2744" }}>
        <PlusOutlined style={{ marginRight: 10, color: "#1a5fa8" }} />Создание протокола испытаний
      </Title>

      <Steps current={step} size="small" items={steps} style={{ marginBottom: 28 }} />

      <Form form={form} layout="vertical" requiredMark="optional">
        {step === 0 && (
          <Card style={{ borderRadius: 8 }}>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label={<b>Объект *</b>}>
                  <Select value={selectedObj} onChange={v => { setSelectedObj(v); setSelectedEquip(null); setSelectedTMs([]); }}
                    placeholder="Выберите объект" size="large">
                    {OBJECTS.map(o => <Option key={o.id} value={o.id}>{o.name}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label={<b>Вид работы *</b>}>
                  <Select value={selectedWt} onChange={setSelectedWt} placeholder="Выберите вид работы" size="large">
                    {WORK_TYPES.map(w => (
                      <Option key={w.id} value={w.id}>
                        <div><div>{w.name}</div><div style={{ fontSize: 11, color: "#888" }}>{w.norm_doc}</div></div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              {selectedWt && (
                <Col span={24}>
                  <Alert type="info" showIcon style={{ marginBottom: 16 }}
                    message={<span>Тип испытаний: <b>{wt?.type}</b> · НТД: <b>{wt?.norm_doc}</b></span>}
                    description={<span>Параметры из шаблона: {wt?.params.map(p => p.name).join(", ")}</span>} />
                </Col>
              )}
              <Col span={24}>
                <Form.Item label={<b>Режим протокола *</b>}>
                  <div style={{ display: "flex", gap: 12 }}>
                    {[
                      { value: "equipment", label: "Единичное оборудование", desc: "Один протокол — одна единица оборудования", icon: <ThunderboltOutlined /> },
                      { value: "tm_list", label: "Перечень ТМ объекта", desc: "Несколько технических мест в одном протоколе", icon: <ApartmentOutlined /> },
                    ].map(m => (
                      <div key={m.value}
                        onClick={() => setMode(m.value)}
                        style={{
                          flex: 1, padding: "14px 16px", borderRadius: 8, cursor: "pointer",
                          border: mode === m.value ? "2px solid #1a5fa8" : "1px solid #d9d9d9",
                          background: mode === m.value ? "#f0f6ff" : "#fff",
                          transition: "all 0.2s"
                        }}>
                        <div style={{ fontSize: 18, color: mode === m.value ? "#1a5fa8" : "#888", marginBottom: 6 }}>{m.icon}</div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{m.label}</div>
                        <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{m.desc}</div>
                      </div>
                    ))}
                  </div>
                </Form.Item>
              </Col>
            </Row>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <Space>
                <Button onClick={onCancel}>Отмена</Button>
                <Button type="primary" disabled={!canNextStep1} onClick={() => setStep(1)}>Далее →</Button>
              </Space>
            </div>
          </Card>
        )}

        {step === 1 && (
          <Card style={{ borderRadius: 8 }}>
            {mode === "equipment" ? (
              <Form.Item label={<b>Единица оборудования *</b>}>
                {equipList.length === 0
                  ? <Alert type="warning" message="На выбранном объекте нет зарегистрированного оборудования" />
                  : <Select value={selectedEquip} onChange={setSelectedEquip} placeholder="Выберите оборудование" size="large">
                      {equipList.map(e => (
                        <Option key={e.id} value={e.id}>
                          <div><div>{e.name}</div><div style={{ fontSize: 11, color: "#888" }}>{e.serial}</div></div>
                        </Option>
                      ))}
                    </Select>}
              </Form.Item>
            ) : (
              <Form.Item label={<b>Технические места *</b>}>
                {tmList.length === 0
                  ? <Alert type="warning" message="Нет технических мест на объекте" />
                  : <>
                      <Select mode="multiple" value={selectedTMs} onChange={setSelectedTMs}
                        placeholder="Выберите ТМ для включения в протокол" size="large" style={{ width: "100%" }}>
                        {tmList.map(t => <Option key={t.id} value={t.id}>{t.name}</Option>)}
                      </Select>
                      <div style={{ marginTop: 8 }}>
                        <Button size="small" type="link" onClick={() => setSelectedTMs(tmList.map(t => t.id))}>
                          Выбрать все ({tmList.length})
                        </Button>
                      </div>
                    </>}
              </Form.Item>
            )}
            <Row gutter={16} style={{ marginTop: 8 }}>
              <Col span={12}>
                <Form.Item label="Лаборатория *" name="lab_id" rules={[{ required: true }]}>
                  <Select placeholder="Выберите ЭТЛ">
                    {LABS.map(l => (
                      <Option key={l.id} value={l.id}>
                        <Space>
                          {l.name}
                          <Tag color={l.type === "Собственная" ? "green" : "orange"} style={{ fontSize: 10 }}>{l.type}</Tag>
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Подразделение-заказчик *" name="department" rules={[{ required: true }]}>
                  <Select placeholder="Выберите подразделение">
                    {DEPARTMENTS.map(d => <Option key={d} value={d}>{d}</Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Исполнитель (ФИО)" name="executor">
                  <Input placeholder="ФИО начальника ЭТЛ" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Дата проведения измерений" name="date_measured">
                  <Input type="date" />
                </Form.Item>
              </Col>
            </Row>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <Button onClick={() => setStep(0)}>← Назад</Button>
              <Space>
                <Button onClick={onCancel}>Отмена</Button>
                <Button type="primary" disabled={!canNextStep2} onClick={() => setStep(2)}>Далее →</Button>
              </Space>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card style={{ borderRadius: 8 }}>
            <Alert type="info" showIcon style={{ marginBottom: 20 }}
              message="Условия измерений важны для корректного сравнения с нормативами"
              description="Температура воздуха существенно влияет на сопротивление изоляции. Вносимые значения фиксируются в протоколе." />
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label={<b>Температура воздуха, °C *</b>} name="temp"
                  rules={[{ required: true, message: "Укажите температуру" }]}>
                  <InputNumber min={-50} max={60} style={{ width: "100%" }} placeholder="Напр.: 15" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Относительная влажность, %" name="humidity">
                  <InputNumber min={0} max={100} style={{ width: "100%" }} placeholder="Напр.: 65" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Напряжение испытания, кВ" name="voltage_test">
                  <InputNumber min={0} style={{ width: "100%" }} placeholder="Для высоковольтных" />
                </Form.Item>
              </Col>
            </Row>

            <Divider />
            <Title level={5} style={{ color: "#0f2744" }}>Параметры из шаблона</Title>
            {wt && (
              <Table
                size="small"
                dataSource={wt.params}
                rowKey="id"
                pagination={false}
                style={{ borderRadius: 6 }}
                columns={[
                  { title: "Параметр", dataIndex: "name", key: "name" },
                  { title: "Ед.изм.", dataIndex: "unit", key: "unit", width: 80 },
                  { title: "Норматив (по умолчанию)", key: "norm",
                    render: (_, p) => <Text style={{ fontWeight: 600 }}>{p.compare === "min" ? "≥" : p.compare === "max" ? "≤" : "="} {p.norm_default} {p.unit}</Text> },
                  { title: "Источник", key: "src", render: () => <Text type="secondary" style={{ fontSize: 11 }}>{wt.norm_doc}</Text> },
                ]}
              />
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <Button onClick={() => setStep(1)}>← Назад</Button>
              <Space>
                <Button onClick={onCancel}>Отмена</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleFinish}
                  style={{ background: "#1a5fa8" }}>
                  Создать протокол
                </Button>
              </Space>
            </div>
          </Card>
        )}
      </Form>
    </div>
  );
}

// ─── ЭКРАН: СПРАВОЧНИКИ ──────────────────────────────────────────────────────
function References() {
  const [activeTab, setActiveTab] = useState("work_types");
  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ margin: "0 0 20px", color: "#0f2744" }}>
        <SettingOutlined style={{ marginRight: 10, color: "#1a5fa8" }} />Справочники
      </Title>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        {
          key: "work_types", label: "Виды работ",
          children: (
            <Table dataSource={WORK_TYPES} rowKey="id" size="small" pagination={false}
              style={{ borderRadius: 8, overflow: "hidden" }}
              columns={[
                { title: "Наименование", dataIndex: "name", key: "name", render: v => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
                { title: "Тип испытаний", dataIndex: "type", key: "type",
                  render: v => <Tag color="blue">{v}</Tag> },
                { title: "НТД", dataIndex: "norm_doc", key: "norm_doc",
                  render: v => <Text type="secondary" style={{ fontSize: 12 }}>{v}</Text> },
                { title: "Параметров", key: "params",
                  render: (_, r) => <Badge count={r.params.length} color="#1a5fa8" /> },
              ]}
              expandable={{
                expandedRowRender: r => (
                  <Table dataSource={r.params} rowKey="id" size="small" pagination={false}
                    style={{ marginLeft: 48 }}
                    columns={[
                      { title: "Параметр", dataIndex: "name", key: "name" },
                      { title: "Ед.изм.", dataIndex: "unit", key: "unit", width: 80 },
                      { title: "Норматив", key: "norm",
                        render: (_, p) => <Text style={{ fontWeight: 600, color: "#1a5fa8" }}>{p.compare === "min" ? "≥" : p.compare === "max" ? "≤" : "="} {p.norm_default} {p.unit}</Text> },
                      { title: "Тип сравнения", dataIndex: "compare", key: "compare",
                        render: v => <Tag>{{ min: "Не менее", max: "Не более", exact: "Равно" }[v]}</Tag> },
                    ]} />
                )
              }}
            />
          )
        },
        {
          key: "labs", label: "Электролаборатории",
          children: (
            <Table dataSource={LABS} rowKey="id" size="small" pagination={false}
              style={{ borderRadius: 8, overflow: "hidden" }}
              columns={[
                { title: "Наименование", dataIndex: "name", key: "name", render: v => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
                { title: "Тип", dataIndex: "type", key: "type",
                  render: v => <Tag color={v === "Собственная" ? "green" : "orange"}>{v}</Tag> },
                { title: "Свидетельство ЭТЛ", dataIndex: "cert", key: "cert" },
                { title: "Действует до", dataIndex: "cert_exp", key: "cert_exp",
                  render: v => {
                    const exp = new Date(v), now = new Date();
                    const days = Math.round((exp - now) / 86400000);
                    const color = days < 0 ? "error" : days < 30 ? "warning" : "success";
                    return <Tag color={color}>{v} {days < 30 && days > 0 ? `(${days} дн.)` : days < 0 ? "(Истекло)" : ""}</Tag>;
                  }
                },
              ]} />
          )
        },
        {
          key: "objects", label: "Объекты",
          children: (
            <Table dataSource={OBJECTS} rowKey="id" size="small" pagination={false}
              style={{ borderRadius: 8, overflow: "hidden" }}
              columns={[
                { title: "Наименование", dataIndex: "name", key: "name", render: v => <Text strong style={{ fontSize: 13 }}>{v}</Text> },
                { title: "Тип", dataIndex: "type", key: "type", render: v => <Tag color="geekblue">{v}</Tag> },
                { title: "Оборудования", key: "eq", render: (_, r) => <Badge count={EQUIPMENT[r.id]?.length || 0} color="#1a5fa8" showZero /> },
                { title: "Техн. мест", key: "tm", render: (_, r) => <Badge count={TECH_PLACES[r.id]?.length || 0} color="#52c41a" showZero /> },
              ]} />
          )
        },
      ]} />
    </div>
  );
}

// ─── КОРНЕВОЙ КОМПОНЕНТ ──────────────────────────────────────────────────────
export default function App() {
  const [protocols, setProtocols] = useState(initProtocols);
  const [screen, setScreen] = useState("list"); // list | card | create | refs
  const [activeProtId, setActiveProtId] = useState(null);
  const [menuKey, setMenuKey] = useState("protocols");

  const activeProt = protocols.find(p => p.id === activeProtId);

  function openProtocol(id) { setActiveProtId(id); setScreen("card"); setMenuKey("protocols"); }
  function handleUpdate(updated) {
    setProtocols(prev => prev.map(p => p.id === updated.id ? updated : p));
  }
  function handleCreate(newProt) {
    setProtocols(prev => [newProt, ...prev]);
    setActiveProtId(newProt.id);
    setScreen("card");
  }

  const menuItems = [
    { key: "protocols", icon: <FileProtectOutlined />, label: "Протоколы" },
    { key: "create",    icon: <PlusOutlined />,        label: "Создать протокол" },
    { type: "divider" },
    { key: "refs",      icon: <SettingOutlined />,     label: "Справочники" },
  ];

  function handleMenu({ key }) {
    if (key === "create") { setScreen("create"); setMenuKey("create"); }
    else if (key === "protocols") { setScreen("list"); setMenuKey("protocols"); }
    else if (key === "refs") { setScreen("refs"); setMenuKey("refs"); }
  }

  return (
    <ConfigProvider theme={theme}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        body { margin: 0; font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif; }
        .row-deviation td { background: #fff9f9 !important; }
        .row-deviation:hover td { background: #fff2f0 !important; }
        .ant-table-tbody .row-deviation > td:first-child { border-left: 3px solid #cf1322 !important; }
        .ant-layout-sider .ant-menu-item-selected { font-weight: 600; }
        .ant-descriptions-item-label { white-space: nowrap; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f0f2f5; }
        ::-webkit-scrollbar-thumb { background: #c1ccd9; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #8fa8c4; }
      `}</style>
      <Layout style={{ minHeight: "100vh", background: "#f0f2f5" }}>
        {/* Сайдбар */}
        <Sider width={220} collapsible={false} style={{ position: "sticky", top: 0, height: "100vh", overflow: "auto" }}>
          <div style={{
            padding: "18px 16px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.08)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "linear-gradient(135deg, #1a5fa8, #4d9de0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, color: "#fff", flexShrink: 0
              }}>⚡</div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>ЭТЛ Модуль</div>
                <div style={{ color: "#6b8fa8", fontSize: 10, lineHeight: 1.3 }}>Испытания и измерения</div>
              </div>
            </div>
          </div>
          <Menu mode="inline" selectedKeys={[menuKey]} items={menuItems} onClick={handleMenu}
            style={{ borderRight: "none", paddingTop: 8 }} />

          {/* Мини-дашборд в сайдбаре */}
          <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "auto" }}>
            {[
              { label: "Черновики", count: protocols.filter(p => p.status === "Черновик").length, color: "#6b8fa8" },
              { label: "На проверке", count: protocols.filter(p => p.status === "На проверке").length, color: "#4d9de0" },
              { label: "С отклонениями", count: protocols.filter(p => countDeviations(p) > 0 && p.status !== "Аннулирован").length, color: "#e05c4d" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: "#6b8fa8", fontSize: 11 }}>{item.label}</span>
                <span style={{ color: item.color, fontWeight: 700, fontSize: 12 }}>{item.count}</span>
              </div>
            ))}
          </div>
        </Sider>

        {/* Контент */}
        <Layout>
          <Content style={{ background: "#f0f2f5", minHeight: "100vh" }}>
            {screen === "list" && (
              <ProtocolList protocols={protocols}
                onOpen={openProtocol}
                onCreate={() => { setScreen("create"); setMenuKey("create"); }} />
            )}
            {screen === "card" && activeProt && (
              <ProtocolCard prot={activeProt} onBack={() => { setScreen("list"); setMenuKey("protocols"); }} onUpdate={handleUpdate} />
            )}
            {screen === "create" && (
              <CreateProtocolForm protocols={protocols}
                onSave={handleCreate}
                onCancel={() => { setScreen("list"); setMenuKey("protocols"); }} />
            )}
            {screen === "refs" && <References />}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
