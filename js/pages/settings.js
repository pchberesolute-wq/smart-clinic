// js/pages/settings.js
// 🚀 Enterprise Settings Module: Full Component, Memory-Leak Free & XSS Protected

class SettingsPageComponent {
    constructor() {
        this.state = {
            allUsers: [],
            labSets: [],
            noteTemplates: [],
            medsList: [],
            xraysList: [],
            currentNoteFilter: 'all'
        };
        
        this.roleConfig = {
            'admin': { label: 'ผู้ดูแลระบบ', icon: 'fa-user-shield', color: 'danger' },
            'doctor': { label: 'แพทย์', icon: 'fa-user-doctor', color: 'success' },
            'head_nurse': { label: 'หัวหน้าพยาบาล', icon: 'fa-user-nurse', color: 'primary' },
            'nurse': { label: 'พยาบาล', icon: 'fa-user-nurse', color: 'info' },
            'assistant': { label: 'ผู้ช่วยพยาบาล (PN/NA)', icon: 'fa-user-plus', color: 'secondary' },
            'finance': { label: 'การเงิน/บัญชี', icon: 'fa-file-invoice-dollar', color: 'warning' },
            'stock': { label: 'เจ้าหน้าที่พัสดุ', icon: 'fa-boxes-stacked', color: 'dark' }
        };

        this.firebaseListeners = [];
    }

    get html() {
        return `
            <div class="page-header mb-4">
                <div>
                    <h2 class="page-title text-primary"><i class="fa-solid fa-sliders me-2"></i> ตั้งค่าระบบและข้อมูลคลินิก</h2>
                    <p class="text-muted mt-1 mb-0">จัดการข้อมูลสถานพยาบาล, สิทธิ์การเข้าถึง และฐานข้อมูลทางการแพทย์ (Master Data)</p>
                </div>
            </div>

            <ul class="nav settings-nav-tabs mb-4" id="settingsTabs" role="tablist">
                <li class="nav-item" role="presentation"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#clinic-panel" type="button" role="tab"><i class="fa-solid fa-building-user me-2"></i> ข้อมูลคลินิกและบริษัท</button></li>
                <li class="nav-item" role="presentation"><button class="nav-link text-info" data-bs-toggle="tab" data-bs-target="#users-panel" type="button" role="tab"><i class="fa-solid fa-users-gear me-2"></i> จัดการไอดีล็อคอิน</button></li>
                <li class="nav-item" role="presentation"><button class="nav-link text-danger" data-bs-toggle="tab" data-bs-target="#medical-panel" type="button" role="tab"><i class="fa-solid fa-briefcase-medical me-2"></i> ตั้งค่าทางการแพทย์</button></li>
            </ul>

            <div class="tab-content" id="settingsTabContent">
                
                <div class="tab-pane fade show active" id="clinic-panel" role="tabpanel">
                    <div class="modern-panel p-4 pt-5 mb-4" style="border-top: 4px solid var(--primary); border-radius: 16px;">
                        <div style="position: absolute; top: -20px; right: -20px; opacity: 0.03; font-size: 250px;"><i class="fa-solid fa-hospital-user"></i></div>
                        <h5 class="fw-bold text-dark mb-4 position-relative"><i class="fa-solid fa-hospital text-primary me-2"></i> ข้อมูลพื้นฐานสถานพยาบาล (Clinic Info)</h5>
                        <div class="row g-4 position-relative">
                            
                            <div class="col-md-12">
                                <label class="form-label fw-bold text-secondary small">โลโก้คลินิก (สำหรับแสดงหน้าระบบและนามบัตร)</label>
                                <div class="d-flex align-items-center gap-3">
                                    <div class="logo-preview-box" id="clinic-logo-preview-container">
                                        <span class="text-muted small"><i class="fa-solid fa-image fa-2x"></i></span>
                                    </div>
                                    <div>
                                        <input type="file" id="file-clinic-logo" class="form-control input-modern mb-2" accept="image/jpeg, image/png, image/webp" onchange="App.pages.settings.handleLogoUpload(event, 'hidden-clinic-logo-base64', 'clinic-logo-preview-container')">
                                        <div class="d-flex gap-2">
                                            <button class="btn btn-outline-primary fw-bold btn-sm rounded-pill px-3 shadow-sm" onclick="App.pages.settings.promptPrintCard('clinic')"><i class="fa-solid fa-print me-1"></i> พิมพ์นามบัตรสถานพยาบาล</button>
                                            <button class="btn btn-outline-danger fw-bold btn-sm rounded-pill px-3 shadow-sm" onclick="App.pages.settings.deleteLogo('clinic')"><i class="fa-solid fa-trash me-1"></i> ลบโลโก้</button>
                                        </div>
                                    </div>
                                </div>
                                <input type="hidden" id="hidden-clinic-logo-base64">
                            </div>

                            <div class="col-md-6">
                                <label class="form-label fw-bold text-secondary small">ชื่อคลินิก / สถานพยาบาล</label>
                                <input type="text" id="set-clinic-name" class="form-control input-modern text-primary fw-bold">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold text-secondary small">รหัสสถานพยาบาล 11 หลัก</label>
                                <input type="text" id="set-clinic-id" class="form-control input-modern">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold text-secondary small">เบอร์โทรศัพท์คลินิก</label>
                                <input type="text" id="set-clinic-phone" class="form-control input-modern">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold text-secondary small">Email คลินิก (ถ้ามี)</label>
                                <input type="text" id="set-clinic-email" class="form-control input-modern">
                            </div>
                            <div class="col-12">
                                <label class="form-label fw-bold text-secondary small">ที่อยู่คลินิก (สำหรับพิมพ์ลงเอกสารใบรับรอง)</label>
                                <textarea id="set-clinic-address" class="form-control input-modern" rows="2"></textarea>
                            </div>
                        </div>
                        
                        <hr class="my-5 border-light">

                        <h5 class="fw-bold text-dark mb-4 position-relative"><i class="fa-solid fa-building text-warning me-2"></i> ข้อมูลบริษัทจดทะเบียน (Company & Tax Info)</h5>
                        <div class="row g-4 position-relative">
                            <div class="col-md-12">
                                <label class="form-label fw-bold text-secondary small">โลโก้บริษัท (สำหรับใบเสร็จรับเงิน/ใบกำกับภาษี)</label>
                                <div class="d-flex align-items-center gap-3">
                                    <div class="logo-preview-box" id="company-logo-preview-container">
                                        <span class="text-muted small"><i class="fa-solid fa-image fa-2x"></i></span>
                                    </div>
                                    <div>
                                        <input type="file" id="file-company-logo" class="form-control input-modern mb-2" accept="image/jpeg, image/png, image/webp" onchange="App.pages.settings.handleLogoUpload(event, 'hidden-company-logo-base64', 'company-logo-preview-container')">
                                        <div class="d-flex gap-2">
                                            <button class="btn btn-outline-warning text-dark fw-bold btn-sm rounded-pill px-4 shadow-sm" onclick="App.pages.settings.promptPrintCard('company')"><i class="fa-solid fa-print me-2"></i> พิมพ์นามบัตรใบกำกับภาษี</button>
                                            <button class="btn btn-outline-danger fw-bold btn-sm rounded-pill px-3 shadow-sm" onclick="App.pages.settings.deleteLogo('company')"><i class="fa-solid fa-trash me-1"></i> ลบโลโก้</button>
                                        </div>
                                    </div>
                                </div>
                                <input type="hidden" id="hidden-company-logo-base64">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold text-secondary small">ชื่อบริษัท / นิติบุคคล (Company Name)</label>
                                <input type="text" id="set-company-name" class="form-control input-modern fw-bold">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold text-secondary small">เลขประจำตัวผู้เสียภาษี (Tax ID)</label>
                                <input type="text" id="set-clinic-tax" class="form-control input-modern text-danger fw-bold" placeholder="เลข 13 หลัก">
                            </div>
                            <div class="col-12">
                                <label class="form-label fw-bold text-secondary small">ที่อยู่บริษัทจดทะเบียน (สำหรับออกใบกำกับภาษี / ใบเสร็จรับเงิน)</label>
                                <textarea id="set-company-address" class="form-control input-modern" rows="2"></textarea>
                            </div>
                        </div>
                        
                        <div class="text-end mt-5 pt-4 border-top">
                            <button class="btn btn-premium btn-premium-primary px-5" onclick="App.pages.settings.saveClinicInfo()">
                                <i class="fa-solid fa-cloud-arrow-up me-2"></i> บันทึกข้อมูลบริษัทและคลินิก
                            </button>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="users-panel" role="tabpanel">
                    <div class="modern-panel p-4" style="border-top: 4px solid var(--info); border-radius: 16px;">
                        <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 300px; pointer-events: none;"><i class="fa-solid fa-users-gear"></i></div>
                        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 position-relative z-1">
                            <div><h5 class="fw-bold text-dark mb-1"><i class="fa-solid fa-users-viewfinder text-info me-2"></i> รายชื่อผู้ใช้งานในระบบ</h5><p class="text-muted small mb-0">จัดการไอดีล็อคอิน, สิทธิ์การเข้าถึง (Role) และสถานะบัญชี</p></div>
                            <div class="d-flex gap-2">
                                <button class="btn btn-outline-danger fw-bold shadow-sm rounded-pill px-4" onclick="App.pages.settings.setAdminPin()"><i class="fa-solid fa-key me-2"></i> ตั้งค่า PIN รีเซ็ตรหัส</button>
                                <button class="btn btn-premium btn-premium-primary text-white fw-bold shadow-sm rounded-pill px-4" onclick="App.pages.settings.openUserModal()"><i class="fa-solid fa-user-plus me-2"></i> เพิ่มผู้ใช้งานใหม่</button>
                            </div>
                        </div>
                        <div class="table-responsive bg-white rounded-3 shadow-sm border border-light position-relative z-1">
                            <table class="table table-premium w-100 mb-0">
                                <thead>
                                    <tr>
                                        <th style="width: 28%;"><i class="fa-solid fa-user-tag me-2"></i> ผู้ใช้งาน (Name)</th>
                                        <th style="width: 22%;"><i class="fa-solid fa-fingerprint me-2"></i> ไอดี (Username)</th>
                                        <th class="text-center" style="width: 15%;"><i class="fa-solid fa-shield-halved me-2"></i> ระดับสิทธิ์</th>
                                        <th class="text-center" style="width: 15%;"><i class="fa-solid fa-toggle-on me-2"></i> สถานะ</th>
                                        <th class="text-center" style="width: 20%;"><i class="fa-solid fa-gears me-2"></i> จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody id="users-table-body">
                                    <tr><td colspan="5" class="text-center py-5 text-muted"><i class="fas fa-spinner fa-spin fa-2x mb-3"></i><br>กำลังโหลดข้อมูลผู้ใช้งาน...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="medical-panel" role="tabpanel">
                    <div class="modern-panel mb-4 p-4" style="border-top: 4px solid var(--danger); border-radius: 16px;">
                        <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                            <div><h5 class="fw-bold text-dark mb-1"><i class="fa-solid fa-vial-virus text-danger me-2"></i> 1. จัดการชุดผลแล็บ และ ราคา (Lab Sets)</h5><p class="text-muted small mb-0">ตั้งค่าชุดแล็บและราคาเหมาชุด สำหรับดึงข้อมูลในหน้า Flowsheet</p></div>
                            <button class="btn btn-outline-danger fw-bold shadow-sm rounded-pill px-4" onclick="App.pages.settings.openLabSetModal()"><i class="fa-solid fa-plus me-1"></i> สร้างชุดแล็บใหม่</button>
                        </div>
                        <div class="row g-3" id="lab-sets-container"><div class="col-12 text-center py-4 text-muted"><i class="fas fa-spinner fa-spin"></i> กำลังโหลดข้อมูล...</div></div>
                    </div>

                    <div class="row g-4 mb-4">
                        <div class="col-xl-6">
                            <div class="modern-panel p-4 h-100" style="border-top: 4px solid #8b5cf6; border-radius: 16px;">
                                <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                                    <div><h5 class="fw-bold text-dark mb-1" style="color: #8b5cf6 !important;"><i class="fa-solid fa-syringe me-2"></i> 2. ยาฉีด/เวชภัณฑ์ (Meds)</h5></div>
                                    <button class="btn text-white fw-bold shadow-sm rounded-pill px-3" style="background:#8b5cf6;" onclick="App.pages.settings.openMedListModal()"><i class="fa-solid fa-plus me-1"></i> เพิ่มรายการ</button>
                                </div>
                                <div class="d-flex flex-wrap gap-2" id="meds-list-container"></div>
                            </div>
                        </div>
                        <div class="col-xl-6">
                            <div class="modern-panel p-4 h-100" style="border-top: 4px solid #14b8a6; border-radius: 16px;">
                                <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                                    <div><h5 class="fw-bold text-dark mb-1" style="color: #14b8a6 !important;"><i class="fa-solid fa-x-ray me-2"></i> 3. รายการเอ็กซเรย์ (X-Ray)</h5></div>
                                    <button class="btn text-white fw-bold shadow-sm rounded-pill px-3" style="background:#14b8a6;" onclick="App.pages.settings.openXrayModal()"><i class="fa-solid fa-plus me-1"></i> เพิ่มรายการ</button>
                                </div>
                                <div class="d-flex flex-wrap gap-2" id="xrays-list-container"></div>
                            </div>
                        </div>
                    </div>

                    <div class="modern-panel mb-4 p-4" style="border-top: 4px solid var(--warning); border-radius: 16px;">
                        <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                            <div><h5 class="fw-bold text-dark mb-1"><i class="fa-solid fa-file-signature text-warning me-2"></i> 4. เทมเพลตบันทึกการรักษา (Progress Notes)</h5><p class="text-muted small mb-0">ข้อความมาตรฐานเพื่อช่วยให้พยาบาลบันทึกอาการได้รวดเร็ว</p></div>
                            <button class="btn btn-outline-warning text-dark fw-bold shadow-sm rounded-pill px-4" onclick="App.pages.settings.openNoteTemplateModal()"><i class="fa-solid fa-plus me-1"></i> สร้างเทมเพลต</button>
                        </div>
                        <ul class="nav nav-pills mb-4 p-2 bg-light rounded-pill flex-wrap" id="note-category-tabs" role="tablist" style="gap: 5px; display: inline-flex;">
                            <li class="nav-item"><button class="nav-link active fw-bold px-4 rounded-pill" onclick="App.pages.settings.filterNotes('all')"><i class="fa-solid fa-layer-group me-1"></i> ทั้งหมด</button></li>
                            <li class="nav-item"><button class="nav-link fw-bold px-3 rounded-pill text-primary" onclick="App.pages.settings.filterNotes('pre')">อาการก่อนฟอก</button></li>
                            <li class="nav-item"><button class="nav-link fw-bold px-3 rounded-pill text-danger" onclick="App.pages.settings.filterNotes('intra')">แทรกซ้อน (Intra)</button></li>
                            <li class="nav-item"><button class="nav-link fw-bold px-3 rounded-pill text-success" onclick="App.pages.settings.filterNotes('post')">สรุปหลังฟอก</button></li>
                            <li class="nav-item"><button class="nav-link fw-bold px-3 rounded-pill text-info" onclick="App.pages.settings.filterNotes('doctor')"><i class="fa-solid fa-user-doctor me-1"></i> คำสั่งแพทย์</button></li>
                        </ul>
                        <div class="row g-3" id="note-templates-container"></div>
                    </div>

                </div>
            </div>
        `;
    }

