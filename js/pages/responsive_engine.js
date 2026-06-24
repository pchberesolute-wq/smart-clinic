// js/responsive_engine.js
// 🚀 สมองกลควบคุมการแสดงผล Responsive (Universal Screen Adapter)
// รองรับ มือถือ, iPad, Tablet และ PC ทุกรุ่น โดยไม่ให้ UI เพี้ยน

const ResponsiveEngine = {
    init: function() {
        this.injectCoreStyles();
        this.fixMobileViewport();
        this.autoWrapTables();
        
        // คอยดักจับเมื่อมีการย่อขยายหน้าจอ หรือหมุนจอ (Rotate Device)
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => this.handleResize());
        
        // สังเกตการณ์หน้าเว็บ (MutationObserver) ถ้ามีการวาดตารางใหม่ ให้จับหุ้มกรอบกันทะลุจอกันที
        const observer = new MutationObserver(() => this.autoWrapTables());
        observer.observe(document.body, { childList: true, subtree: true });
        
        console.log("📱 [Responsive Engine] Activated - System is now fully fluid.");
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

    autoWrapTables: function() {
        // ค้นหาตารางทั้งหมดที่ไม่ได้ถูกหุ้มด้วย .table-responsive
        const tables = document.querySelectorAll('table.table:not(.wrapped-by-engine)');
        tables.forEach(table => {
            // เช็คว่ามี parent เป็น .table-responsive หรือยัง ถ้ายังให้หุ้มเลย
            if (!table.closest('.table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive shadow-sm rounded-4 border border-light';
                wrapper.style.width = '100%';
                wrapper.style.overflowX = 'auto';
                wrapper.style.WebkitOverflowScrolling = 'touch'; // ให้มือถือเลื่อนซ้ายขวาได้สมูท
                
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

            /* 3. ทำให้รูปภาพและกล่องต่างๆ ยืดหยุ่นตามหน้าจอ (Fluid Media) */
            img, canvas, iframe, video, svg {
                max-width: 100%;
                height: auto;
            }

            /* 4. ปรับขนาด Font อัตโนมัติ (Fluid Typography) จอเล็กลง ตัวหนังสือเล็กลงให้พอดีจอ */
            html { font-size: 16px; }
            @media (max-width: 1199px) { html { font-size: 15px; } }
            @media (max-width: 991px) { html { font-size: 14.5px; } }
            @media (max-width: 767px) { html { font-size: 14px; } }
            @media (max-width: 575px) { html { font-size: 13.5px; } }

            /* 5. ปรับ Layout กล่องเด้ง (SweetAlert) ให้พอดีมือถือ/iPad */
            .swal2-popup {
                width: 95% !important;
                max-width: 600px !important;
                padding: 1.5em !important;
                box-sizing: border-box;
            }

            @media (max-width: 767px) {
                /* 6. ป้องกัน iOS Safari ซูมหน้าจอเมื่อกดพิมพ์ (Input Zoom Fix) */
                input[type="text"], input[type="number"], input[type="date"], 
                select, textarea, .form-control, .input-modern {
                    font-size: 16px !important; 
                }

                /* 7. ปรับขนาดปุ่มบนมือถือให้กดง่ายขึ้น (Apple Human Interface Guidelines: 44px min) */
                .btn {
                    min-height: 44px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    white-space: normal;
                    line-height: 1.4;
                }

                /* 8. จัดระเบียบ Table ให้สวยงามบนจอมือถือ ไม่ให้ตัวหนังสือบี้แบน */
                .table-responsive {
                    margin-bottom: 1rem;
                }
                .table th, .table td {
                    white-space: nowrap; 
                }

                /* 9. ปรับปุ่ม Tab เมนูต่างๆ ให้เลื่อนซ้ายขวาได้ ไม่ดันกันตกบรรทัด */
                .nav-tabs, .nav-pills, .emr-nav-pills, .finance-nav-tabs {
                    flex-wrap: nowrap !important;
                    overflow-x: auto !important;
                    overflow-y: hidden !important;
                    -webkit-overflow-scrolling: touch;
                    justify-content: flex-start !important;
                    padding-bottom: 5px;
                }
                
                /* 10. กล่องค้นหา (Search Box) ให้ขยายเต็มจอ 100% บนมือถือ */
                .search-box-modern {
                    width: 100% !important;
                    max-width: 100% !important;
                }
            }

            /* สำหรับ iPad Portrait (แนวตั้ง) */
            @media (min-width: 768px) and (max-width: 1024px) {
                .search-box-modern {
                    width: 100% !important;
                }
                .stat-card-analytics, .stat-card-finance, .stat-card-ledger {
                    padding: 15px;
                }
            }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.id = 'responsive-engine-styles';
        styleSheet.type = "text/css";
        styleSheet.innerText = css;
        document.head.appendChild(styleSheet);
    }
};

// สตาร์ทเครื่องยนต์ทันทีที่ไฟล์ถูกโหลด
document.addEventListener("DOMContentLoaded", () => {
    ResponsiveEngine.init();
});