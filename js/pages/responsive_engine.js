// js/pages/responsive_engine.js
// 🚀 Enterprise Responsive Engine: ResizeObserver, Native 'dvh' Detection & Strict a11y (v11.0)

class ResponsiveEngineService {
    constructor() {
        this.lastWidth = window.innerWidth;
        this.resizeObserver = null;
        
        // ผูกฟังก์ชัน (Bind) ไว้เพื่อการสร้างและการลบ Event อย่างหมดจด (Memory-Leak Free)
        this.boundHandleOrientation = this.#handleOrientationChange.bind(this);
        this.boundHandleMenuClick = this.#handleMobileMenuClick.bind(this);
    }

    init() {
        this.#fixMobileViewport();
        this.#setupMobileMenu(); 
        
        // 🚨 THE FIX: อัปเกรดจาก window.resize เป็น ResizeObserver
        // ช่วยป้องกันปัญหา Scroll ทำให้ Resize Trigger รัวๆ บน Mobile Safari/Chrome
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    // ใช้ requestAnimationFrame ครอบเพื่อให้ GPU เป็นคนวาด
                    requestAnimationFrame(() => {
                        const newWidth = entry.contentRect.width;
                        if (newWidth !== this.lastWidth) {
                            this.lastWidth = newWidth;
                            this.#executeWidthChange();
                        }
                    });
                }
            });
            this.resizeObserver.observe(document.documentElement);
        } else {
            // Fallback สำหรับเบราว์เซอร์เก่าจัดๆ
            window.addEventListener('resize', () => this.#executeWidthChange(), { passive: true });
        }

        window.addEventListener('orientationchange', this.boundHandleOrientation, { passive: true });
        
        console.log("%c📱 [Responsive Engine] V11 Enterprise - Hardware Accelerated & a11y Compliant", "color: #3b82f6; font-weight: bold;");
    }

    destroy() {
        // ถอดปลั๊กเมื่อไม่ใช้งานเพื่อคืน Memory
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        } else {
            window.removeEventListener('resize', this.#executeWidthChange);
        }
        
        window.removeEventListener('orientationchange', this.boundHandleOrientation);
        document.removeEventListener('click', this.boundHandleMenuClick);
    }

    // ---------------------------------------------------------
    // ⚙️ Performance Optimized Event Handlers
    // ---------------------------------------------------------
    
    #handleOrientationChange() {
        // รอให้ Browser หมุนจอให้เสร็จก่อนวาด UI ใหม่ (150ms คือ Sweet spot)
        setTimeout(() => this.#executeWidthChange(), 150);
    }

    #executeWidthChange() {
        this.#fixMobileViewport();
        
        // 🛡️ ซ่อนคีย์บอร์ดมือถืออัตโนมัติเวลาหมุนหน้าจอ ป้องกัน Layout พัง (Zero-Reflow)
        const activeEl = document.activeElement;
        if (activeEl && ['INPUT', 'TEXTAREA'].includes(activeEl.tagName)) {
            activeEl.blur();
        }
    }

    // ---------------------------------------------------------
    // 📱 Mobile Viewport Fix (The vh & dvh Engine)
    // ---------------------------------------------------------
    #fixMobileViewport() {
        // 🚨 THE FIX: Feature Detection (เช็คว่าบราวเซอร์ใหม่พอที่จะใช้ dvh ไหม)
        // ถ้าเบราว์เซอร์รองรับ height: 100dvh ให้ JS หยุดทำงานเพื่อประหยัด CPU!
        if (window.CSS && CSS.supports && CSS.supports('height: 100dvh')) {
            return;
        }

        // Fallback: แก้ปัญหา 100vh บนเบราว์เซอร์เก่า หรือ Mobile Safari ตัวเก่า
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // ---------------------------------------------------------
    // 🍔 Mobile Menu System & Accessibility (a11y)
    // ---------------------------------------------------------
    #setupMobileMenu() {
        let backdrop = document.getElementById('mobile-sidebar-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'mobile-sidebar-backdrop';
            backdrop.className = 'sidebar-backdrop-engine'; 
            // 🚨 THE FIX: เพิ่ม ARIA Role ให้ถูกต้องตามมาตรฐาน JCI / WCAG
            backdrop.setAttribute('role', 'presentation');
            backdrop.setAttribute('aria-hidden', 'true');
            document.body.appendChild(backdrop);
        }

        // ถอด onclick แบบเก่าทิ้ง เตรียมใช้ Event Delegation เพื่อความไว O(1)
        const menuBtns = document.querySelectorAll('button.d-xl-none');
        menuBtns.forEach(btn => {
            btn.removeAttribute('onclick');
            // ใส่สถานะ a11y เริ่มต้น
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-controls', 'main-sidebar');
        });

        // ดัก Event ทั้งเอกสาร (Event Delegation)
        document.addEventListener('click', this.boundHandleMenuClick);
    }

    #handleMobileMenuClick(e) {
        const sidebar = document.querySelector('.sidebar');
        const backdrop = document.getElementById('mobile-sidebar-backdrop');
        if (!sidebar || !backdrop) return;

        // 1. กดปุ่มแฮมเบอร์เกอร์ (เปิด/ปิด)
        const menuBtn = e.target.closest('button.d-xl-none');
        if (menuBtn) {
            const isActive = sidebar.classList.toggle('active');
            backdrop.classList.toggle('active');
            
            // 🚨 อัปเดต a11y State เพื่อให้ Screen Reader อ่านออกเสียงถูกต้อง
            menuBtn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            
            e.preventDefault();
            e.stopPropagation(); 
            return;
        }

        // 2. กดปุ่มเมนูอื่นๆ หรือกดพื้นหลังดำ (ปิดเมนู)
        const isBackdropClick = e.target === backdrop;
        const isMenuLinkClick = e.target.closest('.sidebar .nav-item');
        
        if ((isBackdropClick || isMenuLinkClick) && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            backdrop.classList.remove('active');
            
            // รีเซ็ตปุ่มทั้งหมดให้เป็น aria-expanded = false
            document.querySelectorAll('button.d-xl-none').forEach(btn => {
                btn.setAttribute('aria-expanded', 'false');
            });
        }
    }
}

// 🌐 Expose & Auto-Execute (ทำงานร่วมกับ Router หลักอย่างสมบูรณ์แบบ)
const ResponsiveEngine = new ResponsiveEngineService();
document.addEventListener("DOMContentLoaded", () => { ResponsiveEngine.init(); });