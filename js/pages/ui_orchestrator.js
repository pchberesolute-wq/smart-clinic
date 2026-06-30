// js/ui_orchestrator.js
// 🚀 Ultimate UI Orchestrator: Anti-Freeze Engine, Pure CSS Render & Memory Safe

class UIOrchestratorService {
    constructor() {
        this.isMobile = window.innerWidth <= 1024;
        this.init();
    }

    init() {
        this._injectGlobalStyles();
        this._overrideDataTablesDefaults();
        this._initSmartResizeEngine();
        console.log("✨ [UI Orchestrator] Anti-Freeze Engine Activated");
    }

    // ==========================================
    // 1. ⚙️ Global DataTables Overrides (Anti-Infinite Loop)
    // ==========================================
    _overrideDataTablesDefaults() {
        let retries = 0; // 🚨 เซฟตี้วาล์ว: ป้องกันลูปอนันต์
        const applyDefaults = () => {
            if (typeof $ !== 'undefined' && $.fn && $.fn.dataTable) {
                $.extend(true, $.fn.dataTable.defaults, {
                    destroy: true,
                    pageLength: this.isMobile ? 5 : 10,
                    lengthMenu: [[5, 10, 25, 50, -1], [5, 10, 25, 50, "ทั้งหมด"]],
                    ordering: true,
                    autoWidth: false,
                    
                    // 🚨 THE FIX: เปลี่ยนมาใช้ Responsive แท้ ปิด scrollX เพื่อหยุดปัญหา Layout Thrashing (คอมค้าง)
                    responsive: true, 

                    language: { 
                        url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/th.json",
                        search: "",
                        searchPlaceholder: "🔍 พิมพ์ค้นหาข้อมูล...",
                        lengthMenu: "แสดง _MENU_",
                        emptyTable: "<div class='py-4 text-muted' style='font-family:Prompt;'><i class='fa-solid fa-folder-open fa-3x mb-3 opacity-25'></i><br>ไม่มีข้อมูลในระบบ</div>",
                        zeroRecords: "<div class='py-4 text-muted' style='font-family:Prompt;'><i class='fa-solid fa-search fa-3x mb-3 opacity-25'></i><br>ไม่พบข้อมูลที่ค้นหา</div>"
                    },
                    dom: '<"d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3 w-100"lf>rt<"d-flex flex-wrap justify-content-between align-items-center mt-3 gap-3 w-100"ip>',
                    drawCallback: function() {
                        $('.dataTables_paginate > .pagination').addClass('pagination-sm mb-0 shadow-sm');
                    }
                });
            } else if (retries < 100) { 
                // 🚨 THE FIX: ถ้าโหลดไม่ขึ้น ให้ลองแค่ 100 ครั้ง (ประมาณ 5 วินาที) แล้วหยุด เพื่อไม่ให้คอมค้าง
                retries++;
                setTimeout(applyDefaults, 50); 
            } else {
                console.warn("⚠️ DataTables ไม่พร้อมทำงาน หยุดการแทรกแซงเพื่อความปลอดภัย");
            }
        };
        applyDefaults();
    }

