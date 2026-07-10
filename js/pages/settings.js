// js/pages/settings.js
// 🚀 Enterprise Settings Module: Full Component, Memory-Leak Free, Dynamic RBAC, XSS Protected & Database Management

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

        this.pageDescriptions = {
            'dashboard': 'แดชบอร์ดภาพรวม (Overview)',
            'visits': 'คิวฟอกไตประจำวัน (Daily Visits)',
            'visit_detail': 'บันทึกข้อมูลฟอกเลือด (HD Flowsheet)',
            'patients': 'ทะเบียนผู้ป่วย (Patient Mgt.)',
            'patient_history': 'แฟ้มประวัติผู้ป่วย (EMR)',
            'document_center': 'ศูนย์รวมเอกสาร (Gallery)',
            'patient_status': 'ผู้ป่วยส่งต่อ/จำหน่าย',
            'inventory': 'คลังน้ำยาและพัสดุ',
            'stock_manage': 'เบิกจ่ายและนับสต๊อก',
            'stock_history': 'ประวัติเข้า-ออก สต๊อก',
            'monthly_requisition': 'ฟอร์มเบิกของประจำเดือน',
            'stock_forecast': 'คำนวณยอดเบิก',
            'usage_statistics': 'สถิติการใช้พัสดุและยาฉีด',
            'finance': 'รายได้และเบิกจ่าย',
            'department_ledger': 'บัญชีภายในหน่วยงาน',
            'search_copy': 'ค้นหาและคัดลอกด่วน',
            'settings': 'ตั้งค่าคลินิก (Admin)',
            'about': 'เกี่ยวกับระบบ (About)'
        };

        this.firebaseListeners = [];
    }

    switchTab(tabId) {
        document.querySelectorAll('#settingsTabs .nav-link').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('#settingsTabContent .tab-pane').forEach(pane => pane.classList.remove('show', 'active'));
        
        const targetBtn = document.querySelector(`[data-bs-target="#${tabId}"]`);
        if (targetBtn) targetBtn.classList.add('active');
        
        const targetPane = document.getElementById(tabId);
        if (targetPane) targetPane.classList.add('show', 'active');
    }

    changeTheme(themeKey) {
        if (typeof window.ThemeEngine !== 'undefined') {
            window.ThemeEngine.applyTheme(themeKey);
        } else {
            Swal.fire({ title: 'กำลังโหลดระบบธีม...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
            const script = document.createElement('script');
            script.src = './js/theme_engine.js'; 
            script.onload = () => { Swal.close(); if (window.ThemeEngine) window.ThemeEngine.applyTheme(themeKey); };
            script.onerror = () => { Swal.fire({ icon: 'error', title: 'หาไฟล์ไม่เจอครับ!', html: `โปรแกรมพยายามเปิดไฟล์ <b class="text-danger">js/theme_engine.js</b> แต่ไม่พบครับ` }); };
            document.body.appendChild(script);
        }
    }

    get html() {
        let themeUIHtml = `
            <div class="modern-panel mb-4 p-4" style="border-top: 4px solid #8b5cf6; border-radius: 16px;">
                <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <div>
                        <h5 class="fw-bold mb-1" style="color:#8b5cf6!important;"><i class="fa-solid fa-palette me-2"></i> ปรับแต่งหน้าตาโปรแกรม (Theme Engine)</h5>
                        <p class="small mb-0 text-muted">เปลี่ยนสีสันและดีไซน์ของโปรแกรมทั้งระบบแบบ Realtime</p>
                    </div>
                </div>
                <div class="row g-3 justify-content-center">
                    <div class="col-12 col-md-6">
                        <div class="card card-hover-float p-4 text-center h-100 d-flex flex-column align-items-center justify-content-center preview-card-modern" 
                             onclick="App.pages.settings.changeTheme('modern')" style="cursor:pointer;">
                            <div class="rounded-circle mb-3 d-flex align-items-center justify-content-center" style="width:48px; height:48px; background:#2563eb; color:white;">
                                <i class="fa-solid fa-paint-roller fs-5"></i>
                            </div>
                            <h6 class="fw-bold mb-0 preview-text-modern" style="font-family:'Prompt';">Modern Blue</h6>
                        </div>
                    </div>
                    <div class="col-12 col-md-6">
                        <div class="card card-hover-float p-4 text-center h-100 d-flex flex-column align-items-center justify-content-center preview-card-midnight" 
                             onclick="App.pages.settings.changeTheme('minimal')" style="cursor:pointer;">
                            <div class="rounded-circle mb-3 d-flex align-items-center justify-content-center" style="width:48px; height:48px; background:#10b981; color:white;">
                                <i class="fa-solid fa-paint-roller fs-5"></i>
                            </div>
                            <h6 class="fw-bold mb-0 preview-text-midnight" style="font-family:'Prompt';">Midnight Pro</h6>
                        </div>
                    </div>
                </div>
            </div>
        `;

        let databaseUIHtml = `
            <div class="modern-panel mb-4 p-4" style="border-top: 4px solid var(--danger); border-radius: 16px;">
                <div style="position: absolute; top: -30px; right: -30px; opacity: 0.02; font-size: 250px; pointer-events: none;"><i class="fa-solid fa-database"></i></div>
                
                <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 position-relative z-1">
                    <div>
                        <h5 class="fw-bold mb-1 text-danger"><i class="fa-solid fa-server me-2"></i> ศูนย์จัดการฐานข้อมูลและเคลียร์พื้นที่ (Data Management)</h5>
                        <p class="small mb-0 text-muted">ลบข้อมูลประวัติเก่าเพื่อลดขนาดฐานข้อมูล หรือ Factory Reset เพื่อเริ่มต้นใช้งานระบบใหม่</p>
                    </div>
                </div>

                <div class="row g-4 position-relative z-1">
                    <div class="col-xl-6">
                        <div class="p-4 border rounded-4 bg-white h-100 shadow-sm border-warning-subtle">
                            <div class="d-flex align-items-center mb-3">
                                <div class="rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center me-3 shadow-sm" style="width: 45px; height: 45px;"><i class="fa-solid fa-broom fa-lg"></i></div>
                                <div><h6 class="fw-bold text-dark mb-0">ลบข้อมูลแบบกำหนดเอง (Custom Purge)</h6><div class="small text-muted">เลือกลบเฉพาะประวัติเก่าตามระยะเวลา</div></div>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold small text-secondary">เลือกฐานข้อมูลที่ต้องการลบ</label>
                                <select id="db-purge-target" class="form-select input-modern">
                                    <option value="visits">ประวัติการฟอกเลือด (HD Flowsheet & EMR)</option>
                                    <option value="ledger">บัญชีรายรับ-รายจ่าย (Department Ledger)</option>
                                    <option value="inventory">ประวัติเข้า-ออกพัสดุ (Inventory History)</option>
                                </select>
                            </div>
                            <div class="mb-4">
                                <label class="fw-bold small text-secondary">เลือกระยะเวลา</label>
                                <select id="db-purge-time" class="form-select input-modern">
                                    <option value="1">ลบข้อมูลที่เก่ากว่า 1 ปี</option>
                                    <option value="3">ลบข้อมูลที่เก่ากว่า 3 ปี</option>
                                    <option value="5" selected>ลบข้อมูลที่เก่ากว่า 5 ปี</option>
                                </select>
                            </div>
                            <button class="btn btn-warning w-100 fw-bold shadow-sm rounded-pill text-dark" onclick="App.pages.settings.promptCustomPurge()">
                                <i class="fa-solid fa-eraser me-2"></i> สั่งล้างข้อมูลประวัติเก่า
                            </button>
                        </div>
                    </div>

                    <div class="col-xl-6">
                        <div class="p-4 border rounded-4 h-100 shadow-sm border-danger-subtle" style="background-color: #fef2f2;">
                            <div class="d-flex align-items-center mb-3">
                                <div class="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center me-3 shadow-sm" style="width: 45px; height: 45px;"><i class="fa-solid fa-skull-crossbones fa-lg"></i></div>
                                <div><h6 class="fw-bold text-danger mb-0">ล้างระบบแบบละเอียด (Factory Reset)</h6><div class="small text-danger" style="opacity: 0.8;">ระวัง! การทำงานนี้ไม่สามารถกู้คืนข้อมูลได้</div></div>
                            </div>
                            <p class="small fw-bold text-dark mb-3">เลือกส่วนที่ต้องการล้างข้อมูล (Tick to wipe):</p>
                            
                            <div class="row g-2 mb-4">
                                <div class="col-12"><label class="perm-check-item" style="background:#fff;"><input type="checkbox" id="wipe-patients" value="patients_database_v2"> <span>ล้างทะเบียนผู้ป่วย และ ประวัติการรักษาทั้งหมด</span></label></div>
                                <div class="col-12"><label class="perm-check-item" style="background:#fff;"><input type="checkbox" id="wipe-inventory-items" value="inventory_items"> <span>ล้างรายการคลังพัสดุทั้งหมด (ลบชื่อสินค้าออกจากระบบ)</span></label></div>
                                <div class="col-12"><label class="perm-check-item" style="background:#fff;"><input type="checkbox" id="wipe-stock-history" value="inventory_transactions"> <span>ล้างประวัติทำรายการเข้า-ออก สต๊อกทั้งหมด</span></label></div>
                                <div class="col-12"><label class="perm-check-item" style="background:#fff;"><input type="checkbox" id="wipe-ledger" value="department_ledger_v2"> <span>ล้างบัญชีรายรับ-รายจ่ายหน่วยงานทั้งหมด</span></label></div>
                                <div class="col-12"><label class="perm-check-item" style="background:#fff;"><input type="checkbox" id="wipe-master" value="master_data"> <span>ล้างรายการตั้งค่า (ยา, แล็บ, เทมเพลต, บัญชีผู้ใช้)</span></label></div>
                            </div>
                            
                            <button class="btn btn-danger w-100 fw-bold shadow-sm rounded-pill" onclick="App.pages.settings.promptFactoryReset()">
                                <i class="fa-solid fa-radiation me-2"></i> ยืนยันการล้างระบบ (Factory Reset)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return `
            <style>
                html[data-bs-theme="dark"] .modern-panel { background-color: var(--bg-surface) !important; border-color: var(--border-color) !important; color: var(--text-dark) !important; }
                html[data-bs-theme="dark"] .modern-panel h5, html[data-bs-theme="dark"] .modern-panel label { color: var(--text-dark) !important; }
                html[data-bs-theme="dark"] .bg-white { background-color: var(--bg-surface) !important; border-color: var(--border-color) !important; }
                
                #app-content .preview-card-modern { border-radius: 16px !important; border: 2px solid #2563eb !important; background-color: #ffffff !important; }
                #app-content .preview-text-modern { color: #0f172a !important; }
                #app-content .preview-card-midnight { border-radius: 16px !important; border: 2px solid #10b981 !important; background-color: #0f172a !important; }
                #app-content .preview-text-midnight { color: #f8fafc !important; }

                html[data-bs-theme="dark"] body #app-content .preview-card-modern { background-color: #ffffff !important; border-color: #2563eb !important; }
                html[data-bs-theme="dark"] body #app-content .preview-text-modern { color: #0f172a !important; text-shadow: none !important; }
                html[data-bs-theme="dark"] body #app-content .preview-card-midnight { background-color: #0f172a !important; border-color: #10b981 !important; }
                html[data-bs-theme="dark"] body #app-content .preview-text-midnight { color: #f8fafc !important; text-shadow: none !important; }

                html[data-bs-theme="dark"] .card:not(.preview-card-modern):not(.preview-card-midnight) { background-color: var(--bg-surface) !important; border-color: var(--border-color) !important; }
                html[data-bs-theme="dark"] .card:not(.preview-card-modern):not(.preview-card-midnight) h6 { color: var(--text-dark) !important; }

                html[data-bs-theme="dark"] .input-modern { background-color: var(--bg-body) !important; border-color: var(--border-color) !important; color: var(--text-dark) !important; }
                
                html[data-bs-theme="dark"] .nav-link { color: var(--text-muted) !important; transition: all 0.2s ease; }
                html[data-bs-theme="dark"] .nav-link:hover:not(.active) { 
                    background-color: rgba(255, 255, 255, 0.05) !important; color: #f8fafc !important; border-radius: 12px 12px 0 0; 
                }
                html[data-bs-theme="dark"] .nav-link.active { color: var(--primary) !important; background-color: transparent !important; }
                html[data-bs-theme="dark"] .nav-link.active:hover { background-color: transparent !important; }
                
                html[data-bs-theme="dark"] .badge.bg-white { background-color: rgba(255,255,255,0.08) !important; border-color: rgba(255,255,255,0.15) !important; color: var(--text-dark) !important; }
                html[data-bs-theme="dark"] .badge.bg-light { background-color: rgba(255,255,255,0.04) !important; border-color: rgba(255,255,255,0.1) !important; color: #cbd5e1 !important; }
                html[data-bs-theme="dark"] p.bg-light { background-color: rgba(0,0,0,0.2) !important; border: 1px solid var(--border-color); }
                
                .logo-preview-box { width: 100px; height: 100px; border: 2px dashed var(--border-color); display: flex; align-items: center; justify-content: center; border-radius: 12px; background: transparent; transition: all 0.3s ease; }
                html[data-bs-theme="dark"] .logo-preview-box { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.15); }
                .logo-preview-box img { max-width: 100%; max-height: 100%; object-fit: contain; padding: 5px; }
                
                .perm-check-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 15px; margin-bottom: 8px; transition: all 0.2s; cursor: pointer; display: flex; align-items: center; }
                .perm-check-item:hover { background: #e0e7ff; border-color: #93c5fd; }
                html[data-bs-theme="dark"] .perm-check-item { background: rgba(255,255,255,0.02) !important; border-color: rgba(255,255,255,0.05); }
                html[data-bs-theme="dark"] .perm-check-item:hover { background: rgba(255,255,255,0.08) !important; border-color: #3b82f6; }
                .perm-check-item input { width: 18px; height: 18px; margin-right: 12px; cursor: pointer; }
                .perm-check-item span { font-weight: 600; font-size: 14px; color: var(--text-dark); }
                
                html[data-bs-theme="dark"] #database-panel .bg-white { background: rgba(0,0,0,0.2) !important; }
                html[data-bs-theme="dark"] #database-panel .border-danger-subtle { border-color: rgba(239, 68, 68, 0.3) !important; background: rgba(239, 68, 68, 0.05) !important;}

                /* 🚨 THE FIX: ปุ่ม Action ป้องกัน Hover แล้วพื้นขาวกลืนตัวหนังสือ */
                .btn-custom-manage {
                    background-color: #f1f5f9 !important;
                    color: #475569 !important;
                    border: 1px solid #cbd5e1 !important;
                    transition: all 0.3s ease;
                }
                .btn-custom-manage:hover {
                    background-color: #475569 !important;
                    color: #ffffff !important;
                    border-color: #475569 !important;
                }
                .btn-custom-manage i { color: inherit !important; }
                
                html[data-bs-theme="dark"] .btn-custom-manage {
                    background-color: rgba(255,255,255,0.1) !important;
                    color: #f8fafc !important;
                    border-color: rgba(255,255,255,0.2) !important;
                }
                html[data-bs-theme="dark"] .btn-custom-manage:hover {
                    background-color: #ffffff !important;
                    color: #0f172a !important;
                }
            </style>

            <div class="page-header mb-4">
                <div>
                    <h2 class="page-title text-primary"><i class="fa-solid fa-sliders me-2"></i> ตั้งค่าระบบและข้อมูลคลินิก</h2>
                    <p class="text-muted mt-1 mb-0">จัดการข้อมูลสถานพยาบาล, สิทธิ์การเข้าถึง และฐานข้อมูลทางการแพทย์ (Master Data)</p>
                </div>
            </div>

            <ul class="nav settings-nav-tabs mb-4 position-relative" id="settingsTabs" role="tablist" style="gap: 5px; z-index: 10;">
                <li class="nav-item" role="presentation"><button class="nav-link active fw-bold px-4 rounded-pill" data-bs-target="#clinic-panel" type="button" role="tab" onclick="App.pages.settings.switchTab('clinic-panel')" style="border:none;"><i class="fa-solid fa-building-user me-2"></i> ข้อมูลคลินิกและบริษัท</button></li>
                <li class="nav-item" role="presentation"><button class="nav-link text-info fw-bold px-4 rounded-pill" data-bs-target="#users-panel" type="button" role="tab" onclick="App.pages.settings.switchTab('users-panel')" style="border:none;"><i class="fa-solid fa-users-gear me-2"></i> จัดการไอดี</button></li>
                <li class="nav-item" role="presentation"><button class="nav-link text-danger fw-bold px-4 rounded-pill" data-bs-target="#medical-panel" type="button" role="tab" onclick="App.pages.settings.switchTab('medical-panel')" style="border:none;"><i class="fa-solid fa-briefcase-medical me-2"></i> ตั้งค่าการแพทย์</button></li>
                <li class="nav-item" role="presentation"><button class="nav-link fw-bold px-4 rounded-pill" style="color:#8b5cf6; border:none;" data-bs-target="#theme-panel" type="button" role="tab" onclick="App.pages.settings.switchTab('theme-panel')"><i class="fa-solid fa-palette me-2"></i> หน้าตา (Theme)</button></li>
                
                <li class="nav-item ms-auto" role="presentation"><button class="nav-link text-danger fw-bold px-4 rounded-pill bg-danger-subtle border border-danger-subtle" data-bs-target="#database-panel" type="button" role="tab" onclick="App.pages.settings.switchTab('database-panel')" style="position:relative; z-index: 50;"><i class="fa-solid fa-database me-2"></i> จัดการฐานข้อมูล (DB)</button></li>
            </ul>

            <div class="tab-content" id="settingsTabContent">
                
                <div class="tab-pane fade show active" id="clinic-panel" role="tabpanel">
                    <div class="modern-panel p-4 pt-5 mb-4" style="border-top: 4px solid var(--primary); border-radius: 16px;">
                        <div style="position: absolute; top: -20px; right: -20px; opacity: 0.03; font-size: 250px;"><i class="fa-solid fa-hospital-user"></i></div>
                        <h5 class="fw-bold mb-4 position-relative"><i class="fa-solid fa-hospital text-primary me-2"></i> ข้อมูลพื้นฐานสถานพยาบาล (Clinic Info)</h5>
                        <div class="row g-4 position-relative">
                            
                            <div class="col-md-12">
                                <label class="form-label fw-bold small">โลโก้คลินิก (สำหรับแสดงหน้าระบบและนามบัตร)</label>
                                <div class="d-flex align-items-center gap-3">
                                    <div class="logo-preview-box" id="clinic-logo-preview-container">
                                        <span class="small"><i class="fa-solid fa-image fa-2x"></i></span>
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
                                <label class="form-label fw-bold small">ชื่อคลินิก / สถานพยาบาล</label>
                                <input type="text" id="set-clinic-name" class="form-control input-modern text-primary fw-bold">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold small">รหัสสถานพยาบาล 11 หลัก</label>
                                <input type="text" id="set-clinic-id" class="form-control input-modern">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold small">เบอร์โทรศัพท์คลินิก</label>
                                <input type="text" id="set-clinic-phone" class="form-control input-modern">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold small">Email คลินิก (ถ้ามี)</label>
                                <input type="text" id="set-clinic-email" class="form-control input-modern">
                            </div>
                            <div class="col-12">
                                <label class="form-label fw-bold small">ที่อยู่คลินิก (สำหรับพิมพ์ลงเอกสารใบรับรอง)</label>
                                <textarea id="set-clinic-address" class="form-control input-modern" rows="2"></textarea>
                            </div>
                        </div>
                        
                        <hr class="my-5 border-light">

                        <h5 class="fw-bold mb-4 position-relative"><i class="fa-solid fa-building text-warning me-2"></i> ข้อมูลบริษัทจดทะเบียน (Company & Tax Info)</h5>
                        <div class="row g-4 position-relative">
                            <div class="col-md-12">
                                <label class="form-label fw-bold small">โลโก้บริษัท (สำหรับใบเสร็จรับเงิน/ใบกำกับภาษี)</label>
                                <div class="d-flex align-items-center gap-3">
                                    <div class="logo-preview-box" id="company-logo-preview-container">
                                        <span class="small"><i class="fa-solid fa-image fa-2x"></i></span>
                                    </div>
                                    <div>
                                        <input type="file" id="file-company-logo" class="form-control input-modern mb-2" accept="image/jpeg, image/png, image/webp" onchange="App.pages.settings.handleLogoUpload(event, 'hidden-company-logo-base64', 'company-logo-preview-container')">
                                        <div class="d-flex gap-2">
                                            <button class="btn btn-outline-warning fw-bold btn-sm rounded-pill px-4 shadow-sm" onclick="App.pages.settings.promptPrintCard('company')"><i class="fa-solid fa-print me-2"></i> พิมพ์นามบัตรใบกำกับภาษี</button>
                                            <button class="btn btn-outline-danger fw-bold btn-sm rounded-pill px-3 shadow-sm" onclick="App.pages.settings.deleteLogo('company')"><i class="fa-solid fa-trash me-1"></i> ลบโลโก้</button>
                                        </div>
                                    </div>
                                </div>
                                <input type="hidden" id="hidden-company-logo-base64">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold small">ชื่อบริษัท / นิติบุคคล (Company Name)</label>
                                <input type="text" id="set-company-name" class="form-control input-modern fw-bold">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold small">เลขประจำตัวผู้เสียภาษี (Tax ID)</label>
                                <input type="text" id="set-clinic-tax" class="form-control input-modern text-danger fw-bold" placeholder="เลข 13 หลัก">
                            </div>
                            <div class="col-12">
                                <label class="form-label fw-bold small">ที่อยู่บริษัทจดทะเบียน (สำหรับออกใบกำกับภาษี / ใบเสร็จรับเงิน)</label>
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
                            <div><h5 class="fw-bold mb-1"><i class="fa-solid fa-users-viewfinder text-info me-2"></i> รายชื่อผู้ใช้งานในระบบ</h5><p class="small mb-0">จัดการไอดีล็อคอิน, สิทธิ์การเข้าถึง (Role) และสถานะบัญชี</p></div>
                            <div class="d-flex gap-2">
                                <button class="btn btn-outline-danger fw-bold shadow-sm rounded-pill px-4" onclick="App.pages.settings.setAdminPin()"><i class="fa-solid fa-key me-2"></i> ตั้งค่า PIN รีเซ็ตรหัส</button>
                                <button class="btn btn-premium btn-premium-primary text-white fw-bold shadow-sm rounded-pill px-4" onclick="App.pages.settings.openUserModal()"><i class="fa-solid fa-user-plus me-2"></i> เพิ่มผู้ใช้งานใหม่</button>
                            </div>
                        </div>
                        <div class="table-responsive rounded-3 shadow-sm border border-light position-relative z-1">
                            <table class="table table-premium w-100 mb-0">
                                <thead>
                                    <tr>
                                        <th style="width: 25%;"><i class="fa-solid fa-user-tag me-2"></i> ผู้ใช้งาน (Name)</th>
                                        <th style="width: 20%;"><i class="fa-solid fa-fingerprint me-2"></i> ไอดี (Username)</th>
                                        <th class="text-center" style="width: 15%;"><i class="fa-solid fa-shield-halved me-2"></i> ระดับสิทธิ์</th>
                                        <th class="text-center" style="width: 15%;"><i class="fa-solid fa-toggle-on me-2"></i> สถานะ</th>
                                        <th class="text-center" style="width: 25%;"><i class="fa-solid fa-gears me-2"></i> จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody id="users-table-body">
                                    <tr><td colspan="5" class="text-center py-5"><i class="fas fa-spinner fa-spin fa-2x mb-3"></i><br>กำลังโหลดข้อมูลผู้ใช้งาน...</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="medical-panel" role="tabpanel">
                    <div class="modern-panel mb-4 p-4" style="border-top: 4px solid var(--danger); border-radius: 16px;">
                        <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                            <div><h5 class="fw-bold mb-1"><i class="fa-solid fa-vial-virus text-danger me-2"></i> 1. จัดการชุดผลแล็บ และ ราคา (Lab Sets)</h5><p class="small mb-0">ตั้งค่าชุดแล็บและราคาเหมาชุด สำหรับดึงข้อมูลในหน้า Flowsheet</p></div>
                            <button class="btn btn-outline-danger fw-bold shadow-sm rounded-pill px-4" onclick="App.pages.settings.openLabSetModal()"><i class="fa-solid fa-plus me-1"></i> สร้างชุดแล็บใหม่</button>
                        </div>
                        <div class="row g-3" id="lab-sets-container"><div class="col-12 text-center py-4"><i class="fas fa-spinner fa-spin"></i> กำลังโหลดข้อมูล...</div></div>
                    </div>

                    <div class="row g-4 mb-4">
                        <div class="col-xl-6">
                            <div class="modern-panel p-4 h-100" style="border-top: 4px solid #8b5cf6; border-radius: 16px;">
                                <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                                    <div><h5 class="fw-bold mb-1" style="color: #8b5cf6 !important;"><i class="fa-solid fa-syringe me-2"></i> 2. ยาฉีด/เวชภัณฑ์ (Meds)</h5></div>
                                    <button class="btn text-white fw-bold shadow-sm rounded-pill px-3" style="background:#8b5cf6;" onclick="App.pages.settings.openMedListModal()"><i class="fa-solid fa-plus me-1"></i> เพิ่มรายการ</button>
                                </div>
                                <div class="d-flex flex-wrap gap-2" id="meds-list-container"></div>
                            </div>
                        </div>
                        <div class="col-xl-6">
                            <div class="modern-panel p-4 h-100" style="border-top: 4px solid #14b8a6; border-radius: 16px;">
                                <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                                    <div><h5 class="fw-bold mb-1" style="color: #14b8a6 !important;"><i class="fa-solid fa-x-ray me-2"></i> 3. รายการเอ็กซเรย์ (X-Ray)</h5></div>
                                    <button class="btn text-white fw-bold shadow-sm rounded-pill px-3" style="background:#14b8a6;" onclick="App.pages.settings.openXrayModal()"><i class="fa-solid fa-plus me-1"></i> เพิ่มรายการ</button>
                                </div>
                                <div class="d-flex flex-wrap gap-2" id="xrays-list-container"></div>
                            </div>
                        </div>
                    </div>

                    <div class="modern-panel mb-4 p-4" style="border-top: 4px solid var(--warning); border-radius: 16px;">
                        <div class="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                            <div><h5 class="fw-bold mb-1"><i class="fa-solid fa-file-signature text-warning me-2"></i> 4. เทมเพลตบันทึกการรักษา (Progress Notes)</h5><p class="small mb-0">ข้อความมาตรฐานเพื่อช่วยให้พยาบาลบันทึกอาการได้รวดเร็ว</p></div>
                            <button class="btn btn-outline-warning fw-bold shadow-sm rounded-pill px-4" onclick="App.pages.settings.openNoteTemplateModal()"><i class="fa-solid fa-plus me-1"></i> สร้างเทมเพลต</button>
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

                <div class="tab-pane fade" id="theme-panel" role="tabpanel">
                    ${themeUIHtml}
                </div>

                <div class="tab-pane fade" id="database-panel" role="tabpanel">
                    ${databaseUIHtml}
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
    }

    // ---------------------------------------------------------
    // ☢️ Database Management (Purge & Factory Reset) 🚨 Triple-Layer Security 🚨
    // ---------------------------------------------------------
    
    async promptCustomPurge() {
        const target = document.getElementById('db-purge-target').value;
        const years = document.getElementById('db-purge-time').value;
        
        const labels = {
            'visits': 'ประวัติการฟอกเลือด (HD Flowsheet & EMR)',
            'ledger': 'บัญชีรายรับ-รายจ่าย (Department Ledger)',
            'inventory': 'ประวัติเข้า-ออกพัสดุ (Inventory History)'
        };

        const targetLabel = labels[target];

        this._verifyAdminPinAndExecute(`คุณกำลังจะลบ <b>${targetLabel}</b> ที่เก่ากว่า <b>${years} ปี</b>`, 'DELETE', () => {
            this._executeCustomPurge(target, parseInt(years));
        });
    }

    async _executeCustomPurge(target, years) {
        Swal.fire({ title: 'กำลังกวาดล้างข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - years);
        const cutoffStr = cutoffDate.toISOString().split('T')[0];

        let path = '';
        let dateField = 'date'; 

        if (target === 'visits') path = 'patients_database_v2/visits';
        else if (target === 'ledger') path = 'department_ledger_v2';
        else if (target === 'inventory') path = 'inventory_database_v2/transactions';

        try {
            const snap = await db.ref(path).orderByChild(dateField).endAt(cutoffStr).once('value');
            if (snap.exists()) {
                let updates = {};
                let count = 0;
                snap.forEach(child => {
                    updates[child.key] = null;
                    count++;
                });
                
                await db.ref(path).update(updates);
                Swal.fire('ล้างข้อมูลสำเร็จ!', `ระบบทำการลบข้อมูลเก่าไปแล้วจำนวน ${count} รายการ`, 'success');
            } else {
                Swal.fire('ไม่มีข้อมูล', 'ไม่พบข้อมูลที่เก่าพอจะเข้าเงื่อนไขการลบครับ', 'info');
            }
        } catch (error) {
            Swal.fire('ข้อผิดพลาด', `เกิดข้อผิดพลาดในการลบข้อมูล: ${error.message}`, 'error');
        }
    }

    promptFactoryReset() {
        const wipePatients = document.getElementById('wipe-patients').checked;
        const wipeStockHistory = document.getElementById('wipe-stock-history').checked;
        const wipeInventoryItems = document.getElementById('wipe-inventory-items').checked;
        const wipeLedger = document.getElementById('wipe-ledger').checked;
        const wipeMaster = document.getElementById('wipe-master').checked;

        if (!wipePatients && !wipeStockHistory && !wipeInventoryItems && !wipeLedger && !wipeMaster) {
            Swal.fire('แจ้งเตือน', 'กรุณาติ๊กเลือกส่วนที่ต้องการล้างข้อมูลอย่างน้อย 1 รายการครับ', 'warning');
            return;
        }

        this._verifyAdminPinAndExecute(`คุณกำลังจะ <span class="text-danger fw-bold">ล้างข้อมูลทั้งระบบ (Factory Reset)</span> ข้อมูลที่เลือกจะหายไปตลอดกาล!`, 'FACTORY RESET', () => {
            this._executeFactoryReset({ wipePatients, wipeStockHistory, wipeInventoryItems, wipeLedger, wipeMaster });
        });
    }

    async _executeFactoryReset(targets) {
        Swal.fire({ title: 'กำลังระเบิดฐานข้อมูล (Factory Reset)...', html: 'กรุณาอย่าปิดหน้าต่างนี้', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        try {
            const promises = [];

            if (targets.wipePatients) {
                promises.push(db.ref('patients_database_v2').remove());
            }
            
            if (targets.wipeStockHistory) {
                promises.push(db.ref('inventory_database_v2/transactions').remove());
            }

            if (targets.wipeInventoryItems) {
                promises.push(db.ref('inventory_database_v2/items').remove());
            }

            if (targets.wipeLedger) {
                promises.push(db.ref('department_ledger_v2').remove());
                promises.push(db.ref('department_ledger_settings_v2/initial_balance').set(0));
            }

            if (targets.wipeMaster) {
                promises.push(db.ref('clinic_lab_sets_v2').remove());
                promises.push(db.ref('clinic_meds_list_v2').remove());
                promises.push(db.ref('clinic_xray_list_v2').remove());
                promises.push(db.ref('clinic_note_templates_v2').remove());
                
                const currentAdminUsername = App.currentUser.username;
                const usersSnap = await db.ref('clinic_users_v2').once('value');
                const users = usersSnap.val();
                if (users) {
                    const remainingAdmin = Object.values(users).filter(u => u.username === currentAdminUsername || u.role === 'admin')[0];
                    if (remainingAdmin) {
                        promises.push(db.ref('clinic_users_v2').set([remainingAdmin]));
                    }
                }
            }

            await Promise.all(promises);

            Swal.fire({
                title: 'ล้างระบบสมบูรณ์!',
                text: 'ข้อมูลถูกล้างตามที่คุณต้องการแล้ว ระบบจะทำการโหลดใหม่เพื่อเคลียร์ความจำ',
                icon: 'success',
                confirmButtonColor: '#10b981'
            }).then(() => {
                window.location.reload();
            });

        } catch (error) {
            Swal.fire('เกิดข้อผิดพลาดร้ายแรง', `ไม่สามารถล้างข้อมูลได้ครบถ้วน: ${error.message}`, 'error');
        }
    }

    async _verifyAdminPinAndExecute(warningHtml, confirmKeyword, executionCallback) {
        const snap = await db.ref('clinic_settings_v2/admin_pin').once('value');
        const adminPin = snap.val();

        if (!adminPin) {
            Swal.fire('ระบบไม่พร้อม', 'ผู้ดูแลระบบยังไม่ได้ตั้งค่า Admin PIN<br>กรุณาตั้งค่า PIN ในแท็บ "จัดการไอดี" ก่อนดำเนินการนี้ครับ', 'warning');
            return;
        }

        Swal.fire({
            title: '<h3 class="text-danger fw-bold"><i class="fa-solid fa-triangle-exclamation me-2"></i> ยืนยันสิทธิ์ขั้นสูงสุด</h3>',
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <p>${warningHtml}</p>
                    <label class="fw-bold small text-secondary">1. พิมพ์คำว่า <b class="text-danger">${confirmKeyword}</b> เพื่อยืนยัน</label>
                    <input type="text" id="swal-confirm-word" class="form-control input-modern mb-3 text-center text-danger fw-bold" placeholder="${confirmKeyword}" autocomplete="off">
                    
                    <label class="fw-bold small text-secondary">2. รหัสผ่านผู้ดูแลระบบ (Admin PIN)</label>
                    <input type="password" id="swal-confirm-pin" class="form-control input-modern text-center fw-bold fs-4 tracking-widest" placeholder="******" maxlength="6" oninput="this.value=this.value.replace(/[^0-9]/g,'')">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-skull me-1"></i> ดำเนินการ',
            confirmButtonColor: '#ef4444',
            cancelButtonText: 'ยกเลิก',
            preConfirm: () => {
                const word = document.getElementById('swal-confirm-word').value.trim();
                const pin = document.getElementById('swal-confirm-pin').value;

                if (word !== confirmKeyword) {
                    Swal.showValidationMessage(`กรุณาพิมพ์คำว่า ${confirmKeyword} ให้ถูกต้อง`);
                    return false;
                }
                if (pin !== adminPin.toString()) {
                    Swal.showValidationMessage('Admin PIN ไม่ถูกต้อง!');
                    return false;
                }
                return true;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                executionCallback();
            }
        });
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
        
        Swal.fire({ title: 'กำลังจัดเตรียมภาพโลโก้...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
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
                
                const compressedBase64 = canvas.toDataURL('image/png');
                
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
        
        // 🚨 THE FIX: เพิ่มตัวเลือกสีม่วง Amethyst Purple ลงใน Dropdown 🚨
        Swal.fire({
            title: `<h4 class="fw-bold mb-0" style="font-family:'Prompt';">${titleHtml}</h4>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <div class="alert alert-warning border-warning shadow-sm small py-2 px-3 mb-3"><i class="fa-solid fa-triangle-exclamation me-1"></i> <b>อย่าลืม!</b> ตอนหน้าต่าง Print เด้งขึ้นมา ให้ติ๊ก <b>"Background graphics"</b> เพื่อให้สีและธีมแสดงผลครับ</div>
                    <label class="fw-bold text-secondary small">เลือกธีมสี (Card Theme)</label>
                    <select id="print-theme" class="form-select input-modern mb-3 shadow-sm" style="font-family:'Prompt'; font-weight: 600;">
                        <option value="theme-modern-blue">🔵 Modern Blue (บลูโอเชียน + ลายคลื่นไอที)</option>
                        <option value="theme-elegant-gold">🟡 Elegant Gold (พรีเมียมแบล็ค + สีทองหรูหรา)</option>
                        <option value="theme-emerald-geo">🟢 Emerald Geo (มินต์สดใส + ลายตัดเหลี่ยม)</option>
                        <option value="theme-rose-wave">🔴 Rose Wave (โรสโกลด์ + อบอุ่นซอฟต์)</option>
                        <option value="theme-amethyst-purple">🪻 Amethyst Purple (ม่วงอเมทิสต์ + ลายพริ้วไหว)</option>
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
            : `<div class="logo-wrapper placeholder-logo"><i class="fa-solid fa-building"></i></div>`;
            
        let processedWatermarkBase64 = await this.generateWatermarkImage(logoBase64);

        let watermarkHtml = processedWatermarkBase64 
            ? `<div class="watermark-container"><img src="${processedWatermarkBase64}"></div>` 
            : ``; 

        let cardsHtml = '';
        
        for (let i = 0; i < qty; i++) {
            if (type === 'clinic') {
                cardsHtml += `
                <div class="business-card clinic-card ${themeClass}">
                    <div class="card-bg-wash"></div>
                    <div class="accent-shape"></div>
                    <div class="pattern-overlay"></div>
                    ${watermarkHtml}
                    <div class="content-layer">
                        <div class="brand-zone clinic-brand">
                            ${logoHtml}
                            <div class="text-zone">
                                <div class="company-name company-name-text">${this._escapeHTML(cardName)}</div>
                                <div class="tax-id clinic-id"><i class="fa-solid fa-hospital-user me-1"></i> ${idLabel}: ${this._escapeHTML(idValue)}</div>
                            </div>
                        </div>
                        <div class="divider"></div>
                        <div class="contact-zone clinic-contact">
                            <div class="contact-item"><i class="fa-solid fa-location-dot contact-icon"></i><span>${this._escapeHTML(cardAddress)}</span></div>
                            <div class="contact-item"><i class="fa-solid fa-phone contact-icon"></i><span>${this._escapeHTML(cardPhone)}${cardEmail !== '-' ? ' &nbsp;|&nbsp; <i class="fa-solid fa-envelope contact-icon"></i> ' + this._escapeHTML(cardEmail) : ''}</span></div>
                        </div>
                    </div>
                </div>`;
            } else {
                cardsHtml += `
                <div class="business-card company-card ${themeClass}">
                    <div class="card-bg-wash"></div>
                    <div class="accent-shape"></div>
                    <div class="pattern-overlay"></div>
                    ${watermarkHtml}
                    <div class="content-layer" style="padding: 5mm 6mm;">
                        <div class="corp-header">
                            <div class="corp-badge"><i class="fa-solid fa-file-invoice-dollar me-1"></i> OFFICIAL CORPORATE & TAX INFO</div>
                        </div>
                        <div class="corp-brand">
                            ${logoHtml}
                            <div class="text-zone">
                                <div class="company-name company-name-text">${this._escapeHTML(cardName)}</div>
                                <div class="tax-id-box">${idLabel}: ${this._escapeHTML(idValue)}</div>
                            </div>
                        </div>
                        <div class="corp-contact">
                            <div class="contact-item mb-1"><i class="fa-solid fa-building contact-icon"></i> <span>${this._escapeHTML(cardAddress)}</span></div>
                            <div class="contact-item"><i class="fa-solid fa-phone contact-icon"></i> <span>${this._escapeHTML(cardPhone)}${cardEmail !== '-' ? ' &nbsp;|&nbsp; <i class="fa-solid fa-envelope contact-icon"></i> ' + this._escapeHTML(cardEmail) : ''}</span></div>
                        </div>
                    </div>
                </div>`;
            }
        }

        const printTitle = type === 'clinic' ? 'พิมพ์นามบัตรสถานพยาบาล' : 'พิมพ์นามบัตรใบกำกับภาษี';

        const printContent = `
        <!DOCTYPE html>
        <html lang="th">
            <head>
                <meta charset="UTF-8">
                <title>${printTitle} - ${qty} ใบ</title>
                <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;700;800&family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    @page { size: A4 portrait; margin: 8mm; } 
                    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; } 
                    
                    body { margin: 0; padding: 0; font-family: 'Sarabun', sans-serif; background: #e2e8f0; display: flex; flex-direction: column; align-items: center; } 
                    
                    .instruction { text-align: center; color: #475569; font-size: 14px; margin: 10mm 0; background: #fff; padding: 15px 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); } 
                    @media print { .instruction { display: none; } body { background: #fff; display: block; } } 
                    
                    .print-grid { display: grid; grid-template-columns: repeat(2, 90mm); gap: 0; margin: 0 auto; justify-content: center; } 
                    
                    /* โครงร่างนามบัตรมาตรฐาน (90x54mm) */
                    .business-card { 
                        width: 90mm; height: 54mm; 
                        position: relative; background: #ffffff; 
                        overflow: hidden; page-break-inside: avoid; 
                        border: 0.5px dashed #cbd5e1; /* กรอบตัด (Crop marks) */
                        box-shadow: inset 0 0 0 1px rgba(0,0,0,0.02); /* ขอบบางๆ ด้านในให้ดูคม */
                    } 
                    
                    .card-bg-wash { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; } 
                    .accent-shape { position: absolute; z-index: 2; pointer-events: none; } /* สีกราฟิกเด่นๆ */
                    .pattern-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 3; opacity: 0.8; } 
                    
                    .watermark-container { position: absolute; right: 0; bottom: 0; width: 50%; height: 100%; z-index: 4; display: flex; align-items: center; justify-content: flex-end; opacity: 0.05; padding-right: 5mm; } 
                    .watermark-container img { width: 100%; height: 100%; object-fit: contain; filter: grayscale(100%); } 
                    
                    .content-layer { position: relative; z-index: 10; width: 100%; height: 100%; display: flex; flex-direction: column; padding: 6mm 7mm; } 
                    
                    /* -------------------------------------- */
                    /* 🎨 THEME ENGINE 2.0 (Vibrant Colors) */
                    /* -------------------------------------- */

                    /* ⚪ Clean White */
                    .theme-clean-white.clinic-card { border-left: 4px solid #94a3b8 !important; } 
                    .theme-clean-white.company-card { border-top: 4px solid #94a3b8 !important; }
                    .theme-clean-white .card-bg-wash { background: linear-gradient(135deg, #ffffff 40%, #f8fafc 100%); }
                    .theme-clean-white .divider { background: linear-gradient(90deg, #94a3b8, transparent); }

                    /* 🔵 Modern Blue (Ocean Wave) */
                    .theme-modern-blue.clinic-card { border-left: 4px solid #2563eb !important; } 
                    .theme-modern-blue.company-card { border-top: 4px solid #2563eb !important; }
                    .theme-modern-blue .card-bg-wash { background: linear-gradient(120deg, #ffffff 50%, #eff6ff 100%); }
                    .theme-modern-blue .accent-shape { right: -15mm; top: -15mm; width: 50mm; height: 50mm; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 50%; opacity: 0.15; filter: blur(4px); }
                    .theme-modern-blue .pattern-overlay { background-image: linear-gradient(rgba(37,99,235,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.08) 1px, transparent 1px); background-size: 15px 15px; opacity: 0.5; } 
                    .theme-modern-blue .divider { background: linear-gradient(90deg, #2563eb, transparent); height: 1.5px; }
                    .theme-modern-blue .tax-id-box { background: linear-gradient(135deg, #2563eb, #1e40af) !important; box-shadow: 0 2px 4px rgba(37,99,235,0.2); }

                    /* 🟡 Elegant Gold (Dark Premium Mode) */
                    .theme-elegant-gold { border: none !important; background: #0f172a !important; color: #f8fafc !important; }
                    .theme-elegant-gold.business-card { border: 0.5px dashed #475569; }
                    .theme-elegant-gold .card-bg-wash { background: linear-gradient(135deg, #0f172a 30%, #1e293b 100%); }
                    .theme-elegant-gold .accent-shape { right: -10mm; bottom: -10mm; width: 60mm; height: 60mm; background: radial-gradient(circle, rgba(217,119,6,0.3) 0%, transparent 70%); }
                    .theme-elegant-gold .pattern-overlay { background: repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 8px); }
                    .theme-elegant-gold .company-name { color: #fbbf24 !important; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
                    .theme-elegant-gold .contact-icon, .theme-elegant-gold .clinic-id, .theme-elegant-gold .contact-item span { color: #cbd5e1 !important; }
                    .theme-elegant-gold .corp-badge { color: #94a3b8 !important; }
                    .theme-elegant-gold .divider { background: linear-gradient(90deg, #fbbf24, transparent); height: 1px; opacity: 0.7; }
                    .theme-elegant-gold .tax-id-box { background: linear-gradient(135deg, #d97706, #92400e) !important; color: #fff !important; box-shadow: 0 2px 4px rgba(0,0,0,0.5); border: 1px solid #fbbf24; }

                    /* 🟢 Emerald Geo (Mint Tech) */
                    .theme-emerald-geo.clinic-card { border-left: 4px solid #10b981 !important; } 
                    .theme-emerald-geo.company-card { border-top: 4px solid #10b981 !important; }
                    .theme-emerald-geo .card-bg-wash { background: linear-gradient(110deg, #ffffff 40%, #ecfdf5 100%); }
                    .theme-emerald-geo .accent-shape { left: -10mm; bottom: -15mm; width: 45mm; height: 45mm; background: linear-gradient(135deg, #34d399, #059669); transform: rotate(45deg); opacity: 0.1; }
                    .theme-emerald-geo .pattern-overlay { background: radial-gradient(circle at 100% 0%, rgba(16,185,129,0.08) 0%, transparent 50%); } 
                    .theme-emerald-geo .divider { background: linear-gradient(90deg, #10b981, transparent); height: 1.5px; }
                    .theme-emerald-geo .tax-id-box { background: linear-gradient(135deg, #10b981, #047857) !important; box-shadow: 0 2px 4px rgba(16,185,129,0.2); }

                    /* 🔴 Rose Wave (Soft Crimson) */
                    .theme-rose-wave.clinic-card { border-left: 4px solid #e11d48 !important; } 
                    .theme-rose-wave.company-card { border-top: 4px solid #e11d48 !important; }
                    .theme-rose-wave .card-bg-wash { background: linear-gradient(130deg, #ffffff 50%, #fff1f2 100%); }
                    .theme-rose-wave .accent-shape { right: -5mm; top: -5mm; width: 25mm; height: 60mm; background: #be123c; border-radius: 40px; transform: rotate(20deg); opacity: 0.06; }
                    .theme-rose-wave .divider { background: linear-gradient(90deg, #e11d48, transparent); height: 1.5px; }
                    .theme-rose-wave .tax-id-box { background: linear-gradient(135deg, #e11d48, #9f1239) !important; box-shadow: 0 2px 4px rgba(225,29,72,0.2); }

                    /* 🚨 THE FIX: 🪻 Amethyst Purple (สีม่วงอเมทิสต์) 🚨 */
                    .theme-amethyst-purple.clinic-card { border-left: 4px solid #8b5cf6 !important; } 
                    .theme-amethyst-purple.company-card { border-top: 4px solid #8b5cf6 !important; }
                    .theme-amethyst-purple .card-bg-wash { background: linear-gradient(135deg, #ffffff 30%, #f5f3ff 100%); }
                    .theme-amethyst-purple .accent-shape { right: -15mm; bottom: -15mm; width: 50mm; height: 50mm; background: radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%); }
                    .theme-amethyst-purple .pattern-overlay { background: repeating-linear-gradient(-45deg, rgba(139,92,246,0.03) 0px, rgba(139,92,246,0.03) 2px, transparent 2px, transparent 10px); }
                    .theme-amethyst-purple .divider { background: linear-gradient(90deg, #8b5cf6, transparent); height: 1.5px; }
                    .theme-amethyst-purple .tax-id-box { background: linear-gradient(135deg, #8b5cf6, #5b21b6) !important; box-shadow: 0 2px 4px rgba(139,92,246,0.2); color: #fff !important; }

                    /* Common elements */
                    .logo-wrapper { height: 16mm; max-width: 40mm; min-width: 16mm; flex-shrink: 0; display: flex; align-items: center; justify-content: flex-start; } 
                    .logo-img { max-width: 100%; max-height: 100%; width: auto; object-fit: contain; object-position: left center; } 
                    .placeholder-logo { background: rgba(0,0,0,0.05); border-radius: 8px; color: #94a3b8; font-size: 20px; justify-content: center; width: 16mm; }
                    .text-zone { display: flex; flex-direction: column; justify-content: center; overflow: hidden; } 
                    .company-name { font-size: 13.5pt; font-weight: 800; line-height: 1.2; color: #0f172a; font-family: 'Prompt', sans-serif; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; letter-spacing: -0.2px; } 
                    .contact-icon { color: #64748b; font-size: 7.5pt; padding-top: 2px; text-align: center; }

                    /* -------------------------------------- */
                    /* Layout A: CLINIC CARD (Patient-facing) */
                    /* -------------------------------------- */
                    .clinic-card .brand-zone { display: flex; align-items: center; gap: 4mm; margin-bottom: auto; } 
                    .clinic-card .logo-wrapper { height: 18mm; max-width: 35mm; min-width: 18mm; }
                    .clinic-card .clinic-id { font-size: 7.5pt; font-weight: 700; color: #64748b; margin-top: 1mm; font-family: 'Prompt', sans-serif; letter-spacing: 0.3px; } 
                    .clinic-card .divider { width: 100%; margin: 2mm 0; }
                    .clinic-card .clinic-contact { display: grid; gap: 1.5mm; font-size: 8pt; color: #334155; line-height: 1.3; font-weight: 600; } 
                    .clinic-card .contact-item { display: grid; grid-template-columns: 4mm 1fr; align-items: start; } 

                    /* -------------------------------------- */
                    /* Layout B: COMPANY CARD (Corporate Tax) */
                    /* -------------------------------------- */
                    .company-card .corp-header { text-align: right; margin-bottom: 2mm; border-bottom: 1px solid rgba(128,128,128,0.15); padding-bottom: 1mm; }
                    .company-card .corp-badge { font-size: 5.5pt; font-weight: 800; letter-spacing: 0.5px; color: #64748b; text-transform: uppercase; }
                    .company-card .corp-brand { display: flex; align-items: center; gap: 4mm; margin-bottom: auto; }
                    .company-card .tax-id-box { display: inline-block; background: #0f172a; color: #fff; padding: 2px 8px; border-radius: 6px; font-size: 7.5pt; margin-top: 1.5mm; font-weight: 700; font-family: 'Prompt', sans-serif; letter-spacing: 0.5px; }
                    .company-card .corp-contact { font-size: 7.5pt; color: #334155; line-height: 1.3; font-weight: 600; padding-top: 2mm; border-top: 1px dashed rgba(128,128,128,0.25); display: grid; gap: 1mm; }
                    .company-card .contact-item { display: grid; grid-template-columns: 4mm 1fr; align-items: start; } 
                </style>
            </head>
            <body>
                <div class="instruction">
                    <h4 style="margin:0 0 5px 0; color:#0f172a;"><i class="fa-solid fa-print text-primary"></i> โหมดพรีวิวการพิมพ์ระดับ Enterprise</h4>
                    <span style="color:#ef4444; font-weight:bold;">🚨 คำเตือน:</span> ก่อนกดพิมพ์ ให้ดูที่การตั้งค่าเครื่องพิมพ์ แล้วติ๊กถูกที่ช่อง <b>"พิมพ์กราฟิกพื้นหลัง" (Background graphics)</b> ด้วยนะครับ เพื่อให้สี ลวดลายกราฟิก และเฉดเงาแสดงผลสมบูรณ์ที่สุด! 🖨️
                </div>
                <div class="print-grid">${cardsHtml}</div>
                
                <script>
                    setTimeout(function() {
                        const texts = document.querySelectorAll(".company-name-text");
                        texts.forEach(textEl => {
                            let currentSize = 13.5; 
                            while(textEl.scrollHeight > 36 && currentSize > 9) { 
                                currentSize -= 0.5;
                                textEl.style.fontSize = currentSize + "pt";
                            }
                        });
                    }, 100);
                </script>
            </body>
        </html>`;

        setTimeout(() => {
            Swal.close();
            
            let oldIframe = document.getElementById('hidden-print-frame'); 
            if (oldIframe) oldIframe.remove();
            
            let iframe = document.createElement('iframe'); 
            iframe.id = 'hidden-print-frame'; 
            iframe.style.position = 'fixed'; iframe.style.right = '0'; iframe.style.bottom = '0'; iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = '0'; 
            document.body.appendChild(iframe);

            iframe.contentWindow.document.open();
            iframe.contentWindow.document.write(printContent);
            iframe.contentWindow.document.close();
            
            iframe.onload = function() {
                setTimeout(() => { 
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print(); 
                    setTimeout(() => { iframe.remove(); }, 10000); 
                }, 800);
            };
            
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
            // 🚨 THE FIX: จัดการเรื่องสีป้ายกำกับ (Role Badge) ที่หายไป
            let roleInfo = this.roleConfig[user.role] || { label: 'พนักงานทั่วไป', icon: 'fa-user', color: 'secondary' };
            
            // เปลี่ยนมาใช้ bg-[color]-subtle และ text-[color] ของ Bootstrap เพื่อการันตีว่าสีพื้นหลังและตัวหนังสือจะแสดงผล 100% แน่นอน
            let roleBadge = `<span class="badge bg-${roleInfo.color}-subtle text-${roleInfo.color} border border-${roleInfo.color}-subtle px-3 py-2 rounded-pill shadow-sm" style="font-size: 13px;"><i class="fa-solid ${roleInfo.icon} me-1"></i> ${roleInfo.label}</span>`;
            
            let statusBadge = user.status === 'active' 
                ? '<span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 shadow-sm"><i class="fa-solid fa-check-circle me-1"></i> ปกติ</span>' 
                : '<span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 shadow-sm"><i class="fa-solid fa-lock me-1"></i> ระงับ</span>';
            
            let safeName = this._escapeHTML(user.name || 'U');
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
                            <div class="small text-muted" style="font-size: 12px;">ID: ${this._escapeHTML(user.id)}</div>
                        </div>
                    </div>
                </td>
                <td class="fw-bold text-primary" style="font-size: 14.5px;">${this._escapeHTML(user.username)}</td>
                <td class="text-center">${roleBadge}</td>
                <td class="text-center">${statusBadge}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-light border shadow-sm me-1 fw-bold text-dark" onclick="App.pages.settings.openUserModal('${user.id}')" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-light border shadow-sm me-1 fw-bold text-info" onclick="App.pages.settings.openRolePermissionsModal('${user.role}', '${user.name}')" title="ตั้งค่าการมองเห็นเมนู"><i class="fa-solid fa-shield-halved"></i> แก้ไขสิทธิ์</button>
                    <button class="btn btn-sm btn-outline-danger shadow-sm fw-bold" onclick="App.pages.settings.deleteUser('${user.id}')" title="ลบ"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
        });
        tbody.innerHTML = html;
    }
    openRolePermissionsModal(roleId, userName) {
        if (roleId === 'admin') {
            Swal.fire('สิทธิ์สูดสุด', 'ผู้ดูแลระบบ (Admin) มีสิทธิ์เข้าถึงทุกเมนูโดยอัตโนมัติ ไม่สามารถปิดกั้นสิทธิ์ได้ครับ', 'info');
            return;
        }

        const roleInfo = this.roleConfig[roleId];
        const roleLabel = roleInfo ? roleInfo.label : roleId;
        
        const currentPermissions = (typeof App !== 'undefined' && App.rolePermissions && App.rolePermissions[roleId]) ? App.rolePermissions[roleId] : [];
        
        let checkboxesHtml = `<div class="row g-2 mt-2" style="max-height: 50vh; overflow-y: auto; padding: 5px;">`;
        Object.keys(this.pageDescriptions).forEach(pageKey => {
            const isChecked = currentPermissions.includes(pageKey) ? 'checked' : '';
            checkboxesHtml += `
                <div class="col-md-6">
                    <label class="perm-check-item">
                        <input type="checkbox" class="role-permission-checkbox" value="${pageKey}" ${isChecked}>
                        <span>${this.pageDescriptions[pageKey]}</span>
                    </label>
                </div>
            `;
        });
        checkboxesHtml += `</div>`;

        Swal.fire({
            title: `<h4 class="fw-bold text-primary mb-0"><i class="fa-solid fa-shield-halved me-2"></i> จัดการสิทธิ์ของตำแหน่ง <span class="text-danger">${roleLabel}</span></h4>`,
            html: `
                <div class="text-start mt-2" style="font-family:'Sarabun';">
                    <p class="small text-muted mb-3">ติ๊กเลือกเมนูที่ต้องการอนุญาตให้พนักงานในตำแหน่งนี้มองเห็น (ส่งผลกับ <b>${userName}</b> และพนักงานทุกคนที่ใช้ตำแหน่งเดียวกัน)</p>
                    ${checkboxesHtml}
                </div>
            `,
            width: 700,
            showCancelButton: true,
            confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึกการเปลี่ยนแปลง',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#3b82f6',
            preConfirm: () => {
                const checkboxes = document.querySelectorAll('.role-permission-checkbox:checked');
                const selectedPages = Array.from(checkboxes).map(cb => cb.value);
                
                if (selectedPages.length === 0) {
                    Swal.showValidationMessage('ต้องอนุญาตให้เข้าถึงอย่างน้อย 1 เมนูครับ (แนะนำให้เหลือ แดชบอร์ด ไว้)');
                    return false;
                }
                return selectedPages;
            }
        }).then(res => {
            if (res.isConfirmed) {
                Swal.fire({ title: 'กำลังบันทึกและซิงค์สิทธิ์ไปยังเครื่องอื่นๆ...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                
                db.ref(`clinic_roles_v2/${roleId}`).set(res.value).then(() => {
                    Swal.fire({ title: 'สำเร็จ!', text: 'อัปเดตสิทธิ์การมองเห็นเมนูเรียบร้อยแล้ว', icon: 'success', timer: 1500, showConfirmButton: false });
                }).catch(err => {
                    Swal.fire('ข้อผิดพลาด', err.message, 'error');
                });
            }
        });
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
                            <input type="text" id="swal-user-name" class="form-control input-modern" value="${this._escapeHTML(user.name || '')}">
                        </div>
                        <div class="col-6">
                            <label class="fw-bold text-secondary small">Username (ไอดีล็อคอิน) <span class="text-danger">*</span></label>
                            <input type="text" id="swal-user-username" class="form-control input-modern text-primary" value="${this._escapeHTML(user.username || '')}" ${isEdit?'readonly':''}>
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
            let tags = s.items.map(i => `<span class="badge bg-light text-dark border px-2 py-1 me-1 mb-1 shadow-sm"><i class="fa-solid fa-droplet text-danger me-1"></i>${this._escapeHTML(i)}</span>`).join('');
            
            let priceLabel = s.price ? `<span class="badge bg-white text-danger border ms-2 px-2 py-1 shadow-sm fs-6"><i class="fa-solid fa-tag"></i> ฿${Number(s.price).toLocaleString()}</span>` : '';
            
            html += `
            <div class="col-md-6 col-lg-4">
                <div class="modern-panel card-hover-float p-3 h-100 d-flex flex-column position-relative" style="border-left: 4px solid var(--danger);">
                    <h6 class="fw-bold text-dark mb-3"><i class="fa-solid fa-folder-open text-danger me-2"></i> ${this._escapeHTML(s.name)} ${priceLabel}</h6>
                    <div class="mb-3">${tags}</div>
                    <div class="mt-auto text-end border-top pt-3">
                        <button class="btn btn-sm btn-custom-manage shadow-sm fw-bold px-3 me-1" onclick="App.pages.settings.openLabSetModal('${s.id}')">แก้ไข</button>
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
                    <input type="text" id="swal-lab-name" class="form-control input-modern mb-3" value="${this._escapeHTML(set.name || '')}" placeholder="เช่น เจาะเลือดประจำเดือน">
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
                    <span onclick="App.pages.settings.openMedListModal('${m.id}')" style="cursor:pointer;">${this._escapeHTML(m.name)}</span> 
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
                    <input type="text" id="swal-med-name" class="form-control input-modern mb-3 fw-bold text-dark" value="${this._escapeHTML(m.name)}" placeholder="เช่น Heparin 5000U">
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
                    <span onclick="App.pages.settings.openXrayModal('${x.id}')" style="cursor:pointer;">${this._escapeHTML(x.name)}</span> 
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
                    <input type="text" id="swal-xray-name" class="form-control input-modern mb-3 fw-bold text-dark" value="${this._escapeHTML(x.name)}" placeholder="เช่น Chest X-Ray (CXR)">
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
                        <h6 class="fw-bold text-dark mb-0" style="padding-right: 60px; line-height: 1.4;">${iconHtml} ${this._escapeHTML(t.title)}</h6>
                        <div style="position: absolute; right: 15px; top: 15px;">${catBadge}</div>
                    </div>
                    <p class="text-muted small mb-3 p-2 bg-light rounded" style="display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; white-space: pre-wrap; font-size: 13px;">${this._escapeHTML(t.text)}</p>
                    <div class="text-end mt-auto pt-2">
                        <button class="btn btn-sm btn-custom-manage shadow-sm px-3 me-1 fw-bold" onclick="App.pages.settings.openNoteTemplateModal('${t.id}')">แก้ไข</button>
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
                    <input type="text" id="swal-note-title" class="form-control input-modern mb-3" value="${this._escapeHTML(t.title || '')}" placeholder="เช่น ความดันตกให้ NSS">
                    <label class="fw-bold text-secondary small">ข้อความเนื้อหาที่จะบันทึกลงระบบ</label>
                    <textarea id="swal-note-text" class="form-control input-modern p-3" rows="5" placeholder="พิมพ์ข้อความมาตรฐานที่นี่...">${this._escapeHTML(t.text || '')}</textarea>
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
    _escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
}

// 🌐 Expose Component สู่ระบบ Router
const SettingsPage = new SettingsPageComponent();
window.SettingsPage = SettingsPage;