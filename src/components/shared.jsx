import { Tag, Tooltip, Space, InputNumber, Button, Select } from "antd";
import { SwapOutlined, QuestionCircleOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { getEffectiveStatus, calStatus, uid } from "../utils/helpers";

// ─── StatusTag — статус протокола ─────────────────────────────────────────────
const statusCfg = {
  "Черновик":    { color:"default" },
  "На проверке": { color:"processing" },
  "Подписан":    { color:"success" },
  "Аннулирован": { color:"error" },
};
export function StatusTag({ status }) {
  const cfg = statusCfg[status] || { color:"default" };
  return <Tag color={cfg.color} style={{ fontWeight:600, fontSize:12 }}>{status}</Tag>;
}

// ─── RowStatusBadge — статус строки измерения ─────────────────────────────────
export function RowStatusBadge({ row }) {
  const s = getEffectiveStatus(row);
  return (
    <Space size={4}>
      <Tag color={s.color} style={{ fontSize:11, fontWeight:600, margin:0 }}>{s.label}</Tag>
      {s.overridden &&
        <Tooltip title={`Переопределено: ${row.manual_reason}`}>
          <SwapOutlined style={{ color:"#fa8c16", fontSize:12 }} />
        </Tooltip>}
      {s.undefined &&
        <Tooltip title="Норматив не задан — укажите статус вручную">
          <QuestionCircleOutlined style={{ color:"#8c8c8c", fontSize:12 }} />
        </Tooltip>}
    </Space>
  );
}

// ─── NormSourceBadge — источник норматива ────────────────────────────────────
const srcColors = {
  "Переопределение":   "volcano",
  "Паспортный норматив":"geekblue",
  "Норм. диапазон":   "cyan",
};
export function NormSourceBadge({ source }) {
  if (!source) return <span style={{ fontSize:11, color:"#888" }}>—</span>;
  const [kind] = source.split(" · ");
  return (
    <Tooltip title={source}>
      <Tag color={srcColors[kind] || "default"} style={{ fontSize:10, cursor:"help" }}>{kind}</Tag>
    </Tooltip>
  );
}

// ─── CalTag — статус поверки прибора ─────────────────────────────────────────
export function CalTag({ ins }) {
  const s = calStatus(ins);
  if (s === "expired")  return <Tag color="error"   style={{ fontSize:10 }}>Просрочена</Tag>;
  if (s === "expiring") return <Tag color="warning" style={{ fontSize:10 }}>Истекает</Tag>;
  if (s === "none")     return <Tag           style={{ fontSize:10 }}>Нет данных</Tag>;
  return                       <Tag color="success" style={{ fontSize:10 }}>Действительна</Tag>;
}

// ─── ZoneEditor — редактор диапазонов ────────────────────────────────────────
const { Option } = Select;


export function ZoneEditor({ zones, onChange }) {
  const colorOpts = [
    { label:"Норма (зелёный)",     value:"success"    },
    { label:"Риск (жёлтый)",       value:"warning"    },
    { label:"Критично (красный)",  value:"error"      },
    { label:"Инфо (синий)",        value:"processing" },
  ];
  const add  = () => onChange([...zones, { id:uid(), label:"Новый статус", min:null, min_inc:true, max:null, max_inc:true, color:"success" }]);
  const del  = id => onChange(zones.filter(z => z.id !== id));
  const upd  = (id,f,v) => onChange(zones.map(z => z.id===id ? {...z,[f]:v} : z));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {zones.map(z => (
        <div key={z.id} style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap",
          padding:"8px 10px", borderRadius:6, background:"#fafafa", border:"1px solid #e8e8e8" }}>
          <input value={z.label} onChange={e=>upd(z.id,"label",e.target.value)}
            placeholder="Наименование статуса"
            style={{ width:170, fontSize:12, padding:"2px 6px", border:"1px solid #d9d9d9", borderRadius:4 }}/>
          <Select value={z.color} onChange={v=>upd(z.id,"color",v)} style={{ width:150 }} size="small">
            {colorOpts.map(o=><Option key={o.value} value={o.value}><Tag color={o.value}>{o.label}</Tag></Option>)}
          </Select>
          <div style={{ display:"flex", alignItems:"center", gap:3 }}>
            <Select value={z.min_inc?">=":">"} onChange={v=>upd(z.id,"min_inc",v===">=")} style={{ width:52 }} size="small">
              <Option value=">=">&ge;</Option><Option value=">">{">"}</Option>
            </Select>
            <InputNumber value={z.min} onChange={v=>upd(z.id,"min",v)} placeholder="мин" style={{ width:76 }} size="small"/>
            <span style={{ fontSize:11, color:"#888" }}>и</span>
            <Select value={z.max_inc?"<=":"<"} onChange={v=>upd(z.id,"max_inc",v==="<=")} style={{ width:52 }} size="small">
              <Option value="<=">&le;</Option><Option value="<">{"<"}</Option>
            </Select>
            <InputNumber value={z.max} onChange={v=>upd(z.id,"max",v)} placeholder="макс" style={{ width:76 }} size="small"/>
          </div>
          <Button danger size="small" icon={<DeleteOutlined/>} onClick={()=>del(z.id)}/>
        </div>
      ))}
      <Button size="small" icon={<PlusOutlined/>} onClick={add} style={{ alignSelf:"flex-start" }}>
        Добавить диапазон
      </Button>
    </div>
  );
}
