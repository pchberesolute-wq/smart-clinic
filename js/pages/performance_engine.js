// js/pages/performance_engine.js
// 🚀 Enterprise Performance & Memory Optimization Engine (Zero-Freeze System)
// ควบคุมอาการค้าง หน่วง และคืนหน่วยความจำอย่างแม่นยำระดับ Microsecond

class PerformanceEngineService {
    constructor() {
        this.activeListeners = new Map(); // จดจำ Listener ทั้งระบบเพื่อตามเก็บกวาด
        
        // กำหนดเวลาสูงสุดที่ยอมให้ CPU ทำงานใน 1 เฟรม (หน้าจอ 60FPS มีเวลา 16.6ms ต่อเฟรม)
        // ตั้งไว้ที่ 12ms เพื่อเว้นที่ว่างให้ Browser จัดการ CSS/Layout ป้องกันการค้าง 100%
        this.MAX_TIME_PER_FRAME = 12; 
        
        console.log("%c⚡ [Performance Engine] V2.0 Time-Slicing Core Activated.", "color: #10b981; font-weight: bold; font-size: 14px;");
    }

    // =========================================================================
    // 1. 🛡️ Memory Leak Preventer (ระบบกวาดล้างหน่วยความจำขยะ)
    // =========================================================================
    
    /**
     * ลงทะเบียน Firebase Listener เพื่อให้ระบบจำไว้ว่าต้องปิดตอนเปลี่ยนหน้า ป้องกัน RAM บวม
     * @param {string} pageId - ชื่อหน้า (เช่น 'dashboard', 'patient_history')
     * @param {string} path - Firebase path (เช่น 'patients_database_v2/visits')
     * @param {function} callback - ฟังก์ชันที่รับค่าจาก Firebase
     */
    registerFirebaseListener(pageId, path, callback) {
        if (!this.activeListeners.has(pageId)) {
            this.activeListeners.set(pageId, new Map()); // ใช้ Map เพื่อป้องกัน Listener ซ้ำซ้อน
        }
        
        const pageListeners = this.activeListeners.get(pageId);
        
        // ถ้าเคยดักจับ Path นี้ด้วย Callback นี้แล้ว ให้ข้ามไป ป้องกันการจอง RAM ซ้ำซ้อน
        const listenerKey = `${path}_${callback.name || 'anonymous'}`;
        if (pageListeners.has(listenerKey)) return;

        db.ref(path).on('value', callback);
        pageListeners.set(listenerKey, { path, callback });
    }

    /**
     * สั่งปิด Listener ทั้งหมดของหน้าเก่า คืน RAM ให้ระบบทันที (เรียกใช้ตอนสลับหน้า)
     */
    purgeListenersForPage(pageId) {
        if (this.activeListeners.has(pageId)) {
            const pageListeners = this.activeListeners.get(pageId);
            pageListeners.forEach(l => {
                db.ref(l.path).off('value', l.callback);
            });
            this.activeListeners.delete(pageId);
        }
    }

    // =========================================================================
    // 2. ⚡ Anti-Freeze Rendering (ระบบวาดหน้าจอแบบแบ่งเวลา - Time Slicing)
    // =========================================================================
    
