const fs = require('fs');
const path = require('path');

const inPath = path.resolve(__dirname, '../緬語字彙.txt');
const outPath = path.resolve(__dirname, '../src/data/vocab.json');

if (!fs.existsSync(inPath)) {
  console.error('找不到緬語字彙.txt，請確認檔案存在於專案根目錄。');
  process.exit(1);
}

const raw = fs.readFileSync(inPath, 'utf8');
const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

// 第一列為標頭，使用 tab 分隔
const header = lines.shift().split(/\t+/).map(h => h.replace(/\s*\(.*\)\s*$/,'').trim());

const entries = lines.map(line => {
  const cols = line.split(/\t+/);
  return {
    chinese: (cols[0]||'').trim(),
    burmese: (cols[1]||'').trim(),
    roman: (cols[2]||'').trim(),
    category: (cols[3]||'').trim() || '未分類',
    notes: (cols[4]||'').trim()
  };
}).filter(e => e.chinese || e.burmese);

// group by category into object: { categoryName: [entries...] }
const grouped = {};
entries.forEach(e => {
  const cat = e.category || '未分類';
  if (!grouped[cat]) grouped[cat] = [];
  grouped[cat].push(e);
});

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(grouped, null, 2), 'utf8');
console.log('已將', inPath, '轉換為', outPath);
