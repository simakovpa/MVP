import { useState } from "react";
import {
  Tabs, Table, Button, Space, Tag, Tooltip, Modal, Form, Input, Select,
  Typography, Switch, notification, Row, Col, Radio, Popconfirm,
  Checkbox, Badge, Alert, Divider
} from "antd";
import {
  PlusOutlined, EditOutlined, StopOutlined, CheckOutlined, DeleteOutlined,
  WarningOutlined, ControlOutlined, SafetyCertificateOutlined
} from "@ant-design/icons";
import { EQUIP_TYPES, NOMENCLATURES, LABS } from "../data/mockData";
import { uid } from "../utils/helpers";
import { ZoneEditor, CalTag } from "../components/shared";

const { Title, Text } = Typography;
const { Option } = Select;

// ─── Вкладка 1: Виды работ и параметры ──────────────────────────────────────
function Tab1WorkTypes({ workTypes, setWorkTypes, params, setParams, api }) {
  const [subTab, setSubTab]   = useState("wt");
  const [editWT, setEditWT]   = useState(null);
  const [wtForm, setWtForm]   = useState({});
  const [editP, setEditP]     = useState(null);
  const [pForm, setPForm]     = useState({});

  const emptyWT = { name:"", type:"Эксплуатационные", norm_doc:"",
    env_fields:{ temp:true, humidity:false, pressure:false },
    params:[], archived:false };
  const emptyP  = { name:"", unit:"", compare:"min", archived:false };
  const compareLabels = { min:"Не менее (≥)", max:"Не более (≤)", exact:"Точное (=)", range:"Диапазон" };
  const testTypes = ["Эксплуатационные","Приёмо-сдаточные","Внеплановые","Контрольные"];

  const moveParam = (idx, dir) => {
    const arr = [...wtForm.params];
    const t = idx + dir;
    if (t < 0 || t >= arr.length) return;
    [arr[idx], arr[t]] = [arr[t], arr[idx]];
    setWtForm(f => ({...f, params:arr}));
  };

  const saveWT = () => {
    if (!wtForm.name?.trim()) { api.warning({ message:"Укажите наименование" }); return; }
    if (editWT === "new") setWorkTypes(prev => [...prev, {...wtForm, id:uid()}]);
    else setWorkTypes(prev => prev.map(w => w.id===editWT ? {...w,...wtForm} : w));
    setEditWT(null); api.success({ message:"Сохранено", duration:2 });
  };

  const saveP = () => {
    if (!pForm.name?.trim() || !pForm.unit?.trim()) {
      api.warning({ message:"Укажите наименование и единицу" }); return;
    }
    if (editP === "new") setParams(prev => [...prev, {...pForm, id:uid()}]);
    else setParams(prev => prev.map(p => p.id===editP ? {...p,...pForm} : p));
    setEditP(null); api.success({ message:"Сохранено", duration:2 });
  };

  const ENV_OPTS = [
    { key:"temp",     label:"Температура воздуха, °C" },
    { key:"humidity", label:"Относительная влажность, %" },
    { key:"pressure", label:"Атмосферное давление, мм рт. ст." },
  ];

  return (
    <Tabs activeKey={subTab} onChange={setSubTab} size="small" type="card" items={[
      {
        key:"wt", label:"Виды работ",
        children:(
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <Text type="secondary" style={{ fontSize:12 }}>Шаблоны протоколов — параметры измерений и условий</Text>
              <Button size="small" type="primary" icon={<PlusOutlined/>}
                onClick={() => { setEditWT("new"); setWtForm({...emptyWT,params:[]}); }}>
                Добавить
              </Button>
            </div>
            <Table dataSource={workTypes} rowKey="id" size="small" pagination={false}
              style={{ borderRadius:8 }}
              rowClassName={r => r.archived ? "row-archived" : ""}
              expandable={{ expandedRowRender: r => (
                <div style={{ paddingLeft:24, paddingBottom:8 }}>
                  <Space wrap>
                    {r.params.map((pt,i) => {
                      const pr = params.find(p => p.id===pt.param_id);
                      return <Tag key={pt.param_id} style={{ fontSize:11 }}>{i+1}. {pr?.name} ({pr?.unit})</Tag>;
                    })}
                  </Space>
                  <div style={{ marginTop:6 }}>
                    <Text type="secondary" style={{ fontSize:11 }}>Параметры среды: </Text>
                    {ENV_OPTS.filter(o => r.env_fields?.[o.key]).map(o =>
                      <Tag key={o.key} color="geekblue" style={{ fontSize:10 }}>{o.label}</Tag>
                    )}
                    {!ENV_OPTS.some(o => r.env_fields?.[o.key]) &&
                      <Text type="secondary" style={{ fontSize:11 }}>не заданы</Text>}
                  </div>
                </div>
              )}}
              columns={[
                { title:"Вид работы", dataIndex:"name", key:"n",
                  render:(v,r) => <Text strong style={{ fontSize:12, color:r.archived?"#aaa":undefined }}>{v}</Text> },
                { title:"Тип испытаний", dataIndex:"type", key:"t",
                  render:(v,r) => <Tag color={r.archived?"default":"blue"} style={{ fontSize:10 }}>{v}</Tag> },
                { title:"НТД", dataIndex:"norm_doc", key:"nd",
                  render:v => <Text type="secondary" style={{ fontSize:11 }}>{v||"—"}</Text> },
                { title:"Парам.", key:"pc", width:60,
                  render:(_,r) => <Badge count={r.params.length} color="#1a5fa8" showZero/> },
                { title:"", key:"act", width:80, render:(_,r) => (
                  <Space size={0}>
                    <Tooltip title="Редактировать">
                      <Button size="small" type="text" icon={<EditOutlined/>}
                        onClick={() => { setEditWT(r.id); setWtForm({...r, params:r.params.map(p=>({...p})), env_fields:{...(r.env_fields||{temp:false,humidity:false,pressure:false})} }); }}/>
                    </Tooltip>
                    <Tooltip title={r.archived?"Восстановить":"Архивировать"}>
                      <Button size="small" type="text"
                        icon={r.archived ? <CheckOutlined style={{ color:"#389e0d" }}/> : <StopOutlined style={{ color:"#aaa" }}/>}
                        onClick={() => setWorkTypes(prev => prev.map(w => w.id===r.id ? {...w,archived:!w.archived} : w))}/>
                    </Tooltip>
                  </Space>
                )},
              ]}
            />

            {/* Модал вида работы */}
            <Modal open={!!editWT}
              title={editWT==="new" ? "Новый вид работы" : "Редактировать вид работы"}
              width={680} onOk={saveWT} onCancel={() => setEditWT(null)} okText="Сохранить">
              <Form layout="vertical" style={{ marginTop:8 }}>
                <Form.Item label="Наименование *">
                  <Input value={wtForm.name||""} onChange={e => setWtForm(f=>({...f,name:e.target.value}))}
                    placeholder="напр.: Измерение сопр. изоляции и tgδ"/>
                </Form.Item>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item label="Тип испытаний">
                      <Select value={wtForm.type} onChange={v => setWtForm(f=>({...f,type:v}))}>
                        {testTypes.map(t => <Option key={t}>{t}</Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Ссылка на НТД">
                      <Input value={wtForm.norm_doc||""} onChange={e => setWtForm(f=>({...f,norm_doc:e.target.value}))}
                        placeholder="напр.: ПТЭЭП Прил.3"/>
                    </Form.Item>
                  </Col>
                </Row>

                {/* Параметры окружающей среды */}
                <Form.Item label="Параметры окружающей среды">
                  <div style={{ padding:"10px 12px", background:"#f8fafc", borderRadius:6, border:"1px solid #e8ecf1" }}>
                    <Text type="secondary" style={{ fontSize:11, display:"block", marginBottom:8 }}>
                      Отмеченные поля будут отображаться в протоколе. Все поля необязательные — исполнитель заполняет по ситуации.
                    </Text>
                    <Space direction="vertical" size={4}>
                      {ENV_OPTS.map(o => (
                        <Checkbox key={o.key}
                          checked={!!(wtForm.env_fields?.[o.key])}
                          onChange={e => setWtForm(f => ({
                            ...f,
                            env_fields: { ...(f.env_fields||{}), [o.key]: e.target.checked }
                          }))}>
                          <Text style={{ fontSize:12 }}>{o.label}</Text>
                        </Checkbox>
                      ))}
                    </Space>
                  </div>
                </Form.Item>

                {/* Состав параметров */}
                <Form.Item label="Состав измеряемых параметров">
                  <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:8 }}>
                    {(!wtForm.params || wtForm.params.length===0) &&
                      <Text type="secondary" style={{ fontSize:12 }}>Добавьте параметры из справочника</Text>}
                    {(wtForm.params||[]).map((pt,i) => {
                      const pr = params.find(p => p.id===pt.param_id);
                      return (
                        <div key={pt.param_id} style={{ display:"flex", alignItems:"center", gap:8,
                          padding:"6px 10px", borderRadius:6, background:"#f5f8ff", border:"1px solid #dde3ec" }}>
                          <Text style={{ fontSize:11, color:"#888", minWidth:18 }}>{i+1}.</Text>
                          <Text style={{ flex:1, fontSize:12 }}>{pr?.name} <Text type="secondary">({pr?.unit})</Text></Text>
                          <Space size={2}>
                            <Button size="small" type="text" disabled={i===0} onClick={() => moveParam(i,-1)}>↑</Button>
                            <Button size="small" type="text" disabled={i===(wtForm.params.length-1)} onClick={() => moveParam(i,1)}>↓</Button>
                            <Button size="small" type="text" danger icon={<DeleteOutlined/>}
                              onClick={() => setWtForm(f=>({...f, params:f.params.filter(p=>p.param_id!==pt.param_id)}))}/>
                          </Space>
                        </div>
                      );
                    })}
                  </div>
                  <Select placeholder="Добавить параметр из справочника..." style={{ width:"100%" }}
                    value={null}
                    onChange={v => {
                      if ((wtForm.params||[]).find(p=>p.param_id===v)) {
                        api.warning({ message:"Параметр уже добавлен", duration:2 }); return;
                      }
                      setWtForm(f => ({...f, params:[...(f.params||[]), { param_id:v, order:(f.params||[]).length+1 }]}));
                    }}>
                    {params.filter(p => !p.archived && !(wtForm.params||[]).find(pt=>pt.param_id===p.id))
                      .map(p => <Option key={p.id} value={p.id}>{p.name} ({p.unit})</Option>)}
                  </Select>
                </Form.Item>
              </Form>
            </Modal>
            <style>{`.row-archived td { opacity:0.45; }`}</style>
          </div>
        )
      },
      {
        key:"params", label:"Измеряемые параметры",
        children:(
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
              <Text type="secondary" style={{ fontSize:12 }}>Справочник параметров</Text>
              <Button size="small" type="primary" icon={<PlusOutlined/>}
                onClick={() => { setEditP("new"); setPForm({...emptyP}); }}>
                Добавить
              </Button>
            </div>
            <Table dataSource={params} rowKey="id" size="small" pagination={false}
              style={{ borderRadius:8, maxWidth:700 }}
              rowClassName={r => r.archived ? "row-archived" : ""}
              columns={[
                { title:"Наименование", dataIndex:"name", key:"n",
                  render:(v,r) => <Text style={{ fontSize:12, color:r.archived?"#aaa":undefined }}>{v}</Text> },
                { title:"Ед. изм.", dataIndex:"unit", key:"u", width:80 },
                { title:"Сравнение", dataIndex:"compare", key:"c", width:160,
                  render:v => <Tag style={{ fontSize:11 }}>{compareLabels[v]}</Tag> },
                { title:"Используется в", key:"uses", width:220,
                  render:(_,r) => {
                    const uses = workTypes.filter(w => w.params.find(p=>p.param_id===r.id));
                    return uses.length===0 ? <Text type="secondary" style={{ fontSize:11 }}>—</Text>
                      : uses.map(w=><Tag key={w.id} style={{ fontSize:10,marginBottom:2 }}>{w.name}</Tag>);
                  }},
                { title:"", key:"act", width:80, render:(_,r) => (
                  <Space size={0}>
                    <Button size="small" type="text" icon={<EditOutlined/>}
                      onClick={() => { setEditP(r.id); setPForm({...r}); }}/>
                    <Button size="small" type="text"
                      icon={r.archived ? <CheckOutlined style={{ color:"#389e0d" }}/> : <StopOutlined style={{ color:"#aaa" }}/>}
                      onClick={() => setParams(prev=>prev.map(p=>p.id===r.id?{...p,archived:!p.archived}:p))}/>
                  </Space>
                )},
              ]}
            />
            <Modal open={!!editP}
              title={editP==="new" ? "Новый параметр" : "Редактировать параметр"}
              onOk={saveP} onCancel={() => setEditP(null)} okText="Сохранить">
              <Form layout="vertical" style={{ marginTop:8 }}>
                <Form.Item label="Наименование *">
                  <Input value={pForm.name||""} onChange={e=>setPForm(f=>({...f,name:e.target.value}))}/>
                </Form.Item>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item label="Единица измерения *">
                      <Input value={pForm.unit||""} onChange={e=>setPForm(f=>({...f,unit:e.target.value}))} placeholder="напр.: МОм"/>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Тип сравнения">
                      <Select value={pForm.compare} onChange={v=>setPForm(f=>({...f,compare:v}))}>
                        {Object.entries(compareLabels).map(([k,v])=><Option key={k} value={k}>{v}</Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                {editP!=="new" && (() => {
                  const uses = workTypes.filter(w=>w.params.find(p=>p.param_id===editP));
                  return uses.length>0
                    ? <Alert type="info" showIcon message={`Используется в ${uses.length} вид(ах) работ`}/>
                    : null;
                })()}
              </Form>
            </Modal>
          </div>
        )
      }
    ]}/>
  );
}

// ─── Вкладка ЭТЛ ─────────────────────────────────────────────────────────────
function TabETL({ labs, setLabs, api }) {
  const [editId, setEditId] = useState(null);
  const empty = { name:"", type:"Собственная", cert:"", exp:"", archived:false };
  const [form, setForm] = useState(empty);

  const labStatus = l => {
    if (!l.exp) return "none";
    const exp = new Date(l.exp), now = new Date();
    const warn = new Date(); warn.setDate(warn.getDate()+30);
    if (exp <= now) return "expired";
    if (exp <= warn) return "expiring";
    return "ok";
  };
  const labTag = l => {
    const s = labStatus(l);
    if (s==="expired")  return <Tag color="error"   style={{ fontSize:10 }}>Истекло</Tag>;
    if (s==="expiring") return <Tag color="warning" style={{ fontSize:10 }}>Истекает</Tag>;
    if (s==="none")     return <Tag style={{ fontSize:10 }}>Нет даты</Tag>;
    return <Tag color="success" style={{ fontSize:10 }}>Действительно</Tag>;
  };

  const save = () => {
    if (!form.name?.trim()) { api.warning({ message:"Укажите наименование" }); return; }
    if (editId==="new") setLabs(prev=>[...prev,{...form,id:uid()}]);
    else setLabs(prev=>prev.map(x=>x.id===editId?{...x,...form}:x));
    setEditId(null); api.success({ message:"Сохранено", duration:2 });
  };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
        <Text type="secondary" style={{ fontSize:12 }}>Реестр электроизмерительных лабораторий</Text>
        <Button size="small" type="primary" icon={<PlusOutlined/>}
          onClick={() => { setEditId("new"); setForm({...empty}); }}>Добавить</Button>
      </div>
      <Table dataSource={labs} rowKey="id" size="small" pagination={false} style={{ borderRadius:8 }}
        columns={[
          { title:"Наименование", dataIndex:"name", key:"n",
            render:(v,r) => <Text strong style={{ fontSize:12 }}>{v}{r.archived && <Tag style={{ marginLeft:6,fontSize:10 }}>архив</Tag>}</Text> },
          { title:"Тип", dataIndex:"type", key:"t",
            render:v => <Tag color={v==="Собственная"?"green":"orange"} style={{ fontSize:10 }}>{v}</Tag> },
          { title:"Свидетельство ЭТЛ", key:"cert", render:(_,r) => (
            <div>
              <Text style={{ fontSize:12 }}>{r.cert||"—"}</Text>
              {r.exp && <><br/><Text type="secondary" style={{ fontSize:11 }}>до {r.exp}</Text></>}
            </div>
          )},
          { title:"Статус", key:"s", width:140, render:(_,r) => labTag(r) },
          { title:"", key:"act", width:80, render:(_,r) => (
            <Space size={0}>
              <Button size="small" type="text" icon={<EditOutlined/>}
                onClick={() => { setEditId(r.id); setForm({...r}); }}/>
              <Button size="small" type="text"
                icon={r.archived?<CheckOutlined style={{ color:"#389e0d" }}/>:<StopOutlined style={{ color:"#aaa" }}/>}
                onClick={() => setLabs(prev=>prev.map(x=>x.id===r.id?{...x,archived:!x.archived}:x))}/>
            </Space>
          )},
        ]}
      />
      <Modal open={!!editId} title={editId==="new"?"Новая ЭТЛ":"Редактировать ЭТЛ"}
        onOk={save} onCancel={()=>setEditId(null)} okText="Сохранить">
        <Form layout="vertical" style={{ marginTop:8 }}>
          <Form.Item label="Наименование *">
            <Input value={form.name||""} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="Тип">
                <Select value={form.type} onChange={v=>setForm(f=>({...f,type:v}))}>
                  <Option value="Собственная">Собственная</Option>
                  <Option value="Подрядная">Подрядная</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="№ свидетельства о регистрации">
                <Input value={form.cert||""} onChange={e=>setForm(f=>({...f,cert:e.target.value}))}/>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Дата окончания действия свидетельства">
            <Input type="date" value={form.exp||""} onChange={e=>setForm(f=>({...f,exp:e.target.value}))}/>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// ─── Экспортируемый экран ЭТЛ ───────────────────────────────────────────────
export function LabsScreen({ labs, setLabs }) {
  const [api, ctx] = notification.useNotification();
  return (
    <div style={{ padding:24 }}>
      {ctx}
      <div style={{ marginBottom:20 }}>
        <span style={{ fontSize:18, fontWeight:700, color:"#0f2744" }}>
          <span style={{ marginRight:10, color:"#1a5fa8" }}>🏛</span>
          Реестр электротехнических лабораторий
        </span>
      </div>
      <TabETL labs={labs} setLabs={setLabs} api={api}/>
    </div>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────
export default function NormativesScreen({
  normRanges, setNormRanges,
  passportNorms, setPassportNorms,
  overrides, setOverrides,
  nomenclatures, setNomenclatures,
  workTypes, setWorkTypes,
  params, setParams,
  labs, setLabs,
}) {
  const [api, ctx] = notification.useNotification();
  const [tab, setTab]     = useState("work_types");
  const [editNr, setEditNr] = useState(null);
  const [nrForm, setNrForm] = useState({ type_id:"", param_id:"", source:"", zones:[] });
  const [editPn, setEditPn] = useState(null);
  const [pnForm, setPnForm] = useState({ param_id:"", source:"", nomenclature_ids:[], zones:[] });
  const [editOv, setEditOv] = useState(null);
  const [ovForm, setOvForm] = useState({ bind_type:"nomenclature", bind_id:"", param_id:"", action_type:"permanent", reason:"", zones:[] });

  const newNoms = nomenclatures.filter(n => !n.accepted);

  const bindOptions = type => {
    if (type==="equipment_type") return EQUIP_TYPES.map(x=>({label:x.name,value:x.id}));
    if (type==="nomenclature")   return NOMENCLATURES.map(x=>({label:x.name,value:x.id}));
    return [];
  };
  const bindLabel = ov => {
    const labels = { equipment_type:"Тип ТМЦ", nomenclature:"Номенклатура", tmcz:"ТМЦ" };
    const name = ov.bind_type==="equipment_type"
      ? EQUIP_TYPES.find(x=>x.id===ov.bind_id)?.name
      : NOMENCLATURES.find(x=>x.id===ov.bind_id)?.name || ov.bind_id;
    return `${labels[ov.bind_type]}: ${name}`;
  };

  return (
    <div style={{ padding:24 }}>
      {ctx}
      <Title level={4} style={{ margin:"0 0 20px", color:"#0f2744" }}>
        <ControlOutlined style={{ marginRight:10, color:"#1a5fa8" }}/>Справочник нормативов
      </Title>
      <Tabs activeKey={tab} onChange={setTab} items={[
        {
          key:"work_types",
          label:"1. Виды работ и параметры",
          children:<Tab1WorkTypes workTypes={workTypes} setWorkTypes={setWorkTypes} params={params} setParams={setParams} api={api}/>
        },
        {
          key:"ranges",
          label:"2. Нормативные диапазоны",
          children:(
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                <Text type="secondary" style={{ fontSize:12 }}>По типу ТМЦ · источник: ПУЭ, ПТЭЭП, СТО</Text>
                <Button size="small" type="primary" icon={<PlusOutlined/>}
                  onClick={() => { setEditNr("new"); setNrForm({ type_id:"", param_id:"", source:"", zones:[] }); }}>Добавить</Button>
              </div>
              <Table dataSource={normRanges} rowKey="id" size="small" pagination={false} style={{ borderRadius:8 }}
                columns={[
                  { title:"Тип ТМЦ", dataIndex:"type_id", key:"t", render:v=>EQUIP_TYPES.find(x=>x.id===v)?.name },
                  { title:"Параметр", dataIndex:"param_id", key:"p", render:v=>{ const pr=params.find(x=>x.id===v); return pr?`${pr.name} (${pr.unit})`:"—"; }},
                  { title:"Источник НТД", dataIndex:"source", key:"s", render:v=><Text type="secondary" style={{ fontSize:11 }}>{v}</Text> },
                  { title:"Зоны", key:"z", render:(_,r)=>r.zones.map(z=><Tag key={z.id} color={z.color} style={{ fontSize:10,marginBottom:2 }}>{z.label}</Tag>) },
                  { title:"", key:"act", width:72, render:(_,r)=>(
                    <Space size={0}>
                      <Button size="small" type="text" icon={<EditOutlined/>}
                        onClick={() => { setEditNr(r.id); setNrForm({...r,zones:r.zones.map(z=>({...z}))}); }}/>
                      <Popconfirm title="Удалить диапазон?" okText="Удалить" okButtonProps={{ danger:true }} cancelText="Отмена"
                        onConfirm={() => { setNormRanges(prev=>prev.filter(x=>x.id!==r.id)); api.success({ message:"Удалено", duration:2 }); }}>
                        <Button size="small" type="text" icon={<DeleteOutlined style={{ color:"#ff4d4f" }}/>}/>
                      </Popconfirm>
                    </Space>
                  )},
                ]}
              />
              <Modal open={!!editNr} title={editNr==="new"?"Новый нормативный диапазон":"Редактировать диапазон"} width={900}
                onOk={() => {
                  if (editNr==="new") setNormRanges(prev=>[...prev,{...nrForm,id:uid()}]);
                  else setNormRanges(prev=>prev.map(x=>x.id===editNr?{...x,...nrForm}:x));
                  setEditNr(null); api.success({ message:"Сохранено", duration:2 });
                }}
                onCancel={() => setEditNr(null)} okText="Сохранить">
                <Form layout="vertical" style={{ marginTop:8 }}>
                  <Form.Item label="Параметр *">
                    <Select value={nrForm.param_id} onChange={v=>setNrForm(f=>({...f,param_id:v}))}
                      showSearch filterOption={(input,opt)=>String(opt?.label??"").toLowerCase().includes(input.toLowerCase())}
                      options={params.map(p=>({ value:p.id, label:`${p.name} (${p.unit})` }))}
                      placeholder="Выберите параметр измерения"/>
                  </Form.Item>
                  <Row gutter={12}>
                    <Col span={8}>
                      <Form.Item label="Тип ТМЦ *">
                        <Select value={nrForm.type_id} onChange={v=>setNrForm(f=>({...f,type_id:v}))}>
                          {EQUIP_TYPES.map(t=><Option key={t.id} value={t.id}>{t.name}</Option>)}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Источник НТД">
                        <Input value={nrForm.source} onChange={e=>setNrForm(f=>({...f,source:e.target.value}))} placeholder="напр.: СТО 34.01 табл.10.1.1"/>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="Диапазоны зон *">
                    <ZoneEditor zones={nrForm.zones} onChange={z=>setNrForm(f=>({...f,zones:z}))}/>
                  </Form.Item>
                </Form>
              </Modal>
            </div>
          )
        },
        {
          key:"passport",
          label:<span>3. Паспортные нормативы {newNoms.length>0 && <Badge count={newNoms.length} style={{ marginLeft:4 }}/>}</span>,
          children:(
            <div>
              <Alert type={newNoms.length>0?"warning":"success"} showIcon style={{ marginBottom:12 }}
                message={newNoms.length>0
                  ? `${newNoms.length} номенклатур ожидают рассмотрения`
                  : "Все номенклатуры рассмотрены"}/>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                <Text type="secondary" style={{ fontSize:12 }}>Нормативы по данным производителя</Text>
                <Button size="small" type="primary" icon={<PlusOutlined/>}
                  onClick={() => { setEditPn("new"); setPnForm({ param_id:"", source:"", nomenclature_ids:[], zones:[] }); }}>Добавить</Button>
              </div>
              <Table dataSource={passportNorms} rowKey="id" size="small" pagination={false} style={{ borderRadius:8 }}
                columns={[
                  { title:"Параметр", dataIndex:"param_id", key:"p", render:v=>{ const pr=params.find(x=>x.id===v); return pr?`${pr.name} (${pr.unit})`:"—"; }},
                  { title:"Источник", dataIndex:"source", key:"s", render:v=><Text type="secondary" style={{ fontSize:11 }}>{v}</Text> },
                  { title:"Номенклатуры", key:"nm", render:(_,r)=>r.nomenclature_ids.map(id=>{
                    const nm=NOMENCLATURES.find(x=>x.id===id);
                    return <Tag key={id} color="geekblue" style={{ fontSize:11,marginBottom:2 }}>{nm?.name}</Tag>;
                  })},
                  { title:"Зоны", key:"z", render:(_,r)=>r.zones.map(z=><Tag key={z.id} color={z.color} style={{ fontSize:10,marginBottom:2 }}>{z.label}</Tag>) },
                  { title:"", key:"act", width:72, render:(_,r)=>(
                    <Space size={0}>
                      <Button size="small" type="text" icon={<EditOutlined/>}
                        onClick={() => { setEditPn(r.id); setPnForm({...r,zones:r.zones.map(z=>({...z}))}); }}/>
                      <Popconfirm title="Удалить норматив?" okText="Удалить" okButtonProps={{ danger:true }} cancelText="Отмена"
                        onConfirm={() => { setPassportNorms(prev=>prev.filter(x=>x.id!==r.id)); api.success({ message:"Удалено", duration:2 }); }}>
                        <Button size="small" type="text" icon={<DeleteOutlined style={{ color:"#ff4d4f" }}/>}/>
                      </Popconfirm>
                    </Space>
                  )},
                ]}
              />
              <Modal open={!!editPn} title={editPn==="new"?"Новый паспортный норматив":"Редактировать"} width={760}
                onOk={() => {
                  const save = editPn==="new"
                    ? [...passportNorms,{...pnForm,id:uid()}]
                    : passportNorms.map(x=>x.id===editPn?{...x,...pnForm}:x);
                  setPassportNorms(save);
                  setNomenclatures(prev=>prev.map(n=>pnForm.nomenclature_ids.includes(n.id)?{...n,accepted:true}:n));
                  setEditPn(null); api.success({ message:"Сохранено. Флаг «принято лабораторией» установлен.", duration:3 });
                }}
                onCancel={() => setEditPn(null)} okText="Сохранить">
                <Form layout="vertical" style={{ marginTop:8 }}>
                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item label="Параметр *">
                        <Select value={pnForm.param_id} onChange={v=>setPnForm(f=>({...f,param_id:v}))}>
                          {params.map(p=><Option key={p.id} value={p.id}>{p.name} ({p.unit})</Option>)}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Источник">
                        <Input value={pnForm.source||""} onChange={e=>setPnForm(f=>({...f,source:e.target.value}))}/>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="Номенклатуры *">
                    <Select mode="multiple" value={pnForm.nomenclature_ids}
                      onChange={v=>setPnForm(f=>({...f,nomenclature_ids:v}))} placeholder="Выберите">
                      {NOMENCLATURES.map(n=>{
                        const t=EQUIP_TYPES.find(x=>x.id===n.type_id);
                        return <Option key={n.id} value={n.id}>{n.name} <Text type="secondary" style={{ fontSize:11 }}>({t?.name})</Text></Option>;
                      })}
                    </Select>
                  </Form.Item>
                  <Form.Item label="Диапазоны зон *">
                    <ZoneEditor zones={pnForm.zones} onChange={z=>setPnForm(f=>({...f,zones:z}))}/>
                  </Form.Item>
                </Form>
              </Modal>
              {newNoms.length>0 && (
                <>
                  <Divider orientation="left" style={{ fontSize:13 }}>
                    <WarningOutlined style={{ color:"#fa8c16", marginRight:6 }}/>
                    Очередь новых номенклатур ({newNoms.length})
                  </Divider>
                  <Table dataSource={newNoms} rowKey="id" size="small" pagination={false} style={{ borderRadius:8 }}
                    columns={[
                      { title:"Номенклатура", dataIndex:"name", key:"n", render:v=><Text strong>{v}</Text> },
                      { title:"Тип ТМЦ", dataIndex:"type_id", key:"t", render:v=>EQUIP_TYPES.find(x=>x.id===v)?.name },
                      { title:"", key:"act", render:(_,r) => (
                        <Space>
                          <Button size="small" icon={<PlusOutlined/>}
                            onClick={() => { setEditPn("new"); setPnForm({ param_id:"", source:"", nomenclature_ids:[r.id], zones:[] }); }}>
                            Назначить норматив
                          </Button>
                          <Popconfirm title="Подтвердить без норматива?" description="Подчиняется общим нормам."
                            onConfirm={() => { setNomenclatures(prev=>prev.map(n=>n.id===r.id?{...n,accepted:true}:n)); api.success({ message:"Помечено", duration:2 }); }}>
                            <Button size="small" icon={<CheckOutlined/>}>Общие нормы</Button>
                          </Popconfirm>
                        </Space>
                      )},
                    ]}
                  />
                </>
              )}
            </div>
          )
        },
        {
          key:"overrides",
          label:"4. Переопределения",
          children:(
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                <Text type="secondary" style={{ fontSize:12 }}>Ручные изменения нормативов с обоснованием</Text>
                <Button size="small" type="primary" icon={<PlusOutlined/>}
                  onClick={() => { setEditOv("new"); setOvForm({ bind_type:"nomenclature", bind_id:"", param_id:"", action_type:"permanent", reason:"", zones:[] }); }}>
                  Создать
                </Button>
              </div>
              <Table dataSource={overrides} rowKey="id" size="small" pagination={false} style={{ borderRadius:8 }}
                columns={[
                  { title:"Привязка", key:"b", render:(_,r)=><Text style={{ fontSize:12 }}>{bindLabel(r)}</Text> },
                  { title:"Параметр", dataIndex:"param_id", key:"p", render:v=>{ const pr=params.find(x=>x.id===v); return pr?`${pr.name} (${pr.unit})`:"—"; }},
                  { title:"Тип", dataIndex:"action_type", key:"at", render:v=>
                    <Tag color={v==="permanent"?"volcano":"gold"}>{v==="permanent"?"Постоянное":"Разовое"}</Tag> },
                  { title:"Зоны", key:"z", render:(_,r)=>r.zones.map(z=><Tag key={z.id} color={z.color} style={{ fontSize:10,marginBottom:2 }}>{z.label}</Tag>) },
                  { title:"Обоснование", dataIndex:"reason", key:"r", render:v=>
                    <Tooltip title={v}><Text style={{ fontSize:11 }}>{v.length>40?v.slice(0,40)+"…":v}</Text></Tooltip> },
                  { title:"Активно", dataIndex:"active", key:"ac", width:72, render:(v,r)=>
                    <Switch checked={v} size="small" onChange={c=>setOverrides(prev=>prev.map(x=>x.id===r.id?{...x,active:c}:x))}/> },
                  { title:"", key:"act", width:72, render:(_,r)=>(
                    <Space size={0}>
                      <Button size="small" type="text" icon={<EditOutlined/>}
                        onClick={() => { setEditOv(r.id); setOvForm({...r,zones:r.zones.map(z=>({...z}))}); }}/>
                      <Popconfirm title="Удалить переопределение?" okText="Удалить" okButtonProps={{ danger:true }} cancelText="Отмена"
                        onConfirm={() => { setOverrides(prev=>prev.filter(x=>x.id!==r.id)); api.success({ message:"Удалено", duration:2 }); }}>
                        <Button size="small" type="text" icon={<DeleteOutlined style={{ color:"#ff4d4f" }}/>}/>
                      </Popconfirm>
                    </Space>
                  )},
                ]}
              />
              <Modal open={!!editOv}
                title={editOv==="new"?"Новое переопределение нормы":"Редактировать переопределение"}
                width={760}
                onOk={() => {
                  if (!ovForm.reason.trim()) { api.warning({ message:"Обоснование обязательно" }); return; }
                  if (editOv==="new") setOverrides(prev=>[...prev,{...ovForm,id:uid(),active:true,author:"em1",created:new Date().toISOString().slice(0,10)}]);
                  else setOverrides(prev=>prev.map(x=>x.id===editOv?{...x,...ovForm}:x));
                  setEditOv(null); api.success({ message:editOv==="new"?"Создано":"Сохранено", duration:2 });
                }}
                onCancel={() => setEditOv(null)} okText={editOv==="new"?"Создать":"Сохранить"}>
                <Form layout="vertical" style={{ marginTop:8 }}>
                  <Row gutter={12}>
                    <Col span={8}>
                      <Form.Item label="Уровень привязки *">
                        <Select value={ovForm.bind_type} onChange={v=>setOvForm(f=>({...f,bind_type:v,bind_id:""}))}>
                          <Option value="equipment_type">Тип ТМЦ</Option>
                          <Option value="nomenclature">Номенклатура</Option>
                          <Option value="tmcz">Конкретный ТМЦ</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Объект *">
                        <Select value={ovForm.bind_id} onChange={v=>setOvForm(f=>({...f,bind_id:v}))}
                          options={bindOptions(ovForm.bind_type)} placeholder="Выберите"/>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Параметр *">
                        <Select value={ovForm.param_id} onChange={v=>setOvForm(f=>({...f,param_id:v}))}>
                          {params.map(p=><Option key={p.id} value={p.id}>{p.name} ({p.unit})</Option>)}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="Тип действия *">
                    <Radio.Group value={ovForm.action_type} onChange={e=>setOvForm(f=>({...f,action_type:e.target.value}))}>
                      <Radio value="permanent">Постоянное</Radio>
                      <Radio value="one_time">Разовое (для одного протокола)</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item label="Обоснование *">
                    <Input.TextArea rows={2} value={ovForm.reason} onChange={e=>setOvForm(f=>({...f,reason:e.target.value}))}
                      placeholder="Укажите причину: распоряжение, техническое состояние..."/>
                  </Form.Item>
                  <Form.Item label="Диапазоны зон *">
                    <ZoneEditor zones={ovForm.zones} onChange={z=>setOvForm(f=>({...f,zones:z}))}/>
                  </Form.Item>
                </Form>
              </Modal>
            </div>
          )
        },
        {
          key:"etl",
          label:<span>ЭТЛ <SafetyCertificateOutlined/></span>,
          children:<TabETL labs={labs} setLabs={setLabs} api={api}/>
        },
      ]}/>
    </div>
  );
}