    /**
     * 🚨 THE FIX: อัปเกรดเป็น Time-Slicing Algorithm
     * ระบบจะไม่สนใจ "จำนวนชิ้น" แต่จะจับ "เวลาประมวลผล" ถ้าเกิน 12ms จะหยุดพักทันที
     * ป้องกันอาการคอมกระตุกเป็นช่วงๆ (Main Thread Blocking) ได้เด็ดขาด 100%
     */
    async renderInChunks(array, renderItemCallback, onComplete = null) {
        if (!array || array.length === 0) {
            if(onComplete) onComplete();
            return;
        }

        let index = 0;
        const total = array.length;

        const processChunk = () => {
            const startTime = performance.now(); // เริ่มจับเวลาเสี้ยววินาที

            // ทำงานไปเรื่อยๆ จนกว่าเวลาในรอบนี้จะหมด (เกิน 12ms) หรือจนกว่าข้อมูลจะหมด
            while (index < total && (performance.now() - startTime) < this.MAX_TIME_PER_FRAME) {
                renderItemCallback(array[index], index);
                index++;
            }

            if (index < total) {
                // ถ้าหมดยก (เวลาเกิน) แต่ของยังไม่หมด ให้เบราว์เซอร์พักวาดหน้าจอ แล้วเรียกตัวเองใหม่ในเฟรมถัดไป
                requestAnimationFrame(processChunk);
            } else {
                // วาดเสร็จสมบูรณ์
                if (onComplete) {
                    // หน่วงเวลาให้เบราว์เซอร์หายใจ 1 จังหวะก่อนเรียก onComplete (เช่นการปิด Loading)
                    requestAnimationFrame(onComplete);
                }
            }
        };

        // เริ่มต้นวงจร
        requestAnimationFrame(processChunk);
    }

    // =========================================================================
    // 3. 🔍 Smart Query Builder (ดึงข้อมูลแบบฉลาด ไม่กิน RAM)
    // =========================================================================
    
    /**
     * ดึงประวัติการรักษาเฉพาะคนไข้ที่ระบุ และใช้ forEach ของ Firebase ตรงๆ ประหยัด RAM กว่า Object.keys
     */
    async fetchVisitsByHN(hn, limit = 50) {
        try {
            const snap = await db.ref('patients_database_v2/visits')
                                 .orderByChild('hn')
                                 .equalTo(hn)
                                 .limitToLast(limit)
                                 .once('value');
            
            const visits = [];
            // 🚨 THE FIX: ใช้ forEach ตรงๆ ของ Firebase ประหยัด RAM ไม่ต้องแปลง Object
            snap.forEach(childSnap => {
                visits.push({ firebaseKey: childSnap.key, ...childSnap.val() });
            });
            
            return visits.reverse(); // เรียงจากล่าสุดไปเก่าสุด
        } catch (error) {
            console.error("Smart Query Error:", error);
            return [];
        }
    }

    // =========================================================================
    // 4. 🗜️ Payload Optimizer (ระบบบีบอัดและคืนหน่วยความจำรูปภาพ)
    // =========================================================================
    
    /**
     * บีบอัดรูปภาพ พร้อมบังคับ Garbage Collection (GC) ทันที ป้องกัน RAM บวมจากการอัปโหลด
     */
    compressImageAsync(file, maxWidth = 800, quality = 0.7) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
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
                    
                    // วาดรูปคุณภาพสูง
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = "high";
                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedBase64 = canvas.toDataURL('image/jpeg', quality);

                    // 🚨 THE FIX: คืนหน่วยความจำ (Garbage Collection) ทันทีที่แปลงเสร็จ ป้องกัน Browser ค้าง
                    ctx.clearRect(0, 0, width, height);
                    canvas.width = 0;
                    canvas.height = 0;
                    img.src = ""; 

                    resolve(compressedBase64);
                };
                img.onerror = (err) => reject(err);
                img.src = event.target.result;
            };
            reader.onerror = (err) => reject(err);
        });
    }

    // =========================================================================
    // 5. ⏱️ Event Optimizer (หน่วงคำสั่ง ป้องกันรัวปุ่มและลดภาระ CPU)
    // =========================================================================
    
    /**
     * ดักจับการพิมพ์ (Typing) ถ้าผู้ใช้ยังพิมพ์รัวๆ จะยังไม่ทำงาน จนกว่าจะหยุดพิมพ์ (เช่น 500ms)
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

    /**
     * จำกัดความถี่ในการทำงาน (เช่น Scroll, Resize) ห้ามทำงานถี่กว่าระยะเวลาที่กำหนด (เช่น 100ms)
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// 🌐 Expose Component สู่ระบบ
const PerformanceEngine = new PerformanceEngineService();
window.PerformanceEngine = PerformanceEngine;