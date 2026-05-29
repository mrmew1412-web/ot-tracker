import React from 'react';
import { TrendingUp, Clock, Users, Calendar, DollarSign } from 'lucide-react';

function Bar({ value, max, color }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
    </div>
  );
}

export default function Dashboard({ records, employees, holidays, settings }) {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonth = now.getMonth() === 0
    ? `${now.getFullYear() - 1}-12`
    : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

  const thisMonthRecs = records.filter(r => r.date?.startsWith(thisMonth));
  const lastMonthRecs = records.filter(r => r.date?.startsWith(lastMonth));

  const totalAmount = thisMonthRecs.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);
  const totalHours = thisMonthRecs.reduce((s, r) => s + (parseFloat(r.hours) || 0), 0);
  const lastAmount = lastMonthRecs.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);

  // Per employee stats this month
  const empStats = employees.map(emp => {
    const recs = thisMonthRecs.filter(r => r.employeeId === emp.id);
    return {
      ...emp,
      hours: recs.reduce((s, r) => s + (parseFloat(r.hours) || 0), 0),
      amount: recs.reduce((s, r) => s + (parseFloat(r.total) || 0), 0),
      count: recs.length,
    };
  }).sort((a, b) => b.amount - a.amount);

  const maxAmount = Math.max(...empStats.map(e => e.amount), 1);

  // Type breakdown
  const typeBreak = ['weekday', 'weekend', 'holiday'].map(type => {
    const recs = thisMonthRecs.filter(r => r.type === type);
    return {
      type,
      label: { weekday: 'วันธรรมดา', weekend: 'เสาร์-อาทิตย์', holiday: 'วันหยุด' }[type],
      hours: recs.reduce((s, r) => s + (parseFloat(r.hours) || 0), 0),
      amount: recs.reduce((s, r) => s + (parseFloat(r.total) || 0), 0),
      color: { weekday: 'var(--accent)', weekend: 'var(--purple)', holiday: 'var(--red)' }[type],
    };
  });

  // Upcoming holidays (next 30 days)
  const upcoming = holidays.filter(h => {
    const d = new Date(h.date);
    const diff = (d - now) / 86400000;
    return diff >= 0 && diff <= 30;
  }).slice(0, 5);

  const pctChange = lastAmount ? Math.round(((totalAmount - lastAmount) / lastAmount) * 100) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top stats */}
      <div className="grid-4">
        {[
          { label: 'ค่า OT เดือนนี้', value: totalAmount.toLocaleString(), unit: settings.currency, color: 'var(--green)', icon: <DollarSign size={16} /> },
          { label: 'ชั่วโมง OT เดือนนี้', value: totalHours.toFixed(1), unit: 'ชม.', color: 'var(--yellow)', icon: <Clock size={16} /> },
          { label: 'รายการทั้งหมด', value: records.length, unit: 'ครั้ง', color: 'var(--accent)', icon: <TrendingUp size={16} /> },
          { label: 'พนักงาน', value: employees.length, unit: 'คน', color: 'var(--purple)', icon: <Users size={16} /> },
        ].map(({ label, value, unit, color, icon }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', color, marginBottom: 8, opacity: 0.7 }}>{icon}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{unit} · {label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 16 }}>
        {/* Employee ranking */}
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={15} color="var(--accent)" /> OT พนักงานเดือนนี้
          </div>
          {empStats.length === 0 ? (
            <div style={{ color: 'var(--text2)', fontSize: 13 }}>ยังไม่มีข้อมูล</div>
          ) : empStats.map((emp, i) => (
            <div key={emp.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                <span style={{ fontWeight: 500 }}>
                  {i === 0 && '🏆 '}{emp.name}
                  <span style={{ fontWeight: 400, color: 'var(--text2)', marginLeft: 6 }}>{emp.position}</span>
                </span>
                <span style={{ color: 'var(--green)', fontWeight: 600 }}>{emp.amount.toLocaleString()} บ.</span>
              </div>
              <Bar value={emp.amount} max={maxAmount} color={i === 0 ? 'var(--green)' : 'var(--accent)'} />
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 3 }}>{emp.hours.toFixed(1)} ชม. · {emp.count} ครั้ง</div>
            </div>
          ))}
        </div>

        {/* Type breakdown + Upcoming holidays */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={15} color="var(--yellow)" /> ประเภท OT เดือนนี้
            </div>
            {typeBreak.map(t => (
              <div key={t.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color }} />
                  <span style={{ fontSize: 13 }}>{t.label}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: t.color }}>{t.amount.toLocaleString()} {settings.currency}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)' }}>{t.hours.toFixed(1)} ชม.</div>
                </div>
              </div>
            ))}
            {pctChange !== null && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text2)' }}>
                เทียบเดือนที่แล้ว: <span style={{ color: pctChange >= 0 ? 'var(--red)' : 'var(--green)', fontWeight: 600 }}>{pctChange >= 0 ? '+' : ''}{pctChange}%</span>
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={15} color="var(--red)" /> วันหยุดที่กำลังมา
            </div>
            {upcoming.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text2)' }}>ไม่มีวันหยุดใน 30 วันข้างหน้า</div>
            ) : upcoming.map(h => (
              <div key={h.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span>{h.name}</span>
                <span style={{ color: 'var(--red)', fontFamily: 'monospace' }}>{h.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
