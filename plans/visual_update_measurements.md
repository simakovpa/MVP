# План: Визуальное обновление прототипа измерений и испытаний

## Цель
Привести визуальное оформление прототипа `prototype_measurements.jsx` в соответствие с оригинальной системой ОРЭО на основе анализа файла [`ОРЭО.mhtml`](ОРЭО.mhtml).

---

## Анализ различий

### Текущее состояние прототипа
- Нет Header с горизонтальным меню
- Нет Sidebar (боковой панели)
- Простой Layout без структуры

### Оригинальная система ОРЭО
- **Header**: горизонтальное меню, логотип, настройки, профиль
- **Sidebar**: тёмный, ширина 365px, вертикальное меню
- **Content**: основная область с таблицами

---

## Детальный план изменений

### 1. Добавить Header (верхняя панель)

**Расположение**: Верхняя часть экрана, белая背景

**Элементы**:
- Логотип слева (использовать существующий или placeholder)
- Горизонтальное меню по центру
- Правая часть: иконка настроек, аватар пользователя, иконка выхода

**Код для добавления**:
```jsx
<Header style={{ 
  background: '#fff', 
  padding: '0 24px', 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center',
  borderBottom: '1px solid #d9d9d9',
  height: 64
}}>
  {/* Логотип */}
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img alt="Logo" src="/assets/logo-B98JYH-O.svg" style={{ height: 34, marginRight: 24 }} />
    
    {/* Горизонтальное меню */}
    <Menu 
      mode="horizontal" 
      theme="light"
      selectedKeys={['/defect-detection']}
      items={[
        { key: '/system-objects', label: <a href="/system-objects">Система сети</a>, icon: <ApartmentOutlined /> },
        { key: '/gis', label: <a href="/gis">ГИС</a>, icon: <GlobalOutlined /> },
        { key: '/registries', label: <a href="/registries">Реестры</a>, icon: <BarsOutlined /> },
        { key: '/tasks', label: <a href="/tasks">Обходы</a>, icon: <SnippetsOutlined /> },
        { key: '/defect-detection', label: <a href="/defect-detection">Дефектовка</a>, icon: <BugOutlined /> },
      ]}
      style={{ minWidth: 500, borderBottom: 'none' }}
    />
  </div>
  
  {/* Правая часть */}
  <Space size={16}>
    <SettingOutlined style={{ fontSize: 18, cursor: 'pointer', color: 'rgba(0,0,0,0.88)' }} />
    <Avatar style={{ backgroundColor: '#e6f4ff', color: '#1677ff' }}>AA</Avatar>
    <LogoutOutlined style={{ fontSize: 18, cursor: 'pointer', color: 'rgba(0,0,0,0.65)' }} />
  </Space>
</Header>
```

### 2. Добавить Sidebar (боковая панель)

**Расположение**: Слева, под Header

**Параметры**:
- Ширина: 365px (фиксированная)
- Тёмная тема: `background: #0f2744`
- Вертикальное меню с пунктами:
  - 📄 Листы осмотра
  - 📑 Шаблоны листа осмотра
  - 🐛 Испытания и измерения (активный)

**Код для добавления**:
```jsx
<Sider 
  width={365} 
  theme="dark" 
  style={{ 
    background: '#0f2744',
    flex: '0 0 365px',
    maxWidth: 365,
    minWidth: 365
  }}
  collapsedWidth={80}
>
  <Menu
    theme="dark"
    mode="inline"
    selectedKeys={['/defect-detection/measurements']}
    style={{ 
      background: '#0f2744',
      borderRight: 'none'
    }}
    items={[
      { 
        key: '/defect-detection/inspection-sheets', 
        icon: <FileSearchOutlined />, 
        label: <a href="/defect-detection/inspection-sheets">Листы осмотра</a> 
      },
      { 
        key: '/defect-detection/inspection-sheet-templates', 
        icon: <ReconciliationOutlined />, 
        label: <a href="/defect-detection/inspection-sheet-templates">Шаблоны листа осмотра</a> 
      },
      { 
        key: '/defect-detection/measurements', 
        icon: <ThunderboltOutlined />, 
        label: <a href="/defect-detection/measurements">Испытания и измерения</a> 
      },
    ]}
  />
  
  {/* Триггер сворачивания */}
  <div className="ant-layout-sider-trigger" style={{ width: 365 }}>
    <span style={{ color: 'rgba(0,0,0,0.88)' }}>Свернуть</span>
    <LeftSquareOutlined style={{ color: 'rgba(0,0,0,0.65)', fontSize: 28 }} />
  </div>
</Sider>
```

### 3. Обновить Theme Config

**Добавить в секцию components**:
```jsx
components: {
  Menu: {
    // Горизонтальное меню (Header)
    itemBg: 'transparent',
    itemColor: 'rgba(0,0,0,0.88)',
    itemHoverBg: '#f5f5f5',
    itemSelectedBg: '#e6f4ff',
    itemSelectedColor: '#1677ff',
    
    // Вертикальное меню (Sidebar) - тёмная тема
    darkItemBg: '#0f2744',
    darkItemColor: '#a8bdd4',
    darkItemHoverBg: '#1a3a5c',
    darkItemSelectedBg: '#1a5fa8',
    darkItemSelectedColor: '#ffffff',
    darkSubMenuItemBg: '#0a1e35',
  }
}
```

### 4. Структура Layout

**Полная структура**:
```jsx
<ConfigProvider theme={theme}>
  <Layout style={{ minHeight: '100vh' }}>
    {/* Header */}
    <Header>...</Header>
    
    <Layout>
      {/* Sidebar */}
      <Sider>...</Sider>
      
      {/* Content */}
      <Content style={{ padding: 24, background: '#f0f2f5' }}>
        {/* Текущий контент протоколов */}
      </Content>
    </Layout>
  </Layout>
</ConfigProvider>
```

---

## Порядок реализации

1. **Импорты**: Добавить новые иконки (`GlobalOutlined`, `BarsOutlined`, `SnippetsOutlined`, `SettingOutlined`, `LogoutOutlined`, `LeftSquareOutlined`)

2. **Theme**: Обновить конфигурацию темы

3. **Header**: Добавить компонент Header с Menu

4. **Sider**: Добавить компонент Sider с Menu

5. **Обертка**: Обернуть всё в Layout

6. **Тестирование**: Проверить отображение

---

## Ожидаемый результат

После изменений прототип будет иметь:
- ✅ Верхнюю панель с логотипом и горизонтальным меню
- ✅ Боковую панель (тёмную) с навигацией
- ✅ Основную область с протоколами
- ✅ Визуальный стиль, близкий к оригинальной системе ОРЭО
