// js/pages/ui_orchestrator.js
// 👑 TRUE GOD-MODE UI Orchestrator: Omniscient Engine V5.0 (Zero-Shift & CSP-Safe)
// ควบคุมทุกอณูของ UI: ป้องกันแท็บยืดหด, คุมตาราง, ปุ่ม WeakMap-Tracked, และ Zero-Reflow Resize

class UIOrchestratorService {
    // 🛡️ ใช้ # เพื่อบังคับเป็น Private Properties (Absolute Encapsulation)
    #resizeObserver = null;
    #processingButtons = new WeakMap(); // 🚀 ใช้ WeakMap จัดการ Memory ของปุ่มแบบ O(1)

    constructor() {
        this.init();
    }

    init() {
        try {
            this.#injectUltimateCSSDictator(); 
            this.#setupGlobalMicroInteractions(); 
            this.#hijackDataTables(); 
            this.#setupAdvancedResizeEngine(); 
            this.#setupGlobalZIndexHierarchy(); 
            this.#enforceTabletDesktopLayout(); // 🚀 อัปเกรดเป็น matchMedia
            
            console.log("%c👑 [UI Orchestrator] OMNISCIENT ENGINE V5.0 (Zero-Shift) Activated.", "color: #eab308; font-weight: bold; font-size: 14px; text-shadow: 0 0 5px rgba(234,179,8,0.5);");
        } catch (error) {
            console.error("🚨 [UI Orchestrator] Initialization Failed:", error);
        }
    }

