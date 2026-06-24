// js/auto_purge_service.js
// 🚀 สมองกลส่วนกลาง: ระบบกวาดล้างข้อมูลเก่าเกิน 5 ปี (Global Auto-Purge Service & Cloud FinOps)

const AutoPurgeService = {
    isPurging: false,

    init: function() {
        // เช็ค Cache ว่า "วันนี้" ระบบเคยกวาดขยะไปแล้วหรือยัง? (ป้องการการทำงานซ้ำซ้อน)
        const today = new Date().toISOString().split('T')[0];
        const lastPurge = localStorage.getItem('last_global_purge_date');
        
        if (lastPurge === today) {
            console.log("✅ [Global Auto-Purge] วันนี้ทำการกวาดล้างข้อมูลเก่าไปแล้ว (Standby Mode)");
            return;
        }

        // หน่วงเวลา 5 วินาทีรอให้หน้าจอหลัก (UI) โหลดเสร็จก่อน เพื่อไม่ให้แย่งความเร็วเน็ตกัน
        setTimeout(() => {
            this.runGlobalPurge().then((deletedCount) => {
                // บันทึกว่าวันนี้ทำความสะอาดแล้ว
                localStorage.setItem('last_global_purge_date', today);
                
                // แจ้งเตือนพยาบาลกรณีที่มีการลบขยะออกไปจริงๆ
                if (deletedCount > 0) {
                    this.showToast(`คืนพื้นที่ให้ Cloud! ลบข้อมูลเก่าเกิน 5 ปี จำนวน ${deletedCount} รายการ`);
                }
            });
        }, 5000);
    },

    showToast: function(msg) {
        if(typeof Swal !== 'undefined') {
            const Toast = Swal.mixin({
                toast: true, position: 'bottom-end', showConfirmButton: false, timer: 6000,
                didOpen: (toast) => {
                    toast.style.background = '#ffffff';
                    toast.style.border = '2px solid #3b82f6';
                    toast.style.borderRadius = '16px';
                    toast.style.fontFamily = "'Prompt', sans-serif";
                }
            });
            Toast.fire({ icon: 'info', title: '♻️ ' + msg });
        }
    },

    runGlobalPurge: async function() {
        if (typeof db === 'undefined') return 0;
        if (this.isPurging) return 0;
        this.isPurging = true;

        console.log("🚀 [Global Auto-Purge] เริ่มต้นสแกนฐานข้อมูลทั้งระบบ...");
        
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 5);
        const cutoffTime = cutoffDate.getTime();
        const cutoffStrDate = cutoffDate.toISOString().split('T')[0];
        const cutoffStrISO = cutoffDate.toISOString();

        let totalDeleted = 0;

        try {
            // 🧹 1. กวาดล้างแฟ้มผู้ป่วย (ประวัติการฟอก / ผลแล็บ / คนไข้ที่จำหน่ายออกเกิน 5 ปี)
            const pSnap = await db.ref('patients_database_v2/patients').once('value');
            if (pSnap.exists()) {
                let patients = Object.values(pSnap.val());
                let isPatientUpdated = false;

                let validPatients = patients.filter(p => {
                    if (!p) return false;
                    
                    // ลบคนไข้ที่สถานะ "จำหน่าย/ตาย/ย้าย" ที่เก่ากว่า 5 ปี ทิ้งทั้งก้อน
                    if ((p.status || 'ปกติ') !== 'ปกติ') {
                        let recordDate = new Date(p.last_updated || p.register_date || "2000-01-01").getTime();
                        if (recordDate < cutoffTime) {
                            totalDeleted++;
                            return false; 
                        }
                    }
                    
                    // ล้างประวัติ (History) และ ผลแล็บ (Labs) เก่าๆ ของคนไข้ที่ยังฟอกอยู่
                    if (Array.isArray(p.history)) {
                        let oldLen = p.history.length;
                        p.history = p.history.filter(h => h && h.date && new Date(h.date).getTime() >= cutoffTime);
                        if (p.history.length < oldLen) {
                            isPatientUpdated = true;
                            totalDeleted += (oldLen - p.history.length);
                        }
                    }
                    if (Array.isArray(p.labs)) {
                        let oldLen = p.labs.length;
                        p.labs = p.labs.filter(l => l && l.date && new Date(l.date).getTime() >= cutoffTime);
                        if (p.labs.length < oldLen) {
                            isPatientUpdated = true;
                            totalDeleted += (oldLen - p.labs.length);
                        }
                    }
                    return true;
                });

                if (validPatients.length < patients.length || isPatientUpdated) {
                    await db.ref('patients_database_v2/patients').set(validPatients);
                }
            }

            // 🧹 2. กวาดล้างคิวฟอกไต (Visits) ที่เก่าเกิน 5 ปี (ครอบคลุมไฟล์เอกสารสแกนด้วย)
            const vSnap = await db.ref('patients_database_v2/visits').once('value');
            if (vSnap.exists()) {
                let visits = Object.values(vSnap.val());
                let originalLen = visits.length;
                let validVisits = visits.filter(v => v && v.date && v.date >= cutoffStrDate);
                if (validVisits.length < originalLen) {
                    await db.ref('patients_database_v2/visits').set(validVisits);
                    totalDeleted += (originalLen - validVisits.length);
                }
            }

            // 🧹 3. กวาดล้างประวัติการเบิกจ่ายสต๊อก (Inventory Transactions)
            const tSnap = await db.ref('inventory_database_v2/transactions').orderByChild('timestamp').endAt(cutoffStrISO).once('value');
            if (tSnap.exists()) {
                let updates = {};
                tSnap.forEach(child => { updates[child.key] = null; totalDeleted++; });
                await db.ref('inventory_database_v2/transactions').update(updates);
            }

            // 🧹 4. กวาดล้างสมุดบัญชีคลินิก (Clinic Expenses)
            const eSnap = await db.ref('clinic_expenses_v2').orderByChild('date').endAt(cutoffStrDate).once('value');
            if (eSnap.exists()) {
                let updates = {};
                eSnap.forEach(child => { updates[child.key] = null; totalDeleted++; });
                await db.ref('clinic_expenses_v2').update(updates);
            }

            // 🧹 5. กวาดล้างบัญชีภายในหน่วยงาน (Department Ledger)
            const lSnap = await db.ref('department_ledger_v2').orderByChild('date').endAt(cutoffStrDate).once('value');
            if (lSnap.exists()) {
                let updates = {};
                lSnap.forEach(child => { updates[child.key] = null; totalDeleted++; });
                await db.ref('department_ledger_v2').update(updates);
            }

            console.log(`✅ [Global Auto-Purge] สแกนเสร็จสิ้น! ล้างขยะไปทั้งหมด ${totalDeleted} รายการ`);
            return totalDeleted;

        } catch (error) {
            console.error("❌ [Global Auto-Purge] เกิดข้อผิดพลาด:", error);
            return 0;
        } finally {
            this.isPurging = false;
        }
    }
};