    // 🚀 Lifecycle: Mount
    init() {
        if (typeof db === 'undefined') return;
        
        const toArray = (snapVal) => {
            if (!snapVal) return [];
            let arr = Array.isArray(snapVal) ? snapVal : Object.keys(snapVal).map(k => snapVal[k]);
            return arr.filter(item => item !== null && typeof item === 'object');
        };

        const cbClinic = db.ref('clinic_settings_v2').on('value', snap => {
            const data = snap.val() || {};
            if(document.getElementById('set-clinic-name')) {
                document.getElementById('set-clinic-name').value = data.clinic_name || '';
                document.getElementById('set-clinic-id').value = data.clinic_id || '';
                document.getElementById('set-clinic-phone').value = data.phone || '';
                document.getElementById('set-clinic-email').value = data.email || '';
                document.getElementById('set-clinic-address').value = data.address || '';
                
                document.getElementById('set-company-name').value = data.company_name || '';
                document.getElementById('set-clinic-tax').value = data.tax_id || '';
                document.getElementById('set-company-address').value = data.company_address || '';
                
                if(data.clinic_logo_base64) {
                    document.getElementById('clinic-logo-preview-container').innerHTML = `<img src="${data.clinic_logo_base64}">`;
                    document.getElementById('hidden-clinic-logo-base64').value = data.clinic_logo_base64;
                } else {
                    document.getElementById('clinic-logo-preview-container').innerHTML = '<span class="text-muted small"><i class="fa-solid fa-image fa-2x"></i></span>';
                    document.getElementById('hidden-clinic-logo-base64').value = '';
                }
                
                if(data.company_logo_base64) {
                    document.getElementById('company-logo-preview-container').innerHTML = `<img src="${data.company_logo_base64}">`;
                    document.getElementById('hidden-company-logo-base64').value = data.company_logo_base64;
                } else {
                    document.getElementById('company-logo-preview-container').innerHTML = '<span class="text-muted small"><i class="fa-solid fa-image fa-2x"></i></span>';
                    document.getElementById('hidden-company-logo-base64').value = '';
                }
            }
        });
        this.firebaseListeners.push({ path: 'clinic_settings_v2', callback: cbClinic });

        const cbUsers = db.ref('clinic_users_v2').on('value', snap => { 
            this.state.allUsers = toArray(snap.val()); 
            this.renderUsersTable(); 
        });
        this.firebaseListeners.push({ path: 'clinic_users_v2', callback: cbUsers });

        const cbLabs = db.ref('clinic_lab_sets_v2').on('value', snap => { 
            let _labs = toArray(snap.val());
            this.state.labSets = _labs.length > 0 ? _labs : [{ id: 'LS1', name: 'Monthly Lab (ประจำเดือน)', price: 1500, items: ['BUN', 'Cr', 'K', 'Ca', 'P', 'Hct'] }]; 
            this.renderLabSets(); 
        });
        this.firebaseListeners.push({ path: 'clinic_lab_sets_v2', callback: cbLabs });
        
        const cbMeds = db.ref('clinic_meds_list_v2').on('value', snap => { 
            let _meds = toArray(snap.val());
            this.state.medsList = _meds.length > 0 ? _meds : [{ id: 'M1', name: 'Erythropoietin (EPO) 4000U', price: 300 }, { id: 'M2', name: 'Iron Sucrose 100mg', price: 150 }]; 
            this.renderMedsList(); 
        });
        this.firebaseListeners.push({ path: 'clinic_meds_list_v2', callback: cbMeds });

        const cbXrays = db.ref('clinic_xray_list_v2').on('value', snap => { 
            let _xrays = toArray(snap.val());
            this.state.xraysList = _xrays.length > 0 ? _xrays : [{ id: 'X1', name: 'CXR (Chest X-Ray)', price: 350 }]; 
            this.renderXrayList(); 
        });
        this.firebaseListeners.push({ path: 'clinic_xray_list_v2', callback: cbXrays });

        const cbNotes = db.ref('clinic_note_templates_v2').on('value', snap => {
            let _notes = toArray(snap.val());
            let defaultNotes = [
                { id: 'NT_PRE1', category: 'pre', title: 'อาการปกติ (มารับการฟอก)', text: 'ผู้ป่วยรู้สึกตัวดี มารับการฟอกเลือดตามนัด ไม่มีอาการหอบเหนื่อย บวม หรือเจ็บแน่นหน้าอก สัญญาณชีพอยู่ในเกณฑ์ปกติ Vascular access ทำงานได้ดี' },
                { id: 'NT_PRE2', category: 'pre', title: 'มีอาการน้ำเกิน/หอบเหนื่อย', text: 'ผู้ป่วยมีอาการหอบเหนื่อย นอนราบไม่ได้ ขาบวม 2 ข้าง ฟังปอดพบ crepitation ประเมินมีภาวะน้ำเกิน (Volume Overload)' },
                { id: 'NT_PRE3', category: 'pre', title: 'มีความดันโลหิตสูง', text: 'ประเมินก่อนฟอกเลือดพบความดันโลหิตสูง (Hypertension) ผู้ป่วยแจ้งว่าทานยาลดความดันมาแล้ว ไม่มีอาการปวดศีรษะหรือตาพร่ามัว' },
                { id: 'NT_INTRA1', category: 'intra', title: 'ความดันตก (Hypotension)', text: 'ระหว่างฟอกเลือด ผู้ป่วยมีอาการหน้ามืด ใจสั่น เหงื่อแตก วัดความดันโลหิตพบว่าลดลง (Hypotension)\n- ปรับลด UFR\n- ให้ 0.9% NSS 100 ml IV\n- ปรับท่านอนราบยกขาสูง\nหลังให้การพยาบาล ผู้ป่วยอาการดีขึ้น ความดันโลหิตกลับมาอยู่ในเกณฑ์ที่รับได้' },
                { id: 'NT_INTRA2', category: 'intra', title: 'ตะคริว (Cramps)', text: 'ผู้ป่วยมีอาการตะคริวที่บริเวณกล้ามเนื้อขา\n- ปรับลด UFR หรือหยุด UFR ชั่วคราว\n- นวดคลึงกล้ามเนื้อ\n- ให้ 0.9% NSS 100 ml IV\nอาการตะคริวทุเลาลง สามารถฟอกเลือดต่อได้จนจบ' },
                { id: 'NT_INTRA3', category: 'intra', title: 'หนาวสั่น (Chills)', text: 'ผู้ป่วยมีอาการหนาวสั่นระหว่างฟอกเลือด วัดอุณหภูมิร่างกายปกติ ไม่มีไข้ ให้การพยาบาลโดยห่มผ้าให้อบอุ่น และปรับอุณหภูมิน้ำยา (Dialysate Temp) ให้เหมาะสม อาการทุเลาลง' },
                { id: 'NT_POST1', category: 'post', title: 'สรุปการรักษาปกติ (จบเคส)', text: 'ฟอกเลือดครบตามเวลาที่กำหนด ดึงน้ำได้ตามเป้าหมาย (Target UF) สัญญาณชีพหลังฟอกอยู่ในเกณฑ์ปกติ ไม่มีเลือดออกซึมบริเวณจุดแทงเข็ม ผู้ป่วยรู้สึกตัวดี อนุญาตให้กลับบ้านได้' },
                { id: 'NT_POST2', category: 'post', title: 'ดึงน้ำไม่ได้ตามเป้า', text: 'จบการฟอกเลือด ดึงน้ำได้ไม่ถึงเป้าหมาย เนื่องจากระหว่างฟอกมีอาการความดันโลหิตตก (Hypotension) สัญญาณชีพหลังฟอกทรงตัว แนะนำผู้ป่วยจำกัดน้ำดื่มอย่างเคร่งครัด' },
                { id: 'NT_POST3', category: 'post', title: 'เลือดซึมจุดแทงเข็ม', text: 'หลังถอดเข็มพบมีเลือดซึมเล็กน้อยบริเวณ Vascular access ให้การพยาบาลโดยกดห้ามเลือด (Direct pressure) นาน 15 นาที เลือดหยุดไหลดี ไม่มี Hematoma' },
                { id: 'NT_DOC1', category: 'doctor', title: 'ปรับ Dry Weight ใหม่', text: 'Order: ปรับลด Dry Weight ลง 0.5 Kg เนื่องจากผู้ป่วยไม่มีอาการบวม และความดันโลหิตอยู่ในเกณฑ์ดี' },
                { id: 'NT_DOC2', category: 'doctor', title: 'ปรับลดยาลดความดัน', text: 'Order: พิจารณา Hold ยาลดความดันโลหิตในวันฟอกเลือด เนื่องจากมีประวัติความดันตก (Intradialytic Hypotension) บ่อยครั้ง' },
                { id: 'NT_DOC3', category: 'doctor', title: 'สั่งเจาะ Lab เพิ่มเติม', text: 'Order: สั่งเจาะเลือดตรวจ CBC, BUN, Cr, Electrolyte เพิ่มเติมในการฟอกเลือดครั้งถัดไป' }
            ];
            this.state.noteTemplates = _notes.length > 0 ? _notes.map(n => ({...n, category: n.category || 'general'})) : defaultNotes; 
            this.renderNoteTemplates();
        });
        this.firebaseListeners.push({ path: 'clinic_note_templates_v2', callback: cbNotes });
    }

