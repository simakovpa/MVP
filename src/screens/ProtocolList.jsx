import { useState, useMemo } from "react";
import {
  Table, Tag, Button, Space, Input, Select, Card, Row, Col,
  Typography, Tooltip
} from "antd";
import {
  FileProtectOutlined, PlusOutlined, SearchOutlined,
  WarningOutlined, ReloadOutlined, ToolOutlined
} from "@ant-design/icons";
import { OBJECTS, EMPLOYEES, empName } from "../data/mockData";
import { deptLabel } from "../data/mockData";
import { countBadRows, getEffectiveStatus, hasExpiredInstruments } from "../utils/helpers";
import { StatusTag } from "../components/shared";

const { Title, Text } = Typography;

// Формат ФИО: "Фамилия И.О."
const formatFIO = (fullName) => {
  if (!fullName) return "—";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  const lastName = parts[0];
  const initials = parts.slice(1).map(p => p.charAt(0).toUpperCase() + ".").join("");
  return `${lastName} ${initials}`;
};
const { Option } = Select;

const conclusionCfg = {
  "Соответствует НТД":        { color:"success" },
  "Не соответствует НТД":     { color:"error"   },
  "Частичное несоответствие": { color:"warning"  },
};

export default function ProtocolList({ protocols, workTypes, params, instruments, onOpen, onCreate }) {
  const [search, setSearch]   = useState("");
  const [fStatus, setFStatus] = useState(null);
  const [fType, setFType]     = useState(null);
  const [fObj, setFObj]       = useState(null);

  const filtered = useMemo(() => protocols.filter(p => {
    const obj = OBJECTS.find(o => o.id===p.object_id);
    return (!search || p.number.includes(search) || obj?.name.toLowerCase().includes(search.toLowerCase()))
      && (!fStatus || p.status===fStatus)
      && (!fType   || p.test_type===fType)
      && (!fObj    || p.object_id===fObj);
  }), [protocols, search, fStatus, fType, fObj]);

  const stats = useMemo(() => ({
    total:   protocols.length,
    drafts:  protocols.filter(p=>p.status==="Черновик").length,
    inWork:  protocols.filter(p=>p.status==="В работе").length,
    review:  protocols.filter(p=>p.status==="На проверке").length,
    signed:  protocols.filter(p=>p.status==="Подписан").length,
    bad:     protocols.filter(p=>countBadRows(p)>0 && p.status!=="Аннулирован").length,
    expired: protocols.filter(p=>hasExpiredInstruments(p, instruments)).length,
  }), [protocols, instruments]);

  const cols = [
    { title:"Номер", dataIndex:"number", key:"n", width:180,
      render:(v,r) => (
        <Space>
          <a style={{ fontWeight:600, color:"#1a5fa8" }} onClick={() => onOpen(r)}>{v}</a>
          {hasExpiredInstruments(r, instruments) &&
            <Tooltip title="Один или несколько приборов имеют просроченную поверку">
              <ToolOutlined style={{ color:"#ff4d4f", fontSize:13 }}/>
            </Tooltip>}
        </Space>
      )},
    { title:"Дата", dataIndex:"date_measured", key:"d", width:100,
      render:v=><Text type="secondary" style={{ fontSize:12 }}>{v}</Text> },
    { title:"Объект / подразделение", key:"obj", render:(_, r) => {
      const o = OBJECTS.find(x=>x.id===r.object_id);
      return (
        <div>
          <Text strong style={{ fontSize:12 }}>{o?.name}</Text>
          <br/>
          <Text type="secondary" style={{ fontSize:11 }}>{deptLabel(r.dept_id)}</Text>
        </div>
      );
    }},
    { title:"Вид работы / тип", key:"wt", render:(_, r) => {
      const wt = workTypes.find(x=>x.id===r.work_type_id);
      return (
        <div>
          <Text style={{ fontSize:12 }}>{wt?.name}</Text>
          <br/>
          <Tag color="blue" style={{ fontSize:10 }}>{r.test_type}</Tag>
        </div>
      );
    }},
    { title:"Статус", key:"s", width:130,
      render:(_, r) => <StatusTag status={r.status}/> },
    { title:"Заключение / отклонения", key:"c", width:210, render:(_, r) => {
      if (r.conclusion_type) {
        const cfg = conclusionCfg[r.conclusion_type] || {};
        return <Tag color={cfg.color} style={{ fontSize:11, whiteSpace:"normal", lineHeight:1.3 }}>{r.conclusion_type}</Tag>;
      }
      const bad = countBadRows(r);
      return bad>0
        ? <Tag color="warning" icon={<WarningOutlined/>}>{bad} строк с отклонениями</Tag>
        : <Text type="secondary" style={{ fontSize:11 }}>—</Text>;
    }},
    { title:"Сотрудники", key:"staff", width:220, render:(_, r) => {
      const items = [];
      if (r.reviewer_id) {
        const reviewer = EMPLOYEES.find(e => e.id === r.reviewer_id);
        if (reviewer) items.push(<div key="resp"><Text style={{ fontSize:11 }}>Ответственный: </Text><Text strong style={{ fontSize:12 }}>{formatFIO(reviewer.name)}</Text></div>);
      }
      if (r.executor_ids?.length) {
        const names = r.executor_ids.map(id => {
          const emp = EMPLOYEES.find(e => e.id === id);
          return emp ? formatFIO(emp.name) : null;
        }).filter(Boolean);
        if (names.length) items.push(<div key="exec"><Text style={{ fontSize:11 }}>Участник: </Text><Text strong style={{ fontSize:12 }}>{names.join(", ")}</Text></div>);
      }
      return items.length > 0 ? <Space direction="vertical" size={2}>{items}</Space> : <Text type="secondary" style={{ fontSize:11 }}>—</Text>;
    }},
  ];

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <Title level={4} style={{ margin:0, color:"#0f2744" }}>
          <FileProtectOutlined style={{ marginRight:10, color:"#1a5fa8" }}/>
          Протоколы испытаний и измерений
        </Title>
        <Button type="primary" icon={<PlusOutlined/>} onClick={onCreate}>Создать протокол</Button>
      </div>

      {/* Статистика */}
      <Row gutter={12} style={{ marginBottom:20 }}>
        {[
          { label:"Всего",          value:stats.total,   color:"#1a5fa8" },
          { label:"Черновики",      value:stats.drafts,  color:"#595959" },
          { label:"В работе",       value:stats.inWork,   color:"#722ed1" },
          { label:"На проверке",    value:stats.review,  color:"#1890ff" },
          { label:"Подписаны",      value:stats.signed,  color:"#389e0d" },
          { label:"С отклонениями", value:stats.bad,     color:"#cf1322" },
          { label:"Приборы просрочены", value:stats.expired, color:"#fa8c16" },
        ].map(s => (
          <Col key={s.label} flex="1">
            <Card size="small" style={{ borderTop:`3px solid ${s.color}`, borderRadius:8 }}
              bodyStyle={{ padding:"10px 14px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ fontSize:20, fontWeight:700, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:11, color:"#8c8c8c" }}>{s.label}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Фильтры */}
      <Card size="small" style={{ marginBottom:12, background:"#f8fafc" }} bodyStyle={{ padding:"10px 14px" }}>
        <Space wrap>
          <Input prefix={<SearchOutlined style={{ color:"#aaa" }}/>} placeholder="Поиск" value={search}
            onChange={e=>setSearch(e.target.value)} style={{ width:220 }} allowClear/>
          <Select placeholder="Статус" value={fStatus} onChange={setFStatus} allowClear style={{ width:140 }}>
            {["Черновик","В работе","На проверке","Подписан","Аннулирован"].map(s=><Option key={s}>{s}</Option>)}
          </Select>
          <Select placeholder="Тип испытаний" value={fType} onChange={setFType} allowClear style={{ width:190 }}>
            {["Эксплуатационные","Приёмо-сдаточные","Внеплановые","Контрольные"].map(t=><Option key={t}>{t}</Option>)}
          </Select>
          <Select placeholder="Объект" value={fObj} onChange={setFObj} allowClear style={{ width:240 }}>
            {OBJECTS.map(o=><Option key={o.id} value={o.id}>{o.name}</Option>)}
          </Select>
          {(search||fStatus||fType||fObj) &&
            <Button icon={<ReloadOutlined/>} size="small"
              onClick={() => { setSearch(""); setFStatus(null); setFType(null); setFObj(null); }}>Сбросить</Button>}
          <Text type="secondary" style={{ fontSize:12 }}>Найдено: {filtered.length}</Text>
        </Space>
      </Card>

      <Table dataSource={filtered} columns={cols} rowKey="id" size="small"
        scroll={{ x:900 }} pagination={{ pageSize:15, showTotal:t=>`Всего ${t}` }}
        rowClassName={r => {
          if (countBadRows(r)>0 && r.status!=="Аннулирован") return "row-warn";
          if (hasExpiredInstruments(r, instruments)) return "row-expired-prot";
          return "";
        }}
        style={{ borderRadius:8 }}/>

      <style>{`
        .row-warn td { background: #fffbe6 !important; }
        .row-warn:hover td { background: #fff8d6 !important; }
        .row-warn > td:first-child { border-left: 3px solid #faad14 !important; }
        .row-expired-prot > td:first-child { border-left: 3px solid #ff4d4f !important; }
      `}</style>
    </div>
  );
}
