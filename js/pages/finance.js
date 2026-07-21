// js/pages/finance.js
// 🚀 Enterprise Finance Module: Immutable ID Binding, Unified Selector Sync & Zero-CLS

class FinancePageComponent {
    constructor() {
        this.state = {
            startDate: '',
            endDate: '',
            allVisits: [],
            allExpenses: [],
            clinicRights: [],
            modalities: [],
            stockTransactions: [],
            inventoryItems: [],
            chartInstance: null,
            hasCleanedUp: false,
            _summaryData: {},
            exportData: null 
        };
        this.firebaseListeners = [];
    }

    switchTab(tabId) {
        document.querySelectorAll('.fin-nav-link').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('#financeTabContent .custom-tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        const targetBtn = document.getElementById(`btn-${tabId}`);
        if (targetBtn) targetBtn.classList.add('active');
        
        const targetPane = document.getElementById(tabId);
        if (targetPane) targetPane.classList.add('active');
    }

    get html() {
        return `
            <style>
                * { -webkit-font-smoothing: antialiased !important; -moz-osx-font-smoothing: grayscale !important; text-rendering: optimizeLegibility !important; }
                .form-label, .text-secondary, .text-muted { color: #334155 !important; font-weight: 600 !important; letter-spacing: 0.2px; }
                .form-control, .form-select, .input-modern { color: #0f172a !important; font-weight: 700 !important; font-size: 14.5px !important; }
                
                .btn-outline-success.bg-white:hover { background-color: #10b981 !important; border-color: #10b981 !important; color: #ffffff !important; }
                .btn-outline-success.bg-white:hover i { color: #ffffff !important; }
                .btn-outline-info.bg-white:hover { background-color: #0ea5e9 !important; border-color: #0ea5e9 !important; color: #ffffff !important; }
                .btn-outline-info.bg-white:hover i { color: #ffffff !important; }

                /* 🚨 THE ULTIMATE FIX: ซิงค์ชื่อ Class CSS & ล้างจุดไข่ปลา 100% */
                ul.fin-nav-tabs { 
                    display: flex !important; 
                    flex-direction: row !important;
                    border-bottom: 2px solid var(--border-color) !important; 
                    margin: 0 0 -1px 0 !important; 
                    padding-left: 0 !important; 
                    list-style-type: none !important; 
                    gap: 5px !important; 
                    overflow-x: auto !important;
                    position: relative; z-index: 10;
                }
                ul.fin-nav-tabs::-webkit-scrollbar { height: 4px; }
                ul.fin-nav-tabs::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
                
                ul.fin-nav-tabs li {
                    list-style: none !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }

                .fin-nav-link { 
                    display: inline-flex;
                    align-items: center;
                    background: transparent; 
                    border: none !important; 
                    padding: 14px 24px; 
                    font-family: 'Prompt', sans-serif; 
                    font-weight: 600; 
                    font-size: 15px; 
                    color: var(--text-muted); 
                    cursor: pointer; 
                    border-radius: 12px 12px 0 0; 
                    position: relative; 
                    transition: all 0.2s; 
                    outline: none !important; 
                }
                .fin-nav-link:hover { color: var(--primary); background: var(--bg-surface); filter: brightness(0.95); }
                .fin-nav-link.active { background: var(--bg-surface); box-shadow: 0 -4px 10px rgba(0,0,0,0.02); color: var(--primary); font-weight: 700;}
                .fin-nav-link.active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 3px; background: var(--primary); border-radius: 3px 3px 0 0; }
                
                /* ========================================================
                   🚨 CSS GRID STACKING ENGINE (ล็อกกล่องเหล็ก)
                   ======================================================== */
                #financeTabContent {
                    display: grid;
                    grid-template-columns: 1fr;
                    grid-template-rows: 1fr;
                    height: 580px !important;       
                    min-height: 580px !important;
                    max-height: 580px !important;
                    width: 100%;
                    margin-bottom: 2rem;
                }

                .custom-tab-pane {
                    grid-area: 1 / 1;               
                    opacity: 0;
                    visibility: hidden;
                    pointer-events: none;           
                    transition: opacity 0.25s ease; 
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .custom-tab-pane.active {
                    opacity: 1;
                    visibility: visible;
                    pointer-events: auto;
                    z-index: 5;
                }

                .panel-locked {
                    height: 100% !important;
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 0 !important; 
                    border-top-left-radius: 0 !important;
                }

                .locked-table-wrapper {
                    flex-grow: 1;
                    min-height: 0; 
                    overflow-y: auto;
                    overflow-x: auto; 
                    background-color: var(--bg-surface);
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    box-shadow: var(--shadow-sm);
                }
                
                .locked-table-wrapper::-webkit-scrollbar { width: 6px; height: 6px; }
                .locked-table-wrapper::-webkit-scrollbar-track { background: transparent; }
                .locked-table-wrapper::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

                .stat-card-finance { transition: all 0.3s ease; border: 1px solid var(--border-color); border-radius: 20px; padding: 24px; position: relative; overflow: hidden; background: var(--bg-surface); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); height: 100%; display: flex; flex-direction: column; }
                .stat-card-finance:hover { transform: translateY(-5px); box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.1); border-color: var(--primary); }
                .stat-icon-bg { position: absolute; top: -20px; right: -20px; opacity: 0.04; font-size: 150px; pointer-events: none; z-index: 0; color: var(--text-dark); }
                
                .table-finance { border-collapse: collapse !important; margin-bottom: 0; width: 100%; min-width: 1100px; table-layout: fixed; }
                .table-finance th { background: var(--bg-body); color: var(--text-muted); font-weight: 700; text-transform: uppercase; font-size: 13px; padding: 14px 12px; border-bottom: 2px solid var(--border-color); border-top: none; white-space: nowrap; position: sticky; top: 0; z-index: 10; }
                .table-finance td { padding: 14px 12px; vertical-align: middle; border-bottom: 1px solid var(--border-color); font-size: 14px; background: transparent; color: var(--text-dark); }
                
                .native-date-wrapper {
                    position: relative; display: inline-flex; align-items: center; background: var(--bg-surface);
                    border: 2px solid var(--border-color); border-radius: 50px; padding: 6px 18px; cursor: pointer; overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.3s;
                }
                .native-date-wrapper:hover { border-color: var(--primary); background: var(--bg-body); }
                .native-date-wrapper input[type="date"] { position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 10; border: none; background: transparent; color: transparent; }
                .native-date-wrapper input[type="date"]::-webkit-datetime-edit, .native-date-wrapper input[type="date"]::-webkit-datetime-edit-text, .native-date-wrapper input[type="date"]::-webkit-datetime-edit-month-field, .native-date-wrapper input[type="date"]::-webkit-datetime-edit-day-field, .native-date-wrapper input[type="date"]::-webkit-datetime-edit-year-field { color: transparent !important; background: transparent !important; }
                .native-date-wrapper input[type="date"]::-webkit-calendar-picker-indicator { position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; margin: 0; padding: 0; cursor: pointer; opacity: 0; }
                .native-date-wrapper span { position: relative; z-index: 1; font-family: 'Prompt'; font-weight: 800; color: var(--primary); font-size: 14px; pointer-events: none; }
                .native-date-wrapper i { position: relative; z-index: 1; margin-right: 8px; font-size: 16px; color: var(--primary); pointer-events: none; }

                .breakdown-box { background: var(--bg-body); border-radius: 12px; padding: 12px; margin-top: auto; border: 1px solid var(--border-color); position: relative; z-index: 1; }
                .breakdown-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 13px; }
                .breakdown-row:last-child { margin-bottom: 0; }
                .breakdown-label { color: var(--text-muted); font-weight: 600; display: flex; align-items: center; gap: 6px; }
                .breakdown-val { color: var(--text-dark); font-weight: 700; font-family: 'Prompt'; }
                
                .safe-icon { font-family: 'Font Awesome 6 Free', 'FontAwesome', sans-serif !important; font-weight: 900 !important; font-style: normal !important; }
                
                .badge-safe {
                    white-space: normal !important;
                    text-align: left;
                    line-height: 1.4;
                    display: inline-block;
                    width: 100%;
                    max-width: 180px; 
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    hyphens: auto;
                }
                
                .micro-tag {
                    font-size: 10.5px;
                    background: rgba(0,0,0,0.05);
                    padding: 2px 6px;
                    border-radius: 4px;
                    display: inline-block;
                    margin-top: 2px;
                    margin-right: 2px;
                    color: var(--text-muted);
                    font-weight: 600;
                    border: 1px solid rgba(0,0,0,0.05);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 150px;
                }
                html[data-bs-theme="dark"] .micro-tag { background: rgba(255,255,255,0.05); color: #cbd5e1; }
            </style>

            <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 class="page-title text-primary" style="font-size: 28px;"><i class="fa-solid fa-file-invoice-dollar me-2 safe-icon"></i> ระบบบัญชีแยกประเภท (General Ledger)</h2>
                    <p class="text-muted mt-1 mb-0" id="fin-month-text">แสดงผลแบบละเอียดและสรุปกระแสเงินสด</p>
                </div>
                <div class="d-flex gap-2 align-items-center flex-wrap">
                    <button class="btn border fw-bold shadow-sm rounded-pill px-4 card-hover-float" style="background: var(--bg-surface); color: var(--text-dark); border-color: var(--border-color) !important;" onclick="window.FinancePage.manageModalities()">
                        <i class="fa-solid fa-pump-medical me-2 text-info safe-icon"></i> ราคาโหมด
                    </button>
                    <button class="btn border fw-bold shadow-sm rounded-pill px-4 card-hover-float" style="background: var(--bg-surface); color: var(--text-dark); border-color: var(--border-color) !important;" onclick="window.FinancePage.manageRights()">
                        <i class="fa-solid fa-shield-heart me-2 text-success safe-icon"></i> สิทธิรักษา
                    </button>
                    
                    <div class="d-flex align-items-center p-1 rounded-pill shadow-sm ms-2" style="background-color: var(--bg-body); border: 1px solid var(--border-color);">
                        <div class="native-date-wrapper">
                            <i class="fa-solid fa-calendar-days safe-icon"></i>
                            <span id="fin-start-display">กำลังโหลด...</span>
                            <input type="date" id="fin-start-date" onchange="window.FinancePage.onDateChange()">
                        </div>
                        <span class="mx-2 text-muted fw-bold small">ถึง</span>
                        <div class="native-date-wrapper">
                            <i class="fa-solid fa-calendar-days safe-icon"></i>
                            <span id="fin-end-display">กำลังโหลด...</span>
                            <input type="date" id="fin-end-date" onchange="window.FinancePage.onDateChange()">
                        </div>
                        <button class="btn btn-primary rounded-pill px-3 ms-2 fw-bold shadow-sm" style="z-index: 15;" onclick="window.FinancePage.setThisMonth()">เดือนนี้</button>
                    </div>
                </div>
            </div>

            <!-- Summary Cards -->
            <div class="row g-4 mb-4 align-items-stretch">
                <div class="col-md-4">
                    <div class="stat-card-finance" style="border-top: 5px solid var(--success);">
                        <i class="fa-solid fa-arrow-trend-up stat-icon-bg safe-icon"></i>
                        <div class="d-flex justify-content-between mb-2 position-relative z-1">
                            <div class="fw-bold small text-uppercase" style="color: var(--success);">รายรับรวม (Total Income)</div>
                            <div class="badge-soft-success rounded px-2 py-1"><i class="fa-solid fa-plus safe-icon"></i></div>
                        </div>
                        <div class="fs-1 fw-bold position-relative z-1 mb-3" style="color: var(--text-dark);">฿<span id="fin-total-income"><i class="fas fa-spinner fa-spin fs-4 safe-icon"></i></span></div>
                        
                        <div class="breakdown-box border-success-subtle">
                            <div class="breakdown-row"><span class="breakdown-label"><i class="fa-solid fa-pump-medical text-success safe-icon"></i> ค่าฟอกเลือด</span><span class="breakdown-val" id="fin-sum-dialysis">0.00</span></div>
                            <div class="breakdown-row"><span class="breakdown-label"><i class="fa-solid fa-pills text-warning-dark safe-icon"></i> ค่ายาและเวชภัณฑ์</span><span class="breakdown-val" id="fin-sum-med">0.00</span></div>
                            <div class="breakdown-row"><span class="breakdown-label"><i class="fa-solid fa-vial-virus text-danger safe-icon"></i> ค่าผลตรวจแล็บ</span><span class="breakdown-val" id="fin-sum-lab">0.00</span></div>
                            <div class="breakdown-row"><span class="breakdown-label"><i class="fa-solid fa-x-ray text-info safe-icon"></i> ค่าภาพถ่ายรังสี</span><span class="breakdown-val" id="fin-sum-xray">0.00</span></div>
                            <div class="mt-2 pt-2 border-top border-success-subtle text-success fw-bold small text-center">อ้างอิงจากผู้ป่วย <span id="fin-pt-count">0</span> คิว (สถานะเสร็จสิ้น)</div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="stat-card-finance" style="border-top: 5px solid var(--danger);">
                        <i class="fa-solid fa-arrow-trend-down stat-icon-bg safe-icon"></i>
                        <div class="d-flex justify-content-between mb-2 position-relative z-1">
                            <div class="fw-bold small text-uppercase" style="color: var(--danger);">รายจ่ายรวม (Total Expense)</div>
                            <div class="badge-soft-danger rounded px-2 py-1"><i class="fa-solid fa-minus safe-icon"></i></div>
                        </div>
                        <div class="fs-1 fw-bold position-relative z-1 mb-3" style="color: var(--text-dark);">฿<span id="fin-total-expense"><i class="fas fa-spinner fa-spin fs-4 safe-icon"></i></span></div>
                        
                        <div class="breakdown-box border-danger-subtle">
                            <div class="breakdown-row"><span class="breakdown-label"><i class="fa-solid fa-file-invoice text-danger safe-icon"></i> บิลค่าใช้จ่ายทั่วไป</span><span class="breakdown-val" id="fin-sum-opex">0.00</span></div>
                            <div class="breakdown-row"><span class="breakdown-label"><i class="fa-solid fa-box-open text-secondary safe-icon"></i> ต้นทุนตัดเบิกพัสดุ</span><span class="breakdown-val" id="fin-sum-stock">0.00</span></div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="stat-card-finance" style="border-top: 5px solid var(--primary); background: var(--primary-light);">
                        <i class="fa-solid fa-scale-balanced stat-icon-bg safe-icon" style="color: var(--primary);"></i>
                        <div class="d-flex justify-content-between mb-2 position-relative z-1">
                            <div class="text-primary fw-bold small text-uppercase">กำไรสุทธิ (Net Cash Flow)</div>
                            <div class="badge-soft-primary rounded px-2 py-1"><i class="fa-solid fa-equals safe-icon"></i></div>
                        </div>
                        <div class="fs-1 fw-bold position-relative z-1 mb-3" id="fin-net-profit"><i class="fas fa-spinner fa-spin fs-4 safe-icon"></i></div>
                        
                        <div class="breakdown-box border-primary-subtle" style="background: var(--bg-surface);">
                            <div class="text-center text-primary fw-bold small"><i class="fa-solid fa-chart-line me-1 safe-icon"></i> ประมวลผลจากข้อมูลในช่วงวันที่เลือก</div>
                            <div class="text-center text-muted small mt-1">รายรับสุทธิ หักลบ รายจ่ายรวมสุทธิ</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-4 mb-4">
                <div class="col-12">
                    <div class="modern-panel shadow-sm p-4 h-100" style="border-radius: 20px; background: var(--bg-surface); border: 1px solid var(--border-color);">
                        <h5 class="fw-bold mb-4" style="color: var(--text-dark);"><i class="fa-solid fa-chart-bar text-primary me-2 safe-icon"></i> กราฟเปรียบเทียบโครงสร้างรายได้และรายจ่าย</h5>
                        <div style="height: 300px; width: 100%; display: flex; justify-content: center; align-items: center;" id="fin-chart-container">
                            <canvas id="financeChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 🚨 โครงสร้าง TAB ใหม่ แก้จุดไข่ปลา -->
            <ul class="fin-nav-tabs">
                <li>
                    <button class="fin-nav-link active" id="btn-ledger-panel" onclick="window.FinancePage.switchTab('ledger-panel')">
                        <i class="fa-solid fa-book-open me-2 safe-icon"></i> สมุดบัญชีรวม (Statement)
                    </button>
                </li>
                <li>
                    <button class="fin-nav-link" id="btn-income-panel" onclick="window.FinancePage.switchTab('income-panel')">
                        <i class="fa-solid fa-hand-holding-dollar me-2 safe-icon" style="color: var(--success);"></i> <span style="color: var(--success);">ทะเบียนรายรับแบบละเอียด</span>
                    </button>
                </li>
                <li>
                    <button class="fin-nav-link" id="btn-expense-panel" onclick="window.FinancePage.switchTab('expense-panel')">
                        <i class="fa-solid fa-money-bill-transfer me-2 safe-icon" style="color: var(--danger);"></i> <span style="color: var(--danger);">ทะเบียนรายจ่าย</span>
                    </button>
                </li>
            </ul>

            <div id="financeTabContent">
                
                <!-- Tab 1: Ledger -->
                <div class="custom-tab-pane active" id="ledger-panel">
                    <div class="modern-panel panel-locked shadow-sm p-4 position-relative overflow-hidden" style="border-top: 5px solid var(--primary); border-radius: 0 20px 20px 20px; background: var(--bg-surface); border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                        <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 200px; pointer-events: none; color: var(--text-dark);"><i class="fa-solid fa-file-lines safe-icon"></i></div>
                        
                        <div class="d-flex justify-content-between align-items-center mb-4 position-relative z-1 flex-wrap gap-2">
                            <h5 class="fw-bold mb-0" style="color: var(--text-dark);"><i class="fa-solid fa-clock-rotate-left text-primary me-2 safe-icon"></i> ความเคลื่อนไหวทางบัญชี (Running Ledger)</h5>
                            <div>
                                <button class="btn btn-outline-success bg-white fw-bold shadow-sm rounded-pill px-3 me-2" onclick="window.FinancePage.exportExcel()">
                                    <i class="fa-solid fa-file-excel me-1 safe-icon"></i> ส่งออก Excel
                                </button>
                                <button class="btn btn-primary fw-bold shadow-sm rounded-pill px-3 me-2" onclick="window.FinancePage.printSummary()">
                                    <i class="fa-solid fa-chart-pie me-1 text-white safe-icon"></i> พิมพ์สรุป (Report)
                                </button>
                                <button class="btn btn-dark fw-bold shadow-sm rounded-pill px-3" onclick="window.FinancePage.printLedger()">
                                    <i class="fa-solid fa-print me-1 text-warning safe-icon"></i> พิมพ์บัญชี (Statement)
                                </button>
                            </div>
                        </div>
                        
                        <div class="locked-table-wrapper">
                            <table class="table table-finance">
                                <thead>
                                    <tr>
                                        <th style="width: 15%;"><i class="fa-regular fa-calendar me-1 safe-icon"></i> วัน/เวลา</th>
                                        <th style="width: 12%; text-align: center;">ประเภท</th>
                                        <th style="width: 38%;">รายละเอียดรายการ</th>
                                        <th class="text-end" style="width: 10%; color: var(--success) !important;">เงินเข้า (IN)</th>
                                        <th class="text-end" style="width: 10%; color: var(--danger) !important;">เงินออก (OUT)</th>
                                        <th class="text-end" style="width: 15%; color: var(--primary) !important;">ยอดสะสม (BAL)</th>
                                    </tr>
                                </thead>
                                <tbody id="fin-ledger-body"><tr><td colspan="6" class="text-center py-5">...</td></tr></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Tab 2: Income -->
                <div class="custom-tab-pane" id="income-panel">
                    <div class="modern-panel panel-locked shadow-sm p-4 position-relative overflow-hidden" style="border-top: 5px solid var(--success); border-radius: 0 20px 20px 20px; background: var(--bg-surface); border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                        <div class="d-flex justify-content-between align-items-center mb-4 position-relative z-1 flex-wrap gap-2">
                            <h5 class="fw-bold mb-0" style="color: var(--text-dark);"><i class="fa-solid fa-hand-holding-dollar text-success me-2 safe-icon"></i> ทะเบียนรายรับแบบละเอียด (Income Register)</h5>
                        </div>

                        <div class="locked-table-wrapper">
                            <table class="table table-finance">
                                <thead>
                                    <tr>
                                        <th style="width: 10%;"><i class="fa-regular fa-calendar me-1 safe-icon"></i> วันที่</th>
                                        <th style="width: 15%;"><i class="fa-solid fa-user me-1 safe-icon"></i> ผู้ป่วย</th>
                                        <th style="width: 15%;"><i class="fa-solid fa-tags me-1 safe-icon"></i> สิทธิ/โหมด</th>
                                        <th class="text-end" style="width: 10%; color: var(--primary) !important;">ค่าฟอก (฿)</th>
                                        <th class="text-end" style="width: 10%; color: var(--warning) !important;">ค่ายา (฿)</th>
                                        <th class="text-end" style="width: 10%; color: var(--danger) !important;">ค่าแล็บ (฿)</th>
                                        <th class="text-end" style="width: 10%; color: var(--info) !important;">ค่า X-Ray (฿)</th>
                                        <th class="text-end" style="width: 12%; color: var(--success) !important;">รวมสุทธิ (฿)</th>
                                        <th class="text-center" style="width: 8%;"><i class="fa-solid fa-gear safe-icon"></i></th>
                                    </tr>
                                </thead>
                                <tbody id="fin-income-body"><tr><td colspan="9" class="text-center py-5">...</td></tr></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Tab 3: Expense -->
                <div class="custom-tab-pane" id="expense-panel">
                    <div class="modern-panel panel-locked shadow-sm p-4 position-relative overflow-hidden" style="border-top: 5px solid var(--danger); border-radius: 0 20px 20px 20px; background: var(--bg-surface); border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                        <div class="d-flex justify-content-between align-items-center mb-4 position-relative z-1 flex-wrap gap-3">
                            <h5 class="fw-bold mb-0" style="color: var(--text-dark);"><i class="fa-solid fa-file-invoice text-danger me-2 safe-icon"></i> ทะเบียนรายจ่ายและต้นทุน (Expense Register)</h5>
                            <button class="btn btn-premium btn-premium-danger px-4 shadow-sm" onclick="window.FinancePage.openAddExpenseModal()">
                                <i class="fa-solid fa-plus me-2 safe-icon"></i> บันทึกรายจ่ายใหม่
                            </button>
                        </div>
                        
                        <div class="locked-table-wrapper">
                            <table class="table table-finance">
                                <thead>
                                    <tr>
                                        <th style="width: 12%;"><i class="fa-regular fa-calendar me-1 safe-icon"></i> วัน/เวลา</th>
                                        <th style="width: 15%;"><i class="fa-solid fa-tag me-1 safe-icon"></i> หมวดหมู่</th>
                                        <th style="width: 29%;"><i class="fa-solid fa-align-left me-1 safe-icon"></i> รายละเอียด</th>
                                        <th style="width: 15%;"><i class="fa-solid fa-code-branch me-1 safe-icon"></i> แหล่งที่มา</th>
                                        <th class="text-end" style="width: 15%; color: var(--danger) !important;">ยอดจ่าย (฿)</th>
                                        <th class="text-center" style="width: 13%;">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody id="fin-expense-body"><tr><td colspan="6" class="text-center py-5">...</td></tr></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 🚨 THE ULTIMATE FIX: ดักจับและบังคับยัด Key ป้องกันการเป็น Array แล้วคีย์หาย (แก้บั๊ก Edit Button เงียบ)
    parseFBArray(data) {
        if (!data) return [];
        if (Array.isArray(data)) {
            return data.map((item, index) => {
                if (item) {
                    item.firebaseKey = item.firebaseKey || String(index);
                    item.id = item.id || item.firebaseKey;
                    return item;
                }
                return null;
            }).filter(Boolean);
        }
        if (typeof data === 'object') {
            return Object.keys(data).map(k => ({ firebaseKey: k, id: k, ...data[k] })).filter(item => item !== null);
        }
        return []; 
    }

    escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }

    formatDateLocal(d) {
        let month = '' + (d.getMonth() + 1), day = '' + d.getDate(), year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [year, month, day].join('-');
    }

    formatDateTh(isoStr) {
        if(!isoStr) return '-'; const d = new Date(isoStr);
        return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth() + 1).padStart(2,'0')}/${d.getFullYear() + 543}`;
    }

    updateDateDisplays() {
        const sInput = document.getElementById('fin-start-date');
        const eInput = document.getElementById('fin-end-date');
        const sDisplay = document.getElementById('fin-start-display');
        const eDisplay = document.getElementById('fin-end-display');
        
        if (sInput) sInput.value = this.state.startDate;
        if (eInput) eInput.value = this.state.endDate;
        if (sDisplay) sDisplay.innerText = this.formatDateTh(this.state.startDate);
        if (eDisplay) eDisplay.innerText = this.formatDateTh(this.state.endDate);
    }

    init() {
        if (typeof db === 'undefined') return;

        if(!this.state.startDate || !this.state.endDate) {
            const today = new Date();
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            this.state.startDate = this.formatDateLocal(thirtyDaysAgo);
            this.state.endDate = this.formatDateLocal(today);
        }

        let attempts = 0;
        let domBinder = setInterval(() => {
            if(document.getElementById('fin-start-display')) {
                this.updateDateDisplays();
                clearInterval(domBinder);
            }
            if(++attempts > 50) clearInterval(domBinder);
        }, 100);

        this.setupFirebaseListeners();
    }

    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        if(this.state.chartInstance) {
            this.state.chartInstance.destroy();
            this.state.chartInstance = null;
        }
    }

