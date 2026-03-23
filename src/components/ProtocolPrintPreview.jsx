import { OBJECTS, EMPLOYEES, LABS, DEPT_FLAT, empName, deptLabel } from "../data/mockData";
import { getEffectiveStatus } from "../utils/helpers";

// Стили — всё inline, чтобы корректно рендерилось в модале
const S = {
  page: {
    fontFamily: "Arial, sans-serif",
    fontSize: 11,
    color: "#000",
    padding: "24px 32px",
    background: "#fff",
    lineHeight: 1.4,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 4,
    fontSize: 11,
  },
  headerLeft: { flex: 1 },
  headerRight: { flex: 1, textAlign: "right" },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 13,
    margin: "10px 0 2px",
    letterSpacing: 0.5,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
  },
  row2col: {
    display: "flex",
    gap: 8,
    marginBottom: 3,
    fontSize: 11,
  },
  label: { color: "#000", minWidth: 220 },
  value: { fontWeight: "bold", flex: 1 },
  divider: {
    borderTop: "1px solid #000",
    margin: "8px 0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 10,
    marginTop: 6,
    marginBottom: 8,
  },
  th: {
    border: "1px solid #000",
    padding: "4px 5px",
    background: "#f0f0f0",
    fontWeight: "bold",
    textAlign: "center",
    verticalAlign: "middle",
  },
  td: {
    border: "1px solid #000",
    padding: "4px 5px",
    verticalAlign: "middle",
  },
  tdCenter: {
    border: "1px solid #000",
    padding: "4px 5px",
    textAlign: "center",
    verticalAlign: "middle",
  },
  conclusion: {
    marginTop: 8,
    marginBottom: 6,
  },
  signRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 4,
    fontSize: 11,
  },
  signLabel: { minWidth: 130 },
  signCell: {
    flex: 1,
    borderBottom: "1px solid #000",
    minWidth: 130,
    textAlign: "center",
    paddingBottom: 1,
  },
  signHint: {
    textAlign: "center",
    fontSize: 9,
    color: "#555",
    flex: 1,
    minWidth: 130,
  },
};

function statusToConclusion(status) {
  if (!status) return "";
  if (status.color === "success" || status.label === "Норма") return "Годно";
  if (status.color === "error") return "Не годно";
  if (status.color === "warning") return "Требует контроля";
  return status.label || "";
}

