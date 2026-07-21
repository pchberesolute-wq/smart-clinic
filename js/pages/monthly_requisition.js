// js/pages/monthly_requisition.js
// 👑 Enterprise Monthly Requisition: Perfect Print Replica & ExcelJS Engine

class MonthlyRequisitionPageComponent {
    constructor() {
        this.syncedItems = [];
    }

    get html() {
        return `
            <style>
                .req-header-ui { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 25px; border-radius: 16px; margin-bottom: 20px; box-shadow: 0 10px 25px -5px rgba(234, 88, 12, 0.3); display: flex; justify-content: space-between; align-items: center; } 
                .req-table-wrapper { background: var(--bg-surface); border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow-x: auto; margin-bottom: 80px; } 
                .req-table-ui { width: 100%; border-collapse: collapse; font-family: 'Sarabun', sans-serif; } 
                .req-table-ui th { background: var(--bg-body); padding: 15px; font-weight: 700; color: var(--text-dark); border: 1px solid var(--border-color); position: sticky; top: 0; z-index: 10; font-family: 'Prompt', sans-serif; white-space: nowrap; text-align: center; } 
                .req-table-ui td { padding: 8px 12px; border-bottom: 1px solid var(--border-color); vertical-align: middle; color: var(--text-dark); } 
                .req-table-ui tr:hover { background-color: rgba(0,0,0,0.02); } 
                .req-input { width: 100%; border: 1px solid var(--border-color); border-radius: 6px; padding: 6px 10px; font-family: 'Sarabun', sans-serif; transition: all 0.2s; background: var(--bg-body); color: var(--text-dark); font-weight: 600; } 
                .req-input:focus { border-color: #ea580c; box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1); outline: none; } 
                .req-input.qty-input { text-align: center; font-weight: bold; color: #ea580c; background: #fff7ed; border-color: #fdba74; font-size: 15px; width: 100px; margin: 0 auto; display: block; } 
                .floating-action-bar { position: fixed; bottom: 30px; right: 30px; background: var(--bg-surface); padding: 15px 25px; border-radius: 50px; box-shadow: 0 15px 35px rgba(0,0,0,0.15); border: 1px solid var(--border-color); z-index: 1000; display: flex; gap: 15px; align-items: center; } 
                
                #req-month-picker { background-color: #ffffff !important; color: #000000 !important; border: 2px solid #ffffff !important; font-weight: 800 !important; opacity: 1 !important; font-size: 15px !important; border-radius: 8px !important; cursor: pointer; -webkit-text-fill-color: #000000 !important; }
                #req-month-picker::-webkit-datetime-edit, #req-month-picker::-webkit-datetime-edit-fields-wrapper, #req-month-picker::-webkit-datetime-edit-text, #req-month-picker::-webkit-datetime-edit-month-field, #req-month-picker::-webkit-datetime-edit-year-field { color: #000000 !important; -webkit-text-fill-color: #000000 !important; opacity: 1 !important; font-weight: 900 !important; }
                #req-month-picker::-webkit-calendar-picker-indicator { filter: invert(0) !important; opacity: 1 !important; cursor: pointer; }
                
                @media print { 
                    @page { size: A4 portrait; margin: 12mm 10mm; } 
                    body * { visibility: hidden; } 
                    body { background: #fff !important; color: #000 !important; } 
                    .main-content, .content-wrapper, #app-content { margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; overflow: visible !important; } 
                    #print-area, #print-area * { visibility: visible; } 
                    #print-area { position: absolute; left: 0; top: 0; width: 100%; font-family: Calibri, Tahoma, 'Sarabun', sans-serif; } 
                    .req-header-ui, .floating-action-bar, .topbar, #sidebar { display: none !important; } 
                    
                    .print-only-header { display: block; margin-bottom: 12px; } 
                    .print-title-1 { font-family: Calibri, Tahoma, 'Sarabun', sans-serif; font-size: 16pt; font-weight: bold !important; text-align: center; margin-bottom: 6px; color: #000 !important; } 
                    .print-title-2 { font-family: Calibri, Tahoma, 'Sarabun', sans-serif; font-size: 14pt; font-weight: bold !important; text-align: left; margin-bottom: 15px; color: #000 !important; } 
                    
                    /* 🚨 THE FIX: บังคับให้ span แสดงเดือนตอนปริ้นท์ต้องดำสนิท และปิดการใช้สีของ Theme ทิ้งไป */
                    html[data-bs-theme="dark"] body #print-area #print-month-display,
                    html body #print-area #print-month-display,
                    #print-area #print-month-display,
                    #print-month-display { 
                        color: #000000 !important; 
                        -webkit-text-fill-color: #000000 !important; 
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        font-weight: 900 !important; 
                        opacity: 1 !important; 
                        text-shadow: none !important; 
                    }

                    .req-table-wrapper { box-shadow: none !important; border: none !important; border-radius: 0 !important; margin: 0 !important; padding: 0 !important; background: transparent !important; overflow: visible !important; } 
                    .req-table-ui { border: 1px solid #000 !important; font-size: 12pt !important; color: #000 !important; border-collapse: collapse !important; width: 100% !important; font-family: Calibri, Tahoma, 'Sarabun', sans-serif; } 
                    .req-table-ui thead { display: table-header-group; } 
                    .req-table-ui tr { page-break-inside: avoid; height: 28px; } 
                    
                    html[data-bs-theme="dark"] body #print-area .req-table-ui th,
                    html body #print-area .req-table-ui th,
                    #print-area .req-table-ui th { 
                        background: #fdba74 !important; 
                        background-color: #fdba74 !important; 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important; 
                        color: #000 !important; 
                        font-weight: bold !important; 
                        border: 1px solid #000 !important; 
                        padding: 6px !important; 
                        text-align: center !important; 
                        vertical-align: middle !important; 
                        font-size: 12pt !important; 
                    } 
                    
                    html[data-bs-theme="dark"] body #print-area .req-table-ui td,
                    html body #print-area .req-table-ui td,
                    #print-area .req-table-ui td { 
                        background: transparent !important;
                        background-color: transparent !important;
                        border: 1px solid #000 !important; 
                        padding: 4px 6px !important; 
                        color: #000 !important; 
                        font-weight: 600 !important; 
                        vertical-align: middle !important; 
                    } 

                    html[data-bs-theme="dark"] body #print-area .print-val-display,
                    html body #print-area .print-val-display,
                    #print-area .print-val-display { 
                        display: block !important; width: 100%; height: 100%; min-height: 18px; text-align: center; 
                        font-family: Calibri, Tahoma, 'Sarabun', sans-serif; font-size: 12pt !important; 
                        font-weight: bold !important; color: #000 !important; 
                        border: none !important; outline: none !important; box-shadow: none !important; background: transparent !important; 
                    } 

                    html[data-bs-theme="dark"] body #print-area .sig-table td,
                    html[data-bs-theme="dark"] body #print-area .sig-table tr,
                    html body #print-area .sig-table td,
                    #print-area .sig-table td, #print-area .sig-table th, #print-area .sig-table tr { 
                        border: none !important; 
                        font-size: 12pt !important; 
                        font-weight: 600 !important;
                        color: #000 !important; 
                        background: transparent !important; 
                        padding: 5px !important;
                    } 
                    
                    .d-print-none { display: none !important; } 
                    .print-val-left { text-align: left !important; padding-left: 4px !important; } 
                    .print-val-center { text-align: center !important; } 
                    .col-no { width: 5%; text-align: center; } .col-code { width: 12%; text-align: center; } .col-name { width: 40%; } .col-unit { width: 10%; text-align: center; } .col-qty { width: 13%; text-align: center; font-weight: bold !important; } .col-remark { width: 20%; } 
                    
                    .print-signature-section { width: 100%; margin-top: 60px; page-break-inside: avoid; font-family: Calibri, Tahoma, 'Sarabun', sans-serif; } 
                    .sig-table { width: 100%; border: none !important; border-collapse: collapse; } 
                    .excel-checkbox { display: inline-block; width: 16px; height: 16px; border: 1px solid #000; vertical-align: middle; margin-right: 8px; position: relative; top: -2px; } 
                    .sig-line { margin-bottom: 8px; white-space: nowrap; border: none !important; } 
                    .text-center { text-align: center !important; } 
                } 
                @media screen { .print-val-display, .print-only-header, .print-signature-section { display: none !important; } } 
            </style>

            <div class="req-header-ui">
                <div>
                    <h3 class="fw-bold mb-1" style="font-family: 'Prompt';"><i class="fa-solid fa-boxes-packing me-2"></i> ฟอร์มใบขอเบิกสินค้าประจำเดือน</h3>
                    <div class="mt-3" id="sync-status-text"></div>
                </div>
                <div class="d-flex align-items-center gap-3 bg-white bg-opacity-25 p-2 rounded-3">
                    <label class="fw-bold small text-white">ประจำเดือน:</label>
                    <input type="month" id="req-month-picker" class="form-control form-control-sm shadow-sm" style="width: 150px; font-family: 'Prompt';">
                </div>
            </div>

            <div id="print-area">
                <div class="print-only-header">
                    <div class="print-title-1">ใบขอเบิกสินค้าหน่วยไตเทียม : หน่วยไตเทียม โรงพยาบาลแพร่คริสเตียน</div>
                    <div class="print-title-2">ประจำเดือน <span id="print-month-display"></span></div>
                </div>

                <div class="req-table-wrapper">
                    <table class="req-table-ui" id="export-table">
                        <thead>
                            <tr>
                                <th class="col-no">ลำดับ</th>
                                <th class="col-code">รหัสสินค้า</th>
                                <th class="col-name">Consumable</th>
                                <th class="col-unit">หน่วย</th>
                                <th class="col-qty">จำนวนเบิก</th>
                                <th class="col-remark">หมายเหตุ</th>
                            </tr>
                        </thead>
                        <tbody id="req-table-body"></tbody>
                    </table>
                </div>

                <div class="print-signature-section">
                    <table class="sig-table" style="border: none !important; width: 100%;">
                        <tr style="border: none !important;">
                            <td style="width: 50%; vertical-align: top; text-align: center; border: none !important;">
                                <div class="sig-line" style="margin-top: 20px;">ลงชื่อผู้เบิก.......................................................</div>
                                <div class="sig-line" style="margin-top: 8px;">(.......................................................)</div>
                                <div class="sig-line" style="margin-top: 8px;">วันที่........../........../..........</div>
                            </td>
                            <td style="width: 50%; vertical-align: top; text-align: left; padding-left: 60px; border: none !important;">
                                <div style="margin-bottom: 12px;"><span class="excel-checkbox"></span> อนุมัติ</div>
                                <div style="margin-bottom: 25px;"><span class="excel-checkbox"></span> ไม่อนุมัติ</div>
                                <div class="sig-line">ลงชื่อผู้อนุมัติ...................................................</div>
                                <div class="sig-line" style="margin-top: 8px; text-align: center; width: 250px;">Operation Executive</div>
                                <div class="sig-line" style="margin-top: 8px;">วันที่........................................</div>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>

            <div class="floating-action-bar">
                <div class="text-secondary fw-bold small pe-3 border-end" style="font-family: 'Prompt'; color: var(--text-dark) !important;">
                    รวมเบิก: <span id="total-qty-badge" class="badge bg-primary fs-6 ms-1 rounded-pill px-3" style="background:#ea580c !important; color: #ffffff !important;">0</span> รายการ
                </div>
                <button class="btn btn-dark fw-bold shadow-sm rounded-pill px-4" onclick="App.pages.monthly_requisition.downloadExcel()" style="font-family: 'Prompt'; background:#16a34a; border:none; color: #fff;">
                    <i class="fa-solid fa-file-excel me-1"></i> โหลด Excel
                </button>
                <button class="btn fw-bold shadow-sm rounded-pill px-4" onclick="App.pages.monthly_requisition.printExcelForm()" style="font-family: 'Prompt'; background: var(--bg-body); border: 1px solid var(--border-color); color: var(--text-dark);">
                    <i class="fa-solid fa-print me-1 text-warning"></i> พิมพ์ใบเบิก
                </button>
            </div>
        `;
    }

