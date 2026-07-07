// js/pages/usage_statistics.js
// 🚀 Enterprise Usage Statistics Module: FinOps Analytics, Dynamic Charting & Memory-Leak Free

class UsageStatisticsPageComponent {
    constructor() {
        this.state = {
            startDate: '', 
            endDate: '', 
            selectedView: 'monthly', 
            allTransactions: [], 
            inventoryItems: [], 
            chartInstance: null, 
            pieChartInstance: null, 
            hasCleanedUp: false,
            _chartPayload: null,
            _piePayload: null
        };
        this.firebaseListeners = [];
    }

    get html() {
        return `
            <style>
                @keyframes fadeInUpLocal{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
                .fade-in-up{animation:fadeInUpLocal 0.4s cubic-bezier(0.16,1,0.3,1) forwards;opacity:0;}
                .stat-card-analytics{border-radius:20px;padding:24px;position:relative;overflow:hidden;background:#fff;border:1px solid #e2e8f0;transition:all 0.3s ease;height:100%;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);}
                .stat-card-analytics:hover{transform:translateY(-4px);box-shadow:0 15px 30px -10px rgba(0,0,0,0.1);border-color:#cbd5e1;}
                .analytics-icon-bg{position:absolute;top:-20px;right:-20px;opacity:0.04;font-size:130px;pointer-events:none;z-index:0;}
                .table-analytics th{background:#f8fafc;color:#475569;font-weight:700;text-transform:uppercase;font-size:13px;padding:16px;border-bottom:2px solid #e2e8f0;border-top:none;white-space:nowrap;}
                .table-analytics td{padding:14px 16px;vertical-align:middle;border-bottom:1px solid #f1f5f9;font-size:14.5px;}
                
                /* โครงสร้างกล่องตัวกรองสถิติ */
                .view-btn-group { display: flex; flex-wrap: wrap; background: #f8fafc; padding: 4px; border-radius: 50px; border: 1px solid #e2e8f0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); gap: 4px; }
                .view-btn-group .btn{font-family:'Prompt';font-weight:600;font-size:13px;padding:6px 16px;border-radius:50px;transition:all 0.2s;border:none;background:transparent;color:#64748b;}
                .view-btn-group .btn.active{background:var(--primary);color:#fff;box-shadow:0 4px 10px rgba(37,99,235,0.2);}
                
                .badge-fluid{background:#f0fdf4;color:#166534;border:1px solid #bbf7d0;font-weight:700;border-radius:50px;padding:4px 12px;}
                .badge-med{background:#fef2f2;color:#991b1b;border:1px solid #fecaca;font-weight:700;border-radius:50px;padding:4px 12px;}
                
                /* โครงสร้างกล่องเลือกวันที่ */
                .date-filter-container { display: flex; align-items: center; background: #ffffff; padding: 4px 8px; border-radius: 50px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); flex-wrap: wrap; gap: 8px; }
                
                .native-date-wrapper { position: relative; display: inline-flex; align-items: center; justify-content: center; padding: 6px 14px; cursor: pointer; min-width: 145px; border-radius: 50px; background: #f8fafc; border: 1px solid transparent; transition: 0.2s; overflow: hidden; }
                .native-date-wrapper:hover { border-color: #cbd5e1; background: #f1f5f9; }
                .native-date-wrapper input[type="date"] { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 10; border: none; background: transparent; color: transparent; }
                .native-date-wrapper input[type="date"]::-webkit-calendar-picker-indicator { width: 100%; height: 100%; opacity: 0; cursor: pointer; position: absolute; left: 0; top: 0; }
                
                .native-date-wrapper span { position: relative; z-index: 1; font-family: 'Prompt'; font-weight: 800; color: #2563eb; font-size: 14px; pointer-events: none; }
                .native-date-wrapper i { position: relative; z-index: 1; margin-right: 8px; font-size: 16px; color: #2563eb; pointer-events: none; }

                /* 🚨 THE FIX: บังคับแก้ไขสีสว่างให้เป็นโหมดมืด (Dark Mode Support) แบบตายตัว 🚨 */
                html[data-bs-theme="dark"] .stat-card-analytics { background-color: var(--bg-surface) !important; border-color: var(--border-color) !important; }
                html[data-bs-theme="dark"] .stat-card-analytics .text-dark { color: var(--text-dark) !important; }
                html[data-bs-theme="dark"] .view-btn-group { background-color: var(--bg-surface) !important; border-color: var(--border-color) !important; }
                html[data-bs-theme="dark"] .view-btn-group .btn { color: var(--text-muted); }
                html[data-bs-theme="dark"] .view-btn-group .btn.active { color: #fff; }
                html[data-bs-theme="dark"] .date-filter-container { background-color: var(--bg-surface) !important; border-color: var(--border-color) !important; }
                html[data-bs-theme="dark"] .native-date-wrapper { background-color: rgba(255,255,255,0.05) !important; }
                html[data-bs-theme="dark"] .native-date-wrapper:hover { border-color: var(--border-color) !important; background-color: rgba(255,255,255,0.1) !important; }
                html[data-bs-theme="dark"] .table-analytics th { background-color: var(--bg-body) !important; color: var(--text-muted) !important; border-color: var(--border-color) !important; }
                html[data-bs-theme="dark"] .table-analytics td { border-color: var(--border-color) !important; color: var(--text-dark) !important; }
                html[data-bs-theme="dark"] .table-responsive.bg-white { background-color: transparent !important; border-color: var(--border-color) !important; }
            </style>

            <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 class="page-title text-primary" style="font-size:28px;"><i class="fa-solid fa-chart-line me-2"></i> สถิติการเบิกใช้น้ำยาและยาฉีด</h2>
                    <p class="text-muted mt-1 mb-0" id="stat-date-text">ประมวลผลสรุปปริมาณการใช้พัสดุและแสดงรหัสสินค้าอ้างอิง</p>
                </div>
                
                <div class="d-flex gap-2 align-items-center flex-wrap justify-content-end">
                    <div class="view-btn-group">
                        <button class="btn active" id="btn-v-daily" onclick="App.pages.usage_statistics.changeView('daily')">รายวัน</button>
                        <button class="btn" id="btn-v-weekly" onclick="App.pages.usage_statistics.changeView('weekly')">รายสัปดาห์</button>
                        <button class="btn" id="btn-v-monthly" onclick="App.pages.usage_statistics.changeView('monthly')">รายเดือน</button>
                        <button class="btn" id="btn-v-yearly" onclick="App.pages.usage_statistics.changeView('yearly')">รายปี</button>
                    </div>
                    
                    <div class="date-filter-container">
                        <div class="native-date-wrapper" onclick="this.querySelector('input').showPicker ? this.querySelector('input').showPicker() : null">
                            <i class="fa-solid fa-calendar-days"></i><span id="stat-start-display">กำลังโหลด...</span>
                            <input type="date" id="stat-start-date" onchange="App.pages.usage_statistics.onDateChange()">
                        </div>
                        <span class="text-muted fw-bold small mx-1">ถึง</span>
                        <div class="native-date-wrapper" onclick="this.querySelector('input').showPicker ? this.querySelector('input').showPicker() : null">
                            <i class="fa-solid fa-calendar-days"></i><span id="stat-end-display">กำลังโหลด...</span>
                            <input type="date" id="stat-end-date" onchange="App.pages.usage_statistics.onDateChange()">
                        </div>
                        <button class="btn btn-primary rounded-pill px-3 fw-bold shadow-sm" style="z-index:15; font-size: 13px; margin-left: 4px;" onclick="App.pages.usage_statistics.setThisMonth()">เดือนนี้</button>
                    </div>
                    
                    <button class="btn btn-dark fw-bold shadow-sm rounded-pill px-4 card-hover-float" onclick="App.pages.usage_statistics.printReport()"><i class="fa-solid fa-print me-2 text-warning"></i> พิมพ์เอกสาร</button>
                </div>
            </div>

            <div class="row g-3 mb-4">
                <div class="col-md-4">
                    <div class="stat-card-analytics" style="border-top:5px solid #10b981;">
                        <i class="fa-solid fa-faucet-drip analytics-icon-bg"></i>
                        <div class="d-flex justify-content-between mb-2"><div class="text-success fw-bold small text-uppercase">น้ำยาไตเทียม (Dialysate)</div></div>
                        <div class="fs-2 fw-bold text-dark"><span id="lbl-total-fluid"><i class="fas fa-spinner fa-spin fs-4"></i></span> <span class="fs-6 text-muted fw-normal">แกลลอน/ชิ้น</span></div>
                        <p class="text-muted small mt-1 mb-0">น้ำยาพาร์ท A, B และ Concentrates ทุกสูตร</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stat-card-analytics" style="border-top:5px solid #ef4444;">
                        <i class="fa-solid fa-syringe analytics-icon-bg" style="font-size:110px;"></i>
                        <div class="d-flex justify-content-between mb-2"><div class="text-danger fw-bold small text-uppercase">ยาฉีดและเวชภัณฑ์ (Medications)</div></div>
                        <div class="fs-2 fw-bold text-dark"><span id="lbl-total-meds"><i class="fas fa-spinner fa-spin fs-4"></i></span> <span class="fs-6 text-muted fw-normal">Vial/ชิ้น</span></div>
                        <p class="text-muted small mt-1 mb-0">Heparin, EPO และเวชภัณฑ์สิ้นเปลือง</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stat-card-analytics" style="border-top:5px solid #3b82f6;">
                        <i class="fa-solid fa-star analytics-icon-bg"></i>
                        <div class="d-flex justify-content-between mb-2"><div class="text-primary fw-bold small text-uppercase">รายการพัสดุที่เบิกใช้สูงสุด</div></div>
                        <div class="fs-4 fw-bold text-dark text-truncate" id="lbl-top-item" style="font-family:'Prompt';">กำลังคำนวณ...</div>
                        <p class="text-muted small mt-1 mb-0">ไอเทมพัสดุที่มีจำนวนการใช้สูงสุดในช่วงเวลานี้</p>
                    </div>
                </div>
            </div>

            <div class="row g-4 mb-4">
                <div class="col-xl-8">
                    <div class="modern-panel shadow-sm p-4 h-100" style="border-radius:20px; background:var(--bg-surface); border:1px solid var(--border-color); border-top:5px solid var(--info);">
                        <h5 class="fw-bold mb-4" style="color:var(--text-dark);"><i class="fa-solid fa-chart-column text-info me-2"></i> กราฟเปรียบเทียบแนวโน้มปริมาณการเบิกใช้รายหมวดหมู่</h5>
                        <div style="height:320px; width:100%; display:flex; justify-content:center; align-items:center;" id="stat-chart-container"><canvas id="usageStatisticsChart"></canvas></div>
                    </div>
                </div>
                <div class="col-xl-4">
                    <div class="modern-panel shadow-sm p-4 h-100" style="border-radius:20px; background:var(--bg-surface); border:1px solid var(--border-color); border-top:5px solid #8b5cf6;">
                        <h5 class="fw-bold mb-4" style="color:var(--text-dark);"><i class="fa-solid fa-chart-pie text-primary me-2"></i> สัดส่วน Top 5 รายการยอดฮิต</h5>
                        <div style="height:320px; width:100%; display:flex; justify-content:center; align-items:center;" id="stat-pie-container"><canvas id="topItemsPieChart"></canvas></div>
                    </div>
                </div>
            </div>

            <div class="modern-panel shadow-sm p-4 position-relative overflow-hidden" style="border-top:5px solid var(--secondary); border-radius:20px; background:var(--bg-surface); border:1px solid var(--border-color);">
                <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <h5 class="fw-bold text-dark mb-0" style="color:var(--text-dark) !important;"><i class="fa-solid fa-table text-secondary me-2"></i> ตารางวิเคราะห์สรุปยอดแยกประเภทรายการเบิกใช้</h5>
                    <div class="search-box-modern shadow-sm" style="width: 250px; background-color:var(--bg-body); border: 1px solid var(--border-color); border-radius: 50px; padding: 6px 15px;">
                        <i class="fa-solid fa-search text-primary"></i>
                        <input type="text" id="stat-search-inp" class="border-0 bg-transparent ms-2 w-100 fw-bold text-dark" placeholder="ค้นหาชื่อ, รหัส..." onkeyup="App.pages.usage_statistics.filterTable()" style="outline:none;">
                    </div>
                </div>

                <div class="table-responsive bg-white rounded-4 border border-light shadow-sm" style="max-height:500px; overflow-y:auto;">
                    <table class="table table-analytics w-100 mb-0">
                        <thead style="position:sticky; top:0; z-index:10;">
                            <tr>
                                <th>ช่วงเวลา</th>
                                <th class="text-center">หมวดหมู่พัสดุ</th>
                                <th>รหัสพัสดุ (Item Code)</th>
                                <th>ชื่อรายการพัสดุ</th>
                                <th class="text-end" style="width:15%;">จำนวนเบิกทั้งหมด</th>
                                <th class="text-end" style="width:15%;">มูลค่าต้นทุน (฿)</th>
                            </tr>
                        </thead>
                        <tbody id="stat-table-body">
                            <tr><td colspan="6" class="text-center py-5">...กำลังโหลดข้อมูล...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // 🚀 Lifecycle: Mount
    init() {
        if (typeof db === 'undefined') return;
        
        // ❌ เอา Auto Purge ออก ให้ส่วนกลางทำงานแทน

        if(!this.state.startDate || !this.state.endDate) {
            this.setThisMonth();
        } else {
            this.updateDateDisplays();
            this.syncActiveButton();
        }

        this.#setupFirebaseListeners();
    }

    // 🧹 Lifecycle: Unmount
    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        
        if (this.state.chartInstance) {
            this.state.chartInstance.destroy();
            this.state.chartInstance = null;
        }
        if (this.state.pieChartInstance) {
            this.state.pieChartInstance.destroy();
            this.state.pieChartInstance = null;
        }
        console.log("🧹 [Usage Statistics] Cleaned up listeners and charts.");
    }

    // ---------------------------------------------------------
    // 📡 Data Fetching
    // ---------------------------------------------------------
    #setupFirebaseListeners() {
        db.ref('inventory_database_v2/items').once('value', snap => {
            const data = snap.val(); 
            this.state.inventoryItems = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
            
            const cbTrans = db.ref('inventory_database_v2/transactions').on('value', tSnap => {
                if (!document.getElementById('stat-table-body')) return; 
                
                const transData = tSnap.val(); 
                this.state.allTransactions = transData ? Object.keys(transData).map(k => ({ id: k, ...transData[k] })) : [];
                this.processData();
            });
            this.firebaseListeners.push({ path: 'inventory_database_v2/transactions', callback: cbTrans });
        });
    }

    // 🚨 ระบบกวาดล้างข้อมูลเก่าเกิน 5 ปี (Auto-Purge 5 Years) 🚨
    #autoPurgeOldRecords() { 
        this.state.hasCleanedUp = true; 
        const cutoffDate = new Date(); 
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 5); 
        const cutoffStr = cutoffDate.toISOString(); 
        
        db.ref('inventory_database_v2/transactions').orderByChild('timestamp').endAt(cutoffStr).once('value').then(snap => { 
            if(snap.exists()) { 
                let updates = {}; 
                let deletedCount = 0;
                snap.forEach(child => { 
                    updates[child.key] = null; 
                    deletedCount++;
                }); 
                db.ref('inventory_database_v2/transactions').update(updates).then(() => {
                    console.log(`[Auto-Purge] ล้างประวัติสถิติเบิกจ่ายพัสดุที่เก่าเกิน 5 ปี สำเร็จ จำนวน ${deletedCount} รายการ`);
                }); 
            } 
        }); 
    }

    // ---------------------------------------------------------
    // 🎛️ UI & Filtering
    // ---------------------------------------------------------
    formatDateLocal(d) { 
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        let year = d.getFullYear();
        if(month.length < 2) month = '0' + month; 
        if(day.length < 2) day = '0' + day; 
        return [year, month, day].join('-'); 
    }

    formatDateTh(isoStr) { 
        if(!isoStr) return '-'; 
        const d = new Date(isoStr); 
        let dStr = String(d.getDate()).padStart(2, '0');
        let mStr = String(d.getMonth() + 1).padStart(2, '0');
        let yStr = d.getFullYear() + 543;
        return dStr + '/' + mStr + '/' + yStr;
    }
    
    updateDateDisplays() {
        if(document.getElementById('stat-start-date')) document.getElementById('stat-start-date').value = this.state.startDate;
        if(document.getElementById('stat-end-date')) document.getElementById('stat-end-date').value = this.state.endDate;
        if(document.getElementById('stat-start-display')) document.getElementById('stat-start-display').innerText = this.formatDateTh(this.state.startDate);
        if(document.getElementById('stat-end-display')) document.getElementById('stat-end-display').innerText = this.formatDateTh(this.state.endDate);
    }

    onDateChange() {
        const sInput = document.getElementById('stat-start-date').value; 
        const eInput = document.getElementById('stat-end-date').value;
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
        const d = new Date(); 
        const firstDay = new Date(d.getFullYear(), d.getMonth(), 1); 
        const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        this.state.startDate = this.formatDateLocal(firstDay); 
        this.state.endDate = this.formatDateLocal(lastDay); 
        this.updateDateDisplays(); 
        this.processData();
    }

    changeView(vType) { 
        this.state.selectedView = vType; 
        this.syncActiveButton(); 
        this.processData(); 
    }
    
    syncActiveButton() { 
        const btnGroup = document.querySelector('.view-btn-group'); 
        if (!btnGroup) return; 
        btnGroup.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active')); 
        const activeBtn = document.getElementById('btn-v-' + this.state.selectedView); 
        if (activeBtn) activeBtn.classList.add('active'); 
    }

    getWeekNumber(d) { 
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); 
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7)); 
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1)); 
        var weekNo = Math.ceil((((d-yearStart)/86400000)+1)/7); 
        return d.getUTCFullYear() + "-W" + String(weekNo).padStart(2, '0'); 
    }

    // ---------------------------------------------------------
    // 📊 Data Processing
    // ---------------------------------------------------------
    processData() {
        if (!document.getElementById('stat-table-body')) return; 
        if (!this.state.startDate || !this.state.endDate) return;

        let filteredTrans = this.state.allTransactions.filter(t => {
            if (!t.timestamp) return false; 
            let dp = t.timestamp.split('T')[0];
            return dp >= this.state.startDate && dp <= this.state.endDate && (t.mode === 'out_sub' || t.mode === 'out');
        });

        let grandFluidQty = 0; 
        let grandMedsQty = 0; 
        let itemUsageCount = {}; 
        let periodGroups = {};

        filteredTrans.forEach(t => {
            let qty = Math.abs(Number(t.qty || 0)); 
            let dateObj = new Date(t.timestamp); 
            let pKey = '';
            
            if (this.state.selectedView === 'daily') pKey = t.timestamp.split('T')[0];
            else if (this.state.selectedView === 'weekly') pKey = this.getWeekNumber(dateObj);
            else if (this.state.selectedView === 'monthly') pKey = t.timestamp.substring(0, 7);
            else if (this.state.selectedView === 'yearly') pKey = t.timestamp.substring(0, 4);

            let item = this.state.inventoryItems.find(i => i.id === t.itemId);
            let catName = item && item.category ? item.category : 'ทั่วไป';
            let costPrice = item && item.price ? Number(item.price) : 0;
            let finalItemCode = item && item.item_code ? item.item_code : (t.itemCode || '-');
            let finalBarcode = item && item.barcode ? item.barcode : (t.barcode || '-');
            
            let calcCost = costPrice * qty;

            let isFluid = catName.includes('น้ำยา') || t.itemName.includes('น้ำยา') || t.itemName.includes('Dialysate');
            if (isFluid) grandFluidQty += qty; 
            else grandMedsQty += qty;
            
            itemUsageCount[t.itemName] = (itemUsageCount[t.itemName] || 0) + qty;

            if (!periodGroups[pKey]) periodGroups[pKey] = {};
            if (!periodGroups[pKey][t.itemId]) {
                periodGroups[pKey][t.itemId] = { 
                    name: t.itemName, 
                    itemCode: finalItemCode, 
                    barcode: finalBarcode, 
                    cat: isFluid ? 'น้ำยาไตเทียม' : 'ยาฉีดและเวชภัณฑ์', 
                    qty: 0, 
                    cost: 0 
                };
            }
            periodGroups[pKey][t.itemId].qty += qty; 
            periodGroups[pKey][t.itemId].cost += calcCost;
        });

        document.getElementById('lbl-total-fluid').innerText = grandFluidQty.toLocaleString();
        document.getElementById('lbl-total-meds').innerText = grandMedsQty.toLocaleString();

        let sortedTopItems = Object.entries(itemUsageCount).sort((a,b)=>b[1]-a[1]);
        if(sortedTopItems.length > 0) {
            document.getElementById('lbl-top-item').innerText = sortedTopItems[0][0] + ' (' + sortedTopItems[0][1].toLocaleString() + ' ชิ้น)';
        } else {
            document.getElementById('lbl-top-item').innerText = 'ไม่มีข้อมูล';
        }

        let tableHtml = ''; 
        let cLabels = []; 
        let cFluidData = []; 
        let cMedsData = [];
        
        Object.keys(periodGroups).sort().forEach(pKey => {
            let dp = pKey;
            if(this.state.selectedView === 'monthly') { 
                let parts = pKey.split('-'); 
                dp = parts[1] + '/' + (Number(parts[0])+543); 
            } 
            else if(this.state.selectedView === 'yearly') { dp = 'พ.ศ. ' + (Number(pKey)+543); } 
            else if(this.state.selectedView === 'daily') { dp = this.formatDateTh(pKey).substring(0,5); }
            cLabels.push(dp);
            
            let fSum = 0; let mSum = 0;
            Object.keys(periodGroups[pKey]).forEach(iId => { 
                if(periodGroups[pKey][iId].cat === 'น้ำยาไตเทียม') fSum += periodGroups[pKey][iId].qty; 
                else mSum += periodGroups[pKey][iId].qty; 
            });
            cFluidData.push(fSum); 
            cMedsData.push(mSum);
        });

        Object.keys(periodGroups).sort().reverse().forEach(pKey => {
            let itemsInPeriod = periodGroups[pKey];
            Object.keys(itemsInPeriod).forEach(iId => {
                let d = itemsInPeriod[iId]; 
                let badge = d.cat === 'น้ำยาไตเทียม' ? '<span class="badge-fluid"><i class="fa-solid fa-faucet-drip me-1"></i> น้ำยา</span>' : '<span class="badge-med"><i class="fa-solid fa-syringe me-1"></i> เวชภัณฑ์</span>';
                
                let dp = pKey;
                if(this.state.selectedView === 'monthly') { 
                    let parts = pKey.split('-'); 
                    dp = 'เดือน ' + parts[1] + '/' + (Number(parts[0])+543); 
                } 
                else if(this.state.selectedView === 'yearly') { dp = 'ปี พ.ศ. ' + (Number(pKey)+543); } 
                else if(this.state.selectedView === 'daily') { dp = this.formatDateTh(pKey); }
                
                tableHtml += '<tr class="card-hover-float stat-row">' +
                             '<td><span class="badge bg-dark text-white fw-bold px-3 py-1 rounded-pill small">' + this.#escapeHTML(dp) + '</span></td>' +
                             '<td class="text-center">' + badge + '</td>' +
                             '<td><span class="badge bg-primary-subtle text-primary border border-primary-subtle me-1">' + this.#escapeHTML(d.itemCode) + '</span> <span class="badge bg-light text-secondary border"><i class="fa-solid fa-barcode"></i> ' + this.#escapeHTML(d.barcode) + '</span></td>' +
                             '<td><span class="fw-bold text-dark row-search-name" style="font-family:\'Prompt\';">' + this.#escapeHTML(d.name) + '</span></td>' +
                             '<td class="text-end fw-bold text-dark" style="font-size:15px;">' + d.qty.toLocaleString() + '</td>' +
                             '<td class="text-end fw-bold text-primary" style="font-size:15px;">฿' + d.cost.toLocaleString(undefined, {minimumFractionDigits: 2}) + '</td>' +
                             '</tr>';
            });
        });

        if(!tableHtml) {
            tableHtml = '<tr><td colspan="6" class="text-center py-5 text-muted"><i class="fa-solid fa-chart-pie fa-3x mb-3" style="opacity:0.2;"></i><br>ไม่พบประวัติข้อมูลเบิกพัสดุในช่วงเวลาที่เลือก</td></tr>';
        }
        document.getElementById('stat-table-body').innerHTML = tableHtml;

        let top5Names = []; 
        let top5Qtys = [];
        sortedTopItems.slice(0, 5).forEach(item => { 
            top5Names.push(item[0]); 
            top5Qtys.push(item[1]); 
        });

        this.state._chartPayload = { labels: cLabels, fluid: cFluidData, meds: cMedsData };
        this.state._piePayload = { labels: top5Names, data: top5Qtys };
        this.renderChart();
    }

    filterTable() {
        const term = document.getElementById('stat-search-inp').value.toLowerCase();
        const rows = document.querySelectorAll('.stat-row');
        
        rows.forEach(row => {
            const textContent = row.innerText.toLowerCase();
            if (textContent.includes(term)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    renderChart() {
        if (!this.state._chartPayload) return;
        
        const ChartLib = window.Chart;
        if (!ChartLib) return;

        // ดึงสีตาม Theme ปัจจุบันให้กราฟ (Dark Mode Support)
        const themeTextColor = getComputedStyle(document.documentElement).getPropertyValue('--text-dark').trim() || '#334155';
        const themeGridColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#e2e8f0';

        const ctxBar = document.getElementById('usageStatisticsChart');
        if (ctxBar) {
            if (this.state.chartInstance) this.state.chartInstance.destroy();
            this.state.chartInstance = new ChartLib(ctxBar.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: this.state._chartPayload.labels,
                    datasets: [
                        { label: 'น้ำยาไตเทียม (แกลลอน/ชิ้น)', data: this.state._chartPayload.fluid, backgroundColor: 'rgba(16, 185, 129, 0.85)', borderColor: '#10b981', borderWidth: 2, borderRadius: 6 },
                        { label: 'ยาและเวชภัณฑ์ (Vial/ชิ้น)', data: this.state._chartPayload.meds, backgroundColor: 'rgba(239, 68, 68, 0.85)', borderColor: '#ef4444', borderWidth: 2, borderRadius: 6 }
                    ]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false, 
                    plugins: { legend: { position: 'top', labels: { color: themeTextColor, font: { family: 'Prompt', size: 14 } } } }, 
                    scales: { 
                        y: { beginAtZero: true, grid: { color: themeGridColor }, ticks: { color: themeTextColor, font: { family: 'Prompt' } } }, 
                        x: { grid: { color: themeGridColor }, ticks: { color: themeTextColor, font: { family: 'Prompt', size: 13 } } } 
                    }, 
                    animation: { duration: 0 } 
                }
            });
        }

        const ctxPie = document.getElementById('topItemsPieChart');
        if (ctxPie && this.state._piePayload.labels.length > 0) {
            if (this.state.pieChartInstance) this.state.pieChartInstance.destroy();
            this.state.pieChartInstance = new ChartLib(ctxPie.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: this.state._piePayload.labels,
                    datasets: [{ data: this.state._piePayload.data, backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'], hoverOffset: 4, borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-surface').trim() || '#ffffff' }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: themeTextColor, font: { family: 'Prompt', size: 12 } } } }, cutout: '65%', animation: { duration: 0 } }
            });
        }
    }

    // ---------------------------------------------------------
    // 🖨️ Printing & Reporting
    // ---------------------------------------------------------
    printReport() {
        this.renderChart();
        if(!this.state._chartPayload) { Swal.fire('ข้อมูลว่างเปล่า', 'ไม่มีประวัติสถิติเพื่อจัดพิมพ์รายงาน', 'warning'); return; }

        db.ref('clinic_settings_v2').once('value').then(snap => {
            const settings = snap.val() || { clinic_name: "หน่วยไตเทียม" };
            const chartCanvas = document.getElementById('usageStatisticsChart');
            const pieCanvas = document.getElementById('topItemsPieChart');
            let chartImgHtml = ''; 
            let pieImgHtml = '';
            
            if (chartCanvas && this.state.chartInstance) { 
                try { chartImgHtml = '<img src="' + chartCanvas.toDataURL('image/png') + '" style="width:100%; max-height:280px; display:block; margin:0 auto; object-fit:contain;">'; } catch(e){} 
            }
            if (pieCanvas && this.state.pieChartInstance) { 
                try { pieImgHtml = '<img src="' + pieCanvas.toDataURL('image/png') + '" style="width:100%; max-height:280px; display:block; margin:0 auto; object-fit:contain;">'; } catch(e){} 
            }

            let viewTitle = this.state.selectedView === 'daily' ? 'รายวัน' : this.state.selectedView === 'weekly' ? 'รายสัปดาห์' : this.state.selectedView === 'monthly' ? 'รายเดือน' : 'รายปี';
            
            let oldIframe = document.getElementById('hidden-print-frame'); 
            if (oldIframe) oldIframe.remove();
            
            let iframe = document.createElement('iframe'); 
            iframe.id = 'hidden-print-frame'; 
            iframe.style.position = 'fixed'; iframe.style.right = '0'; iframe.style.bottom = '0'; iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = '0'; 
            document.body.appendChild(iframe);

            let doc = iframe.contentWindow.document; 
            doc.open();

            let htmlContent = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>รายงานสถิติพัสดุ</title><link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">' +
                '<style>*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important;}body{font-family:"Sarabun",sans-serif;color:#000;padding:20px;font-size:13px;}.header{text-align:center;margin-bottom:25px;border-bottom:2px solid #000;padding-bottom:15px;}.header h2{font-size:24px;font-weight:700;margin:0;}table{width:100%;border-collapse:collapse;margin-top:20px;}th,td{border:1px solid #000;padding:10px 8px;text-align:left;}th{background-color:#f1f5f9!important;font-weight:bold;}.text-end{text-align:right;}.section-title{font-size:15px;font-weight:bold;margin-top:20px;margin-bottom:10px;border-left:4px solid #2563eb;padding-left:8px;}@media print{@page{size:A4 portrait;margin:12mm;}body{padding:0;}}</style>' +
                '</head><body>' +
                '<div class="header"><h2>' + this.#escapeHTML(settings.clinic_name) + '</h2><h3>รายงานวิเคราะห์สถิติปริมาณการเบิกใช้น้ำยาและยาฉีดเวชภัณฑ์ (' + viewTitle + ')</h3><div style="margin-top:5px;">รอบการประมวลผล: ' + this.formatDateTh(this.state.startDate) + ' ถึง ' + this.formatDateTh(this.state.endDate) + '</div></div>' +
                '<div class="section-title">1. สรุปยอดสะสมรวมพัสดุคลังย่อย</div>' +
                '<div style="display:flex; gap:15px; margin-bottom:25px;">' +
                '<div style="flex:1; border:1px solid #000; padding:12px; text-align:center; background:#f0fdf4;"><b>ยอดใช้น้ำยาไตเทียมสะสม:</b><br><span style="font-size:18px; font-weight:bold;">' + document.getElementById('lbl-total-fluid').innerText + ' แกลลอน/ชิ้น</span></div>' +
                '<div style="flex:1; border:1px solid #000; padding:12px; text-align:center; background:#fef2f2;"><b>ยอดใช้ยาฉีดเวชภัณฑ์สะสม:</b><br><span style="font-size:18px; font-weight:bold;">' + document.getElementById('lbl-total-meds').innerText + ' Vial/ชิ้น</span></div>' +
                '</div>' +
                '<div class="section-title">2. แผนภูมิกราฟการวิเคราะห์ข้อมูล</div>' +
                '<div style="display:flex; gap:15px; margin-bottom:25px;">' +
                '<div style="flex:2; padding:10px; border:1px solid #cbd5e1; border-radius:10px; text-align:center;"><b>กราฟเปรียบเทียบแนวโน้ม</b><br>' + chartImgHtml + '</div>' +
                '<div style="flex:1; padding:10px; border:1px solid #cbd5e1; border-radius:10px; text-align:center;"><b>สัดส่วนรายการเบิกใช้สูงสุด</b><br>' + pieImgHtml + '</div>' +
                '</div>' +
                '<div class="section-title">3. บันทึกตารางแจกแจงรายการแยกประเภท</div>' +
                '<table><thead><tr><th>ช่วงเวลา</th><th>หมวดหมู่</th><th>รหัสพัสดุ</th><th>ชื่อรายการพัสดุทางการแพทย์</th><th class="text-end">จำนวนเบิกใช้</th><th class="text-end">มูลค่า (฿)</th></tr></thead><tbody>' + document.getElementById('stat-table-body').innerHTML + '</tbody></table>' +
                '<div style="text-align:right; margin-top:60px;"><p>ลงชื่อ .............................................................. ผู้จัดทำรายงานสถิติคลัง</p><p style="margin-right:40px;">( ........................................................ )</p></div>' +
                '</body></html>';

            doc.write(htmlContent);
            doc.close();

            Swal.fire({ title: 'กำลังเตรียมเอกสาร...', html: 'ระบบจัดพิมพ์กำลังประมวลผล', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
            
            iframe.onload = function() { 
                setTimeout(() => { 
                    Swal.close(); 
                    iframe.contentWindow.focus(); 
                    iframe.contentWindow.print(); 
                    setTimeout(() => iframe.remove(), 10000); 
                }, 800); 
            };
        });
    }

    #escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
}

// 🌐 Expose Component สู่ระบบ Router
const UsageStatisticsPage = new UsageStatisticsPageComponent();
window.UsageStatisticsPage = UsageStatisticsPage;