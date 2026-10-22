/**
 * File Parser (Excel & CSV)
 * Reads .xlsx, .xls, .csv files and normalizes column headers using alias matching.
 */
window.FileParser = {
  // Alias matching table
  COLUMN_ALIASES: {
    id: ['연번', '순번', 'no', 'num', 'id', '번호'],
    category: ['분야 (중점영역)', '분야', '중점영역', '부문', '영역', '카테고리', '분야명'],
    projectName: ['세부 사업 / 주요 지표', '세부 사업', '세부사업', '사업명', '주요 지표', '주요지표', '프로젝트'],
    department: ['소관 부서', '소관부서', '담당부서', '부서', '소관', '담당'],
    unit: ['구분/단위', '단위', '구분', '단위(원)'],
    val2026: ['2026년 (A)', '2026년', '2026', '전년도', '전년예산', 'A', '2026(A)'],
    val2027: ['2027년 정부안 (B)', '2027년 정부안', '2027년', '2027', '정부안', '당해예산', 'B', '2027(B)'],
    diff: ['증감 (B-A)', '증감', '증감액', '변동액', 'B-A', '증감(B-A)'],
    growthRate: ['증가율 (%)', '증가율', '증감율', '증감률', '증가율(%)', '%'],
    description: ['핵심 내용 및 보도자료 박스 원문 근거', '핵심 내용', '보도자료 박스', '원문 근거', '핵심내용', '보도자료', '원문근거', '비고', '사업내용', '내용']
  },

  /**
   * Find canonical field name for a given header
   */
  matchColumnKey(header) {
    if (!header) return null;
    const clean = String(header).trim().replace(/\s+/g, ' ');
    for (const [key, aliases] of Object.entries(this.COLUMN_ALIASES)) {
      for (const alias of aliases) {
        if (clean.toLowerCase() === alias.toLowerCase() || clean.includes(alias)) {
          return key;
        }
      }
    }
    return null;
  },

  /**
   * Clean numeric string values
   */
  cleanNumber(val) {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const cleaned = String(val).replace(/,/g, '').replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  },

  /**
   * Parse Excel File (.xlsx, .xls)
   */
  async parseExcel(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

          if (!jsonData || jsonData.length < 2) {
            throw new Error('파일에 데이터 행이 부족합니다.');
          }

          const records = this.transformHeaderRows(jsonData);
          resolve(records);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsArrayBuffer(file);
    });
  },

  /**
   * Parse CSV File (.csv)
   */
  async parseCSV(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
          const rows = lines.map(line => this.parseCSVLine(line));
          const records = this.transformHeaderRows(rows);
          resolve(records);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('CSV 파일 읽기 실패'));
      reader.readAsText(file, 'utf-8');
    });
  },

  /**
   * Safe CSV comma splitting respecting quotes
   */
  parseCSVLine(text) {
    const p = [/\s*,\s*/];
    const result = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        result.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    }
    result.push(cur);
    return result.map(s => s.replace(/^"|"$/g, '').trim());
  },

  /**
   * Convert matrix (header row + data rows) into structured records
   */
  transformHeaderRows(rows) {
    // Find header row (the first row containing at least one recognizable budget keyword)
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      const rowStr = rows[i].join(' ').toLowerCase();
      if (rowStr.includes('분야') || rowStr.includes('사업') || rowStr.includes('2026') || rowStr.includes('2027')) {
        headerRowIndex = i;
        break;
      }
    }

    const headers = rows[headerRowIndex];
    const columnMap = {};

    headers.forEach((h, colIndex) => {
      const key = this.matchColumnKey(h);
      if (key) {
        columnMap[colIndex] = key;
      }
    });

    const records = [];
    for (let r = headerRowIndex + 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.every(cell => String(cell).trim() === '')) continue;

      const record = {};
      row.forEach((cellVal, colIndex) => {
        const key = columnMap[colIndex];
        if (key) {
          if (key === 'val2026' || key === 'val2027' || key === 'diff' || key === 'growthRate') {
            record[key] = this.cleanNumber(cellVal);
          } else {
            record[key] = String(cellVal).trim();
          }
        }
      });

      // Valid record check: must have at least project name or category
      if (record.projectName || record.category) {
        records.push(record);
      }
    }

    return records;
  }
};
