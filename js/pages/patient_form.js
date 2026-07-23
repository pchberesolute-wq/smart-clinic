// js/pages/patient_form.js
// 🚀 Enterprise Patient Form Module: HTTP Cache-Busting, Zero-Trust Clear, Smart Timeout & Duplicate Prevention Hook (v8.0)

class PatientFormPageComponent {
    constructor() {
        this.state = {
            scannedPhotoBase64: null,
            isEditMode: false,
            editOriginalData: null,
            clinicRights: [], 
            clinicShifts: [],
            clinicInfections: [],
            clinicUnderlyings: [],
            hnToEdit: null,
            underlyingTags: [] 
        };
        this.firebaseListeners = [];
    }

    get html() {
        return `
            <style>
                .form-label { font-weight: 700 !important; color: var(--text-muted); font-size: 13px; letter-spacing: 0.3px; margin-bottom: 6px; }
                .form-control, .form-select { 
                    border-radius: 12px; border: 1px solid var(--border-color); padding: 10px 16px; font-size: 14.5px; 
                    background-color: var(--bg-body); color: var(--text-dark); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
                    box-shadow: inset 0 1px 2px rgba(0,0,0,0.01);
                }
                .form-control:focus, .form-select:focus { 
                    border-color: var(--primary); box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1) !important; background-color: var(--bg-surface); 
                }
                
                .form-icon-group { border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.3s ease; }
                .form-icon-group .input-group-text { 
                    background: var(--bg-body); border-right: none; color: var(--text-muted); border-color: var(--border-color); 
                    border-radius: 12px 0 0 12px; transition: all 0.3s ease; padding-left: 18px; 
                }
                .form-icon-group .form-control { border-left: none; padding-left: 10px; border-radius: 0 12px 12px 0; box-shadow: none; border-color: var(--border-color); }
                .form-icon-group:focus-within { box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1); border-radius: 12px; }
                .form-icon-group:focus-within .input-group-text { border-color: var(--primary); color: var(--primary); background: var(--bg-surface); }
                .form-icon-group:focus-within .form-control { border-color: var(--primary); background: var(--bg-surface); }

                .form-section-card {
                    background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 24px;
                    padding: 32px; margin-bottom: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.03);
                    position: relative; overflow: hidden; transition: all 0.3s ease;
                }
                .form-section-card:hover { border-color: var(--primary); box-shadow: 0 15px 30px -5px rgba(0,0,0,0.06); }
                
                .section-badge-number {
                    width: 36px; height: 36px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;
                    font-weight: 800; font-size: 16px; font-family: 'Prompt'; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin-right: 12px;
                }

                .bg-accent-subtle { background-color: rgba(37,99,235,0.03); }
                .border-accent-subtle { border-color: rgba(37,99,235,0.2) !important; }
                
                #form-loading-screen { display: none; min-height: 50vh; align-items: center; justify-content: center; }

                .tags-display-area {
                    display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; min-height: 38px;
                    padding: 8px 12px; background-color: var(--bg-body); border-radius: 12px; border: 1px solid var(--border-color);
                }
                .tag-pill {
                    display: inline-flex; align-items: center; background-color: rgba(37,99,235,0.1); color: var(--primary);
                    padding: 6px 14px; border-radius: 50px; font-size: 13.5px; font-weight: 700; font-family: 'Prompt';
                    border: 1px solid rgba(37,99,235,0.2); animation: popIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                .tag-pill i { cursor: pointer; margin-left: 8px; opacity: 0.6; transition: 0.2s; font-size: 12px; }
                .tag-pill i:hover { opacity: 1; transform: scale(1.2); color: #ef4444; }
                
                @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

                .btn-setting-micro {
                    background: var(--bg-body); border: 1px solid var(--border-color); color: var(--text-muted);
                    width: 28px; height: 28px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center;
                    transition: all 0.2s; cursor: pointer; position: relative; z-index: 10;
                }
                .btn-setting-micro:hover { background: var(--primary); border-color: var(--primary); color: white; transform: translateY(-1px); box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
                
                .btn-micro-action { width: 36px; height: 36px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; background: var(--bg-surface); }
                .btn-micro-edit { border: 1px solid #fde047; color: #d97706; }
                .btn-micro-edit:hover { background: #fef9c3; border-color: #f59e0b; transform: translateY(-2px); box-shadow: 0 4px 6px rgba(245,158,11,0.1); }
                .btn-micro-delete { border: 1px solid #fecaca; color: #ef4444; }
                .btn-micro-delete:hover { background: #fef2f2; border-color: #ef4444; transform: translateY(-2px); box-shadow: 0 4px 6px rgba(239,68,68,0.1); }
            </style>

            <div class="page-header mb-4 fade-in-up">
                <div>
                    <button class="btn btn-light mb-3 shadow-sm rounded-pill px-4 fw-bold text-secondary border card-hover-float" onclick="if(window.App && window.App.switchPage) window.App.switchPage('patients');">
                        <i class="fa-solid fa-arrow-left me-2 text-primary"></i> กลับไปหน้าทะเบียน
                    </button>
                    <h2 class="page-title text-primary" id="form-main-title" style="font-size: 28px; font-weight: 800;"><i class="fa-solid fa-user-plus me-2"></i> แฟ้มลงทะเบียนเวชระเบียนใหม่</h2>
                    <p class="text-muted mt-1 mb-0" style="font-size: 15px;">กรอกข้อมูลผู้ป่วย หรือใช้เครื่องสแกนบัตรประชาชนเพื่อดึงข้อมูลอัตโนมัติ</p>
                </div>
                <div class="d-flex gap-2 mt-3 mt-md-0">
                    <button class="btn btn-premium btn-premium-success px-5 py-2 shadow-sm card-hover-float" style="font-size: 16px; border-radius: 14px;" onclick="window.PatientFormPage.saveData()">
                        <i class="fa-solid fa-cloud-arrow-up me-2"></i> <span id="btn-save-text">บันทึกข้อมูลขึ้นคลาวด์</span>
                    </button>
                </div>
            </div>  
            
            <div id="form-loading-screen" class="flex-column text-primary">
                <i class="fas fa-circle-notch fa-spin fa-3x mb-3 drop-shadow"></i>
                <h5 class="fw-bold">กำลังประมวลผลข้อมูล...</h5>
            </div>

            <div class="row g-4 pb-5 fade-in-up" id="form-content-area" style="animation-delay: 0.1s; display: none;">
                
                <div class="col-xl-3 col-lg-4">
                    <div class="modern-panel text-center h-100 position-sticky shadow-sm p-4 d-flex flex-column align-items-center" style="top: 100px; background: var(--bg-surface); border-color: var(--border-color) !important; border-radius: 24px;">
                        <div class="mb-4 mt-2 position-relative z-1">
                            <div style="padding: 6px; background: conic-gradient(from 45deg, var(--primary), var(--info), var(--primary)); border-radius: 50%; box-shadow: 0 10px 25px rgba(37,99,235,0.2);">
                                <img id="form-avatar" src="https://ui-avatars.com/api/?name=Patient&background=e2e8f0&color=94a3b8" class="rounded-circle" style="width: 150px; height: 150px; object-fit: cover; border: 4px solid var(--bg-surface);">
                            </div>
                        </div>
                        <div id="smartcard-section" class="position-relative z-1 w-100 mt-2">
                            <h6 class="fw-bold mb-3 text-secondary small text-uppercase" style="letter-spacing: 1px;"><i class="fa-solid fa-bolt text-warning me-1"></i> ดึงข้อมูลอัตโนมัติ</h6>
                            <button class="btn btn-premium btn-premium-primary w-100 mb-3 py-3 shadow-sm" id="btn-read-card" style="border-radius: 14px;" onclick="window.PatientFormPage.readSmartcard()">
                                <i class="fa-solid fa-id-card me-2 fs-5"></i> <span class="fw-bold fs-6">สแกนบัตร ปชช.</span>
                            </button>
                            <small class="text-muted"><i class="fa-solid fa-circle-info"></i> ต้องเปิดโปรแกรม Local Agent</small>
                        </div>
                    </div>
                </div>

                <div class="col-xl-9 col-lg-8">
                    
                    <div class="form-section-card" style="border-top: 5px solid var(--primary);">
                        <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 200px; pointer-events: none; color: var(--primary);"><i class="fa-solid fa-address-card"></i></div>
                        <h5 class="fw-bold mb-4 position-relative z-1 d-flex align-items-center" style="color: var(--primary);">
                            <div class="section-badge-number bg-primary text-white">1</div> ข้อมูลส่วนบุคคล (Demographics)
                        </h5>
                        
                        <div class="row g-4 position-relative z-1">
                            <div class="col-md-3">
                                <label class="form-label"><i class="fa-solid fa-hashtag me-1 text-primary"></i> รหัสผู้ป่วย (HN) <span class="text-danger">*</span></label>
                                <div class="input-group form-icon-group shadow-sm" style="background-color: var(--bg-body);">
                                    <span class="input-group-text border-0 text-primary fw-bold pe-0 ps-3" style="background: transparent; font-size: 15px;">HN-</span>
                                    <input type="text" class="form-control border-0 text-primary fw-bold ps-1" id="add_hn" style="background: transparent; font-size: 15px;" placeholder="ระบุเลข">
                                    <button class="btn btn-light border-0 fw-bold px-3 text-primary" style="background-color: var(--bg-surface); border-radius: 0 12px 12px 0;" onclick="window.PatientFormPage.generateRandomHN()" title="สุ่มรหัสอัตโนมัติ"><i class="fa-solid fa-shuffle"></i></button>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label text-danger"><i class="fa-solid fa-heart-pulse me-1"></i> สถานะปัจจุบัน</label>
                                <select class="form-select text-danger fw-bold" id="add_status" style="background-color: rgba(239,68,68,0.05); border-color: rgba(239,68,68,0.2);">
                                    <option value="ปกติ">🟢 ปกติ (Active)</option>
                                    <option value="Admit รพ.">🔴 Admit รพ.</option>
                                    <option value="ย้ายคลินิก">⚪ ย้ายคลินิก / จำหน่าย</option>
                                    <option value="เสียชีวิต">⚫ เสียชีวิต</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label"><i class="fa-regular fa-id-badge me-1 text-primary"></i> เลขประจำตัวประชาชน 13 หลัก</label>
                                <input type="text" class="form-control fw-bold" id="add_idcard" maxlength="17" placeholder="X-XXXX-XXXXX-XX-X">
                            </div>
                            <div class="col-md-2">
                                <label class="form-label text-danger"><i class="fa-solid fa-droplet me-1"></i> กรุ๊ปเลือด</label>
                                <select class="form-select fw-bold text-danger" id="add_blood" style="background-color: rgba(239,68,68,0.05); border-color: rgba(239,68,68,0.2);">
                                    <option value="ไม่ระบุ">ไม่ระบุ</option><option value="A">A</option><option value="B">B</option><option value="O">O</option><option value="AB">AB</option>
                                </select>
                            </div>
                            
                            <div class="col-md-2">
                                <label class="form-label">คำนำหน้า</label>
                                <select class="form-select fw-bold" id="add_title">
                                    <option value="นาย">นาย</option><option value="นาง">นาง</option><option value="นางสาว">นางสาว</option>
                                    <option value="ด.ช.">ด.ช.</option><option value="ด.ญ.">ด.ญ.</option><option value="พระ">พระ</option>
                                </select>
                            </div>
                            <div class="col-md-5">
                                <label class="form-label">ชื่อ - นามสกุล (ภาษาไทย) <span class="text-danger">*</span></label>
                                <input type="text" class="form-control fw-bold" id="add_name" placeholder="ระบุชื่อและนามสกุลภาษาไทย">
                            </div>
                            <div class="col-md-5">
                                <label class="form-label">ชื่อ - นามสกุล (ภาษาอังกฤษ)</label>
                                <input type="text" class="form-control fw-bold text-uppercase" id="add_name_en" placeholder="ระบุชื่อและนามสกุลภาษาอังกฤษ">
                            </div>

                            <div class="col-md-3">
                                <label class="form-label"><i class="fa-regular fa-calendar text-primary me-1"></i> วัน/เดือน/ปีเกิด</label>
                                <input type="date" class="form-control fw-bold" id="add_dob">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label"><i class="fa-solid fa-cake-candles text-primary me-1"></i> อายุ (คำนวณอัตโนมัติ)</label>
                                <input type="text" class="form-control fw-bold text-primary bg-accent-subtle border-accent-subtle" id="add_age" readonly placeholder="ระบบจะคำนวณอัตโนมัติ">
                            </div>
                            <div class="col-md-2">
                                <label class="form-label">เพศ</label>
                                <select class="form-select fw-bold" id="add_gender">
                                    <option value="ชาย">ชาย</option><option value="หญิง">หญิง</option><option value="ไม่ระบุ">ไม่ระบุ</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label">ศาสนา</label>
                                <select class="form-select fw-bold" id="add_religion">
                                    <option value="ไม่ระบุ" selected>ไม่ระบุ</option><option value="พุทธ">พุทธ</option><option value="คริสต์">คริสต์</option><option value="อิสลาม">อิสลาม</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="form-section-card" style="border-top: 5px solid var(--warning);">
                        <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 200px; pointer-events: none; color: var(--warning);"><i class="fa-solid fa-address-book"></i></div>
                        <h5 class="fw-bold mb-4 position-relative z-1 d-flex align-items-center" style="color: var(--warning-dark);">
                            <div class="section-badge-number bg-warning text-dark">2</div> ข้อมูลการติดต่อ (Contact Info)
                        </h5>
                        
                        <div class="row g-4 position-relative z-1">
                            <div class="col-md-4">
                                <label class="form-label">เบอร์โทรศัพท์ผู้ป่วย</label>
                                <div class="input-group form-icon-group">
                                    <span class="input-group-text"><i class="fa-solid fa-phone"></i></span>
                                    <input type="text" class="form-control fw-bold border-start-0" id="add_phone" placeholder="08X-XXX-XXXX">
                                </div>
                            </div>
                            <div class="col-md-8">
                                <label class="form-label">บุคคลติดต่อฉุกเฉิน (ชื่อ และ เบอร์โทร) <span class="badge bg-danger-subtle text-danger-emphasis ms-1">สำคัญ</span></label>
                                <div class="input-group form-icon-group" style="box-shadow: 0 0 0 1px rgba(239,68,68,0.1);">
                                    <span class="input-group-text" style="background-color: rgba(239,68,68,0.05);"><i class="fa-solid fa-truck-medical text-danger"></i></span>
                                    <input type="text" class="form-control fw-bold text-danger border-start-0" id="add_emergency" style="background-color: rgba(239,68,68,0.02);" placeholder="ระบุชื่อญาติ และเบอร์โทรติดต่อ">
                                </div>
                            </div>
                            <div class="col-12">
                                <label class="form-label">ที่อยู่ปัจจุบัน</label>
                                <div class="input-group form-icon-group">
                                    <span class="input-group-text align-items-start pt-3"><i class="fa-solid fa-location-dot"></i></span>
                                    <textarea class="form-control fw-bold border-start-0" id="add_address" rows="2" placeholder="บ้านเลขที่ หมู่ ซอย ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-section-card" style="border-top: 5px solid var(--success);">
                        <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 200px; pointer-events: none; color: var(--success);"><i class="fa-solid fa-notes-medical"></i></div>
                        <h5 class="fw-bold mb-4 position-relative z-1 d-flex align-items-center" style="color: var(--success-dark);">
                            <div class="section-badge-number bg-success text-white">3</div> ข้อมูลการรักษา & ฟอกไต (Medical Profile)
                        </h5>
                        
                        <div class="row g-4 position-relative z-1">
                            <div class="col-md-6">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <label class="form-label mb-0"><i class="fa-solid fa-shield-heart me-1 text-success"></i> สิทธิการรักษาหลัก</label>
                                    <div class="btn-setting-micro" onclick="window.PatientFormPage.manageRights()" title="จัดการตัวเลือก"><i class="fa-solid fa-gear"></i></div>
                                </div>
                                <select class="form-select fw-bold text-success" id="add_right" style="border-color: rgba(16,185,129,0.3); background-color: rgba(16,185,129,0.05); height: 48px;">
                                    <option value="">กำลังโหลดข้อมูล...</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <label class="form-label mb-0"><i class="fa-regular fa-clock me-1 text-primary"></i> ตารางเวรฟอกประจำคลินิก</label>
                                    <div class="btn-setting-micro" onclick="window.PatientFormPage.manageDropdown('shift')" title="จัดการตัวเลือก"><i class="fa-solid fa-gear"></i></div>
                                </div>
                                <select class="form-select fw-bold" id="add_shift" style="height: 48px;">
                                    <option value="">กำลังโหลดข้อมูล...</option>
                                </select>
                            </div>

                            <div class="col-md-4 mt-4">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <label class="form-label text-danger mb-0"><i class="fa-solid fa-virus-covid me-1"></i> โรคติดเชื้อ (Infection)</label>
                                    <div class="btn-setting-micro" onclick="window.PatientFormPage.manageDropdown('infection')" title="จัดการตัวเลือก"><i class="fa-solid fa-gear"></i></div>
                                </div>
                                <select class="form-select fw-bold text-danger" id="add_infection" style="border-color: rgba(239,68,68,0.3); background-color: rgba(239,68,68,0.05);">
                                    <option value="">กำลังโหลดข้อมูล...</option>
                                </select>
                            </div>
                            <div class="col-md-4 mt-4">
                                <label class="form-label text-warning-dark" style="margin-bottom: 9px;"><i class="fa-solid fa-triangle-exclamation me-1"></i> ประวัติแพ้ยา</label>
                                <input type="text" class="form-control fw-bold text-warning-dark" id="add_allergy" style="border-color: rgba(245,158,11,0.3); background-color: rgba(245,158,11,0.05);" placeholder="เช่น ไม่มี หรือ ระบุชื่อยา">
                            </div>
                            <div class="col-md-4 mt-4">
                                <label class="form-label text-info" style="margin-bottom: 9px;"><i class="fa-solid fa-weight-scale me-1"></i> น้ำหนักเป้าหมาย (Dry BW)</label>
                                <div class="input-group form-icon-group" style="box-shadow: 0 0 0 1px rgba(14,165,233,0.1);">
                                    <input type="number" step="0.1" class="form-control fw-bold text-info border-end-0" id="add_drybw" style="background-color: rgba(14,165,233,0.02);" placeholder="0.0">
                                    <span class="input-group-text border-start-0 text-info fw-bold" style="background-color: rgba(14,165,233,0.05);">Kg.</span>
                                </div>
                            </div>

                            <div class="col-12 mt-4">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <label class="form-label mb-0"><i class="fa-solid fa-notes-medical text-primary me-1"></i> โรคประจำตัว (Underlying Diseases)</label>
                                    <div class="btn-setting-micro" onclick="window.PatientFormPage.manageDropdown('underlying')" title="จัดการโรคเริ่มต้น"><i class="fa-solid fa-gear"></i></div>
                                </div>
                                
                                <div class="tags-display-area shadow-sm" id="underlying-tags-container">
                                    <span class="text-muted small align-self-center ms-1">ยังไม่มีข้อมูลโรคประจำตัว...</span>
                                </div>

                                <div class="input-group shadow-sm" style="border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color);">
                                    <span class="input-group-text bg-body border-0"><i class="fa-solid fa-search text-muted"></i></span>
                                    <select class="form-select border-0 fw-bold" id="add_underlying_input" style="background-color: var(--bg-body);">
                                        <option value="">-- เลือกโรคประจำตัวจากรายการ --</option>
                                    </select>
                                    <button class="btn btn-primary fw-bold px-4" onclick="window.PatientFormPage.addTagFromDropdown()">
                                        <i class="fa-solid fa-plus me-1"></i> เพิ่มโรค
                                    </button>
                                </div>
                                <small class="text-muted mt-2 d-block"><i class="fa-solid fa-circle-info me-1 text-info"></i> เลือกโรคจากรายการด้านบนแล้วกดปุ่ม "เพิ่มโรค" เพื่อสร้างเป็น Tag หากต้องการเพิ่มโรคใหม่ กรุณากดที่ปุ่มฟันเฟือง</small>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        `;
    }

