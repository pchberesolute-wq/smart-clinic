// js/pages/monthly_requisition.js
// 👑 Enterprise Monthly Requisition: Self-Healing State, Smart Typeahead & Master Order Sync (v9.9 FULL - A4 Pagination Engine)

class MonthlyRequisitionPageComponent {
    constructor() {
        this.syncedItems = [];
        this.allItems = [];
        this.savedRequisitions = {}; 
        this.firebaseListeners = [];
    }

    get html() {
        return `
            <style>
                .req-header-ui { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 25px; border-radius: 16px; margin-bottom: 20px; box-shadow: 0 10px 25px -5px rgba(234, 88, 12, 0.3); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; } 
                .req-table-wrapper { background: var(--bg-surface); border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow-x: auto; margin-bottom: 80px; padding-bottom: 120px; } 
                .req-table-ui { width: 100%; border-collapse: collapse; font-family: 'Sarabun', sans-serif; } 
                .req-table-ui th { background: var(--bg-body); padding: 15px; font-weight: 700; color: var(--text-dark); border: 1px solid var(--border-color); position: sticky; top: 0; z-index: 10; font-family: 'Prompt', sans-serif; white-space: nowrap; text-align: center; } 
                .req-table-ui td { padding: 8px 12px; border-bottom: 1px solid var(--border-color); vertical-align: middle; color: var(--text-dark); } 
                .req-table-ui tr:hover { background-color: rgba(0,0,0,0.02); } 
                .req-input { width: 100%; border: 1px solid var(--border-color); border-radius: 6px; padding: 6px 10px; font-family: 'Sarabun', sans-serif; transition: all 0.2s; background: var(--bg-body); color: var(--text-dark); font-weight: 600; } 
                .req-input:focus { border-color: #ea580c; box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.1); outline: none; } 
                .req-input.qty-input { text-align: center; font-weight: bold; color: #ea580c; background: #fff7ed; border-color: #fdba74; font-size: 15px; width: 100px; margin: 0 auto; display: block; } 
                .floating-action-bar { position: fixed; bottom: 30px; right: 30px; background: var(--bg-surface); padding: 15px 25px; border-radius: 50px; box-shadow: 0 15px 35px rgba(0,0,0,0.15); border: 1px solid var(--border-color); z-index: 1000; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; } 
                
                #req-month-picker { background-color: #ffffff !important; color: #000000 !important; border: 2px solid #ffffff !important; font-weight: 800 !important; opacity: 1 !important; font-size: 15px !important; border-radius: 8px !important; cursor: pointer; color-scheme: light !important; }
                #req-month-picker::-webkit-calendar-picker-indicator { opacity: 1 !important; cursor: pointer; filter: none !important; }
                
                .autocomplete-dropdown { position: absolute; top: calc(100% + 4px); left: 12px; right: 12px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; box-shadow: 0 15px 35px rgba(0,0,0,0.2); max-height: 250px; overflow-y: auto; z-index: 9999; text-align: left; padding: 6px; }
                .ac-item { padding: 10px 15px; cursor: pointer; border-radius: 8px; transition: all 0.1s; margin-bottom: 2px; border: 1px solid transparent; }
                .ac-item:hover, .ac-item.active-nav { background: rgba(59, 130, 246, 0.08); border-color: rgba(59, 130, 246, 0.2); transform: translateX(2px); }
                .ac-item-name { font-size: 15px; font-weight: 700; color: var(--text-dark); margin-bottom: 4px; font-family: 'Prompt', sans-serif; }
                .ac-item-detail { font-size: 12px; color: var(--text-muted); font-family: 'Sarabun'; display: flex; align-items: center; gap: 12px; }
                
                .history-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 15px; padding-bottom: 10px; }
                .history-item { background: var(--bg-body); border: 1px solid var(--border-color); border-radius: 12px; padding: 15px; text-align: center; cursor: pointer; transition: all 0.2s; position: relative; }
                .history-item:hover { border-color: var(--primary); box-shadow: 0 8px 15px rgba(0,0,0,0.1); transform: translateY(-3px); }
                .history-item-del-btn { background: transparent; border: none; color: #ef4444; font-size: 18px; margin-bottom: 12px; opacity: 0.5; transition: 0.2s; width: 100%; display: block; }
                .history-item:hover .history-item-del-btn { opacity: 1; transform: scale(1.1); }
                .history-item-month { font-weight: 700; color: #3b82f6; font-size: 16px; margin-bottom: 8px; font-family: 'Prompt'; }
                .history-item-badge { font-size: 12px; padding: 4px 12px; background: #dcfce7; color: #059669; border-radius: 6px; display: inline-block; font-weight: 700; margin-bottom: 8px; font-family: 'Sarabun'; border: 1px solid #bbf7d0; }
                html[data-bs-theme="dark"] .history-item-badge { background: rgba(5,150,105,0.15); border-color: rgba(5,150,105,0.3); color: #34d399; }

                .sig-table, .sig-table tr, .sig-table td, .sig-table th { border: 0 !important; border-color: transparent !important; box-shadow: none !important; outline: none !important; background: transparent !important; }

                @media print { 
                    @page { size: A4 portrait; margin: 12mm 10mm; } 
                    body { background: #fff !important; color: #000 !important; } 
                    .req-header-ui, .floating-action-bar, .topbar, #sidebar, .d-print-none { display: none !important; } 
                    .main-content, .content-wrapper, #app-content { margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; overflow: visible !important; } 
                    
                    .print-only-header { display: block; margin-bottom: 12px; } 
                    .print-title-1 { font-family: Calibri, Tahoma, 'Sarabun', sans-serif; font-size: 16pt; font-weight: bold !important; text-align: center; margin-bottom: 6px; color: #000 !important; } 
                    .print-title-2 { font-family: Calibri, Tahoma, 'Sarabun', sans-serif; font-size: 14pt; font-weight: bold !important; text-align: left; margin-bottom: 15px; color: #000 !important; } 
                    #print-month-display { color: #000000 !important; -webkit-text-fill-color: #000000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-weight: 900 !important; opacity: 1 !important; text-shadow: none !important; }
                    
                    .req-table-wrapper { box-shadow: none !important; border: none !important; border-radius: 0 !important; margin: 0 !important; padding: 0 !important; background: transparent !important; overflow: visible !important; } 
                    .req-table-ui { border: 1px solid #000 !important; font-size: 12pt !important; color: #000 !important; border-collapse: collapse !important; width: 100% !important; font-family: Calibri, Tahoma, 'Sarabun', sans-serif; } 
                    .req-table-ui thead { display: table-header-group; } 
                    .req-table-ui tbody { display: table-row-group; }
                    .req-table-ui tr { page-break-inside: avoid; height: 28px; } 
                    .req-table-ui th { background: #fdba74 !important; background-color: #fdba74 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color: #000 !important; font-weight: bold !important; border: 1px solid #000 !important; padding: 6px !important; text-align: center !important; vertical-align: middle !important; font-size: 12pt !important; } 
                    .req-table-ui td { background: transparent !important; background-color: transparent !important; border: 1px solid #000 !important; padding: 4px 6px !important; color: #000 !important; font-weight: 600 !important; vertical-align: middle !important; } 
                    .print-val-display { display: block !important; width: 100%; height: 100%; min-height: 18px; text-align: center; font-family: Calibri, Tahoma, 'Sarabun', sans-serif; font-size: 12pt !important; font-weight: bold !important; color: #000 !important; border: none !important; outline: none !important; box-shadow: none !important; background: transparent !important; } 
                    
                    .sig-table td, .sig-table tr, .sig-table th { border: 0 !important; border-color: transparent !important; font-size: 12pt !important; font-weight: 600 !important; color: #000 !important; background: transparent !important; padding: 5px !important; } 
                    
                    .print-val-left { text-align: left !important; padding-left: 4px !important; } 
                    .print-val-center { text-align: center !important; } 
                    .col-no { width: 8%; text-align: center; } .col-code { width: 15%; text-align: center; } .col-name { width: 35%; } .col-unit { width: 10%; text-align: center; } .col-qty { width: 12%; text-align: center; font-weight: bold !important; } .col-remark { width: 20%; } 
                    .print-signature-section { width: 100%; margin-top: 60px; page-break-inside: avoid; font-family: Calibri, Tahoma, 'Sarabun', sans-serif; border: 0 !important; } 
                    .sig-table { width: 100%; border: 0 !important; border-collapse: collapse; } 
                    .excel-checkbox { display: inline-block; width: 16px; height: 16px; border: 1px solid #000; vertical-align: middle; margin-right: 8px; position: relative; top: -2px; } 
                    .sig-line { margin-bottom: 8px; white-space: nowrap; border: 0 !important; } 
                    .text-center { text-align: center !important; } 
                } 
                @media screen { .print-val-display, .print-only-header, .print-signature-section { display: none !important; } } 
            </style>

            <div class="req-header-ui">
                <div>
                    <h3 class="fw-bold mb-1" style="font-family: 'Prompt';"><i class="fa-solid fa-boxes-packing me-2"></i> ฟอร์มใบขอเบิกสินค้าประจำเดือน</h3>
                    <div class="mt-3" id="sync-status-text"></div>
                </div>
                <div class="d-flex align-items-center gap-3 flex-wrap">
                    <button class="btn btn-warning text-dark fw-bold shadow-sm rounded-pill px-4 border-0" onclick="App.pages.monthly_requisition.openHistoryModal()">
                        <i class="fa-solid fa-clock-rotate-left me-1"></i> ประวัติย้อนหลัง
                    </button>
                    <button class="btn btn-light fw-bold shadow-sm rounded-pill px-4" onclick="App.switchPage('stock_forecast')">
                        <i class="fa-solid fa-calculator me-2 text-primary"></i> กลับไปหน้าคำนวณ
                    </button>
                    <button class="btn btn-outline-danger fw-bold shadow-sm rounded-pill px-3 bg-white" onclick="App.pages.monthly_requisition.clearAllRequisition()">
                        <i class="fa-solid fa-trash-can me-1"></i> ล้างหน้าจอ
                    </button>
                    <div class="d-flex align-items-center gap-2 bg-white bg-opacity-25 p-2 rounded-3">
                        <label class="fw-bold small text-white">ประจำเดือน:</label>
                        <input type="month" id="req-month-picker" class="form-control form-control-sm shadow-sm" style="width: 150px; font-family: 'Prompt';" onchange="App.pages.monthly_requisition.onMonthChanged(this.value)">
                    </div>
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
                                <th class="col-no">ลำดับคลัง</th>
                                <th class="col-code">รหัสสินค้า</th>
                                <th class="col-name">รายการพัสดุ (Consumable)</th>
                                <th class="col-unit">หน่วยนับ</th>
                                <th class="col-qty">จำนวนเบิก</th>
                                <th class="col-remark">หมายเหตุ</th>
                                <th class="d-print-none text-center" style="width: 50px;"><i class="fa-solid fa-gear"></i></th>
                            </tr>
                        </thead>
                        <tbody id="req-table-body"></tbody>
                    </table>
                    
                    <div class="text-start p-3 d-print-none border-top">
                        <button class="btn btn-outline-primary fw-bold shadow-sm rounded-pill px-4" onclick="App.pages.monthly_requisition.addNewRow()">
                            <i class="fa-solid fa-plus me-1"></i> เพิ่มรายการด้วยมือ (Add Item)
                        </button>
                    </div>
                </div>

                <div class="print-signature-section">
                    <table class="sig-table" style="border: 0 !important; width: 100%;">
                        <tr style="border: 0 !important;">
                            <td style="width: 50%; vertical-align: top; text-align: center; border: 0 !important;">
                                <div class="sig-line" style="margin-top: 20px;">ลงชื่อผู้เบิก.......................................................</div>
                                <div class="sig-line" style="margin-top: 8px;">(.......................................................)</div>
                                <div class="sig-line" style="margin-top: 8px;">วันที่........../........../..........</div>
                            </td>
                            <td style="width: 50%; text-align: left; padding-left: 60px; vertical-align: top; border: 0 !important;">
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
                
                <button class="btn fw-bold shadow-sm rounded-pill px-4 text-white" onclick="App.pages.monthly_requisition.saveToCloudDatabase()" style="font-family: 'Prompt'; background: linear-gradient(135deg, #3b82f6, #2563eb); border:none;">
                    <i class="fa-solid fa-cloud-arrow-up me-1"></i> บันทึกเข้าระบบ
                </button>
                
                <button class="btn btn-dark fw-bold shadow-sm rounded-pill px-4" onclick="App.pages.monthly_requisition.downloadExcel()" style="font-family: 'Prompt'; background:#16a34a; border:none; color: #fff;">
                    <i class="fa-solid fa-file-excel me-1"></i> โหลด Excel
                </button>

                <button class="btn btn-danger fw-bold shadow-sm rounded-pill px-4 text-white" onclick="App.pages.monthly_requisition.downloadPDF()" style="font-family: 'Prompt'; background: linear-gradient(135deg, #ef4444, #dc2626); border:none;">
                    <i class="fa-solid fa-file-pdf me-1"></i> โหลด PDF
                </button>

                <button class="btn fw-bold shadow-sm rounded-pill px-4" onclick="App.pages.monthly_requisition.printExcelForm()" style="font-family: 'Prompt'; background: var(--bg-body); border: 1px solid var(--border-color); color: var(--text-dark);">
                    <i class="fa-solid fa-print me-1 text-warning"></i> พิมพ์ใบเบิก
                </button>
            </div>
        `;
    }

