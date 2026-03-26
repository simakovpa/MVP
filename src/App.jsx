import { useState } from "react";
import {
  ConfigProvider, Layout, Menu, Badge, Typography
} from "antd";
import {
  FileProtectOutlined, PlusOutlined, ControlOutlined,
  ThunderboltOutlined, SafetyCertificateOutlined, HistoryOutlined
} from "@ant-design/icons";
import {
  INIT_PROTOCOLS, INIT_NORM_RANGES, INIT_PASSPORT_NORMS,
  INIT_OVERRIDES, INIT_INSTRUMENTS, NOMENCLATURES, WORK_TYPES, PARAMS, LABS
} from "./data/mockData";
import { uid, genNum, nowStr } from "./utils/helpers";
import ProtocolList    from "./screens/ProtocolList";
import ProtocolCard    from "./screens/ProtocolCard";
import CreateProtocol  from "./screens/CreateProtocol";
import NormativesScreen, { LabsScreen } from "./screens/NormativesScreen";
import InstrumentsScreen from "./screens/InstrumentsScreen";
import HistoryScreen from "./screens/HistoryScreen";

const { Sider, Content } = Layout;
const { Text } = Typography;

// ─── Тема ─────────────────────────────────────────────────────────────────────
const theme = {
  token: {
    colorPrimary: "#1a5fa8", colorBgContainer: "#ffffff",
    colorBgLayout: "#f0f2f5", borderRadius: 6,
    fontFamily: "'IBM Plex Sans','Segoe UI',sans-serif",
    fontSize: 13, colorTextBase: "#1a1a2e",
  },
  components: {
    Table: { headerBg:"#f0f4f8", borderColor:"#dde3ec", rowHoverBg:"#f5f8ff" },
    Menu:  { itemBg:"#0f2744", itemColor:"#a8bdd4", itemHoverBg:"#1a3a5c",
             itemSelectedBg:"#1a5fa8", itemSelectedColor:"#ffffff", subMenuItemBg:"#0a1e35" },
  }
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [protocols,     setProtocols]     = useState(INIT_PROTOCOLS);
  const [normRanges,    setNormRanges]    = useState(INIT_NORM_RANGES);
  const [passportNorms, setPassportNorms] = useState(INIT_PASSPORT_NORMS);
  const [overrides,     setOverrides]     = useState(INIT_OVERRIDES);
  const [instruments,   setInstruments]   = useState(INIT_INSTRUMENTS);
  const [nomenclatures, setNomenclatures] = useState(NOMENCLATURES);
  const [workTypes,     setWorkTypes]     = useState(WORK_TYPES);
  const [params,        setParams]        = useState(PARAMS);
  const [labs,          setLabs]          = useState(LABS);

  const [screen,      setScreen]      = useState("list");
  const [activeProtId, setActiveProtId] = useState(null);
  const [menuKey,     setMenuKey]     = useState("protocols");

  const activeProt   = protocols.find(p => p.id === activeProtId);
  const newNomCount  = nomenclatures.filter(n => !n.accepted).length;
  const expiredLabsCount = labs.filter(l => {
    if (!l.exp) return false;
    return new Date(l.exp) <= new Date();
  }).length;

  const expiredCount = instruments.filter(i => {
    if (i.archived || !i.date_next_cal) return false;
    return new Date(i.date_next_cal) <= new Date();
  }).length;

  function openProt(id)  { setActiveProtId(id); setScreen("card"); setMenuKey("protocols"); }
  function saveProt(p)   { setProtocols(prev => [p,...prev]); setActiveProtId(p.id); setScreen("card"); }
  function updateProt(p) { setProtocols(prev => prev.map(x => x.id===p.id ? p : x)); }

  const nav = (s, k) => { setScreen(s); setMenuKey(k || s); };

  const menuItems = [
    { key:"protocols",   icon:<FileProtectOutlined/>, label:"Протоколы" },
    { key:"create",      icon:<PlusOutlined/>,        label:"Создать протокол" },
    { key:"history",     icon:<HistoryOutlined/>,     label:"История измерений" },
    { type:"divider" },
    { key:"instruments", icon:<ThunderboltOutlined/>,
      label:<span>Приборы {expiredCount>0 && <Badge count={expiredCount} size="small" style={{ marginLeft:4 }}/>}</span> },
    { key:"labs",        icon:<SafetyCertificateOutlined/>,
      label:<span>ЭТЛ {expiredLabsCount>0 && <Badge count={expiredLabsCount} size="small" style={{ marginLeft:4 }}/>}</span> },
    { key:"normatives",  icon:<ControlOutlined/>,
      label:<span>Нормативы {newNomCount>0 && <Badge count={newNomCount} size="small" style={{ marginLeft:4 }}/>}</span> },
  ];

  function onMenu({ key }) {
    if      (key==="create")      nav("create","create");
    else if (key==="protocols")   nav("list","protocols");
    else if (key==="normatives")  nav("normatives","normatives");
    else if (key==="instruments") nav("instruments","instruments");
    else if (key==="labs")        nav("labs","labs");
    else if (key==="history")     nav("history","history");
  }

  return (
    <ConfigProvider theme={theme}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        html, body, #root { margin:0; width:100%; height:100%; }
        * { box-sizing: border-box; }
        .ant-layout { width: 100% !important; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-thumb { background:#c1ccd9; border-radius:3px; }
      `}</style>
      <Layout style={{ minHeight:"100vh", width:"100%", display:"flex" }}>
        <Sider width={220} collapsible={false} style={{ position:"sticky", top:0, height:"100vh", overflow:"auto", flexShrink:0 }}>
          {/* Логотип */}
          <div style={{ padding:"16px 14px 12px", borderBottom:"1px solid rgba(255,255,255,0.08)",
            display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:30,height:30,borderRadius:8,
              background:"linear-gradient(135deg,#1a5fa8,#4d9de0)",
              display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0 }}>⚡</div>
            <div>
              <div style={{ color:"#fff",fontWeight:700,fontSize:12,lineHeight:1.2 }}>ЭТЛ Модуль</div>
              <div style={{ color:"#6b8fa8",fontSize:10 }}>Испытания и измерения</div>
            </div>
          </div>

          <Menu mode="inline" selectedKeys={[menuKey]} items={menuItems}
            onClick={onMenu} style={{ borderRight:"none",paddingTop:8 }}/>

          {/* Статистика в сайдбаре */}
          <div style={{ padding:"14px 12px", borderTop:"1px solid rgba(255,255,255,0.06)", marginTop:8 }}>
            {[
              { l:"Черновики",       v:protocols.filter(p=>p.status==="Черновик").length,     c:"#6b8fa8" },
              { l:"На проверке",     v:protocols.filter(p=>p.status==="На проверке").length,   c:"#4d9de0" },
              { l:"Ожидают ЭТЛ",    v:newNomCount,                                            c:"#eb2f96" },
              { l:"Просрочено приборов", v:expiredCount,                                       c:"#ff4d4f" },
            ].map(x=>(
              <div key={x.l} style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                <span style={{ color:"#6b8fa8",fontSize:11 }}>{x.l}</span>
                <span style={{ color:x.c,fontWeight:700,fontSize:12 }}>{x.v}</span>
              </div>
            ))}
          </div>
        </Sider>

        <Layout style={{ flex:1, minWidth:0, overflow:"hidden" }}>
          <Content style={{ background:"#f0f2f5", minHeight:"100vh", overflow:"auto" }}>
            {screen==="list" && (
              <ProtocolList
                protocols={protocols} workTypes={workTypes} params={params} instruments={instruments}
                onOpen={openProt} onCreate={() => nav("create","create")}/>
            )}
            {screen==="card" && activeProt && (
              <ProtocolCard
                prot={activeProt} workTypes={workTypes} params={params} instruments={instruments}
                onBack={() => nav("list","protocols")} onUpdate={updateProt}/>
            )}
            {screen==="create" && (
              <CreateProtocol
                protocols={protocols} normRanges={normRanges} passportNorms={passportNorms}
                overrides={overrides} workTypes={workTypes} params={params} instruments={instruments}
                onSave={saveProt} onCancel={() => nav("list","protocols")}/>
            )}
            {screen==="normatives" && (
              <NormativesScreen
                normRanges={normRanges}    setNormRanges={setNormRanges}
                passportNorms={passportNorms} setPassportNorms={setPassportNorms}
                overrides={overrides}      setOverrides={setOverrides}
                nomenclatures={nomenclatures} setNomenclatures={setNomenclatures}
                workTypes={workTypes}      setWorkTypes={setWorkTypes}
                params={params}            setParams={setParams}
                labs={labs}                setLabs={setLabs}/>
            )}
            {screen==="instruments" && (
              <InstrumentsScreen instruments={instruments} setInstruments={setInstruments}/>
            )}
            {screen==="labs" && (
              <LabsScreen labs={labs} setLabs={setLabs}/>
            )}
            {screen==="history" && (
              <HistoryScreen
                protocols={protocols}
                workTypes={workTypes}
                params={params}
                instruments={instruments}
                onOpenProtocol={openProt}
              />
            )}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
