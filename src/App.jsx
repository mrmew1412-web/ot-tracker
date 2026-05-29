import React, { useState } from 'react';
import { Clock, LayoutDashboard, FileText, Calendar, Users, Settings, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useOTData } from './hooks/useOTData';
import Dashboard from './components/Dashboard';
import OTForm from './components/OTForm';
import RecordsTable from './components/RecordsTable';
import CalendarView from './components/Calendar';
import EmployeeManager from './components/EmployeeManager';
import SettingsPanel from './components/SettingsPanel';

const TABS = [
  { id: 'dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
  { id: 'record', label: 'บันทึก OT', icon: Clock },
  { id: 'records', label: 'รายการ', icon: FileText },
  { id: 'calendar', label: 'ปฏิทิน', icon: Calendar },
  { id: 'employees', label: 'พนักงาน', icon: Users },
  { id: 'settings', label: 'ตั้งค่า', icon: Settings },
];

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const data = useOTData();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 56 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={15} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1 }}>OT Tracker</div>
              <div style={{ fontSize: 10, color: 'var(--text2)', lineHeight: 1 }}>{data.settings.companyName || 'ระบบบันทึกค่าล่วงเวลา'}</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto' }}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 7, fontSize: 13, fontFamily: 'inherit',
                  border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  background: tab === id ? 'var(--bg3)' : 'transparent',
                  color: tab === id ? 'var(--text)' : 'var(--text2)',
                  fontWeight: tab === id ? 500 : 400,
                  transition: 'all 0.15s',
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </nav>

          {/* Sync status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {data.scriptUrl ? (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => data.syncFromSheets()}
                disabled={data.syncing}
                style={{ fontSize: 12 }}
              >
                <RefreshCw size={12} style={{ animation: data.syncing ? 'spin 1s linear infinite' : 'none' }} />
                {data.syncing ? 'กำลังซิงค์...' : 'ซิงค์'}
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text2)' }}>
                <WifiOff size={12} /> ออฟไลน์
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, padding: '24px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {tab === 'dashboard' && (
          <Dashboard records={data.records} employees={data.employees} holidays={data.holidays} settings={data.settings} />
        )}
        {tab === 'record' && (
          <div style={{ maxWidth: 640 }}>
            <OTForm employees={data.employees} settings={data.settings} holidays={data.holidays} onAdd={data.addRecord} />
          </div>
        )}
        {tab === 'records' && (
          <RecordsTable records={data.records} employees={data.employees} settings={data.settings} onDelete={data.deleteRecord} />
        )}
        {tab === 'calendar' && (
          <CalendarView holidays={data.holidays} records={data.records} onAddHoliday={data.addHoliday} onDeleteHoliday={data.deleteHoliday} />
        )}
        {tab === 'employees' && (
          <EmployeeManager employees={data.employees} records={data.records} settings={data.settings} onAdd={data.addEmployee} onDelete={data.deleteEmployee} />
        )}
        {tab === 'settings' && (
          <SettingsPanel
            settings={data.settings}
            scriptUrl={data.scriptUrl}
            syncing={data.syncing}
            lastSync={data.lastSync}
            onSave={data.updateSettings}
            onConnect={data.connectSheets}
            onSync={data.syncFromSheets}
          />
        )}
      </main>

      {/* Toast */}
      {data.toast && (
        <div className="toast" style={{ borderColor: data.toast.type === 'error' ? 'var(--red)' : 'var(--green)', color: data.toast.type === 'error' ? 'var(--red)' : 'var(--green)' }}>
          {data.toast.msg}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
