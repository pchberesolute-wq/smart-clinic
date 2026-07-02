// js/pages/login.js
// 🚀 Enterprise Login Module: Standalone UI, Stacking-Context Escape & Optimized Auth Sync

// 🚨 ระบบป้องกันหน้าเว็บกระพริบ (Anti-Flash Engine) + ทุบกรงขัง CSS
(function preventFlash() {
    if (!localStorage.getItem('dialysis_user_session')) {
        const antiFlashStyle = document.createElement('style');
        antiFlashStyle.id = 'anti-flash-style';
        antiFlashStyle.innerHTML = `
            #sidebar, .topbar { display: none !important; opacity: 0 !important; visibility: hidden !important; }
            .main-content { margin: 0 !important; padding: 0 !important; transform: none !important; background: #f8fafc !important; }
            body { background: #f8fafc !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
        `;
        if(document.head) document.head.appendChild(antiFlashStyle);
        else document.documentElement.appendChild(antiFlashStyle);
    }
})();

class LoginPageComponent {
    constructor() {
        this.allUsers = [];
        this.roleConfig = {
            'admin': { label: 'ผู้ดูแลระบบ', iconHtml: '<i class="fa-solid fa-shield-halved text-danger"></i>' },
            'doctor': { label: 'แพทย์', iconHtml: '<i class="fa-solid fa-user-doctor text-success"></i>' },
            'head_nurse': { label: 'หัวหน้าพยาบาล', iconHtml: '<i class="fa-solid fa-star text-warning"></i>' },
            'nurse': { label: 'พยาบาล', iconHtml: '<i class="fa-solid fa-user-nurse text-primary"></i>' },
            'assistant': { label: 'ผู้ช่วยพยาบาล', iconHtml: '<i class="fa-solid fa-hand-holding-medical text-info"></i>' },
            'finance': { label: 'การเงิน/บัญชี', iconHtml: '<i class="fa-solid fa-file-invoice-dollar text-success"></i>' },
            'stock': { label: 'พัสดุ', iconHtml: '<i class="fa-solid fa-boxes-packing text-secondary"></i>' }
        };
        this.firebaseListeners = [];
    }

