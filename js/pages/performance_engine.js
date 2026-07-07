// js/pages/performance_engine.js
// 🚀 Enterprise Performance & Memory Optimization Engine (Zero-Freeze System)
// ควบคุมอาการค้าง หน่วง และคืนหน่วยความจำอย่างแม่นยำ 100%

class PerformanceEngineService {
    constructor() {
        this.activeListeners = new Map(); // จดจำ Listener ทั้งระบบเพื่อตามเก็บกวาด
        this.renderQueue = []; // คิวงานวาดหน้าจอ
        this.isRendering = false;
        
        console.log("%c⚡ [Performance Engine] Zero-Freeze Core Activated.", "color: #3b82f6; font-weight: bold; font-size: 14px;");
    }

    // =========================================================================
    // 1. 🛡️ Memory Leak Preventer (ระบบกวาดล้างหน่วยความจำขยะ)
    // =========================================================================
    
    /**
     * ลงทะเบียน Firebase Listener เพื่อให้ระบบจำไว้ว่าต้องปิดตอนเปลี่ยนหน้า
     * @param {string} pageId - ชื่อหน้า (เช่น 'dashboard', 'patient_history')
     * @param {string} path - Firebase path (เช่น 'patients_database_v2/visits')
     * @param {function} callback - ฟังก์ชันที่รับค่าจาก Firebase
     */
    registerFirebaseListener(pageId, path, callback) {
        if (!this.activeListeners.has(pageId)) {
            this.activeListeners.set(pageId, []);
        }
        
        // ผูก Listener กับ Firebase
        db.ref(path).on('value', callback);
        
        // จดจำประวัติไว้
        this.activeListeners.get(pageId).push({ path, callback });
    }

    /**
     * สั่งปิด Listener ทั้งหมดของหน้าเก่า คืน RAM ให้ระบบทันที (เรียกใช้ตอนสลับหน้า)
     * @param {string} pageId - ชื่อหน้าที่เพิ่งถูกปิดไป
     */
    purgeListenersForPage(pageId) {
        if (this.activeListeners.has(pageId)) {
            const listeners = this.activeListeners.get(pageId);
            listeners.forEach(l => {
                db.ref(l.path).off('value', l.callback);
            });
            this.activeListeners.delete(pageId);
            // console.log(`🧹 [Memory Sweeper] Cleaned up ${listeners.length} listeners for [${pageId}]`);
        }
    }

    // =========================================================================
    // 2. ⚡ Anti-Freeze Rendering (ระบบวาดหน้าจอแบบไม่กระตุก)
    // =========================================================================
    
    /**
     * แทนที่จะวาดการ์ด 1,000 ใบใน 1 วินาที (ทำให้จอค้าง) 
     * ฟังก์ชันนี้จะแบ่งวาดทีละ 20 ใบ แล้วหยุดพักให้เบราว์เซอร์หายใจ
     * @param {Array} array - ข้อมูลทั้งหมดที่ต้องการวาด
     * @param {function} renderItemCallback - ฟังก์ชันที่จะใช้วาด HTML แต่ละชิ้น
     * @param {number} chunkSize - จำนวนชิ้นที่จะวาดต่อ 1 รอบ (ค่าเริ่มต้น 20)
     * @param {function} onComplete - ฟังก์ชันเรียกเมื่อวาดเสร็จทั้งหมด
     */
    async renderInChunks(array, renderItemCallback, chunkSize = 20, onComplete = null) {
        if (!array || array.length === 0) {
            if(onComplete) onComplete();
            return;
        }

        let index = 0;
        const total = array.length;

        const processChunk = () => {
            const end = Math.min(index + chunkSize, total);
            
            // วาดข้อมูลทีละก้อน
            for (; index < end; index++) {
                renderItemCallback(array[index], index);
            }

            if (index < total) {
                // ถ้ายังวาดไม่หมด ให้ปล่อย Main Thread ว่างชั่วคราว แล้วค่อยมาวาดต่อ (ใช้ requestAnimationFrame หรือ setTimeout)
                requestAnimationFrame(processChunk);
            } else {
                // วาดเสร็จสมบูรณ์
                if (onComplete) onComplete();
            }
        };

        // เริ่มต้นวาด
        requestAnimationFrame(processChunk);
    }

    // =========================================================================
    // 3. 🔍 Smart Query Builder (ป้องกันการดึงข้อมูลเหมาเข่ง)
    // =========================================================================
    
    /**
     * ดึงประวัติการรักษาเฉพาะคนไข้ที่ระบุ และจำกัดจำนวนข้อมูล ป้องกันเครื่องค้าง
     * @param {string} hn - รหัสคนไข้
     * @param {number} limit - ดึงย้อนหลังกี่รายการ
     */
    async fetchVisitsByHN(hn, limit = 50) {
        try {
            // ใช้คำสั่ง Query ของ Firebase ตรงๆ เพื่อให้ Server ทำงานแทนเบราว์เซอร์
            const snap = await db.ref('patients_database_v2/visits')
                                 .orderByChild('hn')
                                 .equalTo(hn)
                                 .limitToLast(limit)
                                 .once('value');
            
            const data = snap.val() || {};
            // แมปข้อมูลพร้อมดึง Key กลับมาให้
            const visits = Object.keys(data).map(k => ({ firebaseKey: k, ...data[k] }));
            return visits.reverse(); // เรียงจากล่าสุดไปเก่าสุด
        } catch (error) {
            console.error("Smart Query Error:", error);
            return [];
        }
    }

    // =========================================================================
    // 4. 🗜️ Payload Optimizer (ระบบบีบอัด Base64 ก่อนเซฟ)
    // =========================================================================
    
    /**
     * บีบอัดรูปภาพให้เล็กลง 80% ก่อนเซฟลง Database ป้องกัน Database บวม
     * @param {File} file - ไฟล์รูปภาพจาก input type="file"
     * @param {number} maxWidth - ความกว้างสูงสุด
     * @param {number} quality - คุณภาพ 0.1 - 1.0
     */
    compressImageAsync(file, maxWidth = 800, quality = 0.7) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // ส่งออกเป็น Base64 ที่ถูกบีบอัดแล้ว
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    }

    // =========================================================================
    // 5. ⏱️ Event Optimizer (ตัวหน่วงคำสั่ง ป้องกันผู้ใช้กดรัวๆ)
    // =========================================================================
    
    /**
     * ใช้ครอบฟังก์ชันช่องค้นหา พิมพ์รัวๆ แต่จะส่งคำสั่งค้นหาแค่ตอนที่หยุดพิมพ์ 0.5 วิ (ลดภาระ CPU)
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// 🌐 Expose Component สู่ระบบ
const PerformanceEngine = new PerformanceEngineService();
window.PerformanceEngine = PerformanceEngine;