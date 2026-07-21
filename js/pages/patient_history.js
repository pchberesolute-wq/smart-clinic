// js/pages/patient_history.js
// 🚀 Enterprise EMR Module: Unified Timeline Rendering & Flawless Modal Print Engine (v10.0)

class PatientHistoryPageComponent {
    constructor() {
        this.hn = null;
        this.firebaseKey = null;
        this.patientData = null;
        this.chartInstance = null;
        this.allVisits = [];
        this.invItems = [];
        this.medItems = [];
        this.xraysList = [];
        this.labSets = []; 
        this.allPatientsList = [];
        this.timelineLimit = 15;
        this.labLimit = 15;
        this.docLimit = 16;
        this.currentTimelineFilter = '';
        this.currentLabFilter = '';
        this.currentXrayFilter = '';
        this.currentDocFilter = '';
        this.currentVitalsFilter = '';
        this.currentMedsFilter = '';
        this.firebaseListeners = [];
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

    goToEditPatient() {
        if (this.firebaseKey) { App.switchPage('patient_form', null, { id: this.firebaseKey }); } 
        else { Swal.fire('ข้อผิดพลาด', 'ไม่พบรหัสอ้างอิงของคนไข้', 'error'); }
    }

    goToDocumentCenter() {
        if (this.hn) { App.switchPage('document_center', null, { hn: this.hn }); } 
        else { App.switchPage('document_center'); }
    }

    switchTab(tabId) {
        document.querySelectorAll('#emrTabs .emr-tab-btn').forEach(btn => btn.classList.remove('active', 'tab-timeline-active', 'tab-vitals-active', 'tab-labs-active', 'tab-xrays-active', 'tab-docs-active', 'tab-meds-active'));
        document.querySelectorAll('#emrTabContent .emr-tab-pane').forEach(pane => pane.classList.remove('active'));
        
        const targetBtn = document.getElementById(`btn-${tabId}`);
        if (targetBtn) { targetBtn.classList.add('active', `${tabId}-active`); if (tabId === 'tab-vitals') { setTimeout(()=>this.renderChart(), 100); } }
        
        const targetPane = document.getElementById(tabId);
        if (targetPane) targetPane.classList.add('active');
    }

    get html() {
        return `
        <style>
            * { -webkit-font-smoothing: antialiased !important; -moz-osx-font-smoothing: grayscale !important; text-rendering: optimizeLegibility !important; }
            .form-label, .text-secondary, .text-muted { color: #334155 !important; font-weight: 600 !important; letter-spacing: 0.2px; }
            .btn-outline-dark.bg-white:hover, .btn-outline-dark.bg-white:hover * { background-color: #0f172a !important; border-color: #0f172a !important; color: #ffffff !important; }
            .btn-outline-primary.bg-white:hover, .btn-outline-primary.bg-white:hover * { background-color: #3b82f6 !important; border-color: #3b82f6 !important; color: #ffffff !important; }
            
            .emr-custom-tabs-container { margin-bottom: 24px; width: 100%; border-radius: 16px; background: var(--bg-surface); border: 1px solid var(--border-color); box-shadow: 0 4px 15px rgba(0,0,0,0.02); padding: 6px; display: flex; height: 64px; box-sizing: border-box; }
            .emr-custom-tabs { display: flex; flex-wrap: nowrap !important; overflow-x: auto !important; overflow-y: hidden; gap: 8px; margin: 0; padding: 0; list-style: none; -webkit-overflow-scrolling: touch; scrollbar-width: none; align-items: center; height: 100%; width: 100%; }
            .emr-custom-tabs::-webkit-scrollbar { display: none !important; }
            .emr-tab-btn { flex: 0 0 auto !important; color: var(--text-muted); background: transparent; border: none !important; transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease !important; padding: 0 24px !important; height: 44px !important; line-height: 44px !important; font-size: 14.5px; border-radius: 12px !important; font-family: 'Prompt'; font-weight: 700; white-space: nowrap !important; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box !important; cursor: pointer; margin: 0; }
            .emr-tab-btn:hover { background: rgba(0,0,0,0.03); }
            html[data-bs-theme="dark"] .emr-tab-btn:hover { background: rgba(255,255,255,0.05); }

            .emr-tab-btn.tab-timeline-active { background: rgba(37,99,235,0.1) !important; color: #2563eb !important; box-shadow: inset 0 0 0 1px rgba(37,99,235,0.2) !important; }
            .emr-tab-btn.tab-vitals-active { background: rgba(16,185,129,0.1) !important; color: #10b981 !important; box-shadow: inset 0 0 0 1px rgba(16,185,129,0.2) !important; }
            .emr-tab-btn.tab-labs-active { background: rgba(239,68,68,0.1) !important; color: #ef4444 !important; box-shadow: inset 0 0 0 1px rgba(239,68,68,0.2) !important; }
            .emr-tab-btn.tab-xrays-active { background: rgba(14,165,233,0.1) !important; color: #0ea5e9 !important; box-shadow: inset 0 0 0 1px rgba(14,165,233,0.2) !important; }
            .emr-tab-btn.tab-docs-active { background: rgba(139,92,246,0.1) !important; color: #8b5cf6 !important; box-shadow: inset 0 0 0 1px rgba(139,92,246,0.2) !important; }
            .emr-tab-btn.tab-meds-active { background: rgba(245,158,11,0.1) !important; color: #d97706 !important; box-shadow: inset 0 0 0 1px rgba(245,158,11,0.2) !important; }

            .emr-tab-content { position: relative; min-height: 60vh; width: 100%; }
            .emr-tab-pane { display: none !important; opacity: 0; }
            .emr-tab-pane.active { display: block !important; animation: emrFadeIn 0.3s ease forwards !important; }
            @keyframes emrFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            
            .timeline-point { position: absolute; left: -36px; top: 0; width: 20px; height: 20px; border-radius: 50%; background: var(--primary-gradient); border: 4px solid var(--bg-surface); box-shadow: 0 0 0 3px rgba(37,99,235,0.3); }
            
            .doc-thumb-card { border-radius: 16px; border: 1px solid var(--border-color); background: var(--bg-surface); overflow: hidden; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); height: 100%; display: flex; flex-direction: column; cursor: pointer; }
            .doc-thumb-card:hover { transform: translateY(-4px); box-shadow: 0 15px 30px -5px rgba(0,0,0,0.1); border-color: var(--primary); }
            .doc-img-container { height: 140px; background: rgba(0,0,0,0.02); display: flex; align-items: center; justify-content: center; overflow: hidden; border-bottom: 1px solid var(--border-color); }
            .doc-img-container img { width: 100%; height: 100%; object-fit: cover; }
            html[data-bs-theme="dark"] .doc-img-container { background: rgba(255,255,255,0.02); }

            .emr-scroll-area { max-height: 58vh; overflow-y: auto; overflow-x: hidden; padding-right: 10px; }
            .emr-scroll-area::-webkit-scrollbar { width: 6px; }
            .emr-scroll-area::-webkit-scrollbar-track { background: transparent; }
            .emr-scroll-area::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
            .emr-scroll-area::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

            .btn-table-edit { background: rgba(245,158,11,0.1) !important; color: #d97706 !important; border: 1px solid rgba(245,158,11,0.3) !important; transition: all 0.2s; }
            .btn-table-delete { background: rgba(239,68,68,0.1) !important; color: #ef4444 !important; border: 1px solid rgba(239,68,68,0.3) !important; transition: all 0.2s; }
            .btn-table-edit:hover { background: #d97706 !important; color: #fff !important; }
            .btn-table-delete:hover { background: #ef4444 !important; color: #fff !important; }
        </style>

        <div id="ph-search-screen" style="display: none; max-width: 800px; margin: 40px auto;">
            <div class="text-center mb-4">
                <div class="d-inline-flex align-items-center justify-content-center text-white rounded-circle shadow-sm mb-3" style="width: 80px; height: 80px; background: linear-gradient(135deg, #2563eb, #1e40af); box-shadow: 0 10px 25px rgba(37,99,235,0.3) !important;">
                    <i class="fa-solid fa-folder-open fa-3x"></i>
                </div>
                <h2 class="fw-bold text-dark" style="font-family:'Prompt';">ค้นหาแฟ้มประวัติผู้ป่วย (EMR)</h2>
                <p class="text-muted fw-bold">พิมพ์ ชื่อ, สกุล, HN หรือ เลขบัตรประชาชน เพื่อค้นหาประวัติการรักษา</p>
            </div>
            
            <div class="search-box-modern shadow-lg mb-4 mx-auto" style="padding: 15px 30px; max-width: 600px; border-radius: 50px; border: 2px solid transparent; background: var(--bg-surface); transition: all 0.3s;">
                <i class="fa-solid fa-search text-primary fa-lg"></i>
                <input type="text" id="ph-search-input" class="border-0 bg-transparent ms-3 w-100 fw-bold text-dark" placeholder="พิมพ์ชื่อคนไข้ หรือ HN..." style="outline: none; font-size: 18px; font-family:'Prompt';" onkeyup="PatientHistoryPage.searchPatients(this.value)">
            </div>
            <div id="ph-search-loading" class="text-center py-4" style="display:none;"><i class="fas fa-circle-notch fa-spin fa-2x text-primary"></i></div>
            <div id="ph-search-results" class="row g-3"></div>
        </div>

        <div id="ph-main-screen" style="display: none;">
            <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 fade-in-up">
                <div class="d-flex align-items-center flex-wrap gap-2">
                    <button class="btn btn-light shadow-sm fw-bold rounded-pill text-dark px-4 border card-hover-float" onclick="App.switchPage('patients')">
                        <i class="fa-solid fa-arrow-left me-1 text-primary"></i> กลับหน้าทะเบียน
                    </button>
                    <button class="btn btn-light shadow-sm fw-bold rounded-pill text-dark px-4 border card-hover-float" onclick="PatientHistoryPage.init(null)">
                        <i class="fa-solid fa-magnifying-glass me-1 text-primary"></i> ค้นหาคนไข้อื่น
                    </button>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-dark fw-bold shadow-sm rounded-pill px-4 bg-white border-2 card-hover-float" onclick="PatientHistoryPage.printEMR()">
                        <i class="fa-solid fa-print me-2 text-primary"></i> พิมพ์ประวัติ EMR
                    </button>
                    <button class="btn btn-premium btn-premium-success px-4 card-hover-float" onclick="PatientHistoryPage.openAddRecordModal()">
                        <i class="fa-solid fa-plus me-2"></i> เพิ่มประวัติใหม่
                    </button>
                </div>
            </div>

            <div id="ph-header-loading" class="text-center py-5 text-primary"><i class="fas fa-circle-notch fa-spin fa-3x drop-shadow"></i></div>
            
            <div id="ph-header-content" class="modern-panel shadow-sm mb-4 p-4 position-relative overflow-hidden fade-in-up" style="display: none; border-radius: 24px; border-left: 8px solid var(--primary); background: var(--bg-surface);">
                <div style="position: absolute; top: -30px; right: -20px; opacity: 0.03; font-size: 200px; pointer-events: none; color: var(--text-dark); transform: rotate(10deg);"><i class="fa-solid fa-id-card-clip"></i></div>
                <div class="row align-items-center position-relative z-1" id="ph-header-inner"></div>
            </div>

            <div class="emr-custom-tabs-container fade-in-up" style="animation-delay: 0.1s;">
                <div class="emr-custom-tabs" id="emrTabs">
                    <button class="emr-tab-btn tab-timeline-active active" id="btn-tab-timeline" onclick="PatientHistoryPage.switchTab('tab-timeline')">
                        <i class="fa-solid fa-timeline me-2"></i> บันทึกการรักษา
                    </button>
                    <button class="emr-tab-btn" id="btn-tab-vitals" onclick="PatientHistoryPage.switchTab('tab-vitals')">
                        <i class="fa-solid fa-chart-line me-2"></i> กราฟสัญญาณชีพ
                    </button>
                    <button class="emr-tab-btn" id="btn-tab-labs" onclick="PatientHistoryPage.switchTab('tab-labs')">
                        <i class="fa-solid fa-vial-virus me-2"></i> ผลแล็บ
                    </button>
                    <button class="emr-tab-btn" id="btn-tab-xrays" onclick="PatientHistoryPage.switchTab('tab-xrays')">
                        <i class="fa-solid fa-x-ray me-2"></i> ภาพถ่ายรังสี (X-Ray)
                    </button>
                    <button class="emr-tab-btn" id="btn-tab-docs" onclick="PatientHistoryPage.switchTab('tab-docs')">
                        <i class="fa-solid fa-file-image me-2"></i> เอกสาร/ไฟล์แนบ
                    </button>
                    <button class="emr-tab-btn" id="btn-tab-meds" onclick="PatientHistoryPage.switchTab('tab-meds')">
                        <i class="fa-solid fa-pills me-2"></i> ยา/เวชภัณฑ์
                    </button>
                </div>
            </div>

            <div class="emr-tab-content fade-in-up" id="emrTabContent" style="animation-delay: 0.2s;">
                
                <div class="emr-tab-pane active" id="tab-timeline">
                    <div class="modern-panel position-relative overflow-hidden p-4 rounded-4" style="background: var(--bg-surface); border: 1px solid var(--border-color);">
                        <div style="position: absolute; top: -30px; right: -20px; opacity: 0.02; font-size: 200px; pointer-events: none; color: var(--text-dark);"><i class="fa-solid fa-clock-rotate-left"></i></div>
                        
                        <div class="d-flex justify-content-between align-items-center mb-4 position-relative z-1 flex-wrap gap-2 border-bottom pb-3">
                            <h4 class="fw-bold text-dark mb-0"><i class="fa-solid fa-clipboard-list text-primary me-2"></i> ประวัติการเข้าฟอกเลือด</h4>
                            <div class="d-flex align-items-center gap-2 bg-light p-1 rounded-pill shadow-sm border border-light" style="background: rgba(0,0,0,0.03) !important;">
                                <span class="text-secondary fw-bold ms-3 small"><i class="fa-solid fa-filter me-1"></i> กรองวันที่:</span>
                                <input type="date" id="ph-date-filter-timeline" class="form-control form-control-sm border-0 shadow-sm rounded-pill fw-bold text-primary px-3" style="width: 140px; cursor:pointer; background: var(--bg-surface);" onchange="PatientHistoryPage.filterTimeline(this.value)">
                                <button class="btn btn-sm btn-light text-danger rounded-circle shadow-sm" style="width:30px; height:30px; padding:0; background: var(--bg-surface);" onclick="document.getElementById('ph-date-filter-timeline').value=''; PatientHistoryPage.filterTimeline('')"><i class="fa-solid fa-times"></i></button>
                            </div>
                        </div>

                        <div class="emr-scroll-area position-relative z-1"><div id="ph-timeline-content"></div></div>
                    </div>
                </div>

                <div class="emr-tab-pane" id="tab-vitals">
                    <div class="modern-panel p-4 rounded-4" style="background: var(--bg-surface); border: 1px solid var(--border-color);">
                        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 border-bottom pb-3">
                            <h4 class="fw-bold text-dark mb-0"><i class="fa-solid fa-heart-pulse text-success me-2"></i> กราฟแนวโน้มสัญญาณชีพ</h4>
                            <div class="d-flex align-items-center gap-2 bg-light p-1 rounded-pill shadow-sm border border-light" style="background: rgba(0,0,0,0.03) !important;">
                                <span class="text-secondary fw-bold ms-3 small"><i class="fa-solid fa-filter me-1"></i> กรองวันที่:</span>
                                <input type="date" id="ph-date-filter-vitals" class="form-control form-control-sm border-0 shadow-sm rounded-pill fw-bold text-success px-3" style="width: 140px; cursor:pointer; background: var(--bg-surface);" onchange="PatientHistoryPage.filterVitals(this.value)">
                                <button class="btn btn-sm btn-light text-danger rounded-circle shadow-sm" style="width:30px; height:30px; padding:0; background: var(--bg-surface);" onclick="document.getElementById('ph-date-filter-vitals').value=''; PatientHistoryPage.filterVitals('')"><i class="fa-solid fa-times"></i></button>
                            </div>
                        </div>
                        <div class="emr-scroll-area" style="overflow-x: auto;">
                            <div style="height: 400px; min-width: 700px; width: 100%;"><canvas id="vitalsChart"></canvas></div>
                        </div>
                    </div>
                </div>

                <div class="emr-tab-pane" id="tab-labs">
                    <div class="modern-panel p-4 rounded-4" style="background: var(--bg-surface); border: 1px solid var(--border-color);">
                        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 border-bottom pb-3">
                            <h4 class="fw-bold text-dark mb-0"><i class="fa-solid fa-microscope text-danger me-2"></i> ผลตรวจห้องปฏิบัติการ (Labs)</h4>
                            <div class="d-flex gap-2 flex-wrap">
                                <div class="d-flex align-items-center gap-2 bg-light p-1 rounded-pill shadow-sm border border-light" style="background: rgba(0,0,0,0.03) !important;">
                                    <span class="text-secondary fw-bold ms-3 small"><i class="fa-solid fa-filter me-1"></i> กรองวันที่:</span>
                                    <input type="date" id="ph-date-filter-labs" class="form-control form-control-sm border-0 shadow-sm rounded-pill fw-bold text-danger px-3" style="width: 140px; cursor:pointer; background: var(--bg-surface);" onchange="PatientHistoryPage.filterLabs(this.value)">
                                    <button class="btn btn-sm btn-light text-danger rounded-circle shadow-sm" style="width:30px; height:30px; padding:0; background: var(--bg-surface);" onclick="document.getElementById('ph-date-filter-labs').value=''; PatientHistoryPage.filterLabs('')"><i class="fa-solid fa-times"></i></button>
                                </div>
                                <button class="btn text-white fw-bold shadow-sm rounded-pill px-4" style="background: linear-gradient(135deg, #ef4444, #dc2626);" onclick="PatientHistoryPage.openAddLabModal()"><i class="fa-solid fa-plus me-2"></i> เพิ่มผลแล็บ</button>
                            </div>
                        </div>
                        <div class="emr-scroll-area rounded-4 shadow-sm" style="padding-right:0; border: 1px solid var(--border-color); overflow:hidden;">
                            <div class="table-responsive m-0">
                                <table class="table table-premium w-100 mb-0" style="margin: 0 !important;">
                                    <thead style="background: rgba(239,68,68,0.1); position: sticky; top: 0; z-index: 10;">
                                        <tr>
                                            <th class="text-danger fw-bold"><i class="fa-regular fa-calendar-days me-2"></i> วันที่</th>
                                            <th class="text-danger fw-bold">ชุดแล็บอ้างอิง</th>
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
                </div>

                <div class="emr-tab-pane" id="tab-xrays">
                    <div class="modern-panel p-4 rounded-4" style="background: var(--bg-surface); border: 1px solid var(--border-color);">
                        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 border-bottom pb-3">
                            <h4 class="fw-bold text-dark mb-0"><i class="fa-solid fa-x-ray text-info me-2"></i> ภาพถ่ายรังสี (X-Ray)</h4>
                            <div class="d-flex align-items-center gap-2 bg-light p-1 rounded-pill shadow-sm border border-light" style="background: rgba(0,0,0,0.03) !important;">
                                <span class="text-secondary fw-bold ms-3 small"><i class="fa-solid fa-filter me-1"></i> กรองวันที่:</span>
                                <input type="date" id="ph-date-filter-xrays" class="form-control form-control-sm border-0 shadow-sm rounded-pill fw-bold text-info px-3" style="width: 140px; cursor:pointer; background: var(--bg-surface);" onchange="PatientHistoryPage.filterXrays(this.value)">
                                <button class="btn btn-sm btn-light text-danger rounded-circle shadow-sm" style="width:30px; height:30px; padding:0; background: var(--bg-surface);" onclick="document.getElementById('ph-date-filter-xrays').value=''; PatientHistoryPage.filterXrays('')"><i class="fa-solid fa-times"></i></button>
                            </div>
                        </div>
                        <div class="emr-scroll-area"><div id="ph-xrays-content" class="row g-3 m-0"></div></div>
                    </div>
                </div>

                <div class="emr-tab-pane" id="tab-docs">
                    <div class="modern-panel p-4 rounded-4" style="background: var(--bg-surface); border: 1px solid var(--border-color);">
                        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 border-bottom pb-3">
                            <h4 class="fw-bold text-dark mb-0"><i class="fa-solid fa-file-image text-purple me-2" style="color: #8b5cf6;"></i> เอกสารและไฟล์สแกน</h4>
                            <div class="d-flex gap-2 flex-wrap">
                                <div class="d-flex align-items-center gap-2 bg-light p-1 rounded-pill shadow-sm border border-light" style="background: rgba(0,0,0,0.03) !important;">
                                    <span class="text-secondary fw-bold ms-3 small"><i class="fa-solid fa-filter me-1"></i> กรองวันที่:</span>
                                    <input type="date" id="ph-date-filter-docs" class="form-control form-control-sm border-0 shadow-sm rounded-pill fw-bold text-purple px-3" style="color: #8b5cf6; width: 140px; cursor:pointer; background: var(--bg-surface);" onchange="PatientHistoryPage.filterDocs(this.value)">
                                    <button class="btn btn-sm btn-light text-danger rounded-circle shadow-sm" style="width:30px; height:30px; padding:0; background: var(--bg-surface);" onclick="document.getElementById('ph-date-filter-docs').value=''; PatientHistoryPage.filterDocs('')"><i class="fa-solid fa-times"></i></button>
                                </div>
                                <button class="btn text-white shadow-sm fw-bold rounded-pill px-4" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9);" onclick="PatientHistoryPage.goToDocumentCenter()"><i class="fa-solid fa-folder-tree me-2"></i> ไปหน้าคลังเอกสาร</button>
                            </div>
                        </div>
                        <div class="emr-scroll-area"><div id="ph-docs-content" class="row g-3 m-0"></div></div>
                    </div>
                </div>

                <div class="emr-tab-pane" id="tab-meds">
                    <div class="modern-panel p-4 rounded-4" style="background: var(--bg-surface); border: 1px solid var(--border-color);">
                        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 border-bottom pb-3">
                            <h4 class="fw-bold text-dark mb-0"><i class="fa-solid fa-box-open text-warning me-2"></i> เวชภัณฑ์และยาที่ใช้ในปัจจุบัน</h4>
                            <div class="d-flex gap-2 flex-wrap">
                                <div class="d-flex align-items-center gap-2 bg-light p-1 rounded-pill shadow-sm border border-light" style="background: rgba(0,0,0,0.03) !important;">
                                    <span class="text-secondary fw-bold ms-3 small" title="ค้นหาประวัติในอดีต"><i class="fa-solid fa-filter me-1"></i> กรองวันที่ในอดีต:</span>
                                    <input type="date" id="ph-date-filter-meds" class="form-control form-control-sm border-0 shadow-sm rounded-pill fw-bold text-warning-dark px-3" style="width: 140px; cursor:pointer; background: var(--bg-surface);" onchange="PatientHistoryPage.filterMeds(this.value)">
                                    <button class="btn btn-sm btn-light text-danger rounded-circle shadow-sm" style="width:30px; height:30px; padding:0; background: var(--bg-surface);" onclick="document.getElementById('ph-date-filter-meds').value=''; PatientHistoryPage.filterMeds('')"><i class="fa-solid fa-times"></i></button>
                                </div>
                                <button class="btn text-white fw-bold shadow-sm rounded-pill px-4" onclick="PatientHistoryPage.openAddMedModal()" style="background: linear-gradient(135deg, #10b981, #059669); border:none;"><i class="fa-solid fa-plus me-2"></i> เพิ่มรายการยา</button>
                            </div>
                        </div>
                        <div class="emr-scroll-area"><div id="ph-meds-content" class="row g-3 m-0"></div></div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    init(hn = null) {
        this.timelineLimit = 15; this.labLimit = 15; this.docLimit = 16;
        this.currentTimelineFilter = ''; this.currentLabFilter = ''; this.currentXrayFilter = ''; this.currentDocFilter = ''; this.currentVitalsFilter = ''; this.currentMedsFilter = '';
        this.firebaseKey = null;

        this.setupMasterDataListeners();

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
                    });
                };
                if (firebase.auth().currentUser) execSearchLoad();
                else firebase.auth().onAuthStateChanged((user) => { if(user) execSearchLoad(); });
            }
            return;
        }
        
        document.getElementById('ph-search-screen').style.display = 'none';
        document.getElementById('ph-main-screen').style.display = 'block';
        this.hn = hn; 
        
        if (typeof firebase !== 'undefined' && firebase.auth().currentUser) { this.loadPatientData(); } 
        else if (typeof firebase !== 'undefined') { firebase.auth().onAuthStateChanged((user) => { if(user) this.loadPatientData(); }); }
    }

    setupMasterDataListeners() {
        if (typeof db === 'undefined') return;

        const bindData = (path, targetArray) => {
            const cb = db.ref(path).on('value', snap => {
                if(snap.exists()) {
                    const data = snap.val();
                    this[targetArray] = Array.isArray(data) ? data : Object.keys(data).map(k => data[k]);
                }
            });
            this.firebaseListeners.push({ path, callback: cb });
        };

        bindData('clinic_meds_list_v2', 'medItems');
        bindData('clinic_meds_v2', 'medItems');
        bindData('clinic_lab_sets_v2', 'labSets');
        bindData('clinic_labs_v2', 'labSets');
        bindData('inventory_database_v2/items', 'invItems');
        bindData('clinic_xray_list_v2', 'xraysList');
    }

    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        if (this.chartInstance) { this.chartInstance.destroy(); this.chartInstance = null; }
    }

    async loadPatientData() {
        if (typeof db === 'undefined') return;
        const loadingEl = document.getElementById('ph-header-loading');
        loadingEl.style.display = 'block';

        try {
            const [ptSnap, visitSnap, xraySnap] = await Promise.all([
                db.ref('patients_database_v2/patients').once('value'), 
                db.ref('patients_database_v2/visits').once('value'),
                db.ref('clinic_xray_list_v2').once('value')
            ]);
            
            const toArray = (snapVal) => snapVal ? (Array.isArray(snapVal) ? snapVal : Object.keys(snapVal).map(k => snapVal[k])).filter(Boolean) : [];
            
            let foundPt = null; let foundKey = null;
            ptSnap.forEach(child => { if (child.val().hn === this.hn) { foundPt = child.val(); foundKey = child.key; } });

            this.patientData = foundPt;
            this.firebaseKey = foundKey;

            if (!this.patientData) { Swal.fire('Error', 'ไม่พบข้อมูล', 'error'); App.switchPage('patients'); return; }

            // 🚨 Parse Firebase Array Structures Safely
            this.patientData.history = this.parseFBArray(this.patientData.history).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            this.patientData.labs = this.parseFBArray(this.patientData.labs).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            this.patientData.medications = this.parseFBArray(this.patientData.medications);
            
            this.allVisits = toArray(visitSnap.val()).filter(v => v.hn === this.hn);
            this.xraysList = toArray(xraySnap.val());

            this.renderHeader(); 
            
            try { this.renderTimeline(); } catch(e) { console.error("Timeline Render Error:", e); }
            try { this.renderLabs(); } catch(e) { console.error("Labs Render Error:", e); }
            try { this.renderMeds(); } catch(e) { console.error("Meds Render Error:", e); }
            try { this.renderXraysTab(); } catch(e) { console.error("Xrays Render Error:", e); }
            try { this.renderDocsTab(); } catch(e) { console.error("Docs Render Error:", e); }
            
            this.switchTab('tab-timeline');
            
        } catch (e) { 
            console.error("Load Patient Data Error:", e);
            const loadingEl = document.getElementById('ph-header-loading');
            loadingEl.style.display = 'block'; 
            loadingEl.innerHTML = `<div class="text-danger py-5"><i class="fa-solid fa-triangle-exclamation fa-3x mb-3"></i><br>ดึงข้อมูลล้มเหลว: ${e.message}</div>`;
        }
    }

    renderHeader() {
        document.getElementById('ph-header-loading').style.display = 'none';
        const headerContainer = document.getElementById('ph-header-content'); 
        headerContainer.style.display = 'block';
        
        const p = this.patientData;
        let imgSrc = p.photo_base64 && typeof p.photo_base64 === 'string' ? (p.photo_base64.startsWith('data:image') ? p.photo_base64 : 'data:image/jpeg;base64,' + p.photo_base64) : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name_th)}&background=e2e8f0&color=64748b`;
        
        document.getElementById('ph-header-inner').innerHTML = `
            <div class="col-md-2 text-center mb-3 mb-md-0">
                <img src="${imgSrc}" style="width:120px;height:120px;border-radius:24px;object-fit:cover;border:4px solid var(--bg-surface);box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            </div>
            <div class="col-md-10">
                <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                        <h3 class="fw-bold text-dark mb-1" style="font-family:'Prompt'; font-size: 26px;">${p.title||''}${this.escapeHTML(p.name_th)}</h3>
                        <div class="text-primary fw-bold" style="font-size: 16px;">
                            <i class="fa-solid fa-id-card-clip me-1"></i> HN: <span class="fs-4">${p.hn}</span> 
                            <span class="text-muted fw-normal ms-3"><i class="fa-solid fa-calendar text-secondary me-1"></i> อายุ: ${p.age || '-'}</span>
                            <span class="text-danger fw-bold ms-3"><i class="fa-solid fa-droplet me-1"></i> เลือด: ${p.blood_type || '-'}</span>
                        </div>
                    </div>
                    <div class="text-end d-flex flex-column align-items-end gap-2">
                        <span class="badge px-4 py-2 fs-6 shadow-sm rounded-pill" style="background: linear-gradient(135deg, #10b981, #059669); border: 2px solid var(--bg-surface);"><i class="fa-solid fa-shield-heart me-2"></i> สิทธิ: ${p.right || 'ไม่ระบุ'}</span>
                        <button class="btn btn-sm btn-outline-primary rounded-pill shadow-sm px-3 fw-bold bg-white" onclick="PatientHistoryPage.goToEditPatient()">
                            <i class="fa-solid fa-user-pen me-1"></i> แก้ไขข้อมูลส่วนตัว
                        </button>
                    </div>
                </div>
            </div>`;
    }

    getMedNameFromId(id) {
        if(!id) return '-';
        let found = this.invItems.find(i => String(i.id) === String(id) || String(i.name) === String(id)) || 
                    this.medItems.find(m => String(m.id || m) === String(id) || String(m.name || m) === String(id));
        return found ? (found.name || found) : id; 
    }

    getXrayNameFromId(id) {
        if(!id) return '-';
        let found = this.xraysList.find(x => String(x.id) === String(id) || String(x.name) === String(id));
        return found ? (found.name || found) : id; 
    }

    filterTimeline(dateStr) { this.currentTimelineFilter = dateStr; this.renderTimeline(); }
    filterVitals(dateStr) { this.currentVitalsFilter = dateStr; this.renderChart(); }
    filterLabs(dateStr) { this.currentLabFilter = dateStr; this.renderLabs(); }
    filterXrays(dateStr) { this.currentXrayFilter = dateStr; this.renderXraysTab(); }
    filterDocs(dateStr) { this.currentDocFilter = dateStr; this.renderDocsTab(); }
    filterMeds(dateStr) { this.currentMedsFilter = dateStr; this.renderMeds(); }

    loadMoreTimeline() { this.timelineLimit += 10; this.renderTimeline(); }
    loadMoreLabs() { this.labLimit += 10; this.renderLabs(); }
    loadMoreDocs() { this.docLimit += 12; this.renderDocsTab(); }

    searchPatients(term) {
        const container = document.getElementById('ph-search-results');
        const searchTerm = term.toLowerCase().trim();
        if (!searchTerm) { container.innerHTML = ''; return; }

        const results = this.allPatientsList.filter(p => (p.name_th || '').toLowerCase().includes(searchTerm) || (p.hn || '').toLowerCase().includes(searchTerm)).slice(0, 12); 

        if (results.length === 0) { container.innerHTML = '<div class="col-12 text-center text-muted py-4"><i class="fa-solid fa-user-xmark fa-2x mb-2"></i><br>ไม่พบข้อมูลที่ค้นหา</div>'; return; }

        let html = '';
        results.forEach(p => {
            let imgSrc = p.photo_base64 && typeof p.photo_base64 === 'string' ? (p.photo_base64.startsWith('data:image') ? p.photo_base64 : 'data:image/jpeg;base64,' + p.photo_base64) : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name_th)}&background=e2e8f0&color=64748b`;
            html += `
            <div class="col-md-6 col-lg-4">
                <div class="p-3 bg-white border border-light rounded-4 shadow-sm d-flex align-items-center card-hover-float" style="cursor: pointer;" onclick="PatientHistoryPage.init('${p.hn}')">
                    <img src="${imgSrc}" class="rounded-circle me-3" style="width: 50px; height: 50px; object-fit: cover;">
                    <div class="min-w-0">
                        <div class="fw-bold text-dark text-truncate" style="font-family:'Prompt'; font-size: 15px;">${p.title||''}${this.escapeHTML(p.name_th)}</div>
                        <div class="text-primary small fw-bold">HN: ${p.hn}</div>
                    </div>
                </div>
            </div>`;
        });
        container.innerHTML = html;
    }

    renderTimeline() {
        const container = document.getElementById('ph-timeline-content');
        let filteredHistory = this.patientData.history;
        if (this.currentTimelineFilter) filteredHistory = filteredHistory.filter(h => h.date === this.currentTimelineFilter);
        if (filteredHistory.length === 0) { container.innerHTML = `<div class="text-center py-5 text-muted"><i class="fa-solid fa-calendar-xmark fa-3x mb-3" style="opacity:0.2;"></i><br>ยังไม่มีประวัติการรักษา</div>`; return; }

        let html = `<div class="timeline" style="border-left: 4px solid var(--border-color); padding-left: 24px; margin-left: 15px; margin-top: 15px;">`;
        let recordsToShow = this.currentTimelineFilter ? filteredHistory : filteredHistory.slice(0, this.timelineLimit);
        
        recordsToShow.forEach((historyRow, index) => {
            let visit = this.allVisits.find(v => v.id === historyRow.id) || {};
            const dateStr = new Date(historyRow.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
            
            let dName = visit.hd_dialysate_item ? this.getMedNameFromId(visit.hd_dialysate_item) + (visit.hd_dialysate_qty ? ` (${visit.hd_dialysate_qty})` : '') : '-';
            let nName = visit.hd_saline_item ? this.getMedNameFromId(visit.hd_saline_item) + (visit.hd_saline_qty ? ` (${visit.hd_saline_qty})` : '') : '-';
            let hName = visit.hd_heparin_item ? this.getMedNameFromId(visit.hd_heparin_item) + (visit.hd_heparin_qty ? ` (${visit.hd_heparin_qty})` : '') : '-';

            let otherMeds = this.parseFBArray(visit.other_meds).filter(m => m && typeof m === 'object');
            let xrays = this.parseFBArray(visit.xray_list).filter(x => x && typeof x === 'object');
            
            let medsContainer = '';
            if(dName !== '-' || nName !== '-' || hName !== '-' || otherMeds.length > 0 || xrays.length > 0) {
                medsContainer = `<div class="d-flex flex-wrap gap-2 mb-3 mt-2">`;
                if(dName !== '-') medsContainer += `<span class="badge rounded-pill px-3 py-2 shadow-sm" style="background: linear-gradient(135deg, #f59e0b, #d97706); color:#fff; font-size:12px;"><i class="fa-solid fa-soap me-2"></i> น้ำยาไต: ${dName}</span>`;
                if(nName !== '-') medsContainer += `<span class="badge rounded-pill px-3 py-2 shadow-sm" style="background: linear-gradient(135deg, #0ea5e9, #0284c7); color:#fff; font-size:12px;"><i class="fa-solid fa-bottle-droplet me-2"></i> NSS: ${nName}</span>`;
                if(hName !== '-') medsContainer += `<span class="badge rounded-pill px-3 py-2 shadow-sm" style="background: linear-gradient(135deg, #ef4444, #dc2626); color:#fff; font-size:12px;"><i class="fa-solid fa-syringe me-2"></i> Heparin: ${hName}</span>`;
                
                otherMeds.forEach(m => {
                    if(m.id && m.qty) {
                        let mName = this.getMedNameFromId(m.id);
                        medsContainer += `<span class="badge rounded-pill px-3 py-2 shadow-sm" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); color:#fff; font-size:12px;"><i class="fa-solid fa-pills me-2"></i> ยา/เวชภัณฑ์: ${this.escapeHTML(mName)} (จำนวน: ${m.qty})</span>`;
                    }
                });

                xrays.forEach(x => {
                    if(x.id && x.qty) {
                        let xName = this.getXrayNameFromId(x.id);
                        medsContainer += `<span class="badge rounded-pill px-3 py-2 shadow-sm" style="background: linear-gradient(135deg, #14b8a6, #0f766e); color:#fff; font-size:12px;"><i class="fa-solid fa-x-ray me-2"></i> X-Ray: ${this.escapeHTML(xName)}</span>`;
                    }
                });
                medsContainer += `</div>`;
            }

            html += `
                <div class="position-relative mb-5">
                    <div class="timeline-point" style="background: var(--primary); border-color: var(--bg-surface); box-shadow: 0 0 0 3px var(--border-color);"></div>
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h5 class="fw-bold text-dark mb-1" style="font-family:'Prompt';"><i class="fa-regular fa-calendar me-2 text-primary"></i>${dateStr}</h5>
                            <div class="text-primary fw-bold" style="font-size:13px;"><i class="fa-solid fa-user-pen me-2"></i> ${this.escapeHTML(historyRow.doctor) || 'ไม่ระบุผู้ทำรายการ'}</div>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-sm btn-light border text-warning-dark shadow-sm px-3 py-1 rounded-pill" onclick="PatientHistoryPage.editRecord('${historyRow.id || index}')" title="แก้ไข"><i class="fa-solid fa-pen me-1"></i> แก้ไข</button>
                            <button class="btn btn-sm btn-light border text-danger shadow-sm px-3 py-1 rounded-pill" onclick="PatientHistoryPage.deleteRecord('${historyRow.id || index}')" title="ลบ"><i class="fa-solid fa-trash me-1"></i> ลบ</button>
                        </div>
                    </div>
                    
                    <div class="mb-3 d-flex gap-2">
                        <span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2 rounded-pill shadow-sm" style="font-size:12px;"><i class="fa-solid fa-heart-pulse me-2"></i> BP: <b>${historyRow.bp || '-'}</b></span>
                        <span class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-3 py-2 rounded-pill shadow-sm" style="font-size:12px;"><i class="fa-solid fa-weight-scale me-2"></i> Wt: <b>${historyRow.weight || '-'}</b> Kg</span>
                    </div>
                    
                    ${medsContainer}
                    
                    <div class="p-4 rounded-4 shadow-sm border" style="background: rgba(0,0,0,0.02); border-color: var(--border-color) !important;">
                        <div class="fw-bold text-primary mb-1" style="font-size:14px;"><i class="fa-solid fa-comment-medical me-2"></i> อาการสำคัญ (Chief Complaint):</div>
                        <div class="mb-3 text-dark ps-4 fw-medium">${this.escapeHTML(visit.cc || historyRow.cc || '-')}</div>
                        
                        <div class="fw-bold text-warning-dark mb-1" style="font-size:14px;"><i class="fa-solid fa-notes-medical me-2"></i> บันทึกการรักษา (Progress Notes):</div>
                        <div class="text-dark ps-4 fw-medium" style="white-space: pre-wrap;">${this.escapeHTML(visit.note || historyRow.note || '-')}</div>
                    </div>
                </div>`;
        });
        html += `</div>`;

        if (!this.currentTimelineFilter && filteredHistory.length > this.timelineLimit) {
            let remaining = filteredHistory.length - this.timelineLimit;
            html += `<div class="text-center mt-4 mb-4"><button class="btn btn-light text-primary fw-bold rounded-pill px-5 py-2 shadow-sm border border-light" onclick="PatientHistoryPage.loadMoreTimeline()"><i class="fa-solid fa-angle-down me-2"></i> โหลดประวัติเก่าเพิ่มเติม (เหลือ ${remaining} วัน)</button></div>`;
        }

        container.innerHTML = html;
    }

    renderXraysTab() {
        const container = document.getElementById('ph-xrays-content');
        let html = '';
        let hasXray = false;

        let filteredHistory = this.patientData.history;
        if(this.currentXrayFilter) filteredHistory = filteredHistory.filter(h => h.date === this.currentXrayFilter);

        filteredHistory.forEach(historyRow => {
            let visit = this.allVisits.find(v => v.id === historyRow.id) || {};
            let xrays = this.parseFBArray(visit.xray_list).filter(x => x && typeof x === 'object');
            
            if(xrays.length > 0) {
                hasXray = true;
                const dateStr = new Date(historyRow.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
                
                let xrayItemsHtml = '';
                xrays.forEach(x => {
                    let xName = this.getXrayNameFromId(x.id);
                    xrayItemsHtml += `
                        <div class="d-flex justify-content-between align-items-center border-bottom border-light pb-2 mb-2">
                            <div class="fw-bold text-dark"><i class="fa-solid fa-caret-right text-info me-2"></i> ${this.escapeHTML(xName)}</div>
                            <div class="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 rounded-pill">${x.qty} ครั้ง</div>
                        </div>
                    `;
                });

                html += `
                <div class="col-md-6 col-lg-4">
                    <div class="p-3 bg-white border border-light rounded-4 shadow-sm card-hover-float" style="background: var(--bg-surface) !important; border-color: var(--border-color) !important;">
                        <div class="d-flex align-items-center mb-3 pb-2 border-bottom border-light">
                            <div class="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm bg-info text-white" style="width: 45px; height: 45px;">
                                <i class="fa-solid fa-calendar-day fa-lg"></i>
                            </div>
                            <div>
                                <div class="fw-bold text-dark" style="font-size:15px; font-family:'Prompt';">${dateStr}</div>
                                <div class="text-info fw-bold" style="font-size:12px;">ผู้ทำรายการ: ${this.escapeHTML(historyRow.doctor || '-')}</div>
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
    }

    renderDocsTab() {
        try {
            const container = document.getElementById('ph-docs-content');
            if (!container) return; 
            
            let allDocsOfPatient = [];
            
            this.allVisits.forEach(visit => {
                let docs = this.parseFBArray(visit.attachments);

                if (docs.length > 0) {
                    docs.forEach((doc, idx) => { 
                        if (!doc) return;
                        
                        let docObj = {
                            id: `DOC_${visit.id}_${idx}`,
                            visitDate: visit.date || '1970-01-01',
                            name: 'เอกสารแนบ',
                            type: 'image',
                            dataUrl: ''
                        };

                        if (typeof doc === 'string') {
                            docObj.dataUrl = doc;
                            if (doc.startsWith('data:application/pdf')) docObj.type = 'pdf';
                        } else if (typeof doc === 'object') {
                            docObj.id = doc.id || docObj.id;
                            docObj.name = doc.name || doc.fileName || docObj.name;
                            docObj.type = doc.type || (doc.dataUrl && String(doc.dataUrl).startsWith('data:application/pdf') ? 'pdf' : 'image');
                            docObj.dataUrl = doc.dataUrl || doc.url || doc.base64 || doc.file || '';
                        }

                        if (docObj.dataUrl && String(docObj.dataUrl).trim() !== '') {
                            allDocsOfPatient.push(docObj);
                        }
                    });
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
                const safeDataUrl = doc.dataUrl || '';
                const isPdf = doc.type === 'pdf' || String(safeDataUrl).startsWith('data:application/pdf');
                const previewContent = isPdf 
                    ? `<i class="fa-solid fa-file-pdf doc-icon-large text-danger drop-shadow" style="font-size: 50px;"></i>`
                    : `<img src="${safeDataUrl}" alt="Thumbnail" loading="lazy" style="width:100%; height:100%; object-fit:cover;">`;
                
                const dParts = String(doc.visitDate).split('-');
                const displayDate = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}/${dParts[0]}` : doc.visitDate;
                const safeName = this.escapeHTML(doc.name);

                html += `
                <div class="col-6 col-md-4 col-lg-3 fade-in-up" style="animation-delay: ${(idx % 12) * 0.05}s;">
                    <div class="doc-thumb-card" onclick="PatientHistoryPage.viewDocument('${safeDataUrl}', '${isPdf}')">
                        <div class="doc-img-container">
                            ${previewContent}
                        </div>
                        <div class="p-3" style="background: var(--bg-surface);">
                            <div class="fw-bold text-dark text-truncate" style="font-size:13px; margin-bottom: 4px;" title="${safeName}">${safeName}</div>
                            <div class="text-primary fw-bold" style="font-size:11px;"><i class="fa-regular fa-calendar me-1"></i> ${displayDate}</div>
                        </div>
                    </div>
                </div>`;
            });

            if (!this.currentDocFilter && allDocsOfPatient.length > this.docLimit) {
                let remaining = allDocsOfPatient.length - this.docLimit;
                html += `<div class="col-12 text-center mt-4 mb-4"><button class="btn btn-light text-primary fw-bold rounded-pill px-5 py-2 shadow-sm border border-light" onclick="PatientHistoryPage.loadMoreDocs()"><i class="fa-solid fa-angle-down me-2"></i> โหลดไฟล์ก่อนหน้าเพิ่มเติม (เหลือ ${remaining} ไฟล์)</button></div>`;
            }
            container.innerHTML = html;

        } catch (error) {
            console.error("Render Docs Error:", error);
            const container = document.getElementById('ph-docs-content');
            if(container) container.innerHTML = `<div class="col-12 text-center py-5 text-danger"><i class="fa-solid fa-triangle-exclamation fa-3x mb-3"></i><br>เกิดข้อผิดพลาดในการประมวลผลไฟล์แนบ<br><small>${error.message}</small></div>`;
        }
    }

    viewDocument(dataUrl, isPdf) {
        if (isPdf === 'true') {
            Swal.fire({ html: `<iframe src="${dataUrl}" style="width:100%; height:75vh; border:none; border-radius:12px;"></iframe>`, showConfirmButton: false, width: '90%', padding: '10px', showCloseButton: true, customClass: { popup: 'premium-alert' } });
        } else {
            Swal.fire({ imageUrl: dataUrl, imageAlt: 'Scanned Document', showConfirmButton: false, width: '80%', padding: '0', background: 'transparent', showCloseButton: true, customClass: { popup: 'premium-alert' } });
        }
    }

    renderChart() {
        const canvas = document.getElementById('vitalsChart'); if(!canvas) return;
        
        let filteredHistory = this.patientData.history;
        filteredHistory = [...filteredHistory].reverse();

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
    }

    openAddRecordModal() { 
        setTimeout(() => { this.showRecordModal(); }, 300); 
    }
    
    editRecord(idOrIndex) {
        setTimeout(() => {
            let index = this.patientData.history.findIndex(h => h.id === idOrIndex);
            if (index === -1) index = parseInt(idOrIndex);
            this.showRecordModal(this.patientData.history[index], index);
        }, 300);
    }
    
    deleteRecord(idOrIndex) {
        Swal.fire({ title: 'ลบประวัตินี้?', icon: 'warning', showCancelButton: true, confirmButtonText: 'ลบ', confirmButtonColor: '#ef4444' }).then((r) => {
            if (r.isConfirmed) {
                let index = this.patientData.history.findIndex(h => h.id === idOrIndex);
                if (index === -1) index = parseInt(idOrIndex);
                this.patientData.history.splice(index, 1);
                this.saveToDB('tab-timeline');
            }
        });
    }

    showRecordModal(record = null, index = null) {
        let isEdit = record !== null;
        Swal.fire({
            title: `<h4 class="fw-bold text-primary" style="font-family:'Prompt';">${isEdit ? 'แก้ไขประวัติ' : 'เพิ่มบันทึก'}</h4>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <label class="form-label fw-bold small">วันที่</label>
                    <input type="date" id="add-rec-date" class="form-control mb-3" value="${isEdit ? record.date : new Date().toISOString().split('T')[0]}">
                    
                    <div class="row g-3 mb-3">
                        <div class="col-6">
                            <label class="form-label fw-bold text-danger small">ความดัน (BP)</label>
                            <input type="text" id="add-rec-bp" class="form-control fw-bold text-danger" value="${isEdit ? (record.bp==='-'?'':record.bp) : ''}">
                        </div>
                        <div class="col-6">
                            <label class="form-label fw-bold text-info small">น้ำหนัก (Kg)</label>
                            <input type="number" step="0.1" id="add-rec-wt" class="form-control fw-bold text-info" value="${isEdit ? (record.weight==='-'?'':record.weight) : ''}">
                        </div>
                    </div>
                    <label class="form-label fw-bold small">อาการสำคัญ (CC)</label>
                    <input type="text" id="add-rec-cc" class="form-control mb-3" value="${isEdit ? (record.cc==='-'?'':record.cc) : ''}">
                    <label class="form-label fw-bold small">บันทึกการรักษา</label>
                    <textarea id="add-rec-note" class="form-control" rows="4">${isEdit ? (record.note==='-'?'':record.note) : ''}</textarea>
                </div>
            `,
            showCancelButton: true, confirmButtonText: 'บันทึก', confirmButtonColor: '#2563eb',
            preConfirm: () => {
                let newData = {
                    id: isEdit ? record.id : 'REC' + new Date().getTime(),
                    date: document.getElementById('add-rec-date').value,
                    bp: document.getElementById('add-rec-bp').value || '-', weight: document.getElementById('add-rec-wt').value || '-',
                    cc: document.getElementById('add-rec-cc').value || '-', note: document.getElementById('add-rec-note').value,
                    doctor: isEdit ? record.doctor : (App.currentUser ? App.currentUser.name : 'Admin')
                };
                return newData; 
            }
        }).then(res => {
            if (res.isConfirmed) {
                if (!this.patientData.history || !Array.isArray(this.patientData.history)) {
                    this.patientData.history = this.parseFBArray(this.patientData.history);
                }
                if (isEdit) this.patientData.history[index] = res.value; 
                else this.patientData.history.push(res.value);
                this.saveToDB('tab-timeline');
            }
        });
    }

    renderLabs() {
        const container = document.getElementById('ph-labs-content');
        
        let filteredLabs = this.parseFBArray(this.patientData.labs);
        this.patientData.labs = filteredLabs;

        if (filteredLabs.length === 0) { 
            container.innerHTML = `<tr><td colspan="9" class="text-center py-5 text-muted"><i class="fa-solid fa-vial-virus fa-3x mb-3" style="opacity:0.2;"></i><br>ไม่มีผลตรวจห้องปฏิบัติการ</td></tr>`; 
            return; 
        }
        
        let html = '';
        filteredLabs.slice(0, this.labLimit).forEach((lab, index) => {
            const dateStr = new Date(lab.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
            let labValuesHtml = '';
            const coreLabs = ['bun', 'cr', 'k', 'ca', 'p', 'hct'];
            coreLabs.forEach(key => {
                let val = lab[key];
                labValuesHtml += `<td>${val ? `<span class="fw-bold text-dark">${val}</span>` : '<span class="text-muted">-</span>'}</td>`;
            });
            const setName = lab.set_name ? `<span class="badge bg-danger-subtle text-danger border border-danger-subtle">${this.escapeHTML(lab.set_name)}</span>` : '<span class="text-muted small">-</span>';
            
            html += `
            <tr style="background: transparent;">
                <td class="fw-bold text-primary">${dateStr}</td>
                <td class="text-center">${setName}</td>
                ${labValuesHtml}
                <td class="text-center">
                    <button class="btn btn-sm btn-table-edit shadow-sm px-2 py-1 me-1" onclick="PatientHistoryPage.editLab('${lab.id || index}')" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-table-delete shadow-sm px-2 py-1" onclick="PatientHistoryPage.deleteLab('${lab.id || index}')" title="ลบ"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
        });

        if (!this.currentLabFilter && filteredLabs.length > this.labLimit) {
            let remaining = filteredLabs.length - this.labLimit;
            html += `<tr><td colspan="9" class="text-center py-4"><button class="btn btn-light text-danger fw-bold rounded-pill px-5 shadow-sm border border-danger-subtle" onclick="PatientHistoryPage.loadMoreLabs()"><i class="fa-solid fa-angle-down me-2"></i> โหลดผลแล็บเก่าเพิ่มเติม (เหลือ ${remaining} ครั้ง)</button></td></tr>`;
        }

        container.innerHTML = html;
    }

    openAddLabModal() { 
        setTimeout(() => { this.showLabModal(); }, 300); 
    }
    
    editLab(idOrIndex) {
        setTimeout(() => {
            let index = this.patientData.labs.findIndex(l => l.id === idOrIndex);
            if (index === -1) index = parseInt(idOrIndex);
            this.showLabModal(this.patientData.labs[index], index);
        }, 300);
    }

    deleteLab(idOrIndex) {
        Swal.fire({ title: 'ลบผลแล็บนี้?', icon: 'warning', showCancelButton: true, confirmButtonText: 'ลบ', confirmButtonColor: '#ef4444' }).then((r) => {
            if (r.isConfirmed) {
                let index = this.patientData.labs.findIndex(l => l.id === idOrIndex);
                if (index === -1) index = parseInt(idOrIndex);
                this.patientData.labs.splice(index, 1);
                this.saveToDB('tab-labs');
            }
        });
    }

    showLabModal(lab = null, index = null) {
        let isEdit = lab !== null;
        
        let labSelectOptions = '<option value="">-- ไม่ระบุแพ็กเกจ (กรอกเองทั้งหมด) --</option>';
        if (this.labSets && this.labSets.length > 0) {
            this.labSets.forEach(ls => {
                let name = typeof ls === 'object' ? ls.name : ls;
                let isSelected = (isEdit && lab.set_name === name) ? 'selected' : '';
                labSelectOptions += `<option value="${this.escapeHTML(name)}" ${isSelected}>${this.escapeHTML(name)}</option>`;
            });
        }

        window.renderDynamicLabInputs = (selectedSetName) => {
            const container = document.getElementById('dynamic-lab-inputs-container');
            if (!container) return;

            let itemsToShow = ['BUN', 'Cr', 'K', 'Ca', 'P', 'Hct'];
            const foundSet = this.labSets.find(s => (typeof s === 'object' ? s.name : s) === selectedSetName);
            if (foundSet && foundSet.items && Array.isArray(foundSet.items) && foundSet.items.length > 0) { itemsToShow = foundSet.items; }

            let inputsHtml = '';
            itemsToShow.forEach(item => {
                let dbKey = item.toLowerCase();
                let val = (isEdit && lab && lab[dbKey]) ? lab[dbKey] : '';
                let extraClass = dbKey === 'hct' ? 'text-danger border-danger-subtle' : 'text-dark';
                inputsHtml += `
                <div class="col-4 dynamic-input-col">
                    <label class="form-label fw-bold text-secondary small">${this.escapeHTML(item)}</label>
                    <input type="number" step="0.1" id="lab-${dbKey}" data-lab-key="${dbKey}" class="form-control input-modern text-center fw-bold dynamic-lab-input ${extraClass}" value="${val}">
                </div>`;
            });
            container.innerHTML = inputsHtml;
        };

        Swal.fire({
            title: `<h4 class="fw-bold text-danger" style="font-family:'Prompt';"><i class="fa-solid fa-vial-virus me-2"></i>${isEdit ? 'แก้ไขผลตรวจแล็บ' : 'เพิ่มผลตรวจห้องปฏิบัติการ'}</h4>`,
            html: `
                <div class="text-start mt-2" style="font-family:'Sarabun';">
                    <div class="row g-3 mb-3">
                        <div class="col-12">
                            <label class="form-label fw-bold text-dark small"><i class="fa-regular fa-calendar-days me-2"></i> วันที่เจาะเลือด</label>
                            <input type="date" id="lab-date" class="form-control input-modern border-danger" value="${isEdit ? lab.date : new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="col-12">
                            <label class="form-label fw-bold text-secondary small"><i class="fa-solid fa-vials me-2 text-primary"></i> ชุดผลแล็บ</label>
                            <select id="lab-set-name" class="form-select input-modern text-primary fw-bold shadow-sm" style="border-color: var(--primary) !important; cursor: pointer;">
                                ${labSelectOptions}
                            </select>
                        </div>
                    </div>
                    <div id="dynamic-lab-inputs-container" class="row g-3 p-3 rounded-4 shadow-sm border border-danger-subtle bg-light mt-3 mx-1"></div>
                </div>
            `,
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึกแล็บ', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#ef4444', width: 550, customClass: { popup: 'premium-alert' },
            didOpen: () => {
                const selectEl = document.getElementById('lab-set-name');
                if (selectEl) {
                    selectEl.addEventListener('change', (e) => { window.renderDynamicLabInputs(e.target.value); });
                    window.renderDynamicLabInputs(selectEl.value);
                }
            },
            preConfirm: () => {
                let newData = {
                    id: isEdit ? (lab.id || 'LAB'+new Date().getTime()) : 'LAB' + new Date().getTime(),
                    date: document.getElementById('lab-date').value,
                    set_name: document.getElementById('lab-set-name').value || '',
                    bun: '', cr: '', k: '', ca: '', p: '', hct: ''
                };
                document.querySelectorAll('.dynamic-lab-input').forEach(input => {
                    const key = input.getAttribute('data-lab-key');
                    newData[key] = input.value;
                });
                return newData; 
            }
        }).then(res => {
            if (res.isConfirmed) {
                if (!this.patientData.labs || !Array.isArray(this.patientData.labs)) {
                    this.patientData.labs = this.parseFBArray(this.patientData.labs);
                }
                if (isEdit) this.patientData.labs[index] = res.value; 
                else this.patientData.labs.push(res.value);
                this.saveToDB('tab-labs');
            }
        });
    }

    renderMeds() {
        const container = document.getElementById('ph-meds-content');
        if (!container) return;

        try {
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
                const boxStyle = "p-3 bg-white border border-light rounded-4 shadow-sm d-flex align-items-center";
                const darkBoxStyle = "background: var(--bg-surface) !important; border-color: var(--border-color) !important;";

                if(dName) pastMedsHtml += `<div class="col-md-6 col-lg-4"><div class="${boxStyle}" style="${darkBoxStyle}"><div class="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style="width: 55px; height: 55px; background: linear-gradient(135deg, #f59e0b, #d97706); color:white;"><i class="fa-solid fa-soap fa-xl"></i></div><div><div class="fw-bold text-dark" style="font-size:14px;">${this.escapeHTML(dName)}</div><div class="text-muted small">น้ำยาไต</div></div></div></div>`;
                if(nName) pastMedsHtml += `<div class="col-md-6 col-lg-4"><div class="${boxStyle}" style="${darkBoxStyle}"><div class="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style="width: 55px; height: 55px; background: linear-gradient(135deg, #0ea5e9, #0284c7); color:white;"><i class="fa-solid fa-bottle-droplet fa-xl"></i></div><div><div class="fw-bold text-dark" style="font-size:14px;">${this.escapeHTML(nName)}</div><div class="text-muted small">น้ำเกลือ (NSS)</div></div></div></div>`;
                if(hName) pastMedsHtml += `<div class="col-md-6 col-lg-4"><div class="${boxStyle}" style="${darkBoxStyle}"><div class="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style="width: 55px; height: 55px; background: linear-gradient(135deg, #ef4444, #dc2626); color:white;"><i class="fa-solid fa-syringe fa-xl"></i></div><div><div class="fw-bold text-dark" style="font-size:14px;">${this.escapeHTML(hName)}</div><div class="text-muted small">ยาต้านแข็งตัว (Heparin)</div></div></div></div>`;

                let otherMeds = this.parseFBArray(pastVisit.other_meds);
                otherMeds.forEach(m => {
                    if(m && m.id && m.qty) {
                        let mName = this.getMedNameFromId(m.id);
                        pastMedsHtml += `<div class="col-md-6 col-lg-4"><div class="${boxStyle}" style="${darkBoxStyle}"><div class="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style="width: 55px; height: 55px; background: linear-gradient(135deg, #8b5cf6, #6d28d9); color:white;"><i class="fa-solid fa-pills fa-xl"></i></div><div><div class="fw-bold text-dark" style="font-size:14px;">${this.escapeHTML(mName)} (จำนวน: ${m.qty})</div><div class="text-muted small">ยาและเวชภัณฑ์อื่นๆ</div></div></div></div>`;
                    }
                });

                if(!pastMedsHtml) pastMedsHtml = `<div class="col-12 text-center py-4 text-muted"><i class="fa-solid fa-ban fa-2x mb-2"></i><br>ไม่มีการบันทึกการใช้ยาในวันดังกล่าว</div>`;
                container.innerHTML = `<div class="col-12 mb-2"><h6 class="fw-bold text-primary mb-0"><i class="fa-solid fa-history me-2"></i> ประวัติการใช้ยาวันที่: ${new Date(this.currentMedsFilter).toLocaleDateString('th-TH')}</h6></div>` + pastMedsHtml;
                return;
            }

            // 🚨 โหมดยาปัจจุบัน: กรองข้อมูลและแปลงสภาพ (Normalize) ให้สมบูรณ์แบบ
            let rawMeds = this.patientData.medications || [];
            let medsArray = this.parseFBArray(rawMeds);

            // บังคับข้อมูลให้เป็น Object ป้องกันการ Render พัง!
            medsArray = medsArray.map(m => {
                if (typeof m === 'string') return { name: m, dosage: '-' };
                if (typeof m === 'object' && m !== null) return m;
                return null;
            }).filter(m => m && m.name);

            this.patientData.medications = medsArray; 

            if (medsArray.length === 0) { 
                container.innerHTML = `
                    <div class="col-12 text-center py-5 text-muted fade-in-up">
                        <i class="fa-solid fa-pills fa-4x mb-3" style="color: var(--border-color);"></i>
                        <h5 class="fw-bold text-dark">ยังไม่มีรายการยาปัจจุบัน</h5>
                        <p class="small">คลิกที่ปุ่ม "เพิ่มรายการยา" ด้านบนเพื่อบันทึกข้อมูล</p>
                    </div>`; 
                return; 
            }
            
            let html = '';
            medsArray.forEach((med, index) => {
                let safeName = this.escapeHTML(med.name || 'ไม่ระบุชื่อยา');
                let safeDosage = this.escapeHTML(med.dosage || '-');

                html += `
                    <div class="col-md-6 col-lg-4">
                        <div class="p-3 bg-white border border-light rounded-4 shadow-sm d-flex align-items-center card-hover-float" style="background: var(--bg-surface) !important; border-color: var(--border-color) !important;">
                            <div class="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm border border-2 border-white" style="width: 55px; height: 55px; background: linear-gradient(135deg, #8b5cf6, #6d28d9); color:white;"><i class="fa-solid fa-pills fa-xl"></i></div>
                            <div>
                                <div class="fw-bold text-dark" style="font-size:15.5px; font-family:'Prompt';">${safeName}</div>
                                <div class="text-primary fw-bold mt-1" style="font-size:13px;">${safeDosage}</div>
                            </div>
                            <div class="ms-auto d-flex flex-column gap-2">
                                <button class="btn btn-sm btn-table-edit shadow-sm px-2 py-1" onclick="PatientHistoryPage.editMed(${index})" title="แก้ไข"><i class="fa-solid fa-pen"></i></button>
                                <button class="btn btn-sm btn-table-delete shadow-sm px-2 py-1" onclick="PatientHistoryPage.deleteMed(${index})" title="ลบ"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    </div>`;
            });
            container.innerHTML = html;

        } catch (error) {
            console.error("🔥 [Render Meds Fatal Error]:", error);
            container.innerHTML = `<div class="col-12 text-center py-5 text-danger"><i class="fa-solid fa-triangle-exclamation fa-3x mb-3"></i><br>พบข้อผิดพลาดในโครงสร้างข้อมูลยา<br><small>${error.message}</small></div>`;
        }
    }

    openAddMedModal() { 
        setTimeout(() => { this.showMedModal(); }, 300); 
    }
    
    editMed(index) { 
        setTimeout(() => { this.showMedModal(this.patientData.medications[index], index); }, 300); 
    }
    
    deleteMed(index) {
        Swal.fire({ title: 'ลบรายการยานี้?', icon: 'warning', showCancelButton: true, confirmButtonText: 'ลบยา', confirmButtonColor: '#ef4444' }).then((r) => { 
            if (r.isConfirmed) { 
                this.patientData.medications.splice(index, 1); 
                this.saveToDB('tab-meds'); 
            } 
        });
    }

    showMedModal(med = null, index = null) {
        let isEdit = med !== null;
        let medOptions = '';
        if (this.medItems && this.medItems.length > 0) {
            this.medItems.forEach(m => {
                let mName = typeof m === 'object' ? m.name : m;
                if(mName) medOptions += `<option value="${this.escapeHTML(mName)}">ดึงจากตั้งค่าแพทย์</option>`;
            });
        }
        if (this.invItems && this.invItems.length > 0) {
            this.invItems.forEach(inv => {
                if(inv.name) medOptions += `<option value="${this.escapeHTML(inv.name)}">ดึงจากคลังพัสดุ</option>`;
            });
        }

        Swal.fire({
            title: `<h4 class="fw-bold text-warning" style="font-family:'Prompt';"><i class="fa-solid fa-pills me-2"></i>${isEdit ? 'แก้ไขยาและเวชภัณฑ์' : 'เพิ่มยาและเวชภัณฑ์'}</h4>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <label class="form-label fw-bold text-secondary small">ชื่อยา / เวชภัณฑ์ <span class="text-primary" style="font-size: 11px;">(พิมพ์เพื่อดึงยาออโต้)</span></label>
                    <input type="text" id="add-med-name" list="meds-master-list" class="form-control input-modern mb-3 fw-bold text-primary shadow-sm" placeholder="พิมพ์ชื่อ หรือ เลือกจากรายการ..." value="${isEdit ? this.escapeHTML(med.name) : ''}">
                    <datalist id="meds-master-list">${medOptions}</datalist>
                    
                    <label class="form-label fw-bold text-secondary small">จำนวน / ขนาดที่ใช้ <span class="text-danger">*</span></label>
                    <input type="text" id="add-med-qty" class="form-control input-modern fw-bold text-dark shadow-sm" placeholder="เช่น 4000U, 1 เม็ด" value="${isEdit ? this.escapeHTML(med.dosage) : ''}">
                </div>
            `,
            showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึกยา', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#f59e0b', width: 500, customClass: { popup: 'premium-alert' },
            preConfirm: () => { 
                let newData = { name: document.getElementById('add-med-name').value.trim(), dosage: document.getElementById('add-med-qty').value.trim() };
                if(!newData.name || !newData.dosage) { Swal.showValidationMessage('กรุณากรอกชื่อยาและจำนวน'); return false; }
                return newData; 
            }
        }).then(res => {
            if (res.isConfirmed) {
                if (!this.patientData.medications || !Array.isArray(this.patientData.medications)) {
                    this.patientData.medications = this.parseFBArray(this.patientData.medications);
                }

                if (isEdit) this.patientData.medications[index] = res.value; 
                else this.patientData.medications.push(res.value);
                
                this.saveToDB('tab-meds');
            }
        });
    }

    async saveToDB(targetTab = 'tab-timeline') {
        Swal.fire({ title: 'กำลังอัปเดตข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), customClass: { popup: 'premium-alert' } });
        
        if (!this.firebaseKey) {
            Swal.fire('ข้อผิดพลาด', 'ไม่พบรหัสผู้ป่วย', 'error');
            return;
        }

        try {
            const safeHistory = this.parseFBArray(this.patientData.history);
            const safeLabs = this.parseFBArray(this.patientData.labs);
            const safeMeds = this.parseFBArray(this.patientData.medications).filter(m => m && m.name); 

            this.patientData.history = safeHistory;
            this.patientData.labs = safeLabs;
            this.patientData.medications = safeMeds;

            await Promise.all([
                db.ref(`patients_database_v2/patients/${this.firebaseKey}/history`).set(safeHistory.length > 0 ? safeHistory : null),
                db.ref(`patients_database_v2/patients/${this.firebaseKey}/labs`).set(safeLabs.length > 0 ? safeLabs : null),
                db.ref(`patients_database_v2/patients/${this.firebaseKey}/medications`).set(safeMeds.length > 0 ? safeMeds : null)
            ]);

            this.renderTimeline();
            this.renderLabs();
            this.renderMeds();

            if (targetTab) this.switchTab(targetTab);

            Swal.fire({title:'อัปเดตเรียบร้อย!', icon:'success', timer:1200, showConfirmButton:false, customClass: { popup: 'premium-alert' }});
        } catch (err) {
            Swal.fire({ title:'เกิดข้อผิดพลาด', text: err.message, icon: 'error', customClass: { popup: 'premium-alert' }});
        }
    }

    // =================================================================================
    // 🚨 THE FIX: IN-APP PRINT MODAL (หน้าต่างพิมพ์แบบฝังตัว 100%) สำหรับ EMR History
    // เลิกเปิดหน้าต่าง OS ใหม่ แล้วเปิดหน้าจอพรีวิวขึ้นมาทับแอปหลักแทน!
    // =================================================================================
    async printEMR() {
        if (!this.patientData) {
            Swal.fire({title: 'ข้อผิดพลาด', text: 'ไม่พบข้อมูลผู้ป่วยสำหรับพิมพ์', icon: 'error'});
            return;
        }

        Swal.fire({ title: 'กำลังดึงข้อมูลเพื่อสร้างแฟ้มประวัติ...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), customClass: { popup: 'premium-alert' } });

        try {
            const p = this.patientData;
            let historyHtml = '';
            let sortedHistory = [...(p.history || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
            
            if (sortedHistory.length > 0) {
                historyHtml = sortedHistory.map(h => {
                    let visit = this.allVisits.find(v => v.id === h.id) || {};
                    let medsText = [];
                    if(visit.hd_dialysate_item) medsText.push(`น้ำยา: ${this.getMedNameFromId(visit.hd_dialysate_item)}`);
                    if(visit.hd_saline_item) medsText.push(`NSS: ${this.getMedNameFromId(visit.hd_saline_item)}`);
                    if(visit.hd_heparin_item) medsText.push(`Heparin: ${this.getMedNameFromId(visit.hd_heparin_item)}`);
                    
                    let otherMeds = this.parseFBArray(visit.other_meds).filter(m => m && typeof m === 'object');
                    otherMeds.forEach(m => {
                        if(m.id && m.qty) medsText.push(`${this.getMedNameFromId(m.id)} (${m.qty})`);
                    });

                    return `
                    <div style="border-bottom: 1px dashed #cbd5e1; padding: 15px 0; page-break-inside: avoid;">
                        <div style="font-family:'Prompt', sans-serif; font-weight:700; font-size: 15px; color:#1e40af; display: flex; align-items: center; justify-content: space-between;">
                            <span>วันที่: ${new Date(h.date).toLocaleDateString('th-TH')}</span>
                            <span style="font-weight:normal; font-size: 12px; color:#64748b; background:#f1f5f9; padding: 2px 8px; border-radius: 12px;">ผู้บันทึก: ${h.doctor || '-'}</span>
                        </div>
                        <div style="font-size:14px; color:#334155; margin-top: 8px;">
                            <span style="background:#fef2f2; border:1px solid #fecaca; color:#ef4444; padding:2px 6px; border-radius:6px; margin-right:8px; font-weight:bold;">BP: ${h.bp || '-'}</span>
                            <span style="background:#eff6ff; border:1px solid #bfdbfe; color:#3b82f6; padding:2px 6px; border-radius:6px; font-weight:bold;">Wt: ${h.weight || '-'} Kg</span>
                        </div>
                        <div style="font-size:13px; color:#475569; margin-top: 8px;"><b>การใช้ยา/เวชภัณฑ์:</b> ${medsText.length > 0 ? medsText.join(', ') : '-'}</div>
                        <div style="margin-top:8px; font-size:13px; color:#0f172a;"><b>อาการสำคัญ (CC):</b> ${visit.cc || h.cc || '-'}</div>
                        <div style="font-size:13px; margin-top: 4px; color:#334155;"><b>บันทึกการรักษา (Note):</b> ${visit.note || h.note || '-'}</div>
                    </div>`;
                }).join('');
            } else {
                historyHtml = '<div style="padding: 20px; color: #94a3b8; text-align: center; font-style: italic;">ไม่มีประวัติการรักษาในระบบ</div>';
            }

            let labsHtml = '';
            let sortedLabs = [...(p.labs || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
            if (sortedLabs.length > 0) {
                labsHtml = `
                <table style="width:100%; border-collapse: collapse; margin-top:10px; font-size:13px; text-align: center;">
                    <tr style="background:#f1f5f9; color:#0f172a; font-family:'Prompt', sans-serif;">
                        <th style="border:1px solid #cbd5e1; padding:10px;">วันที่</th>
                        <th style="border:1px solid #cbd5e1; padding:10px;">ชุดแล็บ</th>
                        <th style="border:1px solid #cbd5e1; padding:10px;">BUN</th>
                        <th style="border:1px solid #cbd5e1; padding:10px;">Cr</th>
                        <th style="border:1px solid #cbd5e1; padding:10px;">K</th>
                        <th style="border:1px solid #cbd5e1; padding:10px;">Ca</th>
                        <th style="border:1px solid #cbd5e1; padding:10px;">P</th>
                        <th style="border:1px solid #cbd5e1; padding:10px;">Hct</th>
                    </tr>
                    ${sortedLabs.map(l => `
                    <tr>
                        <td style="border:1px solid #cbd5e1; padding:8px;">${new Date(l.date).toLocaleDateString('th-TH')}</td>
                        <td style="border:1px solid #cbd5e1; padding:8px; font-weight:bold; color:#2563eb;">${this.escapeHTML(l.set_name || '-')}</td>
                        <td style="border:1px solid #cbd5e1; padding:8px;">${l.bun||'-'}</td>
                        <td style="border:1px solid #cbd5e1; padding:8px;">${l.cr||'-'}</td>
                        <td style="border:1px solid #cbd5e1; padding:8px;">${l.k||'-'}</td>
                        <td style="border:1px solid #cbd5e1; padding:8px;">${l.ca||'-'}</td>
                        <td style="border:1px solid #cbd5e1; padding:8px;">${l.p||'-'}</td>
                        <td style="border:1px solid #cbd5e1; padding:8px; color:#ef4444; font-weight:bold;">${l.hct||'-'}</td>
                    </tr>`).join('')}
                </table>`;
            } else {
                labsHtml = '<div style="padding: 20px; color: #94a3b8; text-align: center; font-style: italic;">ไม่มีผลแล็บในระบบ</div>';
            }

            const htmlContent = `
                <!DOCTYPE html>
                <html lang="th">
                <head>
                    <meta charset="UTF-8">
                    <title>แฟ้มประวัติ EMR - ${p.hn}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&family=Prompt:wght@400;600;700&display=swap" rel="stylesheet">
                    <style>
                        @page { size: A4 portrait; margin: 15mm; } 
                        body { font-family: 'Sarabun', sans-serif; background: #fff; color: #000; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 20px; }
                        table { page-break-inside: auto; }
                        tr { page-break-inside: avoid; page-break-after: auto; }
                        h2, h3, h4 { font-family: 'Prompt', sans-serif; }
                    </style>
                </head>
                <body>
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 25px;">
                        <div>
                            <h2 style="margin: 0; color: #1e3a8a; font-weight: 800; font-size: 24px;">แฟ้มประวัติผู้ป่วย (EMR)</h2>
                            <h4 style="margin: 5px 0 0 0; color: #64748b; font-size: 14px;">หน่วยไตเทียม DIALYSIS PRO</h4>
                        </div>
                        <div style="text-align: right; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 15px; border-radius: 8px;">
                            <div style="font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 4px;">HN: ${p.hn}</div>
                            <div style="font-size: 14px; color: #475569;">${p.title||''}${p.name_th}</div>
                        </div>
                    </div>
                    
                    <table style="width: 100%; font-size: 14px; margin-bottom: 30px; border-collapse: collapse; background: #f8fafc; border-radius: 12px; overflow: hidden;">
                        <tr>
                            <td width="33%" style="padding: 10px 15px; border-bottom: 1px solid #e2e8f0;"><b>อายุ:</b> ${p.age || '-'}</td>
                            <td width="33%" style="padding: 10px 15px; border-bottom: 1px solid #e2e8f0;"><b>สิทธิการรักษา:</b> <span style="color:#10b981; font-weight:bold;">${p.right || '-'}</span></td>
                            <td width="33%" style="padding: 10px 15px; border-bottom: 1px solid #e2e8f0;"><b>กรุ๊ปเลือด:</b> <span style="color:#ef4444; font-weight:bold;">${p.blood_type || '-'}</span></td>
                        </tr>
                        <tr>
                            <td colspan="3" style="padding: 10px 15px; border-bottom: 1px solid #e2e8f0;"><b>โรคประจำตัว:</b> ${p.underlying_disease || '-'}</td>
                        </tr>
                        <tr>
                            <td colspan="3" style="padding: 10px 15px; background: #fef2f2; border: 1px solid #fecaca;"><b style="color:#dc2626;">ประวัติแพ้ยา / ข้อมูลเฝ้าระวัง:</b> ${p.allergy || 'ไม่มี'} | <b>โรคติดต่อ:</b> ${p.infection || 'ไม่มี'}</td>
                        </tr>
                    </table>

                    <h3 style="background:linear-gradient(to right, #eff6ff, transparent); padding:8px 12px; border-left:5px solid #2563eb; font-size:16px; margin-top: 30px; color:#1e3a8a;">ประวัติการรักษา (Treatment Timeline)</h3>
                    ${historyHtml}

                    <h3 style="background:linear-gradient(to right, #fef2f2, transparent); padding:8px 12px; border-left:5px solid #dc2626; font-size:16px; margin-top: 40px; color:#991b1b; page-break-before: auto;">ผลตรวจห้องปฏิบัติการ (Lab Results)</h3>
                    ${labsHtml}
                    
                    <div style="margin-top: 50px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px dashed #e2e8f0; padding-top: 15px;">
                        เอกสารนี้ถูกสร้างโดยระบบ Dialysis Pro EMR System (Engine v10.0) เมื่อ ${new Date().toLocaleDateString('th-TH')} เวลา ${new Date().toLocaleTimeString('th-TH')} น.<br>
                        เพื่อใช้เป็นประวัติประกอบการรักษาภายในสถานพยาบาลเท่านั้น
                    </div>
                </body>
                </html>
            `;

            // 🚨 ยิง Modal แจ้งเตือนขึ้นกลางหน้าจอ (หลุดพ้นจากการซ่อนของ OS แน่นอน)
            Swal.fire({
                title: '<h4 class="fw-bold text-primary mb-0" style="font-family:\'Prompt\';"><i class="fa-solid fa-folder-open me-2"></i> แฟ้มประวัติ EMR ผู้ป่วย</h4>',
                html: `
                    <div class="mb-2 text-start text-muted small"><i class="fa-solid fa-circle-info me-1"></i> เลื่อนดูตัวอย่างด้านล่าง หากหน้าต่างพิมพ์ไม่ขึ้น ให้กดปุ่ม <b>"สั่งพิมพ์ทันที"</b></div>
                    <iframe id="emr-visible-print-frame" style="width:100%; height:65vh; border:2px solid #e2e8f0; border-radius:12px; background:#fff; box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);"></iframe>
                `,
                width: '90%',
                showCancelButton: true,
                confirmButtonText: '<i class="fa-solid fa-print me-2"></i> สั่งพิมพ์ทันที',
                cancelButtonText: 'ปิดหน้าต่าง',
                confirmButtonColor: '#2563eb',
                cancelButtonColor: '#94a3b8',
                customClass: { popup: 'premium-alert' },
                didOpen: () => {
                    const iframe = document.getElementById('emr-visible-print-frame');
                    let doc = iframe.contentWindow.document;
                    doc.open();
                    doc.write(htmlContent);
                    doc.close();

                    // รอให้เนื้อหาโหลดเสร็จ (กันเหนียว 500ms) แล้วค่อยส่งคำสั่ง Print
                    setTimeout(() => {
                        try {
                            iframe.contentWindow.focus();
                            iframe.contentWindow.print();
                        } catch(e) {}
                    }, 500); 
                }
            }).then((result) => {
                // ถ้าผู้ใช้กดปุ่มพิมพ์ซ้ำ
                if (result.isConfirmed) {
                    const iframe = document.getElementById('emr-visible-print-frame');
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                }
            });

        } catch (error) {
            console.error(error);
            Swal.fire({title:'ข้อผิดพลาด', text:'ไม่สามารถสร้างเอกสารเพื่อพิมพ์ได้', icon:'error', customClass: { popup: 'premium-alert' }});
        }
    }
}

const PatientHistoryPage = new PatientHistoryPageComponent();
window.PatientHistoryPage = PatientHistoryPage;