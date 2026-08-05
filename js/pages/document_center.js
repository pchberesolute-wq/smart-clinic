// js/pages/document_center.js
// 🚀 Enterprise Document Center: Ghost Input Date Picker, Safe Base64 & Zero-Jank UI (v14.0 THE ULTIMATE FIX)

class DocumentCenterComponent {
    constructor() {
        this.state = {
            allDocuments: [],
            currentFilter: 'all',
            searchQuery: '',
            specificDate: '',
            isSelectMode: false,
            selectedDocIds: new Set() 
        };
        this.firebaseListeners = [];
        this.documentCache = new Map(); 
        
        this.boundHandleGlobalClick = this.handleGlobalClick.bind(this);
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

    // เพิ่มฟังก์ชันจัดฟอร์แมตวันที่แบบไทย
    formatDateTh(isoStr) {
        if(!isoStr) return '-'; 
        const d = new Date(isoStr);
        return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth() + 1).padStart(2,'0')}/${d.getFullYear() + 543}`;
    }

    get html() {
        return `
            <style>
                .filter-btn { transition: all 0.2s; border: none; flex-shrink: 0; }
                .filter-btn.active { background-color: var(--primary) !important; color: white !important; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3) !important; }
                html[data-bs-theme="dark"] .filter-btn { color: #cbd5e1 !important; background: rgba(255,255,255,0.05) !important; }
                html[data-bs-theme="dark"] .filter-btn.active { background-color: var(--primary) !important; color: #fff !important; }
                
                .doc-preview-card { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s; cursor: pointer; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); background: var(--bg-surface); position: relative; will-change: transform; }
                .doc-preview-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1); border-color: var(--primary); }
                .doc-img-wrapper { height: 140px; background: rgba(0,0,0,0.02); display: flex; align-items: center; justify-content: center; overflow: hidden; border-bottom: 1px solid var(--border-color); position: relative; }
                .doc-img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
                
                /* Checkbox Styles */
                .doc-checkbox-overlay { position: absolute; top: 8px; left: 8px; z-index: 10; display: none; background: rgba(255,255,255,0.9); border-radius: 8px; padding: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
                .select-mode-active .doc-checkbox-overlay { display: block; }
                .doc-checkbox-overlay input[type="checkbox"] { width: 20px; height: 20px; cursor: pointer; accent-color: var(--primary); }
                
                .doc-preview-card.selected { border: 3px solid var(--primary) !important; transform: scale(0.98); box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
                .doc-preview-card.selected .doc-img-wrapper::after { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(37,99,235,0.1); pointer-events: none; }

                /* Floating Action Bar (FAB) */
                #dc-action-bar {
                    position: fixed; bottom: -100px; left: 50%; transform: translateX(-50%);
                    background: var(--color-surface); border: 1px solid var(--border-color);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.15); border-radius: 50px;
                    padding: 10px 20px; z-index: 9999; display: flex; align-items: center; gap: 15px;
                    transition: bottom 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                #dc-action-bar.visible { bottom: 30px; }

                .btn-fixed-width {
                    width: 175px !important; min-width: 175px !important; max-width: 175px !important;
                    flex-shrink: 0 !important; flex-grow: 0 !important; display: inline-flex !important;
                    justify-content: center !important; align-items: center !important; white-space: nowrap !important;
                    overflow: hidden !important; box-sizing: border-box !important;
                    transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out !important;
                }

                /* =========================================================
                   🚨 THE ULTIMATE FIX: GHOST INPUT DATE PICKER 
                   ========================================================= */
                .filter-bar-capsule {
                    display: flex; align-items: center; background: var(--color-surface, #ffffff);
                    padding: 4px 6px; border-radius: 50px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                    border: 1px solid var(--border-color, #e2e8f0); gap: 4px; flex-wrap: wrap; 
                }
                .filter-divider { width: 2px; height: 24px; background-color: #e2e8f0; margin: 0 4px; }
                html[data-bs-theme="dark"] .filter-divider { background-color: #334155; }
                
                .dc-date-wrapper {
                    position: relative; display: flex; align-items: center; background: transparent;
                    padding: 6px 14px; cursor: pointer; overflow: hidden; border-radius: 20px;
                    transition: background 0.2s;
                }
                .dc-date-wrapper:hover { background: rgba(0,0,0,0.03); }
                html[data-bs-theme="dark"] .dc-date-wrapper:hover { background: rgba(255,255,255,0.05); }
                
                /* ป้ายข้อความที่แสดงแทน Input */
                .dc-date-wrapper .thai-text { font-family: 'Prompt', sans-serif; font-weight: 700; color: var(--text-dark); font-size: 14.5px; pointer-events: none; }
                .dc-date-wrapper i { font-size: 16px; color: var(--primary); pointer-events: none; margin-right: 8px; }
                
                /* ซ่อน Input แบบโปร่งใส 100% ให้ทะลุไปถึงป้ายข้อความด้านล่าง */
                .dc-date-wrapper input[type="date"] { 
                    position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
                    width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 10; 
                    border: none; background: transparent; color: transparent; 
                }
                .dc-date-wrapper input[type="date"]::-webkit-datetime-edit, 
                .dc-date-wrapper input[type="date"]::-webkit-datetime-edit-text, 
                .dc-date-wrapper input[type="date"]::-webkit-datetime-edit-month-field, 
                .dc-date-wrapper input[type="date"]::-webkit-datetime-edit-day-field, 
                .dc-date-wrapper input[type="date"]::-webkit-datetime-edit-year-field { 
                    color: transparent !important; background: transparent !important; 
                }
                .dc-date-wrapper input[type="date"]::-webkit-calendar-picker-indicator { 
                    position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
                    width: 100%; height: 100%; margin: 0; padding: 0; cursor: pointer; opacity: 0; 
                }
            </style>
            
            <div class="page-header mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                    <h2 class="page-title text-primary"><i class="fa-solid fa-folder-tree me-2"></i> ศูนย์รวมเอกสารและไฟล์แนบ</h2>
                    <p class="text-muted mt-1 mb-0 fw-bold">จัดการแฟ้มเอกสารคนไข้แบบรวมศูนย์ (Patient-Centric View)</p>
                </div>
                
                <div class="filter-bar-capsule bg-white">
                    <button class="btn btn-sm rounded-pill px-3 fw-bold filter-btn active" data-filter="all">ทั้งหมด</button>
                    <button class="btn btn-sm rounded-pill px-3 fw-bold filter-btn" data-filter="today">วันนี้</button>
                    <button class="btn btn-sm rounded-pill px-3 fw-bold filter-btn" data-filter="month">เดือนนี้</button>
                    <button class="btn btn-sm rounded-pill px-3 fw-bold filter-btn" data-filter="year">ปีนี้</button>
                    
                    <div class="filter-divider"></div>
                    
                    <div class="dc-date-wrapper">
                        <i class="fa-solid fa-calendar-day text-primary"></i>
                        <span class="thai-text" id="dc-date-display">ระบุวันที่...</span>
                        <input type="date" id="dc-specific-date">
                    </div>
                </div>
            </div>

            <div class="modern-panel p-3 mb-4 shadow-sm" style="border-radius: 16px;">
                <div class="row g-3 align-items-center">
                    <div class="col-md-4">
                        <div class="search-box-modern w-100 border bg-light" style="border-radius: 12px; overflow: hidden;">
                            <i class="fa-solid fa-magnifying-glass text-primary ms-3 me-2"></i>
                            <input type="text" id="dc-search-input" class="border-0 bg-transparent w-100 fw-bold text-dark py-2" placeholder="ค้นหาชื่อคนไข้, HN หรือ ชื่อเอกสาร...">
                        </div>
                    </div>
                    <div class="col-md-8 text-md-end d-flex justify-content-md-end align-items-center gap-3">
                        <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fs-6 shadow-sm" id="dc-count-badge">
                            <i class="fa-solid fa-users me-1"></i> กำลังโหลดแฟ้มประวัติ...
                        </span>
                        
                        <button id="btn-toggle-select" class="btn btn-primary text-white fw-bold rounded-pill shadow-sm px-4 btn-fixed-width" onclick="DocumentCenterPage.toggleSelectMode()">
                            <i class="fa-solid fa-check-double me-1"></i> เลือกเอกสาร
                        </button>
                    </div>
                </div>
            </div>

            <div id="dc-loading" class="text-center py-5 text-primary"><i class="fas fa-spinner fa-spin fa-3x mb-3"></i><br>กำลังประมวลผลเอกสาร...</div>
            
            <div id="dc-gallery-container" style="display: none; padding-bottom: 50px;"></div>

            <div id="dc-action-bar">
                <div class="d-flex align-items-center me-3">
                    <span class="badge bg-primary rounded-circle p-2 shadow-sm d-flex align-items-center justify-content-center" style="width: 35px; height: 35px; font-size: 16px;" id="dc-selected-count">0</span>
                    <span class="fw-bold text-dark ms-2">ไฟล์ที่เลือก</span>
                </div>
                <button class="btn btn-light border fw-bold text-dark rounded-pill px-3 shadow-sm" onclick="DocumentCenterPage.selectAllDocs()">
                    <i class="fa-solid fa-check-square me-1 text-primary"></i> เลือกทั้งหมด
                </button>
                <button class="btn btn-success fw-bold rounded-pill px-4 shadow-sm" onclick="DocumentCenterPage.downloadSelectedDocs()">
                    <i class="fa-solid fa-download me-2"></i> ดาวน์โหลด (.ZIP)
                </button>
                <button class="btn btn-danger rounded-circle shadow-sm ms-2" style="width: 38px; height: 38px; padding: 0;" onclick="DocumentCenterPage.toggleSelectMode()" title="ยกเลิก">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
        `;
    }

    init() {
        if (typeof db === 'undefined') return;
        
        this.state.isSelectMode = false;
        this.state.selectedDocIds.clear();
        this.documentCache.clear();
        
        this.bindEvents();
        this.loadDocumentsFromDB();
    }

    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        this.documentCache.clear();
        document.removeEventListener('click', this.boundHandleGlobalClick);
    }

    bindEvents() {
        document.removeEventListener('click', this.boundHandleGlobalClick);
        document.addEventListener('click', this.boundHandleGlobalClick);

        document.getElementById('dc-specific-date')?.addEventListener('change', (e) => {
            this.state.specificDate = e.target.value;
            // เปลี่ยนข้อความบนหน้าจอเมื่อเลือกวันที่เสร็จ
            const display = document.getElementById('dc-date-display');
            if(display) {
                display.innerText = e.target.value ? this.formatDateTh(e.target.value) : 'ระบุวันที่...';
            }
            this.applyFilter('specific');
        });

        document.getElementById('dc-search-input')?.addEventListener('input', (e) => {
            this.state.searchQuery = e.target.value.toLowerCase().trim();
            this.applyFilter(null);
        });
    }

    handleGlobalClick(e) {
        if (e.target.classList.contains('filter-btn')) {
            const filter = e.target.getAttribute('data-filter');
            this.applyFilter(filter);
        }

        const docCard = e.target.closest('.doc-preview-card');
        if (docCard) {
            const docId = docCard.getAttribute('data-doc-id');
            const isPdf = docCard.getAttribute('data-is-pdf');
            
            if (e.target.classList.contains('doc-checkbox') || e.target.closest('.doc-checkbox-overlay')) {
                this.toggleDocSelection(docId, docCard);
                return;
            }

            if (this.state.isSelectMode) {
                this.toggleDocSelection(docId, docCard);
            } 
            else if (docId) {
                this.viewDoc(docId, isPdf);
            }
        }
    }

    toggleSelectMode() {
        this.state.isSelectMode = !this.state.isSelectMode;
        const container = document.getElementById('dc-gallery-container');
        const btnToggle = document.getElementById('btn-toggle-select');
        const actionBar = document.getElementById('dc-action-bar');

        if (this.state.isSelectMode) {
            container.classList.add('select-mode-active');
            
            btnToggle.className = 'btn btn-danger text-white fw-bold rounded-pill shadow-sm px-4 btn-fixed-width';
            btnToggle.innerHTML = '<i class="fa-solid fa-times me-1"></i> ยกเลิกเลือก';
            
            actionBar.classList.add('visible');
        } else {
            container.classList.remove('select-mode-active');
            
            btnToggle.className = 'btn btn-primary text-white fw-bold rounded-pill shadow-sm px-4 btn-fixed-width';
            btnToggle.innerHTML = '<i class="fa-solid fa-check-double me-1"></i> เลือกเอกสาร';
            
            actionBar.classList.remove('visible');
            
            this.state.selectedDocIds.clear();
            document.querySelectorAll('.doc-preview-card').forEach(card => card.classList.remove('selected'));
            document.querySelectorAll('.doc-checkbox').forEach(cb => cb.checked = false);
            this.updateSelectedCount();
        }
    }

    toggleDocSelection(docId, cardElement) {
        const checkbox = cardElement.querySelector('.doc-checkbox');
        
        if (this.state.selectedDocIds.has(docId)) {
            this.state.selectedDocIds.delete(docId);
            cardElement.classList.remove('selected');
            if (checkbox) checkbox.checked = false;
        } else {
            this.state.selectedDocIds.add(docId);
            cardElement.classList.add('selected');
            if (checkbox) checkbox.checked = true;
        }
        
        this.updateSelectedCount();
    }

    selectAllDocs() {
        const currentlyVisibleCards = document.querySelectorAll('.doc-preview-card');
        let allSelected = true;

        currentlyVisibleCards.forEach(card => {
            const docId = card.getAttribute('data-doc-id');
            if (!this.state.selectedDocIds.has(docId)) {
                allSelected = false; 
            }
        });

        currentlyVisibleCards.forEach(card => {
            const docId = card.getAttribute('data-doc-id');
            const checkbox = card.querySelector('.doc-checkbox');
            
            if (allSelected) {
                this.state.selectedDocIds.delete(docId);
                card.classList.remove('selected');
                if (checkbox) checkbox.checked = false;
            } else {
                this.state.selectedDocIds.add(docId);
                card.classList.add('selected');
                if (checkbox) checkbox.checked = true;
            }
        });

        this.updateSelectedCount();
    }

    updateSelectedCount() {
        const countEl = document.getElementById('dc-selected-count');
        if (countEl) countEl.innerText = this.state.selectedDocIds.size;
    }

    async downloadSelectedDocs() {
        if (this.state.selectedDocIds.size === 0) {
            Swal.fire('ยังไม่ได้เลือกเอกสาร', 'กรุณาติ๊กเลือกไฟล์ที่ต้องการดาวน์โหลดอย่างน้อย 1 รายการ', 'warning');
            return;
        }

        if (typeof JSZip === 'undefined' || typeof saveAs === 'undefined') {
            Swal.fire('ระบบไม่พร้อมใช้งาน', 'กรุณาตรวจสอบว่าโหลด Library JSZip และ FileSaver.js เรียบร้อยแล้ว', 'error');
            return;
        }

        Swal.fire({ 
            title: 'กำลังเตรียมไฟล์ดาวน์โหลด...', 
            html: `ระบบกำลังรวบรวมไฟล์จำนวน <b class="text-primary">${this.state.selectedDocIds.size}</b> รายการเป็นไฟล์ ZIP<br>กรุณารอสักครู่...`, 
            allowOutsideClick: false, 
            didOpen: () => Swal.showLoading() 
        });

        try {
            const zip = new JSZip();
            const rootFolder = zip.folder("Patient_Documents");

            let processedCount = 0;

            for (const docId of this.state.selectedDocIds) {
                const docObj = this.state.allDocuments.find(d => d.docId === docId);
                const base64DataUrl = this.documentCache.get(docId);
                
                if (docObj && base64DataUrl) {
                    const ext = docObj.docType === 'pdf' ? 'pdf' : 'jpg'; 
                    let safeDocName = this.escapeHTML(docObj.docName).replace(/[/\\?%*:|"<>]/g, '-');
                    let fileName = `${safeDocName}_${docObj.visitDate}.${ext}`;
                    
                    let safePatientName = this.escapeHTML(docObj.patientName).replace(/[/\\?%*:|"<>]/g, '-');
                    let patientFolder = rootFolder.folder(`${safePatientName}_${docObj.patientHn}`);
                    
                    const base64Data = base64DataUrl.split(',')[1];
                    
                    if (base64Data) {
                        patientFolder.file(fileName, base64Data, {base64: true});
                        processedCount++;
                    }
                }
            }

            if (processedCount === 0) throw new Error("ไม่สามารถดึงข้อมูลไฟล์ที่เลือกได้");

            Swal.update({ html: 'กำลังแพ็กไฟล์ ZIP...' });
            const content = await zip.generateAsync({type:"blob"});
            
            const now = new Date();
            const timestamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
            const zipName = `EMR_Documents_${timestamp}.zip`;

            saveAs(content, zipName);
            
            Swal.fire('ดาวน์โหลดสำเร็จ!', `รวบรวมไฟล์เสร็จสิ้น ${processedCount} รายการ`, 'success');
            this.toggleSelectMode();

        } catch (error) {
            console.error("ZIP Download Error:", error);
            Swal.fire('ข้อผิดพลาด', `การดาวน์โหลดล้มเหลว: ${error.message}`, 'error');
        }
    }

    applyFilter(timeFilter) {
        if (timeFilter) {
            this.state.currentFilter = timeFilter;
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            
            const activeBtn = document.querySelector(`.filter-btn[data-filter="${timeFilter}"]`);
            if(activeBtn) activeBtn.classList.add('active');
            
            // ล้างหน้าจอวันที่ ถ้ากดปุ่มอื่นที่ไม่ใช่การเลือกปฏิทิน
            if (timeFilter !== 'specific') {
                const dateInput = document.getElementById('dc-specific-date');
                if (dateInput) dateInput.value = '';
                const display = document.getElementById('dc-date-display');
                if(display) display.innerText = 'ระบุวันที่...';
                this.state.specificDate = '';
            }
        }

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const currentMonth = todayStr.substring(0, 7); 
        const currentYear = todayStr.substring(0, 4);  

        const filtered = this.state.allDocuments.filter(doc => {
            let passTime = true;
            let docDateStr = String(doc.visitDate); 
            
            if (this.state.currentFilter === 'today') passTime = (docDateStr === todayStr);
            else if (this.state.currentFilter === 'month') passTime = docDateStr.startsWith(currentMonth);
            else if (this.state.currentFilter === 'year') passTime = docDateStr.startsWith(currentYear);
            else if (this.state.currentFilter === 'specific' && this.state.specificDate) passTime = (docDateStr === this.state.specificDate);

            let passSearch = true;
            if (this.state.searchQuery) {
                const s = this.state.searchQuery;
                passSearch = String(doc.docName).toLowerCase().includes(s) || 
                             String(doc.patientName).toLowerCase().includes(s) || 
                             String(doc.patientHn).toLowerCase().includes(s);
            }
            return passTime && passSearch;
        });

        if (this.state.isSelectMode) {
            setTimeout(() => {
                document.querySelectorAll('.doc-preview-card').forEach(card => {
                    const docId = card.getAttribute('data-doc-id');
                    if (this.state.selectedDocIds.has(docId)) {
                        card.classList.add('selected');
                        const cb = card.querySelector('.doc-checkbox');
                        if(cb) cb.checked = true;
                    }
                });
            }, 50);
        }

        this.renderGroupedGallery(filtered);
    }

    loadDocumentsFromDB() {
        const ref = db.ref('patients_database_v2/visits');
        const callback = ref.on('value', snap => {
            try {
                const data = snap.val() || {};
                const visits = Object.keys(data).map(k => ({ firebaseKey: k, ...data[k] }));
                const docsExtract = [];

                this.documentCache.clear();

                visits.forEach(v => {
                    let attachments = this.parseFBArray(v.attachments);
                    
                    if (attachments.length > 0) {
                        attachments.forEach((doc, idx) => {
                            if (!doc) return;
                            
                            let docObj = {
                                visitFirebaseKey: v.firebaseKey,
                                patientName: v.name || 'ไม่ระบุชื่อ',
                                patientHn: v.hn || 'ไม่ระบุ HN',
                                visitDate: v.date || '1970-01-01',
                                docId: `DOC_${v.id || v.hn}_${v.date}_${idx}`,
                                docType: 'image',
                                docName: 'เอกสารแนบ',
                                dataUrl: ''
                            };

                            if (typeof doc === 'string') {
                                docObj.dataUrl = doc;
                                if (doc.startsWith('data:application/pdf')) docObj.docType = 'pdf';
                            } else if (typeof doc === 'object') {
                                docObj.docName = doc.name || doc.fileName || docObj.docName;
                                docObj.docType = doc.type || (doc.dataUrl && String(doc.dataUrl).startsWith('data:application/pdf') ? 'pdf' : 'image');
                                docObj.dataUrl = doc.dataUrl || doc.url || doc.base64 || doc.file || '';
                            }

                            if (docObj.dataUrl && String(docObj.dataUrl).trim() !== '') {
                                this.documentCache.set(docObj.docId, docObj.dataUrl);
                                docsExtract.push(docObj);
                            }
                        });
                    }
                });

                this.state.allDocuments = docsExtract.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
                this.applyFilter('all');
                
                document.getElementById('dc-loading').style.display = 'none';
                document.getElementById('dc-gallery-container').style.display = 'block';

            } catch (error) {
                console.error("Gallery Render Error:", error);
                document.getElementById('dc-loading').innerHTML = `
                    <div class="text-danger py-5">
                        <i class="fa-solid fa-triangle-exclamation fa-3x mb-3"></i><br>
                        พบข้อผิดพลาดในการดึงข้อมูล<br>
                        <small class="text-muted">${error.message}</small>
                    </div>`;
            }
        });
        this.firebaseListeners.push({ path: 'patients_database_v2/visits', callback });
    }

    renderGroupedGallery(docs) {
        const container = document.getElementById('dc-gallery-container');
        const badge = document.getElementById('dc-count-badge');
        if (!container || !badge) return;

        if (docs.length === 0) {
            badge.innerHTML = `<i class="fa-solid fa-users me-1"></i> ไม่พบแฟ้มเอกสาร`;
            container.innerHTML = `<div class="text-center py-5 text-muted fade-in-up"><i class="fa-regular fa-folder-open fa-4x mb-3" style="opacity: 0.2;"></i><h5>ไม่พบเอกสารในเงื่อนไขนี้</h5></div>`;
            return;
        }

        const groupedDocs = docs.reduce((acc, doc) => {
            const key = doc.patientHn;
            if (!acc[key]) acc[key] = { patientName: doc.patientName, patientHn: doc.patientHn, documents: [] };
            acc[key].documents.push(doc);
            return acc;
        }, {});

        const patientGroups = Object.values(groupedDocs).sort((a, b) => String(a.patientName).localeCompare(String(b.patientName), 'th'));
        badge.innerHTML = `<i class="fa-solid fa-users me-1"></i> พบ <b>${patientGroups.length}</b> แฟ้ม`;

        let html = '';
        patientGroups.forEach((group, groupIdx) => {
            let docCardsHtml = group.documents.map((doc, idx) => {
                const isPdf = doc.docType === 'pdf' || (doc.dataUrl && doc.dataUrl.startsWith('data:application/pdf'));
                const previewContent = isPdf ? `<i class="fa-solid fa-file-pdf fa-3x text-danger drop-shadow"></i>` : `<img src="${doc.dataUrl}" alt="${this.escapeHTML(doc.docName)}" loading="lazy">`;
                
                const isSelectedClass = this.state.selectedDocIds.has(doc.docId) ? 'selected' : '';
                const isCheckedAttr = this.state.selectedDocIds.has(doc.docId) ? 'checked' : '';

                return `
                <div class="col-sm-6 col-md-4 col-lg-3 fade-in-up" style="animation-delay: ${(idx % 10) * 0.05}s;">
                    <div class="doc-preview-card doc-thumb-card h-100 shadow-sm ${isSelectedClass}" data-doc-id="${doc.docId}" data-is-pdf="${isPdf}">
                        <div class="doc-checkbox-overlay">
                            <input type="checkbox" class="doc-checkbox" ${isCheckedAttr}>
                        </div>
                        <div class="doc-img-wrapper">${previewContent}</div>
                        <div class="p-3 text-center">
                            <div class="small fw-bold text-dark text-truncate mb-1" title="${this.escapeHTML(doc.docName)}">${this.escapeHTML(doc.docName)}</div>
                            <div class="text-primary fw-bold" style="font-size:11px;"><i class="fa-regular fa-calendar me-1"></i> ${new Date(doc.visitDate).toLocaleDateString('th-TH')}</div>
                        </div>
                    </div>
                </div>`;
            }).join('');

            html += `
            <div class="mb-5 fade-in-up" style="animation-delay: ${groupIdx * 0.05}s;">
                <div class="d-flex align-items-center mb-3 border-bottom pb-2">
                    <div class="rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style="width:45px; height:45px; background: linear-gradient(135deg, #3b82f6, #1e40af); color:white;"><i class="fa-solid fa-user"></i></div>
                    <div>
                        <h4 class="fw-bold mb-0 text-dark" style="font-family:'Prompt'; font-size:18px;">${this.escapeHTML(group.patientName)}</h4>
                        <span class="text-primary fw-bold small"><i class="fa-solid fa-id-card-clip me-1"></i> HN: ${this.escapeHTML(group.patientHn)}</span>
                    </div>
                    <div class="ms-auto"><span class="badge bg-light text-muted border rounded-pill shadow-sm">${group.documents.length} เอกสาร</span></div>
                </div>
                <div class="row g-3">${docCardsHtml}</div>
            </div>`;
        });
        container.innerHTML = html;
    }

    viewDoc(docId, isPdf) {
        const dataUrl = this.documentCache.get(docId);
        
        if (!dataUrl) {
            Swal.fire('ข้อผิดพลาด', 'ไม่พบไฟล์ต้นฉบับหรือไฟล์เสียหาย', 'error');
            return;
        }

        if (isPdf === 'true' || isPdf === true || dataUrl.startsWith('data:application/pdf')) {
            Swal.fire({
                html: `<iframe src="${dataUrl}" style="width:100%; height:75vh; border:none; border-radius:12px;"></iframe>`,
                showConfirmButton: false,
                width: '90%',
                padding: '10px',
                showCloseButton: true,
                customClass: { popup: 'premium-alert' }
            });
        } else {
            Swal.fire({
                imageUrl: dataUrl,
                imageAlt: 'Scanned Document',
                showConfirmButton: false,
                width: '80%',
                padding: '0',
                background: 'transparent',
                showCloseButton: true,
                customClass: { popup: 'premium-alert' }
            });
        }
    }
}

const DocumentCenterPage = new DocumentCenterComponent();
window.DocumentCenterPage = DocumentCenterPage;