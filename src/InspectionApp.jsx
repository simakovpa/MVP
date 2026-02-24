import React, { useState } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, Space, Dropdown, Menu, Card, Row, Col, Input, TreeSelect } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined, HomeOutlined, FileTextOutlined, UserOutlined, ToolOutlined, CalendarOutlined, ExperimentOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

// Данные для выпадающих списков
const OBJECTS = [
  "ВЛ-0,4 кВ Ф.1 от ТП-28-12-5",
  "ВЛ-0,4 кВ Ф.2 от ТП-28-12-6",
  "ВЛ-0,4 кВ Ф.3 от ТП-28-12-7",
  "ВЛ-0,4 кВ Ф.4 от ТП-28-12-8",
  "ВЛ-0,4 кВ Ф.5 от ТП-28-12-9"
];

const WORK_TYPES = [
  "Измерение сопротивления заземляющего контура",
  "Замеры загнивания деревянных опор"
];

const CUSTOMERS = [
  "РЭС 1",
  "РЭС 2",
  "РЭС 3",
  "РЭС 4",
  "РЭС 5"
];

// Дерево подразделений для ЭТЛ
const SUBDIVISIONS = [
  {
    title: 'филиал Алейские МЭС',
    key: 'филиал Алейские МЭС',
    children: [
      { title: 'Алейский РЭС', key: 'Алейский РЭС' },
      { title: 'Калманский участок', key: 'Калманский участок' },
      { title: 'Мамонтовский участок', key: 'Мамонтовский участок' },
      { title: 'Ребрихинский участок', key: 'Ребрихинский участок' },
      { title: 'Романовский участок', key: 'Романовский участок' },
      { title: 'Топчихинский участок', key: 'Топчихинский участок' },
      { title: 'Усть-Калманский участок', key: 'Усть-Калманский участок' },
      { title: 'Усть-Пристанский участок', key: 'Усть-Пристанский участок' },
      { title: 'Чарышский участок', key: 'Чарышский участок' }
    ]
  },
  {
    title: 'филиал Белокурихинские МЭС',
    key: 'филиал Белокурихинские МЭС',
    children: [
      { title: 'Алтайский участок', key: 'Алтайский участок' },
      { title: 'Белокурихинский участок', key: 'Белокурихинский участок' },
      { title: 'Быстроистокский участок', key: 'Быстроистокский участок' },
      { title: 'Петропавловский участок', key: 'Петропавловский участок' },
      { title: 'Смоленский участок', key: 'Смоленский участок' },
      { title: 'Советский участок', key: 'Советский участок' },
      { title: 'Солонешенский участок', key: 'Солонешенский участок' }
    ]
  },
  {
    title: 'филиал Бийские МЭС',
    key: 'филиал Бийские МЭС',
    children: [
      { title: 'Акутихинский участок', key: 'Акутихинский участок' },
      { title: 'Ельцовский участок', key: 'Ельцовский участок' },
      { title: 'Зональный участок', key: 'Зональный участок' },
      { title: 'Красногорский участок', key: 'Красногорский участок' },
      { title: 'Солтонский участок', key: 'Солтонский участок' },
      { title: 'Целинный участок', key: 'Целинный участок' }
    ]
  },
  {
    title: 'филиал Змеиногорские МЭС',
    key: 'филиал Змеиногорские МЭС',
    children: [
      { title: 'Горняцкий участок', key: 'Горняцкий участок' },
      { title: 'Змеиногорский участок', key: 'Змеиногорский участок' },
      { title: 'Краснощековский участок', key: 'Краснощековский участок' },
      { title: 'Курьинский участок', key: 'Курьинский участок' },
      { title: 'Староалейский участок', key: 'Староалейский участок' }
    ]
  },
  {
    title: 'филиал Каменские МЭС',
    key: 'филиал Каменские МЭС',
    children: [
      { title: 'Баевский участок', key: 'Баевский участок' },
      { title: 'Каменский РЭС', key: 'Каменский РЭС' },
      { title: 'Крутихинский участок', key: 'Крутихинский участок' },
      { title: 'Панкрушихинский участок', key: 'Панкрушихинский участок' },
      { title: 'Тюменцевский участок', key: 'Тюменцевский участок' },
      { title: 'Шелаболихинский участок', key: 'Шелаболихинский участок' }
    ]
  },
  {
    title: 'филиал Кулундинские МЭС',
    key: 'филиал Кулундинские МЭС',
    children: [
      { title: 'Благовещенский участок', key: 'Благовещенский участок' },
      { title: 'Завьяловский участок', key: 'Завьяловский участок' },
      { title: 'Ключевской участок', key: 'Ключевской участок' },
      { title: 'Кулундинский участок', key: 'Кулундинский участок' },
      { title: 'Михайловский участок', key: 'Михайловский участок' },
      { title: 'Родинский участок', key: 'Родинский участок' },
      { title: 'Табунский участок', key: 'Табунский участок' },
      { title: 'участок Степное Озеро', key: 'участок Степное Озеро' }
    ]
  },
  {
    title: 'филиал Новоалтайские МЭС',
    key: 'филиал Новоалтайские МЭС',
    children: [
      { title: 'Косихинский РЭС', key: 'Косихинский РЭС' },
      { title: 'Новоалтайский РЭС', key: 'Новоалтайский РЭС' },
      { title: 'Тальменский участок', key: 'Тальменский участок' },
      { title: 'Троицкого РЭС', key: 'Троицкого РЭС' }
    ]
  },
  {
    title: 'филиал Рубцовские МЭС',
    key: 'филиал Рубцовские МЭС',
    children: [
      { title: 'Волчихинский участок', key: 'Волчихинский участок' },
      { title: 'Новичихинский участок', key: 'Новичихинский участок' },
      { title: 'Новоегорьевский участок', key: 'Новоегорьевский участок' },
      { title: 'Поспелихинский участок', key: 'Поспелихинский участок' },
      { title: 'Рубцовский РЭС', key: 'Рубцовский РЭС' },
      { title: 'Угловский участок', key: 'Угловский участок' },
      { title: 'Шипуновский участок', key: 'Шипуновский участок' }
    ]
  },
  {
    title: 'филиал Славгородские МЭС',
    key: 'филиал Славгородские МЭС',
    children: [
      { title: 'Бурлинский участок', key: 'Бурлинский участок' },
      { title: 'Верх-Суетский участок', key: 'Верх-Суетский участок' },
      { title: 'Гальбштадтский участок', key: 'Гальбштадтский участок' },
      { title: 'Славгородский участок', key: 'Славгородский участок' },
      { title: 'Хабарский участок', key: 'Хабарский участок' }
    ]
  }
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

// Главный экран
const HomeScreen = ({ onNavigate }) => {
  const menuItems = [
    { key: 'etl', label: 'Реестр ЭТЛ', icon: <FileTextOutlined />, onClick: () => onNavigate('etl') },
    { key: 'employees', label: 'Реестр Сотрудников', icon: <UserOutlined />, onClick: () => onNavigate('employees') },
    { key: 'instruments', label: 'Реестр Измерительных приборов', icon: <ToolOutlined />, onClick: () => onNavigate('instruments') },
    { key: 'schedule', label: 'План-график испытаний', icon: <CalendarOutlined />, onClick: () => onNavigate('schedule') },
    { key: 'tasks', label: 'Реестр Заданий на испытания', icon: <ExperimentOutlined />, onClick: () => onNavigate('tasks') },
    { key: 'protocols', label: 'Реестр Протоколов испытаний', icon: <CheckCircleOutlined />, onClick: () => onNavigate('protocols') }
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
                  backgroundColor: item.key === 'tasks' ? '#52c41a' : '#1890ff',
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

// Реестр ЭТЛ
const ETLRegistryScreen = ({ onBack }) => {
  const [etlData, setEtlData] = useState(INITIAL_ETL_DATA);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingETL, setEditingETL] = useState(null);
  const [form] = Form.useForm();

  // Открыть модалку для создания
  const showCreateModal = () => {
    setEditingETL(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Открыть модалку для редактирования
  const showEditModal = (record) => {
    setEditingETL(record);
    form.setFieldsValue({
      ...record,
      registrationDate: dayjs(record.registrationDate)
    });
    setIsModalVisible(true);
  };

  // Закрыть модалку
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingETL(null);
  };

  // Сохранить ЭТЛ (создание или редактирование)
  const handleSave = (values) => {
    if (editingETL) {
      // Редактирование существующей записи
      const updatedData = etlData.map(item => 
        item.key === editingETL.key 
          ? { ...item, ...values, registrationDate: values.registrationDate }
          : item
      );
      setEtlData(updatedData);
    } else {
      // Создание новой записи
      const newETL = {
        key: Date.now().toString(),
        ...values,
        registrationDate: values.registrationDate
      };
      setEtlData([...etlData, newETL]);
    }
    setIsModalVisible(false);
    setEditingETL(null);
  };

  // Удалить запись
  const handleDelete = (key) => {
    Modal.confirm({
      title: 'Вы уверены, что хотите удалить эту запись?',
      content: 'Это действие нельзя отменить',
      onOk: () => {
        setEtlData(etlData.filter(item => item.key !== key));
      }
    });
  };

  // Конфигурация столбцов таблицы
  const columns = [
    {
      title: 'Регистрационный номер',
      dataIndex: 'registrationNumber',
      key: 'registrationNumber',
      width: '30%'
    },
    {
      title: 'Дата регистрации',
      dataIndex: 'registrationDate',
      key: 'registrationDate',
      width: '25%',
      render: (date) => date.format('DD.MM.YYYY')
    },
    {
      title: 'Подразделение',
      dataIndex: 'subdivision',
      key: 'subdivision',
      width: '40%'
    },
    {
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
          Реестр ЭТЛ
        </h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          Добавить ЭТЛ
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={etlData}
        bordered
        pagination={{ pageSize: 10 }}
        style={{ marginBottom: 24 }}
      />

      {/* Модальная форма для создания/редактирования */}
      <Modal
        title={editingETL ? "Редактирование электролаборатории" : "Создание электролаборатории"}
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
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="registrationNumber"
            label="Регистрационный номер"
            rules={[{ required: true, message: 'Пожалуйста, введите регистрационный номер' }]}
          >
            <Input placeholder="Введите регистрационный номер" />
          </Form.Item>

          <Form.Item
            name="registrationDate"
            label="Дата регистрации"
            rules={[{ required: true, message: 'Пожалуйста, выберите дату' }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="DD.MM.YYYY"
              placeholder="Выберите дату"
            />
          </Form.Item>

          <Form.Item
            name="subdivision"
            label="Подразделение"
            rules={[{ required: true, message: 'Пожалуйста, выберите подразделение' }]}
          >
            <TreeSelect
              placeholder="Выберите подразделение"
              treeData={SUBDIVISIONS}
              treeDefaultExpandAll={false}
              treeExpandAction="click"
              style={{ width: '100%' }}
              treeNodeFilterProp="title"
              showSearch
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Реестр заданий на испытания
const TasksScreen = ({ onBack, etlData }) => {
  const [tasks, setTasks] = useState([
    {
      key: '1',
      object: "ВЛ-0,4 кВ Ф.1 от ТП-28-12-5",
      planDate: dayjs('2024-01-15'),
      workType: "Измерение сопротивления заземляющего контура",
      etl: "22-99-2026",
      customer: "РЭС 1"
    },
    {
      key: '2',
      object: "ВЛ-0,4 кВ Ф.2 от ТП-28-12-6",
      planDate: dayjs('2024-01-20'),
      workType: "Замеры загнивания деревянных опор",
      etl: "22-31-2025",
      customer: "РЭС 2"
    }
  ]);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();

  // Открыть модалку для создания
  const showCreateModal = () => {
    setEditingTask(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Открыть модалку для редактирования
  const showEditModal = (record) => {
    setEditingTask(record);
    form.setFieldsValue({
      ...record,
      planDate: dayjs(record.planDate)
    });
    setIsModalVisible(true);
  };

  // Закрыть модалку
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingTask(null);
  };

  // Сохранить задание (создание или редактирование)
  const handleSave = (values) => {
    if (editingTask) {
      // Редактирование существующего задания
      const updatedTasks = tasks.map(task => 
        task.key === editingTask.key 
          ? { ...task, ...values, planDate: values.planDate }
          : task
      );
      setTasks(updatedTasks);
    } else {
      // Создание нового задания
      const newTask = {
        key: Date.now().toString(),
        ...values,
        planDate: values.planDate
      };
      setTasks([...tasks, newTask]);
    }
    setIsModalVisible(false);
    setEditingTask(null);
  };

  // Удалить задание
  const handleDelete = (key) => {
    Modal.confirm({
      title: 'Вы уверены, что хотите удалить это задание?',
      content: 'Это действие нельзя отменить',
      onOk: () => {
        setTasks(tasks.filter(task => task.key !== key));
      }
    });
  };

  // Конфигурация столбцов таблицы
  const columns = [
    {
      title: 'Объект',
      dataIndex: 'object',
      key: 'object',
      width: '25%',
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
      title: 'Дата план',
      dataIndex: 'planDate',
      key: 'planDate',
      width: '15%',
      render: (date) => date.format('DD.MM.YYYY')
    },
    {
      title: 'Вид работ',
      dataIndex: 'workType',
      key: 'workType',
      width: '30%'
    },
    {
      title: 'ЭТЛ',
      dataIndex: 'etl',
      key: 'etl',
      width: '10%',
      render: (etlNumber) => {
        const etlInfo = etlData.find(etl => etl.registrationNumber === etlNumber);
        return etlNumber;
      }
    },
    {
      title: 'Подразделение заказчик',
      dataIndex: 'customer',
      key: 'customer',
      width: '15%'
    },
    {
      title: 'Действия',
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
          Реестр заданий на испытания
        </h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          Добавить задание
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={tasks}
        bordered
        pagination={{ pageSize: 10 }}
        style={{ marginBottom: 24 }}
      />

      {/* Модальная форма для создания/редактирования */}
      <Modal
        title={editingTask ? "Редактировать задание" : "Создание задания"}
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
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
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

          <Form.Item
            name="planDate"
            label="Дата план"
            rules={[{ required: true, message: 'Пожалуйста, выберите дату' }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="DD.MM.YYYY"
              placeholder="Выберите дату"
            />
          </Form.Item>

          <Form.Item
            name="workType"
            label="Вид работ"
            rules={[{ required: true, message: 'Пожалуйста, выберите вид работ' }]}
          >
            <Select placeholder="Выберите вид работ">
              {WORK_TYPES.map(type => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="etl"
            label="ЭТЛ"
            rules={[{ required: true, message: 'Пожалуйста, выберите ЭТЛ' }]}
          >
            <Select placeholder="Выберите ЭТЛ">
              {etlData.map(etl => (
                <Select.Option key={etl.registrationNumber} value={etl.registrationNumber}>
                  {etl.registrationNumber}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="customer"
            label="Подразделение заказчик"
            rules={[{ required: true, message: 'Пожалуйста, выберите подразделение заказчик' }]}
          >
            <TreeSelect
              placeholder="Выберите подразделение заказчик"
              treeData={SUBDIVISIONS}
              treeDefaultExpandAll={false}
              treeExpandAction="click"
              style={{ width: '100%' }}
              treeNodeFilterProp="title"
              showSearch
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const InspectionApp = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [etlData, setEtlData] = useState(INITIAL_ETL_DATA);

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    setCurrentScreen('home');
  };

  return (
    <div>
      {currentScreen === 'home' && <HomeScreen onNavigate={handleNavigate} />}
      {currentScreen === 'etl' && <ETLRegistryScreen onBack={handleBack} />}
      {currentScreen === 'tasks' && <TasksScreen onBack={handleBack} etlData={etlData} />}
      {['employees', 'instruments', 'schedule', 'protocols'].includes(currentScreen) && (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ marginBottom: 24 }}>
            <Button 
              type="text" 
              icon={<HomeOutlined />} 
              onClick={handleBack}
              style={{ marginRight: 16 }}
            />
            {currentScreen === 'employees' && 'Реестр Сотрудников'}
            {currentScreen === 'instruments' && 'Реестр Измерительных приборов'}
            {currentScreen === 'schedule' && 'План-график испытаний'}
            {currentScreen === 'protocols' && 'Реестр Протоколов испытаний'}
          </h1>
          <Card>
            <p>Функционал будет реализован в будущих версиях</p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InspectionApp;
