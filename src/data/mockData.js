// ─── Типы ТМЦ ────────────────────────────────────────────────────────────────
export const EQUIP_TYPES = [
  { id: "et1", name: "Трансформатор тока" },
  { id: "et2", name: "Силовой трансформатор" },
  { id: "et3", name: "Вакуумный выключатель" },
  { id: "et4", name: "Опора ВЛ (деревянная)" },
];

// ─── Номенклатуры ─────────────────────────────────────────────────────────────
export const NOMENCLATURES = [
  { id: "nm1", name: "ТФЗМ-110 кВ исп.У1", type_id: "et1", accepted: true },
  { id: "nm2", name: "ТФЗМ-35 кВ исп.У1",  type_id: "et1", accepted: false },
  { id: "nm3", name: "ТМН-6300/110",         type_id: "et2", accepted: true },
  { id: "nm4", name: "ТМ-400/10",             type_id: "et2", accepted: false },
  { id: "nm5", name: "BB/TEL-10-20/1000",    type_id: "et3", accepted: true },
  { id: "nm6", name: "ВЛ опора СВ110-3.5",   type_id: "et4", accepted: false },
];

// ─── Параметры измерений ──────────────────────────────────────────────────────
export const PARAMS = [
  { id: "pr1", name: "Сопр. изоляции (основная)", unit: "МОм",  compare: "min" },
  { id: "pr2", name: "tgδ основной изоляции",     unit: "%",    compare: "max" },
  { id: "pr3", name: "Сопр. контура заземления",  unit: "Ом",   compare: "max" },
  { id: "pr4", name: "Ток утечки",                unit: "мА",   compare: "max" },
  { id: "pr5", name: "Напряжение испытания",       unit: "кВ",   compare: "exact" },
  { id: "pr6", name: "Сопр. обмотки пост. току",  unit: "мОм",  compare: "range" },
];

// ─── Виды работ ───────────────────────────────────────────────────────────────
// env_fields: { temp, humidity, pressure } — какие поля среды включены
export const WORK_TYPES = [
  { id: "wt1", name: "Измерение сопр. изоляции и tgδ", type: "Эксплуатационные",
    norm_doc: "ПТЭЭП Прил.3, СТО 34.01-23.1-001-2017 п.10",
    env_fields: { temp: true, humidity: true, pressure: false },
    params: [ { param_id: "pr1", order: 1 }, { param_id: "pr2", order: 2 } ] },
  { id: "wt2", name: "Испытание повышенным напряжением", type: "Эксплуатационные",
    norm_doc: "ПУЭ гл.1.8, СТО табл.9.1",
    env_fields: { temp: true, humidity: true, pressure: true },
    params: [ { param_id: "pr5", order: 1 }, { param_id: "pr4", order: 2 } ] },
  { id: "wt3", name: "Измерение сопр. контура заземления", type: "Эксплуатационные",
    norm_doc: "ПУЭ п.1.7.101",
    env_fields: { temp: true, humidity: false, pressure: false },
    params: [ { param_id: "pr3", order: 1 } ] },
  { id: "wt4", name: "Приёмо-сдаточные испытания ТТ", type: "Приёмо-сдаточные",
    norm_doc: "ПТЭЭП Прил.3",
    env_fields: { temp: true, humidity: true, pressure: false },
    params: [ { param_id: "pr1", order: 1 }, { param_id: "pr2", order: 2 }, { param_id: "pr6", order: 3 } ] },
];

// ─── ЭТЛ ─────────────────────────────────────────────────────────────────────
export const LABS = [
  { id: "lab1", name: "ЭТЛ филиала АЭ",   type: "Собственная", cert: "№ЭТЛ-2024-0047", exp: "2026-12-31" },
  { id: "lab2", name: "ЭТЛ филиала АКЭ",  type: "Собственная", cert: "№ЭТЛ-2024-0051", exp: "2025-06-30" },
  { id: "lab3", name: 'ООО "ЭнергоТест"', type: "Подрядная",   cert: "№ЭТЛ-2023-0189", exp: "2027-03-15" },
];

