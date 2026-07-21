// js/pages/department_ledger.js
// 🚀 Enterprise Department Ledger Module: Zero-CLS Tab Stacking & PC-Optimized Print/Export Engine

class DepartmentLedgerPageComponent {
    constructor() {
        this.state = {
            startDate: '',
            endDate: '',
            allTransactions: [], 
            initialBalance: 0,
            categoriesIn: [],
            categoriesOut: [],
            summaryChartInstance: null,
            _pendingChartData: null,
            hasCleanedUp: false,
            clinicName: 'DIALYSIS PRO CLINIC'
        };
        this.firebaseListeners = [];
    }

    switchTab(tabId) {
        document.querySelectorAll('.fin-nav-tabs .fin-nav-link').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('#ledgerTabContent .custom-tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        const targetBtn = document.getElementById(`btn-${tabId}`);
        if (targetBtn) targetBtn.classList.add('active');
        
        const targetPane = document.getElementById(tabId);
        if (targetPane) targetPane.classList.add('active');

        if(tabId === 'summary-panel') {
            setTimeout(() => this.renderSummaryChart(), 50);
        }
    }

    get html() {
        return `
            <style>
                .stat-card-ledger { border-radius: 20px; padding: 20px; position: relative; overflow: hidden; background: var(--bg-surface); border: 1px solid var(--border-color); transition: all 0.3s ease; height: 100%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .stat-card-ledger:hover { transform: translateY(-4px); box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.1); border-color: var(--primary); }
                .stat-icon-bg { position: absolute; top: -20px; right: -20px; opacity: 0.04; font-size: 120px; pointer-events: none; z-index: 0; }
                .table-ledger th { background: var(--bg-body); color: var(--text-dark); font-weight: 700; text-transform: uppercase; font-size: 13px; padding: 16px; border-bottom: 2px solid var(--border-color); border-top: none; white-space: nowrap; }
                .table-ledger td { padding: 14px 16px; vertical-align: middle; border-bottom: 1px solid var(--border-color); font-size: 14.5px; color: var(--text-dark); background: transparent; }
                
                .native-date-wrapper {
                    position: relative; display: inline-flex; align-items: center; background: var(--bg-surface);
                    border: 2px solid var(--border-color); border-radius: 50px; padding: 6px 18px; cursor: pointer; overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.3s;
                }
                .native-date-wrapper:hover { border-color: var(--primary); background: var(--bg-body); }
                .native-date-wrapper .thai-text { font-family: 'Prompt', sans-serif; font-weight: 700; color: var(--primary); font-size: 15px; pointer-events: none; }
                .native-date-wrapper i { font-size: 16px; color: var(--primary); pointer-events: none; }
                .native-date-wrapper input[type="date"] { position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 10; border: none; background: transparent; color: transparent; }
                .native-date-wrapper input[type="date"]::-webkit-datetime-edit, .native-date-wrapper input[type="date"]::-webkit-datetime-edit-text, .native-date-wrapper input[type="date"]::-webkit-datetime-edit-month-field, .native-date-wrapper input[type="date"]::-webkit-datetime-edit-day-field, .native-date-wrapper input[type="date"]::-webkit-datetime-edit-year-field { color: transparent !important; background: transparent !important; }
                .native-date-wrapper input[type="date"]::-webkit-calendar-picker-indicator { position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; margin: 0; padding: 0; cursor: pointer; opacity: 0; }

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
                ul.fin-nav-tabs li { list-style: none !important; margin: 0 !important; padding: 0 !important; }

                .fin-nav-link { 
                    display: inline-flex; align-items: center; background: transparent; border: none !important; 
                    padding: 14px 24px; font-family: 'Prompt', sans-serif; font-weight: 600; font-size: 15px; 
                    color: var(--text-muted); cursor: pointer; border-radius: 12px 12px 0 0; position: relative; 
                    transition: all 0.2s; outline: none !important; 
                }
                .fin-nav-link:hover { color: var(--primary); background: var(--bg-surface); filter: brightness(0.95); }
                .fin-nav-link.active { background: var(--bg-surface); box-shadow: 0 -4px 10px rgba(0,0,0,0.02); color: var(--primary); font-weight: 700;}
                .fin-nav-link.active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 3px; background: var(--primary); border-radius: 3px 3px 0 0; }

                #ledgerTabContent {
                    display: grid;
                    grid-template-columns: 1fr;
                    grid-template-rows: 1fr;
                    height: 650px !important;       
                    min-height: 650px !important;
                    max-height: 650px !important;
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

                .safe-icon { font-family: 'Font Awesome 6 Free', 'FontAwesome', sans-serif !important; font-weight: 900 !important; font-style: normal !important; }

                .btn-custom-secondary { background-color: var(--bg-surface) !important; color: #64748b !important; border: 1px solid #cbd5e1 !important; transition: all 0.3s ease; }
                .btn-custom-secondary i { color: #64748b !important; transition: all 0.3s ease; }
                .btn-custom-secondary:hover { background-color: #64748b !important; color: #ffffff !important; border-color: #64748b !important; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                .btn-custom-secondary:hover i { color: #ffffff !important; }

                .btn-custom-info { background-color: var(--bg-surface) !important; color: #0ea5e9 !important; border: 1px solid #7dd3fc !important; transition: all 0.3s ease; }
                .btn-custom-info i { color: #0ea5e9 !important; transition: all 0.3s ease; }
                .btn-custom-info:hover { background-color: #0ea5e9 !important; color: #ffffff !important; border-color: #0ea5e9 !important; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                .btn-custom-info:hover i { color: #ffffff !important; }

                .btn-export-main { background-color: #1e293b !important; color: #ffffff !important; border: none !important; transition: all 0.3s ease; }
                .btn-export-main:hover { background-color: #0f172a !important; color: #ffffff !important; box-shadow: 0 4px 8px rgba(0,0,0,0.15); transform: translateY(-1px); }
                .btn-export-main i { color: #f59e0b !important; } 

                .btn-export-summary { background-color: #2563eb !important; color: #ffffff !important; border: none !important; transition: all 0.3s ease; }
                .btn-export-summary:hover { background-color: #1e3a8a !important; color: #ffffff !important; box-shadow: 0 4px 8px rgba(0,0,0,0.15); transform: translateY(-1px); }
                .btn-export-summary i { color: #ffffff !important; }
            </style>

            <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 class="page-title text-primary" style="font-size: 28px;"><i class="fa-solid fa-wallet me-2 safe-icon"></i> บัญชีภายในหน่วยงาน</h2>
                    <p class="text-muted mt-1 mb-0" id="dl-date-text" style="color: var(--text-muted) !important;">จัดการงบประมาณ เงินสวัสดิการ และค่าใช้จ่ายแผนก</p>
                </div>
                <div class="d-flex gap-2 align-items-center flex-wrap">
                    <button class="btn btn-custom-secondary fw-bold shadow-sm rounded-pill px-3 card-hover-float" onclick="window.DepartmentLedgerPage.manageCategories()">
                        <i class="fas fa-tags me-1 safe-icon"></i> จัดการหมวดหมู่
                    </button>
                    <button class="btn btn-custom-info fw-bold shadow-sm rounded-pill px-3 card-hover-float" onclick="window.DepartmentLedgerPage.setInitialBalance()">
                        <i class="fas fa-piggy-bank me-1 safe-icon"></i> ตั้งยอดยกมาเริ่มต้น
                    </button>
                    
                    <div class="d-flex align-items-center p-1 rounded-pill shadow-sm ms-2" style="background-color: var(--bg-body); border: 1px solid var(--border-color);">
                        <div class="native-date-wrapper">
                            <i class="fas fa-calendar-days text-primary me-2 safe-icon"></i>
                            <span class="thai-text" id="dl-start-display">กำลังโหลด...</span>
                            <input type="date" id="dl-start-date" onchange="window.DepartmentLedgerPage.onDateChange()">
                        </div>
                        <span class="mx-2 fw-bold small" style="color: var(--text-muted);">ถึง</span>
                        <div class="native-date-wrapper">
                            <i class="fas fa-calendar-days text-primary me-2 safe-icon"></i>
                            <span class="thai-text" id="dl-end-display">กำลังโหลด...</span>
                            <input type="date" id="dl-end-date" onchange="window.DepartmentLedgerPage.onDateChange()">
                        </div>
                        <button class="btn btn-primary rounded-pill px-3 ms-2 fw-bold shadow-sm" style="position: relative; z-index: 15;" onclick="window.DepartmentLedgerPage.setThisMonth()">เดือนนี้</button>
                    </div>
                </div>
            </div>

            <div class="row g-3 mb-4">
                <div class="col-md-6 col-xl-3">
                    <div class="stat-card-ledger" style="border-top: 4px solid #64748b;">
                        <i class="fa-solid fa-clock-rotate-left stat-icon-bg safe-icon" style="color: var(--text-muted);"></i>
                        <div class="d-flex justify-content-between mb-2 position-relative z-1">
                            <div class="text-uppercase fw-bold small" style="color: var(--text-muted);">1. ยอดยกมา (Brought Fwd)</div>
                        </div>
                        <div class="fs-3 fw-bold position-relative z-1" style="color: var(--text-dark);">฿<span id="dl-bf-balance"><i class="fas fa-spinner fa-spin fs-5 safe-icon"></i></span></div>
                    </div>
                </div>
                <div class="col-md-6 col-xl-3">
                    <div class="stat-card-ledger" style="border-top: 4px solid var(--success);">
                        <i class="fa-solid fa-arrow-turn-down stat-icon-bg safe-icon" style="transform: rotate(90deg); color: var(--success);"></i>
                        <div class="d-flex justify-content-between mb-2 position-relative z-1">
                            <div class="fw-bold small text-uppercase" style="color: var(--success);">2. รับเข้า (Income)</div>
                            <div class="badge-soft-success rounded px-2 py-1"><i class="fa-solid fa-plus safe-icon"></i></div>
                        </div>
                        <div class="fs-3 fw-bold position-relative z-1" style="color: var(--success);">+ ฿<span id="dl-total-in"><i class="fas fa-spinner fa-spin fs-5 safe-icon"></i></span></div>
                    </div>
                </div>
                <div class="col-md-6 col-xl-3">
                    <div class="stat-card-ledger" style="border-top: 4px solid var(--danger);">
                        <i class="fa-solid fa-arrow-turn-up stat-icon-bg safe-icon" style="transform: rotate(90deg); color: var(--danger);"></i>
                        <div class="d-flex justify-content-between mb-2 position-relative z-1">
                            <div class="fw-bold small text-uppercase" style="color: var(--danger);">3. จ่ายออก (Expense)</div>
                            <div class="badge-soft-danger rounded px-2 py-1"><i class="fa-solid fa-minus safe-icon"></i></div>
                        </div>
                        <div class="fs-3 fw-bold position-relative z-1" style="color: var(--danger);">- ฿<span id="dl-total-out"><i class="fas fa-spinner fa-spin fs-5 safe-icon"></i></span></div>
                    </div>
                </div>
                <div class="col-md-6 col-xl-3">
                    <div class="stat-card-ledger" style="border-top: 4px solid var(--primary); background: var(--primary-light);">
                        <i class="fa-solid fa-vault stat-icon-bg safe-icon" style="color: var(--primary);"></i>
                        <div class="d-flex justify-content-between mb-2 position-relative z-1">
                            <div class="text-primary fw-bold small text-uppercase">4. คงเหลือ (Carried Fwd)</div>
                            <div class="badge-soft-primary rounded px-2 py-1"><i class="fa-solid fa-equals safe-icon"></i></div>
                        </div>
                        <div class="fs-3 fw-bold position-relative z-1" id="dl-net-balance"><i class="fas fa-spinner fa-spin fs-5 safe-icon"></i></div>
                    </div>
                </div>
            </div>

            <ul class="fin-nav-tabs mb-4">
                <li>
                    <button class="fin-nav-link active" id="btn-ledger-panel" onclick="window.DepartmentLedgerPage.switchTab('ledger-panel')">
                        <i class="fa-solid fa-book-open me-2 safe-icon"></i> สมุดบัญชีรวม (Statement)
                    </button>
                </li>
                <li>
                    <button class="fin-nav-link text-info" id="btn-summary-panel" onclick="window.DepartmentLedgerPage.switchTab('summary-panel')">
                        <i class="fa-solid fa-chart-pie me-2 safe-icon"></i> สรุปรายงานการใช้จ่าย (Summary)
                    </button>
                </li>
            </ul>

            <div id="ledgerTabContent">
                
                <div class="custom-tab-pane active" id="ledger-panel">
                    <div class="modern-panel panel-locked shadow-sm p-4 position-relative" style="border-top: 5px solid var(--primary); border-radius: 0 20px 20px 20px; background-color: var(--bg-surface); border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                        <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 200px; pointer-events: none; color: var(--text-dark);"><i class="fa-solid fa-file-lines safe-icon"></i></div>
                        
                        <div class="d-flex justify-content-between align-items-center mb-4 position-relative flex-wrap gap-3" style="z-index: 1050;">
                            <h5 class="fw-bold mb-0" style="color: var(--text-dark);"><i class="fa-solid fa-clock-rotate-left text-primary me-2 safe-icon"></i> ความเคลื่อนไหวทางบัญชี (Running Ledger)</h5>
                            <div class="d-flex gap-2">
                                <button class="btn btn-premium-danger px-3 shadow-sm" onclick="window.DepartmentLedgerPage.openAddModal('OUT')">
                                    <i class="fas fa-minus-circle me-1 safe-icon"></i> จ่ายออก
                                </button>
                                <button class="btn btn-premium-success px-3 shadow-sm" onclick="window.DepartmentLedgerPage.openAddModal('IN')">
                                    <i class="fas fa-plus-circle me-1 safe-icon"></i> รับเข้า
                                </button>
                                
                                <div class="dropdown">
                                    <button class="btn btn-export-main fw-bold shadow-sm rounded-pill px-4 ms-2 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="fas fa-file-export me-1 safe-icon"></i> ส่งออก (Export)
                                    </button>
                                    <ul class="dropdown-menu shadow-lg border-0" style="border-radius: 12px; margin-top: 8px; z-index: 9999;">
                                        <li><a class="dropdown-item fw-bold text-success py-2" href="javascript:void(0)" onclick="window.DepartmentLedgerPage.exportExcel()"><i class="fa-solid fa-file-excel me-2 safe-icon"></i> ดาวน์โหลดเป็น Excel (.xlsx)</a></li>
                                        <li><a class="dropdown-item fw-bold text-danger py-2" href="javascript:void(0)" onclick="window.DepartmentLedgerPage.exportPDF()"><i class="fa-solid fa-file-pdf me-2 safe-icon"></i> ดาวน์โหลดเป็น PDF (.pdf)</a></li>
                                        <li><hr class="dropdown-divider"></li>
                                        <li><a class="dropdown-item fw-bold text-dark py-2" href="javascript:void(0)" onclick="window.DepartmentLedgerPage.printLedger()"><i class="fa-solid fa-print me-2 safe-icon"></i> พิมพ์ลงกระดาษ (Print)</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="locked-table-wrapper">
                            <table class="table table-ledger w-100 mb-0">
                                <thead style="position: sticky; top: 0; z-index: 10;">
                                    <tr>
                                        <th style="width: 14%;"><i class="fa-regular fa-calendar me-1 safe-icon"></i> วัน/เวลาที่ทำรายการ</th>
                                        <th style="width: 10%;">ประเภท</th>
                                        <th style="width: 20%;">รายละเอียดรายการ</th>
                                        <th style="width: 18%;"><i class="fa-regular fa-comment-dots me-1 safe-icon"></i> หมายเหตุ</th>
                                        <th class="text-end" style="width: 10%; color: var(--success) !important;">เงินเข้า (IN)</th>
                                        <th class="text-end" style="width: 10%; color: var(--danger) !important;">เงินออก (OUT)</th>
                                        <th class="text-end" style="width: 13%; color: var(--primary) !important;">คงเหลือ (BAL)</th>
                                        <th class="text-center no-print" style="width: 10%;"><i class="fa-solid fa-gears safe-icon"></i></th>
                                    </tr>
                                </thead>
                                <tbody id="dl-table-body">
                                    <tr><td colspan="8" class="text-center py-5" style="color: var(--text-muted);">...กำลังโหลดข้อมูล...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="custom-tab-pane" id="summary-panel">
                    <div class="modern-panel panel-locked shadow-sm p-4 position-relative overflow-hidden" style="border-top: 5px solid var(--info); border-radius: 0 20px 20px 20px; background-color: var(--bg-surface); border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                        
                        <div class="d-flex justify-content-between align-items-center mb-4 position-relative" style="z-index: 1050;">
                            <h5 class="fw-bold mb-0" style="color: var(--text-dark);"><i class="fa-solid fa-chart-pie text-info me-2 safe-icon"></i> สรุปรายงานการใช้จ่ายประจำรอบ</h5>
                            <div class="dropdown">
                                <button class="btn btn-export-summary fw-bold shadow-sm rounded-pill px-4 dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="fas fa-file-export me-2 safe-icon"></i> ส่งออกสรุปยอด (Export)
                                </button>
                                <ul class="dropdown-menu shadow-lg border-0" style="border-radius: 12px; margin-top: 8px; z-index: 9999;">
                                    <li><a class="dropdown-item fw-bold text-success py-2" href="javascript:void(0)" onclick="window.DepartmentLedgerPage.exportSummaryExcel()"><i class="fa-solid fa-file-excel me-2 safe-icon"></i> ดาวน์โหลดเป็น Excel (.xlsx)</a></li>
                                    <li><a class="dropdown-item fw-bold text-danger py-2" href="javascript:void(0)" onclick="window.DepartmentLedgerPage.exportSummaryPDF()"><i class="fa-solid fa-file-pdf me-2 safe-icon"></i> ดาวน์โหลดเป็น PDF (.pdf)</a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item fw-bold text-dark py-2" href="javascript:void(0)" onclick="window.DepartmentLedgerPage.printSummary()"><i class="fa-solid fa-print me-2 safe-icon"></i> พิมพ์ลงกระดาษ (Print)</a></li>
                                </ul>
                            </div>
                        </div>

                        <div class="row g-4 position-relative z-1 flex-grow-1" style="min-height: 0;">
                            <div class="col-lg-5 h-100">
                                <div class="modern-panel shadow-sm p-4 h-100 d-flex flex-column" style="border-radius: 16px; background-color: var(--bg-body); border: 1px solid var(--border-color);">
                                    <h6 class="fw-bold mb-3" style="color: var(--text-dark);"><i class="fa-solid fa-chart-donut text-info me-2 safe-icon"></i> สัดส่วนการใช้จ่าย (Expense Breakdown)</h6>
                                    <div class="flex-grow-1" style="position: relative; width: 100%;" id="dl-chart-container">
                                        <canvas id="dlSummaryChart"></canvas>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-7 h-100">
                                <div class="modern-panel shadow-sm p-4 h-100 d-flex flex-column" style="border-radius: 16px; background-color: var(--bg-body); border: 1px solid var(--border-color);">
                                    <h6 class="fw-bold mb-3" style="color: var(--text-dark);"><i class="fa-solid fa-list-ul text-secondary me-2 safe-icon"></i> สรุปยอดแยกตามหมวดหมู่</h6>
                                    <div class="locked-table-wrapper" style="box-shadow: none; border-radius: 12px;">
                                        <table class="table table-ledger w-100 mb-0">
                                            <thead>
                                                <tr>
                                                    <th>หมวดหมู่</th>
                                                    <th class="text-center">ประเภท</th>
                                                    <th class="text-end">ยอดรวม (฿)</th>
                                                </tr>
                                            </thead>
                                            <tbody id="dl-summary-body">
                                                <tr><td colspan="3" class="text-center py-4" style="color: var(--text-muted);">...กำลังโหลดข้อมูล...</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `;
    }

    init() {
        if (typeof db === 'undefined') return;

        if (!this.state.hasCleanedUp) this._autoPurgeOldRecords();

        if(!this.state.startDate || !this.state.endDate) {
            this.setThisMonth();
        } else {
            this.updateDateDisplays();
        }

        this._setupListeners();
    }

    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        if(this.state.summaryChartInstance) {
            this.state.summaryChartInstance.destroy();
            this.state.summaryChartInstance = null;
        }
    }