// ⚡ ฝังระบบรอให้ Firebase โหลดเสร็จ แล้วสั่งสตาร์ทสมองกลอัตโนมัติ
let globalPurgeInterval = setInterval(() => {
    if (typeof db !== 'undefined') {
        AutoPurgeService.init();
        clearInterval(globalPurgeInterval);
    }
}, 2000);// js/auto_purge_service.js
// 🚀 สมองกลส่วนกลาง: ระบบกวาดล้างข้อมูลเก่าเกิน 5 ปี (Global Auto-Purge Service & Cloud FinOps)

const AutoPurgeService = {
    isPurging: false,

    init: function() {
        // เช็ค Cache ว่า "วันนี้" ระบบเคยกวาดขยะไปแล้วหรือยัง? (ป้องการการทำงานซ้ำซ้อน)
        const today = new Date().toISOString().split('T')[0];
        const lastPurge = localStorage.getItem('last_global_purge_date');
        
        if (lastPurge === today) {
            console.log("✅ [Global Auto-Purge] วันนี้ทำการกวาดล้างข้อมูลเก่าไปแล้ว (Standby Mode)");
            return;
        }

        // หน่วงเวลา 5 วินาทีรอให้หน้าจอหลัก (UI) โหลดเสร็จก่อน เพื่อไม่ให้แย่งความเร็วเน็ตกัน
        setTimeout(() => {
            this.runGlobalPurge().then((deletedCount) => {
                // บันทึกว่าวันนี้ทำความสะอาดแล้ว
                localStorage.setItem('last_global_purge_date', today);
                
                // แจ้งเตือนพยาบาลกรณีที่มีการลบขยะออกไปจริงๆ
                if (deletedCount > 0) {
                    this.showToast(`คืนพื้นที่ให้ Cloud! ลบข้อมูลเก่าเกิน 5 ปี จำนวน ${deletedCount} รายการ`);
                }
            });
        }, 5000);
    },

    showToast: function(msg) {
        if(typeof Swal !== 'undefined') {
            const Toast = Swal.mixin({
                toast: true, position: 'bottom-end', showConfirmButton: false, timer: 6000,
                didOpen: (toast) => {
                    toast.style.background = '#ffffff';
                    toast.style.border = '2px solid #3b82f6';
                    toast.style.borderRadius = '16px';
                    toast.style.fontFamily = "'Prompt', sans-serif";
                }
            });
            Toast.fire({ icon: 'info', title: '♻️ ' + msg });
        }
    },

    runGlobalPurge: async function() {
        if (typeof db === 'undefined') return 0;
        if (this.isPurging) return 0;
        this.isPurging = true;

        console.log("🚀 [Global Auto-Purge] เริ่มต้นสแกนฐานข้อมูลทั้งระบบ...");
        
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 5);
        const cutoffTime = cutoffDate.getTime();
        const cutoffStrDate = cutoffDate.toISOString().split('T')[0];
        const cutoffStrISO = cutoffDate.toISOString();

        let totalDeleted = 0;

        try {
            // 🧹 1. กวาดล้างแฟ้มผู้ป่วย (ประวัติการฟอก / ผลแล็บ / คนไข้ที่จำหน่ายออกเกิน 5 ปี)
            const pSnap = await db.ref('patients_database_v2/patients').once('value');
            if (pSnap.exists()) {
                let patients = Object.values(pSnap.val());
                let isPatientUpdated = false;

                let validPatients = patients.filter(p => {
                    if (!p) return false;
                    
                    // ลบคนไข้ที่สถานะ "จำหน่าย/ตาย/ย้าย" ที่เก่ากว่า 5 ปี ทิ้งทั้งก้อน
                    if ((p.status || 'ปกติ') !== 'ปกติ') {
                        let recordDate = new Date(p.last_updated || p.register_date || "2000-01-01").getTime();
                        if (recordDate < cutoffTime) {
                            totalDeleted++;
                            return false; 
                        }
                    }
                    
                    // ล้างประวัติ (History) และ ผลแล็บ (Labs) เก่าๆ ของคนไข้ที่ยังฟอกอยู่
                    if (Array.isArray(p.history)) {
                        let oldLen = p.history.length;
                        p.history = p.history.filter(h => h && h.date && new Date(h.date).getTime() >= cutoffTime);
                        if (p.history.length < oldLen) {
                            isPatientUpdated = true;
                            totalDeleted += (oldLen - p.history.length);
                        }
                    }
                    if (Array.isArray(p.labs)) {
                        let oldLen = p.labs.length;
                        p.labs = p.labs.filter(l => l && l.date && new Date(l.date).getTime() >= cutoffTime);
                        if (p.labs.length < oldLen) {
                            isPatientUpdated = true;
                            totalDeleted += (oldLen - p.labs.length);
                        }
                    }
                    return true;
                });

                if (validPatients.length < patients.length || isPatientUpdated) {
                    await db.ref('patients_database_v2/patients').set(validPatients);
                }
            }

            // 🧹 2. กวาดล้างคิวฟอกไต (Visits) ที่เก่าเกิน 5 ปี (ครอบคลุมไฟล์เอกสารสแกนด้วย)
            const vSnap = await db.ref('patients_database_v2/visits').once('value');
            if (vSnap.exists()) {
                let visits = Object.values(vSnap.val());
                let originalLen = visits.length;
                let validVisits = visits.filter(v => v && v.date && v.date >= cutoffStrDate);
                if (validVisits.length < originalLen) {
                    await db.ref('patients_database_v2/visits').set(validVisits);
                    totalDeleted += (originalLen - validVisits.length);
                }
            }

            // 🧹 3. กวาดล้างประวัติการเบิกจ่ายสต๊อก (Inventory Transactions)
            const tSnap = await db.ref('inventory_database_v2/transactions').orderByChild('timestamp').endAt(cutoffStrISO).once('value');
            if (tSnap.exists()) {
                let updates = {};
                tSnap.forEach(child => { updates[child.key] = null; totalDeleted++; });
                await db.ref('inventory_database_v2/transactions').update(updates);
            }

            // 🧹 4. กวาดล้างสมุดบัญชีคลินิก (Clinic Expenses)
            const eSnap = await db.ref('clinic_expenses_v2').orderByChild('date').endAt(cutoffStrDate).once('value');
            if (eSnap.exists()) {
                let updates = {};
                eSnap.forEach(child => { updates[child.key] = null; totalDeleted++; });
                await db.ref('clinic_expenses_v2').update(updates);
            }

            // 🧹 5. กวาดล้างบัญชีภายในหน่วยงาน (Department Ledger)
            const lSnap = await db.ref('department_ledger_v2').orderByChild('date').endAt(cutoffStrDate).once('value');
            if (lSnap.exists()) {
                let updates = {};
                lSnap.forEach(child => { updates[child.key] = null; totalDeleted++; });
                await db.ref('department_ledger_v2').update(updates);
            }

            console.log(`✅ [Global Auto-Purge] สแกนเสร็จสิ้น! ล้างขยะไปทั้งหมด ${totalDeleted} รายการ`);
            return totalDeleted;

        } catch (error) {
            console.error("❌ [Global Auto-Purge] เกิดข้อผิดพลาด:", error);
            return 0;
        } finally {
            this.isPurging = false;
        }
    }
};

// ⚡ ฝังระบบรอให้ Firebase โหลดเสร็จ แล้วสั่งสตาร์ทสมองกลอัตโนมัติ
let globalPurgeInterval = setInterval(() => {
    if (typeof db !== 'undefined') {
        AutoPurgeService.init();
        clearInterval(globalPurgeInterval);
    }
}, 2000);