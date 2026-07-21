// js/main.js
// 🚀 Enterprise Core Router: Multi-Tab Enabled, Zero-Popup Paradigm & Real-time RBAC (v11.1)

document.addEventListener('click', function(e) {
    const link = e.target.closest('a[target="_blank"]');
    if (link) {
        e.preventDefault();
        Swal.fire({
            title: '<span style="font-family:Prompt; font-size:18px; font-weight:bold;"><i class="fa-solid fa-file-lines text-primary me-2"></i> เปิดเอกสาร / หน้าต่างใหม่</span>',
            html: `<iframe src="${link.href}" style="width:100%; height:80vh; border:none; border-radius:12px; background:#fff; box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);"></iframe>`,
            width: '90%',
            padding: '15px',
            showConfirmButton: false,
            showCloseButton: true,
            customClass: { popup: 'premium-alert' }
        });
    }
});

const App = {
    currentUser: null,
    idleTimeout: null,
    isLocked: false,
    lockTimeLimit: 15 * 60 * 1000, 
    lockClockInterval: null, 
    mainClockInterval: null, 
    activePageModule: null, 
    mobileBackdrop: null, 
    
    pages: {}, 

    defaultRolePermissions: {
        'admin': ['*'],
        'doctor': ['dashboard', 'visits', 'visit_detail', 'patients', 'patient_history', 'document_center', 'search_copy', 'about'],
        'head_nurse': ['dashboard', 'visits', 'visit_detail', 'patients', 'patient_history', 'document_center', 'patient_status', 'inventory', 'stock_manage', 'stock_history', 'monthly_requisition', 'stock_forecast', 'usage_statistics', 'search_copy', 'about'],
        'nurse': ['dashboard', 'visits', 'visit_detail', 'patients', 'patient_history', 'document_center', 'patient_status', 'monthly_requisition', 'search_copy', 'about'],
        'assistant': ['dashboard', 'visits', 'patient_history', 'document_center', 'search_copy', 'about'],
        'finance': ['dashboard', 'finance', 'department_ledger', 'search_copy', 'about'],
        'stock': ['dashboard', 'inventory', 'stock_manage', 'stock_history', 'monthly_requisition', 'stock_forecast', 'usage_statistics', 'search_copy', 'about']
    },

    rolePermissions: {},

    initPages: function() {
        this.pages = {
            login: typeof LoginPage !== 'undefined' ? LoginPage : window.LoginPage,
            dashboard: typeof DashboardPage !== 'undefined' ? DashboardPage : window.DashboardPage,
            patients: typeof PatientsPage !== 'undefined' ? PatientsPage : window.PatientsPage,
            patient_status: typeof PatientStatusPage !== 'undefined' ? PatientStatusPage : window.PatientStatusPage, 
            patient_form: typeof PatientFormPage !== 'undefined' ? PatientFormPage : window.PatientFormPage,
            patient_history: typeof PatientHistoryPage !== 'undefined' ? PatientHistoryPage : window.PatientHistoryPage, 
            visit_detail: typeof VisitDetailPage !== 'undefined' ? VisitDetailPage : window.VisitDetailPage, 
            visits: typeof VisitsPage !== 'undefined' ? VisitsPage : window.VisitsPage,
            settings: typeof SettingsPage !== 'undefined' ? SettingsPage : window.SettingsPage,
            search_copy: typeof SearchCopyPage !== 'undefined' ? SearchCopyPage : window.SearchCopyPage,
            about: typeof AboutPage !== 'undefined' ? AboutPage : window.AboutPage,
            shift_schedule: typeof ShiftSchedulePage !== 'undefined' ? ShiftSchedulePage : window.ShiftSchedulePage,
            inventory: typeof InventoryPage !== 'undefined' ? InventoryPage : window.InventoryPage,
            stock_forecast: typeof StockForecastPage !== 'undefined' ? StockForecastPage : window.StockForecastPage,
            stock_manage: typeof StockManagePage !== 'undefined' ? StockManagePage : window.StockManagePage,
            stock_history: typeof StockHistoryPage !== 'undefined' ? StockHistoryPage : window.StockHistoryPage,
            monthly_requisition: typeof MonthlyRequisitionPage !== 'undefined' ? MonthlyRequisitionPage : window.MonthlyRequisitionPage,
            usage_statistics: typeof UsageStatisticsPage !== 'undefined' ? UsageStatisticsPage : window.UsageStatisticsPage,
            finance: typeof FinancePage !== 'undefined' ? FinancePage : window.FinancePage,
            department_ledger: typeof DepartmentLedgerPage !== 'undefined' ? DepartmentLedgerPage : window.DepartmentLedgerPage,
            document_center: typeof DocumentCenterPage !== 'undefined' ? DocumentCenterPage : window.DocumentCenterPage 
        };
    },

    getPages: function() {
        this.initPages();
        return this.pages;
    },

    initMobileSidebar: function() {
        const btnToggle = document.getElementById('btnToggleSidebar');
        
        if (!this.mobileBackdrop) {
            this.mobileBackdrop = document.createElement('div');
            this.mobileBackdrop.id = 'app-mobile-backdrop';
            this.mobileBackdrop.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.6); z-index:990; opacity:0; visibility:hidden; transition:opacity 0.3s ease, visibility 0.3s ease;';
            document.body.appendChild(this.mobileBackdrop);

            this.mobileBackdrop.addEventListener('click', () => {
                this.toggleSidebar(false);
            });
        }

        if (btnToggle) {
            const newBtnToggle = btnToggle.cloneNode(true);
            btnToggle.parentNode.replaceChild(newBtnToggle, btnToggle);
            
            newBtnToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const sidebar = document.getElementById('sidebar');
                const isCurrentlyActive = sidebar && sidebar.classList.contains('active');
                this.toggleSidebar(!isCurrentlyActive);
            });
        }

        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024 && this.mobileBackdrop && this.mobileBackdrop.style.visibility === 'visible') {
                this.toggleSidebar(false); 
            }
        });
    },

    toggleSidebar: function(forceOpen) {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        if (forceOpen && window.innerWidth <= 1024) { 
            sidebar.classList.add('active');
            if (this.mobileBackdrop) {
                this.mobileBackdrop.style.visibility = 'visible';
                this.mobileBackdrop.style.opacity = '1';
            }
            document.body.style.overflow = 'hidden'; 
        } else {
            sidebar.classList.remove('active');
            if (this.mobileBackdrop) {
                this.mobileBackdrop.style.opacity = '0';
                setTimeout(() => { 
                    if (!sidebar.classList.contains('active')) {
                        this.mobileBackdrop.style.visibility = 'hidden'; 
                    }
                }, 300);
            }
            document.body.style.overflow = ''; 
        }
    },

    clearAllOverlays: function() {
        try {
            if (!this.isLocked) {
                const lockOverlay = document.getElementById('lock-screen-overlay');
                if (lockOverlay) lockOverlay.remove();
                document.body.style.pointerEvents = 'auto';
            }

            if (typeof Swal !== 'undefined' && Swal.isVisible()) {
                Swal.close();
            }

            document.body.classList.remove('swal2-shown', 'swal2-height-auto');
            document.querySelectorAll('.swal2-container').forEach(el => el.remove());
            
            if (this.mobileBackdrop && this.mobileBackdrop.style.visibility === 'visible' && window.innerWidth > 1024) {
                 this.toggleSidebar(false);
            }
        } catch(e) { console.warn("Overlay Cleanup Error:", e); }
    },

    initClock: function() {
        const updateClock = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            const day = now.getDate();
            const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
            const month = monthNames[now.getMonth()];
            const year = (now.getFullYear() + 543).toString().slice(-2);
            const dateStr = `${day} ${month} ${year}`;
            
            const clockEl = document.getElementById('clockDisplay');
            if (clockEl) {
                clockEl.innerHTML = `
                    <div style="display: flex; align-items: center; white-space: nowrap;">
                        <i class="fa-regular fa-clock" style="color:var(--primary); font-size:16.5px; margin-right: 10px;"></i> 
                        <span style="color: var(--text-dark); font-size: 14px; font-weight: 700; width: 80px; text-align: right; display: inline-block;">${dateStr}</span> 
                        <span style="color: var(--border-color); margin: 0 12px; font-weight: 400;">|</span> 
                        <span style="color: var(--primary); font-weight: 800; font-size: 15px; letter-spacing: 0.5px; font-variant-numeric: tabular-nums; width: 75px; text-align: center; display: inline-block;">${timeStr}</span>
                        <span style="color: var(--primary); font-weight: 800; font-size: 15px; margin-left: 2px;">น.</span>
                    </div>
                `;
            }
        };
        updateClock(); 
        if (this.mainClockInterval) clearInterval(this.mainClockInterval);
        this.mainClockInterval = setInterval(updateClock, 1000);
    },

    applyRBAC: function() {
        if (!this.currentUser) return;
        const role = this.currentUser.role || 'nurse'; 
        
        const permissionsSrc = Object.keys(this.rolePermissions).length > 0 ? this.rolePermissions : this.defaultRolePermissions;
        const allowedPages = permissionsSrc[role] || [];
        const isAdmin = allowedPages.includes('*');

        const navItems = document.querySelectorAll('#mainNavigation .nav-item');
        navItems.forEach(item => {
            const pageName = item.getAttribute('data-page');
            if (!pageName) return;

            if (isAdmin || allowedPages.includes(pageName)) {
                item.style.display = 'flex'; 
                item.classList.remove('d-none');
            } else {
                item.style.display = 'none'; 
                item.classList.add('d-none');
            }
        });

        let currentSection = null;
        let visibleCount = 0;
        
        const navElements = document.querySelectorAll('#mainNavigation > li');
        navElements.forEach((li) => {
            if (li.classList.contains('nav-section')) {
                if (currentSection && visibleCount === 0) currentSection.style.display = 'none';
                currentSection = li; 
                visibleCount = 0;
                currentSection.style.display = ''; 
            } else if (li.classList.contains('nav-item')) {
                if (!li.classList.contains('d-none') && li.style.display !== 'none') visibleCount++;
            }
        });
        if (currentSection && visibleCount === 0) currentSection.style.display = 'none';

        const currentPageEl = document.querySelector('.nav-item.active');
        if (currentPageEl) {
            const currentPage = currentPageEl.getAttribute('data-page');
            if (currentPage !== 'login' && !isAdmin && !allowedPages.includes(currentPage)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'สิทธิ์ถูกเปลี่ยนแปลง',
                    text: 'สิทธิ์การเข้าถึงหน้านี้ของคุณถูกเพิกถอนโดยผู้ดูแลระบบแล้ว',
                    confirmButtonColor: '#ef4444'
                }).then(() => {
                    let defaultPage = allowedPages.length > 0 ? allowedPages[0] : 'login';
                    this.switchPage(defaultPage);
                });
            }
        }
    },

    // 🚨 THE FIX: อัปเกรดระบบ SwitchPage ให้การันตีการลบคลาส Hide-Screen ทิ้งทุกครั้งที่ล็อคอิน
    switchPage: function(pageName, element, payload = null) {
        const sidebar = document.getElementById('sidebar');
        const topbar = document.querySelector('.topbar');
        const mainContent = document.querySelector('.main-content');
        let appContent = document.getElementById('app-content');

        if (pageName !== 'login' && this.currentUser) {
            const role = this.currentUser.role || 'nurse';
            const permissionsSrc = Object.keys(this.rolePermissions).length > 0 ? this.rolePermissions : this.defaultRolePermissions;
            const allowedPages = permissionsSrc[role] || [];
            
            if (!allowedPages.includes('*') && !allowedPages.includes(pageName)) {
                Swal.fire({ icon: 'error', title: 'ปฏิเสธการเข้าถึง (Access Denied)', text: 'บัญชีของคุณไม่มีสิทธิ์เข้าถึงหน้าจอนี้ครับ', confirmButtonColor: '#ef4444' });
                return; 
            }
        }

        if (!appContent && mainContent) {
            appContent = document.createElement('div');
            appContent.id = 'app-content';
            appContent.style.cssText = 'transition: opacity 0.3s ease-in-out; width: 100%; min-height: 80vh;';
            mainContent.appendChild(appContent);
        }

        this.toggleSidebar(false);

        if (pageName !== 'login') {
            document.documentElement.classList.remove('not-logged-in');
            const ghostStyle = document.getElementById('anti-flash-style');
            if (ghostStyle) ghostStyle.remove();

            if(sidebar) { sidebar.style.display = ''; sidebar.style.opacity = '1'; sidebar.style.visibility = 'visible'; }
            if(topbar) { topbar.style.display = 'flex'; topbar.style.opacity = '1'; topbar.style.visibility = 'visible'; }
            if(mainContent) { mainContent.style.marginLeft = ''; mainContent.style.background = ''; }
            if(appContent) { appContent.style.padding = ''; appContent.style.opacity = '1'; }
            
            if (!this.currentUser && sessionStorage.getItem('dialysis_user_session')) {
                this.checkAuth();
            }
        } else {
            if(sidebar) sidebar.style.display = 'none';
            if(topbar) topbar.style.display = 'none';
            if(mainContent) { mainContent.style.marginLeft = '0'; mainContent.style.background = '#f8fafc'; }
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
        
        this.clearAllOverlays();
        
        if (this.activePageModule && typeof this.activePageModule.destroy === 'function') {
            try { this.activePageModule.destroy(); } 
            catch (e) { console.warn(`[Router] Cleanup error on previous page:`, e); }
        }
        
        appContent.style.opacity = 0; 
        
        setTimeout(() => {
            try {
                const availablePages = this.getPages();
                const pageModule = availablePages[pageName];
                
                if (pageModule && pageModule.html) {
                    appContent.innerHTML = pageModule.html;
                    this.activePageModule = pageModule;

                    if (pageModule.init) {
                        try { pageModule.init(payload); } 
                        catch (error) { 
                            console.error(`[Router] Init Error [${pageName}]:`, error); 
                            this.clearAllOverlays(); 
                        }
                    }
                } else {
                    appContent.innerHTML = `
                        <div class="text-center py-5 shadow-sm mx-auto mt-5" style="max-width: 600px; background:var(--bg-surface); border-radius:16px; border:1px solid var(--border-color);">
                            <i class="fa-solid fa-triangle-exclamation fa-4x text-warning mb-4"></i>
                            <h3 class="fw-bold" style="font-family:'Prompt'; color:var(--text-dark);">ฟังก์ชัน [${pageName}] ยังไม่พร้อมใช้งาน</h3>
                            <p class="mb-0" style="color:var(--text-muted);">โปรดตรวจสอบการเชื่อมต่อไฟล์โมดูล</p>
                        </div>`;
                    this.activePageModule = null;
                }
            } catch (fatalError) {
                console.error("[Router] Fatal Crash:", fatalError);
                appContent.innerHTML = `
                    <div class="text-center py-5 shadow-sm mx-auto mt-5" style="max-width: 600px; background:var(--bg-surface); border-radius:16px; border:1px solid #fecaca;">
                        <i class="fa-solid fa-bug fa-4x text-danger mb-4"></i>
                        <h3 class="fw-bold text-danger" style="font-family:'Prompt';">เกิดข้อผิดพลาดในการแสดงผล</h3>
                        <p class="text-danger mb-0">${fatalError.message}</p>
                    </div>`;
            } finally {
                appContent.style.opacity = 1; 
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            
        }, 150);
    },

    logout: function() {
        Swal.fire({
            title: 'ออกจากระบบ?',
            text: "คุณต้องการออกจากระบบเวชระเบียนใช่หรือไม่?",
            icon: 'question',
            showCancelButton: true, 
            confirmButtonColor: '#ef4444', 
            cancelButtonColor: '#cbd5e1',
            confirmButtonText: '<i class="fa-solid fa-sign-out-alt me-2"></i> ออกจากระบบ', 
            cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'shadow-lg border rounded-4' },
            didOpen: () => {
                const container = Swal.getContainer();
                if (container) {
                    container.style.setProperty('z-index', '9999999', 'important');
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                if(this.lockClockInterval) clearInterval(this.lockClockInterval);
                if(this.mainClockInterval) clearInterval(this.mainClockInterval);
                
                if (this.activePageModule && typeof this.activePageModule.destroy === 'function') {
                    try { this.activePageModule.destroy(); } catch (e) {}
                }

                sessionStorage.removeItem('dialysis_user_session');
                sessionStorage.removeItem('dialysis_is_locked'); 
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

    showLockScreenToast: function(message) {
        const toast = document.getElementById('lock-screen-toast');
        const toastText = document.getElementById('lock-screen-toast-text');
        if(!toast || !toastText) return;

        toastText.innerText = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    },

    lockScreen: function() {
        this.isLocked = true;
        sessionStorage.setItem('dialysis_is_locked', 'true'); 
        
        let overlay = document.getElementById('lock-screen-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'lock-screen-overlay';
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
                background: rgba(15, 23, 42, 0.95); 
                z-index: 99999; display: flex; align-items: center; justify-content: center;
                font-family: 'Prompt', sans-serif;
            `;
            document.body.appendChild(overlay);
        }

        const safeName = (this.currentUser && this.currentUser.name) ? this.currentUser.name : 'User';
        const userImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=2563eb&color=fff&bold=true`;

        overlay.innerHTML = `
            <style>
                @keyframes slideDownFadeSafe { from { opacity: 0; transform: translate3d(0, -30px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
                
                .lock-custom-toast {
                    position: absolute; top: 20px; left: 50%; transform: translate3d(-50%, -150%, 0);
                    background: var(--bg-surface); border: 2px solid #ef4444; box-shadow: 0 10px 25px -5px rgba(239, 68, 68, 0.2);
                    border-radius: 50px; padding: 10px 25px; font-family: 'Prompt', sans-serif; color: var(--text-dark);
                    font-weight: 700; font-size: 15px; z-index: 9999999; display: flex; align-items: center;
                    gap: 12px; opacity: 0; transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15), opacity 0.3s ease; pointer-events: none;
                }
                .lock-custom-toast.show { transform: translate3d(-50%, 0, 0); opacity: 1; }
            </style>

            <div id="lock-screen-toast" class="lock-custom-toast">
                <div class="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center shadow-sm" style="width:26px; height:26px;">
                    <i class="fa-solid fa-exclamation" style="font-size:13px;"></i>
                </div>
                <span id="lock-screen-toast-text">ข้อความแจ้งเตือน</span>
            </div>

            <div class="text-center" style="width: 100%; max-width: 420px; padding: 40px; background: var(--bg-surface); border-radius: 24px; border: 1px solid var(--border-color); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); animation: slideDownFadeSafe 0.4s ease forwards; transform: translate3d(0,0,0); position: relative;">
                <div class="mb-4">
                    <div id="lock-time-display" style="font-size: 3.5rem; font-weight: 800; color: var(--text-dark); line-height: 1; font-variant-numeric: tabular-nums; letter-spacing: -1px;">--:--:--</div>
                    <div id="lock-date-display" style="font-size: 1.1rem; font-weight: 600; color: var(--text-muted); margin-top: 5px;">กำลังโหลด...</div>
                </div>

                <img src="${userImg}" class="rounded-circle mb-3" style="width: 80px; height: 80px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: 3px solid var(--bg-surface);">
                <h4 class="fw-bold mb-1" style="font-family:'Prompt'; color: var(--text-dark);">${safeName}</h4>
                <p class="small mb-4" style="color: var(--text-muted);"><i class="fa-solid fa-lock text-warning me-1"></i> หน้าจอถูกล็อคเนื่องจากไม่มีการใช้งาน</p>
                
                <div class="input-group mb-4" style="border-radius: 14px; overflow:hidden; background: var(--bg-body); border: 1px solid var(--border-color); box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                    <span class="input-group-text border-0" style="background: var(--bg-body);"><i class="fa-solid fa-key" style="color: var(--text-muted);"></i></span>
                    <input type="password" id="unlock-password" class="form-control form-control-lg border-0 fw-bold" placeholder="กรอกรหัสผ่านเพื่อปลดล็อค" onkeypress="if(event.key === 'Enter') App.unlockScreen()" style="outline:none; box-shadow:none; background:transparent; color: var(--text-dark);">
                </div>

                <button class="btn btn-premium-primary btn-lg w-100 mb-3 fw-bold rounded-pill" id="btn-unlock" style="box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);" onclick="App.unlockScreen()">
                    <i class="fa-solid fa-unlock-keyhole me-2"></i> ปลดล็อคหน้าจอ
                </button>
                <button class="btn w-100 fw-bold rounded-pill text-danger shadow-sm" style="background: var(--bg-body); border: 1px solid var(--border-color);" onclick="App.logout()">
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
            
            if (this.currentUser && this.currentUser.id === 'MASTER_ADMIN' && pw === 'admin1234') {
                this.isLocked = false;
                if(this.lockClockInterval) clearInterval(this.lockClockInterval);
                sessionStorage.removeItem('dialysis_is_locked'); 
                const overlay = document.getElementById('lock-screen-overlay');
                if (overlay) overlay.remove();
                this.resetIdleTimer();
                return;
            }

            let user = rawUsers.find(u => this.currentUser && u.username.toLowerCase() === this.currentUser.username.toLowerCase() && u.password === pw && u.status === 'active');

            if (user) {
                this.isLocked = false;
                if(this.lockClockInterval) clearInterval(this.lockClockInterval); 
                sessionStorage.removeItem('dialysis_is_locked'); 
                const overlay = document.getElementById('lock-screen-overlay');
                if (overlay) overlay.remove();
                this.resetIdleTimer();
            } else {
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
        const isLockedFromStorage = sessionStorage.getItem('dialysis_is_locked') === 'true';
        if (isLockedFromStorage) {
            this.isLocked = true;
        }

        this.clearAllOverlays();

        const sessionStr = sessionStorage.getItem('dialysis_user_session');
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

        // 🚨 THE FIX: นำแสงสว่างและโครงสร้างหน้าจอหลักกลับมา 100%
        document.documentElement.classList.remove('not-logged-in');
        const ghostStyle = document.getElementById('anti-flash-style');
        if (ghostStyle) ghostStyle.remove();

        if(sidebar) { sidebar.style.display = ''; sidebar.style.opacity = '1'; sidebar.style.visibility = 'visible'; }
        if(topbar) { topbar.style.display = 'flex'; topbar.style.opacity = '1'; topbar.style.visibility = 'visible'; }
        if(mainContent) { mainContent.style.marginLeft = ''; mainContent.style.background = ''; }
        if(appContent) { appContent.style.padding = ''; appContent.style.opacity = '1'; }

        try {
            this.currentUser = JSON.parse(sessionStr);
            const userInfoName = document.querySelector('.user-info h4');
            if (userInfoName && this.currentUser) {
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
                let safeName = this.currentUser.name || 'ผู้ใช้งาน';
                userInfoName.innerText = `${safeName} ${roleTitle}`;
                
                const avatar = document.querySelector('.user-avatar');
                if(avatar) {
                    let initials = safeName.substring(0, 2).toUpperCase();
                    avatar.innerText = initials;
                }
            }

            this._syncAgentVersion();

        } catch (e) {
            console.error("Session parse error", e);
            sessionStorage.removeItem('dialysis_user_session');
            this.switchPage('login');
            return false;
        }

        this.setupIdleTimer();

        if (this.isLocked) {
            this.lockScreen();
        }

        return true; 
    },

    _syncAgentVersion: function() {
        try {
            if (typeof AboutPage !== 'undefined' && AboutPage.version) {
                const appVersion = AboutPage.version;
                
                fetch(`http://127.0.0.1:8000/health?v=${encodeURIComponent(appVersion)}`, { method: 'GET', mode: 'cors' })
                    .then(res => res.json())
                    .then(data => {
                        console.log("✅ [Agent Sync]: Version synced to Python Agent ->", appVersion);
                    })
                    .catch(err => {
                        console.log("ℹ️ [Agent Sync]: Agent not running, skip version sync.");
                    });
            }
        } catch(e) {
            console.warn("[Agent Sync] Failed to sync version:", e);
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    App.initPages();
    App.initMobileSidebar(); 

    try { App.initClock(); } catch (e) { console.error("Clock Init Error:", e); }

    if (!sessionStorage.getItem('dialysis_session_active')) {
        sessionStorage.setItem('dialysis_session_active', 'true');
    }

    if (typeof db !== 'undefined') {
        db.ref('clinic_roles_v2').on('value', snap => {
            const data = snap.val();
            if (data) {
                App.rolePermissions = data; 
            } else {
                App.rolePermissions = App.defaultRolePermissions;
                db.ref('clinic_roles_v2').set(App.defaultRolePermissions);
            }
            if (App.currentUser) App.applyRBAC();
        });

        db.ref('clinic_settings_v2').on('value', snap => {
            const data = snap.val();
            if (data && data.clinic_name) {
                const brandText = document.querySelector('.brand-text h3');
                if (brandText) brandText.innerHTML = `${data.clinic_name}`;
            }
        });
    }

    // 🚨 THE FIX: ประเมินการเข้าสู่ระบบแบบเงียบเชียบ ถ้ายังไม่ Login ระบบจะเด้งไปหน้า Login เลยโดยที่จอไม่กระพริบ
    const isAuthenticated = App.checkAuth();
    if (!isAuthenticated) return; 

    const role = App.currentUser ? App.currentUser.role : 'nurse';
    const permissionsSrc = Object.keys(App.rolePermissions).length > 0 ? App.rolePermissions : App.defaultRolePermissions;
    const allowed = permissionsSrc[role] || [];
    let defaultPage = 'dashboard';
    
    if (!allowed.includes('*') && !allowed.includes('dashboard')) {
        defaultPage = allowed.length > 0 ? allowed[0] : 'login';
    }
    
    const defaultMenu = document.querySelector(`.nav-item[data-page="${defaultPage}"]`);
    App.switchPage(defaultPage, defaultMenu);
});

function syncWithLocalAgent() {
    let currentVersion = "6.0.0 (Quantum Resilient Edition)";
    if (typeof AboutPage !== 'undefined' && AboutPage.version) {
        currentVersion = AboutPage.version;
    }

    const agentUrl = `http://127.0.0.1:8000/health?v=${encodeURIComponent(currentVersion)}`;
    fetch(agentUrl, { method: 'GET' })
        .then(res => res.json())
        .then(data => {})
        .catch(err => {});
}

setTimeout(syncWithLocalAgent, 1000);
setInterval(syncWithLocalAgent, 3000);

window.App = App;

window.addEventListener('beforeunload', function () {
    const agentUrl = 'http://127.0.0.1:8000/shutdown'; 
    try {
        navigator.sendBeacon(agentUrl);
    } catch (e) {
        console.warn("ไม่สามารถส่งสัญญาณปิด Agent ได้:", e);
    }
});