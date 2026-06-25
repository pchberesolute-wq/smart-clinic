// js/pages/security_shield.js
// 🛡️ โมดูลเกราะป้องกันความปลอดภัย + Smart Context Menu (V8 - Removed 30-min Auto Logout)

const SecurityShield = {
    selectedTextToCopy: "", // 🌟 ตัวแปรลับ: ใช้เก็บข้อความที่คลุมดำไว้

    init: function() {
        this.preventClickjacking();
        this.injectNativeToast(); // 🌟 ฝังกล่องแจ้งเตือน Native ตัวเดียวกับ search_copy.js
        this.setupCustomContextMenu(); // 🌟 เมนูคลิกขวา
        this.secureLocalStorage();
        this.hijackConsole();
        console.log("%c🛡️ [Security Shield] Smart Menu V8 (No Auto-Logout) Activated.", "color: #10b981; font-weight: bold; font-size: 14px;");
    },

    preventClickjacking: function() {
        if (window.top !== window.self) window.top.location = window.self.location;
    },

    // 🌟 1. ระบบกล่องแจ้งเตือน (ก๊อปปี้ CSS/HTML มาจากหน้า search_copy.js เป๊ะๆ 100%)
    injectNativeToast: function() {
        if (document.getElementById('dialysisPoaster')) return; // ถ้ามีอยู่แล้วให้ข้ามไป

        const toastHtml = `
            <div class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center shadow-sm" style="width:28px; height:28px;">
                <i class="fa-solid fa-check" style="font-size:14px;"></i>
            </div>
            <span id="dialysisPoasterText">คัดลอกข้อความสำเร็จ</span>
        `;

        if (!document.getElementById('dialysis-toast-style')) {
            const css = `
                .dialysis-custom-toast {
                    position: fixed;
                    top: 30px;
                    right: 30px;
                    background: #ffffff !important;
                    border: 2px solid #10b981 !important;
                    box-shadow: 0 15px 35px -5px rgba(16, 185, 129, 0.25), 0 5px 15px -3px rgba(0, 0, 0, 0.08) !important;
                    border-radius: 50px !important;
                    padding: 12px 28px !important;
                    font-family: 'Prompt', sans-serif !important;
                    color: #0f172a !important;
                    font-weight: 700 !important;
                    font-size: 15px !important;
                    z-index: 99999999 !important;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transform: translate3d(120%, 0, 0);
                    opacity: 0;
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15), opacity 0.3s ease;
                    pointer-events: none;
                }
                .dialysis-custom-toast.show {
                    transform: translate3d(0, 0, 0);
                    opacity: 1;
                }
                @media print { .dialysis-custom-toast { display: none !important; } }
            `;
            const style = document.createElement('style'); 
            style.id = 'dialysis-toast-style';
            style.innerHTML = css; 
            document.head.appendChild(style);
        }

        const div = document.createElement('div'); 
        div.id = 'dialysisPoaster';
        div.className = 'dialysis-custom-toast';
        div.innerHTML = toastHtml; 
        document.body.appendChild(div);
    },

    showNativeToast: function(message, isWarning = false) {
        let toast = document.getElementById('dialysisPoaster');
        let toastText = document.getElementById('dialysisPoasterText');
        
        if(!toast || !toastText) {
            this.injectNativeToast();
            toast = document.getElementById('dialysisPoaster');
            toastText = document.getElementById('dialysisPoasterText');
        }

        toastText.innerText = message;
        
        // ปรับสีและไอคอนตามสถานะ (แจ้งเตือน หรือ สำเร็จ)
        const iconContainer = toast.querySelector('div');
        const icon = toast.querySelector('i');
        
        if (isWarning) {
            toast.style.borderColor = '#f59e0b'; // สีส้ม
            iconContainer.className = 'rounded-circle bg-warning text-dark d-flex align-items-center justify-content-center shadow-sm';
            icon.className = 'fa-solid fa-exclamation';
        } else {
            toast.style.borderColor = '#10b981'; // สีเขียว
            iconContainer.className = 'rounded-circle bg-success text-white d-flex align-items-center justify-content-center shadow-sm';
            icon.className = 'fa-solid fa-check';
        }

        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 1500); // 1.5 วินาที
    },

    // 🌟 2. เมนูคลิกขวา Custom Context Menu
    setupCustomContextMenu: function() {
        const menuHtml = `
            <div id="clinic-smart-menu" class="smart-menu-container shadow-lg">
                <div class="smart-menu-header">
                    <i class="fa-solid fa-shield-halved text-success me-1"></i> Smart Menu
                </div>
                <div class="smart-menu-item" onclick="SecurityShield.handleCopy()">
                    <i class="fa-regular fa-copy text-primary"></i> คัดลอกข้อความ (Copy)
                </div>
                <div class="smart-menu-item" onclick="document.execCommand('cut'); document.getElementById('clinic-smart-menu').style.display='none';">
                    <i class="fa-solid fa-scissors text-danger"></i> ตัด (Cut)
                </div>
                <div class="smart-menu-item" onclick="SecurityShield.handlePaste()">
                    <i class="fa-regular fa-clipboard text-success"></i> วาง (Paste)
                </div>
                <div class="smart-menu-item" onclick="document.execCommand('selectAll'); document.getElementById('clinic-smart-menu').style.display='none';">
                    <i class="fa-solid fa-object-group text-secondary"></i> เลือกทั้งหมด (Select All)
                </div>
                <div class="smart-menu-divider"></div>
                <div class="smart-menu-item" onclick="if(typeof App !== 'undefined') { App.switchPage('dashboard'); } document.getElementById('clinic-smart-menu').style.display='none';">
                    <i class="fa-solid fa-house-medical text-primary"></i> ไปหน้าแดชบอร์ด
                </div>
                <div class="smart-menu-item" onclick="document.getElementById('clinic-smart-menu').style.display='none'; window.print();">
                    <i class="fa-solid fa-print text-warning"></i> พิมพ์หน้าจอ (Print)
                </div>
                <div class="smart-menu-item" onclick="window.location.reload()">
                    <i class="fa-solid fa-rotate-right text-info"></i> โหลดหน้าใหม่ (Refresh)
                </div>
            </div>
        `;

        const css = `
            .smart-menu-container {
                display: none; position: absolute; z-index: 999999;
                background: rgba(255, 255, 255, 0.98); backdrop-filter: blur(10px);
                border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; width: 240px;
                box-shadow: 0 15px 35px rgba(0,0,0,0.15); font-family: 'Prompt', sans-serif; overflow: hidden;
            }
            .smart-menu-header {
                font-size: 11px; padding: 8px 16px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;
                color: #64748b; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;
            }
            .smart-menu-item {
                padding: 10px 16px; font-size: 14px; font-weight: 500; color: #334155;
                cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 12px;
            }
            .smart-menu-item:hover { background: #eff6ff; color: #2563eb; }
            .smart-menu-divider { height: 1px; background: #e2e8f0; margin: 4px 0; }
            @media print { #clinic-smart-menu { display: none !important; } }
        `;

        const style = document.createElement('style'); style.innerHTML = css; document.head.appendChild(style);
        const div = document.createElement('div'); div.innerHTML = menuHtml; document.body.appendChild(div);
        const menu = document.getElementById('clinic-smart-menu');

        // 🚨 ดักจับคลิกขวา
        document.addEventListener('contextmenu', (e) => {
            const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
            if (isTouchDevice || window.innerWidth <= 800) return; // ปล่อยมือถือผ่าน

            const target = e.target;
            
            // ปล่อยให้ช่อง Input ใช้คลิกขวาปกติ
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                menu.style.display = 'none'; 
                return; 
            }

            // แคปเจอร์ข้อความที่คลุมดำไว้
            SecurityShield.selectedTextToCopy = window.getSelection().toString();

            e.preventDefault(); 
            let x = e.pageX; let y = e.pageY;
            if (x + 240 > window.innerWidth) x = window.innerWidth - 240;
            if (y + 320 > window.innerHeight) y = window.innerHeight - 320;

            menu.style.left = x + 'px'; menu.style.top = y + 'px';
            menu.style.display = 'block';
        });

        document.addEventListener('click', () => { if(menu) menu.style.display = 'none'; });

        document.onkeydown = function(e) {
            if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74)) || (e.ctrlKey && e.keyCode == 85)) {
                e.preventDefault(); return false;
            }
        };
    },

    // 🌟 3. ระบบ Copy กันโค้ด HTML 100% (บังคับให้คลุมดำก่อน)
    handleCopy: async function() {
        const text = this.selectedTextToCopy || window.getSelection().toString(); 
        
        // 🚨 สำคัญที่สุด: ถ้าไม่ได้คลุมดำข้อความ ห้ามก๊อปปี้เด็ดขาด (ป้องกันการก๊อปโค้ด)
        if (!text || text.trim() === '') {
            this.showNativeToast("กรุณาลากคลุมดำข้อความก่อนคัดลอก", true);
            document.getElementById('clinic-smart-menu').style.display = 'none';
            return;
        }

        try {
            // บังคับก๊อปปี้แต่ตัวหนังสือธรรมดา (Plain Text)
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text.trim());
            } else {
                let textArea = document.createElement("textarea");
                textArea.value = text.trim();
                textArea.style.position = "fixed"; textArea.style.opacity = "0";
                document.body.appendChild(textArea);
                textArea.focus(); textArea.select();
                document.execCommand('copy');
                textArea.remove(); 
            }
            
            this.showNativeToast("คัดลอกข้อความสำเร็จ");
        } catch (err) {
            this.showNativeToast("คัดลอกล้มเหลว", true);
        }
        
        this.selectedTextToCopy = "";
        document.getElementById('clinic-smart-menu').style.display = 'none';
    },

    // 🌟 4. ระบบวางข้อความ
    handlePaste: async function() {
        try {
            const text = await navigator.clipboard.readText();
            const activeEl = document.activeElement;
            
            if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
                const start = activeEl.selectionStart;
                const end = activeEl.selectionEnd;
                const val = activeEl.value;
                activeEl.value = val.slice(0, start) + text + val.slice(end);
                activeEl.selectionStart = activeEl.selectionEnd = start + text.length;
                activeEl.dispatchEvent(new Event('input', { bubbles: true })); 
                this.showNativeToast("วางข้อความสำเร็จ");
            } else {
                document.execCommand('insertText', false, text);
                this.showNativeToast("วางข้อความสำเร็จ");
            }
        } catch (err) {
            this.showNativeToast("กรุณากด Ctrl+V เพื่อวางข้อความ", true);
        }
        document.getElementById('clinic-smart-menu').style.display = 'none';
    },

    secureLocalStorage: function() {
        Object.defineProperty(window, 'localStorage', { configurable: false, enumerable: false, value: window.localStorage });
    },

    hijackConsole: function() {
        setTimeout(() => {
            console.log("%cหยุดนะ! (STOP!)", "color: red; font-size: 50px; font-weight: bold; text-shadow: 2px 2px 0 #000;");
        }, 1000);
    },

    sanitizeInput: function(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>'"]/g, function(tag) {
            const charsToReplace = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
            return charsToReplace[tag] || tag;
        });
    }
};

document.addEventListener("DOMContentLoaded", () => { SecurityShield.init(); });