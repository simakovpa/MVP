import { useState, useEffect } from "react";
import {
  Form, Input, Select, TreeSelect, Row, Col, Card, Button, Space,
  InputNumber, Alert, Divider, Table, Tag, Tooltip, Typography, Steps, Breadcrumb,
  DatePicker
} from "antd";
import dayjs from "dayjs";
import { PlusOutlined, HomeOutlined, WarningOutlined } from "@ant-design/icons";
import {
  OBJECTS, EQUIP_ON_OBJECTS, TM_ON_OBJECTS, NOMENCLATURES, EQUIP_TYPES,
  DEPT_TREE_DATA, EMPLOYEES, LABS, empName
} from "../data/mockData";
import { uid, genNum, calcZoneStatus, calStatus } from "../utils/helpers";
import { NormSourceBadge, CalTag } from "../components/shared";

const { Title, Text } = Typography;
const { Option } = Select;

// Цепочка приоритетов норматива
function findNorm(paramId, equipObj, normRanges, passportNorms, overrides, params) {
  if (!equipObj) return { zones:[], source:"" };
  const ov_tmcz = overrides.find(o=>o.active&&o.bind_type==="tmcz"&&o.bind_id===equipObj.id&&o.param_id===paramId);
  if (ov_tmcz) return { zones:ov_tmcz.zones, source:`Переопределение · ТМЦ ${equipObj.name}` };
  const ov_nm = overrides.find(o=>o.active&&o.bind_type==="nomenclature"&&o.bind_id===equipObj.nm_id&&o.param_id===paramId);
  if (ov_nm) { const nm=NOMENCLATURES.find(x=>x.id===equipObj.nm_id); return { zones:ov_nm.zones, source:`Переопределение · ${nm?.name}` }; }
  const ov_type = overrides.find(o=>o.active&&o.bind_type==="equipment_type"&&o.bind_id===equipObj.type_id&&o.param_id===paramId);
  if (ov_type) { const t=EQUIP_TYPES.find(x=>x.id===equipObj.type_id); return { zones:ov_type.zones, source:`Переопределение · Тип ТМЦ: ${t?.name}` }; }
  const pn = passportNorms.find(x=>x.param_id===paramId&&x.nomenclature_ids.includes(equipObj.nm_id));
  if (pn) { const nm=NOMENCLATURES.find(x=>x.id===equipObj.nm_id); return { zones:pn.zones, source:`Паспортный норматив · ${nm?.name}` }; }
  const nr = normRanges.find(x=>x.param_id===paramId&&x.type_id===equipObj.type_id);
  if (nr) { const t=EQUIP_TYPES.find(x=>x.id===equipObj.type_id); return { zones:nr.zones, source:`Норм. диапазон · ${t?.name}` }; }
  return { zones:[], source:"" };
}

