// js/pages/finance.js
// 🚀 โมดูลสรุปรายได้และเบิกจ่ายคลินิก (Enterprise RCM Edition: Detailed Breakdown + 5-Year Auto Purge)

const FinancePage = {
    startDate: '',
    endDate: '',
    allVisits: [], allExpenses: [], clinicRights: [], modalities: [], stockTransactions: [], inventoryItems: [], chartInstance: null, hasCleanedUp: false,
    _summaryData: {}, // 🚨 เก็บตัวแปรสรุปยอดเชิงลึก

    html: `
        <style>
            * { -webkit-font-smoothing: antialiased !important; -moz-osx-font-smoothing: grayscale !important; text-rendering: optimizeLegibility !important; }
            .form-label, .text-secondary, .text-muted { color: #334155 !important; font-weight: 600 !important; letter-spacing: 0.2px; }
            .form-control, .form-select, .input-modern { color: #0f172a !important; font-weight: 700 !important; font-size: 14.5px !important; }
            
            .btn-outline-success.bg-white:hover { background-color: #10b981 !important; border-color: #10b981 !important; color: #ffffff !important; }
            .btn-outline-success.bg-white:hover i { color: #ffffff !important; }
            .btn-outline-info.bg-white:hover { background-color: #0ea5e9 !important; border-color: #0ea5e9 !important; color: #ffffff !important; }
            .btn-outline-info.bg-white:hover i { color: #ffffff !important; }

            .finance-nav-tabs { border-bottom: 2px solid #e2e8f0; gap: 5px; flex-wrap: nowrap; overflow-x: auto; white-space: nowrap; padding-bottom: 2px; }
            .finance-nav-tabs::-webkit-scrollbar { height: 4px; }
            .finance-nav-tabs::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
            .finance-nav-tabs .nav-link { border: none; color: var(--muted); font-weight: 600; padding: 14px 24px; border-radius: 12px 12px 0 0; transition: all 0.3s ease; background: transparent; position: relative; font-family:'Prompt'; font-size:15px; }
            .finance-nav-tabs .nav-link:hover { color: var(--primary); background: var(--bg-main); }
            .finance-nav-tabs .nav-link.active { background: #fff; box-shadow: 0 -4px 10px rgba(0,0,0,0.02); color: var(--primary); }
            .finance-nav-tabs .nav-link.active::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 3px; border-radius: 3px 3px 0 0; background: var(--primary); }
            
            .stat-card-finance { transition: all 0.3s ease; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; position: relative; overflow: hidden; background: #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); height: 100%; display: flex; flex-direction: column; }
            .stat-card-finance:hover { transform: translateY(-5px); box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.1); border-color: #cbd5e1; }
            .stat-icon-bg { position: absolute; top: -20px; right: -20px; opacity: 0.04; font-size: 150px; pointer-events: none; z-index: 0; }
            
            .table-finance th { background: #f8fafc; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 13px; padding: 14px 12px; border-bottom: 2px solid #e2e8f0; border-top: none; white-space: nowrap; }
            .table-finance td { padding: 14px 12px; vertical-align: middle; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .table-finance tr:hover td { background: #f8fafc; }
            
            .ledger-in { color: #10b981; font-weight: bold; }
            .ledger-out { color: #ef4444; font-weight: bold; }

            .native-date-wrapper {
                position: relative; display: inline-flex; align-items: center; background: #ffffff;
                border: 2px solid #e2e8f0; border-radius: 50px; padding: 6px 18px; cursor: pointer; overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.3s;
            }
            .native-date-wrapper:hover { border-color: #3b82f6; background: #f8fafc; }
            .native-date-wrapper input[type="date"] { position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 10; border: none; background: transparent; color: transparent; }
            .native-date-wrapper input[type="date"]::-webkit-datetime-edit, .native-date-wrapper input[type="date"]::-webkit-datetime-edit-text, .native-date-wrapper input[type="date"]::-webkit-datetime-edit-month-field, .native-date-wrapper input[type="date"]::-webkit-datetime-edit-day-field, .native-date-wrapper input[type="date"]::-webkit-datetime-edit-year-field { color: transparent !important; background: transparent !important; }
            .native-date-wrapper input[type="date"]::-webkit-calendar-picker-indicator { position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; margin: 0; padding: 0; cursor: pointer; opacity: 0; }
            .native-date-wrapper span { position: relative; z-index: 1; font-family: 'Prompt'; font-weight: 800; color: #2563eb; font-size: 14px; pointer-events: none; }
            .native-date-wrapper i { position: relative; z-index: 1; margin-right: 8px; font-size: 16px; color: #2563eb; pointer-events: none; }

            /* 🚨 ส่วนแสดงรายละเอียดเชิงลึก (Breakdown Box) */
            .breakdown-box { background: #f8fafc; border-radius: 12px; padding: 12px; margin-top: auto; border: 1px solid #e2e8f0; position: relative; z-index: 1; }
            .breakdown-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 13px; }
            .breakdown-row:last-child { margin-bottom: 0; }
            .breakdown-label { color: #64748b; font-weight: 600; display: flex; align-items: center; gap: 6px; }
            .breakdown-val { color: #0f172a; font-weight: 700; font-family: 'Prompt'; }
        </style>

        <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
                <h2 class="page-title text-primary" style="font-size: 28px;"><i class="fa-solid fa-file-invoice-dollar me-2"></i> ระบบบัญชีแยกประเภท (General Ledger)</h2>
                <p class="text-muted mt-1 mb-0" id="fin-month-text">แสดงผลแบบละเอียดและสรุปกระแสเงินสด</p>
            </div>
            <div class="d-flex gap-2 align-items-center flex-wrap">
                <button class="btn btn-outline-info fw-bold shadow-sm rounded-pill px-4 card-hover-float bg-white" onclick="FinancePage.manageModalities()">
                    <i class="fa-solid fa-pump-medical me-2 text-info"></i> ราคาโหมด
                </button>
                <button class="btn btn-outline-success fw-bold shadow-sm rounded-pill px-4 card-hover-float bg-white" onclick="FinancePage.manageRights()">
                    <i class="fa-solid fa-shield-heart me-2 text-success"></i> สิทธิรักษา
                </button>
                
                <div class="d-flex align-items-center bg-light p-1 rounded-pill shadow-sm border ms-2">
                    <div class="native-date-wrapper">
                        <i class="fa-solid fa-calendar-days"></i>
                        <span id="fin-start-display">กำลังโหลด...</span>
                        <input type="date" id="fin-start-date" onchange="FinancePage.onDateChange()">
                    </div>
                    <span class="mx-2 text-muted fw-bold small">ถึง</span>
                    <div class="native-date-wrapper">
                        <i class="fa-solid fa-calendar-days"></i>
                        <span id="fin-end-display">กำลังโหลด...</span>
                        <input type="date" id="fin-end-date" onchange="FinancePage.onDateChange()">
                    </div>
                    <button class="btn btn-primary rounded-pill px-3 ms-2 fw-bold shadow-sm" style="z-index: 15;" onclick="FinancePage.setThisMonth()">เดือนนี้</button>
                </div>
            </div>
        </div>

        <div class="row g-4 mb-4 align-items-stretch">
            <div class="col-md-4">
                <div class="stat-card-finance" style="border-top: 5px solid var(--success);">
                    <i class="fa-solid fa-arrow-trend-up stat-icon-bg"></i>
                    <div class="d-flex justify-content-between mb-2 position-relative z-1">
                        <div class="text-success-dark fw-bold small text-uppercase">รายรับรวม (Total Income)</div>
                        <div class="badge-soft-success rounded px-2 py-1"><i class="fa-solid fa-plus"></i></div>
                    </div>
                    <div class="fs-1 fw-bold text-dark position-relative z-1 mb-3">฿<span id="fin-total-income"><i class="fas fa-spinner fa-spin fs-4"></i></span></div>
                    
                    <div class="breakdown-box border-success-subtle">
                        <div class="breakdown-row"><span class="breakdown-label"><i class="fa-solid fa-pump-medical text-success"></i> ค่าฟอกเลือด</span><span class="breakdown-val" id="fin-sum-dialysis">0.00</span></div>
                        <div class="breakdown-row"><span class="breakdown-label"><i class="fa-solid fa-pills text-warning-dark"></i> ค่ายาและเวชภัณฑ์</span><span class="breakdown-val" id="fin-sum-med">0.00</span></div>
                        <div class="breakdown-row"><span class="breakdown-label"><i class="fa-solid fa-vial-virus text-danger"></i> ค่าผลตรวจแล็บ</span><span class="breakdown-val" id="fin-sum-lab">0.00</span></div>
                        <div class="breakdown-row"><span class="breakdown-label"><i class="fa-solid fa-x-ray text-info"></i> ค่าภาพถ่ายรังสี</span><span class="breakdown-val" id="fin-sum-xray">0.00</span></div>
                        <div class="mt-2 pt-2 border-top border-success-subtle text-success fw-bold small text-center">อ้างอิงจากผู้ป่วย <span id="fin-pt-count">0</span> คิว (สถานะเสร็จสิ้น)</div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="stat-card-finance" style="border-top: 5px solid var(--danger);">
                    <i class="fa-solid fa-arrow-trend-down stat-icon-bg"></i>
                    <div class="d-flex justify-content-between mb-2 position-relative z-1">
                        <div class="text-danger-dark fw-bold small text-uppercase">รายจ่ายรวม (Total Expense)</div>
                        <div class="badge-soft-danger rounded px-2 py-1"><i class="fa-solid fa-minus"></i></div>
                    </div>
                    <div class="fs-1 fw-bold text-dark position-relative z-1 mb-3">฿<span id="fin-total-expense"><i class="fas fa-spinner fa-spin fs-4"></i></span></div>
                    
                    <div class="breakdown-box border-danger-subtle">
                        <div class="breakdown-row"><span class="breakdown-label"><i class="fa-solid fa-file-invoice text-danger"></i> บิลค่าใช้จ่ายทั่วไป</span><span class="breakdown-val" id="fin-sum-opex">0.00</span></div>
                        <div class="breakdown-row"><span class="breakdown-label"><i class="fa-solid fa-box-open text-secondary"></i> ต้นทุนตัดเบิกพัสดุ</span><span class="breakdown-val" id="fin-sum-stock">0.00</span></div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-4">
                <div class="stat-card-finance" style="border-top: 5px solid var(--primary); background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);">
                    <i class="fa-solid fa-scale-balanced stat-icon-bg"></i>
                    <div class="d-flex justify-content-between mb-2 position-relative z-1">
                        <div class="text-primary fw-bold small text-uppercase">กำไรสุทธิ (Net Cash Flow)</div>
                        <div class="badge-soft-primary rounded px-2 py-1"><i class="fa-solid fa-equals"></i></div>
                    </div>
                    <div class="fs-1 fw-bold position-relative z-1 mb-3" id="fin-net-profit"><i class="fas fa-spinner fa-spin fs-4"></i></div>
                    
                    <div class="breakdown-box border-primary-subtle" style="background: rgba(255,255,255,0.6);">
                        <div class="text-center text-primary fw-bold small"><i class="fa-solid fa-chart-line me-1"></i> ประมวลผลจากข้อมูลในช่วงวันที่เลือก</div>
                        <div class="text-center text-muted small mt-1">รายรับสุทธิ หักลบ รายจ่ายรวมสุทธิ</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row g-4 mb-4">
            <div class="col-12">
                <div class="modern-panel shadow-sm p-4 h-100" style="border-radius: 20px;">
                    <h5 class="fw-bold text-dark mb-4"><i class="fa-solid fa-chart-bar text-primary me-2"></i> กราฟเปรียบเทียบโครงสร้างรายได้และรายจ่าย</h5>
                    <div style="height: 300px; width: 100%; display: flex; justify-content: center; align-items: center;" id="fin-chart-container">
                        <canvas id="financeChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <ul class="nav finance-nav-tabs mb-4" id="financeTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#ledger-panel" type="button" role="tab">
                    <i class="fa-solid fa-book-open me-2"></i> สมุดบัญชีรวม (Statement)
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link text-success" data-bs-toggle="tab" data-bs-target="#income-panel" type="button" role="tab">
                    <i class="fa-solid fa-hand-holding-dollar me-2"></i> ทะเบียนรายรับแบบละเอียด
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link text-danger" data-bs-toggle="tab" data-bs-target="#expense-panel" type="button" role="tab">
                    <i class="fa-solid fa-money-bill-transfer me-2"></i> ทะเบียนรายจ่าย
                </button>
            </li>
        </ul>

        <div class="tab-content" id="financeTabContent">
            <div class="tab-pane fade show active" id="ledger-panel" role="tabpanel">
                <div class="modern-panel shadow-sm p-4 position-relative overflow-hidden" style="border-top: 5px solid var(--primary); border-radius: 20px;">
                    <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 200px; pointer-events: none;"><i class="fa-solid fa-file-lines"></i></div>
                    <div class="d-flex justify-content-between align-items-center mb-4 position-relative z-1 flex-wrap gap-2">
                        <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-clock-rotate-left text-primary me-2"></i> ความเคลื่อนไหวทางบัญชี (Running Ledger)</h5>
                        <div>
                            <button class="btn btn-primary fw-bold shadow-sm rounded-pill px-4 me-2" onclick="FinancePage.printSummary()">
                                <i class="fa-solid fa-chart-pie me-2 text-white"></i> พิมพ์รายงานสรุป (Report)
                            </button>
                            <button class="btn btn-dark fw-bold shadow-sm rounded-pill px-4" onclick="FinancePage.printLedger()">
                                <i class="fa-solid fa-print me-2 text-warning"></i> พิมพ์สมุดบัญชี (Statement)
                            </button>
                        </div>
                    </div>
                    <div class="table-responsive bg-white rounded-4 border border-light position-relative z-1 shadow-sm" style="max-height: 500px; overflow-y: auto;">
                        <table class="table table-finance w-100 mb-0">
                            <thead style="position: sticky; top: 0; z-index: 10;">
                                <tr>
                                    <th style="width: 15%;"><i class="fa-regular fa-calendar me-1"></i> วันที่ทำรายการ</th>
                                    <th style="width: 15%;">ประเภท</th>
                                    <th style="width: 35%;">รายละเอียดรายการ</th>
                                    <th class="text-end text-success" style="width: 10%;">เงินเข้า (IN)</th>
                                    <th class="text-end text-danger" style="width: 10%;">เงินออก (OUT)</th>
                                    <th class="text-end text-primary" style="width: 15%;">ยอดสะสม (BAL)</th>
                                </tr>
                            </thead>
                            <tbody id="fin-ledger-body"><tr><td colspan="6" class="text-center py-5">...</td></tr></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="tab-pane fade" id="income-panel" role="tabpanel">
                <div class="modern-panel shadow-sm p-4 position-relative overflow-hidden" style="border-top: 5px solid var(--success); border-radius: 20px;">
                    <div class="table-responsive bg-white rounded-4 border border-light position-relative z-1 shadow-sm">
                        <table class="table table-finance w-100 mb-0">
                            <thead>
                                <tr>
                                    <th style="width: 10%;"><i class="fa-regular fa-calendar me-1"></i> วันที่</th>
                                    <th style="width: 18%;"><i class="fa-solid fa-user me-1"></i> ผู้ป่วย</th>
                                    <th style="width: 12%;"><i class="fa-solid fa-tags me-1"></i> สิทธิ/โหมด</th>
                                    <th class="text-end text-primary" style="width: 12%;">ค่าฟอก (฿)</th>
                                    <th class="text-end text-warning-dark" style="width: 12%;">ค่ายา (฿)</th>
                                    <th class="text-end text-danger" style="width: 12%;">ค่าแล็บ (฿)</th>
                                    <th class="text-end text-info" style="width: 12%;">ค่า X-Ray (฿)</th>
                                    <th class="text-end text-success" style="width: 12%;">รวมสุทธิ (฿)</th>
                                </tr>
                            </thead>
                            <tbody id="fin-income-body"><tr><td colspan="8" class="text-center py-5">...</td></tr></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="tab-pane fade" id="expense-panel" role="tabpanel">
                <div class="modern-panel shadow-sm p-4 position-relative overflow-hidden" style="border-top: 5px solid var(--danger); border-radius: 20px;">
                    <div class="d-flex justify-content-between align-items-center mb-4 position-relative z-1 flex-wrap gap-3">
                        <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-file-invoice text-danger me-2"></i> ทะเบียนรายจ่ายและต้นทุน</h5>
                        <button class="btn btn-premium btn-premium-danger px-4 shadow-sm" onclick="FinancePage.openAddExpenseModal()">
                            <i class="fa-solid fa-plus me-2"></i> บันทึกรายจ่ายใหม่
                        </button>
                    </div>
                    <div class="table-responsive bg-white rounded-4 border border-light position-relative z-1 shadow-sm">
                        <table class="table table-finance w-100 mb-0">
                            <thead>
                                <tr>
                                    <th style="width: 12%;"><i class="fa-regular fa-calendar me-1"></i> วันที่</th>
                                    <th style="width: 15%;"><i class="fa-solid fa-tag me-1"></i> หมวดหมู่</th>
                                    <th style="width: 30%;"><i class="fa-solid fa-align-left me-1"></i> รายละเอียด</th>
                                    <th style="width: 15%;"><i class="fa-solid fa-code-branch me-1"></i> แหล่งที่มา</th>
                                    <th class="text-end text-danger" style="width: 15%;">ยอดจ่าย (฿)</th>
                                    <th class="text-center" style="width: 13%;">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody id="fin-expense-body"><tr><td colspan="6" class="text-center py-5">...</td></tr></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `,

    formatDateLocal: function(d) {
        let month = '' + (d.getMonth() + 1), day = '' + d.getDate(), year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [year, month, day].join('-');
    },

    formatDateTh: function(isoStr) {
        if(!isoStr) return '-'; const d = new Date(isoStr);
        return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth() + 1).padStart(2,'0')}/${d.getFullYear() + 543}`;
    },

    updateDateDisplays: function() {
        const sInput = document.getElementById('fin-start-date');
        const eInput = document.getElementById('fin-end-date');
        const sDisplay = document.getElementById('fin-start-display');
        const eDisplay = document.getElementById('fin-end-display');
        
        if (sInput) sInput.value = this.startDate;
        if (eInput) eInput.value = this.endDate;
        if (sDisplay) sDisplay.innerText = this.formatDateTh(this.startDate);
        if (eDisplay) eDisplay.innerText = this.formatDateTh(this.endDate);
    },

    init: function() {
        if (typeof db === 'undefined') return;
        
        if (!this.hasCleanedUp) this.autoCleanUpOldRecords();

        if(!this.startDate || !this.endDate) {
            const today = new Date();
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            this.startDate = this.formatDateLocal(thirtyDaysAgo);
            this.endDate = this.formatDateLocal(today);
        }

        try {
            db.ref('clinic_rights_v2').off();
            db.ref('clinic_modalities_v2').off();
            db.ref('inventory_database_v2/transactions').off();
            db.ref('patients_database_v2/visits').off();
            db.ref('clinic_expenses_v2').off();
        } catch(e) {}

        let attempts = 0;
        let domBinder = setInterval(() => {
            if(document.getElementById('fin-start-display')) {
                this.updateDateDisplays();
                clearInterval(domBinder);
            }
            if(++attempts > 50) clearInterval(domBinder);
        }, 100);

        db.ref('clinic_rights_v2').on('value', snap => {
            const data = snap.val();
            if(data) this.clinicRights = Array.isArray(data) ? data : Object.keys(data).map(k => data[k]);
            else {
                this.clinicRights = [{ id: 'R1', name: "ชำระเงินเอง", price: 1500 }, { id: 'R2', name: "บัตรทอง (สปสช.)", price: 1500 }, { id: 'R3', name: "ประกันสังคม", price: 1500 }, { id: 'R4', name: "เบิกจ่ายตรง (กรมบัญชีกลาง)", price: 2000 }];
                db.ref('clinic_rights_v2').set(this.clinicRights);
            }
        });

        db.ref('clinic_modalities_v2').on('value', snap => {
            const data = snap.val();
            if(data) this.modalities = Array.isArray(data) ? data : Object.keys(data).map(k => data[k]);
            else {
                this.modalities = [{ id: 'MOD1', name: 'HD ปกติ', price: 1500 }, { id: 'MOD2', name: 'Online HDF (Post)', price: 2500 }, { id: 'MOD3', name: 'Online HDF (Pre)', price: 2500 }, { id: 'MOD4', name: 'HF', price: 2000 }];
                db.ref('clinic_modalities_v2').set(this.modalities);
            }
        });

        db.ref('inventory_database_v2/items').once('value', snap => {
            const data = snap.val();
            this.inventoryItems = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
        });

        db.ref('inventory_database_v2/transactions').on('value', snap => {
            if (!document.getElementById('fin-ledger-body')) return;
            const data = snap.val();
            this.stockTransactions = data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : [];
            this.processData();
        });

        db.ref('patients_database_v2/visits').on('value', snap => {
            if (!document.getElementById('fin-ledger-body')) return;
            const data = snap.val();
            this.allVisits = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
            this.processData();
        });

        db.ref('clinic_expenses_v2').on('value', snap => {
            if (!document.getElementById('fin-ledger-body')) return;
            const data = snap.val();
            this.allExpenses = data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : [];
            this.processData();
        });
    },

    autoCleanUpOldRecords: function() {
        this.hasCleanedUp = true;
        const cutoffDate = new Date(); 
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 5);
        const cutoffStr = cutoffDate.toISOString().split('T')[0];

        db.ref('clinic_expenses_v2').orderByChild('date').endAt(cutoffStr).once('value').then(snap => {
            if (snap.exists()) {
                let updates = {}; 
                let deletedCount = 0;
                snap.forEach(child => { 
                    updates[child.key] = null; 
                    deletedCount++;
                });
                db.ref('clinic_expenses_v2').update(updates).then(() => {
                    console.log(`[Auto-Purge] ลบประวัติรายจ่ายคลินิกที่เก่าเกิน 5 ปี สำเร็จ จำนวน ${deletedCount} รายการ`);
                });
            }
        });
    },

    onDateChange: function() {
        const sInput = document.getElementById('fin-start-date').value;
        const eInput = document.getElementById('fin-end-date').value;
        if(sInput && eInput) {
            if(new Date(sInput) > new Date(eInput)) { 
                Swal.fire('ข้อผิดพลาด', 'วันเริ่มต้นต้องไม่มากกว่าวันสิ้นสุด', 'warning'); 
                this.updateDateDisplays(); 
                return; 
            }
            this.startDate = sInput; 
            this.endDate = eInput;
            this.updateDateDisplays();
            this.processData();
        }
    },

    setThisMonth: function() {
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        this.startDate = this.formatDateLocal(firstDay);
        this.endDate = this.formatDateLocal(lastDay);
        this.updateDateDisplays();
        this.processData();
    },

    processData: function() {
        if (!document.getElementById('fin-income-body')) return;
        if (!this.startDate || !this.endDate) return;
        
        document.getElementById('fin-month-text').innerHTML = `ข้อมูลบัญชีตั้งแต่ <b class="text-primary">${this.formatDateTh(this.startDate)}</b> ถึง <b class="text-primary">${this.formatDateTh(this.endDate)}</b>`;

        // 🚨 ตัวแปรเก็บค่าสำหรับแจกแจงแหล่งที่มา
        let totalIncome = 0; let totalExpense = 0;
        let sumDialysis = 0; let sumMed = 0; let sumLab = 0; let sumXray = 0;
        let sumOpEx = 0; let sumStock = 0;
        
        let incomeHtml = ''; let expenseHtml = ''; let masterLedger = []; 

        let filteredVisits = this.allVisits.filter(v => v && v.date && v.date >= this.startDate && v.date <= this.endDate && v.status === "เสร็จสิ้น");
        filteredVisits.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (filteredVisits.length === 0) {
            incomeHtml = `<tr><td colspan="8" class="text-center py-5 text-muted"><i class="fa-solid fa-file-invoice-dollar fa-3x mb-3" style="opacity:0.2;"></i><br>ไม่มีรายรับในช่วงเวลานี้</td></tr>`;
        } else {
            filteredVisits.forEach(v => {
                let base_fee = parseFloat(String(v.dialysis_fee || 0).replace(/,/g, '')); 
                if (base_fee <= 0) base_fee = 1500; 
                let med_fee = Number(v.med_fee || 0);
                let lab_fee = Number(v.lab_fee || 0);
                let xray_fee = Number(v.xray_fee || 0);
                let total_visit_fee = base_fee + med_fee + lab_fee + xray_fee;
                
                sumDialysis += base_fee;
                sumMed += med_fee;
                sumLab += lab_fee;
                sumXray += xray_fee;
                totalIncome += total_visit_fee; 

                incomeHtml += `
                <tr class="card-hover-float" style="cursor:default;">
                    <td><span class="fw-bold text-dark">${this.formatDateTh(v.date)}</span></td>
                    <td>
                        <div class="fw-bold text-dark" style="font-family:'Prompt'; font-size:14.5px;">${v.name || 'ไม่ระบุชื่อ'}</div>
                        <div class="small text-muted mt-1">HN: ${v.hn}</div>
                    </td>
                    <td>
                        <div class="badge badge-soft-success mb-1 w-100">${v.right || '-'}</div>
                        <div class="badge badge-soft-primary w-100">${v.hd_mode || 'HD ปกติ'}</div>
                    </td>
                    <td class="text-end fw-bold text-primary">${base_fee.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td class="text-end fw-bold text-warning-dark">${med_fee > 0 ? med_fee.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                    <td class="text-end fw-bold text-danger">${lab_fee > 0 ? lab_fee.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                    <td class="text-end fw-bold text-info">${xray_fee > 0 ? xray_fee.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                    <td class="text-end fw-bold text-success" style="font-size:16px;">+ ${total_visit_fee.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>`;

                masterLedger.push({ dateObj: new Date(v.date + " " + (v.time || "00:00")), dateStr: v.date, type: 'INCOME', category: 'ค่าบริการฟอกเลือดและอื่นๆ', desc: `คิวฟอกไต HN:${v.hn} (${v.name}) [${v.hd_mode||'HD'}]`, amount: total_visit_fee });
            });
        }
        
        // ยิงข้อมูลลงหน้าจอรายรับ
        document.getElementById('fin-income-body').innerHTML = incomeHtml;
        document.getElementById('fin-total-income').innerText = totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2});
        document.getElementById('fin-pt-count').innerText = filteredVisits.length;
        
        document.getElementById('fin-sum-dialysis').innerText = sumDialysis.toLocaleString(undefined, {minimumFractionDigits: 2});
        document.getElementById('fin-sum-med').innerText = sumMed.toLocaleString(undefined, {minimumFractionDigits: 2});
        document.getElementById('fin-sum-lab').innerText = sumLab.toLocaleString(undefined, {minimumFractionDigits: 2});
        document.getElementById('fin-sum-xray').innerText = sumXray.toLocaleString(undefined, {minimumFractionDigits: 2});

        // 🚨 เริ่มจัดการรายจ่าย
        let filteredExpenses = this.allExpenses.filter(e => e && e.date && e.date >= this.startDate && e.date <= this.endDate);
        let filteredStockLogs = this.stockTransactions.filter(log => log && log.timestamp && log.timestamp.split('T')[0] >= this.startDate && log.timestamp.split('T')[0] <= this.endDate && log.mode === 'out_sub' && log.note && log.note.includes("ตัดเบิก Flowsheet"));

        let aggregatedStockCosts = [];
        filteredStockLogs.forEach(log => {
            let item = this.inventoryItems.find(i => i.id === log.itemId);
            let cost = (item && item.price ? Number(item.price) : 0) * Number(log.qty);
            aggregatedStockCosts.push({ id: log.id, date: log.timestamp.split('T')[0], time: log.timestamp.split('T')[1].substring(0,5), category: 'ต้นทุนพัสดุฟอกเลือด', description: `เบิกพัสดุ: ${log.itemName} (x${log.qty})`, amount: cost, recorded_by: log.user || 'System', isSystemGenerated: true });
        });

        let combinedExpenses = [...filteredExpenses, ...aggregatedStockCosts];
        combinedExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (combinedExpenses.length === 0) {
            expenseHtml = `<tr><td colspan="6" class="text-center py-5 text-muted"><i class="fa-solid fa-receipt fa-3x mb-3" style="opacity:0.2;"></i><br>ไม่มีบันทึกรายจ่ายในช่วงเวลานี้</td></tr>`;
        } else {
            combinedExpenses.forEach(e => {
                let amount = Number(e.amount) || 0; 
                
                if(e.isSystemGenerated) sumStock += amount; else sumOpEx += amount;
                totalExpense += amount;

                let catBadge = `<span class="badge bg-secondary px-3 py-1 shadow-sm rounded-pill">${e.category}</span>`;
                if(e.category === 'ค่าน้ำ/ค่าไฟ/อินเทอร์เน็ต') catBadge = `<span class="badge badge-soft-warning px-3 py-1 shadow-sm rounded-pill">${e.category}</span>`;
                else if(e.category === 'เงินเดือน/ค่าจ้าง') catBadge = `<span class="badge badge-soft-primary px-3 py-1 shadow-sm rounded-pill">${e.category}</span>`;
                else if(e.category === 'สั่งซื้อยา/พัสดุ') catBadge = `<span class="badge badge-soft-info px-3 py-1 shadow-sm rounded-pill">${e.category}</span>`;
                else if(e.category === 'ซ่อมบำรุง/สถานที่') catBadge = `<span class="badge badge-soft-danger px-3 py-1 shadow-sm rounded-pill">${e.category}</span>`;
                else if(e.category === 'ต้นทุนพัสดุฟอกเลือด') catBadge = `<span class="badge badge-soft-dark px-3 py-1 shadow-sm rounded-pill"><i class="fa-solid fa-box-open me-1"></i> ต้นทุนพัสดุ</span>`;

                let sourceBadge = e.isSystemGenerated 
                    ? `<div class="badge badge-soft-dark w-100"><i class="fa-solid fa-robot me-1"></i> ตัดสต๊อกอัตโนมัติ</div>`
                    : `<div class="badge badge-soft-info w-100"><i class="fa-solid fa-user-pen me-1"></i> ลงบัญชีแมนวล</div><div class="small text-muted mt-1 fw-bold text-center">โดย: ${e.recorded_by || 'Admin'}</div>`;

                let deleteBtnHtml = e.isSystemGenerated ? `-` : `<button class="btn btn-sm btn-light border border-danger-subtle text-danger shadow-sm rounded px-3 py-1" onclick="FinancePage.deleteExpense('${e.id}')"><i class="fa-solid fa-trash me-1"></i> ลบ</button>`;

                expenseHtml += `
                <tr class="card-hover-float" style="cursor:default;">
                    <td><span class="fw-bold text-dark">${this.formatDateTh(e.date)}</span></td>
                    <td>${catBadge}</td>
                    <td><div class="fw-bold text-dark" style="font-family:'Prompt'; font-size:14.5px;">${e.description || '-'}</div></td>
                    <td>${sourceBadge}</td>
                    <td class="text-end fw-bold text-danger" style="font-size:16px;">- ฿${amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td class="text-center">${deleteBtnHtml}</td>
                </tr>`;

                masterLedger.push({ dateObj: new Date(e.date + " " + (e.time || "23:59")), dateStr: e.date, type: 'EXPENSE', category: e.category, desc: e.description, amount: amount });
            });
        }
        
        document.getElementById('fin-expense-body').innerHTML = expenseHtml;
        document.getElementById('fin-total-expense').innerText = totalExpense.toLocaleString(undefined, {minimumFractionDigits: 2});
        document.getElementById('fin-sum-opex').innerText = sumOpEx.toLocaleString(undefined, {minimumFractionDigits: 2});
        document.getElementById('fin-sum-stock').innerText = sumStock.toLocaleString(undefined, {minimumFractionDigits: 2});

        // 🚨 บันทึกยอดสุทธิ
        let netProfit = totalIncome - totalExpense;
        let netEl = document.getElementById('fin-net-profit');
        if (netProfit >= 0) { 
            netEl.innerHTML = `<span class="text-primary">฿${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>`; 
        } else { 
            netEl.innerHTML = `<span class="text-danger">฿${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>`; 
        }

        // เก็บออบเจกต์สรุปไว้ใช้ตอนพิมพ์
        this._summaryData = { totalIncome, totalExpense, netProfit, sumDialysis, sumMed, sumLab, sumXray, sumOpEx, sumStock };

        // 🚨 สมุดบัญชีรวม (Ledger)
        masterLedger.sort((a, b) => a.dateObj - b.dateObj);
        let ledgerHtml = ''; let runningBalance = 0;

        if (masterLedger.length === 0) {
            ledgerHtml = `<tr><td colspan="6" class="text-center py-5 text-muted"><i class="fa-solid fa-file-invoice fa-3x mb-3" style="opacity:0.2;"></i><br>ไม่มีความเคลื่อนไหวทางบัญชี</td></tr>`;
        } else {
            masterLedger.forEach(item => {
                if(item.type === 'INCOME') runningBalance += item.amount; else runningBalance -= item.amount;
                item.balance = runningBalance;
            });

            [...masterLedger].reverse().forEach(item => {
                let badge = item.type === 'INCOME' ? `<span class="badge badge-soft-success px-3 py-1 rounded-pill w-100"><i class="fa-solid fa-arrow-down me-1"></i> รายรับ</span>` : `<span class="badge badge-soft-danger px-3 py-1 rounded-pill w-100"><i class="fa-solid fa-arrow-up me-1"></i> รายจ่าย</span>`;
                ledgerHtml += `
                <tr class="card-hover-float">
                    <td><span class="fw-bold text-secondary">${this.formatDateTh(item.dateStr)}</span></td>
                    <td class="text-center">${badge}</td>
                    <td><div class="fw-bold text-dark" style="font-size:14px; font-family:'Prompt';">${item.desc}</div><div class="small text-muted"><i class="fa-solid fa-tag me-1"></i> ${item.category}</div></td>
                    <td class="text-end ledger-in">${item.type === 'INCOME' ? '+ '+item.amount.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                    <td class="text-end ledger-out">${item.type === 'EXPENSE' ? '- '+item.amount.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                    <td class="text-end fw-bold text-primary" style="font-size:16px;">฿${item.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>`;
            });
        }
        document.getElementById('fin-ledger-body').innerHTML = ledgerHtml;
        this.renderChart(totalIncome, totalExpense);
    },

    renderChart: function(income, expense) {
        const ctx = document.getElementById('financeChart'); if (!ctx) return;
        if (this.chartInstance) this.chartInstance.destroy();
        this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: { labels: ['เปรียบเทียบกระแสเงินสดคลินิก'], datasets: [{ label: 'รายรับรวมสุทธิ (Income)', data: [income], backgroundColor: 'rgba(16, 185, 129, 0.8)', borderColor: '#10b981', borderWidth: 2, borderRadius: 8 }, { label: 'รายจ่าย (Expense)', data: [expense], backgroundColor: 'rgba(239, 68, 68, 0.8)', borderColor: '#ef4444', borderWidth: 2, borderRadius: 8 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { font: { family: 'Prompt', size: 14 } } } }, scales: { y: { beginAtZero: true, ticks: { font: { family: 'Prompt' } } }, x: { ticks: { font: { family: 'Prompt', size: 14 } } } } }
        });
    },

    openAddExpenseModal: function() {
        const todayStr = new Date().toISOString().split('T')[0];
        Swal.fire({
            title: `<h4 class="fw-bold text-danger mb-0" style="font-family:'Prompt';"><i class="fa-solid fa-file-invoice-dollar me-2"></i> บันทึกรายจ่ายใหม่</h4>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <div class="row g-3 mb-3">
                        <div class="col-6"><label class="form-label fw-bold text-secondary small">วันที่จ่าย</label>
                        <input type="date" id="swal-exp-date" class="form-control" style="font-family:'Prompt'; font-weight:bold; border-radius:8px;" value="${todayStr}"></div>
                        <div class="col-6"><label class="form-label fw-bold text-secondary small">หมวดหมู่รายจ่าย</label>
                            <select id="swal-exp-category" class="form-select" style="border-radius:8px;">
                                <option value="สั่งซื้อยา/พัสดุ">📦 สั่งซื้อยา/พัสดุ</option><option value="เงินเดือน/ค่าจ้าง">👥 เงินเดือน/ค่าจ้าง</option>
                                <option value="ค่าน้ำ/ค่าไฟ/อินเทอร์เน็ต">⚡ ค่าน้ำ/ค่าไฟ/อินเทอร์เน็ต</option><option value="ซ่อมบำรุง/สถานที่">🛠️ ซ่อมบำรุง/สถานที่</option><option value="จิปาถะ/อื่นๆ">📌 จิปาถะ/อื่นๆ</option>
                            </select>
                        </div>
                    </div>
                    <label class="form-label fw-bold text-secondary small">รายละเอียด / ชื่อรายการ <span class="text-danger">*</span></label>
                    <input type="text" id="swal-exp-desc" class="form-control fw-bold text-dark mb-3" style="border-radius:8px;">
                    <label class="form-label fw-bold text-danger small">จำนวนเงินที่จ่าย (บาท) <span class="text-danger">*</span></label>
                    <div class="input-group shadow-sm" style="border-radius:12px; overflow:hidden;"><span class="input-group-text bg-danger text-white border-0"><i class="fa-solid fa-baht-sign px-2"></i></span><input type="number" id="swal-exp-amount" class="form-control form-control-lg fw-bold text-danger border-0 text-end" placeholder="0.00" min="0"></div>
                </div>`,
            showCancelButton: true, confirmButtonText: 'บันทึก', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#ef4444', width: 500,
            preConfirm: () => {
                const date = document.getElementById('swal-exp-date').value; const category = document.getElementById('swal-exp-category').value;
                const desc = document.getElementById('swal-exp-desc').value.trim(); const amount = document.getElementById('swal-exp-amount').value;
                if (!date || !desc || !amount || Number(amount) <= 0) { Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วน'); return false; }
                return { id: 'EXP-' + new Date().getTime(), date: date, category: category, description: desc, amount: Number(amount), recorded_by: App.currentUser ? App.currentUser.name : 'Admin', timestamp: new Date().toISOString() };
            }
        }).then((result) => { if (result.isConfirmed) db.ref('clinic_expenses_v2/' + result.value.id).set(result.value); });
    },

    deleteExpense: function(id) {
        Swal.fire({ title: 'ยืนยันการลบบิล?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'ลบ', cancelButtonText: 'ยกเลิก' }).then((result) => { if (result.isConfirmed) db.ref('clinic_expenses_v2/' + id).remove(); });
    },

    _executePrint: function(htmlContent) {
        Swal.fire({ title: 'กำลังเตรียมเอกสาร...', html: 'ระบบกำลังดึงข้อมูลเข้าสู่โหมดการจัดพิมพ์อย่างปลอดภัย', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
        let oldIframe = document.getElementById('hidden-print-frame'); if (oldIframe) { oldIframe.remove(); }
        let iframe = document.createElement('iframe'); iframe.id = 'hidden-print-frame'; iframe.style.position = 'fixed'; iframe.style.right = '0'; iframe.style.bottom = '0'; iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = '0'; document.body.appendChild(iframe);
        iframe.onload = function() { setTimeout(function() { Swal.close(); iframe.contentWindow.focus(); iframe.contentWindow.print(); setTimeout(() => { if (document.getElementById('hidden-print-frame')) document.getElementById('hidden-print-frame').remove(); }, 10000); }, 800); };
        let doc = iframe.contentWindow.document; doc.open(); doc.write(htmlContent); doc.close();
    },

    printLedger: function() {
        let filteredVisits = this.allVisits.filter(v => v && v.date && v.date >= this.startDate && v.date <= this.endDate && v.status === "เสร็จสิ้น");
        let filteredExpenses = this.allExpenses.filter(e => e && e.date && e.date >= this.startDate && e.date <= this.endDate);
        let filteredStockLogs = this.stockTransactions.filter(log => log && log.timestamp && log.timestamp.split('T')[0] >= this.startDate && log.timestamp.split('T')[0] <= this.endDate && log.mode === 'out_sub' && log.note && log.note.includes("ตัดเบิก Flowsheet"));

        let masterLedger = [];
        filteredVisits.forEach(v => { 
            let base_fee = parseFloat(String(v.dialysis_fee || 0).replace(/,/g, '')); if (base_fee <= 0) base_fee = 1500; 
            let med_fee = Number(v.med_fee || 0); let lab_fee = Number(v.lab_fee || 0); let xray_fee = Number(v.xray_fee || 0);
            let total_fee = base_fee + med_fee + lab_fee + xray_fee;
            masterLedger.push({ dateObj: new Date(v.date + " " + (v.time || "00:00")), dateStr: v.date, type: 'INCOME', desc: `คิวฟอกไต HN:${v.hn} (${v.name}) [${v.hd_mode||'HD'}]`, amount: total_fee }); 
        });
        filteredExpenses.forEach(e => { masterLedger.push({ dateObj: new Date(e.date + " " + (e.time || "23:59")), dateStr: e.date, type: 'EXPENSE', desc: `[${e.category}] ${e.description}`, amount: Number(e.amount) || 0 }); });
        filteredStockLogs.forEach(log => { let item = this.inventoryItems.find(i => i.id === log.itemId); let cost = (item && item.price ? Number(item.price) : 0) * Number(log.qty); masterLedger.push({ dateObj: new Date(log.timestamp), dateStr: log.timestamp.split('T')[0], type: 'EXPENSE', desc: `[ต้นทุนพัสดุ] เบิก: ${log.itemName} (x${log.qty})`, amount: cost }); });

        masterLedger.sort((a, b) => a.dateObj - b.dateObj);
        let tbodyHtml = ''; let runningBalance = 0;
        masterLedger.forEach((item, idx) => { if(item.type === 'INCOME') runningBalance += item.amount; else runningBalance -= item.amount; tbodyHtml += `<tr><td style="text-align:center;">${idx+1}</td><td style="text-align:center;">${this.formatDateTh(item.dateStr)}</td><td>${item.desc}</td><td style="text-align:right; color:#10b981;">${item.type==='INCOME'?item.amount.toLocaleString(undefined,{minimumFractionDigits:2}):'-'}</td><td style="text-align:right; color:#ef4444;">${item.type==='EXPENSE'?item.amount.toLocaleString(undefined,{minimumFractionDigits:2}):'-'}</td><td style="text-align:right; font-weight:bold;">฿${runningBalance.toLocaleString(undefined,{minimumFractionDigits:2})}</td></tr>`; });

        db.ref('clinic_settings_v2').once('value', snap => {
            const settings = snap.val() || { clinic_name: "DIALYSIS PRO CLINIC" };
            const html = `<html><head><meta charset="UTF-8"><title>Statement</title><link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet"><style>*{-webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important;}body{font-family:'Sarabun',sans-serif;padding:20px;font-size:13px;}.header{text-align:center;margin-bottom:20px;border-bottom:2px solid #000;padding-bottom:15px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #000;padding:8px;}th{background-color:#f1f5f9 !important;}</style></head><body><div class="header"><h2>${settings.clinic_name}</h2><h3>สมุดบัญชีรายรับ-รายจ่ายคลินิกหลัก (General Ledger Statement)</h3><div>ช่วงวันที่: ${this.formatDateTh(this.startDate)} ถึง ${this.formatDateTh(this.endDate)}</div></div><table><thead><tr><th>#</th><th>วันที่</th><th>รายละเอียดรายการ</th><th>เงินเข้า (IN)</th><th>เงินออก (OUT)</th><th>ยอดสะสม (฿)</th></tr></thead><tbody>${tbodyHtml}</tbody></table></body></html>`;
            this._executePrint(html);
        });
    },

    // 🚨 THE FIX: พิมพ์สรุปยอดเชิงลึกแบบละเอียด 🚨
    printSummary: function() {
        const d = this._summaryData;
        if(d.totalIncome === 0 && d.totalExpense === 0) { Swal.fire('ข้อมูลว่างเปล่า', 'ไม่มีข้อมูลให้สรุปในช่วงเวลานี้', 'warning'); return; }

        db.ref('clinic_settings_v2').once('value').then(snap => {
            const settings = snap.val() || { clinic_name: "DIALYSIS PRO CLINIC" };
            let chartImgHtml = ''; const chartCanvas = document.getElementById('financeChart');
            if(chartCanvas && this.chartInstance) { try { chartImgHtml = `<img src="${chartCanvas.toDataURL('image/png')}" style="max-width:500px; height:auto; display:block; margin:0 auto; object-fit:contain;">`; } catch(e){} }
            
            const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Summary</title><link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
                <style>
                    *{-webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;} 
                    body{font-family:'Sarabun',sans-serif;color:#000;padding:20px;font-size:13px;}
                    .header{text-align:center;margin-bottom:20px;border-bottom:2px solid #000;padding-bottom:15px;}
                    .header h2{font-size:24px;font-weight:700;margin:0;}
                    .section-title{font-size:16px;font-weight:bold;margin-top:25px;margin-bottom:10px;border-left:4px solid #2563eb;padding-left:10px; background: #f8fafc; padding: 6px 10px;}
                    table{width:100%;border-collapse:collapse;margin-top:10px;}
                    th,td{border:1px solid #cbd5e1;padding:8px 10px;}
                    th{background-color:#f1f5f9 !important; font-weight:bold;}
                    .total-row { background-color: #f8fafc; font-weight: bold; font-size: 14px; }
                    .text-right { text-align: right; }
                    .cards-container{display:flex;justify-content:space-between;gap:15px;margin-bottom:10px;}
                    .print-card{flex:1;border:2px solid #cbd5e1;padding:15px;border-radius:12px;text-align:center;background:#fff;}
                    .val-income { color: #166534; font-size: 20px; font-weight: bold; margin-top: 5px; }
                    .val-expense { color: #991b1b; font-size: 20px; font-weight: bold; margin-top: 5px; }
                    .val-net { color: #1e40af; font-size: 24px; font-weight: bold; margin-top: 5px; }
                </style></head><body>
                <div class="header">
                    <h2>${settings.clinic_name}</h2>
                    <h3>รายงานสรุปดุลกระแสเงินสดและโครงสร้างรายได้-ต้นทุนแบบละเอียด (Financial Breakdown)</h3>
                    <div>รอบการสืบค้น: ${this.formatDateTh(this.startDate)} ถึง ${this.formatDateTh(this.endDate)}</div>
                </div>

                <div class="cards-container">
                    <div class="print-card" style="border-color: #bbf7d0;">
                        <div style="font-weight:bold; color:#15803d;">รายรับรวมสุทธิ (Total Income)</div>
                        <div class="val-income">฿${d.totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                    </div>
                    <div class="print-card" style="border-color: #fecaca;">
                        <div style="font-weight:bold; color:#b91c1c;">รายจ่ายรวมสุทธิ (Total Expense)</div>
                        <div class="val-expense">฿${d.totalExpense.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                    </div>
                    <div class="print-card" style="border-color: #bfdbfe; background: #eff6ff;">
                        <div style="font-weight:bold; color:#1d4ed8;">กำไรสุทธิ (Net Cash Flow)</div>
                        <div class="val-net">฿${d.netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                    </div>
                </div>

                <div style="display:flex; gap: 20px; margin-top: 25px;">
                    <div style="flex: 1;">
                        <div class="section-title" style="border-color: #10b981; color: #15803d;">1. รายรับแจกแจงตามหมวดหมู่ค่าบริการ</div>
                        <table>
                            <tr><td>1.1 รายได้จากค่าฟอกเลือด (Dialysis Base Fee)</td><td class="text-right">฿${d.sumDialysis.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>
                            <tr><td>1.2 รายได้จากค่ายาและเวชภัณฑ์ (Medications)</td><td class="text-right">฿${d.sumMed.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>
                            <tr><td>1.3 รายได้จากค่าตรวจทางห้องปฏิบัติการ (Labs)</td><td class="text-right">฿${d.sumLab.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>
                            <tr><td>1.4 รายได้จากค่าภาพถ่ายรังสี (X-Ray)</td><td class="text-right">฿${d.sumXray.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>
                            <tr class="total-row"><td class="text-right text-success">รวมรายได้ทั้งหมด (Total Income):</td><td class="text-right" style="color: #15803d;">฿${d.totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>
                        </table>
                    </div>

                    <div style="flex: 1;">
                        <div class="section-title" style="border-color: #ef4444; color: #b91c1c;">2. รายจ่ายแจกแจงตามหมวดหมู่ต้นทุน</div>
                        <table>
                            <tr><td>2.1 บิลค่าใช้จ่ายทั่วไป (Operational Expense)</td><td class="text-right">฿${d.sumOpEx.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>
                            <tr><td>2.2 ต้นทุนพัสดุฟอกเลือด (Stock Consumption)</td><td class="text-right">฿${d.sumStock.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>
                            <tr class="total-row"><td class="text-right text-danger">รวมต้นทุน/รายจ่าย (Total Expense):</td><td class="text-right" style="color: #b91c1c;">฿${d.totalExpense.toLocaleString(undefined, {minimumFractionDigits: 2})}</td></tr>
                        </table>
                    </div>
                </div>

                <div class="section-title" style="margin-top: 30px;">3. แผนภูมิเปรียบเทียบดุลกระแสเงินสด</div>
                <div style="padding:15px; border:1px solid #e2e8f0; border-radius:12px; background: #f8fafc;">${chartImgHtml}</div>

                <div style="text-align:right; margin-top:50px;">
                    <p>ลงชื่อ .............................................................. ผู้จัดทำรายงานบัญชี</p>
                    <p style="margin-right:45px;">( ........................................................ )</p>
                </div>
                </body></html>`;
            this._executePrint(html);
        });
    },

    manageModalities: function() {
        let html = '<div class="list-group mb-3 text-start shadow-sm" style="border-radius:12px; overflow:hidden;">';
        this.modalities.forEach((m) => {
            html += `
            <div class="list-group-item d-flex justify-content-between align-items-center p-3 bg-white">
                <div>
                    <div class="fw-bold text-dark" style="font-size:15px;">${m.name}</div>
                    <div class="text-info fw-bold small"><i class="fa-solid fa-tag me-1"></i> ค่าบริการ: ฿${Number(m.price || 0).toLocaleString()} / รอบ</div>
                </div>
                <div>
                    <button class="btn btn-sm btn-light border border-warning-subtle text-warning-dark shadow-sm me-1" style="border-radius:8px;" onclick="Swal.close(); setTimeout(()=>FinancePage.editModality('${m.id}'), 300)"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-light border border-danger-subtle text-danger shadow-sm" style="border-radius:8px;" onclick="Swal.close(); setTimeout(()=>FinancePage.deleteModality('${m.id}'), 300)"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
        });
        html += '</div>';
        
        Swal.fire({
            title: '<h4 class="fw-bold text-info mb-0"><i class="fa-solid fa-pump-medical me-2"></i> ตั้งค่าราคาโหมดการฟอก</h4>',
            html: html,
            showCancelButton: true, cancelButtonText: 'ปิดหน้าต่าง',
            showConfirmButton: true, confirmButtonText: '<i class="fa-solid fa-plus me-1"></i> เพิ่มโหมดใหม่', confirmButtonColor: '#0ea5e9', width: 600
        }).then((res) => { if(res.isConfirmed) { setTimeout(() => this.editModality(null), 300); } });
    },

    editModality: function(id) {
        let m = id ? this.modalities.find(x => x.id === id) : { name: '', price: 1500 };
        Swal.fire({
            title: `<h5 class="fw-bold text-info mb-0"><i class="fa-solid ${id?'fa-pen':'fa-plus'} me-2"></i>${id ? 'แก้ไขโหมด' : 'เพิ่มโหมดใหม่'}</h5>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <label class="form-label fw-bold small text-secondary">ชื่อโหมด (Modality Name)</label>
                    <input type="text" id="swal-mod-name" class="form-control input-modern mb-3 fw-bold text-dark" value="${m.name}" placeholder="เช่น HD ปกติ, HDF">
                    <label class="form-label fw-bold small text-secondary">ราคา / ค่าบริการ (บาท)</label>
                    <input type="number" id="swal-mod-price" class="form-control input-modern text-info fw-bold text-center" value="${m.price || 0}" style="font-size: 18px;" min="0">
                </div>
            `,
            showCancelButton: true, cancelButtonText: 'ยกเลิก', confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึก', confirmButtonColor: '#0ea5e9',
            preConfirm: () => {
                let name = document.getElementById('swal-mod-name').value.trim();
                let price = document.getElementById('swal-mod-price').value;
                if(!name) { Swal.showValidationMessage('กรุณากรอกชื่อโหมด'); return false; }
                return { id: id || 'MOD'+Date.now(), name, price: Number(price) };
            }
        }).then(res => {
            if(res.isConfirmed) {
                let updated = [...this.modalities];
                if(id) updated[updated.findIndex(x=>x.id===id)] = res.value; else updated.push(res.value);
                db.ref('clinic_modalities_v2').set(updated).then(() => {
                    this.modalities = updated; 
                    Swal.fire({title:'บันทึกสำเร็จ', icon:'success', timer:1000, showConfirmButton:false}).then(()=> this.manageModalities());
                });
            } else if (res.isDismissed) { this.manageModalities(); }
        });
    },

    deleteModality: function(id) {
        Swal.fire({
            title: 'ยืนยันการลบ?', text: 'ต้องการลบโหมดการฟอกนี้ออกจากระบบใช่หรือไม่?', icon: 'warning', 
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-trash me-1"></i> ลบ', confirmButtonColor: '#ef4444', cancelButtonText: 'ยกเลิก'
        }).then(res => {
            if(res.isConfirmed) {
                let updated = this.modalities.filter(x=>x.id !== id);
                db.ref('clinic_modalities_v2').set(updated).then(() => {
                    this.modalities = updated; 
                    Swal.fire({title:'ลบสำเร็จ', icon:'success', timer:1000, showConfirmButton:false}).then(()=> this.manageModalities());
                });
            } else { this.manageModalities(); }
        });
    },

    manageRights: function() {
        let html = '<div class="list-group mb-3 text-start shadow-sm" style="border-radius:12px; overflow:hidden;">';
        this.clinicRights.forEach((r) => {
            html += `
            <div class="list-group-item d-flex justify-content-between align-items-center p-3 bg-white">
                <div>
                    <div class="fw-bold text-dark" style="font-size:15px;">${r.name}</div>
                    <div class="text-success fw-bold small"><i class="fa-solid fa-hand-holding-dollar me-1"></i> เบิกจ่าย: ฿${Number(r.price).toLocaleString()} / รอบ</div>
                </div>
                <div>
                    <button class="btn btn-sm btn-light border border-warning-subtle text-warning-dark shadow-sm me-1" style="border-radius:8px;" onclick="Swal.close(); setTimeout(()=>FinancePage.editRight('${r.id}'), 300)"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-light border border-danger-subtle text-danger shadow-sm" style="border-radius:8px;" onclick="Swal.close(); setTimeout(()=>FinancePage.deleteRight('${r.id}'), 300)"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
        });
        html += '</div>';
        
        Swal.fire({
            title: '<h4 class="fw-bold text-success mb-0"><i class="fa-solid fa-shield-heart me-2"></i> จัดการสิทธิการรักษา</h4>',
            html: html,
            showCancelButton: true, cancelButtonText: 'ปิดหน้าต่าง',
            showConfirmButton: true, confirmButtonText: '<i class="fa-solid fa-plus me-1"></i> เพิ่มสิทธิใหม่', confirmButtonColor: '#10b981'
        }).then((res) => { if(res.isConfirmed) { setTimeout(() => this.editRight(null), 300); } });
    },

    editRight: function(id) {
        let r = id ? this.clinicRights.find(x => x.id === id) : { name: '', price: 1500 };
        Swal.fire({
            title: `<h5 class="fw-bold text-success mb-0"><i class="fa-solid ${id?'fa-pen':'fa-plus'} me-2"></i>${id ? 'แก้ไขสิทธิการรักษา' : 'เพิ่มสิทธิใหม่'}</h5>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <label class="form-label fw-bold small text-secondary">ชื่อสิทธิ (เช่น บัตรทอง, ชำระเงินเอง)</label>
                    <input type="text" id="swal-right-name" class="form-control input-modern mb-3 fw-bold text-dark" value="${r.name}">
                    <label class="form-label fw-bold small text-secondary">ราคา / ค่าเบิกจ่าย (บาท)</label>
                    <input type="number" id="swal-right-price" class="form-control input-modern text-success fw-bold text-center" value="${r.price}" style="font-size: 18px;" min="0">
                </div>
            `,
            showCancelButton: true, cancelButtonText: 'ยกเลิก', confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึก', confirmButtonColor: '#10b981',
            preConfirm: () => {
                let name = document.getElementById('swal-right-name').value.trim();
                let price = document.getElementById('swal-right-price').value;
                if(!name) { Swal.showValidationMessage('กรุณากรอกชื่อสิทธิ'); return false; }
                return { id: id || 'RIGHT'+Date.now(), name, price: Number(price) };
            }
        }).then(res => {
            if(res.isConfirmed) {
                let updated = [...this.clinicRights];
                if(id) updated[updated.findIndex(x=>x.id===id)] = res.value; else updated.push(res.value);
                db.ref('clinic_rights_v2').set(updated).then(() => {
                    this.clinicRights = updated; 
                    Swal.fire({title:'บันทึกสำเร็จ', icon:'success', timer:1000, showConfirmButton:false}).then(()=> this.manageRights());
                });
            } else if (res.isDismissed) { this.manageRights(); }
        });
    },

    deleteRight: function(id) {
        Swal.fire({
            title: 'ยืนยันการลบ?', text: 'ต้องการลบสิทธิการรักษานี้ใช่หรือไม่?', icon: 'warning', 
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-trash me-1"></i> ลบ', confirmButtonColor: '#ef4444', cancelButtonText: 'ยกเลิก'
        }).then(res => {
            if(res.isConfirmed) {
                let updated = this.clinicRights.filter(x=>x.id !== id);
                db.ref('clinic_rights_v2').set(updated).then(() => {
                    this.clinicRights = updated; 
                    Swal.fire({title:'ลบสำเร็จ', icon:'success', timer:1000, showConfirmButton:false}).then(()=> this.manageRights());
                });
            } else { this.manageRights(); }
        });
    }
};