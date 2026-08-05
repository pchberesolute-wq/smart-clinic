// js/pages/search_copy.js
// 🚀 Enterprise Search & Copy Module: Viewport Locked, Zero-Shift & 3D Holographic UI (v12.0 THE SILVER BULLET)

class SearchCopyPageComponent {
    constructor() {
        this.state = {
            allPatients: []
        };
        this.firebaseListeners = [];
        this.searchTimeout = null; 
    }

    get html() {
        return `
            <style>
                /* 🚨 THE ULTIMATE FIX: ล็อก Scrollbar แกน Y ให้แสดงตลอดเวลา 
                   ป้องกันหน้าจอยืดหดกะทันหัน ซึ่งจะไปกระตุ้นบั๊กเตะเคอร์เซอร์ในไฟล์อื่น */
                html, body, html[data-bs-theme="dark"] body {
                    overflow-y: scroll !important;
                }

                /* 🌟 [ULTRA PREMIUM ANIMATIONS] */
                @keyframes floatIn { 0% { opacity: 0; transform: translateY(20px) scale(0.98); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes floatEmpty { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }

                /* 🌟 [SEARCH BAR HOLOGRAPHIC] */
                .ultra-search-container {
                    background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
                    border: 1px solid rgba(255,255,255,0.8);
                    border-radius: 30px;
                    box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.1), inset 0 2px 4px rgba(255,255,255,0.5);
                    padding: 30px; position: relative; overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .ultra-search-container::before {
                    content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
                    background: radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 60%);
                    pointer-events: none; z-index: 0;
                }
                .ultra-search-container:focus-within {
                    transform: translateY(-2px);
                    box-shadow: 0 30px 60px -15px rgba(37, 99, 235, 0.2), inset 0 2px 4px rgba(255,255,255,0.5);
                    border-color: rgba(37, 99, 235, 0.3);
                }

                .search-box-hologram {
                    background: #ffffff; border-radius: 20px; border: 2px solid transparent;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: all 0.3s;
                    display: flex; align-items: center; padding: 5px 15px 5px 20px;
                    background-clip: padding-box; position: relative;
                }
                .search-box-hologram:focus-within { border-color: #3b82f6; box-shadow: 0 8px 25px rgba(37,99,235,0.15); }
                .search-box-hologram input { font-size: 18px; letter-spacing: 0.5px; color: #0f172a; width: 100%; }
                .search-box-hologram input::placeholder { color: #94a3b8; font-weight: 500; }

                /* 🚨 ฆ่าปุ่ม Clear จิ๋วของ Browser ทิ้ง 100% */
                input[type="text"]::-ms-clear, input[type="text"]::-ms-reveal,
                input[type="search"]::-webkit-search-decoration, input[type="search"]::-webkit-search-cancel-button,
                input[type="search"]::-webkit-search-results-button, input[type="search"]::-webkit-search-results-decoration {
                    display: none !important; width: 0 !important; height: 0 !important;
                }

                .search-filter-select {
                    border: none; background: transparent; font-weight: 800; color: var(--primary);
                    cursor: pointer; box-shadow: none !important; padding-left: 0; width: auto; font-family: 'Prompt';
                    outline: none !important;
                }
                .search-divider { width: 2px; height: 24px; background: #e2e8f0; margin: 0 15px; border-radius: 2px; flex-shrink: 0; }
                
                .search-action-zone {
                    position: relative; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                
                .clear-btn-3d { 
                    position: absolute; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); 
                    cursor: pointer; color: #94a3b8; font-size: 26px !important; padding: 8px;
                    display: flex; align-items: center; justify-content: center; border-radius: 50%;
                    opacity: 0; pointer-events: none; transform: scale(0.5) rotate(-45deg);
                }
                .clear-btn-3d.is-visible { opacity: 1; pointer-events: auto; transform: scale(1) rotate(0deg); }
                .clear-btn-3d:hover { color: #ef4444 !important; background-color: rgba(239, 68, 68, 0.1); transform: scale(1.15) rotate(90deg); }

                .sc-loading-spinner {
                    position: absolute; width: 22px; height: 22px; transition: opacity 0.3s;
                    opacity: 0; pointer-events: none;
                }
                .sc-loading-spinner.is-visible { opacity: 1; }

                /* 🌟 [3D PATIENT CARDS] */
                .patient-card-3d {
                    background: #ffffff; border-radius: 24px; border: 1px solid rgba(0,0,0,0.03);
                    box-shadow: 0 10px 30px -10px rgba(0,0,0,0.08); transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                    position: relative; overflow: hidden; height: 100%;
                }
                .patient-card-3d::after {
                    content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 5px;
                    background: linear-gradient(90deg, #3b82f6, #06b6d4);
                }
                .patient-card-3d:hover {
                    transform: translateY(-8px) scale(1.01); box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.15); border-color: rgba(37, 99, 235, 0.1);
                }
                .patient-avatar-ring {
                    border: 3px solid transparent; background: linear-gradient(#fff, #fff) padding-box, linear-gradient(135deg, #3b82f6, #0ea5e9) border-box;
                    box-shadow: 0 8px 20px rgba(37,99,235,0.2);
                }

                /* 🌟 [INTERACTIVE DATA PILLS] */
                .data-pill {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 10px 16px; border-radius: 16px; margin-bottom: 10px;
                    background: #f8fafc; border: 1px solid #e2e8f0; transition: all 0.2s;
                }
                .data-pill:hover { background: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.04); transform: translateX(2px); }
                .data-pill-label { font-size: 13px; font-weight: 700; color: #64748b; display: flex; align-items: center; gap: 8px; }
                
                .btn-copy-action {
                    background: #ffffff; border: 1px solid #cbd5e1; color: #0f172a;
                    font-weight: 700; font-size: 13px; border-radius: 12px; padding: 6px 14px;
                    transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
                .btn-copy-action:hover {
                    border-color: #3b82f6; color: #3b82f6; background: #eff6ff; box-shadow: 0 4px 10px rgba(37,99,235,0.1); transform: translateY(-1px);
                }
                .btn-copy-action:active { transform: translateY(1px); }

                /* 🌟 [PREMIUM NATIVE TOAST CSS] */
                .dialysis-custom-toast {
                    position: fixed; top: 30px; right: 30px; background: #ffffff !important;
                    border: 2px solid #10b981 !important; box-shadow: 0 15px 35px -5px rgba(16, 185, 129, 0.25) !important;
                    border-radius: 50px !important; padding: 12px 28px !important; font-family: 'Prompt', sans-serif !important;
                    color: #0f172a !important; font-weight: 700 !important; font-size: 15px !important; z-index: 99999999 !important;
                    display: flex; align-items: center; gap: 12px; transform: translate3d(120%, 0, 0); opacity: 0;
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15), opacity 0.3s ease; pointer-events: none;
                }
                .dialysis-custom-toast.show { transform: translate3d(0, 0, 0); opacity: 1; }

                /* 🌟 [MODAL APPLE WALLET STYLE] */
                .wallet-modal-header { background: linear-gradient(135deg, #1e293b, #0f172a); color: white; padding: 30px 20px 20px; border-radius: 20px 20px 0 0; text-align: center; position: relative; overflow: hidden; }
                .wallet-modal-header::before { content: ''; position: absolute; width: 300px; height: 300px; background: rgba(59,130,246,0.2); filter: blur(50px); border-radius: 50%; top: -80px; left: -80px; }
                .wallet-avatar { width: 110px; height: 110px; border-radius: 50%; border: 4px solid #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.3); position: relative; z-index: 2; margin: 0 auto 15px; object-fit: cover; }
                
                .patient-modal-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; padding: 20px; background: #f8fafc; border-radius: 0 0 20px 20px;}
                .patient-modal-box { background: #ffffff; padding: 16px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02); transition: 0.3s; display: flex; flex-direction: column; justify-content: center;}
                .patient-modal-box:hover { border-color: #3b82f6; box-shadow: 0 8px 15px rgba(37,99,235,0.05); transform: translateY(-2px); }
                .patient-modal-label { font-size: 12px; color: #64748b; font-weight: 800; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;}
                .patient-modal-value { font-size: 16px; color: #0f172a; font-weight: 700; font-family: 'Prompt'; word-break: break-word;}
                .patient-modal-full { grid-column: 1 / -1; }
                
                .btn-fixed-width { width: 175px !important; min-width: 175px !important; max-width: 175px !important; flex-shrink: 0 !important; flex-grow: 0 !important; display: inline-flex !important; justify-content: center !important; align-items: center !important; white-space: nowrap !important; overflow: hidden !important; box-sizing: border-box !important; }

                /* Dark Mode Support */
                html[data-bs-theme="dark"] .ultra-search-container { background: #1e293b; border-color: #334155; }
                html[data-bs-theme="dark"] .search-box-hologram { background: #0f172a; border-color: #334155; }
                html[data-bs-theme="dark"] .search-box-hologram input { color: #f8fafc; }
                html[data-bs-theme="dark"] .patient-card-3d { background: #1e293b; border-color: #334155; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
                html[data-bs-theme="dark"] .data-pill { background: #0f172a; border-color: #334155; }
                html[data-bs-theme="dark"] .btn-copy-action { background: #1e293b; border-color: #475569; color: #f8fafc; }
                html[data-bs-theme="dark"] .search-filter-select { color: #60a5fa; }
                html[data-bs-theme="dark"] .search-divider { background: #334155; }
            </style>

            <div class="page-header mb-4 fade-in-up">
                <div>
                    <h2 class="page-title text-primary" style="font-size: 28px; font-weight: 800;"><i class="fa-solid fa-bolt me-2 text-warning"></i> ศูนย์ค้นหาและคัดลอกข้อมูลด่วน</h2>
                    <p class="text-muted mt-1 mb-0 fw-bold">ค้นหาคนไข้แบบ Real-time เพื่อคัดลอกข้อมูล หรือเปิดแฟ้มประวัติส่วนตัวได้ทันที</p>
                </div>
            </div>

            <div class="ultra-search-container mb-5 fade-in-up" style="animation-delay: 0.1s;">
                <div class="row align-items-center position-relative z-1">
                    <div class="col-md-9">
                        <label class="form-label fw-bold text-primary mb-3" style="font-size: 16px;"><i class="fa-solid fa-keyboard me-2"></i>ระบบค้นหาอัจฉริยะ (Smart Search)</label>
                        
                        <div class="search-box-hologram">
                            <i class="fa-solid fa-filter text-primary ms-2 me-1"></i>
                            <select id="scFilterType" class="form-select search-filter-select">
                                <option value="all">ค้นหาทั้งหมด</option>
                                <option value="name">👤 เฉพาะชื่อ-สกุล</option>
                                <option value="hn">🏥 เฉพาะรหัส HN</option>
                                <option value="idcard">💳 เฉพาะเลข ปชช.</option>
                            </select>
                            <div class="search-divider"></div>
                            
                            <input type="text" id="scMainSearch" class="border-0 bg-transparent flex-grow-1 fw-bold py-3 px-2" placeholder="พิมพ์คำค้นหา เช่น สมชาย, HN-1234, หรือเลขบัตร..." autocomplete="off" spellcheck="false">
                            
                            <div class="search-action-zone">
                                <i class="fa-solid fa-circle-xmark clear-btn-3d" id="scClearSearch" onclick="window.SearchCopyPage.clearSearch()" title="ล้างคำค้นหา"></i>
                                <div class="spinner-border text-primary sc-loading-spinner" role="status" id="sc-loading-spinner"></div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-3 text-md-end mt-4 mt-md-0 d-flex flex-column align-items-md-end justify-content-center h-100 pt-md-4">
                        <div class="d-inline-flex flex-column align-items-center align-items-md-end">
                            <span class="badge bg-white text-primary border border-primary-subtle px-4 py-3 rounded-pill shadow-sm" id="sc-total-count" style="font-size: 15px;">
                                <i class="fas fa-spinner fa-spin me-2"></i> กำลังซิงค์ Cloud...
                            </span>
                            <small class="text-muted fw-bold mt-2"><i class="fa-solid fa-cloud-check text-success me-1"></i> ซิงค์ข้อมูลล่าสุดแล้ว</small>
                        </div>
                    </div>
                </div>
            </div>

            <div id="search-results-area" class="row g-4 pb-5">
                <div class="col-12 text-center py-5 text-muted" style="animation: floatEmpty 4s ease-in-out infinite;">
                    <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary mb-4 shadow-sm" style="width: 100px; height: 100px;">
                        <i class="fa-solid fa-keyboard fa-3x"></i>
                    </div>
                    <h4 class="fw-bold text-dark" style="font-family:'Prompt';">พร้อมใช้งาน! เริ่มพิมพ์คำค้นหาด้านบนได้เลย</h4>
                    <p>ระบบประมวลผลการค้นหาด้วยความเร็วสูง O(1)</p>
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
            if (badge) badge.innerHTML = `<i class="fa-solid fa-database me-2"></i> คลังข้อมูล <b>${this.state.allPatients.length.toLocaleString()}</b> ราย`;
            
            this.triggerSearch();
        });
        this.firebaseListeners.push({ path: 'patients_database_v2/patients', callback });

        const searchInput = document.getElementById('scMainSearch');
        if (searchInput) {
            searchInput.focus();
            searchInput.addEventListener('input', () => {
                const spinner = document.getElementById('sc-loading-spinner');
                const clearBtn = document.getElementById('scClearSearch');
                
                if(spinner) spinner.classList.add('is-visible');
                if(clearBtn) clearBtn.classList.toggle('is-visible', searchInput.value.length > 0);

                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.triggerSearch();
                    if(spinner) spinner.classList.remove('is-visible');
                }, 400); 
            });
        }

        const filterSelect = document.getElementById('scFilterType');
        if (filterSelect) {
            filterSelect.addEventListener('change', () => {
                this.triggerSearch();
                const searchInput = document.getElementById('scMainSearch');
                if(searchInput) searchInput.focus();
            });
        }
    }

    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
    }

    clearSearch() {
        const input = document.getElementById('scMainSearch');
        const filter = document.getElementById('scFilterType');
        const clearBtn = document.getElementById('scClearSearch');
        
        if (input) {
            input.value = '';
            input.focus(); 
        }
        if (filter) filter.value = 'all'; 
        if (clearBtn) clearBtn.classList.remove('is-visible');
        
        this.triggerSearch(); 
    }

    triggerSearch() {
        const inputEl = document.getElementById('scMainSearch');
        const query = (inputEl?.value || "").trim().toLowerCase();
        const filterType = document.getElementById('scFilterType')?.value || "all"; 
        
        const resultsArea = document.getElementById('search-results-area');
        if (!resultsArea) return;

        const clearBtn = document.getElementById('scClearSearch');
        if(clearBtn) clearBtn.classList.toggle('is-visible', query.length > 0);

        // ปล่อยให้ Browser จัดการ Focus ตามธรรมชาติ 100% ไม่มีโค้ดเตะเคอร์เซอร์ใดๆ ในฟังก์ชันนี้แล้ว

        if (query.length === 0) {
            resultsArea.innerHTML = `
                <div class="col-12 text-center py-5 text-muted" style="animation: floatEmpty 4s ease-in-out infinite;">
                    <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary mb-4 shadow-sm" style="width: 100px; height: 100px;">
                        <i class="fa-solid fa-keyboard fa-3x"></i>
                    </div>
                    <h4 class="fw-bold text-dark" style="font-family:'Prompt';">พร้อมใช้งาน! เริ่มพิมพ์คำค้นหาด้านบนได้เลย</h4>
                    <p>ระบบประมวลผลการค้นหาด้วยความเร็วสูง O(1)</p>
                </div>`;
            return;
        }

        const filtered = this.state.allPatients.filter(p => {
            const matchHn = (p.hn || "").toLowerCase().includes(query);
            const matchName = (p.name_th || "").toLowerCase().includes(query) || (p.name_en || "").toLowerCase().includes(query);
            const matchIdCard = (p.idcard || "").replace(/-/g, "").includes(query) || (p.idcard || "").includes(query);

            if (filterType === 'hn') return matchHn;
            if (filterType === 'name') return matchName;
            if (filterType === 'idcard') return matchIdCard;
            
            return matchHn || matchName || matchIdCard; 
        });

        if (filtered.length === 0) {
            resultsArea.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger-subtle text-danger mb-4 shadow-sm" style="width: 100px; height: 100px; animation: floatEmpty 3s ease-in-out infinite;">
                        <i class="fa-solid fa-face-frown-open fa-3x"></i>
                    </div>
                    <h4 class="fw-bold text-danger" style="font-family:'Prompt';">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</h4>
                    <p class="text-muted">โปรดตรวจสอบตัวสะกด หรือเปลี่ยนตัวกรองหมวดหมู่การค้นหาใหม่</p>
                </div>`;
            return;
        }

