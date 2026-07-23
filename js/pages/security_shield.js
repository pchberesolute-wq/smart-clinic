// js/pages/security_shield.js
// 🛡️ Enterprise Security Service: 8-Axis Resizable, Zero-Lag & Volatile Session OS Engine

class SecurityShieldService {
    constructor() {
        this.selectedTextToCopy = ""; 
        this.lastTargetInput = null; 
        this.targetPageUrl = null; 
        this.osZIndexCounter = 999000; 
        this.MAX_WINDOWS = 8; // 🚨 ป้องกัน RAM ทะลัก

        this.boundContextMenu = this.#handleContextMenu.bind(this);
        this.boundClickOutside = this.#handleClickOutside.bind(this);
        this.boundKeyDown = this.#handleKeyDown.bind(this);
        this.boundMouseUp = this.#handleMouseUp.bind(this);
    }

    init() {
        this.#preventClickjacking();
        this.#applyVirtualTabMode(); 
        this.#injectNativeToast(); 
        this.#injectGlobalPrintFix(); 
        this.#setupCustomContextMenu(); 
        
        this.#secureLocalStorage();
        this.#hijackConsole();
        
        // 🚨 THE FIX 1: ตามล้างข้อมูลผีดิบจากเวอร์ชันเก่าทิ้งให้เกลี้ยง
        localStorage.removeItem('dialysis_os_windows_state');

        if (window.self === window.top) {
            this.#restoreWindowsState();
            console.log("%c🛡️ [Security Shield] Volatile Session OS Activated.", "color: #10b981; font-weight: bold; font-size: 14px;");
        } else {
            console.log("%c🛡️ [Virtual Tab] Instance Activated (Shell Hidden).", "color: #3b82f6; font-weight: bold; font-size: 12px;");
        }
    }