    init(params = null) {
        this.state.scannedPhotoBase64 = null;
        this.state.isEditMode = false;
        this.state.editOriginalData = null;
        this.state.hnToEdit = null;
        this.state.underlyingTags = [];

        const dobElement = document.getElementById('add_dob');
        if(dobElement) {
            dobElement.addEventListener('change', function() {
                const dobValue = this.value;
                if (dobValue) {
                    const dob = new Date(dobValue); const today = new Date();
                    let years = today.getFullYear() - dob.getFullYear(); let months = today.getMonth() - dob.getMonth(); let days = today.getDate() - dob.getDate();
                    if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
                    if (months < 0) { years--; months += 12; }
                    document.getElementById('add_age').value = `${years} ปี ${months} เดือน ${days} วัน`;
                } else { document.getElementById('add_age').value = ""; }
            });
        }

        if (typeof db === 'undefined') return;

        if (params && typeof params === 'object') {
            if (params.id) this.state.hnToEdit = params.id;
            else if (params.hn) this.state.hnToEdit = params.hn;
        } else if (typeof params === 'string') {
            this.state.hnToEdit = params;
        }

        document.getElementById('form-content-area').style.display = 'none';
        document.getElementById('form-loading-screen').style.display = 'flex';

        this.loadMasterData().then(() => {
            if (this.state.hnToEdit) {
                this.state.isEditMode = true;
                this.loadPatientData();
            } else {
                document.getElementById('form-loading-screen').style.display = 'none';
                document.getElementById('form-content-area').style.display = 'flex';
                document.getElementById('smartcard-section').style.display = 'block';
                document.getElementById('add_hn').value = "";
            }
        });
    }

