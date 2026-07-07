// js/pages/security_shield.js
// 🛡️ Enterprise Security Service: Premium Glassmorphic Smart Context Menu, Auto-Popup & Global Toast UI

class SecurityShieldService {
    constructor() {
        this.selectedTextToCopy = ""; 
        this.lastTargetInput = null; 

        this.boundContextMenu = this.#handleContextMenu.bind(this);
        this.boundClickOutside = this.#handleClickOutside.bind(this);
        this.boundKeyDown = this.#handleKeyDown.bind(this);
        this.boundMouseUp = this.#handleMouseUp.bind(this);
    }

    init() {
        this.#preventClickjacking();
        this.#injectNativeToast(); // 🚨 THE FIX: ฝัง Global Toast พร้อม Dark Mode CSS
        this.#injectGlobalPrintFix(); 
        this.#setupCustomContextMenu(); 
        
        this.#secureLocalStorage();
        this.#hijackConsole();
        
        console.log("%c🛡️ [Security Shield] Enterprise Guard & UI Activated.", "color: #10b981; font-weight: bold; font-size: 14px;");
    }

    // ---------------------------------------------------------
    // 🚧 Core Protections & Fixes
    // ---------------------------------------------------------
    #preventClickjacking() {
        try { if (window.top !== window.self) window.top.location = window.self.location; } catch (e) {}
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
                #sidebar, .topbar, .floating-action-bar, #clinic-smart-menu, .btn, .search-box-modern { display: none !important; }
                .main-content { margin-left: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; }
                .table-responsive { overflow: visible !important; max-height: none !important; }
                .table-premium, .table-analytics { border: 1px solid #000 !important; }
                .table-premium th, .table-premium td, .table-analytics th, .table-analytics td { border: 1px solid #000 !important; padding: 8px !important; }
                .modern-panel, .card, .stat-card-premium { page-break-inside: avoid !important; border: 1px solid #666 !important; box-shadow: none !important; margin-bottom: 20px !important; }
            }
        `;
        document.head.appendChild(style);
    }

    // ---------------------------------------------------------
    // 🪄 UI Injection (Native Toast with Perfect Dark Mode)
    // ---------------------------------------------------------
    #injectNativeToast() {
        if (document.getElementById('dialysisPoaster')) return; 

        // 🚨 THE FIX: ย้าย CSS ของ Toast มาไว้ตรงนี้ เพื่อให้มันทำงานได้ทั่วทั้งระบบ และเขียนแบบ Specificity สูงสุด
        const style = document.createElement('style');
        style.id = 'dialysis-global-toast-style';
        style.innerHTML = `
            /* โหมดปกติ (Light Mode) */
            body .dialysis-custom-toast {
                position: fixed; top: 30px; right: 30px;
                background: #ffffff !important;
                box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.15) !important;
                border-radius: 50px !important; padding: 12px 28px !important;
                font-family: 'Prompt', sans-serif !important; color: #0f172a !important;
                font-weight: 700 !important; font-size: 15px !important; z-index: 99999999 !important;
                display: flex; align-items: center; gap: 12px;
                transform: translate3d(120%, 0, 0); opacity: 0;
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15), opacity 0.3s ease;
                pointer-events: none;
            }
            body .dialysis-custom-toast.show { transform: translate3d(0, 0, 0); opacity: 1; }
            
            body .dialysis-custom-toast.toast-success { border: 2px solid #10b981 !important; }
            body .dialysis-custom-toast.toast-warning { border: 2px solid #f59e0b !important; }

            /* 🌟 โหมดมืด (Dark Mode Support 100%) 🌟 */
            html[data-bs-theme="dark"] body .dialysis-custom-toast {
                background: #1e293b !important;
                color: #f8fafc !important;
                box-shadow: 0 15px 35px -5px rgba(0, 0, 0, 0.6) !important;
            }
            html[data-bs-theme="dark"] body .dialysis-custom-toast.toast-success {
                border: 2px solid #059669 !important;
            }
            html[data-bs-theme="dark"] body .dialysis-custom-toast.toast-warning {
                background: #451a03 !important; /* พื้นหลังสีน้ำตาลเข้มเพื่อเน้นการเตือน */
                border: 2px solid #fb923c !important;
                color: #fde68a !important;
            }
        `;
        document.head.appendChild(style);

        const toastHtml = `
            <div id="dialysisPoaster" class="dialysis-custom-toast toast-success">
                <div id="toast-icon-bg" class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center shadow-sm" style="width:28px; height:28px; flex-shrink: 0;">
                    <i id="toast-icon" class="fa-solid fa-check" style="font-size:14px;"></i>
                </div>
                <span id="dialysisPoasterText">ข้อความแจ้งเตือน</span>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', toastHtml);
    }

    showNativeToast(message, isWarning = false) {
        const toast = document.getElementById('dialysisPoaster');
        const toastText = document.getElementById('dialysisPoasterText');
        
        if (!toast || !toastText) {
            this.#injectNativeToast();
            return this.showNativeToast(message, isWarning);
        }

        toastText.innerText = message;
        
        // 🚨 THE FIX: ใช้การสลับคลาส (Toggle Class) แทนการยัด Inline Style เพื่อให้ CSS จัดการ Dark/Light Mode เอง
        const iconContainer = document.getElementById('toast-icon-bg');
        const icon = document.getElementById('toast-icon');
        
        if (isWarning) {
            toast.classList.remove('toast-success');
            toast.classList.add('toast-warning');
            iconContainer.className = 'rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center shadow-sm';
            icon.className = 'fa-solid fa-exclamation';
        } else {
            toast.classList.remove('toast-warning');
            toast.classList.add('toast-success');
            iconContainer.className = 'rounded-circle bg-success text-white d-flex align-items-center justify-content-center shadow-sm';
            icon.className = 'fa-solid fa-check';
        }

        toast.classList.add('show');
        
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => toast.classList.remove('show'), 1500);
    }

