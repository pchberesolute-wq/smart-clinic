// js/responsive_engine.js
// 🚀 สมองกลควบคุมการแสดงผล Responsive (V3 - Ultimate Mobile Sidebar & Backdrop)
// รองรับ มือถือ, iPad, Tablet และ PC ทุกรุ่น โดยไม่ให้ UI เพี้ยน

const ResponsiveEngine = {
    init: function() {
        this.injectCoreStyles();
        this.fixMobileViewport();
        this.autoWrapTables();
        this.setupMobileMenu(); // 🌟 อัปเกรด V3: เปิดใช้งานสมองกลควบคุมเมนูสไลด์ด้านข้าง
        
        // คอยดักจับเมื่อมีการย่อขยายหน้าจอ หรือหมุนจอ (Rotate Device)
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => this.handleResize());
        
        // สังเกตการณ์หน้าเว็บ (MutationObserver) ถ้ามีการวาดตารางใหม่ ให้จับหุ้มกรอบป้องกันทะลุจอกันที
        const observer = new MutationObserver(() => this.autoWrapTables());
        observer.observe(document.body, { childList: true, subtree: true });
        
        console.log("📱 [Responsive Engine] V3 Activated - Full Mobile Navigation Enabled.");
    },

    handleResize: function() {
        this.fixMobileViewport();
        // ปิด Keyboard บนมือถือตอนหมุนจอเพื่อป้องกัน UI พัง
        if(document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
            document.activeElement.blur();
        }
    },

    fixMobileViewport: function() {
        // แก้ปัญหา 100vh บน Mobile Safari/Chrome ที่มักจะโดนแถบ URL ของเบราว์เซอร์บังส่วนล่าง
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    },

    // 🌟 ระบบควบคุม Sidebar บนมือถือ (Event Delegation & Backdrop Engine)
    setupMobileMenu: function() {
        // 1. สร้างฉากหลังสีดำโปร่งแสง (Backdrop) สไตล์แอปมือถือพรีเมียม
        let backdrop = document.getElementById('mobile-sidebar-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'mobile-sidebar-backdrop';
            backdrop.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15, 23, 42, 0.4); z-index:9998; opacity:0; visibility:hidden; transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px);';
            document.body.appendChild(backdrop);
        }

        // 2. ใช้ Event Delegation ดักจับการกดปุ่มทั่วทั้งหน้าจอ
        document.addEventListener('click', (e) => {
            const sidebar = document.querySelector('.sidebar');
            if (!sidebar) return;

            // ตรวจจับว่ากดปุ่มแฮมเบอร์เกอร์หรือไม่ (ปุ่มบน Topbar)
            const isMenuBtn = e.target.closest('.topbar button') || e.target.closest('button.d-xl-none');
            
            if (isMenuBtn) {
                const isActive = sidebar.classList.toggle('active');
                backdrop.style.opacity = isActive ? '1' : '0';
                backdrop.style.visibility = isActive ? 'visible' : 'hidden';
                e.preventDefault();
                return;
            }

            // 3. ปิดเมนูอัตโนมัติ เมื่อกดฉากหลัง หรือ เมื่อกดเลือกเมนูย่อยเสร็จแล้ว
            const isBackdropClick = e.target === backdrop;
            const isMenuLinkClick = e.target.closest('.sidebar .nav-link');
            
            if ((isBackdropClick || isMenuLinkClick) && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                backdrop.style.opacity = '0';
                backdrop.style.visibility = 'hidden';
            }
        });
    },

    autoWrapTables: function() {
        const tables = document.querySelectorAll('table.table:not(.wrapped-by-engine)');
        tables.forEach(table => {
            if (!table.closest('.table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive shadow-sm rounded-4 border border-light';
                wrapper.style.width = '100%';
                wrapper.style.overflowX = 'auto';
                wrapper.style.WebkitOverflowScrolling = 'touch'; 
                
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
                table.classList.add('wrapped-by-engine');
            }
        });
    },

    injectCoreStyles: function() {
        if (document.getElementById('responsive-engine-styles')) return;

        const css = `
            /* 1. แก้ปัญหาความสูงหน้าจอบนมือถือ (Mobile Viewport Fix) */
            .main-content, .content-wrapper, .sidebar {
                min-height: calc(var(--vh, 1vh) * 100);
            }

            /* 2. บังคับไม่ให้ Content ทะลุขอบจอ (Horizontal Overflow Protection) */
            html, body {
                max-width: 100vw !important;
                overflow-x: hidden !important;
                width: 100% !important;
            }

            img, canvas, iframe, video, svg { max-width: 100%; height: auto; }
            html { font-size: 16px; }
            @media (max-width: 1199px) { html { font-size: 15px; } }
            @media (max-width: 991px) { html { font-size: 14.5px; } }
            @media (max-width: 767px) { html { font-size: 14px; } }
            @media (max-width: 575px) { html { font-size: 13.5px; } }

            .swal2-popup {
                width: 95% !important;
                max-width: 600px !important;
                padding: 1.5em !important;
                box-sizing: border-box;
            }

            /* 🚨 CSS สำหรับเมนูสไลด์ (Mobile Sidebar) 🚨 */
            @media (max-width: 1199px) {
                .sidebar {
                    position: fixed !important;
                    left: -320px;
                    top: 0;
                    height: 100vh;
                    width: 280px !important;
                    z-index: 9999 !important;
                    background: #fff;
                    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 5px 0 25px rgba(0,0,0,0.15);
                    overflow-y: auto;
                }
                .sidebar.active {
                    left: 0 !important;
                }
                .topbar button.d-xl-none {
                    z-index: 10000;
                    position: relative;
                }
            }

            @media (max-width: 767px) {
                input[type="text"], input[type="number"], input[type="date"], select, textarea, .form-control, .input-modern { font-size: 16px !important; }
                .btn { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; white-space: normal; line-height: 1.4; }
                .table-responsive { margin-bottom: 1rem; }
                .table th, .table td { white-space: nowrap; }
                .nav-tabs, .nav-pills, .emr-nav-pills, .finance-nav-tabs { flex-wrap: nowrap !important; overflow-x: auto !important; overflow-y: hidden !important; -webkit-overflow-scrolling: touch; justify-content: flex-start !important; padding-bottom: 5px; }
                .search-box-modern { width: 100% !important; max-width: 100% !important; }
            }

            @media (min-width: 768px) and (max-width: 1024px) {
                .search-box-modern { width: 100% !important; }
                .stat-card-analytics, .stat-card-finance, .stat-card-ledger { padding: 15px; }
            }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.id = 'responsive-engine-styles';
        styleSheet.type = "text/css";
        styleSheet.innerText = css;
        document.head.appendChild(styleSheet);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    ResponsiveEngine.init();
});