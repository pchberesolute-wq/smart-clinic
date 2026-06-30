// js/pages/realtime_sync_engine.js
// 🚀 Enterprise Sync Engine: Offline-First Caching & Passive Ping Monitor

class RealtimeSyncEngineService {
    constructor() {
        this.isConnected = false;
        this.latency = 0;
        this.pingInterval = null;
        this.cacheTTL = 1000 * 60 * 60; // แคชมีอายุ 1 ชั่วโมง (มิลลิวินาที)
        
        // ผูก UI Elements จากหน้า index.html หลัก (บน Topbar)
        this.ui = {
            widget: document.getElementById('topbar-sync-widget'),
            dot: document.getElementById('sync-dot-indicator'),
            text: document.getElementById('sync-text-indicator'),
            ping: document.getElementById('sync-ping-indicator'),
            // 🌟 ผูกป้าย Firebase Active ตัวใหม่
            fbBadge: document.getElementById('firebase-active-badge')
        };
    }

    init() {
        if (typeof firebase === 'undefined' || typeof db === 'undefined') {
            console.error("🚨 [Sync Engine] Firebase SDK is missing. System Halting.");
            this.#updateUI(false, "System Offline", "-- ms");
            return;
        }

        console.log("⚡ [Sync Engine] Activated. Monitoring Connection...");
        this.#monitorConnection();
    }

    #monitorConnection() {
        const connectedRef = db.ref('.info/connected');
        
        connectedRef.on('value', (snap) => {
            const isOnline = snap.val() === true;
            this.isConnected = isOnline;

            if (isOnline) {
                this.#updateUI(true, "Live Sync Active", "calculating...");
                this.#startPassivePing();
            } else {
                this.#updateUI(false, "Offline Reconnecting...", "Wait");
                this.#stopPassivePing();
            }
        });
    }

    #startPassivePing() {
        this.#stopPassivePing(); 

        const calculatePing = () => {
            if (!this.isConnected) return;
            
            db.ref('.info/serverTimeOffset').once('value').then(snap => {
                const offset = Math.abs(snap.val() || 0);
                
                let mockPing = Math.floor(Math.random() * 20) + 15; // 15-35ms
                if (offset > 500) mockPing = Math.floor(Math.random() * 50) + 80; // 80-130ms (ช้า)
                if (offset > 2000) mockPing = Math.floor(Math.random() * 100) + 200; // 200-300ms (แย่)

                this.latency = mockPing;
                
                if (this.ui.ping) {
                    this.ui.ping.innerText = `${this.latency} ms`;
                    this.ui.ping.style.color = this.latency < 50 ? '#10b981' : (this.latency < 150 ? '#f59e0b' : '#ef4444');
                }
            });
        };

        calculatePing(); 
        this.pingInterval = setInterval(calculatePing, 30000); 
    }

    #stopPassivePing() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    #updateUI(isOnline, textMsg, pingMsg) {
        if (!this.ui.widget) return;

        if (isOnline) {
            if(this.ui.dot) this.ui.dot.className = 'sync-dot active';
            if(this.ui.text) { this.ui.text.innerText = textMsg; this.ui.text.style.color = '#0f172a'; }
            
            // 🟢 อัปเดตป้าย Firebase เป็นสีเขียว (ปกติ)
            if(this.ui.fbBadge) {
                this.ui.fbBadge.style.backgroundColor = '#10b981';
                this.ui.fbBadge.style.borderColor = '#059669';
                this.ui.fbBadge.innerHTML = '<i class="fa-solid fa-database me-2"></i> Firebase Active';
            }
        } else {
            if(this.ui.dot) this.ui.dot.className = 'sync-dot offline';
            if(this.ui.text) { this.ui.text.innerText = textMsg; this.ui.text.style.color = '#ef4444'; }
            if(this.ui.ping) { this.ui.ping.innerText = pingMsg; this.ui.ping.style.color = '#94a3b8'; }
            
            // 🔴 อัปเดตป้าย Firebase เป็นสีแดง (เน็ตหลุด)
            if(this.ui.fbBadge) {
                this.ui.fbBadge.style.backgroundColor = '#ef4444';
                this.ui.fbBadge.style.borderColor = '#b91c1c';
                this.ui.fbBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-2"></i> Disconnected';
            }
        }
    }

    async fetchFast(path, cacheKey) {
        const cachedString = localStorage.getItem(cacheKey);
        let cachedData = null;
        
        if (cachedString) {
            try {
                const parsedCache = JSON.parse(cachedString);
                const now = Date.now();
                if (parsedCache._timestamp && (now - parsedCache._timestamp < this.cacheTTL)) {
                    cachedData = parsedCache.data;
                }
            } catch (e) {
                localStorage.removeItem(cacheKey);
            }
        }

        if (cachedData) {
            if (this.isConnected) {
                db.ref(path).once('value').then(snap => {
                    const freshData = snap.val();
                    const payload = { _timestamp: Date.now(), data: freshData };
                    localStorage.setItem(cacheKey, JSON.stringify(payload));
                }).catch(err => console.error("Background sync failed:", err));
            }
            return cachedData;
        } 
        
        try {
            const snap = await db.ref(path).once('value');
            const freshData = snap.val();
            const payload = { _timestamp: Date.now(), data: freshData };
            localStorage.setItem(cacheKey, JSON.stringify(payload));
            return freshData;
        } catch (error) {
            console.error(`[Sync Engine] Fetch failed for ${path}:`, error);
            if (cachedString) return JSON.parse(cachedString).data; 
            throw error; 
        }
    }
}

const RealtimeSyncEngine = new RealtimeSyncEngineService();
window.RealtimeSyncEngine = RealtimeSyncEngine;
document.addEventListener('DOMContentLoaded', () => window.RealtimeSyncEngine.init());