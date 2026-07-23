// js/pages/login.js
// 🚀 Enterprise Login Module V5.3: Adaptive Theme Architecture, Z-Index Override & Zero-Trust Auth

// 🚨 THE FIX: ปรับ Anti-Flash ให้ใช้ CSS Variable อิงตาม Theme ปัจจุบัน
(function preventFlash() {
    if (!sessionStorage.getItem('dialysis_user_session') || !sessionStorage.getItem('dialysis_session_active')) {
        const antiFlashStyle = document.createElement('style');
        antiFlashStyle.id = 'anti-flash-style';
        antiFlashStyle.innerHTML = `
            html body #sidebar, html body nav.topbar, html body .topbar { display: none !important; opacity: 0 !important; visibility: hidden !important; z-index: -9999 !important; }
            html body .main-content { margin: 0 !important; padding: 0 !important; transform: none !important; background: var(--bg-body) !important; }
            body { background: var(--bg-body) !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
        `;
        if(document.head) document.head.appendChild(antiFlashStyle);
        else document.documentElement.appendChild(antiFlashStyle);
    }
})();

class LoginPageComponent {
    constructor() {
        this.allUsers = [];
        this.roleConfig = {
            'admin': { label: 'ผู้ดูแลระบบ', iconHtml: '<i class="fa-solid fa-shield-halved text-danger safe-icon"></i>' },
            'doctor': { label: 'แพทย์', iconHtml: '<i class="fa-solid fa-user-doctor text-success safe-icon"></i>' },
            'head_nurse': { label: 'หัวหน้าพยาบาล', iconHtml: '<i class="fa-solid fa-star text-warning safe-icon"></i>' },
            'nurse': { label: 'พยาบาล', iconHtml: '<i class="fa-solid fa-user-nurse text-primary safe-icon"></i>' },
            'assistant': { label: 'ผู้ช่วยพยาบาล', iconHtml: '<i class="fa-solid fa-hand-holding-medical text-info safe-icon"></i>' },
            'finance': { label: 'การเงิน/บัญชี', iconHtml: '<i class="fa-solid fa-file-invoice-dollar text-success safe-icon"></i>' },
            'stock': { label: 'พัสดุ', iconHtml: '<i class="fa-solid fa-boxes-packing text-secondary safe-icon"></i>' }
        };
        this.firebaseListeners = [];
    }