// ─── Подразделения ────────────────────────────────────────────────────────────
export const DEPARTMENTS_TREE = [
  { id: "f1", name: "Филиал Алейские МЭС", children: [
    { id: "f1d1", name: "Алейский РЭС" },
    { id: "f1d2", name: "Калманский участок" },
    { id: "f1d3", name: "Мамонтовский участок" },
    { id: "f1d4", name: "Ребрихинский участок" },
    { id: "f1d5", name: "Романовский участок" },
    { id: "f1d6", name: "Топчихинский участок" },
  ]},
  { id: "f2", name: "Филиал Белокурихинские МЭС", children: [
    { id: "f2d1", name: "Алтайский участок" },
    { id: "f2d2", name: "Белокурихинский участок" },
    { id: "f2d3", name: "Быстроистокский участок" },
    { id: "f2d4", name: "Советский участок" },
  ]},
  { id: "f3", name: "Филиал Бийские МЭС", children: [
    { id: "f3d1", name: "Акутихинский участок" },
    { id: "f3d2", name: "Ельцовский участок" },
    { id: "f3d3", name: "Зональный участок" },
    { id: "f3d4", name: "Красногорский участок" },
  ]},
  { id: "f4", name: "Филиал Каменские МЭС", children: [
    { id: "f4d1", name: "Баевский участок" },
    { id: "f4d2", name: "Каменский РЭС" },
    { id: "f4d3", name: "Крутихинский участок" },
    { id: "f4d4", name: "Тюменцевский участок" },
  ]},
  { id: "f5", name: "Филиал Новоалтайские МЭС", children: [
    { id: "f5d1", name: "Косихинский РЭС" },
    { id: "f5d2", name: "Новоалтайский РЭС" },
    { id: "f5d3", name: "Тальменский участок" },
    { id: "f5d4", name: "Троицкий РЭС" },
  ]},
  { id: "f6", name: "Филиал Рубцовские МЭС", children: [
    { id: "f6d1", name: "Волчихинский участок" },
    { id: "f6d2", name: "Рубцовский РЭС" },
    { id: "f6d3", name: "Шипуновский участок" },
    { id: "f6d4", name: "Угловский участок" },
  ]},
  { id: "f7", name: "Филиал Славгородские МЭС", children: [
    { id: "f7d1", name: "Бурлинский участок" },
    { id: "f7d2", name: "Гальбштадтский участок" },
    { id: "f7d3", name: "Славгородский участок" },
    { id: "f7d4", name: "Хабарский участок" },
  ]},
];

export const DEPT_FLAT = DEPARTMENTS_TREE.flatMap(b => [
  { id: b.id, name: b.name, level: "branch" },
  ...b.children.map(d => ({ id: d.id, name: d.name, level: "dept", branchName: b.name }))
]);

export const deptLabel = id => {
  const d = DEPT_FLAT.find(x => x.id === id);
  if (!d) return id || "—";
  return d.level === "dept" ? `${d.branchName} / ${d.name}` : d.name;
};

export const DEPT_TREE_DATA = DEPARTMENTS_TREE.map(b => ({
  value: b.id, title: b.name,
  children: b.children.map(d => ({ value: d.id, title: d.name }))
}));

// ─── Сотрудники (из существующего справочника системы) ───────────────────────
export const EMPLOYEES = [
  { id: "em1", name: "Соколов Александр Николаевич",   position: "Начальник ЭТЛ", group: "V",   lab_id: "lab1" },
  { id: "em2", name: "Петров Иван Васильевич",          position: "Инженер ЭТЛ",   group: "IV",  lab_id: "lab1" },
  { id: "em3", name: "Иванова Мария Сергеевна",         position: "Инженер ЭТЛ",   group: "IV",  lab_id: "lab1" },
  { id: "em4", name: "Сидоров Владимир Петрович",       position: "Электромонтёр", group: "III", lab_id: "lab1" },
  { id: "em5", name: "Кузнецов Дмитрий Алексеевич",    position: "Инженер ЭТЛ",   group: "IV",  lab_id: "lab2" },
  { id: "em6", name: "Морозова Елена Игоревна",         position: "Начальник ЭТЛ", group: "V",   lab_id: "lab2" },
  { id: "em7", name: "Козлов Сергей Владимирович",      position: "Электромонтёр", group: "III", lab_id: "lab2" },
];

export const empName = id => EMPLOYEES.find(e => e.id === id)?.name || id || "—";
export const empNames = ids => (ids || []).map(empName).join(", ") || "—";

