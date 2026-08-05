// js/pages/patient_status.js
// 🚀 โมดูลทะเบียนผู้ป่วยส่งต่อ/จำหน่าย (Surgical Purge Engine + Zero-Overflow Table)

class PatientStatusPageComponent {
    constructor() {
        this.currentTab = 'Admit รพ.';
        this.allData = [];
        this.hasCleanedUp = false;
    }

    get html() {
        return `
            <style>
                /* 🚨 ULTRA-CLEAN TABS: ล้างเงา ล้างขอบ ล้างพื้นหลังให้สะอาดหมดจด 🚨 */
                .ps-tabs-wrapper {
                    display: flex;
                    gap: 28px; 
                    margin-bottom: 24px;
                    border-bottom: 2px solid var(--border-color); 
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                    align-items: flex-end;
                    padding-bottom: 0;
                }
                .ps-tabs-wrapper::-webkit-scrollbar { display: none; }
                
                .ps-tab-btn {
                    flex: 0 0 auto;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 12px 4px; 
                    background: transparent !important; 
                    border: none !important; 
                    border-bottom: 3px solid transparent !important; 
                    border-radius: 0 !important; 
                    font-family: 'Prompt', sans-serif;
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: color 0.2s ease, border-color 0.2s ease !important;
                    position: relative;
                    white-space: nowrap;
                    margin-bottom: -2px; 
                    box-sizing: border-box;
                    box-shadow: none !important; 
                }
                
                .ps-tab-btn:hover { 
                    color: var(--text-dark); 
                }
                .ps-tab-btn i { transition: transform 0.2s ease; }
                .ps-tab-btn:hover i { transform: scale(1.15); }

                /* 🌟 สถานะ Active ของแต่ละแท็บ */
                .ps-tab-btn.tab-admit-active {
                    color: #ef4444 !important;
                    border-bottom-color: #ef4444 !important;
                    font-weight: 800;
                }
                .ps-tab-btn.tab-transfer-active {
                    color: #0ea5e9 !important;
                    border-bottom-color: #0ea5e9 !important;
                    font-weight: 800;
                }
                .ps-tab-btn.tab-deceased-active {
                    color: var(--text-dark, #334155) !important;
                    border-bottom-color: var(--text-dark, #334155) !important;
                    font-weight: 800;
                }

                /* ========================================================
                   🚨 THE ULTIMATE FIX: FLUID SCROLL GRID ENGINE 
                   ======================================================== */
                /* 🪟 พาเนลเนื้อหาหลัก ให้มันขยายตัวตามจอที่เหลือ แต่ไม่ทะลุขอบล่าง */
                #ps-main-panel {
                    border-top-width: 4px !important;
                    border-top-style: solid !important;
                    transition: border-top-color 0.4s ease;
                    border-radius: 20px;
                    background-color: var(--bg-surface);
                    border-left: 1px solid var(--border-color);
                    border-right: 1px solid var(--border-color);
                    border-bottom: 1px solid var(--border-color);
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05) !important; 
                    
                    /* 🚨 จำกัดความสูงอ้างอิงกับจอภาพ กันทะลุ (Viewport Height Calculation) */
                    display: flex;
                    flex-direction: column;
                    height: calc(100vh - 290px); /* สำรองที่ให้ Header และ Tabs ด้านบน */
                    min-height: 400px;
                    margin-bottom: 20px;
                }
                
                #ps-main-panel.panel-admit-active { border-top-color: #ef4444 !important; }
                #ps-main-panel.panel-transfer-active { border-top-color: #0ea5e9 !important; }
                #ps-main-panel.panel-deceased-active { border-top-color: var(--text-dark, #334155) !important; }

                /* 🚨 กระบอกสูบของตาราง (Scrollable Wrapper) */
                .locked-table-wrapper {
                    flex-grow: 1; /* ขยายกินพื้นที่ของ ps-main-panel ทั้งหมดที่เหลือ */
                    min-height: 0; /* 🚨 สำคัญมาก: បังคับให้ตารางหดตัวอยู่ในกล่องได้ ไม่ทะลุ */
                    overflow-y: auto;
                    overflow-x: auto;
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                    background-color: var(--bg-surface);
                }
                .locked-table-wrapper::-webkit-scrollbar { width: 8px; height: 8px; }
                .locked-table-wrapper::-webkit-scrollbar-track { background: transparent; }
                .locked-table-wrapper::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .locked-table-wrapper::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

                /* 🚨 ล็อกหัวตารางให้อยู่กับที่เวลาเลื่อน (Sticky Header) */
                .table-premium th {
                    position: sticky;
                    top: 0;
                    background-color: var(--bg-body); /* ใช้สีพื้นหลังป้องกันข้อมูลทะลุ */
                    z-index: 10;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05); /* เงาบางๆ แยก Header กับ Content */
                }

                .safe-icon { font-family: 'Font Awesome 6 Free', 'FontAwesome', sans-serif !important; font-weight: 900 !important; font-style: normal !important; }
            </style>

            <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 fade-in-up">
                <div>
                    <h2 class="page-title text-danger" style="font-size: 28px;">
                        <div class="me-3 d-inline-flex align-items-center justify-content-center rounded-4 shadow-sm" style="width: 50px; height: 50px; background: linear-gradient(135deg, #ef4444, #b91c1c); color: white;">
                            <i class="fa-solid fa-truck-medical safe-icon fs-4"></i>
                        </div>
                        ผู้ป่วยส่งต่อและจำหน่าย <span class="text-muted fw-normal ms-2" style="font-size: 18px; letter-spacing: 1px;">(ARCHIVE)</span>
                    </h2>
                    <p class="text-muted mt-2 mb-0 fw-bold" id="ps-count-text">กำลังซิงค์ข้อมูลจากระบบคลาวด์...</p>
                </div>
                <div class="d-flex gap-2 align-items-center flex-wrap">
                    <div class="search-box-modern shadow-sm" style="width: 320px; padding: 12px 20px; border-radius: 50px; background-color: var(--bg-surface); border: 2px solid transparent; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); transition: all 0.3s;">
                        <i class="fa-solid fa-search text-danger safe-icon"></i>
                        <input type="text" id="psSearch" class="border-0 bg-transparent ms-2 w-100 fw-bold" placeholder="ค้นหา HN, ชื่อคนไข้..." style="outline: none; font-family:'Prompt'; color: var(--text-dark);">
                    </div>
                </div>
            </div>

            <div class="ps-tabs-wrapper" id="statusTabs">
                <button class="ps-tab-btn tab-admit-active" id="tab-admit" onclick="PatientStatusPage.switchTab('Admit รพ.')">
                    <i class="fa-solid fa-hospital me-2 safe-icon"></i> Admit รพ. 
                    <span class="badge bg-danger ms-2 rounded-pill" id="count-admit">0</span>
                </button>
                <button class="ps-tab-btn" id="tab-transfer" onclick="PatientStatusPage.switchTab('ย้ายคลินิก')">
                    <i class="fa-solid fa-truck-arrow-right me-2 safe-icon"></i> ย้ายคลินิก/จำหน่าย 
                    <span class="badge bg-info text-white ms-2 rounded-pill" id="count-transfer">0</span>
                </button>
                <button class="ps-tab-btn" id="tab-deceased" onclick="PatientStatusPage.switchTab('เสียชีวิต')">
                    <i class="fa-solid fa-book-skull me-2 safe-icon"></i> เสียชีวิต 
                    <span class="badge bg-secondary ms-2 rounded-pill" id="count-deceased">0</span>
                </button>
            </div>
            
            <div class="modern-panel p-4 position-relative overflow-hidden panel-admit-active fade-in-up" id="ps-main-panel" style="animation-delay: 0.1s;">
                <div style="position: absolute; top: -30px; right: -30px; opacity: 0.03; font-size: 300px; pointer-events: none; color: var(--text-dark); transform: rotate(-10deg);"><i class="fa-solid fa-folder-tree safe-icon"></i></div>
                
                <!-- 🚨 นำตารางใส่เข้าไปในกระบอกสูบ (Wrapper) ป้องกันทะลุขอบ 100% -->
                <div class="locked-table-wrapper position-relative z-1 shadow-sm">
                    <table class="table table-premium w-100 mb-0">
                        <thead>
                            <tr>
                                <th style="width: 30%;"><i class="fa-solid fa-id-card-clip text-primary me-2 safe-icon"></i> ผู้ป่วย (HN & ชื่อ)</th>
                                <th style="width: 25%;"><i class="fa-solid fa-phone text-info me-2 safe-icon"></i> ข้อมูลติดต่อ</th>
                                <th style="width: 15%;"><i class="fa-solid fa-shield-heart text-success me-2 safe-icon"></i> สิทธิรักษา</th>
                                <th class="text-center" style="width: 10%;"><i class="fa-solid fa-chart-simple text-warning me-2 safe-icon"></i> Status</th>
                                <th class="text-center" style="width: 20%;"><i class="fa-solid fa-gears text-secondary me-2 safe-icon"></i> จัดการ / ดึงกลับ</th>
                            </tr>
                        </thead>
                        <tbody id="ps-table-body">
                            <tr><td colspan="5" class="text-center py-5 text-danger"><i class="fas fa-circle-notch fa-spin fa-3x mb-3 drop-shadow safe-icon"></i><br><h5 class="fw-bold">กำลังเชื่อมต่อคลาวด์...</h5></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    init() {
        if (typeof db === 'undefined') return;

        if (!this.hasCleanedUp) {
            this.autoCleanUpOldArchives();
        }

        db.ref('patients_database_v2/patients').on('value', snap => {
            const data = snap.val();
            let rawPatients = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
            this.allData = rawPatients.filter(p => p !== null && (p.status || 'ปกติ') !== 'ปกติ'); 
            
            this.updateCounts();
            this.renderTable(document.getElementById('psSearch') ? document.getElementById('psSearch').value.toLowerCase() : "");
        });

        setTimeout(() => {
            const searchInput = document.getElementById('psSearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.renderTable(e.target.value.toLowerCase());
                });
                
                searchInput.addEventListener('focus', () => {
                    searchInput.parentElement.style.borderColor = 'var(--danger)';
                    searchInput.parentElement.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.15)';
                });
                searchInput.addEventListener('blur', () => {
                    searchInput.parentElement.style.borderColor = 'transparent';
                    searchInput.parentElement.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)';
                });
            }
        }, 100);
    }

    destroy() {
        db.ref('patients_database_v2/patients').off('value');
    }

    // 🚨 THE FIX: Surgical Purge Engine (ป้องกันการลบมั่ว & ป้องกัน Database พัง)
    autoCleanUpOldArchives() {
        this.hasCleanedUp = true; 
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 5); 

        db.ref('patients_database_v2/patients').once('value').then(snap => {
            let data = snap.val();
            if (!data || typeof data !== 'object') return;
            
            let updates = {};
            let deletedCount = 0;

            // วนลูปเช็คทีละ Record โดยอ้างอิงผ่าน Firebase Key แท้จริง
            Object.keys(data).forEach(key => {
                let p = data[key];
                if (!p) return;
                
                // คัดกรองเฉพาะคนที่ "ไม่ปกติ" (Archive)
                if ((p.status || 'ปกติ') !== 'ปกติ') {
                    let dateStr = p.last_updated || p.register_date || p.created_at;
                    
                    // 🛡️ Zero-Trust: ถ้าไม่มีวันที่ระบุไว้ ให้ "อนุโลมไม่ลบ" เพื่อความปลอดภัยของข้อมูล
                    if (dateStr) {
                        let recordDate = new Date(dateStr);
                        
                        // 🛠️ Edge Case: จัดการวันที่แบบไทย (DD/MM/YYYY หรือ DD/MM/2569)
                        if (dateStr.includes('/')) {
                            let parts = dateStr.split('/');
                            if (parts.length === 3) {
                                let year = parseInt(parts[2]);
                                if (year > 2500) year -= 543; // แปลง พ.ศ. เป็น ค.ศ.
                                recordDate = new Date(`${year}-${parts[1]}-${parts[0]}`);
                            }
                        }

                        // ตรวจสอบขั้นสุดท้าย: วันที่ Valid และ เก่ากว่า 5 ปีจริงๆ เท่านั้น
                        if (!isNaN(recordDate.getTime()) && recordDate < cutoffDate) {
                            updates[key] = null; // มาร์คคีย์นี้เป็น null เพื่อสั่ง Firebase ลบเฉพาะเจาะจง
                            deletedCount++;
                        }
                    }
                }
            });

            // ทำการยิงอัปเดตเฉพาะจุด (Atomic Update) ป้องกันคีย์ข้อมูลคนไข้คนอื่นหาย
            if (deletedCount > 0) {
                db.ref('patients_database_v2/patients').update(updates).then(() => {
                    const Toast = Swal.mixin({ 
                        toast: true, position: 'bottom-end', showConfirmButton: false, timer: 6000,
                        didOpen: (toast) => {
                            toast.style.background = 'var(--bg-surface)';
                            toast.style.border = '2px solid #ef4444';
                            toast.style.borderRadius = '16px';
                            toast.style.fontFamily = "'Prompt', sans-serif";
                            toast.style.color = 'var(--text-dark)';
                        }
                    });
                    Toast.fire({ icon: 'info', title: `♻️ ล้างประวัติ Archive เก่าเกิน 5 ปี สำเร็จ (${deletedCount} รายการ)` });
                });
            }
        });
    }

    updateCounts() {
        let admit = 0, transfer = 0, deceased = 0;
        this.allData.forEach(p => {
            if (p.status === 'Admit รพ.') admit++;
            else if (p.status === 'ย้ายคลินิก') transfer++;
            else if (p.status === 'เสียชีวิต') deceased++;
        });

        if(document.getElementById('count-admit')) document.getElementById('count-admit').innerText = admit;
        if(document.getElementById('count-transfer')) document.getElementById('count-transfer').innerText = transfer;
        if(document.getElementById('count-deceased')) document.getElementById('count-deceased').innerText = deceased;
        if(document.getElementById('ps-count-text')) document.getElementById('ps-count-text').innerText = `รายการที่ถูกแยกไว้ทั้งหมด ${this.allData.length} แฟ้ม`;
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        const panel = document.getElementById('ps-main-panel');
        
        ['tab-admit', 'tab-transfer', 'tab-deceased'].forEach(id => {
            let el = document.getElementById(id);
            if(el) el.classList.remove('tab-admit-active', 'tab-transfer-active', 'tab-deceased-active');
        });
        if(panel) panel.classList.remove('panel-admit-active', 'panel-transfer-active', 'panel-deceased-active');

        let activeEl = null;
        let activeClass = '';
        let panelClass = '';
        
        if(tabName === 'Admit รพ.') { 
            activeEl = document.getElementById('tab-admit'); 
            activeClass = 'tab-admit-active';
            panelClass = 'panel-admit-active';
        }
        else if(tabName === 'ย้ายคลินิก') { 
            activeEl = document.getElementById('tab-transfer'); 
            activeClass = 'tab-transfer-active';
            panelClass = 'panel-transfer-active';
        }
        else if(tabName === 'เสียชีวิต') { 
            activeEl = document.getElementById('tab-deceased'); 
            activeClass = 'tab-deceased-active';
            panelClass = 'panel-deceased-active';
        }

        if(activeEl) activeEl.classList.add(activeClass);
        if(panel) panel.classList.add(panelClass);

        this.renderTable(document.getElementById('psSearch') ? document.getElementById('psSearch').value.toLowerCase() : "");
    }

    restorePatient(hn, patientName) {
        Swal.fire({
            title: '<h4 class="fw-bold text-success mb-0" style="font-family:\'Prompt\';"><i class="fa-solid fa-rotate-left me-2"></i> ดึงผู้ป่วยกลับ</h4>',
            html: `คุณต้องการนำคุณ <b>${patientName}</b><br>กลับเข้าสู่ทะเบียนผู้ป่วย <b>"สถานะปกติ"</b> ใช่หรือไม่?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#64748b',
            confirmButtonText: '<i class="fa-solid fa-check me-1"></i> ยืนยันการดึงกลับ',
            cancelButtonText: 'ยกเลิก',
            customClass: {
                popup: 'premium-alert',
                confirmButton: 'btn-premium-swal btn-success-swal mx-2',
                cancelButton: 'btn-cancel-swal mx-2'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'กำลังประมวลผล...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }, customClass: { popup: 'premium-alert' } });
                
                db.ref('patients_database_v2/patients').once('value').then(snap => {
                    let data = snap.val();
                    if (!data) return;
                    
                    let patientsList = Array.isArray(data) ? data : Object.keys(data).map(k => data[k]);
                    let targetIndex = patientsList.findIndex(p => p && p.hn === hn);
                    
                    if (targetIndex !== -1) {
                        patientsList[targetIndex].status = 'ปกติ';
                        patientsList[targetIndex].last_updated = new Date().toISOString();
                        
                        db.ref('patients_database_v2/patients').set(patientsList).then(() => {
                            Swal.fire({
                                title: 'ดึงกลับสำเร็จ!', 
                                text: 'ผู้ป่วยกลับไปอยู่ในทะเบียนหลักเรียบร้อยแล้ว', 
                                icon: 'success',
                                timer: 1500,
                                showConfirmButton: false,
                                customClass: { popup: 'premium-alert' }
                            });
                        }).catch(err => {
                            Swal.fire({ title: 'ข้อผิดพลาด', text: err.message, icon: 'error', customClass: { popup: 'premium-alert' } });
                        });
                    } else {
                        Swal.fire({ title: 'ข้อผิดพลาด', text: 'ไม่พบข้อมูลผู้ป่วยในระบบ', icon: 'error', customClass: { popup: 'premium-alert' } });
                    }
                });
            }
        });
    }

    renderTable(searchTerm = "") {
        const tbody = document.getElementById('ps-table-body');
        if (!tbody) return;

        let filtered = this.allData.filter(p => p.status === this.currentTab);
        if (searchTerm) {
            filtered = filtered.filter(p => 
                (p.hn || "").toLowerCase().includes(searchTerm) || 
                (p.name_th || "").toLowerCase().includes(searchTerm) || 
                (p.idcard || "").toLowerCase().includes(searchTerm)
            );
        }

        if (filtered.length === 0) {
            let iconHtml = '<i class="fa-solid fa-folder-open fa-3x mb-3 text-secondary" style="opacity:0.3;"></i>';
            if(this.currentTab === 'Admit รพ.') iconHtml = '<i class="fa-solid fa-bed fa-3x mb-3 text-danger" style="opacity:0.3;"></i>';
            if(this.currentTab === 'ย้ายคลินิก') iconHtml = '<i class="fa-solid fa-truck-arrow-right fa-3x mb-3 text-info" style="opacity:0.3;"></i>';
            if(this.currentTab === 'เสียชีวิต') iconHtml = '<i class="fa-solid fa-book-skull fa-3x mb-3 text-dark" style="opacity:0.3;"></i>';

            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-muted">${iconHtml}<br><h5 class="fw-bold mt-2">ไม่มีข้อมูลในหมวดหมู่นี้</h5></td></tr>`;
            return;
        }

        let html = "";
        filtered.forEach(p => {
            let statusBadge = '';
            if (p.status === "Admit รพ.") statusBadge = `<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2 rounded-pill shadow-sm" style="font-size:12px;"><i class="fa-solid fa-truck-medical me-1 safe-icon"></i> ${p.status}</span>`;
            else if (p.status === "ย้ายคลินิก") statusBadge = `<span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-2 rounded-pill shadow-sm" style="font-size:12px;"><i class="fa-solid fa-right-left me-1 safe-icon"></i> ${p.status}</span>`;
            else if (p.status === "เสียชีวิต") statusBadge = `<span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-3 py-2 rounded-pill shadow-sm" style="font-size:12px;"><i class="fa-solid fa-book-skull me-1 safe-icon"></i> ${p.status}</span>`;

            let imgSrc = p.photo_base64 ? (p.photo_base64.startsWith('data:image') ? p.photo_base64 : 'data:image/jpeg;base64,' + p.photo_base64) : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name_th||'X')}&background=334155&color=fff&bold=true`;
            let fullName = `${p.title || ''}${p.name_th || 'ไม่ระบุชื่อ'}`;
            
            let formattedDate = 'ไม่ระบุวันที่';
            let targetDate = p.last_updated || p.register_date || p.created_at; 
            
            if (targetDate) {
                const d = new Date(targetDate);
                if (!isNaN(d.getTime())) { 
                    formattedDate = d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
                }
            }

            html += `
            <tr class="align-middle card-hover-float" style="cursor: default;">
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${imgSrc}" loading="lazy" decoding="async" class="me-3 shadow-sm border border-3 border-light" style="width: 55px; height: 55px; border-radius: 14px; object-fit: cover; filter: grayscale(15%); transition: all 0.3s;" onmouseover="this.style.filter='grayscale(0%)'" onmouseout="this.style.filter='grayscale(15%)'">
                        <div>
                            <div class="fw-bold text-dark" style="font-size:15.5px; font-family:'Prompt';">${fullName}</div>
                            <div class="text-muted fw-bold mt-1" style="font-size:13px;"><i class="fa-solid fa-id-card-clip me-1 safe-icon"></i> ${p.hn || '-'} <span class="ms-2 text-muted fw-normal">| อายุ: ${p.age || '-'} ปี</span></div>
                            <div class="small text-secondary fw-bold mt-1" style="font-size:11px;"><i class="fa-solid fa-clock me-1 safe-icon"></i> ย้ายเมื่อ: ${formattedDate}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="fw-bold text-dark" style="font-size:13.5px;"><i class="fa-solid fa-phone text-secondary me-2 safe-icon"></i> ${p.phone || '-'}</div>
                    <div class="text-muted small mt-1" style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"><i class="fa-solid fa-house-chimney-medical text-danger me-2 safe-icon"></i> ${p.emergency_contact || '-'}</div>
                </td>
                <td class="fw-bold text-secondary" style="font-size:13.5px;">${p.right || '-'}</td>
                <td class="text-center">${statusBadge}</td>
                <td class="text-center">
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-sm btn-primary shadow-sm" style="border-radius:10px; width:34px; height:34px; padding:0;" onclick="App.switchPage('patient_history', null, '${p.hn}')" title="เปิดดูแฟ้มประวัติ (EMR)"><i class="fa-solid fa-folder-open safe-icon"></i></button>
                        <button class="btn btn-sm btn-success text-white shadow-sm" style="border-radius:10px; padding: 0 16px; height:34px; font-size:13px; display:inline-flex; align-items:center; gap:6px;" onclick="PatientStatusPage.restorePatient('${p.hn}', '${fullName}')" title="ดึงกลับเข้าทะเบียนหลัก"><i class="fa-solid fa-rotate-left safe-icon"></i> ดึงกลับ</button>
                    </div>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    }
}

const PatientStatusPage = new PatientStatusPageComponent();
window.PatientStatusPage = PatientStatusPage;