    // 🚨 THE FIX 2: (ไฟล์ monthly_requisition.js) อัปเกรดให้รับ Data ได้ทั้ง 2 ช่องทาง (Payload & LocalStorage)
    init(payload) {
        const today = new Date();
        const monthStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
        document.getElementById('req-month-picker').value = monthStr;

        // 1. ลองดึงข้อมูลจาก Router Payload (ถ้ามีส่งมาสดๆ)
        let incomingData = (payload && payload.syncedItems) ? payload.syncedItems : null;
        
        // 2. ถ้าไม่มี Payload ให้ไปค้นใน LocalStorage (เผื่อผู้ใช้กด Refresh หน้าจอ ข้อมูลจะได้ไม่หาย)
        if (!incomingData) {
            const draft = localStorage.getItem('smart_po_sync_data');
            if (draft) {
                try { 
                    incomingData = JSON.parse(draft); 
                } catch(e) { console.warn("Failed to parse draft sync data"); }
            }
        }

        // 3. นำข้อมูลที่ได้มาตั้งค่า State และลบของเก่าทิ้งป้องกันการซ้ำซ้อน
        if (incomingData && incomingData.length > 0) {
            this.syncedItems = incomingData;
            document.getElementById('sync-status-text').innerHTML = '<span class="badge shadow-sm rounded-pill fw-bold" style="background-color: #fef08a !important; color: #92400e !important; font-size: 13px; border: 1px solid #fcd34d;"><i class="fa-solid fa-bolt me-1"></i> โหลดข้อมูลจากหน้าคำนวณยอดเบิก (Smart PO) สำเร็จ!</span>';
            
            // เคลียร์ LocalStorage ทิ้งหลังจากดึงมาใช้แล้ว เพื่อความสะอาดของ Memory
            localStorage.removeItem('smart_po_sync_data');
        } else {
            this.syncedItems = [];
            document.getElementById('sync-status-text').innerHTML = '<span class="badge shadow-sm rounded-pill fw-bold" style="background-color: #fee2e2 !important; color: #b91c1c !important; font-size: 14px; border: 1px solid #fca5a5;"><i class="fa-solid fa-circle-exclamation me-1"></i> กรุณาส่งข้อมูลมาจากหน้า "คำนวณยอดเบิก"</span>';
        }

        this.renderTable();
    }