// ─── Реестр измерительных приборов ───────────────────────────────────────────
export const INIT_INSTRUMENTS = [
  { id: "ins1", name: "Мегаомметр ЭСО202/2-Г",            serial: "2019-11482",
    range: "100 МОм – 10 ГОм", accuracy: "1.0", lab_id: "lab1",
    date_calibrated: "2025-03-01", date_next_cal: "2026-03-01",
    cert_num: "№С-АЛТ-2025-0341", cert_org: "ФБУ «Алтайский ЦСМ»", archived: false },
  { id: "ins2", name: "Мегаомметр ЭСО202/2-Г",            serial: "2020-08834",
    range: "100 МОм – 10 ГОм", accuracy: "1.0", lab_id: "lab1",
    date_calibrated: "2024-09-15", date_next_cal: "2025-09-15",
    cert_num: "№С-АЛТ-2024-0892", cert_org: "ФБУ «Алтайский ЦСМ»", archived: false },
  { id: "ins3", name: "Измеритель сопр. заземления М-416", serial: "2018-03317",
    range: "0.1 – 1000 Ом",  accuracy: "1.5", lab_id: "lab1",
    date_calibrated: "2025-11-10", date_next_cal: "2026-11-10",
    cert_num: "№С-АЛТ-2025-1104", cert_org: "ФБУ «Алтайский ЦСМ»", archived: false },
  { id: "ins4", name: "Комбинированный прибор Fluke 1587", serial: "2021-55219",
    range: "до 1 ТОм", accuracy: "0.5", lab_id: "lab2",
    date_calibrated: "2025-06-20", date_next_cal: "2026-06-20",
    cert_num: "№С-АЛТ-2025-0678", cert_org: "ФБУ «Алтайский ЦСМ»", archived: false },
  { id: "ins5", name: "Установка высоковольтная АИД-70",   serial: "2017-00142",
    range: "0 – 70 кВ", accuracy: "2.5", lab_id: "lab1",
    date_calibrated: "2023-04-01", date_next_cal: "2024-04-01",
    cert_num: "№С-АЛТ-2023-0211", cert_org: "ФБУ «Алтайский ЦСМ»", archived: false },
];

// ─── Нормативные диапазоны (вкладка 2) ───────────────────────────────────────
export const INIT_NORM_RANGES = [
  { id: "nr1", type_id: "et1", param_id: "pr1", work_type_id: "wt1",
    source: "СТО 34.01-23.1-001-2017 табл.10.1.1",
    zones: [
      { id: "z1", label: "Норма",                min: 1000, min_inc: true,  max: null, max_inc: false, color: "success" },
      { id: "z2", label: "Область риска",        min: 500,  min_inc: true,  max: 1000, max_inc: false, color: "warning" },
      { id: "z3", label: "Предельное состояние", min: null, min_inc: false, max: 500,  max_inc: false, color: "error"   },
    ]},
  { id: "nr2", type_id: "et1", param_id: "pr2", work_type_id: "wt1",
    source: "СТО 34.01-23.1-001-2017 табл.10.1.2",
    zones: [
      { id: "z4", label: "Норма (ввод в экспл.)",    min: null, min_inc: false, max: 2.5, max_inc: true, color: "success" },
      { id: "z5", label: "Допустимо (эксплуатация)", min: 2.5,  min_inc: false, max: 8.0, max_inc: true, color: "warning" },
      { id: "z6", label: "Предельное состояние",     min: 8.0,  min_inc: false, max: null, max_inc: false, color: "error"  },
    ]},
  { id: "nr3", type_id: "et4", param_id: "pr3", work_type_id: "wt3",
    source: "ПУЭ п.1.7.101",
    zones: [
      { id: "z7", label: "Норма",      min: null, min_inc: false, max: 4.0, max_inc: true,  color: "success" },
      { id: "z8", label: "Отклонение", min: 4.0,  min_inc: false, max: null, max_inc: false, color: "error"   },
    ]},
];

// ─── Паспортные нормативы (вкладка 3) ────────────────────────────────────────
export const INIT_PASSPORT_NORMS = [
  { id: "pn1", param_id: "pr1", source: "СТО табл.10.1.1 · заводской протокол",
    nomenclature_ids: ["nm1"],
    zones: [
      { id: "pz1", label: "Норма",                min: 3000, min_inc: true,  max: null, max_inc: false, color: "success" },
      { id: "pz2", label: "Область риска",        min: 1500, min_inc: true,  max: 3000, max_inc: false, color: "warning" },
      { id: "pz3", label: "Предельное состояние", min: null, min_inc: false, max: 1500, max_inc: false, color: "error"   },
    ]},
];

