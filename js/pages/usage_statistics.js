// js/pages/usage_statistics.js
// 🚀 Enterprise Analytics Module: Ultra-Premium UI/UX, Soft Shadows & Advanced Data Visualization

class UsageStatisticsComponent {
    constructor() {
        this.state = {
            visits: [],
            currentFilter: 'month', 
            specificDate: '',
            chartInstance: null,
            exportData: null 
        };
        this.firebaseListeners = [];
        this.masterDict = new Map(); 
    }

    parseFBArray(data) {
        if (!data) return [];
        if (Array.isArray(data)) return data.filter(item => item !== null && item !== undefined);
        if (typeof data === 'object' && data !== null) return Object.keys(data).map(k => ({ firebaseKey: k, ...data[k] })).filter(item => item !== null && item !== undefined);
        return []; 
    }

    escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }

    get html() {
        return `
            <style>
                @keyframes fadeScaleIn { from { opacity: 0; transform: scale(0.98) translateY(15px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                
                /* 👑 Premium Page Header */
                .analytics-header { padding-bottom: 1rem; border-bottom: 2px dashed rgba(0,0,0,0.05); }
                html[data-bs-theme="dark"] .analytics-header { border-bottom-color: rgba(255,255,255,0.05); }
                
                /* 👑 Premium Stat Cards */
                .stat-card-v2 {
                    animation: fadeScaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    background: #ffffff;
                    border: none;
                    border-radius: 24px;
                    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08);
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    z-index: 1;
                }
                .stat-card-v2::before {
                    content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 5px; z-index: 2;
                }
                .stat-card-v2.success-theme::before { background: linear-gradient(90deg, #10b981, #34d399); }
                .stat-card-v2.primary-theme::before { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
                .stat-card-v2.warning-theme::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
                
                .stat-card-v2:hover { transform: translateY(-8px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.12); }
                
                html[data-bs-theme="dark"] .stat-card-v2 { background: #1e293b; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5); }
                
                .stat-icon-wrapper-v2 {
                    width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 26px; color: #fff;
                    box-shadow: inset 0 -3px 0 rgba(0,0,0,0.1);
                }

                /* 👑 Filter Buttons */
                .filter-btn { transition: all 0.25s ease; border: none; font-weight: 700; color: #64748b; background: transparent; }
                .filter-btn:hover { background: rgba(0,0,0,0.05); color: #0f172a; }
                .filter-btn.active { background: linear-gradient(135deg, #3b82f6, #2563eb) !important; color: white !important; box-shadow: 0 6px 15px rgba(37, 99, 235, 0.35) !important; }
                html[data-bs-theme="dark"] .filter-btn { color: #94a3b8; }
                html[data-bs-theme="dark"] .filter-btn:hover { background: rgba(255,255,255,0.05); color: #f8fafc; }
                html[data-bs-theme="dark"] .filter-btn.active { color: #fff !important; }

                /* 👑 Premium Panels & Tables */
                .modern-panel-v2 {
                    background: #ffffff;
                    border: 1px solid rgba(0,0,0,0.03);
                    border-radius: 24px;
                    box-shadow: 0 15px 35px -5px rgba(0,0,0,0.04);
                    transition: all 0.3s ease;
                }
                html[data-bs-theme="dark"] .modern-panel-v2 { background: #1e293b; border-color: rgba(255,255,255,0.05); box-shadow: 0 15px 35px -5px rgba(0,0,0,0.3); }

                .table-premium-v2 { border-collapse: separate; border-spacing: 0; width: 100%; margin-bottom: 0; }
                .table-premium-v2 thead th {
                    position: sticky; top: 0; z-index: 10;
                    background: rgba(248, 250, 252, 0.95);
                    backdrop-filter: blur(8px);
                    color: #64748b;
                    font-size: 12px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    padding: 16px 12px;
                    border-bottom: 2px solid #e2e8f0;
                    border-top: none; white-space: nowrap;
                }
                html[data-bs-theme="dark"] .table-premium-v2 thead th { background: rgba(30, 41, 59, 0.95); color: #94a3b8; border-bottom-color: #334155; }
                
                .table-premium-v2 tbody tr { transition: all 0.2s; border-bottom: 1px solid #f1f5f9; }
                html[data-bs-theme="dark"] .table-premium-v2 tbody tr { border-bottom-color: #334155; }
                
                .table-premium-v2 tbody tr:hover { background-color: #f8fafc; }
                html[data-bs-theme="dark"] .table-premium-v2 tbody tr:hover { background-color: rgba(255,255,255,0.02); }
                
                .table-premium-v2 td { padding: 14px 12px; vertical-align: middle; border: none; }
                
                .scroll-table-container { max-height: 380px; overflow-y: auto; border-radius: 0 0 24px 24px; padding-bottom: 10px; }
                .scroll-table-container-large { max-height: 550px; overflow-y: auto; border-radius: 0 0 24px 24px; padding-bottom: 10px; }
                
                /* Custom Scrollbar */
                .scroll-table-container::-webkit-scrollbar, .scroll-table-container-large::-webkit-scrollbar { width: 6px; height: 6px; }
                .scroll-table-container::-webkit-scrollbar-track, .scroll-table-container-large::-webkit-scrollbar-track { background: transparent; }
                .scroll-table-container::-webkit-scrollbar-thumb, .scroll-table-container-large::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .scroll-table-container::-webkit-scrollbar-thumb:hover, .scroll-table-container-large::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

                /* 👑 Badges & Accents */
                .soft-badge { padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; }
                
                /* Chart */
                .chart-container { position: relative; height: 320px; width: 100%; margin-top: 10px; }
            </style>

            <div class="analytics-header mb-4 d-flex justify-content-between align-items-end flex-wrap gap-3 fade-in-up">
                <div>
                    <h2 class="page-title text-primary" style="font-family:'Prompt'; font-weight:800; font-size:28px;"><i class="fa-solid fa-chart-pie me-2"></i> สถิติการใช้พัสดุและยาฉีด</h2>
                    <p class="text-muted mt-1 mb-0 fw-bold" style="font-size:15px;">ระบบวิเคราะห์ข้อมูลและสรุปยอดค่าใช้จ่ายแบบเรียลไทม์ (Analytics Dashboard)</p>
                </div>
                
                <div class="d-flex gap-2 flex-wrap align-items-center bg-white p-2 rounded-pill shadow-sm" style="border: 1px solid rgba(0,0,0,0.05);">
                    <button class="btn btn-sm rounded-pill px-4 filter-btn" data-filter="today" onclick="App.pages.usage_statistics.applyFilter('today')">วันนี้</button>
                    <button class="btn btn-sm rounded-pill px-4 filter-btn active" data-filter="month" onclick="App.pages.usage_statistics.applyFilter('month')">เดือนนี้</button>
                    <button class="btn btn-sm rounded-pill px-4 filter-btn" data-filter="year" onclick="App.pages.usage_statistics.applyFilter('year')">ปีนี้</button>
                    <button class="btn btn-sm rounded-pill px-4 filter-btn" data-filter="all" onclick="App.pages.usage_statistics.applyFilter('all')">ทั้งหมด</button>
                    
                    <div style="border-left: 2px solid #e2e8f0; height: 24px; margin: 0 5px;"></div>
                    
                    <div class="d-flex align-items-center px-2 bg-light rounded-pill p-1">
                        <i class="fa-solid fa-calendar-day text-primary ms-2 me-1"></i>
                        <input type="date" id="us-specific-date" class="form-control form-control-sm border-0 bg-transparent fw-bold text-dark p-1" style="width: 120px; outline: none; box-shadow: none;" onchange="App.pages.usage_statistics.applySpecificDate(this.value)">
                    </div>
                    
                    <button class="btn btn-sm btn-success rounded-pill fw-bold shadow-sm ms-2 px-4" onclick="App.pages.usage_statistics.exportExcel()" style="padding-top: 6px; padding-bottom: 6px;"><i class="fa-solid fa-file-excel me-1"></i> ส่งออก Excel</button>
                </div>
            </div>

            <div class="row g-4 mb-4" id="us-summary-cards">
                <div class="col-md-4">
                    <div class="stat-card-v2 success-theme p-4 h-100">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-secondary fw-bold mb-1 small text-uppercase" style="letter-spacing: 0.5px;">มูลค่ายาและพัสดุรวม (บาท)</h6>
                                <h2 class="fw-bold text-dark mb-0" id="us-total-cost" style="font-family:'Prompt'; letter-spacing:-0.5px;">฿0.00</h2>
                            </div>
                            <div class="stat-icon-wrapper-v2" style="background: linear-gradient(135deg, #10b981, #059669);">
                                <i class="fa-solid fa-sack-dollar"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stat-card-v2 primary-theme p-4 h-100" style="animation-delay: 0.1s;">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="text-secondary fw-bold mb-1 small text-uppercase" style="letter-spacing: 0.5px;">จำนวนรอบที่สั่งเบิก (คิว)</h6>
                                <h2 class="fw-bold text-dark mb-0" id="us-total-transactions" style="font-family:'Prompt'; letter-spacing:-0.5px;">0</h2>
                            </div>
                            <div class="stat-icon-wrapper-v2" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">
                                <i class="fa-solid fa-file-invoice"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stat-card-v2 warning-theme p-4 h-100" style="animation-delay: 0.2s;">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="min-w-0 flex-grow-1 pe-3">
                                <h6 class="text-secondary fw-bold mb-1 small text-uppercase" style="letter-spacing: 0.5px;">ถูกใช้มากที่สุด (Top Item)</h6>
                                <h4 class="fw-bold text-dark mb-0 text-truncate" id="us-top-item" title="-" style="font-family:'Prompt';">กำลังคำนวณ...</h4>
                                <div class="small fw-bold text-warning-dark mt-1" id="us-top-item-qty"><i class="fa-solid fa-arrow-trend-up me-1"></i> -</div>
                            </div>
                            <div class="stat-icon-wrapper-v2 flex-shrink-0" style="background: linear-gradient(135deg, #f59e0b, #b45309);">
                                <i class="fa-solid fa-crown"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-12 fade-in-up" style="animation-delay: 0.3s;">
                    <div class="modern-panel-v2 p-4 h-100">
                        <div class="d-flex align-items-center justify-content-between mb-2">
                            <h5 class="fw-bold text-dark mb-0" style="font-family:'Prompt';"><i class="fa-solid fa-chart-column text-primary me-2"></i> กราฟ 10 อันดับแรกที่มีการใช้สูงสุด (Top 10 Overall)</h5>
                        </div>
                        <div class="chart-container">
                            <canvas id="usageBarChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-4 mb-4 fade-in-up" style="animation-delay: 0.4s;">
                <div class="col-xl-6">
                    <div class="modern-panel-v2 h-100 d-flex flex-column" style="border-top: 4px solid var(--primary);">
                        <div class="p-4 border-bottom d-flex justify-content-between align-items-center">
                            <h5 class="fw-bold text-dark mb-0" style="font-family:'Prompt';"><i class="fa-solid fa-pills text-primary me-2"></i> หมวดยาและน้ำยาไต</h5>
                            <span class="soft-badge bg-primary-subtle text-primary" id="us-meds-total"><i class="fa-solid fa-coins me-1"></i> ฿0.00</span>
                        </div>
                        <div class="scroll-table-container flex-grow-1 px-2">
                            <table class="table-premium-v2">
                                <thead>
                                    <tr>
                                        <th width="8%" class="text-center">#</th>
                                        <th width="42%">รายการยา / น้ำยา</th>
                                        <th width="15%" class="text-end">ราคา/หน่วย</th>
                                        <th width="15%" class="text-center">ใช้ไป</th>
                                        <th width="20%" class="text-end pe-3">รวม (฿)</th>
                                    </tr>
                                </thead>
                                <tbody id="us-meds-table-body">
                                    <tr><td colspan="5" class="text-center py-5 text-muted"><i class="fas fa-spinner fa-spin fa-2x mb-3"></i></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="col-xl-6">
                    <div class="modern-panel-v2 h-100 d-flex flex-column" style="border-top: 4px solid var(--danger);">
                        <div class="p-4 border-bottom d-flex justify-content-between align-items-center">
                            <h5 class="fw-bold text-dark mb-0" style="font-family:'Prompt';"><i class="fa-solid fa-box-open text-danger me-2"></i> หมวดพัสดุและ X-Ray</h5>
                            <span class="soft-badge bg-danger-subtle text-danger" id="us-inv-total"><i class="fa-solid fa-coins me-1"></i> ฿0.00</span>
                        </div>
                        <div class="scroll-table-container flex-grow-1 px-2">
                            <table class="table-premium-v2">
                                <thead>
                                    <tr>
                                        <th width="8%" class="text-center">#</th>
                                        <th width="42%">รายการพัสดุ / บริการ</th>
                                        <th width="15%" class="text-end">ราคา/หน่วย</th>
                                        <th width="15%" class="text-center">ใช้ไป</th>
                                        <th width="20%" class="text-end pe-3">รวม (฿)</th>
                                    </tr>
                                </thead>
                                <tbody id="us-inv-table-body">
                                    <tr><td colspan="5" class="text-center py-5 text-muted"><i class="fas fa-spinner fa-spin fa-2x mb-3"></i></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row pb-5 fade-in-up" style="animation-delay: 0.5s;">
                <div class="col-12">
                    <div class="modern-panel-v2 d-flex flex-column" style="border-top: 4px solid var(--info);">
                        <div class="p-4 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div>
                                <h5 class="fw-bold text-dark mb-1" style="font-family:'Prompt';"><i class="fa-solid fa-magnifying-glass-chart text-info me-2"></i> บันทึกการใช้งานเชิงลึก (Detailed Transaction Log)</h5>
                                <p class="text-muted small mb-0 fw-bold">แจกแจงประวัติการใช้งานพัสดุและยาแยกตามผู้ป่วยแต่ละรอบการฟอกเลือด</p>
                            </div>
                        </div>
                        <div class="scroll-table-container-large flex-grow-1 px-2">
                            <table class="table-premium-v2" id="detailed-log-table">
                                <thead>
                                    <tr>
                                        <th width="10%" class="text-center">วันที่</th>
                                        <th width="10%" class="text-center">HN</th>
                                        <th width="22%">ชื่อคนไข้</th>
                                        <th width="28%">รายการที่ใช้</th>
                                        <th width="8%" class="text-center">หมวด</th>
                                        <th width="8%" class="text-end">ราคา(฿)</th>
                                        <th width="6%" class="text-center">จำนวน</th>
                                        <th width="8%" class="text-end pe-3">รวม (฿)</th>
                                    </tr>
                                </thead>
                                <tbody id="us-detailed-table-body">
                                    <tr><td colspan="8" class="text-center py-5 text-muted"><i class="fas fa-spinner fa-spin fa-2x mb-3"></i></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    init() {
        if (typeof db === 'undefined') {
            const bodyMeds = document.getElementById('us-meds-table-body');
            if(bodyMeds) bodyMeds.innerHTML = '<tr><td colspan="5" class="text-danger text-center py-5 fw-bold">ไม่พบการเชื่อมต่อฐานข้อมูล Firebase</td></tr>';
            return;
        }

        this.masterDict.clear();
        this.state.visits = [];
        this.state.exportData = null; 
        
        const today = new Date();
        const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
        this.state.specificDate = localDate.toISOString().split('T')[0];

        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => this.setupRealtimeData();
            script.onerror = () => { console.error("Failed to load Chart.js"); this.setupRealtimeData(); };
            document.head.appendChild(script);
        } else {
            this.setupRealtimeData();
        }
    }

    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        if (this.state.chartInstance) {
            this.state.chartInstance.destroy();
            this.state.chartInstance = null;
        }
        this.masterDict.clear();
        this.state.exportData = null;
    }

    setupRealtimeData() {
        const toArray = (snapVal) => snapVal ? (Array.isArray(snapVal) ? snapVal : Object.keys(snapVal).map(k => snapVal[k])).filter(Boolean) : [];

        const updateDict = (path, itemType) => {
            const cb = db.ref(path).on('value', snap => {
                let items = toArray(snap.val());
                items.forEach(i => {
                    let id = typeof i === 'object' ? (i.id || i.name || i.title) : i;
                    let name = typeof i === 'object' ? (i.name || i.title || i.id) : i;
                    let price = typeof i === 'object' ? (parseFloat(i.price) || 0) : 0;
                    
                    if(id) this.masterDict.set(String(id).toLowerCase().trim(), { name, price, type: itemType });
                    if(name) this.masterDict.set(String(name).toLowerCase().trim(), { name, price, type: itemType });
                });
                this.processAndRender();
            });
            this.firebaseListeners.push({ path, callback: cb });
        };

        updateDict('inventory_database_v2/items', 'inv');
        updateDict('clinic_meds_list_v2', 'med');
        updateDict('clinic_xray_list_v2', 'xray');
        updateDict('clinic_xrays_v2', 'xray');

        const visitCb = db.ref('patients_database_v2/visits').on('value', snap => {
            this.state.visits = toArray(snap.val());
            this.processAndRender();
        });
        this.firebaseListeners.push({ path: 'patients_database_v2/visits', callback: visitCb });
    }

    applyFilter(filterType) {
        this.state.currentFilter = filterType;
        
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        const activeBtn = document.querySelector(`.filter-btn[data-filter="${filterType}"]`);
        if(activeBtn) activeBtn.classList.add('active');

        if (filterType !== 'specific') {
            const dateInput = document.getElementById('us-specific-date');
            if (dateInput) dateInput.value = '';
            this.state.specificDate = '';
        }

        this.processAndRender();
    }

    applySpecificDate(dateStr) {
        if (!dateStr) return;
        this.state.specificDate = dateStr;
        this.applyFilter('specific');
    }

    processAndRender() {
        if (!this.state.visits) return;

        const today = new Date();
        const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000));
        const todayStr = localDate.toISOString().split('T')[0];
        const currentMonth = todayStr.substring(0, 7);
        const currentYear = todayStr.substring(0, 4);

        let filteredVisits = this.state.visits.filter(v => {
            if(!v.date) return false;
            if (this.state.currentFilter === 'today') return v.date === todayStr;
            if (this.state.currentFilter === 'month') return v.date.startsWith(currentMonth);
            if (this.state.currentFilter === 'year') return v.date.startsWith(currentYear);
            if (this.state.currentFilter === 'specific' && this.state.specificDate) return v.date === this.state.specificDate;
            return true;
        });

        let medsMap = new Map(); 
        let invMap = new Map();  
        let detailedLogs = [];
        let totalCost = 0;
        let totalTransactions = 0;

        const addItem = (visitDate, patientName, patientHn, idOrName, qtyStr, defaultType) => {
            if(!idOrName) return;
            let qty = parseFloat(qtyStr);
            if(isNaN(qty) || qty <= 0) return;

            let term = String(idOrName).toLowerCase().trim();
            let name = String(idOrName);
            let price = 0;
            let type = defaultType; 

            let dictItem = this.masterDict.get(term);
            if(dictItem) {
                name = dictItem.name;
                price = dictItem.price;
                type = dictItem.type; 
            }

            let itemCost = qty * price;
            totalCost += itemCost;

            detailedLogs.push({
                date: visitDate,
                patientName: patientName || 'ไม่ระบุชื่อ',
                patientHn: patientHn || '-',
                itemName: name,
                category: type === 'med' ? 'ยา/น้ำยา' : (type === 'xray' ? 'X-Ray' : 'พัสดุ'),
                unitPrice: price,
                qty: qty,
                totalValue: itemCost
            });

            let targetMap = (type === 'med') ? medsMap : invMap;
            let key = name.toLowerCase().trim();

            if(targetMap.has(key)) {
                let existing = targetMap.get(key);
                existing.qty += qty;
                existing.totalValue += itemCost;
            } else {
                targetMap.set(key, { name: name, qty: qty, unitPrice: price, totalValue: itemCost, type: type });
            }
        };

        filteredVisits.forEach(v => {
            let hasItems = false;
            let vDate = v.date || '1970-01-01';
            let vName = v.name || '';
            let vHn = v.hn || '';
            
            if(v.hd_dialysate_item && v.hd_dialysate_qty) { addItem(vDate, vName, vHn, v.hd_dialysate_item, v.hd_dialysate_qty, 'med'); hasItems = true; }
            if(v.hd_saline_item && v.hd_saline_qty) { addItem(vDate, vName, vHn, v.hd_saline_item, v.hd_saline_qty, 'med'); hasItems = true; }
            if(v.hd_heparin_item && v.hd_heparin_qty) { addItem(vDate, vName, vHn, v.hd_heparin_item, v.hd_heparin_qty, 'med'); hasItems = true; }
            
            let oMeds = this.parseFBArray(v.other_meds);
            oMeds.forEach(m => {
                if(m && (m.id || m.name) && m.qty) { addItem(vDate, vName, vHn, m.id || m.name, m.qty, 'med'); hasItems = true; }
            });

            let xRays = this.parseFBArray(v.xray_list);
            xRays.forEach(x => {
                if(x && (x.id || x.name) && x.qty) { addItem(vDate, vName, vHn, x.id || x.name, x.qty, 'xray'); hasItems = true; }
            });

            if(hasItems) totalTransactions++;
        });

        let medsAggregated = Array.from(medsMap.values()).sort((a, b) => b.qty - a.qty);
        let invAggregated = Array.from(invMap.values()).sort((a, b) => b.qty - a.qty);
        let allAggregated = [...medsAggregated, ...invAggregated].sort((a, b) => b.qty - a.qty);
        detailedLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

        this.state.exportData = {
            meds: medsAggregated,
            inv: invAggregated,
            logs: detailedLogs,
            totalCost: totalCost
        };

        const totalCostEl = document.getElementById('us-total-cost');
        if(totalCostEl) totalCostEl.innerText = `฿${totalCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        
        const totalTxEl = document.getElementById('us-total-transactions');
        if(totalTxEl) totalTxEl.innerText = totalTransactions.toLocaleString();

        const topItemEl = document.getElementById('us-top-item');
        const topItemQtyEl = document.getElementById('us-top-item-qty');
        if (allAggregated.length > 0 && topItemEl && topItemQtyEl) {
            topItemEl.innerText = allAggregated[0].name;
            topItemEl.title = allAggregated[0].name;
            topItemQtyEl.innerText = `จำนวน ${allAggregated[0].qty.toLocaleString()} หน่วย`;
        } else if (topItemEl && topItemQtyEl) {
            topItemEl.innerText = '-';
            topItemQtyEl.innerText = 'จำนวน 0 หน่วย';
        }

        this.renderSummaryTable('us-meds-table-body', 'us-meds-total', medsAggregated, 'ยาและน้ำยา');
        this.renderSummaryTable('us-inv-table-body', 'us-inv-total', invAggregated, 'พัสดุและ X-Ray');
        this.renderDetailedLogTable(detailedLogs);
        this.renderChart(allAggregated);
    }

    renderSummaryTable(tbodyId, totalBadgeId, dataArray, emptyText) {
        let tableBody = document.getElementById(tbodyId);
        let totalBadge = document.getElementById(totalBadgeId);
        if (!tableBody) return;

        let tableTotal = 0;
        if (dataArray.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-muted"><i class="fa-solid fa-box-open fa-2x mb-2" style="opacity: 0.2;"></i><br>ไม่พบประวัติการใช้${emptyText}</td></tr>`;
        } else {
            let tableHtml = '';
            dataArray.forEach((item, index) => {
                tableTotal += item.totalValue;
                tableHtml += `
                <tr class="fade-in-up" style="animation-delay: ${(index % 10) * 0.02}s">
                    <td class="text-center text-muted fw-bold small">${index + 1}</td>
                    <td><div class="fw-bold text-dark text-truncate" style="font-size: 14px; max-width: 200px;" title="${this.escapeHTML(item.name)}">${this.escapeHTML(item.name)}</div></td>
                    <td class="text-end text-secondary small">฿${item.unitPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td class="text-center fw-bold text-primary">${item.qty.toLocaleString()}</td>
                    <td class="text-end pe-3 fw-bold text-success">฿${item.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>`;
            });
            tableBody.innerHTML = tableHtml;
        }
        if (totalBadge) totalBadge.innerHTML = `<i class="fa-solid fa-coins me-1"></i> ฿${tableTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }

    renderDetailedLogTable(detailedLogs) {
        let tableBody = document.getElementById('us-detailed-table-body');
        if (!tableBody) return;

        if (detailedLogs.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-5 text-muted"><i class="fa-solid fa-magnifying-glass fa-2x mb-2" style="opacity: 0.2;"></i><br>ไม่มีข้อมูลเชิงลึกในช่วงเวลานี้</td></tr>`;
            return;
        }

        let tableHtml = '';
        detailedLogs.forEach((log, index) => {
            let badgeClass = log.category === 'ยา/น้ำยา' ? 'bg-primary-subtle text-primary' : 
                             (log.category === 'X-Ray' ? 'bg-info-subtle text-info' : 'bg-danger-subtle text-danger');
            
            tableHtml += `
            <tr class="fade-in-up" style="animation-delay: ${(index % 15) * 0.015}s">
                <td class="text-center text-muted fw-bold" style="font-size:13px;">${new Date(log.date).toLocaleDateString('th-TH')}</td>
                <td class="text-center text-secondary fw-bold" style="font-size:13px;">${this.escapeHTML(log.patientHn)}</td>
                <td><div class="fw-bold text-dark text-truncate" style="font-size:14px; max-width: 180px;">${this.escapeHTML(log.patientName)}</div></td>
                <td><div class="fw-bold text-dark text-truncate" style="font-size:14px; max-width: 220px;" title="${this.escapeHTML(log.itemName)}">${this.escapeHTML(log.itemName)}</div></td>
                <td class="text-center"><span class="soft-badge ${badgeClass}">${log.category}</span></td>
                <td class="text-end text-secondary small">฿${log.unitPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td class="text-center fw-bold text-primary">${log.qty.toLocaleString()}</td>
                <td class="text-end pe-3 fw-bold text-success">฿${log.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>`;
        });
        tableBody.innerHTML = tableHtml;
    }

    renderChart(data) {
        if (typeof Chart === 'undefined') return;
        const canvas = document.getElementById('usageBarChart');
        if (!canvas) return;

        if (this.state.chartInstance) {
            this.state.chartInstance.destroy();
        }

        const top10 = data.slice(0, 10);
        const labels = top10.map(d => {
            let name = String(d.name);
            return name.length > 25 ? name.substring(0, 25) + '...' : name;
        });
        const quantities = top10.map(d => d.qty);
        
        const ctx = canvas.getContext('2d');
        
        // Gradient แบบหรูหรา
        let gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0.3)');

        this.state.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'จำนวนที่เบิกใช้ (หน่วย)',
                    data: quantities,
                    backgroundColor: gradient,
                    borderColor: '#2563eb',
                    borderWidth: 1,
                    borderRadius: 8,
                    barPercentage: 0.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'x', 
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        titleFont: { family: 'Prompt', size: 14 },
                        bodyFont: { family: 'Prompt', size: 13, weight: 'bold' },
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        padding: 12,
                        cornerRadius: 8,
                        boxPadding: 6
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { family: 'Prompt', size: 11, weight: 'bold' }, color: '#64748b' } },
                    y: { grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false }, ticks: { font: { family: 'Prompt', weight: 'bold' }, color: '#94a3b8' } }
                }
            }
        });
    }

    async exportExcel() {
        if (!this.state.visits || this.state.visits.length === 0) {
            Swal.fire('ไม่มีข้อมูล', 'ไม่พบข้อมูลประวัติในระบบ', 'warning');
            return;
        }

        if (typeof ExcelJS === 'undefined') {
            Swal.fire({ title: 'กำลังเชื่อมต่อ Excel Engine...', html: 'โปรดรอสักครู่...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js';
            script.onload = () => { Swal.close(); this.promptExportType(); };
            script.onerror = () => { Swal.fire('ระบบขัดข้อง', 'ไม่สามารถดาวน์โหลด Excel Engine ได้', 'error'); };
            document.head.appendChild(script);
        } else {
            this.promptExportType();
        }
    }

    async promptExportType() {
        const inputOptions = {
            'current': '📊 1. ส่งออกข้อมูลที่แสดงบนหน้าจอปัจจุบัน (ได้ 2 Sheet)',
            'daily': '📅 2. สรุปยอดรวม แยก "รายวัน" (Daily Breakdown)',
            'monthly': '📅 3. สรุปยอดรวม แยก "รายเดือน" (Monthly Breakdown)',
            'yearly': '📅 4. สรุปยอดรวม แยก "รายปี" (Yearly Breakdown)'
        };

        const { value: exportType } = await Swal.fire({
            title: '<h4 class="fw-bold mb-0 text-success"><i class="fa-solid fa-file-excel me-2"></i> รูปแบบรายงาน Excel</h4>',
            text: 'กรุณาเลือกลักษณะการสรุปยอดที่คุณหมอ/ฝ่ายบัญชี ต้องการ',
            input: 'radio',
            inputOptions: inputOptions,
            inputValue: 'current',
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-download me-1"></i> ดาวน์โหลด',
            confirmButtonColor: '#10b981',
            cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'premium-alert text-start' }
        });

        if (exportType) {
            this._generateNativeExcel(exportType);
        }
    }

    async _generateNativeExcel(exportType) {
        Swal.fire({ title: 'กำลังสร้างไฟล์ Excel...', html: 'ระบบกำลังจัดทำตาราง .xlsx แท้ 100%<br>จัดคอลัมน์และตั้งหน้ากระดาษอย่างสวยงาม', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
            const workbook = new ExcelJS.Workbook();
            
            const applyTableStyles = (row, isHeader = false) => {
                row.eachCell((cell, colNum) => {
                    cell.font = { name: 'Tahoma', bold: isHeader, color: { argb: 'FF0F172A' }, size: 11 };
                    cell.border = { top:{style:'thin'}, bottom:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'} };
                    cell.alignment = { vertical: 'middle', wrapText: true };
                    
                    if (isHeader) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
                        cell.alignment.horizontal = 'center';
                    }
                });
            };

            if (exportType === 'current') {
                const data = this.state.exportData;
                const sheet1 = workbook.addWorksheet('สรุปภาพรวม', { views: [{ showGridLines: false }] });
                
                sheet1.columns = [
                    { width: 8 }, { width: 45 }, { width: 18 }, { width: 15 }, { width: 25 }
                ];

                sheet1.mergeCells('A1:E1');
                const titleCell = sheet1.getCell('A1');
                titleCell.value = 'รายงานสรุปสถิติการใช้พัสดุและยาฉีด (Analytics Summary)';
                titleCell.font = { name: 'Tahoma', size: 16, bold: true, color: { argb: 'FF1E3A8A' } };
                titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

                sheet1.mergeCells('A2:E2');
                const subTitleCell = sheet1.getCell('A2');
                let dateText = this.state.currentFilter === 'specific' ? `ประจำวันที่: ${new Date(this.state.specificDate).toLocaleDateString('th-TH')}` : `ฟิลเตอร์: ${this.state.currentFilter}`;
                subTitleCell.value = `${dateText} | พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}`;
                subTitleCell.font = { name: 'Tahoma', size: 11, color: { argb: 'FF475569' } };
                subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
                sheet1.addRow([]); 

                const h1 = sheet1.addRow(["1. หมวดยาและน้ำยาไต (Medications)"]);
                h1.font = { name: 'Tahoma', bold: true, size: 12, color: { argb: 'FF0F172A' } };
                const head1 = sheet1.addRow(["#", "ชื่อยา / น้ำยา", "ราคา/หน่วย (฿)", "จำนวนที่ใช้", "มูลค่าประเมิน (฿)"]);
                applyTableStyles(head1, true);

                if (data.meds.length === 0) {
                    const emptyRow = sheet1.addRow(["", "ไม่มีข้อมูล", "", "", ""]);
                    applyTableStyles(emptyRow);
                    sheet1.mergeCells(`B${emptyRow.number}:E${emptyRow.number}`);
                    emptyRow.getCell(2).alignment = { horizontal: 'center' };
                } else {
                    data.meds.forEach((item, idx) => {
                        const r = sheet1.addRow([idx + 1, item.name, item.unitPrice, item.qty, item.totalValue]);
                        applyTableStyles(r);
                        r.getCell(1).alignment = { horizontal: 'center' };
                        r.getCell(3).alignment = { horizontal: 'right' }; r.getCell(3).numFmt = '#,##0.00';
                        r.getCell(4).alignment = { horizontal: 'center' };
                        r.getCell(5).alignment = { horizontal: 'right' }; r.getCell(5).numFmt = '#,##0.00';
                    });
                }
                sheet1.addRow([]); 

                const h2 = sheet1.addRow(["2. หมวดเวชภัณฑ์และ X-Ray (Inventory & Others)"]);
                h2.font = { name: 'Tahoma', bold: true, size: 12, color: { argb: 'FF0F172A' } };
                const head2 = sheet1.addRow(["#", "ชื่อเวชภัณฑ์ / X-Ray", "ราคา/หน่วย (฿)", "จำนวนที่ใช้", "มูลค่าประเมิน (฿)"]);
                applyTableStyles(head2, true);

                if (data.inv.length === 0) {
                    const emptyRow = sheet1.addRow(["", "ไม่มีข้อมูล", "", "", ""]);
                    applyTableStyles(emptyRow);
                    sheet1.mergeCells(`B${emptyRow.number}:E${emptyRow.number}`);
                    emptyRow.getCell(2).alignment = { horizontal: 'center' };
                } else {
                    data.inv.forEach((item, idx) => {
                        const r = sheet1.addRow([idx + 1, item.name, item.unitPrice, item.qty, item.totalValue]);
                        applyTableStyles(r);
                        r.getCell(1).alignment = { horizontal: 'center' };
                        r.getCell(3).alignment = { horizontal: 'right' }; r.getCell(3).numFmt = '#,##0.00';
                        r.getCell(4).alignment = { horizontal: 'center' };
                        r.getCell(5).alignment = { horizontal: 'right' }; r.getCell(5).numFmt = '#,##0.00';
                    });
                }

                // Sheet 2: Detailed Logs
                const sheet2 = workbook.addWorksheet('ประวัติเชิงลึกรายบุคคล', { views: [{ showGridLines: false }] });
                sheet2.columns = [
                    { width: 15 }, { width: 15 }, { width: 35 }, { width: 45 }, { width: 15 }, { width: 18 }, { width: 10 }, { width: 20 }
                ];
                sheet2.mergeCells('A1:H1');
                const t2_1 = sheet2.getCell('A1');
                t2_1.value = 'รายละเอียดการเบิกใช้เชิงลึกรายบุคคล (Detailed Transaction Log)';
                t2_1.font = { name: 'Tahoma', size: 16, bold: true, color: { argb: 'FF0F766E' } };
                t2_1.alignment = { vertical: 'middle', horizontal: 'center' };
                sheet2.addRow([]);

                const headLog = sheet2.addRow(["วันที่", "HN", "ชื่อคนไข้", "รายการที่ใช้ (Item)", "หมวดหมู่", "ราคา/หน่วย (฿)", "จำนวน", "รวม (฿)"]);
                applyTableStyles(headLog, true);

                if (data.logs.length === 0) {
                    const emptyRow = sheet2.addRow(["ไม่มีข้อมูลเชิงลึกในช่วงเวลานี้", "", "", "", "", "", "", ""]);
                    sheet2.mergeCells(`A${emptyRow.number}:H${emptyRow.number}`);
                    emptyRow.getCell(1).alignment = { horizontal: 'center' };
                    applyTableStyles(emptyRow);
                } else {
                    data.logs.forEach(log => {
                        const dateLocal = new Date(log.date).toLocaleDateString('th-TH');
                        const r = sheet2.addRow([dateLocal, log.patientHn, log.patientName, log.itemName, log.category, log.unitPrice, log.qty, log.totalValue]);
                        applyTableStyles(r);
                        r.getCell(1).alignment = { horizontal: 'center' }; r.getCell(2).alignment = { horizontal: 'center' };
                        r.getCell(5).alignment = { horizontal: 'center' }; r.getCell(7).alignment = { horizontal: 'center' };
                        r.getCell(6).alignment = { horizontal: 'right' }; r.getCell(6).numFmt = '#,##0.00';
                        r.getCell(8).alignment = { horizontal: 'right' }; r.getCell(8).numFmt = '#,##0.00';
                    });
                }

            } else {
                // ==========================================
                // รูปแบบที่ 2-4: แยกตาราง Aggregate ตามวัน/เดือน/ปี
                // ==========================================
                let flatData = [];
                
                this.state.visits.forEach(v => {
                    if(!v.date) return;
                    let timeKey = '';
                    if(exportType === 'daily') timeKey = v.date; // 2023-10-15
                    else if(exportType === 'monthly') timeKey = v.date.substring(0, 7); // 2023-10
                    else if(exportType === 'yearly') timeKey = v.date.substring(0, 4); // 2023

                    const extractItem = (idOrName, qtyStr, defType) => {
                        if(!idOrName) return;
                        let qty = parseFloat(qtyStr);
                        if(isNaN(qty) || qty <= 0) return;
                        let term = String(idOrName).toLowerCase().trim();
                        let name = String(idOrName);
                        let price = 0;
                        let cType = defType;

                        let dictItem = this.masterDict.get(term);
                        if(dictItem) {
                            name = dictItem.name;
                            price = dictItem.price;
                            cType = dictItem.type;
                        }

                        flatData.push({
                            timeKey: timeKey,
                            name: name,
                            category: cType === 'med' ? 'ยา/น้ำยา' : (cType === 'xray' ? 'X-Ray' : 'พัสดุ'),
                            unitPrice: price,
                            qty: qty,
                            totalValue: qty * price
                        });
                    }

                    if(v.hd_dialysate_item && v.hd_dialysate_qty) extractItem(v.hd_dialysate_item, v.hd_dialysate_qty, 'med');
                    if(v.hd_saline_item && v.hd_saline_qty) extractItem(v.hd_saline_item, v.hd_saline_qty, 'med');
                    if(v.hd_heparin_item && v.hd_heparin_qty) extractItem(v.hd_heparin_item, v.hd_heparin_qty, 'med');
                    
                    let oMeds = this.parseFBArray(v.other_meds);
                    oMeds.forEach(m => { if(m && (m.id || m.name) && m.qty) extractItem(m.id || m.name, m.qty, 'med'); });
                    
                    let xRays = this.parseFBArray(v.xray_list);
                    xRays.forEach(x => { if(x && (x.id || x.name) && x.qty) extractItem(x.id || x.name, x.qty, 'xray'); });
                });

                // รวมยอดตาม TimeKey + ItemName
                let aggMap = new Map();
                flatData.forEach(d => {
                    let k = `${d.timeKey}_${d.name}`;
                    if(aggMap.has(k)) {
                        let ex = aggMap.get(k);
                        ex.qty += d.qty;
                        ex.totalValue += d.totalValue;
                    } else {
                        aggMap.set(k, { ...d });
                    }
                });

                let finalAggData = Array.from(aggMap.values());
                // Sort by timeKey descending (ใหม่ไปเก่า), then by totalValue descending
                finalAggData.sort((a, b) => {
                    if(a.timeKey !== b.timeKey) return b.timeKey.localeCompare(a.timeKey);
                    return b.totalValue - a.totalValue;
                });

                const sheetNameMap = { 'daily': 'สรุปรายวัน', 'monthly': 'สรุปรายเดือน', 'yearly': 'สรุปรายปี' };
                const sheet = workbook.addWorksheet(sheetNameMap[exportType], { views: [{ showGridLines: false }] });

                sheet.columns = [
                    { width: 20 }, // A: Period
                    { width: 15 }, // B: Category
                    { width: 45 }, // C: Item Name
                    { width: 18 }, // D: Unit Price
                    { width: 15 }, // E: Qty
                    { width: 25 }  // F: Total Value
                ];

                sheet.mergeCells('A1:F1');
                const titleCell = sheet.getCell('A1');
                titleCell.value = `รายงานสรุปยอดรวม แยกตาม${sheetNameMap[exportType].replace('สรุป', '')}`;
                titleCell.font = { name: 'Tahoma', size: 16, bold: true, color: { argb: 'FF1E3A8A' } };
                titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

                sheet.mergeCells('A2:F2');
                const subTitleCell = sheet.getCell('A2');
                subTitleCell.value = `ดึงข้อมูลจากประวัติคลินิกทั้งหมด | พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}`;
                subTitleCell.font = { name: 'Tahoma', size: 11, color: { argb: 'FF475569' } };
                subTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
                sheet.addRow([]); 

                const headerRow = sheet.addRow(['ช่วงเวลา (Period)', 'หมวดหมู่', 'ชื่อรายการพัสดุ/ยา', 'ราคา/หน่วย (฿)', 'จำนวนเบิกรวม', 'มูลค่ารวม (฿)']);
                applyTableStyles(headerRow, true);

                if (finalAggData.length === 0) {
                    const emptyRow = sheet.addRow(["ไม่มีข้อมูลในระบบ", "", "", "", "", ""]);
                    applyTableStyles(emptyRow);
                    sheet.mergeCells(`A${emptyRow.number}:F${emptyRow.number}`);
                    emptyRow.getCell(1).alignment = { horizontal: 'center' };
                } else {
                    finalAggData.forEach(item => {
                        const r = sheet.addRow([item.timeKey, item.category, item.name, item.unitPrice, item.qty, item.totalValue]);
                        applyTableStyles(r);
                        r.getCell(1).alignment = { horizontal: 'center' };
                        r.getCell(2).alignment = { horizontal: 'center' };
                        r.getCell(4).alignment = { horizontal: 'right' }; r.getCell(4).numFmt = '#,##0.00';
                        r.getCell(5).alignment = { horizontal: 'center' };
                        r.getCell(6).alignment = { horizontal: 'right' }; r.getCell(6).numFmt = '#,##0.00';
                    });
                }
            }

            // ดาวน์โหลดไฟล์ Excel ออกมา
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            let postfix = exportType === 'current' ? 'Summary' : exportType.charAt(0).toUpperCase() + exportType.slice(1);
            link.download = `Usage_Statistics_${postfix}_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            
            Swal.fire({
                title: 'ดาวน์โหลดสำเร็จ!',
                text: 'ไฟล์ Excel (.xlsx) แบบ Native สร้างสมบูรณ์แบบ',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error(error);
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถสร้างไฟล์ Excel ได้: ' + error.message, 'error');
        }
    }
}

const UsageStatisticsPage = new UsageStatisticsComponent();
window.UsageStatisticsPage = UsageStatisticsPage;