    setupFirebaseListeners() {
        const cbRights = db.ref('clinic_rights_v2').on('value', snap => {
            const data = snap.val();
            if(data) this.state.clinicRights = this.parseFBArray(data);
        });
        this.firebaseListeners.push({ path: 'clinic_rights_v2', callback: cbRights });

        const cbMods = db.ref('clinic_modalities_v2').on('value', snap => {
            const data = snap.val();
            if(data) this.state.modalities = this.parseFBArray(data);
        });
        this.firebaseListeners.push({ path: 'clinic_modalities_v2', callback: cbMods });

        db.ref('inventory_database_v2/items').once('value', snap => {
            this.state.inventoryItems = this.parseFBArray(snap.val());
        });

        const cbTrans = db.ref('inventory_database_v2/transactions').on('value', snap => {
            if (!document.getElementById('fin-ledger-body')) return;
            const data = snap.val();
            this.state.stockTransactions = data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : [];
            this.processData();
        });
        this.firebaseListeners.push({ path: 'inventory_database_v2/transactions', callback: cbTrans });

        const cbVisits = db.ref('patients_database_v2/visits').on('value', snap => {
            if (!document.getElementById('fin-ledger-body')) return;
            this.state.allVisits = this.parseFBArray(snap.val());
            this.processData();
        });
        this.firebaseListeners.push({ path: 'patients_database_v2/visits', callback: cbVisits });

        const cbExp = db.ref('clinic_expenses_v2').on('value', snap => {
            if (!document.getElementById('fin-ledger-body')) return;
            const data = snap.val();
            this.state.allExpenses = data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : [];
            this.processData();
        });
        this.firebaseListeners.push({ path: 'clinic_expenses_v2', callback: cbExp });
    }