    generateRandomHN() {
        const yearTh = new Date().getFullYear() + 543;
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        document.getElementById('add_hn').value = `${yearTh.toString().substring(2)}${randomNum}`;
    }

    addTagFromDropdown() {
        const select = document.getElementById('add_underlying_input');
        if (!select) return;
        const val = select.value.trim();
        if (val && !this.state.underlyingTags.includes(val)) {
            this.state.underlyingTags.push(val);
            this.renderTags();
        }
        select.value = ''; 
    }

    removeTag(index) {
        this.state.underlyingTags.splice(index, 1);
        this.renderTags();
    }

    renderTags() {
        const container = document.getElementById('underlying-tags-container');
        if (!container) return;
        
        if (this.state.underlyingTags.length === 0) {
            container.innerHTML = `<span class="text-muted small align-self-center ms-1">ยังไม่มีข้อมูลโรคประจำตัว...</span>`;
            return;
        }

        container.innerHTML = this.state.underlyingTags.map((tag, index) => `
            <span class="tag-pill shadow-sm">
                ${this._escapeHTML(tag)} 
                <i class="fa-solid fa-circle-xmark ms-2" onclick="window.PatientFormPage.removeTag(${index})" title="ลบโรคนี้"></i>
            </span>
        `).join('');
    }

