// js/pages/patients.js
// 🚀 Enterprise Patients Module: Atomic Mutations, Flawless Off-Screen Print Spooler & Two-Key Deletion Guard (v8.0)

class PatientsPageComponent {
    constructor() {
        this.state = {
            allData: [], 
            clinicRights: [],
            isScanningModalOpen: false
        };
        this.html5QrCode = null; 
        this.firebaseListeners = [];
        this.searchTimeout = null;
    }

    get html() {
        return `
            <style>
                /* 🚨 THE FIX: ยันต์เกราะเพชรป้องกันไอคอนโดนฟอนต์อื่นกลืนกลายเป็นสี่เหลี่ยม 🚨 */
                .safe-icon { font-family: 'Font Awesome 6 Free', 'FontAwesome', sans-serif !important; font-weight: 900 !important; font-style: normal !important; }
            </style>
            
            <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 fade-in-up">
                <div>
                    <h2 class="page-title text-dark" style="font-weight: 800;">
                        <div class="d-inline-flex align-items-center justify-content-center rounded-4 shadow-sm me-2" style="width: 45px; height: 45px; background: var(--primary-gradient); color: white;">
                            <i class="fa-solid fa-hospital-user safe-icon"></i>
                        </div>
                        ทะเบียนผู้ป่วย <span class="text-muted fw-normal" style="font-size: 20px;">(Active Patients)</span>
                    </h2>
                    <p class="text-muted mt-2 mb-0 fw-bold" id="pt-count-text">กำลังซิงค์ข้อมูลจากระบบคลาวด์...</p>
                </div>
                <div class="d-flex gap-2 align-items-center flex-wrap">
                    <div class="search-box-modern shadow-sm" style="width: 320px; transition: all 0.3s ease; border: 2px solid transparent;">
                        <i class="fa-solid fa-search text-primary safe-icon"></i>
                        <input type="text" id="ptSearch" class="border-0 bg-transparent ms-2 w-100 fw-bold text-dark" placeholder="ค้นหา HN, ชื่อ, เลข ปชช..." style="outline: none; font-family:'Prompt';">
                    </div>
                    <button class="btn btn-success fw-bold shadow-sm rounded-pill px-4 text-white card-hover-float" onclick="App.pages.patients.openExportModal()" title="ส่งออกทะเบียนผู้ป่วย">
                        <i class="fa-solid fa-file-excel fa-lg me-2 safe-icon"></i> Export Excel
                    </button>
                    <button class="btn btn-dark fw-bold shadow-sm rounded-pill px-4 text-white card-hover-float" onclick="App.pages.patients.openScanner()" title="สแกนบัตรผู้ป่วย">
                        <i class="fa-solid fa-barcode fa-lg me-2 text-warning safe-icon"></i> สแกนบาร์โค้ด
                    </button>
                    <button class="btn btn-premium btn-premium-primary px-4 card-hover-float" onclick="App.pages.patients.openAddForm()">
                        <i class="fas fa-user-plus me-2 safe-icon"></i> ลงทะเบียนใหม่
                    </button>
                </div>
            </div>
            
            <div class="modern-panel shadow-sm p-4 position-relative overflow-hidden fade-in-up" style="animation-delay: 0.1s;">
                <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 300px; pointer-events: none;"><i class="fa-solid fa-users-medical safe-icon"></i></div>
                <div class="table-responsive bg-white rounded-4 border position-relative z-1 shadow-sm pb-2" style="background-color: var(--bg-surface) !important; border-color: var(--border-color) !important;">
                    <table class="table table-premium w-100 mb-0">
                        <thead style="position: sticky; top: 0; z-index: 10;">
                            <tr>
                                <th style="width: 25%;"><i class="fa-solid fa-id-card-clip text-primary me-2 safe-icon"></i> ผู้ป่วย (HN & ชื่อ)</th>
                                <th style="width: 20%;"><i class="fa-solid fa-clock-rotate-left text-info me-2 safe-icon"></i> ข้อมูลเวร/ติดต่อ</th>
                                <th style="width: 15%;"><i class="fa-solid fa-shield-heart text-success me-2 safe-icon"></i> สิทธิรักษา</th>
                                <th style="width: 15%;"><i class="fa-solid fa-virus text-danger me-2 safe-icon"></i> ผลเลือด (Infection)</th>
                                <th class="text-center" style="width: 10%;"><i class="fa-solid fa-chart-simple text-warning me-2 safe-icon"></i> สถานะ</th>
                                <th class="text-center" style="width: 15%;"><i class="fa-solid fa-gears text-secondary me-2 safe-icon"></i> จัดการ</th>
                            </tr>
                        </thead>
                        <tbody id="pt-table-body">
                            <tr><td colspan="6" class="text-center py-5 text-primary"><i class="fas fa-circle-notch fa-spin fa-3x mb-3 drop-shadow safe-icon"></i><br><h5 class="fw-bold mt-2">กำลังดึงข้อมูลเวชระเบียน...</h5></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    init() {
        if (typeof db === 'undefined' || typeof firebase === 'undefined') {
            this.#renderErrorState('ไม่พบการเชื่อมต่อฐานข้อมูล กรุณารีเฟรชหน้าเว็บ');
            return;
        }

        this.#bindEvents();

        if (firebase.auth().currentUser) {
            this.#loadData();
        } else {
            const unsub = firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    unsub();
                    this.#loadData();
                } else {
                    document.getElementById('pt-table-body').innerHTML = '<tr><td colspan="6" class="text-center py-5 text-warning"><i class="fa-solid fa-lock fa-3x mb-3 safe-icon"></i><br>กำลังตรวจสอบสิทธิ์การเข้าถึง...</td></tr>';
                }
            });
        }
    }

    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        this.stopCameraScanner(); 
        console.log("🧹 [Patients] Cleaned up listeners and hardware streams.");
    }

    #bindEvents() {
        const searchInput = document.getElementById('ptSearch');
        if (searchInput) {
            searchInput.addEventListener('focus', () => {
                searchInput.parentElement.style.borderColor = 'var(--primary)';
                searchInput.parentElement.style.boxShadow = '0 0 0 4px var(--primary-glow)';
            });
            searchInput.addEventListener('blur', () => {
                searchInput.parentElement.style.borderColor = 'transparent';
                searchInput.parentElement.style.boxShadow = 'var(--theme-shadow)';
            });

            searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    const term = e.target.value.toLowerCase().trim();
                    const filtered = this.state.allData.filter(p => 
                        (p.hn || "").toLowerCase().includes(term) || 
                        (p.name_th || "").toLowerCase().includes(term) || 
                        (p.idcard || "").toLowerCase().includes(term)
                    );
                    this.#renderTable(filtered);
                }, 300); 
            });
        }
    }

    #loadData() {
        db.ref('clinic_rights_v2').once('value').then(snap => {
            const data = snap.val();
            this.state.clinicRights = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
        });

        const ref = db.ref('patients_database_v2/patients');
        const cb = ref.on('value', snap => {
            try {
                const data = snap.val() || {};
                let rawPatients = Object.keys(data).map(k => ({ firebaseKey: k, ...data[k] }));
                
                this.state.allData = rawPatients.filter(p => p && typeof p === 'object' && (p.status || 'ปกติ') === 'ปกติ'); 
                
                const countText = document.getElementById('pt-count-text');
                if (countText) countText.innerHTML = `<i class="fa-solid fa-users me-1 text-primary safe-icon"></i> พบรายชื่อผู้ป่วยในระบบ <b>${this.state.allData.length}</b> ราย`;
                
                const searchBox = document.getElementById('ptSearch');
                if(searchBox && searchBox.value) {
                    searchBox.dispatchEvent(new Event('input'));
                } else {
                    this.#renderTable(this.state.allData);
                }
            } catch (err) {
                this.#renderErrorState('ข้อมูลเวชระเบียนมีปัญหา: ' + err.message);
            }
        }, (error) => {
            this.#renderErrorState('ฐานข้อมูลปฏิเสธการเข้าถึง (Permission Denied)');
        });
        this.firebaseListeners.push({ path: 'patients_database_v2/patients', callback: cb });
    }

    #renderErrorState(msg) {
        const tbody = document.getElementById('pt-table-body');
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center py-5 text-danger"><i class="fa-solid fa-triangle-exclamation fa-3x mb-3 safe-icon"></i><br>${msg}</td></tr>`;
    }