    init(payload) {
        this.allItems = [];
        this.syncedItems = [];
        this.savedRequisitions = {};
        this.firebaseListeners = this.firebaseListeners || [];

        if (window.reqAutocompleteListenerAdded) {
            document.removeEventListener('click', window.reqAutocompleteListenerAdded);
        }
        
        window.reqAutocompleteListenerAdded = (e) => {
            if (!e.target.closest('.col-name')) {
                document.querySelectorAll('.autocomplete-dropdown').forEach(d => d.classList.add('d-none'));
            }
        };
        document.addEventListener('click', window.reqAutocompleteListenerAdded);

        if (typeof db !== 'undefined') {
            const cbItems = db.ref('inventory_database_v2/items').on('value', snap => {
                const data = snap.val();
                this.allItems = data ? Object.keys(data).map(k => ({ id: k, ...data[k] })).filter(i => !i.isArchived) : [];
                
                if(this.syncedItems.length > 0) {
                    this.renderTable();
                }
            });
            this.firebaseListeners.push({ path: 'inventory_database_v2/items', callback: cbItems });

            const cbReqs = db.ref('clinic_monthly_requisitions_v2').on('value', snap => {
                this.savedRequisitions = snap.val() || {};
                this.updateSyncStatusUI(); 
            });
            this.firebaseListeners.push({ path: 'clinic_monthly_requisitions_v2', callback: cbReqs });
        }

        const today = new Date();
        const monthStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
        const monthPicker = document.getElementById('req-month-picker');
        if(monthPicker) monthPicker.value = monthStr;

        let incomingData = (payload && payload.syncedItems) ? payload.syncedItems : null;
        
        if (incomingData && incomingData.length > 0) {
            this.syncedItems = incomingData;
            this.saveCurrentMonthLocalDraft(); 
            this.updateSyncStatusUI(true);
        } else {
            this.loadCurrentMonthData();
        }

        this.renderTable();
    }

