// js/pages/realtime_sync_engine.js
// 🚀 สมองกลควบคุมการส่งข้อมูลเรียลไทม์ (Real-time Sync & State Manager V10)
// ทำหน้าที่: ตรวจสอบสถานะการเชื่อมต่อ, จัดการ Cache ให้แสดงผลเร็วที่สุด, และแสดง UI สถานะ

const RealtimeSyncEngine = {
    isConnected: false,
    pingInterval: null,
    latency: 0,

    init: function() {
        if (typeof firebase === 'undefined' || typeof db === 'undefined') {
            console.warn("⚠️ [Realtime Engine] Firebase is not initialized yet.");
            return;
        }

        this.injectUI();
        this.monitorConnection();
        console.log("⚡ [Realtime Engine] Activated - High-Speed Sync Ready.");
    },

    injectUI: function() {
        if (document.getElementById('realtime-status-widget')) return;

        // ฝัง CSS ของป้ายสถานะ
        const style = document.createElement('style');
        style.innerHTML = `
            .realtime-widget {
                position: fixed; bottom: 20px; left: 20px; z-index: 9990;
                background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.6); border-radius: 50px;
                padding: 6px 14px; display: flex; align-items: center; gap: 8px;
                box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
                font-family: 'Prompt', sans-serif; font-size: 12px; font-weight: 700;
                transition: all 0.3s ease; pointer-events: none;
            }
            @media (max-width: 767px) {
                .realtime-widget { bottom: 15px; left: 15px; transform: scale(0.9); transform-origin: bottom left; }
            }
            .sync-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
            .sync-dot.active { background-color: #10b981; box-shadow: 0 0 8px #10b981; animation: pulse-green 2s infinite; }
            .sync-dot.offline { background-color: #ef4444; box-shadow: 0 0 8px #ef4444; animation: pulse-red 1s infinite; }
            .sync-text { color: #475569; letter-spacing: 0.3px; }
            .sync-ping { font-size: 10px; color: #94a3b8; font-weight: 600; font-variant-numeric: tabular-nums; margin-left: 2px; }
            
            @keyframes pulse-green { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
            @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        `;
        document.head.appendChild(style);

        // ฝัง HTML ของป้ายสถานะ
        const widget = document.createElement('div');
        widget.id = 'realtime-status-widget';
        widget.className = 'realtime-widget fade-in-up';
        widget.innerHTML = `
            <span class="sync-dot active" id="sync-dot-indicator"></span>
            <span class="sync-text" id="sync-text-indicator">Live Sync Active</span>
            <span class="sync-ping" id="sync-ping-indicator">-- ms</span>
        `;
        document.body.appendChild(widget);
    },

    monitorConnection: function() {
        const dot = document.getElementById('sync-dot-indicator');
        const text = document.getElementById('sync-text-indicator');
        const ping = document.getElementById('sync-ping-indicator');

        // ตรวจสอบการเชื่อมต่อกับ Firebase Realtime Database
        db.ref('.info/connected').on('value', (snap) => {
            if (snap.val() === true) {
                this.isConnected = true;
                if(dot) { dot.className = 'sync-dot active'; }
                if(text) { text.innerText = 'Live Sync Active'; text.style.color = '#0f172a'; }
                this.startPingTest(ping);
            } else {
                this.isConnected = false;
                if(dot) { dot.className = 'sync-dot offline'; }
                if(text) { text.innerText = 'Offline - กำลังเชื่อมต่อใหม่...'; text.style.color = '#ef4444'; }
                if(ping) { ping.innerText = 'Wait'; }
                if(this.pingInterval) clearInterval(this.pingInterval);
            }
        });
    },

    startPingTest: function(pingElement) {
        if(this.pingInterval) clearInterval(this.pingInterval);
        
        const testPing = () => {
            if(!this.isConnected) return;
            const start = Date.now();
            // เช็คความเร็วด้วยการอ่านค่า Timestamp เปล่าๆ
            db.ref('.info/serverTimeOffset').once('value').then(() => {
                const ms = Date.now() - start;
                this.latency = ms;
                if(pingElement) {
                    pingElement.innerText = `${ms} ms`;
                    // เปลี่ยนสี Ping ตามความเร็ว
                    pingElement.style.color = ms < 100 ? '#10b981' : (ms < 300 ? '#f59e0b' : '#ef4444');
                }
            });
        };

        testPing(); // ยิงครั้งแรกทันที
        this.pingInterval = setInterval(testPing, 15000); // อัปเดต Ping ทุกๆ 15 วินาทีเพื่อไม่ให้กินเน็ต
    },

    // 🌟 ฟังก์ชันพิเศษ (API) ให้หน้าเว็บอื่นๆ เรียกใช้เพื่อดึงข้อมูลอย่างรวดเร็ว (Cache First + Network Later)
    fetchFast: async function(path, cacheKey) {
        const cachedData = localStorage.getItem(cacheKey);
        // ถ้ามีข้อมูลในเครื่อง ให้ส่งกลับไปแสดงผลทันทีก่อน (Optimistic Load)
        if (cachedData) {
            setTimeout(() => {
                // สั่งดึงข้อมูลใหม่มาอัปเดตทับเบื้องหลังอย่างแม่นยำ
                db.ref(path).once('value').then(snap => {
                    localStorage.setItem(cacheKey, JSON.stringify(snap.val()));
                });
            }, 50);
            return JSON.parse(cachedData);
        } else {
            // ถ้าไม่มีแคช ให้รอโหลดจากเน็ต
            const snap = await db.ref(path).once('value');
            const data = snap.val();
            localStorage.setItem(cacheKey, JSON.stringify(data));
            return data;
        }
    }
};

// สตาร์ทเครื่องยนต์ทันทีที่หน้าเว็บโหลดเสร็จ
document.addEventListener("DOMContentLoaded", () => {
    // หน่วงเวลาเล็กน้อยให้ Firebase พร้อมทำงานก่อน
    setTimeout(() => {
        if(typeof db !== 'undefined') RealtimeSyncEngine.init();
    }, 1000);
});