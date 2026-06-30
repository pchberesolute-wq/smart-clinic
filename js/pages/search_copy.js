// js/pages/search_copy.js
// 🚀 Enterprise Search & Copy Module: 100% Flicker-Free Native 3D Toast, Memory-Leak Free & Quick Jump EMR

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
                .copy-label { font-size: 13px; font-weight: 700; color: #64748b; }
                
                /* 🌟 [PREMIUM NATIVE TOAST CSS] แยกตัวออกมาจากโครงสร้าง SweetAlert เพื่อแก้บั๊กแว็บแบบถาวร */
                .dialysis-custom-toast {
                    position: fixed;
                    top: 30px;
                    right: 30px;
                    background: #ffffff !important;
                    border: 2px solid #10b981 !important;
                    box-shadow: 0 15px 35px -5px rgba(16, 185, 129, 0.25), 0 5px 15px -3px rgba(0, 0, 0, 0.08) !important;
                    border-radius: 50px !important;
                    padding: 12px 28px !important;
                    font-family: 'Prompt', sans-serif !important;
                    color: #0f172a !important;
                    font-weight: 700 !important;
                    font-size: 15px !important;
                    z-index: 99999999 !important;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    
                    /* ใช้ Hardware Acceleration ดันกล่องหลบไปทางขวาก่อน */
                    transform: translate3d(120%, 0, 0);
                    opacity: 0;
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15), opacity 0.3s ease;
                    pointer-events: none;
                }
                
                /* สเตตัสตอนสไลด์เข้ามา (สมูทมาก ไม่แว็บแน่นอน) */
                .dialysis-custom-toast.show {
                    transform: translate3d(0, 0, 0);
                    opacity: 1;
                }
            </style>

            <div class="page-header mb-4">
                <div>
                    <h2 class="page-title text-primary"><i class="fa-solid fa-copy me-2"></i> ศูนย์ค้นหาและคัดลอกข้อมูลด่วน</h2>
                    <p class="text-muted mt-1 mb-0">ค้นหาคนไข้แล้วกดปุ่มเพื่อคัดลอกข้อมูลไปใช้วาง (Paste) ในโปรแกรม สปสช. หรือระบบอื่นๆ ได้ทันที</p>
                </div>
            </div>

            <div class="modern-panel mb-4 p-4" style="border-top: 4px solid var(--primary); background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); border-radius: 20px;">
                <div style="position: absolute; top: -30px; right: -30px; opacity: 0.03; font-size: 200px; pointer-events: none;"><i class="fa-solid fa-magnifying-glass"></i></div>
                
                <div class="row align-items-center g-4 position-relative z-1">
                    <div class="col-md-9">
                        <label class="form-label fw-bold text-primary mb-2" style="font-size: 15px;"><i class="fa-solid fa-keyboard me-2"></i>พิมพ์คำค้นหา (ชื่อ, นามสกุล, HN, หรือ เลข ปชช.)</label>
                        <div class="search-box-modern w-100 shadow-sm bg-white" style="border-radius: 14px; overflow: hidden;">
                            <i class="fa-solid fa-magnifying-glass text-primary ms-2 me-2"></i>
                            <input type="text" id="scMainSearch" class="border-0 bg-transparent w-100 fw-bold text-dark py-2" placeholder="ตัวอย่าง: สมชาย, 11005xxxxxxxx, HN-69xxxx" style="outline: none; font-size: 16px;">
                        </div>
                    </div>
                    <div class="col-md-3 text-md-end mt-md-5">
                        <span class="badge bg-white text-primary border border-primary-subtle p-3 rounded-pill shadow-sm" id="sc-total-count" style="font-size: 14px;">
                            <i class="fas fa-spinner fa-spin me-2"></i> กำลังซิงค์ Cloud...
                        </span>
                    </div>
                </div>
            </div>

            <div id="search-results-area" class="row g-4">
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

    // 🚀 Lifecycle: Mount
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

    // 🧹 Lifecycle: Unmount
    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        console.log("🧹 [Search Copy] Cleaned up listeners.");
    }

    // ---------------------------------------------------------
    // 🔍 Search Engine
    // ---------------------------------------------------------
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
            // 🔒 Security Sanitization
            const safeNameTh = this.#escapeHTML(p.name_th);
            const safeTitle = this.#escapeHTML(p.title || '');
            const safeHn = this.#escapeHTML(p.hn || '-');
            const cleanIdCard = (p.idcard || "").replace(/-/g, "");
            
            let imgSrc = p.photo_base64 ? (p.photo_base64.startsWith('data:image') ? p.photo_base64 : 'data:image/jpeg;base64,' + p.photo_base64) : 'https://ui-avatars.com/api/?name='+ encodeURIComponent(safeNameTh||'X') +'&background=f1f5f9&color=64748b&bold=true';

            // 🚨 THE FIX: เพิ่มปุ่ม "เปิดแฟ้มประวัติ (EMR)" สีฟ้า ต่อท้ายสุด 🚨
            html += `
            <div class="col-md-6 col-xl-4 fade-in-up">
                <div class="modern-panel card-hover-float h-100 p-4 shadow-sm" style="border-radius: 20px;">
                    <div class="d-flex align-items-center mb-4 border-bottom pb-3">
                        <img src="${imgSrc}" class="rounded-circle me-3 shadow-sm border border-2 border-white" style="width: 70px; height: 70px; object-fit: cover;">
                        <div class="min-w-0">
                            <h5 class="fw-bold mb-1 text-dark text-truncate" style="font-family:'Prompt';">${safeTitle}${safeNameTh}</h5>
                            <span class="badge bg-primary fw-bold px-3 py-1 shadow-sm rounded-pill"><i class="fa-solid fa-hospital-user me-1"></i> ${safeHn}</span>
                        </div>
                    </div>

                    <div class="d-flex flex-column">
                        <div class="copy-btn-group" style="background: var(--info-light); border: 1px solid #bae6fd;">
                            <span class="copy-label"><i class="fa-solid fa-id-card text-info me-2"></i>เลข ปชช.</span>
                            <button class="btn btn-sm btn-light fw-bold text-info-dark shadow-sm rounded-pill px-4 text-truncate" style="border: 1px solid #7dd3fc; max-width: 170px;" onclick="SearchCopyPage.copyText('${cleanIdCard}', this, 'เลขบัตรประชาชน')">
                                ${cleanIdCard || '-'} <i class="fa-regular fa-copy ms-1"></i>
                            </button>
                        </div>

                        <div class="copy-btn-group" style="background: var(--success-light); border: 1px solid #bbf7d0;">
                            <span class="copy-label"><i class="fa-solid fa-qrcode text-success me-2"></i>รหัส HN</span>
                            <button class="btn btn-sm btn-light fw-bold text-success-dark shadow-sm rounded-pill px-4 text-truncate" style="border: 1px solid #86efac; max-width: 170px;" onclick="SearchCopyPage.copyText('${safeHn}', this, 'รหัส HN')">
                                ${safeHn} <i class="fa-regular fa-copy ms-1"></i>
                            </button>
                        </div>

                        <div class="copy-btn-group" style="background: var(--warning-light); border: 1px solid #fde68a;">
                            <span class="copy-label"><i class="fa-solid fa-user-tag text-warning-dark me-2"></i>ชื่อ-สกุล</span>
                            <button class="btn btn-sm btn-light fw-bold text-warning-dark shadow-sm rounded-pill px-4 text-truncate" style="border: 1px solid #fde047; max-width: 170px;" onclick="SearchCopyPage.copyText('${safeNameTh}', this, 'ชื่อ-นามสกุล')">
                                ${safeNameTh || '-'} <i class="fa-regular fa-copy ms-1"></i>
                            </button>
                        </div>
                        
                        <button class="btn btn-primary fw-bold shadow-sm rounded-pill mt-3 w-100" onclick="App.switchPage('patient_history', null, '${safeHn}')">
                            <i class="fa-solid fa-folder-open me-2"></i> เปิดแฟ้มประวัติ (EMR)
                        </button>
                    </div>
                </div>
            </div>`;
        });
        resultsArea.innerHTML = html;
    }

    // ---------------------------------------------------------
    // 🌟 Notification & Clipboard
    // ---------------------------------------------------------
    showNativeToast(message) {
        const toast = document.getElementById('dialysisPoaster');
        const toastText = document.getElementById('dialysisPoasterText');
        if(!toast || !toastText) return;

        toastText.innerText = message;
        toast.classList.add('show');

        // สั่งเคลียร์กล่องออกไปด่วนๆ เมื่อครบเวลา 1.5 วินาที
        setTimeout(() => {
            toast.classList.remove('show');
        }, 1500);
    }

    copyText(text, btnElement, fieldName) {
        if (!text || text === "-" || text === "undefined") {
            Swal.fire({ title: 'ไม่มีข้อมูล', text: 'ช่องนี้ว่างเปล่า', icon: 'warning', timer: 1200, showConfirmButton: false });
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            const originalHTML = btnElement.innerHTML;
            const originalClass = btnElement.className;
            const originalWidth = btnElement.offsetWidth; 

            btnElement.style.width = originalWidth + 'px';
            btnElement.className = "btn btn-sm btn-success text-white fw-bold shadow-sm rounded-pill d-inline-flex justify-content-center align-items-center";
            btnElement.innerHTML = `<i class="fa-solid fa-check me-1"></i> สำเร็จ`;
            
            // 🔥 เรียกใช้งานกล่องลอยตัว Native ตัวใหม่ ลื่นหัวแตกแน่นอน
            this.showNativeToast(`คัดลอก ${fieldName} สำเร็จแล้ว`);

            setTimeout(() => {
                btnElement.style.width = ''; 
                btnElement.className = originalClass;
                btnElement.innerHTML = originalHTML;
            }, 1500);
        }).catch(err => {
            Swal.fire('ข้อผิดพลาด', 'บราวเซอร์ไม่อนุญาตการเข้าถึง Clipboard', 'error');
        });
    }

    // 🛡️ Helpers
    #escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
}

// 🌐 Expose Component สู่ระบบ Router
const SearchCopyPage = new SearchCopyPageComponent();
window.SearchCopyPage = SearchCopyPage;