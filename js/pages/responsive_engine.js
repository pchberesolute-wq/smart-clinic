// js/pages/responsive_engine.js
// 🚀 Enterprise Responsive Engine: Hardware-Accelerated, Passive Listeners, Memory-Leak Free

class ResponsiveEngineService {
    constructor() {
        this.lastWidth = window.innerWidth;
        this.resizeTimeout = null;
        
        // ผูกฟังก์ชัน (Bind) ไว้เพื่อการสร้างและการลบ Event อย่างหมดจด
        this.boundHandleResize = this.#handleResizeDebounced.bind(this);
        this.boundHandleOrientation = this.#handleOrientationChange.bind(this);
        this.boundHandleMenuClick = this.#handleMobileMenuClick.bind(this);
    }

    init() {
        // ❌ นำ injectUltimateStyles() ออก เพราะย้ายไป style.css แล้ว
        // ❌ นำ autoWrapTables() และ MutationObserver ออก เพราะแก้ที่ต้นทาง (HTML) แล้ว ประหยัด CPU!

        this.#fixMobileViewport();
        this.#setupMobileMenu(); 
        
        // ใช้ { passive: true } เพื่อให้เลื่อนหน้าจอบนมือถือได้ลื่นไหล ไม่กระตุก
        window.addEventListener('resize', this.boundHandleResize, { passive: true });
        window.addEventListener('orientationchange', this.boundHandleOrientation, { passive: true });
        
        console.log("📱 [Responsive Engine] V10 Enterprise - Hardware Accelerated");
    }

    destroy() {
        // ถอดปลั๊กเมื่อไม่ใช้งาน
        window.removeEventListener('resize', this.boundHandleResize);
        window.removeEventListener('orientationchange', this.boundHandleOrientation);
        document.removeEventListener('click', this.boundHandleMenuClick);
    }

    // ---------------------------------------------------------
    // ⚙️ Performance Optimized Event Handlers (Debouncing)
    // ---------------------------------------------------------
    
    // หน่วงเวลาการประมวลผลเมื่อผู้ใช้หมุนจอ (ลดภาระ CPU)
    #handleResizeDebounced() {
        if (this.resizeTimeout) {
            cancelAnimationFrame(this.resizeTimeout);
        }
        
        this.resizeTimeout = requestAnimationFrame(() => {
            if (window.innerWidth !== this.lastWidth) {
                this.lastWidth = window.innerWidth;
                this.#executeWidthChange();
            }
        });
    }

    #handleOrientationChange() {
        setTimeout(() => this.#executeWidthChange(), 150);
    }

    #executeWidthChange() {
        this.#fixMobileViewport();
        
        // ซ่อนคีย์บอร์ดมือถืออัตโนมัติเวลาหมุนหน้าจอ ป้องกัน Layout พัง
        if(document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
            document.activeElement.blur();
        }
    }

    // ---------------------------------------------------------
    // 📱 Mobile Viewport Fix (The vh problem)
    // ---------------------------------------------------------
    #fixMobileViewport() {
        // แก้ปัญหา 100vh บน Safari มือถือ (ที่แถบ Address Bar กินพื้นที่)
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // ---------------------------------------------------------
    // 🍔 Mobile Menu System
    // ---------------------------------------------------------
    #setupMobileMenu() {
        let backdrop = document.getElementById('mobile-sidebar-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'mobile-sidebar-backdrop';
            backdrop.className = 'sidebar-backdrop-engine'; 
            document.body.appendChild(backdrop);
        }

        // ถอด onclick แบบเก่าทิ้ง
        const menuBtns = document.querySelectorAll('button.d-xl-none');
        menuBtns.forEach(btn => btn.removeAttribute('onclick'));

        // ดัก Event ทั้งเอกสาร (Event Delegation)
        document.addEventListener('click', this.boundHandleMenuClick);
    }

    #handleMobileMenuClick(e) {
        const sidebar = document.querySelector('.sidebar');
        const backdrop = document.getElementById('mobile-sidebar-backdrop');
        if (!sidebar || !backdrop) return;

        // 1. กดปุ่มแฮมเบอร์เกอร์ (เปิด/ปิด)
        const isMenuBtn = e.target.closest('button.d-xl-none');
        if (isMenuBtn) {
            sidebar.classList.toggle('active');
            backdrop.classList.toggle('active');
            e.preventDefault();
            e.stopPropagation(); 
            return;
        }

        // 2. กดปุ่มเมนูอื่นๆ หรือกดพื้นหลังดำ (ปิด)
        const isBackdropClick = e.target === backdrop;
        const isMenuLinkClick = e.target.closest('.sidebar .nav-item');
        
        if ((isBackdropClick || isMenuLinkClick) && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            backdrop.classList.remove('active');
        }
    }
}

// 🌐 Expose & Auto-Execute (ทำงานร่วมกับ Router หลักอย่างสวยงาม)
const ResponsiveEngine = new ResponsiveEngineService();
document.addEventListener("DOMContentLoaded", () => { ResponsiveEngine.init(); });