// js/main.js
// 🚀 Enterprise Core Router: ES6 Class Architecture, O(1) Auth Query, Smart Sync & Zero-Leak Engine (v13.0)

// 🚨 Global Iframe Clickjacking Protection
document.addEventListener('click', function(e) {
    const link = e.target.closest('a[target="_blank"]');
    if (link) {
        e.preventDefault();
        
        // Basic Sanitization: อนุญาตเฉพาะ http/https ป้องกัน javascript: injection
        const url = new URL(link.href, window.location.origin);
        if (!['http:', 'https:'].includes(url.protocol)) {
            console.warn("[Security] Blocked insecure iframe injection.");
            return;
        }

        if(typeof Swal !== 'undefined') {
            Swal.fire({
                title: '<span style="font-family:Prompt; font-size:18px; font-weight:bold;"><i class="fa-solid fa-file-lines text-primary me-2"></i> เอกสารอ้างอิง</span>',
                html: `<iframe src="${url.href}" style="width:100%; height:80vh; border:none; border-radius:12px; background:#fff; box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);"></iframe>`,
                width: '90%',
                padding: '15px',
                showConfirmButton: false,
                showCloseButton: true,
                customClass: { popup: 'premium-alert' }
            });
        }
    }
});

// 🚀 แปลงเป็น ES6 Class Singleton Architecture เพื่อ Encapsulation และความปลอดภัย
class CoreApplicationRouter {
    constructor() {
        this.currentUser = null;
        this.idleTimeout = null;
        this.isLocked = false;
        this.lockTimeLimit = 15 * 60 * 1000; // 15 Minutes
        this.lockClockInterval = null;
        this.mainClockInterval = null;
        this.activePageModule = null;
        this.mobileBackdrop = null;
        
        this.pages = {};
        
        // 🔒 RBAC Definitions
        this.defaultRolePermissions = {
            'admin': ['*'],
            'doctor': ['dashboard', 'visits', 'visit_detail', 'patients', 'patient_history', 'document_center', 'search_copy', 'about'],
            'head_nurse': ['dashboard', 'visits', 'visit_detail', 'patients', 'patient_history', 'document_center', 'patient_status', 'inventory', 'stock_manage', 'stock_history', 'monthly_requisition', 'stock_forecast', 'usage_statistics', 'search_copy', 'about'],
            'nurse': ['dashboard', 'visits', 'visit_detail', 'patients', 'patient_history', 'document_center', 'patient_status', 'monthly_requisition', 'search_copy', 'about'],
            'assistant': ['dashboard', 'visits', 'patient_history', 'document_center', 'search_copy', 'about'],
            'finance': ['dashboard', 'finance', 'department_ledger', 'search_copy', 'about'],
            'stock': ['dashboard', 'inventory', 'stock_manage', 'stock_history', 'monthly_requisition', 'stock_forecast', 'usage_statistics', 'search_copy', 'about']
        };
        this.rolePermissions = {};

        // 🚨 MASTER ADMIN CONFIG (ควรย้ายไปอยู่ Environment Variables หรือ Server-side ในอนาคต)
        this.MASTER_ADMIN_ID = 'MASTER_ADMIN';
        this.MASTER_ADMIN_PW = 'admin1234'; 

        // Agent Sync Config
        this.agentSyncTimer = null;
        this.agentRetryCount = 0;
    }

    initPages() {
        // ใช้ Optional Chaining ป้องกัน ReferenceError
        this.pages = {
            login: window.LoginPage || null,
            dashboard: window.DashboardPage || null,
            patients: window.PatientsPage || null,
            patient_status: window.PatientStatusPage || null,
            patient_form: window.PatientFormPage || null,
            patient_history: window.PatientHistoryPage || null,
            visit_detail: window.VisitDetailPage || null,
            visits: window.VisitsPage || null,
            settings: window.SettingsPage || null,
            search_copy: window.SearchCopyPage || null,
            about: window.AboutPage || null,
            shift_schedule: window.ShiftSchedulePage || null,
            inventory: window.InventoryPage || null,
            stock_forecast: window.StockForecastPage || null,
            stock_manage: window.StockManagePage || null,
            stock_history: window.StockHistoryPage || null,
            monthly_requisition: window.MonthlyRequisitionPage || null,
            usage_statistics: window.UsageStatisticsPage || null,
            finance: window.FinancePage || null,
            department_ledger: window.DepartmentLedgerPage || null,
            document_center: window.DocumentCenterPage || null
        };
    }

