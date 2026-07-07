// js/pages/department_ledger.js
// 🚀 Enterprise Department Ledger Module: Encapsulated State, Auto-Purge, Statement Printing & Theme Native

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
            hasCleanedUp: false
        };
        this.firebaseListeners = [];
    }

    get html() {
        return `
            <style>
                .stat-card-ledger { border-radius: 20px; padding: 20px; position: relative; overflow: hidden; background: var(--bg-surface); border: 1px solid var(--border-color); transition: all 0.3s ease; height: 100%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
                .stat-card-ledger:hover { transform: translateY(-4px); box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.1); border-color: var(--primary); }
                .stat-icon-bg { position: absolute; top: -20px; right: -20px; opacity: 0.04; font-size: 120px; pointer-events: none; z-index: 0; }
                .table-ledger th { background: var(--bg-body); color: var(--text-dark); font-weight: 700; text-transform: uppercase; font-size: 13px; padding: 16px; border-bottom: 2px solid var(--border-color); border-top: none; white-space: nowrap; }
                .table-ledger td { padding: 14px 16px; vertical-align: middle; border-bottom: 1px solid var(--border-color); font-size: 14.5px; color: var(--text-dark); background: transparent; }
                
                /* 🚨 ซ่อน Input Native ป้องกันสี่เหลี่ยมซ้อนทับปฏิทิน 100% 🚨 */
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

                .finance-nav-tabs { border-bottom: 2px solid var(--border-color); gap: 5px; flex-wrap: nowrap; overflow-x: auto; white-space: nowrap; padding-bottom: 2px; }
                .finance-nav-tabs::-webkit-scrollbar { height: 4px; }
                .finance-nav-tabs::-webkit-scrollbar-thumb { background-color: var(--border-color); border-radius: 10px; }
                .finance-nav-tabs .nav-link { border: none; color: var(--text-muted); font-weight: 600; padding: 14px 24px; border-radius: 12px 12px 0 0; transition: all 0.3s ease; background: transparent; position: relative; font-family:'Prompt'; font-size:15px; }
                .finance-nav-tabs .nav-link:hover { color: var(--primary); background: var(--bg-body); }
                .finance-nav-tabs .nav-link.active { background: var(--bg-surface); box-shadow: 0 -4px 10px rgba(0,0,0,0.02); color: var(--primary); }
                .finance-nav-tabs .nav-link.active::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 3px; border-radius: 3px 3px 0 0; background: var(--primary); }

                /* 🚨 THE FIX: ยันต์กันไอคอนเพี้ยน (Force Font Awesome) */
                .safe-icon { font-family: 'Font Awesome 6 Free', 'FontAwesome', sans-serif !important; font-weight: 900 !important; font-style: normal !important; }
            </style>

            <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 class="page-title text-primary" style="font-size: 28px;"><i class="fa-solid fa-wallet me-2"></i> บัญชีภายในหน่วยงาน</h2>
                    <p class="text-muted mt-1 mb-0" id="dl-date-text" style="color: var(--text-muted) !important;">จัดการงบประมาณ เงินสวัสดิการ และค่าใช้จ่ายแผนก</p>
                </div>
                <div class="d-flex gap-2 align-items-center flex-wrap">
                    <button class="btn btn-outline-secondary fw-bold shadow-sm rounded-pill px-3 card-hover-float" style="background-color: var(--bg-surface);" onclick="DepartmentLedgerPage.manageCategories()">
                        <i class="fas fa-tags me-1 text-secondary safe-icon"></i> จัดการหมวดหมู่
                    </button>
                    <button class="btn btn-outline-info fw-bold shadow-sm rounded-pill px-3 card-hover-float" style="background-color: var(--bg-surface);" onclick="DepartmentLedgerPage.setInitialBalance()">
                        <i class="fas fa-piggy-bank me-1 text-info safe-icon"></i> ตั้งยอดยกมาเริ่มต้น
                    </button>
                    
                    <div class="d-flex align-items-center p-1 rounded-pill shadow-sm ms-2" style="background-color: var(--bg-body); border: 1px solid var(--border-color);">
                        <div class="native-date-wrapper">
                            <i class="fas fa-calendar-days text-primary me-2 safe-icon"></i>
                            <span class="thai-text" id="dl-start-display">กำลังโหลด...</span>
                            <input type="date" id="dl-start-date" onchange="DepartmentLedgerPage.onDateChange()">
                        </div>
                        <span class="mx-2 fw-bold small" style="color: var(--text-muted);">ถึง</span>
                        <div class="native-date-wrapper">
                            <i class="fas fa-calendar-days text-primary me-2 safe-icon"></i>
                            <span class="thai-text" id="dl-end-display">กำลังโหลด...</span>
                            <input type="date" id="dl-end-date" onchange="DepartmentLedgerPage.onDateChange()">
                        </div>
                        <button class="btn btn-primary rounded-pill px-3 ms-2 fw-bold shadow-sm" style="position: relative; z-index: 15;" onclick="DepartmentLedgerPage.setThisMonth()">เดือนนี้</button>
                    </div>
                </div>
            </div>

            <div class="row g-3 mb-4">
                <div class="col-md-6 col-xl-3">
                    <div class="stat-card-ledger" style="border-top: 4px solid #64748b;">
                        <i class="fa-solid fa-clock-rotate-left stat-icon-bg" style="color: var(--text-muted);"></i>
                        <div class="d-flex justify-content-between mb-2 position-relative z-1">
                            <div class="text-uppercase fw-bold small" style="color: var(--text-muted);">1. ยอดยกมา (Brought Fwd)</div>
                        </div>
                        <div class="fs-3 fw-bold position-relative z-1" style="color: var(--text-dark);">฿<span id="dl-bf-balance"><i class="fas fa-spinner fa-spin fs-5"></i></span></div>
                    </div>
                </div>
                <div class="col-md-6 col-xl-3">
                    <div class="stat-card-ledger" style="border-top: 4px solid var(--success);">
                        <i class="fa-solid fa-arrow-turn-down stat-icon-bg" style="transform: rotate(90deg); color: var(--success);"></i>
                        <div class="d-flex justify-content-between mb-2 position-relative z-1">
                            <div class="fw-bold small text-uppercase" style="color: var(--success);">2. รับเข้า (Income)</div>
                            <div class="badge-soft-success rounded px-2 py-1"><i class="fa-solid fa-plus"></i></div>
                        </div>
                        <div class="fs-3 fw-bold position-relative z-1" style="color: var(--success);">+ ฿<span id="dl-total-in"><i class="fas fa-spinner fa-spin fs-5"></i></span></div>
                    </div>
                </div>
                <div class="col-md-6 col-xl-3">
                    <div class="stat-card-ledger" style="border-top: 4px solid var(--danger);">
                        <i class="fa-solid fa-arrow-turn-up stat-icon-bg" style="transform: rotate(90deg); color: var(--danger);"></i>
                        <div class="d-flex justify-content-between mb-2 position-relative z-1">
                            <div class="fw-bold small text-uppercase" style="color: var(--danger);">3. จ่ายออก (Expense)</div>
                            <div class="badge-soft-danger rounded px-2 py-1"><i class="fa-solid fa-minus"></i></div>
                        </div>
                        <div class="fs-3 fw-bold position-relative z-1" style="color: var(--danger);">- ฿<span id="dl-total-out"><i class="fas fa-spinner fa-spin fs-5"></i></span></div>
                    </div>
                </div>
                <div class="col-md-6 col-xl-3">
                    <div class="stat-card-ledger" style="border-top: 4px solid var(--primary); background: var(--primary-light);">
                        <i class="fa-solid fa-vault stat-icon-bg" style="color: var(--primary);"></i>
                        <div class="d-flex justify-content-between mb-2 position-relative z-1">
                            <div class="text-primary fw-bold small text-uppercase">4. คงเหลือ (Carried Fwd)</div>
                            <div class="badge-soft-primary rounded px-2 py-1"><i class="fa-solid fa-equals"></i></div>
                        </div>
                        <div class="fs-3 fw-bold position-relative z-1" id="dl-net-balance"><i class="fas fa-spinner fa-spin fs-5"></i></div>
                    </div>
                </div>
            </div>

            <ul class="nav finance-nav-tabs mb-4" id="ledgerTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#ledger-panel" type="button" role="tab">
                        <i class="fa-solid fa-book-open me-2"></i> สมุดบัญชีรวม (Statement)
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link text-info" data-bs-toggle="tab" data-bs-target="#summary-panel" type="button" role="tab" onclick="setTimeout(()=>DepartmentLedgerPage.renderSummaryChart(), 200)">
                        <i class="fa-solid fa-chart-pie me-2"></i> สรุปรายงานการใช้จ่าย (Summary)
                    </button>
                </li>
            </ul>

            <div class="tab-content" id="ledgerTabContent">
                <div class="tab-pane fade show active" id="ledger-panel" role="tabpanel">
                    <div class="modern-panel shadow-sm p-4 position-relative overflow-hidden" style="border-top: 5px solid var(--primary); border-radius: 20px;">
                        <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 200px; pointer-events: none;"><i class="fa-solid fa-file-lines"></i></div>
                        <div class="d-flex justify-content-between align-items-center mb-4 position-relative z-1 flex-wrap gap-3">
                            <h5 class="fw-bold mb-0" style="color: var(--text-dark);"><i class="fa-solid fa-clock-rotate-left text-primary me-2"></i> ความเคลื่อนไหวทางบัญชี (Running Ledger)</h5>
                            <div class="d-flex gap-2">
                                <button class="btn btn-premium-danger px-4 shadow-sm" onclick="DepartmentLedgerPage.openAddModal('OUT')">
                                    <i class="fas fa-minus-circle me-2 safe-icon"></i> บันทึกจ่ายออก
                                </button>
                                <button class="btn btn-premium-success px-4 shadow-sm" onclick="DepartmentLedgerPage.openAddModal('IN')">
                                    <i class="fas fa-plus-circle me-2 safe-icon"></i> บันทึกรับเข้า
                                </button>
                                <button class="btn btn-dark fw-bold shadow-sm rounded-pill px-4 ms-2" onclick="DepartmentLedgerPage.printLedger()">
                                    <i class="fas fa-print me-2 text-warning safe-icon"></i> พิมพ์ Statement
                                </button>
                            </div>
                        </div>
                        
                        <div class="table-responsive rounded-4 position-relative z-1 shadow-sm" style="background-color: var(--bg-surface); border: 1px solid var(--border-color); max-height: 550px; overflow-y: auto;">
                            <table class="table table-ledger w-100 mb-0">
                                <thead style="position: sticky; top: 0; z-index: 10;">
                                    <tr>
                                        <th style="width: 14%;"><i class="fa-regular fa-calendar me-1"></i> วัน/เวลาที่ทำรายการ</th>
                                        <th style="width: 10%;">ประเภท</th>
                                        <th style="width: 20%;">รายละเอียดรายการ</th>
                                        <th style="width: 18%;"><i class="fa-regular fa-comment-dots me-1"></i> หมายเหตุ</th>
                                        <th class="text-end text-success" style="width: 10%;">เงินเข้า (IN)</th>
                                        <th class="text-end text-danger" style="width: 10%;">เงินออก (OUT)</th>
                                        <th class="text-end text-primary" style="width: 13%;">คงเหลือ (BAL)</th>
                                        <th class="text-center no-print" style="width: 5%;"></th>
                                    </tr>
                                </thead>
                                <tbody id="dl-table-body">
                                    <tr><td colspan="8" class="text-center py-5" style="color: var(--text-muted);">...กำลังโหลดข้อมูล...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="summary-panel" role="tabpanel">
                    <div class="d-flex justify-content-end mb-3">
                        <button class="btn btn-primary fw-bold shadow-sm rounded-pill px-4" onclick="DepartmentLedgerPage.printSummary()">
                            <i class="fa-solid fa-print me-2 text-white"></i> พิมพ์สรุปยอด
                        </button>
                    </div>
                    <div class="row g-4">
                        <div class="col-lg-5">
                            <div class="modern-panel shadow-sm p-4 h-100 position-relative overflow-hidden" style="border-top: 5px solid var(--info); border-radius: 20px;">
                                <h5 class="fw-bold mb-4" style="color: var(--text-dark);"><i class="fa-solid fa-chart-pie text-info me-2"></i> สัดส่วนการใช้จ่าย (Expense Breakdown)</h5>
                                <div style="height: 380px; width: 100%; display: flex; align-items: center; justify-content: center;" id="dl-chart-container">
                                    <canvas id="dlSummaryChart"></canvas>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-7">
                            <div class="modern-panel shadow-sm p-4 h-100 position-relative overflow-hidden" style="border-top: 5px solid #94a3b8; border-radius: 20px;">
                                <h5 class="fw-bold mb-4" style="color: var(--text-dark);"><i class="fa-solid fa-list-ul text-secondary me-2"></i> สรุปยอดแยกตามหมวดหมู่</h5>
                                <div class="table-responsive rounded-4 shadow-sm" style="background-color: var(--bg-surface); border: 1px solid var(--border-color);">
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
        `;
    }

    init() {
        if (typeof db === 'undefined') return;

        if (!this.state.hasCleanedUp) this.#autoPurgeOldRecords();

        if(!this.state.startDate || !this.state.endDate) {
            this.setThisMonth();
        } else {
            this.updateDateDisplays();
        }

        this.#setupListeners();
    }

    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        if(this.state.summaryChartInstance) {
            this.state.summaryChartInstance.destroy();
            this.state.summaryChartInstance = null;
        }
    }

    #setupListeners() {
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

    #autoPurgeOldRecords() {
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
            html += `<tr><td colspan="8" class="text-center py-5" style="color: var(--text-muted);"><i class="fa-solid fa-file-invoice fa-3x mb-3" style="opacity:0.2;"></i><br>ไม่มีความเคลื่อนไหวในช่วงเวลานี้</td></tr>`;
        } else {
            [...filtered].reverse().forEach(t => {
                let isIncome = t.type === 'IN';
                let badge = isIncome 
                    ? `<span class="badge badge-soft-success px-3 py-1 rounded-pill w-100"><i class="fa-solid fa-arrow-turn-down me-1" style="transform:rotate(90deg);"></i> รับเข้า</span>` 
                    : `<span class="badge badge-soft-danger px-3 py-1 rounded-pill w-100"><i class="fa-solid fa-arrow-turn-up me-1" style="transform:rotate(90deg);"></i> จ่ายออก</span>`;
                
                let inAmt = isIncome ? `+ ${Number(t.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}` : '-';
                let outAmt = !isIncome ? `- ${Number(t.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}` : '-';
                let timeStr = t.time ? t.time.substring(0,5) : '00:00';
                
                html += `
                <tr class="card-hover-float" style="cursor:default;">
                    <td>
                        <span class="badge shadow-sm px-2 py-1" style="background-color: var(--bg-body); border: 1px solid var(--border-color); color: var(--text-dark) !important;"><i class="fa-regular fa-calendar text-primary me-1"></i> ${this.formatDateTh(t.date)}</span>
                        <div class="small fw-bold mt-1 ms-1" style="color: var(--text-muted);"><i class="fa-regular fa-clock me-1"></i> ${timeStr} น.</div>
                    </td>
                    <td class="text-center">${badge}</td>
                    <td>
                        <div class="fw-bold" style="font-family:'Prompt'; font-size:14.5px; color: var(--text-dark);">${this.#escapeHTML(t.description)}</div>
                        <div class="small mt-1" style="color: var(--text-muted);"><span class="badge bg-secondary me-1">${this.#escapeHTML(t.category)}</span> ผู้บันทึก: ${this.#escapeHTML(t.recorded_by || 'Admin')}</div>
                    </td>
                    <td>
                        <div class="small" style="white-space:pre-wrap; max-width:200px; font-size:13px; line-height:1.4; color: var(--text-muted);">${this.#escapeHTML(t.remark || '-')}</div>
                    </td>
                    <td class="text-end fw-bold text-success" style="font-size:15px;">${inAmt}</td>
                    <td class="text-end fw-bold text-danger" style="font-size:15px;">${outAmt}</td>
                    <td class="text-end fw-bold border-start" style="font-size:15px; color: var(--text-dark); border-color: var(--border-color) !important;">฿${t.runningBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td class="text-center">
                        <button class="btn btn-sm text-danger px-2" onclick="DepartmentLedgerPage.deleteTransaction('${t.id}')" title="ลบรายการนี้"><i class="fa-solid fa-trash"></i></button>
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
        this.#renderSummaryData(summaryIn, summaryOut, totalOut);
    }

    #renderSummaryData(summaryIn, summaryOut, totalOut) {
        if (!document.getElementById('dl-summary-body')) return;
        
        let sumHtml = '';
        let chartLabels = []; 
        let chartData = []; 
        let chartColors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#eab308', '#ec4899', '#8b5cf6', '#6366f1'];

        Object.keys(summaryIn).sort((a,b) => summaryIn[b] - summaryIn[a]).forEach(cat => { 
            sumHtml += `
            <tr>
                <td><span class="fw-bold" style="color: var(--text-dark);">${this.#escapeHTML(cat)}</span></td>
                <td class="text-center"><span class="badge badge-soft-success">รับเข้า</span></td>
                <td class="text-end fw-bold text-success">+ ${summaryIn[cat].toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            </tr>`; 
        });
        
        Object.keys(summaryOut).sort((a,b) => summaryOut[b] - summaryOut[a]).forEach(cat => { 
            sumHtml += `
            <tr>
                <td><span class="fw-bold" style="color: var(--text-dark);">${this.#escapeHTML(cat)}</span></td>
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
                document.getElementById('dl-chart-container').innerHTML = `<div class="text-center" style="color: var(--text-muted);"><i class="fa-solid fa-chart-pie fa-3x mb-3" style="opacity:0.2;"></i><br>ไม่มีรายจ่ายให้วิเคราะห์</div>`; 
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
            title: '<h5 class="fw-bold text-info mb-0"><i class="fa-solid fa-piggy-bank me-2"></i> ตั้งยอดยกมาเริ่มต้น</h5>',
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
        let inHtml = this.state.categoriesIn.map((c, i) => `<span class="badge bg-success-subtle text-success-emphasis m-1 fs-6 border border-success-subtle py-2 px-3 shadow-sm rounded-pill">${this.#escapeHTML(c)} <i class="fa-solid fa-times ms-2 safe-icon" style="cursor:pointer;" onclick="Swal.close(); setTimeout(()=>DepartmentLedgerPage.removeCategory('IN', ${i}),300)"></i></span>`).join('');
        let outHtml = this.state.categoriesOut.map((c, i) => `<span class="badge bg-danger-subtle text-danger-emphasis m-1 fs-6 border border-danger-subtle py-2 px-3 shadow-sm rounded-pill">${this.#escapeHTML(c)} <i class="fa-solid fa-times ms-2 safe-icon" style="cursor:pointer;" onclick="Swal.close(); setTimeout(()=>DepartmentLedgerPage.removeCategory('OUT', ${i}),300)"></i></span>`).join('');

        Swal.fire({
            title: '<h4 class="fw-bold mb-0" style="color: var(--text-dark);"><i class="fa-solid fa-tags text-secondary me-2"></i> จัดการหมวดหมู่รับ-จ่าย</h4>', 
            width: 700,
            html: `
                <div class="row text-start mt-3" style="font-family:'Sarabun';">
                    <div class="col-md-6 border-end" style="border-color: var(--border-color) !important;">
                        <h6 class="fw-bold text-success mb-3"><i class="fa-solid fa-arrow-turn-down me-1 safe-icon" style="transform:rotate(90deg);"></i> หมวดหมู่รายรับ</h6>
                        <div class="input-group mb-3 shadow-sm" style="border-radius:8px; overflow:hidden;">
                            <input type="text" id="new-cat-in" class="form-control input-modern" placeholder="พิมพ์หมวดหมู่ใหม่...">
                            <button class="btn btn-success fw-bold" onclick="Swal.close(); setTimeout(()=>DepartmentLedgerPage.addCategory('IN'),300)">เพิ่ม</button>
                        </div>
                        <div class="p-3" style="background-color: var(--bg-body); border: 1px solid var(--border-color); min-height: 150px; border-radius: 12px;">${inHtml || '<div class="small" style="color: var(--text-muted);">ไม่มีข้อมูล</div>'}</div>
                    </div>
                    <div class="col-md-6">
                        <h6 class="fw-bold text-danger mb-3"><i class="fa-solid fa-arrow-turn-up me-1 safe-icon" style="transform:rotate(90deg);"></i> หมวดหมู่รายจ่าย</h6>
                        <div class="input-group mb-3 shadow-sm" style="border-radius:8px; overflow:hidden;">
                            <input type="text" id="new-cat-out" class="form-control input-modern" placeholder="พิมพ์หมวดหมู่ใหม่...">
                            <button class="btn btn-danger fw-bold" onclick="Swal.close(); setTimeout(()=>DepartmentLedgerPage.addCategory('OUT'),300)">เพิ่ม</button>
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
        let catOptions = activeArr.map(c => `<option value="${this.#escapeHTML(c)}">${this.#escapeHTML(c)}</option>`).join('');

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

    deleteTransaction(id) { 
        Swal.fire({ 
            title: 'ยืนยันการลบรายการ?', 
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonColor: '#ef4444', 
            confirmButtonText: 'ลบรายการ', 
            cancelButtonText: 'ยกเลิก' 
        }).then((result) => { 
            if (result.isConfirmed) {
                db.ref('department_ledger_v2/' + id).remove(); 
            }
        }); 
    }

    _executePrint(htmlContent) {
        Swal.fire({ title: 'กำลังเตรียมเอกสาร...', html: 'กรุณารอสักครู่ ระบบกำลังจัดหน้ากระดาษ', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
        
        let oldIframe = document.getElementById('hidden-print-frame'); 
        if (oldIframe) { oldIframe.remove(); }
        
        let iframe = document.createElement('iframe'); 
        iframe.id = 'hidden-print-frame'; 
        iframe.style.position = 'fixed'; iframe.style.right = '0'; iframe.style.bottom = '0'; iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = '0'; 
        document.body.appendChild(iframe);
        
        iframe.onload = function() { 
            setTimeout(function() { 
                Swal.close(); 
                iframe.contentWindow.focus(); 
                iframe.contentWindow.print(); 
                setTimeout(() => { if (document.getElementById('hidden-print-frame')) document.getElementById('hidden-print-frame').remove(); }, 10000); 
            }, 800); 
        };
        
        let doc = iframe.contentWindow.document; 
        doc.open(); 
        doc.write(htmlContent); 
        doc.close();
    }

    printLedger() {
        let filtered = this.state.allTransactions.filter(t => t.date >= this.state.startDate && t.date <= this.state.endDate); 
        filtered.sort((a, b) => new Date(a.date + 'T' + (a.time||'00:00:00')) - new Date(b.date + 'T' + (b.time||'00:00:00')));
        
        let broughtForward = this.state.initialBalance; 
        this.state.allTransactions.filter(t => t.date < this.state.startDate).forEach(t => { broughtForward += t.type === 'IN' ? Number(t.amount) : -Number(t.amount); });
        
        let currentBalance = broughtForward;
        let tbodyHtml = `
            <tr style="background-color: #f1f5f9; font-weight: bold;">
                <td colspan="4" style="text-align: right;">ยอดยกมา (Brought Forward):</td>
                <td></td>
                <td></td>
                <td style="text-align: right;">${broughtForward.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            </tr>
        `;
        
        filtered.forEach((t, idx) => { 
            let amt = Number(t.amount); 
            if(t.type === 'IN') currentBalance += amt; else currentBalance -= amt; 
            
            tbodyHtml += `
            <tr>
                <td style="text-align: center;">${idx+1}</td>
                <td style="text-align: center;">${this.formatDateTh(t.date)} <br><small style="color: #64748b;">${t.time?t.time.substring(0,5)+' น.':'-'}</small></td>
                <td>${this.#escapeHTML(t.description)} <br><small style="color: #64748b;">[${this.#escapeHTML(t.category)}]</small></td>
                <td>${this.#escapeHTML(t.remark || '-')}</td>
                <td>${this.#escapeHTML(t.recorded_by)}</td>
                <td style="text-align: right; color: #10b981;">${t.type === 'IN' ? amt.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                <td style="text-align: right; color: #ef4444;">${t.type === 'OUT' ? amt.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                <td style="text-align: right; font-weight:bold;">${currentBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            </tr>`; 
        });
        
        tbodyHtml += `
            <tr style="background-color: #e2e8f0; font-weight: bold; font-size: 16px;">
                <td colspan="4" style="text-align: right;">ยอดยกไป (Carried Forward):</td>
                <td></td>
                <td></td>
                <td style="text-align: right;">${currentBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            </tr>
        `;

        db.ref('clinic_settings_v2').once('value', snap => {
            const settings = snap.val() || { clinic_name: "DIALYSIS PRO CLINIC" };
            const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Statement - ${this.#escapeHTML(settings.clinic_name)}</title>
                <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
                <style>
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
                    body{font-family:'Sarabun',sans-serif;padding:20px;font-size:13px;}
                    .header{text-align:center;margin-bottom:20px;border-bottom:2px solid #000;padding-bottom:15px;}
                    table{width:100%;border-collapse:collapse;}
                    th,td{border:1px solid #000;padding:8px;}
                    th{background-color:#f1f5f9 !important; -webkit-print-color-adjust:exact;}
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>${this.#escapeHTML(settings.clinic_name)}</h2>
                    <h3>สมุดบัญชีรายรับ-รายจ่ายภายในหน่วยงาน (Department Ledger)</h3>
                    <div>ความเคลื่อนไหวตั้งแต่: ${this.formatDateTh(this.state.startDate)} ถึง ${this.formatDateTh(this.state.endDate)}</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>วันที่</th>
                            <th>รายการ</th>
                            <th>หมายเหตุ</th>
                            <th>ผู้บันทึก</th>
                            <th>รับเข้า (฿)</th>
                            <th>จ่ายออก (฿)</th>
                            <th>คงเหลือ (฿)</th>
                        </tr>
                    </thead>
                    <tbody>${tbodyHtml}</tbody>
                </table>
            </body>
            </html>`;
            this._executePrint(html);
        });
    }

    printSummary() {
        if(!this.state._pendingChartData) { Swal.fire('ข้อมูลไม่พร้อม', 'ไม่พบข้อมูลสรุปเพื่อจัดพิมพ์', 'warning'); return; }
        
        db.ref('clinic_settings_v2').once('value').then(snap => {
            const settings = snap.val() || { clinic_name: "DIALYSIS PRO CLINIC" };
            
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 450; tempCanvas.height = 450;
            const tempCtx = tempCanvas.getContext('2d');
            const ChartLib = window.Chart;
            
            if(!ChartLib) {
                Swal.fire('ข้อผิดพลาด', 'ไม่พบไลบรารีสำหรับสร้างกราฟ', 'error');
                return;
            }

            const tempChart = new ChartLib(tempCtx, {
                type: 'doughnut',
                data: { 
                    labels: this.state._pendingChartData.labels, 
                    datasets: [{ data: this.state._pendingChartData.data, backgroundColor: this.state._pendingChartData.colors.slice(0, this.state._pendingChartData.data.length), borderWidth: 2, borderColor: '#fff' }] 
                },
                options: { responsive: false, maintainAspectRatio: true, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { font: { family: 'Prompt', size: 16 } } } }, animation: { duration: 0 } },
                plugins: [{ 
                    id: 'textCenterTemp', 
                    beforeDraw: (chart) => { 
                        var width = chart.width, height = chart.height, ctx = chart.ctx; 
                        ctx.restore(); ctx.font = "bold 20px Prompt"; ctx.textBaseline = "middle"; ctx.fillStyle = "#334155"; 
                        var text = "฿" + this.state._pendingChartData.totalOut.toLocaleString(undefined, {minimumFractionDigits: 2}); 
                        var textX = Math.round((width - ctx.measureText(text).width) / 2), textY = (height / 2) - 30; 
                        ctx.fillText(text, textX, textY); ctx.save(); 
                    } 
                }]
            });

            const chartImgHtml = `<img src="${tempCanvas.toDataURL('image/png')}" style="width: 100%; max-width: 400px; height: auto; display: block; margin: 0 auto; object-fit: contain;">`;
            tempChart.destroy(); tempCanvas.remove(); 

            let cardsHtml = `
                <div style="display:flex; justify-content:space-between; margin-bottom:25px; gap:10px;">
                    <div class="print-card" style="background:#f8fafc;">
                        <div style="font-size:11px; color:#64748b; font-weight:bold; margin-bottom:4px;">ยอดยกมา</div>
                        <div style="font-size:17px; font-weight:bold; color:#475569;">฿${document.getElementById('dl-bf-balance').innerText}</div>
                    </div>
                    <div class="print-card" style="background:#f0fdf4;">
                        <div style="font-size:11px; color:#15803d; font-weight:bold; margin-bottom:4px;">รับเข้า</div>
                        <div style="font-size:17px; font-weight:bold; color:#166534;">+ ฿${document.getElementById('dl-total-in').innerText}</div>
                    </div>
                    <div class="print-card" style="background:#fef2f2;">
                        <div style="font-size:11px; color:#b91c1c; font-weight:bold; margin-bottom:4px;">จ่ายออก</div>
                        <div style="font-size:17px; font-weight:bold; color:#991b1b;">- ฿${document.getElementById('dl-total-out').innerText}</div>
                    </div>
                    <div class="print-card" style="background:#eff6ff;">
                        <div style="font-size:11px; color:#1d4ed8; font-weight:bold; margin-bottom:4px;">คงเหลือสุทธิ</div>
                        <div style="font-size:17px; font-weight:bold; color:#1e40af;">฿${document.getElementById('dl-net-balance').innerText}</div>
                    </div>
                </div>`;

            const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Summary - ${this.#escapeHTML(settings.clinic_name)}</title>
                <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
                <style>
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
                    body{font-family:'Sarabun',sans-serif;color:#000;padding:15px;font-size:13px;}
                    .header{text-align:center;margin-bottom:20px;border-bottom:2px solid #000;padding-bottom:12px;}
                    table{width:100%;border-collapse:collapse;margin-top:15px;}
                    th,td{border:1px solid #000;padding:8px;}
                    th{background-color:#f1f5f9 !important; -webkit-print-color-adjust:exact;}
                    .section-title{font-size:14px;font-weight:bold;margin-top:15px;margin-bottom:15px;border-left:4px solid #0284c7;padding-left:8px;}
                    .flex-container{display:flex;gap:30px;margin-top:20px;align-items:flex-start;}
                    .flex-child{flex:1;}
                    .print-card{flex:1; border:1px solid #cbd5e1; padding:12px; border-radius:10px; text-align:center;}
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>${this.#escapeHTML(settings.clinic_name)}</h2>
                    <h3>รายงานสรุปยอดดุลและโครงสร้างรับ-จ่ายภายในหน่วยงาน</h3>
                    <div>ช่วงเวลา: ${this.formatDateTh(this.state.startDate)} ถึง ${this.formatDateTh(this.state.endDate)}</div>
                </div>
                <div class="section-title">1. สรุปยอดดุลทางการเงิน</div>
                ${cardsHtml}
                <div class="flex-container">
                    <div class="flex-child" style="max-width: 45%;">
                        <div class="section-title">2. แผนภูมิต้นทุนรายจ่าย</div>
                        ${chartImgHtml}
                    </div>
                    <div class="flex-child">
                        <div class="section-title">3. ยอดรวมสุทธิแยกตามหมวดหมู่โครงสร้าง</div>
                        <table>
                            <thead><tr><th>หมวดหมู่รายการ</th><th>ประเภท</th><th style="text-align:right;">รวม (฿)</th></tr></thead>
                            <tbody>${document.getElementById('dl-summary-body').innerHTML}</tbody>
                        </table>
                    </div>
                </div>
            </body>
            </html>`;
            
            this._executePrint(html);
        });
    }

    #escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
}

const DepartmentLedgerPage = new DepartmentLedgerPageComponent();
window.DepartmentLedgerPage = DepartmentLedgerPage;