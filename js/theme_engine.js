// js/theme_engine.js
// 👑 Theme Engine V6.0: Quantum CSS-Native Styling, Zero-Reflow & No-Observer GPU Acceleration

class ThemeEngineService {
    constructor() {
        this.themes = {
            'modern': { 
                name: 'Modern Blue', primary: '#2563eb', primary_dark: '#1e40af', primary_glow: 'rgba(37, 99, 235, 0.25)',
                bg: '#f1f5f9', surface: '#ffffff', text: '#0f172a', text_muted: '#64748b', border: '#e2e8f0', type: 'light'
            },
            'glass': { 
                name: 'Aurora Glass', primary: '#8b5cf6', primary_dark: '#6d28d9', primary_glow: 'rgba(139, 92, 246, 0.35)',
                bg: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', surface: 'rgba(255, 255, 255, 0.55)', 
                text: '#1e1b4b', text_muted: '#4338ca', border: 'rgba(255, 255, 255, 0.4)', type: 'glass'
            },
            'minimal': { 
                name: 'Midnight Pro', primary: '#10b981', primary_dark: '#047857', primary_glow: 'rgba(16, 185, 129, 0.25)',
                bg: '#0f172a', surface: '#1e293b', text: '#f8fafc', text_muted: '#94a3b8', border: '#334155', type: 'dark'
            }
        };

        this._isInit = true;
        this._rippleEnabled = false;
        
        console.log("%c👑 [Theme Engine] V6.0 Zero-Reflow CSS Engine Activated.", "color: #8b5cf6; font-weight: bold; font-size: 14px;");
    }

    init() {
        // 1. ฝัง Base CSS แค่ครั้งเดียว (Idempotent Injection)
        this.#injectImmutableCSS();
        this.#enableRippleEngine();

        // 2. ดึงค่าธีมล่าสุดมาใช้
        const savedTheme = localStorage.getItem('dialysis_active_theme') || 'modern';
        this.applyTheme(savedTheme);

        setTimeout(() => { this._isInit = false; }, 1000);
    }

    /**
     * 🚀 O(1) Theme Switching (ใช้ CSS Variables แทนการพ่น String HTML ใหม่)
     */
    applyTheme(themeKey) {
        const t = this.themes[themeKey] || this.themes['modern'];
        localStorage.setItem('dialysis_active_theme', themeKey);
        
        const root = document.documentElement;
        const body = document.body;

        // สลับ State ของระบบ
        root.setAttribute('data-bs-theme', t.type);
        body.setAttribute('data-theme', t.type);
        
        body.className = body.className.replace(/theme-\w+/g, '').trim();
        body.classList.add(`theme-${t.type}`);

        // 🚀 THE FIX: ปรับค่า CSS Variable ตรงๆ ไม่มีการทำลาย <style> และสร้างใหม่
        root.style.setProperty('--primary', t.primary);
        root.style.setProperty('--primary-dark', t.primary_dark);
        root.style.setProperty('--primary-glow', t.primary_glow);
        root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${t.primary} 0%, ${t.primary_dark} 100%)`);
        root.style.setProperty('--bg-body', t.bg);
        root.style.setProperty('--bg-surface', t.surface);
        root.style.setProperty('--text-dark', t.text);
        root.style.setProperty('--text-muted', t.text_muted);
        root.style.setProperty('--border-color', t.border);

        if (typeof Swal !== 'undefined' && !this._isInit) {
            Swal.fire({
                title: 'เปลี่ยนธีมสำเร็จ!', text: `อัปเดตเป็นสไตล์ "${t.name}" เรียบร้อยแล้ว`,
                icon: 'success', timer: 1500, showConfirmButton: false, customClass: { popup: 'premium-alert' }
            });
        }
    }

    // =========================================================================
    // 🎨 IMMUTABLE CSS CORE (ฝังครั้งเดียวจบ ครอบคลุมทั้งระบบ)
    // =========================================================================
    #injectImmutableCSS() {
        if (document.getElementById('global-theme-immutable')) return;
        
        const styleEl = document.createElement('style');
        styleEl.id = 'global-theme-immutable';
        
        // CSS ที่ครอบคลุมทั้ง Base, Dark Mode และ The Sentinel แบบ CSS-Native
        styleEl.innerHTML = `
            html body, html body .main-content, html body .login-container { 
                background: var(--bg-body) !important; color: var(--text-dark) !important; 
            }
            .btn-premium-primary, .swal2-confirm { 
                background: var(--primary-gradient) !important; color: #ffffff !important; border: none !important; 
            }
            a:not(.btn) { background-color: transparent !important; }

