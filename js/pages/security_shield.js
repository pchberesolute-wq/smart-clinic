// js/pages/security_shield.js
// 🛡️ Enterprise Security Service: Smart Context Menu, Anti-Clickjacking & XSS Defense

class SecurityShieldService {
    constructor() {
        this.selectedTextToCopy = ""; 
        // ผูกฟังก์ชัน (Bind) ไว้เพื่อการสร้างและการลบ Event อย่างหมดจด
        this.boundContextMenu = this.#handleContextMenu.bind(this);
        this.boundClickOutside = this.#handleClickOutside.bind(this);
        this.boundKeyDown = this.#handleKeyDown.bind(this);
    }

    init() {
        this.#preventClickjacking();
        this.#injectNativeToast(); // ฝังกล่องแจ้งเตือน (ใช้ร่วมกับโมดูลอื่น)
        this.#setupCustomContextMenu(); // สร้างและผูก Event ของเมนูคลิกขวา
        
        // ⚠️ การ Hijack Console และ LocalStorage เป็นเพียงลูกเล่นขู่ผู้ใช้ทั่วไป 
        // ไม่สามารถกันโปรแกรมเมอร์ได้จริง แต่ก็มีประโยชน์ในแง่จิตวิทยาครับ
        this.#secureLocalStorage();
        this.#hijackConsole();
        
        console.log("%c🛡️ [Security Shield] Enterprise Guard Activated.", "color: #10b981; font-weight: bold; font-size: 14px;");
    }

