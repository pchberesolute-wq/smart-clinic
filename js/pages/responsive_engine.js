// js/pages/responsive_engine.js
// 🚀 สมองกลควบคุมการแสดงผล Responsive (V2 - Fix Mobile Keyboard & Sidebar)

const ResponsiveEngine = {
    init: function() {
        this.injectCoreStyles();
        this.fixMobileViewport();
        this.autoWrapTables();
        
        // 🚨 แก้ปัญหาที่ 1: เปลี่ยนจากการดัก 'resize' เป็นดักเฉพาะตอนหมุนจอ (orientationchange)
        // ทำให้คีย์บอร์ดมือถือไม่เด้งขึ้นลงเวลากดพิมพ์รหัสผ่านอีกต่อไป!
        window.addEventListener('orientationchange', () => this.handleOrientationChange());
        
        const observer = new MutationObserver(() => this.autoWrapTables());
        observer.observe(document.body, { childList: true, subtree: true });
        
        console.log("📱 [Responsive Engine] V2 Activated - System is now fully fluid.");
    },

    handleOrientationChange: function() {
        this.fixMobileViewport();
        if(document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
            document.activeElement.blur();
        }
    },

    fixMobileViewport: function() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    },

    autoWrapTables: function() {
        const tables = document.querySelectorAll('table.table:not(.wrapped-by-engine)');
        tables.forEach(table => {
            if (!table.closest('.table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive shadow-sm rounded-4 border border-light';
                wrapper.style.width = '100%'; wrapper.style.overflowX = 'auto'; wrapper.style.WebkitOverflowScrolling = 'touch';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
                table.classList.add('wrapped-by-engine');
            }
        });
    },

    injectCoreStyles: function() {
        if (document.getElementById('responsive-engine-styles')) return;
        const css = `
            .main-content, .content-wrapper { min-height: calc(var(--vh, 1vh) * 100); }
            html, body { max-width: 100vw !important; overflow-x: hidden !important; width: 100% !important; }
            img, canvas, iframe, video, svg { max-width: 100%; height: auto; }
            html { font-size: 16px; }
            @media (max-width: 1199px) { html { font-size: 15px; } }
            @media (max-width: 991px) { html { font-size: 14.5px; } }
            @media (max-width: 767px) { html { font-size: 14px; } }
            @media (max-width: 575px) { html { font-size: 13.5px; } }
            .swal2-popup { width: 95% !important; max-width: 600px !important; padding: 1.5em !important; box-sizing: border-box; }
            
            /* 🚨 แก้ปัญหาที่ 3: ทำให้เมนู Sidebar สไลด์ออกมาได้เมื่อใช้งานบนมือถือ/iPad 🚨 */
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
                    left: 0;
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
        `;
        const styleSheet = document.createElement("style");
        styleSheet.id = 'responsive-engine-styles'; styleSheet.type = "text/css"; styleSheet.innerText = css;
        document.head.appendChild(styleSheet);
    }
};

document.addEventListener("DOMContentLoaded", () => { ResponsiveEngine.init(); });