    _setupListeners() {
        db.ref('clinic_settings_v2/clinic_name').once('value').then(snap => {
            if(snap.exists()) { this.state.clinicName = snap.val(); }
        });

        const cbSettings = db.ref('department_ledger_settings_v2').on('value', snap => {
            if (!document.getElementById('dl-bf-balance')) return;
            const settings = snap.val() || {};
            this.state.initialBalance = Number(settings.initial_balance) || 0;
            this.state.categoriesIn = settings.categories_in || ['งบประมาณจัดสรร', 'เงินบริจาค', 'รายได้อื่นๆ'];
            this.state.categoriesOut = settings.categories_out || ['วัสดุสำนักงาน', 'สวัสดิการพนักงาน', 'ซ่อมบำรุง/ไอที', 'ประชุม/รับรอง', 'ค่าใช้จ่ายเบ็ดเตล็ด'];
            this.processData();
        });
        this.firebaseListeners.push({ path: 'department_ledger_settings_v2', callback: cbSettings });

        const cbLedger = db.ref('department_ledger_v2').on('value', snap => {
            if (!document.getElementById('dl-table-body')) return;
            const data = snap.val();
            this.state.allTransactions = data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : [];
            this.processData();
        });
        this.firebaseListeners.push({ path: 'department_ledger_v2', callback: cbLedger });
    }

    _autoPurgeOldRecords() {
        this.state.hasCleanedUp = true;
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 5);
        const cutoffStr = cutoffDate.toISOString().split('T')[0];