    onDateChange() {
        const sInput = document.getElementById('fin-start-date').value;
        const eInput = document.getElementById('fin-end-date').value;
        if(sInput && eInput) {
            if(new Date(sInput) > new Date(eInput)) { 
                Swal.fire('ข้อผิดพลาด', 'วันเริ่มต้นต้องไม่มากกว่าวันสิ้นสุด', 'warning'); 
                this.updateDateDisplays(); 
                return; 
            }
            this.state.startDate = sInput; 
            this.state.endDate = eInput;
            this.updateDateDisplays();
            this.processData();
        }
    }

    setThisMonth() {
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        this.state.startDate = this.formatDateLocal(firstDay);
        this.state.endDate = this.formatDateLocal(lastDay);
        this.updateDateDisplays();
        this.processData();
    }

    processData() {
        try {
            if (!document.getElementById('fin-income-body')) return;
            if (!this.state.startDate || !this.state.endDate) return;
            
            document.getElementById('fin-month-text').innerHTML = `ข้อมูลบัญชีตั้งแต่ <b class="text-primary">${this.formatDateTh(this.state.startDate)}</b> ถึง <b class="text-primary">${this.formatDateTh(this.state.endDate)}</b>`;

            let totalIncome = 0; let totalExpense = 0;
            let sumDialysis = 0; let sumMed = 0; let sumLab = 0; let sumXray = 0;
            let sumOpEx = 0; let sumStock = 0;
            
            let incomeHtml = ''; let expenseHtml = ''; let masterLedger = []; 

            let filteredVisits = this.state.allVisits.filter(v => v && v.date && v.date >= this.state.startDate && v.date <= this.state.endDate && v.status === "เสร็จสิ้น");
            filteredVisits.sort((a, b) => new Date(b.date) - new Date(a.date));

            if (filteredVisits.length === 0) {
                incomeHtml = `<tr><td colspan="9" class="text-center py-5" style="color: var(--text-muted);"><i class="fa-solid fa-file-invoice-dollar fa-3x mb-3" style="opacity:0.2;"></i><br>ไม่มีรายรับในช่วงเวลานี้</td></tr>`;
            } else {
                filteredVisits.forEach(v => {
                    let base_fee = parseFloat(String(v.dialysis_fee || 0).replace(/,/g, '')); 
                    if (isNaN(base_fee) || base_fee < 0) base_fee = 1500; 
                    let med_fee = Number(v.med_fee || 0);
                    let lab_fee = Number(v.lab_fee || 0);
                    let xray_fee = Number(v.xray_fee || 0);
                    let total_visit_fee = base_fee + med_fee + lab_fee + xray_fee;
                    
                    sumDialysis += base_fee;
                    sumMed += med_fee;
                    sumLab += lab_fee;
                    sumXray += xray_fee;
                    totalIncome += total_visit_fee; 

                    let itemTags = '';
                    let allItems = [];
                    if(v.hd_dialysate_item) allItems.push(v.hd_dialysate_item);
                    if(v.hd_saline_item) allItems.push(v.hd_saline_item);
                    if(v.hd_heparin_item) allItems.push(v.hd_heparin_item);
                    this.parseFBArray(v.other_meds).forEach(m => { if(m.id || m.name) allItems.push(m.id || m.name); });
                    this.parseFBArray(v.xray_list).forEach(x => { if(x.id || x.name) allItems.push(x.id || x.name); });
                    
                    if(allItems.length > 0) {
                        itemTags = `<div class="mt-1 d-flex flex-wrap" style="gap:2px;">` + 
                                   allItems.slice(0, 3).map(i => `<span class="micro-tag" title="${this.escapeHTML(i)}">${this.escapeHTML(i)}</span>`).join('') +
                                   (allItems.length > 3 ? `<span class="micro-tag bg-primary-subtle text-primary">+${allItems.length - 3}</span>` : '') +
                                   `</div>`;
                    }

                    // 🚨 THE FIX: ป้องกันปุ่มแก้ไขพัง โดยการดึง v.firebaseKey หรือ v.id 
                    let safeKey = v.firebaseKey || v.id;

                    incomeHtml += `
                    <tr class="card-hover-float" style="cursor:default;">
                        <td><span class="fw-bold" style="color: var(--text-dark);">${this.formatDateTh(v.date)}</span></td>
                        <td>
                            <div class="fw-bold" style="font-family:'Prompt'; font-size:14.5px; color: var(--text-dark);">${this.escapeHTML(v.name || 'ไม่ระบุชื่อ')}</div>
                            <div class="small mt-1" style="color: var(--text-muted);">HN: ${this.escapeHTML(v.hn)}</div>
                            ${itemTags}
                        </td>
                        <td>
                            <div class="d-flex flex-column gap-1 align-items-start">
                                <span class="badge badge-soft-success border border-success-subtle badge-safe">${this.escapeHTML(v.right || '-')}</span>
                                <span class="badge badge-soft-primary border border-primary-subtle badge-safe">${this.escapeHTML(v.hd_mode || 'HD ปกติ')}</span>
                            </div>
                        </td>
                        <td class="text-end fw-bold text-primary">${base_fee.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td class="text-end fw-bold" style="color: var(--warning);">${med_fee > 0 ? med_fee.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                        <td class="text-end fw-bold text-danger">${lab_fee > 0 ? lab_fee.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                        <td class="text-end fw-bold text-info">${xray_fee > 0 ? xray_fee.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                        <td class="text-end fw-bold text-success" style="font-size:15px;">+ ${total_visit_fee.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td class="text-center">
                            <button class="btn btn-sm btn-light border border-primary-subtle text-primary shadow-sm rounded px-2 py-1 w-100" onclick="window.FinancePage.editIncome('${safeKey}')">
                                <i class="fa-solid fa-pen me-1"></i> แก้ไข
                            </button>
                        </td>
                    </tr>`;

                    masterLedger.push({ dateObj: new Date(v.date + " " + (v.time || "00:00")), dateStr: v.date, timeStr: v.time || "00:00", type: 'INCOME', category: 'ค่าบริการฟอกเลือดและอื่นๆ', desc: `คิวฟอกไต HN:${v.hn} (${this.escapeHTML(v.name)}) [${this.escapeHTML(v.hd_mode||'HD')}]`, amount: total_visit_fee });
                });
            }
            
            document.getElementById('fin-income-body').innerHTML = incomeHtml;
            document.getElementById('fin-total-income').innerText = totalIncome.toLocaleString(undefined, {minimumFractionDigits: 2});
            document.getElementById('fin-pt-count').innerText = filteredVisits.length;
            
            document.getElementById('fin-sum-dialysis').innerText = sumDialysis.toLocaleString(undefined, {minimumFractionDigits: 2});
            document.getElementById('fin-sum-med').innerText = sumMed.toLocaleString(undefined, {minimumFractionDigits: 2});
            document.getElementById('fin-sum-lab').innerText = sumLab.toLocaleString(undefined, {minimumFractionDigits: 2});
            document.getElementById('fin-sum-xray').innerText = sumXray.toLocaleString(undefined, {minimumFractionDigits: 2});

            let filteredExpenses = this.state.allExpenses.filter(e => e && e.date && e.date >= this.state.startDate && e.date <= this.state.endDate);
            let filteredStockLogs = this.state.stockTransactions.filter(log => log && log.timestamp && log.timestamp.split('T')[0] >= this.state.startDate && log.timestamp.split('T')[0] <= this.state.endDate && log.mode === 'out_sub' && log.note && log.note.includes("ตัดเบิก Flowsheet"));

            let aggregatedStockCosts = [];
            filteredStockLogs.forEach(log => {
                let item = this.state.inventoryItems.find(i => i.id === log.itemId);
                let cost = (item && item.price ? Number(item.price) : 0) * Number(log.qty);
                aggregatedStockCosts.push({ id: log.id, date: log.timestamp.split('T')[0], time: log.timestamp.split('T')[1].substring(0,5), category: 'ต้นทุนพัสดุฟอกเลือด', description: `เบิกพัสดุ: ${log.itemName} (x${log.qty})`, amount: cost, recorded_by: log.user || 'System', isSystemGenerated: true });
            });

            let combinedExpenses = [...filteredExpenses, ...aggregatedStockCosts];
            combinedExpenses.sort((a, b) => {
                let da = new Date(a.date + " " + (a.time || "23:59"));
                let dbDate = new Date(b.date + " " + (b.time || "23:59"));
                return dbDate - da;
            });

            if (combinedExpenses.length === 0) {
                expenseHtml = `<tr><td colspan="6" class="text-center py-5" style="color: var(--text-muted);"><i class="fa-solid fa-receipt fa-3x mb-3" style="opacity:0.2;"></i><br>ไม่มีบันทึกรายจ่ายในช่วงเวลานี้</td></tr>`;
            } else {
                combinedExpenses.forEach(e => {
                    let amount = Number(e.amount) || 0; 
                    
                    if(e.isSystemGenerated) sumStock += amount; else sumOpEx += amount;
                    totalExpense += amount;

                    let catBadge = `<span class="badge px-3 py-1 shadow-sm rounded-pill badge-safe" style="background: var(--bg-body); border: 1px solid var(--border-color); color: var(--text-dark);">${this.escapeHTML(e.category)}</span>`;
                    if(e.category === 'ค่าน้ำ/ค่าไฟ/อินเทอร์เน็ต') catBadge = `<span class="badge badge-soft-warning px-3 py-1 shadow-sm rounded-pill border border-warning-subtle badge-safe">${e.category}</span>`;
                    else if(e.category === 'เงินเดือน/ค่าจ้าง') catBadge = `<span class="badge badge-soft-primary px-3 py-1 shadow-sm rounded-pill border border-primary-subtle badge-safe">${e.category}</span>`;
                    else if(e.category === 'สั่งซื้อยา/พัสดุ') catBadge = `<span class="badge badge-soft-info px-3 py-1 shadow-sm rounded-pill border border-info-subtle badge-safe">${e.category}</span>`;
                    else if(e.category === 'ซ่อมบำรุง/สถานที่') catBadge = `<span class="badge badge-soft-danger px-3 py-1 shadow-sm rounded-pill border border-danger-subtle badge-safe">${e.category}</span>`;
                    else if(e.category === 'ต้นทุนพัสดุฟอกเลือด') catBadge = `<span class="badge badge-soft-dark px-3 py-1 shadow-sm rounded-pill border badge-safe"><i class="fa-solid fa-box-open me-1"></i> ต้นทุนพัสดุ</span>`;

                    let sourceBadge = e.isSystemGenerated 
                        ? `<div class="badge badge-soft-dark border badge-safe"><i class="fa-solid fa-robot me-1"></i> ตัดสต๊อกอัตโนมัติ</div>`
                        : `<div class="badge badge-soft-info border border-info-subtle badge-safe"><i class="fa-solid fa-user-pen me-1"></i> ลงบัญชีแมนวล</div><div class="small mt-1 fw-bold text-center" style="color: var(--text-muted);">โดย: ${this.escapeHTML(e.recorded_by || 'Admin')}</div>`;

                    let actionHtml = e.isSystemGenerated ? `<span class="text-muted small">-</span>` : 
                        `<div class="d-flex gap-1 justify-content-center">
                            <button class="btn btn-sm btn-light border border-warning-subtle text-warning-dark shadow-sm rounded" onclick="window.FinancePage.editExpenseModal('${e.id}')" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn btn-sm btn-light border border-danger-subtle text-danger shadow-sm rounded" onclick="window.FinancePage.deleteExpense('${e.id}')" title="ลบ"><i class="fa-solid fa-trash"></i></button>
                        </div>`;

                    expenseHtml += `
                    <tr class="card-hover-float" style="cursor:default;">
                        <td>
                            <span class="fw-bold" style="color: var(--text-dark);">${this.formatDateTh(e.date)}</span>
                            <div class="small text-muted">${e.time || ''}</div>
                        </td>
                        <td>${catBadge}</td>
                        <td><div class="fw-bold" style="font-family:'Prompt'; font-size:14.5px; color: var(--text-dark);">${this.escapeHTML(e.description || '-')}</div></td>
                        <td>${sourceBadge}</td>
                        <td class="text-end fw-bold text-danger" style="font-size:15px;">- ฿${amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td class="text-center">${actionHtml}</td>
                    </tr>`;

                    masterLedger.push({ dateObj: new Date(e.date + " " + (e.time || "23:59")), dateStr: e.date, timeStr: e.time || "", type: 'EXPENSE', category: e.category, desc: e.description, amount: amount });
                });
            }
            
            document.getElementById('fin-expense-body').innerHTML = expenseHtml;
            document.getElementById('fin-total-expense').innerText = totalExpense.toLocaleString(undefined, {minimumFractionDigits: 2});
            document.getElementById('fin-sum-opex').innerText = sumOpEx.toLocaleString(undefined, {minimumFractionDigits: 2});
            document.getElementById('fin-sum-stock').innerText = sumStock.toLocaleString(undefined, {minimumFractionDigits: 2});

            let netProfit = totalIncome - totalExpense;
            let netEl = document.getElementById('fin-net-profit');
            if (netProfit >= 0) { 
                netEl.innerHTML = `<span class="text-primary">฿${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>`; 
            } else { 
                netEl.innerHTML = `<span class="text-danger">฿${netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>`; 
            }

            this.state._summaryData = { totalIncome, totalExpense, netProfit, sumDialysis, sumMed, sumLab, sumXray, sumOpEx, sumStock };

            this.state.exportData = {
                incomeLogs: filteredVisits,
                expenseLogs: combinedExpenses,
                ledger: masterLedger,
                summary: this.state._summaryData
            };

            masterLedger.sort((a, b) => a.dateObj - b.dateObj);
            let ledgerHtml = ''; let runningBalance = 0;

            if (masterLedger.length === 0) {
                ledgerHtml = `<tr><td colspan="6" class="text-center py-5" style="color: var(--text-muted);"><i class="fa-solid fa-file-invoice fa-3x mb-3" style="opacity:0.2;"></i><br>ไม่มีความเคลื่อนไหวทางบัญชี</td></tr>`;
            } else {
                masterLedger.forEach(item => {
                    if(item.type === 'INCOME') runningBalance += item.amount; else runningBalance -= item.amount;
                    item.balance = runningBalance;
                });

                [...masterLedger].reverse().forEach(item => {
                    let badge = item.type === 'INCOME' 
                        ? `<span class="badge badge-soft-success px-3 py-1 rounded-pill border border-success-subtle badge-safe"><i class="fa-solid fa-arrow-down me-1 safe-icon"></i> รายรับ</span>` 
                        : `<span class="badge badge-soft-danger px-3 py-1 rounded-pill border border-danger-subtle badge-safe"><i class="fa-solid fa-arrow-up me-1 safe-icon"></i> รายจ่าย</span>`;
                    
                    let timeShow = item.timeStr ? `<div class="small text-muted">${item.timeStr}</div>` : '';
                    
                    ledgerHtml += `
                    <tr class="card-hover-float">
                        <td><span class="fw-bold" style="color: var(--text-dark);">${this.formatDateTh(item.dateStr)}</span>${timeShow}</td>
                        <td class="text-center">${badge}</td>
                        <td><div class="fw-bold" style="font-size:14px; font-family:'Prompt'; color: var(--text-dark);">${this.escapeHTML(item.desc)}</div><div class="small" style="color: var(--text-muted);"><i class="fa-solid fa-tag me-1 safe-icon"></i> ${this.escapeHTML(item.category)}</div></td>
                        <td class="text-end ledger-in">${item.type === 'INCOME' ? '+ '+item.amount.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                        <td class="text-end ledger-out">${item.type === 'EXPENSE' ? '- '+item.amount.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                        <td class="text-end fw-bold text-primary" style="font-size:15px;">฿${item.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    </tr>`;
                });
            }
            document.getElementById('fin-ledger-body').innerHTML = ledgerHtml;
            this.renderChart(totalIncome, totalExpense);

        } catch (error) {
            console.error("Finance Data Error:", error);
            document.getElementById('fin-total-income').innerText = "Error";
            document.getElementById('fin-total-expense').innerText = "Error";
            document.getElementById('fin-net-profit').innerText = "Error";
        }
    }

