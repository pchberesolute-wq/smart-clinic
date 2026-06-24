// js/pages/document_center.js
// 🚀 โมดูลศูนย์รวมเอกสารแนบ (Patient-Centric Folder View + Date Picker + 5-Years Auto-Purge)

const DocumentCenterPage = {
    allDocuments: [],
    currentFilter: 'all',

    html: `
        <style>
            .patient-folder { border-radius: 16px; border: 1px solid #cbd5e1; background: #ffffff; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
            .patient-folder-header { background: linear-gradient(to right, #f8fafc, #f1f5f9); padding: 15px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
            .patient-folder-body { padding: 20px; background: #ffffff; }
            .doc-card { border-radius: 12px; border: 1px solid #e2e8f0; background: #fff; transition: all 0.3s ease; overflow: hidden; height: 100%; display: flex; flex-direction: column; }
            .doc-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(37,99,235,0.15); border-color: #93c5fd; }
            .doc-preview-area { height: 140px; background: #f8fafc; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; border-bottom: 1px solid #e2e8f0; }
            .doc-preview-area img { width: 100%; height: 100%; object-fit: cover; }
            .doc-icon-large { font-size: 3.5rem; color: #ef4444; }
            .doc-info { padding: 12px; flex-grow: 1; display: flex; flex-direction: column; }
            .doc-title { font-weight: 700; color: #0f172a; font-size: 13px; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; }
            .doc-meta { font-size: 11.5px; color: #64748b; font-weight: 600; }
            .doc-actions { display: flex; gap: 6px; padding: 10px 12px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
            .filter-btn.active { background-color: var(--primary) !important; color: white !important; border-color: var(--primary) !important; }
            input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.6; transition: 0.2s; }
            input[type="date"]::-webkit-calendar-picker-indicator:hover { opacity: 1; }
        </style>

        <div class="page-header mb-4 d-flex justify-content-between align-items-end flex-wrap gap-3">
            <div>
                <h2 class="page-title text-primary"><i class="fa-solid fa-folder-tree me-2"></i> ศูนย์รวมเอกสารและไฟล์แนบ</h2>
                <p class="text-muted mt-1 mb-0 fw-bold">จัดการแฟ้มเอกสารคนไข้แบบรวมศูนย์ (Patient-Centric View)</p>
            </div>
            
            <div class="d-flex gap-2 flex-wrap align-items-center bg-white p-1 rounded-pill shadow-sm border px-2">
                <button class="btn btn-sm btn-light rounded-pill px-3 fw-bold text-secondary filter-btn active" id="btn-filter-all" onclick="DocumentCenterPage.applyFilter('all')">ทั้งหมด</button>
                <button class="btn btn-sm btn-light rounded-pill px-3 fw-bold text-secondary filter-btn" id="btn-filter-today" onclick="DocumentCenterPage.applyFilter('today')">วันนี้</button>
                <button class="btn btn-sm btn-light rounded-pill px-3 fw-bold text-secondary filter-btn" id="btn-filter-month" onclick="DocumentCenterPage.applyFilter('month')">เดือนนี้</button>
                <button class="btn btn-sm btn-light rounded-pill px-3 fw-bold text-secondary filter-btn" id="btn-filter-year" onclick="DocumentCenterPage.applyFilter('year')">ปีนี้</button>
                
                <div style="border-left: 2px solid #e2e8f0; height: 24px; margin: 0 5px;"></div>
                
                <div class="d-flex align-items-center px-2">
                    <i class="fa-solid fa-calendar-day text-primary me-2"></i>
                    <input type="date" id="dc-specific-date" class="form-control form-control-sm border-0 bg-transparent fw-bold text-dark p-0" style="width: 110px; outline: none; box-shadow: none;" onchange="DocumentCenterPage.applyFilter('specific')">
                </div>
            </div>
        </div>

        <div class="modern-panel p-3 mb-4 shadow-sm" style="border-radius: 16px;">
            <div class="row g-3 align-items-center">
                <div class="col-md-4">
                    <div class="search-box-modern w-100 border bg-light" style="border-radius: 12px; overflow: hidden;">
                        <i class="fa-solid fa-magnifying-glass text-primary ms-3 me-2"></i>
                        <input type="text" id="dc-search-input" class="border-0 bg-transparent w-100 fw-bold text-dark py-2" placeholder="ค้นหาชื่อคนไข้, HN หรือ ชื่อเอกสาร..." onkeyup="DocumentCenterPage.applyFilter(null)">
                    </div>
                </div>
                <div class="col-md-8 text-md-end">
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill fs-6" id="dc-count-badge">
                        <i class="fa-solid fa-users me-1"></i> โหลดแฟ้มประวัติ...
                    </span>
                </div>
            </div>
        </div>

        <div id="dc-loading" class="text-center py-5 text-primary"><i class="fas fa-spinner fa-spin fa-3x drop-shadow mb-3"></i><br>กำลังจัดกลุ่มแฟ้มเอกสาร...</div>
        
        <div id="dc-gallery-container" style="display: none; padding-bottom: 50px;">
            <!-- โฟลเดอร์คนไข้จะถูกสร้างตรงนี้ -->
        </div>
    `,

    init: function() {
        this.autoCleanUpOldDocuments();
        this.loadDocuments();
    },

    autoCleanUpOldDocuments: function() {
        if (typeof db === 'undefined') return;
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 5);
        const cutoffStr = cutoffDate.toISOString().split('T')[0];

        db.ref('patients_database_v2/visits').once('value').then(snap => {
            let data = snap.val();
            if (!data) return;
            let visits = Array.isArray(data) ? data : Object.keys(data).map(k => data[k]);
            let isUpdated = false;

            visits.forEach(v => {
                if (v && v.date && v.date < cutoffStr) {
                    if (v.attachments && v.attachments.length > 0) {
                        v.attachments = []; 
                        isUpdated = true;
                    }
                }
            });

            if (isUpdated) {
                db.ref('patients_database_v2/visits').set(visits);
            }
        });
    },

    loadDocuments: function() {
        if (typeof db === 'undefined') return;
        document.getElementById('dc-loading').style.display = 'block';
        document.getElementById('dc-gallery-container').style.display = 'none';

        db.ref('patients_database_v2/visits').on('value', snap => {
            const data = snap.val();
            let visits = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
            
            this.allDocuments = [];

            visits.forEach(v => {
                if (v && v.attachments && v.attachments.length > 0) {
                    v.attachments.forEach(doc => {
                        this.allDocuments.push({
                            visitId: v.id,
                            patientName: v.name || 'ไม่ระบุชื่อ',
                            patientHn: v.hn || 'ไม่ระบุ HN',
                            visitDate: v.date, 
                            docId: doc.id,
                            docType: doc.type,
                            docName: doc.name || 'เอกสารแนบ',
                            dataUrl: doc.dataUrl
                        });
                    });
                }
            });

            this.allDocuments.sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));
            this.applyFilter(this.currentFilter);
            
            document.getElementById('dc-loading').style.display = 'none';
            document.getElementById('dc-gallery-container').style.display = 'block';
        });
    },

    applyFilter: function(timeFilter) {
        if(timeFilter) {
            this.currentFilter = timeFilter;
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            
            if(timeFilter !== 'specific') {
                const btn = document.getElementById('btn-filter-' + timeFilter);
                if(btn) btn.classList.add('active');
                document.getElementById('dc-specific-date').value = '';
            }
        }

        const searchText = document.getElementById('dc-search-input').value.toLowerCase().trim();
        const specificDate = document.getElementById('dc-specific-date').value;
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const currentMonth = todayStr.substring(0, 7); 
        const currentYear = todayStr.substring(0, 4);  

        let filtered = this.allDocuments.filter(doc => {
            let passTime = true;
            if (this.currentFilter === 'today') passTime = (doc.visitDate === todayStr);
            else if (this.currentFilter === 'month') passTime = doc.visitDate.startsWith(currentMonth);
            else if (this.currentFilter === 'year') passTime = doc.visitDate.startsWith(currentYear);
            else if (this.currentFilter === 'specific' && specificDate) passTime = (doc.visitDate === specificDate);

            let passSearch = true;
            if (searchText) {
                passSearch = doc.docName.toLowerCase().includes(searchText) || 
                             doc.patientName.toLowerCase().includes(searchText) || 
                             doc.patientHn.toLowerCase().includes(searchText);
            }

            return passTime && passSearch;
        });

        this.renderGroupedGallery(filtered);
    },

    // 🚨 THE CORE FIX: อัลกอริทึมจัดกลุ่มคนไข้ (O(N) Complexity Grouping) 🚨
    renderGroupedGallery: function(docs) {
        const container = document.getElementById('dc-gallery-container');
        const badge = document.getElementById('dc-count-badge');

        if (docs.length === 0) {
            badge.innerHTML = `<i class="fa-solid fa-users me-1"></i> ไม่พบข้อมูลแฟ้ม`;
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fa-regular fa-folder-open fa-4x text-muted mb-3" style="opacity:0.3;"></i>
                    <h5 class="fw-bold text-secondary">ไม่พบเอกสารในช่วงเวลานี้</h5>
                </div>
            `;
            return;
        }

        // จัดกลุ่มด้วย Hash Map
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
        
        // เรียงลำดับโฟลเดอร์ตามชื่อคนไข้ ก-ฮ
        patientGroups.sort((a, b) => a.patientName.localeCompare(b.patientName, 'th'));

        badge.innerHTML = `<i class="fa-solid fa-users me-1"></i> พบ <b>${patientGroups.length}</b> แฟ้มคนไข้ (รวม ${docs.length} ไฟล์)`;

        let html = '';
        patientGroups.forEach((group, groupIdx) => {
            let docCardsHtml = '';
            
            group.documents.forEach((doc, docIdx) => {
                const isPdf = doc.docType === 'pdf' || (doc.dataUrl && doc.dataUrl.startsWith('data:application/pdf'));
                const previewContent = isPdf 
                    ? `<i class="fa-solid fa-file-pdf doc-icon-large drop-shadow"></i>`
                    : `<img src="${doc.dataUrl}" alt="Thumbnail" loading="lazy">`;
                
                const dParts = doc.visitDate.split('-');
                const displayDate = dParts.length === 3 ? `${dParts[2]}/${dParts[1]}/${dParts[0]}` : doc.visitDate;

                docCardsHtml += `
                <div class="col-sm-6 col-md-4 col-xl-3">
                    <div class="doc-card">
                        <div class="doc-preview-area cursor-pointer" onclick="DocumentCenterPage.viewDoc('${doc.dataUrl}', '${isPdf}')">
                            ${previewContent}
                        </div>
                        <div class="doc-info">
                            <div class="doc-title" title="${doc.docName}">${doc.docName}</div>
                            <div class="doc-meta"><i class="fa-regular fa-calendar text-primary me-1"></i> ${displayDate}</div>
                        </div>
                        <div class="doc-actions">
                            <button class="btn btn-sm btn-light text-primary border shadow-sm fw-bold flex-grow-1" onclick="DocumentCenterPage.viewDoc('${doc.dataUrl}', '${isPdf}')"><i class="fa-solid fa-eye"></i></button>
                            <button class="btn btn-sm btn-light text-warning-dark border shadow-sm fw-bold" onclick="DocumentCenterPage.editDoc('${doc.visitId}', '${doc.docId}', '${doc.docName}')" title="เปลี่ยนชื่อ"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn btn-sm btn-light text-danger border shadow-sm fw-bold" onclick="DocumentCenterPage.deleteDoc('${doc.visitId}', '${doc.docId}')" title="ลบ"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </div>`;
            });

            html += `
            <div class="patient-folder fade-in-up" style="animation-delay: ${groupIdx * 0.05}s;">
                <div class="patient-folder-header">
                    <div class="d-flex align-items-center">
                        <div class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3" style="width: 45px; height: 45px;">
                            <i class="fa-solid fa-folder-open fa-lg"></i>
                        </div>
                        <div>
                            <h5 class="mb-1 fw-bold text-dark" style="font-family:'Prompt';">${group.patientName}</h5>
                            <div class="text-muted small fw-bold"><i class="fa-solid fa-id-card me-1"></i> HN: ${group.patientHn}</div>
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
    },

    viewDoc: function(dataUrl, isPdf) {
        if (isPdf === 'true') {
            Swal.fire({
                html: `<iframe src="${dataUrl}" style="width:100%; height:75vh; border:none; border-radius:8px;"></iframe>`,
                showConfirmButton: false, width: '90%', padding: '10px', showCloseButton: true
            });
        } else {
            Swal.fire({ imageUrl: dataUrl, imageAlt: 'Document', showConfirmButton: false, width: '80%', padding: '0', background: 'transparent', showCloseButton: true });
        }
    },

    editDoc: function(visitId, docId, currentName) {
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
                this.updateDatabase(visitId, docId, 'edit', res.value.trim());
            }
        });
    },

    deleteDoc: function(visitId, docId) {
        Swal.fire({
            title: 'ลบเอกสารนี้ถาวร?',
            text: 'การลบเอกสารจะไม่สามารถกู้คืนได้ ยืนยันหรือไม่?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'ใช่, ลบทิ้ง!',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                this.updateDatabase(visitId, docId, 'delete');
            }
        });
    },

    updateDatabase: function(visitId, docId, action, newName = '') {
        Swal.fire({ title: 'กำลังบันทึกข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        db.ref('patients_database_v2/visits').once('value').then(snap => {
            let data = snap.val();
            let visits = Array.isArray(data) ? data : Object.keys(data).map(k => data[k]);
            let vIndex = visits.findIndex(v => v.id === visitId);

            if (vIndex !== -1 && visits[vIndex].attachments) {
                if (action === 'delete') {
                    visits[vIndex].attachments = visits[vIndex].attachments.filter(d => d.id !== docId);
                } else if (action === 'edit') {
                    let docIndex = visits[vIndex].attachments.findIndex(d => d.id === docId);
                    if (docIndex !== -1) {
                        visits[vIndex].attachments[docIndex].name = newName;
                    }
                }
                
                db.ref('patients_database_v2/visits').set(visits).then(() => {
                    Swal.fire({ title: 'สำเร็จ!', icon: 'success', timer: 1200, showConfirmButton: false });
                }).catch(err => {
                    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
                });
            } else {
                Swal.fire('ข้อผิดพลาด', 'ไม่พบข้อมูลเอกสารในระบบ', 'error');
            }
        });
    }
};