        db.ref('department_ledger_v2').orderByChild('date').endAt(cutoffStr).once('value').then(snap => {
            if (snap.exists()) {
                let updates = {};
                let deletedCount = 0;
                snap.forEach(child => {
                    updates[child.key] = null;
                    deletedCount++;
                });
                db.ref('department_ledger_v2').update(updates).then(() => {
                    console.log(`[Auto-Purge] ลบประวัติบัญชีหน่วยงานที่เก่าเกิน 5 ปี สำเร็จ จำนวน ${deletedCount} รายการ`);
                });
            }
        });
    }

    formatDateLocal(d) {
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        let year = d.getFullYear();
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
        return [year, month, day].join('-');
    }

    formatDateTh(isoStr) {
        if(!isoStr) return '-'; 
        const d = new Date(isoStr);
        return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth() + 1).padStart(2,'0')}/${d.getFullYear() + 543}`;
    }

    updateDateDisplays() {
        const sInput = document.getElementById('dl-start-date');
        const eInput = document.getElementById('dl-end-date');
        const sDisplay = document.getElementById('dl-start-display');
        const eDisplay = document.getElementById('dl-end-display');
        
        if (sInput) sInput.value = this.state.startDate;
        if (eInput) eInput.value = this.state.endDate;
        if (sDisplay) sDisplay.innerText = this.formatDateTh(this.state.startDate);
        if (eDisplay) eDisplay.innerText = this.formatDateTh(this.state.endDate);
    }

    onDateChange() {
        const sInput = document.getElementById('dl-start-date').value;
        const eInput = document.getElementById('dl-end-date').value;
        if(sInput && eInput) {
            if(new Date(sInput) > new Date(eInput)) { 
                Swal.fire('ข้อผิดพลาด', 'วันเริ่มต้นต้องไม่มากกว่าวันสิ้นสุด', 'warning'); 
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
        if (!document.getElementById('dl-table-body')) return;
        if (!this.state.startDate || !this.state.endDate) return;

        document.getElementById('dl-date-text').innerHTML = `ความเคลื่อนไหวตั้งแต่ <b class="text-primary">${this.formatDateTh(this.state.startDate)}</b> ถึง <b class="text-primary">${this.formatDateTh(this.state.endDate)}</b>`;

        let broughtForward = this.state.initialBalance; 
        this.state.allTransactions.filter(t => t.date < this.state.startDate).forEach(t => {
            if(t.type === 'IN') broughtForward += Number(t.amount);
            else broughtForward -= Number(t.amount);
        });

        let filtered = this.state.allTransactions.filter(t => t.date >= this.state.startDate && t.date <= this.state.endDate);
        filtered.sort((a, b) => new Date(a.date + 'T' + (a.time||'00:00:00')) - new Date(b.date + 'T' + (b.time||'00:00:00')));

        let currentBalance = broughtForward;
        let totalIn = 0; 
        let totalOut = 0;
        let summaryIn = {}; 
        let summaryOut = {}; 

        filtered.forEach(t => {
            let amt = Number(t.amount);
            if(t.type === 'IN') { 
                currentBalance += amt; 
                totalIn += amt; 
                summaryIn[t.category] = (summaryIn[t.category] || 0) + amt;
            } else { 
                currentBalance -= amt; 
                totalOut += amt; 
                summaryOut[t.category] = (summaryOut[t.category] || 0) + amt;
            }
            t.runningBalance = currentBalance; 
        });

        document.getElementById('dl-bf-balance').innerText = broughtForward.toLocaleString(undefined, {minimumFractionDigits: 2});
        document.getElementById('dl-total-in').innerText = totalIn.toLocaleString(undefined, {minimumFractionDigits: 2});
        document.getElementById('dl-total-out').innerText = totalOut.toLocaleString(undefined, {minimumFractionDigits: 2});
        
        let netEl = document.getElementById('dl-net-balance');
        if (currentBalance >= 0) { 
            netEl.innerHTML = `<span class="text-primary">฿${currentBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>`; 
        } else { 
            netEl.innerHTML = `<span class="text-danger">฿${currentBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>`; 
        }

        let html = `
            <tr style="background-color: var(--bg-body);">
                <td colspan="4" class="text-end fw-bold text-primary fs-6 py-3">ยอดยกมา (Brought Forward):</td>
                <td colspan="2"></td>
                <td class="text-end fw-bold text-primary fs-5 py-3 border-start" style="border-color: var(--border-color) !important;">฿${broughtForward.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td></td>
            </tr>
        `;

        if (filtered.length === 0) {
            html += `<tr><td colspan="8" class="text-center py-5" style="color: var(--text-muted);"><i class="fa-solid fa-file-invoice fa-3x mb-3 safe-icon" style="opacity:0.2;"></i><br>ไม่มีความเคลื่อนไหวในช่วงเวลานี้</td></tr>`;
        } else {
            [...filtered].reverse().forEach(t => {
                let isIncome = t.type === 'IN';
                let badge = isIncome 
                    ? `<span class="badge badge-soft-success px-3 py-1 rounded-pill w-100"><i class="fa-solid fa-arrow-turn-down me-1 safe-icon" style="transform:rotate(90deg);"></i> รับเข้า</span>` 
                    : `<span class="badge badge-soft-danger px-3 py-1 rounded-pill w-100"><i class="fa-solid fa-arrow-turn-up me-1 safe-icon" style="transform:rotate(90deg);"></i> จ่ายออก</span>`;
                
                let inAmt = isIncome ? `+ ${Number(t.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}` : '-';
                let outAmt = !isIncome ? `- ${Number(t.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}` : '-';
                let timeStr = t.time ? t.time.substring(0,5) : '00:00';
                
                html += `
                <tr class="card-hover-float" style="cursor:default;">
                    <td>
                        <span class="badge shadow-sm px-2 py-1" style="background-color: var(--bg-body); border: 1px solid var(--border-color); color: var(--text-dark) !important;"><i class="fa-regular fa-calendar text-primary me-1 safe-icon"></i> ${this.formatDateTh(t.date)}</span>
                        <div class="small fw-bold mt-1 ms-1" style="color: var(--text-muted);"><i class="fa-regular fa-clock me-1 safe-icon"></i> ${timeStr} น.</div>
                    </td>
                    <td class="text-center">${badge}</td>
                    <td>
                        <div class="fw-bold" style="font-family:'Prompt'; font-size:14.5px; color: var(--text-dark);">${this._escapeHTML(t.description)}</div>
                        <div class="small mt-1" style="color: var(--text-muted);"><span class="badge bg-secondary me-1">${this._escapeHTML(t.category)}</span> ผู้บันทึก: ${this._escapeHTML(t.recorded_by || 'Admin')}</div>
                    </td>
                    <td>
                        <div class="small" style="white-space:pre-wrap; max-width:200px; font-size:13px; line-height:1.4; color: var(--text-muted);">${this._escapeHTML(t.remark || '-')}</div>
                    </td>
                    <td class="text-end fw-bold text-success" style="font-size:15px;">${inAmt}</td>
                    <td class="text-end fw-bold text-danger" style="font-size:15px;">${outAmt}</td>
                    <td class="text-end fw-bold border-start" style="font-size:15px; color: var(--text-dark); border-color: var(--border-color) !important;">฿${t.runningBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td class="text-center">
                        <div class="d-flex justify-content-center gap-2">
                            <button class="btn btn-sm btn-warning shadow-sm px-2" style="border-radius: 8px;" onclick="window.DepartmentLedgerPage.editTransaction('${t.id}')" title="แก้ไขรายการนี้"><i class="fa-solid fa-pen safe-icon"></i></button>
                            <button class="btn btn-sm btn-danger shadow-sm px-2 text-white" style="border-radius: 8px;" onclick="window.DepartmentLedgerPage.deleteTransaction('${t.id}')" title="ลบรายการนี้"><i class="fa-solid fa-trash safe-icon"></i></button>
                        </div>
                    </td>
                </tr>`;
            });
        }

        html += `
            <tr style="background-color: var(--bg-body);">
                <td colspan="4" class="text-end fw-bold py-3" style="color: var(--text-muted);">ยอดยกไป (Carried Forward):</td>
                <td colspan="2"></td>
                <td class="text-end fw-bold fs-6 py-3 border-start" style="color: var(--text-muted); border-color: var(--border-color) !important;">฿${currentBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td></td>
            </tr>
        `;

        document.getElementById('dl-table-body').innerHTML = html;
        this._renderSummaryData(summaryIn, summaryOut, totalOut);
    }

    _renderSummaryData(summaryIn, summaryOut, totalOut) {
        if (!document.getElementById('dl-summary-body')) return;
        
        let sumHtml = '';
        let chartLabels = []; 
        let chartData = []; 
        let chartColors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#eab308', '#ec4899', '#8b5cf6', '#6366f1'];

        Object.keys(summaryIn).sort((a,b) => summaryIn[b] - summaryIn[a]).forEach(cat => { 
            sumHtml += `
            <tr>
                <td><span class="fw-bold" style="color: var(--text-dark);">${this._escapeHTML(cat)}</span></td>
                <td class="text-center"><span class="badge badge-soft-success">รับเข้า</span></td>
                <td class="text-end fw-bold text-success">+ ${summaryIn[cat].toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            </tr>`; 
        });
        
        Object.keys(summaryOut).sort((a,b) => summaryOut[b] - summaryOut[a]).forEach(cat => { 
            sumHtml += `
            <tr>
                <td><span class="fw-bold" style="color: var(--text-dark);">${this._escapeHTML(cat)}</span></td>
                <td class="text-center"><span class="badge badge-soft-danger">จ่ายออก</span></td>
                <td class="text-end fw-bold text-danger">- ${summaryOut[cat].toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            </tr>`; 
            chartLabels.push(cat); 
            chartData.push(summaryOut[cat]); 
        });

        if(!sumHtml) {
            sumHtml = `<tr><td colspan="3" class="text-center py-4" style="color: var(--text-muted);">ไม่มีข้อมูลสรุปในช่วงเวลานี้</td></tr>`;
        }
        
        document.getElementById('dl-summary-body').innerHTML = sumHtml;
        this.state._pendingChartData = { labels: chartLabels, data: chartData, colors: chartColors, totalOut: totalOut };
    }

    renderSummaryChart() {
        if(!this.state._pendingChartData) return;
        const ctx = document.getElementById('dlSummaryChart');
        if(!ctx) return;

        try {
            if (this.state.summaryChartInstance) this.state.summaryChartInstance.destroy();
            const { labels, data, colors, totalOut } = this.state._pendingChartData;

            if (data.length === 0) { 
                document.getElementById('dl-chart-container').innerHTML = `<div class="text-center" style="color: var(--text-muted);"><i class="fa-solid fa-chart-pie fa-3x mb-3 safe-icon" style="opacity:0.2;"></i><br>ไม่มีรายจ่ายให้วิเคราะห์</div>`; 
                return; 
            } else { 
                document.getElementById('dl-chart-container').innerHTML = `<canvas id="dlSummaryChart"></canvas>`; 
            }

            const newCtx = document.getElementById('dlSummaryChart').getContext('2d');
            const ChartLib = window.Chart;
            if(!ChartLib) return;

            const themeTextColor = getComputedStyle(document.documentElement).getPropertyValue('--text-dark').trim() || '#334155';

            this.state.summaryChartInstance = new ChartLib(newCtx, {
                type: 'doughnut',
                data: { 
                    labels: labels, 
                    datasets: [{ data: data, backgroundColor: colors.slice(0, data.length), borderWidth: 2, borderColor: 'var(--bg-surface)' }] 
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false, 
                    cutout: '60%', 
                    plugins: { 
                        legend: { position: 'bottom', labels: { color: themeTextColor, font: { family: 'Prompt', size: 14 }, padding: 15 } } 
                    }, 
                    animation: { duration: 0 } 
                },
                plugins: [{ 
                    id: 'textCenter', 
                    beforeDraw: function(chart) { 
                        var width = chart.width, height = chart.height, ctx = chart.ctx; 
                        ctx.restore(); 
                        
                        var fontSize = (height / 200).toFixed(2); 
                        ctx.font = "bold " + fontSize + "em Prompt"; 
                        ctx.textBaseline = "middle"; 
                        ctx.fillStyle = themeTextColor; 
                        
                        var text = "฿" + totalOut.toLocaleString(undefined, {minimumFractionDigits: 2}); 
                        var textX = Math.round((width - ctx.measureText(text).width) / 2);
                        var textY = (height / 2) - (chart.legend.height / 2); 
                        
                        ctx.fillText(text, textX, textY); 
                        ctx.save(); 
                    } 
                }]
            });
        } catch(e) { 
            console.error("Chart rendering error:", e); 
        }
    }

    setInitialBalance() {
        Swal.fire({
            title: '<h5 class="fw-bold text-info mb-0"><i class="fa-solid fa-piggy-bank me-2 safe-icon"></i> ตั้งยอดยกมาเริ่มต้น</h5>',
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <label class="form-label fw-bold small text-secondary">กำหนดเงินตั้งต้นของแผนก (บาท)</label>
                    <input type="number" id="swal-init-bal" class="form-control text-info fw-bold text-center input-modern" style="border-radius:8px;" value="${this.state.initialBalance}">
                    <p class="small mt-2" style="color: var(--text-muted);">ยอดนี้จะถูกนำไปตั้งเป็น <b style="color: var(--text-dark);">ยอดยกมา (Brought Forward)</b> ก่อนรวมกับประวัติรับจ่ายทั้งหมด</p>
                </div>
            `,
            showCancelButton: true, confirmButtonText: 'บันทึกยอด', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#0ea5e9',
            preConfirm: () => { 
                let val = document.getElementById('swal-init-bal').value; 
                if(val === '') { Swal.showValidationMessage('กรุณาระบุตัวเลข'); return false; } 
                return Number(val); 
            }
        }).then(res => { 
            if(res.isConfirmed) { 
                db.ref('department_ledger_settings_v2/initial_balance').set(res.value).then(() => { 
                    Swal.fire({title:'บันทึกสำเร็จ', icon:'success', timer:1000, showConfirmButton:false}); 
                }); 
            } 
        });
    }

    manageCategories() {
        let inHtml = this.state.categoriesIn.map((c, i) => `<span class="badge bg-success-subtle text-success-emphasis m-1 fs-6 border border-success-subtle py-2 px-3 shadow-sm rounded-pill">${this._escapeHTML(c)} <i class="fa-solid fa-times ms-2 safe-icon" style="cursor:pointer;" onclick="Swal.close(); setTimeout(()=>window.DepartmentLedgerPage.removeCategory('IN', ${i}),300)"></i></span>`).join('');
        let outHtml = this.state.categoriesOut.map((c, i) => `<span class="badge bg-danger-subtle text-danger-emphasis m-1 fs-6 border border-danger-subtle py-2 px-3 shadow-sm rounded-pill">${this._escapeHTML(c)} <i class="fa-solid fa-times ms-2 safe-icon" style="cursor:pointer;" onclick="Swal.close(); setTimeout(()=>window.DepartmentLedgerPage.removeCategory('OUT', ${i}),300)"></i></span>`).join('');

        Swal.fire({
            title: '<h4 class="fw-bold mb-0" style="color: var(--text-dark);"><i class="fa-solid fa-tags text-secondary me-2 safe-icon"></i> จัดการหมวดหมู่รับ-จ่าย</h4>', 
            width: 700,
            html: `
                <div class="row text-start mt-3" style="font-family:'Sarabun';">
                    <div class="col-md-6 border-end" style="border-color: var(--border-color) !important;">
                        <h6 class="fw-bold text-success mb-3"><i class="fa-solid fa-arrow-turn-down me-1 safe-icon" style="transform:rotate(90deg);"></i> หมวดหมู่รายรับ</h6>
                        <div class="input-group mb-3 shadow-sm" style="border-radius:8px; overflow:hidden;">
                            <input type="text" id="new-cat-in" class="form-control input-modern" placeholder="พิมพ์หมวดหมู่ใหม่...">
                            <button class="btn btn-success fw-bold" onclick="Swal.close(); setTimeout(()=>window.DepartmentLedgerPage.addCategory('IN'),300)">เพิ่ม</button>
                        </div>
                        <div class="p-3" style="background-color: var(--bg-body); border: 1px solid var(--border-color); min-height: 150px; border-radius: 12px;">${inHtml || '<div class="small" style="color: var(--text-muted);">ไม่มีข้อมูล</div>'}</div>
                    </div>
                    <div class="col-md-6">
                        <h6 class="fw-bold text-danger mb-3"><i class="fa-solid fa-arrow-turn-up me-1 safe-icon" style="transform:rotate(90deg);"></i> หมวดหมู่รายจ่าย</h6>
                        <div class="input-group mb-3 shadow-sm" style="border-radius:8px; overflow:hidden;">
                            <input type="text" id="new-cat-out" class="form-control input-modern" placeholder="พิมพ์หมวดหมู่ใหม่...">
                            <button class="btn btn-danger fw-bold" onclick="Swal.close(); setTimeout(()=>window.DepartmentLedgerPage.addCategory('OUT'),300)">เพิ่ม</button>
                        </div>
                        <div class="p-3" style="background-color: var(--bg-body); border: 1px solid var(--border-color); min-height: 150px; border-radius: 12px;">${outHtml || '<div class="small" style="color: var(--text-muted);">ไม่มีข้อมูล</div>'}</div>
                    </div>
                </div>
            `,
            showConfirmButton: false, showCloseButton: true
        });
    }

    addCategory(type) {
        let inputId = type === 'IN' ? 'new-cat-in' : 'new-cat-out'; 
        let val = document.getElementById(inputId).value.trim();
        if(!val) { this.manageCategories(); return; }
        
        let targetArr = type === 'IN' ? this.state.categoriesIn : this.state.categoriesOut; 
        let dbKey = type === 'IN' ? 'categories_in' : 'categories_out';
        if(!targetArr.includes(val)) targetArr.push(val);
        
        db.ref('department_ledger_settings_v2/' + dbKey).set(targetArr).then(() => this.manageCategories());
    }

    removeCategory(type, index) {
        let targetArr = type === 'IN' ? this.state.categoriesIn : this.state.categoriesOut; 
        let dbKey = type === 'IN' ? 'categories_in' : 'categories_out';
        targetArr.splice(index, 1); 
        db.ref('department_ledger_settings_v2/' + dbKey).set(targetArr).then(() => this.manageCategories());
    }

    openAddModal(type) {
        const todayStr = new Date().toISOString().split('T')[0]; 
        const isIncome = type === 'IN';
        const title = isIncome ? 'บันทึกรับเงินเข้าหน่วยงาน' : 'บันทึกจ่ายเงินออกจากหน่วยงาน'; 
        const color = isIncome ? 'success' : 'danger'; 
        const icon = isIncome ? 'fa-plus-circle' : 'fa-minus-circle';
        
        let activeArr = isIncome ? this.state.categoriesIn : this.state.categoriesOut; 
        let catOptions = activeArr.map(c => `<option value="${this._escapeHTML(c)}">${this._escapeHTML(c)}</option>`).join('');

        Swal.fire({
            title: `<h4 class="fw-bold text-${color} mb-0" style="font-family:'Prompt';"><i class="fas ${icon} me-2 safe-icon"></i> ${title}</h4>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <div class="row g-3 mb-3">
                        <div class="col-6">
                            <label class="form-label fw-bold small" style="color: var(--text-muted);">วันที่ทำรายการ</label>
                            <input type="date" id="swal-lg-date" class="form-control input-modern" style="border-radius:8px;" value="${todayStr}">
                        </div>
                        <div class="col-6">
                            <label class="form-label fw-bold small" style="color: var(--text-muted);">หมวดหมู่</label>
                            <select id="swal-lg-category" class="form-select input-modern" style="border-radius:8px;">${catOptions}</select>
                        </div>
                    </div>
                    <label class="form-label fw-bold small" style="color: var(--text-muted);">รายละเอียดรายการ <span class="text-danger">*</span></label>
                    <input type="text" id="swal-lg-desc" class="form-control input-modern fw-bold mb-3" style="color: var(--text-dark); border-radius:8px;" placeholder="เช่น ค่าเครื่องเขียน">
                    
                    <label class="form-label fw-bold text-${color} small">จำนวนเงิน (บาท) <span class="text-danger">*</span></label>
                    <div class="input-group shadow-sm mb-3" style="border-radius:12px; overflow:hidden; border: 1px solid var(--border-color); background-color: var(--bg-body);">
                        <input type="number" id="swal-lg-amount" class="form-control input-modern form-control-lg fw-bold text-end border-0" placeholder="0.00" min="0" style="font-size:22px; border-radius:0 !important; box-shadow:none !important;">
                    </div>
                    
                    <label class="form-label fw-bold small" style="color: var(--text-muted);">หมายเหตุ (ข้อมูลเพิ่มเติม/เลขที่โอน)</label>
                    <textarea id="swal-lg-remark" class="form-control input-modern" rows="2" style="border-radius:8px;" placeholder="เช่น โอนเข้าบัญชีคลินิก..."></textarea>
                </div>
            `,
            showCancelButton: true, confirmButtonText: 'บันทึก', cancelButtonText: 'ยกเลิก', confirmButtonColor: isIncome ? '#10b981' : '#ef4444', width: 500,
            preConfirm: () => {
                const date = document.getElementById('swal-lg-date').value; 
                const category = document.getElementById('swal-lg-category').value; 
                const desc = document.getElementById('swal-lg-desc').value.trim(); 
                const amount = document.getElementById('swal-lg-amount').value;
                const remark = document.getElementById('swal-lg-remark').value.trim();
                
                if (!date || !desc || !amount || Number(amount) <= 0) { 
                    Swal.showValidationMessage('กรุณากรอกรายละเอียดและจำนวนเงินให้ครบถ้วน'); 
                    return false; 
                }
                
                return { 
                    id: 'LG-' + new Date().getTime(), 
                    type: type, 
                    date: date, 
                    time: new Date().toLocaleTimeString('th-TH', {hour12:false}), 
                    category: category, 
                    description: desc, 
                    remark: remark,
                    amount: Number(amount), 
                    recorded_by: App.currentUser ? App.currentUser.name : 'Admin', 
                    timestamp: new Date().toISOString() 
                };
            }
        }).then((result) => { 
            if (result.isConfirmed) {
                db.ref('department_ledger_v2/' + result.value.id).set(result.value); 
            }
        });
    }

    editTransaction(id) {
        const item = this.state.allTransactions.find(t => t.id === id);
        if (!item) {
            Swal.fire('ข้อผิดพลาด', 'ไม่พบรายการที่ต้องการแก้ไข', 'error');
            return;
        }

        const isIncome = item.type === 'IN';
        const title = 'แก้ไขรายการบัญชี'; 
        const color = 'warning'; 
        
        let activeArr = isIncome ? this.state.categoriesIn : this.state.categoriesOut; 
        let catOptions = activeArr.map(c => `<option value="${this._escapeHTML(c)}" ${item.category === c ? 'selected' : ''}>${this._escapeHTML(c)}</option>`).join('');
        if (!activeArr.includes(item.category)) {
            catOptions += `<option value="${this._escapeHTML(item.category)}" selected>${this._escapeHTML(item.category)}</option>`;
        }

        Swal.fire({
            title: `<h4 class="fw-bold text-${color} mb-0" style="font-family:'Prompt';"><i class="fas fa-pen me-2 safe-icon"></i> ${title}</h4>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <div class="row g-3 mb-3">
                        <div class="col-6">
                            <label class="form-label fw-bold small" style="color: var(--text-muted);">วันที่ทำรายการ</label>
                            <input type="date" id="swal-lg-date" class="form-control input-modern" style="border-radius:8px;" value="${item.date}">
                        </div>
                        <div class="col-6">
                            <label class="form-label fw-bold small" style="color: var(--text-muted);">หมวดหมู่</label>
                            <select id="swal-lg-category" class="form-select input-modern" style="border-radius:8px;">${catOptions}</select>
                        </div>
                    </div>
                    <label class="form-label fw-bold small" style="color: var(--text-muted);">รายละเอียดรายการ <span class="text-danger">*</span></label>
                    <input type="text" id="swal-lg-desc" class="form-control input-modern fw-bold mb-3" style="color: var(--text-dark); border-radius:8px;" placeholder="เช่น ค่าเครื่องเขียน" value="${this._escapeHTML(item.description)}">
                    
                    <label class="form-label fw-bold text-${isIncome ? 'success' : 'danger'} small">จำนวนเงิน (บาท) <span class="text-danger">*</span></label>
                    <div class="input-group shadow-sm mb-3" style="border-radius:12px; overflow:hidden; border: 1px solid var(--border-color); background-color: var(--bg-body);">
                        <input type="number" id="swal-lg-amount" class="form-control input-modern form-control-lg fw-bold text-end border-0" placeholder="0.00" min="0" value="${item.amount}" style="font-size:22px; border-radius:0 !important; box-shadow:none !important;">
                    </div>
                    
                    <label class="form-label fw-bold small" style="color: var(--text-muted);">หมายเหตุ (ข้อมูลเพิ่มเติม/เลขที่โอน)</label>
                    <textarea id="swal-lg-remark" class="form-control input-modern" rows="2" style="border-radius:8px;" placeholder="เช่น โอนเข้าบัญชีคลินิก...">${this._escapeHTML(item.remark || '')}</textarea>
                </div>
            `,
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-save me-1 safe-icon"></i> บันทึกการแก้ไข', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#f59e0b', width: 500,
            preConfirm: () => {
                const date = document.getElementById('swal-lg-date').value; 
                const category = document.getElementById('swal-lg-category').value; 
                const desc = document.getElementById('swal-lg-desc').value.trim(); 
                const amount = document.getElementById('swal-lg-amount').value;
                const remark = document.getElementById('swal-lg-remark').value.trim();
                
                if (!date || !desc || !amount || Number(amount) <= 0) { 
                    Swal.showValidationMessage('กรุณากรอกรายละเอียดและจำนวนเงินให้ครบถ้วน'); 
                    return false; 
                }
                
                return { 
                    ...item,
                    date: date, 
                    category: category, 
                    description: desc, 
                    remark: remark,
                    amount: Number(amount), 
                    last_edited_by: App.currentUser ? App.currentUser.name : 'Admin', 
                    last_edited_timestamp: new Date().toISOString() 
                };
            }
        }).then((result) => { 
            if (result.isConfirmed) {
                Swal.fire({ title: 'กำลังปรับปรุงบัญชี...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                db.ref('department_ledger_v2/' + item.id).update(result.value).then(() => {
                    Swal.fire({ title: 'สำเร็จ', text: 'แก้ไขรายการบัญชีและคำนวณยอดคงเหลือใหม่เรียบร้อยแล้ว', icon: 'success', timer: 1500, showConfirmButton: false });
                }).catch(err => {
                    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้: ' + err.message, 'error');
                });
            }
        });
    }

    deleteTransaction(id) { 
        Swal.fire({ 
            title: 'ยืนยันการลบรายการ?', 
            html: 'การลบรายการนี้ <b class="text-danger">จะทำให้ยอดคงเหลือถูกคำนวณใหม่ทั้งหมด</b><br>คุณแน่ใจหรือไม่?',
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonColor: '#ef4444', 
            confirmButtonText: '<i class="fa-solid fa-trash safe-icon"></i> ลบรายการ', 
            cancelButtonText: 'ยกเลิก' 
        }).then((result) => { 
            if (result.isConfirmed) {
                db.ref('department_ledger_v2/' + id).remove(); 
            }
        }); 
    }

    exportExcel() {
        if(typeof ExcelJS === 'undefined') {
            Swal.fire({ title: 'กำลังโหลด Excel Engine...', html: 'โปรดรอสักครู่...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js';
            script.onload = () => { Swal.close(); this._generateExcelJS(); };
            script.onerror = () => { Swal.fire('ระบบขัดข้อง', 'ไม่สามารถดาวน์โหลด Excel Engine ได้', 'error'); };
            document.head.appendChild(script);
            return;
        }
        this._generateExcelJS();
    }

    async _generateExcelJS() {
        Swal.fire({ title: 'กำลังประมวลผล Excel...', html: 'ระบบกำลังจัดทำตาราง .xlsx แท้ 100%', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        try {
            let filtered = this.state.allTransactions.filter(t => t.date >= this.state.startDate && t.date <= this.state.endDate); 
            filtered.sort((a, b) => new Date(a.date + 'T' + (a.time||'00:00:00')) - new Date(b.date + 'T' + (b.time||'00:00:00')));
            
            let broughtForward = this.state.initialBalance; 
            this.state.allTransactions.filter(t => t.date < this.state.startDate).forEach(t => { broughtForward += t.type === 'IN' ? Number(t.amount) : -Number(t.amount); });
            
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Statement', { views: [{ showGridLines: false }] });

            sheet.columns = [
                { width: 6 },  { width: 22 }, { width: 40 }, { width: 30 }, 
                { width: 20 }, { width: 16 }, { width: 16 }, { width: 18 }
            ];

            sheet.mergeCells('A1:H1');
            const titleCell = sheet.getCell('A1');
            titleCell.value = 'สมุดบัญชีรายรับ-รายจ่ายภายในหน่วยงาน (Department Ledger)';
            titleCell.font = { name: 'Tahoma', size: 16, bold: true, color: { argb: 'FF1E3A8A' } };
            titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

            sheet.mergeCells('A2:H2');
            const subTitleCell = sheet.getCell('A2');
            subTitleCell.value = `ความเคลื่อนไหวตั้งแต่: ${this.formatDateTh(this.state.startDate)} ถึง ${this.formatDateTh(this.state.endDate)}`;
            subTitleCell.font = { name: 'Tahoma', size: 11, color: { argb: 'FF475569' } };
            subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };

            sheet.addRow([]);

            const headers = ["#", "วันที่", "รายการ", "หมายเหตุ", "ผู้บันทึก", "รับเข้า (฿)", "จ่ายออก (฿)", "คงเหลือ (฿)"];
            const headerRow = sheet.addRow(headers);
            headerRow.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
                cell.font = { name: 'Tahoma', bold: true, color: { argb: 'FF0F172A' } };
                cell.border = { top:{style:'thin'}, bottom:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'} };
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            });

            let currentBalance = broughtForward;
            const bfRow = sheet.addRow(["", "", "", "ยอดยกมา (Brought Forward):", "", "", "", broughtForward]);
            sheet.mergeCells('A5:D5');
            sheet.getCell('A5').alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
            bfRow.eachCell((cell, colNum) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
                cell.font = { name: 'Tahoma', bold: true, color: { argb: 'FF0F172A' } };
                cell.border = { top:{style:'thin'}, bottom:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'} };
                let align = { vertical: 'middle', wrapText: true };
                if (colNum === 8) align.horizontal = 'right';
                cell.alignment = align;
                if(colNum === 8) cell.numFmt = '#,##0.00';
            });

            filtered.forEach((t, idx) => { 
                let amt = Number(t.amount); 
                let inAmt = t.type === 'IN' ? amt : null;
                let outAmt = t.type === 'OUT' ? amt : null;
                if(t.type === 'IN') currentBalance += amt; else currentBalance -= amt; 

                const row = sheet.addRow([
                    idx + 1,
                    `${this.formatDateTh(t.date)} ${t.time ? t.time.substring(0,5)+' น.' : ''}`,
                    `${t.description} [${t.category}]`,
                    t.remark || "-",
                    t.recorded_by || "Admin",
                    inAmt,
                    outAmt,
                    currentBalance
                ]);

                row.eachCell((cell, colNum) => {
                    cell.font = { name: 'Tahoma', color: { argb: 'FF0F172A' } };
                    cell.border = { top:{style:'thin'}, bottom:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'} };
                    
                    let align = { vertical: 'middle', wrapText: true };
                    if([1, 2, 5].includes(colNum)) align.horizontal = 'center';
                    if([6, 7, 8].includes(colNum)) {
                        align.horizontal = 'right';
                        cell.numFmt = '#,##0.00';
                    }
                    cell.alignment = align;

                    if(colNum === 6 && inAmt) cell.font = { name: 'Tahoma', bold: true, color: { argb: 'FF10B981' } };
                    if(colNum === 7 && outAmt) cell.font = { name: 'Tahoma', bold: true, color: { argb: 'FFEF4444' } };
                    if(colNum === 8) cell.font.bold = true;
                });
            });

            const cfRow = sheet.addRow(["", "", "", "ยอดยกไป (Carried Forward):", "", "", "", currentBalance]);
            const cfRowNum = sheet.rowCount;
            sheet.mergeCells(`A${cfRowNum}:D${cfRowNum}`);
            sheet.getCell(`A${cfRowNum}`).alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
            cfRow.eachCell((cell, colNum) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }; 
                cell.font = { name: 'Tahoma', bold: true, size: 11, color: { argb: 'FF0F172A' } };
                cell.border = { top:{style:'medium'}, bottom:{style:'medium'}, left:{style:'thin'}, right:{style:'thin'} };
                let align = { vertical: 'middle', wrapText: true };
                if (colNum === 8) align.horizontal = 'right';
                cell.alignment = align;
                if(colNum === 8) cell.numFmt = '#,##0.00';
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Department_Ledger_${this.state.startDate}_to_${this.state.endDate}.xlsx`;
            
            Swal.close();
            setTimeout(() => {
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            }, 500);

        } catch (error) {
            console.error(error);
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถสร้างไฟล์ Excel ได้: ' + error.message, 'error');
        }
    }

    exportSummaryExcel() {
        if(typeof ExcelJS === 'undefined') {
            Swal.fire({ title: 'กำลังโหลด Excel Engine...', html: 'โปรดรอสักครู่...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js';
            script.onload = () => { Swal.close(); this._generateSummaryExcelJS(); };
            document.head.appendChild(script);
            return;
        }
        this._generateSummaryExcelJS();
    }

    async _generateSummaryExcelJS() {
        if(!this.state._pendingChartData) { Swal.fire('ข้อมูลไม่พร้อม', 'ไม่พบข้อมูลสรุปเพื่อจัดพิมพ์', 'warning'); return; }
        Swal.fire({ title: 'กำลังสร้างไฟล์ Excel...', html: 'ระบบกำลังแทรกกราฟและตารางแบบ Dashboard<br>โปรดรอสักครู่...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        try {
            let chartImgUrl = null;
            let imgRatio = 1; 
            try {
                const existingCanvas = document.getElementById('dlSummaryChart');
                if (existingCanvas) {
                    imgRatio = existingCanvas.height / existingCanvas.width; 
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = existingCanvas.width;
                    tempCanvas.height = existingCanvas.height;
                    const tCtx = tempCanvas.getContext('2d');
                    tCtx.fillStyle = '#ffffff'; 
                    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                    tCtx.drawImage(existingCanvas, 0, 0);
                    chartImgUrl = tempCanvas.toDataURL('image/png');
                }
            } catch(e) { console.warn("Canvas capture warning", e); }

            let broughtForward = this.state.initialBalance; 
            this.state.allTransactions.filter(t => t.date < this.state.startDate).forEach(t => { 
                broughtForward += t.type === 'IN' ? Number(t.amount) : -Number(t.amount); 
            });

            let filtered = this.state.allTransactions.filter(t => t.date >= this.state.startDate && t.date <= this.state.endDate);
            let totalIn = 0; let totalOut = 0;
            let summaryIn = {}; let summaryOut = {}; 
            
            filtered.forEach(t => {
                let amt = Number(t.amount);
                if(t.type === 'IN') { totalIn += amt; summaryIn[t.category] = (summaryIn[t.category] || 0) + amt; } 
                else { totalOut += amt; summaryOut[t.category] = (summaryOut[t.category] || 0) + amt; }
            });
            let netBalance = broughtForward + totalIn - totalOut;

            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Summary Dashboard', { views: [{ showGridLines: false }] });

            sheet.columns = [ 
                { width: 45 }, { width: 35 }, { width: 15 }, { width: 25 }
            ];

            sheet.mergeCells('A1:D1');
            const t1 = sheet.getCell('A1');
            t1.value = this.state.clinicName;
            t1.font = { name: 'Tahoma', size: 16, bold: true, color: { argb: 'FF1E3A8A' } };
            t1.alignment = { vertical: 'middle', horizontal: 'center' };

            sheet.mergeCells('A2:D2');
            const t2 = sheet.getCell('A2');
            t2.value = 'รายงานสรุปยอดดุลและโครงสร้างรับ-จ่ายภายในหน่วยงาน';
            t2.font = { name: 'Tahoma', size: 12, bold: true, color: { argb: 'FF334155' } };
            t2.alignment = { vertical: 'middle', horizontal: 'center' };

            sheet.mergeCells('A3:D3');
            const t3 = sheet.getCell('A3');
            t3.value = `ช่วงเวลา: ${this.formatDateTh(this.state.startDate)} ถึง ${this.formatDateTh(this.state.endDate)}`;
            t3.font = { name: 'Tahoma', size: 11, color: { argb: 'FF64748B' } };
            t3.alignment = { vertical: 'middle', horizontal: 'center' };

            sheet.addRow([]); 

            sheet.mergeCells('A5:D5');
            const section1 = sheet.getCell('A5');
            section1.value = '1. สรุปยอดดุลทางการเงิน';
            section1.font = { name: 'Tahoma', size: 12, bold: true };

            const cardHeaders = sheet.addRow(["ยอดยกมา (Brought Fwd)", "รับเข้า (Income)", "จ่ายออก (Expense)", "คงเหลือสุทธิ (Net)"]);
            cardHeaders.eachCell((cell, colNum) => {
                let bgColor = colNum === 1 ? 'FFF8FAFC' : colNum === 2 ? 'FFF0FDF4' : colNum === 3 ? 'FFFEF2F2' : 'FFEFF6FF';
                let fontColor = colNum === 1 ? 'FF64748B' : colNum === 2 ? 'FF15803D' : colNum === 3 ? 'FFB91C1C' : 'FF1D4ED8';
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
                cell.font = { name: 'Tahoma', bold: true, size: 10, color: { argb: fontColor } };
                cell.border = { top:{style:'thin'}, bottom:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'} };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });

            const cardValues = sheet.addRow([broughtForward, totalIn, totalOut, netBalance]);
            cardValues.eachCell((cell, colNum) => {
                let bgColor = colNum === 1 ? 'FFF8FAFC' : colNum === 2 ? 'FFF0FDF4' : colNum === 3 ? 'FFFEF2F2' : 'FFEFF6FF';
                let fontColor = colNum === 1 ? 'FF000000' : colNum === 2 ? 'FF166534' : colNum === 3 ? 'FF991B1B' : 'FF1E40AF';
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
                cell.font = { name: 'Tahoma', bold: true, size: 14, color: { argb: fontColor } };
                cell.border = { top:{style:'thin'}, bottom:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'} };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                cell.numFmt = '#,##0.00';
            });

            sheet.addRow([]);

            sheet.getCell('A9').value = '2. แผนภูมิต้นทุนรายจ่าย';
            sheet.getCell('A9').font = { name: 'Tahoma', size: 12, bold: true };
            
            sheet.mergeCells('B9:D9');
            sheet.getCell('B9').value = '3. ยอดรวมสุทธิแยกตามหมวดหมู่โครงสร้าง';
            sheet.getCell('B9').font = { name: 'Tahoma', size: 12, bold: true };

            if (chartImgUrl) {
                const imageId = workbook.addImage({ base64: chartImgUrl, extension: 'png' });
                const baseWidth = 260; 
                const calculatedHeight = baseWidth * imgRatio;

                sheet.addImage(imageId, {
                    tl: { col: 0.2, row: 9.8 },
                    ext: { width: baseWidth, height: calculatedHeight } 
                });
            }

            const tableHeadersRow = sheet.getRow(10);
            tableHeadersRow.getCell(2).value = "หมวดหมู่รายการ";
            tableHeadersRow.getCell(3).value = "ประเภท";
            tableHeadersRow.getCell(4).value = "รวม (฿)";
            
            [2, 3, 4].forEach(colNum => {
                let cell = tableHeadersRow.getCell(colNum);
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
                cell.font = { name: 'Tahoma', bold: true, color: { argb: 'FF0F172A' } };
                cell.border = { top:{style:'thin'}, bottom:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'} };
                cell.alignment = { vertical: 'middle', horizontal: colNum === 4 ? 'right' : 'center' };
            });

            let currentRow = 11;
            
            Object.keys(summaryIn).sort((a,b) => summaryIn[b] - summaryIn[a]).forEach(cat => { 
                const row = sheet.getRow(currentRow++);
                row.getCell(2).value = cat;
                row.getCell(3).value = "รับเข้า";
                row.getCell(4).value = summaryIn[cat];

                row.getCell(2).font = { name: 'Tahoma', bold: true };
                row.getCell(3).font = { name: 'Tahoma', bold: true, color: { argb: 'FF10B981' } };
                row.getCell(4).font = { name: 'Tahoma', bold: true, color: { argb: 'FF10B981' } };
                
                row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                row.getCell(4).numFmt = '#,##0.00';
                
                [2, 3, 4].forEach(c => {
                    row.getCell(c).border = { top:{style:'thin'}, bottom:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'} };
                    row.getCell(c).alignment = { ...row.getCell(c).alignment, vertical: 'middle', wrapText: true };
                });
            });

            Object.keys(summaryOut).sort((a,b) => summaryOut[b] - summaryOut[a]).forEach(cat => { 
                const row = sheet.getRow(currentRow++);
                row.getCell(2).value = cat;
                row.getCell(3).value = "จ่ายออก";
                row.getCell(4).value = summaryOut[cat];

                row.getCell(2).font = { name: 'Tahoma', bold: true };
                row.getCell(3).font = { name: 'Tahoma', bold: true, color: { argb: 'FFEF4444' } };
                row.getCell(4).font = { name: 'Tahoma', bold: true, color: { argb: 'FFEF4444' } };
                
                row.getCell(3).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                row.getCell(4).numFmt = '#,##0.00';
                
                [2, 3, 4].forEach(c => {
                    row.getCell(c).border = { top:{style:'thin'}, bottom:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'} };
                    row.getCell(c).alignment = { ...row.getCell(c).alignment, vertical: 'middle', wrapText: true };
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Ledger_Summary_${this.state.startDate}_to_${this.state.endDate}.xlsx`;
            
            Swal.close();
            setTimeout(() => {
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            }, 500);

        } catch (error) {
            console.error(error);
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถสร้างไฟล์ Excel ได้: ' + error.message, 'error');
        }
    }

    async _executeDirectPDF(htmlContent, filename, orientation = 'portrait') {
        if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
            Swal.fire({ title: 'กำลังโหลด PDF Engine...', html: 'โปรดรอสักครู่...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            await Promise.all([
                new Promise((res) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; s.onload = res; document.head.appendChild(s); }),
                new Promise((res) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; s.onload = res; document.head.appendChild(s); })
            ]);
        }

        const containerWidth = orientation === 'portrait' ? 794 : 1122; 
        const currentScrollY = window.scrollY; 

        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = currentScrollY + 'px'; 
        container.style.left = '0px';
        container.style.width = containerWidth + 'px';
        container.style.backgroundColor = '#ffffff';
        container.style.zIndex = '-9999';
        container.innerHTML = htmlContent;
        document.body.appendChild(container);

        Swal.fire({ 
            title: 'กำลังสร้างไฟล์ PDF...', 
            html: 'ระบบกำลังประมวลผลข้อมูล...', 
            allowOutsideClick: false, 
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            await document.fonts.ready;
            await new Promise(resolve => setTimeout(resolve, 1500)); 

            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                x: 0,
                y: currentScrollY, 
                scrollY: currentScrollY,
                windowWidth: containerWidth + 50
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF(orientation, 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            
            container.remove();
            
            Swal.close();
            setTimeout(() => {
                pdf.save(filename);
            }, 500); 

        } catch (err) {
            container.remove();
            Swal.fire('ข้อผิดพลาด', 'เกิดปัญหาขณะสร้าง PDF: ' + err.message, 'error');
        }
    }

    exportPDF() {
        this.buildLedgerHTML().then(html => {
            const filename = `Department_Ledger_${this.state.startDate}_to_${this.state.endDate}.pdf`;
            this._executeDirectPDF(html, filename, 'portrait');
        });
    }

    exportSummaryPDF() {
        this.buildSummaryHTML().then(html => {
            if(html) {
                const filename = `Ledger_Summary_${this.state.startDate}_to_${this.state.endDate}.pdf`;
                this._executeDirectPDF(html, filename, 'portrait');
            } else {
                Swal.fire('ข้อมูลไม่พร้อม', 'ไม่พบข้อมูลสรุปเพื่อจัดพิมพ์', 'warning');
            }
        });
    }

    buildLedgerHTML() {
        return new Promise((resolve) => {
            let filtered = this.state.allTransactions.filter(t => t.date >= this.state.startDate && t.date <= this.state.endDate); 
            filtered.sort((a, b) => new Date(a.date + 'T' + (a.time||'00:00:00')) - new Date(b.date + 'T' + (b.time||'00:00:00')));
            
            let broughtForward = this.state.initialBalance; 
            this.state.allTransactions.filter(t => t.date < this.state.startDate).forEach(t => { broughtForward += t.type === 'IN' ? Number(t.amount) : -Number(t.amount); });
            
            let currentBalance = broughtForward;
            
            const inlineStyles = `
                background-color: #ffffff !important;
                border: 1px solid #cbd5e1 !important;
                padding: 6px 4px !important;
                color: #000000 !important;
                font-size: 11px !important;
                font-family: 'Tahoma', sans-serif !important;
                word-wrap: break-word !important;
                white-space: normal !important;
            `;

            let tbodyHtml = `
                <tr>
                    <td colspan="4" style="background-color: #f8fafc !important; font-weight: bold !important; text-align: right !important; border: 1px solid #cbd5e1 !important; padding: 5px 4px !important; color: #000000 !important; font-size: 11px !important; font-family: 'Tahoma', sans-serif !important;">ยอดยกมา (Brought Forward):</td>
                    <td style="background-color: #f8fafc !important; border: 1px solid #cbd5e1 !important; padding: 5px 4px !important;"></td>
                    <td style="background-color: #f8fafc !important; border: 1px solid #cbd5e1 !important; padding: 5px 4px !important;"></td>
                    <td style="background-color: #f8fafc !important; font-weight: bold !important; text-align: right !important; border: 1px solid #cbd5e1 !important; padding: 5px 4px !important; color: #000000 !important; font-size: 11px !important; font-family: 'Tahoma', sans-serif !important;">${broughtForward.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
            `;
            
            filtered.forEach((t, idx) => { 
                let amt = Number(t.amount); 
                if(t.type === 'IN') currentBalance += amt; else currentBalance -= amt; 
                
                tbodyHtml += `
                <tr>
                    <td style="${inlineStyles} text-align: center !important;">${idx+1}</td>
                    <td style="${inlineStyles} text-align: center !important;">${this.formatDateTh(t.date)} <br><span style="color: #64748b !important; font-size: 9px !important; display: block; margin-top: 2px;">${t.time?t.time.substring(0,5)+' น.':'-'}</span></td>
                    <td style="${inlineStyles} text-align: left !important;">${this._escapeHTML(t.description)} <br><span style="color: #64748b !important; font-size: 9px !important; display: block; margin-top: 2px;">[${this._escapeHTML(t.category)}]</span></td>
                    <td style="${inlineStyles} text-align: left !important;">${this._escapeHTML(t.remark || '-')}</td>
                    <td style="${inlineStyles} text-align: left !important;">${this._escapeHTML(t.recorded_by)}</td>
                    <td style="${inlineStyles} text-align: right !important; color: #15803d !important; font-weight: bold !important;">${t.type === 'IN' ? amt.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                    <td style="${inlineStyles} text-align: right !important; color: #b91c1c !important; font-weight: bold !important;">${t.type === 'OUT' ? amt.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                    <td style="${inlineStyles} text-align: right !important; font-weight: bold !important;">${currentBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>`; 
            });
            
            tbodyHtml += `
                <tr>
                    <td colspan="4" style="background-color: #e2e8f0 !important; text-align: right !important; font-weight: bold !important; font-size: 13px !important; border: 1px solid #cbd5e1 !important; padding: 5px 4px !important; color: #000000 !important; font-family: 'Tahoma', sans-serif !important;">ยอดยกไป (Carried Forward):</td>
                    <td style="background-color: #e2e8f0 !important; border: 1px solid #cbd5e1 !important; padding: 5px 4px !important;"></td>
                    <td style="background-color: #e2e8f0 !important; border: 1px solid #cbd5e1 !important; padding: 5px 4px !important;"></td>
                    <td style="background-color: #e2e8f0 !important; text-align: right !important; font-weight: bold !important; font-size: 13px !important; color: #000000 !important; border: 1px solid #cbd5e1 !important; padding: 5px 4px !important; font-family: 'Tahoma', sans-serif !important;">${currentBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
            `;

            db.ref('clinic_settings_v2').once('value').then(snap => {
                const settings = snap.val() || { clinic_name: "DIALYSIS PRO CLINIC" };
                const htmlContent = `
                    <div style="background-color: #ffffff !important; padding: 10mm !important; width: 100% !important; box-sizing: border-box !important;">
                        <h2 style="color: #1e3a8a !important; font-size: 20px !important; text-align: center !important; margin: 0 0 5px 0 !important; font-weight: bold !important; font-family: 'Tahoma', sans-serif !important;">${this._escapeHTML(settings.clinic_name)}</h2>
                        <h3 style="color: #334155 !important; font-size: 14px !important; text-align: center !important; margin: 0 0 5px 0 !important; font-weight: normal !important; font-family: 'Tahoma', sans-serif !important;">สมุดบัญชีรายรับ-รายจ่ายภายในหน่วยงาน (Department Ledger)</h3>
                        <p style="text-align: center !important; color: #64748b !important; font-size: 12px !important; margin: 0 0 20px 0 !important; font-family: 'Tahoma', sans-serif !important;">ความเคลื่อนไหวตั้งแต่: ${this.formatDateTh(this.state.startDate)} ถึง ${this.formatDateTh(this.state.endDate)}</p>
                        
                        <table style="width: 100% !important; border-collapse: collapse !important; background-color: #ffffff !important; border: 1px solid #cbd5e1 !important; table-layout: fixed !important; word-wrap: break-word !important;">
                            <thead>
                                <tr>
                                    <th style="width: 5%; background-color: #f1f5f9 !important; border: 1px solid #cbd5e1 !important; padding: 6px 3px !important; font-weight: bold !important; text-align: center !important; color: #000000 !important; font-size: 11.5px !important; font-family: 'Tahoma', sans-serif !important;">#</th>
                                    <th style="width: 13%; background-color: #f1f5f9 !important; border: 1px solid #cbd5e1 !important; padding: 8px !important; font-weight: bold !important; text-align: center !important; color: #000000 !important; font-size: 11.5px !important; font-family: 'Tahoma', sans-serif !important;">วันที่</th>
                                    <th style="width: 23%; background-color: #f1f5f9 !important; border: 1px solid #cbd5e1 !important; padding: 8px !important; font-weight: bold !important; text-align: center !important; color: #000000 !important; font-size: 11.5px !important; font-family: 'Tahoma', sans-serif !important;">รายการ</th>
                                    <th style="width: 16%; background-color: #f1f5f9 !important; border: 1px solid #cbd5e1 !important; padding: 8px !important; font-weight: bold !important; text-align: center !important; color: #000000 !important; font-size: 11.5px !important; font-family: 'Tahoma', sans-serif !important;">หมายเหตุ</th>
                                    <th style="width: 13%; background-color: #f1f5f9 !important; border: 1px solid #cbd5e1 !important; padding: 8px !important; font-weight: bold !important; text-align: center !important; color: #000000 !important; font-size: 11.5px !important; font-family: 'Tahoma', sans-serif !important;">ผู้บันทึก</th>
                                    <th style="width: 10%; background-color: #f1f5f9 !important; border: 1px solid #cbd5e1 !important; padding: 8px !important; font-weight: bold !important; text-align: center !important; color: #000000 !important; font-size: 11.5px !important; font-family: 'Tahoma', sans-serif !important;">รับเข้า (฿)</th>
                                    <th style="width: 10%; background-color: #f1f5f9 !important; border: 1px solid #cbd5e1 !important; padding: 8px !important; font-weight: bold !important; text-align: center !important; color: #000000 !important; font-size: 11.5px !important; font-family: 'Tahoma', sans-serif !important;">จ่ายออก (฿)</th>
                                    <th style="width: 10%; background-color: #f1f5f9 !important; border: 1px solid #cbd5e1 !important; padding: 8px !important; font-weight: bold !important; text-align: center !important; color: #000000 !important; font-size: 11.5px !important; font-family: 'Tahoma', sans-serif !important;">คงเหลือ (฿)</th>
                                </tr>
                            </thead>
                            <tbody>${tbodyHtml}</tbody>
                        </table>
                    </div>
                `;
                resolve(htmlContent);
            });
        });
    }

    buildSummaryHTML() {
        return new Promise((resolve) => {
            if(!this.state._pendingChartData) { resolve(null); return; }
            
            let chartImgUrl = '';
            try {
                const existingCanvas = document.getElementById('dlSummaryChart');
                if (existingCanvas && existingCanvas.toDataURL) {
                    chartImgUrl = existingCanvas.toDataURL('image/png');
                }
            } catch(e) { 
                console.warn("ไม่สามารถดึงภาพ Canvas ได้", e); 
            }

            if (!chartImgUrl && window.Chart) {
                try {
                    const tempContainer = document.createElement('div');
                    tempContainer.style.position = 'absolute';
                    tempContainer.style.top = '-9999px';
                    tempContainer.style.width = '300px';
                    tempContainer.style.height = '300px';
                    document.body.appendChild(tempContainer);

                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = 300; 
                    tempCanvas.height = 300;
                    tempContainer.appendChild(tempCanvas);

                    const tempChart = new window.Chart(tempCanvas.getContext('2d'), {
                        type: 'doughnut',
                        data: { 
                            labels: this.state._pendingChartData.labels, 
                            datasets: [{ data: this.state._pendingChartData.data, backgroundColor: this.state._pendingChartData.colors.slice(0, this.state._pendingChartData.data.length), borderWidth: 2, borderColor: '#fff' }] 
                        },
                        options: { responsive: false, maintainAspectRatio: true, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { font: { family: 'Tahoma', size: 12 }, color: '#0f172a' }, padding: 10 } }, animation: { duration: 0 } }
                    });
                    
                    const ctx = tempCanvas.getContext('2d');
                    ctx.font = "bold 16px Tahoma"; 
                    ctx.textBaseline = "middle"; 
                    ctx.fillStyle = "#334155"; 
                    var text = "฿" + this.state._pendingChartData.totalOut.toLocaleString(undefined, {minimumFractionDigits: 2}); 
                    var textX = Math.round((300 - ctx.measureText(text).width) / 2);
                    var textY = 150 - 20; 
                    ctx.fillText(text, textX, textY);
                    
                    chartImgUrl = tempCanvas.toDataURL('image/png');
                    tempChart.destroy(); 
                    tempContainer.remove();
                } catch(err) {
                    console.error("Off-screen chart generation failed:", err);
                }
            }

            const chartImgHtml = chartImgUrl 
                ? `<img src="${chartImgUrl}" style="width: 100% !important; max-width: 220px !important; height: auto !important; display: block !important; margin: 0 auto !important; object-fit: contain !important;">`
                : `<div style="text-align:center; padding: 20px; color: #94a3b8; border: 1px dashed #cbd5e1; font-family: Tahoma, sans-serif; font-size: 11px;">(กำลังประมวลผลกราฟ)</div>`;

            let cardsHtml = `
                <table style="width: 100% !important; border-collapse: separate !important; border-spacing: 5px 0 !important; margin-bottom: 15px !important; border: none !important; background-color: transparent !important; table-layout: fixed !important;">
                    <tr>
                        <td style="border: 1px solid #cbd5e1 !important; border-radius: 8px !important; text-align: center !important; padding: 8px !important; background-color: #f8fafc !important; width: 25% !important; word-wrap: break-word; white-space: normal;">
                            <div style="font-size: 10px !important; font-weight: bold !important; margin-bottom: 2px !important; color: #64748b !important; font-family: 'Tahoma', sans-serif !important;">ยอดยกมา</div>
                            <div style="font-size: 13px !important; font-weight: bold !important; color: #000000 !important; font-family: 'Tahoma', sans-serif !important;">฿${document.getElementById('dl-bf-balance') ? document.getElementById('dl-bf-balance').innerText : '0.00'}</div>
                        </td>
                        <td style="border: 1px solid #cbd5e1 !important; border-radius: 8px !important; text-align: center !important; padding: 8px !important; background-color: #f0fdf4 !important; width: 25% !important; word-wrap: break-word; white-space: normal;">
                            <div style="font-size: 10px !important; font-weight: bold !important; margin-bottom: 2px !important; color: #15803d !important; font-family: 'Tahoma', sans-serif !important;">รับเข้า</div>
                            <div style="font-size: 13px !important; font-weight: bold !important; color: #166534 !important; font-family: 'Tahoma', sans-serif !important;">+ ฿${document.getElementById('dl-total-in') ? document.getElementById('dl-total-in').innerText : '0.00'}</div>
                        </td>
                        <td style="border: 1px solid #cbd5e1 !important; border-radius: 8px !important; text-align: center !important; padding: 8px !important; background-color: #fef2f2 !important; width: 25% !important; word-wrap: break-word; white-space: normal;">
                            <div style="font-size: 10px !important; font-weight: bold !important; margin-bottom: 2px !important; color: #b91c1c !important; font-family: 'Tahoma', sans-serif !important;">จ่ายออก</div>
                            <div style="font-size: 13px !important; font-weight: bold !important; color: #991b1b !important; font-family: 'Tahoma', sans-serif !important;">- ฿${document.getElementById('dl-total-out') ? document.getElementById('dl-total-out').innerText : '0.00'}</div>
                        </td>
                        <td style="border: 1px solid #cbd5e1 !important; border-radius: 8px !important; text-align: center !important; padding: 8px !important; background-color: #eff6ff !important; width: 25% !important; word-wrap: break-word; white-space: normal;">
                            <div style="font-size: 10px !important; font-weight: bold !important; margin-bottom: 2px !important; color: #1d4ed8 !important; font-family: 'Tahoma', sans-serif !important;">คงเหลือสุทธิ</div>
                            <div style="font-size: 13px !important; font-weight: bold !important; color: #1e40af !important; font-family: 'Tahoma', sans-serif !important;">฿${document.getElementById('dl-net-balance') ? document.getElementById('dl-net-balance').innerText : '0.00'}</div>
                        </td>
                    </tr>
                </table>
            `;

            let tbodyHtml = '';
            let summaryIn = {}; 
            let summaryOut = {}; 
            let filtered = this.state.allTransactions.filter(t => t.date >= this.state.startDate && t.date <= this.state.endDate);
            filtered.forEach(t => {
                let amt = Number(t.amount);
                if(t.type === 'IN') { summaryIn[t.category] = (summaryIn[t.category] || 0) + amt; } 
                else { summaryOut[t.category] = (summaryOut[t.category] || 0) + amt; }
            });

            Object.keys(summaryIn).sort((a,b) => summaryIn[b] - summaryIn[a]).forEach(cat => { 
                tbodyHtml += `<tr style="background-color: #ffffff !important;">
                    <td style="border: 1px solid #cbd5e1 !important; padding: 6px 4px !important; color: #000000 !important; font-weight: bold !important; font-size: 11px !important; font-family: 'Tahoma', sans-serif !important; word-wrap: break-word; white-space: normal;">${this._escapeHTML(cat)}</td>
                    <td style="border: 1px solid #cbd5e1 !important; padding: 6px 4px !important; text-align: center !important; color: #10b981 !important; font-weight: bold !important; font-size: 11px !important; font-family: 'Tahoma', sans-serif !important;">รับเข้า</td>
                    <td style="border: 1px solid #cbd5e1 !important; padding: 6px 4px !important; text-align: right !important; color: #10b981 !important; font-weight: bold !important; font-size: 11px !important; font-family: 'Tahoma', sans-serif !important;">+ ${summaryIn[cat].toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>`;
            });
            Object.keys(summaryOut).sort((a,b) => summaryOut[b] - summaryOut[a]).forEach(cat => { 
                tbodyHtml += `<tr style="background-color: #ffffff !important;">
                    <td style="border: 1px solid #cbd5e1 !important; padding: 6px 4px !important; color: #000000 !important; font-weight: bold !important; font-size: 11px !important; font-family: 'Tahoma', sans-serif !important; word-wrap: break-word; white-space: normal;">${this._escapeHTML(cat)}</td>
                    <td style="border: 1px solid #cbd5e1 !important; padding: 6px 4px !important; text-align: center !important; color: #ef4444 !important; font-weight: bold !important; font-size: 11px !important; font-family: 'Tahoma', sans-serif !important;">จ่ายออก</td>
                    <td style="border: 1px solid #cbd5e1 !important; padding: 6px 4px !important; text-align: right !important; color: #ef4444 !important; font-weight: bold !important; font-size: 11px !important; font-family: 'Tahoma', sans-serif !important;">- ${summaryOut[cat].toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>`;
            });

            db.ref('clinic_settings_v2').once('value').then(snap => {
                const settings = snap.val() || { clinic_name: "DIALYSIS PRO CLINIC" };
                const htmlContent = `
                    <div style="background-color: #ffffff !important; padding: 10mm !important; width: 100% !important; box-sizing: border-box !important;">
                        <h2 style="color: #1e3a8a !important; font-size: 20px !important; text-align: center !important; margin: 0 0 5px 0 !important; font-weight: bold !important; font-family: 'Tahoma', sans-serif !important;">${this._escapeHTML(settings.clinic_name)}</h2>
                        <h3 style="color: #334155 !important; font-size: 14px !important; text-align: center !important; margin: 0 0 5px 0 !important; font-weight: normal !important; font-family: 'Tahoma', sans-serif !important;">สมุดบัญชีรายรับ-รายจ่ายภายในหน่วยงาน (Department Ledger)</h3>
                        <p style="text-align: center !important; color: #64748b !important; font-size: 12px !important; margin: 0 0 20px 0 !important; font-family: 'Tahoma', sans-serif !important;">ความเคลื่อนไหวตั้งแต่: ${this.formatDateTh(this.state.startDate)} ถึง ${this.formatDateTh(this.state.endDate)}</p>
                        
                        <div style="font-size: 13px !important; font-weight: bold !important; margin-bottom: 8px !important; border-left: 4px solid #0284c7 !important; padding-left: 8px !important; color: #000000 !important; font-family: 'Tahoma', sans-serif !important; background-color: transparent !important;">1. สรุปยอดดุลทางการเงิน</div>
                        ${cardsHtml}
                        
                        <table style="width: 100% !important; border: none !important; border-collapse: collapse !important; background-color: transparent !important; table-layout: fixed !important;">
                            <tr>
                                <td style="width: 45% !important; vertical-align: top !important; border: none !important; padding: 0 10px 0 0 !important; background-color: transparent !important;">
                                    <div style="font-size: 13px !important; font-weight: bold !important; margin-bottom: 8px !important; border-left: 4px solid #0284c7 !important; padding-left: 8px !important; color: #000000 !important; font-family: 'Tahoma', sans-serif !important; background-color: transparent !important;">2. แผนภูมิต้นทุนรายจ่าย</div>
                                    ${chartImgHtml}
                                </td>
                                <td style="width: 55% !important; vertical-align: top !important; border: none !important; padding: 0 0 0 10px !important; background-color: transparent !important;">
                                    <div style="font-size: 13px !important; font-weight: bold !important; margin-bottom: 8px !important; border-left: 4px solid #0284c7 !important; padding-left: 8px !important; color: #000000 !important; font-family: 'Tahoma', sans-serif !important; background-color: transparent !important;">3. ยอดรวมสุทธิแยกตามหมวดหมู่โครงสร้าง</div>
                                    <table style="width: 100% !important; border-collapse: collapse !important; background-color: #ffffff !important; border: 1px solid #cbd5e1 !important; margin-top: 5px !important; table-layout: fixed !important;">
                                        <thead>
                                            <tr>
                                                <th style="width: 50%; background-color: #f1f5f9 !important; border: 1px solid #cbd5e1 !important; padding: 6px 4px !important; font-weight: bold !important; text-align: center !important; color: #000000 !important; font-size: 11px !important; font-family: 'Tahoma', sans-serif !important;">หมวดหมู่รายการ</th>
                                                <th style="width: 20%; background-color: #f1f5f9 !important; border: 1px solid #cbd5e1 !important; padding: 6px 4px !important; font-weight: bold !important; text-align: center !important; color: #000000 !important; font-size: 11px !important; font-family: 'Tahoma', sans-serif !important;">ประเภท</th>
                                                <th style="width: 30%; background-color: #f1f5f9 !important; border: 1px solid #cbd5e1 !important; padding: 6px 4px !important; font-weight: bold !important; text-align: right !important; color: #000000 !important; font-size: 11px !important; font-family: 'Tahoma', sans-serif !important;">รวม (฿)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${tbodyHtml}
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </div>
                `;
                resolve(htmlContent);
            });
        });
    }

    // 🚨 THE PC FIX: Asynchronous Iframe Processing - รอให้กระดาษสร้างเสร็จก่อนสั่งพิมพ์
    printLedger() {
        this.buildLedgerHTML().then(html => {
            this._executePrint(html);
        });
    }

    printSummary() {
        this.buildSummaryHTML().then(html => {
            if(html) {
                this._executePrint(html);
            } else {
                Swal.fire('ข้อมูลไม่พร้อม', 'ไม่พบข้อมูลสรุปเพื่อจัดพิมพ์', 'warning');
            }
        });
    }

    _executePrint(htmlContent) {
        Swal.fire({ 
            title: 'กำลังเตรียมหน้าต่างพิมพ์...', 
            html: 'กรุณารอสักครู่ เบราว์เซอร์กำลังโหลด...', 
            allowOutsideClick: false, 
            didOpen: () => { Swal.showLoading(); } 
        });
        
        let oldIframe = document.getElementById('hidden-print-frame'); 
        if (oldIframe) { oldIframe.remove(); }
        
        let iframe = document.createElement('iframe'); 
        iframe.id = 'hidden-print-frame'; 
        iframe.style.position = 'fixed'; 
        iframe.style.right = '0'; 
        iframe.style.bottom = '0'; 
        iframe.style.width = '1px'; 
        iframe.style.height = '1px'; 
        iframe.style.border = '0'; 
        document.body.appendChild(iframe);
        
        let doc = iframe.contentWindow.document; 
        doc.open(); 
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>พิมพ์รายงานคลินิก</title>
                <style>
                    @page { size: A4 portrait; margin: 10mm; } 
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; box-sizing: border-box !important; }
                    body { background-color: #ffffff !important; margin: 0; padding: 0; color: #000; font-family: sans-serif; }
                </style>
            </head>
            <body>
                <div style="width: 794px; margin: 0 auto;">
                    ${htmlContent}
                </div>
            </body>
            </html>
        `); 
        doc.close();

        // 🚨 สั่ง iframe ให้รอจนกว่าทรัพยากร (เช่น ภาพกราฟ) จะโหลดเสร็จ 100%
        iframe.onload = () => {
            Swal.close();
            try {
                iframe.contentWindow.focus(); 
                iframe.contentWindow.print(); 
            } catch(e) {
                console.error("Print execution failed:", e);
                Swal.fire('ข้อผิดพลาด', 'ระบบพิมพ์ถูกบล็อก กรุณากดยอมรับ Popup', 'error');
            }
            
            // รอจนกว่าจะพิมพ์เสร็จ หรือปิดหน้าต่าง ค่อยลบ iframe ทิ้ง
            setTimeout(() => {
                if(document.getElementById('hidden-print-frame')) {
                    document.getElementById('hidden-print-frame').remove();
                }
            }, 60000); // เก็บไว้ 1 นาทีเผื่อพิมพ์ช้า
        };
    }

    _escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
}

const DepartmentLedgerPage = new DepartmentLedgerPageComponent();
window.DepartmentLedgerPage = DepartmentLedgerPage;