// js/pages/dashboard.js
// 🚀 Enterprise Dashboard Component: Theme Native, Memory-Leak Free, Big O Optimized

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
        this.firebaseListeners = []; // 🗑️ เก็บ Reference ไว้เคลียร์ขยะ (Garbage Collection)

        // Bind Context เพื่อให้ใช้งาน Event Listener ได้อย่างถูกต้อง
        this.boundHandleDateChange = this.#handleDateChange.bind(this);
    }

    get html() {
        return `
            <style>
                .rights-breakdown-container::-webkit-scrollbar { width: 4px; }
                .rights-breakdown-container::-webkit-scrollbar-track { background: transparent; }
                .rights-breakdown-container::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
                
                @keyframes pulse-live { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
                .badge-live-pulse { animation: pulse-live 2s infinite; }
                
                .stat-card-premium { border-radius: 20px; transition: all 0.3s; border: 1px solid var(--border-color); background-color: var(--bg-surface); display: flex; flex-direction: column; width: 100%; }
                .stat-card-premium:hover { transform: translateY(-5px); box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.1); border-color: var(--primary); }
                
                .stat-icon-bg { position: absolute; top: -15px; right: -15px; opacity: 0.04; font-size: 130px; pointer-events: none; z-index: 0; }
                .z-content { position: relative; z-index: 1; }

                .dash-widget-list { max-height: 250px; overflow-y: auto; }
                .dash-widget-list::-webkit-scrollbar { width: 4px; }
                .dash-widget-list::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
                
                /* 🚨 THE FIX: บังคับกล่องปฏิทินที่หลงเหลือสีขาวให้กลืนไปกับโหมดมืด (Dark Mode Native Override) */
                html[data-bs-theme="dark"] .search-box-modern {
                    background-color: var(--bg-surface) !important;
                    border-color: var(--border-color) !important;
                }
                html[data-bs-theme="dark"] .search-box-modern * {
                    color: var(--text-dark) !important;
                }
                html[data-bs-theme="dark"] #dashDateSelector::-webkit-calendar-picker-indicator {
                    filter: invert(1) !important;
                }
            </style>

            <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 class="page-title text-primary" style="font-size: 28px;"><i class="fa-solid fa-chart-pie me-2"></i> แดชบอร์ดภาพรวม (Overview)</h2>
                    <p class="mt-1 mb-0 z-content" id="dash-date-text" style="color: var(--text-muted);">กำลังโหลดข้อมูลสถิติ...</p>
                </div>
                
                <div class="d-flex gap-2 align-items-center flex-wrap mt-3 mt-md-0">
                    <div class="search-box-modern shadow-sm p-1 ps-3 d-flex align-items-center position-relative" style="width: auto; border-radius: 50px; background-color: var(--bg-surface); border: 1px solid var(--border-color);">
                        <input type="date" id="dashDateSelector" class="position-absolute" style="opacity: 0; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer; z-index: 10;" onfocus="this.showPicker && this.showPicker()">
                        <i class="fa-solid fa-calendar-day text-primary me-2 position-relative" style="z-index: 1; pointer-events: none;"></i>
                        <span id="dashDateDisplay" class="fw-bold position-relative" style="font-family:'Prompt'; min-width: 90px; text-align: center; z-index: 1; pointer-events: none; color: var(--text-dark);">กำลังโหลด...</span>
                        <button class="btn btn-premium-primary ms-3 py-1 px-3 shadow-sm position-relative" style="border-radius: 50px; font-size:14px; z-index: 20;" id="btnDashSetToday" onclick="App.pages.dashboard.setToday()" title="กลับมาวันที่ปัจจุบัน">วันนี้</button>
                    </div>

                    <button class="btn fw-bold shadow-sm rounded-pill px-4 ms-2 card-hover-float" id="btnDashPrint" style="background-color: var(--bg-surface); border: 1px solid var(--border-color); color: var(--text-dark);" onclick="App.pages.dashboard.printDashboard()">
                        <i class="fa-solid fa-print me-2 text-warning"></i>พิมพ์รายงาน
                    </button>
                </div>
            </div>
            
            <div class="row g-4 mb-4 align-items-stretch">
                <div class="col-md-6 col-xl-3 d-flex">
                    <div class="stat-card-premium p-4 shadow-sm position-relative overflow-hidden h-100" style="border-top: 4px solid var(--info);">
                        <i class="fa-solid fa-users stat-icon-bg" style="color: var(--text-dark);"></i>
                        <div class="d-flex justify-content-between mb-2 z-content">
                            <div class="fw-bold small text-uppercase" style="color: var(--text-muted);">ผู้ป่วยทั้งหมด (Active)</div>
                            <div class="rounded px-2 py-1 shadow-sm" style="background-color: var(--bg-body); color: var(--info); border: 1px solid var(--border-color);"><i class="fa-solid fa-users"></i></div>
                        </div>
                        <div class="fs-2 fw-bold z-content" style="color: var(--text-dark);"><span id="dash-total-pt"><i class="fas fa-spinner fa-spin"></i></span> <span class="fs-6" style="color: var(--text-muted);">คน</span></div>
                        <div id="dash-rights-breakdown" class="rights-breakdown-container d-flex flex-column gap-2 mt-3 z-content" style="max-height: 95px; overflow-y: auto; padding-right: 5px;"></div>
                    </div>
                </div>

                <div class="col-md-6 col-xl-3 d-flex">
                    <div class="stat-card-premium p-4 shadow-sm position-relative overflow-hidden h-100" style="border-top: 4px solid var(--warning);">
                        <i class="fa-solid fa-bed-pulse stat-icon-bg" style="color: var(--text-dark);"></i>
                        <div class="d-flex justify-content-between mb-2 z-content">
                            <div class="fw-bold small text-uppercase" style="color: var(--warning);">คิวฟอกไตประจำวัน</div>
                            <div class="rounded px-2 py-1 shadow-sm" style="background-color: var(--bg-body); color: var(--warning); border: 1px solid var(--border-color);"><i class="fa-solid fa-bed-pulse"></i></div>
                        </div>
                        <div class="fs-2 fw-bold mb-1 z-content" style="color: var(--warning);"><span id="dash-total-visit"><i class="fas fa-spinner fa-spin"></i></span> <span class="fs-6" style="color: var(--warning);">รอบ</span></div>
                        
                        <div class="d-flex flex-column gap-2 mt-auto pt-2 z-content" id="dash-visit-sub-text">
                            <div class="small fw-bold" style="color: var(--warning);"><i class="fas fa-clock fa-spin me-1"></i> กำลังคำนวณ...</div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 col-xl-3 d-flex">
                    <div class="stat-card-premium p-4 shadow-sm position-relative overflow-hidden h-100" style="border-top: 4px solid var(--primary);">
                        <i class="fa-solid fa-bolt stat-icon-bg" style="color: var(--text-dark);"></i>
                        <div class="d-flex justify-content-between mb-2 z-content">
                            <div class="fw-bold small text-uppercase" style="color: var(--text-muted);">การใช้เครื่องนวัตกรรม</div>
                            <div class="rounded px-2 py-1 shadow-sm" style="background-color: var(--bg-body); color: var(--primary); border: 1px solid var(--border-color);"><i class="fa-solid fa-bolt"></i></div>
                        </div>
                        <div class="fs-2 fw-bold mb-1 z-content" style="color: var(--text-dark);"><span id="dash-total-online"><i class="fas fa-spinner fa-spin"></i></span> <span class="fs-6" style="color: var(--text-muted);">เครื่อง</span></div>
                        <div class="mt-auto pt-2 z-content">
                            <span class="badge border px-3 py-2 rounded-pill shadow-sm w-100 text-start" style="font-size: 13px; background-color: var(--bg-body); color: var(--primary); border-color: var(--border-color) !important;"><i class="fa-solid fa-circle-nodes me-2"></i> ระบบ Online HDF</span>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 col-xl-3 d-flex">
                    <div class="stat-card-premium p-4 shadow-sm position-relative overflow-hidden h-100" style="border-top: 4px solid var(--success);">
                        <i class="fa-solid fa-hand-holding-dollar stat-icon-bg" style="color: var(--text-dark);"></i>
                        <div class="d-flex justify-content-between mb-2 z-content">
                            <div class="fw-bold small text-uppercase" style="color: var(--success);">รายรับจากคิว (วันนี้)</div>
                            <div class="rounded px-2 py-1 shadow-sm" style="background-color: var(--bg-body); color: var(--success); border: 1px solid var(--border-color);"><i class="fa-solid fa-hand-holding-dollar"></i></div>
                        </div>
                        <div class="fs-2 fw-bold mb-1 z-content" style="color: var(--success);"><span id="dash-total-income"><i class="fas fa-spinner fa-spin"></i></span> <span class="fs-6" style="color: var(--success);">฿</span></div>
                        <div class="mt-auto pt-2 z-content">
                            <span class="badge border px-3 py-2 rounded-pill shadow-sm w-100 text-start" style="font-size: 13px; background-color: var(--bg-body); color: var(--success); border-color: var(--border-color) !important;"><i class="fa-solid fa-bolt text-warning me-2"></i> Real-time Sync</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-4 pb-4">
                <div class="col-xl-5">
                    <div class="modern-panel p-4 shadow-sm h-100" style="border-radius: 20px; background-color: var(--bg-surface); border: 1px solid var(--border-color);">
                        <h5 class="fw-bold mb-4" style="color: var(--text-dark);"><i class="fa-solid fa-chart-simple text-primary me-2"></i> สถิติสิทธิการรักษา (Active)</h5>
                        <div style="height: 280px; width: 100%;">
                            <canvas id="rightsChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="col-xl-7">
                    <div class="modern-panel p-4 shadow-sm h-100 d-flex flex-column" style="border-radius: 20px; background-color: var(--bg-surface); border: 1px solid var(--border-color);">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="fw-bold mb-0" style="color: var(--text-dark);"><i class="fa-solid fa-list-check text-warning me-2"></i> สถานะเตียงและการตรวจ <span id="dash-bed-live-badge" class="badge badge-soft-danger ms-2 shadow-sm badge-live-pulse" style="display:none;">LIVE</span></h5>
                        </div>
                        <div class="table-responsive rounded-3 border shadow-sm flex-grow-1" style="background-color: var(--bg-surface); border-color: var(--border-color) !important; max-height: 280px; overflow-y: auto;">
                            <table class="table table-premium w-100 mb-0">
                                <thead style="position: sticky; top: 0; z-index: 10;">
                                    <tr>
                                        <th style="width: 15%; background-color: var(--bg-body); color: var(--text-dark); border-bottom: 1px solid var(--border-color);">เตียง</th>
                                        <th style="width: 35%; background-color: var(--bg-body); color: var(--text-dark); border-bottom: 1px solid var(--border-color);">ชื่อผู้ป่วย</th>
                                        <th style="width: 30%; background-color: var(--bg-body); color: var(--text-dark); border-bottom: 1px solid var(--border-color);">ข้อมูลรอบ/สิทธิ</th>
                                        <th class="text-center" style="width: 20%; background-color: var(--bg-body); color: var(--text-dark); border-bottom: 1px solid var(--border-color);">สถานะ</th>
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
                    <div class="modern-panel p-4 shadow-sm h-100" style="border-radius: 20px; border-top: 4px solid var(--danger); background-color: var(--bg-surface); border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="fw-bold mb-0" style="color: var(--danger);"><i class="fa-solid fa-triangle-exclamation text-danger me-2"></i> แจ้งเตือนพัสดุใกล้หมด (Low Stock)</h5>
                            <button class="btn btn-sm border fw-bold" style="background-color: var(--bg-body); color: var(--text-dark); border-color: var(--border-color) !important;" onclick="App.switchPage('inventory')">ไปคลังพัสดุ</button>
                        </div>
                        <div id="dash-low-stock-list" class="dash-widget-list d-flex flex-column gap-2 pe-2">
                            <div class="text-center py-4" style="color: var(--text-muted);"><i class="fas fa-spinner fa-spin"></i></div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="modern-panel p-4 shadow-sm h-100" style="border-radius: 20px; border-top: 4px solid var(--success); background-color: var(--bg-surface); border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="fw-bold mb-0" style="color: var(--success);"><i class="fa-solid fa-wallet text-success me-2"></i> สรุปการเงินเดือนนี้ (MTD)</h5>
                            <button class="btn btn-sm border fw-bold" style="background-color: var(--bg-body); color: var(--text-dark); border-color: var(--border-color) !important;" onclick="App.switchPage('finance')">ดูบัญชีเต็ม</button>
                        </div>
                        <div id="dash-finance-widget" class="d-flex flex-column justify-content-center h-100 pb-3">
                            <div class="text-center py-4" style="color: var(--text-muted);"><i class="fas fa-spinner fa-spin"></i></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 🚀 Lifecycle: Mount
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

    // 🧹 Lifecycle: Unmount
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

    // 🚀 Data Fetching
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

    // 🎨 UI Rendering Logic
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
        
        if (document.getElementById('dash-visit-sub-text')) {
            document.getElementById('dash-visit-sub-text').innerHTML = `
                <div class="d-flex justify-content-between align-items-center px-3 py-2 rounded-pill shadow-sm border border-success-subtle" style="background-color: var(--bg-body);">
                    <span class="text-success fw-bold" style="font-size: 13px;"><i class="fa-solid fa-check-double me-1"></i>เสร็จสิ้นแล้ว</span>
                    <span class="badge bg-success rounded-pill px-2">${doneCount}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center px-3 py-2 rounded-pill shadow-sm border border-warning-subtle" style="background-color: var(--bg-body);">
                    <span class="fw-bold" style="font-size: 13px; color: var(--warning);"><i class="fa-solid fa-spinner fa-spin me-1"></i>กำลังฟอกไต</span>
                    <span class="badge bg-warning text-dark rounded-pill px-2">${processingCount}</span>
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
                let statusClass = "badge-soft-info";
                let statusTxt = v.status || "รอตรวจ";
                if (statusTxt === "กำลังฟอกไต") statusClass = "badge-soft-warning";
                if (statusTxt === "เสร็จสิ้น") statusClass = "badge-soft-success opacity-75";

                bedHtml += `
                <tr>
                    <td><span class="badge px-3 py-2 rounded-pill shadow-sm" style="font-size: 13px; background-color: var(--bg-body); color: var(--text-dark); border: 1px solid var(--border-color);">เตียง ${this.#escapeHTML(v.bed || '-')}</span></td>
                    <td>
                        <div class="fw-bold text-truncate" style="font-size: 15px; font-family: 'Prompt'; max-width: 150px; color: var(--text-dark);">${this.#escapeHTML(v.name || 'ไม่ระบุชื่อ')}</div>
                        <div class="small" style="color: var(--text-muted);"><i class="fa-solid fa-id-card text-primary me-1"></i> ${this.#escapeHTML(v.hn || '-')}</div>
                    </td>
                    <td>
                        <div class="fw-bold text-primary mb-1"><i class="fa-regular fa-clock me-1" style="color: var(--text-muted);"></i> ${this.#escapeHTML(v.time || '-')} น.</div>
                        <span class="badge border shadow-sm" style="background-color: var(--bg-body); color: var(--text-dark); border-color: var(--border-color) !important;">${this.#escapeHTML(v.right || '-')}</span>
                    </td>
                    <td class="text-center"><span class="badge ${statusClass} px-3 py-2 rounded-pill shadow-sm" style="font-size: 12px;">${statusTxt}</span></td>
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
            html += `
                <div class="d-flex justify-content-between align-items-center rounded-pill px-3 py-1 shadow-sm border border-${colorTheme}-subtle" style="background-color: var(--bg-body); font-size: 12px;">
                    <span class="fw-bold text-truncate" style="max-width: 75%; color: var(--text-muted);" title="${this.#escapeHTML(rightName)}">${this.#escapeHTML(rightName)}</span>
                    <span class="badge bg-${colorTheme} rounded-pill">${count}</span>
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

        const themeTextColor = getComputedStyle(document.documentElement).getPropertyValue('--text-dark').trim() || '#334155';
        const themeBgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-surface').trim() || '#ffffff';

        this.myChartInstance = new ChartEngine(ctx, {
            type: 'doughnut',
            data: { 
                labels: labels, 
                datasets: [{ 
                    data: values, 
                    backgroundColor: ['#10b981', '#f59e0b', '#0ea5e9', '#4361ee', '#f72585', '#7209b7'], 
                    borderWidth: 3, 
                    borderColor: themeBgColor,
                    hoverOffset: 4
                }] 
            },
            options: { 
                responsive: true, maintainAspectRatio: false, 
                plugins: { legend: { position: 'right', labels: { color: themeTextColor, boxWidth: 15, padding: 20, font: { family: 'Prompt', size: 13 } } } }, 
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
            container.innerHTML = `<div class="text-center text-success py-4"><i class="fa-solid fa-circle-check fa-2x mb-2"></i><br>พัสดุในคลังเพียงพอทุกรายการ</div>`;
            return;
        }

        lowStocks.sort((a, b) => a.qty - b.qty);
        let html = '';
        lowStocks.slice(0, 5).forEach(item => { 
            html += `
                <div class="d-flex justify-content-between align-items-center p-2 border-bottom" style="border-color: var(--border-color) !important;">
                    <div>
                        <div class="fw-bold text-truncate" style="max-width:200px; font-size:14px; color: var(--text-dark);">${this.#escapeHTML(item.name)}</div>
                        <div class="small" style="color: var(--text-muted);">${item.type}</div>
                    </div>
                    <div class="badge badge-soft-danger px-3 py-2 rounded-pill shadow-sm" style="font-size:13px;">เหลือ ${item.qty} ${this.#escapeHTML(item.unit||'')}</div>
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
        let netColor = net >= 0 ? 'text-primary' : 'text-danger';
        let netIcon = net >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
        
        let total = mIncome + mExpense;
        let inPct = total > 0 ? (mIncome / total) * 100 : 50;
        let exPct = total > 0 ? (mExpense / total) * 100 : 50;

        container.innerHTML = `
            <div class="d-flex justify-content-between mb-2">
                <div><div class="small fw-bold text-success"><i class="fa-solid fa-plus-circle me-1"></i> รายรับรวม</div><h5 class="fw-bold mb-0" style="color: var(--text-dark);">฿${mIncome.toLocaleString()}</h5></div>
                <div class="text-end"><div class="small fw-bold text-danger"><i class="fa-solid fa-minus-circle me-1"></i> รายจ่ายรวม</div><h5 class="fw-bold mb-0" style="color: var(--text-dark);">฿${mExpense.toLocaleString()}</h5></div>
            </div>
            <div class="progress shadow-sm mb-4" style="height: 12px; border-radius: 20px;">
                <div class="progress-bar bg-success" role="progressbar" style="width: ${inPct}%" title="รายรับ ${inPct.toFixed(0)}%"></div>
                <div class="progress-bar bg-danger" role="progressbar" style="width: ${exPct}%" title="รายจ่าย ${exPct.toFixed(0)}%"></div>
            </div>
            <div class="text-center p-3 rounded-4 shadow-sm" style="background-color: var(--bg-body); border: 1px solid var(--border-color);">
                <div class="fw-bold small text-uppercase mb-1" style="color: var(--text-muted);">กำไรสุทธิเดือนนี้</div>
                <h3 class="fw-bold ${netColor} mb-0" style="font-family:'Prompt';"><i class="fa-solid ${netIcon} me-2"></i> ฿${net.toLocaleString()}</h3>
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
            tbodyHtml = `<tr><td colspan="5" style="text-align:center;">ไม่มีคิวผู้ป่วยในวันนี้</td></tr>`;
        } else {
            sortedVisits.forEach((v, idx) => {
                tbodyHtml += `
                    <tr>
                        <td style="text-align: center;">${idx+1}</td>
                        <td style="text-align: center;">เตียง ${this.#escapeHTML(v.bed || '-')}</td>
                        <td>${this.#escapeHTML(v.name || '-')} (HN: ${this.#escapeHTML(v.hn)})</td>
                        <td style="text-align: center;">${this.#escapeHTML(v.time || '-')} น.</td>
                        <td style="text-align: center;">${this.#escapeHTML(v.status || 'รอตรวจ')}</td>
                    </tr>
                `;
            });
        }

        db.ref('clinic_settings_v2').once('value', snap => {
            const settings = snap.val() || { clinic_name: "DIALYSIS PRO CLINIC" };
            const printWindow = window.open('', '_blank');
            
            const html = `
            <!DOCTYPE html>
            <html lang="th">
            <head>
                <meta charset="UTF-8">
                <title>รายงานประจำวัน - ${thaiDate}</title>
                <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Sarabun', sans-serif; color: #000; padding: 20px; font-size: 14px; }
                    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 15px;}
                    .header h2 { font-size: 24px; font-weight: 700; margin: 0; }
                    .header h3 { font-size: 18px; margin: 5px 0 0 0; }
                    
                    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
                    .summary-box { border: 1px solid #000; padding: 15px; text-align: center; border-radius: 8px; }
                    .summary-box .val { font-size: 22px; font-weight: bold; margin-top: 5px; }
                    
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th, td { border: 1px solid #000; padding: 10px; }
                    th { background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact; padding-top:12px; padding-bottom:12px;}
                    
                    @media print { @page { size: A4 portrait; margin: 15mm; } body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>${this.#escapeHTML(settings.clinic_name)}</h2>
                    <h3>รายงานสรุปการให้บริการประจำวัน</h3>
                    <div>ประจำวันที่: ${thaiDate} | พิมพ์เมื่อ: ${new Date().toLocaleTimeString('th-TH')} น.</div>
                </div>

                <div class="summary-grid">
                    <div class="summary-box">ผู้ป่วย Active<div class="val">${this.state.allPatients.length} คน</div></div>
                    <div class="summary-box">คิวฟอกวันนี้<div class="val">${dailyVisits.length} รอบ</div></div>
                    <div class="summary-box">ใช้ Online HDF<div class="val">${onlineCount} รอบ</div></div>
                    <div class="summary-box">ประมาณการรายรับ<div class="val">${income.toLocaleString()} บาท</div></div>
                </div>

                <h3 style="margin-bottom: 10px;">รายชื่อคิวฟอกเลือดประจำวัน</h3>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 10%;">ลำดับ</th>
                            <th style="width: 15%;">เบอร์เตียง</th>
                            <th style="width: 40%;">ชื่อ-นามสกุล / HN</th>
                            <th style="width: 15%;">รอบเวลา</th>
                            <th style="width: 20%;">สถานะ</th>
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
            </body>
            </html>`;

            printWindow.document.write(html);
            printWindow.document.close();
            setTimeout(() => { printWindow.focus(); printWindow.print(); }, 500);
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