    destroy() {
        if (this.firebaseListeners && typeof db !== 'undefined') {
            this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
            this.firebaseListeners = [];
        }
        if (window.reqAutocompleteListenerAdded) {
            document.removeEventListener('click', window.reqAutocompleteListenerAdded);
            window.reqAutocompleteListenerAdded = null;
        }
    }

    // 🚨 THE FIX: อัปเกรด Smart A4 Pagination (โชว์หัวเอกสารเฉพาะหน้า 1 เท่านั้น!)
    async downloadPDF() {
        if(this.syncedItems.length === 0) { 
            Swal.fire('ตารางว่างเปล่า', 'กรุณาเพิ่มรายการพัสดุก่อนโหลด PDF ครับ', 'warning'); 
            return; 
        }

        Swal.fire({ 
            title: 'กำลังคำนวณหน้ากระดาษ...', 
            html: 'ระบบกำลังจัดเรียงข้อมูลลงหน้า A4 อย่างแม่นยำ<br>กรุณารอสักครู่...', 
            allowOutsideClick: false, 
            didOpen: () => Swal.showLoading(),
            customClass: { popup: 'premium-alert' }
        });

        // 1. นำเข้า Library ที่จำเป็น
        if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
            await Promise.all([
                new Promise(r => { let s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; s.onload=r; document.head.appendChild(s); }),
                new Promise(r => { let s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; s.onload=r; document.head.appendChild(s); })
            ]);
        }

