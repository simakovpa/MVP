import { useState, useMemo } from "react";
import {
  Card, Table, Select, Typography, Space, Tag, DatePicker,
  Empty, Button, Drawer, Timeline, Statistic, Row, Col, Divider, Modal
} from "antd";
import {
  HistoryOutlined, InfoCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, MinusCircleOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  OBJECTS, EQUIP_ON_OBJECTS, TM_ON_OBJECTS,
  PARAMS, WORK_TYPES, EMPLOYEES
} from "../data/mockData";
import { calcZoneStatus, getEffectiveStatus } from "../utils/helpers";
import ProtocolCard from "./ProtocolCard";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Статус-иконка для измерения
function StatusIcon({ status }) {
  if (status === "Норма" || status === "Соответствует" || status === "Соответствует НТД") return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
  if (status === "Область риска" || status === "Допустимо" || status === "Предупреждение" || status === "Частичное несоответствие") return <WarningOutlined style={{ color: "#faad14" }} />;
  if (status === "Предельное состояние" || status === "Недопустимо" || status === "Отклонение" || status === "Не соответствует" || status === "Не соответствует НТД") return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
  if (status === "Не определено") return <MinusCircleOutlined style={{ color: "#8c8c8c" }} />;
  return null;
}

// Цвет статуса
function getStatusColor(status) {
  const s = String(status).trim().toLowerCase();
  if (s === "норма" || s === "соответствует" || s === "подписан" || s === "соответствует нтд" || s.includes("норма")) return "success";
  if (s === "область риска" || s === "допустимо" || s === "предупреждение" || s === "на проверке" || s === "частичное несоответствие" || s.includes("допустимо")) return "warning";
  if (s === "предельное состояние" || s === "недопустимо" || s === "отклонение" || s === "не соответствует" || s === "не соответствует нтд") return "error";
  if (s === "не определено" || s === "черновик" || s === "не измерено") return "default";
  return "processing";
}

// Цвет по критичности severity (для ручных статусов)
function getSeverityColor(severity) {
  if (!severity) return "processing";
  const s = String(severity).trim().toLowerCase();
  // normal / норма
  if (s === "normal" || s === "норма" || s === "0") return "success";
  // warning / предупреждение
  if (s === "warning" || s === "предупреждение" || s === "1") return "warning";
  // critical / критическое / критично
  if (s === "critical" || s === "критическое" || s === "критично" || s === "2") return "error";
  return "processing";
}

// Получение оборудования по ID из всех объектов
function findEquipById(equipId) {
  for (const objId of Object.keys(EQUIP_ON_OBJECTS)) {
    const equip = EQUIP_ON_OBJECTS[objId].find(e => e.id === equipId);
    if (equip) return { equip, objectId: objId };
  }
  return null;
}

// Получение ТМ по ID из всех объектов
function findTmById(tmId) {
  for (const objId of Object.keys(TM_ON_OBJECTS)) {
    const tm = TM_ON_OBJECTS[objId].find(t => t.id === tmId);
    if (tm) return { tm, objectId: objId };
  }
  return null;
}

// Получение объекта по ID
function findObjectById(objectId) {
  return OBJECTS.find(o => o.id === objectId);
}

