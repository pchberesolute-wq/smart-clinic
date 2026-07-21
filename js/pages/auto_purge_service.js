// js/pages/auto_purge_service.js
// 🚀 Enterprise FinOps Engine V4.0: Quantum Distributed Auto-Purge Service
// ระบบกวาดล้างข้อมูลอัจฉริยะ (7-Year Compliance) ป้องกัน Payload ล้น, ไร้อาการค้าง, และมี Audit Trail

class FinOpsPurgeEngineService {
    constructor() {
        this.isPurging = false;
        this.retentionYears = 7; // มาตรฐานเวชระเบียน 7 ปี
        this.CHUNK_SIZE = 500; // 🚨 ป้องกัน Firebase แฮงก์ หั่นส่งทีละ 500 รายการ
        this.LOCK_TIMEOUT_MINUTES = 30; // ถ้า Lock นานเกิน 30 นาทีถือว่าเครื่องพัง ให้ปลด Lock อัตโนมัติ

        console.log("%c🌌 [FinOps Engine] V4.0 Quantum Purge Service Standby.", "color: #a855f7; font-weight: bold; font-size: 13px; text-shadow: 0 0 5px rgba(168,85,247,0.5);");
    }

    init() {
        // หน่วงเวลา 15 วินาที รอให้หน้าจออื่นๆ (Dashboard, Tables) โหลดและวาดเสร็จก่อน 100%
        setTimeout(() => {
            this.tryAcquireLockAndPurge();
        }, 15000);
    }

    // ============================================================================
    // 🔒 1. Advanced Distributed Lock (กันรันซ้อน + มีระบบแก้ Deadlock)
    // ============================================================================
    async tryAcquireLockAndPurge() {
        if (typeof db === 'undefined') return;

        const todayDate = new Date().toISOString().split('T')[0];
        const currentTime = new Date().getTime();
        const lockRef = db.ref('system_metadata/finops_purge_lock');

        try {
            const { committed, snapshot } = await lockRef.transaction((lockData) => {
                if (lockData) {
                    // ถ้าวันนี้ทำไปแล้ว (สำเร็จ) -> ยกเลิก
                    if (lockData.last_completed_date === todayDate) return; 

                    // ถ้ากำลังทำอยู่ (แต่ยังไม่เสร็จ)
                    if (lockData.status === 'processing') {
                        const lockAgeMins = (currentTime - lockData.timestamp) / (1000 * 60);
                        // ถ้าเครื่องที่ล็อคไว้ ทำงานนานเกิน 30 นาที (คาดว่าไฟดับ/เน็ตหลุด) -> ยึดอำนาจ!
                        if (lockAgeMins < this.LOCK_TIMEOUT_MINUTES) {
                            return; // ยังไม่หมดเวลา ปล่อยเครื่องนั้นทำไป
                        }
                        console.warn("⚠️ [FinOps] ตรวจพบ Deadlock! ทำการยึดกุญแจ (Lock Override)");
                    }
                }

                // สวมมงกุฎ ยึดกุญแจเป็นของเครื่องนี้
                return {
                    status: 'processing',
                    timestamp: currentTime,
                    last_completed_date: lockData?.last_completed_date || "2000-01-01"
                };
            });

            if (!committed) {
                console.log("✅ [FinOps] วันนี้คลินิกทำการกวาดล้างข้อมูลไปแล้ว หรือเครื่องอื่นกำลังทำงานอยู่");
                return;
            }

            // 🚀 เริ่มกระบวนการกวาดล้าง
            const stats = await this.runGlobalPurge();
            
            // ปลดล็อคและบันทึกความสำเร็จ
            await lockRef.set({
                status: 'idle',
                timestamp: new Date().getTime(),
                last_completed_date: todayDate
            });

            // แจ้งเตือน + บันทึก Audit Log
            if (stats.total > 0) {
                this.showCyberToast(stats);
                this.saveAuditLog(stats);
            }

        } catch (error) {
            console.error("❌ [FinOps] Transaction Lock Error:", error);
            // พยายามปลดล็อคเผื่อระบบล่ม
            await lockRef.child('status').set('idle');
        }
    }

