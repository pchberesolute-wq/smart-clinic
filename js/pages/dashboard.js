// js/pages/dashboard.js
// 🚀 โมดูลแดชบอร์ดภาพรวมอัจฉริยะ (Smart Stock Cost Integration & High Performance)

const DashboardPage = {
    selectedDate: new Date().toISOString().split('T')[0],
    allVisits: [], allPatients: [], inventoryItems: [], allExpenses: [], stockTransactions: [], myChartInstance: null,

    html: `
        <style>
            .rights-breakdown-container::-webkit-scrollbar { width: 4px; }
            .rights-breakdown-container::-webkit-scrollbar-track { background: transparent; }
            .rights-breakdown-container::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            .rights-breakdown-container::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            
            @keyframes pulse-live { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
            .badge-live-pulse { animation: pulse-live 2s infinite; }
            
            .stat-card-premium { border-radius: 20px; transition: all 0.3s; border: 1px solid #e2e8f0; background: #fff; display: flex; flex-direction: column; width: 100%; }
            .stat-card-premium:hover { transform: translateY(-5px); box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.1); border-color: #cbd5e1; }
            
            .stat-icon-bg { position: absolute; top: -15px; right: -15px; opacity: 0.04; font-size: 130px; pointer-events: none; z-index: 0; }
            .z-content { position: relative; z-index: 1; }

            .dash-widget-list { max-height: 250px; overflow-y: auto; }
            .dash-widget-list::-webkit-scrollbar { width: 4px; }
            .dash-widget-list::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        </style>

        <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
                <h2 class="page-title text-primary" style="font-size: 28px;"><i class="fa-solid fa-chart-pie me-2"></i> แดชบอร์ดภาพรวม (Overview)</h2>
                <p class="text-muted mt-1 mb-0 z-content" id="dash-date-text">กำลังโหลดข้อมูลสถิติ...</p>
            </div>
            
            <div class="d-flex gap-2 align-items-center flex-wrap mt-3 mt-md-0">
                <div class="search-box-modern shadow-sm p-1 ps-3 bg-white d-flex align-items-center position-relative" style="width: auto; border-radius: 50px;">
                    <input type="date" id="dashDateSelector" class="position-absolute" style="opacity: 0; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer; z-index: 10;" onfocus="this.showPicker && this.showPicker()">
                    <i class="fa-solid fa-calendar-day text-primary me-2 position-relative" style="z-index: 1; pointer-events: none;"></i>
                    <span id="dashDateDisplay" class="fw-bold text-dark position-relative" style="font-family:'Prompt'; min-width: 90px; text-align: center; z-index: 1; pointer-events: none;">กำลังโหลด...</span>
                    <button class="btn btn-premium-primary ms-3 py-1 px-3 shadow-sm position-relative" style="border-radius: 50px; font-size:14px; z-index: 20;" onclick="DashboardPage.setToday()" title="กลับมาวันที่ปัจจุบัน">วันนี้</button>
                </div>

                <button class="btn btn-dark fw-bold shadow-sm rounded-pill px-4 ms-2 card-hover-float" onclick="DashboardPage.printDashboard()">
                    <i class="fa-solid fa-print me-2 text-warning"></i>พิมพ์รายงาน
                </button>
            </div>
        </div>
        
        <div class="row g-4 mb-4 align-items-stretch">
            <div class="col-md-6 col-xl-3 d-flex">
                <div class="stat-card-premium p-4 shadow-sm position-relative overflow-hidden h-100" style="border-top: 4px solid var(--info);">
                    <i class="fa-solid fa-users stat-icon-bg"></i>
                    <div class="d-flex justify-content-between mb-2 z-content">
                        <div class="text-muted fw-bold small text-uppercase">ผู้ป่วยทั้งหมด (Active)</div>
                        <div class="badge-soft-info rounded px-2 py-1"><i class="fa-solid fa-users"></i></div>
                    </div>
                    <div class="fs-2 fw-bold text-dark z-content"><span id="dash-total-pt"><i class="fas fa-spinner fa-spin"></i></span> <span class="fs-6 text-muted">คน</span></div>
                    <div id="dash-rights-breakdown" class="rights-breakdown-container d-flex flex-column gap-2 mt-3 z-content" style="max-height: 95px; overflow-y: auto; padding-right: 5px;"></div>
                </div>
            </div>

            <div class="col-md-6 col-xl-3 d-flex">
                <div class="stat-card-premium p-4 shadow-sm bg-warning-light position-relative overflow-hidden h-100" style="border-top: 4px solid var(--warning);">
                    <i class="fa-solid fa-bed-pulse stat-icon-bg"></i>
                    <div class="d-flex justify-content-between mb-2 z-content">
                        <div class="text-warning-dark fw-bold small text-uppercase">คิวฟอกไตประจำวัน</div>
                        <div class="bg-white text-warning rounded px-2 py-1 shadow-sm"><i class="fa-solid fa-bed-pulse"></i></div>
                    </div>
                    <div class="fs-2 fw-bold text-warning-dark mb-1 z-content"><span id="dash-total-visit"><i class="fas fa-spinner fa-spin"></i></span> <span class="fs-6 text-warning-dark">รอบ</span></div>
                    
                    <div class="d-flex flex-column gap-2 mt-auto pt-2 z-content" id="dash-visit-sub-text">
                        <div class="text-warning-dark small fw-bold"><i class="fas fa-clock fa-spin me-1"></i> กำลังคำนวณ...</div>
                    </div>
                </div>
            </div>

            <div class="col-md-6 col-xl-3 d-flex">
                <div class="stat-card-premium p-4 shadow-sm position-relative overflow-hidden h-100" style="border-top: 4px solid var(--primary);">
                    <i class="fa-solid fa-bolt stat-icon-bg"></i>
                    <div class="d-flex justify-content-between mb-2 z-content">
                        <div class="text-muted fw-bold small text-uppercase">การใช้เครื่องนวัตกรรม</div>
                        <div class="badge-soft-primary rounded px-2 py-1"><i class="fa-solid fa-bolt"></i></div>
                    </div>
                    <div class="fs-2 fw-bold text-dark mb-1 z-content"><span id="dash-total-online"><i class="fas fa-spinner fa-spin"></i></span> <span class="fs-6 text-muted">เครื่อง</span></div>
                    <div class="mt-auto pt-2 z-content">
                        <span class="badge badge-soft-primary px-3 py-2 rounded-pill w-100 text-start" style="font-size: 13px;"><i class="fa-solid fa-circle-nodes me-2"></i> ระบบ Online HDF</span>
                    </div>
                </div>
            </div>

            <div class="col-md-6 col-xl-3 d-flex">
                <div class="stat-card-premium p-4 shadow-sm bg-success-light position-relative overflow-hidden h-100" style="border-top: 4px solid var(--success);">
                    <i class="fa-solid fa-hand-holding-dollar stat-icon-bg"></i>
                    <div class="d-flex justify-content-between mb-2 z-content">
                        <div class="text-success-dark fw-bold small text-uppercase">รายรับจากคิว (วันนี้)</div>
                        <div class="bg-white text-success rounded px-2 py-1 shadow-sm"><i class="fa-solid fa-hand-holding-dollar"></i></div>
                    </div>
                    <div class="fs-2 fw-bold text-success-dark mb-1 z-content"><span id="dash-total-income"><i class="fas fa-spinner fa-spin"></i></span> <span class="fs-6 text-success-dark">฿</span></div>
                    <div class="mt-auto pt-2 z-content">
                        <span class="badge bg-white text-success border border-success-subtle px-3 py-2 rounded-pill shadow-sm w-100 text-start" style="font-size: 13px;"><i class="fa-solid fa-bolt text-warning me-2"></i> Real-time Sync</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="row g-4 pb-4">
            <div class="col-xl-5">
                <div class="modern-panel p-4 shadow-sm h-100" style="border-radius: 20px;">
                    <h5 class="fw-bold text-dark mb-4"><i class="fa-solid fa-chart-simple text-primary me-2"></i> สถิติสิทธิการรักษา (Active)</h5>
                    <div style="height: 280px; width: 100%;">
                        <canvas id="rightsChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="col-xl-7">
                <div class="modern-panel p-4 shadow-sm h-100 d-flex flex-column" style="border-radius: 20px;">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-list-check text-warning me-2"></i> สถานะเตียงและการตรวจ <span id="dash-bed-live-badge" class="badge badge-soft-danger ms-2 shadow-sm badge-live-pulse" style="display:none;">LIVE</span></h5>
                    </div>
                    <div class="table-responsive bg-white rounded-3 border border-light shadow-sm flex-grow-1" style="max-height: 280px; overflow-y: auto;">
                        <table class="table table-premium w-100 mb-0">
                            <thead style="position: sticky; top: 0; z-index: 10;">
                                <tr>
                                    <th style="width: 15%;">เตียง</th>
                                    <th>ชื่อผู้ป่วย</th>
                                    <th style="width: 30%;">ข้อมูลรอบ/สิทธิ</th>
                                    <th class="text-center" style="width: 20%;">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody id="dash-bed-status">
                                <tr><td colspan="4" class="text-center text-muted py-5"><i class="fas fa-spinner fa-spin fa-2x mb-3 text-primary"></i><br>กำลังดึงข้อมูลคิว...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="modern-panel p-4 shadow-sm h-100" style="border-radius: 20px; border-top: 4px solid var(--danger);">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="fw-bold text-danger-dark mb-0"><i class="fa-solid fa-triangle-exclamation text-danger me-2"></i> แจ้งเตือนพัสดุใกล้หมด (Low Stock)</h5>
                        <button class="btn btn-sm btn-light border text-dark fw-bold" onclick="App.switchPage('inventory')">ไปคลังพัสดุ</button>
                    </div>
                    <div id="dash-low-stock-list" class="dash-widget-list d-flex flex-column gap-2 pe-2">
                        <div class="text-center text-muted py-4"><i class="fas fa-spinner fa-spin"></i></div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="modern-panel p-4 shadow-sm h-100" style="border-radius: 20px; border-top: 4px solid var(--success);">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="fw-bold text-success-dark mb-0"><i class="fa-solid fa-wallet text-success me-2"></i> สรุปการเงินเดือนนี้ (MTD)</h5>
                        <button class="btn btn-sm btn-light border text-dark fw-bold" onclick="App.switchPage('finance')">ดูบัญชีเต็ม</button>
                    </div>
                    <div id="dash-finance-widget" class="d-flex flex-column justify-content-center h-100 pb-3">
                        <div class="text-center text-muted py-4"><i class="fas fa-spinner fa-spin"></i></div>
                    </div>
                </div>
            </div>
        </div>
    `,

    init: function() {
        if (typeof db === 'undefined') return;

        const dateInput = document.getElementById('dashDateSelector');
        if(dateInput) {
            dateInput.value = this.selectedDate;
            this.updateDateDisplay(this.selectedDate); 
            
            dateInput.addEventListener('change', (e) => {
                this.selectedDate = e.target.value;
                this.updateDateDisplay(this.selectedDate); 
                this.loadVisitsData();
            });
        }

        db.ref('patients_database_v2/patients').on('value', snap => {
            const data = snap.val();
            let rawPatients = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
            let activePatients = rawPatients.filter(p => p !== null && p.status !== 'ย้ายคลินิก' && p.status !== 'เสียชีวิต');
            this.allPatients = activePatients;
            
            if (document.getElementById('dash-total-pt')) document.getElementById('dash-total-pt').innerText = activePatients.length.toLocaleString();

            let rightsCount = {};
            activePatients.forEach(p => {
                let r = p.right || 'ไม่ระบุสิทธิ';
                rightsCount[r] = (rightsCount[r] || 0) + 1;
            });
            this.renderRightsChart(Object.keys(rightsCount), Object.values(rightsCount));
            this.renderRightsBreakdownUI(rightsCount);
        });

        db.ref('patients_database_v2/visits').on('value', snap => {
            const data = snap.val();
            let raw = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
            this.allVisits = raw.filter(v => v !== null);
            this.loadVisitsData(); 
            this.renderFinanceWidget(); 
        });

        db.ref('inventory_database_v2/items').on('value', snap => {
            const data = snap.val();
            this.inventoryItems = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])).filter(Boolean) : [];
            this.renderLowStockWidget();
            this.renderFinanceWidget(); // อัปเดต Finance เพื่อให้ต้นทุนเป็นปัจจุบัน
        });

        // 🌟 ดึงข้อมูลประวัติการทำรายการเพื่อคำนวณต้นทุนการเบิกแบบเรียลไทม์
        db.ref('inventory_database_v2/transactions').on('value', snap => {
            const data = snap.val();
            this.stockTransactions = data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : [];
            this.renderFinanceWidget();
        });

        db.ref('clinic_expenses_v2').on('value', snap => {
            const data = snap.val();
            this.allExpenses = data ? Object.keys(data).map(k => ({ id: k, ...data[k] })) : [];
            this.renderFinanceWidget();
        });
    },

    updateDateDisplay: function(dateStr) {
        const display = document.getElementById('dashDateDisplay');
        if(!display || !dateStr) return;
        const dObj = new Date(dateStr);
        const thaiDate = `${String(dObj.getDate()).padStart(2,'0')}/${String(dObj.getMonth() + 1).padStart(2,'0')}/${dObj.getFullYear() + 543}`;
        display.innerText = thaiDate;
    },

    setToday: function() {
        const today = new Date();
        const tzo = today.getTimezoneOffset() * 60000;
        const localDate = (new Date(Date.now() - tzo)).toISOString().split('T')[0];
        
        const dateInput = document.getElementById('dashDateSelector');
        if(dateInput) {
            dateInput.value = localDate;
            this.selectedDate = localDate;
            this.updateDateDisplay(localDate); 
            this.loadVisitsData();
        }
    },

    loadVisitsData: function() {
        const dObj = new Date(this.selectedDate);
        const thaiDate = `${String(dObj.getDate()).padStart(2,'0')}/${String(dObj.getMonth() + 1).padStart(2,'0')}/${dObj.getFullYear() + 543}`;
        document.getElementById('dash-date-text').innerHTML = `<i class="fa-regular fa-calendar-check text-success me-1"></i> ข้อมูลสถิติประจำวันที่ <b class="text-dark">${thaiDate}</b>`;

        const todayISO = (new Date(Date.now() - new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        const badgeLive = document.getElementById('dash-bed-live-badge');
        if(badgeLive) badgeLive.style.display = (this.selectedDate === todayISO) ? 'inline-block' : 'none';

        let dailyVisits = this.allVisits.filter(v => v.date === this.selectedDate);
        
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
                <div class="d-flex justify-content-between align-items-center bg-white px-3 py-2 rounded-pill shadow-sm border border-success-subtle">
                    <span class="text-success fw-bold" style="font-size: 13px;"><i class="fa-solid fa-check-double me-1"></i>เสร็จสิ้นแล้ว</span>
                    <span class="badge bg-success rounded-pill px-2">${doneCount}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center bg-white px-3 py-2 rounded-pill shadow-sm border border-warning-subtle">
                    <span class="text-warning-dark fw-bold" style="font-size: 13px;"><i class="fa-solid fa-spinner fa-spin me-1"></i>กำลังฟอกไต</span>
                    <span class="badge bg-warning text-dark rounded-pill px-2">${processingCount}</span>
                </div>
            `;
        }

        let bedHtml = "";
        if (dailyVisits.length === 0) {
            bedHtml = `<tr><td colspan="4" class="text-center text-muted py-5"><i class="fa-solid fa-bed fa-3x mb-3" style="opacity:0.2"></i><br>ไม่มีผู้ป่วยเปิดคิวในวันที่เลือก</td></tr>`;
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
                    <td><span class="badge bg-dark px-3 py-2 rounded-pill shadow-sm" style="font-size: 13px;">เตียง ${v.bed || '-'}</span></td>
                    <td>
                        <div class="fw-bold text-dark" style="font-size: 15px; font-family: 'Prompt';">${v.name || 'ไม่ระบุชื่อ'}</div>
                        <div class="small text-muted"><i class="fa-solid fa-id-card text-primary me-1"></i> ${v.hn || '-'}</div>
                    </td>
                    <td>
                        <div class="fw-bold text-primary mb-1"><i class="fa-regular fa-clock me-1 text-secondary"></i> ${v.time || '-'} น.</div>
                        <span class="badge bg-light text-dark border shadow-sm">${v.right || '-'}</span>
                    </td>
                    <td class="text-center"><span class="badge ${statusClass} px-3 py-2 rounded-pill shadow-sm" style="font-size: 12px;">${statusTxt}</span></td>
                </tr>`;
            });
        }
        if (document.getElementById('dash-bed-status')) document.getElementById('dash-bed-status').innerHTML = bedHtml;
    },

    renderRightsBreakdownUI: function(rightsCount) {
        const container = document.getElementById('dash-rights-breakdown');
        if (!container) return;
        const colorMap = { 'บัตรทอง (สปสช.)': 'success', 'ประกันสังคม': 'warning', 'เบิกจ่ายตรง (กรมบัญชีกลาง)': 'info', 'ชำระเงินเอง': 'primary' };
        let sortedRights = Object.entries(rightsCount).sort((a, b) => b[1] - a[1]);
        
        let html = '';
        sortedRights.forEach(([rightName, count]) => {
            let colorTheme = colorMap[rightName] || 'secondary';
            html += `
                <div class="d-flex justify-content-between align-items-center bg-light rounded-pill px-3 py-1 shadow-sm border border-${colorTheme}-subtle" style="font-size: 12px;">
                    <span class="fw-bold text-muted text-truncate" style="max-width: 75%;" title="${rightName}">${rightName}</span>
                    <span class="badge bg-${colorTheme} rounded-pill">${count}</span>
                </div>
            `;
        });
        container.innerHTML = html;
    },

    renderRightsChart: function(labels, values) {
        const ctx = document.getElementById('rightsChart');
        if (!ctx) return;
        if (this.myChartInstance) this.myChartInstance.destroy();

        this.myChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: { 
                labels: labels, 
                datasets: [{ 
                    data: values, 
                    backgroundColor: ['#10b981', '#f59e0b', '#0ea5e9', '#4361ee', '#f72585', '#7209b7'], 
                    borderWidth: 3, 
                    borderColor: '#ffffff',
                    hoverOffset: 4
                }] 
            },
            options: { 
                responsive: true, maintainAspectRatio: false, 
                plugins: { legend: { position: 'right', labels: { boxWidth: 15, padding: 20, font: { family: 'Prompt', size: 13 } } } }, 
                cutout: '70%', animation: { animateScale: true, animateRotate: true }
            }
        });
    },

    renderLowStockWidget: function() {
        const container = document.getElementById('dash-low-stock-list');
        if (!container) return;

        let lowStocks = [];
        this.inventoryItems.forEach(i => {
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
                <div class="d-flex justify-content-between align-items-center p-2 border-bottom border-light">
                    <div>
                        <div class="fw-bold text-dark text-truncate" style="max-width:200px; font-size:14px;">${item.name}</div>
                        <div class="small text-muted">${item.type}</div>
                    </div>
                    <div class="badge badge-soft-danger px-3 py-2 rounded-pill shadow-sm" style="font-size:13px;">เหลือ ${item.qty} ${item.unit||''}</div>
                </div>
            `;
        });
        container.innerHTML = html;
    },

    renderFinanceWidget: function() {
        const container = document.getElementById('dash-finance-widget');
        if (!container) return;

        const currentMonthPrefix = new Date().toISOString().slice(0, 7); 
        
        // คำนวณรายได้จากคิวที่เสร็จสิ้น
        let mIncome = 0;
        this.allVisits.filter(v => v.date && v.date.startsWith(currentMonthPrefix) && v.status === "เสร็จสิ้น").forEach(v => {
            let fee = parseFloat(String(v.dialysis_fee || 0).replace(/,/g, ''));
            mIncome += (fee > 0 ? fee : 1500);
        });

        // 🌟 ดึงข้อมูลจากประวัติสต๊อกเฉพาะเดือนนี้ ที่เกิดจากการตัดเบิก (out_sub) และเขียนโน้ตว่ามาจาก Flowsheet
        let monthlyStockLogs = this.stockTransactions.filter(log => 
            log && log.timestamp && log.timestamp.startsWith(currentMonthPrefix) && 
            log.mode === 'out_sub' && log.note && log.note.includes("ตัดเบิก Flowsheet")
        );

        // คำนวณต้นทุนการเบิกแต่ละครั้ง
        let aggregatedStockCosts = 0;
        monthlyStockLogs.forEach(log => {
            let item = this.inventoryItems.find(i => i.id === log.itemId);
            let costPerUnit = item && item.price ? Number(item.price) : 0; 
            aggregatedStockCosts += (costPerUnit * Number(log.qty));
        });

        let mExpense = 0;
        this.allExpenses.filter(e => e.date && e.date.startsWith(currentMonthPrefix)).forEach(e => {
            mExpense += Number(e.amount) || 0;
        });
        
        mExpense += aggregatedStockCosts; // นำต้นทุน Flowsheet มารวมเป็นรายจ่ายสุทธิประจำเดือน

        let net = mIncome - mExpense;
        let netColor = net >= 0 ? 'text-primary' : 'text-danger';
        let netIcon = net >= 0 ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
        
        let total = mIncome + mExpense;
        let inPct = total > 0 ? (mIncome / total) * 100 : 50;
        let exPct = total > 0 ? (mExpense / total) * 100 : 50;

        container.innerHTML = `
            <div class="d-flex justify-content-between mb-2">
                <div><div class="small fw-bold text-success"><i class="fa-solid fa-plus-circle me-1"></i> รายรับรวม</div><h5 class="fw-bold text-dark mb-0">฿${mIncome.toLocaleString()}</h5></div>
                <div class="text-end"><div class="small fw-bold text-danger"><i class="fa-solid fa-minus-circle me-1"></i> รายจ่ายรวม</div><h5 class="fw-bold text-dark mb-0">฿${mExpense.toLocaleString()}</h5></div>
            </div>
            <div class="progress shadow-sm mb-4" style="height: 12px; border-radius: 20px;">
                <div class="progress-bar bg-success" role="progressbar" style="width: ${inPct}%" title="รายรับ ${inPct.toFixed(0)}%"></div>
                <div class="progress-bar bg-danger" role="progressbar" style="width: ${exPct}%" title="รายจ่าย ${exPct.toFixed(0)}%"></div>
            </div>
            <div class="text-center p-3 rounded-4 shadow-sm" style="background: #f8fafc; border: 1px solid #e2e8f0;">
                <div class="text-muted fw-bold small text-uppercase mb-1">กำไรสุทธิเดือนนี้</div>
                <h3 class="fw-bold ${netColor} mb-0" style="font-family:'Prompt';"><i class="fa-solid ${netIcon} me-2"></i> ฿${net.toLocaleString()}</h3>
            </div>
        `;
    },

    printDashboard: function() {
        const dObj = new Date(this.selectedDate);
        const thaiDate = `${dObj.getDate()}/${dObj.getMonth() + 1}/${dObj.getFullYear() + 543}`;
        
        let dailyVisits = this.allVisits.filter(v => v.date === this.selectedDate);
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
                        <td style="text-align: center;">เตียง ${v.bed || '-'}</td>
                        <td>${v.name || '-'} (HN: ${v.hn})</td>
                        <td style="text-align: center;">${v.time || '-'} น.</td>
                        <td style="text-align: center;">${v.status || 'รอตรวจ'}</td>
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
                    <h2>${settings.clinic_name}</h2>
                    <h3>รายงานสรุปการให้บริการประจำวัน</h3>
                    <div>ประจำวันที่: ${thaiDate} | พิมพ์เมื่อ: ${new Date().toLocaleTimeString('th-TH')} น.</div>
                </div>

                <div class="summary-grid">
                    <div class="summary-box">ผู้ป่วย Active<div class="val">${this.allPatients.length} คน</div></div>
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
};