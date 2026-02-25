import React, { useState } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, Space, Dropdown, Menu, Card, Row, Col, Input, TreeSelect, Collapse } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined, HomeOutlined, CheckCircleOutlined, SettingOutlined, MinusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

// Данные для выпадающих списков
const OBJECTS = [
  "ВЛ-0,4 кВ Ф.1 от ТП-28-12-5",
  "ВЛ-0,4 кВ Ф.2 от ТП-28-12-6",
  "ВЛ-0,4 кВ Ф.3 от ТП-28-12-7",
  "ВЛ-0,4 кВ Ф.4 от ТП-28-12-8",
  "ВЛ-0,4 кВ Ф.5 от ТП-28-12-9"
];

// Список оборудования для объектов
const EQUIPMENT = [
  "Опора 1",
  "Опора 2",
  "Опора 3",
  "Опора 4",
  "Опора 5",
  "Кабельная линия 1",
  "Кабельная линия 2",
  "Переходная коробка 1",
  "Переходная коробка 2"
];

// Список технических мест для объектов
const TECHNICAL_LOCATIONS = [
  "Техническое место 1",
  "Техническое место 2",
  "Техническое место 3",
  "Техническое место 4",
  "Техническое место 5",
  "Техническое место 6",
  "Техническое место 7",
  "Техническое место 8"
];

// Список всех доступных условий
const AllConditions = [
  { id: '1', name: 'Температура воздуха' },
  { id: '2', name: 'Влажность воздуха' },
  { id: '3', name: 'Атмосферное давление' },
  { id: '4', name: 'Уровень шума' },
  { id: '5', name: 'Освещенность' }
];

// Список всех доступных характеристик
const AllCharacteristics = [
  { id: '1', name: 'Сопротивление заземляющего контура' },
  { id: '2', name: 'Площадь контактной поверхности' },
  { id: '3', name: 'Сопротивление изоляции фазы А' },
  { id: '4', name: 'Сопротивление изоляции фазы В' },
  { id: '5', name: 'Сопротивление изоляции фазы С' },
  { id: '6', name: 'Уровень загнивания' },
  { id: '7', name: 'Диаметр ствола' },
  { id: '8', name: 'Высота опоры' },
  { id: '9', name: 'Ток срабатывания АВ' },
  { id: '10', name: 'Время срабатывания АВ' },
  { id: '11', name: 'Напряжение утечки' },
  { id: '12', name: 'Индуктивность обмоток' },
  { id: '13', name: 'Кондуктивность изоляции' },
  { id: '14', name: 'Угол замыкания' },
  { id: '15', name: 'Степень повреждения изоляции' }
];

// Структура данных для работ
const WorkTypes = [
  {
    key: '1',
    name: 'Измерение сопротивления заземляющего контура',
    description: 'Измерение сопротивления заземляющего контура на подстанциях и линиях',
    conditions: [
      { id: '1', name: 'Температура воздуха' },
      { id: '2', name: 'Влажность воздуха' },
      { id: '3', name: 'Атмосферное давление' }
    ],
    blocks: [
      {
        id: '1',
        name: 'Измерения заземления',
        characteristics: [
          { id: '1', name: 'Сопротивление заземляющего контура' },
          { id: '2', name: 'Площадь контактной поверхности' }
        ]
      },
      {
        id: '2',
        name: 'Измерения изоляции',
        characteristics: [
          { id: '3', name: 'Сопротивление изоляции фазы А' },
          { id: '4', name: 'Сопротивление изоляции фазы В' },
          { id: '5', name: 'Сопротивление изоляции фазы С' }
        ]
      }
    ],
    measurementType: 'single' // 'single' для единичного оборудования, 'multiple' для нескольких технических мест
  },
  {
    key: '2',
    name: 'Замеры загнивания деревянных опор',
    description: 'Замеры уровня загнивания деревянных опор воздушных линий',
    conditions: [
      { id: '1', name: 'Температура воздуха' },
      { id: '2', name: 'Влажность воздуха' }
    ],
    blocks: [
      {
        id: '1',
        name: 'Опорный блок',
        characteristics: [
          { id: '6', name: 'Уровень загнивания' },
          { id: '7', name: 'Диаметр ствола' },
          { id: '8', name: 'Высота опоры' }
        ]
      }
    ],
    measurementType: 'multiple' // 'single' для единичного оборудования, 'multiple' для нескольких технических мест
  },
  {
    key: '3',
    name: 'Испытание автоматических выключателей',
    description: 'Испытание параметров автоматических выключателей',
    conditions: [
      { id: '1', name: 'Температура воздуха' },
      { id: '3', name: 'Атмосферное давление' }
    ],
    blocks: [
      {
        id: '1',
        name: 'Электрические параметры',
        characteristics: [
          { id: '9', name: 'Ток срабатывания АВ' },
          { id: '10', name: 'Время срабатывания АВ' },
          { id: '11', name: 'Напряжение утечки' }
        ]
      },
      {
        id: '2',
        name: 'Механические параметры',
        characteristics: [
          { id: '14', name: 'Угол замыкания' },
          { id: '15', name: 'Степень повреждения изоляции' }
        ]
      }
    ],
    measurementType: 'single' // 'single' для единичного оборудования, 'multiple' для нескольких технических мест
  }
];

// Сотрудники (пример данных)
const EMPLOYEES = [
  "Иванов Иван Иванович",
  "Петров Петр Петрович",
  "Сидоров Сергей Сергеевич",
  "Кузнецова Екатерина Владимировна",
  "Новиков Алексей Андреевич"
];

// Измерительные приборы (пример данных)
const INSTRUMENTS = [
  { key: '1', name: 'Мегаомметр МО-10', type: 'Электрический', calibrationDate: dayjs('2024-06-15'), validUntil: dayjs('2025-06-14') },
  { key: '2', name: 'Микроомметр МИК-2', type: 'Электрический', calibrationDate: dayjs('2024-03-20'), validUntil: dayjs('2025-03-19') },
  { key: '3', name: 'Измеритель заземления ЗМ-5', type: 'Электрический', calibrationDate: dayjs('2024-08-10'), validUntil: dayjs('2025-08-09') },
  { key: '4', name: 'Термометр Т-100', type: 'Метеорологический', calibrationDate: dayjs('2024-01-15'), validUntil: dayjs('2025-01-14') },
  { key: '5', name: 'Влажномер ВЛ-2', type: 'Метеорологический', calibrationDate: dayjs('2024-05-25'), validUntil: dayjs('2025-05-24') }
];

