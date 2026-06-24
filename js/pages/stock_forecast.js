// js/pages/stock_forecast.js
// 🚀 โมดูลระบบคำนวณยอดเบิกพัสดุ (Smart PO - Fix Sync Order to Monthly Req)

const StockForecastPage = {
    html: `
        <style>
            .forecast-nav-tabs { border-bottom: 2px solid #e2e8f0; gap: 10px; }
            .forecast-nav-tabs .nav-link { border: none; color: var(--muted); font-weight: 600; padding: 14px 28px; border-radius: 12px 12px 0 0; transition: all 0.3s ease; background: transparent; position: relative; font-family:'Prompt'; }
            .forecast-nav-tabs .nav-link:hover { color: var(--primary); background: var(--bg-main); }
            .forecast-nav-tabs .nav-link.active { color: var(--primary); background: #fff; box-shadow: 0 -4px 10px rgba(0,0,0,0.02); }
            .forecast-nav-tabs .nav-link.active::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 100%; height: 3px; background: var(--primary); border-radius: 3px 3px 0 0; }
            .forecast-nav-tabs .nav-link.text-info.active::after { background: var(--info); }
            
            .table-premium tfoot td { background: var(--bg-main); border-top: 2px solid #cbd5e1; }
        </style>

        <div class="page-header mb-4">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                    <h2 class="page-title text-primary" style="font-size: 28px;"><i class="fa-solid fa-robot me-2"></i> คำนวณและจัดทำใบเบิกพัสดุ (Smart Order)</h2>
                    <p class="text-muted mt-1 mb-0">ดึงยอดตั้งต้นเบิกจากฐานข้อมูลคลัง เพื่อคำนวณและส่งไปหน้าฟอร์มเบิกของ (Excel) อัตโนมัติ</p>
                </div>
                <div class="d-flex gap-2 mt-3 mt-md-0">
                    <button class="btn btn-success fw-bold shadow-sm rounded-pill px-4 py-2 card-hover-float" onclick="StockForecastPage.syncToMonthlyReq()" style="background:#10b981; border:none;">
                        <i class="fa-solid fa-paper-plane me-2"></i> นำยอดคำนวณไปสร้างฟอร์มเบิกของ
                    </button>
                    <button class="btn btn-light fw-bold shadow-sm rounded-pill px-4 border text-secondary card-hover-float" onclick="App.switchPage('inventory', document.querySelector('.nav-item:nth-child(8)'))">
                        <i class="fa-solid fa-arrow-left me-2 text-primary"></i> กลับหน้าคลังหลัก
                    </button>
                </div>
            </div>
        </div>

        <ul class="nav forecast-nav-tabs mb-4" id="forecastTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active fw-bold" id="ai-tab" data-bs-toggle="tab" data-bs-target="#ai-panel" type="button" role="tab" style="font-size:16px;">
                    <i class="fa-solid fa-box me-2"></i>เบิกพัสดุทั่วไป (ตามวัน)
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link fw-bold text-info" id="fluid-tab" data-bs-toggle="tab" data-bs-target="#fluid-panel" type="button" role="tab" style="font-size:16px;">
                    <i class="fa-solid fa-droplet me-2"></i>เบิกน้ำยาฟอกไต (ตามวัน)
                </button>
            </li>
        </ul>

        <div class="tab-content" id="forecastTabContent">
            
            <div class="tab-pane fade show active" id="ai-panel" role="tabpanel">
                <div class="modern-panel shadow-sm mb-4 p-4 position-relative overflow-hidden" style="border-top: 5px solid #8b5cf6;">
                    <div style="position: absolute; top: -20px; right: -20px; opacity: 0.03; font-size: 150px; pointer-events: none;"><i class="fa-solid fa-calculator"></i></div>
                    <div class="row g-4 align-items-end position-relative z-1">
                        <div class="col-md-5">
                            <label class="form-label fw-bold mb-2" style="color:#8b5cf6;"><i class="fa-solid fa-calendar-day me-1"></i> ต้องการเบิกสำหรับใช้งานกี่วัน? (Days of Supply)</label>
                            <div class="input-group shadow-sm" style="border-radius: 12px; overflow: hidden; border: 2px solid #8b5cf6;">
                                <span class="input-group-text text-white border-0" style="background:#8b5cf6;"><i class="fa-solid fa-calendar-week px-2"></i></span>
                                <input type="number" id="sf-target-days" class="form-control form-control-lg fw-bold text-center border-0 input-modern" style="color:#8b5cf6; font-size: 20px; border-radius:0; box-shadow:none;" value="14" min="1">
                                <span class="input-group-text bg-white fw-bold text-muted border-0 pe-4">วัน</span>
                            </div>
                        </div>
                        <div class="col-md-7 text-md-end mt-4 mt-md-0">
                            <button class="btn btn-premium btn-lg fw-bold shadow px-5" onclick="StockForecastPage.calculateForecast('general')" style="background: linear-gradient(135deg, #a855f7, #7c3aed); color:white;">
                                <i class="fa-solid fa-bolt me-2"></i> ประมวลผลยอดสั่งซื้อ
                            </button>
                        </div>
                    </div>
                </div>

                <div class="modern-panel shadow-sm p-4 position-relative overflow-hidden" style="display: none;" id="sf-result-panel">
                    <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 200px; pointer-events: none;"><i class="fa-solid fa-boxes-stacked"></i></div>
                    
                    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 position-relative z-1 flex-wrap gap-3">
                        <div>
                            <h5 class="fw-bold text-dark mb-1"><i class="fa-solid fa-clipboard-list text-primary me-2"></i> ผลการคำนวณยอดจัดเบิกพัสดุทั่วไป</h5>
                            <span class="badge badge-soft-success px-3 py-2 shadow-sm rounded-pill" id="sf-summary-badge"></span>
                        </div>
                        <button class="btn btn-dark fw-bold rounded-pill shadow-sm px-4 card-hover-float" style="background:var(--text-dark);" onclick="StockForecastPage.printPO('general')">
                            <i class="fa-solid fa-print me-2 text-warning"></i> พิมพ์ใบขอจัดซื้อ (Print PR)
                        </button>
                    </div>

                    <div class="table-responsive bg-white rounded-3 border border-light position-relative z-1">
                        <table class="table table-premium w-100 mb-0">
                            <thead>
                                <tr>
                                    <th class="text-center text-primary" style="width: 5%;">ลำดับ</th>
                                    <th class="text-center" style="width: 12%;">รหัสสินค้า</th>
                                    <th style="width: 20%;"><i class="fa-solid fa-box me-2"></i> ชื่อรายการพัสดุ</th>
                                    <th class="text-center text-secondary" style="width: 10%;">คงเหลือรวม</th>
                                    <th class="text-center text-primary" style="width: 12%;">ยอดตั้งต้นเบิก<br><small>(แก้ไขได้)</small></th>
                                    <th class="text-center text-warning-emphasis">เผื่อฉุกเฉิน<br><small>(Min-Stock)</small></th>
                                    <th class="text-center text-dark">ยอดรวมความต้องการ</th>
                                    <th class="text-center badge-soft-primary" style="border-radius: 8px 8px 0 0; font-size:13px;"><i class="fa-solid fa-lightbulb me-1"></i> แนะนำสั่งเพิ่ม</th>
                                    <th class="text-center" style="width: 12%;">จัดเบิกจริง</th>
                                </tr>
                            </thead>
                            <tbody id="sf-table-body"></tbody>
                            <tfoot id="sf-table-foot"></tfoot>
                        </table>
                    </div>
                </div>
            </div>

            <div class="tab-pane fade" id="fluid-panel" role="tabpanel">
                <div class="modern-panel shadow-sm mb-4 p-4 position-relative overflow-hidden" style="border-top: 5px solid #06b6d4;">
                    <div style="position: absolute; top: -20px; right: -20px; opacity: 0.03; font-size: 150px; pointer-events: none;"><i class="fa-solid fa-droplet"></i></div>
                    <div class="row g-4 align-items-end position-relative z-1">
                        <div class="col-md-4">
                            <label class="form-label fw-bold text-info mb-2"><i class="fa-solid fa-calendar-day me-1"></i> ต้องการเบิกสำหรับกี่วัน?</label>
                            <div class="input-group shadow-sm" style="border-radius: 12px; overflow: hidden; border: 2px solid #06b6d4;">
                                <span class="input-group-text bg-info text-white border-0"><i class="fa-solid fa-calendar-week px-2"></i></span>
                                <input type="number" id="fc-target-days" class="form-control form-control-lg fw-bold text-info text-center border-0 input-modern" style="font-size: 20px; border-radius:0; box-shadow:none;" value="7" min="1">
                                <span class="input-group-text bg-white fw-bold text-muted border-0 pe-4">วัน</span>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label fw-bold text-danger mb-2"><i class="fa-solid fa-shield-heart me-1"></i> เผื่อฉุกเฉิน Safety (%)</label>
                            <div class="search-box-modern p-0 shadow-sm" style="border-radius: 12px; overflow: hidden; border: 1px solid #fecaca;">
                                <span class="px-3 bg-white"><i class="fa-solid fa-percent text-danger"></i></span>
                                <input type="number" id="fc-safety-percent" class="form-control form-control-lg fw-bold text-center text-danger border-0 w-100 bg-white" style="font-size: 20px; outline:none;" value="10">
                            </div>
                        </div>
                        <div class="col-md-5 text-md-end mt-4 mt-md-0">
                            <button class="btn btn-info btn-lg btn-premium text-white fw-bold px-5 shadow w-100" style="background: linear-gradient(135deg, #06b6d4, #0891b2);" onclick="StockForecastPage.calculateForecast('fluid')">
                                <i class="fa-solid fa-droplet me-2"></i> ประมวลผลยอดสั่งซื้อน้ำยา
                            </button>
                        </div>
                    </div>
                </div>

                <div class="modern-panel shadow-sm p-4 position-relative overflow-hidden" style="display: none;" id="fc-result-panel">
                    <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 200px; pointer-events: none;"><i class="fa-solid fa-truck-droplet"></i></div>
                    
                    <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 position-relative z-1 flex-wrap gap-3">
                        <div>
                            <h5 class="fw-bold text-dark mb-1"><i class="fa-solid fa-clipboard-list text-info me-2"></i> ผลการคำนวณยอดจัดเบิกน้ำยาฟอกไต</h5>
                            <span class="badge badge-soft-info px-3 py-2 shadow-sm rounded-pill" id="fc-summary-badge"></span>
                        </div>
                        <button class="btn btn-dark fw-bold rounded-pill shadow-sm px-4 card-hover-float" style="background:var(--text-dark);" onclick="StockForecastPage.printPO('fluid')">
                            <i class="fa-solid fa-print me-2 text-warning"></i> พิมพ์ใบขอเบิกน้ำยา (Print PR)
                        </button>
                    </div>

                    <div class="table-responsive bg-white rounded-3 border border-light position-relative z-1">
                        <table class="table table-premium w-100 mb-0">
                            <thead>
                                <tr>
                                    <th class="text-center text-info" style="width: 5%;">ลำดับ</th>
                                    <th class="text-center" style="width: 12%;">รหัสสินค้า</th>
                                    <th style="width: 20%;"><i class="fa-solid fa-box me-2"></i> รายการพัสดุ</th>
                                    <th class="text-center text-secondary" style="width: 10%;">คงเหลือรวม</th>
                                    <th class="text-center text-primary" style="width: 12%;">ยอดตั้งต้นเบิก<br><small>(แก้ไขได้)</small></th>
                                    <th class="text-center text-warning-emphasis">เผื่อฉุกเฉิน<br><small>(+%)</small></th>
                                    <th class="text-center text-dark">ยอดรวมความต้องการ</th>
                                    <th class="text-center badge-soft-info" style="border-radius: 8px 8px 0 0; font-size:13px;"><i class="fa-solid fa-lightbulb me-1"></i> แนะนำสั่งเพิ่ม</th>
                                    <th class="text-center" style="width: 12%;">จัดเบิกจริง</th>
                                </tr>
                            </thead>
                            <tbody id="fc-table-body"></tbody>
                            <tfoot id="fc-table-foot"></tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `,

    allItems: [],
    allLogs: [],
    lastGeneralForecast: [],
    lastFluidForecast: [],

    init: function() {
        if (typeof db === 'undefined') return;

        db.ref('inventory_database_v2/items').on('value', snap => {
            const data = snap.val();
            let rawItems = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
            this.allItems = rawItems.filter(item => item !== null);
            this.allItems.sort((a, b) => { let orderA = a.order !== undefined ? Number(a.order) : 999; let orderB = b.order !== undefined ? Number(b.order) : 999; return orderA - orderB; });
        });
        
        db.ref('inventory_database_v2/transactions').on('value', snapLogs => {
            const dataLogs = snapLogs.val();
            this.allLogs = dataLogs ? Object.keys(dataLogs).map(k => ({ id: k, ...dataLogs[k] })) : [];
        });
    },

    getPrecalculatedUsage: function(daysBack) {
        const cutoffDate = new Date(); 
        cutoffDate.setDate(cutoffDate.getDate() - daysBack);
        
        let usageDict = {};
        this.allLogs.forEach(log => {
            if (log.mode === 'out_sub' && new Date(log.timestamp) >= cutoffDate) {
                usageDict[log.itemId] = (usageDict[log.itemId] || 0) + Number(log.qty);
            }
        });
        return usageDict;
    },

    calculateForecast: function(tabType) {
        if (this.allItems.length === 0) { Swal.fire('ข้อมูลไม่พร้อม', 'ไม่พบรายการพัสดุในระบบ', 'warning'); return; }

        let daysToTarget = 0;
        let safetyPercent = 0;

        if(tabType === 'general') {
            daysToTarget = Number(document.getElementById('sf-target-days').value) || 0;
        } else {
            daysToTarget = Number(document.getElementById('fc-target-days').value) || 0;
            safetyPercent = Number(document.getElementById('fc-safety-percent').value) || 0;
        }

        if (daysToTarget <= 0) { Swal.fire('ข้อผิดพลาด', 'กรุณาระบุจำนวนวันที่ต้องการเบิก', 'warning'); return; }

        Swal.fire({ title: 'กำลังประมวลผล...', didOpen: () => Swal.showLoading() });

        const usageDict = this.getPrecalculatedUsage(30);
        let forecastResults = [];

        this.allItems.forEach(item => {
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
                order: orderVal // <--- 🚨 แพ็คลำดับติดไปด้วยตรงนี้
            });
        });

        forecastResults.sort((a, b) => {
            let orderA = a.order !== '-' ? Number(a.order) : 9999;
            let orderB = b.order !== '-' ? Number(b.order) : 9999;
            return orderA - orderB;
        });

        if(tabType === 'general') this.lastGeneralForecast = forecastResults;
        if(tabType === 'fluid') this.lastFluidForecast = forecastResults;

        setTimeout(() => {
            this.renderForecastTable(forecastResults, tabType, daysToTarget, safetyPercent);
            Swal.close();
        }, 100); 
    },

    renderForecastTable: function(results, tabType, daysToTarget, safetyPercent) {
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
            if (res.suggestedOrder > 0) { 
                rowStyle = "background-color: #f8fafc; cursor:default;"; 
                suggestStyle = tabType === 'general' ? "text-primary fw-bold fs-5" : "text-info fw-bold fs-5"; 
                suggestLabel = res.unit || ''; 
                grandTotalSuggest += res.suggestedOrder;
            }

            html += `
            <tr style="${rowStyle}" class="card-hover-float">
                <td class="text-center fw-bold text-secondary" style="font-size: 15px;">${res.order}</td>
                <td class="text-center"><span class="badge bg-primary-subtle text-primary border border-primary-subtle shadow-sm px-2 py-1" style="font-family: monospace; font-size:13px; border-radius:6px;">${res.item_code || '-'}</span></td>
                <td>
                    <div class="fw-bold text-dark" style="font-family:'Prompt'; font-size:14.5px;">${res.name}</div>
                    <div class="small text-muted mt-1"><i class="fa-solid fa-tag me-1 text-secondary"></i>${res.category || 'ทั่วไป'} | ${res.unit || 'ชิ้น'}</div>
                </td>
                <td class="text-center fw-bold fs-6 text-secondary fc-current-stock">${res.currentStock}</td>
                <td class="text-center p-2">
                    <input type="number" class="form-control input-modern text-center fw-bold text-primary border-primary shadow-sm fc-base-req-input" data-index="${index}" value="${res.baseReq}" min="0" onchange="StockForecastPage.updateRowMath(this, '${tabType}', ${index})" style="border-radius:10px;">
                </td>
                <td class="text-center text-warning-emphasis fw-bold fc-safety-stock" data-val="${res.safetyStock}">${tabType === 'general' ? res.safetyStock : '+ '+res.safetyStock}</td>
                <td class="text-center text-dark fw-bold fs-5 fc-total-req">${res.totalReq}</td>
                <td class="text-center ${tabType === 'general' ? 'badge-soft-primary' : 'badge-soft-info'} ${suggestStyle} fc-suggest" style="vertical-align: middle;">
                    ${res.suggestedOrder} <span style="font-size: 12px; font-weight: normal;">${suggestLabel}</span>
                </td>
                <td class="text-center p-2">
                    <input type="number" class="form-control text-center fw-bold text-success border-success shadow-sm ${tabType}-actual-order" data-index="${index}" data-code="${res.item_code || res.barcode}" value="${res.suggestedOrder}" min="0" style="background:#f0fdf4; border-radius:10px; font-size:16px; outline:none;" onchange="StockForecastPage.updateGrandTotal('${tabType}')">
                </td>
            </tr>`;
        });
        
        if (results.length === 0) { html = `<tr><td colspan="9" class="text-center py-5 text-muted"><i class="fa-solid fa-box-open fa-3x mb-3" style="opacity:0.3;"></i><br>ไม่พบรายการพัสดุในหมวดหมู่นี้</td></tr>`; }
        tbody.innerHTML = html;

        let grandTotalColor = tabType === 'general' ? 'bg-primary' : 'bg-info';
        tfoot.innerHTML = `
            <tr>
                <td colspan="7" class="text-end fw-bold text-dark fs-5 py-3">รวมจำนวนจัดเบิกทั้งหมด (Total Items):</td>
                <td class="text-center ${grandTotalColor} text-white fw-bold fs-4 py-3 shadow-sm" style="border-radius: 0 0 0 0;">${grandTotalSuggest}</td>
                <td class="text-center bg-success text-white fw-bold fs-4 py-3 shadow-sm" id="${prefix}-grand-actual" style="border-radius: 0 0 12px 12px;">${grandTotalSuggest}</td>
            </tr>
        `;
    },

    updateRowMath: function(inputEl, tabType, index) {
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
        suggestEl.innerText = suggest;
        
        if(suggest > 0) { suggestEl.className = `text-center ${tabType==='general'?'badge-soft-primary':'badge-soft-info'} text-dark fw-bold fs-5 fc-suggest`; }
        else { suggestEl.className = `text-center bg-light text-muted fw-bold fs-5 fc-suggest border`; }
        
        const actualOrderEl = row.querySelector(`.${tabType}-actual-order`);
        if(actualOrderEl) {
            actualOrderEl.value = suggest;
        }
        
        let dataArray = tabType === 'general' ? this.lastGeneralForecast : this.lastFluidForecast;
        if(dataArray[index]) {
            dataArray[index].baseReq = baseReq;
            dataArray[index].safetyStock = safety;
            dataArray[index].totalReq = totalReq;
            dataArray[index].suggestedOrder = suggest;
            dataArray[index].finalOrderQty = suggest; 
        }
        this.updateGrandTotal(tabType);
    },

    updateGrandTotal: function(tabType) {
        let total = 0;
        let prefix = tabType === 'general' ? 'sf' : 'fc';
        document.querySelectorAll(`.${tabType}-actual-order`).forEach((input, idx) => { 
            let val = Number(input.value) || 0;
            total += val; 
            
            let dataArray = tabType === 'general' ? this.lastGeneralForecast : this.lastFluidForecast;
            if (dataArray[idx]) dataArray[idx].finalOrderQty = val;
        });
        const grandActualEl = document.getElementById(`${prefix}-grand-actual`);
        if(grandActualEl) grandActualEl.innerText = total;
    },

    // 🚨 แก้ไขการส่งข้อมูลข้ามมิติ ให้แพ็คตัวแปร Order ใส่กล่องไปด้วย 🚨
    syncToMonthlyReq: function() {
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
                        order: item.order // <--- 🚨 อุดรอยรั่วตรงนี้! หิ้วลำดับไปด้วย
                    });
                    totalItems++;
                }
            });
        };

        processList(this.lastGeneralForecast);
        processList(this.lastFluidForecast);

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
            App.switchPage('monthly_requisition', document.querySelector('.nav-item[onclick*="monthly_requisition"]'));
        });
    },

    printPO: function(tabType) {
        let prefix = tabType === 'general' ? 'sf' : 'fc';
        let dataToPrint = tabType === 'general' ? this.lastGeneralForecast : this.lastFluidForecast;
        let docTitle = tabType === 'general' ? "ใบขอจัดซื้อ/เบิกพัสดุทั่วไป (Purchase Request)" : "ใบขอจัดซื้อ/เบิกน้ำยาฟอกไต (Fluid Purchase Request)";

        let tbody = document.getElementById(`${prefix}-table-body`);
        if(!tbody) return;

        let itemsToOrder = [];
        let grandTotal = 0; 

        dataToPrint.forEach((item, index) => {
            let actualInput = tbody.querySelector(`.${tabType}-actual-order[data-index="${index}"]`);
            let baseInput = tbody.querySelector(`.fc-base-req-input[data-index="${index}"]`); 
            
            let finalQty = actualInput ? Number(actualInput.value) : item.suggestedOrder;
            let finalBase = baseInput ? Number(baseInput.value) : item.baseReq;
            
            if (finalQty > 0 || finalBase > 0) {
                let safety = item.safetyStock;
                if(tabType === 'fluid') {
                     const safetyPercent = Number(document.getElementById('fc-safety-percent').value) || 0;
                     safety = Math.ceil(finalBase * (safetyPercent / 100));
                }
                
                itemsToOrder.push({
                    name: item.name, unit: item.unit, currentStock: item.currentStock, 
                    item_code: item.item_code,
                    baseReq: finalBase, totalReq: finalBase + safety,
                    suggestedOrder: (finalBase + safety) - item.currentStock > 0 ? (finalBase + safety) - item.currentStock : 0,
                    finalOrderQty: finalQty, order: item.order 
                });
                grandTotal += finalQty; 
            }
        });

        if(itemsToOrder.length === 0) { Swal.fire('ข้อมูลว่างเปล่า', 'ไม่มียอดจัดเบิกพัสดุในตาราง กรุณาคำนวณใหม่', 'warning'); return; }

        db.ref('clinic_settings_v2').once('value', snap => {
            const settings = snap.val() || { clinic_name: "DIALYSIS PRO CLINIC" };
            const printWindow = window.open('', '_blank');
            let tbodyHtml = '';

            itemsToOrder.forEach((item, index) => {
                tbodyHtml += `
                    <tr>
                        <td style="text-align: center;">${item.order}</td>
                        <td style="text-align: center; font-family: monospace;">${item.item_code || '-'}</td>
                        <td>${item.name}</td>
                        <td style="text-align: center; color:#2563eb; font-weight:bold;">${item.baseReq}</td> 
                        <td style="text-align: center; color:#475569;">${item.totalReq}</td>
                        <td style="text-align: center;">${item.currentStock}</td>
                        <td style="text-align: center; font-weight: bold; font-size: 16px;">${item.finalOrderQty} <span style="font-size:12px; font-weight:normal;">${item.unit || ''}</span></td>
                        <td></td>
                    </tr>
                `;
            });

            const html = `
            <!DOCTYPE html>
            <html lang="th">
            <head>
                <meta charset="UTF-8">
                <title>${docTitle}</title>
                <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Sarabun', sans-serif; color: #000; padding: 20px; font-size: 14px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .header h2 { font-size: 24px; font-weight: 700; margin: 0; }
                    .header h3 { font-size: 18px; margin: 5px 0 15px 0; }
                    .meta-info { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th, td { border: 1px solid #000; padding: 10px; }
                    th { background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact; padding-top:15px; padding-bottom:15px;}
                    .summary-row td { font-weight: 700; font-size: 16px; background-color: #e2e8f0 !important; -webkit-print-color-adjust: exact; padding-top:15px; padding-bottom:15px;}
                    .signature-area { display: flex; justify-content: space-around; margin-top: 50px; }
                    .sig-box { text-align: center; width: 30%; }
                    .sig-line { border-bottom: 1px dashed #000; margin-bottom: 10px; height: 30px; }
                    @media print { @page { size: A4 portrait; margin: 15mm; } body { padding: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>${settings.clinic_name}</h2>
                    <h3>${docTitle}</h3>
                </div>
                <div class="meta-info">
                    <div><b>วันที่พิมพ์เอกสาร:</b> ${new Date().toLocaleDateString('th-TH')} เวลา ${new Date().toLocaleTimeString('th-TH')} น.</div>
                    <div><b>เลขที่เอกสาร:</b> PR-${new Date().getTime().toString().slice(-6)}</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 5%;">ลำดับ</th>
                            <th style="width: 12%;">รหัสสินค้า</th>
                            <th style="width: 23%;">รายการพัสดุ</th>
                            <th style="width: 10%;">ยอดตั้งต้น<br>ที่กำหนด</th> 
                            <th style="width: 12%;">ความต้องการ<br>(รวมฉุกเฉิน)</th>
                            <th style="width: 10%;">ยอดคงเหลือ</th>
                            <th style="width: 13%;">จำนวนขอเบิกจริง</th>
                            <th style="width: 15%;">หมายเหตุ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tbodyHtml}
                        <tr class="summary-row">
                            <td colspan="6" style="text-align: right;">รวมจำนวนพัสดุที่ขอจัดเบิกทั้งสิ้น (Grand Total Items):</td>
                            <td style="text-align: center; font-size: 20px; text-decoration: underline;">${grandTotal}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
                <div class="signature-area">
                    <div class="sig-box"><div class="sig-line"></div>(......................................................)<br>ผู้ขอเบิก / จัดทำ</div>
                    <div class="sig-box"><div class="sig-line"></div>(......................................................)<br>ผู้ตรวจสอบ / หัวหน้าพยาบาล</div>
                    <div class="sig-box"><div class="sig-line"></div>(......................................................)<br>ผู้อนุมัติ / แพทย์ผู้ดูแล</div>
                </div>
            </body>
            </html>`;

            printWindow.document.write(html);
            printWindow.document.close();
            
            setTimeout(() => { printWindow.focus(); printWindow.print(); }, 500);
        });
    }
};