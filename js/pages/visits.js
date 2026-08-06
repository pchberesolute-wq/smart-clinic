// js/pages/visits.js
// 🚀 Enterprise Kanban Board Module: Native Framework Handshake & Context-Aware Delete (v62.0 THE PINNACLE)

class VisitsPageComponent {
    #bindEventsHandler;
    #handleSearchHandler;

    constructor() {
        this.state = {
            currentTab: 'active',
            allVisits: [],
            patientsList: [],
            selectedDate: '',
            isReadingCard: false,
            shiftSettings: {
                morning: { start: '06:00', end: '10:00' },
                afternoon: { start: '10:00', end: '14:00' },
                evening: { start: '14:00', end: '20:00' }
            }
        };
        
        this.firebaseListeners = [];
        this.autoUpdateInterval = null;
        this.liveTimerInterval = null; 
        this._isAutoChecking = false;
        
        this.#handleSearchHandler = this.#handleSearch.bind(this);
    }

    get html() {
        return `
            <style>
                .modern-date-picker { background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 50px; padding: 8px 20px; color: var(--text-dark); font-family: 'Prompt', sans-serif; font-weight: 700; font-size: 15px; outline: none; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
                .modern-date-picker:hover, .modern-date-picker:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
                .date-picker-wrapper { position: relative; display: flex; align-items: center; overflow: hidden; }
                .date-picker-input-hidden { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 10; }
                .date-picker-input-hidden::-webkit-calendar-picker-indicator { position: absolute; top: -10px; left: -10px; width: 150%; height: 150%; cursor: pointer; }
                .btn-settings-shift:hover { transform: rotate(45deg); transition: 0.3s ease; color: var(--primary) !important; }
                
                /* Kanban Board Layout */
                .kanban-board-container { display: flex; flex-wrap: nowrap; overflow-x: auto; padding-bottom: 10px; gap: 1.5rem; }
                .kanban-column { flex: 1; min-width: 320px; display: flex; flex-direction: column; background-color: var(--bg-surface); border-radius: 20px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); overflow: hidden; height: calc(100vh - 360px); min-height: 400px; transition: all 0.3s ease; }
                .kanban-column-header { padding: 16px; border-bottom: 1px solid var(--border-color); background-color: var(--bg-body); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
                .kanban-column-body { padding: 16px; flex-grow: 1; overflow-y: auto; background-color: var(--bg-surface); transition: background-color 0.2s; }
                
                /* 🚨 CSS สำหรับ Drag & Drop */
                .kanban-column-body.drag-over { background-color: #f1f5f9; box-shadow: inset 0 0 10px rgba(0,0,0,0.05); }
                .visit-card { transition: transform 0.2s, box-shadow 0.2s; cursor: grab; }
                .visit-card:active { cursor: grabbing; transform: scale(0.98); opacity: 0.8; }
                
                .kanban-column-body::-webkit-scrollbar { width: 6px; }
                .kanban-column-body::-webkit-scrollbar-track { background: transparent; }
                .kanban-column-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .kanban-column-body::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

                /* Spreadsheet-like Bulk Row Styles */
                .bulk-row { transition: all 0.2s; border-radius: 10px; background: var(--bg-surface); border: 1px solid var(--border-color); padding: 8px; position: relative; }
                .bulk-row:hover { border-color: #93c5fd; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.08); z-index: 5;}
                .bulk-row .form-control, .bulk-row .form-select { border-color: #e2e8f0; transition: all 0.2s; background: var(--bg-surface); }
                .bulk-row .form-control:focus, .bulk-row .form-select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
                
                .btn-add-dashed { border: 2px dashed #3b82f6 !important; color: #3b82f6 !important; background: transparent; transition: all 0.3s; font-family:'Prompt'; font-size:15px; }
                .btn-add-dashed:hover { background: rgba(59,130,246,0.05); }
                
                .queue-badge { background: linear-gradient(135deg, #1e293b, #334155); color: #fff; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                
                .shift-btn-active { background-color: #fff !important; box-shadow: 0 2px 5px rgba(0,0,0,0.15) !important; border: 1px solid #cbd5e1 !important; transform: scale(1.1); z-index: 10; }
                
                input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                input[type="number"] { -moz-appearance: textfield; }
                
                .custom-scroll-modal::-webkit-scrollbar { height: 8px; width: 6px; }
                .custom-scroll-modal::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll-modal::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            </style>

            <div class="page-header mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                    <h2 class="page-title text-primary"><i class="fa-solid fa-bed-pulse me-2"></i> คิวฟอกไตประจำวัน</h2>
                    <p class="mt-1 mb-0" id="visit-date-text" style="color: var(--text-muted);">กำลังโหลดข้อมูล...</p>
                </div>
                <div class="d-flex gap-2 flex-wrap align-items-center">
                    <div class="date-picker-wrapper bg-light p-1 rounded-pill border shadow-sm" style="border-color: var(--border-color) !important; padding: 6px 16px;">
                        <i class="fa-regular fa-calendar text-primary me-2 position-relative" style="z-index: 1; pointer-events: none;"></i>
                        <span id="visitDateVisual" class="fw-bold position-relative" style="color: var(--text-dark); font-size: 15px; font-family: 'Prompt'; z-index: 1; pointer-events: none; min-width: 85px; text-align: center;">--/--/----</span>
                        <input type="date" id="visitDateSelector" class="date-picker-input-hidden" aria-label="เลือกวันที่คิวฟอกไต" onclick="this.showPicker && this.showPicker()">
                        <button type="button" class="btn btn-primary rounded-pill px-3 py-1 fw-bold shadow-sm ms-2 position-relative" style="font-size:14px; z-index: 20; height: 32px;" onclick="App.pages.visits.setToday()" title="กลับมาวันที่ปัจจุบัน">วันนี้</button>
                    </div>

                    <div class="dropdown">
                        <button class="btn btn-premium btn-premium-primary px-4 shadow-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fa-solid fa-layer-group me-1"></i> จัดการคิว
                        </button>
                        <ul class="dropdown-menu shadow-sm border-0" style="border-radius: 16px; overflow: hidden; font-family:'Prompt';">
                            <li><a class="dropdown-item py-2 fw-bold text-primary" href="#" onclick="App.pages.visits.openBulkAddModal()"><i class="fa-solid fa-users text-primary me-2"></i> เพิ่ม/แทรกหลายคิวพร้อมกัน</a></li>
                            <li><a class="dropdown-item py-2 fw-bold" href="#" onclick="App.pages.visits.openAddVisitModal()"><i class="fa-solid fa-user-plus text-success me-2"></i> แทรกคิวเดี่ยว (สแกนบัตร)</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item py-2 fw-bold text-danger" href="#" onclick="App.pages.visits.openBulkDeleteModal()"><i class="fa-solid fa-trash-can text-danger me-2"></i> ลบคิวหลายรายการ</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="row g-4 mb-4" id="visit-stats-container" aria-live="polite"></div>

            <div class="modern-panel mb-4 shadow-sm p-4" style="border-radius: 20px; background-color: var(--bg-surface); border: 1px solid var(--border-color);">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <ul class="nav nav-pills" role="tablist">
                        <li class="nav-item me-2" role="presentation">
                            <button type="button" id="tab-active" class="btn btn-premium-primary rounded-pill fw-bold px-4 shadow-sm" role="tab" aria-selected="true" onclick="App.pages.visits.switchTab('active')">
                                <i class="fa-solid fa-user-clock me-1"></i> คิวฟอกปัจจุบัน
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button type="button" id="tab-completed" class="btn rounded-pill fw-bold px-4 border shadow-sm" style="background-color: var(--bg-body); color: var(--text-muted); border-color: var(--border-color) !important;" role="tab" aria-selected="false" onclick="App.pages.visits.switchTab('completed')">
                                <i class="fa-solid fa-check-circle me-1"></i> ประวัติฟอกเสร็จ/ขาดนัด
                            </button>
                        </li>
                    </ul>

                    <div class="search-box-modern shadow-sm" style="width: 280px; padding: 10px 20px; border-radius: 50px; background-color: var(--bg-surface); border: 1px solid var(--border-color);">
                        <i class="fa-solid fa-search text-primary" aria-hidden="true"></i>
                        <input type="text" id="visitSearch" class="border-0 bg-transparent fw-bold ms-2 w-100" placeholder="ค้นหาชื่อ, HN, เตียง..." style="outline:none; color: var(--text-dark);" aria-label="ค้นหาคิวฟอกไต">
                    </div>
                </div>
            </div>

            <div class="kanban-board-container w-100">
                <div class="kanban-column" style="border-top: 4px solid var(--info);">
                    <div class="kanban-column-header">
                        <h6 class="fw-bold mb-0 text-info" style="font-family:'Prompt';"><i class="fa-regular fa-sun me-2"></i> <span id="header-morning-text">รอบเช้า (06:00 - 10:00)</span></h6>
                        <div>
                            <button class="btn btn-sm btn-outline-danger border-0 p-1 ms-1 fw-bold" style="font-size:11px;" onclick="App.pages.visits.cutShift('morning')" title="ปิดรอบเช้า"><i class="fa-solid fa-scissors"></i> ตัดรอบ</button>
                            <button class="btn btn-sm btn-light border-0 p-1 text-muted btn-settings-shift bg-transparent" onclick="App.pages.visits.openShiftSettings()" title="ตั้งค่าเวลา"><i class="fa-solid fa-gear fa-lg"></i></button>
                        </div>
                    </div>
                    <div class="kanban-column-body" id="board-morning" role="region" aria-label="คิวฟอกไตประจำวัน รอบเช้า" ondragover="window.VisitsPage_dragOver(event)" ondragleave="window.VisitsPage_dragLeave(event)" ondrop="window.VisitsPage_drop(event, 'morning')">
                        <div class="text-center py-5" style="color: var(--text-muted);"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
                    </div>
                </div>
                
                <div class="kanban-column" style="border-top: 4px solid var(--warning);">
                    <div class="kanban-column-header">
                        <h6 class="fw-bold mb-0" style="color: var(--warning); font-family:'Prompt';"><i class="fa-solid fa-cloud-sun me-2"></i> <span id="header-afternoon-text">รอบบ่าย (10:00 - 14:00)</span></h6>
                        <div>
                            <button class="btn btn-sm btn-outline-danger border-0 p-1 ms-1 fw-bold" style="font-size:11px;" onclick="App.pages.visits.cutShift('afternoon')" title="ปิดรอบบ่าย"><i class="fa-solid fa-scissors"></i> ตัดรอบ</button>
                            <button class="btn btn-sm btn-light border-0 p-1 text-muted btn-settings-shift bg-transparent" onclick="App.pages.visits.openShiftSettings()" title="ตั้งค่าเวลา"><i class="fa-solid fa-gear fa-lg"></i></button>
                        </div>
                    </div>
                    <div class="kanban-column-body" id="board-afternoon" role="region" aria-label="คิวฟอกไตประจำวัน รอบบ่าย" ondragover="window.VisitsPage_dragOver(event)" ondragleave="window.VisitsPage_dragLeave(event)" ondrop="window.VisitsPage_drop(event, 'afternoon')"></div>
                </div>
                
                <div class="kanban-column" style="border-top: 4px solid #94a3b8;">
                    <div class="kanban-column-header">
                        <h6 class="fw-bold mb-0" style="color: #94a3b8; font-family:'Prompt';"><i class="fa-solid fa-moon me-2"></i> <span id="header-evening-text">รอบเย็น (14:00 เป็นต้นไป)</span></h6>
                        <div>
                            <button class="btn btn-sm btn-outline-danger border-0 p-1 ms-1 fw-bold" style="font-size:11px;" onclick="App.pages.visits.cutShift('evening')" title="ปิดรอบเย็น"><i class="fa-solid fa-scissors"></i> ตัดรอบ</button>
                            <button class="btn btn-sm btn-light border-0 p-1 text-muted btn-settings-shift bg-transparent" onclick="App.pages.visits.openShiftSettings()" title="ตั้งค่าเวลา"><i class="fa-solid fa-gear fa-lg"></i></button>
                        </div>
                    </div>
                    <div class="kanban-column-body" id="board-evening" role="region" aria-label="คิวฟอกไตประจำวัน รอบเย็น" ondragover="window.VisitsPage_dragOver(event)" ondragleave="window.VisitsPage_dragLeave(event)" ondrop="window.VisitsPage_drop(event, 'evening')"></div>
                </div>
            </div>
        `;
    }

