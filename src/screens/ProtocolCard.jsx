import { useState } from "react";
import {
  Card, Tabs, Table, Tag, Button, Space, Input, Select, Steps, Modal,
  Alert, Breadcrumb, Descriptions, Collapse, Typography, Tooltip, Empty,
  InputNumber, notification, Divider
} from "antd";
import {
  HomeOutlined, ArrowLeftOutlined, SendOutlined, EditOutlined, StopOutlined,
  BugOutlined, SafetyCertificateOutlined, ApartmentOutlined, ThunderboltOutlined,
  WarningOutlined, SwapOutlined, QuestionCircleOutlined, CalendarOutlined,
  TeamOutlined, ToolOutlined, EyeOutlined, PrinterOutlined,
  PlusOutlined, DeleteOutlined
} from "@ant-design/icons";
import {
  OBJECTS, EMPLOYEES, LABS, TM_ON_OBJECTS, EQUIP_ON_OBJECTS, EQUIP_TYPES, NOMENCLATURES,
  empName, empNames, deptLabel
} from "../data/mockData";
import {
  getEffectiveStatus, countBadRows, calcZoneStatus, nowStr, hasExpiredInstruments, calStatus, uid, findNorm
} from "../utils/helpers";
import { StatusTag, RowStatusBadge, NormSourceBadge, CalTag } from "../components/shared";
import ProtocolPreview from "./ProtocolPreview";
import ProtocolPrintPreview from "../components/ProtocolPrintPreview";

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;



const conclusionCfg = {
  "Соответствует НТД":        { color:"success" },
  "Не соответствует НТД":     { color:"error"   },
  "Частичное несоответствие": { color:"warning"  },
};

const statusCfgStep = {
  "Черновик":0, "В работе":1, "На проверке":2, "Подписан":3, "Аннулирован":3
};

const ENV_LABELS = { temp:"Температура", humidity:"Влажность", pressure:"Давление" };
const ENV_UNITS  = { temp:"°C", humidity:"%", pressure:"мм рт. ст." };