            /* 🪟 Physics & Hover Effects */
            .card, .modern-panel, .info-box, .visit-card {
                transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease !important;
            }
            .card:hover, .modern-panel:hover, .visit-card:hover {
                transform: translateY(-4px) !important; box-shadow: 0 15px 35px -5px rgba(0,0,0,0.15) !important;
            }

            /* ⌨️ Breathing Inputs */
            input.form-control, select.form-select, textarea.form-control, .dataTables_filter input {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }
            input.form-control:focus, select.form-select:focus, textarea.form-control:focus, .dataTables_filter input:focus {
                border-color: var(--primary) !important; box-shadow: 0 0 0 4px var(--primary-glow) !important;
                outline: none !important; transform: translateY(-1px);
            }

            /* 🔘 Interactive Ripple Buttons */
            .btn { position: relative; overflow: hidden; transform: translateZ(0); transition: all 0.3s ease !important; }
            .btn:hover { transform: translateY(-2px) scale(1.02) !important; }
            .btn:active { transform: translateY(1px) scale(0.98) !important; }
            .btn .ripple { position: absolute; border-radius: 50%; transform: scale(0); animation: ripple-effect 0.6s linear; background-color: rgba(255, 255, 255, 0.4); pointer-events: none; }
            @keyframes ripple-effect { to { transform: scale(4); opacity: 0; } }

            /* 📑 Smart Capsule Tabs */
            .nav-tabs { border-bottom: none !important; gap: 8px; padding: 4px; background: rgba(0,0,0,0.03); border-radius: 16px; display: inline-flex !important; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; }
            .nav-tabs::-webkit-scrollbar { display: none !important; }
            .nav-tabs .nav-link { border: none !important; border-radius: 12px !important; font-weight: 700 !important; padding: 10px 24px !important; transition: all 0.3s ease !important; white-space: nowrap; }
            .nav-tabs .nav-link.active { transform: scale(1.05); }

            /* 📊 Sticky Headers Light Mode */
            .table-responsive, .dataTables_wrapper { overflow-x: auto !important; }
            html[data-bs-theme="light"] table.dataTable thead th, html[data-bs-theme="light"] table.table thead th {
                position: sticky !important; top: 0 !important; z-index: 10 !important; background: #f8fafc !important;
            }

            /* =========================================================================
               🌑 THE DARK MODE SENTINEL (CSS-Native Solution)
               ========================================================================= */
            html[data-bs-theme="dark"] {
                --bs-body-bg: #0f172a !important; --bs-body-color: #f8fafc !important;
                --bs-dark: #f8fafc !important; --bs-light: #0f172a !important;
            }

