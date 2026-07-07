// js/pages/ui_orchestrator.js
// 👑 TRUE GOD-MODE UI Orchestrator: ดักปล้นและยึดอำนาจคำสั่ง DataTables แบบ 100%

class UIOrchestratorService {
    constructor() {
        this.init();
    }

    init() {
        this._injectAbsoluteStyles();
        this._hijackDataTables(); 
        this._setupRotationEngine(); // 🚨 NEW: เปิดใช้งานระบบรองรับการหมุนหน้าจออัตโนมัติ
        console.log("👑 [UI Orchestrator] TRUE GOD-MODE Activated (100% Override)");
    }

    // ==========================================
    // 🔄 1. ระบบดักจับการหมุนหน้าจอ (Orientation Change Engine)
    // ==========================================
    _setupRotationEngine() {
        const adjustLayout = () => {
            // สั่งให้ตาราง DataTables ทุกตัวที่กำลังเปิดอยู่ คำนวณความกว้างใหม่ทันที!
            if (typeof $ !== 'undefined' && $.fn.DataTable) {
                $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
                console.log("🔄 [UI Orchestrator] Screen Rotated -> Tables Re-calculated");
            }
        };

        // 📱 ดักฟังเซนเซอร์เมื่อมีการหมุนเครื่อง (Portrait <-> Landscape)
        window.addEventListener('orientationchange', () => {
            setTimeout(adjustLayout, 200); // หน่วง 0.2s รอให้เบราว์เซอร์วาดจอแนวนอนเสร็จก่อน
            setTimeout(adjustLayout, 500); // ย้ำอีกรอบเพื่อความชัวร์ 100%
        });

        // 💻 ดักฟังเมื่อมีการลากย่อ-ขยายหน้าต่างเบราว์เซอร์บนคอมพิวเตอร์
        window.addEventListener('resize', () => {
            clearTimeout(this._resizeTimer);
            this._resizeTimer = setTimeout(adjustLayout, 150); // Debounce ป้องกันเครื่องกระตุก
        });
    }

    // ==========================================
    // ⚔️ 2. ระบบยึดอำนาจ DataTables (ดักจับทุกการเรียกใช้ในทุกไฟล์)
    // ==========================================
    _hijackDataTables() {
        let retries = 0;
        const applyHijack = () => {
            if (typeof $ !== 'undefined' && $.fn && $.fn.dataTable && !$.fn.dataTable.__godModeStatus) {
                
                // 1. ตั้งค่าภาษาเป็นภาษาไทยให้เป็นพื้นฐาน
                $.extend(true, $.fn.dataTable.defaults, {
                    language: { 
                        url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/th.json",
                        search: "", searchPlaceholder: "🔍 พิมพ์ค้นหา...", lengthMenu: "แสดง _MENU_ รายการ",
                        emptyTable: "<div class='py-4 text-muted text-center' style='font-family:Prompt;'><i class='fa-solid fa-folder-open fa-3x mb-3 opacity-25'></i><br>ไม่มีข้อมูลในระบบ</div>",
                        zeroRecords: "<div class='py-4 text-muted text-center' style='font-family:Prompt;'><i class='fa-solid fa-search fa-3x mb-3 opacity-25'></i><br>ไม่พบข้อมูลที่ค้นหา</div>"
                    }
                });

                // 2. The Hijacker: ยึดฟังก์ชันหลักของ DataTables!
                const originalDataTable = $.fn.dataTable;
                
                $.fn.dataTable = function(options, ...args) {
                    if (options && typeof options === 'object') {
                        options.destroy = true;
                        options.autoWidth = false;
                        options.responsive = false; // 🚫 สั่งปิด Responsive เดิม (การพับตาราง) แบบเด็ดขาด
                        options.scrollX = false; // 🚫 ปิด JS scrollX เพราะเราจะใช้ CSS scrollX แทน (กันกระตุก)
                        
                        // อัปเกรด DOM Layout ให้รองรับ Flex-Wrap (หักบรรทัดบนจอมือถือ)
                        options.dom = '<"d-flex flex-wrap justify-content-between align-items-center mb-3 w-100 gap-2"lf>rt<"d-flex flex-wrap justify-content-between align-items-center mt-3 w-100 gap-2"ip>';
                    }
                    return originalDataTable.apply(this, [options, ...args]);
                };

                Object.assign($.fn.dataTable, originalDataTable);
                $.fn.DataTable = $.fn.dataTable;
                $.fn.dataTable.__godModeStatus = true; 

                // 3. สายลับตามแต่งหน้าตาปุ่ม
                $(document).on('draw.dt', function(e, settings) {
                    $('.dataTables_filter input').addClass('form-control shadow-sm').css({
                        'border-radius': '50px', 'padding': '6px 16px', 'background': '#f8fafc', 'width': '100%', 'max-width': '250px', 'outline': 'none'
                    });
                    $('.dataTables_length select').addClass('form-select shadow-sm').css({'border-radius': '12px'});
                    $('.dataTables_paginate > .pagination').addClass('pagination-sm mb-0 shadow-sm flex-wrap');
                });

            } else if (retries < 100) {
                retries++;
                setTimeout(applyHijack, 50);
            }
        };
        applyHijack();
    }

    // ==========================================
    // 💉 3. CSS Absolute Hard-Lock (ล็อคขั้นเด็ดขาด รองรับมือถือ 100%)
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
            
            .dataTables_paginate .paginate_button { padding: 0 !important; margin: 0 !important; border: none !important; background: transparent !important; }
            .page-item .page-link { border-radius: 8px !important; color: #475569 !important; font-weight: 700 !important; font-family: 'Prompt' !important; padding: 6px 12px !important; background: #f8fafc; margin: 0 2px; border: none; }
            .page-item.active .page-link { background: #3b82f6 !important; color: white !important; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3) !important; border-color: #2563eb !important; }
            
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