    // =========================================================================
    // 🚀 VIRTUAL TAB ENGINE (ลบเปลือกนอก Sidebar & Topbar ทิ้ง)
    // =========================================================================
    #applyVirtualTabMode() {
        if (window.self !== window.top) {
            document.body.classList.add('is-virtual-tab');
            
            const style = document.createElement('style');
            style.id = 'virtual-tab-engine-style';
            style.innerHTML = `
                /* 🚨 NUCLEAR HIDE: ระเบิดแถบเมนูด้านซ้ายและด้านบนทิ้งทั้งหมด */
                #sidebar, .sidebar, aside { display: none !important; width: 0 !important; opacity: 0 !important; pointer-events: none !important; }
                .topbar, #topbar, .navbar, header, nav { display: none !important; height: 0 !important; margin: 0 !important; padding: 0 !important; opacity: 0 !important; pointer-events: none !important; }
                
                /* 🚨 EXPAND CONTENT: ขยายเนื้อหาหลักให้เต็มพื้นที่หน้าต่างซ้อน 100% */
                body { background: var(--bg-body) !important; overflow-x: hidden !important; }
                .main-content, #main-content, .content-wrapper, .page-wrapper, #app-content {
                    margin-left: 0 !important;
                    margin-top: 0 !important;
                    padding: 15px !important;
                    width: 100vw !important;
                    max-width: 100% !important;
                    height: 100vh !important;
                    min-height: 100vh !important;
                    position: absolute !important;
                    top: 0 !important;
                    left: 0 !important;
                    background: var(--bg-body) !important;
                }

                .mobile-toggle, .sidebar-toggle, .menu-toggle { display: none !important; }
            `;
            document.head.appendChild(style);
        }
    }

    // =========================================================================
    // 🛡️ SECURITY PROTOCOLS
    // =========================================================================
    #preventClickjacking() {
        try { 
            if (window.location.protocol === 'file:') return; 
            if (window.top !== window.self) {
                if (window.top.location.hostname !== window.self.location.hostname) {
                    window.top.location = window.self.location;
                }
            } 
        } catch (e) { window.top.location = window.self.location; }
    }

    #secureLocalStorage() {
        try { Object.defineProperty(window, 'localStorage', { configurable: false, enumerable: false, value: window.localStorage }); } catch (e) {}
    }

    #hijackConsole() {
        setTimeout(() => {
            console.log("%cหยุดนะ! (STOP!)", "color: red; font-size: 50px; font-weight: bold; text-shadow: 2px 2px 0 #000;");
            console.log("%cคุณกำลังเข้าสู่พื้นที่สำหรับนักพัฒนา (Developer Area) การนำโค้ดที่ไม่ได้อนุญาตมาวางที่นี่อาจทำให้ข้อมูลเวชระเบียนสูญหายหรือถูกขโมยได้!", "font-size: 14px; color: #333;");
        }, 1000);
    }

    #injectGlobalPrintFix() {
        if (document.getElementById('global-print-fix')) return;
        const style = document.createElement('style');
        style.id = 'global-print-fix';
        style.innerHTML = `
            @media print {
                body, .main-content, .modern-panel, .card, h1, h2, h3, h4, h5, h6, p, span, div, th, td, label, i { color: #000000 !important; -webkit-text-fill-color: #000000 !important; text-shadow: none !important; }
                body, .main-content { background-color: #ffffff !important; }
                .modern-panel, .card { background-color: transparent !important; }
                #sidebar, .topbar, .floating-action-bar, #clinic-smart-menu, .btn, .search-box-modern, .os-window { display: none !important; }
                .main-content { margin-left: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
                .table-responsive { overflow: visible !important; max-height: none !important; }
                .table-premium, .table-analytics { border: 1px solid #000 !important; }
                .table-premium th, .table-premium td, .table-analytics th, .table-analytics td { border: 1px solid #000 !important; padding: 8px !important; }
                .modern-panel, .card, .stat-card-premium { page-break-inside: avoid !important; border: 1px solid #666 !important; box-shadow: none !important; margin-bottom: 20px !important; }
            }
        `;
        document.head.appendChild(style);
    }

    #injectNativeToast() {
        if (document.getElementById('dialysisPoaster')) return; 
        const style = document.createElement('style');
        style.id = 'dialysis-global-toast-style';
        style.innerHTML = `
            body .dialysis-custom-toast {
                position: fixed; top: 30px; right: 30px;
                background: #ffffff !important; box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.15) !important;
                border-radius: 50px !important; padding: 12px 28px !important;
                font-family: 'Prompt', sans-serif !important; color: #0f172a !important;
                font-weight: 700 !important; font-size: 15px !important; z-index: 99999999 !important;
                display: flex; align-items: center; gap: 12px;
                transform: translate3d(120%, 0, 0); opacity: 0;
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15), opacity 0.3s ease; pointer-events: none;
            }
            body .dialysis-custom-toast.show { transform: translate3d(0, 0, 0); opacity: 1; }
            body .dialysis-custom-toast.toast-success { border: 2px solid #10b981 !important; }
            body .dialysis-custom-toast.toast-warning { border: 2px solid #f59e0b !important; }
            html[data-bs-theme="dark"] body .dialysis-custom-toast { background: #1e293b !important; color: #f8fafc !important; box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.6) !important; }
            html[data-bs-theme="dark"] body .dialysis-custom-toast.toast-success { border: 2px solid #059669 !important; }
            html[data-bs-theme="dark"] body .dialysis-custom-toast.toast-warning { background: #451a03 !important; border: 2px solid #fb923c !important; color: #fde68a !important; }
        `;
        document.head.appendChild(style);
        document.body.insertAdjacentHTML('beforeend', `
            <div id="dialysisPoaster" class="dialysis-custom-toast toast-success">
                <div id="toast-icon-bg" class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center shadow-sm" style="width:28px; height:28px; flex-shrink: 0;"><i id="toast-icon" class="fa-solid fa-check" style="font-size:14px;"></i></div>
                <span id="dialysisPoasterText">ข้อความแจ้งเตือน</span>
            </div>
        `);
    }

    showNativeToast(message, isWarning = false) {
        const toast = document.getElementById('dialysisPoaster');
        const toastText = document.getElementById('dialysisPoasterText');
        if (!toast || !toastText) { this.#injectNativeToast(); return this.showNativeToast(message, isWarning); }

        toastText.innerText = message;
        const iconContainer = document.getElementById('toast-icon-bg'); const icon = document.getElementById('toast-icon');
        
        if (isWarning) {
            toast.classList.remove('toast-success'); toast.classList.add('toast-warning');
            iconContainer.className = 'rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center shadow-sm'; icon.className = 'fa-solid fa-exclamation';
        } else {
            toast.classList.remove('toast-warning'); toast.classList.add('toast-success');
            iconContainer.className = 'rounded-circle bg-success text-white d-flex align-items-center justify-content-center shadow-sm'; icon.className = 'fa-solid fa-check';
        }

        toast.classList.add('show');
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => toast.classList.remove('show'), 1500);
    }

    #setupCustomContextMenu() {
        if (document.getElementById('clinic-smart-menu')) return; 

        const menuStyle = `
            <style id="smart-menu-styles">
                :root { --sm-bg: rgba(255, 255, 255, 0.95); --sm-text: #1e293b; --sm-border: rgba(226, 232, 240, 0.8); --sm-hover: #f1f5f9; --sm-shadow: 0 20px 40px -10px rgba(0,0,0,0.15); --sm-divider: #e2e8f0; --sm-header-bg: #f8fafc; }
                html[data-bs-theme="dark"] { --sm-bg: rgba(15, 23, 42, 0.85); --sm-text: #f8fafc; --sm-border: rgba(255, 255, 255, 0.1); --sm-hover: rgba(255, 255, 255, 0.1); --sm-shadow: 0 25px 50px -12px rgba(0,0,0,0.8); --sm-divider: rgba(255, 255, 255, 0.1); --sm-header-bg: rgba(0, 0, 0, 0.3); }
                
                .smart-menu-container { position: fixed; display: none; z-index: 9999999; width: 340px; padding: 6px; background: var(--sm-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid var(--sm-border); border-radius: 16px; box-shadow: var(--sm-shadow); font-family: 'Sarabun', sans-serif; transform-origin: top left; animation: smPopIn 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; user-select: none; }
                @keyframes smPopIn { 0% { opacity: 0; transform: scale(0.95) translateY(-5px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
                
                .smart-menu-header { padding: 10px 14px; font-size: 11px; font-weight: 800; font-family: 'Prompt'; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; background: var(--sm-header-bg); border-radius: 10px 10px 4px 4px; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; }
                .smart-menu-item { padding: 10px 14px; margin: 2px 0; border-radius: 10px; font-size: 14.5px; font-weight: 600; color: var(--sm-text); cursor: pointer; display: flex; align-items: center; transition: all 0.2s ease; white-space: nowrap; }
                .smart-menu-item:hover { background: var(--sm-hover); transform: translateX(4px); }
                .smart-menu-item i { width: 22px; font-size: 16px; text-align: center; margin-right: 12px; flex-shrink: 0; }
                .smart-menu-item .shortcut { margin-left: auto; font-size: 11px; color: #94a3b8; font-family: monospace; font-weight: 700; flex-shrink: 0; padding-left: 15px; }
                .smart-menu-divider { height: 1px; background: var(--sm-divider); margin: 6px 10px; }

                /* 🚀 8-AXIS MULTI-WINDOW CSS */
                .os-window {
                    position: fixed; width: 1000px; height: 700px; min-width: 320px; min-height: 200px;
                    background: var(--bg-surface); border: 1px solid var(--border-color);
                    border-radius: 14px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                    display: flex; flex-direction: column; overflow: hidden; 
                    transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s;
                    transform-origin: center; animation: winPop 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    will-change: left, top, width, height, transform; 
                }
                @keyframes winPop { 0% { opacity: 0; transform: scale(0.95) translateY(20px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
                
                .os-title-bar { 
                    height: 36px; background: var(--bg-body); border-bottom: 1px solid var(--border-color);
                    display: flex; justify-content: space-between; align-items: center; padding: 0 12px;
                    cursor: grab; user-select: none; flex-shrink: 0;
                }
                .os-title-bar:active { cursor: grabbing; }
                .os-title-text { font-family: 'Prompt', sans-serif; font-size: 13px; font-weight: 700; color: var(--text-dark); display: flex; align-items: center; pointer-events: none; }
                
                .os-controls { display: flex; gap: 6px; position: relative; z-index: 102; }
                .os-btn { width: 30px; height: 24px; border: none; background: transparent; color: var(--text-muted); border-radius: 6px; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center; font-size: 12px; }
                .os-btn:hover { background: rgba(0,0,0,0.08); color: var(--text-dark); }
                .os-close:hover { background: #ef4444 !important; color: white !important; }
                html[data-bs-theme="dark"] .os-btn:hover { background: rgba(255,255,255,0.1); color: white; }

                .os-content { flex-grow: 1; position: relative; background: var(--bg-surface); height: calc(100% - 36px); }
                .os-content iframe { width: 100%; height: 100%; border: none; display: block; }
                
                .os-window-overlay { position: absolute; top:0; left:0; right:0; bottom:0; z-index: 10; display: none; }
                .os-window.is-dragging .os-window-overlay { display: block; }

                /* 8-Axis Resize Handles */
                .os-resize-handle { position: absolute; z-index: 100; background: transparent; }
                .os-resize-n { top: 0; left: 10px; right: 10px; height: 6px; cursor: n-resize; }
                .os-resize-s { bottom: 0; left: 10px; right: 10px; height: 6px; cursor: s-resize; }
                .os-resize-e { top: 10px; bottom: 10px; right: 0; width: 6px; cursor: e-resize; }
                .os-resize-w { top: 10px; bottom: 10px; left: 0; width: 6px; cursor: w-resize; }
                .os-resize-nw { top: 0; left: 0; width: 12px; height: 12px; cursor: nw-resize; z-index: 101; }
                .os-resize-ne { top: 0; right: 0; width: 12px; height: 12px; cursor: ne-resize; z-index: 101; }
                .os-resize-sw { bottom: 0; left: 0; width: 12px; height: 12px; cursor: sw-resize; z-index: 101; }
                .os-resize-se { bottom: 0; right: 0; width: 12px; height: 12px; cursor: se-resize; z-index: 101; }
                
                .os-window.maximized .os-resize-handle, .os-window.minimized .os-resize-handle { display: none !important; }

                /* Window States */
                .os-window.maximized { width: 100vw !important; height: 100vh !important; max-width: 100vw !important; left: 0 !important; top: 0 !important; border-radius: 0 !important; }
                
                .os-window.minimized { 
                    width: 240px !important; height: 40px !important; min-width: 240px !important; min-height: 40px !important;
                    border-radius: 8px 8px 0 0 !important; 
                    transform: scale(1) !important; cursor: pointer; box-shadow: 0 -4px 15px rgba(0,0,0,0.1); 
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .os-window.minimized .os-content { display: none; }
                .os-window.minimized .os-title-bar { height: 100%; cursor: pointer; background: var(--bg-surface); border-top: 2px solid var(--primary); }
                .os-window.minimized .os-title-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px; }
            </style>
        `;

        const menuHtml = `
            <div id="clinic-smart-menu" class="smart-menu-container">
                <div class="smart-menu-header">
                    <span><i class="fa-solid fa-shield-halved text-success me-1"></i> SMART OS MENU</span>
                    <i class="fa-solid fa-bars-staggered" style="opacity: 0.5;"></i>
                </div>
                
                <div class="smart-menu-item" id="sm-new-tab" style="display:none;"><i class="fa-solid fa-layer-group text-warning"></i> เปิดหน้าต่างซ้อน (Virtual Tab) <span class="shortcut">New</span></div>
                <div class="smart-menu-divider" id="sm-new-tab-divider" style="display:none;"></div>

                <div class="smart-menu-item" id="sm-copy"><i class="fa-regular fa-copy text-primary"></i> คัดลอกข้อความ <span class="shortcut">Ctrl+C</span></div>
                <div class="smart-menu-item" id="sm-cut"><i class="fa-solid fa-scissors text-danger"></i> ตัดข้อความ <span class="shortcut">Ctrl+X</span></div>
                <div class="smart-menu-item" id="sm-paste"><i class="fa-regular fa-clipboard text-success"></i> วางข้อความ <span class="shortcut">Ctrl+V</span></div>
                <div class="smart-menu-item" id="sm-select-all"><i class="fa-solid fa-object-group text-secondary"></i> เลือกทั้งหมด <span class="shortcut">Ctrl+A</span></div>
                <div class="smart-menu-divider"></div>
                <div class="smart-menu-item" id="sm-home"><i class="fa-solid fa-house-medical text-primary"></i> กลับหน้าหลัก (Dashboard)</div>
                <div class="smart-menu-item" id="sm-refresh"><i class="fa-solid fa-rotate-right text-info"></i> รีเฟรชฐานข้อมูล <span class="shortcut">F5</span></div>
                <div class="smart-menu-divider"></div>
                <div class="smart-menu-item" id="sm-lock"><i class="fa-solid fa-lock text-danger"></i> ล็อกหน้าจอทันที (Lock) <span class="shortcut">Win+L</span></div>
            </div>
        `;
        document.head.insertAdjacentHTML('beforeend', menuStyle);
        document.body.insertAdjacentHTML('beforeend', menuHtml);

        document.getElementById('sm-new-tab').addEventListener('click', () => {
            if (this.targetPageUrl) {
                const baseUrl = window.location.href.split('?')[0].split('#')[0];
                const newUrl = `${baseUrl}?page=${this.targetPageUrl}`;
                
                const navItem = document.querySelector(`.nav-item[data-page="${this.targetPageUrl}"]`);
                let winTitle = navItem ? navItem.innerText.trim() : "หน้าต่างการทำงาน";
                
                this.#spawnMultiWindow(newUrl, winTitle);
            }
            this.#closeMenu();
        });

        document.getElementById('sm-copy').addEventListener('click', () => this.handleCopy());
        document.getElementById('sm-cut').addEventListener('click', () => this.handleCut());
        document.getElementById('sm-paste').addEventListener('click', () => this.handlePaste());
        document.getElementById('sm-select-all').addEventListener('click', () => this.handleSelectAll());
        document.getElementById('sm-home').addEventListener('click', () => { if(typeof App !== 'undefined') App.switchPage('dashboard'); this.#closeMenu(); });
        document.getElementById('sm-refresh').addEventListener('click', () => window.location.reload());
        document.getElementById('sm-lock').addEventListener('click', () => { this.#closeMenu(); if(typeof App !== 'undefined' && typeof App.lockScreen === 'function') App.lockScreen(); });

        document.addEventListener('contextmenu', this.boundContextMenu);
        document.addEventListener('click', this.boundClickOutside);
        document.addEventListener('keydown', this.boundKeyDown);
        document.addEventListener('mouseup', this.boundMouseUp); 
    }

    // =========================================================================
    // 🚀 VOLATILE SESSION OS ENGINE (🚨 THE FIX: เปลี่ยนเป็น SessionStorage)
    // =========================================================================
    #saveWindowsState() {
        if (window.self !== window.top) return; 

        const wins = document.querySelectorAll('.os-window');
        const state = [];
        
        wins.forEach(w => {
            state.push({
                id: w.id,
                url: w.dataset.url, 
                title: w.dataset.title, 
                left: w.style.left,
                top: w.style.top,
                width: w.style.width,
                height: w.style.height,
                zIndex: w.style.zIndex,
                isMinimized: w.classList.contains('minimized'),
                isMaximized: w.classList.contains('maximized'),
                preMinLeft: w.dataset.preMinLeft || '',
                preMinTop: w.dataset.preMinTop || '',
                preMinWidth: w.dataset.preMinWidth || '',
                preMinHeight: w.dataset.preMinHeight || ''
            });
        });
        
        // 🚨 THE FIX: บันทึกลง sessionStorage แทน เพื่อให้เคลียร์อัตโนมัติเมื่อปิดโปรแกรม
        sessionStorage.setItem('dialysis_os_session_windows', JSON.stringify(state));
    }

    #restoreWindowsState() {
        if (window.self !== window.top) return; 

        try {
            // 🚨 THE FIX: ดึงข้อมูลจาก sessionStorage
            const savedStateStr = sessionStorage.getItem('dialysis_os_session_windows');
            if (!savedStateStr) return;
            
            const states = JSON.parse(savedStateStr);
            if (!Array.isArray(states)) return;

            states.forEach(s => {
                if(!s.url || !s.title) return;
                this.#spawnMultiWindow(s.url, s.title, s);
            });
        } catch (e) {
            console.error("Failed to restore windows state:", e);
        }
    }

    // =========================================================================
    // 🚀 NANO WINDOW MANAGER (Drag & Omni-Resize)
    // =========================================================================
    #spawnMultiWindow(url, titleText, savedState = null) {
        const existingWinsList = document.querySelectorAll('.os-window');
        if (!savedState && existingWinsList.length >= this.MAX_WINDOWS) {
            this.showNativeToast(`เพื่อป้องกันระบบหน่วง กรุณาปิดหน้าต่างเก่าก่อน (จำกัด ${this.MAX_WINDOWS} หน้าต่าง)`, true);
            return;
        }

        this.osZIndexCounter++;
        const winId = savedState ? savedState.id : 'os-win-' + Date.now() + Math.floor(Math.random() * 1000);
        
        const win = document.createElement('div');
        win.className = 'os-window';
        win.id = winId;
        
        win.dataset.url = url;
        win.dataset.title = titleText;
        
        if (savedState) {
            win.style.zIndex = savedState.zIndex || this.osZIndexCounter;
            win.style.left = savedState.left;
            win.style.top = savedState.top;
            win.style.width = savedState.width;
            win.style.height = savedState.height;
            
            win.dataset.preMinLeft = savedState.preMinLeft;
            win.dataset.preMinTop = savedState.preMinTop;
            win.dataset.preMinWidth = savedState.preMinWidth;
            win.dataset.preMinHeight = savedState.preMinHeight;
            
            if(savedState.isMinimized) win.classList.add('minimized');
            if(savedState.isMaximized) win.classList.add('maximized');
            
            if(parseInt(win.style.zIndex) >= this.osZIndexCounter) {
                this.osZIndexCounter = parseInt(win.style.zIndex) + 1;
            }
        } else {
            win.style.zIndex = this.osZIndexCounter;
            const existingWinsCount = document.querySelectorAll('.os-window:not(.minimized)').length;
            const offset = (existingWinsCount * 30) % 150;
            win.style.top = (60 + offset) + 'px';
            win.style.left = (150 + offset) + 'px';
        }

        let maxIcon = savedState && savedState.isMaximized ? '<i class="fa-regular fa-clone"></i>' : '<i class="fa-regular fa-square"></i>';
        let minIcon = savedState && savedState.isMinimized ? '<i class="fa-regular fa-window-restore"></i>' : '<i class="fa-solid fa-minus"></i>';

        win.innerHTML = `
            <div class="os-resize-handle os-resize-n"></div>
            <div class="os-resize-handle os-resize-e"></div>
            <div class="os-resize-handle os-resize-s"></div>
            <div class="os-resize-handle os-resize-w"></div>
            <div class="os-resize-handle os-resize-nw"></div>
            <div class="os-resize-handle os-resize-ne"></div>
            <div class="os-resize-handle os-resize-se"></div>
            <div class="os-resize-handle os-resize-sw"></div>
            
            <div class="os-title-bar">
                <div class="os-title-text"><i class="fa-solid fa-layer-group text-primary me-2"></i> ${titleText}</div>
                <div class="os-controls">
                    <button class="os-btn os-min" title="ย่อหน้าต่าง (Minimize)">${minIcon}</button>
                    <button class="os-btn os-max" title="ขยายเต็มจอ (Maximize)">${maxIcon}</button>
                    <button class="os-btn os-close" title="ปิด (Close)"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </div>
            <div class="os-content">
                <div class="os-window-overlay"></div>
                <iframe src="${(savedState && savedState.isMinimized) ? 'about:blank' : url}" loading="lazy" data-real-src="${url}"></iframe>
            </div>
        `;
        document.body.appendChild(win);

        win.addEventListener('mousedown', () => {
            this.osZIndexCounter++;
            win.style.zIndex = this.osZIndexCounter;
            this.#saveWindowsState(); 
        });

        let dragRafId = null; 

        // ================= 1. ZERO-LAG DRAG LOGIC =================
        const titleBar = win.querySelector('.os-title-bar');
        let isDragging = false, startX, startY, startLeft, startTop;

        const onDragMove = (e) => {
            if(!isDragging) return;
            if (dragRafId) cancelAnimationFrame(dragRafId);
            
            dragRafId = requestAnimationFrame(() => {
                let dx = e.clientX - startX;
                let dy = e.clientY - startY;
                win.style.left = (startLeft + dx) + 'px';
                win.style.top = (startTop + dy) + 'px';
            });
        };

        const onDragUp = () => {
            if(isDragging) {
                isDragging = false;
                if (dragRafId) cancelAnimationFrame(dragRafId);
                win.style.transition = 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s';
                win.classList.remove('is-dragging');
                document.removeEventListener('mousemove', onDragMove);
                document.removeEventListener('mouseup', onDragUp);
                
                this.#saveWindowsState(); 
            }
        };

        titleBar.addEventListener('mousedown', (e) => {
            if(e.target.closest('.os-btn') || win.classList.contains('maximized')) return;
            
            if(win.classList.contains('minimized')) {
                win.classList.remove('minimized');
                win.style.left = win.dataset.preMinLeft || '150px';
                win.style.top = win.dataset.preMinTop || '60px';
                win.querySelector('.os-min').innerHTML = '<i class="fa-solid fa-minus"></i>';
                
                const iframe = win.querySelector('iframe');
                if(iframe.src === 'about:blank' || iframe.src.includes('about:blank')) {
                    iframe.src = iframe.dataset.realSrc;
                }
                
                this.#reorganizeDock();
                this.#saveWindowsState(); 
                return;
            }

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            
            const rect = win.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;
            
            win.style.transition = 'none'; 
            win.classList.add('is-dragging'); 

            document.addEventListener('mousemove', onDragMove);
            document.addEventListener('mouseup', onDragUp);
        });

        // ================= 2. 8-AXIS OMNI-RESIZE LOGIC =================
        const resizeHandles = win.querySelectorAll('.os-resize-handle');
        let isResizing = false;
        let resizeDir = '';
        let startW, startH;
        
        const MIN_W = 320;
        const MIN_H = 200;

        const onResizeMove = (e) => {
            if (!isResizing) return;
            if (dragRafId) cancelAnimationFrame(dragRafId);
            
            dragRafId = requestAnimationFrame(() => {
                let dx = e.clientX - startX;
                let dy = e.clientY - startY;

                let newW = startW;
                let newH = startH;
                let newL = startLeft;
                let newT = startTop;

                if (resizeDir.includes('e')) {
                    newW = Math.max(MIN_W, startW + dx);
                } else if (resizeDir.includes('w')) {
                    newW = Math.max(MIN_W, startW - dx);
                    newL = startLeft + (startW - newW); 
                }

                if (resizeDir.includes('s')) {
                    newH = Math.max(MIN_H, startH + dy);
                } else if (resizeDir.includes('n')) {
                    newH = Math.max(MIN_H, startH - dy);
                    newT = startTop + (startH - newH); 
                }

                win.style.width = newW + 'px';
                win.style.height = newH + 'px';
                if (resizeDir.includes('w')) win.style.left = newL + 'px';
                if (resizeDir.includes('n')) win.style.top = newT + 'px';
            });
        };

        const onResizeUp = () => {
            if (isResizing) {
                isResizing = false;
                if (dragRafId) cancelAnimationFrame(dragRafId);
                win.style.transition = 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s';
                win.classList.remove('is-dragging'); 
                
                document.removeEventListener('mousemove', onResizeMove);
                document.removeEventListener('mouseup', onResizeUp);
                
                this.#saveWindowsState(); 
            }
        };

        resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                if (win.classList.contains('maximized') || win.classList.contains('minimized')) return;
                e.stopPropagation();
                
                isResizing = true;
                
                const classList = Array.from(handle.classList);
                const resizeClass = classList.find(c => c.startsWith('os-resize-') && c !== 'os-resize-handle');
                resizeDir = resizeClass.replace('os-resize-', '');

                startX = e.clientX;
                startY = e.clientY;
                
                const rect = win.getBoundingClientRect();
                startLeft = rect.left;
                startTop = rect.top;
                startW = rect.width;
                startH = rect.height;

                win.style.transition = 'none'; 
                win.classList.add('is-dragging'); 
                
                document.addEventListener('mousemove', onResizeMove);
                document.addEventListener('mouseup', onResizeUp);
            });
        });

        // ================= WINDOW CONTROLS =================
        let isMaximized = savedState ? savedState.isMaximized : false;
        let preMaxState = { left: '', top: '', width: '', height: '' };

        // ❌ Close Button
        win.querySelector('.os-close').addEventListener('click', (e) => {
            e.stopPropagation();
            win.style.transform = 'scale(0.9)';
            win.style.opacity = '0';
            
            const iframe = win.querySelector('iframe');
            if(iframe) iframe.src = 'about:blank'; 
            
            setTimeout(() => {
                win.remove();
                this.#reorganizeDock();
                this.#saveWindowsState(); 
            }, 200);
        });

        // 🔲 Maximize Button
        win.querySelector('.os-max').addEventListener('click', (e) => {
            e.stopPropagation();
            
            if(win.classList.contains('minimized')) {
                win.classList.remove('minimized');
                win.querySelector('.os-min').innerHTML = '<i class="fa-solid fa-minus"></i>';
                
                const iframe = win.querySelector('iframe');
                if(iframe.src === 'about:blank' || iframe.src.includes('about:blank')) {
                    iframe.src = iframe.dataset.realSrc;
                }
                this.#reorganizeDock();
            }

            if(!isMaximized) {
                preMaxState = { left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height };
                win.classList.add('maximized');
                win.style.left = '0'; win.style.top = '0'; 
                win.style.width = ''; win.style.height = ''; 
                win.querySelector('.os-max').innerHTML = '<i class="fa-regular fa-clone"></i>';
                isMaximized = true;
            } else {
                win.classList.remove('maximized');
                win.style.left = preMaxState.left; 
                win.style.top = preMaxState.top; 
                win.style.width = preMaxState.width; 
                win.style.height = preMaxState.height; 
                win.querySelector('.os-max').innerHTML = '<i class="fa-regular fa-square"></i>';
                isMaximized = false;
            }
            this.#saveWindowsState(); 
        });

        // ➖ Minimize Button
        win.querySelector('.os-min').addEventListener('click', (e) => {
            e.stopPropagation();
            if(!win.classList.contains('minimized')) {
                if(!isMaximized) {
                    win.dataset.preMinLeft = win.style.left;
                    win.dataset.preMinTop = win.style.top;
                    win.dataset.preMinWidth = win.style.width;
                    win.dataset.preMinHeight = win.style.height;
                }
                win.classList.add('minimized');
                win.classList.remove('maximized'); 
                win.style.width = ''; win.style.height = ''; 
                isMaximized = false;
                win.querySelector('.os-max').innerHTML = '<i class="fa-regular fa-square"></i>';
                win.querySelector('.os-min').innerHTML = '<i class="fa-regular fa-window-restore"></i>'; 
                
                const iframe = win.querySelector('iframe');
                if(iframe) iframe.src = 'about:blank';
                
                this.#reorganizeDock();
            } else {
                win.classList.remove('minimized');
                win.style.left = win.dataset.preMinLeft || '150px';
                win.style.top = win.dataset.preMinTop || '60px';
                win.style.width = win.dataset.preMinWidth || '1000px';
                win.style.height = win.dataset.preMinHeight || '700px';
                win.querySelector('.os-min').innerHTML = '<i class="fa-solid fa-minus"></i>';
                
                const iframe = win.querySelector('iframe');
                if(iframe) iframe.src = iframe.dataset.realSrc;
                
                this.#reorganizeDock();
            }
            this.#saveWindowsState(); 
        });
        
        if(!savedState) this.#saveWindowsState();
    }

    #reorganizeDock() {
        const minimizedWins = document.querySelectorAll('.os-window.minimized');
        let dockOffset = 20;
        minimizedWins.forEach((w) => {
            w.style.left = dockOffset + 'px';
            w.style.top = 'auto';
            w.style.bottom = '0px';
            dockOffset += 250; 
        });
    }
    // =========================================================================

    #handleMouseUp(e) {
        if (e.target.closest('#clinic-smart-menu') || e.target.closest('.os-window')) return;
        if (e.button === 2) return;

        let selectedText = "";
        const target = e.target;

        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            this.lastTargetInput = target;
            if (target.selectionStart !== target.selectionEnd) {
                selectedText = target.value.substring(target.selectionStart, target.selectionEnd);
            }
        } else {
            this.lastTargetInput = null;
            selectedText = window.getSelection().toString();
        }

        if (selectedText.trim().length > 0) {
            this.selectedTextToCopy = selectedText;
            const menu = document.getElementById('clinic-smart-menu');
            if (!menu) return;

            document.getElementById('sm-new-tab').style.display = 'none';
            document.getElementById('sm-new-tab-divider').style.display = 'none';

            let x = e.pageX; let y = e.pageY + 15; 
            menu.style.display = 'block'; 
            
            const menuWidth = menu.offsetWidth; const menuHeight = menu.offsetHeight;
            if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
            if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;

            menu.style.left = `${x}px`; menu.style.top = `${y}px`;
        } else {
            this.#closeMenu();
        }
    }

    #handleContextMenu(e) {
        if(e.target.closest('.os-window')) return;

        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (isTouchDevice || window.innerWidth <= 800) return; 

        const target = e.target;
        const menu = document.getElementById('clinic-smart-menu');
        if (!menu) return;
        
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            this.lastTargetInput = target;
            target.focus();
        } else {
            this.lastTargetInput = null;
        }

        let selectedText = window.getSelection().toString();
        if(this.lastTargetInput && this.lastTargetInput.value) {
            const start = this.lastTargetInput.selectionStart;
            const end = this.lastTargetInput.selectionEnd;
            if(start !== end) selectedText = this.lastTargetInput.value.substring(start, end);
        }
        this.selectedTextToCopy = selectedText;

        const navItem = target.closest('.nav-item[data-page], [data-page]');
        const btnNewTab = document.getElementById('sm-new-tab');
        const divNewTab = document.getElementById('sm-new-tab-divider');

        const isInsideIframe = window.self !== window.top;

        if (navItem && navItem.getAttribute('data-page') && navItem.getAttribute('data-page') !== 'login' && !isInsideIframe) {
            this.targetPageUrl = navItem.getAttribute('data-page');
            if(btnNewTab) btnNewTab.style.display = 'flex';
            if(divNewTab) divNewTab.style.display = 'block';
        } else {
            this.targetPageUrl = null;
            if(btnNewTab) btnNewTab.style.display = 'none';
            if(divNewTab) divNewTab.style.display = 'none';
        }

        e.preventDefault(); 
        
        let x = e.pageX; let y = e.pageY;
        menu.style.display = 'block'; 
        
        const menuWidth = menu.offsetWidth; const menuHeight = menu.offsetHeight;
        if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
        if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;

        menu.style.left = `${x}px`; menu.style.top = `${y}px`;
    }

    #handleClickOutside(e) {
        if (e.button !== 2) this.#closeMenu();
    }

    #closeMenu() {
        const menu = document.getElementById('clinic-smart-menu');
        if (menu) menu.style.display = 'none';
    }

    #handleKeyDown(e) {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) || (e.ctrlKey && (e.key === 'U' || e.key === 'u'))) {
            e.preventDefault(); return false;
        }
    }

    async handleCopy() {
        const text = this.selectedTextToCopy; 
        if (!text || text.trim() === '') {
            this.showNativeToast("กรุณาลากคลุมดำข้อความก่อนคัดลอก", true); this.#closeMenu(); return;
        }
        try {
            if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
            else {
                const textArea = document.createElement("textarea"); textArea.value = text; textArea.style.position = "fixed"; textArea.style.opacity = "0";
                document.body.appendChild(textArea); textArea.focus(); textArea.select(); document.execCommand('copy'); textArea.remove(); 
            }
            this.showNativeToast("คัดลอกข้อความสำเร็จ");
            if(this.lastTargetInput) this.lastTargetInput.focus();
        } catch (err) { this.showNativeToast("การคัดลอกล้มเหลว", true); }
        this.selectedTextToCopy = ""; this.#closeMenu();
    }

    async handleCut() {
        const text = this.selectedTextToCopy;
        if (!text || text.trim() === '') { this.showNativeToast("กรุณาลากคลุมดำข้อความก่อนตัด", true); this.#closeMenu(); return; }
        try {
            if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
            else { const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.focus(); ta.select(); document.execCommand('copy'); ta.remove(); }

            if (this.lastTargetInput) {
                const start = this.lastTargetInput.selectionStart; const end = this.lastTargetInput.selectionEnd; const val = this.lastTargetInput.value;
                this.lastTargetInput.value = val.slice(0, start) + val.slice(end);
                this.lastTargetInput.selectionStart = this.lastTargetInput.selectionEnd = start;
                this.lastTargetInput.dispatchEvent(new Event('input', { bubbles: true })); this.lastTargetInput.focus();
            } else { document.execCommand('delete'); }
            this.showNativeToast("ตัดข้อความสำเร็จ");
        } catch (err) { this.showNativeToast("การตัดล้มเหลว", true); }
        this.selectedTextToCopy = ""; this.#closeMenu();
    }

    async handlePaste() {
        try {
            const text = await navigator.clipboard.readText();
            const activeEl = this.lastTargetInput || document.activeElement;
            if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
                const start = activeEl.selectionStart || 0; const end = activeEl.selectionEnd || 0; const val = activeEl.value || '';
                activeEl.value = val.slice(0, start) + text + val.slice(end);
                activeEl.selectionStart = activeEl.selectionEnd = start + text.length;
                activeEl.dispatchEvent(new Event('input', { bubbles: true })); activeEl.focus();
                this.showNativeToast("วางข้อความสำเร็จ");
            } else { document.execCommand('insertText', false, text); this.showNativeToast("วางข้อความสำเร็จ"); }
        } catch (err) { this.showNativeToast("กรุณากด Ctrl+V เพื่อวางข้อความแทน", true); }
        this.#closeMenu();
    }

    handleSelectAll() {
        if (this.lastTargetInput) {
            this.lastTargetInput.focus(); this.lastTargetInput.select();
            setTimeout(() => {
                this.selectedTextToCopy = this.lastTargetInput.value;
                const menu = document.getElementById('clinic-smart-menu');
                if(menu) { const rect = this.lastTargetInput.getBoundingClientRect(); menu.style.left = `${rect.left + (rect.width/2)}px`; menu.style.top = `${rect.bottom + 10}px`; menu.style.display = 'block'; }
            }, 50);
        } else { document.execCommand('selectAll'); }
    }
}

const SecurityShield = new SecurityShieldService();
document.addEventListener("DOMContentLoaded", () => { SecurityShield.init(); });