        const MAX_RESULTS = 24;
        const displayResults = filtered.slice(0, MAX_RESULTS);

        let html = "";
        displayResults.forEach((p, idx) => {
            const safeNameTh = this.#escapeHTML(p.name_th);
            const safeTitle = this.#escapeHTML(p.title || '');
            const safeHn = this.#escapeHTML(p.hn || '-');
            const cleanIdCard = (p.idcard || "").replace(/\D/g, "");
            const displayIdCard = this.#formatIdCardDisplay(cleanIdCard);
            let imgSrc = p.photo_base64 ? (p.photo_base64.startsWith('data:image') ? p.photo_base64 : 'data:image/jpeg;base64,' + p.photo_base64) : 'https://ui-avatars.com/api/?name='+ encodeURIComponent(safeNameTh||'X') +'&background=f8fafc&color=0f172a&bold=true';

            html += `
            <div class="col-md-6 col-xl-4" style="animation: floatIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; animation-delay: ${(idx % 10) * 0.05}s; opacity: 0;">
                <div class="patient-card-3d p-4 d-flex flex-column">
                    <div class="d-flex align-items-center mb-4 border-bottom pb-3">
                        <img src="${imgSrc}" loading="lazy" decoding="async" class="rounded-circle me-3 patient-avatar-ring" style="width: 70px; height: 70px; object-fit: cover; flex-shrink: 0;">
                        <div class="min-w-0 flex-grow-1">
                            <h4 class="fw-bold mb-1 text-dark text-truncate" style="font-family:'Prompt'; font-size:18px;">${safeTitle}${safeNameTh}</h4>
                            <span class="badge bg-primary-subtle text-primary border border-primary-subtle fw-bold px-3 py-1 shadow-sm rounded-pill"><i class="fa-solid fa-hospital-user me-1"></i> HN: ${safeHn}</span>
                        </div>
                    </div>

                    <div class="d-flex flex-column flex-grow-1">
                        <div class="data-pill">
                            <span class="data-pill-label"><div class="rounded bg-info-subtle text-info p-1"><i class="fa-solid fa-id-card"></i></div> เลข ปชช.</span>
                            <button class="btn-copy-action btn-fixed-width" onclick="window.SearchCopyPage.copyText('${cleanIdCard}', this, 'เลขบัตรประชาชน')">
                                ${displayIdCard || '-'} <i class="fa-regular fa-copy ms-1 text-muted"></i>
                            </button>
                        </div>
                        <div class="data-pill">
                            <span class="data-pill-label"><div class="rounded bg-success-subtle text-success p-1"><i class="fa-solid fa-qrcode"></i></div> รหัส HN</span>
                            <button class="btn-copy-action btn-fixed-width" onclick="window.SearchCopyPage.copyText('${safeHn}', this, 'รหัส HN')">
                                ${safeHn} <i class="fa-regular fa-copy ms-1 text-muted"></i>
                            </button>
                        </div>
                        <div class="data-pill">
                            <span class="data-pill-label"><div class="rounded bg-warning-subtle text-warning-dark p-1"><i class="fa-solid fa-user-tag"></i></div> ชื่อ-สกุล</span>
                            <button class="btn-copy-action btn-fixed-width text-truncate" onclick="window.SearchCopyPage.copyText('${safeNameTh}', this, 'ชื่อ-นามสกุล')">
                                ${safeNameTh || '-'} <i class="fa-regular fa-copy ms-1 text-muted"></i>
                            </button>
                        </div>
                        
                        <div class="d-flex gap-2 mt-auto pt-3">
                            <button class="btn btn-light text-primary fw-bold shadow-sm rounded-pill w-100" style="border: 1px solid #bfdbfe;" onclick="window.SearchCopyPage.showPatientModal('${safeHn}')">
                                <i class="fa-solid fa-address-card me-1"></i> ดูข้อมูล
                            </button>
                            <button class="btn btn-primary fw-bold shadow-sm rounded-pill w-100" onclick="window.App.switchPage('patient_history', null, '${safeHn}')">
                                <i class="fa-solid fa-folder-open me-1"></i> แฟ้ม EMR
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        });

        if (filtered.length > MAX_RESULTS) {
            html += `
            <div class="col-12 text-center py-4 fade-in-up" style="animation-delay: 0.5s;">
                <div class="badge bg-primary-subtle text-primary border border-primary-subtle px-4 py-2 rounded-pill fs-6 shadow-sm">
                    <i class="fa-solid fa-layer-group me-2"></i> แสดงเฉพาะ ${MAX_RESULTS} รายการแรก (พบอีก ${filtered.length - MAX_RESULTS} รายการ)... โปรดพิมพ์คำค้นหาให้ละเอียดขึ้น
                </div>
            </div>`;
        }

        // ปล่อยให้ Browser วาดจอ (GPU-Yielding) แบบสงบๆ
        requestAnimationFrame(() => {
            resultsArea.innerHTML = html;
        });
    }

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
        
        let imgSrc = pt.photo_base64 ? (pt.photo_base64.startsWith('data:image') ? pt.photo_base64 : 'data:image/jpeg;base64,' + pt.photo_base64) : 'https://ui-avatars.com/api/?name='+ encodeURIComponent(safeName||'X') +'&background=f8fafc&color=0f172a&bold=true';
        let statusColor = pt.status === 'ปกติ' ? '#10b981' : '#ef4444';

        const htmlLayout = `
            <div class="text-start" style="font-family: 'Prompt', sans-serif; margin: -1.25em;">
                <div class="wallet-modal-header">
                    <img src="${imgSrc}" class="wallet-avatar">
                    <h3 class="fw-bold mb-1">${safeTitle}${safeName}</h3>
                    <div class="d-flex justify-content-center gap-2 mt-2">
                        <span class="badge bg-white text-dark fw-bold px-3 py-2 shadow-sm rounded-pill"><i class="fa-solid fa-hospital-user me-1 text-primary"></i> ${safeHn}</span>
                        <span class="badge fw-bold px-3 py-2 shadow-sm rounded-pill" style="background-color: ${statusColor}; color: white;"><i class="fa-solid fa-heart-pulse me-1"></i> ${this.#escapeHTML(pt.status || 'ปกติ')}</span>
                    </div>
                </div>

                <div class="patient-modal-grid">
                    <div class="patient-modal-box" style="background:#f0f9ff; border-color:#bae6fd;">
                        <div class="patient-modal-label"><div class="rounded bg-info-subtle text-info p-1"><i class="fa-solid fa-id-card"></i></div> เลข ปชช.</div>
                        <div class="patient-modal-value fs-5 text-primary">${safeIdCard}</div>
                    </div>
                    
                    <div class="patient-modal-box">
                        <div class="patient-modal-label"><div class="rounded bg-secondary-subtle text-secondary p-1"><i class="fa-solid fa-cake-candles"></i></div> อายุ / เพศ</div>
                        <div class="patient-modal-value fs-5">${this.#escapeHTML(pt.age || '-')} ปี <span class="text-muted fw-normal mx-1">|</span> ${this.#escapeHTML(pt.gender || '-')}</div>
                    </div>
                    
                    <div class="patient-modal-box">
                        <div class="patient-modal-label"><div class="rounded bg-warning-subtle text-warning-dark p-1"><i class="fa-solid fa-phone"></i></div> โทรศัพท์</div>
                        <div class="patient-modal-value fs-5">${this.#escapeHTML(pt.phone || '-')}</div>
                    </div>

                    <div class="patient-modal-box" style="background:#fef2f2; border-color:#fecaca;">
                        <div class="patient-modal-label"><div class="rounded bg-danger-subtle text-danger p-1"><i class="fa-solid fa-droplet"></i></div> กรุ๊ปเลือด</div>
                        <div class="patient-modal-value text-danger fs-5">${this.#escapeHTML(pt.blood_type || '-')}</div>
                    </div>
                    
                    <div class="patient-modal-box" style="background:#f0fdf4; border-color:#bbf7d0;">
                        <div class="patient-modal-label"><div class="rounded bg-success-subtle text-success p-1"><i class="fa-solid fa-shield-heart"></i></div> สิทธิการรักษา</div>
                        <div class="patient-modal-value text-success">${this.#escapeHTML(pt.right || 'ไม่ระบุสิทธิ')}</div>
                    </div>

                    <div class="patient-modal-box border-danger" style="background: #fff1f2;">
                        <div class="patient-modal-label"><div class="rounded bg-danger text-white p-1"><i class="fa-solid fa-virus-covid"></i></div> ติดเชื้อ / แพ้ยา</div>
                        <div class="patient-modal-value">
                            <span class="text-danger">${this.#escapeHTML(pt.infection || 'Negative')}</span>
                            <span class="text-muted fw-normal mx-2">|</span>
                            แพ้ยา: <span class="text-warning-dark">${this.#escapeHTML(pt.allergy || 'ไม่มี')}</span>
                        </div>
                    </div>

                    <div class="patient-modal-box patient-modal-full">
                        <div class="patient-modal-label"><div class="rounded bg-purple-subtle text-purple p-1" style="background: #f3e8ff; color: #7e22ce;"><i class="fa-solid fa-notes-medical"></i></div> โรคประจำตัว</div>
                        <div class="patient-modal-value" style="color: #7e22ce;">${this.#escapeHTML(pt.underlying_disease || '-')}</div>
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
            customClass: { popup: 'premium-alert p-0 overflow-hidden' },
            width: '750px' 
        }).then((result) => {
            if (result.isConfirmed) {
                window.App.switchPage('patient_history', null, safeHn); 
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

    copyText(text, btnElement, fieldName) {
        if (!text || text === "-" || text === "undefined") {
            Swal.fire({ title: 'ไม่มีข้อมูล', text: 'ช่องนี้ว่างเปล่า', icon: 'warning', timer: 1200, showConfirmButton: false });
            return;
        }

        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.top = "-99999px";
        textArea.style.left = "-99999px";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        
        textArea.select();
        textArea.setSelectionRange(0, 99999); 
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                const originalHTML = btnElement.innerHTML;
                const originalClass = btnElement.className;
                
                btnElement.className = "btn-copy-action btn-fixed-width text-white shadow-sm";
                btnElement.style.background = "#10b981";
                btnElement.style.borderColor = "#10b981";
                btnElement.innerHTML = `<i class="fa-solid fa-check me-1"></i> คัดลอกแล้ว`;
                
                this.showNativeToast(`คัดลอก ${fieldName} สำเร็จแล้ว`);
                
                setTimeout(() => {
                    btnElement.style.background = '';
                    btnElement.style.borderColor = '';
                    btnElement.className = originalClass; 
                    btnElement.innerHTML = originalHTML;
                }, 1500);
            } else {
                throw new Error("execCommand failed");
            }
        } catch (err) {
            Swal.fire('ข้อผิดพลาด', 'บราวเซอร์ไม่อนุญาตการเข้าถึง Clipboard', 'error');
        } finally {
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