// js/pages/visits.js
// 🚀 โมดูลหน้าคิวฟอกไต Kanban Board (Silent Auto-Purge & Dual-Dropdown Fix)

const VisitsPage = {
    currentTab: 'active', allVisits: [], patientsList: [], hasCleanedUp: false,

    html: `
        <div class="page-header mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
                <h2 class="page-title text-primary"><i class="fa-solid fa-bed-pulse me-2"></i> คิวฟอกไตประจำวัน</h2>
                <p class="text-muted mt-1 mb-0" id="visit-date-text">กำลังโหลดข้อมูล...</p>
            </div>
            <div class="d-flex gap-2 flex-wrap">
                <div class="search-box-modern shadow-sm p-1 ps-3 bg-white d-flex align-items-center position-relative" style="width: auto; border-radius: 50px;">
                    <input type="date" id="visitDateSelector" class="position-absolute" style="opacity: 0; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer; z-index: 10;" onfocus="this.showPicker && this.showPicker()">
                    
                    <i class="fa-solid fa-calendar-day text-primary me-2 position-relative" style="z-index: 1; pointer-events: none;"></i>
                    <span id="visitDateDisplay" class="fw-bold text-dark position-relative" style="font-family:'Prompt'; min-width: 90px; text-align: center; z-index: 1; pointer-events: none;">กำลังโหลด...</span>
                    
                    <button class="btn btn-premium-primary ms-3 py-1 px-3 shadow-sm position-relative" style="border-radius: 50px; font-size:14px; z-index: 20;" onclick="VisitsPage.setToday()" title="กลับมาวันที่ปัจจุบัน">วันนี้</button>
                </div>

                <button class="btn btn-premium btn-premium-danger" onclick="VisitsPage.quickSwipeCheckOut()">
                    <i class="fa-solid fa-id-card-clip me-2"></i> ดึงคิวออก
                </button>
                <button class="btn btn-premium btn-premium-primary px-4" onclick="VisitsPage.openAddVisitModal()">
                    <i class="fa-solid fa-plus me-2"></i> เพิ่มคิวใหม่
                </button>
            </div>
        </div>
        
        <div class="row g-4 mb-4" id="visit-stats-container"></div>

        <div class="modern-panel mb-4 shadow-sm p-4" style="border-radius: 20px;">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <ul class="nav nav-pills" role="tablist">
                    <li class="nav-item me-2">
                        <button type="button" id="tab-active" class="btn btn-premium-primary rounded-pill fw-bold px-4 shadow-sm" onclick="VisitsPage.switchTab('active')">
                            <i class="fa-solid fa-user-clock me-1"></i> คิวฟอกปัจจุบัน
                        </button>
                    </li>
                    <li class="nav-item">
                        <button type="button" id="tab-completed" class="btn btn-light rounded-pill fw-bold text-muted px-4 border shadow-sm" onclick="VisitsPage.switchTab('completed')">
                            <i class="fa-solid fa-check-circle me-1"></i> ประวัติฟอกเสร็จแล้ว
                        </button>
                    </li>
                </ul>

                <div class="search-box-modern shadow-sm bg-white" style="width: 280px; padding: 10px 20px; border-radius: 50px;">
                    <i class="fa-solid fa-search text-primary"></i>
                    <input type="text" id="visitSearch" class="border-0 bg-transparent fw-bold ms-2 w-100 text-dark" placeholder="ค้นหาชื่อ, HN, เตียง..." style="outline:none;">
                </div>
            </div>
        </div>

        <div class="row g-4 flex-nowrap overflow-auto pb-4">
            <div class="col-md-4 min-w-300">
                <div class="modern-panel p-0 h-100 d-flex flex-column border-0 shadow-sm overflow-hidden" style="border-top: 4px solid var(--info); border-radius: 20px;">
                    <div class="p-3 bg-info-light border-bottom border-info-subtle">
                        <h6 class="fw-bold mb-0 text-info" style="font-family:'Prompt';"><i class="fa-regular fa-sun me-2"></i> รอบเช้า (06:00 - 10:00)</h6>
                    </div>
                    <div class="p-3 bg-white flex-grow-1" id="board-morning" style="min-height: 300px;"><div class="text-center py-5 text-muted"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>
                </div>
            </div>

            <div class="col-md-4 min-w-300">
                <div class="modern-panel p-0 h-100 d-flex flex-column border-0 shadow-sm overflow-hidden" style="border-top: 4px solid var(--warning); border-radius: 20px;">
                    <div class="p-3 bg-warning-light border-bottom border-warning-subtle">
                        <h6 class="fw-bold mb-0 text-warning-dark" style="font-family:'Prompt';"><i class="fa-solid fa-cloud-sun me-2"></i> รอบบ่าย (10:00 - 14:00)</h6>
                    </div>
                    <div class="p-3 bg-white flex-grow-1" id="board-afternoon" style="min-height: 300px;"></div>
                </div>
            </div>

            <div class="col-md-4 min-w-300">
                <div class="modern-panel p-0 h-100 d-flex flex-column border-0 shadow-sm overflow-hidden" style="border-top: 4px solid var(--muted); border-radius: 20px;">
                    <div class="p-3 bg-light border-bottom">
                        <h6 class="fw-bold mb-0 text-muted" style="font-family:'Prompt';"><i class="fa-solid fa-moon me-2"></i> รอบเย็น (14:00 เป็นต้นไป)</h6>
                    </div>
                    <div class="p-3 bg-white flex-grow-1" id="board-evening" style="min-height: 300px;"></div>
                </div>
            </div>
        </div>
        
        <style>
            .min-w-300 { min-width: 320px; }
            .visit-card { transition: all 0.3s ease; border-radius: 16px; border: 2px solid transparent; cursor: pointer; background: #fff;}
            .visit-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-float-primary); border-color: var(--primary-light);}
            .visit-bed { background: var(--bg-main); padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 11.5px; color: var(--text-dark); font-family: 'Prompt';}
        </style>
    `,

    init: function() {
        if (typeof db === 'undefined') return;

        if (!this.hasCleanedUp) this.autoCleanUpOldRecords();

        db.ref('patients_database_v2/patients').on('value', snap => {
            const data = snap.val();
            let raw = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
            this.patientsList = raw.filter(p => p !== null);
        });

        this.setToday();
        
        const dateInput = document.getElementById('visitDateSelector');
        if(dateInput) {
            dateInput.addEventListener('change', (e) => { 
                this.updateDateDisplay(e.target.value);
                this.loadVisitsData(); 
            });
        }

        const searchInp = document.getElementById('visitSearch');
        if(searchInp) {
            searchInp.addEventListener('keyup', (e) => {
                const term = e.target.value.toLowerCase();
                const cards = document.querySelectorAll('.visit-card');
                cards.forEach(card => {
                    card.style.display = card.innerText.toLowerCase().includes(term) ? 'block' : 'none';
                });
            });
        }

        if (window.visitAutoUpdateInterval) clearInterval(window.visitAutoUpdateInterval);
        window.visitAutoUpdateInterval = setInterval(() => { this.checkAutoStart(); }, 30000);
    },

    // 🌟 [SILENT PURGE] กวาดข้อมูล 5 ปีทิ้งแบบเงียบๆ ไม่เด้ง Alert
    autoCleanUpOldRecords: function() {
        this.hasCleanedUp = true;
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 5);
        const cutoffStr = cutoffDate.toISOString().split('T')[0];

        db.ref('patients_database_v2/visits').once('value').then(snap => {
            let data = snap.val();
            if (!data) return;
            let visits = Array.isArray(data) ? data : Object.keys(data).map(k => data[k]);
            let originalLen = visits.length;
            
            // คัดเอาเฉพาะข้อมูลที่ใหม่กว่า 5 ปี (ลบของเก่าทิ้ง)
            let validVisits = visits.filter(v => v && v.date && v.date >= cutoffStr);
            
            // อัปเดตกลับไปที่ Firebase เงียบๆ เฉพาะกรณีที่มีการลบจริงๆ เท่านั้น
            if (validVisits.length < originalLen) {
                db.ref('patients_database_v2/visits').set(validVisits).then(() => {
                    console.log(`♻️ Auto-Purged ${originalLen - validVisits.length} old visits from Kanban Board.`);
                });
            }
        });
    },

    // 🌟 [SILENT STATUS UPDATE] อัปเดตสถานะ "กำลังฟอกไต" อัตโนมัติ โดยไม่เรียก Toast มารบกวน
    checkAutoStart: function() {
        if (typeof db === 'undefined' || !this.allVisits || this.allVisits.length === 0) return;
        const now = new Date(); const tzo = now.getTimezoneOffset() * 60000;
        const todayStr = new Date(now.getTime() - tzo).toISOString().split('T')[0];
        let needsUpdate = false;
        
        let updatedVisits = this.allVisits.map(v => {
            if (v.date === todayStr && v.status === "รอตรวจ" && v.time) {
                const parts = v.time.split(':');
                if (parts.length === 2) {
                    const hours = parseInt(parts[0], 10); const minutes = parseInt(parts[1], 10);
                    const scheduledTime = new Date(); scheduledTime.setHours(hours, minutes, 0, 0);
                    const diffMins = (now - scheduledTime) / 60000;
                    
                    // ถ้าเลยเวลามา 5 นาที ให้เปลี่ยนสถานะ
                    if (diffMins >= 5) { 
                        needsUpdate = true; 
                        return { ...v, status: "กำลังฟอกไต" }; 
                    }
                }
            }
            return v;
        });

        // 🌟 ถ้าระบบเจอคิวที่เลยเวลา จะสั่งเซฟทับเงียบๆ ตัว Listener ของ Firebase จะพาการ์ดเปลี่ยนสีเองครับ
        if (needsUpdate) {
            db.ref('patients_database_v2/visits').set(updatedVisits);
        }
    },

    setToday: function() {
        const today = new Date(); const tzo = today.getTimezoneOffset() * 60000;
        const localDate = (new Date(Date.now() - tzo)).toISOString().split('T')[0];
        const dateInput = document.getElementById('visitDateSelector');
        if(dateInput) { 
            dateInput.value = localDate; 
            this.updateDateDisplay(localDate);
            this.loadVisitsData(); 
        }
    },

    updateDateDisplay: function(dateStr) {
        const display = document.getElementById('visitDateDisplay');
        if(!display || !dateStr) return;
        const dObj = new Date(dateStr);
        const thaiDate = `${String(dObj.getDate()).padStart(2,'0')}/${String(dObj.getMonth() + 1).padStart(2,'0')}/${dObj.getFullYear() + 543}`;
        display.innerText = thaiDate;
    },

    switchTab: function(tabName) {
        this.currentTab = tabName;
        const btnActive = document.getElementById('tab-active'); const btnCompleted = document.getElementById('tab-completed');
        if(tabName === 'active') { btnActive.className = "btn btn-premium-primary rounded-pill fw-bold px-4 shadow-sm"; btnCompleted.className = "btn btn-light rounded-pill fw-bold text-muted px-4 border shadow-sm"; } 
        else { btnActive.className = "btn btn-light rounded-pill fw-bold text-muted px-4 border shadow-sm"; btnCompleted.className = "btn btn-premium-success rounded-pill fw-bold px-4 shadow-sm"; }
        this.loadVisitsData(); 
    },

    loadVisitsData: function() {
        if(typeof db === 'undefined') return;
        const dateStr = document.getElementById('visitDateSelector').value; if(!dateStr) return;
        
        const dObj = new Date(dateStr); const thaiDate = `${String(dObj.getDate()).padStart(2,'0')}/${String(dObj.getMonth() + 1).padStart(2,'0')}/${dObj.getFullYear() + 543}`;
        const dateTextEl = document.getElementById('visit-date-text');
        if(dateTextEl) dateTextEl.innerHTML = `<i class="fa-regular fa-calendar-check text-success me-1"></i> แสดงคิวประจำวันที่ <b class="text-dark">${thaiDate}</b>`;

        db.ref('patients_database_v2/visits').on('value', snap => {
            const data = snap.val();
            let rawVisits = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
            this.allVisits = rawVisits.filter(v => v !== null);

            let todayVisits = this.allVisits.filter(v => v.date === dateStr);
            let activeVisits = todayVisits.filter(v => v.status !== "เสร็จสิ้น");
            let finishedVisits = todayVisits.filter(v => v.status === "เสร็จสิ้น");

            this.renderStats(todayVisits);

            let displayVisits = this.currentTab === 'active' ? activeVisits : finishedVisits;
            let mVisits = [], aVisits = [], eVisits = [];
            
            displayVisits.forEach(v => {
                let hour = parseInt((v.time || "00:00").split(":")[0]) || 0;
                if(hour >= 0 && hour < 10) mVisits.push(v); else if(hour >= 10 && hour < 14) aVisits.push(v); else eVisits.push(v);
            });

            this.renderColumn('board-morning', mVisits, 'รอบเช้า');
            this.renderColumn('board-afternoon', aVisits, 'รอบบ่าย');
            this.renderColumn('board-evening', eVisits, 'รอบเย็น');
        });
    },

    renderStats: function(dailyVisits) {
        let tTotal = dailyVisits.length; let tWait = dailyVisits.filter(v => v.status === 'รอตรวจ').length;
        let tDialysis = dailyVisits.filter(v => v.status === 'กำลังฟอกไต').length; let tDone = dailyVisits.filter(v => v.status === 'เสร็จสิ้น').length;

        const statContainer = document.getElementById('visit-stats-container'); if(!statContainer) return;
        statContainer.innerHTML = `
            <div class="col-md-3 col-sm-6"><div class="modern-panel p-4 h-100 position-relative overflow-hidden card-hover-float" style="border-top: 4px solid var(--muted); border-radius: 20px;"><div class="text-muted fw-bold small text-uppercase mb-2">คิวทั้งหมด</div><h2 class="fw-bold text-dark mb-0">${tTotal} <span class="fs-6 text-muted fw-normal">ราย</span></h2></div></div>
            <div class="col-md-3 col-sm-6"><div class="modern-panel p-4 h-100 position-relative overflow-hidden card-hover-float" style="border-top: 4px solid var(--primary); border-radius: 20px;"><div class="text-primary fw-bold small text-uppercase mb-2">รอตรวจ</div><h2 class="fw-bold text-primary mb-0">${tWait} <span class="fs-6 text-muted fw-normal">ราย</span></h2></div></div>
            <div class="col-md-3 col-sm-6"><div class="modern-panel p-4 h-100 position-relative overflow-hidden card-hover-float bg-warning-light" style="border-top: 4px solid var(--warning); border-radius: 20px;"><div class="text-warning-dark fw-bold small text-uppercase mb-2">กำลังฟอกไต</div><h2 class="fw-bold text-warning-dark mb-0">${tDialysis} <span class="fs-6 fw-normal">ราย</span></h2></div></div>
            <div class="col-md-3 col-sm-6"><div class="modern-panel p-4 h-100 position-relative overflow-hidden card-hover-float bg-success-light" style="border-top: 4px solid var(--success); border-radius: 20px;"><div class="text-success-dark fw-bold small text-uppercase mb-2">เสร็จสิ้น</div><h2 class="fw-bold text-success mb-0">${tDone} <span class="fs-6 text-success fw-normal opacity-75">ราย</span></h2></div></div>
        `;
    },

    renderColumn: function(elementId, visitList, shiftName) {
        const el = document.getElementById(elementId); if(!el) return;
        visitList.sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00"));

        if(visitList.length === 0) {
            el.innerHTML = `<div class="text-center p-4 border border-dashed rounded-4 text-muted h-100 d-flex flex-column align-items-center justify-content-center" style="background: var(--bg-main); border-color: #cbd5e1 !important;"><i class="fa-solid fa-bed text-light fa-3x mb-3" style="color:#cbd5e1!important;"></i><p class="mb-0 fw-bold" style="font-size:14px; font-family:'Prompt';">${shiftName} ยังไม่มีข้อมูลคิว</p></div>`;
            return;
        }

        let html = "";
        visitList.forEach(v => {
            let status = v.status || "รอตรวจ"; let bColor = "var(--info)"; let badgeClass = "badge-soft-info"; let opacityStyle = "";
            if(status.includes("กำลังฟอก")) { bColor = "var(--warning)"; badgeClass = "badge-soft-warning"; }
            if(status.includes("เสร็จสิ้น")) { bColor = "var(--success)"; badgeClass = "badge-soft-success"; opacityStyle = "opacity: 0.8; background: var(--bg-main);"; }

            html += `
            <div class="visit-card shadow-sm mb-3 p-3 border" style="border-left: 5px solid ${bColor}; ${opacityStyle}" onclick="VisitsPage.manageVisit('${v.id}')">
                <div class="d-flex justify-content-between align-items-start w-100 mb-2">
                    <div><span class="visit-bed shadow-sm"><i class="fa-solid fa-bed me-1 text-primary"></i> เตียง ${v.bed || '-'}</span><span class="ms-2 fw-bold text-primary" style="font-size:13px;">⏰ ${v.time || '-'}</span></div>
                    <div class="text-end"><span class="badge ${badgeClass} shadow-sm rounded-pill px-2 py-1" style="font-size:11px; font-family:'Prompt';">${status}</span></div>
                </div>
                <div class="fw-bold text-dark mt-2 mb-1" style="font-size:15px; font-family:'Prompt';">${v.name || 'ไม่ระบุชื่อ'}</div>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="text-muted fw-bold" style="font-size:12px;"><i class="fa-solid fa-id-card text-secondary me-1"></i> HN: ${v.hn || '-'}</div>
                    <div class="text-muted fw-bold" style="font-size:12px;"><i class="fa-solid fa-shield-heart text-success me-1"></i> ${v.right || '-'}</div>
                </div>
            </div>`;
        });
        el.innerHTML = html;
    },

    readCardForVisit: async function() {
        const btn = document.getElementById('btn-visit-read-card'); if(!btn) return;
        const originalHtml = btn.innerHTML; btn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> กำลังอ่านบัตร...`; btn.disabled = true;

        try {
            const response = await fetch('http://localhost:8000/read-card');
            if (!response.ok) throw new Error("ไม่สามารถเชื่อมต่อ Local Agent ได้");
            const result = await response.json();
            
            if (result.error || result.status === "error") { Swal.showValidationMessage(result.error || 'กรุณาตรวจสอบการเสียบบัตรประชาชน'); btn.innerHTML = originalHtml; btn.disabled = false; return; }

            const data = result.data || result; const cid = data.cid || data.idcard || "";
            if(!cid) { Swal.showValidationMessage('ไม่พบเลขบัตรประชาชนบนชิปการ์ด'); btn.innerHTML = originalHtml; btn.disabled = false; return; }

            const cleanCid = cid.replace(/-/g, "");
            const foundPt = this.patientsList.find(p => (p.idcard || "").replace(/-/g, "") === cleanCid);

            if(foundPt) {
                const targetDate = document.getElementById('visitDateSelector').value;
                const isDuplicate = this.allVisits.some(v => v.hn === foundPt.hn && v.date === targetDate);
                if (isDuplicate) { Swal.showValidationMessage(`🚫 [ล็อกระบบ] ${foundPt.name_th} มีชื่ออยู่ในคิวของวันนี้แล้ว ห้ามลงซ้ำ!`); btn.innerHTML = originalHtml; btn.disabled = false; return; }

                document.getElementById('swal-v-patient').value = `${foundPt.hn} | ${foundPt.name_th}`;
                btn.innerHTML = `<i class="fa-solid fa-check-circle me-2"></i> ดึงข้อมูลสำเร็จ`; btn.className = "btn btn-premium-success w-100 py-3 fw-bold mb-3 rounded-pill shadow-sm"; Swal.resetValidationMessage();
            } else {
                Swal.showValidationMessage(`ไม่พบประวัติ (เลข ปชช: ${cid}) กรุณาไปลงทะเบียนผู้ป่วยใหม่ก่อน`); btn.innerHTML = originalHtml; btn.disabled = false; 
            }
        } catch (err) { Swal.showValidationMessage('กรุณาตรวจสอบว่าเปิดโปรแกรมอ่านบัตรไว้แล้วหรือไม่'); btn.innerHTML = originalHtml; btn.disabled = false; }
    },

    openAddVisitModal: function() {
        if(this.patientsList.length === 0) { Swal.fire('ฐานข้อมูลว่างเปล่า', 'ยังไม่มีรายชื่อผู้ป่วยในระบบ กรุณาลงทะเบียนผู้ป่วยก่อนครับ', 'warning'); return; }
        let optionsHtml = this.patientsList.map(p => `<option value="${p.hn} | ${p.name_th}"></option>`).join('');
        const currentDate = document.getElementById('visitDateSelector').value;

        let hourOptions = '';
        for(let h=1; h<=24; h++) {
            let hr = String(h).padStart(2, '0');
            hourOptions += `<option value="${hr}" ${hr==='08'?'selected':''}>${hr}</option>`;
        }

        let minuteOptions = '';
        for(let m=0; m<=59; m++) {
            let min = String(m).padStart(2, '0');
            minuteOptions += `<option value="${min}" ${min==='00'?'selected':''}>${min}</option>`;
        }

        Swal.fire({
            title: `<h4 class="fw-bold mb-0 text-primary" style="font-family:'Prompt';"><i class="fa-solid fa-bed-pulse me-2"></i> เปิดคิวฟอกไตใหม่</h4>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <button type="button" class="btn btn-outline-primary w-100 fw-bold shadow-sm mb-4 py-3 bg-white" style="border-radius:14px; border-style:dashed;" id="btn-visit-read-card" onclick="VisitsPage.readCardForVisit()">
                        <i class="fa-solid fa-id-card me-2"></i> เสียบบัตร ปชช. ดึงประวัติคนไข้
                    </button>
                    
                    <label class="form-label fw-bold text-secondary small">เลือกผู้ป่วย (พิมพ์ค้นหาชื่อ หรือ HN)</label>
                    <input list="visit-pt-datalist" id="swal-v-patient" class="input-modern w-100 mb-3 shadow-sm" placeholder="พิมพ์ค้นหา หรือเสียบบัตร...">
                    <datalist id="visit-pt-datalist">${optionsHtml}</datalist>
                    
                    <div class="row g-3">
                        <div class="col-7">
                            <label class="form-label fw-bold text-secondary small">เวลานัดหมาย (ชม. : นาที)</label>
                            <div class="d-flex align-items-center gap-1">
                                <select id="swal-v-time-hour" class="form-select input-modern shadow-sm fw-bold text-primary text-center" style="cursor:pointer; height: 45px; padding-right:10px;">
                                    ${hourOptions}
                                </select>
                                <span class="fw-bold text-dark">:</span>
                                <select id="swal-v-time-minute" class="form-select input-modern shadow-sm fw-bold text-primary text-center" style="cursor:pointer; height: 45px; padding-right:10px;">
                                    ${minuteOptions}
                                </select>
                                <span class="fw-bold text-secondary ms-1 small">น.</span>
                            </div>
                        </div>
                        <div class="col-5">
                            <label class="form-label fw-bold text-primary small">เบอร์เตียง</label>
                            <input type="text" id="swal-v-bed" class="input-modern w-100 border-primary text-primary shadow-sm" placeholder="เช่น 01, A2">
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-check me-1"></i> บันทึกคิว', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#10b981', width: 500,
            preConfirm: () => {
                let ptVal = document.getElementById('swal-v-patient').value; 
                let hourVal = document.getElementById('swal-v-time-hour').value;
                let minVal = document.getElementById('swal-v-time-minute').value;
                let bedVal = document.getElementById('swal-v-bed').value;
                
                let timeVal = `${hourVal}:${minVal}`;

                if(!ptVal || !hourVal || !minVal || !bedVal) { Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง'); return false; }
                let hn = ptVal.split(' | ')[0].trim(); let ptObj = this.patientsList.find(p => p.hn === hn);
                if(!ptObj) { Swal.showValidationMessage('ไม่พบรหัส HN นี้ในระบบ'); return false; }
                const isDuplicate = this.allVisits.some(v => v.hn === ptObj.hn && v.date === currentDate);
                if(isDuplicate) { Swal.showValidationMessage(`🚫 ${ptObj.name_th} มีคิวของวันนี้อยู่แล้ว ไม่สามารถลงซ้ำได้`); return false; }

                return { id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9), date: currentDate, hn: ptObj.hn, name: ptObj.name_th, right: ptObj.right || 'ไม่ระบุ', time: timeVal, bed: bedVal, status: "รอตรวจ" };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                let newVisit = result.value; let updatedVisits = [...this.allVisits, newVisit];
                Swal.fire({ title: 'กำลังจัดคิว...', didOpen: () => Swal.showLoading() });
                db.ref('patients_database_v2/visits').set(updatedVisits).then(() => Swal.fire({ title: 'สำเร็จ', text: `ลงคิวเตียง ${newVisit.bed} ให้ ${newVisit.name} เรียบร้อย`, icon: 'success', timer: 1500, showConfirmButton: false })).catch(err => Swal.fire('Error', err.message, 'error'));
            }
        });
    },

    quickSwipeCheckOut: async function() {
        Swal.fire({
            title: '🔌 ระบบดึงคิวออกด้วยบัตรประชาชน',
            html: `<div class="py-3 text-center"><i class="fa-solid fa-id-card fa-4x text-primary mb-3 fa-beat"></i><h5 class="fw-bold" style="font-family:'Prompt';">กรุณาเสียบบัตรประชาชนของคนไข้</h5><p class="text-muted small mb-0">ระบบจะดึงคนไข้คนนี้ออกจากกระดานคิวและปิดสถานะเป็นเสร็จสิ้นทันที</p></div>`,
            showCancelButton: true, cancelButtonText: 'ยกเลิก', allowOutsideClick: false, width: 500,
            didOpen: async () => {
                Swal.showLoading(Swal.getCancelButton());
                try {
                    const response = await fetch('http://localhost:8000/read-card');
                    if (!response.ok) throw new Error("Agent Offline");
                    const result = await response.json();
                    if(result.error || result.status === "error") { Swal.fire('เกิดข้อผิดพลาด', result.error || 'อ่านบัตรล้มเหลว', 'error'); return; }

                    const data = result.data || result; const cid = data.cid || data.idcard || "";
                    if(!cid) { Swal.fire('Error', 'ไม่พบเลขบัตรประชาชน', 'error'); return; }

                    const cleanCid = cid.replace(/-/g, ""); const ptObj = this.patientsList.find(p => (p.idcard || "").replace(/-/g, "") === cleanCid);
                    if(!ptObj) { Swal.fire('ไม่พบคนไข้', 'ไม่พบประวัติเลขบัตรนี้ในฐานข้อมูลเวชระเบียน', 'warning'); return; }

                    const currentDate = document.getElementById('visitDateSelector').value;
                    const activeVisit = this.allVisits.find(v => v.hn === ptObj.hn && v.date === currentDate && v.status !== "เสร็จสิ้น");

                    if(activeVisit) {
                        let updatedVisits = this.allVisits.map(item => item.id === activeVisit.id ? { ...item, status: "เสร็จสิ้น" } : item);
                        db.ref('patients_database_v2/visits').set(updatedVisits).then(() => { Swal.fire({ title: 'เช็คเอาท์สำเร็จ! 🎉', html: `ปิด Visit และย้ายการ์ดเตียง <b>${activeVisit.bed}</b> ของ <b>${activeVisit.name}</b> ไปที่ประวัติเรียบร้อย`, icon: 'success', timer: 2500 }); });
                    } else { Swal.fire('ไม่พบข้อมูลคิว', `ไม่พบข้อมูลคิวฟอกไตที่กำลังทำงานอยู่ของ <b>${ptObj.name_th}</b> ในวันนี้ครับ`, 'info'); }
                } catch(e) { Swal.fire('ตัวเชื่อมต่อขัดข้อง', 'กรุณาตรวจสอบการเปิดโปรแกรม Local Bridge Agent', 'error'); }
            }
        });
    },

    manageVisit: function(visitId) {
        const v = this.allVisits.find(x => x.id === visitId); if(!v) return;
        Swal.fire({
            title: `<h5 class="fw-bold mb-0 text-dark" style="font-family:'Prompt';"><i class="fa-solid fa-gears text-primary me-2"></i>จัดการคิว: เตียง ${v.bed}</h5>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <div class="p-3 bg-light rounded-4 border mb-4 text-center shadow-sm"><h5 class="fw-bold text-primary mb-1">${v.name}</h5><div class="text-muted small fw-bold">HN: ${v.hn} <span class="mx-2">|</span> รอบเวลา: ${v.time} น.</div></div>
                    <button class="btn btn-premium-primary btn-lg w-100 mb-4 fw-bold shadow-sm rounded-pill" onclick="Swal.close(); App.switchPage('visit_detail', null, '${v.id}')"><i class="fa-solid fa-file-medical me-2"></i> บันทึกข้อมูลฟอกไตเชิงลึก (HD Flowsheet)</button>
                    <hr class="mb-4 border-light">
                    <label class="form-label fw-bold text-secondary small">อัปเดตสถานะคิวด่วน</label>
                    <select id="swal-update-status" class="form-select form-select-lg mb-3 shadow-sm fw-bold text-dark input-modern">
                        <option value="รอตรวจ" ${v.status === 'รอตรวจ' ? 'selected' : ''}>🔵 รอตรวจ</option><option value="กำลังฟอกไต" ${v.status === 'กำลังฟอกไต' ? 'selected' : ''}>🟠 กำลังฟอกไต</option><option value="เสร็จสิ้น" ${v.status === 'เสร็จสิ้น' ? 'selected' : ''}>🟢 เสร็จสิ้น / ดึงการ์ดออก</option>
                    </select>
                </div>
            `,
            showCancelButton: true, showDenyButton: true, width: 500, confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึกสถานะ', cancelButtonText: 'ปิดหน้าต่าง', denyButtonText: '<i class="fa-solid fa-trash me-1"></i> ลบคิว', confirmButtonColor: '#2563eb', denyButtonColor: '#ef4444',
            preConfirm: () => { return document.getElementById('swal-update-status').value; }
        }).then((result) => {
            if (result.isConfirmed) {
                let newStatus = result.value; let updatedVisits = this.allVisits.map(item => item.id === visitId ? { ...item, status: newStatus } : item);
                db.ref('patients_database_v2/visits').set(updatedVisits).then(() => { const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 }); Toast.fire({ icon: 'success', title: 'อัปเดตสถานะสำเร็จ' }); });
            } else if (result.isDenied) {
                Swal.fire({ title: 'ยืนยันการลบ?', text: `ต้องการยกเลิกคิวเตียง ${v.bed} ของ ${v.name} ใช่หรือไม่?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'ใช่, ยกเลิกคิว' }).then((delRes) => {
                    if (delRes.isConfirmed) { let updatedVisits = this.allVisits.filter(item => item.id !== visitId); db.ref('patients_database_v2/visits').set(updatedVisits).then(() => Swal.fire('ลบแล้ว!', 'คิวถูกยกเลิกออกจากกระดาน', 'success')); }
                });
            }
        });
    }
};