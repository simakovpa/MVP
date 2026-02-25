# Метод решения проблемы с взаимным влиянием полей формы в React с Ant Design

## Проблема

При вводе значений в поля одной секции формы (например, "Условия измерений") стирались значения в других секциях (например, "Результаты измерений"). Это происходило из-за неправильной привязки полей и перерисовок компонентов.

## Причина проблемы

1. **Динамическое обновление формы**: Использовались useEffect и Form.useWatch для отслеживания изменений полей, что вызывало перерисовку всей секции данных работ
2. **Неправильные пути к полям**: Для полей в таблицах использовались id характеристик вместо индексов массива, что приводило к неуникальным путям
3. **Перерисовка компонентов**: При изменении любого поля вызывалась перерисовка всей формы, что сбрасывала введенные значения

## Решение

### 1. Удалить лишнюю логику обновления

Удалить все useEffect и Form.useWatch, которые вызывали перерисовки формы:

```javascript
// До:
const selectedWorkTypeNames = Form.useWatch('workTypes', form);

React.useEffect(() => {
  // Логика обновления selectedWorkTypes и workData
}, [selectedWorkTypeNames]);

// После:
// Удалить вообще
```

### 2. Оптимизировать обработчик выбора видов работ

Создать структуру workData только при первом выборе работ для нового протокола:

```javascript
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
```

### 3. Удалить Form.List для технических мест

Для работы с measurementType='multiple' использовать статическое отображение вместо Form.List, чтобы избежать перерисовок:

```javascript
// До:
<Form.List name={['workData', workIndex, 'technicalLocations']}>
  {(fields, { add, remove }) => (
    // Логика добавления/удаления технических мест
  )}
</Form.List>

// После:
{Array.from({ length: 1 }).map((_, locationIndex) => (
  // Статическое отображение одного технического места
))}
```

### 4. Использовать индексы для уникальных путей

Для полей в таблицах использовать индексы массива вместо id характеристик:

```javascript
// До:
render: (text, record) => (
  <Form.Item
    name={['workData', workIndex, 'technicalLocations', locationIndex, 'blocks', blockIndex, 'characteristics', record.id, 'actualValue']}
    noStyle
  >
    <Input placeholder="Введите значение" />
  </Form.Item>
)

// После:
render: (text, record, charIndex) => (
  <Form.Item
    name={['workData', workIndex, 'technicalLocations', locationIndex, 'blocks', blockIndex, 'characteristics', charIndex, 'actualValue']}
    noStyle
  >
    <Input placeholder="Введите значение" />
  </Form.Item>
)
```

### 5. Сохранить структуру при редактировании

При открытии протокола на редактирование подгружать данные напрямую из record.workData без нормализации:

```javascript
const showEditModal = (record) => {
  setEditingProtocol(record);
  const selectedWorks = workTypes.filter(w => record.workTypes.includes(w.name));
  setSelectedWorkTypes(selectedWorks);
  
  form.setFieldsValue({
    ...record,
    date: dayjs(record.date)
  });
  setIsModalVisible(true);
};
```

## Результат

После реализации этих изменений поля на форме работают независимо друг от друга. При вводе значений в любую секцию, другие поля не очищаются, и все данные сохраняются при сохранении протокола.
