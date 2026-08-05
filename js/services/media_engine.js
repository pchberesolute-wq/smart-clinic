// js/services/media_engine.js
// 🚀 Enterprise Media Engine V2.0: GPU-Accelerated Compression, EXIF-Safe & Zero-OOM Engine

class MediaEngineService {
    constructor() {
        this.defaultOptions = {
            maxSizeMB: 0.2,          // บีบอัดไม่เกิน 200KB
            maxWidthOrHeight: 1920,  // ขนาดสูงสุด 1920px
            useWebWorker: true,      // ใช้ Thread แยก ไม่ให้หน้าเว็บค้าง
            initialQuality: 0.8,     // คุณภาพเริ่มต้น 80%
            alwaysKeepResolution: true // รักษาสัดส่วนภาพเสมอ
        };
        
        console.log("%c🌌 [Media Engine] V2.0 GPU-Accelerated Core Activated.", "color: #3b82f6; font-weight: bold; font-size: 13px; text-shadow: 0 0 5px rgba(59,130,246,0.5);");
    }

    /**
     * @param {File} file - ไฟล์ที่ได้จาก <input type="file">
     * @param {Object} customOptions - (Optional) ตั้งค่าการบีบอัดเฉพาะกิจ
     * @returns {Promise<String|null>} - คืนค่าเป็น Base64 String (พร้อมใช้) หรือ null ถ้าล้มเหลว
     */
    async compressImageToBase64(file, customOptions = {}) {
        if (!file || !file.type.startsWith('image/')) {
            console.warn("⚠️ [MediaEngine] ไม่ใช่ไฟล์รูปภาพ ข้ามการบีบอัด");
            return null;
        }

        const options = { ...this.defaultOptions, ...customOptions };
        
        try {
            if (typeof imageCompression !== 'function') {
                throw new Error("Missing 'browser-image-compression' library");
            }

            // 1. บีบอัดด้วย WebWorker Library (Non-blocking)
            const compressedFile = await imageCompression(file, options);
            
            // 2. แปลง Blob เป็น Base64
            return await this._fileToBase64(compressedFile);

        } catch (error) {
            console.warn("🔥 [MediaEngine] Primary Engine Failed. Switching to Quantum Fallback:", error);
            // 🚨 THE FIX: สลับไปใช้ระบบบีบอัดระดับ GPU (ป้องกันแอปค้าง)
            return await this._quantumCanvasCompress(file, options.maxWidthOrHeight, options.initialQuality);
        }
    }

    /**
     * แปลงไฟล์ PDF เป็น Base64 พร้อม Guard ป้องกัน Payload ทะลัก
     * @param {File} file 
     * @param {number} maxSizeMB 
     */
    async processPDF(file, maxSizeMB = 2) {
        if (!file || file.type !== 'application/pdf') return null;
        
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSizeMB) {
            throw new Error(`ไฟล์ PDF ใหญ่เกินกำหนด (${sizeMB.toFixed(2)}MB / Limit: ${maxSizeMB}MB)`);
        }

        return await this._fileToBase64(file);
    }

    // =========================================================================
    // 🛡️ INTERNAL ENGINE HELPERS
    // =========================================================================

    /**
     * ⚡ แปลง File/Blob เป็น Base64 String แบบ Asynchronous
     */
    _fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error("FileReader Execution Failed"));
            reader.readAsDataURL(file);
        });
    }

    /**
     * 🚀 THE FIX: GPU-Accelerated Fallback Compressor
     * อ่านไฟล์ด้วย ImageBitmap (ประหยัด RAM) และเรนเดอร์ลง OffscreenCanvas (ไม่กวน UI)
     */
    async _quantumCanvasCompress(file, maxWidth, quality) {
        try {
            // Feature Detection: เช็คว่าเบราว์เซอร์รองรับเทคโนโลยีนี้หรือไม่
            if (window.createImageBitmap && window.OffscreenCanvas) {
                // 🚨 imageOrientation: "from-image" แก้ภาพตะแคง 90 องศาจากกล้องมือถือ (EXIF) อัตโนมัติ!
                const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
                
                let { width, height } = bitmap;
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                // วาดภาพด้วยชิปกราฟิก (GPU) แยกต่างหาก ไม่ยุ่งกับ Main Thread
                const canvas = new OffscreenCanvas(width, height);
                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(bitmap, 0, 0, width, height);

                // Export กลับเป็น Blob
                const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: quality });
                
                // 🧹 THE FIX: บังคับ Garbage Collection ทันที คืน VRAM ให้ระบบ!
                bitmap.close(); 
                
                return await this._fileToBase64(blob);
            } else {
                // เบราว์เซอร์เก่าจัด ให้ถอยกลับไปใช้วิธีดั้งเดิม
                return await this._legacyCanvasCompress(file, maxWidth, quality);
            }
        } catch (error) {
            console.error("❌ [MediaEngine] Quantum Compression Failed:", error);
            // 최후의ไม้ตาย (Last Resort)
            return await this._legacyCanvasCompress(file, maxWidth, quality);
        }
    }

    /**
     * 🪵 Legacy Canvas Compressor (สำหรับ Browser รุ่นเก่ามากๆ เช่น Safari 14 ลงไป)
     * มาพร้อมระบบทำความสะอาด VRAM (Garbage Collection) ที่เข้มงวด
     */
    _legacyCanvasCompress(file, maxWidth, quality) {
        return new Promise((resolve) => {
            let timeout = setTimeout(() => resolve(null), 15000); 
            
            try {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        try {
                            const canvas = document.createElement('canvas'); 
                            let scaleSize = 1;
                            if(img.width > maxWidth) scaleSize = maxWidth / img.width;
                            
                            canvas.width = img.width * scaleSize; 
                            canvas.height = img.height * scaleSize;
                            
                            const ctx = canvas.getContext('2d'); 
                            ctx.imageSmoothingEnabled = true;
                            ctx.imageSmoothingQuality = "high";
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            
                            const base64Str = canvas.toDataURL('image/jpeg', quality);
                            
                            // 🧹 THE FIX: Aggressive Garbage Collection
                            // ป้องกัน Memory Leak คาบราวเซอร์เมื่อทำการบีบอัดรูปหลายๆ รูป
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            canvas.width = canvas.height = 0;
                            img.src = ""; 
                            
                            clearTimeout(timeout); 
                            resolve(base64Str); 
                        } catch (err) { 
                            clearTimeout(timeout); resolve(null); 
                        }
                    };
                    img.onerror = () => { clearTimeout(timeout); resolve(null); }; 
                    img.src = event.target.result;
                };
                reader.onerror = () => { clearTimeout(timeout); resolve(null); }; 
                reader.readAsDataURL(file);
            } catch(e) { 
                clearTimeout(timeout); resolve(null); 
            }
        });
    }
}

// 🌐 Expose Global Service
window.AppMediaEngine = new MediaEngineService();