// ─── Переопределения (вкладка 4) ──────────────────────────────────────────────
export const INIT_OVERRIDES = [
  { id: "ov1", bind_type: "nomenclature", bind_id: "nm2", param_id: "pr1",
    action_type: "permanent", active: true,
    reason: "Партия ТФЗМ-35 кВ 2015 г.в. — пониженное качество изоляции. Норма ужесточена. Распоряжение ГИ №47 от 12.01.2026.",
    author: "em1", created: "2026-01-15",
    zones: [
      { id: "oz1", label: "Норма",       min: 2000, min_inc: true,  max: null, max_inc: false, color: "success" },
      { id: "oz2", label: "Риск",        min: 1000, min_inc: true,  max: 2000, max_inc: false, color: "warning" },
      { id: "oz3", label: "Недопустимо", min: null, min_inc: false, max: 1000, max_inc: false, color: "error"   },
    ]},
];

// ─── Объекты ──────────────────────────────────────────────────────────────────
export const OBJECTS = [
  { id: "o1", name: "ПС 110/10 кВ «Северная»",       type: "Подстанция" },
  { id: "o2", name: "ВЛ 10 кВ «Лесная» (фидер №3)", type: "Воздушная линия" },
  { id: "o3", name: "ТП-241 «Завод»",                type: "ТП" },
];

// Добавляем тип для ОПН/разрядников
export const EQUIP_ON_OBJECTS = {
  o1: [
    { id: "eq1", name: "ТФЗМ-110 ячейка №1",  serial: "Зав.№2019-4471", nm_id: "nm1", type_id: "et1" },
    { id: "eq2", name: "ТФЗМ-110 ячейка №2",  serial: "Зав.№2019-4472", nm_id: "nm1", type_id: "et1" },
    { id: "eq3", name: "ТМН-6300/110 осн.",    serial: "Зав.№2015-0983", nm_id: "nm3", type_id: "et2" },
    { id: "eq5", name: "ОПН-1-10/12 фаза A",  serial: "806608",          nm_id: "nm5", type_id: "et3" },
    { id: "eq6", name: "ОПН-1-10/12 фаза B",  serial: "806611",          nm_id: "nm5", type_id: "et3" },
    { id: "eq7", name: "ОПН-1-10/12 фаза C",  serial: "806610",          nm_id: "nm5", type_id: "et3" },
  ],
  o2: [],
  o3: [{ id: "eq4", name: "ТМ-400/10", serial: "Зав.№2011-1122", nm_id: "nm4", type_id: "et2" }],
};

export const TM_ON_OBJECTS = {
  o2: [
    { id: "tm1", name: "Опора №1 (анкерная)" },
    { id: "tm2", name: "Опора №2" },
    { id: "tm3", name: "Опора №3" },
    { id: "tm4", name: "Пролёт №1-2" },
  ],
  o1: [{ id: "tm5", name: "Ячейка №1" }, { id: "tm6", name: "Ячейка №2" }],
  o3: [{ id: "tm7", name: "Основной трансформатор" }],
};

// ─── Начальные протоколы ──────────────────────────────────────────────────────
const NR1_ZONES = [
  { id: "z1", label: "Норма",                min: 3000, min_inc: true,  max: null, max_inc: false, color: "success" },
  { id: "z2", label: "Область риска",        min: 1500, min_inc: true,  max: 3000, max_inc: false, color: "warning" },
  { id: "z3", label: "Предельное состояние", min: null, min_inc: false, max: 1500, max_inc: false, color: "error"   },
];
const NR2_ZONES = [
  { id: "z4", label: "Норма (ввод в экспл.)",    min: null, min_inc: false, max: 2.5, max_inc: true, color: "success" },
  { id: "z5", label: "Допустимо (эксплуатация)", min: 2.5,  min_inc: false, max: 8.0, max_inc: true, color: "warning" },
  { id: "z6", label: "Предельное состояние",     min: 8.0,  min_inc: false, max: null, max_inc: false, color: "error"  },
];

