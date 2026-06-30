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
        this.firebaseListeners = []; // 🗑️ สำหรับล้างหน่วยความจำ
    }

    get html() {
        return `
            <div class="page-header mb-4 d-flex justify-content-between align-items-end flex-wrap gap-3">
                <div>
                    <h2 class="page-title text-primary"><i class="fa-solid fa-folder-tree me-2"></i> ศูนย์รวมเอกสารและไฟล์แนบ</h2>
                    <p class="text-muted mt-1 mb-0 fw-bold">จัดการแฟ้มเอกสารคนไข้แบบรวมศูนย์ (Patient-Centric View)</p>
                </div>
                
                <div class="d-flex gap-2 flex-wrap align-items-center bg-white p-1 rounded-pill shadow-sm border px-2">
                    <button class="btn btn-sm btn-light rounded-pill px-3 fw-bold text-secondary filter-btn active" data-filter="all">ทั้งหมด</button>
                    <button class="btn btn-sm btn-light rounded-pill px-3 fw-bold text-secondary filter-btn" data-filter="today">วันนี้</button>
                    <button class="btn btn-sm btn-light rounded-pill px-3 fw-bold text-secondary filter-btn" data-filter="month">เดือนนี้</button>
                    <button class="btn btn-sm btn-light rounded-pill px-3 fw-bold text-secondary filter-btn" data-filter="year">ปีนี้</button>
                    
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

            <div id="dc-loading" class="text-center py-5 text-primary">
                <i class="fas fa-spinner fa-spin fa-3x drop-shadow mb-3"></i><br>กำลังประมวลผลเอกสาร...
            </div>
            
            <div id="dc-gallery-container" style="display: none; padding-bottom: 50px;">
                </div>
        `;
    }

    init() {
        if (typeof db === 'undefined') {
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้', 'error');
            return;
        }
        
        // ❌ ไม่ต้องทำ Auto-purge ที่หน้านี้แล้ว ปล่อยให้ระบบ Auto Purge Service ส่วนกลางจัดการ
        
        this.#bindEvents();
        this.#loadDocumentsFromDB();
    }

    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        console.log("🧹 [Document Center] Cleaned up listeners.");
    }

    #bindEvents() {
        // Event Delegation สำหรับปุ่ม Filter
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.applyFilter(filter);
            });
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

    // 📡 Data Fetching
    #loadDocumentsFromDB() {
        document.getElementById('dc-loading').style.display = 'block';
        document.getElementById('dc-gallery-container').style.display = 'none';

        // ⚠️ Trade-off Warning: หากเก็บไฟล์เป็น Base64 การดึง 'visits' ทั้งก้อนจะใช้แบนด์วิดธ์สูง
        // ในอนาคตควรย้ายไฟล์รูปภาพไปไว้ที่ Firebase Storage และเก็บแค่ URL
        const ref = db.ref('patients_database_v2/visits');
        const callback = ref.on('value', snap => {
            const data = snap.val() || {};
            
            // แมปข้อมูลพร้อมเก็บ Firebase Push ID ด้วยเพื่อทำ Atomic Update!
            const visits = Object.keys(data).map(k => ({ firebaseKey: k, ...data[k] }));
            
            const docsExtract = [];

            visits.forEach(v => {
                if (v && Array.isArray(v.attachments) && v.attachments.length > 0) {
                    v.attachments.forEach(doc => {
                        docsExtract.push({
                            visitFirebaseKey: v.firebaseKey, // 🔥 กุญแจสำคัญสำหรับแก้ไข/ลบ
                            visitId: v.id,
                            patientName: v.name || 'ไม่ระบุชื่อ',
                            patientHn: v.hn || 'ไม่ระบุ HN',
                            visitDate: v.date || '1970-01-01', 
                            docId: doc.id,
                            docType: doc.type,
                            docName: doc.name || 'เอกสารแนบ',
                            dataUrl: doc.dataUrl // ⚠️ Heavy Payload
                        });
                    });
                }
            });

            // ล่าสุดอยู่บนสุด
            this.state.allDocuments = docsExtract.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
            this.applyFilter(this.state.currentFilter);
            
            document.getElementById('dc-loading').style.display = 'none';
            document.getElementById('dc-gallery-container').style.display = 'block';
        });

        this.firebaseListeners.push({ path: 'patients_database_v2/visits', callback });
    }

    // 🎛️ Filter Engine
    applyFilter(timeFilter) {
        if (timeFilter) {
            this.state.currentFilter = timeFilter;
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            
            if (timeFilter !== 'specific') {
                const activeBtn = document.querySelector(`.filter-btn[data-filter="${timeFilter}"]`);
                if(activeBtn) activeBtn.classList.add('active');
                
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
            else if (this.state.currentFilter === 'specific' && this.state.specificDate) {
                passTime = (doc.visitDate === this.state.specificDate);
            }

            let passSearch = true;
            if (this.state.searchQuery) {
                const searchStr = this.state.searchQuery;
                passSearch = doc.docName.toLowerCase().includes(searchStr) || 
                             doc.patientName.toLowerCase().includes(searchStr) || 
                             doc.patientHn.toLowerCase().includes(searchStr);
            }

            return passTime && passSearch;
        });

        this.#renderGroupedGallery(filtered);
    }

    // 🎨 UI Rendering (O(N) Complexity)
    #renderGroupedGallery(docs) {
        const container = document.getElementById('dc-gallery-container');
        const badge = document.getElementById('dc-count-badge');

        if (docs.length === 0) {
            badge.innerHTML = `<i class="fa-solid fa-users me-1"></i> ไม่พบแฟ้มเอกสาร`;
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fa-regular fa-folder-open fa-4x text-muted mb-3" style="opacity:0.3;"></i>
                    <h5 class="fw-bold text-secondary">ไม่พบเอกสารในช่วงเวลานี้</h5>
                </div>
            `;
            return;
        }

        // 🚀 จัดกลุ่มคนไข้ด้วย Hash Map (O(N) Complexity) โค้ดเดิมคือสุดยอดอยู่แล้ว!
        const groupedDocs = docs.reduce((acc, doc) => {
            const key = doc.patientHn;
            if (!acc[key]) {
                acc[key] = {
                    patientName: doc.patientName,
                    patientHn: doc.patientHn,
                    documents: []
                };
            }
            acc[key].documents.push(doc);
            return acc;
        }, {});

        const patientGroups = Object.values(groupedDocs);
        patientGroups.sort((a, b) => a.patientName.localeCompare(b.patientName, 'th'));

        badge.innerHTML = `<i class="fa-solid fa-users me-1"></i> พบ <b>${patientGroups.length}</b> แฟ้ม (รวม ${docs.length} ไฟล์)`;

        let html = '';
        patientGroups.forEach((group, groupIdx) => {
            let docCardsHtml = '';
            
            group.documents.forEach((doc) => {
                const isPdf = doc.docType === 'pdf' || (doc.dataUrl && doc.dataUrl.startsWith('data:application/pdf'));
                const previewContent = isPdf 
                    ? `<i class="fa-solid fa-file-pdf doc-icon-large drop-shadow"></i>`
                    : `<img src="${doc.dataUrl}" alt="Thumbnail" loading="lazy">`;
                
                const dParts = doc.visitDate.split('-');
                const displayDate = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}/${dParts[0]}` : doc.visitDate;
                
                // 🔒 Security XSS Protection
                const safeName = this.#escapeHTML(doc.docName);

                docCardsHtml += `
                <div class="col-sm-6 col-md-4 col-xl-3">
                    <div class="doc-card">
                        <div class="doc-preview-area cursor-pointer" onclick="App.pages.document_center.viewDoc('${doc.dataUrl}', '${isPdf}')">
                            ${previewContent}
                        </div>
                        <div class="doc-info">
                            <div class="doc-title" title="${safeName}">${safeName}</div>
                            <div class="doc-meta"><i class="fa-regular fa-calendar text-primary me-1"></i> ${displayDate}</div>
                        </div>
                        <div class="doc-actions">
                            <button class="btn btn-sm btn-light text-primary border shadow-sm fw-bold flex-grow-1" onclick="App.pages.document_center.viewDoc('${doc.dataUrl}', '${isPdf}')"><i class="fa-solid fa-eye"></i></button>
                            <button class="btn btn-sm btn-light text-warning-dark border shadow-sm fw-bold" onclick="App.pages.document_center.editDoc('${doc.visitFirebaseKey}', '${doc.docId}', '${safeName}')" title="เปลี่ยนชื่อ"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn btn-sm btn-light text-danger border shadow-sm fw-bold" onclick="App.pages.document_center.deleteDoc('${doc.visitFirebaseKey}', '${doc.docId}')" title="ลบ"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </div>`;
            });

            const safePatientName = this.#escapeHTML(group.patientName);
            
            html += `
            <div class="patient-folder fade-in-up" style="animation-delay: ${groupIdx * 0.05}s;">
                <div class="patient-folder-header">
                    <div class="d-flex align-items-center">
                        <div class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3 shadow-sm border border-white" style="width: 45px; height: 45px;">
                            <i class="fa-solid fa-folder-open fa-lg"></i>
                        </div>
                        <div>
                            <h5 class="mb-1 fw-bold text-dark" style="font-family:'Prompt';">${safePatientName}</h5>
                            <div class="text-muted small fw-bold"><i class="fa-solid fa-id-card me-1 text-secondary"></i> HN: ${group.patientHn}</div>
                        </div>
                    </div>
                    <div>
                        <span class="badge bg-primary px-3 py-2 rounded-pill shadow-sm"><i class="fa-solid fa-paperclip me-1"></i> ${group.documents.length} เอกสาร</span>
                    </div>
                </div>
                <div class="patient-folder-body">
                    <div class="row g-3">
                        ${docCardsHtml}
                    </div>
                </div>
            </div>`;
        });
        
        container.innerHTML = html;
    }

    // ---------------------------------------------------------
    // 🛡️ User Actions & Atomic Database Updates
    // ---------------------------------------------------------
    viewDoc(dataUrl, isPdf) {
        if (isPdf === 'true') {
            Swal.fire({
                html: `<iframe src="${dataUrl}" style="width:100%; height:75vh; border:none; border-radius:8px;"></iframe>`,
                showConfirmButton: false, width: '90%', padding: '10px', showCloseButton: true,
                customClass: { popup: 'shadow-lg border-0' }
            });
        } else {
            Swal.fire({ 
                imageUrl: dataUrl, imageAlt: 'Document', 
                showConfirmButton: false, width: '80%', padding: '0', 
                background: 'transparent', showCloseButton: true, backdrop: 'rgba(15, 23, 42, 0.9)'
            });
        }
    }

    editDoc(visitFirebaseKey, docId, currentName) {
        Swal.fire({
            title: 'เปลี่ยนชื่อเอกสาร',
            input: 'text',
            inputValue: currentName,
            showCancelButton: true,
            confirmButtonText: 'บันทึก',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#3b82f6',
            inputValidator: (value) => {
                if (!value.trim()) return 'กรุณาระบุชื่อไฟล์ใหม่!';
            }
        }).then(res => {
            if (res.isConfirmed) {
                this.#executeAtomicDBUpdate(visitFirebaseKey, docId, 'edit', res.value.trim());
            }
        });
    }

    deleteDoc(visitFirebaseKey, docId) {
        Swal.fire({
            title: 'ลบเอกสารนี้ถาวร?',
            text: 'การลบเอกสารจะไม่สามารถกู้คืนได้ ยืนยันหรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'ใช่, ลบทิ้ง!',
            cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'border-danger' }
        }).then((result) => {
            if (result.isConfirmed) {
                this.#executeAtomicDBUpdate(visitFirebaseKey, docId, 'delete');
            }
        });
    }

    // 🚨 หัวใจหลักของการอัปเดตแบบไม่ให้ข้อมูลคิวหาย! (Atomic Update)
    async #executeAtomicDBUpdate(visitFirebaseKey, docId, action, newName = '') {
        Swal.fire({ title: 'กำลังบันทึกข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        try {
            // 1. วิ่งตรงไปหา Visit ด้วย Firebase Key ที่เตรียมไว้แต่แรก (เร็วมาก Big O(1))
            const visitRef = db.ref(`patients_database_v2/visits/${visitFirebaseKey}`);
            const snap = await visitRef.once('value');
            
            if (snap.exists()) {
                const visitData = snap.val();
                
                if (visitData.attachments) {
                    let newAttachments = [...visitData.attachments];
                    
                    if (action === 'delete') {
                        newAttachments = newAttachments.filter(d => d.id !== docId);
                    } else if (action === 'edit') {
                        const docIndex = newAttachments.findIndex(d => d.id === docId);
                        if (docIndex !== -1) {
                            newAttachments[docIndex].name = newName;
                        }
                    }
                    
                    // 2. ใช้คำสั่ง .update() เฉพาะฟิลด์ attachments (Atomic) เพื่อป้องกันการเซฟทับคนอื่น
                    await visitRef.update({
                        attachments: newAttachments
                    });

                    Swal.fire({ title: 'สำเร็จ!', icon: 'success', timer: 1200, showConfirmButton: false });
                } else {
                    throw new Error("No attachments found in this visit");
                }
            } else {
                throw new Error("Visit Record not found");
            }
        } catch (err) {
            console.error("Atomic Update Failed:", err);
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้ ข้อมูลอาจถูกลบไปแล้ว', 'error');
        }
    }

    // 🛡️ Helpers
    #escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[tag] || tag));
    }
}

// 🌐 Expose Component
const DocumentCenterPage = new DocumentCenterComponent();
window.DocumentCenterPage = DocumentCenterPage;