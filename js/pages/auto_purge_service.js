// js/auto_purge_service.js
// 🚀 Enterprise FinOps Engine: Distributed Auto-Purge Service (7-Year Data Retention Compliance)

const AutoPurgeService = {
    isPurging: false,
    retentionYears: 7, // 🚨 ขยายเวลาเก็บข้อมูลเป็น 7 ปี ตามมาตรฐานเวชระเบียนสากล

    init: function() {
        // หน่วงเวลา 10 วินาที เพื่อไม่ให้แย่ง Bandwidth ตอนเปิดหน้าจอ Dashboard ครั้งแรก
        setTimeout(() => {
            this.tryAcquireLockAndPurge();
        }, 10000);
    },

    // 🔒 1. ระบบ Distributed Lock (ป้องกันรันซ้ำซ้อนจากหลายเครื่อง)
    tryAcquireLockAndPurge: async function() {
        if (typeof db === 'undefined') return;

        const today = new Date().toISOString().split('T')[0];
        const lockRef = db.ref('system_metadata/last_global_purge_date');

        try {
            // ใช้ Transaction สั่งคุยกับเซิร์ฟเวอร์โดยตรง (Locking Mechanism)
            const { committed, snapshot } = await lockRef.transaction((currentValue) => {
                // ถ้าวันนี้มีเครื่องอื่นทำไปแล้ว ยกเลิกทันที
                if (currentValue === today) {
                    return; // Abort transaction
                }
                // ถ้ายังไม่มีใครทำ ให้เครื่องนี้เป็นคนทำ และเซ็ตวันที่ของวันนี้
                return today; 
            });

            if (!committed) {
                console.log("✅ [FinOps] วันนี้คลินิกทำการกวาดล้างข้อมูลไปแล้วจากเครื่องอื่น (Standby Mode)");
                return;
            }

            // ถ้าได้กุญแจ (Lock) มาแล้ว ค่อยเริ่มทำความสะอาด
            const deletedCount = await this.runGlobalPurge();
            
            if (deletedCount > 0) {
                this.showToast(`คืนพื้นที่ให้ Cloud! ลบข้อมูลเก่าเกิน ${this.retentionYears} ปี จำนวน ${deletedCount} รายการ`);
            }
        } catch (error) {
            console.error("❌ [FinOps] Transaction Lock Error:", error);
        }
    },

    showToast: function(msg) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                toast: true, position: 'bottom-end', showConfirmButton: false, timer: 6000,
                icon: 'info', title: '♻️ ' + msg,
                customClass: { popup: 'shadow-lg border-primary rounded-4' }
            });
        }
    },

    // 🧹 2. ปฏิบัติการกวาดล้าง (Atomic Payload Construction)
    runGlobalPurge: async function() {
        if (this.isPurging) return 0;
        this.isPurging = true;

        console.log(`🚀 [FinOps] เริ่มต้นสแกนหาข้อมูลหมดอายุ (Older than ${this.retentionYears} years)...`);
        
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - this.retentionYears);
        const cutoffTime = cutoffDate.getTime();
        const cutoffStrDate = cutoffDate.toISOString().split('T')[0];
        const cutoffStrISO = cutoffDate.toISOString();

        let totalDeleted = 0;

        try {
            // -------------------------------------------------------------
            // 🛡️ ส่วนที่ 1: กวาดล้างแฟ้มผู้ป่วย (แบบเจาะจง ไม่เซฟทับทั้งตู้)
            // -------------------------------------------------------------
            const pSnap = await db.ref('patients_database_v2/patients').once('value');
            if (pSnap.exists()) {
                const patients = pSnap.val();
                const updates = {}; // สร้างตระกร้าสำหรับส่งคำสั่งอัปเดตแบบรวดเดียว (Batch)

                // ลูปผ่าน Key/ID ของ Firebase ป้องกันปัญหา Array Index เลื่อน
                Object.entries(patients).forEach(([patientId, p]) => {
                    if (!p) return;
                    
                    // กรณีตาย/ย้าย/จำหน่าย เกิน 7 ปี -> ลบคนไข้ทิ้งทั้งแฟ้ม
                    if ((p.status || 'ปกติ') !== 'ปกติ') {
                        let recordDate = new Date(p.last_updated || p.register_date || "2000-01-01").getTime();
                        if (recordDate < cutoffTime) {
                            updates[`${patientId}`] = null; // คำสั่ง Null ใน Firebase คือการลบทิ้ง
                            totalDeleted++;
                            return; 
                        }
                    }
                    
                    // กรณีคนไข้ยังอยู่ แต่ประวัติ (History) ยาวเกินไป -> ตัดส่วนเก่าทิ้ง
                    if (Array.isArray(p.history)) {
                        let validHistory = p.history.filter(h => h && h.date && new Date(h.date).getTime() >= cutoffTime);
                        if (validHistory.length < p.history.length) {
                            updates[`${patientId}/history`] = validHistory;
                            totalDeleted += (p.history.length - validHistory.length);
                        }
                    }
                    
                    // ล้างผลแล็บ (Labs)
                    if (Array.isArray(p.labs)) {
                        let validLabs = p.labs.filter(l => l && l.date && new Date(l.date).getTime() >= cutoffTime);
                        if (validLabs.length < p.labs.length) {
                            updates[`${patientId}/labs`] = validLabs;
                            totalDeleted += (p.labs.length - validLabs.length);
                        }
                    }
                });

                // ส่งคำสั่งอัปเดตทีเดียว (Atomic Update) - ถ้ามีคนไข้ใหม่เพิ่มมาตอนส่งคำสั่งนี้ คนไข้ใหม่จะไม่หาย!
                if (Object.keys(updates).length > 0) {
                    await db.ref('patients_database_v2/patients').update(updates);
                }
            }

            // -------------------------------------------------------------
            // 🛡️ ส่วนที่ 2: กวาดล้างคิวและธุรกรรม (Query โดยตรง ประหยัด RAM)
            // -------------------------------------------------------------
            
            // ใช้ helper function เพื่อลดโค้ดซ้ำซ้อน
            totalDeleted += await this.purgeNodeByDate('patients_database_v2/visits', 'date', cutoffStrDate);
            totalDeleted += await this.purgeNodeByDate('inventory_database_v2/transactions', 'timestamp', cutoffStrISO);
            totalDeleted += await this.purgeNodeByDate('clinic_expenses_v2', 'date', cutoffStrDate);
            totalDeleted += await this.purgeNodeByDate('department_ledger_v2', 'date', cutoffStrDate);

            console.log(`✅ [FinOps] ทำความสะอาดเสร็จสิ้น! คืนพื้นที่รวม ${totalDeleted} รายการ`);
            return totalDeleted;

        } catch (error) {
            console.error("❌ [FinOps] เกิดข้อผิดพลาดระหว่างการกวาดล้าง:", error);
            // ปลดล็อคเผื่อให้เครื่องอื่นทำงานแทนในกรณีที่เครื่องนี้ Crash
            await db.ref('system_metadata/last_global_purge_date').set(null); 
            return 0;
        } finally {
            this.isPurging = false;
        }
    },

    // ฟังก์ชันผู้ช่วย: ค้นหาและลบเฉพาะรายการที่เก่ากว่ากำหนดแบบรวดเดียว
    purgeNodeByDate: async function(path, dateField, cutoffString) {
        let deleted = 0;
        // query เฉพาะของเก่ามาลบ ไม่ต้องโหลดของใหม่มาให้เปลืองเน็ต
        const snap = await db.ref(path).orderByChild(dateField).endAt(cutoffString).once('value');
        
        if (snap.exists()) {
            let updates = {};
            snap.forEach(child => { 
                updates[child.key] = null; 
                deleted++; 
            });
            await db.ref(path).update(updates);
        }
        return deleted;
    }
};

// ⚡ ฝังระบบรอให้ Firebase โหลดเสร็จ แล้วสั่งสตาร์ท
let globalPurgeInterval = setInterval(() => {
    if (typeof db !== 'undefined') {
        AutoPurgeService.init();
        clearInterval(globalPurgeInterval);
    }
}, 2000);