    destroy() {
        console.log("🧹 [Monthly Requisition] Cleaned up.");
    }

    renderTable() {
        const tbody = document.getElementById('req-table-body');
        let rowsHtml = '';
        
        if (this.syncedItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted d-print-none"><i class="fa-solid fa-folder-open fa-3x mb-3 opacity-50"></i><br>ยังไม่มีข้อมูลรายการเบิก<br><small>กรุณาไปที่หน้า "คำนวณยอดเบิก" แล้วกดปุ่ม "นำยอดคำนวณไปสร้างฟอร์มเบิกของ"</small></td></tr>';
            document.getElementById('total-qty-badge').innerText = "0";
            return;
        }

        this.syncedItems.forEach((item, index) => {
            let orderVal = (item.order !== undefined && item.order !== null && item.order !== "" && item.order !== 999) ? item.order : '-';
            let itemCodeVal = item.item_code || item.code || '';

            rowsHtml += `
            <tr>
                <td class="col-no text-center text-dark fw-normal order-val-cell">${this.#escapeHTML(String(orderVal))}</td>
                <td class="col-code">
                    <input type="text" class="req-input text-center d-print-none print-sync-input code-inp" value="${this.#escapeHTML(itemCodeVal)}">
                    <span class="print-val-display print-val-center"></span>
                </td>
                <td class="col-name">
                    <input type="text" class="req-input d-print-none print-sync-input name-inp" value="${this.#escapeHTML(item.name || '')}" style="font-weight: 600;">
                    <span class="print-val-display print-val-left"></span>
                </td>
                <td class="col-unit">
                    <input type="text" class="req-input text-center d-print-none print-sync-input unit-inp" value="${this.#escapeHTML(item.unit || '')}">
                    <span class="print-val-display print-val-center"></span>
                </td>
                <td class="col-qty">
                    <input type="number" min="0" class="req-input qty-input req-qty-val d-print-none print-sync-input qty-inp" value="${this.#escapeHTML(String(item.adjustedReq || item.qty || ''))}" oninput="App.pages.monthly_requisition.calculateTotal()">
                    <span class="print-val-display print-val-center"></span>
                </td>
                <td class="col-remark">
                    <input type="text" class="req-input text-muted d-print-none print-sync-input remark-inp" placeholder="">
                    <span class="print-val-display print-val-left"></span>
                </td>
            </tr>`;
        });

        tbody.innerHTML = rowsHtml;
        this.calculateTotal(); 
    }

