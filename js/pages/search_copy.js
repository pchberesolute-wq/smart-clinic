// js/pages/search_copy.js
// 🚀 Enterprise Search & Copy Module: Native 3D Toast & In-Memory Patient Modal (v8.6)

class SearchCopyPageComponent {
    constructor() {
        this.state = {
            allPatients: []
        };
        this.firebaseListeners = [];
    }

    get html() {
        return `
            <style>
                .copy-btn-group { display: flex; align-items: center; justify-content: space-between; padding: 10px 15px; border-radius: 12px; margin-bottom: 8px; transition: all 0.2s; }
                .copy-btn-group:hover { filter: brightness(0.97); }
                .copy-label { font-size: 13px; font-weight: 700; color: #64748b; white-space: nowrap; flex-shrink: 0; }
                
                /* 🌟 [PREMIUM NATIVE TOAST CSS] */
                .dialysis-custom-toast {
                    position: fixed; top: 30px; right: 30px; background: #ffffff !important;
                    border: 2px solid #10b981 !important; box-shadow: 0 15px 35px -5px rgba(16, 185, 129, 0.25), 0 5px 15px -3px rgba(0, 0, 0, 0.08) !important;
                    border-radius: 50px !important; padding: 12px 28px !important; font-family: 'Prompt', sans-serif !important;
                    color: #0f172a !important; font-weight: 700 !important; font-size: 15px !important; z-index: 99999999 !important;
                    display: flex; align-items: center; gap: 12px; transform: translate3d(120%, 0, 0); opacity: 0;
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15), opacity 0.3s ease; pointer-events: none;
                }
                .dialysis-custom-toast.show { transform: translate3d(0, 0, 0); opacity: 1; }

                /* 🌟 [MODAL CUSTOM CSS] */
                .patient-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .patient-modal-box { background: #f8fafc; padding: 12px 15px; border-radius: 12px; border: 1px solid #e2e8f0; }
                .patient-modal-label { font-size: 11px; color: #64748b; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px; }
                .patient-modal-value { font-size: 14px; color: #0f172a; font-weight: 700; }
                .patient-modal-full { grid-column: 1 / -1; }
            </style>

            <div class="page-header mb-4">
                <div>
                    <h2 class="page-title text-primary"><i class="fa-solid fa-copy me-2"></i> ศูนย์ค้นหาและคัดลอกข้อมูลด่วน</h2>
                    <p class="text-muted mt-1 mb-0">ค้นหาคนไข้แล้วกดปุ่มเพื่อคัดลอกข้อมูล หรือเปิดหน้าต่างดูประวัติส่วนตัวได้ทันที</p>
                </div>
            </div>

            <div class="modern-panel mb-4 p-4" style="border-top: 4px solid var(--primary); background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); border-radius: 20px;">
                <div style="position: absolute; top: -30px; right: -30px; opacity: 0.03; font-size: 200px; pointer-events: none;"><i class="fa-solid fa-magnifying-glass"></i></div>
                <div class="row align-items-center g-4 position-relative z-1">
                    <div class="col-md-9">
                        <label class="form-label fw-bold text-primary mb-2" style="font-size: 15px;"><i class="fa-solid fa-keyboard me-2"></i>พิมพ์คำค้นหา (ชื่อ, นามสกุล, HN, หรือ เลข ปชช.)</label>
                        <div class="search-box-modern w-100 shadow-sm bg-white" style="border-radius: 14px; overflow: hidden;">
                            <i class="fa-solid fa-magnifying-glass text-primary ms-2 me-2"></i>
                            <input type="text" id="scMainSearch" class="border-0 bg-transparent w-100 fw-bold text-dark py-2" placeholder="ตัวอย่าง: สมชาย, 11005xxxxxxxx, HN-69xxxx" style="outline: none; font-size: 16px;" autocomplete="off" spellcheck="false">
                        </div>
                    </div>
                    <div class="col-md-3 text-md-end mt-md-5">
                        <span class="badge bg-white text-primary border border-primary-subtle p-3 rounded-pill shadow-sm" id="sc-total-count" style="font-size: 14px;">
                            <i class="fas fa-spinner fa-spin me-2"></i> กำลังซิงค์ Cloud...
                        </span>
                    </div>
                </div>
            </div>

            <div id="search-results-area" class="row g-4 pb-5">
                <div class="col-12 text-center py-5 text-muted">
                    <i class="fa-solid fa-keyboard fa-4x mb-3" style="opacity:0.2; color: var(--primary);"></i>
                    <h5 class="fw-bold">พร้อมใช้งาน! เริ่มพิมพ์คำค้นหาด้านบนได้เลย</h5>
                </div>
            </div>
            
            <div id="dialysisPoaster" class="dialysis-custom-toast">
                <div class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center shadow-sm" style="width:28px; height:28px;">
                    <i class="fa-solid fa-check" style="font-size:14px;"></i>
                </div>
                <span id="dialysisPoasterText">คัดลอกข้อมูลสำเร็จ</span>
            </div>
        `;
    }

