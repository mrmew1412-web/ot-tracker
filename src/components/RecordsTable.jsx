import React, { useState } from 'react';
import { Trash2, Search, Filter, Download } from 'lucide-react';

const TYPE_LABEL = { weekday: 'วันธรรมดา', weekend: 'วันเสาร์-อาทิตย์', holiday: 'วันหยุด' };
const TYPE_BADGE = { weekday: 'badge-blue', weekend: 'badge-purple', holiday: 'badge-red' };

export default function RecordsTable({ records, employees, settings, onDelete }) {
  const [search, setSearch] = useState('');
  const [filterEmp, setFilterEmp] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const filtered = records.filter(r => {
    if (filterEmp && r.employeeId !== filterEmp) return false;
    if (filterType && r.type !== filterType) return false;
    if (filterMonth && !r.date.startsWith(filterMonth)) return false;
    if (search && !r.employeeName?.toLowerCase().includes(search.toLowerCase()) && !r.note?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalHours = filtered.reduce((s, r) => s + (parseFloat(r.hours) || 0), 0);
  const totalAmount = filtered.reduce((s, r) => s + (parseFloat(r.total) || 0), 0);

  const exportCSV = () => {
    const header = 'วันที่,พนักงาน,ประเภท,ชั่วโมง,อัตรา,รวม,หมายเหตุ';
    const rows = filtered.map(r =>
      `${r.date},${r.employeeName},${TYPE_LABEL[r.type] || r.type},${r.hours},${r.rate || ''},${r.total},${r.note || ''}`
    );
    const csv = '\uFEFF' + [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `OT_${filterMonth || 'all'}.csv`; a.click();
  };

  const months = [...new Set(records.map(r => r.date?.slice(0, 7)))].sort().reverse();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary */}
      <div className="grid-3" style={{ gap: 12 }}>
        <div className="card stat">
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{filtered.length}</div>
          <div className="stat-label">รายการ OT</div>
        </div>
        <div className="card stat">
          <div className="stat-value" style={{ color: 'var(--yellow)' }}>{totalHours.toFixed(1)}</div>
          <div className="stat-label">ชั่วโมงรวม</div>
        </div>
        <div className="card stat">
          <div className="stat-value" style={{ color: 'var(--green)' }}>{totalAmount.toLocaleString()}</div>
          <div className="stat-label">รวมเงิน ({settings.currency})</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหา..." style={{ paddingLeft: 32 }} />
          </div>
          <select value={filterEmp} onChange={e => setFilterEmp(e.target.value)} style={{ width: 'auto', minWidth: 130 }}>
            <option value="">พนักงานทั้งหมด</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 'auto', minWidth: 130 }}>
            <option value="">ประเภททั้งหมด</option>
            <option value="weekday">วันธรรมดา</option>
            <option value="weekend">วันเสาร์-อาทิตย์</option>
            <option value="holiday">วันหยุด</option>
          </select>
          <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ width: 'auto', minWidth: 120 }}>
            <option value="">ทุกเดือน</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={exportCSV}>
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>วันที่</th>
                <th>พนักงาน</th>
                <th>ประเภท</th>
                <th style={{ textAlign: 'right' }}>ชั่วโมง</th>
                <th style={{ textAlign: 'right' }}>อัตรา/ชม</th>
                <th style={{ textAlign: 'right' }}>รวม</th>
                <th>หมายเหตุ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text2)' }}>ไม่มีรายการ OT</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id}>
                  <td className="mono" style={{ fontSize: 13 }}>{r.date}</td>
                  <td style={{ fontWeight: 500 }}>{r.employeeName}</td>
                  <td><span className={`badge ${TYPE_BADGE[r.type] || 'badge-blue'}`}>{TYPE_LABEL[r.type] || r.type}</span></td>
                  <td style={{ textAlign: 'right' }} className="mono">{parseFloat(r.hours).toFixed(1)} ชม.</td>
                  <td style={{ textAlign: 'right', fontSize: 13, color: 'var(--text2)' }} className="mono">
                    {r.rate || '-'} ×{r.multiplier || ''}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--green)' }} className="mono">
                    {(parseFloat(r.total) || 0).toLocaleString()}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text2)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.note || '-'}
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(r.id)}>
                      <Trash2 size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
