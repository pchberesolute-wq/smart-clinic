// js/main.js
// 🚀 ตัวควบคุมหลักของระบบ (Router, Auth Guard, RBAC Display, Auto-Logout & Native Toast Error Handler)

const App = {
    currentUser: null,
    idleTimeout: null,
    isLocked: false,
    lockTimeLimit: 15 * 60 * 1000, 
    lockClockInterval: null, 

    getPages: function() {
        return {
            login: typeof LoginPage !== 'undefined' ? LoginPage : null,
            dashboard: typeof DashboardPage !== 'undefined' ? DashboardPage : null,
            patients: typeof PatientsPage !== 'undefined' ? PatientsPage : null,
            patient_status: typeof PatientStatusPage !== 'undefined' ? PatientStatusPage : null, 
            patient_form: typeof PatientFormPage !== 'undefined' ? PatientFormPage : null,
            patient_history: typeof PatientHistoryPage !== 'undefined' ? PatientHistoryPage : null, 
            visit_detail: typeof VisitDetailPage !== 'undefined' ? VisitDetailPage : null, 
            visits: typeof VisitsPage !== 'undefined' ? VisitsPage : null,
            settings: typeof SettingsPage !== 'undefined' ? SettingsPage : null,
            search_copy: typeof SearchCopyPage !== 'undefined' ? SearchCopyPage : null,
            inventory: typeof InventoryPage !== 'undefined' ? InventoryPage : null,
            stock_forecast: typeof StockForecastPage !== 'undefined' ? StockForecastPage : null,
            stock_manage: typeof StockManagePage !== 'undefined' ? StockManagePage : null,
            stock_history: typeof StockHistoryPage !== 'undefined' ? StockHistoryPage : null,
            monthly_requisition: typeof MonthlyRequisitionPage !== 'undefined' ? MonthlyRequisitionPage : null,
            usage_statistics: typeof UsageStatisticsPage !== 'undefined' ? UsageStatisticsPage : null,
            finance: typeof FinancePage !== 'undefined' ? FinancePage : null,
            department_ledger: typeof DepartmentLedgerPage !== 'undefined' ? DepartmentLedgerPage : null,
            document_center: typeof DocumentCenterPage !== 'undefined' ? DocumentCenterPage : null 
        };
    },

    switchPage: function(pageName, element, payload = null) {
        const sidebar = document.getElementById('sidebar');
        const topbar = document.querySelector('.topbar');
        const mainContent = document.querySelector('.main-content');
        const appContent = document.getElementById('app-content');

        if (pageName !== 'login') {
            if(sidebar) sidebar.style.display = '';
            if(topbar) topbar.style.display = '';
            if(mainContent) mainContent.style.marginLeft = '';
            if(appContent) appContent.style.padding = '';
            
            if (!this.currentUser && localStorage.getItem('dialysis_user_session')) {
                this.checkAuth();
            }
        } else {
            if(sidebar) sidebar.style.display = 'none';
            if(topbar) topbar.style.display = 'none';
            if(mainContent) mainContent.style.marginLeft = '0';
            if(appContent) appContent.style.padding = '0';
        }

        if (element) {
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            element.classList.add('active');
        } else {
            document.querySelectorAll('.nav-item').forEach(el => {
                el.classList.remove('active');
                if (el.getAttribute('onclick') && el.getAttribute('onclick').includes(`'${pageName}'`)) {
                    el.classList.add('active');
                }
            });
        }

        if (!appContent) return;
        
        appContent.style.opacity = 0; 
        
        setTimeout(() => {
            const availablePages = this.getPages();
            const pageModule = availablePages[pageName];
            
            if (pageModule && pageModule.html) {
                appContent.innerHTML = pageModule.html;
                if (pageModule.init) {
                    try { pageModule.init(payload); } 
                    catch (error) { console.error(`Error initializing page [${pageName}]:`, error); }
                }
            } else {
                appContent.innerHTML = `
                    <div class="text-center py-5 shadow-sm mx-auto mt-5" style="max-width: 600px; background:#fff; border-radius:16px; border:1px solid #e2e8f0;">
                        <i class="fa-solid fa-triangle-exclamation fa-4x text-warning mb-4"></i>
                        <h3 class="fw-bold text-dark" style="font-family:'Prompt';">ฟังก์ชัน [${pageName}] ยังไม่พร้อมใช้งาน</h3>
                        <p class="text-muted mb-0">โปรดตรวจสอบว่าได้โหลดสคริปต์หน้าเพจนี้ในไฟล์ index.html เรียบร้อยแล้ว</p>
                    </div>`;
            }
            appContent.style.opacity = 1; 
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 150);
    },

    logout: function() {
        Swal.fire({
            title: 'ออกจากระบบ?',
            text: "คุณต้องการออกจากระบบเวชระเบียนใช่หรือไม่?",
            icon: 'question',
            showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#cbd5e1',
            confirmButtonText: '<i class="fa-solid fa-sign-out-alt me-2"></i> ออกจากระบบ', cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'shadow-lg border rounded-4' }
        }).then((result) => {
            if (result.isConfirmed) {
                if(this.lockClockInterval) clearInterval(this.lockClockInterval);
                localStorage.removeItem('dialysis_user_session');
                localStorage.removeItem('dialysis_is_locked'); 
                sessionStorage.removeItem('dialysis_session_active'); 
                window.location.reload(); 
            }
        });
    },

    resetIdleTimer: function() {
        if (this.isLocked) return;
        clearTimeout(this.idleTimeout);
        this.idleTimeout = setTimeout(() => this.lockScreen(), this.lockTimeLimit);
    },

    setupIdleTimer: function() {
        if (!this.currentUser) return;
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        events.forEach(event => window.addEventListener(event, () => this.resetIdleTimer()));
        this.resetIdleTimer(); 
    },

    // 🌟 THE FIX: ฟังก์ชันแจ้งเตือนอัจฉริยะแบบ Native 🌟
    showLockScreenToast: function(message) {
        const toast = document.getElementById('lock-screen-toast');
        const toastText = document.getElementById('lock-screen-toast-text');
        if(!toast || !toastText) return;

        toastText.innerText = message;
        toast.classList.add('show');

        // สไลด์ออกเมื่อครบ 2.5 วินาที
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    },

    lockScreen: function() {
        this.isLocked = true;
        localStorage.setItem('dialysis_is_locked', 'true'); 
        
        let overlay = document.getElementById('lock-screen-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'lock-screen-overlay';
            // พื้นหลังสีดำทึบโปร่งแสง 95%
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
                background: rgba(15, 23, 42, 0.95); 
                z-index: 99999; display: flex; align-items: center; justify-content: center;
                font-family: 'Prompt', sans-serif;
            `;
            document.body.appendChild(overlay);
        }

        const userImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser.name)}&background=2563eb&color=fff&bold=true`;

        // 🚨 ฝังกล่องแจ้งเตือน Native Toast ไว้ด้านบนสุด 🚨
        overlay.innerHTML = `
            <style>
                @keyframes slideDownFadeSafe { from { opacity: 0; transform: translate3d(0, -30px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
                
                .lock-custom-toast {
                    position: absolute;
                    top: 20px;
                    left: 50%;
                    transform: translate3d(-50%, -150%, 0);
                    background: #ffffff;
                    border: 2px solid #ef4444;
                    box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.2);
                    border-radius: 50px;
                    padding: 10px 25px;
                    font-family: 'Prompt', sans-serif;
                    color: #0f172a;
                    font-weight: 700;
                    font-size: 15px;
                    z-index: 9999999;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    opacity: 0;
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15), opacity 0.3s ease;
                    pointer-events: none;
                }
                .lock-custom-toast.show {
                    transform: translate3d(-50%, 0, 0);
                    opacity: 1;
                }
            </style>

            <div id="lock-screen-toast" class="lock-custom-toast">
                <div class="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center shadow-sm" style="width:26px; height:26px;">
                    <i class="fa-solid fa-exclamation" style="font-size:13px;"></i>
                </div>
                <span id="lock-screen-toast-text">ข้อความแจ้งเตือน</span>
            </div>

            <div class="text-center" style="width: 100%; max-width: 420px; padding: 40px; background: #ffffff; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); animation: slideDownFadeSafe 0.4s ease forwards; transform: translate3d(0,0,0); -webkit-transform: translate3d(0,0,0); position: relative;">
                
                <div class="mb-4">
                    <div id="lock-time-display" style="font-size: 3.5rem; font-weight: 800; color: #0f172a; line-height: 1; font-variant-numeric: tabular-nums; letter-spacing: -1px;">--:--:--</div>
                    <div id="lock-date-display" style="font-size: 1.1rem; font-weight: 600; color: #64748b; margin-top: 5px;">กำลังโหลด...</div>
                </div>

                <img src="${userImg}" class="rounded-circle mb-3 border border-3 border-white" style="width: 80px; height: 80px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <h4 class="fw-bold text-dark mb-1" style="font-family:'Prompt';">${this.currentUser.name}</h4>
                <p class="text-muted small mb-4"><i class="fa-solid fa-lock text-warning me-1"></i> หน้าจอถูกล็อคเนื่องจากไม่มีการใช้งาน</p>
                
                <div class="input-group mb-4" style="border-radius: 14px; overflow:hidden; background: #fff; border: 1px solid #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <span class="input-group-text bg-light border-0"><i class="fa-solid fa-key text-secondary"></i></span>
                    <input type="password" id="unlock-password" class="form-control form-control-lg border-0 fw-bold text-dark" placeholder="กรอกรหัสผ่านเพื่อปลดล็อค" onkeypress="if(event.key === 'Enter') App.unlockScreen()" style="outline:none; box-shadow:none; background:transparent;">
                </div>

                <button class="btn btn-primary btn-lg w-100 mb-3 fw-bold rounded-pill" id="btn-unlock" style="box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);" onclick="App.unlockScreen()">
                    <i class="fa-solid fa-unlock-keyhole me-2"></i> ปลดล็อคหน้าจอ
                </button>
                <button class="btn btn-light w-100 fw-bold rounded-pill text-danger border shadow-sm" onclick="App.logout()">
                    <i class="fa-solid fa-sign-out-alt me-1"></i> สลับบัญชีผู้ใช้ (Logout)
                </button>
            </div>
        `;
        
        if (this.lockClockInterval) clearInterval(this.lockClockInterval);
        const updateLockClock = () => {
            const now = new Date();
            const timeEl = document.getElementById('lock-time-display');
            const dateEl = document.getElementById('lock-date-display');
            if(timeEl) timeEl.innerText = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            if(dateEl) dateEl.innerText = now.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        };
        updateLockClock(); 
        this.lockClockInterval = setInterval(updateLockClock, 1000);

        setTimeout(() => {
            const pwInp = document.getElementById('unlock-password');
            if(pwInp) pwInp.focus();
        }, 100);
    },

    unlockScreen: function() {
        const pw = document.getElementById('unlock-password').value.trim();
        if (!pw) { 
            // 🚨 ใช้ Native Toast แทน ไม่พึ่งพา SweetAlert 🚨
            this.showLockScreenToast('กรุณากรอกรหัสผ่าน');
            return; 
        }

        const btn = document.getElementById('btn-unlock');
        const origText = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> ตรวจสอบ...`;
        btn.disabled = true;

        if (typeof db === 'undefined') { 
            this.showLockScreenToast('ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
            btn.innerHTML = origText; btn.disabled = false; 
            return; 
        }

        db.ref('clinic_users_v2').once('value').then(snap => {
            const data = snap.val();
            let rawUsers = data ? (Array.isArray(data) ? data : Object.keys(data).map(k => data[k])) : [];
            
            if (this.currentUser.id === 'MASTER_ADMIN' && pw === 'admin1234') {
                this.isLocked = false;
                if(this.lockClockInterval) clearInterval(this.lockClockInterval);
                localStorage.removeItem('dialysis_is_locked'); 
                document.getElementById('lock-screen-overlay').remove();
                this.resetIdleTimer();
                return;
            }

            let user = rawUsers.find(u => u.username.toLowerCase() === this.currentUser.username.toLowerCase() && u.password === pw && u.status === 'active');

            if (user) {
                this.isLocked = false;
                if(this.lockClockInterval) clearInterval(this.lockClockInterval); 
                localStorage.removeItem('dialysis_is_locked'); 
                document.getElementById('lock-screen-overlay').remove();
                this.resetIdleTimer();
            } else {
                // 🚨 เรียกใช้ Native Toast เมื่อรหัสผ่านผิด 🚨
                this.showLockScreenToast('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่');
                
                btn.innerHTML = origText; btn.disabled = false;
                document.getElementById('unlock-password').value = '';
                document.getElementById('unlock-password').focus();
            }
        }).catch(err => {
            this.showLockScreenToast('เกิดข้อผิดพลาดในการตรวจสอบ');
            btn.innerHTML = origText; btn.disabled = false;
        });
    },

    checkAuth: function() {
        let overlay = document.getElementById('lock-screen-overlay');
        if(overlay) overlay.remove();

        const sessionStr = localStorage.getItem('dialysis_user_session');
        const sidebar = document.getElementById('sidebar');
        const topbar = document.querySelector('.topbar');
        const mainContent = document.querySelector('.main-content');
        const appContent = document.getElementById('app-content');

        if (!sessionStr) {
            if(sidebar) sidebar.style.display = 'none';
            if(topbar) topbar.style.display = 'none';
            if(mainContent) mainContent.style.marginLeft = '0';
            if(appContent) appContent.style.padding = '0';
            
            this.switchPage('login');
            return false;
        }

        if(sidebar) sidebar.style.display = '';
        if(topbar) topbar.style.display = '';
        if(mainContent) mainContent.style.marginLeft = '';
        if(appContent) appContent.style.padding = '';

        this.currentUser = JSON.parse(sessionStr);
        const userInfoName = document.querySelector('.user-info h4');
        if (userInfoName) {
            const roleLabels = {
                'admin': '(ผู้ดูแลระบบ)',
                'doctor': '(แพทย์)',
                'head_nurse': '(หัวหน้าพยาบาล)',
                'nurse': '(พยาบาล)',
                'assistant': '(ผู้ช่วย PN/NA)',
                'finance': '(การเงิน/บัญชี)',
                'stock': '(เจ้าหน้าที่พัสดุ)'
            };
            let roleTitle = roleLabels[this.currentUser.role] || '(พนักงานทั่วไป)';
            userInfoName.innerText = `${this.currentUser.name} ${roleTitle}`;
            
            const avatar = document.querySelector('.user-avatar');
            if(avatar) {
                let initials = this.currentUser.name.substring(0, 2).toUpperCase();
                avatar.innerText = initials;
            }
        }

        this.setupIdleTimer();

        if (localStorage.getItem('dialysis_is_locked') === 'true') {
            this.lockScreen();
        }

        return true; 
    }
};

window.addEventListener('DOMContentLoaded', () => {
    if (!sessionStorage.getItem('dialysis_session_active')) {
        localStorage.removeItem('dialysis_user_session');
        localStorage.removeItem('dialysis_is_locked');
        sessionStorage.setItem('dialysis_session_active', 'true');
    }

    const isAuthenticated = App.checkAuth();
    if (!isAuthenticated) return; 

    const defaultMenu = document.querySelector('.nav-item.active') || document.querySelector('.nav-item');
    App.switchPage('dashboard', defaultMenu);

    setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
        
        const clockEl = document.getElementById('clockDisplay');
        if (clockEl) {
            clockEl.innerHTML = `
                <div style="display: flex; align-items: center; white-space: nowrap; font-variant-numeric: tabular-nums;">
                    <i class="fa-regular fa-clock" style="color:var(--primary); font-size:16px;"></i> 
                    <span style="color: var(--text-dark); font-size: 14.5px; margin-left: 8px; font-weight: 700;">${dateStr}</span> 
                    <span style="color: #cbd5e1; margin: 0 10px;">|</span> 
                    <span style="color: var(--primary); font-weight: 800; font-size: 15.5px; letter-spacing: 0.5px; width: 85px; display: inline-block; text-align: center;">${timeStr}</span>
                    <span style="color: var(--primary); font-weight: 800; font-size: 15.5px; margin-left: 4px;">น.</span>
                </div>
            `;
        }
    }, 1000);

    if (typeof db !== 'undefined') {
        db.ref('clinic_settings_v2').on('value', snap => {
            const data = snap.val();
            if (data && data.clinic_name) {
                const brandText = document.querySelector('.brand-text h3');
                if (brandText) brandText.innerHTML = `${data.clinic_name}`;
            }
        });
    }
});