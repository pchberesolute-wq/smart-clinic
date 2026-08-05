// js/pages/stock_forecast.js
// 🚀 Enterprise Smart PO Engine: Zero-Overflow Grid, Catch-All Logs & Isolated Sync (v11.0 FULL)

class StockForecastPageComponent {
    constructor() {
        this.state = {
            allItems: [],
            allLogs: [],
            historicalVisits30d: 0, 
            lastGeneralForecast: [],
            lastFluidForecast: []
        };
        this.firebaseListeners = [];
        this.debounceTimer = null; 
        this.boundHandleInput = this.#handleTableInput.bind(this);
    }

    switchTab(tabId) {
        document.querySelectorAll('.forecast-nav-tabs .forecast-nav-link').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('#forecastTabContent .custom-tab-pane').forEach(pane => {
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
                .table-premium th { color: var(--text-muted); font-weight: 700; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px; padding: 14px 10px; border-bottom: 2px solid var(--border-color); }
                .table-premium td { padding: 14px 10px; vertical-align: middle; border-bottom: 1px solid var(--border-color); transition: background 0.2s; }
                
                ul.forecast-nav-tabs { display: flex !important; flex-direction: row !important; border-bottom: 2px solid var(--border-color) !important; margin: 0 0 -1px 0 !important; padding-left: 0 !important; list-style-type: none !important; gap: 5px !important; overflow-x: auto !important; position: relative; z-index: 10; }
                ul.forecast-nav-tabs::-webkit-scrollbar { height: 4px; }
                ul.forecast-nav-tabs::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
                ul.forecast-nav-tabs li { list-style: none !important; margin: 0 !important; padding: 0 !important; }

                .forecast-nav-link { display: inline-flex; align-items: center; background: transparent; border: none !important; padding: 14px 24px; font-family: 'Prompt', sans-serif; font-weight: 600; font-size: 16px; color: var(--text-muted); cursor: pointer; border-radius: 12px 12px 0 0; position: relative; transition: all 0.2s; outline: none !important; }
                .forecast-nav-link:hover { background-color: rgba(139, 92, 246, 0.1) !important; color: #8b5cf6 !important; }
                .forecast-nav-link.active { background-color: var(--bg-surface) !important; color: #8b5cf6 !important; font-weight: 700; box-shadow: 0 -4px 10px rgba(0,0,0,0.02);}
                .forecast-nav-link.active::after { content: ''; position: absolute; bottom: -2px; left: 0; right: 0; height: 3px; background: #8b5cf6; border-radius: 3px 3px 0 0; }
                
                #btn-fluid-panel.active { color: #06b6d4 !important; }
                #btn-fluid-panel.active::after { background: #06b6d4 !important; }
                #btn-fluid-panel:hover { background-color: rgba(6, 182, 212, 0.1) !important; color: #06b6d4 !important; }
                
                /* 🚨 THE ULTIMATE FIX: เปลี่ยนความสูงเป็นแบบ Fluid ยืดหยุ่นตามหน้าจอ */
                #forecastTabContent { 
                    display: grid; 
                    grid-template-columns: 1fr; 
                    grid-template-rows: 1fr; 
                    width: 100%; 
                    margin-bottom: 2rem; 
                    /* ให้ความสูงเท่ากับหน้าจอ ลบด้วยพื้นที่ Header ด้านบน */
                    height: calc(100vh - 350px);
                    min-height: 450px;
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
                    min-height: 0; /* 🚨 บังคับให้ Grid ขังเนื้อหาไว้ ห้ามเบ่งตัวออก */
                }
                .custom-tab-pane.active { opacity: 1; visibility: visible; pointer-events: auto; z-index: 5; }

                .panel-locked { 
                    height: 100% !important; 
                    display: flex; 
                    flex-direction: column; 
                    margin-bottom: 0 !important; 
                    border-top-left-radius: 0 !important; 
                    min-height: 0; /* 🚨 สำคัญที่สุด เพื่อให้ flex child สกอล์ได้ */
                }

                .locked-table-wrapper { 
                    flex-grow: 1; 
                    min-height: 0; /* 🚨 สวมเกราะให้กล่องนี้หดตัวอยู่ใน Parent ได้ */
                    overflow-y: auto; 
                    overflow-x: auto; 
                    background-color: var(--bg-surface); 
                    border: 1px solid var(--border-color); 
                    border-radius: 16px; 
                    box-shadow: var(--shadow-sm); 
                }
                .locked-table-wrapper::-webkit-scrollbar { width: 8px; height: 8px; }
                .locked-table-wrapper::-webkit-scrollbar-track { background: transparent; }
                .locked-table-wrapper::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .locked-table-wrapper::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

                .table-forecast { border-collapse: collapse !important; margin-bottom: 0; width: 100%; table-layout: fixed; }
                .table-forecast th { background: var(--bg-body); color: var(--text-muted); font-weight: 700; text-transform: uppercase; font-size: 13px; padding: 14px 12px; border-bottom: 2px solid var(--border-color); border-top: none; white-space: nowrap; position: sticky; top: 0; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                .table-forecast td { padding: 14px 12px; vertical-align: middle; border-bottom: 1px solid var(--border-color); font-size: 14px; background: transparent; color: var(--text-dark); }
            </style>

            <div class="page-header mb-4">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h2 class="page-title text-primary" style="font-size: 28px;"><i class="fa-solid fa-robot me-2"></i> คำนวณและจัดทำใบเบิกพัสดุ (Smart Order)</h2>
                        <p class="text-muted mt-1 mb-0">ดึงยอดตั้งต้นเบิกจากฐานข้อมูลคลัง เพื่อคำนวณและส่งไปหน้าฟอร์มเบิกของ (Excel) อัตโนมัติ</p>
                    </div>
                    <div class="d-flex gap-2 mt-3 mt-md-0">
                        <button class="btn btn-outline-danger fw-bold shadow-sm rounded-pill px-3 py-2 card-hover-float" onclick="App.pages.stock_forecast.clearAllForecast()">
                            <i class="fa-solid fa-trash-can me-2"></i> ล้างทั้งหมด
                        </button>
                        <button class="btn btn-premium-success fw-bold shadow-sm rounded-pill px-4 py-2 card-hover-float" onclick="App.pages.stock_forecast.syncToMonthlyReq()">
                            <i class="fa-solid fa-paper-plane me-2"></i> นำยอดคำนวณไปสร้างฟอร์มเบิกของ
                        </button>
                        <button class="btn btn-outline-secondary fw-bold shadow-sm rounded-pill px-4" onclick="App.switchPage('inventory')">
                            <i class="fa-solid fa-arrow-left me-2 text-primary"></i> กลับหน้าคลังหลัก
                        </button>
                    </div>
                </div>
            </div>

            <ul class="forecast-nav-tabs">
                <li>
                    <button class="forecast-nav-link active" id="btn-ai-panel" onclick="App.pages.stock_forecast.switchTab('ai-panel')">
                        <i class="fa-solid fa-box me-2"></i>เบิกพัสดุทั่วไป (ตามวัน)
                    </button>
                </li>
                <li>
                    <button class="forecast-nav-link" id="btn-fluid-panel" onclick="App.pages.stock_forecast.switchTab('fluid-panel')">
                        <i class="fa-solid fa-droplet me-2"></i>เบิกน้ำยาฟอกไต (ตามวัน)
                    </button>
                </li>
            </ul>

            <div id="forecastTabContent">
                
                <div class="custom-tab-pane active" id="ai-panel">
                    <div class="modern-panel panel-locked shadow-sm p-4 position-relative overflow-hidden" style="border-top: 5px solid #8b5cf6; border-radius: 0 20px 20px 20px; background-color: var(--bg-surface); border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                        <div style="position: absolute; top: -20px; right: -20px; opacity: 0.03; font-size: 150px; pointer-events: none; color: #8b5cf6;"><i class="fa-solid fa-calculator"></i></div>
                        <div class="row g-4 align-items-end position-relative z-1 mb-4">
                            <div class="col-md-5">
                                <label class="form-label fw-bold mb-2" style="color:#8b5cf6;"><i class="fa-solid fa-calendar-day me-1"></i> ต้องการเบิกสำหรับใช้งานกี่วัน?</label>
                                <div class="input-group shadow-sm" style="border-radius: 12px; overflow: hidden; border: 2px solid #8b5cf6;">
                                    <span class="input-group-text text-white border-0" style="background:#8b5cf6;"><i class="fa-solid fa-calendar-week px-2"></i></span>
                                    <input type="number" id="sf-target-days" class="form-control form-control-lg fw-bold text-center border-0 input-modern" style="color:#8b5cf6; font-size: 20px; border-radius:0; box-shadow:none; background: var(--bg-body);" value="14" min="1" oninput="App.pages.stock_forecast.triggerLiveCalculation('general')">
                                    <span class="input-group-text fw-bold text-muted border-0 pe-4" style="background: var(--bg-body);">วัน</span>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-bold mb-2 text-secondary"><i class="fa-solid fa-shield-halved me-1"></i> เผื่อความปลอดภัย (Safety)</label>
                                <div class="input-group shadow-sm" style="border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color);">
                                    <input type="number" id="sf-safety-factor" class="form-control fw-bold text-center border-0 input-modern" style="background: var(--bg-body);" value="20" min="0" max="100" oninput="App.pages.stock_forecast.triggerLiveCalculation('general')">
                                    <span class="input-group-text fw-bold text-muted border-0" style="background: var(--bg-body);">%</span>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <button class="btn btn-premium w-100 fw-bold shadow-sm" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); color: white; padding: 12px 20px; font-size: 16px;" onclick="App.pages.stock_forecast.calculateForecast('general', true)">
                                    <i class="fa-solid fa-wand-magic-sparkles me-2"></i> ประมวลผลพัสดุ
                                </button>
                            </div>
                        </div>

                        <div class="locked-table-wrapper">
                            <table class="table table-forecast" id="table-general">
                                <thead>
                                    <tr>
                                        <th style="width: 5%;" class="text-center">#</th>
                                        <th style="width: 25%;">ชื่อพัสดุ</th>
                                        <th style="width: 15%;" class="text-center" title="ค่าเฉลี่ยการใช้งานต่อวัน">ใช้เฉลี่ย/วัน</th>
                                        <th style="width: 15%;" class="text-center" title="คาดการณ์การใช้งานตามจำนวนวันที่ระบุ">คาดการณ์ใช้งาน</th>
                                        <th style="width: 15%;" class="text-center text-primary" title="ยอดคงเหลือรวม (คลังใหญ่+ย่อย)">ยอดคงเหลือรวม</th>
                                        <th style="width: 15%;" class="text-center text-warning-dark" title="คำนวณจากเปอร์เซ็นต์ที่ระบุ">เผื่อขาด</th>
                                        <th style="width: 15%;" class="text-center text-success" title="ยอดที่ระบบแนะนำให้สั่งซื้อ">แนะนำสั่งซื้อ</th>
                                        <th style="width: 15%;" class="text-center" title="แก้ไขตัวเลขใบเบิกจริง">ยอดเบิกจริง (Adjust)</th>
                                    </tr>
                                </thead>
                                <tbody id="sf-result-body">
                                    <tr><td colspan="8" class="text-center py-5 text-muted"><i class="fa-solid fa-calculator fa-3x mb-3" style="opacity: 0.2;"></i><br>กรุณากดปุ่ม <b>ประมวลผลพัสดุ</b> เพื่อคำนวณ</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="custom-tab-pane" id="fluid-panel">
                    <div class="modern-panel panel-locked shadow-sm p-4 position-relative overflow-hidden" style="border-top: 5px solid #06b6d4; border-radius: 0 20px 20px 20px; background-color: var(--bg-surface); border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                        <div style="position: absolute; top: -20px; right: -20px; opacity: 0.03; font-size: 150px; pointer-events: none; color: #06b6d4;"><i class="fa-solid fa-droplet"></i></div>
                        
                        <div class="row g-4 align-items-end position-relative z-1 mb-4">
                            <div class="col-lg-3 col-md-6">
                                <label class="form-label fw-bold mb-2" style="color:#06b6d4;"><i class="fa-solid fa-calendar-day me-1"></i> ต้องการเบิกใช้กี่วัน?</label>
                                <div class="input-group shadow-sm" style="border-radius: 12px; overflow: hidden; border: 2px solid #06b6d4;">
                                    <span class="input-group-text text-white border-0" style="background:#06b6d4;"><i class="fa-solid fa-calendar-week px-2"></i></span>
                                    <input type="number" id="sf-fluid-target-days" class="form-control form-control-lg fw-bold text-center border-0 input-modern" style="color:#06b6d4; font-size: 20px; border-radius:0; box-shadow:none; background: var(--bg-body);" value="14" min="1" oninput="App.pages.stock_forecast.triggerLiveCalculation('fluid')">
                                    <span class="input-group-text fw-bold text-muted border-0" style="background: var(--bg-body);">วัน</span>
                                </div>
                            </div>
                            <div class="col-lg-3 col-md-6">
                                <label class="form-label fw-bold mb-2 text-secondary"><i class="fa-solid fa-hospital-user me-1"></i> จำนวนคนไข้ (ต่อวัน)</label>
                                <div class="input-group shadow-sm" style="border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color);">
                                    <input type="number" id="sf-fluid-patients-per-day" class="form-control fw-bold text-center border-0 input-modern" style="background: var(--bg-body);" value="60" min="1" oninput="App.pages.stock_forecast.triggerLiveCalculation('fluid')">
                                    <span class="input-group-text fw-bold text-muted border-0" style="background: var(--bg-body);">คิว</span>
                                </div>
                            </div>
                            <div class="col-lg-3 col-md-6">
                                <label class="form-label fw-bold mb-2 text-warning-dark"><i class="fa-solid fa-shield-halved me-1"></i> เผื่อความปลอดภัย</label>
                                <div class="input-group shadow-sm" style="border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color);">
                                    <input type="number" id="sf-fluid-safety-factor" class="form-control fw-bold text-center border-0 input-modern text-warning-dark" style="background: var(--bg-body);" value="10" min="0" max="100" oninput="App.pages.stock_forecast.triggerLiveCalculation('fluid')">
                                    <span class="input-group-text fw-bold text-muted border-0" style="background: var(--bg-body);">%</span>
                                </div>
                            </div>
                            <div class="col-lg-3 col-md-6">
                                <button class="btn btn-premium w-100 fw-bold shadow-sm" style="background: linear-gradient(135deg, #06b6d4, #0284c7); color: white; padding: 12px 20px; font-size: 16px;" onclick="App.pages.stock_forecast.calculateForecast('fluid', true)">
                                    <i class="fa-solid fa-wand-magic-sparkles me-2"></i> คำนวณน้ำยาฟอกไต
                                </button>
                            </div>
                        </div>
                        
                        <div class="alert alert-info py-2 px-3 fw-bold small shadow-sm mb-4 border-info-subtle" style="border-radius: 10px; background-color: rgba(6, 182, 212, 0.05);"><i class="fa-solid fa-circle-info me-2 text-info"></i>ระบบจะคัดกรองเฉพาะพัสดุในหมวดหมู่ <b>"น้ำยาไตเทียม"</b> หรือที่เกี่ยวข้องมาคำนวณตามสัดส่วนคิวคนไข้เท่านั้น</div>

                        <div class="locked-table-wrapper">
                            <table class="table table-forecast" id="table-fluid">
                                <thead>
                                    <tr>
                                        <th style="width: 5%;" class="text-center">#</th>
                                        <th style="width: 30%;">ชื่อน้ำยาฟอกไต</th>
                                        <th style="width: 15%;" class="text-center" title="ค่าเฉลี่ยการใช้งานต่อ 1 คิวฟอกเลือด">ใช้เฉลี่ย/คิว</th>
                                        <th style="width: 15%;" class="text-center" title="คาดการณ์การใช้งานตามจำนวนวันที่ระบุ">คาดการณ์ใช้งาน</th>
                                        <th style="width: 15%;" class="text-center text-primary" title="ยอดคงเหลือรวม (คลังใหญ่+ย่อย)">ยอดคงเหลือรวม</th>
                                        <th style="width: 15%;" class="text-center text-warning-dark" title="ยอดเผื่อฉุกเฉิน">เผื่อขาด</th> 
                                        <th style="width: 15%;" class="text-center text-success" title="ยอดที่ระบบแนะนำให้สั่งซื้อ">แนะนำสั่งซื้อ</th>
                                        <th style="width: 15%;" class="text-center" title="แก้ไขตัวเลขใบเบิกจริง">ยอดเบิกจริง (Adjust)</th>
                                    </tr>
                                </thead>
                                <tbody id="sf-fluid-result-body">
                                    <tr><td colspan="8" class="text-center py-5 text-muted"><i class="fa-solid fa-calculator fa-3x mb-3" style="opacity: 0.2;"></i><br>กรุณากดปุ่ม <b>คำนวณน้ำยาฟอกไต</b> เพื่อคำนวณ</td></tr>
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
            console.error("Firebase DB not found");
            return;
        }

        const tableGeneral = document.getElementById('table-general');
        const tableFluid = document.getElementById('table-fluid');
        if(tableGeneral) tableGeneral.addEventListener('input', this.boundHandleInput);
        if(tableFluid) tableFluid.addEventListener('input', this.boundHandleInput);

        // 1. Fetch Items
        const cbItems = db.ref('inventory_database_v2/items').on('value', snap => {
            const data = snap.val();
            this.state.allItems = data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : [];
            this.state.allItems = this.state.allItems.filter(item => !item.isArchived);
        });
        this.firebaseListeners.push({ path: 'inventory_database_v2/items', callback: cbItems });

        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        const nowMs = new Date().getTime();

        const cbTrans = db.ref('inventory_database_v2/transactions').limitToLast(10000).on('value', snap => {
            let logs = [];
            snap.forEach(child => {
                const log = child.val();
                if (log && log.timestamp) {
                    const logTime = new Date(log.timestamp).getTime();
                    if (nowMs - logTime <= thirtyDaysInMs) {
                        const mode = String(log.mode || '').toLowerCase();
                        if (!mode.includes('in_') && !mode.includes('import') && !mode.includes('add')) {
                            logs.push({ id: child.key, ...log });
                        }
                    }
                }
            });
            this.state.allLogs = logs;
            console.log(`[Smart PO] Loaded ${this.state.allLogs.length} outbound logs from last 30 days.`);
        });
        this.firebaseListeners.push({ path: 'inventory_database_v2/transactions', callback: cbTrans });

        const thirtyDaysAgoDate = new Date(nowMs - thirtyDaysInMs);
        const cutoffDateStr = thirtyDaysAgoDate.toISOString().split('T')[0];

        const cbVisits = db.ref('patients_database_v2/visits').orderByChild('date').startAt(cutoffDateStr).on('value', snap => {
            let visitCount = 0;
            snap.forEach(child => {
                const v = child.val();
                if (v && v.status === 'เสร็จสิ้น') visitCount++; 
            });
            this.state.historicalVisits30d = visitCount;
            console.log(`[Smart PO] Loaded ${this.state.historicalVisits30d} completed visits from last 30 days.`);
        });
        this.firebaseListeners.push({ path: 'patients_database_v2/visits', callback: cbVisits });

        setTimeout(() => {
            if (this.state.lastGeneralForecast && this.state.lastGeneralForecast.length > 0) {
                this.renderGeneralTable(this.state.lastGeneralForecast);
            }
            if (this.state.lastFluidForecast && this.state.lastFluidForecast.length > 0) {
                this.renderFluidTable(this.state.lastFluidForecast);
            }
        }, 100);
    }

    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        
        if (this.debounceTimer) clearTimeout(this.debounceTimer);

        const tableGeneral = document.getElementById('table-general');
        const tableFluid = document.getElementById('table-fluid');
        if(tableGeneral) tableGeneral.removeEventListener('input', this.boundHandleInput);
        if(tableFluid) tableFluid.removeEventListener('input', this.boundHandleInput);
    }

    escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }

    #handleTableInput(e) {
        if(e.target.classList.contains('fc-base-req-input')) {
            const row = e.target.closest('tr');
            if(row) row.classList.add('bg-warning-subtle');
            
            const index = e.target.getAttribute('data-index');
            const type = e.target.closest('table').id === 'table-general' ? 'general' : 'fluid';
            const value = parseFloat(e.target.value) || 0;
            
            if(type === 'general' && this.state.lastGeneralForecast[index]) {
                this.state.lastGeneralForecast[index].adjustedReq = value;
            } else if (type === 'fluid' && this.state.lastFluidForecast[index]) {
                this.state.lastFluidForecast[index].adjustedReq = value;
            }
        }
    }