// ─── EquipListTable — плоская таблица с шапками-разделителями по ТМЦ ─────────
function EquipListTable({ prot, makeRowCols }) {
  const groups = prot.equip_groups || [];
  if (groups.length === 0) return (
    <Empty description="Единицы оборудования не добавлены" image={Empty.PRESENTED_IMAGE_SIMPLE}/>
  );

  // Берём колонки из первой группы (все одинаковые)
  const cols = makeRowCols(0);

  return (
    <div>
      {groups.map((g, gi) => {
        const hasError = g.rows.some(r => {
          const s = getEffectiveStatus(r);
          return s.color === "error";
        });
        const hasWarn = g.rows.some(r => {
          const s = getEffectiveStatus(r);
          return s.color === "warning";
        });
        return (
          <div key={g.equip_id} style={{ marginBottom: 12 }}>
            {/* Шапка-разделитель — как в Excel-протоколе */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 12px",
              background: "linear-gradient(90deg, #f0f4f8, #f8fafc)",
              border: "1px solid #dde3ec",
              borderRadius: "6px 6px 0 0",
              borderBottom: "none",
            }}>
              <ThunderboltOutlined style={{ color: "#1a5fa8", fontSize: 13 }}/>
              <Text strong style={{ fontSize: 13 }}>{g.equip_name}</Text>
              {g.serial && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Зав. № {g.serial}
                </Text>
              )}
              {hasError && <Tag color="error"   style={{ fontSize: 10, marginLeft: "auto" }}>Отклонение</Tag>}
              {!hasError && hasWarn && <Tag color="warning" style={{ fontSize: 10, marginLeft: "auto" }}>Требует внимания</Tag>}
            </div>
            <Table
              dataSource={g.rows}
              columns={makeRowCols(gi)}
              rowKey="id"
              size="small"
              pagination={false}
              style={{ borderRadius: "0 0 6px 6px" }}
              rowClassName={r => {
                const s = getEffectiveStatus(r);
                return s.color==="error" ? "row-err" : s.color==="warning" ? "row-warn-row" : "";
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function ProtocolCard({
  prot, workTypes, params, instruments, normRanges, passportNorms, overrides,
  onBack, onUpdate, onDelete
}) {
  const [api, ctx] = notification.useNotification();
  const [conclusionModal, setConclusionModal] = useState(false);
  const [conclusionType,  setConclusionType]  = useState(null);
  const [conclusionText,  setConclusionText]  = useState("");
  const [cancelModal, setCancelModal]         = useState(false);
  const [cancelReason, setCancelReason]       = useState("");
  const [deleteModal, setDeleteModal]         = useState(false);
  const [defectModal, setDefectModal]         = useState(false);
  const [previewOpen, setPreviewOpen]         = useState(false);
  const [manualModal, setManualModal]         = useState(null); // {rowId, tmIdx}
  const [printModal, setPrintModal]           = useState(false);
  const [manualVal, setManualVal]             = useState("");
  const [manualReason, setManualReason]       = useState("");
  const [addTmValue, setAddTmValue]           = useState(null);

  const isDraft      = prot.status === "Черновик";
  const isEditable   = prot.status === "В работе";
  const canOverride  = prot.status === "На проверке";
  const canEditTM    = isDraft || isEditable; // добавление/удаление ТМ доступно в обоих статусах
  // Аннулировать можно из любого статуса, где протокол уже мог содержать
  // введённые данные (В работе, На проверке, Подписан) — но не из Черновика
  // (там для этого есть физическое удаление) и не повторно из Аннулирован.
  const canCancel = ["В работе","На проверке","Подписан"].includes(prot.status);
  const obj  = OBJECTS.find(o => o.id===prot.object_id);
  const wt   = workTypes.find(w => w.id===prot.work_type_id);
  const lab  = LABS.find(l => l.id===prot.lab_id);
  const availableTMs = TM_ON_OBJECTS[prot.object_id] || [];
  const usedTmIds = new Set((prot.tm_groups||[]).map(g=>g.tm_id));
  const tmOptionsToAdd = availableTMs.filter(t => !usedTmIds.has(t.id));
  const equipOnObject = EQUIP_ON_OBJECTS[prot.object_id] || [];

  // Строит строки измерений по шаблону вида работы.
  // equipObj (опционально) — конкретный экземпляр оборудования: если передан,
  // норматив подбирается для НЕГО по полной цепочке приоритетов (findNorm).
  // Для режима «Перечень ТМ» экземпляр оборудования не передаётся — привязки
  // к конкретной единице там нет (см. ФТ-ТМ4, раздел 4.3 Architecture Decisions):
  // норматив в этом режиме не вычисляется автоматически, строка остаётся
  // «Не определено» до появления норматива по типу оборудования из вида работы
  // либо до ручного статуса исполнителя.
  function buildRowsFromTemplate(equipObj = null) {
    if (!wt) return [];
    return (wt.params||[]).map(pt => {
      const pr = params.find(p => p.id===pt.param_id);
      let zones = [], norm_source = "";
      if (equipObj) {
        const found = findNorm(pt.param_id, equipObj, normRanges, passportNorms, overrides, EQUIP_TYPES, NOMENCLATURES);
        zones = found.zones; norm_source = found.source;
      }
      return { id:uid(), param_id:pt.param_id, param_name:pr?.name||"", unit:pr?.unit||"",
        zones, norm_source, fact:null, note:"",
        auto_status:null, manual_status:null, manual_reason:"", is_overridden:false };
    });
  }

  function startWork() {
    const rowsPayload = {};
    if (prot.mode==="equipment") {
      const eq = equipOnObject.find(e => e.id===prot.equip_id);
      rowsPayload.rows = buildRowsFromTemplate(eq);
    } else if (prot.mode==="tm_list") {
      rowsPayload.tm_groups = (prot.tm_groups||[]).map(g =>
        ({...g, rows: g.rows?.length ? g.rows : buildRowsFromTemplate()}));
    } else if (prot.mode==="equip_list") {
      rowsPayload.equip_groups = (prot.equip_groups||[]).map(g => {
        if (g.rows?.length) return g;
        const eq = equipOnObject.find(e => e.id===g.equip_id);
        return {...g, rows: buildRowsFromTemplate(eq)};
      });
    }
    onUpdate({...prot, status:"В работе", ...rowsPayload,
      history:[...prot.history, { date:nowStr(), user:prot.executor_ids?.[0]||"?", action:"Сформированы строки измерений. Статус: В работе" }]});
    api.success({ message:"Протокол переведён в статус «В работе»", duration:2 });
  }

  function addTM() {
    if (!addTmValue) return;
    const tm = availableTMs.find(t => t.id===addTmValue);
    if (!tm) return;
    // Строки создаются только если протокол уже в «В работе» — в «Черновике»
    // групповая структура сохраняется «скелетом» (rows:[]) до общего перехода.
    const newGroup = { tm_id: tm.id, tm_name: tm.name, rows: isEditable ? buildRowsFromTemplate() : [] };
    onUpdate({...prot, tm_groups:[...(prot.tm_groups||[]), newGroup],
      history:[...prot.history, { date:nowStr(), user:prot.executor_ids?.[0]||"?", action:`Добавлено ТМ «${tm.name}»` }]});
    setAddTmValue(null);
    api.success({ message:`ТМ «${tm.name}» добавлено`, duration:2 });
  }

  function removeTM(tmId, tmName) {
    onUpdate({...prot, tm_groups:(prot.tm_groups||[]).filter(g=>g.tm_id!==tmId),
      history:[...prot.history, { date:nowStr(), user:prot.executor_ids?.[0]||"?", action:`Удалено ТМ «${tmName}»` }]});
    api.success({ message:`ТМ «${tmName}» удалено`, duration:2 });
  }
  const selectedInstruments = (prot.instrument_ids||[])
    .map(id => instruments.find(x=>x.id===id))
    .filter(Boolean);
  const hasExpired = hasExpiredInstruments(prot, instruments);

  function getAllRows() {
    if (prot.mode==="tm_list") return (prot.tm_groups||[]).flatMap(g=>g.rows);
    if (prot.mode==="equip_list") return (prot.equip_groups||[]).flatMap(g=>g.rows);
    return (prot.rows||[]);
  }

  function updateRowField(rowId, field, value, tmIdx=null) {
    const updated = {...prot};
    const upd = row => {
      if (row.id!==rowId) return row;
      const newRow = {...row,[field]:value};
      if (field==="fact") newRow.auto_status = newRow.zones?.length ? calcZoneStatus(value, newRow.zones) : null;
      return newRow;
    };
    if (prot.mode==="equipment") updated.rows = prot.rows.map(upd);
    else if (prot.mode==="equip_list") updated.equip_groups = (prot.equip_groups||[]).map((g,gi) => gi!==tmIdx ? g : {...g,rows:g.rows.map(upd)});
    else updated.tm_groups = (prot.tm_groups||[]).map((g,gi) => gi!==tmIdx ? g : {...g,rows:g.rows.map(upd)});
    onUpdate(updated);
  }

  function applyManual() {
    if (!manualVal.trim()) { api.warning({ message:"Укажите статус" }); return; }
    if (!manualReason.trim()) { api.warning({ message:"Укажите обоснование" }); return; }
    const { rowId, tmIdx } = manualModal;
    const upd = row => row.id!==rowId ? row
      : {...row, manual_status:manualVal, manual_reason:manualReason, is_overridden:true};
    const updated = {...prot};
    if (prot.mode==="equipment") updated.rows = prot.rows.map(upd);
    else if (prot.mode==="equip_list") updated.equip_groups = (prot.equip_groups||[]).map((g,gi)=>gi!==tmIdx?g:{...g,rows:g.rows.map(upd)});
    else updated.tm_groups = prot.tm_groups.map((g,gi)=>gi!==tmIdx?g:{...g,rows:g.rows.map(upd)});
    updated.history = [...prot.history, { date:nowStr(), user:prot.executor_ids?.[0]||"?",
      action:`Статус строки переопределён: «${manualVal}» — ${manualReason}` }];
    onUpdate(updated);
    setManualModal(null); setManualVal(""); setManualReason("");
    api.success({ message:"Статус строки обновлён", duration:2 });
  }

  function transition(newStatus, extra={}) {
    const labels = {
      "На проверке":"Отправлен на проверку", "В работе":"Возвращён в работу",
      "Подписан":"Подписан", "Аннулирован":`Аннулирован. Причина: ${extra.cancel_reason}`,
    };
    onUpdate({...prot, status:newStatus, ...extra,
      history:[...prot.history, { date:nowStr(), user:"em1", action:labels[newStatus] }]});
    api.success({ message:`Статус: ${newStatus}`, placement:"topRight", duration:2 });
  }

  function makeRowCols(tmIdx=null) {
    return [
      { title:"Параметр", key:"par", render:(_,r) => <Text style={{ fontSize:12,fontWeight:500 }}>{r.param_name}</Text> },
      { title:"Ед.", dataIndex:"unit", key:"u", width:60,
        render:v=><Text type="secondary" style={{ fontSize:11 }}>{v}</Text> },
      { title:"Норматив (источник)", key:"norm", width:220, render:(_,r) => (
        <div>
          <NormSourceBadge source={r.norm_source}/>
          {r.zones?.length>0 &&
            <Tooltip title={r.zones.map(z=>`${z.label}: мин ${z.min??"-"}, макс ${z.max??"-"}`).join(" | ")}>
              <Text style={{ fontSize:10,color:"#888",display:"block",cursor:"help",marginTop:2 }}>
                {r.zones.length} диапазон{r.zones.length>1?"а":""}
              </Text>
            </Tooltip>}
        </div>
      )},
      { title:"Факт. значение", key:"fact", width:140, render:(_,r) =>
        isEditable
          ? <InputNumber value={r.fact} size="small" style={{ width:110 }}
              onChange={v=>updateRowField(r.id,"fact",v,tmIdx)} placeholder="Введите"/>
          : <Text style={{ fontSize:13,fontWeight:600 }}>{r.fact??"-"}</Text>
      },
      { title:"Статус", key:"status", width:210, render:(_,r) => {
        const s = getEffectiveStatus(r);
        return (
          <Space direction="vertical" size={2}>
            <RowStatusBadge row={r}/>
            {(isEditable||canOverride) && (s.undefined||canOverride) && (
              <Button size="small" type="link" style={{ padding:0,fontSize:11,height:"auto" }}
                icon={<EditOutlined/>}
                onClick={() => { setManualModal({rowId:r.id,tmIdx}); setManualVal(r.manual_status||""); setManualReason(r.manual_reason||""); }}>
                {s.undefined?"Указать статус":"Переопределить"}
              </Button>
            )}
          </Space>
        );
      }},
      { title:"Примечание", key:"note", render:(_,r) =>
        isEditable
          ? <Input size="small" value={r.note} onChange={e=>updateRowField(r.id,"note",e.target.value,tmIdx)} placeholder="—"/>
          : <Text type="secondary" style={{ fontSize:11 }}>{r.note||"—"}</Text>
      },
    ];
  }

  const undefinedCount = getAllRows().filter(r=>getEffectiveStatus(r).undefined).length;
  // getAllRows уже учитывает equip_groups через режим
  const badCount       = countBadRows(prot);

  return (
    <div style={{ padding:24 }}>
      {ctx}

      <Breadcrumb style={{ marginBottom:16 }} items={[
        { title:<span style={{ cursor:"pointer",color:"#1a5fa8" }} onClick={onBack}><HomeOutlined/> Протоколы</span> },
        { title:prot.number },
      ]}/>

      {/* Шапка */}
      <div style={{ background:"linear-gradient(135deg,#0f2744,#1a5fa8)", borderRadius:10,
        padding:"18px 24px", marginBottom:16, color:"#fff" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontSize:11,color:"#a8c7e8",marginBottom:4,textTransform:"uppercase",letterSpacing:1 }}>
              Протокол испытаний
            </div>
            <Title level={3} style={{ margin:0,color:"#fff" }}>{prot.number}</Title>
            <div style={{ marginTop:6, display:"flex", gap:8, flexWrap:"wrap" }}>
              <Tag style={{ background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",color:"#fff" }}>
                {prot.test_type}
              </Tag>
              <Tag style={{ background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"#cde" }}>
                {prot.mode==="equipment" ? "Единичное оборудование" : prot.mode==="equip_list" ? "Перечень ТМЦ" : "Перечень ТМ"}
              </Tag>
              {badCount>0 && <Tag color="warning" icon={<WarningOutlined/>}>{badCount} строк с отклонениями</Tag>}
              {undefinedCount>0 && <Tag icon={<QuestionCircleOutlined/>}>{undefinedCount} без норматива</Tag>}
              {hasExpired && <Tag color="error" icon={<ToolOutlined/>}>Прибор не поверен</Tag>}
            </div>
            {/* Исполнители в шапке */}
            <div style={{ marginTop:10, display:"flex", gap:16, flexWrap:"wrap" }}>
              <div>
                <Text style={{ fontSize:11,color:"#7aa8cc" }}>Испытания провели:</Text>
                <Text style={{ fontSize:12,color:"#e8f0f8",marginLeft:6 }}>
                  {empNames(prot.executor_ids)}
                </Text>
              </div>
              {prot.reviewer_id && (
                <div>
                  <Text style={{ fontSize:11,color:"#7aa8cc" }}>Протокол проверил:</Text>
                  <Text style={{ fontSize:12,color:"#e8f0f8",marginLeft:6 }}>
                    {empName(prot.reviewer_id)}
                  </Text>
                </div>
              )}
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <StatusTag status={prot.status}/>
            {prot.conclusion_type && (
              <div style={{ marginTop:6 }}>
                <Tag color={conclusionCfg[prot.conclusion_type]?.color} style={{ fontSize:11 }}>
                  {prot.conclusion_type}
                </Tag>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ЖЦ */}
      <Card size="small" style={{ marginBottom:16, borderRadius:8 }}
        title={<Text style={{ fontSize:13,fontWeight:600 }}>Жизненный цикл и действия</Text>}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:16, flexWrap:"wrap" }}>
          <Steps size="small"
            current={prot.status==="Аннулирован"
              ? (statusCfgStep[prot.cancelled_from_status] ?? 3)
              : (statusCfgStep[prot.status] ?? 0)}
            status={prot.status==="Аннулирован"?"error":"process"}
            style={{ flex:1, minWidth:280 }}
            items={[
              { title:"Черновик",    icon:<EditOutlined/> },
              { title:"В работе",    icon:<ToolOutlined/> },
              { title:"На проверке", icon:<SendOutlined/> },
              { title:prot.status==="Аннулирован"?"Аннулирован":"Подписан",
                icon:prot.status==="Аннулирован"?<StopOutlined/>:<SafetyCertificateOutlined/> },
            ]}/>
          <Space wrap>
            {prot.status==="Черновик" && (
              <Button type="primary" icon={<ToolOutlined/>} style={{ background:"#1890ff" }}
                onClick={startWork}>Создать протокол</Button>
            )}
            {prot.status==="В работе" && (
              <Button type="primary" icon={<SendOutlined/>} style={{ background:"#1890ff" }}
                onClick={() => transition("На проверке")}>Отправить на проверку</Button>
            )}
            {prot.status==="На проверке" && (<>
              <Button icon={<ArrowLeftOutlined/>} onClick={() => transition("В работе")}>Вернуть в работу</Button>
              <Button type="primary" icon={<SafetyCertificateOutlined/>} style={{ background:"#389e0d" }}
                onClick={() => setConclusionModal(true)}>Подписать</Button>
            </>)}
            {canCancel && (
              <Button danger icon={<StopOutlined/>} onClick={() => setCancelModal(true)}>Аннулировать</Button>
            )}
            {isDraft && (
              <Button danger icon={<DeleteOutlined/>} onClick={() => setDeleteModal(true)}>Удалить черновик</Button>
            )}
            {!isDraft && (
              <Button icon={<EyeOutlined/>} onClick={() => setPreviewOpen(true)}>Превью</Button>
            )}
            {!isDraft && prot.status!=="Аннулирован" && (
              <Button icon={<BugOutlined/>} style={{ borderColor:"#cf1322",color:"#cf1322" }}
                onClick={() => setDefectModal(true)}>Создать дефект</Button>
            )}
            {!isDraft && (
              <Button icon={<PrinterOutlined/>} onClick={() => setPrintModal(true)}>Печатная форма</Button>
            )}
          </Space>
        </div>
        {prot.status==="Аннулирован" && prot.cancel_reason &&
          <Alert type="error" showIcon
            message={`Причина аннулирования${prot.cancelled_from_status ? ` (из статуса «${prot.cancelled_from_status}»)` : ""}: ${prot.cancel_reason}`}
            style={{ marginTop:10 }}/>}
        {prot.conclusion_text && prot.status==="Подписан" &&
          <Alert type={badCount>0?"warning":"success"} showIcon message="Заключение"
            description={prot.conclusion_text} style={{ marginTop:10 }}/>}
      </Card>

      {/* Вкладки */}
      <Tabs defaultActiveKey="rows" items={[
        {
          key:"rows", label:"Результаты измерений",
          children:(
            <Card size="small" style={{ borderRadius:8 }}>
              {prot.mode==="equipment" && (
                <Table dataSource={prot.rows||[]} columns={makeRowCols()} rowKey="id" size="small" pagination={false}
                  rowClassName={r=>{ const s=getEffectiveStatus(r); return s.color==="error"?"row-err":s.color==="warning"?"row-warn-row":""; }}/>
              )}
              {prot.mode==="tm_list" && (
                <div>
                  {canEditTM && (
                    <div style={{ display:"flex", gap:8, marginBottom:12, alignItems:"center" }}>
                      <Select
                        placeholder="Добавить техническое место..."
                        value={addTmValue}
                        onChange={setAddTmValue}
                        style={{ width:320 }}
                        allowClear
                        showSearch
                        filterOption={(input,opt)=>String(opt?.label??"").toLowerCase().includes(input.toLowerCase())}
                        options={tmOptionsToAdd.map(t=>({ value:t.id, label:t.name }))}
                        notFoundContent={<Text type="secondary" style={{ fontSize:12 }}>Все ТМ объекта уже добавлены</Text>}
                      />
                      <Button icon={<PlusOutlined/>} onClick={addTM} disabled={!addTmValue}>Добавить ТМ</Button>
                      <Text type="secondary" style={{ fontSize:11, marginLeft:"auto" }}>
                        Перечень ТМ можно менять на этапах «Черновик» и «В работе»
                      </Text>
                    </div>
                  )}
                  {(prot.tm_groups||[]).length===0 ? (
                    <Empty description="Технические места не добавлены" image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                  ) : (
                    <Collapse defaultActiveKey={(prot.tm_groups||[]).map((_,i)=>String(i))} size="small" style={{ borderRadius:8 }}>
                      {(prot.tm_groups||[]).map((g,gi)=>(
                        <Panel key={String(gi)} header={
                          <Space>
                            <ApartmentOutlined style={{ color:"#1a5fa8" }}/>
                            <Text strong style={{ fontSize:13 }}>{g.tm_name}</Text>
                            {g.rows.some(r=>getEffectiveStatus(r).color==="error") &&
                              <Tag color="error" style={{ fontSize:10 }}>Отклонение</Tag>}
                          </Space>}
                          extra={canEditTM && (
                            <Button size="small" type="text" danger icon={<DeleteOutlined/>}
                              onClick={(e) => { e.stopPropagation(); removeTM(g.tm_id, g.tm_name); }}
                              title="Удалить ТМ из протокола"/>
                          )}>
                          <Table dataSource={g.rows} columns={makeRowCols(gi)} rowKey="id" size="small" pagination={false}/>
                        </Panel>
                      ))}
                    </Collapse>
                  )}
                </div>
              )}
              {prot.mode==="equip_list" && (
                <EquipListTable prot={prot} makeRowCols={makeRowCols}/>
              )}
            </Card>
          )
        },
        {
          key:"info", label:"Реквизиты",
          children:(
            <Card size="small" style={{ borderRadius:8 }}>
              <Descriptions size="small" column={2} bordered
                labelStyle={{ background:"#f0f4f8",fontWeight:600,fontSize:12,width:200 }}
                contentStyle={{ fontSize:12 }}
                items={[
                  { key:"n",    label:"Номер",             children:<Text strong>{prot.number}</Text> },
                  { key:"obj",  label:"Объект",            children:obj?.name },
                  { key:"wt",   label:"Вид работы",        children:wt?.name },
                  { key:"tt",   label:"Тип испытаний",     children:<Tag color="blue">{prot.test_type}</Tag> },
                  { key:"lab",  label:"Лаборатория (ЭТЛ)", children:lab?.name },
                  { key:"dept", label:"Подразделение-заказчик", children:deptLabel(prot.dept_id) },
                  { key:"d",    label:"Дата измерений",    children:prot.date_measured },
                  // Условия измерений — только заполненные поля
                  ...(Object.entries(prot.env||{}).filter(([,v])=>v!==null&&v!==undefined).map(([k,v])=>({
                    key:`env_${k}`, label:ENV_LABELS[k]||k,
                    children:<>{v} {ENV_UNITS[k]||""}</>
                  }))),
                  { key:"ex",   label:"Испытания провели",
                    children:(
                      <Space direction="vertical" size={2}>
                        {(prot.executor_ids||[]).map(id => {
                          const e = EMPLOYEES.find(x=>x.id===id);
                          return <div key={id}>
                            <Text style={{ fontSize:12 }}>{e?.name}</Text>
                            {e && <Text type="secondary" style={{ fontSize:11,marginLeft:6 }}>({e.position}, гр. {e.group})</Text>}
                          </div>;
                        })}
                      </Space>
                    )},
                  { key:"rev",  label:"Протокол проверил",
                    children:prot.reviewer_id ? (() => {
                      const e = EMPLOYEES.find(x=>x.id===prot.reviewer_id);
                      return <>{e?.name} {e && <Text type="secondary" style={{ fontSize:11 }}>({e.position})</Text>}</>;
                    })() : <Text type="secondary">не указан</Text>
                  },
                  // Измерительные приборы
                  { key:"ins", label:"Измерительные приборы", span:2,
                    children: selectedInstruments.length===0
                      ? <Text type="secondary">не указаны</Text>
                      : (
                        <Space direction="vertical" size={4} style={{ width:"100%" }}>
                          {selectedInstruments.map(ins=>(
                            <div key={ins.id} style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <Text style={{ fontSize:12 }}>{ins.name}</Text>
                              <Text type="secondary" style={{ fontSize:11 }}>Зав. №{ins.serial}</Text>
                              <Text type="secondary" style={{ fontSize:11 }}>до {ins.date_next_cal||"—"}</Text>
                              <CalTag ins={ins}/>
                            </div>
                          ))}
                        </Space>
                      )
                  },
                ]}
              />
              {hasExpired && (
                <Alert type="error" showIcon icon={<ToolOutlined/>} style={{ marginTop:12 }}
                  message="Один или несколько приборов в протоколе имеют просроченную поверку. Протокол может быть оспорен при проверке РТН."/>
              )}
            </Card>
          )
        },
        {
          key:"hist", label:"История",
          children:(
            <Card size="small" style={{ borderRadius:8 }}>
              {prot.history.map((h,i)=>(
                <div key={i} style={{ display:"flex",gap:10,padding:"8px 12px",
                  borderLeft:"3px solid #1a5fa8",marginBottom:6,background:"#f8fafc",borderRadius:"0 6px 6px 0" }}>
                  <CalendarOutlined style={{ color:"#aaa",marginTop:2,flexShrink:0 }}/>
                  <div>
                    <Text style={{ fontSize:12,fontWeight:600 }}>{h.action}</Text><br/>
                    <Text type="secondary" style={{ fontSize:11 }}>
                      {empName(h.user) !== h.user ? empName(h.user) : h.user} · {h.date}
                    </Text>
                  </div>
                </div>
              ))}
            </Card>
          )
        },
        {
          key:"def",
          label:<span>Дефекты {prot.defects?.length>0 && <Tag style={{ fontSize:10 }}>{prot.defects.length}</Tag>}</span>,
          children:(
            <Card size="small" style={{ borderRadius:8 }}
              extra={<Button size="small" icon={<BugOutlined/>} onClick={()=>setDefectModal(true)}>Создать</Button>}>
              {!prot.defects?.length
                ? <Empty description="Дефекты не зафиксированы" image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                : prot.defects.map(d=>(
                    <Alert key={d.id} type="warning" showIcon icon={<BugOutlined/>}
                      message={<Text strong style={{ fontSize:12 }}>{d.title}</Text>}
                      description={<Text type="secondary" style={{ fontSize:11 }}>{d.description} · {d.created}</Text>}
                      style={{ marginBottom:8 }}/>
                  ))
              }
            </Card>
          )
        },
      ]}/>

      {/* Модалы */}
      <Modal title="Подписание протокола" open={conclusionModal}
        onOk={() => {
          if (!conclusionType) { api.warning({ message:"Выберите заключение" }); return; }
          transition("Подписан", { conclusion_type:conclusionType, conclusion_text:conclusionText,
            date_signed:new Date().toISOString().slice(0,10), signed_by:"em1" });
          setConclusionModal(false);
        }}
        onCancel={() => setConclusionModal(false)} okText="Подписать"
        okButtonProps={{ style:{ background:"#389e0d" } }}>
        <Select value={conclusionType} onChange={setConclusionType} placeholder="Выберите заключение"
          style={{ width:"100%", marginBottom:12 }}>
          {Object.keys(conclusionCfg).map(c=><Option key={c}>{c}</Option>)}
        </Select>
        <Input.TextArea rows={3} value={conclusionText} onChange={e=>setConclusionText(e.target.value)}
          placeholder="Текст заключения (необязательно)"/>
        {badCount>0 && <Alert type="warning" showIcon message={`${badCount} строк с ненормативными значениями`} style={{ marginTop:8 }}/>}
        {undefinedCount>0 && <Alert type="info" showIcon message={`${undefinedCount} строк без норматива`} style={{ marginTop:8 }}/>}
      </Modal>

      <Modal title={<span style={{ color:"#cf1322" }}><StopOutlined/> Аннулирование</span>}
        open={cancelModal}
        onOk={() => {
          if (!cancelReason.trim()) { api.warning({ message:"Укажите причину" }); return; }
          transition("Аннулирован", { cancel_reason:cancelReason, cancelled_from_status:prot.status });
          setCancelModal(false); setCancelReason("");
        }}
        onCancel={() => { setCancelModal(false); setCancelReason(""); }}
        okText="Аннулировать" okButtonProps={{ danger:true }}>
        <Alert type="warning" showIcon message="Действие нельзя отменить. Протокол сохранится в системе со статусом «Аннулирован» и указанной причиной." style={{ marginBottom:12 }}/>
        <Input.TextArea rows={3} value={cancelReason} onChange={e=>setCancelReason(e.target.value)} placeholder="Причина..."/>
      </Modal>

      <Modal title={<span style={{ color:"#cf1322" }}><DeleteOutlined/> Удаление черновика</span>}
        open={deleteModal}
        onOk={() => { onDelete?.(prot.id); }}
        onCancel={() => setDeleteModal(false)}
        okText="Удалить" okButtonProps={{ danger:true }}>
        <Alert type="warning" showIcon
          message="Действие необратимо."
          description="Черновик будет удалён без возможности восстановления. Удаление доступно только в статусе «Черновик», так как в нём ещё нет ни одного введённого фактического значения измерений. Для протоколов на более поздних этапах используйте «Аннулирование»."
          style={{ marginBottom:4 }}/>
      </Modal>

      <Modal title={canOverride ? "Переопределение статуса строки" : "Указать статус (норматив не задан)"}
        open={!!manualModal}
        onOk={applyManual}
        onCancel={() => { setManualModal(null); setManualVal(""); setManualReason(""); }}
        okText="Применить">
        <Input value={manualVal} onChange={e=>setManualVal(e.target.value)}
          placeholder="Статус: Норма, Отклонение, Предельное состояние..." style={{ marginBottom:12 }}/>
        <Input.TextArea rows={2} value={manualReason} onChange={e=>setManualReason(e.target.value)}
          placeholder="Обоснование (обязательно)..."/>
      </Modal>

      <Modal title={<span><BugOutlined style={{ color:"#cf1322",marginRight:8 }}/>Создание дефекта</span>}
        open={defectModal}
        onOk={() => {
          const d = { id:`d${Date.now()}`, title:`Дефект из протокола ${prot.number}`,
            description:`Выявлено при испытаниях. Отклонений: ${badCount}. Без норматива: ${undefinedCount}.`,
            created:new Date().toISOString().slice(0,10) };
          onUpdate({...prot, defects:[...(prot.defects||[]),d]});
          setDefectModal(false); api.success({ message:"Дефект создан", duration:2 });
        }}
        onCancel={() => setDefectModal(false)} okText="Создать дефект" okButtonProps={{ danger:true }}>
        <Alert type="info" showIcon style={{ marginBottom:12 }}
          message="Дефект будет создан с привязкой к протоколу и объекту."/>
        <Text type="secondary" style={{ fontSize:12 }}>Объект: {obj?.name}</Text>
      </Modal>


      {/* ─── Модал печатной формы ─────────────────────────────────────── */}
      <Modal
        open={printModal}
        onCancel={() => setPrintModal(false)}
        footer={null}
        width={860}
        title={<Space><PrinterOutlined/><span>Печатная форма протокола</span></Space>}
        styles={{ body: { padding: 0 } }}
      >
        <ProtocolPrintPreview prot={prot} workTypes={workTypes} instruments={instruments}/>
      </Modal>

      <ProtocolPreview
        prot={prot}
        workTypes={workTypes}
        instruments={instruments}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />

      <style>{`
        .row-err td { background: #fff2f0 !important; }
        .row-err > td:first-child { border-left: 3px solid #cf1322 !important; }
        .row-warn-row td { background: #fffbe6 !important; }
        .row-warn-row > td:first-child { border-left: 3px solid #faad14 !important; }
      `}</style>
    </div>
  );
}
