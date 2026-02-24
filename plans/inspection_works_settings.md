# Реализация настройки работ и групп измеряемых характеристик

## Общие подходы

Для реализации настройки работ и групп измеряемых характеристик будет использоваться следующая структура данных и компоненты Ant Design:

## Структура данных для работы

```javascript
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
    ]
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
    ]
  }
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
  { id: '8', name: 'Высота опоры' }
];
```

## Экран настройки работ

Экран будет состоять из следующих элементов:

1. **Таблица с списком работ**:
   - Колонки: Наименование, Описание, Количество блоков, Количество характеристик, Дата создания
   - Действия: Редактировать, Удалить

2. **Кнопка "Добавить работу"**:
   - Открывает модальную форму для создания новой работы

## Форма создания/редактирования работы

Форма будет содержать следующие разделы:

### 1. Основные данные

- Наименование работы (обязательное поле)
- Описание работы (необязательное поле, текстовая область)

### 2. Условия измерений

- Выбор из списка всех доступных условий
- Доступно множественное выделение
- Отображение выбранных условий в виде тегов

### 3. Блоки характеристик

- Динамическое добавление/удаление блоков
- Для каждого блока:
  - Наименование блока
  - Выбор характеристик из общего списка
  - Доступно множественное выделение
  - Отображение выбранных характеристик в виде тегов

## Компоненты Ant Design для реализации

### Таблица с работами

```javascript
<Table
  columns={columns}
  dataSource={workTypes}
  bordered
  pagination={{ pageSize: 10 }}
  rowKey="key"
/>
```

### Модальная форма

```javascript
<Modal
  title="Создание новой работы"
  open={isModalVisible}
  onCancel={handleCancel}
  footer={null}
  width={800}
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
```

## Взаимодействие с протоколом

При создании протокола:

1. Пользователь выбирает вид работ из выпадающего списка
2. Система автоматически загружает условия и блоки характеристик для выбранной работы
3. Условия измерений заполняются полями ввода
4. Таблица результатов заполняется блоками характеристик с пустыми полями для ввода значений

## Пример отображения результатов в протоколе

```javascript
// Отображение блоков характеристик в протоколе
{workType.blocks.map(block => (
  <Collapse key={block.id} defaultActiveKey={[block.id]}>
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
              <Input placeholder="Введите значение" />
            )
          },
          {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            width: '30%',
            render: (text, record) => (
              <Select placeholder="Выберите статус">
                <Select.Option value="conforms">Соответствует НТД</Select.Option>
                <Select.Option value="notConforms">Не соответствует НТД</Select.Option>
              </Select>
            )
          }
        ]}
        dataSource={block.characteristics.map(char => ({
          key: char.id,
          name: char.name,
          actualValue: '',
          status: ''
        }))}
        bordered
        pagination={false}
      />
    </Collapse.Panel>
  </Collapse>
))}
```

## Логика хранения и передачи данных

1. Работы хранятся в состоянии приложения
2. При выборе типа работ в протоколе, данные о работе передаются через пропсы или контекст
3. Изменения в настройках работ сразу отражаются в протоколах

## Дизайн улучшения

Для лучшего пользовательского опыта:

- Добавить поисковую строку в таблице работ
- Добавить фильтрацию работ по наименованию или описанию
- Добавить кнопку экспорта настроек работ
- Поддержать сохранение настроек в локальное хранилище

## Ограничения и улучшения для будущих версий

- Добавить импорта/экспорта настроек в файл
- Поддержать вложенные блоки характеристик
- Добавить возможность копирования настроек из существующей работы
- Поддержать переименование и переупорядочивание блоков и характеристик