    // ==========================================
    // 2. 🧠 Smart Auto-Resize Engine (Low CPU Usage)
    // ==========================================
    _initSmartResizeEngine() {
        let resizeTimer;
        // 🚨 THE FIX: ใส่ passive: true คืนความลื่นไหลให้การ Scroll
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            // 🚨 THE FIX: ขยายเวลา Debounce เป็น 500ms ลดภาระ CPU ตอนจับหน้าต่างยืดหด
            resizeTimer = setTimeout(() => {
                const newIsMobile = window.innerWidth <= 1024;
                if (this.isMobile !== newIsMobile) {
                    this.isMobile = newIsMobile;
                    if (typeof $ !== 'undefined' && $.fn.dataTable) {
                        const tables = $.fn.dataTable.tables(true);
                        if (tables.length > 0) {
                            // สั่งแค่ปรับบรรทัด (ไม่สั่ง adjust() ความกว้างแล้ว ปล่อยให้ CSS จัดการเอง)
                            $(tables).DataTable().page.len(this.isMobile ? 5 : 10).draw(false);
                        }
                    }
                }
            }, 500); 
        }, { passive: true }); 
    }

    // ==========================================
    // 3. 💉 Pure CSS Injection (GPU Rendered)
    // ==========================================
    _injectGlobalStyles() {
        if (document.getElementById('orchestrator-magic-styles')) return;
        const style = document.createElement('style');
        style.id = 'orchestrator-magic-styles';
        style.innerHTML = `
            /* 🚨 THE FIX: ปล่อยให้ตารางอิสระ ป้องกันคอมค้างเวลาเรนเดอร์ 🚨 */
            .table-responsive { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 12px; }
            table.dataTable, table.table { width: 100% !important; border-collapse: collapse !important; }
            
            table.dataTable th, table.dataTable td, table.table th, table.table td {
                padding: 12px 16px !important;
                vertical-align: middle !important;
                white-space: nowrap !important;
                font-size: 14px !important;
                border-bottom: 1px solid #f1f5f9 !important;
            }

            table.dataTable thead th, table.table thead th {
                background-color: #f8fafc !important;
                color: #475569 !important;
                font-weight: 800 !important;
                text-transform: uppercase !important;
                font-size: 13px !important;
                letter-spacing: 0.5px !important;
                border-bottom: 2px solid #e2e8f0 !important;
                border-top: none !important;
            }

            table.dataTable tbody tr:hover td, table.table tbody tr:hover td {
                background-color: #f8fafc !important;
                color: #0f172a !important;
            }

            /* UI Components */
            .dataTables_filter input { border-radius: 50px !important; border: 1px solid #cbd5e1 !important; padding: 6px 18px !important; font-family: 'Prompt', sans-serif !important; font-size: 14px !important; background: #f8fafc !important; transition: all 0.3s ease !important; width: 220px !important; outline: none !important; }
            .dataTables_filter input:focus { background: #ffffff !important; border-color: #3b82f6 !important; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important; }
            .dataTables_length select { border-radius: 12px !important; border: 1px solid #cbd5e1 !important; padding: 4px 30px 4px 14px !important; font-family: 'Prompt', sans-serif !important; font-size: 14px !important; background-color: #f8fafc !important; cursor: pointer; outline: none; }
            .dataTables_info { font-family: 'Prompt', sans-serif !important; color: #64748b !important; font-size: 13.5px !important; font-weight: 600 !important; }

            /* Pagination */
            .dataTables_paginate .paginate_button { padding: 0 !important; margin: 0 !important; border: none !important; background: transparent !important; }
            .pagination { gap: 4px; border-radius: 12px; }
            .page-item .page-link { border-radius: 8px !important; border: 1px solid transparent !important; color: #475569 !important; font-weight: 700 !important; font-family: 'Prompt', sans-serif !important; padding: 4px 12px !important; transition: all 0.2s ease !important; background: #f8fafc; }
            .page-item.active .page-link { background: #3b82f6 !important; color: white !important; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3) !important; border-color: #2563eb !important; }
            .page-item:not(.active) .page-link:hover { background: #e2e8f0 !important; color: #0f172a !important; }

            /* 📱 MOBILE OPTIMIZATION */
            @media (max-width: 1024px) {
                table.dataTable th, table.dataTable td, table.table th, table.table td {
                    padding: 10px 12px !important;
                    font-size: 13.5px !important;
                }
                .dataTables_filter, .dataTables_length { width: 100% !important; text-align: left !important; }
                .dataTables_filter input { width: 100% !important; }
                .dataTables_paginate { width: 100% !important; display: flex !important; justify-content: center !important; margin-top: 15px !important; }
                
                /* ปุ่มกดกางเมนูบนมือถือ (Responsive Plus) */
                table.dataTable.dtr-inline.collapsed>tbody>tr>td.dtr-control:before, 
                table.dataTable.dtr-inline.collapsed>tbody>tr>th.dtr-control:before {
                    background-color: #3b82f6 !important;
                    box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3) !important;
                    border: 2px solid #fff !important;
                    line-height: 14px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// 🌐 Expose Global Singleton
const UIOrchestrator = new UIOrchestratorService();
window.UIOrchestrator = UIOrchestrator;