    // 🧹 Lifecycle: Unmount
    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        console.log("🧹 [Settings] Cleaned up listeners.");
    }

    // ---------------------------------------------------------
    // ⚙️ Clinic Info
    // ---------------------------------------------------------
    setAdminPin() {
        Swal.fire({
            title: '<h4 class="text-danger fw-bold"><i class="fa-solid fa-key me-2"></i> ตั้งค่า Admin PIN</h4>',
            html: '<div class="text-start mt-3"><label class="small text-secondary fw-bold">กรอก PIN ใหม่ (ตัวเลข 4-6 หลัก) สำหรับใช้เป็นมาสเตอร์คีย์ในการรีเซ็ตรหัสผ่านให้พนักงาน</label><input type="password" id="swal-admin-pin" class="form-control input-modern text-center fw-bold text-danger fs-4 tracking-widest mt-2" placeholder="******" maxlength="6" oninput="this.value=this.value.replace(/[^0-9]/g,\'\')"></div>',
            showCancelButton: true, confirmButtonText: 'บันทึก PIN', confirmButtonColor: '#ef4444', cancelButtonText: 'ยกเลิก',
            preConfirm: () => {
                const pin = document.getElementById('swal-admin-pin').value;
                if(pin.length < 4) { Swal.showValidationMessage('กรุณาตั้ง PIN อย่างน้อย 4 ตัวเลข'); return false; }
                return pin;
            }
        }).then(res => {
            if(res.isConfirmed) {
                Swal.fire({title:'กำลังบันทึก...', didOpen:()=>Swal.showLoading()});
                db.ref('clinic_settings_v2/admin_pin').set(res.value).then(() => {
                    Swal.fire({title:'สำเร็จ!', text:'ตั้งค่า Admin PIN เรียบร้อยแล้ว สามารถใช้ PIN นี้รีเซ็ตรหัสผ่านที่หน้าล็อคอินได้ทันที', icon:'success'});
                }).catch(()=> Swal.fire('Error','บันทึกไม่สำเร็จ','error'));
            }
        });
    }

    deleteLogo(type) {
        const hiddenId = type === 'clinic' ? 'hidden-clinic-logo-base64' : 'hidden-company-logo-base64';
        const previewId = type === 'clinic' ? 'clinic-logo-preview-container' : 'company-logo-preview-container';
        const fileId = type === 'clinic' ? 'file-clinic-logo' : 'file-company-logo';

        document.getElementById(hiddenId).value = '';
        document.getElementById(previewId).innerHTML = '<span class="text-muted small"><i class="fa-solid fa-image fa-2x"></i></span>';
        if(document.getElementById(fileId)) document.getElementById(fileId).value = '';

        Swal.fire({ title: 'ลบรูปโลโก้เตรียมพร้อม', text: 'กรุณากดปุ่ม "บันทึกข้อมูลบริษัทและคลินิก" เพื่อยืนยันการลบออกจากระบบครับ', icon: 'success', timer: 2000, showConfirmButton: false });
    }

    handleLogoUpload(event, hiddenInputId, previewContainerId) {
        const file = event.target.files[0];
        if(!file) return;
        
        if(!file.type.match('image.*')) { 
            Swal.fire('ข้อผิดพลาด', 'กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น (JPG, PNG)', 'error'); 
            event.target.value = ''; 
            return; 
        }
        
        Swal.fire({ title: 'กำลังบีบอัดภาพโลโก้...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 400; const MAX_HEIGHT = 400;
                let width = img.width; let height = img.height;
                
                if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } 
                else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
                
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
                
                document.getElementById(previewContainerId).innerHTML = `<img src="${compressedBase64}">`;
                document.getElementById(hiddenInputId).value = compressedBase64;
                Swal.close();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    generateWatermarkImage(base64) {
        return new Promise(resolve => {
            if (!base64) { resolve(''); return; }
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width; 
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.filter = 'grayscale(100%) contrast(120%) opacity(12%)';
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => resolve('');
            img.src = base64;
        });
    }

    promptPrintCard(type) {
        let titleHtml = type === 'clinic' ? '<i class="fa-solid fa-hospital text-primary me-2"></i> สั่งพิมพ์นามบัตรคลินิก' : '<i class="fa-solid fa-building text-warning me-2"></i> สั่งพิมพ์นามบัตรใบกำกับภาษี';
        
        Swal.fire({
            title: `<h4 class="fw-bold mb-0" style="font-family:'Prompt';">${titleHtml}</h4>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <div class="alert alert-warning border-warning shadow-sm small py-2 px-3 mb-3"><i class="fa-solid fa-triangle-exclamation me-1"></i> <b>อย่าลืม!</b> ตอนหน้าต่าง Print เด้งขึ้นมา ให้ติ๊ก <b>"Background graphics"</b> เพื่อให้สีและธีมแสดงผลครับ</div>
                    <label class="fw-bold text-secondary small">เลือกธีมสี (Card Theme)</label>
                    <select id="print-theme" class="form-select input-modern mb-3 shadow-sm" style="font-family:'Prompt'; font-weight: 600;">
                        <option value="theme-modern-blue">🔵 Modern Blue (แถบฟ้า + ลายเรขาคณิต)</option>
                        <option value="theme-elegant-gold">🟡 Elegant Gold (แถบทอง + หรูหรา)</option>
                        <option value="theme-emerald-geo">🟢 Emerald Geo (แถบเขียว + ลายตารางเพชร)</option>
                        <option value="theme-rose-wave">🔴 Rose Wave (แถบชมพู + ลายคลื่น)</option>
                        <option value="theme-clean-white" selected>⚪ Clean White (เรียบหรู มินิมอล)</option>
                    </select>
                    <label class="fw-bold text-secondary small">ระบุจำนวนใบที่ต้องการพิมพ์</label>
                    <div class="d-flex align-items-center justify-content-center mt-2 mb-3">
                        <button class="btn btn-light border shadow-sm fw-bold px-3" style="font-size:20px;" onclick="document.getElementById('print-qty').stepDown()">-</button>
                        <input type="number" id="print-qty" class="form-control text-center fw-bold text-primary mx-2 shadow-sm" value="10" min="1" max="100" style="font-size: 20px; width: 100px;">
                        <button class="btn btn-light border shadow-sm fw-bold px-3" style="font-size:20px;" onclick="document.getElementById('print-qty').stepUp()">+</button>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-print me-1"></i> สร้างพรีวิว',
            confirmButtonColor: '#2563eb',
            cancelButtonText: 'ยกเลิก',
            preConfirm: () => { 
                return {
                    qty: parseInt(document.getElementById('print-qty').value) || 10,
                    theme: document.getElementById('print-theme').value
                }; 
            }
        }).then((result) => {
            if (result.isConfirmed) { this.executePrintCards(type, result.value.qty, result.value.theme); }
        });
    }

    async executePrintCards(type, qty, themeClass) {
        Swal.fire({ title: 'กำลังสร้างเลย์เอาต์ระดับ Enterprise...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        let cardName, idLabel, idValue, cardPhone, cardEmail, cardAddress, logoBase64;

        if (type === 'clinic') {
            cardName = document.getElementById('set-clinic-name').value.trim() || 'DIALYSIS PRO CLINIC';
            idLabel = 'รหัสสถานพยาบาล';
            idValue = document.getElementById('set-clinic-id').value.trim() || '-';
            cardPhone = document.getElementById('set-clinic-phone').value.trim() || '-';
            cardEmail = document.getElementById('set-clinic-email').value.trim() || '-';
            cardAddress = document.getElementById('set-clinic-address').value.trim() || '-';
            logoBase64 = document.getElementById('hidden-clinic-logo-base64').value || '';
        } else {
            cardName = document.getElementById('set-company-name').value.trim() || document.getElementById('set-clinic-name').value.trim() || 'บริษัท ตัวอย่าง จำกัด';
            idLabel = 'TAX ID';
            idValue = document.getElementById('set-clinic-tax').value.trim() || '-';
            cardPhone = document.getElementById('set-clinic-phone').value.trim() || '-'; 
            cardEmail = document.getElementById('set-clinic-email').value.trim() || '-';
            cardAddress = document.getElementById('set-company-address').value.trim() || document.getElementById('set-clinic-address').value.trim() || '-';
            logoBase64 = document.getElementById('hidden-company-logo-base64').value || '';
        }
        
        let logoHtml = logoBase64 
            ? `<div class="logo-wrapper"><img src="${logoBase64}" class="logo-img"></div>` 
            : `<div class="logo-wrapper placeholder-logo"><i class="fa-solid fa-building text-secondary fa-2x"></i></div>`;
            
        let processedWatermarkBase64 = await this.generateWatermarkImage(logoBase64);

        let watermarkHtml = processedWatermarkBase64 
            ? `<div class="watermark-container"><img src="${processedWatermarkBase64}"></div>` 
            : `<div class="watermark-container" style="opacity: 0.08 !important;"><i class="fa-solid fa-building"></i></div>`;

        let cardsHtml = '';
        for (let i = 0; i < qty; i++) {
            cardsHtml += `
            <div class="business-card ${themeClass}">
                <div class="card-bg-wash"></div>
                <div class="pattern-overlay"></div>
                ${watermarkHtml}
                <div class="content-layer">
                    <div class="header-section">
                        ${logoHtml}
                        <div class="title-wrapper">
                            <div class="company-name-container">
                                <div class="company-name-text">${this.#escapeHTML(cardName)}</div>
                            </div>
                            <div class="tax-badge-wrapper">
                                <div class="tax-badge">${idLabel}: ${this.#escapeHTML(idValue)}</div>
                            </div>
                        </div>
                    </div>
                    <div class="contact-info">
                        <div class="info-row"><div class="info-icon"><i class="fa-solid fa-location-dot"></i></div><div class="info-text">${this.#escapeHTML(cardAddress)}</div></div>
                        <div class="info-row mt-1"><div class="info-icon"><i class="fa-solid fa-phone"></i></div><div class="info-text">${this.#escapeHTML(cardPhone)}${cardEmail !== '-' ? ' &nbsp;|&nbsp; ' + this.#escapeHTML(cardEmail) : ''}</div></div>
                    </div>
                </div>
            </div>`;
        }

        const printTitle = type === 'clinic' ? 'พิมพ์นามบัตรสถานพยาบาล' : 'พิมพ์นามบัตรใบกำกับภาษี';

        const printContent = `
        <html lang="th">
            <head>
                <meta charset="UTF-8">
                <title>${printTitle} - ${qty} ใบ</title>
                <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;600;700;800&family=Sarabun:wght@400;600&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    @page { size: A4 portrait; margin: 10mm; } 
                    body { margin: 0; padding: 0; font-family: 'Sarabun', sans-serif; background: #e2e8f0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; display: flex; flex-direction: column; align-items: center; } 
                    * { box-sizing: border-box; } 
                    .instruction { text-align: center; color: #475569; font-size: 14px; margin: 15mm 0; background: #fff; padding: 15px 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); } 
                    @media print { .instruction { display: none; } body { background: #fff; display: block; } } 
                    
                    .print-grid { display: grid; grid-template-columns: repeat(2, 90mm); gap: 0; margin: 0 auto; justify-content: center; } 
                    
                    .business-card { width: 90mm; height: 54mm; border: 0.5px dashed #cbd5e1; position: relative; background: #ffffff; overflow: hidden; page-break-inside: avoid; } 
                    .card-bg-wash { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; background: linear-gradient(90deg, rgba(255,255,255,1) 35%, rgba(255,255,255,0.85) 75%, rgba(255,255,255,0.4) 100%) !important; } 
                    .pattern-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; pointer-events: none; } 
                    .watermark-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 3; display: flex; align-items: center; justify-content: center; pointer-events: none; overflow: hidden; } 
                    .watermark-container img { width: 85%; height: 85%; object-fit: contain; } 
                    .watermark-container i { font-size: 100px; color: #64748b; } 
                    .content-layer { position: relative; z-index: 10; width: 100%; height: 100%; display: flex; flex-direction: column; padding: 5mm 7mm; } 
                    
                    .theme-clean-white { border-top: 4px solid #cbd5e1 !important; } 
                    .theme-modern-blue { border-top: 4px solid #2563eb !important; } 
                    .theme-modern-blue .pattern-overlay { background: linear-gradient(135deg, rgba(37,99,235,0.04) 0%, rgba(37,99,235,0.15) 100%) !important; background-image: linear-gradient(rgba(37,99,235,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.08) 1px, transparent 1px) !important; background-size: 15px 15px !important; } 
                    .theme-elegant-gold { border-top: 4px solid #d97706 !important; } 
                    .theme-elegant-gold .pattern-overlay { background: radial-gradient(circle at 100% 0%, rgba(217,119,6,0.18) 0%, rgba(253,230,138,0.05) 50%, transparent 80%) !important; } 
                    .theme-emerald-geo { border-top: 4px solid #10b981 !important; } 
                    .theme-emerald-geo .pattern-overlay { background: linear-gradient(135deg, rgba(16,185,129,0.08) 25%, transparent 25%) -20px 0, linear-gradient(225deg, rgba(16,185,129,0.08) 25%, transparent 25%) -20px 0, linear-gradient(315deg, rgba(16,185,129,0.08) 25%, transparent 25%), linear-gradient(45deg, rgba(16,185,129,0.08) 25%, transparent 25%) !important; background-size: 40px 40px !important; } 
                    .theme-rose-wave { border-top: 4px solid #e11d48 !important; } 
                    .theme-rose-wave .pattern-overlay { background: repeating-radial-gradient(circle at 100% 50%, rgba(225,29,72,0.06) 0, rgba(225,29,72,0.06) 10px, transparent 10px, transparent 20px) !important; } 

                    .header-section { display: flex; align-items: center; gap: 4mm; margin-bottom: 2mm; width: 100%; } 
                    .logo-wrapper { flex: 0 0 25mm; width: 25mm; height: 20mm; display: flex; align-items: center; justify-content: center; overflow: hidden; background: transparent; } 
                    .placeholder-logo { background: #f8fafc; border: 1px dashed #cbd5e1; width: 100%; height: 100%; border-radius: 8px; display: flex; align-items: center; justify-content: center; } 
                    .logo-img { max-width: 100%; max-height: 100%; object-fit: contain; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.08)); } 
                    
                    .title-wrapper { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; } 
                    .company-name-container { width: 100%; height: 14mm; display: flex; align-items: center; } 
                    .company-name-text { font-size: 15pt; font-weight: 800; color: #0f172a; line-height: 1.1; font-family: 'Prompt', sans-serif; overflow-wrap: break-word; word-break: normal; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; } 
                    .tax-badge-wrapper { width: 100%; } 
                    .tax-badge { display: inline-block; background: transparent; color: #1d4ed8; font-size: 8pt; font-weight: 700; padding: 0; margin-top: 2px; font-family: 'Prompt', sans-serif; letter-spacing: 0.3px; } 
                    
                    .contact-info { margin-top: auto; border-top: 1px solid rgba(226,232,240,0.8); padding-top: 2mm; } 
                    .info-row { display: flex; align-items: flex-start; margin-bottom: 2px; } 
                    .info-icon { width: 5mm; color: #64748b; font-size: 9pt; margin-top: 1.5px; } 
                    .info-text { flex: 1; font-size: 9.5pt; color: #1e293b; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-weight: 600; text-shadow: 1px 1px 0px #fff; } 
                </style>
            </head>
            <body>
                <div class="instruction">
                    <h4 style="margin:0 0 5px 0; color:#0f172a;"><i class="fa-solid fa-print text-primary"></i> โหมดพรีวิวการพิมพ์</h4>
                    <span style="color:#ef4444; font-weight:bold;">🚨 คำเตือน:</span> ก่อนกดพิมพ์ ให้ดูที่การตั้งค่าเครื่องพิมพ์ แล้วติ๊กถูกที่ช่อง <b>"พิมพ์กราฟิกพื้นหลัง" (Background graphics)</b> ด้วยนะครับ 🖨️ (ปรับ Scale = 100%)
                </div>
                <div class="print-grid">${cardsHtml}</div>
                
                <script>
                    setTimeout(function() {
                        const containers = document.querySelectorAll(".company-name-container");
                        const texts = document.querySelectorAll(".company-name-text");
                        for(let i=0; i<containers.length; i++) {
                            let currentSize = 16;
                            let textEl = texts[i];
                            let containerEl = containers[i];
                            while(textEl.scrollHeight > containerEl.clientHeight && currentSize > 10) {
                                currentSize -= 0.5;
                                textEl.style.fontSize = currentSize + "pt";
                            }
                        }
                    }, 100);
                </script>
            </body>
        </html>`;

        setTimeout(() => {
            Swal.close();
            const printWin = window.open('', '_blank');
            printWin.document.open();
            printWin.document.write(printContent);
            printWin.document.close();
            setTimeout(() => { printWin.print(); }, 800);
        }, 500);
    }

    saveClinicInfo() {
        const data = { 
            clinic_name: document.getElementById('set-clinic-name').value.trim(), 
            clinic_id: document.getElementById('set-clinic-id').value.trim(), 
            phone: document.getElementById('set-clinic-phone').value.trim(), 
            email: document.getElementById('set-clinic-email').value.trim(), 
            address: document.getElementById('set-clinic-address').value.trim(),
            clinic_logo_base64: document.getElementById('hidden-clinic-logo-base64').value,
            company_name: document.getElementById('set-company-name').value.trim(), 
            tax_id: document.getElementById('set-clinic-tax').value.trim(), 
            company_address: document.getElementById('set-company-address').value.trim(),
            company_logo_base64: document.getElementById('hidden-company-logo-base64').value
        };
        Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });
        db.ref('clinic_settings_v2').update(data).then(() => { Swal.fire({ title: 'สำเร็จ!', text: 'บันทึกข้อมูลเรียบร้อย', icon: 'success', timer: 1500, showConfirmButton: false }); });
    }

    // ---------------------------------------------------------
    // 👥 Users Table
    // ---------------------------------------------------------
    renderUsersTable() {
        const tbody = document.getElementById('users-table-body');
        if(!tbody) return;
        if(this.state.allUsers.length === 0) { 
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-5 text-muted"><i class="fa-solid fa-users-slash fa-3x mb-3" style="opacity:0.2;"></i><br>ยังไม่มีข้อมูลผู้ใช้งาน</td></tr>'; 
            return; 
        }
        let html = '';
        this.state.allUsers.forEach(user => {
            let roleInfo = this.roleConfig[user.role] || { label: 'พนักงานทั่วไป', icon: 'fa-user', color: 'secondary' };
            let roleBadge = `<span class="badge badge-soft-${roleInfo.color} px-3 py-2 rounded-pill shadow-sm"><i class="fa-solid ${roleInfo.icon} me-1"></i> ${roleInfo.label}</span>`;
            let statusBadge = user.status === 'active' ? '<span class="badge badge-soft-success px-2 py-1 shadow-sm"><i class="fa-solid fa-check-circle me-1"></i> ปกติ</span>' : '<span class="badge badge-soft-danger px-2 py-1 shadow-sm"><i class="fa-solid fa-lock me-1"></i> ระงับ</span>';
            let safeName = this.#escapeHTML(user.name || 'U');
            let imgSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=f8fafc&color=334155&bold=true`;
            
            html += `
            <tr class="card-hover-float" style="cursor: default;">
                <td>
                    <div class="d-flex align-items-center">
                        <div class="position-relative">
                            <img src="${imgSrc}" class="rounded-circle me-3 shadow-sm border border-2 border-white" style="width: 42px; height: 42px;">
                            ${user.status === 'active' ? '<span class="position-absolute bottom-0 end-0 p-1 bg-success border border-2 border-white rounded-circle" style="transform: translate(-10px, -2px);"></span>' : ''}
                        </div>
                        <div>
                            <div class="fw-bold text-dark" style="font-size: 15px;">${safeName}</div>
                            <div class="small text-muted" style="font-size: 12px;">ID: ${this.#escapeHTML(user.id)}</div>
                        </div>
                    </div>
                </td>
                <td class="fw-bold text-primary" style="font-size: 14.5px;">${this.#escapeHTML(user.username)}</td>
                <td class="text-center">${roleBadge}</td>
                <td class="text-center">${statusBadge}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-light border shadow-sm me-1 fw-bold text-dark" onclick="App.pages.settings.openUserModal('${user.id}')" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-outline-danger shadow-sm" onclick="App.pages.settings.deleteUser('${user.id}')" title="ลบ"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    }
    
    openUserModal(userId = null) {
        let isEdit = !!userId; 
        let user = isEdit ? this.state.allUsers.find(u => u.id === userId) : { status: 'active', role: 'nurse' };
        let roleOptionsHtml = Object.keys(this.roleConfig).map(key => `<option value="${key}" ${user.role === key ? 'selected' : ''}>${this.roleConfig[key].label}</option>`).join('');
        
        Swal.fire({
            title: `<h4 class="text-primary fw-bold mb-0"><i class="fa-solid ${isEdit?'fa-user-pen':'fa-user-plus'} me-2"></i>${isEdit ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'ลงทะเบียนผู้ใช้ใหม่'}</h4>`, 
            width: 600,
            html: `
                <div class="text-start px-2 mt-3" style="font-family:'Sarabun';">
                    <div class="row g-3">
                        <div class="col-12">
                            <label class="fw-bold text-secondary small">ชื่อ - นามสกุล <span class="text-danger">*</span></label>
                            <input type="text" id="swal-user-name" class="form-control input-modern" value="${this.#escapeHTML(user.name || '')}">
                        </div>
                        <div class="col-6">
                            <label class="fw-bold text-secondary small">Username (ไอดีล็อคอิน) <span class="text-danger">*</span></label>
                            <input type="text" id="swal-user-username" class="form-control input-modern text-primary" value="${this.#escapeHTML(user.username || '')}" ${isEdit?'readonly':''}>
                        </div>
                        <div class="col-6">
                            <label class="fw-bold text-secondary small">รหัสผ่าน ${isEdit?'':'<span class="text-danger">*</span>'}</label>
                            <input type="password" id="swal-user-password" class="form-control input-modern" placeholder="${isEdit?'เว้นว่างถ้าไม่เปลี่ยน':'ตั้งรหัสผ่าน 6 ตัวขึ้นไป'}">
                        </div>
                        <div class="col-6">
                            <label class="fw-bold text-secondary small">ระดับสิทธิ์ (Role)</label>
                            <select id="swal-user-role" class="form-select input-modern">${roleOptionsHtml}</select>
                        </div>
                        <div class="col-6">
                            <label class="fw-bold text-secondary small">สถานะบัญชี</label>
                            <select id="swal-user-status" class="form-select input-modern">
                                <option value="active" ${user.status==='active'?'selected':''}>🟢 ใช้งานปกติ</option>
                                <option value="inactive" ${user.status==='inactive'?'selected':''}>🔴 ระงับการใช้งาน</option>
                            </select>
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึก', confirmButtonColor: '#10b981', cancelButtonText: 'ยกเลิก',
            preConfirm: () => {
                const name = document.getElementById('swal-user-name').value.trim(); 
                const username = document.getElementById('swal-user-username').value.trim(); 
                const password = document.getElementById('swal-user-password').value.trim();
                
                if (!name || !username) { Swal.showValidationMessage('กรอกข้อมูลให้ครบถ้วน'); return false; }
                if (!isEdit && !password) { Swal.showValidationMessage('ตั้งรหัสผ่านสำหรับผู้ใช้งานใหม่'); return false; }
                
                return { 
                    id: userId || 'USR-'+Date.now(), 
                    name, 
                    username, 
                    password: password ? password : user.password, 
                    role: document.getElementById('swal-user-role').value, 
                    status: document.getElementById('swal-user-status').value 
                };
            }
        }).then((result) => { 
            if (result.isConfirmed) { 
                let updatedList = [...this.state.allUsers]; 
                if (isEdit) updatedList[updatedList.findIndex(u => u.id === userId)] = result.value; 
                else updatedList.push(result.value); 
                db.ref('clinic_users_v2').set(updatedList).then(() => Swal.fire({title:'บันทึกสำเร็จ!', icon:'success', timer:1200, showConfirmButton:false})); 
            } 
        });
    }
    
    deleteUser(userId) {
        const user = this.state.allUsers.find(u => u.id === userId);
        if(user.role === 'admin' && this.state.allUsers.filter(u => u.role === 'admin').length === 1) { Swal.fire('ลบไม่ได้!', 'ต้องมี Admin อย่างน้อย 1 คน', 'error'); return; }
        
        Swal.fire({ 
            title: 'ยืนยันการลบ?', text:`ระงับสิทธิ์ของ ${user.name} ใช่หรือไม่?`, icon: 'warning', 
            showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: '<i class="fa-solid fa-trash me-1"></i> ลบทิ้ง', cancelButtonText: 'ยกเลิก' 
        }).then((res) => { 
            if(res.isConfirmed) db.ref('clinic_users_v2').set(this.state.allUsers.filter(u => u.id !== userId)); 
        });
    }

    // ---------------------------------------------------------
    // 🧪 Medical Master Data
    // ---------------------------------------------------------
    renderLabSets() {
        const container = document.getElementById('lab-sets-container');
        if(!container) return;
        if(this.state.labSets.length === 0) { 
            container.innerHTML = '<div class="col-12 text-center text-muted"><i class="fa-solid fa-vial fa-3x mb-3" style="opacity:0.2;"></i><br>ยังไม่มีชุดแล็บ</div>'; 
            return; 
        }

        let html = '';
        this.state.labSets.forEach(s => {
            let tags = s.items.map(i => `<span class="badge bg-light text-dark border px-2 py-1 me-1 mb-1 shadow-sm"><i class="fa-solid fa-droplet text-danger me-1"></i>${this.#escapeHTML(i)}</span>`).join('');
            let priceLabel = s.price ? `<span class="price-badge"><i class="fa-solid fa-tag"></i> ฿${Number(s.price).toLocaleString()}</span>` : '';
            
            html += `
            <div class="col-md-6 col-lg-4">
                <div class="modern-panel card-hover-float p-3 h-100 d-flex flex-column position-relative" style="border-left: 4px solid var(--danger);">
                    <h6 class="fw-bold text-dark mb-3"><i class="fa-solid fa-folder-open text-danger me-2"></i> ${this.#escapeHTML(s.name)} ${priceLabel}</h6>
                    <div class="mb-3">${tags}</div>
                    <div class="mt-auto text-end border-top pt-3">
                        <button class="btn btn-sm btn-light border shadow-sm fw-bold px-3 text-dark me-1" onclick="App.pages.settings.openLabSetModal('${s.id}')">แก้ไข</button>
                        <button class="btn btn-sm btn-outline-danger shadow-sm px-3" onclick="App.pages.settings.deleteLabSet('${s.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>`;
        });
        container.innerHTML = html;
    }

    openLabSetModal(setId = null) {
        let isEdit = !!setId;
        let set = isEdit ? this.state.labSets.find(s => s.id === setId) : { items: [], price: 0 };

        Swal.fire({
            title: `<h5 class="fw-bold text-danger mb-0"><i class="fa-solid fa-vial-virus me-2"></i> ${isEdit?'แก้ไขชุดผลแล็บ':'สร้างชุดผลแล็บใหม่'}</h5>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <label class="fw-bold text-secondary small">ชื่อชุดการตรวจ (Set Name)</label>
                    <input type="text" id="swal-lab-name" class="form-control input-modern mb-3" value="${this.#escapeHTML(set.name || '')}" placeholder="เช่น เจาะเลือดประจำเดือน">
                    <label class="fw-bold text-secondary small">ราคาเหมาจ่ายชุดนี้ (บาท)</label>
                    <input type="number" id="swal-lab-price" class="form-control input-modern mb-3 text-danger fw-bold" value="${set.price || 0}" min="0">
                    <label class="fw-bold text-secondary small">รายการผลแล็บ (ใช้ลูกน้ำ , คั่นแต่ละรายการ)</label>
                    <textarea id="swal-lab-items" class="form-control input-modern" rows="3" placeholder="BUN, Cr, K, Ca, P, Hct">${set.items.join(', ')}</textarea>
                </div>
            `,
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึก', confirmButtonColor: '#10b981', cancelButtonText: 'ยกเลิก',
            preConfirm: () => {
                let name = document.getElementById('swal-lab-name').value.trim();
                let price = document.getElementById('swal-lab-price').value;
                let itemsStr = document.getElementById('swal-lab-items').value;
                let items = itemsStr.split(',').map(s=>s.trim()).filter(Boolean);
                if(!name || items.length === 0) { Swal.showValidationMessage('กรอกข้อมูลให้ครบถ้วน'); return false; }
                return { id: setId || 'LS'+Date.now(), name, price: Number(price), items };
            }
        }).then(res => {
            if(res.isConfirmed) {
                let updated = [...this.state.labSets];
                if(isEdit) updated[updated.findIndex(s=>s.id===setId)] = res.value; 
                else updated.push(res.value);
                db.ref('clinic_lab_sets_v2').set(updated);
            }
        });
    }
    
    deleteLabSet(id) { db.ref('clinic_lab_sets_v2').set(this.state.labSets.filter(s=>s.id!==id)); }

    renderMedsList() {
        const container = document.getElementById('meds-list-container');
        if(!container) return;
        let html = '';
        this.state.medsList.forEach(m => {
            let priceHtml = m.price ? `<span class="badge bg-white text-primary border ms-2">฿${Number(m.price).toLocaleString()}</span>` : '';
            html += `
                <span class="badge bg-light text-dark border border-secondary-subtle px-3 py-2 fs-6 shadow-sm card-hover-float" style="border-radius:12px; font-weight: 600;">
                    <i class="fa-solid fa-pills text-primary me-1"></i> 
                    <span onclick="App.pages.settings.openMedListModal('${m.id}')" style="cursor:pointer;">${this.#escapeHTML(m.name)}</span> 
                    ${priceHtml}
                    <i class="fa-solid fa-times ms-3 text-danger" style="cursor:pointer;" onclick="App.pages.settings.deleteMedItem('${m.id}')" title="ลบรายการ"></i>
                </span>
            `;
        });
        container.innerHTML = html || '<span class="text-muted small"><i class="fa-solid fa-box-open me-1"></i> ยังไม่มีรายการเวชภัณฑ์เพิ่มเติม</span>';
    }

    openMedListModal(id = null) {
        let isEdit = !!id;
        let m = isEdit ? this.state.medsList.find(x => x.id === id) : { name: '', price: '' };
        Swal.fire({
            title: `<h5 class="fw-bold" style="color: #8b5cf6;"><i class="fa-solid fa-syringe me-2"></i>${isEdit?'แก้ไขรายการยา':'เพิ่มยา/เวชภัณฑ์'}</h5>`, 
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <label class="form-label fw-bold small text-secondary">ชื่อยา / เวชภัณฑ์</label>
                    <input type="text" id="swal-med-name" class="form-control input-modern mb-3 fw-bold text-dark" value="${this.#escapeHTML(m.name)}" placeholder="เช่น Heparin 5000U">
                    <label class="form-label fw-bold small text-secondary">ราคาขายต่อหน่วย (บาท)</label>
                    <input type="number" id="swal-med-price" class="form-control input-modern fw-bold text-primary text-center" value="${m.price}" placeholder="0" min="0">
                </div>
            `,
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึก', confirmButtonColor: '#8b5cf6', cancelButtonText: 'ยกเลิก',
            preConfirm: () => {
                let name = document.getElementById('swal-med-name').value.trim();
                let price = document.getElementById('swal-med-price').value;
                if(!name) { Swal.showValidationMessage('กรุณาระบุชื่อยา/เวชภัณฑ์'); return false; }
                return { id: id || 'M'+Date.now(), name, price: Number(price) };
            }
        }).then(res => {
            if(res.isConfirmed) {
                let updated = [...this.state.medsList];
                if(isEdit) updated[updated.findIndex(x=>x.id===id)] = res.value; 
                else updated.push(res.value);
                db.ref('clinic_meds_list_v2').set(updated);
            }
        });
    }
    
    deleteMedItem(id) { db.ref('clinic_meds_list_v2').set(this.state.medsList.filter(x=>x.id!==id)); }

    renderXrayList() {
        const container = document.getElementById('xrays-list-container');
        if(!container) return;
        let html = '';
        this.state.xraysList.forEach(x => {
            let priceHtml = x.price ? `<span class="badge bg-white text-info border ms-2">฿${Number(x.price).toLocaleString()}</span>` : '';
            html += `
                <span class="badge bg-light text-dark border border-secondary-subtle px-3 py-2 fs-6 shadow-sm card-hover-float" style="border-radius:12px; font-weight: 600;">
                    <i class="fa-solid fa-x-ray text-info me-1"></i> 
                    <span onclick="App.pages.settings.openXrayModal('${x.id}')" style="cursor:pointer;">${this.#escapeHTML(x.name)}</span> 
                    ${priceHtml}
                    <i class="fa-solid fa-times ms-3 text-danger" style="cursor:pointer;" onclick="App.pages.settings.deleteXrayItem('${x.id}')" title="ลบรายการ"></i>
                </span>
            `;
        });
        container.innerHTML = html || '<span class="text-muted small"><i class="fa-solid fa-box-open me-1"></i> ยังไม่มีรายการเอ็กซเรย์</span>';
    }

    openXrayModal(id = null) {
        let isEdit = !!id;
        let x = isEdit ? this.state.xraysList.find(i => i.id === id) : { name: '', price: '' };
        Swal.fire({
            title: `<h5 class="fw-bold text-info"><i class="fa-solid fa-x-ray me-2"></i>${isEdit?'แก้ไขรายการเอ็กซเรย์':'เพิ่มรายการเอ็กซเรย์'}</h5>`, 
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <label class="form-label fw-bold small text-secondary">ชื่อการตรวจ (X-Ray Name)</label>
                    <input type="text" id="swal-xray-name" class="form-control input-modern mb-3 fw-bold text-dark" value="${this.#escapeHTML(x.name)}" placeholder="เช่น Chest X-Ray (CXR)">
                    <label class="form-label fw-bold small text-secondary">ราคาขายต่อรอบ (บาท)</label>
                    <input type="number" id="swal-xray-price" class="form-control input-modern fw-bold text-info text-center" value="${x.price}" placeholder="0" min="0">
                </div>
            `,
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึก', confirmButtonColor: '#14b8a6', cancelButtonText: 'ยกเลิก',
            preConfirm: () => {
                let name = document.getElementById('swal-xray-name').value.trim();
                let price = document.getElementById('swal-xray-price').value;
                if(!name) { Swal.showValidationMessage('กรุณาระบุชื่อการตรวจเอ็กซเรย์'); return false; }
                return { id: id || 'X'+Date.now(), name, price: Number(price) };
            }
        }).then(res => {
            if(res.isConfirmed) {
                let updated = [...this.state.xraysList];
                if(isEdit) updated[updated.findIndex(i=>i.id===id)] = res.value; 
                else updated.push(res.value);
                db.ref('clinic_xray_list_v2').set(updated);
            }
        });
    }
    
    deleteXrayItem(id) { db.ref('clinic_xray_list_v2').set(this.state.xraysList.filter(x=>x.id!==id)); }

    // ---------------------------------------------------------
    // 📝 Note Templates
    // ---------------------------------------------------------
    filterNotes(cat) {
        this.state.currentNoteFilter = cat;
        const buttons = document.querySelectorAll('#note-category-tabs .nav-link');
        buttons.forEach(btn => {
            btn.classList.remove('active', 'badge-soft-warning', 'text-dark', 'badge-soft-primary', 'badge-soft-danger', 'badge-soft-success', 'badge-soft-info', 'text-white');
            if(btn.innerText.includes('ก่อน')) btn.classList.add('text-primary');
            else if(btn.innerText.includes('แทรกซ้อน')) btn.classList.add('text-danger');
            else if(btn.innerText.includes('สรุป')) btn.classList.add('text-success');
            else if(btn.innerText.includes('คำสั่ง')) btn.classList.add('text-info');
            else btn.classList.add('text-dark');
        });
        
        let targetBtn = event.target.closest('button');
        if (targetBtn) {
            targetBtn.className = "nav-link active fw-bold px-4 rounded-pill shadow-sm";
            if(cat === 'pre') targetBtn.classList.add('badge-soft-primary');
            else if(cat === 'intra') targetBtn.classList.add('badge-soft-danger');
            else if(cat === 'post') targetBtn.classList.add('badge-soft-success');
            else if(cat === 'doctor') targetBtn.classList.add('badge-soft-info');
            else targetBtn.classList.add('badge-soft-warning');
        }
        
        this.renderNoteTemplates();
    }

    renderNoteTemplates() {
        const container = document.getElementById('note-templates-container');
        if(!container) return;

        let filteredNotes = this.state.noteTemplates;
        if(this.state.currentNoteFilter !== 'all') {
            filteredNotes = this.state.noteTemplates.filter(t => t.category === this.state.currentNoteFilter);
        }
        
        if(filteredNotes.length === 0) { 
            container.innerHTML = '<div class="col-12 text-center text-muted"><i class="fa-regular fa-file-lines fa-3x mb-3" style="opacity:0.2;"></i><br>ไม่พบเทมเพลตในหมวดหมู่นี้</div>'; 
            return; 
        }

        let html = '';
        filteredNotes.forEach(t => {
            let catBadge = ''; let borderColor = 'var(--warning)'; let iconHtml = '';
            
            if(t.category === 'pre') { catBadge = '<span class="badge badge-soft-primary px-2">ก่อนฟอก</span>'; borderColor = 'var(--primary)'; iconHtml = '<i class="fa-solid fa-arrow-right-to-bracket text-primary"></i>'; }
            else if(t.category === 'intra') { catBadge = '<span class="badge badge-soft-danger px-2">แทรกซ้อน</span>'; borderColor = 'var(--danger)'; iconHtml = '<i class="fa-solid fa-heart-crack text-danger"></i>';}
            else if(t.category === 'post') { catBadge = '<span class="badge badge-soft-success px-2">หลังฟอก</span>'; borderColor = 'var(--success)'; iconHtml = '<i class="fa-solid fa-check-double text-success"></i>';}
            else if(t.category === 'doctor') { catBadge = '<span class="badge badge-soft-info px-2">คำสั่งแพทย์</span>'; borderColor = 'var(--info)'; iconHtml = '<i class="fa-solid fa-user-doctor text-info"></i>';}
            else { catBadge = '<span class="badge badge-soft-warning px-2">ทั่วไป</span>'; borderColor = 'var(--warning)'; iconHtml = '<i class="fa-solid fa-file-lines text-warning"></i>';}

            html += `
            <div class="col-md-6 col-lg-4">
                <div class="modern-panel card-hover-float p-3 h-100 d-flex flex-column position-relative" style="border-top: 4px solid ${borderColor}; border-radius: 14px;">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <h6 class="fw-bold text-dark mb-0" style="padding-right: 60px; line-height: 1.4;">${iconHtml} ${this.#escapeHTML(t.title)}</h6>
                        <div style="position: absolute; right: 15px; top: 15px;">${catBadge}</div>
                    </div>
                    <p class="text-muted small mb-3 p-2 bg-light rounded" style="display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; white-space: pre-wrap; font-size: 13px;">${this.#escapeHTML(t.text)}</p>
                    <div class="text-end mt-auto pt-2">
                        <button class="btn btn-sm btn-light border text-dark fw-bold px-3 shadow-sm me-1" onclick="App.pages.settings.openNoteTemplateModal('${t.id}')">แก้ไข</button>
                        <button class="btn btn-sm btn-outline-danger shadow-sm px-3" onclick="App.pages.settings.deleteNoteTemplate('${t.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>`;
        });
        container.innerHTML = html;
    }

    openNoteTemplateModal(id = null) {
        let isEdit = !!id;
        let t = isEdit ? this.state.noteTemplates.find(x => x.id === id) : { category: 'general' };
        
        Swal.fire({
            title: `<h5 class="fw-bold text-warning mb-0"><i class="fa-solid fa-file-signature me-2"></i> ${isEdit?'แก้ไขเทมเพลต':'สร้างเทมเพลตบันทึกเชิงลึก'}</h5>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <label class="fw-bold text-secondary small">หมวดหมู่ (Category)</label>
                    <select id="swal-note-category" class="form-select input-modern mb-3">
                        <option value="pre" ${t.category==='pre'?'selected':''}>🔵 อาการก่อนฟอก (Pre-HD)</option>
                        <option value="intra" ${t.category==='intra'?'selected':''}>🔴 ระหว่างฟอก / ภาวะแทรกซ้อน (Intra-HD)</option>
                        <option value="post" ${t.category==='post'?'selected':''}>🟢 สรุปหลังฟอก (Post-HD)</option>
                        <option value="doctor" ${t.category==='doctor'?'selected':''}>⚕️ คำสั่งแพทย์ (Doctor's Order)</option>
                        <option value="general" ${t.category==='general'?'selected':''}>⚪ ทั่วไป (General)</option>
                    </select>
                    <label class="fw-bold text-secondary small">ชื่อหัวข้อเทมเพลต (สั้นๆ ให้จำง่าย)</label>
                    <input type="text" id="swal-note-title" class="form-control input-modern mb-3" value="${this.#escapeHTML(t.title || '')}" placeholder="เช่น ความดันตกให้ NSS">
                    <label class="fw-bold text-secondary small">ข้อความเนื้อหาที่จะบันทึกลงระบบ</label>
                    <textarea id="swal-note-text" class="form-control input-modern p-3" rows="5" placeholder="พิมพ์ข้อความมาตรฐานที่นี่...">${this.#escapeHTML(t.text || '')}</textarea>
                </div>
            `,
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึก', confirmButtonColor: '#10b981', cancelButtonText: 'ยกเลิก', width: 600,
            preConfirm: () => {
                let category = document.getElementById('swal-note-category').value;
                let title = document.getElementById('swal-note-title').value.trim(); 
                let text = document.getElementById('swal-note-text').value.trim();
                
                if(!title || !text) { Swal.showValidationMessage('กรอกข้อมูลให้ครบถ้วน'); return false; }
                return { id: id || 'NT'+Date.now(), category, title, text };
            }
        }).then(res => {
            if(res.isConfirmed) {
                let updated = [...this.state.noteTemplates];
                if(isEdit) updated[updated.findIndex(x=>x.id===id)] = res.value; 
                else updated.push(res.value);
                db.ref('clinic_note_templates_v2').set(updated);
            }
        });
    }
    
    deleteNoteTemplate(id) { 
        db.ref('clinic_note_templates_v2').set(this.state.noteTemplates.filter(x=>x.id!==id)); 
    }

    // 🛡️ Helper
    #escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
}

// 🌐 Expose Component สู่ระบบ Router
const SettingsPage = new SettingsPageComponent();
window.SettingsPage = SettingsPage;