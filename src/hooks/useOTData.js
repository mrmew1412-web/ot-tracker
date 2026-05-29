import { useState, useEffect, useCallback } from 'react';
import { callSheets, deleteFromSheets } from '../utils/sheets';

const STORAGE_KEY = 'ot_tracker_v2';

const defaultSettings = {
  weekdayRate: 1.5,
  weekendRate: 2.0,
  holidayRate: 3.0,
  currency: 'THB',
  baseHourlyRate: 100,
  companyName: 'บริษัท ของฉัน จำกัด',
};

const defaultHolidays = [
  { id: '1', date: '2025-01-01', name: 'วันขึ้นปีใหม่', type: 'national' },
  { id: '2', date: '2025-02-26', name: 'วันมาฆบูชา', type: 'national' },
  { id: '3', date: '2025-04-06', name: 'วันจักรี', type: 'national' },
  { id: '4', date: '2025-04-13', name: 'วันสงกรานต์', type: 'national' },
  { id: '5', date: '2025-04-14', name: 'วันสงกรานต์', type: 'national' },
  { id: '6', date: '2025-04-15', name: 'วันสงกรานต์', type: 'national' },
  { id: '7', date: '2025-05-01', name: 'วันแรงงาน', type: 'national' },
  { id: '8', date: '2025-05-05', name: 'วันฉัตรมงคล', type: 'national' },
  { id: '9', date: '2025-06-03', name: 'วันเฉลิมพระชนมพรรษา สมเด็จพระนางเจ้าฯ', type: 'national' },
  { id: '10', date: '2025-07-28', name: 'วันเฉลิมพระชนมพรรษา รัชกาลที่ 10', type: 'national' },
  { id: '11', date: '2025-08-12', name: 'วันแม่แห่งชาติ', type: 'national' },
  { id: '12', date: '2025-10-13', name: 'วันคล้ายวันสวรรคต รัชกาลที่ 9', type: 'national' },
  { id: '13', date: '2025-10-23', name: 'วันปิยมหาราช', type: 'national' },
  { id: '14', date: '2025-12-05', name: 'วันพ่อแห่งชาติ', type: 'national' },
  { id: '15', date: '2025-12-10', name: 'วันรัฐธรรมนูญ', type: 'national' },
  { id: '16', date: '2025-12-31', name: 'วันสิ้นปี', type: 'national' },
];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useOTData() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [holidays, setHolidays] = useState(defaultHolidays);
  const [settings, setSettings] = useState(defaultSettings);
  const [scriptUrl, setScriptUrl] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [toast, setToast] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      if (saved.records) setRecords(saved.records);
      if (saved.employees) setEmployees(saved.employees);
      if (saved.holidays) setHolidays(saved.holidays);
      if (saved.settings) setSettings({ ...defaultSettings, ...saved.settings });
      if (saved.scriptUrl) setScriptUrl(saved.scriptUrl);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    saveState({ records, employees, holidays, settings, scriptUrl });
  }, [records, employees, holidays, settings, scriptUrl]);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Sync from Google Sheets
  const syncFromSheets = useCallback(async (url = scriptUrl) => {
    if (!url) return;
    setSyncing(true);
    try {
      const data = await callSheets(url, 'getAll');
      if (data.records) setRecords(data.records);
      if (data.employees) setEmployees(data.employees);
      if (data.holidays && data.holidays.length) setHolidays(data.holidays);
      if (data.settings) setSettings(s => ({ ...s, ...data.settings }));
      setLastSync(new Date());
      showToast('ซิงค์ข้อมูลสำเร็จ ✓');
    } catch (e) {
      showToast('ซิงค์ล้มเหลว: ' + e.message, 'error');
    } finally {
      setSyncing(false);
    }
  }, [scriptUrl, showToast]);

  // Add OT Record
  const addRecord = useCallback(async (rec) => {
    const newRec = { ...rec, id: Date.now().toString(), createdAt: new Date().toISOString() };
    setRecords(prev => [newRec, ...prev]);
    if (scriptUrl) {
      try {
        await callSheets(scriptUrl, 'addOT', newRec);
        showToast('บันทึก OT สำเร็จ ✓');
      } catch { showToast('บันทึกใน Sheets ล้มเหลว', 'error'); }
    } else {
      showToast('บันทึก OT สำเร็จ (เฉพาะเครื่อง)');
    }
  }, [scriptUrl, showToast]);

  // Delete OT Record
  const deleteRecord = useCallback(async (id) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    if (scriptUrl) {
      try {
        await deleteFromSheets(scriptUrl, 'deleteOT', id);
      } catch {}
    }
    showToast('ลบรายการสำเร็จ');
  }, [scriptUrl, showToast]);

  // Add Employee
  const addEmployee = useCallback(async (emp) => {
    const newEmp = { ...emp, id: Date.now().toString(), active: true };
    setEmployees(prev => [...prev, newEmp]);
    if (scriptUrl) {
      try { await callSheets(scriptUrl, 'addEmployee', newEmp); } catch {}
    }
    showToast(`เพิ่มพนักงาน ${emp.name} สำเร็จ`);
  }, [scriptUrl, showToast]);

  // Delete Employee
  const deleteEmployee = useCallback(async (id) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    if (scriptUrl) {
      try { await deleteFromSheets(scriptUrl, 'deleteEmployee', id); } catch {}
    }
    showToast('ลบพนักงานสำเร็จ');
  }, [scriptUrl, showToast]);

  // Add Holiday
  const addHoliday = useCallback(async (hol) => {
    const newHol = { ...hol, id: Date.now().toString() };
    setHolidays(prev => [...prev, newHol].sort((a, b) => a.date.localeCompare(b.date)));
    if (scriptUrl) {
      try { await callSheets(scriptUrl, 'addHoliday', newHol); } catch {}
    }
    showToast('เพิ่มวันหยุดสำเร็จ');
  }, [scriptUrl, showToast]);

  // Delete Holiday
  const deleteHoliday = useCallback(async (id) => {
    setHolidays(prev => prev.filter(h => h.id !== id));
    if (scriptUrl) {
      try { await deleteFromSheets(scriptUrl, 'deleteHoliday', id); } catch {}
    }
    showToast('ลบวันหยุดสำเร็จ');
  }, [scriptUrl, showToast]);

  // Update Settings
  const updateSettings = useCallback(async (newSettings) => {
    setSettings(newSettings);
    if (scriptUrl) {
      try { await callSheets(scriptUrl, 'updateSettings', newSettings); } catch {}
    }
    showToast('บันทึกการตั้งค่าสำเร็จ');
  }, [scriptUrl, showToast]);

  const connectSheets = useCallback(async (url) => {
    setScriptUrl(url);
    await syncFromSheets(url);
  }, [syncFromSheets]);

  return {
    records, employees, holidays, settings, scriptUrl,
    syncing, lastSync, toast,
    addRecord, deleteRecord,
    addEmployee, deleteEmployee,
    addHoliday, deleteHoliday,
    updateSettings, connectSheets, syncFromSheets,
    showToast,
  };
}