    // ============================================================================
    // 🧹 2. Quantum Purge Execution (ไร้อาการค้าง 100%)
    // ============================================================================
    async runGlobalPurge() {
        if (this.isPurging) return { total: 0 };
        this.isPurging = true;

        console.log(`🚀 [FinOps] เริ่มสแกนข้อมูลหมดอายุขัย (Older than ${this.retentionYears} years)...`);
        
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - this.retentionYears);
        const cutoffTime = cutoffDate.getTime();
        const cutoffStrDate = cutoffDate.toISOString().split('T')[0];
        const cutoffStrISO = cutoffDate.toISOString();

        let stats = { total: 0, patients: 0, visits: 0, inventory: 0, expenses: 0 };

        try {
            // 🛡️ 2.1 กวาดล้างแฟ้มผู้ป่วย (Patient Records)
            const pSnap = await db.ref('patients_database_v2/patients').once('value');
            if (pSnap.exists()) {
                const patients = pSnap.val();
                let updates = {};
                let updateCount = 0;

                const entries = Object.entries(patients);
                for (let i = 0; i < entries.length; i++) {
                    const [patientId, p] = entries[i];
                    if (!p) continue;
                    
                    let needsUpdate = false;

                    // ผู้ป่วยจำหน่าย/เสียชีวิต เกิน 7 ปี
                    if ((p.status || 'ปกติ') !== 'ปกติ') {
                        let recordDate = new Date(p.last_updated || p.register_date || "2000-01-01").getTime();
                        if (recordDate < cutoffTime) {
                            updates[`${patientId}`] = null;
                            stats.patients++;
                            needsUpdate = true;
                        }
                    }
                    
                    if (!needsUpdate) {
                        // ตัดประวัติการรักษาเก่า
                        if (Array.isArray(p.history)) {
                            let validHistory = p.history.filter(h => h && h.date && new Date(h.date).getTime() >= cutoffTime);
                            if (validHistory.length < p.history.length) {
                                updates[`${patientId}/history`] = validHistory;
                                stats.patients += (p.history.length - validHistory.length);
                                needsUpdate = true;
                            }
                        }
                        // ตัดผลแล็บเก่า
                        if (Array.isArray(p.labs)) {
                            let validLabs = p.labs.filter(l => l && l.date && new Date(l.date).getTime() >= cutoffTime);
                            if (validLabs.length < p.labs.length) {
                                updates[`${patientId}/labs`] = validLabs;
                                stats.patients += (p.labs.length - validLabs.length);
                                needsUpdate = true;
                            }
                        }
                    }

                    if (needsUpdate) updateCount++;

                    // 🚨 CHUNKING: ถ้าครบโควต้า ให้ส่งคำสั่งลบ แล้วล้างตะกร้า ป้องกัน Payload Too Large
                    if (updateCount >= this.CHUNK_SIZE) {
                        await db.ref('patients_database_v2/patients').update(updates);
                        updates = {};
                        updateCount = 0;
                        await this.yieldThread(); // 🌬️ ให้เบราว์เซอร์หายใจ
                    }

                    // 🌬️ YIELDING: ทุกๆ 100 ลูป ให้ปล่อย Main Thread ไปวาดหน้าจอ (ป้องกันหน้าจอค้าง)
                    if (i % 100 === 0) await this.yieldThread();
                }

                // ส่งของที่เหลือในตะกร้า
                if (Object.keys(updates).length > 0) {
                    await db.ref('patients_database_v2/patients').update(updates);
                }
            }

            // 🛡️ 2.2 กวาดล้างข้อมูล Transaction (Queue, Stock, Finance)
            stats.visits = await this.purgeNodeChunked('patients_database_v2/visits', 'date', cutoffStrDate);
            stats.inventory = await this.purgeNodeChunked('inventory_database_v2/transactions', 'timestamp', cutoffStrISO);
            stats.expenses = await this.purgeNodeChunked('clinic_expenses_v2', 'date', cutoffStrDate);
            
            stats.total = stats.patients + stats.visits + stats.inventory + stats.expenses;
            
            console.log(`✅ [FinOps] คลีนเสร็จสิ้น! คืนพื้นที่: ${stats.total} รายการ`);
            return stats;

        } catch (error) {
            console.error("❌ [FinOps] เกิดข้อผิดพลาดร้ายแรงระหว่างกวาดล้าง:", error);
            throw error; 
        } finally {
            this.isPurging = false;
        }
    }

    // ============================================================================
    // 🧩 3. Chunked Purge Helper (ลบแบบหั่นเนื้อ ป้องกันแฮงก์)
    // ============================================================================
    async purgeNodeChunked(path, dateField, cutoffString) {
        let deletedCount = 0;
        try {
            const snap = await db.ref(path).orderByChild(dateField).endAt(cutoffString).once('value');
            if (!snap.exists()) return 0;

            let updates = {};
            let count = 0;
            let totalProcessed = 0;

            // ไม่ใช้ forEach ตรงๆ เพราะเราต้องการใช้ await ข้างใน
            const nodes = [];
            snap.forEach(child => { nodes.push(child.key); });

            for (let i = 0; i < nodes.length; i++) {
                updates[nodes[i]] = null;
                count++;
                deletedCount++;
                totalProcessed++;

                if (count >= this.CHUNK_SIZE) {
                    await db.ref(path).update(updates);
                    updates = {};
                    count = 0;
                    await this.yieldThread(); // หายใจ
                }

                if (totalProcessed % 200 === 0) await this.yieldThread();
            }

            if (Object.keys(updates).length > 0) {
                await db.ref(path).update(updates);
            }

        } catch (e) { console.error(`Failed to purge ${path}:`, e); }
        
        return deletedCount;
    }

    // ============================================================================
    // 📜 4. HA/JCI Audit Logging (มาตรฐานโรงพยาบาล)
    // ============================================================================
    saveAuditLog(stats) {
        try {
            const logRef = db.ref('system_metadata/purge_audit_logs').push();
            logRef.set({
                timestamp: new Date().toISOString(),
                retention_policy: `${this.retentionYears}_years`,
                deleted_items: stats,
                executed_by: "Auto_FinOps_Engine"
            });
        } catch (e) { console.warn("Could not save audit log", e); }
    }

    // ============================================================================
    // 🎨 5. Enterprise Cyber UI
    // ============================================================================
    showCyberToast(stats) {
        if (typeof Swal !== 'undefined') {
            const numText = stats.total.toLocaleString('th-TH');
            Swal.fire({
                toast: true, 
                position: 'top-end', 
                showConfirmButton: false, 
                timer: 8000,
                timerProgressBar: true,
                background: '#0f172a', // Dark theme
                color: '#f8fafc',
                icon: 'success', 
                iconColor: '#2dd4bf', // Purple/Teal vibe
                title: `<span style="font-family:Prompt; font-size:14px; font-weight:700; letter-spacing:0.5px; color:#2dd4bf;">FINOPS: CLOUD OPTIMIZED</span>`,
                html: `<div style="font-family:Prompt; font-size:12px; text-align:left; margin-top:5px; color:#94a3b8;">
                          กวาดล้างข้อมูลเก่าเกิน ${this.retentionYears} ปี สำเร็จ<br>
                          <span style="color:#f8fafc; font-weight:bold;">คืนพื้นที่ความจำ: ${numText} รายการ</span>
                       </div>`,
                customClass: { 
                    popup: 'shadow-lg border border-secondary border-opacity-25 rounded-4' 
                }
            });
        }
    }

    // 🌬️ Thread Yielding: หลอกเบราว์เซอร์ให้สลับไปทำงานอื่น (เช่น วาดหน้าจอ) 0 มิลลิวินาที
    yieldThread() {
        return new Promise(resolve => setTimeout(resolve, 0));
    }
}

// 🌐 Expose & Auto-Start
const FinOpsEngine = new FinOpsPurgeEngineService();
window.AutoPurgeService = FinOpsEngine; // Map ชื่อเดิมให้ระบบอื่นอ้างอิงได้

// ⚡ ฝังระบบรอให้ Firebase โหลดเสร็จ แล้วสั่งสตาร์ทแบบเงียบๆ
let globalPurgeInterval = setInterval(() => {
    if (typeof db !== 'undefined') {
        FinOpsEngine.init();
        clearInterval(globalPurgeInterval);
    }
}, 2000);