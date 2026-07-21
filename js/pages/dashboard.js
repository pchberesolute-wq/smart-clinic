// js/pages/dashboard.js
// 🚀 Enterprise Dashboard Component: Native Dark Mode Sync, Absolute Bindings & Zero-Leak Engine

class DashboardPageComponent {
    constructor() {
        this.state = {
            selectedDate: new Date().toISOString().split('T')[0],
            allVisits: [],
            allPatients: [],
            inventoryItems: new Map(), // 🔥 ใช้ Map เพื่อ O(1) Lookup
            allExpenses: [],
            stockTransactions: [],
        };
        
        this.myChartInstance = null;
        this.firebaseListeners = []; 

        this.boundHandleDateChange = this.#handleDateChange.bind(this);
    }

    get html() {
        return `
            <style>
                /* 🌟 Premium UI Overrides & Native Dark Mode Safe */
                .rights-breakdown-container::-webkit-scrollbar { width: 4px; }
                .rights-breakdown-container::-webkit-scrollbar-track { background: transparent; }
                .rights-breakdown-container::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
                
                @keyframes pulse-live { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
                .badge-live-pulse { animation: pulse-live 2s infinite; }
                
                .stat-card-premium { 
                    border-radius: 24px; padding: 24px; position: relative; overflow: hidden; 
                    background: var(--bg-surface); border: 1px solid var(--border-color); 
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); height: 100%; 
                    box-shadow: 0 4px 20px -2px rgba(0,0,0,0.03); z-index: 1; display: flex; flex-direction: column; width: 100%;
                }
                .stat-card-premium:hover { 
                    transform: translateY(-6px); 
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04); 
                    z-index: 2; border-color: var(--primary);
                }
                .stat-card-premium::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: var(--card-color); }
                
                .stat-icon-bg { position: absolute; top: -15px; right: -15px; opacity: 0.03; font-size: 130px; pointer-events: none; z-index: 0; transition: all 0.4s ease; }
                .stat-card-premium:hover .stat-icon-bg { transform: scale(1.1) rotate(-5deg); opacity: 0.06; }
                .z-content { position: relative; z-index: 1; }

                .icon-glow-wrapper {
                    display: inline-flex; align-items: center; justify-content: center;
                    width: 48px; height: 48px; border-radius: 14px; margin-bottom: 12px;
                    background: var(--glow-bg); color: var(--glow-text);
                }

                .dash-widget-list { max-height: 250px; overflow-y: auto; padding-right: 5px; }
                .dash-widget-list::-webkit-scrollbar { width: 4px; }
                .dash-widget-list::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
                
                .table-premium th { background: var(--bg-body); color: var(--text-muted); font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; padding: 16px 14px; border-bottom: 2px solid var(--border-color); border-top: none; white-space: nowrap; position: sticky; top: 0; z-index: 10; }
                .table-premium td { padding: 14px 14px; vertical-align: middle; border-bottom: 1px solid var(--border-color); font-size: 14px; color: var(--text-dark); background: transparent; }
                .table-hover-premium tbody tr { transition: all 0.2s ease; }
                .table-hover-premium tbody tr:hover { background-color: var(--bg-body) !important; transform: scale(1.001); }

                /* Modern Date Picker */
                .search-box-modern {
                    background-color: var(--bg-surface); border: 1px solid var(--border-color);
                    border-radius: 50px; padding: 6px 6px 6px 16px; display: inline-flex; align-items: center;
                    position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.02); transition: all 0.3s;
                }
                .search-box-modern:hover { border-color: var(--primary); box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.1); }
                .search-box-modern input[type="date"] { position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 10; border: none; background: transparent; color: transparent;}
                .search-box-modern input[type="date"]::-webkit-calendar-picker-indicator { position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; margin: 0; padding: 0; cursor: pointer; opacity: 0; }
                
                /* Dark Mode Safeties */
                html[data-bs-theme="dark"] .search-box-modern { background-color: var(--bg-surface) !important; border-color: var(--border-color) !important; }
                html[data-bs-theme="dark"] .search-box-modern * { color: var(--text-dark) !important; }

                .btn-premium-action { background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-dark); transition: all 0.3s ease; }
                .btn-premium-action:hover { border-color: var(--primary); color: var(--primary); box-shadow: 0 4px 12px rgba(0,0,0,0.05); transform: translateY(-2px); }
            </style>

            <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 class="page-title text-primary" style="font-size: 28px; font-weight: 800;"><i class="fa-solid fa-chart-pie me-2"></i> แดชบอร์ดภาพรวม (Overview)</h2>
                    <p class="mt-1 mb-0 z-content" id="dash-date-text" style="color: var(--text-muted); font-size: 15px;">กำลังโหลดข้อมูลสถิติ...</p>
                </div>
                
                <div class="d-flex gap-2 align-items-center flex-wrap mt-3 mt-md-0">
                    
                    <div class="d-flex align-items-center p-1 rounded-pill shadow-sm" style="background-color: var(--bg-body); border: 1px solid var(--border-color);">
                        <div class="native-date-wrapper border-0 bg-transparent shadow-none px-3 m-0" style="min-width: 150px; justify-content: center;">
                            <i class="fa-solid fa-calendar-day text-primary me-2 position-relative" style="z-index: 1; pointer-events: none;"></i>
                            <span id="dashDateDisplay" class="fw-bold position-relative" style="font-family:'Prompt'; font-size: 15px; color: var(--text-dark); z-index: 1; pointer-events: none;">กำลังโหลด...</span>
                            <input type="date" id="dashDateSelector">
                        </div>
                        <button class="btn btn-primary rounded-pill px-4 ms-1 fw-bold shadow-sm" style="z-index: 15;" onclick="window.DashboardPage.setToday()">วันนี้</button>
                    </div>

                    <button class="btn btn-premium-action fw-bold shadow-sm rounded-pill px-4 ms-2" onclick="window.DashboardPage.printDashboard()">
                        <i class="fa-solid fa-print me-2 text-warning"></i>พิมพ์รายงาน
                    </button>
                </div>
            </div>
            
            <div class="row g-4 mb-4 align-items-stretch">
                <div class="col-md-6 col-xl-3 d-flex">
                    <div class="stat-card-premium p-4" style="--card-color: #0ea5e9;">
                        <i class="fa-solid fa-users stat-icon-bg" style="color: var(--text-dark);"></i>
                        <div class="d-flex justify-content-between mb-2 z-content">
                            <div class="fw-bold small text-uppercase" style="color: var(--text-muted); letter-spacing: 0.5px;">ผู้ป่วยทั้งหมด (Active)</div>
                            <div class="icon-glow-wrapper mb-0" style="--glow-bg: var(--bg-body); --glow-text: #0284c7; width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border-color);"><i class="fa-solid fa-users"></i></div>
                        </div>
                        <div class="fs-1 fw-bold z-content" style="color: var(--text-dark); letter-spacing: -1px;"><span id="dash-total-pt"><i class="fas fa-spinner fa-spin fs-4"></i></span> <span class="fs-6" style="color: var(--text-muted); letter-spacing: normal;">คน</span></div>
                        <div id="dash-rights-breakdown" class="rights-breakdown-container d-flex flex-column gap-2 mt-3 z-content" style="max-height: 95px; overflow-y: auto; padding-right: 5px;"></div>
                    </div>
                </div>

                <div class="col-md-6 col-xl-3 d-flex">
                    <div class="stat-card-premium p-4" style="--card-color: #f59e0b;">
                        <i class="fa-solid fa-bed-pulse stat-icon-bg" style="color: var(--text-dark);"></i>
                        <div class="d-flex justify-content-between mb-2 z-content">
                            <div class="fw-bold small text-uppercase" style="color: #d97706; letter-spacing: 0.5px;">คิวฟอกไตประจำวัน</div>
                            <div class="icon-glow-wrapper mb-0" style="--glow-bg: var(--bg-body); --glow-text: #d97706; width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border-color);"><i class="fa-solid fa-bed-pulse"></i></div>
                        </div>
                        <div class="fs-1 fw-bold mb-1 z-content" style="color: #d97706; letter-spacing: -1px;"><span id="dash-total-visit"><i class="fas fa-spinner fa-spin fs-4"></i></span> <span class="fs-6" style="color: #d97706; letter-spacing: normal;">รอบ</span></div>
                        
                        <div class="d-flex flex-column gap-2 mt-auto pt-2 z-content" id="dash-visit-sub-text">
                            <div class="small fw-bold" style="color: var(--warning);"><i class="fas fa-clock fa-spin me-1"></i> กำลังคำนวณ...</div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 col-xl-3 d-flex">
                    <div class="stat-card-premium p-4" style="--card-color: #8b5cf6;">
                        <i class="fa-solid fa-bolt stat-icon-bg" style="color: var(--text-dark);"></i>
                        <div class="d-flex justify-content-between mb-2 z-content">
                            <div class="fw-bold small text-uppercase" style="color: var(--text-muted); letter-spacing: 0.5px;">การใช้เครื่องนวัตกรรม</div>
                            <div class="icon-glow-wrapper mb-0" style="--glow-bg: var(--bg-body); --glow-text: #6d28d9; width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border-color);"><i class="fa-solid fa-bolt"></i></div>
                        </div>
                        <div class="fs-1 fw-bold mb-1 z-content" style="color: var(--text-dark); letter-spacing: -1px;"><span id="dash-total-online"><i class="fas fa-spinner fa-spin fs-4"></i></span> <span class="fs-6" style="color: var(--text-muted); letter-spacing: normal;">เครื่อง</span></div>
                        <div class="mt-auto pt-2 z-content">
                            <span class="badge bg-primary-subtle text-primary-emphasis border border-primary-subtle px-3 py-2 rounded-pill w-100 text-start" style="font-size: 13px;"><i class="fa-solid fa-circle-nodes me-2"></i> ระบบ Online HDF</span>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 col-xl-3 d-flex">
                    <div class="stat-card-premium p-4" style="--card-color: #10b981;">
                        <i class="fa-solid fa-hand-holding-dollar stat-icon-bg" style="color: var(--text-dark);"></i>
                        <div class="d-flex justify-content-between mb-2 z-content">
                            <div class="fw-bold small text-uppercase" style="color: #059669; letter-spacing: 0.5px;">รายรับจากคิว (วันนี้)</div>
                            <div class="icon-glow-wrapper mb-0" style="--glow-bg: var(--bg-body); --glow-text: #059669; width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border-color);"><i class="fa-solid fa-hand-holding-dollar"></i></div>
                        </div>
                        <div class="fs-1 fw-bold mb-1 z-content" style="color: #059669; letter-spacing: -1px;"><span class="fs-4 me-1">฿</span><span id="dash-total-income"><i class="fas fa-spinner fa-spin fs-4"></i></span></div>
                        <div class="mt-auto pt-2 z-content">
                            <span class="badge bg-success-subtle text-success-emphasis border border-success-subtle px-3 py-2 rounded-pill w-100 text-start" style="font-size: 13px;"><i class="fa-solid fa-bolt text-warning me-2"></i> Real-time Sync</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-4 pb-4">
                <div class="col-xl-5">
                    <div class="modern-panel p-4 shadow-sm h-100" style="border-radius: 24px; background-color: var(--bg-surface); border: 1px solid var(--border-color);">
                        <h5 class="fw-bold mb-4" style="color: var(--text-dark);"><i class="fa-solid fa-chart-simple text-primary me-2"></i> สถิติสิทธิการรักษา (Active)</h5>
                        <div style="height: 280px; width: 100%; position: relative;">
                            <canvas id="rightsChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="col-xl-7">
                    <div class="modern-panel p-4 shadow-sm h-100 d-flex flex-column" style="border-radius: 24px; background-color: var(--bg-surface); border: 1px solid var(--border-color);">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="fw-bold mb-0" style="color: var(--text-dark);"><i class="fa-solid fa-list-check text-warning me-2"></i> สถานะเตียงและการตรวจ <span id="dash-bed-live-badge" class="badge bg-danger ms-2 shadow-sm badge-live-pulse" style="display:none; border-radius: 6px;">LIVE</span></h5>
                        </div>
                        <div class="table-responsive rounded-4 border shadow-sm flex-grow-1" style="background-color: var(--bg-surface); border-color: var(--border-color) !important; max-height: 280px; overflow-y: auto;">
                            <table class="table table-premium table-hover-premium w-100 mb-0">
                                <thead>
                                    <tr>
                                        <th style="width: 15%;">เตียง</th>
                                        <th style="width: 35%;">ชื่อผู้ป่วย / HN</th>
                                        <th style="width: 30%;">รอบเวลา / สิทธิ</th>
                                        <th class="text-center" style="width: 20%;">สถานะ</th>
                                    </tr>
                                </thead>
                                <tbody id="dash-bed-status">
                                    <tr><td colspan="4" class="text-center py-5" style="color: var(--text-muted);"><i class="fas fa-spinner fa-spin fa-2x mb-3 text-primary"></i><br>กำลังดึงข้อมูลคิว...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="modern-panel p-4 shadow-sm h-100" style="border-radius: 24px; border-top: 5px solid var(--danger); background-color: var(--bg-surface); border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h5 class="fw-bold mb-0" style="color: var(--danger);"><i class="fa-solid fa-triangle-exclamation text-danger me-2"></i> แจ้งเตือนพัสดุใกล้หมด</h5>
                            <button class="btn btn-sm btn-premium-action rounded-pill px-3 fw-bold" onclick="window.App.switchPage('inventory')">ไปคลังพัสดุ <i class="fa-solid fa-arrow-right ms-1"></i></button>
                        </div>
                        <div id="dash-low-stock-list" class="dash-widget-list d-flex flex-column gap-2 pe-2">
                            <div class="text-center py-4" style="color: var(--text-muted);"><i class="fas fa-spinner fa-spin"></i></div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="modern-panel p-4 shadow-sm h-100" style="border-radius: 24px; border-top: 5px solid var(--success); background-color: var(--bg-surface); border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h5 class="fw-bold mb-0" style="color: var(--success);"><i class="fa-solid fa-wallet text-success me-2"></i> สรุปการเงินเดือนนี้ (MTD)</h5>
                            <button class="btn btn-sm btn-premium-action rounded-pill px-3 fw-bold" onclick="window.App.switchPage('finance')">ดูสมุดบัญชี <i class="fa-solid fa-arrow-right ms-1"></i></button>
                        </div>
                        <div id="dash-finance-widget" class="d-flex flex-column justify-content-center h-100 pb-3">
                            <div class="text-center py-4" style="color: var(--text-muted);"><i class="fas fa-spinner fa-spin"></i></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    init() {
        if (typeof db === 'undefined' || typeof firebase === 'undefined') {
            this.showDashboardError("ไม่พบการเชื่อมต่อฐานข้อมูล");
            return;
        }

        const dateInput = document.getElementById('dashDateSelector');
        if(dateInput) {
            dateInput.value = this.state.selectedDate;
            this.updateDateDisplay(this.state.selectedDate); 
            dateInput.addEventListener('change', this.boundHandleDateChange);
        }

        if (firebase.auth().currentUser) {
            this.#fetchAllDashboardData();
        } else {
            const unsub = firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    unsub(); 
                    this.#fetchAllDashboardData(); 
                } else {
                    this.showDashboardError("กำลังรอตรวจสอบสิทธิ์การเข้าถึง...");
                }
            });
        }
    }

    destroy() {
        const dateInput = document.getElementById('dashDateSelector');
        if (dateInput) {
            dateInput.removeEventListener('change', this.boundHandleDateChange);
        }

        this.firebaseListeners.forEach(listener => {
            db.ref(listener.path).off('value', listener.callback);
        });
        this.firebaseListeners = [];
        
        if (this.myChartInstance) {
            this.myChartInstance.destroy();
            this.myChartInstance = null;
        }
    }

    #handleDateChange(e) {
        this.state.selectedDate = e.target.value;
        this.updateDateDisplay(this.state.selectedDate); 
        this.loadVisitsData();
    }

    #fetchAllDashboardData() {
        const onFirebaseError = (error) => {
            console.error("🔥 [Firebase Error]:", error);
            this.showDashboardError("ฐานข้อมูลปฏิเสธการเข้าถึง (Permission Denied)");
        };

        const currentMonthPrefix = new Date().toISOString().slice(0, 7);
        const startOfMonth = `${currentMonthPrefix}-01`;
        const endOfMonth = `${currentMonthPrefix}-31T23:59:59`; 

        try {
            // 1. ผู้ป่วย
            const refPatients = db.ref('patients_database_v2/patients');
            const cbPatients = refPatients.on('value', snap => {
                const data = snap.val();
                let rawPatients = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
                let activePatients = rawPatients.filter(p => p !== null && p.status !== 'ย้ายคลินิก' && p.status !== 'เสียชีวิต');
                
                this.state.allPatients = activePatients;
                const ptEl = document.getElementById('dash-total-pt');
                if (ptEl) ptEl.innerText = activePatients.length.toLocaleString();

                let rightsCount = {};
                activePatients.forEach(p => {
                    let r = p.right || 'ไม่ระบุสิทธิ';
                    rightsCount[r] = (rightsCount[r] || 0) + 1;
                });
                this.renderRightsChart(Object.keys(rightsCount), Object.values(rightsCount));
                this.renderRightsBreakdownUI(rightsCount);
            }, onFirebaseError);
            this.firebaseListeners.push({ path: 'patients_database_v2/patients', callback: cbPatients });

            // 2. คิวฟอกไต
            const refVisits = db.ref('patients_database_v2/visits').orderByChild('date').startAt(startOfMonth).endAt(endOfMonth);
            const cbVisits = refVisits.on('value', snap => {
                const data = snap.val();
                let raw = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
                this.state.allVisits = raw.filter(v => v !== null);
                this.loadVisitsData(); 
                this.renderFinanceWidget(); 
            }, onFirebaseError);
            this.firebaseListeners.push({ path: 'patients_database_v2/visits', callback: cbVisits });

            // 3. พัสดุ
            const refItems = db.ref('inventory_database_v2/items');
            const cbItems = refItems.on('value', snap => {
                const data = snap.val();
                let itemsList = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])).filter(Boolean) : [];
                
                this.state.inventoryItems.clear(); 
                itemsList.forEach(item => {
                    if (item && item.id) this.state.inventoryItems.set(item.id, item); 
                });
                
                this.renderLowStockWidget();
                this.renderFinanceWidget(); 
            }, onFirebaseError);
            this.firebaseListeners.push({ path: 'inventory_database_v2/items', callback: cbItems });

            // 4. การใช้พัสดุ
            const refTrans = db.ref('inventory_database_v2/transactions').orderByChild('timestamp').startAt(startOfMonth).endAt(endOfMonth);
            const cbTrans = refTrans.on('value', snap => {
                const data = snap.val();
                this.state.stockTransactions = data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : [];
                this.renderFinanceWidget();
            }, onFirebaseError);
            this.firebaseListeners.push({ path: 'inventory_database_v2/transactions', callback: cbTrans });

            // 5. รายจ่าย
            const refExp = db.ref('clinic_expenses_v2').orderByChild('date').startAt(startOfMonth).endAt(endOfMonth);
            const cbExp = refExp.on('value', snap => {
                const data = snap.val();
                this.state.allExpenses = data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : [];
                this.renderFinanceWidget();
            }, onFirebaseError);
            this.firebaseListeners.push({ path: 'clinic_expenses_v2', callback: cbExp });

        } catch (fatalError) {
            this.showDashboardError("เกิดข้อผิดพลาดในการดึงข้อมูล");
        }
    }

    showDashboardError(msg) {
        const dateText = document.getElementById('dash-date-text');
        if(dateText) dateText.innerHTML = `<span class="text-danger fw-bold"><i class="fa-solid fa-triangle-exclamation"></i> ${msg}</span>`;
        
        document.querySelectorAll('.fa-spinner').forEach(el => {
            const parent = el.parentElement;
            if(parent) parent.innerHTML = `<span class="text-danger fs-6 fw-bold">0</span>`; 
        });
        
        const bedStatus = document.getElementById('dash-bed-status');
        if(bedStatus) bedStatus.innerHTML = `<tr><td colspan="4" class="text-center py-5" style="color: var(--text-muted);"><i class="fa-solid fa-box-open fa-2x mb-3 opacity-50"></i><br>ยังไม่มีข้อมูลในระบบ</td></tr>`;
        
        const lowStock = document.getElementById('dash-low-stock-list');
        if(lowStock) lowStock.innerHTML = `<div class="text-center py-4" style="color: var(--text-muted);">ยังไม่มีข้อมูล</div>`;
        
        const financeWidget = document.getElementById('dash-finance-widget');
        if(financeWidget) financeWidget.innerHTML = `<div class="text-center py-4" style="color: var(--text-muted);">ยังไม่มีข้อมูล</div>`;
    }

    updateDateDisplay(dateStr) {
        const display = document.getElementById('dashDateDisplay');
        if(!display || !dateStr) return;
        const dObj = new Date(dateStr);
        const thaiDate = `${String(dObj.getDate()).padStart(2,'0')}/${String(dObj.getMonth() + 1).padStart(2,'0')}/${dObj.getFullYear() + 543}`;
        display.innerText = thaiDate;
    }

    setToday() {
        const today = new Date();
        const tzo = today.getTimezoneOffset() * 60000;
        const localDate = (new Date(Date.now() - tzo)).toISOString().split('T')[0];
        
        const dateInput = document.getElementById('dashDateSelector');
        if(dateInput) {
            dateInput.value = localDate;
            this.state.selectedDate = localDate;
            this.updateDateDisplay(localDate); 
            this.loadVisitsData();
        }
    }

    loadVisitsData() {
        const dObj = new Date(this.state.selectedDate);
        const thaiDate = `${String(dObj.getDate()).padStart(2,'0')}/${String(dObj.getMonth() + 1).padStart(2,'0')}/${dObj.getFullYear() + 543}`;
        document.getElementById('dash-date-text').innerHTML = `<i class="fa-regular fa-calendar-check text-success me-1"></i> ข้อมูลสถิติประจำวันที่ <b style="color: var(--text-dark);">${thaiDate}</b>`;

        const todayISO = (new Date(Date.now() - new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        const badgeLive = document.getElementById('dash-bed-live-badge');
        if(badgeLive) badgeLive.style.display = (this.state.selectedDate === todayISO) ? 'inline-block' : 'none';

        let dailyVisits = this.state.allVisits.filter(v => v.date === this.state.selectedDate);
        
        if (document.getElementById('dash-total-visit')) document.getElementById('dash-total-visit').innerText = dailyVisits.length;

        let income = 0; let onlineCount = 0; let doneCount = 0; let processingCount = 0;

        dailyVisits.forEach(v => {
            let fee = parseFloat(String(v.dialysis_fee || 0).replace(/,/g, ''));
            if (fee > 0) income += fee;
            else if (v.status === "เสร็จสิ้น") income += 1500; 

            if (v.hd_mode && v.hd_mode.includes("Online")) onlineCount++;
            
            if (v.status === "เสร็จสิ้น") doneCount++;
            if (v.status === "กำลังฟอกไต") processingCount++;
        });

        if (document.getElementById('dash-total-online')) document.getElementById('dash-total-online').innerText = onlineCount;
        if (document.getElementById('dash-total-income')) document.getElementById('dash-total-income').innerText = income.toLocaleString();
        
        // 🚨 THE FIX: ใช้ Native Bootstrap Subtle Classes แก้ปัญหาแถบสีขาวบนโหมดมืด
        if (document.getElementById('dash-visit-sub-text')) {
            document.getElementById('dash-visit-sub-text').innerHTML = `
                <div class="d-flex justify-content-between align-items-center px-3 py-2 rounded-pill shadow-sm bg-success-subtle border border-success-subtle">
                    <span class="text-success-emphasis fw-bold" style="font-size: 13px;"><i class="fa-solid fa-check-double me-1"></i>เสร็จสิ้นแล้ว</span>
                    <span class="badge bg-success rounded-pill px-2 text-white">${doneCount}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center px-3 py-2 rounded-pill shadow-sm mt-2 bg-warning-subtle border border-warning-subtle">
                    <span class="fw-bold text-warning-emphasis" style="font-size: 13px;"><i class="fa-solid fa-spinner fa-spin me-1"></i>กำลังฟอกไต</span>
                    <span class="badge bg-warning rounded-pill px-2 text-dark">${processingCount}</span>
                </div>
            `;
        }

        let bedHtml = "";
        if (dailyVisits.length === 0) {
            bedHtml = `<tr><td colspan="4" class="text-center py-5" style="color: var(--text-muted);"><i class="fa-solid fa-bed fa-3x mb-3" style="opacity:0.2"></i><br>ไม่มีผู้ป่วยเปิดคิวในวันที่เลือก</td></tr>`;
        } else {
            let sortedVisits = dailyVisits.sort((a, b) => {
                if (a.status === 'กำลังฟอกไต' && b.status !== 'กำลังฟอกไต') return -1;
                if (a.status !== 'กำลังฟอกไต' && b.status === 'กำลังฟอกไต') return 1;
                return (b.time || "").localeCompare(a.time || ""); 
            });

            sortedVisits.forEach(v => {
                // 🚨 THE FIX: ใช้ Subtle Classes ให้สอดคล้องกับ Dark Mode อย่างสวยงาม
                let statusClass = "bg-info-subtle text-info-emphasis border border-info-subtle";
                let statusTxt = v.status || "รอตรวจ";
                if (statusTxt === "กำลังฟอกไต") statusClass = "bg-warning-subtle text-warning-emphasis border border-warning-subtle";
                if (statusTxt === "เสร็จสิ้น") statusClass = "bg-success-subtle text-success-emphasis border border-success-subtle opacity-75";

                bedHtml += `
                <tr>
                    <td class="text-center"><span class="badge px-3 py-2 rounded-pill shadow-sm" style="font-size: 13px; background-color: var(--bg-body); color: var(--text-dark); border: 1px solid var(--border-color);">เตียง ${this.#escapeHTML(v.bed || '-')}</span></td>
                    <td>
                        <div class="fw-bold text-truncate" style="font-size: 14.5px; font-family: 'Prompt'; max-width: 150px; color: var(--text-dark);">${this.#escapeHTML(v.name || 'ไม่ระบุชื่อ')}</div>
                        <div class="small mt-1" style="color: var(--text-muted);"><i class="fa-solid fa-id-card text-primary me-1"></i> ${this.#escapeHTML(v.hn || '-')}</div>
                    </td>
                    <td>
                        <div class="fw-bold text-primary mb-1"><i class="fa-regular fa-clock me-1" style="color: var(--text-muted);"></i> ${this.#escapeHTML(v.time || '-')} น.</div>
                        <span class="badge border shadow-sm rounded-pill px-2" style="background-color: var(--bg-body); color: var(--text-dark); border-color: var(--border-color) !important; font-weight: 500;">${this.#escapeHTML(v.right || '-')}</span>
                    </td>
                    <td class="text-center"><span class="badge ${statusClass} px-3 py-2 rounded-pill shadow-sm" style="font-size: 12.5px;">${statusTxt}</span></td>
                </tr>`;
            });
        }
        if (document.getElementById('dash-bed-status')) document.getElementById('dash-bed-status').innerHTML = bedHtml;
    }

    renderRightsBreakdownUI(rightsCount) {
        const container = document.getElementById('dash-rights-breakdown');
        if (!container) return;
        const colorMap = { 'บัตรทอง (สปสช.)': 'success', 'ประกันสังคม': 'warning', 'เบิกจ่ายตรง (กรมบัญชีกลาง)': 'info', 'ชำระเงินเอง': 'primary' };
        let sortedRights = Object.entries(rightsCount).sort((a, b) => b[1] - a[1]);
        
        let html = '';
        sortedRights.forEach(([rightName, count]) => {
            let colorTheme = colorMap[rightName] || 'secondary';
            // 🚨 THE FIX: ใช้ Subtle classes แทน var(--bg-body) แข็งๆ เพื่อความสวยงามในโหมดมืด
            html += `
                <div class="d-flex justify-content-between align-items-center rounded-pill px-3 py-1 shadow-sm bg-${colorTheme}-subtle border border-${colorTheme}-subtle" style="font-size: 12.5px;">
                    <span class="fw-bold text-truncate text-${colorTheme}-emphasis" style="max-width: 75%;" title="${this.#escapeHTML(rightName)}">${this.#escapeHTML(rightName)}</span>
                    <span class="badge bg-${colorTheme} text-white rounded-pill shadow-sm">${count}</span>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    renderRightsChart(labels, values) {
        const ctx = document.getElementById('rightsChart');
        if (!ctx) return;
        if (this.myChartInstance) this.myChartInstance.destroy();

        const ChartEngine = typeof Chart !== 'undefined' ? Chart : window.Chart;
        if (!ChartEngine) return;

        // ดึงค่า Theme มาใช้เป็นสีเส้นขอบกราฟ ถ้าหาไม่เจอให้เดาจาก Attribute
        let themeTextColor = getComputedStyle(document.documentElement).getPropertyValue('--text-dark').trim();
        let themeBgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-surface').trim();
        
        const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        if (!themeTextColor) themeTextColor = isDark ? '#f8fafc' : '#334155';
        if (!themeBgColor) themeBgColor = isDark ? '#1e293b' : '#ffffff';

        this.myChartInstance = new ChartEngine(ctx, {
            type: 'doughnut',
            data: { 
                labels: labels, 
                datasets: [{ 
                    data: values, 
                    backgroundColor: ['#10b981', '#f59e0b', '#0ea5e9', '#6366f1', '#ec4899', '#8b5cf6'], 
                    borderWidth: 3, 
                    borderColor: themeBgColor,
                    hoverOffset: 6
                }] 
            },
            options: { 
                responsive: true, maintainAspectRatio: false, 
                plugins: { legend: { position: 'right', labels: { color: themeTextColor, boxWidth: 15, padding: 20, font: { family: 'Prompt', size: 13 }, usePointStyle: true, pointStyle: 'circle' } } }, 
                cutout: '70%', animation: { animateScale: true, animateRotate: true }
            }
        });
    }

    renderLowStockWidget() {
        const container = document.getElementById('dash-low-stock-list');
        if (!container) return;

        let lowStocks = [];
        this.state.inventoryItems.forEach((val, key) => {
            let i = val;
            let qMain = i.qty_main !== undefined ? Number(i.qty_main) : (Number(i.qty) || 0);
            let mMain = Number(i.min_main) || 0;
            if (qMain <= mMain) { lowStocks.push({ name: i.name, qty: qMain, unit: i.unit, type: 'สต๊อกใหญ่' }); }
        });

        if (lowStocks.length === 0) {
            container.innerHTML = `<div class="text-center text-success py-5"><i class="fa-solid fa-circle-check fa-3x mb-3 opacity-50"></i><br><span class="fw-bold">พัสดุในคลังเพียงพอทุกรายการ</span></div>`;
            return;
        }

        lowStocks.sort((a, b) => a.qty - b.qty);
        let html = '';
        lowStocks.slice(0, 5).forEach(item => { 
            // 🚨 THE FIX: นำ Subtle Danger เข้ามาใช้แทนสีแดงอ่อน Hardcode
            html += `
                <div class="d-flex justify-content-between align-items-center p-3 rounded-4 mb-2 shadow-sm bg-danger-subtle border border-danger-subtle">
                    <div>
                        <div class="fw-bold text-truncate text-danger-emphasis" style="max-width:200px; font-size:14px;">${this.#escapeHTML(item.name)}</div>
                        <div class="small mt-1 text-danger-emphasis opacity-75"><i class="fa-solid fa-warehouse me-1"></i> ${item.type}</div>
                    </div>
                    <div class="badge bg-danger text-white px-3 py-2 rounded-pill shadow-sm" style="font-size:13px;">เหลือ ${item.qty} ${this.#escapeHTML(item.unit||'')}</div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    renderFinanceWidget() {
        const container = document.getElementById('dash-finance-widget');
        if (!container) return;

        const currentMonthPrefix = new Date().toISOString().slice(0, 7); 
        
        let mIncome = 0;
        this.state.allVisits.filter(v => v.date && v.date.startsWith(currentMonthPrefix) && v.status === "เสร็จสิ้น").forEach(v => {
            let fee = parseFloat(String(v.dialysis_fee || 0).replace(/,/g, ''));
            mIncome += (fee > 0 ? fee : 1500);
        });

        let aggregatedStockCosts = 0;
        this.state.stockTransactions.forEach(log => {
            if (log.mode === 'out_sub' && log.note && log.note.includes("ตัดเบิก Flowsheet")) {
                const item = this.state.inventoryItems.get(log.itemId);
                const costPerUnit = item && item.price ? Number(item.price) : 0; 
                aggregatedStockCosts += (costPerUnit * Number(log.qty));
            }
        });

        let mExpense = 0;
        this.state.allExpenses.forEach(e => {
            mExpense += Number(e.amount) || 0;
        });
        
        mExpense += aggregatedStockCosts; 

        let net = mIncome - mExpense;
        // 🚨 THE FIX: จัดการสีโหมดมืด (Dark Mode Support) ของกล่องกำไรสุทธิ
        let netColor = net >= 0 ? 'text-success-emphasis' : 'text-danger-emphasis';
        let netIcon = net >= 0 ? 'fa-arrow-trend-up text-success' : 'fa-arrow-trend-down text-danger';
        let netBg = net >= 0 ? 'bg-success-subtle border-success-subtle' : 'bg-danger-subtle border-danger-subtle';
        
        let total = mIncome + mExpense;
        let inPct = total > 0 ? (mIncome / total) * 100 : 50;
        let exPct = total > 0 ? (mExpense / total) * 100 : 50;

        container.innerHTML = `
            <div class="d-flex justify-content-between mb-3 px-2">
                <div><div class="small fw-bold text-success mb-1"><i class="fa-solid fa-arrow-turn-down me-1" style="transform:rotate(90deg);"></i> รายรับรวม</div><h4 class="fw-bold mb-0" style="color: var(--text-dark);">฿${mIncome.toLocaleString(undefined, {minimumFractionDigits:0})}</h4></div>
                <div class="text-end"><div class="small fw-bold text-danger mb-1"><i class="fa-solid fa-arrow-turn-up me-1" style="transform:rotate(90deg);"></i> รายจ่ายรวม</div><h4 class="fw-bold mb-0" style="color: var(--text-dark);">฿${mExpense.toLocaleString(undefined, {minimumFractionDigits:0})}</h4></div>
            </div>
            <div class="progress shadow-sm mb-4" style="height: 12px; border-radius: 20px; background-color: var(--border-color);">
                <div class="progress-bar bg-success" role="progressbar" style="width: ${inPct}%" title="รายรับ ${inPct.toFixed(0)}%"></div>
                <div class="progress-bar bg-danger" role="progressbar" style="width: ${exPct}%" title="รายจ่าย ${exPct.toFixed(0)}%"></div>
            </div>
            <div class="text-center p-3 rounded-4 shadow-sm border ${netBg}">
                <div class="fw-bold small text-uppercase mb-1" style="color: var(--text-muted);"><i class="fa-solid fa-scale-balanced me-1"></i> กำไรสุทธิเดือนนี้</div>
                <h2 class="fw-bold ${netColor} mb-0 mt-2" style="font-family:'Prompt';"><i class="fa-solid ${netIcon} me-2 opacity-75"></i> ฿${net.toLocaleString(undefined, {minimumFractionDigits:2})}</h2>
            </div>
        `;
    }

    printDashboard() {
        const dObj = new Date(this.state.selectedDate);
        const thaiDate = `${dObj.getDate()}/${dObj.getMonth() + 1}/${dObj.getFullYear() + 543}`;
        
        let dailyVisits = this.state.allVisits.filter(v => v.date === this.state.selectedDate);
        let sortedVisits = dailyVisits.sort((a, b) => (b.time || "").localeCompare(a.time || ""));
        
        let income = 0; let onlineCount = 0;
        sortedVisits.forEach(v => {
            let fee = parseFloat(String(v.dialysis_fee || 0).replace(/,/g, ''));
            if (fee > 0) income += fee; else if (v.status === "เสร็จสิ้น") income += 1500; 
            if (v.hd_mode && v.hd_mode.includes("Online")) onlineCount++;
        });

        let tbodyHtml = '';
        if(sortedVisits.length === 0) {
            tbodyHtml = `<tr><td colspan="5" style="text-align:center; padding: 20px;">ไม่มีคิวผู้ป่วยในวันนี้</td></tr>`;
        } else {
            sortedVisits.forEach((v, idx) => {
                tbodyHtml += `
                    <tr>
                        <td style="text-align: center; border: 1px solid #000; padding: 8px;">${idx+1}</td>
                        <td style="text-align: center; border: 1px solid #000; padding: 8px;">เตียง ${this.#escapeHTML(v.bed || '-')}</td>
                        <td style="border: 1px solid #000; padding: 8px;">${this.#escapeHTML(v.name || '-')} (HN: ${this.#escapeHTML(v.hn)})</td>
                        <td style="text-align: center; border: 1px solid #000; padding: 8px;">${this.#escapeHTML(v.time || '-')} น.</td>
                        <td style="text-align: center; border: 1px solid #000; padding: 8px;">${this.#escapeHTML(v.status || 'รอตรวจ')}</td>
                    </tr>
                `;
            });
        }

        db.ref('clinic_settings_v2').once('value', snap => {
            const settings = snap.val() || { clinic_name: "DIALYSIS PRO CLINIC" };
            
            const htmlContent = `
                <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px;">
                    <h2 style="font-size: 24px; font-weight: 700; margin: 0;">${this.#escapeHTML(settings.clinic_name)}</h2>
                    <h3 style="font-size: 18px; margin: 5px 0 0 0;">รายงานสรุปการให้บริการประจำวัน</h3>
                    <div style="margin-top: 5px;">ประจำวันที่: ${thaiDate} | พิมพ์เมื่อ: ${new Date().toLocaleTimeString('th-TH')} น.</div>
                </div>

                <div style="display: flex; gap: 15px; margin-bottom: 30px;">
                    <div style="flex: 1; border: 1px solid #000; padding: 15px; text-align: center; border-radius: 8px;">ผู้ป่วย Active<div style="font-size: 22px; font-weight: bold; margin-top: 5px;">${this.state.allPatients.length} คน</div></div>
                    <div style="flex: 1; border: 1px solid #000; padding: 15px; text-align: center; border-radius: 8px;">คิวฟอกวันนี้<div style="font-size: 22px; font-weight: bold; margin-top: 5px;">${dailyVisits.length} รอบ</div></div>
                    <div style="flex: 1; border: 1px solid #000; padding: 15px; text-align: center; border-radius: 8px;">ใช้ Online HDF<div style="font-size: 22px; font-weight: bold; margin-top: 5px;">${onlineCount} รอบ</div></div>
                    <div style="flex: 1; border: 1px solid #000; padding: 15px; text-align: center; border-radius: 8px;">ประมาณการรายรับ<div style="font-size: 22px; font-weight: bold; margin-top: 5px;">${income.toLocaleString()} บาท</div></div>
                </div>

                <h3 style="margin-bottom: 10px;">รายชื่อคิวฟอกเลือดประจำวัน</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #000; padding: 10px; background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact; width: 10%;">ลำดับ</th>
                            <th style="border: 1px solid #000; padding: 10px; background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact; width: 15%;">เบอร์เตียง</th>
                            <th style="border: 1px solid #000; padding: 10px; background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact; width: 40%;">ชื่อ-นามสกุล / HN</th>
                            <th style="border: 1px solid #000; padding: 10px; background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact; width: 15%;">รอบเวลา</th>
                            <th style="border: 1px solid #000; padding: 10px; background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact; width: 20%;">สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tbodyHtml}
                    </tbody>
                </table>
                <div style="text-align: right; margin-top: 50px;">
                    <p>ลงชื่อ .............................................................. ผู้จัดทำรายงาน</p>
                    <p style="margin-right: 50px;">( ........................................................ )</p>
                </div>
            `;
            
            Swal.fire({ title: 'กำลังเตรียมหน้าต่างพิมพ์...', html: 'กรุณารอสักครู่ เบราว์เซอร์กำลังโหลด...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
            
            let oldIframe = document.getElementById('hidden-dash-print-frame'); 
            if (oldIframe) { oldIframe.remove(); }
            
            let iframe = document.createElement('iframe'); 
            iframe.id = 'hidden-dash-print-frame'; 
            iframe.style.position = 'fixed'; iframe.style.right = '0'; iframe.style.bottom = '0'; iframe.style.width = '1px'; iframe.style.height = '1px'; iframe.style.border = '0'; 
            document.body.appendChild(iframe);
            
            let doc = iframe.contentWindow.document; 
            doc.open(); 
            doc.write(`
                <!DOCTYPE html>
                <html lang="th">
                <head>
                    <meta charset="UTF-8">
                    <title>พิมพ์รายงานคลินิก</title>
                    <style>
                        @page { size: A4 portrait; margin: 15mm; } 
                        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; box-sizing: border-box !important; }
                        body { background-color: #ffffff !important; margin: 0; padding: 0; color: #000; font-family: sans-serif; }
                    </style>
                </head>
                <body>
                    <div style="width: 100%; margin: 0 auto;">
                        ${htmlContent}
                    </div>
                </body>
                </html>
            `); 
            doc.close();

            iframe.onload = () => {
                Swal.close();
                try {
                    iframe.contentWindow.focus(); 
                    iframe.contentWindow.print(); 
                } catch(e) {
                    console.error("Print execution failed:", e);
                }
                setTimeout(() => { if(document.getElementById('hidden-dash-print-frame')) document.getElementById('hidden-dash-print-frame').remove(); }, 60000);
            };
        });
    }

    // 🛡️ Security Helper
    #escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
}

// 🌐 Expose Component สู่ระบบ Router
const DashboardPage = new DashboardPageComponent();
window.DashboardPage = DashboardPage;