    // ---------------------------------------------------------
    // 🖱️ Custom Context Menu (Smart Menu Premium Edition)
    // ---------------------------------------------------------
    #setupCustomContextMenu() {
        if (document.getElementById('clinic-smart-menu')) return; 

        const menuStyle = `
            <style id="smart-menu-styles">
                :root { --sm-bg: rgba(255, 255, 255, 0.95); --sm-text: #1e293b; --sm-border: rgba(226, 232, 240, 0.8); --sm-hover: #f1f5f9; --sm-shadow: 0 20px 40px -10px rgba(0,0,0,0.15); --sm-divider: #e2e8f0; --sm-header-bg: #f8fafc; }
                html[data-bs-theme="dark"] { --sm-bg: rgba(15, 23, 42, 0.85); --sm-text: #f8fafc; --sm-border: rgba(255, 255, 255, 0.1); --sm-hover: rgba(255, 255, 255, 0.1); --sm-shadow: 0 25px 50px -12px rgba(0,0,0,0.8); --sm-divider: rgba(255, 255, 255, 0.1); --sm-header-bg: rgba(0, 0, 0, 0.3); }
                .smart-menu-container { position: fixed; display: none; z-index: 999999; width: 260px; padding: 6px; background: var(--sm-bg); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid var(--sm-border); border-radius: 16px; box-shadow: var(--sm-shadow); font-family: 'Sarabun', sans-serif; transform-origin: top left; animation: smPopIn 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; user-select: none; }
                @keyframes smPopIn { 0% { opacity: 0; transform: scale(0.95) translateY(-5px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
                .smart-menu-header { padding: 10px 14px; font-size: 11px; font-weight: 800; font-family: 'Prompt'; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; background: var(--sm-header-bg); border-radius: 10px 10px 4px 4px; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; }
                .smart-menu-item { padding: 10px 14px; margin: 2px 0; border-radius: 10px; font-size: 14.5px; font-weight: 600; color: var(--sm-text); cursor: pointer; display: flex; align-items: center; transition: all 0.2s ease; }
                .smart-menu-item:hover { background: var(--sm-hover); transform: translateX(4px); }
                .smart-menu-item i { width: 22px; font-size: 16px; text-align: center; margin-right: 12px; }
                .smart-menu-item .shortcut { margin-left: auto; font-size: 11px; color: #94a3b8; font-family: monospace; font-weight: 700; }
                .smart-menu-divider { height: 1px; background: var(--sm-divider); margin: 6px 10px; }
            </style>
        `;

        const menuHtml = `
            <div id="clinic-smart-menu" class="smart-menu-container">
                <div class="smart-menu-header">
                    <span><i class="fa-solid fa-shield-halved text-success me-1"></i> SMART OS MENU</span>
                    <i class="fa-solid fa-bars-staggered" style="opacity: 0.5;"></i>
                </div>
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

    #handleMouseUp(e) {
        if (e.target.closest('#clinic-smart-menu')) return;
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

            let x = e.pageX; 
            let y = e.pageY + 15; 
            menu.style.display = 'block'; 
            
            const menuWidth = menu.offsetWidth;
            const menuHeight = menu.offsetHeight;

            if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
            if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;

            menu.style.left = `${x}px`; 
            menu.style.top = `${y}px`;
        } else {
            this.#closeMenu();
        }
    }

    #handleContextMenu(e) {
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
            if(start !== end) {
                selectedText = this.lastTargetInput.value.substring(start, end);
            }
        }
        this.selectedTextToCopy = selectedText;

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

    // ---------------------------------------------------------
    // 📋 Clipboard Core Logic
    // ---------------------------------------------------------
    async handleCopy() {
        const text = this.selectedTextToCopy; 
        if (!text || text.trim() === '') {
            this.showNativeToast("กรุณาลากคลุมดำข้อความก่อนคัดลอก", true);
            this.#closeMenu();
            return;
        }
        try {
            if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
            else {
                const textArea = document.createElement("textarea"); textArea.value = text; textArea.style.position = "fixed"; textArea.style.opacity = "0";
                document.body.appendChild(textArea); textArea.focus(); textArea.select(); document.execCommand('copy'); textArea.remove(); 
            }
            this.showNativeToast("คัดลอกข้อความสำเร็จ");
            if(this.lastTargetInput) this.lastTargetInput.focus();
        } catch (err) {
            this.showNativeToast("การคัดลอกล้มเหลว", true);
        }
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