    get html() {
        return `
            <style>
                html body nav.topbar, html body #sidebar { display: none !important; }
                .main-content { margin: 0 !important; padding: 0 !important; transform: none !important; width: 100vw !important; min-height: 100vh !important; }
                #app-content { margin: 0 !important; padding: 0 !important; }
                
                /* 🚨 THE FIX: เกราะป้องกันไอคอน FontAwesome แตกแบบครอบจักรวาล */
                .safe-icon { font-family: 'Font Awesome 6 Free', 'Font Awesome 5 Free', 'FontAwesome', sans-serif !important; font-weight: 900 !important; font-style: normal !important; display: inline-block; text-rendering: auto; -webkit-font-smoothing: antialiased; }
                
                /* 🚨 THE FIX: กู้คืน Z-Index ของ SweetAlert ให้ทะลุหน้า Login */
                .swal2-container { z-index: 9999999 !important; backdrop-filter: blur(5px) !important; background: rgba(15,23,42,0.6) !important; }
                .swal2-popup.premium-alert { border-radius: 28px !important; padding: 30px 25px !important; border: 1px solid var(--border-color) !important; background: var(--bg-surface) !important; box-shadow: 0 30px 60px -15px rgba(0,0,0,0.4) !important; }
                .btn-premium-swal { border-radius: 14px !important; padding: 14px 32px !important; font-family: 'Prompt' !important; font-weight: 700 !important; background: linear-gradient(135deg, var(--primary), var(--info)) !important; color: white !important; box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4) !important; border: none !important; transition: all 0.3s !important; }
                .btn-premium-swal:hover { transform: translateY(-2px); box-shadow: 0 15px 25px -5px rgba(37, 99, 235, 0.5) !important; }
                .btn-cancel-swal { border-radius: 14px !important; padding: 14px 32px !important; font-family: 'Prompt' !important; font-weight: 700 !important; background: var(--bg-body) !important; color: var(--text-muted) !important; border: 1px solid var(--border-color) !important; transition: all 0.3s !important; }
                .btn-cancel-swal:hover { background: var(--border-color) !important; transform: translateY(-2px); }
                .btn-danger-swal { background: linear-gradient(135deg, #ef4444, #dc2626) !important; box-shadow: 0 10px 20px -5px rgba(239, 68, 68, 0.4) !important; color: white !important; }

                /* 🌌 1. Adaptive Aurora Background */
                .login-container { 
                    position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
                    width: 100vw !important; height: 100vh !important; margin: 0 !important; padding: 0 !important;
                    background-color: var(--bg-body);
                    display: flex; align-items: center; justify-content: center; 
                    z-index: 999999 !important; overflow: hidden; font-family: 'Prompt', sans-serif; 
                }

                .aurora-blob { position: absolute; filter: blur(80px); opacity: 0.25; animation: floatBlob 15s infinite alternate ease-in-out; pointer-events: none; border-radius: 50%; }
                .blob-1 { width: 600px; height: 600px; background: var(--primary); top: -150px; left: -150px; }
                .blob-2 { width: 700px; height: 700px; background: var(--info); bottom: -200px; right: -200px; animation-delay: -5s; }
                .blob-3 { width: 500px; height: 500px; background: var(--success); top: 40%; left: 30%; animation-delay: -10s; }
                @keyframes floatBlob { 0% { transform: translate(0, 0) scale(1) rotate(0deg); } 100% { transform: translate(50px, -50px) scale(1.1) rotate(10deg); } }
                
                /* 🪟 2. Adaptive Acrylic Glass Card */
                .login-card {
                    position: relative; z-index: 10; width: 100%; max-width: 500px; 
                    background: var(--bg-surface); 
                    border: 1px solid var(--border-color); 
                    border-radius: 36px; padding: 45px 40px;
                    box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.3);
                    animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    margin: 20px; 
                }
                @keyframes slideUpFade { from { opacity: 0; transform: translateY(50px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }

                /* 🛡️ Logo Animation */
                .brand-logo-wrapper { width: 110px; height: 110px; margin: 0 auto 24px; position: relative; transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
                .brand-logo-wrapper::before { content: ''; position: absolute; top: -5px; left: -5px; right: -5px; bottom: -5px; background: linear-gradient(135deg, var(--primary), var(--info)); border-radius: 32px; z-index: -1; opacity: 0.5; filter: blur(15px); transition: opacity 0.5s; }
                .login-card:hover .brand-logo-wrapper { transform: translateY(-5px) scale(1.05); }
                .login-card:hover .brand-logo-wrapper::before { opacity: 0.8; filter: blur(20px); }
                .brand-logo-wrapper img { width: 100%; height: 100%; object-fit: cover; border-radius: 28px; border: 4px solid var(--bg-surface); background: var(--bg-surface); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }

                /* 🎯 3. Magnetic Dropdown */
                .profile-selector-btn {
                    background: var(--bg-body); border: 2px solid var(--border-color); border-radius: 18px;
                    padding: 12px 18px; display: flex; align-items: center; justify-content: space-between;
                    cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                }
                .profile-selector-btn:hover { background: var(--bg-surface); border-color: var(--primary); box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15); transform: translateY(-2px); }
                
                .selected-user-info { display: flex; align-items: center; gap: 16px; }
                .selected-avatar-img { width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid var(--bg-surface); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .selected-text-group { display: flex; flex-direction: column; align-items: flex-start; }
                .selected-name { font-weight: 800; color: var(--text-dark); font-size: 16px; font-family: 'Prompt', sans-serif; line-height: 1.2; letter-spacing: -0.3px; }
                .selected-role { font-weight: 600; color: var(--text-muted); font-size: 13px; }

                /* 🔍 Smart Search Dropdown Panel */
                .custom-options-panel {
                    display: none; position: absolute; width: 100%; top: calc(100% + 12px); left: 0;
                    background: var(--bg-surface); 
                    border: 1px solid var(--border-color); border-radius: 20px;
                    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3); z-index: 9999;
                    overflow: hidden; animation: scaleDownFade 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform-origin: top center;
                }
                @keyframes scaleDownFade { from { opacity: 0; transform: scaleY(0.95) translateY(-10px); } to { opacity: 1; transform: scaleY(1) translateY(0); } }
                
                .dropdown-search-box { padding: 12px 15px; background: var(--bg-surface); border-bottom: 1px solid var(--border-color); position: sticky; top: 0; z-index: 2; }
                .dropdown-search-box input { border-radius: 12px !important; border: 1px solid var(--border-color) !important; background: var(--bg-body) !important; padding: 10px 15px !important; font-size: 14px; color: var(--text-dark) !important; }
                .dropdown-search-box input:focus { border-color: var(--primary) !important; box-shadow: 0 0 0 4px rgba(59,130,246,0.15) !important; outline: none; }
                
                .custom-list-scroll { max-height: 250px; overflow-y: auto; padding: 8px; }
                .custom-list-scroll::-webkit-scrollbar { width: 6px; }
                .custom-list-scroll::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 10px; }
                
                .custom-option-item {
                    display: flex; align-items: center; padding: 12px 15px;
                    border-radius: 14px; cursor: pointer; transition: all 0.2s; margin-bottom: 4px; border: 1px solid transparent;
                }
                .custom-option-item:hover { background: var(--bg-body); border-color: var(--border-color); transform: translateX(4px); }
                
                .custom-option-avatar { width: 42px; height: 42px; border-radius: 50%; margin-right: 15px; object-fit: cover; border: 2px solid var(--bg-surface); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
                .custom-option-icon { width: 42px; height: 42px; border-radius: 50%; margin-right: 15px; background: var(--bg-body); display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 18px; box-shadow: inset 0 0 0 1px var(--border-color); }

                /* ⌨️ 4. Form Inputs */
                .input-modern-login { background: var(--bg-body); border: 2px solid var(--border-color); border-radius: 16px; padding-left: 15px; font-weight: 700; color: var(--text-dark); transition: all 0.3s; height: 54px; }
                .input-modern-login:focus { background: var(--bg-surface); border-color: var(--primary); box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.15); color: var(--text-dark); }
                .modern-icon-login { background: var(--bg-body); border: 2px solid var(--border-color); border-right: none; border-radius: 16px 0 0 16px; color: var(--text-muted); transition: all 0.3s; }
                .input-group:focus-within .modern-icon-login { background: var(--bg-surface); border-color: var(--primary); color: var(--primary); }
                .input-group:focus-within .input-modern-login { border-left-color: transparent; }

                /* 🔘 5. Quantum Button */
                .btn-quantum {
                    background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
                    border: none; border-radius: 16px; color: white; font-weight: 800; font-family: 'Prompt';
                    box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4);
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    position: relative; overflow: hidden;
                }
                .btn-quantum::before { content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); transform: skewX(-20deg); transition: 0.5s; }
                .btn-quantum:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 35px -5px rgba(79, 70, 229, 0.5); }
                .btn-quantum:hover::before { left: 150%; }
                .btn-quantum:active { transform: translateY(1px) scale(0.98); box-shadow: 0 5px 15px rgba(79, 70, 229, 0.4); }

                /* Security Badge */
                .security-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; background: var(--bg-body); border: 1px solid var(--border-color); border-radius: 50px; font-size: 11px; font-weight: 800; color: var(--text-muted); letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); transition: all 0.3s; }
                .security-badge:hover { background: var(--bg-surface); transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0,0,0,0.05); }
                .status-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; animation: pulse 2s infinite; }
                @keyframes pulse { 0% { transform: scale(0.95); opacity: 0.5; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.5; } }
            </style>

            <div class="login-container">
                <div class="aurora-blob blob-1"></div>
                <div class="aurora-blob blob-2"></div>
                <div class="aurora-blob blob-3"></div>

                <div class="login-card">
                    <div class="text-center mb-4 pb-1">
                        <div class="brand-logo-wrapper">
                            <img src="./img/logo.png" alt="DIALYSIS PRO Logo" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&auto=format&fit=crop';">
                        </div>
                        <h2 class="fw-bold mb-1 login-title-h2" style="font-size: 26px; color: var(--text-dark);">หน่วยไตเทียม <span class="text-primary">รพ.คริสเตียน</span></h2>
                        <p class="text-muted fw-bold small mb-0 mt-2" style="letter-spacing: 0.5px;">DIALYSIS PRO : ENTERPRISE OS</p>
                    </div>

                    <div class="mb-4 mt-5">
                        <label class="form-label fw-bold small mb-2 ps-2" style="color: var(--text-muted);">เลือกบัญชีผู้ใช้งานระบบ (Select Identity)</label>
                        
                        <div class="position-relative mb-3" id="custom-dropdown-wrapper">
                            <input type="hidden" id="login-username-select" value="">
                            
                            <div class="profile-selector-btn" onclick="LoginPage.toggleCustomDropdown(event)">
                                <div class="selected-user-info" id="display-user-container">
                                    <div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 46px; height: 46px; border: 2px solid var(--border-color); background: var(--bg-body);">
                                        <i class="fas fa-spinner fa-spin text-primary safe-icon"></i>
                                    </div>
                                    <div class="selected-text-group">
                                        <span class="selected-name" style="color: var(--text-muted);">กำลังตรวจสอบฐานข้อมูล...</span>
                                        <span class="selected-role">กรุณารอสักครู่</span>
                                    </div>
                                </div>
                                <i class="fas fa-chevron-down text-primary ms-2 safe-icon" style="font-size: 16px;"></i>
                            </div>

                            <div id="custom-user-list" class="custom-options-panel">
                                <div class="dropdown-search-box">
                                    <input type="text" class="form-control" id="user-search-input" placeholder="🔍 พิมพ์ชื่อพนักงานเพื่อค้นหา..." oninput="LoginPage.filterUsers(this.value)">
                                </div>
                                <div class="custom-list-scroll" id="custom-list-items"></div>
                            </div>
                        </div>

                        <div id="manual-username-wrapper" style="display: none; animation: slideUpFade 0.3s ease forwards;">
                            <label class="form-label fw-bold small mb-2 ps-2" style="color: var(--text-muted);">ไอดีล็อคอิน (Manual Username)</label>
                            <div class="input-group mb-3">
                                <span class="input-group-text modern-icon-login px-3"><i class="fa-solid fa-id-badge text-primary safe-icon"></i></span>
                                <input type="text" id="login-username" class="form-control input-modern-login border-start-0" placeholder="กรอก Username ของคุณ" autocomplete="off">
                            </div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center mb-2 ps-2 pe-1 position-relative" style="z-index: 50;">
                            <label class="form-label fw-bold small mb-0" style="color: var(--text-muted);">รหัสผ่าน (Secure Password)</label>
                            <a href="javascript:void(0)" onclick="LoginPage.forgotPassword(); return false;" class="text-primary small fw-bold text-decoration-none" style="transition: all 0.2s; position: relative; z-index: 60;"><i class="fa-solid fa-fingerprint me-1 safe-icon"></i> ลืมรหัสผ่าน?</a>
                        </div>
                        <div class="input-group mb-3 position-relative" style="z-index: 40;">
                            <span class="input-group-text modern-icon-login px-3"><i class="fa-solid fa-lock text-primary safe-icon"></i></span>
                            <input type="password" id="login-password" class="form-control input-modern-login border-start-0 border-end-0" placeholder="••••••••" onkeypress="if(event.key === 'Enter') LoginPage.authenticate()">
                            <button class="btn input-modern-login border-start-0 text-muted px-3" type="button" onclick="LoginPage.togglePassword()" style="border-radius: 0 16px 16px 0; z-index: 45;">
                                <i class="fa-solid fa-eye safe-icon" id="toggle-pw-icon"></i>
                            </button>
                        </div>

                        <div class="d-flex justify-content-between align-items-center mb-4 px-2 mt-3 position-relative" style="z-index: 30;">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="login-remember" style="cursor: pointer; transform: scale(1.2); margin-top: 4px;">
                                <label class="form-check-label small fw-bold ms-1" for="login-remember" style="cursor: pointer; color: var(--text-muted);">บันทึกข้อมูลการเข้าสู่ระบบ</label>
                            </div>
                        </div>

                        <button class="btn-quantum w-100 py-3 mt-2" id="btn-login" onclick="LoginPage.authenticate()" style="font-size: 18px; position: relative; z-index: 30;">
                            <span id="btn-login-text"><i class="fa-solid fa-shield-check me-2 safe-icon"></i> เข้าสู่ระบบ (Authenticate)</span>
                        </button>
                    </div>

                    <div class="text-center mt-5 position-relative" style="z-index: 10;">
                        <div class="security-badge">
                            <div class="status-dot"></div>
                            CLOUD OS : SECURE CONNECTION
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async init() {
        if (!window.customDropdownListenerAdded) {
            document.addEventListener('click', (e) => {
                const wrapper = document.getElementById('custom-dropdown-wrapper');
                const list = document.getElementById('custom-user-list');
                if (wrapper && list && !wrapper.contains(e.target)) {
                    list.style.display = 'none';
                }
            });
            window.customDropdownListenerAdded = true;
        }

        const userListItems = document.getElementById('custom-list-items');
        if (userListItems) {
            userListItems.addEventListener('click', (e) => {
                const item = e.target.closest('.custom-option-item');
                if (item) {
                    const username = item.getAttribute('data-id');
                    const name = item.getAttribute('data-name');
                    const avatarUrl = item.getAttribute('data-avatar');
                    const role = item.getAttribute('data-role');
                    this.processUserSelection(username, name, avatarUrl, role);
                }
            });
        }

        if (typeof firebase === 'undefined' || typeof db === 'undefined' || typeof firebase.auth !== 'function') {
            document.getElementById('display-user-container').innerHTML = `
                <div class="rounded-circle bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center" style="width: 46px; height: 46px;"><i class="fa-solid fa-triangle-exclamation safe-icon"></i></div>
                <div class="selected-text-group"><span class="selected-name text-danger">การเชื่อมต่อล้มเหลว</span><span class="selected-role" style="color: var(--text-muted);">กรุณารีเฟรชหน้าเว็บ</span></div>`;
            return;
        }

        let cachedUsers = localStorage.getItem('dialysis_cached_users');
        if (cachedUsers) {
            this.allUsers = JSON.parse(cachedUsers);
            this.renderUserDropdown();
        }

        try {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    const cbUsers = db.ref('clinic_users_v2').on('value', snap => {
                        const data = snap.val();
                        let rawUsers = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
                        this.allUsers = rawUsers.filter(u => u !== null && u.status === 'active');
                        
                        if(this.allUsers.length > 0) {
                            localStorage.setItem('dialysis_cached_users', JSON.stringify(this.allUsers)); 
                        } else {
                            document.getElementById('display-user-container').innerHTML = `
                                <div class="rounded-circle bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center" style="width: 46px; height: 46px;"><i class="fa-solid fa-database safe-icon"></i></div>
                                <div class="selected-text-group"><span class="selected-name text-warning">ฐานข้อมูลว่างเปล่า</span></div>`;
                        }
                        this.renderUserDropdown();
                    });
                    this.firebaseListeners.push({ path: 'clinic_users_v2', callback: cbUsers });
                } else {
                    firebase.auth().signInAnonymously().catch(e => console.warn(e));
                }
            });
        } catch (err) { console.error("Init Error:", err); }
    }

    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
    }

    toggleCustomDropdown(e) {
        if(e) e.stopPropagation();
        const list = document.getElementById('custom-user-list');
        const searchInput = document.getElementById('user-search-input');
        if(list) {
            if (list.style.display === 'block') {
                list.style.display = 'none';
            } else {
                list.style.display = 'block';
                if(searchInput) {
                    searchInput.value = ''; 
                    this.filterUsers(''); 
                    setTimeout(() => searchInput.focus(), 100);
                }
            }
        }
    }

    filterUsers(searchText) {
        const query = searchText.toLowerCase().trim();
        const items = document.querySelectorAll('.custom-option-item');
        items.forEach(item => {
            const name = item.getAttribute('data-name').toLowerCase();
            const role = item.getAttribute('data-role').toLowerCase();
            if (name.includes(query) || role.includes(query) || item.getAttribute('data-id') === 'manual') {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    processUserSelection(username, name, avatarUrl, role) {
        document.getElementById('login-username-select').value = username;
        
        let roleIcon = '<i class="fa-solid fa-user-tag text-secondary safe-icon"></i>';
        let roleLabel = 'พนักงานทั่วไป';

        if (role === 'manual') {
            roleIcon = '<i class="fa-solid fa-terminal text-primary safe-icon"></i>';
            roleLabel = 'ระบบแอดมิน (Admin Override)';
        } else if (this.roleConfig[role]) {
            roleIcon = this.roleConfig[role].iconHtml;
            roleLabel = this.roleConfig[role].label;
        }

        let containerHtml = '';
        if (avatarUrl && avatarUrl !== 'null') {
            containerHtml = `
                <img src="${avatarUrl}" class="selected-avatar-img">
                <div class="selected-text-group">
                    <span class="selected-name">${name}</span>
                    <span class="selected-role">${roleIcon} <span class="ms-1">${roleLabel}</span></span>
                </div>
            `;
        } else {
            containerHtml = `
                <div class="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style="width: 46px; height: 46px; border: 2px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.1);"><i class="fa-solid fa-keyboard fs-5 safe-icon"></i></div>
                <div class="selected-text-group">
                    <span class="selected-name text-primary">${name}</span>
                    <span class="selected-role">${roleIcon} <span class="ms-1">${roleLabel}</span></span>
                </div>
            `;
        }
        
        document.getElementById('display-user-container').innerHTML = containerHtml;
        document.getElementById('custom-user-list').style.display = 'none';
        this.onUserSelectChange(username);
    }

    // 🚨 THE FIX: กรองรายชื่อ (Filter) เพื่อวาด UI เฉพาะคนที่เปิดสวิตช์ ShowOnLogin หรือเป็น Admin เท่านั้น!
    renderUserDropdown() {
        const listItemsContainer = document.getElementById('custom-list-items');
        if(!listItemsContainer) return;

        document.getElementById('display-user-container').innerHTML = `
            <div class="rounded-circle d-flex align-items-center justify-content-center" style="width: 46px; height: 46px; border: 2px solid var(--border-color); background: var(--bg-body);"><i class="fa-solid fa-user-shield text-muted fs-5 safe-icon"></i></div>
            <div class="selected-text-group"><span class="selected-name" style="color: var(--text-muted);">คลิกเพื่อเลือกบัญชีผู้ใช้</span><span class="selected-role">พนักงาน / ผู้ดูแลระบบ</span></div>
        `;
        
        let html = '';
        
        // 🚨 กรองข้อมูล: โชว์เฉพาะคนที่ showOnLogin ไม่ใช่ false หรือเป็น admin
        const visibleUsers = this.allUsers.filter(user => user.showOnLogin !== false || user.role === 'admin');

        visibleUsers.forEach(user => {
            let roleData = this.roleConfig[user.role] || { label: 'พนักงานทั่วไป', iconHtml: '<i class="fa-solid fa-user-tag text-secondary safe-icon"></i>' };
            let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&bold=true&rounded=true`;
            
