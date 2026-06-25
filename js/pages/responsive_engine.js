// js/pages/responsive_engine.js
// 🚀 สมองกลควบคุมการแสดงผล Responsive (V8 - Absolute Layout Override)

const ResponsiveEngine = {
    lastWidth: window.innerWidth, 

    init: function() {
        this.injectUltimateStyles(); // 🌟 อาวุธหนัก: ฝัง CSS บังคับโครงสร้างขั้นเด็ดขาด
        this.fixMobileViewport();
        this.autoWrapTables();
        this.setupMobileMenu(); 
        
        window.addEventListener('resize', () => {
            if (window.innerWidth !== this.lastWidth) {
                this.lastWidth = window.innerWidth;
                this.handleWidthChange();
            }
        });

        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleWidthChange(), 150);
        });
        
        const observer = new MutationObserver(() => this.autoWrapTables());
        observer.observe(document.body, { childList: true, subtree: true });
        
        console.log("📱 [Responsive Engine] V8 Activated - Absolute Layout Control");
    },

    handleWidthChange: function() {
        this.fixMobileViewport();
        if(document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
            document.activeElement.blur();
        }
    },

    fixMobileViewport: function() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    },

    // 🌟 ระบบควบคุม Sidebar บนมือถือ
    setupMobileMenu: function() {
        let backdrop = document.getElementById('mobile-sidebar-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'mobile-sidebar-backdrop';
            backdrop.className = 'sidebar-backdrop-engine'; 
            document.body.appendChild(backdrop);
        }

        const menuBtns = document.querySelectorAll('button.d-xl-none');
        menuBtns.forEach(btn => btn.removeAttribute('onclick'));

        document.addEventListener('click', (e) => {
            const sidebar = document.querySelector('.sidebar');
            if (!sidebar) return;

            const isMenuBtn = e.target.closest('button.d-xl-none');
            if (isMenuBtn) {
                sidebar.classList.toggle('active');
                backdrop.classList.toggle('active');
                e.preventDefault();
                e.stopPropagation(); 
                return;
            }

            const isBackdropClick = e.target === backdrop;
            const isMenuLinkClick = e.target.closest('.sidebar .nav-item');
            
            if ((isBackdropClick || isMenuLinkClick) && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                backdrop.classList.remove('active');
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

    // 🚨 ท่าไม้ตาย: เขียนทับโครงสร้างหน้าจอทุกประเภทด้วย JavaScript ป้องกันแคชเบราว์เซอร์
    injectUltimateStyles: function() {
        if (document.getElementById('responsive-engine-v8-styles')) return;

        const css = `
            /* 🛡️ กฎเหล็กบังคับไม่ให้ CSS อื่นมาทำลายโครงสร้าง (Absolute Layout Control) */
            
            html, body {
                width: 100% !important; max-width: 100vw !important;
                overflow-x: hidden !important; margin: 0 !important; padding: 0 !important;
            }

            *, *::before, *::after { box-sizing: border-box !important; }

            /* บังคับตัดคำยาวๆ ไม่ให้กล่องแตก */
            h1, h2, h3, h4, h5, h6, p, span, div, a {
                overflow-wrap: break-word; word-wrap: break-word;
            }

            /* 🌟 เลเยอร์ 1: คอมพิวเตอร์ตั้งโต๊ะ (Desktop: 1200px ขึ้นไป) */
            .sidebar {
                position: fixed !important; top: 0 !important; left: 0 !important;
                height: 100vh !important; width: 320px !important;
                z-index: 1000 !important;
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
            }
            .main-content {
                margin-left: 320px !important;
                min-height: calc(var(--vh, 1vh) * 100) !important;
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
            }
            .sidebar-backdrop-engine { display: none !important; }

            /* 🌟 เลเยอร์ 2: แท็บเล็ตและ iPad แนวตั้ง (Tablet: 768px - 1199px) */
            @media (min-width: 768px) and (max-width: 1199px) {
                .sidebar { width: 90px !important; }
                .sidebar .brand-text, .sidebar .nav-section, .sidebar .nav-item span, .sidebar .user-info { display: none !important; }
                .sidebar .sidebar-brand { justify-content: center !important; padding: 0 !important; }
                .sidebar .brand-icon { margin-right: 0 !important; }
                .sidebar .nav-item { justify-content: center !important; padding: 14px 0 !important; margin: 4px 15px !important; }
                .sidebar .nav-item i { margin-right: 0 !important; font-size: 22px !important; }
                .sidebar .user-card-wrapper { padding: 10px !important; margin: 0 10px !important; border: none !important; background: transparent !important; box-shadow: none !important; }
                .sidebar .user-card { justify-content: center !important; }
                .sidebar .user-avatar { margin-right: 0 !important; width: 45px !important; height: 45px !important; }
                .main-content { margin-left: 90px !important; }
                .search-box-modern { width: 100% !important; }
            }

            /* 🌟 เลเยอร์ 3: มือถือ (Mobile: ต่ำกว่า 768px) */
            @media (max-width: 767px) {
                .sidebar {
                    left: -320px !important;
                    width: clamp(260px, 75vw, 320px) !important; 
                    z-index: 9999 !important; 
                    box-shadow: 5px 0 25px rgba(0,0,0,0.15) !important; 
                }
                .sidebar.active { left: 0 !important; }
                
                /* แสดงตัวหนังสือกลับมาสำหรับมือถือ */
                .sidebar .brand-text, .sidebar .nav-section, .sidebar .nav-item span, .sidebar .user-info { display: block !important; } 
                .sidebar .nav-item { justify-content: flex-start !important; padding: 12px 18px !important; margin: 6px 20px !important; }
                .sidebar .nav-item i { margin-right: 12px !important; font-size: 18px !important; }
                .sidebar .user-card-wrapper { border: 1px solid #e2e8f0 !important; padding: 12px !important; margin: 0 !important; }
                .sidebar .user-avatar { margin-right: 12px !important; }

                .main-content { margin-left: 0 !important; }
                .topbar { padding: 0 15px !important; height: 80px !important; }
                .content-wrapper { padding: 0 15px 30px 15px !important; }
                .topbar button.d-xl-none { display: flex !important; z-index: 10000 !important; margin-right: 10px !important; } 
                
                .time-widget { display: none !important; }
                .search-box, .search-box-modern { width: 100% !important; max-width: 100% !important; }
                
                /* ฉากหลังมือถือ */
                .sidebar-backdrop-engine {
                    position: fixed !important; top: 0 !important; left: 0 !important; 
                    width: 100vw !important; height: 100vh !important;
                    background: rgba(15, 23, 42, 0.4) !important; z-index: 9998 !important;
                    opacity: 0; visibility: hidden; transition: all 0.3s ease;
                    backdrop-filter: blur(3px) !important; -webkit-backdrop-filter: blur(3px) !important;
                    display: block !important;
                }
                .sidebar-backdrop-engine.active { opacity: 1 !important; visibility: visible !important; }

                /* การซูม & Input */
                input[type="text"], input[type="number"], input[type="date"], input[type="password"],
                select, textarea, .form-control, .input-modern { font-size: 16px !important; }

                .btn { min-height: 48px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; white-space: normal !important; line-height: 1.4 !important; }

                .nav-tabs, .nav-pills, .emr-nav-pills, .finance-nav-tabs { 
                    flex-wrap: nowrap !important; overflow-x: auto !important; 
                    overflow-y: hidden !important; -webkit-overflow-scrolling: touch !important; 
                    justify-content: flex-start !important; padding-bottom: 5px !important; 
                }
                
                .table-responsive { margin-bottom: 1rem !important; width: 100% !important; -webkit-overflow-scrolling: touch !important; }
                .table th, .table td { white-space: nowrap !important; }
            }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.id = 'responsive-engine-v8-styles';
        styleSheet.type = "text/css";
        styleSheet.innerText = css;
        document.head.appendChild(styleSheet);
    }
};

document.addEventListener("DOMContentLoaded", () => { ResponsiveEngine.init(); });