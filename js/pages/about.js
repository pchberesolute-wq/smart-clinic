// js/pages/about.js
// 🚀 Enterprise Module: About System, Versioning & Unified Tech Stack

class AboutPageComponent {
    constructor() {
        this.version = "4.5.0 (Enterprise Gold Edition)";
        this.systemName = "DIALYSIS PRO CLOUD OS";
        this.licensee = "หน่วยไตเทียม โรงพยาบาลคริสเตียน แพร่";
    }

    get html() {
        return `
            <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 fade-in-up">
                <div>
                    <h2 class="page-title text-primary" style="font-size: 28px; font-weight: 800;">
                        <i class="fa-solid fa-circle-info me-2"></i> เกี่ยวกับระบบ (About System)
                    </h2>
                    <p class="text-muted mt-1 mb-0 fw-bold">ข้อมูลเวอร์ชัน เทคโนโลยีที่ใช้ และระบบจัดการมาตรฐานองค์กร</p>
                </div>
            </div>

            <div class="row g-4 pb-4">
                <div class="col-xl-8 col-lg-7 fade-in-up" style="animation-delay: 0.1s;">
                    <div class="modern-panel p-5 h-100 position-relative overflow-hidden shadow-sm" style="border-top: 5px solid var(--primary);">
                        <div style="position: absolute; top: -30px; right: -20px; opacity: 0.02; font-size: 250px; pointer-events: none;"><i class="fa-solid fa-laptop-medical"></i></div>
                        
                        <div class="d-flex align-items-center mb-4 position-relative z-1">
                            <div class="app-logo-frame me-4">
                                <img src="./img/logo.png" alt="${this.systemName} Logo" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&auto=format&fit=crop';">
                            </div>
                            <div>
                                <h2 class="fw-bold text-dark mb-1" style="font-family:'Prompt';">DIALYSIS PRO <span class="text-primary">CLOUD OS</span></h2>
                                <h5 class="text-muted fw-bold">Intelligent Hemodialysis EMR System</h5>
                            </div>
                        </div>

                        <div class="row g-4 position-relative z-1 mt-2">
                            <div class="col-md-6">
                                <div class="p-3 bg-light rounded-4 border border-light shadow-sm h-100 team-card-hover">
                                    <div class="text-secondary small fw-bold text-uppercase mb-1">เวอร์ชันปัจจุบัน</div>
                                    <h4 class="fw-bold text-primary mb-0">${this.version}</h4>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="p-3 bg-light rounded-4 border border-light shadow-sm h-100 team-card-hover">
                                    <div class="text-secondary small fw-bold text-uppercase mb-1">สถาปัตยกรรมระบบ</div>
                                    <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-cloud text-info me-2"></i> Cloud-Native Realtime OS</h5>
                                </div>
                            </div>
                        </div>

                        <div class="mt-5 position-relative z-1">
                            <h5 class="fw-bold text-dark mb-3"><i class="fa-solid fa-layer-group text-warning me-2"></i> โมดูลหลักที่ให้บริการ (Enterprise Core Modules)</h5>
                            <ul class="list-group shadow-sm" style="border-radius: 14px; overflow: hidden;">
                                ${this.#generateModuleList()}
                            </ul>
                        </div>

                        <div class="mt-5 position-relative z-1 pt-4 border-top border-light">
                            <h5 class="fw-bold text-dark mb-4"><i class="fa-solid fa-code text-primary me-2"></i> เทคโนโลยีที่ใช้พัฒนา (Tech Stack)</h5>
                            <div class="row g-3">
                                ${this.#generateTechStackCards()}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-xl-4 col-lg-5 fade-in-up" style="animation-delay: 0.2s;">
                    <div class="modern-panel p-4 h-100 d-flex flex-column" style="border-top: 5px solid var(--danger);">
                        <div class="text-center mb-4 pb-4 border-bottom border-light">
                            <div class="rounded-circle bg-danger-subtle text-danger d-inline-flex align-items-center justify-content-center shadow-sm mb-3" style="width: 65px; height: 65px;">
                                <i class="fa-solid fa-copyright fa-2x"></i>
                            </div>
                            <h5 class="fw-bold text-dark mb-1" style="font-family:'Prompt';">ลิขสิทธิ์ซอฟต์แวร์</h5>
                            <div class="p-3 mt-3 copyright-box rounded-3 border border-secondary-subtle text-start shadow-sm">
                                <div class="fw-bold text-dark mb-2" style="font-size: 14.5px;">&copy; <span id="about-dynamic-year"></span> DIALYSIS PRO</div>
                                <div class="text-muted fw-bold" style="font-size: 12px; line-height: 1.6;">
                                    <i class="fa-solid fa-check text-success me-1"></i> <b>Licensed to:</b> ${this.licensee}<br>
                                    <hr style="margin: 8px 0; opacity: 0.5;">
                                    <i class="fa-solid fa-triangle-exclamation text-danger me-1"></i> <span class="text-danger">Proprietary Software.</span> ห้ามคัดลอกหรือดัดแปลงโดยไม่ได้รับอนุญาต
                                </div>
                            </div>
                        </div>

                        <div class="mb-2">
                            <h6 class="fw-bold text-primary mb-3"><i class="fa-solid fa-users-viewfinder me-2"></i> ทีมพัฒนาและที่ปรึกษา</h6>
                            ${this.#generateTeamCards()}
                        </div>
                        
                        <div class="mt-auto pt-3 border-top border-light">
                            <div class="d-flex align-items-center justify-content-between p-3 bg-light rounded-4 border border-secondary-subtle">
                                <span class="text-muted small fw-bold">Database Status</span>
                                <span class="badge bg-success shadow-sm rounded-pill"><i class="fa-solid fa-database me-1"></i> Firebase Active</span>
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

    #generateModuleList() {
        const modules = [
            "ระบบ Cloud EMR: จัดการเวชระเบียนผู้ป่วยฟอกไตเต็มรูปแบบ",
            "UI Orchestrator Engine: ระบบแสดงผลตารางอัตโนมัติรองรับทุกหน้าจอ",
            "Real-time Sync: ระบบซิงค์ข้อมูล Database ระหว่างเครื่องแบบวินาทีต่อวินาที",
            "Smart Stock & PO: ระบบคำนวณเบิกจ่ายและเตือนสต๊อกพัสดุอัจฉริยะ",
            "Integrated Hardware Bridge: รองรับเครื่องอ่านบัตรประชาชนและบาร์โค้ด"
        ];
        return modules.map(mod => `
            <li class="list-group-item bg-white border-light p-3 d-flex align-items-center">
                <i class="fa-solid fa-check-circle text-success me-3 fs-5"></i> 
                <span class="fw-bold text-dark">${mod}</span>
            </li>
        `).join('');
    }

    #generateTechStackCards() {
        const stacks = [
            { icon: '<i class="fa-brands fa-js fa-2x text-warning"></i>', title: "Logic & Routing", desc: "Enterprise Vanilla JS & Module Router" },
            { icon: '<i class="fa-solid fa-database fa-2x text-warning"></i>', title: "Cloud Backend", desc: "Google Firebase (Realtime DB & Auth)" },
            { icon: '<i class="fa-solid fa-table fa-2x text-primary"></i>', title: "Grid Engine", desc: "DataTables Premium & UIOrchestrator" },
            { icon: '<i class="fa-solid fa-chart-line fa-2x text-success"></i>', title: "Data Visualization", desc: "Chart.js & Dynamic Stats" },
            { icon: '<i class="fa-solid fa-print fa-2x text-danger"></i>', title: "Reporting", desc: "EMR PDF/Print Generator" },
            { icon: '<i class="fa-brands fa-python fa-2x text-info"></i>', title: "Hardware Driver", desc: "Python Local Bridge Agent" }
        ];

        return stacks.map(stack => `
            <div class="col-md-6 col-lg-4">
                <div class="p-3 bg-light rounded-4 border border-secondary-subtle h-100 team-card-hover d-flex flex-column">
                    <div class="mb-2">${stack.icon}</div>
                    <div class="fw-bold text-dark mb-1" style="font-size: 14px;">${stack.title}</div>
                    <div class="text-muted small fw-bold">${stack.desc}</div>
                </div>
            </div>
        `).join('');
    }

    #generateTeamCards() {
        const teams = [
            { name: "Mr. J", role: "Software Architect", color: "success" },
            { name: "ทีมพยาบาลคลินิก", role: "Clinical Workflow Expert", color: "primary" },
            { name: "ฝ่าย IT รพ.", role: "Infrastructure Support", color: "warning-dark" }
        ];
        return teams.map(t => `
            <div class="d-flex align-items-center p-2 mb-2 rounded-3 team-card-hover">
                <div class="rounded-circle bg-${t.color}-subtle text-${t.color} d-flex align-items-center justify-content-center me-3 shadow-sm border border-2 border-white" style="width: 40px; height: 40px;"><i class="fa-solid fa-user-check"></i></div>
                <div class="min-w-0">
                    <div class="fw-bold text-dark text-truncate" style="font-size: 14px;">${t.name}</div>
                    <div class="text-${t.color} small fw-bold">${t.role}</div>
                </div>
            </div>
        `).join('');
    }
}

const AboutPage = new AboutPageComponent();
window.AboutPage = AboutPage;