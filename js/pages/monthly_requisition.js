// js/pages/monthly_requisition.js
// 🚀 โมดูลฟอร์มเบิกพัสดุ (100% Excel Replica Print + PERFECT Styled XLSX Download + Grid Layout Fix)

const MonthlyRequisitionPage = {
    syncedItems: [],

    html: `
        <style>
            .req-header-ui { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 25px; border-radius: 16px; margin-bottom: 20px; box-shadow: 0 10px 25px -5px rgba(234, 88, 12, 0.3); display: flex; justify-content: space-between; align-items: center; } 
            .req-table-wrapper { background: #fff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow-x: auto; margin-bottom: 80px; } 
            .req-table-ui { width: 100%; border-collapse: collapse; font-family: 'Sarabun', sans-serif; } 
            .req-table-ui th { background: #fce4d6; padding: 15px; font-weight: 700; color: #000; border: 1px solid #cbd5e1; position: sticky; top: 0; z-index: 10; font-family: 'Prompt', sans-serif; white-space: nowrap; text-align: center; } 
            .req-table-ui td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; } 
            .req-table-ui tr:hover { background-color: #f8fafc; } 
            .req-input { width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; font-family: 'Sarabun', sans-serif; transition: all 0.2s; } 
            .req-input:focus { border-color: #ea580c; box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1); outline: none; } 
            .req-input.qty-input { text-align: center; font-weight: bold; color: #ea580c; background: #fff7ed; border-color: #fdba74; font-size: 15px; width: 100px; margin: 0 auto; display: block; } 
            .floating-action-bar { position: fixed; bottom: 30px; right: 30px; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); padding: 15px 25px; border-radius: 50px; box-shadow: 0 15px 35px rgba(0,0,0,0.15); border: 1px solid rgba(226, 232, 240, 0.8); z-index: 1000; display: flex; gap: 15px; align-items: center; } 
            
            @media print { 
                @page { size: A4 portrait; margin: 12mm 10mm; } 
                body * { visibility: hidden; } body { background: #fff !important; } 
                .main-content, .content-wrapper, #app-content { margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; overflow: visible !important; } 
                #print-area, #print-area * { visibility: visible; } #print-area { position: absolute; left: 0; top: 0; width: 100%; font-family: Calibri, Tahoma, 'Sarabun', sans-serif; } 
                .req-header-ui, .floating-action-bar, .topbar, #sidebar { display: none !important; } 
                .print-only-header { display: block; margin-bottom: 12px; } 
                .print-title-1 { font-family: Calibri, Tahoma, 'Sarabun', sans-serif; font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 6px; color: #000; } 
                .print-title-2 { font-family: Calibri, Tahoma, 'Sarabun', sans-serif; font-size: 14pt; font-weight: bold; text-align: left; margin-bottom: 15px; color: #000; } 
                .req-table-wrapper { box-shadow: none; border-radius: 0; margin-bottom: 0; overflow: visible !important; } 
                .req-table-ui { border: 1px solid #000; font-size: 11pt; color: #000; border-collapse: collapse; width: 100%; font-family: Calibri, Tahoma, 'Sarabun', sans-serif; } 
                .req-table-ui thead { display: table-header-group; } .req-table-ui tr { page-break-inside: avoid; height: 24px; } 
                
                .req-table-ui th { background-color: #fce4d6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; color: #000; font-weight: bold; border: 1px solid #000; padding: 4px; text-align: center; vertical-align: middle; font-size: 11pt; } 
                .req-table-ui td { border: 1px solid #000; padding: 2px 5px; color: #000; vertical-align: middle; } 
                .d-print-none { display: none !important; } 
                .print-val-display { display: block !important; width: 100%; height: 100%; min-height: 18px; text-align: center; font-family: Calibri, Tahoma, 'Sarabun', sans-serif; font-size: 11pt; } 
                .print-val-left { text-align: left; padding-left: 4px; } .print-val-center { text-align: center; } 
                .col-no { width: 5%; text-align: center; } .col-code { width: 12%; text-align: center; } .col-name { width: 40%; } .col-unit { width: 10%; text-align: center; } .col-qty { width: 13%; text-align: center; } .col-remark { width: 20%; } 
                
                /* 🚨 เคาะลายเซ็นหน้า Print ลงมา และสร้าง Layout ให้เหมือนตาราง Excel 🚨 */
                .print-signature-section { width: 100%; margin-top: 60px; page-break-inside: avoid; font-family: Calibri, Tahoma, 'Sarabun', sans-serif; } 
                .sig-table { width: 100%; border: none; border-collapse: collapse; } 
                .sig-table td { border: none !important; font-size: 11pt; color: #000; } 
                .excel-checkbox { display: inline-block; width: 14px; height: 14px; border: 1px solid #000; vertical-align: middle; margin-right: 8px; position: relative; top: -2px; } 
                .sig-line { margin-bottom: 6px; white-space: nowrap; } 
                .text-center { text-align: center !important; } 
            } 
            @media screen { .print-val-display, .print-only-header, .print-signature-section { display: none !important; } } 
        </style>

        <div class="req-header-ui">
            <div>
                <h3 class="fw-bold mb-1" style="font-family: 'Prompt';"><i class="fa-solid fa-boxes-packing me-2"></i> ฟอร์มใบขอเบิกสินค้าประจำเดือน</h3>
                <p class="mb-0 opacity-75 small" id="sync-status-text">กรอกรายการพัสดุและสั่งพิมพ์ หรือดาวน์โหลดเป็นตาราง Excel เต็มรูปแบบ</p>
            </div>
            <div class="d-flex align-items-center gap-3 bg-white bg-opacity-25 p-2 rounded-3">
                <label class="fw-bold small text-white">ประจำเดือน:</label>
                <input type="month" id="req-month-picker" class="form-control form-control-sm text-dark fw-bold border-0 shadow-sm" style="width: 150px; font-family: 'Prompt';">
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
                <table class="sig-table">
                    <tr>
                        <td style="width: 50%; vertical-align: top; text-align: center;">
                            <div class="sig-line" style="margin-top: 20px;">ลงชื่อผู้เบิก.......................................................</div>
                            <div class="sig-line" style="margin-top: 5px;">(.......................................................)</div>
                            <div class="sig-line" style="margin-top: 5px;">วันที่........../........../..........</div>
                        </td>
                        <td style="width: 50%; vertical-align: top; text-align: left; padding-left: 50px;">
                            <div style="margin-bottom: 10px;"><span class="excel-checkbox"></span> อนุมัติ</div>
                            <div style="margin-bottom: 15px;"><span class="excel-checkbox"></span> ไม่อนุมัติ</div>
                            <div class="sig-line" style="margin-top: 5px;">ลงชื่อผู้อนุมัติ...................................................</div>
                            <div class="sig-line" style="margin-top: 5px; text-align: center; width: 250px;">Operation Executive</div>
                            <div class="sig-line" style="margin-top: 5px;">วันที่........................................</div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="floating-action-bar">
            <div class="text-secondary fw-bold small pe-3 border-end" style="font-family: 'Prompt';">
                รวมเบิก: <span id="total-qty-badge" class="badge bg-primary fs-6 ms-1 rounded-pill px-3" style="background:#ea580c !important;">0</span> รายการ
            </div>
            <button class="btn btn-dark fw-bold shadow-sm rounded-pill px-4" onclick="MonthlyRequisitionPage.downloadExcel()" style="font-family: 'Prompt'; background:#16a34a; border:none;">
                <i class="fa-solid fa-file-excel me-1"></i> โหลด Excel (พร้อมสีตาราง)
            </button>
            <button class="btn btn-outline-dark fw-bold shadow-sm rounded-pill px-4" onclick="MonthlyRequisitionPage.printExcelForm()" style="font-family: 'Prompt';">
                <i class="fa-solid fa-print me-1"></i> พิมพ์ใบเบิก
            </button>
        </div>
    `,

    init: function() {
        const today = new Date();
        const monthStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
        document.getElementById('req-month-picker').value = monthStr;

        const draft = localStorage.getItem('smart_po_sync_data');
        if (draft) {
            try {
                this.syncedItems = JSON.parse(draft);
                document.getElementById('sync-status-text').innerHTML = '<span class="badge bg-warning text-dark"><i class="fa-solid fa-bolt"></i> โหลดข้อมูลจากหน้าคำนวณยอดเบิก (Smart PO) สำเร็จ!</span>';
                localStorage.removeItem('smart_po_sync_data'); 
            } catch(e) { this.syncedItems = []; }
        } else {
            this.syncedItems = [];
            document.getElementById('sync-status-text').innerHTML = '<span class="text-white-50"><i class="fa-solid fa-circle-info"></i> กรุณาส่งข้อมูลมาจากหน้า "คำนวณยอดเบิก"</span>';
        }

        this.renderTable();
    },

    renderTable: function() {
        const tbody = document.getElementById('req-table-body');
        let rowsHtml = '';
        
        if (this.syncedItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted d-print-none"><i class="fa-solid fa-folder-open fa-3x mb-3 opacity-50"></i><br>ยังไม่มีข้อมูลรายการเบิก<br><small>กรุณาไปที่หน้า "คำนวณยอดเบิก" แล้วกดปุ่ม "นำยอดคำนวณไปสร้างฟอร์มเบิกของ"</small></td></tr>';
            document.getElementById('total-qty-badge').innerText = "0";
            return;
        }

        this.syncedItems.forEach((item, index) => {
            rowsHtml += '<tr>' +
                '<td class="col-no text-center text-muted fw-bold">' + (index + 1) + '</td>' +
                '<td class="col-code">' +
                    '<input type="text" class="req-input text-center d-print-none print-sync-input code-inp" value="' + (item.code || '') + '">' +
                    '<span class="print-val-display print-val-center"></span>' +
                '</td>' +
                '<td class="col-name">' +
                    '<input type="text" class="req-input d-print-none print-sync-input name-inp" value="' + (item.name || '') + '">' +
                    '<span class="print-val-display print-val-left"></span>' +
                '</td>' +
                '<td class="col-unit">' +
                    '<input type="text" class="req-input text-center d-print-none print-sync-input unit-inp" value="' + (item.unit || '') + '">' +
                    '<span class="print-val-display print-val-center"></span>' +
                '</td>' +
                '<td class="col-qty">' +
                    '<input type="number" min="0" class="req-input qty-input req-qty-val d-print-none print-sync-input qty-inp" value="' + (item.qty || '') + '" oninput="MonthlyRequisitionPage.calculateTotal()">' +
                    '<span class="print-val-display print-val-center"></span>' +
                '</td>' +
                '<td class="col-remark">' +
                    '<input type="text" class="req-input text-muted d-print-none print-sync-input remark-inp" placeholder="">' +
                    '<span class="print-val-display print-val-left"></span>' +
                '</td>' +
            '</tr>';
        });

        tbody.innerHTML = rowsHtml;
        this.calculateTotal(); 
    },

    calculateTotal: function() {
        const inputs = document.querySelectorAll('.req-qty-val');
        let totalItems = 0;
        inputs.forEach(input => {
            if(input.value === "0") input.value = ""; 
            if(input.value && parseInt(input.value) > 0) {
                totalItems++;
            }
        });
        document.getElementById('total-qty-badge').innerText = totalItems;
    },

    getThaiMonth: function() {
        const monthVal = document.getElementById('req-month-picker').value;
        if(!monthVal) return "";
        const dateObj = new Date(monthVal + '-01');
        const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
        return monthNames[dateObj.getMonth()] + " " + (dateObj.getFullYear() + 543);
    },

    printExcelForm: function() {
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
    },

    downloadExcel: function() {
        if (typeof XLSX === 'undefined') {
            Swal.fire('ข้อผิดพลาด', 'ไลบรารี SheetJS (Excel) ยังไม่ถูกโหลด', 'error');
            return;
        }
        if(this.syncedItems.length === 0) {
            Swal.fire('ตารางว่างเปล่า', 'กรุณาส่งยอดมาจากหน้าคำนวณยอดเบิกก่อน', 'warning');
            return;
        }

        Swal.fire({ title: 'กำลังสร้างไฟล์ Excel...', text:'ประมวลผลระยะบรรทัดและลายเซ็น...', didOpen: () => Swal.showLoading() });

        setTimeout(() => {
            let aoa = []; 
            const thaiMonth = this.getThaiMonth();

            // 1. หัวกระดาษ (Row 0 - 2)
            aoa.push(["ใบขอเบิกสินค้าหน่วยไตเทียม : หน่วยไตเทียม โรงพยาบาลแพร่คริสเตียน", "", "", "", "", ""]);
            aoa.push(["ประจำเดือน " + thaiMonth, "", "", "", "", ""]);
            aoa.push(["", "", "", "", "", ""]);
            
            // 2. หัวตาราง (Row 3)
            aoa.push(["ลำดับ", "รหัสสินค้า", "Consumable", "หน่วย", "จำนวนเบิก", "หมายเหตุ"]);

            // 3. ข้อมูลในตาราง
            const rows = document.querySelectorAll('#req-table-body tr');
            rows.forEach((tr, idx) => {
                let code = tr.querySelector('.code-inp').value || "";
                let name = tr.querySelector('.name-inp').value || "";
                let unit = tr.querySelector('.unit-inp').value || "";
                let qty = tr.querySelector('.qty-inp').value || "";
                let remark = tr.querySelector('.remark-inp').value || "";
                
                aoa.push([idx + 1, code, name, unit, qty ? Number(qty) : "", remark]);
            });

            // 4. ลายเซ็นและ Checkbox (จัดบล็อค 6 แถว)
            aoa.push(["", "", "", "", "", ""]); // เว้น 1
            aoa.push(["", "", "", "", "", ""]); // เว้น 2

            let sigStartRow = aoa.length; // จุดเริ่มต้นบรรทัดแรกของลายเซ็น

            aoa.push(["ลงชื่อผู้เบิก.......................................................", "", "", "               ☐ อนุมัติ", "", ""]);
            aoa.push(["", "", "", "               ☐ ไม่อนุมัติ", "", ""]);
            aoa.push(["", "", "", "", "", ""]); // เว้นช่องไฟให้ลายเซ็นโปร่ง
            aoa.push(["(.......................................................)", "", "", "ลงชื่อผู้อนุมัติ...................................................", "", ""]);
            aoa.push(["", "", "", "Operation Executive", "", ""]);
            aoa.push(["วันที่........../........../..........", "", "", "วันที่........................................", "", ""]);

            let wb = XLSX.utils.book_new();
            let ws = XLSX.utils.aoa_to_sheet(aoa);

            // --- 🎨 ส่วนของ Excel Styling 🎨 ---
            
            // ล็อคความกว้างคอลัมน์
            ws['!cols'] = [ {wch: 8}, {wch: 15}, {wch: 40}, {wch: 10}, {wch: 15}, {wch: 25} ];

            // ล็อคความสูงของแถว
            ws['!rows'] = [];
            ws['!rows'][0] = {hpt: 30}; 
            ws['!rows'][1] = {hpt: 20}; 
            ws['!rows'][3] = {hpt: 25}; 
            
            // แถวข้อมูลตาราง และ บรรทัดว่าง
            for(let r = 4; r < sigStartRow; r++) { 
                ws['!rows'][r] = {hpt: 22};
            }
            
            // แถวลายเซ็น
            for(let i = 0; i < 6; i++) { 
                ws['!rows'][sigStartRow + i] = {hpt: 22}; 
            }

            // ตั้งค่าการผสานเซลล์ (Merge Cells) 
            ws["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // ผสานชื่อโรงพยาบาล A1:F1
                { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }  // ผสานประจำเดือน A2:F2
            ];

            // ผสานเซลล์ลายเซ็น 6 บรรทัดตามพิกัดเป๊ะๆ (ซ้าย=A-C, ขวา=D-F)
            for(let i = 0; i < 6; i++) {
                ws["!merges"].push({ s: { r: sigStartRow + i, c: 0 }, e: { r: sigStartRow + i, c: 2 } }); // ฝั่งซ้าย
                ws["!merges"].push({ s: { r: sigStartRow + i, c: 3 }, e: { r: sigStartRow + i, c: 5 } }); // ฝั่งขวา
            }

            const borderStyle = { 
                top: {style: "thin", color: {auto: 1}}, bottom: {style: "thin", color: {auto: 1}}, 
                left: {style: "thin", color: {auto: 1}}, right: {style: "thin", color: {auto: 1}} 
            };

            // ลูปใส่สไตล์เซลล์ทั้งหมด
            for (let r = 0; r < aoa.length; r++) {
                for (let c = 0; c < 6; c++) {
                    let cellRef = XLSX.utils.encode_cell({ r: r, c: c });
                    if (!ws[cellRef]) ws[cellRef] = { v: "", t: "s" };

                    // สไตล์พื้นฐาน 
                    ws[cellRef].s = { font: { name: "Tahoma", sz: 11 }, alignment: { vertical: "center", horizontal: "center" } };

                    // สไตล์หัวกระดาษ
                    if (r === 0) {
                        ws[cellRef].s.font = { name: "Tahoma", sz: 16, bold: true };
                    }
                    else if (r === 1) {
                        ws[cellRef].s.font = { name: "Tahoma", sz: 14, bold: true };
                        ws[cellRef].s.alignment.horizontal = "left";
                    }
                    // สไตล์หัวตาราง (สีส้มอ่อน FCE4D6)
                    else if (r === 3) {
                        ws[cellRef].s.font = { name: "Tahoma", sz: 11, bold: true };
                        ws[cellRef].s.fill = { fgColor: { rgb: "FCE4D6" } }; 
                        ws[cellRef].s.border = borderStyle;
                    }
                    // สไตล์ข้อมูลในตาราง
                    else if (r > 3 && r < sigStartRow - 2) {
                        ws[cellRef].s.border = borderStyle;
                        if (c === 2 || c === 5) {
                            ws[cellRef].s.alignment.horizontal = "left"; // ชื่อและหมายเหตุ ให้ชิดซ้าย
                        }
                    }
                    // สไตล์ส่วนลายเซ็น (จัดกึ่งกลางและชิดซ้ายอย่างสมบูรณ์)
                    else if (r >= sigStartRow) {
                        if (c === 0) { // ฝั่งซ้าย (A)
                            ws[cellRef].s.alignment.horizontal = "center";
                        }
                        else if (c === 3) { // ฝั่งขวา (D)
                            if(r === sigStartRow || r === sigStartRow + 1) { // กล่อง Checkbox อนุมัติ
                                ws[cellRef].s.alignment.horizontal = "left"; 
                            } else { // ลงชื่อผู้อนุมัติ
                                ws[cellRef].s.alignment.horizontal = "center";
                            }
                        }
                    }
                }
            }

            XLSX.utils.book_append_sheet(wb, ws, "ใบขอเบิกสินค้า");
            XLSX.writeFile(wb, "ใบเบิกพัสดุ_" + document.getElementById('req-month-picker').value + ".xlsx");

            Swal.close();
        }, 500);
    }
};