// Дерево подразделений для ЭТЛ
const SUBDIVISIONS = [
  {
    title: 'филиал Алейские МЭС',
    value: 'филиал Алейские МЭС',
    children: [
      { title: 'Алейский РЭС', value: 'Алейский РЭС' },
      { title: 'Калманский участок', value: 'Калманский участок' },
      { title: 'Мамонтовский участок', value: 'Мамонтовский участок' },
      { title: 'Ребрихинский участок', value: 'Ребрихинский участок' },
      { title: 'Романовский участок', value: 'Романовский участок' },
      { title: 'Топчихинский участок', value: 'Топчихинский участок' },
      { title: 'Усть-Калманский участок', value: 'Усть-Калманский участок' },
      { title: 'Усть-Пристанский участок', value: 'Усть-Пристанский участок' },
      { title: 'Чарышский участок', value: 'Чарышский участок' }
    ]
  },
  {
    title: 'филиал Белокурихинские МЭС',
    value: 'филиал Белокурихинские МЭС',
    children: [
      { title: 'Алтайский участок', value: 'Алтайский участок' },
      { title: 'Белокурихинский участок', value: 'Белокурихинский участок' },
      { title: 'Быстроистокский участок', value: 'Быстроистокский участок' },
      { title: 'Петропавловский участок', value: 'Петропавловский участок' },
      { title: 'Смоленский участок', value: 'Смоленский участок' },
      { title: 'Советский участок', value: 'Советский участок' },
      { title: 'Солонешенский участок', value: 'Солонешенский участок' }
    ]
  },
  {
    title: 'филиал Бийские МЭС',
    value: 'филиал Бийские МЭС',
    children: [
      { title: 'Акутихинский участок', value: 'Акутихинский участок' },
      { title: 'Ельцовский участок', value: 'Ельцовский участок' },
      { title: 'Зональный участок', value: 'Зональный участок' },
      { title: 'Красногорский участок', value: 'Красногорский участок' },
      { title: 'Солтонский участок', value: 'Солтонский участок' },
      { title: 'Целинный участок', value: 'Целинный участок' }
    ]
  },
  {
    title: 'филиал Змеиногорские МЭС',
    value: 'филиал Змеиногорские МЭС',
    children: [
      { title: 'Горняцкий участок', value: 'Горняцкий участок' },
      { title: 'Змеиногорский участок', value: 'Змеиногорский участок' },
      { title: 'Краснощековский участок', value: 'Краснощековский участок' },
      { title: 'Курьинский участок', value: 'Курьинский участок' },
      { title: 'Староалейский участок', value: 'Староалейский участок' }
    ]
  },
  {
    title: 'филиал Каменские МЭС',
    value: 'филиал Каменские МЭС',
    children: [
      { title: 'Баевский участок', value: 'Баевский участок' },
      { title: 'Каменский РЭС', value: 'Каменский РЭС' },
      { title: 'Крутихинский участок', value: 'Крутихинский участок' },
      { title: 'Панкрушихинский участок', value: 'Панкрушихинский участок' },
      { title: 'Тюменцевский участок', value: 'Тюменцевский участок' },
      { title: 'Шелаболихинский участок', value: 'Шелаболихинский участок' }
    ]
  },
  {
    title: 'филиал Кулундинские МЭС',
    value: 'филиал Кулундинские МЭС',
    children: [
      { title: 'Благовещенский участок', value: 'Благовещенский участок' },
      { title: 'Завьяловский участок', value: 'Завьяловский участок' },
      { title: 'Ключевой участок', value: 'Ключевой участок' },
      { title: 'Кулундинский участок', value: 'Кулундинский участок' },
      { title: 'Михайловский участок', value: 'Михайловский участок' },
      { title: 'Родинский участок', value: 'Родинский участок' },
      { title: 'Табунский участок', value: 'Табунский участок' },
      { title: 'участок Степное Озеро', value: 'участок Степное Озеро' }
    ]
  },
  {
    title: 'филиал Новоалтайские МЭС',
    value: 'филиал Новоалтайские МЭС',
    children: [
      { title: 'Косихинский РЭС', value: 'Косихинский РЭС' },
      { title: 'Новоалтайский РЭС', value: 'Новоалтайский РЭС' },
      { title: 'Тальменский участок', value: 'Тальменский участок' },
      { title: 'Троицкого РЭС', value: 'Троицкого РЭС' }
    ]
  },
  {
    title: 'филиал Рубцовские МЭС',
    value: 'филиал Рубцовские МЭС',
    children: [
      { title: 'Волчихинский участок', value: 'Волчихинский участок' },
      { title: 'Новичихинский участок', value: 'Новичихинский участок' },
      { title: 'Новоегорьевский участок', value: 'Новоегорьевский участок' },
      { title: 'Поспелихинский участок', value: 'Поспелихинский участок' },
      { title: 'Рубцовский РЭС', value: 'Рубцовский РЭС' },
      { title: 'Угловский участок', value: 'Угловский участок' },
      { title: 'Шипуновский участок', value: 'Шипуновский участок' }
    ]
  },
  {
    title: 'филиал Славгородские МЭС',
    value: 'филиал Славгородские МЭС',
    children: [
      { title: 'Бурлинский участок', value: 'Бурлинский участок' },
      { title: 'Верх-Суетский участок', value: 'Верх-Суетский участок' },
      { title: 'Гальбштадтский участок', value: 'Гальбштадтский участок' },
      { title: 'Славгородский участок', value: 'Славгородский участок' },
      { title: 'Хабарский участок', value: 'Хабарский участок' }
    ]
  }
];

