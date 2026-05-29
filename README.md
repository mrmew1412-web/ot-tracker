# ⏱ OT Tracker — ระบบบันทึกค่าล่วงเวลา

เว็บแอพบันทึก OT พร้อม Google Sheets + ปฏิทินวันหยุด สำหรับทีมงาน

## ✨ ฟีเจอร์

- 📋 **บันทึก OT** — เพิ่มลด ชม. OT ต่อพนักงาน
- 👥 **จัดการพนักงาน** — เพิ่ม/ลบพนักงาน กำหนดอัตรา OT รายคน
- 📅 **ปฏิทินวันหยุด** — วันหยุดนักขัตฤกษ์ไทย + กำหนดเองได้
- 💰 **คำนวณเงิน OT อัตโนมัติ** — วันธรรมดา / เสาร์-อาทิตย์ / วันหยุด
- 📊 **Dashboard** — สรุปยอด OT รายเดือน เปรียบเทียบ
- 🔗 **Google Sheets** — ซิงค์ข้อมูลออนไลน์ ใช้งานพร้อมกันได้
- 📤 **Export CSV** — ดาวน์โหลดข้อมูลเป็น Excel/CSV
- 🌐 **Deploy GitHub Pages** — เปิดใช้งานออนไลน์ฟรี

---

## 🚀 เริ่มต้นใช้งาน

### 1. ติดตั้งและ Run บนเครื่อง

```bash
npm install
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:5173`

---

## ☁️ Deploy ขึ้น GitHub Pages (ออนไลน์ฟรี)

### ขั้นตอน:

1. **สร้าง GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "first commit"
   git remote add origin https://github.com/USERNAME/ot-tracker.git
   git push -u origin main
   ```

2. **อัพเดท vite.config.js** (เปลี่ยน base ตาม repo name)
   ```js
   base: '/ot-tracker/',
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

4. **เปิดใช้งานที่:**
   ```
   https://USERNAME.github.io/ot-tracker
   ```

5. **GitHub Pages Settings:**
   - ไปที่ Settings → Pages
   - Source: Deploy from branch `gh-pages`

---

## 🔗 เชื่อมต่อ Google Sheets (ใช้พร้อมกันออนไลน์)

### ขั้นตอน:

1. เปิด [Google Sheets](https://sheets.google.com) สร้าง spreadsheet ใหม่

2. คลิก **Extensions → Apps Script**

3. ลบโค้ดเดิม วางโค้ดจาก **Settings → วิธีติดตั้ง** ในแอพ

4. คลิก **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**

5. คลิก Deploy → คัดลอก **Web app URL**

6. วาง URL ใน **Settings → เชื่อมต่อ Google Sheets**

7. ✅ ทีมงานทุกคนเข้าเว็บเดียวกัน ใช้งานพร้อมกันได้!

---

## 💡 การใช้งาน

### เพิ่มพนักงาน
- ไปที่ **พนักงาน** → เพิ่มพนักงาน
- กรอกชื่อ ตำแหน่ง อัตรา OT/ชม (ก่อนคูณอัตรา)

### บันทึก OT
- ไปที่ **บันทึก OT**
- เลือกพนักงาน วันที่ จำนวนชั่วโมง
- ระบบตรวจวันหยุดอัตโนมัติและคำนวณเงินให้

### ตั้งค่าอัตรา OT
- ไปที่ **ตั้งค่า**
- กำหนด ×1.5 วันธรรมดา, ×2 เสาร์-อาทิตย์, ×3 วันหยุด (หรือตั้งเองได้)

### เพิ่มวันหยุด
- ไปที่ **ปฏิทิน**
- คลิกวันที่ต้องการ → เพิ่มวันหยุด

---

## 🛠 Tech Stack

- **React 18** + Vite
- **Google Apps Script** (backend)
- **Google Sheets** (database)
- **GitHub Pages** (hosting)
- **localStorage** (offline fallback)

---

## 📄 License

MIT — ใช้งานและแก้ไขได้ฟรี