export default function CreateProtocol({
  protocols, normRanges, passportNorms, overrides,
  workTypes, params, instruments,
  onSave, onCancel, editProtocol
}) {
  const isEditMode = !!editProtocol;
  const [step, setStep]       = useState(0);
  const [form] = Form.useForm();
  const [mode, setMode]       = useState(null);
  const [objId, setObjId]     = useState(null);
  const [wtId, setWtId]       = useState(null);
  const [equipId, setEquipId] = useState(null);
  const [selTMs, setSelTMs]     = useState([]);
  const [selEquips, setSelEquips] = useState([]); // режим equip_list
  const [executorIds, setExecIds]   = useState([]);
  const [reviewerId, setReviewerId] = useState(null);
  const [instrIds, setInstrIds]     = useState([]);
  const [deptId, setDeptId]         = useState(null);
  const [env, setEnv]               = useState({});

  const wt        = workTypes.find(w => w.id === wtId);
  const equipListRaw = objId ? (EQUIP_ON_OBJECTS[objId] || []) : [];
  const tmList    = objId ? (TM_ON_OBJECTS[objId]    || []) : [];
  const envFields = wt?.env_fields || {};

  // Фильтрация оборудования: только с отклонениями и без назначенных дефектов
  const equipList = equipListRaw.filter(eq => {
    // Собираем все протоколы для этого объекта
    const objProtocols = protocols.filter(p => p.object_id === objId);
    // Ищем отклонения для этого оборудования
    let hasDeviation = false;
    let hasDefect = false;
    
    for (const prot of objProtocols) {
      // Проверяем режим single equipment
      if (prot.mode === "equipment" && prot.equip_id === eq.id) {
        const badRows = (prot.rows || []).filter(r => r.auto_status === "error" || r.manual_status === "Предельное состояние");
        if (badRows.length > 0) hasDeviation = true;
        if ((prot.defects || []).some(d => d.entity_id === eq.id)) hasDefect = true;
      }
      // Проверяем режим equip_list
      if (prot.mode === "equip_list") {
        const group = (prot.equip_groups || []).find(g => g.equip_id === eq.id);
        if (group) {
          const badRows = (group.rows || []).filter(r => r.auto_status === "error" || r.manual_status === "Предельное состояние");
          if (badRows.length > 0) hasDeviation = true;
        }
        if ((prot.defects || []).some(d => d.entity_id === eq.id)) hasDefect = true;
      }
    }
    
    // Включаем оборудование если есть отклонение и нет дефекта
    return hasDeviation && !hasDefect;
  });

  const activeInstruments = instruments.filter(i => !i.archived);

  // Инициализация из editProtocol при редактировании
  // или сброс при создании нового протокола
  useEffect(() => {
    if (!editProtocol) {
      // Сброс всех полей при создании нового протокола
      setStep(0);
      setObjId(null);
      setWtId(null);
      setMode(null);
      setEquipId(null);
      setSelTMs([]);
      setSelEquips([]);
      setExecIds([]);
      setReviewerId(null);
      setInstrIds([]);
      setDeptId(null);
      setEnv({});
      form.resetFields();
      return;
    }
    setObjId(editProtocol.object_id || null);
    setWtId(editProtocol.work_type_id || null);
    setMode(editProtocol.mode || null);
    setEquipId(editProtocol.equip_id || null);
    setSelTMs(editProtocol.tm_groups?.map(g => g.tm_id) || []);
    setSelEquips(editProtocol.equip_groups?.map(g => g.equip_id) || []);
    setExecIds(editProtocol.executor_ids || []);
    setReviewerId(editProtocol.reviewer_id || null);
    setInstrIds(editProtocol.instrument_ids || []);
    setDeptId(editProtocol.dept_id || null);
    setEnv(editProtocol.env || {});
    if (editProtocol.object_id && editProtocol.work_type_id && editProtocol.mode) {
      setStep(1);
      if ((editProtocol.mode === "equipment" && editProtocol.equip_id) ||
          (editProtocol.mode === "tm_list" && editProtocol.tm_groups?.length) ||
          (editProtocol.mode === "equip_list" && editProtocol.equip_groups?.length)) {
        setStep(2);
      }
    }
    form.setFieldsValue({
      date_measured: editProtocol.date_measured,
      lab_id: editProtocol.lab_id,
      voltage_test: editProtocol.voltage_test,
    });
  }, [editProtocol]);

  const can1 = objId && wtId && mode;
  const can2 = (
    mode === "equipment"  ? !!equipId :
    mode === "equip_list" ? selEquips.length > 0 :
    selTMs.length > 0
  ) && executorIds.length > 0 && deptId;

  function handleFinish() {
    const vals = form.getFieldsValue(true);
    const equip = equipList.find(e => e.id === equipId);
    const now   = new Date().toISOString().slice(0,10);
    let rows = [], tm_groups = [];

    if (mode === "equipment" && wt && equip) {
      rows = wt.params.map(pt => {
        const pr = params.find(p => p.id === pt.param_id);
        const { zones, source } = findNorm(pt.param_id, equip, normRanges, passportNorms, overrides, params);
        return { id:uid(), param_id:pr.id, param_name:pr.name, unit:pr.unit,
          zones, norm_source:source, fact:null, note:"",
          auto_status:null, manual_status:null, manual_reason:"", is_overridden:false };
      });
    } else if (mode === "equip_list" && wt) {
      // Группы по единицам оборудования — шапка-разделитель + строки параметров
      // Норматив ищется для каждой единицы отдельно по цепочке приоритетов
      const equip_groups = selEquips.map(eqId => {
        const eq = equipList.find(e => e.id === eqId);
        return {
          equip_id: eqId,
          equip_name: eq?.name || eqId,
          serial: eq?.serial || "",
          rows: wt.params.map(pt => {
            const pr = params.find(p => p.id === pt.param_id);
            const { zones, source } = findNorm(pt.param_id, eq, normRanges, passportNorms, overrides, params);
            return { id:uid(), param_id:pr.id, param_name:pr.name, unit:pr.unit,
              zones, norm_source:source, fact:null, note:"",
              auto_status:null, manual_status:null, manual_reason:"", is_overridden:false };
          })
        };
      });
      // equip_groups передаётся отдельным полем в newProt ниже
    } else if (mode === "tm_list" && wt) {
      tm_groups = selTMs.map(tmId => {
        const tm = tmList.find(t => t.id === tmId);
        return {
          tm_id:tmId, tm_name:tm?.name || tmId,
          rows: wt.params.map(pt => {
            const pr = params.find(p => p.id === pt.param_id);
            // Для ТМ ищем нормативы по work_type_id и param_id (без привязки к типу оборудования)
            const nr = normRanges.find(x => x.param_id === pt.param_id && x.work_type_id === wt.id);
            const zones = nr ? nr.zones : [];
            const source = nr ? nr.source : "";
            return { id:uid(), param_id:pr.id, param_name:pr.name, unit:pr.unit,
              zones, norm_source:source, fact:null, note:"",
              auto_status:null, manual_status:null, manual_reason:"", is_overridden:false };
          })
        };
      });
    }

    const envData = {};
    if (envFields.temp     && env.temp     !== undefined) envData.temp     = env.temp;
    if (envFields.humidity && env.humidity !== undefined) envData.humidity = env.humidity;
    if (envFields.pressure && env.pressure !== undefined) envData.pressure = env.pressure;

    const newProt = {
      id: isEditMode ? editProtocol.id : uid(),
      number: isEditMode ? editProtocol.number : genNum(protocols),
      date_created:now, date_measured:vals.date_measured || now,
      object_id:objId, work_type_id:wtId, test_type:wt?.type || "Эксплуатационные",
      lab_id:vals.lab_id, dept_id:deptId,
      executor_ids:executorIds, reviewer_id:reviewerId,
      instrument_ids:instrIds,
      mode, equip_id:mode==="equipment" ? equipId : null,
      equip_groups:mode==="equip_list" ? (() => {
        return selEquips.map(eqId => {
          const eq = equipList.find(e => e.id === eqId);
          return {
            equip_id: eqId,
            equip_name: eq?.name || eqId,
            serial: eq?.serial || "",
            rows: wt.params.map(pt => {
              const pr = params.find(p => p.id === pt.param_id);
              const { zones, source } = findNorm(pt.param_id, eq, normRanges, passportNorms, overrides, params);
              return { id:uid(), param_id:pr.id, param_name:pr.name, unit:pr.unit,
                zones, norm_source:source, fact:null, note:"",
                auto_status:null, manual_status:null, manual_reason:"", is_overridden:false };
            })
          };
        });
      })() : undefined,
      env:envData, voltage_test:vals.voltage_test || null,
      status:"В работе", date_signed:null, signed_by:null,
      conclusion_type:null, conclusion_text:"", cancel_reason:null, defects:[],
      rows, tm_groups,
      history:[{ date:now+" "+new Date().toTimeString().slice(0,5),
        user:executorIds[0]||"?", action:"Создан (Черновик)" }]
    };
    onSave(newProt);
  }

  return (
    <div style={{ padding:24 }}>
      <Breadcrumb style={{ marginBottom:16 }} items={[
        { title:<span style={{ cursor:"pointer", color:"#1a5fa8" }} onClick={onCancel}><HomeOutlined/> Протоколы</span> },
        { title:"Создание" },
      ]}/>
      <Title level={4} style={{ margin:"0 0 24px", color:"#0f2744" }}>
        <PlusOutlined style={{ marginRight:10, color:"#1a5fa8" }}/>Создание протокола
      </Title>
      <Steps current={step} size="small" style={{ marginBottom:24 }}
        items={[{ title:"Тип и объект" }, { title:"Реквизиты" }, { title:"Условия и приборы" }]}/>

      <Form form={form} layout="vertical" requiredMark="optional">

        {/* ─── ШАГ 1 ───────────────────────────────────────────────────────── */}
        {step === 0 && (
          <Card style={{ borderRadius:8 }}>
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
                    {workTypes.filter(w=>!w.archived).map(w => (
                      <Option key={w.id} value={w.id}>
                        <div><div>{w.name}</div><div style={{ fontSize:11,color:"#888" }}>{w.norm_doc}</div></div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label={<b>Режим протокола *</b>}>
                  <div style={{ display:"flex", gap:12 }}>
                    {[
                      { v:"equipment",  label:"Единичное оборудование",    desc:"Один ТМЦ" },
                      { v:"equip_list", label:"Перечень единиц оборудования", desc:"Несколько ТМЦ одного типа" },
                      { v:"tm_list",    label:"Перечень ТМ объекта",       desc:"По техническим местам" },
                    ].map(m => (
                      <div key={m.v} onClick={() => setMode(m.v)} style={{
                        flex:1, padding:"12px 16px", borderRadius:8, cursor:"pointer",
                        border:mode===m.v?"2px solid #1a5fa8":"1px solid #d9d9d9",
                        background:mode===m.v?"#f0f6ff":"#fff", transition:"all .2s"
                      }}>
                        <div style={{ fontWeight:600, fontSize:13 }}>{m.label}</div>
                        <div style={{ fontSize:11, color:"#888" }}>{m.desc}</div>
                      </div>
                    ))}
                  </div>
                </Form.Item>
              </Col>
            </Row>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
              <Button onClick={onCancel}>Отмена</Button>
              <Button type="primary" disabled={!can1} onClick={() => setStep(1)}>Далее →</Button>
            </div>
          </Card>
        )}

        {/* ─── ШАГ 2 ───────────────────────────────────────────────────────── */}
        {step === 1 && (
          <Card style={{ borderRadius:8 }}>
            {/* Оборудование / ТМ */}
            {mode === "equipment" && (
              <Form.Item label={<b>Единица оборудования *</b>}>
                {equipList.length===0
                  ? <Alert type="warning" message="На объекте нет зарегистрированного оборудования"/>
                  : <Select value={equipId} onChange={setEquipId} size="large">
                      {equipList.map(e=><Option key={e.id} value={e.id}>
                        <div><div>{e.name}</div><div style={{ fontSize:11,color:"#888" }}>{e.serial}</div></div>
                      </Option>)}
                    </Select>}
              </Form.Item>
            )}
            {mode === "equip_list" && (
              <Form.Item label={<b>Единицы оборудования *</b>}
                extra={<span style={{ fontSize:11,color:"#888" }}>Выберите несколько ТМЦ одного типа — например, ОПН трёх фаз</span>}>
                {equipList.length===0
                  ? <Alert type="warning" message="На объекте нет зарегистрированного оборудования"/>
                  : <Select mode="multiple" value={selEquips} onChange={setSelEquips} size="large" style={{ width:"100%" }}>
                      {equipList.map(e=><Option key={e.id} value={e.id}>
                        <div style={{ display:"flex", justifyContent:"space-between" }}>
                          <span>{e.name}</span>
                          <span style={{ fontSize:11,color:"#888",marginLeft:8 }}>{e.serial}</span>
                        </div>
                      </Option>)}
                    </Select>}
              </Form.Item>
            )}
            {mode === "tm_list" && (
              <Form.Item label={<b>Технические места *</b>}>
                <Select mode="multiple" value={selTMs} onChange={setSelTMs} size="large" style={{ width:"100%" }}>
                  {tmList.map(t=><Option key={t.id} value={t.id}>{t.name}</Option>)}
                </Select>
              </Form.Item>
            )}

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Лаборатория (ЭТЛ) *" name="lab_id" rules={[{required:true}]}>
                  <Select>
                    {LABS.map(l=><Option key={l.id} value={l.id}>
                      {l.name} <Tag color={l.type==="Собственная"?"green":"orange"} style={{ fontSize:10 }}>{l.type}</Tag>
                    </Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                {/* TreeSelect подразделений */}
                <Form.Item label="Подразделение-заказчик *">
                  <TreeSelect
                    value={deptId}
                    onChange={setDeptId}
                    treeData={DEPT_TREE_DATA}
                    placeholder="Выберите подразделение"
                    showSearch
                    treeNodeFilterProp="title"
                    style={{ width:"100%" }}
                    allowClear
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Исполнители — мультиселект с поиском */}
            <Form.Item label={<b>Испытания провели *</b>}>
              <Select
                mode="multiple"
                value={executorIds}
                onChange={setExecIds}
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                placeholder="Начните вводить ФИО..."
                style={{ width:"100%" }}
                notFoundContent={<Text type="secondary" style={{ fontSize:12 }}>Не найдено</Text>}
                options={EMPLOYEES.map(e => ({
                  value: e.id,
                  label: e.name,
                  desc: `${e.position}, гр. ${e.group}`,
                }))}
                optionRender={opt => (
                  <div>
                    <span style={{ fontSize:13 }}>{opt.data.label}</span>
                    <span style={{ fontSize:11, color:"#888", marginLeft:6 }}>({opt.data.desc})</span>
                  </div>
                )}
              />
              {executorIds.length === 0 &&
                <Text type="secondary" style={{ fontSize:11 }}>Обязательно укажите хотя бы одного исполнителя</Text>}
            </Form.Item>

            {/* Проверяющий — одиночный с поиском */}
            <Form.Item label="Протокол проверил">
              <Select
                value={reviewerId}
                onChange={setReviewerId}
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                placeholder="Выберите проверяющего (необязательно)"
                allowClear
                style={{ width:"100%" }}
                options={EMPLOYEES.map(e => ({
                  value: e.id,
                  label: e.name,
                  desc: e.position,
                }))}
                optionRender={opt => (
                  <div>
                    <span style={{ fontSize:13 }}>{opt.data.label}</span>
                    <span style={{ fontSize:11, color:"#888", marginLeft:6 }}>({opt.data.desc})</span>
                  </div>
                )}
              />
            </Form.Item>

            <Form.Item label="Дата измерений" name="date_measured"
              getValueProps={v => ({ value: v ? dayjs(v) : null })}
              getValueFromEvent={d => d ? d.format("YYYY-MM-DD") : null}>
              <DatePicker format="DD.MM.YYYY" style={{ width:"100%" }} placeholder="Выберите дату"/>
            </Form.Item>

            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <Button onClick={() => setStep(0)}>← Назад</Button>
              <Space>
                <Button onClick={onCancel}>Отмена</Button>
                <Button type="primary" disabled={!can2} onClick={() => setStep(2)}>Далее →</Button>
              </Space>
            </div>
          </Card>
        )}

        {/* ─── ШАГ 3 ───────────────────────────────────────────────────────── */}
        {step === 2 && (
          <Card style={{ borderRadius:8 }}>
            {/* Условия измерений — только поля из настройки вида работы */}
            {(envFields.temp || envFields.humidity || envFields.pressure) ? (
              <div style={{ marginBottom:16 }}>
                <Text strong style={{ fontSize:13 }}>Условия измерений</Text>
                <Text type="secondary" style={{ fontSize:11, marginLeft:8 }}>
                  (все поля необязательные)
                </Text>
                <Row gutter={12} style={{ marginTop:10 }}>
                  {envFields.temp && (
                    <Col span={8}>
                      <Form.Item label="Температура воздуха, °C">
                        <InputNumber value={env.temp} onChange={v=>setEnv(e=>({...e,temp:v}))}
                          min={-50} max={60} style={{ width:"100%" }}/>
                      </Form.Item>
                    </Col>
                  )}
                  {envFields.humidity && (
                    <Col span={8}>
                      <Form.Item label="Относительная влажность, %">
                        <InputNumber value={env.humidity} onChange={v=>setEnv(e=>({...e,humidity:v}))}
                          min={0} max={100} style={{ width:"100%" }}/>
                      </Form.Item>
                    </Col>
                  )}
                  {envFields.pressure && (
                    <Col span={8}>
                      <Form.Item label="Атм. давление, мм рт. ст.">
                        <InputNumber value={env.pressure} onChange={v=>setEnv(e=>({...e,pressure:v}))}
                          min={600} max={900} style={{ width:"100%" }}/>
                      </Form.Item>
                    </Col>
                  )}
                </Row>
              </div>
            ) : (
              <Alert type="default" showIcon style={{ marginBottom:16 }}
                message="Для данного вида работы параметры среды не настроены"/>
            )}

            <Form.Item label="Напряжение испытания, кВ" name="voltage_test">
              <InputNumber min={0} style={{ width:"100%" }}/>
            </Form.Item>

            {/* Измерительные приборы */}
            <Divider/>
            <Form.Item label={
              <Space>
                <Text strong style={{ fontSize:13 }}>Измерительные приборы</Text>
                <Text type="secondary" style={{ fontSize:11 }}>(необязательно)</Text>
              </Space>
            }>
              <Select
                mode="multiple"
                value={instrIds}
                onChange={setInstrIds}
                placeholder="Выберите приборы из реестра..."
                style={{ width:"100%" }}
                optionLabelProp="label"
              >
                {activeInstruments.map(ins => {
                  const s = calStatus(ins);
                  return (
                    <Option key={ins.id} value={ins.id}
                      label={ins.name + " №" + ins.serial}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <Text style={{ fontSize:12 }}>{ins.name}</Text>
                          <Text type="secondary" style={{ fontSize:11, marginLeft:6 }}>№{ins.serial}</Text>
                        </div>
                        <CalTag ins={ins}/>
                      </div>
                    </Option>
                  );
                })}
              </Select>
              {instrIds.some(id => calStatus(instruments.find(x=>x.id===id)||{}) === "expired") && (
                <Alert type="error" showIcon style={{ marginTop:8 }} icon={<WarningOutlined/>}
                  message="Один или несколько выбранных приборов имеют просроченную поверку"/>
              )}
            </Form.Item>

            {/* Превью параметров и нормативов */}
            {wt && (
              <>
                <Divider/>
                <Text strong style={{ fontSize:13 }}>Параметры из шаблона:</Text>
                <Table size="small" style={{ marginTop:8 }} pagination={false}
                  dataSource={wt.params.map(pt => {
                    const pr = params.find(p => p.id===pt.param_id);
                    const eq = equipList.find(e => e.id===equipId);
                    const { zones, source } = eq
                      ? findNorm(pt.param_id, eq, normRanges, passportNorms, overrides, params)
                      : { zones:[], source:"" };
                    return { key:pt.param_id, name:pr?.name, unit:pr?.unit, source, zones };
                  })}
                  columns={[
                    { title:"Параметр", dataIndex:"name" },
                    { title:"Ед.", dataIndex:"unit", width:70 },
                    { title:"Источник норматива", dataIndex:"source",
                      render:v => v ? <NormSourceBadge source={v}/> : <Tag>Не задан</Tag> },
                    { title:"Зоны", key:"z", render:(_,r) =>
                      r.zones.map(z=><Tag key={z.id} color={z.color} style={{ fontSize:10,marginBottom:2 }}>{z.label}</Tag>) },
                  ]}
                />
              </>
            )}

            <div style={{ display:"flex", justifyContent:"space-between", marginTop:16 }}>
              <Button onClick={() => setStep(1)}>← Назад</Button>
              <Space>
                <Button onClick={onCancel}>Отмена</Button>
                <Button type="primary" icon={<PlusOutlined/>} onClick={handleFinish}>Создать протокол</Button>
              </Space>
            </div>
          </Card>
        )}
      </Form>
    </div>
  );
}