// Дерево подразделений для заказчика (из файла Подразделения.txt)
const CUSTOMERS_TREE = [
  {
    value: 'филиал Алейские МЭС',
    title: 'филиал Алейские МЭС',
    children: [
      { title: 'Алейский РЭС', value: 'Алейский РЭС' },
      { title: 'Калманский участок', value: 'Калманский участок' },
      { title: 'Мамонтовский участок', value: 'Мамонтовский участок' },
      { title: 'Ребрихинский участок', value: 'Ребрихинский участок' },
      { title: 'Романовский участок', value: 'Романовский участок' },
      { title: 'Топчихинский участок', value: 'Топчихинский участок' },
      { title: 'Усть-Калманский участок', value: 'Усть-Калманский участок' },
      { title: 'Усть-Пристанский участок', value: 'Усть-Пристанский участок' },
      { title: 'Чарышский участок', value: 'Чарышский участок' }
    ]
  },
  {
    title: 'филиал Белокурихинские МЭС',
    value: 'филиал Белокурихинские МЭС',
    children: [
      { title: 'Алтайский участок', value: 'Алтайский участок' },
      { title: 'Белокурихинский участок', value: 'Белокурихинский участок' },
      { title: 'Быстроистокский участок', value: 'Быстроистокский участок' },
      { title: 'Петропавловский участок', value: 'Петропавловский участок' },
      { title: 'Смоленский участок', value: 'Смоленский участок' },
      { title: 'Советский участок', value: 'Советский участок' },
      { title: 'Солонешенский участок', value: 'Солонешенский участок' }
    ]
  },
  {
    title: 'филиал Бийские МЭС',
    value: 'филиал Бийские МЭС',
    children: [
      { title: 'Акутихинский участок', value: 'Акутихинский участок' },
      { title: 'Ельцовский участок', value: 'Ельцовский участок' },
      { title: 'Зональный участок', value: 'Зональный участок' },
      { title: 'Красногорский участок', value: 'Красногорский участок' },
      { title: 'Солтонский участок', value: 'Солтонский участок' },
      { title: 'Целинный участок', value: 'Целинный участок' }
    ]
  },
  {
    title: 'филиал Змеиногорские МЭС',
    value: 'филиал Змеиногорские МЭС',
    children: [
      { title: 'Горняцкий участок', value: 'Горняцкий участок' },
      { title: 'Змеиногорский участок', value: 'Змеиногорский участок' },
      { title: 'Краснощековский участок', value: 'Краснощековский участок' },
      { title: 'Курьинский участок', value: 'Курьинский участок' },
      { title: 'Староалейский участок', value: 'Староалейский участок' }
    ]
  },
  {
    title: 'филиал Каменские МЭС',
    value: 'филиал Каменские МЭС',
    children: [
      { title: 'Баевский участок', value: 'Баевский участок' },
      { title: 'Каменский РЭС', value: 'Каменский РЭС' },
      { title: 'Крутихинский участок', value: 'Крутихинский участок' },
      { title: 'Панкрушихинский участок', value: 'Панкрушихинский участок' },
      { title: 'Тюменцевский участок', value: 'Тюменцевский участок' },
      { title: 'Шелаболихинский участок', value: 'Шелаболихинский участок' }
    ]
  },
  {
    title: 'филиал Кулундинские МЭС',
    value: 'филиал Кулундинские МЭС',
    children: [
      { title: 'Благовещенский участок', value: 'Благовещенский участок' },
      { title: 'Завьяловский участок', value: 'Завьяловский участок' },
      { title: 'Ключевой участок', value: 'Ключевой участок' },
      { title: 'Кулундинский участок', value: 'Кулундинский участок' },
      { title: 'Михайловский участок', value: 'Михайловский участок' },
      { title: 'Родинский участок', value: 'Родинский участок' },
      { title: 'Табунский участок', value: 'Табунский участок' },
      { title: 'участок Степное Озеро', value: 'участок Степное Озеро' }
    ]
  },
  {
    title: 'филиал Новоалтайские МЭС',
    value: 'филиал Новоалтайские МЭС',
    children: [
      { title: 'Косихинский РЭС', value: 'Косихинский РЭС' },
      { title: 'Новоалтайский РЭС', value: 'Новоалтайский РЭС' },
      { title: 'Тальменский участок', value: 'Тальменский участок' },
      { title: 'Троицкого РЭС', value: 'Троицкого РЭС' }
    ]
  },
  {
    title: 'филиал Рубцовские МЭС',
    value: 'филиал Рубцовские МЭС',
    children: [
      { title: 'Волчихинский участок', value: 'Волчихинский участок' },
      { title: 'Новичихинский участок', value: 'Новичихинский участок' },
      { title: 'Новоегорьевский участок', value: 'Новоегорьевский участок' },
      { title: 'Поспелихинский участок', value: 'Поспелихинский участок' },
      { title: 'Рубцовский РЭС', value: 'Рубцовский РЭС' },
      { title: 'Угловский участок', value: 'Угловский участок' },
      { title: 'Шипуновский участок', value: 'Шипуновский участок' }
    ]
  },
  {
    title: 'филиал Славгородские МЭС',
    value: 'филиал Славгородские МЭС',
    children: [
      { title: 'Бурлинский участок', value: 'Бурлинский участок' },
      { title: 'Верх-Суетский участок', value: 'Верх-Суетский участок' },
      { title: 'Гальбштадтский участок', value: 'Гальбштадтский участок' },
      { title: 'Славгородский участок', value: 'Славгородский участок' },
      { title: 'Хабарский участок', value: 'Хабарский участок' }
    ]
  }
];

// Виды испытаний (по description.md)
const INSPECTION_TYPES = [
  "Приёмо-сдаточные",
  "Периодические",
  "Профилактические",
  "Контрольные"
];