export default function ProtocolPrintPreview({ prot, workTypes, instruments }) {
  const obj    = OBJECTS.find(o => o.id === prot.object_id);
  const wt     = workTypes.find(w => w.id === prot.work_type_id);
  const lab    = LABS.find(l => l.id === prot.lab_id);
  const dept   = deptLabel(prot.dept_id);

  // Исполнители
  const executors = (prot.executor_ids || []).map(id => {
    const e = EMPLOYEES.find(x => x.id === id);
    return e ? { name: e.name, position: e.position } : { name: id, position: "" };
  });
  const reviewer = prot.reviewer_id
    ? EMPLOYEES.find(x => x.id === prot.reviewer_id)
    : null;

  // Приборы
  const usedInstruments = (prot.instrument_ids || [])
    .map(id => instruments.find(x => x.id === id))
    .filter(Boolean);

  // Строки измерений
  const allRows = prot.mode === "tm_list"
    ? (prot.tm_groups || []).flatMap(g =>
        g.rows.map(r => ({ ...r, tm_name: g.tm_name }))
      )
    : (prot.rows || []).map(r => ({ ...r, tm_name: null }));

  // Условия среды
  const env = prot.env || {};
  const envFields = wt?.env_fields || {};

  return (
    <div style={S.page}>

      {/* ── Шапка ─────────────────────────────────────────────────── */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          <div>{lab?.name || "Электротехническая лаборатория"}</div>
          <div>Свидетельство о регистрации {lab?.cert || "—"}</div>
          <div>Действительно до {lab?.exp || "—"}</div>
        </div>
        <div style={S.headerRight}>
          <div>Заказчик: {dept}</div>
          <div>Объект: {obj?.name || "—"}</div>
          <div>Дата проведения измерений: {prot.date_measured || "—"}</div>
        </div>
      </div>

      <div style={S.divider}/>

      {/* ── Номер и название ──────────────────────────────────────── */}
      <div style={S.title}>ПРОТОКОЛ № {prot.number}</div>
      <div style={S.subtitle}>{wt?.name || "—"}</div>

      {/* ── Реквизиты ─────────────────────────────────────────────── */}
      <div style={S.row2col}>
        <span style={S.label}>Цель измерений (испытаний):</span>
        <span style={S.value}>{prot.test_type}</span>
      </div>
      <div style={S.row2col}>
        <span style={S.label}>Нормативные документы:</span>
        <span style={S.value}>{wt?.norm_doc || "—"}</span>
      </div>

      {/* ── Условия измерений ─────────────────────────────────────── */}
      {(envFields.temp || envFields.humidity || envFields.pressure) && (
        <>
          {envFields.temp && (
            <div style={S.row2col}>
              <span style={S.label}>Температура воздуха, °C:</span>
              <span style={S.value}>{env.temp ?? "—"}</span>
            </div>
          )}
          {envFields.humidity && (
            <div style={S.row2col}>
              <span style={S.label}>Влажность воздуха, %:</span>
              <span style={S.value}>{env.humidity ?? "—"}</span>
            </div>
          )}
          {envFields.pressure && (
            <div style={S.row2col}>
              <span style={S.label}>Атмосферное давление, мм рт. ст.:</span>
              <span style={S.value}>{env.pressure ?? "—"}</span>
            </div>
          )}
        </>
      )}

      <div style={S.divider}/>

      {/* ── Таблица результатов ───────────────────────────────────── */}
      <div style={{ fontWeight: "bold", marginBottom: 4 }}>Результаты измерений:</div>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={{ ...S.th, width: 30 }}>№</th>
            {prot.mode === "tm_list" && <th style={S.th}>Техническое место</th>}
            <th style={S.th}>Параметр</th>
            <th style={{ ...S.th, width: 60 }}>Ед. изм.</th>
            <th style={{ ...S.th, width: 80 }}>Норматив</th>
            <th style={{ ...S.th, width: 80 }}>Факт. значение</th>
            <th style={{ ...S.th, width: 80 }}>Заключение</th>
          </tr>
        </thead>
        <tbody>
          {allRows.length === 0 ? (
            <tr><td colSpan={7} style={{ ...S.tdCenter, color:"#888" }}>Нет данных</td></tr>
          ) : allRows.map((r, i) => {
            const s = getEffectiveStatus(r);
            // Нормативное значение — берём последний диапазон "Норма" как ориентир
            const normZone = r.zones?.find(z => z.color === "success");
            const normStr  = normZone
              ? [
                  normZone.min !== null ? `${normZone.min_inc ? "≥" : ">"}${normZone.min}` : "",
                  normZone.max !== null ? `${normZone.max_inc ? "≤" : "<"}${normZone.max}` : "",
                ].filter(Boolean).join(" ") || "—"
              : "—";
            const concl = s.system && s.label === "Не измерено"
              ? "—"
              : s.system && s.label === "Не определено"
              ? "—"
              : statusToConclusion(s);

            return (
              <tr key={r.id}>
                <td style={S.tdCenter}>{i + 1}</td>
                {prot.mode === "tm_list" && <td style={S.td}>{r.tm_name}</td>}
                <td style={S.td}>{r.param_name}</td>
                <td style={S.tdCenter}>{r.unit}</td>
                <td style={S.tdCenter}>{normStr}</td>
                <td style={{ ...S.tdCenter, fontWeight: "bold" }}>
                  {r.fact !== null && r.fact !== undefined ? r.fact : "—"}
                </td>
                <td style={{
                  ...S.tdCenter,
                  fontWeight: "bold",
                  color: s.color === "error" ? "#c00" : s.color === "warning" ? "#b8860b" : "#000",
                }}>
                  {concl}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ── Приборы ───────────────────────────────────────────────── */}
      {usedInstruments.length > 0 && (
        <>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>Измерения проведены приборами:</div>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{ ...S.th, width: 30 }}>№</th>
                <th style={S.th}>Тип</th>
                <th style={S.th}>Заводской номер</th>
                <th style={S.th}>Диапазон измерения</th>
                <th style={S.th}>Класс точности</th>
                <th style={S.th}>Дата поверки (посл.)</th>
                <th style={S.th}>Дата поверки (очеред.)</th>
                <th style={S.th}>№ аттестата</th>
                <th style={S.th}>Орган поверки</th>
              </tr>
            </thead>
            <tbody>
              {usedInstruments.map((ins, i) => (
                <tr key={ins.id}>
                  <td style={S.tdCenter}>{i + 1}</td>
                  <td style={S.td}>{ins.name}</td>
                  <td style={S.tdCenter}>{ins.serial}</td>
                  <td style={S.tdCenter}>{ins.range || "—"}</td>
                  <td style={S.tdCenter}>{ins.accuracy || "—"}</td>
                  <td style={S.tdCenter}>{ins.date_calibrated || "—"}</td>
                  <td style={S.tdCenter}>{ins.date_next_cal || "—"}</td>
                  <td style={S.tdCenter}>{ins.cert_num || "—"}</td>
                  <td style={S.td}>{ins.cert_org || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* ── Заключение ────────────────────────────────────────────── */}
      <div style={S.conclusion}>
        <span style={{ fontWeight: "bold" }}>Заключение: </span>
        {prot.conclusion_type
          ? <span>{prot.conclusion_type}{prot.conclusion_text ? `. ${prot.conclusion_text}` : "."}</span>
          : <span style={{ color: "#888" }}>Протокол не подписан</span>
        }
      </div>

      <div style={S.divider}/>

      {/* ── Подписи исполнителей ──────────────────────────────────── */}
      <div style={{ fontWeight: "bold", marginBottom: 6 }}>Испытания провели:</div>
      {executors.length === 0 ? (
        <div style={{ color: "#888", marginBottom: 8 }}>Не указаны</div>
      ) : executors.map((e, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={S.signRow}>
            <span style={S.signLabel}>{i === 0 ? "" : ""}</span>
            <span style={S.signCell}>{e.position}</span>
            <span style={S.signCell}>{/* подпись */}</span>
            <span style={S.signCell}>{e.name}</span>
          </div>
          <div style={{ ...S.signRow, marginTop: -2 }}>
            <span style={S.signLabel}></span>
            <span style={S.signHint}>Должность</span>
            <span style={S.signHint}>Подпись</span>
            <span style={S.signHint}>Ф.И.О.</span>
          </div>
        </div>
      ))}

      {/* ── Подпись проверяющего ──────────────────────────────────── */}
      <div style={{ fontWeight: "bold", marginBottom: 6 }}>Протокол проверил:</div>
      <div style={{ marginBottom: 10 }}>
        <div style={S.signRow}>
          <span style={S.signLabel}></span>
          <span style={S.signCell}>{reviewer?.position || ""}</span>
          <span style={S.signCell}>{/* подпись */}</span>
          <span style={S.signCell}>{reviewer?.name || ""}</span>
        </div>
        <div style={{ ...S.signRow, marginTop: -2 }}>
          <span style={S.signLabel}></span>
          <span style={S.signHint}>Должность</span>
          <span style={S.signHint}>Подпись</span>
          <span style={S.signHint}>Ф.И.О.</span>
        </div>
      </div>

    </div>
  );
}
