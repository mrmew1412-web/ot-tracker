import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

const DAYS_TH = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const MONTHS_TH = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const HOL_TYPES = { national: { label: 'หยุดราชการ', cls: 'badge-red' }, company: { label: 'หยุดบริษัท', cls: 'badge-purple' }, substitute: { label: 'หยุดชดเชย', cls: 'badge-yellow' } };

export default function Calendar({ holidays, records, onAddHoliday, onDeleteHoliday }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newHol, setNewHol] = useState({ name: '', type: 'national' });

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const holSet = new Set(holidays.map(h => h.date));
  const holMap = holidays.reduce((m, h) => { m[h.date] = h; return m; }, {});
  const otDates = new Set(records.map(r => r.date));

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: daysInPrev - firstDay + 1 + i, other: true, prev: true });
  }
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, other: false });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, other: true, next: true });

  const dateStr = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const isToday = (d) => !cells[0]?.other && dateStr(d) === today.toISOString().split('T')[0];

  const selectedDate = selected ? dateStr(selected) : null;
  const selectedHoliday = selectedDate ? holMap[selectedDate] : null;
  const selectedRecords = selectedDate ? records.filter(r => r.date === selectedDate) : [];
  const monthHols = holidays.filter(h => h.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`));

  const handleAddHoliday = () => {
    if (!newHol.name || !selectedDate) return;
    onAddHoliday({ date: selectedDate, name: newHol.name, type: newHol.type });
    setNewHol({ name: '', type: 'national' });
    setShowForm(false);
  };

  return (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
      {/* Calendar */}
      <div className="card" style={{ flex: '1 1 360px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={prevMonth}><ChevronLeft size={15} /></button>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{MONTHS_TH[month]} {year + 543}</span>
          <button className="btn btn-ghost btn-sm" onClick={nextMonth}><ChevronRight size={15} /></button>
        </div>

        {/* Day headers */}
        <div className="cal-header">
          {DAYS_TH.map((d, i) => (
            <div key={d} className="cal-header-day" style={{ color: i === 0 ? 'var(--red)' : i === 6 ? 'var(--accent)' : 'var(--text2)' }}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="cal-grid">
          {cells.map((cell, idx) => {
            const ds = !cell.other ? dateStr(cell.day) : null;
            const isHol = ds && holSet.has(ds);
            const hasOT = ds && otDates.has(ds);
            const isSel = ds && ds === selectedDate;
            const dayOfWeek = idx % 7;
            const isWknd = dayOfWeek === 0 || dayOfWeek === 6;

            return (
              <div
                key={idx}
                className={`cal-day ${!cell.other && isToday(cell.day) ? 'today' : ''} ${isHol ? 'holiday' : ''} ${hasOT ? 'has-ot' : ''} ${cell.other ? 'other-month' : ''}`}
                style={{
                  cursor: cell.other ? 'default' : 'pointer',
                  background: isSel ? 'rgba(91,141,246,0.25)' : undefined,
                  border: isSel ? '1px solid rgba(91,141,246,0.5)' : undefined,
                  color: isHol ? 'var(--red)' : isWknd && !cell.other ? 'var(--accent2)' : undefined,
                }}
                onClick={() => !cell.other && setSelected(cell.day)}
              >
                <span style={{ fontSize: 13 }}>{cell.day}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11, color: 'var(--text2)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }} /> มี OT</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)', display: 'inline-block' }} /> วันหยุด</span>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Selected day detail */}
        {selected && (
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>
              {selected} {MONTHS_TH[month]} {year + 543}
            </div>

            {selectedHoliday ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{selectedHoliday.name}</div>
                  <span className={`badge ${HOL_TYPES[selectedHoliday.type]?.cls || 'badge-red'}`}>
                    {HOL_TYPES[selectedHoliday.type]?.label || selectedHoliday.type}
                  </span>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => onDeleteHoliday(selectedHoliday.id)}>
                  <Trash2 size={12} />
                </button>
              </div>
            ) : (
              <div style={{ marginBottom: 12 }}>
                {!showForm ? (
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(true)}>
                    <Plus size={13} /> เพิ่มวันหยุด
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input placeholder="ชื่อวันหยุด" value={newHol.name} onChange={e => setNewHol(n => ({ ...n, name: e.target.value }))} />
                    <select value={newHol.type} onChange={e => setNewHol(n => ({ ...n, type: e.target.value }))}>
                      {Object.entries(HOL_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary btn-sm" onClick={handleAddHoliday}>บันทึก</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>ยกเลิก</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedRecords.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 8 }}>รายการ OT วันนี้</div>
                {selectedRecords.map(r => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
                    <span>{r.employeeName}</span>
                    <span style={{ color: 'var(--green)', fontWeight: 500 }}>{parseFloat(r.hours).toFixed(1)} ชม. · {(parseFloat(r.total) || 0).toLocaleString()} บ.</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Month holidays list */}
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>วันหยุดเดือนนี้</div>
          {monthHols.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>ไม่มีวันหยุดในเดือนนี้</div>
          ) : monthHols.map(h => (
            <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{h.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>{h.date}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`badge ${HOL_TYPES[h.type]?.cls || 'badge-red'}`}>{HOL_TYPES[h.type]?.label || h.type}</span>
                <button className="btn btn-danger btn-sm" onClick={() => onDeleteHoliday(h.id)}><Trash2 size={11} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