    calculateTotal() {
        const inputs = document.querySelectorAll('.req-qty-val');
        let totalItems = 0;
        inputs.forEach(input => {
            if(input.value === "0") input.value = ""; 
            if(input.value && parseInt(input.value) > 0) {
                totalItems++;
            }
        });
        document.getElementById('total-qty-badge').innerText = totalItems;
    }

    getThaiMonth() {
        const monthVal = document.getElementById('req-month-picker').value;
        if(!monthVal) return "";
        const dateObj = new Date(monthVal + '-01');
        const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
        return monthNames[dateObj.getMonth()] + " " + (dateObj.getFullYear() + 543);
    }

    printExcelForm() {
        if(this.syncedItems.length === 0) {
            Swal.fire('ตารางว่างเปล่า', 'กรุณาส่งยอดมาจากหน้าคำนวณยอดเบิกก่อนสั่งพิมพ์', 'warning');
            return;
        }
        
        document.getElementById('print-month-display').innerText = this.getThaiMonth();
        
        const allInputs = document.querySelectorAll('.print-sync-input');
        allInputs.forEach(input => {
            const span = input.nextElementSibling;
            if(span) span.innerText = input.value ? input.value : "";
        });
        window.print();
    }

    downloadExcel() {
        if(this.syncedItems.length === 0) {
            Swal.fire('ตารางว่างเปล่า', 'กรุณาส่งยอดมาจากหน้าคำนวณยอดเบิกก่อน', 'warning');
            return;
        }

        Swal.fire({ title: 'กำลังเขียนไฟล์ Excel...', text: 'จัดสัดส่วนหน้ากระดาษ...', didOpen: () => Swal.showLoading() });

        const loadExcelJSEngine = () => {
            return new Promise((resolve) => {
                if (typeof ExcelJS !== 'undefined') return resolve();
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js';
                script.onload = () => resolve();
                document.head.appendChild(script);
            });
        };

        loadExcelJSEngine().then(async () => {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('ใบขอเบิกสินค้า', {
                views: [{ showGridLines: false }], 
                pageSetup: { 
                    paperSize: 9,          
                    orientation: 'portrait',
                    fitToPage: true,       
                    fitToWidth: 1,         
                    fitToHeight: 1,
                    margins: { left: 0.4, right: 0.4, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 }
                }
            });

            const thaiMonth = this.getThaiMonth();

            // 1. หัวกระดาษ
            worksheet.mergeCells('A1:F1');
            const titleRow = worksheet.getRow(1);
            titleRow.getCell(1).value = "ใบขอเบิกสินค้าหน่วยไตเทียม : หน่วยไตเทียม โรงพยาบาลแพร่คริสเตียน";
            titleRow.getCell(1).font = { name: 'Tahoma', size: 16, bold: true, color: { argb: 'FF000000' } };
            titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
            titleRow.height = 35;

            worksheet.mergeCells('A2:F2');
            const subtitleRow = worksheet.getRow(2);
            subtitleRow.getCell(1).value = "ประจำเดือน " + thaiMonth;
            subtitleRow.getCell(1).font = { name: 'Tahoma', size: 14, bold: true, color: { argb: 'FF000000' } };
            subtitleRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
            subtitleRow.height = 25;

            // 2. ปรับความกว้างคอลัมน์ให้สมดุล
            worksheet.columns = [
                { width: 8 },  
                { width: 16 }, 
                { width: 45 }, 
                { width: 10 }, 
                { width: 16 }, 
                { width: 25 }  
            ];

            // 3. หัวตาราง
            const headers = ["ลำดับ", "รหัสสินค้า", "Consumable", "หน่วย", "จำนวนเบิก", "หมายเหตุ"];
            const headerRow = worksheet.getRow(4);
            headerRow.values = headers;
            headerRow.height = 30;

            const thinBorder = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
            };

            for (let c = 1; c <= 6; c++) {
                const cell = headerRow.getCell(c);
                cell.font = { name: 'Tahoma', size: 12, bold: true, color: { argb: 'FF000000' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDBA74' } }; 
                cell.border = thinBorder;
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            }

            // 4. ข้อมูลตาราง
            const rows = document.querySelectorAll('#req-table-body tr');
            let currentRowNum = 5;

            rows.forEach((tr) => {
                let orderText = tr.querySelector('.order-val-cell').innerText.trim();
                let code = tr.querySelector('.code-inp').value || "";
                let name = tr.querySelector('.name-inp').value || "";
                let unit = tr.querySelector('.unit-inp').value || "";
                let qty = tr.querySelector('.qty-inp').value || "";
                let remark = tr.querySelector('.remark-inp').value || "";

                const row = worksheet.getRow(currentRowNum);
                row.values = [
                    isNaN(Number(orderText)) ? orderText : Number(orderText),
                    code,
                    name,
                    unit,
                    qty ? Number(qty) : "",
                    remark
                ];
                row.height = 26; 

                for (let c = 1; c <= 6; c++) {
                    const cell = row.getCell(c);
                    cell.font = { name: 'Tahoma', size: 12, bold: (c === 3 || c === 5), color: { argb: 'FF000000' } };
                    cell.border = thinBorder;
                    if (c === 3 || c === 6) cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
                    else cell.alignment = { horizontal: 'center', vertical: 'middle' };
                }
                currentRowNum++;
            });

            // 5. โซนลายเซ็น
            let sigStartRow = currentRowNum + 3;

            worksheet.mergeCells(`A${sigStartRow}:C${sigStartRow}`);
            worksheet.mergeCells(`D${sigStartRow}:F${sigStartRow}`);
            worksheet.getRow(sigStartRow).getCell(1).value = "ลงชื่อผู้เบิก.......................................................";
            worksheet.getRow(sigStartRow).getCell(4).value = "              ☐ อนุมัติ";

            worksheet.mergeCells(`A${sigStartRow+1}:C${sigStartRow+1}`);
            worksheet.mergeCells(`D${sigStartRow+1}:F${sigStartRow+1}`);
            worksheet.getRow(sigStartRow+1).getCell(1).value = "(.......................................................)";
            worksheet.getRow(sigStartRow+1).getCell(4).value = "              ☐ ไม่อนุมัติ";

            worksheet.mergeCells(`A${sigStartRow+2}:C${sigStartRow+2}`);
            worksheet.mergeCells(`D${sigStartRow+2}:F${sigStartRow+2}`);
            worksheet.getRow(sigStartRow+2).getCell(1).value = "วันที่........../........../..........";
            worksheet.getRow(sigStartRow+2).getCell(4).value = "ลงชื่อผู้อนุมัติ...................................................";

            worksheet.mergeCells(`D${sigStartRow+3}:F${sigStartRow+3}`);
            worksheet.getRow(sigStartRow+3).getCell(4).value = "Operation Executive";

            worksheet.mergeCells(`D${sigStartRow+4}:F${sigStartRow+4}`);
            worksheet.getRow(sigStartRow+4).getCell(4).value = "วันที่........................................";

            for (let i = 0; i < 5; i++) {
                const row = worksheet.getRow(sigStartRow + i);
                row.height = 24;
                row.eachCell((cell, colNumber) => {
                    cell.font = { name: 'Tahoma', size: 12, bold: true, color: { argb: 'FF000000' } };
                    if (colNumber <= 3) cell.alignment = { horizontal: 'center', vertical: 'middle' };
                    else cell.alignment = { horizontal: 'left', vertical: 'middle' };
                });
            }

            // 6. เขียนไฟล์ .xlsx แท้
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `ใบเบิกพัสดุ_${document.getElementById('req-month-picker').value}.xlsx`;
            document.body.appendChild(link);
            link.click();
            
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            Swal.close();
        });
    }

    #escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
}

const MonthlyRequisitionPage = new MonthlyRequisitionPageComponent();
window.MonthlyRequisitionPage = MonthlyRequisitionPage;