    manageRights() {
        let html = '<div class="list-group mb-3 text-start shadow-sm" style="border-radius:12px; overflow:hidden;">';
        this.state.clinicRights.forEach((r) => {
            html += `
            <div class="list-group-item d-flex justify-content-between align-items-center p-3 mb-2 bg-white border rounded-3 shadow-sm mx-1">
                <div>
                    <div class="fw-bold text-dark" style="font-size:15px; font-family:'Prompt';">${this._escapeHTML(r.name)}</div>
                    <div class="text-success fw-bold small mt-1"><i class="fa-solid fa-hand-holding-dollar me-1"></i> เบิกจ่าย: ฿${Number(r.price).toLocaleString()} / รอบ</div>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-micro-action btn-micro-edit" onclick="window.PatientFormPage.editRight('${r.id}')" title="แก้ไขราคา"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-micro-action btn-micro-delete" onclick="window.PatientFormPage.confirmDeleteRight('${r.id}', '${this._escapeHTML(r.name)}')" title="ลบสิทธิ"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
        });
        html += '</div>';
        
        Swal.fire({
            title: '<h4 class="fw-bold text-success mb-0"><i class="fa-solid fa-shield-heart me-2"></i> จัดการสิทธิการรักษา</h4>',
            html: html,
            showCancelButton: true, cancelButtonText: 'ปิดหน้าต่าง',
            showConfirmButton: true, confirmButtonText: '<i class="fa-solid fa-plus me-1"></i> เพิ่มสิทธิใหม่', confirmButtonColor: '#2563eb',
            customClass: { popup: 'premium-alert' }
        }).then((res) => { if(res.isConfirmed) { this.editRight(null); } });
    }

    editRight(id) {
        let r = id ? this.state.clinicRights.find(x => x.id === id) : { name: '', price: 1500 };
        Swal.fire({
            title: `<h5 class="fw-bold text-success mb-0"><i class="fa-solid ${id?'fa-pen':'fa-plus'} me-2"></i>${id ? 'แก้ไขสิทธิการรักษา' : 'เพิ่มสิทธิใหม่'}</h5>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Prompt';">
                    <label class="form-label fw-bold small text-secondary">ชื่อสิทธิ (เช่น บัตรทอง, ชำระเงินเอง)</label>
                    <input type="text" id="swal-right-name" class="form-control input-modern mb-3 fw-bold text-dark" value="${this._escapeHTML(r.name)}">
                    <label class="form-label fw-bold small text-secondary">ราคา / ค่าเบิกจ่าย (บาท)</label>
                    <input type="number" id="swal-right-price" class="form-control input-modern text-success fw-bold text-center" value="${r.price}" style="font-size: 18px;" min="0">
                </div>
            `,
            showCancelButton: true, cancelButtonText: 'ยกเลิก', confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึก', confirmButtonColor: '#10b981',
            customClass: { popup: 'premium-alert' },
            preConfirm: () => {
                let name = document.getElementById('swal-right-name').value.trim();
                let price = document.getElementById('swal-right-price').value;
                if(!name) { Swal.showValidationMessage('กรุณากรอกชื่อสิทธิ'); return false; }
                return { id: id || 'RIGHT'+Date.now(), name, price: Number(price) };
            }
        }).then(res => {
            if(res.isConfirmed) {
                Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                let updated = [...this.state.clinicRights];
                if(id) updated[updated.findIndex(x=>x.id===id)] = res.value; else updated.push(res.value);
                
                db.ref('clinic_rights_v2').set(updated).then(() => {
                    this.loadMasterData().then(() => {
                        Swal.fire({toast: true, position: 'top-end', icon: 'success', title: 'บันทึกสำเร็จ', showConfirmButton: false, timer: 1000});
                        this.manageRights(); 
                    });
                });
            } else if (res.isDismissed) { this.manageRights(); }
        });
    }

    confirmDeleteRight(id, name) {
        Swal.fire({
            title: 'ยืนยันการลบ?',
            html: `คุณต้องการลบสิทธิ <b>${name}</b> ใช่หรือไม่?`,
            icon: 'warning', 
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-trash me-1"></i> ลบ', confirmButtonColor: '#ef4444', cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'premium-alert' }
        }).then(res => {
            if(res.isConfirmed) {
                Swal.fire({ title: 'กำลังลบ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                let updated = this.state.clinicRights.filter(x=>x.id !== id);
                db.ref('clinic_rights_v2').set(updated).then(() => {
                    this.loadMasterData().then(() => {
                        Swal.fire({toast: true, position: 'top-end', icon: 'success', title: 'ลบสำเร็จ', showConfirmButton: false, timer: 1000});
                        this.manageRights();
                    });
                });
            } else { this.manageRights(); }
        });
    }

    manageDropdown(type) {
        let title = ''; let placeholder = ''; let dataList = [];
        
        if(type === 'shift') { 
            title = 'ตารางเวรฟอกประจำคลินิก'; placeholder = 'พิมพ์ชื่อเวรใหม่...'; 
            dataList = this.state.clinicShifts; 
        }
        else if(type === 'infection') { 
            title = 'โรคติดเชื้อ (Infection)'; placeholder = 'พิมพ์โรคติดเชื้อใหม่...'; 
            dataList = this.state.clinicInfections; 
        }
        else if(type === 'underlying') { 
            title = 'รายการโรคประจำตัว (List)'; placeholder = 'พิมพ์โรคประจำตัวใหม่...'; 
            dataList = this.state.clinicUnderlyings; 
        }

        let listHtml = dataList.map((item, index) => `
            <div class="d-flex justify-content-between align-items-center p-2 mb-2 rounded border bg-white shadow-sm mx-1">
                <span class="fw-bold" style="color: var(--text-dark);">${this._escapeHTML(item)}</span>
                <button class="btn btn-micro-action btn-micro-delete" onclick="window.PatientFormPage.confirmDeleteDropdownItem('${type}', ${index}, '${this._escapeHTML(item)}')"><i class="fa-solid fa-trash"></i></button>
            </div>
        `).join('');

        Swal.fire({
            title: `<h5 class="fw-bold text-primary mb-0"><i class="fa-solid fa-gear me-2"></i> จัดการ${title}</h5>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Prompt';">
                    <div class="input-group mb-3 shadow-sm" style="border-radius: 12px; overflow:hidden;">
                        <input type="text" id="new-dropdown-item" class="form-control border-0" style="background: var(--bg-body);" placeholder="${placeholder}">
                        <button class="btn btn-primary fw-bold px-4 border-0" onclick="window.PatientFormPage.addDropdownItem('${type}')"><i class="fa-solid fa-plus me-1"></i> เพิ่ม</button>
                    </div>
                    <div style="max-height: 250px; overflow-y: auto;" class="p-2 border rounded-3 bg-light">
                        ${listHtml || '<div class="text-center text-muted small py-3">ยังไม่มีข้อมูล</div>'}
                    </div>
                </div>
            `,
            showConfirmButton: false, showCloseButton: true, customClass: { popup: 'premium-alert' }
        });
    }

    async addDropdownItem(type) {
        let inputEl = document.getElementById('new-dropdown-item');
        if(!inputEl) return;
        let val = inputEl.value.trim();
        if(!val) return;

        Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
            let dbKey = '';
            if(type === 'shift') dbKey = 'shifts';
            else if(type === 'infection') dbKey = 'infections';
            else if(type === 'underlying') dbKey = 'underlyings';

            let snap = await db.ref(`clinic_options_v2/${dbKey}`).once('value');
            let data = snap.val() || [];
            let arr = Array.isArray(data) ? data : Object.keys(data).map(k => data[k]);
            
            if(!arr.includes(val)) {
                arr.push(val);
                await db.ref(`clinic_options_v2/${dbKey}`).set(arr);
            }

            await this.loadMasterData(); 
            this.manageDropdown(type); 
        } catch(e) {
            Swal.fire('ข้อผิดพลาด', e.message, 'error').then(() => this.manageDropdown(type));
        }
    }

    confirmDeleteDropdownItem(type, index, itemName) {
        Swal.fire({
            title: 'ยืนยันการลบ?',
            html: `คุณต้องการลบ <b>${itemName}</b> ออกจากตัวเลือกใช่หรือไม่?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: '<i class="fa-solid fa-trash me-1"></i> ลบรายการ',
            cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'premium-alert' }
        }).then((result) => {
            if (result.isConfirmed) {
                this.deleteDropdownItem(type, index);
            } else {
                this.manageDropdown(type); 
            }
        });
    }

    async deleteDropdownItem(type, index) {
        Swal.fire({ title: 'กำลังลบ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
            let dbKey = '';
            if(type === 'shift') dbKey = 'shifts';
            else if(type === 'infection') dbKey = 'infections';
            else if(type === 'underlying') dbKey = 'underlyings';

            let snap = await db.ref(`clinic_options_v2/${dbKey}`).once('value');
            let data = snap.val() || [];
            let arr = Array.isArray(data) ? data : Object.keys(data).map(k => data[k]);
            
            arr.splice(index, 1);
            await db.ref(`clinic_options_v2/${dbKey}`).set(arr);

            await this.loadMasterData(); 
            this.manageDropdown(type); 
        } catch(e) {
            Swal.fire('ข้อผิดพลาด', e.message, 'error').then(() => this.manageDropdown(type));
        }
    }

    async loadMasterData() {
        try {
            const [rightsSnap, optionsSnap] = await Promise.all([
                db.ref('clinic_rights_v2').once('value'),
                db.ref('clinic_options_v2').once('value')
            ]);

            let currentRight = document.getElementById('add_right') ? document.getElementById('add_right').value : '';
            let currentShift = document.getElementById('add_shift') ? document.getElementById('add_shift').value : '';
            let currentInfection = document.getElementById('add_infection') ? document.getElementById('add_infection').value : '';

            // 🛡️ Rights
            const rightData = rightsSnap.val();
            if(rightData) {
                this.state.clinicRights = Array.isArray(rightData) ? rightData : Object.keys(rightData).map(k => rightData[k]);
            } else {
                this.state.clinicRights = [
                    { id: 'R1', name: 'ชำระเงินเอง', price: 1500 },
                    { id: 'R2', name: 'บัตรทอง (สปสช.)', price: 1500 },
                    { id: 'R3', name: 'ประกันสังคม', price: 1500 }
                ];
                await db.ref('clinic_rights_v2').set(this.state.clinicRights);
            }
            let rightsOptions = this.state.clinicRights.map(r => `<option value="${this._escapeHTML(r.name)}">${this._escapeHTML(r.name)}</option>`).join('');
            if(document.getElementById('add_right')) document.getElementById('add_right').innerHTML = `<option value="">-- เลือกสิทธิ --</option>` + rightsOptions;

            // 🛡️ Options
            let opts = { shifts: [], infections: [], underlyings: [] };
            if (optionsSnap.exists()) {
                const val = optionsSnap.val();
                opts.shifts = val.shifts || [];
                opts.infections = val.infections || [];
                opts.underlyings = val.underlyings || [];
            } else {
                opts = {
                    shifts: ["ไม่ระบุเวรประจำ", "จันทร์-พุธ-ศุกร์ (รอบเช้า)", "จันทร์-พุธ-ศุกร์ (รอบบ่าย)", "อังคาร-พฤหัส-เสาร์ (รอบเช้า)", "อังคาร-พฤหัส-เสาร์ (รอบบ่าย)"],
                    infections: ["ไม่มี", "HBV", "HCV", "HIV"],
                    underlyings: ["HT (ความดันโลหิตสูง)", "DM (เบาหวาน)", "DLP (ไขมันในเลือดสูง)", "Gout (โรคเกาต์)", "IHD (โรคหลอดเลือดหัวใจ)", "SLE (โรคพุ่มพวง)"]
                };
                await db.ref('clinic_options_v2').set(opts);
            }

            this.state.clinicShifts = Array.isArray(opts.shifts) ? opts.shifts : Object.values(opts.shifts);
            this.state.clinicInfections = Array.isArray(opts.infections) ? opts.infections : Object.values(opts.infections);
            this.state.clinicUnderlyings = Array.isArray(opts.underlyings) ? opts.underlyings : Object.values(opts.underlyings);

            const buildOptions = (arr) => arr.map(a => `<option value="${this._escapeHTML(a)}">${this._escapeHTML(a)}</option>`).join('');
            
            if(document.getElementById('add_shift')) document.getElementById('add_shift').innerHTML = `<option value="">-- เลือกเวรประจำ --</option>` + buildOptions(this.state.clinicShifts);
            if(document.getElementById('add_infection')) document.getElementById('add_infection').innerHTML = `<option value="">-- ระบุโรคติดเชื้อ --</option>` + buildOptions(this.state.clinicInfections);
            if(document.getElementById('add_underlying_input')) document.getElementById('add_underlying_input').innerHTML = `<option value="">-- เลือกโรคประจำตัวจากรายการ --</option>` + buildOptions(this.state.clinicUnderlyings);

            // คืนค่าเดิมให้ UI
            if (currentRight && document.getElementById('add_right')) document.getElementById('add_right').value = currentRight;
            if (currentShift && document.getElementById('add_shift')) document.getElementById('add_shift').value = currentShift;
            if (currentInfection && document.getElementById('add_infection')) document.getElementById('add_infection').value = currentInfection;

        } catch (error) {
            console.error("Load Master Data Error:", error);
        }
    }

    async loadPatientData() {
        try {
            let ptData = null;
            let ptSnap = await db.ref(`patients_database_v2/patients/${this.state.hnToEdit}`).once('value');
            if (ptSnap.exists() && ptSnap.val().hn) {
                ptData = ptSnap.val();
            } else {
                const allPtSnap = await db.ref('patients_database_v2/patients').once('value');
                const allData = allPtSnap.val() || {};
                let rawPatients = Object.keys(allData).map(k => ({ firebaseKey: k, ...allData[k] }));
                ptData = rawPatients.find(p => p.hn === this.state.hnToEdit || p.firebaseKey === this.state.hnToEdit);
            }

            if (ptData) {
                this.state.editOriginalData = ptData;
                
                let rawHn = ptData.hn || "";
                document.getElementById('add_hn').value = rawHn.replace(/^HN-?/i, '');
                
                document.getElementById('add_status').value = ptData.status || "ปกติ";
                document.getElementById('add_idcard').value = ptData.idcard || "";
                document.getElementById('add_title').value = ptData.title || "นาย";
                document.getElementById('add_name').value = ptData.name_th || "";
                document.getElementById('add_name_en').value = ptData.name_en || "";
                
                document.getElementById('add_dob').value = ptData.dob || "";
                document.getElementById('add_dob').dispatchEvent(new Event('change')); 

                document.getElementById('add_gender').value = ptData.gender || "ชาย";
                document.getElementById('add_religion').value = ptData.religion || "ไม่ระบุ";
                document.getElementById('add_blood').value = ptData.blood_type || "ไม่ระบุ";
                
                document.getElementById('add_phone').value = ptData.phone || "";
                document.getElementById('add_emergency').value = ptData.emergency_contact || "";
                document.getElementById('add_address').value = ptData.address || "";
                
                let rightEl = document.getElementById('add_right');
                if(rightEl && ptData.right) {
                    let hasOption = Array.from(rightEl.options).some(opt => opt.value === ptData.right);
                    if(!hasOption && ptData.right) rightEl.innerHTML += `<option value="${this._escapeHTML(ptData.right)}">${this._escapeHTML(ptData.right)}</option>`;
                    rightEl.value = ptData.right;
                }

                let shiftEl = document.getElementById('add_shift');
                if(shiftEl && ptData.shift) {
                    let hasOption = Array.from(shiftEl.options).some(opt => opt.value === ptData.shift);
                    if(!hasOption && ptData.shift) shiftEl.innerHTML += `<option value="${this._escapeHTML(ptData.shift)}">${this._escapeHTML(ptData.shift)}</option>`;
                    shiftEl.value = ptData.shift;
                }

                let infEl = document.getElementById('add_infection');
                if(infEl && ptData.infection) {
                    let hasOption = Array.from(infEl.options).some(opt => opt.value === ptData.infection);
                    if(!hasOption && ptData.infection) infEl.innerHTML += `<option value="${this._escapeHTML(ptData.infection)}">${this._escapeHTML(ptData.infection)}</option>`;
                    infEl.value = ptData.infection;
                }

                if (ptData.underlying_disease && ptData.underlying_disease !== "-") {
                    this.state.underlyingTags = ptData.underlying_disease.split(',').map(s => s.trim()).filter(Boolean);
                    this.renderTags();
                }

                if (ptData.photo_base64) {
                    this.state.scannedPhotoBase64 = ptData.photo_base64;
                    document.getElementById('form-avatar').src = ptData.photo_base64.startsWith('data:image') ? ptData.photo_base64 : 'data:image/jpeg;base64,' + ptData.photo_base64;
                }

                document.getElementById('form-loading-screen').style.display = 'none';
                document.getElementById('form-content-area').style.display = 'flex';
            } else {
                Swal.fire('ข้อผิดพลาด', 'ไม่สามารถดึงข้อมูลประวัติผู้ป่วยได้', 'error').then(() => window.App.switchPage('patients'));
            }
        } catch (error) {
            console.error("Load Patient Error:", error);
            Swal.fire('ข้อผิดพลาด', 'ดึงข้อมูลไม่สำเร็จ กรุณาลองใหม่', 'error');
        }
    }

    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
    }

    clearFormBeforeScan() {
        this.state.scannedPhotoBase64 = null;
        
        const inputsToClear = [
            'add_idcard', 'add_name', 'add_name_en', 'add_dob', 
            'add_age', 'add_phone', 'add_emergency', 'add_address'
        ];
        
        inputsToClear.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });

        const titleEl = document.getElementById('add_title');
        if (titleEl) titleEl.value = 'นาย';
        
        const genderEl = document.getElementById('add_gender');
        if (genderEl) genderEl.value = 'ชาย';
        
        const avatarEl = document.getElementById('form-avatar');
        if (avatarEl) avatarEl.src = 'https://ui-avatars.com/api/?name=Patient&background=e2e8f0&color=94a3b8';
    }

    // 🚨 THE FIX 1: Scanner Intercept - ฝังยามหน้าประตู ตรวจบัตร ปชช. ที่เสียบเข้ามาทันที
    async readSmartcard() {
        const btn = document.getElementById('btn-read-card'); 
        btn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> กำลังสื่อสาร... (สูงสุด 15 วิ)`; 
        btn.disabled = true;
        
        this.clearFormBeforeScan();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const timestamp = new Date().getTime();
            const url = `http://127.0.0.1:8000/read-card?_t=${timestamp}`;

            const response = await fetch(url, { 
                method: 'GET', mode: 'cors', cache: 'no-store', 
                headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' },
                signal: controller.signal 
            });

            clearTimeout(timeoutId);

            let result;
            try {
                result = await response.json();
            } catch (parseError) {
                throw new Error("AGENT_OFFLINE"); 
            }
            
            if (!response.ok || result.error || result.status === "error") { 
                Swal.fire({
                    title: 'ข้อผิดพลาดจากเครื่องอ่านบัตร',
                    html: `<b>สาเหตุ:</b> <span class="text-danger">${result.error || 'ไม่ทราบสาเหตุ (Unknown Hardware Error)'}</span><br><br><small class="text-muted">กรุณาขยับสาย USB ของเครื่องอ่านบัตร หรือลองเสียบบัตรให้แน่นอีกครั้ง</small>`,
                    icon: 'error',
                    customClass: {popup: 'premium-alert'}
                }); 
                btn.innerHTML = `<i class="fa-solid fa-id-card me-2 fs-5"></i> <span class="fw-bold fs-6">สแกนบัตร ปชช.</span>`; 
                btn.disabled = false; 
                return; 
            }
            
            const data = result.data || result;

            // 🚨 THE FIX 1 (Action): ส่งข้อมูลให้ยามหน้าประตูตรวจเช็คว่าซ้ำไหม ถ้าซ้ำให้หยุดการทำงานทันที
            if (window.PatientsPageGlobalGuard) {
                let fullNameTh = ((data.fname_th || "") + " " + (data.lname_th || "")).trim();
                let idcardNum = data.cid || data.idcard || "";
                
                let isSafe = await window.PatientsPageGlobalGuard.verifyDuplicateBeforeSave('', idcardNum, fullNameTh);
                
                if (!isSafe) {
                    btn.innerHTML = `<i class="fa-solid fa-id-card me-2 fs-5"></i> <span class="fw-bold fs-6">สแกนบัตร ปชช.</span>`; 
                    btn.disabled = false;
                    return; // ⛔ ไม่อนุญาตให้เอาข้อมูลบัตรมากรอกลงในช่องเด็ดขาด!
                }
            }
            
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
            const dobInput = document.getElementById('add_dob'); 
            dobInput.value = dobStr; 
            dobInput.dispatchEvent(new Event('change')); 

            if (data.photo_base64 || data.photo) {
                let b64 = data.photo_base64 || data.photo; 
                if (!b64.startsWith('data:image')) b64 = 'data:image/jpeg;base64,' + b64;
                document.getElementById('form-avatar').src = b64; 
                this.state.scannedPhotoBase64 = b64.split(',')[1] || b64;
            }
            
            btn.innerHTML = `<i class="fa-solid fa-check-circle me-2 fs-5"></i> <span class="fw-bold fs-6">ดึงข้อมูลสำเร็จ</span>`; 
            btn.className = "btn btn-premium btn-premium-success w-100 py-3 mb-3 shadow-sm"; 
            btn.disabled = false;
            
        } catch (err) {
            clearTimeout(timeoutId);

            if (err.name === 'AbortError') {
                Swal.fire({
                    title: 'หมดเวลารอ (Timeout)', 
                    html: 'เครื่องอ่านบัตรใช้เวลานานเกินไป (เกิน 15 วินาที)<br>กรุณาตรวจสอบว่า:<br>1. เสียบบัตร ปชช. แน่นหรือไม่<br>2. ชิปทองเหลืองสกปรกหรือไม่', 
                    icon: 'warning',
                    customClass: { popup: 'premium-alert' }
                });
            } else {
                Swal.fire({
                    title: 'ไม่สามารถสื่อสารกับระบบอ่านบัตรได้', 
                    html: 'กรุณาตรวจสอบว่า:<br>1. โปรแกรม <b>Dialysis Pro EMR Agent</b> ถูกเปิดใช้งานอยู่หรือไม่<br>2. พอร์ต 8000 ของคอมพิวเตอร์ถูกบล็อกหรือไม่<br><br><small class="text-danger"><i>(Code: AGENT_OFFLINE)</i></small>', 
                    icon: 'warning',
                    customClass: { popup: 'premium-alert' }
                }); 
            }

            btn.innerHTML = `<i class="fa-solid fa-id-card me-2 fs-5"></i> <span class="fw-bold fs-6">สแกนบัตร ปชช.</span>`; 
            btn.className = "btn btn-premium btn-premium-primary w-100 mb-3 py-3 shadow-sm";
            btn.disabled = false;
        }
    }

    // 🚨 THE FIX 2: Save Checkpoint - ฝังยามหน้าประตูตรงปุ่มบันทึก ป้องกันการพิมพ์มือแล้วข้อมูลซ้ำ
    async saveData() {
        let hnInput = document.getElementById('add_hn').value.trim(); 
        hnInput = hnInput.replace(/^HN-?/i, ''); 
        const hn = hnInput ? `HN-${hnInput}` : ''; 
        
        const name = document.getElementById('add_name').value.trim();
        const idcard = document.getElementById('add_idcard').value.trim();

        if (!hnInput || !name) { Swal.fire({title: 'ข้อมูลไม่สมบูรณ์', text: 'กรุณาระบุรหัส HN และ ชื่อ-นามสกุล', icon: 'warning', customClass: {popup: 'premium-alert'}}); return; }
        if (typeof db === 'undefined') return;

        // 🚨 THE FIX 2 (Action): ดักจับก่อนบันทึก! ถ้าเป็นการลงทะเบียนใหม่ ให้ส่งข้อมูลไปถามยามหน้าประตูก่อน
        if (!this.state.isEditMode && window.PatientsPageGlobalGuard) {
            let isSafe = await window.PatientsPageGlobalGuard.verifyDuplicateBeforeSave(hn, idcard, name);
            if (!isSafe) return; // ⛔ ถ้าเป็น false คือยามบอกว่า "ซ้ำ!" จะเบรกและหยุดการ Save ไว้แค่นี้เลย
        }

        Swal.fire({ title: 'กำลังบันทึกข้อมูล...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); }, customClass: { popup: 'premium-alert' } });

        const underlyingValue = this.state.underlyingTags.length > 0 ? this.state.underlyingTags.join(', ') : "-";

        const updatedData = {
            hn: hn, idcard: idcard || "-", title: document.getElementById('add_title').value,
            name_th: name, name_en: document.getElementById('add_name_en').value.trim(), dob: document.getElementById('add_dob').value,
            age: document.getElementById('add_age').value, gender: document.getElementById('add_gender').value, religion: document.getElementById('add_religion').value,
            blood_type: document.getElementById('add_blood').value, phone: document.getElementById('add_phone').value.trim() || "-",
            emergency_contact: document.getElementById('add_emergency').value.trim() || "-", address: document.getElementById('add_address').value.trim() || "-",
            right: document.getElementById('add_right').value, shift: document.getElementById('add_shift').value,
            infection: document.getElementById('add_infection').value, allergy: document.getElementById('add_allergy').value.trim() || "ไม่มี",
            dry_bw: document.getElementById('add_drybw').value || "0", underlying_disease: underlyingValue,
            status: document.getElementById('add_status').value, photo_base64: this.state.scannedPhotoBase64
        };

        db.ref('patients_database_v2/patients').once('value', snap => {
            let currentList = snap.val() || [];
            if (!Array.isArray(currentList)) { currentList = Object.keys(currentList).map(k => currentList[k]); }
            
            if (this.state.isEditMode && this.state.editOriginalData) {
                const targetIndex = currentList.findIndex(p => p.hn === this.state.editOriginalData.hn || p.hn === hn);
                if (targetIndex !== -1) currentList[targetIndex] = { ...currentList[targetIndex], ...updatedData };
            } else {
                updatedData.id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
                updatedData.register_date = new Date().toISOString(); updatedData.history = []; updatedData.labs = []; updatedData.medications = [];
                currentList.push(updatedData);
            }

            db.ref('patients_database_v2/patients').set(currentList)
                .then(() => { 
                    Swal.fire({ title: 'บันทึกสำเร็จ!', text: `อัปเดตข้อมูลเวชระเบียนเรียบร้อย`, icon: 'success', timer: 1500, showConfirmButton: false, customClass: {popup: 'premium-alert'} })
                    .then(() => { window.App.switchPage('patients'); }); 
                })
                .catch(err => { Swal.fire({title: 'เกิดข้อผิดพลาด', text: err.message, icon: 'error', customClass: {popup: 'premium-alert'}}); });
        });
    }

    _escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
}

const PatientFormPage = new PatientFormPageComponent();
window.PatientFormPage = PatientFormPage;