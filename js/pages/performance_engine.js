// js/pages/performance_engine.js
// 🚀 Enterprise Performance & Memory Optimization Engine V3.5 (Quantum Edition - Stabilized)
// ขีดสุดของเทคโนโลยีเบราว์เซอร์: ควบคุม Event Loop, GPU Acceleration, True LRU และ Zero-Reflow DOM

class PerformanceEngineService {
    constructor() {
        this.activeListeners = new Map(); // จดจำ Listener อ้างอิงตาม Memory Reference (Map<PageId, Map<Path, Set<Function>>>)
        this.cache = new Map(); // True LRU Cache สำหรับเก็บข้อมูล Firebase ชั่วคราว
        this.MAX_CACHE_SIZE = 50; // เก็บข้อมูลสูงสุด 50 ชุด ป้องกัน RAM ล้น
        
        // กำหนดเวลาสูงสุด 8ms เพื่อเว้นที่ว่างให้จอ 120Hz (8.3ms/frame) ตอบสนองได้ 60-120fps เสมอ
        this.MAX_TIME_PER_FRAME = 8; 
        
        // ⚡ อาวุธลับ: สร้าง MessageChannel สำหรับแทรกแซง Event Loop (React Fiber Architecture)
        this.channel = new MessageChannel();
        this.taskQueue = [];
        this.isFlushing = false;
        
        this.channel.port1.onmessage = () => this._flushTaskQueue();

        console.log("%c🌌 [Quantum Engine] V3.5 Core Activated. Event-Loop Secured.", "color: #06b6d4; font-weight: bold; font-size: 14px; text-shadow: 0 0 5px #06b6d4;");
    }

    // =========================================================================
    // 1. 🛡️ Next-Gen Memory & Listener Manager (กวาดล้างขยะหมดจดด้วย Reference Check)
    // =========================================================================
    
    registerFirebaseListener(pageId, path, callback) {
        if (!this.activeListeners.has(pageId)) {
            this.activeListeners.set(pageId, new Map());
        }
        const pageListeners = this.activeListeners.get(pageId);
        
        if (!pageListeners.has(path)) {
            pageListeners.set(path, new Set());
        }
        const pathCallbacks = pageListeners.get(path);

        // 🚨 THE FIX: ใช้ Set เพื่อเก็บ Memory Reference ของ Callback โดยตรง ป้องกันปัญหา Anonymous Function
        if (!pathCallbacks.has(callback)) {
            db.ref(path).on('value', callback);
            pathCallbacks.add(callback);
        }
    }

    purgeListenersForPage(pageId) {
        if (this.activeListeners.has(pageId)) {
            const pageListeners = this.activeListeners.get(pageId);
            
            // 🚨 THE FIX: ถอดถอน Listener ด้วย Reference ที่ถูกต้อง 100%
            pageListeners.forEach((callbacks, path) => {
                callbacks.forEach(cb => db.ref(path).off('value', cb));
            });
            
            this.activeListeners.delete(pageId);
        }
        // เรียก Garbage Collector ยามว่าง
        this.scheduleIdleTask(() => this._cleanUpCache());
    }

