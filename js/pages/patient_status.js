// js/pages/patient_status.js
// 🚀 โมดูลทะเบียนผู้ป่วยส่งต่อ/จำหน่าย (Smart Archive + Date Timestamp + 5-Year Auto-Purge)

const PatientStatusPage = {
    currentTab: 'Admit รพ.',
    allData: [],
    hasCleanedUp: false,

    html: `
        <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
                <h2 class="page-title text-danger" style="font-size: 28px;">
                    <div class="d-inline-flex align-items-center justify-content-center rounded-4 shadow-sm me-2" style="width: 45px; height: 45px; background: var(--danger-gradient); color: white;">
                        <i class="fa-solid fa-truck-medical"></i>
                    </div>
                    ผู้ป่วยส่งต่อและจำหน่าย <span class="text-muted fw-normal" style="font-size: 20px;">(Archive)</span>
                </h2>
                <p class="text-muted mt-2 mb-0 fw-bold" id="ps-count-text">กำลังซิงค์ข้อมูลจากระบบคลาวด์...</p>
            </div>
            <div class="d-flex gap-2 align-items-center flex-wrap">
                <div class="search-box-modern shadow-sm bg-white" style="width: 320px; border-radius: 50px;">
                    <i class="fa-solid fa-search text-danger"></i>
                    <input type="text" id="psSearch" class="border-0 bg-transparent ms-2 w-100 fw-bold text-dark" placeholder="ค้นหา HN, ชื่อ..." style="outline: none; font-family:'Prompt';">
                </div>
            </div>
        </div>

        <ul class="nav finance-nav-tabs mb-4" id="statusTabs" role="tablist" style="border-bottom: 2px solid #e2e8f0; gap: 10px; display: flex;">
            <li class="nav-item" role="presentation">
                <button class="nav-link active fw-bold px-4 py-3" id="tab-admit" onclick="PatientStatusPage.switchTab('Admit รพ.')" style="border: none; border-radius: 12px 12px 0 0; color: var(--danger); font-size: 16px; background: #fff; box-shadow: 0 -4px 10px rgba(0,0,0,0.02); border-bottom: 3px solid var(--danger);">
                    <i class="fa-solid fa-hospital me-2"></i> Admit รพ. (<span id="count-admit">0</span>)
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link fw-bold px-4 py-3 text-secondary" id="tab-transfer" onclick="PatientStatusPage.switchTab('ย้ายคลินิก')" style="border: none; border-radius: 12px 12px 0 0; font-size: 16px; background: transparent; border-bottom: 3px solid transparent;">
                    <i class="fa-solid fa-right-left me-2"></i> ย้ายคลินิก/จำหน่าย (<span id="count-transfer">0</span>)
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link fw-bold px-4 py-3 text-dark" id="tab-deceased" onclick="PatientStatusPage.switchTab('เสียชีวิต')" style="border: none; border-radius: 12px 12px 0 0; font-size: 16px; background: transparent; border-bottom: 3px solid transparent;">
                    <i class="fa-solid fa-book-skull me-2"></i> เสียชีวิต (<span id="count-deceased">0</span>)
                </button>
            </li>
        </ul>
        
        <div class="modern-panel shadow-sm p-4 position-relative overflow-hidden" style="border-top: 5px solid var(--danger);">
            <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 300px; pointer-events: none;"><i class="fa-solid fa-truck-medical"></i></div>
            
            <div class="table-responsive bg-white rounded-4 border border-light position-relative z-1 shadow-sm pb-2">
                <table class="table table-premium w-100 mb-0">
                    <thead>
                        <tr>
                            <th style="width: 30%;"><i class="fa-solid fa-id-card-clip text-primary me-2"></i> ผู้ป่วย (HN & ชื่อ)</th>
                            <th style="width: 25%;"><i class="fa-solid fa-phone text-info me-2"></i> ข้อมูลติดต่อ</th>
                            <th style="width: 15%;"><i class="fa-solid fa-shield-heart text-success me-2"></i> สิทธิรักษา</th>
                            <th class="text-center" style="width: 10%;"><i class="fa-solid fa-chart-simple text-warning me-2"></i> สถานะ</th>
                            <th class="text-center" style="width: 20%;"><i class="fa-solid fa-gears text-secondary me-2"></i> จัดการ / ดึงกลับ</th>
                        </tr>
                    </thead>
                    <tbody id="ps-table-body">
                        <tr><td colspan="5" class="text-center py-5 text-danger"><i class="fas fa-spinner fa-spin fa-3x mb-3 drop-shadow"></i><br>กำลังดึงข้อมูลเวชระเบียน...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `,

    init: function() {
        if (typeof db === 'undefined') return;

        // 🚨 รันฟังก์ชันล้างข้อมูล (Auto-Purge) ทันทีที่เปิดหน้า
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
                searchInput.addEventListener('keyup', (e) => {
                    this.renderTable(e.target.value.toLowerCase());
                });
            }
        }, 100);
    },

    // 🧹 ระบบคัดแยกและลบข้อมูลที่อายุเกิน 5 ปี (อิงตาม last_updated)
    autoCleanUpOldArchives: function() {
        this.hasCleanedUp = true; 
        const cutoffDate = new Date();
        // ถอยหลังไป 5 ปี นับจากวันนี้
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 5); 

        db.ref('patients_database_v2/patients').once('value').then(snap => {
            let data = snap.val();
            if (!data) return;
            let rawPatients = Array.isArray(data) ? data : Object.keys(data).map(k => data[k]);
            let originalLength = rawPatients.length;
            
            let updatedPatients = rawPatients.filter(p => {
                if (!p) return false;
                // ถ้าคนไข้ยัง Active (ปกติ) ไม่ต้องไปยุ่ง (ป้องกันลบผิด)
                if ((p.status || 'ปกติ') === 'ปกติ') return true;
                
                // ถือว่า last_updated คือวันที่ถูกตั้งสถานะให้ "จำหน่ายออก"
                let recordDate = new Date(p.last_updated || p.register_date || "2000-01-01");
                
                // ถ้าวันที่นั้น "เก่ากว่า" 5 ปีที่แล้ว (ลบทิ้ง = false)
                if (recordDate < cutoffDate) return false; 
                
                // นอกนั้นเก็บไว้
                return true; 
            });

            let deletedCount = originalLength - updatedPatients.length;
            if (deletedCount > 0) {
                db.ref('patients_database_v2/patients').set(updatedPatients).then(() => {
                    const Toast = Swal.mixin({ 
                        toast: true, position: 'bottom-end', showConfirmButton: false, timer: 6000,
                        didOpen: (toast) => {
                            toast.style.background = '#ffffff';
                            toast.style.border = '2px solid #ef4444';
                            toast.style.borderRadius = '16px';
                            toast.style.fontFamily = "'Prompt', sans-serif";
                        }
                    });
                    Toast.fire({ icon: 'info', title: `♻️ ล้างประวัติ Archive เก่าเกิน 5 ปี สำเร็จ (${deletedCount} รายการ)` });
                });
            }
        });
    },

    updateCounts: function() {
        let admit = 0, transfer = 0, deceased = 0;
        this.allData.forEach(p => {
            if (p.status === 'Admit รพ.') admit++;
            else if (p.status === 'ย้ายคลินิก') transfer++;
            else if (p.status === 'เสียชีวิต') deceased++;
        });

        if(document.getElementById('count-admit')) document.getElementById('count-admit').innerText = admit;
        if(document.getElementById('count-transfer')) document.getElementById('count-transfer').innerText = transfer;
        if(document.getElementById('count-deceased')) document.getElementById('count-deceased').innerText = deceased;
        if(document.getElementById('ps-count-text')) document.getElementById('ps-count-text').innerText = `พบรายชื่อผู้ป่วยที่ถูกแยกไว้ทั้งหมด ${this.allData.length} ราย`;
    },

    switchTab: function(tabName) {
        this.currentTab = tabName;
        
        ['tab-admit', 'tab-transfer', 'tab-deceased'].forEach(id => {
            let el = document.getElementById(id);
            if(el) {
                el.style.background = 'transparent';
                el.style.borderBottom = '3px solid transparent';
                el.classList.remove('text-danger', 'text-secondary', 'text-dark');
                el.classList.add('text-secondary');
            }
        });

        let activeEl = null;
        let activeColor = '';
        if(tabName === 'Admit รพ.') { activeEl = document.getElementById('tab-admit'); activeColor = 'var(--danger)'; activeEl.classList.add('text-danger'); }
        if(tabName === 'ย้ายคลินิก') { activeEl = document.getElementById('tab-transfer'); activeColor = '#64748b'; activeEl.classList.add('text-secondary');}
        if(tabName === 'เสียชีวิต') { activeEl = document.getElementById('tab-deceased'); activeColor = '#0f172a'; activeEl.classList.add('text-dark');}

        if(activeEl) {
            activeEl.classList.remove('text-secondary');
            activeEl.style.background = '#fff';
            activeEl.style.borderBottom = `3px solid ${activeColor}`;
            activeEl.style.boxShadow = '0 -4px 10px rgba(0,0,0,0.02)';
        }

        this.renderTable(document.getElementById('psSearch') ? document.getElementById('psSearch').value.toLowerCase() : "");
    },

    restorePatient: function(hn, patientName) {
        Swal.fire({
            title: 'ยืนยันการดึงผู้ป่วยกลับ?',
            html: `คุณต้องการนำคุณ <b>${patientName}</b><br>กลับเข้าสู่ทะเบียนผู้ป่วย <b>"สถานะปกติ"</b> ใช่หรือไม่?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#64748b',
            confirmButtonText: '<i class="fa-solid fa-rotate-left me-1"></i> ดึงกลับสู่ระบบ',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'กำลังประมวลผล...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
                
                db.ref('patients_database_v2/patients').once('value').then(snap => {
                    let data = snap.val();
                    if (!data) return;
                    
                    let patientsList = Array.isArray(data) ? data : Object.keys(data).map(k => data[k]);
                    let targetIndex = patientsList.findIndex(p => p && p.hn === hn);
                    
                    if (targetIndex !== -1) {
                        patientsList[targetIndex].status = 'ปกติ';
                        patientsList[targetIndex].last_updated = new Date().toISOString();
                        
                        db.ref('patients_database_v2/patients').set(patientsList).then(() => {
                            Swal.fire('ดึงกลับสำเร็จ!', 'ผู้ป่วยกลับไปอยู่ในทะเบียนหลักเรียบร้อยแล้ว', 'success');
                        }).catch(err => {
                            Swal.fire('ข้อผิดพลาด', err.message, 'error');
                        });
                    } else {
                        Swal.fire('ข้อผิดพลาด', 'ไม่พบข้อมูลผู้ป่วยในระบบ', 'error');
                    }
                });
            }
        });
    },

    renderTable: function(searchTerm = "") {
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
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-muted"><i class="fa-solid fa-box-archive fa-3x mb-3" style="opacity:0.2;"></i><br>ไม่มีรายชื่อผู้ป่วยในหมวดหมู่นี้</td></tr>`;
            return;
        }

        let html = "";
        filtered.forEach(p => {
            let statusBadge = '';
            if (p.status === "Admit รพ.") statusBadge = `<span class="badge bg-danger px-3 py-2 rounded-pill shadow-sm" style="font-size:12px;"><i class="fa-solid fa-truck-medical me-1"></i> ${p.status}</span>`;
            else if (p.status === "ย้ายคลินิก") statusBadge = `<span class="badge bg-secondary px-3 py-2 rounded-pill shadow-sm" style="font-size:12px;"><i class="fa-solid fa-right-left me-1"></i> ${p.status}</span>`;
            else if (p.status === "เสียชีวิต") statusBadge = `<span class="badge bg-dark px-3 py-2 rounded-pill shadow-sm" style="font-size:12px;"><i class="fa-solid fa-book-skull me-1"></i> ${p.status}</span>`;

            let imgSrc = p.photo_base64 ? (p.photo_base64.startsWith('data:image') ? p.photo_base64 : 'data:image/jpeg;base64,' + p.photo_base64) : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name_th||'X')}&background=e2e8f0&color=64748b&bold=true`;
            let fullName = `${p.title || ''}${p.name_th || 'ไม่ระบุชื่อ'}`;
            
            // 🚨 THE FIX: ระบบดึงวันที่แบบมี Fallback ป้องกันการโชว์ขีดลบ
            let formattedDate = 'ไม่ระบุวันที่';
            // ไล่หาฟิลด์วันที่ ถ้าไม่มีอันแรก ให้หาอันสอง
            let targetDate = p.last_updated || p.register_date || p.created_at; 
            
            if (targetDate) {
                const d = new Date(targetDate);
                if (!isNaN(d.getTime())) { // ป้องกัน Error กรณีรูปแบบวันที่ในฐานข้อมูลเพี้ยน
                    formattedDate = d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
                }
            }

            html += `
            <tr class="card-hover-float" style="cursor: default;">
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${imgSrc}" class="me-3 shadow-sm border border-3 border-light" style="width: 55px; height: 55px; border-radius: 14px; object-fit: cover; filter: grayscale(50%);">
                        <div>
                            <div class="fw-bold text-dark" style="font-size:15.5px; font-family:'Prompt';">${fullName}</div>
                            <div class="text-muted fw-bold mt-1" style="font-size:13px;"><i class="fa-solid fa-id-card me-1"></i> ${p.hn || '-'} <span class="ms-2 fw-normal">| อายุ: ${p.age || '-'}</span></div>
                            <div class="text-danger fw-bold mt-1" style="font-size:12px;"><i class="fa-solid fa-calendar-xmark me-1"></i> วันที่จำหน่าย: ${formattedDate}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="fw-bold text-dark" style="font-size:13px;"><i class="fa-solid fa-phone text-info me-2"></i> ${p.phone || '-'}</div>
                    <div class="text-danger fw-bold mt-2" style="font-size:12px;"><i class="fa-solid fa-truck-medical me-2"></i> ญาติ: ${p.emergency_contact || '-'}</div>
                </td>
                <td class="fw-bold text-secondary" style="font-size:14px;">${p.right || '-'}</td>
                <td class="text-center">${statusBadge}</td>
                <td class="text-center">
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-sm btn-primary shadow-sm" style="border-radius:10px; width:34px; height:34px; padding:0;" onclick="App.switchPage('patient_history', null, '${p.hn}')" title="ดูประวัติ EMR"><i class="fa-solid fa-folder-open"></i></button>
                        
                        <button class="btn btn-sm btn-warning text-dark shadow-sm px-3 fw-bold" style="border-radius:10px;" onclick="PatientStatusPage.restorePatient('${p.hn}', '${fullName}')" title="ดึงข้อมูลกลับสู่สถานะปกติ">
                            <i class="fa-solid fa-rotate-left me-1"></i> ดึงผู้ป่วยกลับ
                        </button>
                    </div>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    }
}; // 🚨 ใส่ปีกกาปิดคืนให้แล้วครับ! 🚨