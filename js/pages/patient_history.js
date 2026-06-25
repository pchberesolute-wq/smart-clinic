// js/pages/patient_history.js
// 🚀 โมดูลประวัติการรักษาเชิงลึก (Bulletproof Anti-Crash Edition)

const PatientHistoryPage = {
    hn: null, patientData: null, chartInstance: null, allVisits: [], invItems: [], medItems: [], xraysList: [], allPatientsList: [],
    timelineLimit: 15, labLimit: 15, docLimit: 16,
    currentTimelineFilter: '', currentLabFilter: '', currentXrayFilter: '', currentDocFilter: '', currentVitalsFilter: '', currentMedsFilter: '',

    html: `
        <style>
            * { -webkit-font-smoothing: antialiased !important; -moz-osx-font-smoothing: grayscale !important; text-rendering: optimizeLegibility !important; }
            .form-label, .text-secondary, .text-muted { color: #334155 !important; font-weight: 600 !important; letter-spacing: 0.2px; }
            
            .btn-outline-dark.bg-white:hover, .btn-outline-dark.bg-white:hover * { background-color: #0f172a !important; border-color: #0f172a !important; color: #ffffff !important; }
            .btn-outline-primary.bg-white:hover, .btn-outline-primary.bg-white:hover * { background-color: #3b82f6 !important; border-color: #3b82f6 !important; color: #ffffff !important; }
            
            .emr-nav-tabs-container { margin-bottom: 20px; width: 100%; border-radius: 20px; background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.02); padding: 6px; }
            .emr-nav-tabs { 
                display: flex; flex-wrap: nowrap; overflow-x: auto; overflow-y: hidden; 
                gap: 6px; margin: 0; padding: 4px; list-style: none;
                -webkit-overflow-scrolling: touch; scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent;
            }
            .emr-nav-tabs::-webkit-scrollbar { height: 6px; }
            .emr-nav-tabs::-webkit-scrollbar-track { background: transparent; }
            .emr-nav-tabs::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 10px; }
            .emr-nav-tabs::-webkit-scrollbar-thumb:hover { background-color: #cbd5e1; }

            .emr-nav-tabs .nav-link { 
                flex: 0 0 auto; 
                color: var(--muted); border: none; background: transparent; 
                transition: all 0.2s ease; padding: 10px 20px; font-size: 14.5px; 
                border-radius: 14px; font-family: 'Prompt'; font-weight: 700;
            }
            .emr-nav-tabs .nav-link:hover { background: var(--bg-main); color: var(--text-dark); }
            .emr-nav-tabs .nav-link.active { background: var(--primary-light); color: var(--primary); border: 1px solid #bfdbfe; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1); }
            
            .emr-nav-tabs .nav-link.active[data-bs-target="#tab-vitals"] { background: var(--success-light); color: var(--success-dark); border-color: #bbf7d0; box-shadow: 0 2px 4px rgba(34, 197, 94, 0.1); }
            .emr-nav-tabs .nav-link.active[data-bs-target="#tab-labs"] { background: var(--danger-light); color: var(--danger-dark); border-color: #fecaca; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.1); }
            .emr-nav-tabs .nav-link.active[data-bs-target="#tab-xrays"] { background: var(--info-light); color: var(--info-dark); border-color: #bae6fd; box-shadow: 0 2px 4px rgba(14, 165, 233, 0.1); }
            .emr-nav-tabs .nav-link.active[data-bs-target="#tab-docs"] { background: var(--primary); color: white; border-color: var(--primary-dark); box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2); }
            .emr-nav-tabs .nav-link.active[data-bs-target="#tab-meds"] { background: var(--warning-light); color: var(--warning-dark); border-color: #fde68a; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.1); }
            
            .timeline-point { position: absolute; left: -36px; top: 0; width: 20px; height: 20px; border-radius: 50%; background: var(--primary-gradient); border: 4px solid #fff; box-shadow: 0 0 0 3px #bfdbfe; }
            
            .doc-thumb-card { border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; overflow: hidden; transition: all 0.2s; height: 100%; display: flex; flex-direction: column; cursor: pointer; }
            .doc-thumb-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(37,99,235,0.15); border-color: #93c5fd; }
            .doc-img-container { height: 140px; background: #f8fafc; display: flex; align-items: center; justify-content: center; overflow: hidden; border-bottom: 1px solid #e2e8f0; }
            .doc-img-container img { width: 100%; height: 100%; object-fit: cover; }

            .emr-scroll-area { max-height: 58vh; overflow-y: auto; overflow-x: hidden; padding-right: 10px; }
            .emr-scroll-area::-webkit-scrollbar { width: 6px; }
            .emr-scroll-area::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
            .emr-scroll-area::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            .emr-scroll-area::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        </style>

        <div id="ph-search-screen" style="display: none; max-width: 800px; margin: 40px auto;">
            <div class="text-center mb-4">
                <div class="d-inline-flex align-items-center justify-content-center text-white rounded-circle shadow-sm mb-3" style="width: 80px; height: 80px; background: var(--primary-gradient);">
                    <i class="fa-solid fa-folder-open fa-3x"></i>
                </div>
                <h2 class="fw-bold text-dark" style="font-family:'Prompt';">ค้นหาแฟ้มประวัติผู้ป่วย (EMR)</h2>
                <p class="text-muted fw-bold">พิมพ์ ชื่อ, สกุล, HN หรือ เลขบัตรประชาชน เพื่อค้นหาประวัติการรักษา</p>
            </div>
            
            <div class="search-box-modern shadow-sm mb-4 mx-auto" style="padding: 15px 30px; max-width: 600px;">
                <i class="fa-solid fa-search text-primary fa-lg"></i>
                <input type="text" id="ph-search-input" class="border-0 bg-transparent ms-3 w-100 fw-bold text-dark" placeholder="พิมพ์ชื่อคนไข้ หรือ HN..." style="outline: none; font-size: 18px; font-family:'Prompt';" onkeyup="PatientHistoryPage.searchPatients(this.value)">
            </div>

            <div id="ph-search-loading" class="text-center py-4" style="display:none;"><i class="fas fa-spinner fa-spin fa-2x text-primary"></i></div>
            <div id="ph-search-results" class="row g-3"></div>
        </div>

        <div id="ph-main-screen" style="display: none;">
            <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <button class="btn btn-light mb-2 shadow-sm fw-bold rounded-pill text-dark px-4 border card-hover-float" onclick="PatientHistoryPage.init(null)">
                        <i class="fa-solid fa-arrow-left me-1 text-primary"></i> ค้นหาคนไข้อื่น
                    </button>
                    <h2 class="page-title text-dark" style="font-weight: 800;"><i class="fa-solid fa-folder-open text-primary me-2"></i> แฟ้มประวัติผู้ป่วย <span class="text-muted fw-normal fs-5">(EMR)</span></h2>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-dark fw-bold shadow-sm rounded-pill px-4 bg-white border-2 card-hover-float" onclick="window.print()">
                        <i class="fa-solid fa-print me-2 text-primary"></i> พิมพ์ประวัติ
                    </button>
                    <button class="btn btn-premium btn-premium-success px-4 card-hover-float" onclick="PatientHistoryPage.openAddRecordModal()">
                        <i class="fa-solid fa-plus me-2"></i> เพิ่มประวัติใหม่
                    </button>
                </div>
            </div>

            <div id="ph-header-loading" class="text-center py-5 text-primary"><i class="fas fa-spinner fa-spin fa-3x drop-shadow"></i></div>
            
            <div id="ph-header-content" class="modern-panel shadow-sm mb-4 p-4 position-relative overflow-hidden" style="display: none; border-radius: 24px; border-left: 8px solid var(--primary); background: linear-gradient(to right, #ffffff, #f8fafc);">
                <div style="position: absolute; top: -30px; right: -20px; opacity: 0.03; font-size: 200px; pointer-events: none;"><i class="fa-solid fa-id-card-clip"></i></div>
                <div class="row align-items-center position-relative z-1" id="ph-header-inner"></div>
            </div>

            <div class="emr-nav-tabs-container">
                <ul class="nav emr-nav-tabs" id="emrTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-timeline" type="button" role="tab"><i class="fa-solid fa-timeline text-primary me-2"></i> บันทึกการรักษา</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-vitals" type="button" role="tab" onclick="setTimeout(()=>PatientHistoryPage.renderChart(), 200)"><i class="fa-solid fa-chart-line text-success me-2"></i> กราฟสัญญาณชีพ</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-labs" type="button" role="tab"><i class="fa-solid fa-vial text-danger me-2"></i> ผลแล็บ</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-xrays" type="button" role="tab"><i class="fa-solid fa-x-ray text-info me-2"></i> ภาพถ่ายรังสี (X-Ray)</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-docs" type="button" role="tab"><i class="fa-solid fa-file-image me-2"></i> เอกสาร/ไฟล์แนบ</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-meds" type="button" role="tab"><i class="fa-solid fa-pills text-warning me-2"></i> ยา/เวชภัณฑ์</button>
                    </li>
                </ul>
            </div>

            <div class="tab-content" id="emrTabContent">
                
                <div class="tab-pane fade show active" id="tab-timeline" role="tabpanel">
                    <div class="modern-panel position-relative overflow-hidden">
                        <div style="position: absolute; top: -30px; right: -20px; opacity: 0.02; font-size: 200px; pointer-events: none;"><i class="fa-solid fa-clock-rotate-left"></i></div>
                        
                        <div class="d-flex justify-content-between align-items-center mb-4 position-relative z-1 flex-wrap gap-2">
                            <h4 class="fw-bold text-dark mb-0"><i class="fa-solid fa-clipboard-list text-primary me-2"></i> ประวัติการเข้าฟอกเลือด</h4>
                            <div class="d-flex align-items-center gap-2 bg-light p-1 rounded-pill shadow-sm border border-light">
                                <span class="text-secondary fw-bold ms-2 small"><i class="fa-solid fa-filter me-1"></i> วันที่:</span>
                                <input type="date" id="ph-date-filter-timeline" class="form-control form-control-sm border-0 bg-white shadow-sm rounded-pill fw-bold text-primary px-3" style="width: 140px; cursor:pointer;" onchange="PatientHistoryPage.filterTimeline(this.value)">
                                <button class="btn btn-sm btn-white text-danger rounded-circle shadow-sm" style="width:30px; height:30px; padding:0;" onclick="document.getElementById('ph-date-filter-timeline').value=''; PatientHistoryPage.filterTimeline('')" title="ล้างการค้นหา"><i class="fa-solid fa-times"></i></button>
                            </div>
                        </div>

                        <div class="emr-scroll-area position-relative z-1">
                            <div id="ph-timeline-content"></div>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="tab-vitals" role="tabpanel">
                    <div class="modern-panel">
                        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                            <h4 class="fw-bold text-dark mb-0"><i class="fa-solid fa-heart-pulse text-success me-2"></i> กราฟแนวโน้มสัญญาณชีพ</h4>
                            <div class="d-flex align-items-center gap-2 bg-light p-1 rounded-pill shadow-sm border border-light">
                                <span class="text-secondary fw-bold ms-2 small"><i class="fa-solid fa-filter me-1"></i> วันที่:</span>
                                <input type="date" id="ph-date-filter-vitals" class="form-control form-control-sm border-0 bg-white shadow-sm rounded-pill fw-bold text-success px-3" style="width: 140px; cursor:pointer;" onchange="PatientHistoryPage.filterVitals(this.value)">
                                <button class="btn btn-sm btn-white text-danger rounded-circle shadow-sm" style="width:30px; height:30px; padding:0;" onclick="document.getElementById('ph-date-filter-vitals').value=''; PatientHistoryPage.filterVitals('')"><i class="fa-solid fa-times"></i></button>
                            </div>
                        </div>
                        <div class="emr-scroll-area" style="overflow-x: auto;">
                            <div style="height: 380px; min-width: 600px; width: 100%;"><canvas id="vitalsChart"></canvas></div>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="tab-labs" role="tabpanel">
                    <div class="modern-panel">
                        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                            <h4 class="fw-bold text-dark mb-0"><i class="fa-solid fa-microscope text-danger me-2"></i> ผลตรวจห้องปฏิบัติการ</h4>
                            <div class="d-flex gap-2 flex-wrap">
                                <div class="d-flex align-items-center gap-2 bg-light p-1 rounded-pill shadow-sm border border-light">
                                    <span class="text-secondary fw-bold ms-2 small"><i class="fa-solid fa-filter me-1"></i> วันที่:</span>
                                    <input type="date" id="ph-date-filter-labs" class="form-control form-control-sm border-0 bg-white shadow-sm rounded-pill fw-bold text-danger px-3" style="width: 140px; cursor:pointer;" onchange="PatientHistoryPage.filterLabs(this.value)">
                                    <button class="btn btn-sm btn-white text-danger rounded-circle shadow-sm" style="width:30px; height:30px; padding:0;" onclick="document.getElementById('ph-date-filter-labs').value=''; PatientHistoryPage.filterLabs('')"><i class="fa-solid fa-times"></i></button>
                                </div>
                                <button class="btn btn-premium btn-premium-danger px-4" onclick="PatientHistoryPage.openAddLabModal()"><i class="fa-solid fa-plus me-2"></i> เพิ่มผลแล็บ</button>
                            </div>
                        </div>
                        <div class="emr-scroll-area border rounded-4 shadow-sm bg-white" style="padding-right:0;">
                            <table class="table table-premium w-100 mb-0">
                                <thead style="background: var(--danger-light); position: sticky; top: 0; z-index: 10;">
                                    <tr>
                                        <th class="text-danger fw-bold"><i class="fa-regular fa-calendar-days me-2"></i> วันที่</th>
                                        <th class="text-danger fw-bold">BUN</th>
                                        <th class="text-danger fw-bold">Cr</th>
                                        <th class="text-danger fw-bold">K</th>
                                        <th class="text-danger fw-bold">Ca</th>
                                        <th class="text-danger fw-bold">P</th>
                                        <th class="text-danger fw-bold">Hct</th>
                                        <th class="text-center text-danger fw-bold"><i class="fa-solid fa-gears me-2"></i> จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody id="ph-labs-content"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="tab-xrays" role="tabpanel">
                    <div class="modern-panel">
                        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                            <h4 class="fw-bold text-dark mb-0"><i class="fa-solid fa-x-ray text-info me-2"></i> ภาพถ่ายรังสี (X-Ray)</h4>
                            <div class="d-flex align-items-center gap-2 bg-light p-1 rounded-pill shadow-sm border border-light">
                                <span class="text-secondary fw-bold ms-2 small"><i class="fa-solid fa-filter me-1"></i> วันที่:</span>
                                <input type="date" id="ph-date-filter-xrays" class="form-control form-control-sm border-0 bg-white shadow-sm rounded-pill fw-bold text-info px-3" style="width: 140px; cursor:pointer;" onchange="PatientHistoryPage.filterXrays(this.value)">
                                <button class="btn btn-sm btn-white text-danger rounded-circle shadow-sm" style="width:30px; height:30px; padding:0;" onclick="document.getElementById('ph-date-filter-xrays').value=''; PatientHistoryPage.filterXrays('')"><i class="fa-solid fa-times"></i></button>
                            </div>
                        </div>
                        <div class="emr-scroll-area">
                            <div id="ph-xrays-content" class="row g-3 m-0"></div>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="tab-docs" role="tabpanel">
                    <div class="modern-panel">
                        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                            <h4 class="fw-bold text-dark mb-0"><i class="fa-solid fa-file-image text-primary me-2"></i> เอกสารและไฟล์สแกน</h4>
                            <div class="d-flex gap-2 flex-wrap">
                                <div class="d-flex align-items-center gap-2 bg-light p-1 rounded-pill shadow-sm border border-light">
                                    <span class="text-secondary fw-bold ms-2 small"><i class="fa-solid fa-filter me-1"></i> วันที่:</span>
                                    <input type="date" id="ph-date-filter-docs" class="form-control form-control-sm border-0 bg-white shadow-sm rounded-pill fw-bold text-primary px-3" style="width: 140px; cursor:pointer;" onchange="PatientHistoryPage.filterDocs(this.value)">
                                    <button class="btn btn-sm btn-white text-danger rounded-circle shadow-sm" style="width:30px; height:30px; padding:0;" onclick="document.getElementById('ph-date-filter-docs').value=''; PatientHistoryPage.filterDocs('')"><i class="fa-solid fa-times"></i></button>
                                </div>
                                <button class="btn btn-outline-primary bg-white shadow-sm fw-bold rounded-pill px-4" onclick="App.switchPage('document_center')">ไปหน้าจัดการเอกสารรวม</button>
                            </div>
                        </div>
                        <div class="emr-scroll-area">
                            <div id="ph-docs-content" class="row g-3 m-0"></div>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="tab-meds" role="tabpanel">
                    <div class="modern-panel">
                        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                            <h4 class="fw-bold text-dark mb-0"><i class="fa-solid fa-box-open text-warning me-2"></i> เวชภัณฑ์และยา</h4>
                            <div class="d-flex gap-2 flex-wrap">
                                <div class="d-flex align-items-center gap-2 bg-light p-1 rounded-pill shadow-sm border border-light">
                                    <span class="text-secondary fw-bold ms-2 small" title="ค้นหาประวัติการใช้ยาในอดีต"><i class="fa-solid fa-filter me-1"></i> วันที่:</span>
                                    <input type="date" id="ph-date-filter-meds" class="form-control form-control-sm border-0 bg-white shadow-sm rounded-pill fw-bold text-warning-dark px-3" style="width: 140px; cursor:pointer;" onchange="PatientHistoryPage.filterMeds(this.value)">
                                    <button class="btn btn-sm btn-white text-danger rounded-circle shadow-sm" style="width:30px; height:30px; padding:0;" onclick="document.getElementById('ph-date-filter-meds').value=''; PatientHistoryPage.filterMeds('')"><i class="fa-solid fa-times"></i></button>
                                </div>
                                <button class="btn btn-warning text-dark fw-bold rounded-pill shadow-sm px-4" onclick="PatientHistoryPage.openAddMedModal()" style="background: var(--warning-gradient); color: white!important; border:none;"><i class="fa-solid fa-plus me-2"></i> แก้ไขรายการยาปัจจุบัน</button>
                            </div>
                        </div>
                        <div class="emr-scroll-area">
                            <div id="ph-meds-content" class="row g-3 m-0"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    // 🚨 1. ปลดล็อคระบบรอกุญแจที่ถูกต้อง (Safe Auth Check)
    init: function(hn) {
        this.timelineLimit = 15; this.labLimit = 15; this.docLimit = 16;
        this.currentTimelineFilter = ''; this.currentLabFilter = ''; this.currentXrayFilter = ''; this.currentDocFilter = ''; this.currentVitalsFilter = ''; this.currentMedsFilter = '';

        if (!hn || typeof hn !== 'string') {
            document.getElementById('ph-search-screen').style.display = 'block';
            document.getElementById('ph-main-screen').style.display = 'none';
            document.getElementById('ph-search-input').value = '';
            document.getElementById('ph-search-results').innerHTML = '';
            
            if (typeof db !== 'undefined' && typeof firebase !== 'undefined') {
                document.getElementById('ph-search-loading').style.display = 'block';
                
                const execSearchLoad = () => {
                    db.ref('patients_database_v2/patients').once('value').then(snap => {
                        const data = snap.val();
                        let rawPatients = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
                        this.allPatientsList = rawPatients.filter(p => p !== null);
                        document.getElementById('ph-search-loading').style.display = 'none';
                        document.getElementById('ph-search-input').focus();
                    }).catch(err => {
                        document.getElementById('ph-search-loading').innerHTML = '<span class="text-danger"><i class="fa-solid fa-triangle-exclamation"></i> ไม่สามารถดึงข้อมูลได้</span>';
                    });
                };

                if (firebase.auth().currentUser) {
                    execSearchLoad();
                } else {
                    const unsub = firebase.auth().onAuthStateChanged((user) => {
                        if(user) { unsub(); execSearchLoad(); }
                    });
                }
            }
            return;
        }
        
        document.getElementById('ph-search-screen').style.display = 'none';
        document.getElementById('ph-main-screen').style.display = 'block';
        this.hn = hn; 
        
        const execMainLoad = () => { this.loadPatientData(); };

        if (firebase.auth().currentUser) {
            execMainLoad();
        } else {
            const unsub = firebase.auth().onAuthStateChanged((user) => {
                if(user) { unsub(); execMainLoad(); }
            });
        }
    },

    loadPatientData: async function() {
        if (typeof db === 'undefined') return;
        document.getElementById('ph-header-loading').style.display = 'block';

        try {
            const [ptSnap, visitSnap, invSnap, medSnap, xraySnap] = await Promise.all([
                db.ref('patients_database_v2/patients').once('value'), 
                db.ref('patients_database_v2/visits').once('value'),
                db.ref('inventory_database_v2/items').once('value'), 
                db.ref('clinic_meds_list_v2').once('value'),
                db.ref('clinic_xray_list_v2').once('value')
            ]);
            
            const toArray = (snapVal) => snapVal ? (Array.isArray(snapVal) ? snapVal : Object.keys(snapVal).map(k => snapVal[k])).filter(Boolean) : [];
            
            this.patientData = toArray(ptSnap.val()).find(p => p.hn === this.hn);
            if (!this.patientData) { Swal.fire('Error', 'ไม่พบข้อมูล', 'error'); App.switchPage('patients'); return; }

            // 🚨 ป้องกันข้อมูลแหว่ง เปลี่ยน Array เป็น Object แล้วทำให้ระบบพัง
            this.patientData.history = Array.isArray(this.patientData.history) ? this.patientData.history : (this.patientData.history ? Object.values(this.patientData.history) : []);
            this.patientData.labs = Array.isArray(this.patientData.labs) ? this.patientData.labs : (this.patientData.labs ? Object.values(this.patientData.labs) : []);
            this.patientData.medications = Array.isArray(this.patientData.medications) ? this.patientData.medications : (this.patientData.medications ? Object.values(this.patientData.medications) : []);
            
            this.autoCleanUpOldRecords();

            // 🚨 ป้องกันบั๊กวันที่ว่างเปล่าแล้วทำให้ระบบเรียงข้อมูลค้าง
            this.patientData.history.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            this.patientData.labs.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

            let allRawVisits = toArray(visitSnap.val());
            this.allVisits = allRawVisits.filter(v => v.hn === this.hn);
            
            this.invItems = toArray(invSnap.val());
            this.medItems = toArray(medSnap.val());
            this.xraysList = toArray(xraySnap.val());

            this.renderHeader(); 
            this.renderTimeline(); 
            this.renderLabs(); 
            this.renderMeds();
            this.renderXraysTab(); 
            this.renderDocsTab();
        } catch (e) { 
            console.error("Load Patient Data Error:", e);
            document.getElementById('ph-header-loading').innerHTML = '<div class="text-danger py-5"><i class="fa-solid fa-triangle-exclamation fa-3x mb-3"></i><br>ดึงข้อมูลล้มเหลว: ' + e.message + '</div>';
        }
    },

    autoCleanUpOldRecords: function() {
        let isModified = false;
        const cutoffDate = new Date(); 
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 5);
        const cutoffTime = cutoffDate.getTime();
        
        const hLen = this.patientData.history.length;
        this.patientData.history = this.patientData.history.filter(h => new Date(h.date).getTime() >= cutoffTime);
        if (hLen !== this.patientData.history.length) isModified = true;

        const lLen = this.patientData.labs.length;
        this.patientData.labs = this.patientData.labs.filter(l => new Date(l.date).getTime() >= cutoffTime);
        if (lLen !== this.patientData.labs.length) isModified = true;

        if (isModified) {
            db.ref('patients_database_v2/patients').once('value').then(snap => {
                let list = snap.val(); let index = list.findIndex(p => p.hn === this.hn);
                if (index !== -1) { 
                    list[index] = this.patientData; 
                    db.ref('patients_database_v2/patients').set(list); 
                    console.log(`[Auto-Purge]: ลบประวัติเก่าเกิน 5 ปี ของ HN:${this.hn} เรียบร้อยแล้ว`);
                }
            });
        }
    },

    renderHeader: function() {
        document.getElementById('ph-header-loading').style.display = 'none';
        const headerContainer = document.getElementById('ph-header-content'); 
        headerContainer.style.display = 'block';
        
        const p = this.patientData;
        let imgSrc = p.photo_base64 && typeof p.photo_base64 === 'string' ? (p.photo_base64.startsWith('data:image') ? p.photo_base64 : 'data:image/jpeg;base64,' + p.photo_base64) : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name_th)}&background=e2e8f0&color=64748b`;
        
        let alertHtml = '';
        if(p.allergy && p.allergy !== 'ไม่มี') alertHtml += `<span class="badge px-3 py-2 rounded-pill me-2 shadow-sm" style="background: var(--danger-gradient); color:white; font-size:12px;"><i class="fa-solid fa-triangle-exclamation me-2"></i> แพ้ยา: ${p.allergy}</span>`;
        if(p.infection && p.infection !== 'ไม่มี') alertHtml += `<span class="badge px-3 py-2 rounded-pill me-2 shadow-sm" style="background: var(--warning-gradient); color:white; font-size:12px;"><i class="fa-solid fa-virus me-2"></i> ติดเชื้อ: ${p.infection}</span>`;

        document.getElementById('ph-header-inner').innerHTML = `
            <div class="col-md-2 text-center mb-3 mb-md-0">
                <img src="${imgSrc}" style="width:120px;height:120px;border-radius:24px;object-fit:cover;border:4px solid #fff;box-shadow:var(--shadow-float-primary);">
            </div>
            <div class="col-md-10">
                <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                        <h3 class="fw-bold text-dark mb-1" style="font-family:'Prompt'; font-size: 26px;">${p.title||''}${p.name_th}</h3>
                        <div class="text-primary fw-bold" style="font-size: 16px;">
                            <i class="fa-solid fa-id-card-clip me-1"></i> HN: <span class="fs-4">${p.hn}</span> 
                            <span class="text-muted fw-normal ms-3"><i class="fa-solid fa-calendar text-secondary me-1"></i> อายุ: ${p.age || '-'}</span>
                            <span class="text-danger fw-bold ms-3"><i class="fa-solid fa-droplet me-1"></i> เลือด: ${p.blood_type || '-'}</span>
                        </div>
                    </div>
                    <div class="text-end">
                        <span class="badge px-4 py-2 fs-6 shadow-sm rounded-pill" style="background: var(--success-gradient); border: 2px solid #fff;"><i class="fa-solid fa-shield-heart me-2"></i> สิทธิ: ${p.right || 'ไม่ระบุ'}</span>
                    </div>
                </div>
                <div class="mt-3 pt-3 border-top border-light d-flex flex-wrap gap-2 align-items-center">
                    ${alertHtml}
                    <span class="badge bg-light text-primary border border-primary-subtle px-3 py-2 rounded-pill shadow-sm" style="font-size:12px;"><i class="fa-solid fa-weight-scale me-2"></i> Dry Weight: ${p.dry_bw || '-'} Kg</span>
                </div>
            </div>`;
    },

    getMedNameFromId: function(id) {
        if(!id) return '-';
        let found = this.invItems.find(i => String(i.id) === String(id)) || this.medItems.find(m => String(m.id || m) === String(id));
        return found ? (found.name || found) : 'ไม่ทราบชื่อ';
    },
    getXrayNameFromId: function(id) {
        if(!id) return '-';
        let found = this.xraysList.find(x => String(x.id) === String(id));
        return found ? found.name : 'ไม่ทราบชื่อ';
    },

    filterTimeline: function(dateStr) { this.currentTimelineFilter = dateStr; this.renderTimeline(); },
    filterVitals: function(dateStr) { this.currentVitalsFilter = dateStr; this.renderChart(); },
    filterLabs: function(dateStr) { this.currentLabFilter = dateStr; this.renderLabs(); },
    filterXrays: function(dateStr) { this.currentXrayFilter = dateStr; this.renderXraysTab(); },
    filterDocs: function(dateStr) { this.currentDocFilter = dateStr; this.renderDocsTab(); },
    filterMeds: function(dateStr) { this.currentMedsFilter = dateStr; this.renderMeds(); },

    loadMoreTimeline: function() { this.timelineLimit += 10; this.renderTimeline(); },
    renderTimeline: function() {
        const container = document.getElementById('ph-timeline-content');
        let filteredHistory = this.patientData.history;
        if (this.currentTimelineFilter) filteredHistory = filteredHistory.filter(h => h.date === this.currentTimelineFilter);

        if (filteredHistory.length === 0) { 
            container.innerHTML = `<div class="text-center py-5 text-muted"><i class="fa-solid fa-calendar-xmark fa-3x mb-3" style="opacity:0.2;"></i><br>${this.currentTimelineFilter ? 'ไม่พบประวัติในวันที่เลือก' : 'ยังไม่มีประวัติการรักษา'}</div>`; 
            return; 
        }

        let html = `<div class="timeline" style="border-left: 4px solid #bfdbfe; padding-left: 24px; margin-left: 15px; margin-top: 15px;">`;
        let recordsToShow = this.currentTimelineFilter ? filteredHistory : filteredHistory.slice(0, this.timelineLimit);
        
        recordsToShow.forEach((historyRow, index) => {
            let visit = this.allVisits.find(v => v.id === historyRow.id) || {};
            const dateStr = new Date(historyRow.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
            
            let dName = visit.hd_dialysate_item ? this.getMedNameFromId(visit.hd_dialysate_item) + (visit.hd_dialysate_qty ? ` (${visit.hd_dialysate_qty})` : '') : '-';
            let nName = visit.hd_saline_item ? this.getMedNameFromId(visit.hd_saline_item) + (visit.hd_saline_qty ? ` (${visit.hd_saline_qty})` : '') : '-';
            let hName = visit.hd_heparin_item ? this.getMedNameFromId(visit.hd_heparin_item) + (visit.hd_heparin_qty ? ` (${visit.hd_heparin_qty})` : '') : '-';

            let otherMeds = visit.other_meds || [];
            let xrays = visit.xray_list || [];

            let medsContainer = '';
            if(dName !== '-' || nName !== '-' || hName !== '-' || otherMeds.length > 0 || xrays.length > 0) {
                medsContainer = `<div class="d-flex flex-wrap gap-2 mb-3 mt-2">`;
                if(dName !== '-') medsContainer += `<span class="badge rounded-pill px-3 py-2 shadow-sm" style="background: var(--warning-gradient); color:#fff; font-size:12px; border:1px solid #fff;"><i class="fa-solid fa-soap me-2"></i> น้ำยาไต: ${dName}</span>`;
                if(nName !== '-') medsContainer += `<span class="badge rounded-pill px-3 py-2 shadow-sm" style="background: var(--info); color:#fff; font-size:12px; border:1px solid #fff;"><i class="fa-solid fa-bottle-droplet me-2"></i> NSS: ${nName}</span>`;
                if(hName !== '-') medsContainer += `<span class="badge rounded-pill px-3 py-2 shadow-sm" style="background: var(--danger-gradient); color:#fff; font-size:12px; border:1px solid #fff;"><i class="fa-solid fa-syringe me-2"></i> Heparin: ${hName}</span>`;
                
                otherMeds.forEach(m => {
                    if(m.id && m.qty) {
                        let mName = this.getMedNameFromId(m.id);
                        medsContainer += `<span class="badge rounded-pill px-3 py-2 shadow-sm" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); color:#fff; font-size:12px; border:1px solid #fff;"><i class="fa-solid fa-pills me-2"></i> ยา/เวชภัณฑ์: ${mName} (จำนวน: ${m.qty})</span>`;
                    }
                });

                xrays.forEach(x => {
                    if(x.id && x.qty) {
                        let xName = this.getXrayNameFromId(x.id);
                        medsContainer += `<span class="badge rounded-pill px-3 py-2 shadow-sm" style="background: linear-gradient(135deg, #0ea5e9, #0369a1); color:#fff; font-size:12px; border:1px solid #fff;"><i class="fa-solid fa-x-ray me-2"></i> X-Ray: ${xName}</span>`;
                    }
                });
                medsContainer += `</div>`;
            }

            html += `
                <div class="position-relative mb-5">
                    <div class="timeline-point"></div>
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h5 class="fw-bold text-dark mb-1" style="font-family:'Prompt';"><i class="fa-regular fa-calendar me-2 text-primary"></i>${dateStr}</h5>
                            <div class="text-primary fw-bold" style="font-size:13px;"><i class="fa-solid fa-user-doctor me-2"></i> ${historyRow.doctor || 'แพทย์/พยาบาล'}</div>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-light border border-warning-subtle text-warning-dark shadow-sm px-3 py-1 rounded-pill" onclick="PatientHistoryPage.editRecord('${historyRow.id || index}')" title="แก้ไข"><i class="fa-solid fa-pen me-1"></i> แก้ไข</button>
                            <button class="btn btn-sm btn-light border border-danger-subtle text-danger shadow-sm px-3 py-1 rounded-pill" onclick="PatientHistoryPage.deleteRecord('${historyRow.id || index}')" title="ลบ"><i class="fa-solid fa-trash me-1"></i> ลบ</button>
                        </div>
                    </div>
                    
                    <div class="mb-3 d-flex gap-2">
                        <span class="badge badge-soft-danger px-3 py-2 rounded-pill shadow-sm" style="font-size:12px;"><i class="fa-solid fa-heart-pulse me-2"></i> BP: <b>${historyRow.bp || '-'}</b></span>
                        <span class="badge badge-soft-info px-3 py-2 rounded-pill shadow-sm" style="font-size:12px;"><i class="fa-solid fa-weight-scale me-2"></i> Wt: <b>${historyRow.weight || '-'}</b> Kg</span>
                    </div>
                    
                    ${medsContainer}
                    
                    <div class="p-4 rounded-4 shadow-sm border border-light" style="background: #ffffff;">
                        <div class="fw-bold text-primary mb-1" style="font-size:14px;"><i class="fa-solid fa-comment-medical me-2"></i> อาการสำคัญ (Chief Complaint):</div>
                        <div class="mb-3 text-dark ps-4 fw-medium">${visit.cc || historyRow.cc || '-'}</div>
                        
                        <div class="fw-bold text-warning-dark mb-1" style="font-size:14px;"><i class="fa-solid fa-notes-medical me-2"></i> บันทึกการรักษา (Progress Notes):</div>
                        <div class="text-dark ps-4 fw-medium" style="white-space: pre-wrap;">${visit.note || historyRow.note || '-'}</div>
                    </div>
                </div>`;
        });
        html += `</div>`;

        if (!this.currentTimelineFilter && filteredHistory.length > this.timelineLimit) {
            let remaining = filteredHistory.length - this.timelineLimit;
            html += `<div class="text-center mt-4 mb-4"><button class="btn btn-light text-primary fw-bold rounded-pill px-5 py-2 shadow-sm border" onclick="PatientHistoryPage.loadMoreTimeline()"><i class="fa-solid fa-angle-down me-2"></i> โหลดประวัติเก่าเพิ่มเติม (เหลือ ${remaining} วัน)</button></div>`;
        }
        container.innerHTML = html;
    },

    renderXraysTab: function() {
        const container = document.getElementById('ph-xrays-content');
        let html = '';
        let hasXray = false;

        let filteredHistory = this.patientData.history;
        if(this.currentXrayFilter) filteredHistory = filteredHistory.filter(h => h.date === this.currentXrayFilter);

        filteredHistory.forEach(historyRow => {
            let visit = this.allVisits.find(v => v.id === historyRow.id) || {};
            let xrays = visit.xray_list || [];
            
            if(xrays.length > 0) {
                hasXray = true;
                const dateStr = new Date(historyRow.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
                
                let xrayItemsHtml = '';
                xrays.forEach(x => {
                    let xName = this.getXrayNameFromId(x.id);
                    xrayItemsHtml += `
                        <div class="d-flex justify-content-between align-items-center border-bottom border-light pb-2 mb-2">
                            <div class="fw-bold text-dark"><i class="fa-solid fa-caret-right text-info me-2"></i> ${xName}</div>
                            <div class="badge bg-info-subtle text-info-emphasis rounded-pill">${x.qty} ครั้ง</div>
                        </div>
                    `;
                });

                html += `
                <div class="col-md-6 col-lg-4">
                    <div class="p-3 bg-white border border-info-subtle rounded-4 shadow-sm card-hover-float">
                        <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-info-subtle">
                            <div class="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm bg-info text-white" style="width: 45px; height: 45px;">
                                <i class="fa-solid fa-calendar-day fa-lg"></i>
                            </div>
                            <div>
                                <div class="fw-bold text-dark" style="font-size:15px; font-family:'Prompt';">${dateStr}</div>
                                <div class="text-info fw-bold" style="font-size:12px;">สั่งโดย: ${historyRow.doctor || '-'}</div>
                            </div>
                        </div>
                        ${xrayItemsHtml}
                    </div>
                </div>`;
            }
        });

        if (!hasXray) {
            container.innerHTML = `<div class="col-12 text-center py-5 text-muted"><i class="fa-solid fa-x-ray fa-3x mb-3" style="opacity:0.2;"></i><br>${this.currentXrayFilter?'ไม่พบเอกสารในวันที่เลือก':'ไม่มีประวัติการส่งตรวจเอ็กซเรย์'}</div>`;
        } else {
            container.innerHTML = html;
        }
    },

    loadMoreDocs: function() { this.docLimit += 12; this.renderDocsTab(); },
    renderDocsTab: function() {
        const container = document.getElementById('ph-docs-content');
        let allDocsOfPatient = [];
        
        this.allVisits.forEach(visit => {
            if (visit.attachments && visit.attachments.length > 0) {
                visit.attachments.forEach(doc => { allDocsOfPatient.push({ ...doc, visitDate: visit.date }); });
            }
        });

        allDocsOfPatient.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
        
        if (this.currentDocFilter) allDocsOfPatient = allDocsOfPatient.filter(d => d.visitDate === this.currentDocFilter);

        if (allDocsOfPatient.length === 0) {
            container.innerHTML = `<div class="col-12 text-center py-5 text-muted"><i class="fa-solid fa-folder-open fa-3x mb-3" style="opacity:0.2;"></i><br>${this.currentDocFilter?'ไม่พบเอกสารในวันที่เลือก':'ยังไม่มีเอกสารแนบถูกสแกนในระบบ'}</div>`;
            return;
        }

        let html = '';
        let docsToShow = this.currentDocFilter ? allDocsOfPatient : allDocsOfPatient.slice(0, this.docLimit);

        docsToShow.forEach((doc, idx) => {
            const isPdf = doc.type === 'pdf' || (doc.dataUrl && doc.dataUrl.startsWith('data:application/pdf'));
            const previewContent = isPdf 
                ? `<i class="fa-solid fa-file-pdf doc-icon-large text-danger drop-shadow"></i>`
                : `<img src="${doc.dataUrl}" alt="Thumbnail" loading="lazy">`;
            
            const dParts = doc.visitDate.split('-');
            const displayDate = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}/${dParts[0]}` : doc.visitDate;

            html += `
            <div class="col-6 col-md-4 col-lg-3 fade-in-up" style="animation-delay: ${(idx % 12) * 0.05}s;">
                <div class="doc-thumb-card" onclick="PatientHistoryPage.viewDocument('${doc.dataUrl}', '${isPdf}')">
                    <div class="doc-img-container">
                        ${previewContent}
                    </div>
                    <div class="p-3">
                        <div class="fw-bold text-dark text-truncate" style="font-size:13px; margin-bottom: 4px;" title="${doc.name || 'เอกสารแนบ'}">${doc.name || 'เอกสารแนบ'}</div>
                        <div class="text-primary fw-bold" style="font-size:11px;"><i class="fa-regular fa-calendar me-1"></i> ${displayDate}</div>
                    </div>
                </div>
            </div>`;
        });

        if (!this.currentDocFilter && allDocsOfPatient.length > this.docLimit) {
            let remaining = allDocsOfPatient.length - this.docLimit;
            html += `<div class="col-12 text-center mt-4 mb-4"><button class="btn btn-light text-primary fw-bold rounded-pill px-5 py-2 shadow-sm border" onclick="PatientHistoryPage.loadMoreDocs()"><i class="fa-solid fa-angle-down me-2"></i> โหลดไฟล์ก่อนหน้าเพิ่มเติม (เหลือ ${remaining} ไฟล์)</button></div>`;
        }
        container.innerHTML = html;
    },

    viewDocument: function(dataUrl, isPdf) {
        if (isPdf === 'true') {
            Swal.fire({ html: `<iframe src="${dataUrl}" style="width:100%; height:75vh; border:none; border-radius:12px;"></iframe>`, showConfirmButton: false, width: '90%', padding: '10px', showCloseButton: true });
        } else {
            Swal.fire({ imageUrl: dataUrl, imageAlt: 'Scanned Document', showConfirmButton: false, width: '80%', padding: '0', background: 'transparent', showCloseButton: true });
        }
    },

    loadMoreLabs: function() { this.labLimit += 10; this.renderLabs(); },
    renderLabs: function() {
        const tbody = document.getElementById('ph-labs-content');
        let filteredLabs = this.patientData.labs;
        if(this.currentLabFilter) filteredLabs = filteredLabs.filter(l => l.date === this.currentLabFilter);

        if (filteredLabs.length === 0) { tbody.innerHTML = `<tr><td colspan="8" class="text-center py-5 text-muted"><i class="fa-solid fa-vial-virus fa-3x mb-3" style="opacity:0.2;"></i><br>${this.currentLabFilter?'ไม่พบแล็บในวันที่เลือก':'ไม่มีผลตรวจห้องปฏิบัติการ'}</td></tr>`; return; }
        
        let html = '';
        let recordsToShow = this.currentLabFilter ? filteredLabs : filteredLabs.slice(0, this.labLimit);

        recordsToShow.forEach((lab, index) => {
            const dateStr = new Date(lab.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
            const getVal = (val) => val ? `<span class="fw-bold text-dark">${val}</span>` : '<span class="text-muted">-</span>';
            html += `
            <tr style="background:#fff;">
                <td class="fw-bold text-primary">${dateStr}</td>
                <td>${getVal(lab.bun)}</td><td>${getVal(lab.cr)}</td><td>${getVal(lab.k)}</td><td>${getVal(lab.ca)}</td><td>${getVal(lab.p)}</td><td>${getVal(lab.hct)}</td>
                <td class="text-center">
                    <button class="btn btn-sm shadow-sm px-2 py-1 me-1" style="background:#fffbeb; color:#d97706; border:1px solid #fde68a; border-radius:8px;" onclick="PatientHistoryPage.editLab('${lab.id || index}')" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm shadow-sm px-2 py-1" style="background:#fef2f2; color:#e11d48; border:1px solid #fecdd3; border-radius:8px;" onclick="PatientHistoryPage.deleteLab('${lab.id || index}')" title="ลบ"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
        });

        if (!this.currentLabFilter && filteredLabs.length > this.labLimit) {
            html += `<tr><td colspan="8" class="text-center py-4"><button class="btn btn-light text-danger fw-bold rounded-pill px-5 shadow-sm border border-danger-subtle" onclick="PatientHistoryPage.loadMoreLabs()"><i class="fa-solid fa-angle-down me-2"></i> โหลดผลแล็บเก่า</button></td></tr>`;
        }
        tbody.innerHTML = html;
    },

    renderMeds: function() {
        const container = document.getElementById('ph-meds-content');
        if (this.currentMedsFilter) {
            let pastVisit = this.allVisits.find(v => v.date === this.currentMedsFilter);
            if (!pastVisit) {
                container.innerHTML = `<div class="col-12 text-center py-5 text-muted"><i class="fa-solid fa-calendar-xmark fa-3x mb-3" style="opacity:0.2;"></i><br>ไม่มีบันทึกการใช้ยาในวันที่เลือก</div>`;
                return;
            }

            let dName = pastVisit.hd_dialysate_item ? this.getMedNameFromId(pastVisit.hd_dialysate_item) + (pastVisit.hd_dialysate_qty ? ` (${pastVisit.hd_dialysate_qty})` : '') : null;
            let nName = pastVisit.hd_saline_item ? this.getMedNameFromId(pastVisit.hd_saline_item) + (pastVisit.hd_saline_qty ? ` (${pastVisit.hd_saline_qty})` : '') : null;
            let hName = pastVisit.hd_heparin_item ? this.getMedNameFromId(pastVisit.hd_heparin_item) + (pastVisit.hd_heparin_qty ? ` (${pastVisit.hd_heparin_qty})` : '') : null;
            
            let pastMedsHtml = '';
            if(dName) pastMedsHtml += `<div class="col-md-6 col-lg-4"><div class="p-3 bg-white border border-light rounded-4 shadow-sm d-flex align-items-center"><div class="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style="width: 55px; height: 55px; background: var(--warning-gradient); color:white;"><i class="fa-solid fa-soap fa-xl"></i></div><div><div class="fw-bold text-dark" style="font-size:14px;">${dName}</div><div class="text-muted small">น้ำยาไต</div></div></div></div>`;
            if(nName) pastMedsHtml += `<div class="col-md-6 col-lg-4"><div class="p-3 bg-white border border-light rounded-4 shadow-sm d-flex align-items-center"><div class="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style="width: 55px; height: 55px; background: var(--info); color:white;"><i class="fa-solid fa-bottle-droplet fa-xl"></i></div><div><div class="fw-bold text-dark" style="font-size:14px;">${nName}</div><div class="text-muted small">น้ำเกลือ (NSS)</div></div></div></div>`;
            if(hName) pastMedsHtml += `<div class="col-md-6 col-lg-4"><div class="p-3 bg-white border border-light rounded-4 shadow-sm d-flex align-items-center"><div class="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style="width: 55px; height: 55px; background: var(--danger-gradient); color:white;"><i class="fa-solid fa-syringe fa-xl"></i></div><div><div class="fw-bold text-dark" style="font-size:14px;">${hName}</div><div class="text-muted small">ยาต้านแข็งตัว (Heparin)</div></div></div></div>`;

            let otherMeds = pastVisit.other_meds || [];
            otherMeds.forEach(m => {
                if(m.id && m.qty) {
                    let mName = this.getMedNameFromId(m.id);
                    pastMedsHtml += `<div class="col-md-6 col-lg-4"><div class="p-3 bg-white border border-light rounded-4 shadow-sm d-flex align-items-center"><div class="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style="width: 55px; height: 55px; background: linear-gradient(135deg, #64748b, #334155); color:white;"><i class="fa-solid fa-pills fa-xl"></i></div><div><div class="fw-bold text-dark" style="font-size:14px;">${mName} (จำนวน: ${m.qty})</div><div class="text-muted small">ยาและเวชภัณฑ์อื่นๆ</div></div></div></div>`;
                }
            });

            if(!pastMedsHtml) pastMedsHtml = `<div class="col-12 text-center py-4 text-muted"><i class="fa-solid fa-ban fa-2x mb-2"></i><br>ไม่มีการบันทึกการใช้ยาในวันดังกล่าว</div>`;
            container.innerHTML = `<div class="col-12 mb-2"><h6 class="fw-bold text-primary mb-0"><i class="fa-solid fa-history me-2"></i> ประวัติการใช้ยาวันที่: ${new Date(this.currentMedsFilter).toLocaleDateString('th-TH')}</h6></div>` + pastMedsHtml;
            return;
        }

        if (this.patientData.medications.length === 0) { container.innerHTML = `<div class="col-12 text-center py-5 text-muted"><i class="fa-solid fa-capsules fa-3x mb-3" style="opacity:0.2;"></i><br>ไม่มีรายการยาปัจจุบัน</div>`; return; }
        let mainHtml = ''; let otherHtml = '';
        
        this.patientData.medications.forEach((med, index) => {
            let nameLower = (med.name || '').toLowerCase();
            let isMain = nameLower.includes('น้ำยาไต') || nameLower.includes('dialysate') || nameLower.includes('nss') || nameLower.includes('น้ำเกลือ') || nameLower.includes('heparin');

            let actionBtns = `
                <div class="ms-auto d-flex flex-column gap-2">
                    <button class="btn btn-sm shadow-sm px-2 py-1" style="background:#fffbeb; color:#d97706; border:1px solid #fde68a; border-radius:8px;" onclick="PatientHistoryPage.editMed(${index})" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm shadow-sm px-2 py-1" style="background:#fef2f2; color:#e11d48; border:1px solid #fecdd3; border-radius:8px;" onclick="PatientHistoryPage.deleteMed(${index})" title="ลบ"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;

            if(isMain) {
                let icon = 'fa-pump-medical'; let bgGrad = 'var(--primary-gradient)';
                if(nameLower.includes('น้ำยาไต') || nameLower.includes('dialysate')) { icon = 'fa-soap'; bgGrad = 'var(--warning-gradient)'; }
                if(nameLower.includes('nss') || nameLower.includes('น้ำเกลือ')) { icon = 'fa-bottle-droplet'; bgGrad = 'var(--info)'; }
                if(nameLower.includes('heparin')) { icon = 'fa-syringe'; bgGrad = 'var(--danger-gradient)'; }

                mainHtml += `
                    <div class="col-md-6 col-lg-4">
                        <div class="p-3 bg-white border border-light rounded-4 shadow-sm d-flex align-items-center card-hover-float" style="cursor:pointer;">
                            <div class="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm border border-2 border-white" style="width: 55px; height: 55px; min-width: 55px; background: ${bgGrad}; color:white;"><i class="fa-solid ${icon} fa-xl"></i></div>
                            <div>
                                <div class="fw-bold text-dark" style="font-size:15.5px; font-family:'Prompt';">${med.name}</div>
                                <div class="text-primary fw-bold mt-1" style="font-size:13px;">${med.dosage || ''}</div>
                            </div>
                            ${actionBtns}
                        </div>
                    </div>`;
            } else {
                otherHtml += `
                    <div class="col-md-6 col-lg-4">
                        <div class="p-3 bg-white border border-light rounded-4 shadow-sm d-flex align-items-center card-hover-float" style="cursor:pointer;">
                            <div class="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm border border-2 border-white" style="width: 55px; height: 55px; min-width: 55px; background: linear-gradient(135deg, #64748b, #334155); color:white;"><i class="fa-solid fa-pills fa-xl"></i></div>
                            <div>
                                <div class="fw-bold text-dark" style="font-size:15.5px; font-family:'Prompt';">${med.name}</div>
                                <div class="text-primary fw-bold mt-1" style="font-size:13px;">${med.dosage || ''}</div>
                            </div>
                            ${actionBtns}
                        </div>
                    </div>`;
            }
        });

        let finalHtml = '';
        if(mainHtml) finalHtml += `<div class="col-12 mb-2"><h6 class="fw-bold text-dark mb-0"><i class="fa-solid fa-pump-medical text-primary me-2"></i> เวชภัณฑ์หลักประจำเครื่อง (Main Dialysis Supplies)</h6></div>${mainHtml}`;
        if(otherHtml) finalHtml += `<div class="col-12 mb-2 mt-4 pt-4 border-top border-light"><h6 class="fw-bold text-dark mb-0"><i class="fa-solid fa-capsules text-warning me-2"></i> ยาฉีดและเวชภัณฑ์อื่นๆ (Other Medications)</h6></div>${otherHtml}`;
        container.innerHTML = finalHtml;
    },

    renderChart: function() {
        const canvas = document.getElementById('vitalsChart'); if(!canvas) return;
        
        let filteredHistory = [...this.patientData.history].reverse();
        if(this.currentVitalsFilter) filteredHistory = filteredHistory.filter(h => h.date === this.currentVitalsFilter);

        if(filteredHistory.length === 0) { 
            if(this.chartInstance) this.chartInstance.destroy();
            canvas.style.display = 'none'; 
            canvas.parentElement.innerHTML = `<div class="text-center py-5 text-muted"><i class="fa-solid fa-heart-pulse fa-3x mb-3" style="opacity:0.2;"></i><br>ไม่มีประวัติสัญญาณชีพในวันที่เลือก</div><canvas id="vitalsChart"></canvas>`; 
            return; 
        } else {
            canvas.style.display = 'block';
            let oldEmptyMsg = canvas.parentElement.querySelector('.text-muted');
            if(oldEmptyMsg) oldEmptyMsg.remove();
        }

        const labels = []; const sysData = []; const diaData = [];
        filteredHistory.forEach(v => {
            if(v.bp && v.bp !== '-') { 
                const parts = v.bp.split('/'); 
                if(parts.length === 2) { 
                    labels.push(new Date(v.date).toLocaleDateString('th-TH', {day:'numeric', month:'short'})); 
                    sysData.push(parseInt(parts[0])); 
                    diaData.push(parseInt(parts[1])); 
                } 
            }
        });

        if(this.chartInstance) this.chartInstance.destroy();
        const ctx = canvas.getContext('2d');
        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: { labels: labels, datasets: [ 
                { label: 'Systolic (ตัวบน)', data: sysData, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 4, tension: 0.4, fill: true, pointBackgroundColor: '#ef4444', pointRadius: 5 }, 
                { label: 'Diastolic (ตัวล่าง)', data: diaData, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderWidth: 4, tension: 0.4, fill: true, pointBackgroundColor: '#3b82f6', pointRadius: 5 } 
            ] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: {font: {family: 'Prompt', size: 14}} } }, scales: { y: { beginAtZero: false, suggestedMin: 60, suggestedMax: 180 } } }
        });
    },

    openAddRecordModal: function() { this.showRecordModal(); },
    editRecord: function(idOrIndex) {
        let index = this.patientData.history.findIndex(h => h.id === idOrIndex);
        if (index === -1) index = parseInt(idOrIndex);
        if (isNaN(index) || !this.patientData.history[index]) return;
        this.showRecordModal(this.patientData.history[index], index);
    },
    deleteRecord: function(idOrIndex) {
        Swal.fire({ title: 'ลบประวัตินี้?', text: "ข้อมูลจะถูกลบถาวร ไม่สามารถกู้คืนได้", icon: 'warning', showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-trash"></i> ยืนยันการลบ', confirmButtonColor: '#ef4444', cancelButtonText: 'ยกเลิก' })
        .then((result) => {
            if (result.isConfirmed) {
                let index = this.patientData.history.findIndex(h => h.id === idOrIndex);
                if (index === -1) index = parseInt(idOrIndex);
                this.patientData.history.splice(index, 1);
                this.saveToDB();
            }
        });
    },
    showRecordModal: function(record = null, index = null) {
        let isEdit = record !== null;
        Swal.fire({
            title: `<h4 class="fw-bold text-primary" style="font-family:'Prompt';"><i class="fa-solid ${isEdit?'fa-pen':'fa-plus'} me-2"></i>${isEdit ? 'แก้ไขประวัติการรักษา' : 'เพิ่มบันทึกการรักษาด่วน'}</h4>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <label class="form-label fw-bold text-dark small"><i class="fa-regular fa-calendar me-2"></i> วันที่รับบริการ</label>
                    <input type="date" id="add-rec-date" class="form-control input-modern mb-3 border-primary" value="${isEdit ? record.date : new Date().toISOString().split('T')[0]}">
                    
                    <div class="row g-3 mb-3">
                        <div class="col-6">
                            <label class="form-label fw-bold text-danger small"><i class="fa-solid fa-heart-pulse me-1"></i> ความดัน (BP)</label>
                            <input type="text" id="add-rec-bp" class="form-control input-modern fw-bold text-danger" value="${isEdit ? (record.bp==='-'?'':record.bp) : ''}" placeholder="เช่น 120/80">
                        </div>
                        <div class="col-6">
                            <label class="form-label fw-bold text-info small"><i class="fa-solid fa-weight-scale me-1"></i> น้ำหนัก (Kg)</label>
                            <input type="number" step="0.1" id="add-rec-wt" class="form-control input-modern fw-bold text-info" value="${isEdit ? (record.weight==='-'?'':record.weight) : ''}" placeholder="เช่น 65.5">
                        </div>
                    </div>
                    
                    <label class="form-label fw-bold text-dark small"><i class="fa-solid fa-comment-medical me-2"></i> อาการสำคัญ (CC)</label>
                    <input type="text" id="add-rec-cc" class="form-control input-modern mb-3" value="${isEdit ? (record.cc==='-'?'':record.cc) : ''}" placeholder="เช่น มารับการฟอกเลือดตามนัด">
                    
                    <label class="form-label fw-bold text-dark small"><i class="fa-solid fa-notes-medical me-2"></i> บันทึกการรักษา / Order</label>
                    <textarea id="add-rec-note" class="form-control input-modern" rows="4" style="line-height:1.6;" placeholder="จดบันทึกของแพทย์หรือพยาบาล...">${isEdit ? (record.note==='-'?'':record.note) : ''}</textarea>
                </div>
            `,
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึกข้อมูล', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#2563eb', width: 500,
            preConfirm: () => {
                let newData = {
                    id: isEdit ? record.id : 'REC' + new Date().getTime(),
                    date: document.getElementById('add-rec-date').value,
                    bp: document.getElementById('add-rec-bp').value || '-', weight: document.getElementById('add-rec-wt').value || '-',
                    cc: document.getElementById('add-rec-cc').value || '-', note: document.getElementById('add-rec-note').value,
                    doctor: isEdit ? record.doctor : (App.currentUser ? App.currentUser.name : 'แพทย์ผู้ดูแล')
                };
                if (isEdit) this.patientData.history[index] = newData; else this.patientData.history.push(newData);
                this.saveToDB();
            }
        });
    },

    openAddLabModal: function() { this.showLabModal(); },
    editLab: function(idOrIndex) {
        let index = this.patientData.labs.findIndex(l => l.id === idOrIndex);
        if (index === -1) index = parseInt(idOrIndex);
        if (isNaN(index) || !this.patientData.labs[index]) return;
        this.showLabModal(this.patientData.labs[index], index);
    },
    deleteLab: function(idOrIndex) {
        Swal.fire({ title: 'ลบผลแล็บนี้?', text: "ข้อมูลจะถูกลบถาวร ไม่สามารถกู้คืนได้", icon: 'warning', showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-trash"></i> ยืนยันการลบ', confirmButtonColor: '#ef4444', cancelButtonText: 'ยกเลิก' })
        .then((result) => {
            if (result.isConfirmed) {
                let index = this.patientData.labs.findIndex(l => l.id === idOrIndex);
                if (index === -1) index = parseInt(idOrIndex);
                this.patientData.labs.splice(index, 1);
                this.saveToDB();
            }
        });
    },
    showLabModal: function(lab = null, index = null) {
        let isEdit = lab !== null;
        const v = (val) => isEdit && val ? val : '';
        Swal.fire({
            title: `<h4 class="fw-bold text-danger" style="font-family:'Prompt';"><i class="fa-solid fa-vial-virus me-2"></i>${isEdit ? 'แก้ไขผลตรวจแล็บ' : 'เพิ่มผลตรวจห้องปฏิบัติการ'}</h4>`,
            html: `
                <div class="text-start row g-3 mt-2" style="font-family:'Sarabun';">
                    <div class="col-12">
                        <label class="form-label fw-bold text-dark small"><i class="fa-regular fa-calendar-days me-2"></i> วันที่เจาะเลือด</label>
                        <input type="date" id="lab-date" class="form-control input-modern border-danger" value="${isEdit ? lab.date : new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="col-4"><label class="form-label fw-bold text-secondary small">BUN</label><input type="number" step="0.1" id="lab-bun" class="form-control input-modern text-center fw-bold" value="${v(isEdit?lab.bun:'')}"></div>
                    <div class="col-4"><label class="form-label fw-bold text-secondary small">Cr</label><input type="number" step="0.1" id="lab-cr" class="form-control input-modern text-center fw-bold" value="${v(isEdit?lab.cr:'')}"></div>
                    <div class="col-4"><label class="form-label fw-bold text-secondary small">K</label><input type="number" step="0.1" id="lab-k" class="form-control input-modern text-center fw-bold" value="${v(isEdit?lab.k:'')}"></div>
                    <div class="col-4"><label class="form-label fw-bold text-secondary small">Ca</label><input type="number" step="0.1" id="lab-ca" class="form-control input-modern text-center fw-bold" value="${v(isEdit?lab.ca:'')}"></div>
                    <div class="col-4"><label class="form-label fw-bold text-secondary small">P</label><input type="number" step="0.1" id="lab-p" class="form-control input-modern text-center fw-bold" value="${v(isEdit?lab.p:'')}"></div>
                    <div class="col-4"><label class="form-label fw-bold text-secondary small">Hct</label><input type="number" step="0.1" id="lab-hct" class="form-control input-modern text-center fw-bold text-danger border-danger-subtle" value="${v(isEdit?lab.hct:'')}"></div>
                </div>
            `,
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึกแล็บ', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#ef4444', width: 500,
            preConfirm: () => {
                let newData = {
                    id: isEdit ? (lab.id || 'LAB'+new Date().getTime()) : 'LAB' + new Date().getTime(),
                    date: document.getElementById('lab-date').value,
                    bun: document.getElementById('lab-bun').value, cr: document.getElementById('lab-cr').value,
                    k: document.getElementById('lab-k').value, ca: document.getElementById('lab-ca').value,
                    p: document.getElementById('lab-p').value, hct: document.getElementById('lab-hct').value
                };
                if (isEdit) this.patientData.labs[index] = newData; else this.patientData.labs.push(newData);
                this.saveToDB();
            }
        });
    },

    openAddMedModal: function() { this.showMedModal(); },
    editMed: function(index) { if (!this.patientData.medications[index]) return; this.showMedModal(this.patientData.medications[index], index); },
    deleteMed: function(index) {
        Swal.fire({ title: 'ลบรายการยานี้?', icon: 'warning', showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-trash"></i> ยืนยันลบยา', confirmButtonColor: '#ef4444', cancelButtonText:'ยกเลิก' })
        .then((result) => { if (result.isConfirmed) { this.patientData.medications.splice(index, 1); this.saveToDB(); } });
    },
    showMedModal: function(med = null, index = null) {
        let isEdit = med !== null;
        Swal.fire({
            title: `<h4 class="fw-bold text-warning" style="font-family:'Prompt';"><i class="fa-solid fa-pills me-2"></i>${isEdit ? 'แก้ไขยาและเวชภัณฑ์' : 'เพิ่มยาและเวชภัณฑ์'}</h4>`,
            html: `
                <div class="text-start mt-3">
                    <label class="form-label fw-bold text-secondary small">ชื่อยา / เวชภัณฑ์</label>
                    <input type="text" id="add-med-name" class="form-control input-modern mb-3 fw-bold text-primary" placeholder="เช่น Erythropoietin (EPO)" value="${isEdit ? med.name : ''}">
                    <label class="form-label fw-bold text-secondary small">จำนวน / ขนาดที่ใช้</label>
                    <input type="text" id="add-med-qty" class="form-control input-modern fw-bold text-dark" placeholder="เช่น 4000U" value="${isEdit ? med.dosage : ''}">
                </div>
            `,
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึกยา', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#f59e0b',
            preConfirm: () => { 
                let newData = { name: document.getElementById('add-med-name').value.trim(), dosage: document.getElementById('add-med-qty').value.trim() };
                if(!newData.name) { Swal.showValidationMessage('กรุณาระบุชื่อยา'); return false; }
                if(isEdit) this.patientData.medications[index] = newData; else this.patientData.medications.push(newData);
                this.saveToDB();
            }
        });
    },

    saveToDB: function() {
        Swal.fire({ title: 'กำลังอัปเดตแฟ้มประวัติ...', didOpen: () => Swal.showLoading() });
        db.ref('patients_database_v2/patients').once('value').then(snap => {
            let list = snap.val(); let index = list.findIndex(p => p.hn === this.hn);
            if(index !== -1) {
                list[index] = this.patientData;
                db.ref('patients_database_v2/patients').set(list).then(() => {
                    Swal.fire({title:'อัปเดตเรียบร้อย!', icon:'success', timer:1500, showConfirmButton:false});
                    this.loadPatientData(); 
                });
            }
        });
    }
};