// js/pages/responsive_engine.js
// 🚀 สมองกลควบคุมการแสดงผล Responsive (V5 - Fix Double-Toggle Menu Bug)

const ResponsiveEngine = {
    lastWidth: window.innerWidth, 

    init: function() {
        this.injectCoreStyles();
        this.fixMobileViewport();
        this.autoWrapTables();
        this.setupMobileMenu(); // 🌟 อัปเกรด V5
        
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
        
        console.log("📱 [Responsive Engine] V5 Activated - Menu Bug Fixed!");
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
            backdrop.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15, 23, 42, 0.4); z-index:9998; opacity:0; visibility:hidden; transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px);';
            document.body.appendChild(backdrop);
        }

        // 🚨 ท่าไม้ตายปลดชนวนบั๊ก: ค้นหาปุ่มแฮมเบอร์เกอร์ แล้วลบคำสั่ง onclick เก่าที่ฝังใน HTML ทิ้งไปเลย!
        const menuBtns = document.querySelectorAll('button.d-xl-none');
        menuBtns.forEach(btn => btn.removeAttribute('onclick'));

        // ใช้สมองกลควบคุมการคลิกแทน 100%
        document.addEventListener('click', (e) => {
            const sidebar = document.querySelector('.sidebar');
            if (!sidebar) return;

            // ตรวจจับปุ่มแฮมเบอร์เกอร์
            const isMenuBtn = e.target.closest('button.d-xl-none');
            if (isMenuBtn) {
                const isActive = sidebar.classList.toggle('active');
                backdrop.style.opacity = isActive ? '1' : '0';
                backdrop.style.visibility = isActive ? 'visible' : 'hidden';
                e.preventDefault();
                e.stopPropagation(); // สั่งหยุด ไม่ให้คำสั่งคลิกทะลุไปโดนตัวอื่น
                return;
            }

            // ตรวจจับคลิกนอกเมนู หรือคลิกเมนูย่อย ให้ปิด Sidebar อัตโนมัติ
            const isBackdropClick = e.target === backdrop;
            const isMenuLinkClick = e.target.closest('.sidebar .nav-item');
            
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
        if (document.getElementById('responsive-engine-v5-styles')) return;

        const css = `
            html, body {
                width: 100% !important; max-width: 100vw !important;
                overflow-x: hidden !important; margin: 0; padding: 0;
                -webkit-text-size-adjust: 100%; 
            }

            *, *::before, *::after { box-sizing: border-box !important; }

            h1, h2, h3, h4, h5, h6, p, span, div, a {
                overflow-wrap: break-word; word-wrap: break-word; word-break: break-word;
            }

            .main-content, .content-wrapper, .sidebar { min-height: calc(var(--vh, 1vh) * 100); }
            html { font-size: clamp(13px, 1.2vw + 10px, 16px); }
            img, canvas, iframe, video, svg { max-width: 100% !important; height: auto; }

            .swal2-popup {
                width: 90% !important; max-width: 500px !important;
                padding: clamp(1em, 3vw, 2em) !important;
                box-sizing: border-box; border-radius: clamp(16px, 4vw, 24px) !important;
            }

            @media (max-width: 1199px) {
                .sidebar {
                    position: fixed !important;
                    left: -320px; top: 0; height: 100vh;
                    width: clamp(260px, 70vw, 320px) !important; 
                    z-index: 9999 !important; background: #fff;
                    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 5px 0 25px rgba(0,0,0,0.15); overflow-y: auto;
                }
                .sidebar.active { left: 0 !important; }
                .topbar button.d-xl-none { z-index: 10000; position: relative; }
                .main-content { padding: 15px !important; }
            }

            @media (max-width: 767px) {
                input[type="text"], input[type="number"], input[type="date"], input[type="password"],
                select, textarea, .form-control, .input-modern { font-size: 16px !important; }

                .btn { 
                    min-height: 48px; display: inline-flex; align-items: center; justify-content: center; 
                    white-space: normal; line-height: 1.4; 
                }

                .nav-tabs, .nav-pills, .emr-nav-pills, .finance-nav-tabs { 
                    flex-wrap: nowrap !important; overflow-x: auto !important; 
                    overflow-y: hidden !important; -webkit-overflow-scrolling: touch; 
                    justify-content: flex-start !important; padding-bottom: 5px; 
                }

                .search-box-modern, .modern-panel, .card { 
                    width: 100% !important; max-width: 100% !important; 
                    margin-left: 0 !important; margin-right: 0 !important;
                }
                
                .table-responsive { margin-bottom: 1rem; width: 100%; -webkit-overflow-scrolling: touch; }
                .table th, .table td { white-space: nowrap; }
            }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.id = 'responsive-engine-v5-styles';
        styleSheet.type = "text/css";
        styleSheet.innerText = css;
        document.head.appendChild(styleSheet);
    }
};

document.addEventListener("DOMContentLoaded", () => { ResponsiveEngine.init(); });