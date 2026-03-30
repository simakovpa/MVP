import { useState } from "react";
import {
  Card, Tabs, Table, Tag, Button, Space, Input, Select, Steps, Modal, Row, Col,
  Alert, Breadcrumb, Descriptions, Collapse, Typography, Tooltip, Empty,
  InputNumber, notification, Divider, Form, message, Radio
} from "antd";
import {
  HomeOutlined, ArrowLeftOutlined, SendOutlined, EditOutlined, StopOutlined,
  BugOutlined, SafetyCertificateOutlined, ApartmentOutlined, ThunderboltOutlined,
  ClockCircleOutlined, DeleteOutlined,
  WarningOutlined, SwapOutlined, QuestionCircleOutlined, CalendarOutlined,
  TeamOutlined, ToolOutlined, EyeOutlined, PrinterOutlined
} from "@ant-design/icons";
import { OBJECTS, EMPLOYEES, LABS, empName, empNames, deptLabel, EQUIP_ON_OBJECTS, TM_ON_OBJECTS } from "../data/mockData";
import {
  getEffectiveStatus, countBadRows, calcZoneStatus, nowStr, hasExpiredInstruments, calStatus
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
  "Черновик":    0, "В работе": 1, "На проверке":2, "Подписан":3, "Аннулирован":3
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

export default function ProtocolCard({ prot, workTypes, params, instruments, onBack, onUpdate }) {
  const [api, ctx] = notification.useNotification();
  const [conclusionModal, setConclusionModal] = useState(false);
  const [conclusionType,  setConclusionType]  = useState(null);
  const [conclusionText,  setConclusionText]  = useState("");
  const [cancelModal, setCancelModal]         = useState(false);
  const [cancelReason, setCancelReason]       = useState("");
  const [defectModal, setDefectModal]         = useState(false);
  const [defectEntity, setDefectEntity]       = useState(null); // {type, id, name, severity} для модала дефекта
  const [signConfirmModal, setSignConfirmModal] = useState(false); //nochange
  const [previewOpen, setPreviewOpen]         = useState(false);
  const [manualModal, setManualModal]         = useState(null); // {rowId, tmIdx}
  const [manualSeverity, setManualSeverity]   = useState("normal"); // "normal" | "warning" | "critical"
  const [printModal, setPrintModal]           = useState(false);
  const [manualVal, setManualVal]             = useState("");
  const [manualReason, setManualReason]       = useState("");

  const isEditable  = prot.status === "Черновик" || prot.status === "В работе";
  const canOverride = prot.status === "На проверке";
  const obj  = OBJECTS.find(o => o.id===prot.object_id);
  const wt   = workTypes.find(w => w.id===prot.work_type_id);
  const lab  = LABS.find(l => l.id===prot.lab_id);
  const selectedInstruments = (prot.instrument_ids||[])
    .map(id => instruments.find(x=>x.id===id))
    .filter(Boolean);
  const hasExpired = hasExpiredInstruments(prot, instruments);

  // Получить все строки с отклонениями (warning или error)
  function getEntitiesWithDeviations() {
    const entities = [];
    const existingDefectEntityIds = (prot.defects || []).map(d => d.entity_id);
    
    if (prot.mode === "equipment") {
      // Режим единичного оборудования - отклонения относятся к этому оборудованию
      const equip = EQUIP_ON_OBJECTS[prot.object_id]?.find(e => e.id === prot.equip_id);
      const badRows = (prot.rows || []).filter(r => {
        const s = getEffectiveStatus(r);
        return s.color === "error" || s.color === "warning";
      }).map(r => {
        const s = getEffectiveStatus(r);
        return {
          param_name: r.param_name,
          unit: r.unit,
          fact: r.fact,
          zone_label: s.label,
          zone_color: s.color
        };
      });
      if (badRows.length > 0 && equip && !existingDefectEntityIds.includes(equip.id)) {
        // Критичность дефекта - максимальная из отклонений
        const maxSeverity = badRows.some(r => r.zone_color === "error") ? "error" : "warning";
        entities.push({
          type: "equipment",
          id: equip.id,
          name: equip.name,
          severity: maxSeverity,
          deviationCount: badRows.length,
          badRows: badRows
        });
      }
    } else if (prot.mode === "tm_list") {
      // Режим списка технических мест
      (prot.tm_groups || []).forEach(g => {
        const badRows = (g.rows || []).filter(r => {
          const s = getEffectiveStatus(r);
          return s.color === "error" || s.color === "warning";
        }).map(r => {
          const s = getEffectiveStatus(r);
          return {
            param_name: r.param_name,
            unit: r.unit,
            fact: r.fact,
            zone_label: s.label,
            zone_color: s.color
          };
        });
        if (badRows.length > 0 && !existingDefectEntityIds.includes(g.tm_id)) {
          const maxSeverity = badRows.some(r => r.zone_color === "error") ? "error" : "warning";
          entities.push({
            type: "tm",
            id: g.tm_id,
            name: g.tm_name,
            severity: maxSeverity,
            deviationCount: badRows.length,
            badRows: badRows
          });
        }
      });
    } else if (prot.mode === "equip_list") {
      // Режим списка оборудования
      (prot.equip_groups || []).forEach(g => {
        const equip = EQUIP_ON_OBJECTS[prot.object_id]?.find(e => e.id === g.equip_id);
        const badRows = (g.rows || []).filter(r => {
          const s = getEffectiveStatus(r);
          return s.color === "error" || s.color === "warning";
        }).map(r => {
          const s = getEffectiveStatus(r);
          return {
            param_name: r.param_name,
            unit: r.unit,
            fact: r.fact,
            zone_label: s.label,
            zone_color: s.color
          };
        });
        if (badRows.length > 0 && equip && !existingDefectEntityIds.includes(equip.id)) {
          const maxSeverity = badRows.some(r => r.zone_color === "error") ? "error" : "warning";
          entities.push({
            type: "equipment",
            id: equip.id,
            name: equip.name,
            severity: maxSeverity,
            deviationCount: badRows.length,
            badRows: badRows
          });
        }
      });
    }
    
    return entities;
  }

  // Обработчик кнопки "Создать дефект"
  function handleCreateDefect() {
    const entitiesWithDeviations = getEntitiesWithDeviations();
    
    if (entitiesWithDeviations.length === 0) {
      api.warning({ message: "Нет отклонений от норм в протоколе" });
      return;
    }
    
    // Если только одна сущность с отклонениями - предзаполняем
    if (entitiesWithDeviations.length === 1) {
      setDefectEntity(entitiesWithDeviations[0]);
    } else {
      setDefectEntity(null); // Сбрасываем для отображения списка выбора
    }
    setDefectModal(true);
  }

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
      : {...row, manual_status:manualVal, manual_reason:manualReason, is_overridden:true, severity:manualSeverity};
    const updated = {...prot};
    if (prot.mode==="equipment") updated.rows = prot.rows.map(upd);
    else if (prot.mode==="equip_list") updated.equip_groups = (prot.equip_groups||[]).map((g,gi)=>gi!==tmIdx?g:{...g,rows:g.rows.map(upd)});
    else updated.tm_groups = prot.tm_groups.map((g,gi)=>gi!==tmIdx?g:{...g,rows:g.rows.map(upd)});
    updated.history = [...prot.history, { date:nowStr(), user:prot.executor_ids?.[0]||"?",
      action:`Статус строки переопределён: «${manualVal}» — ${manualReason}` }];
    onUpdate(updated);
    setManualModal(null); setManualVal(""); setManualReason(""); setManualSeverity("normal");
    api.success({ message:"Статус строки обновлён", duration:2 });
  }

  function resetManual() {
    const { rowId, tmIdx } = manualModal;
    const oldRow = (prot.mode==="equipment" ? prot.rows : 
      prot.mode==="equip_list" ? (prot.equip_groups||[])[tmIdx]?.rows : prot.tm_groups[tmIdx]?.rows
    ).find(r=>r.id===rowId);
    const oldStatus = oldRow?.manual_status || "";
    const upd = row => row.id!==rowId ? row
      : {...row, manual_status:undefined, manual_reason:undefined, is_overridden:false};
    const updated = {...prot};
    if (prot.mode==="equipment") updated.rows = prot.rows.map(upd);
    else if (prot.mode==="equip_list") updated.equip_groups = (prot.equip_groups||[]).map((g,gi)=>gi!==tmIdx?g:{...g,rows:g.rows.map(upd)});
    else updated.tm_groups = prot.tm_groups.map((g,gi)=>gi!==tmIdx?g:{...g,rows:g.rows.map(upd)});
    updated.history = [...prot.history, { date:nowStr(), user:prot.executor_ids?.[0]||"?",
      action:`Сброшен переопределённый статус: «${oldStatus}» → расчётный` }];
    onUpdate(updated);
    setManualModal(null); setManualVal(""); setManualReason(""); setManualSeverity("normal");
    api.success({ message:"Ручной статус сброшен", duration:2 });
  }

  function transition(newStatus, extra={}) {
    const labels = {
      "В работе":"Начат ввод измерений",
      "На проверке":"Отправлен на проверку", "Черновик":"Возвращён в черновик",
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
      { title:"Статус", key:"status", width:220, render:(_,r) => {
        const s = getEffectiveStatus(r);
        return (
          <Space direction="vertical" size={2}>
            <RowStatusBadge row={r}/>
            {(isEditable||canOverride) && (s.undefined||canOverride||r.manual_status) && (
              <>
                <Button size="small" type="link" style={{ padding:0,fontSize:11,height:"auto" }}
                  icon={<EditOutlined/>}
                  onClick={() => { setManualModal({rowId:r.id,tmIdx}); setManualVal(r.manual_status||""); setManualReason(r.manual_reason||""); setManualSeverity(r.severity||"normal"); }}>
                  {s.undefined?"Указать статус":"Переопределить"}
                </Button>
                {r.manual_status && (
                  <Button size="small" type="link" style={{ padding:0,fontSize:11,height:"auto", color:"#ff4d4f" }}
                    onClick={() => {
                      const upd = row => row.id!==r.id ? row : {...row, manual_status:undefined, manual_reason:undefined, is_overridden:false};
                      const updated = {...prot};
                      if (prot.mode==="equipment") updated.rows = prot.rows.map(upd);
                      else if (prot.mode==="equip_list") updated.equip_groups = (prot.equip_groups||[]).map((g,gi)=>gi!==tmIdx?g:{...g,rows:g.rows.map(upd)});
                      else updated.tm_groups = prot.tm_groups.map((g,gi)=>gi!==tmIdx?g:{...g,rows:g.rows.map(upd)});
                      updated.history = [...prot.history, { date:nowStr(), user:prot.executor_ids?.[0]||"?",
                        action:`Сброшен переопределённый статус: «${r.manual_status}» → расчётный` }];
                      onUpdate(updated);
                      message.success({ content:"Ручной статус сброшен", duration:2 });
                    }}>
                    Сбросить
                  </Button>
                )}
              </>
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
          <Steps size="small" current={statusCfgStep[prot.status]??0}
            status={prot.status==="Аннулирован"?"error":"process"}
            style={{ flex:1, minWidth:280 }}
            items={[
              { title:"Черновик",    icon:<EditOutlined/> },
              { title:"В работе",    icon:<ClockCircleOutlined/> },
              { title:"На проверке", icon:<SendOutlined/> },
              { title:prot.status==="Аннулирован"?"Аннулирован":"Подписан",
                icon:prot.status==="Аннулирован"?<StopOutlined/>:<SafetyCertificateOutlined/> },
            ]}/>
          <Space wrap>
            {prot.status==="Черновик" && (
              <Button type="primary" icon={<SendOutlined/>} style={{ background:"#1890ff" }}
                onClick={() => transition("На проверке")}>Отправить на проверку</Button>
            )}
            {prot.status==="В работе" && (
              <>
                <Button icon={<ArrowLeftOutlined/>} onClick={() => transition("Черновик")}>Вернуть в черновики</Button>
                <Button type="primary" icon={<SendOutlined/>} style={{ background:"#1890ff" }}
                  onClick={() => transition("На проверке")}>Отправить на согласование</Button>
              </>
            )}
            {prot.status==="На проверке" && (<>
              <Button icon={<ArrowLeftOutlined/>} onClick={() => transition("В работе")}>Вернуть в работу</Button>
              {getAllRows().some(r => r.fact === null || r.fact === undefined || r.fact === "") ? (
                <Button type="primary" icon={<SafetyCertificateOutlined/>} style={{ background:"#389e0d" }}
                  onClick={() => setSignConfirmModal(true)}>Подписать</Button>
              ) : (
                <Button type="primary" icon={<SafetyCertificateOutlined/>} style={{ background:"#389e0d" }}
                  onClick={() => setConclusionModal(true)}>Подписать</Button>
              )}
            </>)}
            {prot.status==="Подписан" && (
              <Button danger icon={<StopOutlined/>} onClick={() => setCancelModal(true)}>Аннулировать</Button>
            )}
            <Button icon={<EyeOutlined/>} onClick={() => setPreviewOpen(true)}>Превью</Button>
            {prot.status!=="Аннулирован" && (
              <Button icon={<BugOutlined/>} style={{ borderColor:"#cf1322",color:"#cf1322" }}
                onClick={handleCreateDefect}>Создать дефект</Button>
            )}
            <Button icon={<PrinterOutlined/>} onClick={() => setPrintModal(true)}>Печатная форма</Button>
          </Space>
        </div>
        {prot.status==="Аннулирован" && prot.cancel_reason &&
          <Alert type="error" showIcon message={`Причина аннулирования: ${prot.cancel_reason}`} style={{ marginTop:10 }}/>}
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
                <Collapse defaultActiveKey={(prot.tm_groups||[]).map((_,i)=>String(i))} size="small" style={{ borderRadius:8 }}>
                  {(prot.tm_groups||[]).map((g,gi)=>(
                    <Panel key={String(gi)} header={
                      <Space>
                        <ApartmentOutlined style={{ color:"#1a5fa8" }}/>
                        <Text strong style={{ fontSize:13 }}>{g.tm_name}</Text>
                        {g.rows.some(r=>getEffectiveStatus(r).color==="error") &&
                          <Tag color="error" style={{ fontSize:10 }}>Отклонение</Tag>}
                      </Space>}>
                      <Table dataSource={g.rows} columns={makeRowCols(gi)} rowKey="id" size="small" pagination={false}/>
                    </Panel>
                  ))}
                </Collapse>
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
                  { key:"eq", label:"Объекты измерений", span:2,
                    children:(() => {
                      if (prot.mode === "equipment") {
                        const equip = EQUIP_ON_OBJECTS[prot.object_id]?.find(e => e.id === prot.equip_id);
                        return equip ? <Text>{equip.name} <Text type="secondary">(Зав.№{equip.serial})</Text></Text> : <Text type="secondary">не указано</Text>;
                      }
                      if (prot.mode === "equip_list") {
                        const groups = prot.equip_groups || [];
                        if (groups.length === 0) return <Text type="secondary">не указаны</Text>;
                        return (
                          <Space direction="vertical" size={4} style={{ width:"100%" }}>
                            {groups.map(g => {
                              const equip = EQUIP_ON_OBJECTS[prot.object_id]?.find(e => e.id === g.equip_id);
                              return <div key={g.equip_id}>
                                <ThunderboltOutlined style={{ color:"#1a5fa8", marginRight:6 }}/>
                                <Text>{equip?.name || g.equip_id}</Text>
                                {equip?.serial && <Text type="secondary" style={{ fontSize:11 }}> (Зав.№{equip.serial})</Text>}
                              </div>;
                            })}
                          </Space>
                        );
                      }
                      if (prot.mode === "tm_list") {
                        const groups = prot.tm_groups || [];
                        if (groups.length === 0) return <Text type="secondary">не указаны</Text>;
                        return (
                          <Space direction="vertical" size={4} style={{ width:"100%" }}>
                            {groups.map(g => {
                              const tm = TM_ON_OBJECTS[prot.object_id]?.find(t => t.id === g.tm_id);
                              return <div key={g.tm_id}>
                                <ApartmentOutlined style={{ color:"#1a5fa8", marginRight:6 }}/>
                                <Text>{tm?.name || g.tm_id}</Text>
                              </div>;
                            })}
                          </Space>
                        );
                      }
                      return <Text type="secondary">—</Text>;
                    })()
                  },
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
              extra={<Button size="small" icon={<BugOutlined/>} onClick={handleCreateDefect} disabled={badCount === 0 || getEntitiesWithDeviations().length === 0 || getEntitiesWithDeviations().every(e => (prot.defects || []).some(d => d.entity_id === e.id))}>Создать</Button>}>
              {!prot.defects?.length
                ? <Empty description="Дефекты не зафиксированы" image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                : prot.defects.map(d=>{
                    // Пытаемся получить информацию об отклонениях
                    let badRowsInfo = d.badRows || [];
                    // Если badRows не сохранены в дефекте - извлекаем из текущего протокола
                    // с учётом привязки к конкретной сущности (entity_id)
                    if (badRowsInfo.length === 0 && d.entity_id) {
                      let allRows = [];
                      if (prot.mode === "equipment") {
                        allRows = prot.rows || [];
                      } else if (prot.mode === "tm_list") {
                        const group = (prot.tm_groups || []).find(g => g.tm_id === d.entity_id);
                        allRows = group?.rows || [];
                      } else if (prot.mode === "equip_list") {
                        const group = (prot.equip_groups || []).find(g => g.equip_id === d.entity_id);
                        allRows = group?.rows || [];
                      }
                      const entityRows = allRows.filter(r => {
                        const s = getEffectiveStatus(r);
                        return s.color === "error" || s.color === "warning";
                      });
                      badRowsInfo = entityRows.map(r => {
                        const s = getEffectiveStatus(r);
                        return {
                          param_name: r.param_name,
                          unit: r.unit,
                          fact: r.fact,
                          zone_label: s.label,
                          zone_color: s.color
                        };
                      });
                    }
                    const descMatch = d.description?.match(/Без норматива: (\d+)/);
                    const undefinedCount = descMatch ? parseInt(descMatch[1]) : 0;
                    return (
                    <Alert key={d.id} type={d.severity === "error" ? "error" : "warning"} showIcon icon={<BugOutlined/>}
                      message={<Space><Text strong style={{ fontSize:12 }}>{d.title}</Text>
                        {d.severity && <Tag color={d.severity === "error" ? "red" : "orange"} style={{ fontSize: 10 }}>
                          {d.severity === "error" ? "Критический" : "Некритический"}</Tag>}
                        <Button size="small" type="text" danger icon={<DeleteOutlined/>} onClick={() => {
                          const updated = {...prot, defects: (prot.defects || []).filter(def => def.id !== d.id)};
                          onUpdate(updated);
                          api.success({ message:"Дефект удалён", duration:2 });
                        }}/>
                      </Space>}
                      description={<Space direction="vertical" size={2}>
                        <Text type="secondary" style={{ fontSize:11 }}>{d.description} · {d.created}</Text>
                        {d.entity_name && <Text type="secondary" style={{ fontSize: 10 }}>Привязан к: {d.entity_name}</Text>}
                        {badRowsInfo.length > 0 && (
                          <div style={{ marginTop: 8, background: "#f5f5f5", padding: "8px 10px", borderRadius: 4 }}>
                            <Text strong style={{ fontSize: 11 }}>Отклонения:</Text>
                            {badRowsInfo.map((br, idx) => (
                              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                                <Text style={{ fontSize: 11 }}>{br.param_name}:</Text>
                                <Text strong style={{ fontSize: 11 }}>{br.fact} {br.unit}</Text>
                                <Tag color={br.zone_color} style={{ fontSize: 10, margin: 0 }}>{br.zone_label}</Tag>
                              </div>
                            ))}
                          </div>
                        )}
                        {badRowsInfo.length === 0 && undefinedCount > 0 && (
                          <Text type="secondary" style={{ fontSize: 10, color: "#fa8c16" }}>⚠ {undefinedCount} параметр(а) без норматива</Text>
                        )}
                      </Space>}
                      style={{ marginBottom:8 }}/>
                    );
                  })
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

      {/* Модал подтверждения подписания с удалением незаполненных измерений */}
      <Modal
        title={<span style={{ color:"#cf1322" }}><WarningOutlined/> Подтверждение подписания</span>}
        open={signConfirmModal}
        onCancel={() => setSignConfirmModal(false)}
        footer={
          <Space>
            <Button onClick={() => setSignConfirmModal(false)}>Отмена</Button>
            <Button type="primary" style={{ background:"#389e0d" }}
              onClick={() => {
                // Удаляем измерения без значений fact и обновляем протокол
                const updated = {...prot};
                if (prot.mode === "equipment") {
                  updated.rows = (prot.rows || []).filter(r => r.fact !== null && r.fact !== undefined && r.fact !== "");
                } else if (prot.mode === "tm_list") {
                  updated.tm_groups = (prot.tm_groups || []).map(g => ({
                    ...g,
                    rows: g.rows.filter(r => r.fact !== null && r.fact !== undefined && r.fact !== "")
                  }));
                } else if (prot.mode === "equip_list") {
                  updated.equip_groups = (prot.equip_groups || []).map(g => ({
                    ...g,
                    rows: g.rows.filter(r => r.fact !== null && r.fact !== undefined && r.fact !== "")
                  }));
                }
                // Сохраняем обновленный протокол
                onUpdate(updated);
                // Закрываем текущий модал и открываем модал выбора заключения
                setSignConfirmModal(false);
                setConclusionModal(true);
              }}>
              Подписать
            </Button>
          </Space>
        }
      >
        <Alert
          type="warning"
          showIcon
          message="Внимание!"
          description="Все характеристики без указанных данных измерений будут удалены из итогового протокола."
          style={{ marginBottom: 16 }}
        />
        <Text type="secondary">
          После подписания протокола измерения без внесённых значений не будут отображаться в документе.
        </Text>
      </Modal>

      <Modal title={<span style={{ color:"#cf1322" }}><StopOutlined/> Аннулирование</span>}
        open={cancelModal}
        onOk={() => {
          if (!cancelReason.trim()) { api.warning({ message:"Укажите причину" }); return; }
          transition("Аннулирован", { cancel_reason:cancelReason });
          setCancelModal(false); setCancelReason("");
        }}
        onCancel={() => { setCancelModal(false); setCancelReason(""); }}
        okText="Аннулировать" okButtonProps={{ danger:true }}>
        <Alert type="warning" showIcon message="Действие нельзя отменить." style={{ marginBottom:12 }}/>
        <Input.TextArea rows={3} value={cancelReason} onChange={e=>setCancelReason(e.target.value)} placeholder="Причина..."/>
      </Modal>

      <Modal title={canOverride ? "Переопределение статуса строки" : "Указать статус (норматив не задан)"}
        open={!!manualModal}
        onCancel={() => { setManualModal(null); setManualVal(""); setManualReason(""); setManualSeverity("normal"); }}
        footer={
          <Space>
            {manualVal && (
              <Button onClick={resetManual}>Сбросить к расчётному</Button>
            )}
            <Button onClick={() => { setManualModal(null); setManualVal(""); setManualReason(""); setManualSeverity("normal"); }}>Отмена</Button>
            <Button type="primary" onClick={applyManual}>Применить</Button>
          </Space>
        }>
        <Row gutter={12} style={{ marginBottom:12 }}>
          <Col span={12}>
            <Form.Item label="Критичность" style={{ marginBottom:0 }}>
              <Select value={manualSeverity} onChange={v=>setManualSeverity(v)} style={{ width:"100%" }}>
                <Option value="normal">Норма</Option>
                <Option value="warning">Предупреждение</Option>
                <Option value="critical">Критическое</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Статус" style={{ marginBottom:0 }}>
              <Input value={manualVal} onChange={e=>setManualVal(e.target.value)}
                placeholder="Норма, Отклонение..."/>
            </Form.Item>
          </Col>
        </Row>
        <Input.TextArea rows={2} value={manualReason} onChange={e=>setManualReason(e.target.value)}
          placeholder="Обоснование (обязательно)..."/>
      </Modal>

      <Modal title={<span><BugOutlined style={{ color:"#cf1322",marginRight:8 }}/>Создание дефекта</span>}
        open={defectModal}
        onOk={() => {
          const entitiesWithDeviations = getEntitiesWithDeviations();
          const entity = defectEntity || entitiesWithDeviations[0];
          const severityLabel = entity?.severity === "error" ? "Критическое" : "Некритическое";
          // Собираем информацию об отклонениях
          const badRowsDetails = (entity?.badRows || []).map(br => `${br.param_name}: ${br.fact} ${br.unit} → ${br.zone_label}`).join("; ");
          const d = { 
            id:`d${Date.now()}`, 
            title:`Дефект из протокола ${prot.number}`,
            description:`Выявлено при испытаниях. ${entity ? `Сущность: ${entity.name}. ` : ""}Критичность: ${severityLabel}. Отклонений: ${badCount}. ${badRowsDetails ? `Параметры: ${badRowsDetails}. ` : ""}Без норматива: ${undefinedCount}.`,
            created:new Date().toISOString().slice(0,10),
            entity_type: entity?.type || null,
            entity_id: entity?.id || null,
            entity_name: entity?.name || null,
            severity: entity?.severity || null,
            badRows: entity?.badRows || []
          };
          onUpdate({...prot, defects:[...(prot.defects||[]),d]});
          setDefectModal(false); 
          setDefectEntity(null);
          api.success({ message:"Дефект создан", duration:2 });
        }}
        onCancel={() => { setDefectModal(false); setDefectEntity(null); }} 
        okText="Создать дефект" 
        okButtonProps={{ danger:true }}
        okDisabled={!defectEntity && getEntitiesWithDeviations().length > 1}
      >
        <Alert type="info" showIcon style={{ marginBottom:12 }}
          message="Дефект будет создан с привязкой к протоколу и объекту."/>
        <Text type="secondary" style={{ fontSize:12 }}>Объект: {obj?.name}</Text>
        
        {/* Выбор сущности с отклонениями */}
        {getEntitiesWithDeviations().length > 1 && (
          <div style={{ marginTop: 16 }}>
            <Text strong style={{ display: "block", marginBottom: 8 }}>Выберите сущность с отклонениями:</Text>
            <Radio.Group 
              value={defectEntity?.id} 
              onChange={(e) => {
                const selected = getEntitiesWithDeviations().find(ent => ent.id === e.target.value);
                setDefectEntity(selected);
              }}
              style={{ width: "100%" }}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {getEntitiesWithDeviations().map(ent => (
                  <Radio key={ent.id} value={ent.id} style={{ width: "100%", marginRight: 0 }}>
                    <Space align="center">
                      <Text>{ent.name}</Text>
                      <Tag color={ent.severity === "error" ? "red" : "orange"} style={{ marginLeft: 8 }}>
                        {ent.severity === "error" ? "Критическое" : "Некритическое"}
                      </Tag>
                      <Text type="secondary" style={{ fontSize: 11 }}>({ent.deviationCount} отклонение{ent.deviationCount > 1 ? "ий" : "ие"})</Text>
                    </Space>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </div>
        )}
        
        {/* Отображение выбранной сущности и её отклонений */}
        {(defectEntity || (getEntitiesWithDeviations().length === 1 && getEntitiesWithDeviations()[0])) && (
          <div style={{ marginTop: 16, padding: 12, background: "#f6f8fa", borderRadius: 6 }}>
            {(() => {
              const entity = defectEntity || getEntitiesWithDeviations()[0];
              return (
                <>
                  <Space style={{ marginBottom: 12 }}>
                    <Text strong>Сущность:</Text>
                    <Text>{entity.name}</Text>
                    <Tag color={entity.severity === "error" ? "red" : "orange"}>
                      {entity.severity === "error" ? "Критическое" : "Некритическое"}
                    </Tag>
                  </Space>
                  {entity.badRows && entity.badRows.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      <Text strong style={{ fontSize: 12 }}>Отклонённые параметры:</Text>
                      <div style={{ background: "#fff", padding: 8, borderRadius: 4, marginTop: 6 }}>
                        {entity.badRows.map((br, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <Text style={{ fontSize: 12 }}>{br.param_name}:</Text>
                            <Text strong style={{ fontSize: 12, color: br.zone_color === "error" ? "#cf1322" : "#fa8c16" }}>
                              {br.fact} {br.unit}
                            </Text>
                            <Tag color={br.zone_color} style={{ fontSize: 10, margin: 0 }}>{br.zone_label}</Tag>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
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
