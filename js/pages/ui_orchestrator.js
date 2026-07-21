// js/pages/ui_orchestrator.js
// 👑 TRUE GOD-MODE UI Orchestrator: Omniscient Engine V4.5 (Zero-Shift Tab Update)
// ควบคุมทุกอณูของ UI: ป้องกันแท็บยืดหด, คุมตาราง, ปุ่ม, ช่องกรอก, และแอนิเมชันระดับ Enterprise

class UIOrchestratorService {
    constructor() {
        this.resizeObserver = null;
        this.mutationObserver = null;
        this.init();
    }

    init() {
        try {
            this._injectUltimateCSSDictator(); // 🚀 อัปเกรด V4.5: คุม CSS ทั้งจักรวาล (Zero-Shift)
            this._setupGlobalMicroInteractions(); 
            this._hijackDataTables(); 
            this._setupAdvancedResizeEngine(); 
            this._setupGlobalZIndexHierarchy(); 
            this._enforceTabletDesktopLayout(); 
            
            console.log("%c👑 [UI Orchestrator] OMNISCIENT ENGINE V4.5 (Zero-Shift) Activated.", "color: #eab308; font-weight: bold; font-size: 14px; text-shadow: 0 0 5px rgba(234,179,8,0.5);");
        } catch (error) {
            console.error("🚨 [UI Orchestrator] Initialization Failed:", error);
        }
    }