    // 🚨 THE FIX: ป้องกันบั๊กกด Edit แล้วเงียบ 
    editIncome(targetId) {
        console.log("✏️ กำลังพยายามแก้ไขบิล ID:", targetId);
        
        let v = this.state.allVisits.find(x => x.firebaseKey === targetId || x.id === targetId);
        
        if(!v) {
            console.error("❌ หาบิลไม่เจอในหน่วยความจำ! ID ที่ค้นหา:", targetId);
            Swal.fire('ข้อผิดพลาด', 'ไม่พบข้อมูลบิลนี้ในระบบ อาจมีการลบหรือรีเฟรชข้อมูล', 'error');
            return;
        }

        Swal.fire({
            title: `<h4 class="fw-bold text-success mb-0" style="font-family:'Prompt';"><i class="fa-solid fa-file-invoice-dollar me-2 safe-icon"></i> แก้ไขบิลค่ารักษา</h4>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <div class="badge badge-soft-primary w-100 mb-3 fs-6 p-2 text-start border border-primary-subtle"><i class="fa-solid fa-user me-2"></i> ${this.escapeHTML(v.name)} (HN: ${this.escapeHTML(v.hn)})</div>
                    
                    <div class="row g-2 mb-2">
                        <div class="col-6"><label class="form-label fw-bold small text-muted">ค่าฟอกเลือด (บาท)</label>
                        <input type="number" id="swal-inc-base" class="form-control input-modern text-primary fw-bold" value="${v.dialysis_fee || 0}" min="0"></div>
                        
                        <div class="col-6"><label class="form-label fw-bold small text-muted">ค่ายา/เวชภัณฑ์ (บาท)</label>
                        <input type="number" id="swal-inc-med" class="form-control input-modern text-warning-dark fw-bold" value="${v.med_fee || 0}" min="0"></div>
                        
                        <div class="col-6"><label class="form-label fw-bold small text-muted">ค่าแล็บ (บาท)</label>
                        <input type="number" id="swal-inc-lab" class="form-control input-modern text-danger fw-bold" value="${v.lab_fee || 0}" min="0"></div>
                        
                        <div class="col-6"><label class="form-label fw-bold small text-muted">ค่า X-Ray (บาท)</label>
                        <input type="number" id="swal-inc-xray" class="form-control input-modern text-info fw-bold" value="${v.xray_fee || 0}" min="0"></div>
                    </div>
                    <div class="text-muted small mt-2"><i class="fa-solid fa-circle-info text-info me-1"></i> การเปลี่ยนตัวเลขที่นี่ จะเปลี่ยนเฉพาะข้อมูลบัญชีการเงิน ไม่ลบประวัติการฟอกเลือดทิ้ง</div>
                </div>`,
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึก', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#10b981', width: 450, customClass: { popup: 'premium-alert' },
            preConfirm: () => {
                let base = Number(document.getElementById('swal-inc-base').value) || 0;
                let med = Number(document.getElementById('swal-inc-med').value) || 0;
                let lab = Number(document.getElementById('swal-inc-lab').value) || 0;
                let xray = Number(document.getElementById('swal-inc-xray').value) || 0;
                return { dialysis_fee: base, med_fee: med, lab_fee: lab, xray_fee: xray };
            }
        }).then((result) => { 
            if (result.isConfirmed) {
                // ใช้อันที่มีค่า เพื่ออัปเดตลง Firebase ให้ถูก Node
                const exactDbKey = v.firebaseKey || v.id;
                
                db.ref(`patients_database_v2/visits/${exactDbKey}`).update(result.value).then(() => {
                    Swal.fire({ title: 'อัปเดตบิลสำเร็จ', icon: 'success', timer: 1000, showConfirmButton: false });
                    v.dialysis_fee = result.value.dialysis_fee;
                    v.med_fee = result.value.med_fee;
                    v.lab_fee = result.value.lab_fee;
                    v.xray_fee = result.value.xray_fee;
                    this.processData();
                }).catch(err => {
                    Swal.fire('ข้อผิดพลาด', 'บันทึกไม่สำเร็จ: ' + err.message, 'error');
                });
            }
        });
    }

