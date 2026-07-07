// js/pages/visits.js
// 🚀 Enterprise Kanban Board Module: Atomic Checkouts, Leak-Free Intervals & Theme Native

class VisitsPageComponent {
    constructor() {
        this.state = {
            currentTab: 'active',
            allVisits: [],
            patientsList: [],
            selectedDate: ''
        };
        
        this.firebaseListeners = [];
        this.autoUpdateInterval = null;
        
        // ผูกฟังก์ชันเพื่อใช้ใน Event Listeners
        this.boundHandleSearch = this.#handleSearch.bind(this);
    }

    get html() {
        return `
            <div class="page-header mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                    <h2 class="page-title text-primary"><i class="fa-solid fa-bed-pulse me-2"></i> คิวฟอกไตประจำวัน</h2>
                    <p class="mt-1 mb-0" id="visit-date-text" style="color: var(--text-muted);">กำลังโหลดข้อมูล...</p>
                </div>
                <div class="d-flex gap-2 flex-wrap">
                    <div class="search-box-modern shadow-sm p-1 ps-3 d-flex align-items-center position-relative" style="width: auto; border-radius: 50px; background-color: var(--bg-surface); border: 1px solid var(--border-color);">
                        <input type="date" id="visitDateSelector" class="position-absolute" style="opacity: 0; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer; z-index: 10;" onfocus="this.showPicker && this.showPicker()">
                        <i class="fa-solid fa-calendar-day text-primary me-2 position-relative" style="z-index: 1; pointer-events: none;"></i>
                        <span id="visitDateDisplay" class="fw-bold position-relative" style="font-family:'Prompt'; min-width: 90px; text-align: center; z-index: 1; pointer-events: none; color: var(--text-dark);">กำลังโหลด...</span>
                        <button class="btn btn-premium-primary ms-3 py-1 px-3 shadow-sm position-relative" style="border-radius: 50px; font-size:14px; z-index: 20;" onclick="App.pages.visits.setToday()" title="กลับมาวันที่ปัจจุบัน">วันนี้</button>
                    </div>
                    <button class="btn btn-premium btn-premium-danger" onclick="App.pages.visits.quickSwipeCheckOut()">
                        <i class="fa-solid fa-id-card-clip me-2"></i> ดึงคิวออก
                    </button>
                    <button class="btn btn-premium btn-premium-primary px-4" onclick="App.pages.visits.openAddVisitModal()">
                        <i class="fa-solid fa-plus me-2"></i> เพิ่มคิวใหม่
                    </button>
                </div>
            </div>
            
            <div class="row g-4 mb-4" id="visit-stats-container"></div>

            <div class="modern-panel mb-4 shadow-sm p-4" style="border-radius: 20px; background-color: var(--bg-surface); border: 1px solid var(--border-color);">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <ul class="nav nav-pills" role="tablist">
                        <li class="nav-item me-2">
                            <button type="button" id="tab-active" class="btn btn-premium-primary rounded-pill fw-bold px-4 shadow-sm" onclick="App.pages.visits.switchTab('active')">
                                <i class="fa-solid fa-user-clock me-1"></i> คิวฟอกปัจจุบัน
                            </button>
                        </li>
                        <li class="nav-item">
                            <button type="button" id="tab-completed" class="btn rounded-pill fw-bold px-4 border shadow-sm" style="background-color: var(--bg-body); color: var(--text-muted); border-color: var(--border-color) !important;" onclick="App.pages.visits.switchTab('completed')">
                                <i class="fa-solid fa-check-circle me-1"></i> ประวัติฟอกเสร็จแล้ว
                            </button>
                        </li>
                    </ul>

                    <div class="search-box-modern shadow-sm" style="width: 280px; padding: 10px 20px; border-radius: 50px; background-color: var(--bg-surface); border: 1px solid var(--border-color);">
                        <i class="fa-solid fa-search text-primary"></i>
                        <input type="text" id="visitSearch" class="border-0 bg-transparent fw-bold ms-2 w-100" placeholder="ค้นหาชื่อ, HN, เตียง..." style="outline:none; color: var(--text-dark);">
                    </div>
                </div>
            </div>

            <div class="row g-4 flex-nowrap overflow-auto pb-4">
                <div class="col-md-4 min-w-300">
                    <div class="modern-panel p-0 h-100 d-flex flex-column shadow-sm overflow-hidden" style="border-radius: 20px; border: 1px solid var(--border-color); border-top: 4px solid var(--info); background-color: var(--bg-surface);">
                        <div class="p-3 border-bottom" style="background-color: var(--bg-body); border-color: var(--border-color) !important;">
                            <h6 class="fw-bold mb-0 text-info" style="font-family:'Prompt';"><i class="fa-regular fa-sun me-2"></i> รอบเช้า (06:00 - 10:00)</h6>
                        </div>
                        <div class="p-3 flex-grow-1" id="board-morning" style="min-height: 300px; background-color: var(--bg-surface);">
                            <div class="text-center py-5" style="color: var(--text-muted);"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
                        </div>
                    </div>
                </div>

                <div class="col-md-4 min-w-300">
                    <div class="modern-panel p-0 h-100 d-flex flex-column shadow-sm overflow-hidden" style="border-radius: 20px; border: 1px solid var(--border-color); border-top: 4px solid var(--warning); background-color: var(--bg-surface);">
                        <div class="p-3 border-bottom" style="background-color: var(--bg-body); border-color: var(--border-color) !important;">
                            <h6 class="fw-bold mb-0" style="color: var(--warning); font-family:'Prompt';"><i class="fa-solid fa-cloud-sun me-2"></i> รอบบ่าย (10:00 - 14:00)</h6>
                        </div>
                        <div class="p-3 flex-grow-1" id="board-afternoon" style="min-height: 300px; background-color: var(--bg-surface);"></div>
                    </div>
                </div>

                <div class="col-md-4 min-w-300">
                    <div class="modern-panel p-0 h-100 d-flex flex-column shadow-sm overflow-hidden" style="border-radius: 20px; border: 1px solid var(--border-color); border-top: 4px solid #94a3b8; background-color: var(--bg-surface);">
                        <div class="p-3 border-bottom" style="background-color: var(--bg-body); border-color: var(--border-color) !important;">
                            <h6 class="fw-bold mb-0" style="color: #94a3b8; font-family:'Prompt';"><i class="fa-solid fa-moon me-2"></i> รอบเย็น (14:00 เป็นต้นไป)</h6>
                        </div>
                        <div class="p-3 flex-grow-1" id="board-evening" style="min-height: 300px; background-color: var(--bg-surface);"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // 🚀 Lifecycle: Mount
    init() {
        if (typeof db === 'undefined' || typeof firebase === 'undefined') return;

        this.#bindEvents();

        if (firebase.auth().currentUser) {
            this.#executeLoad();
        } else {
            const unsub = firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    unsub(); 
                    this.#executeLoad();
                } else {
                    document.getElementById('visit-date-text').innerHTML = '<span class="text-warning fw-bold"><i class="fa-solid fa-lock"></i> กำลังตรวจสอบสิทธิ์...</span>';
                }
            });
        }
    }

    // 🧹 Lifecycle: Unmount (Kill Event & Interval)
    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        
        if (this.autoUpdateInterval) {
            clearInterval(this.autoUpdateInterval);
            this.autoUpdateInterval = null;
        }

        const searchInp = document.getElementById('visitSearch');
        if (searchInp) searchInp.removeEventListener('input', this.boundHandleSearch);

        console.log("🧹 [Visits Kanban] Cleaned up listeners and Auto-Update loop.");
    }

    // ---------------------------------------------------------
    // ⚙️ Core Logic & Data Loading
    // ---------------------------------------------------------
    #bindEvents() {
        const dateInput = document.getElementById('visitDateSelector');
        if(dateInput) {
            dateInput.addEventListener('change', (e) => { 
                this.state.selectedDate = e.target.value;
                this.#updateDateDisplay(this.state.selectedDate);
                this.#loadVisitsData(); 
            });
        }

        const searchInp = document.getElementById('visitSearch');
        if(searchInp) {
            searchInp.addEventListener('input', this.boundHandleSearch);
        }
    }

    #handleSearch(e) {
        const term = e.target.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.visit-card');
        cards.forEach(card => {
            card.style.display = card.innerText.toLowerCase().includes(term) ? 'block' : 'none';
        });
    }

    #executeLoad() {
        // 1. ดึงข้อมูลคนไข้เพื่อหาชื่อ/รูปภาพ
        const refPt = db.ref('patients_database_v2/patients');
        const cbPt = refPt.on('value', snap => {
            const data = snap.val() || {};
            this.state.patientsList = Object.keys(data).map(k => ({ firebaseKey: k, ...data[k] })).filter(p => p !== null);
        });
        this.firebaseListeners.push({ path: 'patients_database_v2/patients', callback: cbPt });

        this.setToday(); 
        
        // 2. เริ่มวงจร Auto Update แบบปลอดภัย
        if (this.autoUpdateInterval) clearInterval(this.autoUpdateInterval);
        this.autoUpdateInterval = setInterval(() => { this.#checkAutoStart(); }, 30000);
    }

    #loadVisitsData() {
        if (!this.state.selectedDate) return;
        const dateStr = this.state.selectedDate;
        
        const dObj = new Date(dateStr); 
        const thaiDate = `${String(dObj.getDate()).padStart(2,'0')}/${String(dObj.getMonth() + 1).padStart(2,'0')}/${dObj.getFullYear() + 543}`;
        const dateTextEl = document.getElementById('visit-date-text');
        if(dateTextEl) dateTextEl.innerHTML = `<i class="fa-regular fa-calendar-check text-success me-1"></i> แสดงคิวประจำวันที่ <b style="color: var(--text-dark);">${thaiDate}</b>`;

        const oldVisitListener = this.firebaseListeners.findIndex(l => l.id === 'visits');
        if (oldVisitListener > -1) {
            db.ref(this.firebaseListeners[oldVisitListener].path).off('value', this.firebaseListeners[oldVisitListener].callback);
            this.firebaseListeners.splice(oldVisitListener, 1);
        }

        const refVisits = db.ref('patients_database_v2/visits').orderByChild('date').equalTo(dateStr);
        const cbVisits = refVisits.on('value', snap => {
            try {
                const data = snap.val() || {};
                let todayVisits = Object.keys(data).map(k => ({ firebaseKey: k, ...data[k] })).filter(Boolean);
                this.state.allVisits = todayVisits;

                let activeVisits = todayVisits.filter(v => v.status !== "เสร็จสิ้น");
                let finishedVisits = todayVisits.filter(v => v.status === "เสร็จสิ้น");

                this.#renderStats(todayVisits);

                let displayVisits = this.state.currentTab === 'active' ? activeVisits : finishedVisits;
                let mVisits = [], aVisits = [], eVisits = [];
                
                displayVisits.forEach(v => {
                    let hour = parseInt(String(v.time || "00:00").split(":")[0]) || 0;
                    if(hour >= 0 && hour < 10) mVisits.push(v); else if(hour >= 10 && hour < 14) aVisits.push(v); else eVisits.push(v);
                });

                this.#renderColumn('board-morning', mVisits, 'รอบเช้า');
                this.#renderColumn('board-afternoon', aVisits, 'รอบบ่าย');
                this.#renderColumn('board-evening', eVisits, 'รอบเย็น');
            } catch (err) {
                console.error("Render Visits Error:", err);
                document.getElementById('board-morning').innerHTML = '<div class="text-center text-danger p-4"><i class="fa-solid fa-bug fa-2x mb-2"></i><br>ข้อมูลคิวฟอกไตขัดข้อง: ' + err.message + '</div>';
            }
        });
        
        this.firebaseListeners.push({ id: 'visits', path: 'patients_database_v2/visits', callback: cbVisits });
    }

    // ---------------------------------------------------------
    // 🛡️ Atomic Auto Update & Mutations
    // ---------------------------------------------------------
    #checkAutoStart() {
        if (!this.state.allVisits || this.state.allVisits.length === 0) return;
        const now = new Date(); 
        const tzo = now.getTimezoneOffset() * 60000;
        const todayStr = new Date(now.getTime() - tzo).toISOString().split('T')[0];
        
        let updates = {}; 

        this.state.allVisits.forEach(v => {
            if (v.date === todayStr && v.status === "รอตรวจ" && v.time) {
                const parts = String(v.time).split(':');
                if (parts.length === 2) {
                    const hours = parseInt(parts[0], 10); 
                    const minutes = parseInt(parts[1], 10);
                    const scheduledTime = new Date(); 
                    scheduledTime.setHours(hours, minutes, 0, 0);
                    
                    const diffMins = (now - scheduledTime) / 60000;
                    
                    if (diffMins >= 5 && v.firebaseKey) { 
                        updates[`patients_database_v2/visits/${v.firebaseKey}/status`] = "กำลังฟอกไต";
                    }
                }
            }
        });

        if (Object.keys(updates).length > 0) {
            db.ref().update(updates);
        }
    }

    async quickSwipeCheckOut() {
        Swal.fire({
            title: '🔌 ระบบดึงคิวออกด้วยบัตรประชาชน',
            html: `<div class="py-3 text-center"><i class="fa-solid fa-id-card fa-4x text-primary mb-3 fa-beat"></i><h5 class="fw-bold" style="font-family:'Prompt'; color: var(--text-dark);">กรุณาเสียบบัตรประชาชนของคนไข้</h5><p class="small mb-0" style="color: var(--text-muted);">ระบบจะดึงคนไข้คนนี้ออกจากกระดานคิวและปิดสถานะเป็นเสร็จสิ้นทันที</p></div>`,
            showCancelButton: true, cancelButtonText: 'ยกเลิก', allowOutsideClick: false, width: 500,
            didOpen: async () => {
                Swal.showLoading(Swal.getCancelButton());
                try {
                    const response = await fetch('http://localhost:8000/read-card', { signal: AbortSignal.timeout(10000) });
                    if (!response.ok) throw new Error("Agent Offline");
                    
                    const result = await response.json();
                    if(result.error || result.status === "error") { Swal.fire('เกิดข้อผิดพลาด', result.error || 'อ่านบัตรล้มเหลว', 'error'); return; }

                    const data = result.data || result; const cid = data.cid || data.idcard || "";
                    if(!cid) { Swal.fire('Error', 'ไม่พบเลขบัตรประชาชน', 'error'); return; }

                    const cleanCid = cid.replace(/-/g, ""); 
                    const ptObj = this.state.patientsList.find(p => (p.idcard || "").replace(/-/g, "") === cleanCid);
                    if(!ptObj) { Swal.fire('ไม่พบคนไข้', 'ไม่พบประวัติเลขบัตรนี้ในฐานข้อมูลเวชระเบียน', 'warning'); return; }

                    const currentDate = this.state.selectedDate;
                    const activeVisit = this.state.allVisits.find(v => v.hn === ptObj.hn && v.status !== "เสร็จสิ้น"); 

                    if(activeVisit && activeVisit.firebaseKey) {
                        await db.ref(`patients_database_v2/visits/${activeVisit.firebaseKey}`).update({ status: "เสร็จสิ้น" });
                        Swal.fire({ title: 'เช็คเอาท์สำเร็จ! 🎉', html: `ปิด Visit และย้ายการ์ดเตียง <b>${activeVisit.bed}</b> ของ <b>${this.#escapeHTML(activeVisit.name)}</b> ไปที่ประวัติเรียบร้อย`, icon: 'success', timer: 2500 });
                    } else { 
                        Swal.fire('ไม่พบข้อมูลคิว', `ไม่พบข้อมูลคิวฟอกไตที่กำลังทำงานอยู่ของ <b>${this.#escapeHTML(ptObj.name_th)}</b> ในวันนี้ครับ`, 'info'); 
                    }
                } catch(e) { 
                    Swal.fire('ตัวเชื่อมต่อขัดข้อง', 'กรุณาตรวจสอบการเปิดโปรแกรม Local Bridge Agent หรือเครื่องอ่านบัตร', 'error'); 
                }
            }
        });
    }

    manageVisit(firebaseKey) { 
        const v = this.state.allVisits.find(x => x.firebaseKey === firebaseKey); 
        if(!v) return;
        
        Swal.fire({
            title: `<h5 class="fw-bold mb-0" style="font-family:'Prompt'; color: var(--text-dark);"><i class="fa-solid fa-gears text-primary me-2"></i>จัดการคิว: เตียง ${v.bed}</h5>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <div class="p-3 rounded-4 border mb-4 text-center shadow-sm" style="background-color: var(--bg-body); border-color: var(--border-color) !important;">
                        <h5 class="fw-bold text-primary mb-1">${this.#escapeHTML(v.name)}</h5>
                        <div class="small fw-bold" style="color: var(--text-muted);">HN: ${this.#escapeHTML(v.hn)} <span class="mx-2">|</span> รอบเวลา: ${v.time} น.</div>
                    </div>
                    <button class="btn btn-premium-primary btn-lg w-100 mb-4 fw-bold shadow-sm rounded-pill" onclick="Swal.close(); App.switchPage('visit_detail', null, '${v.id}')"><i class="fa-solid fa-file-medical me-2"></i> บันทึกข้อมูลฟอกไตเชิงลึก (HD Flowsheet)</button>
                    <hr class="mb-4" style="border-color: var(--border-color);">
                    <label class="form-label fw-bold small" style="color: var(--text-muted);">อัปเดตสถานะคิวด่วน</label>
                    <select id="swal-update-status" class="form-select form-select-lg mb-3 shadow-sm fw-bold input-modern" style="color: var(--text-dark);">
                        <option value="รอตรวจ" ${v.status === 'รอตรวจ' ? 'selected' : ''}>🔵 รอตรวจ</option>
                        <option value="กำลังฟอกไต" ${v.status === 'กำลังฟอกไต' ? 'selected' : ''}>🟠 กำลังฟอกไต</option>
                        <option value="เสร็จสิ้น" ${v.status === 'เสร็จสิ้น' ? 'selected' : ''}>🟢 เสร็จสิ้น / ดึงการ์ดออก</option>
                    </select>
                </div>
            `,
            showCancelButton: true, showDenyButton: true, width: 500, confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึกสถานะ', cancelButtonText: 'ปิด', denyButtonText: '<i class="fa-solid fa-trash me-1"></i> ลบคิว', confirmButtonColor: '#2563eb', denyButtonColor: '#ef4444',
            preConfirm: () => { return document.getElementById('swal-update-status').value; }
        }).then((result) => {
            if (result.isConfirmed) {
                let newStatus = result.value; 
                db.ref(`patients_database_v2/visits/${firebaseKey}`).update({ status: newStatus }).then(() => { 
                    Swal.fire({ title: 'อัปเดตสถานะคิวสำเร็จ', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
                });
            } else if (result.isDenied) {
                Swal.fire({ title: 'ยืนยันการลบ?', text: `ต้องการยกเลิกคิวเตียง ${v.bed} ของ ${this.#escapeHTML(v.name)} ใช่หรือไม่?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'ใช่, ยกเลิกคิว' }).then((delRes) => {
                    if (delRes.isConfirmed) { 
                        db.ref(`patients_database_v2/visits/${firebaseKey}`).remove().then(() => Swal.fire('ลบแล้ว!', 'คิวถูกยกเลิกออกจากกระดาน', 'success')); 
                    }
                });
            }
        });
    }

    // ---------------------------------------------------------
    // 🎨 UI Manipulation
    // ---------------------------------------------------------
    setToday() {
        const today = new Date(); const tzo = today.getTimezoneOffset() * 60000;
        const localDate = (new Date(Date.now() - tzo)).toISOString().split('T')[0];
        
        const dateInput = document.getElementById('visitDateSelector');
        if(dateInput) { 
            dateInput.value = localDate; 
            this.state.selectedDate = localDate;
            this.#updateDateDisplay(localDate);
            this.#loadVisitsData(); 
        }
    }

    #updateDateDisplay(dateStr) {
        const display = document.getElementById('visitDateDisplay');
        if(!display || !dateStr) return;
        const dObj = new Date(dateStr);
        const thaiDate = `${String(dObj.getDate()).padStart(2,'0')}/${String(dObj.getMonth() + 1).padStart(2,'0')}/${dObj.getFullYear() + 543}`;
        display.innerText = thaiDate;
    }

    switchTab(tabName) {
        this.state.currentTab = tabName;
        const btnActive = document.getElementById('tab-active'); 
        const btnCompleted = document.getElementById('tab-completed');
        
        if(tabName === 'active') { 
            btnActive.className = "btn btn-premium-primary rounded-pill fw-bold px-4 shadow-sm"; 
            btnCompleted.className = "btn rounded-pill fw-bold px-4 border shadow-sm"; 
            btnCompleted.style.cssText = "background-color: var(--bg-body); color: var(--text-muted); border-color: var(--border-color) !important;";
        } else { 
            btnActive.className = "btn rounded-pill fw-bold px-4 border shadow-sm"; 
            btnActive.style.cssText = "background-color: var(--bg-body); color: var(--text-muted); border-color: var(--border-color) !important;";
            btnCompleted.className = "btn btn-premium-success rounded-pill fw-bold px-4 shadow-sm"; 
            btnCompleted.style.cssText = "";
        }
        
        this.#loadVisitsData(); 
    }

    #renderStats(dailyVisits) {
        let tTotal = dailyVisits.length; let tWait = dailyVisits.filter(v => v.status === 'รอตรวจ').length;
        let tDialysis = dailyVisits.filter(v => v.status === 'กำลังฟอกไต').length; let tDone = dailyVisits.filter(v => v.status === 'เสร็จสิ้น').length;

        const statContainer = document.getElementById('visit-stats-container'); if(!statContainer) return;
        statContainer.innerHTML = `
            <div class="col-md-3 col-sm-6"><div class="modern-panel p-4 h-100 position-relative overflow-hidden card-hover-float" style="background-color: var(--bg-surface); border: 1px solid var(--border-color); border-top: 4px solid var(--muted); border-radius: 20px;"><div class="fw-bold small text-uppercase mb-2" style="color: var(--text-muted);">คิวทั้งหมด</div><h2 class="fw-bold mb-0" style="color: var(--text-dark);">${tTotal} <span class="fs-6 fw-normal" style="color: var(--text-muted);">ราย</span></h2></div></div>
            <div class="col-md-3 col-sm-6"><div class="modern-panel p-4 h-100 position-relative overflow-hidden card-hover-float" style="background-color: var(--bg-surface); border: 1px solid var(--border-color); border-top: 4px solid var(--primary); border-radius: 20px;"><div class="text-primary fw-bold small text-uppercase mb-2">รอตรวจ</div><h2 class="fw-bold text-primary mb-0">${tWait} <span class="fs-6 fw-normal" style="color: var(--text-muted);">ราย</span></h2></div></div>
            <div class="col-md-3 col-sm-6"><div class="modern-panel p-4 h-100 position-relative overflow-hidden card-hover-float" style="background-color: var(--bg-surface); border: 1px solid var(--border-color); border-top: 4px solid var(--warning); border-radius: 20px;"><div class="fw-bold small text-uppercase mb-2" style="color: var(--warning);">กำลังฟอกไต</div><h2 class="fw-bold mb-0" style="color: var(--warning);">${tDialysis} <span class="fs-6 fw-normal" style="color: var(--text-muted);">ราย</span></h2></div></div>
            <div class="col-md-3 col-sm-6"><div class="modern-panel p-4 h-100 position-relative overflow-hidden card-hover-float" style="background-color: var(--bg-surface); border: 1px solid var(--border-color); border-top: 4px solid var(--success); border-radius: 20px;"><div class="text-success fw-bold small text-uppercase mb-2">เสร็จสิ้น</div><h2 class="fw-bold text-success mb-0">${tDone} <span class="fs-6 fw-normal opacity-75" style="color: var(--text-muted);">ราย</span></h2></div></div>
        `;
    }

    #renderColumn(elementId, visitList, shiftName) {
        const el = document.getElementById(elementId); if(!el) return;
        visitList.sort((a, b) => String(a.time || "00:00").localeCompare(String(b.time || "00:00")));

        if(visitList.length === 0) {
            el.innerHTML = `<div class="text-center p-4 border border-dashed rounded-4 h-100 d-flex flex-column align-items-center justify-content-center" style="background-color: var(--bg-body); border-color: var(--border-color) !important; color: var(--text-muted);"><i class="fa-solid fa-bed fa-3x mb-3" style="color: var(--border-color) !important;"></i><p class="mb-0 fw-bold" style="font-size:14px; font-family:'Prompt';">${shiftName} ยังไม่มีข้อมูลคิว</p></div>`;
            return;
        }

        let html = "";
        visitList.forEach(v => {
            let status = v.status || "รอตรวจ"; let bColor = "var(--info)"; let badgeClass = "badge-soft-info"; let opacityStyle = "";
            if(status.includes("กำลังฟอก")) { bColor = "var(--warning)"; badgeClass = "badge-soft-warning"; }
            if(status.includes("เสร็จสิ้น")) { bColor = "var(--success)"; badgeClass = "badge-soft-success"; opacityStyle = "opacity: 0.8;"; }
            
            const safeName = this.#escapeHTML(v.name);

            // 🚨 THE FIX: นำคลาส .visit-bed และ .bg-white ออก ใช้ Component ที่อิงกับ CSS Variables
            html += `
            <div class="visit-card shadow-sm mb-3 p-3 border card-hover-float" style="background-color: var(--bg-surface); border-color: var(--border-color) !important; border-left: 5px solid ${bColor} !important; ${opacityStyle}" onclick="App.pages.visits.manageVisit('${v.firebaseKey}')">
                <div class="d-flex justify-content-between align-items-start w-100 mb-2">
                    <div>
                        <span class="badge border shadow-sm px-3 py-2 rounded-pill" style="background-color: var(--bg-body); color: var(--text-dark); border-color: var(--border-color) !important; font-size: 12px;"><i class="fa-solid fa-bed me-1 text-primary"></i> เตียง ${this.#escapeHTML(v.bed || '-')}</span>
                        <span class="ms-2 fw-bold text-primary" style="font-size:13px;">⏰ ${v.time || '-'}</span>
                    </div>
                    <div class="text-end"><span class="badge ${badgeClass} shadow-sm rounded-pill px-2 py-1" style="font-size:11px; font-family:'Prompt';">${status}</span></div>
                </div>
                <div class="fw-bold mt-2 mb-1" style="font-size:15px; font-family:'Prompt'; color: var(--text-dark);">${safeName || 'ไม่ระบุชื่อ'}</div>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="fw-bold" style="font-size:12px; color: var(--text-muted);"><i class="fa-solid fa-id-card text-secondary me-1"></i> HN: ${this.#escapeHTML(v.hn || '-')}</div>
                    <div class="fw-bold" style="font-size:12px; color: var(--text-muted);"><i class="fa-solid fa-shield-heart text-success me-1"></i> ${this.#escapeHTML(v.right || '-')}</div>
                </div>
            </div>`;
        });
        el.innerHTML = html;
    }

    // ---------------------------------------------------------
    // ➕ Add New Visit (Modal Flow)
    // ---------------------------------------------------------
    async openAddVisitModal() {
        if(this.state.patientsList.length === 0) { Swal.fire('ฐานข้อมูลว่างเปล่า', 'ยังไม่มีรายชื่อผู้ป่วยในระบบ กรุณาลงทะเบียนผู้ป่วยก่อนครับ', 'warning'); return; }
        
        let optionsHtml = this.state.patientsList.map(p => `<option value="${p.hn} | ${this.#escapeHTML(p.name_th)}"></option>`).join('');
        const currentDate = this.state.selectedDate;

        let hourOptions = ''; for(let h=1; h<=24; h++) { let hr = String(h).padStart(2, '0'); hourOptions += `<option value="${hr}" ${hr==='08'?'selected':''}>${hr}</option>`; }
        let minuteOptions = ''; for(let m=0; m<=59; m++) { let min = String(m).padStart(2, '0'); minuteOptions += `<option value="${min}" ${min==='00'?'selected':''}>${min}</option>`; }

        Swal.fire({
            title: `<h4 class="fw-bold mb-0 text-primary" style="font-family:'Prompt';"><i class="fa-solid fa-bed-pulse me-2"></i> เปิดคิวฟอกไตใหม่</h4>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <button type="button" class="btn w-100 fw-bold shadow-sm mb-4 py-3" style="background-color: var(--bg-surface); color: var(--text-dark); border: 2px dashed var(--primary); border-radius:14px;" id="btn-visit-read-card" onclick="App.pages.visits.readCardForVisit()">
                        <i class="fa-solid fa-id-card me-2 text-primary"></i> เสียบบัตร ปชช. ดึงประวัติคนไข้
                    </button>
                    <label class="form-label fw-bold small" style="color: var(--text-muted);">เลือกผู้ป่วย (พิมพ์ค้นหาชื่อ หรือ HN)</label>
                    <input list="visit-pt-datalist" id="swal-v-patient" class="input-modern w-100 mb-3 shadow-sm" placeholder="พิมพ์ค้นหา หรือเสียบบัตร...">
                    <datalist id="visit-pt-datalist">${optionsHtml}</datalist>
                    
                    <div class="row g-3">
                        <div class="col-7">
                            <label class="form-label fw-bold small" style="color: var(--text-muted);">เวลานัดหมาย (ชม. : นาที)</label>
                            <div class="d-flex align-items-center gap-1">
                                <select id="swal-v-time-hour" class="form-select input-modern shadow-sm fw-bold text-primary text-center" style="cursor:pointer; height: 45px; padding-right:10px;">${hourOptions}</select>
                                <span class="fw-bold" style="color: var(--text-dark);">:</span>
                                <select id="swal-v-time-minute" class="form-select input-modern shadow-sm fw-bold text-primary text-center" style="cursor:pointer; height: 45px; padding-right:10px;">${minuteOptions}</select>
                                <span class="fw-bold ms-1 small" style="color: var(--text-muted);">น.</span>
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
                
                if(!ptVal || !hourVal || !minVal || !bedVal) { Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง'); return false; }
                
                let hn = ptVal.split(' | ')[0].trim(); 
                let ptObj = this.state.patientsList.find(p => p.hn === hn);
                if(!ptObj) { Swal.showValidationMessage('ไม่พบรหัส HN นี้ในระบบ'); return false; }
                
                const isDuplicate = this.state.allVisits.some(v => v.hn === ptObj.hn && v.date === currentDate);
                if(isDuplicate) { Swal.showValidationMessage(`🚫 ${ptObj.name_th} มีคิวของวันนี้อยู่แล้ว ไม่สามารถลงซ้ำได้`); return false; }

                return { 
                    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9), 
                    date: currentDate, hn: ptObj.hn, name: ptObj.name_th, 
                    right: ptObj.right || 'ไม่ระบุ', time: `${hourVal}:${minVal}`, bed: bedVal, status: "รอตรวจ" 
                };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                let newVisit = result.value; 
                Swal.fire({ title: 'กำลังจัดคิว (Atomic)...', didOpen: () => Swal.showLoading() });
                
                try {
                    await db.ref('patients_database_v2/visits').push(newVisit);
                    Swal.fire({ title: 'สำเร็จ', text: `ลงคิวเตียง ${newVisit.bed} ให้ ${newVisit.name} เรียบร้อย`, icon: 'success', timer: 1500, showConfirmButton: false });
                } catch (err) {
                    Swal.fire('Error', err.message, 'error');
                }
            }
        });
    }

    async readCardForVisit() {
        const btn = document.getElementById('btn-visit-read-card'); if(!btn) return;
        const originalHtml = btn.innerHTML; btn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> กำลังอ่านบัตร...`; btn.disabled = true;

        try {
            const response = await fetch('http://localhost:8000/read-card', { signal: AbortSignal.timeout(10000) });
            if (!response.ok) throw new Error("ไม่สามารถเชื่อมต่อ Local Agent ได้");
            const result = await response.json();
            
            if (result.error || result.status === "error") { Swal.showValidationMessage(result.error || 'กรุณาตรวจสอบการเสียบบัตรประชาชน'); btn.innerHTML = originalHtml; btn.disabled = false; return; }

            const data = result.data || result; const cid = data.cid || data.idcard || "";
            if(!cid) { Swal.showValidationMessage('ไม่พบเลขบัตรประชาชนบนชิปการ์ด'); btn.innerHTML = originalHtml; btn.disabled = false; return; }

            const cleanCid = cid.replace(/-/g, "");
            const foundPt = this.state.patientsList.find(p => (p.idcard || "").replace(/-/g, "") === cleanCid);

            if(foundPt) {
                const targetDate = this.state.selectedDate;
                const isDuplicate = this.state.allVisits.some(v => v.hn === foundPt.hn && v.date === targetDate);
                if (isDuplicate) { Swal.showValidationMessage(`🚫 [ล็อกระบบ] ${foundPt.name_th} มีชื่ออยู่ในคิวของวันนี้แล้ว ห้ามลงซ้ำ!`); btn.innerHTML = originalHtml; btn.disabled = false; return; }

                document.getElementById('swal-v-patient').value = `${foundPt.hn} | ${foundPt.name_th}`;
                btn.innerHTML = `<i class="fa-solid fa-check-circle me-2"></i> ดึงข้อมูลสำเร็จ`; btn.className = "btn btn-premium-success w-100 py-3 fw-bold mb-3 rounded-pill shadow-sm"; Swal.resetValidationMessage();
            } else {
                Swal.showValidationMessage(`ไม่พบประวัติ (เลข ปชช: ${cid}) กรุณาไปลงทะเบียนผู้ป่วยใหม่ก่อน`); btn.innerHTML = originalHtml; btn.disabled = false; 
            }
        } catch (err) { Swal.showValidationMessage('เปิดโปรแกรมอ่านบัตรไว้แล้วหรือไม่? (Agent Offline)'); btn.innerHTML = originalHtml; btn.disabled = false; }
    }

    #escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
}
const VisitsPage = new VisitsPageComponent();
window.VisitsPage = VisitsPage;