    // ==========================================
    // 🎨 1. THE DICTATOR CSS (CSP-Safe & Native Dark Mode)
    // ==========================================
    #injectUltimateCSSDictator() {
        if (document.getElementById('orchestrator-ultimate-styles')) return;
        const style = document.createElement('style');
        style.id = 'orchestrator-ultimate-styles';
        style.innerHTML = `
            /* 🖋️ 1. Typography Perfection */
            body, p, h1, h2, h3, h4, h5, h6, span, div, a, button, input, select, textarea {
                -webkit-font-smoothing: antialiased !important;
                -moz-osx-font-smoothing: grayscale !important;
                text-rendering: optimizeLegibility !important;
            }

            /* 📜 2. Mac-Style Global Scrollbars */
            ::-webkit-scrollbar { width: 8px !important; height: 8px !important; }
            ::-webkit-scrollbar-track { background: transparent !important; }
            ::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.4) !important; border-radius: 10px !important; }
            ::-webkit-scrollbar-thumb:hover { background: rgba(100, 116, 139, 0.7) !important; }
            html[data-bs-theme="dark"] ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2) !important; }

            /* 🔘 3. Button Micro-Interactions */
            .btn {
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
                letter-spacing: 0.3px; position: relative; overflow: hidden;
            }
            .btn:not(:disabled):hover {
                transform: translateY(-1.5px) !important; box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1) !important;
            }
            .btn:not(:disabled):active {
                transform: translateY(1px) !important; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1) !important;
            }
            .btn, .nav-link, .nav-item { user-select: none !important; -webkit-user-select: none !important; }

            /* ⌨️ 4. Form & Input Dictator */
            .form-control, .form-select, .select2-selection {
                transition: all 0.3s ease !important; border-radius: 10px !important;
                border: 1px solid var(--border-color, #cbd5e1) !important;
                background-color: var(--bg-surface, #f8fafc) !important;
                color: var(--text-dark, #0f172a) !important;
                padding: 0.6rem 1rem !important;
            }
            .form-control:focus, .form-select:focus {
                background-color: var(--bg-body, #ffffff) !important; border-color: #3b82f6 !important;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15) !important; outline: none !important;
            }

            /* 🪟 5. Glassmorphism Modals */
            .modal-backdrop { background-color: rgba(15, 23, 42, 0.6) !important; backdrop-filter: blur(5px) !important; -webkit-backdrop-filter: blur(5px) !important; }
            .modal-content { border: none !important; border-radius: 16px !important; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2) !important; overflow: hidden; background: var(--bg-surface, #fff); }

            /* 🏷️ 6. Tabs & Navigations */
            .nav-tabs { border-bottom: 2px solid var(--border-color, #e2e8f0) !important; display: flex !important; flex-wrap: nowrap !important; overflow-x: auto !important; overflow-y: hidden !important; scrollbar-width: none; }
            .nav-tabs::-webkit-scrollbar { display: none !important; }
            .nav-tabs .nav-link { border: none !important; color: var(--text-muted, #64748b) !important; font-weight: 600 !important; padding: 12px 20px !important; border-bottom: 3px solid transparent !important; transition: all 0.3s ease !important; white-space: nowrap !important; }
            .nav-tabs .nav-link:hover { color: #3b82f6 !important; background: rgba(59,130,246,0.05) !important; }
            .nav-tabs .nav-link.active { color: #2563eb !important; border-bottom: 3px solid #2563eb !important; background: transparent !important; }

            /* 🚨 THE FIX V5.0: Zero-Shift Tab Engine */
            .card .tab-content, .modern-panel .tab-content { min-height: 60vh !important; padding-top: 20px !important; position: relative; }
            .tab-content > .tab-pane { display: none !important; opacity: 0; }
            .tab-content > .tab-pane.active { display: block !important; animation: smoothTabReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards !important; }
            @keyframes smoothTabReveal { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }

            /* 📊 7. Ultimate DataTables */
            .dataTables_wrapper { width: 100% !important; overflow-x: auto !important; padding-bottom: 8px !important; }
            table.dataTable { border-collapse: separate !important; border-spacing: 0 !important; width: 100% !important; min-width: 900px !important; }
            table.dataTable thead th { position: sticky !important; top: 0 !important; z-index: 10 !important; background: var(--bg-body, #f1f5f9) !important; color: var(--text-muted, #334155) !important; font-weight: 700 !important; text-transform: uppercase !important; font-size: 13px !important; letter-spacing: 0.5px !important; padding: 16px !important; border-bottom: 2px solid var(--border-color, #cbd5e1) !important; border-top: none !important; }
            table.dataTable tbody td { padding: 14px 16px !important; vertical-align: middle !important; border-bottom: 1px solid var(--border-color, #e2e8f0) !important; font-size: 14px !important; color: var(--text-dark); background: var(--bg-surface, transparent) !important; transition: background 0.2s ease !important; }
            table.dataTable tbody tr:hover td { background-color: var(--bg-body, #f8fafc) !important; }
            .dataTables_filter input { width: 250px !important; max-width: 100% !important; border-radius: 50px !important; padding: 6px 16px !important; }
            .page-item .page-link { border-radius: 8px !important; margin: 0 3px !important; border: none !important; background: var(--bg-surface, #f8fafc) !important; color: var(--text-muted, #475569) !important; font-weight: 600 !important; transition: all 0.2s !important; }
            .page-item.active .page-link { background: #3b82f6 !important; color: white !important; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3) !important; transform: scale(1.05) !important; }
            
            /* 📱 8. Card Layout & Utilities */
            .card, .modern-panel { border-radius: 16px !important; border: 1px solid rgba(255,255,255,0.1) !important; box-shadow: 0 4px 20px rgba(0,0,0,0.03) !important; transition: transform 0.3s ease, box-shadow 0.3s ease !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; }
            .is-processing { pointer-events: none !important; opacity: 0.7 !important; position: relative !important; }
            
            /* 🚨 THE FIX: CSP-Safe Hover Class */
            .orch-truncate-hover { cursor: help; border-bottom: 1px dashed var(--text-muted, #cbd5e1); transition: color 0.2s; }
            .orch-truncate-hover:hover { color: #3b82f6 !important; border-bottom-color: #3b82f6; }
            
            /* 🚨 THE FIX: Global Skeleton Keyframes */
            @keyframes orch-skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
            .orch-skeleton-bar { height: 14px; background: linear-gradient(90deg, var(--bg-surface,#f1f5f9) 25%, var(--border-color,#e2e8f0) 50%, var(--bg-surface,#f1f5f9) 75%); background-size: 200% 100%; animation: orch-skeleton-loading 1.5s infinite; border-radius: 4px; }
            html[data-bs-theme="dark"] .orch-skeleton-bar { background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%); background-size: 200% 100%; }
        `;
        document.head.appendChild(style);
    }

    // ==========================================
    // ⚔️ 2. Global Micro-Interactions (WeakMap Engine)
    // ==========================================
    #setupGlobalMicroInteractions() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn, button, .anti-double-click');
            if (!btn) return;

            if (!btn.classList.contains('allow-multiple') && !btn.classList.contains('is-processing')) {
                // ล็อคความกว้างไม่ให้ปุ่มหดตัวเวลาโหลด
                const originalWidth = btn.offsetWidth;
                btn.style.minWidth = `${originalWidth}px`;
                btn.classList.add('is-processing');
                
                // 🚨 THE FIX: ล้าง Timeout เก่า (ถ้ามี) ป้องกันบั๊กปลดล็อคก่อนกำหนด
                if (this.#processingButtons.has(btn)) {
                    clearTimeout(this.#processingButtons.get(btn));
                }
                
                const timerId = setTimeout(() => {
                    if (document.body.contains(btn)) { // ตรวจว่าปุ่มยังอยู่ในจอ
                        btn.classList.remove('is-processing');
                        btn.style.minWidth = '';
                    }
                    this.#processingButtons.delete(btn); // คืน Memory ให้ Garbage Collector
                }, 1000);
                
                this.#processingButtons.set(btn, timerId);
            }
        }, true);
    }

    // ==========================================
    // 🛡️ 3. โครงสร้าง Z-Index ชั้นสููงสุด (Global Hierarchy)
    // ==========================================
    #setupGlobalZIndexHierarchy() {
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
    // 📱 4. บังคับเลย์เอาต์ตามอุปกรณ์ (Native MatchMedia API)
    // ==========================================
    #enforceTabletDesktopLayout() {
        // 🚨 THE FIX: แทนที่ window.resize ด้วย matchMedia (O(1) Event Firing) ไม่กิน CPU เลย
        const mq = window.matchMedia('(min-width: 992px)');
        
        const applyLayout = (e) => {
            const isDesktop = e.matches;
            if (isDesktop) {
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
        };

        // ทำงานครั้งแรก
        applyLayout(mq);
        
        // ผูก Listener เมื่อข้ามเส้น Breakpoint เท่านั้น
        try {
            mq.addEventListener('change', applyLayout);
        } catch (e1) {
            mq.addListener(applyLayout); // Fallback Safari เก่า
        }
    }

    // ==========================================
    // 🔄 5. ระบบดักจับการย่อขยายขั้นสูง (Advanced Resize Engine)
    // ==========================================
    #setupAdvancedResizeEngine() {
        const adjustTables = () => {
            if (typeof $ !== 'undefined' && $.fn && $.fn.DataTable) {
                try { $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust(); } catch (e) {}
            }
        };

        window.addEventListener('orientationchange', () => { setTimeout(adjustTables, 250); setTimeout(adjustTables, 700); });

        if (typeof ResizeObserver !== 'undefined') {
            const wrapper = document.querySelector('.content-wrapper') || document.body;
            this.#resizeObserver = new ResizeObserver(() => {
                // Debounce การขยับตาราง เพื่อความสมูท
                if (this._obsTimer) cancelAnimationFrame(this._obsTimer);
                this._obsTimer = requestAnimationFrame(adjustTables);
            });
            this.#resizeObserver.observe(wrapper);
        }
    }

    // ==========================================
    // ⚔️ 6. ระบบยึดอำนาจ DataTables (Smart Backoff Polling)
    // ==========================================
    #hijackDataTables() {
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
            } else if (retries < 50) { // 🚨 THE FIX: Exponential Backoff Polling
                retries++;
                setTimeout(applyHijack, 50 * retries); // ยืดเวลาออกไปเรื่อยๆ ลดการกิน CPU
            }
        };
        applyHijack();
    }

    // ==========================================
    // 🛠️ 7. OMNISCIENT RENDER UTILITIES (CSP-SAFE)
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
        // 🚨 THE FIX: ลบ onmouseover ออก ใช้ CSS Class .orch-truncate-hover แทน ปลอดภัยจาก XSS
        return `<span title="${str}" data-bs-toggle="tooltip" class="orch-truncate-hover">${str.substring(0, maxLength)}...</span>`;
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
                // 🚨 THE FIX: ใช้ CSS Class แทนการ Hardcode Style แบบเก่า สะอาดและเร็วกว่า
                html += `<td><div class="orch-skeleton-bar" style="width: ${Math.floor(Math.random() * 40 + 40)}%;"></div></td>`;
            }
            html += '</tr>';
        }
        return html;
    }
}

// 🌐 Expose Global Singleton
if (!window.UIOrchestrator) {
    window.UIOrchestrator = new UIOrchestratorService();
}