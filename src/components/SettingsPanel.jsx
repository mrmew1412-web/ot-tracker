import React, { useState } from 'react';
import { Settings, Link, RefreshCw, Save, Info, Copy, ExternalLink } from 'lucide-react';
import { createAppsScriptCode } from '../utils/sheets';

export default function SettingsPanel({ settings, scriptUrl, syncing, lastSync, onSave, onConnect, onSync }) {
  const [form, setForm] = useState(settings);
  const [urlInput, setUrlInput] = useState(scriptUrl || '');
  const [showScript, setShowScript] = useState(false);
  const [copied, setCopied] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => onSave(form);

  const handleConnect = () => {
    if (urlInput) onConnect(urlInput);
  };

  const copyScript = () => {
    navigator.clipboard.writeText(createAppsScriptCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>

      {/* OT Rate Settings */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Settings size={17} color="var(--accent)" />
          <span style={{ fontWeight: 600, fontSize: 15 }}>ตั้งค่าอัตรา OT</span>
        </div>

        <div className="grid-2" style={{ gap: 14 }}>
          <div className="form-group">
            <label className="form-label">ชื่อบริษัท</label>
            <input value={form.companyName || ''} onChange={e => set('companyName', e.target.value)} placeholder="บริษัท ของฉัน จำกัด" />
          </div>
          <div className="form-group">
            <label className="form-label">สกุลเงิน</label>
            <select value={form.currency || 'THB'} onChange={e => set('currency', e.target.value)}>
              <option value="THB">THB — บาทไทย</option>
              <option value="USD">USD — ดอลลาร์สหรัฐ</option>
              <option value="SGD">SGD — ดอลลาร์สิงคโปร์</option>
              <option value="JPY">JPY — เยนญี่ปุ่น</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">อัตราค่าจ้างฐาน/ชม (บาท)</label>
            <input type="number" value={form.baseHourlyRate || 100} onChange={e => set('baseHourlyRate', parseFloat(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">อัตรา OT วันธรรมดา (×)</label>
            <input type="number" step="0.1" value={form.weekdayRate || 1.5} onChange={e => set('weekdayRate', parseFloat(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">อัตรา OT วันเสาร์-อาทิตย์ (×)</label>
            <input type="number" step="0.1" value={form.weekendRate || 2.0} onChange={e => set('weekendRate', parseFloat(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">อัตรา OT วันหยุดนักขัตฤกษ์ (×)</label>
            <input type="number" step="0.1" value={form.holidayRate || 3.0} onChange={e => set('holidayRate', parseFloat(e.target.value))} />
          </div>
        </div>

        {/* Preview */}
        <div style={{ background: 'rgba(91,141,246,0.08)', border: '1px solid rgba(91,141,246,0.2)', borderRadius: 8, padding: '12px 16px', marginTop: 16, fontSize: 13 }}>
          <div style={{ fontWeight: 500, marginBottom: 8, color: 'var(--accent)' }}>ตัวอย่างการคำนวณ (ฐาน {form.baseHourlyRate || 100} บ./ชม.):</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[['วันธรรมดา', form.weekdayRate || 1.5, 'var(--text)'], ['วันหยุดสุดสัปดาห์', form.weekendRate || 2.0, 'var(--accent2)'], ['วันหยุดนักขัตฤกษ์', form.holidayRate || 3.0, 'var(--red)']].map(([label, rate, color]) => (
              <div key={label} style={{ textAlign: 'center', padding: '8px', background: 'var(--bg3)', borderRadius: 6 }}>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontWeight: 600, color, fontSize: 15 }}>×{rate}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>{((form.baseHourlyRate || 100) * rate).toLocaleString()} บ./ชม.</div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleSave}>
          <Save size={14} /> บันทึกการตั้งค่า
        </button>
      </div>

      {/* Google Sheets */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Link size={17} color="var(--green)" />
          <span style={{ fontWeight: 600, fontSize: 15 }}>เชื่อมต่อ Google Sheets</span>
          {scriptUrl && <span className="badge badge-green">เชื่อมต่อแล้ว</span>}
        </div>

        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 16 }}>
          เชื่อมต่อกับ Google Sheets เพื่อให้ทีมงานหลายคนสามารถบันทึก OT พร้อมกันออนไลน์ได้
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="https://script.google.com/macros/s/..."
            style={{ flex: 1 }}
          />
          <button className="btn btn-green" onClick={handleConnect} disabled={!urlInput}>
            <Link size={14} /> เชื่อมต่อ
          </button>
          {scriptUrl && (
            <button className="btn btn-ghost" onClick={() => onSync()} disabled={syncing}>
              <RefreshCw size={14} className={syncing ? 'spin' : ''} />
              {syncing ? 'กำลังซิงค์...' : 'ซิงค์'}
            </button>
          )}
        </div>

        {lastSync && (
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 8 }}>
            ซิงค์ล่าสุด: {lastSync.toLocaleTimeString('th-TH')}
          </div>
        )}

        {/* Script code section */}
        <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowScript(!showScript)}>
            <Info size={14} /> {showScript ? 'ซ่อน' : 'ดู'} วิธีติดตั้ง Google Apps Script
          </button>

          {showScript && (
            <div style={{ marginTop: 16 }}>
              <ol style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 2, paddingLeft: 20 }}>
                <li>เปิด Google Sheets ใหม่ที่ <a href="https://sheets.google.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>sheets.google.com</a></li>
                <li>คลิก <strong style={{ color: 'var(--text)' }}>Extensions → Apps Script</strong></li>
                <li>ลบโค้ดเดิม แล้ววางโค้ดด้านล่างนี้</li>
                <li>คลิก <strong style={{ color: 'var(--text)' }}>Deploy → New deployment</strong></li>
                <li>เลือก Type = <strong style={{ color: 'var(--text)' }}>Web app</strong>, Execute as = <strong style={{ color: 'var(--text)' }}>Me</strong>, Who has access = <strong style={{ color: 'var(--text)' }}>Anyone</strong></li>
                <li>คลิก <strong style={{ color: 'var(--text)' }}>Deploy</strong> แล้วคัดลอก URL มาวางด้านบน</li>
              </ol>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text2)' }}>Apps Script Code:</span>
                <button className="btn btn-ghost btn-sm" onClick={copyScript}>
                  <Copy size={12} /> {copied ? 'คัดลอกแล้ว ✓' : 'คัดลอก'}
                </button>
              </div>
              <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 12, fontSize: 11, fontFamily: 'monospace', color: 'var(--green)', overflowX: 'auto', maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)' }}>
                <pre>{createAppsScriptCode()}</pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GitHub deployment */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <ExternalLink size={17} color="var(--purple)" />
          <span style={{ fontWeight: 600, fontSize: 15 }}>Deploy ขึ้น GitHub Pages</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 2 }}>
          วิธี deploy เว็บแอพนี้ขึ้น GitHub Pages เพื่อให้ทีมใช้งานออนไลน์ได้:
        </div>
        <div style={{ marginTop: 12, background: 'var(--bg)', borderRadius: 8, padding: 14, fontSize: 12, fontFamily: 'monospace', color: 'var(--text)', border: '1px solid var(--border)', lineHeight: 2.2 }}>
          <div><span style={{ color: 'var(--text2)' }}># 1. สร้าง GitHub repo และ push โค้ด</span></div>
          <div>git init && git add . && git commit -m "init"</div>
          <div>git remote add origin https://github.com/USERNAME/ot-tracker.git</div>
          <div>git push -u origin main</div>
          <div><span style={{ color: 'var(--text2)' }}># 2. ติดตั้ง dependencies</span></div>
          <div>npm install</div>
          <div><span style={{ color: 'var(--text2)' }}># 3. Deploy ไปยัง GitHub Pages</span></div>
          <div>npm run deploy</div>
          <div><span style={{ color: 'var(--text2)' }}># 4. เว็บจะพร้อมใช้ที่:</span></div>
          <div style={{ color: 'var(--green)' }}>https://USERNAME.github.io/ot-tracker</div>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text2)' }}>
          * ต้องมี Node.js และ Git ติดตั้งบนเครื่อง · ใช้งานได้ฟรีบน GitHub Pages
        </div>
      </div>
    </div>
  );
}
