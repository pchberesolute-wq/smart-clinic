// js/pages/ui_orchestrator.js
// 👑 TRUE GOD-MODE UI Orchestrator: ดักปล้นและยึดอำนาจคำสั่ง DataTables และ Responsive UI แบบ 100%

class UIOrchestratorService {
    constructor() {
        this.init();
    }

    init() {
        this._injectAbsoluteStyles();
        this._hijackDataTables(); 
        this._setupRotationEngine(); 
        this._setupGlobalSweetAlertFix(); // 🚨 แก้ป๊อปอัปหลบหลังเมนู
        this._enforceTabletDesktopLayout(); // 🚨 แก้ iPad แนวนอนเมนูหด
        
        console.log("👑 [UI Orchestrator] TRUE GOD-MODE Activated (100% Override)");
    }

    // ==========================================
    // 🛡️ 0. แฟกซ์ Z-Index ทะลุจักรวาล (แก้ป๊อปอัป Logout โดนเมนูบังในมือถือ)
    // ==========================================
    _setupGlobalSweetAlertFix() {
        if (document.getElementById('orchestrator-swal-fix')) return;
        const style = document.createElement('style');
        style.id = 'orchestrator-swal-fix';
        style.innerHTML = `
            /* 🚨 บังคับป๊อปอัป SweetAlert ให้อยู่บนสุดเหนือทุกสิ่ง (Max 32-bit Integer) */
            div.swal2-container {
                z-index: 2147483647 !important;
            }
            
            /* 🚨 เวลาที่ป๊อปอัปแสดงขึ้นมา บังคับให้ Sidebar/Offcanvas มุดลงไปอยู่ข้างล่างทันที */
            body.swal2-shown [class*="sidebar"],
            body.swal2-shown [class*="offcanvas"],
            body.swal2-shown [id*="sidebar"],
            body.swal2-shown header {
                z-index: 1000 !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // 📱 0.1 บังคับ iPad แนวนอนให้กางเมนูเต็ม (แก้ปัญหาปุ่ม 3 ขีด และเมนูหด)
    // ==========================================
    _enforceTabletDesktopLayout() {
        const fixLayout = () => {
            // หน้าจอกว้างตั้งแต่ 992px ขึ้นไป (iPad แนวนอน และ คอมพิวเตอร์)
            if (window.innerWidth >= 992) {
                // 1. ถอดคลาสที่ทำให้ Sidebar หดตัวออกให้หมด (ครอบคลุมทุกคลาสมาตรฐาน)
                document.body.classList.remove('sidebar-collapse', 'sidebar-mini', 'sidebar-collapsed', 'toggle-sidebar');
                
                // 2. ใส่คลาสที่บังคับให้ Sidebar กางออกเต็ม 100%
                document.body.classList.add('sidebar-expanded', 'sidebar-open');
                
                // 3. ปิดปุ่ม 3 ขีด (Hamburger Menu) ทิ้งเด็ดขาด
                const togglers = document.querySelectorAll('.sidebar-toggle, #sidebarToggle, .hamburger-menu, [data-bs-toggle="sidebar"], .mobile-toggle');
                togglers.forEach(btn => btn.style.setProperty('display', 'none', 'important'));
            } else {
                // มือถือ และ iPad แนวตั้ง: ปล่อยให้ปุ่ม 3 ขีดแสดงตามปกติ
                const togglers = document.querySelectorAll('.sidebar-toggle, #sidebarToggle, .hamburger-menu, [data-bs-toggle="sidebar"], .mobile-toggle');
                togglers.forEach(btn => btn.style.removeProperty('display'));
            }
        };

        // ทำงานทันทีตอนโหลด
        fixLayout();
        
        // ทำงานทุกครั้งที่หมุนจอ หรือย่อขยายหน้าต่าง
        window.addEventListener('resize', fixLayout);
        window.addEventListener('orientationchange', () => {
            setTimeout(fixLayout, 200);
            setTimeout(fixLayout, 600); // ย้ำอีกครั้งเผื่อ Browser เรนเดอร์ช้า
        });
    }

    // ==========================================
    // 🔄 1. ระบบดักจับการหมุนหน้าจอ (Orientation Change Engine)
    // ==========================================
    _setupRotationEngine() {
        const adjustLayout = () => {
            if (typeof $ !== 'undefined' && $.fn.DataTable) {
                $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
                console.log("🔄 [UI Orchestrator] Screen Rotated -> Tables Re-calculated");
            }
        };

        window.addEventListener('orientationchange', () => {
            setTimeout(adjustLayout, 200); 
            setTimeout(adjustLayout, 500); 
        });

        window.addEventListener('resize', () => {
            clearTimeout(this._resizeTimer);
            this._resizeTimer = setTimeout(adjustLayout, 150); 
        });
    }

    // ==========================================
    // ⚔️ 2. ระบบยึดอำนาจ DataTables (แก้ปุ่มตารางเพี้ยนให้คลุมทุกหน้า 100%)
    // ==========================================
    _hijackDataTables() {
        let retries = 0;
        const applyHijack = () => {
            if (typeof $ !== 'undefined' && $.fn && $.fn.dataTable && !$.fn.dataTable.__godModeStatus) {
                
                // 1. ตั้งค่าพื้นฐาน (Defaults) ให้เป็นแบบที่เราต้องการ 100%
                $.extend(true, $.fn.dataTable.defaults, {
                    language: { 
                        url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/th.json",
                        search: "", searchPlaceholder: "🔍 พิมพ์ค้นหา...", lengthMenu: "แสดง _MENU_ รายการ",
                        emptyTable: "<div class='py-4 text-muted text-center' style='font-family:Prompt;'><i class='fa-solid fa-folder-open fa-3x mb-3 opacity-25'></i><br>ไม่มีข้อมูลในระบบ</div>",
                        zeroRecords: "<div class='py-4 text-muted text-center' style='font-family:Prompt;'><i class='fa-solid fa-search fa-3x mb-3 opacity-25'></i><br>ไม่พบข้อมูลที่ค้นหา</div>"
                    },
                    destroy: true,
                    autoWidth: false,
                    responsive: false, // ปิด Responsive ดั้งเดิมที่ทำให้ตารางหด
                    scrollX: false, // ปิด ScrollX ของ DataTables ใช้ CSS แทน
                    dom: '<"d-flex flex-wrap justify-content-between align-items-center mb-3 w-100 gap-2"lf>rt<"d-flex flex-wrap justify-content-between align-items-center mt-3 w-100 gap-2"ip>' // โครงสร้างบน-ล่าง
                });

                // 2. The Hijacker: ทับฟังก์ชันสร้างตาราง เพื่อกันไม่ให้ไฟล์อื่นล้างการตั้งค่าของเรา
                const originalDataTable = $.fn.dataTable;
                
                $.fn.dataTable = function(options, ...args) {
                    if (options && typeof options === 'object') {
                        options.destroy = true;
                        options.autoWidth = false;
                        options.responsive = false; 
                        options.scrollX = false; 
                        options.dom = '<"d-flex flex-wrap justify-content-between align-items-center mb-3 w-100 gap-2"lf>rt<"d-flex flex-wrap justify-content-between align-items-center mt-3 w-100 gap-2"ip>';
                    }
                    return originalDataTable.apply(this, [options, ...args]);
                };

                Object.assign($.fn.dataTable, originalDataTable);
                $.fn.DataTable = $.fn.dataTable;
                $.fn.dataTable.__godModeStatus = true; 

                // 3. สายลับแต่งหน้าตา (ทำงานทุกครั้งที่ตารางวาดเสร็จ หรือเปลี่ยนหน้า)
                const styleDataTablesUI = () => {
                    // จัดการกล่องค้นหา
                    $('.dataTables_filter input').addClass('form-control shadow-sm').css({
                        'border-radius': '50px', 'padding': '6px 16px', 'background': '#f8fafc', 'width': '100%', 'max-width': '250px', 'outline': 'none'
                    });
                    
                    // จัดการเมนูเลือกจำนวนหน้า
                    $('.dataTables_length select').addClass('form-select shadow-sm').css({'border-radius': '12px'});
                    
                    // จัดการปุ่มหน้าถัดไป (Pagination) ให้ไม่เพี้ยน
                    $('.dataTables_paginate > .pagination').addClass('pagination-sm mb-0 shadow-sm flex-wrap justify-content-center');
                    
                    // บังคับสไตล์ปุ่ม Pagination ให้สวยงาม
                    $('.page-item .page-link').addClass('shadow-sm').css({
                        'border-radius': '8px', 'color': '#475569', 'font-weight': '700', 'font-family': 'Prompt', 'padding': '6px 12px', 'background': '#f8fafc', 'margin': '0 2px', 'border': 'none'
                    });
                    $('.page-item.active .page-link').css({
                        'background': '#3b82f6', 'color': 'white', 'box-shadow': '0 4px 10px rgba(59, 130, 246, 0.3)'
                    });
                    $('.page-item.disabled .page-link').css({
                        'opacity': '0.5', 'background': '#f1f5f9'
                    });
                };

                // วางสายลับดักจับทุกการวาดตารางในโปรแกรม
                $(document).on('draw.dt', styleDataTablesUI);
                $(document).on('init.dt', styleDataTablesUI);

                // 🚨 NEW: ใช้ MutationObserver ดักจับเผื่อกรณีหน้าไหนโหลดช้า แล้วปุ่มตารางเพี้ยน
                const observer = new MutationObserver((mutations) => {
                    let shouldStyle = false;
                    mutations.forEach(m => {
                        if (m.target.classList && (m.target.classList.contains('dataTables_wrapper') || m.target.classList.contains('pagination'))) {
                            shouldStyle = true;
                        }
                    });
                    if(shouldStyle) styleDataTablesUI();
                });
                observer.observe(document.body, { childList: true, subtree: true });

            } else if (retries < 100) {
                retries++;
                setTimeout(applyHijack, 50);
            }
        };
        applyHijack();
    }

    // ==========================================
    // 💉 3. CSS Absolute Hard-Lock (ล็อคขั้นเด็ดขาด ทะลวงทุกหน้าเพจ)
    // ==========================================
    _injectAbsoluteStyles() {
        if (document.getElementById('orchestrator-absolute-styles')) return;
        const style = document.createElement('style');
        style.id = 'orchestrator-absolute-styles';
        style.innerHTML = `
            /* 👑 บังคับกล่องนอกสุดห้ามล้นจอเด็ดขาด */
            .modern-panel, .card { 
                overflow: hidden !important; 
                width: 100% !important; 
                max-width: 100% !important;
                box-sizing: border-box !important;
            }

            /* 👑 DataTables Wrapper ให้เป็นกรอบเลื่อนซ้ายขวาอย่างสมบูรณ์แบบ */
            .dataTables_wrapper { 
                width: 100% !important; 
                max-width: 100vw !important;
                overflow-x: auto !important; 
                overflow-y: hidden !important;
                -webkit-overflow-scrolling: touch !important; 
                padding-bottom: 5px !important;
            }
            
            /* 👑 ล็อคตารางให้กว้าง 900px */
            table.dataTable, table.table { 
                min-width: 900px !important; 
                width: 100% !important; 
                border-collapse: collapse !important; 
                margin-top: 10px !important; 
                margin-bottom: 10px !important; 
            }
            
            table.dataTable th, table.dataTable td, table.table th, table.table td {
                padding: 12px 16px !important;
                white-space: nowrap !important;
                vertical-align: middle !important;
                font-size: 14px !important;
                border-bottom: 1px solid #f1f5f9 !important;
            }
            
            table.dataTable thead th, table.table thead th {
                background: #f8fafc !important; 
                color: #475569 !important; 
                font-weight: 800 !important;
                border-bottom: 2px solid #e2e8f0 !important; 
                border-top: none !important;
                text-transform: uppercase !important;
                font-size: 13px !important;
            }

            table.dataTable tbody tr:hover td, table.table tbody tr:hover td {
                background-color: #f1f5f9 !important;
            }

            .dataTables_filter input:focus { 
                background: #ffffff !important; 
                border-color: #3b82f6 !important; 
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important; 
            }
            
            /* ล็อกการพังของปุ่มหน้าถัดไป */
            .dataTables_paginate .paginate_button { padding: 0 !important; margin: 0 !important; border: none !important; background: transparent !important; }
            
            /* ลบปุ่มบวกเขียวๆ ของ DataTables Responsive เดิมทิ้งไปให้หมด */
            table.dataTable.dtr-inline.collapsed>tbody>tr>td.dtr-control:before, 
            table.dataTable.dtr-inline.collapsed>tbody>tr>th.dtr-control:before {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // 🛠️ 4. เครื่องมืออเนกประสงค์ให้ไฟล์ลูกเรียกใช้
    // ==========================================
    applyTableStandard(tableId, customOptions = {}) {
        if (typeof $ === 'undefined' || !$('#' + tableId).length) return null;
        return $('#' + tableId).DataTable(customOptions); 
    }

    destroyTable(tableId) {
        if (typeof $ !== 'undefined' && $.fn.DataTable.isDataTable('#' + tableId)) {
            $('#' + tableId).DataTable().clear().destroy();
            $('#' + tableId).empty();
        }
    }
    
    renderBadge(text, type = 'primary') {
        if (!text) return '';
        const colors = { success: 'bg-success text-white', warning: 'bg-warning text-dark', danger: 'bg-danger text-white', info: 'bg-info text-white', primary: 'bg-primary text-white', secondary: 'bg-secondary text-white' };
        const c = colors[type] || colors['primary'];
        return `<span class="badge rounded-pill ${c} px-2 py-1 shadow-sm" style="font-weight: 500; font-size: 11px;">${text}</span>`;
    }
    
    renderTruncate(text, maxLength = 30) {
        if (!text) return '-';
        if (text.length <= maxLength) return text;
        return `<span title="${text}" style="cursor: help; border-bottom: 1px dotted #cbd5e1;">${text.substring(0, maxLength)}...</span>`;
    }
    
    renderCurrency(amount) {
        const num = parseFloat(amount);
        if (isNaN(num)) return '0.00 ฿';
        return `<span class="${num < 0 ? 'text-danger' : 'text-dark'} fw-bold">${num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿</span>`;
    }
}

// 🌐 Expose Global Singleton
const UIOrchestrator = new UIOrchestratorService();
window.UIOrchestrator = UIOrchestrator;