// js/pages/about.js
// 🚀 โมดูลแสดงข้อมูลเกี่ยวกับระบบ (About System), คณะจัดทำ, เทคโนโลยี และ ลิขสิทธิ์ซอฟต์แวร์ (Copyright)

const AboutPage = {
    html: `
        <style>
            .team-card-hover { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); border: 1px solid transparent; }
            .team-card-hover:hover { background-color: #ffffff; border-color: #bfdbfe; transform: translateY(-3px); box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.1); }
            .copyright-box { background: linear-gradient(to right, #f8fafc, #f1f5f9); border-left: 4px solid #ef4444; }
            
            /* 🚨 สไตล์คุมขนาดโลโก้ใหม่ของคุณหมอ ป้องกันรูปสัดส่วนเพี้ยน */
            .app-logo-frame {
                width: 90px; height: 90px; border-radius: 24px; 
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 12px 25px -6px rgba(37, 99, 235, 0.45);
                overflow: hidden; background: #ffffff;
            }
            .app-logo-frame img {
                width: 100%; height: 100%; object-fit: cover; /* บังคับให้รูปเต็มกรอบพอดีสวยงาม */
            }
        </style>

        <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 fade-in-up">
            <div>
                <h2 class="page-title text-primary" style="font-size: 28px; font-weight: 800;">
                    <i class="fa-solid fa-circle-info me-2"></i> เกี่ยวกับระบบ (About System)
                </h2>
                <p class="text-muted mt-1 mb-0 fw-bold">ข้อมูลเวอร์ชัน เทคโนโลยีที่ใช้ และคณะผู้จัดทำโปรแกรม</p>
            </div>
        </div>

        <div class="row g-4 pb-4">
            <!-- 🌟 ฝั่งซ้าย: ข้อมูลระบบหลัก และ Tech Stack -->
            <div class="col-xl-8 col-lg-7 fade-in-up" style="animation-delay: 0.1s;">
                <div class="modern-panel p-5 h-100 position-relative overflow-hidden" style="border-top: 5px solid var(--primary); border-radius: 20px;">
                    <div style="position: absolute; top: -30px; right: -20px; opacity: 0.02; font-size: 250px; pointer-events: none;">
                        <i class="fa-solid fa-laptop-medical"></i>
                    </div>
                    
                    <div class="d-flex align-items-center mb-4 position-relative z-1">
                        <!-- 🚨 จุดใส่รูปโลโก้ใหม่ของคุณหมอ 🚨 -->
                        <!-- วิธีเปลี่ยนรูป: เอาลิงก์รูปภาพมาใส่ในช่อง src="..." ได้เลยครับ -->
                        <div class="app-logo-frame me-4">
                            <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=200&auto=format&fit=crop" id="about-app-logo" alt="Dialysis Pro Logo">
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
                                <h4 class="fw-bold text-primary mb-0">Version 4.0.0 (Enterprise)</h4>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="p-3 bg-light rounded-4 border border-light shadow-sm h-100 team-card-hover">
                                <div class="text-secondary small fw-bold text-uppercase mb-1">สถาปัตยกรรมระบบ</div>
                                <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-cloud text-info me-2"></i> Cloud-Native SPA</h5>
                            </div>
                        </div>
                    </div>

                    <div class="mt-5 position-relative z-1">
                        <h5 class="fw-bold text-dark mb-3"><i class="fa-solid fa-layer-group text-warning me-2"></i> โมดูลหลักที่ให้บริการ (Core Modules)</h5>
                        <ul class="list-group shadow-sm" style="border-radius: 14px; overflow: hidden;">
                            <li class="list-group-item bg-white border-light p-3 d-flex align-items-center">
                                <i class="fa-solid fa-check-circle text-success me-3 fs-5"></i> 
                                <span class="fw-bold text-dark">ระบบจัดการแฟ้มประวัติเวชระเบียนอิเล็กทรอนิกส์ (Cloud EMR)</span>
                            </li>
                            <li class="list-group-item bg-white border-light p-3 d-flex align-items-center">
                                <i class="fa-solid fa-check-circle text-success me-3 fs-5"></i> 
                                <span class="fw-bold text-dark">ระบบเชื่อมต่อเครื่องอ่านบัตรประชาชนอัตโนมัติ (Smartcard API)</span>
                            </li>
                            <li class="list-group-item bg-white border-light p-3 d-flex align-items-center">
                                <i class="fa-solid fa-check-circle text-success me-3 fs-5"></i> 
                                <span class="fw-bold text-dark">ระบบบันทึกการฟอกเลือดระหว่างทำแบบ Real-time (HD Flowsheet)</span>
                            </li>
                            <li class="list-group-item bg-white border-light p-3 d-flex align-items-center">
                                <i class="fa-solid fa-check-circle text-success me-3 fs-5"></i> 
                                <span class="fw-bold text-dark">ระบบควบคุมคลังน้ำยา ยาฉีด และคำนวณสั่งซื้ออัตโนมัติ (Smart PO)</span>
                            </li>
                            <li class="list-group-item bg-white border-light p-3 d-flex align-items-center">
                                <i class="fa-solid fa-check-circle text-success me-3 fs-5"></i> 
                                <span class="fw-bold text-dark">ระบบบัญชีรายรับ-รายจ่าย และแยกประเภทต้นทุน (General Ledger)</span>
                            </li>
                        </ul>
                    </div>

                    <!-- ส่วนเทคโนโลยีและโปรแกรมที่ใช้พัฒนา -->
                    <div class="mt-5 position-relative z-1 pt-4 border-top border-light">
                        <h5 class="fw-bold text-dark mb-4"><i class="fa-solid fa-code text-primary me-2"></i> เทคโนโลยีและโปรแกรมที่ใช้พัฒนา (Tech Stack & Tools)</h5>
                        
                        <div class="row g-3">
                            <div class="col-md-6 col-lg-4">
                                <div class="p-3 bg-light rounded-4 border border-secondary-subtle h-100 team-card-hover d-flex flex-column">
                                    <div class="text-primary mb-3">
                                        <i class="fa-brands fa-html5 fa-2x me-2 text-danger"></i>
                                        <i class="fa-brands fa-css3-alt fa-2x me-2 text-primary"></i>
                                        <i class="fa-brands fa-js fa-2x text-warning"></i>
                                    </div>
                                    <div class="fw-bold text-dark mb-1" style="font-size: 15px;">Frontend Core</div>
                                    <div class="text-muted small fw-bold">HTML5, CSS3, Vanilla JS<br>Bootstrap 5 (UI Framework)</div>
                                </div>
                            </div>
                            
                            <div class="col-md-6 col-lg-4">
                                <div class="p-3 bg-light rounded-4 border border-secondary-subtle h-100 team-card-hover d-flex flex-column">
                                    <div class="text-warning mb-3">
                                        <i class="fa-solid fa-database fa-2x text-warning"></i>
                                    </div>
                                    <div class="fw-bold text-dark mb-1" style="font-size: 15px;">Backend & DB</div>
                                    <div class="text-muted small fw-bold">Google Firebase (BaaS)<br>Realtime DB & Authentication</div>
                                </div>
                            </div>

                            <div class="col-md-6 col-lg-4">
                                <div class="p-3 bg-light rounded-4 border border-secondary-subtle h-100 team-card-hover d-flex flex-column">
                                    <div class="mb-3">
                                        <i class="fa-brands fa-python fa-2x text-info me-2"></i>
                                        <i class="fa-solid fa-id-card fa-2x text-secondary"></i>
                                    </div>
                                    <div class="fw-bold text-dark mb-1" style="font-size: 15px;">Hardware Bridge</div>
                                    <div class="text-muted small fw-bold">Python (FastAPI, pyscard)<br>Smartcard Local Agent</div>
                                </div>
                            </div>

                            <div class="col-md-6 col-lg-4">
                                <div class="p-3 bg-light rounded-4 border border-secondary-subtle h-100 team-card-hover d-flex flex-column">
                                    <div class="mb-3">
                                        <i class="fa-solid fa-chart-line fa-2x text-success me-2"></i>
                                        <i class="fa-solid fa-file-excel fa-2x text-success"></i>
                                    </div>
                                    <div class="fw-bold text-dark mb-1" style="font-size: 15px;">Data & Export</div>
                                    <div class="text-muted small fw-bold">Chart.js (Interactive Graphs)<br>SheetJS (Excel Export)</div>
                                </div>
                            </div>

                            <div class="col-md-6 col-lg-4">
                                <div class="p-3 bg-light rounded-4 border border-secondary-subtle h-100 team-card-hover d-flex flex-column">
                                    <div class="mb-3">
                                        <i class="fa-solid fa-wand-magic-sparkles fa-2x text-danger me-2"></i>
                                        <i class="fa-solid fa-icons fa-2x text-primary"></i>
                                    </div>
                                    <div class="fw-bold text-dark mb-1" style="font-size: 15px;">UI Plugins</div>
                                    <div class="text-muted small fw-bold">SweetAlert2 (Smart Popups)<br>FontAwesome 6 (Icons)</div>
                                </div>
                            </div>

                            <div class="col-md-6 col-lg-4">
                                <div class="p-3 bg-light rounded-4 border border-secondary-subtle h-100 team-card-hover d-flex flex-column">
                                    <div class="mb-3">
                                        <i class="fa-solid fa-barcode fa-2x text-dark me-2"></i>
                                        <i class="fa-solid fa-camera fa-2x text-secondary"></i>
                                    </div>
                                    <div class="fw-bold text-dark mb-1" style="font-size: 15px;">Scanner Engine</div>
                                    <div class="text-muted small fw-bold">Html5Qrcode<br>Camera & USB Barcode Reader</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- 🌟 ฝั่งขวา: กล่องข้อมูลผู้พัฒนา คณะจัดทำ และ License -->
            <div class="col-xl-4 col-lg-5 fade-in-up" style="animation-delay: 0.2s;">
                <div class="modern-panel p-4 h-100 d-flex flex-column" style="border-top: 5px solid var(--danger); border-radius: 20px;">
                    
                    <!-- ส่วนลิขสิทธิ์ซอฟต์แวร์ -->
                    <div class="text-center mb-4 pb-4 border-bottom border-light">
                        <div class="rounded-circle bg-danger-subtle text-danger d-inline-flex align-items-center justify-content-center shadow-sm mb-3" style="width: 65px; height: 65px;">
                            <i class="fa-solid fa-copyright fa-2x"></i>
                        </div>
                        <h5 class="fw-bold text-dark mb-1" style="font-family:'Prompt';">ลิขสิทธิ์ซอฟต์แวร์ (Copyright)</h5>
                        
                        <div class="p-3 mt-3 copyright-box rounded-3 border border-secondary-subtle text-start shadow-sm">
                            <div class="fw-bold text-dark mb-2" style="font-size: 14.5px;">
                                &copy; <span id="about-dynamic-year"></span> DIALYSIS PRO SYSTEM
                            </div>
                            <div class="text-muted fw-bold" style="font-size: 12px; line-height: 1.6;">
                                <i class="fa-solid fa-check text-success me-1"></i> <b>สิทธิ์การใช้งาน (Licensed to):</b><br>
                                หน่วยไตเทียม โรงพยาบาลคริสเตียน แพร่<br>
                                <hr style="margin: 8px 0; opacity: 0.5;">
                                <i class="fa-solid fa-triangle-exclamation text-danger me-1"></i> <span class="text-danger">Proprietary Commercial Software.</span> สงวนลิขสิทธิ์ตามกฎหมาย ห้ามคัดลอก ดัดแปลง ทำซ้ำ หรือนำไปใช้ในเชิงพาณิชย์โดยไม่ได้รับอนุญาตอย่างเป็นทางการ
                            </div>
                        </div>
                    </div>

                    <!-- ส่วนรายชื่อคณะผู้จัดทำ -->
                    <div class="mb-2">
                        <h6 class="fw-bold text-primary mb-3"><i class="fa-solid fa-users-viewfinder me-2"></i> คณะจัดทำและพัฒนาระบบ</h6>
                        
                        <div class="d-flex align-items-center p-2 mb-2 rounded-3 team-card-hover" title="ผู้ออกแบบและวางสถาปัตยกรรมระบบทั้งหมด">
                            <img src="https://ui-avatars.com/api/?name=J&background=0f172a&color=10b981&bold=true" class="rounded-circle me-3 shadow-sm border border-2 border-white" style="width: 45px; height: 45px;">
                            <div class="min-w-0">
                                <div class="fw-bold text-dark text-truncate" style="font-size: 15px; font-family:'Prompt';">Mr. J (The Architect)</div>
                                <div class="text-success small fw-bold text-truncate"><i class="fa-solid fa-user-secret me-1"></i> Shadow Software Engineer</div>
                            </div>
                        </div>

                        <div class="d-flex align-items-center p-2 mb-2 rounded-3 team-card-hover">
                            <div class="rounded-circle bg-primary-subtle text-primary-dark d-flex align-items-center justify-content-center me-3 shadow-sm border border-2 border-white" style="width: 45px; height: 45px; font-size: 18px;">
                                <i class="fa-solid fa-user-nurse"></i>
                            </div>
                            <div class="min-w-0">
                                <div class="fw-bold text-dark text-truncate" style="font-size: 14.5px; font-family:'Prompt';">ทีมแพทย์และพยาบาล</div>
                                <div class="text-primary small fw-bold text-truncate"><i class="fa-solid fa-stethoscope me-1"></i> Clinical Workflow Advisors</div>
                            </div>
                        </div>

                        <div class="d-flex align-items-center p-2 mb-2 rounded-3 team-card-hover">
                            <div class="rounded-circle bg-warning-subtle text-warning-dark d-flex align-items-center justify-content-center me-3 shadow-sm border border-2 border-white" style="width: 45px; height: 45px; font-size: 18px;">
                                <i class="fa-solid fa-server"></i>
                            </div>
                            <div class="min-w-0">
                                <div class="fw-bold text-dark text-truncate" style="font-size: 14.5px; font-family:'Prompt';">ฝ่าย IT รพ.คริสเตียน แพร่</div>
                                <div class="text-warning-dark small fw-bold text-truncate"><i class="fa-solid fa-network-wired me-1"></i> Infrastructure Support</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- ส่วนท้าย (Database) -->
                    <div class="mt-auto pt-3 border-top border-light">
                        <div class="d-flex align-items-center justify-content-between p-3 bg-light rounded-4 border border-secondary-subtle">
                            <span class="text-muted small fw-bold">Database Sync</span>
                            <span class="badge bg-success shadow-sm rounded-pill"><i class="fa-solid fa-database me-1"></i> Firebase Active</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    `,

    init: function() {
        console.log("ℹ️ [About Page] Loaded.");
        const yearEl = document.getElementById('about-dynamic-year');
        if (yearEl) { yearEl.innerText = new Date().getFullYear(); }
    }
};