    // ==========================================
    // 🎨 1. THE DICTATOR CSS (ล้างบางและสร้างมาตรฐานใหม่ให้ทุก Element)
    // ==========================================
    _injectUltimateCSSDictator() {
        if (document.getElementById('orchestrator-ultimate-styles')) return;
        const style = document.createElement('style');
        style.id = 'orchestrator-ultimate-styles';
        style.innerHTML = `
            /* 🖋️ 1. Typography Perfection (ลบเหลี่ยมตัวหนังสือให้คมกริบ) */
            body, p, h1, h2, h3, h4, h5, h6, span, div, a, button, input, select, textarea {
                -webkit-font-smoothing: antialiased !important;
                -moz-osx-font-smoothing: grayscale !important;
                text-rendering: optimizeLegibility !important;
            }

            /* 📜 2. Mac-Style Global Scrollbars (แถบเลื่อนแบบพรีเมียม) */
            ::-webkit-scrollbar { width: 8px !important; height: 8px !important; }
            ::-webkit-scrollbar-track { background: transparent !important; }
            ::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4) !important; border-radius: 10px !important; }
            ::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.7) !important; }

            /* 🔘 3. Button Micro-Interactions (ปุ่มลอยตัวและยุบตัว) */
            .btn {
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
                letter-spacing: 0.3px;
                position: relative;
                overflow: hidden;
            }
            .btn:not(:disabled):hover {
                transform: translateY(-1.5px) !important;
                box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1) !important;
            }
            .btn:not(:disabled):active {
                transform: translateY(1px) !important;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1) !important;
            }
            .btn, .nav-link, .nav-item { user-select: none !important; -webkit-user-select: none !important; }

            /* ⌨️ 4. Form & Input Dictator (ช่องกรอกข้อมูลเรืองแสง) */
            .form-control, .form-select, .select2-selection {
                transition: all 0.3s ease !important;
                border-radius: 10px !important;
                border: 1px solid #cbd5e1 !important;
                background-color: #f8fafc !important;
                padding: 0.6rem 1rem !important;
            }
            .form-control:focus, .form-select:focus {
                background-color: #ffffff !important;
                border-color: #3b82f6 !important;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15) !important;
                outline: none !important;
            }

            /* 🪟 5. Glassmorphism Modals (พื้นหลังป๊อปอัปแบบกระจกฝ้า) */
            .modal-backdrop {
                background-color: rgba(15, 23, 42, 0.6) !important;
                backdrop-filter: blur(5px) !important;
                -webkit-backdrop-filter: blur(5px) !important;
            }
            .modal-content {
                border: none !important;
                border-radius: 16px !important;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2) !important;
                overflow: hidden;
            }

            /* 🏷️ 6. Tabs & Navigations (แถบแท็บลื่นไหล) */
            .nav-tabs {
                border-bottom: 2px solid #e2e8f0 !important;
                display: flex !important; flex-wrap: nowrap !important; overflow-x: auto !important; overflow-y: hidden !important;
                scrollbar-width: none; /* Firefox */
            }
            .nav-tabs::-webkit-scrollbar { display: none !important; } /* Chrome/Safari */
            .nav-tabs .nav-link {
                border: none !important;
                color: #64748b !important;
                font-weight: 600 !important;
                padding: 12px 20px !important;
                border-bottom: 3px solid transparent !important;
                transition: all 0.3s ease !important;
                white-space: nowrap !important;
            }
            .nav-tabs .nav-link:hover { color: #3b82f6 !important; background: rgba(59,130,246,0.05) !important; }
            .nav-tabs .nav-link.active {
                color: #2563eb !important;
                border-bottom: 3px solid #2563eb !important;
                background: transparent !important;
            }

            /* 🚨 THE FIX V4.5: Zero-Shift Tab Engine (ป้องกันการ์ดยืดหดเวลาสลับแท็บ) */
            .card .tab-content, .modern-panel .tab-content {
                min-height: 60vh !important; /* ล็อคความสูงขั้นต่ำ ป้องกันหน้าต่างยุบตัว */
                padding-top: 20px !important;
                position: relative;
            }
            .tab-content > .tab-pane {
                display: none !important; /* ปิดการซ่อนแบบเก่าของ Bootstrap */
                opacity: 0;
            }
            .tab-content > .tab-pane.active {
                display: block !important;
                animation: smoothTabReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
            }
            @keyframes smoothTabReveal {
                0% { opacity: 0; transform: translateY(15px); }
                100% { opacity: 1; transform: translateY(0); }
            }

            /* 📊 7. Ultimate DataTables (หัวตารางติดหนึบ) */
            .dataTables_wrapper { width: 100% !important; overflow-x: auto !important; padding-bottom: 8px !important; }
            table.dataTable { border-collapse: separate !important; border-spacing: 0 !important; width: 100% !important; min-width: 900px !important; }
            table.dataTable thead th {
                position: sticky !important; top: 0 !important; z-index: 10 !important;
                background: #f1f5f9 !important; color: #334155 !important;
                font-weight: 700 !important; text-transform: uppercase !important; font-size: 13px !important; letter-spacing: 0.5px !important;
                padding: 16px !important; border-bottom: 2px solid #cbd5e1 !important; border-top: none !important;
            }
            table.dataTable tbody td { padding: 14px 16px !important; vertical-align: middle !important; border-bottom: 1px solid #e2e8f0 !important; font-size: 14px !important; transition: background 0.2s ease !important; }
            table.dataTable tbody tr:hover td { background-color: #f8fafc !important; }
            
            /* DataTables Pagination & Search */
            .dataTables_filter input { width: 250px !important; max-width: 100% !important; border-radius: 50px !important; padding: 6px 16px !important; }
            .page-item .page-link { border-radius: 8px !important; margin: 0 3px !important; border: none !important; background: #f8fafc !important; color: #475569 !important; font-weight: 600 !important; transition: all 0.2s !important; }
            .page-item.active .page-link { background: #3b82f6 !important; color: white !important; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3) !important; transform: scale(1.05) !important; }
            .page-item .page-link:hover:not(.active) { background: #e2e8f0 !important; }

            /* 📱 8. Card Layout */
            .card, .modern-panel {
                border-radius: 16px !important;
                border: 1px solid rgba(255,255,255,0.1) !important;
                box-shadow: 0 4px 20px rgba(0,0,0,0.03) !important;
                transition: transform 0.3s ease, box-shadow 0.3s ease !important;
                width: 100% !important; max-width: 100% !important; box-sizing: border-box !important;
            }
            
            /* 🚫 9. Anti-Double Click State */
            .is-processing {
                pointer-events: none !important;
                opacity: 0.7 !important;
                position: relative !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // ⚔️ 2. Global Micro-Interactions (คุมพฤติกรรม JavaScript)
    // ==========================================
    _setupGlobalMicroInteractions() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn, button, .anti-double-click');
            if (!btn) return;

            if (!btn.classList.contains('allow-multiple') && !btn.classList.contains('is-processing')) {
                const originalWidth = btn.offsetWidth;
                btn.style.minWidth = `${originalWidth}px`;
                btn.classList.add('is-processing');
                
                setTimeout(() => {
                    if (btn) {
                        btn.classList.remove('is-processing');
                        btn.style.minWidth = '';
                    }
                }, 1000);
            }
        }, true);
    }

    // ==========================================
    // 🛡️ 3. โครงสร้าง Z-Index ชั้นสููงสุด (Global Hierarchy)
    // ==========================================
    _setupGlobalZIndexHierarchy() {
        if (document.getElementById('orchestrator-zindex-fix')) return;
        const style = document.createElement('style');
        style.id = 'orchestrator-zindex-fix';
        style.innerHTML = `
            div.swal2-container { z-index: 2147483647 !important; }
            .modal, .dropdown-menu, .select2-container--open { z-index: 1055 !important; }
            .modal-backdrop { z-index: 1050 !important; }
            .main-sidebar, .sidebar, .main-header { z-index: 1030 !important; }
            
            body.swal2-shown [class*="sidebar"], body.swal2-shown [class*="offcanvas"], body.swal2-shown header,
            body.modal-open [class*="sidebar"], body.modal-open header { z-index: 1000 !important; }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // 📱 4. บังคับเลย์เอาต์ตามอุปกรณ์ (Tablet/Desktop vs Mobile)
    // ==========================================
    _enforceTabletDesktopLayout() {
        const fixLayout = () => {
            try {
                if (window.innerWidth >= 992) {
                    document.body.classList.remove('sidebar-collapse', 'sidebar-mini', 'sidebar-collapsed', 'toggle-sidebar');
                    document.body.classList.add('sidebar-expanded', 'sidebar-open');
                    document.querySelectorAll('.sidebar-toggle, #sidebarToggle, .hamburger-menu, [data-bs-toggle="sidebar"], .mobile-toggle').forEach(btn => {
                        btn.style.setProperty('display', 'none', 'important');
                    });
                } else {
                    document.querySelectorAll('.sidebar-toggle, #sidebarToggle, .hamburger-menu, [data-bs-toggle="sidebar"], .mobile-toggle').forEach(btn => {
                        btn.style.removeProperty('display');
                    });
                }
            } catch (e) {}
        };
        fixLayout();
        window.addEventListener('resize', () => requestAnimationFrame(fixLayout));
        window.addEventListener('orientationchange', () => { setTimeout(fixLayout, 200); setTimeout(fixLayout, 600); });
    }

    // ==========================================
    // 🔄 5. ระบบดักจับการย่อขยายขั้นสูง (Advanced Resize Engine)
    // ==========================================
    _setupAdvancedResizeEngine() {
        const adjustTables = () => {
            if (typeof $ !== 'undefined' && $.fn && $.fn.DataTable) {
                try { $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust(); } catch (e) {}
            }
        };

        window.addEventListener('orientationchange', () => { setTimeout(adjustTables, 250); setTimeout(adjustTables, 700); });

        if (typeof ResizeObserver !== 'undefined') {
            const wrapper = document.querySelector('.content-wrapper') || document.body;
            this.resizeObserver = new ResizeObserver(() => {
                clearTimeout(this._obsTimer);
                this._obsTimer = setTimeout(adjustTables, 150);
            });
            this.resizeObserver.observe(wrapper);
        } else {
            window.addEventListener('resize', () => {
                clearTimeout(this._resizeTimer);
                this._resizeTimer = setTimeout(adjustTables, 150); 
            });
        }
    }

    // ==========================================
    // ⚔️ 6. ระบบยึดอำนาจ DataTables (ป้องกัน Error ทะลุ)
    // ==========================================
    _hijackDataTables() {
        let retries = 0;
        const applyHijack = () => {
            if (typeof $ !== 'undefined' && $.fn && $.fn.dataTable && !$.fn.dataTable.__godModeStatus) {
                try {
                    $.extend(true, $.fn.dataTable.defaults, {
                        language: { 
                            url: "//cdn.datatables.net/plug-ins/1.13.6/i18n/th.json",
                            search: "", searchPlaceholder: "🔍 ค้นหาอัจฉริยะ...", lengthMenu: "แสดง _MENU_ แถว",
                            emptyTable: "<div class='py-5 text-muted text-center'><i class='fa-solid fa-folder-open fa-3x mb-3 opacity-25'></i><h5 class='fw-bold mt-2'>ไม่มีข้อมูลในระบบ</h5><p class='small'>กรุณาเพิ่มข้อมูลเพื่อแสดงผลในตารางนี้</p></div>",
                            zeroRecords: "<div class='py-5 text-muted text-center'><i class='fa-solid fa-search fa-3x mb-3 opacity-25'></i><h5 class='fw-bold mt-2'>ไม่พบข้อมูลที่ค้นหา</h5><p class='small'>ลองเปลี่ยนคำค้นหาใหม่อีกครั้ง</p></div>"
                        },
                        destroy: true, autoWidth: false, responsive: false, scrollX: false,
                        dom: '<"d-flex flex-wrap justify-content-between align-items-center mb-4 w-100 gap-3"lf>rt<"d-flex flex-wrap justify-content-between align-items-center mt-4 w-100 gap-3"ip>'
                    });

                    const originalDataTable = $.fn.dataTable;
                    $.fn.dataTable = function(options, ...args) {
                        try {
                            if (options && typeof options === 'object') {
                                options.destroy = true; options.autoWidth = false; options.responsive = false; options.scrollX = false;
                                options.dom = '<"d-flex flex-wrap justify-content-between align-items-center mb-4 w-100 gap-3"lf>rt<"d-flex flex-wrap justify-content-between align-items-center mt-4 w-100 gap-3"ip>';
                            }
                            return originalDataTable.apply(this, [options, ...args]);
                        } catch (e) {
                            console.error("DataTable Init Error:", e);
                            return this; 
                        }
                    };

                    Object.assign($.fn.dataTable, originalDataTable);
                    $.fn.DataTable = $.fn.dataTable;
                    $.fn.dataTable.__godModeStatus = true; 

                } catch (err) { console.error("DataTables Hijack Failed:", err); }
            } else if (retries < 100) {
                retries++;
                setTimeout(applyHijack, 100);
            }
        };
        applyHijack();
    }

    // ==========================================
    // 🛠️ 7. OMNISCIENT RENDER UTILITIES 
    // ==========================================
    applyTableStandard(tableId, customOptions = {}) {
        try {
            if (typeof $ === 'undefined' || !$('#' + tableId).length) return null;
            return $('#' + tableId).DataTable(customOptions); 
        } catch (error) { return null; }
    }

    destroyTable(tableId) {
        try {
            if (typeof $ !== 'undefined' && $.fn.DataTable.isDataTable('#' + tableId)) {
                $('#' + tableId).DataTable().clear().destroy();
                $('#' + tableId).empty();
            }
        } catch (error) {}
    }
    
    renderBadge(text, type = 'primary') {
        if (!text && text !== 0) return '';
        const colors = { 
            success: 'bg-success bg-opacity-10 text-success border border-success border-opacity-25', 
            warning: 'bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25', 
            danger: 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25', 
            info: 'bg-info bg-opacity-10 text-info border border-info border-opacity-25', 
            primary: 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25', 
            secondary: 'bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25' 
        };
        const c = colors[type] || colors['primary'];
        return `<span class="badge rounded-pill ${c} px-3 py-2 shadow-sm" style="font-weight: 700; font-size: 12px; letter-spacing: 0.5px;">${text}</span>`;
    }
    
    renderTruncate(text, maxLength = 30) {
        if (!text && text !== 0) return '-';
        let str = String(text);
        if (str.length <= maxLength) return str;
        return `<span title="${str}" data-bs-toggle="tooltip" style="cursor: help; border-bottom: 1px dashed #cbd5e1; transition: color 0.2s;" onmouseover="this.style.color='#3b82f6'" onmouseout="this.style.color='inherit'">${str.substring(0, maxLength)}...</span>`;
    }
    
    renderCurrency(amount) {
        const num = parseFloat(amount);
        if (isNaN(num)) return '<span class="text-muted fw-bold">0.00 ฿</span>';
        return `<span class="${num < 0 ? 'text-danger' : 'text-dark'} fw-bold" style="font-variant-numeric: tabular-nums;">${num.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <small class="text-muted ms-1">฿</small></span>`;
    }

    renderTableSkeleton(columns = 5, rows = 3) {
        let html = '';
        for(let i=0; i<rows; i++) {
            html += '<tr>';
            for(let j=0; j<columns; j++) {
                html += `<td><div style="height: 14px; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; border-radius: 4px; width: ${Math.floor(Math.random() * 40 + 40)}%;"></div></td>`;
            }
            html += '</tr>';
        }
        if(!document.getElementById('skeleton-keyframes')) {
            const style = document.createElement('style');
            style.id = 'skeleton-keyframes';
            style.innerHTML = `@keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
            document.head.appendChild(style);
        }
        return html;
    }
}

// 🌐 Expose Global Singleton
if (!window.UIOrchestrator) {
    window.UIOrchestrator = new UIOrchestratorService();
}