// Исходные данные для реестра ЭТЛ
const INITIAL_ETL_DATA = [
  { key: '1', registrationNumber: '22-99-2026', registrationDate: dayjs('2029-01-22'), subdivision: 'филиал Алейские МЭС' },
  { key: '2', registrationNumber: '22-31-2025', registrationDate: dayjs('2029-01-13'), subdivision: 'филиал Белокурихинские МЭС' },
  { key: '3', registrationNumber: '22-100-2026', registrationDate: dayjs('2029-01-20'), subdivision: 'филиал Бийские МЭС' },
  { key: '4', registrationNumber: '22-11-2026', registrationDate: dayjs('2029-01-26'), subdivision: 'филиал Змеиногорские МЭС' },
  { key: '5', registrationNumber: '22-72-2026', registrationDate: dayjs('2029-01-20'), subdivision: 'филиал Каменские МЭС' },
  { key: '6', registrationNumber: '22-82-2025', registrationDate: dayjs('2029-01-20'), subdivision: 'филиал Кулундинские МЭС' },
  { key: '7', registrationNumber: '22-68-2025', registrationDate: dayjs('2028-12-22'), subdivision: 'филиал Новоалтайские МЭС' },
  { key: '8', registrationNumber: '22-69-2025', registrationDate: dayjs('2028-12-26'), subdivision: 'филиал Рубцовские МЭС' },
  { key: '9', registrationNumber: '22-89-2025', registrationDate: dayjs('2029-01-22'), subdivision: 'филиал Славгородские МЭС' }
];

// Исходные данные для реестра протоколов
const INITIAL_PROTOCOLS_DATA = [
  {
    key: '1',
    protocolNumber: '964 НМЭС-2023_КОС. 28-4-12',
    date: dayjs('2023-04-28'),
    inspectionType: 'Периодические',
    etl: '22-99-2026',
    customer: 'филиал Алейские МЭС',
    object: 'ВЛ-0,4 кВ Ф.1 от ТП-28-12-5',
    workTypes: ['Измерение сопротивления заземляющего контура', 'Замеры загнивания деревянных опор'],
    workData: [
      {
        id: '1',
        name: 'Измерение сопротивления заземляющего контура',
        measurementType: 'single',
        equipment: 'Опора 1',
        conditions: {
          '1': '22°C',
          '2': '45%',
          '3': '760 мм рт. ст.'
        },
        blocks: [
          {
            id: '1',
            name: 'Измерения заземления',
            characteristics: [
              { id: '1', name: 'Сопротивление заземляющего контура', actualValue: '4.5 Ом', status: 'conforms' },
              { id: '2', name: 'Площадь контактной поверхности', actualValue: '0.8 м²', status: 'conforms' }
            ]
          },
          {
            id: '2',
            name: 'Измерения изоляции',
            characteristics: [
              { id: '3', name: 'Сопротивление изоляции фазы А', actualValue: '350 МОм', status: 'conforms' },
              { id: '4', name: 'Сопротивление изоляции фазы В', actualValue: '320 МОм', status: 'conforms' },
              { id: '5', name: 'Сопротивление изоляции фазы С', actualValue: '380 МОм', status: 'conforms' }
            ]
          }
        ]
      },
      {
        id: '2',
        name: 'Замеры загнивания деревянных опор',
        measurementType: 'multiple',
        conditions: {
          '1': '18°C',
          '2': '50%'
        },
        blocks: [
          {
            id: '1',
            name: 'Опорный блок',
            characteristics: [
              { id: '6', name: 'Уровень загнивания', actualValue: '10', status: 'conforms' },
              { id: '7', name: 'Диаметр ствола', actualValue: '25', status: 'conforms' },
              { id: '8', name: 'Высота опоры', actualValue: '11', status: 'conforms' }
            ]
          }
        ],
        technicalLocations: [
          {
            name: 'Техническое место 1',
            blocks: [
              {
                id: '1',
                name: 'Опорный блок',
                characteristics: [
                  { id: '6', name: 'Уровень загнивания', actualValue: '5 мм', status: 'conforms' },
                  { id: '7', name: 'Диаметр ствола', actualValue: '25 см', status: 'conforms' },
                  { id: '8', name: 'Высота опоры', actualValue: '12 м', status: 'conforms' }
                ]
              }
            ]
          },
          {
            name: 'Техническое место 2',
            blocks: [
              {
                id: '1',
                name: 'Опорный блок',
                characteristics: [
                  { id: '6', name: 'Уровень загнивания', actualValue: '3 мм', status: 'conforms' },
                  { id: '7', name: 'Диаметр ствола', actualValue: '23 см', status: 'conforms' },
                  { id: '8', name: 'Высота опоры', actualValue: '10 м', status: 'conforms' }
                ]
              }
            ]
          }
        ]
      }
    ],
    conclusion: 'Результаты испытаний соответствуют требованиям действующей нормативно-технической документации',
    performers: ['Иванов Иван Иванович', 'Петров Петр Петрович'],
    reviewer: 'Сидоров Сергей Сергеевич',
    instruments: ['Мегаомметр МО-10', 'Измеритель заземления ЗМ-5']
  },
  {
    key: '2',
    protocolNumber: '965 НМЭС-2023_КОС. 28-4-13',
    date: dayjs('2023-04-28'),
    inspectionType: 'Приёмо-сдаточные',
    etl: '22-31-2025',
    customer: 'Алейский РЭС',
    object: 'ВЛ-0,4 кВ Ф.2 от ТП-28-12-6',
    workTypes: ['Испытание автоматических выключателей'],
    workData: [
      {
        id: '3',
        name: 'Испытание автоматических выключателей',
        measurementType: 'single',
        equipment: 'Кабельная линия 1',
        conditions: {
          '1': '25°C',
          '3': '750 мм рт. ст.'
        },
        blocks: [
          {
            id: '1',
            name: 'Электрические характеристики',
            characteristics: [
              { id: '9', name: 'Ток срабатывания АВ', actualValue: '10 А', status: 'conforms' },
              { id: '10', name: 'Время срабатывания АВ', actualValue: '0.1 с', status: 'conforms' },
              { id: '11', name: 'Напряжение утечки', actualValue: '0.5 мВ', status: 'conforms' }
            ]
          },
          {
            id: '2',
            name: 'Механические характеристики',
            characteristics: [
              { id: '14', name: 'Угол замыкания', actualValue: '45°', status: 'conforms' },
              { id: '12', name: 'Индуктивность обмоток', actualValue: '1.2 мГн', status: 'conforms' },
              { id: '13', name: 'Кондуктивность изоляции', actualValue: '0.8 мС', status: 'conforms' }
            ]
          }
        ]
      }
    ],
    conclusion: 'Результаты испытаний соответствуют требованиям действующей нормативно-технической документации',
    performers: ['Кузнецова Екатерина Владимировна', 'Новиков Алексей Андреевич'],
    reviewer: 'Петров Петр Петрович',
    instruments: ['Термометр Т-100', 'Влажномер ВЛ-2']
  }
];

