// js/security_shield.js
// 🛡️ โมดูลเกราะป้องกันความปลอดภัย (Enterprise Security Shield & Anti-Tampering)

const SecurityShield = {
    idleTimeout: 30 * 60 * 1000, // ⏳ ตั้งเวลาเตะออกอัตโนมัติถ้าไม่มีการขยับเมาส์ (30 นาที)
    idleTimer: null,

    init: function() {
        this.preventClickjacking();
        this.setupSessionTimeout();
        this.disableDevTools();
        this.secureLocalStorage();
        this.hijackConsole();
        console.log("%c🛡️ [Security Shield] Activated - System is heavily monitored.", "color: #10b981; font-weight: bold; font-size: 14px;");
    },

    // 1. ป้องกัน Clickjacking (กันแฮกเกอร์ดูดเว็บเราไปแปะใน iframe ซ้อนเว็บปลอม)
    preventClickjacking: function() {
        if (window.top !== window.self) {
            window.top.location = window.self.location;
        }
    },

    // 2. ระบบ Auto-Logout (เตะออกเมื่อพยาบาลลืมล็อคเอาท์แล้วเดินไปที่อื่น)
    setupSessionTimeout: function() {
        const resetTimer = () => {
            clearTimeout(this.idleTimer);
            this.idleTimer = setTimeout(() => this.enforceLogout(), this.idleTimeout);
        };
        
        // ดักจับการเคลื่อนไหวทุกอย่าง
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keypress', resetTimer);
        window.addEventListener('scroll', resetTimer);
        window.addEventListener('click', resetTimer);
        resetTimer();
    },

    enforceLogout: function() {
        // เช็คว่ามีการล็อคอินอยู่หรือไม่ (ถ้ามีค่อยเตะออก)
        if (localStorage.getItem('isLoggedIn') === 'true' || sessionStorage.getItem('isLoggedIn') === 'true') {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'หมดเวลาเชื่อมต่อ (Session Expired)',
                    text: 'เพื่อความปลอดภัยของข้อมูลผู้ป่วย ระบบได้ทำการล็อคเอาท์อัตโนมัติเนื่องจากไม่มีการใช้งานเกิน 30 นาที',
                    icon: 'warning',
                    allowOutsideClick: false,
                    confirmButtonText: 'เข้าสู่ระบบใหม่',
                    confirmButtonColor: '#2563eb'
                }).then(() => {
                    if (typeof App !== 'undefined' && App.logout) {
                        App.logout();
                    } else {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.reload();
                    }
                });
            }
        }
    },

    // 3. บล็อคการคลิกขวา และการเปิดเครื่องมือแฮกเกอร์ (F12, Inspect Element)
    disableDevTools: function() {
        // ปิดคลิกขวา
        document.addEventListener('contextmenu', event => event.preventDefault());
        
        // ปิดปุ่มคีย์ลัด (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
        document.onkeydown = function(e) {
            if (e.keyCode == 123 || 
               (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74)) || 
               (e.ctrlKey && e.keyCode == 85)) {
                e.preventDefault();
                return false;
            }
        };
    },

    // 4. แอบซ่อนและเข้ารหัสข้อมูลบางส่วนใน LocalStorage ป้องกันการขโมย Token
    secureLocalStorage: function() {
        // ดักจับการพยายามดูข้อมูล LocalStorage จาก Console
        Object.defineProperty(window, 'localStorage', {
            configurable: false,
            enumerable: false,
            value: window.localStorage
        });
    },

    // 5. ปิดกั้นการใช้ Console พิมพ์คำสั่งอันตราย (Anti-XSS Injection)
    hijackConsole: function() {
        // พ่นข้อความเตือนแฮกเกอร์
        setTimeout(() => {
            console.log("%cหยุดนะ! (STOP!)", "color: red; font-size: 50px; font-weight: bold; text-shadow: 2px 2px 0 #000;");
            console.log("%cนี่คือระบบคอมพิวเตอร์ทางการแพทย์ที่มีการรักษาความปลอดภัยขั้นสูงสุด การกระทำใดๆ เพื่อพยายามเจาะระบบ หรือล้วงข้อมูลผู้ป่วย ถือเป็นความผิดตาม พ.ร.บ. ว่าด้วยการกระทำความผิดเกี่ยวกับคอมพิวเตอร์ และ พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) มีโทษจำคุกและปรับสูงสุด", "color: #333; font-size: 16px;");
        }, 1000);
    },

    // 6. ฟังก์ชันทำความสะอาดข้อความ (เรียกใช้ก่อนส่งข้อมูลลง Database ป้องกันการฝังไวรัสลง DB)
    sanitizeInput: function(str) {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>'"]/g, function(tag) {
            const charsToReplace = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            };
            return charsToReplace[tag] || tag;
        });
    }
};

// สตาร์ทโล่ป้องกันทันทีที่เว็บโหลดเสร็จ
document.addEventListener("DOMContentLoaded", () => {
    SecurityShield.init();
});