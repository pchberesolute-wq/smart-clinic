// js/pages/visit_detail.js
// 🚀 Enterprise Flowsheet Module: Auto-Sync Engine, Smart Pricing & Medical Alert System

class VisitDetailPageComponent {
    constructor() {
        this.state = {
            visitId: null,
            visitData: null,
            patientProfile: {}, // 🔥 ดึงข้อมูลประวัติคนไข้หลักมาเก็บไว้ตรงนี้
            isFormLoaded: false,
            inventoryItems: new Map(), 
            labSets: [], noteTemplates: [], medsList: [], xraysList: [], modalities: [], clinicRights: [],
            clinicSettings: {},
            currentMeds: [], currentLabs: [], currentXrays: [], currentAttachments: [], 
            isStockDeducted: false, 
            selectedDate: null,
            hasCleanedUp: false
        };
        
        this.firebaseListeners = [];
        this.activeDropdown = null; 
        this.currentDropdownInput = null;
        
        this.boundHandleDragOver = this.handleDragOver.bind(this);
        this.boundHandleDrop = this.handleDrop.bind(this);
        this.boundHandleDragLeave = this.handleDragLeave.bind(this);
        this.boundGlobalClickAway = this.handleGlobalClickAway.bind(this);
        this.boundScrollClose = () => this.closeActiveDropdown();
    }

    parseFBArray(data) {
        if (!data) return [];
        if (Array.isArray(data)) return data.filter(item => item !== null && item !== undefined);
        if (typeof data === 'object' && data !== null) return Object.values(data).filter(item => item !== null && item !== undefined);
        return []; 
    }

    escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }

    get html() {
        return `
            <style>
                @keyframes fadeInUpLocal{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}} 
                .fade-in-up{animation:fadeInUpLocal 0.4s cubic-bezier(0.16,1,0.3,1) forwards;opacity:0;} 
                #vd-main-screen .form-label,#vd-main-screen .text-secondary,#vd-main-screen .text-muted{color:#334155!important;font-weight:600!important;letter-spacing:0.2px;} 
                #vd-main-screen .form-control,#vd-main-screen .form-select,#vd-main-screen .input-modern{color:#0f172a!important;font-weight:700!important;font-size:14.5px!important; border-radius: 12px;} 
                #vd-main-screen .badge{font-weight:700!important;letter-spacing:0.3px;} 
                #vd-main-screen .modern-panel,#vd-main-screen .solid-input-group{box-shadow:0 4px 10px rgba(0,0,0,0.04)!important; border-radius: 20px;} 
                .btn-outline-primary.bg-white:hover,.btn-outline-primary.bg-white:hover *{background-color:#3b82f6!important;border-color:#3b82f6!important;color:#ffffff!important;} 
                .btn-outline-info.bg-white:hover,.btn-outline-info.bg-white:hover *{background-color:#0ea5e9!important;border-color:#0ea5e9!important;color:#ffffff!important;} 
                .btn-outline-warning.bg-white:hover,.btn-outline-warning.bg-white:hover *{background-color:#eab308!important;border-color:#eab308!important;color:#ffffff!important;} 
                .btn-outline-danger.bg-white:hover,.btn-outline-danger.bg-white:hover *{background-color:#ef4444!important;border-color:#ef4444!important;color:#ffffff!important;} 
                .btn-outline-secondary.bg-white:hover,.btn-outline-secondary.bg-white:hover *{background-color:#64748b!important;border-color:#64748b!important;color:#ffffff!important;} 
                .btn-outline-success.bg-white:hover,.btn-outline-success.bg-white:hover *{background-color:#10b981!important;border-color:#10b981!important;color:#ffffff!important;} 
                .vd-date-picker{background:var(--bg-surface); border-radius:50px; padding:8px 20px; display:inline-flex; align-items:center; justify-content:center; border:1px solid var(--border-color); position:relative; z-index:10; min-width:200px;} 
                .vd-avatar{width:65px; height:65px; border-radius:18px; object-fit:cover; border:2px solid var(--bg-surface); box-shadow:0 4px 12px rgba(0,0,0,0.08);} 
                .solid-input-group{display:flex; align-items:stretch; background:var(--bg-body); border:1px solid var(--border-color); border-radius:12px; overflow:hidden; box-shadow:var(--shadow-inner); transition:all 0.3s;} 
                .solid-input-group:focus-within{border-color:var(--primary); box-shadow:0 0 0 4px rgba(37,99,235,0.15);} 
                .solid-input-group input{border:none; outline:none; background:transparent; box-shadow:none; font-weight:700; color:var(--text-dark); padding:10px 12px; width:100%; min-width:0; font-size:14.5px;} 
                .solid-input-group .sig-addon{display:flex; align-items:center; justify-content:center; background:var(--bg-surface); color:var(--text-muted); font-weight:700; padding:0 12px; border-left:1px solid var(--border-color); white-space:nowrap; font-size:14px;} 
                .solid-input-group .sig-prepend{border-left:none; border-right:1px solid var(--border-color);} 
                .solid-input-group.sig-primary{border-color: rgba(59,130,246,0.3);} 
                .solid-input-group.sig-primary:focus-within{border-color:var(--primary);} 
                .solid-input-group.sig-primary .sig-addon{background: rgba(59,130,246,0.1); color:var(--primary); border-color: rgba(59,130,246,0.2);} 
                .solid-input-group.sig-primary input{color:var(--primary);} 
                .min-w-0{min-width:0;} 
                .compact-panel { border-radius: 20px; background: var(--bg-surface); padding: 24px; border: 1px solid var(--border-color); } 
                .section-title-compact { font-size: 16px; font-weight: 800; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; } 
                .upload-dropzone { border: 2px dashed var(--border-color); background: var(--bg-body); border-radius: 16px; padding: 30px 15px; text-align: center; transition: all 0.3s ease; cursor: pointer; position: relative; } 
                .upload-dropzone:hover, .upload-dropzone.dragover { border-color: var(--primary); background: rgba(59,130,246,0.05); } 
                .scan-img-card { position: relative; display: inline-block; width: 100%; height: 100%; } 
                .scan-img-card img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 4px 6px rgba(0,0,0,0.05); } 
                .scan-img-card .delete-btn { position: absolute; top: -10px; right: -10px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; z-index: 20; display:flex; align-items:center; justify-content:center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: 0.2s; } 
                .scan-img-card .delete-btn:hover { background: #dc2626; transform: scale(1.1); } 
                .cursor-pointer { cursor: pointer; } 
                .visually-hidden-input { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0,0,0,0) !important; border: 0 !important; }
                
                .custom-autocomplete-dropdown {
                    position: absolute; z-index: 999999 !important; background-color: var(--bg-surface) !important;
                    border: 1px solid var(--border-color) !important; border-radius: 12px !important;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15) !important; max-height: 250px !important;
                    overflow-y: auto !important; padding: 8px !important;
                    animation: dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform-origin: top center;
                }
                .custom-dropdown-item {
                    padding: 10px 16px !important; font-family: 'Prompt', sans-serif !important; font-size: 14px !important;
                    font-weight: 700 !important; color: var(--text-dark) !important; border-radius: 8px !important;
                    cursor: pointer !important; transition: all 0.15s ease !important; display: flex !important;
                    align-items: center !important; justify-content: space-between !important; margin-bottom: 2px;
                }
                .custom-dropdown-item:last-child { margin-bottom: 0; }
                .custom-dropdown-item:hover { background-color: var(--primary) !important; color: #ffffff !important; }
                .custom-dropdown-item:hover .sub-label { color: rgba(255,255,255,0.8) !important; }
                .custom-dropdown-item .sub-label { font-size: 11px !important; font-weight: 500 !important; color: var(--text-muted); }
                @keyframes dropdownFadeIn { from { opacity: 0; transform: scaleY(0.95); } to { opacity: 1; transform: scaleY(1); } }
            </style>

            <div id="vd-search-screen" style="display: none; max-width: 1000px; margin: 20px auto;">
                <div class="modern-panel d-flex justify-content-between align-items-center flex-wrap gap-4 mb-4 p-4" style="border-top: 5px solid var(--primary); background: var(--bg-surface);">
                    <div class="position-relative z-1">
                        <h2 class="fw-bold text-primary mb-2" style="font-family:'Prompt'; font-weight: 800; font-size: 28px;"><i class="fa-solid fa-file-medical me-2"></i> เลือกคิว Flowsheet</h2>
                        <p class="text-secondary mb-0 fw-bold fs-6">กรุณาเลือกเตียงผู้ป่วยที่ต้องการลงบันทึกข้อมูลการฟอกเลือด</p>
                    </div>
                    <div class="vd-date-picker shadow-sm position-relative overflow-hidden">
                        <input type="date" id="vd-search-date-picker" class="position-absolute" style="opacity: 0; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer; z-index: 10;" onfocus="this.showPicker && this.showPicker()">
                        <i class="fa-solid fa-calendar-day text-primary fa-lg position-relative" style="z-index: 1; pointer-events: none;"></i>
                        <span id="vdSearchDateDisplay" class="fw-bold text-dark ms-2 position-relative" style="font-family:'Prompt'; z-index: 1; pointer-events: none; font-size: 16px;">กำลังโหลด...</span>
                    </div>
                </div>
                <div id="vd-search-loading" class="text-center py-5 text-primary"><i class="fas fa-spinner fa-spin fa-3x drop-shadow"></i></div>
                <div id="vd-active-visits-container" class="row g-4" style="min-height: 200px;"></div>
            </div>

            <div id="vd-main-screen" style="display: none;">
                <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                    <div>
                        <button class="btn btn-light shadow-sm fw-bold rounded-pill text-dark px-4 py-2 border card-hover-float" onclick="window.VisitDetailPage.init(null)"><i class="fa-solid fa-arrow-left me-2 text-primary"></i> เปลี่ยนผู้ป่วย</button>
                        <h3 class="page-title text-primary d-inline-block ms-3 mb-0" style="font-weight: 800; font-size:26px;"><i class="fa-solid fa-file-medical me-2"></i> บันทึกข้อมูลฟอกเลือด <span class="text-muted fw-normal fs-5">(HD Flowsheet)</span></h3>
                    </div>
                    <div><button class="btn btn-premium btn-premium-success px-5 py-2 shadow-sm rounded-pill" style="font-size: 15px;" onclick="window.VisitDetailPage.saveData()"><i class="fa-solid fa-cloud-arrow-up me-2"></i> บันทึกเข้าระบบ EMR</button></div>
                </div>

                <div id="vd-loading" class="text-center py-5 text-primary"><i class="fas fa-spinner fa-spin fa-3x mb-3 drop-shadow"></i><br>กำลังเชื่อมต่อระบบและประวัติคนไข้...</div>

                <div id="vd-content" style="display: none;">
                    
                    <div class="modern-panel mb-4 p-4 position-relative overflow-hidden" style="border-top: 5px solid var(--primary);">
                        <div style="position: absolute; top: -40px; right: -10px; opacity: 0.02; font-size: 200px; pointer-events: none;"><i class="fa-solid fa-hospital-user"></i></div>
                        <div class="row g-3 align-items-center position-relative z-1">
                            <div class="col-12 col-md-8 col-xl-9 d-flex align-items-center gap-4 min-w-0">
                                <div class="badge bg-primary-subtle text-primary border border-primary-subtle shadow-sm rounded-4 d-flex flex-column justify-content-center align-items-center flex-shrink-0" style="width: 75px; height: 75px;">
                                    <span class="fw-bold mb-0" style="opacity:0.8; font-size:13px;">เตียง</span>
                                    <span id="vd-pt-bed-display" style="font-size: 28px; font-weight: 800; line-height:1;"></span>
                                </div>
                                <div class="min-w-0 flex-grow-1">
                                    <h4 class="fw-bold text-dark mb-2 text-truncate" id="vd-pt-name" style="font-family:'Prompt';">ชื่อผู้ป่วย</h4>
                                    
                                    <div class="d-flex flex-wrap gap-2 align-items-center" id="vd-pt-badges">
                                        <span class="badge bg-light text-dark border shadow-sm px-3 py-2" style="font-size:13px;"><i class="fa-solid fa-id-card text-primary me-1"></i> HN: <span id="vd-pt-hn"></span></span>
                                        <span class="badge bg-light text-dark border shadow-sm px-3 py-2" style="font-size:13px;"><i class="fa-regular fa-clock text-warning-dark me-1"></i> รอบ: <span id="vd-pt-time"></span></span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 col-md-4 col-xl-3 text-md-end mt-3 mt-md-0">
                                <div class="d-inline-flex flex-column align-items-start align-items-md-end w-100">
                                    <label class="form-label fw-bold text-secondary small mb-2 px-1">สถานะการฟอกไต:</label>
                                    <select id="vd-status" class="form-select fw-bold input-modern shadow-sm w-100 bg-white" style="color: #1e293b; border-color: #cbd5e1; font-size: 15px; padding: 10px;">
                                        <option value="รอตรวจ">🔵 รอตรวจ</option><option value="กำลังฟอกไต">🟠 กำลังฟอกไต</option><option value="เสร็จสิ้น">🟢 เสร็จสิ้น</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row g-4 pb-5">
                        
                        <div class="col-xl-4 col-lg-6">
                            <div class="compact-panel h-100 position-relative overflow-hidden" style="border-top: 5px solid var(--info);">
                                <div class="section-title-compact text-info">
                                    <span><i class="fa-solid fa-pump-medical me-2"></i> 1. ตั้งค่าเครื่อง & สิทธิ</span>
                                </div>
                                <div class="row g-3">
                                    <div class="col-6"><label class="form-label fw-bold text-secondary small mb-1">Dialyzer</label><input type="text" id="vd-dialyzer" class="form-control input-modern" placeholder="เช่น F60"></div>
                                    <div class="col-6"><div class="d-flex justify-content-between align-items-end mb-1"><label class="form-label fw-bold text-secondary small mb-0">โหมดฟอก</label><button class="btn btn-sm text-primary p-0 fw-bold" onclick="window.VisitDetailPage.manageModalities()"><i class="fa-solid fa-gear"></i></button></div><select id="vd-mode" class="form-select input-modern fw-bold text-dark" onchange="window.VisitDetailPage.onModeChange()"></select></div>
                                    <div class="col-6"><div class="d-flex justify-content-between align-items-end mb-1"><label class="form-label fw-bold text-secondary small mb-0">สิทธิรักษา</label><button class="btn btn-sm text-success p-0 fw-bold" onclick="window.VisitDetailPage.manageRights()"><i class="fa-solid fa-gear"></i></button></div><select id="vd-right" class="form-select input-modern fw-bold text-success" onchange="window.VisitDetailPage.onRightChange()" style="border-color:#86efac; background-color:rgba(16, 185, 129, 0.05);"></select></div>
                                    <div class="col-6"><label class="form-label fw-bold text-success small mb-1">ค่าฟอก (฿)</label><div class="solid-input-group" style="border-color:#86efac;"><input type="number" id="vd-dialysis-fee" placeholder="0" class="text-success fw-bold text-center bg-success-subtle"></div></div>
                                    <div class="col-4 mt-3"><label class="form-label fw-bold text-secondary small mb-1">Qb</label><div class="solid-input-group"><input type="number" id="vd-qb" placeholder="0" class="text-center"><span class="sig-addon px-2">ml</span></div></div>
                                    <div class="col-4 mt-3"><label class="form-label fw-bold text-secondary small mb-1">Qd</label><div class="solid-input-group"><input type="number" id="vd-qd" placeholder="0" class="text-center"><span class="sig-addon px-2">ml</span></div></div>
                                    <div class="col-4 mt-3"><label class="form-label fw-bold text-primary small mb-1">Target UF</label><div class="solid-input-group sig-primary"><input type="number" step="0.1" id="vd-uf" placeholder="0.0" class="text-center"><span class="sig-addon px-2">L</span></div></div>
                                </div>
                                
                                <hr class="my-4" style="border-color: var(--border-color);">
                                
                                <div class="section-title-compact text-danger">
                                    <span><i class="fa-solid fa-heart-pulse me-2"></i> 2. สัญญาณชีพและน้ำหนัก</span>
                                </div>
                                <div class="row g-3">
                                    <div class="col-6"><label class="form-label fw-bold text-secondary small mb-1">Pre-Wt</label><div class="solid-input-group"><input type="number" step="0.1" id="vd-pre-wt" placeholder="0.0"><span class="sig-addon px-2">Kg</span></div></div>
                                    <div class="col-6"><label class="form-label fw-bold text-secondary small mb-1">Post-Wt</label><div class="solid-input-group"><input type="number" step="0.1" id="vd-post-wt" placeholder="0.0"><span class="sig-addon px-2">Kg</span></div></div>
                                    <div class="col-6"><label class="form-label fw-bold text-secondary small mb-1">Pre-BP</label><input type="text" id="vd-pre-bp" class="form-control input-modern text-danger fw-bold text-center" placeholder="120/80"></div>
                                    <div class="col-6"><label class="form-label fw-bold text-secondary small mb-1">Post-BP</label><input type="text" id="vd-post-bp" class="form-control input-modern text-success fw-bold text-center" placeholder="110/70"></div>
                                </div>
                            </div>
                        </div>

                        <div class="col-xl-4 col-lg-6">
                            <div class="compact-panel h-100 position-relative overflow-hidden" style="border-top: 5px solid var(--warning);">
                                <div class="section-title-compact text-warning-dark">
                                    <span><i class="fa-solid fa-vials me-2"></i> 3. ยาฉีดและเวชภัณฑ์</span>
                                    <div class="d-flex gap-2 align-items-center"><div id="vd-deduct-status-badge"></div></div>
                                </div>
                                <div class="row g-3 mb-4">
                                    <div class="col-6 position-relative">
                                        <label class="form-label fw-bold text-secondary small mb-1">น้ำยาไต (Dialysate)</label>
                                        <input type="text" id="vd-dialysate-item" class="form-control input-modern mb-2 fw-bold text-dark shadow-sm" placeholder="คลิก/พิมพ์ชื่อ..." autocomplete="off">
                                        <div class="solid-input-group"><span class="sig-addon sig-prepend px-2">จำนวน</span><input type="number" id="vd-dialysate-qty" class="text-primary text-center" placeholder="แกลลอน" onkeyup="window.VisitDetailPage.calculateAdditionalFees(true)" onchange="window.VisitDetailPage.calculateAdditionalFees(true)"></div>
                                    </div>
                                    
                                    <div class="col-6 position-relative">
                                        <label class="form-label fw-bold text-secondary small mb-1">น้ำเกลือ (NSS)</label>
                                        <input type="text" id="vd-saline-item" class="form-control input-modern mb-2 fw-bold text-dark shadow-sm" placeholder="คลิก/พิมพ์ชื่อ..." autocomplete="off">
                                        <div class="solid-input-group"><span class="sig-addon sig-prepend px-2">จำนวน</span><input type="number" id="vd-saline-qty" class="text-primary text-center" placeholder="ขวด/ถุง" onkeyup="window.VisitDetailPage.calculateAdditionalFees(true)" onchange="window.VisitDetailPage.calculateAdditionalFees(true)"></div>
                                    </div>
                                    
                                    <div class="col-12 position-relative">
                                        <label class="form-label fw-bold text-secondary small mb-1">ยาต้านแข็งตัว (Heparin)</label>
                                        <div class="row g-2">
                                            <div class="col-8"><input type="text" id="vd-heparin-item" class="form-control input-modern fw-bold text-dark shadow-sm" placeholder="คลิก/พิมพ์ชื่อยา..." autocomplete="off"></div>
                                            <div class="col-4"><div class="solid-input-group"><span class="sig-addon sig-prepend px-2">จน.</span><input type="number" id="vd-heparin-qty" class="text-primary text-center" placeholder="Vial" onkeyup="window.VisitDetailPage.calculateAdditionalFees(true)" onchange="window.VisitDetailPage.calculateAdditionalFees(true)"></div></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="p-3 rounded-4 border border-secondary-subtle mb-3 shadow-sm" style="background: var(--bg-body);">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <label class="form-label fw-bold text-dark mb-0"><i class="fa-solid fa-syringe text-danger me-2"></i> ยาฉีดอื่นๆ / เวชภัณฑ์</label>
                                    </div>
                                    <div id="vd-other-meds-container" class="mb-3"></div>
                                    <button class="btn btn-outline-primary fw-bold rounded-pill w-100 shadow-sm py-2 bg-white" id="btn-add-med" onclick="window.VisitDetailPage.addOtherMed()">+ เพิ่มรายการยา / เวชภัณฑ์</button>
                                </div>

                                <div class="p-3 rounded-4 border border-info-subtle mb-4 shadow-sm" style="background: var(--bg-body);">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <label class="form-label fw-bold text-dark mb-0"><i class="fa-solid fa-x-ray text-info me-2"></i> X-Ray</label>
                                    </div>
                                    <div id="vd-xrays-container" class="mb-3"></div>
                                    <button class="btn btn-outline-info fw-bold rounded-pill w-100 shadow-sm py-2 bg-white" onclick="window.VisitDetailPage.addXray()">+ เพิ่มรายการ X-Ray</button>
                                </div>
                                
                                <div class="modern-panel shadow-sm p-3" style="border-radius: 16px; border: 1px solid var(--border-color); background-color: var(--bg-body);">
                                    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                        <h6 class="fw-bold text-success mb-0"><i class="fa-solid fa-file-invoice-dollar me-2"></i> ค่าใช้จ่ายเพิ่ม (ไม่รวมค่าฟอก)</h6>
                                        <button class="btn btn-sm btn-success fw-bold rounded-pill shadow-sm px-3" onclick="window.VisitDetailPage.calculateAdditionalFees()"><i class="fa-solid fa-calculator me-1"></i> คำนวณออโต้</button>
                                    </div>
                                    <div class="row g-2">
                                        <div class="col-4"><label class="fw-bold text-secondary mb-1 small">ค่ายา</label><div class="solid-input-group" style="border-color:#86efac;"><span class="sig-addon bg-success-subtle text-success border-0 px-2">฿</span><input type="number" id="vd-med-fee" class="text-success fw-bold text-center border-0 bg-success-subtle" placeholder="0"></div></div>
                                        <div class="col-4"><label class="fw-bold text-secondary mb-1 small">ค่าแล็บ</label><div class="solid-input-group" style="border-color:#86efac;"><span class="sig-addon bg-success-subtle text-success border-0 px-2">฿</span><input type="number" id="vd-lab-fee" class="text-success fw-bold text-center border-0 bg-success-subtle" placeholder="0"></div></div>
                                        <div class="col-4"><label class="fw-bold text-secondary mb-1 small">ค่า X-Ray</label><div class="solid-input-group" style="border-color:#86efac;"><span class="sig-addon bg-success-subtle text-success border-0 px-2">฿</span><input type="number" id="vd-xray-fee" class="text-success fw-bold text-center border-0 bg-success-subtle" placeholder="0"></div></div>
                                    </div>
                                </div>
                                <div class="text-end mt-3"><button class="btn btn-premium-warning shadow-sm fw-bold px-4 py-3 w-100 rounded-pill fs-6" id="btn-deduct-stock" onclick="window.VisitDetailPage.deductStock()"><i class="fa-solid fa-box-open me-2"></i> ยืนยันตัดเบิกพัสดุ</button></div>
                            </div>
                        </div>

                        <div class="col-xl-4 col-lg-12">
                            <div class="compact-panel h-100 position-relative overflow-hidden d-flex flex-column" style="border-top: 5px solid var(--muted);">
                                <div class="section-title-compact text-secondary mb-4">
                                    <span><i class="fa-solid fa-microscope me-2"></i> 4. แล็บ & บันทึก (Notes)</span>
                                </div>

                                <div class="p-3 border border-danger-subtle rounded-4 mb-4 shadow-sm" style="background: var(--bg-body);">
                                    <div class="d-flex justify-content-between align-items-center mb-3 border-bottom border-danger-subtle pb-3 flex-wrap gap-2">
                                        <label class="form-label fw-bold text-danger mb-0"><i class="fa-solid fa-vial-virus me-2"></i> ดึงชุดผลแล็บ</label>
                                        <div class="d-flex gap-2 position-relative w-auto">
                                            <input type="text" id="vd-lab-set-select" class="form-control form-control-sm shadow-sm fw-bold text-danger input-modern px-3 py-1 w-auto" placeholder="คลิกเพื่อเลือกแพ็กเกจ..." autocomplete="off">
                                            <button class="btn btn-sm btn-danger fw-bold shadow-sm rounded-pill px-3" onclick="window.VisitDetailPage.applyLabSet()">โหลด</button>
                                        </div>
                                    </div>
                                    <div id="vd-labs-container" class="row g-2 mb-3"></div>
                                    <button class="btn btn-outline-danger fw-bold rounded-pill w-100 shadow-sm py-2 bg-white" onclick="window.VisitDetailPage.addLabRow()">+ เพิ่มตัวตรวจ (Manual)</button>
                                </div>

                                <div class="row g-3 mb-4">
                                    <div class="col-12">
                                        <label class="form-label fw-bold text-secondary mb-2">อาการสำคัญ (CC)</label>
                                        <input type="text" id="vd-cc" class="form-control shadow-sm fw-bold text-dark input-modern mb-2" placeholder="มารับการฟอกเลือด...">
                                    </div>
                                    <div class="col-12 position-relative">
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <label class="form-label fw-bold text-secondary mb-0">Progress Note</label>
                                            <input type="text" id="vd-note-template" class="form-control form-control-sm shadow-sm fw-bold text-warning-dark input-modern px-3 py-1 w-auto" style="max-width: 200px; cursor:pointer;" placeholder="คลิกเลือกเทมเพลต..." autocomplete="off">
                                        </div>
                                        <textarea id="vd-note" class="form-control shadow-sm p-3 fw-bold text-dark input-modern" rows="4" placeholder="บันทึกอาการและคำสั่งการรักษา..." style="line-height:1.6; border-radius:16px;"></textarea>
                                    </div>
                                </div>

                                <div class="mt-auto border-top border-secondary pt-4">
                                    <div class="section-title-compact text-primary mb-3">
                                        <span><i class="fa-solid fa-camera me-2"></i> 5. สแกนเอกสารแนบ</span>
                                    </div>
                                    <div class="upload-dropzone" id="doc-dropzone">
                                        <i class="fa-solid fa-cloud-arrow-up fa-2x text-primary mb-3"></i>
                                        <h6 class="fw-bold text-dark mb-3">ลากไฟล์มาวางที่นี่ หรือ เลือกวิธีนำเข้า</h6>
                                        <div class="d-flex justify-content-center gap-2 flex-wrap">
                                            <label class="btn btn-primary fw-bold shadow-sm rounded-pill px-4 m-0 cursor-pointer">
                                                <i class="fa-solid fa-camera me-2"></i> ถ่ายรูป
                                                <input type="file" id="doc-camera-input" accept="image/*" capture="environment" class="visually-hidden-input">
                                            </label>
                                            <label class="btn btn-outline-primary fw-bold shadow-sm rounded-pill px-4 m-0 cursor-pointer bg-white">
                                                <i class="fa-solid fa-folder-open me-2"></i> เลือกไฟล์ / PDF
                                                <input type="file" id="doc-file-input" accept="image/*,application/pdf" multiple class="visually-hidden-input">
                                            </label>
                                        </div>
                                        <p class="text-muted small mt-3 mb-0" style="font-size:12px;">รองรับ JPG, PNG และ PDF</p>
                                    </div>
                                    <div id="doc-preview-area" class="mt-3 row g-2"></div>
                                </div>
                                
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `;
    }

    init(visitId = null) {
        if (typeof db === 'undefined') {
            document.getElementById('vd-search-loading').innerHTML = '<div class="text-danger py-5"><i class="fa-solid fa-triangle-exclamation fa-3x mb-3"></i><br>ไม่พบการเชื่อมต่อฐานข้อมูล</div>';
            return;
        }

        this.state.isFormLoaded = false;
        const today = new Date();
        this.state.selectedDate = this.state.selectedDate || (new Date(Date.now() - (today.getTimezoneOffset() * 60000))).toISOString().split('T')[0];

        window.removeEventListener('click', this.boundGlobalClickAway);
        window.addEventListener('click', this.boundGlobalClickAway);
        window.removeEventListener('scroll', this.boundScrollClose, true);
        window.addEventListener('scroll', this.boundScrollClose, true);

        if (!this.state.hasCleanedUp) this.autoCleanUpOldRecords();

        if (!visitId || typeof visitId !== 'string') { this.showSearchScreen(); } else { this.showMainScreen(visitId); }
    }

    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        
        window.removeEventListener('click', this.boundGlobalClickAway);
        window.removeEventListener('scroll', this.boundScrollClose, true);
        this.closeActiveDropdown();
        
        const dropzone = document.getElementById('doc-dropzone');
        if (dropzone) { dropzone.removeEventListener('dragover', this.boundHandleDragOver); dropzone.removeEventListener('dragleave', this.boundHandleDragLeave); dropzone.removeEventListener('drop', this.boundHandleDrop); }
    }

    autoCleanUpOldRecords() {
        this.state.hasCleanedUp = true;
        const cutoffDate = new Date(); cutoffDate.setFullYear(cutoffDate.getFullYear() - 5);
        const cutoffTime = cutoffDate.getTime();

        if (typeof db === 'undefined') return;
        Promise.all([ db.ref('patients_database_v2/visits').once('value'), db.ref('patients_database_v2/patients').once('value') ]).then(([vSnap, pSnap]) => {
            let visitListVal = vSnap.val();
            if (visitListVal) {
                let visits = Array.isArray(visitListVal) ? visitListVal : Object.keys(visitListVal).map(k => visitListVal[k]);
                let originalVisitsLen = visits.length;
                let validVisits = visits.filter(v => { if (!v || !v.date) return false; return new Date(v.date).getTime() >= cutoffTime; });
                if (originalVisitsLen - validVisits.length > 0) db.ref('patients_database_v2/visits').set(validVisits);
            }

            let patientListVal = pSnap.val();
            if (patientListVal) {
                let patients = Array.isArray(patientListVal) ? patientListVal : Object.keys(patientListVal).map(k => patientListVal[k]);
                let isAnyPatientUpdated = false;
                patients.forEach(p => {
                    if (p && typeof p === 'object') {
                        if (Array.isArray(p.history)) { let oldHistLen = p.history.length; p.history = p.history.filter(h => h && h.date && new Date(h.date).getTime() >= cutoffTime); if (oldHistLen - p.history.length > 0) isAnyPatientUpdated = true; }
                        if (Array.isArray(p.labs)) { let oldLabsLen = p.labs.length; p.labs = p.labs.filter(l => l && l.date && new Date(l.date).getTime() >= cutoffTime); if (p.labs.length < oldLabsLen) isAnyPatientUpdated = true; }
                    }
                });
                if (isAnyPatientUpdated) db.ref('patients_database_v2/patients').set(patients);
            }
        }).catch(err => console.error("Error in autoCleanUpOldRecords:", err));
    }

    showSearchScreen() {
        document.getElementById('vd-search-screen').style.display = 'block'; document.getElementById('vd-main-screen').style.display = 'none'; document.getElementById('vd-search-loading').style.display = 'block'; document.getElementById('vd-active-visits-container').innerHTML = '';
        setTimeout(() => { const dp = document.getElementById('vd-search-date-picker'); if(dp) { dp.value = this.state.selectedDate; this.updateDateDisplay(this.state.selectedDate); dp.onchange = (e) => { this.state.selectedDate = e.target.value; this.updateDateDisplay(this.state.selectedDate); this.init(null); }; } }, 50);

        const execSearchLoad = () => {
            Promise.all([db.ref('patients_database_v2/visits').once('value'), db.ref('patients_database_v2/patients').once('value')]).then(([vSnap, pSnap]) => {
                document.getElementById('vd-search-loading').style.display = 'none';
                let rawVisits = vSnap.val() ? (Array.isArray(vSnap.val()) ? vSnap.val() : Object.keys(vSnap.val()).map(k => vSnap.val()[k])) : [];
                let rawPts = pSnap.val() ? (Array.isArray(pSnap.val()) ? pSnap.val() : Object.keys(pSnap.val()).map(k => pSnap.val()[k])) : [];
                let todayVisits = rawVisits.filter(v => v && v.date === this.state.selectedDate);
                const container = document.getElementById('vd-active-visits-container'); if(!container) return;
                
                if (todayVisits.length === 0) { container.innerHTML = '<div class="col-12 text-center py-5 fade-in-up"><i class="fa-solid fa-bed text-muted fa-4x mb-4" style="opacity: 0.2;"></i><h4 class="text-muted fw-bold">ไม่มีรายชื่อคิวฟอกเลือด</h4><p class="text-muted mb-4">ไม่มีประวัติการจัดคิวในวันที่เลือก</p><button class="btn btn-premium btn-premium-primary px-5 rounded-pill" onclick="window.App.switchPage(\'visits\')"><i class="fa-solid fa-list-check me-2"></i> ไปหน้าจัดการคิว</button></div>'; return; }
                
                todayVisits.sort((a, b) => { if(a.time !== b.time) return (a.time || "").localeCompare(b.time || ""); return (parseInt(a.bed) || 999) - (parseInt(b.bed) || 999); });
                
                let html = '';
                todayVisits.forEach((v, idx) => { 
                    let ptData = rawPts.find(p => String(p.hn) === String(v.hn)) || {};
                    let safeName = this.escapeHTML(v.name);
                    let imgSrc = ptData.photo_base64 && typeof ptData.photo_base64 === 'string' ? (ptData.photo_base64.startsWith('data:image') ? ptData.photo_base64 : 'data:image/jpeg;base64,' + ptData.photo_base64) : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(safeName||'X') + '&background=3b82f6&color=fff&bold=true';
                    let bColor = "var(--primary)"; let badgeClass = "badge-soft-primary"; let opacityClass = "";
                    if(v.status === "กำลังฟอกไต") { bColor = "var(--warning)"; badgeClass = "badge-soft-warning"; }
                    if(v.status === "เสร็จสิ้น") { bColor = "var(--success)"; badgeClass = "badge-soft-success"; opacityClass = "opacity:0.8"; }
                    
                    html += `
                    <div class="col-md-6 col-lg-4 fade-in-up" style="animation-delay: ${idx * 0.05}s">
                        <div class="modern-panel p-4 h-100 d-flex flex-column card-hover-float" style="border-left: 5px solid ${bColor}; border-radius: 20px; cursor: pointer; ${opacityClass}" onclick="window.VisitDetailPage.init('${v.id}')">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill shadow-sm fs-6"><i class="fa-solid fa-bed me-2"></i> เตียง ${this.escapeHTML(v.bed||'-')}</div>
                                <span class="badge ${badgeClass} rounded-pill px-3 py-2 shadow-sm" style="font-size:13px;">${this.escapeHTML(v.status || 'รอตรวจ')}</span>
                            </div>
                            <div class="d-flex align-items-center mb-4">
                                <img src="${imgSrc}" class="vd-avatar me-3">
                                <div class="min-w-0">
                                    <h5 class="fw-bold text-dark mb-1 text-truncate" style="font-family:'Prompt'; font-size:18px;">${safeName}</h5>
                                    <div class="text-muted fw-bold small"><i class="fa-solid fa-id-card text-secondary me-1"></i> HN: ${this.escapeHTML(v.hn)}</div>
                                </div>
                            </div>
                            <div class="mt-auto pt-3 border-top border-light">
                                <div class="fw-bold text-primary" style="font-size:15px;"><i class="fa-regular fa-clock me-2 text-secondary"></i> รอบเวลา: ${this.escapeHTML(v.time||'-')} น.</div>
                            </div>
                        </div>
                    </div>`;
                });
                container.innerHTML = html;
            }).catch(err => { document.getElementById('vd-search-loading').innerHTML = `<div class="text-danger py-5"><i class="fa-solid fa-triangle-exclamation fa-3x mb-3"></i><br>ดึงข้อมูลล้มเหลว: ${err.message}</div>`; });
        };
        if (firebase.auth().currentUser) { execSearchLoad(); } else { const unsub = firebase.auth().onAuthStateChanged((user) => { if (user) { unsub(); execSearchLoad(); } }); }
    }

    updateDateDisplay(dateStr) { const displayEl = document.getElementById('vdSearchDateDisplay'); if (displayEl && dateStr) { const dateObj = new Date(dateStr); displayEl.innerText = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }); } }

    async showMainScreen(visitId) {
        document.getElementById('vd-search-screen').style.display = 'none'; document.getElementById('vd-main-screen').style.display = 'block'; this.state.visitId = visitId; 
        document.getElementById('vd-loading').style.display = 'block'; document.getElementById('vd-content').style.display = 'none';

        try {
            this.setupRealtimeMasterData(); // จะโหลด clinicRights และ modalities เบื้องหลัง

            const visitQuery = await db.ref('patients_database_v2/visits').orderByChild('id').equalTo(this.state.visitId).once('value');
            if (!visitQuery.exists()) throw new Error("ไม่พบข้อมูลคิวการรักษานี้");
            
            visitQuery.forEach(child => { 
                this.state.visitFirebaseKey = child.key; 
                this.state.visitData = child.val(); 
            });

            // 🚨 THE FIX: ดึงประวัติคนไข้มาเชื่อมโยงทันที เพื่อออโต้ซิงค์ (Auto-Pull) สิทธิ / ยาแพ้ / โรคติดเชื้อ
            const pQuery = await db.ref('patients_database_v2/patients').orderByChild('hn').equalTo(this.state.visitData.hn).once('value');
            if(pQuery.exists()) {
                pQuery.forEach(child => {
                    this.state.patientProfile = child.val();
                });
            } else {
                this.state.patientProfile = {};
            }

            this.state.currentMeds = this.parseFBArray(this.state.visitData.other_meds); 
            this.state.currentXrays = this.parseFBArray(this.state.visitData.xray_list); 
            this.state.currentLabs = this.parseFBArray(this.state.visitData.lab_results); 
            this.state.currentAttachments = this.parseFBArray(this.state.visitData.attachments); 
            this.state.isStockDeducted = this.state.visitData.is_stock_deducted || false;
            
            this.state.isFormLoaded = true; 
            
            // วาด UI รอบแรก (อาจจะยังไม่มี Options ใน Dropdown ถ้า Firebase โหลดช้า แต่จะอัปเดตอัตโนมัติทีหลัง)
            this.renderFormUI();
            
            document.getElementById('vd-loading').style.display = 'none'; document.getElementById('vd-content').style.display = 'block';
            setTimeout(() => { this.initScannerEvents(); }, 200);
        } catch (e) { 
            console.error("Load Detail Error:", e); 
            document.getElementById('vd-loading').innerHTML = `<div class="text-danger py-5"><i class="fa-solid fa-triangle-exclamation fa-3x mb-3"></i><br>โหลดข้อมูลไม่สำเร็จ: ${e.message}</div>`; 
        }
    }

    setupRealtimeMasterData() {
        const toArray = (snapVal) => snapVal ? (Array.isArray(snapVal) ? snapVal : Object.keys(snapVal).map(k => snapVal[k])).filter(Boolean) : [];

        const bindData = (path, stateKey, triggerRefresh = true) => {
            const cb = db.ref(path).on('value', snap => {
                this.state[stateKey] = toArray(snap.val());
                // 🚨 THE FIX: เมื่อข้อมูล Master เปลี่ยน ให้ Refresh ทันที
                if (this.state.isFormLoaded && triggerRefresh) this.refreshDropdownsUI();
            });
            this.firebaseListeners.push({ path, callback: cb });
        };

        bindData('clinic_meds_list_v2', 'medsList');
        bindData('clinic_rights_v2', 'clinicRights');
        bindData('clinic_modalities_v2', 'modalities');
        bindData('clinic_lab_sets_v2', 'labSets');
        
        const cbNotes = db.ref('clinic_note_templates_v2').on('value', snap => { 
            let liveNotes = toArray(snap.val()); 
            let uniqueNotes = new Map();
            liveNotes.forEach(n => {
                let id = typeof n === 'object' ? (n.id || n.title || n.name) : n;
                if(id && !uniqueNotes.has(id)) uniqueNotes.set(id, n);
            });
            if (uniqueNotes.size === 0) {
                let defaultNotes = [
                    { id: 'NT_PRE1', category: 'pre', title: 'อาการปกติ (มารับการฟอก)', text: 'ผู้ป่วยรู้สึกตัวดี มารับการฟอกเลือดตามนัด ไม่มีอาการหอบเหนื่อย บวม หรือเจ็บแน่นหน้าอก สัญญาณชีพอยู่ในเกณฑ์ปกติ Vascular access ทำงานได้ดี' },
                    { id: 'NT_PRE2', category: 'pre', title: 'มีอาการน้ำเกิน/หอบเหนื่อย', text: 'ผู้ป่วยมีอาการหอบเหนื่อย นอนราบไม่ได้ ขาบวม 2 ข้าง ฟังปอดพบ crepitation ประเมินมีภาวะน้ำเกิน (Volume Overload)' },
                    { id: 'NT_PRE3', category: 'pre', title: 'มีความดันโลหิตสูง', text: 'ประเมินก่อนฟอกเลือดพบความดันโลหิตสูง (Hypertension) ผู้ป่วยแจ้งว่าทานยาลดความดันมาแล้ว ไม่มีอาการปวดศีรษะหรือตาพร่ามัว' },
                    { id: 'NT_INTRA1', category: 'intra', title: 'ความดันตก (Hypotension)', text: 'ระหว่างฟอกเลือด ผู้ป่วยมีอาการหน้ามืด ใจสั่น เหงื่อแตก วัดความดันโลหิตพบว่าลดลง (Hypotension)\n- ปรับลด UFR\n- ให้ 0.9% NSS 100 ml IV\n- ปรับท่านอนราบยกขาสูง\nหลังให้การพยาบาล ผู้ป่วยอาการดีขึ้น ความดันโลหิตกลับมาอยู่ในเกณฑ์ที่รับได้' }
                ];
                defaultNotes.forEach(dn => uniqueNotes.set(dn.id, dn));
            }
            this.state.noteTemplates = Array.from(uniqueNotes.values());
            if (this.state.isFormLoaded) this.refreshDropdownsUI(); 
        });
        this.firebaseListeners.push({ path: 'clinic_note_templates_v2', callback: cbNotes });

        const xrayPaths = ['clinic_xray_list_v2', 'clinic_xrays_v2', 'clinic_xray_list', 'clinic_xrays', 'xray_list'];
        xrayPaths.forEach(path => {
            const cb = db.ref(path).on('value', snap => {
                this.state[`_${path}`] = toArray(snap.val());
                let combined = [];
                xrayPaths.forEach(p => { if (this.state[`_${p}`]) combined = combined.concat(this.state[`_${p}`]); });
                let unique = new Map();
                combined.forEach(x => {
                    let name = typeof x === 'object' ? (x.name || x.title || x.id) : x;
                    if(name && !unique.has(name)) unique.set(name, x);
                });
                if(unique.size === 0) {
                    unique.set("CXR (Chest X-Ray)", {name: "CXR (Chest X-Ray)"});
                    unique.set("KUB", {name: "KUB"});
                }
                this.state.xraysList = Array.from(unique.values());
                if (this.state.isFormLoaded) this.refreshDropdownsUI();
            });
            this.firebaseListeners.push({ path, callback: cb });
        });

        const invCb = db.ref('inventory_database_v2/items').on('value', snap => {
            this.state.inventoryItems.clear();
            const invData = snap.val();
            if(invData) { Object.keys(invData).forEach(k => { if(invData[k]) this.state.inventoryItems.set(invData[k].id, invData[k]); }); }
            if (this.state.isFormLoaded) this.refreshDropdownsUI();
        });
        this.firebaseListeners.push({ path: 'inventory_database_v2/items', callback: invCb });
        
        db.ref('clinic_settings_v2').once('value').then(snap => { this.state.clinicSettings = snap.val() || {}; });
    }

    renderFormUI() {
        const v = this.state.visitData || {};
        const p = this.state.patientProfile || {};

        document.getElementById('vd-pt-name').innerText = v.name || p.name_th || '-'; 
        document.getElementById('vd-pt-bed-display').innerText = v.bed || '-'; 

        // 🚨 THE FIX: ประดับยศให้คนไข้ (Badges) ดึงจากประวัติเพื่อความปลอดภัยสูงสุด
        let extraBadges = '';
        if (p.infection && p.infection !== 'ไม่มี' && p.infection !== '-' && p.infection !== 'Negative') {
            extraBadges += `<span class="badge bg-danger text-white px-3 py-2 shadow-sm rounded-pill" style="font-size:13px; animation: pulse-live 2s infinite;"><i class="fa-solid fa-virus-covid me-1"></i> ${this.escapeHTML(p.infection)}</span>`;
        }
        if (p.allergy && p.allergy !== 'ไม่มี' && p.allergy !== '-' && p.allergy !== 'ไม่มีประวัติแพ้ยา') {
            extraBadges += `<span class="badge bg-warning text-dark px-3 py-2 shadow-sm rounded-pill border border-warning" style="font-size:13px;"><i class="fa-solid fa-triangle-exclamation me-1"></i> แพ้: ${this.escapeHTML(p.allergy)}</span>`;
        }

        document.getElementById('vd-pt-badges').innerHTML = `
            <span class="badge bg-light text-dark border shadow-sm px-3 py-2 rounded-pill" style="font-size:13px;"><i class="fa-solid fa-id-card text-primary me-1"></i> HN: ${this.escapeHTML(v.hn || '-')}</span>
            <span class="badge bg-light text-dark border shadow-sm px-3 py-2 rounded-pill" style="font-size:13px;"><i class="fa-regular fa-clock text-warning-dark me-1"></i> รอบ: ${this.escapeHTML(v.time || '-')}</span>
            ${extraBadges}
        `;

        document.getElementById('vd-status').value = v.status || 'รอตรวจ'; 
        
        // Auto-Pull ข้อมูลจาก Patient Profile (ถ้าบิลไม่มี ให้ดึงจากประวัติ)
        document.getElementById('vd-dialyzer').value = v.hd_dialyzer || p.hd_dialyzer || '';
        
        this.renderModalityDropdown(); 
        this.renderRightDropdown(); 
        this.refreshDropdownsUI(); 
        this.renderLabs(); 
        this.renderAttachments();
        
        // เซ็ตค่าคงที่ 
        let defMed = this.state.clinicSettings.med_fee_default || ''; let defLab = this.state.clinicSettings.lab_fee_default || ''; let defXray = this.state.clinicSettings.xray_fee_default || '';
        if(document.getElementById('vd-med-fee')) document.getElementById('vd-med-fee').value = (v.med_fee !== undefined && v.med_fee !== "" && Number(v.med_fee) !== 0) ? v.med_fee : defMed;
        if(document.getElementById('vd-lab-fee')) document.getElementById('vd-lab-fee').value = (v.lab_fee !== undefined && v.lab_fee !== "" && Number(v.lab_fee) !== 0) ? v.lab_fee : defLab;
        if(document.getElementById('vd-xray-fee')) document.getElementById('vd-xray-fee').value = (v.xray_fee !== undefined && v.xray_fee !== "" && Number(v.xray_fee) !== 0) ? v.xray_fee : defXray;
        
        // 🚨 THE FIX: Smart Pricing ดึงราคาอัตโนมัติ ถ้าค่าฟอกเป็น 0 หรือว่างเปล่า
        document.getElementById('vd-dialysis-fee').value = (v.dialysis_fee !== undefined && v.dialysis_fee !== null) ? v.dialysis_fee : '';
        if (!document.getElementById('vd-dialysis-fee').value) {
            if (document.getElementById('vd-right').value) this.onRightChange();
            if (document.getElementById('vd-mode').value) this.onModeChange();
        }
        
        document.getElementById('vd-qb').value = v.hd_qb || ''; document.getElementById('vd-qd').value = v.hd_qd || ''; document.getElementById('vd-uf').value = v.hd_uf || '';
        document.getElementById('vd-pre-wt').value = v.pre_wt || ''; document.getElementById('vd-post-wt').value = v.post_wt || ''; document.getElementById('vd-pre-bp').value = v.pre_bp || ''; document.getElementById('vd-post-bp').value = v.post_bp || '';
        document.getElementById('vd-cc').value = v.cc || ''; document.getElementById('vd-note').value = v.note || '';
        
        document.getElementById('vd-dialysate-qty').value = v.hd_dialysate_qty || ''; 
        document.getElementById('vd-saline-qty').value = v.hd_saline_qty || ''; 
        document.getElementById('vd-heparin-qty').value = v.hd_heparin_qty || '';
        
        document.getElementById('vd-dialysate-item').value = v.hd_dialysate_item || '';
        document.getElementById('vd-saline-item').value = v.hd_saline_item || '';
        document.getElementById('vd-heparin-item').value = v.hd_heparin_item || '';

        this.updateDeductStateUI();
        this.setupPremiumAutocomplete(); 
    }

    setupPremiumAutocomplete() {
        this.wireAutocompleteInput(document.getElementById('vd-dialysate-item'), 'meds');
        this.wireAutocompleteInput(document.getElementById('vd-saline-item'), 'meds');
        this.wireAutocompleteInput(document.getElementById('vd-heparin-item'), 'meds');
        this.wireAutocompleteInput(document.getElementById('vd-lab-set-select'), 'labs');
        this.wireAutocompleteInput(document.getElementById('vd-note-template'), 'notes'); 
    }

    wireAutocompleteInput(inputEl, dataType) {
        if (!inputEl) return;
        
        inputEl.removeEventListener('focus', inputEl._boundFocus);
        inputEl.removeEventListener('input', inputEl._boundInput);

        inputEl._boundFocus = (e) => {
            if (this.activeDropdown && this.currentDropdownInput === inputEl) return;
            this.showCustomDropdown(inputEl, dataType, inputEl.value);
        };
        inputEl._boundInput = (e) => this.showCustomDropdown(inputEl, dataType, e.target.value);

        inputEl.addEventListener('focus', inputEl._boundFocus);
        inputEl.addEventListener('input', inputEl._boundInput);
        inputEl.setAttribute('autocomplete', 'off'); 
    }

    showCustomDropdown(inputEl, dataType, filterText) {
        this.closeActiveDropdown();

        let items = [];
        if (dataType === 'meds') {
            this.state.medsList.forEach(m => {
                let name = typeof m === 'object' ? (m.name || m.id) : m;
                if (name) items.push({ name: name, sub: 'ยาและเวชภัณฑ์มาตรฐาน' });
            });
            this.state.inventoryItems.forEach(i => items.push({ name: i.name, sub: `คลังพัสดุ (คงเหลือ: ${(Number(i.qty_sub)||0) + (Number(i.qty_main)||0)})` }));
        } else if (dataType === 'xrays') {
            this.state.xraysList.forEach(x => {
                let name = typeof x === 'object' ? (x.name || x.title || x.id) : x;
                let priceText = x.price ? ` | ฿${x.price}` : '';
                if(name) items.push({ name: name, sub: `รายการส่งตรวจเอ็กซเรย์${priceText}` });
            });
        } else if (dataType === 'labs') {
            this.state.labSets.forEach(s => {
                let name = typeof s === 'object' ? (s.name || s.id) : s;
                if(name) items.push({ name: name, sub: 'แพ็กเกจชุดผลแล็บมาตรฐาน' });
            });
        } else if (dataType === 'notes') {
            const catMap = { 'pre': 'ก่อนฟอก', 'intra': 'แทรกซ้อน', 'post': 'หลังฟอก', 'doctor': 'คำสั่งแพทย์', 'general': 'ทั่วไป' };
            this.state.noteTemplates.forEach(t => {
                let title = t.title || t.name || t.id;
                let cat = catMap[t.category] || t.category || 'ทั่วไป';
                items.push({ name: title, sub: `หมวดหมู่: ${cat}`, rawId: t.id || title });
            });
        }

        let term = filterText.toLowerCase().trim();
        let filtered = term ? items.filter(i => i.name.toLowerCase().includes(term)) : items;

        if (filtered.length === 0) return;

        let dropdown = document.createElement('div');
        dropdown.className = 'custom-autocomplete-dropdown';
        
        let rect = inputEl.getBoundingClientRect();
        dropdown.style.width = rect.width + 'px';
        dropdown.style.left = (rect.left + window.scrollX) + 'px';
        dropdown.style.top = (rect.bottom + window.scrollY + 4) + 'px';

        let html = '';
        filtered.forEach(item => {
            html += `
                <div class="custom-dropdown-item" 
                     data-input-id="${this.escapeHTML(inputEl.id)}" 
                     data-value="${this.escapeHTML(item.name)}" 
                     data-raw-id="${this.escapeHTML(item.rawId || '')}" 
                     onclick="window.VisitDetailPage.selectDropdownItem(this)">
                    <span>${this.escapeHTML(item.name)}</span>
                    <span class="sub-label">${this.escapeHTML(item.sub)}</span>
                </div>
            `;
        });
        dropdown.innerHTML = html;
        document.body.appendChild(dropdown);
        
        dropdown.style.display = 'block'; 
        this.activeDropdown = dropdown;
        this.currentDropdownInput = inputEl;
    }

    selectDropdownItem(element) {
        const inputId = element.getAttribute('data-input-id');
        const value = element.getAttribute('data-value');
        const rawId = element.getAttribute('data-raw-id');
        const inputEl = document.getElementById(inputId);
        
        if (inputEl) {
            if (inputId === 'vd-note-template') {
                this.applyNoteTemplate(rawId || value);
                inputEl.value = ''; 
            } else {
                inputEl.value = value;
                inputEl.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        this.closeActiveDropdown();
    }

    closeActiveDropdown() {
        if (this.activeDropdown) {
            this.activeDropdown.remove();
            this.activeDropdown = null;
            this.currentDropdownInput = null;
        }
    }

    handleGlobalClickAway(e) {
        if (this.activeDropdown && !this.activeDropdown.contains(e.target)) {
            if (e.target !== this.currentDropdownInput) {
                this.closeActiveDropdown();
            }
        }
    }

    calculateAdditionalFees(quiet = false) {
        let totalMedFee = 0; let totalXrayFee = 0;
        
        const getPrice = (idOrName) => { 
            if(!idOrName) return 0; 
            let term = String(idOrName).trim().toLowerCase();
            let m = this.state.medsList.find(x => String(x.id||x).toLowerCase() === term || String(x.name||x).toLowerCase() === term); 
            if(m && m.price) return parseFloat(m.price)||0; 
            let invArr = Array.from(this.state.inventoryItems.values());
            let inv = invArr.find(x => String(x.id).toLowerCase() === term || String(x.name).toLowerCase() === term);
            if(inv && inv.price) return parseFloat(inv.price)||0; 
            return 0; 
        };
        
        let dItem = document.getElementById('vd-dialysate-item'); let dQty = document.getElementById('vd-dialysate-qty');
        let sItem = document.getElementById('vd-saline-item'); let sQty = document.getElementById('vd-saline-qty');
        let hItem = document.getElementById('vd-heparin-item'); let hQty = document.getElementById('vd-heparin-qty');

        if(dItem && dQty) totalMedFee += getPrice(dItem.value) * (parseFloat(dQty.value) || 0);
        if(sItem && sQty) totalMedFee += getPrice(sItem.value) * (parseFloat(sQty.value) || 0);
        if(hItem && hQty) totalMedFee += getPrice(hItem.value) * (parseFloat(hQty.value) || 0);

        this.state.currentMeds.forEach(m => { if((m.id || m.name) && parseFloat(m.qty) > 0) totalMedFee += getPrice(m.id || m.name) * parseFloat(m.qty); });
        this.state.currentXrays.forEach(x => { 
            if((x.id || x.name) && parseFloat(x.qty) > 0) { 
                let term = String(x.id || x.name).trim().toLowerCase();
                let xI = this.state.xraysList.find(i => {
                    let iName = typeof i === 'object' ? (i.name || i.title || i.id) : i;
                    return String(iName).toLowerCase() === term;
                }); 
                if(xI && xI.price) totalXrayFee += parseFloat(xI.price) * parseFloat(x.qty); 
            } 
        });
        
        const medInput = document.getElementById('vd-med-fee'); const xrayInput = document.getElementById('vd-xray-fee');
        if (medInput) medInput.value = totalMedFee || 0;
        if (xrayInput) xrayInput.value = totalXrayFee || 0;

        const labInput = document.getElementById('vd-lab-fee');
        if (labInput && this.state.currentLabs.length === 0) {
            labInput.value = 0;
            this.state.currentLabSetName = '';
        }

        this.onModeChange(); this.onRightChange();
        if(quiet !== true) { Swal.fire({ title: 'คำนวณสำเร็จ', text: 'ระบบรวมยอดให้เรียบร้อยแล้ว', icon: 'success', timer: 1500, showConfirmButton: false }); }
    }

    // 🚨 THE FIX: Refresh Dropdown UI ให้ Update เสมอ
    refreshDropdownsUI() {
        if (!this.state.isFormLoaded) return; 
        this.renderModalityDropdown();
        this.renderRightDropdown();
        this.renderOtherMeds(); 
        this.renderXrays();
    }

    // 🚨 THE FIX: Auto-Pull Mode จากประวัติหลัก
    renderModalityDropdown() { 
        const select = document.getElementById('vd-mode'); if(!select) return; 
        let v = this.state.visitData || {};
        let p = this.state.patientProfile || {};
        let currentVal = select.value || v.hd_mode || p.hd_mode || ''; 
        
        let html = '<option value="">-- เลือกโหมด --</option>'; 
        this.state.modalities.forEach(m => { 
            html += `<option value="${this.escapeHTML(m.name)}" ${m.name === currentVal ? 'selected' : ''}>${this.escapeHTML(m.name)}</option>`; 
        }); 
        select.innerHTML = html; 
        
        if (currentVal && !document.getElementById('vd-dialysis-fee').value) this.onModeChange();
    }
    
    // 🚨 THE FIX: Auto-Pull Right จากประวัติหลัก
    renderRightDropdown() { 
        const select = document.getElementById('vd-right'); if(!select) return; 
        let v = this.state.visitData || {};
        let p = this.state.patientProfile || {};
        let currentVal = select.value || v.right || p.right || ''; 
        
        let html = '<option value="">-- เลือกสิทธิ --</option>'; 
        this.state.clinicRights.forEach(r => { 
            html += `<option value="${this.escapeHTML(r.name)}" ${r.name === currentVal ? 'selected' : ''}>${this.escapeHTML(r.name)}</option>`; 
        }); 
        select.innerHTML = html; 

        // คำนวณราคาอัตโนมัติถ้ายังว่าง
        if (currentVal && !document.getElementById('vd-dialysis-fee').value) this.onRightChange();
    }

    // 🚨 THE FIX: Smart Pricing Engine
    onModeChange() { 
        const modeObj = this.state.modalities.find(m => m.name === document.getElementById('vd-mode').value); 
        if (modeObj && modeObj.price > 0) document.getElementById('vd-dialysis-fee').value = modeObj.price; 
    }
    onRightChange() { 
        const rightObj = this.state.clinicRights.find(r => r.name === document.getElementById('vd-right').value); 
        if (rightObj && rightObj.price !== undefined) document.getElementById('vd-dialysis-fee').value = rightObj.price; 
    }

    renderOtherMeds() {
        let container = document.getElementById('vd-other-meds-container'); if(!container) return;
        if (this.state.currentMeds.length === 0) { container.innerHTML = '<div class="text-muted small text-center mb-1" style="font-size:13px;">ยังไม่มียาฉีดเพิ่มเติม</div>'; return; }
        let html = ''; 
        this.state.currentMeds.forEach((m, idx) => { 
            let dis = this.state.isStockDeducted ? 'disabled' : ''; 
            let uniqueId = `vd-other-med-${idx}`;
            html += `
            <div class="d-flex flex-wrap flex-md-nowrap gap-2 mb-2 align-items-center w-100 position-relative">
                <input type="text" id="${uniqueId}" class="form-control input-modern flex-grow-1 min-w-0 fw-bold text-dark" placeholder="คลิกเลือกยาฉีด/เวชภัณฑ์..." value="${this.escapeHTML(m.id||m.name||'')}" onchange="window.VisitDetailPage.updateMed(${idx}, 'id', this.value)" autocomplete="off" ${dis}>
                <input type="number" class="form-control text-center fw-bold text-primary input-modern flex-shrink-0" style="width: 80px;" placeholder="จำนวน" value="${m.qty||''}" onkeyup="window.VisitDetailPage.updateMed(${idx}, 'qty', this.value)" onchange="window.VisitDetailPage.updateMed(${idx}, 'qty', this.value)" ${dis}>
                <button class="btn btn-light border border-danger-subtle text-danger shadow-sm flex-shrink-0" style="width: 40px; height: 40px; border-radius: 10px; padding:0;" onclick="window.VisitDetailPage.removeMed(${idx})" ${dis}><i class="fa-solid fa-trash"></i></button>
            </div>`; 
        }); 
        container.innerHTML = html;

        this.state.currentMeds.forEach((m, idx) => {
            this.wireAutocompleteInput(document.getElementById(`vd-other-med-${idx}`), 'meds');
        });
    }

    renderXrays() {
        let container = document.getElementById('vd-xrays-container'); if (!container) return;
        if (this.state.currentXrays.length === 0) { container.innerHTML = '<div class="text-muted small text-center mb-1" style="font-size:13px;">ยังไม่มีรายการเอ็กซเรย์</div>'; return; }
        let html = ''; 
        this.state.currentXrays.forEach((x, idx) => { 
            let uniqueId = `vd-xray-item-${idx}`;
            html += `
            <div class="d-flex flex-wrap flex-md-nowrap gap-2 mb-2 align-items-center w-100 position-relative">
                <input type="text" id="${uniqueId}" class="form-control input-modern flex-grow-1 min-w-0 fw-bold text-dark" placeholder="คลิกเลือกรายการ X-Ray..." value="${this.escapeHTML(x.id||x.name||'')}" onchange="window.VisitDetailPage.updateXray(${idx}, 'id', this.value)" autocomplete="off">
                <input type="number" class="form-control text-center fw-bold text-info input-modern flex-shrink-0" style="width: 80px;" placeholder="จำนวน" value="${x.qty||''}" onkeyup="window.VisitDetailPage.updateXray(${idx}, 'qty', this.value)" onchange="window.VisitDetailPage.updateXray(${idx}, 'qty', this.value)">
                <button class="btn btn-light border border-danger-subtle text-danger shadow-sm flex-shrink-0" style="width: 40px; height: 40px; border-radius: 10px; padding:0;" onclick="window.VisitDetailPage.removeXray(${idx})"><i class="fa-solid fa-trash"></i></button>
            </div>`; 
        }); 
        container.innerHTML = html;

        this.state.currentXrays.forEach((x, idx) => {
            this.wireAutocompleteInput(document.getElementById(`vd-xray-item-${idx}`), 'xrays');
        });
    }

    addOtherMed() { if(this.state.isStockDeducted) return; this.state.currentMeds.push({ id: '', qty: '' }); this.renderOtherMeds(); } 
    updateMed(idx, k, v) { this.state.currentMeds[idx][k] = v; this.calculateAdditionalFees(true); } 
    removeMed(idx) { if(this.state.isStockDeducted) return; this.state.currentMeds.splice(idx, 1); this.renderOtherMeds(); this.calculateAdditionalFees(true); }

    addXray() { this.state.currentXrays.push({ id: '', qty: '' }); this.renderXrays(); } 
    updateXray(idx, k, v) { this.state.currentXrays[idx][k] = v; this.calculateAdditionalFees(true); } 
    removeXray(idx) { this.state.currentXrays.splice(idx, 1); this.renderXrays(); this.calculateAdditionalFees(true); }

    applyNoteTemplate(id) { 
        if(!id) return; 
        const t = this.state.noteTemplates.find(x => String(x.id) === String(id) || String(x.title) === String(id)); 
        if(t) { 
            const noteEl = document.getElementById('vd-note'); 
            let textToAppend = (t.text || '').replace(/\\n/g, '\n'); 
            noteEl.value = noteEl.value.trim() ? noteEl.value.trim() + '\n\n' + textToAppend : textToAppend; 
        } 
    }

    applyLabSet() {
        const setName = document.getElementById('vd-lab-set-select').value.trim(); 
        if(!setName) return; 
        const setObj = this.state.labSets.find(s => String(s.name) === String(setName) || String(s.id) === String(setName)); 
        
        if(setObj) {
            if (setObj.price) document.getElementById('vd-lab-fee').value = (Number(document.getElementById('vd-lab-fee').value)||0) + Number(setObj.price);
            this.state.currentLabSetName = setObj.name; 
            setObj.items.forEach(i => { 
                if(!this.state.currentLabs.some(l => l.name === i)) {
                    this.state.currentLabs.push({ name: i, value: '' }); 
                }
            });
        } else {
            if(!this.state.currentLabs.some(l => l.name === setName)) {
                this.state.currentLabs.push({ name: setName, value: '' });
            }
        }
        
        this.renderLabs(); 
        document.getElementById('vd-lab-set-select').value = '';
    }

    renderLabs() {
        const container = document.getElementById('vd-labs-container'); if(this.state.currentLabs.length === 0) { container.innerHTML = '<div class="col-12 text-muted small text-center py-3" style="font-size:13px;">ยังไม่ได้ดึงชุดทดสอบทางห้องปฏิบัติการ</div>'; return; }
        let html = ''; this.state.currentLabs.forEach((lab, idx) => { html += `<div class="col-6"><div class="d-flex shadow-sm bg-white" style="border-radius: 8px; border: 1px solid #fecaca; overflow: hidden;"><div class="bg-danger-subtle text-danger fw-bold px-2 d-flex align-items-center justify-content-center flex-shrink-0" style="width: 45%; font-size:12px; border-right: 1px solid #fecaca; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${this.escapeHTML(lab.name)}">${this.escapeHTML(lab.name)}</div><input type="text" class="form-control border-0 text-dark fw-bold px-2 text-center bg-transparent min-w-0" style="box-shadow:none; outline:none; font-size:13px;" value="${this.escapeHTML(lab.value||'')}" onchange="window.VisitDetailPage.updateLab(${idx}, this.value)" placeholder="-"><button class="btn btn-light text-danger border-0 px-2 rounded-0 flex-shrink-0" style="background:transparent; border-left: 1px solid #fecaca !important; width: 30px; padding:0;" onclick="window.VisitDetailPage.removeLab(${idx})"><i class="fa-solid fa-times"></i></button></div></div>`; }); container.innerHTML = html;
    }
    addLabRow() { Swal.fire({ title: 'ระบุชื่อตัวแปรที่ตรวจแล็บ', input: 'text', inputPlaceholder: 'เช่น HbA1c', showCancelButton: true, confirmButtonText: 'เพิ่ม' }).then(r => { if(r.isConfirmed && r.value.trim()) { this.state.currentLabs.push({ name: r.value.trim(), value: '' }); this.renderLabs(); } }); }
    updateLab(idx, val) { this.state.currentLabs[idx].value = val; } 
    removeLab(idx) { this.state.currentLabs.splice(idx, 1); this.renderLabs(); }

    updateDeductStateUI() {
        const btn = document.getElementById('btn-deduct-stock'); const badge = document.getElementById('vd-deduct-status-badge'); const addMedBtn = document.getElementById('btn-add-med');
        if(this.state.isStockDeducted) {
            btn.innerHTML = '<i class="fa-solid fa-rotate-left me-2"></i> ยกเลิก/คืนคลัง'; btn.className = 'btn btn-outline-danger shadow-sm fw-bold px-4 py-2 bg-white w-100 fs-6 rounded-pill';
            badge.innerHTML = '<span class="badge bg-success-subtle text-success-emphasis border border-success-subtle px-3 py-1 fs-6 shadow-sm rounded-pill"><i class="fa-solid fa-check-circle me-1"></i> ตัดสต๊อกแล้ว</span>';
            addMedBtn.style.display = 'none'; ['vd-dialysate-item', 'vd-dialysate-qty', 'vd-saline-item', 'vd-saline-qty', 'vd-heparin-item', 'vd-heparin-qty'].forEach(id => { let el = document.getElementById(id); if(el) el.disabled = true; });
        } else {
            btn.innerHTML = '<i class="fa-solid fa-box-open me-2"></i> ยืนยันตัดเบิกพัสดุ'; btn.className = 'btn btn-premium btn-premium-warning shadow-sm fw-bold px-4 py-2 w-100 fs-6 rounded-pill';
            badge.innerHTML = '<span class="badge bg-light text-muted border px-3 py-1 shadow-sm rounded-pill"><i class="fa-solid fa-hourglass-half me-1"></i> รอยืนยัน</span>';
            addMedBtn.style.display = 'block'; ['vd-dialysate-item', 'vd-dialysate-qty', 'vd-saline-item', 'vd-saline-qty', 'vd-heparin-item', 'vd-heparin-qty'].forEach(id => { let el = document.getElementById(id); if(el) el.disabled = false; });
        }
    }

    async saveData(quietMode = false) {
        if (!this.state.visitId || !this.state.visitData) return;

        if(!quietMode) Swal.fire({ title: 'กำลังบันทึก (Syncing EMR)...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), customClass: { popup: 'premium-alert' } });

        let cleanMeds = this.parseFBArray(this.state.currentMeds).filter(m => m && (m.id || m.name) && String(m.id||m.name).trim() !== "");
        let cleanXrays = this.parseFBArray(this.state.currentXrays).filter(x => x && (x.id || x.name) && String(x.id||x.name).trim() !== "");

        let currentMedsClone = JSON.parse(JSON.stringify(cleanMeds));
        let currentXraysClone = JSON.parse(JSON.stringify(cleanXrays));
        let currentLabsClone = this.state.currentLabs ? JSON.parse(JSON.stringify(this.state.currentLabs)) : null;
        let currentAttachmentsClone = this.state.currentAttachments ? JSON.parse(JSON.stringify(this.state.currentAttachments)) : null;

        const visitUpdates = {
            status: document.getElementById('vd-status').value, 
            hd_dialyzer: document.getElementById('vd-dialyzer').value.trim() || null, 
            hd_mode: document.getElementById('vd-mode').value || null, 
            right: document.getElementById('vd-right').value || null, 
            dialysis_fee: Number(document.getElementById('vd-dialysis-fee').value) || 0, 
            med_fee: Number(document.getElementById('vd-med-fee').value) || 0, 
            lab_fee: Number(document.getElementById('vd-lab-fee').value) || 0, 
            xray_fee: Number(document.getElementById('vd-xray-fee').value) || 0,
            hd_qb: document.getElementById('vd-qb').value.trim() || null, 
            hd_qd: document.getElementById('vd-qd').value.trim() || null, 
            hd_uf: document.getElementById('vd-uf').value.trim() || null, 
            pre_wt: document.getElementById('vd-pre-wt').value.trim() || null, 
            post_wt: document.getElementById('vd-post-wt').value.trim() || null, 
            pre_bp: document.getElementById('vd-pre-bp').value.trim() || null, 
            post_bp: document.getElementById('vd-post-bp').value.trim() || null, 
            cc: document.getElementById('vd-cc').value.trim() || null, 
            note: document.getElementById('vd-note').value.trim() || null, 
            hd_dialysate_item: document.getElementById('vd-dialysate-item').value || null, 
            hd_dialysate_qty: document.getElementById('vd-dialysate-qty').value || null, 
            hd_saline_item: document.getElementById('vd-saline-item').value || null, 
            hd_saline_qty: document.getElementById('vd-saline-qty').value || null, 
            hd_heparin_item: document.getElementById('vd-heparin-item').value || null, 
            hd_heparin_qty: document.getElementById('vd-heparin-qty').value || null, 
            other_meds: (currentMedsClone.length > 0) ? currentMedsClone : null, 
            xray_list: (currentXraysClone.length > 0) ? currentXraysClone : null, 
            lab_results: (currentLabsClone && currentLabsClone.length > 0) ? currentLabsClone : null, 
            attachments: (currentAttachmentsClone && currentAttachmentsClone.length > 0) ? currentAttachmentsClone : null, 
            is_stock_deducted: this.state.isStockDeducted || false, 
            last_updated: new Date().toISOString(), 
            updated_by: window.App.currentUser ? window.App.currentUser.name : 'ผู้ทำรายการ'
        };

        try {
            const getMedName = (idOrName) => {
                if(!idOrName) return '';
                let term = String(idOrName).trim().toLowerCase();
                let m = this.state.medsList.find(x => String(x.id||x).toLowerCase() === term || String(x.name||x).toLowerCase() === term); 
                if(m && m.name) return String(m.name).trim(); 
                let invArr = Array.from(this.state.inventoryItems.values());
                let inv = invArr.find(x => String(x.id).toLowerCase() === term || String(x.name).toLowerCase() === term);
                if(inv && inv.name) return String(inv.name).trim(); 
                return String(idOrName).trim(); 
            };

            let oldFlowsheetMeds = [];
            let oldV = this.state.visitData || {};
            if (oldV.hd_dialysate_item) oldFlowsheetMeds.push(getMedName(oldV.hd_dialysate_item));
            if (oldV.hd_saline_item) oldFlowsheetMeds.push(getMedName(oldV.hd_saline_item));
            if (oldV.hd_heparin_item) oldFlowsheetMeds.push(getMedName(oldV.hd_heparin_item));
            let oldOtherMeds = this.parseFBArray(oldV.other_meds);
            oldOtherMeds.forEach(m => { if (m && (m.id || m.name)) oldFlowsheetMeds.push(getMedName(m.id || m.name)); });

            let newFlowsheetMeds = [];
            if (visitUpdates.hd_dialysate_item) newFlowsheetMeds.push({ name: getMedName(visitUpdates.hd_dialysate_item), dosage: visitUpdates.hd_dialysate_qty || '1' });
            if (visitUpdates.hd_saline_item) newFlowsheetMeds.push({ name: getMedName(visitUpdates.hd_saline_item), dosage: visitUpdates.hd_saline_qty || '1' });
            if (visitUpdates.hd_heparin_item) newFlowsheetMeds.push({ name: getMedName(visitUpdates.hd_heparin_item), dosage: visitUpdates.hd_heparin_qty || '1' });
            if (currentMedsClone && currentMedsClone.length > 0) {
                currentMedsClone.forEach(m => { if (m && (m.id || m.name) && m.qty) newFlowsheetMeds.push({ name: getMedName(m.id || m.name), dosage: m.qty }); });
            }

            if (this.state.visitFirebaseKey) {
                await db.ref(`patients_database_v2/visits/${this.state.visitFirebaseKey}`).update(visitUpdates);
                if (currentMedsClone.length === 0) await db.ref(`patients_database_v2/visits/${this.state.visitFirebaseKey}/other_meds`).remove();
                if (currentXraysClone.length === 0) await db.ref(`patients_database_v2/visits/${this.state.visitFirebaseKey}/xray_list`).remove();
                if (currentLabsClone === null || currentLabsClone.length === 0) await db.ref(`patients_database_v2/visits/${this.state.visitFirebaseKey}/lab_results`).remove();
            } else {
                const vQuery = await db.ref('patients_database_v2/visits').orderByChild('id').equalTo(this.state.visitId).once('value');
                if (vQuery.exists()) {
                    let keyToUpdate = Object.keys(vQuery.val())[0];
                    await db.ref(`patients_database_v2/visits/${keyToUpdate}`).update(visitUpdates);
                    if (currentMedsClone.length === 0) await db.ref(`patients_database_v2/visits/${keyToUpdate}/other_meds`).remove();
                    if (currentXraysClone.length === 0) await db.ref(`patients_database_v2/visits/${keyToUpdate}/xray_list`).remove();
                    if (currentLabsClone === null || currentLabsClone.length === 0) await db.ref(`patients_database_v2/visits/${keyToUpdate}/lab_results`).remove();
                }
            }

            // 🚨 THE FIX: นำประวัติกลับไปซิงค์รวมที่ Patient Profile ด้วย
            const pQuery = await db.ref('patients_database_v2/patients').orderByChild('hn').equalTo(this.state.visitData.hn).once('value');
            if (pQuery.exists()) {
                let ptUpdates = {};
                const processPtPromises = [];
                
                pQuery.forEach(child => {
                    let pt = child.val();
                    let ptKey = child.key;

                    pt.right = visitUpdates.right; 
                    if (!pt.history) pt.history = []; 
                    if (!pt.labs) pt.labs = []; 
                    
                    let emrHistoryEntry = { 
                        id: this.state.visitId, 
                        date: this.state.visitData.date, 
                        bp: visitUpdates.post_bp || visitUpdates.pre_bp || '-', 
                        weight: visitUpdates.post_wt || visitUpdates.pre_wt || '-', 
                        cc: visitUpdates.cc || '-', 
                        note: visitUpdates.note || '-', 
                        doctor: visitUpdates.updated_by 
                    };
                    let hIndex = pt.history.findIndex(h => String(h.id) === String(this.state.visitId)); 
                    if (hIndex !== -1) pt.history[hIndex] = emrHistoryEntry; 
                    else pt.history.push(emrHistoryEntry);

                    if (Array.isArray(visitUpdates.lab_results) && visitUpdates.lab_results.length > 0) {
                        let labObj = { id: 'LAB_' + this.state.visitId, date: this.state.visitData.date }; 
                        visitUpdates.lab_results.forEach(l => { 
                            let k = (l.name || "").toLowerCase(); 
                            let val = l.value !== undefined ? l.value : ''; 
                            if(k.includes('bun')) labObj.bun = val; 
                            else if(k.includes('cr')||k==='creatinine') labObj.cr = val; 
                            else if(k.includes('k')||k.includes('potassium')) labObj.k = val; 
                            else if(k.includes('ca')||k.includes('calcium')) labObj.ca = val; 
                            else if(k.includes('p')||k.includes('phos')) labObj.p = val; 
                            else if(k.includes('hct')||k.includes('hgb')||k.includes('ht')) labObj.hct = val; 
                        });
                        labObj.set_name = this.state.currentLabSetName || 'ดึงจาก Flowsheet';
                        let labIdx = pt.labs.findIndex(l => String(l.id) === String(labObj.id));
                        if (labIdx !== -1) { pt.labs[labIdx] = { ...pt.labs[labIdx], ...labObj }; } else { pt.labs.push(labObj); }
                    } else {
                        let labIdx = pt.labs.findIndex(l => String(l.id) === String('LAB_' + this.state.visitId));
                        if (labIdx !== -1) pt.labs.splice(labIdx, 1);
                    }

                    let emrMeds = this.parseFBArray(pt.medications).filter(m => m && (m.name || m.id));

                    oldFlowsheetMeds.forEach(oldVal => {
                        if (!oldVal) return;
                        let isStillInNew = newFlowsheetMeds.some(newM => {
                            let matchName = newM.name && String(newM.name).toLowerCase() === String(oldVal).toLowerCase();
                            return matchName;
                        });
                        if (!isStillInNew) {
                            emrMeds = emrMeds.filter(em => {
                                if (!em) return false;
                                let emName = String(em.name || '').toLowerCase();
                                let targetVal = String(oldVal).toLowerCase();
                                if (emName === targetVal) return false;
                                return true; 
                            });
                        }
                    });

                    newFlowsheetMeds.forEach(fm => {
                        if (!fm.name) return;
                        let targetName = String(fm.name).toLowerCase();
                        let idx = emrMeds.findIndex(em => String(em.name || '').toLowerCase() === targetName);
                        if (idx !== -1) {
                            emrMeds[idx].dosage = fm.dosage; 
                            emrMeds[idx].name = fm.name; 
                        } else {
                            emrMeds.push({ name: fm.name, dosage: fm.dosage }); 
                        }
                    });

                    ptUpdates[`${ptKey}/right`] = pt.right || null;
                    
                    processPtPromises.push(db.ref(`patients_database_v2/patients/${ptKey}/history`).set((pt.history && pt.history.length > 0) ? pt.history : null));
                    processPtPromises.push(db.ref(`patients_database_v2/patients/${ptKey}/labs`).set((pt.labs && pt.labs.length > 0) ? pt.labs : null));
                    processPtPromises.push(db.ref(`patients_database_v2/patients/${ptKey}/medications`).set((emrMeds && emrMeds.length > 0) ? emrMeds : null));
                });
                
                await db.ref('patients_database_v2/patients').update(ptUpdates);
                await Promise.all(processPtPromises); 
            }
            
            this.state.visitData = JSON.parse(JSON.stringify({ ...this.state.visitData, ...visitUpdates, other_meds: currentMedsClone, xray_list: currentXraysClone }));
            this.state.currentMeds = currentMedsClone;
            this.state.currentXrays = currentXraysClone;

            if(!quietMode) Swal.fire({ title: 'บันทึกสำเร็จ!', text: 'ซิงค์ข้อมูลเข้าแฟ้ม EMR เรียบร้อย', icon: 'success', timer: 1500, showConfirmButton: false, customClass: { popup: 'premium-alert' } }).then(() => window.App.switchPage('visits')); 

        } catch(e) {
            console.error(e);
            Swal.fire('ข้อผิดพลาดในการบันทึก', e.message, 'error');
        }
    }

    async deductStock() {
        if(this.state.isStockDeducted) {
            Swal.fire({ title: 'คืนของกลับเข้าคลัง?', text: 'ยกเลิกการเบิกพัสดุรอบนี้ใช่หรือไม่?', icon: 'warning', showCancelButton: true, confirmButtonText: 'ยืนยัน', confirmButtonColor: '#ef4444' }).then(async res => {
                if(res.isConfirmed) {
                    Swal.fire({title:'กำลังคืนของ...', didOpen:()=>Swal.showLoading()});
                    
                    try {
                        let logsToPush = []; let timestamp = new Date().toISOString();
                        let stockUpdates = {}; 
                        
                        const restorePromises = (this.state.visitData.deducted_log || []).map(async (req) => {
                            const itemQuery = await db.ref('inventory_database_v2/items').orderByChild('id').equalTo(req.id).once('value');
                            if(itemQuery.exists()) {
                                itemQuery.forEach(child => {
                                    let currentQty = Number(child.val().qty_sub) || 0;
                                    stockUpdates[`inventory_database_v2/items/${child.key}/qty_sub`] = currentQty + req.qty;
                                    logsToPush.push({ timestamp, mode: 'in_sub_restore', itemId: req.id, itemName: child.val().name, qty: req.qty, user: window.App.currentUser?window.App.currentUser.name:'Admin', note: 'ยกเลิกเบิก HN: ' + this.state.visitData.hn });
                                });
                            }
                        });

                        await Promise.all(restorePromises);
                        if(Object.keys(stockUpdates).length > 0) {
                            await db.ref().update(stockUpdates);
                            for(let log of logsToPush) { await db.ref('inventory_database_v2/transactions').push(log); }
                        }

                        this.state.isStockDeducted = false; 
                        this.state.visitData.deducted_log = null; 
                        this.updateDeductStateUI(); 
                        this.saveData(true); 
                        Swal.fire('สำเร็จ', 'ระบบดึงของคืนคลังเรียบร้อยแล้ว', 'success');
                    } catch(e) { Swal.fire('Error', e.message, 'error'); }
                }
            }); return;
        }

        let itemsToDeduct = [];
        let validationError = null;

        const addIfValid = (id, qtyStr) => { 
            if (!id || String(id).trim() === '') return;
            
            let q = parseFloat(qtyStr); 
            if(isNaN(q) || q <= 0) { 
                validationError = `กรุณาระบุ "จำนวน" ของ ${id} ให้ถูกต้อง (ต้องมากกว่า 0)`;
                return;
            } 
            
            let n = 'Unknown'; 
            let term = String(id).trim().toLowerCase();
            
            let invArr = Array.from(this.state.inventoryItems.values());
            let invByName = invArr.find(x => String(x.name).toLowerCase() === term);
            
            if(invByName) {
                id = invByName.id; 
                n = invByName.name;
            } else {
                let inv = this.state.inventoryItems.get(String(id)); 
                if(inv) n = inv.name; 
                else { 
                    let m = this.state.medsList.find(i=>String(i.id||i).toLowerCase()===term || String(i.name||i).toLowerCase()===term); 
                    if(m) n = m.name||m; else n = id;
                } 
            }
            itemsToDeduct.push({id, qty: q, name: n}); 
        };

        addIfValid(document.getElementById('vd-dialysate-item').value, document.getElementById('vd-dialysate-qty').value);
        addIfValid(document.getElementById('vd-saline-item').value, document.getElementById('vd-saline-qty').value);
        addIfValid(document.getElementById('vd-heparin-item').value, document.getElementById('vd-heparin-qty').value);
        this.state.currentMeds.forEach(m => addIfValid(m.id || m.name, m.qty));

        if (validationError) {
            Swal.fire('ข้อมูลไม่ครบถ้วน', validationError, 'warning');
            return;
        }

        if(itemsToDeduct.length === 0) { 
            Swal.fire({ 
                title: 'ไม่มีรายการเบิกพัสดุ', 
                text: 'ไม่มีการระบุยาหรือเวชภัณฑ์ ต้องการบันทึกสถานะว่า "ไม่มีการเบิกพัสดุ" ใช่หรือไม่?', 
                icon: 'question', 
                showCancelButton: true, 
                confirmButtonText: 'ยืนยันอิสระ (ข้ามการเบิก)', 
                confirmButtonColor: '#10b981',
                cancelButtonText: 'ยกเลิก'
            }).then(async res => {
                if(res.isConfirmed) {
                    this.state.isStockDeducted = true; 
                    this.state.visitData.deducted_log = []; 
                    this.updateDeductStateUI(); 
                    this.saveData(true); 
                    Swal.fire('บันทึกสำเร็จ', 'อัปเดตสถานะโดยไม่มีการตัดสต๊อก', 'success');
                }
            });
            return; 
        }

        let summaryHtml = itemsToDeduct.map(i => `<li>${this.escapeHTML(i.name)} => เบิก <b>${i.qty}</b></li>`).join('');

        Swal.fire({ title: 'ยืนยันการตัดเบิกสต๊อก?', html: `<ul class="text-start text-primary mb-3" style="font-family:'Prompt';">${summaryHtml}</ul>`, icon: 'question', showCancelButton: true, confirmButtonText: 'ยืนยัน', confirmButtonColor: '#10b981' }).then(async res => {
            if(res.isConfirmed) {
                Swal.fire({title:'กำลังประมวลผล (Atomic)...', didOpen:()=>Swal.showLoading()});
                
                try {
                    let logs = []; let timestamp = new Date().toISOString(); let user = window.App.currentUser ? window.App.currentUser.name : 'Unknown';
                    let stockUpdates = {};

                    const deductPromises = itemsToDeduct.map(async (req) => {
                        const itemQuery = await db.ref('inventory_database_v2/items').orderByChild('id').equalTo(req.id).once('value');
                        if(itemQuery.exists()) {
                            itemQuery.forEach(child => {
                                let currentQty = Number(child.val().qty_sub) || 0;
                                stockUpdates[`inventory_database_v2/items/${child.key}/qty_sub`] = currentQty - req.qty;
                                stockUpdates[`inventory_database_v2/items/${child.key}/last_update`] = timestamp;
                                logs.push({ timestamp, mode: 'out_sub', itemId: req.id, itemName: req.name, qty: req.qty, user, note: 'ตัดเบิก Flowsheet HN: ' + this.state.visitData.hn });
                            });
                        }
                    });

                    await Promise.all(deductPromises);
                    if(Object.keys(stockUpdates).length > 0) {
                        await db.ref().update(stockUpdates);
                        for(let log of logs) { await db.ref('inventory_database_v2/transactions').push(log); }
                    }

                    this.state.isStockDeducted = true; 
                    this.state.visitData.deducted_log = itemsToDeduct; 
                    this.updateDeductStateUI(); 
                    this.saveData(true); 
                    Swal.fire('ตัดเบิกสำเร็จ', 'ระบบหักสต๊อกแบบเจาะจงเรียบร้อยแล้ว', 'success');

                } catch(e) { Swal.fire('Error', e.message, 'error'); }
            }
        });
    }

    manageModalities() {
        let html = '<div class="list-group mb-3 text-start shadow-sm" style="border-radius:12px; overflow:hidden;">';
        this.state.modalities.forEach((m) => {
            html += `
            <div class="list-group-item d-flex justify-content-between align-items-center p-3 bg-white">
                <div>
                    <div class="fw-bold text-dark" style="font-size:15px;">${this.escapeHTML(m.name)}</div>
                    <div class="text-info fw-bold small"><i class="fa-solid fa-tag me-1"></i> ค่าบริการ: ฿${Number(m.price || 0).toLocaleString()} / รอบ</div>
                </div>
                <div>
                    <button class="btn btn-sm btn-light border border-warning-subtle text-warning-dark shadow-sm me-1" style="border-radius:8px;" onclick="Swal.close(); setTimeout(()=>window.VisitDetailPage.editModality('${m.id}'), 300)"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-light border border-danger-subtle text-danger shadow-sm" style="border-radius:8px;" onclick="Swal.close(); setTimeout(()=>window.VisitDetailPage.deleteModality('${m.id}'), 300)"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
        });
        html += '</div>';
        
        Swal.fire({
            title: '<h4 class="fw-bold text-info mb-0"><i class="fa-solid fa-pump-medical me-2"></i> ตั้งค่าราคาโหมดการฟอก</h4>',
            html: html,
            showCancelButton: true, cancelButtonText: 'ปิดหน้าต่าง',
            showConfirmButton: true, confirmButtonText: '<i class="fa-solid fa-plus me-1"></i> เพิ่มโหมดใหม่', confirmButtonColor: '#0ea5e9', width: 600
        }).then((res) => { if(res.isConfirmed) { setTimeout(() => this.editModality(null), 300); } });
    }

    editModality(id) {
        let m = id ? this.state.modalities.find(x => x.id === id) : { name: '', price: 1500 };
        Swal.fire({
            title: `<h5 class="fw-bold text-info mb-0"><i class="fa-solid ${id?'fa-pen':'fa-plus'} me-2"></i>${id ? 'แก้ไขโหมด' : 'เพิ่มโหมดใหม่'}</h5>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Prompt';">
                    <label class="form-label fw-bold small text-secondary">ชื่อโหมด (Modality Name)</label>
                    <input type="text" id="swal-mod-name" class="form-control input-modern mb-3 fw-bold text-dark" value="${this.escapeHTML(m.name)}" placeholder="เช่น HD ปกติ, HDF">
                    <label class="form-label fw-bold small text-secondary">ราคา / ค่าบริการ (บาท)</label>
                    <input type="number" id="swal-mod-price" class="form-control input-modern text-info fw-bold text-center" value="${m.price || 0}" style="font-size: 18px;" min="0">
                </div>
            `,
            showCancelButton: true, cancelButtonText: 'ยกเลิก', confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึก', confirmButtonColor: '#0ea5e9',
            preConfirm: () => {
                let name = document.getElementById('swal-mod-name').value.trim();
                let price = document.getElementById('swal-mod-price').value;
                if(!name) { Swal.showValidationMessage('กรุณากรอกชื่อโหมด'); return false; }
                return { id: id || 'MOD'+Date.now(), name, price: Number(price) };
            }
        }).then(res => {
            if(res.isConfirmed) {
                let updated = [...this.state.modalities];
                if(id) updated[updated.findIndex(x=>x.id===id)] = res.value; else updated.push(res.value);
                db.ref('clinic_modalities_v2').set(updated).then(() => {
                    Swal.fire({title:'บันทึกสำเร็จ', icon:'success', timer:1000, showConfirmButton:false}).then(()=> this.manageModalities());
                });
            } else if (res.isDismissed) { this.manageModalities(); }
        });
    }

    deleteModality(id) {
        Swal.fire({
            title: 'ยืนยันการลบ?', text: 'ต้องการลบโหมดการฟอกนี้ออกจากระบบใช่หรือไม่?', icon: 'warning', 
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-trash me-1"></i> ลบ', confirmButtonColor: '#ef4444', cancelButtonText: 'ยกเลิก'
        }).then(res => {
            if(res.isConfirmed) {
                let updated = this.state.modalities.filter(x=>x.id !== id);
                db.ref('clinic_modalities_v2').set(updated).then(() => {
                    Swal.fire({title:'ลบสำเร็จ', icon:'success', timer:1000, showConfirmButton:false}).then(()=> this.manageModalities());
                });
            } else { this.manageModalities(); }
        });
    }

    manageRights() {
        let html = '<div class="list-group mb-3 text-start shadow-sm" style="border-radius:12px; overflow:hidden;">';
        this.state.clinicRights.forEach((r) => {
            html += `
            <div class="list-group-item d-flex justify-content-between align-items-center p-3 bg-white">
                <div>
                    <div class="fw-bold text-dark" style="font-size:15px;">${this.escapeHTML(r.name)}</div>
                    <div class="text-success fw-bold small"><i class="fa-solid fa-hand-holding-dollar me-1"></i> เบิกจ่าย: ฿${Number(r.price).toLocaleString()} / รอบ</div>
                </div>
                <div>
                    <button class="btn btn-sm btn-light border border-warning-subtle text-warning-dark shadow-sm me-1" style="border-radius:8px;" onclick="Swal.close(); setTimeout(()=>window.VisitDetailPage.editRight('${r.id}'), 300)"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-light border border-danger-subtle text-danger shadow-sm" style="border-radius:8px;" onclick="Swal.close(); setTimeout(()=>window.VisitDetailPage.deleteRight('${r.id}'), 300)"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`;
        });
        html += '</div>';
        
        Swal.fire({
            title: '<h4 class="fw-bold text-success mb-0"><i class="fa-solid fa-shield-heart me-2"></i> จัดการสิทธิการรักษา</h4>',
            html: html,
            showCancelButton: true, cancelButtonText: 'ปิดหน้าต่าง',
            showConfirmButton: true, confirmButtonText: '<i class="fa-solid fa-plus me-1"></i> เพิ่มสิทธิใหม่', confirmButtonColor: '#10b981'
        }).then((res) => { if(res.isConfirmed) { setTimeout(() => this.editRight(null), 300); } });
    }

    editRight(id) {
        let r = id ? this.state.clinicRights.find(x => x.id === id) : { name: '', price: 1500 };
        Swal.fire({
            title: `<h5 class="fw-bold text-success mb-0"><i class="fa-solid ${id?'fa-pen':'fa-plus'} me-2"></i>${id ? 'แก้ไขสิทธิการรักษา' : 'เพิ่มสิทธิใหม่'}</h5>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Prompt';">
                    <label class="form-label fw-bold small text-secondary">ชื่อสิทธิ (เช่น บัตรทอง, ชำระเงินเอง)</label>
                    <input type="text" id="swal-right-name" class="form-control input-modern mb-3 fw-bold text-dark" value="${this.escapeHTML(r.name)}">
                    <label class="form-label fw-bold small text-secondary">ราคา / ค่าเบิกจ่าย (บาท)</label>
                    <input type="number" id="swal-right-price" class="form-control input-modern text-success fw-bold text-center" value="${r.price}" style="font-size: 18px;" min="0">
                </div>
            `,
            showCancelButton: true, cancelButtonText: 'ยกเลิก', confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึก', confirmButtonColor: '#10b981',
            preConfirm: () => {
                let name = document.getElementById('swal-right-name').value.trim();
                let price = document.getElementById('swal-right-price').value;
                if(!name) { Swal.showValidationMessage('กรุณากรอกชื่อสิทธิ'); return false; }
                return { id: id || 'RIGHT'+Date.now(), name, price: Number(price) };
            }
        }).then(res => {
            if(res.isConfirmed) {
                let updated = [...this.state.clinicRights];
                if(id) updated[updated.findIndex(x=>x.id===id)] = res.value; else updated.push(res.value);
                db.ref('clinic_rights_v2').set(updated).then(() => {
                    Swal.fire({title:'บันทึกสำเร็จ', icon:'success', timer:1000, showConfirmButton:false}).then(()=> this.manageRights());
                });
            } else if (res.isDismissed) { this.manageRights(); }
        });
    }

    deleteRight(id) {
        Swal.fire({
            title: 'ยืนยันการลบ?', text: 'ต้องการลบสิทธิการรักษานี้ใช่หรือไม่?', icon: 'warning', 
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-trash me-1"></i> ลบ', confirmButtonColor: '#ef4444', cancelButtonText: 'ยกเลิก'
        }).then(res => {
            if(res.isConfirmed) {
                let updated = this.state.clinicRights.filter(x=>x.id !== id);
                db.ref('clinic_rights_v2').set(updated).then(() => {
                    Swal.fire({title:'ลบสำเร็จ', icon:'success', timer:1000, showConfirmButton:false}).then(()=> this.manageRights());
                });
            } else { this.manageRights(); }
        });
    }

    initScannerEvents() {
        const dropzone = document.getElementById('doc-dropzone');
        const fileInput = document.getElementById('doc-file-input');
        const cameraInput = document.getElementById('doc-camera-input');
        
        if(!dropzone) return;

        dropzone.addEventListener('dragover', this.boundHandleDragOver);
        dropzone.addEventListener('dragleave', this.boundHandleDragLeave);
        dropzone.addEventListener('drop', this.boundHandleDrop);

        if(fileInput) { fileInput.onchange = async (e) => { if(e.target.files.length > 0) { await this.processScannedFiles(Array.from(e.target.files)); setTimeout(() => { fileInput.value = ''; }, 1000); } }; }
        if(cameraInput) { cameraInput.onchange = async (e) => { if(e.target.files.length > 0) { await this.processScannedFiles(Array.from(e.target.files)); setTimeout(() => { cameraInput.value = ''; }, 1000); } }; }
    }

    handleDragOver(e) { e.preventDefault(); document.getElementById('doc-dropzone').classList.add('dragover'); }
    handleDragLeave() { document.getElementById('doc-dropzone').classList.remove('dragover'); }
    handleDrop(e) { e.preventDefault(); const dropzone = document.getElementById('doc-dropzone'); if(dropzone) dropzone.classList.remove('dragover'); if(e.dataTransfer.files.length > 0) this.processScannedFiles(Array.from(e.dataTransfer.files)); }

    async processScannedFiles(rawFiles) {
        if (!rawFiles || rawFiles.length === 0) return;
        Swal.fire({ title: 'กำลังประมวลผลไฟล์...', html: 'กรุณารอสักครู่ ระบบกำลังบีบอัดรูปภาพให้เล็กลงอย่างปลอดภัย...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const files = Array.from(rawFiles);
        let newAttachments = []; let errorCount = 0;

        const generateFileName = (originalName) => {
            const now = new Date(); const dateStr = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
            const timeStr = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0') + String(now.getSeconds()).padStart(2, '0');
            const hn = this.state.visitData ? this.state.visitData.hn : 'UnknownHN';
            const rawName = this.state.visitData ? this.state.visitData.name : 'Patient';
            const cleanName = rawName.replace(/[^a-zA-Z0-9\u0E00-\u0E7F]/g, '');
            const parts = originalName.split('.'); const ext = parts.length > 1 ? '.' + parts.pop() : '';
            return `${dateStr}_${timeStr}_${hn}_${cleanName}${ext}`;
        };

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            const newFileName = generateFileName(file.name || `เอกสารแนบ_${i}`);

            try {
                if (file.type.match('image.*')) {
                    let dataUrl = await this.compressImageAsync(file);
                    if (dataUrl) { newAttachments.push({ id: 'DOC_' + Date.now() + i, type: 'image', dataUrl: dataUrl, name: newFileName }); } else { errorCount++; }
                } else if (file.type === 'application/pdf') {
                    if (file.size > 2 * 1024 * 1024) { Swal.fire('ไฟล์ใหญ่เกินไป', `ไฟล์ PDF '${file.name}' มีขนาดเกิน 2MB ขอข้ามไฟล์นี้นะครับ`, 'warning'); errorCount++; continue; }
                    let dataUrl = await this.readAsBase64Async(file);
                    if (dataUrl) { newAttachments.push({ id: 'DOC_' + Date.now() + i, type: 'pdf', dataUrl: dataUrl, name: newFileName }); } else { errorCount++; }
                }
            } catch (err) { errorCount++; }
        }

        this.state.currentAttachments = [...this.state.currentAttachments, ...newAttachments];
        this.renderAttachments();

        if (errorCount === 0 && newAttachments.length > 0) { Swal.fire({ title: 'แนบเอกสารสำเร็จ', icon: 'success', timer: 1200, showConfirmButton: false }); } 
        else if (newAttachments.length > 0) { Swal.fire('เสร็จสิ้นบางส่วน', `แนบไฟล์สำเร็จ ${newAttachments.length} รายการ (มีไฟล์ขัดข้อง ${errorCount} รายการ)`, 'info'); } 
        else { Swal.fire('อัปโหลดล้มเหลว', 'ไม่สามารถประมวลผลไฟล์ได้เนื่องจากไฟล์ใหญ่เกินไปหรือแรมเครื่องเต็ม', 'error'); }
    }

    compressImageAsync(file) {
        return new Promise((resolve) => {
            let timeout = setTimeout(() => { resolve(null); }, 15000); 
            try {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        try {
                            const canvas = document.createElement('canvas'); const MAX_WIDTH = 800; let scaleSize = 1;
                            if(img.width > MAX_WIDTH) scaleSize = MAX_WIDTH / img.width;
                            canvas.width = img.width * scaleSize; canvas.height = img.height * scaleSize;
                            const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            clearTimeout(timeout); resolve(canvas.toDataURL('image/jpeg', 0.5)); 
                        } catch (err) { clearTimeout(timeout); resolve(null); }
                    };
                    img.onerror = () => { clearTimeout(timeout); resolve(null); }; img.src = event.target.result;
                };
                reader.onerror = () => { clearTimeout(timeout); resolve(null); }; reader.readAsDataURL(file);
            } catch(e) { clearTimeout(timeout); resolve(null); }
        });
    }

    readAsBase64Async(file) { return new Promise((resolve) => { try { const reader = new FileReader(); reader.onload = (event) => resolve(event.target.result); reader.onerror = () => resolve(null); reader.readAsDataURL(file); } catch (e) { resolve(null); } }); }

    renderAttachments() {
        const area = document.getElementById('doc-preview-area');
        if(!area) return;
        let html = '';
        this.state.currentAttachments.forEach((doc, idx) => {
            let displayName = this.escapeHTML(doc.name || 'เอกสารแนบ');
            if (doc.type === 'pdf' || (doc.dataUrl && doc.dataUrl.startsWith('data:application/pdf'))) {
                html += `<div class="col-6 col-md-4 fade-in-up" style="animation-delay: ${idx * 0.1}s;"><div class="p-3 border rounded-3 bg-white text-center position-relative shadow-sm h-100 d-flex flex-column align-items-center justify-content-center"><button class="btn btn-sm btn-danger position-absolute shadow-sm delete-btn" style="top:-8px; right:-8px; border-radius:50%; width:30px; height:30px; padding:0; z-index:20;" onclick="window.VisitDetailPage.deleteAttachment('${doc.id}')" title="ลบไฟล์"><i class="fa-solid fa-times"></i></button><i class="fa-solid fa-file-pdf fa-3x text-danger mb-2"></i><div class="small fw-bold text-truncate w-100 mb-2" title="${displayName}">${displayName}</div><button class="btn btn-sm btn-outline-danger rounded-pill px-3 mt-auto" onclick="window.VisitDetailPage.viewAttachment('${doc.dataUrl}', 'pdf')"><i class="fa-solid fa-eye me-1"></i> ดูไฟล์</button></div></div>`;
            } else {
                html += `<div class="col-6 col-md-4 fade-in-up" style="animation-delay: ${idx * 0.1}s;"><div class="scan-img-card h-100 m-0 text-center"><button class="delete-btn shadow-sm" onclick="window.VisitDetailPage.deleteAttachment('${doc.id}')" title="ลบภาพ"><i class="fa-solid fa-times"></i></button><img src="${doc.dataUrl}" onclick="window.VisitDetailPage.viewAttachment('${doc.dataUrl}', 'image')" style="cursor:zoom-in; height:100px; object-fit:cover;"><div class="small text-muted text-truncate w-100 mt-1 fw-bold" style="font-size:11px;" title="${displayName}">${displayName}</div></div></div>`;
            }
        });
        area.innerHTML = html;
    }

    deleteAttachment(docId) { Swal.fire({ title: 'ลบเอกสารนี้?', text:'คุณต้องการลบเอกสารออกจากระบบใช่หรือไม่?', icon: 'warning', showCancelButton: true, confirmButtonText: 'ลบ', confirmButtonColor: '#ef4444' }).then(r => { if(r.isConfirmed) { this.state.currentAttachments = this.state.currentAttachments.filter(doc => doc.id !== docId); this.renderAttachments(); } }); }
    viewAttachment(dataUrl, type) { if (type === 'pdf' || dataUrl.startsWith('data:application/pdf')) { Swal.fire({ html: `<iframe src="${dataUrl}" style="width:100%; height:75vh; border:none; border-radius:8px;"></iframe>`, showConfirmButton: false, width: '90%', padding: '10px', showCloseButton: true }); } else { Swal.fire({ imageUrl: dataUrl, imageAlt: 'Scanned Document', showConfirmButton: false, width: '80%', padding: '0', background: 'transparent', showCloseButton: true }); } }
}

const VisitDetailPage = new VisitDetailPageComponent();
window.VisitDetailPage = VisitDetailPage;