// js/theme_engine.js
// 👑 Theme Engine V5.5: Perfect Color Mapping + Quantum Aesthetics
// ผสานความสมบูรณ์แบบของสีกราฟิกเดิม เข้ากับแอนิเมชันขั้นสุดยอด (Ripple, Hover Physics, Sticky Tables)

const ThemeEngine = {
    themes: {
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
    },

    sentinel: null, 
    isPurging: false,

    hexToRgb(hex) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '13, 110, 253';
    },

    applyTheme(themeKey) {
        const t = this.themes[themeKey] || this.themes['modern'];
        localStorage.setItem('dialysis_active_theme', themeKey);
        
        document.documentElement.setAttribute('data-bs-theme', t.type);
        document.body.setAttribute('data-theme', t.type);

        document.body.className = document.body.className.replace(/theme-\w+/g, '').trim();
        document.body.classList.add(`theme-${t.type}`);

        let styleEl = document.getElementById('global-theme-override');
        if (!styleEl) { 
            styleEl = document.createElement('style'); 
            styleEl.id = 'global-theme-override'; 
        }
        document.body.appendChild(styleEl); 

        const root = document.documentElement;
        root.style.setProperty('--primary', t.primary);
        root.style.setProperty('--primary-dark', t.primary_dark);
        root.style.setProperty('--primary-glow', t.primary_glow);
        root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${t.primary} 0%, ${t.primary_dark} 100%)`);
        root.style.setProperty('--bg-body', t.bg);
        root.style.setProperty('--bg-surface', t.surface);
        root.style.setProperty('--text-dark', t.text);
        root.style.setProperty('--text-muted', t.text_muted);
        root.style.setProperty('--border-color', t.border);

        // =========================================================================
        // 🚀 1. AESTHETIC ENGINE (ตัวหนังสือคมกริบ, ปุ่มหยดน้ำ, กล่องมีมิติ, ช่องกรอกเรืองแสง)
        // =========================================================================
        let css = `
            html body, html body .main-content, html body .login-container { 
                background-color: var(--bg-body) !important; color: var(--text-dark) !important; 
                -webkit-font-smoothing: antialiased !important; -moz-osx-font-smoothing: grayscale !important; text-rendering: optimizeLegibility !important;
            }
            .btn-premium-primary, .swal2-confirm { 
                background: var(--primary-gradient) !important; color: #ffffff !important; border: none !important; 
            }
            a:not(.btn) { background-color: transparent !important; }

            /* 🪟 Physics & Hover Effects (การ์ดยกตัวได้) */
            .card, .modern-panel, .info-box, .visit-card {
                transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease !important;
            }
            .card:hover, .modern-panel:hover, .visit-card:hover {
                transform: translateY(-4px) !important;
                box-shadow: 0 15px 35px -5px rgba(0,0,0,0.15) !important;
            }

            /* ⌨️ Breathing Inputs (ช่องกรอกข้อมูลเรืองแสง) */
            input.form-control, select.form-select, textarea.form-control, .dataTables_filter input {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }
            input.form-control:focus, select.form-select:focus, textarea.form-control:focus, .dataTables_filter input:focus {
                border-color: var(--primary) !important;
                box-shadow: 0 0 0 4px var(--primary-glow) !important;
                outline: none !important; transform: translateY(-1px);
            }

            /* 🔘 Interactive Ripple Buttons (แอนิเมชันปุ่มมีชีวิต) */
            .btn { position: relative; overflow: hidden; transform: translateZ(0); transition: all 0.3s ease !important; }
            .btn:hover { transform: translateY(-2px) scale(1.02) !important; }
            .btn:active { transform: translateY(1px) scale(0.98) !important; }
            .btn .ripple { position: absolute; border-radius: 50%; transform: scale(0); animation: ripple-effect 0.6s linear; background-color: rgba(255, 255, 255, 0.4); pointer-events: none; }
            @keyframes ripple-effect { to { transform: scale(4); opacity: 0; } }

            /* 📑 Smart Capsule Tabs (แท็บทรงแคปซูล) */
            .nav-tabs { border-bottom: none !important; gap: 8px; padding: 4px; background: rgba(0,0,0,0.03); border-radius: 16px; display: inline-flex !important; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; }
            .nav-tabs::-webkit-scrollbar { display: none !important; }
            .nav-tabs .nav-link { border: none !important; border-radius: 12px !important; font-weight: 700 !important; padding: 10px 24px !important; transition: all 0.3s ease !important; white-space: nowrap; }
            .nav-tabs .nav-link.active { transform: scale(1.05); }

            /* 📊 Sticky Headers สำหรับตารางโหมดสว่าง */
            .table-responsive, .dataTables_wrapper { overflow-x: auto !important; }
            html[data-bs-theme="light"] table.dataTable thead th, html[data-bs-theme="light"] table.table thead th {
                position: sticky !important; top: 0 !important; z-index: 10 !important; background: #f8fafc !important;
            }
        `;

        // =========================================================================
        // 🌑 2. PERFECT DARK MODE MAPPING (โค้ดสีสมบูรณ์แบบของคุณหมอ)
        // =========================================================================
        if (t.type === 'dark') {
            const D = 'html[data-bs-theme="dark"] body';

            css += `
                html[data-bs-theme="dark"] {
                    --bs-body-bg: #0f172a !important; --bs-body-color: #f8fafc !important;
                    --bs-dark: #f8fafc !important; --bs-light: #0f172a !important;
                }

                ${D}, ${D} * {
                    -webkit-font-smoothing: antialiased !important; -moz-osx-font-smoothing: grayscale !important;
                }

                /* ========================================================
                   🚨 1. SEMANTIC NUKE & GHOST BUTTON RESCUE 🚨
                   ======================================================== */
                ${D} .btn[class*="primary"], ${D} .badge[class*="primary"], ${D} [class*="bg-primary"] {
                    background-color: #1e3a8a !important; color: #93c5fd !important; border-color: #1d4ed8 !important;
                }
                ${D} .btn[class*="info"], ${D} .badge[class*="info"], ${D} [class*="bg-info"] {
                    background-color: #0c4a6e !important; color: #7dd3fc !important; border-color: #0284c7 !important;
                }
                ${D} .btn[class*="success"], ${D} .badge[class*="success"], ${D} [class*="bg-success"] {
                    background-color: #064e3b !important; color: #6ee7b7 !important; border-color: #059669 !important;
                }
                ${D} .btn[class*="warning"], ${D} .badge[class*="warning"], ${D} [class*="bg-warning"] {
                    background-color: #78350f !important; color: #fcd34d !important; border-color: #d97706 !important;
                }
                ${D} .btn[class*="danger"], ${D} .badge[class*="danger"], ${D} [class*="bg-danger"] {
                    background-color: #7f1d1d !important; color: #fca5a5 !important; border-color: #dc2626 !important;
                }
                
                ${D} .btn[class*="light"], ${D} .btn[class*="white"], ${D} .btn[class*="secondary"], 
                ${D} .btn[class*="outline-dark"], ${D} .btn.text-muted, ${D} .btn.text-secondary, ${D} .btn.text-dark,
                ${D} .badge[class*="light"], ${D} .badge[class*="secondary"], 
                ${D} [class*="bg-white"], ${D} [class*="bg-light"], ${D} [class*="bg-secondary"] {
                    background-color: #334155 !important; color: #f8fafc !important; border: 1px solid #475569 !important;
                }

                ${D} .btn { color: #f8fafc !important; }
                ${D} .btn i { color: inherit !important; }

                /* 🚨 THE FIX: กวาดล้างกล่องสีพาสเทล (Subtle Backgrounds) ใน Modal และกล่องตั้งค่า */
                ${D} .bg-info-subtle { background-color: rgba(12, 74, 110, 0.4) !important; border: 1px solid #0284c7 !important; color: #7dd3fc !important; }
                ${D} .bg-success-subtle { background-color: rgba(6, 78, 59, 0.4) !important; border: 1px solid #059669 !important; color: #6ee7b7 !important; }
                ${D} .bg-primary-subtle { background-color: rgba(30, 58, 138, 0.4) !important; border: 1px solid #1d4ed8 !important; color: #93c5fd !important; }
                ${D} .bg-warning-subtle { background-color: rgba(120, 53, 15, 0.4) !important; border: 1px solid #d97706 !important; color: #fcd34d !important; }
                ${D} .bg-danger-subtle { background-color: rgba(127, 29, 29, 0.4) !important; border: 1px solid #dc2626 !important; color: #fca5a5 !important; }
                
                /* ดึงสีตัวหนังสือในกล่องพาสเทลให้สว่างขึ้นอ่านง่าย */
                ${D} .bg-info-subtle *, ${D} .bg-success-subtle *, ${D} .bg-primary-subtle *, ${D} .bg-warning-subtle *, ${D} .bg-danger-subtle * {
                    color: inherit !important; opacity: 1 !important;
                }

                /* 🚨 2. COMPONENT OVERHAUL */
                ${D} .modern-panel, ${D} .card, ${D} .sidebar, ${D} .topbar, ${D} .compact-panel, ${D} .user-card-wrapper,
                ${D} .patient-folder, ${D} .patient-folder-body, ${D} .doc-card, ${D} .doc-info, ${D} .doc-thumb-card,
                ${D} .search-box-modern, ${D} .search-box, ${D} .time-widget, ${D} .sync-widget-topbar,
                ${D} .stat-card-premium, ${D} .stat-card-analytics, ${D} .stat-card-finance, ${D} .stat-card-ledger,
                ${D} .req-table-wrapper, ${D} .date-filter-wrapper, ${D} .date-filter-container, ${D} .vd-date-picker,
                ${D} .custom-options-panel, ${D} .smart-menu-container, ${D} .login-card, ${D} .modal-content,
                ${D} .dropdown-menu, ${D} .list-group-item, ${D} .accordion-item, ${D} .card-body, ${D} .emr-nav-tabs-container, ${D} .visit-card {
                    background-color: #1e293b !important; background: #1e293b !important; border: 1px solid #334155 !important; color: #f8fafc !important;
                }

                ${D} .sidebar-footer, ${D} .input-group-text, ${D} .native-date-wrapper, ${D} .breakdown-box, ${D} .sig-addon,
                ${D} .patient-folder-header, ${D} .doc-preview-area, ${D} .doc-actions, ${D} .upload-dropzone,
                ${D} .smart-menu-header, ${D} .modern-icon-login, ${D} .profile-selector-btn, ${D} .page-link, ${D} .solid-input-group, ${D} .emr-scroll-area {
                    background-color: #020617 !important; background: #020617 !important; border: 1px solid #334155 !important;
                }

                /* 🚨 3. INLINE STYLE KILLER (ทะลวงโค้ดสีที่แอบฝังใน HTML) */
                ${D} [style*="background: white"], ${D} [style*="background:white"],
                ${D} [style*="background: #fff"], ${D} [style*="background:#fff"],
                ${D} [style*="background-color: white"], ${D} [style*="background-color: white"],
                ${D} [style*="background-color: #fff"], ${D} [style*="background-color:#fff"],
                ${D} [style*="background-color: #ffffff"], ${D} [style*="background-color:#ffffff"],
                ${D} [style*="background: #ffffff"], ${D} [style*="background:#ffffff"],
                ${D} [style*="background: rgb(255, 255, 255)"], ${D} [style*="background-color: rgb(255, 255, 255)"] {
                    background-color: #1e293b !important;
                    background: #1e293b !important;
                }

                /* 🚨 4. TEXT RESCUE (ดึงตัวหนังสือสีดำที่โดนฝังไว้ให้สว่างขึ้น) */
                ${D} .text-dark, ${D} h1, ${D} h2, ${D} h3, ${D} h4, ${D} h5, ${D} h6, ${D} .brand-text h3, ${D} .company-name-text,
                ${D} .doc-title, ${D} .breakdown-val, ${D} .time-widget span, ${D} .sync-text, ${D} .user-info h4, ${D} .selected-name,
                ${D} .swal2-title, ${D} .swal2-html-container, ${D} [style*="color: #0f172a"], ${D} [style*="color: black"], ${D} [style*="color: #000"] {
                    color: #f1f5f9 !important; opacity: 1 !important;
                }

                ${D} .text-muted, ${D} .text-secondary, ${D} .selected-role, ${D} .nav-section, ${D} .user-info p, ${D} .copy-label, 
                ${D} .sync-ping, ${D} .doc-meta, ${D} .dataTables_empty {
                    color: #94a3b8 !important; opacity: 1 !important; font-weight: 500 !important; 
                }

                /* 🚨 5. CRISP GRID TABLES (รวม Sticky Header ของ V5.0 เข้าไป) */
                ${D} table, ${D} .table, ${D} .table-premium, ${D} .table-finance, ${D} .table-ledger, ${D} .req-table-ui {
                    color: #f1f5f9 !important; border-collapse: collapse !important; border: 1px solid #334155 !important; background-color: transparent !important;
                }
                ${D} table th, ${D} .table th, ${D} .table-premium th, ${D} .table-finance th, ${D} .table-ledger th, ${D} .req-table-ui th {
                    background-color: #020617 !important; background: #020617 !important; border: 1px solid #334155 !important; color: #f1f5f9 !important;
                    position: sticky !important; top: 0 !important; z-index: 10 !important; /* <--- V5.0 Sticky */
                }
                ${D} table td, ${D} .table td, ${D} .table-premium td, ${D} .table-finance td, ${D} .table-ledger td, ${D} .req-table-ui td {
                    background-color: transparent !important; background: transparent !important; border: 1px solid #334155 !important; color: #f1f5f9 !important;
                }
                ${D} table tbody tr:hover td, ${D} .table tbody tr:hover td { background-color: #334155 !important; cursor: pointer; }

                /* 🚨 6. FORMS & TABS */
                ${D} .nav-tabs .nav-link.active, ${D} .nav-pills .nav-link.active, ${D} .finance-nav-tabs .nav-link.active, ${D} .emr-nav-tabs .nav-link.active {
                    background-color: #1e293b !important; color: #10b981 !important; border: 1px solid #334155 !important; box-shadow: none !important;
                }
                ${D} input:not([type="radio"]):not([type="checkbox"]), ${D} select, ${D} textarea, ${D} .form-control, ${D} .input-modern {
                    background-color: #020617 !important; color: #f1f5f9 !important; border: 1.5px solid #475569 !important; box-shadow: none !important;
                }
                ${D} input:focus, ${D} select:focus, ${D} .form-control:focus, ${D} .req-input:focus {
                    background-color: #1e293b !important; border-color: var(--primary) !important; color: #ffffff !important; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2) !important;
                }

                /* 🚨 7. SWEETALERT */
                ${D} .swal2-popup, ${D} .swal2-toast { background-color: #1e293b !important; border: 1px solid #334155 !important; color: #f1f5f9 !important; }

                /* 🚨 8. HOVER FIX */
                ${D} .btn:hover { filter: brightness(1.2); color: #ffffff !important; }
                ${D} .nav-item:hover, ${D} .page-link:hover, ${D} .dropdown-item:hover, ${D} .custom-option-item:hover, ${D} .list-group-item:hover {
                    background-color: #334155 !important; color: #ffffff !important;
                }
                ${D} .nav-item:hover *, ${D} .page-link:hover * { color: #ffffff !important; }
            `;
            
            this.startSentinel();
        } 
        else {
            this.stopSentinel();
            if (t.type === 'glass') {
                css += `
                    html body.theme-glass .modern-panel, html body.theme-glass .card, html body.theme-glass .sidebar, html body.theme-glass .topbar, 
                    html body.theme-glass .swal2-popup, html body.theme-glass .login-card, html body.theme-glass .patient-folder {
                        backdrop-filter: blur(20px) !important; -webkit-backdrop-filter: blur(20px) !important; background-color: var(--bg-surface) !important; border-color: var(--border-color) !important;
                    }
                    html body.theme-glass input:not([type="radio"]):not([type="checkbox"]), html body.theme-glass select, html body.theme-glass textarea, 
                    html body.theme-glass .form-control, html body.theme-glass .input-modern { background-color: rgba(255, 255, 255, 0.6) !important; }
                    html body.theme-glass table.dataTable thead th, html body.theme-glass .table thead th { background: rgba(255,255,255,0.2) !important; position: sticky !important; top: 0 !important; z-index: 10 !important; }
                    html body.theme-glass table.dataTable tbody tr:hover td { background-color: rgba(255,255,255,0.4) !important; cursor: pointer; }
                `;
            }
        }

        css += `
            html body div[onclick*="'modern'"] { background: #ffffff !important; background-color: #ffffff !important; border-color: #2563eb !important; }
            html body div[onclick*="'modern'"] h6 { color: #0f172a !important; }
            html body div[onclick*="'glass'"] { background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%) !important; border-color: #8b5cf6 !important; }
            html body div[onclick*="'glass'"] h6 { color: #1e1b4b !important; }
            html body div[onclick*="'minimal'"] { background: #0f172a !important; background-color: #0f172a !important; border-color: #10b981 !important; }
            html body div[onclick*="'minimal'"] h6 { color: #f8fafc !important; }
        `;

        styleEl.innerHTML = css;

        // 🌟 เปิดใช้งาน Ripple Engine
        this.enableRippleEngine();

        if (typeof Swal !== 'undefined' && !this._isInit) {
            Swal.fire({
                title: 'เปลี่ยนธีมสำเร็จ!', text: `อัปเดตเป็นสไตล์ "${t.name}" เรียบร้อยแล้ว`,
                icon: 'success', timer: 1500, showConfirmButton: false, customClass: { popup: 'premium-alert' }
            });
        }
    },

    // =========================================================================
    // 🌊 3. RIPPLE ENGINE (เครื่องยนต์ปุ่มหยดน้ำระดับ Android Material)
    // =========================================================================
    enableRippleEngine() {
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
            setTimeout(() => { ripple.remove(); }, 600);
        });
    },

    // =========================================================================
    // 🤖 THE DOM SENTINEL (หุ่นยนต์พิทักษ์ความมืด)
    // =========================================================================
    startSentinel() {
        if (this.sentinel) return;
        this.sentinel = new MutationObserver(() => this.purgeBrightStyles());
        this.sentinel.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
        this.purgeBrightStyles();
    },

    stopSentinel() {
        if (this.sentinel) { this.sentinel.disconnect(); this.sentinel = null; }
    },

    purgeBrightStyles() {
        if (document.documentElement.getAttribute('data-bs-theme') !== 'dark' || this.isPurging) return;
        this.isPurging = true;

        const styleEl = document.getElementById('global-theme-override');
        if (styleEl && document.body.lastElementChild !== styleEl) {
            document.body.appendChild(styleEl);
        }

        const targets = document.querySelectorAll('#app-content [style*="background"], #app-content [style*="color"]');
        targets.forEach(el => {
            if (el.tagName === 'CANVAS' || el.classList.contains('progress-bar')) return;
            
            const bg = el.style.backgroundColor || el.style.background;
            if (bg && (bg.includes('255, 255, 255') || bg.includes('white') || bg.includes('#fff') || bg.includes('#f8fafc') || bg.includes('#f1f5f9'))) {
                el.style.setProperty('background-color', '#1e293b', 'important');
            }
            
            const color = el.style.color;
            if (color && (
                color.includes('0, 0, 0') || color.includes('black') || 
                color.includes('#000') || color.includes('#0f172a') ||
                color.includes('#475569') || color.includes('#64748b') ||
                color.includes('100, 116, 139') || color.includes('71, 85, 105')
            )) {
                el.style.setProperty('color', '#f8fafc', 'important');
            }
        });

        document.querySelectorAll('#app-content table').forEach(table => {
            table.style.setProperty('background-color', 'transparent', 'important');
            table.style.setProperty('color', '#f8fafc', 'important');
        });

        setTimeout(() => { this.isPurging = false; }, 50);
    },

    init() {
        this._isInit = true; 
        const savedTheme = localStorage.getItem('dialysis_active_theme') || 'modern';
        this.applyTheme(savedTheme);
        setTimeout(() => { this._isInit = false; }, 1000);
    }
};

window.ThemeEngine = ThemeEngine;
window.ThemeEngine.init();