    editExpenseModal(id) {
        let e = this.state.allExpenses.find(x => x.id === id);
        if(!e) return;

        Swal.fire({
            title: `<h4 class="fw-bold text-danger mb-0" style="font-family:'Prompt';"><i class="fa-solid fa-pen-to-square me-2 safe-icon"></i> แก้ไขรายจ่าย</h4>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <div class="row g-3 mb-3">
                        <div class="col-6"><label class="form-label fw-bold small" style="color: var(--text-muted);">วันที่จ่าย</label>
                        <input type="date" id="swal-exp-date" class="form-control input-modern" style="font-family:'Prompt'; font-weight:bold; border-radius:8px;" value="${e.date}"></div>
                        <div class="col-6"><label class="form-label fw-bold small" style="color: var(--text-muted);">หมวดหมู่รายจ่าย</label>
                            <select id="swal-exp-category" class="form-select input-modern" style="border-radius:8px;">
                                <option value="สั่งซื้อยา/พัสดุ" ${e.category==='สั่งซื้อยา/พัสดุ'?'selected':''}>📦 สั่งซื้อยา/พัสดุ</option>
                                <option value="เงินเดือน/ค่าจ้าง" ${e.category==='เงินเดือน/ค่าจ้าง'?'selected':''}>👥 เงินเดือน/ค่าจ้าง</option>
                                <option value="ค่าน้ำ/ค่าไฟ/อินเทอร์เน็ต" ${e.category==='ค่าน้ำ/ค่าไฟ/อินเทอร์เน็ต'?'selected':''}>⚡ ค่าน้ำ/ค่าไฟ/อินเทอร์เน็ต</option>
                                <option value="ซ่อมบำรุง/สถานที่" ${e.category==='ซ่อมบำรุง/สถานที่'?'selected':''}>🛠️ ซ่อมบำรุง/สถานที่</option>
                                <option value="จิปาถะ/อื่นๆ" ${e.category==='จิปาถะ/อื่นๆ'?'selected':''}>📌 จิปาถะ/อื่นๆ</option>
                            </select>
                        </div>
                    </div>
                    <label class="form-label fw-bold small" style="color: var(--text-muted);">รายละเอียด / ชื่อรายการ <span class="text-danger">*</span></label>
                    <input type="text" id="swal-exp-desc" class="form-control input-modern fw-bold mb-3" style="border-radius:8px; color: var(--text-dark);" value="${this.escapeHTML(e.description)}">
                    <label class="form-label fw-bold text-danger small">จำนวนเงินที่จ่าย (บาท) <span class="text-danger">*</span></label>
                    <div class="input-group shadow-sm" style="border-radius:12px; overflow:hidden; background: var(--bg-body); border: 1px solid var(--border-color);"><span class="input-group-text bg-danger text-white border-0"><i class="fa-solid fa-baht-sign px-2 safe-icon"></i></span><input type="number" id="swal-exp-amount" class="form-control input-modern form-control-lg fw-bold text-danger border-0 text-end bg-transparent" placeholder="0.00" min="0" value="${e.amount}" style="box-shadow: none !important;"></div>
                </div>`,
            showCancelButton: true, confirmButtonText: 'บันทึกการแก้ไข', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#ef4444', width: 500, customClass: { popup: 'premium-alert' },
            preConfirm: () => {
                const date = document.getElementById('swal-exp-date').value; const category = document.getElementById('swal-exp-category').value;
                const desc = document.getElementById('swal-exp-desc').value.trim(); const amount = document.getElementById('swal-exp-amount').value;
                if (!date || !desc || !amount || Number(amount) <= 0) { Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วน'); return false; }
                return { date: date, category: category, description: desc, amount: Number(amount) };
            }
        }).then((result) => { 
            if (result.isConfirmed) {
                db.ref(`clinic_expenses_v2/${id}`).update(result.value).then(() => {
                    Swal.fire({ title: 'แก้ไขสำเร็จ', icon: 'success', timer: 1000, showConfirmButton: false });
                });
            }
        });
    }

    renderChart(income, expense) {
        const ctx = document.getElementById('financeChart'); if (!ctx) return;
        if (this.state.chartInstance) this.state.chartInstance.destroy();
        
        const ChartLib = window.Chart;
        if (!ChartLib) return;

        const themeTextColor = getComputedStyle(document.documentElement).getPropertyValue('--text-dark').trim() || '#334155';
        const themeGridColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#e2e8f0';

        this.state.chartInstance = new ChartLib(ctx, {
            type: 'bar',
            data: { labels: ['เปรียบเทียบกระแสเงินสดคลินิก'], datasets: [{ label: 'รายรับรวมสุทธิ (Income)', data: [income], backgroundColor: 'rgba(16, 185, 129, 0.8)', borderColor: '#10b981', borderWidth: 2, borderRadius: 8 }, { label: 'รายจ่าย (Expense)', data: [expense], backgroundColor: 'rgba(239, 68, 68, 0.8)', borderColor: '#ef4444', borderWidth: 2, borderRadius: 8 }] },
            options: { 
                responsive: true, maintainAspectRatio: false, 
                plugins: { legend: { position: 'top', labels: { color: themeTextColor, font: { family: 'Prompt', size: 14 } } } }, 
                scales: { 
                    y: { beginAtZero: true, grid: { color: themeGridColor }, ticks: { color: themeTextColor, font: { family: 'Prompt' } } }, 
                    x: { grid: { display: false }, ticks: { color: themeTextColor, font: { family: 'Prompt', size: 14 } } } 
                } 
            }
        });
    }

    openAddExpenseModal() {
        const todayStr = new Date().toISOString().split('T')[0];
        Swal.fire({
            title: `<h4 class="fw-bold text-danger mb-0" style="font-family:'Prompt';"><i class="fa-solid fa-file-invoice-dollar me-2 safe-icon"></i> บันทึกรายจ่ายใหม่</h4>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <div class="row g-3 mb-3">
                        <div class="col-6"><label class="form-label fw-bold small" style="color: var(--text-muted);">วันที่จ่าย</label>
                        <input type="date" id="swal-exp-date" class="form-control input-modern" style="font-family:'Prompt'; font-weight:bold; border-radius:8px;" value="${todayStr}"></div>
                        <div class="col-6"><label class="form-label fw-bold small" style="color: var(--text-muted);">หมวดหมู่รายจ่าย</label>
                            <select id="swal-exp-category" class="form-select input-modern" style="border-radius:8px;">
                                <option value="สั่งซื้อยา/พัสดุ">📦 สั่งซื้อยา/พัสดุ</option><option value="เงินเดือน/ค่าจ้าง">👥 เงินเดือน/ค่าจ้าง</option>
                                <option value="ค่าน้ำ/ค่าไฟ/อินเทอร์เน็ต">⚡ ค่าน้ำ/ค่าไฟ/อินเทอร์เน็ต</option><option value="ซ่อมบำรุง/สถานที่">🛠️ ซ่อมบำรุง/สถานที่</option><option value="จิปาถะ/อื่นๆ">📌 จิปาถะ/อื่นๆ</option>
                            </select>
                        </div>
                    </div>
                    <label class="form-label fw-bold small" style="color: var(--text-muted);">รายละเอียด / ชื่อรายการ <span class="text-danger">*</span></label>
                    <input type="text" id="swal-exp-desc" class="form-control input-modern fw-bold mb-3" style="border-radius:8px; color: var(--text-dark);">
                    <label class="form-label fw-bold text-danger small">จำนวนเงินที่จ่าย (บาท) <span class="text-danger">*</span></label>
                    <div class="input-group shadow-sm" style="border-radius:12px; overflow:hidden; background: var(--bg-body); border: 1px solid var(--border-color);"><span class="input-group-text bg-danger text-white border-0"><i class="fa-solid fa-baht-sign px-2 safe-icon"></i></span><input type="number" id="swal-exp-amount" class="form-control input-modern form-control-lg fw-bold text-danger border-0 text-end bg-transparent" placeholder="0.00" min="0" style="box-shadow: none !important;"></div>
                </div>`,
            showCancelButton: true, confirmButtonText: 'บันทึก', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#ef4444', width: 500, customClass: { popup: 'premium-alert' },
            preConfirm: () => {
                const date = document.getElementById('swal-exp-date').value; const category = document.getElementById('swal-exp-category').value;
                const desc = document.getElementById('swal-exp-desc').value.trim(); const amount = document.getElementById('swal-exp-amount').value;
                if (!date || !desc || !amount || Number(amount) <= 0) { Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วน'); return false; }
                return { id: 'EXP-' + new Date().getTime(), date: date, category: category, description: desc, amount: Number(amount), recorded_by: App.currentUser ? App.currentUser.name : 'Admin', timestamp: new Date().toISOString() };
            }
        }).then((result) => { 
            if (result.isConfirmed) {
                db.ref('clinic_expenses_v2/' + result.value.id).set(result.value).then(()=>Swal.fire({title:'บันทึกสำเร็จ', icon:'success', timer:1000, showConfirmButton:false})); 
            }
        });
    }

    deleteExpense(id) {
        Swal.fire({ title: 'ยืนยันการลบบิล?', text: 'การลบจะไม่สามารถกู้คืนได้', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'ลบ', cancelButtonText: 'ยกเลิก', customClass: { popup: 'premium-alert' } }).then((result) => { 
            if (result.isConfirmed) {
                db.ref('clinic_expenses_v2/' + id).remove().then(()=>Swal.fire({title:'ลบสำเร็จ', icon:'success', timer:1000, showConfirmButton:false})); 
            }
        });
    }

    async exportExcel() {
        if (!this.state.exportData || this.state.exportData.ledger.length === 0) {
            Swal.fire('ไม่มีข้อมูล', 'ไม่พบข้อมูลบัญชีในช่วงเวลานี้', 'warning');
            return;
        }

        if (typeof ExcelJS === 'undefined') {
            Swal.fire({ title: 'กำลังโหลด Excel Engine...', html: 'โปรดรอสักครู่...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js';
            script.onload = () => { Swal.close(); this._generateFinanceExcel(); };
            script.onerror = () => { Swal.fire('ระบบขัดข้อง', 'ไม่สามารถดาวน์โหลด Excel Engine ได้', 'error'); };
            document.head.appendChild(script);
            return;
        }
        this._generateFinanceExcel();
    }

    async _generateFinanceExcel() {
        Swal.fire({ title: 'กำลังสร้างไฟล์ Excel...', html: 'ดึงข้อมูลแบบเจาะลึก 4 หน้ากระดาษ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
            const data = this.state.exportData;
            const sum = data.summary;
            const workbook = new ExcelJS.Workbook();
            
            const applyTableStyles = (row, isHeader = false) => {
                row.eachCell((cell, colNum) => {
                    cell.font = { name: 'Tahoma', bold: isHeader, color: { argb: 'FF0F172A' }, size: 11 };
                    cell.border = { top:{style:'thin'}, bottom:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'} };
                    cell.alignment = { vertical: 'middle', wrapText: true };
                    if (isHeader) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }; cell.alignment.horizontal = 'center'; }
                });
            };

            // Sheet 1: Summary
            const sheet1 = workbook.addWorksheet('สรุปการเงิน', { views: [{ showGridLines: false }] });
            sheet1.columns = [{ width: 50 }, { width: 25 }];
            
            sheet1.mergeCells('A1:B1');
            sheet1.getCell('A1').value = 'รายงานสรุปดุลกระแสเงินสด (Financial Summary)';
            sheet1.getCell('A1').font = { name: 'Tahoma', size: 16, bold: true, color: { argb: 'FF1E3A8A' } };
            
            sheet1.mergeCells('A2:B2');
            sheet1.getCell('A2').value = `ระหว่างวันที่: ${this.formatDateTh(this.state.startDate)} ถึง ${this.formatDateTh(this.state.endDate)}`;
            sheet1.addRow([]);

            const h1 = sheet1.addRow(['หมวดหมู่', 'ยอดรวม (บาท)']);
            applyTableStyles(h1, true);
            
            const addSummaryRow = (label, amount, isBold=false, color='FF0F172A') => {
                let r = sheet1.addRow([label, amount]);
                applyTableStyles(r);
                r.getCell(1).font = { name: 'Tahoma', bold: isBold, color: { argb: color }, size: 11 };
                r.getCell(2).font = { name: 'Tahoma', bold: isBold, color: { argb: color }, size: 11 };
                r.getCell(2).numFmt = '#,##0.00';
            };

            addSummaryRow('1.1 ค่าบริการฟอกเลือด (Dialysis Base Fee)', sum.sumDialysis);
            addSummaryRow('1.2 ค่ายาและเวชภัณฑ์ (Medications)', sum.sumMed);
            addSummaryRow('1.3 ค่าผลตรวจแล็บ (Labs)', sum.sumLab);
            addSummaryRow('1.4 ค่าภาพถ่ายรังสี (X-Ray)', sum.sumXray);
            addSummaryRow('รวมรายรับสุทธิ (Total Income)', sum.totalIncome, true, 'FF15803D');
            
            sheet1.addRow([]);
            const h2 = sheet1.addRow(['หมวดหมู่รายจ่าย', 'ยอดรวม (บาท)']);
            applyTableStyles(h2, true);

            addSummaryRow('2.1 บิลค่าใช้จ่ายทั่วไป (OPEX)', sum.sumOpEx);
            addSummaryRow('2.2 ต้นทุนพัสดุฟอกเลือด (Stock Value)', sum.sumStock);
            addSummaryRow('รวมรายจ่ายสุทธิ (Total Expense)', sum.totalExpense, true, 'FFB91C1C');

            sheet1.addRow([]);
            addSummaryRow('กำไรสุทธิ (Net Cash Flow)', sum.netProfit, true, 'FF1D4ED8');

            // Sheet 2: Ledger
            const sheet2 = workbook.addWorksheet('สมุดบัญชีรวม (Ledger)', { views: [{ showGridLines: false }] });
            sheet2.columns = [
                { width: 15 }, { width: 12 }, { width: 45 }, { width: 15 }, { width: 15 }, { width: 15 }
            ];
            sheet2.addRow(['วันที่ทำรายการ', 'ประเภท', 'รายละเอียดรายการ', 'เงินเข้า (IN)', 'เงินออก (OUT)', 'ยอดสะสม (BAL)']);
            applyTableStyles(sheet2.getRow(1), true);

            data.ledger.forEach(item => {
                let r = sheet2.addRow([
                    this.formatDateTh(item.dateStr), 
                    item.type === 'INCOME' ? 'รายรับ' : 'รายจ่าย',
                    `[${item.category}] ${item.desc}`,
                    item.type === 'INCOME' ? item.amount : '',
                    item.type === 'EXPENSE' ? item.amount : '',
                    item.balance
                ]);
                applyTableStyles(r);
                r.getCell(1).alignment = { horizontal: 'center' }; r.getCell(2).alignment = { horizontal: 'center' };
                r.getCell(4).numFmt = '#,##0.00'; r.getCell(5).numFmt = '#,##0.00'; r.getCell(6).numFmt = '#,##0.00';
            });

            // Sheet 3: Income Detail
            const sheet3 = workbook.addWorksheet('ทะเบียนรายรับ (Income)', { views: [{ showGridLines: false }] });
            sheet3.columns = [
                { width: 15 }, { width: 15 }, { width: 30 }, { width: 25 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 40 }
            ];
            sheet3.addRow(['วันที่', 'HN', 'ชื่อผู้ป่วย', 'สิทธิ/โหมด', 'ค่าฟอก (฿)', 'ค่ายา (฿)', 'ค่าแล็บ (฿)', 'ค่า X-Ray (฿)', 'รวมสุทธิ (฿)', 'รายการยาและพัสดุที่ใช้']);
            applyTableStyles(sheet3.getRow(1), true);

            data.incomeLogs.forEach(v => {
                let base_fee = parseFloat(String(v.dialysis_fee || 0).replace(/,/g, '')); if (isNaN(base_fee) || base_fee <= 0) base_fee = 1500; 
                let med_fee = Number(v.med_fee || 0); let lab_fee = Number(v.lab_fee || 0); let xray_fee = Number(v.xray_fee || 0);
                
                let allItems = [];
                if(v.hd_dialysate_item) allItems.push(v.hd_dialysate_item);
                if(v.hd_saline_item) allItems.push(v.hd_saline_item);
                if(v.hd_heparin_item) allItems.push(v.hd_heparin_item);
                this.parseFBArray(v.other_meds).forEach(m => { if(m.id || m.name) allItems.push(m.id || m.name); });
                this.parseFBArray(v.xray_list).forEach(x => { if(x.id || x.name) allItems.push(x.id || x.name); });

                let r = sheet3.addRow([
                    this.formatDateTh(v.date), v.hn, v.name, `${v.right||'-'} / ${v.hd_mode||'HD'}`,
                    base_fee, med_fee, lab_fee, xray_fee, base_fee+med_fee+lab_fee+xray_fee,
                    allItems.join(', ')
                ]);
                applyTableStyles(r);
                r.getCell(1).alignment = { horizontal: 'center' }; r.getCell(2).alignment = { horizontal: 'center' };
                r.getCell(5).numFmt = '#,##0.00'; r.getCell(6).numFmt = '#,##0.00'; r.getCell(7).numFmt = '#,##0.00'; r.getCell(8).numFmt = '#,##0.00'; r.getCell(9).numFmt = '#,##0.00';
            });

            // Sheet 4: Expense Detail
            const sheet4 = workbook.addWorksheet('ทะเบียนรายจ่าย (Expense)', { views: [{ showGridLines: false }] });
            sheet4.columns = [
                { width: 15 }, { width: 10 }, { width: 20 }, { width: 45 }, { width: 20 }, { width: 15 }
            ];
            sheet4.addRow(['วันที่', 'เวลา', 'หมวดหมู่', 'รายละเอียด', 'แหล่งที่มา', 'ยอดจ่าย (฿)']);
            applyTableStyles(sheet4.getRow(1), true);

            data.expenseLogs.forEach(e => {
                let r = sheet4.addRow([
                    this.formatDateTh(e.date), e.time || '-', e.category, e.description, 
                    e.isSystemGenerated ? 'ตัดสต๊อกอัตโนมัติ' : 'ลงบัญชีแมนวล', Number(e.amount)
                ]);
                applyTableStyles(r);
                r.getCell(1).alignment = { horizontal: 'center' }; r.getCell(2).alignment = { horizontal: 'center' };
                r.getCell(6).numFmt = '#,##0.00';
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `รายงานการเงินคลินิก_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            
            Swal.fire('ดาวน์โหลดสำเร็จ!', 'ไฟล์บัญชี Excel แบบ 4 หน้า ถูกสร้างเรียบร้อยแล้ว', 'success');

        } catch (error) {
            console.error(error);
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถสร้างไฟล์ Excel ได้: ' + error.message, 'error');
        }
    }

    _executePrint(htmlContent) {
        Swal.fire({ title: 'กำลังเตรียมเอกสาร...', html: 'ระบบกำลังดึงข้อมูลเข้าสู่โหมดการจัดพิมพ์อย่างปลอดภัย', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
        let oldIframe = document.getElementById('hidden-print-frame'); if (oldIframe) { oldIframe.remove(); }
        let iframe = document.createElement('iframe'); iframe.id = 'hidden-print-frame'; iframe.style.position = 'fixed'; iframe.style.right = '0'; iframe.style.bottom = '0'; iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = '0'; document.body.appendChild(iframe);
        iframe.onload = function() { setTimeout(function() { Swal.close(); iframe.contentWindow.focus(); iframe.contentWindow.print(); setTimeout(() => { if (document.getElementById('hidden-print-frame')) document.getElementById('hidden-print-frame').remove(); }, 10000); }, 800); };
        let doc = iframe.contentWindow.document; doc.open(); doc.write(htmlContent); doc.close();
    }

    printLedger() {
        let tbodyHtml = ''; let runningBalance = 0;
        this.state.exportData.ledger.forEach((item, idx) => { if(item.type === 'INCOME') runningBalance += item.amount; else runningBalance -= item.amount; tbodyHtml += `<tr><td style="text-align:center;">${idx+1}</td><td style="text-align:center;">${this.formatDateTh(item.dateStr)}</td><td>${this.escapeHTML(item.desc)}</td><td style="text-align:right; color:#10b981;">${item.type==='INCOME'?item.amount.toLocaleString(undefined,{minimumFractionDigits:2}):'-'}</td><td style="text-align:right; color:#ef4444;">${item.type==='EXPENSE'?item.amount.toLocaleString(undefined,{minimumFractionDigits:2}):'-'}</td><td style="text-align:right; font-weight:bold;">฿${runningBalance.toLocaleString(undefined,{minimumFractionDigits:2})}</td></tr>`; });

        db.ref('clinic_settings_v2').once('value', snap => {
            const settings = snap.val() || { clinic_name: "DIALYSIS PRO CLINIC" };
            const html = `<html><head><meta charset="UTF-8"><title>Statement</title><link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet"><style>*{-webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important;}body{font-family:'Sarabun',sans-serif;padding:20px;font-size:13px;}.header{text-align:center;margin-bottom:20px;border-bottom:2px solid #000;padding-bottom:15px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #000;padding:8px;}th{background-color:#f1f5f9 !important;}</style></head><body><div class="header"><h2>${this.escapeHTML(settings.clinic_name)}</h2><h3>สมุดบัญชีรายรับ-รายจ่ายคลินิกหลัก (General Ledger Statement)</h3><div>ช่วงวันที่: ${this.formatDateTh(this.state.startDate)} ถึง ${this.formatDateTh(this.state.endDate)}</div></div><table><thead><tr><th>#</th><th>วันที่</th><th>รายละเอียดรายการ</th><th>เงินเข้า (IN)</th><th>เงินออก (OUT)</th><th>ยอดสะสม (฿)</th></tr></thead><tbody>${tbodyHtml}</tbody></table></body></html>`;
            this._executePrint(html);
        });
    }

    printSummary() {
        const d = this.state._summaryData;
        if(d.totalIncome === 0 && d.totalExpense === 0) { Swal.fire('ข้อมูลว่างเปล่า', 'ไม่มีข้อมูลให้สรุปในช่วงเวลานี้', 'warning'); return; }

        db.ref('clinic_settings_v2').once('value').then(snap => {
            const settings = snap.val() || { clinic_name: "DIALYSIS PRO CLINIC" };
            let chartImgHtml = ''; const chartCanvas = document.getElementById('financeChart');
            if(chartCanvas && this.state.chartInstance) { try { chartImgHtml = `<img src="${chartCanvas.toDataURL('image/png')}" style="max-width:500px; height:auto; display:block; margin:0 auto; object-fit:contain;">`; } catch(e){} }
            
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
                    <h2>${this.escapeHTML(settings.clinic_name)}</h2>
                    <h3>รายงานสรุปดุลกระแสเงินสดและโครงสร้างรายได้-ต้นทุนแบบละเอียด (Financial Breakdown)</h3>
                    <div>รอบการสืบค้น: ${this.formatDateTh(this.state.startDate)} ถึง ${this.formatDateTh(this.state.endDate)}</div>
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
    }

    manageModalities() {
        let html = '<div class="list-group mb-3 text-start shadow-sm" style="border-radius:12px; overflow:hidden;">';
        this.state.modalities.forEach((m) => {
            html += `
            <div class="list-group-item d-flex justify-content-between align-items-center p-3 bg-white">
                <div>
                    <div class="fw-bold text-dark" style="font-size:15px;">${this.escapeHTML(m.name)}</div>
                    <div class="text-info fw-bold small"><i class="fa-solid fa-tag me-1"></i> ค่าบริการ: ฿${Number(m.price || 0).toLocaleString()} / รอบ</div>
                </div>
                <div>
                    <button class="btn btn-sm btn-light border border-warning-subtle text-warning-dark shadow-sm me-1" style="border-radius:8px;" onclick="Swal.close(); setTimeout(()=>window.FinancePage.editModality('${m.id}'), 300)"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-light border border-danger-subtle text-danger shadow-sm" style="border-radius:8px;" onclick="Swal.close(); setTimeout(()=>window.FinancePage.deleteModality('${m.id}'), 300)"><i class="fa-solid fa-trash"></i></button>
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
    }

    editModality(id) {
        let m = id ? this.state.modalities.find(x => x.id === id) : { name: '', price: 1500 };
        Swal.fire({
            title: `<h5 class="fw-bold text-info mb-0"><i class="fa-solid ${id?'fa-pen':'fa-plus'} me-2"></i>${id ? 'แก้ไขโหมด' : 'เพิ่มโหมดใหม่'}</h5>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Prompt';">
                    <label class="form-label fw-bold small text-secondary">ชื่อโหมด (Modality Name)</label>
                    <input type="text" id="swal-mod-name" class="form-control input-modern mb-3 fw-bold text-dark" value="${this.escapeHTML(m.name)}" placeholder="เช่น HD ปกติ, HDF">
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
                let updated = [...this.state.modalities];
                if(id) updated[updated.findIndex(x=>x.id===id)] = res.value; else updated.push(res.value);
                db.ref('clinic_modalities_v2').set(updated).then(() => {
                    Swal.fire({title:'บันทึกสำเร็จ', icon:'success', timer:1000, showConfirmButton:false}).then(()=> this.manageModalities());
                });
            } else if (res.isDismissed) { this.manageModalities(); }
        });
    }

    deleteModality(id) {
        Swal.fire({
            title: 'ยืนยันการลบ?', text: 'ต้องการลบโหมดการฟอกนี้ออกจากระบบใช่หรือไม่?', icon: 'warning', 
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-trash me-1"></i> ลบ', confirmButtonColor: '#ef4444', cancelButtonText: 'ยกเลิก'
        }).then(res => {
            if(res.isConfirmed) {
                let updated = this.state.modalities.filter(x=>x.id !== id);
                db.ref('clinic_modalities_v2').set(updated).then(() => {
                    Swal.fire({title:'ลบสำเร็จ', icon:'success', timer:1000, showConfirmButton:false}).then(()=> this.manageModalities());
                });
            } else { this.manageModalities(); }
        });
    }

    manageRights() {
        let html = '<div class="list-group mb-3 text-start shadow-sm" style="border-radius:12px; overflow:hidden;">';
        this.state.clinicRights.forEach((r) => {
            html += `
            <div class="list-group-item d-flex justify-content-between align-items-center p-3 bg-white">
                <div>
                    <div class="fw-bold text-dark" style="font-size:15px;">${this.escapeHTML(r.name)}</div>
                    <div class="text-success fw-bold small"><i class="fa-solid fa-hand-holding-dollar me-1"></i> เบิกจ่าย: ฿${Number(r.price).toLocaleString()} / รอบ</div>
                </div>
                <div>
                    <button class="btn btn-sm btn-light border border-warning-subtle text-warning-dark shadow-sm me-1" style="border-radius:8px;" onclick="Swal.close(); setTimeout(()=>window.FinancePage.editRight('${r.id}'), 300)"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-light border border-danger-subtle text-danger shadow-sm" style="border-radius:8px;" onclick="Swal.close(); setTimeout(()=>window.FinancePage.deleteRight('${r.id}'), 300)"><i class="fa-solid fa-trash"></i></button>
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
    }

    editRight(id) {
        let r = id ? this.state.clinicRights.find(x => x.id === id) : { name: '', price: 1500 };
        Swal.fire({
            title: `<h5 class="fw-bold text-success mb-0"><i class="fa-solid ${id?'fa-pen':'fa-plus'} me-2"></i>${id ? 'แก้ไขสิทธิการรักษา' : 'เพิ่มสิทธิใหม่'}</h5>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Prompt';">
                    <label class="form-label fw-bold small text-secondary">ชื่อสิทธิ (เช่น บัตรทอง, ชำระเงินเอง)</label>
                    <input type="text" id="swal-right-name" class="form-control input-modern mb-3 fw-bold text-dark" value="${this.escapeHTML(r.name)}">
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
                let updated = [...this.state.clinicRights];
                if(id) updated[updated.findIndex(x=>x.id===id)] = res.value; else updated.push(res.value);
                db.ref('clinic_rights_v2').set(updated).then(() => {
                    Swal.fire({title:'บันทึกสำเร็จ', icon:'success', timer:1000, showConfirmButton:false}).then(()=> this.manageRights());
                });
            } else if (res.isDismissed) { this.manageRights(); }
        });
    }

    deleteRight(id) {
        Swal.fire({
            title: 'ยืนยันการลบ?', text: 'ต้องการลบสิทธิการรักษานี้ใช่หรือไม่?', icon: 'warning', 
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-trash me-1"></i> ลบ', confirmButtonColor: '#ef4444', cancelButtonText: 'ยกเลิก'
        }).then(res => {
            if(res.isConfirmed) {
                let updated = this.state.clinicRights.filter(x=>x.id !== id);
                db.ref('clinic_rights_v2').set(updated).then(() => {
                    Swal.fire({title:'ลบสำเร็จ', icon:'success', timer:1000, showConfirmButton:false}).then(()=> this.manageRights());
                });
            } else { this.manageRights(); }
        });
    }
}

const FinancePage = new FinancePageComponent();
window.FinancePage = FinancePage;