const mkRow = (id, param_id, zones, fact = null, note = "") => {
  const param = PARAMS.find(p => p.id === param_id);
  return { id, param_id, param_name: param.name, unit: param.unit, zones,
    norm_source: "", fact, note, auto_status: null, manual_status: null, manual_reason: "", is_overridden: false };
};

export const INIT_PROTOCOLS = [
  { id: "p1", number: "ПИМ-2026-00001", date_created: "2026-03-10", date_measured: "2026-03-10",
    object_id: "o1", work_type_id: "wt1", test_type: "Эксплуатационные",
    lab_id: "lab1", dept_id: "f1d1",
    executor_ids: ["em2"], reviewer_id: "em1", instrument_ids: ["ins1"],
    mode: "equipment", equip_id: "eq1",
    env: { temp: 12, humidity: 65 }, voltage_test: null,
    status: "Подписан", date_signed: "2026-03-12", signed_by: "em1",
    conclusion_type: "Соответствует НТД", conclusion_text: "Изоляция в норме.", cancel_reason: null, defects: [],
    rows: [
      { ...mkRow("r1","pr1",NR1_ZONES,4800,""), norm_source:"Паспортный норматив · ТФЗМ-110 кВ исп.У1" },
      { ...mkRow("r2","pr2",NR2_ZONES,1.8,""),  norm_source:"Паспортный норматив · ТФЗМ-110 кВ исп.У1" },
    ],
    history: [
      { date:"2026-03-10 09:15", user:"em2", action:"Создан (Черновик)" },
      { date:"2026-03-11 16:30", user:"em2", action:"Отправлен на проверку" },
      { date:"2026-03-12 10:05", user:"em1", action:"Подписан" },
    ]},
  { id: "p2", number: "ПИМ-2026-00002", date_created: "2026-03-15", date_measured: "2026-03-14",
    object_id: "o1", work_type_id: "wt1", test_type: "Эксплуатационные",
    lab_id: "lab1", dept_id: "f1d2",
    executor_ids: ["em3","em4"], reviewer_id: "em1", instrument_ids: ["ins1","ins2"],
    mode: "equipment", equip_id: "eq2",
    env: { temp: 8, humidity: 78 }, voltage_test: null,
    status: "На проверке", date_signed: null, signed_by: null,
    conclusion_type: null, conclusion_text: "", cancel_reason: null, defects: [],
    rows: [
      { ...mkRow("r3","pr1",NR1_ZONES,1200,""), norm_source:"Паспортный норматив · ТФЗМ-110 кВ исп.У1" },
      { ...mkRow("r4","pr2",NR2_ZONES,9.5,"Значение превысило допустимое."),
        norm_source:"Паспортный норматив · ТФЗМ-110 кВ исп.У1",
        manual_status:"Предельное состояние", manual_reason:"Подтверждено визуальным осмотром — следы перегрева.", is_overridden:true },
    ],
    history: [
      { date:"2026-03-15 08:00", user:"em3", action:"Создан (Черновик)" },
      { date:"2026-03-15 17:50", user:"em3", action:"Отправлен на проверку" },
    ]},
  { id: "p3", number: "ПИМ-2026-00003", date_created: "2026-03-18", date_measured: "2026-03-18",
    object_id: "o2", work_type_id: "wt3", test_type: "Эксплуатационные",
    lab_id: "lab1", dept_id: "f1d1",
    executor_ids: ["em4"], reviewer_id: null, instrument_ids: ["ins3"],
    mode: "tm_list", equip_id: null,
    env: { temp: 4 }, voltage_test: null,
    status: "В работе", date_signed: null, signed_by: null,
    conclusion_type: null, conclusion_text: "", cancel_reason: null, defects: [],
    tm_groups: [
      { tm_id:"tm1", tm_name:"Опора №1 (анкерная)",
        rows:[{ ...mkRow("r5","pr3",[{id:"z7",label:"Норма",min:null,min_inc:false,max:4.0,max_inc:true,color:"success"},{id:"z8",label:"Отклонение",min:4.0,min_inc:false,max:null,max_inc:false,color:"error"}],3.2,""),
          norm_source:"Норм. диапазон · Опора ВЛ (деревянная)"}]},
      { tm_id:"tm2", tm_name:"Опора №2",
        rows:[{ ...mkRow("r6","pr3",[],null,""), norm_source:"" }]},
    ],
    history:[{ date:"2026-03-18 11:00", user:"em4", action:"Создан (Черновик)" }]},
];