// Формирование полной истории всех измерений из всех протоколов
function buildAllHistory(protocols) {
  const history = [];

  protocols.forEach(prot => {
    const workType = WORK_TYPES.find(w => w.id === prot.work_type_id);
    const object = findObjectById(prot.object_id);
    const execNames = (prot.executor_ids || []).map(id => EMPLOYEES.find(e => e.id === id)?.name || id).join(", ");

    // Режим equipment
    if (prot.mode === "equipment" && prot.equip_id) {
      const found = findEquipById(prot.equip_id);
      prot.rows.forEach(row => {
        history.push({
          ...buildHistoryItem(prot, workType, object, execNames, row),
          equip_id: prot.equip_id,
          equip_name: found?.equip?.name || prot.equip_id,
          equip_serial: found?.equip?.serial || "",
          object_name: object?.name || prot.object_id,
          mode: "equipment",
        });
      });
    }

    // Режим equip_list
    if (prot.mode === "equip_list" && prot.equip_groups) {
      prot.equip_groups.forEach(group => {
        const found = findEquipById(group.equip_id);
        group.rows.forEach(row => {
          history.push({
            ...buildHistoryItem(prot, workType, object, execNames, row),
            equip_id: group.equip_id,
            equip_name: group.equip_name || found?.equip?.name || group.equip_id,
            equip_serial: group.serial || found?.equip?.serial || "",
            object_name: object?.name || prot.object_id,
            mode: "equip_list",
          });
        });
      });
    }

    // Режим tm_list
    if (prot.mode === "tm_list" && prot.tm_groups) {
      prot.tm_groups.forEach(group => {
        const foundTm = findTmById(group.tm_id);
        group.rows.forEach(row => {
          history.push({
            ...buildHistoryItem(prot, workType, object, execNames, row),
            tm_id: group.tm_id,
            tm_name: group.tm_name || foundTm?.tm?.name || group.tm_id,
            object_name: object?.name || prot.object_id,
            mode: "tm_list",
          });
        });
      });
    }
  });

  return history.sort((a, b) => {
    if (a.date !== b.date) return (b.date || "").localeCompare(a.date || "");
    return (b.protocol_number || "").localeCompare(a.protocol_number || "");
  });
}

function buildHistoryItem(prot, workType, object, execNames, row) {
  // Пересчитываем статус на основе текущих zones и fact
  const effective = getEffectiveStatus(row);
  const finalStatus = effective.label;
  
  return {
    protocol_id: prot.id,
    protocol_number: prot.number,
    date: prot.date_measured,
    date_created: prot.date_created,
    work_type: workType?.name || prot.work_type_id,
    exec_names: execNames,
    status: prot.status,
    param_name: row.param_name,
    unit: row.unit,
    fact: row.fact,
    norm_source: row.norm_source,
    auto_status: row.auto_status,
    manual_status: row.manual_status,
    severity: row.severity,
    final_status: finalStatus,
    color: effective.color,
    zones: row.zones,
    note: row.note,
  };
}

