// js/pages/patient_form.js
// 🚀 โมดูลฟอร์มลงทะเบียนและแก้ไขข้อมูลผู้ป่วย (Real-time Rights Sync Edition)

const PatientFormPage = {
    scannedPhotoBase64: null,
    isEditMode: false,
    editOriginalData: null,
    clinicRights: [], // 🌟 ตัวแปรเก็บ Master Data สิทธิการรักษา

    html: `
        <style>
            .form-icon-group .input-group-text { background: var(--bg-main); border-right: none; color: var(--muted); border-color: #cbd5e1; border-radius: var(--radius-md) 0 0 var(--radius-md); transition: all 0.3s ease; }
            .form-icon-group .form-control { border-left: none; padding-left: 0; border-radius: 0 var(--radius-md) var(--radius-md) 0; box-shadow: none; border-color: #cbd5e1; }
            .form-icon-group .form-control:focus { border-color: #cbd5e1; }
            .form-icon-group:focus-within { box-shadow: 0 0 0 4px rgba(37,99,235,0.1); border-radius: var(--radius-md); }
            .form-icon-group:focus-within .input-group-text { border-color: var(--primary); color: var(--primary); background: #fff; }
            .form-icon-group:focus-within .form-control { border-color: var(--primary); background: #fff; }
        </style>

        <div class="page-header mb-4">
            <div>
                <button class="btn btn-light mb-3 shadow-sm rounded-pill px-4 fw-bold text-secondary border card-hover-float" onclick="App.switchPage('patients')">
                    <i class="fa-solid fa-arrow-left me-2 text-primary"></i> กลับไปหน้าทะเบียน
                </button>
                <h2 class="page-title text-primary" id="form-main-title" style="font-size: 28px;"><i class="fa-solid fa-user-plus me-2"></i> แฟ้มลงทะเบียนเวชระเบียนใหม่</h2>
                <p class="text-muted mt-1 mb-0">กรอกข้อมูลผู้ป่วย หรือใช้เครื่องสแกนบัตรประชาชนเพื่อดึงข้อมูลอัตโนมัติ</p>
            </div>
            <div class="d-flex gap-2 mt-3 mt-md-0">
                <button class="btn btn-premium btn-premium-success px-5 py-2 shadow-sm" style="font-size: 16px;" onclick="PatientFormPage.saveData()">
                    <i class="fa-solid fa-cloud-arrow-up me-2"></i> <span id="btn-save-text">บันทึกขึ้นคลาวด์</span>
                </button>
            </div>
        </div>  
        
        <div class="row g-4 pb-5">
            <div class="col-md-3">
                <div class="modern-panel text-center h-100 position-sticky shadow-sm p-4" style="top: 100px;">
                    <div class="mb-4 mt-2 position-relative z-1">
                        <img id="form-avatar" src="https://ui-avatars.com/api/?name=Patient&background=e2e8f0&color=94a3b8" class="rounded-circle shadow-sm" style="width: 160px; height: 160px; object-fit: cover; border: 4px solid #fff;">
                    </div>
                    <div id="smartcard-section" class="position-relative z-1">
                        <h6 class="fw-bold mb-3 text-secondary small text-uppercase">ดึงข้อมูลอัตโนมัติ</h6>
                        <button class="btn btn-premium btn-premium-primary w-100 mb-3 py-2 shadow-sm" id="btn-read-card" onclick="PatientFormPage.readSmartcard()">
                            <i class="fa-solid fa-id-card me-2"></i> สแกนบัตร ปชช.
                        </button>
                        <small class="text-muted"><i class="fa-solid fa-circle-info"></i> ต้องเปิดโปรแกรม Local Agent</small>
                    </div>
                </div>
            </div>

            <div class="col-md-9">
                <div class="modern-panel mb-4 shadow-sm p-4" style="border-top: 5px solid var(--primary);">
                    <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 200px; pointer-events: none;"><i class="fa-solid fa-address-card"></i></div>
                    <h5 class="fw-bold mb-4 position-relative z-1" style="color: var(--primary);">
                        <span class="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center me-2 shadow-sm" style="width:30px; height:30px; font-size:14px;">1</span> 
                        ข้อมูลส่วนบุคคล (Demographics)
                    </h5>
                    
                    <div class="row g-3 position-relative z-1">
                        <div class="col-md-3">
                            <label class="form-label fw-bold text-secondary small">รหัสผู้ป่วย (HN)</label>
                            <input type="text" class="form-control input-modern badge-soft-primary" id="add_hn" readonly>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label text-danger fw-bold small">สถานะปัจจุบัน</label>
                            <select class="form-select input-modern text-danger border-danger-subtle bg-danger-light" id="add_status">
                                <option value="ปกติ">🟢 ปกติ (Active)</option>
                                <option value="Admit รพ.">🔴 Admit รพ.</option>
                                <option value="ย้ายคลินิก">⚪ ย้ายคลินิก / จำหน่าย</option>
                                <option value="เสียชีวิต">⚫ เสียชีวิต</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-bold text-secondary small">เลขประจำตัวประชาชน 13 หลัก</label>
                            <input type="text" class="form-control input-modern text-dark" id="add_idcard" maxlength="17">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label text-danger fw-bold small">กรุ๊ปเลือด</label>
                            <select class="form-select input-modern text-danger border-danger-subtle bg-danger-light" id="add_blood">
                                <option value="ไม่ระบุ">ไม่ระบุ</option><option value="A">A</option><option value="B">B</option><option value="O">O</option><option value="AB">AB</option>
                            </select>
                        </div>
                        
                        <div class="col-md-2">
                            <label class="form-label fw-bold text-secondary small">คำนำหน้า</label>
                            <select class="form-select input-modern" id="add_title">
                                <option value="นาย">นาย</option><option value="นาง">นาง</option><option value="นางสาว">นางสาว</option>
                                <option value="ด.ช.">ด.ช.</option><option value="ด.ญ.">ด.ญ.</option><option value="พระ">พระ</option>
                            </select>
                        </div>
                        <div class="col-md-5">
                            <label class="form-label fw-bold text-secondary small">ชื่อ - นามสกุล (ภาษาไทย) <span class="text-danger">*</span></label>
                            <input type="text" class="form-control input-modern text-dark" id="add_name">
                        </div>
                        <div class="col-md-5">
                            <label class="form-label fw-bold text-secondary small">ชื่อ - นามสกุล (ภาษาอังกฤษ)</label>
                            <input type="text" class="form-control input-modern text-uppercase" id="add_name_en">
                        </div>

                        <div class="col-md-3">
                            <label class="form-label fw-bold text-secondary small">วัน/เดือน/ปีเกิด</label>
                            <input type="date" class="form-control input-modern" id="add_dob">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-bold text-secondary small">อายุ (คำนวณอัตโนมัติ)</label>
                            <input type="text" class="form-control input-modern badge-soft-danger" id="add_age" readonly>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label fw-bold text-secondary small">เพศ</label>
                            <select class="form-select input-modern" id="add_gender">
                                <option value="ชาย">ชาย</option><option value="หญิง">หญิง</option><option value="ไม่ระบุ">ไม่ระบุ</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label fw-bold text-secondary small">ศาสนา</label>
                            <select class="form-select input-modern" id="add_religion">
                                <option value="พุทธ">พุทธ</option><option value="คริสต์">คริสต์</option><option value="อิสลาม">อิสลาม</option><option value="ไม่ระบุ">ไม่ระบุ</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="modern-panel mb-4 shadow-sm p-4" style="border-top: 5px solid var(--warning);">
                    <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 200px; pointer-events: none;"><i class="fa-solid fa-address-book"></i></div>
                    <h5 class="fw-bold mb-4 position-relative z-1" style="color: var(--warning-dark);">
                        <span class="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center me-2 shadow-sm" style="width:30px; height:30px; font-size:14px;">2</span> 
                        ข้อมูลการติดต่อ (Contact Info)
                    </h5>
                    
                    <div class="row g-3 position-relative z-1">
                        <div class="col-md-4">
                            <label class="form-label fw-bold text-secondary small">เบอร์โทรศัพท์ผู้ป่วย</label>
                            <div class="input-group form-icon-group shadow-sm">
                                <span class="input-group-text"><i class="fa-solid fa-phone"></i></span>
                                <input type="text" class="form-control input-modern text-dark border-start-0" id="add_phone">
                            </div>
                        </div>
                        <div class="col-md-8">
                            <label class="form-label fw-bold text-secondary small">บุคคลติดต่อฉุกเฉิน (ชื่อ และ เบอร์โทร)</label>
                            <div class="input-group form-icon-group shadow-sm">
                                <span class="input-group-text"><i class="fa-solid fa-truck-medical text-danger"></i></span>
                                <input type="text" class="form-control input-modern text-danger border-start-0" id="add_emergency">
                            </div>
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-bold text-secondary small">ที่อยู่ปัจจุบัน</label>
                            <div class="input-group form-icon-group shadow-sm">
                                <span class="input-group-text align-items-start pt-3"><i class="fa-solid fa-location-dot"></i></span>
                                <textarea class="form-control input-modern text-dark border-start-0" id="add_address" rows="2"></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modern-panel mb-4 shadow-sm p-4" style="border-top: 5px solid var(--success);">
                    <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 200px; pointer-events: none;"><i class="fa-solid fa-notes-medical"></i></div>
                    <h5 class="fw-bold mb-4 position-relative z-1" style="color: var(--success-dark);">
                        <span class="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center me-2 shadow-sm" style="width:30px; height:30px; font-size:14px;">3</span> 
                        ข้อมูลการรักษา & ฟอกไต (Medical Profile)
                    </h5>
                    
                    <div class="row g-3 position-relative z-1">
                        <div class="col-md-6">
                            <div class="d-flex justify-content-between align-items-end mb-1">
                                <label class="form-label fw-bold text-secondary small mb-0">สิทธิการรักษาหลัก</label>
                                <button class="btn btn-sm text-primary p-0 fw-bold d-flex align-items-center" onclick="App.switchPage('finance')" style="font-size:11px;" title="ไปหน้าบัญชีเพื่อตั้งค่า"><i class="fa-solid fa-gear me-1"></i>ตั้งค่าสิทธิ</button>
                            </div>
                            <select class="form-select input-modern fw-bold text-success" id="add_right" style="border-color: #86efac; background-color: #f0fdf4;"></select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold text-secondary small mb-1">ตารางเวรฟอกประจำคลินิก</label>
                            <select class="form-select input-modern" id="add_shift"></select>
                        </div>

                        <div class="col-md-4 mt-4">
                            <label class="form-label text-danger fw-bold small"><i class="fa-solid fa-virus-covid me-1"></i> โรคติดเชื้อ (Infection)</label>
                            <select class="form-select input-modern text-danger border-danger-subtle bg-danger-light" id="add_infection"></select>
                        </div>
                        <div class="col-md-4 mt-4">
                            <label class="form-label text-warning-dark fw-bold small"><i class="fa-solid fa-triangle-exclamation me-1"></i> ประวัติแพ้ยา</label>
                            <input type="text" class="form-control input-modern text-warning-dark border-warning-subtle bg-warning-light" id="add_allergy">
                        </div>
                        <div class="col-md-4 mt-4">
                            <label class="form-label text-info fw-bold small"><i class="fa-solid fa-weight-scale me-1"></i> น้ำหนักเป้าหมาย (Dry BW)</label>
                            <div class="input-group shadow-sm" style="border-radius: var(--radius-md); overflow:hidden;">
                                <input type="number" step="0.1" class="form-control input-modern text-info border-info border-end-0" id="add_drybw" style="border-radius: 14px 0 0 14px;">
                                <span class="input-group-text badge-soft-info border-info border-start-0" style="border-radius: 0 14px 14px 0;">Kg.</span>
                            </div>
                        </div>

                        <div class="col-12 mt-4">
                            <label class="form-label fw-bold text-secondary small">โรคประจำตัว (Underlying Diseases)</label>
                            <input type="text" class="form-control input-modern text-dark" id="add_underlying" list="underlying_list" placeholder="คลิกเพื่อเลือก หรือ พิมพ์เพิ่มเองได้เลย">
                            <datalist id="underlying_list"></datalist>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `,

    init: function(hnToEdit = null) {
        this.scannedPhotoBase64 = null;
        this.isEditMode = false;
        this.editOriginalData = null;

        document.getElementById('add_dob').addEventListener('change', function() {
            const dobValue = this.value;
            if (dobValue) {
                const dob = new Date(dobValue); const today = new Date();
                let years = today.getFullYear() - dob.getFullYear(); let months = today.getMonth() - dob.getMonth(); let days = today.getDate() - dob.getDate();
                if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
                if (months < 0) { years--; months += 12; }
                document.getElementById('add_age').value = `${years} ปี ${months} เดือน ${days} วัน`;
            } else { document.getElementById('add_age').value = ""; }
        });

        // 🌟 ดึงข้อมูลสิทธิการรักษามาจาก Master Data แบบ Real-time
        db.ref('clinic_rights_v2').on('value', snap => {
            const data = snap.val();
            if(data) {
                this.clinicRights = Array.isArray(data) ? data : Object.keys(data).map(k => data[k]);
                let rightsOptions = this.clinicRights.map(r => `<option value="${r.name}">${r.name}</option>`).join('');
                document.getElementById('add_right').innerHTML = `<option value="">-- เลือกสิทธิการรักษา --</option>` + rightsOptions;
            } else {
                document.getElementById('add_right').innerHTML = `<option value="ชำระเงินเอง">ชำระเงินเอง</option><option value="บัตรทอง (สปสช.)">บัตรทอง (สปสช.)</option><option value="ประกันสังคม">ประกันสังคม</option>`;
            }
        });

        db.ref('clinic_options_v2').once('value', snap => {
            const opts = snap.val() || {
                shifts: ["ไม่ระบุเวรประจำ", "จันทร์-พุธ-ศุกร์ (รอบเช้า)", "จันทร์-พุธ-ศุกร์ (รอบบ่าย)", "อังคาร-พฤหัส-เสาร์ (รอบเช้า)", "อังคาร-พฤหัส-เสาร์ (รอบบ่าย)"],
                infections: ["ไม่มี", "HBV", "HCV", "HIV"],
                underlyings: ["HT (ความดันโลหิตสูง)", "DM (เบาหวาน)", "DLP (ไขมันในเลือดสูง)", "Gout (โรคเกาต์)", "IHD (โรคหลอดเลือดหัวใจ)"]
            };

            const buildOptions = (arr) => arr.map(a => `<option value="${a}">${a}</option>`).join('');
            
            document.getElementById('add_shift').innerHTML = buildOptions(opts.shifts);
            document.getElementById('add_infection').innerHTML = buildOptions(opts.infections);
            document.getElementById('underlying_list').innerHTML = buildOptions(opts.underlyings);

            if (hnToEdit) {
                this.isEditMode = true;
                document.getElementById('form-main-title').innerHTML = `<i class="fa-solid fa-user-pen me-2"></i> แก้ไขประวัติผู้ป่วย`;
                document.getElementById('btn-save-text').innerText = "อัปเดตข้อมูลขึ้นคลาวด์";
                document.getElementById('smartcard-section').style.display = 'none';

                if (typeof PatientsPage !== 'undefined' && PatientsPage.allData) {
                    const pt = PatientsPage.allData.find(p => p.hn === hnToEdit);
                    if (pt) {
                        this.editOriginalData = pt;
                        document.getElementById('add_hn').value = pt.hn || "";
                        document.getElementById('add_status').value = pt.status || "ปกติ";
                        document.getElementById('add_idcard').value = pt.idcard || "";
                        document.getElementById('add_title').value = pt.title || "นาย";
                        document.getElementById('add_name').value = pt.name_th || "";
                        document.getElementById('add_name_en').value = pt.name_en || "";
                        
                        document.getElementById('add_dob').value = pt.dob || "";
                        document.getElementById('add_dob').dispatchEvent(new Event('change')); 

                        document.getElementById('add_gender').value = pt.gender || "ชาย";
                        document.getElementById('add_religion').value = pt.religion || "พุทธ";
                        document.getElementById('add_blood').value = pt.blood_type || "ไม่ระบุ";
                        
                        document.getElementById('add_phone').value = pt.phone || "";
                        document.getElementById('add_emergency').value = pt.emergency_contact || "";
                        document.getElementById('add_address').value = pt.address || "";
                        
                        // รอให้ Dropdown โหลดเสร็จก่อนเซ็ตค่า
                        setTimeout(() => {
                            let rightEl = document.getElementById('add_right');
                            let hasOption = Array.from(rightEl.options).some(opt => opt.value === pt.right);
                            if(!hasOption && pt.right) rightEl.innerHTML += `<option value="${pt.right}">${pt.right}</option>`;
                            rightEl.value = pt.right || "";
                        }, 500);

                        if(!opts.shifts.includes(pt.shift) && pt.shift) document.getElementById('add_shift').innerHTML += `<option value="${pt.shift}">${pt.shift}</option>`;
                        if(!opts.infections.includes(pt.infection) && pt.infection) document.getElementById('add_infection').innerHTML += `<option value="${pt.infection}">${pt.infection}</option>`;
                        
                        document.getElementById('add_shift').value = pt.shift || "ไม่ระบุ";
                        document.getElementById('add_infection').value = pt.infection || "ไม่มี";
                        document.getElementById('add_allergy').value = pt.allergy || "";
                        document.getElementById('add_drybw').value = pt.dry_bw || "";
                        document.getElementById('add_underlying').value = pt.underlying_disease || "";

                        if (pt.photo_base64) {
                            this.scannedPhotoBase64 = pt.photo_base64;
                            document.getElementById('form-avatar').src = pt.photo_base64.startsWith('data:image') ? pt.photo_base64 : 'data:image/jpeg;base64,' + pt.photo_base64;
                        }
                    }
                }
            } else {
                document.getElementById('smartcard-section').style.display = 'block';
                const yearTh = new Date().getFullYear() + 543;
                document.getElementById('add_hn').value = `HN-${yearTh.toString().substring(2)}${Math.floor(1000 + Math.random() * 9000)}`;
            }
        });
    },

    readSmartcard: async function() {
        const btn = document.getElementById('btn-read-card'); btn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> กำลังสื่อสาร...`; btn.disabled = true;
        try {
            const response = await fetch('http://localhost:8000/read-card');
            if (!response.ok) throw new Error("ไม่สามารถเชื่อมต่อ Local Agent ได้");
            const result = await response.json();
            if (result.error || result.status === "error") { Swal.fire('Error', result.error, 'error'); btn.innerHTML = `<i class="fa-solid fa-id-card me-2"></i> สแกนบัตร ปชช.`; btn.disabled = false; return; }
            
            const data = result.data || result;
            document.getElementById('add_idcard').value = data.cid || data.idcard || "";
            document.getElementById('add_title').value = data.title_th || data.title || "นาย";
            document.getElementById('add_name').value = ((data.fname_th || "") + " " + (data.lname_th || "")).trim();
            document.getElementById('add_name_en').value = ((data.fname_en || "") + " " + (data.lname_en || "")).trim().toUpperCase();
            document.getElementById('add_gender').value = (data.gender === "2" || data.gender === "หญิง" || data.gender === "Female") ? "หญิง" : "ชาย";
            document.getElementById('add_address').value = data.address || "";

            let dobStr = data.dob || "";
            if (dobStr.length === 8 && !dobStr.includes("-")) {
                let y = parseInt(dobStr.substring(0, 4)); if (y > 2400) y -= 543; 
                dobStr = `${y}-${dobStr.substring(4, 6)}-${dobStr.substring(6, 8)}`;
            }
            const dobInput = document.getElementById('add_dob'); dobInput.value = dobStr; dobInput.dispatchEvent(new Event('change')); 

            if (data.photo_base64 || data.photo) {
                let b64 = data.photo_base64 || data.photo; if (!b64.startsWith('data:image')) b64 = 'data:image/jpeg;base64,' + b64;
                document.getElementById('form-avatar').src = b64; this.scannedPhotoBase64 = b64.split(',')[1] || b64;
            }
            btn.innerHTML = `<i class="fa-solid fa-check-circle me-2"></i> สำเร็จ`; btn.className = "btn btn-premium btn-premium-success w-100 py-2 mb-3 shadow-sm"; btn.disabled = false;
        } catch (err) {
            Swal.fire('ไม่พบตัวเชื่อมต่ออุปกรณ์', 'เปิดโปรแกรม Local Bridge Agent ไว้หรือยัง?', 'warning'); btn.innerHTML = `<i class="fa-solid fa-id-card me-2"></i> สแกนบัตร ปชช.`; btn.disabled = false;
        }
    },

    saveData: function() {
        const hn = document.getElementById('add_hn').value.trim(); const name = document.getElementById('add_name').value.trim();
        if (!hn || !name) { Swal.fire('ข้อมูลไม่สมบูรณ์', 'กรุณาระบุรหัส HN และ ชื่อ-นามสกุล', 'warning'); return; }
        if (typeof db === 'undefined') return;

        Swal.fire({ title: 'กำลังประมวลผล...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

        const updatedData = {
            hn: hn, idcard: document.getElementById('add_idcard').value.trim() || "-", title: document.getElementById('add_title').value,
            name_th: name, name_en: document.getElementById('add_name_en').value.trim(), dob: document.getElementById('add_dob').value,
            age: document.getElementById('add_age').value, gender: document.getElementById('add_gender').value, religion: document.getElementById('add_religion').value,
            blood_type: document.getElementById('add_blood').value, phone: document.getElementById('add_phone').value.trim() || "-",
            emergency_contact: document.getElementById('add_emergency').value.trim() || "-", address: document.getElementById('add_address').value.trim() || "-",
            right: document.getElementById('add_right').value, shift: document.getElementById('add_shift').value,
            infection: document.getElementById('add_infection').value, allergy: document.getElementById('add_allergy').value.trim() || "ไม่มี",
            dry_bw: document.getElementById('add_drybw').value || "0", underlying_disease: document.getElementById('add_underlying').value.trim() || "-",
            status: document.getElementById('add_status').value, photo_base64: this.scannedPhotoBase64
        };

        db.ref('patients_database_v2/patients').once('value', snap => {
            let currentList = snap.val() || [];
            if (!Array.isArray(currentList)) { currentList = Object.keys(currentList).map(k => currentList[k]); }
            
            if (this.isEditMode && this.editOriginalData) {
                const targetIndex = currentList.findIndex(p => p.hn === hn);
                if (targetIndex !== -1) currentList[targetIndex] = { ...currentList[targetIndex], ...updatedData };
            } else {
                updatedData.id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
                updatedData.register_date = new Date().toISOString(); updatedData.history = []; updatedData.labs = [];
                currentList.push(updatedData);
            }

            db.ref('patients_database_v2/patients').set(currentList)
                .then(() => { Swal.fire({ title: 'สำเร็จ!', text: `บันทึกข้อมูลเรียบร้อย`, icon: 'success', confirmButtonColor: '#10b981' }).then(() => { App.switchPage('patients'); }); })
                .catch(err => { Swal.fire('เกิดข้อผิดพลาด', err.message, 'error'); });
        });
    }
};