    getPages() {
        if (Object.keys(this.pages).length === 0) this.initPages();
        return this.pages;
    }

    // ==========================================
    // 📱 UI & LAYOUT ORCHESTRATION
    // ==========================================
    initMobileSidebar() {
        const btnToggle = document.getElementById('btnToggleSidebar');
        
        if (!this.mobileBackdrop) {
            this.mobileBackdrop = document.createElement('div');
            this.mobileBackdrop.id = 'app-mobile-backdrop';
            this.mobileBackdrop.className = 'mobile-sidebar-overlay'; // ย้าย Style ไปไว้ใน CSS
            this.mobileBackdrop.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.6); z-index:990; opacity:0; visibility:hidden; transition:opacity 0.3s ease, visibility 0.3s ease; backdrop-filter:blur(3px);';
            document.body.appendChild(this.mobileBackdrop);
            
            this.mobileBackdrop.addEventListener('click', () => this.toggleSidebar(false));
        }

        if (btnToggle) {
            // Clean old event listeners gracefully
            const newBtnToggle = btnToggle.cloneNode(true);
            btnToggle.parentNode.replaceChild(newBtnToggle, btnToggle);
            
            newBtnToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const sidebar = document.getElementById('sidebar');
                const isCurrentlyActive = sidebar?.classList.contains('active');
                this.toggleSidebar(!isCurrentlyActive);
            });
        }

        // ใช้ ResizeObserver หรือ MediaQuery แทน Event Resize ปกติ (ถ้า ResponsiveEngine ทำแล้ว อันนี้อาจจะซ้ำซ้อน แต่คงไว้เพื่อความชัวร์)
        window.matchMedia('(min-width: 1025px)').addEventListener('change', (e) => {
            if (e.matches && this.mobileBackdrop?.style.visibility === 'visible') {
                this.toggleSidebar(false);
            }
        });
    }

    toggleSidebar(forceOpen) {
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
    }

    clearAllOverlays() {
        try {
            if (!this.isLocked) {
                document.getElementById('lock-screen-overlay')?.remove();
                document.body.style.pointerEvents = 'auto';
            }
            
            if (typeof Swal !== 'undefined' && Swal.isVisible()) Swal.close();
            
            document.body.classList.remove('swal2-shown', 'swal2-height-auto');
            document.querySelectorAll('.swal2-container').forEach(el => el.remove());
            
            if (this.mobileBackdrop?.style.visibility === 'visible' && window.innerWidth > 1024) { 
                this.toggleSidebar(false);
            }
        } catch(e) { console.warn("[Router] Overlay Cleanup Error:", e); }
    }

    initClock() {
        if (this.mainClockInterval) clearInterval(this.mainClockInterval);
        
        const clockEl = document.getElementById('clockDisplay');
        if (!clockEl) return;

        const updateClock = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
            const dateStr = `${now.getDate()} ${monthNames[now.getMonth()]} ${(now.getFullYear() + 543).toString().slice(-2)}`;
            
            // DOM Update แบบ O(1) Zero-Reflow (เปลี่ยนแค่ TextNode)
            if(!this._clockStructBuilt) {
                clockEl.innerHTML = `
                    <div style="display: flex; align-items: center; white-space: nowrap;">
                        <i class="fa-regular fa-clock" style="color:var(--primary); font-size:16.5px; margin-right: 10px;"></i> 
                        <span id="global-date-txt" style="color: var(--text-dark); font-size: 14px; font-weight: 700; width: 80px; text-align: right; display: inline-block;">${dateStr}</span> 
                        <span style="color: var(--border-color); margin: 0 12px; font-weight: 400;">|</span> 
                        <span id="global-time-txt" style="color: var(--primary); font-weight: 800; font-size: 15px; letter-spacing: 0.5px; font-variant-numeric: tabular-nums; width: 75px; text-align: center; display: inline-block;">${timeStr}</span>
                        <span style="color: var(--primary); font-weight: 800; font-size: 15px; margin-left: 2px;">น.</span>
                    </div>
                `;
                this._clockStructBuilt = true;
            } else {
                document.getElementById('global-date-txt').textContent = dateStr;
                document.getElementById('global-time-txt').textContent = timeStr;
            }
        };
        
        updateClock(); 
        this.mainClockInterval = setInterval(updateClock, 1000);
    }

    // ==========================================
    // 🔐 RBAC & AUTHENTICATION ENGINE
    // ==========================================
    applyRBAC() {
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

        // ซ่อนหมวดหมู่ (Section) ถ้าลูกข้างในโดนซ่อนหมด
        let currentSection = null;
        let visibleCount = 0;
        
        document.querySelectorAll('#mainNavigation > li').forEach((li) => {
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

        // Auto-Kick if on unauthorized page
        const currentPageEl = document.querySelector('.nav-item.active');
        if (currentPageEl) {
            const currentPage = currentPageEl.getAttribute('data-page');
            if (currentPage !== 'login' && !isAdmin && !allowedPages.includes(currentPage)) {
                const kickTarget = allowedPages.length > 0 ? allowedPages[0] : 'login';
                if(typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'warning', title: 'ไม่มีสิทธิ์เข้าถึง', text: 'สิทธิ์ของตำแหน่งคุณถูกระงับการเข้าหน้าต่างนี้', confirmButtonColor: '#ef4444'
                    }).then(() => this.switchPage(kickTarget));
                } else {
                    this.switchPage(kickTarget);
                }
            }
        }
    }

    switchPage(pageName, element, payload = null) {
        const sidebar = document.getElementById('sidebar');
        const topbar = document.querySelector('.topbar');
        const mainContent = document.querySelector('.main-content');
        let appContent = document.getElementById('app-content');

        // RBAC Verification
        if (pageName !== 'login' && this.currentUser) {
            const role = this.currentUser.role || 'nurse';
            const permissionsSrc = Object.keys(this.rolePermissions).length > 0 ? this.rolePermissions : this.defaultRolePermissions;
            const allowedPages = permissionsSrc[role] || [];
            
            if (!allowedPages.includes('*') && !allowedPages.includes(pageName)) {
                if(typeof Swal !== 'undefined') Swal.fire({ icon: 'error', title: 'ละเมิดสิทธิ์ (Access Denied)', text: 'บัญชีของคุณไม่ได้รับอนุญาตให้เข้าหน้านี้', confirmButtonColor: '#ef4444' });
                return; 
            }
        }

        // Layout Bootstrapping
        if (!appContent && mainContent) {
            appContent = document.createElement('div');
            appContent.id = 'app-content';
            appContent.style.cssText = 'transition: opacity 0.3s ease-in-out; width: 100%; min-height: 80vh;';
            mainContent.appendChild(appContent);
        }

        this.toggleSidebar(false);

        // UI Context Switching
        if (pageName !== 'login') {
            document.documentElement.classList.remove('not-logged-in');
            document.getElementById('anti-flash-style')?.remove();

            if(sidebar) { sidebar.style.display = ''; sidebar.style.opacity = '1'; sidebar.style.visibility = 'visible'; }
            if(topbar) { topbar.style.display = 'flex'; topbar.style.opacity = '1'; topbar.style.visibility = 'visible'; }
            if(mainContent) { mainContent.style.marginLeft = ''; mainContent.style.background = ''; }
            if(appContent) { appContent.style.padding = ''; appContent.style.opacity = '1'; }
            
            // Re-verify auth context
            if (!this.currentUser && sessionStorage.getItem('dialysis_user_session')) {
                this.checkAuth();
            }
        } else {
            if(sidebar) sidebar.style.display = 'none';
            if(topbar) topbar.style.display = 'none';
            if(mainContent) { mainContent.style.marginLeft = '0'; mainContent.style.background = 'var(--bg-body, #f8fafc)'; }
            if(appContent) appContent.style.padding = '0';
        }

        // Active State Management
        if (element) {
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            element.classList.add('active');
        } else {
            document.querySelectorAll('.nav-item').forEach(el => {
                el.classList.remove('active');
                if (el.getAttribute('onclick')?.includes(`'${pageName}'`)) {
                    el.classList.add('active');
                }
            });
        }

        if (!appContent) return;
        
        this.clearAllOverlays();
        
        // Page Lifecycle: Destroy
        if (this.activePageModule && typeof this.activePageModule.destroy === 'function') {
            try { this.activePageModule.destroy(); } 
            catch (e) { console.warn(`[Router] Cleanup error on previous page:`, e); }
        }
        
        appContent.style.opacity = 0; 

        // Page Lifecycle: Render & Init
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
                            <h3 class="fw-bold" style="font-family:'Prompt'; color:var(--text-dark);">ยังไม่ได้เชื่อมต่อ [${pageName}]</h3>
                            <p class="mb-0" style="color:var(--text-muted);">โมดูลนี้กำลังอยู่ระหว่างการพัฒนา</p>
                        </div>`;
                    this.activePageModule = null;
                }
            } catch (fatalError) {
                console.error("[Router] Fatal Crash:", fatalError);
                appContent.innerHTML = `
                    <div class="text-center py-5 shadow-sm mx-auto mt-5" style="max-width: 600px; background:var(--bg-surface); border-radius:16px; border:1px solid #fecaca;">
                        <i class="fa-solid fa-bug fa-4x text-danger mb-4"></i>
                        <h3 class="fw-bold text-danger" style="font-family:'Prompt';">ระบบขัดข้องชั่วคราว</h3>
                        <p class="text-danger mb-0">${fatalError.message}</p>
                    </div>`;
            } finally {
                appContent.style.opacity = 1; 
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 150);
    }

    logout() {
        if(typeof Swal === 'undefined') {
            sessionStorage.clear();
            window.location.reload();
            return;
        }
        Swal.fire({
            title: 'ออกจากระบบ', text: "ต้องการออกจากระบบ DIALYSIS PRO ใช่หรือไม่?", icon: 'question',
            showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#cbd5e1',
            confirmButtonText: '<i class="fa-solid fa-sign-out-alt me-2"></i> ออกจากระบบ', cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'shadow-lg border rounded-4' },
            didOpen: () => {
                const container = Swal.getContainer();
                if (container) container.style.setProperty('z-index', '9999999', 'important');
            }
        }).then((result) => {
            if (result.isConfirmed) {
                if(this.lockClockInterval) clearInterval(this.lockClockInterval);
                if(this.mainClockInterval) clearInterval(this.mainClockInterval);
                if(this.agentSyncTimer) clearInterval(this.agentSyncTimer);
                
                if (this.activePageModule?.destroy) {
                    try { this.activePageModule.destroy(); } catch (e) {}
                }

                sessionStorage.clear(); // Clear all traces
                window.location.reload(); 
            }
        });
    }

    // ==========================================
    // 🛡️ SECURITY & IDLE LOCK ENGINE
    // ==========================================
    resetIdleTimer() {
        if (this.isLocked) return;
        clearTimeout(this.idleTimeout);
        this.idleTimeout = setTimeout(() => this.lockScreen(), this.lockTimeLimit);
    }

    setupIdleTimer() {
        if (!this.currentUser) return;
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        // Use passive listeners to avoid blocking Main Thread
        events.forEach(event => window.addEventListener(event, () => this.resetIdleTimer(), { passive: true }));
        this.resetIdleTimer(); 
    }

    lockScreen() {
        this.isLocked = true;
        sessionStorage.setItem('dialysis_is_locked', 'true'); 
        
        let overlay = document.getElementById('lock-screen-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'lock-screen-overlay';
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
                background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
                z-index: 99999; display: flex; align-items: center; justify-content: center;
                font-family: 'Prompt', sans-serif;
            `;
            document.body.appendChild(overlay);
        }

        const safeName = this.currentUser?.name || 'User';
        const userImg = `https://ui-avatars.com/api/?name=${encodeURIComponent(safeName)}&background=2563eb&color=fff&bold=true`;

        overlay.innerHTML = `
            <div class="text-center" style="width: 100%; max-width: 420px; padding: 40px; background: var(--bg-surface, #1e293b); border-radius: 24px; border: 1px solid var(--border-color, #334155); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
                <div class="mb-4">
                    <div id="lock-time-display" style="font-size: 3.5rem; font-weight: 800; color: var(--text-dark, #fff); line-height: 1; font-variant-numeric: tabular-nums; letter-spacing: -1px;">--:--:--</div>
                    <div id="lock-date-display" style="font-size: 1.1rem; font-weight: 600; color: var(--text-muted, #94a3b8); margin-top: 5px;">กำลังโหลด...</div>
                </div>
                <img src="${userImg}" class="rounded-circle mb-3" style="width: 80px; height: 80px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); border: 3px solid var(--bg-surface);">
                <h4 class="fw-bold mb-1" style="font-family:'Prompt'; color: var(--text-dark, #fff);">${safeName}</h4>
                <p class="small mb-4" style="color: var(--text-muted, #94a3b8);"><i class="fa-solid fa-lock text-warning me-1"></i> เซสชันถูกพักชั่วคราวเพื่อความปลอดภัย</p>
                
                <div class="input-group mb-4" style="border-radius: 14px; overflow:hidden; background: var(--bg-body, #0f172a); border: 1px solid var(--border-color, #334155);">
                    <span class="input-group-text border-0 bg-transparent"><i class="fa-solid fa-key" style="color: var(--text-muted, #94a3b8);"></i></span>
                    <input type="password" id="unlock-password" class="form-control form-control-lg border-0 fw-bold bg-transparent" placeholder="กรอกรหัสผ่านเพื่อปลดล็อค" style="outline:none; box-shadow:none; color: var(--text-dark, #fff);">
                </div>
                <button class="btn btn-primary btn-lg w-100 mb-3 fw-bold rounded-pill" id="btn-unlock">
                    <i class="fa-solid fa-unlock-keyhole me-2"></i> กลับเข้าสู่ระบบ
                </button>
                <button class="btn w-100 fw-bold rounded-pill text-danger shadow-sm" style="background: transparent; border: 1px solid var(--border-color, #334155);" id="btn-force-logout">
                    <i class="fa-solid fa-sign-out-alt me-1"></i> เปลี่ยนบัญชี (Logout)
                </button>
            </div>
        `;
        
        // Add Event Listeners natively instead of inline HTML for better CSP compliance
        document.getElementById('btn-unlock').addEventListener('click', () => this.unlockScreen());
        document.getElementById('unlock-password').addEventListener('keypress', (e) => { if(e.key === 'Enter') this.unlockScreen(); });
        document.getElementById('btn-force-logout').addEventListener('click', () => this.logout());
        
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

        setTimeout(() => document.getElementById('unlock-password')?.focus(), 100);
    }

    unlockScreen() {
        const pw = document.getElementById('unlock-password').value.trim();
        if (!pw) { 
            Swal.fire({ toast: true, position: 'top', icon: 'warning', title: 'กรุณากรอกรหัสผ่านก่อนครับ', showConfirmButton: false, timer: 2000 });
            return; 
        }

        const btn = document.getElementById('btn-unlock');
        const origText = btn.innerHTML;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> กำลังตรวจสอบ...`;
        btn.disabled = true;

        if (typeof db === 'undefined') { 
            Swal.fire({ toast: true, position: 'top', icon: 'error', title: 'ไม่พบการเชื่อมต่อฐานข้อมูล', showConfirmButton: false, timer: 2000 });
            btn.innerHTML = origText; btn.disabled = false; 
            return; 
        }

        // 🚨 THE FIX: O(1) Auth Validation (ป้องกัน Data Leak ดึงมาทั้งคลินิก)
        if (this.currentUser && this.currentUser.id === this.MASTER_ADMIN_ID && pw === this.MASTER_ADMIN_PW) {
            this._processUnlockSuccess();
            return;
        }

        db.ref('clinic_users_v2')
          .orderByChild('username')
          .equalTo(this.currentUser.username)
          .once('value')
          .then(snap => {
            const data = snap.val();
            if (!data) throw new Error("User Not Found");

            // Extract the first (and should be only) matching user
            const userKey = Object.keys(data)[0];
            const user = data[userKey];

            if (user.password === pw && user.status === 'active') {
                this._processUnlockSuccess();
            } else {
                throw new Error("Invalid Password");
            }
        }).catch(err => {
            console.warn("[Auth Engine] Unlock Failed:", err.message);
            Swal.fire({ toast: true, position: 'top', icon: 'error', title: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่', showConfirmButton: false, timer: 2000 });
            btn.innerHTML = origText; btn.disabled = false;
            document.getElementById('unlock-password').value = '';
            document.getElementById('unlock-password').focus();
        });
    }

    _processUnlockSuccess() {
        this.isLocked = false;
        if(this.lockClockInterval) clearInterval(this.lockClockInterval);
        sessionStorage.removeItem('dialysis_is_locked'); 
        document.getElementById('lock-screen-overlay')?.remove();
        this.resetIdleTimer();
    }

    checkAuth() {
        if (sessionStorage.getItem('dialysis_is_locked') === 'true') {
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

        document.documentElement.classList.remove('not-logged-in');
        document.getElementById('anti-flash-style')?.remove();

        if(sidebar) { sidebar.style.display = ''; sidebar.style.opacity = '1'; sidebar.style.visibility = 'visible'; }
        if(topbar) { topbar.style.display = 'flex'; topbar.style.opacity = '1'; topbar.style.visibility = 'visible'; }
        if(mainContent) { mainContent.style.marginLeft = ''; mainContent.style.background = ''; }
        if(appContent) { appContent.style.padding = ''; appContent.style.opacity = '1'; }

        try {
            this.currentUser = JSON.parse(sessionStr);
            const userInfoName = document.querySelector('.user-info h4');
            if (userInfoName && this.currentUser) {
                const roleLabels = {
                    'admin': '(ผู้ดูแลระบบ)', 'doctor': '(แพทย์)', 'head_nurse': '(หัวหน้าพยาบาล)',
                    'nurse': '(พยาบาลไตเทียม)', 'assistant': '(ผู้ช่วย PN/NA)', 'finance': '(การเงิน)', 'stock': '(เจ้าหน้าที่พัสดุ)'
                };
                let roleTitle = roleLabels[this.currentUser.role] || '(พนักงานทั่วไป)';
                let safeName = this.currentUser.name || 'ไม่ระบุชื่อ';
                userInfoName.innerText = `${safeName} ${roleTitle}`;
                
                const avatar = document.querySelector('.user-avatar');
                if(avatar) avatar.innerText = safeName.substring(0, 2).toUpperCase();
            }
            this._startAgentSyncPolling();
        } catch (e) {
            console.error("[Router] Session parse error", e);
            sessionStorage.removeItem('dialysis_user_session');
            this.switchPage('login');
            return false;
        }

        this.setupIdleTimer();
        if (this.isLocked) this.lockScreen();

        return true; 
    }

    // ==========================================
    // 🌐 AGENT SYNC (Smart Polling with Exponential Backoff)
    // ==========================================
    _startAgentSyncPolling() {
        if (this.agentSyncTimer) clearTimeout(this.agentSyncTimer);
        this.agentRetryCount = 0;
        this._syncAgentVersion();
    }

    _syncAgentVersion() {
        let currentVersion = typeof AboutPage !== 'undefined' && AboutPage.version ? AboutPage.version : "6.0.0 (Quantum Resilient Edition)";
        
        fetch(`http://127.0.0.1:8000/health?v=${encodeURIComponent(currentVersion)}`, { method: 'GET', mode: 'cors' })
            .then(res => res.json())
            .then(() => {
                // อัปเดตสำเร็จ รีเซ็ต Retry และเช็คใหม่ตามปกติทุก 10 วิ
                this.agentRetryCount = 0;
                this.agentSyncTimer = setTimeout(() => this._syncAgentVersion(), 10000);
            })
            .catch(() => {
                // 🚨 THE FIX: Exponential Backoff (ถ้ายิงไม่ติด ยืดเวลารอออกไปเรื่อยๆ สูงสุด 1 นาที) ป้องกัน CPU พัง
                this.agentRetryCount++;
                const delay = Math.min(1000 * Math.pow(2, this.agentRetryCount), 60000);
                this.agentSyncTimer = setTimeout(() => this._syncAgentVersion(), delay);
            });
    }
}

