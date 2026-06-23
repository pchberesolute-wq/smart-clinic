// js/pages/patient_history.js
// 🚀 โมดูลประวัติการรักษาเชิงลึก (Premium EMR - Dedicated X-Ray Tab & Unified Data Sync)

const PatientHistoryPage = {
    hn: null, patientData: null, chartInstance: null, allVisits: [], invItems: [], medItems: [], xraysList: [], allPatientsList: [],
    timelineLimit: 10, labLimit: 10,

    html: `
        <style>
            /* 🌟 [ULTIMATE TYPOGRAPHY FIX] บังคับตัวหนังสือคมชัดระดับ HD และลบรอยหยักฟอนต์ 100% */
            * { -webkit-font-smoothing: antialiased !important; -moz-osx-font-smoothing: grayscale !important; text-rendering: optimizeLegibility !important; }
            .form-label, .text-secondary, .text-muted { color: #334155 !important; font-weight: 600 !important; letter-spacing: 0.2px; }
            
            /* 🌟 [UI/UX FIX] ล้างอาถรรพ์ White-on-White! ทะลวงกำแพง CSS ทำให้ปุ่มและไอคอนชัดเจน 100% เวลา Hover */
            .btn-outline-dark.bg-white:hover, .btn-outline-dark.bg-white:hover * { background-color: #0f172a !important; border-color: #0f172a !important; color: #ffffff !important; }
            .btn-outline-primary.bg-white:hover, .btn-outline-primary.bg-white:hover * { background-color: #3b82f6 !important; border-color: #3b82f6 !important; color: #ffffff !important; }
            
            .emr-nav-tabs { flex-wrap: nowrap; overflow-x: auto; white-space: nowrap; scrollbar-width: none; }
            .emr-nav-tabs::-webkit-scrollbar { display: none; }
            .emr-nav-tabs .nav-link { color: var(--muted); border: none; background: transparent; transition: all 0.3s ease; }
            .emr-nav-tabs .nav-link:hover { background: var(--bg-main); color: var(--text-dark); }
            .emr-nav-tabs .nav-link.active { background: var(--primary-light); color: var(--primary); border: 1px solid #bfdbfe; }
            .emr-nav-tabs .nav-link.active[data-bs-target="#tab-vitals"] { background: var(--success-light); color: var(--success-dark); border: 1px solid #bbf7d0; }
            .emr-nav-tabs .nav-link.active[data-bs-target="#tab-labs"] { background: var(--danger-light); color: var(--danger-dark); border: 1px solid #fecaca; }
            .emr-nav-tabs .nav-link.active[data-bs-target="#tab-meds"] { background: var(--warning-light); color: var(--warning-dark); border: 1px solid #fde68a; }
            /* 🌟 [NEW] X-Ray Tab Active State */
            .emr-nav-tabs .nav-link.active[data-bs-target="#tab-xrays"] { background: var(--info-light); color: var(--info-dark); border: 1px solid #bae6fd; }
            
            .timeline-point { position: absolute; left: -36px; top: 0; width: 20px; height: 20px; border-radius: 50%; background: var(--primary-gradient); border: 4px solid #fff; box-shadow: 0 0 0 3px #bfdbfe; }
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

            <div class="text-center mb-4">
                <ul class="nav emr-nav-tabs shadow-sm" id="emrTabs" role="tablist" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 8px; display: inline-flex; gap: 5px;">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-timeline" type="button" role="tab" style="font-family:'Prompt'; font-size:15px; border-radius:14px; font-weight:700;">
                            <i class="fa-solid fa-timeline text-primary me-2"></i> บันทึกการรักษา
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-vitals" type="button" role="tab" onclick="setTimeout(()=>PatientHistoryPage.renderChart(), 200)" style="font-family:'Prompt'; font-size:15px; border-radius:14px; font-weight:700;">
                            <i class="fa-solid fa-chart-line text-success me-2"></i> กราฟสัญญาณชีพ
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-labs" type="button" role="tab" style="font-family:'Prompt'; font-size:15px; border-radius:14px; font-weight:700;">
                            <i class="fa-solid fa-vial text-danger me-2"></i> ผลแล็บ
                        </button>
                    </li>
                    <!-- 🌟 [NEW] เพิ่มแท็บ X-Ray ตรงนี้ -->
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-xrays" type="button" role="tab" style="font-family:'Prompt'; font-size:15px; border-radius:14px; font-weight:700;">
                            <i class="fa-solid fa-x-ray text-info me-2"></i> ภาพถ่ายรังสี (X-Ray)
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-meds" type="button" role="tab" style="font-family:'Prompt'; font-size:15px; border-radius:14px; font-weight:700;">
                            <i class="fa-solid fa-pills text-warning me-2"></i> ยา/เวชภัณฑ์
                        </button>
                    </li>
                </ul>
            </div>

            <div class="tab-content" id="emrTabContent">
                <div class="tab-pane fade show active" id="tab-timeline" role="tabpanel">
                    <div class="modern-panel position-relative overflow-hidden">
                        <div style="position: absolute; top: -30px; right: -20px; opacity: 0.02; font-size: 200px; pointer-events: none;"><i class="fa-solid fa-clock-rotate-left"></i></div>
                        <h4 class="fw-bold text-dark mb-4 position-relative z-1"><i class="fa-solid fa-clipboard-list text-primary me-2"></i> ประวัติการเข้าฟอกเลือด (Progress Notes)</h4>
                        <div id="ph-timeline-content" class="position-relative z-1"></div>
                    </div>
                </div>

                <div class="tab-pane fade" id="tab-vitals" role="tabpanel">
                    <div class="modern-panel">
                        <h4 class="fw-bold text-dark mb-4"><i class="fa-solid fa-heart-pulse text-success me-2"></i> กราฟแนวโน้มสัญญาณชีพ</h4>
                        <div style="height: 380px; width: 100%;"><canvas id="vitalsChart"></canvas></div>
                    </div>
                </div>

                <div class="tab-pane fade" id="tab-labs" role="tabpanel">
                    <div class="modern-panel">
                        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                            <h4 class="fw-bold text-dark mb-0"><i class="fa-solid fa-microscope text-danger me-2"></i> ผลตรวจทางห้องปฏิบัติการ</h4>
                            <button class="btn btn-premium btn-premium-danger px-4" onclick="PatientHistoryPage.openAddLabModal()">
                                <i class="fa-solid fa-plus me-2"></i> เพิ่มผลแล็บ
                            </button>
                        </div>
                        <div class="table-responsive bg-white rounded-4 border shadow-sm">
                            <table class="table table-premium w-100 mb-0">
                                <thead style="background: var(--danger-light);">
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

                <!-- 🌟 [NEW] เพิ่ม Content ของแท็บ X-Ray ตรงนี้ -->
                <div class="tab-pane fade" id="tab-xrays" role="tabpanel">
                    <div class="modern-panel">
                        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                            <h4 class="fw-bold text-dark mb-0"><i class="fa-solid fa-x-ray text-info me-2"></i> ประวัติการส่งตรวจทางรังสีวิทยา (X-Ray History)</h4>
                        </div>
                        <div id="ph-xrays-content" class="row g-3"></div>
                    </div>
                </div>

                <div class="tab-pane fade" id="tab-meds" role="tabpanel">
                    <div class="modern-panel">
                        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                            <h4 class="fw-bold text-dark mb-0"><i class="fa-solid fa-box-open text-warning me-2"></i> เวชภัณฑ์หลัก & ยาปัจจุบัน</h4>
                            <button class="btn btn-warning text-dark fw-bold rounded-pill shadow-sm px-4" onclick="PatientHistoryPage.openAddMedModal()" style="background: var(--warning-gradient); color: white!important; border:none;">
                                <i class="fa-solid fa-plus me-2"></i> เพิ่มยาใหม่
                            </button>
                        </div>
                        <div id="ph-meds-content" class="row g-3"></div>
                    </div>
                </div>
            </div>
        </div>
    `,

    init: function(hn) {
        this.timelineLimit = 10;
        this.labLimit = 10;

        if (!hn || typeof hn !== 'string') {
            document.getElementById('ph-search-screen').style.display = 'block';
            document.getElementById('ph-main-screen').style.display = 'none';
            document.getElementById('ph-search-input').value = '';
            document.getElementById('ph-search-results').innerHTML = '';
            
            if (typeof db !== 'undefined') {
                document.getElementById('ph-search-loading').style.display = 'block';
                db.ref('patients_database_v2/patients').once('value').then(snap => {
                    const data = snap.val();
                    let rawPatients = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
                    this.allPatientsList = rawPatients.filter(p => p !== null);
                    document.getElementById('ph-search-loading').style.display = 'none';
                    document.getElementById('ph-search-input').focus();
                });
            }
            return;
        }
        
        document.getElementById('ph-search-screen').style.display = 'none';
        document.getElementById('ph-main-screen').style.display = 'block';
        this.hn = hn; 
        this.loadPatientData(); 
    },

    searchPatients: function(term) {
        const resultsContainer = document.getElementById('ph-search-results');
        if(!term || term.trim() === '') {
            resultsContainer.innerHTML = '';
            return;
        }

        const lowerTerm = term.toLowerCase().trim();
        const matches = this.allPatientsList.filter(p => 
            (p.hn && p.hn.toLowerCase().includes(lowerTerm)) || 
            (p.name_th && p.name_th.toLowerCase().includes(lowerTerm)) || 
            (p.idcard && p.idcard.replace(/-/g, '').includes(lowerTerm.replace(/-/g, '')))
        ).slice(0, 12); 

        if(matches.length === 0) {
            resultsContainer.innerHTML = `<div class="col-12 text-center py-4 text-muted"><i class="fa-solid fa-folder-open fa-2x mb-2" style="opacity:0.3;"></i><br>ไม่พบผู้ป่วยที่ตรงกับข้อมูลนี้</div>`;
            return;
        }

        let html = '';
        matches.forEach(p => {
            let imgSrc = p.photo_base64 ? (p.photo_base64.startsWith('data:image') ? p.photo_base64 : 'data:image/jpeg;base64,' + p.photo_base64) : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name_th||'X')}&background=3b82f6&color=fff&bold=true`;
            html += `
                <div class="col-md-6 col-lg-4">
                    <div class="modern-panel p-3 border shadow-sm d-flex align-items-center bg-white card-hover-float" style="cursor:pointer;" onclick="PatientHistoryPage.init('${p.hn}')">
                        <img src="${imgSrc}" class="me-3 shadow-sm border border-2 border-light" style="width: 55px; height: 55px; border-radius: 12px; object-fit: cover;">
                        <div>
                            <div class="fw-bold text-dark" style="font-family:'Prompt'; font-size:15.5px;">${p.title||''}${p.name_th}</div>
                            <div class="text-primary fw-bold" style="font-size:13px;"><i class="fa-solid fa-id-card-clip me-1"></i> HN: ${p.hn}</div>
                        </div>
                        <i class="fa-solid fa-chevron-right ms-auto text-primary opacity-50"></i>
                    </div>
                </div>
            `;
        });
        resultsContainer.innerHTML = html;
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

            if (!this.patientData.history) this.patientData.history = [];
            if (!this.patientData.labs) this.patientData.labs = [];
            if (!this.patientData.medications) this.patientData.medications = [];
            
            this.autoCleanUpOldRecords();

            this.patientData.history.sort((a, b) => new Date(b.date) - new Date(a.date));
            this.patientData.labs.sort((a, b) => new Date(b.date) - new Date(a.date));

            this.allVisits = toArray(visitSnap.val());
            this.invItems = toArray(invSnap.val());
            this.medItems = toArray(medSnap.val());
            this.xraysList = toArray(xraySnap.val());

            this.renderHeader(); 
            this.renderTimeline(); 
            this.renderLabs(); 
            this.renderMeds();
            this.renderXraysTab(); // 🌟 [NEW] วาดข้อมูล X-Ray ลงในแท็บใหม่
        } catch (e) { console.error(e); }
    },

    autoCleanUpOldRecords: function() {
        let isModified = false;
        const cutoffDate = new Date(); cutoffDate.setFullYear(cutoffDate.getFullYear() - 5);
        
        const hLen = this.patientData.history.length;
        this.patientData.history = this.patientData.history.filter(h => new Date(h.date) >= cutoffDate);
        if (hLen !== this.patientData.history.length) isModified = true;

        const lLen = this.patientData.labs.length;
        this.patientData.labs = this.patientData.labs.filter(l => new Date(l.date) >= cutoffDate);
        if (lLen !== this.patientData.labs.length) isModified = true;

        if (isModified) {
            db.ref('patients_database_v2/patients').once('value').then(snap => {
                let list = snap.val(); let index = list.findIndex(p => p.hn === this.hn);
                if (index !== -1) { list[index] = this.patientData; db.ref('patients_database_v2/patients').set(list); }
            });
        }
    },

    renderHeader: function() {
        document.getElementById('ph-header-loading').style.display = 'none';
        const headerContainer = document.getElementById('ph-header-content'); 
        headerContainer.style.display = 'block';
        
        const p = this.patientData;
        let imgSrc = p.photo_base64 ? (p.photo_base64.startsWith('data:image') ? p.photo_base64 : 'data:image/jpeg;base64,' + p.photo_base64) : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name_th)}&background=e2e8f0&color=64748b`;
        
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

    loadMoreTimeline: function() { this.timelineLimit += 10; this.renderTimeline(); },

    renderTimeline: function() {
        const container = document.getElementById('ph-timeline-content');
        if (this.patientData.history.length === 0) { container.innerHTML = `<div class="text-center py-5 text-muted"><i class="fa-solid fa-folder-open fa-3x mb-3" style="opacity:0.2;"></i><br>ยังไม่มีประวัติการรักษา</div>`; return; }

        let html = `<div class="timeline" style="border-left: 4px solid #bfdbfe; padding-left: 24px; margin-left: 15px;">`;
        let recordsToShow = this.patientData.history.slice(0, this.timelineLimit);
        
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
                
                // หมวดยาหลัก
                if(dName !== '-') medsContainer += `<span class="badge rounded-pill px-3 py-2 shadow-sm" style="background: var(--warning-gradient); color:#fff; font-size:12px; border:1px solid #fff;"><i class="fa-solid fa-soap me-2"></i> น้ำยาไต: ${dName}</span>`;
                if(nName !== '-') medsContainer += `<span class="badge rounded-pill px-3 py-2 shadow-sm" style="background: var(--info); color:#fff; font-size:12px; border:1px solid #fff;"><i class="fa-solid fa-bottle-droplet me-2"></i> NSS: ${nName}</span>`;
                if(hName !== '-') medsContainer += `<span class="badge rounded-pill px-3 py-2 shadow-sm" style="background: var(--danger-gradient); color:#fff; font-size:12px; border:1px solid #fff;"><i class="fa-solid fa-syringe me-2"></i> Heparin: ${hName}</span>`;
                
                // หมวดยาอื่นๆ
                otherMeds.forEach(m => {
                    if(m.id && m.qty) {
                        let mName = this.getMedNameFromId(m.id);
                        medsContainer += `<span class="badge rounded-pill px-3 py-2 shadow-sm" style="background: linear-gradient(135deg, #8b5cf6, #6d28d9); color:#fff; font-size:12px; border:1px solid #fff;"><i class="fa-solid fa-pills me-2"></i> ยา/เวชภัณฑ์: ${mName} (จำนวน: ${m.qty})</span>`;
                    }
                });

                // หมวด X-Ray (แสดงเล็กๆ ใน Timeline ด้วยเพื่อความครบถ้วน)
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
                    
                    <div class="p-4 rounded-4 shadow-sm border border-light" style="background: var(--bg-body);">
                        <div class="fw-bold text-primary mb-1" style="font-size:14px;"><i class="fa-solid fa-comment-medical me-2"></i> อาการสำคัญ (Chief Complaint):</div>
                        <div class="mb-3 text-dark ps-4 fw-medium">${visit.cc || historyRow.cc || '-'}</div>
                        
                        <div class="fw-bold text-warning-dark mb-1" style="font-size:14px;"><i class="fa-solid fa-notes-medical me-2"></i> บันทึกการรักษา (Progress Notes):</div>
                        <div class="text-dark ps-4 fw-medium" style="white-space: pre-wrap;">${visit.note || historyRow.note || '-'}</div>
                    </div>
                </div>`;
        });
        html += `</div>`;

        if (this.patientData.history.length > this.timelineLimit) {
            let remaining = this.patientData.history.length - this.timelineLimit;
            html += `<div class="text-center mt-4 mb-2"><button class="btn btn-light text-primary fw-bold rounded-pill px-5 py-2 shadow-sm border" onclick="PatientHistoryPage.loadMoreTimeline()"><i class="fa-solid fa-angle-down me-2"></i> โหลดประวัติเก่าเพิ่มเติม (เหลือ ${remaining} วัน)</button></div>`;
        }
        container.innerHTML = html;
    },

    // 🌟 [NEW] ฟังก์ชันสำหรับกวาดข้อมูล X-Ray มาสร้างเป็น Card ในแท็บแยก
    renderXraysTab: function() {
        const container = document.getElementById('ph-xrays-content');
        let html = '';
        let hasXray = false;

        // วนลูปประวัติจากใหม่ไปเก่า (ประวัติถูกเรียงมาแล้วใน loadPatientData)
        this.patientData.history.forEach(historyRow => {
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
            container.innerHTML = `<div class="col-12 text-center py-5 text-muted"><i class="fa-solid fa-x-ray fa-3x mb-3" style="opacity:0.2;"></i><br>ไม่มีประวัติการส่งตรวจเอ็กซเรย์ (X-Ray)</div>`;
        } else {
            container.innerHTML = html;
        }
    },

    loadMoreLabs: function() { this.labLimit += 10; this.renderLabs(); },

    renderLabs: function() {
        const tbody = document.getElementById('ph-labs-content');
        if (this.patientData.labs.length === 0) { tbody.innerHTML = `<tr><td colspan="8" class="text-center py-5 text-muted"><i class="fa-solid fa-vial-virus fa-3x mb-3" style="opacity:0.2;"></i><br>ไม่มีผลตรวจทางห้องปฏิบัติการ</td></tr>`; return; }
        
        let html = '';
        let recordsToShow = this.patientData.labs.slice(0, this.labLimit);

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

        if (this.patientData.labs.length > this.labLimit) {
            html += `<tr><td colspan="8" class="text-center py-4"><button class="btn btn-light text-danger fw-bold rounded-pill px-5 shadow-sm border border-danger-subtle" onclick="PatientHistoryPage.loadMoreLabs()"><i class="fa-solid fa-angle-down me-2"></i> โหลดผลแล็บเก่า</button></td></tr>`;
        }
        tbody.innerHTML = html;
    },

    renderMeds: function() {
        const container = document.getElementById('ph-meds-content');
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
        const history = [...this.patientData.history].reverse(); if(history.length === 0) return;

        const labels = []; const sysData = []; const diaData = [];
        history.forEach(v => {
            if(v.bp && v.bp !== '-') { const parts = v.bp.split('/'); if(parts.length === 2) { labels.push(new Date(v.date).toLocaleDateString('th-TH', {day:'numeric', month:'short'})); sysData.push(parseInt(parts[0])); diaData.push(parseInt(parts[1])); } }
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