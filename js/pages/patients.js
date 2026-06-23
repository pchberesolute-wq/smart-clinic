// js/pages/patients.js
// 🚀 โมดูลทะเบียนผู้ป่วย (Styled Excel Export Edition + Safe String Format)

const PatientsPage = {
    allData: [], 
    html5QrCode: null, 
    isScanningModalOpen: false,
    clinicRights: [],

    html: '<div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">' +
            '<div>' +
                '<h2 class="page-title text-dark" style="font-weight: 800;">' +
                    '<div class="d-inline-flex align-items-center justify-content-center rounded-4 shadow-sm me-2" style="width: 45px; height: 45px; background: var(--primary-gradient); color: white;">' +
                        '<i class="fa-solid fa-hospital-user"></i>' +
                    '</div>' +
                    'ทะเบียนผู้ป่วย <span class="text-muted fw-normal" style="font-size: 20px;">(Active Patients)</span>' +
                '</h2>' +
                '<p class="text-muted mt-2 mb-0 fw-bold" id="pt-count-text">กำลังซิงค์ข้อมูลจากระบบคลาวด์...</p>' +
            '</div>' +
            '<div class="d-flex gap-2 align-items-center flex-wrap">' +
                '<div class="search-box-modern shadow-sm" style="width: 320px;">' +
                    '<i class="fa-solid fa-search text-primary"></i>' +
                    '<input type="text" id="ptSearch" class="border-0 bg-transparent ms-2 w-100 fw-bold text-dark" placeholder="ค้นหา HN, ชื่อ, เลข ปชช..." style="outline: none; font-family:\'Prompt\';">' +
                '</div>' +
                '<button class="btn btn-success fw-bold shadow-sm rounded-pill px-4 text-white card-hover-float" onclick="PatientsPage.openExportModal()" title="ส่งออกทะเบียนผู้ป่วย">' +
                    '<i class="fa-solid fa-file-excel fa-lg me-2"></i> Export Excel' +
                '</button>' +
                '<button class="btn btn-dark fw-bold shadow-sm rounded-pill px-4 text-white card-hover-float" onclick="PatientsPage.openScanner()" title="สแกนบัตรผู้ป่วย">' +
                    '<i class="fa-solid fa-barcode fa-lg me-2 text-warning"></i> สแกนบาร์โค้ด' +
                '</button>' +
                '<button class="btn btn-premium btn-premium-primary px-4 card-hover-float" onclick="PatientsPage.openAddForm()">' +
                    '<i class="fas fa-user-plus me-2"></i> ลงทะเบียนใหม่' +
                '</button>' +
            '</div>' +
        '</div>' +
        '<div class="modern-panel shadow-sm p-4 position-relative overflow-hidden">' +
            '<div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 300px; pointer-events: none;"><i class="fa-solid fa-users-medical"></i></div>' +
            '<div class="table-responsive bg-white rounded-4 border border-light position-relative z-1 shadow-sm pb-2">' +
                '<table class="table table-premium w-100 mb-0">' +
                    '<thead>' +
                        '<tr>' +
                            '<th style="width: 25%;"><i class="fa-solid fa-id-card-clip text-primary me-2"></i> ผู้ป่วย (HN & ชื่อ)</th>' +
                            '<th style="width: 20%;"><i class="fa-solid fa-clock-rotate-left text-info me-2"></i> ข้อมูลเวร/ติดต่อ</th>' +
                            '<th style="width: 15%;"><i class="fa-solid fa-shield-heart text-success me-2"></i> สิทธิรักษา</th>' +
                            '<th style="width: 15%;"><i class="fa-solid fa-virus text-danger me-2"></i> ผลเลือด (Infection)</th>' +
                            '<th class="text-center" style="width: 10%;"><i class="fa-solid fa-chart-simple text-warning me-2"></i> สถานะ</th>' +
                            '<th class="text-center" style="width: 15%;"><i class="fa-solid fa-gears text-secondary me-2"></i> จัดการ</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody id="pt-table-body">' +
                        '<tr><td colspan="6" class="text-center py-5 text-primary"><i class="fas fa-spinner fa-spin fa-3x mb-3 drop-shadow"></i><br>กำลังดึงข้อมูลเวชระเบียน...</td></tr>' +
                    '</tbody>' +
                '</table>' +
            '</div>' +
        '</div>',

    init: function() {
        if (typeof db === 'undefined') return;

        db.ref('clinic_rights_v2').once('value').then(snap => {
            const data = snap.val();
            this.clinicRights = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
        });

        db.ref('patients_database_v2/patients').on('value', snap => {
            const data = snap.val();
            let rawPatients = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
            this.allData = rawPatients.filter(p => p !== null && (p.status || 'ปกติ') === 'ปกติ'); 
            
            const countText = document.getElementById('pt-count-text');
            if (countText) countText.innerText = 'พบรายชื่อผู้ป่วย (Active) ในระบบทั้งหมด ' + this.allData.length + ' ราย';
            this.renderTable(this.allData);
        });

        setTimeout(() => {
            const searchInput = document.getElementById('ptSearch');
            if (searchInput) {
                searchInput.addEventListener('keyup', (e) => {
                    const term = e.target.value.toLowerCase();
                    const filtered = this.allData.filter(p => 
                        (p.hn || "").toLowerCase().includes(term) || 
                        (p.name_th || "").toLowerCase().includes(term) || 
                        (p.idcard || "").toLowerCase().includes(term)
                    );
                    this.renderTable(filtered);
                });
            }
        }, 100);
    },

    renderTable: function(dataList) {
        const tbody = document.getElementById('pt-table-body');
        if (!tbody) return;

        if (dataList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-5 text-muted"><i class="fa-regular fa-folder-open fa-3x mb-3" style="opacity:0.2;"></i><br>ไม่พบข้อมูลผู้ป่วยในระบบ</td></tr>';
            return;
        }

        let html = "";
        dataList.forEach(p => {
            let statusBadge = '<span class="badge bg-success px-3 py-2 rounded-pill shadow-sm" style="font-size:12px;">ปกติ (Active)</span>';
            
            let infHtml = '<span class="badge bg-light text-secondary border px-3 py-2 rounded-pill shadow-sm" style="font-size:11px;">ปลอดภัย</span>';
            let inf = p.infection || "ไม่มี";
            if (inf === "HCV") infHtml = '<span class="badge bg-warning text-dark px-3 py-2 shadow-sm rounded-pill" style="font-size:11px;"><i class="fa-solid fa-virus me-1"></i> HCV +</span>';
            if (inf === "HIV") infHtml = '<span class="badge bg-danger px-3 py-2 shadow-sm rounded-pill" style="font-size:11px;"><i class="fa-solid fa-virus me-1"></i> HIV +</span>';
            if (inf === "HBV") infHtml = '<span class="badge bg-warning text-dark px-3 py-2 shadow-sm rounded-pill" style="font-size:11px;"><i class="fa-solid fa-virus me-1"></i> HBV +</span>';

            let imgSrc = p.photo_base64 ? (p.photo_base64.startsWith('data:image') ? p.photo_base64 : 'data:image/jpeg;base64,' + p.photo_base64) : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(p.name_th||'X') + '&background=3b82f6&color=fff&bold=true';
            let fullName = (p.title || '') + (p.name_th || 'ไม่ระบุชื่อ');

            html += '<tr class="card-hover-float" style="cursor: pointer;">' +
                '<td onclick="PatientsPage.viewHistory(\'' + p.hn + '\')">' +
                    '<div class="d-flex align-items-center">' +
                        '<img src="' + imgSrc + '" class="me-3 shadow-sm border border-3 border-white" style="width: 55px; height: 55px; border-radius: 14px; object-fit: cover;">' +
                        '<div>' +
                            '<div class="fw-bold text-dark" style="font-size:15.5px; font-family:\'Prompt\';">' + fullName + '</div>' +
                            '<div class="text-primary fw-bold mt-1" style="font-size:13px;"><i class="fa-solid fa-id-card me-1"></i> ' + (p.hn || '-') + ' <span class="ms-2 text-muted fw-normal">| อายุ: ' + (p.age || '-') + '</span></div>' +
                        '</div>' +
                    '</div>' +
                '</td>' +
                '<td onclick="PatientsPage.viewHistory(\'' + p.hn + '\')">' +
                    '<div class="fw-bold text-dark" style="font-size:14px;"><i class="fa-solid fa-clock text-info me-2"></i> ' + (p.shift || 'ไม่ได้ระบุเวร') + '</div>' +
                    '<div class="text-muted fw-bold mt-2" style="font-size:12px;"><i class="fa-solid fa-phone text-secondary me-2"></i> ' + (p.phone || '-') + '</div>' +
                '</td>' +
                '<td class="fw-bold text-secondary" onclick="PatientsPage.viewHistory(\'' + p.hn + '\')" style="font-size:14px;">' + (p.right || '-') + '</td>' +
                '<td onclick="PatientsPage.viewHistory(\'' + p.hn + '\')">' + infHtml + '</td>' +
                '<td class="text-center" onclick="PatientsPage.viewHistory(\'' + p.hn + '\')">' + statusBadge + '</td>' +
                '<td class="text-center">' +
                    '<div class="d-flex justify-content-center gap-2">' +
                        '<button class="btn btn-sm btn-primary shadow-sm" style="border-radius:10px; width:34px; height:34px; padding:0;" onclick="event.stopPropagation(); PatientsPage.viewHistory(\'' + p.hn + '\')" title="แฟ้มประวัติ (EMR)"><i class="fa-solid fa-folder-open"></i></button>' +
                        '<button class="btn btn-sm btn-warning text-dark shadow-sm" style="border-radius:10px; width:34px; height:34px; padding:0;" onclick="event.stopPropagation(); PatientsPage.editPatient(\'' + p.hn + '\')" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>' +
                        '<button class="btn btn-sm btn-info text-white shadow-sm" style="border-radius:10px; width:34px; height:34px; padding:0;" onclick="event.stopPropagation(); PatientsPage.printOPDCard(\'' + p.hn + '\')" title="พิมพ์บัตร OPD"><i class="fa-solid fa-print"></i></button>' +
                    '</div>' +
                '</td>' +
            '</tr>';
        });
        tbody.innerHTML = html;
    },

    openExportModal: function() {
        if(typeof XLSX === 'undefined') {
            Swal.fire('ระบบขัดข้อง', 'ไม่พบไลบรารี SheetJS (กรุณารีเฟรชหน้าเว็บ)', 'error');
            return;
        }

        let optionsHtml = '<option value="ALL">🌟 เลือกทุกสิทธิการรักษา (All Rights)</option>';
        this.clinicRights.forEach(r => {
            optionsHtml += '<option value="' + r.name + '">' + r.name + '</option>';
        });

        let modalHtml = '<div class="text-start mt-3" style="font-family:\'Sarabun\';">' +
            '<label class="form-label fw-bold text-secondary small">เลือกกรองตามสิทธิการรักษา:</label>' +
            '<select id="swal-export-right" class="form-select input-modern fw-bold text-dark shadow-sm" style="font-size:16px;">' +
                optionsHtml +
            '</select>' +
            '<div class="mt-3 p-3 bg-light rounded-3 border">' +
                '<small class="text-muted"><i class="fa-solid fa-circle-info text-primary me-1"></i> ระบบจะจัดเรียงข้อมูล ตกแต่งสีสันตาราง และกำหนดขนาดคอลัมน์ให้สวยงามอ่านง่ายโดยอัตโนมัติ</small>' +
            '</div>' +
        '</div>';

        Swal.fire({
            title: '<h4 class="fw-bold text-success mb-0"><i class="fa-solid fa-file-excel me-2"></i> สรุปทะเบียนผู้ป่วย (Excel)</h4>',
            html: modalHtml,
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-download me-1"></i> ดาวน์โหลด Excel',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#10b981',
            preConfirm: () => { return document.getElementById('swal-export-right').value; }
        }).then((result) => {
            if (result.isConfirmed) { this.executeExcelExport(result.value); }
        });
    },

    // 🌟 [EXCEL STYLING ALGORITHM]: อัลกอริทึมจัดทำไฟล์ Excel สีสันจัดเต็ม
    executeExcelExport: function(rightFilter) {
        Swal.fire({ title: 'กำลังประมวลผล Excel...', html: 'ระบบกำลังจัดรูปเล่มตาราง กรุณารอสักครู่', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
        
        setTimeout(() => {
            let filteredPatients = this.allData;
            if (rightFilter !== 'ALL') {
                filteredPatients = this.allData.filter(p => p.right === rightFilter);
            }
            
            if (filteredPatients.length === 0) {
                Swal.fire('ไม่มีข้อมูล', 'ไม่พบผู้ป่วยที่ใช้สิทธิ "' + rightFilter + '" ในระบบ', 'warning');
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

            // สร้าง Worksheet
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // 🎨 1. Apply Styles (ใช้ xlsx-js-style API)
            const range = XLSX.utils.decode_range(worksheet['!ref']);
            for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cellAddress = { c: C, r: R };
                    const cellRef = XLSX.utils.encode_cell(cellAddress);
                    if (!worksheet[cellRef]) continue;

                    // กำหนดขอบมาตรฐาน และฟอนต์ Tahoma ทุกช่อง
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

                    // Header Row (R=0)
                    if (R === 0) {
                        cellStyle.fill = { fgColor: { rgb: "2563EB" } }; // พื้นหลังสีน้ำเงินเข้ม
                        cellStyle.font = { name: "Tahoma", sz: 11, color: { rgb: "FFFFFF" }, bold: true }; // ตัวอักษรสีขาว หนา
                        cellStyle.alignment = { horizontal: "center", vertical: "center" };
                    } 
                    // Data Rows (R>0)
                    else {
                        // สลับสีบรรทัด (Zebra stripe)
                        if (R % 2 !== 0) {
                            cellStyle.fill = { fgColor: { rgb: "F8FAFC" } }; // พื้นเทาอ่อน
                        } else {
                            cellStyle.fill = { fgColor: { rgb: "FFFFFF" } }; // พื้นขาว
                        }
                        // จัดกึ่งกลางสำหรับคอลัมน์ ลำดับ, HN, อายุ, ปชช, เวร, โรคติดต่อ, กรุ๊ปเลือด, เบอร์โทร
                        if ([0, 1, 3, 4, 5, 7, 8, 9, 10].includes(C)) {
                            cellStyle.alignment.horizontal = "center";
                        }
                    }
                    
                    worksheet[cellRef].s = cellStyle;
                }
            }

            // 📏 2. Auto-Fit Columns Width
            const objectMaxLength = []; 
            for (let i = 0; i < excelData.length; i++) {
                const value = Object.values(excelData[i]);
                for (let j = 0; j < value.length; j++) {
                    if (typeof objectMaxLength[j] === 'undefined') {
                        objectMaxLength[j] = Object.keys(excelData[0])[j].length; // คำนวณจากชื่อ Header ด้วย
                    }
                    const valLength = value[j] ? String(value[j]).length : 0;
                    if (valLength > objectMaxLength[j]) {
                        objectMaxLength[j] = valLength;
                    }
                }
            }
            
            // จำกัดความกว้างไม่ให้แคบไปหรือกว้างไป (Min 10, Max 45) + เผื่อ Padding อีก 4
            const wscols = objectMaxLength.map(w => { return { width: Math.min(Math.max(w + 4, 10), 45) } });
            worksheet['!cols'] = wscols;

            // 📐 3. Header Row Height
            worksheet['!rows'] = [{ hpt: 30 }]; // ให้แถวหัวตารางสูง 30 (ดูอลังการขึ้น)

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "ทะเบียนผู้ป่วย");
            
            let fileName = rightFilter === 'ALL' ? "ทะเบียนผู้ป่วยทั้งหมด_Active" : "ทะเบียนผู้ป่วย_สิทธิ_" + rightFilter;
            fileName += "_" + new Date().toISOString().split('T')[0] + ".xlsx";

            XLSX.writeFile(workbook, fileName);
            Swal.fire('ดาวน์โหลดสำเร็จ!', 'ไฟล์ Excel ถูกตกแต่งและจัดเรียงอย่างสวยงามแล้ว', 'success');

        }, 800); 
    },

    openAddForm: function() { App.switchPage('patient_form'); },
    viewHistory: function(hn) { App.switchPage('patient_history', null, hn); },
    editPatient: function(hn) { App.switchPage('patient_form', null, hn); },

    loadScannerLibrary: function(callback) {
        if (window.Html5Qrcode) { callback(); return; }
        Swal.showLoading();
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/html5-qrcode';
        script.onload = () => { Swal.hideLoading(); callback(); };
        document.head.appendChild(script);
    },

    openScanner: function() {
        this.isScanningModalOpen = true;

        let scannerHtml = '<div class="d-flex justify-content-center gap-2 mb-3 mt-3">' +
            '<button id="btn-scan-usb" class="btn btn-premium btn-premium-primary flex-fill" onclick="PatientsPage.switchScanMode(\'usb\')"><i class="fa-solid fa-gun me-2"></i> ปืนสแกน (USB)</button>' +
            '<button id="btn-scan-cam" class="btn btn-light fw-bold flex-fill border shadow-sm rounded-pill text-secondary" onclick="PatientsPage.switchScanMode(\'cam\')"><i class="fa-solid fa-mobile-screen-button me-2"></i> กล้องมือถือ</button>' +
        '</div>' +
        '<div id="swal-usb-scanner" style="display: block;">' +
            '<p class="text-muted small mb-3">โปรดตรวจสอบให้แน่ใจว่าแป้นพิมพ์เป็น <b class="text-primary">ภาษาอังกฤษ (EN)</b></p>' +
            '<input type="text" id="swal-barcode-input" class="form-control form-control-lg text-center fw-bold text-primary shadow-sm input-modern" placeholder="ยิงบาร์โค้ดลงในช่องนี้..." autocomplete="off" style="font-size: 20px; letter-spacing: 2px;">' +
        '</div>' +
        '<div id="swal-cam-scanner" style="display: none;">' +
            '<div id="camera-reader" class="border rounded-4 overflow-hidden shadow-sm bg-dark d-flex align-items-center justify-content-center" style="width: 100%; min-height: 250px;">' +
                '<i class="fa-solid fa-camera fa-2x text-secondary"></i>' +
            '</div>' +
            '<p class="text-muted small mt-3 mb-0">อนุญาตให้เข้าถึงกล้องและส่องที่บาร์โค้ด</p>' +
        '</div>';

        Swal.fire({
            title: '<h4 class="fw-bold mb-0 text-dark" style="font-family:\'Prompt\';"><i class="fa-solid fa-expand me-2 text-primary"></i>สแกนบาร์โค้ดบัตรผู้ป่วย</h4>',
            html: scannerHtml,
            showConfirmButton: false, showCancelButton: true, cancelButtonText: 'ปิดหน้าต่าง',
            didOpen: () => {
                const input = document.getElementById('swal-barcode-input');
                if(input) input.focus();
                
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        let scannedHN = input.value.trim().replace(/\*/g, '');
                        if (scannedHN) { 
                            this.isScanningModalOpen = false;
                            Swal.close(); 
                            PatientsPage.processBarcodeSearch(scannedHN); 
                        }
                    }
                });
                
                input.addEventListener('blur', () => {
                    if (!this.isScanningModalOpen) return; 
                    const usbDiv = document.getElementById('swal-usb-scanner');
                    if(usbDiv && usbDiv.style.display === 'block') {
                        setTimeout(() => {
                            const currentInput = document.getElementById('swal-barcode-input');
                            if(currentInput && this.isScanningModalOpen) currentInput.focus();
                        }, 100);
                    }
                });
            },
            willClose: () => { this.isScanningModalOpen = false; this.stopCameraScanner(); }
        });
    },

    switchScanMode: function(mode) {
        const usbSec = document.getElementById('swal-usb-scanner'); const camSec = document.getElementById('swal-cam-scanner');
        const btnUsb = document.getElementById('btn-scan-usb'); const btnCam = document.getElementById('btn-scan-cam');

        if (mode === 'usb') {
            camSec.style.display = 'none'; usbSec.style.display = 'block';
            btnUsb.className = 'btn btn-premium btn-premium-primary flex-fill';
            btnCam.className = 'btn btn-light fw-bold flex-fill border shadow-sm rounded-pill text-secondary';
            this.stopCameraScanner();
            setTimeout(() => { const input = document.getElementById('swal-barcode-input'); if(input) input.focus(); }, 100);
        } else {
            usbSec.style.display = 'none'; camSec.style.display = 'block';
            btnCam.className = 'btn btn-premium btn-premium-primary flex-fill';
            btnUsb.className = 'btn btn-light fw-bold flex-fill border shadow-sm rounded-pill text-secondary';
            this.startCameraScanner();
        }
    },

    startCameraScanner: function() {
        this.loadScannerLibrary(() => {
            if (this.html5QrCode) {
                try { if (this.html5QrCode.getState() === 2) { this.html5QrCode.stop().then(() => { this.html5QrCode.clear(); this.initCamera(); }).catch(e => { this.initCamera(); }); } else { this.initCamera(); } } catch(e) { this.initCamera(); }
            } else { this.initCamera(); }
        });
    },

    initCamera: function() {
        const reader = document.getElementById('camera-reader'); if (!reader) return;
        reader.innerHTML = ''; this.html5QrCode = new Html5Qrcode("camera-reader");
        const config = { fps: 10, qrbox: { width: 250, height: 100 } };
        
        this.html5QrCode.start({ facingMode: "environment" }, config,
            (decodedText) => {
                this.isScanningModalOpen = false; this.stopCameraScanner(); Swal.close();
                let scannedHN = decodedText.trim().replace(/\*/g, '');
                this.processBarcodeSearch(scannedHN);
            }, (errorMessage) => { }
        ).catch(err => {
            if (document.getElementById('camera-reader')) { document.getElementById('camera-reader').innerHTML = '<div class="p-4 text-center"><i class="fa-solid fa-camera-slash fa-3x mb-2 text-danger"></i><br><b class="text-white">ไม่สามารถเปิดกล้องได้</b></div>'; }
        });
    },

    stopCameraScanner: function() {
        if (this.html5QrCode) {
            try { if (this.html5QrCode.getState() === 2) { this.html5QrCode.stop().then(() => { this.html5QrCode.clear(); this.html5QrCode = null; }).catch(err => { this.html5QrCode = null; }); } else { this.html5QrCode.clear(); this.html5QrCode = null; } } catch (err) { this.html5QrCode = null; }
        }
    },

    processBarcodeSearch: function(scannedHN) {
        Swal.fire({ title: 'กำลังค้นหาแฟ้มประวัติ...', didOpen: () => Swal.showLoading() });
        setTimeout(() => {
            let foundPt = this.allData.find(p => p.hn.toLowerCase() === scannedHN.toLowerCase());
            if (foundPt) {
                Swal.fire({ title: 'พบข้อมูลผู้ป่วย!', html: 'กำลังเปิดแฟ้มประวัติ EMR ของ<br><b class="text-primary fs-5" style="font-family:\'Prompt\';">' + foundPt.name_th + '</b>', icon: 'success', timer: 1500, showConfirmButton: false }).then(() => this.viewHistory(foundPt.hn));
            } else {
                Swal.fire({ title: 'ไม่พบข้อมูล!', html: 'ไม่พบผู้ป่วยรหัส HN: <b class="text-danger">' + scannedHN + '</b> ในระบบ<br><span class="small text-muted">โปรดตรวจสอบรหัสบาร์โค้ด หรือลงทะเบียนผู้ป่วยใหม่</span>', icon: 'error', confirmButtonText: '<i class="fa-solid fa-rotate-right me-2"></i> สแกนใหม่อีกครั้ง', confirmButtonColor: '#ef4444' }).then(() => this.openScanner());
            }
        }, 600);
    },

    printOPDCard: async function(hn) {
        if (!hn) return;
        Swal.fire({ title: 'กำลังสร้างบัตรประจำตัวผู้ป่วย (OPD Card)...', didOpen: () => Swal.showLoading() });

        try {
            const [ptSnap, clinicSnap] = await Promise.all([ db.ref('patients_database_v2/patients').once('value'), db.ref('clinic_settings_v2').once('value') ]);
            const patients = ptSnap.val() ? (Array.isArray(ptSnap.val()) ? ptSnap.val() : Object.keys(ptSnap.val()).map(k => ptSnap.val()[k])) : [];
            const pt = patients.find(p => p.hn === hn);
            if (!pt) { Swal.fire('ข้อผิดพลาด', 'ไม่พบข้อมูลผู้ป่วย', 'error'); return; }

            const clinic = clinicSnap.val() || { clinic_name: 'DIALYSIS PRO CLINIC', phone: '-', address: '-', tax_id: '-' };

            let imgSrc = pt.photo_base64 ? (pt.photo_base64.startsWith('data:image') ? pt.photo_base64 : 'data:image/jpeg;base64,' + pt.photo_base64) : '';
            let photoHtml = imgSrc ? '<img src="' + imgSrc + '" style="width: 100px; height: 120px; object-fit: cover; border-radius: 12px; border: 3px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">' : '<div style="width: 100px; height: 120px; background: #f1f5f9; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; border: 3px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"><i class="fa-solid fa-user fa-2x mb-1"></i><span style="font-size:10px; font-weight:bold;">ติดรูปถ่าย</span></div>';

            const barcodeUrl = 'https://bwipjs-api.metafloor.com/?bcid=code128&text=' + encodeURIComponent(pt.hn) + '&scale=3&height=12&includetext=false';

            const printContent = '<html>' +
                '<head>' +
                    '<title>OPD Card - ' + pt.name_th + '</title>' +
                    '<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;600;700&family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">' +
                    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">' +
                    '<style>' +
                        '@page { size: A4 landscape; margin: 0; } ' +
                        'body { margin: 0; padding: 0; font-family: \'Sarabun\', sans-serif; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; width: 297mm; height: 209mm; display: flex; box-sizing: border-box; overflow: hidden; } ' +
                        '* { box-sizing: border-box; } ' +
                        '.page-half { width: 50%; height: 100%; padding: 12mm; position: relative; display: flex; flex-direction: column; } ' +
                        '.fold-line { position: absolute; right: 0; top: 0; height: 100%; border-right: 2px dashed #cbd5e1; z-index: 10; } ' +
                        '.fold-text { position: absolute; right: -12px; top: 15mm; background: #fff; color: #94a3b8; font-size: 10px; padding: 8px 0; font-family: \'Prompt\'; writing-mode: vertical-rl; } ' +
                        '.back-cover { justify-content: space-between; padding-right: 18mm; } ' +
                        '.clinic-branding h2 { font-family: \'Prompt\'; color: #2563eb; margin: 0 0 10px 0; font-size: 20px; } ' +
                        '.clinic-info { color: #475569; font-size: 13px; line-height: 1.6; } ' +
                        '.rules-box { background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; } ' +
                        '.rules-box h4 { font-family: \'Prompt\'; color: #0f172a; margin: 0 0 8px 0; font-size: 14px; display: flex; align-items: center; gap: 8px; } ' +
                        '.rules-box ul { font-size: 12px; color: #475569; padding-left: 20px; line-height: 1.6; margin: 0; } ' +
                        '.rules-box li { margin-bottom: 5px; } ' +
                        '.footer-note { text-align: center; color: #94a3b8; font-size: 10px; margin-top: auto; } ' +
                        '.right-half { padding-left: 18mm; } ' +
                        '.front-cover { background: #ffffff; border-radius: 20px; padding: 0; box-shadow: inset 0 0 0 1px #e2e8f0; border: 1px solid #cbd5e1; overflow: hidden; height: 100%; display: flex; flex-direction: column; } ' +
                        '.header-banner { background: #2563eb; color: white; padding: 12px 15px; text-align: center; border-bottom: 4px solid #1e3a8a; } ' +
                        '.header-banner h1 { font-family: \'Prompt\'; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 1px; } ' +
                        '.header-banner p { margin: 3px 0 0 0; font-size: 11px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; } ' +
                        '.card-content { padding: 15px 20px; display: flex; flex-direction: column; flex: 1; } ' +
                        '.profile-section { display: flex; gap: 15px; align-items: flex-start; margin-bottom: 15px; } ' +
                        '.profile-info { flex: 1; } ' +
                        '.hn-badge { display: inline-block; background: #eff6ff; color: #2563eb; padding: 5px 10px; border-radius: 8px; font-weight: 800; font-family: \'Prompt\'; font-size: 16px; border: 1px solid #bfdbfe; margin-bottom: 6px; } ' +
                        '.profile-info h2 { font-family: \'Prompt\'; margin: 0 0 3px 0; font-size: 20px; color: #0f172a; } ' +
                        '.profile-info .eng-name { color: #64748b; font-size: 12px; font-family: \'Prompt\'; margin-bottom: 8px; } ' +
                        '.right-badge { display: inline-flex; align-items: center; gap: 6px; background: #ecfdf5; color: #10b981; border: 1px solid #a7f3d0; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 12px; } ' +
                        '.grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; } ' +
                        '.info-box { background: #f8fafc; padding: 10px; border-radius: 10px; border: 1px solid #e2e8f0; } ' +
                        '.info-label { font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; margin-bottom: 3px; font-family: \'Prompt\'; } ' +
                        '.info-value { font-size: 13px; color: #0f172a; font-weight: 700; } ' +
                        '.alert-section { background: #fff; border: 2px solid #fecaca; border-radius: 12px; padding: 12px; margin-bottom: auto; position: relative; overflow: hidden; } ' +
                        '.alert-section::before { content: \'\'; position: absolute; left: 0; top: 0; height: 100%; width: 5px; background: #ef4444; } ' +
                        '.alert-title { font-family: \'Prompt\'; color: #b91c1c; font-size: 13px; font-weight: bold; margin: 0 0 8px 0; display: flex; align-items: center; gap: 8px; } ' +
                        '.alert-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; } ' +
                        '.alert-item { background: #fef2f2; padding: 8px; border-radius: 6px; border: 1px solid #fecaca; } ' +
                        '.alert-label { font-size: 9px; color: #b91c1c; font-weight: bold; margin-bottom: 2px; } ' +
                        '.alert-value { font-size: 12px; color: #991b1b; font-weight: bold; } ' +
                        '.barcode-section { text-align: center; margin-top: 10px; padding-top: 10px; border-top: 2px dashed #e2e8f0; } ' +
                        '.barcode-img { height: 42px; max-width: 100%; object-fit: contain; } ' +
                        '.barcode-text { font-family: \'Prompt\'; font-size: 11px; font-weight: bold; color: #64748b; letter-spacing: 1px; margin-top: 4px; } ' +
                    '</style>' +
                '</head>' +
                '<body>' +
                    '<div class="page-half back-cover">' +
                        '<div class="fold-line"><div class="fold-text">รอยพับกึ่งกลางกระดาษ (Fold Here)</div></div>' +
                        '<div class="clinic-branding">' +
                            '<h2><i class="fa-solid fa-hospital"></i> ' + clinic.clinic_name + '</h2>' +
                            '<div class="clinic-info">' +
                                '<strong><i class="fa-solid fa-location-dot me-2"></i> ที่อยู่:</strong> ' + clinic.address + '<br><br>' +
                                '<strong><i class="fa-solid fa-phone me-2"></i> โทรศัพท์:</strong> ' + clinic.phone + '<br><br>' +
                                '<strong><i class="fa-solid fa-file-invoice-dollar me-2"></i> เลขประจำตัวผู้เสียภาษี:</strong> ' + (clinic.tax_id || '-') + '<br><br>' +
                                '<strong><i class="fa-solid fa-hashtag me-2"></i> รหัสสถานพยาบาล:</strong> ' + (clinic.clinic_id || '-') +
                            '</div>' +
                        '</div>' +
                        '<div class="rules-box">' +
                            '<h4><i class="fa-solid fa-bell text-warning"></i> ข้อปฏิบัติสำหรับผู้ป่วย</h4>' +
                            '<ul>' +
                                '<li>กรุณานำบัตรประจำตัวผู้ป่วย (OPD Card) เล่มนี้มาด้วยทุกครั้งที่เข้ารับบริการฟอกเลือด</li>' +
                                '<li>กรุณามาก่อนเวลานัดหมายอย่างน้อย 15-30 นาที เพื่อเตรียมตัวและชั่งน้ำหนักก่อนฟอก</li>' +
                                '<li>หากไม่สามารถมาตามนัดได้ หรือต้องการเลื่อนคิว กรุณาโทรแจ้งล่วงหน้าอย่างน้อย 1 วัน</li>' +
                                '<li>แจ้งพยาบาลทันทีหากมีอาการผิดปกติ เช่น หอบเหนื่อย เจ็บหน้าอก หรือมีไข้</li>' +
                            '</ul>' +
                        '</div>' +
                        '<div class="footer-note">พิมพ์จากระบบ Dialysis Pro EMR System เมื่อ ' + new Date().toLocaleDateString('th-TH') + ' เวลา ' + new Date().toLocaleTimeString('th-TH') + ' น.</div>' +
                    '</div>' +
                    '<div class="page-half right-half">' +
                        '<div class="front-cover">' +
                            '<div class="header-banner">' +
                                '<h1>บัตรประจำตัวผู้ป่วย (OPD CARD)</h1>' +
                                '<p>Hemodialysis Patient Identification</p>' +
                            '</div>' +
                            '<div class="card-content">' +
                                '<div class="profile-section">' +
                                    photoHtml +
                                    '<div class="profile-info">' +
                                        '<div class="hn-badge">HN: ' + pt.hn + '</div>' +
                                        '<h2>' + (pt.title || '') + pt.name_th + '</h2>' +
                                        '<div class="eng-name">' + (pt.name_en ? pt.name_en.toUpperCase() : '-') + '</div>' +
                                        '<div class="right-badge"><i class="fa-solid fa-shield-heart"></i> สิทธิ: ' + (pt.right || 'ไม่ระบุ') + '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="grid-info">' +
                                    '<div class="info-box"><div class="info-label">เลขประจำตัว ปชช.</div><div class="info-value">' + (pt.idcard || pt.cid || '-') + '</div></div>' +
                                    '<div class="info-box"><div class="info-label">วันเกิด / อายุ</div><div class="info-value">' + (pt.dob ? new Date(pt.dob).toLocaleDateString('th-TH') : '-') + ' (' + (pt.age ? pt.age+' ปี' : '-') + ')</div></div>' +
                                    '<div class="info-box"><div class="info-label">กรุ๊ปเลือด</div><div class="info-value text-danger" style="font-size:15px;">' + (pt.blood_type || '-') + '</div></div>' +
                                    '<div class="info-box"><div class="info-label">Dry Wt.</div><div class="info-value text-primary" style="font-size:15px;">' + (pt.dry_bw ? pt.dry_bw + ' Kg' : '-') + '</div></div>' +
                                '</div>' +
                                '<div class="alert-section">' +
                                    '<div class="alert-title"><i class="fa-solid fa-triangle-exclamation"></i> ข้อมูลเฝ้าระวังทางการแพทย์</div>' +
                                    '<div class="alert-grid">' +
                                        '<div class="alert-item">' +
                                            '<div class="alert-label">ประวัติแพ้ยา / แพ้อาหาร</div>' +
                                            '<div class="alert-value">' + (pt.allergy || 'ไม่มีประวัติแพ้') + '</div>' +
                                        '</div>' +
                                        '<div class="alert-item" style="background:#fffbeb; border-color:#fde68a;">' +
                                            '<div class="alert-label" style="color:#b45309;">โรคติดต่อทางเลือด</div>' +
                                            '<div class="alert-value" style="color:#92400e;">' + (pt.infection || 'Negative') + '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="barcode-section">' +
                                    '<img src="' + barcodeUrl + '" class="barcode-img" alt="Barcode HN" onload="window.parent.postMessage(\'barcodeLoaded\', \'*\');">' +
                                    '<div class="barcode-text">SCAN HN BARCODE</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</body>' +
                '</html>';

            const printWin = window.open('', '_blank');
            printWin.document.open();
            printWin.document.write(printContent);
            printWin.document.close();

            window.addEventListener('message', function printListener(event) {
                if (event.data === 'barcodeLoaded') {
                    window.removeEventListener('message', printListener);
                    Swal.close(); printWin.print();
                }
            });
            setTimeout(() => { Swal.close(); printWin.print(); }, 2000);
        } catch (error) {
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถสร้างเอกสารเพื่อพิมพ์ได้', 'error');
        }
    }
};