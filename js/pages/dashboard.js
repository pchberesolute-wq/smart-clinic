// js/pages/dashboard.js
// 🚀 Enterprise Dashboard Component: Native Dark Mode Sync, Absolute Bindings & Zero-Leak Engine (v13.5 FULL)

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
                /* 🌟 Premium UI Overrides & Theme Variables */
                .rights-breakdown-container::-webkit-scrollbar { width: 4px; }
                .rights-breakdown-container::-webkit-scrollbar-track { background: transparent; }
                .rights-breakdown-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                html[data-bs-theme="dark"] .rights-breakdown-container::-webkit-scrollbar-thumb { background: #475569; }
                
                @keyframes pulse-live { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
                .badge-live-pulse { animation: pulse-live 2s infinite; }
                
                /* 👑 Premium Cards Base */
                .stat-card-premium { 
                    border-radius: 20px; 
                    padding: 24px; 
                    position: relative; 
                    background: var(--bg-surface); 
                    border: 1px solid rgba(0,0,0,0.04); 
                    box-shadow: 0 4px 15px rgba(0,0,0,0.03); 
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
                    height: 100%; 
                    display: flex; 
                    flex-direction: column; 
                    width: 100%;
                }
                .stat-card-premium:hover { 
                    transform: translateY(-4px); 
                    box-shadow: 0 15px 30px rgba(0,0,0,0.06); 
                }

                /* 🌙 DARK MODE OVERRIDES FOR CARDS */
                html[data-bs-theme="dark"] .stat-card-premium, 
                html[data-bs-theme="dark"] .modern-panel { 
                    background: #1e293b !important; 
                    border: 1px solid #334155 !important; 
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important; 
                }

                /* 👑 Icon Styles */
                .icon-glow-wrapper {
                    display: inline-flex; align-items: center; justify-content: center;
                    width: 36px; height: 36px; border-radius: 10px; margin-bottom: 0;
                    background: var(--glow-bg); color: var(--glow-text);
                    font-size: 16px;
                }
                html[data-bs-theme="dark"] .icon-glow-wrapper[style*="--glow-bg: #e0f2fe"] { background: rgba(2, 132, 199, 0.15) !important; }
                html[data-bs-theme="dark"] .icon-glow-wrapper[style*="--glow-bg: #ffedd5"] { background: rgba(234, 88, 12, 0.15) !important; }
                html[data-bs-theme="dark"] .icon-glow-wrapper[style*="--glow-bg: #f3e8ff"] { background: rgba(147, 51, 234, 0.15) !important; }
                html[data-bs-theme="dark"] .icon-glow-wrapper[style*="--glow-bg: #ecfdf5"] { background: rgba(22, 163, 74, 0.15) !important; }

                .dash-widget-list { max-height: 250px; overflow-y: auto; padding-right: 5px; }
                .dash-widget-list::-webkit-scrollbar { width: 4px; }
                .dash-widget-list::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
                
                /* 👑 Clean Table Styles */
                .table-hover-premium { border-collapse: separate; border-spacing: 0; width: 100%; }
                .table-hover-premium thead th { 
                    background-color: var(--bg-body); 
                    color: var(--text-muted); 
                    font-weight: 700; 
                    font-size: 13px; 
                    padding: 14px 16px; 
                    border-bottom: 2px solid var(--border-color); 
                    border-top: none; 
                    white-space: nowrap; 
                    position: sticky; top: 0; z-index: 10; 
                }
                .table-hover-premium td { padding: 14px 16px; vertical-align: middle; border-bottom: 1px solid var(--border-color); font-size: 14px; color: var(--text-dark); background: transparent; }
                .table-hover-premium tbody tr { transition: all 0.2s ease; }
                .table-hover-premium tbody tr:hover { background-color: var(--bg-body) !important; transform: scale(1.001); }
                
                /* 👑 Modern Date Picker Pill */
                .date-picker-pill {
                    background-color: var(--bg-surface);
                    border: 1px solid var(--border-color);
                    border-radius: 50px;
                    padding: 4px;
                    display: inline-flex;
                    align-items: center;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
                }

                .native-date-wrapper {
                    position: relative; display: inline-flex; align-items: center; padding: 4px 16px;
                }
                .native-date-wrapper input[type="date"] { position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 10; border: none; background: transparent; color: transparent;}
                .native-date-wrapper input[type="date"]::-webkit-calendar-picker-indicator { position: absolute; top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; margin: 0; padding: 0; cursor: pointer; opacity: 0; }

                /* 👑 Outline Buttons */
                .btn-outline-gold { background: var(--bg-surface); border: 1px solid #eab308; color: #ca8a04; transition: all 0.2s; }
                .btn-outline-gold:hover { background: #ca8a04; color: #ffffff !important; border-color: #ca8a04; transform: translateY(-1px); box-shadow: 0 4px 6px rgba(234, 179, 8, 0.1); }
                html[data-bs-theme="dark"] .btn-outline-gold:hover { background: #ca8a04; }

                .btn-outline-slate { background: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-muted); transition: all 0.2s; font-size: 13px;}
                .btn-outline-slate:hover { background: var(--bg-body); border-color: var(--primary); color: var(--primary); transform: translateY(-1px); }

                /* 🌙 DARK MODE SMART PILLS & BADGES */
                .smart-pill { padding: 8px 16px; border-radius: 50px; display: flex; align-items: center; justify-content: space-between; font-size: 13px; font-weight: 700; border: 1px solid; }
                .smart-pill.success { background-color: #dcfce7; border-color: #bbf7d0; color: #166534; }
                .smart-pill.warning { background-color: #fef3c7; border-color: #fde68a; color: #92400e; }
                .smart-pill.info { background-color: #eff6ff; border-color: #bfdbfe; color: #1e40af; }
                .smart-pill.alert { background-color: #fefce8; border-color: #fef08a; color: #b45309; }
                .smart-pill.danger { background-color: #fef2f2; border-color: #fecaca; color: #991b1b; }

                html[data-bs-theme="dark"] .smart-pill.success { background-color: rgba(22, 163, 74, 0.15); border-color: rgba(22, 163, 74, 0.3); color: #34d399; }
                html[data-bs-theme="dark"] .smart-pill.warning { background-color: rgba(217, 119, 6, 0.15); border-color: rgba(217, 119, 6, 0.3); color: #fbbf24; }
                html[data-bs-theme="dark"] .smart-pill.info { background-color: rgba(59, 130, 246, 0.15); border-color: rgba(59, 130, 246, 0.3); color: #60a5fa; }
                html[data-bs-theme="dark"] .smart-pill.alert { background-color: rgba(234, 179, 8, 0.15); border-color: rgba(234, 179, 8, 0.3); color: #facc15; }
                html[data-bs-theme="dark"] .smart-pill.danger { background-color: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.3); color: #f87171; }

                /* 🌙 DARK MODE SPECIFIC FIX FOR FINANCE NET BOX */
                .finance-net-box { padding: 15px; border-radius: 12px; text-align: center; border: 1px dashed; }
                .finance-net-box.positive { background-color: #f0fdf4; border-color: #bbf7d0; }
                .finance-net-box.negative { background-color: #fef2f2; border-color: #fecaca; }
                
                html[data-bs-theme="dark"] .finance-net-box.positive { background-color: rgba(22, 163, 74, 0.1) !important; border-color: rgba(22, 163, 74, 0.3) !important; }
                html[data-bs-theme="dark"] .finance-net-box.negative { background-color: rgba(239, 68, 68, 0.1) !important; border-color: rgba(239, 68, 68, 0.3) !important; }
            </style>

            <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 fade-in-up">
                <div>
                    <h2 class="page-title text-primary" style="font-size: 26px; font-weight: 800;"><i class="fa-solid fa-chart-pie me-2"></i> แดชบอร์ดภาพรวม (Overview)</h2>
                    <p class="mt-2 mb-0 fw-bold" id="dash-date-text" style="color: #059669; font-size: 14px;"><i class="fa-regular fa-calendar-check me-1"></i> ข้อมูลสถิติประจำวันที่ กำลังโหลด...</p>
                </div>
                
                <div class="d-flex gap-2 align-items-center flex-wrap mt-3 mt-md-0">
                    <div class="date-picker-pill">
                        <div class="native-date-wrapper border-0 bg-transparent shadow-none m-0" style="min-width: 140px; justify-content: center;">
                            <i class="fa-solid fa-calendar-day text-primary me-2 position-relative" style="z-index: 1; pointer-events: none;"></i>
                            <span id="dashDateDisplay" class="fw-bold position-relative" style="font-family:'Prompt'; font-size: 14px; color: var(--text-dark); z-index: 1; pointer-events: none;">กำลังโหลด...</span>
                            <input type="date" id="dashDateSelector">
                        </div>
                        <button class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" style="z-index: 15; padding-top: 6px; padding-bottom: 6px;" onclick="window.DashboardPage.setToday()">วันนี้</button>
                    </div>

                    <button class="btn btn-outline-gold fw-bold shadow-sm rounded-pill px-4 ms-1" onclick="window.DashboardPage.printDashboard()">
                        <i class="fa-solid fa-print me-2"></i>พิมพ์รายงาน
                    </button>
                </div>
            </div>
            
            <div class="row g-4 mb-4 align-items-stretch fade-in-up" style="animation-delay: 0.1s;">
                <div class="col-md-6 col-xl-3 d-flex">
                    <div class="stat-card-premium">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="fw-bold small text-uppercase" style="color: var(--text-muted); letter-spacing: 0.5px;">ผู้ป่วยทั้งหมด (ACTIVE)</div>
                            <div class="icon-glow-wrapper" style="--glow-bg: #e0f2fe; --glow-text: #0284c7;"><i class="fa-solid fa-user-group"></i></div>
                        </div>
                        <div class="fs-1 fw-bold mb-3" style="color: var(--text-dark); line-height: 1;"><span id="dash-total-pt"><i class="fas fa-spinner fa-spin fs-4"></i></span> <span class="fs-6" style="color: var(--text-muted);">คน</span></div>
                        <div id="dash-rights-breakdown" class="rights-breakdown-container d-flex flex-column gap-2 mt-auto" style="max-height: 120px; overflow-y: auto; padding-right: 2px;"></div>
                    </div>
                </div>

                <div class="col-md-6 col-xl-3 d-flex">
                    <div class="stat-card-premium">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="fw-bold small text-uppercase" style="color: var(--text-muted); letter-spacing: 0.5px;">คิวฟอกไตประจำวัน</div>
                            <div class="icon-glow-wrapper" style="--glow-bg: #ffedd5; --glow-text: #ea580c;"><i class="fa-solid fa-bed-pulse"></i></div>
                        </div>
                        <div class="fs-1 fw-bold mb-3" style="color: #ea580c; line-height: 1;"><span id="dash-total-visit"><i class="fas fa-spinner fa-spin fs-4"></i></span> <span class="fs-6" style="color: #ea580c;">รอบ</span></div>
                        
                        <div class="d-flex flex-column gap-2 mt-auto" id="dash-visit-sub-text">
                            <div class="smart-pill success">
                                <span><i class="fa-solid fa-check-double me-2"></i>เสร็จสิ้นแล้ว</span>
                                <span class="badge rounded-pill px-2 text-white" style="background-color: #15803d;">0</span>
                            </div>
                            <div class="smart-pill warning">
                                <span><i class="fa-solid fa-spinner fa-spin me-2"></i>กำลังฟอกไต</span>
                                <span class="badge rounded-pill px-2 text-white" style="background-color: #d97706;">0</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 col-xl-3 d-flex">
                    <div class="stat-card-premium">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="fw-bold small text-uppercase" style="color: var(--text-muted); letter-spacing: 0.5px;">การใช้เครื่องนวัตกรรม</div>
                            <div class="icon-glow-wrapper" style="--glow-bg: #f3e8ff; --glow-text: #9333ea;"><i class="fa-solid fa-bolt"></i></div>
                        </div>
                        <div class="fs-1 fw-bold mb-3" style="color: var(--text-dark); line-height: 1;"><span id="dash-total-online"><i class="fas fa-spinner fa-spin fs-4"></i></span> <span class="fs-6" style="color: var(--text-muted);">เครื่อง</span></div>
                        <div class="mt-auto">
                            <div class="smart-pill info justify-content-center">
                                <span><i class="fa-solid fa-circle-nodes me-2"></i>ระบบ Online HDF</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 col-xl-3 d-flex">
                    <div class="stat-card-premium">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="fw-bold small text-uppercase" style="color: var(--text-muted); letter-spacing: 0.5px;">รายรับจากคิว (วันนี้)</div>
                            <div class="icon-glow-wrapper" style="--glow-bg: #ecfdf5; --glow-text: #16a34a;"><i class="fa-solid fa-hand-holding-dollar"></i></div>
                        </div>
                        <div class="fs-1 fw-bold mb-3" style="color: #10b981; line-height: 1;"><span class="fs-4 me-1">฿</span><span id="dash-total-income"><i class="fas fa-spinner fa-spin fs-4"></i></span></div>
                        <div class="mt-auto">
                            <div class="smart-pill alert justify-content-center">
                                <span><i class="fa-solid fa-bolt text-warning me-2"></i>Real-time Sync</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-4 pb-4 fade-in-up" style="animation-delay: 0.2s;">
                <div class="col-xl-5">
                    <div class="modern-panel p-4 h-100" style="border-radius: 24px; background-color: var(--bg-surface); border: 1px solid var(--border-color);">
                        <h6 class="fw-bold mb-4" style="color: var(--text-dark); font-family: 'Prompt';"><i class="fa-solid fa-chart-simple text-primary me-2"></i> สถิติสิทธิการรักษา (Active)</h6>
                        <div style="height: 280px; width: 100%; position: relative;">
                            <canvas id="rightsChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="col-xl-7">
                    <div class="modern-panel p-4 h-100 d-flex flex-column" style="border-radius: 24px; background-color: var(--bg-surface); border: 1px solid var(--border-color);">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h6 class="fw-bold mb-0" style="color: var(--text-dark); font-family: 'Prompt';"><i class="fa-solid fa-list-check text-warning me-2"></i> สถานะเตียงและการตรวจ <span id="dash-bed-live-badge" class="badge bg-danger ms-2 shadow-sm badge-live-pulse" style="display:none; border-radius: 6px; font-size: 10px; letter-spacing: 0.5px;">LIVE</span></h6>
                        </div>
                        <div class="table-responsive flex-grow-1" style="max-height: 280px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 12px;">
                            <table class="table table-hover-premium w-100 mb-0">
                                <thead>
                                    <tr>
                                        <th style="width: 15%; text-align: center;">เตียง</th>
                                        <th style="width: 35%;">ชื่อผู้ป่วย / HN</th>
                                        <th style="width: 30%; text-align: center;">รอบเวลา / สิทธิ</th>
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
                    <div class="modern-panel p-4 h-100" style="border-radius: 24px; background-color: var(--bg-surface); border: 1px solid var(--border-color); border-bottom: 4px solid var(--danger);">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h6 class="fw-bold mb-0 text-danger" style="font-family: 'Prompt';"><i class="fa-solid fa-triangle-exclamation me-2"></i> แจ้งเตือนพัสดุใกล้หมด</h6>
                            <button class="btn btn-sm btn-outline-slate rounded-pill px-3 fw-bold" onclick="window.App.switchPage('inventory')">ไปคลังพัสดุ <i class="fa-solid fa-arrow-right ms-1"></i></button>
                        </div>
                        <div id="dash-low-stock-list" class="dash-widget-list d-flex flex-column gap-2 pe-2">
                            <div class="text-center py-4" style="color: var(--text-muted);"><i class="fas fa-spinner fa-spin"></i></div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="modern-panel p-4 h-100" style="border-radius: 24px; background-color: var(--bg-surface); border: 1px solid var(--border-color); border-bottom: 4px solid var(--success);">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h6 class="fw-bold mb-0 text-success" style="font-family: 'Prompt';"><i class="fa-solid fa-wallet me-2"></i> สรุปการเงินเดือนนี้ (MTD)</h6>
                            <button class="btn btn-sm btn-outline-slate rounded-pill px-3 fw-bold" onclick="window.App.switchPage('finance')">ดูสมุดบัญชี <i class="fa-solid fa-arrow-right ms-1"></i></button>
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

            const refVisits = db.ref('patients_database_v2/visits').orderByChild('date').startAt(startOfMonth).endAt(endOfMonth);
            const cbVisits = refVisits.on('value', snap => {
                const data = snap.val();
                let raw = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
                this.state.allVisits = raw.filter(v => v !== null);
                this.loadVisitsData(); 
                this.renderFinanceWidget(); 
            }, onFirebaseError);
            this.firebaseListeners.push({ path: 'patients_database_v2/visits', callback: cbVisits });

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

            const refTrans = db.ref('inventory_database_v2/transactions').orderByChild('timestamp').startAt(startOfMonth).endAt(endOfMonth);
            const cbTrans = refTrans.on('value', snap => {
                const data = snap.val();
                this.state.stockTransactions = data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : [];
                this.renderFinanceWidget();
            }, onFirebaseError);
            this.firebaseListeners.push({ path: 'inventory_database_v2/transactions', callback: cbTrans });

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
        
        const dateTextEl = document.getElementById('dash-date-text');
        if (dateTextEl) {
            dateTextEl.innerHTML = `<i class="fa-regular fa-calendar-check me-1"></i> ข้อมูลสถิติประจำวันที่ ${thaiDate}`;
        }

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
        
        if (document.getElementById('dash-visit-sub-text')) {
            document.getElementById('dash-visit-sub-text').innerHTML = `
                <div class="smart-pill success mb-1">
                    <span><i class="fa-solid fa-check-double me-2"></i>เสร็จสิ้นแล้ว</span>
                    <span class="badge rounded-pill px-2 text-white" style="background-color: #15803d;">${doneCount}</span>
                </div>
                <div class="smart-pill warning">
                    <span><i class="fa-solid fa-spinner fa-spin me-2"></i>กำลังฟอกไต</span>
                    <span class="badge rounded-pill px-2 text-white" style="background-color: #d97706;">${processingCount}</span>
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
                    <td class="text-center">
                        <div class="fw-bold text-primary mb-1"><i class="fa-regular fa-clock me-1" style="color: var(--text-muted);"></i> ${this.#escapeHTML(v.time || '-')} น.</div>
                        <span class="badge border shadow-sm rounded-pill px-2" style="background-color: var(--bg-body); color: var(--text-dark); border-color: var(--border-color) !important; font-weight: 500;">${this.#escapeHTML(v.right || '-')}</span>
                    </td>
                    <td class="text-center"><span class="badge ${statusClass} px-3 py-2 rounded-pill shadow-sm" style="font-size: 12.5px;">${statusTxt}</span></td>
                </tr>`;
            });
        }
        if (document.getElementById('dash-bed-status')) document.getElementById('dash-bed-status').innerHTML = bedHtml;
    }

    // 🚨 THE FIX: Unified Color Palette Engine (Theme-Aware)
    _getColorForRight(rightName) {
        const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        
        const palette = {
            'green': { subtleBg: isDark?'rgba(22, 163, 74, 0.15)':'#dcfce7', border: isDark?'rgba(22, 163, 74, 0.3)':'#bbf7d0', text: isDark?'#34d399':'#166534', badgeBg: '#15803d', badgeText: '#ffffff', hex: '#10b981' },
            'blue': { subtleBg: isDark?'rgba(59, 130, 246, 0.15)':'#dbeafe', border: isDark?'rgba(59, 130, 246, 0.3)':'#bfdbfe', text: isDark?'#60a5fa':'#1e40af', badgeBg: '#1d4ed8', badgeText: '#ffffff', hex: '#3b82f6' },
            'yellow': { subtleBg: isDark?'rgba(217, 119, 6, 0.15)':'#fef3c7', border: isDark?'rgba(217, 119, 6, 0.3)':'#fde68a', text: isDark?'#fbbf24':'#92400e', badgeBg: '#d97706', badgeText: '#ffffff', hex: '#f59e0b' },
            'purple': { subtleBg: isDark?'rgba(147, 51, 234, 0.15)':'#f3e8ff', border: isDark?'rgba(147, 51, 234, 0.3)':'#e9d5ff', text: isDark?'#c084fc':'#6b21a8', badgeBg: '#7e22ce', badgeText: '#ffffff', hex: '#8b5cf6' },
            'red': { subtleBg: isDark?'rgba(239, 68, 68, 0.15)':'#fee2e2', border: isDark?'rgba(239, 68, 68, 0.3)':'#fecaca', text: isDark?'#f87171':'#991b1b', badgeBg: '#b91c1c', badgeText: '#ffffff', hex: '#ef4444' },
            'gray': { subtleBg: isDark?'rgba(255, 255, 255, 0.05)':'#f8fafc', border: isDark?'rgba(255, 255, 255, 0.1)':'#e2e8f0', text: isDark?'#cbd5e1':'#334155', badgeBg: '#475569', badgeText: '#ffffff', hex: '#64748b' }
        };
        
        if (rightName.includes('บัตรทอง') || rightName.includes('สปสช')) return palette.green;
        if (rightName.includes('เบิกจ่ายตรง') || rightName.includes('บัญชีกลาง')) return palette.blue;
        if (rightName.includes('ประกันสังคม') || rightName.includes('ปส')) return palette.yellow;
        if (rightName.includes('ชำระเงิน') || rightName.includes('เงินสด')) return palette.gray;
        if (rightName.includes('อปท') || rightName.includes('ท้องถิ่น')) return palette.red;
        
        let hash = 0;
        for (let i = 0; i < rightName.length; i++) { hash = rightName.charCodeAt(i) + ((hash << 5) - hash); }
        let keys = Object.keys(palette);
        return palette[keys[Math.abs(hash) % keys.length]];
    }

    renderRightsBreakdownUI(rightsCount) {
        const container = document.getElementById('dash-rights-breakdown');
        if (!container) return;
        
        let sortedRights = Object.entries(rightsCount).sort((a, b) => b[1] - a[1]);
        
        let html = '';
        sortedRights.forEach(([rightName, count]) => {
            let colorData = this._getColorForRight(rightName);
            
            html += `
                <div class="d-flex justify-content-between align-items-center rounded-pill px-3 py-2 mb-1" style="background-color: ${colorData.subtleBg}; border: 1px solid ${colorData.border};">
                    <span class="fw-bold text-truncate" style="color: ${colorData.text}; font-size: 13px; max-width: 75%;" title="${this.#escapeHTML(rightName)}">${this.#escapeHTML(rightName)}</span>
                    <span class="badge rounded-pill shadow-sm" style="background-color: ${colorData.badgeBg}; color: ${colorData.badgeText}; font-size: 12px;">${count}</span>
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

        let themeTextColor = getComputedStyle(document.documentElement).getPropertyValue('--text-dark').trim();
        let themeBgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-surface').trim();
        
        const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        if (!themeTextColor) themeTextColor = isDark ? '#f8fafc' : '#334155';
        if (!themeBgColor) themeBgColor = isDark ? '#1e293b' : '#ffffff';

        let chartColors = labels.map(label => this._getColorForRight(label).hex);

        this.myChartInstance = new ChartEngine(ctx, {
            type: 'doughnut',
            data: { 
                labels: labels, 
                datasets: [{ 
                    data: values, 
                    backgroundColor: chartColors, 
                    borderWidth: 4, 
                    borderColor: themeBgColor,
                    hoverOffset: 6
                }] 
            },
            options: { 
                responsive: true, maintainAspectRatio: false, 
                plugins: { legend: { position: 'right', labels: { color: themeTextColor, boxWidth: 15, padding: 20, font: { family: 'Prompt', size: 13 }, usePointStyle: true, pointStyle: 'circle' } } }, 
                cutout: '65%', animation: { animateScale: true, animateRotate: true }
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
            if (qMain <= mMain) { lowStocks.push({ name: i.name, qty: qMain, unit: i.unit, type: 'คลังหลัก' }); }
        });

        if (lowStocks.length === 0) {
            container.innerHTML = `<div class="text-center text-success py-5"><i class="fa-solid fa-circle-check fa-3x mb-3 opacity-50"></i><br><span class="fw-bold">พัสดุในคลังเพียงพอทุกรายการ</span></div>`;
            return;
        }

        lowStocks.sort((a, b) => a.qty - b.qty);
        let html = '';
        lowStocks.slice(0, 5).forEach(item => { 
            html += `
                <div class="d-flex justify-content-between align-items-center p-3 rounded-3 mb-2 smart-pill danger">
                    <div>
                        <div class="fw-bold text-truncate" style="max-width:200px; font-size:13px;">${this.#escapeHTML(item.name)}</div>
                    </div>
                    <div class="fw-bold" style="font-size:13px;">เหลือ ${item.qty} ${this.#escapeHTML(item.unit||'')}</div>
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
        let netColor = net >= 0 ? 'text-success' : 'text-danger';
        let netIcon = net >= 0 ? 'fa-arrow-trend-up text-success' : 'fa-arrow-trend-down text-danger';
        let netClass = net >= 0 ? 'positive' : 'negative';
        
        let total = mIncome + mExpense;
        let inPct = total > 0 ? (mIncome / total) * 100 : 50;
        let exPct = total > 0 ? (mExpense / total) * 100 : 50;

        container.innerHTML = `
            <div class="d-flex justify-content-between mb-3 px-2">
                <div><div class="small fw-bold text-success mb-1"><i class="fa-solid fa-arrow-turn-down me-1" style="transform:rotate(90deg);"></i> รายรับรวม</div><h4 class="fw-bold mb-0" style="color: var(--text-dark);">฿${mIncome.toLocaleString(undefined, {minimumFractionDigits:0})}</h4></div>
                <div class="text-end"><div class="small fw-bold text-danger mb-1"><i class="fa-solid fa-arrow-turn-up me-1" style="transform:rotate(90deg);"></i> รายจ่ายรวม</div><h4 class="fw-bold mb-0" style="color: var(--text-dark);">฿${mExpense.toLocaleString(undefined, {minimumFractionDigits:0})}</h4></div>
            </div>
            <div class="progress mb-4" style="height: 10px; border-radius: 20px; background-color: var(--border-color); box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);">
                <div class="progress-bar bg-success" role="progressbar" style="width: ${inPct}%" title="รายรับ ${inPct.toFixed(0)}%"></div>
                <div class="progress-bar bg-danger" role="progressbar" style="width: ${exPct}%" title="รายจ่าย ${exPct.toFixed(0)}%"></div>
            </div>
            <div class="finance-net-box ${netClass}">
                <div class="fw-bold small text-uppercase mb-1" style="color: var(--text-muted);"><i class="fa-solid fa-scale-balanced me-1"></i> กำไรสุทธิเดือนนี้</div>
                <h3 class="fw-bold ${netColor} mb-0 mt-2" style="font-family:'Prompt';"><i class="fa-solid ${netIcon} me-2 opacity-75"></i> ฿${net.toLocaleString(undefined, {minimumFractionDigits:2})}</h3>
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