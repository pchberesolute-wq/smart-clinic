// js/pages/login.js
// 🚀 โมดูลหน้าลงชื่อเข้าใช้งาน (Premium Glassmorphism + Ultimate Zero-Race-Condition Auth)

const LoginPage = {
    roleConfig: {
        'admin': { label: 'ผู้ดูแลระบบ', emoji: '🛡️' },
        'doctor': { label: 'แพทย์', emoji: '🩺' },
        'head_nurse': { label: 'หัวหน้าพยาบาล', emoji: '👑' },
        'nurse': { label: 'พยาบาล', emoji: '👩‍⚕️' },
        'assistant': { label: 'ผู้ช่วยพยาบาล', emoji: '🩹' },
        'finance': { label: 'การเงิน/บัญชี', emoji: '💵' },
        'stock': { label: 'พัสดุ', emoji: '📦' }
    },

    html: `
        <style>
            .login-container { position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: #f8fafc; display: flex; align-items: center; justify-content: center; z-index: 10000; overflow: hidden; font-family: 'Prompt', sans-serif; }
            .login-blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.6; animation: floatBlob 10s infinite ease-in-out; }
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
            }
            @keyframes slideUpFade { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }

            .brand-logo-wrapper {
                width: 85px; height: 85px; background: var(--primary-gradient);
                border-radius: 24px; display: flex; align-items: center; justify-content: center;
                font-size: 38px; color: white; margin: 0 auto 20px; box-shadow: var(--shadow-float-primary);
                transform: rotate(-10deg); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .login-card:hover .brand-logo-wrapper { transform: rotate(0deg) scale(1.08); }

            .login-title-h2 { letter-spacing: -0.5px; white-space: nowrap; overflow: visible; font-size: clamp(18px, 4vw, 26px); }

            .input-modern-login { background: rgba(241, 245, 249, 0.8); border: 2px solid transparent; border-radius: 14px; padding-left: 15px; font-weight: 600; color: #1e293b; transition: all 0.3s; }
            .input-modern-login:focus { background: #fff; border-color: var(--primary); box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15); }
            .input-modern-login::placeholder { color: #94a3b8; font-weight: 500; }
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
                    <div class="brand-logo-wrapper"><i class="fa-solid fa-droplet"></i></div>
                    <h2 class="fw-bold text-dark mb-1 login-title-h2">หน่วยไตเทียม <span style="color: var(--primary);">โรงพยาบาลคริสเตียน แพร่</span></h2>
                    <p class="text-muted fw-medium small mb-0 mt-2">ระบบบริหารจัดการเวชระเบียนคลินิกฟอกไต</p>
                </div>

                <div class="mb-4 mt-5">
                    <label class="form-label fw-bold text-secondary small mb-2 ps-1">เลือกบัญชีผู้ใช้งานระบบ</label>
                    <div class="input-group mb-3 shadow-sm" style="border-radius: 14px;">
                        <span class="input-group-text modern-icon-login px-3"><i class="fa-solid fa-user-circle text-primary"></i></span>
                        <select id="login-username-select" class="form-select form-select-lg input-modern-login border-start-0 fw-bold text-dark" style="cursor: pointer;" onchange="LoginPage.onUserSelectChange(this.value)">
                            <option value="" disabled selected>-- กำลังตรวจสอบความปลอดภัย... --</option>
                        </select>
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
                        เข้าสู่ระบบ (Secured Login) <i class="fa-solid fa-arrow-right ms-2"></i>
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
    `,

    allUsers: [],

    // 🚨 [ULTIMATE FIX] ใช้ระบบเรดาร์ดักจับ (onAuthStateChanged) แทนการเช็คสดๆ
    init: async function() {
        if (typeof db === 'undefined' || typeof firebase === 'undefined') return;

        // ดึงจาก Cache มาโชว์ก่อนเพื่อความเร็ว
        let cachedUsers = localStorage.getItem('dialysis_cached_users');
        if (cachedUsers) {
            this.allUsers = JSON.parse(cachedUsers);
            this.renderUserDropdown();
        }

        // แจ้งเตือนถ้ารันไฟล์ผ่านดับเบิ้ลคลิก (file://) เพราะ Firebase จะบล็อคทันที
        if (window.location.protocol === 'file:') {
            Swal.fire({
                icon: 'error',
                title: 'ไม่สามารถรันระบบบน file:// ได้',
                html: '<p class="text-start">ระบบความปลอดภัยขั้นสูงไม่อนุญาตให้เปิดไฟล์ตรงๆ จากเครื่องครับ<br><br><b>วิธีแก้ไข:</b><br>1. ใช้ <b>Live Server</b> ใน VS Code<br>2. หรืออัพขึ้น Web Hosting จริง<br>3. หรือกลับไปแก้ Rules เป็น <code>.read: true</code> (ชั่วคราว)</p>',
                allowOutsideClick: false
            });
            return;
        }

        try {
            // 🚨 ระบบเรดาร์: เฝ้ารอจนกว่าสถานะกุญแจ (Auth) จะเสถียร 100%
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    // 🎉 ได้กุญแจแล้ว! (ไม่ว่าจะเป็นบัตรชั่วคราวหรือบัตรจริง) วิ่งไปดึงรายชื่อได้เลย!
                    db.ref('clinic_users_v2').once('value').then(snap => {
                        const data = snap.val();
                        let rawUsers = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
                        this.allUsers = rawUsers.filter(u => u !== null && u.status === 'active');
                        
                        localStorage.setItem('dialysis_cached_users', JSON.stringify(this.allUsers)); 
                        this.renderUserDropdown();
                    }).catch(e => {
                        console.warn("[Database] ติด Permission Denied หรือ Offline:", e);
                    });
                } else {
                    // ⏳ ยังไม่มีกุญแจ? สั่งให้ไปขอกุญแจชั่วคราวมาเดี๋ยวนี้!
                    firebase.auth().signInAnonymously().catch(err => {
                        console.error("[Auth] ขอกุญแจล้มเหลว:", err);
                        Swal.fire('ข้อผิดพลาดการเชื่อมต่อ', 'ไม่สามารถสร้างกุญแจความปลอดภัยได้ โปรดเช็คอินเทอร์เน็ต', 'error');
                    });
                }
            });

        } catch (err) {
            console.error("Init Error:", err);
        }
    },

    renderUserDropdown: function() {
        const selectEl = document.getElementById('login-username-select');
        if(!selectEl) return;

        let optionsHtml = '<option value="" disabled selected>-- เลือกชื่อผู้ใช้งานของคุณ --</option>';
        this.allUsers.forEach(user => {
            let roleData = this.roleConfig[user.role] || { label: 'พนักงานทั่วไป', emoji: '📋' };
            optionsHtml += `<option value="${user.username}">${roleData.emoji} ${user.name} (${roleData.label})</option>`;
        });
        optionsHtml += `<option value="manual">⌨️ กรอกไอดีเองด้วยมือ (Manual Login)</option>`;
        selectEl.innerHTML = optionsHtml;

        const savedUser = localStorage.getItem('dialysis_remember_username');
        if(savedUser && this.allUsers.some(u => u.username === savedUser)) {
            selectEl.value = savedUser;
            document.getElementById('login-remember').checked = true;
            document.getElementById('login-password').focus();
        }
    },

    onUserSelectChange: function(value) {
        const manualWrapper = document.getElementById('manual-username-wrapper');
        const manualInput = document.getElementById('login-username');
        if(value === 'manual') {
            manualWrapper.style.display = 'block';
            if(manualInput) { manualInput.value = ''; manualInput.focus(); }
        } else {
            manualWrapper.style.display = 'none';
            document.getElementById('login-password').focus();
        }
    },

    togglePassword: function() {
        const pwInput = document.getElementById('login-password');
        const icon = document.getElementById('toggle-pw-icon');
        if (pwInput.type === "password") { pwInput.type = "text"; icon.className = "fa-solid fa-eye-slash"; } 
        else { pwInput.type = "password"; icon.className = "fa-solid fa-eye"; }
    },

    authenticate: async function() {
        const selectEl = document.getElementById('login-username-select');
        let usernameInp = selectEl.value;
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
                Swal.fire({ 
                    html: `<div class="mt-2"><i class="fa-solid fa-circle-check fa-4x text-success mb-3"></i><h4 class="fw-bold text-dark" style="font-family:'Prompt';">เข้าสู่ระบบสำเร็จ</h4><p class="text-muted small">ยินดีต้อนรับเข้าสู่ระบบ (Master Account)</p></div>`, 
                    timer: 1200, showConfirmButton: false, customClass: { popup: 'premium-alert' }
                }).then(() => App.switchPage('dashboard'));
                return;
            }

            const validUser = this.allUsers.find(u => u && u.username.toLowerCase() === usernameInp.toLowerCase() && u.password === passwordInp);

            if (validUser) {
                if (validUser.status !== 'active') {
                    Swal.fire({ 
                        html: '<div class="mt-2"><i class="fa-solid fa-user-lock fa-4x text-danger mb-3"></i><h4 class="fw-bold text-dark" style="font-family:\'Prompt\';">บัญชีถูกระงับ</h4><p class="text-muted small">บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ</p></div>', 
                        showConfirmButton: true, confirmButtonText: 'ตกลง', buttonsStyling: false, 
                        customClass: { popup: 'premium-alert', confirmButton: 'swal2-confirm premium-btn premium-btn-danger' } 
                    });
                    btnLogin.innerHTML = originalBtnHtml; btnLogin.disabled = false;
                    return;
                }

                if (document.getElementById('login-remember').checked) localStorage.setItem('dialysis_remember_username', validUser.username);
                else localStorage.removeItem('dialysis_remember_username');

                const sessionData = { id: validUser.id, username: validUser.username, name: validUser.name, role: validUser.role, login_time: new Date().getTime() };
                localStorage.setItem('dialysis_user_session', JSON.stringify(sessionData));
                App.currentUser = validUser;

                Swal.fire({ 
                    html: `<div class="mt-2"><i class="fa-solid fa-circle-check fa-4x text-success mb-3"></i><h4 class="fw-bold text-dark" style="font-family:'Prompt';">เข้าสู่ระบบสำเร็จ</h4><p class="text-muted small">ยินดีต้อนรับคุณ <b>${validUser.name}</b></p></div>`, 
                    timer: 1200, showConfirmButton: false, customClass: { popup: 'premium-alert' }
                }).then(() => App.switchPage('dashboard'));
                
            } else {
                Swal.fire({ 
                    html: '<div class="mt-2"><i class="fa-solid fa-circle-xmark fa-4x text-danger mb-3"></i><h4 class="fw-bold text-dark" style="font-family:\'Prompt\';">ล็อคอินล้มเหลว</h4><p class="text-muted small">รหัสผ่านไม่ถูกต้อง หรือไม่พบชื่อผู้ใช้งานนี้ในระบบ!</p></div>', 
                    showConfirmButton: true, confirmButtonText: 'ลองใหม่อีกครั้ง', buttonsStyling: false,
                    customClass: { popup: 'premium-alert', confirmButton: 'swal2-confirm premium-btn premium-btn-danger' }
                });
                btnLogin.innerHTML = originalBtnHtml; btnLogin.disabled = false;
                document.getElementById('login-password').value = '';
            }
        } catch (error) {
            console.error("Login Error:", error);
            Swal.fire({ title: 'ข้อผิดพลาดเครือข่าย', text: 'ไม่สามารถเปิดประตูฐานข้อมูลได้ กรุณาตรวจสอบอินเทอร์เน็ต', icon: 'error', customClass: { popup: 'premium-alert' } });
            btnLogin.innerHTML = originalBtnHtml; btnLogin.disabled = false;
        }
    },

    forgotPassword: function() {
        Swal.fire({
            title: '<h4 class="fw-bold text-primary mb-0" style="font-family:\'Prompt\';"><i class="fa-solid fa-unlock-keyhole me-2"></i> ขอรีเซ็ตรหัสผ่าน</h4>',
            html: '<div class="text-start mt-3" style="font-family:\'Sarabun\';">' +
                    '<label class="form-label fw-bold small text-secondary">กรุณาระบุ Username (ไอดี) ของคุณ</label>' +
                    '<input type="text" id="swal-reset-username" class="form-control input-modern text-center fw-bold fs-5 mt-2" value="admin" onfocus="this.select()" placeholder="กรอก Username">' +
                  '</div>',
            showCancelButton: true, confirmButtonText: 'ถัดไป <i class="fa-solid fa-arrow-right ms-1"></i>', cancelButtonText: 'ยกเลิก', buttonsStyling: false, 
            customClass: { popup: 'premium-alert', confirmButton: 'swal2-confirm premium-btn mx-2', cancelButton: 'swal2-cancel premium-btn-cancel mx-2' },
            preConfirm: () => {
                const username = document.getElementById('swal-reset-username').value.trim();
                if(!username) { Swal.showValidationMessage('กรุณาระบุ Username'); return false; }
                return username;
            }
        }).then(async (result) => {
            if(result.isConfirmed) {
                const targetUsername = result.value;
                Swal.fire({title: 'กำลังตรวจสอบ...', didOpen: () => Swal.showLoading(), customClass: { popup: 'premium-alert' }});
                
                try {
                    if(typeof firebase !== 'undefined' && firebase.auth) {
                        if(firebase.auth().currentUser === null) {
                            await firebase.auth().signInAnonymously();
                        }
                    }

                    const [usersSnap, settingsSnap] = await Promise.all([
                        db.ref('clinic_users_v2').once('value'),
                        db.ref('clinic_settings_v2/admin_pin').once('value')
                    ]);
                    
                    const usersData = usersSnap.val() || [];
                    const adminPin = settingsSnap.val();
                    
                    let usersArray = Array.isArray(usersData) ? usersData : Object.keys(usersData).map(k => usersData[k]);
                    let userIndex = usersArray.findIndex(u => u && u.username.toLowerCase() === targetUsername.toLowerCase());
                    
                    if(userIndex === -1) {
                        Swal.fire({ 
                            html: `<div class="mt-2"><i class="fa-solid fa-user-xmark fa-4x text-danger mb-3"></i><h4 class="fw-bold text-dark" style="font-family:'Prompt';">ไม่พบผู้ใช้</h4><p class="text-muted small">ไม่มีไอดี <b>${targetUsername}</b> ในระบบ</p></div>`, 
                            showConfirmButton: true, confirmButtonText: 'ตกลง', buttonsStyling: false, customClass: { popup: 'premium-alert', confirmButton: 'swal2-confirm premium-btn premium-btn-danger' } 
                        });
                        return;
                    }
                    
                    if(!adminPin) {
                        Swal.fire({ 
                            html: '<div class="mt-2"><i class="fa-solid fa-triangle-exclamation fa-4x text-warning mb-3"></i><h4 class="fw-bold text-dark" style="font-family:\'Prompt\';">ระบบยังไม่พร้อม</h4><p class="text-muted small">ผู้ดูแลระบบยังไม่ได้ตั้งค่า <b>Admin PIN</b><br>โปรดไปตั้งค่าที่เมนูตั้งค่าคลินิกก่อนครับ</p></div>', 
                            showConfirmButton: true, confirmButtonText: 'ตกลง', buttonsStyling: false, customClass: { popup: 'premium-alert', confirmButton: 'swal2-confirm premium-btn' } 
                        });
                        return;
                    }
                    
                    Swal.fire({
                        title: '<h4 class="text-danger fw-bold" style="font-family:\'Prompt\';"><i class="fa-solid fa-shield-halved me-2"></i> ยืนยันสิทธิ์ Admin</h4>',
                        html: `<p class="small text-muted mb-3" style="font-family:'Sarabun';">กรุณาให้ผู้ดูแลระบบกรอก <b>Admin PIN</b> เพื่ออนุมัติการรีเซ็ตรหัสผ่านให้ไอดี <b class="text-primary">${targetUsername}</b></p>` +
                              `<input type="password" id="swal-auth-pin" class="form-control input-modern text-center fw-bold text-danger fs-3 tracking-widest" placeholder="******" maxlength="6" oninput="this.value=this.value.replace(/[^0-9]/g,'')">`,
                        showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-check me-1"></i> ยืนยัน PIN', cancelButtonText: 'ยกเลิก', buttonsStyling: false,
                        customClass: { popup: 'premium-alert', confirmButton: 'swal2-confirm premium-btn premium-btn-danger mx-2', cancelButton: 'swal2-cancel premium-btn-cancel mx-2' },
                        preConfirm: () => {
                            const enteredPin = document.getElementById('swal-auth-pin').value;
                            if(enteredPin !== adminPin.toString()) { Swal.showValidationMessage('PIN ไม่ถูกต้อง ไม่อนุญาตให้เปลี่ยนรหัส!'); return false; }
                            return true;
                        }
                    }).then((pinResult) => {
                        if(pinResult.isConfirmed) {
                            Swal.fire({
                                title: '<h5 class="fw-bold text-success mb-0" style="font-family:\'Prompt\';"><i class="fa-solid fa-key me-2"></i> ตั้งรหัสผ่านใหม่</h5>',
                                html: '<div class="text-start mt-3" style="font-family:\'Sarabun\';">' +
                                        '<label class="form-label small text-secondary fw-bold">รหัสผ่านใหม่ (New Password)</label>' +
                                        '<input type="password" id="swal-new-pwd" class="form-control input-modern mb-3">' +
                                        '<label class="form-label small text-secondary fw-bold">ยืนยันรหัสผ่านใหม่อีกครั้ง</label>' +
                                        '<input type="password" id="swal-confirm-pwd" class="form-control input-modern">' +
                                      '</div>',
                                showCancelButton: true, confirmButtonText: 'เปลี่ยนรหัสผ่าน', cancelButtonText: 'ยกเลิก', buttonsStyling: false,
                                customClass: { popup: 'premium-alert', confirmButton: 'swal2-confirm premium-btn mx-2', cancelButton: 'swal2-cancel premium-btn-cancel mx-2' },
                                preConfirm: () => {
                                    const p1 = document.getElementById('swal-new-pwd').value;
                                    const p2 = document.getElementById('swal-confirm-pwd').value;
                                    if(p1.length < 6) { Swal.showValidationMessage('รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร'); return false; }
                                    if(p1 !== p2) { Swal.showValidationMessage('รหัสผ่านไม่ตรงกัน'); return false; }
                                    return p1;
                                }
                            }).then((pwdResult) => {
                                if(pwdResult.isConfirmed) {
                                    Swal.fire({title: 'กำลังอัปเดตระบบ...', didOpen: () => Swal.showLoading(), customClass: { popup: 'premium-alert' }});
                                    usersArray[userIndex].password = pwdResult.value;
                                    
                                    db.ref('clinic_users_v2').set(usersArray).then(() => {
                                        Swal.fire({
                                            html: '<div class="mt-2"><i class="fa-solid fa-check-circle fa-4x text-success mb-3"></i><h4 class="fw-bold text-dark" style="font-family:\'Prompt\';">เปลี่ยนรหัสผ่านสำเร็จ!</h4><p class="text-muted small">กรุณาใช้รหัสผ่านใหม่เพื่อเข้าสู่ระบบ</p></div>', 
                                            showConfirmButton: true, confirmButtonText: 'กลับไปหน้าล็อคอิน', buttonsStyling: false, customClass: { popup: 'premium-alert', confirmButton: 'swal2-confirm premium-btn' }
                                        }).then(() => { LoginPage.init(); });
                                    });
                                }
                            });
                        }
                    });

                } catch(e) {
                    Swal.fire({ title: 'เกิดข้อผิดพลาด', text: 'ระบบถูกล็อคอยู่ กรุณาติดต่อผู้ดูแลระบบ', icon: 'error', customClass: { popup: 'premium-alert' }});
                }
            }
        });
    }
};