    init() {
        if (typeof db === 'undefined') return;
        const ref = db.ref('patients_database_v2/patients');
        const callback = ref.on('value', snap => {
            const data = snap.val();
            let rawPatients = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
            this.state.allPatients = rawPatients.filter(p => p !== null && p.status !== 'ย้ายคลินิก' && p.status !== 'เสียชีวิต');
            const badge = document.getElementById('sc-total-count');
            if (badge) badge.innerHTML = `<i class="fa-solid fa-database me-2"></i> คลังข้อมูลพร้อมค้นหา <b>${this.state.allPatients.length}</b> ราย`;
            this.triggerSearch();
        });
        this.firebaseListeners.push({ path: 'patients_database_v2/patients', callback });

        const searchInput = document.getElementById('scMainSearch');
        if (searchInput) {
            searchInput.focus();
            searchInput.addEventListener('input', () => this.triggerSearch());
        }
    }

    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
    }

    triggerSearch() {
        const query = (document.getElementById('scMainSearch')?.value || "").trim().toLowerCase();
        const resultsArea = document.getElementById('search-results-area');
        if (!resultsArea) return;

        if (query.length === 0) {
            resultsArea.innerHTML = `<div class="col-12 text-center py-5 text-muted"><i class="fa-solid fa-keyboard fa-4x mb-3" style="opacity:0.2; color: var(--primary);"></i><h5 class="fw-bold">พร้อมใช้งาน! เริ่มพิมพ์คำค้นหาด้านบนได้เลย</h5></div>`;
            return;
        }

        const filtered = this.state.allPatients.filter(p => 
            (p.hn || "").toLowerCase().includes(query) || 
            (p.name_th || "").toLowerCase().includes(query) || 
            (p.name_en || "").toLowerCase().includes(query) || 
            (p.idcard || "").replace(/-/g, "").includes(query) || 
            (p.idcard || "").includes(query)
        );

        if (filtered.length === 0) {
            resultsArea.innerHTML = `<div class="col-12 text-center py-5 text-muted"><i class="fa-solid fa-face-frown-open fa-4x mb-3" style="color:var(--danger); opacity:0.3;"></i><h5 class="fw-bold text-danger">ไม่พบรายชื่อคนไข้</h5></div>`;
            return;
        }

        let html = "";
        filtered.forEach(p => {
            const safeNameTh = this.#escapeHTML(p.name_th);
            const safeTitle = this.#escapeHTML(p.title || '');
            const safeHn = this.#escapeHTML(p.hn || '-');
            const cleanIdCard = (p.idcard || "").replace(/\D/g, "");
            const displayIdCard = this.#formatIdCardDisplay(cleanIdCard);
            let imgSrc = p.photo_base64 ? (p.photo_base64.startsWith('data:image') ? p.photo_base64 : 'data:image/jpeg;base64,' + p.photo_base64) : 'https://ui-avatars.com/api/?name='+ encodeURIComponent(safeNameTh||'X') +'&background=f1f5f9&color=64748b&bold=true';

            html += `
            <div class="col-md-6 col-xl-4 fade-in-up">
                <div class="modern-panel card-hover-float h-100 p-4 shadow-sm" style="border-radius: 20px;">
                    <div class="d-flex align-items-center mb-4 border-bottom pb-3">
                        <img src="${imgSrc}" class="rounded-circle me-3 shadow-sm border border-2 border-white" style="width: 70px; height: 70px; object-fit: cover; flex-shrink: 0;">
                        <div class="min-w-0 flex-grow-1">
                            <h5 class="fw-bold mb-1 text-dark text-truncate" style="font-family:'Prompt';">${safeTitle}${safeNameTh}</h5>
                            <span class="badge bg-primary fw-bold px-3 py-1 shadow-sm rounded-pill"><i class="fa-solid fa-hospital-user me-1"></i> ${safeHn}</span>
                        </div>
                    </div>

                    <div class="d-flex flex-column">
                        <div class="copy-btn-group" style="background: var(--info-light); border: 1px solid #bae6fd;">
                            <span class="copy-label"><i class="fa-solid fa-id-card text-info me-2"></i>เลข ปชช.</span>
                            <button class="btn btn-sm btn-light fw-bold text-info-dark shadow-sm rounded-pill px-3 ms-2" style="border: 1px solid #7dd3fc; letter-spacing: 0.5px;" onclick="SearchCopyPage.copyText('${cleanIdCard}', this, 'เลขบัตรประชาชน')">
                                ${displayIdCard || '-'} <i class="fa-regular fa-copy ms-1"></i>
                            </button>
                        </div>
                        <div class="copy-btn-group" style="background: var(--success-light); border: 1px solid #bbf7d0;">
                            <span class="copy-label"><i class="fa-solid fa-qrcode text-success me-2"></i>รหัส HN</span>
                            <button class="btn btn-sm btn-light fw-bold text-success-dark shadow-sm rounded-pill px-4 ms-2" style="border: 1px solid #86efac;" onclick="SearchCopyPage.copyText('${safeHn}', this, 'รหัส HN')">
                                ${safeHn} <i class="fa-regular fa-copy ms-1"></i>
                            </button>
                        </div>
                        <div class="copy-btn-group" style="background: var(--warning-light); border: 1px solid #fde68a;">
                            <span class="copy-label"><i class="fa-solid fa-user-tag text-warning-dark me-2"></i>ชื่อ-สกุล</span>
                            <button class="btn btn-sm btn-light fw-bold text-warning-dark shadow-sm rounded-pill px-4 ms-2 text-truncate" style="border: 1px solid #fde047; max-width: 220px;" onclick="SearchCopyPage.copyText('${safeNameTh}', this, 'ชื่อ-นามสกุล')">
                                ${safeNameTh || '-'} <i class="fa-regular fa-copy ms-1"></i>
                            </button>
                        </div>
                        
                        <!-- 🚨 THE FIX: เรียกใช้ฟังก์ชันแสดง Pop-up หน้าต่างประวัติโดยตรง (ไม่พึ่ง Router) -->
                        <div class="d-flex gap-2 mt-3">
                            <button class="btn btn-light text-primary fw-bold shadow-sm rounded-pill w-100" style="border: 1px solid #bfdbfe;" onclick="SearchCopyPage.showPatientModal('${safeHn}')">
                                <i class="fa-solid fa-address-card me-1"></i> แสดงประวัติ
                            </button>
                            <button class="btn btn-primary fw-bold shadow-sm rounded-pill w-100" onclick="App.switchPage('patient_history', null, '${safeHn}')">
                                <i class="fa-solid fa-folder-open me-1"></i> แฟ้ม EMR
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        });
        resultsArea.innerHTML = html;
    }

    // 🚨 THE FIX: ฟังก์ชันสร้างหน้าต่าง Pop-up สวยๆ โดยดึงข้อมูลจาก RAM ตรงๆ (ไวแสง 0.01 วิ)
    showPatientModal(hn) {
        const pt = this.state.allPatients.find(p => p.hn === hn || p.hn === hn.replace('HN-', ''));
        if(!pt) {
            Swal.fire('ข้อผิดพลาด', 'ไม่พบข้อมูลผู้ป่วยในระบบ', 'error'); 
            return;
        }

        const safeName = this.#escapeHTML(pt.name_th);
        const safeTitle = this.#escapeHTML(pt.title || '');
        const safeHn = this.#escapeHTML(pt.hn || '-');
        const safeIdCard = this.#formatIdCardDisplay((pt.idcard || "").replace(/\D/g, ""));
        let imgSrc = pt.photo_base64 ? (pt.photo_base64.startsWith('data:image') ? pt.photo_base64 : 'data:image/jpeg;base64,' + pt.photo_base64) : 'https://ui-avatars.com/api/?name='+ encodeURIComponent(safeName||'X') +'&background=f1f5f9&color=64748b&bold=true';

        const htmlLayout = `
            <div class="text-start" style="font-family: 'Prompt', sans-serif;">
                <div class="d-flex align-items-center mb-4 border-bottom pb-4">
                    <img src="${imgSrc}" class="rounded-circle me-3 shadow-sm border border-2 border-white" style="width: 85px; height: 85px; object-fit: cover; flex-shrink: 0;">
                    <div class="min-w-0 flex-grow-1">
                        <h4 class="fw-bold mb-2 text-dark text-truncate">${safeTitle}${safeName}</h4>
                        <div>
                            <span class="badge bg-primary fw-bold px-3 py-2 shadow-sm rounded-pill me-1"><i class="fa-solid fa-hospital-user me-1"></i> ${safeHn}</span>
                            <span class="badge ${pt.status === 'ปกติ' ? 'bg-success' : 'bg-danger'} fw-bold px-3 py-2 shadow-sm rounded-pill"><i class="fa-solid fa-heart-pulse me-1"></i> ${this.#escapeHTML(pt.status || 'ปกติ')}</span>
                        </div>
                    </div>
                </div>

                <div class="patient-modal-grid">
                    <div class="patient-modal-box patient-modal-full" style="background:#f0f9ff; border-color:#bae6fd;">
                        <div class="patient-modal-label text-primary"><i class="fa-solid fa-id-card me-1"></i> เลขประจำตัวประชาชน</div>
                        <div class="patient-modal-value fs-5">${safeIdCard}</div>
                    </div>
                    
                    <div class="patient-modal-box">
                        <div class="patient-modal-label"><i class="fa-solid fa-cake-candles me-1"></i> อายุ / เพศ</div>
                        <div class="patient-modal-value">${this.#escapeHTML(pt.age || '-')} <span class="text-muted fw-normal mx-1">|</span> ${this.#escapeHTML(pt.gender || '-')}</div>
                    </div>
                    
                    <div class="patient-modal-box" style="background:#fef2f2; border-color:#fecaca;">
                        <div class="patient-modal-label text-danger"><i class="fa-solid fa-droplet me-1"></i> กรุ๊ปเลือด</div>
                        <div class="patient-modal-value text-danger fs-5">${this.#escapeHTML(pt.blood_type || '-')}</div>
                    </div>

                    <div class="patient-modal-box patient-modal-full">
                        <div class="patient-modal-label"><i class="fa-solid fa-phone me-1"></i> เบอร์โทรศัพท์ติดต่อ</div>
                        <div class="patient-modal-value">${this.#escapeHTML(pt.phone || '-')}</div>
                    </div>
                    
                    <div class="patient-modal-box patient-modal-full" style="background:#f0fdf4; border-color:#bbf7d0;">
                        <div class="patient-modal-label text-success"><i class="fa-solid fa-shield-heart me-1"></i> สิทธิการรักษา</div>
                        <div class="patient-modal-value text-success">${this.#escapeHTML(pt.right || 'ไม่ระบุสิทธิ')}</div>
                    </div>

                    <div class="patient-modal-box patient-modal-full">
                        <div class="patient-modal-label text-warning-dark"><i class="fa-solid fa-notes-medical me-1"></i> โรคประจำตัว</div>
                        <div class="patient-modal-value">${this.#escapeHTML(pt.underlying_disease || '-')}</div>
                    </div>

                    <div class="patient-modal-box patient-modal-full">
                        <div class="patient-modal-label text-danger"><i class="fa-solid fa-virus-covid me-1"></i> โรคติดเชื้อ / ประวัติแพ้ยา</div>
                        <div class="patient-modal-value">
                            <span class="text-danger">${this.#escapeHTML(pt.infection || 'Negative')}</span>
                            <span class="text-muted fw-normal mx-2">|</span>
                            แพ้ยา: <span class="text-warning-dark">${this.#escapeHTML(pt.allergy || 'ไม่มี')}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        Swal.fire({
            html: htmlLayout,
            showCloseButton: true,
            showCancelButton: true,
            cancelButtonText: 'ปิดหน้าต่าง',
            showConfirmButton: true,
            confirmButtonText: '<i class="fa-solid fa-folder-open me-1"></i> เปิดแฟ้ม EMR',
            confirmButtonColor: '#2563eb',
            customClass: { popup: 'premium-alert' },
            width: '600px'
        }).then((result) => {
            if (result.isConfirmed) {
                App.switchPage('patient_history', null, safeHn); // ถ้าอยากเข้า EMR ก็กดจาก Pop-up ได้เลย!
            }
        });
    }

    showNativeToast(message) {
        const toast = document.getElementById('dialysisPoaster');
        const toastText = document.getElementById('dialysisPoasterText');
        if(!toast || !toastText) return;
        toastText.innerText = message;
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 1500);
    }

    // 🚨 THE FIX: Hybrid Fallback Clipboard Engine (ลัดคิวป๊อปอัปความปลอดภัยเบราว์เซอร์)
    copyText(text, btnElement, fieldName) {
        if (!text || text === "-" || text === "undefined") {
            Swal.fire({ title: 'ไม่มีข้อมูล', text: 'ช่องนี้ว่างเปล่า', icon: 'warning', timer: 1200, showConfirmButton: false });
            return;
        }

        // 1. สร้าง <textarea> ล่องหนเพื่อเป็นพื้นที่จำลองการก๊อปปี้
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        // 2. ซ่อนมันให้พ้นสายตา และป้องกันหน้าจอกระตุก
        textArea.style.position = "fixed";
        textArea.style.top = "-99999px";
        textArea.style.left = "-99999px";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        
        // 3. ไฮไลท์คลุมดำข้อความ
        textArea.select();
        textArea.setSelectionRange(0, 99999); // รองรับ Mobile
        
        try {
            // 4. สั่งคัดลอกด้วยคำสั่งระดับ DOM (ลัดคิวป๊อปอัป Browser ได้ 100%)
            const successful = document.execCommand('copy');
            if (successful) {
                const originalHTML = btnElement.innerHTML;
                const originalClass = btnElement.className;
                const originalWidth = btnElement.offsetWidth; 
                
                btnElement.style.width = originalWidth + 'px';
                btnElement.className = "btn btn-sm btn-success text-white fw-bold shadow-sm rounded-pill d-inline-flex justify-content-center align-items-center ms-2";
                btnElement.innerHTML = `<i class="fa-solid fa-check me-1"></i> สำเร็จ`;
                
                this.showNativeToast(`คัดลอก ${fieldName} สำเร็จแล้ว`);
                
                setTimeout(() => {
                    btnElement.style.width = ''; 
                    btnElement.className = originalClass; 
                    btnElement.innerHTML = originalHTML;
                }, 1500);
            } else {
                throw new Error("execCommand failed");
            }
        } catch (err) {
            Swal.fire('ข้อผิดพลาด', 'บราวเซอร์ไม่อนุญาตการเข้าถึง Clipboard', 'error');
        } finally {
            // 5. ทำลายหลักฐานกล่องล่องหนทิ้ง ป้องกัน Memory Leak
            document.body.removeChild(textArea);
        }
    }

    #escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }

    #formatIdCardDisplay(id) {
        if (!id) return '-';
        const clean = String(id).replace(/\D/g, ''); 
        if (clean.length === 13) { return clean.replace(/(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/, "$1-$2-$3-$4-$5"); }
        return clean; 
    }
}
const SearchCopyPage = new SearchCopyPageComponent();
window.SearchCopyPage = SearchCopyPage;