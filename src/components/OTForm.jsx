import React, { useState } from 'react';
import { Plus, Clock, AlertCircle } from 'lucide-react';

const OT_TYPES = [
  { value: 'weekday', label: 'วันธรรมดา' },
  { value: 'weekend', label: 'วันเสาร์-อาทิตย์' },
  { value: 'holiday', label: 'วันหยุดนักขัตฤกษ์' },
];

export default function OTForm({ employees, settings, holidays, onAdd }) {
  const [form, setForm] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    hours: '',
    type: 'weekday',
    note: '',
    customRate: '',
  });
  const [useCustomRate, setUseCustomRate] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const detectType = (date) => {
    if (holidays.some(h => h.date === date)) return 'holiday';
    const day = new Date(date).getDay();
    if (day === 0 || day === 6) return 'weekend';
    return 'weekday';
  };

  const handleDateChange = (date) => {
    set('date', date);
    set('type', detectType(date));
  };

  const getRateMultiplier = () => {
    if (useCustomRate && form.customRate) return parseFloat(form.customRate);
    const m = { weekday: settings.weekdayRate, weekend: settings.weekendRate, holiday: settings.holidayRate };
    return m[form.type] || 1.5;
  };

  const getEmployee = () => employees.find(e => e.id === form.employeeId);

  const getBaseRate = () => {
    const emp = getEmployee();
    return emp?.otRate || emp?.hourlyRate || settings.baseHourlyRate || 100;
  };

  const total = form.hours && form.employeeId
    ? Math.round(parseFloat(form.hours) * getBaseRate() * getRateMultiplier())
    : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.employeeId || !form.hours || !form.date) return;
    const emp = getEmployee();
    onAdd({
      ...form,
      employeeName: emp?.name || '',
      rate: getBaseRate(),
      multiplier: getRateMultiplier(),
      total,
      hours: parseFloat(form.hours),
    });
    setForm(f => ({ ...f, hours: '', note: '' }));
  };

  const multiplier = getRateMultiplier();
  const baseRate = getBaseRate();

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Clock size={18} color="var(--accent)" />
        <span style={{ fontWeight: 600, fontSize: 15 }}>บันทึก OT ใหม่</span>
      </div>

      {employees.length === 0 && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: 8, marginBottom: 16, fontSize: 13, color: 'var(--yellow)' }}>
          <AlertCircle size={14} />
          กรุณาเพิ่มพนักงานก่อนบันทึก OT
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">พนักงาน *</label>
            <select value={form.employeeId} onChange={e => set('employeeId', e.target.value)} required>
              <option value="">-- เลือกพนักงาน --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} — {emp.position}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">วันที่ *</label>
            <input type="date" value={form.date} onChange={e => handleDateChange(e.target.value)} required />
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">ประเภท OT</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}>
              {OT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">จำนวนชั่วโมง *</label>
            <input
              type="number" step="0.5" min="0.5" max="24"
              value={form.hours} onChange={e => set('hours', e.target.value)}
              placeholder="เช่น 3.5" required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={useCustomRate} onChange={e => setUseCustomRate(e.target.checked)} style={{ width: 'auto' }} />
            กำหนดอัตรา OT เอง (ค่าปกติ: ×{multiplier})
          </label>
          {useCustomRate && (
            <input
              type="number" step="0.1" min="1" max="10"
              value={form.customRate} onChange={e => set('customRate', e.target.value)}
              placeholder={`อัตราปัจจุบัน: ×${multiplier}`}
            />
          )}
        </div>

        <div className="form-group">
          <label className="form-label">หมายเหตุ</label>
          <input type="text" value={form.note} onChange={e => set('note', e.target.value)} placeholder="งานที่ทำ OT..." />
        </div>

        {form.employeeId && form.hours && (
          <div style={{ background: 'rgba(91,141,246,0.08)', border: '1px solid rgba(91,141,246,0.2)', borderRadius: 8, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>
              {getEmployee()?.name} · {form.hours} ชม. × {baseRate} บาท × ×{multiplier}
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--green)' }}>
              {total.toLocaleString()} {settings.currency}
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
          <Plus size={15} /> บันทึก OT
        </button>
      </form>
    </div>
  );
}
