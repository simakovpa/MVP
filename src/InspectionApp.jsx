import React, { useState } from 'react';
import { Calendar } from 'antd';
import dayjs from 'dayjs';

const InspectionApp = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [daysUntil, setDaysUntil] = useState(null);

  const onSelect = (date) => {
    setSelectedDate(date);
    const today = dayjs();
    const diffDays = date.diff(today, 'day');
    setDaysUntil(diffDays);
  };

  const dateCellRender = (value) => {
    const today = dayjs();
    const diffDays = value.diff(today, 'day');
    return (
      <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
        {diffDays > 0 ? `${diffDays} дн` : diffDays === 0 ? 'Сегодня' : ''}
      </div>
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 24 }}>Календарь</h1>
      
      <div style={{ marginBottom: 24 }}>
        <Calendar 
          onSelect={onSelect}
          cellRender={(current, info) => {
            if (info.type === 'date') {
              return dateCellRender(current);
            }
            return info.originNode;
          }}
        />
      </div>

      {selectedDate && (
        <div style={{ 
          padding: 16, 
          backgroundColor: '#f0f5ff', 
          borderRadius: 8,
          border: '1px solid #d9ecff'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#1890ff' }}>
            Дата выбрана: {selectedDate.format('DD.MM.YYYY')}
          </h3>
          <p style={{ margin: 0, fontSize: 16 }}>
            Количество дней до текущей даты: 
            <span style={{ 
              fontWeight: 'bold', 
              color: daysUntil > 0 ? '#52c41a' : daysUntil < 0 ? '#ff4d4f' : '#faad14',
              marginLeft: 8
            }}>
              {daysUntil > 0 ? `+${daysUntil}` : daysUntil < 0 ? daysUntil : '0'}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default InspectionApp;