    get html() {
        return `
            <style>
                /* 🚨 THE KILLER FIX: ทำลายกรงขัง CSS Stacking Context (ทุบกล่องกระจก) 🚨 */
                .main-content {
                    margin: 0 !important;
                    padding: 0 !important;
                    transform: none !important; /* ปลดล็อก GPU Layer ที่ขังหน้า Login ไว้ */
                    width: 100vw !important;
                    min-height: 100vh !important;
                }
                #app-content {
                    margin: 0 !important;
                    padding: 0 !important;
                }
                
                /* บังคับกางเต็มหน้าจอ 100% ทะลุทุกมิติ */
                .login-container { 
                    position: fixed !important; 
                    top: 0 !important; 
                    left: 0 !important; 
                    right: 0 !important;
                    bottom: 0 !important;
                    width: 100vw !important; 
                    height: 100vh !important; 
                    margin: 0 !important;
                    padding: 0 !important;
                    background: #f8fafc; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    z-index: 999999 !important; /* ดันให้อยู่หน้าสุด */
                    overflow: hidden; 
                    font-family: 'Prompt', sans-serif; 
                }

                /* 🚨 THE FIX: สั่งให้กล่องแจ้งเตือนกระโดดทะลุหน้า Login ขึ้นมาอยู่บนสุดเสมอ 🚨 */
                .swal2-container { z-index: 9999999 !important; }
                
                .login-blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.6; animation: floatBlob 10s infinite ease-in-out; pointer-events: none; }
                .blob-1 { width: 450px; height: 450px; background: #93c5fd; top: -100px; left: -100px; }
                .blob-2 { width: 550px; height: 550px; background: #c4b5fd; bottom: -150px; right: -150px; animation-delay: -5s; }
                .blob-3 { width: 350px; height: 350px; background: #67e8f9; bottom: 20%; left: 10%; opacity: 0.4; animation-delay: -2s; }
                @keyframes floatBlob { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-20px) scale(1.05); } }
                
                .login-card {
                    position: relative; z-index: 10; width: 100%; max-width: 580px; 
                    background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.6); border-radius: 32px; padding: 50px 40px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
                    animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    margin: 20px; 
                }
                @keyframes slideUpFade { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }

                .brand-logo-wrapper { width: 100px; height: 100px; margin: 0 auto 20px; transform: rotate(-5deg); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; }
                .login-card:hover .brand-logo-wrapper { transform: rotate(0deg) scale(1.08); }
                .brand-logo-wrapper img { width: 100%; height: 100%; object-fit: cover; border-radius: 28px; box-shadow: 0 15px 35px -5px rgba(37, 99, 235, 0.4); border: 3px solid #ffffff; background: #ffffff; }

                .login-title-h2 { letter-spacing: -0.5px; white-space: nowrap; overflow: visible; font-size: clamp(18px, 4vw, 26px); }

                .profile-selector-btn {
                    background: rgba(241, 245, 249, 0.8); border: 2px solid transparent; border-radius: 14px;
                    padding: 12px 18px; display: flex; align-items: center; justify-content: space-between;
                    cursor: pointer; transition: all 0.3s ease; box-shadow: inset 0 2px 4px rgba(255,255,255,0.5);
                }
                .profile-selector-btn:hover { background: #fff; border-color: #bfdbfe; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1); }
                
                .selected-user-info { display: flex; align-items: center; gap: 14px; }
                .selected-avatar-img { 
                    width: 42px; height: 42px; border-radius: 50%; object-fit: cover; 
                    border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .selected-text-group { display: flex; flex-direction: column; align-items: flex-start; }
                .selected-name { font-weight: 700; color: #1e293b; font-size: 15px; font-family: 'Prompt', sans-serif; line-height: 1.2; }
                .selected-role { font-weight: 600; color: #64748b; font-size: 12px; }

                .custom-options-panel {
                    display: none; position: absolute; width: 100%; top: calc(100% + 8px); left: 0;
                    background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(203, 213, 225, 0.8); border-radius: 16px;
                    box-shadow: 0 15px 35px -5px rgba(0,0,0,0.15); z-index: 9999;
                    max-height: 280px; overflow-y: auto; padding: 10px;
                    animation: slideDownFade 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .custom-options-panel::-webkit-scrollbar { width: 6px; }
                .custom-options-panel::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                
                .custom-option-item {
                    display: flex; align-items: center; padding: 10px 15px;
                    border-radius: 12px; cursor: pointer; transition: all 0.2s; margin-bottom: 4px; border: 1px solid transparent;
                }
                .custom-option-item:hover { background: #f1f5f9; border-color: #e2e8f0; transform: translateX(3px); }
                
                .custom-option-avatar { width: 38px; height: 38px; border-radius: 50%; margin-right: 14px; object-fit: cover; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
                .custom-option-icon { width: 38px; height: 38px; border-radius: 50%; margin-right: 14px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #64748b; font-size: 16px; box-shadow: inset 0 0 0 1px #e2e8f0; }
                
                .input-modern-login { background: rgba(241, 245, 249, 0.8); border: 2px solid transparent; border-radius: 14px; padding-left: 15px; font-weight: 600; color: #1e293b; transition: all 0.3s; }
                .input-modern-login:focus { background: #fff; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15); }
                .modern-icon-login { background: rgba(241, 245, 249, 0.8); border: 2px solid transparent; border-right: none; border-radius: 14px 0 0 14px; color: #64748b; transition: all 0.3s; }
                .input-group:focus-within .modern-icon-login { background: #fff; border-color: var(--primary); color: var(--primary); }
                .input-group:focus-within .input-modern-login { border-left-color: transparent; }

                .swal2-popup.premium-alert { border-radius: 24px !important; padding: 25px 20px !important; border: 1px solid rgba(255,255,255,0.8) !important; background: rgba(255, 255, 255, 0.98) !important; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15) !important; }
                .swal2-confirm.premium-btn { border-radius: 12px !important; padding: 12px 28px !important; font-family: 'Prompt', sans-serif !important; font-weight: 600 !important; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important; color: white !important; box-shadow: 0 8px 15px -3px rgba(37, 99, 235, 0.3) !important; border: none !important; transition: all 0.3s ease; }
                .swal2-confirm.premium-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px -3px rgba(37, 99, 235, 0.4) !important; }
                .swal2-cancel.premium-btn-cancel { border-radius: 12px !important; padding: 12px 28px !important; font-family: 'Prompt', sans-serif !important; font-weight: 600 !important; background: #64748b !important; color: white !important; border: none !important; box-shadow: 0 8px 15px -3px rgba(100, 116, 139, 0.2) !important; transition: all 0.3s ease; }
                .swal2-cancel.premium-btn-cancel:hover { transform: translateY(-2px); background: #475569 !important; }
                .swal2-confirm.premium-btn-danger { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important; box-shadow: 0 8px 15px -3px rgba(239, 68, 68, 0.3) !important; }
            </style>

            <div class="login-container">
                <div class="login-blob blob-1"></div>
                <div class="login-blob blob-2"></div>
                <div class="login-blob blob-3"></div>

                <div class="login-card">
                    <div class="text-center mb-4 pb-2">
                        <div class="brand-logo-wrapper">
                            <img src="./img/logo.png" alt="DIALYSIS PRO Logo" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&auto=format&fit=crop';">
                        </div>
                        <h2 class="fw-bold text-dark mb-1 login-title-h2">หน่วยไตเทียม <span style="color: var(--primary);">โรงพยาบาลคริสเตียน แพร่</span></h2>
                        <p class="text-muted fw-medium small mb-0 mt-2">ระบบบริหารจัดการเวชระเบียนคลินิกฟอกไต</p>
                    </div>

                    <div class="mb-4 mt-5">
                        <label class="form-label fw-bold text-secondary small mb-2 ps-1">เลือกบัญชีผู้ใช้งานระบบ</label>
                        
                        <div class="position-relative mb-3" id="custom-dropdown-wrapper">
                            <input type="hidden" id="login-username-select" value="">
                            
                            <div class="profile-selector-btn shadow-sm" onclick="LoginPage.toggleCustomDropdown(event)">
                                <div class="selected-user-info" id="display-user-container">
                                    <div class="rounded-circle bg-light d-flex align-items-center justify-content-center" style="width: 42px; height: 42px; border: 2px solid #e2e8f0;">
                                        <i class="fa-solid fa-user text-secondary"></i>
                                    </div>
                                    <div class="selected-text-group">
                                        <span class="selected-name text-muted">กำลังโหลดข้อมูล...</span>
                                        <span class="selected-role">กรุณารอสักครู่</span>
                                    </div>
                                </div>
                                <i class="fa-solid fa-chevron-down text-secondary ms-2" style="font-size: 14px;"></i>
                            </div>

                            <div id="custom-user-list" class="custom-options-panel"></div>
                        </div>

                        <div id="manual-username-wrapper" style="display: none; animation: slideUpFade 0.3s ease forwards;">
                            <label class="form-label fw-bold text-secondary small mb-2 ps-1">ไอดีล็อคอิน (Username)</label>
                            <div class="input-group mb-3 shadow-sm" style="border-radius: 14px;">
                                <span class="input-group-text modern-icon-login px-3"><i class="fa-solid fa-id-card text-primary"></i></span>
                                <input type="text" id="login-username" class="form-control form-control-lg input-modern-login border-start-0" placeholder="กรอก Username ของคุณ" autocomplete="off">
                            </div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center mb-2 ps-1">
                            <label class="form-label fw-bold text-secondary small mb-0">รหัสผ่าน (Password)</label>
                            <a href="#" onclick="LoginPage.forgotPassword()" class="text-primary small fw-bold text-decoration-none"><i class="fa-solid fa-unlock-keyhole me-1"></i> ลืมรหัสผ่าน?</a>
                        </div>
                        <div class="input-group mb-3 shadow-sm" style="border-radius: 14px;">
                            <span class="input-group-text modern-icon-login px-3"><i class="fa-solid fa-lock text-primary"></i></span>
                            <input type="password" id="login-password" class="form-control form-control-lg input-modern-login border-start-0 border-end-0" placeholder="กรอกรหัสผ่าน" onkeypress="if(event.key === 'Enter') LoginPage.authenticate()">
                            <button class="btn input-modern-login border-start-0 text-muted px-3" type="button" onclick="LoginPage.togglePassword()" style="border-radius: 0 14px 14px 0;">
                                <i class="fa-solid fa-eye" id="toggle-pw-icon"></i>
                            </button>
                        </div>

                        <div class="d-flex justify-content-between align-items-center mb-4 px-2">
                            <div class="form-check">
                                <input class="form-check-input shadow-sm" type="checkbox" id="login-remember" style="cursor: pointer;">
                                <label class="form-check-label text-muted small fw-bold" for="login-remember" style="cursor: pointer; padding-top: 2px;">จดจำบัญชีผู้ใช้นี้ไว้ในเครื่อง</label>
                            </div>
                        </div>

                        <button class="btn btn-premium btn-premium-primary w-100 py-3" id="btn-login" onclick="LoginPage.authenticate()" style="font-size: 17px;">
                            เข้าสู่ระบบ (Secure Login) <i class="fa-solid fa-arrow-right ms-2"></i>
                        </button>
                    </div>

                    <div class="text-center mt-4">
                        <div class="d-inline-flex align-items-center justify-content-center px-3 py-1 rounded-pill" style="background: rgba(255, 255, 255, 0.6); border: 1px solid #e2e8f0;">
                            <i class="fa-solid fa-shield-halved text-success me-2"></i>
                            <span class="text-muted" style="font-size: 11px; font-weight: 700;">Hybrid Identity Sync • Cloud OS Secure</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 🚀 Lifecycle: Mount
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

        const userListPanel = document.getElementById('custom-user-list');
        if (userListPanel) {
            userListPanel.addEventListener('click', (e) => {
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
                <div class="rounded-circle bg-danger-subtle text-danger d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;"><i class="fa-solid fa-xmark"></i></div>
                <div class="selected-text-group"><span class="selected-name text-danger">ระบบรักษาความปลอดภัยขัดข้อง</span></div>`;
            return;
        }

