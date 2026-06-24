// js/pages/visit_detail.js
// 🚀 โมดูลบันทึกข้อมูลฟอกไตเชิงลึก (3-Columns + 📸 Smart Scanner + ⚡ Reactive Pricing + 🧹 5-Year Auto-Purge)

const VisitDetailPage = {
    visitId: null, visitData: null, isFormLoaded: false,
    inventoryItems: [], labSets: [], noteTemplates: [], medsList: [], xraysList: [],
    modalities: [], clinicRights: [], allVisits: [], clinicSettings: {},
    currentMeds: [], currentLabs: [], currentXrays: [], currentAttachments: [], isStockDeducted: false, selectedDate: null, hasCleanedUp: false,

    html: '<style>' +
        '@keyframes fadeInUpLocal{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}} ' +
        '.fade-in-up{animation:fadeInUpLocal 0.4s cubic-bezier(0.16,1,0.3,1) forwards;opacity:0;} ' +
        '#vd-main-screen .form-label,#vd-main-screen .text-secondary,#vd-main-screen .text-muted{color:#334155!important;font-weight:600!important;letter-spacing:0.2px;} ' +
        '#vd-main-screen .form-control,#vd-main-screen .form-select,#vd-main-screen .input-modern{color:#0f172a!important;font-weight:700!important;font-size:14.5px!important;} ' +
        '#vd-main-screen .badge{font-weight:700!important;letter-spacing:0.3px;} ' +
        '#vd-main-screen .modern-panel,#vd-main-screen .solid-input-group{box-shadow:0 4px 10px rgba(0,0,0,0.04)!important;} ' +
        '.btn-outline-primary.bg-white:hover,.btn-outline-primary.bg-white:hover *{background-color:#3b82f6!important;border-color:#3b82f6!important;color:#ffffff!important;} ' +
        '.btn-outline-info.bg-white:hover,.btn-outline-info.bg-white:hover *{background-color:#0ea5e9!important;border-color:#0ea5e9!important;color:#ffffff!important;} ' +
        '.btn-outline-warning.bg-white:hover,.btn-outline-warning.bg-white:hover *{background-color:#eab308!important;border-color:#eab308!important;color:#ffffff!important;} ' +
        '.btn-outline-danger.bg-white:hover,.btn-outline-danger.bg-white:hover *{background-color:#ef4444!important;border-color:#ef4444!important;color:#ffffff!important;} ' +
        '.btn-outline-secondary.bg-white:hover,.btn-outline-secondary.bg-white:hover *{background-color:#64748b!important;border-color:#64748b!important;color:#ffffff!important;} ' +
        '.btn-outline-success.bg-white:hover,.btn-outline-success.bg-white:hover *{background-color:#10b981!important;border-color:#10b981!important;color:#ffffff!important;} ' +
        '.vd-date-picker{background:white;border-radius:50px;padding:8px 20px;display:inline-flex;align-items:center;justify-content:center;border:1px solid #e2e8f0;position:relative;z-index:10;min-width:200px;} ' +
        '.vd-avatar{width:55px;height:55px;border-radius:14px;object-fit:cover;border:2px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,0.1);} ' +
        '.solid-input-group{display:flex;align-items:stretch;background:#fff;border:1px solid #cbd5e1;border-radius:10px;overflow:hidden;box-shadow:var(--shadow-inner);transition:all 0.3s;} ' +
        '.solid-input-group:focus-within{border-color:var(--primary);box-shadow:0 0 0 4px rgba(37,99,235,0.15);} ' +
        '.solid-input-group input{border:none;outline:none;background:transparent;box-shadow:none;font-weight:700;color:var(--text-dark);padding:10px 12px;width:100%;min-width:0;font-size:14.5px;} ' +
        '.solid-input-group .sig-addon{display:flex;align-items:center;justify-content:center;background:#f8fafc;color:#64748b;font-weight:700;padding:0 12px;border-left:1px solid #cbd5e1;white-space:nowrap;font-size:14px;} ' +
        '.solid-input-group .sig-prepend{border-left:none;border-right:1px solid #cbd5e1;} ' +
        '.solid-input-group.sig-primary{border-color:#93c5fd;} ' +
        '.solid-input-group.sig-primary:focus-within{border-color:var(--primary);} ' +
        '.solid-input-group.sig-primary .sig-addon{background:var(--primary-light);color:var(--primary);border-color:#bfdbfe;} ' +
        '.solid-input-group.sig-primary input{color:var(--primary);} ' +
        '.min-w-0{min-width:0;} ' +
        '.compact-panel { border-radius: 20px; background: #ffffff; padding: 20px; } ' +
        '.section-title-compact { font-size: 16px; font-weight: 800; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; } ' +
        '.upload-dropzone { border: 2px dashed #cbd5e1; background: #f8fafc; border-radius: 12px; padding: 30px 15px; text-align: center; transition: all 0.3s ease; cursor: pointer; position: relative; } ' +
        '.upload-dropzone:hover, .upload-dropzone.dragover { border-color: #3b82f6; background: #eff6ff; } ' +
        '.scan-img-card { position: relative; display: inline-block; width: 100%; height: 100%; } ' +
        '.scan-img-card img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px rgba(0,0,0,0.05); } ' +
        '.scan-img-card .delete-btn { position: absolute; top: -10px; right: -10px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; z-index: 20; display:flex; align-items:center; justify-content:center; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: 0.2s; } ' +
        '.scan-img-card .delete-btn:hover { background: #dc2626; transform: scale(1.1); } ' +
        '.cursor-pointer { cursor: pointer; } ' +
        '.visually-hidden-input { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0,0,0,0) !important; border: 0 !important; }' +
        '</style>' +

        '<div id="vd-search-screen" style="display: none; max-width: 1000px; margin: 20px auto;">' +
            '<div class="modern-panel d-flex justify-content-between align-items-center flex-wrap gap-4 mb-4" style="border-top: 5px solid var(--primary); background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);">' +
                '<div class="position-relative z-1">' +
                    '<h2 class="fw-bold text-dark mb-2" style="font-family:\'Prompt\'; font-weight: 800; font-size: 28px; letter-spacing: -0.5px;"><i class="fa-solid fa-file-medical text-primary me-2"></i> เลือกคิว Flowsheet</h2>' +
                    '<p class="text-secondary mb-0 fw-bold fs-6">กรุณาเลือกเตียงผู้ป่วยที่ต้องการลงบันทึกข้อมูลการฟอกเลือด</p>' +
                '</div>' +
                '<div class="vd-date-picker shadow-sm position-relative overflow-hidden">' +
                    '<input type="date" id="vd-search-date-picker" class="position-absolute" style="opacity: 0; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer; z-index: 10;" onfocus="this.showPicker && this.showPicker()">' +
                    '<i class="fa-solid fa-calendar-day text-primary fa-lg position-relative" style="z-index: 1; pointer-events: none;"></i>' +
                    '<span id="vdSearchDateDisplay" class="fw-bold text-dark ms-2 position-relative" style="font-family:\'Prompt\'; z-index: 1; pointer-events: none; font-size: 16px;">กำลังโหลด...</span>' +
                '</div>' +
            '</div>' +
            '<div id="vd-search-loading" class="text-center py-5 text-primary"><i class="fas fa-spinner fa-spin fa-3x drop-shadow"></i></div>' +
            '<div id="vd-active-visits-container" class="row g-4" style="min-height: 200px;"></div>' +
        '</div>' +

        '<div id="vd-main-screen" style="display: none;">' +
            '<div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">' +
                '<div>' +
                    '<button class="btn btn-light shadow-sm fw-bold rounded-pill text-dark px-4 py-2 border card-hover-float" onclick="VisitDetailPage.init(null)"><i class="fa-solid fa-arrow-left me-2 text-primary"></i> เปลี่ยนผู้ป่วย</button>' +
                    '<h3 class="page-title text-dark d-inline-block ms-3 mb-0" style="font-weight: 800; font-size:26px;"><i class="fa-solid fa-file-medical text-primary me-2"></i> บันทึกข้อมูลฟอกเลือด <span class="text-muted fw-normal fs-5">(HD Flowsheet)</span></h3>' +
                '</div>' +
                '<div><button class="btn btn-premium btn-premium-success px-4 py-2" style="font-size: 15px;" onclick="VisitDetailPage.saveData()"><i class="fa-solid fa-cloud-arrow-up me-2"></i> บันทึกเข้าระบบ EMR</button></div>' +
            '</div>' +

            '<div id="vd-loading" class="text-center py-5 text-primary"><i class="fas fa-spinner fa-spin fa-3x mb-3 drop-shadow"></i><br>กำลังเชื่อมต่อระบบ...</div>' +

            '<div id="vd-content" style="display: none;">' +
                '<div class="modern-panel mb-4 p-4 position-relative overflow-hidden" style="border-top: 5px solid var(--primary); border-radius: 20px;">' +
                    '<div style="position: absolute; top: -40px; right: -10px; opacity: 0.03; font-size: 200px; pointer-events: none;"><i class="fa-solid fa-hospital-user"></i></div>' +
                    '<div class="row g-3 align-items-center position-relative z-1">' +
                        '<div class="col-12 col-md-8 col-xl-9 d-flex align-items-center gap-4 min-w-0">' +
                            '<div class="badge bg-primary-subtle text-primary border border-primary-subtle shadow-sm rounded-4 d-flex flex-column justify-content-center align-items-center flex-shrink-0" style="width: 70px; height: 70px;">' +
                                '<span class="fw-bold mb-0" style="opacity:0.8; font-size:13px;">เตียง</span>' +
                                '<span id="vd-pt-bed-display" style="font-size: 26px; font-weight: 800; line-height:1;"></span>' +
                            '</div>' +
                            '<div class="min-w-0 flex-grow-1">' +
                                '<h4 class="fw-bold text-dark mb-2 text-truncate" id="vd-pt-name" style="font-family:\'Prompt\';">ชื่อผู้ป่วย</h4>' +
                                '<div class="d-flex flex-wrap gap-2 align-items-center">' +
                                    '<span class="badge bg-light text-dark border shadow-sm px-3 py-2" style="font-size:13px;"><i class="fa-solid fa-id-card text-primary me-1"></i> HN: <span id="vd-pt-hn"></span></span>' +
                                    '<span class="badge bg-light text-dark border shadow-sm px-3 py-2" style="font-size:13px;"><i class="fa-regular fa-clock text-warning-dark me-1"></i> รอบ: <span id="vd-pt-time"></span></span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="col-12 col-md-4 col-xl-3 text-md-end mt-3 mt-md-0">' +
                            '<div class="d-inline-flex flex-column align-items-start align-items-md-end w-100">' +
                                '<label class="form-label fw-bold text-secondary small mb-2 px-1">สถานะการฟอกไต:</label>' +
                                '<select id="vd-status" class="form-select fw-bold input-modern shadow-sm w-100 bg-white" style="color: #1e293b; border-color: #cbd5e1; font-size: 15px; padding: 10px;">' +
                                    '<option value="รอตรวจ">🔵 รอตรวจ</option><option value="กำลังฟอกไต">🟠 กำลังฟอกไต</option><option value="เสร็จสิ้น">🟢 เสร็จสิ้น</option>' +
                                '</select>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +

                '<div class="row g-4 pb-5">' +
                    
                    '<div class="col-xl-4 col-lg-6">' +
                        '<div class="compact-panel modern-panel h-100 position-relative overflow-hidden" style="border-top: 5px solid var(--info);">' +
                            '<div class="section-title-compact text-info">' +
                                '<span><i class="fa-solid fa-pump-medical me-2"></i> 1. ตั้งค่าเครื่อง & สิทธิ</span>' +
                                '<button class="btn btn-sm btn-outline-info rounded-pill fw-bold shadow-sm px-3 py-1 bg-white" onclick="VisitDetailPage.pullPreviousData(\'machine\')"><i class="fa-solid fa-clock-rotate-left me-1"></i> ดึงประวัติ</button>' +
                            '</div>' +
                            '<div class="row g-3">' +
                                '<div class="col-6"><label class="form-label fw-bold text-secondary small mb-1">Dialyzer</label><input type="text" id="vd-dialyzer" class="form-control input-modern" placeholder="เช่น F60"></div>' +
                                '<div class="col-6"><div class="d-flex justify-content-between align-items-end mb-1"><label class="form-label fw-bold text-secondary small mb-0">โหมดฟอก</label><button class="btn btn-sm text-primary p-0 fw-bold" onclick="VisitDetailPage.manageModalities()"><i class="fa-solid fa-gear"></i></button></div><select id="vd-mode" class="form-select input-modern fw-bold text-dark" onchange="VisitDetailPage.onModeChange()"></select></div>' +
                                '<div class="col-6"><div class="d-flex justify-content-between align-items-end mb-1"><label class="form-label fw-bold text-secondary small mb-0">สิทธิรักษา</label><button class="btn btn-sm text-success p-0 fw-bold" onclick="VisitDetailPage.manageRights()"><i class="fa-solid fa-gear"></i></button></div><select id="vd-right" class="form-select input-modern fw-bold text-success" onchange="VisitDetailPage.onRightChange()" style="border-color:#86efac; background-color:#f0fdf4;"></select></div>' +
                                '<div class="col-6"><label class="form-label fw-bold text-success small mb-1">ค่าฟอก (฿)</label><div class="solid-input-group" style="border-color:#86efac;"><input type="number" id="vd-dialysis-fee" placeholder="0" class="text-success fw-bold text-center"></div></div>' +
                                '<div class="col-4 mt-3"><label class="form-label fw-bold text-secondary small mb-1">Qb</label><div class="solid-input-group"><input type="number" id="vd-qb" placeholder="0" class="text-center"><span class="sig-addon px-2">ml</span></div></div>' +
                                '<div class="col-4 mt-3"><label class="form-label fw-bold text-secondary small mb-1">Qd</label><div class="solid-input-group"><input type="number" id="vd-qd" placeholder="0" class="text-center"><span class="sig-addon px-2">ml</span></div></div>' +
                                '<div class="col-4 mt-3"><label class="form-label fw-bold text-primary small mb-1">Target UF</label><div class="solid-input-group sig-primary"><input type="number" step="0.1" id="vd-uf" placeholder="0.0" class="text-center"><span class="sig-addon px-2">L</span></div></div>' +
                            '</div>' +
                            
                            '<hr class="my-4 border-light">' +
                            
                            '<div class="section-title-compact text-danger">' +
                                '<span><i class="fa-solid fa-heart-pulse me-2"></i> 2. สัญญาณชีพและน้ำหนัก</span>' +
                                '<button class="btn btn-sm btn-outline-danger rounded-pill fw-bold shadow-sm px-3 py-1 bg-white" onclick="VisitDetailPage.pullPreviousData(\'vitals\')"><i class="fa-solid fa-clock-rotate-left me-1"></i> ดึงประวัติ</button>' +
                            '</div>' +
                            '<div class="row g-3">' +
                                '<div class="col-6"><label class="form-label fw-bold text-secondary small mb-1">Pre-Wt</label><div class="solid-input-group"><input type="number" step="0.1" id="vd-pre-wt" placeholder="0.0"><span class="sig-addon px-2">Kg</span></div></div>' +
                                '<div class="col-6"><label class="form-label fw-bold text-secondary small mb-1">Post-Wt</label><div class="solid-input-group"><input type="number" step="0.1" id="vd-post-wt" placeholder="0.0"><span class="sig-addon px-2">Kg</span></div></div>' +
                                '<div class="col-6"><label class="form-label fw-bold text-secondary small mb-1">Pre-BP</label><input type="text" id="vd-pre-bp" class="form-control input-modern text-danger fw-bold text-center" placeholder="120/80"></div>' +
                                '<div class="col-6"><label class="form-label fw-bold text-secondary small mb-1">Post-BP</label><input type="text" id="vd-post-bp" class="form-control input-modern text-success fw-bold text-center" placeholder="110/70"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +

                    '<div class="col-xl-4 col-lg-6">' +
                        '<div class="compact-panel modern-panel h-100 position-relative overflow-hidden" style="border-top: 5px solid var(--warning);">' +
                            '<div class="section-title-compact text-warning-dark">' +
                                '<span><i class="fa-solid fa-vials me-2"></i> 3. ยาฉีดและเวชภัณฑ์</span>' +
                                '<div class="d-flex gap-2 align-items-center">' +
                                    '<div id="vd-deduct-status-badge"></div>' +
                                    '<button class="btn btn-sm btn-outline-warning text-warning-dark rounded-pill fw-bold shadow-sm px-3 py-1 bg-white" onclick="VisitDetailPage.pullPreviousData(\'main_meds\')"><i class="fa-solid fa-clock-rotate-left me-1"></i> ดึงยาหลัก</button>' +
                                '</div>' +
                            '</div>' +
                            '<div class="row g-3 mb-4">' +
                                '<div class="col-6"><label class="form-label fw-bold text-secondary small mb-1">น้ำยาไต (Dialysate)</label><select id="vd-dialysate-item" class="form-select input-modern mb-2 fw-bold text-dark" onchange="VisitDetailPage.calculateAdditionalFees(true)"></select><div class="solid-input-group"><span class="sig-addon sig-prepend px-2">จำนวน</span><input type="number" id="vd-dialysate-qty" class="text-primary text-center" placeholder="แกลลอน" onkeyup="VisitDetailPage.calculateAdditionalFees(true)" onchange="VisitDetailPage.calculateAdditionalFees(true)"></div></div>' +
                                '<div class="col-6"><label class="form-label fw-bold text-secondary small mb-1">น้ำเกลือ (NSS)</label><select id="vd-saline-item" class="form-select input-modern mb-2 fw-bold text-dark" onchange="VisitDetailPage.calculateAdditionalFees(true)"></select><div class="solid-input-group"><span class="sig-addon sig-prepend px-2">จำนวน</span><input type="number" id="vd-saline-qty" class="text-primary text-center" placeholder="ขวด/ถุง" onkeyup="VisitDetailPage.calculateAdditionalFees(true)" onchange="VisitDetailPage.calculateAdditionalFees(true)"></div></div>' +
                                '<div class="col-12"><label class="form-label fw-bold text-secondary small mb-1">ยาต้านแข็งตัว (Heparin)</label><div class="row g-2"><div class="col-8"><select id="vd-heparin-item" class="form-select input-modern fw-bold text-dark" onchange="VisitDetailPage.calculateAdditionalFees(true)"></select></div><div class="col-4"><div class="solid-input-group"><span class="sig-addon sig-prepend px-2">จน.</span><input type="number" id="vd-heparin-qty" class="text-primary text-center" placeholder="Vial" onkeyup="VisitDetailPage.calculateAdditionalFees(true)" onchange="VisitDetailPage.calculateAdditionalFees(true)"></div></div></div></div>' +
                            '</div>' +
                            
                            '<div class="p-3 bg-light rounded-4 border border-secondary-subtle mb-3 shadow-sm">' +
                                '<div class="d-flex justify-content-between align-items-center mb-3">' +
                                    '<label class="form-label fw-bold text-dark mb-0"><i class="fa-solid fa-syringe text-danger me-2"></i> ยาฉีดอื่นๆ / เวชภัณฑ์</label>' +
                                    '<button class="btn btn-sm btn-outline-primary rounded-pill fw-bold shadow-sm px-3 py-1 bg-white" onclick="VisitDetailPage.pullPreviousData(\'other_meds\')"><i class="fa-solid fa-clock-rotate-left me-1"></i> ดึงยาเก่า</button>' +
                                '</div>' +
                                '<div id="vd-other-meds-container" class="mb-3"></div>' +
                                '<button class="btn btn-outline-primary fw-bold rounded-pill w-100 shadow-sm py-2 bg-white" id="btn-add-med" onclick="VisitDetailPage.addOtherMed()">+ เพิ่มรายการยา / เวชภัณฑ์</button>' +
                            '</div>' +

                            '<div class="p-3 bg-light rounded-4 border border-info-subtle mb-4 shadow-sm">' +
                                '<div class="d-flex justify-content-between align-items-center mb-3">' +
                                    '<label class="form-label fw-bold text-dark mb-0"><i class="fa-solid fa-x-ray text-info me-2"></i> X-Ray</label>' +
                                    '<button class="btn btn-sm btn-outline-info rounded-pill fw-bold shadow-sm px-3 py-1 bg-white" onclick="VisitDetailPage.pullPreviousData(\'xrays\')"><i class="fa-solid fa-clock-rotate-left me-1"></i> ดึงประวัติ</button>' +
                                '</div>' +
                                '<div id="vd-xrays-container" class="mb-3"></div>' +
                                '<button class="btn btn-outline-info fw-bold rounded-pill w-100 shadow-sm py-2 bg-white" onclick="VisitDetailPage.addXray()">+ เพิ่มรายการ X-Ray</button>' +
                            '</div>' +
                            
                            '<div class="modern-panel shadow-sm p-3" style="border-radius: 16px; border: 1px solid #cbd5e1; background-color: #f8fafc;">' +
                                '<div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">' +
                                    '<h6 class="fw-bold text-success mb-0"><i class="fa-solid fa-file-invoice-dollar me-2"></i> ค่าใช้จ่ายเพิ่ม (ไม่รวมค่าฟอก)</h6>' +
                                    '<button class="btn btn-sm btn-success fw-bold rounded-pill shadow-sm px-3" onclick="VisitDetailPage.calculateAdditionalFees()"><i class="fa-solid fa-calculator me-1"></i> คำนวณออโต้</button>' +
                                '</div>' +
                                '<div class="row g-2">' +
                                    '<div class="col-4"><label class="fw-bold text-secondary mb-1 small">ค่ายา</label><div class="solid-input-group" style="border-color:#86efac;"><span class="sig-addon bg-light text-success border-0 px-2">฿</span><input type="number" id="vd-med-fee" class="text-success fw-bold text-center border-0" placeholder="0"></div></div>' +
                                    '<div class="col-4"><label class="fw-bold text-secondary mb-1 small">ค่าแล็บ</label><div class="solid-input-group" style="border-color:#86efac;"><span class="sig-addon bg-light text-success border-0 px-2">฿</span><input type="number" id="vd-lab-fee" class="text-success fw-bold text-center border-0" placeholder="0"></div></div>' +
                                    '<div class="col-4"><label class="fw-bold text-secondary mb-1 small">ค่า X-Ray</label><div class="solid-input-group" style="border-color:#86efac;"><span class="sig-addon bg-light text-success border-0 px-2">฿</span><input type="number" id="vd-xray-fee" class="text-success fw-bold text-center border-0" placeholder="0"></div></div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="text-end mt-3"><button class="btn btn-premium-warning shadow-sm fw-bold px-4 py-2 w-100 fs-6" id="btn-deduct-stock" onclick="VisitDetailPage.deductStock()"><i class="fa-solid fa-box-open me-2"></i> ยืนยันตัดเบิกพัสดุ</button></div>' +
                        '</div>' +
                    '</div>' +

                    '<div class="col-xl-4 col-lg-12">' +
                        '<div class="compact-panel modern-panel h-100 position-relative overflow-hidden d-flex flex-column" style="border-top: 5px solid var(--muted);">' +
                            '<div class="section-title-compact text-secondary mb-4">' +
                                '<span><i class="fa-solid fa-microscope me-2"></i> 4. แล็บ & บันทึก (Notes)</span>' +
                                '<div class="d-flex gap-2">' +
                                    '<button class="btn btn-sm btn-outline-danger rounded-pill fw-bold shadow-sm px-3 py-1 bg-white" onclick="VisitDetailPage.pullPreviousData(\'labs\')">ดึงแล็บเก่า</button>' +
                                    '<button class="btn btn-sm btn-outline-secondary rounded-pill fw-bold shadow-sm px-3 py-1 bg-white" onclick="VisitDetailPage.pullPreviousData(\'note\')">ดึง Note เก่า</button>' +
                                '</div>' +
                            '</div>' +

                            '<div class="p-3 bg-light border border-danger-subtle rounded-4 mb-4 shadow-sm">' +
                                '<div class="d-flex justify-content-between align-items-center mb-3 border-bottom border-danger-subtle pb-3 flex-wrap gap-2">' +
                                    '<label class="form-label fw-bold text-danger mb-0"><i class="fa-solid fa-vial-virus me-2"></i> ดึงชุดผลแล็บ</label>' +
                                    '<div class="d-flex gap-2"><select id="vd-lab-set-select" class="form-select form-select-sm shadow-sm fw-bold text-danger input-modern px-3 py-1 w-auto"><option value="">- เลือกชุดแล็บ -</option></select><button class="btn btn-sm btn-danger fw-bold shadow-sm rounded-pill px-3" onclick="VisitDetailPage.applyLabSet()">โหลด</button></div>' +
                                '</div>' +
                                '<div id="vd-labs-container" class="row g-2 mb-3"></div>' +
                                '<button class="btn btn-outline-danger fw-bold rounded-pill w-100 shadow-sm py-2 bg-white" onclick="VisitDetailPage.addLabRow()">+ เพิ่มตัวตรวจ (Manual)</button>' +
                            '</div>' +

                            '<div class="row g-3 mb-4">' +
                                '<div class="col-12">' +
                                    '<label class="form-label fw-bold text-secondary mb-2">อาการสำคัญ (CC)</label>' +
                                    '<input type="text" id="vd-cc" class="form-control shadow-sm fw-bold text-dark input-modern mb-2" placeholder="มารับการฟอกเลือด...">' +
                                '</div>' +
                                '<div class="col-12">' +
                                    '<div class="d-flex justify-content-between align-items-center mb-2">' +
                                        '<label class="form-label fw-bold text-secondary mb-0">Progress Note</label>' +
                                        '<select id="vd-note-template" class="form-select form-select-sm w-auto shadow-sm fw-bold input-modern text-warning-dark px-3 py-1" onchange="VisitDetailPage.applyNoteTemplate(this.value)"><option value="">-- เลือกเทมเพลต --</option></select>' +
                                    '</div>' +
                                    '<textarea id="vd-note" class="form-control shadow-sm p-3 fw-bold text-dark input-modern" rows="4" placeholder="บันทึกอาการและคำสั่งการรักษา..." style="line-height:1.6; border-radius:12px;"></textarea>' +
                                '</div>' +
                            '</div>' +

                            '<div class="mt-auto border-top pt-4">' +
                                '<div class="section-title-compact text-primary mb-3">' +
                                    '<span><i class="fa-solid fa-camera me-2"></i> 5. สแกนเอกสารแนบ</span>' +
                                '</div>' +
                                '<div class="upload-dropzone" id="doc-dropzone">' +
                                    '<i class="fa-solid fa-cloud-arrow-up fa-2x text-primary mb-3"></i>' +
                                    '<h6 class="fw-bold text-dark mb-3">ลากไฟล์มาวางที่นี่ หรือ เลือกวิธีนำเข้า</h6>' +
                                    '<div class="d-flex justify-content-center gap-2 flex-wrap">' +
                                        '<label class="btn btn-primary fw-bold shadow-sm rounded-pill px-4 m-0 cursor-pointer">' +
                                            '<i class="fa-solid fa-camera me-2"></i> ถ่ายรูป' +
                                            '<input type="file" id="doc-camera-input" accept="image/*" capture="environment" class="visually-hidden-input">' +
                                        '</label>' +
                                        '<label class="btn btn-outline-primary fw-bold shadow-sm rounded-pill px-4 m-0 cursor-pointer bg-white">' +
                                            '<i class="fa-solid fa-folder-open me-2"></i> เลือกไฟล์ / PDF' +
                                            '<input type="file" id="doc-file-input" accept="image/*,application/pdf" multiple class="visually-hidden-input">' +
                                        '</label>' +
                                    '</div>' +
                                    '<p class="text-muted small mt-3 mb-0" style="font-size:12px;">รองรับ JPG, PNG และ PDF</p>' +
                                '</div>' +
                                '<div id="doc-preview-area" class="mt-3 row g-2"></div>' +
                            '</div>' +
                            
                        '</div>' +
                    '</div>' +

                '</div>' +
            '</div>' +
        '</div>',

    init: function(visitId) {
        this.isFormLoaded = false;
        const today = new Date();
        this.selectedDate = this.selectedDate || (new Date(Date.now() - (today.getTimezoneOffset() * 60000))).toISOString().split('T')[0];
        
        // 🚨 5-Year Auto Purge Rule (รันตอนเข้ามาที่หน้านี้เลย) 🚨
        if (!this.hasCleanedUp) this.autoCleanUpOldRecords();

        if (!visitId || typeof visitId !== 'string') { 
            document.getElementById('vd-search-screen').style.display = 'block'; document.getElementById('vd-main-screen').style.display = 'none'; document.getElementById('vd-search-loading').style.display = 'block'; document.getElementById('vd-active-visits-container').innerHTML = '';
            setTimeout(() => { const dp = document.getElementById('vd-search-date-picker'); if(dp) { dp.value = this.selectedDate; this.updateDateDisplay(this.selectedDate); dp.onchange = (e) => { this.selectedDate = e.target.value; this.updateDateDisplay(this.selectedDate); this.init(null); }; } }, 50);
            if (typeof db === 'undefined') return;
            Promise.all([db.ref('patients_database_v2/visits').once('value'), db.ref('patients_database_v2/patients').once('value')]).then(([vSnap, pSnap]) => {
                document.getElementById('vd-search-loading').style.display = 'none';
                let rawVisits = vSnap.val() ? (Array.isArray(vSnap.val()) ? vSnap.val() : Object.keys(vSnap.val()).map(k => vSnap.val()[k])) : [];
                let rawPts = pSnap.val() ? (Array.isArray(pSnap.val()) ? pSnap.val() : Object.keys(pSnap.val()).map(k => pSnap.val()[k])) : [];
                let todayVisits = rawVisits.filter(v => v && v.date === this.selectedDate);
                const container = document.getElementById('vd-active-visits-container'); if(!container) return;
                if (todayVisits.length === 0) { container.innerHTML = '<div class="col-12 text-center py-5 fade-in-up"><i class="fa-solid fa-bed text-muted fa-4x mb-4" style="opacity: 0.2;"></i><h4 class="text-muted fw-bold">ไม่มีรายชื่อคิวฟอกเลือด</h4><p class="text-muted mb-4">ไม่มีประวัติการจัดคิวในวันที่เลือก</p><button class="btn btn-premium btn-premium-primary px-5" onclick="App.switchPage(\'visits\')"><i class="fa-solid fa-list-check me-2"></i> ไปหน้าจัดการคิว</button></div>'; return; }
                todayVisits.sort((a, b) => { if(a.time !== b.time) return (a.time || "").localeCompare(b.time || ""); return (parseInt(a.bed) || 999) - (parseInt(b.bed) || 999); });
                let html = '';
                todayVisits.forEach((v, idx) => { 
                    let ptData = rawPts.find(p => String(p.hn) === String(v.hn)) || {};
                    let imgSrc = ptData.photo_base64 ? (ptData.photo_base64.startsWith('data:image') ? ptData.photo_base64 : 'data:image/jpeg;base64,' + ptData.photo_base64) : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(v.name||'X') + '&background=3b82f6&color=fff&bold=true';
                    let bColor = "var(--primary)"; let badgeClass = "badge-soft-primary"; let opacityClass = "";
                    if(v.status === "กำลังฟอกไต") { bColor = "var(--warning)"; badgeClass = "badge-soft-warning"; }
                    if(v.status === "เสร็จสิ้น") { bColor = "var(--success)"; badgeClass = "badge-soft-success"; opacityClass = "opacity:0.75"; }
                    html += '<div class="col-md-6 col-lg-4 fade-in-up" style="animation-delay: ' + (idx * 0.05) + 's"><div class="modern-panel p-4 h-100 d-flex flex-column card-hover-float" style="border-left: 5px solid ' + bColor + '; cursor: pointer; ' + opacityClass + '" onclick="VisitDetailPage.init(\'' + v.id + '\')"><div class="d-flex justify-content-between align-items-start mb-3"><div class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill shadow-sm fs-6"><i class="fa-solid fa-bed me-2"></i> เตียง ' + (v.bed||'-') + '</div><span class="badge ' + badgeClass + ' rounded-pill px-3 py-2 shadow-sm" style="font-size:13px;">' + (v.status || 'รอตรวจ') + '</span></div><div class="d-flex align-items-center mb-4"><img src="' + imgSrc + '" class="vd-avatar me-3"><div class="min-w-0"><h5 class="fw-bold text-dark mb-1 text-truncate" style="font-family:\'Prompt\'; font-size:18px;">' + v.name + '</h5><div class="text-muted fw-bold small"><i class="fa-solid fa-id-card text-secondary me-1"></i> HN: ' + v.hn + '</div></div></div><div class="mt-auto pt-3 border-top border-light"><div class="fw-bold text-primary" style="font-size:15px;"><i class="fa-regular fa-clock me-2 text-secondary"></i> รอบเวลา: ' + (v.time||'-') + ' น.</div></div></div></div>';
                });
                container.innerHTML = html;
            }); return;
        }
        document.getElementById('vd-search-screen').style.display = 'none'; document.getElementById('vd-main-screen').style.display = 'block'; this.visitId = visitId; this.loadData();
    },

    updateDateDisplay: function(dateStr) { const displayEl = document.getElementById('vdSearchDateDisplay'); if (displayEl && dateStr) { const dateObj = new Date(dateStr); displayEl.innerText = dateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }); } },
    
    autoCleanUpOldRecords: function() {
        this.hasCleanedUp = true;
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 5);
        const cutoffTime = cutoffDate.getTime();

        if (typeof db === 'undefined') return;

        Promise.all([
            db.ref('patients_database_v2/visits').once('value'),
            db.ref('patients_database_v2/patients').once('value')
        ]).then(([vSnap, pSnap]) => {
            let deletedVisitsCount = 0;
            let deletedHistoryCount = 0;

            let visitListVal = vSnap.val();
            if (visitListVal) {
                let visits = Array.isArray(visitListVal) ? visitListVal : Object.keys(visitListVal).map(k => visitListVal[k]);
                let originalVisitsLen = visits.length;
                let validVisits = visits.filter(v => {
                    if (!v || !v.date) return false;
                    let vDate = new Date(v.date).getTime();
                    return vDate >= cutoffTime;
                });
                
                deletedVisitsCount = originalVisitsLen - validVisits.length;
                if (deletedVisitsCount > 0) {
                    db.ref('patients_database_v2/visits').set(validVisits);
                }
            }

            let patientListVal = pSnap.val();
            if (patientListVal) {
                let patients = Array.isArray(patientListVal) ? patientListVal : Object.keys(patientListVal).map(k => patientListVal[k]);
                let isAnyPatientUpdated = false;

                patients.forEach(p => {
                    if (p) {
                        if (Array.isArray(p.history)) {
                            let oldHistLen = p.history.length;
                            p.history = p.history.filter(h => h && h.date && new Date(h.date).getTime() >= cutoffTime);
                            let diff = oldHistLen - p.history.length;
                            if (diff > 0) {
                                isAnyPatientUpdated = true;
                                deletedHistoryCount += diff;
                            }
                        }
                        if (Array.isArray(p.labs)) {
                            let oldLabsLen = p.labs.length;
                            p.labs = p.labs.filter(l => l && l.date && new Date(l.date).getTime() >= cutoffTime);
                            if (p.labs.length < oldLabsLen) isAnyPatientUpdated = true;
                        }
                    }
                });

                if (isAnyPatientUpdated) {
                    db.ref('patients_database_v2/patients').set(patients);
                }
            }

            if (deletedVisitsCount > 0 || deletedHistoryCount > 0) {
                const Toast = Swal.mixin({ 
                    toast: true, position: 'bottom-end', showConfirmButton: false, timer: 6000,
                    didOpen: (toast) => {
                        toast.style.background = '#ffffff';
                        toast.style.border = '2px solid #3b82f6';
                        toast.style.borderRadius = '16px';
                        toast.style.fontFamily = "'Prompt', sans-serif";
                    }
                });
                Toast.fire({ icon: 'info', title: `♻️ ล้างคิวฟอกเลือด/ประวัติเก่าเกิน 5 ปี สำเร็จ (${deletedVisitsCount + deletedHistoryCount} รายการ)` });
            }

        }).catch(err => console.error("Error in autoCleanUpOldRecords:", err));
    },

    pullPreviousData: function(section) {
        if (!this.allVisits || this.allVisits.length === 0) return;
        let ptVisits = this.allVisits.filter(v => v.hn === this.visitData.hn && String(v.id) !== String(this.visitId));
        ptVisits.sort((a, b) => { let dateA = new Date(a.date + " " + (a.time || "00:00")); let dateB = new Date(b.date + " " + (b.time || "00:00")); return dateB - dateA; });
        let prevVisit = ptVisits[0]; 
        if (!prevVisit) { Swal.fire({ title: 'ไม่พบข้อมูลก่อนหน้า', text: 'ผู้ป่วยรายนี้ยังไม่มีประวัติการฟอกเลือดในระบบครับ', icon: 'info', confirmButtonText: 'ตกลง', confirmButtonColor: '#3b82f6' }); return; }
        switch(section) {
            case 'machine': document.getElementById('vd-dialyzer').value = prevVisit.hd_dialyzer || ''; document.getElementById('vd-mode').value = prevVisit.hd_mode || ''; document.getElementById('vd-right').value = prevVisit.right || ''; document.getElementById('vd-dialysis-fee').value = prevVisit.dialysis_fee || ''; document.getElementById('vd-qb').value = prevVisit.hd_qb || ''; document.getElementById('vd-qd').value = prevVisit.hd_qd || ''; document.getElementById('vd-uf').value = prevVisit.hd_uf || ''; break;
            case 'vitals': document.getElementById('vd-pre-wt').value = prevVisit.pre_wt || ''; document.getElementById('vd-post-wt').value = prevVisit.post_wt || ''; document.getElementById('vd-pre-bp').value = prevVisit.pre_bp || ''; document.getElementById('vd-post-bp').value = prevVisit.post_bp || ''; break;
            case 'main_meds': if(this.isStockDeducted) { Swal.fire({ title: 'ไม่สามารถเขียนทับข้อมูลได้', text: 'มีการตัดเบิกสต๊อกพัสดุไปแล้ว ยกเลิกการตัดเบิก (คืนคลัง) ก่อนดึงข้อมูลใหม่ครับ', icon: 'warning', confirmButtonText: 'ตกลง', confirmButtonColor: '#f59e0b' }); return; } document.getElementById('vd-dialysate-item').value = prevVisit.hd_dialysate_item || ''; document.getElementById('vd-dialysate-qty').value = prevVisit.hd_dialysate_qty || ''; document.getElementById('vd-saline-item').value = prevVisit.hd_saline_item || ''; document.getElementById('vd-saline-qty').value = prevVisit.hd_saline_qty || ''; document.getElementById('vd-heparin-item').value = prevVisit.hd_heparin_item || ''; document.getElementById('vd-heparin-qty').value = prevVisit.hd_heparin_qty || ''; this.calculateAdditionalFees(true); break;
            case 'other_meds': if(this.isStockDeducted) { Swal.fire({ title: 'ไม่สามารถเขียนทับข้อมูลได้', text: 'มีการตัดเบิกไปแล้ว ยกเลิกเบิกก่อนแก้ไขครับ', icon: 'warning', confirmButtonColor: '#f59e0b' }); return; } this.currentMeds = prevVisit.other_meds ? JSON.parse(JSON.stringify(prevVisit.other_meds)) : []; this.renderOtherMeds(); this.calculateAdditionalFees(true); break;
            case 'xrays': this.currentXrays = prevVisit.xray_list ? JSON.parse(JSON.stringify(prevVisit.xray_list)) : []; this.renderXrays(); this.calculateAdditionalFees(true); break;
            case 'labs': this.currentLabs = prevVisit.lab_results ? JSON.parse(JSON.stringify(prevVisit.lab_results)) : []; this.renderLabs(); break;
            case 'note': document.getElementById('vd-cc').value = prevVisit.cc || ''; document.getElementById('vd-note').value = prevVisit.note || ''; break;
        }
        Swal.fire({ title: 'ดึงข้อมูลสำเร็จ!', icon: 'success', timer: 1500, showConfirmButton: false });
    },

    loadData: async function() {
        if (typeof db === 'undefined') return;
        document.getElementById('vd-loading').style.display = 'block'; document.getElementById('vd-content').style.display = 'none';
        const toArray = (snapVal) => snapVal ? (Array.isArray(snapVal) ? snapVal : Object.keys(snapVal).map(k => snapVal[k])).filter(Boolean) : [];

        try {
            const [ptSnap, visitSnap, invSnap, medSnap, xraySnap, rightSnap, modSnap, settingsSnap, labSetSnap, noteSnap] = await Promise.all([
                db.ref('patients_database_v2/patients').once('value'), db.ref('patients_database_v2/visits').once('value'), db.ref('inventory_database_v2/items').once('value'), 
                db.ref('clinic_meds_list_v2').once('value'), db.ref('clinic_xray_list_v2').once('value'), db.ref('clinic_rights_v2').once('value'),
                db.ref('clinic_modalities_v2').once('value'), db.ref('clinic_settings_v2').once('value'), db.ref('clinic_lab_sets_v2').once('value'), db.ref('clinic_note_templates_v2').once('value')
            ]);

            this.clinicSettings = settingsSnap.val() || {}; this.inventoryItems = toArray(invSnap.val());
            
            let _meds = toArray(medSnap.val()); this.medsList = _meds.length > 0 ? _meds : [{ id: 'M1', name: 'Erythropoietin 4000U', price: 450 }];
            let _xrays = toArray(xraySnap.val()); this.xraysList = _xrays.length > 0 ? _xrays : [{ id: 'X1', name: 'Chest X-Ray', price: 350 }];
            let _rights = toArray(rightSnap.val()); this.clinicRights = _rights.length > 0 ? _rights : [{ id: 'R1', name: "ชำระเงินเอง", price: 1500 }];
            let _mods = toArray(modSnap.val()); this.modalities = _mods.length > 0 ? _mods : [{ id: 'MOD1', name: 'HD ปกติ', price: 1500}];
            let _labSets = toArray(labSetSnap.val()); this.labSets = _labSets.length > 0 ? _labSets : [{ id: 'LS1', name: 'Monthly Lab', items: ['BUN', 'Cr'] }];
            
            let _notes = toArray(noteSnap.val()); 
            let defaultNotes = [
                { id: 'NT_PRE1', category: 'pre', title: 'อาการปกติ (มารับการฟอก)', text: 'ผู้ป่วยรู้สึกตัวดี มารับการฟอกเลือดตามนัด ไม่มีอาการหอบเหนื่อย บวม หรือเจ็บแน่นหน้าอก สัญญาณชีพอยู่ในเกณฑ์ปกติ Vascular access ทำงานได้ดี' },
                { id: 'NT_PRE2', category: 'pre', title: 'มีอาการน้ำเกิน/หอบเหนื่อย', text: 'ผู้ป่วยมีอาการหอบเหนื่อย นอนราบไม่ได้ ขาบวม 2 ข้าง ฟังปอดพบ crepitation ประเมินมีภาวะน้ำเกิน (Volume Overload)' },
                { id: 'NT_PRE3', category: 'pre', title: 'มีความดันโลหิตสูง', text: 'ประเมินก่อนฟอกเลือดพบความดันโลหิตสูง (Hypertension) ผู้ป่วยแจ้งว่าทานยาลดความดันมาแล้ว ไม่มีอาการปวดศีรษะหรือตาพร่ามัว' },
                { id: 'NT_INTRA1', category: 'intra', title: 'ความดันตก (Hypotension)', text: 'ระหว่างฟอกเลือด ผู้ป่วยมีอาการหน้ามืด ใจสั่น เหงื่อแตก วัดความดันโลหิตพบว่าลดลง (Hypotension)\n- ปรับลด UFR\n- ให้ 0.9% NSS 100 ml IV\n- ปรับท่านอนราบยกขาสูง\nหลังให้การพยาบาล ผู้ป่วยอาการดีขึ้น ความดันโลหิตกลับมาอยู่ในเกณฑ์ที่รับได้' },
                { id: 'NT_INTRA2', category: 'intra', title: 'ตะคริว (Cramps)', text: 'ผู้ป่วยมีอาการตะคริวที่บริเวณกล้ามเนื้อขา\n- ปรับลด UFR หรือหยุด UFR ชั่วคราว\n- นวดคลึงกล้ามเนื้อ\n- ให้ 0.9% NSS 100 ml IV\nอาการตะคริวทุเลาลง สามารถฟอกเลือดต่อได้จนจบ' },
                { id: 'NT_INTRA3', category: 'intra', title: 'หนาวสั่น (Chills)', text: 'ผู้ป่วยมีอาการหนาวสั่นระหว่างฟอกเลือด วัดอุณหภูมิร่างกายปกติ ไม่มีไข้ ให้การพยาบาลโดยห่มผ้าให้อบอุ่น และปรับอุณหภูมิน้ำยา (Dialysate Temp) อาการทุเลาลง' },
                { id: 'NT_POST1', category: 'post', title: 'สรุปการรักษาปกติ (จบเคส)', text: 'ฟอกเลือดครบตามเวลาที่กำหนด ดึงน้ำได้ตามเป้าหมาย สัญญาณชีพหลังฟอกปกติ ไม่มีเลือดออกซึม ผู้ป่วยรู้สึกตัวดี กลับบ้านได้' }
            ];
            this.noteTemplates = _notes.length > 0 ? _notes : defaultNotes;

            let visits = toArray(visitSnap.val()); this.allVisits = visits; this.visitData = visits.find(v => String(v.id) === String(this.visitId));
            if (!this.visitData) { Swal.fire('ข้อผิดพลาด', 'ไม่พบข้อมูลคิวนี้', 'error'); App.switchPage('visits'); return; }

            this.currentMeds = this.visitData.other_meds || []; this.currentXrays = this.visitData.xray_list || []; this.currentLabs = this.visitData.lab_results || []; this.currentAttachments = this.visitData.attachments || []; this.isStockDeducted = this.visitData.is_stock_deducted || false;
            
            db.ref('clinic_note_templates_v2').on('value', snap => {
                let liveNotes = toArray(snap.val());
                if(liveNotes.length > 0) {
                    this.noteTemplates = liveNotes;
                    if(this.isFormLoaded) this.renderNoteTemplateDropdown();
                }
            });

            this.isFormLoaded = true; this.renderFormUI();
            document.getElementById('vd-loading').style.display = 'none'; document.getElementById('vd-content').style.display = 'block';
            
            setTimeout(() => { this.initScannerEvents(); }, 200);

        } catch (e) { Swal.fire('ข้อผิดพลาด', 'โหลดข้อมูลไม่สำเร็จ', 'error'); }
    },

    renderFormUI: function() {
        const v = this.visitData;
        document.getElementById('vd-pt-name').innerText = v.name || '-'; document.getElementById('vd-pt-hn').innerText = v.hn || '-'; document.getElementById('vd-pt-bed-display').innerText = v.bed || '-'; document.getElementById('vd-pt-time').innerText = v.time || '-';
        document.getElementById('vd-status').value = v.status || 'รอตรวจ'; document.getElementById('vd-dialyzer').value = v.hd_dialyzer || '';
        
        this.renderModalityDropdown(); this.renderRightDropdown(); this.refreshDropdownsUI(); this.renderLabSetDropdown(); this.renderNoteTemplateDropdown(); this.renderLabs(); this.renderXrays(); this.renderAttachments();
        
        document.getElementById('vd-mode').value = v.hd_mode || ''; document.getElementById('vd-right').value = v.right || ''; document.getElementById('vd-dialysis-fee').value = v.dialysis_fee !== undefined ? v.dialysis_fee : '';
        
        let defMed = this.clinicSettings.med_fee_default || this.clinicSettings.med_fee || this.clinicSettings.medicine_fee || '';
        let defLab = this.clinicSettings.lab_fee_default || this.clinicSettings.lab_fee || '';
        let defXray = this.clinicSettings.xray_fee_default || this.clinicSettings.xray_fee || '';

        if(document.getElementById('vd-med-fee')) { document.getElementById('vd-med-fee').value = (v.med_fee !== undefined && v.med_fee !== "" && Number(v.med_fee) !== 0) ? v.med_fee : defMed; }
        if(document.getElementById('vd-lab-fee')) { document.getElementById('vd-lab-fee').value = (v.lab_fee !== undefined && v.lab_fee !== "" && Number(v.lab_fee) !== 0) ? v.lab_fee : defLab; }
        if(document.getElementById('vd-xray-fee')) { document.getElementById('vd-xray-fee').value = (v.xray_fee !== undefined && v.xray_fee !== "" && Number(v.xray_fee) !== 0) ? v.xray_fee : defXray; }
        
        if (!document.getElementById('vd-dialysis-fee').value && v.right) { this.onRightChange(); }
        
        document.getElementById('vd-qb').value = v.hd_qb || ''; document.getElementById('vd-qd').value = v.hd_qd || ''; document.getElementById('vd-uf').value = v.hd_uf || '';
        document.getElementById('vd-pre-wt').value = v.pre_wt || ''; document.getElementById('vd-post-wt').value = v.post_wt || ''; document.getElementById('vd-pre-bp').value = v.pre_bp || ''; document.getElementById('vd-post-bp').value = v.post_bp || '';
        document.getElementById('vd-cc').value = v.cc || ''; document.getElementById('vd-note').value = v.note || '';
        document.getElementById('vd-dialysate-qty').value = v.hd_dialysate_qty || ''; document.getElementById('vd-saline-qty').value = v.hd_saline_qty || ''; document.getElementById('vd-heparin-qty').value = v.hd_heparin_qty || '';
        
        this.updateDeductStateUI();
    },

    initScannerEvents: function() {
        const dropzone = document.getElementById('doc-dropzone');
        const fileInput = document.getElementById('doc-file-input');
        const cameraInput = document.getElementById('doc-camera-input');
        
        if(!dropzone) return;

        dropzone.ondragover = (e) => { e.preventDefault(); dropzone.classList.add('dragover'); };
        dropzone.ondragleave = () => dropzone.classList.remove('dragover');
        dropzone.ondrop = (e) => {
            e.preventDefault(); dropzone.classList.remove('dragover');
            if(e.dataTransfer.files.length > 0) this.processScannedFiles(e.dataTransfer.files);
        };

        if(fileInput) {
            fileInput.onchange = async (e) => {
                if(e.target.files.length > 0) {
                    const filesToProcess = Array.from(e.target.files); 
                    await this.processScannedFiles(filesToProcess);
                    setTimeout(() => { fileInput.value = ''; }, 1000); 
                }
            };
        }
        
        if(cameraInput) {
            cameraInput.onchange = async (e) => {
                if(e.target.files.length > 0) {
                    const filesToProcess = Array.from(e.target.files); 
                    await this.processScannedFiles(filesToProcess);
                    setTimeout(() => { cameraInput.value = ''; }, 1000); 
                }
            };
        }
    },

    processScannedFiles: async function(rawFiles) {
        if (!rawFiles || rawFiles.length === 0) return;

        Swal.fire({ title: 'กำลังประมวลผลไฟล์...', html: 'กรุณารอสักครู่ ระบบกำลังบีบอัดรูปภาพให้เล็กลงอย่างปลอดภัย...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const files = Array.from(rawFiles);
        let newAttachments = []; let errorCount = 0;

        const generateFileName = (originalName) => {
            const now = new Date();
            const dateStr = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
            const timeStr = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0') + String(now.getSeconds()).padStart(2, '0');
            const hn = this.visitData ? this.visitData.hn : 'UnknownHN';
            const rawName = this.visitData ? this.visitData.name : 'Patient';
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
                    if (file.size > 2 * 1024 * 1024) { 
                        Swal.fire('ไฟล์ใหญ่เกินไป', `ไฟล์ PDF '${file.name}' มีขนาดเกิน 2MB เพื่อความเสถียรของคลาวด์ ขอข้ามไฟล์นี้นะครับ`, 'warning');
                        errorCount++; continue;
                    }
                    let dataUrl = await this.readAsBase64Async(file);
                    if (dataUrl) { newAttachments.push({ id: 'DOC_' + Date.now() + i, type: 'pdf', dataUrl: dataUrl, name: newFileName }); } else { errorCount++; }
                }
            } catch (err) { errorCount++; }
        }

        this.currentAttachments = [...this.currentAttachments, ...newAttachments];
        this.renderAttachments();

        if (errorCount === 0 && newAttachments.length > 0) { Swal.fire({ title: 'แนบเอกสารสำเร็จ', icon: 'success', timer: 1200, showConfirmButton: false }); } 
        else if (newAttachments.length > 0) { Swal.fire('เสร็จสิ้นบางส่วน', `แนบไฟล์สำเร็จ ${newAttachments.length} รายการ (มีไฟล์ขัดข้อง ${errorCount} รายการ)`, 'info'); } 
        else { Swal.fire('อัปโหลดล้มเหลว', 'ไม่สามารถประมวลผลไฟล์ได้เนื่องจากไฟล์ใหญ่เกินไปหรือแรมเครื่องเต็ม', 'error'); }
    },

    compressImageAsync: function(file) {
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
    },

    readAsBase64Async: function(file) {
        return new Promise((resolve) => {
            try { const reader = new FileReader(); reader.onload = (event) => resolve(event.target.result); reader.onerror = () => resolve(null); reader.readAsDataURL(file); } catch (e) { resolve(null); }
        });
    },

    renderAttachments: function() {
        const area = document.getElementById('doc-preview-area');
        if(!area) return;
        let html = '';
        this.currentAttachments.forEach((doc, idx) => {
            let displayName = doc.name || 'เอกสารแนบ';
            if (doc.type === 'pdf' || (doc.dataUrl && doc.dataUrl.startsWith('data:application/pdf'))) {
                html += `<div class="col-6 col-md-4 fade-in-up" style="animation-delay: ${idx * 0.1}s;"><div class="p-3 border rounded-3 bg-white text-center position-relative shadow-sm h-100 d-flex flex-column align-items-center justify-content-center"><button class="btn btn-sm btn-danger position-absolute shadow-sm delete-btn" style="top:-8px; right:-8px; border-radius:50%; width:30px; height:30px; padding:0; z-index:20;" onclick="VisitDetailPage.deleteAttachment('${doc.id}')" title="ลบไฟล์"><i class="fa-solid fa-times"></i></button><i class="fa-solid fa-file-pdf fa-3x text-danger mb-2"></i><div class="small fw-bold text-truncate w-100 mb-2" title="${displayName}">${displayName}</div><button class="btn btn-sm btn-outline-danger rounded-pill px-3 mt-auto" onclick="VisitDetailPage.viewAttachment('${doc.dataUrl}', 'pdf')"><i class="fa-solid fa-eye me-1"></i> ดูไฟล์</button></div></div>`;
            } else {
                html += `<div class="col-6 col-md-4 fade-in-up" style="animation-delay: ${idx * 0.1}s;"><div class="scan-img-card h-100 m-0 text-center"><button class="delete-btn shadow-sm" onclick="VisitDetailPage.deleteAttachment('${doc.id}')" title="ลบภาพ"><i class="fa-solid fa-times"></i></button><img src="${doc.dataUrl}" onclick="VisitDetailPage.viewAttachment('${doc.dataUrl}', 'image')" style="cursor:zoom-in; height:100px; object-fit:cover;"><div class="small text-muted text-truncate w-100 mt-1 fw-bold" style="font-size:11px;" title="${displayName}">${displayName}</div></div></div>`;
            }
        });
        area.innerHTML = html;
    },

    deleteAttachment: function(docId) {
        Swal.fire({ title: 'ลบเอกสารนี้?', text:'คุณต้องการลบเอกสารออกจากระบบใช่หรือไม่?', icon: 'warning', showCancelButton: true, confirmButtonText: 'ลบ', confirmButtonColor: '#ef4444' }).then(r => {
            if(r.isConfirmed) { this.currentAttachments = this.currentAttachments.filter(doc => doc.id !== docId); this.renderAttachments(); }
        });
    },

    viewAttachment: function(dataUrl, type) {
        if (type === 'pdf' || dataUrl.startsWith('data:application/pdf')) { Swal.fire({ html: `<iframe src="${dataUrl}" style="width:100%; height:75vh; border:none; border-radius:8px;"></iframe>`, showConfirmButton: false, width: '90%', padding: '10px', showCloseButton: true });
        } else { Swal.fire({ imageUrl: dataUrl, imageAlt: 'Scanned Document', showConfirmButton: false, width: '80%', padding: '0', background: 'transparent', showCloseButton: true }); }
    },

    calculateAdditionalFees: function(quiet = false) {
        let totalMedFee = 0; let totalXrayFee = 0;
        
        const getPrice = (id) => { 
            if(!id) return 0; 
            let m = this.medsList.find(x => String(x.id||x) === String(id)); 
            if(m && m.price) return parseFloat(m.price)||0; 
            let inv = this.inventoryItems.find(x => String(x.id||x) === String(id)); 
            if(inv && inv.price) return parseFloat(inv.price)||0; 
            return 0; 
        };
        
        let dItem = document.getElementById('vd-dialysate-item'); let dQty = document.getElementById('vd-dialysate-qty');
        let sItem = document.getElementById('vd-saline-item'); let sQty = document.getElementById('vd-saline-qty');
        let hItem = document.getElementById('vd-heparin-item'); let hQty = document.getElementById('vd-heparin-qty');

        if(dItem && dQty) totalMedFee += getPrice(dItem.value) * (parseFloat(dQty.value) || 0);
        if(sItem && sQty) totalMedFee += getPrice(sItem.value) * (parseFloat(sQty.value) || 0);
        if(hItem && hQty) totalMedFee += getPrice(hItem.value) * (parseFloat(hQty.value) || 0);

        this.currentMeds.forEach(m => { if(m.id && parseFloat(m.qty) > 0) totalMedFee += getPrice(m.id) * parseFloat(m.qty); });
        this.currentXrays.forEach(x => { if(x.id && parseFloat(x.qty) > 0) { let xI = this.xraysList.find(i => String(i.id||i) === String(x.id)); if(xI && xI.price) totalXrayFee += parseFloat(xI.price) * parseFloat(x.qty); } });
        
        const medInput = document.getElementById('vd-med-fee');
        const xrayInput = document.getElementById('vd-xray-fee');
        
        if (medInput && (totalMedFee > 0 || quiet !== true)) medInput.value = totalMedFee || 0;
        if (xrayInput && (totalXrayFee > 0 || quiet !== true)) xrayInput.value = totalXrayFee || 0;

        this.onModeChange(); this.onRightChange();
        
        if(quiet !== true) {
            Swal.fire({ title: 'คำนวณสำเร็จ', text: 'ระบบรวมยอดค่ายา และ X-Ray ให้เรียบร้อยแล้ว', icon: 'success', timer: 1500, showConfirmButton: false });
        }
    },

    renderModalityDropdown: function() { const select = document.getElementById('vd-mode'); if(!select) return; let currentVal = select.value || (this.visitData ? this.visitData.hd_mode : ''); let html = '<option value="">-- เลือกโหมด --</option>'; this.modalities.forEach(m => { html += '<option value="' + m.name + '">' + m.name + '</option>'; }); select.innerHTML = html; if(currentVal) select.value = currentVal; },
    renderRightDropdown: function() { const select = document.getElementById('vd-right'); if(!select) return; let currentVal = select.value || (this.visitData ? this.visitData.right : ''); let html = '<option value="">-- เลือกสิทธิ --</option>'; this.clinicRights.forEach(r => { html += '<option value="' + r.name + '">' + r.name + '</option>'; }); select.innerHTML = html; if(currentVal) select.value = currentVal; },
    onModeChange: function() { const modeObj = this.modalities.find(m => m.name === document.getElementById('vd-mode').value); if (modeObj && modeObj.price > 0) document.getElementById('vd-dialysis-fee').value = modeObj.price; },
    onRightChange: function() { const rightObj = this.clinicRights.find(r => r.name === document.getElementById('vd-right').value); if (rightObj && rightObj.price !== undefined) document.getElementById('vd-dialysis-fee').value = rightObj.price; },

    refreshDropdownsUI: function() {
        if (!this.isFormLoaded) return; 
        let dEl = document.getElementById('vd-dialysate-item'); let sEl = document.getElementById('vd-saline-item'); let hEl = document.getElementById('vd-heparin-item');
        if(dEl) { dEl.innerHTML = this.generateMedOptions(dEl.value || this.visitData.hd_dialysate_item); dEl.value = this.visitData.hd_dialysate_item || ''; }
        if(sEl) { sEl.innerHTML = this.generateMedOptions(sEl.value || this.visitData.hd_saline_item); sEl.value = this.visitData.hd_saline_item || ''; }
        if(hEl) { hEl.innerHTML = this.generateMedOptions(hEl.value || this.visitData.hd_heparin_item); hEl.value = this.visitData.hd_heparin_item || ''; }
        this.renderOtherMeds(); 
    },

    generateMedOptions: function(selectedId) {
        let html = '<option value="">-- เลือกรายการ --</option>';
        if (this.medsList.length > 0) { html += '<optgroup label="📋 ยาและเวชภัณฑ์มาตรฐาน">'; this.medsList.forEach(m => { html += '<option value="' + (m.id||m) + '" ' + (String(m.id||m) === String(selectedId) ? 'selected' : '') + '>' + (m.name||m) + '</option>'; }); html += '</optgroup>'; }
        let categories = [...new Set(this.inventoryItems.map(i => i.category || 'ทั่วไป'))];
        categories.forEach(cat => { let items = this.inventoryItems.filter(i => (i.category || 'ทั่วไป') === cat); if (items.length > 0) { html += '<optgroup label="📦 คลังพัสดุ: ' + cat + '">'; items.forEach(i => { let stock = (Number(i.qty_sub)||0) + (Number(i.qty_main)||0); html += '<option value="' + (i.id||i) + '" ' + (String(i.id||i) === String(selectedId) ? 'selected' : '') + '>' + (i.name||i) + ' (คงเหลือ: ' + stock + ')</option>'; }); html += '</optgroup>'; } });
        return html;
    },

    renderOtherMeds: function() {
        let container = document.getElementById('vd-other-meds-container'); if(!container) return;
        if (this.currentMeds.length === 0) { container.innerHTML = '<div class="text-muted small text-center mb-1" style="font-size:13px;">ยังไม่มียาฉีดเพิ่มเติม</div>'; return; }
        let html = ''; this.currentMeds.forEach((m, idx) => { 
            let dis = this.isStockDeducted ? 'disabled' : ''; 
            html += '<div class="d-flex flex-wrap flex-md-nowrap gap-2 mb-2 align-items-center w-100"><select class="form-select input-modern flex-grow-1 min-w-0 fw-bold text-dark" onchange="VisitDetailPage.updateMed(' + idx + ', \'id\', this.value)" ' + dis + '>' + this.generateMedOptions(m.id) + '</select><input type="number" class="form-control text-center fw-bold text-primary input-modern flex-shrink-0" style="width: 80px;" placeholder="จำนวน" value="' + (m.qty||'') + '" onkeyup="VisitDetailPage.updateMed(' + idx + ', \'qty\', this.value)" onchange="VisitDetailPage.updateMed(' + idx + ', \'qty\', this.value)" ' + dis + '><button class="btn btn-light border border-danger-subtle text-danger shadow-sm flex-shrink-0" style="width: 40px; height: 40px; border-radius: 10px; padding:0;" onclick="VisitDetailPage.removeMed(' + idx + ')" ' + dis + '><i class="fa-solid fa-trash"></i></button></div>'; 
        }); 
        container.innerHTML = html;
    },
    addOtherMed: function() { if(this.isStockDeducted) return; this.currentMeds.push({ id: '', qty: '' }); this.renderOtherMeds(); }, 
    updateMed: function(idx, k, v) { this.currentMeds[idx][k] = v; this.calculateAdditionalFees(true); }, 
    removeMed: function(idx) { if(this.isStockDeducted) return; this.currentMeds.splice(idx, 1); this.renderOtherMeds(); this.calculateAdditionalFees(true); },

    generateXrayOptions: function(selectedId) { let html = '<option value="">-- เลือกรายการเอ็กซเรย์ --</option>'; this.xraysList.forEach(x => { html += '<option value="' + (x.id||x) + '" ' + (String(x.id||x) === String(selectedId) ? 'selected' : '') + '>' + (x.name||x) + '</option>'; }); return html; },
    renderXrays: function() {
        let container = document.getElementById('vd-xrays-container'); if (!container) return;
        if (this.currentXrays.length === 0) { container.innerHTML = '<div class="text-muted small text-center mb-1" style="font-size:13px;">ยังไม่มีรายการเอ็กซเรย์</div>'; return; }
        let html = ''; this.currentXrays.forEach((x, idx) => { html += '<div class="d-flex flex-wrap flex-md-nowrap gap-2 mb-2 align-items-center w-100"><select class="form-select input-modern flex-grow-1 min-w-0 fw-bold text-dark" onchange="VisitDetailPage.updateXray(' + idx + ', \'id\', this.value)">' + this.generateXrayOptions(x.id) + '</select><input type="number" class="form-control text-center fw-bold text-info input-modern flex-shrink-0" style="width: 80px;" placeholder="รอบ" value="' + (x.qty||'') + '" onkeyup="VisitDetailPage.updateXray(' + idx + ', \'qty\', this.value)" onchange="VisitDetailPage.updateXray(' + idx + ', \'qty\', this.value)"><button class="btn btn-light border border-danger-subtle text-danger shadow-sm flex-shrink-0" style="width: 40px; height: 40px; border-radius: 10px; padding:0;" onclick="VisitDetailPage.removeXray(' + idx + ')"><i class="fa-solid fa-trash"></i></button></div>'; }); container.innerHTML = html;
    },
    addXray: function() { this.currentXrays.push({ id: '', qty: '' }); this.renderXrays(); }, 
    updateXray: function(idx, k, v) { this.currentXrays[idx][k] = v; this.calculateAdditionalFees(true); }, 
    removeXray: function(idx) { this.currentXrays.splice(idx, 1); this.renderXrays(); this.calculateAdditionalFees(true); },

    renderNoteTemplateDropdown: function() { const select = document.getElementById('vd-note-template'); if(!select) return; let html = '<option value="">-- เลือกเทมเพลต --</option>'; const catMap = { 'pre': 'ก่อนฟอก', 'intra': 'แทรกซ้อน', 'post': 'หลังฟอก', 'doctor': 'คำสั่งแพทย์', 'general': 'ทั่วไป' }; this.noteTemplates.forEach(t => { html += '<option value="' + t.id + '">[' + (catMap[t.category]||t.category||'ทั่วไป') + '] ' + (t.title || t.name) + '</option>'; }); select.innerHTML = html; },
    applyNoteTemplate: function(id) { if(!id) return; const t = this.noteTemplates.find(x => String(x.id) === String(id)); if(t) { const noteEl = document.getElementById('vd-note'); let textToAppend = (t.text || '').replace(/\\n/g, '\n'); noteEl.value = noteEl.value.trim() ? noteEl.value.trim() + '\n\n' + textToAppend : textToAppend; } document.getElementById('vd-note-template').value = ''; },

    renderLabSetDropdown: function() { const select = document.getElementById('vd-lab-set-select'); if(!select) return; let html = '<option value="">- เลือกชุดแล็บ -</option>'; this.labSets.forEach(s => html += '<option value="' + s.id + '">' + s.name + '</option>'); select.innerHTML = html; },
    applyLabSet: function() {
        const setId = document.getElementById('vd-lab-set-select').value; if(!setId) return; const setObj = this.labSets.find(s => String(s.id) === String(setId)); if(!setObj) return;
        if (setObj.price) document.getElementById('vd-lab-fee').value = (Number(document.getElementById('vd-lab-fee').value)||0) + Number(setObj.price);
        setObj.items.forEach(i => { if(!this.currentLabs.some(l => l.name === i)) this.currentLabs.push({ name: i, value: '' }); });
        this.renderLabs(); document.getElementById('vd-lab-set-select').value = '';
    },
    renderLabs: function() {
        const container = document.getElementById('vd-labs-container'); if(this.currentLabs.length === 0) { container.innerHTML = '<div class="col-12 text-muted small text-center py-3" style="font-size:13px;">ยังไม่ได้ดึงชุดทดสอบทางห้องปฏิบัติการ</div>'; return; }
        let html = ''; this.currentLabs.forEach((lab, idx) => { html += '<div class="col-6"><div class="d-flex shadow-sm bg-white" style="border-radius: 8px; border: 1px solid #fecaca; overflow: hidden;"><div class="bg-danger-subtle text-danger fw-bold px-2 d-flex align-items-center justify-content-center flex-shrink-0" style="width: 45%; font-size:12px; border-right: 1px solid #fecaca; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="' + lab.name + '">' + lab.name + '</div><input type="text" class="form-control border-0 text-dark fw-bold px-2 text-center bg-transparent min-w-0" style="box-shadow:none; outline:none; font-size:13px;" value="' + (lab.value||'') + '" onchange="VisitDetailPage.updateLab(' + idx + ', this.value)" placeholder="-"><button class="btn btn-light text-danger border-0 px-2 rounded-0 flex-shrink-0" style="background:transparent; border-left: 1px solid #fecaca !important; width: 30px; padding:0;" onclick="VisitDetailPage.removeLab(' + idx + ')"><i class="fa-solid fa-times"></i></button></div></div>'; }); container.innerHTML = html;
    },
    addLabRow: function() { Swal.fire({ title: 'ระบุชื่อตัวแปรที่ตรวจแล็บ', input: 'text', inputPlaceholder: 'เช่น HbA1c', showCancelButton: true, confirmButtonText: 'เพิ่ม' }).then(r => { if(r.isConfirmed && r.value.trim()) { this.currentLabs.push({ name: r.value.trim(), value: '' }); this.renderLabs(); } }); },
    updateLab: function(idx, val) { this.currentLabs[idx].value = val; }, removeLab: function(idx) { this.currentLabs.splice(idx, 1); this.renderLabs(); },

    updateDeductStateUI: function() {
        const btn = document.getElementById('btn-deduct-stock'); const badge = document.getElementById('vd-deduct-status-badge'); const addMedBtn = document.getElementById('btn-add-med');
        if(this.isStockDeducted) {
            btn.innerHTML = '<i class="fa-solid fa-rotate-left me-2"></i> ยกเลิก/คืนคลัง'; btn.className = 'btn btn-outline-danger shadow-sm fw-bold px-4 py-2 bg-white w-100 fs-6';
            badge.innerHTML = '<span class="badge badge-soft-success px-3 py-1 fs-6 shadow-sm rounded-pill"><i class="fa-solid fa-check-circle me-1"></i> ตัดสต๊อกแล้ว</span>';
            addMedBtn.style.display = 'none'; ['vd-dialysate-item', 'vd-dialysate-qty', 'vd-saline-item', 'vd-saline-qty', 'vd-heparin-item', 'vd-heparin-qty'].forEach(id => { let el = document.getElementById(id); if(el) el.disabled = true; });
        } else {
            btn.innerHTML = '<i class="fa-solid fa-box-open me-2"></i> ยืนยันตัดเบิกพัสดุ'; btn.className = 'btn btn-premium btn-premium-warning shadow-sm fw-bold px-4 py-2 w-100 fs-6';
            badge.innerHTML = '<span class="badge bg-light text-muted border px-3 py-1 shadow-sm rounded-pill"><i class="fa-solid fa-hourglass-half me-1"></i> รอยืนยัน</span>';
            addMedBtn.style.display = 'block'; ['vd-dialysate-item', 'vd-dialysate-qty', 'vd-saline-item', 'vd-saline-qty', 'vd-heparin-item', 'vd-heparin-qty'].forEach(id => { let el = document.getElementById(id); if(el) el.disabled = false; });
        }
        this.renderOtherMeds(); 
    },

    deductStock: async function() {
        if(this.isStockDeducted) {
            Swal.fire({ title: 'คืนของกลับเข้าคลัง?', text: 'คุณต้องการยกเลิกการเบิกพัสดุรอบนี้ใช่หรือไม่?', icon: 'warning', showCancelButton: true, confirmButtonText: 'ยืนยัน', confirmButtonColor: '#ef4444' }).then(async res => {
                if(res.isConfirmed) {
                    Swal.fire({title:'กำลังคืนของ...', didOpen:()=>Swal.showLoading()});
                    let snap = await db.ref('inventory_database_v2/items').once('value'); let allItems = snap.val() ? Object.keys(snap.val()).map(k => snap.val()[k]) : [];
                    let logsToPush = []; let timestamp = new Date().toISOString();
                    (this.visitData.deducted_log || []).forEach(req => {
                        let idx = allItems.findIndex(x => String(x.id) === String(req.id));
                        if(idx !== -1) { allItems[idx].qty_sub = (Number(allItems[idx].qty_sub) || 0) + req.qty; logsToPush.push({ timestamp, mode: 'in_sub_restore', itemId: req.id, itemName: allItems[idx].name, qty: req.qty, user: App.currentUser?App.currentUser.name:'Admin', note: 'ยกเลิกเบิก HN: ' + this.visitData.hn }); }
                    });
                    await db.ref('inventory_database_v2/items').set(allItems); for(let log of logsToPush) { await db.ref('inventory_database_v2/transactions').push(log); }
                    this.isStockDeducted = false; this.visitData.deducted_log = null; this.updateDeductStateUI(); this.saveData(true); 
                    Swal.fire('สำเร็จ', 'ระบบดึงของคืนคลังเรียบร้อยแล้ว', 'success');
                }
            }); return;
        }

        let itemsToDeduct = [];
        const addIfValid = (id, qtyStr) => { let q = parseFloat(qtyStr); if(id && q > 0) { let n = 'Unknown'; let inv = this.inventoryItems.find(i=>String(i.id)===String(id)); if(inv) n = inv.name; else { let m = this.medsList.find(i=>String(i.id||i)===String(id)); if(m) n = m.name||m; } itemsToDeduct.push({id, qty: q, name: n}); } };

        addIfValid(document.getElementById('vd-dialysate-item').value, document.getElementById('vd-dialysate-qty').value);
        addIfValid(document.getElementById('vd-saline-item').value, document.getElementById('vd-saline-qty').value);
        addIfValid(document.getElementById('vd-heparin-item').value, document.getElementById('vd-heparin-qty').value);
        this.currentMeds.forEach(m => addIfValid(m.id, m.qty));

        if(itemsToDeduct.length === 0) { Swal.fire('ไม่มีรายการ', 'กรุณาระบุรายการยาและจำนวนที่เบิก', 'warning'); return; }
        let summaryHtml = itemsToDeduct.map(i => '<li>' + i.name + ' => เบิก <b>' + i.qty + '</b></li>').join('');

        Swal.fire({ title: 'ยืนยันการตัดเบิกสต๊อก?', html: '<ul class="text-start text-primary mb-3" style="font-family:\'Prompt\';">' + summaryHtml + '</ul>', icon: 'question', showCancelButton: true, confirmButtonText: 'ยืนยัน', confirmButtonColor: '#10b981' }).then(async res => {
            if(res.isConfirmed) {
                Swal.fire({title:'กำลังประมวลผล...', didOpen:()=>Swal.showLoading()});
                let snap = await db.ref('inventory_database_v2/items').once('value'); let allItems = snap.val() ? Object.keys(snap.val()).map(k => snap.val()[k]) : [];
                let logs = []; let timestamp = new Date().toISOString(); let user = App.currentUser ? App.currentUser.name : 'Unknown';
                itemsToDeduct.forEach(req => {
                    let idx = allItems.findIndex(x => String(x.id) === String(req.id));
                    if(idx !== -1) { allItems[idx].qty_sub = (Number(allItems[idx].qty_sub) || 0) - req.qty; allItems[idx].last_update = timestamp; logs.push({ timestamp, mode: 'out_sub', itemId: req.id, itemName: req.name, qty: req.qty, user, note: 'ตัดเบิก Flowsheet HN: ' + this.visitData.hn }); }
                });
                await db.ref('inventory_database_v2/items').set(allItems); for(let log of logs) { await db.ref('inventory_database_v2/transactions').push(log); }
                this.isStockDeducted = true; this.visitData.deducted_log = itemsToDeduct; this.updateDeductStateUI(); this.saveData(true); 
                Swal.fire('ตัดเบิกสำเร็จ', 'ระบบหักสต๊อกเรียบร้อยแล้ว', 'success');
            }
        });
    },

    saveData: function(quietMode = false) {
        if(!quietMode) Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const updatedData = {
            ...this.visitData, status: document.getElementById('vd-status').value, hd_dialyzer: document.getElementById('vd-dialyzer').value.trim(), hd_mode: document.getElementById('vd-mode').value, right: document.getElementById('vd-right').value, 
            dialysis_fee: Number(document.getElementById('vd-dialysis-fee').value) || 0, med_fee: Number(document.getElementById('vd-med-fee').value) || 0, lab_fee: Number(document.getElementById('vd-lab-fee').value) || 0, xray_fee: Number(document.getElementById('vd-xray-fee').value) || 0,
            hd_qb: document.getElementById('vd-qb').value.trim(), hd_qd: document.getElementById('vd-qd').value.trim(), hd_uf: document.getElementById('vd-uf').value.trim(), pre_wt: document.getElementById('vd-pre-wt').value.trim(), post_wt: document.getElementById('vd-post-wt').value.trim(), pre_bp: document.getElementById('vd-pre-bp').value.trim(), post_bp: document.getElementById('vd-post-bp').value.trim(), cc: document.getElementById('vd-cc').value.trim(), note: document.getElementById('vd-note').value.trim(), hd_dialysate_item: document.getElementById('vd-dialysate-item').value, hd_dialysate_qty: document.getElementById('vd-dialysate-qty').value, hd_saline_item: document.getElementById('vd-saline-item').value, hd_saline_qty: document.getElementById('vd-saline-qty').value, hd_heparin_item: document.getElementById('vd-heparin-item').value, hd_heparin_qty: document.getElementById('vd-heparin-qty').value, 
            other_meds: this.currentMeds, xray_list: this.currentXrays, lab_results: this.currentLabs, attachments: this.currentAttachments, is_stock_deducted: this.isStockDeducted, last_updated: new Date().toISOString(), updated_by: App.currentUser ? App.currentUser.name : 'Unknown'
        };

        Promise.all([ db.ref('patients_database_v2/visits').once('value'), db.ref('patients_database_v2/patients').once('value') ]).then(([vSnap, pSnap]) => {
            let visitList = vSnap.val() ? Object.keys(vSnap.val()).map(k => vSnap.val()[k]) : []; let vIndex = visitList.findIndex(v => String(v.id) === String(this.visitId));
            if (vIndex !== -1) visitList[vIndex] = updatedData; else visitList.push(updatedData);

            let patientList = pSnap.val() ? Object.keys(pSnap.val()).map(k => pSnap.val()[k]) : []; let pIndex = patientList.findIndex(p => String(p.hn) === String(this.visitData.hn));
            
            if (pIndex !== -1) {
                let pt = patientList[pIndex]; pt.right = document.getElementById('vd-right').value;
                if (!pt.history) pt.history = []; if (!pt.labs) pt.labs = []; if (!pt.medications) pt.medications = [];
                let emrHistoryEntry = { id: this.visitId, date: this.visitData.date, bp: updatedData.post_bp || updatedData.pre_bp || '-', weight: updatedData.post_wt || updatedData.pre_wt || '-', cc: updatedData.cc || '-', note: updatedData.note || '-', doctor: updatedData.updated_by };
                let hIndex = pt.history.findIndex(h => String(h.id) === String(this.visitId)); if (hIndex !== -1) pt.history[hIndex] = emrHistoryEntry; else pt.history.push(emrHistoryEntry);

                const getMedName = (id) => { let f = this.inventoryItems.find(i => String(i.id) === String(id)) || this.medsList.find(m => String(m.id||m) === String(id)); return f ? (f.name||f) : 'ไม่ทราบชื่อ'; };
                let newMeds = [];
                if (updatedData.hd_dialysate_item) newMeds.push({ name: getMedName(updatedData.hd_dialysate_item), dosage: updatedData.hd_dialysate_qty ? updatedData.hd_dialysate_qty + ' แกลลอน' : '-' });
                if (updatedData.hd_saline_item) newMeds.push({ name: getMedName(updatedData.hd_saline_item), dosage: updatedData.hd_saline_qty ? updatedData.hd_saline_qty + ' ขวด' : '-' });
                if (updatedData.hd_heparin_item) newMeds.push({ name: getMedName(updatedData.hd_heparin_item), dosage: updatedData.hd_heparin_qty ? updatedData.hd_heparin_qty + ' Vial' : '-' });
                if (Array.isArray(updatedData.other_meds)) updatedData.other_meds.forEach(m => { if (m.id) newMeds.push({ name: getMedName(m.id), dosage: m.qty ? m.qty + ' หน่วย' : '-' }); });
                pt.medications = newMeds; 

                if (Array.isArray(updatedData.lab_results)) {
                    let labObj = { id: 'LAB_' + this.visitId, date: this.visitData.date }; let hasAnyValue = false;
                    updatedData.lab_results.forEach(l => { let k = (l.name || "").toLowerCase(); let val = l.value !== undefined ? l.value : ''; if(String(val).trim() !== '') hasAnyValue = true; if(k.includes('bun')) labObj.bun = val; else if(k.includes('cr')||k==='creatinine') labObj.cr = val; else if(k.includes('k')||k.includes('potassium')) labObj.k = val; else if(k.includes('ca')||k.includes('calcium')) labObj.ca = val; else if(k.includes('p')||k.includes('phos')) labObj.p = val; else if(k.includes('hct')||k.includes('hgb')||k.includes('ht')) labObj.hct = val; });
                    let labIdx = pt.labs.findIndex(l => String(l.id) === String(labObj.id));
                    if (labIdx !== -1) { if (hasAnyValue) pt.labs[labIdx] = { ...pt.labs[labIdx], ...labObj }; else pt.labs.splice(labIdx, 1); } else if (hasAnyValue) { pt.labs.push(labObj); }
                }
                patientList[pIndex] = pt; 
            }
            Promise.all([ db.ref('patients_database_v2/visits').set(visitList), db.ref('patients_database_v2/patients').set(patientList) ]).then(() => {
                if(!quietMode) Swal.fire({ title: 'บันทึกสำเร็จ!', text: 'เชื่อมโยงเข้าแฟ้ม EMR ถาวรและสแกนแนบไฟล์เรียบร้อย', icon: 'success', timer: 1500, showConfirmButton: false }).then(() => App.switchPage('visits')); 
            });
        });
    },
    manageModalities: function() { let h = '<div class="list-group mb-3 text-start shadow-sm" style="border-radius:12px; overflow:hidden;">'; this.modalities.forEach(m => { h += '<div class="list-group-item d-flex justify-content-between align-items-center p-3 bg-white"><div><div class="fw-bold text-dark" style="font-size:15px;">' + m.name + '</div><div class="text-info fw-bold small"><i class="fa-solid fa-tag me-1"></i> ค่าบริการ: ฿' + Number(m.price||0).toLocaleString() + '</div></div><div><button class="btn btn-sm btn-light shadow-sm me-1" onclick="Swal.close(); setTimeout(()=>VisitDetailPage.editModality(\'' + m.id + '\'),300)"><i class="fa-solid fa-pen text-warning"></i></button><button class="btn btn-sm btn-light shadow-sm" onclick="Swal.close(); setTimeout(()=>VisitDetailPage.deleteModality(\'' + m.id + '\'),300)"><i class="fa-solid fa-trash text-danger"></i></button></div></div>'; }); h += '</div>'; Swal.fire({ title: '<h4 class="fw-bold text-info"><i class="fa-solid fa-gear"></i> ตั้งค่าโหมดฟอกไต</h4>', html: h, showCancelButton: true, confirmButtonText: '+ เพิ่มโหมด', confirmButtonColor: '#0ea5e9', cancelButtonText: 'ปิด' }).then(r => { if(r.isConfirmed) setTimeout(() => this.editModality(null), 300); }); },
    editModality: function(id) { let m = id ? this.modalities.find(x => String(x.id) === String(id)) : { name: '', price: 1500 }; Swal.fire({ title: '<h5 class="fw-bold">' + (id?'แก้ไขโหมด':'เพิ่มโหมด') + '</h5>', html: '<div class="text-start mt-3"><label class="fw-bold small text-secondary">ชื่อโหมด</label><input type="text" id="swal-mod-name" class="form-control mb-3" value="' + m.name + '"><label class="fw-bold small text-secondary">ราคา</label><input type="number" id="swal-mod-price" class="form-control" value="' + (m.price||0) + '"></div>', showCancelButton: true, confirmButtonText: 'บันทึก', confirmButtonColor: '#10b981', preConfirm: () => { let n = document.getElementById('swal-mod-name').value.trim(); let p = document.getElementById('swal-mod-price').value; if(!n) return Swal.showValidationMessage('กรุณากรอกชื่อ'); return { id: id||'MOD'+Date.now(), name: n, price: Number(p) }; } }).then(res => { if(res.isConfirmed) { let u = [...this.modalities]; if(id) u[u.findIndex(x=>String(x.id)===String(id))] = res.value; else u.push(res.value); db.ref('clinic_modalities_v2').set(u).then(() => { this.modalities = u; this.renderModalityDropdown(); Swal.fire({title:'บันทึกสำเร็จ', icon:'success', timer:1000, showConfirmButton:false}).then(()=>this.manageModalities()); }); } else if(res.isDismissed) this.manageModalities(); }); },
    deleteModality: function(id) { Swal.fire({ title: 'ลบหรือไม่?', icon: 'warning', showCancelButton: true, confirmButtonText: 'ลบ', confirmButtonColor: '#ef4444' }).then(r => { if(r.isConfirmed) { let u = this.modalities.filter(x=>String(x.id)!==String(id)); db.ref('clinic_modalities_v2').set(u).then(() => { this.modalities = u; this.renderModalityDropdown(); Swal.fire({title:'ลบสำเร็จ', icon:'success', timer:1000, showConfirmButton:false}).then(()=>this.manageModalities()); }); } else this.manageModalities(); }); },
    manageRights: function() { let h = '<div class="list-group mb-3 text-start shadow-sm" style="border-radius:12px; overflow:hidden;">'; this.clinicRights.forEach(r => { h += '<div class="list-group-item d-flex justify-content-between align-items-center p-3 bg-white"><div><div class="fw-bold text-dark" style="font-size:15px;">' + r.name + '</div><div class="text-success fw-bold small"><i class="fa-solid fa-tag me-1"></i> ราคา: ฿' + Number(r.price||0).toLocaleString() + '</div></div><div><button class="btn btn-sm btn-light shadow-sm me-1" onclick="Swal.close(); setTimeout(()=>VisitDetailPage.editRight(\'' + r.id + '\'),300)"><i class="fa-solid fa-pen text-warning"></i></button><button class="btn btn-sm btn-light shadow-sm" onclick="Swal.close(); setTimeout(()=>VisitDetailPage.deleteRight(\'' + r.id + '\'),300)"><i class="fa-solid fa-trash text-danger"></i></button></div></div>'; }); h += '</div>'; Swal.fire({ title: '<h4 class="fw-bold text-success"><i class="fa-solid fa-shield-heart"></i> ตั้งค่าสิทธิการรักษา</h4>', html: h, showCancelButton: true, confirmButtonText: '+ เพิ่มสิทธิ', confirmButtonColor: '#10b981', cancelButtonText: 'ปิด' }).then(r => { if(r.isConfirmed) setTimeout(() => this.editRight(null), 300); }); },
    editRight: function(id) { let m = id ? this.clinicRights.find(x => String(x.id) === String(id)) : { name: '', price: 1500 }; Swal.fire({ title: '<h5 class="fw-bold">' + (id?'แก้ไขสิทธิ':'เพิ่มสิทธิ') + '</h5>', html: '<div class="text-start mt-3"><label class="fw-bold small text-secondary">ชื่อสิทธิ</label><input type="text" id="swal-right-name" class="form-control mb-3" value="' + m.name + '"><label class="fw-bold small text-secondary">ราคา</label><input type="number" id="swal-right-price" class="form-control" value="' + (m.price||0) + '"></div>', showCancelButton: true, confirmButtonText: 'บันทึก', confirmButtonColor: '#10b981', preConfirm: () => { let n = document.getElementById('swal-right-name').value.trim(); let p = document.getElementById('swal-right-price').value; if(!n) return Swal.showValidationMessage('กรุณากรอกชื่อ'); return { id: id||'R'+Date.now(), name: n, price: Number(p) }; } }).then(res => { if(res.isConfirmed) { let u = [...this.clinicRights]; if(id) u[u.findIndex(x=>String(x.id)===String(id))] = res.value; else u.push(res.value); db.ref('clinic_rights_v2').set(u).then(() => { this.clinicRights = u; this.renderRightDropdown(); Swal.fire({title:'บันทึกสำเร็จ', icon:'success', timer:1000, showConfirmButton:false}).then(()=>this.manageRights()); }); } else if(res.isDismissed) this.manageRights(); }); },
    deleteRight: function(id) { Swal.fire({ title: 'ลบหรือไม่?', icon: 'warning', showCancelButton: true, confirmButtonText: 'ลบ', confirmButtonColor: '#ef4444' }).then(r => { if(r.isConfirmed) { let u = this.clinicRights.filter(x=>String(x.id)!==String(id)); db.ref('clinic_rights_v2').set(u).then(() => { this.clinicRights = u; this.renderRightDropdown(); Swal.fire({title:'ลบสำเร็จ', icon:'success', timer:1000, showConfirmButton:false}).then(()=>this.manageRights()); }); } else this.manageRights(); }); }
}; 