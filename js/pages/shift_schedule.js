// js/pages/shift_schedule.js
// 🚀 Enterprise HR & Timesheet Matrix Module (v102.0 - Auto Leave Summary Aggregation)

class ShiftSchedulePageComponent {
    constructor() {
        this.currentMonth = new Date().toISOString().slice(0, 7);
        this.currentYear = this.currentMonth.slice(0, 4);
        this.staffList = [];
        this.timesheetData = {}; 
        this.yearlyLeaveUsage = {}; 
        this.staffCustomQuotas = {}; 
        this.firebaseListeners = [];
        this.shiftTypes = [];
        this.leaveTypes = [];
        this.customRoles = [];
        this.thaiFullDays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];
    }

    get html() {
        return `
            <style>
                #ts-main-panel, #timesheet-legend, .swal2-container, #print-request-form-zone {
                    -webkit-font-smoothing: antialiased !important;
                    -moz-osx-font-smoothing: grayscale !important;
                    text-rendering: optimizeLegibility !important;
                }

                .timesheet-wrapper { overflow-x: auto; overflow-y: auto; max-height: 68vh; border-radius: 16px; border: 1px solid var(--border-color); background-color: var(--bg-surface); position: relative; z-index: 1; }
                .ts-table { border-collapse: separate; border-spacing: 0; min-width: 100%; margin: 0; background-color: transparent !important; table-layout: auto; }
                
                .ts-table th, .ts-table td { border-bottom: 1px solid var(--border-color); border-right: 1px solid var(--border-color); padding: 8px; text-align: center; vertical-align: middle; transition: background-color 0.2s ease; font-weight: 500; }
                .ts-table th { font-family: 'Prompt', sans-serif; font-size: 13px; position: sticky; top: 0; z-index: 10; background: var(--bg-surface); color: var(--text-dark); box-shadow: 0 2px 5px rgba(0,0,0,0.02); border-top: none; white-space: nowrap; font-weight: 700; }
                .ts-table td { font-size: 13px; cursor: pointer; background: var(--bg-surface); color: var(--text-dark); }
                .ts-table tbody tr:hover td { background-color: var(--bg-body); }
                
                .sticky-col { position: sticky !important; left: 0 !important; z-index: 20 !important; min-width: 315px; max-width: 315px; text-align: left !important; border-right: 1px solid var(--border-color) !important; background: var(--bg-surface) !important; }
                .ts-table th.sticky-col { z-index: 30 !important; vertical-align: middle; }
                
                .staff-card-cell { background: var(--bg-body); border-radius: 12px; padding: 8px 12px; display: flex; align-items: center; gap: 12px; border: 1px solid var(--border-color); min-height: 55px; height: 100%; width: 100%; box-sizing: border-box; }
                .staff-avatar { width: 40px; height: 40px; min-width: 40px; min-height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; color: #ffffff !important; text-transform: uppercase; flex-shrink: 0 !important; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                .staff-info-container { display: flex; flex-direction: column; flex-grow: 1; overflow: hidden; justify-content: center; }
                
                .day-header { display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 45px; }
                .day-num { font-size: 15px; font-weight: 800; line-height: 1; color: var(--text-dark); }
                .day-name { font-size: 10.5px; font-weight: 600; margin-top: 4px; color: var(--text-muted); white-space: nowrap; }
                .weekend-header { background-color: color-mix(in srgb, var(--bs-danger) 5%, transparent) !important; }
                .weekend-header .day-num, .weekend-header .day-name { color: var(--bs-danger) !important; }
                
                .status-badge { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; min-height: 38px; border-radius: 8px; font-weight: 700; margin-bottom: 4px; padding: 4px; box-sizing: border-box; }
                
                #ts-main-panel .dynamic-badge,
                #timesheet-legend .dynamic-badge,
                .swal2-container .dynamic-badge { 
                    background-color: color-mix(in srgb, var(--badge-color) 15%, transparent) !important; 
                    border: 1px solid color-mix(in srgb, var(--badge-color) 30%, transparent) !important; 
                }
                
                #ts-main-panel .dynamic-badge, 
                #ts-main-panel .dynamic-badge *, 
                #timesheet-legend .dynamic-badge,
                #timesheet-legend .dynamic-badge *,
                .swal2-container .dynamic-badge,
                .swal2-container .dynamic-badge * { 
                    color: var(--badge-color) !important; 
                    -webkit-text-fill-color: var(--badge-color) !important; 
                }

                .swal2-container .badge[style*="var(--text-muted)"],
                .swal2-container .badge[style*="var(--text-muted)"] * {
                    color: var(--text-muted) !important;
                    -webkit-text-fill-color: var(--text-muted) !important;
                }
                
                .status-text { font-size: 11px; line-height: 1.2; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; text-rendering: geometricPrecision; }
                
                .status-badge-off { background: repeating-linear-gradient(45deg, var(--bg-surface), var(--bg-surface) 10px, var(--bg-body) 10px, var(--bg-body) 20px) !important; border: 1px dashed var(--border-color) !important; opacity: 0.8; }
                
                #ts-main-panel .status-badge-off, 
                #ts-main-panel .status-badge-off *,
                #timesheet-legend .status-badge-off, 
                #timesheet-legend .status-badge-off *,
                .swal2-container .status-badge-off,
                .swal2-container .status-badge-off * { 
                    color: var(--text-muted) !important; 
                    -webkit-text-fill-color: var(--text-muted) !important;
                }
                
                .quota-box { font-size: 10.5px; padding: 5px 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 5px; font-weight: 700; }
                .role-badge { display: inline-block; padding: 2px 8px; border-radius: 50px; font-size: 9.5px; font-weight: 700; margin-top: 2px; align-self: flex-start; white-space: nowrap; }
                
                .empty-cell { color: var(--text-muted); font-size: 16px; opacity: 0.25; }
                
                .date-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); gap: 8px; max-height: 150px; overflow-y: auto; padding-right: 5px; }
                .custom-date-btn { display: flex; align-items: center; justify-content: center; width: 100%; aspect-ratio: 1; border-radius: 10px; font-weight: 800; cursor: pointer; border: 2px solid var(--primary); color: var(--primary); background: transparent; transition: all 0.2s; margin: 0; font-size: 14px; font-family: 'Prompt'; }
                .btn-check:checked + .custom-date-btn { background: var(--primary); color: #fff; transform: scale(1.05); }
                
                .dynamic-modal-btn { background: var(--bg-surface); border: 1px solid color-mix(in srgb, var(--badge-color) 40%, transparent); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px; border-radius: 12px; cursor: pointer; }
                .dynamic-modal-btn, .dynamic-modal-btn span, .dynamic-modal-btn i { color: var(--badge-color) !important; -webkit-text-fill-color: var(--badge-color) !important;}
                
                .btn-check:checked + .dynamic-modal-btn { background-color: var(--badge-color) !important; border-color: var(--badge-color) !important; transform: scale(1.03); }
                .btn-check:checked + .dynamic-modal-btn, .btn-check:checked + .dynamic-modal-btn span, .btn-check:checked + .dynamic-modal-btn i { color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;}
                
                .shift-row-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 14px; padding: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
                .shift-radio-group .btn { border-radius: 8px !important; font-weight: 700 !important; font-family: 'Prompt'; padding: 6px 16px; border: 1px solid var(--border-color); }
                .shift-radio-group .btn-check:checked + .btn-outline-primary { background: var(--primary) !important; color: #ffffff !important; border-color: var(--primary) !important; }
                
                @media screen { .print-only-zone { display: none !important; } }
            </style>

            <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4 fade-in-up" id="ts-header" style="position: relative; z-index: 50;">
                <div>
                    <h2 class="page-title" style="font-weight: 800; color: var(--text-dark);">
                        <div class="d-inline-flex align-items-center justify-content-center rounded-4 shadow-sm me-2" style="width: 45px; height: 45px; background: linear-gradient(135deg, #10b981, #059669); color: white;">
                            <i class="fa-solid fa-calendar-check safe-icon"></i>
                        </div>
                        ตารางปฏิบัติงาน <span class="text-muted fw-normal" style="font-size: 20px;">(HR Timesheet)</span>
                    </h2>
                    <p class="text-muted mt-2 mb-0 fw-bold">บันทึกรอบฟอกไต ลงเวรย่อย และจัดการโควตาวันหยุด</p>
                </div>
                <div class="d-flex gap-2 align-items-center flex-wrap">
                    <button class="btn text-white fw-bold shadow-sm rounded-pill px-3 border-0" style="background: #8b5cf6;" onclick="window.ShiftSchedulePage.openMasterRosterModal()" title="ดูตาราง Master Roster สด">
                        <i class="fa-solid fa-table-cells me-2"></i> ดูตารางภาพรวม
                    </button>
                    
                    <button class="btn btn-info text-white fw-bold shadow-sm rounded-pill px-3 border-0" onclick="window.ShiftSchedulePage.openReportModal()">
                        <i class="fa-solid fa-chart-pie me-2"></i> รายงานสรุป
                    </button>
                    <button class="btn btn-primary text-white fw-bold shadow-sm rounded-pill px-3 border-0" onclick="window.ShiftSchedulePage.openStaffManager()">
                        <i class="fa-solid fa-users me-2"></i> จัดการพนักงาน
                    </button>
                    <button class="btn btn-secondary text-white fw-bold shadow-sm rounded-pill px-3 border-0" onclick="window.ShiftSchedulePage.openSettingsModal()">
                        <i class="fa-solid fa-gears me-2 text-warning"></i> ตั้งค่าองค์กร
                    </button>
                    
                    <div class="px-3 py-2 rounded-pill shadow-sm border border-2 border-primary-subtle d-flex align-items-center ms-2" style="background: var(--bg-surface);">
                        <i class="fa-regular fa-calendar text-primary me-2 safe-icon"></i>
                        <input type="month" id="timesheet-month-picker" class="border-0 fw-bold text-primary" style="outline: none; background: transparent; font-size: 15px; color-scheme: var(--color-scheme, light);" onchange="window.ShiftSchedulePage.changeMonth(this.value)">
                    </div>

                    <div class="d-flex gap-1 ms-2">
                        <button class="btn btn-success fw-bold px-3 shadow-sm border-0" onclick="window.ShiftSchedulePage.openExportOptionsModal('excel')" title="ดาวน์โหลดไฟล์ Excel">
                            <i class="fa-solid fa-file-excel me-1"></i> Excel
                        </button>
                        <button class="btn btn-danger fw-bold px-3 shadow-sm border-0" onclick="window.ShiftSchedulePage.openExportOptionsModal('pdf')" title="โหลดไฟล์ PDF ทันที">
                            <i class="fa-solid fa-file-pdf me-1"></i> PDF
                        </button>
                        <button class="btn btn-primary fw-bold px-3 shadow-sm border-0" onclick="window.ShiftSchedulePage.openExportOptionsModal('print')" title="พิมพ์ตารางกระดาษ A4">
                            <i class="fa-solid fa-print me-1"></i> พิมพ์
                        </button>
                    </div>

                    <button class="btn btn-outline-danger fw-bold shadow-sm rounded-pill px-4 ms-2 border-2" onclick="window.ShiftSchedulePage.clearMonthData()">
                        <i class="fa-solid fa-trash-can me-1"></i> ล้างข้อมูล
                    </button>
                </div>
            </div>

            <div class="d-flex flex-wrap gap-2 mb-3 fade-in-up" id="timesheet-legend" style="position: relative; z-index: 50;"></div>

            <div class="modern-panel shadow-sm p-3 position-relative overflow-hidden fade-in-up" id="ts-main-panel" style="background: var(--bg-surface); border-radius: 20px; border: 1px solid var(--border-color); z-index: 10;">
                <div class="timesheet-wrapper" id="timesheet-main-wrapper">
                    <table class="ts-table">
                        <thead id="ts-head"></thead>
                        <tbody id="ts-body">
                            <tr id="ts-loading-row">
                                <td colspan="50" class="text-center py-5 text-primary" style="background: transparent; border: none;">
                                    <div class="d-flex flex-column align-items-center justify-content-center" style="min-height: 250px;">
                                        <i class="fas fa-circle-notch fa-spin fa-3x mb-3"></i>
                                        <span class="fw-bold" style="font-family:'Prompt';">กำลังดึงข้อมูลเวรจากคลาวด์...</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div id="print-request-form-zone" class="print-only-zone"></div>
        `;
    }

    init() {
        if (typeof db === 'undefined') return;
        document.getElementById('timesheet-month-picker').value = this.currentMonth;
        this.loadInitialData();
    }

    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
    }

    parseFbArray(obj, defaultArr) {
        if (!obj) return defaultArr;
        if (Array.isArray(obj)) return obj.filter(Boolean);
        const vals = Object.values(obj).filter(Boolean);
        return vals.length > 0 ? vals : defaultArr;
    }

    async loadInitialData() {
        try {
            const cbSettings = db.ref('clinic_shift_settings_v2').on('value', snap => {
                const data = snap.val() || {};
                
                this.shiftTypes = this.parseFbArray(data.shift_types, [
                    { id: 'R1', label: 'รอบ 1', time: '06:00 - 10:00', bg: '#eff6ff', color: '#2563eb' },
                    { id: 'R2', label: 'รอบ 2', time: '10:00 - 14:00', bg: '#fffbeb', color: '#d97706' },
                    { id: 'R3', label: 'รอบ 3', time: '14:00 - 18:00', bg: '#f5f3ff', color: '#7c3aed' }
                ]);
                
                let rawLeaves = this.parseFbArray(data.leave_types, [
                    { id: 'OFF', label: 'วันหยุด (Off)', bg: '#f8fafc', color: '#64748b', quota: 0 },
                    { id: 'HOL', label: 'วันหยุดยาว/นักขัตฤกษ์', bg: '#fefce8', color: '#b45309', quota: 0 },
                    { id: 'VL', label: 'พักร้อน (VL)', bg: '#fdf4ff', color: '#c026d3', quota: 10 },
                    { id: 'AL', label: 'ลากิจ (AL)', bg: '#ecfdf5', color: '#059669', quota: 10 },
                    { id: 'SL', label: 'ลาป่วย (SL)', bg: '#fef2f2', color: '#dc2626', quota: 30 }
                ]);
                
                if (!rawLeaves.some(l => l.id === 'SUB')) {
                    rawLeaves.push({ id: 'SUB', label: 'ขึ้นแทน (SUB)', bg: '#f0f9ff', color: '#0284c7', quota: 0 });
                }
                this.leaveTypes = rawLeaves;

                this.customRoles = this.parseFbArray(data.roles, [
                    { id: 'doctor', name: 'แพทย์ (MD)', bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
                    { id: 'head_nurse', name: 'หัวหน้าพยาบาล', bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
                    { id: 'nurse', name: 'พยาบาล (RN)', bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' },
                    { id: 'assistant', name: 'ผู้ช่วย (PN/NA)', bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
                    { id: 'admin', name: 'แอดมิน (Admin)', bg: '#f8fafc', color: '#475569', border: '#cbd5e1' },
                    { id: 'orderly', name: 'เวรเปล', bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
                    { id: 'maid', name: 'แม่บ้าน', bg: '#fdf4ff', color: '#c026d3', border: '#fbcfe8' }
                ]);

                this.renderLegend();
                this.renderGrid(); 
            });
            this.firebaseListeners.push({ path: 'clinic_shift_settings_v2', callback: cbSettings });

            const cbUsers = db.ref('clinic_users_v2').on('value', snap => {
                const dataUsers = snap.val();
                let rawUsers = dataUsers ? (Array.isArray(dataUsers) ? dataUsers : Object.keys(dataUsers).map(k => ({ firebaseKey: k, ...dataUsers[k] }))) : [];
                
                this.staffList = rawUsers.filter(u => u && u.status === 'active').sort((a, b) => {
                    try {
                        let orderA = a.order !== undefined ? a.order : 9999;
                        let orderB = b.order !== undefined ? b.order : 9999;
                        if (orderA !== orderB) return orderA - orderB;

                        const roleWeight = { 'doctor': 1, 'head_nurse': 2, 'nurse': 3, 'assistant': 4, 'admin': 5, 'orderly': 6, 'maid': 7 };
                        const wA = roleWeight[a.role] || 99;
                        const wB = roleWeight[b.role] || 99;
                        if(wA !== wB) return wA - wB;
                        
                        let nameA = String(a.name || a.username || '').trim();
                        let nameB = String(b.name || b.username || '').trim();
                        return nameA.localeCompare(nameB, 'th');
                    } catch(err) { return 0; }
                });
                this.renderGrid();
            });
            this.firebaseListeners.push({ path: 'clinic_users_v2', callback: cbUsers });

            this.setupTimeDataListeners();
        } catch (e) { console.error("Init Data Error:", e); }
    }

    setupTimeDataListeners() {
        const pathTs = `clinic_timesheet_v2/${this.currentMonth}`;
        const cbTs = db.ref(pathTs).on('value', snap => {
            this.timesheetData = snap.val() || {};
            this.renderGrid();
        });
        this.firebaseListeners.push({ path: pathTs, callback: cbTs });

        const pathUsage = `clinic_leave_usage_v2/${this.currentYear}`;
        const cbUsage = db.ref(pathUsage).on('value', snap => {
            this.yearlyLeaveUsage = snap.val() || {};
            this.renderGrid();
        });
        this.firebaseListeners.push({ path: pathUsage, callback: cbUsage });

        const pathQuotas = `clinic_leave_quotas_v2/${this.currentYear}`;
        const cbQuotas = db.ref(pathQuotas).on('value', snap => {
            this.staffCustomQuotas = snap.val() || {};
            this.renderGrid();
        });
        this.firebaseListeners.push({ path: pathQuotas, callback: cbQuotas });
    }

    changeMonth(newMonth) {
        if(!newMonth || this.currentMonth === newMonth) return;
        this.currentMonth = newMonth;
        this.currentYear = newMonth.slice(0, 4);
        
        let tbody = document.getElementById('ts-body');
        if(tbody) tbody.innerHTML = `<tr><td colspan="50" class="text-center py-5 text-primary" style="background:transparent; border:none;"><div class="d-flex flex-column align-items-center justify-content-center" style="min-height:250px;"><i class="fas fa-circle-notch fa-spin fa-3x mb-3"></i><span class="fw-bold" style="font-family:'Prompt';">กำลังเชื่อมต่อฐานข้อมูลเดือนใหม่...</span></div></td></tr>`;

        this.destroy(); 
        this.loadInitialData(); 
    }

    clearMonthData() {
        Swal.fire({
            title: '<h4 class="text-danger fw-bold"><i class="fa-solid fa-broom me-2"></i> จัดการข้อมูลเวรและวันลา</h4>',
            html: `
                <div class="text-start" style="font-family:'Prompt';">
                    <p class="small text-muted mb-3">เลือกการดำเนินการที่ต้องการสำหรับเดือน <b>${this.currentMonth}</b> หรือสั่งซ่อมแซมข้อมูลโควตาที่ค้างในระบบ</p>
                    
                    <button class="btn btn-outline-danger w-100 mb-2 fw-bold text-start p-3 shadow-sm rounded-4" onclick="Swal.close(); setTimeout(()=>window.ShiftSchedulePage.executeClearMonth(), 300)">
                        <div class="d-flex align-items-center">
                            <div class="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width:40px;height:40px;"><i class="fa-solid fa-trash-can"></i></div>
                            <div>
                                <div class="fs-6">ล้างตารางเวรเดือนนี้</div>
                                <div class="small fw-normal opacity-75">ลบเวรทั้งหมด และ คืนสิทธิ์วันลาให้อัตโนมัติ</div>
                            </div>
                        </div>
                    </button>

                    <button class="btn btn-outline-warning w-100 fw-bold text-start p-3 shadow-sm rounded-4" onclick="Swal.close(); setTimeout(()=>window.ShiftSchedulePage.executeSyncYearlyLeaves(), 300)">
                        <div class="d-flex align-items-center">
                            <div class="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center me-3" style="width:40px;height:40px;"><i class="fa-solid fa-screwdriver-wrench"></i></div>
                            <div>
                                <div class="fs-6 text-dark">ซ่อมแซมโควตาวันลา (Sync)</div>
                                <div class="small text-dark fw-normal opacity-75">แก้ปัญหาโควตาค้าง คำนวณใหม่จากประวัติทั้งปี</div>
                            </div>
                        </div>
                    </button>
                </div>
            `,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'ยกเลิก',
            background: 'var(--bg-surface)',
            customClass: { popup: 'premium-alert' }
        });
    }

    async executeClearMonth() {
        Swal.fire({
            title: 'ยืนยันการล้างข้อมูล?',
            text: `ตารางเวรเดือน ${this.currentMonth} จะถูกลบ และวันลาที่เคยกดไว้จะถูกคืนสิทธิ์ให้พนักงานทั้งหมด!`,
            icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#cbd5e1',
            confirmButtonText: '<i class="fa-solid fa-trash-can me-1"></i> ยืนยันล้างข้อมูล', cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'premium-alert' }
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({ title: 'กำลังล้างข้อมูลและคืนโควตา...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: 'var(--bg-surface)' });
                try {
                    let updates = {};
                    updates[`clinic_timesheet_v2/${this.currentMonth}`] = null;
                    
                    if (this.timesheetData) {
                        for (const [staffUname, daysData] of Object.entries(this.timesheetData)) {
                            let refundCounts = {};
                            for (const [dateStr, rawStatus] of Object.entries(daysData)) {
                                if (!rawStatus) continue;
                                let statusIds = String(rawStatus).split(',');
                                statusIds.forEach(id => {
                                    let cleanId = String(id).includes('_') ? String(id).split('_')[0] : (String(id).includes('|') ? String(id).split('|')[0] : String(id));
                                    if (this.leaveTypes.some(l => l.id === cleanId && Number(l.quota) > 0)) {
                                        refundCounts[cleanId] = (refundCounts[cleanId] || 0) + 1;
                                    }
                                });
                            }
                            for (const [leaveId, refundAmt] of Object.entries(refundCounts)) {
                                let currentUsed = (this.yearlyLeaveUsage[staffUname] && this.yearlyLeaveUsage[staffUname][leaveId]) ? Number(this.yearlyLeaveUsage[staffUname][leaveId]) : 0;
                                let newUsed = Math.max(0, currentUsed - refundAmt);
                                updates[`clinic_leave_usage_v2/${this.currentYear}/${staffUname}/${leaveId}`] = newUsed;
                            }
                        }
                    }
                    await db.ref().update(updates);
                    Swal.fire({ title: 'ล้างข้อมูลและคืนสิทธิ์สำเร็จ!', icon: 'success', timer: 1500, showConfirmButton: false });
                } catch (err) { Swal.fire('เกิดข้อผิดพลาด', err.message, 'error'); }
            }
        });
    }

    async executeSyncYearlyLeaves() {
        Swal.fire({ title: 'กำลังประมวลผล...', html: 'ระบบกำลังอ่านประวัติการลาตั้งแต่เดือนมกราคม เพื่อปรับปรุงโควตาให้ถูกต้อง 100%<br>กรุณารอสักครู่...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: 'var(--bg-surface)' });
        try {
            const snap = await db.ref('clinic_timesheet_v2').once('value');
            const allTimesheets = snap.val() || {};
            let newUsage = {};
            
            for (const [monthKey, monthData] of Object.entries(allTimesheets)) {
                if (monthKey.startsWith(this.currentYear)) {
                    for (const [staffUname, daysData] of Object.entries(monthData)) {
                        if (!newUsage[staffUname]) newUsage[staffUname] = {};
                        
                        for (const [dateStr, rawStatus] of Object.entries(daysData)) {
                            if (!rawStatus) continue;
                            let statusIds = String(rawStatus).split(',');
                            statusIds.forEach(id => {
                                let cleanId = String(id).includes('_') ? String(id).split('_')[0] : (String(id).includes('|') ? String(id).split('|')[0] : String(id));
                                if (this.leaveTypes.some(l => l.id === cleanId && Number(l.quota) > 0)) {
                                    newUsage[staffUname][cleanId] = (newUsage[staffUname][cleanId] || 0) + 1;
                                }
                            });
                        }
                    }
                }
            }
            
            if (Object.keys(newUsage).length === 0) {
                await db.ref(`clinic_leave_usage_v2/${this.currentYear}`).remove();
            } else {
                await db.ref(`clinic_leave_usage_v2/${this.currentYear}`).set(newUsage);
            }
            
            Swal.fire({ title: 'ซ่อมแซมโควตาสำเร็จ!', text: 'โควตาวันลาทั้งหมดถูกเคลียร์และปรับให้ตรงตามความจริง 100% แล้ว', icon: 'success', background: 'var(--bg-surface)', customClass: { popup: 'premium-alert' } });
        } catch(err) {
            Swal.fire('ข้อผิดพลาด', err.message, 'error');
        }
    }

    getDaysInMonth(monthStr) {
        const [year, month] = monthStr.split('-');
        return new Date(year, month, 0).getDate();
    }

    getStaffQuotaLimit(username, leaveId) {
        if (!username || !leaveId) return 0;
        if (this.staffCustomQuotas[username] && this.staffCustomQuotas[username][leaveId] !== undefined) {
            return Number(this.staffCustomQuotas[username][leaveId]);
        }
        let globalLeave = this.leaveTypes.find(l => l.id === leaveId);
        return globalLeave ? Number(globalLeave.quota) : 0;
    }

    renderLegend() {
        const container = document.getElementById('timesheet-legend');
        if(!container) return;
        let html = '<span class="text-muted fw-bold small mt-1 me-2"><i class="fa-solid fa-circle-info me-1"></i> รอบปฏิบัติงาน/ลงเวรย่อย:</span>';
        
        this.shiftTypes.forEach(s => {
            if(!s) return;
            let timeInfo = s.time ? ` (${s.time})` : '';
            html += `<span class="badge shadow-sm dynamic-badge status-badge-legend" style="--badge-bg:${s.bg}; --badge-color:${s.color}; font-size:12px; padding:6px 10px; display:inline-block; width:auto; min-height:auto;">${this.escapeHTML(s.label)}${timeInfo}</span>`;
        });
        
        html += `<span class="badge shadow-sm status-badge-off" style="font-size:12px; padding:6px 10px; display:inline-block; width:auto; min-height:auto;"><i class="fa-solid fa-bed me-1"></i> ลงเวรย่อย</span>`;
        
        html += '<span class="text-muted fw-bold small mt-1 ms-3 me-2"><i class="fa-solid fa-suitcase-rolling me-1"></i> สถานะพิเศษ/วันหยุด:</span>';
        this.leaveTypes.forEach(l => {
            if(!l) return;
            let quotaText = Number(l.quota) > 0 ? ` (โควตา ${l.quota})` : '';
            html += `<span class="badge shadow-sm dynamic-badge status-badge-legend" style="--badge-bg:${l.bg}; --badge-color:${l.color}; font-size:12px; padding:6px 10px; display:inline-block; width:auto; min-height:auto;">${this.escapeHTML(l.label)}${quotaText}</span>`;
        });

        container.innerHTML = html;
    }

    renderGrid() {
        const thead = document.getElementById('ts-head');
        const tbody = document.getElementById('ts-body');
        if (!thead || !tbody) return;

        const daysInMonth = this.getDaysInMonth(this.currentMonth);
        const [year, month] = this.currentMonth.split('-');
        const totalCols = daysInMonth + 2;

        let headHtml = `<tr><th class="sticky-col shadow-sm p-3">
            <div class="d-flex align-items-center">
                <div class="d-flex align-items-center justify-content-center rounded-3 bg-primary text-white me-3 flex-shrink-0" style="width:38px; height:38px; box-shadow: 0 4px 10px rgba(37,99,235,0.3);">
                    <i class="fa-solid fa-users-viewfinder fs-5"></i>
                </div>
                <div class="d-flex flex-column align-items-start">
                    <span class="fw-bold text-dark" style="font-family:'Prompt'; font-size:14px; line-height:1.2;">รายชื่อพนักงาน</span>
                    <span class="text-muted fw-bold" style="font-size:9.5px; letter-spacing:0.5px;">STAFF DIRECTORY</span>
                </div>
            </div>
        </th>`;

        for (let day = 1; day <= daysInMonth; day++) {
            let dateObj = new Date(year, month - 1, day);
            let dayName = this.thaiFullDays[dateObj.getDay()]; 
            let isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
            
            headHtml += `
                <th class="${isWeekend ? 'weekend-header' : ''}">
                    <div class="day-header"><span class="day-num">${day}</span><span class="day-name">${dayName}</span></div>
                </th>`;
        }
        headHtml += `<th style="min-width:200px;"><i class="fa-solid fa-chart-pie text-success me-1"></i> สรุป (ทำงาน & สถานะพิเศษ)</th></tr>`;
        thead.innerHTML = headHtml;

        if (this.staffList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${totalCols}" class="text-center py-5 text-muted">
                <div class="d-flex flex-column align-items-center justify-content-center" style="min-height: 150px;">
                    <i class="fa-solid fa-folder-open fa-3x mb-3 text-secondary" style="opacity:0.5;"></i>
                    <span class="fw-bold fs-5">ยังไม่มีข้อมูลพนักงาน</span>
                </div>
            </td></tr>`;
            return;
        }

        let bodyHtml = '';
        this.staffList.forEach(staff => {
            if (!staff || (!staff.username && !staff.firebaseKey)) return; 

            let rowHtml = `<tr>`;
            try {
                let roleConf = this.customRoles.find(r => r.id === staff.role) || { name: 'ไม่มีตำแหน่ง', bg: '#f8fafc', color: '#64748b' };
                let safeName = String(staff.name || staff.username || 'ไม่ระบุ').trim();
                let staffInitial = safeName.charAt(0).toUpperCase();
                let staffUname = staff.username || staff.firebaseKey;
                
                let avatarStyle = `background: ${roleConf.color}; box-shadow: 0 4px 10px color-mix(in srgb, ${roleConf.color} 40%, transparent);`;
                let staffRoleName = `<span class="role-badge dynamic-badge mt-0" style="--badge-bg:${roleConf.bg}; --badge-color:${roleConf.color};">${this.escapeHTML(roleConf.name)}</span>`;

                rowHtml += `
                    <td class="sticky-col p-2">
                        <div class="staff-card-cell">
                            <div class="staff-avatar" style="${avatarStyle}">${staffInitial}</div>
                            <div class="staff-info-container">
                                <div class="fw-bold text-dark mb-1" style="font-family:'Prompt'; font-size:13.5px; white-space:normal; word-break:break-word; line-height:1.2;" title="${this.escapeHTML(safeName)}">${this.escapeHTML(safeName)}</div>
                                <div>${staffRoleName}</div>
                            </div>
                            <button class="btn btn-sm border p-0 rounded-circle text-muted flex-shrink-0 d-flex align-items-center justify-content-center settings-btn-hover" style="width:28px; height:28px;" onclick="window.ShiftSchedulePage.openIndividualQuotaModal('${staffUname}', '${this.escapeHTML(safeName)}')"><i class="fa-solid fa-sliders" style="font-size:11px;"></i></button>
                        </div>
                    </td>
                `;

                let workRoundsCount = 0;

                for (let day = 1; day <= daysInMonth; day++) {
                    let dateStr = `${this.currentMonth}-${String(day).padStart(2, '0')}`;
                    let rawData = this.timesheetData[staffUname]?.[dateStr] || '';
                    let statusIds = rawData ? String(rawData).split(',') : [];
                    let cellContent = '';

                    statusIds.forEach(sid => {
                        if (String(sid).startsWith('RMK_')) return; 

                        let isRoundOff = String(sid).endsWith('_O');
                        let isRoundWork = String(sid).endsWith('_W');
                        let cleanId = String(sid).includes('_') ? String(sid).split('_')[0] : (String(sid).includes('|') ? String(sid).split('|')[0] : String(sid));
                        
                        let isWorkShift = this.shiftTypes.some(s => s.id === cleanId);
                        let conf = isWorkShift ? this.shiftTypes.find(s => s.id === cleanId) : this.leaveTypes.find(l => l.id === cleanId);
                        
                        if (conf) {
                            if (isWorkShift) {
                                if (isRoundWork || (!isRoundOff && !String(sid).includes('_'))) { 
                                    let timeHtml = conf.time ? `<span class="status-time" style="color:inherit;">${this.escapeHTML(conf.time)}</span>` : '';
                                    cellContent += `<div class="status-badge dynamic-badge" style="--badge-bg:${conf.bg}; --badge-color:${conf.color};"><span class="status-text">${this.escapeHTML(conf.label)}</span>${timeHtml}</div>`;
                                    workRoundsCount++; 
                                } else if (isRoundOff) {
                                    cellContent += `<div class="status-badge status-badge-off"><span class="status-text">${this.escapeHTML(conf.label)}<br>(ลงเวร)</span></div>`;
                                }
                            } else {
                                cellContent += `<div class="status-badge dynamic-badge" style="--badge-bg:${conf.bg}; --badge-color:${conf.color};"><span class="status-text"><i class="fa-solid fa-suitcase-rolling me-1" style="font-size:8px;"></i> ${this.escapeHTML(conf.label)}</span></div>`;
                            }
                        }
                    });

                    if (cellContent === '') {
                        cellContent = `<i class="fa-solid fa-plus empty-cell mt-1"></i>`;
                    }

                    rowHtml += `<td onclick="window.ShiftSchedulePage.openBatchModal('${staffUname}', '${dateStr}')">${cellContent}</td>`;
                }

                let summaryHtml = `<div class="d-flex flex-column gap-1">`;
                summaryHtml += `<div class="quota-box dynamic-badge" style="--badge-bg:var(--primary); --badge-color:#fff;" title="นับเฉพาะการลงเวรในเดือนนี้"><span>เข้ากะทำงาน (เดือนนี้)</span> <span>${workRoundsCount} รอบ</span></div>`;
                
                this.leaveTypes.forEach(l => {
                    let limit = this.getStaffQuotaLimit(staffUname, l.id);
                    if (limit > 0 || ['OFF', 'HOL', 'SUB'].includes(l.id)) {
                        let used = (this.yearlyLeaveUsage[staffUname] && this.yearlyLeaveUsage[staffUname][l.id]) ? Number(this.yearlyLeaveUsage[staffUname][l.id]) : 0;
                        let remain = limit - used;
                        let bgVar = (remain > 0 || limit === 0) ? l.bg : '#fee2e2';
                        let colVar = (remain > 0 || limit === 0) ? l.color : '#dc2626';
                        let extraClass = (remain > 0 || limit === 0) ? '' : 'quota-full';
                        
                        let quotaDisplay = limit > 0 
                            ? `<div class="text-end" style="line-height:1.1;">${used}/${limit} <span style="font-size:7.5px; opacity:0.7;">(ทั้งปี)</span><br><span style="font-size:8.5px;">เหลือ ${remain}</span></div>` 
                            : `<div class="text-end" style="line-height:1.1;">${used} วัน <span style="font-size:7.5px; opacity:0.7;"><br>(สะสมทั้งปี)</span></div>`;
                            
                        summaryHtml += `<div class="quota-box dynamic-badge ${extraClass}" style="--badge-bg:${bgVar}; --badge-color:${colVar};" title="ยอดรวมการใช้โควตานี้ตลอดทั้งปี ${this.currentYear}"><span>${this.escapeHTML(l.label)}</span> ${quotaDisplay}</div>`;
                    }
                });
                summaryHtml += `</div>`;

                rowHtml += `<td>${summaryHtml}</td></tr>`;
                bodyHtml += rowHtml;
            } catch (err) {
                console.error("Staff rendering error skipped:", err);
            }
        });

        if(bodyHtml === '') {
            tbody.innerHTML = `<tr><td colspan="${totalCols}" class="text-center py-5 text-danger fw-bold"><i class="fa-solid fa-triangle-exclamation mb-2 fa-2x"></i><br>ระบบพบปัญหาในการดึงชื่อพนักงานบางท่าน โปรดตรวจสอบฐานข้อมูล</td></tr>`;
        } else {
            tbody.innerHTML = bodyHtml;
        }
    }

    openExportOptionsModal(mode) {  
        let roleCheckboxes = ``;
        this.customRoles.forEach(r => {
            roleCheckboxes += `
                <div class="form-check mb-2">
                    <input class="form-check-input role-print-cb" type="checkbox" value="${r.id}" id="cb_role_${r.id}" checked>
                    <label class="form-check-label fw-bold ms-2" for="cb_role_${r.id}" style="cursor:pointer;">
                        ${this.escapeHTML(r.name)}
                    </label>
                </div>
            `;
        });

        let titleStr = '', btnIcon = '', btnColor = '';
        if(mode === 'excel') { titleStr = '<i class="fa-solid fa-file-excel text-success me-2"></i>ดาวน์โหลด Excel'; btnIcon = '<i class="fa-solid fa-download me-1"></i> สร้าง Excel'; btnColor = '#10b981'; } 
        else if (mode === 'pdf') { titleStr = '<i class="fa-solid fa-file-pdf text-danger me-2"></i>ดาวน์โหลด PDF'; btnIcon = '<i class="fa-solid fa-download me-1"></i> สร้าง PDF'; btnColor = '#ef4444'; } 
        else { titleStr = '<i class="fa-solid fa-print text-primary me-2"></i>พิมพ์กระดานเวรรวม'; btnIcon = '<i class="fa-solid fa-print me-1"></i> สั่งพิมพ์'; btnColor = '#2563eb'; }

        Swal.fire({
            title: `<h4 class="fw-bold mb-0 text-dark" style="font-family:'Prompt';">${titleStr}</h4>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Prompt';">
                    <div class="p-3 border rounded bg-light">
                        <div class="fw-bold small mb-2 text-primary"><i class="fa-solid fa-filter me-1"></i> เลือกกลุ่มพนักงาน:</div>
                        <div class="d-flex justify-content-between mb-3 pb-2 border-bottom">
                            <button class="btn btn-sm btn-outline-secondary py-1 px-2 text-xs fw-bold" onclick="document.querySelectorAll('.role-print-cb').forEach(c=>c.checked=true)">✓ เลือกทั้งหมด</button>
                            <button class="btn btn-sm btn-outline-danger py-1 px-2 text-xs fw-bold" onclick="document.querySelectorAll('.role-print-cb').forEach(c=>c.checked=false)">✕ ล้างทั้งหมด</button>
                        </div>
                        <div style="max-height: 200px; overflow-y:auto; padding-right:5px;">
                            ${roleCheckboxes}
                        </div>
                    </div>
                </div>
            `,
            background: 'var(--bg-surface)', showCancelButton: true, cancelButtonText: 'ยกเลิก', confirmButtonText: btnIcon, confirmButtonColor: btnColor,
            preConfirm: () => {
                let selectedRoles = Array.from(document.querySelectorAll('.role-print-cb:checked')).map(cb => cb.value);
                if(selectedRoles.length === 0) { Swal.showValidationMessage('กรุณาติ๊กเลือกอย่างน้อย 1 ตำแหน่ง'); return false; }
                return { selectedRoles };
            }
        }).then((res) => {
            if (res.isConfirmed) {
                if (mode === 'excel') window.ShiftSchedulePage.generateExcelFile(res.value.selectedRoles);
                else if (mode === 'pdf') window.ShiftSchedulePage.generatePDFFile(res.value.selectedRoles);
                else window.ShiftSchedulePage.executePrint(res.value.selectedRoles);
            }
        });
    }

    openMasterRosterModal() {
        Swal.fire({ title: 'กำลังประมวลผลตาราง...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: 'var(--bg-surface)' });
        
        setTimeout(() => {
            try {
                let allRoles = this.customRoles.map(r => r.id);
                let chunks = this.getExportHTMLChunks(allRoles, false);
                
                let contentHtml = chunks.map(chunk => `
                    <div style="background: #ffffff; padding: 15px; margin-bottom: 20px; box-shadow: 0 4px 15px -3px rgba(0,0,0,0.1); border-radius: 8px; min-width: 1000px; text-align: left; overflow: hidden; border: 1px solid #e2e8f0;">
                        ${chunk.replace('height: 98vh;', '')}
                    </div>
                `).join('');

                Swal.fire({
                    title: '<div class="text-start"><h4 class="fw-bold mb-0 text-dark" style="font-family:\'Prompt\';"><i class="fa-solid fa-table-cells text-primary me-2"></i> ตารางปฏิบัติงานภาพรวม (Master Roster Preview)</h4></div>',
                    html: `<div style="overflow-x: auto; overflow-y: auto; max-height: 75vh; background: #f1f5f9; padding: 20px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; border: 1px inset var(--border-color);">
                                ${contentHtml}
                           </div>`,
                    width: '96%',
                    background: 'var(--bg-surface)',
                    showCloseButton: true,
                    showConfirmButton: false,
                    customClass: { popup: 'premium-alert' }
                });
            } catch (err) {
                console.error(err);
                Swal.fire('ข้อผิดพลาด', 'ไม่สามารถแสดงตารางได้: ' + err.message, 'error');
            }
        }, 500); 
    }

    // 🚨 THE FIX: อัปเกรดระบบ Export HTML ให้คอลัมน์ขวาสุดคำนวณวันหยุดรายเดือนแทนการปล่อยว่าง
    getExportHTMLChunks(selectedRoles, isPDF = false) {
        selectedRoles = selectedRoles || this.customRoles.map(r => r.id);
        
        const daysInMonth = this.getDaysInMonth(this.currentMonth);
        const [year, month] = this.currentMonth.split('-');
        let monthTh = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"][parseInt(month)-1];
        let yearTh = parseInt(year) + 543;
        
        let targetStaff = this.staffList.filter(s => selectedRoles.includes(s.role));

        let workShifts = this.shiftTypes.filter(s => s.id !== 'OFF' && s.id !== 'HOL');
        let shiftCount = Math.max(workShifts.length, 1);

        let thDays = '';
        for (let day = 1; day <= daysInMonth; day++) {
            let dateObj = new Date(year, month - 1, day);
            let dayName = this.thaiFullDays[dateObj.getDay()]; 
            let bgStyle = (dateObj.getDay() === 0 || dateObj.getDay() === 6) ? 'background-color:#e2e8f0 !important;' : 'background-color:#ffffff !important;';
            thDays += `<th style="${bgStyle} border:1px solid #000 !important; padding:2px 0px; width:2.35%; text-align:center; line-height:1.1; overflow:hidden;"><span style="font-size:11.5px;font-weight:800;color:#000000 !important;">${day}</span><br><span style="font-size:8px;font-weight:800;color:#0f172a !important;display:inline-block;margin-top:1px;letter-spacing:-0.3px;">${dayName}</span></th>`;
        }

        const CHUNK_SIZE = 10;
        let staffChunks = [];
        for (let i = 0; i < targetStaff.length; i += CHUNK_SIZE) staffChunks.push(targetStaff.slice(i, i + CHUNK_SIZE));
        if (staffChunks.length === 0) staffChunks = [[]]; 

        let legendArr = [];
        this.shiftTypes.filter(s => s.id !== 'OFF' && s.id !== 'HOL').forEach(s => legendArr.push(`<b style="color:${s.color} !important;">${s.id}</b> = <span style="color:#000000 !important;">${s.label}</span>`));
        this.leaveTypes.forEach(l => legendArr.push(`<b style="color:${l.color} !important;">${l.id}</b> = <span style="color:#000000 !important;">${l.label}</span>`));
        let legendHtml = legendArr.join(' &nbsp;|&nbsp; ');

        let htmlChunks = [];
        let containerStyle = isPDF 
            ? "width: 1122px; padding: 10mm; box-sizing: border-box; font-family: 'Sarabun', 'Prompt', sans-serif; background-color: #ffffff !important; color: #000000 !important; display: flex; flex-direction: column; color-scheme: light !important;"
            : "width: 100%; height: 98vh; padding: 3mm 4mm; box-sizing: border-box; font-family: 'Sarabun', 'Prompt', sans-serif; background-color: #ffffff !important; color: #000000 !important; display: flex; flex-direction: column; color-scheme: light !important;";

        staffChunks.forEach((chunk, pageIndex) => {
            let tableRows = '';
            if (chunk.length === 0) { tableRows = `<tr><td colspan="${daysInMonth + 4}" style="text-align:center; padding:25px; font-weight:bold; border:1px solid #000 !important; color:#000000 !important; background-color:#ffffff !important;">ไม่มีข้อมูลพนักงาน</td></tr>`; } 
            else {
                chunk.forEach((staff, chunkIdx) => {
                    let globalIdx = (pageIndex * 10) + chunkIdx + 1; 
                    let staffUname = staff.username || staff.firebaseKey;
                    let roleObj = this.customRoles.find(r => r.id === staff.role) || { name: 'ไม่ระบุ' };
                    
                    // 🌟 คำนวณสรุปการหยุดเฉพาะเดือนปัจจุบันให้พนักงานคนนี้
                    let leaveCounts = {};
                    let totalOffDays = 0;
                    for (let day = 1; day <= daysInMonth; day++) {
                        let dateStr = `${this.currentMonth}-${String(day).padStart(2, '0')}`;
                        let rawData = this.timesheetData[staffUname]?.[dateStr] || '';
                        let statusIds = rawData ? String(rawData).split(',') : [];
                        let fullDayLeaveId = statusIds.find(id => this.leaveTypes.some(l => l.id === id));
                        if (fullDayLeaveId) {
                            leaveCounts[fullDayLeaveId] = (leaveCounts[fullDayLeaveId] || 0) + 1;
                            totalOffDays++;
                        }
                    }

                    let leaveSummaryHtml = '';
                    this.leaveTypes.forEach(lType => {
                        if (leaveCounts[lType.id]) {
                            leaveSummaryHtml += `<div style="font-size:9.5px; line-height: 1.3; text-align:left;"><b style="color:${lType.color} !important;">${lType.label}:</b> ${leaveCounts[lType.id]}</div>`;
                        }
                    });
                    if (!leaveSummaryHtml) {
                        leaveSummaryHtml = `<div style="font-size:9.5px; color:#94a3b8 !important; text-align:center; margin-top:10px;">ไม่มีวันหยุด</div>`;
                    } else {
                        leaveSummaryHtml += `<div style="font-size:10px; font-weight:bold; margin-top:4px; border-top:1px dashed #cbd5e1; padding-top:4px; color:#0f172a !important; text-align:left;">รวมหยุด: <span style="color:#ef4444 !important;">${totalOffDays} วัน</span></div>`;
                    }
                    
                    workShifts.forEach((shift, sIdx) => {
                        tableRows += `<tr>`;
                        if(sIdx === 0) {
                            tableRows += `<td rowspan="${shiftCount}" style="border:1px solid #000 !important; background-color:#ffffff !important; text-align:center; font-weight:bold; font-size:11px; color:#000000 !important;">${globalIdx}</td>`;
                            tableRows += `
                                <td rowspan="${shiftCount}" style="border:1px solid #000 !important; background-color:#ffffff !important; text-align:left; padding:4px; vertical-align:middle; overflow:hidden;">
                                    <div style="font-size:10.5px; font-weight:bold; color:#000000 !important; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${this.escapeHTML(staff.name || staff.username)}</div>
                                    <div style="font-size:8.5px; color:#475569 !important; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;"><i class="fa-solid fa-id-badge me-1" style="font-size:7px; color:#94a3b8 !important;"></i>${this.escapeHTML(roleObj.name)}</div>
                                </td>`;
                        }
                        tableRows += `<td style="border:1px solid #000 !important; font-weight:bold; background-color:#f8fafc !important; font-size:10px; text-align:center; color:#000000 !important; height:19px;">${this.escapeHTML(shift.label)}</td>`;

                        for (let day = 1; day <= daysInMonth; day++) {
                            let dateStr = `${this.currentMonth}-${String(day).padStart(2, '0')}`;
                            let rawData = this.timesheetData[staffUname]?.[dateStr] || '';
                            let statusIds = rawData ? String(rawData).split(',') : [];
                            
                            let cellText = ''; let cellColor = '#000000';
                            let cellBg = (new Date(year, month - 1, day).getDay() === 0 || new Date(year, month - 1, day).getDay() === 6) ? '#f1f5f9' : '#ffffff'; 

                            let fullDayLeaveId = statusIds.find(id => this.leaveTypes.some(l => l.id === id));

                            if (fullDayLeaveId) {
                                let leaveConf = this.leaveTypes.find(l => l.id === fullDayLeaveId);
                                cellText = leaveConf.id; 
                                cellColor = leaveConf.color;
                                cellBg = leaveConf.bg || cellBg; 
                            } else {
                                let shiftW = `${shift.id}_W`;
                                let oldShiftFormat = statusIds.find(id => String(id).split('|')[0] === shift.id && !String(id).includes('_O'));
                                if (statusIds.includes(shiftW) || oldShiftFormat) { cellText = '1'; cellColor = '#2563eb'; }
                            }

                            tableRows += `<td style="border:1px solid #000 !important; background-color:${cellBg} !important; color:${cellColor} !important; font-weight:bold; text-align:center; vertical-align:middle; padding:0; font-size:10.5px; height:19px;">${cellText}</td>`;
                        }
                        
                        // 🌟 ยัด HTML สรุปวันหยุดลงไปในช่องสุดท้าย
                        if(sIdx === 0) {
                            tableRows += `<td rowspan="${shiftCount}" style="border:1px solid #000 !important; background-color:#ffffff !important; color:#000000 !important; padding:4px; vertical-align:top;">${leaveSummaryHtml}</td>`;
                        }
                        tableRows += `</tr>`;
                    });
                });
            }

            let pageHtml = `
                <div style="${containerStyle}" data-bs-theme="light">
                    <div style="text-align:center; margin-bottom:5px; color:#000000 !important; flex-shrink: 0; background-color:#ffffff !important;">
                        <h2 style="font-size:18px; font-weight:bold; margin:0 0 2px 0; color:#000000 !important;">ตารางขอเวร - ตารางปฏิบัติงานรวมประจำเดือน (Master Matrix Roster)</h2>
                        <p style="font-size:13px; margin:0; color:#000000 !important;">ประจำเดือน: <b style="color:#000000 !important;">${monthTh} ${yearTh}</b> (แผ่นที่ ${pageIndex + 1}/${staffChunks.length})</p>
                    </div>
                    <table style="width:100%; flex-grow: 1; border-collapse:collapse; table-layout:fixed; margin-top: 2px; background-color:#ffffff !important; color:#000000 !important;">
                        <thead>
                            <tr>
                                <th style="border:1px solid #000 !important; background-color:#f1f5f9 !important; text-align:center; font-weight:bold; font-size:10px; color:#000000 !important; width:2%;">ที่</th>
                                <th style="border:1px solid #000 !important; background-color:#f1f5f9 !important; text-align:center; font-size:10px; color:#000000 !important; width:14%;">ชื่อ-นามสกุล / ตำแหน่ง</th>
                                <th style="border:1px solid #000 !important; background-color:#f1f5f9 !important; text-align:center; font-size:10px; color:#000000 !important; width:3%;">กะ</th>
                                ${thDays}
                                <th style="border:1px solid #000 !important; background-color:#f1f5f9 !important; text-align:center; font-size:11px; font-weight:bold; color:#000000 !important; width:auto; white-space:normal;">สรุปวันหยุด</th>
                            </tr>
                        </thead>
                        <tbody style="background-color:#ffffff !important;">${tableRows}</tbody>
                    </table>
                    <div style="margin-top: auto; padding-top: 4px; font-size: 10px; color: #1e293b !important; background-color: #f8fafc !important; border: 1px solid #cbd5e1 !important; padding: 4px; border-radius: 4px; flex-shrink: 0; page-break-inside: avoid;">
                        <b style="color:#000000 !important;">คำอธิบายสัญลักษณ์:</b> ${legendHtml}
                    </div>
                </div>`;
            htmlChunks.push(pageHtml);
        });

        return htmlChunks;
    }

    executePrint(selectedRoles) {
        selectedRoles = selectedRoles || this.customRoles.map(r => r.id);
        let printZone = document.getElementById('print-request-form-zone');
        if (!printZone) return;

        let chunks = this.getExportHTMLChunks(selectedRoles, false);
        let printHtml = chunks.join('<div style="page-break-before: always;"></div>');
        
        let oldIframe = document.getElementById('hidden-print-frame'); 
        if (oldIframe) { oldIframe.remove(); }
        
        let iframe = document.createElement('iframe'); 
        iframe.id = 'hidden-print-frame'; 
        iframe.style.position = 'fixed'; 
        iframe.style.right = '0'; 
        iframe.style.bottom = '0'; 
        iframe.style.width = '1px'; 
        iframe.style.height = '1px'; 
        iframe.style.border = '0'; 
        document.body.appendChild(iframe);
        
        let doc = iframe.contentWindow.document; 
        doc.open(); 
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title></title> 
                <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
                <style>
                    @page { size: A4 landscape !important; margin: 5mm !important; }
                    body { background-color: #ffffff !important; margin: 0; padding: 0; color: #000; font-family: 'Sarabun', sans-serif; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; box-sizing: border-box !important; }
                </style>
            </head>
            <body>
                <div style="width: 100%; margin: 0;">
                    ${printHtml}
                </div>
            </body>
            </html>
        `); 
        doc.close();

        Swal.fire({ title: 'กำลังเตรียมหน้าต่างพิมพ์...', html: 'กรุณารอสักครู่ เบราว์เซอร์กำลังโหลด...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

        iframe.onload = () => {
            Swal.close();
            try {
                iframe.contentWindow.focus(); 
                iframe.contentWindow.print(); 
            } catch(e) {
                console.error("Print execution failed:", e);
                Swal.fire('ข้อผิดพลาด', 'ระบบพิมพ์ถูกบล็อก กรุณากดยอมรับ Popup', 'error');
            }
            setTimeout(() => {
                if(document.getElementById('hidden-print-frame')) {
                    document.getElementById('hidden-print-frame').remove();
                }
            }, 60000); 
        };
    }

    async generatePDFFile(selectedRoles) {
        selectedRoles = selectedRoles || this.customRoles.map(r => r.id);
        Swal.fire({ title: 'กำลังสร้างไฟล์ PDF...', html: 'ระบบกำลังเรนเดอร์กราฟิกความละเอียดสูง<br>กรุณารอสักครู่...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        
        if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
            await Promise.all([
                new Promise(r => { let s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; s.onload=r; document.head.appendChild(s); }),
                new Promise(r => { let s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'; s.onload=r; document.head.appendChild(s); })
            ]);
        }

        try {
            const chunks = this.getExportHTMLChunks(selectedRoles, true);
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('landscape', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth(); 
            
            for (let i = 0; i < chunks.length; i++) {
                let container = document.createElement('div');
                container.style.position = 'absolute';
                container.style.top = '0px';
                container.style.left = '-9999px'; 
                container.style.width = '1122px'; 
                
                container.style.setProperty('background-color', '#ffffff', 'important');
                container.style.setProperty('color', '#000000', 'important');
                container.style.setProperty('color-scheme', 'light', 'important');
                container.setAttribute('data-bs-theme', 'light');
                container.setAttribute('data-theme', 'light');
                
                container.style.zIndex = '-9999';
                container.style.pointerEvents = 'none';
                container.innerHTML = chunks[i];
                document.body.appendChild(container);

                await document.fonts.ready;
                await new Promise(r => setTimeout(r, 800)); 

                const canvas = await html2canvas(container, {
                    scale: 2, 
                    useCORS: true,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const imgHeight = (canvas.height * pdfWidth) / canvas.width;
                
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
                if (i < chunks.length - 1) pdf.addPage();

                container.remove();
            }

            pdf.save(`Timesheet_Roster_${this.currentMonth}.pdf`);
            Swal.fire({title:'ดาวน์โหลดสำเร็จ!', icon:'success', timer:1500});

        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'เกิดข้อผิดพลาดในการสร้าง PDF', 'error');
        }
    }

    generateExcelFile(selectedRoles) {
        selectedRoles = selectedRoles || this.customRoles.map(r => r.id);
        if(typeof ExcelJS === 'undefined') {
            Swal.fire({ title: 'กำลังโหลด Excel Engine...', html: 'โปรดรอสักครู่...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: 'var(--bg-surface)' });
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js';
            script.onload = () => { Swal.close(); this._generateExcelJS(selectedRoles); };
            script.onerror = () => { Swal.fire('ระบบขัดข้อง', 'ไม่สามารถดาวน์โหลด Excel Engine ได้', 'error'); };
            document.head.appendChild(script);
            return;
        }
        this._generateExcelJS(selectedRoles);
    }

    _generateExcelJS(selectedRoles) {
        Swal.fire({ title: 'กำลังสร้างไฟล์ Excel...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: 'var(--bg-surface)' });

        setTimeout(async () => {
            try { 
                const daysInMonth = this.getDaysInMonth(this.currentMonth);
                const [year, month] = this.currentMonth.split('-');
                
                let targetStaff = this.staffList.filter(s => selectedRoles.includes(s.role));
                let workShifts = this.shiftTypes.filter(s => s.id !== 'OFF' && s.id !== 'HOL');
                let shiftCount = Math.max(workShifts.length, 1);

                const workbook = new ExcelJS.Workbook();
                const sheet = workbook.addWorksheet('Timesheet', { views: [{ showGridLines: false }] });

                let cols = [{width: 8}, {width: 28}, {width: 15}]; 
                for(let i=0; i<daysInMonth; i++) cols.push({width: 11}); 
                cols.push({width: 20}); 
                sheet.columns = cols;

                let headers = ["ลำดับ", "ชื่อ-นามสกุล / ตำแหน่ง", "รอบเวร"];
                for (let d = 1; d <= daysInMonth; d++) {
                    let dateObj = new Date(year, month - 1, d);
                    let dayName = this.thaiFullDays[dateObj.getDay()];
                    headers.push(`${d}\n(${dayName})`);
                }
                // 🌟 เปลี่ยนหัวตารางจาก หมายเหตุ เป็น สรุปวันหยุด
                headers.push("สรุปวันหยุด");

                const headerRow = sheet.addRow(headers);
                headerRow.height = 40; 
                headerRow.eachCell((cell, colNum) => {
                    let isWeekendCol = false;
                    if (colNum > 3 && colNum <= daysInMonth + 3) {
                        let d = colNum - 3;
                        let dt = new Date(year, month - 1, d);
                        if (dt.getDay() === 0 || dt.getDay() === 6) isWeekendCol = true;
                    }
                    
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isWeekendCol ? 'FFDC2626' : 'FF1E293B' } };
                    cell.font = { name: 'Tahoma', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
                    cell.border = { top:{style:'thin', color:{argb:'FFCBD5E1'}}, bottom:{style:'thin', color:{argb:'FFCBD5E1'}}, left:{style:'thin', color:{argb:'FFCBD5E1'}}, right:{style:'thin', color:{argb:'FFCBD5E1'}} };
                    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                });

                let currentRow = 2; 

                targetStaff.forEach((staff, index) => {
                    let safeName = String(staff.name || staff.username || '').trim();
                    let staffUname = staff.username || staff.firebaseKey;
                    let roleObj = this.customRoles.find(r => r.id === staff.role) || { name: 'ไม่ระบุ' };

                    // 🌟 คำนวณสรุปการหยุดเฉพาะเดือนปัจจุบันให้พนักงานคนนี้
                    let leaveCounts = {};
                    let totalOffDays = 0;
                    for (let day = 1; day <= daysInMonth; day++) {
                        let dateStr = `${this.currentMonth}-${String(day).padStart(2, '0')}`;
                        let rawData = this.timesheetData[staffUname]?.[dateStr] || '';
                        let statusIds = rawData ? String(rawData).split(',') : [];
                        let fullDayLeaveId = statusIds.find(id => this.leaveTypes.some(l => l.id === id));
                        if (fullDayLeaveId) {
                            leaveCounts[fullDayLeaveId] = (leaveCounts[fullDayLeaveId] || 0) + 1;
                            totalOffDays++;
                        }
                    }

                    let summaryTextArr = [];
                    this.leaveTypes.forEach(lType => {
                        if (leaveCounts[lType.id]) {
                            summaryTextArr.push(`${lType.label}: ${leaveCounts[lType.id]} วัน`);
                        }
                    });
                    let summaryText = summaryTextArr.length > 0 ? summaryTextArr.join('\n') + `\n---\nรวมหยุด: ${totalOffDays} วัน` : '-';

                    workShifts.forEach((shift, sIdx) => {
                        let rowData = [];
                        if (sIdx === 0) { 
                            rowData.push(index + 1); 
                            rowData.push({
                                richText: [
                                    { font: { name: 'Tahoma', bold: true, color: { argb: 'FF0F172A' }, size: 11 }, text: safeName },
                                    { font: { name: 'Tahoma', bold: false, color: { argb: 'FF64748B' }, size: 9 }, text: '\n' + roleObj.name }
                                ]
                            });
                        } else { 
                            rowData.push(""); 
                            rowData.push(""); 
                        }
                        rowData.push(shift.label);

                        for (let day = 1; day <= daysInMonth; day++) {
                            let dateStr = `${this.currentMonth}-${String(day).padStart(2, '0')}`;
                            let rawData = this.timesheetData[staffUname]?.[dateStr] || '';
                            let statusIds = rawData ? String(rawData).split(',') : [];
                            
                            let cellText = '';
                            let fullDayLeaveId = statusIds.find(id => this.leaveTypes.some(l => l.id === id));

                            if (fullDayLeaveId) {
                                let leaveConf = this.leaveTypes.find(l => l.id === fullDayLeaveId);
                                cellText = leaveConf.id; 
                            } else {
                                let shiftW = `${shift.id}_W`;
                                let oldShiftFormat = statusIds.find(id => String(id).split('|')[0] === shift.id && !String(id).includes('_O'));
                                if (statusIds.includes(shiftW) || oldShiftFormat) cellText = '1';
                            }
                            rowData.push(cellText);
                        }
                        // 🌟 แทรกข้อความสรุปในคอลัมน์สุดท้ายของแถวแรก
                        rowData.push(sIdx === 0 ? summaryText : ""); 

                        let r = sheet.addRow(rowData);
                        r.height = 25; 
                        
                        let rawBg = shift.bg ? shift.bg.replace('#', '') : 'ffffff';
                        if(rawBg.length === 6) rawBg = 'FF' + rawBg;

                        r.eachCell((cell, colNum) => {
                            let isWeekendCol = false;
                            if (colNum > 3 && colNum <= daysInMonth + 3) {
                                let d = colNum - 3;
                                let dt = new Date(year, month - 1, d);
                                if (dt.getDay() === 0 || dt.getDay() === 6) isWeekendCol = true;
                            }

                            let cellFillColor = isWeekendCol ? 'FFF1F5F9' : (colNum === 3 ? rawBg : 'FFFFFFFF');
                            
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cellFillColor } };
                            cell.border = { top:{style:'thin', color:{argb:'FFE2E8F0'}}, bottom:{style:'thin', color:{argb:'FFE2E8F0'}}, left:{style:'thin', color:{argb:'FFE2E8F0'}}, right:{style:'thin', color:{argb:'FFE2E8F0'}} };
                            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                            
                            if (!cell.value || !cell.value.richText) {
                                cell.font = { name: 'Tahoma', color: { argb: 'FF0F172A' }, size: 10 };
                            }
                            
                            if (colNum === 2) {
                                cell.alignment.horizontal = 'left';
                                cell.alignment.indent = 1; 
                                if (!cell.value || !cell.value.richText) {
                                    cell.font = { name: 'Tahoma', bold: true, color: { argb: 'FF0F172A' }, size: 11 };
                                }
                            }
                            
                            if (colNum > 3) {
                                if (cell.value === '1') {
                                    let rawColor = shift.color ? shift.color.replace('#', '') : '2563eb';
                                    if(rawColor.length === 6) rawColor = 'FF' + rawColor;
                                    cell.font = { name: 'Tahoma', bold: true, color: { argb: rawColor }, size: 12 };
                                } else if (cell.value && cell.value !== '1') {
                                    cell.font = { name: 'Tahoma', bold: true, color: { argb: 'FF64748B' }, size: 9 };
                                }
                            }
                        });

                        currentRow++;
                    });

                    let startMerge = currentRow - shiftCount;
                    let endMerge = currentRow - 1;
                    if (shiftCount > 1) {
                        sheet.mergeCells(startMerge, 1, endMerge, 1);
                        sheet.mergeCells(startMerge, 2, endMerge, 2);
                        sheet.mergeCells(startMerge, daysInMonth + 4, endMerge, daysInMonth + 4);
                    }
                });

                sheet.views = [ { state: 'frozen', xSplit: 2, ySplit: 1 } ];

                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `Timesheet_HR_${this.currentMonth}.xlsx`;
                
                Swal.close();
                setTimeout(() => {
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(link.href);
                }, 500);

            } catch (error) { 
                console.error(error);
                Swal.fire('ข้อผิดพลาด', 'ไม่สามารถสร้างไฟล์ Excel ได้: ' + error.message, 'error');
            }
        }, 800);
    }

    openReportModal() {
        const daysInMonth = this.getDaysInMonth(this.currentMonth);
        let staffOptions = `<option value="ALL">พนักงานทั้งหมด (All Staff)</option>`;
        this.staffList.forEach(s => {
            let safeName = String(s.name || s.username || 'ไม่ระบุ').trim();
            staffOptions += `<option value="${s.username || s.firebaseKey}">${this.escapeHTML(safeName)}</option>`;
        });

        Swal.fire({
            title: `<h4 class="fw-bold mb-0 text-dark" style="font-family:'Prompt';"><i class="fa-solid fa-chart-pie text-info me-2"></i>รายงานสรุปการลงเวลา</h4><p class="text-muted fs-6 mt-1 mb-0">เดือน ${this.currentMonth}</p>`,
            html: `
                <div class="text-start mt-3" style="font-family:'Prompt';">
                    <label class="form-label fw-bold small text-secondary">เลือกบุคคลที่ต้องการดูรายงาน</label>
                    <select id="report-staff-selector" class="form-select input-modern fw-bold text-dark" onchange="window.ShiftSchedulePage.renderReportContent(this.value)">
                        ${staffOptions}
                    </select>
                </div>
                <div id="report-content-container" class="report-scroll-area text-start mt-3"></div>
            `,
            width: '800px',
            background: 'var(--bg-surface)',
            showConfirmButton: false,
            showCloseButton: true,
            customClass: { popup: 'premium-alert' },
            didOpen: () => { window.ShiftSchedulePage.renderReportContent('ALL'); }
        });
    }

    renderReportContent(username) {
        const container = document.getElementById('report-content-container');
        if (!container) return;

        let staffsToRender = username === 'ALL' ? this.staffList : this.staffList.filter(s => (s.username || s.firebaseKey) === username);
        const daysInMonth = this.getDaysInMonth(this.currentMonth);
        let html = '';

        if(staffsToRender.length === 0) {
             container.innerHTML = '<div class="text-center text-muted p-4">ไม่มีข้อมูลพนักงาน</div>'; return;
        }

        staffsToRender.forEach(staff => {
            let workRoundsCount = 0;
            let workDetails = []; 
            let leaveDetails = {}; 
            let staffUname = staff.username || staff.firebaseKey;

            for (let day = 1; day <= daysInMonth; day++) {
                let dateStr = `${this.currentMonth}-${String(day).padStart(2, '0')}`;
                let rawData = this.timesheetData[staffUname]?.[dateStr] || '';
                if(!rawData) continue;

                let items = String(rawData).split(',');
                let dayShifts = [];

                items.forEach(item => {
                    let isRoundOff = String(item).endsWith('_O');
                    let cleanId = String(item).includes('_') ? String(item).split('_')[0] : (String(item).includes('|') ? String(item).split('|')[0] : String(item));

                    let confShift = this.shiftTypes.find(s => s.id === cleanId);
                    let confLeave = this.leaveTypes.find(l => l.id === cleanId);

                    if (confShift) {
                        if(!isRoundOff) {
                            workRoundsCount++;
                            dayShifts.push(confShift.label);
                        }
                    } 
                    if (confLeave) {
                        if(!leaveDetails[confLeave.id]) leaveDetails[confLeave.id] = { label: confLeave.label, bg: confLeave.bg, color: confLeave.color, count: 0, dates: [] };
                        leaveDetails[confLeave.id].count++;
                        leaveDetails[confLeave.id].dates.push(day);
                    }
                });

                if (dayShifts.length > 0) {
                    workDetails.push(`<span class="badge border rounded-pill me-1 mb-2" style="background:var(--bg-body); color:var(--text-dark); border-color:var(--border-color)!important; font-weight:normal;">วันที่ ${day} <b class="ms-1" style="color:var(--primary);">${dayShifts.join(' + ')}</b></span>`);
                }
            }

            let roleConf = this.customRoles.find(r => r.id === staff.role) || { name: 'ไม่มีตำแหน่ง', bg: '#f8fafc', color: '#64748b' };
            let safeName = String(staff.name || staff.username || 'ไม่ระบุ').trim();

            html += `
            <div class="mb-4 p-3 border rounded-4 shadow-sm report-card" style="background:var(--bg-surface); border-color:var(--border-color)!important;">
                <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2" style="border-color:var(--border-color)!important;">
                    <div class="fw-bold fs-5" style="color:var(--text-dark)!important;">
                        <i class="fa-solid fa-user-doctor text-primary me-2"></i>${this.escapeHTML(safeName)}
                    </div>
                    <span class="badge border rounded-pill dynamic-badge" style="--badge-bg:${roleConf.bg}; --badge-color:${roleConf.color};">${this.escapeHTML(roleConf.name)}</span>
                </div>

                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="p-3 rounded-4 border h-100 report-stat-box" style="background:rgba(37,99,235,0.03); border-color:rgba(37,99,235,0.2)!important;">
                            <h6 class="fw-bold text-primary mb-2"><i class="fa-solid fa-briefcase-medical me-1"></i> ประวัติปฏิบัติงาน (กะทำงาน)</h6>
                            <div class="fs-3 fw-bold text-primary mb-2">${workRoundsCount} <span class="fs-6 text-muted fw-normal">รอบ</span></div>
                            <div class="small" style="max-height: 120px; overflow-y:auto;">
                                ${workDetails.length > 0 ? workDetails.join('') : '<span class="text-muted">ไม่มีประวัติการเข้ากะในเดือนนี้</span>'}
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="p-3 rounded-4 border h-100 report-stat-box" style="background:rgba(239,68,68,0.03); border-color:rgba(239,68,68,0.2)!important;">
                            <h6 class="fw-bold text-danger mb-2"><i class="fa-solid fa-suitcase-rolling me-1"></i> ประวัติวันหยุด/สถานะพิเศษ</h6>
                            `;
                            
            if(Object.keys(leaveDetails).length > 0) {
                for(const [lId, lData] of Object.entries(leaveDetails)) {
                    html += `
                    <div class="mb-2">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="badge dynamic-badge" style="--badge-bg:${lData.bg}; --badge-color:${lData.color}; border:1px solid ${lData.color}40;">${this.escapeHTML(lData.label)} : ${lData.count} วัน</span>
                        </div>
                        <div class="small text-muted ps-1" style="font-size:11px;">วันที่: <b style="color:var(--text-dark);">${lData.dates.join(', ')}</b></div>
                    </div>`;
                }
            } else {
                html += `<div class="small text-muted mt-2">ไม่มีประวัติการหยุดในเดือนนี้</div>`;
            }

            html += `
                        </div>
                    </div>
                </div>
            </div>`;
        });

        container.innerHTML = html;
    }

    openStaffManager() {
        if (typeof Sortable === 'undefined') {
            Swal.fire({ title: 'กำลังเตรียมระบบจัดเรียง...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: 'var(--bg-surface)' });
            let s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js';
            s.onload = () => { Swal.close(); this.openStaffManager(); }; 
            document.head.appendChild(s);
            return;
        }

        let html = '<div id="staff-sortable-list" class="d-flex flex-column gap-2 mb-2 text-start" style="max-height: 60vh; overflow-y: auto; padding-right: 5px; overflow-x: hidden;">';
        
        if (this.staffList.length === 0) {
            html += `
                <div class="text-center text-muted py-5 fw-bold shadow-sm" style="background:var(--bg-body); border-radius: 14px; border: 1px dashed var(--border-color);">
                    <i class="fa-solid fa-folder-open fa-2x mb-2 opacity-50"></i><br>ยังไม่มีพนักงานในระบบ
                </div>`;
        } else {
            this.staffList.forEach((staff) => {
                let roleConf = this.customRoles.find(r => r.id === staff.role) || { name: 'ไม่มีตำแหน่ง', bg: '#f8fafc', color: '#64748b', border: '#cbd5e1' };
                let staffRoleName = `<span class="badge dynamic-badge" style="--badge-bg:${roleConf.bg}; --badge-color:${roleConf.color}; font-size: 10px; padding: 4px 8px; border: 1px solid color-mix(in srgb, ${roleConf.color} 30%, transparent) !important; border-radius: 6px;">${this.escapeHTML(roleConf.name)}</span>`;
                
                html += `
                <div class="d-flex justify-content-between align-items-center p-3 border shadow-sm staff-manager-card bg-surface" data-id="${staff.firebaseKey || staff.username}" style="background:var(--bg-body); border-radius: 14px; border-color: var(--border-color) !important; transition: box-shadow 0.2s ease;">
                    <div class="d-flex align-items-center gap-3 overflow-hidden">
                        <div class="drag-handle d-flex align-items-center justify-content-center text-muted py-2 pe-2" style="cursor: grab;" title="กดค้างเพื่อลากสลับตำแหน่ง">
                            <i class="fa-solid fa-grip-vertical fs-5 opacity-50"></i>
                        </div>
                        <div class="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold shadow-sm flex-shrink-0" style="width: 42px; height: 42px; background: ${roleConf.color}; font-size: 18px;">
                            ${staff.name ? staff.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div class="overflow-hidden">
                            <div class="fw-bold mb-1" style="font-size:15px; font-family:'Prompt'; color:var(--text-dark); white-space:normal; word-break:break-word; line-height:1.2;" title="${this.escapeHTML(staff.name || staff.username)}">
                                ${this.escapeHTML(staff.name || staff.username)}
                            </div>
                            <div class="d-flex align-items-center gap-2 flex-wrap">
                                ${staffRoleName}
                                <span class="badge" style="background: transparent; color: var(--text-muted); border: 1px dashed var(--border-color); font-size: 10px; padding: 4px 8px; font-family: monospace;">
                                    <i class="fa-solid fa-id-badge me-1"></i> ${this.escapeHTML(staff.username)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex gap-2 flex-shrink-0 ms-2">
                        <button class="btn btn-sm d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; border-radius: 8px; background: rgba(14, 165, 233, 0.1); color: #0ea5e9; border: 1px solid rgba(14, 165, 233, 0.2);" onclick="Swal.close(); setTimeout(()=>window.ShiftSchedulePage.openIndividualQuotaModal('${staff.username}', '${this.escapeHTML(staff.name)}'), 300)" title="ตั้งค่าโควตาวันลา">
                            <i class="fa-solid fa-sliders"></i>
                        </button>
                        <button class="btn btn-sm d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; border-radius: 8px; background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2);" onclick="Swal.close(); setTimeout(()=>window.ShiftSchedulePage.editStaff('${staff.firebaseKey || staff.username}'), 300)" title="แก้ไขพนักงาน">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn btn-sm d-flex align-items-center justify-content-center" style="width: 32px; height: 32px; border-radius: 8px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);" onclick="Swal.close(); setTimeout(()=>window.ShiftSchedulePage.deleteStaff('${staff.firebaseKey || staff.username}'), 300)" title="ลบพนักงาน">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>`;
            });
        }
        html += '</div>';

        Swal.fire({
            title: '<h4 class="fw-bold mb-3 text-dark" style="font-family:\'Prompt\';"><i class="fa-solid fa-users text-primary me-2"></i> จัดการพนักงาน (Staff)</h4>',
            html: html, 
            width: '650px',
            background: 'var(--bg-surface)', 
            showCancelButton: true, 
            cancelButtonText: 'ปิดหน้าต่าง',
            showConfirmButton: true, 
            confirmButtonText: '<i class="fa-solid fa-user-plus me-1"></i> เพิ่มพนักงานใหม่', 
            confirmButtonColor: '#10b981',
            customClass: { popup: 'premium-alert' },
            allowOutsideClick: false, 
            didOpen: () => {
                let el = document.getElementById('staff-sortable-list');
                if (el && typeof Sortable !== 'undefined') {
                    new Sortable(el, {
                        handle: '.drag-handle', 
                        animation: 150, 
                        ghostClass: 'opacity-50', 
                        onEnd: (evt) => {
                            let items = el.querySelectorAll('.staff-manager-card');
                            let updates = {};
                            items.forEach((item, index) => {
                                let key = item.getAttribute('data-id');
                                if(key) updates[`${key}/order`] = index; 
                            });
                            window.ShiftSchedulePage.saveStaffOrder(updates);
                        }
                    });
                }
            }
        }).then((res) => { 
            if(res.isConfirmed) { 
                setTimeout(()=>window.ShiftSchedulePage.editStaff(null), 300); 
            } 
        });
    }   

    editStaff(firebaseKey) {
        let staff = firebaseKey ? this.staffList.find(s => s.firebaseKey === firebaseKey || s.username === firebaseKey) : { username: '', name: '', role: '', password: '123' };
        let roleOptions = this.customRoles.map(r => `<option value="${r.id}" ${staff.role === r.id ? 'selected' : ''}>${this.escapeHTML(r.name)}</option>`).join('');

        Swal.fire({
            title: `<h5 class="fw-bold mb-0 text-dark"><i class="fa-solid ${firebaseKey?'fa-pen':'fa-plus'} text-primary me-2"></i>${firebaseKey ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงานใหม่'}</h5>`,
            background: 'var(--bg-surface)',
            html: `
                <div class="text-start mt-3" style="font-family:'Prompt';">
                    <label class="form-label fw-bold small text-secondary">รหัสพนักงาน / Username <span class="text-danger">*</span></label>
                    <input type="text" id="staff-username" class="form-control input-modern mb-3 fw-bold text-primary" value="${this.escapeHTML(staff.username)}" ${firebaseKey ? 'readonly' : ''} placeholder="เช่น ST001">
                    <label class="form-label fw-bold small text-secondary">ชื่อ-นามสกุล (แสดงบนตาราง) <span class="text-danger">*</span></label>
                    <input type="text" id="staff-name" class="form-control input-modern mb-3 fw-bold" style="color:var(--text-dark);" value="${this.escapeHTML(staff.name)}" placeholder="นาย/นางสาว...">
                    <label class="form-label fw-bold small text-secondary">ตำแหน่งงาน (Role) <span class="text-danger">*</span></label>
                    <select id="staff-role" class="form-select input-modern mb-3 fw-bold" style="color:var(--text-dark);">${roleOptions}</select>
                    ${!firebaseKey ? `<div class="alert alert-info small py-2"><i class="fa-solid fa-circle-info"></i> รหัสผ่านเริ่มต้นคือ <b>123</b></div>` : ''}
                </div>
            `,
            showCancelButton: true, cancelButtonText: 'ยกเลิก', confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึก', confirmButtonColor: '#2563eb',
            customClass: { popup: 'premium-alert' },
            preConfirm: () => {
                let username = document.getElementById('staff-username').value.trim();
                let name = document.getElementById('staff-name').value.trim();
                let role = document.getElementById('staff-role').value;
                if(!username || !name) { Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วน'); return false; }
                
                if (!firebaseKey && this.staffList.some(s => s.username.toLowerCase() === username.toLowerCase())) {
                    Swal.showValidationMessage('รหัสพนักงาน/Username นี้ถูกใช้ไปแล้ว!'); return false;
                }
                return { username, name, role, status: 'active' };
            }
        }).then(res => {
            if(res.isConfirmed) {
                Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: 'var(--bg-surface)', customClass: { popup: 'premium-alert' } });
                let targetKey = firebaseKey || res.value.username; 
                let savePayload = { ...res.value };
                if(!firebaseKey) savePayload.password = '123'; 
                db.ref(`clinic_users_v2/${targetKey}`).update(savePayload).then(() => {
                    Swal.fire({toast: true, position: 'top-end', icon: 'success', title: 'บันทึกสำเร็จ', showConfirmButton: false, timer: 1000});
                    setTimeout(()=>window.ShiftSchedulePage.openStaffManager(), 1200);
                });
            } else if (res.isDismissed) { window.ShiftSchedulePage.openStaffManager(); }
        });
    }

    deleteStaff(firebaseKey) {
        Swal.fire({ 
            title: 'ยืนยันการลบถาวร?', 
            text: 'คำเตือน: ข้อมูลผู้ใช้งานนี้จะถูกลบออกจากฐานข้อมูลคลินิกอย่างถาวร!', 
            icon: 'warning', 
            background: 'var(--bg-surface)', 
            showCancelButton: true, 
            confirmButtonColor: '#ef4444', 
            cancelButtonColor: '#cbd5e1',
            confirmButtonText: '<i class="fa-solid fa-trash-can me-1"></i> ลบถาวร',
            cancelButtonText: 'ยกเลิก',
            customClass: { popup: 'premium-alert' } 
        }).then(res => {
            if(res.isConfirmed) {
                Swal.fire({ title: 'กำลังลบข้อมูล...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: 'var(--bg-surface)' });
                
                db.ref(`clinic_users_v2/${firebaseKey}`).remove().then(() => {
                    Swal.fire({toast: true, position: 'top-end', icon: 'success', title: 'ลบข้อมูลถาวรสำเร็จ', showConfirmButton: false, timer: 1500});
                    setTimeout(() => window.ShiftSchedulePage.openStaffManager(), 1600);
                }).catch(err => {
                    console.error("Delete Error:", err);
                    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้: ' + err.message, 'error');
                });
            } else { 
                window.ShiftSchedulePage.openStaffManager(); 
            }
        });
    }

    async saveStaffOrder(updates) {
        try {
            await db.ref('clinic_users_v2').update(updates);
            
            let nativeToast = document.createElement('div');
            nativeToast.innerHTML = '<i class="fa-solid fa-circle-check me-2"></i>อัปเดตลำดับพนักงานสำเร็จ';
            nativeToast.style.cssText = `
                position: fixed; 
                top: 20px; 
                right: 20px; 
                background: linear-gradient(135deg, #10b981, #059669); 
                color: #ffffff; 
                padding: 10px 20px; 
                border-radius: 50px; 
                font-family: 'Prompt', sans-serif; 
                font-size: 13px; 
                font-weight: 700; 
                box-shadow: 0 4px 15px rgba(16,185,129,0.3); 
                z-index: 999999; 
                opacity: 0; 
                transform: translateY(-10px); 
                transition: all 0.3s ease; 
                pointer-events: none;
            `;
            document.body.appendChild(nativeToast);
            
            requestAnimationFrame(() => {
                nativeToast.style.opacity = '1';
                nativeToast.style.transform = 'translateY(0)';
            });
            
            setTimeout(() => {
                nativeToast.style.opacity = '0';
                nativeToast.style.transform = 'translateY(-10px)';
                setTimeout(() => nativeToast.remove(), 300);
            }, 2000);
            
        } catch (e) {
            console.error('Failed to update staff order:', e);
            Swal.fire('ข้อผิดพลาด', 'ไม่สามารถบันทึกลำดับได้ กรุณาลองใหม่', 'error');
        }
    }

    openIndividualQuotaModal(username, staffName) {
        let leavesWithQuota = this.leaveTypes.filter(l => Number(l.quota) > 0);
        if (leavesWithQuota.length === 0) { Swal.fire({title: 'ไม่มีข้อมูล', text: 'ระบบยังไม่มีการตั้งค่าประเภทวันลาที่มีโควตา', icon: 'info', background: 'var(--bg-surface)', customClass: { popup: 'premium-alert' }}); return; }

        let html = `<div class="text-start mt-3" style="font-family:'Prompt';">`;
        html += `<div class="alert alert-warning small py-2 mb-3"><i class="fa-solid fa-circle-info"></i> เว้นว่างไว้หากต้องการใช้โควตามาตรฐานของคลินิก</div>`;
        leavesWithQuota.forEach(l => {
            let currentVal = (this.staffCustomQuotas[username] && this.staffCustomQuotas[username][l.id] !== undefined) ? this.staffCustomQuotas[username][l.id] : '';
            html += `
                <div class="mb-3">
                    <label class="form-label fw-bold small d-flex justify-content-between text-dark">
                        <span><span class="color-dot" style="background:${l.bg}; border-color:${l.color}; width:12px; height:12px;"></span> ${this.escapeHTML(l.label)}</span>
                        <span class="text-muted fw-normal">(โควตาปกติ: ${l.quota} วัน)</span>
                    </label>
                    <input type="number" id="quota-${l.id}" class="form-control input-modern fw-bold text-primary" placeholder="ใช้ค่าเริ่มต้น (${l.quota})" value="${currentVal}" min="0">
                </div>`;
        });
        html += `</div>`;

        Swal.fire({
            title: `<h5 class="fw-bold mb-0 text-dark"><i class="fa-solid fa-sliders text-primary me-2"></i> โควตาวันลารายบุคคล</h5><p class="text-muted fs-6 mt-1 mb-0">${staffName} (ปี ${this.currentYear})</p>`,
            html: html, background: 'var(--bg-surface)', showCancelButton: true, confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึกโควตา', confirmButtonColor: '#2563eb', customClass: { popup: 'premium-alert' },
            preConfirm: () => {
                let newQuotas = {};
                leavesWithQuota.forEach(l => {
                    let val = document.getElementById(`quota-${l.id}`).value;
                    if(val !== '') newQuotas[l.id] = Number(val);
                });
                return newQuotas;
            }
        }).then(res => {
            if(res.isConfirmed) {
                Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: 'var(--bg-surface)', customClass: { popup: 'premium-alert' } });
                db.ref(`clinic_leave_quotas_v2/${this.currentYear}/${username}`).set(res.value).then(() => {
                    Swal.fire({toast: true, position: 'top-end', icon: 'success', title: 'ปรับโควตาสำเร็จ', showConfirmButton: false, timer: 1000});
                });
            }
        });
    }

    openBatchModal(staffUsername, clickedDateStr) {
        const daysInMonth = this.getDaysInMonth(this.currentMonth);
        let staff = this.staffList.find(s => (s.username || s.firebaseKey) === staffUsername);
        let staffName = staff ? (staff.name || staff.username) : staffUsername;
        let rawStatusStr = this.timesheetData[staffUsername]?.[clickedDateStr] || '';
        
        let activeStatuses = [];

        if (rawStatusStr) {
            String(rawStatusStr).split(',').forEach(item => { 
                if (String(item).includes('|')) activeStatuses.push(String(item).split('|')[0] + '_W');
                else if (!String(item).includes('_')) {
                    if (this.shiftTypes.some(s => s.id === item)) activeStatuses.push(item + '_W');
                    else activeStatuses.push(item);
                }
                else activeStatuses.push(item); 
            });
        }
        
        let dateCheckboxes = `<div class="p-3 border rounded-4 shadow-sm mb-3" style="background: var(--bg-surface); border-color: var(--border-color) !important;">
            <label class="form-label fw-bold small mb-3" style="color: var(--text-dark);"><i class="fa-solid fa-calendar-check text-primary me-1"></i> เลือกวันที่ต้องการลงเวลา (เลือกได้หลายวัน)</label>
            <div class="date-grid">`;
            
        for(let d = 1; d <= daysInMonth; d++) {
            let dStr = `${this.currentMonth}-${String(d).padStart(2,'0')}`;
            let isChecked = dStr === clickedDateStr ? 'checked' : '';
            dateCheckboxes += `
                <div class="form-check p-0 m-0">
                    <input type="checkbox" class="btn-check date-batch-cb" id="batch_${d}" value="${dStr}" ${isChecked} autocomplete="off">
                    <label class="custom-date-btn shadow-sm" for="batch_${d}">${d}</label>
                </div>`;
        }
        dateCheckboxes += `</div>
            <div class="mt-3 text-center border-top pt-3" style="border-color: var(--border-color) !important;">
                <button class="btn btn-sm fw-bold px-3 rounded-pill shadow-sm border border-primary-subtle" style="background: var(--bg-surface); color: var(--primary);" onclick="document.querySelectorAll('.date-batch-cb').forEach(cb => cb.checked = true)">เลือกทั้งหมด</button>
                <button class="btn btn-sm fw-bold px-3 rounded-pill shadow-sm border border-danger-subtle ms-2" style="background: var(--bg-surface); color: var(--bs-danger);" onclick="document.querySelectorAll('.date-batch-cb').forEach(cb => cb.checked = false)">ล้างการเลือก</button>
            </div>
        </div>`;

        let actionHtml = `<div class="row g-2 mt-3">`;
        actionHtml += `<div class="col-12 mb-2"><button class="btn btn-outline-danger w-100 fw-bold border-2 border-danger-subtle rounded-pill py-2 shadow-sm" style="background: var(--bg-surface);" onclick="Swal.close(); setTimeout(()=>window.ShiftSchedulePage.applyBulkStatus('${staffUsername}', true), 100)"><i class="fa-solid fa-trash-can me-1"></i> ลบข้อมูลออกจากตารางในวันที่เลือก</button></div>`;

        actionHtml += `<div class="col-12 text-start fw-bold text-primary small mt-2 border-bottom pb-1" style="border-color: var(--border-color) !important;"><i class="fa-solid fa-bed-pulse me-1"></i> เลือกรอบฟอกไต (อิสระแต่ละรอบ)</div>`;
        this.shiftTypes.forEach(s => {
            let activeVal = '';
            let found = activeStatuses.find(st => st.startsWith(s.id + '_'));
            if(found) activeVal = found.split('_')[1];

            actionHtml += `
                <div class="col-12">
                    <div class="shift-row-card shadow-sm">
                        <div class="fw-bold" style="color: ${s.color}; font-size:14px;"><i class="fa-solid fa-clock me-1"></i> ${this.escapeHTML(s.label)} <small class="text-muted ms-1" style="font-size:10px;">${s.time ? `(${s.time})` : ''}</small></div>
                        <div class="btn-group shift-radio-group" role="group">
                            <input type="radio" class="btn-check shift-radio" name="shift_${s.id}" id="shift_${s.id}_w" value="${s.id}_W" ${activeVal === 'W' ? 'checked' : ''}>
                            <label class="btn btn-outline-primary btn-sm fw-bold" for="shift_${s.id}_w"><i class="fa-solid fa-check me-1"></i> ขึ้นเวร</label>

                            <input type="radio" class="btn-check shift-radio" name="shift_${s.id}" id="shift_${s.id}_o" value="${s.id}_O" ${activeVal === 'O' ? 'checked' : ''}>
                            <label class="btn btn-outline-secondary btn-sm fw-bold" for="shift_${s.id}_o"><i class="fa-solid fa-bed me-1"></i> ลงเวร</label>
                        </div>
                    </div>
                </div>`;
        });

        actionHtml += `<div class="col-12 text-start fw-bold text-danger small mt-3 border-bottom pb-1" style="border-color: var(--border-color) !important;"><i class="fa-solid fa-suitcase-rolling me-1"></i> สถานะพิเศษ / วันหยุดทั้งวัน (คลุมทุกกะ)</div>`;
        this.leaveTypes.forEach(l => {
            let isChecked = activeStatuses.includes(l.id) ? 'checked' : '';
            
            let limit = this.getStaffQuotaLimit(staffUsername, l.id);
            let used = (this.yearlyLeaveUsage[staffUsername] && this.yearlyLeaveUsage[staffUsername][l.id]) ? Number(this.yearlyLeaveUsage[staffUsername][l.id]) : 0;
            let isQuotaFull = limit > 0 && used >= limit && !activeStatuses.includes(l.id);
            
            let extraProps = isQuotaFull ? 'disabled' : '';
            let opacityStyle = isQuotaFull ? 'opacity:0.4; filter:grayscale(1);' : '';
            let quotaBadge = limit > 0 ? `<div class="mt-1 quota-text-modal" style="font-size:10px;">${isQuotaFull ? '(โควตาเต็ม)' : `(เหลือ ${limit - used})`}</div>` : '';

            actionHtml += `
                <div class="col-6 col-md-4 mt-2">
                    <input type="checkbox" class="btn-check leave-cb" id="leave_${l.id}" value="${l.id}" ${isChecked} ${extraProps} onchange="if(this.checked) document.querySelectorAll('.leave-cb').forEach(cb => { if(cb.id !== this.id) cb.checked=false })">
                    <label class="dynamic-modal-btn w-100 shadow-sm" for="leave_${l.id}" style="--badge-bg:${l.bg}; --badge-color:${l.color}; ${opacityStyle}">
                        <span class="fw-bold" style="font-family:'Prompt'; font-size:14px;"><i class="fa-solid fa-circle me-1" style="font-size:10px;"></i> ${this.escapeHTML(l.label)}</span>
                        ${quotaBadge}
                    </label>
                </div>`;
        });
        
        actionHtml += `
            <div class="col-12 mt-4">
                <button class="btn btn-sm btn-light w-100 fw-bold text-muted border-secondary shadow-sm rounded-pill py-2" style="background: var(--bg-surface);" onclick="window.ShiftSchedulePage.resetModalForm()">
                    <i class="fa-solid fa-rotate-left me-1"></i> รีเซ็ตตัวเลือกหน้าต่างนี้ (Clear Form)
                </button>
            </div>
        </div>`;

        Swal.fire({
            title: `<h4 class="fw-bold mb-0 text-dark" style="font-family:'Prompt';">ลงเวลาปฏิบัติงาน</h4><p class="text-muted fs-6 mt-1 mb-0">${this.escapeHTML(staffName)}</p>`,
            html: dateCheckboxes + actionHtml,
            background: 'var(--bg-surface)',
            showConfirmButton: true, confirmButtonText: '<i class="fa-solid fa-save me-1"></i> บันทึกตามที่เลือก', confirmButtonColor: '#2563eb',
            showCloseButton: true, width: '580px', customClass: { popup: 'premium-alert' }
        }).then((res) => {
            if (res.isConfirmed) { window.ShiftSchedulePage.applyBulkStatus(staffUsername, false); }
        });
    }

    async applyBulkStatus(staffUsername, isClear) {
        let selectedDates = Array.from(document.querySelectorAll('.date-batch-cb:checked')).map(el => el.value);

        if (selectedDates.length === 0) { Swal.fire({title:'แจ้งเตือน', text:'กรุณาเลือกวันที่อย่างน้อย 1 วัน', icon:'warning', background: 'var(--bg-surface)', customClass:{popup:'premium-alert'}}); return; }

        let newStatusArray = [];
        if (!isClear) {
            let shifts = Array.from(document.querySelectorAll('.shift-radio:checked')).map(cb => cb.value);
            let leaveNode = document.querySelector('.leave-cb:checked');
            
            newStatusArray = [...shifts];
            if (leaveNode) newStatusArray.push(leaveNode.value);
            
            if(newStatusArray.length === 0) { Swal.fire({title:'แจ้งเตือน', text:'กรุณาเลือกรอบทำงาน หรือ สถานะพิเศษ', icon:'warning', background: 'var(--bg-surface)', customClass:{popup:'premium-alert'}}); return; }
        }

        Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: 'var(--bg-surface)', customClass: { popup: 'premium-alert' } });

        try {
            const updates = {};
            let quotaDiffs = {}; 

            selectedDates.forEach(dateStr => {
                const tsPath = `clinic_timesheet_v2/${this.currentMonth}/${staffUsername}/${dateStr}`;
                let oldRawData = (this.timesheetData[staffUsername] && this.timesheetData[staffUsername][dateStr]) ? this.timesheetData[staffUsername][dateStr] : null;
                
                let oldLeaveIds = [];
                if (oldRawData) {
                    String(oldRawData).split(',').forEach(item => {
                        let cleanId = String(item).includes('_') ? String(item).split('_')[0] : (String(item).includes('|') ? String(item).split('|')[0] : String(item));
                        if (this.leaveTypes.some(l => l.id === cleanId)) oldLeaveIds.push(cleanId);
                    });
                }

                if (isClear) {
                    updates[tsPath] = null;
                } else {
                    updates[tsPath] = newStatusArray.join(',');
                }

                let newLeaveIds = newStatusArray.filter(id => this.leaveTypes.some(l => l.id === id));
                
                oldLeaveIds.forEach(oldId => {
                    if (!newLeaveIds.includes(oldId)) {
                        let oldLeave = this.leaveTypes.find(l => l.id === oldId && this.getStaffQuotaLimit(staffUsername, l.id) > 0);
                        if (oldLeave) quotaDiffs[oldLeave.id] = (quotaDiffs[oldLeave.id] || 0) - 1; 
                    }
                });

                newLeaveIds.forEach(newId => {
                    if (!oldLeaveIds.includes(newId)) {
                        let newLeave = this.leaveTypes.find(l => l.id === newId && this.getStaffQuotaLimit(staffUsername, l.id) > 0);
                        if (newLeave) quotaDiffs[newLeave.id] = (quotaDiffs[newLeave.id] || 0) + 1; 
                    }
                });
            });

            for (const [leaveId, diff] of Object.entries(quotaDiffs)) {
                let currentUsed = (this.yearlyLeaveUsage[staffUsername] && this.yearlyLeaveUsage[staffUsername][leaveId]) ? Number(this.yearlyLeaveUsage[staffUsername][leaveId]) : 0;
                updates[`clinic_leave_usage_v2/${this.currentYear}/${staffUsername}/${leaveId}`] = Math.max(0, currentUsed + diff);
            }

            if (Object.keys(updates).length > 0) {
                await db.ref().update(updates);
            }
            
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `บันทึกเวลา ${selectedDates.length} วันสำเร็จ`, showConfirmButton: false, timer: 1200 });
        } catch(e) { Swal.fire({title: 'ข้อผิดพลาด', text: e.message, icon: 'error', background: 'var(--bg-surface)', customClass: { popup: 'premium-alert' }}); }
    }

    openSettingsModal() {
        let roleHtml = this.customRoles.map((r, i) => `
            <div class="config-item shadow-sm">
                <div><span class="color-dot" style="background:${r.bg}; border-color:${r.color};"></span> <b style="color:${r.color}">${this.escapeHTML(r.name)}</b></div>
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-light text-warning rounded-circle p-0" style="width:28px; height:28px; background:var(--bg-body);" onclick="Swal.close(); setTimeout(()=>window.ShiftSchedulePage.editConfigModal('role', ${i}), 300)"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-sm btn-light text-danger rounded-circle p-0" style="width:28px; height:28px; background:var(--bg-body);" onclick="Swal.close(); setTimeout(()=>window.ShiftSchedulePage.deleteConfig('role', ${i}), 300)"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`).join('');

        let shiftHtml = this.shiftTypes.map((s, i) => `
            <div class="config-item shadow-sm flex-column align-items-start">
                <div class="w-100 d-flex justify-content-between align-items-center">
                    <div><span class="color-dot" style="background:${s.bg}; border-color:${s.color};"></span> <b style="color:${s.color}">${this.escapeHTML(s.label)}</b></div>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-light text-warning rounded-circle p-0" style="width:28px; height:28px; background:var(--bg-body);" onclick="Swal.close(); setTimeout(()=>window.ShiftSchedulePage.editConfigModal('shift', ${i}), 300)"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-sm btn-light text-danger rounded-circle p-0" style="width:28px; height:28px; background:var(--bg-body);" onclick="Swal.close(); setTimeout(()=>window.ShiftSchedulePage.deleteConfig('shift', ${i}), 300)"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                ${s.time ? `<div class="small text-muted mt-1 w-100 ps-4"><i class="fa-solid fa-clock me-1"></i> ${this.escapeHTML(s.time)}</div>` : ''}
            </div>`).join('');
            
        let leaveHtml = this.leaveTypes.map((l, i) => `
            <div class="config-item shadow-sm flex-column align-items-start">
                <div class="w-100 d-flex justify-content-between align-items-center">
                    <div><span class="color-dot" style="background:${l.bg}; border-color:${l.color};"></span> <b style="color:${l.color}">${this.escapeHTML(l.label)}</b></div>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-light text-warning rounded-circle p-0" style="width:28px; height:28px; background:var(--bg-body);" onclick="Swal.close(); setTimeout(()=>window.ShiftSchedulePage.editConfigModal('leave', ${i}), 300)"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-sm btn-light text-danger rounded-circle p-0" style="width:28px; height:28px; background:var(--bg-body);" onclick="Swal.close(); setTimeout(()=>window.ShiftSchedulePage.deleteConfig('leave', ${i}), 300)"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                ${l.quota > 0 ? `<div class="small text-danger mt-1 w-100 ps-4 fw-bold"><i class="fa-solid fa-bed me-1"></i> โควตา ${l.quota} วัน</div>` : ''}
            </div>`).join('');

        Swal.fire({
            title: '<h4 class="fw-bold" style="color:var(--text-dark);"><i class="fa-solid fa-gears text-warning me-2"></i> ตั้งค่าองค์กร</h4>',
            width: '900px', background: 'var(--bg-surface)', customClass: { popup: 'premium-alert' },
            html: `
                <div class="row text-start mt-3" style="font-family:'Sarabun';">
                    <div class="col-md-4 border-end" style="border-color:var(--border-color) !important;">
                        <h6 class="fw-bold text-primary mb-3">1. ตำแหน่ง (Roles)</h6>
                        <button class="btn btn-sm btn-outline-primary fw-bold rounded-pill w-100 mb-3" style="background:var(--bg-body);" onclick="Swal.close(); setTimeout(()=>window.ShiftSchedulePage.addConfig('role'), 300)"><i class="fa-solid fa-plus me-1"></i> เพิ่มตำแหน่ง</button>
                        <div style="max-height: 400px; overflow-y:auto; padding-right:5px;">${roleHtml}</div>
                    </div>
                    <div class="col-md-4 border-end" style="border-color:var(--border-color) !important;">
                        <h6 class="fw-bold text-success mb-3">2. กะทำงาน (Shifts)</h6>
                        <button class="btn btn-sm btn-outline-success fw-bold rounded-pill w-100 mb-3" style="background:var(--bg-body);" onclick="Swal.close(); setTimeout(()=>window.ShiftSchedulePage.addConfig('shift'), 300)"><i class="fa-solid fa-plus me-1"></i> เพิ่มกะใหม่</button>
                        <div style="max-height: 400px; overflow-y:auto; padding-right:5px;">${shiftHtml}</div>
                    </div>
                    <div class="col-md-4">
                        <h6 class="fw-bold text-danger mb-3">3. วันหยุด (Leaves)</h6>
                        <button class="btn btn-sm btn-outline-danger fw-bold rounded-pill w-100 mb-3" style="background:var(--bg-body);" onclick="Swal.close(); setTimeout(()=>window.ShiftSchedulePage.addConfig('leave'), 300)"><i class="fa-solid fa-plus me-1"></i> เพิ่มวันหยุดใหม่</button>
                        <div style="max-height: 400px; overflow-y:auto; padding-right:5px;">${leaveHtml}</div>
                    </div>
                </div>
            `,
            showConfirmButton: false, showCloseButton: true
        });
    }

    addConfig(type) { this.openConfigForm(type, null); }
    editConfigModal(type, index) { this.openConfigForm(type, index); }

    openConfigForm(type, index) {
        let isLeave = type === 'leave';
        let isRole = type === 'role';
        let isShift = type === 'shift';
        let isEdit = index !== null;
        
        let targetObj = { id: '', label: '', time: '', quota: 0, color: 'blue' };

        if (isEdit) {
            let src = isRole ? this.customRoles[index] : (isLeave ? this.leaveTypes[index] : this.shiftTypes[index]);
            targetObj.id = src.id || '';
            targetObj.label = src.label || src.name || '';
            targetObj.time = src.time || '';
            targetObj.quota = src.quota || 0;
            
            if(src.color === '#2563eb') targetObj.color = 'blue';
            else if(src.color === '#059669') targetObj.color = 'green';
            else if(src.color === '#d97706') targetObj.color = 'orange';
            else if(src.color === '#dc2626') targetObj.color = 'red';
            else if(src.color === '#7c3aed') targetObj.color = 'purple';
            else targetObj.color = 'gray';
        }
        
        let colorOptions = `
            <option value="blue" ${targetObj.color==='blue'?'selected':''}>น้ำเงิน (Blue)</option>
            <option value="green" ${targetObj.color==='green'?'selected':''}>เขียว (Green)</option>
            <option value="orange" ${targetObj.color==='orange'?'selected':''}>ส้ม (Orange)</option>
            <option value="red" ${targetObj.color==='red'?'selected':''}>แดง (Red)</option>
            <option value="purple" ${targetObj.color==='purple'?'selected':''}>ม่วง (Purple)</option>
            <option value="gray" ${targetObj.color==='gray'?'selected':''}>เทา (Gray)</option>
        `;

        Swal.fire({
            title: `<h5 class="fw-bold text-dark">${isEdit ? 'แก้ไข' : 'เพิ่ม'}${isRole ? 'ตำแหน่ง' : (isLeave ? 'วันหยุด' : 'กะทำงาน')}</h5>`,
            background: 'var(--bg-surface)', customClass: { popup: 'premium-alert' },
            html: `
                <div class="text-start mt-3" style="font-family:'Sarabun';">
                    <label class="form-label fw-bold small text-secondary">รหัสอ้างอิง (ภาษาอังกฤษสั้นๆ) ${isEdit ? '<span class="text-danger">*ห้ามแก้ไข*</span>' : ''}</label>
                    <input type="text" id="conf-id" class="form-control input-modern mb-3 text-uppercase" value="${targetObj.id}" ${isEdit ? 'disabled' : ''}>
                    
                    <label class="form-label fw-bold small text-secondary">ชื่อเรียก (แสดงบนตาราง)</label>
                    <input type="text" id="conf-label" class="form-control input-modern mb-3" value="${targetObj.label}">
                    
                    ${isShift ? `
                    <label class="form-label fw-bold small text-primary"><i class="fa-solid fa-clock me-1"></i> เวลาทำการ (เช่น 08:00 - 12:00) <span class="text-muted fw-normal">(ปล่อยว่างได้)</span></label>
                    <input type="text" id="conf-time" class="form-control input-modern mb-3" placeholder="08:00 - 12:00" value="${targetObj.time}">` : ''}

                    ${isLeave ? `
                    <label class="form-label fw-bold small text-danger">โควตาสูงสุดต่อปี (วัน) <span class="text-muted fw-normal">(ใส่ 0 ถ้าไม่มีลิมิต)</span></label>
                    <input type="number" id="conf-quota" class="form-control input-modern mb-3" value="${targetObj.quota}" min="0">` : ''}
                    
                    <label class="form-label fw-bold small text-secondary">เลือกโทนสีประจำตัว</label>
                    <select id="conf-color" class="form-select input-modern">${colorOptions}</select>
                </div>
            `,
            showCancelButton: true, confirmButtonText: 'บันทึก', confirmButtonColor: '#2563eb',
            preConfirm: () => {
                let id = document.getElementById('conf-id').value.trim().toLowerCase(); 
                if(!isRole) id = id.toUpperCase(); 

                let label = document.getElementById('conf-label').value.trim();
                if(!id || !label) { Swal.showValidationMessage('กรุณากรอกรหัสและชื่อเรียก'); return false; }
                
                if (!isEdit) {
                    if (isRole && this.customRoles.some(r => r.id === id)) { Swal.showValidationMessage('รหัสตำแหน่งนี้ถูกใช้ไปแล้ว'); return false; }
                    if (!isRole && (this.shiftTypes.some(s => s.id === id) || this.leaveTypes.some(l => l.id === id))) { Swal.showValidationMessage('รหัสนี้ถูกใช้ไปแล้ว'); return false; }
                }

                let colorChoice = document.getElementById('conf-color').value;
                let bg, color, border;
                if(colorChoice==='blue'){ bg='#eff6ff'; color='#2563eb'; border='#bfdbfe'; }
                else if(colorChoice==='green'){ bg='#ecfdf5'; color='#059669'; border='#a7f3d0'; }
                else if(colorChoice==='orange'){ bg='#fffbeb'; color='#d97706'; border='#fde68a'; }
                else if(colorChoice==='red'){ bg='#fef2f2'; color='#dc2626'; border='#fecaca'; }
                else if(colorChoice==='purple'){ bg='#f5f3ff'; color='#7c3aed'; border='#ddd6fe'; }
                else { bg='#f8fafc'; color='#64748b'; border='#cbd5e1'; }

                let newObj = isRole ? { id, name: label, bg, color, border } : { id, label, bg, color };
                if (isLeave) newObj.quota = Number(document.getElementById('conf-quota').value) || 0;
                if (isShift) newObj.time = document.getElementById('conf-time').value.trim();
                return newObj;
            }
        }).then(res => {
            if(res.isConfirmed) {
                if (isEdit) {
                    if(isRole) this.customRoles[index] = res.value;
                    else if(isLeave) this.leaveTypes[index] = res.value;
                    else this.shiftTypes[index] = res.value;
                } else {
                    if(isRole) this.customRoles.push(res.value);
                    else if(isLeave) this.leaveTypes.push(res.value);
                    else this.shiftTypes.push(res.value);
                }
                
                db.ref('clinic_shift_settings_v2').set({ shift_types: this.shiftTypes, leave_types: this.leaveTypes, roles: this.customRoles })
                  .then(() => window.ShiftSchedulePage.openSettingsModal());
            } else if (res.isDismissed) { window.ShiftSchedulePage.openSettingsModal(); }
        });
    }

    deleteConfig(type, index) {
        Swal.fire({ title: 'ลบการตั้งค่านี้?', icon: 'warning', background: 'var(--bg-surface)', showCancelButton: true, confirmButtonColor: '#ef4444', customClass: { popup: 'premium-alert' } }).then(res => {
            if(res.isConfirmed) {
                if(type === 'role') this.customRoles.splice(index, 1);
                else if(type === 'leave') this.leaveTypes.splice(index, 1);
                else this.shiftTypes.splice(index, 1);
                
                db.ref('clinic_shift_settings_v2').set({ shift_types: this.shiftTypes, leave_types: this.leaveTypes, roles: this.customRoles })
                  .then(() => window.ShiftSchedulePage.openSettingsModal());
            } else { window.ShiftSchedulePage.openSettingsModal(); }
        });
    }

    resetModalForm() {
        document.querySelectorAll('.date-batch-cb').forEach(cb => cb.checked = false);
        document.querySelectorAll('.shift-radio').forEach(cb => cb.checked = false);
        document.querySelectorAll('.leave-cb').forEach(cb => cb.checked = false);
    }
    
    escapeHTML(str) {
        if (!str && str !== 0) return '';
        return String(str).replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
    }
}

window.ShiftSchedulePage = new ShiftSchedulePageComponent();
if (typeof App !== 'undefined') {
    if (!App.pages) App.pages = {};
    App.pages.shift_schedule = window.ShiftSchedulePage;
} else if (typeof window.App !== 'undefined') {
    if (!window.App.pages) window.App.pages = {};
    window.App.pages.shift_schedule = window.ShiftSchedulePage;
}