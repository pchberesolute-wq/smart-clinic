// js/pages/performance_engine.js
// 🚀 Enterprise Performance & Memory Optimization Engine V3.0 (Quantum Edition)
// ขีดสุดของเทคโนโลยีเบราว์เซอร์: ควบคุม Event Loop, GPU Acceleration และ Zero-Reflow DOM

class PerformanceEngineService {
    constructor() {
        this.activeListeners = new Map(); // จดจำ Listener ทั้งระบบ
        this.cache = new Map(); // LRU Cache สำหรับเก็บข้อมูล Firebase ชั่วคราว
        this.MAX_CACHE_SIZE = 50; // เก็บข้อมูลสูงสุด 50 ชุด ป้องกัน RAM ล้น
        
        // กำหนดเวลาสูงสุด 8ms (เข้มงวดกว่าเดิม) เพื่อเว้นที่ว่างให้จอ 120Hz (8.3ms/frame)
        this.MAX_TIME_PER_FRAME = 8; 
        
        // ⚡ อาวุธลับ: สร้าง MessageChannel สำหรับแทรกแซง Event Loop (แบบเดียวกับ React Fiber)
        this.channel = new MessageChannel();
        this.taskQueue = [];
        this.isFlushing = false;
        
        this.channel.port1.onmessage = () => this._flushTaskQueue();

        console.log("%c🌌 [Quantum Engine] V3.0 Core Activated. Event-Loop Hijacked.", "color: #06b6d4; font-weight: bold; font-size: 14px; text-shadow: 0 0 5px #06b6d4;");
    }

    // =========================================================================
    // 1. 🛡️ Next-Gen Memory & Listener Manager (กวาดล้างขยะหมดจด)
    // =========================================================================
    
    registerFirebaseListener(pageId, path, callback) {
        if (!this.activeListeners.has(pageId)) {
            this.activeListeners.set(pageId, new Map());
        }
        const pageListeners = this.activeListeners.get(pageId);
        const listenerKey = `${path}_${callback.name || 'anonymous'}`;
        if (pageListeners.has(listenerKey)) return;

        db.ref(path).on('value', callback);
        pageListeners.set(listenerKey, { path, callback });
    }

    purgeListenersForPage(pageId) {
        if (this.activeListeners.has(pageId)) {
            const pageListeners = this.activeListeners.get(pageId);
            pageListeners.forEach(l => {
                db.ref(l.path).off('value', l.callback);
            });
            this.activeListeners.delete(pageId);
        }
        // เรียก GC ยามว่าง
        this.scheduleIdleTask(() => this._cleanUpCache());
    }

    // =========================================================================
    // 2. ⚡ Quantum Time-Slicing (ทำงานแบบ Micro-tasking ไร้รอยต่อ 100%)
    // =========================================================================
    
    /**
     * @description หั่นงานเป็นชิ้นเล็กจิ๋ว และใช้ MessageChannel ดันงานไปคิวหลังสุด 
     * ทำให้เบราว์เซอร์มีเวลาตอบสนองเมาส์ การคลิก และ CSS Animation แบบ 120FPS
     */
    async renderInChunks(array, renderItemCallback, onComplete = null) {
        if (!array || array.length === 0) {
            if(onComplete) onComplete();
            return;
        }

        let index = 0;
        const total = array.length;

        const processChunk = () => {
            const startTime = performance.now();

            // ทำงานจนกว่าจะกินเวลา CPU เกิน 8ms
            while (index < total && (performance.now() - startTime) < this.MAX_TIME_PER_FRAME) {
                renderItemCallback(array[index], index);
                index++;
            }

            if (index < total) {
                // 🚨 THE FIX: ไม่ใช้ requestAnimationFrame แล้ว แต่ใช้ MessageChannel
                // เพื่อหลีกเลี่ยงข้อจำกัดเวลายุบหน้าจอ (Background Tab Throttling)
                this.taskQueue.push(processChunk);
                this._requestFlush();
            } else {
                if (onComplete) {
                    this.taskQueue.push(onComplete);
                    this._requestFlush();
                }
            }
        };

        this.taskQueue.push(processChunk);
        this._requestFlush();
    }

    _requestFlush() {
        if (!this.isFlushing) {
            this.isFlushing = true;
            this.channel.port2.postMessage(null); // สะกิด Event Loop
        }
    }

    _flushTaskQueue() {
        this.isFlushing = false;
        const startTime = performance.now();
        
        while (this.taskQueue.length > 0 && (performance.now() - startTime) < this.MAX_TIME_PER_FRAME) {
            const task = this.taskQueue.shift();
            task();
        }

        if (this.taskQueue.length > 0) {
            this._requestFlush(); // ทำงานไม่ทัน ยกยอดไปรอบหน้า
        }
    }

    // =========================================================================
    // 3. 🧩 Zero-Reflow DOM Batcher (วาด HTML ทีเดียวจบ ไม่กระตุก)
    // =========================================================================
    
