// js/pages/document_center.js
// 🚀 Enterprise Document Center: Memory-Leak Free, Safe Base64 Payload Binding & Unbreakable Rendering

class DocumentCenterComponent {
    constructor() {
        this.state = {
            allDocuments: [],
            currentFilter: 'all',
            searchQuery: '',
            specificDate: ''
        };
        this.firebaseListeners = [];
        this.documentCache = new Map(); // 🚨 โกดังเก็บ Base64 ป้องกันเบราว์เซอร์ช็อค!
        
        this.boundHandleGlobalClick = this.handleGlobalClick.bind(this);
    }

    // 🚨 THE FIX 1: เพิ่มฟังก์ชันจัดระเบียบข้อมูล ป้องกัน Firebase แปลง Array เป็น Object
    parseFBArray(data) {
        if (!data) return [];
        if (Array.isArray(data)) return data.filter(item => item !== null && item !== undefined);
        if (typeof data === 'object' && data !== null) return Object.values(data).filter(item => item !== null && item !== undefined);
        return []; 
    }

    // 🚨 THE FIX 2: กู้คืนฟังก์ชัน EscapeHTML กลับมา เพื่อป้องกันระบบช็อคค้าง!
    escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }

    get html() {
        return `
            <style>
                .filter-btn { transition: all 0.2s; border: none; }
                .filter-btn.active { background-color: var(--primary) !important; color: white !important; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3) !important; }
                html[data-bs-theme="dark"] .filter-btn { color: #cbd5e1 !important; background: rgba(255,255,255,0.05) !important; }
                html[data-bs-theme="dark"] .filter-btn.active { background-color: var(--primary) !important; color: #fff !important; }
                
                .doc-preview-card { transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: pointer; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); background: var(--bg-surface); }
                .doc-preview-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1); border-color: var(--primary); }
                .doc-img-wrapper { height: 140px; background: rgba(0,0,0,0.02); display: flex; align-items: center; justify-content: center; overflow: hidden; border-bottom: 1px solid var(--border-color); }
                .doc-img-wrapper img { width: 100%; height: 100%; object-fit: cover; }
            </style>
            
            <div class="page-header mb-4 d-flex justify-content-between align-items-end flex-wrap gap-3">
                <div>
                    <h2 class="page-title text-primary"><i class="fa-solid fa-folder-tree me-2"></i> ศูนย์รวมเอกสารและไฟล์แนบ</h2>
                    <p class="text-muted mt-1 mb-0 fw-bold">จัดการแฟ้มเอกสารคนไข้แบบรวมศูนย์ (Patient-Centric View)</p>
                </div>
                
                <div class="d-flex gap-2 flex-wrap align-items-center bg-white p-1 rounded-pill shadow-sm border px-2">
                    <button class="btn btn-sm rounded-pill px-3 fw-bold filter-btn active" data-filter="all">ทั้งหมด</button>
                    <button class="btn btn-sm rounded-pill px-3 fw-bold filter-btn" data-filter="today">วันนี้</button>
                    <button class="btn btn-sm rounded-pill px-3 fw-bold filter-btn" data-filter="month">เดือนนี้</button>
                    <button class="btn btn-sm rounded-pill px-3 fw-bold filter-btn" data-filter="year">ปีนี้</button>
                    
                    <div style="border-left: 2px solid #e2e8f0; height: 24px; margin: 0 5px;"></div>
                    
                    <div class="d-flex align-items-center px-2">
                        <i class="fa-solid fa-calendar-day text-primary me-2"></i>
                        <input type="date" id="dc-specific-date" class="form-control form-control-sm border-0 bg-transparent fw-bold text-dark p-0" style="width: 110px; outline: none; box-shadow: none;">
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
                    <div class="col-md-8 text-md-end">
                        <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fs-6 shadow-sm" id="dc-count-badge">
                            <i class="fa-solid fa-users me-1"></i> กำลังโหลดแฟ้มประวัติ...
                        </span>
                    </div>
                </div>
            </div>

            <div id="dc-loading" class="text-center py-5 text-primary"><i class="fas fa-spinner fa-spin fa-3x mb-3"></i><br>กำลังประมวลผลเอกสาร...</div>
            <div id="dc-gallery-container" style="display: none; padding-bottom: 50px;"></div>
        `;
    }

    init() {
        if (typeof db === 'undefined') return;
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
        // ล้าง Event เก่าป้องกันซ้ำซ้อน
        document.removeEventListener('click', this.boundHandleGlobalClick);
        document.addEventListener('click', this.boundHandleGlobalClick);

        document.getElementById('dc-specific-date')?.addEventListener('change', (e) => {
            this.state.specificDate = e.target.value;
            this.applyFilter('specific');
        });

        document.getElementById('dc-search-input')?.addEventListener('input', (e) => {
            this.state.searchQuery = e.target.value.toLowerCase().trim();
            this.applyFilter(null);
        });
    }

    // ระบบดักจับการคลิกเปิดรูป (Global Click Listener) ป้องกันเอา Base64 ยัดใน HTML
    handleGlobalClick(e) {
        if (e.target.classList.contains('filter-btn')) {
            const filter = e.target.getAttribute('data-filter');
            this.applyFilter(filter);
        }

        const docCard = e.target.closest('.doc-preview-card');
        if (docCard) {
            const docId = docCard.getAttribute('data-doc-id');
            const isPdf = docCard.getAttribute('data-is-pdf');
            if (docId) this.viewDoc(docId, isPdf);
        }
    }

    applyFilter(timeFilter) {
        if (timeFilter) {
            this.state.currentFilter = timeFilter;
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            
            const activeBtn = document.querySelector(`.filter-btn[data-filter="${timeFilter}"]`);
            if(activeBtn) activeBtn.classList.add('active');
            
            if (timeFilter !== 'specific') {
                const dateInput = document.getElementById('dc-specific-date');
                if (dateInput) dateInput.value = '';
                this.state.specificDate = '';
            }
        }

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const currentMonth = todayStr.substring(0, 7); 
        const currentYear = todayStr.substring(0, 4);  

        const filtered = this.state.allDocuments.filter(doc => {
            let passTime = true;
            let docDateStr = String(doc.visitDate); // ป้องกันบั๊ก Undefined
            
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

        this.renderGroupedGallery(filtered);
    }

    // 🚨 THE FIX 3: ครอบ Try-Catch หากมีบั๊กการดึงเอกสาร หน้าจอจะไม่หมุนค้าง
    loadDocumentsFromDB() {
        const ref = db.ref('patients_database_v2/visits');
        const callback = ref.on('value', snap => {
            try {
                const data = snap.val() || {};
                const visits = Object.keys(data).map(k => ({ firebaseKey: k, ...data[k] }));
                const docsExtract = [];

                this.documentCache.clear();

                visits.forEach(v => {
                    // ใช้ฟังก์ชัน parseFBArray ป้องกัน Array กลายเป็น Object แล้วเบราว์เซอร์อ่านไม่ได้
                    let attachments = this.parseFBArray(v.attachments);
                    
                    if (attachments.length > 0) {
                        attachments.forEach(doc => {
                            if (!doc) return;
                            
                            let docObj = {
                                visitFirebaseKey: v.firebaseKey,
                                patientName: v.name || 'ไม่ระบุชื่อ',
                                patientHn: v.hn || 'ไม่ระบุ HN',
                                visitDate: v.date || '1970-01-01',
                                docId: `DOC_${v.id || Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
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
                
                // ส่งแค่ "รหัส ID" ของเอกสารไปที่ปุ่ม ป้องกัน Browser Crash จากข้อมูล Base64
                return `
                <div class="col-sm-6 col-md-4 col-lg-3 fade-in-up" style="animation-delay: ${(idx % 10) * 0.05}s;">
                    <div class="doc-preview-card doc-thumb-card h-100 shadow-sm" data-doc-id="${doc.docId}" data-is-pdf="${isPdf}">
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

    // ฟังก์ชันดึงรูปจากโกดัง (Cache) แล้วเปิดโชว์แบบไม่ค้าง
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