// 🌐 Expose & Initialize System
window.App = new CoreApplicationRouter();

// =========================================================================
// 🚨 Cross-Tab Session Synchronization (Broadcast Channel Fallback)
// =========================================================================
if (!sessionStorage.getItem('dialysis_user_session')) {
    localStorage.setItem('DIALYSIS_AUTH_SYNC_REQUEST', Date.now().toString());
}

window.addEventListener('storage', (event) => {
    if (event.key === 'DIALYSIS_AUTH_SYNC_REQUEST') {
        const sessionData = sessionStorage.getItem('dialysis_user_session');
        if (sessionData) {
            localStorage.setItem('DIALYSIS_AUTH_SYNC_RESPONSE', sessionData);
            setTimeout(() => localStorage.removeItem('DIALYSIS_AUTH_SYNC_RESPONSE'), 100); 
        }
    }
    if (event.key === 'DIALYSIS_AUTH_SYNC_RESPONSE' && event.newValue) {
        if (!sessionStorage.getItem('dialysis_user_session')) {
            sessionStorage.setItem('dialysis_user_session', event.newValue);
            window.location.reload(); 
        }
    }
});

// Bootstrapping the OS
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
            if (data?.clinic_name) {
                const brandText = document.querySelector('.brand-text h3');
                if (brandText) brandText.textContent = data.clinic_name; // Security: Use textContent
            }
        });
    }

    setTimeout(() => {
        const isAuthenticated = App.checkAuth();
        if (!isAuthenticated) return;

        const role = App.currentUser?.role || 'nurse';
        const permissionsSrc = Object.keys(App.rolePermissions).length > 0 ? App.rolePermissions : App.defaultRolePermissions;
        const allowed = permissionsSrc[role] || [];
        
        const urlParams = new URLSearchParams(window.location.search);
        const requestedPage = urlParams.get('page');
        let defaultPage = 'dashboard';
        
        if (requestedPage && typeof App.getPages()[requestedPage] !== 'undefined') {
            if (allowed.includes('*') || allowed.includes(requestedPage)) {
                defaultPage = requestedPage;
            } else {
                if (typeof Swal !== 'undefined') Swal.fire('ห้ามเข้า', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้', 'error');
                defaultPage = allowed.length > 0 ? allowed[0] : 'login';
            }
        } else if (!allowed.includes('*') && !allowed.includes('dashboard')) {
            defaultPage = allowed.length > 0 ? allowed[0] : 'login';
        }
        
        const defaultMenu = document.querySelector(`.nav-item[data-page="${defaultPage}"]`);
        App.switchPage(defaultPage, defaultMenu);

        if (requestedPage) {
            setTimeout(() => window.history.replaceState({}, document.title, window.location.pathname), 1000);
        }
    }, 150);
});

window.addEventListener('beforeunload', function () {
    const agentUrl = 'http://127.0.0.1:8000/shutdown'; 
    try { navigator.sendBeacon(agentUrl); } catch (e) {}
});