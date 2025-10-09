const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const workbookPath = path.resolve(__dirname, '../緬語字彙.xlsx');
const outPath = path.resolve(__dirname, '../src/data/vocab.json');

if (!fs.existsSync(workbookPath)) {
  console.error('找不到緬語字彙.xlsx，請確認檔案放在專案根目錄。');
  process.exit(1);
}

const wb = XLSX.readFile(workbookPath);
const sheetNames = wb.SheetNames;

const result = {};

sheetNames.forEach((name) => {
  const ws = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
  result[name] = data;
});

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
console.log('已產生', outPath);