    init() {
        if (typeof db === 'undefined' || typeof firebase === 'undefined') return;
        
        this.#initDragAndDropLogic();
        this.#bindEvents();
        if (firebase.auth().currentUser) { this.#executeLoad(); } 
        else { const unsub = firebase.auth().onAuthStateChanged((user) => { if (user) { unsub(); this.#executeLoad(); } }); }
    }

    destroy() {
        this.firebaseListeners.forEach(l => { db.ref(l.path).off('value', l.callback); });
        this.firebaseListeners = [];
        if (this.autoUpdateInterval) { clearInterval(this.autoUpdateInterval); this.autoUpdateInterval = null; }
        if (this.liveTimerInterval) { clearInterval(this.liveTimerInterval); this.liveTimerInterval = null; }
        const searchInp = document.getElementById('visitSearch');
        if (searchInp) { searchInp.removeEventListener('input', this.#handleSearchHandler); }
        
        delete window.VisitsPage_dragStart;
        delete window.VisitsPage_dragOver;
        delete window.VisitsPage_dragLeave;
        delete window.VisitsPage_drop;
    }

    #initDragAndDropLogic() {
        window.VisitsPage_dragStart = (event, firebaseKey) => {
            const card = event.target.closest('.visit-card');
            if(card && card.innerText.includes('เสร็จสิ้น')) {
                event.preventDefault(); return;
            }
            event.dataTransfer.setData('text/plain', firebaseKey);
            event.dataTransfer.effectAllowed = 'move';
            setTimeout(() => { event.target.style.opacity = '0.5'; }, 0);
        };

        window.VisitsPage_dragOver = (event) => {
            event.preventDefault(); 
            event.dataTransfer.dropEffect = 'move';
            const column = event.target.closest('.kanban-column-body');
            if (column && !column.classList.contains('drag-over')) {
                column.classList.add('drag-over');
            }
        };

        window.VisitsPage_dragLeave = (event) => {
            const column = event.target.closest('.kanban-column-body');
            if (column) {
                column.classList.remove('drag-over');
            }
        };

        window.VisitsPage_drop = (event, targetShiftKey) => {
            event.preventDefault();
            const column = event.target.closest('.kanban-column-body');
            if (column) column.classList.remove('drag-over');

            const firebaseKey = event.dataTransfer.getData('text/plain');
            if (!firebaseKey) return;

            const draggedEl = document.querySelector(`.visit-card[draggable="true"]`);
            if (draggedEl) draggedEl.style.opacity = '1';

            const visit = this.state.allVisits.find(v => v.firebaseKey === firebaseKey);
            if(!visit) return;

            const s = this.state.shiftSettings[targetShiftKey];
            const newTime = s.start; 

            if(visit.time === newTime) return;

            Swal.fire({ title: 'กำลังย้ายคิว...', toast: true, position: 'top-end', showConfirmButton: false, timer: 1000, timerProgressBar: true });
            
            db.ref(`patients_database_v2/visits/${firebaseKey}`).update({
                time: newTime,
                last_status_updated_at: new Date().toISOString()
            }).catch(err => {
                Swal.fire('Error', 'ไม่สามารถย้ายคิวได้: ' + err.message, 'error');
            });
        };
    }

    #bindEvents() {
        const dateInput = document.getElementById('visitDateSelector');
        if (dateInput) {
            dateInput.addEventListener('change', (e) => { 
                this.state.selectedDate = e.target.value;
                this.#updateDateDisplay(this.state.selectedDate);
                this.#loadVisitsData(); 
            });
        }
        const searchInp = document.getElementById('visitSearch');
        if (searchInp) searchInp.addEventListener('input', this.#handleSearchHandler);
    }

    #handleSearch(e) {
        const term = e.target.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.visit-card');
        cards.forEach(card => {
            const isVisible = card.innerText.toLowerCase().includes(term);
            card.style.display = isVisible ? 'block' : 'none';
        });
    }

    #executeLoad() {
        const refPt = db.ref('patients_database_v2/patients');
        const cbPt = refPt.on('value', snap => {
            const data = snap.val() || {};
            this.state.patientsList = Object.keys(data).map(k => ({ firebaseKey: k, ...data[k] })).filter(p => p !== null && typeof p === 'object');
        });
        this.firebaseListeners.push({ path: 'patients_database_v2/patients', callback: cbPt });

        const refShifts = db.ref('clinic_settings_v2/shifts');
        const cbShifts = refShifts.on('value', snap => {
            if (snap.exists()) this.state.shiftSettings = { ...this.state.shiftSettings, ...snap.val() };
            this.updateShiftHeaders();
            this.#loadVisitsData(); 
        });
        this.firebaseListeners.push({ path: 'clinic_settings_v2/shifts', callback: cbShifts });

        this.setToday(); 
        
        if (this.autoUpdateInterval) clearInterval(this.autoUpdateInterval);
        this.autoUpdateInterval = setInterval(() => { this.#runAutoStatusEngine(); }, 10000);

        if (this.liveTimerInterval) clearInterval(this.liveTimerInterval);
        this.liveTimerInterval = setInterval(() => { this.#updateLiveTimers(); }, 1000);
    }

    updateShiftHeaders() {
        const s = this.state.shiftSettings;
        const m = document.getElementById('header-morning-text');
        const a = document.getElementById('header-afternoon-text');
        const e = document.getElementById('header-evening-text');
        if (m) m.innerText = `รอบเช้า (${s.morning.start} - ${s.morning.end})`;
        if (a) a.innerText = `รอบบ่าย (${s.afternoon.start} - ${s.afternoon.end})`;
        if (e) e.innerText = `รอบเย็น (${s.evening.start} เป็นต้นไป)`;
    }

    cutShift(shiftKey) {
        if (!this.state.allVisits || this.state.allVisits.length === 0) {
            Swal.fire('กระดานว่างเปล่า', 'ไม่มีคิวให้ตัดรอบในวันนี้ครับ', 'info'); return;
        }

        const timeToMins = (t) => {
            if (!t) return 0;
            const [h, m] = t.split(':');
            return parseInt(h, 10) * 60 + parseInt(m || 0, 10);
        };

        const s = this.state.shiftSettings;
        let startMins, endMins, shiftNameTh;

        if (shiftKey === 'morning') { 
            startMins = 0; endMins = timeToMins(s.morning.end); shiftNameTh = 'รอบเช้า'; 
        } else if (shiftKey === 'afternoon') { 
            startMins = timeToMins(s.morning.end); endMins = timeToMins(s.afternoon.end); shiftNameTh = 'รอบบ่าย'; 
        } else { 
            startMins = timeToMins(s.afternoon.end); endMins = 1440; shiftNameTh = 'รอบเย็น'; 
        }

        const targetVisits = this.state.allVisits.filter(v => {
            const vMins = timeToMins(v.time || "00:00");
            return vMins >= startMins && vMins < endMins && (v.status || 'รอตรวจ') === 'รอตรวจ';
        });

        if (targetVisits.length === 0) {
            Swal.fire('ไม่มีคิวค้าง', `ไม่มีคิวที่ <b>"รอตรวจ"</b> ค้างอยู่ใน${shiftNameTh}ให้ตัดรอบครับ<br><span class="small text-muted">(ฟอกเสร็จหมดแล้ว หรือยังไม่มีคิวเข้า)</span>`, 'info');
            return;
        }

        Swal.fire({
            title: `<h4 class="fw-bold mb-0 text-danger" style="font-family:'Prompt';"><i class="fa-solid fa-scissors me-2"></i> ตัด${shiftNameTh}?</h4>`,
            html: `
                <div class="text-start mt-2" style="font-family:'Sarabun';">
                    พบคนไข้ <b>${targetVisits.length}</b> ราย ที่เลยเวลานัดและยังไม่ได้ฟอกไตใน${shiftNameTh}<br>
                    ระบบจะเคลียร์กระดานโดยการเปลี่ยนสถานะเป็น <b class="text-danger">"🔴 ขาดนัด"</b> ทั้งหมด
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: '<i class="fa-solid fa-check me-1"></i> ยืนยันตัดรอบ',
            cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'premium-alert' }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'กำลังตัดรอบ (Atomic Sync)...', didOpen: () => Swal.showLoading() });
                const updates = {};
                targetVisits.forEach(v => {
                    updates[`patients_database_v2/visits/${v.firebaseKey}/status`] = "ขาดนัด";
                    updates[`patients_database_v2/visits/${v.firebaseKey}/last_status_updated_at`] = new Date().toISOString();
                });
                db.ref().update(updates).then(() => {
                    Swal.fire('ตัดรอบสำเร็จ', `เคลียร์คิวค้าง${shiftNameTh}เรียบร้อย โยกไปประวัติขาดนัดแล้ว`, 'success');
                }).catch(err => {
                    Swal.fire('Error', err.message, 'error');
                });
            }
        });
    }

    openBulkAddModal() {
        let optionsHtml = '';
        if (this.state.patientsList.length > 0) {
            optionsHtml = this.state.patientsList.map(p => `<option value="${this.#escapeHTML(p.hn)} | ${this.#escapeHTML(p.name_th)}"></option>`).join('');
        }

        let hourOptions = ''; for (let h = 0; h <= 23; h++) { const hr = String(h).padStart(2, '0'); hourOptions += `<option value="${hr}" ${hr === '06' ? 'selected' : ''}>${hr}</option>`; }
        let minuteOptions = ''; for (let m = 0; m <= 59; m++) { const min = String(m).padStart(2, '0'); minuteOptions += `<option value="${min}" ${min === '00' ? 'selected' : ''}>${min}</option>`; }
        
        const currentDate = this.state.selectedDate;

        window.VisitsPage_syncGlobalTime = () => {
            const gDur = document.getElementById('global-bulk-duration').value;
            document.querySelectorAll('.bulk-duration').forEach(el => el.value = gDur);
        };

        window.VisitsPage_updateRowNumbers = () => {
            const rows = document.querySelectorAll('.bulk-row');
            rows.forEach((el, idx) => {
                el.querySelector('.bulk-row-number').innerText = (idx + 1) + '.';
            });
            if(rows.length > 0) {
                const mInput = document.getElementById('split-m');
                const aInput = document.getElementById('split-a');
                const eInput = document.getElementById('split-e');
                if(mInput && (!mInput.value || mInput.dataset.auto === 'true')) {
                    const mCount = Math.ceil(rows.length / 3);
                    const aCount = Math.ceil((rows.length - mCount) / 2);
                    mInput.value = mCount;
                    aInput.value = aCount;
                    eInput.value = rows.length - mCount - aCount;
                    mInput.dataset.auto = 'true'; 
                }
            }
        };

        window.VisitsPage_onSplitInputChange = (el) => {
            el.dataset.auto = 'false';
        };

        window.VisitsPage_setRowShift = (btn, shiftKey) => {
            const row = btn.closest('.bulk-row');
            const s = App.pages.visits.state.shiftSettings[shiftKey];
            const [h, m] = s.start.split(':');
            row.querySelector('.bulk-hour').value = h;
            row.querySelector('.bulk-minute').value = m;
            
            row.querySelectorAll('.shift-btn').forEach(b => {
                b.classList.remove('shift-btn-active', 'border-primary');
                b.style.opacity = '0.4';
            });
            btn.classList.add('shift-btn-active', 'border-primary');
            btn.style.opacity = '1';
        };

        window.VisitsPage_autoSplitShifts = (silent = false) => {
            const rows = Array.from(document.querySelectorAll('.bulk-row'));
            if (rows.length === 0) return;
            
            let mCount = parseInt(document.getElementById('split-m').value) || 0;
            let aCount = parseInt(document.getElementById('split-a').value) || 0;
            let eCount = parseInt(document.getElementById('split-e').value) || 0;
            
            if (mCount === 0 && aCount === 0 && eCount === 0) {
                mCount = Math.ceil(rows.length / 3);
                aCount = Math.ceil((rows.length - mCount) / 2);
                eCount = rows.length - mCount - aCount;
                
                document.getElementById('split-m').value = mCount;
                document.getElementById('split-a').value = aCount;
                document.getElementById('split-e').value = eCount;
            }

            rows.forEach((row, index) => {
                let shiftKey = 'evening'; 
                if (index < mCount) {
                    shiftKey = 'morning';
                } else if (index < mCount + aCount) {
                    shiftKey = 'afternoon';
                }
                const btn = row.querySelector(`.shift-btn-${shiftKey}`);
                if (btn) window.VisitsPage_setRowShift(btn, shiftKey);
            });

            if (!silent) {
                const statusEl = document.getElementById('bulk-scan-status');
                if(statusEl) {
                    statusEl.innerHTML = `<span class="text-success fade-in-up fw-bold" style="font-size: 14px;"><i class="fa-solid fa-check-circle me-1"></i> จัดกะเรียบร้อย! (เช้า ${mCount}, บ่าย ${aCount}, เย็น ${rows.length - mCount - aCount})</span>`;
                    setTimeout(() => { if(statusEl.innerHTML.includes('จัดกะเรียบร้อย')) statusEl.innerHTML = ''; }, 3000);
                }
            }
        };

        window.VisitsPage_setAllShifts = (shiftKey) => {
            document.querySelectorAll(`.shift-btn-${shiftKey}`).forEach(btn => {
                window.VisitsPage_setRowShift(btn, shiftKey);
            });
        };

        window.VisitsPage_generateBulkRow = (patientVal = '') => {
            const rowId = 'bulk_row_' + Date.now() + Math.floor(Math.random() * 1000);
            const gDur = document.getElementById('global-bulk-duration') ? document.getElementById('global-bulk-duration').value : '4';
            const [defH, defM] = App.pages.visits.state.shiftSettings.morning.start.split(':');

            return `
            <div class="d-flex align-items-center gap-2 mb-2 bulk-row" id="${rowId}" style="animation: fadeInUpLocal 0.2s ease;">
                <div class="bulk-row-number fw-bold text-muted text-end" style="width: 25px; font-size: 13px; flex-shrink: 0;"></div>
                
                <div class="flex-grow-1" style="min-width: 250px;">
                    <input list="visit-pt-datalist-bulk" class="form-control fw-bold bulk-patient text-dark shadow-sm" style="border-radius: 10px;" placeholder="พิมพ์ HN หรือชื่อคนไข้..." autocomplete="off" value="${patientVal}">
                </div>
                
                <div style="width: 70px; flex-shrink: 0;">
                    <input type="text" class="form-control fw-bold text-center bulk-bed shadow-sm text-secondary" style="border-radius: 10px; padding: 4px;" placeholder="เตียง" autocomplete="off">
                </div>
                
                <div class="d-flex gap-1 bg-light p-1 rounded-3 border" style="width: 105px; justify-content: space-between; flex-shrink: 0;">
                    <button type="button" class="btn btn-sm btn-light border-0 px-2 py-1 shift-btn shift-btn-morning shift-btn-active border-primary" style="opacity:1; transition:0.2s;" onclick="window.VisitsPage_setRowShift(this, 'morning')" title="รอบเช้า"><i class="fa-regular fa-sun text-warning"></i></button>
                    <button type="button" class="btn btn-sm btn-light border-0 px-2 py-1 shift-btn shift-btn-afternoon" style="opacity:0.4; transition:0.2s;" onclick="window.VisitsPage_setRowShift(this, 'afternoon')" title="รอบบ่าย"><i class="fa-solid fa-cloud-sun text-warning"></i></button>
                    <button type="button" class="btn btn-sm btn-light border-0 px-2 py-1 shift-btn shift-btn-evening" style="opacity:0.4; transition:0.2s;" onclick="window.VisitsPage_setRowShift(this, 'evening')" title="รอบเย็น"><i class="fa-solid fa-moon text-secondary"></i></button>
                </div>

                <div class="d-flex gap-1" style="width: 110px; flex-shrink: 0;">
                    <select class="form-select form-select-sm fw-bold text-center bulk-hour shadow-sm text-dark px-0" style="border-radius: 8px;">${hourOptions.replace(`value="${defH}"`, `value="${defH}" selected`)}</select>
                    <select class="form-select form-select-sm fw-bold text-center bulk-minute shadow-sm text-dark px-0" style="border-radius: 8px;">${minuteOptions.replace(`value="${defM}"`, `value="${defM}" selected`)}</select>
                </div>
                
                <div style="width: 85px; flex-shrink: 0;">
                    <select class="form-select form-select-sm fw-bold text-center bulk-duration shadow-sm text-primary px-1" style="border-radius: 8px;">
                        <option value="2" ${gDur === '2' ? 'selected' : ''}>2 ชม.</option>
                        <option value="3" ${gDur === '3' ? 'selected' : ''}>3 ชม.</option>
                        <option value="3.5" ${gDur === '3.5' ? 'selected' : ''}>3.5 ชม.</option>
                        <option value="4" ${gDur === '4' ? 'selected' : ''}>4 ชม.</option>
                        <option value="4.5" ${gDur === '4.5' ? 'selected' : ''}>4.5 ชม.</option>
                        <option value="5" ${gDur === '5' ? 'selected' : ''}>5 ชม.</option>
                    </select>
                </div>
                
                <button type="button" class="btn btn-light text-danger shadow-sm border border-danger-subtle flex-shrink-0" style="width: 38px; height: 38px; border-radius: 10px; padding:0; background: #fff;" onclick="this.closest('.bulk-row').remove(); window.VisitsPage_updateRowNumbers();"><i class="fa-solid fa-times"></i></button>
            </div>`;
        };

        window.VisitsPage_addBulkRow = (patientVal = '') => {
            const container = document.getElementById('bulk-rows-container');
            if (container) {
                container.insertAdjacentHTML('beforeend', window.VisitsPage_generateBulkRow(patientVal));
                window.VisitsPage_updateRowNumbers(); 
                container.scrollTop = container.scrollHeight; 
            }
        };

        window.VisitsPage_scanCardForBulk = async () => {
            if (this.state.isReadingCard) return;
            this.state.isReadingCard = true;

            const btn = document.getElementById('btn-bulk-scan'); 
            const statusEl = document.getElementById('bulk-scan-status');
            const originalHtml = btn.innerHTML; 

            const showInlineAlert = (msg, isError = false) => {
                if(statusEl) {
                    statusEl.innerHTML = `<span class="${isError ? 'text-danger' : 'text-success'} fade-in-up" style="font-size: 14px;"><i class="fa-solid ${isError ? 'fa-triangle-exclamation' : 'fa-check-circle'} me-1"></i>${msg}</span>`;
                    setTimeout(() => { if(statusEl.innerHTML.includes(msg)) statusEl.innerHTML = ''; }, 4000);
                }
            };

            btn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> กำลังอ่านบัตร...`; 
            btn.disabled = true;

            try {
                const response = await fetch('http://localhost:8000/read-card', { signal: AbortSignal.timeout(8000) });
                if (!response.ok) throw new Error("Agent Offline");
                const result = await response.json();
                
                if (result.error || result.status === "error") { showInlineAlert(result.error || 'อ่านบัตรไม่สำเร็จ', true); return; }

                const data = result.data || result; 
                const cid = data.cid || data.idcard || "";
                if (!cid) { showInlineAlert('ไม่พบเลขบัตร ปชช. ในชิปการ์ด', true); return; }

                const cleanCid = cid.replace(/-/g, "");
                const ptObj = this.state.patientsList.find(p => String(p.idcard || "").replace(/-/g, "") === cleanCid);

                if (!ptObj) { showInlineAlert(`ไม่พบเลข ปชช: ${cid} ในฐานข้อมูล กรุณาลงทะเบียนก่อน`, true); return; }

                if (this.state.allVisits.some(v => String(v.hn).trim() === String(ptObj.hn).trim() && v.date === currentDate)) {
                    showInlineAlert(`คุณ ${ptObj.name_th} มีคิวในวันนี้อยู่แล้วในกระดานหลัก`, true); return; 
                }

                const formattedVal = `${ptObj.hn} | ${ptObj.name_th}`;

                const existingInputs = Array.from(document.querySelectorAll('.bulk-patient'));
                
                const isAlreadyInGrid = existingInputs.some(input => {
                    const gridHn = input.value.split(' | ')[0].trim();
                    return gridHn === String(ptObj.hn).trim();
                });

                if (isAlreadyInGrid) {
                    showInlineAlert(`มีชื่อคุณ ${ptObj.name_th} ในตารางด้านล่างแล้ว`, true); return; 
                }

                let targetInput = existingInputs.find(input => input.value.trim() === '');
                if (!targetInput) {
                    window.VisitsPage_addBulkRow();
                    const newInputs = Array.from(document.querySelectorAll('.bulk-patient'));
                    targetInput = newInputs[newInputs.length - 1];
                }

                targetInput.value = formattedVal;
                
                const targetRow = targetInput.closest('.bulk-row');
                targetRow.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.3)';
                targetRow.style.borderColor = '#10b981';
                setTimeout(() => { targetRow.style.boxShadow = ''; targetRow.style.borderColor = '#e2e8f0'; }, 1500);

                showInlineAlert(`ดึงชื่อ ${ptObj.name_th} สำเร็จ!`, false);

            } catch (err) { 
                console.error("Card Reader Error:", err);
                showInlineAlert('โปรแกรมอ่านบัตร (Local Agent) ไม่ตอบสนอง', true); 
            } finally {
                if (btn) { btn.innerHTML = originalHtml; btn.disabled = false; }
                this.state.isReadingCard = false;
            }
        };

        window.VisitsPage_togglePasteArea = () => {
            const el = document.getElementById('smart-paste-container');
            el.style.display = el.style.display === 'none' ? 'block' : 'none';
        };

        window.VisitsPage_processPastedData = () => {
            const text = document.getElementById('smart-paste-input').value;
            const statusEl = document.getElementById('bulk-scan-status');

            const showInlineAlert = (msg, isError = false) => {
                if(statusEl) {
                    statusEl.innerHTML = `<span class="${isError ? 'text-danger' : 'text-success'} fade-in-up fw-bold" style="font-size: 14px;">${msg}</span>`;
                }
            };

            if(!text || !text.trim()) {
                showInlineAlert('<i class="fa-solid fa-triangle-exclamation me-1"></i> กรุณาวางข้อมูลลงในกล่องข้อความก่อนครับ', true);
                return;
            }

            showInlineAlert('<i class="fas fa-spinner fa-spin me-1"></i> กำลังวิเคราะห์ข้อมูลและจัดเรียงลำดับ...', false);

            try {
                const cleanForNumbers = text.replace(/[\/\|\-\.,:]/g, ' '); 
                const rawTokens = cleanForNumbers.match(/\d+/g) || [];
                const uniqueOrderedTokens = Array.from(new Set(rawTokens));

                let importedCount = 0;
                let existingInputs = Array.from(document.querySelectorAll('.bulk-patient'));

                uniqueOrderedTokens.forEach(token => {
                    const ptObj = App.pages.visits.state.patientsList.find(p => {
                        if (!p.hn) return false;
                        const cleanHn = String(p.hn).replace(/\D/g, '');
                        const intHn = parseInt(cleanHn, 10).toString(); 
                        return token === cleanHn || token === intHn;
                    });

                    if (ptObj) {
                        const isAlreadyInBoard = App.pages.visits.state.allVisits.some(v => String(v.hn).replace(/\D/g,'') === String(ptObj.hn).replace(/\D/g,'') && v.date === currentDate);
                        const isAlreadyInGrid = existingInputs.some(input => {
                            const gridHn = input.value.split(' | ')[0].trim();
                            return gridHn === String(ptObj.hn).trim();
                        });

                        if (!isAlreadyInBoard && !isAlreadyInGrid) {
                            const formattedVal = `${ptObj.hn} | ${ptObj.name_th}`;
                            
                            let targetInput = existingInputs.find(input => input.value.trim() === '');
                            if (!targetInput) {
                                window.VisitsPage_addBulkRow(formattedVal);
                                existingInputs = Array.from(document.querySelectorAll('.bulk-patient')); 
                            } else {
                                targetInput.value = formattedVal;
                            }
                            importedCount++;
                        }
                    }
                });

                if (importedCount === 0) {
                    showInlineAlert(`<i class="fa-solid fa-triangle-exclamation me-1"></i> ไม่พบรหัส HN ในข้อมูลที่วาง ที่ตรงกับฐานข้อมูลเลย! (หรือลงคิวไปหมดแล้ว)`, true);
                } else {
                    showInlineAlert(`<i class="fa-solid fa-check-circle me-1"></i> ดึงรายชื่อเรียงตามลำดับสำเร็จ ${importedCount} คน! (ระบบกำลังแบ่งกะอัตโนมัติ...)`, false);
                    
                    window.VisitsPage_updateRowNumbers();
                    window.VisitsPage_autoSplitShifts(true); 

                    setTimeout(() => { if(statusEl) statusEl.innerHTML = ''; }, 4000);
                    document.getElementById('smart-paste-input').value = '';
                    window.VisitsPage_togglePasteArea();
                }

            } catch (err) {
                console.error("Paste Parse Error:", err);
                showInlineAlert(`<i class="fa-solid fa-triangle-exclamation me-1"></i> เกิดข้อผิดพลาด: ${err.message}`, true);
            }
        };

        Swal.fire({
            title: `<h4 class="fw-bold mb-0 text-primary" style="font-family:'Prompt';"><i class="fa-solid fa-users me-2"></i> เพิ่ม/แทรกหลายคิวพร้อมกัน</h4>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun'; overflow-x: hidden;">
                    
                    <div class="d-flex gap-2 mb-3">
                        <button type="button" class="btn btn-premium-success flex-grow-1 rounded-pill fw-bold py-3 shadow-sm" id="btn-bulk-scan" onclick="window.VisitsPage_scanCardForBulk()">
                            <i class="fa-solid fa-id-card me-2 fa-lg"></i> เสียบบัตร ปชช.
                        </button>
                        <button type="button" class="btn text-white flex-grow-1 rounded-pill fw-bold py-3 shadow-sm" style="background: linear-gradient(135deg, #8b5cf6, #6366f1);" onclick="window.VisitsPage_togglePasteArea()">
                            <i class="fa-solid fa-paste me-2 fa-lg"></i> วางข้อมูล (Excel/Text)
                        </button>
                    </div>

                    <div id="smart-paste-container" class="mb-3 p-3 rounded-4 shadow-sm border" style="display: none; background-color: #f8fafc; border-color: #e2e8f0 !important; animation: fadeIn 0.3s ease;">
                        <label class="form-label small fw-bold text-primary"><i class="fa-solid fa-circle-info me-1"></i> คัดลอกตารางจาก Excel หรือ HosXP มาวางที่นี่ได้เลยครับ (ระบบจะเรียงลำดับตามที่วางเป๊ะๆ)</label>
                        <textarea id="smart-paste-input" class="form-control shadow-inner mb-2" rows="4" placeholder="คลิกขวา -> Paste (หรือกด Ctrl+V) ข้อมูลที่นี่..." style="border-radius: 12px; resize: none; font-size:13px;"></textarea>
                        <button type="button" class="btn btn-primary w-100 rounded-pill fw-bold py-2 shadow-sm" onclick="window.VisitsPage_processPastedData()">
                            <i class="fa-solid fa-wand-magic-sparkles me-2"></i> สกัดรายชื่ออัตโนมัติ
                        </button>
                    </div>

                    <div id="bulk-scan-status" class="text-center fw-bold mb-3" style="min-height: 20px;"></div>

                    <datalist id="visit-pt-datalist-bulk">${optionsHtml}</datalist>

                    <div class="p-2 rounded-4 mb-3 border shadow-sm d-flex flex-column gap-2" style="background-color: #eff6ff; border-color: #bfdbfe !important;">
                        
                        <div class="d-flex justify-content-between align-items-center w-100">
                            <div class="fw-bold ms-2" style="color: #1e40af; font-size:14px;"><i class="fa-solid fa-calendar-day me-1"></i> <span class="text-dark">${new Date(currentDate).toLocaleDateString('th-TH')}</span></div>
                            <div class="d-flex align-items-center gap-1 bg-white p-1 rounded-pill shadow-sm border border-light">
                                <span class="small fw-bold text-secondary ms-2 border-start ps-2">เวลารวมทั้งหมด:</span>
                                <select id="global-bulk-duration" class="form-select form-select-sm border-0 fw-bold text-primary text-center px-2" style="width: 85px; cursor:pointer; box-shadow:none; font-size:14px;" onchange="window.VisitsPage_syncGlobalTime()">
                                    <option value="2">2 ชม.</option>
                                    <option value="3">3 ชม.</option>
                                    <option value="3.5">3.5 ชม.</option>
                                    <option value="4" selected>4 ชม.</option>
                                    <option value="4.5">4.5 ชม.</option>
                                    <option value="5">5 ชม.</option>
                                </select>
                            </div>
                        </div>

                        <div class="d-flex align-items-center gap-1 bg-white p-1 rounded-pill shadow-sm border border-light flex-wrap w-100">
                            <span class="small fw-bold text-primary ms-2"><i class="fa-solid fa-wand-magic-sparkles"></i> แบ่งกะ:</span>
                            <input type="number" id="split-m" data-auto="true" onchange="window.VisitsPage_onSplitInputChange(this)" class="form-control form-control-sm border-0 text-center fw-bold px-2 text-warning" style="width:60px; background:#fffbf1; border-radius:8px;" placeholder="เช้า" title="จำนวนกะเช้า">
                            <input type="number" id="split-a" data-auto="true" onchange="window.VisitsPage_onSplitInputChange(this)" class="form-control form-control-sm border-0 text-center fw-bold px-2 text-warning" style="width:60px; background:#fffbf1; border-radius:8px;" placeholder="บ่าย" title="จำนวนกะบ่าย">
                            <input type="number" id="split-e" data-auto="true" onchange="window.VisitsPage_onSplitInputChange(this)" class="form-control form-control-sm border-0 text-center fw-bold px-2 text-secondary" style="width:60px; background:#f8fafc; border-radius:8px;" placeholder="เย็น" title="จำนวนกะเย็น">
                            
                            <button type="button" class="btn btn-sm btn-primary rounded-pill fw-bold px-3 ms-1 shadow-sm" onclick="window.VisitsPage_autoSplitShifts()">จัดคิว</button>
                            
                            <span class="ms-auto small fw-bold text-secondary border-start ps-2">บังคับ:</span>
                            <button type="button" class="btn btn-sm btn-light rounded-circle px-2 border ms-1" onclick="window.VisitsPage_setAllShifts('morning')" title="เช้าทั้งหมด"><i class="fa-regular fa-sun text-warning"></i></button>
                            <button type="button" class="btn btn-sm btn-light rounded-circle px-2 border" onclick="window.VisitsPage_setAllShifts('afternoon')" title="บ่ายทั้งหมด"><i class="fa-solid fa-cloud-sun text-warning"></i></button>
                            <button type="button" class="btn btn-sm btn-light rounded-circle px-2 border me-1" onclick="window.VisitsPage_setAllShifts('evening')" title="เย็นทั้งหมด"><i class="fa-solid fa-moon text-secondary"></i></button>
                        </div>
                    </div>

                    <div class="custom-scroll-modal p-1" style="max-height: 45vh; overflow-y: auto; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 12px; background: var(--bg-body);">
                        <div style="min-width: 800px;">
                            <div class="d-flex align-items-center gap-2 text-muted small fw-bold mb-2 px-1 mt-2">
                                <div style="width: 25px; text-align: center; flex-shrink: 0;">ลำดับ</div>
                                <div class="flex-grow-1" style="min-width: 250px;">รายชื่อผู้ป่วย (พิมพ์ค้นหา)</div>
                                <div style="width: 70px; text-align: center; flex-shrink: 0;">เตียง</div>
                                <div style="width: 105px; text-align: center; flex-shrink: 0;">กะ (จิ้มเปลี่ยน)</div>
                                <div style="width: 110px; text-align: center; flex-shrink: 0;">เวลาเริ่ม</div>
                                <div style="width: 85px; text-align: center; flex-shrink: 0;">เวลารวม</div>
                                <div style="width: 38px; flex-shrink: 0;"></div>
                            </div>

                            <div id="bulk-rows-container">
                                ${window.VisitsPage_generateBulkRow()}
                                ${window.VisitsPage_generateBulkRow()}
                                ${window.VisitsPage_generateBulkRow()}
                                ${window.VisitsPage_generateBulkRow()}
                                ${window.VisitsPage_generateBulkRow()}
                            </div>
                        </div>
                    </div>

                    <button type="button" class="btn btn-add-dashed fw-bold w-100 mt-3 rounded-pill shadow-sm py-2" onclick="window.VisitsPage_addBulkRow()">
                        <i class="fa-solid fa-plus me-1"></i> เพิ่มแถวคิว
                    </button>
                </div>
            `,
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-cloud-arrow-up me-1"></i> บันทึกทั้งหมด', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#10b981', width: 1200, customClass: { popup: 'premium-alert' },
            didOpen: () => { window.VisitsPage_updateRowNumbers(); }, 
            preConfirm: () => {
                const rows = document.querySelectorAll('.bulk-row');
                const bulkVisits = [];
                let hasError = false;

                rows.forEach(row => {
                    const ptVal = row.querySelector('.bulk-patient').value;
                    const hVal = row.querySelector('.bulk-hour').value;
                    const mVal = row.querySelector('.bulk-minute').value;
                    const bVal = row.querySelector('.bulk-bed').value.trim();
                    const dVal = row.querySelector('.bulk-duration').value; 

                    if (!ptVal && !bVal) return; 

                    if (!ptVal) { hasError = 'กรุณากรอกชื่อคนไข้ให้ครบถ้วนในแถวที่มีการพิมพ์ไว้'; return; }

                    const hn = ptVal.split(' | ')[0].trim();
                    const ptObj = this.state.patientsList.find(p => String(p.hn).trim() === hn);
                    
                    if (!ptObj) { hasError = `ไม่พบคนไข้รหัส ${hn} กรุณาเลือกจาก Dropdown`; return; }

                    if (this.state.allVisits.some(v => String(v.hn).trim() === String(ptObj.hn).trim() && v.date === currentDate)) {
                        hasError = `คุณ ${ptObj.name_th} มีคิวในวันนี้อยู่แล้ว`; return;
                    }

                    if (bulkVisits.some(v => String(v.hn).trim() === String(ptObj.hn).trim())) {
                        hasError = `คุณ ${ptObj.name_th} ถูกเลือกซ้ำกันในรายการ`; return;
                    }

                    bulkVisits.push({
                        id: 'VST_' + Date.now() + Math.floor(Math.random() * 10000),
                        date: currentDate,
                        hn: ptObj.hn,
                        name: ptObj.name_th,
                        right: ptObj.right || 'ไม่ระบุ',
                        time: `${hVal}:${mVal}`,
                        bed: bVal || '-', 
                        duration_hours: parseFloat(dVal), 
                        status: "รอตรวจ"
                    });
                });

                if (hasError) { Swal.showValidationMessage(hasError); return false; }
                if (bulkVisits.length === 0) { Swal.showValidationMessage('ยังไม่มีการกรอกข้อมูลคนไข้เลยครับ'); return false; }
                return bulkVisits;
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'กำลังจัดคิว (Atomic Multi-path)...', didOpen: () => Swal.showLoading() });
                try {
                    const updates = {};
                    result.value.forEach(visit => {
                        const newKey = db.ref().child('patients_database_v2/visits').push().key;
                        updates[`patients_database_v2/visits/${newKey}`] = visit;
                    });
                    
                    await db.ref().update(updates);
                    Swal.fire('สำเร็จ', `จัดคิวทั้งหมด ${result.value.length} รายการเรียบร้อย`, 'success');
                } catch (err) {
                    Swal.fire('Error', err.message, 'error');
                }
            }
        });
    }

    // 🚨 THE FIX: Context-Aware Bulk Delete (ลบประวัติฟอกเสร็จได้แล้ว พร้อมระบบเลือกทั้งหมด)
    openBulkDeleteModal() {
        const isCompletedTab = this.state.currentTab === 'completed';
        
        const targetVisits = this.state.allVisits.filter(v => {
            if (isCompletedTab) {
                return v.status === 'เสร็จสิ้น' || v.status === 'ขาดนัด';
            } else {
                return v.status !== 'เสร็จสิ้น' && v.status !== 'ขาดนัด';
            }
        });

        if (targetVisits.length === 0) {
            Swal.fire('ไม่มีข้อมูล', `ไม่มี${isCompletedTab ? 'ประวัติฟอกเสร็จ/ขาดนัด' : 'คิวที่กำลังรอตรวจ'}ให้ลบในหน้านี้ครับ`, 'info'); 
            return;
        }

        window.VisitsPage_toggleSelectAll = (masterCheckbox) => {
            const checkboxes = document.querySelectorAll('.bulk-delete-cb');
            checkboxes.forEach(cb => cb.checked = masterCheckbox.checked);
        };

        window.VisitsPage_syncMasterCheckbox = () => {
            const checkboxes = document.querySelectorAll('.bulk-delete-cb');
            const masterCheckbox = document.getElementById('master-delete-cb');
            if(masterCheckbox) {
                const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                masterCheckbox.checked = allChecked;
            }
        };

        let listHtml = targetVisits.map(v => `
            <label class="list-group-item d-flex align-items-center gap-3 py-3" style="cursor: pointer; transition: 0.2s;" onmouseover="this.style.backgroundColor='#f8fafc'" onmouseout="this.style.backgroundColor='transparent'">
                <input class="form-check-input flex-shrink-0 bulk-delete-cb shadow-sm" type="checkbox" value="${v.firebaseKey}" style="width: 22px; height: 22px; cursor: pointer;" onchange="window.VisitsPage_syncMasterCheckbox()">
                <div class="flex-grow-1 min-w-0">
                    <div class="fw-bold text-dark text-truncate" style="font-family:'Prompt'; font-size:15px;">${this.#escapeHTML(v.name)}</div>
                    <div class="small text-muted"><i class="fa-solid fa-bed me-1"></i>เตียง: ${v.bed} <span class="mx-2">|</span> <i class="fa-regular fa-clock ms-2 me-1"></i>${v.time} น. <span class="badge bg-secondary ms-2">${v.status}</span></div>
                </div>
            </label>
        `).join('');

        const modalTitle = isCompletedTab ? '<i class="fa-solid fa-trash-can me-2"></i> ลบประวัติฟอกเสร็จ/ขาดนัด' : '<i class="fa-solid fa-trash-can me-2"></i> ลบคิวหลายรายการ';
        const modalDesc = isCompletedTab ? 'เลือกประวัติที่ต้องการลบทิ้งถาวรจากระบบ' : 'เลือกคิวที่ต้องการยกเลิกการฟอกเลือดในวันนี้';
        const confirmBtnText = isCompletedTab ? '<i class="fa-solid fa-trash me-1"></i> ลบประวัติที่เลือก' : '<i class="fa-solid fa-trash me-1"></i> ลบคิวที่เลือก';

        Swal.fire({
            title: `<h4 class="fw-bold mb-0 text-danger" style="font-family:'Prompt';">${modalTitle}</h4>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <p class="small text-muted mb-3">${modalDesc}</p>
                    
                    <div class="d-flex align-items-center gap-3 p-3 mb-2 rounded-3 border" style="background-color: #fef2f2; border-color: #fecaca !important;">
                        <input class="form-check-input flex-shrink-0 shadow-sm" type="checkbox" id="master-delete-cb" style="width: 24px; height: 24px; cursor: pointer;" onchange="window.VisitsPage_toggleSelectAll(this)">
                        <label class="form-check-label fw-bold text-danger mb-0" for="master-delete-cb" style="cursor: pointer; font-family:'Prompt'; font-size:15px;">
                            เลือกทั้งหมด (${targetVisits.length} รายการ)
                        </label>
                    </div>

                    <div class="list-group shadow-sm border rounded-3" style="max-height: 45vh; overflow-y: auto;">
                        ${listHtml}
                    </div>
                </div>
            `,
            showCancelButton: true, confirmButtonText: confirmBtnText, cancelButtonText: 'ยกเลิก', confirmButtonColor: '#ef4444', width: 550, customClass: { popup: 'premium-alert' },
            preConfirm: () => {
                const checked = document.querySelectorAll('.bulk-delete-cb:checked');
                if (checked.length === 0) { Swal.showValidationMessage('กรุณาเลือกอย่างน้อย 1 รายการ'); return false; }
                return Array.from(checked).map(cb => cb.value);
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'กำลังลบข้อมูล (Atomic)...', didOpen: () => Swal.showLoading() });
                try {
                    const updates = {};
                    result.value.forEach(firebaseKey => { updates[`patients_database_v2/visits/${firebaseKey}`] = null; });
                    await db.ref().update(updates);
                    Swal.fire('ลบสำเร็จ', `ลบข้อมูลจำนวน ${result.value.length} รายการแล้ว`, 'success');
                } catch (err) {
                    Swal.fire('Error', err.message, 'error');
                }
            }
            delete window.VisitsPage_toggleSelectAll;
            delete window.VisitsPage_syncMasterCheckbox;
        });
    }

    openShiftSettings() {
        const s = this.state.shiftSettings;

        const buildTimeSelector = (idPrefix, defaultTime, textClass) => {
            const [defH, defM] = (defaultTime || "00:00").split(":");
            let hOpts = Array.from({length: 24}, (_, i) => { const v = String(i).padStart(2, '0'); return `<option value="${v}" ${v === defH ? 'selected' : ''}>${v}</option>`; }).join('');
            let mOpts = Array.from({length: 60}, (_, i) => { const v = String(i).padStart(2, '0'); return `<option value="${v}" ${v === defM ? 'selected' : ''}>${v}</option>`; }).join('');
            
            return `
                <div class="d-flex align-items-center bg-white border rounded-pill px-3 shadow-sm" style="border-color: var(--border-color) !important; cursor: pointer;">
                    <select id="${idPrefix}-h" class="form-select border-0 fw-bold ${textClass} p-2 text-center" style="background-color: transparent; box-shadow: none; cursor: pointer; appearance: none; padding-right: 0 !important; width: 45px; font-size: 16px;">${hOpts}</select>
                    <span class="fw-bold px-1" style="color: var(--text-muted); font-size: 18px;">:</span>
                    <select id="${idPrefix}-m" class="form-select border-0 fw-bold ${textClass} p-2 text-center" style="background-color: transparent; box-shadow: none; cursor: pointer; appearance: none; padding-right: 0 !important; width: 45px; font-size: 16px;">${mOpts}</select>
                    <i class="fa-regular fa-clock ms-2 ${textClass}" style="opacity: 0.7;"></i>
                </div>
            `;
        };

        Swal.fire({
            title: '<h5 class="fw-bold text-primary mb-0" style="font-family:\'Prompt\';"><i class="fa-solid fa-gear me-2"></i>ตั้งค่ารอบเวลาฟอกไต</h5>',
            html: `
                <div class="text-start mt-4" style="font-family:'Sarabun';">
                    <div class="p-3 rounded-4 border mb-3 shadow-sm d-flex flex-column gap-2" style="background: var(--bg-surface); border-color: var(--border-color) !important;">
                        <label class="form-label fw-bold text-info m-0"><i class="fa-regular fa-sun"></i> รอบเช้า</label>
                        <div class="d-flex align-items-center justify-content-between gap-2">
                            ${buildTimeSelector('s-m-start', s.morning.start, 'text-primary')}
                            <span class="text-muted fw-bold small">ถึง</span>
                            ${buildTimeSelector('s-m-end', s.morning.end, 'text-primary')}
                        </div>
                    </div>
                    
                    <div class="p-3 rounded-4 border mb-3 shadow-sm d-flex flex-column gap-2" style="background: var(--bg-surface); border-color: var(--border-color) !important;">
                        <label class="form-label fw-bold text-warning-dark m-0"><i class="fa-solid fa-cloud-sun"></i> รอบบ่าย</label>
                        <div class="d-flex align-items-center justify-content-between gap-2">
                            ${buildTimeSelector('s-a-start', s.afternoon.start, 'text-warning-dark')}
                            <span class="text-muted fw-bold small">ถึง</span>
                            ${buildTimeSelector('s-a-end', s.afternoon.end, 'text-warning-dark')}
                        </div>
                    </div>
                    
                    <div class="p-3 rounded-4 border mb-2 shadow-sm d-flex flex-column gap-2" style="background: var(--bg-surface); border-color: var(--border-color) !important;">
                        <label class="form-label fw-bold text-secondary m-0"><i class="fa-solid fa-moon"></i> รอบเย็น</label>
                        <div class="d-flex align-items-center gap-2">
                            ${buildTimeSelector('s-e-start', s.evening.start, 'text-secondary')}
                            <span class="text-muted fw-bold ms-2">เป็นต้นไป (ถึงเที่ยงคืน)</span>
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึก',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#2563eb',
            customClass: { popup: 'premium-alert' },
            preConfirm: () => {
                const getTime = (id) => document.getElementById(`${id}-h`).value + ':' + document.getElementById(`${id}-m`).value;
                return {
                    morning: { start: getTime('s-m-start'), end: getTime('s-m-end') },
                    afternoon: { start: getTime('s-a-start'), end: getTime('s-a-end') },
                    evening: { start: getTime('s-e-start'), end: '23:59' }
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                db.ref('clinic_settings_v2/shifts').set(result.value).then(() => {
                    Swal.fire({ title: 'บันทึกสำเร็จ', text: 'ระบบจัดเรียงคิวใหม่ตามเวลาที่ตั้งค่าแล้ว', icon: 'success', timer: 1500, showConfirmButton: false, customClass: { popup: 'premium-alert' } });
                });
            }
        });
    }

    #updateLiveTimers() {
        const timers = document.querySelectorAll('.live-dialysis-timer');
        if (timers.length === 0) return;
        const now = Date.now();
        
        timers.forEach(el => {
            const startStr = el.getAttribute('data-start-time');
            const targetMins = parseInt(el.getAttribute('data-target-mins'), 10) || 240; 
            
            if (!startStr) return;
            const start = new Date(startStr).getTime();
            
            const diffSecs = Math.floor((now - start) / 1000);
            if (diffSecs < 0) return; 
            
            const h = String(Math.floor(diffSecs / 3600)).padStart(2, '0');
            const m = String(Math.floor((diffSecs % 3600) / 60)).padStart(2, '0');
            const s = String(diffSecs % 60).padStart(2, '0');
            
            const colon = diffSecs % 2 === 0 ? ':' : '<span style="opacity:0.4">:</span>';
            
            el.innerHTML = `<i class="fa-solid fa-stopwatch me-1"></i> ${h}${colon}${m}${colon}${s}`;
            
            if (diffSecs >= (targetMins * 60)) {
                el.style.color = '#dc2626'; 
                el.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
                el.style.borderColor = '#fca5a5';
            }
        });
    }

    #loadVisitsData() {
        if (!this.state.selectedDate) return;
        const dateStr = this.state.selectedDate;
        
        const dObj = new Date(dateStr); 
        const thaiDate = `${String(dObj.getDate()).padStart(2,'0')}/${String(dObj.getMonth() + 1).padStart(2,'0')}/${dObj.getFullYear() + 543}`;
        const dateTextEl = document.getElementById('visit-date-text');
        if (dateTextEl) {
            dateTextEl.innerHTML = `<i class="fa-regular fa-calendar-check text-success me-1"></i> แสดงคิวประจำวันที่ <b style="color: var(--text-dark);">${thaiDate}</b>`;
        }

        const oldVisitListenerIdx = this.firebaseListeners.findIndex(l => l.id === 'visits');
        if (oldVisitListenerIdx > -1) {
            const targetListener = this.firebaseListeners[oldVisitListenerIdx];
            db.ref(targetListener.path).off('value', targetListener.callback);
            this.firebaseListeners.splice(oldVisitListenerIdx, 1);
        }

        const refVisits = db.ref('patients_database_v2/visits').orderByChild('date').equalTo(dateStr);
        const cbVisits = refVisits.on('value', snap => {
            try {
                const data = snap.val() || {};
                const todayVisits = Object.keys(data)
                    .map(k => ({ firebaseKey: k, ...data[k] }))
                    .filter(v => v && typeof v === 'object');
                
                this.state.allVisits = todayVisits;

                const activeVisits = todayVisits.filter(v => (v.status || "รอตรวจ") !== "เสร็จสิ้น" && v.status !== "ขาดนัด");
                const finishedVisits = todayVisits.filter(v => (v.status || "รอตรวจ") === "เสร็จสิ้น" || v.status === "ขาดนัด");

                this.#renderStats(todayVisits);

                const displayVisits = this.state.currentTab === 'active' ? activeVisits : finishedVisits;
                
                const mVisits = [], aVisits = [], eVisits = [];
                
                const timeToMins = (t) => {
                    if (!t) return 0;
                    const [h, m] = t.split(':');
                    return parseInt(h, 10) * 60 + parseInt(m || 0, 10);
                };

                const mEndMins = timeToMins(this.state.shiftSettings.morning.end);
                const aEndMins = timeToMins(this.state.shiftSettings.afternoon.end);
                
                displayVisits.forEach(v => {
                    const vMins = timeToMins(v.time || "00:00");
                    if (vMins < mEndMins) mVisits.push(v); 
                    else if (vMins < aEndMins) aVisits.push(v); 
                    else eVisits.push(v);
                });

                this.#renderColumn('board-morning', mVisits, 'รอบเช้า');
                this.#renderColumn('board-afternoon', aVisits, 'รอบบ่าย');
                this.#renderColumn('board-evening', eVisits, 'รอบเย็น');

                if (!this._isAutoChecking) {
                    this._isAutoChecking = true;
                    setTimeout(() => {
                        this.#runAutoStatusEngine();
                        this._isAutoChecking = false;
                    }, 1000);
                }
                
                this.#updateLiveTimers();

            } catch (err) {
                console.error("🔥 [VisitsPage] Render Visits Error:", err);
                const morningBoard = document.getElementById('board-morning');
                if (morningBoard) {
                    morningBoard.innerHTML = '<div class="text-center text-danger p-4"><i class="fa-solid fa-bug fa-2x mb-2"></i><br>ข้อมูลคิวฟอกไตขัดข้อง: ' + this.#escapeHTML(err.message) + '</div>';
                }
            }
        });
        
        this.firebaseListeners.push({ id: 'visits', path: 'patients_database_v2/visits', callback: cbVisits });
    }

    #runAutoStatusEngine() {
        if (!this.state.allVisits || this.state.allVisits.length === 0) return;
        
        const now = new Date(); 
        const y = now.getFullYear(); 
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const todayStr = `${y}-${m}-${d}`; 
        
        const updates = {}; 

        this.state.allVisits.forEach(v => {
            if (!v.firebaseKey) return;

            const currentStatus = v.status || "รอตรวจ";
            if (currentStatus === "เสร็จสิ้น" || currentStatus === "ขาดนัด") return; 

            const vDateObj = new Date(v.date);
            const todayObj = new Date(todayStr);

            if (vDateObj < todayObj) {
                updates[`patients_database_v2/visits/${v.firebaseKey}/status`] = "เสร็จสิ้น";
                return;
            }

            if (v.date === todayStr && v.time) {
                const parts = String(v.time).split(':');
                if (parts.length >= 2) {
                    const hours = parseInt(parts[0], 10); 
                    const minutes = parseInt(parts[1], 10);
                    
                    const scheduledTime = new Date(); 
                    scheduledTime.setHours(hours, minutes, 0, 0);
                    
                    const diffMins = (now.getTime() - scheduledTime.getTime()) / 60000;
                    
                    const targetMins = (parseFloat(v.duration_hours) || 4) * 60;
                    let shouldComplete = false;

                    if (currentStatus === "กำลังฟอกไต") {
                        const startTimeStr = v.dialysis_started_at || v.last_status_updated_at;
                        if (startTimeStr) {
                            const activeMins = (now.getTime() - new Date(startTimeStr).getTime()) / 60000;
                            if (activeMins >= targetMins) shouldComplete = true; 
                        } else if (diffMins >= targetMins) {
                            shouldComplete = true;
                        }
                    } 
                    else if (diffMins >= targetMins) {
                        shouldComplete = true;
                    }

                    if (shouldComplete) {
                        updates[`patients_database_v2/visits/${v.firebaseKey}/status`] = "เสร็จสิ้น";
                        updates[`patients_database_v2/visits/${v.firebaseKey}/dialysis_completed_at`] = now.toISOString();
                    }
                    else if (currentStatus === "รอตรวจ" && diffMins >= 1) { 
                        updates[`patients_database_v2/visits/${v.firebaseKey}/status`] = "กำลังฟอกไต";
                        if (!v.dialysis_started_at) {
                            updates[`patients_database_v2/visits/${v.firebaseKey}/dialysis_started_at`] = scheduledTime.toISOString();
                        }
                    }
                }
            }
        });

        if (Object.keys(updates).length > 0) {
            db.ref().update(updates).catch(err => {
                console.error("🔥 [VisitsPage] Auto-status sync failed:", err);
            });
        }
    }

    setToday() {
        const now = new Date();
        const y = now.getFullYear(); 
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        const localDate = `${y}-${m}-${d}`; 
        
        const dateInput = document.getElementById('visitDateSelector');
        if (dateInput) { 
            dateInput.value = localDate; 
            this.state.selectedDate = localDate;
            this.#updateDateDisplay(localDate);
            this.#loadVisitsData(); 
        }
    }

    #updateDateDisplay(dateStr) {
        const dObj = new Date(dateStr);
        const thaiDateFull = `${String(dObj.getDate()).padStart(2,'0')}/${String(dObj.getMonth() + 1).padStart(2,'0')}/${dObj.getFullYear() + 543}`;
        
        const dateTextEl = document.getElementById('visit-date-text');
        if (dateTextEl) {
            dateTextEl.innerHTML = `<i class="fa-regular fa-calendar-check text-success me-1"></i> แสดงคิวประจำวันที่ <b style="color: var(--text-dark);">${thaiDateFull}</b>`;
        }

        const visualEl = document.getElementById('visitDateVisual');
        if (visualEl) {
            visualEl.innerText = thaiDateFull;
        }
    }

    switchTab(tabName) {
        this.state.currentTab = tabName;
        const btnActive = document.getElementById('tab-active'); 
        const btnCompleted = document.getElementById('tab-completed');
        
        if (!btnActive || !btnCompleted) return;

        if (tabName === 'active') { 
            btnActive.className = "btn btn-premium-primary rounded-pill fw-bold px-4 shadow-sm"; 
            btnActive.setAttribute('aria-selected', 'true');
            btnCompleted.className = "btn rounded-pill fw-bold px-4 border shadow-sm"; 
            btnCompleted.style.cssText = "background-color: var(--bg-body); color: var(--text-muted); border-color: var(--border-color) !important;";
            btnCompleted.setAttribute('aria-selected', 'false');
        } else { 
            btnActive.className = "btn rounded-pill fw-bold px-4 border shadow-sm"; 
            btnActive.style.cssText = "background-color: var(--bg-body); color: var(--text-muted); border-color: var(--border-color) !important;";
            btnActive.setAttribute('aria-selected', 'false');
            btnCompleted.className = "btn btn-premium-success rounded-pill fw-bold px-4 shadow-sm"; 
            btnCompleted.style.cssText = "";
            btnCompleted.setAttribute('aria-selected', 'true');
        }
        
        this.#loadVisitsData(); 
    }

    #renderStats(dailyVisits) {
        const tTotal = dailyVisits.length; 
        const tWait = dailyVisits.filter(v => (v.status || 'รอตรวจ') === 'รอตรวจ').length;
        const tDialysis = dailyVisits.filter(v => v.status === 'กำลังฟอกไต').length; 
        const tDone = dailyVisits.filter(v => v.status === 'เสร็จสิ้น').length;

        const statContainer = document.getElementById('visit-stats-container'); 
        if (!statContainer) return;
        
        statContainer.innerHTML = `
            <div class="col-md-3 col-sm-6"><div class="modern-panel p-4 h-100 position-relative overflow-hidden card-hover-float" style="background-color: var(--bg-surface); border: 1px solid var(--border-color); border-top: 4px solid var(--muted); border-radius: 20px;"><div class="fw-bold small text-uppercase mb-2" style="color: var(--text-muted);">คิวทั้งหมด</div><h2 class="fw-bold mb-0" style="color: var(--text-dark);">${tTotal} <span class="fs-6 fw-normal" style="color: var(--text-muted);">ราย</span></h2></div></div>
            <div class="col-md-3 col-sm-6"><div class="modern-panel p-4 h-100 position-relative overflow-hidden card-hover-float" style="background-color: var(--bg-surface); border: 1px solid var(--border-color); border-top: 4px solid var(--primary); border-radius: 20px;"><div class="text-primary fw-bold small text-uppercase mb-2">รอตรวจ</div><h2 class="fw-bold text-primary mb-0">${tWait} <span class="fs-6 fw-normal" style="color: var(--text-muted);">ราย</span></h2></div></div>
            <div class="col-md-3 col-sm-6"><div class="modern-panel p-4 h-100 position-relative overflow-hidden card-hover-float" style="background-color: var(--bg-surface); border: 1px solid var(--border-color); border-top: 4px solid var(--warning); border-radius: 20px;"><div class="fw-bold small text-uppercase mb-2" style="color: var(--warning);">กำลังฟอกไต</div><h2 class="fw-bold mb-0" style="color: var(--warning);">${tDialysis} <span class="fs-6 fw-normal" style="color: var(--text-muted);">ราย</span></h2></div></div>
            <div class="col-md-3 col-sm-6"><div class="modern-panel p-4 h-100 position-relative overflow-hidden card-hover-float" style="background-color: var(--bg-surface); border: 1px solid var(--border-color); border-top: 4px solid var(--success); border-radius: 20px;"><div class="text-success fw-bold small text-uppercase mb-2">เสร็จสิ้น</div><h2 class="fw-bold text-success mb-0">${tDone} <span class="fs-6 fw-normal opacity-75" style="color: var(--text-muted);">ราย</span></h2></div></div>
        `;
    }

    #renderColumn(elementId, visitList, shiftName) {
        const el = document.getElementById(elementId); 
        if (!el) return;
        
        visitList.sort((a, b) => String(a.time || "00:00").localeCompare(String(b.time || "00:00")));

        if (visitList.length === 0) {
            el.innerHTML = `<div class="text-center p-4 border border-dashed rounded-4 h-100 d-flex flex-column align-items-center justify-content-center" style="background-color: var(--bg-body); border-color: var(--border-color) !important; color: var(--text-muted);"><i class="fa-solid fa-bed fa-3x mb-3" style="color: var(--border-color) !important;" aria-hidden="true"></i><p class="mb-0 fw-bold" style="font-size:14px; font-family:'Prompt';">${shiftName} ยังไม่มีข้อมูลคิว</p></div>`;
            return;
        }

        let html = "";
        visitList.forEach((v, index) => {
            const status = v.status || "รอตรวจ"; 
            let bColor = "var(--primary)"; 
            let badgeClass = "badge-soft-primary"; 
            let opacityStyle = "";
            let timerHtml = "";
            
            const targetMins = (parseFloat(v.duration_hours) || 4) * 60;
            const targetHoursDisplay = v.duration_hours ? `${v.duration_hours} ชม.` : `4 ชม.`;

            if (status.includes("กำลังฟอก")) { 
                bColor = "var(--warning)"; 
                badgeClass = "badge-soft-warning"; 
                const startTimeStr = v.dialysis_started_at || v.last_status_updated_at;
                if (startTimeStr) {
                    timerHtml = `
                        <div class="mt-2 d-flex flex-column align-items-end">
                            <span style="font-size:11px; color: #64748b; font-weight:bold; margin-bottom: 2px;"><i class="fa-solid fa-bullseye me-1"></i> เป้าหมาย: ${targetHoursDisplay}</span>
                            <div class="live-dialysis-timer fw-bold text-center shadow-sm" data-start-time="${startTimeStr}" data-target-mins="${targetMins}" style="color: #d97706; font-size:13px; font-family: 'Courier New', monospace; background: #fffbeb; padding: 4px 10px; border-radius: 6px; border: 1px dashed #f59e0b; display: inline-block;">
                                <i class="fa-solid fa-stopwatch me-1"></i> 00:00:00
                            </div>
                        </div>
                    `;
                }
            } else if (status.includes("เสร็จสิ้น")) { 
                bColor = "var(--success)"; 
                badgeClass = "badge-soft-success"; 
                opacityStyle = "opacity: 0.8;"; 
                const startStr = v.dialysis_started_at;
                const endStr = v.dialysis_completed_at || v.last_status_updated_at;
                if (startStr && endStr) {
                    const diffSecs = Math.floor((new Date(endStr).getTime() - new Date(startStr).getTime()) / 1000);
                    if (diffSecs > 0) {
                        const h = String(Math.floor(diffSecs / 3600)).padStart(2, '0');
                        const m = String(Math.floor((diffSecs % 3600) / 60)).padStart(2, '0');
                        timerHtml = `<div class="mt-2 fw-bold text-center shadow-sm" style="color: #16a34a; font-size:11px; font-family: 'Prompt'; background: #f0fdf4; padding: 4px 10px; border-radius: 6px; border: 1px dashed #86efac; display: inline-block;"><i class="fa-solid fa-flag-checkered me-1"></i> สุทธิ ${h}:${m} ชม.</div>`;
                    }
                }
            } else if (status === "ขาดนัด") {
                bColor = "var(--danger)"; 
                badgeClass = "badge-soft-danger"; 
                opacityStyle = "opacity: 0.6;"; 
            }
            
            const safeName = this.#escapeHTML(v.name);
            const safeBed = this.#escapeHTML(v.bed || '-');
            const safeHn = this.#escapeHTML(v.hn || '-');
            const safeRight = this.#escapeHTML(v.right || '-');
            const safeTime = this.#escapeHTML(v.time || '-');

            html += `
            <div class="visit-card shadow-sm mb-3 p-3 border card-hover-float" draggable="${status !== 'เสร็จสิ้น' && status !== 'ขาดนัด' ? 'true' : 'false'}" ondragstart="window.VisitsPage_dragStart(event, '${v.firebaseKey}')" style="background-color: var(--bg-surface); border-color: var(--border-color) !important; border-left: 5px solid ${bColor} !important; ${opacityStyle}" role="button" tabindex="0" onclick="App.pages.visits.manageVisit('${v.firebaseKey}')" onkeydown="if(event.key==='Enter') App.pages.visits.manageVisit('${v.firebaseKey}')" aria-label="เตียง ${safeBed} ผู้ป่วย ${safeName}">
                <div class="d-flex justify-content-between align-items-start w-100 mb-2">
                    <div class="d-flex align-items-center">
                        <span class="queue-badge me-2" title="คิวที่ ${index + 1}">${index + 1}</span>
                        <span class="badge border shadow-sm px-3 py-2 rounded-pill" style="background-color: var(--bg-body); color: var(--text-dark); border-color: var(--border-color) !important; font-size: 12px;"><i class="fa-solid fa-bed me-1 text-primary" aria-hidden="true"></i> เตียง ${safeBed}</span>
                        <span class="ms-2 fw-bold text-primary" style="font-size:13px;">⏰ ${safeTime}</span>
                    </div>
                    <div class="text-end d-flex flex-column align-items-end">
                        <span class="badge ${badgeClass} shadow-sm rounded-pill px-2 py-1 w-100" style="font-size:11px; font-family:'Prompt';">${status}</span>
                        ${timerHtml}
                    </div>
                </div>
                <div class="fw-bold mt-2 mb-1" style="font-size:15px; font-family:'Prompt'; color: var(--text-dark);">${safeName || 'ไม่ระบุชื่อ'}</div>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="fw-bold" style="font-size:12px; color: var(--text-muted);"><i class="fa-solid fa-id-card text-secondary me-1" aria-hidden="true"></i> HN: ${safeHn}</div>
                    <div class="fw-bold" style="font-size:12px; color: var(--text-muted);"><i class="fa-solid fa-shield-heart text-success me-1" aria-hidden="true"></i> ${safeRight}</div>
                </div>
            </div>`;
        });
        el.innerHTML = html;
    }

    manageVisit(firebaseKey) { 
        const v = this.state.allVisits.find(x => x.firebaseKey === firebaseKey); 
        if (!v) return;
        
        let isDialysisActive = v.status === 'กำลังฟอกไต' || v.status === 'เสร็จสิ้น';
        let defaultStartHHMM = v.time || "06:00"; 
        
        if (v.dialysis_started_at) {
            let actualStartObj = new Date(v.dialysis_started_at);
            defaultStartHHMM = String(actualStartObj.getHours()).padStart(2, '0') + ':' + String(actualStartObj.getMinutes()).padStart(2, '0');
        }

        window.VisitsPage_onStatusChange = (selectEl) => {
            const timeContainer = document.getElementById('custom-time-container');
            if (selectEl.value === 'กำลังฟอกไต' || selectEl.value === 'เสร็จสิ้น') {
                timeContainer.style.display = 'block';
            } else {
                timeContainer.style.display = 'none';
            }
        };

        Swal.fire({
            title: `<h5 class="fw-bold mb-0" style="font-family:'Prompt'; color: var(--text-dark);"><i class="fa-solid fa-gears text-primary me-2"></i>จัดการคิว: เตียง ${this.#escapeHTML(v.bed)}</h5>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <div class="p-3 rounded-4 border mb-4 text-center shadow-sm" style="background-color: var(--bg-body); border-color: var(--border-color) !important;">
                        <h5 class="fw-bold text-primary mb-1">${this.#escapeHTML(v.name)}</h5>
                        <div class="small fw-bold" style="color: var(--text-muted);">HN: ${this.#escapeHTML(v.hn)} <span class="mx-2">|</span> เวลานัด: ${v.time} น.</div>
                    </div>
                    <button type="button" class="btn btn-premium-primary btn-lg w-100 mb-4 fw-bold shadow-sm rounded-pill" onclick="Swal.close(); App.switchPage('visit_detail', null, '${v.id}')"><i class="fa-solid fa-file-medical me-2"></i> บันทึกข้อมูลฟอกไตเชิงลึก (HD Flowsheet)</button>
                    <hr class="mb-4" style="border-color: var(--border-color);">
                    
                    <label class="form-label fw-bold small" style="color: var(--text-muted);" for="swal-update-status">อัปเดตสถานะคิวด่วน</label>
                    <select id="swal-update-status" class="form-select form-select-lg mb-3 shadow-sm fw-bold input-modern" style="color: var(--text-dark);" onchange="window.VisitsPage_onStatusChange(this)">
                        <option value="รอตรวจ" ${v.status === 'รอตรวจ' ? 'selected' : ''}>🔵 รอตรวจ</option>
                        <option value="กำลังฟอกไต" ${v.status === 'กำลังฟอกไต' ? 'selected' : ''}>🟠 กำลังฟอกไต</option>
                        <option value="เสร็จสิ้น" ${v.status === 'เสร็จสิ้น' ? 'selected' : ''}>🟢 เสร็จสิ้น / ดึงการ์ดออก</option>
                        <option value="ขาดนัด" ${v.status === 'ขาดนัด' ? 'selected' : ''}>🔴 ขาดนัด (No Show)</option>
                    </select>

                    <div id="custom-time-container" style="display: ${isDialysisActive ? 'block' : 'none'};">
                        <label class="form-label fw-bold small text-warning-dark"><i class="fa-regular fa-clock me-1"></i> เวลาเริ่มฟอกจริง (เริ่มแทงเข็ม)</label>
                        <input type="time" id="swal-actual-start" class="form-control form-control-lg fw-bold text-center text-primary input-modern shadow-sm" value="${defaultStartHHMM}">
                        <small class="text-muted d-block mt-1">ระบบจะดึง <b>"เวลานัดหมาย"</b> มาเป็นค่าเริ่มต้นให้เสมอ</small>
                    </div>
                </div>
            `,
            showCancelButton: true, showDenyButton: true, width: 500, 
            confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึกสถานะ', cancelButtonText: 'ปิด', denyButtonText: '<i class="fa-solid fa-trash me-1"></i> ลบคิว', 
            confirmButtonColor: '#2563eb', denyButtonColor: '#ef4444', customClass: { popup: 'premium-alert' },
            preConfirm: () => { 
                const newStatus = document.getElementById('swal-update-status').value; 
                let newStartTimeStr = null;
                if (newStatus === 'กำลังฟอกไต' || newStatus === 'เสร็จสิ้น') {
                    const timeVal = document.getElementById('swal-actual-start').value;
                    if (!timeVal) { Swal.showValidationMessage('กรุณาระบุเวลาเริ่มฟอกจริง'); return false; }
                    const [h, m] = timeVal.split(':');
                    const actualDate = new Date(v.date);
                    actualDate.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
                    newStartTimeStr = actualDate.toISOString();
                }
                return { status: newStatus, startTime: newStartTimeStr };
            }
        }).then((result) => {
            delete window.VisitsPage_onStatusChange; 

            if (result.isConfirmed) {
                const { status: newStatus, startTime: customStartTime } = result.value; 
                const nowIso = new Date().toISOString();
                let updatePayload = { status: newStatus, last_status_updated_at: nowIso };

                if (newStatus === 'กำลังฟอกไต' || newStatus === 'เสร็จสิ้น') {
                    updatePayload.dialysis_started_at = customStartTime;
                } 
                if (newStatus === 'เสร็จสิ้น' && v.status !== 'เสร็จสิ้น') {
                    updatePayload.dialysis_completed_at = nowIso;
                }
                if (newStatus === 'รอตรวจ' || newStatus === 'ขาดนัด') {
                    updatePayload.dialysis_started_at = null; 
                }

                db.ref(`patients_database_v2/visits/${firebaseKey}`).update(updatePayload).then(() => { 
                    Swal.fire({ title: 'อัปเดตสถานะคิวสำเร็จ', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
                });
            } else if (result.isDenied) {
                Swal.fire({ 
                    title: 'ยืนยันการลบ?', text: `ต้องการยกเลิกคิวเตียง ${v.bed} ของ ${this.#escapeHTML(v.name)} ใช่หรือไม่?`, icon: 'warning', 
                    showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'ใช่, ยกเลิกคิว', cancelButtonText: 'ยกเลิก'
                }).then((delRes) => {
                    if (delRes.isConfirmed) { 
                        db.ref(`patients_database_v2/visits/${firebaseKey}`).remove().then(() => {
                            Swal.fire('ลบแล้ว!', 'คิวถูกยกเลิกออกจากกระดาน', 'success');
                        }); 
                    }
                });
            }
        });
    }

    openAddVisitModal() {
        if (this.state.patientsList.length === 0) { 
            Swal.fire('ฐานข้อมูลว่างเปล่า', 'ยังไม่มีรายชื่อผู้ป่วยในระบบ กรุณาลงทะเบียนผู้ป่วยก่อนครับ', 'warning'); return; 
        }
        
        const optionsHtml = this.state.patientsList.map(p => `<option value="${this.#escapeHTML(p.hn)} | ${this.#escapeHTML(p.name_th)}"></option>`).join('');
        const currentDate = this.state.selectedDate;

        let hourOptions = ''; for (let h = 1; h <= 24; h++) { const hr = String(h).padStart(2, '0'); hourOptions += `<option value="${hr}" ${hr === '08' ? 'selected' : ''}>${hr}</option>`; }
        let minuteOptions = ''; for (let m = 0; m <= 59; m++) { const min = String(m).padStart(2, '0'); minuteOptions += `<option value="${min}" ${min === '00' ? 'selected' : ''}>${min}</option>`; }

        Swal.fire({
            title: `<h4 class="fw-bold mb-0 text-primary" style="font-family:'Prompt';"><i class="fa-solid fa-bed-pulse me-2"></i> เปิดคิวฟอกไตใหม่</h4>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <button type="button" class="btn w-100 fw-bold shadow-sm mb-4 py-3" style="background-color: var(--bg-surface); color: var(--text-dark); border: 2px dashed var(--primary); border-radius:14px;" id="btn-visit-read-card" onclick="App.pages.visits.readCardForVisit()">
                        <i class="fa-solid fa-id-card me-2 text-primary"></i> เสียบบัตร ปชช. ดึงประวัติคนไข้
                    </button>
                    <label class="form-label fw-bold small" style="color: var(--text-muted);">เลือกผู้ป่วย (พิมพ์ค้นหาชื่อ หรือ HN)</label>
                    <input list="visit-pt-datalist" id="swal-v-patient" class="input-modern w-100 mb-3 shadow-sm" placeholder="พิมพ์ค้นหา หรือเสียบบัตร..." autocomplete="off">
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
                            <input type="text" id="swal-v-bed" class="input-modern w-100 border-primary text-primary shadow-sm" placeholder="เช่น 01, A2" autocomplete="off">
                        </div>
                        <div class="col-12 mt-2">
                            <label class="form-label fw-bold text-primary small"><i class="fa-solid fa-stopwatch me-1"></i> ระยะเวลาฟอก (ชั่วโมง)</label>
                            <select id="swal-v-duration" class="form-select input-modern shadow-sm fw-bold text-dark" style="cursor:pointer;">
                                <option value="2">2 ชั่วโมง</option>
                                <option value="3">3 ชั่วโมง</option>
                                <option value="3.5">3.5 ชั่วโมง (3 ชม. 30 นาที)</option>
                                <option value="4" selected>4 ชั่วโมง (มาตรฐาน)</option>
                                <option value="4.5">4.5 ชั่วโมง (4 ชม. 30 นาที)</option>
                                <option value="5">5 ชั่วโมง</option>
                            </select>
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-check me-1"></i> บันทึกคิว', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#10b981', width: 500, customClass: { popup: 'premium-alert' },
            preConfirm: () => {
                const ptVal = document.getElementById('swal-v-patient').value; 
                const hourVal = document.getElementById('swal-v-time-hour').value;
                const minVal = document.getElementById('swal-v-time-minute').value;
                const bedVal = document.getElementById('swal-v-bed').value.trim();
                const durationVal = document.getElementById('swal-v-duration').value; 
                
                if (!ptVal || !hourVal || !minVal || !bedVal) { Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง'); return false; }
                
                const hn = ptVal.split(' | ')[0].trim(); 
                const ptObj = this.state.patientsList.find(p => p.hn === hn);
                if (!ptObj) { Swal.showValidationMessage('ไม่พบรหัส HN นี้ในระบบ'); return false; }
                
                const isDuplicate = this.state.allVisits.some(v => v.hn === ptObj.hn && v.date === currentDate);
                if (isDuplicate) { Swal.showValidationMessage(`🚫 ${ptObj.name_th} มีคิวของวันนี้อยู่แล้ว ไม่สามารถลงซ้ำได้`); return false; }

                return { 
                    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'VST_' + Date.now(), 
                    date: currentDate, hn: ptObj.hn, name: ptObj.name_th, right: ptObj.right || 'ไม่ระบุ', 
                    time: `${hourVal}:${minVal}`, bed: bedVal, duration_hours: parseFloat(durationVal), status: "รอตรวจ" 
                };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const newVisit = result.value; 
                Swal.fire({ title: 'กำลังจัดคิว...', didOpen: () => Swal.showLoading() });
                try {
                    await db.ref('patients_database_v2/visits').push(newVisit);
                    Swal.fire({ title: 'สำเร็จ', text: `ลงคิวเตียง ${newVisit.bed} ให้ ${newVisit.name} เรียบร้อย`, icon: 'success', timer: 1500, showConfirmButton: false });
                } catch (err) { Swal.fire('Error', err.message, 'error'); }
            }
        });
    }

    async readCardForVisit() {
        if (this.state.isReadingCard) return;
        this.state.isReadingCard = true;

        const btn = document.getElementById('btn-visit-read-card'); 
        if (!btn) { this.state.isReadingCard = false; return; }
        
        const originalHtml = btn.innerHTML; 
        btn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> กำลังอ่านบัตร...`; btn.disabled = true;

        try {
            const response = await fetch('http://localhost:8000/read-card', { signal: AbortSignal.timeout(8000) });
            if (!response.ok) throw new Error("ไม่สามารถเชื่อมต่อ Local Agent ได้");
            const result = await response.json();
            
            if (result.error || result.status === "error") { Swal.showValidationMessage(result.error || 'กรุณาตรวจสอบการเสียบบัตรประชาชน'); return; }

            const data = result.data || result; 
            const cid = data.cid || data.idcard || "";
            if (!cid) { Swal.showValidationMessage('ไม่พบเลขบัตรประชาชนบนชิปการ์ด'); return; }

            const cleanCid = cid.replace(/-/g, "");
            const foundPt = this.state.patientsList.find(p => String(p.idcard || "").replace(/-/g, "") === cleanCid);

            if (foundPt) {
                const targetDate = this.state.selectedDate;
                const isDuplicate = this.state.allVisits.some(v => v.hn === foundPt.hn && v.date === targetDate);
                if (isDuplicate) { Swal.showValidationMessage(`🚫 [ล็อกระบบ] ${foundPt.name_th} มีชื่ออยู่ในคิวของวันนี้แล้ว ห้ามลงซ้ำ!`); return; }

                const patientInput = document.getElementById('swal-v-patient');
                if (patientInput) { patientInput.value = `${foundPt.hn} | ${foundPt.name_th}`; }
                
                btn.innerHTML = `<i class="fa-solid fa-check-circle me-2"></i> ดึงข้อมูลสำเร็จ`; 
                btn.className = "btn btn-premium-success w-100 py-3 fw-bold mb-3 rounded-pill shadow-sm"; 
                Swal.resetValidationMessage();
            } else {
                Swal.showValidationMessage(`ไม่พบประวัติ (เลข ปชช: ${cid}) กรุณาไปลงทะเบียนผู้ป่วยใหม่ก่อน`); 
            }
        } catch (err) { 
            console.error("Card Reader Error:", err);
            Swal.showValidationMessage('โปรแกรม Local Card Reader ไม่ตอบสนอง (กรุณาตรวจสอบ http://localhost:8000)'); 
        } finally {
            if (btn && btn.disabled && !btn.className.includes('btn-premium-success')) { btn.innerHTML = originalHtml; btn.disabled = false; }
            this.state.isReadingCard = false;
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
                    if (result.error || result.status === "error") { Swal.fire('เกิดข้อผิดพลาด', result.error || 'อ่านบัตรล้มเหลว', 'error'); return; }

                    const data = result.data || result; const cid = data.cid || data.idcard || "";
                    if (!cid) { Swal.fire('Error', 'ไม่พบเลขบัตรประชาชน', 'error'); return; }

                    const cleanCid = cid.replace(/-/g, ""); 
                    const ptObj = this.state.patientsList.find(p => (p.idcard || "").replace(/-/g, "") === cleanCid);
                    if (!ptObj) { Swal.fire('ไม่พบคนไข้', 'ไม่พบประวัติเลขบัตรนี้ในฐานข้อมูลเวชระเบียน', 'warning'); return; }

                    const currentDate = this.state.selectedDate;
                    const activeVisit = this.state.allVisits.find(v => v.hn === ptObj.hn && v.status !== "เสร็จสิ้น"); 

                    if (activeVisit && activeVisit.firebaseKey) {
                        await db.ref(`patients_database_v2/visits/${activeVisit.firebaseKey}`).update({ status: "เสร็จสิ้น", dialysis_completed_at: new Date().toISOString() });
                        Swal.fire({ title: 'เช็คเอาท์สำเร็จ! 🎉', html: `ปิด Visit และย้ายการ์ดเตียง <b>${activeVisit.bed}</b> ของ <b>${this.#escapeHTML(activeVisit.name)}</b> ไปที่ประวัติเรียบร้อย`, icon: 'success', timer: 2500 });
                    } else { 
                        Swal.fire('ไม่พบข้อมูลคิว', `ไม่พบข้อมูลคิวฟอกไตที่กำลังทำงานอยู่ของ <b>${this.#escapeHTML(ptObj.name_th)}</b> ในวันนี้ครับ`, 'info'); 
                    }
                } catch (e) { Swal.fire('ตัวเชื่อมต่อขัดข้อง', 'กรุณาตรวจสอบการเปิดโปรแกรม Local Bridge Agent หรือเครื่องอ่านบัตร (Agent Offline)', 'error'); }
            }
        });
    }

    #escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
}

const VisitsPage = new VisitsPageComponent();
window.VisitsPage = VisitsPage;