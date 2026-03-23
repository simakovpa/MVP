import { Modal, Button } from "antd";
import { PrinterOutlined, FileProtectOutlined } from "@ant-design/icons";
import { OBJECTS, LABS, EMPLOYEES, DEPT_FLAT, empName } from "../data/mockData";
import { getEffectiveStatus } from "../utils/helpers";

// Вспомогательная функция: подпись к строке сотрудника
function SignatureLine({ label, name }) {
  return (
    <tr>
      <td style={s.sigLabel}>{label}</td>
      <td style={s.sigName}>{name || ""}</td>
    </tr>
  );
}

// Стили — имитируем бланк
const s = {
  page: {
    fontFamily: "Times New Roman, serif",
    fontSize: 11,
    color: "#000",
    background: "#fff",
    padding: "20px 28px",
    maxWidth: 820,
    margin: "0 auto",
    lineHeight: 1.35,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 10,
    marginBottom: 8,
  },
  th: {
    border: "1px solid #000",
    padding: "3px 5px",
    textAlign: "center",
    fontWeight: "bold",
    background: "#f5f5f5",
    verticalAlign: "middle",
  },
  td: {
    border: "1px solid #000",
    padding: "3px 5px",
    verticalAlign: "middle",
  },
  tdCenter: {
    border: "1px solid #000",
    padding: "3px 5px",
    textAlign: "center",
    verticalAlign: "middle",
  },
  headerBox: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
    fontSize: 10,
  },
  orgLeft: {
    flex: 1,
    borderRight: "1px solid #000",
    paddingRight: 10,
    fontSize: 10,
  },
  orgRight: {
    flex: 1,
    paddingLeft: 10,
    fontSize: 10,
  },
  protTitle: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 2,
    marginTop: 10,
    textTransform: "uppercase",
  },
  protSubtitle: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 11,
    marginBottom: 10,
  },
  condRow: {
    display: "flex",
    gap: 4,
    marginBottom: 2,
    fontSize: 10,
  },
  condLabel: {
    minWidth: 260,
    fontStyle: "italic",
  },
  condVal: {
    fontWeight: "bold",
    borderBottom: "1px solid #000",
    minWidth: 60,
    paddingLeft: 4,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 10,
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  conclusionRow: {
    display: "flex",
    gap: 6,
    marginTop: 6,
    fontSize: 10,
  },
  conclusionLabel: {
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  conclusionVal: {
    borderBottom: "1px solid #000",
    flex: 1,
  },
  sigTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 12,
    fontSize: 10,
  },
  sigLabel: {
    width: "35%",
    paddingTop: 10,
    paddingBottom: 2,
    verticalAlign: "bottom",
    borderBottom: "1px solid #000",
    paddingRight: 8,
  },
  sigName: {
    paddingTop: 10,
    paddingBottom: 2,
    verticalAlign: "bottom",
    borderBottom: "1px solid #000",
    paddingLeft: 8,
    fontStyle: "italic",
  },
  sigHint: {
    fontSize: 8,
    color: "#555",
    textAlign: "center",
  },
};