        let cachedUsers = localStorage.getItem('dialysis_cached_users');
        if (cachedUsers) {
            this.allUsers = JSON.parse(cachedUsers);
            this.renderUserDropdown();
        }

        try {
            // 🚨 อาศัยบารมี Auth จาก firebase-config.js (ไม่ต้องขอ Persistence ซ้ำ)
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
                                <div class="rounded-circle bg-warning-subtle text-warning-dark d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;"><i class="fa-solid fa-database"></i></div>
                                <div class="selected-text-group"><span class="selected-name text-warning-dark">ฐานข้อมูลว่างเปล่า</span></div>`;
                        }
                        this.renderUserDropdown();
                    });
                    this.firebaseListeners.push({ path: 'clinic_users_v2', callback: cbUsers });
                }
            });
        } catch (err) { console.error("Init Error:", err); }
    }

    // 🧹 Lifecycle: Unmount
    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
    }

    toggleCustomDropdown(e) {
        if(e) e.stopPropagation();
        const list = document.getElementById('custom-user-list');
        if(list) list.style.display = list.style.display === 'block' ? 'none' : 'block';
    }

    processUserSelection(username, name, avatarUrl, role) {
        document.getElementById('login-username-select').value = username;
        
        let roleIcon = '<i class="fa-solid fa-user-tag text-secondary"></i>';
        let roleLabel = 'พนักงานทั่วไป';

        if (role === 'manual') {
            roleIcon = '<i class="fa-solid fa-lock text-warning"></i>';
            roleLabel = 'สำหรับผู้ดูแลระบบ';
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
                <div class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style="width: 42px; height: 42px; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"><i class="fa-solid fa-keyboard"></i></div>
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

    renderUserDropdown() {
        const listEl = document.getElementById('custom-user-list');
        if(!listEl) return;

        document.getElementById('display-user-container').innerHTML = `
            <div class="rounded-circle bg-light d-flex align-items-center justify-content-center" style="width: 42px; height: 42px; border: 2px solid #e2e8f0;"><i class="fa-solid fa-user text-secondary"></i></div>
            <div class="selected-text-group"><span class="selected-name text-muted">คลิกเพื่อเลือกบัญชี</span><span class="selected-role">พนักงาน / ผู้ดูแลระบบ</span></div>
        `;
        
        let html = '';
        this.allUsers.forEach(user => {
            let roleData = this.roleConfig[user.role] || { label: 'พนักงานทั่วไป', iconHtml: '<i class="fa-solid fa-user-tag text-secondary"></i>' };
            let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff&bold=true&rounded=true`;
            
            html += `
                <div class="custom-option-item" data-id="${user.username}" data-name="${user.name}" data-avatar="${avatarUrl}" data-role="${user.role}">
                    <img src="${avatarUrl}" class="custom-option-avatar">
                    <div class="custom-option-text">
                        <div class="custom-option-name">${user.name}</div>
                        <div class="custom-option-role">${roleData.iconHtml} <span class="ms-1">${roleData.label}</span></div>
                    </div>
                </div>
            `;
        });
        
        html += `
            <div class="custom-option-item" style="border-top: 1px dashed #e2e8f0; margin-top: 5px; padding-top: 10px;" data-id="manual" data-name="กรอกไอดีเองด้วยมือ" data-avatar="null" data-role="manual">
                <div class="custom-option-icon"><i class="fa-solid fa-keyboard text-primary"></i></div>
                <div class="custom-option-text">
                    <div class="custom-option-name text-primary">กรอกไอดีเองด้วยมือ</div>
                    <div class="custom-option-role"><i class="fa-solid fa-lock text-warning"></i> <span class="ms-1">Manual Login</span></div>
                </div>
            </div>
        `;
        listEl.innerHTML = html;

        const savedUser = localStorage.getItem('dialysis_remember_username');
        if(savedUser && this.allUsers.some(u => u.username === savedUser)) {
            const userObj = this.allUsers.find(u => u.username === savedUser);
            let avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userObj.name)}&background=3b82f6&color=fff&bold=true&rounded=true`;
            this.processUserSelection(userObj.username, userObj.name, avatarUrl, userObj.role);
            document.getElementById('login-remember').checked = true;
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
        if (pwInput.type === "password") { pwInput.type = "text"; icon.className = "fa-solid fa-eye-slash"; } 
        else { pwInput.type = "password"; icon.className = "fa-solid fa-eye"; }
    }

    async authenticate() {
        const hiddenInput = document.getElementById('login-username-select');
        let usernameInp = hiddenInput ? hiddenInput.value : '';
        const passwordInp = document.getElementById('login-password').value.trim();
        const btnLogin = document.getElementById('btn-login');

        if(usernameInp === 'manual') usernameInp = document.getElementById('login-username').value.trim();

        if (!usernameInp || usernameInp === "" || !passwordInp) { 
            Swal.fire({ 
                html: '<div class="mt-2"><i class="fa-solid fa-circle-exclamation fa-4x text-warning mb-3"></i><h4 class="fw-bold text-dark" style="font-family:\'Prompt\';">ข้อมูลไม่ครบถ้วน</h4><p class="text-muted small">กรุณาเลือกบัญชีผู้ใช้และระบุรหัสผ่านให้ครบถ้วนครับ</p></div>', 
                showConfirmButton: true, confirmButtonText: 'ตกลง', buttonsStyling: false,
                customClass: { popup: 'premium-alert', confirmButton: 'swal2-confirm premium-btn' }
            }); 
            return; 
        }

        const originalBtnHtml = btnLogin.innerHTML;
        btnLogin.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> กำลังตรวจสอบสิทธิ์...`; btnLogin.disabled = true;

        try {
            if (usernameInp === 'admin' && passwordInp === 'admin1234') {
                App.currentUser = { id: 'MASTER_ADMIN', name: 'Master Admin', role: 'admin', status: 'active' };
                document.getElementById('anti-flash-style')?.remove();
                Swal.fire({ 
                    html: `<div class="mt-2"><i class="fa-solid fa-circle-check fa-4x text-success mb-3"></i><h4 class="fw-bold text-dark" style="font-family:'Prompt';">เข้าสู่ระบบสำเร็จ</h4><p class="text-muted small">ยินดีต้อนรับเข้าสู่ระบบ (Master Account)</p></div>`, 
                    timer: 1200, showConfirmButton: false, customClass: { popup: 'premium-alert' }
                }).then(() => App.switchPage('dashboard'));
                return;
            }

            const validUser = this.allUsers.find(u => u && u.username.toLowerCase() === usernameInp.toLowerCase() && u.password === passwordInp);

            if (validUser) {
                if (validUser.status !== 'active') {
                    Swal.fire({ html: '<div class="mt-2"><i class="fa-solid fa-user-lock fa-4x text-danger mb-3"></i><h4 class="fw-bold text-dark" style="font-family:\'Prompt\';">บัญชีถูกระงับ</h4><p class="text-muted small">บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ</p></div>', showConfirmButton: true, confirmButtonText: 'ตกลง', buttonsStyling: false, customClass: { popup: 'premium-alert', confirmButton: 'swal2-confirm premium-btn premium-btn-danger' } });
                    btnLogin.innerHTML = originalBtnHtml; btnLogin.disabled = false;
                    return;
                }

                if (document.getElementById('login-remember').checked) localStorage.setItem('dialysis_remember_username', validUser.username);
                else localStorage.removeItem('dialysis_remember_username');

                const sessionData = { id: validUser.id, username: validUser.username, name: validUser.name, role: validUser.role, login_time: new Date().getTime() };
                localStorage.setItem('dialysis_user_session', JSON.stringify(sessionData));
                App.currentUser = validUser;
                document.getElementById('anti-flash-style')?.remove();

                Swal.fire({ 
                    html: `<div class="mt-2"><i class="fa-solid fa-circle-check fa-4x text-success mb-3"></i><h4 class="fw-bold text-dark" style="font-family:'Prompt';">เข้าสู่ระบบสำเร็จ</h4><p class="text-muted small">ยินดีต้อนรับคุณ <b>${validUser.name}</b></p></div>`, 
                    timer: 1200, showConfirmButton: false, customClass: { popup: 'premium-alert' }
                }).then(() => App.switchPage('dashboard'));
                
            } else {
                Swal.fire({ html: '<div class="mt-2"><i class="fa-solid fa-circle-xmark fa-4x text-danger mb-3"></i><h4 class="fw-bold text-dark" style="font-family:\'Prompt\';">ล็อคอินล้มเหลว</h4><p class="text-muted small">รหัสผ่านไม่ถูกต้อง หรือไม่พบชื่อผู้ใช้งานนี้ในระบบ!</p></div>', showConfirmButton: true, confirmButtonText: 'ลองใหม่อีกครั้ง', buttonsStyling: false, customClass: { popup: 'premium-alert', confirmButton: 'swal2-confirm premium-btn premium-btn-danger' } });
                btnLogin.innerHTML = originalBtnHtml; btnLogin.disabled = false;
                document.getElementById('login-password').value = '';
            }
        } catch (error) { Swal.fire({ title: 'ข้อผิดพลาดเครือข่าย', text: 'ไม่สามารถเปิดประตูฐานข้อมูลได้ กรุณาตรวจสอบอินเทอร์เน็ต', icon: 'error', customClass: { popup: 'premium-alert' } }); btnLogin.innerHTML = originalBtnHtml; btnLogin.disabled = false; }
    }

    forgotPassword() {
        Swal.fire({
            title: '<h4 class="fw-bold text-primary mb-0" style="font-family:\'Prompt\';"><i class="fa-solid fa-unlock-keyhole me-2"></i> ขอรีเซ็ตรหัสผ่าน</h4>',
            html: '<div class="text-start mt-3" style="font-family:\'Sarabun\';"><label class="form-label fw-bold small text-secondary">กรุณาระบุ Username (ไอดี) ของคุณ</label><input type="text" id="swal-reset-username" class="form-control input-modern text-center fw-bold fs-5 mt-2" value="admin" onfocus="this.select()" placeholder="กรอก Username"></div>',
            showCancelButton: true, confirmButtonText: 'ถัดไป <i class="fa-solid fa-arrow-right ms-1"></i>', cancelButtonText: 'ยกเลิก', buttonsStyling: false, customClass: { popup: 'premium-alert', confirmButton: 'swal2-confirm premium-btn mx-2', cancelButton: 'swal2-cancel premium-btn-cancel mx-2' },
            preConfirm: () => { const username = document.getElementById('swal-reset-username').value.trim(); if(!username) { Swal.showValidationMessage('กรุณาระบุ Username'); return false; } return username; }
        }).then(async (result) => {
            if(result.isConfirmed) {
                const targetUsername = result.value; Swal.fire({title: 'กำลังตรวจสอบ...', didOpen: () => Swal.showLoading(), customClass: { popup: 'premium-alert' }});
                try {
                    if(typeof firebase !== 'undefined' && firebase.auth) { if(firebase.auth().currentUser === null) { await firebase.auth().signInAnonymously(); } }
                    const [usersSnap, settingsSnap] = await Promise.all([ db.ref('clinic_users_v2').once('value'), db.ref('clinic_settings_v2/admin_pin').once('value') ]);
                    const usersData = usersSnap.val() || []; const adminPin = settingsSnap.val();
                    let usersArray = Array.isArray(usersData) ? usersData : Object.keys(usersData).map(k => usersData[k]);
                    let userIndex = usersArray.findIndex(u => u && u.username.toLowerCase() === targetUsername.toLowerCase());
                    
                    if(userIndex === -1) { Swal.fire({ html: `<div class="mt-2"><i class="fa-solid fa-user-xmark fa-4x text-danger mb-3"></i><h4 class="fw-bold text-dark" style="font-family:'Prompt';">ไม่พบผู้ใช้</h4><p class="text-muted small">ไม่มีไอดี <b>${targetUsername}</b>ในระบบ</p></div>`, showConfirmButton: true, confirmButtonText: 'ตกลง', buttonsStyling: false, customClass: { popup: 'premium-alert', confirmButton: 'swal2-confirm premium-btn premium-btn-danger' } }); return; }
                    if(!adminPin) { Swal.fire({ html: '<div class="mt-2"><i class="fa-solid fa-triangle-exclamation fa-4x text-warning mb-3"></i><h4 class="fw-bold text-dark" style="font-family:\'Prompt\';">ระบบยังไม่พร้อม</h4><p class="text-muted small">ผู้ดูแลระบบยังไม่ได้ตั้งค่า <b>Admin PIN</b><br>โปรดไปตั้งค่าที่เมนูตั้งค่าคลินิกก่อนครับ</p></div>', showConfirmButton: true, confirmButtonText: 'ตกลง', buttonsStyling: false, customClass: { popup: 'premium-alert', confirmButton: 'swal2-confirm premium-btn' } }); return; }
                    
                    Swal.fire({
                        title: '<h4 class="text-danger fw-bold" style="font-family:\'Prompt\';"><i class="fa-solid fa-shield-halved me-2"></i> ยืนยันสิทธิ์ Admin</h4>',
                        html: `<p class="small text-muted mb-3" style="font-family:'Sarabun';">กรุณาให้ผู้ดูแลระบบกรอก <b>Admin PIN</b> เพื่ออนุมัติการรีเซ็ตรหัสผ่านให้ไอดี <b class="text-primary">${targetUsername}</b></p><input type="password" id="swal-auth-pin" class="form-control input-modern text-center fw-bold text-danger fs-3 tracking-widest" placeholder="******" maxlength="6" oninput="this.value=this.value.replace(/[^0-9]/g,'')">`,
                        showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-check me-1"></i> ยืนยัน PIN', cancelButtonText: 'ยกเลิก', buttonsStyling: false, customClass: { popup: 'premium-alert', confirmButton: 'swal2-confirm premium-btn premium-btn-danger mx-2', cancelButton: 'swal2-cancel premium-btn-cancel mx-2' },
                        preConfirm: () => { const enteredPin = document.getElementById('swal-auth-pin').value; if(enteredPin !== adminPin.toString()) { Swal.showValidationMessage('PIN ไม่ถูกต้อง ไม่อนุญาตให้เปลี่ยนรหัส!'); return false; } return true; }
                    }).then((pinResult) => {
                        if(pinResult.isConfirmed) {
                            Swal.fire({
                                title: '<h5 class="fw-bold text-success mb-0" style="font-family:\'Prompt\';"><i class="fa-solid fa-key me-2"></i> ตั้งรหัสผ่านใหม่</h5>',
                                html: '<div class="text-start mt-3" style="font-family:\'Sarabun\';"><label class="form-label small text-secondary fw-bold">รหัสผ่านใหม่ (New Password)</label><input type="password" id="swal-new-pwd" class="form-control input-modern mb-3"><label class="form-label small text-secondary fw-bold">ยืนยันรหัสผ่านใหม่อีกครั้ง</label><input type="password" id="swal-confirm-pwd" class="form-control input-modern"></div>',
                                showCancelButton: true, confirmButtonText: 'เปลี่ยนรหัสผ่าน', cancelButtonText: 'ยกเลิก', buttonsStyling: false, customClass: { popup: 'premium-alert', confirmButton: 'swal2-confirm premium-btn mx-2', cancelButton: 'swal2-cancel premium-btn-cancel mx-2' },
                                preConfirm: () => {
                                    const p1 = document.getElementById('swal-new-pwd').value; const p2 = document.getElementById('swal-confirm-pwd').value;
                                    if(p1.length < 6) { Swal.showValidationMessage('รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร'); return false; }
                                    if(p1 !== p2) { Swal.showValidationMessage('รหัสผ่านไม่ตรงกัน'); return false; } return p1;
                                }
                            }).then((pwdResult) => {
                                if(pwdResult.isConfirmed) {
                                    Swal.fire({title: 'กำลังอัปเดตระบบ...', didOpen: () => Swal.showLoading(), customClass: { popup: 'premium-alert' }});
                                    usersArray[userIndex].password = pwdResult.value;
                                    db.ref('clinic_users_v2').set(usersArray).then(() => { Swal.fire({ html: '<div class="mt-2"><i class="fa-solid fa-check-circle fa-4x text-success mb-3"></i><h4 class="fw-bold text-dark" style="font-family:\'Prompt\';">เปลี่ยนรหัสผ่านสำเร็จ!</h4><p class="text-muted small">กรุณาใช้รหัสผ่านใหม่เพื่อเข้าสู่ระบบ</p></div>', showConfirmButton: true, confirmButtonText: 'กลับไปหน้าล็อคอิน', buttonsStyling: false, customClass: { popup: 'premium-alert', confirmButton: 'swal2-confirm premium-btn' } }).then(() => { LoginPage.init(); }); });
                                }
                            });
                        }
                    });
                } catch(e) { Swal.fire({ title: 'เกิดข้อผิดพลาด', text: 'ระบบถูกล็อคอยู่ กรุณาติดต่อผู้ดูแลระบบ', icon: 'error', customClass: { popup: 'premium-alert' }}); }
            }
        });
    }
}

// 🌐 Expose Component สู่ระบบ Router
const LoginPage = new LoginPageComponent();
window.LoginPage = LoginPage;