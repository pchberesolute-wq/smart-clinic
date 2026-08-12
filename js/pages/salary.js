// js/pages/salary.js
// 🚀 Enterprise Payroll Module V13.0: Stability First, Safe DOM Updates & 9Hrs Break Deduction

class SalaryPageComponent {
    constructor() {
        this.currentMonth = new Date().toISOString().slice(0, 7); 
        this.staffList = [];
        this.timesheetDataCurrent = {}; 
        this.timesheetDataPrev = {};
        this.payrollConfig = {}; 
        this.payrollLedger = {}; 
        this.shiftTypes = [];
        this.leaveTypes = [];
        this.customRoles = [];
        this.firebaseListeners = [];
        this.isAuthenticated = false; 
        this.thaiFullDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']; 
        
        this.saveTimeout = null;
        this.activeInputId = null; 
    }

    get html() {
        return `
            <style>
                .vault-locked { filter: blur(10px); opacity: 0; pointer-events: none; transition: all 0.5s ease; }
                .vault-unlocked { filter: blur(0); opacity: 1; pointer-events: auto; }
                
                .payroll-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
                .table-payroll th { background: var(--bg-body); color: var(--text-muted); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid var(--border-color); padding: 14px 8px; white-space: nowrap; font-family: 'Prompt', sans-serif; position: sticky; top: 0; z-index: 11;}
                .table-payroll td { vertical-align: middle; padding: 10px 8px; border-bottom: 1px solid var(--border-color); font-size: 13px; font-weight: 600; color: var(--text-dark); }
                .table-payroll tbody tr { transition: background 0.2s; }
                .table-payroll tbody tr:hover { background-color: var(--bg-body); }
                
                .input-salary { 
                    background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px; 
                    padding: 8px; font-weight: 700; color: var(--text-dark); width: 100%; text-align: right; min-width: 100px;
                    transition: all 0.2s; font-family: 'Prompt', monospace;
                }
                .input-salary:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15); outline: none; background: #ffffff; }
                
                .input-ot-pill {
                    background: #ffffff; border: 2px solid #fbbf24; border-radius: 12px; 
                    padding: 6px 10px; font-weight: 800; color: #d97706; width: 70px; text-align: center; 
                    margin: 0 auto; display: block; transition: all 0.2s; font-family: 'Prompt', monospace; font-size: 15px;
                }
                .input-ot-pill:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.2); outline: none; }
                .input-edited { background-color: #fffbeb !important; border-color: #f59e0b !important; }

                .total-salary-text { font-size: 16px; color: #000000; font-weight: 800; font-family: 'Prompt', monospace; transition: color 0.3s; }
                .total-salary-text.updating { color: #f59e0b !important; transform: scale(1.05); }

                .rate-hint { font-size: 10px; color: var(--text-muted); display: block; text-align: center; margin-top: 6px; font-weight: normal; }
                .rate-hint-base { font-size: 10px; color: var(--primary); display: block; text-align: right; margin-top: 6px; font-weight: bold; }

                .pin-pad-container { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: var(--bg-body); display: flex; align-items: center; justify-content: center; z-index: 99999; }
                input[type="month"] { color-scheme: light dark; }

                .detail-modal-box { background: var(--bg-body); border-radius: 12px; padding: 15px; margin-bottom: 15px; border: 1px solid var(--border-color); }
                .math-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; margin-bottom: 5px; }
                .input-modern-calc { background: var(--bg-surface); border: 2px solid var(--border-color); border-radius: 10px; padding: 8px 12px; font-weight: 800; color: var(--text-dark); width: 100%; text-align: center; font-size: 15px; transition: all 0.3s; font-family: 'Prompt', monospace; }
                .input-modern-calc:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(37,99,235,0.15); outline: none; }
                
                .breakdown-table th { background: var(--bg-body); position: sticky; top: 0; font-size: 11px; padding: 8px; z-index: 2; border-bottom: 1px solid var(--border-color); color: var(--text-muted); }
                .breakdown-table td { padding: 6px 8px; font-size: 12px; border-bottom: 1px solid var(--border-color); color: var(--text-dark); vertical-align: middle; }
                .breakdown-table tr:hover td { background: var(--bg-surface); }
                .breakdown-table-scroll { max-height: 480px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 12px; }
                .breakdown-table-scroll::-webkit-scrollbar { width: 6px; }
                .breakdown-table-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                
                .input-daily-ot { width: 60px; padding: 4px; text-align: center; border: 1px solid var(--border-color); border-radius: 6px; font-weight: bold; background: var(--bg-surface); color: var(--primary); transition: 0.2s; }
                .input-daily-ot:focus { border-color: var(--primary); outline: none; box-shadow: 0 0 0 2px rgba(37,99,235,0.2); }
                .input-daily-ot.edited { background: #fffbeb; border-color: #f59e0b; color: #d97706; }
                
                #cloud-sync-status { display: inline-flex; align-items: center; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 50px; transition: 0.3s; }
                .sync-saved { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .sync-saving { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
            </style>

            <div id="payroll-secure-vault" class="vault-locked">
                <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                    <div>
                        <h2 class="page-title" style="font-weight: 800; color: var(--text-dark);">
                            <div class="d-inline-flex align-items-center justify-content-center rounded-4 shadow-sm me-2" style="width: 45px; height: 45px; background: linear-gradient(135deg, #10b981, #059669); color: white;">
                                <i class="fa-solid fa-file-invoice-dollar"></i>
                            </div>
                            ระบบคำนวณเงินเดือน <span class="text-muted fw-normal" style="font-size: 20px;">(Payroll & OT)</span>
                        </h2>
                        <div class="d-flex align-items-center mt-2">
                            <span id="cloud-sync-status" class="sync-saved shadow-sm border border-success border-opacity-25 me-2">
                                <i class="fa-solid fa-cloud-check me-1"></i> ระบบ Auto-Save ทำงาน
                            </span>
                            <span class="text-muted fw-bold small">| ยืนยันสิทธิ์ Admin | พิมพ์ตัวเลขเพื่อบันทึกทันที</span>
                        </div>
                    </div>
                    <div class="d-flex gap-2 align-items-center flex-wrap">
                        <div class="px-3 py-2 rounded-pill shadow-sm border border-2 d-flex align-items-center bg-surface" style="border-color: var(--primary) !important;">
                            <i class="fa-regular fa-calendar text-primary me-2"></i>
                            <input type="month" id="payroll-month-picker" class="border-0 fw-bold text-primary bg-transparent" style="outline: none; font-size: 15px;" onchange="window.SalaryPage.changeMonth(this.value)">
                        </div>
                        <button class="btn btn-success fw-bold shadow-sm rounded-pill px-4" onclick="window.SalaryPage.exportToExcel()">
                            <i class="fa-solid fa-file-excel me-1"></i> ส่งออก Excel
                        </button>
                    </div>
                </div>

                <div class="row g-4 mb-4" id="payroll-dashboard-stats">
                    <div class="col-md-4">
                        <div class="payroll-card p-4 h-100 position-relative overflow-hidden" style="border-top: 4px solid var(--primary);">
                            <div class="text-muted fw-bold small text-uppercase mb-1">รอบบิลเงินเดือน (PAYROLL CYCLE)</div>
                            <h4 class="fw-bold text-dark mb-0" id="stat-cycle-date">--</h4>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="payroll-card p-4 h-100 position-relative overflow-hidden" style="border-top: 4px solid #8b5cf6;">
                            <div class="text-muted fw-bold small text-uppercase mb-1">ชั่วโมง OT รวมทั้งคลินิก</div>
                            <h4 class="fw-bold mb-0" style="color: #8b5cf6;" id="stat-ot-hours">0 ชม.</h4>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="payroll-card p-4 h-100 position-relative overflow-hidden" style="border-top: 4px solid #10b981;">
                            <div class="text-muted fw-bold small text-uppercase mb-1">ยอดจ่ายสุทธิประเมิน (ESTIMATED TOTAL)</div>
                            <h4 class="fw-bold text-success mb-0" id="stat-total-budget">฿ 0.00</h4>
                        </div>
                    </div>
                </div>

                <div class="payroll-card p-0 overflow-hidden shadow-sm" style="max-height: 60vh; overflow-y: auto;">
                    <table class="table table-payroll w-100 mb-0">
                        <thead>
                            <tr>
                                <th class="text-center" style="width: 3%;">ที่</th>
                                <th style="width: 22%;">รายชื่อพนักงาน</th>
                                <th class="text-end" style="width: 15%;">เงินเดือนพื้นฐาน<br><small class="text-muted">(BASE SALARY)</small></th>
                                <th class="text-center" style="width: 12%;">วันทำงาน<br><small class="text-muted">(21-20)</small></th>
                                <th class="text-center" style="width: 12%;">OT 1.5X<br><small class="text-primary">(ชั่วโมง)</small></th>
                                <th class="text-center" style="width: 12%;">OT 3.0X<br><small class="text-danger">(ชั่วโมง)</small></th>
                                <th class="text-end" style="width: 15%;">ยอดรับสุทธิ<br><small class="text-muted">(หัก ปสค.)</small></th>
                                <th class="text-center" style="width: 9%;">รายละเอียด</th>
                            </tr>
                        </thead>
                        <tbody id="payroll-table-body">
                            <tr><td colspan="8" class="text-center py-5"><i class="fas fa-spinner fa-spin fa-2x text-primary mb-3"></i><br>กำลังประมวลผลข้อมูลเงินเดือน...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    async init() {
        if (typeof db === 'undefined') return;
        window.SalaryPage = this;
        await this.requireAdminLock();
    }

    destroy() {
        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        this.isAuthenticated = false;
        if(this.saveTimeout) clearTimeout(this.saveTimeout);
    }

    async requireAdminLock() {
        try {
            const pinSnap = await db.ref('clinic_settings_v2/admin_pin').once('value');
            const adminPin = pinSnap.val();

            if (!adminPin) {
                Swal.fire({ icon: 'warning', title: 'ระบบยังไม่พร้อม', text: 'ยังไม่ได้ตั้งค่า Admin PIN', confirmButtonText: 'กลับ', allowOutsideClick: false }).then(() => App.switchPage('dashboard'));
                return;
            }

            const { value: enteredPin, isDismissed } = await Swal.fire({
                title: '<i class="fa-solid fa-vault text-warning fa-2x mb-2"></i><br>กรุณากรอกรหัสผ่าน Admin',
                html: '<input type="password" id="payroll-auth-pin" class="form-control text-center fw-bold fs-3 tracking-widest mx-auto" style="letter-spacing:15px; border-radius:14px; max-width: 250px; background: var(--bg-body); color: var(--text-dark);" maxlength="6">',
                showCancelButton: true, confirmButtonText: 'ปลดล็อก', cancelButtonText: 'ยกเลิก', customClass: { popup: 'premium-alert' }, allowOutsideClick: false,
                preConfirm: () => {
                    const pin = document.getElementById('payroll-auth-pin').value;
                    if (pin !== adminPin.toString()) { Swal.showValidationMessage('รหัส PIN ไม่ถูกต้อง!'); return false; }
                    return true;
                }
            });

            if (isDismissed) { App.switchPage('dashboard'); return; }

            this.isAuthenticated = true;
            document.getElementById('payroll-secure-vault').classList.replace('vault-locked', 'vault-unlocked');
            document.getElementById('payroll-month-picker').value = this.currentMonth;
            this.loadInitialData();

        } catch (error) { App.switchPage('dashboard'); }
    }

    parseFbArray(obj, defaultArr) {
        if (!obj) return defaultArr;
        if (Array.isArray(obj) && obj.length > 0) return obj.filter(Boolean);
        const vals = Object.values(obj).filter(Boolean);
        return vals.length > 0 ? vals : defaultArr;
    }

    async loadInitialData() {
        if (!this.isAuthenticated) return;

        try {
            const snapSettings = await db.ref('clinic_shift_settings_v2').once('value');
            const dataConfig = snapSettings.val() || {};
            
            this.shiftTypes = this.parseFbArray(dataConfig.shift_types, [
                { id: 'R1', label: 'รอบ 1', time: '06:00 - 10:00', bg: '#eff6ff', color: '#2563eb' },
                { id: 'R2', label: 'รอบ 2', time: '10:00 - 14:00', bg: '#fffbeb', color: '#d97706' },
                { id: 'R3', label: 'รอบ 3', time: '14:00 - 18:00', bg: '#f5f3ff', color: '#7c3aed' }
            ]);
            
            this.leaveTypes = this.parseFbArray(dataConfig.leave_types, [
                { id: 'OFF', label: 'วันหยุด (Off)', bg: '#f8fafc', color: '#64748b' },
                { id: 'HOL', label: 'วันหยุดยาว/นักขัตฤกษ์', bg: '#fefce8', color: '#b45309' },
                { id: 'VL', label: 'พักร้อน (VL)', bg: '#fdf4ff', color: '#c026d3' }
            ]);

            this.customRoles = this.parseFbArray(dataConfig.roles, [
                { id: 'doctor', name: 'แพทย์ (MD)' }, { id: 'nurse', name: 'พยาบาล (RN)' }, { id: 'assistant', name: 'ผู้ช่วย (PN/NA)' }
            ]);

            const cbUsers = db.ref('clinic_users_v2').on('value', snap => {
                const dataUsers = snap.val();
                let rawUsers = dataUsers ? (Array.isArray(dataUsers) ? dataUsers : Object.keys(dataUsers).map(k => ({ firebaseKey: k, ...dataUsers[k] }))) : [];
                this.staffList = rawUsers.filter(u => u && u.status === 'active').sort((a, b) => (a.order || 999) - (b.order || 999));
                this.processPayrollEngine(true); 
            });
            this.firebaseListeners.push({ path: 'clinic_users_v2', callback: cbUsers });

            const cbPayroll = db.ref('clinic_payroll_v2').on('value', snap => {
                this.payrollConfig = snap.val() || {};
                this.processPayrollEngine(false); 
            });
            this.firebaseListeners.push({ path: 'clinic_payroll_v2', callback: cbPayroll });

            this.setupTimeDataListeners();
        } catch (err) {}
    }

    setupTimeDataListeners() {
        const pathTsCurrent = `clinic_timesheet_v2/${this.currentMonth}`;
        const cbTsCurrent = db.ref(pathTsCurrent).on('value', snap => {
            this.timesheetDataCurrent = snap.val() || {};
            this.processPayrollEngine(false);
        });
        this.firebaseListeners.push({ path: pathTsCurrent, callback: cbTsCurrent });

        const [y, m] = this.currentMonth.split('-');
        let prevDate = new Date(parseInt(y), parseInt(m) - 1, 1);
        prevDate.setMonth(prevDate.getMonth() - 1);
        this.prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

        const pathTsPrev = `clinic_timesheet_v2/${this.prevMonth}`;
        const cbTsPrev = db.ref(pathTsPrev).on('value', snap => {
            this.timesheetDataPrev = snap.val() || {};
            this.processPayrollEngine(false);
        });
        this.firebaseListeners.push({ path: pathTsPrev, callback: cbTsPrev });

        const pathLedger = `clinic_payroll_ledger_v2/${this.currentMonth}`;
        const cbLedger = db.ref(pathLedger).on('value', snap => {
            this.payrollLedger = snap.val() || {};
            this.processPayrollEngine(false);
        });
        this.firebaseListeners.push({ path: pathLedger, callback: cbLedger });
    }

    changeMonth(newMonth) {
        if(!newMonth || this.currentMonth === newMonth) return;
        this.currentMonth = newMonth;
        
        const [y, m] = this.currentMonth.split('-');
        let prevDate = new Date(parseInt(y), parseInt(m) - 1, 1);
        prevDate.setMonth(prevDate.getMonth() - 1);
        const pMonthTh = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
        
        document.getElementById('stat-cycle-date').innerText = `21 ${pMonthTh[prevDate.getMonth()]} - 20 ${pMonthTh[parseInt(m) - 1]} ${parseInt(y) + 543}`;
        document.getElementById('payroll-table-body').innerHTML = `<tr><td colspan="8" class="text-center py-5"><i class="fas fa-circle-notch fa-spin fa-2x text-primary mb-3"></i><br>กำลังดึงข้อมูล...</td></tr>`;

        this.firebaseListeners.forEach(l => db.ref(l.path).off('value', l.callback));
        this.firebaseListeners = [];
        this.loadInitialData(); 
    }

    getShiftDuration(timeStr) {
        if (!timeStr) return 4; 
        try {
            let parts = timeStr.split('-');
            if(parts.length !== 2) return 4;
            let [sH, sM] = parts[0].trim().split(':').map(Number);
            let [eH, eM] = parts[1].trim().split(':').map(Number);
            let diff = (eH + (eM||0)/60) - (sH + (sM||0)/60);
            return diff > 0 ? diff : (diff + 24); 
        } catch(e) { return 4; }
    }

    getStaffPayrollData(staffUname) {
        const [y, m] = this.currentMonth.split('-');
        let prevDateObj = new Date(parseInt(y), parseInt(m) - 1, 1);
        prevDateObj.setMonth(prevDateObj.getMonth() - 1);
        let pYear = prevDateObj.getFullYear();
        let pMonth = prevDateObj.getMonth();
        let daysInPrevMonth = new Date(pYear, pMonth + 1, 0).getDate();

        let autoWorkingDays = 0;
        let sumOt15 = 0;
        let sumOt30 = 0;
        let dailyBreakdown = []; 
        
        let ledger = this.payrollLedger[staffUname] || {};
        let dailyOverrides = ledger.dailyOtOverrides || {}; 

        const processDay = (dStr, rawStatus, yearNum, monthIndex, dayNum) => {
            let dateObj = new Date(yearNum, monthIndex, dayNum);
            let isWeekendOrHoliday = dateObj.getDay() === 0; 
            let isWork = false;
            let dailyHrs = 0;
            let shiftLabels = [];

            if (rawStatus) {
                String(rawStatus).split(',').forEach(item => {
                    let isRoundOff = String(item).endsWith('_O');
                    let cleanId = String(item).includes('_') ? String(item).split('_')[0] : (String(item).includes('|') ? String(item).split('|')[0] : String(item));
                    
                    let shiftConf = this.shiftTypes.find(s => s.id === cleanId);
                    if (shiftConf && !isRoundOff) {
                        isWork = true;
                        let hrs = this.getShiftDuration(shiftConf.time);
                        dailyHrs += hrs;
                        shiftLabels.push(`<span class="badge" style="background:${shiftConf.bg}; color:${shiftConf.color}; border:1px solid ${shiftConf.color}40;">${shiftConf.id} (${hrs} ชม.)</span>`);
                    } else {
                        let leaveConf = this.leaveTypes.find(l => l.id === cleanId);
                        if(leaveConf) {
                            shiftLabels.push(`<span class="badge" style="background:${leaveConf.bg}; color:${leaveConf.color}; border:1px solid ${leaveConf.color}40;">${leaveConf.label}</span>`);
                            if (leaveConf.id === 'HOL') isWeekendOrHoliday = true; 
                        }
                    }
                });
            }

            if (isWork) autoWorkingDays++;
            
            // 🧮 กฎ 9 ชม. หักพัก 1 ชม. เหลือทำงานจริง 8 ชม.
            let autoDailyOt = 0;
            let breakTime = 0;
            
            if (dailyHrs > 8) {
                let excess = dailyHrs - 8;
                if (excess <= 1) { breakTime = excess; autoDailyOt = 0; } 
                else { breakTime = 1; autoDailyOt = excess - 1; }
            }

            let finalOt15 = 0; let finalOt30 = 0; let isEdited = false;

            if (dailyOverrides[dStr]) {
                finalOt15 = Number(dailyOverrides[dStr].ot15) || 0;
                finalOt30 = Number(dailyOverrides[dStr].ot30) || 0;
                isEdited = true;
            } else {
                if (autoDailyOt > 0) {
                    if (isWeekendOrHoliday) finalOt30 = autoDailyOt;
                    else finalOt15 = autoDailyOt;
                }
            }

            sumOt15 += finalOt15;
            sumOt30 += finalOt30;

            dailyBreakdown.push({
                dStr: dStr, date: `${String(dayNum).padStart(2, '0')}/${String(monthIndex + 1).padStart(2, '0')}/${yearNum + 543}`,
                dayName: this.thaiFullDays[dateObj.getDay()], isWeekendOrHoliday: isWeekendOrHoliday,
                shifts: shiftLabels.length > 0 ? shiftLabels.join(' ') : '<span class="text-muted">-</span>',
                hours: dailyHrs, breakTime: breakTime, autoOt: autoDailyOt,
                finalOt15: finalOt15, finalOt30: finalOt30, isEdited: isEdited
            });
        };

        for (let d = 21; d <= daysInPrevMonth; d++) {
            let dStr = `${this.prevMonth}-${String(d).padStart(2, '0')}`;
            let rawStatus = (this.timesheetDataPrev && this.timesheetDataPrev[staffUname]) ? this.timesheetDataPrev[staffUname][dStr] : '';
            processDay(dStr, rawStatus, pYear, pMonth, d);
        }

        let cYear = parseInt(y); let cMonth = parseInt(m) - 1;
        for (let d = 1; d <= 20; d++) {
            let dStr = `${this.currentMonth}-${String(d).padStart(2, '0')}`;
            let rawStatus = (this.timesheetDataCurrent && this.timesheetDataCurrent[staffUname]) ? this.timesheetDataCurrent[staffUname][dStr] : '';
            processDay(dStr, rawStatus, cYear, cMonth, d);
        }

        let displayWorkDays = ledger.manualWorkDays !== undefined ? Number(ledger.manualWorkDays) : autoWorkingDays;
        let displayOt15 = ledger.manualOt15 !== undefined ? Number(ledger.manualOt15) : sumOt15;
        let displayOt30 = ledger.manualOt30 !== undefined ? Number(ledger.manualOt30) : sumOt30;

        let pConfig = this.payrollConfig[staffUname] || { base: 0, sso: null };
        let baseSalary = Number(pConfig.base) || 0;
        
        let autoSso = baseSalary > 0 ? Math.min(baseSalary * 0.05, 750) : 0;
        let finalSso = pConfig.sso !== null && pConfig.sso !== undefined ? Number(pConfig.sso) : autoSso;
        
        let dailyRate = baseSalary / 30;
        let hourlyRate = dailyRate / 8;
        let otRate15 = hourlyRate * 1.5;
        let otRate30 = hourlyRate * 3.0;

        let netPayable = baseSalary + (displayOt15 * otRate15) + (displayOt30 * otRate30) - finalSso;

        return { 
            autoWorkingDays, dailyBreakdown, displayWorkDays, displayOt15, displayOt30, 
            isWdEdited: displayWorkDays !== autoWorkingDays,
            isOt15Edited: displayOt15 !== sumOt15, isOt30Edited: displayOt30 !== sumOt30,
            baseSalary, finalSso, autoSso, isSsoEdited: finalSso !== autoSso,
            dailyRate, hourlyRate, otRate15, otRate30, netPayable 
        };
    }

    processPayrollEngine(isFullRender = false) {
        if (!this.isAuthenticated || this.staffList.length === 0) return;

        const tbody = document.getElementById('payroll-table-body');
        const [y, m] = this.currentMonth.split('-');
        let prevDateObj = new Date(parseInt(y), parseInt(m) - 1, 1);
        prevDateObj.setMonth(prevDateObj.getMonth() - 1);
        const pMonthTh = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
        
        document.getElementById('stat-cycle-date').innerText = `21 ${pMonthTh[prevDateObj.getMonth()]} - 20 ${pMonthTh[parseInt(m) - 1]} ${parseInt(y) + 543}`;

        let totalBudget = 0; let totalOtHours = 0; 
        
        // 🚨 ป้องกัน Race Condition: ตรวจสอบว่า HTML ถูกสร้างหรือยัง
        if (isFullRender || !tbody.querySelector('tr[id^="row_"]')) {
            let html = '';
            this.staffList.forEach((staff, index) => {
                let staffUname = staff.username || staff.firebaseKey;
                let data = this.getStaffPayrollData(staffUname);
                totalOtHours += (data.displayOt15 + data.displayOt30); totalBudget += data.netPayable;
                let safeName = this.escapeHTML(staff.name || staff.username);
                let roleConf = this.customRoles.find(r => r.id === staff.role) || { name: staff.role };

                html += `
                <tr id="row_${staffUname}">
                    <td class="text-center text-muted fw-bold">${index + 1}</td>
                    <td>
                        <div class="fw-bold" style="font-size: 14.5px; color: var(--text-dark);">${safeName}</div>
                        <div class="small text-muted">${this.escapeHTML(roleConf.name)}</div>
                    </td>
                    <td class="text-end pe-3 border-end">
                        <input type="number" id="base_${staffUname}" class="input-salary" value="${data.baseSalary}" placeholder="0" 
                            onfocus="window.SalaryPage.setActiveInput(this.id)" onblur="window.SalaryPage.clearActiveInput()"
                            oninput="window.SalaryPage.handleInput('${staffUname}', 'base')">
                        <span class="rate-hint-base" id="hrate_${staffUname}">เรท ฿${data.hourlyRate.toFixed(2)}/ชม.</span>
                    </td>
                    <td class="text-center border-end pe-3">
                        <input type="number" step="0.5" id="wd_${staffUname}" class="input-ot-pill ${data.isWdEdited ? 'input-edited' : ''}" value="${data.displayWorkDays}" 
                            onfocus="window.SalaryPage.setActiveInput(this.id)" onblur="window.SalaryPage.clearActiveInput()"
                            oninput="window.SalaryPage.handleInput('${staffUname}', 'wd')">
                        <span class="rate-hint text-muted">วัน (Auto: ${data.autoWorkingDays})</span>
                    </td>
                    <td class="text-center">
                        <input type="number" step="0.5" id="ot15_${staffUname}" class="input-ot-pill ${data.isOt15Edited ? 'input-edited' : ''}" value="${data.displayOt15}" 
                            onfocus="window.SalaryPage.setActiveInput(this.id)" onblur="window.SalaryPage.clearActiveInput()"
                            oninput="window.SalaryPage.handleInput('${staffUname}', 'ot15')">
                        <span class="rate-hint" id="hint15_${staffUname}">@ ฿${data.otRate15.toFixed(2)}</span>
                    </td>
                    <td class="text-center border-end pe-3">
                        <input type="number" step="0.5" id="ot30_${staffUname}" class="input-ot-pill ${data.isOt30Edited ? 'input-edited' : ''}" value="${data.displayOt30}" 
                            onfocus="window.SalaryPage.setActiveInput(this.id)" onblur="window.SalaryPage.clearActiveInput()"
                            oninput="window.SalaryPage.handleInput('${staffUname}', 'ot30')">
                        <span class="rate-hint text-danger" id="hint30_${staffUname}">@ ฿${data.otRate30.toFixed(2)}</span>
                    </td>
                    <td class="text-end total-salary-text" id="net_${staffUname}">
                        ฿ ${data.netPayable.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        ${data.finalSso > 0 ? `<div class="small text-danger fw-normal" style="font-size:10px; margin-top:4px;">(หัก ปสค. ฿${data.finalSso.toLocaleString('th-TH')})</div>` : ''}
                    </td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-primary fw-bold rounded-pill shadow-sm px-3" onclick="window.SalaryPage.openDetailModal('${staffUname}')">
                            <i class="fa-solid fa-list me-1"></i> รายละเอียด
                        </button>
                    </td>
                </tr>`;
            });
            tbody.innerHTML = html || `<tr><td colspan="8" class="text-center py-5">ไม่พบข้อมูลพนักงาน</td></tr>`;
        } else {
            // 🚨 Targeted Update (อัปเดตเฉพาะช่องที่ไม่ได้ Focus อยู่ เพื่อป้องกันเคอร์เซอร์หลุด)
            this.staffList.forEach(staff => {
                let staffUname = staff.username || staff.firebaseKey;
                let data = this.getStaffPayrollData(staffUname);
                totalOtHours += (data.displayOt15 + data.displayOt30); totalBudget += data.netPayable;

                const bEl = document.getElementById(`base_${staffUname}`);
                if (bEl && this.activeInputId !== `base_${staffUname}`) bEl.value = data.baseSalary;
                
                const wEl = document.getElementById(`wd_${staffUname}`);
                if (wEl && this.activeInputId !== `wd_${staffUname}`) {
                    wEl.value = data.displayWorkDays;
                    data.isWdEdited ? wEl.classList.add('input-edited') : wEl.classList.remove('input-edited');
                }
                
                const o1El = document.getElementById(`ot15_${staffUname}`);
                if (o1El && this.activeInputId !== `ot15_${staffUname}`) {
                    o1El.value = data.displayOt15;
                    data.isOt15Edited ? o1El.classList.add('input-edited') : o1El.classList.remove('input-edited');
                }

                const o3El = document.getElementById(`ot30_${staffUname}`);
                if (o3El && this.activeInputId !== `ot30_${staffUname}`) {
                    o3El.value = data.displayOt30;
                    data.isOt30Edited ? o3El.classList.add('input-edited') : o3El.classList.remove('input-edited');
                }

                const hrEl = document.getElementById(`hrate_${staffUname}`);
                if(hrEl) hrEl.innerText = `เรท ฿${data.hourlyRate.toFixed(2)}/ชม.`;
                
                const h1El = document.getElementById(`hint15_${staffUname}`);
                if(h1El) h1El.innerText = `@ ฿${data.otRate15.toFixed(2)}`;
                
                const h3El = document.getElementById(`hint30_${staffUname}`);
                if(h3El) h3El.innerText = `@ ฿${data.otRate30.toFixed(2)}`;
                
                const nEl = document.getElementById(`net_${staffUname}`);
                if(nEl) nEl.innerHTML = `฿ ${data.netPayable.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                   ${data.finalSso > 0 ? `<div class="small text-danger fw-normal" style="font-size:10px; margin-top:4px;">(หัก ปสค. ฿${data.finalSso.toLocaleString('th-TH')})</div>` : ''}`;
            });
        }

        document.getElementById('stat-ot-hours').innerText = `${totalOtHours} ชม.`;
        document.getElementById('stat-total-budget').innerText = `฿ ${totalBudget.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    setActiveInput(id) { this.activeInputId = id; }
    clearActiveInput() { this.activeInputId = null; }

    handleInput(staffUname, field) {
        let baseInput = document.getElementById(`base_${staffUname}`);
        let wdInput = document.getElementById(`wd_${staffUname}`);
        let ot15Input = document.getElementById(`ot15_${staffUname}`);
        let ot30Input = document.getElementById(`ot30_${staffUname}`);
        let netOutput = document.getElementById(`net_${staffUname}`);
        if(!baseInput || !ot15Input || !ot30Input || !netOutput) return; // Prevent JS Crash

        let baseVal = Number(baseInput.value) || 0;
        let ot15Val = Number(ot15Input.value) || 0;
        let ot30Val = Number(ot30Input.value) || 0;
        
        let data = this.getStaffPayrollData(staffUname); 
        let ssoVal = data.finalSso; 
        
        let hourlyRate = (baseVal / 30) / 8;
        let rate15 = hourlyRate * 1.5;
        let rate30 = hourlyRate * 3.0;
        let newNet = baseVal + (ot15Val * rate15) + (ot30Val * rate30) - ssoVal;

        document.getElementById(`hrate_${staffUname}`).innerText = `เรท ฿${hourlyRate.toFixed(2)}/ชม.`;
        document.getElementById(`hint15_${staffUname}`).innerText = `@ ฿${rate15.toFixed(2)}`;
        document.getElementById(`hint30_${staffUname}`).innerText = `@ ฿${rate30.toFixed(2)}`;
        netOutput.innerHTML = `฿ ${newNet.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                               ${ssoVal > 0 ? `<div class="small text-danger fw-normal" style="font-size:10px; margin-top:4px;">(หัก ปสค. ฿${ssoVal.toLocaleString('th-TH')})</div>` : ''}`;
        
        netOutput.classList.add('updating');
        setTimeout(() => netOutput.classList.remove('updating'), 300);

        if(field === 'wd') wdInput.classList.add('input-edited');
        if(field === 'ot15') ot15Input.classList.add('input-edited');
        if(field === 'ot30') ot30Input.classList.add('input-edited');
        
        this.recalcTotalBudgetLocal();
        this.triggerAutoSave();
    }

    recalcTotalBudgetLocal() {
        let totalMoney = 0; let totalHrs = 0;
        this.staffList.forEach(staff => {
            let staffUname = staff.username || staff.firebaseKey;
            totalHrs += (Number(document.getElementById(`ot15_${staffUname}`)?.value) || 0) + (Number(document.getElementById(`ot30_${staffUname}`)?.value) || 0);
            let netEl = document.getElementById(`net_${staffUname}`);
            if (netEl) totalMoney += Number(netEl.innerText.split('\n')[0].replace(/[^0-9.-]+/g,""));
        });
        document.getElementById('stat-ot-hours').innerText = `${totalHrs} ชม.`;
        document.getElementById('stat-total-budget').innerText = `฿ ${totalMoney.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    triggerAutoSave() {
        const statusEl = document.getElementById('cloud-sync-status');
        if(statusEl) {
            statusEl.className = 'sync-saving shadow-sm border border-warning border-opacity-25 me-2';
            statusEl.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> กำลังบันทึกข้อมูล...';
        }

        if(this.saveTimeout) clearTimeout(this.saveTimeout);
        
        this.saveTimeout = setTimeout(async () => {
            try {
                let globalUpdates = {}; let ledgerUpdates = {}; 
                this.staffList.forEach(staff => {
                    let staffUname = staff.username || staff.firebaseKey;
                    let wdInp = document.getElementById(`wd_${staffUname}`);
                    let baseInp = document.getElementById(`base_${staffUname}`);
                    let ot15Inp = document.getElementById(`ot15_${staffUname}`);
                    let ot30Inp = document.getElementById(`ot30_${staffUname}`);
                    let data = this.getStaffPayrollData(staffUname);

                    if (baseInp) {
                        globalUpdates[`clinic_payroll_v2/${staffUname}/base`] = Number(baseInp.value) || 0;
                        globalUpdates[`clinic_payroll_v2/${staffUname}/sso`] = data.finalSso; 
                        
                        ledgerUpdates[`clinic_payroll_ledger_v2/${this.currentMonth}/${staffUname}/manualWorkDays`] = Number(wdInp.value) || 0;
                        ledgerUpdates[`clinic_payroll_ledger_v2/${this.currentMonth}/${staffUname}/manualOt15`] = Number(ot15Inp.value) || 0;
                        ledgerUpdates[`clinic_payroll_ledger_v2/${this.currentMonth}/${staffUname}/manualOt30`] = Number(ot30Inp.value) || 0;
                    }
                });
                
                await Promise.all([db.ref().update(globalUpdates), db.ref().update(ledgerUpdates)]);
                
                if(statusEl) {
                    statusEl.className = 'sync-saved shadow-sm border border-success border-opacity-25 me-2';
                    statusEl.innerHTML = '<i class="fa-solid fa-cloud-check me-1"></i> Auto-Saved';
                }
            } catch (e) {
                if(statusEl) {
                    statusEl.className = 'sync-saving shadow-sm border border-danger border-opacity-25 me-2 text-danger';
                    statusEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-1"></i> ซิงก์ล้มเหลว';
                }
            }
        }, 800); 
    }

    openDetailModal(staffUname) {
        let staff = this.staffList.find(s => (s.username || s.firebaseKey) === staffUname);
        if(!staff) return;
        let safeName = this.escapeHTML(staff.name || staff.username);
        let data = this.getStaffPayrollData(staffUname);

        let tableRows = '';
        let modalSum15 = 0; let modalSum30 = 0;
        data.dailyBreakdown.forEach(day => {
            let rowColor = day.isWeekendOrHoliday ? 'background: rgba(239, 68, 68, 0.03);' : '';
            let dayColor = day.isWeekendOrHoliday ? 'color:#ef4444;' : '';
            let hrStr = day.hours > 0 ? `<b>${day.hours.toFixed(2)}</b>` : '-';
            if (day.breakTime > 0) hrStr += `<br><span style="font-size:9px; color:#f59e0b;">(หักพัก ${day.breakTime.toFixed(1)} ชม.)</span>`;

            modalSum15 += day.finalOt15; modalSum30 += day.finalOt30;

            let inp15 = day.isWeekendOrHoliday ? '-' : `<input type="number" step="0.5" class="input-daily-ot modal-daily-ot15 ${day.isEdited && day.finalOt15 > 0 ? 'edited' : ''}" data-date="${day.dStr}" value="${day.finalOt15}" min="0" oninput="window.SalaryPage.handleModalInput('${staffUname}')">`;
            let inp30 = day.isWeekendOrHoliday ? `<input type="number" step="0.5" class="input-daily-ot modal-daily-ot30 ${day.isEdited && day.finalOt30 > 0 ? 'edited' : ''}" data-date="${day.dStr}" value="${day.finalOt30}" min="0" oninput="window.SalaryPage.handleModalInput('${staffUname}')">` : '-';

            tableRows += `
                <tr style="${rowColor}">
                    <td class="text-center" style="${dayColor}">${day.date}</td>
                    <td class="text-center fw-bold" style="${dayColor}">${day.dayName}</td>
                    <td>${day.shifts}</td>
                    <td class="text-center" style="line-height:1.2;">${hrStr}</td>
                    <td class="text-center">${inp15}</td>
                    <td class="text-center">${inp30}</td>
                </tr>
            `;
        });
        if(tableRows === '') tableRows = `<tr><td colspan="6" class="text-center text-muted py-4">ไม่พบข้อมูลการลงเวรในรอบบิลนี้</td></tr>`;

        let html = `
            <div class="row text-start" style="font-family:'Prompt';">
                <div class="col-md-4 border-end pe-3">
                    <input type="hidden" id="modal-staff-uname" value="${staffUname}">
                    
                    <div class="detail-modal-box mb-3" style="border-left: 4px solid var(--primary);">
                        <div class="math-label"><i class="fa-solid fa-sack-dollar me-1"></i> 1. ฐานเงินเดือน (Base)</div>
                        <input type="number" id="modal-base" class="form-control input-modern-calc mb-2" value="${data.baseSalary}" oninput="window.SalaryPage.handleModalInput('${staffUname}')">
                        <div class="d-flex justify-content-between px-2 pb-1 border-bottom mb-2 mt-3">
                            <span class="text-muted small fw-bold">ค่าแรง / วัน</span><span class="fw-bold" style="color:var(--text-dark);" id="modal-daily-rate">฿ ${data.dailyRate.toFixed(2)}</span>
                        </div>
                        <div class="d-flex justify-content-between px-2 pb-1">
                            <span class="text-muted small fw-bold">ค่าแรง / ชม.</span><span class="fw-bold text-primary" id="modal-hourly-rate">฿ ${data.hourlyRate.toFixed(2)}</span>
                        </div>
                    </div>

                    <div class="detail-modal-box mb-3" style="border-left: 4px solid #f59e0b;">
                        <div class="math-label text-warning-dark d-flex justify-content-between">
                            <span><i class="fa-solid fa-calendar-check me-1"></i> 2. วันทำงาน</span>
                            <span class="badge bg-secondary cursor-pointer" onclick="document.getElementById('modal-wd').value='${data.autoWorkingDays}'; window.SalaryPage.handleModalInput('${staffUname}');">Auto: ${data.autoWorkingDays}</span>
                        </div>
                        <input type="number" step="0.5" id="modal-wd" class="form-control input-modern-calc" value="${data.displayWorkDays}" oninput="window.SalaryPage.handleModalInput('${staffUname}')">
                    </div>
                    
                    <div class="detail-modal-box mb-3" style="border-left: 4px solid #dc2626;">
                        <div class="math-label text-danger d-flex justify-content-between">
                            <span><i class="fa-solid fa-heart-pulse me-1"></i> 3. หักประกันสังคม</span>
                            <span class="badge bg-secondary cursor-pointer" onclick="document.getElementById('modal-sso').value='${data.autoSso}'; window.SalaryPage.handleModalInput('${staffUname}');">Auto: ${data.autoSso}</span>
                        </div>
                        <input type="number" id="modal-sso" class="form-control input-modern-calc text-danger" value="${data.finalSso}" oninput="window.SalaryPage.handleModalInput('${staffUname}')">
                    </div>

                    <div class="p-3 rounded-4 mt-3 mb-3" style="background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1)); border: 1px solid rgba(16,185,129,0.3);">
                        <div class="text-center text-success fw-bold small text-uppercase mb-1">ยอดรับสุทธิประเมิน</div>
                        <div class="text-center fw-bold" style="font-size: 24px; color: #059669; font-family:'Prompt', monospace;" id="modal-net-total">
                            ฿ ${data.netPayable.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                    
                    <button class="btn btn-dark w-100 fw-bold shadow-sm" onclick="window.SalaryPage.printIndividualSlip('${staffUname}')">
                        <i class="fa-solid fa-print me-1"></i> พิมพ์สลิป (Pay Slip)
                    </button>
                </div>

                <div class="col-md-8">
                    <div class="fw-bold mb-2 text-primary d-flex justify-content-between align-items-center">
                        <span><i class="fa-solid fa-clock me-1"></i> 4. แก้ไข OT รายวัน (ระบุเป็นชั่วโมง)</span>
                        <div class="d-flex gap-2">
                            <span class="badge bg-primary fs-6 py-2 px-3 shadow-sm" id="modal-sum-ot15">รวม 1.5x : ${modalSum15} ชม.</span>
                            <span class="badge bg-danger fs-6 py-2 px-3 shadow-sm" id="modal-sum-ot30">รวม 3.0x : ${modalSum30} ชม.</span>
                        </div>
                    </div>
                    <div class="breakdown-table-scroll bg-surface">
                        <table class="table breakdown-table w-100 mb-0">
                            <thead>
                                <tr>
                                    <th class="text-center" style="width: 15%;">วันที่</th>
                                    <th class="text-center" style="width: 5%;">วัน</th>
                                    <th style="width: 35%;">กะทำงาน / สถานะ</th>
                                    <th class="text-center" style="width: 15%;">เวลา (ชม.)</th>
                                    <th class="text-center text-primary" style="width: 15%;">OT 1.5x</th>
                                    <th class="text-center text-danger" style="width: 15%;">OT 3.0x</th>
                                </tr>
                            </thead>
                            <tbody>${tableRows}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        Swal.fire({
            title: `<div class="border-bottom pb-2 mb-2 text-start d-flex justify-content-between align-items-center"><h4 class="fw-bold mb-0 text-dark" style="font-family:'Prompt';"><i class="fa-solid fa-user-circle text-warning me-2"></i> ${safeName}</h4><span class="badge bg-success small"><i class="fa-solid fa-cloud-check me-1"></i> Auto-Save</span></div>`,
            html: html, width: '1000px', background: 'var(--bg-surface)', showConfirmButton: false, showCloseButton: true, customClass: { popup: 'premium-alert' }
        });
    }

    handleModalInput(staffUname) {
        let baseVal = Number(document.getElementById('modal-base').value) || 0;
        let ssoVal = Number(document.getElementById('modal-sso').value) || 0;
        let wdVal = Number(document.getElementById('modal-wd').value) || 0;

        let sumOt15 = 0; let sumOt30 = 0;
        let dailyOverrides = {};

        document.querySelectorAll('.modal-daily-ot15').forEach(el => { 
            let val = Number(el.value) || 0;
            let dStr = el.getAttribute('data-date');
            if(!dailyOverrides[dStr]) dailyOverrides[dStr] = { ot15:0, ot30:0 };
            dailyOverrides[dStr].ot15 = val;
            sumOt15 += val; 
            if(val > 0) el.classList.add('edited'); else el.classList.remove('edited');
        });
        
        document.querySelectorAll('.modal-daily-ot30').forEach(el => { 
            let val = Number(el.value) || 0;
            let dStr = el.getAttribute('data-date');
            if(!dailyOverrides[dStr]) dailyOverrides[dStr] = { ot15:0, ot30:0 };
            dailyOverrides[dStr].ot30 = val;
            sumOt30 += val; 
            if(val > 0) el.classList.add('edited'); else el.classList.remove('edited');
        });

        document.getElementById('modal-sum-ot15').innerText = `รวม 1.5x : ${sumOt15} ชม.`;
        document.getElementById('modal-sum-ot30').innerText = `รวม 3.0x : ${sumOt30} ชม.`;

        let dailyRate = baseVal / 30; let hourlyRate = dailyRate / 8;
        let rate15 = hourlyRate * 1.5; let rate30 = hourlyRate * 3.0;

        document.getElementById('modal-daily-rate').innerText = `฿ ${dailyRate.toFixed(2)}`;
        document.getElementById('modal-hourly-rate').innerText = `฿ ${hourlyRate.toFixed(2)}`;

        let newNet = baseVal + (sumOt15 * rate15) + (sumOt30 * rate30) - ssoVal;
        document.getElementById('modal-net-total').innerText = `฿ ${newNet.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        if(this.saveTimeout) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            let globalUpdates = {}; let ledgerUpdates = {}; 
            globalUpdates[`clinic_payroll_v2/${staffUname}/base`] = baseVal;
            globalUpdates[`clinic_payroll_v2/${staffUname}/sso`] = ssoVal; 
            ledgerUpdates[`clinic_payroll_ledger_v2/${this.currentMonth}/${staffUname}/manualWorkDays`] = wdVal;
            ledgerUpdates[`clinic_payroll_ledger_v2/${this.currentMonth}/${staffUname}/manualOt15`] = sumOt15;
            ledgerUpdates[`clinic_payroll_ledger_v2/${this.currentMonth}/${staffUname}/manualOt30`] = sumOt30;
            ledgerUpdates[`clinic_payroll_ledger_v2/${this.currentMonth}/${staffUname}/dailyOtOverrides`] = dailyOverrides;
            db.ref().update(globalUpdates); db.ref().update(ledgerUpdates);
        }, 500); 
    }

    printIndividualSlip(staffUname) {
        let staff = this.staffList.find(s => (s.username || s.firebaseKey) === staffUname);
        if(!staff) return;
        
        let safeName = this.escapeHTML(staff.name || staff.username);
        let roleConf = this.customRoles.find(r => r.id === staff.role) || { name: staff.role };
        let roleName = roleConf.name;

        let baseVal = Number(document.getElementById('modal-base').value) || 0;
        let wdVal = Number(document.getElementById('modal-wd').value) || 0;
        let ssoVal = Number(document.getElementById('modal-sso').value) || 0;
        
        let sumOt15 = 0; let sumOt30 = 0;
        document.querySelectorAll('.modal-daily-ot15').forEach(el => sumOt15 += (Number(el.value)||0));
        document.querySelectorAll('.modal-daily-ot30').forEach(el => sumOt30 += (Number(el.value)||0));

        let hourlyRate = (baseVal / 30) / 8;
        let rate15 = hourlyRate * 1.5;
        let rate30 = hourlyRate * 3.0;
        let ot15Pay = sumOt15 * rate15;
        let ot30Pay = sumOt30 * rate30;
        let grossPayable = baseVal + ot15Pay + ot30Pay;
        let netPayable = grossPayable - ssoVal;

        const cycleText = document.getElementById('stat-cycle-date').innerText;

        let data = this.getStaffPayrollData(staffUname);
        let tableRows = '';
        data.dailyBreakdown.forEach(day => {
            let dailyFinal15 = 0; let dailyFinal30 = 0;
            let mInp15 = document.querySelector(`.modal-daily-ot15[data-date="${day.dStr}"]`);
            if(mInp15) dailyFinal15 = Number(mInp15.value) || 0;
            let mInp30 = document.querySelector(`.modal-daily-ot30[data-date="${day.dStr}"]`);
            if(mInp30) dailyFinal30 = Number(mInp30.value) || 0;

            let hrStr = day.hours > 0 ? `${day.hours.toFixed(2)}` : '-';
            let rawShifts = day.shifts.replace(/<[^>]*>?/gm, ' ').trim(); 
            
            tableRows += `
                <tr>
                    <td style="border:1px solid #cbd5e1; padding:4px 8px; text-align:center;">${day.date}</td>
                    <td style="border:1px solid #cbd5e1; padding:4px 8px;">${rawShifts || '-'}</td>
                    <td style="border:1px solid #cbd5e1; padding:4px 8px; text-align:center;">${hrStr}</td>
                    <td style="border:1px solid #cbd5e1; padding:4px 8px; text-align:center; color:#2563eb;">${dailyFinal15 > 0 ? dailyFinal15 : '-'}</td>
                    <td style="border:1px solid #cbd5e1; padding:4px 8px; text-align:center; color:#dc2626;">${dailyFinal30 > 0 ? dailyFinal30 : '-'}</td>
                </tr>
            `;
        });

        let printHtml = `
            <div style="max-width: 900px; margin: 0 auto; border: 1px solid #94a3b8; padding: 20px; border-radius: 8px;">
                <div style="text-align:center; margin-bottom: 20px;">
                    <h2 style="margin:0; font-size:22px;">สลิปเงินเดือน (Pay Slip)</h2>
                    <p style="margin:5px 0 0 0; font-size:14px; color:#475569;">รอบบิล: ${cycleText}</p>
                </div>
                <table style="width:100%; border-collapse:collapse; margin-bottom: 20px; font-size: 14px;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; width: 20%;"><b>ชื่อพนักงาน:</b></td>
                        <td style="padding: 8px; border: 1px solid #cbd5e1; width: 30%;">${safeName}</td>
                        <td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc; width: 20%;"><b>ตำแหน่ง:</b></td>
                        <td style="padding: 8px; border: 1px solid #cbd5e1; width: 30%;">${roleName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><b>วันทำงาน:</b></td>
                        <td style="padding: 8px; border: 1px solid #cbd5e1;">${wdVal} วัน</td>
                        <td style="padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;"><b>ค่าแรง/ชั่วโมง:</b></td>
                        <td style="padding: 8px; border: 1px solid #cbd5e1;">฿ ${hourlyRate.toFixed(2)}</td>
                    </tr>
                </table>
                <div style="display: flex; gap: 20px;">
                    <div style="flex: 1.2;">
                        <table style="width:100%; border-collapse:collapse; font-size: 13px; margin-bottom:15px;">
                            <thead>
                                <tr style="background:#f1f5f9;">
                                    <th style="border:1px solid #cbd5e1; padding:8px; text-align:left;">รายการรายได้ (Earnings)</th>
                                    <th style="border:1px solid #cbd5e1; padding:8px; text-align:right;">จำนวนเงิน (บาท)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="border:1px solid #cbd5e1; padding:8px;">เงินเดือนพื้นฐาน (Base Salary)</td>
                                    <td style="border:1px solid #cbd5e1; padding:8px; text-align:right;">${baseVal.toLocaleString('th-TH',{minimumFractionDigits:2})}</td>
                                </tr>
                                <tr>
                                    <td style="border:1px solid #cbd5e1; padding:8px;">OT 1.5x (${sumOt15} ชม. @ ${rate15.toFixed(2)})</td>
                                    <td style="border:1px solid #cbd5e1; padding:8px; text-align:right;">${ot15Pay.toLocaleString('th-TH',{minimumFractionDigits:2})}</td>
                                </tr>
                                <tr>
                                    <td style="border:1px solid #cbd5e1; padding:8px;">OT 3.0x (${sumOt30} ชม. @ ${rate30.toFixed(2)})</td>
                                    <td style="border:1px solid #cbd5e1; padding:8px; text-align:right;">${ot30Pay.toLocaleString('th-TH',{minimumFractionDigits:2})}</td>
                                </tr>
                                <tr style="background:#f8fafc; font-weight:bold;">
                                    <td style="border:1px solid #cbd5e1; padding:8px;">รวมรายได้ (Gross Income)</td>
                                    <td style="border:1px solid #cbd5e1; padding:8px; text-align:right;">${grossPayable.toLocaleString('th-TH',{minimumFractionDigits:2})}</td>
                                </tr>
                            </tbody>
                        </table>
                        <table style="width:100%; border-collapse:collapse; font-size: 13px; margin-bottom:15px;">
                            <thead>
                                <tr style="background:#fef2f2;">
                                    <th style="border:1px solid #fca5a5; padding:8px; text-align:left; color:#dc2626;">รายการหัก (Deductions)</th>
                                    <th style="border:1px solid #fca5a5; padding:8px; text-align:right; color:#dc2626;">จำนวนเงิน (บาท)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style="border:1px solid #fca5a5; padding:8px; color:#dc2626;">หักประกันสังคม (SSO)</td>
                                    <td style="border:1px solid #fca5a5; padding:8px; text-align:right; color:#dc2626;">${ssoVal.toLocaleString('th-TH',{minimumFractionDigits:2})}</td>
                                </tr>
                            </tbody>
                        </table>
                        <table style="width:100%; border-collapse:collapse; font-size: 15px;">
                            <tr style="background:#ecfdf5;">
                                <td style="border:1px solid #10b981; padding:12px; font-weight:bold;">ยอดรับสุทธิ (Net Payable)</td>
                                <td style="border:1px solid #10b981; padding:12px; text-align:right; font-weight:bold; font-size: 18px; color:#059669;">฿ ${netPayable.toLocaleString('th-TH',{minimumFractionDigits:2})}</td>
                            </tr>
                        </table>
                        <div style="margin-top:40px; display:flex; justify-content:space-between; width:100%; text-align:center;">
                            <div style="width:45%;"><br><br><div style="border-bottom:1px dashed #000;"></div><p style="margin-top:5px; font-size:12px;">ผู้จ่ายเงิน</p></div>
                            <div style="width:45%;"><br><br><div style="border-bottom:1px dashed #000;"></div><p style="margin-top:5px; font-size:12px;">ผู้รับเงิน</p></div>
                        </div>
                    </div>
                    <div style="flex: 1;">
                        <table style="width:100%; border-collapse:collapse; font-size: 11px;">
                            <thead>
                                <tr style="background:#f1f5f9;">
                                    <th style="border:1px solid #cbd5e1; padding:4px 8px; text-align:center;">วันที่</th>
                                    <th style="border:1px solid #cbd5e1; padding:4px 8px; text-align:left;">กะทำงาน</th>
                                    <th style="border:1px solid #cbd5e1; padding:4px 8px; text-align:center;">ชม.</th>
                                    <th style="border:1px solid #cbd5e1; padding:4px 8px; text-align:center; color:#2563eb;">OT 1.5</th>
                                    <th style="border:1px solid #cbd5e1; padding:4px 8px; text-align:center; color:#dc2626;">OT 3.0</th>
                                </tr>
                            </thead>
                            <tbody>${tableRows}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        let f=document.createElement('iframe'); f.style.cssText='position:fixed;right:0;bottom:0;width:1px;height:1px;border:0'; document.body.appendChild(f);
        let d2=f.contentWindow.document; d2.open(); d2.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Pay Slip - ${safeName}</title><link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet"><style>@page{size:A4 landscape;margin:10mm}body{background:#fff;margin:0;padding:0;color:#000;font-family:'Sarabun',sans-serif}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}</style></head><body>${printHtml}</body></html>`); d2.close();
        f.onload=()=>{try{f.contentWindow.focus();f.contentWindow.print();}catch(e){}setTimeout(()=>f.remove(),6e4);};
    }

    exportToExcel() {
        if(!window.ExcelJS) { Swal.fire({title:'โหลด Excel Engine...',didOpen:()=>Swal.showLoading()}); let s=document.createElement('script'); s.src='https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js'; s.onload=()=>{Swal.close();this._exportToExcelLogic();}; document.head.appendChild(s); return; }
        this._exportToExcelLogic();
    }

    async _exportToExcelLogic() {
        Swal.fire({title:'สร้างไฟล์ Excel...',didOpen:()=>Swal.showLoading()});
        try {
            const wb=new ExcelJS.Workbook(); const sh=wb.addWorksheet('Payroll',{views:[{showGridLines:false}]});
            sh.mergeCells('A1:H1'); let r1=sh.getRow(1); r1.getCell(1).value=`รายงานสรุปเงินเดือนพนักงาน (รอบบิล ${document.getElementById('stat-cycle-date').innerText})`; r1.getCell(1).font={name:'Tahoma',size:16,bold:true}; r1.getCell(1).alignment={horizontal:'center',vertical:'middle'}; r1.height=30;
            sh.columns=[{width:8},{width:30},{width:18},{width:15},{width:15},{width:15},{width:15},{width:22}];
            let r2=sh.addRow(["ลำดับ","ชื่อพนักงาน","ฐานเงินเดือน","วันทำงาน(21-20)","OT 1.5x (ชม.)","OT 3.0x (ชม.)","ปสค. (หัก)","รับสุทธิ"]); r2.height=25; r2.eachCell(c=>{c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF1E293B'}};c.font={name:'Tahoma',bold:true,color:{argb:'FFFFFFFF'}};c.alignment={horizontal:'center',vertical:'middle'};});
            this.staff.forEach((s,i)=>{ let u=s.username||s.firebaseKey; let d=this.getStaffPayrollData(u); let b=Number(document.getElementById(`base_${u}`)?.value)||d.baseSalary, w=Number(document.getElementById(`wd_${u}`)?.value)||d.displayWorkDays, o1=Number(document.getElementById(`ot15_${u}`)?.value)||d.displayOt15, o3=Number(document.getElementById(`ot30_${u}`)?.value)||d.displayOt30, n=Number(document.getElementById(`net_${u}`)?.innerText.split('\n')[0].replace(/[^0-9.-]+/g,""))||d.netPayable;
                let r=sh.addRow([i+1,s.name||s.username,b,w,o1,o3,d.finalSso,n]); r.eachCell((c,x)=>{c.font={name:'Tahoma',size:11};c.border={top:{style:'thin',color:{argb:'FFE2E8F0'}},bottom:{style:'thin',color:{argb:'FFE2E8F0'}},left:{style:'thin',color:{argb:'FFE2E8F0'}},right:{style:'thin',color:{argb:'FFE2E8F0'}}};if(x===3||x===7||x===8){c.numFmt='#,##0.00';c.alignment={horizontal:'right'};}else if(x===2){c.alignment={horizontal:'left',indent:1};}else{c.alignment={horizontal:'center'};}if(x===7)c.font={color:{argb:'FFDC2626'}};if(x===8)c.font={name:'Tahoma',size:11,bold:true,color:{argb:'FF10B981'}};});
            });
            const bf=await wb.xlsx.writeBuffer(); const bl=new Blob([bf],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}); const lk=document.createElement('a'); lk.href=URL.createObjectURL(bl); lk.download=`Payroll_${this.currentMonth}.xlsx`; Swal.close(); setTimeout(()=>{document.body.appendChild(lk);lk.click();document.body.removeChild(lk);URL.revokeObjectURL(lk.href);},500);
        } catch(e) { Swal.fire('ข้อผิดพลาด',e.message,'error'); }
    }

    escapeHTML(str) { return String(str||'').replace(/[&<>'"]/g, t=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[t]||t)); }
}

window.SalaryPage = new SalaryPageComponent();
if (typeof App !== 'undefined' && App.pages) App.pages.salary = window.SalaryPage;
else if (typeof window.App !== 'undefined' && window.App.pages) window.App.pages.salary = window.SalaryPage;