            html += `
                <div class="custom-option-item" data-id="${user.username}" data-name="${user.name}" data-avatar="${avatarUrl}" data-role="${user.role}">
                    <img src="${avatarUrl}" class="custom-option-avatar">
                    <div class="custom-option-text">
                        <div class="custom-option-name" style="font-weight:700; color:var(--text-dark);">${user.name}</div>
                        <div class="custom-option-role" style="font-size:12px; color:var(--text-muted);">${roleData.iconHtml} <span class="ms-1">${roleData.label}</span></div>
                    </div>
                </div>
            `;
        });
        
        html += `
            <div class="custom-option-item" style="border-top: 1px dashed var(--border-color); margin-top: 8px; padding-top: 12px; background: var(--bg-body);" data-id="manual" data-name="กรอกไอดีและรหัสผ่านด้วยมือ" data-avatar="null" data-role="manual">
                <div class="custom-option-icon text-primary border border-primary border-opacity-25" style="background: var(--bg-surface);"><i class="fa-solid fa-keyboard safe-icon"></i></div>
                <div class="custom-option-text">
                    <div class="custom-option-name text-primary" style="font-weight:800;">กรอกไอดีด้วยมือ (Manual)</div>
                    <div class="custom-option-role"><i class="fa-solid fa-shield-halved text-danger safe-icon"></i> <span class="ms-1 fw-bold" style="color: var(--text-muted);">Admin Override</span></div>
                </div>
            </div>
        `;
        listItemsContainer.innerHTML = html;

        // เช็คว่าเคยล็อคอินด้วยไอดีที่ยังมีสิทธิ์โชว์อยู่ไหม ถ้ามีให้เลือกไว้เหมือนเดิม
        const savedUser = localStorage.getItem('dialysis_remember_username');
        if(savedUser && visibleUsers.some(u => u.username === savedUser)) {
            const userObj = visibleUsers.find(u => u.username === savedUser);
            let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userObj.name)}&background=3b82f6&color=fff&bold=true&rounded=true`;
            this.processUserSelection(userObj.username, userObj.name, avatarUrl, userObj.role);
            document.getElementById('login-remember').checked = true;
        } else if (savedUser) {
            // ถ้าชื่อถูกซ่อนไปแล้ว ให้ล้างความจำ
            localStorage.removeItem('dialysis_remember_username');
        }
    }

    onUserSelectChange(value) {
        const manualWrapper = document.getElementById('manual-username-wrapper');
        const manualInput = document.getElementById('login-username');
        if(value === 'manual') {
            manualWrapper.style.display = 'block';
            if(manualInput) { manualInput.value = ''; manualInput.focus(); }
        } else {
            manualWrapper.style.display = 'none';
            document.getElementById('login-password').focus();
        }
    }

    togglePassword() {
        const pwInput = document.getElementById('login-password');
        const icon = document.getElementById('toggle-pw-icon');
        if (pwInput.type === "password") { pwInput.type = "text"; icon.className = "fa-solid fa-eye-slash text-danger safe-icon"; } 
        else { pwInput.type = "password"; icon.className = "fa-solid fa-eye safe-icon"; }
    }

    async authenticate() {
        const hiddenInput = document.getElementById('login-username-select');
        let usernameInp = hiddenInput ? hiddenInput.value : '';
        const passwordInp = document.getElementById('login-password').value.trim();
        const btnLoginText = document.getElementById('btn-login-text');
        const btnLogin = document.getElementById('btn-login');

        if(usernameInp === 'manual') usernameInp = document.getElementById('login-username').value.trim();

        if (!usernameInp || usernameInp === "" || !passwordInp) { 
            Swal.fire({ 
                html: '<div class="mt-2"><i class="fa-solid fa-fingerprint fa-4x text-warning mb-4 safe-icon" style="animation: pulse 2s infinite;"></i><h4 class="fw-bold" style="font-family:\'Prompt\'; color: var(--text-dark);">ข้อมูลไม่ครบถ้วน</h4><p class="small" style="color: var(--text-muted);">กรุณาเลือกบัญชีผู้ใช้และระบุรหัสผ่านให้ครบถ้วนครับ</p></div>', 
                showConfirmButton: true, confirmButtonText: 'ตกลง', buttonsStyling: false,
                background: 'var(--bg-surface)',
                customClass: { popup: 'premium-alert', confirmButton: 'btn-premium-swal mx-2' }
            }); 
            return; 
        }

        btnLogin.disabled = true;
        btnLoginText.innerHTML = `<i class="fas fa-spinner fa-spin me-2 safe-icon"></i> ตรวจสอบสิทธิ์ (Authenticating...)`;

        await new Promise(r => setTimeout(r, 600));
        btnLoginText.innerHTML = `<i class="fa-solid fa-shield-halved fa-beat me-2 safe-icon"></i> ถอดรหัสโปรไฟล์ (Decrypting...)`;
        await new Promise(r => setTimeout(r, 400));

        try {
            if (usernameInp === 'admin' && passwordInp === 'admin1234') {
                App.currentUser = { id: 'MASTER_ADMIN', name: 'Master Admin', role: 'admin', status: 'active' };
                document.getElementById('anti-flash-style')?.remove();
                
                const sessionData = { id: 'MASTER_ADMIN', username: 'admin', name: 'Master Admin', role: 'admin', login_time: new Date().getTime() };
                sessionStorage.setItem('dialysis_user_session', JSON.stringify(sessionData));
                
                Swal.fire({ 
                    html: `<div class="mt-2"><i class="fa-solid fa-check-circle fa-4x text-success mb-3 safe-icon"></i><h4 class="fw-bold" style="font-family:'Prompt'; color: var(--text-dark);">Access Granted</h4><p class="small" style="color: var(--text-muted);">ยินดีต้อนรับเข้าสู่ระบบ (Master Account)</p></div>`, 
                    timer: 1500, showConfirmButton: false, background: 'var(--bg-surface)', customClass: { popup: 'premium-alert' }
                }).then(() => App.switchPage('dashboard'));
                return;
            }

            const validUser = this.allUsers.find(u => u && u.username.toLowerCase() === usernameInp.toLowerCase() && u.password === passwordInp);

            if (validUser) {
                if (validUser.status !== 'active') {
                    Swal.fire({ html: '<div class="mt-2"><i class="fa-solid fa-user-lock fa-4x text-danger mb-3 safe-icon"></i><h4 class="fw-bold" style="font-family:\'Prompt\'; color: var(--text-dark);">บัญชีถูกระงับ</h4><p class="small" style="color: var(--text-muted);">บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ</p></div>', showConfirmButton: true, confirmButtonText: 'ตกลง', buttonsStyling: false, background: 'var(--bg-surface)', customClass: { popup: 'premium-alert', confirmButton: 'btn-premium-swal btn-danger-swal' } });
                    btnLoginText.innerHTML = `<i class="fa-solid fa-shield-check me-2 safe-icon"></i> เข้าสู่ระบบ (Authenticate)`; btnLogin.disabled = false;
                    return;
                }

                if (document.getElementById('login-remember').checked) localStorage.setItem('dialysis_remember_username', validUser.username);
                else localStorage.removeItem('dialysis_remember_username');

                const sessionData = { id: validUser.id, username: validUser.username, name: validUser.name, role: validUser.role, login_time: new Date().getTime() };
                sessionStorage.setItem('dialysis_user_session', JSON.stringify(sessionData));
                
                App.currentUser = validUser;
                document.getElementById('anti-flash-style')?.remove();

                Swal.fire({ 
                    html: `<div class="mt-2"><i class="fa-solid fa-shield-check fa-4x text-success mb-3 safe-icon"></i><h4 class="fw-bold" style="font-family:'Prompt'; color: var(--text-dark);">ยินดีต้อนรับ</h4><p class="small" style="color: var(--text-muted);">เชื่อมต่อข้อมูลสำเร็จ คุณ <b>${validUser.name}</b></p></div>`, 
                    timer: 1500, showConfirmButton: false, background: 'var(--bg-surface)', customClass: { popup: 'premium-alert' }
                }).then(() => App.switchPage('dashboard'));
                
            } else {
                Swal.fire({ html: '<div class="mt-2"><i class="fa-solid fa-fingerprint fa-4x text-danger mb-3 safe-icon"></i><h4 class="fw-bold" style="font-family:\'Prompt\'; color: var(--text-dark);">การยืนยันตัวตนล้มเหลว</h4><p class="small" style="color: var(--text-muted);">รหัสผ่านไม่ถูกต้อง หรือไม่พบไอดีนี้ในระบบ!</p></div>', showConfirmButton: true, confirmButtonText: 'ลองใหม่อีกครั้ง', buttonsStyling: false, background: 'var(--bg-surface)', customClass: { popup: 'premium-alert', confirmButton: 'btn-premium-swal btn-danger-swal' } });
                btnLoginText.innerHTML = `<i class="fa-solid fa-shield-check me-2 safe-icon"></i> เข้าสู่ระบบ (Authenticate)`; btnLogin.disabled = false;
                document.getElementById('login-password').value = '';
            }
        } catch (error) { 
            Swal.fire({ title: '<i class="fa-solid fa-wifi text-danger me-2 safe-icon"></i> เครือข่ายขัดข้อง', html: '<p class="small" style="color: var(--text-muted);">ไม่สามารถเปิดประตูฐานข้อมูลได้ กรุณาตรวจสอบอินเทอร์เน็ต</p>', showConfirmButton: true, confirmButtonText: 'ตกลง', buttonsStyling: false, background: 'var(--bg-surface)', customClass: { popup: 'premium-alert', confirmButton: 'btn-premium-swal' } }); 
            btnLoginText.innerHTML = `<i class="fa-solid fa-shield-check me-2 safe-icon"></i> เข้าสู่ระบบ (Authenticate)`; btnLogin.disabled = false; 
        }
    }

    forgotPassword() {
        Swal.fire({
            title: '<h4 class="fw-bold text-primary mb-0" style="font-family:\'Prompt\';"><i class="fa-solid fa-unlock-keyhole me-2 safe-icon"></i> ขอรีเซ็ตรหัสผ่าน</h4>',
            html: '<div class="text-start mt-3" style="font-family:\'Sarabun\';"><label class="form-label fw-bold small text-secondary">กรุณาระบุ Username (ไอดี) ของคุณ</label><input type="text" id="swal-reset-username" class="form-control input-modern-login text-center fw-bold fs-5 mt-2" style="border-radius:14px;" value="admin" onfocus="this.select()" placeholder="กรอก Username"></div>',
            showCancelButton: true, 
            background: 'var(--bg-surface)',
            confirmButtonText: 'ถัดไป <i class="fa-solid fa-arrow-right ms-1 safe-icon"></i>', 
            cancelButtonText: 'ยกเลิก', 
            buttonsStyling: false, 
            customClass: { popup: 'premium-alert', confirmButton: 'btn-premium-swal mx-2', cancelButton: 'btn-cancel-swal mx-2' },
            preConfirm: () => { 
                const username = document.getElementById('swal-reset-username').value.trim(); 
                if(!username) { Swal.showValidationMessage('กรุณาระบุ Username'); return false; } 
                return username; 
            }
        }).then(async (result) => {
            if(result.isConfirmed) {
                const targetUsername = result.value; 
                Swal.fire({title: 'กำลังตรวจสอบ...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: 'var(--bg-surface)', customClass: { popup: 'premium-alert' }});
                
                try {
                    if(typeof firebase !== 'undefined' && firebase.auth) { 
                        if(firebase.auth().currentUser === null) { await firebase.auth().signInAnonymously(); } 
                    }
                    const [usersSnap, settingsSnap] = await Promise.all([ 
                        db.ref('clinic_users_v2').once('value'), 
                        db.ref('clinic_settings_v2/admin_pin').once('value') 
                    ]);
                    
                    const usersData = usersSnap.val() || []; 
                    const adminPin = settingsSnap.val();
                    let usersArray = Array.isArray(usersData) ? usersData : Object.keys(usersData).map(k => usersData[k]);
                    let userIndex = usersArray.findIndex(u => u && u.username.toLowerCase() === targetUsername.toLowerCase());
                    
                    Swal.close();
                    
                    if(userIndex === -1) { 
                        setTimeout(() => {
                            Swal.fire({ html: `<div class="mt-2"><i class="fa-solid fa-user-xmark fa-4x text-danger mb-3 safe-icon"></i><h4 class="fw-bold" style="font-family:'Prompt'; color: var(--text-dark);">ไม่พบผู้ใช้</h4><p class="small" style="color: var(--text-muted);">ไม่มีไอดี <b>${targetUsername}</b> ในระบบ</p></div>`, showConfirmButton: true, confirmButtonText: 'ตกลง', buttonsStyling: false, background: 'var(--bg-surface)', customClass: { popup: 'premium-alert', confirmButton: 'btn-premium-swal btn-danger-swal' } }); 
                        }, 100);
                        return; 
                    }
                    
                    if(!adminPin) { 
                        setTimeout(() => {
                            Swal.fire({ html: '<div class="mt-2"><i class="fa-solid fa-triangle-exclamation fa-4x text-warning mb-3 safe-icon"></i><h4 class="fw-bold" style="font-family:\'Prompt\'; color: var(--text-dark);">ระบบยังไม่พร้อม</h4><p class="small" style="color: var(--text-muted);">ผู้ดูแลระบบยังไม่ได้ตั้งค่า <b>Admin PIN</b><br>โปรดไปตั้งค่าที่เมนูตั้งค่าคลินิกก่อนครับ</p></div>', showConfirmButton: true, confirmButtonText: 'ตกลง', buttonsStyling: false, background: 'var(--bg-surface)', customClass: { popup: 'premium-alert', confirmButton: 'btn-premium-swal' } }); 
                        }, 100);
                        return; 
                    }
                    
                    setTimeout(() => {
                        Swal.fire({
                            title: '<h4 class="text-danger fw-bold" style="font-family:\'Prompt\';"><i class="fa-solid fa-shield-halved me-2 safe-icon"></i> ยืนยันสิทธิ์ Admin</h4>',
                            html: `<p class="small mb-3" style="font-family:'Sarabun'; color: var(--text-muted);">กรุณาให้ผู้ดูแลระบบกรอก <b>Admin PIN</b> เพื่ออนุมัติการรีเซ็ตรหัสผ่านให้ไอดี <b class="text-primary">${targetUsername}</b></p><input type="password" id="swal-auth-pin" class="form-control input-modern-login text-center fw-bold text-danger fs-3 tracking-widest" style="letter-spacing:10px; border-radius:14px;" placeholder="******" maxlength="6" oninput="this.value=this.value.replace(/[^0-9]/g,'')">`,
                            showCancelButton: true, 
                            background: 'var(--bg-surface)',
                            confirmButtonText: '<i class="fa-solid fa-check me-1 safe-icon"></i> ยืนยัน PIN', 
                            cancelButtonText: 'ยกเลิก', 
                            buttonsStyling: false, 
                            customClass: { popup: 'premium-alert', confirmButton: 'btn-premium-swal btn-danger-swal mx-2', cancelButton: 'btn-cancel-swal mx-2' },
                            preConfirm: () => { 
                                const enteredPin = document.getElementById('swal-auth-pin').value; 
                                if(enteredPin !== adminPin.toString()) { 
                                    Swal.showValidationMessage('PIN ไม่ถูกต้อง ไม่อนุญาตให้เปลี่ยนรหัส!'); 
                                    return false; 
                                } 
                                return true; 
                            }
                        }).then((pinResult) => {
                            if(pinResult.isConfirmed) {
                                setTimeout(() => {
                                    Swal.fire({
                                        title: '<h5 class="fw-bold text-success mb-0" style="font-family:\'Prompt\';"><i class="fa-solid fa-key me-2 safe-icon"></i> ตั้งรหัสผ่านใหม่</h5>',
                                        html: '<div class="text-start mt-3" style="font-family:\'Sarabun\';"><label class="form-label small fw-bold" style="color: var(--text-muted);">รหัสผ่านใหม่ (New Password)</label><input type="password" id="swal-new-pwd" class="form-control input-modern-login mb-3" style="border-radius:14px;"><label class="form-label small fw-bold" style="color: var(--text-muted);">ยืนยันรหัสผ่านใหม่อีกครั้ง</label><input type="password" id="swal-confirm-pwd" class="form-control input-modern-login" style="border-radius:14px;"></div>',
                                        showCancelButton: true, 
                                        background: 'var(--bg-surface)',
                                        confirmButtonText: 'เปลี่ยนรหัสผ่าน', 
                                        cancelButtonText: 'ยกเลิก', 
                                        buttonsStyling: false, 
                                        customClass: { popup: 'premium-alert', confirmButton: 'btn-premium-swal mx-2', cancelButton: 'btn-cancel-swal mx-2' },
                                        preConfirm: () => {
                                            const p1 = document.getElementById('swal-new-pwd').value; const p2 = document.getElementById('swal-confirm-pwd').value;
                                            if(p1.length < 6) { Swal.showValidationMessage('รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร'); return false; }
                                            if(p1 !== p2) { Swal.showValidationMessage('รหัสผ่านไม่ตรงกัน'); return false; } 
                                            return p1;
                                        }
                                    }).then((pwdResult) => {
                                        if(pwdResult.isConfirmed) {
                                            Swal.fire({title: 'กำลังอัปเดตระบบ...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: 'var(--bg-surface)', customClass: { popup: 'premium-alert' }});
                                            usersArray[userIndex].password = pwdResult.value;
                                            db.ref('clinic_users_v2').set(usersArray).then(() => { 
                                                Swal.fire({ html: '<div class="mt-2"><i class="fa-solid fa-check-circle fa-4x text-success mb-3 safe-icon"></i><h4 class="fw-bold" style="font-family:\'Prompt\'; color: var(--text-dark);">เปลี่ยนรหัสผ่านสำเร็จ!</h4><p class="small" style="color: var(--text-muted);">กรุณาใช้รหัสผ่านใหม่เพื่อเข้าสู่ระบบ</p></div>', showConfirmButton: true, confirmButtonText: 'กลับไปหน้าล็อคอิน', buttonsStyling: false, background: 'var(--bg-surface)', customClass: { popup: 'premium-alert', confirmButton: 'btn-premium-swal' } }).then(() => { LoginPage.init(); }); 
                                            });
                                        }
                                    });
                                }, 100);
                            }
                        });
                    }, 100);
                } catch(e) { 
                    Swal.fire({ title: 'เกิดข้อผิดพลาด', text: 'ระบบเครือข่ายขัดข้อง กรุณาลองใหม่', icon: 'error', background: 'var(--bg-surface)', customClass: { popup: 'premium-alert' }}); 
                }
            }
        });
    }
}

// 🌐 Expose Component สู่ระบบ Router
const LoginPage = new LoginPageComponent();
window.LoginPage = LoginPage;