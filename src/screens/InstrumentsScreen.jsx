import { useState } from "react";
import {
  Table, Button, Space, Tag, Tooltip, Modal, Form, Input, Select,
  Typography, Switch, notification, Row, Col
} from "antd";
import {
  ThunderboltOutlined, PlusOutlined, EditOutlined,
  StopOutlined, CheckOutlined
} from "@ant-design/icons";
import { LABS } from "../data/mockData";
import { calStatus, uid } from "../utils/helpers";
import { CalTag } from "../components/shared";

const { Title, Text } = Typography;
const { Option } = Select;

const EMPTY = {
  name:"", serial:"", range:"", accuracy:"", lab_id:"",
  date_calibrated:"", date_next_cal:"", cert_num:"", cert_org:"", archived:false
};

export default function InstrumentsScreen({ instruments, setInstruments }) {
  const [api, ctx] = notification.useNotification();
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState(EMPTY);
  const [showArchived, setShow]   = useState(false);
  const [filterStatus, setFilter] = useState("all"); // all | expired | expiring

  // поля обновляются inline через setForm

  const visible = instruments.filter(ins => {
    if (!showArchived && ins.archived) return false;
    if (filterStatus === "expired")  return calStatus(ins) === "expired";
    if (filterStatus === "expiring") return ["expired","expiring"].includes(calStatus(ins));
    return true;
  });

  const openNew  = () => { setEditId("new"); setForm({ ...EMPTY }); };
  const openEdit = ins => { setEditId(ins.id); setForm({ ...ins }); };

  const save = () => {
    if (!form.name.trim() || !form.serial.trim()) {
      api.warning({ message:"Укажите наименование и заводской номер" }); return;
    }
    if (editId === "new") {
      setInstruments(prev => [...prev, { ...form, id:uid() }]);
    } else {
      setInstruments(prev => prev.map(x => x.id === editId ? { ...x, ...form } : x));
    }
    setEditId(null);
    api.success({ message:"Сохранено", duration:2 });
  };

  const toggleArchive = id =>
    setInstruments(prev => prev.map(x => x.id === id ? { ...x, archived:!x.archived } : x));

  const expiredCount  = instruments.filter(x => !x.archived && calStatus(x) === "expired").length;
  const expiringCount = instruments.filter(x => !x.archived && calStatus(x) === "expiring").length;

  const columns = [
    { title:"Наименование / заводской №", key:"name", render:(_, r) => (
      <div>
        <Text strong style={{ fontSize:12, color:r.archived?"#aaa":undefined }}>{r.name}</Text>
        <br/>
        <Text type="secondary" style={{ fontSize:11 }}>Зав. № {r.serial}</Text>
      </div>
    )},
    { title:"Диапазон / класс точности", key:"range", width:200, render:(_, r) => (
      <div>
        <Text style={{ fontSize:11 }}>{r.range || "—"}</Text>
        {r.accuracy && <><br/><Text type="secondary" style={{ fontSize:11 }}>Класс {r.accuracy}</Text></>}
      </div>
    )},
    { title:"Поверка", key:"cal", width:220, render:(_, r) => (
      <div>
        <Space size={4}>
          <CalTag ins={r}/>
          <Text style={{ fontSize:11 }}>{r.date_next_cal || "не задана"}</Text>
        </Space>
        {r.cert_num && <><br/><Text type="secondary" style={{ fontSize:10 }}>{r.cert_num}</Text></>}
        {r.cert_org && <><br/><Text type="secondary" style={{ fontSize:10 }}>{r.cert_org}</Text></>}
      </div>
    )},
    { title:"ЭТЛ", dataIndex:"lab_id", key:"lab", width:180, render: v => {
      const l = LABS.find(x => x.id === v);
      return <Text style={{ fontSize:11 }}>{l?.name || "—"}</Text>;
    }},
    { title:"", key:"act", width:80, render:(_, r) => (
      <Space size={0}>
        <Tooltip title="Редактировать">
          <Button size="small" type="text" icon={<EditOutlined/>} onClick={() => openEdit(r)}/>
        </Tooltip>
        <Tooltip title={r.archived ? "Восстановить" : "Архивировать"}>
          <Button size="small" type="text"
            icon={r.archived
              ? <CheckOutlined style={{ color:"#389e0d" }}/>
              : <StopOutlined  style={{ color:"#aaa" }}/>}
            onClick={() => toggleArchive(r.id)}/>
        </Tooltip>
      </Space>
    )},
  ];

  return (
    <div style={{ padding:24 }}>
      {ctx}

      {/* Заголовок */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <div>
          <Title level={4} style={{ margin:0, color:"#0f2744" }}>
            <ThunderboltOutlined style={{ marginRight:10, color:"#1a5fa8" }}/>
            Реестр измерительных приборов
          </Title>
        </div>
        <Button type="primary" icon={<PlusOutlined/>} onClick={openNew}>Добавить прибор</Button>
      </div>

      {/* Фильтры и переключатели */}
      <Space wrap style={{ marginBottom:14 }}>
        <Button
          size="small"
          type={filterStatus==="all" ? "primary" : "default"}
          onClick={() => setFilter("all")}>
          Все ({instruments.filter(x=>!x.archived).length})
        </Button>
        <Button
          size="small" danger
          type={filterStatus==="expired" ? "primary" : "default"}
          onClick={() => setFilter("expired")}
          disabled={expiredCount === 0}>
          Просрочена ({expiredCount})
        </Button>
        <Button
          size="small"
          style={filterStatus==="expiring" ? {} : { borderColor:"#faad14", color:"#d46b08" }}
          type={filterStatus==="expiring" ? "primary" : "default"}
          onClick={() => setFilter("expiring")}
          disabled={expiringCount === 0}>
          Истекает скоро ({expiringCount})
        </Button>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <Switch checked={showArchived} onChange={setShow} size="small"/>
          <Text style={{ fontSize:12 }}>Показать архивные</Text>
        </div>
      </Space>

      <Table
        dataSource={visible}
        rowKey="id"
        columns={columns}
        size="small"
        pagination={{ pageSize:15, showTotal:t=>`Всего ${t}` }}
        style={{ borderRadius:8 }}
        rowClassName={r => {
          const s = calStatus(r);
          if (r.archived) return "row-archived";
          if (s === "expired")  return "row-expired";
          if (s === "expiring") return "row-expiring";
          return "";
        }}
      />

      {/* Модал создания / редактирования */}
      <Modal
        open={!!editId}
        title={editId === "new" ? "Новый измерительный прибор" : "Редактировать прибор"}
        width={660}
        onOk={save}
        onCancel={() => setEditId(null)}
        okText="Сохранить"
        destroyOnClose
      >
        <Form layout="vertical" style={{ marginTop:8 }}>
          <Row gutter={12}>
            <Col span={16}>
              <Form.Item label="Наименование *">
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({...f, name:e.target.value}))}
                  placeholder="напр.: Мегаомметр ЭСО202/2-Г"/>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Заводской номер *">
                <Input
                  value={form.serial}
                  onChange={e => setForm(f => ({...f, serial:e.target.value}))}/>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Диапазон измерения">
                <Input
                  value={form.range}
                  onChange={e => setForm(f => ({...f, range:e.target.value}))}
                  placeholder="напр.: 100 МОм – 10 ГОм"/>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Класс точности">
                <Input
                  value={form.accuracy}
                  onChange={e => setForm(f => ({...f, accuracy:e.target.value}))}
                  placeholder="напр.: 1.0"/>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="ЭТЛ">
                <Select
                  value={form.lab_id || undefined}
                  onChange={v => setForm(f => ({...f, lab_id:v}))}
                  allowClear placeholder="—">
                  {LABS.map(l => <Option key={l.id} value={l.id}>{l.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item label="Дата последней поверки">
                <Input type="date" value={form.date_calibrated}
                  onChange={e => setForm(f => ({...f, date_calibrated:e.target.value}))}/>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Дата следующей поверки">
                <Input type="date" value={form.date_next_cal}
                  onChange={e => setForm(f => ({...f, date_next_cal:e.target.value}))}/>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Номер аттестата">
                <Input value={form.cert_num}
                  onChange={e => setForm(f => ({...f, cert_num:e.target.value}))}/>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Орган поверки">
            <Input value={form.cert_org}
              onChange={e => setForm(f => ({...f, cert_org:e.target.value}))}
              placeholder="напр.: ФБУ «Алтайский ЦСМ»"/>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .row-archived td { opacity: 0.45; }
        .row-expired  > td:first-child { border-left: 3px solid #ff4d4f !important; }
        .row-expiring > td:first-child { border-left: 3px solid #faad14 !important; }
      `}</style>
    </div>
  );
}
