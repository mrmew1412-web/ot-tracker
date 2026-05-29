import React, { useState } from 'react';
import { Plus, Trash2, Users, Edit2, X, Check } from 'lucide-react';

const POSITIONS = ['พนักงานทั่วไป','วิศวกร','ช่างเทคนิค','ผู้จัดการ','หัวหน้างาน','พนักงานขาย','บัญชี','HR','ขับรถ','รปภ.','อื่นๆ'];

export default function EmployeeManager({ employees, records, settings, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', position: '', hourlyRate: '', otRate: '' });
  const [editId, setEditId] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = () => {
    if (!form.name) return;
    onAdd({
      name: form.name,
      position: form.position || 'พนักงานทั่วไป',
      hourlyRate: parseFloat(form.hourlyRate) || settings.baseHourlyRate || 100,
      otRate: parseFloat(form.otRate) || parseFloat(form.hourlyRate) || settings.baseHourlyRate || 100,
    });
    setForm({ name: '', position: '', hourlyRate: '', otRate: '' });
    setShowForm(false);
  };

  const getEmpStats = (empId) => {
    const empRecs = records.filter(r => r.employeeId === empId);
    const totalHours = empRecs.reduce((s, r) => s + (parseFloat(r.hours) || 0), 0);
    const totalAmount = empRecs.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
    return { count: empRecs.length, hours: totalHours, amount: totalAmount };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={18} color="var(--accent)" />
          <span style={{ fontWeight: 600, fontSize: 15 }}>พนักงาน ({employees.length} คน)</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'ยกเลิก' : 'เพิ่มพนักงาน'}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card" style={{ borderColor: 'rgba(91,141,246,0.3)' }}>
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14, color: 'var(--accent)' }}>เพิ่มพนักงานใหม่</div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="form-group">
              <label className="form-label">ชื่อ-นามสกุล *</label>
              <input placeholder="ชื่อพนักงาน" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">ตำแหน่ง</label>
              <select value={form.position} onChange={e => set('position', e.target.value)}>
                <option value="">-- เลือกตำแหน่ง --</option>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">อัตราค่าจ้าง/ชม (บาท)</label>
              <input type="number" placeholder={settings.baseHourlyRate || 100} value={form.hourlyRate} onChange={e => set('hourlyRate', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">อัตราค่า OT/ชม (บาท) <span style={{ color: 'var(--text2)', fontWeight: 400 }}>— ก่อนคูณอัตรา</span></label>
              <input type="number" placeholder={form.hourlyRate || settings.baseHourlyRate || 100} value={form.otRate} onChange={e => set('otRate', e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={handleAdd}><Check size={14} /> บันทึก</button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>ยกเลิก</button>
          </div>
        </div>
      )}

      {/* Employee List */}
      {employees.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text2)' }}>
          <Users size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div>ยังไม่มีพนักงาน กด "เพิ่มพนักงาน" เพื่อเริ่มต้น</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {employees.map(emp => {
            const stats = getEmpStats(emp.id);
            return (
              <div key={emp.id} className="card" style={{ padding: '14px 18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Avatar */}
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'rgba(91,141,246,0.15)', border: '1px solid rgba(91,141,246,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 600, fontSize: 15, color: 'var(--accent)',
                    }}>
                      {emp.name?.[0] || '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>{emp.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{emp.position || 'พนักงานทั่วไป'}</div>
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(emp.id)}><Trash2 size={12} /></button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>อัตราค่า OT</div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--yellow)' }}>{(emp.otRate || emp.hourlyRate || settings.baseHourlyRate || 100).toLocaleString()} บ./ชม.</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>OT ทั้งหมด</div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{stats.hours.toFixed(1)} ชม. ({stats.count} ครั้ง)</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>ยอดรวม</div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--green)' }}>{stats.amount.toLocaleString()} {settings.currency}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