            /* Semantic Buttons Overrides */
            html[data-bs-theme="dark"] body .btn[class*="primary"], html[data-bs-theme="dark"] body .badge[class*="primary"], html[data-bs-theme="dark"] body [class*="bg-primary"] {
                background-color: #1e3a8a !important; color: #93c5fd !important; border-color: #1d4ed8 !important;
            }
            html[data-bs-theme="dark"] body .btn[class*="info"], html[data-bs-theme="dark"] body .badge[class*="info"], html[data-bs-theme="dark"] body [class*="bg-info"] {
                background-color: #0c4a6e !important; color: #7dd3fc !important; border-color: #0284c7 !important;
            }
            html[data-bs-theme="dark"] body .btn[class*="success"], html[data-bs-theme="dark"] body .badge[class*="success"], html[data-bs-theme="dark"] body [class*="bg-success"] {
                background-color: #064e3b !important; color: #6ee7b7 !important; border-color: #059669 !important;
            }
            html[data-bs-theme="dark"] body .btn[class*="warning"], html[data-bs-theme="dark"] body .badge[class*="warning"], html[data-bs-theme="dark"] body [class*="bg-warning"] {
                background-color: #78350f !important; color: #fcd34d !important; border-color: #d97706 !important;
            }
            html[data-bs-theme="dark"] body .btn[class*="danger"], html[data-bs-theme="dark"] body .badge[class*="danger"], html[data-bs-theme="dark"] body [class*="bg-danger"] {
                background-color: #7f1d1d !important; color: #fca5a5 !important; border-color: #dc2626 !important;
            }
            
            html[data-bs-theme="dark"] body .btn[class*="light"], html[data-bs-theme="dark"] body .btn[class*="white"], html[data-bs-theme="dark"] body .btn[class*="secondary"], 
            html[data-bs-theme="dark"] body .btn[class*="outline-dark"], html[data-bs-theme="dark"] body .btn.text-muted, html[data-bs-theme="dark"] body .btn.text-secondary, html[data-bs-theme="dark"] body .btn.text-dark,
            html[data-bs-theme="dark"] body .badge[class*="light"], html[data-bs-theme="dark"] body .badge[class*="secondary"], 
            html[data-bs-theme="dark"] body [class*="bg-white"], html[data-bs-theme="dark"] body [class*="bg-light"], html[data-bs-theme="dark"] body [class*="bg-secondary"] {
                background-color: #334155 !important; color: #f8fafc !important; border: 1px solid #475569 !important;
            }