export default function HistoryScreen({ protocols, workTypes, params, instruments, onOpenProtocol }) {
  // Фильтры
  const [selectedObject, setSelectedObject] = useState(null);
  const [selectedEquipId, setSelectedEquipId] = useState(null);
  const [selectedTmId, setSelectedTmId] = useState(null);
  const [selectedParamIds, setSelectedParamIds] = useState([]);
  const [dateRange, setDateRange] = useState(null);
  const [drawerItem, setDrawerItem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalProt, setModalProt] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Полная история всех измерений
  const allHistory = useMemo(() => buildAllHistory(protocols), [protocols]);

  // Список уникальных параметров для фильтра
  const uniqueParams = useMemo(() => {
    const paramMap = {};
    allHistory.forEach(h => {
      if (!paramMap[h.param_name]) {
        paramMap[h.param_name] = h.param_name;
      }
    });
    return Object.values(paramMap).sort();
  }, [allHistory]);

  // Фильтрация
  const filteredHistory = useMemo(() => {
    return allHistory.filter(h => {
      // Фильтр по объекту
      if (selectedObject && h.object_name !== findObjectById(selectedObject)?.name) {
        const foundObj = findObjectById(selectedObject);
        if (h.object_name !== foundObj?.name) return false;
      }
      // Фильтр по оборудованию
      if (selectedEquipId && h.equip_id !== selectedEquipId) return false;
      // Фильтр по ТМ
      if (selectedTmId && h.tm_id !== selectedTmId) return false;
      // Фильтр по параметрам
      if (selectedParamIds.length > 0 && !selectedParamIds.includes(h.param_name)) return false;
      // Фильтр по дате
      if (dateRange && dateRange.length === 2) {
        const [start, end] = dateRange;
        if (h.date) {
          const d = dayjs(h.date);
          if (!d.isAfter(start.subtract(1, "day")) || !d.isBefore(end.add(1, "day"))) return false;
        } else return false;
      }
      return true;
    });
  }, [allHistory, selectedObject, selectedEquipId, selectedTmId, selectedParamIds, dateRange]);

  // Статистика
  const stats = useMemo(() => {
    const total = filteredHistory.length;
    const normal = filteredHistory.filter(h =>
      h.severity === "normal" ||
      h.final_status === "Норма" || h.final_status === "Соответствует" || h.final_status === "Соответствует НТД" ||
      h.final_status?.includes("Норма")
    ).length;
    const warning = filteredHistory.filter(h =>
      h.severity === "warning" ||
      h.final_status === "Область риска" || h.final_status === "Допустимо" || h.final_status === "Предупреждение" ||
      h.final_status === "Частичное несоответствие" || h.final_status?.includes("Допустимо")
    ).length;
    const critical = filteredHistory.filter(h =>
      h.severity === "critical" ||
      h.final_status === "Предельное состояние" || h.final_status === "Недопустимо" || h.final_status === "Отклонение" ||
      h.final_status === "Не соответствует" || h.final_status === "Не соответствует НТД"
    ).length;
    const undefined = filteredHistory.filter(h =>
      h.fact == null || h.final_status === "Не определено" || h.final_status === "Не измерено"
    ).length;
    return { total, normal, warning, critical, undefined };
  }, [filteredHistory]);

  // Доступное оборудование для выбранного объекта
  const equipsForObject = useMemo(() => {
    if (!selectedObject) return [];
    return EQUIP_ON_OBJECTS[selectedObject] || [];
  }, [selectedObject]);

  // Доступные ТМ для выбранного объекта
  const tmsForObject = useMemo(() => {
    if (!selectedObject) return [];
    return TM_ON_OBJECTS[selectedObject] || [];
  }, [selectedObject]);

  // При изменении объекта сбрасываем выбор оборудования/ТМ
  function handleObjectChange(value) {
    setSelectedObject(value);
    setSelectedEquipId(null);
    setSelectedTmId(null);
  }

  const columns = [
    {
      title: "Дата",
      dataIndex: "date",
      key: "date",
      width: 110,
      render: v => v ? dayjs(v).format("DD.MM.YYYY") : "—",
      sorter: (a, b) => (a.date || "").localeCompare(b.date || ""),
      defaultSortOrder: "descend",
    },
    {
      title: "Протокол",
      dataIndex: "protocol_number",
      key: "protocol_number",
      width: 160,
      render: (v, r) => (
        <Button type="link" onClick={() => { const p = protocols.find(p => p.id === r.protocol_id); if (p) { setModalProt(p); setModalOpen(true); }}} style={{ padding: 0 }}>
          {v}
        </Button>
      ),
    },
    {
      title: "Объект",
      dataIndex: "object_name",
      key: "object_name",
      width: 180,
      ellipsis: true,
    },
    {
      title: "Оборудование / ТМ",
      key: "entity",
      width: 200,
      ellipsis: true,
      render: (_, r) => (
        <span style={{ display: "block" }}>
          {r.equip_name || r.tm_name || "—"}
          {r.equip_serial && <br />}
          {r.equip_serial && <Text type="secondary" style={{ fontSize: 11 }}>Зав. №: {r.equip_serial}</Text>}
        </span>
      ),
    },
    {
      title: "Вид работы",
      dataIndex: "work_type",
      key: "work_type",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Параметр",
      dataIndex: "param_name",
      key: "param_name",
      width: 180,
    },
    {
      title: "Результат",
      key: "result",
      width: 130,
      render: (_, r) => (
        <Space>
          <Text strong>{r.fact != null ? `${r.fact} ${r.unit}` : "—"}</Text>
          <StatusIcon status={r.final_status} />
        </Space>
      ),
    },
    {
      title: "Статус",
      dataIndex: "final_status",
      key: "final_status",
      width: 140,
      render: (v, r) => {
        // Если есть severity, используем его для цвета
        if (r.severity) {
          const color = getSeverityColor(r.severity);
          if (color !== "processing") {
            return <Tag color={color}>{v}</Tag>;
          }
        }
        // Иначе используем автоматический статус
        return <Tag color={getStatusColor(v)}>{v}</Tag>;
      },
    },
    {
      title: "",
      key: "actions",
      width: 40,
      render: (_, r) => (
        <Button
          type="text"
          icon={<InfoCircleOutlined />}
          onClick={() => { setDrawerItem(r); setDrawerOpen(true); }}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Space align="center" style={{ marginBottom: 16 }}>
          <HistoryOutlined style={{ fontSize: 24, color: "#1a5fa8" }} />
          <Title level={4} style={{ margin: 0 }}>История измерений</Title>
        </Space>
        <Text type="secondary">
          Просмотр истории всех измерений с возможностью фильтрации по объекту, оборудованию и параметрам
        </Text>
      </div>

      {/* Фильтры */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ display: "block", marginBottom: 4 }}>Объект</Text>
            <Select
              placeholder="Все объекты"
              value={selectedObject}
              onChange={handleObjectChange}
              style={{ width: "100%" }}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label || "").toLowerCase().includes(input.toLowerCase())
              }
              options={OBJECTS.map(o => ({ value: o.id, label: `${o.name} (${o.type})` }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ display: "block", marginBottom: 4 }}>Оборудование</Text>
            <Select
              placeholder="Все оборудование"
              value={selectedEquipId}
              onChange={setSelectedEquipId}
              style={{ width: "100%" }}
              disabled={!selectedObject}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label || "").toLowerCase().includes(input.toLowerCase())
              }
              options={equipsForObject.map(e => ({
                value: e.id,
                label: `${e.name} — ${e.serial}`,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ display: "block", marginBottom: 4 }}>Техническое место</Text>
            <Select
              placeholder="Все ТМ"
              value={selectedTmId}
              onChange={setSelectedTmId}
              style={{ width: "100%" }}
              disabled={!selectedObject}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label || "").toLowerCase().includes(input.toLowerCase())
              }
              options={tmsForObject.map(t => ({
                value: t.id,
                label: t.name,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ display: "block", marginBottom: 4 }}>Параметр</Text>
            <Select
              placeholder="Все параметры"
              value={selectedParamIds}
              onChange={setSelectedParamIds}
              style={{ width: "100%" }}
              mode="multiple"
              allowClear
              maxTagCount={1}
              options={uniqueParams.map(p => ({ value: p, label: p }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Text strong style={{ display: "block", marginBottom: 4 }}>Период</Text>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: "100%" }}
              format="DD.MM.YYYY"
              placeholder={["Начало", "Конец"]}
            />
          </Col>
        </Row>
      </Card>

      {/* Статистика */}
      <Card size="small" style={{ marginBottom: 16 }} title="Сводка">
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", padding: "0 16px" }}>
          <div style={{ textAlign: "center", minWidth: 80, height: 70, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <InfoCircleOutlined style={{ fontSize: 24, color: "#1890ff", display: "block", margin: "0 auto" }} />
            <div style={{ fontSize: 24, lineHeight: 1.2 }}>{stats.total}</div>
            <div style={{ fontSize: 12, color: "#00000073" }}>Всего</div>
          </div>
          <div style={{ textAlign: "center", minWidth: 80, height: 70, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <CheckCircleOutlined style={{ fontSize: 24, color: "#52c41a", display: "block", margin: "0 auto" }} />
            <div style={{ fontSize: 24, lineHeight: 1.2, color: "#52c41a" }}>{stats.normal}</div>
            <div style={{ fontSize: 12, color: "#00000073" }}>Норма</div>
          </div>
          <div style={{ textAlign: "center", minWidth: 80, height: 70, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <WarningOutlined style={{ fontSize: 24, color: "#faad14", display: "block", margin: "0 auto" }} />
            <div style={{ fontSize: 24, lineHeight: 1.2, color: "#faad14" }}>{stats.warning}</div>
            <div style={{ fontSize: 12, color: "#00000073" }}>Предупреждение</div>
          </div>
          <div style={{ textAlign: "center", minWidth: 80, height: 70, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <CloseCircleOutlined style={{ fontSize: 24, color: "#ff4d4f", display: "block", margin: "0 auto" }} />
            <div style={{ fontSize: 24, lineHeight: 1.2, color: "#ff4d4f" }}>{stats.critical}</div>
            <div style={{ fontSize: 12, color: "#00000073" }}>Критические</div>
          </div>
          <div style={{ textAlign: "center", minWidth: 80, height: 70, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <MinusCircleOutlined style={{ fontSize: 24, color: "#8c8c8c", display: "block", margin: "0 auto" }} />
            <div style={{ fontSize: 24, lineHeight: 1.2, color: "#8c8c8c" }}>{stats.undefined}</div>
            <div style={{ fontSize: 12, color: "#00000073" }}>Не определено</div>
          </div>
        </div>
      </Card>

      {/* Таблица */}
      <Card>
        {filteredHistory.length === 0 ? (
          <Empty description="Измерения не найдены" />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredHistory.map((h, i) => ({ ...h, key: i }))}
            pagination={{
              defaultPageSize: 20,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} из ${total}`,
              pageSizeOptions: [10, 20, 50, 100],
            }}
            size="small"
            scroll={{ x: 1200 }}
          />
        )}
      </Card>

      {/* Детали измерения */}
      <Drawer
        title="Детали измерения"
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={480}
      >
        {drawerItem && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Протокол">
                <Button type="link" onClick={() => { setDrawerOpen(false); const p = protocols.find(p => p.id === drawerItem.protocol_id); if (p) { setModalProt(p); setModalOpen(true); }}} style={{ padding: 0 }}>
                  {drawerItem.protocol_number}
                </Button>
              </Descriptions.Item>
              <Descriptions.Item label="Дата измерения">
                {drawerItem.date ? dayjs(drawerItem.date).format("DD.MM.YYYY") : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Объект">
                {drawerItem.object_name || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Оборудование / ТМ">
                {drawerItem.equip_name || drawerItem.tm_name || "—"}
                {drawerItem.equip_serial && ` (${drawerItem.equip_serial})`}
              </Descriptions.Item>
              <Descriptions.Item label="Вид работы">
                {drawerItem.work_type}
              </Descriptions.Item>
              <Descriptions.Item label="Параметр">
                {drawerItem.param_name}
              </Descriptions.Item>
              <Descriptions.Item label="Результат">
                <Space>
                  <Text strong style={{ fontSize: 16 }}>
                    {drawerItem.fact != null ? `${drawerItem.fact} ${drawerItem.unit}` : "—"}
                  </Text>
                  <StatusIcon status={drawerItem.final_status} />
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Статус">
                <Tag color={getStatusColor(drawerItem.final_status)}>
                  {drawerItem.final_status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Исполнители">
                {drawerItem.exec_names || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Статус протокола">
                <Tag color={getStatusColor(drawerItem.status)}>
                  {drawerItem.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Источник норматива">
                {drawerItem.norm_source || "—"}
              </Descriptions.Item>
              {drawerItem.note && (
                <Descriptions.Item label="Примечание">
                  {drawerItem.note}
                </Descriptions.Item>
              )}
            </Descriptions>

            {drawerItem.zones && drawerItem.zones.length > 0 && (
              <>
                <Divider>Нормативные зоны</Divider>
                <Timeline
                  items={drawerItem.zones.map(z => ({
                    color: z.color === "success" ? "green" : z.color === "warning" ? "orange" : "red",
                    children: (
                      <div>
                        <Text strong>{z.label}</Text>
                        <br />
                        <Text type="secondary">
                          {z.min != null && (z.min_inc ? "≥ " : "> ") + z.min + " " + drawerItem.unit}
                          {z.min != null && z.max != null && " ; "}
                          {z.max != null && (z.max_inc ? "≤ " : "< ") + z.max + " " + drawerItem.unit}
                          {z.min == null && z.max == null && "Любое значение"}
                        </Text>
                      </div>
                    ),
                  }))}
                />
              </>
            )}
          </div>
        )}
      </Drawer>

      {/* Модальное окно протокола измерений */}
      <Modal
        title={`Протокол ${modalProt?.number || ""}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={1200}
        footer={null}
        centered
      >
        {modalProt && (
          <ProtocolCard
            prot={modalProt}
            workTypes={workTypes}
            params={params}
            instruments={instruments}
            onBack={() => setModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
}