export default function ProtocolPreview({ prot, workTypes, instruments, open, onClose }) {
  if (!prot) return null;

  const obj  = OBJECTS.find(o => o.id === prot.object_id);
  const lab  = LABS.find(l => l.id === prot.lab_id);
  const wt   = workTypes.find(w => w.id === prot.work_type_id);

  // Подразделение-заказчик
  const dept = DEPT_FLAT.find(d => d.id === prot.dept_id);
  const deptStr = dept
    ? dept.level === "dept" ? dept.name : dept.name
    : "—";

  // Исполнители
  const executors = (prot.executor_ids || [])
    .map(id => EMPLOYEES.find(e => e.id === id))
    .filter(Boolean);
  const reviewer = prot.reviewer_id
    ? EMPLOYEES.find(e => e.id === prot.reviewer_id)
    : null;

  // Строки измерений
  const allRows = prot.mode === "tm_list"
    ? (prot.tm_groups || []).flatMap(g =>
        g.rows.map(r => ({ ...r, group_label: g.tm_name }))
      )
    : prot.mode === "equip_list"
    ? (prot.equip_groups || []).flatMap(g =>
        g.rows.map(r => ({ ...r, group_label: `${g.equip_name} (${g.serial})` }))
      )
    : (prot.rows || []);

  // Приборы
  const usedInstruments = (prot.instrument_ids || [])
    .map(id => instruments.find(x => x.id === id))
    .filter(Boolean);

  // Условия среды
  const env = prot.env || {};
  const envFields = wt?.env_fields || {};

  // Филиал из dept
  const branch = DEPT_FLAT.find(d => d.level === "branch" &&
    (dept?.branchName === d.name || dept?.id === d.id));

  const handlePrint = () => {
    const win = window.open("", "_blank");
    const html = document.getElementById("protocol-preview-body").innerHTML;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Протокол ${prot.number}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 11pt; margin: 15mm 20mm; color: #000; }
          table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 8px; }
          th, td { border: 1px solid #000; padding: 3px 5px; vertical-align: middle; }
          th { text-align: center; font-weight: bold; background: #f0f0f0; }
          .no-border td { border: none; }
          @page { size: A4; margin: 15mm 20mm; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>${html}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  const PreviewBody = () => (
    <div style={s.page} id="protocol-preview-body">

      {/* ── Шапка ── */}
      <div style={s.headerBox}>
        <div style={s.orgLeft}>
          <div style={{ fontWeight: "bold" }}>{branch?.name || "Филиал"}</div>
          <div>Электротехническая лаборатория: <b>{lab?.name || "—"}</b></div>
          <div>Свидетельство о регистрации <b>{lab?.cert || "—"}</b></div>
          <div>Действительно до <b>{lab?.exp || "—"}</b></div>
        </div>
        <div style={s.orgRight}>
          <div>Заказчик: <b>{deptStr}</b></div>
          <div>Объект: <b>{obj?.name || "—"}</b></div>
          <div>Дата проведения измерений: <b>{prot.date_measured || "—"}</b></div>
        </div>
      </div>

      {/* ── Заголовок ── */}
      <div style={s.protTitle}>ПРОТОКОЛ № {prot.number}</div>
      <div style={s.protSubtitle}>{wt?.name || "Испытания и измерения"}</div>

      {/* ── Цель и НТД ── */}
      <div style={s.condRow}>
        <span style={s.condLabel}>Цель измерений (испытаний):</span>
        <span style={s.condVal}>{prot.test_type}</span>
      </div>
      <div style={{ ...s.condRow, marginBottom: 8 }}>
        <span style={s.condLabel}>
          Нормативные и технические документы, на соответствие требованиям которых проведены измерения:
        </span>
        <span style={{ ...s.condVal, minWidth: 200 }}>{wt?.norm_doc || "—"}</span>
      </div>

      {/* ── Условия измерений ── */}
      {(envFields.temp || envFields.humidity || envFields.pressure || env.temp !== undefined) && (
        <table style={s.table}>
          <tbody>
            <tr>
              {(envFields.temp || env.temp !== undefined) && <>
                <td style={s.td}>Температура воздуха, °C</td>
                <td style={{ ...s.tdCenter, fontWeight: "bold" }}>{env.temp ?? "—"}</td>
              </>}
              {(envFields.humidity || env.humidity !== undefined) && <>
                <td style={s.td}>Влажность воздуха, %</td>
                <td style={{ ...s.tdCenter, fontWeight: "bold" }}>{env.humidity ?? "—"}</td>
              </>}
              {(envFields.pressure || env.pressure !== undefined) && <>
                <td style={s.td}>Атмосферное давление, мм рт. ст.</td>
                <td style={{ ...s.tdCenter, fontWeight: "bold" }}>{env.pressure ?? "—"}</td>
              </>}
              {prot.voltage_test && <>
                <td style={s.td}>Испытательное напряжение, кВ</td>
                <td style={{ ...s.tdCenter, fontWeight: "bold" }}>{prot.voltage_test}</td>
              </>}
            </tr>
          </tbody>
        </table>
      )}

      {/* ── Таблица результатов ── */}
      <div style={s.sectionTitle}>Результаты измерений</div>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={{ ...s.th, width: 30 }}>№</th>
            {(prot.mode === "tm_list" || prot.mode === "equip_list") && <th style={s.th}>{prot.mode==="equip_list" ? "Единица оборудования" : "ТМ / Объект"}</th>}
            <th style={s.th}>Параметр</th>
            <th style={{ ...s.th, width: 60 }}>Ед. изм.</th>
            <th style={{ ...s.th, width: 80 }}>Норматив</th>
            <th style={{ ...s.th, width: 80 }}>Факт. знач.</th>
            <th style={{ ...s.th, width: 100 }}>Статус / Заключение</th>
            {allRows.some(r => r.note) && <th style={s.th}>Примечание</th>}
          </tr>
        </thead>
        <tbody>
          {allRows.map((row, i) => {
            const status = getEffectiveStatus(row);
            const normStr = row.zones?.length
              ? row.zones.map(z => {
                  const lo = z.min !== null ? `${z.min_inc ? "≥" : ">"}${z.min}` : "";
                  const hi = z.max !== null ? `${z.max_inc ? "≤" : "<"}${z.max}` : "";
                  return [lo, hi].filter(Boolean).join(", ") || z.label;
                }).join(" / ")
              : "—";
            const statusColor =
              status.color === "success"    ? "#006400" :
              status.color === "error"      ? "#8B0000" :
              status.color === "warning"    ? "#7B6000" :
              status.color === "processing" ? "#00008B" : "#333";
            return (
              <tr key={row.id}>
                <td style={s.tdCenter}>{i + 1}</td>
                {prot.mode === "tm_list" && <td style={s.td}>{row.tm_name}</td>}
                <td style={s.td}>{row.param_name}</td>
                <td style={s.tdCenter}>{row.unit}</td>
                <td style={s.tdCenter}>{normStr}</td>
                <td style={{ ...s.tdCenter, fontWeight: "bold" }}>
                  {row.fact !== null && row.fact !== undefined && row.fact !== "" ? row.fact : "—"}
                </td>
                <td style={{ ...s.tdCenter, color: statusColor, fontWeight: "bold" }}>
                  {status.label}
                </td>
                {allRows.some(r => r.note) && (
                  <td style={s.td}>{row.note || ""}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ── Таблица приборов ── */}
      {usedInstruments.length > 0 && (
        <>
          <div style={s.sectionTitle}>Измерения проведены приборами</div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={{ ...s.th, width: 30 }}>№</th>
                <th style={s.th}>Тип</th>
                <th style={s.th}>Заводской номер</th>
                <th style={s.th}>Диапазон измерения</th>
                <th style={{ ...s.th, width: 60 }}>Класс точности</th>
                <th style={s.th}>Дата поверки (последняя)</th>
                <th style={s.th}>Дата поверки (очередная)</th>
                <th style={s.th}>№ аттестата</th>
                <th style={s.th}>Орган поверки</th>
              </tr>
            </thead>
            <tbody>
              {usedInstruments.map((ins, i) => (
                <tr key={ins.id}>
                  <td style={s.tdCenter}>{i + 1}</td>
                  <td style={s.td}>{ins.name}</td>
                  <td style={s.tdCenter}>{ins.serial}</td>
                  <td style={s.tdCenter}>{ins.range || "—"}</td>
                  <td style={s.tdCenter}>{ins.accuracy || "—"}</td>
                  <td style={s.tdCenter}>{ins.date_calibrated || "—"}</td>
                  <td style={s.tdCenter}>{ins.date_next_cal || "—"}</td>
                  <td style={s.td}>{ins.cert_num || "—"}</td>
                  <td style={s.td}>{ins.cert_org || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ── Заключение ── */}
      <div style={s.conclusionRow}>
        <span style={s.conclusionLabel}>Заключение:</span>
        <span style={s.conclusionVal}>
          {prot.conclusion_type
            ? `${prot.conclusion_type}. ${prot.conclusion_text || ""}`.trim()
            : prot.conclusion_text || "___________________________________________"}
        </span>
      </div>

      {/* ── Подписи ── */}
      <div style={{ marginTop: 16, fontSize: 10 }}>
        <div style={{ fontStyle: "italic", marginBottom: 4 }}>Испытания провели:</div>
        <table style={{ ...s.sigTable }}>
          <colgroup>
            <col style={{ width: "35%" }}/>
            <col style={{ width: "20%" }}/>
            <col style={{ width: "45%" }}/>
          </colgroup>
          <tbody>
            {executors.map((e, i) => (
              <tr key={e.id}>
                <td style={{ ...s.sigLabel, borderBottom: i === executors.length - 1 && !reviewer ? "none" : "1px solid #000" }}>
                  {e.position}
                </td>
                <td style={{ ...s.sigLabel, textAlign: "center" }}>________________</td>
                <td style={{ ...s.sigLabel }}>{e.name}</td>
              </tr>
            ))}
            {executors.length === 0 && (
              <tr>
                <td style={s.sigLabel}>Должность</td>
                <td style={{ ...s.sigLabel, textAlign: "center" }}>________________</td>
                <td style={s.sigLabel}>Ф.И.О.</td>
              </tr>
            )}
          </tbody>
        </table>

        {reviewer && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontStyle: "italic", marginBottom: 4 }}>Протокол проверил:</div>
            <table style={s.sigTable}>
              <colgroup>
                <col style={{ width: "35%" }}/>
                <col style={{ width: "20%" }}/>
                <col style={{ width: "45%" }}/>
              </colgroup>
              <tbody>
                <tr>
                  <td style={s.sigLabel}>{reviewer.position}</td>
                  <td style={{ ...s.sigLabel, textAlign: "center" }}>________________</td>
                  <td style={s.sigLabel}>{reviewer.name}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Подсказка под подписями */}
        <table style={{ width: "100%", marginTop: 2, borderCollapse: "collapse" }}>
          <colgroup>
            <col style={{ width: "35%" }}/>
            <col style={{ width: "20%" }}/>
            <col style={{ width: "45%" }}/>
          </colgroup>
          <tbody>
            <tr>
              <td style={s.sigHint}>Должность</td>
              <td style={s.sigHint}>подпись</td>
              <td style={s.sigHint}>Ф.И.О.</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span>
          <FileProtectOutlined style={{ marginRight: 8, color: "#1a5fa8" }}/>
          Превью протокола {prot.number}
        </span>
      }
      width={900}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#888" }}>
            Данные актуальны на момент открытия превью
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <Button onClick={onClose}>Закрыть</Button>
            <Button type="primary" icon={<PrinterOutlined/>} onClick={handlePrint}>
              Печать
            </Button>
          </div>
        </div>
      }
      styles={{ body: { padding: 0, maxHeight: "75vh", overflowY: "auto", background: "#e8e8e8" } }}
    >
      <div style={{ padding: 16 }}>
        <PreviewBody/>
      </div>
    </Modal>
  );
}
