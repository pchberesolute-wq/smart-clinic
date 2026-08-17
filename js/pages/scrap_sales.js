// js/pages/scrap_sales.js
// 🚀 Enterprise Scrap Sales Projection V9.0: Omni-Search Engine & Universal Date Parser

class ScrapSalesPageComponent {
    constructor() {
        this.currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        this.aggregatedData = {}; 
        this.firebaseListeners = [];
        this.thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
        
        // 🚨 Config Database Path ของบัญชีภายใน
        this.LEDGER_SETTINGS_PATH = 'clinic_ledger_settings_v2/categories';
        this.LEDGER_DB_PATH = 'clinic_department_ledger_v2'; 
        
        this.categoryName = "ขายเศษซากวัสดุ"; 
        this.categoryId = null; 
    }

    get html() {
        return `
            <style>
                .scrap-panel { background: var(--bg-surface); border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid var(--border-color); padding: 25px; }
                
                .excel-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-family: 'Sarabun', sans-serif; font-size: 15px; }
                .excel-table th, .excel-table td { border: 1px solid #000000; padding: 0; vertical-align: middle; }
                .excel-table th { background-color: #fef08a; color: #000000; font-weight: 700; text-align: center; padding: 10px; font-size: 14px; position: sticky; top: 0; z-index: 10; outline: 1px solid #000; }
                
                .excel-cell-display { 
                    width: 100%; height: 100%; min-height: 38px; display: flex; align-items: center;
                    padding: 8px 12px; color: var(--text-dark); font-family: 'Sarabun', sans-serif; font-size: 15px;
                }
                .excel-cell-num { text-align: center; font-weight: 700; background: var(--bg-body); color: var(--text-dark); }
                .excel-cell-money { justify-content: flex-end; font-weight: 700; color: #059669; }
                .excel-cell-text { justify-content: flex-start; }
                .cell-empty { color: var(--text-muted); opacity: 0.3; }
                
                .excel-footer { background-color: var(--bg-body); font-weight: 700; color: var(--text-dark); }
                .excel-footer td { padding: 12px 15px; font-size: 16px; }

                .doc-title { text-align: center; font-family: 'Sarabun', sans-serif; color: var(--text-dark); margin-bottom: 25px; line-height: 1.5; }
                .doc-title h3 { font-size: 20px; font-weight: 700; margin: 0; }
                .doc-title h4 { font-size: 18px; font-weight: 600; margin: 0; }
                .doc-title h5 { font-size: 16px; font-weight: 600; margin: 0; }
                
                html[data-bs-theme="dark"] .excel-table th, html[data-bs-theme="dark"] .excel-table td { border-color: #475569; }
                html[data-bs-theme="dark"] .excel-table th { background-color: #ca8a04; outline-color: #475569; color: #fff;}
            </style>

            <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 class="page-title" style="font-weight: 800; color: var(--text-dark);">
                        <div class="d-inline-flex align-items-center justify-content-center rounded-4 shadow-sm me-2" style="width: 45px; height: 45px; background: linear-gradient(135deg, #14b8a6, #047857); color: white;">
                            <i class="fa-solid fa-recycle"></i>
                        </div>
                        <span class="dynamic-category-title">สรุปการขายเศษซากวัสดุ</span> <span class="text-muted fw-normal" style="font-size: 20px;">(Scrap Sales)</span>
                    </h2>
                    <div class="mt-2 text-primary small fw-bold">
                        <i class="fa-solid fa-link me-1"></i> ดึงข้อมูลอัตโนมัติจาก: ระบบบัญชีภายในหน่วยงาน (SSOT)
                    </div>
                </div>
                <div class="d-flex gap-2 align-items-center flex-wrap">
                    <div class="px-3 py-2 rounded-pill shadow-sm border border-2 d-flex align-items-center bg-surface" style="border-color: #10b981 !important;">
                        <i class="fa-regular fa-calendar text-success me-2"></i>
                        <input type="month" id="scrap-month-picker" class="border-0 fw-bold text-success bg-transparent" style="outline: none; font-size: 15px;" onchange="window.ScrapSalesPage.changeMonth(this.value)">
                    </div>
                    <button class="btn btn-dark fw-bold shadow-sm rounded-pill px-4" onclick="window.ScrapSalesPage.printLedger()">
                        <i class="fa-solid fa-print me-1"></i> พิมพ์หน้าปัจจุบัน
                    </button>
                    <button class="btn btn-success fw-bold shadow-sm rounded-pill px-4" onclick="window.ScrapSalesPage.exportToExcel()">
                        <i class="fa-solid fa-file-excel me-1"></i> โหลด Excel (12 เดือน)
                    </button>
                </div>
            </div>

            <div class="scrap-panel position-relative overflow-hidden" style="max-width: 1000px; margin: 0 auto; border-top: 5px solid #10b981;">
                <div class="doc-title" id="doc-title-container">
                    <h3 id="doc-main-title">รายการสรุปการขายเศษซากวัสดุ</h3>
                    <h4>หน่วยไตเทียมโรงพยาบาลแพร่คริสเตียน</h4>
                    <h5 id="doc-month-title">ประจำเดือน ...</h5>
                </div>

                <div class="table-responsive" style="max-height: 65vh; overflow-y: auto; border: 1px solid var(--border-color);">
                    <table class="excel-table" id="scrap-table">
                        <thead>
                            <tr>
                                <th style="width: 8%;">ลำดับ</th>
                                <th style="width: 15%;">วัน/เดือน/ปี</th>
                                <th style="width: 25%;">จำนวนเงิน</th>
                                <th style="width: 52%;">หมายเหตุ (อ้างอิงจากบัญชี)</th>
                            </tr>
                        </thead>
                        <tbody id="scrap-table-body">
                            <tr><td colspan="4" class="text-center py-5"><i class="fas fa-spinner fa-spin fa-2x text-success mb-3"></i><br>กำลังดึงข้อมูล...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    async init() {
        if (typeof db === 'undefined') return;
        window.ScrapSalesPage = this;
        document.getElementById('scrap-month-picker').value = this.currentMonth;
        
        await this.fetchLedgerCategoryAsync();
        this.loadLedgerProjection();
    }

    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
    }

    fetchLedgerCategoryAsync() {
        return new Promise((resolve) => {
            const cb = db.ref(this.LEDGER_SETTINGS_PATH).on('value', snap => {
                const data = snap.val();
                let matchedName = "ขายเศษซากวัสดุ";
                let matchedId = null;

                if (data) {
                    const keys = Object.keys(data);
                    for (let key of keys) {
                        let c = data[key];
                        if (c && typeof c === 'object' && ((c.name||'').includes('ซาก') || (c.label||'').includes('ซาก'))) {
                            matchedName = c.name || c.label;
                            matchedId = c.id || key; 
                            break;
                        }
                    }
                }

                this.categoryName = matchedName;
                this.categoryId = matchedId;

                document.querySelectorAll('.dynamic-category-title').forEach(el => el.innerText = `สรุป${this.categoryName}`);
                const mainTitle = document.getElementById('doc-main-title');
                if (mainTitle) mainTitle.innerText = `รายการสรุป${this.categoryName}`;
                
                resolve();
            });

            this.firebaseListeners.push({ path: this.LEDGER_SETTINGS_PATH, callback: cb });
        });
    }

    // 🚀 THE FIX 1: ฟังจาก ROOT ของ Ledger เพื่อดักจับทุกโครงสร้าง
    loadLedgerProjection() {
        const parts = this.currentMonth.split('-');
        const monthName = this.thaiMonths[parseInt(parts[1]) - 1];
        const yearTh = parseInt(parts[0]) + 543;
        
        const titleEl = document.getElementById('doc-month-title');
        if (titleEl) titleEl.innerText = `ประจำเดือน ${monthName} ${yearTh}`;
        
        const tbody = document.getElementById('scrap-table-body');
        if (tbody) tbody.innerHTML = `<tr><td colspan="4" class="text-center py-5"><i class="fas fa-spinner fa-spin fa-2x text-success mb-3"></i><br>กำลังประมวลผลข้อมูลจากระบบบัญชี...</td></tr>`;

        // 🚨 ดึง ROOT ของบัญชีทั้งหมด เพื่อป้องกัน Schema Mismatch
        const path = this.LEDGER_DB_PATH;
        const cb = db.ref(path).on('value', snap => {
            const ledgerData = snap.val() || {};
            
            // ใช้ Omni-Search แกะกล่องหา Transaction ทั้งหมด
            const allEntries = this.deepFindTransactions(ledgerData);
            
            // โยนเข้า Aggregator เพื่อกรองเอาเฉพาะเดือนนี้และหมวดซากวัสดุ
            this.aggregatedData = this.aggregateLedgerData(allEntries, parts[0], parts[1]);
            
            this.renderTable();
        });
        
        this.firebaseListeners.push({ path: path, callback: cb });
    }

    // 🚀 THE ULTIMATE FIX 2: Omni-Search Engine (มุดหา Transaction ทะลุทุก Node)
    deepFindTransactions(obj) {
        let entries = [];
        if (!obj || typeof obj !== 'object') return entries;

        // เช็คว่า Node นี้เป็น Transaction ไหม (ต้องมี วันที่ และ ยอดเงิน)
        const hasDate = ('date' in obj || 'timestamp' in obj || 'datetime' in obj || 'createdAt' in obj);
        const hasAmount = ('income' in obj || 'in' in obj || 'amount' in obj || 'total' in obj || 'in_amount' in obj);

        if (hasDate && hasAmount) {
            entries.push(obj);
            return entries; // เจอแล้ว ดึงกลับเลย ไม่ต้องมุดลึกกว่านี้
        }

        // ถ้ายิ่งไม่ใช่ ให้มุดลงไปใน Object ลูก
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (typeof obj[key] === 'object') {
                    entries = entries.concat(this.deepFindTransactions(obj[key]));
                }
            }
        }
        return entries;
    }

    // 🚀 กรองข้อมูลและแปลงวันที่แบบ Universal
    aggregateLedgerData(allEntries, targetYear, targetMonth) {
        let result = {};
        
        allEntries.forEach(tx => {
            if (!tx) return;

            // 1. 🕵️‍♂️ Fuzzy Matcher (แสกนคำว่า 'ซาก' หรือ 'วัสดุ')
            const catStr = String(tx.category || tx.categoryName || tx.categoryId || tx.type || '').toLowerCase();
            const titleStr = String(tx.title || tx.name || tx.detail || tx.description || tx.list || tx.item || '').toLowerCase();

            const isMatch = catStr.includes('ซาก') || catStr.includes('วัสดุ') ||
                            titleStr.includes('ซาก') || titleStr.includes('วัสดุ') ||
                            (this.categoryId && tx.categoryId === this.categoryId);

            if (!isMatch) return; // ไม่ใช่ซากวัสดุ ข้ามไป

            // 2. 📅 Universal Date Parser
            let txY = null, txM = null, txD = 1;
            let rawDate = tx.date || tx.datetime || tx.createdAt || tx.timestamp || '';

            if (typeof rawDate === 'number') {
                let d = new Date(rawDate);
                txY = d.getFullYear();
                txM = String(d.getMonth() + 1).padStart(2, '0');
                txD = d.getDate();
            } else {
                let s = String(rawDate);
                if (s.includes('/')) { 
                    // ฟอร์แมต DD/MM/YYYY หรือ DD/MM/YY
                    let p = s.split('/');
                    if (p.length >= 3) {
                        txD = parseInt(p[0]);
                        txM = p[1].padStart(2, '0');
                        txY = parseInt(p[2]);
                        if (txY > 2500) txY -= 543; // แปลงปีไทยเป็น ค.ศ.
                    }
                } else if (s.includes('-')) {
                    // ฟอร์แมต YYYY-MM-DD
                    let p = s.split('-');
                    if (p.length >= 3) {
                        txY = parseInt(p[0]);
                        if (txY > 2500) txY -= 543;
                        txM = p[1].padStart(2, '0');
                        txD = parseInt(p[2].split(' ')[0]);
                    }
                }
            }

            // ถ้าเดือน/ปี ไม่ตรงกับเดือนที่เลือกในปฏิทิน ให้ข้ามไป
            if (String(txY) !== String(targetYear) || String(txM) !== String(targetMonth)) return;

            // 3. 💰 ดึงยอดรายรับและหมายเหตุ
            let dayKey = String(txD).padStart(2, '0');
            let amt = Number(tx.income || tx.in || tx.in_amount || tx.amount || tx.total || tx.receive || 0);

            if (!result[dayKey]) {
                result[dayKey] = { amount: 0, remark: [] };
            }
            
            result[dayKey].amount += amt;
            
            let rmk = String(tx.remark || tx.note || tx.detail || '').trim();
            if (rmk !== '' && rmk !== '-' && !result[dayKey].remark.includes(rmk)) {
                result[dayKey].remark.push(rmk);
            }
        });

        // ยุบรวมหมายเหตุด้วยเครื่องหมาย +
        Object.keys(result).forEach(key => {
            result[key].remark = result[key].remark.join(' + ');
        });

        return result;
    }

    changeMonth(newMonth) {
        if(!newMonth || this.currentMonth === newMonth) return;
        this.currentMonth = newMonth;
        
        this.firebaseListeners = this.firebaseListeners.filter(l => {
            if (l.path.includes(this.LEDGER_DB_PATH)) {
                db.ref(l.path).off('value', l.callback);
                return false;
            }
            return true;
        });
        
        this.loadLedgerProjection();
    }

    getDaysInMonth(year, month) { return new Date(year, month, 0).getDate(); }

    renderTable() {
        const tbody = document.getElementById('scrap-table-body');
        if (!tbody) return;

        const parts = this.currentMonth.split('-');
        const y = parts[0];
        const m = parts[1];
        const daysInMonth = this.getDaysInMonth(parseInt(y), parseInt(m));
        const yearTh = (parseInt(y) + 543).toString().slice(-2); 

        let html = '';
        let totalAmount = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            let dayKey = String(day).padStart(2, '0');
            let data = this.aggregatedData[dayKey] || { amount: 0, remark: '' };
            
            let amountVal = Number(data.amount) || 0;
            totalAmount += amountVal;

            let dateStr = `${dayKey}/${m}/${yearTh}`;
            let displayAmt = amountVal > 0 ? amountVal.toLocaleString('th-TH', {minimumFractionDigits: 2}) : '<span class="cell-empty">-</span>';
            let displayRmk = data.remark !== '' ? this.escapeHTML(data.remark) : '<span class="cell-empty">-</span>';
            
            html += `
            <tr>
                <td class="excel-cell-num">${day}</td>
                <td class="text-center" style="color: var(--text-dark);">${dateStr}</td>
                <td><div class="excel-cell-display excel-cell-money">${displayAmt}</div></td>
                <td><div class="excel-cell-display excel-cell-text">${displayRmk}</div></td>
            </tr>`;
        }

        html += `
            <tr class="excel-footer">
                <td colspan="2" class="text-center">รวมเป็นเงินทั้งสิ้น</td>
                <td class="text-end" style="color: #10b981; text-decoration: underline double;">
                    <span id="scrap-grand-total">${totalAmount > 0 ? totalAmount.toLocaleString('th-TH', {minimumFractionDigits: 2}) : '-'}</span>
                </td>
                <td class="text-center">บาท</td>
            </tr>
        `;

        tbody.innerHTML = html;
    }

    printLedger() {
        const titleContainer = document.getElementById('doc-title-container');
        const titleHtml = titleContainer ? titleContainer.outerHTML : '';
        
        const parts = this.currentMonth.split('-');
        const y = parts[0];
        const m = parts[1];
        const daysInMonth = this.getDaysInMonth(parseInt(y), parseInt(m));
        const yearTh = (parseInt(y) + 543).toString().slice(-2);

        let trs = '';
        let grandTotal = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            let dayKey = String(day).padStart(2, '0');
            let data = this.aggregatedData[dayKey] || { amount: 0, remark: '' };
            
            let numAmt = Number(data.amount) || 0;
            grandTotal += numAmt;

            trs += `
                <tr>
                    <td style="border:1px solid #000; padding:6px; text-align:center;">${day}</td>
                    <td style="border:1px solid #000; padding:6px; text-align:center;">${dayKey}/${m}/${yearTh}</td>
                    <td style="border:1px solid #000; padding:6px; text-align:right;">${numAmt > 0 ? numAmt.toLocaleString('th-TH', {minimumFractionDigits: 2}) : ''}</td>
                    <td style="border:1px solid #000; padding:6px;">${this.escapeHTML(data.remark)}</td>
                </tr>
            `;
        }

        trs += `
            <tr style="font-weight: bold;">
                <td colspan="2" style="border:1px solid #000; padding:10px; text-align:center;">รวมเป็นเงินทั้งสิ้น</td>
                <td style="border:1px solid #000; padding:10px; text-align:right; text-decoration: underline double;">
                    ${grandTotal > 0 ? grandTotal.toLocaleString('th-TH', {minimumFractionDigits: 2}) : '-'}
                </td>
                <td style="border:1px solid #000; padding:10px; text-align:center;">บาท</td>
            </tr>
        `;

        let printHtml = `
            <div style="width: 100%; max-width: 800px; margin: 0 auto;">
                <style>
                    .doc-title { text-align: center; font-family: 'Sarabun', sans-serif; color: #000000; margin-bottom: 20px; line-height: 1.5; }
                    .doc-title h3 { font-size: 18px; font-weight: 700; margin: 0; }
                    .doc-title h4 { font-size: 16px; font-weight: 600; margin: 0; }
                    .doc-title h5 { font-size: 14px; font-weight: 600; margin: 0; }
                </style>
                ${titleHtml}
                <table style="width: 100%; border-collapse: collapse; font-family: 'Sarabun', sans-serif; font-size: 14px;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #000; background-color: #fde047 !important; color: #000; padding: 8px; width: 8%; -webkit-print-color-adjust: exact; print-color-adjust: exact;">ลำดับ</th>
                            <th style="border: 1px solid #000; background-color: #fde047 !important; color: #000; padding: 8px; width: 15%; -webkit-print-color-adjust: exact; print-color-adjust: exact;">วัน/เดือน/ปี</th>
                            <th style="border: 1px solid #000; background-color: #fde047 !important; color: #000; padding: 8px; width: 25%; -webkit-print-color-adjust: exact; print-color-adjust: exact;">จำนวนเงิน</th>
                            <th style="border: 1px solid #000; background-color: #fde047 !important; color: #000; padding: 8px; width: 52%; -webkit-print-color-adjust: exact; print-color-adjust: exact;">หมายเหตุ</th>
                        </tr>
                    </thead>
                    <tbody>${trs}</tbody>
                </table>
            </div>
        `;

        let iframe = document.createElement('iframe'); 
        iframe.style.position = 'fixed'; iframe.style.right = '0'; iframe.style.bottom = '0'; 
        iframe.style.width = '1px'; iframe.style.height = '1px'; iframe.style.border = '0'; 
        document.body.appendChild(iframe);
        let doc = iframe.contentWindow.document; 
        doc.open(); 
        doc.write(`
            <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Scrap Sales</title>
            <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
            <style>@page { size: A4 portrait; margin: 15mm; } body { background: #fff; margin: 0; padding: 0; color: #000; }</style>
            </head><body>${printHtml}</body></html>
        `); 
        doc.close();

        if(typeof Swal !== 'undefined') Swal.fire({ title: 'กำลังเตรียมเอกสาร...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        iframe.onload = () => {
            if(typeof Swal !== 'undefined') Swal.close();
            try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch(e) {}
            setTimeout(() => iframe.remove(), 60000); 
        };
    }

    exportToExcel() {
        if(typeof ExcelJS === 'undefined') {
            if(typeof Swal !== 'undefined') Swal.fire({ title: 'กำลังโหลด Excel Engine...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js';
            script.onload = () => { if(typeof Swal !== 'undefined') Swal.close(); this._exportToExcelLogic(); };
            document.head.appendChild(script);
            return;
        }
        this._exportToExcelLogic();
    }

    // 🚀 THE ULTIMATE FIX 3: โหลด Excel 12 แท็บ ให้ดึงจาก ROOT ของ Ledger ครั้งเดียว (O(1) Fetch)
    async _exportToExcelLogic() {
        if(typeof Swal !== 'undefined') Swal.fire({ title: 'กำลังรวบรวมข้อมูลทั้งปี (12 แท็บ)...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        try {
            const workbook = new ExcelJS.Workbook();
            
            const parts = this.currentMonth.split('-');
            const yearStr = parts[0];
            const currentMonthIndex = parseInt(parts[1]); 
            const yearTh = parseInt(yearStr) + 543;
            const yearThShort = yearTh.toString().slice(-2);

            // ดึงบัญชี ROOT แค่ 1 ครั้ง ประหยัดเน็ตสุดๆ
            const snap = await db.ref(this.LEDGER_DB_PATH).once('value');
            const rawLedgerData = snap.val() || {};
            const allEntries = this.deepFindTransactions(rawLedgerData); // หา Transaction ทั้งหมด
            
            for (let m = 1; m <= 12; m++) {
                let mStr = String(m).padStart(2, '0');
                let monthName = this.thaiMonths[m - 1];
                let daysInMonth = this.getDaysInMonth(parseInt(yearStr), m);
                
                // กรองเฉพาะเดือนนี้
                let monthAggregatedData = this.aggregateLedgerData(allEntries, yearStr, mStr);

                const sheet = workbook.addWorksheet(mStr, { views: [{ showGridLines: false }] });

                sheet.mergeCells('A1:D1');
                sheet.getCell('A1').value = `รายการสรุป${this.categoryName}`;
                sheet.getCell('A1').font = { name: 'Tahoma', size: 14, bold: true };
                sheet.getCell('A1').alignment = { horizontal: 'center' };

                sheet.mergeCells('A2:D2');
                sheet.getCell('A2').value = 'หน่วยไตเทียมโรงพยาบาลแพร่คริสเตียน';
                sheet.getCell('A2').font = { name: 'Tahoma', size: 12, bold: true };
                sheet.getCell('A2').alignment = { horizontal: 'center' };

                sheet.mergeCells('A3:D3');
                sheet.getCell('A3').value = `ประจำเดือน ${monthName} ${yearTh}`;
                sheet.getCell('A3').font = { name: 'Tahoma', size: 11, bold: true };
                sheet.getCell('A3').alignment = { horizontal: 'center' };

                sheet.columns = [ { width: 8 }, { width: 15 }, { width: 25 }, { width: 50 } ];

                const headerRow = sheet.addRow(["ลำดับ", "วัน/เดือน/ปี", "จำนวนเงิน", "หมายเหตุ"]);
                headerRow.height = 25;
                headerRow.eachCell((cell) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF000' } };
                    cell.font = { name: 'Tahoma', bold: true, color: { argb: 'FF000000' } };
                    cell.border = { top:{style:'thin'}, bottom:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'} };
                    cell.alignment = { horizontal: 'center', vertical: 'middle' };
                });

                let grandTotal = 0;

                for (let day = 1; day <= daysInMonth; day++) {
                    let dayKey = String(day).padStart(2, '0');
                    let data = monthAggregatedData[dayKey] || { amount: 0, remark: '' };
                    
                    let numAmt = Number(data.amount) || 0;
                    grandTotal += numAmt;

                    const row = sheet.addRow([day, `${dayKey}/${mStr}/${yearThShort}`, numAmt > 0 ? numAmt : '', data.remark || '']);

                    row.eachCell((cell, colNum) => {
                        cell.font = { name: 'Tahoma', size: 11 };
                        cell.border = { top:{style:'thin'}, bottom:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'} };
                        if(colNum === 3) { cell.numFmt = '#,##0.00'; cell.alignment = { horizontal: 'right' }; } 
                        else if (colNum === 4) { cell.alignment = { horizontal: 'left', indent: 1 }; } 
                        else { cell.alignment = { horizontal: 'center' }; }
                    });
                }

                const footerRow = sheet.addRow(['รวมเป็นเงินทั้งสิ้น', '', grandTotal > 0 ? grandTotal : '-', 'บาท']);
                sheet.mergeCells(`A${footerRow.number}:B${footerRow.number}`);
                
                footerRow.eachCell((cell, colNum) => {
                    cell.font = { name: 'Tahoma', size: 12, bold: true };
                    cell.alignment = { horizontal: 'center' };
                    if (colNum === 3) {
                        cell.numFmt = '#,##0.00';
                        cell.alignment = { horizontal: 'right' };
                        cell.border = { bottom: { style: 'double' } }; 
                    }
                });
            }

            workbook.views = [{ activeTab: currentMonthIndex - 1 }];

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `ScrapSales_Year_${yearStr}.xlsx`;
            
            if(typeof Swal !== 'undefined') Swal.close();
            setTimeout(() => { document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(link.href); }, 500);

        } catch (error) { if(typeof Swal !== 'undefined') Swal.fire('ข้อผิดพลาด', error.message, 'error'); }
    }

    escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
}

console.log("[Module Status] Loading Scrap Sales Module...");
window.ScrapSalesPage = new ScrapSalesPageComponent();

if (typeof window.App !== 'undefined') {
    if (!window.App.pages) window.App.pages = {};
    window.App.pages.scrap_sales = window.ScrapSalesPage;
}
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.App !== 'undefined' && window.App.pages) {
        window.App.pages.scrap_sales = window.ScrapSalesPage;
    }
});
console.log("[Module Status] Scrap Sales Module Ready and Injected!");