// Главный экран
const HomeScreen = ({ onNavigate }) => {
  const menuItems = [
    { key: 'protocols', label: 'Реестр протоколов испытаний', icon: <CheckCircleOutlined />, onClick: () => onNavigate('protocols') },
    { key: 'works', label: 'Настройка видов работ', icon: <SettingOutlined />, onClick: () => onNavigate('works') },
    { key: 'schedule', label: 'План-график испытаний', icon: <CheckCircleOutlined />, onClick: () => onNavigate('schedule') }
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 32, textAlign: 'center', color: '#1890ff' }}>
        <HomeOutlined style={{ marginRight: 12 }} />
        Система управления испытаниями
      </h1>

      <Row gutter={[16, 16]}>
        {menuItems.map(item => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.key}>
            <Card 
              hoverable
              style={{ height: '100%' }}
              bodyStyle={{ padding: 16, textAlign: 'center' }}
            >
              <Button
                type="primary"
                size="large"
                icon={item.icon}
                onClick={item.onClick}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  padding: '12px 16px',
                  fontSize: 14,
                  fontWeight: 500,
                  backgroundColor: item.key === 'works' ? '#52c41a' : '#1890ff',
                  whiteSpace: 'normal',
                  lineHeight: 1.4
                }}
              >
                {item.label}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

// План-график испытаний
const ScheduleScreen = ({ onBack }) => {
  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 24 }}>
        <Button 
          type="text" 
          icon={<HomeOutlined />} 
          onClick={onBack}
          style={{ marginRight: 16 }}
        />
        План-график испытаний
      </h1>
      <Card>
        <p>Функционал будет реализован в будущих версиях</p>
      </Card>
    </div>
  );
};

