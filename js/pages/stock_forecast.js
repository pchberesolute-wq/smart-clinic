// js/pages/stock_forecast.js
// 🚀 Enterprise Smart PO Engine: Memory-Leak Free, O(1) Precalculation & Theme Native Ready

class StockForecastPageComponent {
    constructor() {
        this.state = {
            allItems: [],
            allLogs: [],
            lastGeneralForecast: [],
            lastFluidForecast: []
        };
        this.firebaseListeners = [];
        
        this.boundHandleInput = this.#handleTableInput.bind(this);
    }

    get html() {
        return `
            <style>
                .table-premium th { color: var(--text-muted); font-weight: 700; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; padding: 14px 10px; border-bottom: 2px solid var(--border-color); }
                .table-premium td { padding: 14px 10px; vertical-align: middle; border-bottom: 1px solid var(--border-color); transition: background 0.2s; }
                /* 🚨 THE FIX: กู้ชีพปุ่ม Hover ของ Tab ในหน้า Forecast ให้กลืนกับโหมดมืด */
                .forecast-nav-tabs .nav-link { background-color: transparent !important; color: var(--text-muted) !important; border: none; border-bottom: 3px solid transparent; border-radius: 12px 12px 0 0; padding: 12px 24px; transition: all 0.3s ease; }
                .forecast-nav-tabs .nav-link:hover { background-color: rgba(139, 92, 246, 0.1) !important; color: #8b5cf6 !important; }
                .forecast-nav-tabs .nav-link.active { background-color: var(--bg-surface) !important; color: #8b5cf6 !important; border-bottom: 3px solid #8b5cf6; box-shadow: 0 -4px 10px rgba(0,0,0,0.02); }
                
                #fluid-tab.active { color: #06b6d4 !important; border-bottom-color: #06b6d4 !important; }
                #fluid-tab:hover { background-color: rgba(6, 182, 212, 0.1) !important; color: #06b6d4 !important; }
            </style>

            <div class="page-header mb-4">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h2 class="page-title text-primary" style="font-size: 28px;"><i class="fa-solid fa-robot me-2"></i> คำนวณและจัดทำใบเบิกพัสดุ (Smart Order)</h2>
                        <p class="text-muted mt-1 mb-0">ดึงยอดตั้งต้นเบิกจากฐานข้อมูลคลัง เพื่อคำนวณและส่งไปหน้าฟอร์มเบิกของ (Excel) อัตโนมัติ</p>
                    </div>
                    <div class="d-flex gap-2 mt-3 mt-md-0">
                        <button class="btn btn-premium-success fw-bold shadow-sm rounded-pill px-4 py-2 card-hover-float" onclick="App.pages.stock_forecast.syncToMonthlyReq()">
                            <i class="fa-solid fa-paper-plane me-2"></i> นำยอดคำนวณไปสร้างฟอร์มเบิกของ
                        </button>
                        <button class="btn btn-outline-secondary fw-bold shadow-sm rounded-pill px-4" onclick="App.switchPage('inventory')">
                            <i class="fa-solid fa-arrow-left me-2 text-primary"></i> กลับหน้าคลังหลัก
                        </button>
                    </div>
                </div>
            </div>

            <ul class="nav forecast-nav-tabs mb-4" id="forecastTabs" role="tablist" style="border-bottom: 2px solid var(--border-color); display: flex; gap: 10px;">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active fw-bold" id="ai-tab" data-bs-toggle="tab" data-bs-target="#ai-panel" type="button" role="tab" style="font-size:16px;">
                        <i class="fa-solid fa-box me-2"></i>เบิกพัสดุทั่วไป (ตามวัน)
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link fw-bold" id="fluid-tab" data-bs-toggle="tab" data-bs-target="#fluid-panel" type="button" role="tab" style="font-size:16px;">
                        <i class="fa-solid fa-droplet me-2"></i>เบิกน้ำยาฟอกไต (ตามวัน)
                    </button>
                </li>
            </ul>

            <div class="tab-content" id="forecastTabContent">
                
                <div class="tab-pane fade show active" id="ai-panel" role="tabpanel">
                    <div class="modern-panel shadow-sm mb-4 p-4 position-relative overflow-hidden" style="border-top: 5px solid #8b5cf6; border-radius: 20px; background-color: var(--bg-surface); border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                        <div style="position: absolute; top: -20px; right: -20px; opacity: 0.03; font-size: 150px; pointer-events: none; color: #8b5cf6;"><i class="fa-solid fa-calculator"></i></div>
                        <div class="row g-4 align-items-end position-relative z-1">
                            <div class="col-md-5">
                                <label class="form-label fw-bold mb-2" style="color:#8b5cf6;"><i class="fa-solid fa-calendar-day me-1"></i> ต้องการเบิกสำหรับใช้งานกี่วัน? (Days of Supply)</label>
                                <div class="input-group shadow-sm" style="border-radius: 12px; overflow: hidden; border: 2px solid #8b5cf6;">
                                    <span class="input-group-text text-white border-0" style="background:#8b5cf6;"><i class="fa-solid fa-calendar-week px-2"></i></span>
                                    <input type="number" id="sf-target-days" class="form-control form-control-lg fw-bold text-center border-0 input-modern" style="color:#8b5cf6; font-size: 20px; border-radius:0; box-shadow:none; background: var(--bg-body);" value="14" min="1">
                                    <span class="input-group-text fw-bold text-muted border-0 pe-4" style="background: var(--bg-body);">วัน</span>
                                </div>
                            </div>
                            <div class="col-md-7 text-md-end mt-4 mt-md-0">
                                <button class="btn btn-premium btn-lg fw-bold shadow px-5" onclick="App.pages.stock_forecast.calculateForecast('general')" style="background: linear-gradient(135deg, #a855f7, #7c3aed); color:white; border: none;">
                                    <i class="fa-solid fa-bolt me-2"></i> ประมวลผลยอดสั่งซื้อ
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="modern-panel shadow-sm p-4 position-relative overflow-hidden" style="display: none; border-radius: 20px; background-color: var(--bg-surface); border: 1px solid var(--border-color);" id="sf-result-panel">
                        <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 200px; pointer-events: none; color: var(--text-dark);"><i class="fa-solid fa-boxes-stacked"></i></div>
                        
                        <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 position-relative z-1 flex-wrap gap-3" style="border-color: var(--border-color) !important;">
                            <div>
                                <h5 class="fw-bold mb-1" style="color: var(--text-dark);"><i class="fa-solid fa-clipboard-list text-primary me-2"></i> ผลการคำนวณยอดจัดเบิกพัสดุทั่วไป</h5>
                                <span class="badge border border-success text-success px-3 py-2 shadow-sm rounded-pill" id="sf-summary-badge" style="background: var(--bg-body);"></span>
                            </div>
                            <button class="btn btn-outline-dark fw-bold rounded-pill shadow-sm px-4 card-hover-float" style="border-color: var(--border-color) !important;" onclick="App.pages.stock_forecast.printPO('general')">
                                <i class="fa-solid fa-print me-2 text-warning"></i> พิมพ์ใบขอจัดซื้อ (Print PR)
                            </button>
                        </div>

                        <div class="table-responsive rounded-3 border position-relative z-1 shadow-sm" style="border-color: var(--border-color) !important;">
                            <table class="table table-premium w-100 mb-0">
                                <thead style="background: var(--bg-body);">
                                    <tr>
                                        <th class="text-center text-primary" style="width: 5%;">ลำดับ</th>
                                        <th class="text-center" style="width: 12%;">รหัสสินค้า</th>
                                        <th style="width: 20%;"><i class="fa-solid fa-box me-2"></i> ชื่อรายการพัสดุ</th>
                                        <th class="text-center text-secondary" style="width: 10%;">คงเหลือรวม</th>
                                        <th class="text-center text-primary" style="width: 12%;">ยอดตั้งต้นเบิก<br><small>(แก้ไขได้)</small></th>
                                        <th class="text-center text-warning">เผื่อฉุกเฉิน<br><small>(Min-Stock)</small></th>
                                        <th class="text-center text-dark">ยอดรวมความต้องการ</th>
                                        <th class="text-center text-primary" style="border-radius: 8px 8px 0 0; font-size:13px; background: rgba(37, 99, 235, 0.1);"><i class="fa-solid fa-lightbulb me-1"></i> แนะนำสั่งเพิ่ม</th>
                                        <th class="text-center" style="width: 12%;">จัดเบิกจริง</th>
                                    </tr>
                                </thead>
                                <tbody id="sf-table-body" style="background: var(--bg-surface);"></tbody>
                                <tfoot id="sf-table-foot" style="background: var(--bg-surface);"></tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="fluid-panel" role="tabpanel">
                    <div class="modern-panel shadow-sm mb-4 p-4 position-relative overflow-hidden" style="border-top: 5px solid #06b6d4; border-radius: 20px; background-color: var(--bg-surface); border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                        <div style="position: absolute; top: -20px; right: -20px; opacity: 0.03; font-size: 150px; pointer-events: none; color: #06b6d4;"><i class="fa-solid fa-droplet"></i></div>
                        <div class="row g-4 align-items-end position-relative z-1">
                            <div class="col-md-4">
                                <label class="form-label fw-bold text-info mb-2"><i class="fa-solid fa-calendar-day me-1"></i> ต้องการเบิกสำหรับกี่วัน?</label>
                                <div class="input-group shadow-sm" style="border-radius: 12px; overflow: hidden; border: 2px solid #06b6d4;">
                                    <span class="input-group-text bg-info text-white border-0"><i class="fa-solid fa-calendar-week px-2"></i></span>
                                    <input type="number" id="fc-target-days" class="form-control form-control-lg fw-bold text-info text-center border-0 input-modern" style="font-size: 20px; border-radius:0; box-shadow:none; background: var(--bg-body);" value="7" min="1">
                                    <span class="input-group-text fw-bold text-muted border-0 pe-4" style="background: var(--bg-body);">วัน</span>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label fw-bold text-danger mb-2"><i class="fa-solid fa-shield-heart me-1"></i> เผื่อฉุกเฉิน Safety (%)</label>
                                <div class="search-box-modern p-0 shadow-sm" style="border-radius: 12px; overflow: hidden; border: 1px solid #fecaca; background: var(--bg-body);">
                                    <span class="px-3" style="background: transparent;"><i class="fa-solid fa-percent text-danger"></i></span>
                                    <input type="number" id="fc-safety-percent" class="form-control form-control-lg fw-bold text-center text-danger border-0 w-100" style="font-size: 20px; outline:none; background: transparent;" value="10">
                                </div>
                            </div>
                            <div class="col-md-5 text-md-end mt-4 mt-md-0">
                                <button class="btn btn-info btn-lg btn-premium text-white fw-bold px-5 shadow w-100" style="background: linear-gradient(135deg, #06b6d4, #0891b2); border: none;" onclick="App.pages.stock_forecast.calculateForecast('fluid')">
                                    <i class="fa-solid fa-droplet me-2"></i> ประมวลผลยอดสั่งซื้อน้ำยา
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="modern-panel shadow-sm p-4 position-relative overflow-hidden" style="display: none; border-radius: 20px; background-color: var(--bg-surface); border: 1px solid var(--border-color);" id="fc-result-panel">
                        <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 200px; pointer-events: none; color: var(--text-dark);"><i class="fa-solid fa-truck-droplet"></i></div>
                        
                        <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 position-relative z-1 flex-wrap gap-3" style="border-color: var(--border-color) !important;">
                            <div>
                                <h5 class="fw-bold mb-1" style="color: var(--text-dark);"><i class="fa-solid fa-clipboard-list text-info me-2"></i> ผลการคำนวณยอดจัดเบิกน้ำยาฟอกไต</h5>
                                <span class="badge border border-info text-info px-3 py-2 shadow-sm rounded-pill" id="fc-summary-badge" style="background: var(--bg-body);"></span>
                            </div>
                            <button class="btn btn-outline-dark fw-bold rounded-pill shadow-sm px-4 card-hover-float" style="border-color: var(--border-color) !important;" onclick="App.pages.stock_forecast.printPO('fluid')">
                                <i class="fa-solid fa-print me-2 text-warning"></i> พิมพ์ใบขอเบิกน้ำยา (Print PR)
                            </button>
                        </div>

                        <div class="table-responsive rounded-3 border position-relative z-1 shadow-sm" style="border-color: var(--border-color) !important;">
                            <table class="table table-premium w-100 mb-0">
                                <thead style="background: var(--bg-body);">
                                    <tr>
                                        <th class="text-center text-info" style="width: 5%;">ลำดับ</th>
                                        <th class="text-center" style="width: 12%;">รหัสสินค้า</th>
                                        <th style="width: 20%;"><i class="fa-solid fa-box me-2"></i> รายการพัสดุ</th>
                                        <th class="text-center text-secondary" style="width: 10%;">คงเหลือรวม</th>
                                        <th class="text-center text-primary" style="width: 12%;">ยอดตั้งต้นเบิก<br><small>(แก้ไขได้)</small></th>
                                        <th class="text-center text-warning">เผื่อฉุกเฉิน<br><small>(+%)</small></th>
                                        <th class="text-center text-dark">ยอดรวมความต้องการ</th>
                                        <th class="text-center text-info" style="border-radius: 8px 8px 0 0; font-size:13px; background: rgba(6, 182, 212, 0.1);"><i class="fa-solid fa-lightbulb me-1"></i> แนะนำสั่งเพิ่ม</th>
                                        <th class="text-center" style="width: 12%;">จัดเบิกจริง</th>
                                    </tr>
                                </thead>
                                <tbody id="fc-table-body" style="background: var(--bg-surface);"></tbody>
                                <tfoot id="fc-table-foot" style="background: var(--bg-surface);"></tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 🚀 Lifecycle: Mount
    init() {
        if (typeof db === 'undefined') return;

        this.#bindEvents();

        const refItems = db.ref('inventory_database_v2/items');
        const cbItems = refItems.on('value', snap => {
            const data = snap.val();
            let rawItems = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
            this.state.allItems = rawItems.filter(item => item !== null);
            this.state.allItems.sort((a, b) => { 
                let orderA = a.order !== undefined && a.order !== null && a.order !== "" ? Number(a.order) : 999; 
                let orderB = b.order !== undefined && b.order !== null && b.order !== "" ? Number(b.order) : 999; 
                return orderA - orderB; 
            });
        });
        this.firebaseListeners.push({ path: 'inventory_database_v2/items', callback: cbItems });
        
        const refLogs = db.ref('inventory_database_v2/transactions');
        const cbLogs = refLogs.on('value', snapLogs => {
            const dataLogs = snapLogs.val();
            this.state.allLogs = dataLogs ? Object.keys(dataLogs).map(k => ({ id: k, ...dataLogs[k] })) : [];
        });
        this.firebaseListeners.push({ path: 'inventory_database_v2/transactions', callback: cbLogs });
    }

    // 🧹 Lifecycle: Unmount
    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        
        const sfBody = document.getElementById('sf-table-body');
        const fcBody = document.getElementById('fc-table-body');
        if (sfBody) sfBody.removeEventListener('change', this.boundHandleInput);
        if (fcBody) fcBody.removeEventListener('change', this.boundHandleInput);

        console.log("🧹 [Stock Forecast] Cleaned up listeners and DOM events.");
    }

    // ---------------------------------------------------------
    // ⚙️ Events Binding (Event Delegation)
    // ---------------------------------------------------------
    #bindEvents() {
        const sfBody = document.getElementById('sf-table-body');
        const fcBody = document.getElementById('fc-table-body');
        
        if (sfBody) sfBody.addEventListener('change', this.boundHandleInput);
        if (fcBody) fcBody.addEventListener('change', this.boundHandleInput);
    }

    #handleTableInput(e) {
        const target = e.target;
        if (target.classList.contains('fc-base-req-input')) {
            const index = target.getAttribute('data-index');
            const tabType = target.closest('tbody').id === 'sf-table-body' ? 'general' : 'fluid';
            this.#updateRowMath(target, tabType, index);
        }
        
        if (target.classList.contains('general-actual-order') || target.classList.contains('fluid-actual-order')) {
            const tabType = target.classList.contains('general-actual-order') ? 'general' : 'fluid';
            this.#updateGrandTotal(tabType);
        }
    }

    // ---------------------------------------------------------
    // 🧮 Smart Logic & Math
    // ---------------------------------------------------------
    #getPrecalculatedUsage(daysBack) {
        const cutoffDate = new Date(); 
        cutoffDate.setDate(cutoffDate.getDate() - daysBack);
        
        let usageDict = {}; 
        this.state.allLogs.forEach(log => {
            if (log.mode === 'out_sub' && new Date(log.timestamp) >= cutoffDate) {
                usageDict[log.itemId] = (usageDict[log.itemId] || 0) + Number(log.qty);
            }
        });
        return usageDict;
    }

    calculateForecast(tabType) {
        if (this.state.allItems.length === 0) { Swal.fire('ข้อมูลไม่พร้อม', 'ไม่พบรายการพัสดุในระบบ', 'warning'); return; }

        let daysToTarget = tabType === 'general' ? (Number(document.getElementById('sf-target-days').value) || 0) : (Number(document.getElementById('fc-target-days').value) || 0);
        let safetyPercent = tabType === 'fluid' ? (Number(document.getElementById('fc-safety-percent').value) || 0) : 0;

        if (daysToTarget <= 0) { Swal.fire('ข้อผิดพลาด', 'กรุณาระบุจำนวนวันที่ต้องการเบิก', 'warning'); return; }

        Swal.fire({ title: 'กำลังประมวลผล...', didOpen: () => Swal.showLoading() });

        const usageDict = this.#getPrecalculatedUsage(30);
        let forecastResults = [];

        this.state.allItems.forEach(item => {
            if(tabType === 'general' && item.category === 'น้ำยาฟอกไต') return;
            if(tabType === 'fluid' && item.category !== 'น้ำยาฟอกไต') return;

            let currentStock = (Number(item.qty_main) || Number(item.qty) || 0) + (Number(item.qty_sub) || 0);
            let baseReqWeekly = Number(item.base_req) || 0; 
            
            if (baseReqWeekly === 0) {
                let totalBurn30 = usageDict[item.id] || 0;
                baseReqWeekly = (totalBurn30 / 30) * 7;
            }

            let dailyBase = baseReqWeekly / 7;
            let baseReq = Math.ceil(dailyBase * daysToTarget); 

            let safetyStock = 0;
            if (tabType === 'general') {
                safetyStock = (Number(item.min_main) || 0) + (Number(item.min_sub) || 0);
            } else {
                safetyStock = Math.ceil(baseReq * (safetyPercent / 100));
            }

            let totalReq = baseReq + safetyStock;
            let suggestedOrder = totalReq - currentStock;
            if (suggestedOrder < 0) suggestedOrder = 0; 

            let orderVal = (item.order !== undefined && item.order !== null && item.order !== "" && item.order !== 999) ? item.order : '-';

            forecastResults.push({
                id: item.id, 
                item_code: item.item_code || '', 
                barcode: item.barcode || '',     
                name: item.name, category: item.category, unit: item.unit, currentStock: currentStock,
                baseReq: baseReq, safetyStock: safetyStock, totalReq: totalReq, suggestedOrder: suggestedOrder, finalOrderQty: suggestedOrder,
                order: orderVal 
            });
        });

        forecastResults.sort((a, b) => {
            let orderA = a.order !== '-' ? Number(a.order) : 9999;
            let orderB = b.order !== '-' ? Number(b.order) : 9999;
            return orderA - orderB;
        });

        if(tabType === 'general') this.state.lastGeneralForecast = forecastResults;
        if(tabType === 'fluid') this.state.lastFluidForecast = forecastResults;

        setTimeout(() => {
            this.#renderForecastTable(forecastResults, tabType, daysToTarget, safetyPercent);
            Swal.close();
        }, 100); 
    }

    #renderForecastTable(results, tabType, daysToTarget, safetyPercent) {
        let prefix = tabType === 'general' ? 'sf' : 'fc';
        document.getElementById(`${prefix}-result-panel`).style.display = 'block';
        
        let badgeText = tabType === 'general' ? `<i class="fa-solid fa-calendar-check me-1"></i> คำนวณยอดสำหรับเบิกใช้งาน ${daysToTarget} วัน` : `<i class="fa-solid fa-calendar-check me-1"></i> คำนวณยอดสำหรับเบิกใช้งาน ${daysToTarget} วัน | เผื่อ Safety ${safetyPercent}%`;
        document.getElementById(`${prefix}-summary-badge`).innerHTML = badgeText;

        const tbody = document.getElementById(`${prefix}-table-body`);
        const tfoot = document.getElementById(`${prefix}-table-foot`);
        let html = '';
        let grandTotalSuggest = 0;

        results.forEach((res, index) => {
            let rowStyle = "cursor:default;"; let suggestStyle = "text-muted"; let suggestLabel = "";
            let inputBgClass = "var(--bg-body)";
            
            if (res.suggestedOrder > 0) { 
                rowStyle = "background-color: rgba(16, 185, 129, 0.05); cursor:default;"; 
                suggestStyle = tabType === 'general' ? "text-primary fw-bold fs-5" : "text-info fw-bold fs-5"; 
                suggestLabel = res.unit || ''; 
                grandTotalSuggest += res.suggestedOrder;
                inputBgClass = "rgba(16, 185, 129, 0.1)";
            }

            const safeName = this.#escapeHTML(res.name);
            const safeCat = this.#escapeHTML(res.category || 'ทั่วไป');
            const safeUnit = this.#escapeHTML(res.unit || 'ชิ้น');
            const safeCode = this.#escapeHTML(res.item_code || '-');

            html += `
            <tr style="${rowStyle}" class="card-hover-float">
                <td class="text-center fw-bold text-secondary" style="font-size: 15px;">${this.#escapeHTML(res.order)}</td>
                <td class="text-center"><span class="badge border border-primary text-primary shadow-sm px-2 py-1" style="font-family: monospace; font-size:13px; border-radius:6px; background: var(--bg-body);">${safeCode}</span></td>
                <td>
                    <div class="fw-bold" style="font-family:'Prompt'; font-size:14.5px; color: var(--text-dark);">${safeName}</div>
                    <div class="small text-muted mt-1"><i class="fa-solid fa-tag me-1 text-secondary"></i>${safeCat} | ${safeUnit}</div>
                </td>
                <td class="text-center fw-bold fs-6 text-secondary fc-current-stock">${res.currentStock}</td>
                <td class="text-center p-2">
                    <input type="number" class="form-control input-modern text-center fw-bold text-primary border-primary shadow-sm fc-base-req-input" data-index="${index}" value="${res.baseReq}" min="0" style="border-radius:10px; background: var(--bg-body);">
                </td>
                <td class="text-center text-warning fw-bold fc-safety-stock" data-val="${res.safetyStock}">${tabType === 'general' ? res.safetyStock : '+ '+res.safetyStock}</td>
                <td class="text-center fw-bold fs-5 fc-total-req" style="color: var(--text-dark);">${res.totalReq}</td>
                <td class="text-center ${suggestStyle} fc-suggest" style="vertical-align: middle;">
                    ${res.suggestedOrder} <span style="font-size: 12px; font-weight: normal;">${this.#escapeHTML(suggestLabel)}</span>
                </td>
                <td class="text-center p-2">
                    <input type="number" class="form-control text-center fw-bold text-success border-success shadow-sm ${tabType}-actual-order" data-index="${index}" value="${res.suggestedOrder}" min="0" style="background:${inputBgClass}; border-radius:10px; font-size:16px; outline:none;">
                </td>
            </tr>`;
        });
        
        if (results.length === 0) { html = `<tr><td colspan="9" class="text-center py-5 text-muted"><i class="fa-solid fa-box-open fa-3x mb-3" style="opacity:0.3;"></i><br>ไม่พบรายการพัสดุในหมวดหมู่นี้</td></tr>`; }
        tbody.innerHTML = html;

        let grandTotalColor = tabType === 'general' ? '#2563eb' : '#06b6d4';
        tfoot.innerHTML = `
            <tr>
                <td colspan="7" class="text-end fw-bold fs-5 py-3" style="color: var(--text-dark);">รวมจำนวนจัดเบิกทั้งหมด (Total Items):</td>
                <td class="text-center text-white fw-bold fs-4 py-3 shadow-sm" style="background-color: ${grandTotalColor}; border-radius: 0 0 0 0;">${grandTotalSuggest}</td>
                <td class="text-center text-white fw-bold fs-4 py-3 shadow-sm" id="${prefix}-grand-actual" style="background-color: #10b981; border-radius: 0 0 12px 12px;">${grandTotalSuggest}</td>
            </tr>
        `;
    }

    #updateRowMath(inputEl, tabType, index) {
        const row = inputEl.closest('tr');
        const baseReq = Number(inputEl.value) || 0;
        const currentStock = Number(row.querySelector('.fc-current-stock').innerText) || 0;
        
        let safety = 0;
        if (tabType === 'general') {
            safety = Number(row.querySelector('.fc-safety-stock').getAttribute('data-val')) || 0;
        } else {
            const safetyPercent = Number(document.getElementById('fc-safety-percent').value) || 0;
            safety = Math.ceil(baseReq * (safetyPercent / 100));
            row.querySelector('.fc-safety-stock').innerText = `+ ${safety}`;
        }
        
        const totalReq = baseReq + safety;
        row.querySelector('.fc-total-req').innerText = totalReq;
        
        let suggest = totalReq - currentStock;
        if (suggest < 0) suggest = 0;
        
        const suggestEl = row.querySelector('.fc-suggest');
        suggestEl.innerHTML = `${suggest}`;
        
        if(suggest > 0) { 
            suggestEl.className = `text-center ${tabType==='general'?'text-primary':'text-info'} fw-bold fs-5 fc-suggest`; 
            row.style.backgroundColor = "rgba(16, 185, 129, 0.05)";
        }
        else { 
            suggestEl.className = `text-center text-muted fw-bold fs-5 fc-suggest`; 
            row.style.backgroundColor = "transparent";
        }
        
        const actualOrderEl = row.querySelector(`.${tabType}-actual-order`);
        if(actualOrderEl) {
            actualOrderEl.value = suggest;
            actualOrderEl.style.backgroundColor = suggest > 0 ? "rgba(16, 185, 129, 0.1)" : "var(--bg-body)";
        }
        
        let dataArray = tabType === 'general' ? this.state.lastGeneralForecast : this.state.lastFluidForecast;
        if(dataArray[index]) {
            dataArray[index].baseReq = baseReq;
            dataArray[index].safetyStock = safety;
            dataArray[index].totalReq = totalReq;
            dataArray[index].suggestedOrder = suggest;
            dataArray[index].finalOrderQty = suggest; 
        }
        this.#updateGrandTotal(tabType);
    }

    #updateGrandTotal(tabType) {
        let total = 0;
        let prefix = tabType === 'general' ? 'sf' : 'fc';
        document.querySelectorAll(`.${tabType}-actual-order`).forEach((input, idx) => { 
            let val = Number(input.value) || 0;
            total += val; 
            
            let dataArray = tabType === 'general' ? this.state.lastGeneralForecast : this.state.lastFluidForecast;
            if (dataArray[idx]) dataArray[idx].finalOrderQty = val;
        });
        const grandActualEl = document.getElementById(`${prefix}-grand-actual`);
        if(grandActualEl) grandActualEl.innerText = total;
    }

    // ---------------------------------------------------------
    // ✈️ Cross-Page Communication
    // ---------------------------------------------------------
    syncToMonthlyReq() {
        let syncData = [];
        let totalItems = 0;

        const processList = (list) => {
            list.forEach(item => {
                let qty = item.finalOrderQty !== undefined ? item.finalOrderQty : item.suggestedOrder;
                if (qty > 0) {
                    syncData.push({
                        code: item.item_code || item.barcode || '-',
                        name: item.name,
                        unit: item.unit,
                        qty: qty,
                        order: item.order 
                    });
                    totalItems++;
                }
            });
        };

        processList(this.state.lastGeneralForecast);
        processList(this.state.lastFluidForecast);

        if(totalItems === 0) {
            Swal.fire('ข้อผิดพลาด', 'ไม่มียอดสั่งซื้อที่คำนวณไว้เลย กรุณากด "ประมวลผลยอดสั่งซื้อ" ก่อนครับ', 'warning');
            return;
        }

        localStorage.setItem('smart_po_sync_data', JSON.stringify(syncData));

        Swal.fire({
            title: 'เตรียมการสำเร็จ!',
            text: `ส่งยอดเบิก ${totalItems} รายการ ไปยังแบบฟอร์มเบิกของประจำเดือนแล้ว กำลังเปลี่ยนหน้า...`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        }).then(() => {
            App.switchPage('monthly_requisition');
        });
    }

    // 🖨️ แก้ไขฟังก์ชัน printPO ให้สั่งพิมพ์ได้จริง
    printPO(tabType) {
        // ดึงข้อมูลที่คำนวณไว้ล่าสุด
        const data = tabType === 'general' ? this.state.lastGeneralForecast : this.state.lastFluidForecast;
        
        if (!data || data.length === 0) {
            Swal.fire('ไม่มีข้อมูล', 'กรุณากด "ประมวลผลยอดสั่งซื้อ" ก่อนสั่งพิมพ์', 'warning');
            return;
        }

        const printWindow = window.open('', '_blank', 'width=900,height=600');
        
        let tableRows = '';
        data.forEach((item, index) => {
            if (item.suggestedOrder > 0) {
                tableRows += `
                    <tr>
                        <td style="text-align:center;">${index + 1}</td>
                        <td>${this.#escapeHTML(item.name)}</td>
                        <td style="text-align:center;">${item.suggestedOrder}</td>
                        <td style="text-align:center;">${this.#escapeHTML(item.unit || '-')}</td>
                    </tr>
                `;
            }
        });

        const html = `
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <title>พิมพ์ใบรายการพัสดุ</title>
            <style>
                body { font-family: sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="no-print" style="margin-bottom:20px;">
                <button onclick="window.print()" style="padding:10px 20px; cursor:pointer;">สั่งพิมพ์ใบรายการนี้</button>
            </div>
            <h2>ใบรายการพัสดุ (${tabType === 'general' ? 'ทั่วไป' : 'น้ำยา'})</h2>
            <table>
                <thead>
                    <tr>
                        <th>ลำดับ</th>
                        <th>ชื่อพัสดุ</th>
                        <th>จำนวนสั่งซื้อ</th>
                        <th>หน่วย</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </body>
        </html>`;

        printWindow.document.write(html);
        printWindow.document.close();
        
        // 🚨 สั่งพิมพ์ทันทีที่โหลดเสร็จ
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 500);
    }

    // 🛡️ Helpers
    #escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
}
const StockForecastPage = new StockForecastPageComponent();
window.StockForecastPage = StockForecastPage;