    #renderTable(dataList) {
        const tbody = document.getElementById('pt-table-body');
        if (!tbody) return;

        if (dataList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted"><i class="fa-regular fa-folder-open fa-3x mb-3 safe-icon" style="opacity:0.2;"></i><br><h6 class="fw-bold mt-2">ไม่พบข้อมูลผู้ป่วยในระบบ</h6></td></tr>';
            return;
        }

        dataList.sort((a,b) => (a.hn || '').localeCompare(b.hn || ''));

        let html = "";
        dataList.forEach(p => {
            let statusBadge = '<span class="badge px-3 py-2 rounded-pill shadow-sm" style="font-size:12px; background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2);"><i class="fa-solid fa-check-circle me-1 safe-icon"></i> ปกติ (Active)</span>';
            let infHtml = '<span class="badge bg-light text-secondary border px-3 py-2 rounded-pill shadow-sm" style="font-size:11px; background: rgba(0,0,0,0.03) !important;">ปลอดภัย</span>';
            let inf = p.infection || "ไม่มี";
            if (inf === "HCV") infHtml = '<span class="badge px-3 py-2 shadow-sm rounded-pill" style="font-size:11px; background: rgba(245,158,11,0.1); color: #d97706; border: 1px solid rgba(245,158,11,0.2);"><i class="fa-solid fa-virus me-1 safe-icon"></i> HCV +</span>';
            if (inf === "HIV") infHtml = '<span class="badge px-3 py-2 shadow-sm rounded-pill" style="font-size:11px; background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2);"><i class="fa-solid fa-virus me-1 safe-icon"></i> HIV +</span>';
            if (inf === "HBV") infHtml = '<span class="badge px-3 py-2 shadow-sm rounded-pill" style="font-size:11px; background: rgba(245,158,11,0.1); color: #d97706; border: 1px solid rgba(245,158,11,0.2);"><i class="fa-solid fa-virus me-1 safe-icon"></i> HBV +</span>';

            const safeName = this.#escapeHTML(`${p.title || ''}${p.name_th || 'ไม่ระบุชื่อ'}`);
            let imgSrc = p.photo_base64 && typeof p.photo_base64 === 'string' ? (p.photo_base64.startsWith('data:image') ? p.photo_base64 : 'data:image/jpeg;base64,' + p.photo_base64) : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(safeName||'X') + '&background=3b82f6&color=fff&bold=true';
            
            html += `<tr class="card-hover-float align-middle" style="cursor: pointer;">
                <td onclick="App.pages.patients.viewHistory('${p.hn}')">
                    <div class="d-flex align-items-center">
                        <img src="${imgSrc}" class="me-3 shadow-sm border border-3 border-light" style="width: 55px; height: 55px; border-radius: 14px; object-fit: cover;">
                        <div>
                            <div class="fw-bold text-dark" style="font-size:15.5px; font-family:'Prompt';">${safeName}</div>
                            <div class="text-primary fw-bold mt-1" style="font-size:13px;"><i class="fa-solid fa-id-card me-1 safe-icon"></i> ${this.#escapeHTML(p.hn || '-')} <span class="ms-2 text-muted fw-normal">| อายุ: ${this.#escapeHTML(p.age || '-')}</span></div>
                        </div>
                    </div>
                </td>
                <td onclick="App.pages.patients.viewHistory('${p.hn}')">
                    <div class="fw-bold text-dark" style="font-size:14px;"><i class="fa-solid fa-clock text-info me-2 safe-icon"></i> ${this.#escapeHTML(p.shift || 'ไม่ได้ระบุเวร')}</div>
                    <div class="text-muted fw-bold mt-2" style="font-size:12px;"><i class="fa-solid fa-phone text-secondary me-2 safe-icon"></i> ${this.#escapeHTML(p.phone || '-')}</div>
                </td>
                <td class="fw-bold text-secondary" onclick="App.pages.patients.viewHistory('${p.hn}')" style="font-size:14px;">${this.#escapeHTML(p.right || '-')}</td>
                <td onclick="App.pages.patients.viewHistory('${p.hn}')">${infHtml}</td>
                <td class="text-center" onclick="App.pages.patients.viewHistory('${p.hn}')">${statusBadge}</td>
                <td class="text-center">
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-sm shadow-sm" style="border-radius:10px; width:34px; height:34px; padding:0; background: rgba(37,99,235,0.1); color: #2563eb; border: 1px solid rgba(37,99,235,0.2);" onclick="event.stopPropagation(); App.pages.patients.viewHistory('${p.hn}')" title="แฟ้มประวัติ (EMR)"><i class="fa-solid fa-folder-open safe-icon"></i></button>
                        
                        <button class="btn btn-sm shadow-sm" style="border-radius:10px; width:34px; height:34px; padding:0; background: rgba(245,158,11,0.1); color: #d97706; border: 1px solid rgba(245,158,11,0.2);" onclick="event.stopPropagation(); App.pages.patients.editPatient('${p.firebaseKey}')" title="แก้ไขข้อมูล"><i class="fa-solid fa-pen safe-icon"></i></button>
                        
                        <button class="btn btn-sm shadow-sm" style="border-radius:10px; width:34px; height:34px; padding:0; background: rgba(14,165,233,0.1); color: #0ea5e9; border: 1px solid rgba(14,165,233,0.2);" onclick="event.stopPropagation(); App.pages.patients.printOPDCard('${p.hn}')" title="พิมพ์บัตร OPD"><i class="fa-solid fa-print safe-icon"></i></button>
                        
                        <button class="btn btn-sm shadow-sm" style="border-radius:10px; width:34px; height:34px; padding:0; background: rgba(100,116,139,0.1); color: #64748b; border: 1px solid rgba(100,116,139,0.2);" onclick="event.stopPropagation(); App.pages.patients.changeStatus('${p.firebaseKey}', '${safeName}')" title="เปลี่ยนสถานะ/จำหน่ายผู้ป่วย"><i class="fa-solid fa-user-minus safe-icon"></i></button>

                        <!-- 🚨 THE FIX: ปุ่มทำลายข้อมูล (Hard Delete) แดงเดือด -->
                        <button class="btn btn-sm shadow-sm" style="border-radius:10px; width:34px; height:34px; padding:0; background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5;" onclick="event.stopPropagation(); App.pages.patients.deletePatient('${p.firebaseKey}', '${p.hn}', '${safeName}')" title="ลบข้อมูลผู้ป่วย (ถาวร)"><i class="fa-solid fa-trash-can safe-icon"></i></button>
                    </div>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    }

    // 🚨 THE FIX: กลไกสลักนิรภัย (Two-Key Deletion Guard)
    deletePatient(firebaseKey, hn, patientName) {
        Swal.fire({
            title: '<h4 class="fw-bold text-danger mb-0" style="font-family:\'Prompt\';"><i class="fa-solid fa-triangle-exclamation me-2 safe-icon"></i>คำเตือนอันตราย!</h4>',
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    คุณกำลังจะลบเวชระเบียนของ:<br>
                    <b class="text-danger fs-5" style="font-family:'Prompt';">${patientName}</b> (HN: ${hn})<br><br>
                    <div class="p-3 mb-3 bg-danger-subtle border border-danger-subtle rounded-3 text-danger-emphasis small fw-bold">
                        <i class="fa-solid fa-fire me-1 safe-icon"></i> การกระทำนี้จะลบข้อมูลส่วนตัว, ประวัติการรักษา, ผลแล็บ และเอกสารแนบทั้งหมดของคนไข้คนนี้ <u style="text-decoration-thickness: 2px;">อย่างถาวร</u> และไม่สามารถกู้คืนได้!
                    </div>
                    โปรดยืนยันโดยการพิมพ์รหัส HN <b class="text-dark">"${hn}"</b> ลงในช่องด้านล่าง:
                </div>
            `,
            input: 'text',
            inputPlaceholder: `พิมพ์ ${hn} ที่นี่เพื่อยืนยัน...`,
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-trash-can me-1 safe-icon"></i> ยืนยันการลบถาวร',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            customClass: { popup: 'premium-alert', confirmButton: 'btn-premium-swal btn-danger-swal mx-2', cancelButton: 'btn-cancel-swal mx-2' },
            preConfirm: (inputValue) => {
                if (inputValue !== hn) {
                    Swal.showValidationMessage(`❌ รหัสยืนยันไม่ถูกต้อง กรุณาพิมพ์ <b>${hn}</b>`);
                    return false;
                }
                return true;
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'กำลังทำลายข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), customClass: { popup: 'premium-alert' } });
                
                try {
                    // ลบข้อมูลหลักของผู้ป่วยออกจาก Firebase
                    await db.ref(`patients_database_v2/patients/${firebaseKey}`).remove();
                    
                    Swal.fire({
                        title: 'ลบข้อมูลสำเร็จ!', 
                        html: `ข้อมูลของ <b>${patientName}</b> ถูกทำลายออกจากระบบอย่างถาวรแล้ว`, 
                        icon: 'success', 
                        timer: 2000, 
                        showConfirmButton: false, 
                        customClass: { popup: 'premium-alert' }
                    });
                } catch(err) {
                    Swal.fire({
                        title: 'เกิดข้อผิดพลาด', 
                        text: err.message, 
                        icon: 'error', 
                        customClass: { popup: 'premium-alert' }
                    });
                }
            }
        });
    }

    changeStatus(firebaseKey, patientName) {
        Swal.fire({
            title: 'จำหน่ายผู้ป่วย (เปลี่ยนสถานะ)',
            html: `<div class="text-start mb-2 text-muted">กำลังดำเนินการกับ: <b class="text-dark">${patientName}</b></div>`,
            input: 'select',
            inputOptions: { 'Admit รพ.': '🏥 Admit โรงพยาบาล', 'ย้ายคลินิก': '🔄 ย้ายคลินิก / จำหน่ายออก', 'เสียชีวิต': '⬛ เสียชีวิต' },
            inputPlaceholder: '-- เลือกสถานะใหม่ --',
            showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#cbd5e1',
            confirmButtonText: 'บันทึกและย้ายผู้ป่วย', cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'premium-alert', confirmButton: 'btn-premium-swal btn-danger-swal mx-2', cancelButton: 'btn-cancel-swal mx-2' },
            inputValidator: (value) => { if (!value) return 'กรุณาเลือกสถานะเพื่อดำเนินการ!'; }
        }).then(async (result) => {
            if (result.isConfirmed) {
                const newStatus = result.value;
                Swal.fire({ title: 'กำลังบันทึกข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), customClass: { popup: 'premium-alert' } });
                
                try {
                    await db.ref(`patients_database_v2/patients/${firebaseKey}`).update({
                        status: newStatus,
                        last_updated: new Date().toISOString()
                    });
                    
                    Swal.fire({title:'จำหน่ายสำเร็จ!', text:`ย้ายผู้ป่วยเข้าสู่หมวด "${newStatus}" เรียบร้อยแล้ว`, icon:'success', customClass: { popup: 'premium-alert' }});
                } catch(err) {
                    Swal.fire({title:'เกิดข้อผิดพลาด', text:err.message, icon:'error', customClass: { popup: 'premium-alert' }});
                }
            }
        });
    }

    openScanner() {
        this.state.isScanningModalOpen = true;
        let scannerHtml = `
            <div class="d-flex justify-content-center gap-2 mb-3 mt-3">
                <button id="btn-scan-usb" class="btn btn-premium btn-premium-primary flex-fill" onclick="App.pages.patients.switchScanMode('usb')"><i class="fa-solid fa-gun me-2 safe-icon"></i> ปืนสแกน (USB)</button>
                <button id="btn-scan-cam" class="btn btn-light fw-bold flex-fill border shadow-sm rounded-pill text-secondary" onclick="App.pages.patients.switchScanMode('cam')"><i class="fa-solid fa-mobile-screen-button me-2 safe-icon"></i> กล้องมือถือ</button>
            </div>
            <div id="swal-usb-scanner" style="display: block;">
                <p class="text-muted small mb-3">โปรดตรวจสอบให้แน่ใจว่าแป้นพิมพ์เป็น <b class="text-primary">ภาษาอังกฤษ (EN)</b></p>
                <input type="text" id="swal-barcode-input" class="form-control form-control-lg text-center fw-bold text-primary shadow-sm input-modern" placeholder="ยิงบาร์โค้ดลงในช่องนี้..." autocomplete="off" style="font-size: 20px; letter-spacing: 2px;">
            </div>
            <div id="swal-cam-scanner" style="display: none;">
                <div id="camera-reader" class="border rounded-4 overflow-hidden shadow-sm bg-dark d-flex align-items-center justify-content-center" style="width: 100%; min-height: 250px;"><i class="fa-solid fa-camera fa-2x text-secondary safe-icon"></i></div>
                <p class="text-muted small mt-3 mb-0">อนุญาตให้เข้าถึงกล้องและส่องที่บาร์โค้ด</p>
            </div>
        `;

        Swal.fire({
            title: '<h4 class="fw-bold mb-0 text-dark" style="font-family:\'Prompt\';"><i class="fa-solid fa-expand me-2 text-primary safe-icon"></i>สแกนบาร์โค้ดบัตรผู้ป่วย</h4>',
            html: scannerHtml,
            showCancelButton: true, showConfirmButton: false, cancelButtonText: 'ปิดหน้าต่าง', allowOutsideClick: false,
            customClass: { popup: 'premium-alert', cancelButton: 'btn-cancel-swal w-100 mt-2' },
            didOpen: () => {
                const input = document.getElementById('swal-barcode-input');
                if(input) {
                    input.focus();
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            let scannedHN = input.value.trim().replace(/\*/g, '');
                            if (scannedHN) { this.state.isScanningModalOpen = false; Swal.close(); this.processBarcodeSearch(scannedHN); }
                        }
                    });
                    
                    input.addEventListener('blur', () => {
                        if (!this.state.isScanningModalOpen) return; 
                        const usbDiv = document.getElementById('swal-usb-scanner');
                        if(usbDiv && usbDiv.style.display === 'block') {
                            setTimeout(() => { const currentInput = document.getElementById('swal-barcode-input'); if(currentInput && this.state.isScanningModalOpen) currentInput.focus(); }, 100);
                        }
                    });
                }
            },
            willClose: () => { 
                this.state.isScanningModalOpen = false; 
                this.stopCameraScanner(); 
            }
        });
    }

    switchScanMode(mode) {
        const usbSec = document.getElementById('swal-usb-scanner'); const camSec = document.getElementById('swal-cam-scanner');
        const btnUsb = document.getElementById('btn-scan-usb'); const btnCam = document.getElementById('btn-scan-cam');

        if (mode === 'usb') {
            if (camSec) camSec.style.display = 'none'; if (usbSec) usbSec.style.display = 'block';
            if (btnUsb) btnUsb.className = 'btn btn-premium btn-premium-primary flex-fill';
            if (btnCam) btnCam.className = 'btn btn-light fw-bold flex-fill border shadow-sm rounded-pill text-secondary';
            this.stopCameraScanner(); 
            setTimeout(() => { const input = document.getElementById('swal-barcode-input'); if(input) input.focus(); }, 120);
        } else {
            if (usbSec) usbSec.style.display = 'none'; if (camSec) camSec.style.display = 'block';
            if (btnCam) btnCam.className = 'btn btn-premium btn-premium-primary flex-fill';
            if (btnUsb) btnUsb.className = 'btn btn-light fw-bold flex-fill border shadow-sm rounded-pill text-secondary';
            this.startCameraScanner(); 
        }
    }

    loadScannerLibrary(callback) {
        if (window.Html5Qrcode) { callback(); return; }
        const existingScript = document.querySelector('script[src*="html5-qrcode"]');
        if (existingScript) { existingScript.addEventListener('load', () => callback()); return; }
        Swal.showLoading();
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/html5-qrcode';
        script.onload = () => { Swal.hideLoading(); callback(); };
        script.onerror = () => { Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถดาวน์โหลดซอฟต์แวร์สแกนเนอร์จากเครือข่ายได้', 'error'); };
        document.head.appendChild(script);
    }

    startCameraScanner() {
        this.loadScannerLibrary(async () => {
            if (this.html5QrCode) { try { if (this.html5QrCode.getState() === 2) await this.html5QrCode.stop(); this.html5QrCode.clear(); } catch(e) { } }
            this.#initCamera();
        });
    }

    #initCamera() {
        const reader = document.getElementById('camera-reader'); if (!reader) return;
        reader.innerHTML = ''; this.html5QrCode = new window.Html5Qrcode("camera-reader");
        
        const config = { 
            fps: 15, 
            qrbox: function(viewfinderWidth, viewFinderHeight) {
                let width = Math.floor(viewfinderWidth * 0.75); let height = Math.floor(viewFinderHeight * 0.35);
                if (width < 250) width = 250; if (height < 120) height = 120;
                return { width: width, height: height };
            },
            aspectRatio: 1.333334
        };
        
        this.html5QrCode.start({ facingMode: "environment" }, config,
            (decodedText) => {
                this.state.isScanningModalOpen = false; this.stopCameraScanner(); Swal.close();
                let scannedHN = decodedText.trim().replace(/\*/g, '');
                this.processBarcodeSearch(scannedHN);
            }, 
            (errorMessage) => { /* Ignore background errors */ }
        ).catch(err => {
            if (document.getElementById('camera-reader')) { 
                document.getElementById('camera-reader').innerHTML = '<div class="p-4 text-center text-white" style="font-family:\'Prompt\';"><i class="fa-solid fa-camera-slash fa-3x mb-3 text-danger safe-icon"></i><br><b class="fs-5">ไม่สามารถเข้าถึงกล้องถ่ายรูปได้</b></div>'; 
            }
        });
    }

    stopCameraScanner() {
        if (this.html5QrCode) {
            try { 
                if (this.html5QrCode.getState() === 2) { 
                    this.html5QrCode.stop().then(() => { this.html5QrCode.clear(); this.html5QrCode = null; }).catch(err => { this.html5QrCode = null; }); 
                } else { this.html5QrCode.clear(); this.html5QrCode = null; } 
            } catch (err) { this.html5QrCode = null; }
        }
    }

    processBarcodeSearch(scannedHN) {
        Swal.fire({ title: 'กำลังค้นหาแฟ้มประวัติ...', didOpen: () => Swal.showLoading(), customClass: { popup: 'premium-alert' } });
        setTimeout(() => {
            let foundPt = this.state.allData.find(p => String(p.hn).toLowerCase() === String(scannedHN).toLowerCase());
            if (foundPt) {
                Swal.fire({ title: 'พบข้อมูลผู้ป่วย!', html: `กำลังเปิดแฟ้มประวัติ EMR ของ<br><b class="text-primary fs-5" style="font-family:'Prompt';">${this.#escapeHTML(foundPt.name_th)}</b>`, icon: 'success', timer: 1500, showConfirmButton: false, customClass: { popup: 'premium-alert' } }).then(() => this.viewHistory(foundPt.hn));
            } else {
                Swal.fire({ title: 'ไม่พบข้อมูล!', html: `ไม่พบผู้ป่วยรหัส HN: <b class="text-danger">${this.#escapeHTML(scannedHN)}</b> ในระบบ`, icon: 'error', confirmButtonText: 'สแกนใหม่อีกครั้ง', confirmButtonColor: '#ef4444', customClass: { popup: 'premium-alert' } }).then(() => this.openScanner());
            }
        }, 600);
    }

    openAddForm() { App.switchPage('patient_form'); }
    viewHistory(hn) { App.switchPage('patient_history', null, hn); }
    
    editPatient(firebaseKey) { 
        App.switchPage('patient_form', null, { id: firebaseKey }); 
    }

    openExportModal() {
        if(typeof XLSX === 'undefined') {
            Swal.fire({title: 'ระบบขัดข้อง', text: 'ไม่พบไลบรารี SheetJS (กรุณารีเฟรชหน้าเว็บ)', icon: 'error', customClass: { popup: 'premium-alert' }});
            return;
        }

        let optionsHtml = '<option value="ALL">🌟 เลือกทุกสิทธิการรักษา (All Rights)</option>';
        this.state.clinicRights.forEach(r => {
            optionsHtml += `<option value="${this.#escapeHTML(r.name)}">${this.#escapeHTML(r.name)}</option>`;
        });

        let modalHtml = `
            <div class="text-start mt-3" style="font-family:'Sarabun';">
                <label class="form-label fw-bold text-secondary small">เลือกกรองตามสิทธิการรักษา:</label>
                <select id="swal-export-right" class="form-select input-modern fw-bold text-dark shadow-sm" style="font-size:16px;">
                    ${optionsHtml}
                </select>
                <div class="mt-3 p-3 bg-light rounded-3 border">
                    <small class="text-muted"><i class="fa-solid fa-circle-info text-primary me-1 safe-icon"></i> ระบบจะจัดเรียงข้อมูล ตกแต่งสีสันตาราง และกำหนดขนาดคอลัมน์ให้สวยงามอ่านง่ายโดยอัตโนมัติ</small>
                </div>
            </div>
        `;

        Swal.fire({
            title: '<h4 class="fw-bold text-success mb-0"><i class="fa-solid fa-file-excel me-2 safe-icon"></i> สรุปทะเบียนผู้ป่วย (Excel)</h4>',
            html: modalHtml,
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-download me-1 safe-icon"></i> ดาวน์โหลด Excel',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#10b981',
            customClass: { popup: 'premium-alert', confirmButton: 'btn-premium-swal btn-success-swal mx-2', cancelButton: 'btn-cancel-swal mx-2' },
            preConfirm: () => { return document.getElementById('swal-export-right').value; }
        }).then((result) => {
            if (result.isConfirmed) { this.executeExcelExport(result.value); }
        });
    }

    executeExcelExport(rightFilter) {
        Swal.fire({ title: 'กำลังประมวลผล Excel...', html: 'ระบบกำลังจัดรูปเล่มตาราง กรุณารอสักครู่', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }, customClass: { popup: 'premium-alert' } });
        
        setTimeout(() => {
            let filteredPatients = this.state.allData;
            if (rightFilter !== 'ALL') {
                filteredPatients = this.state.allData.filter(p => p.right === rightFilter);
            }
            
            if (filteredPatients.length === 0) {
                Swal.fire({title:'ไม่มีข้อมูล', text:`ไม่พบผู้ป่วยที่ใช้สิทธิ "${rightFilter}" ในระบบ`, icon:'warning', customClass: { popup: 'premium-alert' }});
                return;
            }

            let excelData = [];
            filteredPatients.forEach((p, index) => {
                excelData.push({
                    "ลำดับ": index + 1,
                    "รหัสผู้ป่วย (HN)": p.hn || "-",
                    "ชื่อ-นามสกุล": (p.title || '') + (p.name_th || '-'),
                    "วันเกิด": p.dob ? new Date(p.dob).toLocaleDateString('th-TH') : "-",
                    "อายุ (ปี)": p.age || "-",
                    "เลขประจำตัว ปชช.": p.idcard || p.cid || "-", 
                    "สิทธิการรักษา": p.right || "ไม่ระบุ",
                    "รอบเวรที่ฟอก": p.shift || "-",
                    "โรคติดต่อ": p.infection || "ไม่มี",
                    "กรุ๊ปเลือด": p.blood_type || "-",
                    "เบอร์โทรศัพท์": p.phone ? String(p.phone) : "-", 
                    "ผู้ติดต่อฉุกเฉิน": p.emergency_contact || "-",
                    "โรคประจำตัว": p.underlying_disease || "-",
                    "ประวัติแพ้ยา": p.allergy || "-",
                    "ที่อยู่": p.address || "-"
                });
            });

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const range = XLSX.utils.decode_range(worksheet['!ref']);
            for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cellAddress = { c: C, r: R };
                    const cellRef = XLSX.utils.encode_cell(cellAddress);
                    if (!worksheet[cellRef]) continue;

                    let cellStyle = {
                        border: {
                            top: { style: "thin", color: { rgb: "CBD5E1" } },
                            bottom: { style: "thin", color: { rgb: "CBD5E1" } },
                            left: { style: "thin", color: { rgb: "CBD5E1" } },
                            right: { style: "thin", color: { rgb: "CBD5E1" } }
                        },
                        font: { name: "Tahoma", sz: 10, color: { rgb: "334155" } },
                        alignment: { vertical: "center", horizontal: "left" }
                    };

                    if (R === 0) {
                        cellStyle.fill = { fgColor: { rgb: "2563EB" } }; 
                        cellStyle.font = { name: "Tahoma", sz: 11, color: { rgb: "FFFFFF" }, bold: true }; 
                        cellStyle.alignment = { horizontal: "center", vertical: "center" };
                    } else {
                        cellStyle.fill = { fgColor: (R % 2 !== 0) ? { rgb: "F8FAFC" } : { rgb: "FFFFFF" } }; 
                        if ([0, 1, 3, 4, 5, 7, 8, 9, 10].includes(C)) cellStyle.alignment.horizontal = "center";
                    }
                    worksheet[cellRef].s = cellStyle;
                }
            }

            const objectMaxLength = []; 
            for (let i = 0; i < excelData.length; i++) {
                const value = Object.values(excelData[i]);
                for (let j = 0; j < value.length; j++) {
                    if (typeof objectMaxLength[j] === 'undefined') objectMaxLength[j] = Object.keys(excelData[0])[j].length; 
                    const valLength = value[j] ? String(value[j]).length : 0;
                    if (valLength > objectMaxLength[j]) objectMaxLength[j] = valLength;
                }
            }
            
            worksheet['!cols'] = objectMaxLength.map(w => { return { width: Math.min(Math.max(w + 4, 10), 45) } });
            worksheet['!rows'] = [{ hpt: 30 }]; 

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "ทะเบียนผู้ป่วย");
            
            let fileName = rightFilter === 'ALL' ? "ทะเบียนผู้ป่วยทั้งหมด_Active" : "ทะเบียนผู้ป่วย_สิทธิ_" + rightFilter;
            XLSX.writeFile(workbook, fileName + "_" + new Date().toISOString().split('T')[0] + ".xlsx");
            Swal.fire({title:'ดาวน์โหลดสำเร็จ!', text:'ไฟล์ Excel ถูกตกแต่งและจัดเรียงอย่างสวยงามแล้ว', icon:'success', customClass: { popup: 'premium-alert' }});
        }, 800); 
    }

    async printOPDCard(hn) {
        if (!hn) return;
        
        Swal.fire({ 
            title: 'กำลังสร้างเลย์เอาต์บัตร OPD...', 
            text: 'รอสักครู่ (Bypassing Pop-up Blocker)', 
            allowOutsideClick: false, 
            didOpen: () => Swal.showLoading(), 
            customClass: { popup: 'premium-alert' } 
        });

        try {
            const [ptSnap, clinicSnap] = await Promise.all([ db.ref('patients_database_v2/patients').once('value'), db.ref('clinic_settings_v2').once('value') ]);
            const patients = ptSnap.val() ? (Array.isArray(ptSnap.val()) ? ptSnap.val() : Object.keys(ptSnap.val()).map(k => ptSnap.val()[k])) : [];
            const pt = patients.find(p => String(p.hn) === String(hn));
            
            if (!pt) { Swal.fire({title: 'ข้อผิดพลาด', text: 'ไม่พบข้อมูลผู้ป่วย', icon: 'error', customClass: { popup: 'premium-alert' }}); return; }

            const clinic = clinicSnap.val() || { clinic_name: 'DIALYSIS PRO CLINIC', phone: '-', address: '-', tax_id: '-' };

            let liveAddress = pt.address || 'ไม่ได้ระบุที่อยู่';
            let livePhone = pt.phone || '-';
            let liveEmergency = pt.emergency_contact || '-';

            const currentHnInput = document.getElementById('add_hn');
            if (currentHnInput && currentHnInput.value.replace(/^HN-?/i, '') === String(hn).replace(/^HN-?/i, '')) {
                const domAddress = document.getElementById('add_address')?.value.trim();
                if (domAddress) liveAddress = domAddress;
                
                const domPhone = document.getElementById('add_phone')?.value.trim();
                if (domPhone) livePhone = domPhone;

                const domEmergency = document.getElementById('add_emergency')?.value.trim();
                if (domEmergency) liveEmergency = domEmergency;
            }

            let imgSrc = pt.photo_base64 && typeof pt.photo_base64 === 'string' ? (pt.photo_base64.startsWith('data:image') ? pt.photo_base64 : 'data:image/jpeg;base64,' + pt.photo_base64) : '';
            let photoHtml = imgSrc ? `<img src="${imgSrc}" style="width: 100px; height: 120px; object-fit: cover; border-radius: 12px; border: 3px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); flex-shrink: 0;">` : `<div style="width: 100px; height: 120px; background: #f1f5f9; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; border: 3px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1); flex-shrink: 0;"><i class="fa-solid fa-user fa-2x mb-1"></i><span style="font-size:10px; font-weight:bold;">ติดรูปถ่าย</span></div>`;

            const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(pt.hn)}&scale=3&height=12&includetext=false`;

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>พิมพ์บัตร OPD - ${this.#escapeHTML(pt.hn)}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&family=Prompt:wght@400;600;700&display=swap" rel="stylesheet">
                    <style>
                        @page { size: A4 landscape; margin: 0; } 
                        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; box-sizing: border-box !important; }
                        body { background: #fff !important; margin: 0 !important; padding: 0 !important; font-family: 'Sarabun', sans-serif; }
                        
                        .opd-print-wrapper { width: 297mm; height: 209mm; display: flex; overflow: hidden; }
                        .page-half { width: 50%; height: 100%; padding: 12mm 15mm; position: relative; display: flex; flex-direction: column; } 
                        .fold-line { position: absolute; right: 0; top: 0; height: 100%; border-right: 2px dashed #cbd5e1; z-index: 10; } 
                        .fold-text { position: absolute; right: -12px; top: 15mm; background: #fff; color: #94a3b8; font-size: 10px; padding: 8px 0; font-family: 'Prompt'; writing-mode: vertical-rl; } 
                        
                        .back-cover { justify-content: flex-start; padding-right: 20mm; } 
                        .clinic-branding { margin-bottom: 20px; }
                        .clinic-branding h2 { font-family: 'Prompt'; color: #1e3a8a; margin: 0 0 10px 0; font-size: 22px; font-weight: 800; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; display: inline-block;} 
                        .clinic-info { color: #334155; font-size: 13px; line-height: 1.6; } 
                        .rules-box { background: #f8fafc; padding: 15px 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-top: 20px; } 
                        .rules-box h4 { font-family: 'Prompt'; color: #0f172a; margin: 0 0 10px 0; font-size: 14px; font-weight: bold; } 
                        .rules-box ul { font-size: 12px; color: #475569; padding-left: 20px; line-height: 1.6; margin: 0; } 
                        .rules-box li { margin-bottom: 6px; } 
                        .footer-note { text-align: center; color: #94a3b8; font-size: 9px; margin-top: auto; padding-top: 20px;} 
                        
                        .right-half { padding-left: 20mm; justify-content: center; } 
                        .front-cover { 
                            background: #ffffff; 
                            border-radius: 16px; 
                            padding: 0; 
                            box-shadow: 0 0 0 1px #cbd5e1; 
                            overflow: hidden; 
                            height: 100%; 
                            max-height: 180mm;
                            display: flex; 
                            flex-direction: column; 
                        } 
                        .header-banner { 
                            background: #1e3a8a !important; 
                            color: white !important; 
                            padding: 15px; 
                            text-align: center; 
                            border-bottom: 5px solid #3b82f6; 
                            flex-shrink: 0; 
                        } 
                        .header-banner h1 { font-family: 'Prompt'; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 1.5px; color: white !important; } 
                        .header-banner p { margin: 3px 0 0 0; font-size: 11px; opacity: 0.9; text-transform: uppercase; letter-spacing: 2px; color: white !important; } 
                        
                        .card-content { padding: 15px 20px; display: flex; flex-direction: column; flex: 1; overflow: hidden; } 
                        
                        .profile-section { display: flex; gap: 18px; align-items: center; flex-shrink: 0; margin-bottom: 15px; } 
                        .profile-info { flex: 1; } 
                        .hn-badge { display: inline-block; background: #eff6ff !important; color: #2563eb !important; padding: 5px 12px; border-radius: 8px; font-weight: 800; font-family: 'Prompt'; font-size: 16px; border: 1px solid #bfdbfe; margin-bottom: 6px; } 
                        .profile-info h2 { font-family: 'Prompt'; margin: 0 0 4px 0; font-size: 20px; font-weight: 800; color: #0f172a; } 
                        .profile-info .eng-name { color: #64748b; font-size: 12px; font-family: 'Prompt'; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;} 
                        .right-badge { display: inline-flex; align-items: center; background: #ecfdf5 !important; color: #10b981 !important; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 12px; } 
                        
                        .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; flex-shrink: 0; margin-bottom: 12px; } 
                        .info-box { background: #f8fafc !important; padding: 10px 12px; border-radius: 10px; border: 1px solid #e2e8f0; } 
                        .info-label { font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; margin-bottom: 3px; font-family: 'Prompt'; } 
                        .info-value { font-size: 13px; color: #0f172a; font-weight: 700; } 
                        
                        .address-box { 
                            grid-column: 1 / -1; 
                            background: #f0fdf4 !important; 
                            border: 1px dashed #86efac !important; 
                            padding: 10px 12px !important; 
                        }
                        
                        .alert-section { background: #fff; border: 2px solid #fecaca; border-radius: 10px; padding: 12px; margin-bottom: auto; flex-shrink: 0; } 
                        .alert-title { font-family: 'Prompt'; color: #b91c1c; font-size: 13px; font-weight: 800; margin: 0 0 8px 0; display: flex; align-items: center; } 
                        .alert-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; } 
                        .alert-item { background: #fef2f2 !important; padding: 8px 10px; border-radius: 8px; border: 1px solid #fecaca; } 
                        .alert-label { font-size: 9.5px; color: #b91c1c; font-weight: bold; margin-bottom: 2px; text-transform: uppercase;} 
                        .alert-value { font-size: 12px; color: #991b1b; font-weight: 800; } 
                        
                        .barcode-section { text-align: center; padding-top: 10px; border-top: 2px dashed #e2e8f0; flex-shrink: 0; margin-bottom: 0px; } 
                        .barcode-img { height: 40px; max-width: 100%; object-fit: contain; } 
                        .barcode-text { font-family: 'Prompt'; font-size: 11px; font-weight: bold; color: #64748b; letter-spacing: 2px; margin-top: 4px; }
                    }
                </style>
                </head>
                <body>
                    <div class="opd-print-wrapper">
                        <div class="page-half back-cover">
                            <div class="fold-line"><div class="fold-text">รอยพับกึ่งกลางกระดาษ (Fold Here)</div></div>
                            <div class="clinic-branding">
                                <h2>${this.#escapeHTML(clinic.clinic_name)}</h2>
                                <div class="clinic-info">
                                    <strong>ที่อยู่:</strong><br>${this.#escapeHTML(clinic.address)}<br><br>
                                    <strong>โทรศัพท์:</strong> ${this.#escapeHTML(clinic.phone)}<br><br>
                                    <strong>เลขประจำตัวผู้เสียภาษี:</strong> ${this.#escapeHTML(clinic.tax_id || '-')}<br><br>
                                    <strong>รหัสสถานพยาบาล:</strong> ${this.#escapeHTML(clinic.clinic_id || '-')}
                                </div>
                            </div>
                            <div class="rules-box">
                                <h4>ข้อปฏิบัติสำหรับผู้ป่วย</h4>
                                <ul>
                                    <li>กรุณานำบัตรประจำตัวผู้ป่วย (OPD Card) เล่มนี้มาด้วยทุกครั้งที่เข้ารับบริการฟอกเลือด</li>
                                    <li>กรุณามาก่อนเวลานัดหมายอย่างน้อย 15-30 นาที เพื่อเตรียมตัวและชั่งน้ำหนักก่อนฟอก</li>
                                    <li>หากไม่สามารถมาตามนัดได้ หรือต้องการเลื่อนคิว กรุณาโทรแจ้งล่วงหน้าอย่างน้อย 1 วัน</li>
                                    <li>แจ้งพยาบาลทันทีหากมีอาการผิดปกติ เช่น หอบเหนื่อย เจ็บหน้าอก หรือมีไข้</li>
                                </ul>
                            </div>
                            <div class="footer-note">พิมพ์จากระบบ Dialysis Pro EMR System (Engine v8.0) เมื่อ ${new Date().toLocaleDateString('th-TH')} เวลา ${new Date().toLocaleTimeString('th-TH')} น.</div>
                        </div>
                        <div class="page-half right-half">
                            <div class="front-cover">
                                <div class="header-banner">
                                    <h1>บัตรประจำตัวผู้ป่วย (OPD CARD)</h1>
                                    <p>Hemodialysis Patient Identification</p>
                                </div>
                                <div class="card-content">
                                    <div class="profile-section">
                                        ${photoHtml}
                                        <div class="profile-info">
                                            <div class="hn-badge">HN: ${this.#escapeHTML(pt.hn)}</div>
                                            <h2>${this.#escapeHTML(pt.title || '')}${this.#escapeHTML(pt.name_th)}</h2>
                                            <div class="eng-name">${this.#escapeHTML(pt.name_en ? pt.name_en.toUpperCase() : '-')}</div>
                                            <div class="right-badge">สิทธิ: ${this.#escapeHTML(pt.right || 'ไม่ระบุ')}</div>
                                        </div>
                                    </div>
                                    
                                    <div class="grid-info">
                                        <div class="info-box"><div class="info-label">เลขประจำตัว ปชช.</div><div class="info-value">${this.#escapeHTML(pt.idcard || pt.cid || '-')}</div></div>
                                        <div class="info-box"><div class="info-label">วันเกิด / อายุ</div><div class="info-value">${pt.dob ? new Date(pt.dob).toLocaleDateString('th-TH') : '-'} (${pt.age ? pt.age+' ปี' : '-'})</div></div>
                                        <div class="info-box"><div class="info-label">กรุ๊ปเลือด</div><div class="info-value text-danger" style="font-size:16px;">${this.#escapeHTML(pt.blood_type || '-')}</div></div>
                                        <div class="info-box"><div class="info-label">Dry Wt.</div><div class="info-value text-primary" style="font-size:16px;">${pt.dry_bw ? pt.dry_bw + ' Kg' : '-'}</div></div>
                                        
                                        <div class="info-box address-box" style="grid-column: 1 / -1; background: #eff6ff !important; border: 1px dashed #93c5fd !important; padding: 6px 10px !important; display: block !important;">
                                            <div class="info-label" style="color: #15803d;">ที่อยู่ปัจจุบัน / ข้อมูลติดต่อ</div>
                                            <div class="info-value" style="font-size: 11.5px; white-space: normal; line-height: 1.5;">
                                                ${this.#escapeHTML(liveAddress)} <br>
                                                <span style="color:#475569; font-weight: normal; font-size: 10.5px; display: inline-block; margin-top: 4px;">
                                                    โทร: <b style="color:#0f172a;">${this.#escapeHTML(livePhone)}</b> | 
                                                    ฉุกเฉิน: <b style="color:#dc2626;">${this.#escapeHTML(liveEmergency)}</b>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="alert-section">
                                        <div class="alert-title">ข้อมูลเฝ้าระวังทางการแพทย์</div>
                                        <div class="alert-grid">
                                            <div class="alert-item"><div class="alert-label">ประวัติแพ้ยา / แพ้อาหาร</div><div class="alert-value">${this.#escapeHTML(pt.allergy || 'ไม่มีประวัติแพ้')}</div></div>
                                            <div class="alert-item" style="background:#fffbeb !important; border-color:#fde68a !important;"><div class="alert-label" style="color:#b45309;">โรคติดต่อทางเลือด</div><div class="alert-value" style="color:#92400e;">${this.#escapeHTML(pt.infection || 'Negative')}</div></div>
                                        </div>
                                    </div>
                                    
                                    <div class="barcode-section">
                                        <img src="${barcodeUrl}" class="barcode-img" id="opd-barcode-img" alt="Barcode HN" onload="window.parent.postMessage('opdBarcodeReadyPremium', '*');">
                                        <div class="barcode-text">SCAN HN BARCODE</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <script>
                            window.onload = function() {
                                if (window.hasPrinted) return;
                                window.hasPrinted = true;
                                window.parent.postMessage('opdBarcodeReadyPremium', '*');
                            };
                            setTimeout(function() {
                                if (!window.hasPrinted) {
                                    window.hasPrinted = true;
                                    window.parent.postMessage('opdBarcodeReadyPremium', '*');
                                }
                            }, 3000);
                        </script>
                    </div>
                </body>
                </html>
            `;

            let oldIframe = document.getElementById('print-spooler-iframe-premium');
            if (oldIframe) oldIframe.remove();

            let iframe = document.createElement('iframe');
            iframe.id = 'print-spooler-iframe-premium';
            iframe.style.cssText = 'position: absolute; width: 0; height: 0; border: 0; visibility: hidden; z-index: -1; left: -9999px;';
            document.body.appendChild(iframe);

            const handlePrintMessage = (event) => {
                if (event.data === 'opdBarcodeReadyPremium') {
                    window.removeEventListener('message', handlePrintMessage);
                    Swal.close();
                    
                    setTimeout(() => {
                        try {
                            iframe.contentWindow.focus();
                            iframe.contentWindow.print();
                        } catch(e) {
                            console.error("Print Failed:", e);
                        }
                        setTimeout(() => iframe.remove(), 60000); 
                    }, 300);
                }
            };
            window.addEventListener('message', handlePrintMessage);

            let doc = iframe.contentWindow.document;
            doc.open();
            doc.write(htmlContent);
            doc.close();

        } catch (error) {
            console.error(error);
            Swal.fire({title:'ข้อผิดพลาด', text:'ไม่สามารถสร้างเอกสารเพื่อพิมพ์ได้', icon:'error', customClass: { popup: 'premium-alert' }});
        }
    }

    #escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
}

const PatientsPage = new PatientsPageComponent();
window.PatientsPage = PatientsPage;