// Экран настройки работ
const WorksScreen = ({ onBack, workTypes: initialWorkTypes, onUpdate }) => {
  const [workTypes, setWorkTypes] = useState(initialWorkTypes || WorkTypes);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingWork, setEditingWork] = useState(null);
  const [form] = Form.useForm();

  // Открыть модалку для создания
  const showCreateModal = () => {
    setEditingWork(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Открыть модалку для редактирования
  const showEditModal = (record) => {
    setEditingWork(record);
    form.setFieldsValue({
      ...record,
      conditions: record.conditions.map(cond => cond.id),
      blocks: record.blocks.map(block => ({
        ...block,
        characteristics: block.characteristics.map(char => char.id)
      }))
    });
    setIsModalVisible(true);
  };

  // Закрыть модалку
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingWork(null);
  };

  // Сохранить работу (создание или редактирование)
  const handleSave = (values) => {
    // Преобразовать выбранные id в объекты
    const conditions = values.conditions.map(id => AllConditions.find(cond => cond.id === id));
    const blocks = values.blocks.map(block => ({
      ...block,
      characteristics: block.characteristics.map(id => AllCharacteristics.find(char => char.id === id))
    }));

    const workData = {
      ...values,
      conditions,
      blocks
    };

    if (editingWork) {
      // Редактирование существующей работы
      const updatedWorks = workTypes.map(work => 
        work.key === editingWork.key 
          ? { ...work, ...workData }
          : work
      );
      setWorkTypes(updatedWorks);
      onUpdate(updatedWorks);
    } else {
      // Создание новой работы
      const newWork = {
        key: Date.now().toString(),
        ...workData
      };
      const updatedWorks = [...workTypes, newWork];
      setWorkTypes(updatedWorks);
      onUpdate(updatedWorks);
    }

    setIsModalVisible(false);
    setEditingWork(null);
  };

  // Удалить работу
  const handleDelete = (key) => {
    Modal.confirm({
      title: 'Вы уверены, что хотите удалить эту работу?',
      content: ' Это действие нельзя отменить',
      onOk: () => {
        const updatedWorks = workTypes.filter(work => work.key !== key);
        setWorkTypes(updatedWorks);
        onUpdate(updatedWorks);
      }
    });
  };

  // Конфигурация столбцов таблицы
  const columns = [
    {
      title: 'Наименование',
      dataIndex: 'name',
      key: 'name',
      width: '35%',
      render: (text, record) => (
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            showEditModal(record);
          }}
          style={{ color: '#1890ff' }}
        >
          {text}
        </a>
      )
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      width: '40%',
      ellipsis: true
    },
    {
      title: 'Блоков',
      dataIndex: 'blocks',
      key: 'blocks',
      width: '10%',
      render: (blocks) => blocks.length
    },
    {
      title: 'Характеристик',
      dataIndex: 'blocks',
      key: 'characteristics',
      width: '10%',
      render: (blocks) => blocks.reduce((sum, block) => sum + block.characteristics.length, 0)
    },
    {
      title: '',
      key: 'actions',
      width: '5%',
      render: (_, record) => (
        <Dropdown 
          menu={{
            items: [
              {
                key: '1',
                label: 'Редактировать',
                icon: <EditOutlined />,
                onClick: () => showEditModal(record)
              },
              {
                key: '2',
                label: 'Удалить',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleDelete(record.key)
              }
            ]
          }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24 
      }}>
        <h1 style={{ margin: 0 }}>
          <Button 
            type="text" 
            icon={<HomeOutlined />} 
            onClick={onBack}
            style={{ marginRight: 16 }}
          />
          Настройка видов работ
        </h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          Добавить работу
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={workTypes}
        bordered
        pagination={{ pageSize: 10 }}
        style={{ marginBottom: 24 }}
      />

      {/* Модальная форма для создания/редактирования */}
      <Modal
        title={editingWork ? "Редактировать работу" : "Создание новой работы"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        style={{ maxHeight: '90vh', overflow: 'auto' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          {/* Основные данные */}
          <Form.Item
            name="name"
            label="Наименование работы"
            rules={[{ required: true, message: 'Пожалуйста, введите наименование работы' }]}
          >
            <Input placeholder="Введите наименование работы" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание"
          >
            <Input.TextArea rows={3} placeholder="Введите описание работы" />
          </Form.Item>

          <Form.Item
            name="measurementType"
            label="Тип измерений"
            rules={[{ required: true, message: 'Пожалуйста, выберите тип измерений' }]}
          >
            <Select placeholder="Выберите тип измерений">
              <Select.Option value="single">Единичное оборудование</Select.Option>
              <Select.Option value="multiple">Список технических мест</Select.Option>
            </Select>
          </Form.Item>

          {/* Условия измерений */}
          <Form.Item
            name="conditions"
            label="Условия измерений"
          >
            <Select
              mode="multiple"
              placeholder="Выберите условия измерений"
              options={AllConditions.map(condition => ({
                value: condition.id,
                label: condition.name
              }))}
            />
          </Form.Item>

          {/* Блоки характеристик */}
          <Form.List name="blocks">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item
                    label={index === 0 ? 'Блоки характеристик' : ''}
                    required={false}
                    key={field.key}
                  >
                    <Form.Item
                      {...field}
                      name={[field.name, 'name']}
                      rules={[{ required: true, message: 'Пожалуйста, введите наименование блока' }]}
                      noStyle
                    >
                      <Input placeholder={`Наименование блока ${index + 1}`} style={{ width: '30%', marginRight: 8 }} />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      name={[field.name, 'characteristics']}
                      rules={[{ required: true, message: 'Пожалуйста, выберите характеристики' }]}
                      noStyle
                    >
                      <Select
                        mode="multiple"
                        placeholder="Выберите характеристики"
                        options={AllCharacteristics.map(char => ({
                          value: char.id,
                          label: char.name
                        }))}
                        style={{ width: '60%', marginRight: 8 }}
                      />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Добавить блок характеристик
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit">
                Сохранить
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Реестр протоколов испытаний
const ProtocolsScreen = ({ onBack, etlData, workTypes }) => {
  const [protocols, setProtocols] = useState(INITIAL_PROTOCOLS_DATA);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState(null);
  const [form] = Form.useForm();
  const [selectedWorkTypes, setSelectedWorkTypes] = useState([]);
  
  // Открыть модалку для создания
  const showCreateModal = () => {
    setEditingProtocol(null);
    form.resetFields();
    setSelectedWorkTypes([]);
    setIsModalVisible(true);
  };
  
  // Функция для создания структуры workData по выбранным видам работ
  const createWorkDataStructure = (selectedWorks) => {
    return selectedWorks.map(work => {
      // Создать условия для работы
      const conditions = {};
      work.conditions.forEach(cond => {
        conditions[cond.id] = '';
      });

      // Создать блоки характеристик для работы
      const blocks = work.blocks.map(block => ({
        id: block.id,
        name: block.name,
        characteristics: block.characteristics.map(char => ({
          id: char.id,
          name: char.name,
          actualValue: '',
          status: ''
        }))
      }));

      return {
        id: work.key,
        name: work.name,
        measurementType: work.measurementType,
        conditions,
        blocks,
        equipment: work.measurementType === 'single' ? null : undefined,
        technicalLocations: work.measurementType === 'multiple' ? [] : undefined
      };
    });
  };

  // Открыть модалку для редактирования
  const showEditModal = (record) => {
    setEditingProtocol(record);
    // Найти все выбранные работы для редактирования
    const selectedWorks = workTypes.filter(w => record.workTypes.includes(w.name));
    setSelectedWorkTypes(selectedWorks);
    
    form.setFieldsValue({
      ...record,
      date: dayjs(record.date)
    });
    setIsModalVisible(true);
  };



  // Закрыть модалку
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingProtocol(null);
    setSelectedWorkTypes([]);
  };



  // Сохранить протокол (создание или редактирование)
  const handleSave = (values) => {
    console.log('Сохранение протокола:', values);
    if (editingProtocol) {
      // Редактирование существующего протокола
      const updatedProtocols = protocols.map(protocol => 
        protocol.key === editingProtocol.key 
          ? { ...protocol, ...values, date: values.date }
          : protocol
      );
      setProtocols(updatedProtocols);
    } else {
      // Создание нового протокола
      const newProtocol = {
        key: Date.now().toString(),
        ...values,
        date: values.date
      };
      setProtocols([...protocols, newProtocol]);
    }
    setIsModalVisible(false);
    setEditingProtocol(null);
    setSelectedWorkTypes([]);
  };

  // Удалить протокол
  const handleDelete = (key) => {
    Modal.confirm({
      title: 'Вы уверены, что хотите удалить этот протокол?',
      content: 'Это действие нельзя отменить',
      onOk: () => {
        setProtocols(protocols.filter(protocol => protocol.key !== key));
      }
    });
  };

  // Конфигурация столбцов таблицы
  const columns = [
    {
      title: 'Номер протокола',
      dataIndex: 'protocolNumber',
      key: 'protocolNumber',
      width: '20%',
      render: (text, record) => (
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            showEditModal(record);
          }}
          style={{ color: '#1890ff' }}
        >
          {text}
        </a>
      )
    },
    {
      title: 'Дата проведения',
      dataIndex: 'date',
      key: 'date',
      width: '15%',
      render: (date) => date.format('DD.MM.YYYY')
    },
    {
      title: 'Вид испытаний',
      dataIndex: 'inspectionType',
      key: 'inspectionType',
      width: '15%'
    },
    {
      title: 'Объект',
      dataIndex: 'object',
      key: 'object',
      width: '25%'
    },
    {
      title: 'ЭТЛ',
      dataIndex: 'etl',
      key: 'etl',
      width: '10%'
    },
    {
      title: '',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        <Dropdown 
          menu={{
            items: [
              {
                key: '1',
                label: 'Редактировать',
                icon: <EditOutlined />,
                onClick: () => showEditModal(record)
              },
              {
                key: '2',
                label: 'Удалить',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleDelete(record.key)
              }
            ]
          }}
          placement="bottomRight"
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 24 
      }}>
        <h1 style={{ margin: 0 }}>
          <Button 
            type="text" 
            icon={<HomeOutlined />} 
            onClick={onBack}
            style={{ marginRight: 16 }}
          />
          Реестр протоколов испытаний
        </h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          Добавить протокол
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={protocols}
        bordered
        pagination={{ pageSize: 10 }}
        style={{ marginBottom: 24 }}
      />

      {/* Модальная форма для создания/редактирования */}
      <Modal
        title={editingProtocol ? "Редактировать протокол" : "Создание протокола"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Отмена
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={() => form.submit()}
          >
            Сохранить
          </Button>
        ]}
        width={1000}
        style={{ maxHeight: '90vh', overflow: 'auto' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="protocolNumber"
                label="Номер протокола"
                rules={[{ required: true, message: 'Пожалуйста, введите номер протокола' }]}
              >
                <Input placeholder="Введите номер протокола" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="date"
                label="Дата проведения"
                rules={[{ required: true, message: 'Пожалуйста, выберите дату' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="DD.MM.YYYY"
                  placeholder="Выберите дату"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="inspectionType"
                label="Вид испытаний"
                rules={[{ required: true, message: 'Пожалуйста, выберите вид испытаний' }]}
              >
                <Select placeholder="Выберите вид испытаний">
                  {INSPECTION_TYPES.map(type => (
                    <Select.Option key={type} value={type}>
                      {type}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="etl"
                label="Электролаборатория"
                rules={[{ required: true, message: 'Пожалуйста, выберите электролабораторию' }]}
              >
                <Select placeholder="Выберите электролабораторию">
                  {etlData.map(etl => (
                    <Select.Option key={etl.registrationNumber} value={etl.registrationNumber}>
                      {etl.registrationNumber}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="customer"
                label="Подразделение-заказчик"
                rules={[{ required: true, message: 'Пожалуйста, выберите подразделение-заказчик' }]}
              >
                <TreeSelect
                  placeholder="Выберите подразделение-заказчик"
                  treeData={CUSTOMERS_TREE}
                  treeDefaultExpandAll={false}
                  treeExpandAction="click"
                  style={{ width: '100%' }}
                  treeNodeFilterProp="title"
                  showSearch
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="object"
                label="Объект"
                rules={[{ required: true, message: 'Пожалуйста, выберите объект' }]}
              >
                <Select placeholder="Выберите объект">
                  {OBJECTS.map(obj => (
                    <Select.Option key={obj} value={obj}>
                      {obj}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                name="workTypes"
                label="Вид работ"
                rules={[{ required: true, message: 'Пожалуйста, выберите вид работ' }]}
              >
                <Select 
                  mode="multiple" 
                  placeholder="Выберите виды работ" 
                  onChange={(values) => {
                    const selectedWorks = workTypes.filter(w => values.includes(w.name));
                    setSelectedWorkTypes(selectedWorks);
                    // Только для создания нового протокола и только при первом выборе работ
                    if (!editingProtocol && form.getFieldValue('workData').length === 0) {
                      const workData = createWorkDataStructure(selectedWorks);
                      form.setFieldsValue({ workData });
                    }
                  }}
                >
                  {workTypes.map(type => (
                    <Select.Option key={type.name} value={type.name}>
                      {type.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Отображение выбранных работ с условиями и характеристиками */}
          {selectedWorkTypes.length > 0 && (
            <Form.Item
              label="Данные работ"
            >
              {selectedWorkTypes.map((work, workIndex) => (
                <div key={work.key} style={{ marginBottom: 32 }}>
                  <h3 style={{ marginBottom: 16, color: '#1890ff' }}>{work.name}</h3>
                  
                  {/* Условия измерений для работы */}
                  {work.conditions.length > 0 && (
                    <>
                      <h4 style={{ marginBottom: 12 }}>Условия измерений</h4>
                      <Row gutter={[16, 16]}>
                        {work.conditions.map(condition => (
                          <Col xs={24} sm={12} md={8} key={condition.id}>
                            <Form.Item
                              name={['workData', workIndex, 'conditions', condition.id]}
                              label={condition.name}
                              rules={[{ required: true, message: `Пожалуйста, введите ${condition.name}` }]}
                            >
                              <Input placeholder={`Введите ${condition.name}`} />
                            </Form.Item>
                          </Col>
                        ))}
                      </Row>
                    </>
                  )}

                  {/* Выбор оборудования для единичного типа измерений */}
                  {work.measurementType === 'single' && (
                    <Form.Item
                      name={['workData', workIndex, 'equipment']}
                      label="Оборудование"
                      rules={[{ required: true, message: 'Пожалуйста, выберите оборудование' }]}
                    >
                      <Select placeholder="Выберите оборудование">
                        {EQUIPMENT.map(equipment => (
                          <Select.Option key={equipment} value={equipment}>
                            {equipment}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}

                  {/* Результаты измерений для работы */}
                  {work.blocks.length > 0 && (
                    <>
                      <h4 style={{ marginBottom: 12 }}>Результаты измерений</h4>
                      
                      {/* Для нескольких технических мест - статический отображение */}
                      {work.measurementType === 'multiple' ? (
                        <>
                          {Array.from({ length: 1 }).map((_, locationIndex) => (
                            <div key={locationIndex} style={{ marginBottom: 16 }}>
                              <Form.Item
                                name={['workData', workIndex, 'technicalLocations', locationIndex, 'name']}
                                label="Техническое место"
                                rules={[{ required: true, message: 'Пожалуйста, выберите техническое место' }]}
                              >
                                <Select placeholder="Выберите техническое место">
                                  {TECHNICAL_LOCATIONS.map(location => (
                                    <Select.Option key={location} value={location}>
                                      {location}
                                    </Select.Option>
                                  ))}
                                </Select>
                              </Form.Item>
                              
                              {work.blocks.map((block, blockIndex) => (
                                <Collapse key={block.id} defaultActiveKey={[block.id]} style={{ marginBottom: 16 }}>
                                  <Collapse.Panel header={block.name} key={block.id}>
                                    <Table
                                      columns={[
                                        {
                                          title: 'Характеристика',
                                          dataIndex: 'name',
                                          key: 'name',
                                          width: '40%'
                                        },
                                        {
                                          title: 'Фактическое значение',
                                          dataIndex: 'actualValue',
                                          key: 'actualValue',
                                          width: '30%',
                                          render: (text, record) => (
                                            <Form.Item
                                              name={['workData', workIndex, 'technicalLocations', locationIndex, 'blocks', blockIndex, 'characteristics', record.id, 'actualValue']}
                                              noStyle
                                            >
                                              <Input placeholder="Введите значение" />
                                            </Form.Item>
                                          )
                                        },
                                        {
                                          title: 'Статус',
                                          dataIndex: 'status',
                                          key: 'status',
                                          width: '30%',
                                          render: (text, record) => (
                                            <Form.Item
                                              name={['workData', workIndex, 'technicalLocations', locationIndex, 'blocks', blockIndex, 'characteristics', record.id, 'status']}
                                              noStyle
                                            >
                                              <Select placeholder="Выберите статус">
                                                <Select.Option value="conforms">Соответствует НТД</Select.Option>
                                                <Select.Option value="notConforms">Не соответствует НТД</Select.Option>
                                              </Select>
                                            </Form.Item>
                                          )
                                        }
                                      ]}
                                      dataSource={block.characteristics}
                                      bordered
                                      pagination={false}
                                      rowKey="id"
                                    />
                                  </Collapse.Panel>
                                </Collapse>
                              ))}
                            </div>
                          ))}
                        </>
                      ) : (
                        // Для единичного оборудования - обычное отображение блоков
                        work.blocks.map((block, blockIndex) => (
                          <Collapse key={block.id} defaultActiveKey={[block.id]} style={{ marginBottom: 16 }}>
                            <Collapse.Panel header={block.name} key={block.id}>
                              <Table
                                columns={[
                                  {
                                    title: 'Характеристика',
                                    dataIndex: 'name',
                                    key: 'name',
                                    width: '40%'
                                  },
                                  {
                                    title: 'Фактическое значение',
                                    dataIndex: 'actualValue',
                                    key: 'actualValue',
                                    width: '30%',
                                      render: (text, record) => (
                                        <Form.Item
                                          name={['workData', workIndex, 'blocks', blockIndex, 'characteristics', record.id, 'actualValue']}
                                          noStyle
                                        >
                                          <Input placeholder="Введите значение" />
                                        </Form.Item>
                                      )
                                  },
                                  {
                                    title: 'Статус',
                                    dataIndex: 'status',
                                    key: 'status',
                                    width: '30%',
                                      render: (text, record) => (
                                        <Form.Item
                                          name={['workData', workIndex, 'blocks', blockIndex, 'characteristics', record.id, 'status']}
                                          noStyle
                                        >
                                          <Select placeholder="Выберите статус">
                                            <Select.Option value="conforms">Соответствует НТД</Select.Option>
                                            <Select.Option value="notConforms">Не соответствует НТД</Select.Option>
                                          </Select>
                                        </Form.Item>
                                      )
                                  }
                                ]}
                                dataSource={block.characteristics}
                                bordered
                                pagination={false}
                                rowKey="id"
                              />
                            </Collapse.Panel>
                          </Collapse>
                        ))
                      )}
                    </>
                  )}
                </div>
              ))}
            </Form.Item>
          )}

          <Form.Item
            name="conclusion"
            label="Заключение"
            rules={[{ required: true, message: 'Пожалуйста, введите заключение' }]}
          >
            <Input.TextArea rows={3} placeholder="Введите заключение" />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="performers"
                label="Испытания провели"
                rules={[{ required: true, message: 'Пожалуйста, выберите сотрудников' }]}
              >
                <Select mode="multiple" placeholder="Выберите сотрудников">
                  {EMPLOYEES.map(employee => (
                    <Select.Option key={employee} value={employee}>
                      {employee}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="reviewer"
                label="Протокол проверил"
                rules={[{ required: true, message: 'Пожалуйста, выберите сотрудника' }]}
              >
                <Select placeholder="Выберите сотрудника">
                  {EMPLOYEES.map(employee => (
                    <Select.Option key={employee} value={employee}>
                      {employee}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="instruments"
            label="Измерения проведены приборами"
            rules={[{ required: true, message: 'Пожалуйста, выберите приборы' }]}
          >
            <Select mode="multiple" placeholder="Выберите приборы">
              {INSTRUMENTS.map(instrument => (
                <Select.Option key={instrument.key} value={instrument.name}>
                  {instrument.name} ({instrument.type})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const InspectionApp = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [etlData, setEtlData] = useState(INITIAL_ETL_DATA);
  const [employees, setEmployees] = useState(EMPLOYEES);
  const [instruments, setInstruments] = useState(INSTRUMENTS);
  const [workTypes, setWorkTypes] = useState(WorkTypes);

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    setCurrentScreen('home');
  };

  const handleWorkTypesUpdate = (newWorkTypes) => {
    setWorkTypes(newWorkTypes);
  };

  return (
    <div>
      {currentScreen === 'home' && <HomeScreen onNavigate={handleNavigate} />}
      {currentScreen === 'works' && <WorksScreen onBack={handleBack} workTypes={workTypes} onUpdate={handleWorkTypesUpdate} />}
      {currentScreen === 'schedule' && <ScheduleScreen onBack={handleBack} />}
      {currentScreen === 'protocols' && <ProtocolsScreen onBack={handleBack} etlData={etlData} workTypes={workTypes} />}
    </div>
  );
};

export default InspectionApp;