    clearAllForecast() {
        Swal.fire({
            title: 'ยืนยันการล้างข้อมูล?',
            text: 'ต้องการล้างรายการผลการคำนวณทั้งหมดบนหน้าจอใช่หรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'ใช่, ล้างข้อมูล',
            cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'premium-alert' }
        }).then((res) => {
            if (res.isConfirmed) {
                this.state.lastGeneralForecast = [];
                this.state.lastFluidForecast = [];
                document.getElementById('sf-result-body').innerHTML = '<tr><td colspan="8" class="text-center py-5 text-muted"><i class="fa-solid fa-calculator fa-3x mb-3" style="opacity: 0.2;"></i><br>กรุณากดปุ่ม <b>ประมวลผลพัสดุ</b> เพื่อคำนวณ</td></tr>';
                document.getElementById('sf-fluid-result-body').innerHTML = '<tr><td colspan="8" class="text-center py-5 text-muted"><i class="fa-solid fa-calculator fa-3x mb-3" style="opacity: 0.2;"></i><br>กรุณากดปุ่ม <b>คำนวณน้ำยาฟอกไต</b> เพื่อคำนวณ</td></tr>';
                localStorage.removeItem('smart_po_sync_data');
                if(window.SecurityShield) window.SecurityShield.showNativeToast('ล้างข้อมูลหน้าคำนวณเรียบร้อยแล้ว');
            }
        });
    }

    triggerLiveCalculation(tabType) {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.calculateForecast(tabType, false); 
        }, 400); 
    }

    calculateForecast(tabType, showLoadingPopup = true) {
        if (this.state.allItems.length === 0) {
            if (showLoadingPopup) Swal.fire('ข้อผิดพลาด', 'ไม่พบรายการพัสดุในระบบ', 'warning');
            return;
        }

        if (showLoadingPopup) {
            Swal.fire({ title: 'กำลังประมวลผลข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        }

        setTimeout(() => {
            try {
                let targetDays = parseInt(document.getElementById(tabType === 'general' ? 'sf-target-days' : 'sf-fluid-target-days').value) || 0;
                let safetyPercent = parseInt(document.getElementById(tabType === 'general' ? 'sf-safety-factor' : 'sf-fluid-safety-factor')?.value) || 0;
                let patientsPerDay = parseInt(document.getElementById('sf-fluid-patients-per-day')?.value) || 0;

                let results = [];
                const fluidCategories = ['น้ำยาไตเทียม', 'น้ำยาฟอกไต', 'น้ำยาล้างไต', 'dialysate'];
                
                let itemsToProcess = tabType === 'general' 
                    ? this.state.allItems.filter(i => {
                        const cat = String(i.category || '').trim().toLowerCase();
                        return !fluidCategories.some(fc => cat.includes(fc)) && cat !== 'เงินเดือน/ค่าจ้าง';
                    })
                    : this.state.allItems.filter(i => {
                        const cat = String(i.category || '').trim().toLowerCase();
                        return fluidCategories.some(fc => cat.includes(fc));
                    });

                const consumptionMap = new Map();
                this.state.allLogs.forEach(log => {
                    const qty = Math.abs(Number(log.qty) || 0);
                    const safeItemId = log.itemId || log.item_id; 
                    if (safeItemId) {
                        consumptionMap.set(safeItemId, (consumptionMap.get(safeItemId) || 0) + qty);
                    }
                });

                let historicalVisits = this.state.historicalVisits30d || 0;

                itemsToProcess.forEach(item => {
                    let totalConsumed30d = consumptionMap.get(item.id) || 0;
                    
                    let dailyRate = 0;
                    let expectedDemand = 0;
                    let usageSourceHtml = '';

                    if (tabType === 'general') {
                        dailyRate = totalConsumed30d / 30;
                        expectedDemand = dailyRate * targetDays;
                        
                        if (expectedDemand === 0) {
                            expectedDemand = Number(item.base_req) || 0; 
                            dailyRate = expectedDemand / targetDays; 
                            usageSourceHtml = '<br><span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle mt-1" style="font-size:10px;">(ดึงจากค่าตั้งต้น)</span>';
                        } else {
                            usageSourceHtml = '<br><span class="badge bg-success-subtle text-success-emphasis border border-success-subtle mt-1" style="font-size:10px;">(เฉลี่ยจาก 30 วัน)</span>';
                        }
                    } else {
                        if (historicalVisits > 0 && totalConsumed30d > 0) {
                            let perVisitRate = totalConsumed30d / historicalVisits;
                            dailyRate = perVisitRate * patientsPerDay; 
                            expectedDemand = dailyRate * targetDays;
                            usageSourceHtml = '<br><span class="badge bg-success-subtle text-success-emphasis border border-success-subtle mt-1" style="font-size:10px;">(คำนวณจากคิว 30 วัน)</span>';
                        } else if (totalConsumed30d > 0) {
                            dailyRate = totalConsumed30d / 30;
                            expectedDemand = dailyRate * targetDays;
                            usageSourceHtml = '<br><span class="badge bg-success-subtle text-success-emphasis border border-success-subtle mt-1" style="font-size:10px;">(เฉลี่ยจาก 30 วัน)</span>';
                        } else {
                            expectedDemand = Number(item.base_req) || 0;
                            dailyRate = expectedDemand / targetDays; 
                            usageSourceHtml = '<br><span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle mt-1" style="font-size:10px;">(ดึงจากค่าตั้งต้น)</span>';
                        }
                    }

                    if (isNaN(expectedDemand) || !isFinite(expectedDemand)) expectedDemand = 0;

                    let mainBal = Number(item.qty_main) || Number(item.balance_main) || 0;
                    let subBal = Number(item.qty_sub) || Number(item.balance_sub) || 0;
                    let totalBal = mainBal + subBal;

                    let safetyStock = Math.ceil(expectedDemand * (safetyPercent / 100));
                    
                    let totalReq = expectedDemand + safetyStock;
                    let baseReq = Math.ceil(totalReq - totalBal);
                    
                    if (baseReq < 0) baseReq = 0; 
                    
                    let pkgSize = Number(item.package_size) || 1;
                    if(pkgSize > 1 && baseReq > 0) {
                        let remainder = baseReq % pkgSize;
                        if(remainder !== 0) {
                            baseReq = baseReq + (pkgSize - remainder);
                        }
                    }

                    results.push({
                        id: item.id,
                        name: item.name,
                        item_code: item.item_code || '-',
                        unit: item.unit_small || item.unit || 'ชิ้น',
                        order_index: item.order_index !== undefined ? Number(item.order_index) : (item.order !== undefined ? Number(item.order) : 9999),
                        dailyRate: dailyRate,
                        expectedDemand: Math.ceil(expectedDemand),
                        totalBal: totalBal,
                        safetyStock: safetyStock,
                        baseReq: baseReq,
                        adjustedReq: baseReq,
                        usageSourceHtml: usageSourceHtml 
                    });
                });

                results.sort((a, b) => {
                    if (a.order_index !== b.order_index) {
                        return a.order_index - b.order_index;
                    }
                    return a.name.localeCompare(b.name, 'th');
                });

                if (tabType === 'general') {
                    this.state.lastGeneralForecast = results;
                    this.renderGeneralTable(results);
                } else {
                    this.state.lastFluidForecast = results;
                    this.renderFluidTable(results);
                }
                
                if (showLoadingPopup) Swal.close();
            } catch (err) {
                if (showLoadingPopup) Swal.fire('ข้อผิดพลาด', `เกิดปัญหาในการประมวลผล: ${err.message}`, 'error');
                else console.error("Live Calculation Error:", err);
            }
        }, 10); 
    }

    renderGeneralTable(results) {
        let html = '';
        if(results.length === 0) {
            html = `<tr><td colspan="8" class="text-center py-5 text-muted"><i class="fa-solid fa-box-open fa-3x mb-3" style="opacity: 0.2;"></i><br>ไม่พบรายการพัสดุ</td></tr>`;
        } else {
            results.forEach((res, index) => {
                let rowStyle = res.baseReq > 0 ? "background: rgba(16, 185, 129, 0.05);" : "";
                let rateText = res.dailyRate > 0 ? `${res.dailyRate.toFixed(1)} ${this.escapeHTML(res.unit)}` : '0';
                
                html += `
                <tr style="${rowStyle}">
                    <td class="text-center fw-bold text-muted">${index + 1}</td>
                    <td><div class="fw-bold text-dark text-truncate" style="font-size: 14px; max-width: 250px;" title="${this.escapeHTML(res.name)}">${this.escapeHTML(res.name)}</div></td>
                    <td class="text-center text-muted fw-bold small">
                        ${rateText}
                        ${res.usageSourceHtml || ''} 
                    </td>
                    <td class="text-center text-secondary fw-bold">${res.expectedDemand}</td>
                    <td class="text-center text-primary fw-bold">${res.totalBal}</td>
                    <td class="text-center text-warning-dark fw-bold">${res.safetyStock}</td>
                    <td class="text-center text-success fw-bold fs-6">${res.baseReq}</td>
                    <td>
                        <input type="number" class="form-control text-center fw-bold text-primary border-primary shadow-sm fc-base-req-input" data-index="${index}" value="${res.baseReq}" min="0" style="border-radius:10px;">
                    </td>
                </tr>`;
            });
        }
        document.getElementById('sf-result-body').innerHTML = html;
    }

    renderFluidTable(results) {
        let html = '';
        if(results.length === 0) {
            html = `<tr><td colspan="8" class="text-center py-5 text-muted"><i class="fa-solid fa-droplet fa-3x mb-3" style="opacity: 0.2;"></i><br>ไม่พบรายการน้ำยาไตเทียม</td></tr>`;
        } else {
            results.forEach((res, index) => {
                let rowStyle = res.baseReq > 0 ? "background: rgba(6, 182, 212, 0.05);" : "";
                let rateText = res.dailyRate > 0 ? `${res.dailyRate.toFixed(2)} ${this.escapeHTML(res.unit)}` : '0';

                html += `
                <tr style="${rowStyle}">
                    <td class="text-center fw-bold text-muted">${index + 1}</td>
                    <td><div class="fw-bold text-dark text-truncate" style="font-size: 14px; max-width: 250px;" title="${this.escapeHTML(res.name)}">${this.escapeHTML(res.name)}</div></td>
                    <td class="text-center text-muted fw-bold small">
                        ${rateText}
                        ${res.usageSourceHtml || ''} 
                    </td>
                    <td class="text-center text-secondary fw-bold">${res.expectedDemand}</td>
                    <td class="text-center text-primary fw-bold">${res.totalBal}</td>
                    <td class="text-center text-warning-dark fw-bold">${res.safetyStock}</td>
                    <td class="text-center text-success fw-bold fs-6">${res.baseReq}</td>
                    <td>
                        <input type="number" class="form-control text-center fw-bold text-info border-info shadow-sm fc-base-req-input" data-index="${index}" value="${res.baseReq}" min="0" style="border-radius:10px;">
                    </td>
                </tr>`;
            });
        }
        document.getElementById('sf-fluid-result-body').innerHTML = html;
    }

    syncToMonthlyReq() {
        const activeTabId = document.querySelector('.custom-tab-pane.active').id;
        const sourceData = activeTabId === 'fluid-panel' ? this.state.lastFluidForecast : this.state.lastGeneralForecast;
        const itemsToOrder = sourceData.filter(i => i.adjustedReq > 0);

        if (itemsToOrder.length === 0) {
            Swal.fire('ข้อผิดพลาด', 'ไม่มียอดแนะนำสั่งซื้อ (ต้องมียอดเบิกจริง > 0) หรือยังไม่ได้กดประมวลผล', 'warning');
            return;
        }

        const tabNameTH = activeTabId === 'fluid-panel' ? 'น้ำยาฟอกไต' : 'พัสดุทั่วไป';

        Swal.fire({
            title: 'ยืนยันการส่งข้อมูล',
            text: `ส่งรายการในหมวด [${tabNameTH}] จำนวน ${itemsToOrder.length} รายการ ไปยังฟอร์มเบิกของประจำเดือนหรือไม่?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            confirmButtonText: 'ใช่, นำข้อมูลไปสร้างฟอร์ม',
            cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'premium-alert' }
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.setItem('smart_po_sync_data', JSON.stringify(itemsToOrder));
                App.switchPage('monthly_requisition', null, { syncedItems: itemsToOrder });
            }
        });
    }
}

const StockForecastPage = new StockForecastPageComponent();
window.StockForecastPage = StockForecastPage;