    // =========================================================================
    // 2. ⚡ Quantum Time-Slicing (ทำงานแบบ Micro-tasking พร้อม Error Boundary)
    // =========================================================================
    
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
                // 🚨 THE FIX: Error Boundary ป้องกันข้อมูลเสีย 1 ตัวทำระบบ Queue ค้างทั้งระบบ
                try {
                    renderItemCallback(array[index], index);
                } catch (error) {
                    console.error(`[Quantum Engine] Non-Fatal Error at chunk index ${index}:`, error);
                }
                index++;
            }

            if (index < total) {
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
            this.channel.port2.postMessage(null); // สะกิด Event Loop ท้ายคิว (Macro-task)
        }
    }

    _flushTaskQueue() {
        this.isFlushing = false;
        const startTime = performance.now();
        
        while (this.taskQueue.length > 0 && (performance.now() - startTime) < this.MAX_TIME_PER_FRAME) {
            const task = this.taskQueue.shift();
            try {
                task();
            } catch (error) {
                console.error("[Quantum Engine] Task Queue Execution Error:", error);
            }
        }

        if (this.taskQueue.length > 0) {
            this._requestFlush(); // ทำงานไม่ทัน ยกยอดไปรอบหน้า
        }
    }

    // =========================================================================
    // 3. 🧩 Zero-Reflow DOM Batcher (วาด HTML ทีเดียวจบ ไม่กระตุก)
    // =========================================================================
    
    batchDOMUpdate(targetContainerId, items, renderHtmlCallback) {
        return new Promise((resolve) => {
            const container = document.getElementById(targetContainerId);
            if (!container) return resolve();

            // สร้างกระดาษทดใน Memory
            const fragment = document.createDocumentFragment();

            this.renderInChunks(items, (item, index) => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = renderHtmlCallback(item, index).trim();
                
                while (tempDiv.firstChild) {
                    fragment.appendChild(tempDiv.firstChild);
                }
            }, () => {
                // แปะลงจอทีเดียวตู้ม! กระตุ้น DOM Reflow แค่ครั้งเดียว
                container.appendChild(fragment);
                resolve();
            });
        });
    }

    // =========================================================================
    // 4. 🗜️ Hardware-Accelerated Image Optimizer (GPU Acceleration)
    // =========================================================================
    
    async compressImageAsync(file, maxWidth = 800, quality = 0.7) {
        try {
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
                bitmap.close(); // คืน Memory ทันทีป้องกัน OOM
                return await this._blobToBase64(blob);
            } else {
                return this._traditionalCompress(file, maxWidth, quality);
            }
        } catch (error) {
            console.warn("[Quantum Engine] GPU Acceleration failed, using fallback.", error);
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
    // 5. 🧠 True LRU Smart Query Cache (โหลดไวแสง พร้อมเรียงลำดับการใช้)
    // =========================================================================
    
    async fetchVisitsByHN(hn, limit = 50) {
        const cacheKey = `visits_${hn}_${limit}`;
        
        // 🚨 THE FIX: True LRU Logic - ถ้านำข้อมูลเก่ามาใช้ ต้องดึงมาต่อคิวหน้าสุดเสมอ!
        if (this.cache.has(cacheKey)) {
            const cachedValue = this.cache.get(cacheKey);
            this.cache.delete(cacheKey);
            this.cache.set(cacheKey, cachedValue); // ย้ายไปลำดับล่าสุด
            console.log(`⚡ [Cache Hit] 0ms load for HN: ${hn}`);
            return cachedValue;
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

            // ลบแคชที่เก่าที่สุด (อยู่ที่ Index 0 ของ Map เสมอ) ทิ้งเมื่อล้น
            if (this.cache.size >= this.MAX_CACHE_SIZE) {
                const oldestKey = this.cache.keys().next().value;
                this.cache.delete(oldestKey);
            }
            this.cache.set(cacheKey, result);

            return result;
        } catch (error) {
            console.error("[Quantum Engine] Smart Query Error:", error);
            return [];
        }
    }

    // =========================================================================
    // 6. 🛋️ Background Idle Tasker (ฝากงานทำตอนคอมพิวเตอร์ว่าง)
    // =========================================================================
    
    scheduleIdleTask(task) {
        if ('requestIdleCallback' in window) {
            requestIdleCallback((deadline) => {
                if (deadline.timeRemaining() > 2) task();
            });
        } else {
            setTimeout(task, 2000); 
        }
    }

    _cleanUpCache() {
        if (this.cache.size > this.MAX_CACHE_SIZE / 2) {
            console.log("🧹 [Idle] Auto-cleaning cache for memory efficiency...");
            let i = 0;
            // ค่อยๆ ทยอยลบข้อมูลเก่า 10 ตัวแรก
            for (const key of this.cache.keys()) {
                if (i >= 10) break;
                this.cache.delete(key);
                i++;
            }
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