        try {
            const monthStr = this.getThaiMonth();
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('portrait', 'mm', 'a4');

            // 2. ดึงข้อมูลแถวทั้งหมดจาก DOM
            const rowsList = [];
            document.querySelectorAll('#req-table-body tr').forEach(tr => {
                if (tr.id === 'empty-state-row') return;
                rowsList.push(tr);
            });

            // 3. กำหนดค่า Configuration สำหรับกระดาษ A4
            const ROWS_PER_PAGE = 25; // จำนวนแถวต่อ 1 หน้าปกติ
            const ROWS_PER_LAST_PAGE = 16; // จำนวนแถวหน้าสุดท้าย (เผื่อที่ให้ลายเซ็นด้านล่าง)
            
            let chunks = [];
            let currentIndex = 0;

            // 4. Algorithm ตัดแบ่งข้อมูล (Chunking) เป็นหน้าๆ แบบชาญฉลาด
            while (currentIndex < rowsList.length) {
                let remainingRows = rowsList.length - currentIndex;
                let takeCount = ROWS_PER_PAGE;

                if (remainingRows <= ROWS_PER_LAST_PAGE) {
                    takeCount = remainingRows; // ถ้าเหลือบรรทัดน้อย ยัดลงหน้าสุดท้ายพร้อมลายเซ็นได้เลย
                } else if (remainingRows <= ROWS_PER_PAGE) {
                    takeCount = ROWS_PER_PAGE - 10; 
                }

                chunks.push(rowsList.slice(currentIndex, currentIndex + takeCount));
                currentIndex += takeCount;
            }

            // 5. สร้าง Container ล่องหนที่เหมือนกระดาษ A4 เป๊ะๆ
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.top = '-9999px';
            container.style.left = '0';
            container.style.width = '210mm'; // ฟิกความกว้าง A4
            container.style.backgroundColor = '#ffffff';
            document.body.appendChild(container);

            // 6. วนลูปวาด HTML และถ่ายรูป (Canvas) ทีละหน้ากระดาษ
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const isFirstPage = (i === 0); // 🚨 เช็คว่าเป็นหน้าแรกหรือไม่
                const isLastPage = (i === chunks.length - 1); // 🚨 เช็คว่าเป็นหน้าสุดท้ายหรือไม่

                let tableRowsHtml = '';
                chunk.forEach(tr => {
                    let orderText = tr.querySelector('.order-val-cell').innerText.trim();
                    let code = tr.querySelector('.code-inp').value || "";
                    let name = tr.querySelector('.name-inp').value || "";
                    let unit = tr.querySelector('.unit-inp').value || "";
                    let qty = tr.querySelector('.qty-inp').value || "";
                    let remark = tr.querySelector('.remark-inp').value || "";

                    tableRowsHtml += `
                    <tr style="height: 35px; background-color: #ffffff;">
                        <td style="border: 1px solid #000; padding: 6px; text-align: center; color: #000; font-size: 14px;">${this.#escapeHTML(orderText)}</td>
                        <td style="border: 1px solid #000; padding: 6px; text-align: center; color: #000; font-size: 14px;">${this.#escapeHTML(code)}</td>
                        <td style="border: 1px solid #000; padding: 6px; text-align: left; color: #000; font-size: 14px; padding-left: 10px;">${this.#escapeHTML(name)}</td>
                        <td style="border: 1px solid #000; padding: 6px; text-align: center; color: #000; font-size: 14px;">${this.#escapeHTML(unit)}</td>
                        <td style="border: 1px solid #000; padding: 6px; text-align: center; color: #000; font-weight: bold; font-size: 15px;">${this.#escapeHTML(qty)}</td>
                        <td style="border: 1px solid #000; padding: 6px; text-align: left; color: #000; font-size: 14px; padding-left: 10px;">${this.#escapeHTML(remark)}</td>
                    </tr>`;
                });

                // 🚨 สร้างส่วนหัวเอกสารเฉพาะหน้า 1 เท่านั้น ถ้าเป็นหน้าอื่นให้เว้นขอบบนเล็กน้อย
                const documentHeaderHtml = isFirstPage ? `
                    <div style="text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 10px;">
                        ใบขอเบิกสินค้าหน่วยไตเทียม : หน่วยไตเทียม โรงพยาบาลแพร่คริสเตียน
                    </div>
                    <div style="text-align: left; font-size: 16px; font-weight: bold; margin-bottom: 20px;">
                        ประจำเดือน ${monthStr}
                    </div>
                ` : `<div style="height: 20px;"></div>`;

                // สร้างส่วนลายเซ็นเฉพาะหน้าสุดท้าย
                const signatureHtml = isLastPage ? `
                    <table style="width: 100%; border: 0 !important; margin-top: 40px; border-collapse: collapse; font-family: 'Sarabun', sans-serif;">
                        <tr style="border: 0 !important; background-color: transparent;">
                            <td style="width: 50%; text-align: center; vertical-align: top; border: 0 !important; color: #000; font-size: 14px; font-weight: 600;">
                                <div style="margin-bottom: 15px;">ลงชื่อผู้เบิก.......................................................</div>
                                <div style="margin-bottom: 15px;">(.......................................................)</div>
                                <div style="margin-bottom: 15px;">วันที่........../........../..........</div>
                            </td>
                            <td style="width: 50%; text-align: left; padding-left: 40px; vertical-align: top; border: 0 !important; color: #000; font-size: 14px; font-weight: 600;">
                                <div style="margin-bottom: 15px;">
                                    <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #000; margin-right: 10px; vertical-align: middle;"></span> อนุมัติ
                                </div>
                                <div style="margin-bottom: 25px;">
                                    <span style="display: inline-block; width: 14px; height: 14px; border: 1px solid #000; margin-right: 10px; vertical-align: middle;"></span> ไม่อนุมัติ
                                </div>
                                <div style="margin-bottom: 15px;">ลงชื่อผู้อนุมัติ...................................................</div>
                                <div style="margin-bottom: 15px; text-align: center; width: 250px;">Operation Executive</div>
                                <div style="margin-bottom: 15px;">วันที่........................................</div>
                            </td>
                        </tr>
                    </table>
                ` : '';

                // ประกอบร่างหน้า A4
                const pageHtml = `
                    <div class="pdf-page-chunk" style="width: 210mm; height: 297mm; padding: 15mm 10mm; box-sizing: border-box; background: #fff; position: relative; font-family: 'Sarabun', sans-serif; color: #000;">
                        ${documentHeaderHtml}
                        
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                            <thead>
                                <tr style="background-color: #fdba74;">
                                    <th style="border: 1px solid #000; padding: 10px; text-align: center; font-size: 14px; font-weight: bold; width: 8%;">ลำดับ</th>
                                    <th style="border: 1px solid #000; padding: 10px; text-align: center; font-size: 14px; font-weight: bold; width: 15%;">รหัสสินค้า</th>
                                    <th style="border: 1px solid #000; padding: 10px; text-align: center; font-size: 14px; font-weight: bold; width: 37%;">Consumable</th>
                                    <th style="border: 1px solid #000; padding: 10px; text-align: center; font-size: 14px; font-weight: bold; width: 10%;">หน่วย</th>
                                    <th style="border: 1px solid #000; padding: 10px; text-align: center; font-size: 14px; font-weight: bold; width: 12%;">จำนวนเบิก</th>
                                    <th style="border: 1px solid #000; padding: 10px; text-align: center; font-size: 14px; font-weight: bold; width: 18%;">หมายเหตุ</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRowsHtml}
                            </tbody>
                        </table>

                        ${signatureHtml}
                        
                        <div style="position: absolute; bottom: 15mm; right: 15mm; font-size: 12px; color: #666; font-family: 'Prompt', sans-serif;">
                            หน้า ${i+1}/${chunks.length}
                        </div>
                    </div>
                `;

                container.innerHTML = pageHtml;

                // รอ Font โหลดให้เสร็จก่อนวาด
                await document.fonts.ready;
                const canvas = await html2canvas(container.querySelector('.pdf-page-chunk'), { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
                const imgData = canvas.toDataURL('image/jpeg', 1.0);

                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297); // ใส่ลง A4 พอดีเป๊ะ
            }

            container.remove();
            pdf.save(`ใบเบิกพัสดุ_${document.getElementById('req-month-picker').value}.pdf`);
            Swal.fire({title:'ดาวน์โหลดสำเร็จ!', icon:'success', timer:1500, showConfirmButton: false});

        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'เกิดข้อผิดพลาดในการสร้าง PDF: ' + err.message, 'error');
        }
    }

    printExcelForm() {
        if(this.syncedItems.length === 0) { 
            Swal.fire('ตารางว่างเปล่า', 'กรุณาบันทึกหรือดึงข้อมูลก่อนพิมพ์ครับ', 'warning'); 
            return; 
        }

        Swal.fire({
            title: 'กำลังเตรียมเอกสารพิมพ์...',
            text: 'ระบบกำลังจัดหน้ากระดาษ (Pagination)',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
            customClass: { popup: 'premium-alert' }
        });

        document.getElementById('print-month-display').innerText = this.getThaiMonth();
        
        const allInputs = document.querySelectorAll('#print-area .print-sync-input');
        allInputs.forEach(input => { 
            const span = input.nextElementSibling; 
            if(span) span.innerText = input.value ? input.value : ""; 
        });

        const printContent = document.getElementById('print-area').innerHTML;

        let oldIframe = document.getElementById('req-print-iframe');
        if (oldIframe) oldIframe.remove();

        let iframe = document.createElement('iframe');
        iframe.id = 'req-print-iframe';
        iframe.style.cssText = 'position: fixed; right: 0; bottom: 0; width: 0; height: 0; border: 0; z-index: -9999;';
        document.body.appendChild(iframe);

        const html = `
            <!DOCTYPE html>
            <html lang="th">
            <head>
                <meta charset="UTF-8">
                <title>พิมพ์ใบเบิกสินค้า</title>
                <style>
                    @page { size: A4 portrait; margin: 15mm 10mm; } 
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; box-sizing: border-box !important; }
                    body { background: #fff !important; color: #000 !important; font-family: Calibri, Tahoma, 'Sarabun', sans-serif; margin: 0; padding: 0; } 
                    
                    /* Hide UI elements from screen */
                    .d-print-none, .req-input, .autocomplete-dropdown, .btn { display: none !important; } 
                    
                    .print-val-display { display: block !important; width: 100%; height: 100%; min-height: 18px; text-align: center; font-size: 12pt !important; font-weight: bold !important; color: #000 !important; } 
                    .print-val-left { text-align: left !important; padding-left: 4px !important; } 
                    .print-val-center { text-align: center !important; } 
                    
                    .print-only-header { display: block; margin-bottom: 20px; } 
                    .print-title-1 { font-size: 16pt; font-weight: bold !important; text-align: center; margin-bottom: 8px; color: #000 !important; } 
                    .print-title-2 { font-size: 14pt; font-weight: bold !important; text-align: left; margin-bottom: 15px; color: #000 !important; } 
                    
                    .req-table-wrapper { width: 100%; } 
                    .req-table-ui { border: 1px solid #000 !important; font-size: 12pt !important; color: #000 !important; border-collapse: collapse !important; width: 100% !important; } 
                    
                    /* 🚨 PAGINATION FIX: หัวใจสำคัญของการตัดหน้ากระดาษ */
                    .req-table-ui thead { display: table-header-group; } 
                    .req-table-ui tbody { display: table-row-group; }
                    .req-table-ui tr { page-break-inside: avoid; height: 32px; } 
                    
                    .req-table-ui th { background: #fdba74 !important; color: #000 !important; font-weight: bold !important; border: 1px solid #000 !important; padding: 8px !important; text-align: center !important; vertical-align: middle !important; font-size: 12pt !important; } 
                    .req-table-ui td { border: 1px solid #000 !important; padding: 6px 8px !important; color: #000 !important; font-weight: 600 !important; vertical-align: middle !important; } 
                    
                    .col-no { width: 8%; text-align: center; } .col-code { width: 15%; text-align: center; } .col-name { width: 35%; } .col-unit { width: 10%; text-align: center; } .col-qty { width: 12%; text-align: center; font-weight: bold !important; } .col-remark { width: 20%; } 
                    
                    .print-signature-section { width: 100%; margin-top: 60px; page-break-inside: avoid; border: 0 !important; } 
                    .sig-table { width: 100%; border: 0 !important; border-collapse: collapse; } 
                    .sig-table td, .sig-table tr { border: 0 !important; font-size: 12pt !important; font-weight: 600 !important; color: #000 !important; padding: 5px !important; } 
                    .excel-checkbox { display: inline-block; width: 16px; height: 16px; border: 1px solid #000; vertical-align: middle; margin-right: 8px; position: relative; top: -2px; } 
                    .sig-line { margin-bottom: 8px; white-space: nowrap; border: 0 !important; } 
                </style>
            </head>
            <body>
                ${printContent}
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.focus();
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `;

        let doc = iframe.contentWindow.document;
        doc.open();
        doc.write(html);
        doc.close();

        setTimeout(() => { Swal.close(); }, 1500);
    }

    handleSearchInput(input) {
        const query = input.value.toLowerCase().trim();
        const dropdown = input.parentElement.querySelector('.autocomplete-dropdown');
        
        if (!dropdown) return;

        document.querySelectorAll('.autocomplete-dropdown').forEach(d => {
            if (d !== dropdown) d.classList.add('d-none');
        });

        let filtered = this.allItems;
        if (query) {
            filtered = this.allItems.filter(i => 
                (i.name && i.name.toLowerCase().includes(query)) || 
                (i.item_code && i.item_code.toLowerCase().includes(query)) ||
                (i.code && i.code.toLowerCase().includes(query))
            );
        }
        
        filtered = filtered.slice(0, 30); 

        if (filtered.length === 0) {
            dropdown.innerHTML = '<div class="p-4 text-center text-muted small"><i class="fa-solid fa-box-open fa-2x mb-2 opacity-50"></i><br>ไม่พบพัสดุในคลัง</div>';
        } else {
            let html = '';
            const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const highlightRegex = new RegExp(`(${safeQuery})`, 'gi');

            filtered.forEach((i, idx) => {
                let code = i.item_code || i.code || i.id;
                let unit = i.unit_small || i.unit || '-';
                let safeName = this.#escapeHTML(i.name);
                let safeCode = this.#escapeHTML(code);
                let safeUnit = this.#escapeHTML(unit);

                let displayName = query ? safeName.replace(highlightRegex, '<span class="text-primary fw-bold">$1</span>') : safeName;
                let activeClass = (idx === 0 && query !== '') ? 'active-nav' : '';

                html += `
                    <div class="ac-item ${activeClass}" data-code="${safeCode}" data-name="${safeName}" data-unit="${safeUnit}" onclick="App.pages.monthly_requisition.selectAutocompleteItem(this)">
                        <div class="ac-item-name">${displayName}</div>
                        <div class="ac-item-detail">
                            <span class="text-primary fw-bold"><i class="fa-solid fa-barcode me-1"></i> ${safeCode}</span> 
                            <span class="text-warning-dark fw-bold ms-3"><i class="fa-solid fa-box-open me-1"></i> ${safeUnit}</span>
                        </div>
                    </div>
                `;
            });
            dropdown.innerHTML = html;
        }
        
        dropdown.classList.remove('d-none');
        this.handleInputChanged();
    }

    handleSearchKeydown(event, input) {
        const dropdown = input.parentElement.querySelector('.autocomplete-dropdown');
        if (!dropdown || dropdown.classList.contains('d-none')) return;

        const items = Array.from(dropdown.querySelectorAll('.ac-item'));
        if (items.length === 0) return;

        let currentIndex = items.findIndex(item => item.classList.contains('active-nav'));

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (currentIndex >= 0) items[currentIndex].classList.remove('active-nav');
            currentIndex = (currentIndex + 1) % items.length;
            items[currentIndex].classList.add('active-nav');
            items[currentIndex].scrollIntoView({ block: 'nearest' });
        } 
        else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (currentIndex >= 0) items[currentIndex].classList.remove('active-nav');
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            items[currentIndex].classList.add('active-nav');
            items[currentIndex].scrollIntoView({ block: 'nearest' });
        } 
        else if (event.key === 'Enter') {
            event.preventDefault();
            if (currentIndex >= 0) {
                this.selectAutocompleteItem(items[currentIndex]);
            }
        } 
        else if (event.key === 'Escape') {
            dropdown.classList.add('d-none');
        }
    }

    selectAutocompleteItem(element) {
        const code = element.getAttribute('data-code');
        const name = element.getAttribute('data-name');
        const unit = element.getAttribute('data-unit');
        
        const tr = element.closest('tr');
        if(tr) {
            tr.querySelector('.code-inp').value = code;
            tr.querySelector('.name-inp').value = name;
            tr.querySelector('.unit-inp').value = unit;
            
            const dropdown = tr.querySelector('.autocomplete-dropdown');
            if(dropdown) dropdown.classList.add('d-none');
            
            const qtyInput = tr.querySelector('.qty-inp');
            if(qtyInput) { qtyInput.focus(); qtyInput.select(); }
        }

        this.updateRowNumbers();
        this.handleInputChanged();
    }

    getCurrentMonthKey() {
        const picker = document.getElementById('req-month-picker');
        return picker ? picker.value : new Date().toISOString().slice(0, 7);
    }

    onMonthChanged(newMonthVal) {
        this.loadCurrentMonthData();
        this.renderTable();
    }

    loadCurrentMonthData() {
        const monthKey = this.getCurrentMonthKey();
        const localDrafts = this.getLocalDrafts();
        
        if (this.savedRequisitions[monthKey]) {
            this.syncedItems = this.savedRequisitions[monthKey].items || [];
            this.saveCurrentMonthLocalDraft(true); 
            this.updateSyncStatusUI();
        } 
        else if (localDrafts[monthKey] && Array.isArray(localDrafts[monthKey])) {
            this.syncedItems = localDrafts[monthKey];
            this.updateSyncStatusUI();
        } 
        else {
            this.syncedItems = [];
            this.updateSyncStatusUI();
        }
    }

    updateSyncStatusUI(isFreshPayload = false) {
        const statusBox = document.getElementById('sync-status-text');
        if(!statusBox) return;

        const monthKey = this.getCurrentMonthKey();
        const localDrafts = this.getLocalDrafts();

        if (isFreshPayload) {
            statusBox.innerHTML = '<span class="badge shadow-sm rounded-pill fw-bold" style="background-color: #fef08a !important; color: #92400e !important; font-size: 13px; border: 1px solid #fcd34d;"><i class="fa-solid fa-bolt me-1"></i> ดึงยอดใหม่จากหน้าคำนวณ (ยังไม่ถูกบันทึกลงระบบ)</span>';
        }
        else if (this.savedRequisitions[monthKey]) {
            statusBox.innerHTML = '<span class="badge shadow-sm rounded-pill fw-bold" style="background-color: #d1fae5 !important; color: #065f46 !important; font-size: 13px; border: 1px solid #6ee7b7;"><i class="fa-solid fa-cloud-check me-1"></i> บันทึกในฐานข้อมูลคลาวด์แล้ว (คุณสามารถแก้ไขตัวเลขได้)</span>';
        }
        else if (localDrafts[monthKey] && Array.isArray(localDrafts[monthKey]) && localDrafts[monthKey].length > 0) {
            statusBox.innerHTML = '<span class="badge shadow-sm rounded-pill fw-bold" style="background-color: #fef08a !important; color: #92400e !important; font-size: 13px; border: 1px solid #fcd34d;"><i class="fa-solid fa-file-pen me-1"></i> แบบร่างในเครื่อง (ยังไม่ถูกบันทึกลงระบบคลาวด์)</span>';
        }
        else {
            statusBox.innerHTML = '<span class="badge shadow-sm rounded-pill fw-bold" style="background-color: #fee2e2 !important; color: #b91c1c !important; font-size: 14px; border: 1px solid #fca5a5;"><i class="fa-solid fa-circle-exclamation me-1"></i> ยังไม่มีข้อมูล (สามารถเพิ่มรายการด้วยมือ หรือดึงยอดมาคำนวณ)</span>';
        }
    }

    saveToCloudDatabase() {
        if(this.syncedItems.length === 0) {
            Swal.fire('ตารางว่างเปล่า', 'ไม่มีรายการพัสดุให้บันทึกครับ กรุณาเพิ่มรายการก่อน', 'warning');
            return;
        }

        const monthKey = this.getCurrentMonthKey();
        
        Swal.fire({
            title: 'ยืนยันการบันทึกเข้าระบบ?',
            html: `ต้องการบันทึกใบเบิกของประจำเดือน <b class="text-primary">${this.getThaiMonthFromKey(monthKey)}</b> จำนวน ${this.syncedItems.length} รายการ เข้าระบบคลาวด์ใช่หรือไม่?<br><small class="text-muted">ข้อมูลนี้จะสามารถเปิดดูประวัติย้อนหลังได้จากคอมพิวเตอร์ทุกเครื่อง</small>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            confirmButtonText: '<i class="fa-solid fa-cloud-arrow-up me-1"></i> ยืนยันบันทึก',
            cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'premium-alert' }
        }).then((res) => {
            if (res.isConfirmed) {
                Swal.fire({ title: 'กำลังอัปโหลด...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                
                const payload = {
                    monthKey: monthKey,
                    items: this.syncedItems,
                    updatedAt: new Date().toISOString(),
                    updatedBy: App.currentUser ? App.currentUser.name : 'Unknown'
                };

                db.ref(`clinic_monthly_requisitions_v2/${monthKey}`).set(payload).then(() => {
                    Swal.fire({ title: 'บันทึกสำเร็จ!', text: 'ข้อมูลถูกบันทึกขึ้นฐานข้อมูลคลาวด์เรียบร้อยแล้ว', icon: 'success', timer: 1500, showConfirmButton: false });
                    this.updateSyncStatusUI();
                }).catch(err => {
                    Swal.fire('ข้อผิดพลาด', `บันทึกไม่สำเร็จ: ${err.message}`, 'error');
                });
            }
        });
    }

    openHistoryModal() {
        let keys = Object.keys(this.savedRequisitions).sort().reverse(); 
        
        if (keys.length === 0) {
            Swal.fire('ไม่พบประวัติ', 'ยังไม่เคยมีการบันทึกใบเบิกเข้าสู่ระบบคลาวด์เลยครับ', 'info');
            return;
        }

        let groupedByYear = {};
        keys.forEach(k => {
            let year = k.split('-')[0];
            let thaiYear = parseInt(year) + 543;
            if(!groupedByYear[thaiYear]) groupedByYear[thaiYear] = [];
            groupedByYear[thaiYear].push(k);
        });

        let historyHtml = '<div class="text-start mb-2" style="max-height: 50vh; overflow-y: auto; overflow-x: hidden; padding-right: 5px;">';
        
        for(let year in groupedByYear) {
            historyHtml += `<h6 class="fw-bold mt-3 mb-3 text-secondary border-bottom pb-2" style="font-family:'Prompt';"><i class="fa-solid fa-calendar-days me-2"></i> ปี ${year}</h6>`;
            historyHtml += `<div class="history-grid mb-4">`;
            
            groupedByYear[year].forEach(k => {
                const data = this.savedRequisitions[k];
                const itemCount = data.items ? data.items.length : 0;
                const dateStr = new Date(data.updatedAt).toLocaleDateString('th-TH');
                const monthNameOnly = this.getThaiMonthFromKey(k).split(' ')[0]; 
                
                historyHtml += `
                    <div class="history-item" onclick="App.pages.monthly_requisition.loadHistoryMonth('${k}')">
                        <button class="history-item-del-btn" onclick="App.pages.monthly_requisition.deleteHistoryMonth(event, '${k}')" title="ลบประวัติเดือนนี้">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                        <div class="history-item-month">${monthNameOnly}</div>
                        <div class="history-item-badge"><i class="fa-solid fa-boxes-packing me-1"></i> ${itemCount} รายการ</div>
                        <div class="text-muted" style="font-size: 11px; font-family:'Sarabun';">อัปเดต: ${dateStr}</div>
                    </div>
                `;
            });
            historyHtml += `</div>`;
        }
        historyHtml += '</div>';

        Swal.fire({
            title: '<h4 class="text-white fw-bold mb-0" style="font-family:\'Prompt\';"><i class="fa-solid fa-clock-rotate-left me-2"></i> ประวัติการเบิกสินค้าบนระบบ</h4>',
            html: `<p class="small text-muted mb-0 text-start" style="font-family:\'Sarabun\';">คลิกที่เดือนที่ต้องการเพื่อนำข้อมูลกลับมาแก้ไข (ข้อมูลเก่าเกิน 7 ปีจะถูกลบอัตโนมัติ)</p>${historyHtml}`,
            width: 750,
            showConfirmButton: false,
            showCloseButton: true,
            background: 'var(--bg-surface)',
            customClass: { popup: 'premium-alert' }
        });
    }

    loadHistoryMonth(monthKey) {
        Swal.close();
        const monthPicker = document.getElementById('req-month-picker');
        if (monthPicker) {
            monthPicker.value = monthKey;
            this.onMonthChanged(monthKey);
            if(window.SecurityShield) window.SecurityShield.showNativeToast(`ดึงข้อมูลเดือน ${this.getThaiMonthFromKey(monthKey)} มาแก้ไข`);
        }
    }

    deleteHistoryMonth(event, monthKey) {
        event.stopPropagation(); 
        
        Swal.fire({
            title: 'ยืนยันการลบประวัติ?',
            html: `ต้องการลบประวัติการเบิกของเดือน <b class="text-danger">${this.getThaiMonthFromKey(monthKey)}</b> ใช่หรือไม่?<br><small class="text-muted">ข้อมูลที่ลบจะไม่สามารถกู้คืนได้</small>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: '<i class="fa-solid fa-trash me-1"></i> ลบทิ้ง',
            cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'premium-alert' }
        }).then((res) => {
            if(res.isConfirmed) {
                Swal.fire({ title: 'กำลังลบ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                db.ref(`clinic_monthly_requisitions_v2/${monthKey}`).remove().then(() => {
                    Swal.fire({ title: 'ลบสำเร็จ!', icon: 'success', timer: 1500, showConfirmButton: false });
                    
                    if (this.getCurrentMonthKey() === monthKey) {
                        this.syncedItems = [];
                        this.saveCurrentMonthLocalDraft(true);
                        this.renderTable();
                        this.updateSyncStatusUI();
                    }
                    
                    setTimeout(() => { this.openHistoryModal(); }, 1600);
                    
                }).catch(err => {
                    Swal.fire('เกิดข้อผิดพลาด', err.message, 'error');
                });
            }
        });
    }

    getLocalDrafts() {
        try {
            const raw = localStorage.getItem('monthly_requisition_ledgers_v2');
            return raw ? JSON.parse(raw) : {};
        } catch(e) { return {}; }
    }

    saveCurrentMonthLocalDraft(silent = false) {
        const monthKey = this.getCurrentMonthKey();
        let allLedgers = this.getLocalDrafts();
        
        const sevenYearsAgo = new Date();
        sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);
        
        Object.keys(allLedgers).forEach(k => {
            let [y, m] = k.split('-').map(Number);
            let ledgerDate = new Date(y, m - 1, 1);
            if (ledgerDate < sevenYearsAgo) { delete allLedgers[k]; }
        });

        allLedgers[monthKey] = this.syncedItems;
        localStorage.setItem('monthly_requisition_ledgers_v2', JSON.stringify(allLedgers));
        
        if(!silent) this.updateSyncStatusUI();
    }

    clearAllRequisition() {
        const monthKey = this.getCurrentMonthKey();
        const hasCloudRecord = !!this.savedRequisitions[monthKey];
        const warningMsg = hasCloudRecord 
            ? `⚠️ <b class="text-danger">ข้อมูลเดือนนี้ถูกบันทึกบนคลาวด์แล้ว!</b><br>การล้างหน้าจอจะไม่กระทบฐานข้อมูลหลัก (หากต้องการลบประวัติหลัก ให้ไปกดลบที่เมนู "ประวัติย้อนหลัง")` 
            : `ต้องการลบรายการทั้งหมดในใบเบิกบนหน้าจอนี้ใช่หรือไม่?`;

        Swal.fire({
            title: `ล้างหน้าจอเดือน ${this.getThaiMonthFromKey(monthKey)}?`,
            html: warningMsg,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'ใช่, ล้างหน้าจอ',
            cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'premium-alert' }
        }).then((res) => {
            if (res.isConfirmed) {
                this.syncedItems = [];
                this.saveCurrentMonthLocalDraft(true);
                this.renderTable();
                this.updateSyncStatusUI();
                if(window.SecurityShield) window.SecurityShield.showNativeToast(`เคลียร์หน้าจอเรียบร้อยแล้ว`);
            }
        });
    }

    handleInputChanged() {
        this.calculateTotal();
        this.gatherDataToSync();
        this.saveCurrentMonthLocalDraft(); 
    }

    gatherDataToSync() {
        const rows = document.querySelectorAll('#req-table-body tr');
        const data = [];
        rows.forEach((row, idx) => {
            if(row.id === 'empty-state-row') return;
            data.push({
                order: row.querySelector('.order-val-cell').innerText, 
                item_code: row.querySelector('.code-inp').value,
                name: row.querySelector('.name-inp').value,
                unit: row.querySelector('.unit-inp').value,
                adjustedReq: row.querySelector('.qty-inp').value,
                remark: row.querySelector('.remark-inp').value
            });
        });
        this.syncedItems = data;
    }

    addNewRow() {
        const tbody = document.getElementById('req-table-body');
        const emptyState = document.getElementById('empty-state-row');
        if (emptyState) emptyState.remove(); 

        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td class="col-no text-center text-dark fw-bold order-val-cell fs-5">-</td>
            <td class="col-code">
                <input type="text" class="req-input text-center d-print-none print-sync-input code-inp" value="" oninput="App.pages.monthly_requisition.handleInputChanged()">
                <span class="print-val-display print-val-center"></span>
            </td>
            <td class="col-name" style="position: relative;">
                <input type="text" class="req-input d-print-none print-sync-input name-inp" value="" style="font-weight: 600;" autocomplete="off" 
                    onfocus="App.pages.monthly_requisition.handleSearchInput(this)" 
                    oninput="App.pages.monthly_requisition.handleSearchInput(this)" 
                    onkeydown="App.pages.monthly_requisition.handleSearchKeydown(event, this)" 
                    placeholder="คลิกเพื่อค้นหาพัสดุ...">
                <span class="print-val-display print-val-left"></span>
                <div class="autocomplete-dropdown d-none d-print-none"></div>
            </td>
            <td class="col-unit">
                <input type="text" class="req-input text-center d-print-none print-sync-input unit-inp" value="" oninput="App.pages.monthly_requisition.handleInputChanged()">
                <span class="print-val-display print-val-center"></span>
            </td>
            <td class="col-qty">
                <input type="number" min="0" class="req-input qty-input req-qty-val d-print-none print-sync-input qty-inp" value="1" oninput="App.pages.monthly_requisition.handleInputChanged()">
                <span class="print-val-display print-val-center"></span>
            </td>
            <td class="col-remark">
                <input type="text" class="req-input text-muted d-print-none print-sync-input remark-inp" placeholder="" oninput="App.pages.monthly_requisition.handleInputChanged()">
                <span class="print-val-display print-val-left"></span>
            </td>
            <td class="d-print-none text-center">
                <button class="btn btn-sm btn-outline-danger border-0 shadow-sm" onclick="App.pages.monthly_requisition.deleteRow(this)"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
        this.updateRowNumbers();
        this.handleInputChanged();
        
        setTimeout(() => { tr.querySelector('.name-inp').focus(); }, 50);

        document.getElementById('sync-status-text').innerHTML = '<span class="badge shadow-sm rounded-pill fw-bold" style="background-color: #fef08a !important; color: #92400e !important; font-size: 13px; border: 1px solid #fcd34d;"><i class="fa-solid fa-bolt me-1"></i> มีรายการพร้อมทำใบเบิก (สามารถเพิ่ม/ลบ/แก้ไขได้อิสระ)</span>';
    }

    deleteRow(btn) {
        const tr = btn.closest('tr');
        const itemName = tr.querySelector('.name-inp').value || 'รายการที่ไม่ได้ระบุชื่อ';
        
        Swal.fire({ 
            title: 'ยืนยันการลบทิ้ง?', 
            text: `ต้องการลบพัสดุ "${itemName}" ออกจากฟอร์มใบเบิกใช่หรือไม่?`, 
            icon: 'warning', 
            showCancelButton: true, confirmButtonColor: '#ef4444', 
            confirmButtonText: '<i class="fa-solid fa-trash me-1"></i> ลบรายการ', cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'premium-alert' }
        }).then((res) => { 
            if(res.isConfirmed) {
                tr.remove();
                this.updateRowNumbers();
                this.handleInputChanged();
                
                if(document.querySelectorAll('#req-table-body tr').length === 0) {
                    document.getElementById('req-table-body').innerHTML = '<tr id="empty-state-row"><td colspan="7" class="text-center py-5 text-muted d-print-none"><i class="fa-solid fa-folder-open fa-3x mb-3 opacity-50"></i><br>ยังไม่มีข้อมูลรายการเบิก<br><small>กรุณาเพิ่มรายการ หรือดึงยอดจากหน้าคำนวณยอดเบิก</small></td></tr>';
                    this.updateSyncStatusUI();
                }
            }
        });
    }

    updateRowNumbers() {
        const rows = document.querySelectorAll('#req-table-body tr');
        rows.forEach((row) => {
            if(row.id === 'empty-state-row') return;
            const nameInp = row.querySelector('.name-inp');
            const numCell = row.querySelector('.order-val-cell');
            if(nameInp && numCell) {
                let itemName = nameInp.value.trim();
                let masterItem = this.allItems.find(m => m.name === itemName);
                numCell.innerText = (masterItem && masterItem.order !== undefined && masterItem.order !== "") ? masterItem.order : "-";
            }
        });
    }

    renderTable() {
        const tbody = document.getElementById('req-table-body');
        let rowsHtml = '';
        
        if (this.syncedItems.length === 0) {
            tbody.innerHTML = '<tr id="empty-state-row"><td colspan="7" class="text-center py-5 text-muted d-print-none"><i class="fa-solid fa-folder-open fa-3x mb-3 opacity-50"></i><br>ยังไม่มีข้อมูลรายการเบิก<br><small>กรุณาเพิ่มรายการ หรือดึงยอดจากหน้าคำนวณยอดเบิก</small></td></tr>';
            document.getElementById('total-qty-badge').innerText = "0";
            return;
        }

        this.syncedItems.forEach((item, index) => {
            let masterItem = this.allItems.find(m => m.id === item.id || m.name === item.name);
            
            let realCode = item.item_code || item.code || (masterItem ? (masterItem.item_code || masterItem.code) : '');
            let realUnit = item.unit || (masterItem ? (masterItem.unit_small || masterItem.unit) : '');
            let realOrder = (masterItem && masterItem.order !== undefined && masterItem.order !== "") ? masterItem.order : "-";

            item.item_code = realCode;
            item.unit = realUnit;
            item.order = realOrder;

            rowsHtml += `
            <tr>
                <td class="col-no text-center text-dark fw-bold order-val-cell fs-5">${this.#escapeHTML(String(realOrder))}</td>
                <td class="col-code">
                    <input type="text" class="req-input text-center d-print-none print-sync-input code-inp" value="${this.#escapeHTML(realCode)}" oninput="App.pages.monthly_requisition.handleInputChanged()">
                    <span class="print-val-display print-val-center"></span>
                </td>
                <td class="col-name" style="position: relative;">
                    <input type="text" class="req-input d-print-none print-sync-input name-inp" value="${this.#escapeHTML(item.name || '')}" style="font-weight: 600;" autocomplete="off" 
                        onfocus="App.pages.monthly_requisition.handleSearchInput(this)" 
                        oninput="App.pages.monthly_requisition.handleSearchInput(this)" 
                        onkeydown="App.pages.monthly_requisition.handleSearchKeydown(event, this)" 
                        placeholder="คลิกเพื่อค้นหาพัสดุ...">
                    <span class="print-val-display print-val-left"></span>
                    <div class="autocomplete-dropdown d-none d-print-none"></div>
                </td>
                <td class="col-unit">
                    <input type="text" class="req-input text-center d-print-none print-sync-input unit-inp" value="${this.#escapeHTML(realUnit)}" oninput="App.pages.monthly_requisition.handleInputChanged()">
                    <span class="print-val-display print-val-center"></span>
                </td>
                <td class="col-qty">
                    <input type="number" min="0" class="req-input qty-input req-qty-val d-print-none print-sync-input qty-inp" value="${this.#escapeHTML(String(item.adjustedReq || item.qty || ''))}" oninput="App.pages.monthly_requisition.handleInputChanged()">
                    <span class="print-val-display print-val-center"></span>
                </td>
                <td class="col-remark">
                    <input type="text" class="req-input text-muted d-print-none print-sync-input remark-inp" placeholder="" value="${this.#escapeHTML(item.remark || '')}" oninput="App.pages.monthly_requisition.handleInputChanged()">
                    <span class="print-val-display print-val-left"></span>
                </td>
                <td class="d-print-none text-center">
                    <button class="btn btn-sm btn-outline-danger border-0 shadow-sm" onclick="App.pages.monthly_requisition.deleteRow(this)"><i class="fa-solid fa-trash"></i></button>
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
            if(input.value && parseInt(input.value) > 0) totalItems++;
        });
        const badge = document.getElementById('total-qty-badge');
        if(badge) badge.innerText = totalItems;
    }

    getThaiMonthFromKey(monthKey) {
        if(!monthKey) return "";
        const [y, m] = monthKey.split('-');
        const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
        return monthNames[parseInt(m) - 1] + " " + (parseInt(y) + 543);
    }

    getThaiMonth() {
        return this.getThaiMonthFromKey(document.getElementById('req-month-picker').value);
    }

    downloadExcel() {
        if(this.syncedItems.length === 0) { Swal.fire('ตารางว่างเปล่า', 'ไม่มีข้อมูลให้โหลด', 'warning'); return; }
        Swal.fire({ title: 'กำลังเขียนไฟล์ Excel...', didOpen: () => Swal.showLoading() });

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
            const worksheet = workbook.addWorksheet('ใบขอเบิกสินค้า', { views: [{ showGridLines: false }], pageSetup: { paperSize: 9, orientation: 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 1, margins: { left: 0.4, right: 0.4, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 } } });

            worksheet.mergeCells('A1:F1'); const titleRow = worksheet.getRow(1);
            titleRow.getCell(1).value = "ใบขอเบิกสินค้าหน่วยไตเทียม : หน่วยไตเทียม โรงพยาบาลแพร่คริสเตียน"; titleRow.getCell(1).font = { name: 'Tahoma', size: 16, bold: true, color: { argb: 'FF000000' } }; titleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }; titleRow.height = 35;
            worksheet.mergeCells('A2:F2'); const subtitleRow = worksheet.getRow(2);
            subtitleRow.getCell(1).value = "ประจำเดือน " + this.getThaiMonth(); subtitleRow.getCell(1).font = { name: 'Tahoma', size: 14, bold: true, color: { argb: 'FF000000' } }; subtitleRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' }; subtitleRow.height = 25;

            worksheet.columns = [ { width: 10 }, { width: 16 }, { width: 45 }, { width: 10 }, { width: 16 }, { width: 25 }  ];
            const headers = ["ลำดับคลัง", "รหัสสินค้า", "Consumable", "หน่วย", "จำนวนเบิก", "หมายเหตุ"];
            const headerRow = worksheet.getRow(4); headerRow.values = headers; headerRow.height = 30;
            const thinBorder = { top: { style: 'thin', color: { argb: 'FF000000' } }, left: { style: 'thin', color: { argb: 'FF000000' } }, bottom: { style: 'thin', color: { argb: 'FF000000' } }, right: { style: 'thin', color: { argb: 'FF000000' } } };

            for (let c = 1; c <= 6; c++) { const cell = headerRow.getCell(c); cell.font = { name: 'Tahoma', size: 12, bold: true, color: { argb: 'FF000000' } }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDBA74' } }; cell.border = thinBorder; cell.alignment = { horizontal: 'center', vertical: 'middle' }; }

            const rows = document.querySelectorAll('#req-table-body tr'); let currentRowNum = 5;
            rows.forEach((tr) => {
                if(tr.id === 'empty-state-row') return;
                let orderText = tr.querySelector('.order-val-cell').innerText.trim(); let code = tr.querySelector('.code-inp').value || ""; let name = tr.querySelector('.name-inp').value || ""; let unit = tr.querySelector('.unit-inp').value || ""; let qty = tr.querySelector('.qty-inp').value || ""; let remark = tr.querySelector('.remark-inp').value || "";
                const row = worksheet.getRow(currentRowNum);
                
                row.values = [ isNaN(Number(orderText)) ? orderText : Number(orderText), code, name, unit, qty ? Number(qty) : "", remark ]; row.height = 26; 
                for (let c = 1; c <= 6; c++) { const cell = row.getCell(c); cell.font = { name: 'Tahoma', size: 12, bold: (c === 3 || c === 5), color: { argb: 'FF000000' } }; cell.border = thinBorder; if (c === 3 || c === 6) cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }; else cell.alignment = { horizontal: 'center', vertical: 'middle' }; }
                currentRowNum++;
            });

            let sigStartRow = currentRowNum + 3;
            worksheet.mergeCells(`A${sigStartRow}:C${sigStartRow}`); worksheet.mergeCells(`D${sigStartRow}:F${sigStartRow}`);
            worksheet.getRow(sigStartRow).getCell(1).value = "ลงชื่อผู้เบิก......................................................."; worksheet.getRow(sigStartRow).getCell(4).value = "              ☐ อนุมัติ";
            worksheet.mergeCells(`A${sigStartRow+1}:C${sigStartRow+1}`); worksheet.mergeCells(`D${sigStartRow+1}:F${sigStartRow+1}`);
            worksheet.getRow(sigStartRow+1).getCell(1).value = "(.......................................................)"; worksheet.getRow(sigStartRow+1).getCell(4).value = "              ☐ ไม่อนุมัติ";
            worksheet.mergeCells(`A${sigStartRow+2}:C${sigStartRow+2}`); worksheet.mergeCells(`D${sigStartRow+2}:F${sigStartRow+2}`);
            worksheet.getRow(sigStartRow+2).getCell(1).value = "วันที่........../........../.........."; worksheet.getRow(sigStartRow+2).getCell(4).value = "ลงชื่อผู้อนุมัติ...................................................";
            worksheet.mergeCells(`D${sigStartRow+3}:F${sigStartRow+3}`); worksheet.getRow(sigStartRow+3).getCell(4).value = "Operation Executive";
            worksheet.mergeCells(`D${sigStartRow+4}:F${sigStartRow+4}`); worksheet.getRow(sigStartRow+4).getCell(4).value = "วันที่........................................";

            for (let i = 0; i < 5; i++) { const row = worksheet.getRow(sigStartRow + i); row.height = 24; row.eachCell((cell, colNumber) => { cell.font = { name: 'Tahoma', size: 12, bold: true, color: { argb: 'FF000000' } }; if (colNumber <= 3) cell.alignment = { horizontal: 'center', vertical: 'middle' }; else cell.alignment = { horizontal: 'left', vertical: 'middle' }; }); }

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a'); link.href = url; link.download = `ใบเบิกพัสดุ_${document.getElementById('req-month-picker').value}.xlsx`; document.body.appendChild(link); link.click(); document.body.removeChild(link); window.URL.revokeObjectURL(url); Swal.close();
        });
    }

    #escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
}

const MonthlyRequisitionPage = new MonthlyRequisitionPageComponent();
window.MonthlyRequisitionPage = MonthlyRequisitionPage;