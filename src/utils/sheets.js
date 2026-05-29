// Google Sheets API utility
// ใช้ Google Apps Script Web App เป็น backend

export const createAppsScriptCode = () => `
// วางโค้ดนี้ใน Google Apps Script แล้ว Deploy เป็น Web App
// ตั้งค่า: Execute as "Me", Who has access "Anyone"

const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const params = e.parameter;
  const action = params.action;
  let result;

  try {
    switch(action) {
      case 'getAll': result = getAllData(); break;
      case 'addOT': result = addOTRecord(JSON.parse(params.data)); break;
      case 'deleteOT': result = deleteOTRecord(params.id); break;
      case 'updateSettings': result = updateSettings(JSON.parse(params.data)); break;
      case 'getSettings': result = getSettings(); break;
      case 'addEmployee': result = addEmployee(JSON.parse(params.data)); break;
      case 'deleteEmployee': result = deleteEmployee(params.id); break;
      case 'addHoliday': result = addHoliday(JSON.parse(params.data)); break;
      case 'deleteHoliday': result = deleteHoliday(params.id); break;
      default: result = { error: 'Unknown action' };
    }
  } catch(err) {
    result = { error: err.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getAllData() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  return {
    records: getSheetData(ss, 'OT_Records'),
    employees: getSheetData(ss, 'Employees'),
    holidays: getSheetData(ss, 'Holidays'),
    settings: getSettingsData(ss)
  };
}

function getSheetData(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    return [];
  }
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function addOTRecord(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName('OT_Records');
  if (!sheet) {
    sheet = ss.insertSheet('OT_Records');
    sheet.appendRow(['id','employeeId','employeeName','date','hours','rate','total','note','type','createdAt']);
  }
  const id = Date.now().toString();
  sheet.appendRow([id, data.employeeId, data.employeeName, data.date, data.hours, data.rate, data.total, data.note, data.type, new Date().toISOString()]);
  return { success: true, id };
}

function deleteOTRecord(id) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('OT_Records');
  if (!sheet) return { success: false };
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) { sheet.deleteRow(i + 1); return { success: true }; }
  }
  return { success: false };
}

function addEmployee(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName('Employees');
  if (!sheet) {
    sheet = ss.insertSheet('Employees');
    sheet.appendRow(['id','name','position','hourlyRate','otRate','active']);
  }
  const id = Date.now().toString();
  sheet.appendRow([id, data.name, data.position, data.hourlyRate, data.otRate, true]);
  return { success: true, id };
}

function deleteEmployee(id) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Employees');
  if (!sheet) return { success: false };
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) { sheet.deleteRow(i + 1); return { success: true }; }
  }
  return { success: false };
}

function addHoliday(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName('Holidays');
  if (!sheet) {
    sheet = ss.insertSheet('Holidays');
    sheet.appendRow(['id','date','name','type']);
  }
  const id = Date.now().toString();
  sheet.appendRow([id, data.date, data.name, data.type]);
  return { success: true, id };
}

function deleteHoliday(id) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Holidays');
  if (!sheet) return { success: false };
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) { sheet.deleteRow(i + 1); return { success: true }; }
  }
  return { success: false };
}

function getSettings() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  return { settings: getSettingsData(ss) };
}

function getSettingsData(ss) {
  let sheet = ss.getSheetByName('Settings');
  if (!sheet) return { weekdayRate: 1.5, weekendRate: 2, holidayRate: 3, currency: 'THB' };
  const data = sheet.getDataRange().getValues();
  const obj = {};
  data.forEach(row => { if (row[0]) obj[row[0]] = row[1]; });
  return obj;
}

function updateSettings(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName('Settings');
  if (!sheet) sheet = ss.insertSheet('Settings');
  sheet.clearContents();
  Object.entries(data).forEach(([k, v]) => sheet.appendRow([k, v]));
  return { success: true };
}
`;

// ฟังก์ชันเรียก Apps Script
export async function callSheets(scriptUrl, action, data = null) {
  if (!scriptUrl) return null;
  const params = new URLSearchParams({ action });
  if (data) params.append('data', JSON.stringify(data));
  const url = `${scriptUrl}?${params.toString()}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json;
}

export async function deleteFromSheets(scriptUrl, action, id) {
  if (!scriptUrl) return null;
  const params = new URLSearchParams({ action, id });
  const url = `${scriptUrl}?${params.toString()}`;
  const res = await fetch(url);
  return res.json();
}
