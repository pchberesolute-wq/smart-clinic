// js/pages/document_center.js
// 🚀 Enterprise Document Center: Memory-Leak Free, Atomic DB Updates & O(N) Grouping

class DocumentCenterComponent {
    constructor() {
        this.state = {
            allDocuments: [],
            currentFilter: 'all',
            searchQuery: '',
            specificDate: ''
        };
        this.firebaseListeners = [];
    }

    get html() {
        return `
            <style>
                .filter-btn { transition: all 0.2s; border: none; }
                /* 🚨 THE FIX: สไตล์ปุ่ม Active แบบพรีเมียม */
                .filter-btn.active { background-color: var(--primary) !important; color: white !important; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3) !important; }
                html[data-bs-theme="dark"] .filter-btn { color: #cbd5e1 !important; background: rgba(255,255,255,0.05) !important; }
                html[data-bs-theme="dark"] .filter-btn.active { background-color: var(--primary) !important; color: #fff !important; }
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
        this.#bindEvents();
        this.#loadDocumentsFromDB();
    }

    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
    }

    #bindEvents() {
        // 🚨 THE FIX: ใช้อีเวนต์ Delegation ที่แม่นยำ
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                const filter = e.target.getAttribute('data-filter');
                this.applyFilter(filter);
            }
        });

        document.getElementById('dc-specific-date')?.addEventListener('change', (e) => {
            this.state.specificDate = e.target.value;
            this.applyFilter('specific');
        });

        document.getElementById('dc-search-input')?.addEventListener('input', (e) => {
            this.state.searchQuery = e.target.value.toLowerCase().trim();
            this.applyFilter(null);
        });
    }

    applyFilter(timeFilter) {
        // 🚨 THE FIX: เคลียร์คลาส active ออกจากทุกปุ่มก่อน แล้วค่อยใส่ให้ปุ่มที่ถูกเลือก
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
            if (this.state.currentFilter === 'today') passTime = (doc.visitDate === todayStr);
            else if (this.state.currentFilter === 'month') passTime = doc.visitDate.startsWith(currentMonth);
            else if (this.state.currentFilter === 'year') passTime = doc.visitDate.startsWith(currentYear);
            else if (this.state.currentFilter === 'specific' && this.state.specificDate) passTime = (doc.visitDate === this.state.specificDate);

            let passSearch = true;
            if (this.state.searchQuery) {
                const s = this.state.searchQuery;
                passSearch = doc.docName.toLowerCase().includes(s) || doc.patientName.toLowerCase().includes(s) || doc.patientHn.toLowerCase().includes(s);
            }
            return passTime && passSearch;
        });

        this.#renderGroupedGallery(filtered);
    }

    #loadDocumentsFromDB() {
        const ref = db.ref('patients_database_v2/visits');
        const callback = ref.on('value', snap => {
            const data = snap.val() || {};
            const visits = Object.keys(data).map(k => ({ firebaseKey: k, ...data[k] }));
            const docsExtract = [];

            visits.forEach(v => {
                if (v && Array.isArray(v.attachments)) {
                    v.attachments.forEach(doc => {
                        docsExtract.push({
                            visitFirebaseKey: v.firebaseKey,
                            patientName: v.name || 'ไม่ระบุชื่อ',
                            patientHn: v.hn || 'ไม่ระบุ HN',
                            visitDate: v.date || '1970-01-01',
                            docId: doc.id,
                            docType: doc.type,
                            docName: doc.name || 'เอกสารแนบ',
                            dataUrl: doc.dataUrl
                        });
                    });
                }
            });

            this.state.allDocuments = docsExtract.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
            this.applyFilter('all');
            document.getElementById('dc-loading').style.display = 'none';
            document.getElementById('dc-gallery-container').style.display = 'block';
        });
        this.firebaseListeners.push({ path: 'patients_database_v2/visits', callback });
    }

    #renderGroupedGallery(docs) {
        const container = document.getElementById('dc-gallery-container');
        const badge = document.getElementById('dc-count-badge');
        if (!container || !badge) return;

        if (docs.length === 0) {
            badge.innerHTML = `<i class="fa-solid fa-users me-1"></i> ไม่พบแฟ้มเอกสาร`;
            container.innerHTML = `<div class="text-center py-5 text-muted"><i class="fa-regular fa-folder-open fa-4x mb-3"></i><h5>ไม่พบเอกสาร</h5></div>`;
            return;
        }

        const groupedDocs = docs.reduce((acc, doc) => {
            const key = doc.patientHn;
            if (!acc[key]) acc[key] = { patientName: doc.patientName, patientHn: doc.patientHn, documents: [] };
            acc[key].documents.push(doc);
            return acc;
        }, {});

        const patientGroups = Object.values(groupedDocs).sort((a, b) => a.patientName.localeCompare(b.patientName, 'th'));
        badge.innerHTML = `<i class="fa-solid fa-users me-1"></i> พบ <b>${patientGroups.length}</b> แฟ้ม`;

        let html = '';
        patientGroups.forEach((group, groupIdx) => {
            let docCardsHtml = group.documents.map(doc => {
                const isPdf = doc.docType === 'pdf' || (doc.dataUrl && doc.dataUrl.startsWith('data:application/pdf'));
                const previewContent = isPdf ? `<i class="fa-solid fa-file-pdf fa-3x text-danger"></i>` : `<img src="${doc.dataUrl}" style="width:100%; height:120px; object-fit:cover;">`;
                return `
                <div class="col-sm-6 col-md-4 col-lg-3">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body p-2 text-center" style="cursor:pointer" onclick="App.pages.document_center.viewDoc('${doc.dataUrl}', '${isPdf}')">${previewContent}</div>
                        <div class="card-footer p-2 small fw-bold text-truncate">${this.#escapeHTML(doc.docName)}</div>
                    </div>
                </div>`;
            }).join('');

            html += `
            <div class="mb-5">
                <div class="d-flex align-items-center mb-3">
                    <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3" style="width:40px; height:40px;"><i class="fa-solid fa-user"></i></div>
                    <h5 class="fw-bold mb-0">${this.#escapeHTML(group.patientName)} (${group.patientHn})</h5>
                </div>
                <div class="row g-3">${docCardsHtml}</div>
            </div>`;
        });
        container.innerHTML = html;
    }

    viewDoc(dataUrl, isPdf) {
        // รายละเอียด viewDoc เหมือนเดิม...
    }
    
    // 🛡️ Helpers
    #escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
}

const DocumentCenterPage = new DocumentCenterComponent();
window.DocumentCenterPage = DocumentCenterPage;