    // ---------------------------------------------------------
    // 🚧 Core Protections
    // ---------------------------------------------------------
    #preventClickjacking() {
        if (window.top !== window.self) {
            window.top.location = window.self.location;
        }
    }

    #secureLocalStorage() {
        try {
            Object.defineProperty(window, 'localStorage', { 
                configurable: false, enumerable: false, value: window.localStorage 
            });
        } catch (e) {
            // ปล่อยผ่านหากเบราว์เซอร์ไม่รองรับ
        }
    }

    #hijackConsole() {
        setTimeout(() => {
            console.log("%cหยุดนะ! (STOP!)", "color: red; font-size: 50px; font-weight: bold; text-shadow: 2px 2px 0 #000;");
            console.log("%cคุณกำลังเข้าสู่พื้นที่สำหรับนักพัฒนา (Developer Area) การนำโค้ดที่ไม่ได้อนุญาตมาวางที่นี่อาจทำให้ข้อมูลเวชระเบียนสูญหายหรือถูกขโมยได้!", "font-size: 14px; color: #333;");
        }, 1000);
    }

    // ---------------------------------------------------------
    // 🪄 UI Injection (Singleton DOM Creation)
    // ---------------------------------------------------------
    #injectNativeToast() {
        if (document.getElementById('dialysisPoaster')) return; // ป้องกันการสร้างซ้ำซ้อน

        // โครงสร้าง HTML ที่คลีนที่สุด โดยไปพึ่งพา CSS ใน style.css
        const toastHtml = `
            <div id="dialysisPoaster" class="dialysis-custom-toast">
                <div class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center shadow-sm" style="width:28px; height:28px;">
                    <i class="fa-solid fa-check" style="font-size:14px;"></i>
                </div>
                <span id="dialysisPoasterText">คัดลอกข้อความสำเร็จ</span>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', toastHtml);
    }

    showNativeToast(message, isWarning = false) {
        const toast = document.getElementById('dialysisPoaster');
        const toastText = document.getElementById('dialysisPoasterText');
        
        if (!toast || !toastText) {
            this.#injectNativeToast(); // Fallback กรณีหาไม่เจอ
            return this.showNativeToast(message, isWarning);
        }

        toastText.innerText = message;
        
        // ปรับแต่ง UI ตามประเภทข้อความ
        const iconContainer = toast.querySelector('div');
        const icon = toast.querySelector('i');
        
        if (isWarning) {
            toast.style.borderColor = '#f59e0b';
            iconContainer.className = 'rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center shadow-sm';
            icon.className = 'fa-solid fa-exclamation';
        } else {
            toast.style.borderColor = '#10b981';
            iconContainer.className = 'rounded-circle bg-success text-white d-flex align-items-center justify-content-center shadow-sm';
            icon.className = 'fa-solid fa-check';
        }

        toast.classList.add('show');
        
        // ใช้ setTimeout แบบระมัดระวัง
        if (this.toastTimeout) clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => toast.classList.remove('show'), 1500);
    }

    // ---------------------------------------------------------
    // 🖱️ Custom Context Menu (Smart Menu)
    // ---------------------------------------------------------
    #setupCustomContextMenu() {
        if (document.getElementById('clinic-smart-menu')) return; // ป้องกันการสร้างซ้ำซ้อน

        const menuHtml = `
            <div id="clinic-smart-menu" class="smart-menu-container shadow-lg">
                <div class="smart-menu-header"><i class="fa-solid fa-shield-halved text-success me-1"></i> Smart Menu</div>
                
                <div class="smart-menu-item" id="sm-copy">
                    <i class="fa-regular fa-copy text-primary"></i> คัดลอกข้อความ (Copy)
                </div>
                <div class="smart-menu-item" id="sm-cut">
                    <i class="fa-solid fa-scissors text-danger"></i> ตัด (Cut)
                </div>
                <div class="smart-menu-item" id="sm-paste">
                    <i class="fa-regular fa-clipboard text-success"></i> วาง (Paste)
                </div>
                <div class="smart-menu-item" id="sm-select-all">
                    <i class="fa-solid fa-object-group text-secondary"></i> เลือกทั้งหมด (Select All)
                </div>
                <div class="smart-menu-divider"></div>
                
                <div class="smart-menu-item" id="sm-home">
                    <i class="fa-solid fa-house-medical text-primary"></i> ไปหน้าแดชบอร์ด
                </div>
                <div class="smart-menu-item" id="sm-print">
                    <i class="fa-solid fa-print text-warning"></i> พิมพ์หน้าจอ (Print)
                </div>
                <div class="smart-menu-item" id="sm-refresh">
                    <i class="fa-solid fa-rotate-right text-info"></i> โหลดหน้าใหม่ (Refresh)
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', menuHtml);

        // 🚨 ผูก Events ให้กับปุ่มในเมนู (แทนการใช้ onclick ใน HTML string)
        document.getElementById('sm-copy').addEventListener('click', () => this.handleCopy());
        document.getElementById('sm-cut').addEventListener('click', () => { document.execCommand('cut'); this.#closeMenu(); });
        document.getElementById('sm-paste').addEventListener('click', () => this.handlePaste());
        document.getElementById('sm-select-all').addEventListener('click', () => { document.execCommand('selectAll'); this.#closeMenu(); });
        document.getElementById('sm-home').addEventListener('click', () => { if(typeof App !== 'undefined') App.switchPage('dashboard'); this.#closeMenu(); });
        document.getElementById('sm-print').addEventListener('click', () => { this.#closeMenu(); window.print(); });
        document.getElementById('sm-refresh').addEventListener('click', () => window.location.reload());

        // ผูก Listener จับการคลิกและกดคีย์บอร์ด
        document.addEventListener('contextmenu', this.boundContextMenu);
        document.addEventListener('click', this.boundClickOutside);
        document.addEventListener('keydown', this.boundKeyDown);
    }

    #handleContextMenu(e) {
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        if (isTouchDevice || window.innerWidth <= 800) return; // ปล่อยผ่านบนมือถือ

        const target = e.target;
        const menu = document.getElementById('clinic-smart-menu');
        if (!menu) return;
        
        // ปล่อยให้ช่อง Input/Textarea ใช้คลิกขวาแบบ Native ได้ปกติ
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            menu.style.display = 'none'; 
            return; 
        }

        // キャปเจอร์ข้อความที่ถูกคลุมดำไว้ก่อน
        this.selectedTextToCopy = window.getSelection().toString();

        e.preventDefault(); 
        
        // คำนวณตำแหน่งไม่ให้ล้นหน้าจอ
        let x = e.pageX; 
        let y = e.pageY;
        const menuWidth = 240;
        const menuHeight = 320;

        if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth;
        if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight;

        menu.style.left = `${x}px`; 
        menu.style.top = `${y}px`;
        menu.style.display = 'block';
    }

    #handleClickOutside() {
        this.#closeMenu();
    }

    #closeMenu() {
        const menu = document.getElementById('clinic-smart-menu');
        if (menu) menu.style.display = 'none';
    }

    #handleKeyDown(e) {
        // บล็อค F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) || (e.ctrlKey && (e.key === 'U' || e.key === 'u'))) {
            e.preventDefault(); 
            return false;
        }
    }

    // ---------------------------------------------------------
    // 📋 Clipboard Core Logic (Anti-Scraping)
    // ---------------------------------------------------------
    async handleCopy() {
        // ใช้ค่าที่จับไว้ตอนกดคลิกขวา หรือ ดึงจาก Selection ปัจจุบัน
        const text = this.selectedTextToCopy || window.getSelection().toString(); 
        
        // 🚨 บังคับ: ถ้าไม่ได้คลุมดำข้อความ ห้ามก๊อปปี้เด็ดขาด (ป้องกันคนกด Copy เพื่อดึงโค้ด HTML)
        if (!text || text.trim() === '') {
            this.showNativeToast("กรุณาลากคลุมดำข้อความก่อนคัดลอก", true);
            this.#closeMenu();
            return;
        }

        try {
            // ใช้ Clipboard API ใหม่ถ้าเบราว์เซอร์รองรับ (ต้องเป็น HTTPS)
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text.trim());
            } else {
                // Fallback สำหรับเบราว์เซอร์เก่า
                const textArea = document.createElement("textarea");
                textArea.value = text.trim();
                textArea.style.position = "fixed"; textArea.style.opacity = "0";
                document.body.appendChild(textArea);
                textArea.focus(); textArea.select();
                document.execCommand('copy');
                textArea.remove(); 
            }
            this.showNativeToast("คัดลอกข้อความสำเร็จ");
        } catch (err) {
            console.error("Clipboard Error:", err);
            this.showNativeToast("การคัดลอกล้มเหลว", true);
        }
        
        this.selectedTextToCopy = ""; // ล้างค่าทิ้ง
        this.#closeMenu();
    }

    async handlePaste() {
        try {
            const text = await navigator.clipboard.readText();
            const activeEl = document.activeElement;
            
            if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
                const start = activeEl.selectionStart;
                const end = activeEl.selectionEnd;
                const val = activeEl.value;
                
                activeEl.value = val.slice(0, start) + text + val.slice(end);
                activeEl.selectionStart = activeEl.selectionEnd = start + text.length;
                activeEl.dispatchEvent(new Event('input', { bubbles: true })); // กระตุ้นระบบ Auto-Save ของ UI
                
                this.showNativeToast("วางข้อความสำเร็จ");
            } else {
                document.execCommand('insertText', false, text);
                this.showNativeToast("วางข้อความสำเร็จ");
            }
        } catch (err) {
            this.showNativeToast("กรุณากด Ctrl+V เพื่อวางข้อความแทน", true);
        }
        this.#closeMenu();
    }

    // ฟังก์ชันเสริมสำหรับใช้ภายนอก (XSS Sanitizer)
    sanitizeInput(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>'"]/g, function(tag) {
            const charsToReplace = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
            return charsToReplace[tag] || tag;
        });
    }
}

// 🌐 Expose & Auto-Execute Service
const SecurityShield = new SecurityShieldService();
document.addEventListener("DOMContentLoaded", () => { SecurityShield.init(); });