            html[data-bs-theme="dark"] body .btn { color: #f8fafc !important; }
            html[data-bs-theme="dark"] body .btn:hover { filter: brightness(1.2); color: #ffffff !important; }

            /* Pastel Subtle Backgrounds overrides */
            html[data-bs-theme="dark"] body .bg-info-subtle { background-color: rgba(12, 74, 110, 0.4) !important; border: 1px solid #0284c7 !important; color: #7dd3fc !important; }
            html[data-bs-theme="dark"] body .bg-success-subtle { background-color: rgba(6, 78, 59, 0.4) !important; border: 1px solid #059669 !important; color: #6ee7b7 !important; }
            html[data-bs-theme="dark"] body .bg-primary-subtle { background-color: rgba(30, 58, 138, 0.4) !important; border: 1px solid #1d4ed8 !important; color: #93c5fd !important; }
            html[data-bs-theme="dark"] body .bg-warning-subtle { background-color: rgba(120, 53, 15, 0.4) !important; border: 1px solid #d97706 !important; color: #fcd34d !important; }
            html[data-bs-theme="dark"] body .bg-danger-subtle { background-color: rgba(127, 29, 29, 0.4) !important; border: 1px solid #dc2626 !important; color: #fca5a5 !important; }
            
            html[data-bs-theme="dark"] body .bg-info-subtle *, html[data-bs-theme="dark"] body .bg-success-subtle *, html[data-bs-theme="dark"] body .bg-primary-subtle *, html[data-bs-theme="dark"] body .bg-warning-subtle *, html[data-bs-theme="dark"] body .bg-danger-subtle * {
                color: inherit !important; opacity: 1 !important;
            }

            /* Component Overhaul */
            html[data-bs-theme="dark"] body .modern-panel, html[data-bs-theme="dark"] body .card, html[data-bs-theme="dark"] body .sidebar, html[data-bs-theme="dark"] body .topbar, html[data-bs-theme="dark"] body .compact-panel, html[data-bs-theme="dark"] body .user-card-wrapper,
            html[data-bs-theme="dark"] body .patient-folder, html[data-bs-theme="dark"] body .patient-folder-body, html[data-bs-theme="dark"] body .doc-card, html[data-bs-theme="dark"] body .doc-info, html[data-bs-theme="dark"] body .doc-thumb-card,
            html[data-bs-theme="dark"] body .search-box-modern, html[data-bs-theme="dark"] body .search-box, html[data-bs-theme="dark"] body .time-widget, html[data-bs-theme="dark"] body .sync-widget-topbar,
            html[data-bs-theme="dark"] body .stat-card-premium, html[data-bs-theme="dark"] body .stat-card-analytics, html[data-bs-theme="dark"] body .stat-card-finance, html[data-bs-theme="dark"] body .stat-card-ledger,
            html[data-bs-theme="dark"] body .req-table-wrapper, html[data-bs-theme="dark"] body .date-filter-wrapper, html[data-bs-theme="dark"] body .date-filter-container, html[data-bs-theme="dark"] body .vd-date-picker,
            html[data-bs-theme="dark"] body .custom-options-panel, html[data-bs-theme="dark"] body .smart-menu-container, html[data-bs-theme="dark"] body .login-card, html[data-bs-theme="dark"] body .modal-content,
            html[data-bs-theme="dark"] body .dropdown-menu, html[data-bs-theme="dark"] body .list-group-item, html[data-bs-theme="dark"] body .accordion-item, html[data-bs-theme="dark"] body .card-body, html[data-bs-theme="dark"] body .emr-nav-tabs-container, html[data-bs-theme="dark"] body .visit-card {
                background-color: #1e293b !important; background: #1e293b !important; border: 1px solid #334155 !important; color: #f8fafc !important;
            }

            html[data-bs-theme="dark"] body .sidebar-footer, html[data-bs-theme="dark"] body .input-group-text, html[data-bs-theme="dark"] body .native-date-wrapper, html[data-bs-theme="dark"] body .breakdown-box, html[data-bs-theme="dark"] body .sig-addon,
            html[data-bs-theme="dark"] body .patient-folder-header, html[data-bs-theme="dark"] body .doc-preview-area, html[data-bs-theme="dark"] body .doc-actions, html[data-bs-theme="dark"] body .upload-dropzone,
            html[data-bs-theme="dark"] body .smart-menu-header, html[data-bs-theme="dark"] body .modern-icon-login, html[data-bs-theme="dark"] body .profile-selector-btn, html[data-bs-theme="dark"] body .page-link, html[data-bs-theme="dark"] body .solid-input-group, html[data-bs-theme="dark"] body .emr-scroll-area {
                background-color: #020617 !important; background: #020617 !important; border: 1px solid #334155 !important;
            }

            /* 🚨 THE CSS SENTINEL (แทนที่ MutationObserver ด้วย Attribute Selectors) */
            html[data-bs-theme="dark"] body [style*="background: white"], html[data-bs-theme="dark"] body [style*="background:white"],
            html[data-bs-theme="dark"] body [style*="background: #fff"], html[data-bs-theme="dark"] body [style*="background:#fff"],
            html[data-bs-theme="dark"] body [style*="background-color: white"], html[data-bs-theme="dark"] body [style*="background-color: white"],
            html[data-bs-theme="dark"] body [style*="background-color: #fff"], html[data-bs-theme="dark"] body [style*="background-color:#fff"],
            html[data-bs-theme="dark"] body [style*="background-color: #ffffff"], html[data-bs-theme="dark"] body [style*="background-color:#ffffff"],
            html[data-bs-theme="dark"] body [style*="background: #ffffff"], html[data-bs-theme="dark"] body [style*="background:#ffffff"],
            html[data-bs-theme="dark"] body [style*="background: rgb(255, 255, 255)"], html[data-bs-theme="dark"] body [style*="background-color: rgb(255, 255, 255)"] {
                background-color: #1e293b !important; background: #1e293b !important;
            }

            html[data-bs-theme="dark"] body .text-dark, html[data-bs-theme="dark"] body h1, html[data-bs-theme="dark"] body h2, html[data-bs-theme="dark"] body h3, html[data-bs-theme="dark"] body h4, html[data-bs-theme="dark"] body h5, html[data-bs-theme="dark"] body h6, html[data-bs-theme="dark"] body .brand-text h3, html[data-bs-theme="dark"] body .company-name-text,
            html[data-bs-theme="dark"] body .doc-title, html[data-bs-theme="dark"] body .breakdown-val, html[data-bs-theme="dark"] body .time-widget span, html[data-bs-theme="dark"] body .sync-text, html[data-bs-theme="dark"] body .user-info h4, html[data-bs-theme="dark"] body .selected-name,
            html[data-bs-theme="dark"] body .swal2-title, html[data-bs-theme="dark"] body .swal2-html-container, html[data-bs-theme="dark"] body [style*="color: #0f172a"], html[data-bs-theme="dark"] body [style*="color: black"], html[data-bs-theme="dark"] body [style*="color: #000"] {
                color: #f1f5f9 !important; opacity: 1 !important;
            }

            html[data-bs-theme="dark"] body .text-muted, html[data-bs-theme="dark"] body .text-secondary, html[data-bs-theme="dark"] body .selected-role, html[data-bs-theme="dark"] body .nav-section, html[data-bs-theme="dark"] body .user-info p, html[data-bs-theme="dark"] body .copy-label, 
            html[data-bs-theme="dark"] body .sync-ping, html[data-bs-theme="dark"] body .doc-meta, html[data-bs-theme="dark"] body .dataTables_empty {
                color: #94a3b8 !important; opacity: 1 !important; font-weight: 500 !important; 
            }

            /* Crisp Grid Tables */
            html[data-bs-theme="dark"] body table, html[data-bs-theme="dark"] body .table, html[data-bs-theme="dark"] body .table-premium, html[data-bs-theme="dark"] body .table-finance, html[data-bs-theme="dark"] body .table-ledger, html[data-bs-theme="dark"] body .req-table-ui {
                color: #f1f5f9 !important; border-collapse: collapse !important; border: 1px solid #334155 !important; background-color: transparent !important;
            }
            html[data-bs-theme="dark"] body table th, html[data-bs-theme="dark"] body .table th, html[data-bs-theme="dark"] body .table-premium th, html[data-bs-theme="dark"] body .table-finance th, html[data-bs-theme="dark"] body .table-ledger th, html[data-bs-theme="dark"] body .req-table-ui th {
                background-color: #020617 !important; background: #020617 !important; border: 1px solid #334155 !important; color: #f1f5f9 !important; position: sticky !important; top: 0 !important; z-index: 10 !important;
            }
            html[data-bs-theme="dark"] body table td, html[data-bs-theme="dark"] body .table td, html[data-bs-theme="dark"] body .table-premium td, html[data-bs-theme="dark"] body .table-finance td, html[data-bs-theme="dark"] body .table-ledger td, html[data-bs-theme="dark"] body .req-table-ui td {
                background-color: transparent !important; background: transparent !important; border: 1px solid #334155 !important; color: #f1f5f9 !important;
            }
            html[data-bs-theme="dark"] body table tbody tr:hover td, html[data-bs-theme="dark"] body .table tbody tr:hover td { background-color: #334155 !important; cursor: pointer; }

            /* Forms & Tabs */
            html[data-bs-theme="dark"] body .nav-tabs .nav-link.active, html[data-bs-theme="dark"] body .nav-pills .nav-link.active, html[data-bs-theme="dark"] body .finance-nav-tabs .nav-link.active, html[data-bs-theme="dark"] body .emr-nav-tabs .nav-link.active {
                background-color: #1e293b !important; color: #10b981 !important; border: 1px solid #334155 !important; box-shadow: none !important;
            }
            html[data-bs-theme="dark"] body input:not([type="radio"]):not([type="checkbox"]), html[data-bs-theme="dark"] body select, html[data-bs-theme="dark"] body textarea, html[data-bs-theme="dark"] body .form-control, html[data-bs-theme="dark"] body .input-modern {
                background-color: #020617 !important; color: #f1f5f9 !important; border: 1.5px solid #475569 !important; box-shadow: none !important;
            }
            html[data-bs-theme="dark"] body input:focus, html[data-bs-theme="dark"] body select:focus, html[data-bs-theme="dark"] body .form-control:focus, html[data-bs-theme="dark"] body .req-input:focus {
                background-color: #1e293b !important; border-color: var(--primary) !important; color: #ffffff !important; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
            }

            /* SweetAlert */
            html[data-bs-theme="dark"] body .swal2-popup, html[data-bs-theme="dark"] body .swal2-toast { background-color: #1e293b !important; border: 1px solid #334155 !important; color: #f1f5f9 !important; }

            /* =========================================================================
               🔮 THE GLASS MODE (Aurora Aesthetics)
               ========================================================================= */
            html body.theme-glass .modern-panel, html body.theme-glass .card, html body.theme-glass .sidebar, html body.theme-glass .topbar, 
            html body.theme-glass .swal2-popup, html body.theme-glass .login-card, html body.theme-glass .patient-folder {
                backdrop-filter: blur(20px) !important; -webkit-backdrop-filter: blur(20px) !important; background-color: var(--bg-surface) !important; border-color: var(--border-color) !important;
            }
            html body.theme-glass input:not([type="radio"]):not([type="checkbox"]), html body.theme-glass select, html body.theme-glass textarea, 
            html body.theme-glass .form-control, html body.theme-glass .input-modern { background-color: rgba(255, 255, 255, 0.6) !important; }
            html body.theme-glass table.dataTable thead th, html body.theme-glass .table thead th { background: rgba(255,255,255,0.2) !important; position: sticky !important; top: 0 !important; z-index: 10 !important; }
            html body.theme-glass table.dataTable tbody tr:hover td { background-color: rgba(255,255,255,0.4) !important; cursor: pointer; }

            /* Theme Selector Buttons */
            html body div[onclick*="'modern'"] { background: #ffffff !important; border-color: #2563eb !important; }
            html body div[onclick*="'modern'"] h6 { color: #0f172a !important; }
            html body div[onclick*="'glass'"] { background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%) !important; border-color: #8b5cf6 !important; }
            html body div[onclick*="'glass'"] h6 { color: #1e1b4b !important; }
            html body div[onclick*="'minimal'"] { background: #0f172a !important; border-color: #10b981 !important; }
            html body div[onclick*="'minimal'"] h6 { color: #f8fafc !important; }
        `;
        document.head.appendChild(styleEl);
    }

    // =========================================================================
    // 🌊 3. RIPPLE ENGINE (เครื่องยนต์ปุ่มหยดน้ำระดับ Android Material)
    // =========================================================================
    #enableRippleEngine() {
        if (this._rippleEnabled) return;
        this._rippleEnabled = true;

        document.addEventListener('click', function (e) {
            const btn = e.target.closest('.btn, .nav-link, .custom-option-item, .page-link');
            if (!btn) return;

            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            const diameter = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${diameter}px`;
            ripple.style.marginLeft = ripple.style.marginTop = `${-diameter / 2}px`;

            btn.appendChild(ripple);
            // 🚨 ใช้ requestAnimationFrame ผสม setTimeout เพื่อคืน Memory ลื่นๆ
            requestAnimationFrame(() => {
                setTimeout(() => { 
                    if(document.body.contains(ripple)) ripple.remove(); 
                }, 600);
            });
        });
    }
}

// 🌐 Expose Component สู่ระบบ
const ThemeEngine = new ThemeEngineService();
window.ThemeEngine = ThemeEngine;
window.ThemeEngine.init();