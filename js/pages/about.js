// js/pages/about.js
// 🚀 Enterprise Module: About System, Versioning & Unified Tech Stack

class AboutPageComponent {
    constructor() {
        // 🚨 อัปเกรดเวอร์ชันเป็น 6.0.0 สะท้อนการอัปเกรดระบบ Hardware Resilience, Zero-Trust Session และ FinOps 🚨
        this.version = "6.0.0 (Quantum Resilient Edition)";
        this.systemName = "DIALYSIS PRO CLOUD OS";
        this.licensee = "หน่วยไตเทียม โรงพยาบาลคริสเตียน แพร่";
    }

    get html() {
        return `
            <style>
                /* 🚀 CSS Rendering Optimization สำหรับโหมดมืด (Dark Mode Support) */
                .about-custom-box { background-color: #f8fafc; border: 1px solid #e2e8f0; transition: all 0.3s ease; }
                .about-copyright-box { background-color: #ffffff; border: 1px solid #e2e8f0; transition: all 0.3s ease; }
                .team-card-hover { transition: all 0.3s; cursor: default; }
                .team-card-hover:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
                .module-list-item { padding: 16px 20px; border-left: 4px solid transparent; transition: all 0.2s ease; }
                .module-list-item:hover { border-left-color: var(--primary); background-color: rgba(37,99,235,0.02) !important; }

                /* Grouping CSS สำหรับ Dark Mode */
                html[data-bs-theme="dark"] .modern-panel,
                html[data-bs-theme="dark"] .bg-white,
                html[data-bs-theme="dark"] .list-group-item {
                    background-color: var(--bg-surface) !important; 
                    border-color: var(--border-color) !important; 
                    color: var(--text-dark) !important;
                }
                
                html[data-bs-theme="dark"] .about-custom-box, 
                html[data-bs-theme="dark"] .about-copyright-box,
                html[data-bs-theme="dark"] .changelog-box { 
                    background-color: rgba(255, 255, 255, 0.03) !important; 
                    border-color: rgba(255, 255, 255, 0.08) !important; 
                }

                html[data-bs-theme="dark"] .modern-panel h2, 
                html[data-bs-theme="dark"] .modern-panel h4, 
                html[data-bs-theme="dark"] .modern-panel h5, 
                html[data-bs-theme="dark"] .modern-panel h6,
                html[data-bs-theme="dark"] .text-dark,
                html[data-bs-theme="dark"] .list-group-item span, 
                html[data-bs-theme="dark"] .list-group-item div,
                html[data-bs-theme="dark"] .changelog-item { 
                    color: var(--text-dark) !important; 
                }
                
                html[data-bs-theme="dark"] .text-muted { color: var(--text-muted) !important; }
                
                html[data-bs-theme="dark"] .team-card-hover:hover { 
                    background-color: rgba(255,255,255,0.08) !important; 
                    box-shadow: 0 10px 20px rgba(0,0,0,0.3); 
                }
                
                html[data-bs-theme="dark"] .module-list-item:hover { 
                    background-color: rgba(255,255,255,0.05) !important; 
                }

                /* 🌟 Custom Styles for Changelog */
                .changelog-box { background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px; margin-top: 30px; }
                .changelog-header { border-bottom: 2px dashed var(--border-color); padding-bottom: 12px; margin-bottom: 16px; }
                .changelog-item { display: flex; align-items: flex-start; margin-bottom: 16px; }
                .changelog-item:last-child { margin-bottom: 0; }
                .changelog-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 16px; margin-right: 16px; }
                .changelog-text h6 { font-family: 'Prompt'; font-weight: 700; margin-bottom: 4px; font-size: 15px; }
                .changelog-text p { margin: 0; font-size: 13px; color: var(--text-muted); line-height: 1.5; }
            </style>

            <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 fade-in-up">
                <div>
                    <h2 class="page-title text-primary" style="font-size: 28px; font-weight: 800;">
                        <i class="fa-solid fa-circle-info me-2"></i> เกี่ยวกับระบบ (About System)
                    </h2>
                    <p class="text-muted mt-1 mb-0 fw-bold">ข้อมูลเวอร์ชัน เทคโนโลยีที่ใช้ และบันทึกการอัปเดตระบบ (Release Notes)</p>
                </div>
            </div>

            <div class="row g-4 pb-4">
                <div class="col-xl-8 col-lg-7 fade-in-up" style="animation-delay: 0.1s;">
                    <div class="modern-panel p-5 h-100 position-relative overflow-hidden shadow-sm" style="border-top: 5px solid var(--primary); background-color: var(--bg-surface);">
                        <div style="position: absolute; top: -30px; right: -20px; opacity: 0.02; font-size: 250px; pointer-events: none;"><i class="fa-solid fa-laptop-medical"></i></div>
                        
                        <div class="d-flex align-items-center mb-4 position-relative z-1">
                            <div class="app-logo-frame me-4">
                                <img src="./img/logo.png" alt="${this.systemName} Logo" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&auto=format&fit=crop';" style="width:80px; border-radius:16px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                            </div>
                            <div>
                                <h2 class="fw-bold text-dark mb-1" style="font-family:'Prompt';">DIALYSIS PRO <span class="text-primary">CLOUD OS</span></h2>
                                <h5 class="text-muted fw-bold">Intelligent Hemodialysis EMR System</h5>
                            </div>
                        </div>

                        <div class="row g-4 position-relative z-1 mt-2">
                            <div class="col-md-6">
                                <div class="p-3 about-custom-box rounded-4 shadow-sm h-100 team-card-hover">
                                    <div class="text-secondary small fw-bold text-uppercase mb-1">เวอร์ชันปัจจุบัน (Latest Build)</div>
                                    <h4 class="fw-bold text-primary mb-0">${this.version}</h4>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="p-3 about-custom-box rounded-4 shadow-sm h-100 team-card-hover">
                                    <div class="text-secondary small fw-bold text-uppercase mb-1">สถาปัตยกรรมระบบ (Architecture)</div>
                                    <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-microchip text-info me-2"></i> Quantum Resilient Core</h5>
                                </div>
                            </div>
                        </div>

                        <!-- 🌟 NEW: CHANGELOG SECTION -->
                        <div class="changelog-box position-relative z-1">
                            <div class="changelog-header d-flex justify-content-between align-items-center">
                                <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-clock-rotate-left text-primary me-2"></i> บันทึกการอัปเดตระบบ v6.0.0 (Release Notes)</h5>
                                <span class="badge bg-success-subtle text-success-emphasis border border-success-subtle rounded-pill">Latest Update</span>
                            </div>
                            
                            <div class="changelog-item">
                                <div class="changelog-icon bg-danger-subtle text-danger"><i class="fa-solid fa-shield-halved"></i></div>
                                <div class="changelog-text">
                                    <h6>Zero-Trust Volatile Session & Security</h6>
                                    <p>ย้ายการจัดเก็บสิทธิ์การเข้าถึงจาก LocalStorage สู่ <b>SessionStorage</b> หากปิดหน้าต่างเบราว์เซอร์ สิทธิ์จะถูกทำลายทิ้ง 100% พร้อมระบบ <b>Zero-Trust Wipe</b> ล้างฟอร์มคนไข้เดิมทันทีที่เริ่มสแกนบัตรใหม่ ป้องกันข้อมูลผู้ป่วยรั่วไหลหรือสลับกัน</p>
                                </div>
                            </div>

                            <div class="changelog-item">
                                <div class="changelog-icon bg-info-subtle text-info"><i class="fa-solid fa-microchip"></i></div>
                                <div class="changelog-text">
                                    <h6>Hardware APDU Fault Tolerance (Smartcard)</h6>
                                    <p>เพิ่มระบบ <b>Exponential Backoff & Smart Retry</b> ในระดับ I/O หากไฟตกหรือบัตรสกปรก ระบบจะพยายามดึงข้อมูลรูปถ่ายซ้ำ 3-4 ครั้งในเสี้ยววินาที พร้อม <b>Cache-Busting HTTP Engine</b> บังคับทะลวงแคชเบราว์เซอร์เพื่อดึงข้อมูลสดใหม่ 100%</p>
                                </div>
                            </div>

                            <div class="changelog-item">
                                <div class="changelog-icon bg-primary-subtle text-primary"><i class="fa-solid fa-terminal"></i></div>
                                <div class="changelog-text">
                                    <h6>OS-Level Shell Enforce & Absolute Grid CMD</h6>
                                    <p>ยกระดับโปรแกรม Local Agent (Python) เป็น <b>Cyber-Enterprise Terminal</b> ผสาน \`subprocess.STARTUPINFO\` บังคับขยายเต็มจอกับ Windows DWM พร้อมจัดระเบียบตาราง CMD ให้เป็น Absolute Grid 90 ตัวอักษร ไม่มีวันแตกหรือเบี้ยว พร้อม Live Event Logs</p>
                                </div>
                            </div>

                            <div class="changelog-item">
                                <div class="changelog-icon bg-warning-subtle text-warning-dark"><i class="fa-solid fa-database"></i></div>
                                <div class="changelog-text">
                                    <h6>Enterprise FinOps Auto-Purge (7-Year Rule)</h6>
                                    <p>เปิดตัวเอนจินล้างข้อมูลอัตโนมัติแบบ Distributed Lock รองรับมาตรฐาน JCI/HA (เก็บประวัติ 7 ปี) ระบบจะทยอยหั่นข้อมูลลบ (Chunking 500 records) และ Yield Thread เพื่อป้องกันหน้าจอค้างหรือ Memory Leak อย่างสมบูรณ์</p>
                                </div>
                            </div>

                            <div class="changelog-item">
                                <div class="changelog-icon bg-success-subtle text-success"><i class="fa-solid fa-print"></i></div>
                                <div class="changelog-text">
                                    <h6>Off-Screen Print Spooler & Premium OPD</h6>
                                    <p>อัปเกรดระบบพิมพ์เอกสารทั้งหมด (Dashboard, Ledger, OPD Card) ให้ใช้ IFrame ประมวลผลเบื้องหลัง (Off-screen Rendering) ไม่เด้ง Popup บังหน้าจอหลัก พร้อมปรับเลย์เอาต์หน้าบัตร OPD ให้สวยงามภูมิฐานระดับพรีเมียม</p>
                                </div>
                            </div>
                        </div>

                        <div class="mt-5 position-relative z-1 pt-4 border-top" style="border-color: var(--border-color) !important;">
                            <h5 class="fw-bold text-dark mb-4"><i class="fa-solid fa-code text-primary me-2"></i> เทคโนโลยีที่ใช้พัฒนา (Advanced Tech Stack)</h5>
                            <div class="row g-3">
                                ${this._generateTechStackCards()}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-4 col-lg-5 fade-in-up" style="animation-delay: 0.2s;">
                    <div class="modern-panel p-4 h-100 d-flex flex-column" style="border-top: 5px solid var(--danger); background-color: var(--bg-surface);">
                        <div class="text-center mb-4 pb-4 border-bottom" style="border-color: var(--border-color) !important;">
                            <div class="rounded-circle bg-danger-subtle text-danger d-inline-flex align-items-center justify-content-center shadow-sm mb-3" style="width: 65px; height: 65px;">
                                <i class="fa-solid fa-copyright fa-2x"></i>
                            </div>
                            <h5 class="fw-bold text-dark mb-1" style="font-family:'Prompt';">ลิขสิทธิ์ซอฟต์แวร์ (License)</h5>
                            
                            <div class="p-4 mt-3 about-copyright-box rounded-3 text-start shadow-sm transition-all">
                                <div class="fw-bold text-dark mb-3 pb-2 border-bottom" style="border-color: rgba(128,128,128,0.2) !important; font-size: 16px;">
                                    &copy; <span id="about-dynamic-year"></span> DIALYSIS PRO CLOUD OS
                                </div>
                                <div class="text-muted fw-bold" style="font-size: 12px; line-height: 1.8;">
                                    <div class="d-flex mb-1"><i class="fa-solid fa-building-circle-check text-success mt-1 me-2" style="width: 14px;"></i> <span><b>Enterprise License:</b><br><span class="text-dark">${this.licensee}</span></span></div>
                                    <div class="d-flex mb-1"><i class="fa-solid fa-server text-info mt-1 me-2" style="width: 14px;"></i> <span><b>Deployment Model:</b><br>Cloud & Local Hybrid (Real-time Sync)</span></div>
                                    <div class="d-flex mb-1"><i class="fa-solid fa-shield-halved text-primary mt-1 me-2" style="width: 14px;"></i> <span><b>Security Level:</b><br>Zero-Trust Security & Dynamic RBAC</span></div>
                                    <hr style="margin: 12px 0; border-color: inherit; opacity: 0.2;">
                                    <i class="fa-solid fa-triangle-exclamation text-danger me-1"></i> <span class="text-danger">Proprietary Software.</span><br>
                                    สงวนสิทธิ์การใช้งานเฉพาะสถานพยาบาลที่ระบุ ห้ามคัดลอก ทำซ้ำ ดัดแปลงซอร์สโค้ด (Source Code) หรือนำไปใช้เพื่อการพาณิชย์ส่วนหนึ่งส่วนใดโดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร
                                </div>
                            </div>
                        </div>

                        <div class="mb-2">
                            <h6 class="fw-bold text-primary mb-3"><i class="fa-solid fa-users-viewfinder me-2"></i> ทีมพัฒนาและที่ปรึกษาองค์กร</h6>
                            ${this._generateTeamCards()}
                        </div>
                        
                        <div class="mt-auto pt-3 border-top" style="border-color: var(--border-color) !important;">
                            <div class="d-flex align-items-center justify-content-between p-3 about-custom-box rounded-4">
                                <span class="text-muted small fw-bold">Database & Auth Status</span>
                                <span class="badge bg-success shadow-sm rounded-pill"><i class="fa-solid fa-satellite-dish me-1"></i> Firebase Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    init() {
        const yearEl = document.getElementById('about-dynamic-year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();
    }

    _generateTechStackCards() {
        const stacks = [
            { icon: '<i class="fa-brands fa-js fa-2x text-warning"></i>', title: "Core Architecture", desc: "Vanilla JS ES6+ & Custom Performance Engine" },
            { icon: '<i class="fa-solid fa-server fa-2x text-warning" style="color: #f59e0b !important;"></i>', title: "Cloud Backend", desc: "Google Firebase Realtime DB & Secure Authentication" },
            { icon: '<i class="fa-brands fa-css3-alt fa-2x text-primary"></i>', title: "UI & Styling Engine", desc: "Bootstrap 5, CSS3 Variables & Glassmorphism Effects" },
            { icon: '<i class="fa-solid fa-table fa-2x text-info"></i>', title: "Data Grid & Visuals", desc: "DataTables Premium, Chart.js & UIOrchestrator Engine" },
            { icon: '<i class="fa-solid fa-print fa-2x text-success"></i>', title: "Export & Reporting", desc: "ExcelJS Engine & Isolated DOM Native Print Renderer" },
            { icon: '<i class="fa-solid fa-user-lock fa-2x text-danger"></i>', title: "Security & Access", desc: "Zero-Trust Architecture & Dynamic RBAC Matrix" }
        ];

        return stacks.map(stack => `
            <div class="col-md-6 col-lg-4">
                <div class="p-3 about-custom-box rounded-4 h-100 team-card-hover d-flex flex-column transition-all">
                    <div class="mb-2">${stack.icon}</div>
                    <div class="fw-bold text-dark mb-1" style="font-size: 14px; line-height: 1.2;">${stack.title}</div>
                    <div class="text-muted small fw-bold" style="line-height: 1.4;">${stack.desc}</div>
                </div>
            </div>
        `).join('');
    }

    _generateTeamCards() {
        const teams = [
            { name: "Mr. J", role: "Lead Software Architect & Full-Stack Developer", color: "success" },
            { name: "ทีมแพทย์และพยาบาลไตเทียม", role: "Clinical Workflow & Medical Advisors", color: "primary" },
            { name: "ฝ่ายสารสนเทศ (IT Support)", role: "System Infrastructure & Deployment Operation", color: "warning-dark" }
        ];
        
        return teams.map(t => `
            <div class="d-flex align-items-center p-3 mb-2 rounded-4 about-custom-box team-card-hover cursor-default">
                <div class="rounded-circle bg-${t.color}-subtle text-${t.color} d-flex align-items-center justify-content-center me-3 shadow-sm border border-2 border-white transition-all flex-shrink-0" style="width: 45px; height: 45px;">
                    <i class="fa-solid fa-user-tie"></i>
                </div>
                <div class="min-w-0 flex-grow-1">
                    <div class="fw-bold text-dark text-truncate" style="font-size: 14.5px;">${t.name}</div>
                    <div class="text-${t.color} small fw-bold" style="line-height: 1.3;">${t.role}</div>
                </div>
            </div>
        `).join('');
    }
}

const AboutPage = new AboutPageComponent();
window.AboutPage = AboutPage;