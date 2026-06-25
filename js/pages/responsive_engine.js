// js/pages/responsive_engine.js
// 🚀 สมองกลควบคุมการแสดงผล Responsive (V4 - Ultimate Auto-Scaler)
// ซัพพอร์ต: Mobile, Tablet, iPad, PC (ป้องกัน UI เพี้ยน 100%)

const ResponsiveEngine = {
    // จำความกว้างเดิมไว้ เพื่อแยกแยะว่า "หมุนจอจริงๆ" หรือแค่ "คีย์บอร์ดเด้ง"
    lastWidth: window.innerWidth, 

    init: function() {
        this.injectCoreStyles();
        this.fixMobileViewport();
        this.autoWrapTables();
        this.setupMobileMenu();
        
        // 🚨 ดักจับ Resize: ให้ทำงานเฉพาะเมื่อ "ความกว้าง (Width)" เปลี่ยนแปลงเท่านั้น
        // วิธีนี้จะดับปัญหาคีย์บอร์ดมือถือเด้งรัวๆ เพราะคีย์บอร์ดเปลี่ยนแค่ความสูง (Height)
        window.addEventListener('resize', () => {
            if (window.innerWidth !== this.lastWidth) {
                this.lastWidth = window.innerWidth;
                this.handleWidthChange();
            }
        });

        // ดักจับเวลาหมุนจอ (Rotate Device)
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleWidthChange(), 150); // ดีเลย์นิดนึงรอให้จอหมุนเสร็จ
        });
        
        // สังเกตการณ์หน้าเว็บ (MutationObserver) ถ้ามีตารางใหม่โหลดมา ให้หุ้มเกราะทันที
        const observer = new MutationObserver(() => this.autoWrapTables());
        observer.observe(document.body, { childList: true, subtree: true });
        
        console.log("📱 [Responsive Engine] V4 Activated - 100% Fluid Auto-Scaler");
    },

    handleWidthChange: function() {
        this.fixMobileViewport();
        // ปิดคีย์บอร์ดทิ้งเมื่อมีการหมุนจอ เพื่อกัน UI บี้
        if(document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
            document.activeElement.blur();
        }
    },

    fixMobileViewport: function() {
        // แก้ปัญหาความสูง 100vh บน Mobile Safari/Chrome ที่ชอบโดนแถบ URL บัง
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    },

    // 🌟 ระบบควบคุม Sidebar บนมือถือ (Event Delegation & Backdrop Engine)
    setupMobileMenu: function() {
        let backdrop = document.getElementById('mobile-sidebar-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'mobile-sidebar-backdrop';
            backdrop.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15, 23, 42, 0.4); z-index:9998; opacity:0; visibility:hidden; transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px);';
            document.body.appendChild(backdrop);
        }

        document.addEventListener('click', (e) => {
            const sidebar = document.querySelector('.sidebar');
            if (!sidebar) return;

            // ตรวจจับปุ่มแฮมเบอร์เกอร์
            const isMenuBtn = e.target.closest('.topbar button') || e.target.closest('button.d-xl-none');
            if (isMenuBtn) {
                const isActive = sidebar.classList.toggle('active');
                backdrop.style.opacity = isActive ? '1' : '0';
                backdrop.style.visibility = isActive ? 'visible' : 'hidden';
                e.preventDefault();
                return;
            }

            // ตรวจจับคลิกนอกเมนู หรือคลิกเมนูย่อย ให้ปิด Sidebar อัตโนมัติ
            const isBackdropClick = e.target === backdrop;
            const isMenuLinkClick = e.target.closest('.sidebar .nav-link');
            
            if ((isBackdropClick || isMenuLinkClick) && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                backdrop.style.opacity = '0';
                backdrop.style.visibility = 'hidden';
            }
        });
    },

    // 🌟 หุ้มเกราะให้ตารางทั้งหมด ป้องกันตารางแทงทะลุขอบจอมือถือ
    autoWrapTables: function() {
        const tables = document.querySelectorAll('table.table:not(.wrapped-by-engine)');
        tables.forEach(table => {
            if (!table.closest('.table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive shadow-sm rounded-4 border border-light';
                wrapper.style.width = '100%';
                wrapper.style.overflowX = 'auto';
                wrapper.style.WebkitOverflowScrolling = 'touch'; // เลื่อนสมูทบน iOS
                
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
                table.classList.add('wrapped-by-engine');
            }
        });
    },

    // 🌟 อัดฉีด CSS ระดับปรมาจารย์ เพื่อบล็อกการแสดงผลเพี้ยน 100%
    injectCoreStyles: function() {
        if (document.getElementById('responsive-engine-v4-styles')) return;

        const css = `
            /* 1. Global Safety Net (กันขอบล้น กันทะลุจอ บังคับตัดคำ) */
            html, body {
                width: 100% !important;
                max-width: 100vw !important;
                overflow-x: hidden !important; /* ดับจับทุกการล้นออกแกน X */
                margin: 0; padding: 0;
                -webkit-text-size-adjust: 100%; /* ห้าม iOS ซูมฟอนต์หน้าเว็บเอง */
            }

            *, *::before, *::after {
                box-sizing: border-box !important;
            }

            /* บังคับตัดคำยาวๆ (เช่น ลิงก์, ชื่อคนยาวๆ) ไม่ให้ดันกล่องแตก */
            h1, h2, h3, h4, h5, h6, p, span, div, a {
                overflow-wrap: break-word;
                word-wrap: break-word;
                word-break: break-word;
            }

            .main-content, .content-wrapper, .sidebar {
                min-height: calc(var(--vh, 1vh) * 100);
            }

            /* 2. Fluid Typography (ฟอนต์ย่อขยายดั่งยางยืด ไม่ต้องเขียน Media Query เยอะ) */
            html {
                font-size: clamp(13px, 1.2vw + 10px, 16px);
            }

            /* 3. Fluid Media (รูปและวิดีโอต้องไม่ล้นจอ) */
            img, canvas, iframe, video, svg {
                max-width: 100% !important;
                height: auto;
            }

            /* 4. Modal (SweetAlert) Auto-Scaler */
            .swal2-popup {
                width: 90% !important;
                max-width: 500px !important;
                padding: clamp(1em, 3vw, 2em) !important;
                box-sizing: border-box;
                border-radius: clamp(16px, 4vw, 24px) !important;
            }

            /* 5. Mobile Sidebar (ยืดหยุ่นตามจอมือถือ/iPad) */
            @media (max-width: 1199px) {
                .sidebar {
                    position: fixed !important;
                    left: -320px;
                    top: 0;
                    height: 100vh;
                    width: clamp(260px, 70vw, 320px) !important; 
                    z-index: 9999 !important;
                    background: #fff;
                    transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 5px 0 25px rgba(0,0,0,0.15);
                    overflow-y: auto;
                }
                .sidebar.active { left: 0 !important; }
                .topbar button.d-xl-none { z-index: 10000; position: relative; }
                
                /* ปรับลด Padding ลงเพื่อให้จอแคบมีพื้นที่แสดงข้อมูลมากขึ้น */
                .main-content { padding: 15px !important; }
            }

            /* 6. Form & Touch Optimization (มือถือต้องกดง่าย ไม่ซูมเอง) */
            @media (max-width: 767px) {
                /* กฎเหล็ก Apple: ฟอนต์ใน Input ต้อง 16px ขึ้นไป ไม่งั้นกดพิมพ์แล้วจอจะซูมเข้าเอง */
                input[type="text"], input[type="number"], input[type="date"], input[type="password"],
                select, textarea, .form-control, .input-modern { 
                    font-size: 16px !important; 
                }

                /* ปุ่มกดให้เต็มความกว้างและสูงพอดีนิ้ว (ขั้นต่ำ 44px) */
                .btn { 
                    min-height: 48px; 
                    display: inline-flex; align-items: center; justify-content: center; 
                    white-space: normal; line-height: 1.4; 
                }

                /* แท็บเมนู (Tabs) ให้เลื่อนปัดซ้ายขวาได้ ห้ามดันกันตกบรรทัด */
                .nav-tabs, .nav-pills, .emr-nav-pills, .finance-nav-tabs { 
                    flex-wrap: nowrap !important; overflow-x: auto !important; 
                    overflow-y: hidden !important; -webkit-overflow-scrolling: touch; 
                    justify-content: flex-start !important; padding-bottom: 5px; 
                }

                /* บังคับกล่องต่างๆ ให้ใช้ความกว้าง 100% แทนการ Fix Pixel */
                .search-box-modern, .modern-panel, .card { 
                    width: 100% !important; 
                    max-width: 100% !important; 
                    margin-left: 0 !important; margin-right: 0 !important;
                }
                
                .table-responsive { margin-bottom: 1rem; width: 100%; -webkit-overflow-scrolling: touch; }
                .table th, .table td { white-space: nowrap; }
            }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.id = 'responsive-engine-v4-styles';
        styleSheet.type = "text/css";
        styleSheet.innerText = css;
        document.head.appendChild(styleSheet);
    }
};

// สตาร์ทเครื่องยนต์อัจฉริยะทันที
document.addEventListener("DOMContentLoaded", () => {
    ResponsiveEngine.init();
});