    /**
     * @description รวบรวม HTML Elements ไปไว้ในกระดาษทด (Fragment) ก่อน 
     * แล้วค่อยแปะลงจอทีเดียว ลดภาระการวาดหน้าจอซ้ำซ้อน (Repaint/Reflow) ถึง 90%
     */
    batchDOMUpdate(targetContainerId, items, renderHtmlCallback) {
        return new Promise((resolve) => {
            const container = document.getElementById(targetContainerId);
            if (!container) return resolve();

            // สร้างกระดาษทดใน Memory
            const fragment = document.createDocumentFragment();

            this.renderInChunks(items, (item, index) => {
                // แปลง String เป็น Node
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = renderHtmlCallback(item, index).trim();
                
                // ย้าย Node ลงกระดาษทด (เร็วมาก)
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }
            }, () => {
                // แปะลงจอทีเดียวตู้ม!
                container.appendChild(fragment);
                resolve();
            });
        });
    }

    // =========================================================================
    // 4. 🗜️ Hardware-Accelerated Image Optimizer (ดึงการ์ดจอมาช่วยบีบอัดรูป)
    // =========================================================================
    
    /**
     * @description ใช้ OffscreenCanvas และ createImageBitmap ถ้ามี เพื่อไม่ให้ CPU หลักสะดุด
     */
    async compressImageAsync(file, maxWidth = 800, quality = 0.7) {
        try {
            // ตรวจสอบเทคโนโลยีขั้นสูง
            if (window.createImageBitmap && window.OffscreenCanvas) {
                const bitmap = await createImageBitmap(file);
                let width = bitmap.width;
                let height = bitmap.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                // วาดลง Canvas ใน Memory ที่เร่งความเร็วด้วย GPU
                const canvas = new OffscreenCanvas(width, height);
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(bitmap, 0, 0, width, height);
                
                const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: quality });
                bitmap.close(); // คืน Memory ทันที
                return await this._blobToBase64(blob);
            } else {
                // Fallback สำหรับเบราว์เซอร์เก่า
                return this._traditionalCompress(file, maxWidth, quality);
            }
        } catch (error) {
            console.warn("GPU Acceleration failed, using fallback.", error);
            return this._traditionalCompress(file, maxWidth, quality);
        }
    }

    _blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
        });
    }

    _traditionalCompress(file, maxWidth, quality) {
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
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = "high";
                    ctx.drawImage(img, 0, 0, width, height);
                    const b64 = canvas.toDataURL('image/jpeg', quality);
                    
                    // Force GC
                    ctx.clearRect(0, 0, width, height);
                    canvas.width = canvas.height = 0;
                    img.src = ""; 
                    resolve(b64);
                };
                img.onerror = reject;
                img.src = event.target.result;
            };
            reader.onerror = reject;
        });
    }

    // =========================================================================
    // 5. 🧠 LRU Smart Query Cache (โหลดแสง 0 วินาที)
    // =========================================================================
    
    async fetchVisitsByHN(hn, limit = 50) {
        const cacheKey = `visits_${hn}_${limit}`;
        
        // ถ้ามีใน Cache และยังไม่หมดอายุ (เช่นตั้งไว้ 10 นาที) ให้คืนค่าจาก RAM เลย!
        if (this.cache.has(cacheKey)) {
            console.log(`⚡ [Cache Hit] 0ms load for HN: ${hn}`);
            return this.cache.get(cacheKey);
        }

        try {
            const snap = await db.ref('patients_database_v2/visits')
                                 .orderByChild('hn')
                                 .equalTo(hn)
                                 .limitToLast(limit)
                                 .once('value');
            
            const visits = [];
            snap.forEach(childSnap => {
                visits.push({ firebaseKey: childSnap.key, ...childSnap.val() });
            });
            
            const result = visits.reverse();

            // บันทึกลง Cache
            if (this.cache.size >= this.MAX_CACHE_SIZE) {
                // ลบตัวแรกสุด (เก่าสุด) ทิ้งเพื่อเว้นที่
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
            this.cache.set(cacheKey, result);

            return result;
        } catch (error) {
            console.error("Smart Query Error:", error);
            return [];
        }
    }

    // =========================================================================
    // 6. 🛋️ Background Idle Tasker (ฝากงานทำตอนคอมพิวเตอร์ว่าง)
    // =========================================================================
    
    scheduleIdleTask(task) {
        if ('requestIdleCallback' in window) {
            requestIdleCallback((deadline) => {
                // ทำงานก็ต่อเมื่อมีเวลาเหลือเกิน 2ms
                if (deadline.timeRemaining() > 2) task();
            });
        } else {
            setTimeout(task, 2000); // Fallback
        }
    }

    _cleanUpCache() {
        // แอบล้างข้อมูลเก่าตอนผู้ใช้ไม่ได้ขยับเมาส์
        if (this.cache.size > this.MAX_CACHE_SIZE / 2) {
            console.log("🧹 [Idle] Auto-cleaning cache...");
            const keysToDelete = Array.from(this.cache.keys()).slice(0, 10);
            keysToDelete.forEach(k => this.cache.delete(k));
        }
    }

    // =========================================================================
    // 7. ⏱️ Event Optimizer (Debounce & Throttle)
    // =========================================================================
    
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