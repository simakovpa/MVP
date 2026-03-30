import { useState, useEffect } from "react";
import {
  ConfigProvider, Layout, Menu, Badge, Typography, Modal
} from "antd";
import {
  FileProtectOutlined, PlusOutlined, ControlOutlined,
  ThunderboltOutlined, SafetyCertificateOutlined, HistoryOutlined,
  SettingOutlined, LogoutOutlined, UserOutlined
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

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

// ─── Тема ─────────────────────────────────────────────────────────────────────
const theme = {
  token: {
    colorPrimary: "#1677ff", colorBgContainer: "#ffffff",
    colorBgLayout: "#f0f2f5", borderRadius: 6,
    fontFamily: "'IBM Plex Sans','Segoe UI',sans-serif",
    fontSize: 13, colorTextBase: "#1a1a2e",
  },
  components: {
    Table: { headerBg:"#fafafa", borderColor:"#f0f0f0", rowHoverBg:"#f5f5f5" },
    Menu: { itemBg:"#ffffff", itemColor:"rgba(0,0,0,0.88)", itemHoverBg:"#f5f5f5",
             itemSelectedBg:"#e6f4ff", itemSelectedColor:"#1677ff", darkItemBg:"#ffffff", darkItemColor:"rgba(0,0,0,0.88)" },
    Layout: { headerBg:"#ffffff", siderBg:"#ffffff", bodyBg:"#f0f2f5", headerHeight:56 },
  }
};

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [protocols,     setProtocols]     = useState(() => { const s = localStorage.getItem('protocols'); return s ? JSON.parse(s) : INIT_PROTOCOLS; });
  const [normRanges,    setNormRanges]    = useState(() => { const s = localStorage.getItem('normRanges'); return s ? JSON.parse(s) : INIT_NORM_RANGES; });
  const [passportNorms, setPassportNorms] = useState(() => { const s = localStorage.getItem('passportNorms'); return s ? JSON.parse(s) : INIT_PASSPORT_NORMS; });
  const [overrides,     setOverrides]     = useState(() => { const s = localStorage.getItem('overrides'); return s ? JSON.parse(s) : INIT_OVERRIDES; });
  const [instruments,   setInstruments]   = useState(() => { const s = localStorage.getItem('instruments'); return s ? JSON.parse(s) : INIT_INSTRUMENTS; });
  const [nomenclatures, setNomenclatures] = useState(NOMENCLATURES);
  const [workTypes,     setWorkTypes]     = useState(WORK_TYPES);
  const [params,        setParams]        = useState(PARAMS);
  const [labs,          setLabs]          = useState(LABS);

  const [screen,      setScreen]      = useState("list");
  const [activeProtId, setActiveProtId] = useState(null);
  const [menuKey,     setMenuKey]     = useState("protocols");

  // Синхронизация справочников с localStorage
  useEffect(() => { localStorage.setItem('protocols', JSON.stringify(protocols)); }, [protocols]);
  useEffect(() => { localStorage.setItem('normRanges', JSON.stringify(normRanges)); }, [normRanges]);
  useEffect(() => { localStorage.setItem('passportNorms', JSON.stringify(passportNorms)); }, [passportNorms]);
  useEffect(() => { localStorage.setItem('overrides', JSON.stringify(overrides)); }, [overrides]);
  useEffect(() => { localStorage.setItem('instruments', JSON.stringify(instruments)); }, [instruments]);

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

  function openProt(p)  {
    if (p.status === "Черновик") {
      setActiveProtId(p.id); setScreen("create"); setMenuKey("protocols");
    } else {
      setActiveProtId(p.id); setScreen("card"); setMenuKey("protocols");
    }
  }
  function editProt(id)  { setActiveProtId(id); setScreen("create"); setMenuKey("protocols"); }
  function saveProt(p)   {
    const exists = protocols.find(x => x.id === p.id);
    if (exists) {
      setProtocols(prev => prev.map(x => x.id === p.id ? p : x));
    } else {
      setProtocols(prev => [p, ...prev]);
    }
    setActiveProtId(p.id); setScreen("card");
  }
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
        
        {/* Header - как в ОРЭО */}
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
          height: 56,
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          {/* Логотип */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a href="/" style={{ display: 'inline-block', lineHeight: 0 }}>
              <div style={{ 
                width: 34, 
                height: 34, 
                background: 'linear-gradient(135deg, #1677ff, #4096ff)',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16
              }}>
                Э
              </div>
            </a>
            {/* Название приложения */}
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>
              ЭТЛ Модуль
            </span>
          </div>
          
          {/* Правая часть header - настройки и профиль */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a href="/admin" style={{ color: 'rgba(0,0,0,0.88)', lineHeight: 0 }}>
              <SettingOutlined style={{ fontSize: 18 }} />
            </a>
            <a href="/profile" style={{ width: 24, height: 24, lineHeight: 0 }}>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#e6f4ff',
                color: '#1677ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12
              }}>
                <UserOutlined />
              </div>
            </a>
            <span style={{ cursor: 'pointer', color: 'rgba(0,0,0,0.88)' }}>
              <LogoutOutlined style={{ fontSize: 18 }} />
            </span>
          </div>
        </Header>
        
        <Layout style={{ flex: 1, marginTop: 0 }}>
          <Sider width={260} collapsible={false} 
            style={{ 
              position: 'sticky', 
              top: 56, 
              height: 'calc(100vh - 56px)', 
              overflow: 'auto', 
              flexShrink: 0,
              background: '#ffffff',
              borderRight: '1px solid #f0f0f0'
            }}>
            {/* Меню в сайдбаре */}
            <Menu mode="inline" selectedKeys={[menuKey]} items={menuItems}
              onClick={onMenu} 
              style={{ 
                borderRight: 'none', 
                paddingTop: 8,
                background: '#ffffff',
                color: 'rgba(0,0,0,0.88)'
              }}/>

            {/* Статистика в сайдбаре */}
            <div style={{ padding:"14px 12px", borderTop:"1px solid #f0f0f0", marginTop:8 }}>
              {[
                { l:"Черновики",       v:protocols.filter(p=>p.status==="Черновик").length,     c:"#8c8c8c" },
                { l:"На проверке",     v:protocols.filter(p=>p.status==="На проверке").length,   c:"#1890ff" },
                { l:"Ожидают ЭТЛ",    v:newNomCount,                                            c:"#eb2f96" },
                { l:"Просрочено приборов", v:expiredCount,                                       c:"#ff4d4f" },
              ].map(x=>(
                <div key={x.l} style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                  <span style={{ color:"#8c8c8c",fontSize:11 }}>{x.l}</span>
                  <span style={{ color:x.c,fontWeight:700,fontSize:12 }}>{x.v}</span>
                </div>
              ))}
            </div>
          </Sider>

          <Layout style={{ flex:1, minWidth:0, overflow:"hidden" }}>
            <Content style={{ background:"#f0f2f5", minHeight:"calc(100vh - 56px)", overflow:"auto" }}>
            {screen==="list" && (
              <ProtocolList
                protocols={protocols} workTypes={workTypes} params={params} instruments={instruments}
                onOpen={openProt} onEdit={editProt} onCreate={() => { setActiveProtId(null); nav("create","create"); }}/>
            )}
            {screen==="card" && activeProt && (
              <ProtocolCard
                prot={activeProt} workTypes={workTypes} params={params} instruments={instruments}
                onBack={() => nav("list","protocols")} onUpdate={updateProt}/>
            )}
            {screen==="create" && (() => {
              const editProt = activeProtId ? protocols.find(p => p.id === activeProtId) : null;
              if (editProt) {
                return (
                  <Modal open={true} title={`Редактирование черновика ${editProt.number}`} width={900} footer={null}
                    onCancel={() => { setActiveProtId(null); nav("list","protocols"); }}>
                    <CreateProtocol
                      editProtocol={editProt}
                      protocols={protocols} normRanges={normRanges} passportNorms={passportNorms}
                      overrides={overrides} workTypes={workTypes} params={params} instruments={instruments}
                      onSave={saveProt} onCancel={() => { setActiveProtId(null); nav("list","protocols"); }}/>
                  </Modal>
                );
              }
              return (
                <CreateProtocol
                  editProtocol={null}
                  protocols={protocols} normRanges={normRanges} passportNorms={passportNorms}
                  overrides={overrides} workTypes={workTypes} params={params} instruments={instruments}
                  onSave={saveProt} onCancel={() => { setActiveProtId(null); nav("list","protocols"); }}/>
              );
            })()}
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
      </Layout>
    </ConfigProvider>
  );
}
